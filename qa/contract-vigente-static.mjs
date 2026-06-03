/**
 * Verificación estática de integración (sin BD).
 * node qa/contract-vigente-static.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (rel) => readFileSync(path.join(ROOT, rel), "utf8");

function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

const appJs = read("app.js");
const portalTs = read("apps/api/src/portal/portal.service.ts");
const tabla = read("BD/postgres/tablas/13_empleados_nomina.sql");

const needles = [
  "resolveEmployeeContractPlazoStartYmd",
  'name="contractVigenteStartDate"',
  "emp-contract-vigente-start-wrap",
  "fecha_inicio_contrato_vigente",
  "contractVigenteStartDate:",
  "UPSERT_M45"
];
for (const n of needles) {
  ok(appJs.includes(n) || portalTs.includes(n) || tabla.includes(n), `Falta: ${n}`);
}

ok(portalTs.includes("fecha_inicio_contrato_vigente = EXCLUDED.fecha_inicio_contrato_vigente"), "UPSERT actualiza columna");
ok(portalTs.includes("contractVigenteStartDate: this.sqlEmployeeDateToPortalYmd"), "mapEmployeeRow expone campo");

const m45Placeholders = (portalTs.match(/\$57/g) || []).length;
ok(m45Placeholders >= 1, "UPSERT_M45 usa $57 placeholders");

const baseSlice = portalTs.includes("baseWithVigente = [...base52.slice(0, 23), vigenteStart, ...base52.slice(23)]");
ok(baseSlice, "sync inserta vigenteStart en posición correcta");

ok(tabla.includes("fecha_inicio_contrato_vigente"), "tabla empleados_nomina incluye fecha_inicio_contrato_vigente");

console.log("contract-vigente-static.mjs: OK");
