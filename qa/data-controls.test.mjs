/**
 * Selección y exportación común a los módulos (modules/ui/data-controls.js).
 *  1) Formato del CSV: «;», comillas, BOM, saltos CRLF y protección contra fórmulas de Excel.
 *  2) Fechas en horario de Colombia.
 *  3) Cableado: cada módulo con información registra su colección y el router monta los controles.
 *  4) Lo que se exporta no incluye contraseñas ni tokens.
 * Ejecutar: node qa/data-controls.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCsv, csvCell, fmtDate, fmtDateTime, plainText } from "../modules/ui/data-controls.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/* ---------- 1) CSV ---------- */
assert.equal(csvCell("Hola"), '"Hola"');
assert.equal(csvCell(null), '""');
assert.equal(csvCell(undefined), '""');
assert.equal(csvCell(0), '"0"', "el cero es un valor, no un vacío");
assert.equal(csvCell('dijo "sí"'), '"dijo ""sí"""', "las comillas se duplican");
assert.equal(csvCell("línea 1\nlínea 2"), '"línea 1 línea 2"', "un salto de línea no parte la fila");
assert.equal(csvCell("a;b"), '"a;b"', "el separador dentro de una celda queda entre comillas");
// Una celda que empieza como fórmula no debe ejecutarse al abrir el archivo en Excel.
assert.equal(csvCell("=1+1"), `"'=1+1"`);
assert.equal(csvCell("@SUMA(A1)"), `"'@SUMA(A1)"`);
assert.equal(csvCell("-cmd"), `"'-cmd"`);
assert.equal(csvCell("+cmd"), `"'+cmd"`);
// Los números negativos y las fechas con guion son datos normales.
assert.equal(csvCell("-5"), '"-5"');
assert.equal(csvCell("2026-11-25"), '"2026-11-25"');

const csv = buildCsv(
  [
    { label: "Nombre", get: (r) => r.name },
    { label: "Nota", get: (r) => r.note }
  ],
  [
    { name: "Ana", note: "ok" },
    { name: "Luis", note: "=HYPERLINK(\"http://x\")" }
  ]
);
assert.equal(csv.charCodeAt(0), 0xfeff, "BOM UTF-8 para que Excel lea bien las tildes");
const lines = csv.slice(1).split("\r\n");
assert.equal(lines[0], '"Nombre";"Nota"');
assert.equal(lines[1], '"Ana";"ok"');
assert.ok(lines[2].startsWith('"Luis";"\'=HYPERLINK('), "la fórmula queda neutralizada");
assert.equal(lines[3], "", "termina con salto de línea");

/* ---------- 2) Fechas en horario de Colombia ---------- */
assert.equal(fmtDateTime("2026-11-29T08:00:00Z"), "2026-11-29 03:00");
assert.equal(fmtDateTime("2026-11-30T02:30:00Z"), "2026-11-29 21:30", "después de las 7 p. m. el día de Colombia aún es el anterior al de UTC");
assert.equal(fmtDate("2026-11-29T03:30:00Z"), "2026-11-28");
assert.equal(fmtDate("2026-11-29"), "2026-11-29");
assert.equal(fmtDateTime(""), "");
assert.equal(fmtDateTime(null), "");
assert.equal(plainText('<span class="x">Viaje &amp; <b>asignado</b></span>'), "Viaje & asignado");

/* ---------- 3) Cableado ---------- */
const router = read("modules/core/router.js");
assert.match(router, /callApp\("mountDataControls",\s*view\)/, "el router monta los controles tras dibujar cada vista");
const index = read("index.html");
assert.match(index, /modules\/ui\/data-controls\.js/, "index.html carga el componente");
assert.match(index, /mountDataControls/, "mountDataControls queda disponible para el router");
// El componente debe cargarse antes que los módulos que lo registran.
const posToolkit = index.indexOf("modules/ui/data-controls.js");
for (const mod of ["camiones.js", "conductores.js", "viajes.js", "solicitudes-html.js", "usuarios-permisos.js", "autorizaciones.js", "contacto-b2b.js", "contratacion-html.js", "calendario.js"]) {
  const at = index.indexOf(`modules/app/${mod}`);
  assert.ok(at > posToolkit, `${mod} se carga después de data-controls.js`);
}

const registrations = [
  ["modules/app/camiones.js", "transport-vehicles", ["fleet"]],
  ["modules/app/conductores.js", "transport-drivers", ["fleet"]],
  ["modules/app/viajes.js", "transport-trips", ["trips"]],
  ["modules/app/solicitudes-html.js", "requests", ["requests"]],
  ["modules/app/usuarios-permisos.js", "admin-users", ["users", "pending", "companies"]],
  ["modules/app/autorizaciones.js", "authorizations", ["queue"]],
  ["modules/app/contacto-b2b.js", "contact-leads", ["leads"]],
  ["modules/app/contratacion-html.js", "hiring", ["candidates", "vacancies", "interviews", "contracts", "positions"]],
  ["modules/app/notificaciones.js", "notifications", ["inbox"]],
  ["modules/app/calendario.js", "transport-calendar", ["events"]]
];
for (const [file, view, ids] of registrations) {
  const src = read(file);
  assert.match(src, /AntaresDataControls\??\.register|dc\(\)\?\.register/, `${file} registra su colección`);
  assert.ok(src.includes(`view: "${view}"`), `${file} usa la vista «${view}»`);
  for (const id of ids) assert.ok(src.includes(`id: "${id}"`), `${file} registra la colección «${id}»`);
}

// Las tarjetas y filas seleccionables llevan el identificador que usa el componente.
assert.match(read("modules/app/contacto-b2b.js"), /data-lead-id=/);
assert.match(read("modules/app/contratacion-html.js"), /data-hiring-id=/);
assert.match(read("modules/app/usuarios-permisos.js"), /data-dir-kind=/);

/* ---------- 4) Nada sensible en lo exportado ---------- */
const users = read("modules/app/usuarios-permisos.js");
const start = users.indexOf("registerAdminUsersDataControls");
const end = users.indexOf("function adminUsersHtml");
const exportedBlock = users.slice(start, end);
assert.ok(exportedBlock.length > 200, "se encontró el bloque de exportación de usuarios");
assert.doesNotMatch(exportedBlock, /password|passwordHash|token|secret|twoFactorSecret/i, "usuarios no exporta credenciales");

/* ---------- 5) Filtros del mismo tamaño ---------- */
const gen = read("scripts/gen-ops-clean-modules.py");
assert.match(gen, /--oc-filter-h:\s*2\.5rem/);
assert.match(gen, /--oc-filter-w:\s*12\.5rem/);
assert.match(gen, /\.rq-sortbox select/, "el selector «Ordenar» usa el mismo tamaño");
const css = read("styles/ops-clean-modules.css");
assert.match(css, /--oc-filter-h:\s*2\.5rem/, "el CSS generado está al día con el generador");

console.log("data-controls: OK");
