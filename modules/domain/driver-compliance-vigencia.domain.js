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

/** Días hasta una fecha YMD (negativo = vencido). */
export function complianceDaysUntilYmd(ymd) {
  const norm = String(ymd || "").trim();
  if (!norm) return -9999;
  const target = new Date(`${norm}T12:00:00`).getTime();
  if (!Number.isFinite(target)) return -9999;
  const todayTs = new Date().setHours(0, 0, 0, 0);
  return Math.floor((target - todayTs) / 86400000);
}

/**
 * Valida licencia, examen ocupacional e instruvial para asignación a viajes.
 * @param {Record<string, unknown>|null|undefined} driver
 */
export function evaluateDriverTripCompliance(driver) {
  const norm = (v) => String(v || "").trim();
  const licenseYmd = resolveEmployeeComplianceExpiryYmd(driver, "licenseExpiry", "licenseIssueDate", norm);
  const occYmd = resolveEmployeeComplianceExpiryYmd(
    driver,
    "occupationalExamExpiry",
    "occupationalExamDate",
    norm
  );
  const intraYmd = resolveEmployeeComplianceExpiryYmd(
    driver,
    "instruvialExamExpiry",
    "instruvialExamDate",
    norm
  );
  const issues = [];
  if (!licenseYmd || complianceDaysUntilYmd(licenseYmd) < 0) issues.push("licencia de conducción");
  if (!occYmd || complianceDaysUntilYmd(occYmd) < 0) issues.push("examen médico ocupacional");
  if (!intraYmd || complianceDaysUntilYmd(intraYmd) < 0) issues.push("examen instruvial");
  return {
    ok: issues.length === 0,
    issues,
    licenseYmd,
    occYmd,
    intraYmd,
    summary: issues.length ? issues.join(", ") : "Vigente"
  };
}

export function driverHasExpiredComplianceForTrips(driver) {
  return !evaluateDriverTripCompliance(driver).ok;
}

export function driverTripComplianceBlockMessage(driver) {
  const check = evaluateDriverTripCompliance(driver);
  if (check.ok) return "";
  const name = String(driver?.name || driver?.fullName || "Conductor").trim();
  return `${name}: ${check.summary} vencido o sin fecha. Renueve en Cumplimiento SST antes de asignar.`;
}
