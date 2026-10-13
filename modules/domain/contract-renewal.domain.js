/**
 * Renovación de contratos a término fijo (Colombia CST art. 46–47).
 * Mantiene fecha de ingreso; actualiza período vigente y fecha de renovación.
 */
import { ensureEmployeeContractFields } from "../ui/modals.js";
import { KEYS } from "../core/config.js";
import { read, writeAwaitServerEdit } from "../core/data-io.js";
import { stampUpdatedRecord } from "../core/utils.js";
import { getEmployeeContractHistory, upsertContractRecordForEmployee } from "./contracts.domain.js";
import {
  buildNonRenewalNoticeLetterHtml,
  buildNonRenewalNoticeMeta,
  buildRenewedEmployeePatch,
  isFixedTermContractType,
  suggestRenewalPeriodStartYmd,
  validateContractRenewal,
  validateNonRenewalNotice,
  formatContractNoticeDateEs
} from "./contract-renewal.logic.js";

export {
  buildNonRenewalNoticeLetterHtml,
  buildNonRenewalNoticeMeta,
  buildRenewedEmployeePatch,
  isFixedTermContractType,
  suggestRenewalPeriodStartYmd,
  validateContractRenewal,
  validateNonRenewalNotice,
  formatContractNoticeDateEs
};

/**
 * Persiste renovación: empleado (sin tocar ingreso), historial de contratos,
 * archivo del Word anterior y generación del Word del nuevo período.
 */
export function readEmployeeContractHistoryForRenewal(employeeId) {
  return getEmployeeContractHistory(employeeId, read(KEYS.contracts, []));
}

export async function executeEmployeeContractRenewal(employee, fields, opts = {}) {
  const enriched = ensureEmployeeContractFields(employee || {});
  const built = buildRenewedEmployeePatch(enriched, fields, {
    contractHistory: opts.contractHistory || readEmployeeContractHistoryForRenewal(employee?.id)
  });
  if (!built.ok) return built;
  const renewed = built.employee;
  const all = read(KEYS.payrollEmployees, []);
  const idx = all.findIndex((row) => String(row.id) === String(employee.id));
  if (idx < 0) return { ok: false, message: "Colaborador no encontrado." };

  const previousSnapshot = ensureEmployeeContractFields({ ...all[idx] });
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

  let documents = null;
  try {
    if (typeof globalThis.archiveEmployeeContractRenewalPair === "function") {
      documents = await globalThis.archiveEmployeeContractRenewalPair(previousSnapshot, saved, {
        signDate: renewed.contractVigenteStartDate || renewed.renewalDate,
        download: opts.downloadWord !== false
      });
    } else if (typeof globalThis.archiveEmployeeContractToFolder === "function") {
      const previous = await globalThis.archiveEmployeeContractToFolder(previousSnapshot, {
        signDate: previousSnapshot.contractVigenteStartDate || previousSnapshot.startDate,
        periodLabel: "período anterior"
      });
      const current = await globalThis.archiveEmployeeContractToFolder(saved, {
        signDate: renewed.contractVigenteStartDate || renewed.renewalDate,
        periodLabel: "renovación"
      });
      documents = { ok: Boolean(current?.ok), previous, current };
      if (
        opts.downloadWord !== false &&
        typeof globalThis.generateOfficialWordContract === "function" &&
        typeof globalThis.buildEmployeeContractDocxPayload === "function"
      ) {
        const payload = globalThis.buildEmployeeContractDocxPayload(saved, {
          signDate: renewed.renewalDate || renewed.contractVigenteStartDate
        });
        if (payload) await globalThis.generateOfficialWordContract(payload);
      }
    }
  } catch (_err) {
    /* El archivo Word no revierte la renovación ya persistida. */
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
    contract: contractResult.ok ? contractResult.contract : null,
    documents
  };
}

/** Abre ventana imprimible con la carta de no renovación. */
export function openNonRenewalNoticeLetter(employee, opts = {}) {
  const companies = read(KEYS.companies, []);
  const company = companies.find((row) => String(row.id) === String(employee?.companyId || "")) || {};
  const html = buildNonRenewalNoticeLetterHtml(employee, {
    ...opts,
    companyName: opts.companyName || company.name,
    city: opts.city || company.city || employee?.city
  });
  const popup = window.open("", "_blank", "width=820,height=900");
  if (!popup) {
    return { ok: false, message: "El navegador bloqueó la ventana. Permita ventanas emergentes e intente de nuevo." };
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  return { ok: true };
}

/**
 * Registra aviso de no renovación: fecha en empleado, historial en contratos y carta imprimible.
 */
export async function executeEmployeeContractNonRenewalNotice(employee, fields = {}, opts = {}) {
  const enriched = ensureEmployeeContractFields(employee || {});
  const validated = validateNonRenewalNotice(enriched, fields);
  if (!validated.ok) return validated;
  const noticeDate = validated.noticeDate;
  const all = read(KEYS.payrollEmployees, []);
  const idx = all.findIndex((row) => String(row.id) === String(employee.id));
  if (idx < 0) return { ok: false, message: "Colaborador no encontrado." };

  const patched = stampUpdatedRecord({
    ...all[idx],
    nonRenewalNoticeDate: noticeDate,
    id: all[idx].id
  });
  const nextList = all.map((row, i) => (i === idx ? patched : row));
  try {
    await writeAwaitServerEdit(KEYS.payrollEmployees, nextList, patched);
  } catch (err) {
    return { ok: false, message: String(err?.message || "No se pudo registrar el aviso.") };
  }

  const contractResult = await upsertContractRecordForEmployee(patched, {
    signDate: noticeDate,
    renewalDate: noticeDate,
    endDate: patched.contractEndDate,
    sourceTag: "Aviso no renovación CST art. 47",
    content:
      `AVISO NO RENOVACIÓN\n` +
      `Colaborador: ${String(patched.name || "").trim()}\n` +
      `Documento: ${String(patched.idDoc || "").trim()}\n` +
      `Fin contrato: ${String(patched.contractEndDate || "").trim()}\n` +
      `Fecha aviso: ${noticeDate}\n`,
    notifyOnFailure: false
  });

  if (opts.openLetter !== false) {
    openNonRenewalNoticeLetter(patched, { noticeDate });
  }

  if (typeof globalThis.propagateEmployeeChanges === "function") {
    await globalThis.propagateEmployeeChanges(patched);
  }
  if (typeof globalThis.scheduleContractRenewalNotificationCheck === "function") {
    globalThis.scheduleContractRenewalNotificationCheck();
  }

  return {
    ok: true,
    employee: patched,
    contract: contractResult.ok ? contractResult.contract : null,
    lateNotice: validated.lateNotice
  };
}
