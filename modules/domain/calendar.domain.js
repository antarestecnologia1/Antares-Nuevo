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
  return rows.map((i) => {
    /* En el portal la cita se guarda en `when`; `scheduledAt` / `date` quedan por compatibilidad. */
    const when = i.when || i.scheduledAt || i.date;
    return {
      id: `interview-${i.id}`,
      kind: "interview",
      title: `Entrevista · ${String(i.candidateName || i.title || "Candidato")}`,
      subtitle: String(i.interviewer || i.position || ""),
      start: when,
      end: when,
      status: i.status,
      interviewId: i.id
    };
  });
}

/** `YYYY-MM-DD` → fecha local (mediodía o fin de día); evita que `new Date("2026-10-15")` caiga en UTC y se corra un día. */
function calendarDateOnlyToLocalIso(raw, endOfDay = false) {
  const s = String(raw || "").trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})(?:$|T00:00:00(?:\.0+)?Z?$)/);
  if (m) return `${m[1]}T${endOfDay ? "23:59:59" : "12:00:00"}`;
  return s;
}

export function mergeCalendarEvents({ requests, interviews, absences, absenceTypeLabel } = {}) {
  const req = buildTripCalendarEvents(requests ?? readPortalRequestsFallback());
  const int = buildInterviewCalendarEvents(interviews ?? []);
  const abs = Array.isArray(absences)
    ? absences.map((a) => {
        const startRaw = a.startDate || a.from;
        const endRaw = a.endDate || a.to || startRaw;
        const rawType = a.absenceType || a.type || "";
        const typeLabel =
          typeof absenceTypeLabel === "function" ? String(absenceTypeLabel(rawType) || "Novedad") : String(rawType || "Novedad");
        return {
          id: `absence-${a.id}`,
          kind: "absence",
          title: `${typeLabel} · ${String(a.employeeName || a.reason || "Colaborador")}`,
          subtitle: `${String(startRaw || "-")} → ${String(endRaw || "-")}`,
          start: calendarDateOnlyToLocalIso(startRaw),
          end: calendarDateOnlyToLocalIso(endRaw, true),
          status: a.status,
          absenceId: a.id
        };
      })
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

/** Convierte eventos de dominio al formato UI del calendario (con `Date` y `dot`). */
export function calendarEventsToUiRows(events, { reqRead } = {}) {
  const readReq =
    typeof reqRead === "function"
      ? reqRead
      : typeof globalThis.reqRead === "function"
        ? globalThis.reqRead
        : () => [];
  const dotByKind = { trip: "dot-trip", interview: "dot-interview", absence: "dot-absence" };
  return (Array.isArray(events) ? events : [])
    .map((ev) => {
      const ts = new Date(String(ev.start || "")).getTime();
      if (!Number.isFinite(ts)) return null;
      const kind = String(ev.kind || "trip");
      const row = {
        kind,
        id: String(ev.id || "").replace(/^(trip|interview|absence)-/, "") || String(ev.requestId || ev.interviewId || ev.absenceId || ""),
        start: new Date(ts),
        dot: dotByKind[kind] || "dot-trip",
        title: String(ev.title || "Evento"),
        subtitle: String(ev.subtitle || "")
      };
      const endTs = new Date(String(ev.end || ev.start || "")).getTime();
      row.end = new Date(Number.isFinite(endTs) && endTs >= ts ? endTs : ts);
      if (kind === "trip" && ev.requestId) {
        row.request = readReq().find((r) => String(r.id) === String(ev.requestId)) || null;
      }
      return row;
    })
    .filter(Boolean);
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

export const CAL_TIMELINE_DEFAULTS = {
  dayStartHour: 0,
  dayEndHour: 24,
  slotHeightPx: 56,
  minBlockPx: 32
};

const RESOURCE_ACCENT_COLORS = [
  "#4a8fd4",
  "#0d9488",
  "#7c3aed",
  "#ea580c",
  "#db2777",
  "#0891b2",
  "#65a30d",
  "#c026d3"
];

export function resourceDisplayInitials(label) {
  const parts = String(label || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return String(parts[0] || "?").slice(0, 2).toUpperCase();
}

/** URL de foto de conductor si es válida (http/https o data:image). */
export function resolveDriverPhotoUrl(driver) {
  const url = String(driver?.photoUrl || driver?.avatarUrl || "").trim();
  if (/^https?:\/\//i.test(url) || /^data:image\//i.test(url)) return url;
  return "";
}

/** Resuelve si la vista recursos agrupa por conductor o por camión. */
export function resolveCalendarResourceGroup(filters = {}, explicit = "auto") {
  const mode = String(explicit || "auto").trim().toLowerCase();
  if (mode === "vehicle" || mode === "driver") return mode;
  if (String(filters.vehicle || "").trim()) return "vehicle";
  if (String(filters.driver || "").trim()) return "driver";
  return "driver";
}

export function calendarDayKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Días calendario que abarca un rango [startMs, endMs). El fin es exclusivo: un viaje que termina
 * a las 00:00 no ocupa el día siguiente. Máximo `maxDays` (protege contra fechas absurdas).
 */
export function calendarRangeDayKeys(startMs, endMs, maxDays = 62) {
  const out = [];
  if (!Number.isFinite(startMs)) return out;
  const first = new Date(startMs);
  const lastMs = Math.max(startMs, (Number.isFinite(endMs) ? endMs : startMs) - 1);
  for (let i = 0; i < maxDays; i++) {
    const dayStart = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i, 0, 0, 0, 0);
    if (dayStart.getTime() > lastMs) break;
    out.push({ key: calendarDayKey(dayStart), date: dayStart });
  }
  return out;
}

export function filterEventsOnCalendarDay(events, focusDate) {
  const key = calendarDayKey(focusDate);
  return (Array.isArray(events) ? events : []).filter((evt) => {
    if (!(evt?.start instanceof Date) || Number.isNaN(evt.start.getTime())) return false;
    return calendarDayKey(evt.start) === key;
  });
}

export function eventTimelineRange(evt, tripRangeFn) {
  const kind = String(evt?.kind || "trip").toLowerCase();
  if (kind === "trip" && evt.request && typeof tripRangeFn === "function") {
    const range = tripRangeFn(evt.request);
    if (range) return { startMs: range.start, endMs: range.end };
  }
  if (kind === "absence") {
    /* Novedades de RR. HH.: días completos desde el día de inicio hasta el final del día de término. */
    const first = new Date(evt.start);
    first.setHours(0, 0, 0, 0);
    const lastRaw = evt.end instanceof Date && !Number.isNaN(evt.end.getTime()) ? evt.end : evt.start;
    const last = new Date(lastRaw);
    last.setHours(23, 59, 59, 999);
    return { startMs: first.getTime(), endMs: last.getTime() + 1 };
  }
  const startMs = evt.start.getTime();
  return { startMs, endMs: startMs + 60 * 60 * 1000 };
}

function assignOverlapLanes(blocks) {
  const sorted = [...blocks].sort((a, b) => a.startMs - b.startMs || b.endMs - a.endMs);
  const clusters = [];
  let cluster = [];
  let clusterEnd = 0;

  sorted.forEach((block) => {
    if (!cluster.length || block.startMs < clusterEnd) {
      cluster.push(block);
      clusterEnd = Math.max(clusterEnd, block.endMs);
    } else {
      clusters.push(cluster);
      cluster = [block];
      clusterEnd = block.endMs;
    }
  });
  if (cluster.length) clusters.push(cluster);

  clusters.forEach((group) => {
    const laneEnds = [];
    group.forEach((block) => {
      let lane = laneEnds.findIndex((end) => end <= block.startMs);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(block.endMs);
      } else {
        laneEnds[lane] = block.endMs;
      }
      block.lane = lane;
    });
    const laneCount = Math.max(1, laneEnds.length);
    group.forEach((block) => {
      block.laneCount = laneCount;
    });
  });

  return sorted;
}

/**
 * Modelo de layout para vista timeline por recurso (conductor o camión).
 */
export function buildResourceTimelineLayout({
  events = [],
  drivers = [],
  vehicles = [],
  focusDate = new Date(),
  resourceGroup = "driver",
  filters = {},
  opts = {}
} = {}) {
  const dayStartHour = opts.dayStartHour ?? CAL_TIMELINE_DEFAULTS.dayStartHour;
  const dayEndHour = opts.dayEndHour ?? CAL_TIMELINE_DEFAULTS.dayEndHour;
  const slotHeightPx = opts.slotHeightPx ?? CAL_TIMELINE_DEFAULTS.slotHeightPx;
  const minBlockPx = opts.minBlockPx ?? CAL_TIMELINE_DEFAULTS.minBlockPx;
  const tripRangeFn = opts.tripRangeFn;

  const focus = focusDate instanceof Date ? new Date(focusDate) : new Date(focusDate);
  focus.setHours(12, 0, 0, 0);
  const focusKey = calendarDayKey(focus);
  const dayWindowStartMs = new Date(focus.getFullYear(), focus.getMonth(), focus.getDate(), 0, 0, 0, 0).getTime();
  const dayWindowEndMs = new Date(focus.getFullYear(), focus.getMonth(), focus.getDate() + 1, 0, 0, 0, 0).getTime();
  /* Un viaje que cruza la medianoche o dura varios días aparece en cada día que ocupa. */
  const dayEvents = (Array.isArray(events) ? events : []).filter((evt) => {
    if (!(evt?.start instanceof Date) || Number.isNaN(evt.start.getTime())) return false;
    const kindLc = String(evt.kind || "trip").toLowerCase();
    if (kindLc !== "trip" && kindLc !== "absence") return calendarDayKey(evt.start) === focusKey;
    const r = eventTimelineRange(evt, tripRangeFn);
    return r.startMs < dayWindowEndMs && r.endMs > dayWindowStartMs;
  });

  const dayStartMs = new Date(
    focus.getFullYear(),
    focus.getMonth(),
    focus.getDate(),
    dayStartHour,
    0,
    0,
    0
  ).getTime();
  const dayEndMs = new Date(
    focus.getFullYear(),
    focus.getMonth(),
    focus.getDate(),
    dayEndHour,
    0,
    0,
    0
  ).getTime();
  const totalHeightPx = (dayEndHour - dayStartHour) * slotHeightPx;
  const msPerPx = (60 * 60 * 1000) / slotHeightPx;

  const driverById = new Map((Array.isArray(drivers) ? drivers : []).map((d) => [String(d.id), d]));
  const vehicleById = new Map((Array.isArray(vehicles) ? vehicles : []).map((v) => [String(v.id), v]));
  const group = String(resourceGroup || "driver").toLowerCase() === "vehicle" ? "vehicle" : "driver";
  const resourceMap = new Map();
  const blocksByResource = new Map();

  const forcedId =
    group === "driver" ? String(filters.driver || "").trim() : String(filters.vehicle || "").trim();

  const registerResource = (res) => {
    if (!res?.id || resourceMap.has(res.id)) return;
    resourceMap.set(res.id, { ...res, index: resourceMap.size });
  };

  if (forcedId) {
    if (group === "driver") {
      const d = driverById.get(forcedId);
      registerResource({
        id: forcedId,
        label: d?.name || "Conductor",
        subtitle: d?.phone || "",
        kind: "driver",
        photoUrl: resolveDriverPhotoUrl(d)
      });
    } else {
      const v = vehicleById.get(forcedId);
      registerResource({
        id: forcedId,
        label: v?.plate || "Vehículo",
        subtitle: v?.type || "",
        kind: "vehicle"
      });
    }
  }

  const resolveResource = (evt) => {
    const req = evt.request;
    if (evt.kind !== "trip" || !req?.trip) {
      return { id: "__other__", label: "General", subtitle: "Otros eventos", kind: "other" };
    }
    if (group === "vehicle") {
      const vid = String(req.trip.vehicleId || "").trim();
      const v = vehicleById.get(vid);
      return {
        id: vid || "__unassigned__",
        label: v?.plate || req.trip.vehiclePlate || "Sin vehículo",
        subtitle: v?.type || req.trip.vehicleType || "",
        kind: "vehicle"
      };
    }
    const did = String(req.trip.driverId || "").trim();
    const d = driverById.get(did);
    return {
      id: did || "__unassigned__",
      label: d?.name || req.trip.driverName || "Sin conductor",
      subtitle: d?.phone || req.trip.driverPhone || "",
      kind: "driver",
      photoUrl: resolveDriverPhotoUrl(d)
    };
  };

  if (opts.includeAllResources && !forcedId) {
    /* «Mostrar libres»: una columna por conductor/camión aunque no tenga viajes ese día. */
    if (group === "driver") {
      (Array.isArray(drivers) ? drivers : []).forEach((d) => {
        if (!d?.id) return;
        registerResource({
          id: String(d.id),
          label: d.name || d.fullName || "Conductor",
          subtitle: d.phone || "",
          kind: "driver",
          photoUrl: resolveDriverPhotoUrl(d)
        });
      });
    } else {
      (Array.isArray(vehicles) ? vehicles : []).forEach((v) => {
        if (!v?.id) return;
        registerResource({ id: String(v.id), label: v.plate || "Vehículo", subtitle: v.type || "", kind: "vehicle" });
      });
    }
  }

  dayEvents.forEach((evt) => {
    const res = resolveResource(evt);
    if (res.id === "__unassigned__") return;
    registerResource(res);
    const range = eventTimelineRange(evt, tripRangeFn);
    /* Se recorta a la jornada visible para que el bloque nunca se salga de la columna. */
    const visStartMs = Math.max(range.startMs, dayStartMs);
    const visEndMs = Math.min(range.endMs, dayEndMs);
    let topPx = Math.max(0, (visStartMs - dayStartMs) / msPerPx);
    let heightPx = Math.max(minBlockPx, (visEndMs - visStartMs) / msPerPx);
    if (topPx + heightPx > totalHeightPx) {
      heightPx = Math.max(minBlockPx, totalHeightPx - topPx);
      topPx = Math.max(0, totalHeightPx - heightPx);
    }
    if (!blocksByResource.has(res.id)) blocksByResource.set(res.id, []);
    blocksByResource.get(res.id).push({
      evt,
      startMs: visStartMs,
      endMs: Math.max(visEndMs, visStartMs + 1),
      rangeStartMs: range.startMs,
      rangeEndMs: range.endMs,
      topPx,
      heightPx,
      clippedStart: range.startMs < dayStartMs,
      clippedEnd: range.endMs > dayEndMs
    });
  });

  const resources = [...resourceMap.values()].sort((a, b) =>
    String(a.label).localeCompare(String(b.label), "es")
  );
  resources.forEach((res, index) => {
    res.index = index;
    res.accent = RESOURCE_ACCENT_COLORS[index % RESOURCE_ACCENT_COLORS.length];
    res.initials = resourceDisplayInitials(res.label);
    const rec = res.kind === "driver" ? driverById.get(res.id) : res.kind === "vehicle" ? vehicleById.get(res.id) : null;
    /* «No disponible» marcado a mano (no el automático por viaje). */
    res.unavailable = Boolean(rec && rec.available === false && rec.autoBusy !== true);
  });

  const blocks = [];
  resources.forEach((res) => {
    const rawBlocks = blocksByResource.get(res.id) || [];
    assignOverlapLanes(rawBlocks).forEach((b) => {
      const laneCount = b.laneCount || 1;
      const laneW = 100 / laneCount;
      blocks.push({
        resourceId: res.id,
        topPx: b.topPx,
        heightPx: b.heightPx,
        leftPct: (b.lane || 0) * laneW,
        widthPct: Math.max(laneW - 2, 28),
        evt: b.evt,
        rangeStartMs: b.rangeStartMs,
        rangeEndMs: b.rangeEndMs,
        clippedStart: b.clippedStart,
        clippedEnd: b.clippedEnd,
        clipped: b.clippedStart || b.clippedEnd
      });
    });
  });

  const hourLabels = [];
  for (let h = dayStartHour; h < dayEndHour; h++) {
    hourLabels.push({
      hour: h,
      topPx: (h - dayStartHour) * slotHeightPx,
      label: new Date(2000, 0, 1, h, 0).toLocaleTimeString("es-CO", {
        hour: "numeric",
        hour12: true
      })
    });
  }

  const now = new Date();
  const isToday = calendarDayKey(now) === calendarDayKey(focus);
  let nowTopPx = null;
  if (isToday) {
    const nowMs = now.getTime();
    if (nowMs >= dayStartMs && nowMs <= dayEndMs) {
      nowTopPx = (nowMs - dayStartMs) / msPerPx;
    }
  }

  return {
    resources,
    blocks,
    hourLabels,
    totalHeightPx,
    dayStartHour,
    dayEndHour,
    slotHeightPx,
    isToday,
    nowTopPx,
    eventCount: dayEvents.length,
    tripCount: blocks.filter((b) => b.evt.kind === "trip").length,
    resourceGroup: group
  };
}
