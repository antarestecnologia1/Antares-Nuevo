/**
 * Navegación de fichas y modales apilados (atrás / misma ventana).
 * node qa/modal-navigation-static.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (rel) => readFileSync(path.join(ROOT, rel), "utf8");

function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

const modals = read("modules/ui/modals.js");
const components = read("modules/ui/components.js");
const humana = read("modules/app/gestion-humana.js");
const humanaHtml = read("modules/app/gestion-humana-html.js");
const nomina = read("modules/domain/nomina.domain.js");
const historial = read("modules/app/historial.js");
const runtime = read("modules/core/portal-runtime.js");
const styles = read("styles.css");

ok(modals.includes("function beginModalFlow"), "flujo de modales apilados");
ok(modals.includes("export function goBackModal"), "goBackModal exportado");
ok(modals.includes("export function closeCrudModal"), "closeCrudModal exportado");
ok(components.includes("export function renderModalBackBtn"), "botón Atrás del encabezado");
ok(modals.includes("showBack: Boolean(flow.showBack)"), "info modal respeta Atrás");
ok(modals.includes("renderModalHead(title, { subtitle, showBack: Boolean(flow.showBack) })"), "edit modal respeta Atrás");

ok(humana.includes("function openEmployeeProfileModal"), "ficha extraída para reabrir");
ok(humana.includes("employee-profile-tab"), "pestañas Ficha / Liquidaciones");
ok(humana.includes('data-tab="liquidaciones"'), "pestaña de liquidaciones");
ok(!/liquidacionesAction[\s\S]{0,80}payroll-focus-employee-runs/.test(humana), "Ver liquidaciones ya no saca de la ficha");
ok(humana.includes('data-from-profile="1"'), "salida a nómina marca origen ficha");
ok(humana.includes("payroll-return-to-profile"), "retorno a la ficha desde nómina");
ok(humanaHtml.includes("Volver a la ficha"), "banner de nómina con volver");

ok(nomina.includes('variant === "full"'), "historial completo en la ficha");
ok(nomina.includes('data-action="employee-profile-tab"'), "compacto cambia de pestaña, no de módulo");
ok(nomina.includes("Más detalles en nómina"), "detalle de nómina es opt-in");

ok(!/hist-audit-linked-detail[\s\S]{0,220}crud-modal/.test(historial), "historial no cierra antes del detalle vinculado");
ok(!/data-vehicle-sheet-action='edit'[\s\S]{0,220}crud-modal/.test(runtime), "editar vehículo conserva el detalle para volver");

ok(styles.includes(".employee-profile-tabs"), "estilos de pestañas de ficha");
ok(styles.includes(".modal-head__back"), "estilos del botón Atrás");

console.log("modal-navigation-static.mjs: OK");
