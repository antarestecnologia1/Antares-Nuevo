/**
 * Genera `apps/api/.env` si no existe, con secretos JWT aleatorios y DATABASE_URL alineado con docker-compose.yml.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, "apps", "api", ".env");
const EXAMPLE_PATH = path.join(ROOT, "apps", "api", ".env.example");

function secret() {
  return randomBytes(48).toString("hex");
}

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

  let template = "";
  if (existsSync(EXAMPLE_PATH)) {
    template = readFileSync(EXAMPLE_PATH, "utf8");
  }

  const jwtA = secret();
  const jwtR = secret();

  const replacements = {
    DATABASE_URL: "postgresql://antares:antares_dev_local@127.0.0.1:5432/antares",
    JWT_ACCESS_SECRET: jwtA,
    JWT_REFRESH_SECRET: jwtR,
    JWT_ACCESS_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "7d",
    CORS_ORIGINS: "",
    PORT: "4000",
    SUPABASE_URL: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    SUPABASE_AUTH_REQUIRE_EMAIL_CONFIRMATION: "false"
  };

  let out = template;
  for (const [k, v] of Object.entries(replacements)) {
    const re = new RegExp(`^${k}=.*$`, "m");
    if (re.test(out)) {
      out = out.replace(re, `${k}=${v}`);
    } else {
      out += `\n${k}=${v}`;
    }
  }

  if (!/^DATABASE_URL=/m.test(out)) {
    out = `DATABASE_URL=${replacements.DATABASE_URL}\n` + out;
  }
  if (!/^JWT_ACCESS_SECRET=/m.test(out)) {
    out += `\nJWT_ACCESS_SECRET=${jwtA}`;
  }
  if (!/^JWT_REFRESH_SECRET=/m.test(out)) {
    out += `\nJWT_REFRESH_SECRET=${jwtR}`;
  }

  writeFileSync(ENV_PATH, out.trim() + "\n", "utf8");
  console.log("[ensure-dev-env] Creado apps/api/.env (JWT y DATABASE_URL locales).");
}

main();
