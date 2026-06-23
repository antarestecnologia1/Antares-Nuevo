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
  fn({
    id: String(row.id || "").trim() || undefined,
    action: String(action || "update"),
    moduleId,
    moduleLabel,
    entityId: String(row.entityId || "").trim(),
    entityLabel: String(row.entityLabel || "Registro").trim(),
    summary: String(row.summary || "").trim(),
    at: row.at,
    actor: row.actor,
    actorEmail: row.actorEmail,
    actorUserId: row.actorUserId,
    usuario: row.usuario,
    detailAction: String(row.detailAction || "").trim(),
    detailId: String(row.detailId || row.entityId || "").trim()
  });
}

/** Lista ordenada de etiquetas para filtros del Historial. */
export function listPortalAuditModuleLabels() {
  return PORTAL_AUDIT_MODULE_ORDER.map((id) => PORTAL_AUDIT_MODULE_REGISTRY[id]?.label).filter(Boolean);
}
