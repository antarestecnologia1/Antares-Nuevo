/**
 * Espera a que Postgres acepte conexiones (DATABASE_URL en apps/api/.env).
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const require = createRequire(import.meta.url);
const { Pool } = require(path.join(ROOT, "apps", "api", "node_modules", "pg"));

function loadDatabaseUrl() {
  const envPath = path.join(ROOT, "apps", "api", ".env");
  if (!existsSync(envPath)) {
    throw new Error("Falta apps/api/.env. Ejecute: npm run setup");
  }
  const raw = readFileSync(envPath, "utf8");
  const line = raw.split("\n").find((l) => /^\s*DATABASE_URL=/.test(l));
  if (!line) throw new Error("DATABASE_URL no encontrado en apps/api/.env");
  const v = line.replace(/^\s*DATABASE_URL=/, "").trim();
  return v.replace(/^["']|["']$/g, "");
}

async function main() {
  const connectionString = loadDatabaseUrl();
  const maxAttempts = 45;
  for (let i = 1; i <= maxAttempts; i++) {
    const pool = new Pool({ connectionString, max: 1 });
    try {
      await pool.query("SELECT 1");
      await pool.end();
      console.log("[wait-for-postgres] Conexión OK.");
      return;
    } catch (e) {
      await pool.end().catch(() => {});
      console.log(`[wait-for-postgres] Intento ${i}/${maxAttempts}: ${String(e?.message || e)}`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Postgres no respondió a tiempo. ¿docker compose up -d?");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
