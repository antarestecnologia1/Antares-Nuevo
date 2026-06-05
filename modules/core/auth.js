/**
 * Autenticación de sesión, helpers de login recordado y comprobaciones de permisos del portal.
 * `read` / `write` delegan en `window.AntaresPersistence` (registrado por `persistence.js`).
 */
import {
  ALL_PERMISSIONS,
  KEYS,
  LOGIN_REMEMBER_STORAGE_KEY,
  PERMISSIONS,
  ROLES
} from "./config.js";
import { state } from "./store.js";

const SESSION_IDLE_MS = 30 * 60 * 1000;
const SESSION_ACTIVITY_THROTTLE_MS = 30 * 1000;
const SESSION_ACTIVITY_PERSIST_MIN_MS = 2 * 60 * 1000;

let __sessionActivityThrottleAt = 0;
let __sessionActivityMemoryAt = 0;
let __lastSessionActivityPersistAt = 0;

const LOGISTICS_OPERATOR_PERMISSIONS = Object.freeze([
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.TRANSPORT_REQUESTS,
  PERMISSIONS.AUTHORIZATIONS_TRANSPORT,
  PERMISSIONS.TRANSPORT_TRIPS,
  PERMISSIONS.TRANSPORT_CALENDAR,
  PERMISSIONS.TRANSPORT_VEHICLES,
  PERMISSIONS.TRANSPORT_DRIVERS,
  PERMISSIONS.PROFILE_VIEW,
  PERMISSIONS.NOTIFICATIONS_VIEW
]);

/** Mapa vista del portal → permiso “principal” para `hasPermission` (vistas con regla especial en {@link canAccessView}). */
export const VIEW_PERMISSIONS = Object.freeze({
  dashboard: PERMISSIONS.DASHBOARD_VIEW,
  requests: PERMISSIONS.CLIENT_REQUESTS,
  "transport-trips": PERMISSIONS.TRANSPORT_TRIPS,
  "transport-vehicles": PERMISSIONS.TRANSPORT_VEHICLES_VIEW,
  "transport-drivers": PERMISSIONS.TRANSPORT_DRIVERS,
  "transport-calendar": PERMISSIONS.TRANSPORT_CALENDAR,
  history: PERMISSIONS.TRANSPORT_HISTORY,
  reports: PERMISSIONS.TRANSPORT_HISTORY,
  payroll: PERMISSIONS.PAYROLL_MANAGE,
  hiring: PERMISSIONS.HIRING_MANAGE,
  "labor-compliance": PERMISSIONS.SST_COMPLIANCE,
  "admin-users": PERMISSIONS.USERS_MANAGE,
  authorizations: PERMISSIONS.AUTHORIZATIONS_MANAGE,
  profile: PERMISSIONS.PROFILE_VIEW,
  notifications: PERMISSIONS.NOTIFICATIONS_VIEW,
  "contact-leads": PERMISSIONS.CONTACT_B2B_VIEW
});

const AUTHORIZATION_SECTION_PERMISSIONS = Object.freeze({
  portal_registrations: PERMISSIONS.AUTHORIZATIONS_PORTAL_REGISTRATIONS,
  transport_requests: PERMISSIONS.AUTHORIZATIONS_TRANSPORT,
  portal_access: PERMISSIONS.AUTHORIZATIONS_PORTAL_USERS,
  transport_fleet: PERMISSIONS.AUTHORIZATIONS_FLEET,
  workforce: PERMISSIONS.AUTHORIZATIONS_WORKFORCE,
  hr_absences: PERMISSIONS.AUTHORIZATIONS_HR_ABSENCES,
  payroll_pay: PERMISSIONS.AUTHORIZATIONS_PAYROLL_PAY
});

export const VEHICLE_GRANULAR_PERMISSIONS = Object.freeze([
  PERMISSIONS.TRANSPORT_VEHICLES_VIEW,
  PERMISSIONS.TRANSPORT_VEHICLES_CREATE,
  PERMISSIONS.TRANSPORT_VEHICLES_EDIT,
  PERMISSIONS.TRANSPORT_VEHICLES_STATUS,
  PERMISSIONS.TRANSPORT_VEHICLES_DELETE
]);

const APPROVAL_TYPE_META = Object.freeze({
  create_user: { sectionKey: "portal_access", label: "Alta de usuario del portal" },
  create_driver: { sectionKey: "transport_fleet", label: "Alta de conductor" },
  create_employee: { sectionKey: "workforce", label: "Alta de colaborador (gestión humana)" },
  register_hr_absence: { sectionKey: "hr_absences", label: "Registro de ausencia o incapacidad" },
  mark_payroll_paid: { sectionKey: "payroll_pay", label: "Confirmar pago de liquidación" },
  approve_trip_request: { sectionKey: "misc", label: "Solicitud de transporte pendiente (historico en cola)" }
});

const ACCOUNT_STATUS = Object.freeze({
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  RECHAZADO: "rechazado"
});

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

export function getSession() {
  return read(KEYS.session, null);
}

export function setSession(sessionData) {
  write(KEYS.session, sessionData);
  state.session = sessionData;
  if (sessionData && typeof sessionData.lastActivityAt === "number") {
    __sessionActivityMemoryAt = Math.max(__sessionActivityMemoryAt, sessionData.lastActivityAt);
    __lastSessionActivityPersistAt = Date.now();
  }
}

export function getEffectiveLastActivityAt() {
  const s = getSession();
  const stored = s && typeof s.lastActivityAt === "number" ? s.lastActivityAt : 0;
  return Math.max(stored, __sessionActivityMemoryAt);
}

export function flushSessionActivityToStorage() {
  const s = getSession();
  if (!s || !__sessionActivityMemoryAt) return;
  const merged = Math.max(typeof s.lastActivityAt === "number" ? s.lastActivityAt : 0, __sessionActivityMemoryAt);
  if (merged <= (typeof s.lastActivityAt === "number" ? s.lastActivityAt : 0)) return;
  write(KEYS.session, { ...s, lastActivityAt: merged });
  state.session = { ...s, lastActivityAt: merged };
  __lastSessionActivityPersistAt = Date.now();
}

function bumpSessionActivityTimestamp() {
  const s = getSession();
  if (!s) return;
  const now = Date.now();
  __sessionActivityMemoryAt = now;
  if (state.session) state.session = { ...state.session, lastActivityAt: now };
  const persistAge = now - __lastSessionActivityPersistAt;
  if (persistAge >= SESSION_ACTIVITY_PERSIST_MIN_MS) {
    const cur = getSession();
    if (cur) setSession({ ...cur, lastActivityAt: now });
  }
}

export function throttledBumpSessionActivity() {
  const now = Date.now();
  if (now - __sessionActivityThrottleAt < SESSION_ACTIVITY_THROTTLE_MS) return;
  __sessionActivityThrottleAt = now;
  bumpSessionActivityTimestamp();
}

/** Llamar desde `clearSession` en app.js al invalidar sesión. */
export function resetSessionActivityMemory() {
  __sessionActivityMemoryAt = 0;
  __lastSessionActivityPersistAt = 0;
  __sessionActivityThrottleAt = 0;
}

export { SESSION_IDLE_MS };

export function readRememberedLoginCredentials() {
  try {
    const raw = localStorage.getItem(LOGIN_REMEMBER_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object") return null;
    const email = String(o.email || "").trim();
    if (!email) return null;
    return { email, password: String(o.password || "") };
  } catch {
    return null;
  }
}

export function writeRememberedLoginCredentials(email, password) {
  try {
    localStorage.setItem(
      LOGIN_REMEMBER_STORAGE_KEY,
      JSON.stringify({
        email: String(email || "").trim(),
        password: String(password || ""),
        savedAt: Date.now()
      })
    );
  } catch (_) {}
}

export function clearRememberedLoginCredentials() {
  try {
    localStorage.removeItem(LOGIN_REMEMBER_STORAGE_KEY);
  } catch (_) {}
}

export function normalizeUserAccountStatus(user) {
  const raw =
    user?.accountStatus ??
    user?.account_status ??
    user?.estadoCuenta ??
    user?.estado_cuenta ??
    "";
  return String(raw)
    .trim()
    .toLowerCase();
}

export function pendingUserOrigin(user) {
  const raw = String(user?.source || "").trim().toLowerCase();
  if (raw === "supabase_auth_only") return "supabase_auth_only";
  return "portal_db";
}

export function currentUser() {
  const users = readArray(KEYS.users);
  const sid = state.session?.userId;
  if (sid === undefined || sid === null) return null;
  return users.find((u) => String(u.id) === String(sid)) || null;
}

export function portalUserNameLooksLikeEmailPlaceholder(nameStr, emailStr) {
  const raw = String(nameStr ?? "").trim();
  const em = String(emailStr ?? "").trim().toLowerCase();
  if (!raw || !em) return !raw;
  if (raw.toLowerCase() === em) return true;
  const local = em.split("@")[0] || "";
  if (!local) return false;
  const fold = (s) => String(s || "").replace(/[.\s_-]+/g, "").toLowerCase();
  return fold(raw) === fold(local);
}

export function getPortalUserDisplayName(user) {
  if (!user) return "Usuario";
  const composed = [user.firstName, user.middleName, user.lastName, user.secondLastName]
    .map((x) => String(x ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .trim();
  const raw = String(user.name ?? "").trim();
  const em = String(user.email ?? "").trim();
  const placeholder = portalUserNameLooksLikeEmailPlaceholder(raw, em);
  if (composed && (!raw || placeholder)) return composed;
  if (raw && !placeholder && !raw.includes("@")) return raw;
  if (composed) return composed;
  if (raw) {
    if (raw.includes("@")) {
      const lp = raw.split("@")[0];
      return lp.replace(/[._-]+/g, " ").trim() || raw;
    }
    return raw;
  }
  const eml = em.toLowerCase();
  if (eml) {
    const local = eml.split("@")[0] || eml;
    const nicer = local.replace(/[._-]+/g, " ").trim();
    return nicer || em;
  }
  return "Usuario";
}

export function defaultPermissionsForRole(role) {
  if (role === ROLES.ADMIN) return [...ALL_PERMISSIONS];
  if ([ROLES.RRHH, ROLES.ADMINISTRACION, ROLES.LIDER_ADMINISTRATIVO].includes(role)) {
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.HIRING_MANAGE,
      PERMISSIONS.SST_COMPLIANCE,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW
    ];
  }
  if (role === ROLES.AUXILIAR_ADMINISTRATIVO) {
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW
    ];
  }
  if (role === ROLES.LOGISTICA) return [...LOGISTICS_OPERATOR_PERMISSIONS];
  return [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CLIENT_REQUESTS,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW
  ];
}

export function effectiveUserPermissions(user) {
  const role = user?.role || ROLES.CLIENT;
  const current = Array.isArray(user?.permissions) ? user.permissions : [];
  const filtered = current.filter((p) => ALL_PERMISSIONS.includes(p));
  if (filtered.length > 0) return filtered;
  return defaultPermissionsForRole(role);
}

export function hasPermission(user, permission) {
  if (!permission) return true;
  return effectiveUserPermissions(user).includes(permission);
}

export function isAdminActor(user) {
  const actor = user || currentUser();
  return actor?.role === ROLES.ADMIN;
}

export function hasAuthorizationManageAll(user) {
  return hasPermission(user, PERMISSIONS.AUTHORIZATIONS_MANAGE);
}

function hasVehicleManageAll(user) {
  return hasPermission(user, PERMISSIONS.TRANSPORT_VEHICLES);
}

export function canAccessVehiclesView(user) {
  if (!user) return false;
  if (hasVehicleManageAll(user)) return true;
  return VEHICLE_GRANULAR_PERMISSIONS.some((perm) => hasPermission(user, perm));
}

export function canCreateVehicle(user) {
  const u = user || currentUser();
  if (!u) return false;
  return hasVehicleManageAll(u) || hasPermission(u, PERMISSIONS.TRANSPORT_VEHICLES_CREATE);
}

export function canEditVehicle(user) {
  const u = user || currentUser();
  if (!u) return false;
  return hasVehicleManageAll(u) || hasPermission(u, PERMISSIONS.TRANSPORT_VEHICLES_EDIT);
}

export function canToggleVehicleStatus(user) {
  const u = user || currentUser();
  if (!u) return false;
  return hasVehicleManageAll(u) || hasPermission(u, PERMISSIONS.TRANSPORT_VEHICLES_STATUS);
}

export function canDeleteVehicle(user) {
  const u = user || currentUser();
  if (!u) return false;
  return isAdminActor(u) || hasVehicleManageAll(u) || hasPermission(u, PERMISSIONS.TRANSPORT_VEHICLES_DELETE);
}

export function canAccessAuthorizationSection(user, sectionKey) {
  if (!user) return false;
  if (hasAuthorizationManageAll(user)) return true;
  const perm = AUTHORIZATION_SECTION_PERMISSIONS[String(sectionKey || "")];
  return perm ? hasPermission(user, perm) : false;
}

export function canAccessAuthorizationsView(user) {
  if (!user) return false;
  if (hasAuthorizationManageAll(user)) return true;
  return Object.values(AUTHORIZATION_SECTION_PERMISSIONS).some((perm) => hasPermission(user, perm));
}

export function canApproveTransportRequests(user) {
  const u = user || currentUser();
  if (!u) return false;
  return (
    isAdminActor(u) ||
    hasAuthorizationManageAll(u) ||
    hasPermission(u, PERMISSIONS.AUTHORIZATIONS_TRANSPORT)
  );
}

export function canApprovePortalRegistration(user) {
  const u = user || currentUser();
  if (!u) return false;
  return (
    isAdminActor(u) ||
    hasAuthorizationManageAll(u) ||
    hasPermission(u, PERMISSIONS.AUTHORIZATIONS_PORTAL_REGISTRATIONS)
  );
}

function approvalTypeToSectionKey(approvalType) {
  return APPROVAL_TYPE_META[String(approvalType || "")]?.sectionKey || "misc";
}

export function canApproveInternalAuthorization(user, approvalType) {
  const u = user || currentUser();
  if (!u) return false;
  if (isAdminActor(u) || hasAuthorizationManageAll(u)) return true;
  const sectionKey = approvalTypeToSectionKey(approvalType);
  if (sectionKey === "misc") return false;
  return canAccessAuthorizationSection(u, sectionKey);
}

export function canManageTransportTrips(user) {
  const u = user || currentUser();
  if (!u) return false;
  return isAdminActor(u) || hasPermission(u, PERMISSIONS.TRANSPORT_TRIPS);
}

export function canEditFleetDriverAsAdmin(user) {
  return isAdminActor(user);
}

export function canManageHiringModule(user) {
  const actor = user || currentUser();
  return isAdminActor(actor) || hasPermission(actor, PERMISSIONS.HIRING_MANAGE);
}

export function canPerformPermissionGatedAction(user, action, trigger) {
  if (!user || isAdminActor(user)) return true;
  if (action === "approve" || action === "reject") return canApproveTransportRequests(user);
  if (action === "approve-registration" || action === "reject-registration") {
    return canApprovePortalRegistration(user);
  }
  if (action === "approval-approve" || action === "approval-reject") {
    const id = String(trigger?.dataset?.id || "");
    const approval = read(KEYS.approvals, []).find((a) => String(a.id) === id && a.status === "pendiente");
    return approval ? canApproveInternalAuthorization(user, approval.type) : false;
  }
  if (action === "trip-status" || action === "edit-trip") return canManageTransportTrips(user);
  if (action === "edit-vehicle") return canEditVehicle(user);
  if (action === "toggle-vehicle") return canToggleVehicleStatus(user);
  if (action === "delete-vehicle") return canDeleteVehicle(user);
  return false;
}

export function canAccessView(user, view) {
  const v = String(view || "");
  if (v === "authorizations") return canAccessAuthorizationsView(user);
  if (v === "transport-vehicles") return canAccessVehiclesView(user);
  if (v === "requests") {
    return (
      hasPermission(user, PERMISSIONS.CLIENT_REQUESTS) || hasPermission(user, PERMISSIONS.TRANSPORT_REQUESTS)
    );
  }
  const perm = VIEW_PERMISSIONS[v];
  return perm ? hasPermission(user, perm) : false;
}

export function canAccessRRHH(role) {
  return [
    ROLES.ADMIN,
    ROLES.RRHH,
    ROLES.ADMINISTRACION,
    ROLES.AUXILIAR_ADMINISTRATIVO,
    ROLES.LIDER_ADMINISTRATIVO
  ].includes(role);
}

export function isViewAllowedForUser(user, view) {
  const PortalAccessCore = window.PortalCoreAccess || {
    isViewAllowed: ({ user: u, view: vi, canAccessView: cav, portalArch, ROLES: R, canAccessRRHH: carrhh }) =>
      Boolean(u) && cav(u, vi) && portalArch.isAllowedByRole(u, vi, { ROLES: R, canAccessRRHH: carrhh })
  };
  const PortalArch = window.PortalArchitecture || {
    isKnownView: (vi) => Boolean(VIEW_PERMISSIONS[String(vi || "")]),
    shouldUseShell: () => true,
    getTitle: (vi) => String(vi || "Dashboard"),
    getLayoutPlan: () => null,
    isAllowedByRole: () => true,
    resolveContent: ({ accessDeniedFactory }) => accessDeniedFactory()
  };
  return PortalAccessCore.isViewAllowed({
    user,
    view,
    canAccessView,
    portalArch: PortalArch,
    ROLES,
    canAccessRRHH
  });
}

export { ACCOUNT_STATUS };
