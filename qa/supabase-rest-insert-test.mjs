/**
 * Prueba de inserción vía PostgREST (misma API que usa el cliente Supabase).
 * Lee SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY desde apps/api/.env
 *
 * Uso: node qa/supabase-rest-insert-test.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", "apps", "api", ".env");

function loadEnvFile(path) {
  if (!existsSync(path)) {
    console.error("No existe:", path);
    return;
  }
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(envPath);

const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function main() {
  if (!url || !key) {
    console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en apps/api/.env");
    process.exit(1);
  }

  const nit = `QA-${Date.now()}`;
  const body = {
    nombre: "Antares — prueba automatizada QA",
    nit,
    telefono: "3000000000"
  };

  const insertUrl = `${url}/rest/v1/empresas`;
  const res = await fetch(insertUrl, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("INSERT falló:", res.status, text);
    process.exit(1);
  }

  let rows;
  try {
    rows = JSON.parse(text);
  } catch {
    console.error("Respuesta no JSON:", text);
    process.exit(1);
  }

  const row = Array.isArray(rows) ? rows[0] : rows;
  const id = row?.id;
  console.log("INSERT OK en public.empresas id=", id, "nit=", nit);

  if (id) {
    const delUrl = `${url}/rest/v1/empresas?id=eq.${id}`;
    const del = await fetch(delUrl, {
      method: "DELETE",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });
    if (!del.ok) {
      console.warn("No se pudo borrar fila de prueba:", del.status, await del.text());
      process.exit(0);
    }
    console.log("DELETE OK (fila de prueba eliminada).");
  }

  console.log("Prueba completada: inserción y borrado correctos.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
