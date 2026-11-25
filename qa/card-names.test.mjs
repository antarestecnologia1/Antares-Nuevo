/**
 * Nombres principales de tarjeta (modules/ui/card-names.js): los nombres guardados en
 * MAYÚSCULAS se muestran como nombre propio; lo ya bien escrito, las siglas y las
 * empresas no se tocan.
 * Ejecutar: node qa/card-names.test.mjs
 */
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { formatPersonName, CARD_NAME_SELECTOR } = await import(pathToFileURL(path.join(root, "modules/ui/card-names.js")).href);

let n = 0;
const eq = (input, expected) => {
  assert.equal(formatPersonName(input), expected, `«${input}» → «${formatPersonName(input)}», se esperaba «${expected}»`);
  n++;
};

eq("LAURA CASTAÑEDA", "Laura Castañeda");
eq("JUAN CARLOS DE LA CRUZ", "Juan Carlos de la Cruz");
eq("MARÍA-JOSÉ O’BRIEN", "María-José O’Brien");
eq("LUIS ÁNGEL PÉREZ III", "Luis Ángel Pérez III");
eq("JOSÉ", "José");
eq("DE LA ROSA", "De la Rosa"); // la primera palabra siempre lleva mayúscula
eq("ÑANDÚ PÉREZ", "Ñandú Pérez");
// Lo que ya está bien escrito no cambia
eq("Pedro Gómez", "Pedro Gómez");
eq("juan perez", "juan perez");
eq("Empleado Prueba 1", "Empleado Prueba 1");
eq("María de los Ángeles", "María de los Ángeles");
// Siglas y textos cortos no se tocan
eq("ANA", "ANA");
eq("DHL", "DHL");
eq("", "");
eq(null, "");
eq("1000100", "1000100");
// Sufijos societarios y siglas con puntos se conservan
eq("TRANSPORTES ANTARES S.A.S.", "Transportes Antares S.A.S.");

// Solo personas: las tarjetas de empresa no se normalizan
assert.ok(CARD_NAME_SELECTOR.includes(".directory-card--user .adm-badge__name"), "los usuarios sí");
assert.ok(!/(^|, )\.adm-badge__name/.test(CARD_NAME_SELECTOR), "las empresas (adm-badge__name suelto) no");
for (const sel of [".ag-pass__name", ".hr-cred__name", ".hiring-kanban-card__name", ".hiring-candidate-card__titles > h4"]) {
  assert.ok(CARD_NAME_SELECTOR.includes(sel), `falta ${sel}`);
  n++;
}

console.log(`card-names: OK (${n} comprobaciones)`);
