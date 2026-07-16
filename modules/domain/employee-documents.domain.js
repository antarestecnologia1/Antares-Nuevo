/** Catálogo y utilidades del expediente documental por colaborador. */

export const EMPLOYEE_DOCUMENT_TYPES = Object.freeze([
  { value: "cedula", label: "Cédula de ciudadanía", icon: "id", requiresExpiry: false },
  { value: "contrato", label: "Contrato laboral", icon: "file", requiresExpiry: true },
  { value: "hoja_vida", label: "Hoja de vida", icon: "file", requiresExpiry: false },
  { value: "eps", label: "Afiliación EPS", icon: "shield", requiresExpiry: true },
  { value: "afp", label: "Afiliación pensión (AFP)", icon: "shield", requiresExpiry: true },
  { value: "arl", label: "Afiliación ARL", icon: "shield", requiresExpiry: true },
  { value: "examen_ocupacional", label: "Examen médico ocupacional", icon: "activity", requiresExpiry: true },
  { value: "examen_instruvial", label: "Examen instruvial", icon: "activity", requiresExpiry: true },
  { value: "licencia_conduccion", label: "Licencia de conducción", icon: "truck", requiresExpiry: true },
  { value: "soat", label: "SOAT (conductores)", icon: "truck", requiresExpiry: true, conductorOnly: true },
  { value: "certificado_runt", label: "Certificado RUNT / licencia tránsito", icon: "truck", requiresExpiry: true, conductorOnly: true },
  { value: "certificado_antecedentes", label: "Certificado de antecedentes", icon: "check", requiresExpiry: false },
  { value: "rut", label: "RUT / documento tributario", icon: "file", requiresExpiry: false },
  { value: "cuenta_bancaria", label: "Certificación bancaria", icon: "file", requiresExpiry: false },
  { value: "capacitacion", label: "Certificado de capacitación", icon: "award", requiresExpiry: true },
  { value: "induccion_sst", label: "Inducción SST / seguridad", icon: "shield", requiresExpiry: true },
  { value: "autorizacion_datos", label: "Autorización tratamiento de datos", icon: "file", requiresExpiry: false },
  { value: "otro", label: "Otro documento", icon: "file", requiresExpiry: false }
]);

/** Documentos mínimos esperados en expediente completo (checklist global). */
export const CORE_EMPLOYEE_DOCUMENT_TYPES = Object.freeze([
  "cedula",
  "contrato",
  "hoja_vida",
  "eps",
  "afp",
  "arl",
  "examen_ocupacional"
]);

export const CONDUCTOR_EXTRA_DOCUMENT_TYPES = Object.freeze([
  "licencia_conduccion",
  "examen_instruvial",
  "soat"
]);

export const EMPLOYEE_DOC_DUE_SOON_DAYS = 30;

export const DEFAULT_EMPLOYEE_DOCUMENT_FOLDER = "General";

export const EMPLOYEE_DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

const TYPE_MAP = new Map(EMPLOYEE_DOCUMENT_TYPES.map((t) => [t.value, t]));

/** Clave estable para comparar carpetas sin importar mayúsculas. */
export function documentFolderKey(name) {
  return normalizeDocumentFolder(name).toLocaleLowerCase("es");
}

/**
 * Normaliza nombre de carpeta: trim, espacios únicos y Mayúscula Inicial por palabra.
 * Unifica variantes de "General" / "general" / "GENERAL".
 */
export function normalizeDocumentFolder(name) {
  const cleaned = String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 128);
  if (!cleaned) return DEFAULT_EMPLOYEE_DOCUMENT_FOLDER;
  const titled = cleaned
    .toLocaleLowerCase("es")
    .replace(/(^|[\s/._-]+)(\S)/g, (_, sep, ch) => `${sep}${ch.toLocaleUpperCase("es")}`);
  if (titled.toLocaleLowerCase("es") === DEFAULT_EMPLOYEE_DOCUMENT_FOLDER.toLocaleLowerCase("es")) {
    return DEFAULT_EMPLOYEE_DOCUMENT_FOLDER;
  }
  return titled;
}

export function normalizeEmployeeDocumentFolderRow(row) {
  if (!row || typeof row !== "object") return row;
  return {
    id: String(row.id || ""),
    employeeId: String(row.employeeId || row.id_empleado || ""),
    employeeName: String(row.employeeName || row.nombre_empleado || "").trim(),
    folderName: normalizeDocumentFolder(row.folderName ?? row.nombre_carpeta ?? ""),
    createdBy: String(row.createdBy || row.creado_por || "Portal").trim(),
    createdAt: row.createdAt || row.fecha_creacion || null
  };
}

export function employeeHasFolderRecord(employeeId, folderName, documents, folderRecords) {
  const id = String(employeeId || "");
  const folderKey = documentFolderKey(folderName);
  if (!id) return false;
  const inDocs = (documents || []).some((raw) => {
    const doc = normalizeEmployeeDocumentRow(raw);
    return String(doc.employeeId) === id && documentFolderKey(doc.folder) === folderKey;
  });
  if (inDocs) return true;
  return (folderRecords || []).some((raw) => {
    const row = normalizeEmployeeDocumentFolderRow(raw);
    return String(row.employeeId) === id && documentFolderKey(row.folderName) === folderKey;
  });
}

export function buildEmployeeDocumentFolderRecord(employeeId, folderName, employeeName, createdBy) {
  return normalizeEmployeeDocumentFolderRow({
    id: "",
    employeeId,
    employeeName: String(employeeName || "Colaborador").trim(),
    folderName: normalizeDocumentFolder(folderName),
    createdBy: String(createdBy || "Portal").trim(),
    createdAt: new Date().toISOString()
  });
}

export function collectEmployeeFolders(employeeId, documents, folderRecords) {
  const id = String(employeeId || "");
  const byKey = new Map();
  const remember = (rawName) => {
    const canonical = normalizeDocumentFolder(rawName);
    const key = documentFolderKey(canonical);
    if (!byKey.has(key)) byKey.set(key, canonical);
  };
  for (const d of documents || []) {
    const doc = normalizeEmployeeDocumentRow(d);
    if (String(doc.employeeId) === id) remember(doc.folder);
  }
  for (const raw of folderRecords || []) {
    const folder = normalizeEmployeeDocumentFolderRow(raw);
    if (String(folder.employeeId) === id) remember(folder.folderName);
  }
  if (!byKey.size) byKey.set(documentFolderKey(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER), DEFAULT_EMPLOYEE_DOCUMENT_FOLDER);
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, "es"));
}

export function countDocumentsInFolder(employeeId, folderName, documents) {
  const id = String(employeeId || "");
  const folderKey = documentFolderKey(folderName);
  return (documents || [])
    .map(normalizeEmployeeDocumentRow)
    .filter((d) => String(d.employeeId) === id && documentFolderKey(d.folder) === folderKey).length;
}

export function getEmployeeDocumentTypeLabel(type) {
  return TYPE_MAP.get(String(type || "").trim())?.label || String(type || "Documento");
}

export function employeeDocumentTypeRequiresExpiry(type) {
  return Boolean(TYPE_MAP.get(String(type || "").trim())?.requiresExpiry);
}

export function normalizeEmployeeDocumentRow(row) {
  if (!row || typeof row !== "object") return row;
  const dueDate = row.dueDate ?? row.expiryDate ?? row.fecha_vencimiento ?? null;
  return {
    ...row,
    id: String(row.id || ""),
    employeeId: String(row.employeeId || row.id_empleado || ""),
    employeeName: String(row.employeeName || row.nombre_empleado || "").trim(),
    documentType: String(row.documentType || row.tipo_documento || "otro").trim(),
    folder: normalizeDocumentFolder(row.folder ?? row.carpeta ?? ""),
    fileName: String(row.fileName || row.nombre_archivo || "").trim(),
    mimeType: String(row.mimeType || row.mime_type || "application/octet-stream").trim(),
    sizeBytes: Number(row.sizeBytes ?? row.tamano_bytes ?? 0) || 0,
    storageKey: String(row.storageKey || row.storage_key || "").trim(),
    issueDate: row.issueDate ?? row.fecha_emision ?? null,
    dueDate: dueDate || null,
    expiryDate: dueDate || null,
    status: String(row.status || row.estado || "Vigente").trim(),
    documentCode: row.documentCode ?? row.codigo_documental ?? "",
    notes: row.notes ?? row.observaciones ?? "",
    uploadedBy: String(row.uploadedBy || row.subido_por || "Portal").trim(),
    createdAt: row.createdAt || row.fecha_creacion || null,
    updatedAt: row.updatedAt || row.fecha_actualizacion || null
  };
}

export function computeEmployeeDocumentStatus(dueDateYmd, todayYmd, dueSoonDays = EMPLOYEE_DOC_DUE_SOON_DAYS) {
  const due = String(dueDateYmd || "").trim();
  if (!due) return "Vigente";
  const today = String(todayYmd || "").trim();
  if (!today) return "Vigente";
  const expTs = new Date(`${due}T12:00:00`).getTime();
  const todayTs = new Date(`${today}T12:00:00`).getTime();
  if (!Number.isFinite(expTs) || !Number.isFinite(todayTs)) return "Vigente";
  const days = Math.floor((expTs - todayTs) / 86400000);
  if (days < 0) return "Vencido";
  if (days <= dueSoonDays) return "Por vencer";
  return "Vigente";
}

export function daysUntilDocumentDue(dueDateYmd, todayYmd) {
  const due = String(dueDateYmd || "").trim();
  if (!due) return null;
  const today = String(todayYmd || "").trim() || new Date().toISOString().slice(0, 10);
  const expTs = new Date(`${due}T12:00:00`).getTime();
  const todayTs = new Date(`${today}T12:00:00`).getTime();
  if (!Number.isFinite(expTs) || !Number.isFinite(todayTs)) return null;
  return Math.floor((expTs - todayTs) / 86400000);
}

export function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildEmployeeDocumentExportRows(documents, employees, todayYmd) {
  const empMap = new Map((employees || []).map((e) => [String(e.id), e]));
  const today = todayYmd || new Date().toISOString().slice(0, 10);
  return (documents || []).map((doc) => {
    const row = normalizeEmployeeDocumentRow(doc);
    const emp = empMap.get(String(row.employeeId));
    return {
      Colaborador: row.employeeName || emp?.name || "",
      Documento: emp?.idDoc || "",
      Tipo: getEmployeeDocumentTypeLabel(row.documentType),
      Carpeta: normalizeDocumentFolder(row.folder),
      Archivo: row.fileName,
      Vencimiento: row.dueDate || "",
      Estado: computeEmployeeDocumentStatus(row.dueDate, today),
      Codigo: row.documentCode || "",
      "Subido por": row.uploadedBy || "",
      "Fecha subida": row.createdAt ? String(row.createdAt).slice(0, 10) : ""
    };
  });
}

export function summarizeEmployeeDocuments(documents, todayYmd) {
  const list = (documents || []).map(normalizeEmployeeDocumentRow);
  let expired = 0;
  let dueSoon = 0;
  let total = list.length;
  const byEmployee = new Set();
  for (const doc of list) {
    byEmployee.add(String(doc.employeeId));
    const status = computeEmployeeDocumentStatus(doc.dueDate, todayYmd);
    if (status === "Vencido") expired += 1;
    else if (status === "Por vencer") dueSoon += 1;
  }
  return { total, expired, dueSoon, employeesWithDocs: byEmployee.size };
}

export function isConductorForDocuments(employee) {
  return String(employee?.workerRole || "").trim().toLowerCase() === "conductor";
}

export function expectedDocumentTypesForEmployee(employee) {
  const base = [...CORE_EMPLOYEE_DOCUMENT_TYPES];
  if (isConductorForDocuments(employee)) return [...base, ...CONDUCTOR_EXTRA_DOCUMENT_TYPES];
  return base;
}

export function findEmployeeDocumentGaps(employee, documents) {
  const empId = String(employee?.id || "");
  if (!empId) return [];
  const present = new Set(
    (documents || [])
      .map(normalizeEmployeeDocumentRow)
      .filter((d) => String(d.employeeId) === empId)
      .map((d) => String(d.documentType))
  );
  return expectedDocumentTypesForEmployee(employee).filter((t) => !present.has(t));
}

export function countEmployeesWithDocumentGaps(employees, documents) {
  let count = 0;
  for (const emp of employees || []) {
    if (findEmployeeDocumentGaps(emp, documents).length > 0) count += 1;
  }
  return count;
}

export function applyDocumentListFilters(documents, filters, todayYmd) {
  const {
    searchNorm = "",
    employeeId = "",
    typeFilter = "",
    statusFilter = "",
    folderFilter = "",
    dataSection = "all"
  } = filters || {};
  let list = (documents || []).map(normalizeEmployeeDocumentRow);
  if (employeeId) list = list.filter((d) => String(d.employeeId) === String(employeeId));
  if (typeFilter) list = list.filter((d) => String(d.documentType) === String(typeFilter));
  if (folderFilter) {
    const folderKey = documentFolderKey(folderFilter);
    list = list.filter((d) => documentFolderKey(d.folder) === folderKey);
  }
  if (statusFilter) {
    list = list.filter((d) => computeEmployeeDocumentStatus(d.dueDate, todayYmd) === statusFilter);
  } else if (dataSection === "expired") {
    list = list.filter((d) => computeEmployeeDocumentStatus(d.dueDate, todayYmd) === "Vencido");
  } else if (dataSection === "due_soon") {
    list = list.filter((d) => computeEmployeeDocumentStatus(d.dueDate, todayYmd) === "Por vencer");
  }
  if (searchNorm) {
    const norm = String(searchNorm).trim().toLowerCase();
    list = list.filter((doc) => {
      const blob = [
        doc.employeeName,
        doc.fileName,
        getEmployeeDocumentTypeLabel(doc.documentType),
        normalizeDocumentFolder(doc.folder),
        doc.documentCode,
        doc.notes,
        doc.uploadedBy
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(norm);
    });
  }
  return list;
}
