/**
 * Verificación: renovación y aviso de no renovación (CST art. 46–47).
 * Ejecutar: node qa/contract-renewal.domain.test.mjs
 */
import assert from "node:assert/strict";
import {
  addDaysToContractRenewalYmd,
  addMonthsToContractRenewalYmd,
  addYearsToContractRenewalYmd,
  normalizeContractRenewalYmd,
  resolveContractEndFromPlazoStartYmd,
  suggestRenewalPeriodStartYmd,
  validateContractRenewal,
  validateNonRenewalNotice,
  buildNonRenewalNoticeMeta,
  buildNonRenewalNoticeLetterHtml,
  countShortFixedTermRenewals,
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

let cases = 0;
function ok(cond, msg) {
  assert.ok(cond, msg);
  cases += 1;
}
function eq(actual, expected, msg) {
  assert.equal(actual, expected, msg);
  cases += 1;
}

const TODAY = "2026-10-13";

ok(isFixedTermContractType("Termino fijo"), "término fijo");
ok(!isFixedTermContractType("Termino indefinido"), "no indefinido");

/* Aritmética de fechas */
eq(normalizeContractRenewalYmd("2025-02-30"), "", "rechaza fecha imposible");
eq(normalizeContractRenewalYmd("2024-02-29T05:00:00Z"), "2024-02-29", "acepta ISO con hora");
eq(addMonthsToContractRenewalYmd("2025-01-31", 1), "2025-02-28", "31-ene + 1 mes = 28-feb (no 3-mar)");
eq(addMonthsToContractRenewalYmd("2024-01-31", 1), "2024-02-29", "31-ene + 1 mes en bisiesto = 29-feb");
eq(addMonthsToContractRenewalYmd("2025-08-31", 6), "2026-02-28", "31-ago + 6 meses = 28-feb");
eq(addYearsToContractRenewalYmd("2024-02-29", 1), "2025-02-28", "29-feb + 1 año = 28-feb (no 1-mar)");
eq(addDaysToContractRenewalYmd("2025-12-31", 1), "2026-01-01", "suma días cruzando año");
eq(addDaysToContractRenewalYmd("2026-03-01", -30), "2026-01-30", "resta días");
eq(
  resolveContractEndFromPlazoStartYmd({ contractDuration: "2 años" }, "2024-02-29"),
  "2026-02-28",
  "plazo en años desde 29-feb"
);

/* Sugerencia de inicio del nuevo período (mismo día del vencimiento) */
const emp = {
  contractType: "Termino fijo",
  startDate: "2023-06-01",
  contractVigenteStartDate: "2025-01-01",
  contractEndDate: "2026-01-01",
  contractDuration: "1 año"
};

eq(
  suggestRenewalPeriodStartYmd({ ...emp, contractEndDate: "2026-12-01" }, { todayYmd: TODAY }),
  "2026-12-01",
  "vigente → inicio = mismo día del vencimiento"
);
eq(
  suggestRenewalPeriodStartYmd({ ...emp, contractEndDate: TODAY }, { todayYmd: TODAY }),
  TODAY,
  "vence hoy → inicio hoy"
);
eq(
  suggestRenewalPeriodStartYmd(emp, { todayYmd: TODAY }),
  "2026-01-01",
  "vencido (prórroga automática) → período que contiene hoy inicia en el vencimiento"
);

const hireNeverRenewed = {
  contractType: "Termino fijo",
  startDate: "2022-08-18",
  contractDuration: "1 año",
  contractEndDate: "2023-08-18"
};
eq(
  suggestRenewalPeriodStartYmd(hireNeverRenewed, { todayYmd: TODAY }),
  "2026-08-18",
  "vencido hace varios ciclos → encadena aniversarios sin correr días"
);
eq(
  suggestRenewalPeriodStartYmd(
    { ...hireNeverRenewed, contractDuration: "4 meses", contractEndDate: "2025-12-18" },
    { todayYmd: TODAY }
  ),
  "2026-08-18",
  "plazo en meses encadenado"
);

/* Validación de renovación */
const base = { renewalDate: "2026-01-10", contractVigenteStartDate: "2026-01-01" };
const renewalOk = validateContractRenewal(emp, { ...base, contractDuration: "5 meses" }, { todayYmd: TODAY });
ok(renewalOk.ok, "renovación válida");
eq(renewalOk.contractEnd, "2026-06-01", "fin calculado desde inicio + duración");

const mismatchedEnd = validateContractRenewal(
  emp,
  { ...base, contractDuration: "5 meses", contractEndDate: "2027-12-31" },
  { todayYmd: TODAY }
);
eq(mismatchedEnd.contractEnd, "2026-06-01", "ignora fin enviado que no coincide con la duración");

ok(
  validateContractRenewal(
    emp,
    { renewalDate: "2026-01-01", contractVigenteStartDate: "2026-01-01", contractDuration: "1 año" },
    { todayYmd: TODAY }
  ).ok,
  "permite iniciar el nuevo período el mismo día del vencimiento"
);
ok(
  !validateContractRenewal(emp, { ...base, contractVigenteStartDate: "2025-12-31" }, { todayYmd: TODAY }).ok,
  "rechaza inicio antes del vencimiento vigente"
);
ok(
  validateContractRenewal(emp, { ...base, contractDuration: "3 años" }, { todayYmd: TODAY }).ok,
  "más de 3 años desde el ingreso es válido: el término fijo es renovable indefinidamente"
);
const tooLong = validateContractRenewal(emp, { ...base, contractDuration: "4 años" }, { todayYmd: TODAY });
ok(!tooLong.ok && tooLong.field === "contractDuration", "rechaza período superior a 3 años");
const badDuration = validateContractRenewal(emp, { ...base, contractDuration: "un año" }, { todayYmd: TODAY });
ok(!badDuration.ok && badDuration.field === "contractDuration", "rechaza duración no reconocida");
const futureRenewal = validateContractRenewal(
  emp,
  { ...base, renewalDate: "2026-10-14", contractDuration: "1 año" },
  { todayYmd: TODAY }
);
ok(!futureRenewal.ok && futureRenewal.field === "renewalDate", "rechaza fecha de renovación futura");
ok(
  !validateContractRenewal(emp, { ...base, renewalDate: "2023-05-01" }, { todayYmd: TODAY }).ok,
  "rechaza fecha de renovación anterior al ingreso"
);
ok(
  !validateContractRenewal(emp, { ...base, renewalDate: "2025-02-30" }, { todayYmd: TODAY }).ok,
  "rechaza fecha de renovación imposible"
);

const shortHistory = [
  { sourceTag: "Generado al contratar empleado", startDate: "2025-01-01", endDate: "2025-05-01" },
  { sourceTag: "Renovación contrato término fijo", startDate: "2025-05-01", endDate: "2025-09-01" },
  { sourceTag: "Renovación contrato término fijo", startDate: "2025-09-01", endDate: "2026-01-01" },
  { sourceTag: "Renovación contrato término fijo", startDate: "2026-01-01", endDate: "2026-05-01" }
];
eq(countShortFixedTermRenewals(shortHistory), 3, "cuenta prórrogas inferiores a 1 año");
const fourthShort = validateContractRenewal(
  emp,
  { ...base, contractDuration: "4 meses" },
  { todayYmd: TODAY, contractHistory: shortHistory }
);
ok(!fourthShort.ok, "tras 3 prórrogas cortas exige renovación mínima de 1 año");
ok(
  validateContractRenewal(emp, { ...base, contractDuration: "1 año" }, { todayYmd: TODAY, contractHistory: shortHistory })
    .ok,
  "tras 3 prórrogas cortas acepta renovación de 1 año"
);

/* Aviso de no renovación */
const noticeMeta = buildNonRenewalNoticeMeta(emp, { todayYmd: "2025-11-15" });
eq(noticeMeta.endYmd, "2026-01-01", "meta fin contrato");
eq(noticeMeta.noticeDeadlineYmd, "2025-12-02", "aviso 30 días antes");

const noticeOk = validateNonRenewalNotice(emp, { noticeDate: "2025-11-15" });
ok(noticeOk.ok && !noticeOk.lateNotice, "aviso a tiempo");
const noticeLate = validateNonRenewalNotice(emp, { noticeDate: "2025-12-15" });
ok(noticeLate.ok && noticeLate.lateNotice, "aviso tardío permitido con flag");
ok(!validateNonRenewalNotice(emp, { noticeDate: "2026-01-01" }).ok, "rechaza aviso el día del vencimiento");
ok(!validateNonRenewalNotice(emp, { noticeDate: "2026-02-01" }).ok, "rechaza aviso después del vencimiento");
ok(!validateNonRenewalNotice(emp, { noticeDate: "2024-12-01" }).ok, "rechaza aviso antes del período vigente");

const lateLetter = buildNonRenewalNoticeLetterHtml(emp, { noticeDate: "2025-12-15" });
ok(!lateLetter.includes("se entrega con la anticipación exigida"), "carta tardía no afirma anticipación legal");
const onTimeLetter = buildNonRenewalNoticeLetterHtml(emp, { noticeDate: "2025-11-15" });
ok(onTimeLetter.includes("se entrega con la anticipación exigida"), "carta a tiempo mantiene el texto");

/* Claves de historial */
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

console.log(`contract-renewal.domain.test.mjs: OK (${cases} casos)`);
