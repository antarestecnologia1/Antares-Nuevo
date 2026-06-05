/**
 * Alcance de datos para usuarios cliente (empresa vs. individual).
 * Extraído desde `portal-runtime.js` para imports explícitos (sin shim `AppLegacyViews`).
 */
import { state } from "./store.js";
import { CLIENT_DATA_SCOPE, ROLES } from "./config.js";
import { escapeHtml, escapeAttr } from "./utils.js";

/** Iconos del portal (`portal-icons.js` expone `window.IC` para módulos ES). */
function portalIcons() {
  return /** @type {Record<string, string>} */ (typeof globalThis !== "undefined" && globalThis.IC) || {};
}

export function getClientDataScope() {
  const s = String(state.clientDataScope || CLIENT_DATA_SCOPE.COMPANY);
  return s === CLIENT_DATA_SCOPE.INDIVIDUAL ? CLIENT_DATA_SCOPE.INDIVIDUAL : CLIENT_DATA_SCOPE.COMPANY;
}

export function isPortalClientUser(user) {
  return user?.role === ROLES.CLIENT;
}

export function clientRequestsScopePrimaryLabel() {
  return getClientDataScope() === CLIENT_DATA_SCOPE.INDIVIDUAL
    ? "Mis solicitudes"
    : "Solicitudes de mi empresa";
}

export function clientDataScopeBarHtml(activeScope) {
  const IC = portalIcons();
  const active =
    String(activeScope || "") === CLIENT_DATA_SCOPE.INDIVIDUAL
      ? CLIENT_DATA_SCOPE.INDIVIDUAL
      : CLIENT_DATA_SCOPE.COMPANY;
  const pill = (key, label) =>
    `<button type="button" class="ops-filter-pill${active === key ? " is-active" : ""}" data-action="client-data-scope" data-scope="${escapeAttr(key)}"><span>${escapeHtml(label)}</span></button>`;
  return `<div class="client-data-scope-bar ops-filters-bar" role="group" aria-label="Alcance de datos">
    <span class="muted client-data-scope-label">${IC.briefcase || ""} Ver:</span>
    ${pill(CLIENT_DATA_SCOPE.COMPANY, "Toda mi empresa")}
    ${pill(CLIENT_DATA_SCOPE.INDIVIDUAL, "Solo mis solicitudes")}
  </div>`;
}
