/**
 * Aplica el esquema Antares en PostgreSQL.
 *
 * Uso (desde la raíz del repo, con DATABASE_URL en apps/api/.env o entorno):
 *   node apps/api/scripts/apply-schema.mjs              → CREATE 01–08 (Postgres vacío)
 *   node apps/api/scripts/apply-schema.mjs --supabase     → CREATE 01–10 (producción Supabase)
 *   node apps/api/scripts/apply-schema.mjs --migrations   → solo migrations/ (BD existente)
 *   node apps/api/scripts/apply-schema.mjs --supabase --migrations  → CREATE + legacy (raro)
 *
 * --skip-storage  Omite 10_rls_storage_supabase.sql (ejecutar tras crear buckets en el panel).
 * --force         Ejecuta CREATE aunque ya exista la tabla empresas (fallará si hay conflicto).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(__dirname, "..", "..", "..");
const POSTGRES_DIR = path.join(REPO_ROOT, "BD", "postgres");
const MIGRATIONS_DIR = path.join(POSTGRES_DIR, "migrations");

const CREATE_CORE = [
  "01_extensions.sql",
  "02_enums.sql",
  "03_nucleo_empresa_usuarios.sql",
  "04_transporte.sql",
  "05_rrhh.sql",
  "06_sistema.sql",
  "07_indices.sql",
  "08_seed_tarifas_trayecto.sql"
];

const CREATE_SUPABASE = ["09_rls_tablas.sql", "10_rls_storage_supabase.sql"];

const args = new Set(process.argv.slice(2));
const withSupabase = args.has("--supabase");
const withMigrations = args.has("--migrations");
const skipStorage = args.has("--skip-storage");
const force = args.has("--force");
const runCreate = !withMigrations || args.has("--create");
const runMigrations = withMigrations;

function loadEnvFile() {
  const envPath = path.join(API_ROOT, ".env");
  if (!existsSync(envPath)) {
    throw new Error("Falta apps/api/.env — ejecute npm run setup desde la raíz del repo");
  }
  const txt = readFileSync(envPath, "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function poolSsl(connectionString) {
  const u = connectionString.toLowerCase();
  return u.includes("supabase.co") || u.includes(".render.com") || u.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false;
}

function listMigrationFiles() {
  if (!existsSync(MIGRATIONS_DIR)) return [];
  return readdirSync(MIGRATIONS_DIR)
    .filter((n) => n.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}

async function tableExists(pool, name) {
  const r = await pool.query(`SELECT to_regclass($1) IS NOT NULL AS ok`, [`public.${name}`]);
  return Boolean(r.rows[0]?.ok);
}

async function runSqlFile(pool, filePath, label) {
  const sql = readFileSync(filePath, "utf8");
  console.log(`[apply-schema] ${label}`);
  await pool.query(sql);
}

async function main() {
  loadEnvFile();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL vacío");

  const pool = new Pool({
    connectionString,
    max: 1,
    ssl: poolSsl(connectionString)
  });

  try {
    if (runCreate) {
      const hasSchema = await tableExists(pool, "empresas");
      if (hasSchema && !force) {
        console.warn(
          "[apply-schema] La tabla empresas ya existe. CREATE omitido (use --force solo en BD vacía de prueba, o --migrations para actualizar)."
        );
      } else {
        for (const name of CREATE_CORE) {
          const fp = path.join(POSTGRES_DIR, name);
          if (!existsSync(fp)) throw new Error(`No encontrado: ${fp}`);
          await runSqlFile(pool, fp, name);
        }
        if (withSupabase) {
          const supa = skipStorage ? CREATE_SUPABASE.slice(0, 1) : CREATE_SUPABASE;
          for (const name of supa) {
            const fp = path.join(POSTGRES_DIR, name);
            if (!existsSync(fp)) throw new Error(`No encontrado: ${fp}`);
            await runSqlFile(pool, fp, name);
          }
          if (skipStorage) {
            console.warn("[apply-schema] Omitido 10_rls_storage_supabase.sql — créelo tras los buckets.");
          }
        }
      }
    }

    if (runMigrations) {
      const files = listMigrationFiles();
      if (!files.length) {
        console.warn("[apply-schema] No hay archivos en migrations/");
      }
      for (const name of files) {
        await runSqlFile(pool, path.join(MIGRATIONS_DIR, name), `migrations/${name}`);
      }
    }

    const checks = [
      "empresas",
      "usuarios",
      "vehiculos",
      "solicitudes_transporte",
      "liquidaciones_nomina",
      "preferencias_notificacion_usuario",
      "auditoria_viajes_eliminados"
    ];
    const missing = [];
    for (const t of checks) {
      if (!(await tableExists(pool, t))) missing.push(t);
    }
    if (missing.length) {
      console.error(`[apply-schema] Faltan tablas: ${missing.join(", ")}`);
      process.exit(1);
    }
    console.log("[apply-schema] OK — esquema verificado.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
