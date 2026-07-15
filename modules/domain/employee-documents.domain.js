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
  { value: "certificado_antecedentes", label: "Certificado de antecedentes", icon: "check", requiresExpiry: false },
  { value: "rut", label: "RUT / documento tributario", icon: "file", requiresExpiry: false },
  { value: "cuenta_bancaria", label: "Certificación bancaria", icon: "file", requiresExpiry: false },
  { value: "capacitacion", label: "Certificado de capacitación", icon: "award", requiresExpiry: true },
  { value: "otro", label: "Otro documento", icon: "file", requiresExpiry: false }
]);

export const EMPLOYEE_DOC_DUE_SOON_DAYS = 30;

const TYPE_MAP = new Map(EMPLOYEE_DOCUMENT_TYPES.map((t) => [t.value, t]));

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

export function buildEmployeeDocumentExportRows(documents, employees) {
  const empMap = new Map((employees || []).map((e) => [String(e.id), e]));
  return (documents || []).map((doc) => {
    const row = normalizeEmployeeDocumentRow(doc);
    const emp = empMap.get(String(row.employeeId));
    return {
      Colaborador: row.employeeName || emp?.name || "",
      Documento: emp?.idDoc || "",
      Tipo: getEmployeeDocumentTypeLabel(row.documentType),
      Archivo: row.fileName,
      Vencimiento: row.dueDate || "",
      Estado: row.status,
      Codigo: row.documentCode || "",
      Subido: row.uploadedBy || "",
      Fecha: row.createdAt ? String(row.createdAt).slice(0, 10) : ""
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
