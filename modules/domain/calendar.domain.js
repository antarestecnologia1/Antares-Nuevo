/**
 * Dominio de calendario de transporte: agregación de eventos (viajes, entrevistas, ausencias).
 */
import { KEYS } from "../core/config.js";
import { read } from "../core/data-io.js";

const KIND_LABELS = {
  trip: "Viaje",
  interview: "Entrevista",
  absence: "Ausencia"
};

export function calendarEventKindLabel(kind) {
  return KIND_LABELS[String(kind || "").trim().toLowerCase()] || "Evento";
}

/** Eventos de viaje a partir de solicitudes con trip asignado. */
export function buildTripCalendarEvents(requests) {
  const rows = Array.isArray(requests) ? requests : [];
  return rows
    .filter((r) => r?.trip)
    .map((r) => ({
      id: `trip-${r.id}`,
      kind: "trip",
      title: String(r.trip?.tripNumber || r.requestNumber || "Viaje"),
      subtitle: String(r.clientName || ""),
      start: r.trip?.etaPickup || r.pickupAt || r.createdAt,
      end: r.trip?.etaDelivery || r.deliveryAt || r.trip?.etaPickup || r.pickupAt,
      status: r.status,
      requestId: r.id,
      tripId: r.trip?.id
    }));
}

export function buildInterviewCalendarEvents(interviews) {
  const rows = Array.isArray(interviews) ? interviews : [];
  return rows.map((i) => ({
    id: `interview-${i.id}`,
    kind: "interview",
    title: String(i.candidateName || i.title || "Entrevista"),
    subtitle: String(i.position || ""),
    start: i.scheduledAt || i.date,
    end: i.scheduledAt || i.date,
    status: i.status,
    interviewId: i.id
  }));
}

export function mergeCalendarEvents({ requests, interviews, absences } = {}) {
  const req = buildTripCalendarEvents(requests ?? readPortalRequestsFallback());
  const int = buildInterviewCalendarEvents(interviews ?? []);
  const abs = Array.isArray(absences)
    ? absences.map((a) => ({
        id: `absence-${a.id}`,
        kind: "absence",
        title: String(a.employeeName || a.reason || "Ausencia"),
        subtitle: String(a.type || ""),
        start: a.startDate || a.from,
        end: a.endDate || a.to || a.startDate,
        status: a.status,
        absenceId: a.id
      }))
    : [];
  return [...req, ...int, ...abs].sort(
    (a, b) => new Date(a.start || 0).getTime() - new Date(b.start || 0).getTime()
  );
}

function readPortalRequestsFallback() {
  try {
    if (typeof globalThis.readPortalTransportRequests === "function") {
      return globalThis.readPortalTransportRequests();
    }
  } catch (_e) {
    /* noop */
  }
  return read(KEYS.requests, []);
}

export function filterCalendarEvents(events, filters = {}) {
  const rows = Array.isArray(events) ? events : [];
  const driver = String(filters.driver || "").trim().toLowerCase();
  const vehicle = String(filters.vehicle || "").trim().toLowerCase();
  const status = String(filters.status || "").trim().toLowerCase();
  const kind = String(filters.kind || "").trim().toLowerCase();
  return rows.filter((ev) => {
    if (kind && String(ev.kind || "").toLowerCase() !== kind) return false;
    if (status && String(ev.status || "").toLowerCase() !== status) return false;
    if (driver && !String(ev.subtitle || ev.title || "").toLowerCase().includes(driver)) return false;
    if (vehicle && !String(ev.subtitle || ev.title || "").toLowerCase().includes(vehicle)) return false;
    return true;
  });
}
