/**
 * Métricas puras del dashboard (Torre de control).
 *
 * No leen el store ni el DOM: reciben los datos y devuelven números, de modo que se pueden
 * probar en Node (qa/dashboard-metrics.test.mjs). `dashboard.domain.js` es quien lee el
 * portal y llama a estas funciones.
 *
 * Convenciones
 * - Todas las fechas se manejan como «YYYY-MM-DD» en hora Colombia (UTC-5, sin horario de verano).
 * - Ingresos = servicios completados o cerrados. Se toma la factura si existe y, si no, el valor
 *   del viaje (+ cobro por standby). El «valor asegurado» es el valor de la carga, no un ingreso.
 * - «A tiempo» = entrega real hasta 15 min después de la hora estimada. Un viaje activo cuya hora
 *   estimada ya pasó cuenta como retrasado. Sin hora estimada o sin entrega real: no se evalúa.
 */

const CO_OFFSET_MS = -5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Tolerancia para considerar «a tiempo» una entrega (minutos). */
export const DASH_DELIVERY_GRACE_MIN = 15;
/** Meta de entregas a tiempo (%). Referencia habitual del sector; ajustable en un solo lugar. */
export const DASH_ON_TIME_TARGET_PCT = 95;
/** Ventana de aviso para documentos y contratos (días). */
export const DASH_EXPIRY_WINDOW_DAYS = 30;

export const DASH_PERIODS = Object.freeze([
  { id: "today", label: "Hoy" },
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
  { id: "month", label: "Este mes" }
]);

/* ───────────────────────────── fechas ───────────────────────────── */

export function ymdFromTs(ts) {
  if (!Number.isFinite(ts)) return "";
  return new Date(ts + CO_OFFSET_MS).toISOString().slice(0, 10);
}

/** Acepta «YYYY-MM-DD», ISO con hora, Date o timestamp. Devuelve «» si no se puede leer. */
export function ymdFromValue(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();
  const ts = value instanceof Date ? value.getTime() : typeof value === "number" ? value : new Date(value).getTime();
  return ymdFromTs(ts);
}

function tsOf(value) {
  if (value == null || value === "") return NaN;
  const ts = value instanceof Date ? value.getTime() : typeof value === "number" ? value : new Date(value).getTime();
  return Number.isFinite(ts) ? ts : NaN;
}

function ymdToUtcMs(ymd) {
  const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function addDaysYmd(ymd, days) {
  const base = ymdToUtcMs(ymd);
  if (!Number.isFinite(base)) return "";
  return new Date(base + days * DAY_MS).toISOString().slice(0, 10);
}

/** Días de `fromYmd` a `toYmd` (positivo si `toYmd` es posterior). */
export function diffDaysYmd(fromYmd, toYmd) {
  const a = ymdToUtcMs(fromYmd);
  const b = ymdToUtcMs(toYmd);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  return Math.round((b - a) / DAY_MS);
}

export function enumerateYmd(fromYmd, toYmd) {
  const out = [];
  if (!fromYmd || !toYmd || fromYmd > toYmd) return out;
  for (let cursor = fromYmd; cursor <= toYmd && out.length < 400; cursor = addDaysYmd(cursor, 1)) out.push(cursor);
  return out;
}

/**
 * Periodo seleccionado y el inmediatamente anterior (misma duración) para comparar.
 * @param {string} id  "today" | "7d" | "30d" | "month"
 * @param {string} todayYmd
 */
export function resolveDashboardPeriod(id, todayYmd) {
  const key = DASH_PERIODS.some((p) => p.id === id) ? id : "7d";
  let from = todayYmd;
  if (key === "7d") from = addDaysYmd(todayYmd, -6);
  else if (key === "30d") from = addDaysYmd(todayYmd, -29);
  else if (key === "month") from = `${todayYmd.slice(0, 8)}01`;
  const days = diffDaysYmd(from, todayYmd) + 1;
  const prevTo = addDaysYmd(from, -1);
  const prevFrom = addDaysYmd(prevTo, -(days - 1));
  const label = DASH_PERIODS.find((p) => p.id === key)?.label || "7 días";
  return { id: key, label, from, to: todayYmd, days, prevFrom, prevTo };
}


const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** «Hoy 6:00 p. m.», «Mañana 7:30 a. m.», «2 nov 2:00 p. m.» (hora Colombia). */
export function formatTsLabel(ts, todayYmd) {
  if (!Number.isFinite(ts)) return "Sin hora";
  const iso = new Date(ts + CO_OFFSET_MS).toISOString();
  const ymd = iso.slice(0, 10);
  const hour = Number(iso.slice(11, 13));
  const minutes = iso.slice(14, 16);
  const clock = `${((hour + 11) % 12) + 1}:${minutes} ${hour < 12 ? "a. m." : "p. m."}`;
  const delta = diffDaysYmd(todayYmd, ymd);
  const day = delta === 0 ? "Hoy" : delta === 1 ? "Mañana" : delta === -1 ? "Ayer" : `${Number(ymd.slice(8))} ${MONTHS_ES[Number(ymd.slice(5, 7)) - 1]}`;
  return `${day} ${clock}`;
}

/* ───────────────────────────── solicitudes / viajes ───────────────────────────── */

export function slugStatus(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_");
}

const CLOSED = new Set(["completada", "cerrada"]);
const CANCELLED = new Set(["cancelada", "rechazada"]);
const ACTIVE = new Set(["viaje_asignado", "en_transito", "espera_standby"]);

export const isClosedStatus = (s) => CLOSED.has(slugStatus(s));
export const isCancelledStatus = (s) => CANCELLED.has(slugStatus(s));
export const isActiveStatus = (s) => ACTIVE.has(slugStatus(s));

function num(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function requestEtaTs(r) {
  return tsOf(r?.trip?.etaDelivery || r?.etaDelivery || r?.deliveryAt);
}

export function requestDeliveredTs(r) {
  return tsOf(r?.deliveredAt || r?.closedAt);
}

/** Ingreso del servicio: factura, o valor del viaje + standby. Nunca el valor asegurado. */
export function requestRevenue(r) {
  const invoice = num(r?.trip?.invoice?.total);
  if (invoice > 0) return invoice;
  return num(r?.tripValue) + num(r?.standbyChargeTotal);
}

/** Fecha (YMD) en que «ocurre» el servicio para efectos del periodo. */
export function requestServiceYmd(r) {
  const closed = isClosedStatus(r?.status);
  const candidates = closed
    ? [requestDeliveredTs(r), requestEtaTs(r), tsOf(r?.pickupAt), tsOf(r?.createdAt)]
    : [requestEtaTs(r), tsOf(r?.pickupAt), tsOf(r?.createdAt)];
  const ts = candidates.find((v) => Number.isFinite(v));
  return ymdFromTs(ts);
}

/**
 * Resultado de la entrega: "ontime" | "late" | null (sin datos suficientes).
 * @returns {{ result: "ontime"|"late"|null, ymd: string, lateMin: number }}
 */
export function evaluateDelivery(r, nowTs = Date.now()) {
  const eta = requestEtaTs(r);
  if (!Number.isFinite(eta)) return { result: null, ymd: "", lateMin: 0 };
  if (isClosedStatus(r?.status)) {
    const delivered = requestDeliveredTs(r);
    if (!Number.isFinite(delivered)) return { result: null, ymd: "", lateMin: 0 };
    const lateMin = Math.round((delivered - eta) / 60000);
    return { result: lateMin <= DASH_DELIVERY_GRACE_MIN ? "ontime" : "late", ymd: ymdFromTs(delivered), lateMin: Math.max(0, lateMin) };
  }
  if (isActiveStatus(r?.status) && eta < nowTs) {
    return { result: "late", ymd: ymdFromTs(eta), lateMin: Math.max(1, Math.round((nowTs - eta) / 60000)) };
  }
  return { result: null, ymd: "", lateMin: 0 };
}

function inRange(ymd, from, to) {
  return Boolean(ymd) && ymd >= from && ymd <= to;
}

function logYmd(log) {
  return ymdFromValue(log?.date || log?.createdAt);
}

function summarizeRange({ requests, fuelLogs, techLogs, from, to, nowTs }) {
  let revenue = 0;
  let completed = 0;
  let trips = 0;
  let inProgressValue = 0;
  let ontime = 0;
  let late = 0;
  requests.forEach((r) => {
    if (isCancelledStatus(r?.status)) return;
    const svc = requestServiceYmd(r);
    if (inRange(svc, from, to)) {
      if (r?.trip) trips += 1;
      if (isClosedStatus(r?.status)) {
        completed += 1;
        revenue += requestRevenue(r);
      } else if (isActiveStatus(r?.status)) {
        inProgressValue += requestRevenue(r);
      }
    }
    const ev = evaluateDelivery(r, nowTs);
    if (ev.result && inRange(ev.ymd, from, to)) {
      if (ev.result === "ontime") ontime += 1;
      else late += 1;
    }
  });
  const fuelCost = fuelLogs.filter((l) => inRange(logYmd(l), from, to)).reduce((a, l) => a + num(l.totalCost), 0);
  const maintCost = techLogs.filter((l) => inRange(logYmd(l), from, to)).reduce((a, l) => a + num(l.cost), 0);
  const cost = fuelCost + maintCost;
  const evaluated = ontime + late;
  return {
    revenue,
    completed,
    trips,
    inProgressValue,
    fuelCost,
    maintCost,
    cost,
    result: revenue - cost,
    marginPct: revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : null,
    ontime,
    late,
    evaluated,
    onTimePct: evaluated > 0 ? Math.round((ontime / evaluated) * 100) : null
  };
}

/** Variación porcentual; `null` si no hay base para comparar. */
export function pctChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

/**
 * Desempeño del periodo contra el anterior + series diarias para las gráficas.
 * Las series cubren al menos 7 días para que «Hoy» también muestre tendencia.
 */
export function computePeriodPerformance({ requests = [], fuelLogs = [], techLogs = [], period, nowTs = Date.now(), topClients = 6 }) {
  const reqs = Array.isArray(requests) ? requests : [];
  const fuel = Array.isArray(fuelLogs) ? fuelLogs : [];
  const tech = Array.isArray(techLogs) ? techLogs : [];
  const current = summarizeRange({ requests: reqs, fuelLogs: fuel, techLogs: tech, from: period.from, to: period.to, nowTs });
  const previous = summarizeRange({ requests: reqs, fuelLogs: fuel, techLogs: tech, from: period.prevFrom, to: period.prevTo, nowTs });

  const seriesFrom = diffDaysYmd(period.from, period.to) < 6 ? addDaysYmd(period.to, -6) : period.from;
  const days = enumerateYmd(seriesFrom, period.to);
  const idx = new Map(days.map((d, i) => [d, i]));
  const zeros = () => days.map(() => 0);
  const series = { days, revenue: zeros(), cost: zeros(), ontime: zeros(), late: zeros(), completed: zeros() };
  reqs.forEach((r) => {
    if (isCancelledStatus(r?.status)) return;
    const svc = requestServiceYmd(r);
    if (idx.has(svc) && isClosedStatus(r?.status)) {
      series.revenue[idx.get(svc)] += requestRevenue(r);
      series.completed[idx.get(svc)] += 1;
    }
    const ev = evaluateDelivery(r, nowTs);
    if (ev.result && idx.has(ev.ymd)) series[ev.result === "ontime" ? "ontime" : "late"][idx.get(ev.ymd)] += 1;
  });
  fuel.forEach((l) => {
    const d = logYmd(l);
    if (idx.has(d)) series.cost[idx.get(d)] += num(l.totalCost);
  });
  tech.forEach((l) => {
    const d = logYmd(l);
    if (idx.has(d)) series.cost[idx.get(d)] += num(l.cost);
  });

  const byClient = new Map();
  reqs.forEach((r) => {
    if (!isClosedStatus(r?.status) || !inRange(requestServiceYmd(r), period.from, period.to)) return;
    const name = String(r?.clientName || "Sin cliente").trim() || "Sin cliente";
    byClient.set(name, (byClient.get(name) || 0) + requestRevenue(r));
  });
  const ranked = [...byClient.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const head = ranked.slice(0, topClients).map(([label, value]) => ({ label, value }));
  const tailValue = ranked.slice(topClients).reduce((a, [, v]) => a + v, 0);
  const clients = tailValue > 0 ? [...head, { label: `Otros (${ranked.length - topClients})`, value: tailValue, other: true }] : head;
  const total = ranked.reduce((a, [, v]) => a + v, 0);
  const share = (n) => (total > 0 ? Math.round((ranked.slice(0, n).reduce((a, [, v]) => a + v, 0) / total) * 100) : 0);

  return {
    period,
    current,
    previous,
    deltas: {
      revenue: pctChange(current.revenue, previous.revenue),
      completed: pctChange(current.completed, previous.completed),
      cost: pctChange(current.cost, previous.cost),
      onTimePts:
        current.onTimePct != null && previous.onTimePct != null ? current.onTimePct - previous.onTimePct : null
    },
    series,
    clients: { rows: clients, total, top1Pct: share(1), top3Pct: share(3), count: ranked.length }
  };
}

/* ───────────────────────────── tablero de hoy ───────────────────────────── */

/**
 * Viajes en curso y pendientes por atender, ordenados por urgencia.
 * `filter` del tablero: all | late | route | assign | done
 */
export function computeTodayBoard({ requests = [], todayYmd, nowTs = Date.now() }) {
  const rows = [];
  const counts = { all: 0, late: 0, route: 0, standby: 0, assigned: 0, assign: 0, review: 0, done: 0 };
  (Array.isArray(requests) ? requests : []).forEach((r) => {
    const slug = slugStatus(r?.status);
    const eta = requestEtaTs(r);
    const delayed = isActiveStatus(slug) && Number.isFinite(eta) && eta < nowTs;
    let bucket = "";
    if (slug === "en_transito" || slug === "espera_standby") {
      bucket = "route";
      if (slug === "espera_standby") counts.standby += 1;
    } else if (slug === "viaje_asignado") bucket = "assigned";
    else if (slug === "aprobada_pendiente_asignacion") bucket = "assign";
    else if (slug === "pendiente") bucket = "review";
    else if (isClosedStatus(slug)) {
      const deliveredYmd = ymdFromTs(requestDeliveredTs(r));
      if ((deliveredYmd || requestServiceYmd(r)) === todayYmd) bucket = "done";
    }
    if (!bucket) return;
    if (bucket === "review") {
      counts.review += 1;
      return;
    }
    counts[bucket] += 1;
    counts.all += 1;
    if (delayed) counts.late += 1;
    const pickup = tsOf(r.trip?.etaPickup || r.pickupAt);
    /* Avance por tiempo entre la recogida y la entrega estimada (no es GPS). Solo viajes en ruta. */
    const progress =
      bucket === "route" && Number.isFinite(pickup) && Number.isFinite(eta) && eta > pickup
        ? Math.max(0, Math.min(100, Math.round(((nowTs - pickup) / (eta - pickup)) * 100)))
        : null;
    rows.push({
      id: r.id,
      number: String(r.requestNumber || r.id || ""),
      client: String(r.clientName || "—"),
      origin: [r.originCity].filter(Boolean).join(""),
      destination: [r.destinationCity].filter(Boolean).join(""),
      plate: String(r.trip?.vehiclePlate || ""),
      driver: String(r.trip?.driverName || ""),
      status: String(r.status || ""),
      slug,
      bucket,
      delayed,
      lateMin: delayed ? Math.max(1, Math.round((nowTs - eta) / 60000)) : 0,
      etaTs: eta,
      etaLabel: formatTsLabel(eta, todayYmd),
      pickupTs: pickup,
      progress
    });
  });
  const rank = (row) => (row.delayed ? 0 : row.bucket === "route" ? 1 : row.bucket === "assign" ? 2 : row.bucket === "assigned" ? 3 : 4);
  rows.sort((a, b) => rank(a) - rank(b) || (a.delayed ? b.lateMin - a.lateMin : (a.etaTs || Infinity) - (b.etaTs || Infinity)));
  return { rows, counts };
}

/* ───────────────────────────── flota ───────────────────────────── */

/** Días hasta el vencimiento (negativo = vencido). `null` si no hay fecha. */
export function documentDays({ expiry, expedition }, todayYmd) {
  const exp = ymdFromValue(expiry);
  if (exp) return diffDaysYmd(todayYmd, exp);
  const exd = ymdFromValue(expedition);
  if (exd) {
    const y = Number(exd.slice(0, 4));
    return diffDaysYmd(todayYmd, `${y + 1}${exd.slice(4)}`);
  }
  return null;
}

export function vehicleDocumentDays(vehicle, todayYmd) {
  return {
    soat: documentDays({ expiry: vehicle?.soatExpiryDate, expedition: vehicle?.soatExpeditionDate }, todayYmd),
    tech: documentDays({ expiry: vehicle?.techInspectionExpiryDate, expedition: vehicle?.techInspectionExpeditionDate }, todayYmd)
  };
}

const FLEET_STATES = [
  { id: "route", label: "En ruta" },
  { id: "assigned", label: "Asignado" },
  { id: "free", label: "Disponible" },
  { id: "blocked", label: "Documento vencido" },
  { id: "shop", label: "En taller" },
  { id: "off", label: "Fuera de servicio" }
];

/** Cada camión cuenta en un solo estado; taller y baja manual priman sobre el viaje. */
export function computeFleetState({ vehicles = [], requests = [], todayYmd }) {
  const route = new Set();
  const assigned = new Set();
  (Array.isArray(requests) ? requests : []).forEach((r) => {
    const id = String(r?.trip?.vehicleId || "").trim();
    if (!id) return;
    const slug = slugStatus(r?.status);
    if (slug === "en_transito" || slug === "espera_standby") route.add(id);
    else if (slug === "viaje_asignado") assigned.add(id);
  });
  const counts = Object.fromEntries(FLEET_STATES.map((s) => [s.id, 0]));
  const plates = Object.fromEntries(FLEET_STATES.map((s) => [s.id, []]));
  (Array.isArray(vehicles) ? vehicles : []).forEach((v) => {
    const id = String(v?.id || "");
    const status = slugStatus(v?.status);
    const docs = vehicleDocumentDays(v, todayYmd);
    let state = "free";
    if (/mainten|manten|taller|repair/.test(status)) state = "shop";
    else if (/inactiv/.test(status) || (v?.available === false && v?.autoBusy !== true)) state = "off";
    else if (route.has(id)) state = "route";
    else if (assigned.has(id)) state = "assigned";
    else if ((docs.soat != null && docs.soat < 0) || (docs.tech != null && docs.tech < 0)) state = "blocked";
    counts[state] += 1;
    plates[state].push(String(v?.plate || "—"));
  });
  const total = (Array.isArray(vehicles) ? vehicles : []).length;
  const operable = total - counts.shop - counts.off;
  const busy = counts.route + counts.assigned;
  return {
    total,
    states: FLEET_STATES.map((s) => ({ ...s, count: counts[s.id], plates: plates[s.id] })),
    operable,
    available: counts.free,
    utilizationPct: operable > 0 ? Math.round((busy / operable) * 100) : null
  };
}

/* ───────────────────────────── vencimientos (vehículos, conductores, personal) ───────────────────────────── */

export function isEmployeeActive(e) {
  if (!e) return false;
  if (e.active === false) return false;
  return !/desvincul|retirad|inactiv/.test(slugStatus(e.status));
}

function normName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function firstName(value, fallback) {
  const t = String(value || "").trim();
  return t ? t.split(/\s+/).slice(0, 2).join(" ") : fallback;
}

/**
 * Documentos y controles vencidos o por vencer en los próximos `windowDays`.
 * `resolveExpiry(entity, expiryKey, dateKey)` permite calcular vigencias a partir de la fecha del examen.
 */
export function computeExpirations({
  vehicles = [],
  drivers = [],
  employees = [],
  todayYmd,
  windowDays = DASH_EXPIRY_WINDOW_DAYS,
  resolveExpiry = (entity, expiryKey) => ymdFromValue(entity?.[expiryKey])
}) {
  const items = [];
  const seen = new Set();
  const totals = { tracked: 0, expired: 0, soon: 0, unknown: 0 };

  const push = ({ key, kind, subject, what, ymd, days, view }) => {
    totals.tracked += 1;
    if (days == null) {
      totals.unknown += 1;
      return;
    }
    if (days < 0) totals.expired += 1;
    else if (days <= windowDays) totals.soon += 1;
    else return;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ kind, subject, what, ymd, days, view, tone: days < 0 ? "alert" : "warn" });
  };

  (Array.isArray(vehicles) ? vehicles : []).forEach((v) => {
    if (/inactiv/.test(slugStatus(v?.status))) return;
    const plate = String(v?.plate || "Sin placa").trim();
    const d = vehicleDocumentDays(v, todayYmd);
    push({ key: `veh|${v.id}|soat`, kind: "vehicle", subject: plate, what: "SOAT", ymd: ymdFromValue(v?.soatExpiryDate), days: d.soat, view: "transport-vehicles" });
    push({ key: `veh|${v.id}|tech`, kind: "vehicle", subject: plate, what: "Tecnomecánica", ymd: ymdFromValue(v?.techInspectionExpiryDate), days: d.tech, view: "transport-vehicles" });
  });

  const person = (entity, kind, isDriver) => {
    const subject = firstName(entity?.name || entity?.fullName, "Persona");
    const who = normName(entity?.name || entity?.fullName);
    const check = (what, expiryKey, dateKey) => {
      const ymd = resolveExpiry(entity, expiryKey, dateKey);
      if (!ymd) return;
      push({
        key: `per|${who}|${what}`,
        kind,
        subject,
        what,
        ymd,
        days: diffDaysYmd(todayYmd, ymd),
        view: what === "Licencia" ? "transport-drivers" : "labor-compliance"
      });
    };
    if (isDriver) check("Licencia", "licenseExpiry", "licenseIssueDate");
    check("Examen ocupacional", "occupationalExamExpiry", "occupationalExamDate");
    if (isDriver) check("Examen instruvial", "instruvialExamExpiry", "instruvialExamDate");
  };

  (Array.isArray(drivers) ? drivers : []).forEach((d) => person(d, "driver", true));
  (Array.isArray(employees) ? employees : []).forEach((e) => {
    if (!isEmployeeActive(e)) return;
    person(e, "staff", slugStatus(e?.workerRole) === "conductor");
  });

  items.sort((a, b) => a.days - b.days);
  return {
    items,
    totals: {
      ...totals,
      okPct: totals.tracked - totals.unknown > 0 ? Math.round(((totals.tracked - totals.unknown - totals.expired) / (totals.tracked - totals.unknown)) * 100) : null
    }
  };
}

/** Contratos a término fijo que vencen en la ventana. */
export function computeContractsEnding({ employees = [], todayYmd, windowDays = DASH_EXPIRY_WINDOW_DAYS }) {
  const rows = [];
  (Array.isArray(employees) ? employees : []).forEach((e) => {
    if (!isEmployeeActive(e)) return;
    const end = ymdFromValue(e?.contractEndDate);
    if (!end) return;
    const days = diffDaysYmd(todayYmd, end);
    if (days >= 0 && days <= windowDays) rows.push({ subject: firstName(e.name, "Colaborador"), ymd: end, days });
  });
  rows.sort((a, b) => a.days - b.days);
  return rows;
}

/** Embudo de selección: vacantes abiertas y candidatos en proceso. */
export function computeHiringSnapshot({ vacancies = [], candidates = [], todayYmd }) {
  const open = (Array.isArray(vacancies) ? vacancies : []).filter((v) => {
    if (String(v?.status || "").trim() !== "Publicada") return false;
    const deadline = ymdFromValue(v?.deadline);
    return !deadline || deadline >= todayYmd;
  });
  const inProcess = (Array.isArray(candidates) ? candidates : []).filter((c) => !["Contratado", "Descartado"].includes(String(c?.status || "").trim()));
  const toInterview = inProcess.filter((c) => ["Recibido", "Preseleccionado"].includes(String(c?.status || "").trim()));
  return { openVacancies: open.length, candidatesInProcess: inProcess.length, candidatesToReview: toInterview.length };
}

/** Prospectos del formulario web recibidos en los últimos `days` días. */
export function countRecentLeads(leads = [], nowTs = Date.now(), days = 7) {
  return (Array.isArray(leads) ? leads : []).filter((l) => {
    const ts = tsOf(l?.createdAt);
    return Number.isFinite(ts) && nowTs - ts >= 0 && nowTs - ts <= days * DAY_MS;
  }).length;
}
