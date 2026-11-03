/**
 * Dominio del dashboard (Torre de control): lee el portal, aplica permisos y arma
 * el modelo que pinta `modules/app/dashboard.js`. Los cálculos viven en
 * `dashboard-metrics.domain.js` (puros y con pruebas).
 */
import { KEYS } from "../core/config.js";
import { read } from "../core/data-io.js";
import { canAccessAuthorizationsView, isViewAllowedForUser } from "../core/auth.js";
import { isPortalClientUser } from "../core/client-data-scope-ui.js";
import { colombiaNowIso, colombiaTodayIsoDate } from "../core/utils.js";
import { filterPendingApprovalsForActor, readApprovalsSync, readPendingPortalRegistrationsSync } from "./authorizations.domain.js";
import { resolveEmployeeComplianceExpiryYmd } from "./driver-compliance-vigencia.domain.js";
import * as M from "./dashboard-metrics.domain.js";

function readRequests() {
  if (typeof globalThis.readPortalTransportRequests === "function") {
    return globalThis.readPortalTransportRequests();
  }
  return read(KEYS.requests, []);
}

function getVisibleRequests(user) {
  const SD = globalThis.AntaresSolicitudesDomain;
  if (!user || !SD || typeof SD.filterVisibleTransportRequests !== "function") return [];
  return SD.filterVisibleTransportRequests(readRequests(), user, {
    getClientDataScope: globalThis.getClientDataScope,
    canViewAllTransportRequests: globalThis.canViewAllTransportRequests
  });
}

function countPendingTripAssignments(user, visible) {
  const SD = globalThis.AntaresSolicitudesDomain;
  if (!SD || typeof SD.filterPendingRequestsForTripAssignment !== "function") return 0;
  return SD.filterPendingRequestsForTripAssignment(visible, user, globalThis.canApproveTransportRequests).length;
}

function countAuthorizationQueue(user) {
  if (!user || !canAccessAuthorizationsView(user)) return 0;
  const approvals = readApprovalsSync().filter((a) => String(a?.status || "").toLowerCase() === "pendiente");
  const pendingApprovals = filterPendingApprovalsForActor(approvals, user).length;
  const pendingRegs =
    typeof globalThis.canApprovePortalRegistration === "function" && globalThis.canApprovePortalRegistration(user)
      ? readPendingPortalRegistrationsSync().length
      : 0;
  return pendingApprovals + pendingRegs;
}

/** Totales generales (los usa el módulo Calendario). */
export function computeDashboardKpis() {
  const requests = readRequests();
  const trips = requests.filter((r) => r?.trip);
  return {
    requestsTotal: requests.length,
    tripsTotal: trips.length,
    activeTrips: requests.filter((r) => M.isActiveStatus(r?.status)).length,
    completedTrips: requests.filter((r) => M.isClosedStatus(r?.status)).length,
    pendingRequests: requests.filter((r) => M.slugStatus(r?.status) === "pendiente").length,
    vehiclesTotal: read(KEYS.vehicles, []).length,
    driversTotal: read(KEYS.drivers, []).length
  };
}

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

function minutesLabel(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function joinSubjects(items, max = 3) {
  const names = [...new Set(items.map((i) => i.subject))];
  return names.length > max ? `${names.slice(0, max).join(", ")} y ${names.length - max} más` : names.join(", ");
}

/**
 * Qué necesita atención ahora, de lo más urgente a lo menos urgente.
 * Cada ítem enlaza al módulo donde se resuelve (solo si el usuario puede abrirlo).
 */
function buildAttentionQueue({ board, expirations, contracts, pendingAssign, pendingAuth, leads, can }) {
  const out = [];
  const add = (item) => {
    if (item.view && !can(item.view)) return;
    out.push(item);
  };

  const late = board.rows.filter((r) => r.delayed);
  if (late.length) {
    const worst = late[0];
    add({
      id: "late",
      tone: "alert",
      count: late.length,
      title: `${plural(late.length, "entrega retrasada", "entregas retrasadas")}`,
      detail: `${worst.plate || "Sin placa"} · ${worst.client} · lleva ${minutesLabel(worst.lateMin)} de retraso`,
      action: "dash-board-filter",
      filter: "late",
      cta: "Ver viajes"
    });
  }
  if (board.counts.standby) {
    add({
      id: "standby",
      tone: "warn",
      count: board.counts.standby,
      title: `${plural(board.counts.standby, "viaje en espera (standby)", "viajes en espera (standby)")}`,
      detail: "Detenidos: confirme con el conductor y el cliente.",
      action: "dash-board-filter",
      filter: "route",
      cta: "Ver viajes"
    });
  }
  if (pendingAssign > 0) {
    add({
      id: "assign",
      tone: "warn",
      count: pendingAssign,
      title: `${plural(pendingAssign, "solicitud sin viaje asignado", "solicitudes sin viaje asignado")}`,
      detail: "Aprobadas y listas para asignar camión y conductor.",
      view: "transport-trips",
      cta: "Asignar"
    });
  }

  const kinds = [
    { kind: "vehicle", label: "de la flota", view: "transport-vehicles" },
    { kind: "driver", label: "de conductores", view: "transport-drivers" },
    { kind: "staff", label: "de personal", view: "labor-compliance" }
  ];
  kinds.forEach(({ kind, label, view }) => {
    const rows = expirations.items.filter((i) => i.kind === kind);
    if (!rows.length) return;
    const expired = rows.filter((r) => r.days < 0);
    const soon = rows.filter((r) => r.days >= 0);
    const parts = [];
    if (expired.length) parts.push(plural(expired.length, "vencido", "vencidos"));
    if (soon.length) parts.push(`${soon.length} por vencer`);
    add({
      id: `docs-${kind}`,
      tone: expired.length ? "alert" : "warn",
      count: rows.length,
      title: `${plural(rows.length, "documento", "documentos")} ${label}: ${parts.join(" y ")}`,
      detail: joinSubjects(expired.length ? expired : soon),
      view,
      cta: "Revisar"
    });
  });

  if (pendingAuth > 0) {
    add({
      id: "auth",
      tone: "warn",
      count: pendingAuth,
      title: `${plural(pendingAuth, "autorización pendiente", "autorizaciones pendientes")}`,
      detail: "Aprobaciones, altas y solicitudes en bandeja.",
      view: "authorizations",
      cta: "Resolver"
    });
  }
  if (contracts.length) {
    add({
      id: "contracts",
      tone: "warn",
      count: contracts.length,
      title: `${plural(contracts.length, "contrato a término fijo", "contratos a término fijo")} por vencer`,
      detail: `${joinSubjects(contracts, 2)} · el aviso de no renovación exige 30 días de antelación.`,
      view: "payroll",
      cta: "Revisar"
    });
  }
  if (leads > 0) {
    add({
      id: "leads",
      tone: "info",
      count: leads,
      title: `${plural(leads, "prospecto nuevo", "prospectos nuevos")} del sitio web (7 días)`,
      detail: "Responder pronto aumenta la probabilidad de cierre.",
      view: "contact-leads",
      cta: "Ver prospectos"
    });
  }

  const rank = { alert: 0, warn: 1, info: 2 };
  return out.sort((a, b) => rank[a.tone] - rank[b.tone]);
}

/**
 * Modelo completo de la Torre de control.
 * @param {object} user
 * @param {{ period?: string }} [opts]
 */
export function computeControlTower(user, opts = {}) {
  const nowTs = Date.now();
  const todayYmd = colombiaTodayIsoDate();
  const isClient = isPortalClientUser(user);
  const can = (view) => Boolean(user) && isViewAllowedForUser(user, view);
  const period = M.resolveDashboardPeriod(String(opts.period || "7d"), todayYmd);

  const requests = getVisibleRequests(user);
  const finance = isClient || can("reports");
  const fuelLogs = !isClient && finance ? read(KEYS.fuelLogs, []) : [];
  const techLogs = !isClient && finance ? read(KEYS.vehicleTechnicalLogs, []) : [];

  const perf = M.computePeriodPerformance({ requests, fuelLogs, techLogs, period, nowTs });
  const board = M.computeTodayBoard({ requests, todayYmd, nowTs });

  const base = {
    generatedAt: colombiaNowIso(),
    todayYmd,
    nowTs,
    isClient,
    finance,
    period,
    perf,
    board,
    onTimeTarget: M.DASH_ON_TIME_TARGET_PCT,
    access: {
      trips: can("transport-trips"),
      requests: can("requests"),
      vehicles: can("transport-vehicles"),
      drivers: can("transport-drivers"),
      reports: can("reports"),
      calendar: can("transport-calendar"),
      authorizations: can("authorizations")
    }
  };

  if (isClient) {
    const ownPending = requests.filter((r) => M.slugStatus(r?.status) === "pendiente").length;
    const attention = [];
    if (board.counts.late) {
      attention.push({ id: "late", tone: "alert", count: board.counts.late, title: plural(board.counts.late, "entrega con retraso", "entregas con retraso"), detail: "Consulte el detalle de la solicitud para ver el estado actualizado.", action: "dash-board-filter", filter: "late", cta: "Ver" });
    }
    if (ownPending) {
      attention.push({ id: "pending", tone: "warn", count: ownPending, title: plural(ownPending, "solicitud en revisión", "solicitudes en revisión"), detail: "Esperando respuesta de Transportes Antares.", view: "requests", cta: "Ver solicitudes" });
    }
    return { ...base, fleet: null, expirations: null, people: null, commercial: null, attention, ownPending };
  }

  const vehicles = can("transport-vehicles") ? read(KEYS.vehicles, []) : [];
  const drivers = can("transport-drivers") ? read(KEYS.drivers, []) : [];
  const employees = can("labor-compliance") || can("payroll") ? read(KEYS.payrollEmployees, []) : [];
  const fleet = can("transport-vehicles") ? M.computeFleetState({ vehicles, requests: readRequests(), todayYmd }) : null;

  const resolveExpiry = (entity, expiryKey, dateKey) =>
    resolveEmployeeComplianceExpiryYmd(entity, expiryKey, dateKey, M.ymdFromValue);
  const expirations = M.computeExpirations({
    vehicles,
    drivers,
    employees: can("labor-compliance") ? employees : [],
    todayYmd,
    resolveExpiry
  });
  const contracts = can("payroll") ? M.computeContractsEnding({ employees, todayYmd }) : [];
  const hiring = can("hiring")
    ? M.computeHiringSnapshot({ vacancies: read(KEYS.vacancies, []), candidates: read(KEYS.candidates, []), todayYmd })
    : null;
  const leadList = can("contact-leads") && globalThis.state && Array.isArray(globalThis.state.portalContacts) ? globalThis.state.portalContacts : null;
  const leads = leadList ? M.countRecentLeads(leadList, nowTs, 7) : 0;
  const pendingAssign = countPendingTripAssignments(user, requests);
  const pendingAuth = countAuthorizationQueue(user);

  return {
    ...base,
    fleet,
    expirations,
    people: { contracts, hiring },
    commercial: { leads: leadList ? leads : null, activeClients: perf.clients.count },
    pendingAuth,
    pendingAssign,
    attention: buildAttentionQueue({ board, expirations, contracts, pendingAssign, pendingAuth, leads, can })
  };
}
