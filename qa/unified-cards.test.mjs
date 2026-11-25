/**
 * Tarjetas unificadas (styles/unified-cards.css).
 * Sin navegador: valida que la hoja exista, use la capa `antares-cards`, defina los
 * tokens `--uc-*` (claro y oscuro), cubra todas las familias de tarjetas y listas
 * (conductores, camiones, empleados, usuarios/empresas, contratación, documentos, SST)
 * y que index.html la enlace después de action-buttons.css.
 * Ejecutar: node qa/unified-cards.test.mjs
 */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const css = read("styles/unified-cards.css");
const html = read("index.html");
const camiones = read("modules/app/camiones.js");

let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n += 1; };

ok(/@layer\s+antares-buttons\s*,\s*antares-cards\s*;/.test(css), "declara el orden de capas");
ok(/@layer\s+antares-cards\s*\{/.test(css), "usa la capa antares-cards");
for (const token of ["--uc-navy-a", "--uc-navy-b", "--uc-navy-c", "--uc-radius", "--uc-radius-sm", "--uc-panel", "--uc-chip", "--uc-card-shadow"]) {
  ok(css.includes(`${token}:`), `define el token ${token}`);
}
ok(/body\[data-theme="dark"\]\s*\{[^}]*--uc-panel/.test(css), "variantes de tema oscuro de los tokens");
ok(/body\[data-theme="dark"\] :is\([^)]*\.ag-pass/.test(css), "superficie oscura para tarjetas");

const families = [".ag-pass", ".hr-cred", ".adm-badge", ".ag-roster-card", ".portal-ops-card", ".hiring-kanban-card", ".doc-subfolder-card", "table.ag-table", "table.vehicle-fleet-table", "table.sst-consult-table"];
for (const f of families) ok(css.includes(f), `cubre la familia ${f}`);

ok(/@media \(max-width: 720px\)/.test(css), "reglas móviles para filas apiladas");
ok(css.includes("--uc-band:"), "define la banda azul marino de cabecera (--uc-band)");
ok(/\.ag-pass__head\s*\{[^}]*background:\s*var\(--uc-band\)/.test(css), "cabecera de conductor con banda azul");
ok(/\.hr-cred__band[^{]*\{[^}]*background:\s*var\(--uc-band\)/.test(css), "cabecera de empleado/usuario con banda azul");
ok(/\.portal-ops-card > header\s*\{[^}]*background:\s*var\(--uc-band\)/.test(css), "cabecera de tarjeta operativa con banda azul");
ok(/linear-gradient\(135deg, var\(--uc-navy-a\), var\(--uc-navy-c\)\)/.test(css), "cabecera azul marino en vistas Lista");
ok(/td\.dc-col \+ td/.test(css), "la celda de identidad de las tablas lleva la cabecera azul");

const open = (css.match(/\{/g) || []).length;
const close = (css.match(/\}/g) || []).length;
ok(open === close, `llaves balanceadas (${open}/${close})`);

const normal = html.indexOf('href="./styles/unified-cards.css');
const buttons = html.indexOf('href="./styles/action-buttons.css');
ok(normal > buttons && buttons > 0, "unified-cards.css se enlaza después de action-buttons.css");
ok((html.match(/unified-cards\.css/g) || []).length === 2, "enlace normal y <noscript>");

ok(/data-action="view-vehicle"[^>]*trip-ops-card-btn--solid|trip-ops-card-btn--solid[^>]*data-action="view-vehicle"/.test(camiones), "Ver detalles de camión es el botón principal");
ok(/data-action="delete-vehicle"[^>]*aria-label="Eliminar"/.test(camiones), "acciones de la lista de camiones con aria-label");

console.log(`unified-cards: ${n} verificaciones OK`);
