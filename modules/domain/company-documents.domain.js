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
  "05. Finanzas",
  "06. Terceros",
  "07. Operación",
  "08. SARLAFT / PTE"
]);

/** Carpeta oculta donde se persiste el catálogo de tipos documentales personalizados. */
export const DOCUMENT_TYPES_CATALOG_FOLDER = ".sistema / tipos-documentales";

/** Entidades parametrizadas a las que se puede clasificar un documento. */
export const COMPANY_DOCUMENT_ENTITY_TYPES = Object.freeze([
  { value: "empleado", label: "Empleado / colaborador" },
  { value: "conductor", label: "Conductor" },
  { value: "vehiculo", label: "Vehículo" },
  { value: "tercero", label: "Tercero" },
  { value: "contrato", label: "Contrato" },
  { value: "proceso", label: "Proceso / área" },
  { value: "sst", label: "Cumplimiento / SST" },
  { value: "operacion", label: "Operación" },
  { value: "otro", label: "Otra entidad" }
]);

/** Procesos de negocio para tipos documentales y evidencias. */
export const COMPANY_DOCUMENT_PROCESSES = Object.freeze([
  { value: "contratacion", label: "Contratación" },
  { value: "rrhh", label: "Recursos humanos" },
  { value: "terceros", label: "Terceros" },
  { value: "cumplimiento", label: "Cumplimiento" },
  { value: "sarlaft", label: "SARLAFT / PTE" },
  { value: "operacion", label: "Operación" },
  { value: "legal", label: "Legal" },
  { value: "finanzas", label: "Finanzas" }
]);

export const DOCUMENT_VALIDITY_STATUSES = Object.freeze([
  { value: "vigente", label: "Vigente" },
  { value: "por_vencer", label: "Por vencer" },
  { value: "vencido", label: "Vencido" },
  { value: "sin_vigencia", label: "Sin vigencia" },
  { value: "archivado", label: "Archivado" }
]);

/** Días de anticipación para alerta “por vencer”. */
export const DOCUMENT_EXPIRY_SOON_DAYS = 30;

/** Tipos/categorías documentales seleccionables al subir (valor corto ≤ 32 chars). */
export const COMPANY_DOCUMENT_CATEGORIES = Object.freeze([
  { value: "cedula", label: "Cédula de ciudadanía", process: "rrhh", area: "identificacion", requiresExpiry: false },
  { value: "foto", label: "Foto del colaborador", process: "rrhh", area: "identificacion", requiresExpiry: false },
  { value: "contrato", label: "Contrato laboral", process: "contratacion", area: "vinculacion", requiresExpiry: false },
  { value: "carta_laboral", label: "Carta / certificación laboral", process: "rrhh", area: "vinculacion", requiresExpiry: false },
  { value: "hoja_vida", label: "Hoja de vida", process: "contratacion", area: "seleccion", requiresExpiry: false },
  { value: "eps", label: "Afiliación EPS", process: "cumplimiento", area: "seguridad_social", requiresExpiry: true },
  { value: "afp", label: "Afiliación pensión (AFP)", process: "cumplimiento", area: "seguridad_social", requiresExpiry: true },
  { value: "arl", label: "Afiliación ARL", process: "cumplimiento", area: "seguridad_social", requiresExpiry: true },
  { value: "examen_ocupacional", label: "Examen médico ocupacional", process: "cumplimiento", area: "sst", requiresExpiry: true },
  { value: "examen_instruvial", label: "Examen instruvial", process: "operacion", area: "conductores", requiresExpiry: true },
  { value: "licencia_conduccion", label: "Licencia de conducción", process: "operacion", area: "conductores", requiresExpiry: true },
  { value: "soat", label: "SOAT", process: "operacion", area: "flota", requiresExpiry: true },
  { value: "certificado_runt", label: "Certificado RUNT", process: "operacion", area: "flota", requiresExpiry: true },
  { value: "certificado_antecedentes", label: "Certificado de antecedentes", process: "rrhh", area: "seleccion", requiresExpiry: true },
  { value: "rut", label: "RUT / documento tributario", process: "terceros", area: "tributario", requiresExpiry: false },
  { value: "cuenta_bancaria", label: "Certificación bancaria", process: "finanzas", area: "pagos", requiresExpiry: false },
  { value: "capacitacion", label: "Certificado de capacitación", process: "rrhh", area: "formacion", requiresExpiry: true },
  { value: "induccion_sst", label: "Inducción SST / seguridad", process: "cumplimiento", area: "sst", requiresExpiry: true },
  { value: "autorizacion_datos", label: "Autorización tratamiento de datos", process: "legal", area: "habeas_data", requiresExpiry: false },
  { value: "form_conocimiento_tercero", label: "Formulario de conocimiento del tercero", process: "sarlaft", area: "kyc", requiresExpiry: true },
  { value: "consulta_listas", label: "Consulta listas restrictivas", process: "sarlaft", area: "kyc", requiresExpiry: true },
  { value: "declaracion_fondos", label: "Declaración de origen de fondos", process: "sarlaft", area: "kyc", requiresExpiry: false },
  { value: "declaracion_pep", label: "Declaración PEP", process: "sarlaft", area: "kyc", requiresExpiry: false },
  { value: "codigo_etica_pte", label: "Código de ética / PTE", process: "sarlaft", area: "pte", requiresExpiry: false },
  { value: "conflicto_intereses", label: "Declaración de conflicto de intereses", process: "sarlaft", area: "pte", requiresExpiry: false },
  { value: "cert_existencia", label: "Certificado de existencia y representación", process: "sarlaft", area: "kyc", requiresExpiry: true },
  { value: "factura", label: "Factura / soporte contable", process: "finanzas", area: "contabilidad", requiresExpiry: false },
  { value: "comprobante_pago", label: "Comprobante de pago / colilla", process: "rrhh", area: "nomina", requiresExpiry: false },
  { value: "poliza", label: "Póliza / seguro", process: "cumplimiento", area: "seguros", requiresExpiry: true },
  { value: "acta", label: "Acta / acuerdo", process: "legal", area: "actas", requiresExpiry: false },
  { value: "otro", label: "Otro documento", process: "", area: "", requiresExpiry: false }
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

/** Etiqueta legible de la plantilla de contrato (oficina / fijo / prestación). */
export function contractTemplateKindLabel(kind = "") {
  const k = String(kind || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (k === "oficina" || k.includes("administrativo")) return "Administrativo de oficina";
  if (k === "fijo" || k.includes("termino")) return "Término fijo";
  if (k === "prestacion" || k.includes("servicios")) return "Prestación de servicios";
  if (!k || k === "contrato") return "Contrato";
  return safeDocNamePart(kind, "Contrato");
}

/** Partículas españolas en minúscula salvo al inicio del nombre. */
const SPANISH_NAME_PARTICLES = new Set(["de", "del", "la", "las", "los", "y", "e", "a", "al", "en", "el"]);

/**
 * Repara texto UTF-8 mal interpretado como Latin-1 (p. ej. “TÃ©rmino” → “Término”, “Â·” → “·”).
 */
export function repairUtf8Mojibake(text = "") {
  let s = String(text || "");
  if (!s || !/[ÃÂâ]/.test(s)) return s;
  try {
    if (typeof TextDecoder !== "undefined") {
      const bytes = Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
      const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      const bad = (t) => (t.match(/[ÃÂâ\uFFFD]/g) || []).length;
      if (decoded && bad(decoded) < bad(s)) s = decoded;
    }
  } catch {
    /* conservar s */
  }
  return s
    .replace(/Â·/g, "·")
    .replace(/Ã©/g, "é")
    .replace(/Ã¨/g, "è")
    .replace(/Ã¡/g, "á")
    .replace(/Ã /g, "à")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã‘/g, "Ñ")
    .replace(/Ã‰/g, "É")
    .replace(/Ã/g, "Á")
    .replace(/Ã/g, "Í")
    .replace(/Ã“/g, "Ó")
    .replace(/Ãš/g, "Ú")
    .replace(/â€”|â€“/g, "—")
    .replace(/â€œ|â€|â€˜|â€™/g, '"');
}

/** Convierte CAMILO_BETANCUR / camilo-betancur → “Camilo Betancur”. */
export function humanizeDocumentNamePart(raw = "") {
  const spaced = repairUtf8Mojibake(String(raw || ""))
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return "";
  return spaced
    .split(" ")
    .map((w, i) => {
      if (!w) return "";
      const lower = w.toLowerCase();
      if (i > 0 && SPANISH_NAME_PARTICLES.has(lower)) return lower;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function employeeDisplayNameForFile(employee = {}) {
  const raw = safeDocNamePart(employee.name || employee.fullName, "colaborador");
  return humanizeDocumentNamePart(raw) || raw;
}

/** Nombre de archivo para el contrato Word en la carpeta del colaborador. */
export function buildEmployeeContractCompanyFileName(employee = {}, kind = "") {
  const name = employeeDisplayNameForFile(employee);
  const tpl = contractTemplateKindLabel(kind || employee.contractTemplateKind || "");
  return `Contrato laboral · ${tpl} · ${name}.docx`;
}

/** Nombre de archivo para carta / certificado laboral en la carpeta del colaborador. */
export function buildEmployeeLaborLetterCompanyFileName(employee = {}, letterKind = "vigente") {
  const name = employeeDisplayNameForFile(employee);
  const kind = String(letterKind || "").toLowerCase() === "retiro" ? "retiro" : "vigente";
  const title = kind === "retiro" ? "Certificado de retiro" : "Carta laboral vigente";
  return `${title} · ${name}.pdf`;
}

/** Nombre de archivo para la foto del colaborador. */
export function buildEmployeePhotoCompanyFileName(employee = {}, ext = "jpg") {
  const name = employeeDisplayNameForFile(employee);
  const e = String(ext || "jpg").replace(/^\./, "").toLowerCase().slice(0, 8) || "jpg";
  return `Foto del colaborador · ${name}.${e}`;
}

/** Quita marcadores internos (`employeeHireDoc=…`, `payrollRun:…`) de la descripción visible. */
export function sanitizeCompanyDocumentDescription(raw = "") {
  let text = repairUtf8Mojibake(String(raw || "")).trim();
  if (!text) return "";
  text = text
    .replace(/(?:^|\s)employeeHireDoc=[^\s·|]+/gi, " ")
    .replace(/(?:^|\s)payrollRun:[^\s·|]+/gi, " ")
    .replace(/\s*[·|]\s*[·|]\s*/g, " · ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[·|\s]+|[·|\s]+$/g, "")
    .trim();
  return text;
}

/**
 * Título/subtítulo para UI (también embellece nombres legacy snake_case).
 * @returns {{ title: string, subtitle: string, ext: string, fullName: string, label: string }}
 */
export function formatCompanyDocumentDisplayName(doc = {}) {
  const rawName = String(doc.fileName || doc.nombre_archivo || "documento").trim() || "documento";
  const fullName = repairUtf8Mojibake(rawName);
  const ext = (extFromFileName(fullName) || "").toLowerCase();
  let base = ext ? fullName.slice(0, -(ext.length + 1)) : fullName;
  base = repairUtf8Mojibake(base).replace(/\s+/g, " ").trim() || "documento";
  const category = getCompanyDocumentCategoryLabel(doc.documentCategory || doc.tags || "");

  const withLabel = (parts) => {
    const title = parts.title || "documento";
    const subtitle = parts.subtitle || "";
    return {
      title,
      subtitle,
      ext: parts.ext || "",
      fullName,
      label: [title, subtitle].filter(Boolean).join(" · ")
    };
  };

  const contractLegacy = base.match(/^contrato_(oficina|fijo|prestacion)_(.+)$/i);
  if (contractLegacy) {
    return withLabel({
      title: `Contrato laboral · ${contractTemplateKindLabel(contractLegacy[1])}`,
      subtitle: humanizeDocumentNamePart(contractLegacy[2]) || category || "Word",
      ext: (ext || "docx").toUpperCase()
    });
  }

  const letterLegacy = base.match(/^carta_laboral_(carta_vigente|certificado_retiro)_(.+)$/i);
  if (letterLegacy) {
    const title =
      letterLegacy[1].toLowerCase() === "certificado_retiro"
        ? "Certificado de retiro"
        : "Carta laboral vigente";
    return withLabel({
      title,
      subtitle: humanizeDocumentNamePart(letterLegacy[2]) || category || "PDF",
      ext: (ext || "pdf").toUpperCase()
    });
  }

  if (base.includes("·")) {
    const parts = base.split("·").map((p) => p.trim()).filter(Boolean);
    // Contrato laboral · Término fijo · Nombre → título con plantilla
    if (/^contrato\s+laboral$/i.test(parts[0] || "") && parts.length >= 2) {
      return withLabel({
        title: `Contrato laboral · ${parts[1]}`,
        subtitle: parts.slice(2).map((p) => humanizeDocumentNamePart(p) || p).join(" · ") || category || (ext ? ext.toUpperCase() : ""),
        ext: (ext || "").toUpperCase()
      });
    }
    const title = parts[0] || base;
    const rest = parts
      .slice(1)
      .map((p) => humanizeDocumentNamePart(p) || p)
      .join(" · ");
    return withLabel({
      title,
      subtitle: rest || category || (ext ? ext.toUpperCase() : ""),
      ext: (ext || "").toUpperCase()
    });
  }

  if (/_/.test(base) && !/\s/.test(base)) {
    return withLabel({
      title: humanizeDocumentNamePart(base) || base,
      subtitle: category || (ext ? ext.toUpperCase() : ""),
      ext: (ext || "").toUpperCase()
    });
  }

  return withLabel({
    title: base,
    subtitle: category || (ext ? ext.toUpperCase() : ""),
    ext: (ext || "").toUpperCase()
  });
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

const ENTITY_TYPE_MAP = new Map(COMPANY_DOCUMENT_ENTITY_TYPES.map((e) => [e.value, e]));
const PROCESS_MAP = new Map(COMPANY_DOCUMENT_PROCESSES.map((p) => [p.value, p]));
const VALIDITY_MAP = new Map(DOCUMENT_VALIDITY_STATUSES.map((s) => [s.value, s]));

export function isHiddenCompanyFolder(path) {
  const k = folderKey(path);
  return k === folderKey(DOCUMENT_TYPES_CATALOG_FOLDER) || k.startsWith(`${folderKey(".sistema")} / `) || k === folderKey(".sistema");
}

export function documentCategorySlug(raw) {
  return String(raw || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
}

function looksLikeCategorySlug(value) {
  const s = String(value || "").trim();
  return /^[a-z][a-z0-9_]{0,31}$/.test(s);
}

export function normalizeDocumentTypeRow(row) {
  if (!row || typeof row !== "object") return row;
  const label = String(row.label || row.nombre || "").trim();
  const value = documentCategorySlug(row.value || row.codigo || label) || "otro";
  return {
    id: String(row.id || value),
    value,
    label: label || value,
    process: String(row.process || row.proceso || "").trim(),
    area: String(row.area || "").trim(),
    requiresExpiry: Boolean(row.requiresExpiry ?? row.requiere_vigencia),
    builtin: Boolean(row.builtin)
  };
}

export function parseDocumentTypesCatalog(rawDescription) {
  const text = String(rawDescription || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.types) ? parsed.types : [];
    return list.map(normalizeDocumentTypeRow).filter((t) => t && t.value);
  } catch {
    return [];
  }
}

export function serializeDocumentTypesCatalog(types = []) {
  return JSON.stringify(
    (types || []).map(normalizeDocumentTypeRow).filter((t) => t && t.value && !t.builtin)
  );
}

export function listCompanyDocumentCategories(customTypes = []) {
  const map = new Map(COMPANY_DOCUMENT_CATEGORIES.map((c) => [c.value, { ...c, builtin: true }]));
  for (const raw of customTypes || []) {
    const t = normalizeDocumentTypeRow(raw);
    if (!t?.value) continue;
    const prev = map.get(t.value);
    map.set(t.value, { ...prev, ...t, builtin: Boolean(prev?.builtin) });
  }
  return [...map.values()];
}

export function findCompanyDocumentCategory(value, customTypes = []) {
  const key = String(value || "").trim();
  if (!key) return null;
  return listCompanyDocumentCategories(customTypes).find((c) => c.value === key) || CATEGORY_MAP.get(key) || null;
}

export function getCompanyDocumentCategoryLabel(value, customTypes = []) {
  const key = String(value || "").trim();
  if (!key) return "";
  return findCompanyDocumentCategory(key, customTypes)?.label || key;
}

export function getCompanyDocumentEntityTypeLabel(value) {
  const key = String(value || "").trim();
  if (!key) return "";
  return ENTITY_TYPE_MAP.get(key)?.label || key;
}

export function getCompanyDocumentProcessLabel(value) {
  const key = String(value || "").trim();
  if (!key) return "";
  return PROCESS_MAP.get(key)?.label || key;
}

export function getDocumentValidityStatusLabel(value) {
  const key = String(value || "").trim();
  if (!key) return "";
  return VALIDITY_MAP.get(key)?.label || key;
}

function parseDocumentMetaObject(raw) {
  const text = String(raw ?? "").trim();
  if (!text.startsWith("{")) return null;
  try {
    const obj = JSON.parse(text);
    return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : null;
  } catch {
    return null;
  }
}

function emptyDocumentMeta() {
  return {
    documentCategory: "",
    entityType: "",
    entityId: "",
    entityLabel: "",
    issuedAt: "",
    expiresAt: "",
    version: 1,
    versionGroup: "",
    process: "",
    area: "",
    validityStatus: "",
    isCurrentVersion: true,
    documentCode: ""
  };
}

function isoDateOnly(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function parseDocumentMeta(tagsOrCategory) {
  const meta = emptyDocumentMeta();
  const obj = parseDocumentMetaObject(tagsOrCategory);
  if (obj) {
    meta.documentCategory = String(obj.cat || obj.documentCategory || obj.categoria || "").trim();
    meta.entityType = String(obj.entityType || obj.entidadTipo || "").trim();
    meta.entityId = String(obj.entityId || obj.entidadId || "").trim();
    meta.entityLabel = String(obj.entityLabel || obj.entidadEtiqueta || "").trim();
    meta.issuedAt = isoDateOnly(obj.issuedAt || obj.fechaEmision);
    meta.expiresAt = isoDateOnly(obj.expiresAt || obj.fechaVencimiento);
    meta.version = Math.max(1, Number(obj.version) || 1);
    meta.versionGroup = String(obj.versionGroup || obj.grupoVersion || "").trim();
    meta.process = String(obj.process || obj.proceso || "").trim();
    meta.area = String(obj.area || "").trim();
    meta.validityStatus = String(obj.status || obj.validityStatus || obj.estado || "").trim();
    meta.isCurrentVersion = obj.current !== false && obj.isCurrentVersion !== false;
    meta.documentCode = String(obj.documentCode || obj.codigo || "").trim();
    return meta;
  }
  meta.documentCategory = parseDocumentCategory(tagsOrCategory);
  return meta;
}

function hasExtraDocumentMeta(meta) {
  if (!meta) return false;
  return Boolean(
    meta.entityType ||
      meta.entityId ||
      meta.entityLabel ||
      meta.issuedAt ||
      meta.expiresAt ||
      meta.versionGroup ||
      (Number(meta.version) || 1) > 1 ||
      meta.process ||
      meta.area ||
      meta.documentCode ||
      meta.validityStatus === "archivado" ||
      meta.isCurrentVersion === false
  );
}

export function serializeCompanyDocumentTags(doc = {}) {
  const cat = String(doc.documentCategory || "").trim();
  const meta = {
    documentCategory: cat,
    entityType: String(doc.entityType || "").trim(),
    entityId: String(doc.entityId || "").trim(),
    entityLabel: String(doc.entityLabel || "").trim(),
    issuedAt: isoDateOnly(doc.issuedAt),
    expiresAt: isoDateOnly(doc.expiresAt),
    version: Math.max(1, Number(doc.version) || 1),
    versionGroup: String(doc.versionGroup || "").trim(),
    process: String(doc.process || "").trim(),
    area: String(doc.area || "").trim(),
    validityStatus: String(doc.validityStatus || doc.status || "").trim(),
    isCurrentVersion: doc.isCurrentVersion !== false,
    documentCode: String(doc.documentCode || "").trim()
  };
  if (!hasExtraDocumentMeta(meta)) return cat;
  return JSON.stringify({
    v: 1,
    cat,
    entityType: meta.entityType,
    entityId: meta.entityId,
    entityLabel: meta.entityLabel,
    issuedAt: meta.issuedAt,
    expiresAt: meta.expiresAt,
    version: meta.version,
    versionGroup: meta.versionGroup,
    process: meta.process,
    area: meta.area,
    status: meta.validityStatus,
    current: meta.isCurrentVersion,
    documentCode: meta.documentCode
  });
}

/** Extrae categoría documental desde tags/etiquetas o campo dedicado. */
export function parseDocumentCategory(tagsOrCategory) {
  const obj = parseDocumentMetaObject(tagsOrCategory);
  if (obj) {
    const cat = String(obj.cat || obj.documentCategory || "").trim();
    if (cat) return cat;
  }
  const raw = String(tagsOrCategory ?? "").trim();
  if (!raw) return "";
  if (CATEGORY_MAP.has(raw) || looksLikeCategorySlug(raw)) return raw;
  const m = raw.match(/(?:^|,)\s*cat(?:egory|egoria)?\s*[:=]\s*([a-z0-9_]+)/i);
  if (m && (CATEGORY_MAP.has(m[1]) || looksLikeCategorySlug(m[1]))) return m[1];
  const first = raw.split(",")[0].trim();
  return CATEGORY_MAP.has(first) || looksLikeCategorySlug(first) ? first : "";
}

export function computeDocumentValidityStatus(doc = {}, { soonDays = DOCUMENT_EXPIRY_SOON_DAYS, today = "" } = {}) {
  if (String(doc.validityStatus || "").trim() === "archivado") return "archivado";
  const expiresAt = isoDateOnly(doc.expiresAt);
  if (!expiresAt) return "sin_vigencia";
  const now = isoDateOnly(today) || new Date().toISOString().slice(0, 10);
  if (expiresAt < now) return "vencido";
  const soonMs = (Number(soonDays) || DOCUMENT_EXPIRY_SOON_DAYS) * 86400000;
  const limit = new Date(`${now}T00:00:00`);
  const exp = new Date(`${expiresAt}T00:00:00`);
  if (Number.isNaN(limit.getTime()) || Number.isNaN(exp.getTime())) return "vigente";
  if (exp.getTime() - limit.getTime() <= soonMs) return "por_vencer";
  return "vigente";
}

export function companyDocumentVersionKey(doc = {}) {
  const folder = folderKey(doc.folder || "");
  const cat = String(doc.documentCategory || "").trim() || "otro";
  const entityType = String(doc.entityType || "").trim() || "-";
  const entityId = String(doc.entityId || "").trim() || folderKey(doc.entityLabel || "-");
  return `${folder}|${cat}|${entityType}|${entityId}`;
}

export function listDocumentVersionChain(docs = [], target = {}) {
  const group = String(target.versionGroup || "").trim();
  const key = companyDocumentVersionKey(target);
  return (docs || [])
    .filter((d) => {
      if (!d) return false;
      if (group && String(d.versionGroup || "").trim() === group) return true;
      return companyDocumentVersionKey(d) === key;
    })
    .sort((a, b) => (Number(b.version) || 1) - (Number(a.version) || 1) || String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

export function nextDocumentVersionState(docs = [], incoming = {}) {
  const hasEntity = Boolean(String(incoming.entityId || incoming.entityLabel || incoming.versionGroup || "").trim());
  if (!hasEntity) {
    return { version: Math.max(1, Number(incoming.version) || 1), versionGroup: String(incoming.versionGroup || "").trim(), previousIds: [] };
  }
  const chain = listDocumentVersionChain(docs, incoming).filter((d) => String(d.id) !== String(incoming.id || ""));
  const current = chain.find((d) => d.isCurrentVersion !== false) || chain[0] || null;
  const maxVersion = chain.reduce((acc, d) => Math.max(acc, Number(d.version) || 1), 0);
  return {
    version: maxVersion + 1,
    versionGroup: String(current?.versionGroup || incoming.versionGroup || "").trim() || (current?.id || ""),
    previousIds: chain.filter((d) => d.isCurrentVersion !== false).map((d) => d.id)
  };
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

/** Puede previsualizarse en el navegador (PDF/imagen/texto y Word .docx vía conversión HTML). */
export function canPreviewFileType(fileName, mimeType) {
  const g = fileTypeGroup(fileName, mimeType);
  if (g === "pdf" || g === "image" || g === "text") return true;
  const ext = (
    extFromFileName(fileName) ||
    MIME_EXT_MAP[String(mimeType || "").toLowerCase()] ||
    ""
  ).toLowerCase();
  return ext === "docx";
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
  const cleaned = repairUtf8Mojibake(String(raw ?? ""))
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

/** Catálogo personalizado persistido en la carpeta oculta del sistema. */
export function readDocumentTypesFromFolderRecords(folderRecords = []) {
  const rec = (folderRecords || []).find(
    (f) => f && folderKey(f.folderName || f.nombre_carpeta || "") === folderKey(DOCUMENT_TYPES_CATALOG_FOLDER)
  );
  return parseDocumentTypesCatalog(rec?.description ?? rec?.descripcion ?? "");
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
  const fileName =
    repairUtf8Mojibake(String(row.fileName ?? row.nombre_archivo ?? "documento").trim()) || "documento";
  const mimeType = String(row.mimeType ?? row.mime_type ?? "application/octet-stream").trim();
  const folder = repairUtf8Mojibake(
    normalizeCompanyFolder(row.folder ?? row.carpeta ?? DEFAULT_COMPANY_FOLDER)
  );
  const fileKind = fileTypeLabel(fileName, mimeType);
  const rawType = String(row.type ?? row.tipo ?? "").trim();
  const parsedMeta = parseDocumentMeta(row.tags ?? row.etiquetas ?? "");
  /* `tipo` puede ser extensión (PDF) o categoría legacy; priorizar categoría en tags. */
  const documentCategory =
    parseDocumentCategory(
      row.documentCategory ?? row.categoria_documento ?? row.tags ?? row.etiquetas ?? ""
    ) ||
    parsedMeta.documentCategory ||
    (CATEGORY_MAP.has(rawType) ? rawType : "");
  const type = CATEGORY_MAP.has(rawType) ? fileKind : rawType || fileKind;
  const createdAt = row.createdAt ?? row.fecha_creacion ?? new Date().toISOString();
  const updatedAt = row.updatedAt ?? row.fecha_actualizacion ?? createdAt;
  const issuedAt = isoDateOnly(row.issuedAt ?? row.fecha_emision ?? parsedMeta.issuedAt);
  const expiresAt = isoDateOnly(row.expiresAt ?? row.fecha_vencimiento ?? parsedMeta.expiresAt);
  const entityType = String(row.entityType ?? row.entidad_tipo ?? parsedMeta.entityType ?? "").trim();
  const entityId = String(row.entityId ?? row.entidad_id ?? parsedMeta.entityId ?? "").trim();
  const entityLabel = String(row.entityLabel ?? row.entidad_etiqueta ?? parsedMeta.entityLabel ?? "").trim();
  const process = String(row.process ?? row.proceso ?? parsedMeta.process ?? "").trim();
  const area = String(row.area ?? parsedMeta.area ?? "").trim();
  const version = Math.max(1, Number(row.version ?? parsedMeta.version) || 1);
  const versionGroup = String(row.versionGroup ?? row.grupo_version ?? parsedMeta.versionGroup ?? "").trim();
  const isCurrentVersion = row.isCurrentVersion ?? row.es_vigente ?? parsedMeta.isCurrentVersion;
  const documentCode = String(row.documentCode ?? row.codigo_documental ?? parsedMeta.documentCode ?? "").trim();
  const storedStatus = String(row.validityStatus ?? row.status ?? row.estado ?? parsedMeta.validityStatus ?? "").trim();
  const draft = {
    documentCategory,
    entityType,
    entityId,
    entityLabel,
    issuedAt,
    expiresAt,
    version,
    versionGroup,
    process,
    area,
    documentCode,
    isCurrentVersion: isCurrentVersion !== false,
    validityStatus: storedStatus
  };
  const validityStatus =
    storedStatus === "archivado" ? "archivado" : computeDocumentValidityStatus(draft);
  const normalized = {
    id: String(row.id ?? ""),
    companyId: row.companyId ?? row.id_empresa ?? null,
    fileName,
    type,
    documentCategory,
    folder,
    mimeType,
    sizeBytes: Number(row.sizeBytes ?? row.tamano_bytes ?? 0) || 0,
    storageKey: String(row.storageKey ?? row.storage_key ?? "").trim(),
    description: repairUtf8Mojibake(String(row.description ?? row.descripcion ?? "")),
    uploadedBy: String(row.uploadedBy ?? row.subido_por ?? "Portal").trim() || "Portal",
    createdAt: String(createdAt),
    updatedAt: String(updatedAt),
    entityType,
    entityId,
    entityLabel,
    issuedAt,
    expiresAt,
    version,
    versionGroup,
    process,
    area,
    documentCode,
    isCurrentVersion: draft.isCurrentVersion,
    validityStatus
  };
  normalized.tags =
    serializeCompanyDocumentTags(normalized) ||
    documentCategory ||
    String(row.tags ?? row.etiquetas ?? "").trim();
  return normalized;
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

/** Convierte array o cadena separada por comas en ids (uuid/slug) normalizados. */
export function parseIdList(value) {
  return parseRoleList(value);
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
    usersView: parseIdList(row.usersView ?? row.usuarios_ver),
    usersUpload: parseIdList(row.usersUpload ?? row.usuarios_subir),
    usersDelete: parseIdList(row.usersDelete ?? row.usuarios_eliminar),
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

function folderUsersForAction(rec, action) {
  if (!rec) return [];
  if (action === "upload") return rec.usersUpload || [];
  if (action === "delete") return rec.usersDelete || [];
  return rec.usersView || [];
}

/**
 * Rutas donde el usuario está asignado de forma explícita.
 * Ver se implica si también está en subir o eliminar (para poder abrir la carpeta).
 */
export function collectUserFolderGrantPaths(folderRecords = [], userId = "", action = "view") {
  const uid = String(userId ?? "").trim().toLowerCase();
  if (!uid) return [];
  const out = [];
  const seen = new Set();
  for (const rec of folderRecords || []) {
    if (!rec) continue;
    const listed =
      action === "upload"
        ? (rec.usersUpload || []).includes(uid)
        : action === "delete"
          ? (rec.usersDelete || []).includes(uid)
          : (rec.usersView || []).includes(uid) ||
            (rec.usersUpload || []).includes(uid) ||
            (rec.usersDelete || []).includes(uid);
    if (!listed) continue;
    const path = normalizeCompanyFolder(rec.folderName);
    const key = folderKey(path);
    if (!path || seen.has(key)) continue;
    seen.add(key);
    out.push(path);
  }
  return out;
}

/** El usuario tiene al menos una carpeta asignada: solo verá esas (modo exclusivo). */
export function userHasExclusiveFolderGrants(folderRecords = [], userId = "") {
  return collectUserFolderGrantPaths(folderRecords, userId, "view").length > 0;
}

/** Contenido: la ruta es la carpeta concedida o una descendiente. */
export function pathCoveredByFolderGrants(path, grantPaths = []) {
  const p = normalizeCompanyFolder(path);
  return (grantPaths || []).some((g) => folderInSubtree(p, g));
}

/** Navegación: se puede abrir la ruta para llegar a una concesión (ancestro, misma o hija). */
export function pathReachableByFolderGrants(path, grantPaths = []) {
  const p = normalizeCompanyFolder(path);
  return (grantPaths || []).some((g) => folderInSubtree(p, g) || folderInSubtree(g, p));
}

/**
 * Acceso combinado rol + usuario.
 * Si el usuario está en alguna lista `users*`, queda restringido a esas carpetas
 * (y subcarpetas). Si no, aplica la allowlist de roles (vacía = sin restricción).
 * `forContent`: documentos/subida/borrado (no incluye ancestros solo para navegar).
 */
export function actorAllowedInFolder(
  folderRecords,
  path,
  action,
  { role, userId } = {},
  { forContent = false } = {}
) {
  const uid = String(userId ?? "").trim().toLowerCase();
  if (uid && userHasExclusiveFolderGrants(folderRecords, uid)) {
    if (action === "view") {
      const viewGrants = collectUserFolderGrantPaths(folderRecords, uid, "view");
      return forContent
        ? pathCoveredByFolderGrants(path, viewGrants)
        : pathReachableByFolderGrants(path, viewGrants);
    }
    const actionGrants = collectUserFolderGrantPaths(folderRecords, uid, action);
    return pathCoveredByFolderGrants(path, actionGrants);
  }
  return roleAllowedInFolder(folderRecords, path, action, role);
}

/** Todas las rutas de carpeta presentes (documentos + registros de carpeta). */
export function collectAllFolderPaths(docs = [], folderRecords = [], { includeHidden = false } = {}) {
  const set = new Map();
  for (const d of docs) {
    const p = normalizeCompanyFolder(d.folder);
    if (!includeHidden && isHiddenCompanyFolder(p)) continue;
    set.set(folderKey(p), p);
  }
  for (const f of folderRecords) {
    const p = normalizeCompanyFolder(f.folderName);
    if (!includeHidden && isHiddenCompanyFolder(p)) continue;
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
  let dueSoon = 0;
  let expired = 0;
  for (const d of docs) {
    const status = computeDocumentValidityStatus(d);
    if (status === "por_vencer") dueSoon += 1;
    if (status === "vencido") expired += 1;
  }
  return {
    folderCount: folders.length,
    docCount: docs.length,
    totalBytes,
    quotaBytes: COMPANY_STORAGE_QUOTA_BYTES,
    usedPercent: Math.min(100, Math.round((totalBytes / COMPANY_STORAGE_QUOTA_BYTES) * 100)),
    usersWithAccess: Number(usersWithAccess) || 0,
    dueSoonCount: dueSoon,
    expiredCount: expired,
    alertCount: dueSoon + expired
  };
}

function stripAccents(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Filtra por búsqueda (nombre/carpeta/tipo), tipo de archivo, carpeta y metadatos. */
export function applyCompanyDocumentFilters(
  docs = [],
  {
    search = "",
    type = "all",
    folder = "",
    category = "",
    status = "",
    entityType = "",
    entityId = "",
    process = "",
    dateField = "",
    dateFrom = "",
    dateTo = "",
    onlyCurrentVersions = false
  } = {}
) {
  const q = stripAccents(String(search || "").trim());
  const typeFilter = String(type || "all").toLowerCase();
  const filterPath = folder ? normalizeCompanyFolder(folder) : "";
  const catFilter = String(category || "").trim().toLowerCase();
  const statusFilter = String(status || "").trim().toLowerCase();
  const entityTypeFilter = String(entityType || "").trim().toLowerCase();
  const entityIdFilter = String(entityId || "").trim();
  const processFilter = String(process || "").trim().toLowerCase();
  const from = isoDateOnly(dateFrom);
  const to = isoDateOnly(dateTo);
  const field = String(dateField || "").trim().toLowerCase();
  return docs.filter((d) => {
    if (filterPath && !folderInSubtree(d.folder, filterPath)) return false;
    if (typeFilter && typeFilter !== "all") {
      if (fileTypeGroup(d.fileName, d.mimeType) !== typeFilter) return false;
    }
    if (catFilter && catFilter !== "all" && String(d.documentCategory || "").toLowerCase() !== catFilter) return false;
    const validity = computeDocumentValidityStatus(d);
    if (statusFilter && statusFilter !== "all" && validity !== statusFilter) return false;
    if (entityTypeFilter && entityTypeFilter !== "all" && String(d.entityType || "").toLowerCase() !== entityTypeFilter) {
      return false;
    }
    if (entityIdFilter && String(d.entityId || "") !== entityIdFilter) return false;
    if (processFilter && processFilter !== "all" && String(d.process || "").toLowerCase() !== processFilter) return false;
    if (onlyCurrentVersions && d.isCurrentVersion === false) return false;
    if (from || to) {
      const raw =
        field === "expires"
          ? d.expiresAt
          : field === "issued"
            ? d.issuedAt
            : d.updatedAt || d.createdAt;
      const stamp = isoDateOnly(raw);
      if (from && (!stamp || stamp < from)) return false;
      if (to && (!stamp || stamp > to)) return false;
    }
    if (q) {
      const cat = getCompanyDocumentCategoryLabel(d.documentCategory || d.tags || "");
      const entity = `${d.entityLabel || ""} ${getCompanyDocumentEntityTypeLabel(d.entityType)}`;
      const proc = getCompanyDocumentProcessLabel(d.process);
      const hay = `${d.fileName} ${d.folder} ${d.type} ${cat} ${d.description || ""} ${d.uploadedBy || ""} ${entity} ${proc} ${d.documentCode || ""} ${validity}`;
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
    "Tipo documental": getCompanyDocumentCategoryLabel(d.documentCategory || d.tags || ""),
    Carpeta: d.folder,
    Entidad: d.entityLabel || "",
    "Tipo de entidad": getCompanyDocumentEntityTypeLabel(d.entityType),
    Proceso: getCompanyDocumentProcessLabel(d.process),
    Estado: getDocumentValidityStatusLabel(computeDocumentValidityStatus(d)),
    Emisión: d.issuedAt || "",
    Vencimiento: d.expiresAt || "",
    Versión: d.version || 1,
    Código: d.documentCode || "",
    Tamaño: formatFileSize(d.sizeBytes),
    "Subido por": d.uploadedBy,
    "Fecha de modificación": d.updatedAt,
    Descripción: sanitizeCompanyDocumentDescription(d.description || "")
  }));
}
