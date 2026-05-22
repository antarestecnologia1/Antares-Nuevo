/**
 * Aplica el esquema Antares en PostgreSQL.
 *
 * Uso (desde la raíz del repo, con DATABASE_URL en apps/api/.env o entorno):
 *   node apps/api/scripts/apply-schema.mjs              → CREATE (01, 02, 30 tablas, 08)
 *   node apps/api/scripts/apply-schema.mjs --supabase     → + 09 RLS tablas, 10 RLS storage
 *   node apps/api/scripts/apply-schema.mjs --migrations   → solo migrations/ (BD existente)
 *
 * --skip-storage  Omite 10_rls_storage_supabase.sql (ejecutar tras crear buckets).
 * --force         Ejecuta CREATE aunque ya exista empresas (solo BD vacía de prueba).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(__dirname, "..", "..", "..");
const POSTGRES_DIR = path.join(REPO_ROOT, "BD", "postgres");
const TABLAS_DIR = path.join(POSTGRES_DIR, "tablas");
const MIGRATIONS_DIR = path.join(POSTGRES_DIR, "migrations");

const CREATE_SUPABASE = ["09_rls_tablas.sql", "10_rls_storage_supabase.sql"];

const args = new Set(process.argv.slice(2));
const withSupabase = args.has("--supabase");
const withMigrations = args.has("--migrations");
const skipStorage = args.has("--skip-storage");
const force = args.has("--force");
const runCreate = !withMigrations || args.has("--create");
const runMigrations = withMigrations;

function loadTableScripts() {
  const ordenPath = path.join(TABLAS_DIR, "orden_ejecucion.txt");
  if (!existsSync(ordenPath)) {
    throw new Error("Falta BD/postgres/tablas/orden_ejecucion.txt");
  }
  return readFileSync(ordenPath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

function buildCreatePlan() {
  const plan = ["01_extensions.sql", "02_enums.sql"];
  for (const f of loadTableScripts()) {
    plan.push(path.join("tablas", f));
  }
  plan.push("08_seed_tarifas_trayecto.sql");
  return plan;
}

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
          "[apply-schema] La tabla empresas ya existe. CREATE omitido (use --migrations o autocura API al arrancar)."
        );
      } else {
        for (const rel of buildCreatePlan()) {
          const fp = path.join(POSTGRES_DIR, rel);
          if (!existsSync(fp)) throw new Error(`No encontrado: ${fp}`);
          await runSqlFile(pool, fp, rel.replace(/\\/g, "/"));
        }
        if (withSupabase) {
          const supa = skipStorage ? CREATE_SUPABASE.slice(0, 1) : CREATE_SUPABASE;
          for (const name of supa) {
            await runSqlFile(pool, path.join(POSTGRES_DIR, name), name);
          }
          if (skipStorage) {
            console.warn("[apply-schema] Omitido 10_rls_storage — créelo tras los buckets.");
          }
        }
      }
    }

    if (runMigrations) {
      for (const name of listMigrationFiles()) {
        await runSqlFile(pool, path.join(MIGRATIONS_DIR, name), `migrations/${name}`);
      }
    }

    const expectedTables = loadTableScripts()
      .filter((f) => f.endsWith(".sql") && !f.includes("funciones"))
      .map((f) => f.replace(/^\d+_/, "").replace(/\.sql$/, ""));
    const missing = [];
    for (const t of expectedTables) {
      if (!(await tableExists(pool, t))) missing.push(t);
    }
    if (missing.length) {
      console.error(`[apply-schema] Faltan tablas (${missing.length}): ${missing.join(", ")}`);
      process.exit(1);
    }
    console.log(`[apply-schema] OK — ${expectedTables.length} tablas verificadas.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
