/**
 * Si Docker está disponible: Postgres limpio, esquema, verify + smoke API.
 * Si no: solo `npm run verify` (builds + tests estáticos).
 */
import { spawnSync } from "node:child_process";

function hasDockerCompose() {
  const r = spawnSync("docker", ["compose", "version"], { encoding: "utf8" });
  return r.status === 0;
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!hasDockerCompose()) {
  console.warn(
    "[verify:stack] Docker Compose no está disponible en PATH. Se ejecuta solo verificación estática (build + QA)."
  );
  run("npm", ["run", "verify"]);
  process.exit(0);
}

run("npm", ["run", "setup"]);
run("npm", ["run", "db:reset"]);
run("npm", ["run", "db:up"]);
run("npm", ["run", "db:ready"]);
run("npm", ["run", "db:init"]);
run("npm", ["run", "verify"]);
run("npm", ["run", "smoke:api"]);
