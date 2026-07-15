/**
 * Autenticación de sesión, helpers de login recordado y comprobaciones de permisos del portal.
 * `read` / `write` delegan en `window.AntaresPersistence` (registrado por `persistence.js`).
 */
import {
  ALL_PERMISSIONS,
  APPROVAL_TYPE_META,
  assignablePermissionsForRole,
  CLIENT_ROLE_PERMISSIONS,
  DATA_POLICY_URL,
  DATA_POLICY_VERSION,
  KEYS,
  LOGIN_REMEMBER_STORAGE_KEY,
  PERMISSIONS,
  REGISTER_PRIVACY_URL,
  REGISTER_TERMS_URL,
  ROLES,
  SESSION_API_REFRESH_MS,
  SESSION_CLIENT_TOKEN_ROTATE_MS,
  SESSION_IDLE_PUBLIC_NOTICE_KEY,
  userPendingLegalAcceptances,
  userRequiresDataPolicyAcceptance,
  userRequiresLegalAcceptanceGate,
  userRequiresTermsAcceptance
} from "./config.js";
import { state } from "./store.js";
import { failPortalField } from "../ui/modals.js";
import { syncPayloadForEditedRow } from "./data-io.js";

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
  "document-management": PERMISSIONS.DOCUMENT_VIEW,
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

export const DOCUMENT_GRANULAR_PERMISSIONS = Object.freeze([
  PERMISSIONS.DOCUMENT_VIEW,
  PERMISSIONS.DOCUMENT_UPLOAD,
  PERMISSIONS.DOCUMENT_EDIT,
  PERMISSIONS.DOCUMENT_DELETE
]);

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

/** True si hay sesión local y no han pasado 30 min desde la última actividad registrada. */
export function isSessionWithinIdleWindow() {
  const s = getSession();
  if (!s) return false;
  const last = getEffectiveLastActivityAt();
  if (!last) return true;
  return Date.now() - last <= SESSION_IDLE_MS;
}

export function readRememberedLoginCredentials() {
  try {
    const raw = localStorage.getItem(LOGIN_REMEMBER_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object") return null;
    const email = String(o.email || "").trim();
    if (!email) return null;
    if (Object.prototype.hasOwnProperty.call(o, "password")) {
      writeRememberedLoginCredentials(email);
    }
    return { email };
  } catch {
    return null;
  }
}

export function writeRememberedLoginCredentials(email) {
  try {
    localStorage.setItem(
      LOGIN_REMEMBER_STORAGE_KEY,
      JSON.stringify({
        email: String(email || "").trim(),
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

/** Usado en login, usuarios, autorizaciones y dominio SST. */
export function isPortalUserPendingApproval(user) {
  if (pendingUserOrigin(user) === "supabase_auth_only") return true;
  const s = normalizeUserAccountStatus(user);
  return s === ACCOUNT_STATUS.PENDIENTE || s === "pending";
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

export function getPortalUserFirstName(user) {
  if (!user) return "Usuario";
  const firstName = String(user.firstName ?? "").trim();
  if (firstName) return firstName;
  const displayName = getPortalUserDisplayName(user);
  return String(displayName).trim().split(/\s+/)[0] || displayName;
}

export function defaultPermissionsForRole(role) {
  if (role === ROLES.ADMIN) return [...ALL_PERMISSIONS];
  if ([ROLES.RRHH, ROLES.ADMINISTRACION, ROLES.LIDER_ADMINISTRATIVO].includes(role)) {
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.HIRING_MANAGE,
      PERMISSIONS.SST_COMPLIANCE,
      PERMISSIONS.DOCUMENT_MANAGE,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW
    ];
  }
  if (role === ROLES.AUXILIAR_ADMINISTRATIVO) {
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.DOCUMENT_MANAGE,
      PERMISSIONS.PROFILE_VIEW,
      PERMISSIONS.NOTIFICATIONS_VIEW
    ];
  }
  if (role === ROLES.LOGISTICA) return [...LOGISTICS_OPERATOR_PERMISSIONS];
  return [...CLIENT_ROLE_PERMISSIONS];
}

export function portalDefaultViewForUser(user) {
  if (!user) return "dashboard";
  if (user.role === ROLES.CLIENT) {
    if (hasPermission(user, PERMISSIONS.CLIENT_REQUESTS)) return "requests";
    if (hasPermission(user, PERMISSIONS.PROFILE_VIEW)) return "profile";
    return "profile";
  }
  if (hasPermission(user, PERMISSIONS.DASHBOARD_VIEW)) return "dashboard";
  return "profile";
}

export function effectiveUserPermissions(user) {
  const role = user?.role || ROLES.CLIENT;
  const assignable = new Set(assignablePermissionsForRole(role));
  const current = Array.isArray(user?.permissions) ? user.permissions : [];
  const filtered = current.filter((p) => assignable.has(p));
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

function hasDocumentManageAll(user) {
  return hasPermission(user, PERMISSIONS.DOCUMENT_MANAGE);
}

export function canAccessDocumentsView(user) {
  if (!user) return false;
  if (hasDocumentManageAll(user)) return true;
  return DOCUMENT_GRANULAR_PERMISSIONS.some((perm) => hasPermission(user, perm));
}

export function canUploadDocuments(user) {
  const u = user || currentUser();
  if (!u) return false;
  return hasDocumentManageAll(u) || hasPermission(u, PERMISSIONS.DOCUMENT_UPLOAD);
}

export function canEditDocuments(user) {
  const u = user || currentUser();
  if (!u) return false;
  return hasDocumentManageAll(u) || hasPermission(u, PERMISSIONS.DOCUMENT_EDIT);
}

export function canDeleteDocuments(user) {
  const u = user || currentUser();
  if (!u) return false;
  return isAdminActor(u) || hasDocumentManageAll(u) || hasPermission(u, PERMISSIONS.DOCUMENT_DELETE);
}

export function canDownloadDocuments(user) {
  return canAccessDocumentsView(user);
}

export function canAccessAuthorizationSection(user, sectionKey) {
  if (!user) return false;
  if (hasAuthorizationManageAll(user)) return true;
  const key = String(sectionKey || "");
  if (key === "workforce" && canManagePayrollModule(user)) return true;
  const perm = AUTHORIZATION_SECTION_PERMISSIONS[key];
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
  const type = String(approvalType || "");
  if ((type === "create_employee" || type === "update_employee") && canManagePayrollModule(u)) return true;
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

export function canManagePayrollModule(user) {
  const actor = user || currentUser();
  return isAdminActor(actor) || hasPermission(actor, PERMISSIONS.PAYROLL_MANAGE);
}

export function canManageSstModule(user) {
  const actor = user || currentUser();
  return isAdminActor(actor) || hasPermission(actor, PERMISSIONS.SST_COMPLIANCE);
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

const CLIENT_PORTAL_VIEWS = new Set(["requests", "profile"]);

export function canAccessView(user, view) {
  const v = String(view || "");
  if (user?.role === ROLES.CLIENT && !CLIENT_PORTAL_VIEWS.has(v)) {
    return false;
  }
  if (v === "authorizations") return canAccessAuthorizationsView(user);
  if (v === "transport-vehicles") return canAccessVehiclesView(user);
  if (v === "document-management") return canAccessDocumentsView(user);
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



import { reqRead, reqWrite, filterPortalRequestsForServerCache } from "../domain/solicitudes.domain.js";
import { nodes } from "./store.js";
import {
  escapeHtml,
  escapeAttr,
  normalizeEmail,
  companyKindLabel,
  normalizePayloadTextFields,
  normalizePersonTypeForDb,
  normalizeRegistrationKindForDb,
  readRegistrationKindFromForm,
  normalizeLatinUpperForDb,
  fieldLabel,
  newUuidV4,
  nowIso,
  devWarn
} from "./utils.js";
import { normalizeLatinForDb } from "../domain/payroll-catalog-sanitize.domain.js";
import { findPendingCreateEmployeeApproval } from "../domain/pending-employee-approval.domain.js";
import {
  decodeJwtPayload,
  upsertPortalUserStubFromJwtPayload,
  buildProfileSnapshotFromUserRow,
  syncSessionProfileSnapshotFromCache,
  portalCanRefreshFromApi,
  normalizePortalBootstrapPositionRow,
  startPortalBootstrapForInteractiveSession,
  savePortalSnapshotAfterBootstrap
} from "./bootstrap.js";
const IC = typeof window !== "undefined" ? window.IC || {} : {};


async function __authHashPassword(raw) {
  const input = String(raw || "");
  if (!input) return "";
  if (input.startsWith("sha256:")) return input;
  if (!window.crypto?.subtle) return `sha256:${btoa(input)}`;
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hex = [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256:${hex}`;
}
async function __authVerifyPassword(raw, storedHash) {
  if (!String(storedHash || "").startsWith("sha256:")) {
    return String(raw || "") === String(storedHash || "");
  }
  const hashed = await __authHashPassword(raw);
  return hashed === storedHash;
}
function __validatePasswordPolicy(password) {
  const p = String(password || "");
  if (p.length < 10) return { ok: false, key: "passwordPolicyLength" };
  if (!/[a-z]/.test(p)) return { ok: false, key: "passwordPolicyLower" };
  if (!/[A-Z]/.test(p)) return { ok: false, key: "passwordPolicyUpper" };
  if (!/[0-9]/.test(p)) return { ok: false, key: "passwordPolicyDigit" };
  if (!/[^A-Za-z0-9]/.test(p)) return { ok: false, key: "passwordPolicySpecial" };
  return { ok: true };
}
function __getPasswordStrengthReport(password) {
  const p = String(password || "");
  const checks = [
    { rule: "len", ok: p.length >= 10 },
    { rule: "lower", ok: /[a-z]/.test(p) },
    { rule: "upper", ok: /[A-Z]/.test(p) },
    { rule: "digit", ok: /[0-9]/.test(p) },
    { rule: "special", ok: /[^A-Za-z0-9]/.test(p) }
  ];
  const met = checks.filter((c) => c.ok).length;
  const pct = Math.round((met / 5) * 100);
  let tier = "weak";
  if (pct >= 80) tier = "strong";
  else if (pct >= 60) tier = "good";
  else if (pct >= 40) tier = "fair";
  let headline = "Indique una contraseña segura";
  if (p.length > 0) {
    if (met === 5) headline = "Excelente: cumple todos los requisitos";
    else if (met === 4) headline = "Muy buena: falta un detalle";
    else if (met === 3) headline = "Media: refuerce los puntos pendientes";
    else if (met >= 1) headline = "Débil: complete más requisitos";
    else headline = "Muy débil: siga las indicaciones";
  }
  return { pct, tier, met, checks, headline };
}
const __PASSWORD_TIER_LABELS = Object.freeze({
  weak: "Débil",
  fair: "Regular",
  good: "Buena",
  strong: "Fuerte"
});

function __passwordStrengthSegmentCount(met) {
  if (met <= 0) return 0;
  if (met <= 2) return 1;
  if (met === 3) return 2;
  if (met === 4) return 3;
  return 4;
}

function __bindPasswordStrengthSuite(passInput, container) {
  if (!passInput || !container) return;
  const fill = container.querySelector(".password-strength-bar-fill");
  const pill = container.querySelector(".password-strength-pill");
  const headline = container.querySelector(".password-strength-headline");
  const bar = container.querySelector(".password-strength-bar");
  const tierLabel = container.querySelector(".password-strength-tier");
  const segmentsWrap = container.querySelector(".password-strength-segments");
  const segments = segmentsWrap ? [...segmentsWrap.querySelectorAll(".password-strength-segment")] : [];
  const rules = [...container.querySelectorAll(".password-rule-grid li[data-rule]")];
  const sync = () => {
    const r = __getPasswordStrengthReport(passInput.value);
    const active = passInput.value.length > 0;
    const complete = r.met === 5;
    if (fill) {
      fill.style.width = `${r.pct}%`;
      fill.className = `password-strength-bar-fill password-strength-bar-fill--${r.tier}`;
    }
    if (bar) {
      bar.setAttribute("aria-valuenow", String(r.pct));
      bar.classList.toggle("password-strength-bar--active", active);
      bar.classList.toggle("password-strength-bar--complete", complete);
    }
    if (pill) {
      pill.textContent = `${r.pct}%`;
      pill.className = `password-strength-pill password-strength-pill--${r.tier}`;
    }
    if (headline) headline.textContent = r.headline;
    if (tierLabel) {
      tierLabel.textContent = active ? __PASSWORD_TIER_LABELS[r.tier] || "—" : "—";
      tierLabel.dataset.tier = active ? r.tier : "empty";
    }
    if (segments.length) {
      const filled = __passwordStrengthSegmentCount(r.met);
      segments.forEach((seg, idx) => {
        const on = idx < filled;
        seg.classList.toggle("password-strength-segment--on", on);
        seg.classList.toggle(`password-strength-segment--${r.tier}`, on);
      });
      if (segmentsWrap) {
        segmentsWrap.setAttribute("aria-valuenow", String(filled));
        segmentsWrap.dataset.tier = active ? r.tier : "empty";
      }
    }
    for (const li of rules) {
      const key = li.getAttribute("data-rule");
      const ok = r.checks.find((c) => c.rule === key)?.ok;
      li.classList.toggle("password-rule-met", Boolean(ok));
    }
  };
  passInput.addEventListener("input", sync);
  sync();
}
function __readFormEntriesNormalized(formEl) {
  const fn = window.AntaresValidation?.readFormEntriesNormalized;
  if (typeof fn === "function") return fn(formEl);
  return normalizePayloadTextFields(Object.fromEntries(new FormData(formEl).entries()));
}
function __isCompanyRecordActive(c) {
  return c && c.active !== false;
}


let __authSuccessCallback = () => {};
export function setAuthSuccessCallback(fn) {
  __authSuccessCallback = typeof fn === "function" ? fn : () => {};
}
export function invokeAuthSuccessCallback() {
  try {
    __authSuccessCallback();
  } catch (_e) {
    /* noop */
  }
}

function __resolveLegalAcceptanceGateForUser(user) {
  if (!user || typeof user !== "object") return true;
  return userRequiresLegalAcceptanceGate(user);
}

function __normalizeServerLegalUserRow(meRow) {
  if (!meRow || typeof meRow !== "object") return null;
  const dataPolicyAcceptedAt = meRow.dataPolicyAcceptedAt ?? meRow.fechaAceptacionPoliticaDatos ?? null;
  const dataPolicyVersion = String(meRow.dataPolicyVersion ?? meRow.versionPoliticaDatos ?? "").trim() || null;
  const termsAcceptedAt = meRow.termsAcceptedAt ?? meRow.fechaAceptacionTerminos ?? null;
  const requiresDataPolicyAcceptance =
    meRow.requiresDataPolicyAcceptance === true
      ? true
      : meRow.requiresDataPolicyAcceptance === false
        ? false
        : userRequiresDataPolicyAcceptance({ dataPolicyAcceptedAt, dataPolicyVersion });
  const requiresTermsAcceptance =
    meRow.requiresTermsAcceptance === true
      ? true
      : meRow.requiresTermsAcceptance === false
        ? false
        : userRequiresTermsAcceptance({ termsAcceptedAt });
  return {
    ...meRow,
    dataPolicyAcceptedAt,
    dataPolicyVersion,
    termsAcceptedAt,
    requiresDataPolicyAcceptance,
    requiresTermsAcceptance
  };
}

/** Alinea caché y sesión con `usuarios` (GET /portal/me). */
function __applyServerLegalUserRow(meRow) {
  const normalized = __normalizeServerLegalUserRow(meRow);
  if (!normalized?.id) return null;
  const uid = String(normalized.id);
  if (typeof window.upsertPortalUserRowIntoCache === "function") {
    window.upsertPortalUserRowIntoCache(normalized);
  }
  const session = getSession();
  if (!session || String(session.userId) !== uid) return normalized;
  const pending = userPendingLegalAcceptances(normalized);
  const next = { ...session };
  if (pending.dataPolicy) {
    delete next.dataPolicyAcceptedAt;
    delete next.dataPolicyVersion;
    next.requiresDataPolicyAcceptance = true;
  } else {
    next.dataPolicyAcceptedAt = normalized.dataPolicyAcceptedAt;
    next.dataPolicyVersion = normalized.dataPolicyVersion;
    next.requiresDataPolicyAcceptance = false;
  }
  if (pending.terms) {
    delete next.termsAcceptedAt;
    next.requiresTermsAcceptance = true;
  } else {
    next.termsAcceptedAt = normalized.termsAcceptedAt;
    next.requiresTermsAcceptance = false;
  }
  if (!pending.dataPolicy && !pending.terms) {
    delete next.dataPolicyGatePending;
  }
  next.profileSnapshot = buildProfileSnapshotFromUserRow(normalized) ?? next.profileSnapshot;
  setSession(next);
  syncSessionProfileSnapshotFromCache?.();
  return normalized;
}

async function __syncLegalAcceptanceStateFromServer() {
  if (!portalCanRefreshFromApi()) return false;
  const api = window.AntaresApi;
  if (!api?.getJson) return false;
  try {
    const me = await api.getJson("/portal/me");
    if (!me?.id) return false;
    __applyServerLegalUserRow(me);
    return true;
  } catch (_e) {
    return false;
  }
}

function __sessionRequiresLegalAcceptanceGate(session, user) {
  if (session?.dataPolicyGatePending === true) return true;
  return __resolveLegalAcceptanceGateForUser(user);
}

function __markDataPolicyGatePendingInSession() {
  const session = getSession();
  if (!session || session.dataPolicyGatePending === true) return;
  setSession({ ...session, dataPolicyGatePending: true });
}

function __clearDataPolicyGatePendingInSession() {
  const session = getSession();
  if (!session || !session.dataPolicyGatePending) return;
  const next = { ...session };
  delete next.dataPolicyGatePending;
  setSession(next);
}

function __persistLegalAcceptanceLocally(meRow, actor) {
  const uid = String(meRow?.id || actor?.id || "").trim();
  if (!uid) return false;
  const normalized = __normalizeServerLegalUserRow(meRow);
  if (typeof window.upsertPortalUserRowIntoCache === "function") {
    window.upsertPortalUserRowIntoCache(normalized);
  }
  const users = read(KEYS.users, []);
  const idx = users.findIndex((u) => String(u.id) === uid);
  const nextRow = { ...(idx >= 0 ? users[idx] : normalized), ...normalized };
  const others = users.filter((u) => String(u.id) !== uid);
  write(KEYS.users, [nextRow, ...others], { skipSyncSchedule: true });
  const saved = read(KEYS.users, []).find((u) => String(u.id) === uid);
  const pending = userPendingLegalAcceptances(saved);
  if (pending.dataPolicy || pending.terms) return false;
  __applyServerLegalUserRow(saved);
  __clearDataPolicyGatePendingInSession();
  try {
    savePortalSnapshotAfterBootstrap({ immediate: true, force: true, full: true });
  } catch (_e) {
    /* snapshot opcional */
  }
  return true;
}

function __formCheckboxAccepted(data, fieldName, form) {
  const input = form?.querySelector?.(`[name="${fieldName}"]`);
  if (input instanceof HTMLInputElement && input.type === "checkbox") {
    return input.checked;
  }
  const value = data?.[fieldName];
  if (value === true || value === 1) return true;
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return normalized === "true" || normalized === "on" || normalized === "1";
}

function __readLegalAcceptancePendingFromForm(form) {
  return {
    dataPolicy: form?.dataset?.needsDataPolicy === "1",
    terms: form?.dataset?.needsTerms === "1"
  };
}

function __dataPolicyModalMarkup(pending = { dataPolicy: true, terms: false }) {
  const needsDataPolicy = pending.dataPolicy === true;
  const needsTerms = pending.terms === true;
  const policyUrl = String(window.DATA_POLICY_URL || "./documentacion/politica-tratamiento-datos-personales.pdf");
  const termsUrl = String(window.REGISTER_TERMS_URL || "./terminos-condiciones.html");
  const privacyUrl = String(window.REGISTER_PRIVACY_URL || "./politica-privacidad.html");
  const fileIcon = IC.file || "";
  const shieldIcon = IC.shield || "";
  const checkIcon = IC.check || "";
  const chevronIcon = IC.chevronRight || "";
  const lockIcon = IC.lock || "";
  const title =
    needsDataPolicy && needsTerms
      ? "Documentos legales pendientes"
      : needsTerms
        ? "Términos y privacidad"
        : "Política de datos personales";
  const lead =
    needsDataPolicy && needsTerms
      ? "Antes de continuar debe leer y aceptar los documentos legales que aún no ha registrado en el sistema."
      : needsTerms
        ? "Antes de continuar debe leer y aceptar los <strong>Términos de uso</strong> y la <strong>Política de privacidad</strong>."
        : `Antes de continuar debe leer y aceptar la <strong>Política de Tratamiento de Datos Personales</strong>.`;
  const policyDocCard = needsDataPolicy
    ? `
      <a class="data-policy-doc-card" href="${escapeAttr(policyUrl)}" target="_blank" rel="noopener noreferrer">
        <span class="data-policy-doc-card__pdf" aria-hidden="true">${fileIcon}<small>PDF</small></span>
        <span class="data-policy-doc-card__copy">
          <strong>Ver Política de Tratamiento de Datos Personales</strong>
          <small>Descargar documento en PDF</small>
        </span>
        <span class="data-policy-doc-card__chev" aria-hidden="true">${chevronIcon}</span>
      </a>`
    : "";
  const termsDocCards = needsTerms
    ? `
      <div class="data-policy-terms-docs">
        <a class="data-policy-doc-card" href="${escapeAttr(termsUrl)}" target="_blank" rel="noopener noreferrer">
          <span class="data-policy-doc-card__pdf" aria-hidden="true">${shieldIcon}<small>WEB</small></span>
          <span class="data-policy-doc-card__copy">
            <strong>Términos de uso</strong>
            <small>Condiciones de uso del portal</small>
          </span>
          <span class="data-policy-doc-card__chev" aria-hidden="true">${chevronIcon}</span>
        </a>
        <a class="data-policy-doc-card" href="${escapeAttr(privacyUrl)}" target="_blank" rel="noopener noreferrer">
          <span class="data-policy-doc-card__pdf" aria-hidden="true">${lockIcon}<small>WEB</small></span>
          <span class="data-policy-doc-card__copy">
            <strong>Política de privacidad</strong>
            <small>Tratamiento y protección de datos</small>
          </span>
          <span class="data-policy-doc-card__chev" aria-hidden="true">${chevronIcon}</span>
        </a>
      </div>`
    : "";
  const dataPolicyDeclaration = needsDataPolicy
    ? `
        <section class="data-policy-declaration" aria-labelledby="data-policy-declaration-title">
          <div class="data-policy-declaration__head">
            <span class="data-policy-declaration__shield-ico" aria-hidden="true">${shieldIcon}</span>
            <div>
              <h3 class="data-policy-declaration__title" id="data-policy-declaration-title">
                Política de datos personales <span class="data-policy-required" aria-hidden="true">*</span>
              </h3>
              <span class="data-policy-declaration__accent" aria-hidden="true"></span>
            </div>
          </div>
          <p class="data-policy-declaration__copy">
            Autorizo el tratamiento de mis datos personales conforme al documento oficial de Transportes Antares S.A.S
            y confirmo que he tenido oportunidad de consultarlo.
          </p>
          <div class="data-policy-declaration__divider" aria-hidden="true"></div>
          <label class="data-policy-check">
            <input type="checkbox" name="acceptDataPolicy" value="true" required />
            <span class="data-policy-check__box" aria-hidden="true"></span>
            <span class="data-policy-check__label">Acepto la Política de Tratamiento de Datos Personales.</span>
          </label>
        </section>`
    : "";
  const termsDeclaration = needsTerms
    ? `
        <section class="data-policy-declaration" aria-labelledby="data-policy-terms-title">
          <div class="data-policy-declaration__head">
            <span class="data-policy-declaration__shield-ico" aria-hidden="true">${shieldIcon}</span>
            <div>
              <h3 class="data-policy-declaration__title" id="data-policy-terms-title">
                Términos y privacidad <span class="data-policy-required" aria-hidden="true">*</span>
              </h3>
              <span class="data-policy-declaration__accent" aria-hidden="true"></span>
            </div>
          </div>
          <p class="data-policy-declaration__copy">
            Confirmo que he leído los Términos de uso y la Política de privacidad del portal de Transportes Antares S.A.S.
          </p>
          <div class="data-policy-declaration__divider" aria-hidden="true"></div>
          <label class="data-policy-check">
            <input type="checkbox" name="acceptTerms" value="true" required />
            <span class="data-policy-check__box" aria-hidden="true"></span>
            <span class="data-policy-check__label">Acepto los Términos de uso y la Política de privacidad.</span>
          </label>
        </section>`
    : "";
  return `
    <div class="data-policy-shell">
      <header class="data-policy-header">
        <div class="data-policy-header__icon" aria-hidden="true">
          <span class="data-policy-header__icon-main">${fileIcon}</span>
          <span class="data-policy-header__icon-badge">${checkIcon}</span>
        </div>
        <div class="data-policy-header__copy">
          <h2 class="data-policy-header__title" id="data-policy-modal-title">${escapeHtml(title)}</h2>
          <p class="data-policy-lead">${lead}</p>
        </div>
      </header>
      ${policyDocCard}
      ${termsDocCards}
      <form id="form-data-policy-accept" class="data-policy-form" data-needs-data-policy="${needsDataPolicy ? "1" : "0"}" data-needs-terms="${needsTerms ? "1" : "0"}">
        ${dataPolicyDeclaration}
        ${termsDeclaration}
        <button class="btn btn-primary data-policy-submit" type="submit" disabled>${shieldIcon} Confirmar y continuar</button>
        <p class="data-policy-trust">
          <span class="data-policy-trust__ico" aria-hidden="true">${lockIcon}</span>
          Tu información está protegida y será tratada con confidencialidad.
        </p>
      </form>
    </div>
  `;
}

function __syncDataPolicyFormReady(form) {
  if (!form) return;
  const pending = __readLegalAcceptancePendingFromForm(form);
  let ready = true;
  if (pending.dataPolicy) {
    ready = ready && Boolean(form.querySelector('[name="acceptDataPolicy"]')?.checked);
  }
  if (pending.terms) {
    ready = ready && Boolean(form.querySelector('[name="acceptTerms"]')?.checked);
  }
  const submit = form.querySelector(".data-policy-submit");
  form.classList.toggle("is-ready", ready);
  if (submit) submit.disabled = !ready;
}

export function hideDataPolicyGate({ clearPending = false } = {}) {
  state.dataPolicyGateVisible = false;
  if (clearPending) __clearDataPolicyGatePendingInSession();
  const modal = document.getElementById("data-policy-modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("data-policy-gate-open");
}

export function showDataPolicyGate() {
  if (!getSession()) return false;
  const session = getSession();
  const user = currentUser();
  if (!__sessionRequiresLegalAcceptanceGate(session, user)) {
    hideDataPolicyGate({ clearPending: true });
    return false;
  }
  const pending = userPendingLegalAcceptances(user);
  if (!pending.dataPolicy && !pending.terms) {
    hideDataPolicyGate({ clearPending: true });
    return false;
  }
  state.dataPolicyGateVisible = true;
  __markDataPolicyGatePendingInSession();
  const modal = document.getElementById("data-policy-modal");
  const body = document.getElementById("data-policy-modal-body");
  if (!modal || !body) return false;
  body.innerHTML = __dataPolicyModalMarkup(pending);
  modal.classList.remove("hidden");
  document.body.classList.add("data-policy-gate-open");
  modal.scrollTop = 0;
  body.querySelectorAll(".data-policy-check__box .required-marker, .data-policy-check .required-marker").forEach((node) => {
    node.remove();
  });
  const form = document.getElementById("form-data-policy-accept");
  if (form) {
    const onDataPolicyFormChange = () => __syncDataPolicyFormReady(form);
    form.addEventListener("change", onDataPolicyFormChange);
    form.addEventListener("input", onDataPolicyFormChange);
    __syncDataPolicyFormReady(form);
    window.wireFormSubmitGuard?.(
      form,
      async () => {
        const pendingSubmit = __readLegalAcceptancePendingFromForm(form);
        if (pendingSubmit.dataPolicy && !__formCheckboxAccepted(null, "acceptDataPolicy", form)) {
          window.notify?.(window.userMessage("dataPolicyRequired"), "error");
          return;
        }
        if (pendingSubmit.terms && !__formCheckboxAccepted(null, "acceptTerms", form)) {
          window.notify?.(window.userMessage("termsRequired"), "error");
          return;
        }
        const actor = currentUser();
        if (!actor?.id) return;

        const payload = {};
        if (pendingSubmit.dataPolicy) payload.acceptDataPolicy = true;
        if (pendingSubmit.terms) payload.acceptTerms = true;

        let meRow = null;
        if (window.AntaresApi?.isConfigured?.() && window.AntaresApi?.postJson) {
          try {
            meRow = await window.AntaresApi.postJson("/portal/accept-data-policy", payload);
            const refreshedPending = userPendingLegalAcceptances(meRow);
            if (refreshedPending.dataPolicy || refreshedPending.terms) {
              meRow = await window.AntaresApi.getJson("/portal/me");
            }
            const stillPending = userPendingLegalAcceptances(meRow);
            if (stillPending.dataPolicy || stillPending.terms) {
              window.notify?.(
                "No se pudo confirmar la aceptación en el servidor. Verifique la conexión e intente de nuevo.",
                "error"
              );
              return;
            }
          } catch (err) {
            window.notify?.(String(err?.message || window.userMessage("genericError")), "error");
            return;
          }
        } else if (window.AntaresApi?.getBase?.()) {
          window.notify?.(
            "No hay sesión activa con el servidor. Cierre sesión, vuelva a ingresar e intente de nuevo.",
            "error"
          );
          return;
        } else {
          meRow = {
            ...actor,
            ...(pendingSubmit.dataPolicy
              ? {
                  dataPolicyAcceptedAt: nowIso(),
                  dataPolicyVersion: DATA_POLICY_VERSION,
                  requiresDataPolicyAcceptance: false
                }
              : {}),
            ...(pendingSubmit.terms
              ? { termsAcceptedAt: nowIso(), requiresTermsAcceptance: false }
              : {})
          };
        }

        if (!__persistLegalAcceptanceLocally(meRow, actor)) {
          window.notify?.(window.userMessage("legalAcceptanceRequired"), "error");
          return;
        }

        hideDataPolicyGate({ clearPending: true });
        const successMsg =
          pendingSubmit.dataPolicy && pendingSubmit.terms
            ? window.userMessage("legalAcceptanceAccepted")
            : pendingSubmit.terms
              ? "Términos y privacidad registrados correctamente."
              : window.userMessage("dataPolicyAccepted");
        window.notify?.(successMsg, "success");
        if (portalCanRefreshFromApi()) {
          void startPortalBootstrapForInteractiveSession();
        }
      },
      { submitButton: form.querySelector("[type='submit']"), busyText: "Registrando…" }
    );
  }
  return true;
}

/** Muestra el modal de aceptación si el usuario autenticado aún no ha aceptado documentos legales pendientes. */
export async function maybeEnforceDataPolicyAcceptance() {
  const session = getSession();
  if (!session) {
    hideDataPolicyGate();
    return false;
  }
  if (portalCanRefreshFromApi()) {
    await __syncLegalAcceptanceStateFromServer();
  }
  const user = currentUser();
  if (!__sessionRequiresLegalAcceptanceGate(session, user)) {
    hideDataPolicyGate({ clearPending: true });
    return false;
  }
  return showDataPolicyGate();
}

export function sendEmail({ to, subject, body }) {
  /**
   * Con API activa, `emails` solo sincroniza admin (sync-key). Un cliente que encola correos
   * dispara 403 en segundo plano y el toast genérico de “sin conexión” aunque la operación principal
   * (p. ej. solicitud) ya se guardó en PostgreSQL.
   */
  const api = window.AntaresApi;
  if (api?.isConfigured?.()) {
    const actor = currentUser();
    if (actor && actor.role !== ROLES.ADMIN) return;
  }
  const outbox = read(KEYS.emails, []);
  outbox.unshift({ id: newUuidV4(), to, subject, body, createdAt: nowIso(), sentAt: null, error: null, status: "queued" });
  write(KEYS.emails, outbox);
}

/**
 * URL de retorno tras recuperar contraseña (sin hash ni query). En producción use __PORTAL_PUBLIC_ORIGIN__
 * en antares.public.js para que el correo no apunte a localhost.
 */
export function buildSupabasePasswordRecoveryRedirectUrl() {
  const configured = String(window.__PORTAL_PUBLIC_ORIGIN__ || "").trim().replace(/\/+$/, "");
  if (configured && /^https?:\/\//i.test(configured)) {
    return `${configured}/`;
  }
  const u = new URL(window.location.href);
  u.hash = "";
  u.search = "";
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost") ||
    host === "::1"
  ) {
    return "https://www.transportesantares.co/";
  }
  return u.toString();
}

export function stripSupabaseAuthHashFromUrl() {
  const u = new URL(window.location.href);
  if (!u.hash || u.hash.length < 2) return;
  u.hash = "";
  history.replaceState(null, "", u.toString());
}

export function scheduleStripSupabaseRecoveryHash(delayMs = 400) {
  window.setTimeout(() => {
    try {
      stripSupabaseAuthHashFromUrl();
    } catch (_e) {}
  }, delayMs);
}

/**
 * Supabase Auth deja el fallo del enlace (p. ej. OTP vencido) en el fragmento:
 * `#error=access_denied&error_code=otp_expired&error_description=...`
 */
export function parseSupabaseAuthErrorHashParams() {
  const h = String(window.location.hash || "");
  if (!h || h.length < 2) return null;
  const body = h.slice(1);
  if (!body) return null;
  /** No mezclar con rutas del portal (`#portal/...`). */
  if (body.startsWith("portal/")) return null;
  try {
    const params = new URLSearchParams(body);
    if (!params.get("error")) return null;
    return params;
  } catch (_e) {
    return null;
  }
}

/**
 * Si la URL trae error de enlace mágico/OTP de Supabase, abre el modal en «Recuperar», avisa y limpia el hash.
 * @returns {boolean} true si hubo un error de fragmento OAuth/Auth y se atendió.
 */
export function maybeHandleSupabaseAuthUrlErrorFromHash() {
  const params = parseSupabaseAuthErrorHashParams();
  if (!params) return false;
  try {
    sessionStorage.removeItem("antares_pw_recovery_pending");
  } catch (_e) {}
  state.authSupabaseRecovery = false;
  state.authTab = "recover";
  try {
    stripSupabaseAuthHashFromUrl();
  } catch (_e) {}
  window.showAuth();
  const msg =
    state.publicLang === "en"
      ? window.userMessage("recoverLinkInvalidOrExpiredEn")
      : window.userMessage("recoverLinkInvalidOrExpired");
  window.notify(msg, "error", 9000);
  return true;
}

export async function waitForAntaresSupabaseClient(timeoutMs) {
  const cap = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 15000;
  if (window.antaresSupabase) return window.antaresSupabase;
  const ready = window.antaresSupabaseReady;
  if (!ready || typeof ready.then !== "function") return null;
  return await Promise.race([
    ready.then(() => window.antaresSupabase || null),
    new Promise((resolve) => {
      setTimeout(() => resolve(window.antaresSupabase || null), cap);
    })
  ]);
}

/** Escucha enlace de recuperación Supabase y abre el modal con el formulario de nueva contraseña. */
export function wireSupabasePasswordRecoveryUi() {
  if (window.__antaresSupabaseRecoveryWired) return;
  window.__antaresSupabaseRecoveryWired = true;

  maybeHandleSupabaseAuthUrlErrorFromHash();
  window.addEventListener("hashchange", () => {
    maybeHandleSupabaseAuthUrlErrorFromHash();
  });

  function enterRecoveryFlowFromStorage() {
    try {
      if (sessionStorage.getItem("antares_pw_recovery_pending") !== "1") return false;
      sessionStorage.removeItem("antares_pw_recovery_pending");
      state.authSupabaseRecovery = true;
      window.showAuth();
      renderAuthTab();
      scheduleStripSupabaseRecoveryHash(300);
      return true;
    } catch (_e) {
      return false;
    }
  }

  enterRecoveryFlowFromStorage();

  window.addEventListener("antares:supabase-password-recovery", () => {
    try {
      sessionStorage.setItem("antares_pw_recovery_pending", "1");
    } catch (_s) {}
    state.authSupabaseRecovery = true;
    window.showAuth();
    renderAuthTab();
    scheduleStripSupabaseRecoveryHash(500);
  });

  void waitForAntaresSupabaseClient(20000).then((client) => {
    if (!client) {
      enterRecoveryFlowFromStorage();
      return;
    }
    if (maybeHandleSupabaseAuthUrlErrorFromHash()) return;
    void client.auth.getSession().then(({ data }) => {
      const session = data?.session;
      const hash = String(window.location.hash || "");
      const recoveryUrl = /type=recovery/i.test(hash);
      let pending = false;
      try {
        pending = sessionStorage.getItem("antares_pw_recovery_pending") === "1";
      } catch (_e) {
        pending = false;
      }
      if (session && (recoveryUrl || pending)) {
        state.authSupabaseRecovery = true;
        window.showAuth();
        renderAuthTab();
        try {
          sessionStorage.removeItem("antares_pw_recovery_pending");
        } catch (_e2) {}
        scheduleStripSupabaseRecoveryHash(400);
        return;
      }
      enterRecoveryFlowFromStorage();
    });
  });
}

export function findOrCreateCompanyIdByName(name) {
  const companyName = String(name || "").trim();
  if (!companyName) return null;
  const companies = read(KEYS.companies, []);
  const existing = companies.find(
    (item) => item.name.toLowerCase() === companyName.toLowerCase()
  );
  if (existing) return existing.id;
  const company = {
    id: newUuidV4(),
    name: companyName,
    taxId: "",
    nit: "",
    phone: "",
    companyKind: "cliente",
    active: true,
    createdAt: nowIso()
  };
  companies.push(company);
  write(KEYS.companies, companies);
  return company.id;
}

export function getCompanyById(companyId) {
  return readArray(KEYS.companies).find((item) => item.id === companyId) || null;
}

export function companySelectOptions(selectedId = "") {
  const sel = String(selectedId || "").trim();
  return readArray(KEYS.companies)
    .filter((company) => __isCompanyRecordActive(company) || String(company.id) === sel)
    .map(
      (company) =>
        `<option value="${company.id}" ${String(company.id) === sel ? "selected" : ""}>${escapeHtml(String(company.name || ""))} (${escapeHtml(companyKindLabel(company.companyKind))})</option>`
    )
    .join("");
}

export function getActivePositions() {
  return readArray(KEYS.positions).filter((p) => p.active !== false && String(p.name || "").trim());
}

export function getPositionById(positionId) {
  const needle = String(positionId || "").trim();
  if (!needle) return null;
  return readArray(KEYS.positions).find((item) => String(item.id || "").trim() === needle) || null;
}

export function positionSelectOptions(selectedId = "") {
  return getActivePositions()
    .map((position) => `<option value="${position.id}" ${position.id === selectedId ? "selected" : ""}>${position.name} · ${window.parseNum(position.baseSalary).toLocaleString("es-CO")}</option>`)
    .join("");
}

export function dispatchPositionsCatalogUpdated() {
  try {
    window.dispatchEvent(new CustomEvent("antares-positions-catalog-updated"));
  } catch (_e) {
    /* noop */
  }
}

/**
 * Hidrata el catálogo de cargos desde GET /portal/positions (no depende del bootstrap masivo).
 * @returns {Promise<boolean>} true si se guardó al menos un cargo en memoria.
 */
export async function refreshPositionsCatalogFromApi(opts = {}) {
  const api = window.AntaresApi;
  if (!api?.getJson || !portalCanRefreshFromApi()) return false;
  try {
    const payload = await api.getJson("/portal/positions");
    const raw = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.positions)
        ? payload.positions
        : [];
    const list = raw.map(normalizePortalBootstrapPositionRow).filter(Boolean);
    write(KEYS.positions, list, { skipSyncSchedule: true });
    dispatchPositionsCatalogUpdated();
    if (opts.rerender !== false && !window.hasUnsavedPortalFormData()) {
      window.scheduleRenderPortalView();
    }
    return list.length > 0;
  } catch (err) {
    devWarn("Portal: no se pudo cargar GET /portal/positions.", err?.message || err);
    return false;
  }
}

export function refreshPositionSelectsInDocument() {
  const hasActive = getActivePositions().length > 0;
  document.querySelectorAll("select[name='positionId'], #emp-position-select").forEach((sel) => {
    const prev = String(sel.value || "").trim();
    const keep = prev && getPositionById(prev)?.active !== false ? prev : "";
    const isEmp = sel.id === "emp-position-select" || sel.closest("#form-employee");
    const head = isEmp
      ? `<option value="">${hasActive ? "Seleccione un cargo de Contratación" : "No hay cargos creados todavía"}</option>`
      : `<option value="">Seleccione</option>`;
    sel.innerHTML = `${head}${positionSelectOptions(keep)}`;
    if (keep) sel.value = keep;
    // El selector de cargo del alta de empleado se deshabilita si aún no hay cargos creados.
    if (isEmp) {
      sel.disabled = !hasActive;
      sel.setAttribute("aria-disabled", hasActive ? "false" : "true");
      const hint = sel.closest("#form-employee")?.querySelector("#emp-position-catalog-hint");
      if (hint) hint.classList.toggle("emp-position-empty-hint", !hasActive);
      if (hint) hint.classList.toggle("muted", hasActive);
    }
  });
}


/**
 * Guarda cargos en memoria al instante; sincroniza con PostgreSQL en segundo plano (o en espera si optimistic=false).
 * @returns {Promise<boolean>}
 */
export async function persistPositionsCatalog(nextList, opts = {}) {
  const optimistic = opts.optimistic !== false;
  const prev = read(KEYS.positions, []);
  const syncData =
    opts.syncData !== undefined
      ? opts.syncData
      : syncPayloadForEditedRow(nextList, opts.editedRow ?? opts.syncRow);
  const serverOpts = { notifyOnFailure: opts.notifyOnFailure };
  if (syncData !== undefined) serverOpts.syncData = syncData;
  write(KEYS.positions, nextList, { skipSyncSchedule: true });
  dispatchPositionsCatalogUpdated();
  if (!optimistic) {
    try {
      await window.writeAwaitServer(KEYS.positions, nextList, serverOpts);
      return true;
    } catch (err) {
      write(KEYS.positions, prev, { skipSyncSchedule: true });
      dispatchPositionsCatalogUpdated();
      if (opts.notifyOnFailure !== false) {
        window.notify(String(err?.message || "No fue posible guardar el cargo en el servidor."), "error");
      }
      return false;
    }
  }
  void (async () => {
    try {
      await window.writeAwaitServer(KEYS.positions, nextList, { notifyOnFailure: false, ...serverOpts });
    } catch (err) {
      write(KEYS.positions, prev, { skipSyncSchedule: true });
      dispatchPositionsCatalogUpdated();
      if (opts.notifyOnFailure !== false) {
        window.notify(
          String(err?.message || "El cargo se guardó en pantalla pero no se sincronizó con el servidor."),
          "error"
        );
      }
    }
  })();
  return true;
}

export function ensureCompaniesAndUserMapping() {
  const companies = read(KEYS.companies, []);
  const users = read(KEYS.users, []);

  let nextCompanies = [...companies];

  const companyByName = (name) =>
    nextCompanies.find(
      (company) => company.name.toLowerCase() === String(name || "").toLowerCase()
    );

  const mappedUsers = users.map((user) => {
    if (user.companyId) return user;
    const existing = companyByName(user.company);
    if (existing) return { ...user, companyId: existing.id };
    const created = {
      id: newUuidV4(),
      name: user.company || "Empresa sin nombre",
      taxId: user.taxId || "",
      nit: user.taxId || "",
      phone: user.phone || "",
      companyKind: "cliente",
      active: true,
      createdAt: nowIso()
    };
    nextCompanies.push(created);
    return { ...user, companyId: created.id };
  });

  write(KEYS.companies, nextCompanies);
  write(KEYS.users, mappedUsers);
}

export function ensureRequestsCompanyMapping() {
  const users = read(KEYS.users, []);
  const requests = reqRead();
  const mapped = requests.map((request) => {
    if (request.clientCompanyId) return request;
    const owner = users.find((user) => user.id === request.clientUserId);
    return {
      ...request,
      clientCompanyId: owner?.companyId || null,
      requestedByName: request.requestedByName || owner?.name || request.clientName
    };
  });
  reqWrite(filterPortalRequestsForServerCache(mapped));
}

export function ensureRequestAndTripIdentifiers() {
  const requests = reqRead();
  let changed = false;
  const usedRequestNumbers = new Set(requests.map((r) => String(r.requestNumber || "").trim()).filter(Boolean));
  const usedTripNumbers = new Set(
    requests.map((r) => String(r.trip?.tripNumber || "").trim()).filter(Boolean)
  );
  const mapped = requests.map((request) => {
    const next = { ...request };
    if (!next.requestNumber) {
      next.requestNumber = makeRequestNumber(usedRequestNumbers);
      usedRequestNumbers.add(next.requestNumber);
      changed = true;
    }
    if (next.trip && !next.trip.tripNumber) {
      const tripNumber = makeTripNumber(usedTripNumbers);
      usedTripNumbers.add(tripNumber);
      next.trip = { ...next.trip, tripNumber };
      changed = true;
    }
    return next;
  });
  if (changed) reqWrite(filterPortalRequestsForServerCache(mapped));
}

/** Permisos guardados desde formulario: respeta lo marcado; si queda vacío, defaults del rol. */
export function normalizeSavedUserPermissions(role, checkedPermissions) {
  const assignable = new Set(assignablePermissionsForRole(role));
  const filtered = (Array.isArray(checkedPermissions) ? checkedPermissions : []).filter((p) =>
    assignable.has(p)
  );
  if (filtered.length > 0) return [...new Set(filtered)];
  return defaultPermissionsForRole(role);
}

export function repaintPermGridInForm(form, role) {
  if (!form) return;
  const grid = form.querySelector(".perm-grid");
  if (!grid) return;
  grid.innerHTML = window.buildGranularPermissionsCheckboxesHtml(defaultPermissionsForRole(role || ROLES.CLIENT), {
    role: role || ROLES.CLIENT
  });
}

export function wireAdminUserFormPermGridOnRoleChange(form) {
  if (!form || form.dataset.antaresPermRoleWired === "1") return;
  const roleSel = form.querySelector("select[name='role']");
  if (!roleSel || !form.querySelector(".perm-grid")) return;
  form.dataset.antaresPermRoleWired = "1";
  roleSel.addEventListener("change", () => {
    repaintPermGridInForm(form, roleSel.value || ROLES.CLIENT);
  });
}

export function ensureUsersPermissions() {
  const users = read(KEYS.users, []);
  const updated = users.map((user) => {
    const assignable = new Set(assignablePermissionsForRole(user.role));
    const current = Array.isArray(user.permissions) ? user.permissions : [];
    const filtered = current.filter((permission) => assignable.has(permission));
    if (filtered.length > 0) {
      return { ...user, permissions: filtered };
    }
    const merged = [...new Set(defaultPermissionsForRole(user.role))].filter((permission) =>
      assignable.has(permission)
    );
    return { ...user, permissions: merged };
  });
  const changed = updated.some((u, i) => {
    const a = JSON.stringify([...(u.permissions || [])].sort());
    const b = JSON.stringify([...(users[i]?.permissions || [])].sort());
    return a !== b;
  });
  if (changed) write(KEYS.users, updated);
}

export function ensureUsersAccountStatus() {
  const users = read(KEYS.users, []);
  const serverBacked = Boolean(window.AntaresApi?.isConfigured?.() && window.AntaresApi?.getBase?.());
  let changed = false;
  const updated = users.map((user) => {
    const raw = user.accountStatus;
    if (raw !== undefined && raw !== null && String(raw).trim() !== "") return user;
    if (serverBacked) {
      return user;
    }
    changed = true;
    return { ...user, accountStatus: ACCOUNT_STATUS.APROBADO };
  });
  if (changed) write(KEYS.users, updated);
}

export async function sanitizeApprovalPayloadForQueue(type, payload) {
  const base = payload && typeof payload === "object" ? { ...payload } : {};
  if (type === "create_user") {
    const next = { ...base };
    const passwordRaw = String(next.password || "");
    delete next.password;
    if (!next.passwordHash && passwordRaw) {
      next.passwordHash = await __authHashPassword(passwordRaw);
    }
    return normalizePayloadTextFields(next);
  }
  if (type === "mark_payroll_paid") {
    return normalizePayloadTextFields({
      payrollRunId: String(base.payrollRunId || "").trim(),
      employeeName: String(base.employeeName || "").trim(),
      month: String(base.month || "").trim()
    });
  }
  if (type === "approve_trip_request") {
    return {
      requestId: String(base.requestId || "").trim()
    };
  }
  if (type === "create_driver") {
    return window.normalizeDriverFormPayloadForStorage(base);
  }
  if (type === "create_employee" || type === "update_employee") {
    return window.sanitizePayrollEmployeeFieldsForPersist(normalizePayloadTextFields(base));
  }
  return normalizePayloadTextFields(base);
}

export async function queueApproval({ type, title, payload, requestedByUserId, requestedByName }) {
  const safePayload = await sanitizeApprovalPayloadForQueue(type, payload);
  if (type === "create_employee") {
    const pending = findPendingCreateEmployeeApproval(
      read(KEYS.approvals, []),
      safePayload.documentType,
      safePayload.idDoc,
      safePayload.companyId
    );
    if (pending) {
      const msg = window.userMessage?.("employeePendingApprovalExists", safePayload.idDoc) ||
        "Ya hay una solicitud de alta pendiente de autorización para este documento en esta empresa.";
      window.notify?.(msg, "error");
      throw new Error(msg);
    }
  }
  const approvals = read(KEYS.approvals, []);
  const createdApproval = {
    id: newUuidV4(),
    type,
    title,
    payload: safePayload,
    status: "pendiente",
    requestedByUserId,
    requestedByName,
    requestedAt: nowIso(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: ""
  };
  approvals.unshift(createdApproval);
  try {
    await window.writeAwaitServerCreate(KEYS.approvals, approvals, createdApproval);
  } catch (err) {
    const msg = String(err?.message || window.userMessage?.("genericError") || "No se pudo enviar la solicitud de autorización.").trim();
    window.notify(msg, "error");
    throw err;
  }
  window.notifyAdminUsers("Nueva autorización pendiente", `${title} solicitada por ${requestedByName}.`);
}

export async function sanitizeLegacyApprovalPayloads() {
  const approvals = read(KEYS.approvals, []);
  if (!Array.isArray(approvals) || !approvals.length) return;
  let changed = false;
  const next = [];
  for (const approval of approvals) {
    if (!approval || typeof approval !== "object") {
      next.push(approval);
      continue;
    }
    const payload = approval.payload && typeof approval.payload === "object" ? { ...approval.payload } : {};
    if (approval.type === "create_user" && payload.password && !payload.passwordHash) {
      payload.passwordHash = await __authHashPassword(payload.password);
      delete payload.password;
      changed = true;
    } else if (approval.type === "create_user" && payload.password) {
      delete payload.password;
      changed = true;
    }
    next.push({ ...approval, payload });
  }
  if (changed) write(KEYS.approvals, next);
}



export function approvalTypeLabel(type) {
  return APPROVAL_TYPE_META[type]?.label || type;
}

/** Referencias cortas para correlacionar colas en soporte (no sustituyen UUID completos en API). */
export function shortAuthRefSegment(rawId) {
  const s = String(rawId || "").replace(/-/g, "");
  return s.length >= 8 ? s.slice(0, 8).toUpperCase() : (s || "--------").toUpperCase();
}
export function authRefAltaUsuario(id) {
  return `USR-${shortAuthRefSegment(id)}`;
}

/**
 * Enmascara un número/documento mostrando solo los últimos N caracteres.
 * Pensado para PII (cédulas, NIT, teléfonos) en listados visibles a varios
 * operadores: el admin reconoce el registro pero no expone el dato completo.
 * El valor sin máscara solo se ve dentro del modal de aprobación.
 */
export function maskSensitiveTail(raw, keep = 3) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const compact = s.replace(/\s+/g, "");
  if (compact.length <= keep) return "•".repeat(Math.max(2, compact.length));
  const visible = compact.slice(-keep);
  return `${"•".repeat(Math.max(3, compact.length - keep))}${visible}`;
}

/** Enmascara teléfono dejando los últimos 4 dígitos visibles (estándar para PII). */
export function maskSensitivePhone(raw) {
  return maskSensitiveTail(raw, 4);
}
export function authRefSolicitudViaje(r) {
  const n = String(r.requestNumber || "").trim();
  return n ? `VIA-${n}` : `VIA-${shortAuthRefSegment(r.id)}`;
}
export function authRefColaInterna(approvalId) {
  return `COL-${shortAuthRefSegment(approvalId)}`;
}

export function approvalDetailLine(approval) {
  const p = approval.payload || {};
  switch (approval.type) {
    case "create_user":
      return [maskSensitiveTail(normalizeEmail(p.email || ""), 10), p.role].filter(Boolean).join(" · ") || "—";
    case "create_driver":
      return [String(p.name || "").trim(), p.idDoc ? `Doc. ${maskSensitiveTail(p.idDoc, 3)}` : ""].filter(Boolean).join(" · ") || "—";
    case "create_employee":
    case "update_employee":
      return [String(p.name || "").trim(), p.idDoc ? `ID ${maskSensitiveTail(p.idDoc, 3)}` : "", String(p.position || "").trim()]
        .filter(Boolean)
        .join(" · ") || "—";
    case "register_hr_absence":
      return [window.payrollAbsenceTypeLabel(p.absenceType), p.startDate && p.endDate ? `${p.startDate} → ${p.endDate}` : ""]
        .filter(Boolean)
        .join(" · ") || "—";
    case "mark_payroll_paid":
      return [String(p.employeeName || "").trim(), String(p.month || "").trim()].filter(Boolean).join(" · ") || "—";
    case "approve_trip_request":
      return String(p.requestId || "").trim() ? `Solicitud ${p.requestId}` : "—";
    default:
      return "—";
  }
}

/** Misma barra de acciones en todas las colas de Autorizaciones (solo cambian los data-action). */
export function buildAuthStandardActionsHtml(mode, id) {
  const eid = escapeAttr(String(id));
  if (mode === "registration") {
    return `<div class="toolbar auth-approval-toolbar">
      <button type="button" class="btn btn-sm btn-approve" data-action="approve-registration" data-id="${eid}">${IC.check} Aprobar</button>
      <button type="button" class="btn btn-sm btn-reject" data-action="reject-registration" data-id="${eid}">${IC.x} Rechazar</button>
    </div>`;
  }
  return `<div class="toolbar auth-approval-toolbar">
      <button type="button" class="btn btn-sm btn-approve" data-action="approval-approve" data-id="${eid}">${IC.check} Aprobar</button>
      <button type="button" class="btn btn-sm btn-reject" data-action="approval-reject" data-id="${eid}">${IC.x} Rechazar</button>
    </div>`;
}

/** Orden: más reciente primero (fecha ISO). */
export function sortAuthQueueByDateDesc(items, getIso) {
  const getTs = typeof getIso === "function" ? getIso : (x) => x;
  return items.slice().sort((a, b) => {
    const ta = new Date(getTs(a) || 0).getTime();
    const tb = new Date(getTs(b) || 0).getTime();
    return tb - ta;
  });
}

export function buildAuthorizationsTransportRequestsSection(pendingRequests) {
  const n = pendingRequests.length;
  const actor = currentUser();
  const canApprove = canApproveTransportRequests(actor);
  const countBadge = `<span class="auth-section-count">${n} solicitud pendiente${n === 1 ? "" : "es"}</span>`;
  const cards = pendingRequests
    .map((r) => {
      const eid = escapeAttr(String(r.id));
      const allowEdit = window.canPortalUserEditTransportRequest(r, actor);
      const editBtn = allowEdit
        ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-request" data-id="${eid}">${IC.edit} Editar</button>`
        : "";
      const decisionBtns = canApprove
        ? `<button type="button" class="btn btn-sm btn-approve" data-action="approve" data-id="${eid}">${IC.check} Aprobar</button>
        <button type="button" class="btn btn-sm btn-reject" data-action="reject" data-id="${eid}">${IC.x} Rechazar</button>`
        : "";
      return `<article class="auth-request-card">
      <div class="auth-request-card-top">
        <span class="auth-ref-pill" title="Código solicitud">${escapeHtml(authRefSolicitudViaje(r))}</span>
        <span class="auth-request-card-id">${escapeHtml(String(r.requestNumber || r.id))}</span>
        ${window.prettyStatus(r.status, "request")}
      </div>
      <p class="auth-request-card-route">${escapeHtml(window.formatRoute(r))}</p>
      <p class="muted auth-request-card-meta">${escapeHtml(String(r.clientName || "").trim() || "—")} · ${escapeHtml(String(r.requestedByName || "").trim() || "—")}</p>
      <p class="muted auth-request-card-date">${window.fmtDate(r.createdAt)}</p>
      <div class="toolbar auth-request-card-actions">
        <button type="button" class="btn btn-sm btn-action" data-action="detail" data-id="${eid}">${IC.eye} Ver</button>
        ${editBtn}
        ${decisionBtns}
      </div>
    </article>`;
    })
    .join("");
  const body = n
    ? `<div class="auth-request-cards-scroll">${cards}</div>`
    : window.emptyState("No hay solicitudes de transporte pendientes de aprobación.");
  return `<section class="auth-queue-section auth-queue-section--transport-req" data-auth-section="transport_requests" aria-label="Solicitudes de transporte pendientes">
      <header class="auth-queue-section-head">
        <div class="auth-queue-section-title-row">
          <h3 class="auth-queue-section-title">Solicitudes pendientes</h3>
          ${countBadge}
        </div>
        <p class="muted auth-queue-section-desc">Pendientes de aprobación operativa. Use <strong>Editar</strong> para ajustar tipo de camión (fuelles o kg) antes de <strong>Aprobar</strong>.</p>
      </header>
      <div class="auth-queue-section-body">${body}</div>
    </section>`;
}

export function portalRegistrationDetailLine(u) {
  const company = getCompanyById(u.companyId)?.name || u.company || "";
  const doc = [u.documentType, u.taxId].filter(Boolean).join(" ");
  const pers = u.personalTaxId || u.personalDoc;
  const persBit = pers ? `pers. ${String(pers).trim()}` : "";
  const parts = [
    normalizeEmail(u.email || ""),
    company,
    doc,
    persBit,
    u.phone ? String(u.phone).trim() : ""
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

export function registrationKindLabel(kind) {
  const k = String(kind || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (
    k === "empleado_interno" ||
    k === "empleadointerno" ||
    k === "interno" ||
    k === "usuario_interno"
  ) {
    return "Empleado interno";
  }
  return "Cliente externo";
}

/** Etiqueta breve para chips de tarjeta de usuario. */
export function registrationKindChipLabel(kind) {
  const k = String(kind || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (
    k === "empleado_interno" ||
    k === "empleadointerno" ||
    k === "interno" ||
    k === "usuario_interno"
  ) {
    return "Interno";
  }
  return "Externo";
}

export function resolveUserRegistrationKind(user) {
  if (!user || typeof user !== "object") return "";
  const fromRow = user.registrationKind;
  const fromChecklist =
    user.profileQualityChecklist && typeof user.profileQualityChecklist === "object"
      ? user.profileQualityChecklist.registrationKind
      : "";
  return normalizeRegistrationKindForDb(fromRow || fromChecklist || "");
}

export function portalRegistrationInboxInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function buildPortalRegistrationInboxCardsHtml(pendingUsers) {
  const sorted = sortAuthQueueByDateDesc(pendingUsers || [], (u) => u.registeredAt || u.createdAt);
  return sorted
    .map((u) => {
      const eid = escapeAttr(String(u.id));
      const when = u.registeredAt || u.createdAt;
      const loc = [u.city, u.department].filter(Boolean).join(", ");
      const personLabel = u.personType === "juridica" ? "Jurídica" : u.personType === "natural" ? "Natural" : String(u.personType || "").trim() || "—";
      // PII enmascarada en la bandeja: el admin solo ve los últimos dígitos para
      // reconocer la solicitud. El número completo se muestra dentro del modal
      // de aprobación, donde la acción ya queda auditada.
      const docTypeStr = String(u.documentType || "").trim();
      const docNumRaw = String(u.taxId || u.personalDoc || "").trim();
      const docMasked = docNumRaw ? maskSensitiveTail(docNumRaw, 3) : "";
      const docLine = [docTypeStr, docMasked].filter(Boolean).join(" ");
      const nitEmpRaw = String(u.companyNit || "").trim();
      const nitMasked = nitEmpRaw ? maskSensitiveTail(nitEmpRaw, 3) : "";
      const phoneRaw = String(u.phone || "").trim();
      const phoneMasked = phoneRaw ? maskSensitivePhone(phoneRaw) : "";
      return `<article class="auth-inbox-card" data-pending-user-id="${eid}">
        <div class="auth-inbox-card-accent" aria-hidden="true"></div>
        <div class="auth-inbox-card-main">
          <div class="auth-inbox-card-avatar" aria-hidden="true">${escapeHtml(portalRegistrationInboxInitials(u.name))}</div>
          <div class="auth-inbox-card-body">
            <div class="auth-inbox-card-top">
              <div class="auth-inbox-card-title-row">
                <h4 class="auth-inbox-card-name">${escapeHtml(String(u.name || "").trim() || "Sin nombre")}</h4>
                <span class="auth-ref-pill" title="Código de alta">${escapeHtml(authRefAltaUsuario(u.id))}</span>
              </div>
              <span class="auth-inbox-pulse">${IC.userPlus} En revisión</span>
            </div>
            <p class="auth-inbox-card-email">${escapeHtml(normalizeEmail(u.email || ""))}</p>
            <div class="auth-inbox-chip-row">
              <span class="auth-inbox-chip">${IC.briefcase} ${escapeHtml(personLabel)}</span>
              ${docLine ? `<span class="auth-inbox-chip" title="Documento enmascarado por privacidad. Verá el número completo al aprobar.">${IC.badge} ${escapeHtml(docLine)}</span>` : ""}
              ${nitMasked ? `<span class="auth-inbox-chip" title="NIT enmascarado por privacidad. Verá el número completo al aprobar.">${IC.building} NIT ${escapeHtml(nitMasked)}</span>` : ""}
              ${resolveUserRegistrationKind(u) ? `<span class="auth-inbox-chip">${IC.shield} ${escapeHtml(registrationKindLabel(resolveUserRegistrationKind(u)))}</span>` : ""}
              ${u.position ? `<span class="auth-inbox-chip">${IC.award} ${escapeHtml(String(u.position).trim())}</span>` : ""}
              ${loc ? `<span class="auth-inbox-chip">${IC.mapPin} ${escapeHtml(loc)}</span>` : ""}
              ${phoneMasked ? `<span class="auth-inbox-chip" title="Teléfono enmascarado por privacidad. Verá el número completo al aprobar.">${IC.phone} ${escapeHtml(phoneMasked)}</span>` : ""}
            </div>
            <p class="auth-inbox-card-date">${IC.clock} Solicitud · ${when ? escapeHtml(window.fmtDate(when)) : "—"}</p>
            <div class="auth-inbox-card-actions">${buildAuthStandardActionsHtml("registration", u.id).replace("auth-approval-toolbar", "auth-approval-toolbar auth-inbox-actions")}</div>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

export function buildPortalRegistrationPendingTableHtml(pendingUsers) {
  return `<div class="auth-inbox-grid">${buildPortalRegistrationInboxCardsHtml(pendingUsers)}</div>`;
}

export function buildPendingApprovalsTableHtml(rows) {
  const sorted = sortAuthQueueByDateDesc(rows || [], (a) => a.requestedAt);
  const body = sorted
    .map((a) => {
      const detail = approvalDetailLine(a);
      const detailHtml = escapeHtml(detail);
      return `<tr>
    <td><span class="auth-ref-pill">${escapeHtml(authRefColaInterna(a.id))}</span></td>
    <td><span class="auth-type-badge">${escapeHtml(approvalTypeLabel(a.type))}</span></td>
    <td><strong>${escapeHtml(String(a.title || "").trim() || "—")}</strong></td>
    <td class="auth-detail-cell">${detailHtml}</td>
    <td>${escapeHtml(String(a.requestedByName || "").trim() || "—")}</td>
    <td>${window.fmtDate(a.requestedAt)}</td>
    <td>${buildAuthStandardActionsHtml("approval", a.id)}</td>
  </tr>`;
    })
    .join("");
  return `<div class="table-wrap auth-pending-table"><table><thead><tr>
    <th>Código</th><th>Tipo</th><th>Resumen</th><th>Detalle</th><th>Solicitante</th><th>Fecha</th><th>Acciones</th>
  </tr></thead><tbody>${body}</tbody></table></div>`;
}

let __sessionIdleCheckTimer = null;
let __sessionApiRefreshTimer = null;
let __sessionActivityHandler = null;

export function stopSessionSecurityWatch() {
  if (__sessionActivityHandler) {
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) => {
      window.removeEventListener(ev, __sessionActivityHandler);
    });
    __sessionActivityHandler = null;
  }
  if (__sessionIdleCheckTimer) {
    clearInterval(__sessionIdleCheckTimer);
    __sessionIdleCheckTimer = null;
  }
  if (__sessionApiRefreshTimer) {
    clearInterval(__sessionApiRefreshTimer);
    __sessionApiRefreshTimer = null;
  }
}

export function checkSessionIdleAndLogout() {
  const s = getSession();
  if (!s) return;
  const last = getEffectiveLastActivityAt();
  if (!last || Date.now() - last <= SESSION_IDLE_MS) return;
  stopSessionSecurityWatch();
  clearSession();
  state.currentView = "dashboard";
  history.replaceState(null, "", window.location.pathname + window.location.search);
  announceSessionClosedByIdle();
  invokeAuthSuccessCallback();
}

/**
 * Intenta renovar el JWT contra POST /api/auth/refresh.
 * Devuelve:
 *   - { status: "ok" } cuando rota el access token (y opcionalmente el refresh).
 *   - { status: "invalid" } cuando el servidor responde 401/403 → el refresh token ya no sirve
 *     (rotado por otra pestaña, sesión invalidada por admin, contraseña cambiada).
 *   - { status: "network" } ante errores transitorios (sin conexión, 5xx) — la sesión local
 *     se conserva para reintentar luego sin expulsar al usuario.
 *   - { status: "skipped" } cuando no hay sesión/URL/refresh para usar.
 */
export async function tryApiRefreshBridge() {
  const api = window.AntaresApi;
  const session = getSession();
  if (!api?.getBase?.() || !session?.userId) {
    return { status: "skipped" };
  }
  const base = String(api.getBase()).replace(/\/+$/, "");
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (typeof api.bearerAuthFallbackEnabled === "function" && api.bearerAuthFallbackEnabled()) {
    headers["X-Antares-Bearer-Fallback"] = "1";
  }
  const csrf = typeof api.getCsrfToken === "function" ? String(api.getCsrfToken() || "").trim() : "";
  if (csrf) headers["X-CSRF-Token"] = csrf;
  const refreshToken =
    typeof api.getRefreshToken === "function" ? String(api.getRefreshToken() || "").trim() : "";
  const refreshBody = refreshToken
    ? { refreshToken, userId: session.userId }
    : {};
  let res;
  try {
    res = await fetch(`${base}/api/auth/refresh`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(refreshBody)
    });
  } catch (_netErr) {
    return { status: "network" };
  }
  if (res.status === 403) {
    return { status: "network", httpStatus: res.status };
  }
  if (res.status === 401) {
    return { status: "invalid", httpStatus: res.status };
  }
  if (!res.ok) return { status: "network", httpStatus: res.status };
  let body = null;
  try {
    body = await res.json();
  } catch (_jsonErr) {
    return { status: "network" };
  }
  if (!body?.ok && !body?.user?.userId) return { status: "network" };
  if (typeof api.applyAuthTokensFromResponse === "function") {
    api.applyAuthTokensFromResponse(body);
  } else if (body?.csrfToken && typeof api.setCsrfToken === "function") {
    api.setCsrfToken(body.csrfToken);
  }
  const now = Date.now();
  setSession({
    ...session,
    lastActivityAt: now
  });
  syncSessionProfileSnapshotFromCache();
  return { status: "ok" };
}

export function refreshClientSessionTokenIfDue() {
  const s = getSession();
  if (!s) return;
  const user = currentUser();
  if (!user) return;
  const now = Date.now();
  const lastAct = getEffectiveLastActivityAt() || now;
  if (now - lastAct > SESSION_IDLE_MS) return;
  const issued = typeof s.tokenIssuedAt === "number" ? s.tokenIssuedAt : 0;
  if (now - issued < SESSION_CLIENT_TOKEN_ROTATE_MS) return;
  setSession({ ...getSession(), token: buildToken(user), tokenIssuedAt: now });
}

export async function scheduledSessionTokenMaintenance() {
  const s = getSession();
  if (!s || !currentUser()) return;
  const lastAct = getEffectiveLastActivityAt() || Date.now();
  if (Date.now() - lastAct > SESSION_IDLE_MS) return;
  await tryApiRefreshBridge();
  refreshClientSessionTokenIfDue();
}

export function queueSessionIdlePublicNotice() {
  try {
    sessionStorage.setItem(SESSION_IDLE_PUBLIC_NOTICE_KEY, "1");
  } catch (_e) {
    /* noop */
  }
}

export function dismissSessionIdlePublicNotice() {
  try {
    sessionStorage.removeItem(SESSION_IDLE_PUBLIC_NOTICE_KEY);
  } catch (_e) {
    /* noop */
  }
  document.getElementById("session-idle-banner")?.remove();
}

export function mountSessionIdlePublicNoticeIfNeeded() {
  if (typeof document === "undefined") return;
  let pending = false;
  try {
    pending = sessionStorage.getItem(SESSION_IDLE_PUBLIC_NOTICE_KEY) === "1";
  } catch (_e) {
    return;
  }
  if (!pending) return;
  if (document.getElementById("session-idle-banner")) return;
  const aside = document.createElement("aside");
  aside.id = "session-idle-banner";
  aside.className = "session-idle-banner";
  aside.setAttribute("role", "status");

  const inner = document.createElement("div");
  inner.className = "session-idle-banner-inner";

  const text = document.createElement("div");
  text.className = "session-idle-banner-text";

  const title = document.createElement("p");
  title.className = "session-idle-banner-title";
  title.textContent = window.userMessage("sessionIdle");

  const hint = document.createElement("p");
  hint.className = "session-idle-banner-hint muted";
  const hintMsg = window.userMessage("sessionIdleBannerHint");
  hint.textContent = typeof hintMsg === "string" && hintMsg !== "sessionIdleBannerHint" ? hintMsg : "";

  text.appendChild(title);
  if (hint.textContent) text.appendChild(hint);

  const actions = document.createElement("div");
  actions.className = "session-idle-banner-actions";

  const btnIn = document.createElement("button");
  btnIn.type = "button";
  btnIn.className = "btn btn-primary btn-sm session-idle-banner-login";
  btnIn.textContent = "Ingresar al portal";
  btnIn.addEventListener("click", () => {
    dismissSessionIdlePublicNotice();
    (document.getElementById("open-auth-hero") || document.getElementById("open-auth"))?.click();
  });

  const btnOk = document.createElement("button");
  btnOk.type = "button";
  btnOk.className = "btn btn-ghost btn-sm session-idle-banner-dismiss";
  btnOk.textContent = "Entendido";
  btnOk.addEventListener("click", () => dismissSessionIdlePublicNotice());

  actions.appendChild(btnIn);
  actions.appendChild(btnOk);

  inner.appendChild(text);
  inner.appendChild(actions);
  aside.appendChild(inner);

  const host =
    document.getElementById("public-app") ||
    document.getElementById("hero") ||
    document.body;
  host.insertBefore(aside, host.firstChild);
}

export function announceSessionClosedByIdle() {
  queueSessionIdlePublicNotice();
  mountSessionIdlePublicNoticeIfNeeded();
}

export function ensureSessionLifecycleHooks() {
  if (typeof window === "undefined" || window.__antaresSessionLifecycleOk) return;
  window.__antaresSessionLifecycleOk = true;
  window.addEventListener("pagehide", () => flushSessionActivityToStorage(), { capture: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSessionActivityToStorage();
  });
}

export function startSessionSecurityWatch() {
  stopSessionSecurityWatch();
  ensureSessionLifecycleHooks();
  __sessionActivityHandler = window.throttledBumpSessionActivity;
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) => {
    window.addEventListener(ev, __sessionActivityHandler, { passive: true });
  });
  __sessionIdleCheckTimer = setInterval(checkSessionIdleAndLogout, 60 * 1000);
  __sessionApiRefreshTimer = setInterval(() => void scheduledSessionTokenMaintenance(), SESSION_API_REFRESH_MS);
}

export function clearSession() {
  stopSessionSecurityWatch();
  window.stopNotificationsPolling?.();
  if (typeof resetSessionActivityMemory === "function") resetSessionActivityMemory();
  const snapUid = getSession()?.userId || state.session?.userId;
  localStorage.removeItem(KEYS.session);
  state.session = null;
  state.portalContacts = [];
  state.adminUserSessions = [];
  state.adminUserSessionsLoading = false;
  state.adminUserSessionsError = null;
  state.adminUserSessionsHydrated = false;
  state.adminUsersEntryHydrating = false;
  state.portalDataHydrating = false;
  state.portalDataHydrated = false;
  state.portalSnapshotRestored = false;
  try {
    window.PortalBootstrapCache?.clear?.(snapUid);
  } catch (_snapClear) {
    /* noop */
  }
  state.adminSessionsLogMinimized = true;
  state.deletedTransportRequestsLogMinimized = true;
  state.deletedTransportTripsLogMinimized = true;
  state.notificationPreferences = {
    id: null,
    notificacionesHabilitadas: true,
    sonidoNotificacionesHabilitadas: true,
    createdAt: null,
    updatedAt: null
  };
  state.__notificationPrefsHydratedFromServer = false;
  if (typeof window.AntaresPersistence?.clearServerBackedMemory === "function") {
    window.AntaresPersistence.clearServerBackedMemory();
  }
  const api = window.AntaresApi;
  const storedRefresh =
    api && typeof api.getRefreshToken === "function" ? String(api.getRefreshToken() || "").trim() : "";
  if (api?.getBase?.()) {
    const base = String(api.getBase()).replace(/\/+$/, "");
    const headers = { Accept: "application/json", "Content-Type": "application/json" };
    const csrf = typeof api.getCsrfToken === "function" ? String(api.getCsrfToken() || "").trim() : "";
    if (csrf) headers["X-CSRF-Token"] = csrf;
    const logoutBody = storedRefresh ? JSON.stringify({ refreshToken: storedRefresh }) : "{}";
    void fetch(`${base}/api/auth/logout`, {
      method: "POST",
      headers,
      credentials: "include",
      body: logoutBody
    }).catch(() => {});
  }
  if (api?.clearBearerTokens) {
    api.clearBearerTokens();
  } else {
    try {
      localStorage.removeItem("antares_api_access_token");
    } catch (_e) {
      /* noop */
    }
  }
  if (api?.setCsrfToken) {
    api.setCsrfToken("");
  }
}

export function buildToken(user) {
  const nonce = crypto.getRandomValues(new Uint32Array(2)).join("");
  return btoa(`${user.id}.${user.role}.${Date.now()}.${nonce}`);
}

function currentTurnstileTheme() {
  return String(document.body?.dataset?.theme || "light") === "dark" ? "dark" : "light";
}

/** Marca opcional para el widget Turnstile. Si la site key no está configurada (dev sin captcha), devuelve cadena vacía y el formulario igual envía. */
function turnstileWidgetMarkup() {
  const siteKey = String(window.ANTARES_TURNSTILE_SITE_KEY || "").trim();
  if (!siteKey) return "";
  const theme = currentTurnstileTheme();
  return `
    <div class="full turnstile-row">
      <div class="turnstile-shell">
        <span class="turnstile-shell-label">${IC.shield || ""} Verificación de seguridad</span>
        <div class="cf-turnstile" data-sitekey="${siteKey}" data-size="flexible" data-theme="${theme}" data-antares-pending="1"></div>
      </div>
    </div>
  `;
}

/**
 * Renderiza explícitamente todos los widgets Turnstile presentes en el DOM. La auto-detección de
 * `api.js` falla a veces en formularios montados dinámicamente; este paso es defensivo y se vuelve
 * no-op cuando un nodo ya fue inicializado (marcamos con `data-antares-pending="0"`).
 */
function ensureTurnstileWidgets() {
  const siteKey = String(window.ANTARES_TURNSTILE_SITE_KEY || "").trim();
  if (!siteKey) return;
  const theme = currentTurnstileTheme();
  const nodes = document.querySelectorAll('.cf-turnstile[data-antares-pending="1"]');
  if (!nodes.length) return;
  const tryRender = () => {
    if (!window.turnstile?.render) return false;
    nodes.forEach((node) => {
      try {
        if (node.dataset.antaresPending !== "1") return;
        node.dataset.antaresPending = "0";
        window.turnstile.render(node, {
          sitekey: siteKey,
          theme,
          callback: (token) => {
            try {
              node.dataset.antaresToken = String(token || "");
              node.dataset.antaresError = "";
            } catch (_e) {}
          },
          /**
           * Marcamos `data-antares-error="1"` para que `waitForTurnstileToken`
           * pueda resolver de inmediato y no haga esperar al usuario hasta
           * agotar el timeout (típicamente 4-6s). Esto evita que el login se
           * "cuelgue" cuando el hostname no está permitido en el panel de
           * Turnstile o cuando el script de Cloudflare está bloqueado por
           * algún antivirus / red corporativa.
           */
          "error-callback": () => {
            try {
              node.dataset.antaresToken = "";
              node.dataset.antaresError = "1";
            } catch (_e) {}
          },
          "expired-callback": () => {
            try {
              node.dataset.antaresToken = "";
            } catch (_e) {}
          }
        });
      } catch (_e) {
        node.dataset.antaresPending = "1";
      }
    });
    return true;
  };
  if (!tryRender()) {
    // El script `api.js` aún no terminó de cargar (defer). Reintentamos cuando esté disponible.
    const interval = window.setInterval(() => {
      if (tryRender()) window.clearInterval(interval);
    }, 250);
    window.setTimeout(() => window.clearInterval(interval), 8000);
  }
}

/**
 * Espera a que el widget Turnstile produzca un token (hasta `timeoutMs`).
 * Devuelve cadena vacía cuando:
 *  - El formulario no tiene widget (sitekey ausente, dev sin captcha, etc.).
 *  - El widget reportó error (`data-antares-error="1"`, p. ej. hostname no
 *    permitido o script de Cloudflare bloqueado): no esperamos al timeout.
 *  - Pasaron `timeoutMs` ms sin token.
 *
 * El backend tiene su propia guarda (`TurnstileService.assertValid`): si el
 * token llega vacío y `CF_TURNSTILE_REQUIRED` está apagado, login pasa igual;
 * si está encendido, responde 400 limpio en lugar de hacer esperar al usuario.
 */
function waitForTurnstileToken(form, timeoutMs = 4000) {
  return new Promise((resolve) => {
    if (!form) return resolve("");
    const widget = form.querySelector(".cf-turnstile");
    if (!widget) return resolve("");
    const readNow = () => {
      const fromWidget = String(widget.dataset.antaresToken || "").trim();
      if (fromWidget) return fromWidget;
      try {
        if (window.turnstile?.getResponse) {
          const v = window.turnstile.getResponse(widget);
          if (v) return String(v).trim();
        }
      } catch (_e) {}
      try {
        const fd = new FormData(form);
        const v = fd.get("cf-turnstile-response");
        return typeof v === "string" ? v.trim() : "";
      } catch (_e) {
        return "";
      }
    };
    const hasError = () => String(widget.dataset.antaresError || "") === "1";
    const immediate = readNow();
    if (immediate) return resolve(immediate);
    if (hasError()) return resolve("");
    const start = Date.now();
    const timer = window.setInterval(() => {
      const now = readNow();
      if (now) {
        window.clearInterval(timer);
        resolve(now);
        return;
      }
      if (hasError()) {
        window.clearInterval(timer);
        resolve("");
        return;
      }
      if (Date.now() - start > timeoutMs) {
        window.clearInterval(timer);
        resolve("");
      }
    }, 200);
  });
}

/** Lectura síncrona del token (sin esperar). Útil cuando ya validamos antes en submit. */
function readTurnstileToken(form) {
  if (!form) return "";
  const widget = form.querySelector?.(".cf-turnstile");
  if (widget) {
    const fromWidget = String(widget.dataset.antaresToken || "").trim();
    if (fromWidget) return fromWidget;
    try {
      if (window.turnstile?.getResponse) {
        const v = window.turnstile.getResponse(widget);
        if (v) return String(v).trim();
      }
    } catch (_e) {}
  }
  try {
    const fd = new FormData(form);
    const v = fd.get("cf-turnstile-response");
    return typeof v === "string" ? v.trim() : "";
  } catch (_e) {
    return "";
  }
}

/** Reinicia el widget tras un error o submit fallido (cada token es de un solo uso). */
function resetTurnstile(form) {
  try {
    const widget = form?.querySelector?.(".cf-turnstile");
    if (!widget) return;
    if (widget.dataset) widget.dataset.antaresToken = "";
    if (window.turnstile?.reset) window.turnstile.reset(widget);
  } catch (_e) {}
}

function __authPasswordPanelMarkup({
  title,
  subtitle,
  passwordToggleTarget,
  confirmToggleTarget,
  strengthSuiteId,
  strengthLabelId,
  hintId
}) {
  const describedBy = `${strengthLabelId} ${hintId}`;
  return `
        <div class="register-section register-section--password auth-password-panel full">
          <div class="register-section-head">
            <span class="register-section-step register-section-step--icon register-section-step--lock" aria-hidden="true">${IC.lock}</span>
            <div>
              <h4 class="register-section-title">${title}</h4>
              <p class="register-section-desc muted">${subtitle}</p>
            </div>
          </div>
          <div class="register-password-fields">
            <label class="full auth-field-stack register-password-field">
              ${fieldLabel("", "Contraseña", { required: true })}
              <div class="password-field auth-password-row">
                <div class="auth-input-row auth-input-row--grow">
                  <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
                  <input class="auth-input-control auth-password-input" type="password" minlength="10" name="password" autocomplete="new-password" autocapitalize="off" spellcheck="false" required aria-describedby="${describedBy}" />
                </div>
                <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="${passwordToggleTarget}">${IC.eye} Mostrar</button>
              </div>
            </label>
            <label class="full auth-field-stack register-password-field">
              ${fieldLabel("", "Confirmar contraseña", { required: true })}
              <div class="password-field auth-password-row">
                <div class="auth-input-row auth-input-row--grow">
                  <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
                  <input class="auth-input-control auth-password-input" type="password" minlength="10" name="passwordConfirm" autocomplete="new-password" autocapitalize="off" spellcheck="false" required />
                </div>
                <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="${confirmToggleTarget}">${IC.eye} Mostrar</button>
              </div>
              <small class="muted register-password-match-hint">Repita la contraseña exactamente igual.</small>
            </label>
            <div id="${strengthSuiteId}" class="password-strength-suite password-strength-suite--register full">
              <p id="${strengthLabelId}" class="password-strength-label">
                Fortaleza de la contraseña: <strong class="password-strength-tier" data-tier="empty">—</strong>
              </p>
              <div class="password-strength-segments" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow="0" aria-label="Fortaleza de la contraseña" data-tier="empty">
                <span class="password-strength-segment" data-segment="1"></span>
                <span class="password-strength-segment" data-segment="2"></span>
                <span class="password-strength-segment" data-segment="3"></span>
                <span class="password-strength-segment" data-segment="4"></span>
              </div>
              <ul class="password-rule-grid password-rule-grid--inline" role="list" aria-label="Requisitos de contraseña">
                <li data-rule="len"><span class="password-rule-dot" aria-hidden="true"></span><span>10+ caracteres</span></li>
                <li data-rule="lower"><span class="password-rule-dot" aria-hidden="true"></span><span>Minúscula (a-z)</span></li>
                <li data-rule="upper"><span class="password-rule-dot" aria-hidden="true"></span><span>Mayúscula (A-Z)</span></li>
                <li data-rule="digit"><span class="password-rule-dot" aria-hidden="true"></span><span>Número (0-9)</span></li>
                <li data-rule="special"><span class="password-rule-dot" aria-hidden="true"></span><span>Símbolo (!@#$…)</span></li>
              </ul>
              <div class="password-policy-callout">
                <span class="password-policy-callout-icon" aria-hidden="true">${IC.info}</span>
                <p id="${hintId}" class="password-policy-hint">Mínimo 10 caracteres con mayúscula, minúscula, número y símbolo. Escriba la contraseña como prefiera: en pantalla se muestra tal cual (mayúsculas y minúsculas).</p>
              </div>
            </div>
          </div>
        </div>`;
}

function authView() {
  if (state.authSupabaseRecovery) {
    return `
    <form id="form-recover-complete" class="form-grid auth-pane auth-form auth-recover-complete-form" autocomplete="off">
      ${__authPasswordPanelMarkup({
        title: "Asignar contraseña",
        subtitle: "Elija una contraseña segura para el inicio de sesión en este portal.",
        passwordToggleTarget: "recover-complete",
        confirmToggleTarget: "recover-complete-c",
        strengthSuiteId: "recover-password-strength-suite",
        strengthLabelId: "recover-password-strength-label",
        hintId: "recover-password-hint"
      })}
      <div class="register-submit-wrap full">
        <button class="btn btn-primary full register-submit-btn" type="submit">${IC.check} Guardar contraseña e iniciar sesión</button>
      </div>
    </form>`;
  }
  const tab = state.authTab;
  const deptOptions = window.departmentOptions();
  if (tab === "login") {
    const regOk = state.registrationSuccessBanner;
    const regBanner =
      regOk && typeof regOk.message === "string" && regOk.message.trim()
        ? `<div class="auth-register-success-banner" role="status">
        <button type="button" class="auth-register-success-dismiss" data-action="dismiss-reg-success" aria-label="Cerrar aviso">×</button>
        <p class="auth-register-success-title">${IC.check} Solicitud registrada</p>
        <p class="auth-register-success-body">${escapeHtml(regOk.message.trim())}</p>
        ${
          regOk.email
            ? `<p class="muted auth-register-success-email">Correo de contacto: <strong>${escapeHtml(String(regOk.email).trim())}</strong></p>`
            : ""
        }
        <p class="muted auth-register-success-hint">Un administrador revisará su solicitud antes de habilitar el ingreso al portal. <strong>Cuando su cuenta sea aprobada</strong> recibirá un correo con el enlace de activación para definir su contraseña e iniciar sesión. Si no lo ve en su bandeja, revise la carpeta de spam o filtros corporativos.</p>
      </div>`
        : "";
    return `
      ${regBanner}
      <div class="auth-login-shell">
        <form id="form-login" class="form-grid auth-form auth-pane">
          <div class="auth-login-welcome full">
            <h3>Bienvenido de nuevo</h3>
            <p>Ingrese con su correo corporativo para acceder al portal de operaciones.</p>
          </div>
          <label class="full auth-field-stack">
            <span class="auth-plain-label">${fieldLabel(IC.mail, "Correo corporativo")}</span>
            <div class="auth-input-row">
              <span class="auth-input-prefix" aria-hidden="true">${IC.mail}</span>
              <input class="auth-input-control" type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required data-antares-validate-blur="email" data-antares-restrict="email-local" />
            </div>
          </label>
          <label class="full auth-field-stack">
            <span class="auth-plain-label">${fieldLabel(IC.lock, "Contraseña")}</span>
            <div class="password-field auth-password-row">
              <div class="auth-input-row auth-input-row--grow">
                <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
                <input class="auth-input-control" type="password" name="password" autocomplete="current-password" required />
              </div>
              <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="login">${IC.eye} Mostrar</button>
            </div>
          </label>
          <label class="full auth-remember-row">
            <span class="auth-remember-check">
              <input type="checkbox" name="rememberCredentials" id="login-remember-credentials" value="1" />
              <span>Recordar correo en este equipo</span>
            </span>
            <small class="muted auth-remember-hint">Por seguridad nunca se guarda la contraseña; deberá escribirla en cada ingreso.</small>
          </label>
          ${turnstileWidgetMarkup()}
          <button class="btn btn-primary full" type="submit" data-login-submit>
            <span class="auth-submit-content"><span class="auth-submit-icon">${IC.check}</span><span class="auth-submit-label">Ingresar al portal</span></span>
            <span class="auth-submit-spinner" aria-hidden="true"></span>
          </button>
        </form>
      </div>
    `;
  }

  if (tab === "register") {
    return `
      <div class="auth-header-premium register-intro">
        <h3>Solicitud de registro</h3>
        <p class="muted">Complete el formulario con datos veraces. Un administrador revisará su solicitud y recibirá confirmación por correo.</p>
      </div>
      <form id="form-register" class="form-grid auth-form auth-register-form auth-pane">
        <div class="register-section register-section--kind full">
          <div class="register-section-head register-section-head--compact">
            <span class="register-section-step register-section-step--icon" aria-hidden="true">◆</span>
            <div>
              <h4 class="register-section-title">Tipo de vínculo</h4>
              <p class="register-section-desc muted">Indique si representa a un cliente externo o es personal interno de Antares.</p>
            </div>
          </div>
          <div class="register-kind-field">
            <span class="register-kind-label visually-hidden">${fieldLabel(IC.users, "Tipo de vínculo")}</span>
            <input type="hidden" name="registrationKind" id="register-registration-kind" value="cliente" />
            <div class="register-kind-options" role="radiogroup" aria-label="Tipo de vínculo con Antares">
              <button type="button" class="register-kind-option is-selected" data-registration-kind="cliente" aria-pressed="true">
                <span class="register-kind-option-check" aria-hidden="true"></span>
                <span class="register-kind-option-text">
                  <strong>Cliente externo</strong>
                  <small>Empresa u organización que contrata el servicio</small>
                </span>
              </button>
              <button type="button" class="register-kind-option" data-registration-kind="empleado_interno" aria-pressed="false">
                <span class="register-kind-option-check" aria-hidden="true"></span>
                <span class="register-kind-option-text">
                  <strong>Empleado interno</strong>
                  <small>Personal de Transportes Antares</small>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="register-section full">
          <div class="register-section-head">
            <span class="register-section-step" aria-hidden="true">1</span>
            <div>
              <h4 class="register-section-title">Identificación personal</h4>
              <p class="register-section-desc muted">Nombre completo y documento de identidad.</p>
            </div>
          </div>
          <div class="register-section-grid">
            <label>${fieldLabel(IC.user, "Primer nombre")}<input name="firstName" required autocomplete="given-name" data-antares-restrict="person-name" data-antares-field="person-name" /></label>
            <label>${fieldLabel(IC.user, "Segundo nombre")}<input name="middleName" autocomplete="additional-name" data-antares-restrict="person-name" /></label>
            <label>${fieldLabel(IC.users, "Primer apellido")}<input name="lastName" required autocomplete="family-name" data-antares-restrict="person-name" data-antares-field="person-name" /></label>
            <label>${fieldLabel(IC.users, "Segundo apellido")}<input name="secondLastName" autocomplete="family-name" data-antares-restrict="person-name" /></label>
            <div class="register-doc-section full">
              <label class="register-field-person-type">${fieldLabel(IC.briefcase, "Tipo de persona")}
                <select name="personType" required>
                  <option value="">Seleccione...</option>
                  <option value="natural">Natural</option>
                  <option value="juridica">Jurídica</option>
                </select>
              </label>
              <div id="register-doc-persona" class="register-doc-block register-doc-block--natural">
                <label>${fieldLabel(IC.file, "Tipo de documento")}
                  <select name="documentType" required>
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                </label>
                <label>${fieldLabel(IC.badge, "Número de documento")}<input name="taxId" inputmode="numeric" autocomplete="off" aria-required="true" data-antares-restrict="alnum-doc" data-antares-field="doc" /></label>
              </div>
              <div id="register-doc-empresa" class="register-doc-block register-doc-block--empresa hidden" hidden>
                <label>${fieldLabel(IC.briefcase, "NIT de la empresa")}
                  <input name="companyNit" inputmode="numeric" autocomplete="off" placeholder="Ej. 900123456-7" data-antares-restrict="alnum-doc" data-antares-field="nit" />
                </label>
                <label>${fieldLabel(IC.file, "Tipo de cédula (representante)")}
                  <select name="personalDocumentType">
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="CE">Cédula de extranjería</option>
                  </select>
                </label>
                <label>${fieldLabel(IC.badge, "Número de cédula")}
                  <input name="personalTaxId" inputmode="numeric" autocomplete="off" placeholder="Debe ser única en el portal" data-antares-restrict="alnum-doc" data-antares-field="doc" data-antares-doc-type-selector="select[name='personalDocumentType']" />
                </label>
                <p class="muted register-doc-empresa-note">Varios usuarios pueden compartir el NIT de la empresa; la duplicidad se valida solo sobre el número de cédula del representante.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="register-section full">
          <div class="register-section-head">
            <span class="register-section-step" aria-hidden="true">2</span>
            <div>
              <h4 class="register-section-title">Perfil laboral</h4>
              <p class="register-section-desc muted">Datos demográficos y cargo dentro de la organización.</p>
            </div>
          </div>
          <div class="register-section-grid">
            <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" required data-antares-validate-blur="date-iso" /></label>
            <label>${fieldLabel(IC.users, "Género")}
              <select name="gender" required>
                <option value="">Seleccione...</option>
                <option>Femenino</option>
                <option>Masculino</option>
                <option>No binario</option>
                <option>Prefiero no decirlo</option>
              </select>
            </label>
            <label>${fieldLabel(IC.award, "Cargo")}<input name="position" required /></label>
            <label>${fieldLabel(IC.grid, "Área")}<input name="workArea" required placeholder="Ej.: Operaciones" /></label>
          </div>
        </div>

        <div class="register-section full">
          <div class="register-section-head">
            <span class="register-section-step" aria-hidden="true">3</span>
            <div>
              <h4 class="register-section-title">Contacto y ubicación</h4>
              <p class="register-section-desc muted">Teléfono, departamento, ciudad y dirección principal.</p>
            </div>
          </div>
          <div class="register-section-grid">
            <label class="phone-field-register full">
              ${fieldLabel(IC.phone, "Teléfono")}
              <div class="phone-input-professional" role="group" aria-label="Teléfono celular Colombia">
                <div class="phone-reg-flag-slot">
                  <span class="js-register-lang-flag register-lang-flag register-lang-flag--co" aria-hidden="true" title="Colombia"></span>
                </div>
                <select class="js-register-phone-cc phone-cc-select" aria-label="Indicativo +57 (Colombia)" required>
                  ${window.registerPhoneCountryOptionsHtml()}
                </select>
                <input
                  type="tel"
                  class="js-register-phone-national phone-national-input"
                  inputmode="numeric"
                  autocomplete="tel-national"
                  placeholder="300 123 4567"
                  maxlength="14"
                  required
                  aria-describedby="register-phone-hint"
                />
                <input type="hidden" name="phone" class="js-register-phone-full" value="" />
              </div>
              <small id="register-phone-hint" class="muted phone-field-hint">Celular Colombia: 10 dígitos (empieza por 3).</small>
            </label>
            <label>${fieldLabel(IC.mapPin, "Departamento")}
              <select name="department" id="register-department" required>
                <option value="">Seleccione...</option>
                ${deptOptions}
              </select>
            </label>
            <label>${fieldLabel(IC.building, "Ciudad")}
              <select name="city" id="register-city" required>
                <option value="">Seleccione un departamento...</option>
              </select>
            </label>
            <label class="full">${fieldLabel(IC.compass, "Dirección")}<input name="address" required placeholder="Dirección principal" autocomplete="street-address" /></label>
          </div>
        </div>

        <div class="register-section full">
          <div class="register-section-head">
            <span class="register-section-step" aria-hidden="true">4</span>
            <div>
              <h4 class="register-section-title">Acceso al portal</h4>
              <p class="register-section-desc muted">Correo electrónico con el que ingresará al sistema.</p>
            </div>
          </div>
          <div class="register-section-grid">
            <label class="full">${fieldLabel(IC.mail, "Correo electrónico")}<input type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required data-antares-validate-blur="email" data-antares-restrict="email-local" /></label>
          </div>
        </div>

        ${__authPasswordPanelMarkup({
          title: "Crea tu contraseña",
          subtitle: "Usa una contraseña segura para proteger tu cuenta.",
          passwordToggleTarget: "register",
          confirmToggleTarget: "register-c",
          strengthSuiteId: "register-password-strength-suite",
          strengthLabelId: "password-strength-label",
          hintId: "password-hint"
        })}

        <div class="register-section register-section--legal full">
          <div class="register-section-head">
            <span class="register-section-step register-section-step--icon" aria-hidden="true">${IC.file}</span>
            <div>
              <h4 class="register-section-title">Términos y condiciones <span class="field-required-mark" aria-hidden="true">*</span></h4>
              <p class="register-section-desc muted">Al crear su cuenta acepta los siguientes documentos y confirma que la información registrada es veraz.</p>
            </div>
          </div>
          <div class="register-terms-grid">
            <a class="register-terms-doc" href="${REGISTER_TERMS_URL}" target="_blank" rel="noopener noreferrer">
              <span class="register-terms-doc-icon" aria-hidden="true">${IC.file}</span>
              <span class="register-terms-doc-copy">
                <strong class="register-terms-doc-title">Términos de uso</strong>
                <small class="muted">Consulta las reglas y condiciones del servicio.</small>
              </span>
            </a>
            <a class="register-terms-doc" href="${REGISTER_PRIVACY_URL}" target="_blank" rel="noopener noreferrer">
              <span class="register-terms-doc-icon" aria-hidden="true">${IC.shield}</span>
              <span class="register-terms-doc-copy">
                <strong class="register-terms-doc-title">Política de privacidad</strong>
                <small class="muted">Conoce cómo protegemos tu información personal.</small>
              </span>
            </a>
            <a class="register-terms-doc" href="${DATA_POLICY_URL}" target="_blank" rel="noopener noreferrer">
              <span class="register-terms-doc-icon" aria-hidden="true">${IC.lock}</span>
              <span class="register-terms-doc-copy">
                <strong class="register-terms-doc-title">Política de Tratamiento de Datos Personales</strong>
                <small class="muted">Información sobre el tratamiento de tus datos (Habeas Data).</small>
              </span>
            </a>
          </div>
          <label class="register-terms-check">
            <input type="checkbox" name="acceptTerms" required />
            <span>Acepto los términos, la política de privacidad y la Política de Tratamiento de Datos Personales.</span>
          </label>
          <div class="register-pending-alert full">
            <span class="register-pending-alert-icon" aria-hidden="true">${IC.info}</span>
            <p>Su solicitud quedará pendiente hasta que un administrador apruebe y asocie una empresa. Le notificaremos por correo electrónico cuando su solicitud sea aprobada.</p>
          </div>
          ${turnstileWidgetMarkup()}
          <div class="register-submit-wrap full">
            <button class="btn btn-primary full register-submit-btn" type="submit">${IC.userPlus} Crear cuenta</button>
          </div>
        </div>
      </form>
    `;
  }

    return `
    <div class="auth-header-premium">
      <h3>Recuperación de acceso</h3>
      <p class="muted">Indique el <strong>correo corporativo asociado a su cuenta</strong>. Si el usuario está activo en el sistema, recibirá un mensaje con las instrucciones para restablecer su contraseña de forma segura.</p>
    </div>
    <form id="form-recover" class="form-grid auth-pane auth-form auth-form-recover">
      <label class="full auth-field-stack">
        <span class="auth-plain-label">${fieldLabel(IC.mail, "Correo registrado")}</span>
        <div class="auth-input-row">
          <span class="auth-input-prefix" aria-hidden="true">${IC.mail}</span>
          <input class="auth-input-control" type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required data-antares-validate-blur="email" data-antares-restrict="email-local" />
        </div>
      </label>
      <div class="auth-recover-hint" role="note">
        <div class="auth-recover-hint-inner">
          <span class="auth-recover-hint-icon" aria-hidden="true">${IC.shield}</span>
          <div class="auth-recover-hint-body">
            <p class="auth-recover-hint-title">Enlace seguro y de vigencia limitada</p>
            <p class="auth-recover-hint-text">Recibirá un enlace personalizado y cifrado. Por estándares de seguridad, el enlace caduca transcurrido un plazo breve y solo puede utilizarse para completar el restablecimiento; si expira, podrá solicitar uno nuevo desde esta misma pantalla.</p>
            <p class="auth-recover-hint-text">Una vez actualizada la contraseña, podrá ingresar al portal con <strong>el mismo correo</strong> y sus nuevas credenciales. Si no ve el mensaje en unos minutos, revise la carpeta de spam o correo no deseado y confirme que el correo indicado coincide con el registrado. Para escalamiento técnico, diríjase al equipo de soporte de su organización.</p>
          </div>
        </div>
      </div>
      ${turnstileWidgetMarkup()}
      <div class="auth-recover-actions">
        <button class="btn btn-primary full auth-recover-submit" type="submit">${IC.send} Enviar enlace al correo</button>
      </div>
    </form>
  `;
}

export function renderAuthTab() {
  const tabsWrap = document.querySelector("#auth-modal .tabs");
  if (tabsWrap) tabsWrap.classList.toggle("hidden", Boolean(state.authSupabaseRecovery));
  const tabs = nodes.authTabs.length ? nodes.authTabs : [...document.querySelectorAll("#auth-modal .tab")];
  const content = nodes.authContent || document.getElementById("auth-content");
  tabs.forEach((tabBtn) => {
    const isActive = tabBtn.dataset.tab === state.authTab;
    tabBtn.classList.toggle("active", isActive);
    tabBtn.setAttribute("aria-selected", isActive ? "true" : "false");
    tabBtn.setAttribute("tabindex", isActive ? "0" : "-1");
  });
  if (!content) return;
  content.innerHTML = authView();
  bindAuthForms();
  ensureTurnstileWidgets();
}

export function bindAuthForms() {
  document.querySelector("[data-action='dismiss-reg-success']")?.addEventListener("click", () => {
    state.registrationSuccessBanner = null;
    renderAuthTab();
  });
  const login = document.getElementById("form-login");
  const register = document.getElementById("form-register");
  const recover = document.getElementById("form-recover");
  const togglePassword = document.querySelectorAll("[data-action='toggle-password']");
  togglePassword.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetForm = String(btn.dataset.target || "");
      let input = null;
      if (targetForm === "register") input = register?.querySelector("input[name='password']");
      else if (targetForm === "register-c") input = register?.querySelector("input[name='passwordConfirm']");
      else if (targetForm === "admin-create") input = document.querySelector("#form-admin-user-create input[name='password']");
      else if (targetForm === "admin-edit") input = document.querySelector("#form-admin-user-edit input[name='password']");
      else if (targetForm === "recover-complete")
        input = document.querySelector("#form-recover-complete input[name='password']");
      else if (targetForm === "recover-complete-c")
        input = document.querySelector("#form-recover-complete input[name='passwordConfirm']");
      else input = login?.querySelector("input[name='password']");
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      const eye = typeof IC !== "undefined" && IC.eye ? `${IC.eye} ` : "";
      btn.innerHTML = `${eye}${visible ? "Mostrar" : "Ocultar"}`;
    });
  });

  if (login) {
    const remembered = readRememberedLoginCredentials();
    if (remembered) {
      const em = login.querySelector("input[name='email']");
      const pw = login.querySelector("input[name='password']");
      const cb = login.querySelector("#login-remember-credentials");
      if (em) em.value = remembered.email;
      if (pw) pw.value = "";
      if (cb) cb.checked = true;
    }
    const loginSubmitBtn = login.querySelector("[data-login-submit]");
    window.wireFormSubmitGuard(
      login,
      async (event) => {
      if (Date.now() < state.authSecurity.lockUntil) {
        const secs = Math.ceil((state.authSecurity.lockUntil - Date.now()) / 1000);
        window.notify(window.userMessage("authLoginLock", secs), "error");
        return;
      }
      const data = __readFormEntriesNormalized(login);
      const passwordRaw = String(data.password || "");
      const V = window.AntaresValidation;
      if (V && typeof V.validateAuthLogin === "function") {
        const loginVal = V.validateAuthLogin(data);
        if (!loginVal.ok) {
          const field = login.querySelector(loginVal.fieldSelector || "input[name='email']");
          if (field) window.AntaresValidation?.setFieldError?.(field, loginVal.hint || loginVal.message);
          window.notify(loginVal.message, "error");
          return;
        }
        data.email = loginVal.sanitized.email;
      }

        /**
         * Si hay URL de API, la autenticacion es SOLO contra el servidor (PostgreSQL).
         * No se usa fallback local respecto a credenciales guardadas solo en el navegador.
         */
        if (window.AntaresApi?.getBase?.()) {
          try {
            const base = String(window.AntaresApi.getBase()).replace(/\/+$/, "");
            const turnstileToken = await waitForTurnstileToken(login);
            const headers = { "Content-Type": "application/json", Accept: "application/json" };
            if (
              typeof window.AntaresApi?.bearerAuthFallbackEnabled === "function" &&
              window.AntaresApi.bearerAuthFallbackEnabled()
            ) {
              headers["X-Antares-Bearer-Fallback"] = "1";
            }
            const res = await fetch(`${base}/api/auth/login`, {
              method: "POST",
              headers,
              credentials: "include",
              body: JSON.stringify({ email: data.email, password: passwordRaw, turnstileToken })
            });
            const body = await res.json().catch(() => null);
            const apiUser = body?.user;
            if (res.ok && apiUser?.userId) {
              if (typeof window.AntaresApi?.applyAuthTokensFromResponse === "function") {
                window.AntaresApi.applyAuthTokensFromResponse(body);
              } else if (body?.csrfToken && window.AntaresApi?.setCsrfToken) {
                window.AntaresApi.setCsrfToken(body.csrfToken);
              }
              const uid = apiUser.userId;
              let usersAfter = read(KEYS.users, []);
              let userApi = usersAfter.find((u) => String(u.id) === String(uid));
              if (!userApi) {
                try {
                  const me = await window.AntaresApi.getJson("/portal/me");
                  if (me?.id) {
                    window.upsertPortalUserRowIntoCache(me);
                    usersAfter = read(KEYS.users, []);
                    userApi = usersAfter.find((u) => String(u.id) === String(uid));
                  }
                } catch (_meErr) {
                  /* perfil vía bootstrap en segundo plano */
                }
              }
              if (!userApi) {
                userApi = upsertPortalUserStubFromJwtPayload({
                  sub: uid,
                  email: apiUser.email,
                  role: apiUser.role
                });
              }
              if (!userApi) {
                window.notify(window.userMessage("authProfileLoadFailed"), "error");
                return;
              }
              /** La API solo devuelve tokens si estado_cuenta es aprobado; no bloquear por caché local desactualizado. */
              state.authSecurity.failedAttempts = 0;
              state.authSecurity.lockUntil = 0;
              state.registrationSuccessBanner = null;
              setSession({
                userId: userApi.id,
                role: userApi.role,
                token: buildToken(userApi),
                lastActivityAt: Date.now(),
                tokenIssuedAt: Date.now(),
                profileSnapshot: buildProfileSnapshotFromUserRow(userApi)
              });
              if (data.rememberCredentials) writeRememberedLoginCredentials(data.email);
              else clearRememberedLoginCredentials();
              window.hideAuth();
              startSessionSecurityWatch();
              invokeAuthSuccessCallback();
              void startPortalBootstrapForInteractiveSession().finally(() => {
                maybeEnforceDataPolicyAcceptance();
              });
              return;
            }
            const apiMsg = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
            window.notify(String(apiMsg || window.userMessage("authInvalidServer")), "error");
            state.authSecurity.failedAttempts += 1;
            if (state.authSecurity.failedAttempts >= 5) {
              state.authSecurity.lockUntil = Date.now() + 60_000;
              state.authSecurity.failedAttempts = 0;
            }
            return;
          } catch (_e) {
            window.notify(window.userMessage("authNoConnection"), "error");
            return;
          }
        }

        const users = read(KEYS.users, []);
        const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(data.email));
        const valid = user ? await __authVerifyPassword(passwordRaw, user.password) : false;
        if (!valid || !user) {
          state.authSecurity.failedAttempts += 1;
          if (state.authSecurity.failedAttempts >= 5) {
            state.authSecurity.lockUntil = Date.now() + 60_000;
            state.authSecurity.failedAttempts = 0;
          }
          window.notify(window.userMessage("authInvalidLocal"), "error");
          return;
        }
        state.authSecurity.failedAttempts = 0;
        state.authSecurity.lockUntil = 0;
        if (isPortalUserPendingApproval(user)) {
          window.notify(window.userMessage("authPendingApproval"), "info");
          return;
        }
        if (user.accountStatus === ACCOUNT_STATUS.RECHAZADO) {
          window.notify(window.userMessage("authRejected"), "error");
          return;
        }
        setSession({
          userId: user.id,
          role: user.role,
          token: buildToken(user),
          lastActivityAt: Date.now(),
          tokenIssuedAt: Date.now(),
          profileSnapshot: buildProfileSnapshotFromUserRow(user)
        });
        void tryApiLoginBridge(user, passwordRaw);
        if (data.rememberCredentials) writeRememberedLoginCredentials(data.email);
        else clearRememberedLoginCredentials();
        window.hideAuth();
        startSessionSecurityWatch();
        invokeAuthSuccessCallback();
        maybeEnforceDataPolicyAcceptance();
      },
      {
        submitButton: loginSubmitBtn,
        busyText: "Ingresando…",
        loadingClass: "is-loading",
        onFinally: () => {
          if (!state.session) resetTurnstile(login);
        }
      }
    );
  }

  if (register) {
    window.attachDepartmentCitySelects(register, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    const registrationKindHidden = register.querySelector("#register-registration-kind");
    const syncRegisterKindUi = (kindRaw) => {
      const kind = normalizeRegistrationKindForDb(kindRaw);
      if (registrationKindHidden) registrationKindHidden.value = kind;
      register.querySelectorAll("[data-registration-kind]").forEach((btn) => {
        const selected = normalizeRegistrationKindForDb(btn.getAttribute("data-registration-kind")) === kind;
        btn.classList.toggle("is-selected", selected);
        btn.setAttribute("aria-pressed", selected ? "true" : "false");
      });
    };
    register.querySelectorAll("[data-registration-kind]").forEach((btn) => {
      btn.addEventListener("click", () => {
        syncRegisterKindUi(btn.getAttribute("data-registration-kind"));
      });
    });
    syncRegisterKindUi(registrationKindHidden?.value || "cliente");
    const personTypeSel = register.querySelector("select[name='personType']");
    const docTypeSel = register.querySelector("#register-doc-persona select[name='documentType']");
    const blockPersona = register.querySelector("#register-doc-persona");
    const blockEmpresa = register.querySelector("#register-doc-empresa");
    const inputTaxPersona = register.querySelector("input[name='taxId']");
    const inputCompanyNit = register.querySelector("input[name='companyNit']");
    const inputPersonalTax = register.querySelector("input[name='personalTaxId']");
    const syncRegisterDocLayout = () => {
      const isJuridica = window.isPersonTypeJuridica(personTypeSel?.value);
      if (blockPersona) {
        blockPersona.classList.toggle("hidden", isJuridica);
        blockPersona.toggleAttribute("hidden", isJuridica);
      }
      if (blockEmpresa) {
        blockEmpresa.classList.toggle("hidden", !isJuridica);
        blockEmpresa.toggleAttribute("hidden", !isJuridica);
      }
      if (docTypeSel) {
        if (isJuridica) {
          docTypeSel.removeAttribute("required");
        } else {
          docTypeSel.setAttribute("required", "required");
        }
      }
      if (inputTaxPersona) {
        if (isJuridica) {
          inputTaxPersona.removeAttribute("required");
          inputTaxPersona.value = "";
        } else {
          inputTaxPersona.setAttribute("required", "required");
        }
      }
      if (inputCompanyNit) {
        if (isJuridica) inputCompanyNit.setAttribute("required", "required");
        else {
          inputCompanyNit.removeAttribute("required");
          inputCompanyNit.value = "";
        }
      }
      if (inputPersonalTax) {
        if (isJuridica) inputPersonalTax.setAttribute("required", "required");
        else {
          inputPersonalTax.removeAttribute("required");
          inputPersonalTax.value = "";
        }
      }
    };
    personTypeSel?.addEventListener("change", syncRegisterDocLayout);
    syncRegisterDocLayout();

    const registerPhoneNat = register.querySelector(".js-register-phone-national");
    const registerPhoneCc = register.querySelector(".js-register-phone-cc");
    if (registerPhoneNat) {
      registerPhoneNat.addEventListener("input", () => window.syncPhoneHiddenFull(register, "register"));
    }
    if (registerPhoneCc) {
      registerPhoneCc.addEventListener("change", () => {
        window.AntaresValidation?.clearFieldError?.(registerPhoneNat);
        window.updatePhoneFieldForCountry(register, "register");
        window.syncPhoneHiddenFull(register, "register");
      });
    }
    window.updatePhoneFieldForCountry(register, "register");
    window.syncPhoneHiddenFull(register, "register");
    const regPass = register.querySelector("input[name='password']");
    const regPassConfirm = register.querySelector("input[name='passwordConfirm']");
    const syncRegisterPasswordMatchState = () => {
      if (!regPass || !regPassConfirm) return;
      regPass.classList.remove("password-match-ok", "password-match-bad");
      regPassConfirm.classList.remove("password-match-ok", "password-match-bad");
      const p1 = String(regPass.value || "");
      const p2 = String(regPassConfirm.value || "");
      if (!p1 && !p2) return;
      const same = p1.length > 0 && p1 === p2;
      regPass.classList.add(same ? "password-match-ok" : "password-match-bad");
      regPassConfirm.classList.add(same ? "password-match-ok" : "password-match-bad");
    };
    regPass?.addEventListener("input", syncRegisterPasswordMatchState);
    regPassConfirm?.addEventListener("input", syncRegisterPasswordMatchState);
    __bindPasswordStrengthSuite(regPass, register.querySelector("#register-password-strength-suite"));
    window.wireFormSubmitGuard(
      register,
      async (event) => {
      window.syncPhoneHiddenFull(register, "register");
      const data = __readFormEntriesNormalized(register);
      const registrationKind = readRegistrationKindFromForm(register, data.registrationKind);
      data.registrationKind = registrationKind;
      const Vreg = window.AntaresValidation;
      if (Vreg && typeof Vreg.validateDomForm === "function") {
        const domVal = Vreg.validateDomForm(register);
        if (!domVal.ok) {
          Vreg.focusInvalidField?.(domVal.firstInvalid, { pulse: true });
          return;
        }
      }
      const fullName = [
        normalizeLatinUpperForDb(data.firstName),
        normalizeLatinUpperForDb(data.middleName),
        normalizeLatinUpperForDb(data.lastName),
        normalizeLatinUpperForDb(data.secondLastName)
      ]
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .join(" ");
      if (!fullName) {
        failPortalField(register, "firstName", window.userMessage("registerNamesInvalid"));
        return;
      }
      data.personType = normalizePersonTypeForDb(data.personType);
      const isJuridica = data.personType === "Juridica";
      const docTypeUpper = String(data.documentType || "").toUpperCase();
      let personalDocStored = "";
      if (isJuridica) {
        const personalDocType = String(data.personalDocumentType || "CC").toUpperCase() === "CE" ? "CE" : "CC";
        const nitVal = window.validateColombianDocument("NIT", data.companyNit || "");
        const personalVal = window.validateColombianDocument(personalDocType, data.personalTaxId || "");
        if (!nitVal.ok) {
          failPortalField(register, "companyNit", nitVal.message);
          return;
        }
        if (!personalVal.ok) {
          failPortalField(register, "personalTaxId", personalVal.message);
          return;
        }
        data.companyNit = nitVal.normalized;
        data.personalTaxId = personalVal.normalized;
        data.taxId = nitVal.normalized;
        data.documentType = "NIT";
        personalDocStored = String(personalVal.normalized || "")
          .replace(/[.\s]/g, "")
          .replace(/\D/g, "");
      } else {
        const docValidation = window.validateColombianDocument(data.documentType, data.taxId);
        if (!docValidation.ok) {
          failPortalField(register, "taxId", docValidation.message);
          return;
        }
        data.taxId = docValidation.normalized;
        data.companyNit = "";
        data.personalTaxId = "";
        if (docTypeUpper === "PAS") {
          personalDocStored = String(docValidation.normalized || "").trim().toUpperCase();
        } else {
          personalDocStored = String(docValidation.normalized || "")
            .replace(/[.\s]/g, "")
            .replace(/\D/g, "");
        }
      }
      if (String(data.password || "") !== String(data.passwordConfirm || "")) {
        failPortalField(register, "passwordConfirm", window.userMessage("registerPasswordMismatch"));
        return;
      }
      const policy = __validatePasswordPolicy(data.password);
      if (!policy.ok) {
        failPortalField(register, "password", window.userMessage(policy.key));
        return;
      }
      if (!data.acceptTerms) {
        failPortalField(register, "acceptTerms", window.userMessage("registerTerms"));
        return;
      }
      const birthDateValue = new Date(String(data.birthDate || ""));
      if (!Number.isFinite(birthDateValue.getTime())) {
        window.notify(window.userMessage("registerBirthInvalid"), "error");
        return;
      }
      const ageYears = Math.floor((Date.now() - birthDateValue.getTime()) / 31557600000);
      if (ageYears < 18) {
        window.notify(window.userMessage("registerMinor"), "error");
        return;
      }
      const meta = window.getSelectedPhoneCountry(register, "register");
      const phoneDigitsAll = String(data.phone || "").replace(/\D/g, "");
      if (!phoneDigitsAll.startsWith(meta.dial)) {
        window.notify("El teléfono no coincide con el país seleccionado.", "error");
        return;
      }
      const nationalLen = phoneDigitsAll.length - meta.dial.length;
      if (nationalLen < meta.minNat || nationalLen > meta.maxNat) {
        window.notify(
          meta.style === "co"
            ? "Ingrese un celular colombiano válido (10 dígitos después de +57)."
            : `Ingrese entre ${meta.minNat} y ${meta.maxNat} dígitos del número local para ${meta.label}.`,
          "error"
        );
        return;
      }
      if (meta.style === "co") {
        const nat = phoneDigitsAll.slice(meta.dial.length);
        if (!nat.startsWith("3")) {
          window.notify("El celular en Colombia debe ser móvil (empieza por 3).", "error");
          return;
        }
      }

      if (window.AntaresApi?.getBase?.() && typeof window.AntaresApi.postJsonPublic === "function") {
        try {
          const turnstileToken = await waitForTurnstileToken(register);
          const body = await window.AntaresApi.postJsonPublic("/auth/register-portal", {
            firstName: normalizeLatinUpperForDb(data.firstName),
            middleName: normalizeLatinUpperForDb(data.middleName || ""),
            lastName: normalizeLatinUpperForDb(data.lastName),
            secondLastName: normalizeLatinUpperForDb(data.secondLastName || ""),
            personType: data.personType,
            documentType: normalizeLatinUpperForDb(data.documentType),
            taxId: data.taxId,
            companyNit: data.companyNit || "",
            personalTaxId: data.personalTaxId || "",
            personalDocumentType: isJuridica
              ? String(data.personalDocumentType || "CC").trim().toUpperCase()
              : undefined,
            birthDate: data.birthDate,
            gender: normalizeLatinUpperForDb(data.gender),
            position: normalizeLatinUpperForDb(data.position),
            workArea: normalizeLatinUpperForDb(data.workArea),
            phone: normalizeLatinUpperForDb(data.phone),
            department: normalizeLatinForDb(data.department),
            city: normalizeLatinForDb(data.city),
            address: normalizeLatinUpperForDb(data.address),
            email: data.email,
            registrationKind,
            password: data.password,
            acceptTerms: Boolean(data.acceptTerms),
            turnstileToken
          });
          const serverMsg =
            typeof body === "object" && body !== null && typeof body.message === "string"
              ? body.message.trim()
              : "";
          const successMsg = serverMsg || window.userMessage("registerSuccess");
          state.registrationSuccessBanner = {
            message: successMsg,
            email: String(data.email || "").trim(),
            pendingApproval: !(typeof body === "object" && body !== null && body.pendingApproval === false)
          };
          window.notify(window.userMessage("registerToastSuccess"), "success", 12000);
          state.authTab = "login";
          renderAuthTab();
          return;
        } catch (err) {
          const rawMsg = String(err?.message || "");
          const msg = /failed to fetch/i.test(rawMsg)
            ? "No fue posible conectar con la API. Verifica CORS_ORIGINS en Render y que la API este activa."
            : rawMsg || window.userMessage("genericError");
          window.notify(msg, "error");
          resetTurnstile(register);
          return;
        }
      }

      const users = read(KEYS.users, []);
      if (users.some((u) => normalizeEmail(u.email) === normalizeEmail(data.email))) {
        window.notify(window.userMessage("registerEmailExists"), "error");
        return;
      }
      if (personalDocStored && users.some((u) => window.getPersonalRegistrationKey(u) === personalDocStored)) {
        window.notify(window.userMessage("registerPersonalDocExists"), "error");
        return;
      }
      const { passwordConfirm, acceptTerms, companyNit, personalTaxId, personalDocumentType, ...profileData } =
        data;
      const newUser = {
        id: newUuidV4(),
        ...profileData,
        firstName: normalizeLatinUpperForDb(data.firstName),
        middleName: normalizeLatinUpperForDb(data.middleName || ""),
        lastName: normalizeLatinUpperForDb(data.lastName),
        secondLastName: normalizeLatinUpperForDb(data.secondLastName || ""),
        personType: data.personType,
        documentType: normalizeLatinUpperForDb(data.documentType),
        companyNit: isJuridica ? normalizeLatinUpperForDb(data.companyNit || "") : "",
        personalTaxId: isJuridica ? normalizeLatinUpperForDb(data.personalTaxId || "") : "",
        personalDoc: String(personalDocStored || ""),
        gender: normalizeLatinUpperForDb(data.gender),
        position: normalizeLatinUpperForDb(data.position),
        workArea: normalizeLatinUpperForDb(data.workArea),
        phone: normalizeLatinUpperForDb(data.phone),
        department: normalizeLatinForDb(data.department),
        city: normalizeLatinForDb(data.city),
        address: normalizeLatinUpperForDb(data.address),
        registrationKind,
        name: fullName,
        email: normalizeEmail(data.email),
        password: await __authHashPassword(data.password),
        role: ROLES.CLIENT,
        accountStatus: ACCOUNT_STATUS.PENDIENTE,
        companyId: null,
        company: "",
        permissions: defaultPermissionsForRole(ROLES.CLIENT),
        profileQualityChecklist: {
          idVerified: true,
          acceptedTermsAt: nowIso(),
          requiredFieldsCompleted: true,
          termsOfUseAccepted: true,
          privacyPolicyAccepted: true,
          habeasDataAcknowledged: true,
          dataPolicyAccepted: true,
          dataPolicyVersion: window.DATA_POLICY_VERSION || "2025-v1",
          registrationKind,
          ...(isJuridica
            ? {
                representativeDocumentType: String(data.personalDocumentType || "CC")
                  .trim()
                  .toUpperCase()
              }
            : {})
        },
        dataPolicyAcceptedAt: nowIso(),
        dataPolicyVersion: window.DATA_POLICY_VERSION || "2025-v1",
        requiresDataPolicyAcceptance: false,
        registeredAt: nowIso()
      };
      users.push(newUser);
      write(KEYS.users, users);
      sendEmail({
        to: data.email,
        subject: "Registro recibido - Antares Portal",
        body: "Tu solicitud de registro fue recibida. Un administrador revisara tu cuenta y te notificaremos cuando sea aprobada."
      });
      window.notifyAdminUsers(
        "Nuevo registro de cliente pendiente",
        `${fullName} solicita acceso al portal. Falta asociar empresa en aprobacion.`
      );
      read(KEYS.users, [])
        .filter((u) => u.role === ROLES.ADMIN)
        .forEach((admin) => {
          sendEmail({
            to: admin.email,
            subject: "Nuevo registro de cliente pendiente de aprobacion",
            body: `Cliente: ${fullName} | Documento: ${data.documentType || "-"} ${data.taxId || "-"} | Correo: ${data.email}`
          });
        });
      const offlineMsg = window.userMessage("registerSuccess");
      state.registrationSuccessBanner = {
        message: offlineMsg,
        email: String(data.email || "").trim(),
        pendingApproval: true
      };
      window.notify(window.userMessage("registerOfflineToast"), "success", 12000);
      state.authTab = "login";
      renderAuthTab();
      },
      { busyText: "Registrando…" }
    );
  }

  if (recover) {
    window.wireFormSubmitGuard(recover, async (event) => {
      const data = __readFormEntriesNormalized(recover);
      const V = window.AntaresValidation;
      if (V && typeof V.validateDomForm === "function") {
        const domVal = V.validateDomForm(recover);
        if (!domVal.ok) {
          V.focusInvalidField?.(domVal.firstInvalid, { pulse: true });
          return;
        }
      }
      const email = normalizeEmail(String(data.email || ""));
      if (!email) {
        const emailField = recover.querySelector("input[name='email']");
        const emailMsg = V?.MSG?.email || "Ingrese un correo electrónico válido (ejemplo: nombre@empresa.com).";
        if (V && emailField) {
          V.setFieldError?.(emailField, emailMsg);
          V.focusInvalidField?.(emailField, { pulse: true });
        } else {
          window.notify(emailMsg, "error");
        }
        return;
      }

      const api = window.AntaresApi;
      const apiBase = typeof api?.getBase === "function" ? api.getBase() : "";
      if (apiBase && typeof api?.postJsonPublic === "function") {
        try {
          const redirectTo = buildSupabasePasswordRecoveryRedirectUrl();
          const turnstileToken = await waitForTurnstileToken(recover);
          const body = await api.postJsonPublic("/auth/password-recovery/request", {
            email,
            redirectTo,
            turnstileToken
          });
          window.notify(String(body?.message || window.userMessage("recoverSentSupabase")), "info");
        } catch (err) {
          window.notify(String(err?.message || window.userMessage("recoverSupabaseError")), "error");
          resetTurnstile(recover);
        }
        return;
      }

      const supabase = await waitForAntaresSupabaseClient(15000);
      if (supabase) {
        try {
          const redirectTo = buildSupabasePasswordRecoveryRedirectUrl();
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
          if (error) {
            window.notify(String(error.message || window.userMessage("recoverSupabaseError")), "error");
            return;
          }
          window.notify(window.userMessage("recoverSentSupabase"), "info");
        } catch (err) {
          window.notify(String(err?.message || window.userMessage("recoverSupabaseError")), "error");
        }
        return;
      }

      const users = read(KEYS.users, []);
      const user = users.find((u) => normalizeEmail(u.email) === email);
      if (!user) {
        window.notify(window.userMessage("recoverNoUser"), "error");
        return;
      }
      sendEmail({
        to: user.email,
        subject: "Recuperacion de contrasena",
        body: `Hola ${user.name}, se solicito recuperacion de acceso. Por seguridad, solicita a un administrador restablecer tu contrasena.`
      });
      window.notify(window.userMessage("recoverSent"), "info");
    });
  }

  const recoverComplete = document.getElementById("form-recover-complete");
  if (recoverComplete) {
    const recoverPass = recoverComplete.querySelector("input[name='password']");
    const recoverPassConfirm = recoverComplete.querySelector("input[name='passwordConfirm']");
    __bindPasswordStrengthSuite(recoverPass, recoverComplete.querySelector("#recover-password-strength-suite"));
    const syncRecoverPasswordMatchState = () => {
      if (!recoverPass || !recoverPassConfirm) return;
      recoverPass.classList.remove("password-match-ok", "password-match-bad");
      recoverPassConfirm.classList.remove("password-match-ok", "password-match-bad");
      const p1 = String(recoverPass.value || "");
      const p2 = String(recoverPassConfirm.value || "");
      if (!p1 && !p2) return;
      const same = p1.length > 0 && p1 === p2;
      recoverPass.classList.add(same ? "password-match-ok" : "password-match-bad");
      recoverPassConfirm.classList.add(same ? "password-match-ok" : "password-match-bad");
    };
    recoverPass?.addEventListener("input", syncRecoverPasswordMatchState);
    recoverPassConfirm?.addEventListener("input", syncRecoverPasswordMatchState);

    window.wireFormSubmitGuard(recoverComplete, async (event) => {
      const apiBase = window.AntaresApi?.getBase?.();
      if (!apiBase) {
        window.notify(window.userMessage("recoverCompleteNeedsApi"), "error");
        return;
      }
      const fd = new FormData(recoverComplete);
      const p1 = String(fd.get("password") || "");
      const p2 = String(fd.get("passwordConfirm") || "");
      if (p1 !== p2) {
        window.notify(window.userMessage("registerPasswordMismatch"), "error");
        return;
      }
      const policy = __validatePasswordPolicy(p1);
      if (!policy.ok) {
        window.notify(window.userMessage(policy.key), "error");
        return;
      }
      const supabase = window.antaresSupabase || (await waitForAntaresSupabaseClient(5000));
      if (!supabase) {
        window.notify(window.userMessage("recoverSupabaseUnavailable"), "error");
        return;
      }
      const { data: sessWrap } = await supabase.auth.getSession();
      const token = sessWrap?.session?.access_token;
      if (!token) {
        window.notify(window.userMessage("recoverSessionMissing"), "error");
        return;
      }
      try {
        const base = String(apiBase).replace(/\/+$/, "");
        const res = await fetch(`${base}/api/auth/password-recovery/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ password: p1 })
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
          window.notify(String(msg || window.userMessage("recoverCompleteError")), "error");
          return;
        }
        await supabase.auth.signOut();
        try {
          sessionStorage.removeItem("antares_pw_recovery_pending");
        } catch (_e0) {}
        state.authSupabaseRecovery = false;
        state.authTab = "login";
        const okMsg = String(body?.message || window.userMessage("recoverCompleteSuccess"));
        window.notify(okMsg, "success", 9000);
        window.hideAuth();
        if (!getSession()) {
          try {
            history.replaceState(null, "", window.location.pathname + window.location.search);
          } catch (_u) {}
          window.scrollTo(0, 0);
        }
        invokeAuthSuccessCallback();
      } catch (_e) {
        window.notify(window.userMessage("authNoConnection"), "error");
      }
    });
  }

  window.AntaresValidation?.prepareFormsInRoot?.(document.getElementById("auth-content"));
}
void sanitizeLegacyApprovalPayloads();

export { ACCOUNT_STATUS };
