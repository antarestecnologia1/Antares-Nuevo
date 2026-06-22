/**
 * Verificación: renovación y aviso de no renovación (CST art. 46–47).
 * Ejecutar: node qa/contract-renewal.domain.test.mjs
 */
import assert from "node:assert/strict";
import {
  suggestRenewalPeriodStartYmd,
  validateContractRenewal,
  validateNonRenewalNotice,
  buildNonRenewalNoticeMeta,
  isFixedTermContractType
} from "../modules/domain/contract-renewal.logic.js";

function contractDedupKey(row) {
  const empKey = String(row.employeeId || "").trim().toLowerCase();
  const tpl = String(row.contractTemplateKind || "").trim().toLowerCase();
  const start = String(row.startDate || "").trim();
  const tag = String(row.sourceTag || "").trim().toLowerCase();
  const movement = /renovaci/.test(tag)
    ? "renovacion"
    : /aviso no renov/.test(tag)
      ? "aviso_no_renovacion"
      : "";
  return movement ? `${empKey}::${tpl}::${start}::${movement}` : `${empKey}::${tpl}::${start}`;
}

function ok(cond, msg) {
  assert.ok(cond, msg);
}

ok(isFixedTermContractType("Termino fijo"), "término fijo");
ok(!isFixedTermContractType("Termino indefinido"), "no indefinido");

const emp = {
  contractType: "Termino fijo",
  startDate: "2023-06-01",
  contractVigenteStartDate: "2025-01-01",
  contractEndDate: "2025-12-31",
  contractDuration: "1 año"
};

ok(suggestRenewalPeriodStartYmd(emp) === "2026-01-01", "inicio renovación = día después del fin");

const hireNeverRenewed = {
  contractType: "Termino fijo",
  startDate: "2022-08-18",
  contractDuration: "1 año",
  contractEndDate: "2023-08-18"
};
ok(
  suggestRenewalPeriodStartYmd(hireNeverRenewed) === "2026-08-22",
  "contrato vencido sin renovaciones previas → avanza al período actual"
);

const renewalOk = validateContractRenewal(emp, {
  renewalDate: "2026-01-10",
  contractVigenteStartDate: "2026-01-01",
  contractEndDate: "2026-05-31",
  contractDuration: "5 meses"
});
ok(renewalOk.ok, "renovación válida dentro de 3 años");

const renewalLateStart = validateContractRenewal(emp, {
  renewalDate: "2026-01-10",
  contractVigenteStartDate: "2025-12-31",
  contractEndDate: "2026-05-31"
});
ok(!renewalLateStart.ok, "rechaza inicio antes del fin vigente");

const renewalTooLong = validateContractRenewal(emp, {
  renewalDate: "2026-01-10",
  contractVigenteStartDate: "2026-01-01",
  contractEndDate: "2026-07-01"
});
ok(!renewalTooLong.ok, "rechaza más de 3 años desde ingreso");

const noticeMeta = buildNonRenewalNoticeMeta(emp);
ok(noticeMeta.endYmd === "2025-12-31", "meta fin contrato");
ok(noticeMeta.noticeDeadlineYmd === "2025-12-01", "aviso 30 días antes");

const noticeOk = validateNonRenewalNotice(emp, { noticeDate: "2025-11-15" });
ok(noticeOk.ok && !noticeOk.lateNotice, "aviso a tiempo");

const noticeLate = validateNonRenewalNotice(emp, { noticeDate: "2025-12-15" });
ok(noticeLate.ok && noticeLate.lateNotice, "aviso tardío permitido con flag");

const empNoEnd = {
  contractType: "Termino fijo",
  startDate: "2024-01-01",
  contractVigenteStartDate: "2025-01-01",
  contractDuration: "12 meses"
};
const noticeInferred = validateNonRenewalNotice(
  { ...empNoEnd, contractEndDate: "2025-12-31" },
  { noticeDate: "2025-11-01" }
);
ok(noticeInferred.ok, "aviso con fin inferido desde plazo");

const keyHire = contractDedupKey({
  employeeId: "a",
  contractTemplateKind: "fijo",
  startDate: "2025-01-01",
  sourceTag: "Generado al contratar empleado"
});
const keyRenew = contractDedupKey({
  employeeId: "a",
  contractTemplateKind: "fijo",
  startDate: "2026-01-01",
  sourceTag: "Renovación contrato término fijo"
});
const keyNotice = contractDedupKey({
  employeeId: "a",
  contractTemplateKind: "fijo",
  startDate: "2025-11-15",
  sourceTag: "Aviso no renovación CST art. 47"
});
ok(keyHire !== keyRenew, "contrato inicial ≠ renovación");
ok(keyRenew !== keyNotice, "renovación ≠ aviso");
ok(keyHire !== keyNotice, "inicial ≠ aviso");

console.log("contract-renewal.domain.test.mjs: OK (13 casos)");
