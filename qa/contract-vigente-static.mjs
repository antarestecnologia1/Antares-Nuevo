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

const portalTs = read("apps/api/src/portal/portal.service.ts");
const tabla = read("BD/postgres/tablas/13_empleados_nomina.sql");
const modalsJs = read("modules/ui/modals.js");
const portalRuntime = read("modules/core/portal-runtime.js");
const gestionHumana = read("modules/app/gestion-humana.js");
const renewalDomain = read("modules/domain/contract-renewal.domain.js");
const sources = [portalTs, tabla, modalsJs, portalRuntime, gestionHumana, renewalDomain];

const needles = [
  "resolveEmployeeContractPlazoStartYmd",
  'name="contractVigenteStartDate"',
  "emp-contract-vigente-start-wrap",
  "fecha_inicio_contrato_vigente",
  "contractVigenteStartDate:",
  "UPSERT_M45",
  "fecha_renovacion",
  "fecha_aviso_no_renovacion",
  "renew-employee-contract",
  "non-renew-employee-contract",
  "executeEmployeeContractRenewal",
  "buildNonRenewalNoticeLetterHtml"
];
for (const n of needles) {
  ok(sources.some((src) => src.includes(n)), `Falta: ${n}`);
}

ok(portalTs.includes("fecha_inicio_contrato_vigente = EXCLUDED.fecha_inicio_contrato_vigente"), "UPSERT actualiza columna vigente");
ok(portalTs.includes("contractVigenteStartDate: this.sqlEmployeeDateToPortalYmd"), "mapEmployeeRow expone campo");
ok(portalTs.includes("nonRenewalNoticeDate: this.sqlEmployeeDateToPortalYmd"), "mapEmployeeRow expone aviso no renovación");
ok(portalTs.includes("renewalDate: this.sqlEmployeeDateToPortalYmd"), "mapEmployeeRow expone renovación");

const m45Placeholders = (portalTs.match(/\$57/g) || []).length;
ok(m45Placeholders >= 1, "UPSERT_M45 usa $57 placeholders");

const baseSlice = portalTs.includes("baseWithVigente = [...base52.slice(0, 23), vigenteStart, ...base52.slice(23)]");
ok(baseSlice, "sync inserta vigenteStart en posición correcta");

ok(tabla.includes("fecha_inicio_contrato_vigente"), "tabla empleados_nomina incluye fecha_inicio_contrato_vigente");
ok(tabla.includes("fecha_renovacion"), "tabla empleados_nomina incluye fecha_renovacion");
ok(tabla.includes("fecha_aviso_no_renovacion"), "tabla empleados_nomina incluye fecha_aviso_no_renovacion");

console.log("contract-vigente-static.mjs: OK");
