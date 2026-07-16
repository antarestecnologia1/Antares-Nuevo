/**
 * Trazabilidad unificada del portal: catálogo canónico de módulos,
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
  "documents",
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
  documents: { id: "documents", label: "Gestión documental" },
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
  document_management: "documents",
  "document-management": "documents",
  gestion_documental: "documents",
  "gestion documental": "documents",
  "gestión documental": "documents",
  expediente: "documents",
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

/**
 * Sustantivo / tipo de entidad para mensajes del Historial (módulo + entityKind opcional).
 * entityKind permite distinguir p. ej. usuario vs empresa (ambos en módulo users).
 */
const HISTORY_AUDIT_ENTITY_KIND_TITLES = {
  user: {
    create: "Alta de usuario",
    update: "Actualización de usuario",
    delete: "Eliminación de usuario"
  },
  company: {
    create: "Alta de empresa",
    update: "Actualización de empresa",
    delete: "Eliminación de empresa"
  },
  document: {
    create: "Alta de documento",
    update: "Actualización de documento",
    delete: "Eliminación de documento"
  },
  folder: {
    create: "Alta de carpeta documental",
    update: "Actualización de carpeta documental",
    delete: "Eliminación de carpeta documental"
  },
  request: {
    create: "Alta de solicitud",
    update: "Actualización de solicitud",
    delete: "Eliminación de solicitud"
  },
  trip: {
    create: "Alta de viaje",
    update: "Actualización de viaje",
    delete: "Eliminación de viaje"
  },
  vehicle: {
    create: "Alta de camión",
    update: "Actualización de camión",
    delete: "Eliminación de camión"
  },
  driver: {
    create: "Alta de conductor",
    update: "Actualización de conductor",
    delete: "Eliminación de conductor"
  },
  employee: {
    create: "Alta de colaborador",
    update: "Actualización de colaborador",
    delete: "Eliminación de colaborador"
  },
  payroll_run: {
    create: "Alta de liquidación",
    update: "Actualización de liquidación",
    delete: "Eliminación de liquidación"
  },
  route_rate: {
    create: "Alta de tarifa de trayecto",
    update: "Actualización de tarifa de trayecto",
    delete: "Eliminación de tarifa de trayecto"
  },
  absence: {
    create: "Registro de ausencia",
    update: "Actualización de ausencia",
    delete: "Eliminación de ausencia"
  },
  vacancy: {
    create: "Alta de vacante",
    update: "Actualización de vacante",
    delete: "Eliminación de vacante"
  },
  candidate: {
    create: "Alta de candidato",
    update: "Actualización de candidato",
    delete: "Eliminación de candidato"
  },
  contract: {
    create: "Alta de contrato",
    update: "Actualización de contrato",
    delete: "Eliminación de contrato"
  },
  interview: {
    create: "Alta de entrevista",
    update: "Actualización de entrevista",
    delete: "Eliminación de entrevista"
  },
  position: {
    create: "Alta de cargo",
    update: "Actualización de cargo",
    delete: "Eliminación de cargo"
  },
  sst: {
    create: "Alta de registro SST",
    update: "Actualización de registro SST",
    delete: "Eliminación de registro SST",
    renew: "Renovación de registro SST"
  },
  contact: {
    create: "Alta de contacto B2B",
    update: "Actualización de contacto B2B",
    delete: "Eliminación de contacto B2B"
  },
  authorization: {
    create: "Solicitud de autorización",
    update: "Autorización revisada",
    delete: "Autorización rechazada"
  },
  notification: {
    create: "Alta de notificación",
    update: "Actualización de notificación",
    delete: "Eliminación de notificación"
  },
  alert: {
    create: "Alta de aviso",
    update: "Actualización de aviso",
    delete: "Eliminación de aviso"
  },
  profile: {
    create: "Alta de perfil",
    update: "Actualización de perfil",
    delete: "Eliminación de perfil"
  },
  report: {
    create: "Generación de reporte",
    update: "Consulta de reportería",
    delete: "Eliminación de reporte"
  },
  history: {
    create: "Registro en historial",
    update: "Consulta o exportación de historial",
    delete: "Eliminación de historial"
  },
  fuel: {
    create: "Carga de combustible",
    update: "Actualización de combustible",
    delete: "Eliminación de combustible"
  },
  workshop: {
    create: "Registro de taller",
    update: "Actualización de taller",
    delete: "Eliminación de taller"
  }
};

/** Título de acción por módulo canónico (cuando no hay entityKind). */
const HISTORY_AUDIT_MODULE_ACTION_TITLES = {
  dashboard: { create: "Alta en dashboard", update: "Actualización en dashboard", delete: "Eliminación en dashboard" },
  requests: HISTORY_AUDIT_ENTITY_KIND_TITLES.request,
  trips: HISTORY_AUDIT_ENTITY_KIND_TITLES.trip,
  vehicles: HISTORY_AUDIT_ENTITY_KIND_TITLES.vehicle,
  drivers: HISTORY_AUDIT_ENTITY_KIND_TITLES.driver,
  calendar: { create: "Alta en calendario", update: "Actualización en calendario", delete: "Eliminación en calendario" },
  history: HISTORY_AUDIT_ENTITY_KIND_TITLES.history,
  reports: HISTORY_AUDIT_ENTITY_KIND_TITLES.report,
  payroll: HISTORY_AUDIT_ENTITY_KIND_TITLES.employee,
  hiring: { create: "Alta en contratación", update: "Actualización en contratación", delete: "Eliminación en contratación" },
  sst: HISTORY_AUDIT_ENTITY_KIND_TITLES.sst,
  documents: HISTORY_AUDIT_ENTITY_KIND_TITLES.document,
  contact_b2b: HISTORY_AUDIT_ENTITY_KIND_TITLES.contact,
  users: HISTORY_AUDIT_ENTITY_KIND_TITLES.user,
  authorizations: HISTORY_AUDIT_ENTITY_KIND_TITLES.authorization,
  profile: HISTORY_AUDIT_ENTITY_KIND_TITLES.profile,
  bell: { create: "Alta de timbre", update: "Actualización de timbre", delete: "Eliminación de timbre" },
  alerts: HISTORY_AUDIT_ENTITY_KIND_TITLES.alert,
  notifications: HISTORY_AUDIT_ENTITY_KIND_TITLES.notification
};

function normalizeHistoryAuditActionKey(action = "") {
  const raw = String(action || "").trim().toLowerCase();
  if (raw === "create" || raw === "delete" || raw === "renew") return raw;
  return "update";
}

function inferHistoryAuditEntityKind(moduleId = "", entry = {}) {
  const explicit = String(entry.entityKind || entry.entity_kind || "").trim().toLowerCase();
  if (explicit && HISTORY_AUDIT_ENTITY_KIND_TITLES[explicit]) return explicit;
  const label = String(entry.entityLabel || entry.entity_label || "").trim().toLowerCase();
  const summary = String(entry.summary || "").trim().toLowerCase();
  const hay = `${label} ${summary}`;
  if (moduleId === "documents") {
    if (hay.includes("carpeta")) return "folder";
    return "document";
  }
  if (moduleId === "users") {
    if (hay.includes("empresa") || hay.includes("compañía") || hay.includes("compania")) return "company";
    return "user";
  }
  if (moduleId === "payroll") {
    if (hay.includes("liquidación") || hay.includes("liquidacion") || hay.includes("periodo")) return "payroll_run";
    if (hay.includes("ausencia") || hay.includes("incapacidad")) return "absence";
    return "employee";
  }
  if (moduleId === "trips" || moduleId === "transport_trips") {
    if (hay.includes("tarifa") || hay.includes("trayecto") || hay.includes("→") || hay.includes("->")) {
      return "route_rate";
    }
    return "trip";
  }
  if (moduleId === "vehicles") {
    if (hay.includes("combustible") || hay.includes("litros") || hay.includes("estación") || hay.includes("estacion")) {
      return "fuel";
    }
    if (hay.includes("taller") || hay.includes("mantenimiento") || hay.includes("preventivo") || hay.includes("correctivo")) {
      return "workshop";
    }
    return "vehicle";
  }
  if (moduleId === "hiring") {
    if (hay.includes("vacante")) return "vacancy";
    if (hay.includes("candidato")) return "candidate";
    if (hay.includes("contrato")) return "contract";
    if (hay.includes("entrevista")) return "interview";
    if (hay.includes("cargo")) return "position";
  }
  return "";
}

/**
 * Título claro de la acción para Historial (badge, detalle, CSV).
 * Ej.: documents+delete → "Eliminación de documento"; users+create → "Alta de usuario".
 * @param {string} action
 * @param {string} [moduleIdOrLabel]
 * @param {object} [entryOrOpts] — entry de auditoría o `{ entityKind }`
 */
export function historyAuditActionTitle(action, moduleIdOrLabel = "", entryOrOpts = {}) {
  const actionKey = normalizeHistoryAuditActionKey(action);
  const moduleId = resolvePortalAuditModuleId(moduleIdOrLabel) || String(moduleIdOrLabel || "").trim();
  const opts = entryOrOpts && typeof entryOrOpts === "object" ? entryOrOpts : {};
  const kind = inferHistoryAuditEntityKind(moduleId, opts);
  const fromKind = kind ? HISTORY_AUDIT_ENTITY_KIND_TITLES[kind] : null;
  if (fromKind?.[actionKey]) return fromKind[actionKey];
  if (fromKind?.update && actionKey === "renew") return fromKind.update;
  const fromModule = moduleId ? HISTORY_AUDIT_MODULE_ACTION_TITLES[moduleId] : null;
  if (fromModule?.[actionKey]) return fromModule[actionKey];
  if (actionKey === "create") return "Creación";
  if (actionKey === "delete") return "Eliminación";
  if (actionKey === "renew") return "Renovación";
  return "Actualización";
}

/** Resumen legible por defecto cuando no hay detalle o solo hay datos técnicos. */
export function defaultHistoryAuditSummaryText(action, moduleLabel, entityLabel = "", entryOrOpts = {}) {
  const title = historyAuditActionTitle(action, moduleLabel, {
    ...(entryOrOpts && typeof entryOrOpts === "object" ? entryOrOpts : {}),
    entityLabel
  });
  const ent = stripHistoryAuditOpaqueTokens(entityLabel);
  if (ent && ent !== "Registro" && !String(ent).toLowerCase().startsWith(title.toLowerCase())) {
    return `${title} · ${ent}`;
  }
  return title;
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
  documents: "file",
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
  if (label.includes("document") || label.includes("expediente")) return "file";
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
  const entityLabel = String(row.entityLabel || "Registro").trim();
  const entityKind = String(row.entityKind || "").trim().toLowerCase();
  const actionKey = String(action || "update");
  const summary =
    String(row.summary || "").trim() ||
    defaultHistoryAuditSummaryText(actionKey, moduleLabel, entityLabel, { entityKind, entityLabel });
  fn({
    id: String(row.id || "").trim() || undefined,
    action: actionKey,
    moduleId,
    moduleLabel,
    entityId: String(row.entityId || "").trim(),
    entityLabel,
    entityKind,
    summary,
    at: row.at,
    actor,
    actorEmail,
    actorUserId,
    usuario,
    changesText: String(row.changesText || "").trim(),
    detailAction: String(row.detailAction || "").trim(),
    detailId: String(row.detailId || row.entityId || "").trim()
  });
}

/** Lista ordenada de etiquetas para filtros del Historial. */
export function listPortalAuditModuleLabels() {
  return PORTAL_AUDIT_MODULE_ORDER.map((id) => PORTAL_AUDIT_MODULE_REGISTRY[id]?.label).filter(Boolean);
}
