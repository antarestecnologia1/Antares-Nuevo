/**
 * Permisos por acción de los módulos (config.js · PERMISSION_MODULES).
 *  1) Catálogo coherente: cada permiso existe, tiene título/descripción, está en un único grupo de la pantalla y
 *     cabe en la columna de la base de datos (64 caracteres).
 *  2) Compatibilidad: los permisos completos históricos conservan EXACTAMENTE lo que ya permitían.
 *  3) Granularidad: «solo consulta» no modifica nada y un permiso por acción solo habilita esa acción.
 *  4) Reglas del gate: cada regla apunta a un módulo y una acción reales.
 *  5) Cableado: exportaciones, módulos y compuerta conectados en el portal.
 *  6) Servidor: el catálogo de la API es idéntico al del portal y las colecciones lo aplican.
 * Ejecutar: node qa/permission-granularity.test.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALL_PERMISSIONS,
  PERMISSION_META,
  PERMISSION_MODULES,
  PERMISSION_UI_GROUPS,
  PERMISSIONS
} from "../modules/core/config.js";
import { permissionAllows, permissionModuleKeys } from "../modules/core/permission-model.js";
import {
  PERMISSION_ACTION_RULES,
  PERMISSION_FORM_RULES,
  PERMISSION_ID_RULES
} from "../modules/core/permission-rules.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const can = (keys, moduleId, action = "view") => {
  const set = new Set(keys);
  return permissionAllows((k) => set.has(k), moduleId, action);
};
const actionsOf = (moduleId) => Object.keys(PERMISSION_MODULES[moduleId].actions);

/* ---------- 1) Catálogo ---------- */
const catalogKeys = new Set(Object.keys(PERMISSION_MODULES).flatMap((m) => permissionModuleKeys(m)));
const permissionValues = new Set(Object.values(PERMISSIONS));
for (const key of catalogKeys) {
  assert.ok(permissionValues.has(key), `«${key}» no está declarado en PERMISSIONS`);
  assert.ok(ALL_PERMISSIONS.includes(key), `«${key}» no está en ALL_PERMISSIONS`);
  assert.ok(key.length <= 64, `«${key}» supera los 64 caracteres de la columna permisos_usuario`);
  const meta = PERMISSION_META[key];
  assert.ok(meta?.title && meta?.desc, `«${key}» no tiene título y descripción para la pantalla de permisos`);
}
for (const [moduleId, mod] of Object.entries(PERMISSION_MODULES)) {
  assert.ok(mod.label, `${moduleId}: falta la etiqueta`);
  for (const ex of mod.fullExcludes || []) {
    assert.ok(mod.actions[ex], `${moduleId}: fullExcludes menciona «${ex}», que no es una acción del módulo`);
  }
  for (const [action, keys] of Object.entries(mod.alsoFrom || {})) {
    assert.ok(mod.actions[action], `${moduleId}: alsoFrom menciona «${action}», que no es una acción del módulo`);
    keys.forEach((k) => assert.ok(permissionValues.has(k), `${moduleId}.${action}: «${k}» no existe`));
  }
}
const grouped = PERMISSION_UI_GROUPS.flatMap((g) => g.permissions || g.keys || []);
assert.equal(new Set(grouped).size, grouped.length, "un permiso aparece en más de un grupo de la pantalla");
for (const key of ALL_PERMISSIONS) assert.ok(grouped.includes(key), `«${key}» no aparece en ningún grupo de la pantalla`);
assert.equal(grouped.length, ALL_PERMISSIONS.length);
assert.equal(new Set(ALL_PERMISSIONS).size, ALL_PERMISSIONS.length, "ALL_PERMISSIONS tiene llaves repetidas");

/* ---------- 2) Compatibilidad: lo histórico sigue igual ---------- */
const only = (moduleId, allowed) => {
  const expected = new Set(allowed);
  return actionsOf(moduleId).filter((a) => expected.has(a));
};
const legacy = [
  // [permiso completo histórico, módulo, acciones que permitía]
  ["transport_requests", "requests", ["create", "export"]],
  ["transport_trips", "trips", ["assign", "status", "edit", "export"]],
  ["transport_drivers", "drivers", []],
  ["transport_vehicles", "vehicles", actionsOf("vehicles")],
  ["transport_history", "history", ["export"]],
  ["transport_history", "reports", ["export"]],
  ["payroll_manage", "payroll", ["employees", "runs", "pay", "absences", "documents", "export"]],
  ["hiring_manage", "hiring", ["vacancies", "candidates", "contracts", "export"]],
  ["sst_compliance", "sst", actionsOf("sst")]
];
for (const [key, moduleId, allowed] of legacy) {
  assert.ok(can([key], moduleId, "view"), `${key} debe seguir abriendo ${moduleId}`);
  for (const action of actionsOf(moduleId)) {
    assert.equal(
      can([key], moduleId, action),
      allowed.includes(action),
      `${key} → ${moduleId}.${action}: debe ser ${allowed.includes(action)}`
    );
  }
}
// Las acciones reservadas al administrador no se regalan con el permiso completo.
for (const [moduleId, action] of [
  ["requests", "edit"], ["requests", "cancel"], ["requests", "delete"],
  ["trips", "delete"], ["trips", "rates"],
  ["drivers", "edit"], ["drivers", "status"],
  ["payroll", "delete"], ["hiring", "delete"]
]) {
  const full = PERMISSION_MODULES[moduleId].full;
  assert.equal(can([full], moduleId, action), false, `${full} no debe permitir ${moduleId}.${action}`);
}
// Permisos de otros módulos que ya permitían operar solicitudes.
for (const key of ["authorizations_transport", "authorizations_manage", "transport_trips"]) {
  assert.ok(can([key], "requests", "edit"), `${key} sigue permitiendo editar solicitudes`);
  assert.ok(can([key], "requests", "cancel"), `${key} sigue permitiendo cancelar solicitudes`);
}
assert.ok(can(["client_requests"], "requests", "create"), "el cliente sigue creando solicitudes");
assert.ok(can(["client_requests"], "requests", "export"), "el cliente puede exportar sus solicitudes");
assert.equal(can(["client_requests"], "requests", "edit"), false);
// Consulta que ya existía.
assert.ok(can(["transport_calendar"], "calendar", "view"));
assert.ok(can(["contact_b2b_view"], "contact", "view"));
assert.ok(can(["transport_vehicles_view"], "vehicles", "view"));
assert.ok(can(["transport_vehicles_edit"], "vehicles", "edit"));
assert.equal(can([], "payroll", "view"), false, "sin permisos no se abre ningún módulo");

/* ---------- 3) Granularidad ---------- */
for (const [moduleId, mod] of Object.entries(PERMISSION_MODULES)) {
  if (mod.view) {
    assert.ok(can([mod.view], moduleId, "view"), `${mod.view} debe abrir ${moduleId}`);
    for (const action of actionsOf(moduleId)) {
      assert.equal(can([mod.view], moduleId, action), false, `${mod.view} (solo consulta) no debe permitir ${moduleId}.${action}`);
    }
  }
  for (const [action, key] of Object.entries(mod.actions)) {
    assert.ok(can([key], moduleId, "view"), `${key} también abre el módulo ${moduleId}`);
    assert.ok(can([key], moduleId, action), `${key} debe permitir ${moduleId}.${action}`);
    for (const other of actionsOf(moduleId).filter((a) => a !== action)) {
      assert.equal(can([key], moduleId, other), false, `${key} no debe permitir ${moduleId}.${other}`);
    }
  }
}
// Un permiso de un módulo no abre otro.
assert.equal(can(["payroll_view"], "hiring", "view"), false);
assert.equal(can(["transport_trips_view"], "history", "view"), false);
assert.equal(can(["transport_reports_view"], "history", "view"), false);
assert.ok(can(["transport_history_export"], "history", "export"));
assert.equal(can(["transport_history_export"], "reports", "export"), false, "exportar historial no exporta reportes");

/* ---------- 4) Reglas de la compuerta ---------- */
const checkAlternatives = (label, alternatives) => {
  assert.ok(Array.isArray(alternatives) && alternatives.length > 0, `${label}: sin alternativas`);
  for (const [moduleId, action] of alternatives) {
    assert.ok(PERMISSION_MODULES[moduleId], `${label}: módulo «${moduleId}» inexistente`);
    assert.ok(PERMISSION_MODULES[moduleId].actions[action], `${label}: acción «${moduleId}.${action}» inexistente`);
  }
};
Object.entries(PERMISSION_ACTION_RULES).forEach(([name, alts]) => checkAlternatives(`acción ${name}`, alts));
Object.entries(PERMISSION_ID_RULES).forEach(([name, alts]) => checkAlternatives(`botón #${name}`, alts));
Object.entries(PERMISSION_FORM_RULES).forEach(([name, cfg]) => checkAlternatives(`formulario #${name}`, cfg.rule));
// Toda acción de módulo se aplica en alguna regla, en la exportación del módulo o en los permisos de camiones.
const ruled = new Set();
const mark = (alts) => alts.forEach(([m, a]) => ruled.add(`${m}.${a}`));
Object.values(PERMISSION_ACTION_RULES).forEach(mark);
Object.values(PERMISSION_ID_RULES).forEach(mark);
Object.values(PERMISSION_FORM_RULES).forEach((f) => mark(f.rule));
const exportWiring = {
  requests: "modules/app/solicitudes-html.js",
  trips: "modules/app/viajes.js",
  drivers: "modules/app/conductores.js",
  vehicles: "modules/app/camiones.js",
  calendar: "modules/app/calendario.js",
  hiring: "modules/app/contratacion-html.js",
  contact: "modules/app/contacto-b2b.js"
};
for (const [moduleId, mod] of Object.entries(PERMISSION_MODULES)) {
  for (const action of Object.keys(mod.actions)) {
    if (ruled.has(`${moduleId}.${action}`)) continue;
    if (action === "export" && exportWiring[moduleId]) {
      assert.ok(
        read(exportWiring[moduleId]).includes(`canDo(undefined, "${moduleId}", "export")`),
        `${moduleId}.export: la exportación de ${exportWiring[moduleId]} no consulta el permiso`
      );
      continue;
    }
    assert.equal(moduleId, "vehicles", `${moduleId}.${action} no se aplica en ninguna regla ni pantalla`);
  }
}

/* ---------- 5) Cableado en el portal ---------- */
const indexHtml = read("index.html");
assert.ok(/permission-gate\.js/.test(indexHtml), "index.html no carga la compuerta de permisos");
assert.ok(/installPermissionGate\(\)/.test(indexHtml), "index.html no instala la compuerta");
assert.ok(/mountPermissionGate\(view\)|mountPermissionGate/.test(read("modules/core/router.js")), "el router no monta la compuerta tras cada render");
assert.ok(read("scripts/gen-ops-clean-modules.py").includes("[data-perm-denied]"), "falta la regla CSS que oculta lo no permitido");
assert.ok(read("modules/ui/components.js").includes("canOperateHrWorkspace"), "la pestaña Registrar no respeta el permiso");
const reportsGate = read("modules/core/events.js");
assert.ok(/canDo\(actor, "reports", "export"\)/.test(reportsGate), "descargar reportes debe exigir reports.export");
// Ya no deben quedar guardas «solo administrador» en las acciones que ahora tienen permiso propio.
const hiring = read("modules/app/contratacion.js");
for (const action of ["delete-position", "delete-candidate", "delete-interview", "delete-contract", "delete-vacancy"]) {
  const at = hiring.indexOf(`[data-action='${action}']`);
  assert.ok(at > 0, `no se encontró ${action}`);
  const chunk = hiring.slice(at, at + 400);
  assert.ok(chunk.includes('abortUnlessCan("hiring", "delete")'), `${action} debe exigir hiring.delete`);
  assert.ok(!chunk.includes("abortIfNotAdmin()"), `${action} sigue siendo solo administrador`);
}
const trips = read("modules/app/viajes.js");
assert.ok(trips.includes('abortUnlessCan("trips", "delete")') && trips.includes('abortUnlessCan("trips", "rates")'));

/* ---------- 6) Servidor ---------- */
const serverCatalogPath = "apps/api/src/portal/portal-permissions.ts";
if (existsSync(join(root, serverCatalogPath))) {
  const ts = read(serverCatalogPath);
  const start = ts.indexOf("PORTAL_PERMISSION_MODULES: Record<string, PortalPermissionModule> = {");
  assert.ok(start > 0, "no se encontró el catálogo del servidor");
  const bodyStart = ts.indexOf("{", start + 60);
  const bodyEnd = ts.indexOf("\n};", bodyStart);
  const serverCatalog = new Function(`return ${ts.slice(bodyStart, bodyEnd + 2)}`)();
  const normalize = (mods) =>
    Object.fromEntries(
      Object.entries(mods).map(([id, m]) => [
        id,
        {
          full: m.full || null,
          view: m.view || null,
          fullExcludes: [...(m.fullExcludes || [])].sort(),
          alsoFrom: Object.fromEntries(Object.entries(m.alsoFrom || {}).map(([a, ks]) => [a, [...ks].sort()])),
          actions: { ...m.actions }
        }
      ])
    );
  assert.deepEqual(normalize(serverCatalog), normalize(PERMISSION_MODULES), "el catálogo de permisos de la API difiere del portal");
  const service = read("apps/api/src/portal/portal.service.ts");
  assert.ok(service.includes("PORTAL_MODULE_PERMISSION_KEYS"), "la API no incluye los permisos por acción en el catálogo permitido");
  for (const snippet of [
    'portalCanWrite(permissionSet, "payroll", ["employees", "documents"])',
    'portalCanWrite(permissionSet, "payroll", ["runs", "pay"])',
    'portalCanWrite(permissionSet, "payroll", ["absences"])',
    'portalCanWrite(permissionSet, "sst", ["edit", "renew", "delete"])',
    'portalCanWrite(permissionSet, "trips", ["rates"])',
    'portalCanWrite(permissionSet, "drivers", ["edit", "status"])',
    'portalCanView(permissionSet, "payroll")',
    'portalCanView(permissionSet, "hiring")'
  ]) {
    assert.ok(service.includes(snippet), `la API no aplica: ${snippet}`);
  }
  // Ninguna colección de escritura depende ya solo del permiso completo histórico.
  assert.ok(!/can\("(payroll_manage|hiring_manage|sst_compliance|transport_drivers|transport_trips)"\)/.test(service),
    "queda una colección que exige solo el permiso completo histórico");
}

console.log("permission-granularity: OK");
