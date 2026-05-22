/**
 * Aplica esquema de CREACIÓN BD/postgres/01–08 (omite 09/10 Supabase y migrations/ legacy).
 */import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.join(__dirname, "..");
/** Raíz del monorepo: apps/api/scripts → ../../.. */
const REPO_ROOT = path.join(__dirname, "..", "..", "..");

const FILES = [
  "01_extensions.sql",
  "02_enums.sql",
  "03_nucleo_empresa_usuarios.sql",
  "04_transporte.sql",
  "05_rrhh.sql",
  "06_sistema.sql",
  "07_indices.sql",
  "08_seed_tarifas_trayecto.sql"
];

function loadEnvFile() {
  const envPath = path.join(API_ROOT, ".env");
  if (!existsSync(envPath)) throw new Error("Falta apps/api/.env — ejecute npm run setup");
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

async function main() {
  loadEnvFile();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL vacío");

  const pool = new Pool({
    connectionString,
    max: 1,
    ssl:
      connectionString.toLowerCase().includes("supabase.co") ||
      connectionString.toLowerCase().includes(".render.com")
        ? { rejectUnauthorized: false }
        : false
  });

  const dir = path.join(REPO_ROOT, "BD", "postgres");

  for (const name of FILES) {
    const fp = path.join(dir, name);
    if (!existsSync(fp)) {
      console.warn(`[init-local-schema] Omitido (no existe): ${name}`);
      continue;
    }
    const sql = readFileSync(fp, "utf8");
    console.log(`[init-local-schema] Ejecutando ${name}...`);
    await pool.query(sql);
  }

  await pool.end();
  console.log("[init-local-schema] Esquema CREATE 01–08 aplicado (sin 09/10 Supabase; sin migrations/ legacy).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
