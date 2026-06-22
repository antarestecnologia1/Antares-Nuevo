/**
 * Renovación de contratos a término fijo (Colombia CST art. 46–47).
 * Mantiene fecha de ingreso; actualiza período vigente y fecha de renovación.
 */
import { KEYS } from "../core/config.js";
import { read, writeAwaitServerEdit } from "../core/data-io.js";
import { colombiaTodayIsoDate, stampUpdatedRecord } from "../core/utils.js";
import { upsertContractRecordForEmployee } from "./contracts.domain.js";

function normalizeYmd(raw) {
  if (raw == null || raw === "") return "";
  const m = String(raw).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

function addDaysToYmd(ymd, days) {
  const n = normalizeYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.trunc(days));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addYearsToYmd(ymd, years) {
  const n = normalizeYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + Math.trunc(years));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isFixedTermContractType(contractType) {
  return String(contractType || "").trim() === "Termino fijo";
}

/** Día siguiente al fin del contrato vigente (o +1 año desde inicio vigente). */
export function suggestRenewalPeriodStartYmd(employee) {
  const e = employee || {};
  const end = normalizeYmd(e.contractEndDate);
  if (end) return addDaysToYmd(end, 1);
  const vigente = normalizeYmd(e.contractVigenteStartDate || e.startDate);
  if (!vigente) return colombiaTodayIsoDate();
  return addYearsToYmd(vigente, 1);
}

export function validateContractRenewal(employee, fields) {
  const e = employee || {};
  if (!isFixedTermContractType(e.contractType)) {
    return { ok: false, message: "Solo aplica a contratos a término fijo." };
  }
  const renewalDate = normalizeYmd(fields.renewalDate);
  const periodStart = normalizeYmd(fields.contractVigenteStartDate);
  const contractEnd = normalizeYmd(fields.contractEndDate);
  if (!renewalDate) {
    return { ok: false, message: "Indique la fecha de renovación (firma o acta).", field: "renewalDate" };
  }
  if (!periodStart) {
    return { ok: false, message: "Indique el inicio del nuevo período contractual.", field: "contractVigenteStartDate" };
  }
  if (!contractEnd) {
    return { ok: false, message: "No se pudo calcular la fecha fin del contrato.", field: "contractEndDate" };
  }
  const hire = normalizeYmd(e.startDate);
  if (hire) {
    const maxEnd = addYearsToYmd(hire, 3);
    if (maxEnd && contractEnd > maxEnd) {
      return {
        ok: false,
        message: `El término fijo no puede superar 3 años desde el ingreso (máx. ${maxEnd}, CST art. 46).`,
        field: "contractEndDate"
      };
    }
  }
  return { ok: true, renewalDate, periodStart, contractEnd };
}

export function buildRenewedEmployeePatch(employee, fields) {
  const validated = validateContractRenewal(employee, fields);
  if (!validated.ok) return validated;
  const duration = String(
    fields.contractDuration || employee.contractDuration || employee.contractDurationText || "1 año"
  ).trim();
  const salaryRaw = fields.baseSalary;
  const baseSalary =
    salaryRaw != null && String(salaryRaw).trim() !== "" ? Number(salaryRaw) : Number(employee.baseSalary);
  return {
    ok: true,
    employee: {
      ...employee,
      startDate: employee.startDate,
      renewalDate: validated.renewalDate,
      contractVigenteStartDate: validated.periodStart,
      contractEndDate: validated.contractEnd,
      contractDuration: duration,
      contractDurationText: duration,
      baseSalary: Number.isFinite(baseSalary) ? baseSalary : employee.baseSalary
    }
  };
}

/**
 * Persiste renovación: empleado (sin tocar ingreso), nuevo registro en contratos y Word opcional.
 */
export async function executeEmployeeContractRenewal(employee, fields, opts = {}) {
  const built = buildRenewedEmployeePatch(employee, fields);
  if (!built.ok) return built;
  const renewed = built.employee;
  const all = read(KEYS.payrollEmployees, []);
  const idx = all.findIndex((row) => String(row.id) === String(employee.id));
  if (idx < 0) return { ok: false, message: "Colaborador no encontrado." };

  const saved = stampUpdatedRecord({ ...all[idx], ...renewed, id: all[idx].id });
  const nextList = all.map((row, i) => (i === idx ? saved : row));
  try {
    await writeAwaitServerEdit(KEYS.payrollEmployees, nextList, saved);
  } catch (err) {
    return { ok: false, message: String(err?.message || "No se pudo guardar la renovación.") };
  }

  const contractResult = await upsertContractRecordForEmployee(saved, {
    signDate: renewed.contractVigenteStartDate,
    renewalDate: renewed.renewalDate,
    endDate: renewed.contractEndDate,
    sourceTag: "Renovación contrato término fijo",
    notifyOnFailure: false
  });

  if (opts.generateWord && typeof globalThis.generateOfficialWordContract === "function") {
    try {
      const payload =
        typeof globalThis.buildEmployeeContractDocxPayload === "function"
          ? globalThis.buildEmployeeContractDocxPayload(saved, {
              signDate: renewed.renewalDate
            })
          : null;
      if (payload) await globalThis.generateOfficialWordContract(payload);
    } catch (_err) {
      /* Word no bloquea la renovación */
    }
  }

  if (typeof globalThis.propagateEmployeeChanges === "function") {
    await globalThis.propagateEmployeeChanges(saved);
  }
  if (typeof globalThis.scheduleContractRenewalNotificationCheck === "function") {
    globalThis.scheduleContractRenewalNotificationCheck();
  }

  return {
    ok: true,
    employee: saved,
    contract: contractResult.ok ? contractResult.contract : null
  };
}
