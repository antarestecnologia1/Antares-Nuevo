/**
 * Sesión vencida: el portal debe cerrar la sesión con aviso (no quedar vacío y sin datos), renovar el token
 * al volver a la pestaña y ofrecer «Reintentar» si la carga inicial falla.
 * Ejecutar: node qa/session-expiry-wiring.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const auth = read("modules/core/auth.js");
assert.match(auth, /addEventListener\("antares-session-expired"/, "auth.js escucha la sesión vencida");
assert.match(auth, /export function handleSessionExpiredFromApi/, "cierre ordenado de sesión");
assert.match(auth, /refreshed\?\.status === "invalid"[\s\S]{0,80}handleSessionExpiredFromApi/, "el mantenimiento cierra si el refresh es inválido");
assert.match(auth, /visibilityState === "visible"\) void refreshSessionOnReturn/, "renueva al volver a la pestaña");
assert.match(auth, /api\.refreshSession\(/, "tryApiRefreshBridge usa el refresh único");
assert.doesNotMatch(auth, /fetch\(`\$\{base\}\/api\/auth\/refresh`/, "ya no hay un segundo refresh paralelo en auth.js");
assert.match(auth, /noticeKind === "expired" \? "sessionExpired"/, "aviso propio de sesión vencida");

const msgs = read("modules/core/feedback-messages.js");
assert.match(msgs, /sessionExpired:/, "mensaje de sesión vencida");

const boot = read("modules/core/bootstrap.js");
assert.match(boot, /notifySessionExpired\?\.\("bootstrap-refresh-invalid"\)/, "bootstrap avisa si el refresh es inválido");
assert.match(boot, /function markPortalDataLoadFailed/, "marca falla de carga sin datos");

const rt = read("modules/core/portal-runtime.js");
assert.match(rt, /portalDataLoadFailed/, "el aviso global contempla la falla de carga");
assert.match(rt, /textContent = "Reintentar"/, "botón Reintentar");

const cfg = read("modules/core/config.js");
const m = cfg.match(/SESSION_API_REFRESH_MS = (\d+) \* 60 \* 1000/);
assert.ok(m && Number(m[1]) <= 10, "renovación con margen frente al token de 15 min");

console.log("session-expiry-wiring: OK");
