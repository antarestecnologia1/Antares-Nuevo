/**
 * Arranca la API compilada, comprueba POST /api/auth/login → 401, detiene el proceso.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const API_DIR = path.join(ROOT, "apps", "api");

async function waitForLoginEndpoint(ms = 60000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const res = await fetch("http://127.0.0.1:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: "smoke@test.invalid", password: "wrong" })
      });
      if (res.status === 401 || res.status === 400) return;
    } catch {
      // servidor aún no listo
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("La API no respondió en el puerto 4000.");
}

function main() {
  const proc = spawn(process.execPath, ["dist/main.js"], {
    cwd: API_DIR,
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  proc.stderr?.on("data", (c) => {
    stderr += String(c);
  });

  const kill = () => {
    try {
      proc.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  };

  const timeout = setTimeout(() => {
    kill();
  }, 90000);

  waitForLoginEndpoint()
    .then(async () => {
      const res = await fetch("http://127.0.0.1:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: "smoke@test.invalid", password: "wrong" })
      });
      clearTimeout(timeout);
      kill();
      if (res.status !== 401 && res.status !== 400) {
        throw new Error(`Esperado 400 o 401 en login inválido, recibido ${res.status}`);
      }
      console.log(`[smoke-api] POST /api/auth/login → ${res.status} OK.`);
      process.exit(0);
    })
    .catch((err) => {
      clearTimeout(timeout);
      kill();
      console.error("[smoke-api] Fallo:", err.message);
      if (stderr) console.error(stderr.slice(-2000));
      process.exit(1);
    });

  proc.on("error", (e) => {
    clearTimeout(timeout);
    console.error("[smoke-api] No se pudo arrancar la API:", e);
    process.exit(1);
  });

  proc.on("exit", (code, sig) => {
    if (code && code !== 0 && sig !== "SIGTERM") {
      clearTimeout(timeout);
      console.error("[smoke-api] API terminó con código", code);
      if (stderr) console.error(stderr.slice(-2000));
    }
  });
}

main();
