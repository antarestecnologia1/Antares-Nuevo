/**
 * Crea `apps/api/.env` si no existe (Postgres local Docker + JWT aleatorios).
 * No depende de archivos .example.
 */
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, "apps", "api", ".env");

function secret() {
  return randomBytes(48).toString("hex");
}

const LOCAL_TEMPLATE = `DATABASE_URL=postgresql://antares:antares_dev_local@127.0.0.1:5432/antares
JWT_ACCESS_SECRET={{JWT_A}}
JWT_REFRESH_SECRET={{JWT_R}}
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://127.0.0.1:3000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_AUTH_REQUIRE_EMAIL_CONFIRMATION=false
RESEND_API_KEY=
MAIL_FROM=Transportes Antares <antarestecnologia1@gmail.com>
PORT=4000
`;

function main() {
  const force = process.argv.includes("--force");
  mkdirSync(path.dirname(ENV_PATH), { recursive: true });

  if (existsSync(ENV_PATH) && !force) {
    console.log("[ensure-dev-env] apps/api/.env ya existe; no se sobrescribe. Use --force para regenerar.");
    return;
  }

  if (force && existsSync(ENV_PATH)) {
    console.log("[ensure-dev-env] --force: regenerando apps/api/.env");
  }

  const jwtA = secret();
  const jwtR = secret();
  const out = LOCAL_TEMPLATE.replace("{{JWT_A}}", jwtA).replace("{{JWT_R}}", jwtR);

  writeFileSync(ENV_PATH, out.trim() + "\n", "utf8");
  console.log("[ensure-dev-env] Creado apps/api/.env (Docker local + JWT).");
}

main();
