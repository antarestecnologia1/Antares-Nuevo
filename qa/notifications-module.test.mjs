/**
 * Regresión del módulo de notificaciones (bandeja, poll, API).
 * Ejecutar: node qa/notifications-module.test.mjs
 */
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function read(rel) {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

const domain = read("modules/domain/notificaciones.domain.js");
const app = read("modules/app/notificaciones.js");
const bootstrap = read("modules/core/bootstrap.js");
const service = read("apps/api/src/portal/portal.service.ts");
const schema = read("BD/postgres/tablas/22_notificaciones.sql");
const estadoSql = read("BD/postgres/tablas/46_notificaciones_estado_usuario.sql");

assert.match(domain, /typeof window\.notify === "function"/, "el poll debe usar window.notify (módulo ES)");
assert.doesNotMatch(
  domain,
  /if \(typeof notify === "function"\)/,
  "no debe quedar typeof notify suelto en el dominio (siempre undefined en ES modules)"
);

assert.match(domain, /collectStaleNotificationIdsForToastSuppress/, "helper de toasts obsoletos en bootstrap");
assert.match(bootstrap, /collectStaleNotificationIdsForToastSuppress/, "bootstrap no marca como vistas las notificaciones frescas");

assert.match(
  domain,
  /__applyNotificationPrefsOptimistic\(\{ notificacionesHabilitadas: on \}\)/,
  "la campana lateral no debe apagar el timbre al silenciar avisos"
);
assert.doesNotMatch(
  domain,
  /sonidoNotificacionesHabilitadas:\s*on/,
  "setNotificationsEnabled no debe acoplar el flag de sonido"
);

assert.match(domain, /write\(KEYS\.notifications, snapshot/, "mark-read debe revertir RAM si el API falla");
assert.match(app, /ntf-card--interactive/, "la tarjeta debe ser clicable para marcar leída / abrir");
assert.match(app, /activateNotificationCard/, "click en tarjeta reutiliza la misma activación que Abrir");

assert.doesNotMatch(service, /COALESCE\(eliminado/, "GET notificaciones no debe filtrar columna eliminado (no existe)");
assert.match(service, /notificaciones_estado_usuario/, "lectura/ocultar por usuario en avisos de audiencia");
assert.match(service, /expandVisibleNotificationIds/, "mark-read/delete expanden duplicados visibles");
assert.match(service, /e\.fecha_lectura/, "GET usa lectura por usuario en avisos compartidos");
assert.match(service, /COALESCE\(e\.oculto, false\) = false/, "GET oculta avisos compartidos por usuario");
assert.match(domain, /state\.currentView === "notifications".*renderPortalView/s, "campana lateral re-pinta la bandeja");
assert.match(schema, /CREATE TABLE notificaciones/, "esquema canónico de bandeja");
assert.match(estadoSql, /CREATE TABLE IF NOT EXISTS notificaciones_estado_usuario/, "tabla de estado por usuario");

for (const rel of [
  "modules/domain/notificaciones.domain.js",
  "modules/app/notificaciones.js",
  "modules/portal/views/notificaciones.js",
  "modules/notifications/index.js"
]) {
  execSync(`node --check "${path.join(ROOT, rel)}"`, { stdio: "pipe" });
}

console.log("notifications-module.test.mjs: ok");
