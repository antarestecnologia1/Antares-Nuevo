/**
 * Trazabilidad unificada del portal: catálogo canónico de los 18 módulos,
 * normalización de etiquetas y helper para registrar eventos con actor.
 */

/** Orden de presentación en filtros del Historial. */
export const PORTAL_AUDIT_MODULE_ORDER = [
  "dashboard",
  "requests",
  "trips",
  "vehicles",
  "drivers",
  "calendar",
  "history",
  "reports",
  "payroll",
  "hiring",
  "sst",
  "contact_b2b",
  "users",
  "authorizations",
  "profile",
  "bell",
  "alerts",
  "notifications"
];

/** @type {Record<string, { id: string, label: string }>} */
export const PORTAL_AUDIT_MODULE_REGISTRY = {
  dashboard: { id: "dashboard", label: "Dashboard" },
  requests: { id: "requests", label: "Mis solicitudes" },
  trips: { id: "trips", label: "Viajes" },
  vehicles: { id: "vehicles", label: "Camiones" },
  drivers: { id: "drivers", label: "Conductores" },
  calendar: { id: "calendar", label: "Calendario" },
  history: { id: "history", label: "Historial" },
  reports: { id: "reports", label: "Reportería" },
  payroll: { id: "payroll", label: "Gestión humana" },
  hiring: { id: "hiring", label: "Contratación" },
  sst: { id: "sst", label: "Cumplimiento laboral y SST" },
  contact_b2b: { id: "contact_b2b", label: "Contacto web (B2B)" },
  users: { id: "users", label: "Usuarios y permisos" },
  authorizations: { id: "authorizations", label: "Autorizaciones" },
  profile: { id: "profile", label: "Mi perfil" },
  bell: { id: "bell", label: "Timbre" },
  alerts: { id: "alerts", label: "Avisos" },
  notifications: { id: "notifications", label: "Notificaciones" }
};

const LABEL_TO_MODULE_ID = Object.fromEntries(
  Object.values(PORTAL_AUDIT_MODULE_REGISTRY).map((mod) => [mod.label.toLowerCase(), mod.id])
);

/** Alias técnicos (moduleId legacy) → id canónico del registro. */
const PORTAL_AUDIT_MODULE_ALIASES = {
  transport_requests: "requests",
  transport_trips: "trips",
  mis_solicitudes: "requests",
  solicitudes: "requests",
  viajes: "trips",
  camiones: "vehicles",
  conductores: "drivers",
  calendario: "calendar",
  historial: "history",
  reporteria: "reports",
  reporting: "reports",
  reportes: "reports",
  hr_absences: "payroll",
  hr_payroll: "payroll",
  nomina: "payroll",
  contratacion: "hiring",
  sst_compliance: "sst",
  cumplimiento_laboral: "sst",
  contacts: "contact_b2b",
  b2b: "contact_b2b",
  companies: "users",
  admin_users: "users",
  approvals: "authorizations",
  autorizaciones: "authorizations",
  mi_perfil: "profile",
  timbre: "bell",
  avisos: "alerts",
  notificaciones: "notifications",
  "centro de aprobaciones": "authorizations",
  "centro de reportería": "reports",
  "centro de reporteria": "reports"
};

const HISTORY_AUDIT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const HISTORY_AUDIT_REGISTRO_ID_RE = /^Registro\s+[0-9a-f]{6,16}$/i;

const HISTORY_AUDIT_SENSITIVE_KV_RE =
  /\b(clientUserId|vehicleId|driverId|companyId|entityId|actorUserId|updatedByUserId|createdByUserId|password|token|secret|hash|credential)\w*\s*[:=]\s*[^\s·,|]+/gi;

/** Etiqueta o resumen que no debe mostrarse al usuario (UUID, fragmento de id, etc.). */
export function isHistoryAuditOpaqueLabel(value = "") {
  const s = String(value || "").trim();
  if (!s) return true;
  if (HISTORY_AUDIT_UUID_RE.test(s)) return true;
  if (HISTORY_AUDIT_REGISTRO_ID_RE.test(s)) return true;
  return false;
}

/** Quita UUIDs, pares clave=valor técnicos y JSON crudo del texto visible en Historial. */
export function stripHistoryAuditOpaqueTokens(text = "") {
  let s = String(text || "").trim();
  if (!s) return "";
  if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
    return "";
  }
  s = s.replace(new RegExp(HISTORY_AUDIT_UUID_RE.source, "gi"), "");
  s = s.replace(/\bRegistro\s+[0-9a-f]{6,16}\b/gi, "");
  s = s.replace(HISTORY_AUDIT_SENSITIVE_KV_RE, "");
  return s
    .replace(/\s*[·,|]\s*$/g, "")
    .replace(/^\s*[·,|]\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Resumen legible por defecto cuando no hay detalle o solo hay datos técnicos. */
export function defaultHistoryAuditSummaryText(action, moduleLabel, entityLabel = "") {
  const verb =
    action === "create" ? "Creación" : action === "delete" ? "Eliminación" : "Actualización";
  const mod = normalizePortalAuditModuleLabel(moduleLabel);
  const ent = stripHistoryAuditOpaqueTokens(entityLabel);
  if (ent && ent !== "Registro") return `${verb} · ${ent}`;
  return `${verb} en ${mod}`;
}

const PORTAL_AUDIT_MODULE_ICON_KEYS = {
  dashboard: "grid",
  requests: "inbox",
  trips: "map",
  vehicles: "truck",
  drivers: "user",
  calendar: "calendar",
  history: "log",
  reports: "activity",
  payroll: "briefcase",
  hiring: "userPlus",
  sst: "shield",
  contact_b2b: "globe",
  users: "users",
  authorizations: "check",
  profile: "badge",
  bell: "bell",
  alerts: "alertTriangle",
  notifications: "bell"
};

/**
 * Resuelve el id canónico del módulo a partir de moduleId o etiqueta legible.
 * @param {string} moduleIdOrLabel
 * @returns {string}
 */
export function resolvePortalAuditModuleId(moduleIdOrLabel = "") {
  const raw = String(moduleIdOrLabel || "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (PORTAL_AUDIT_MODULE_REGISTRY[lower]) return lower;
  if (PORTAL_AUDIT_MODULE_ALIASES[lower]) return PORTAL_AUDIT_MODULE_ALIASES[lower];
  if (LABEL_TO_MODULE_ID[lower]) return LABEL_TO_MODULE_ID[lower];
  for (const mod of Object.values(PORTAL_AUDIT_MODULE_REGISTRY)) {
    if (mod.label.toLowerCase() === lower) return mod.id;
  }
  return "";
}

/**
 * Etiqueta canónica para Historial / CSV / filtros.
 * @param {string} moduleIdOrLabel
 * @returns {string}
 */
export function normalizePortalAuditModuleLabel(moduleIdOrLabel = "") {
  const raw = String(moduleIdOrLabel || "").trim();
  if (!raw) return "Módulo";
  const id = resolvePortalAuditModuleId(raw);
  if (id && PORTAL_AUDIT_MODULE_REGISTRY[id]) return PORTAL_AUDIT_MODULE_REGISTRY[id].label;
  for (const mod of Object.values(PORTAL_AUDIT_MODULE_REGISTRY)) {
    if (mod.label === raw) return mod.label;
  }
  return raw;
}

/** Clave de icono (`portal-icons.js`) para un módulo del historial. */
export function portalAuditModuleIconKey(moduleIdOrLabel = "") {
  const id = resolvePortalAuditModuleId(moduleIdOrLabel);
  if (id && PORTAL_AUDIT_MODULE_ICON_KEYS[id]) return PORTAL_AUDIT_MODULE_ICON_KEYS[id];
  const label = String(moduleIdOrLabel || "").toLowerCase();
  if (label.includes("solicitud")) return "inbox";
  if (label.includes("viaje")) return "map";
  if (label.includes("camion") || label.includes("vehiculo") || label.includes("vehículo") || label.includes("flota")) {
    return "truck";
  }
  if (label.includes("combustible")) return "fuel";
  if (label.includes("historial") || label.includes("trazabilidad") || label.includes("auditor")) return "log";
  if (label.includes("conductor")) return "user";
  if (label.includes("nomina") || label.includes("gestión humana") || label.includes("gestion humana")) {
    return "briefcase";
  }
  if (label.includes("contrat")) return "userPlus";
  if (label.includes("sst") || label.includes("cumplimiento")) return "shield";
  if (label.includes("usuario") || label.includes("permiso")) return "users";
  if (label.includes("autoriz")) return "check";
  if (label.includes("contacto") || label.includes("b2b")) return "globe";
  if (label.includes("notific") || label.includes("timbre") || label.includes("aviso")) return "bell";
  if (label.includes("report")) return "activity";
  if (label.includes("calendario")) return "calendar";
  if (label.includes("perfil")) return "badge";
  if (label.includes("dashboard")) return "grid";
  return "layers";
}

/**
 * Registra un evento de trazabilidad (delega en `appendModuleAuditLog` del runtime).
 * @param {string} moduleKey — id o etiqueta del módulo (ver PORTAL_AUDIT_MODULE_REGISTRY)
 * @param {"create"|"update"|"delete"|string} action
 * @param {object} [detail]
 */
export function logPortalAuditEvent(moduleKey, action, detail = {}) {
  const fn = globalThis.appendModuleAuditLog;
  if (typeof fn !== "function") return;
  const moduleId = resolvePortalAuditModuleId(moduleKey) || String(moduleKey || "").trim() || "dashboard";
  const moduleLabel = normalizePortalAuditModuleLabel(moduleId);
  const row = detail && typeof detail === "object" ? detail : {};
  const snapshot =
    typeof globalThis.buildPortalAuditActorSnapshot === "function"
      ? globalThis.buildPortalAuditActorSnapshot()
      : {};
  const actorUserId = String(row.actorUserId || snapshot.userId || "").trim();
  const actorEmail = String(row.actorEmail || snapshot.email || "").trim();
  const actor = String(row.actor || snapshot.label || actorEmail || "").trim();
  const usuarioFn = globalThis.historyAuditFormatStoredUsuario;
  const usuario =
    String(row.usuario || "").trim() ||
    (typeof usuarioFn === "function" ? usuarioFn(actor, actorEmail, actorUserId) : actor || actorEmail);
  fn({
    id: String(row.id || "").trim() || undefined,
    action: String(action || "update"),
    moduleId,
    moduleLabel,
    entityId: String(row.entityId || "").trim(),
    entityLabel: String(row.entityLabel || "Registro").trim(),
    summary: String(row.summary || "").trim(),
    at: row.at,
    actor,
    actorEmail,
    actorUserId,
    usuario,
    detailAction: String(row.detailAction || "").trim(),
    detailId: String(row.detailId || row.entityId || "").trim()
  });
}

/** Lista ordenada de etiquetas para filtros del Historial. */
export function listPortalAuditModuleLabels() {
  return PORTAL_AUDIT_MODULE_ORDER.map((id) => PORTAL_AUDIT_MODULE_REGISTRY[id]?.label).filter(Boolean);
}
