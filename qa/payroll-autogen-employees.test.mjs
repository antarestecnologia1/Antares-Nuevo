/**
 * Nómina automática: solo empleados laborales activos, en día de cierre.
 * Editar la ficha no debe abrir una liquidación nueva.
 * Ejecutar: node qa/payroll-autogen-employees.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  liquidationCutIfClosingToday,
  liquidationLatestClosedCutAsOf
} from "../modules/domain/payroll-cut.domain.js";

function employeeIsConductorServiceProvider(employee) {
  const role = String(employee.workerRole || "").trim().toLowerCase();
  const ct = String(employee.contractType || "").trim().toLowerCase();
  const tpl = String(employee.contractTemplateKind || employee.contractTemplate || "").trim().toLowerCase();
  const isServiceContract = /prestaci[oó]n\s*de\s*servicios|prestacion.*servicio/i.test(ct);
  if (role === "conductor" && isServiceContract) return true;
  if (!role.includes("conductor") && isServiceContract) return true;
  if (tpl === "prestacion" || tpl.includes("prestacion")) return true;
  return false;
}
function employeeReceivesPayrollNomina(employee) {
  return !employeeIsConductorServiceProvider(employee);
}
function isPayrollEmployeeUnlinked(employee) {
  const activeRaw = employee.active ?? employee.activo;
  if (activeRaw === false || String(activeRaw ?? "").toLowerCase() === "false") return true;
  const status = String(employee.status || "").trim().toLowerCase();
  return /desvincul|retirad|inactiv/.test(status);
}
function payrollIsAllowedPayFrequency(raw) {
  const s = String(raw || "").trim().toLowerCase();
  return s.includes("mensual") || s.includes("quincen");
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const portalSrc = readFileSync(join(root, "apps/api/src/portal/portal.service.ts"), "utf8");
const autoSrc = readFileSync(join(root, "apps/api/src/payroll/payroll-automation.service.ts"), "utf8");
const kindSrc = readFileSync(join(root, "apps/api/src/payroll/payroll-employee-kind.ts"), "utf8");
const nominaSrc = readFileSync(join(root, "modules/domain/nomina.domain.js"), "utf8");

function ok(cond, msg) {
  assert.ok(cond, msg);
}

const oficina = {
  workerRole: "empleado",
  contractType: "Termino indefinido"
};
const conductorEmpleado = {
  workerRole: "conductor",
  contractType: "Termino fijo"
};
const prestacion = {
  workerRole: "conductor",
  contractType: "Prestacion de servicios"
};
const prestacionOficina = {
  workerRole: "empleado",
  contractType: "Prestacion de servicios"
};
const plantillaPrestacion = {
  workerRole: "conductor",
  contractType: "Termino indefinido",
  contractTemplateKind: "prestacion"
};

ok(employeeReceivesPayrollNomina(oficina), "Oficina indefinido entra a nómina laboral");
ok(employeeReceivesPayrollNomina(conductorEmpleado), "Conductor con contrato laboral entra a nómina");
ok(!employeeReceivesPayrollNomina(prestacion), "Prestación de servicios (conductor) no entra a nómina");
ok(!employeeReceivesPayrollNomina(prestacionOficina), "Prestación de servicios (oficina) no entra a nómina");
ok(
  employeeIsConductorServiceProvider(plantillaPrestacion),
  "Plantilla prestación excluye de nómina aunque el tipo de contrato no lo diga"
);
ok(!employeeReceivesPayrollNomina(plantillaPrestacion), "Plantilla prestación no recibe nómina automática");

ok(payrollIsAllowedPayFrequency("Mensual"), "Mensual se autogenera");
ok(payrollIsAllowedPayFrequency("Quincenal"), "Quincenal se autogenera");
ok(!payrollIsAllowedPayFrequency("Semanal"), "Semanal no entra al cron");
ok(!payrollIsAllowedPayFrequency("Catorcenal"), "Catorcenal no entra al cron");

ok(!isPayrollEmployeeUnlinked({ active: true }), "Activo no está desvinculado");
ok(isPayrollEmployeeUnlinked({ active: false }), "activo=false es desvinculado");
ok(isPayrollEmployeeUnlinked({ status: "desvinculado" }), "status desvinculado");

const q1 = liquidationCutIfClosingToday("quincenal", 2026, 9, 15);
ok(q1 && q1.periodKey === "2026-10-Q1", `15 oct cierra Q1, no otro corte (${q1 && q1.periodKey})`);
ok(!liquidationCutIfClosingToday("quincenal", 2026, 9, 13), "13 oct no es cierre quincenal: no debe nacer nómina");
ok(!liquidationCutIfClosingToday("mensual", 2026, 9, 15), "15 oct no cierra mensual");
ok(liquidationCutIfClosingToday("mensual", 2026, 9, 31)?.periodKey === "2026-10", "31 oct cierra mensual");

ok(
  !liquidationLatestClosedCutAsOf("quincenal", 2026, 9, 13),
  "Antes del 15 no hay corte cerrado en el mes: editar ficha no debe inventar Q1"
);
ok(
  liquidationLatestClosedCutAsOf("quincenal", 2026, 9, 16)?.periodKey === "2026-10-Q1",
  "El 16 ya hay Q1 cerrado (solo cron/masiva o refresh con fechas)"
);

ok(autoSrc.includes("0 7 * * *"), "Cron diario 07:00 Bogotá");
ok(autoSrc.includes("PAYROLL_AUTOGENERATE_DISABLED"), "Se puede apagar la autogeneración");
ok(autoSrc.includes("generateAutomaticLiquidacionesForReferenceDate"), "Cron usa el motor por fecha Bogotá");

ok(
  /createMissing\s*=\s*opts\?\.createMissing\s*\?\?\s*Boolean\(range\?\.startDate\)/.test(portalSrc),
  "createMissing se aplica: sin rango no abre nómina nueva"
);
ok(
  portalSrc.includes("if (cuts.length === 0 && createMissing)"),
  "Sin borradores pendientes no se cae al último corte cerrado salvo createMissing"
);
ok(
  portalSrc.includes("if (!ex && !createMissing)"),
  "No inserta liquidación si el corte no existe y createMissing es false"
);
ok(
  portalSrc.includes("{ createMissing: false }"),
  "El sync de colaboradores pide explícitamente no crear nómina"
);
ok(
  portalSrc.includes("WHERE COALESCE(activo, true) = true"),
  "El cron no recorre desvinculados"
);
ok(
  /employeeReceivesPayrollNomina\(\{[\s\S]*tipo_plantilla_contrato/.test(portalSrc),
  "Autogen respeta plantilla de prestación"
);
ok(kindSrc.includes("tipo_plantilla_contrato"), "API alinea exclusión de prestación con el dominio");
ok(nominaSrc.includes("export function employeeReceivesPayrollNomina"), "Dominio portal excluye prestación");
ok(nominaSrc.includes("export function isPayrollEmployeeUnlinked"), "Dominio portal reconoce desvinculados");

console.log("OK payroll-autogen-employees: solo empleados laborales, en cierre, sin alta al editar ficha.");
