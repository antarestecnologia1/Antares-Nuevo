/**
 * Catálogos CO para nómina/RRHH, coincidencia de valores guardados y saneo de empleado al persistir.
 * `CO_CATALOGS` vive en `modules/core/config.js`; se reexporta aquí para compatibilidad con `index.html`.
 */
import { CO_CATALOGS } from "../core/config.js";

export { CO_CATALOGS };

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/** Para persistencia en BD/sincronización: sin tildes; ñ → n (ASCII estable). */
export function normalizeLatinForDb(value) {
  if (value == null) return "";
  return String(value)
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N");
}

export function normalizePortalPhoneForStorage(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return "";
  const d = trimmed.replace(/\D/g, "");
  if (!d) return trimmed.replace(/\s+/g, " ").trim();

  let national = d;
  if (d.startsWith("57") && d.length >= 11) {
    national = d.slice(2);
  }

  if (/^\d{10}$/.test(national)) {
    const n = national;
    return `+57 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
  }

  if (d.startsWith("57")) {
    return `+${d}`;
  }

  if (/^\d{11,15}$/.test(d)) {
    return `+${d}`;
  }

  return trimmed.replace(/\s+/g, " ").trim();
}

export function normalizeLatinUpperForDb(value) {
  return normalizeLatinForDb(value).toUpperCase();
}

export function matchCatalogOptionValue(catalog, stored) {
  const s = String(stored || "").trim();
  if (!s) return "";
  const list = Array.isArray(catalog) ? catalog : [];
  const exact = list.find((v) => String(v).trim() === s);
  if (exact) return exact;
  const lower = s.toLowerCase();
  const ci = list.find((v) => String(v).trim().toLowerCase() === lower);
  return ci || s;
}

export function normalizeContractTemplateKind(raw, contractType, workerRole) {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^documentacion\//, "");
  const byFile = {
    "contrato_administrativo_oficina.docx": "oficina",
    contrato_administrativo_oficina: "oficina",
    "contrato_termino_fijo.docx": "fijo",
    contrato_termino_fijo: "fijo",
    "contrato_prestacion_de_servicios.docx": "prestacion",
    contrato_prestacion_de_servicios: "prestacion"
  };
  if (byFile[s]) return byFile[s];
  if (["oficina", "fijo", "prestacion"].includes(s)) return s;
  if (s.includes("termino_fijo") || s.includes("término_fijo")) return "fijo";
  if (s.includes("prestacion")) return "prestacion";
  if (s.includes("oficina") || s.includes("administrativo")) return "oficina";
  if (window.RecruitmentDomain?.inferTemplateKind) {
    return window.RecruitmentDomain.inferTemplateKind(
      String(contractType || "Termino indefinido"),
      String(workerRole || "empleado")
    );
  }
  return "oficina";
}

/**
 * Reglas de persistencia empleado (portal ↔ PostgreSQL empleados_nomina):
 * — MAYÚSCULAS sin tildes: nombre, dirección, contacto emergencia, cargo texto, centro costos, etc.
 * — Catálogo (texto exacto): EPS, banco, tipo contrato, género, plantilla Word (oficina|fijo|prestacion).
 * — Sin mayúsculas forzadas: departamento/ciudad, correo, teléfono, selects de catálogo.
 */
export function sanitizePayrollEmployeeFieldsForPersist(fields) {
  const f = fields && typeof fields === "object" ? { ...fields } : {};
  const wr =
    String(f.workerRole || "").trim() ||
    (String(f.position || "").toLowerCase().includes("conductor") ? "conductor" : "empleado");
  const contractType =
    matchCatalogOptionValue(CO_CATALOGS.contractTypes, f.contractType) ||
    String(f.contractType || "Termino indefinido").trim();
  return {
    ...f,
    name: normalizeLatinUpperForDb(String(f.name || "").trim()),
    documentType: matchCatalogOptionValue(CO_CATALOGS.documentTypes, f.documentType) || String(f.documentType || "CC").trim(),
    gender: matchCatalogOptionValue(CO_CATALOGS.genders, f.gender),
    maritalStatus: matchCatalogOptionValue(CO_CATALOGS.maritalStatus, f.maritalStatus),
    educationLevel: matchCatalogOptionValue(CO_CATALOGS.educationLevel, f.educationLevel),
    bloodType: matchCatalogOptionValue(CO_CATALOGS.bloodTypes, f.bloodType),
    department: normalizeLatinForDb(String(f.department || "").trim()),
    city: normalizeLatinForDb(String(f.city || "").trim()),
    address: normalizeLatinUpperForDb(String(f.address || "").trim()),
    phone: normalizePortalPhoneForStorage(String(f.phone || "").trim()),
    personalEmail: normalizeEmail(String(f.personalEmail || "")),
    emergencyContact: normalizeLatinUpperForDb(String(f.emergencyContact || "").trim()),
    emergencyPhone: normalizePortalPhoneForStorage(String(f.emergencyPhone || "").trim()),
    emergencyRelation: normalizeLatinUpperForDb(String(f.emergencyRelation || "").trim()),
    position: normalizeLatinUpperForDb(String(f.position || "").trim()),
    workerRole: wr,
    contractType,
    costCenter: normalizeLatinUpperForDb(String(f.costCenter || "").trim()),
    payFrequency: matchCatalogOptionValue(CO_CATALOGS.payFrequency, f.payFrequency) || "Mensual",
    arlRiskLevel: matchCatalogOptionValue(CO_CATALOGS.arlRiskLevels, f.arlRiskLevel),
    workSchedule: matchCatalogOptionValue(CO_CATALOGS.workSchedule, f.workSchedule),
    contributorType: matchCatalogOptionValue(CO_CATALOGS.contributorTypes, f.contributorType),
    eps: matchCatalogOptionValue(CO_CATALOGS.eps, f.eps),
    pensionFund: matchCatalogOptionValue(CO_CATALOGS.pensionFunds, f.pensionFund),
    arl: matchCatalogOptionValue(CO_CATALOGS.arl, f.arl),
    severanceFund: matchCatalogOptionValue(CO_CATALOGS.severanceFunds, f.severanceFund),
    compensationFund: matchCatalogOptionValue(CO_CATALOGS.compensationFunds, f.compensationFund),
    bankName: matchCatalogOptionValue(CO_CATALOGS.banks, f.bankName),
    bankAccountType: matchCatalogOptionValue(CO_CATALOGS.accountTypes, f.bankAccountType || "Ahorros"),
    bankAccount: String(f.bankAccount || "").trim(),
    licenseCategory: matchCatalogOptionValue(CO_CATALOGS.licenseCategories, f.licenseCategory),
    contractTemplateKind: normalizeContractTemplateKind(f.contractTemplateKind, contractType, wr),
    illnessDescription:
      String(f.hasIllness || "").toLowerCase() === "si"
        ? normalizeLatinUpperForDb(String(f.illnessDescription || "").trim())
        : ""
  };
}
