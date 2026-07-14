/**
 * Bootstrap del portal: normalización de GET /portal/bootstrap, hidratación de caché y orquestación API.
 * `read` / `write` delegan en `window.AntaresPersistence` (mismo patrón que `auth.js`).
 */
import { KEYS, ROLES } from "./config.js";
import {
  currentUser,
  getSession,
  normalizeUserAccountStatus,
  setSession
} from "./auth.js";
import { filterPortalRequestsForServerCache } from "../domain/solicitudes.domain.js";
import { state } from "./store.js";
import { scheduleRenderPortalView } from "./router.js";

/** @type {Record<string, unknown>} */
let __callbacks = {
  applySystemParametersToClientRules: null,
  onNotificationPreferencesApplied: null,
  applyPayloadHooks: null,
  orchestration: null,
  setPortalDataHydrating: null,
  onPostInteractiveBootstrap: null
};

/**
 * Registra callbacks desde `app.js` (reglas de nómina, permisos, UI de carga, etc.).
 * @param {Record<string, unknown>} patch
 */
export function setBootstrapCallbacks(patch) {
  if (!patch || typeof patch !== "object") return;
  if (patch.applyPayloadHooks && typeof patch.applyPayloadHooks === "object") {
    __callbacks.applyPayloadHooks = { ...(__callbacks.applyPayloadHooks || {}), ...patch.applyPayloadHooks };
    delete patch.applyPayloadHooks;
  }
  if (patch.orchestration && typeof patch.orchestration === "object") {
    __callbacks.orchestration = { ...(__callbacks.orchestration || {}), ...patch.orchestration };
    delete patch.orchestration;
  }
  __callbacks = { ...__callbacks, ...patch };
}

function capStoredArrayRows(key, value) {
  const caps = { [KEYS.notifications]: 500, [KEYS.emails]: 400 };
  const max = caps[key];
  if (!max || !Array.isArray(value) || value.length <= max) return value;
  return value.slice(0, max);
}

function read(key, fallback = []) {
  const P = window.AntaresPersistence;
  const normalizeShape = (value) => {
    if (Array.isArray(fallback)) return Array.isArray(value) ? value : fallback;
    if (fallback && typeof fallback === "object") {
      return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
    }
    return value ?? fallback;
  };
  if (P && typeof P.read === "function") return normalizeShape(P.read(key, fallback));
  try {
    return normalizeShape(JSON.parse(localStorage.getItem(key)));
  } catch (_error) {
    return fallback;
  }
}

function readArray(key) {
  const value = read(key, []);
  return Array.isArray(value) ? value : [];
}

function write(key, value, opts = {}) {
  const skipSyncSchedule = opts?.skipSyncSchedule === true;
  const P = window.AntaresPersistence;
  if (P && typeof P.write === "function") {
    P.write(key, value, opts);
  } else {
    const stored = capStoredArrayRows(key, value);
    localStorage.setItem(key, JSON.stringify(stored));
    if (!skipSyncSchedule && window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
      window.AntaresPortalSync.schedule(key, stored);
    }
  }
}

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Alineado con `CO_SYSTEM_PARAMS_DEFAULTS` / `CO_PAYROLL` iniciales en app.js (evita dependencia circular). */
const SYSTEM_PARAM_DEFAULTS = Object.freeze({
  smmlvCop: 1750905,
  minMonthlySalaryCop: 1750905,
  transportAllowanceCop: 249095,
  legalWeeklyHours: 46,
  healthEmployeeRate: 0.04,
  pensionEmployeeRate: 0.04,
  uvtCop: null,
  activeYear: new Date().getFullYear(),
  referenceMode: "automatic"
});

export function parsePortalJsonSnapshot(raw) {
  if (raw == null || raw === "") return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const o = JSON.parse(raw);
      return o && typeof o === "object" && !Array.isArray(o) ? o : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function normalizePortalBootstrapUserRow(u) {
  if (!u || typeof u !== "object") return u;
  const s = normalizeUserAccountStatus(u);
  const out = { ...u };
  if (s) out.accountStatus = s;
  if (!out.source) {
    out.source = "portal_db";
  }
  const avatar = String(out.avatarUrl ?? out.url_avatar ?? out.urlAvatar ?? "").trim();
  if (avatar) out.avatarUrl = avatar;
  return out;
}

export function normalizePortalBootstrapCompanyRow(c) {
  if (!c || typeof c !== "object") return c;
  const r = c;
  const name = String(r.name ?? r.nombre ?? "").trim();
  const taxId = String(r.taxId ?? r.nit ?? "").trim();
  return {
    ...r,
    ...(name ? { name } : {}),
    taxId: taxId || String(r.taxId ?? "").trim(),
    nit: taxId || String(r.nit ?? "").trim(),
    phone: String(r.phone ?? r.telefono ?? "").trim(),
    email: String(r.email ?? r.correo_empresarial ?? r.correo ?? "").trim(),
    contactName: String(r.contactName ?? r.nombre_contacto ?? "").trim(),
    department: String(r.department ?? r.departamento ?? "").trim(),
    city: String(r.city ?? r.ciudad ?? "").trim(),
    address: String(r.address ?? r.direccion_operativa ?? r.direccion ?? "").trim(),
    logoUrl: String(r.logoUrl ?? r.url_logo ?? r.urlLogo ?? "").trim()
  };
}

export function normalizePortalBootstrapPositionRow(raw) {
  if (!raw || typeof raw !== "object") return null;
  const r = raw;
  const id = String(r.id ?? r.id_cargo ?? "").trim();
  if (!id) return null;
  const activeRaw = r.active ?? r.activo;
  const active =
    activeRaw === false || String(activeRaw ?? "").toLowerCase() === "false" ? false : true;
  return {
    ...r,
    id,
    name: String(r.name ?? r.nombre ?? "").trim(),
    workerRole: String(r.workerRole ?? r.rol_trabajador ?? "empleado").toLowerCase(),
    baseSalary: Number(r.baseSalary ?? r.salario_base_mensual ?? 0) || 0,
    transportAllowance:
      r.transportAllowance != null
        ? Number(r.transportAllowance)
        : r.auxilio_transporte != null
          ? Number(r.auxilio_transporte)
          : null,
    contractTypeDefault: String(r.contractTypeDefault ?? r.tipo_contrato_sugerido ?? "Termino indefinido").trim(),
    legalBasis: String(r.legalBasis ?? r.fundamento_legal ?? "").trim(),
    active,
    workSchedule: String(r.workSchedule ?? r.schedule ?? r.jornada_referencia ?? "").trim(),
    schedule: String(r.schedule ?? r.workSchedule ?? r.jornada_referencia ?? "").trim(),
    arlRiskLevel: r.arlRiskLevel ?? r.nivel_riesgo_arl ?? null,
    integralSalary: r.integralSalary ?? r.salario_integral ?? null
  };
}

export function normalizeSystemParametersPayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  const smmlvCop = Math.max(0, parseNum(raw.smmlvCop ?? raw.smmlv));
  const minMonthlySalaryCop = Math.max(0, parseNum(raw.minMonthlySalaryCop ?? raw.minMonthlySalary ?? smmlvCop));
  const transportAllowanceCop = Math.max(0, parseNum(raw.transportAllowanceCop ?? raw.transportAllowance));
  const legalWeeklyHours = Math.max(0, parseNum(raw.legalWeeklyHours));
  const healthEmployeeRate = Math.max(0, parseNum(raw.healthEmployeeRate ?? raw.saludEmployeeRate ?? raw.healthRate));
  const pensionEmployeeRate = Math.max(0, parseNum(raw.pensionEmployeeRate ?? raw.pensionRate));
  const uvtParsed = Math.max(0, parseNum(raw.uvtCop ?? raw.uvt));
  const activeYear = Math.max(
    2020,
    Math.trunc(Number(raw.activeYear ?? raw.platformReferenceYear ?? new Date().getFullYear()) || new Date().getFullYear())
  );
  const referenceMode = String(raw.referenceMode || "").trim().toLowerCase() === "manual" ? "manual" : "automatic";
  return {
    smmlvCop: smmlvCop || SYSTEM_PARAM_DEFAULTS.smmlvCop,
    minMonthlySalaryCop: minMonthlySalaryCop || smmlvCop || SYSTEM_PARAM_DEFAULTS.minMonthlySalaryCop,
    transportAllowanceCop: transportAllowanceCop || SYSTEM_PARAM_DEFAULTS.transportAllowanceCop,
    legalWeeklyHours: legalWeeklyHours || SYSTEM_PARAM_DEFAULTS.legalWeeklyHours,
    healthEmployeeRate: healthEmployeeRate || SYSTEM_PARAM_DEFAULTS.healthEmployeeRate,
    pensionEmployeeRate: pensionEmployeeRate || SYSTEM_PARAM_DEFAULTS.pensionEmployeeRate,
    uvtCop: uvtParsed || null,
    activeYear,
    referenceMode
  };
}

export function applySystemParametersFromBootstrapPayload(raw) {
  const fn = __callbacks.applySystemParametersToClientRules;
  if (typeof fn !== "function") return;
  const normalized = fn(raw);
  if (!normalized) return;
  write(KEYS.systemParameters, normalized);
}

export function hydrateSystemParametersFromCache() {
  const fn = __callbacks.applySystemParametersToClientRules;
  if (typeof fn !== "function") return;
  const cached = read(KEYS.systemParameters, null);
  fn(cached);
}

export function applyNotificationPreferencesFromBootstrapPayload(raw) {
  if (!raw || typeof raw !== "object") return;
  state.notificationPreferences = {
    id: String(raw.id || "").trim() || null,
    notificacionesHabilitadas: raw.notificacionesHabilitadas !== false,
    sonidoNotificacionesHabilitadas: raw.sonidoNotificacionesHabilitadas !== false,
    createdAt: raw.createdAt ? String(raw.createdAt) : null,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null
  };
  __callbacks.onNotificationPreferencesApplied?.();
}

function portalSnapshotExtras() {
  return {
    notificationPreferences: state.notificationPreferences,
    systemParametersHistory: state.systemParametersHistory,
    portalContacts: state.portalContacts
  };
}

export function applyPortalSnapshotExtras(extras) {
  if (!extras || typeof extras !== "object") return;
  if (extras.notificationPreferences !== undefined) {
    applyNotificationPreferencesFromBootstrapPayload(extras.notificationPreferences);
  }
  if (Array.isArray(extras.systemParametersHistory)) {
    state.systemParametersHistory = extras.systemParametersHistory;
  }
  if (Array.isArray(extras.portalContacts)) {
    state.portalContacts = extras.portalContacts;
  }
}

export function decodeJwtPayload(token) {
  try {
    const part = String(token || "").split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch (_e) {
    return null;
  }
}

function mapJwtRoleToAppRole(roleRaw) {
  const r = String(roleRaw || "client")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
  const roleMap = {
    admin: ROLES.ADMIN,
    administrador: ROLES.ADMIN,
    client: ROLES.CLIENT,
    cliente: ROLES.CLIENT,
    rrhh: ROLES.RRHH,
    administracion: ROLES.ADMINISTRACION,
    auxiliar_administrativo: ROLES.AUXILIAR_ADMINISTRATIVO,
    lider_administrativo: ROLES.LIDER_ADMINISTRATIVO,
    logistica: ROLES.LOGISTICA,
    logistics: ROLES.LOGISTICA
  };
  return roleMap[r] || ROLES.CLIENT;
}

export function upsertPortalUserStubFromJwtPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const uid = String(payload.sub || "").trim();
  const email = String(payload.email || "").trim();
  if (!uid || !email) return null;
  const users = read(KEYS.users, []);
  const existing = users.find((u) => String(u.id) === uid);
  if (existing) return existing;
  const localPart = email.split("@")[0] || "";
  const stub = {
    id: uid,
    email,
    name: localPart.replace(/[._-]+/g, " ").trim() || email,
    role: mapJwtRoleToAppRole(payload.role),
    accountStatus: "aprobado",
    companyId: "",
    company: "",
    password: "",
    permissions: [],
    taxId: "",
    phone: ""
  };
  write(KEYS.users, [stub, ...users.filter((u) => String(u.id) !== uid)], { skipSyncSchedule: true });
  return stub;
}

function portalUserDocumentValue(user) {
  if (!user) return "";
  return String(user.taxId || user.personalDoc || user.personalTaxId || user.idDoc || "").trim();
}

function profileSystemJoinDateValue(user) {
  if (!user || typeof user !== "object") return "";
  const candidates = [user.createdAt, user.registeredAt, user.portalSince, user.systemJoinDate];
  for (const raw of candidates) {
    if (!raw) continue;
    const s = String(raw).trim();
    if (!s) continue;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    if (Number.isFinite(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return "";
}

export function buildProfileSnapshotFromUserRow(u) {
  if (!u || u.id == null) return null;
  return {
    id: String(u.id),
    email: String(u.email || "").trim(),
    name: String(u.name || "").trim(),
    role: u.role,
    companyId: u.companyId != null ? String(u.companyId) : "",
    permissions: Array.isArray(u.permissions) ? u.permissions : [],
    avatarUrl: String(u.avatarUrl || "").trim()
  };
}

export function syncSessionProfileSnapshotFromCache() {
  const s = getSession();
  if (!s?.userId) return;
  const u = read(KEYS.users, []).find((x) => String(x.id) === String(s.userId));
  const snap = buildProfileSnapshotFromUserRow(u);
  if (!snap) return;
  setSession({ ...s, profileSnapshot: snap });
}

export function materializePortalUserFromSession(session) {
  if (!session?.userId) return null;
  let user = currentUser();
  if (user && String(user.id) === String(session.userId)) return user;

  const snap = session.profileSnapshot;
  if (snap && String(snap.id) === String(session.userId)) {
    const users = read(KEYS.users, []);
    const prev = users.find((u) => String(u.id) === String(snap.id));
    const row = {
      id: String(snap.id),
      email: String(snap.email || prev?.email || "").trim() || "usuario@portal",
      name: String(snap.name || prev?.name || "").trim() || String(snap.email || "Usuario").trim() || "Usuario",
      role: snap.role || prev?.role || session.role || ROLES.CLIENT,
      accountStatus: prev?.accountStatus || snap.accountStatus || "aprobado",
      companyId: snap.companyId != null ? String(snap.companyId) : String(prev?.companyId || ""),
      company: String(prev?.company || "").trim(),
      password: "",
      permissions: Array.isArray(snap.permissions) ? snap.permissions : prev?.permissions || [],
      avatarUrl: String(snap.avatarUrl || prev?.avatarUrl || "").trim(),
      taxId: portalUserDocumentValue(prev),
      personalDoc: String(prev?.personalDoc || "").trim(),
      phone: String(prev?.phone || "").trim(),
      documentType: String(prev?.documentType || "").trim(),
      birthDate: String(prev?.birthDate || "").trim(),
      createdAt: prev?.createdAt || prev?.registeredAt || "",
      registeredAt: prev?.registeredAt || prev?.createdAt || "",
      systemJoinDate: profileSystemJoinDateValue(prev),
      portalSince: String(prev?.portalSince || "").trim(),
      emergencyContact: String(prev?.emergencyContact || "").trim(),
      emergencyPhone: String(prev?.emergencyPhone || "").trim(),
      emergencyRelation: String(prev?.emergencyRelation || prev?.emergencyRelationship || "").trim(),
      city: String(prev?.city || "").trim(),
      department: String(prev?.department || "").trim()
    };
    write(KEYS.users, [row, ...users.filter((u) => String(u.id) !== String(row.id))], { skipSyncSchedule: true });
    user = currentUser();
    if (user && String(user.id) === String(session.userId)) return user;
  }

  const fallbackRole = session.role || session.profileSnapshot?.role || ROLES.CLIENT;
  const usersFinal = read(KEYS.users, []);
  const prevFinal = usersFinal.find((u) => String(u.id) === String(session.userId));
  const stubRow = {
    id: String(session.userId),
    email: String(session.profileSnapshot?.email || prevFinal?.email || "").trim() || "usuario@portal",
    name: String(session.profileSnapshot?.name || prevFinal?.name || "").trim() || "Usuario",
    role: fallbackRole,
    accountStatus: prevFinal?.accountStatus || "aprobado",
    companyId: String(session.profileSnapshot?.companyId || prevFinal?.companyId || ""),
    company: String(prevFinal?.company || "").trim(),
    password: "",
    permissions: Array.isArray(session.profileSnapshot?.permissions)
      ? session.profileSnapshot.permissions
      : prevFinal?.permissions || [],
    avatarUrl: String(session.profileSnapshot?.avatarUrl || prevFinal?.avatarUrl || "").trim(),
    taxId: portalUserDocumentValue(prevFinal),
    personalDoc: String(prevFinal?.personalDoc || "").trim(),
    phone: String(prevFinal?.phone || "").trim(),
    documentType: String(prevFinal?.documentType || "").trim(),
    createdAt: prevFinal?.createdAt || prevFinal?.registeredAt || ""
  };
  write(KEYS.users, [stubRow, ...usersFinal.filter((u) => String(u.id) !== String(stubRow.id))], {
    skipSyncSchedule: true
  });
  user = currentUser();
  if (user && String(user.id) === String(session.userId)) return user;

  return null;
}

function getPayloadHooks() {
  const h = __callbacks.applyPayloadHooks;
  if (!h || typeof h.ensureUsersPermissions !== "function") {
    throw new Error(
      "AntaresBootstrap: llama setBootstrapCallbacks({ applyPayloadHooks: { ensureUsersPermissions, ... } }) desde app.js"
    );
  }
  return h;
}

export function __applyPortalBootstrapPayloadInner(p) {
  if (!p || typeof p !== "object") return;
  if (p.notificationPreferences !== undefined) {
    applyNotificationPreferencesFromBootstrapPayload(p.notificationPreferences);
  }
  if (p.systemParameters !== undefined) {
    applySystemParametersFromBootstrapPayload(p.systemParameters);
  }
  if (p.systemParametersHistory !== undefined) {
    state.systemParametersHistory = Array.isArray(p.systemParametersHistory) ? p.systemParametersHistory : [];
  }
  if (p.contacts !== undefined) {
    state.portalContacts = Array.isArray(p.contacts) ? p.contacts : [];
  }
  if (p.portalAuditEvents !== undefined) {
    const items = Array.isArray(p.portalAuditEvents) ? p.portalAuditEvents : [];
    write(KEYS.moduleAuditLogs, items, { skipSyncSchedule: true });
  }
  const map = [
    ["users", KEYS.users],
    ["companies", KEYS.companies],
    ["counters", KEYS.counters],
    ["requests", KEYS.requests],
    ["deletedTransportTripLogs", KEYS.deletedTransportTripLogs],
    ["deletedTransportRequestLogs", KEYS.deletedTransportRequestLogs],
    ["vehicles", KEYS.vehicles],
    ["drivers", KEYS.drivers],
    ["notifications", KEYS.notifications],
    ["emails", KEYS.emails],
    ["payrollEmployees", KEYS.payrollEmployees],
    ["payrollRuns", KEYS.payrollRuns],
    ["fuelLogs", KEYS.fuelLogs],
    ["vehicleTechnicalLogs", KEYS.vehicleTechnicalLogs],
    ["travelAllowanceRules", KEYS.travelAllowanceRules],
    ["vacancies", KEYS.vacancies],
    ["candidates", KEYS.candidates],
    ["positions", KEYS.positions],
    ["interviews", KEYS.interviews],
    ["contracts", KEYS.contracts],
    ["hrAbsences", KEYS.hrAbsences],
    ["sstCompliance", KEYS.sstCompliance],
    ["tripRouteRates", KEYS.tripRouteRates],
    ["approvals", KEYS.approvals]
  ];
  const propsNeedingPayloadHooks = new Set([
    "users",
    "fuelLogs",
    "vehicleTechnicalLogs",
    "companies",
    "notifications",
    "payrollEmployees",
    "sstCompliance",
    "candidates",
    "positions"
  ]);
  for (const [prop, key] of map) {
    if (p[prop] === undefined) continue;
    const hooks = propsNeedingPayloadHooks.has(prop) ? getPayloadHooks() : null;
    if (prop === "users") {
      const raw = Array.isArray(p.users) ? p.users : [];
      write(KEYS.users, raw.map(normalizePortalBootstrapUserRow));
      hooks.ensureUsersPermissions();
      continue;
    }
    if (prop === "fuelLogs") {
      write(key, hooks.normalizeFuelLogsList(Array.isArray(p.fuelLogs) ? p.fuelLogs : []));
      continue;
    }
    if (prop === "vehicleTechnicalLogs") {
      write(key, hooks.normalizeVehicleTechnicalLogsList(Array.isArray(p.vehicleTechnicalLogs) ? p.vehicleTechnicalLogs : []));
      continue;
    }
    if (prop === "companies") {
      const raw = Array.isArray(p.companies) ? p.companies : [];
      const prev = read(KEYS.companies, []);
      const prevMap = new Map(prev.map((c) => [String(c.id ?? ""), c]));
      const merged = hooks.patchOperatorCompanyKindIfNeeded(
        raw.map((c) => {
          const base = normalizePortalBootstrapCompanyRow(c);
          const row = base && typeof base === "object" ? base : c;
          const id = String(row?.id ?? "");
          const old = id ? prevMap.get(id) : null;
          const explicitInactive =
            row.active === false ||
            String(row.active ?? "").toLowerCase() === "false" ||
            String((row.activeCompany ?? row.companyActive) ?? "").toLowerCase() === "false";
          const active = explicitInactive ? false : old && typeof old.active === "boolean" ? old.active : true;
          return { ...row, active };
        })
      );
      write(KEYS.companies, merged);
      continue;
    }
    if (prop === "requests") {
      const raw = Array.isArray(p.requests) ? p.requests : [];
      const normalized = raw.map((row) => {
        if (!row || typeof row !== "object") return row;
        const { attachments: _attachments, ...rest } = row;
        return rest;
      });
      write(KEYS.requests, filterPortalRequestsForServerCache(normalized), { skipSyncSchedule: true });
      continue;
    }
    if (prop === "notifications") {
      const raw = Array.isArray(p.notifications) ? p.notifications : [];
      const actor = currentUser();
      const filtered = actor ? hooks.filterNotificationsForUser(actor, raw) : [];
      const prev = read(KEYS.notifications, []);
      const merged = hooks.mergeNotificationsListPreserveReadAt(prev, filtered);
      write(KEYS.notifications, merged, { skipSyncSchedule: true });
      hooks.markInboxNotificationsAsToastSeen?.(
        merged.map((n) => n?.id).filter(Boolean)
      );
      continue;
    }
    if (prop === "payrollEmployees") {
      const raw = Array.isArray(p.payrollEmployees) ? p.payrollEmployees : [];
      write(
        KEYS.payrollEmployees,
        raw.map((row) => {
          if (!row || typeof row !== "object") return row;
          const o = { ...row };
          if (!String(o.contractDuration || "").trim() && String(o.contractDurationText || "").trim()) {
            o.contractDuration = String(o.contractDurationText).trim();
          }
          if (!String(o.costCenter || "").trim() && String(o.centro_costos || o.centroCostos || "").trim()) {
            o.costCenter = String(o.centro_costos || o.centroCostos).trim();
          }
          const wr =
            o.workerRole ||
            (String(o.position || "").toLowerCase().includes("conductor") ? "conductor" : "empleado");
          Object.assign(
            o,
            hooks.sanitizePayrollEmployeeFieldsForPersist({
              ...o,
              workerRole: wr
            })
          );
          return hooks.normalizePayrollEmployeeRowDates(o);
        })
      );
      continue;
    }
    if (prop === "sstCompliance") {
      const raw = Array.isArray(p.sstCompliance) ? p.sstCompliance : [];
      write(KEYS.sstCompliance, raw.map(hooks.normalizeSstComplianceRow));
      continue;
    }
    if (prop === "candidates") {
      const raw = Array.isArray(p.candidates) ? p.candidates : [];
      write(
        KEYS.candidates,
        raw.map((row) => {
          if (!row || typeof row !== "object") return row;
          const r = { ...row };
          const st = String(r.status || "").trim();
          const ps = String(r.pipelineStage || "").trim();
          if (!st && ps) r.status = ps;
          if (r.expectedSalary == null && r.salaryExpectation != null) r.expectedSalary = Number(r.salaryExpectation) || 0;
          const avail = String(r.availabilityDate || "").trim();
          if (!avail && r.availableFrom != null) {
            const af = r.availableFrom;
            r.availabilityDate = typeof af === "string" ? af.slice(0, 10) : String(af).slice(0, 10);
          }
          if (r.birthDate != null && r.birthDate !== "") {
            r.birthDate = String(r.birthDate).trim().slice(0, 10);
          }
          return r;
        })
      );
      continue;
    }
    if (prop === "positions") {
      const raw = Array.isArray(p.positions) ? p.positions : [];
      const list = raw.map(normalizePortalBootstrapPositionRow).filter(Boolean);
      write(key, list);
      hooks.dispatchPositionsCatalogUpdated();
      continue;
    }
    write(key, p[prop]);
  }
}

export function applyPortalBootstrapPayload(p) {
  if (!p || typeof p !== "object") return;
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    __applyPortalBootstrapPayloadInner(p);
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

export function savePortalSnapshotAfterBootstrap(opts = {}) {
  const session = getSession();
  const uid = session?.userId;
  const cache = window.PortalBootstrapCache;
  if (!uid || !cache) return;
  try {
    const id = String(uid);
    const extras = portalSnapshotExtras();
    if (opts.immediate && typeof cache.save === "function") {
      cache.save(id, extras, { force: opts.force === true });
      return;
    }
    if (opts.dirtyKeys?.length && typeof cache.scheduleSave === "function") {
      cache.scheduleSave(id, extras, { dirtyKeys: opts.dirtyKeys, force: opts.force === true });
      return;
    }
    if (opts.full && typeof cache.scheduleSave === "function") {
      cache.scheduleSave(id, extras, { full: true });
      return;
    }
    if (typeof cache.scheduleSave === "function") {
      cache.scheduleSave(id, extras, { full: true });
      return;
    }
    cache.save?.(id, extras);
  } catch (_e) {
    /* QuotaExceeded u otro: no bloquear el flujo */
  }
}

export function portalEnsureApiTokensAligned() {
  if (window.AntaresApi?.purgeLegacyAuthTokens) {
    window.AntaresApi.purgeLegacyAuthTokens();
  }
}

export function portalCanRefreshFromApi() {
  portalEnsureApiTokensAligned();
  const api = window.AntaresApi;
  if (!api?.getBase?.()) return false;
  const s = getSession();
  return Boolean(s?.userId);
}

const PORTAL_SNAPSHOT_FRESH_MS = 4 * 60 * 1000;

export function portalSnapshotIsFresh() {
  const session = getSession();
  const uid = session?.userId;
  const cache = window.PortalBootstrapCache;
  if (!uid || !state.portalSnapshotRestored || typeof cache?.snapshotAgeMs !== "function") {
    return false;
  }
  const age = cache.snapshotAgeMs(String(uid));
  return age > 0 && age < PORTAL_SNAPSHOT_FRESH_MS;
}

export async function applyPortalBootstrapFromApi(opts = {}) {
  if (!portalCanRefreshFromApi()) return false;

  const wantsSecondary = opts.skipSecondaryHydration !== true;
  const snapshotFresh = portalSnapshotIsFresh();
  let entry = window.__portalBootstrapApplyEntry;

  if (entry && entry.promise) {
    if (wantsSecondary) entry.needsSecondary = true;
    return entry.promise;
  }

  entry = { needsSecondary: wantsSecondary, promise: null };
  window.__portalBootstrapApplyEntry = entry;

  const orch = __callbacks.orchestration || {};
  const tryApiRefreshBridge = orch.tryApiRefreshBridge;
  const refreshPositionsCatalogFromApi = orch.refreshPositionsCatalogFromApi;
  const hydrateOwnProfileFromApi = orch.hydrateOwnProfileFromApi;
  const devWarn = typeof orch.devWarn === "function" ? orch.devWarn : (...args) => console.warn(...args);
  const setHydrating = __callbacks.setPortalDataHydrating;

  const tracked = (async () => {
    const api = window.AntaresApi;
    const BOOTSTRAP_TIMEOUT_MS = 28000;
    const runBootstrap = async () => {
      let lastErr = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 900));
        }
        try {
          const p = await api.getJson("/portal/bootstrap", { timeoutMs: BOOTSTRAP_TIMEOUT_MS });
          applyPortalBootstrapPayload(p);
          syncSessionProfileSnapshotFromCache();
          savePortalSnapshotAfterBootstrap({ full: true });
          if (p && p.positions !== undefined) {
            window.__portalBootstrapPositionsFresh = true;
          }
          return true;
        } catch (err) {
          lastErr = err;
          const st = err && typeof err.status === "number" ? err.status : 0;
          if (st === 401) throw err;
          if (attempt === 0 && (st === 408 || st === 0 || st >= 500)) continue;
          throw err;
        }
      }
      throw lastErr || new Error("No se pudo cargar datos del portal");
    };
    const runSecondaryHydration = async () => {
      if (!entry.needsSecondary) return;
      await Promise.all([
        typeof refreshPositionsCatalogFromApi === "function"
          ? refreshPositionsCatalogFromApi({ rerender: false })
          : Promise.resolve(),
        typeof hydrateOwnProfileFromApi === "function" ? hydrateOwnProfileFromApi() : Promise.resolve()
      ]);
      window.__portalBootstrapPositionsFresh = true;
    };
    const tryHydrateOwnProfileFallback = () =>
      typeof hydrateOwnProfileFromApi === "function" ? hydrateOwnProfileFromApi() : Promise.resolve();
    try {
      if (!snapshotFresh && typeof setHydrating === "function") setHydrating(true);
      await runBootstrap();
      await runSecondaryHydration();
      state.portalDataHydrated = true;
      return true;
    } catch (err) {
      const st = err && typeof err.status === "number" ? err.status : 0;
      if (st === 401 && typeof tryApiRefreshBridge === "function") {
        await tryApiRefreshBridge();
        portalEnsureApiTokensAligned();
        if (!portalCanRefreshFromApi()) return false;
        try {
          await runBootstrap();
          await runSecondaryHydration();
          state.portalDataHydrated = true;
          return true;
        } catch (e2) {
          devWarn("Portal: /portal/bootstrap fallo tras renovar token.", e2?.message || e2);
          if (typeof refreshPositionsCatalogFromApi === "function") {
            await refreshPositionsCatalogFromApi({ rerender: false });
          }
          await tryHydrateOwnProfileFallback();
          return false;
        }
      }
      devWarn("Portal: no se pudo cargar /portal/bootstrap (se usan datos en memoria de sesión).", err?.message || err);
      if (typeof refreshPositionsCatalogFromApi === "function") {
        await refreshPositionsCatalogFromApi({ rerender: false });
      }
      await tryHydrateOwnProfileFallback();
      return false;
    } finally {
      if (typeof setHydrating === "function") setHydrating(false);
    }
  })();

  entry.promise = tracked;
  window.__portalBootstrapInFlight = tracked.finally(() => {
    if (window.__portalBootstrapApplyEntry === entry) {
      window.__portalBootstrapApplyEntry = null;
    }
    if (window.__portalBootstrapInFlight === tracked) {
      window.__portalBootstrapInFlight = null;
    }
  });
  return tracked;
}

export async function startPortalBootstrapForInteractiveSession() {
  if (!portalCanRefreshFromApi()) return false;
  const p = window.PortalDataLayer?.refreshCacheFromApi
    ? window.PortalDataLayer.refreshCacheFromApi()
    : applyPortalBootstrapFromApi();
  const tracked = Promise.resolve(p);
  window.__portalBootstrapInFlight = tracked.finally(() => {
    if (window.__portalBootstrapInFlight === tracked) window.__portalBootstrapInFlight = null;
  });
  let ok = false;
  try {
    ok = Boolean(await tracked);
  } catch (_e) {
    /* fallo de red o 401: la vista usa proyección local hasta el próximo intento */
  }
  if (ok) {
    try {
      __callbacks.onPostInteractiveBootstrap?.();
    } catch (_e2) {
      /* noop */
    }
    try {
      if (typeof window.maybeEnforceDataPolicyAcceptance === "function") {
        window.maybeEnforceDataPolicyAcceptance();
      }
    } catch (_e3) {
      /* noop */
    }
  }
  return ok;
}

/**
 * Tras bootstrap remoto (p. ej. al volver a la pestaña): repinta vista y badge.
 * La mayoría de hooks siguen en `portal-runtime.js` hasta completar la modularización.
 */
export function portalRefreshAfterBootstrap() {
  const G = typeof globalThis !== "undefined" ? globalThis : window;
  if (!getSession()) return;
  try {
    syncSessionProfileSnapshotFromCache();
    if (typeof G.reconcileNotificationsCacheForSession === "function") {
      G.reconcileNotificationsCacheForSession();
    }
    if (typeof G.updatePortalSidebarSessionMeta === "function") {
      G.updatePortalSidebarSessionMeta();
    }
  } catch (_e) {
    /* noop */
  }
  try {
    const u = currentUser();
    if (u && typeof G.enforcePortalViewFromUrl === "function") {
      G.enforcePortalViewFromUrl(u);
    }
  } catch (_e) {
    /* noop */
  }
  const positionsPromise = G.__portalBootstrapPositionsFresh
    ? Promise.resolve()
    : typeof G.refreshPositionsCatalogFromApi === "function"
      ? G.refreshPositionsCatalogFromApi({ rerender: false })
      : Promise.resolve();
  void positionsPromise.finally(() => {
    G.__portalBootstrapPositionsFresh = false;
    try {
      if (typeof G.dispatchPositionsCatalogUpdated === "function") {
        G.dispatchPositionsCatalogUpdated();
      }
    } catch (_pos) {
      /* noop */
    }
    const unsaved =
      typeof G.hasUnsavedPortalFormData === "function" ? Boolean(G.hasUnsavedPortalFormData()) : false;
    if (!unsaved) {
      if (state.currentView === "notifications") {
        if (typeof G.scheduleNotificationsViewRenderIfChanged === "function") {
          G.scheduleNotificationsViewRenderIfChanged();
        }
      } else {
        scheduleRenderPortalView();
      }
    }
    if (typeof G.updateNotificationBadge === "function") {
      G.updateNotificationBadge();
    }
  });
}
