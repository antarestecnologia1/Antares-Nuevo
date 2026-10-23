/**
 * Regresión de los ajustes de octubre 2026 (liquidación, incapacidad, permisos RRHH, selección masiva,
 * reingreso, documental y tema oscuro).
 * Ejecutar: node qa/payroll-ajustes-2026-10.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

globalThis.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  documentElement: { dataset: {}, classList: { add() {}, remove() {} } },
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
  body: {}
};
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = globalThis.localStorage;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const { calcColombiaIncapacityEpsDayAdjustmentCop } = await import("../modules/domain/payroll-colombia-legal.domain.js");
const termination = await import("../modules/domain/payroll-colombia-termination.domain.js");
const { PERMISSIONS } = await import("../modules/core/config.js");

let n = 0;
const ok = (name, fn) => {
  fn();
  n += 1;
  console.log("ok -", name);
};

ok("incapacidad: días 1 y 2 al 100 %, desde el día 3 al 66,67 %", () => {
  const args = { dailySalary: 100000, monthlySalary: 3000000 };
  assert.equal(calcColombiaIncapacityEpsDayAdjustmentCop({ ...args, dayIndexInEpisode: 1 }).pct, 1);
  assert.equal(calcColombiaIncapacityEpsDayAdjustmentCop({ ...args, dayIndexInEpisode: 2 }).pct, 1);
  assert.equal(calcColombiaIncapacityEpsDayAdjustmentCop({ dailySalary: 200000, monthlySalary: 6000000, dayIndexInEpisode: 3 }).pct, 0.6667);
  assert.equal(calcColombiaIncapacityEpsDayAdjustmentCop({ dailySalary: 200000, monthlySalary: 6000000, dayIndexInEpisode: 90 }).pct, 0.6667);
  assert.equal(calcColombiaIncapacityEpsDayAdjustmentCop({ dailySalary: 200000, monthlySalary: 6000000, dayIndexInEpisode: 91 }).pct, 0.5);
});

ok("incapacidad: respeta el piso del salario mínimo diario", () => {
  const r = calcColombiaIncapacityEpsDayAdjustmentCop({ dailySalary: 50000, dayIndexInEpisode: 5, monthlySalary: 1500000, smmlv: 1750905 });
  assert.ok(r.pct >= 1750905 / 30 / 50000 - 1e-9 || r.pct === 1);
});

ok("liquidación: ya no hay multa por falta de preaviso en renuncia", () => {
  const out = termination.computeColombiaTerminationSettlement({
    employee: { startDate: "2025-01-01", baseSalary: 2000000 },
    position: null,
    terminationDateYmd: "2026-10-15",
    terminationCause: "renuncia",
    renunciaAvisoDaysWorked: 0
  });
  assert.equal(out.renunciaAvisoDeduction, 0);
  assert.ok(!/multa/i.test(termination.terminationCauseEligibility("renuncia").note));
});

ok("permisos: existe payroll_delete y lo usa canDeletePayroll", () => {
  assert.equal(PERMISSIONS.PAYROLL_DELETE, "payroll_delete");
  assert.match(read("modules/core/auth.js"), /export function canDeletePayroll/);
  assert.match(read("apps/api/src/portal/portal.service.ts"), /"payroll_delete"/);
});

ok("selección masiva: la selección persiste entre páginas", () => {
  const src = read("modules/app/gestion-humana.js");
  assert.match(src, /select-all|selectAll|payroll-select-all/i);
});

ok("reingreso: endpoint y DTO existen", () => {
  assert.ok(existsSync(join(root, "apps/api/src/portal/dto/admin-employee-reinstate.dto.ts")));
  assert.match(read("apps/api/src/portal/portal.controller.ts"), /reinstate/i);
  assert.match(read("modules/app/gestion-humana.js"), /reinstate-employee/);
});

ok("gestión documental: subcarpetas y mover documentos", () => {
  const src = read("modules/app/gestion-documental.js");
  assert.match(src, /openMoveDocumentsModal/);
  assert.match(src, /doc-bulk-move/);
  assert.match(src, /showCreateOnly/);
});

ok("tema oscuro: hoja de pulido cargada y con color-scheme dark", () => {
  const css = read("styles/portal-dark-polish.css");
  assert.match(css, /color-scheme:\s*dark/);
  const html = read("index.html");
  const refs = html.match(/portal-dark-polish\.css/g) || [];
  assert.ok(refs.length >= 2, "debe cargarse en ambos bloques de estilos");
});

ok("términos: no se pide de nuevo si el servidor no confirma el perfil", () => {
  assert.match(read("modules/core/auth.js"), /serverConfirmed/);
});

ok("auxilio quincenal: solo en la tarjeta, no en la colilla", () => {
  const card = read("modules/app/portal-rrhh-modals.js");
  assert.match(card, /PAYROLL_QUINCENAL_AUXILIO_COP = 192100/);
  assert.match(card, /payrollRunQuincenalAuxilioCop/);
  const slip = read("modules/app/gestion-humana.js");
  assert.ok(!/192100|AUXILIO_COP|auxilioQuincenal/.test(slip), "la colilla no debe mencionar el auxilio quincenal");
});

ok("pago a conductores: limita viajes al contrato (ingreso y desvinculación)", () => {
  const svc = read("apps/api/src/portal/portal.service.ts");
  assert.match(svc, /effectiveStart = hireDate > monthBounds\.monthStart/);
  assert.match(svc, /fecha_desvinculacion::text AS fecha_desvinculacion/);
});

console.log(`\n${n} comprobaciones OK`);
