/**
 * Regresión: republicar vacantes (conserva imagen), imagen nunca se borra por omisión en el servidor,
 * login con reintento mientras Render arranca, calentamiento de la API y flota del dashboard.
 * Ejecutar: node qa/vacancy-republish-login-warmup.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const contratacion = read("modules/app/contratacion.js");
assert.match(contratacion, /\[data-action='republish-vacancy'\]/, "handler de republicar");
assert.match(contratacion, /Republicar vacante/, "modal de republicar");
assert.match(contratacion, /imageKeepInput/, "la imagen guardada se conserva al republicar");
assert.match(contratacion, /La imagen anterior ya no está disponible/, "aviso si la imagen guardada ya no existe");

const domain = read("modules/domain/contratacion.domain.js");
assert.match(domain, /data-action="republish-vacancy"/, "botón Republicar en la tarjeta de vacante");
const html = read("modules/app/contratacion-html.js");
assert.match(html, /data-action="republish-vacancy"/, "botón Republicar en el listado de vacantes");
assert.match(html, /Vencida/, "estado Vencida visible");

const svc = read("apps/api/src/portal/portal.service.ts");
assert.match(svc, /imagen_url = COALESCE\(EXCLUDED\.imagen_url, vacantes\.imagen_url\)/, "el servidor no borra la imagen si el cliente no la envía");

const auth = read("modules/core/auth.js");
assert.match(auth, /\[502, 503, 504\]\.includes\(res\.status\)/, "login reintenta mientras el servidor arranca");
assert.match(auth, /El servidor se está activando/, "aviso de arranque en frío");

assert.match(read("index.html"), /antaresPrefetchPublicVacancies/, "el <head> ya despierta la API con la precarga de vacantes");
assert.ok(existsSync(join(root, ".github/workflows/keep-alive.yml")), "workflow de keep-alive");
assert.match(read(".github/workflows/keep-alive.yml"), /\*\/10 \* \* \* \*/, "ping cada 10 minutos");

const dash = read("modules/app/dashboard.js");
assert.doesNotMatch(dash, /at-pill at-pill--\$\{tone\}">\$\{prettyStatus/, "estado sin pill anidado");
assert.match(dash, /Flota en tiempo real · diseño limpio/, "estilos limpios de flota");
assert.match(dash, /at-trip-eta__in/, "celda de entrega sin display:flex en el td");

console.log("vacancy-republish-login-warmup: OK");
