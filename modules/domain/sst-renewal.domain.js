/**
 * Renovación SST: al completar o renovar un control, actualiza la ficha del empleado
 * (y conductor si aplica) y registra auditoría en cumplimiento SST.
 */
import { KEYS, CO_CATALOGS } from "../core/config.js";
import { read, writeAwaitServerCreate, writeAwaitServerEdit } from "../core/data-io.js";
import {
  normalizePortalDateYmd,
  stampCreatedRecord,
  stampUpdatedRecord,
  newUuidV4,
  colombiaTodayIsoDate
} from "../core/utils.js";
import { matchCatalogOptionValue } from "./payroll-catalog-sanitize.domain.js";
import { propagateEmployeeChanges, normalizeSstComplianceRow } from "./sst.domain.js";
import {
  addPortalYmdYears,
  resolveOccupationalExamExpiryYmd,
  resolveInstruvialExamExpiryYmd,
  resolveLicenseExpiryYmd
} from "./driver-compliance-vigencia.domain.js";

/** @typedef {"occupational_exam"|"instruvial_exam"|"license"|"eps_affiliation"|"pension_affiliation"|"arl_affiliation"|"sst_training"|"document_inspection"|""} SstControlKey */

const CONTROL_SPECS = {
  occupational_exam: {
    recordType: "Examen medico ocupacional",
    nextDueYears: 1,
    employeePatch(_employee, { completionDate }) {
      const date = normalizePortalDateYmd(completionDate);
      if (!date) return null;
      return {
        occupationalExamDate: date,
        occupationalExamExpiry: resolveOccupationalExamExpiryYmd(date),
        psychoTestDate: date,
        psychoTestExpiry: resolveOccupationalExamExpiryYmd(date)
      };
    }
  },
  instruvial_exam: {
    recordType: "Examen instruvial",
    nextDueYears: 2,
    employeePatch(_employee, { completionDate }) {
      const date = normalizePortalDateYmd(completionDate);
      if (!date) return null;
      return {
        instruvialExamDate: date,
        instruvialExamExpiry: resolveInstruvialExamExpiryYmd(date)
      };
    }
  },
  license: {
    recordType: "Licencia de conduccion",
    nextDueYears: 3,
    employeePatch(employee, { completionDate }) {
      const date = normalizePortalDateYmd(completionDate);
      if (!date) return null;
      const category = String(employee?.licenseCategory || "C2").trim() || "C2";
      return {
        licenseIssueDate: date,
        licenseExpiry: resolveLicenseExpiryYmd(date, category)
      };
    }
  },
  eps_affiliation: {
    recordType: "Afiliacion EPS",
    nextDueYears: 1,
    employeePatch(_employee, { provider }) {
      const eps = matchCatalogOptionValue(CO_CATALOGS.eps, provider);
      return eps ? { eps } : null;
    }
  },
  pension_affiliation: {
    recordType: "Afiliacion pension",
    nextDueYears: 1,
    employeePatch(_employee, { provider }) {
      const pensionFund = matchCatalogOptionValue(CO_CATALOGS.pensionFunds, provider);
      return pensionFund ? { pensionFund } : null;
    }
  },
  arl_affiliation: {
    recordType: "Afiliacion ARL",
    nextDueYears: 1,
    employeePatch(_employee, { provider }) {
      const arl = matchCatalogOptionValue(CO_CATALOGS.arl, provider);
      return arl ? { arl } : null;
    }
  },
  sst_training: {
    recordType: "Capacitacion SST",
    nextDueYears: 1,
    employeePatch: null
  },
  document_inspection: {
    recordType: "Inspeccion documental",
    nextDueYears: 1,
    employeePatch: null
  }
};

/**
 * @param {string} labelOrType
 * @returns {SstControlKey}
 */
export function resolveSstControlKey(labelOrType) {
  const t = String(labelOrType || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (t.includes("instruvial")) return "instruvial_exam";
  if (t.includes("licencia")) return "license";
  if (t.includes("ocupacional") || (t.includes("medico") && t.includes("examen"))) return "occupational_exam";
  if (t.includes("eps")) return "eps_affiliation";
  if (t.includes("pension")) return "pension_affiliation";
  if (t.includes("arl")) return "arl_affiliation";
  if (t.includes("capacitacion")) return "sst_training";
  if (t.includes("inspeccion")) return "document_inspection";
  return "";
}

export function getSstControlSpec(controlKey) {
  return CONTROL_SPECS[String(controlKey || "")] || null;
}

export function getSstControlRecordType(controlKey) {
  return getSstControlSpec(controlKey)?.recordType || "";
}

export function computeSstNextDueDate(controlKey, completionDate) {
  const spec = getSstControlSpec(controlKey);
  const ymd = normalizePortalDateYmd(completionDate);
  if (!ymd) return "";
  const years = spec?.nextDueYears;
  if (!years) return ymd;
  return addPortalYmdYears(ymd, years);
}

export function buildSstRenewalEmployeePatch(employee, controlKey, { completionDate, provider } = {}) {
  const spec = getSstControlSpec(controlKey);
  if (!spec?.employeePatch) return null;
  return spec.employeePatch(employee, { completionDate, provider });
}

export function sstControlRequiresProvider(controlKey) {
  return ["eps_affiliation", "pension_affiliation", "arl_affiliation"].includes(String(controlKey || ""));
}

export function sstControlRequiresCompletionDate(controlKey) {
  return !sstControlRequiresProvider(controlKey) || String(controlKey || "") === "";
}

function normalizeEmployeeAfterRenewal(employee) {
  const norm =
    typeof globalThis.normalizePayrollEmployeeRowDates === "function"
      ? globalThis.normalizePayrollEmployeeRowDates
      : (row) => row;
  const ensure =
    typeof globalThis.ensureEmployeeContractFields === "function"
      ? globalThis.ensureEmployeeContractFields
      : (row) => row;
  return norm(ensure({ ...employee }));
}

function appendCompletionNote(existingNotes, completionDate) {
  const base = String(existingNotes || "").trim();
  const stamp = `[Realizado: ${completionDate}]`;
  if (base.includes(stamp)) return base;
  return base ? `${base}\n${stamp}` : stamp;
}

function upsertSstAuditRecord({
  recordId,
  employee,
  controlKey,
  completionDate,
  nextDueDate,
  provider,
  documentCode,
  notes,
  status = "Cumplido"
}) {
  const records = read(KEYS.sstCompliance, []);
  const recordType = getSstControlRecordType(controlKey) || String(controlKey || "Control SST");
  const mergedNotes = appendCompletionNote(notes, completionDate);

  if (recordId) {
    const idx = records.findIndex((row) => String(row.id) === String(recordId));
    if (idx >= 0) {
      const prev = records[idx];
      const next = normalizeSstComplianceRow(
        stampUpdatedRecord({
          ...prev,
          recordType: recordType || prev.recordType,
          provider: String(provider || prev.provider || "").trim() || prev.provider,
          dueDate: nextDueDate || prev.dueDate,
          completionDate,
          status,
          documentCode: String(documentCode || prev.documentCode || "").trim().toUpperCase() || prev.documentCode,
          notes: mergedNotes || prev.notes
        })
      );
      const nextList = records.map((row, i) => (i === idx ? next : row));
      return { nextList, savedRecord: next, mode: "update" };
    }
  }

  const created = normalizeSstComplianceRow(
    stampCreatedRecord({
      id: newUuidV4(),
      employeeId: employee.id,
      employeeName: employee.name,
      recordType,
      provider: String(provider || "—").trim() || "—",
      dueDate: nextDueDate || completionDate,
      completionDate,
      status,
      documentCode: String(documentCode || "").trim().toUpperCase(),
      notes: mergedNotes
    })
  );
  return { nextList: [created, ...records], savedRecord: created, mode: "create" };
}

/**
 * Renueva un control SST y propaga cambios al empleado y módulos vinculados.
 * @param {object} options
 * @param {string} options.employeeId
 * @param {SstControlKey} options.controlKey
 * @param {string} [options.completionDate]
 * @param {string} [options.provider]
 * @param {string} [options.documentCode]
 * @param {string} [options.notes]
 * @param {string} [options.recordId]
 * @param {boolean} [options.createAuditRecord=true]
 */
export async function executeSstRenewal({
  employeeId,
  controlKey,
  completionDate,
  provider,
  documentCode,
  notes,
  recordId,
  createAuditRecord = true
}) {
  const key = String(controlKey || "").trim();
  if (!key || !getSstControlSpec(key)) {
    return { ok: false, message: "Tipo de control SST no reconocido para renovación." };
  }

  const employees = read(KEYS.payrollEmployees, []);
  const employee = employees.find((row) => String(row.id) === String(employeeId || ""));
  if (!employee) {
    return { ok: false, message: "Colaborador no encontrado." };
  }

  const compDate = normalizePortalDateYmd(completionDate) || colombiaTodayIsoDate();
  if (sstControlRequiresCompletionDate(key) && !compDate) {
    return { ok: false, message: "Indique la fecha de realización del control." };
  }

  const providerText = String(provider || "").trim();
  if (sstControlRequiresProvider(key) && !providerText) {
    return { ok: false, message: "Indique la entidad (EPS, fondo o ARL) para actualizar la afiliación." };
  }

  const patch = buildSstRenewalEmployeePatch(employee, key, {
    completionDate: compDate,
    provider: providerText
  });

  if (patch === null && getSstControlSpec(key)?.employeePatch) {
    const label =
      key === "eps_affiliation"
        ? "EPS"
        : key === "pension_affiliation"
          ? "fondo de pensión"
          : key === "arl_affiliation"
            ? "ARL"
            : "entidad";
    return {
      ok: false,
      message: `No se pudo reconocer la ${label}. Use un valor del catálogo (ej. Sura, Colpensiones).`
    };
  }

  let updatedEmployee = employee;
  if (patch && Object.keys(patch).length) {
    updatedEmployee = normalizeEmployeeAfterRenewal(
      stampUpdatedRecord({ ...employee, ...patch, id: employee.id })
    );
    const nextEmployees = employees.map((row) =>
      String(row.id) === String(employee.id) ? updatedEmployee : row
    );
    try {
      await writeAwaitServerEdit(KEYS.payrollEmployees, nextEmployees, employee.id, { notifyOnFailure: false });
    } catch (err) {
      return { ok: false, message: String(err?.message || "No fue posible actualizar la ficha del colaborador.") };
    }
    const refreshed = read(KEYS.payrollEmployees, []).find((row) => String(row.id) === String(employee.id));
    if (refreshed) updatedEmployee = refreshed;
    const propagate = await propagateEmployeeChanges(updatedEmployee);
    if (!propagate.ok) {
      return {
        ok: false,
        message: propagate.message || "Colaborador actualizado, pero falló la sincronización con otros módulos."
      };
    }
  }

  const nextDueDate = computeSstNextDueDate(key, compDate);
  let savedRecord = null;

  if (createAuditRecord) {
    const { nextList, savedRecord: auditRow, mode } = upsertSstAuditRecord({
      recordId,
      employee: updatedEmployee,
      controlKey: key,
      completionDate: compDate,
      nextDueDate,
      provider: providerText,
      documentCode,
      notes,
      status: "Cumplido"
    });
    try {
      if (mode === "update") {
        await writeAwaitServerEdit(KEYS.sstCompliance, nextList, auditRow.id, { notifyOnFailure: false });
      } else {
        await writeAwaitServerCreate(KEYS.sstCompliance, nextList, auditRow, { notifyOnFailure: false });
      }
      savedRecord = auditRow;
    } catch (err) {
      return {
        ok: false,
        message: String(
          err?.message ||
            "Ficha del colaborador actualizada, pero no fue posible registrar el control SST en el servidor."
        )
      };
    }
  }

  return {
    ok: true,
    employee: updatedEmployee,
    record: savedRecord,
    nextDueDate,
    completionDate: compDate
  };
}

/**
 * Al marcar un registro SST existente como Cumplido desde el formulario de edición/creación.
 */
export async function applySstRecordCompletion(record, { completionDate, provider, documentCode, notes } = {}) {
  if (!record?.employeeId) return { ok: false, message: "Registro SST sin colaborador." };
  const controlKey = resolveSstControlKey(record.recordType);
  if (!controlKey) {
    return { ok: false, message: "Tipo de control no admite renovación automática." };
  }
  const status = String(record.status || "").trim().toLowerCase();
  if (!status.startsWith("cumpl")) {
    return { ok: true, skipped: true };
  }
  const result = await executeSstRenewal({
    employeeId: record.employeeId,
    controlKey,
    completionDate: completionDate || record.completionDate || record.dueDate,
    provider: provider || record.provider,
    documentCode: documentCode || record.documentCode,
    notes: notes || record.notes,
    recordId: record.id,
    createAuditRecord: false
  });
  if (!result.ok) return result;

  const records = read(KEYS.sstCompliance, []);
  const idx = records.findIndex((row) => String(row.id) === String(record.id));
  if (idx < 0) return result;

  const mergedNotes = appendCompletionNote(notes || records[idx].notes, result.completionDate);
  const nextList = records.map((row, i) =>
    i !== idx
      ? row
      : normalizeSstComplianceRow(
          stampUpdatedRecord({
            ...row,
            dueDate: result.nextDueDate || row.dueDate,
            completionDate: result.completionDate,
            notes: mergedNotes
          })
        )
  );
  try {
    const saved = nextList[idx];
    await writeAwaitServerEdit(KEYS.sstCompliance, nextList, saved.id, { notifyOnFailure: false });
    return { ...result, record: saved };
  } catch (err) {
    return {
      ok: false,
      message: String(
        err?.message || "Ficha actualizada, pero no se pudo actualizar el vencimiento del control SST."
      )
    };
  }
}
