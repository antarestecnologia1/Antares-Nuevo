/**
 * Verificación estática del rol logistica (portal + API + BD).
 * `LOGISTICS_OPERATOR_PERMISSIONS` vive en `modules/core/auth.js`; roles en `config.js`.
 * Ejecutar: node qa/logistics-role.test.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function read(rel) {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

function includesAll(content, needles, area) {
  const missing = needles.filter((n) => !content.includes(n));
  ok(missing.length === 0, `[${area}] Faltan: ${missing.join(", ")}`);
}

function extractLogisticsPermissionsFromAuthJs(authJs) {
  const m = authJs.match(/const LOGISTICS_OPERATOR_PERMISSIONS = Object\.freeze\(\[([\s\S]*?)\]\);/);
  ok(m, "No se encontró LOGISTICS_OPERATOR_PERMISSIONS en modules/core/auth.js");
  const ids = [...m[1].matchAll(/PERMISSIONS\.([A-Z_]+)/g)].map((x) => x[1]);
  ok(ids.length >= 8, "LOGISTICS_OPERATOR_PERMISSIONS debe tener al menos 8 entradas");
  const map = {
    DASHBOARD_VIEW: "dashboard_view",
    TRANSPORT_REQUESTS: "transport_requests",
    AUTHORIZATIONS_TRANSPORT: "authorizations_transport",
    TRANSPORT_TRIPS: "transport_trips",
    TRANSPORT_CALENDAR: "transport_calendar",
    TRANSPORT_VEHICLES: "transport_vehicles",
    TRANSPORT_DRIVERS: "transport_drivers",
    PROFILE_VIEW: "profile_view",
    NOTIFICATIONS_VIEW: "notifications_view"
  };
  return ids.map((k) => map[k] || k.toLowerCase());
}

function extractLogisticsBlockFromApi(apiTs) {
  const m = apiTs.match(/if \(r === "logistica"\) \{([\s\S]*?)\n  \}/);
  ok(m, 'No se encontró defaultPermissionsForApprovedRole("logistica") en portal.service.ts');
  return [...m[1].matchAll(/"([a-z_]+)"/g)].map((x) => x[1]);
}

function run() {
  const authJs = read("modules/core/auth.js");
  const configJs = read("modules/core/config.js");
  const routerJs = read("modules/core/router.js");
  const portalLogisticsSource = `${authJs}\n${configJs}\n${routerJs}`;
  const apiTs = read("apps/api/src/portal/portal.service.ts");
  const dtoTs = read("apps/api/src/portal/dto/approve-pending-user.dto.ts");
  const enumsSql = read("BD/postgres/02_enums.sql");

  includesAll(
    portalLogisticsSource,
    [
      'LOGISTICA: "logistica"',
      "PORTAL_ASSIGNABLE_ROLES",
      'if (role === ROLES.LOGISTICA) return [...LOGISTICS_OPERATOR_PERMISSIONS]',
      'if (r === ROLES.LOGISTICA) return "Logística"',
      "portalRoleSelectOptionsHtml"
    ],
    "portal-logistica-role"
  );

  includesAll(dtoTs, ['"logistica"'], "dto-logistica");
  includesAll(enumsSql, ["'logistica'"], "enum-rol_usuario-incluye-logistica");

  const appPerms = extractLogisticsPermissionsFromAuthJs(authJs);
  const apiPerms = extractLogisticsBlockFromApi(apiTs);
  const appSet = new Set(appPerms);
  const apiSet = new Set(apiPerms);
  ok(appSet.has("transport_requests"), "app: transport_requests");
  ok(appSet.has("authorizations_transport"), "app: authorizations_transport");
  ok(apiSet.has("transport_requests"), "api: transport_requests");
  ok(apiSet.has("authorizations_transport"), "api: authorizations_transport");
  for (const p of appPerms) {
    ok(apiSet.has(p), `API debe incluir permiso de logística: ${p}`);
  }

  console.log("OK logistics-role.test.mjs");
}

run();
