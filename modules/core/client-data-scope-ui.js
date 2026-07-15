/**
 * Alcance de datos para usuarios cliente (empresa vs. individual).
 * Extraído desde `portal-runtime.js` para imports explícitos (sin shim `AppLegacyViews`).
 */
import { state } from "./store.js";
import { CLIENT_DATA_SCOPE, PERMISSIONS, ROLES, CLIENT_ROLE_PERMISSIONS } from "./config.js";
import { escapeHtml, escapeAttr } from "./utils.js";
import {
  filterVisibleTransportRequests,
  transportRequestBelongsToUserScope
} from "../domain/solicitudes.domain.js";

export const CLIENT_PORTAL_VIEWS = Object.freeze(new Set(["requests", "profile"]));

function clientEffectivePermissions(user) {
  const assignable = new Set(CLIENT_ROLE_PERMISSIONS);
  const current = Array.isArray(user?.permissions)
    ? user.permissions.filter((p) => assignable.has(p))
    : [];
  if (current.length > 0) return current;
  return [...CLIENT_ROLE_PERMISSIONS];
}

function clientHasPermission(user, permission) {
  return clientEffectivePermissions(user).includes(permission);
}

function filterTripRouteRatesForCompany(rates, companyId) {
  if (!rates || typeof rates !== "object" || !companyId) return {};
  const cid = String(companyId).trim();
  const out = {};
  for (const [key, entry] of Object.entries(rates)) {
    if (entry == null) continue;
    const val =
      typeof entry === "number"
        ? { value: entry, companyIds: [] }
        : entry && typeof entry === "object"
          ? entry
          : null;
    if (!val) continue;
    const ids = Array.isArray(val.companyIds) ? val.companyIds.map(String).filter(Boolean) : [];
    if (!ids.length || ids.includes(cid)) {
      out[key] = val;
    }
  }
  return out;
}

/**
 * Defensa en profundidad: recorta el payload de bootstrap antes de hidratar caché local.
 * El servidor ya filtra; esto evita fugas si la caché o una respuesta antigua trae datos de más.
 */
export function scopePortalBootstrapPayloadForClient(p, user) {
  if (!p || typeof p !== "object" || !isPortalClientUser(user)) return p;
  const companyId = String(user.companyId || "").trim();
  const userId = String(user.id || "").trim();
  const scoped = { ...p };

  const stripOperatorData = () => {
    scoped.vehicles = [];
    scoped.drivers = [];
    scoped.fuelLogs = [];
    scoped.vehicleTechnicalLogs = [];
    scoped.payrollEmployees = [];
    scoped.payrollRuns = [];
    scoped.vacancies = [];
    scoped.candidates = [];
    scoped.interviews = [];
    scoped.contracts = [];
    scoped.positions = [];
    scoped.hrAbsences = [];
    scoped.sstCompliance = [];
    scoped.emails = [];
    scoped.contacts = [];
    scoped.counters = {};
    scoped.travelAllowanceRules = {};
    scoped.deletedTransportTripLogs = [];
    scoped.deletedTransportRequestLogs = [];
    scoped.portalAuditEvents = [];
    scoped.approvals = [];
  };

  stripOperatorData();

  if (Array.isArray(scoped.companies) && companyId) {
    scoped.companies = scoped.companies.filter((c) => String(c?.id || "").trim() === companyId);
  }

  if (Array.isArray(scoped.users)) {
    scoped.users = scoped.users.filter((u) => {
      const uid = String(u?.id || "").trim();
      const cid = String(u?.companyId || "").trim();
      return uid === userId || (companyId && cid === companyId);
    });
  }

  if (!clientHasPermission(user, PERMISSIONS.CLIENT_REQUESTS)) {
    scoped.requests = [];
    scoped.tripRouteRates = {};
  } else {
    if (Array.isArray(scoped.requests)) {
      scoped.requests = filterVisibleTransportRequests(scoped.requests, user, {
        getClientDataScope
      });
    }
    if (scoped.tripRouteRates && companyId) {
      scoped.tripRouteRates = filterTripRouteRatesForCompany(scoped.tripRouteRates, companyId);
    }
  }

  const canDocuments = false;
  if (!canDocuments) {
    scoped.employeeDocuments = [];
    scoped.employeeDocumentFolders = [];
  }

  return scoped;
}

/** ¿El registro pertenece a la empresa del cliente? */
export function portalRecordBelongsToClientCompany(record, user, companyField = "companyId") {
  if (!isPortalClientUser(user)) return true;
  const companyId = String(user.companyId || "").trim();
  if (!companyId) return String(record?.clientUserId || record?.userId || "") === String(user.id || "");
  const recCompany = String(record?.[companyField] || record?.clientCompanyId || record?.id_empresa || "").trim();
  return recCompany === companyId;
}

export { transportRequestBelongsToUserScope };

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
