/**
 * Dominio del gestor documental corporativo (DMS general de empresa).
 * Funciones puras: normalización, tipos de archivo, carpetas jerárquicas,
 * resúmenes (KPI), filtros y almacenamiento. Sin dependencias del DOM.
 */

export const COMPANY_DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

/** Cuota de almacenamiento del plan (bytes). 100 GB por defecto. */
export const COMPANY_STORAGE_QUOTA_BYTES = 100 * 1024 * 1024 * 1024;

export const DEFAULT_COMPANY_FOLDER = "General";

export const COMPANY_FOLDER_SEPARATOR = " / ";

/** Carpeta raíz de expedientes por colaborador dentro del DMS corporativo. */
export const EMPLOYEES_ROOT_FOLDER = "01. Empleados";

/** Estructura sugerida de primer nivel. */
export const SUGGESTED_COMPANY_FOLDERS = Object.freeze([
  EMPLOYEES_ROOT_FOLDER,
  "02. Contratación",
  "03. SST",
  "04. Legal",
  "05. Finanzas"
]);

/** Tipos/categorías documentales seleccionables al subir (valor corto ≤ 32 chars). */
export const COMPANY_DOCUMENT_CATEGORIES = Object.freeze([
  { value: "cedula", label: "Cédula de ciudadanía" },
  { value: "foto", label: "Foto del colaborador" },
  { value: "contrato", label: "Contrato laboral" },
  { value: "carta_laboral", label: "Carta / certificación laboral" },
  { value: "hoja_vida", label: "Hoja de vida" },
  { value: "eps", label: "Afiliación EPS" },
  { value: "afp", label: "Afiliación pensión (AFP)" },
  { value: "arl", label: "Afiliación ARL" },
  { value: "examen_ocupacional", label: "Examen médico ocupacional" },
  { value: "examen_instruvial", label: "Examen instruvial" },
  { value: "licencia_conduccion", label: "Licencia de conducción" },
  { value: "soat", label: "SOAT" },
  { value: "certificado_runt", label: "Certificado RUNT" },
  { value: "certificado_antecedentes", label: "Certificado de antecedentes" },
  { value: "rut", label: "RUT / documento tributario" },
  { value: "cuenta_bancaria", label: "Certificación bancaria" },
  { value: "capacitacion", label: "Certificado de capacitación" },
  { value: "induccion_sst", label: "Inducción SST / seguridad" },
  { value: "autorizacion_datos", label: "Autorización tratamiento de datos" },
  { value: "factura", label: "Factura / soporte contable" },
  { value: "comprobante_pago", label: "Comprobante de pago / colilla" },
  { value: "poliza", label: "Póliza / seguro" },
  { value: "acta", label: "Acta / acuerdo" },
  { value: "otro", label: "Otro documento" }
]);

/** Nombre de archivo seguro para un comprobante de nómina en la carpeta del colaborador. */
export function buildPayrollCompanyDocumentFileName(run = {}, typeLabel = "") {
  const safe = (s) =>
    String(s ?? "")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  const period = safe(run.month) || "sin-periodo";
  const kind = safe(typeLabel) || "Nómina";
  return `Comprobante de pago · ${period} · ${kind}.pdf`;
}

/** Tag estable para detectar si un run ya fue archivado en el DMS. */
export function payrollRunDocumentTag(runId) {
  const id = String(runId || "").trim();
  return id ? `payrollRun:${id}` : "";
}

/** Marcador idempotente en descripción: documentos de alta del colaborador. */
export function employeeHireDocumentMarker(employeeId, kind) {
  const id = String(employeeId || "").trim();
  const k = String(kind || "").trim().toLowerCase();
  if (!id || !k) return "";
  return `employeeHireDoc=${k}:${id}`;
}

function safeDocNamePart(s, fallback = "colaborador") {
  return (
    String(s ?? "")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || fallback
  );
}

/** Nombre de archivo para el contrato Word en la carpeta del colaborador. */
export function buildEmployeeContractCompanyFileName(employee = {}, kind = "") {
  const name = safeDocNamePart(employee.name || employee.fullName, "colaborador");
  const tpl = safeDocNamePart(kind || employee.contractTemplateKind || "contrato", "contrato");
  return `Contrato laboral · ${name} · ${tpl}.docx`;
}

/** Nombre de archivo para la foto del colaborador. */
export function buildEmployeePhotoCompanyFileName(employee = {}, ext = "jpg") {
  const name = safeDocNamePart(employee.name || employee.fullName, "colaborador");
  const e = String(ext || "jpg").replace(/^\./, "").toLowerCase().slice(0, 8) || "jpg";
  return `Foto · ${name}.${e}`;
}

/** Mapea tipo del expediente legacy a categoría del DMS corporativo. */
export function mapEmployeeDocumentTypeToCompanyCategory(documentType) {
  const t = String(documentType || "").trim().toLowerCase();
  if (!t) return "otro";
  if (CATEGORY_MAP.has(t)) return t;
  if (t.includes("contrato")) return "contrato";
  if (t.includes("cedula") || t.includes("cédula") || t === "cc") return "cedula";
  if (t.includes("foto") || t.includes("avatar") || t.includes("photo")) return "foto";
  if (t.includes("hoja") || t.includes("cv") || t.includes("vida")) return "hoja_vida";
  if (t.includes("eps")) return "eps";
  if (t.includes("afp") || t.includes("pension")) return "afp";
  if (t.includes("arl")) return "arl";
  if (t.includes("licencia")) return "licencia_conduccion";
  return "otro";
}

const CATEGORY_MAP = new Map(COMPANY_DOCUMENT_CATEGORIES.map((c) => [c.value, c]));

export function getCompanyDocumentCategoryLabel(value) {
  const key = String(value || "").trim();
  if (!key) return "";
  return CATEGORY_MAP.get(key)?.label || key;
}

/** Extrae categoría documental desde tags/etiquetas o campo dedicado. */
export function parseDocumentCategory(tagsOrCategory) {
  const raw = String(tagsOrCategory ?? "").trim();
  if (!raw) return "";
  if (CATEGORY_MAP.has(raw)) return raw;
  const m = raw.match(/(?:^|,)\s*cat(?:egory|egoria)?\s*[:=]\s*([a-z0-9_]+)/i);
  if (m && CATEGORY_MAP.has(m[1])) return m[1];
  const first = raw.split(",")[0].trim();
  return CATEGORY_MAP.has(first) ? first : "";
}

/** Segmento de carpeta seguro a partir del nombre del empleado (sin “/”). */
export function sanitizeEmployeeFolderSegment(name) {
  return String(name || "")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

/** Ruta `01. Empleados / Nombre` o null si el empleado no tiene nombre usable. */
export function employeeCompanyFolderPath(employee) {
  const leaf = sanitizeEmployeeFolderSegment(employee?.name ?? employee?.fullName ?? "");
  if (!leaf) return null;
  return `${EMPLOYEES_ROOT_FOLDER}${COMPANY_FOLDER_SEPARATOR}${leaf}`;
}

/** Rutas de carpeta de empleados que aún no existen en `folderRecords`. */
export function listMissingEmployeeFolderPaths(employees = [], folderRecords = []) {
  const existing = new Set(
    (folderRecords || []).map((f) => folderKey(f.folderName || f.nombre_carpeta || ""))
  );
  const missing = [];
  const seen = new Set();
  for (const emp of employees || []) {
    const path = employeeCompanyFolderPath(emp);
    if (!path) continue;
    const k = folderKey(path);
    if (seen.has(k) || existing.has(k)) continue;
    seen.add(k);
    missing.push(path);
  }
  return missing.sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
}

/** Extensiones agrupadas por familia (para color/ícono del tipo). */
export const COMPANY_DOCUMENT_TYPE_GROUPS = Object.freeze({
  pdf: ["pdf"],
  doc: ["doc", "docx", "odt", "rtf"],
  sheet: ["xls", "xlsx", "csv", "ods"],
  slide: ["ppt", "pptx", "odp"],
  image: ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "heic"],
  archive: ["zip", "rar", "7z", "tar", "gz"],
  text: ["txt", "md", "log"]
});

export function extFromFileName(name) {
  const safe = String(name || "").trim();
  const idx = safe.lastIndexOf(".");
  if (idx <= 0 || idx >= safe.length - 1) return "";
  return safe.slice(idx + 1).toLowerCase().slice(0, 12);
}

const MIME_EXT_MAP = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "text/plain": "txt",
  "text/csv": "csv",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/zip": "zip"
};

/** Etiqueta corta del tipo (PDF, DOCX, XLSX…) a partir del nombre/mime. */
export function fileTypeLabel(fileName, mimeType) {
  const ext = extFromFileName(fileName) || MIME_EXT_MAP[String(mimeType || "").toLowerCase()] || "";
  return (ext || "archivo").toUpperCase();
}

/** Familia visual del tipo, para colorear ícono. */
export function fileTypeGroup(fileName, mimeType) {
  const ext = (extFromFileName(fileName) || MIME_EXT_MAP[String(mimeType || "").toLowerCase()] || "").toLowerCase();
  for (const [group, exts] of Object.entries(COMPANY_DOCUMENT_TYPE_GROUPS)) {
    if (exts.includes(ext)) return group;
  }
  return "other";
}

/** Puede previsualizarse en el navegador. */
export function canPreviewFileType(fileName, mimeType) {
  const g = fileTypeGroup(fileName, mimeType);
  return g === "pdf" || g === "image" || g === "text";
}

export function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = n;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const decimals = value >= 100 || idx <= 1 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(decimals)} ${units[idx]}`;
}

/** Ruta de carpeta normalizada (segmentos con " / "). */
export function normalizeCompanyFolder(raw) {
  const cleaned = String(raw ?? "")
    .replace(/\\/g, "/")
    .split("/")
    .map((seg) => seg.trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .slice(0, 6)
    .join(COMPANY_FOLDER_SEPARATOR)
    .trim();
  return cleaned || DEFAULT_COMPANY_FOLDER;
}

export function folderSegments(path) {
  return normalizeCompanyFolder(path)
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Primer segmento (carpeta principal). */
export function topFolderName(path) {
  return folderSegments(path)[0] || DEFAULT_COMPANY_FOLDER;
}

/** Clave de comparación insensible a mayúsculas/acentos. */
export function folderKey(path) {
  return normalizeCompanyFolder(path)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** True si `docFolder` es igual o descendiente de `filterPath`. */
export function folderInSubtree(docFolder, filterPath) {
  const dk = folderKey(docFolder);
  const fk = folderKey(filterPath);
  if (!fk) return true;
  return dk === fk || dk.startsWith(`${fk} / `);
}

/** Último segmento (nombre visible) de una ruta. */
export function folderLeafName(path) {
  const segs = folderSegments(path);
  return segs[segs.length - 1] || DEFAULT_COMPANY_FOLDER;
}

export function normalizeCompanyDocumentRow(row) {
  if (!row || typeof row !== "object") return row;
  const fileName = String(row.fileName ?? row.nombre_archivo ?? "documento").trim() || "documento";
  const mimeType = String(row.mimeType ?? row.mime_type ?? "application/octet-stream").trim();
  const folder = normalizeCompanyFolder(row.folder ?? row.carpeta ?? DEFAULT_COMPANY_FOLDER);
  const fileKind = fileTypeLabel(fileName, mimeType);
  const rawType = String(row.type ?? row.tipo ?? "").trim();
  /* `tipo` puede ser extensión (PDF) o categoría legacy; priorizar categoría en tags. */
  const documentCategory = parseDocumentCategory(
    row.documentCategory ?? row.categoria_documento ?? row.tags ?? row.etiquetas ?? ""
  ) || (CATEGORY_MAP.has(rawType) ? rawType : "");
  const type = CATEGORY_MAP.has(rawType) ? fileKind : rawType || fileKind;
  const createdAt = row.createdAt ?? row.fecha_creacion ?? new Date().toISOString();
  const updatedAt = row.updatedAt ?? row.fecha_actualizacion ?? createdAt;
  return {
    id: String(row.id ?? ""),
    companyId: row.companyId ?? row.id_empresa ?? null,
    fileName,
    type,
    documentCategory,
    folder,
    mimeType,
    sizeBytes: Number(row.sizeBytes ?? row.tamano_bytes ?? 0) || 0,
    storageKey: String(row.storageKey ?? row.storage_key ?? "").trim(),
    description: row.description ?? row.descripcion ?? "",
    tags: documentCategory || String(row.tags ?? row.etiquetas ?? "").trim(),
    uploadedBy: String(row.uploadedBy ?? row.subido_por ?? "Portal").trim() || "Portal",
    createdAt: String(createdAt),
    updatedAt: String(updatedAt)
  };
}

/** Acciones con permiso por carpeta. */
export const FOLDER_PERMISSION_ACTIONS = Object.freeze(["view", "upload", "delete"]);

/** Convierte array o cadena separada por comas en lista de slugs de rol normalizados. */
export function parseRoleList(value) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(",");
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const slug = String(item ?? "").trim().toLowerCase();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

export function normalizeCompanyFolderRow(row) {
  if (!row || typeof row !== "object") return row;
  return {
    id: String(row.id ?? ""),
    companyId: row.companyId ?? row.id_empresa ?? null,
    folderName: normalizeCompanyFolder(row.folderName ?? row.nombre_carpeta ?? ""),
    description: row.description ?? row.descripcion ?? "",
    rolesView: parseRoleList(row.rolesView ?? row.roles_ver),
    rolesUpload: parseRoleList(row.rolesUpload ?? row.roles_subir),
    rolesDelete: parseRoleList(row.rolesDelete ?? row.roles_eliminar),
    createdBy: String(row.createdBy ?? row.creado_por ?? "Portal").trim() || "Portal",
    createdAt: String(row.createdAt ?? row.fecha_creacion ?? new Date().toISOString())
  };
}

/** Registro de carpeta cuyo nombre coincide con la carpeta principal de `path` (o null). */
export function topFolderRecord(folderRecords = [], path = "") {
  const topK = folderKey(topFolderName(path));
  return (
    folderRecords.find((f) => f && folderKey(topFolderName(f.folderName)) === topK && folderSegments(f.folderName).length === 1) ||
    folderRecords.find((f) => f && folderKey(topFolderName(f.folderName)) === topK) ||
    null
  );
}

/** Lista de roles permitidos para una acción en la carpeta principal de `path` ([] = sin restricción). */
export function folderRoleAllowlist(folderRecords = [], path = "", action = "view") {
  const rec = topFolderRecord(folderRecords, path);
  if (!rec) return [];
  if (action === "upload") return rec.rolesUpload || [];
  if (action === "delete") return rec.rolesDelete || [];
  return rec.rolesView || [];
}

/**
 * Evalúa si un rol pasa el filtro por carpeta para una acción.
 * `hasGlobalCapability` debe evaluarse aparte (los permisos por carpeta solo restringen).
 * Allowlist vacía = sin restricción. Admin/manage-all deben cortocircuitar antes.
 */
export function roleAllowedInFolder(folderRecords, path, action, role) {
  const allow = folderRoleAllowlist(folderRecords, path, action);
  if (!allow.length) return true;
  return allow.includes(String(role ?? "").trim().toLowerCase());
}

/** Todas las rutas de carpeta presentes (documentos + registros de carpeta). */
export function collectAllFolderPaths(docs = [], folderRecords = []) {
  const set = new Map();
  for (const d of docs) {
    const p = normalizeCompanyFolder(d.folder);
    set.set(folderKey(p), p);
  }
  for (const f of folderRecords) {
    const p = normalizeCompanyFolder(f.folderName);
    set.set(folderKey(p), p);
  }
  return [...set.values()].sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Carpetas principales (primer segmento) con conteo de subcarpetas, archivos y peso.
 */
export function collectTopFolders(docs = [], folderRecords = []) {
  const paths = collectAllFolderPaths(docs, folderRecords);
  const map = new Map();
  for (const path of paths) {
    const segs = folderSegments(path);
    const top = segs[0] || DEFAULT_COMPANY_FOLDER;
    const key = folderKey(top);
    if (!map.has(key)) {
      map.set(key, { name: top, key, subfolders: new Set(), docCount: 0, sizeBytes: 0 });
    }
    if (segs.length > 1) map.get(key).subfolders.add(folderKey(segs.slice(1).join(" / ")));
  }
  for (const d of docs) {
    const top = topFolderName(d.folder);
    const key = folderKey(top);
    if (!map.has(key)) {
      map.set(key, { name: top, key, subfolders: new Set(), docCount: 0, sizeBytes: 0 });
    }
    const entry = map.get(key);
    entry.docCount += 1;
    entry.sizeBytes += Number(d.sizeBytes) || 0;
  }
  return [...map.values()]
    .map((e) => ({
      name: e.name,
      key: e.key,
      subfolderCount: e.subfolders.size,
      docCount: e.docCount,
      sizeBytes: e.sizeBytes
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }));
}

/** Subcarpetas inmediatas (hijas directas) bajo `parentPath`, con conteos. */
export function collectSubfolders(docs = [], folderRecords = [], parentPath = "") {
  const parent = normalizeCompanyFolder(parentPath);
  const depth = folderSegments(parent).length;
  const parentK = folderKey(parent);
  const map = new Map();
  const ensure = (segs) => {
    const childPath = segs.slice(0, depth + 1).join(" / ");
    const k = folderKey(childPath);
    if (!map.has(k)) map.set(k, { name: segs[depth], path: childPath, key: k, docCount: 0, sizeBytes: 0 });
    return map.get(k);
  };
  for (const p of collectAllFolderPaths(docs, folderRecords)) {
    const segs = folderSegments(p);
    if (segs.length <= depth) continue;
    if (folderKey(segs.slice(0, depth).join(" / ")) !== parentK) continue;
    ensure(segs);
  }
  for (const d of docs) {
    const segs = folderSegments(d.folder);
    if (segs.length <= depth) continue;
    if (folderKey(segs.slice(0, depth).join(" / ")) !== parentK) continue;
    const e = ensure(segs);
    e.docCount += 1;
    e.sizeBytes += Number(d.sizeBytes) || 0;
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }));
}

export function totalStorageBytes(docs = []) {
  return docs.reduce((acc, d) => acc + (Number(d.sizeBytes) || 0), 0);
}

/** KPIs del encabezado. */
export function summarizeCompanyDocuments(docs = [], folderRecords = [], usersWithAccess = 0) {
  const folders = collectTopFolders(docs, folderRecords);
  const totalBytes = totalStorageBytes(docs);
  return {
    folderCount: folders.length,
    docCount: docs.length,
    totalBytes,
    quotaBytes: COMPANY_STORAGE_QUOTA_BYTES,
    usedPercent: Math.min(100, Math.round((totalBytes / COMPANY_STORAGE_QUOTA_BYTES) * 100)),
    usersWithAccess: Number(usersWithAccess) || 0
  };
}

function stripAccents(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Filtra por búsqueda (nombre/carpeta/tipo), tipo de archivo y carpeta principal. */
export function applyCompanyDocumentFilters(docs = [], { search = "", type = "all", folder = "" } = {}) {
  const q = stripAccents(String(search || "").trim());
  const typeFilter = String(type || "all").toLowerCase();
  const filterPath = folder ? normalizeCompanyFolder(folder) : "";
  return docs.filter((d) => {
    if (filterPath && !folderInSubtree(d.folder, filterPath)) return false;
    if (typeFilter && typeFilter !== "all") {
      if (fileTypeGroup(d.fileName, d.mimeType) !== typeFilter) return false;
    }
    if (q) {
      const cat = getCompanyDocumentCategoryLabel(d.documentCategory || d.tags || "");
      const hay = `${d.fileName} ${d.folder} ${d.type} ${cat} ${d.description || ""} ${d.uploadedBy || ""}`;
      if (!stripAccents(hay).includes(q)) return false;
    }
    return true;
  });
}

export function sortByRecent(docs = []) {
  return [...docs].sort((a, b) => {
    const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return tb - ta;
  });
}

/** Filas para exportación CSV. */
export function buildCompanyDocumentExportRows(docs = []) {
  return docs.map((d) => ({
    Archivo: d.fileName,
    Tipo: d.type,
    Carpeta: d.folder,
    Tamaño: formatFileSize(d.sizeBytes),
    "Subido por": d.uploadedBy,
    "Fecha de modificación": d.updatedAt,
    Descripción: d.description || ""
  }));
}
