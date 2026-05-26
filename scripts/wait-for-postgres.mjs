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

function sanitizeCliError(raw, maxLength = 160) {
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
      console.log(
        `[wait-for-postgres] Intento ${i}/${maxAttempts}: ${sanitizeCliError(e?.message || e)}`
      );
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Postgres no respondió a tiempo. ¿docker compose up -d?");
}

main().catch((err) => {
  console.error(`[wait-for-postgres] ERROR ${sanitizeCliError(err?.message || err)}`);
  process.exit(1);
});
