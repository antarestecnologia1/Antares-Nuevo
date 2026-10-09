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
import { colombiaTodayIsoDate } from "../modules/core/utils.js";

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

ok(suggestRenewalPeriodStartYmd(emp) === "2026-01-01", "contrato ya vencido → inicio = día siguiente al fin");

const empVenceHoyOFuturo = {
  ...emp,
  contractEndDate: "2099-12-31"
};
ok(
  suggestRenewalPeriodStartYmd(empVenceHoyOFuturo) === "2099-12-31",
  "inicio renovación = mismo día del vencimiento si aún no pasó"
);

const hireNeverRenewed = {
  contractType: "Termino fijo",
  startDate: "2022-08-18",
  contractDuration: "1 año",
  contractEndDate: "2023-08-18"
};
const laggedStart = suggestRenewalPeriodStartYmd(hireNeverRenewed);
const todayYmd = colombiaTodayIsoDate();
ok(laggedStart >= todayYmd, "contrato vencido sin renovaciones previas → avanza al período actual");
ok(laggedStart > hireNeverRenewed.contractEndDate, "el período sugerido queda después del fin original");

const renewalOk = validateContractRenewal(emp, {
  renewalDate: "2026-01-10",
  contractVigenteStartDate: "2026-01-01",
  contractEndDate: "2026-05-31",
  contractDuration: "5 meses"
});
ok(renewalOk.ok, "renovación válida dentro de 3 años");

const renewalSameDay = validateContractRenewal(emp, {
  renewalDate: "2025-12-31",
  contractVigenteStartDate: "2025-12-31",
  contractEndDate: "2026-05-31"
});
ok(renewalSameDay.ok, "permite iniciar el nuevo período el mismo día del vencimiento");

const renewalLateStart = validateContractRenewal(emp, {
  renewalDate: "2026-01-10",
  contractVigenteStartDate: "2025-12-30",
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

console.log("contract-renewal.domain.test.mjs: OK (16 casos)");
