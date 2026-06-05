/**
 * FASE 6: extrae bloques de portal-runtime.js e inserta en auth.js antes de `export { ACCOUNT_STATUS };`.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pr = fs.readFileSync(path.join(root, "modules/core/portal-runtime.js"), "utf8");
const lines = pr.split(/\r?\n/);

function slice1Based(start, end) {
  return lines.slice(start - 1, end).join("\n");
}

const chunks = [slice1Based(6651, 7450), slice1Based(7503, 7756), slice1Based(7791, 7794), slice1Based(7827, 9014)];

let body = chunks.join("\n\n");

body = body.replace(/void\s+sanitizeLegacyApprovalPayloads\s*\(\s*\)\s*;/g, "");

body = body.replace(/\brenderPortal\s*\(\s*\)/g, "invokeAuthSuccessCallback()");

body = body.replace(/\bstopNotificationsPolling\s*\(\s*\)/g, "window.stopNotificationsPolling?.()");

body = body.replace(/\bfunction\s+sendEmail\b/g, "export function sendEmail");
body = body.replace(/\bfunction\s+buildSupabasePasswordRecoveryRedirectUrl\b/g, "export function buildSupabasePasswordRecoveryRedirectUrl");
body = body.replace(/\bfunction\s+stripSupabaseAuthHashFromUrl\b/g, "export function stripSupabaseAuthHashFromUrl");
body = body.replace(/\bfunction\s+scheduleStripSupabaseRecoveryHash\b/g, "export function scheduleStripSupabaseRecoveryHash");
body = body.replace(/\bfunction\s+parseSupabaseAuthErrorHashParams\b/g, "export function parseSupabaseAuthErrorHashParams");
body = body.replace(/\bfunction\s+maybeHandleSupabaseAuthUrlErrorFromHash\b/g, "export function maybeHandleSupabaseAuthUrlErrorFromHash");
body = body.replace(/\basync function\s+waitForAntaresSupabaseClient\b/g, "export async function waitForAntaresSupabaseClient");
body = body.replace(/\bfunction\s+wireSupabasePasswordRecoveryUi\b/g, "export function wireSupabasePasswordRecoveryUi");
body = body.replace(/\bfunction\s+findOrCreateCompanyIdByName\b/g, "export function findOrCreateCompanyIdByName");
body = body.replace(/\bfunction\s+getCompanyById\b/g, "export function getCompanyById");
body = body.replace(/\bfunction\s+companySelectOptions\b/g, "export function companySelectOptions");
body = body.replace(/\bfunction\s+getActivePositions\b/g, "export function getActivePositions");
body = body.replace(/\bfunction\s+getPositionById\b/g, "export function getPositionById");
body = body.replace(/\bfunction\s+positionSelectOptions\b/g, "export function positionSelectOptions");
body = body.replace(/\bfunction\s+dispatchPositionsCatalogUpdated\b/g, "export function dispatchPositionsCatalogUpdated");
body = body.replace(/\basync function\s+refreshPositionsCatalogFromApi\b/g, "export async function refreshPositionsCatalogFromApi");
body = body.replace(/\bfunction\s+refreshPositionSelectsInDocument\b/g, "export function refreshPositionSelectsInDocument");
body = body.replace(/\basync function\s+persistPositionsCatalog\b/g, "export async function persistPositionsCatalog");
body = body.replace(/\bfunction\s+ensureCompaniesAndUserMapping\b/g, "export function ensureCompaniesAndUserMapping");
body = body.replace(/\bfunction\s+ensureRequestsCompanyMapping\b/g, "export function ensureRequestsCompanyMapping");
body = body.replace(/\bfunction\s+ensureRequestAndTripIdentifiers\b/g, "export function ensureRequestAndTripIdentifiers");
body = body.replace(/\bfunction\s+normalizeSavedUserPermissions\b/g, "export function normalizeSavedUserPermissions");
body = body.replace(/\bfunction\s+repaintPermGridInForm\b/g, "export function repaintPermGridInForm");
body = body.replace(/\bfunction\s+wireAdminUserFormPermGridOnRoleChange\b/g, "export function wireAdminUserFormPermGridOnRoleChange");
body = body.replace(/\bfunction\s+ensureUsersPermissions\b/g, "export function ensureUsersPermissions");
body = body.replace(/\bfunction\s+ensureUsersAccountStatus\b/g, "export function ensureUsersAccountStatus");
body = body.replace(/\basync function\s+sanitizeApprovalPayloadForQueue\b/g, "export async function sanitizeApprovalPayloadForQueue");
body = body.replace(/\basync function\s+queueApproval\b/g, "export async function queueApproval");
body = body.replace(/\basync function\s+sanitizeLegacyApprovalPayloads\b/g, "export async function sanitizeLegacyApprovalPayloads");
body = body.replace(/\bfunction\s+approvalTypeLabel\b/g, "export function approvalTypeLabel");
body = body.replace(/\bfunction\s+shortAuthRefSegment\b/g, "export function shortAuthRefSegment");
body = body.replace(/\bfunction\s+authRefAltaUsuario\b/g, "export function authRefAltaUsuario");
body = body.replace(/\bfunction\s+maskSensitiveTail\b/g, "export function maskSensitiveTail");
body = body.replace(/\bfunction\s+maskSensitivePhone\b/g, "export function maskSensitivePhone");
body = body.replace(/\bfunction\s+authRefSolicitudViaje\b/g, "export function authRefSolicitudViaje");
body = body.replace(/\bfunction\s+authRefColaInterna\b/g, "export function authRefColaInterna");
body = body.replace(/\bfunction\s+approvalDetailLine\b/g, "export function approvalDetailLine");
body = body.replace(/\bfunction\s+buildAuthStandardActionsHtml\b/g, "export function buildAuthStandardActionsHtml");
body = body.replace(/\bfunction\s+sortAuthQueueByDateDesc\b/g, "export function sortAuthQueueByDateDesc");
body = body.replace(/\bfunction\s+buildAuthorizationsTransportRequestsSection\b/g, "export function buildAuthorizationsTransportRequestsSection");
body = body.replace(/\bfunction\s+portalRegistrationDetailLine\b/g, "export function portalRegistrationDetailLine");
body = body.replace(/\bfunction\s+registrationKindLabel\b/g, "export function registrationKindLabel");
body = body.replace(/\bfunction\s+registrationKindChipLabel\b/g, "export function registrationKindChipLabel");
body = body.replace(/\bfunction\s+portalRegistrationInboxInitials\b/g, "export function portalRegistrationInboxInitials");
body = body.replace(/\bfunction\s+buildPortalRegistrationInboxCardsHtml\b/g, "export function buildPortalRegistrationInboxCardsHtml");
body = body.replace(/\bfunction\s+buildPortalRegistrationPendingTableHtml\b/g, "export function buildPortalRegistrationPendingTableHtml");
body = body.replace(/\bfunction\s+buildPendingApprovalsTableHtml\b/g, "export function buildPendingApprovalsTableHtml");
body = body.replace(/\bfunction\s+stopSessionSecurityWatch\b/g, "export function stopSessionSecurityWatch");
body = body.replace(/\bfunction\s+checkSessionIdleAndLogout\b/g, "export function checkSessionIdleAndLogout");
body = body.replace(/\basync function\s+tryApiRefreshBridge\b/g, "export async function tryApiRefreshBridge");
body = body.replace(/\bfunction\s+refreshClientSessionTokenIfDue\b/g, "export function refreshClientSessionTokenIfDue");
body = body.replace(/\basync function\s+scheduledSessionTokenMaintenance\b/g, "export async function scheduledSessionTokenMaintenance");
body = body.replace(/\bfunction\s+queueSessionIdlePublicNotice\b/g, "export function queueSessionIdlePublicNotice");
body = body.replace(/\bfunction\s+dismissSessionIdlePublicNotice\b/g, "export function dismissSessionIdlePublicNotice");
body = body.replace(/\bfunction\s+mountSessionIdlePublicNoticeIfNeeded\b/g, "export function mountSessionIdlePublicNoticeIfNeeded");
body = body.replace(/\bfunction\s+announceSessionClosedByIdle\b/g, "export function announceSessionClosedByIdle");
body = body.replace(/\bfunction\s+ensureSessionLifecycleHooks\b/g, "export function ensureSessionLifecycleHooks");
body = body.replace(/\bfunction\s+startSessionSecurityWatch\b/g, "export function startSessionSecurityWatch");
body = body.replace(/\bfunction\s+clearSession\b/g, "export function clearSession");
body = body.replace(/\bfunction\s+buildToken\b/g, "export function buildToken");
body = body.replace(/\bfunction\s+currentTurnstileTheme\b/g, "function currentTurnstileTheme");
body = body.replace(/\bfunction\s+turnstileWidgetMarkup\b/g, "function turnstileWidgetMarkup");
body = body.replace(/\bfunction\s+ensureTurnstileWidgets\b/g, "function ensureTurnstileWidgets");
body = body.replace(/\bfunction\s+waitForTurnstileToken\b/g, "function waitForTurnstileToken");
body = body.replace(/\bfunction\s+readTurnstileToken\b/g, "function readTurnstileToken");
body = body.replace(/\bfunction\s+resetTurnstile\b/g, "function resetTurnstile");
body = body.replace(/\bfunction\s+authView\b/g, "function authView");
body = body.replace(/\bfunction\s+renderAuthTab\b/g, "export function renderAuthTab");
body = body.replace(/\bfunction\s+bindAuthForms\b/g, "export function bindAuthForms");

body = body.replace(/\bhashPassword\b/g, "__authHashPassword");
body = body.replace(/\bverifyPassword\b/g, "__authVerifyPassword");
body = body.replace(/\bbindPasswordStrengthSuite\b/g, "__bindPasswordStrengthSuite");
body = body.replace(/\bvalidatePasswordPolicy\b/g, "__validatePasswordPolicy");
body = body.replace(/\breadFormEntriesNormalized\b/g, "__readFormEntriesNormalized");
body = body.replace(/\bisCompanyRecordActive\b/g, "__isCompanyRecordActive");

body = body.replace(/\bwriteAwaitServer\b/g, "window.writeAwaitServer");

body = body.replace(/\bupsertPortalUserRowIntoCache\b/g, "window.upsertPortalUserRowIntoCache");

body = body.replace(/\bnotifyAdminUsers\b/g, "window.notifyAdminUsers");

body = body.replace(/\bnormalizeDriverFormPayloadForStorage\b/g, "window.normalizeDriverFormPayloadForStorage");
body = body.replace(/\bsanitizePayrollEmployeeFieldsForPersist\b/g, "window.sanitizePayrollEmployeeFieldsForPersist");

body = body.replace(/\bformatRoute\b/g, "window.formatRoute");
body = body.replace(/\bprettyStatus\b/g, "window.prettyStatus");
body = body.replace(/\bemptyState\b/g, "window.emptyState");
body = body.replace(/\bfmtDate\b/g, "window.fmtDate");
body = body.replace(/\bcanPortalUserEditTransportRequest\b/g, "window.canPortalUserEditTransportRequest");
body = body.replace(/\bpayrollAbsenceTypeLabel\b/g, "window.payrollAbsenceTypeLabel");

body = body.replace(/\bgetPersonalRegistrationKey\b/g, "window.getPersonalRegistrationKey");

body = body.replace(/\bdepartmentOptions\s*\(/g, "window.departmentOptions(");
body = body.replace(/\bregisterPhoneCountryOptionsHtml\s*\(/g, "window.registerPhoneCountryOptionsHtml(");
body = body.replace(/\battachDepartmentCitySelects\b/g, "window.attachDepartmentCitySelects");
body = body.replace(/\bvalidateColombianDocument\b/g, "window.validateColombianDocument");
body = body.replace(/\bupdateNotificationBadge\b/g, "window.updateNotificationBadge");

body = body.replace(/\bscheduleRenderPortalView\b/g, "window.scheduleRenderPortalView");

body = body.replace(/\bparseNum\b/g, "window.parseNum");

body = body.replace(/\bhasUnsavedPortalFormData\b/g, "window.hasUnsavedPortalFormData");

body = body.replace(/\bbuildGranularPermissionsCheckboxesHtml\b/g, "window.buildGranularPermissionsCheckboxesHtml");

body = body.replace(/\bisPersonTypeJuridica\b/g, "window.isPersonTypeJuridica");

body = body.replace(/\bgetSelectedPhoneCountry\b/g, "window.getSelectedPhoneCountry");
body = body.replace(/\bupdatePhoneFieldForCountry\b/g, "window.updatePhoneFieldForCountry");
body = body.replace(/\bsyncPhoneHiddenFull\b/g, "window.syncPhoneHiddenFull");

body = body.replace(/\bnotify\s*\(/g, "window.notify(");
body = body.replace(/\buserMessage\s*\(/g, "window.userMessage(");
body = body.replace(/\bwireFormSubmitGuard\b/g, "window.wireFormSubmitGuard");

body = body.replace(/\bsetFieldError\s*\(/g, "window.AntaresValidation?.setFieldError?.(");
body = body.replace(/\bclearFieldError\s*\(/g, "window.AntaresValidation?.clearFieldError?.(");

body = body.replace(/\bshowAuth\s*\(/g, "window.showAuth(");
body = body.replace(/\bhideAuth\s*\(/g, "window.hideAuth(");

const prelude = `
import { reqRead, reqWrite } from "../domain/solicitudes.domain.js";
import { nodes } from "./store.js";
import {
  escapeHtml,
  escapeAttr,
  normalizeEmail,
  companyKindLabel,
  normalizePayloadTextFields,
  normalizePersonTypeForDb,
  normalizeRegistrationKindForDb,
  normalizeLatinUpperForDb,
  fieldLabel,
  newUuidV4,
  nowIso,
  devWarn
} from "./utils.js";
import { normalizeLatinForDb } from "../domain/payroll-catalog-sanitize.domain.js";
import {
  decodeJwtPayload,
  upsertPortalUserStubFromJwtPayload,
  buildProfileSnapshotFromUserRow,
  syncSessionProfileSnapshotFromCache,
  portalCanRefreshFromApi,
  normalizePortalBootstrapPositionRow,
  startPortalBootstrapForInteractiveSession
} from "./bootstrap.js";
const IC = typeof window !== "undefined" ? window.IC || {} : {};
`;

const pwdHelpers = `
async function __authHashPassword(raw) {
  const input = String(raw || "");
  if (!input) return "";
  if (input.startsWith("sha256:")) return input;
  if (!window.crypto?.subtle) return \`sha256:\${btoa(input)}\`;
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hex = [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return \`sha256:\${hex}\`;
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
function __bindPasswordStrengthSuite(passInput, container) {
  if (!passInput || !container) return;
  const fill = container.querySelector(".password-strength-bar-fill");
  const pill = container.querySelector(".password-strength-pill");
  const headline = container.querySelector(".password-strength-headline");
  const bar = container.querySelector(".password-strength-bar");
  const rules = [...container.querySelectorAll(".password-rule-grid li[data-rule]")];
  const sync = () => {
    const r = __getPasswordStrengthReport(passInput.value);
    const active = passInput.value.length > 0;
    const complete = r.met === 5;
    if (fill) {
      fill.style.width = \`\${r.pct}%\`;
      fill.className = \`password-strength-bar-fill password-strength-bar-fill--\${r.tier}\`;
    }
    if (bar) {
      bar.setAttribute("aria-valuenow", String(r.pct));
      bar.classList.toggle("password-strength-bar--active", active);
      bar.classList.toggle("password-strength-bar--complete", complete);
    }
    if (pill) {
      pill.textContent = \`\${r.pct}%\`;
      pill.className = \`password-strength-pill password-strength-pill--\${r.tier}\`;
    }
    if (headline) headline.textContent = r.headline;
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
`;

const callbackBlock = `
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
`;

const insert = `\n${prelude}\n${pwdHelpers}\n${callbackBlock}\n${body}\nvoid sanitizeLegacyApprovalPayloads();\n`;

const authPath = path.join(root, "modules/core/auth.js");
let auth = fs.readFileSync(authPath, "utf8");

const marker = "export { ACCOUNT_STATUS };";
if (!auth.includes(marker)) {
  throw new Error("auth.js: marker not found");
}

auth = auth.replace(marker, `${insert}\n${marker}`);

fs.writeFileSync(authPath, auth);
console.log("OK: inserted", insert.length, "chars before ACCOUNT_STATUS export");
