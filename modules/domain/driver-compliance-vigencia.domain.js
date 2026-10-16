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

/** Edad cumplida en `atYmd`; null si alguna fecha no es válida. */
export function ageInYearsAtYmd(birthYmd, atYmd) {
  const b = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(birthYmd || "").trim());
  const a = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(atYmd || "").trim());
  if (!b || !a) return null;
  let age = Number(a[1]) - Number(b[1]);
  if (`${a[2]}-${a[3]}` < `${b[2]}-${b[3]}`) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

/**
 * Ley 769/2002 art. 22 (mod. Decreto 019/2012 art. 197). Servicio particular (A/B): 10 años
 * antes de los 60, 5 años de 60 a 80 y 1 año después de 80. Servicio público (C): 3 años antes
 * de los 60 y 1 año desde los 60. La edad se mide a la fecha de expedición o renovación.
 */
export function resolveLicenseRenewalYears(category, { birthDateYmd = "", issueDateYmd = "" } = {}) {
  const cat = String(category || "C2")
    .trim()
    .toUpperCase();
  const age = ageInYearsAtYmd(birthDateYmd, issueDateYmd);
  if (/^[AB]\d?$/.test(cat)) {
    if (age != null && age > 80) return 1;
    if (age != null && age >= 60) return 5;
    return 10;
  }
  if (age != null && age >= 60) return 1;
  return LICENSE_C2_RENEWAL_YEARS;
}

export function resolveLicenseExpiryYmd(issueDateYmd, category, birthDateYmd = "") {
  return addPortalYmdYears(issueDateYmd, resolveLicenseRenewalYears(category, { birthDateYmd, issueDateYmd }));
}

/** Fecha de expedición aproximada a partir del vencimiento almacenado (datos legacy). */
export function inferLicenseIssueDateFromExpiryYmd(expiryYmd, category, birthDateYmd = "") {
  for (const years of [10, 5, 3, 1]) {
    const issue = addPortalYmdYears(expiryYmd, -years);
    if (issue && resolveLicenseRenewalYears(category, { birthDateYmd, issueDateYmd: issue }) === years) return issue;
  }
  return addPortalYmdYears(expiryYmd, -resolveLicenseRenewalYears(category));
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
    return resolveLicenseExpiryYmd(examDate, employee?.licenseCategory, normalizeDate(employee?.birthDate));
  }
  return "";
}

/** Días hasta una fecha YMD (negativo = vencido). `refYmd`: fecha de referencia (por defecto, hoy). */
export function complianceDaysUntilYmd(ymd, refYmd = "") {
  const norm = String(ymd || "").trim();
  if (!norm) return -9999;
  const target = new Date(`${norm}T12:00:00`).getTime();
  if (!Number.isFinite(target)) return -9999;
  const refParsed = refYmd ? new Date(`${String(refYmd).trim()}T00:00:00`).getTime() : NaN;
  const refTs = Number.isFinite(refParsed) ? refParsed : new Date().setHours(0, 0, 0, 0);
  return Math.floor((target - refTs) / 86400000);
}

/**
 * Valida licencia, examen ocupacional e instruvial para asignación a viajes.
 * Con `options.onYmd` (fecha en que termina el viaje) también exige que sigan vigentes ese día:
 * `futureIssues` lista lo que hoy está vigente pero vence antes del viaje.
 * @param {Record<string, unknown>|null|undefined} driver
 * @param {{ onYmd?: string }} [options]
 */
export function evaluateDriverTripCompliance(driver, options = {}) {
  const norm = (v) => String(v || "").trim();
  const onYmd = norm(options && options.onYmd);
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
  const futureIssues = [];
  [
    [licenseYmd, "licencia de conducción"],
    [occYmd, "examen médico ocupacional"],
    [intraYmd, "examen instruvial"]
  ].forEach(([ymd, label]) => {
    if (!ymd || complianceDaysUntilYmd(ymd) < 0) issues.push(label);
    else if (onYmd && complianceDaysUntilYmd(ymd, onYmd) < 0) futureIssues.push(label);
  });
  return {
    ok: issues.length === 0 && futureIssues.length === 0,
    issues,
    futureIssues,
    licenseYmd,
    occYmd,
    intraYmd,
    tripDateYmd: onYmd,
    summary: issues.length ? issues.join(", ") : futureIssues.length ? futureIssues.join(", ") : "Vigente"
  };
}

export function driverHasExpiredComplianceForTrips(driver, options = {}) {
  return !evaluateDriverTripCompliance(driver, options).ok;
}

export function driverTripComplianceBlockMessage(driver, options = {}) {
  const check = evaluateDriverTripCompliance(driver, options);
  if (check.ok) return "";
  const name = String(driver?.name || driver?.fullName || "Conductor").trim();
  if (!check.issues.length && check.futureIssues.length) {
    return `${name}: ${check.futureIssues.join(", ")} vence antes de la fecha del viaje. Renueve en Cumplimiento SST o elija otro conductor.`;
  }
  return `${name}: ${check.summary} vencido o sin fecha. Renueve en Cumplimiento SST antes de asignar.`;
}
