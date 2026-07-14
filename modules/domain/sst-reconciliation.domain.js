/**
 * Detección de desincronización entre registros SST y fichas de empleados.
 */
import { KEYS } from "../core/config.js";
import { read } from "../core/data-io.js";
import { normalizePortalDateYmd } from "../core/utils.js";
import {
  resolveEmployeeComplianceExpiryYmd,
  complianceDaysUntilYmd
} from "./driver-compliance-vigencia.domain.js";
import { resolveSstControlKey, getSstControlSpec } from "./sst-renewal.domain.js";

function employeeControlInvalid(employee, controlKey) {
  const norm = normalizePortalDateYmd;
  const spec = getSstControlSpec(controlKey);
  if (!spec?.employeePatch) return false;

  if (controlKey === "eps_affiliation") return !String(employee?.eps || "").trim();
  if (controlKey === "pension_affiliation") return !String(employee?.pensionFund || "").trim();
  if (controlKey === "arl_affiliation") return !String(employee?.arl || "").trim();

  const map = {
    occupational_exam: ["occupationalExamExpiry", "occupationalExamDate"],
    instruvial_exam: ["instruvialExamExpiry", "instruvialExamDate"],
    license: ["licenseExpiry", "licenseIssueDate"]
  };
  const keys = map[controlKey];
  if (!keys) return false;
  const ymd = resolveEmployeeComplianceExpiryYmd(employee, keys[0], keys[1], norm);
  if (!ymd) return true;
  return complianceDaysUntilYmd(ymd) < 0;
}

/**
 * @returns {Array<{id:string,type:string,employeeId:string,employeeName:string,controlType:string,controlKey:string,message:string,recordId?:string,suggestedAction:string}>}
 */
export function findSstEmployeeReconciliationIssues(employees, sstRecords) {
  const issues = [];
  const empList = Array.isArray(employees) ? employees : [];
  const records = Array.isArray(sstRecords) ? sstRecords : [];

  for (const record of records) {
    const status = String(record.status || "").trim().toLowerCase();
    if (!status.startsWith("cumpl")) continue;
    const controlKey = resolveSstControlKey(record.recordType);
    if (!controlKey || !getSstControlSpec(controlKey)?.employeePatch) continue;
    const employee = empList.find((row) => String(row.id) === String(record.employeeId || ""));
    if (!employee) continue;
    if (!employeeControlInvalid(employee, controlKey)) continue;
    issues.push({
      id: `desync-${record.id}`,
      type: "desync",
      employeeId: employee.id,
      employeeName: String(employee.name || record.employeeName || "-").trim(),
      controlType: String(record.recordType || "Control SST"),
      controlKey,
      recordId: record.id,
      message: `Control SST marcado Cumplido, pero la ficha del colaborador sigue sin vigencia válida.`,
      suggestedAction: "Renovar con la fecha real del examen o afiliación."
    });
  }

  for (const employee of empList) {
    const checks = [
      ["occupational_exam", "Examen médico ocupacional", "occupationalExamExpiry", "occupationalExamDate"],
      ["instruvial_exam", "Examen instruvial", "instruvialExamExpiry", "instruvialExamDate"],
      ["license", "Licencia de conducción", "licenseExpiry", "licenseIssueDate"]
    ];
    const isDriver = String(employee.workerRole || "").trim().toLowerCase() === "conductor";
    for (const [controlKey, label, expiryKey, dateKey] of checks) {
      if (!isDriver && controlKey !== "occupational_exam") continue;
      const ymd = resolveEmployeeComplianceExpiryYmd(employee, expiryKey, dateKey, normalizePortalDateYmd);
      const invalid = !ymd || complianceDaysUntilYmd(ymd) < 0;
      if (!invalid) continue;
      const pendingRecord = records.find(
        (row) =>
          String(row.employeeId) === String(employee.id) &&
          resolveSstControlKey(row.recordType) === controlKey &&
          !String(row.status || "")
            .trim()
            .toLowerCase()
            .startsWith("cumpl")
      );
      if (pendingRecord) continue;
      issues.push({
        id: `missing-${employee.id}-${controlKey}`,
        type: ymd ? "expired" : "missing",
        employeeId: employee.id,
        employeeName: String(employee.name || "-").trim(),
        controlType: label,
        controlKey,
        message: ymd
          ? `${label} vencido (${ymd}). No hay control SST pendiente registrado.`
          : `${label} sin fecha en la ficha del colaborador.`,
        suggestedAction: "Use Renovar en Vencimientos o registre el control en SST."
      });
    }

    for (const [controlKey, label, field] of [
      ["eps_affiliation", "Afiliación EPS", "eps"],
      ["pension_affiliation", "Afiliación pensión", "pensionFund"],
      ["arl_affiliation", "Afiliación ARL", "arl"]
    ]) {
      if (String(employee[field] || "").trim()) continue;
      issues.push({
        id: `ss-${employee.id}-${controlKey}`,
        type: "missing",
        employeeId: employee.id,
        employeeName: String(employee.name || "-").trim(),
        controlType: label,
        controlKey,
        message: `${label} no registrada en la ficha del colaborador.`,
        suggestedAction: "Renovar afiliación desde SST con la entidad correspondiente."
      });
    }
  }

  const seen = new Set();
  return issues.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

export function readSstReconciliationIssues() {
  return findSstEmployeeReconciliationIssues(read(KEYS.payrollEmployees, []), read(KEYS.sstCompliance, []));
}

export function buildSstDueExportRows(employees, dueItems) {
  return (dueItems || []).map((item) => {
    const employee = (employees || []).find((row) => String(row.id) === String(item.employeeId || ""));
    return {
      empleado: item.employeeName || employee?.name || "-",
      documento: employee?.idDoc || "-",
      control: item.controlType || "-",
      vencimiento: item.dueDate || "Sin programar",
      estado: item.bucket === "expired" ? "Vencido" : item.bucket === "missing" ? "Sin programar" : "Próximo",
      dias: item.days == null ? "-" : String(item.days)
    };
  });
}
