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
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const css = read("styles/unified-cards.css");
const html = read("index.html");
const camiones = read("modules/app/camiones.js");
const conductores = read("modules/app/conductores.js");
const runtime = read("modules/core/portal-runtime.js");
const usuarios = read("modules/app/usuarios-permisos.js");
const kpi = await import(pathToFileURL(path.join(root, "modules/ui/kpi-banners.js")).href);

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
ok(/linear-gradient\(135deg, var\(--uc-navy-a\), var\(--uc-navy-c\)\)/.test(css), "cabecera azul marino en vistas Lista");
ok(/td\.dc-col \+ td/.test(css), "la celda de identidad de las tablas lleva la cabecera azul");

const open = (css.match(/\{/g) || []).length;
const close = (css.match(/\}/g) || []).length;
ok(open === close, `llaves balanceadas (${open}/${close})`);

const normal = html.indexOf('href="./styles/unified-cards.css');
const buttons = html.indexOf('href="./styles/action-buttons.css');
ok(normal > buttons && buttons > 0, "unified-cards.css se enlaza después de action-buttons.css");
ok((html.match(/unified-cards\.css/g) || []).length === 2, "enlace normal y <noscript>");

ok(/data-action="view-vehicle"[^>]*trip-ops-card-btn--solid|trip-ops-card-btn--solid[^>]*data-action="view-vehicle"/.test(camiones) || /ag-btn--primary" data-action="view-vehicle"/.test(camiones), "Ver ficha de camión es el botón principal");
ok(/data-action="delete-vehicle"[^>]*aria-label="Eliminar"/.test(camiones), "acciones de la lista de camiones con aria-label");

// Tarjetas claras (referencia 1): avatar pastel, pie Llamar · lápiz · CTA, ⋮ arriba
ok(css.includes("--uc-avatar-bg:") && /\.ag-avatar\s*\{[^}]*background-color:\s*var\(--uc-avatar-bg\)/.test(css), "avatar pastel con iniciales");
ok(css.includes('content: "Llamar"'), "el teléfono se muestra como botón Llamar");
ok(/\.ag-menu\s*\{[^}]*position:\s*absolute/.test(css), "menú ⋮ en la esquina superior derecha");

// Copia exacta del modelo: paneles con icono, panel de licencia, franja y pie
for (const sel of [".uc-tiles", ".uc-tile", ".uc-tile__ico", ".uc-alert", ".uc-alert--alert", ".uc-alert__pill", ".uc-strip--ok", ".uc-strip--warn", ".uc-strip--alert"]) ok(css.includes(sel), `estilos de ${sel}`);
ok(/body\[data-theme="dark"\]\s*\{[^}]*--uc-ink:/.test(css), "variante oscura de los tokens del modelo");
ok(/function ucTile\(/.test(runtime) && /function ucAlert\(/.test(runtime) && /function ucStrip\(/.test(runtime), "helpers ucTile/ucAlert/ucStrip en el runtime");
ok(/ucTile,\s*ucAlert,\s*ucStrip,/.test(runtime), "los helpers se exponen en window");
ok(conductores.includes("Conductor • ") && conductores.includes("ucTile(") && conductores.includes("ucAlert(") && conductores.includes("renderAgActionMenu("), "tarjeta de conductor: subtítulo, paneles, licencia y menú ⋮");
ok(/class="ag-btn ag-btn--primary" data-action="view-driver"[^>]*><span>Ver ficha<\/span>/.test(conductores), "conductor: botón Ver ficha como acción principal");
ok(runtime.includes('class="uc-tiles"') && runtime.includes("ucStrip({ tone: stripToneUc"), "tarjeta de empleado con paneles y franja de vigencia");
ok(usuarios.includes('class="uc-tiles"') && (usuarios.match(/ucTile\(/g) || []).length >= 6, "tarjetas de usuario y empresa con paneles");
ok(camiones.includes("ucTile(") && camiones.includes("ucStrip(") && camiones.includes('class="ag-btn uc-pill-btn"'), "tarjeta de camión con paneles, franja y botón Editar");
ok(/--ag-photo:url/.test(runtime) && /\.ag-avatar--photo\s*\{[^}]*background-image:\s*var\(--ag-photo\)/.test(css), "la foto de perfil de los empleados se ve dentro del círculo");

// Banners de resumen (KPI)
ok(css.includes(".kpi-banner"), "estilos del banner de resumen");
ok(/\.kpi-banner > \.kpi-tile:is\(\[data-kpi-lead\], \.is-active\)\s*\{[^}]*background:\s*var\(--uc-band\)/.test(css), "primer cuadro (o pestaña activa) del banner en azul marino");
ok(/\.kpi-tile > \.kpi-ico\s*\{[^}]*border-radius:\s*50%/.test(css), "icono circular de color");
ok(/body\[data-theme="dark"\] \.kpi-banner/.test(css), "banner con variante oscura");
const k = (label, i = 0, state = "") => kpi.kpiFor(label, i, state);
ok(k("Disponibles").icon === "check" && k("Disponibles").tone === "green", "Disponibles → check verde");
ok(k("No disponibles").icon === "ban", "No disponibles → ban (no confundir con Disponibles)");
ok(k("Docs riesgo").icon === "alert" && k("Docs riesgo").tone === "red", "Docs riesgo → alerta roja");
ok(k("Por vencer").tone === "amber", "Por vencer → ámbar");
ok(k("Nómina neta").icon === "dollar", "Nómina neta → dólar");
ok(k("Termoking").icon === "snow", "Termoking → copo");
ok(k("Algo raro", 1).icon === "chart" && k("Algo raro", 1).tone === "green", "sin coincidencia: icono genérico y tono por posición");
ok(k("Eventos", 0, "red").tone === "red", "el estado del cuadro manda sobre el tono del diccionario");
for (const name of Object.values(kpi.KPI_RULES).map((r) => r[1])) ok(kpi.KPI_ICONS[name], `existe el icono ${name}`);
for (const sel of [".fleet-hero-metrics", ".ag-fleet__kpis", ".hist-trace-kpis", ".payroll-studio-kpis", ".hiring-studio-kpis", ".doc-kpi-grid", ".sst-status-cards", ".payroll-section-cards", ".ntf-studio-head__metrics"]) ok(kpi.KPI_STRIP_SELECTOR.includes(sel), `cubre la franja ${sel}`);
ok(html.includes("modules/ui/kpi-banners.js") && html.includes("installKpiBanners()"), "index.html instala los banners");

console.log(`unified-cards: ${n} verificaciones OK`);
