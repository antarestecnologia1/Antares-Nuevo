/**
 * Vigencias regulatorias de conductores (Colombia): exámenes ocupacionales periódicos,
 * examen instruvial y licencia de conducción C2.
 */
import { addCalendarYearsIsoDate } from "../core/utils.js";

/** Examen médico ocupacional periódico: renovación anual. */
export const OCCUPATIONAL_EXAM_RENEWAL_YEARS = 1;

/** Examen instruvial: renovación cada 2 años. */
export const INTRUVIAL_EXAM_RENEWAL_YEARS = 2;

/** Licencia categoría C2: renovación cada 3 años desde expedición. */
export const LICENSE_C2_RENEWAL_YEARS = 3;

/** Ventana de alerta «próximo a vencer» (días). */
export const COMPLIANCE_DUE_SOON_DAYS = 30;

export function addPortalYmdYears(ymd, years) {
  return addCalendarYearsIsoDate(ymd, years);
}

/** @deprecated Prefer {@link resolveOccupationalExamExpiryYmd} */
export function addOneYearToYmd(ymd) {
  return resolveOccupationalExamExpiryYmd(ymd);
}

export function resolveOccupationalExamExpiryYmd(examDateYmd) {
  return addPortalYmdYears(examDateYmd, OCCUPATIONAL_EXAM_RENEWAL_YEARS);
}

export function resolveInstruvialExamExpiryYmd(examDateYmd) {
  return addPortalYmdYears(examDateYmd, INTRUVIAL_EXAM_RENEWAL_YEARS);
}

export function resolveLicenseRenewalYears(category) {
  const cat = String(category || "C2")
    .trim()
    .toUpperCase();
  if (cat === "C2") return LICENSE_C2_RENEWAL_YEARS;
  return LICENSE_C2_RENEWAL_YEARS;
}

export function resolveLicenseExpiryYmd(issueDateYmd, category) {
  return addPortalYmdYears(issueDateYmd, resolveLicenseRenewalYears(category));
}

/** Fecha de expedición aproximada a partir del vencimiento almacenado (datos legacy). */
export function inferLicenseIssueDateFromExpiryYmd(expiryYmd, category) {
  const years = resolveLicenseRenewalYears(category);
  return addPortalYmdYears(expiryYmd, -years);
}

/**
 * Resuelve la fecha de vencimiento de un control del empleado.
 * @param {Record<string, unknown>|null|undefined} employee
 * @param {"occupationalExamExpiry"|"instruvialExamExpiry"|"licenseExpiry"} expiryKey
 * @param {"occupationalExamDate"|"instruvialExamDate"|null} dateKey
 * @param {(v: unknown) => string} normalizeDate
 */
export function resolveEmployeeComplianceExpiryYmd(
  employee,
  expiryKey,
  dateKey,
  normalizeDate = (v) => String(v || "").trim()
) {
  const expiry = normalizeDate(employee?.[expiryKey]);
  if (expiry) return expiry;
  if (!dateKey) return "";
  const examDate = normalizeDate(employee?.[dateKey]);
  if (!examDate) return "";
  if (expiryKey === "occupationalExamExpiry") return resolveOccupationalExamExpiryYmd(examDate);
  if (expiryKey === "instruvialExamExpiry") return resolveInstruvialExamExpiryYmd(examDate);
  if (expiryKey === "licenseExpiry") {
    const category = employee?.licenseCategory;
    return resolveLicenseExpiryYmd(examDate, category);
  }
  return "";
}
