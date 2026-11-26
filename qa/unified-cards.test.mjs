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

// Lista de conductores: tarjeta ancha con cabecera azul marino y datos reales
ok(conductores.includes('class="ag-lrow-list"') && conductores.includes("ag-lrow ag-lrow--"), "la vista Lista de conductores usa tarjetas anchas");
ok(!conductores.includes('class="ag-table driver-fleet-table"'), "la tabla antigua de conductores ya no se genera");
for (const piece of ["ag-lrow__head", "ag-lrow__name", "ag-lrow__status", "ag-lrow__lic", "ag-lrow__due", "ag-lrow__chips", "ag-lrow__phone", "Licencia ${escapeHtml(licenseCategory)}", "Sin comparendos", "EPS/ARL"]) ok(conductores.includes(piece), `lista de conductores: ${piece}`);
ok(/data-action="view-driver" data-id="\$\{escapeAttr\(id\)\}"><span>Ver ficha<\/span>/.test(conductores), "lista: botón Ver ficha");
ok(/\.ag-lrow-list\s*\{/.test(css) && /\.ag-lrow__head\s*\{/.test(css) && /@container \(max-width: 470px\)/.test(css), "estilos de la lista de conductores (rejilla, cabecera y contenedor angosto)");
ok(/body\[data-theme="dark"\] \.ag-lrow\s*\{/.test(css), "lista de conductores con variante oscura");
ok(conductores.includes('.ag-lrow[data-driver-id]') && conductores.includes('.ag-pass__head, .ag-lrow__head'), "selección y exportación enganchadas a la lista de conductores");

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

// Banner de Conductores: título + conteo y cuatro indicadores con etiqueta, valor y detalle en ese orden
ok(conductores.includes('class="ag-fleet__count"') && conductores.includes("ag-fleet__head--drivers"), "banner de conductores con conteo propio");
ok(!conductores.includes("ag-kpi--ring") && conductores.includes('kpi("Disponibles"') && conductores.includes("% de la flota"), "Disponibles como indicador estándar con porcentaje en el detalle");
ok(/\.ag-fleet__kpis\.kpi-banner > \.kpi-tile > span\.ag-kpi__sub[^{]*\{[^}]*order:\s*3/.test(css), "el detalle del indicador va después del valor");
ok(/\.ag-fleet__kpis\.kpi-banner > \.kpi-tile\s*\{[^}]*padding:\s*0\.9rem 4\.6rem/.test(css), "el indicador reserva espacio para la silueta (sin texto encima)");
ok(/\.ag-fleet__head\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(0, 41rem\)/.test(css) && /@media \(max-width: 1280px\)/.test(css), "banner: indicadores a la derecha y apilados en pantallas medianas");
ok(kpi.kpiFor("Riesgo documental", 2, "green").tone === "green", "el estado correcto manda sobre el tono del diccionario");

// Banner de Conductores delgado (sin nota de ayuda; indicadores 4 en fila o 2×2 según su ancho)
ok(!conductores.includes("Alta, baja y ficha completa en Gestión humana") && !conductores.includes("moduleHint"), "el banner de conductores ya no lleva la nota de ayuda");
ok(conductores.includes('class="ag-fleet__kpis-wrap"'), "indicadores dentro de su contenedor");
ok(/\.ag-fleet__kpis-wrap\s*\{[^}]*container-type:\s*inline-size/.test(css) && /@container \(max-width: 55\.99rem\)/.test(css), "los indicadores pasan de 4 en fila a 2×2 según el ancho del contenedor");
ok(/\.ag-fleet__head:is\(\.ag-fleet__head--drivers, \.ag-fleet__head--users\)\s*\{[^}]*padding:\s*0\.8rem 1\.1rem/.test(css), "cabecera delgada (conductores y usuarios)");

// Banner de Contratación: etiqueta + conmutador arriba, indicadores en una fila
ok(/\.hiring-studio > \.hr-workspace-header--hiring\s*\{[^}]*grid-template-areas:\s*"brand switch"/.test(css), "Contratación: etiqueta y conmutador en la misma fila");
ok(/\.hiring-studio-head\s*\{[^}]*display:\s*contents/.test(css), "Contratación: la cabecera interna reparte sus piezas en la rejilla");
ok(/\.hiring-studio-kpis\.kpi-banner\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fit, minmax\(max\(10\.5rem, 18\.5%\), 1fr\)\)/.test(css), "Contratación: indicadores repartidos a todo el ancho");
ok(/@media \(max-width: 900px\)\s*\{[^}]*hiring-studio-kpis/.test(css) || /grid-template-areas:\s*"brand" "switch" "kpis"/.test(css), "Contratación: en pantallas angostas se apila");

// Banner de Usuarios y permisos: sin nota de ayuda, mismo diseño delgado que Conductores
ok(usuarios.includes("ag-fleet__head--users") && usuarios.includes('class="ag-fleet__kpis-wrap"'), "banner de usuarios con cabecera delgada e indicadores en su contenedor");
ok(!usuarios.includes("Altas, roles y módulos visibles. La ficha guarda el perfil"), "el banner de usuarios ya no lleva la nota de ayuda");
ok(/\.ag-fleet__head--users \.users-hero-actions\s*\{[^}]*display:\s*flex/.test(css) && /min-width:\s*min\(100%, 56rem\)/.test(css), "usuarios: botones de acción a la izquierda e indicadores a todo el ancho disponible");

console.log(`unified-cards: ${n} verificaciones OK`);
