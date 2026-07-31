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
  "soat",
  "certificado_runt"
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

/* ==========================================================================
   Índice documental — filas enriquecidas, orden, versiones y vistas
   ========================================================================== */

/** Secciones del rail del módulo. `scope` distingue índice plano de navegación por expediente. */
export const DOCUMENT_SECTIONS = Object.freeze([
  { id: "overview", label: "Resumen", icon: "grid", scope: "dashboard" },
  { id: "all", label: "Todos los documentos", icon: "file", scope: "index" },
  { id: "recent", label: "Recientes", icon: "clock", scope: "index" },
  { id: "favorites", label: "Favoritos", icon: "star", scope: "index" },
  { id: "due_soon", label: "Por vencer", icon: "alertTriangle", scope: "index" },
  { id: "expired", label: "Vencidos", icon: "alertTriangle", scope: "index" },
  { id: "gaps", label: "Expedientes incompletos", icon: "inbox", scope: "employees" },
  { id: "files", label: "Expedientes", icon: "folder", scope: "employees" }
]);

const SECTION_IDS = new Set(DOCUMENT_SECTIONS.map((s) => s.id));

export function normalizeDocumentSection(value) {
  const raw = String(value || "").trim();
  return SECTION_IDS.has(raw) ? raw : "overview";
}

export function getDocumentSection(id) {
  const key = normalizeDocumentSection(id);
  return DOCUMENT_SECTIONS.find((s) => s.id === key) || DOCUMENT_SECTIONS[0];
}

/** Modos de presentación del listado. */
export const DOCUMENT_VIEW_MODES = Object.freeze(["table", "cards", "list"]);

export function normalizeDocumentViewMode(value) {
  const raw = String(value || "").trim().toLowerCase();
  return DOCUMENT_VIEW_MODES.includes(raw) ? raw : "table";
}

/**
 * Columnas de la tabla avanzada.
 * `priority` marca cuáles sobreviven al reducir el ancho (3 = siempre visible).
 */
export const DOCUMENT_TABLE_COLUMNS = Object.freeze([
  { key: "fileName", label: "Documento", sortable: true, priority: 3, align: "left" },
  { key: "employeeName", label: "Responsable", sortable: true, priority: 3, align: "left" },
  { key: "documentType", label: "Tipo", sortable: true, priority: 2, align: "left" },
  { key: "folder", label: "Categoría", sortable: true, priority: 2, align: "left" },
  { key: "status", label: "Estado", sortable: true, priority: 3, align: "left" },
  { key: "dueDate", label: "Vence", sortable: true, priority: 2, align: "left" },
  { key: "version", label: "Versión", sortable: true, priority: 1, align: "center" },
  { key: "sizeBytes", label: "Tamaño", sortable: true, priority: 1, align: "right" },
  { key: "uploadedBy", label: "Autor", sortable: true, priority: 1, align: "left" },
  { key: "createdAt", label: "Creado", sortable: true, priority: 2, align: "left" },
  { key: "updatedAt", label: "Modificado", sortable: true, priority: 1, align: "left" }
]);

const SORTABLE_KEYS = new Set(DOCUMENT_TABLE_COLUMNS.filter((c) => c.sortable).map((c) => c.key));

export function normalizeDocumentSortKey(value) {
  const raw = String(value || "").trim();
  return SORTABLE_KEYS.has(raw) ? raw : "createdAt";
}

export function normalizeDocumentSortDir(value) {
  return String(value || "").trim().toLowerCase() === "asc" ? "asc" : "desc";
}

/** Orden por defecto de cada columna: fechas y tamaño arrancan descendente, texto ascendente. */
export function defaultSortDirForKey(key) {
  const descFirst = new Set(["createdAt", "updatedAt", "sizeBytes", "version"]);
  return descFirst.has(normalizeDocumentSortKey(key)) ? "desc" : "asc";
}

const STATUS_ORDER = { Vencido: 0, "Por vencer": 1, Vigente: 2 };

/** Grupo visual del archivo, para icono y color de la tarjeta. */
export function documentMimeGroup(mimeType, fileName) {
  const mime = String(mimeType || "").toLowerCase();
  const name = String(fileName || "").toLowerCase();
  if (mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg|heic)$/.test(name)) return "image";
  if (mime.includes("word") || /\.(docx?|odt|rtf)$/.test(name)) return "word";
  if (mime.includes("sheet") || mime.includes("excel") || /\.(xlsx?|csv|ods)$/.test(name)) return "sheet";
  if (mime.includes("presentation") || /\.(pptx?|odp)$/.test(name)) return "slide";
  if (mime.includes("zip") || mime.includes("compressed") || /\.(zip|rar|7z|tar|gz)$/.test(name)) return "archive";
  if (mime.startsWith("text/") || /\.(txt|md|log)$/.test(name)) return "text";
  return "file";
}

export function documentFileExtension(fileName, mimeType) {
  const name = String(fileName || "").trim();
  const idx = name.lastIndexOf(".");
  if (idx > 0 && idx < name.length - 1) return name.slice(idx + 1).toUpperCase().slice(0, 5);
  const group = documentMimeGroup(mimeType, fileName);
  return group === "file" ? "DOC" : group.toUpperCase();
}

/** Fecha ISO/YMD a dd/mm/aaaa; cadena vacía si no hay dato. */
export function formatDocumentDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const ymd = raw.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return raw;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Etiqueta relativa legible para fechas de creación/modificación. */
export function formatDocumentRelative(value, todayYmd) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const days = daysUntilDocumentDue(raw.slice(0, 10), todayYmd);
  if (days === null) return "";
  if (days === 0) return "Hoy";
  if (days === -1) return "Ayer";
  if (days === 1) return "Mañana";
  if (days < 0) {
    const past = Math.abs(days);
    if (past < 30) return `Hace ${past} días`;
    if (past < 365) return `Hace ${Math.round(past / 30)} meses`;
    return `Hace ${Math.round(past / 365)} años`;
  }
  if (days < 30) return `En ${days} días`;
  if (days < 365) return `En ${Math.round(days / 30)} meses`;
  return `En ${Math.round(days / 365)} años`;
}

/** Vencimiento descrito con tono y urgencia, para badges que no dependen solo del color. */
export function describeDocumentDue(dueDate, todayYmd) {
  const due = String(dueDate || "").trim();
  if (!due) return { label: "Sin vencimiento", tone: "neutral", days: null, status: "Vigente" };
  const days = daysUntilDocumentDue(due, todayYmd);
  const status = computeEmployeeDocumentStatus(due, todayYmd);
  if (days === null) return { label: "Sin vencimiento", tone: "neutral", days: null, status };
  if (days < 0) {
    const past = Math.abs(days);
    return { label: `Venció hace ${past} día${past === 1 ? "" : "s"}`, tone: "expired", days, status };
  }
  if (days === 0) return { label: "Vence hoy", tone: "expired", days, status };
  if (status === "Por vencer") {
    return { label: `Vence en ${days} día${days === 1 ? "" : "s"}`, tone: "warn", days, status };
  }
  return { label: `Vigente hasta ${formatDocumentDate(due)}`, tone: "ok", days, status };
}

/**
 * Clave de versión: mismo colaborador, misma carpeta y mismo tipo documental.
 * RRHH resube el mismo tipo al renovarlo, así que esa tripleta es la cadena de versiones.
 */
export function documentVersionKey(doc) {
  const row = normalizeEmployeeDocumentRow(doc);
  return `${row.employeeId}|${documentFolderKey(row.folder)}|${String(row.documentType || "otro")}`;
}

/** Orden cronológico ascendente estable, para numerar versiones v1..vN. */
function compareByUploadAsc(a, b) {
  const at = Date.parse(a.createdAt || a.updatedAt || "") || 0;
  const bt = Date.parse(b.createdAt || b.updatedAt || "") || 0;
  if (at !== bt) return at - bt;
  return String(a.id).localeCompare(String(b.id));
}

/**
 * Agrupa el histórico por cadena de versiones.
 * Devuelve un Map de clave → filas ordenadas de la más antigua (v1) a la más nueva.
 */
export function buildDocumentVersionMap(documents) {
  const map = new Map();
  for (const raw of documents || []) {
    const doc = normalizeEmployeeDocumentRow(raw);
    if (!doc?.id) continue;
    const key = documentVersionKey(doc);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(doc);
  }
  for (const list of map.values()) list.sort(compareByUploadAsc);
  return map;
}

/**
 * Filas enriquecidas para todas las vistas: une documento, colaborador, estado,
 * versión derivada y etiquetas ya formateadas, en una sola pasada.
 */
export function buildDocumentIndexRows(documents, employees, todayYmd) {
  const today = todayYmd || new Date().toISOString().slice(0, 10);
  const empMap = new Map((employees || []).map((e) => [String(e.id), e]));
  const versionMap = buildDocumentVersionMap(documents);
  const versionPos = new Map();
  for (const [key, list] of versionMap.entries()) {
    list.forEach((doc, idx) => {
      versionPos.set(String(doc.id), { index: idx + 1, total: list.length, key });
    });
  }
  return (documents || [])
    .map((raw) => normalizeEmployeeDocumentRow(raw))
    .filter((doc) => doc?.id)
    .map((doc) => {
      const employee = empMap.get(String(doc.employeeId)) || null;
      const version = versionPos.get(String(doc.id)) || { index: 1, total: 1, key: documentVersionKey(doc) };
      const status = computeEmployeeDocumentStatus(doc.dueDate, today);
      const due = describeDocumentDue(doc.dueDate, today);
      return {
        ...doc,
        employee,
        employeeName: doc.employeeName || employee?.name || "Colaborador",
        employeeIdDoc: employee?.idDoc ? String(employee.idDoc) : "",
        employeePosition: employee?.position ? String(employee.position) : "",
        folderName: normalizeDocumentFolder(doc.folder),
        typeLabel: getEmployeeDocumentTypeLabel(doc.documentType),
        status,
        statusTone: status === "Vencido" ? "expired" : status === "Por vencer" ? "warn" : "ok",
        dueLabel: due.label,
        dueTone: due.tone,
        daysToDue: due.days,
        mimeGroup: documentMimeGroup(doc.mimeType, doc.fileName),
        extension: documentFileExtension(doc.fileName, doc.mimeType),
        sizeLabel: formatFileSize(doc.sizeBytes),
        createdLabel: formatDocumentDate(doc.createdAt),
        updatedLabel: formatDocumentDate(doc.updatedAt),
        issueLabel: formatDocumentDate(doc.issueDate),
        dueDateLabel: formatDocumentDate(doc.dueDate),
        createdRelative: formatDocumentRelative(doc.createdAt, today),
        versionIndex: version.index,
        versionCount: version.total,
        versionKey: version.key,
        isCurrentVersion: version.index === version.total
      };
    });
}

/** Ordena filas enriquecidas por cualquier columna de la tabla. */
export function sortDocumentRows(rows, sortKey, sortDir) {
  const key = normalizeDocumentSortKey(sortKey);
  const dir = normalizeDocumentSortDir(sortDir) === "asc" ? 1 : -1;
  const text = (v) => String(v ?? "").toLocaleLowerCase("es");
  const time = (v) => Date.parse(String(v || "")) || 0;
  const compare = (a, b) => {
    switch (key) {
      case "fileName":
        return text(a.fileName).localeCompare(text(b.fileName), "es");
      case "employeeName":
        return text(a.employeeName).localeCompare(text(b.employeeName), "es");
      case "documentType":
        return text(a.typeLabel).localeCompare(text(b.typeLabel), "es");
      case "folder":
        return text(a.folderName).localeCompare(text(b.folderName), "es");
      case "status":
        return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      case "dueDate":
        return time(a.dueDate) - time(b.dueDate);
      case "version":
        return (a.versionIndex || 0) - (b.versionIndex || 0);
      case "sizeBytes":
        return (Number(a.sizeBytes) || 0) - (Number(b.sizeBytes) || 0);
      case "uploadedBy":
        return text(a.uploadedBy).localeCompare(text(b.uploadedBy), "es");
      case "updatedAt":
        return time(a.updatedAt) - time(b.updatedAt);
      case "createdAt":
      default:
        return time(a.createdAt) - time(b.createdAt);
    }
  };
  return [...(rows || [])].sort((a, b) => {
    /* "Sin vencimiento" se hunde al final en ambas direcciones: no es una fecha. */
    if (key === "dueDate") {
      const aEmpty = !a.dueDate;
      const bEmpty = !b.dueDate;
      if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
    }
    const primary = compare(a, b) * dir;
    if (primary !== 0) return primary;
    /* Desempate estable: nombre de archivo y luego id. */
    const byName = text(a.fileName).localeCompare(text(b.fileName), "es");
    return byName !== 0 ? byName : String(a.id).localeCompare(String(b.id));
  });
}

/** Ventana de días que considera "reciente" la vista del mismo nombre. */
export const DOCUMENT_RECENT_DAYS = 30;

/**
 * Aplica la vista inteligente del rail.
 * `favoriteIds` y `recentIds` los aporta la capa de aplicación (preferencias locales).
 */
export function applyDocumentSection(rows, section, { todayYmd, favoriteIds, recentIds } = {}) {
  const list = rows || [];
  switch (normalizeDocumentSection(section)) {
    case "due_soon":
      return list.filter((r) => r.status === "Por vencer");
    case "expired":
      return list.filter((r) => r.status === "Vencido");
    case "favorites": {
      const favs = favoriteIds instanceof Set ? favoriteIds : new Set(favoriteIds || []);
      return list.filter((r) => favs.has(String(r.id)));
    }
    case "recent": {
      const seen = recentIds instanceof Set ? recentIds : new Set(recentIds || []);
      const today = todayYmd || new Date().toISOString().slice(0, 10);
      return list.filter((r) => {
        if (seen.has(String(r.id))) return true;
        const days = daysUntilDocumentDue(String(r.createdAt || "").slice(0, 10), today);
        return days !== null && days <= 0 && Math.abs(days) <= DOCUMENT_RECENT_DAYS;
      });
    }
    default:
      return list;
  }
}

const DATE_FIELD_MAP = {
  created: "createdAt",
  updated: "updatedAt",
  issued: "issueDate",
  due: "dueDate"
};

export function normalizeDocumentDateField(value) {
  const raw = String(value || "").trim();
  return DATE_FIELD_MAP[raw] ? raw : "created";
}

/** Filtros avanzados sobre las filas enriquecidas de `buildDocumentIndexRows`. */
export function applyDocumentAdvancedFilters(rows, filters = {}) {
  const {
    search = "",
    employeeId = "",
    documentType = "",
    folder = "",
    status = "",
    dateField = "created",
    dateFrom = "",
    dateTo = "",
    uploadedBy = "",
    minSizeMb = "",
    maxSizeMb = "",
    onlyCurrentVersions = false
  } = filters;
  let list = rows || [];
  if (employeeId) list = list.filter((r) => String(r.employeeId) === String(employeeId));
  if (documentType) list = list.filter((r) => String(r.documentType) === String(documentType));
  if (folder) {
    const key = documentFolderKey(folder);
    list = list.filter((r) => documentFolderKey(r.folderName) === key);
  }
  if (status) list = list.filter((r) => r.status === status);
  if (uploadedBy) {
    const norm = String(uploadedBy).trim().toLocaleLowerCase("es");
    list = list.filter((r) => String(r.uploadedBy || "").toLocaleLowerCase("es") === norm);
  }
  if (onlyCurrentVersions) list = list.filter((r) => r.isCurrentVersion);
  const field = DATE_FIELD_MAP[normalizeDocumentDateField(dateField)];
  const from = String(dateFrom || "").trim();
  const to = String(dateTo || "").trim();
  if (from) list = list.filter((r) => String(r[field] || "").slice(0, 10) >= from);
  if (to) list = list.filter((r) => String(r[field] || "").slice(0, 10) <= to);
  const min = Number(minSizeMb);
  const max = Number(maxSizeMb);
  if (Number.isFinite(min) && String(minSizeMb).trim() !== "") {
    list = list.filter((r) => (Number(r.sizeBytes) || 0) >= min * 1024 * 1024);
  }
  if (Number.isFinite(max) && String(maxSizeMb).trim() !== "") {
    list = list.filter((r) => (Number(r.sizeBytes) || 0) <= max * 1024 * 1024);
  }
  const norm = String(search || "").trim().toLocaleLowerCase("es");
  if (norm) {
    const terms = norm.split(/\s+/).filter(Boolean);
    list = list.filter((r) => {
      const blob = [
        r.fileName,
        r.employeeName,
        r.employeeIdDoc,
        r.typeLabel,
        r.folderName,
        r.documentCode,
        r.notes,
        r.uploadedBy,
        r.extension,
        r.status
      ]
        .join(" ")
        .toLocaleLowerCase("es");
      return terms.every((t) => blob.includes(t));
    });
  }
  return list;
}

/** Cuenta cuántos filtros avanzados están activos, para el badge del popover. */
export function countActiveDocumentFilters(filters = {}) {
  const keys = [
    "employeeId",
    "documentType",
    "folder",
    "status",
    "dateFrom",
    "dateTo",
    "uploadedBy",
    "minSizeMb",
    "maxSizeMb"
  ];
  let count = keys.reduce((n, k) => n + (String(filters[k] ?? "").trim() ? 1 : 0), 0);
  if (filters.onlyCurrentVersions) count += 1;
  return count;
}

/**
 * Documentos relacionados: primero las otras versiones del mismo tipo,
 * luego el resto de la carpeta y por último el mismo tipo en otros expedientes.
 */
export function findRelatedDocuments(doc, rows, limit = 6) {
  if (!doc?.id) return [];
  const id = String(doc.id);
  const pool = (rows || []).filter((r) => String(r.id) !== id);
  const sameVersionChain = pool.filter((r) => r.versionKey === doc.versionKey);
  const sameFolder = pool.filter(
    (r) =>
      r.versionKey !== doc.versionKey &&
      String(r.employeeId) === String(doc.employeeId) &&
      documentFolderKey(r.folderName) === documentFolderKey(doc.folderName)
  );
  const sameType = pool.filter(
    (r) =>
      String(r.employeeId) !== String(doc.employeeId) &&
      String(r.documentType) === String(doc.documentType)
  );
  const seen = new Set();
  const out = [];
  for (const group of [sameVersionChain, sameFolder, sameType]) {
    for (const row of group) {
      const key = String(row.id);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(row);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** Cadena completa de versiones de un documento, de la más nueva a la más antigua. */
export function getDocumentVersionChain(doc, rows) {
  if (!doc?.versionKey) return [];
  return (rows || [])
    .filter((r) => r.versionKey === doc.versionKey)
    .sort((a, b) => (b.versionIndex || 0) - (a.versionIndex || 0));
}

/** Totales de una selección múltiple, para la barra de acciones masivas. */
export function summarizeDocumentSelection(rows, selectedIds) {
  const ids = selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);
  const picked = (rows || []).filter((r) => ids.has(String(r.id)));
  const employees = new Set(picked.map((r) => String(r.employeeId)));
  const folders = new Set(picked.map((r) => documentFolderKey(r.folderName)));
  return {
    count: picked.length,
    rows: picked,
    sizeBytes: picked.reduce((sum, r) => sum + (Number(r.sizeBytes) || 0), 0),
    employeeCount: employees.size,
    folderCount: folders.size,
    singleEmployeeId: employees.size === 1 ? [...employees][0] : "",
    expired: picked.filter((r) => r.status === "Vencido").length
  };
}

/** Métricas del panel Resumen. */
export function buildDocumentOverview(rows, employees, todayYmd) {
  const list = rows || [];
  const today = todayYmd || new Date().toISOString().slice(0, 10);
  const expired = list.filter((r) => r.status === "Vencido");
  const dueSoon = list.filter((r) => r.status === "Por vencer");
  const withDocs = new Set(list.map((r) => String(r.employeeId)));
  const gapEmployees = (employees || []).filter((emp) => findEmployeeDocumentGaps(emp, list).length > 0);
  const addedLast30 = list.filter((r) => {
    const days = daysUntilDocumentDue(String(r.createdAt || "").slice(0, 10), today);
    return days !== null && days <= 0 && Math.abs(days) <= DOCUMENT_RECENT_DAYS;
  });
  const totalEmployees = (employees || []).length;
  const compliance = totalEmployees
    ? Math.round(((totalEmployees - gapEmployees.length) / totalEmployees) * 100)
    : 100;
  return {
    total: list.length,
    sizeBytes: list.reduce((sum, r) => sum + (Number(r.sizeBytes) || 0), 0),
    expired: expired.length,
    dueSoon: dueSoon.length,
    employeesWithDocs: withDocs.size,
    totalEmployees,
    gapEmployees,
    gapCount: gapEmployees.length,
    addedLast30: addedLast30.length,
    compliance,
    urgent: [...expired, ...dueSoon]
      .sort((a, b) => (a.daysToDue ?? 9999) - (b.daysToDue ?? 9999))
      .slice(0, 8)
  };
}
