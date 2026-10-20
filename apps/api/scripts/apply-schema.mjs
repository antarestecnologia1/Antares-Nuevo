/**
 * Aplica el esquema Antares en PostgreSQL.
 *
 * Uso (desde la raíz del repo, con DATABASE_URL en apps/api/.env o entorno):
 *   node apps/api/scripts/apply-schema.mjs              → CREATE (01, 02, 30 tablas, 08)
 *   node apps/api/scripts/apply-schema.mjs --supabase     → + RLS (09 / 09_enable / 41–42) + 10 storage
 *   node apps/api/scripts/apply-schema.mjs --migrations   → ejecuta *.sql en migrations/ (vacío: solo verifica tablas)
 *
 * --skip-storage  Omite 10_rls_storage_supabase.sql (ejecutar tras crear buckets).
 * --force         Ejecuta CREATE aunque ya exista empresas (solo BD vacía de prueba).
 *
 * Con BD ya existente, --supabase sigue aplicando scripts RLS idempotentes
 * (alerta Supabase "Table publicly accessible" / RLS deshabilitado).
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

/** RLS en BD vacía (políticas completas). No re-ejecutar si ya existen (CREATE POLICY falla). */
const CREATE_SUPABASE_FRESH = ["09_rls_tablas.sql", "10_rls_storage_supabase.sql"];
/** RLS en BD existente: solo ENABLE + políticas idempotentes (DROP IF EXISTS). */
const CREATE_SUPABASE_EXISTING = [
  "09_rls_enable_all.sql",
  path.join("tablas", "41_rls_documentos_empleado.sql"),
  path.join("tablas", "41_rls_documentos_empresa.sql"),
  path.join("tablas", "42_rls_sarlaft_pte.sql"),
  "10_rls_storage_supabase.sql"
];

const args = new Set(process.argv.slice(2));
const withSupabase = args.has("--supabase");
const withMigrations = args.has("--migrations");
const skipStorage = args.has("--skip-storage");
const force = args.has("--force");
const runCreate = !withMigrations || args.has("--create");
const runMigrations = withMigrations;

function sanitizeCliError(raw, maxLength = 180) {
  const text = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "sin detalle";
  const clean = text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[jwt]")
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[database-url]")
    .replace(/https?:\/\/\S+/gi, "[url]");
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}…` : clean;
}

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
    const hasSchema = await tableExists(pool, "empresas");

    if (runCreate) {
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
      }
    }

    if (withSupabase) {
      const plan = hasSchema && !force ? CREATE_SUPABASE_EXISTING : CREATE_SUPABASE_FRESH;
      const filtered = skipStorage
        ? plan.filter((n) => !String(n).replace(/\\/g, "/").endsWith("10_rls_storage_supabase.sql"))
        : plan;
      for (const name of filtered) {
        const rel = String(name).replace(/\\/g, "/");
        try {
          await runSqlFile(pool, path.join(POSTGRES_DIR, name), rel);
        } catch (err) {
          const msg = sanitizeCliError(err instanceof Error ? err.message : err);
          // ENABLE es crítico; políticas 41/42 pueden fallar si falta la tabla o auth.*.
          if (rel.includes("09_rls_enable_all") || rel.includes("09_rls_tablas")) throw err;
          console.warn(`[apply-schema] Aviso ${rel}: ${msg}`);
        }
      }
      if (skipStorage) {
        console.warn("[apply-schema] Omitido 10_rls_storage — créelo tras los buckets.");
      }
    }

    if (runMigrations) {
      const migFiles = listMigrationFiles();
      if (!migFiles.length) {
        console.warn(
          "[apply-schema] migrations/ sin archivos .sql — esquema canónico en tablas/; autocura en API al arrancar."
        );
      } else {
        for (const name of migFiles) {
          await runSqlFile(pool, path.join(MIGRATIONS_DIR, name), `migrations/${name}`);
        }
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
  console.error(`[apply-schema] ERROR ${sanitizeCliError(err instanceof Error ? err.message : err)}`);
  process.exit(1);
});
