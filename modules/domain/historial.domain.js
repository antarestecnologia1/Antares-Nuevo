/**
 * Dominio historial: solicitudes cerradas, flota (combustible / taller), factura PDF de viaje
 * y normalización de logs para bootstrap y formularios.
 * Extraído desde `portal-runtime.js` (Fase 11).
 */
import { KEYS, HISTORY_FLEET_TECH_LABELS } from "../core/config.js";
import { read, write, writeAwaitServer } from "../core/data-io.js";
import { portalCanRefreshFromApi } from "../core/bootstrap.js";
import {
  escapeAttr,
  escapeHtml,
  fieldLabel,
  fmtDate,
  fmtFleetLogDate,
  normalizeLatinUpperForDb,
  nowIso
} from "../core/utils.js";
import { notify, userMessage } from "../ui/modals.js";
import { renderManagedCreateFormActions } from "../ui/components.js";
import { reqRead, reqWriteAwait } from "./solicitudes.domain.js";
import { buildTripInvoice, historyVehicleColumn } from "./viajes.domain.js";

function ic() {
  return typeof globalThis !== "undefined" && globalThis.IC ? globalThis.IC : /** @type {Record<string, string>} */ ({});
}

export function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Valor monetario desde input con formato es-CO ($ y separadores de miles). */
export function parseMoneyFieldValue(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return 0;
  const digits = s.replace(/[^\d]/g, "");
  if (digits) return parseInt(digits, 10) || 0;
  return parseNum(s);
}

export function formatMoneyFieldValue(amount) {
  const n = Math.max(0, Math.floor(parseNum(amount)));
  if (n <= 0) return "0";
  return n.toLocaleString("es-CO");
}

/** Normaliza fila de combustible (bootstrap API ↔ portal). */
export function normalizeFuelLogPortalRow(log) {
  if (!log || typeof log !== "object") return log;
  const plate = String(log.vehiclePlate || log.plate || log.placa_vehiculo || "").trim().toUpperCase();
  const dateRaw = log.date || log.fecha;
  const date =
    typeof dateRaw === "string" && dateRaw.length >= 10
      ? dateRaw.slice(0, 10)
      : dateRaw
        ? String(new Date(dateRaw).toISOString()).slice(0, 10)
        : "";
  const liters = parseNum(log.liters ?? log.litros);
  const totalCost = parseNum(log.totalCost ?? log.costo_total ?? log.total_cost);
  return {
    ...log,
    id: log.id,
    date,
    vehicleId: log.vehicleId || log.id_vehiculo || log.vehicle_id,
    plate,
    vehiclePlate: plate,
    driverId: log.driverId || log.id_conductor,
    driverName: normalizeLatinUpperForDb(log.driverName || log.nombre_conductor || ""),
    tripNumber: String(log.tripNumber || log.numero_viaje || "").trim(),
    liters,
    totalCost,
    costPerLiter:
      log.costPerLiter != null
        ? parseNum(log.costPerLiter)
        : log.costo_por_litro != null
          ? parseNum(log.costo_por_litro)
          : liters > 0
            ? Math.round(totalCost / liters)
            : 0,
    odometerKm:
      log.odometerKm != null
        ? parseNum(log.odometerKm)
        : log.kilometraje_odometro != null
          ? parseNum(log.kilometraje_odometro)
          : null,
    station: normalizeLatinUpperForDb(log.station || log.estacion || ""),
    paidBy: String(log.paidBy || log.pagado_por || "empresa").toLowerCase() === "conductor" ? "conductor" : "empresa",
    createdAt: log.createdAt || log.fecha_registro || nowIso()
  };
}

/** Payload alineado con registros_combustible (sync-key / PostgreSQL). */
export function fuelLogRowForServer(log) {
  const n = normalizeFuelLogPortalRow(log);
  const liters = parseNum(n.liters);
  const totalCost = parseNum(n.totalCost);
  return {
    id: n.id,
    date: n.date || nowIso().slice(0, 10),
    vehicleId: n.vehicleId,
    plate: n.plate || n.vehiclePlate,
    driverId: n.driverId,
    driverName: n.driverName,
    tripNumber: n.tripNumber || null,
    liters,
    totalCost,
    costPerLiter: liters > 0 ? Math.round(totalCost / liters) : parseNum(n.costPerLiter) || null,
    odometerKm: parseNum(n.odometerKm) > 0 ? parseNum(n.odometerKm) : null,
    station: n.station || null,
    paidBy: n.paidBy || "empresa",
    createdAt: n.createdAt
  };
}

export function normalizeFuelLogsList(list) {
  return (Array.isArray(list) ? list : []).map(normalizeFuelLogPortalRow);
}

/** Normaliza fila de taller (bootstrap API ↔ portal). */
export function normalizeVehicleTechnicalLogPortalRow(log) {
  if (!log || typeof log !== "object") return log;
  const plate = String(log.vehiclePlate || log.plate || log.placa_vehiculo || "").trim().toUpperCase();
  const typeKey = String(log.interventionType || log.type || log.tipo_intervencion || "preventivo").toLowerCase();
  const status = String(log.followUpStatus || log.status || log.estado_seguimiento || "Pendiente").trim();
  const dateRaw = log.date || log.fecha;
  const date =
    typeof dateRaw === "string" && dateRaw.length >= 10
      ? dateRaw.slice(0, 10)
      : dateRaw
        ? String(new Date(dateRaw).toISOString()).slice(0, 10)
        : "";
  return {
    ...log,
    id: log.id,
    date,
    vehicleId: log.vehicleId || log.id_vehiculo,
    plate,
    vehiclePlate: plate,
    interventionType: typeKey,
    type: typeKey,
    description: normalizeLatinUpperForDb(log.description || log.descripcion || ""),
    cost: parseNum(log.cost ?? log.costo),
    downtimeHours: parseNum(log.downtimeHours ?? log.horas_inactividad ?? log.hoursOut),
    followUpStatus: status,
    status,
    createdAt: log.createdAt || log.fecha_registro || nowIso()
  };
}

export function vehicleTechnicalLogRowForServer(log) {
  const n = normalizeVehicleTechnicalLogPortalRow(log);
  return {
    id: n.id,
    date: n.date || nowIso().slice(0, 10),
    vehicleId: n.vehicleId,
    plate: n.plate || n.vehiclePlate,
    interventionType: n.interventionType || n.type || "preventivo",
    description: n.description || "",
    cost: parseNum(n.cost),
    downtimeHours: parseNum(n.downtimeHours),
    followUpStatus: n.followUpStatus || n.status || "Pendiente",
    createdAt: n.createdAt
  };
}

export function normalizeVehicleTechnicalLogsList(list) {
  return (Array.isArray(list) ? list : []).map(normalizeVehicleTechnicalLogPortalRow);
}

export function readFuelLogs() {
  return normalizeFuelLogsList(read(KEYS.fuelLogs, []));
}

export function readVehicleTechnicalLogs() {
  return normalizeVehicleTechnicalLogsList(read(KEYS.vehicleTechnicalLogs, []));
}

export async function writeFuelLogsAwait(list) {
  const normalized = normalizeFuelLogsList(list);
  write(KEYS.fuelLogs, normalized);
  const sync = window.AntaresPortalSync;
  const api = window.AntaresApi;
  if (sync?.flushEntityNow && api?.isConfigured?.()) {
    await sync.flushEntityNow("fuelLogs", normalized.map(fuelLogRowForServer));
    return;
  }
  await writeAwaitServer(KEYS.fuelLogs, normalized.map(fuelLogRowForServer));
}

export async function writeVehicleTechnicalLogsAwait(list) {
  const normalized = normalizeVehicleTechnicalLogsList(list);
  write(KEYS.vehicleTechnicalLogs, normalized);
  const sync = window.AntaresPortalSync;
  const api = window.AntaresApi;
  if (sync?.flushEntityNow && api?.isConfigured?.()) {
    await sync.flushEntityNow("vehicleTechnicalLogs", normalized.map(vehicleTechnicalLogRowForServer));
    return;
  }
  await writeAwaitServer(KEYS.vehicleTechnicalLogs, normalized.map(vehicleTechnicalLogRowForServer));
}

/** Alta de combustible: INSERT en registros_combustible y actualiza caché del portal. */
export async function appendFuelLogAwait(row) {
  const draft = normalizeFuelLogPortalRow(row);
  const api = window.AntaresApi;
  if (api?.isConfigured?.() && typeof api.postJson === "function") {
    const saved = await api.postJson("/portal/fleet/fuel-logs", fuelLogRowForServer(draft));
    const merged = normalizeFuelLogPortalRow(saved);
    const list = readFuelLogs().filter((l) => String(l.id) !== String(merged.id));
    list.unshift(merged);
    write(KEYS.fuelLogs, list);
    return merged;
  }
  const list = readFuelLogs();
  list.unshift(draft);
  await writeFuelLogsAwait(list);
  return draft;
}

/** Alta de taller: INSERT en registros_mantenimiento_vehiculo y actualiza caché del portal. */
export async function appendVehicleTechnicalLogAwait(row) {
  const draft = normalizeVehicleTechnicalLogPortalRow(row);
  const api = window.AntaresApi;
  if (api?.isConfigured?.() && typeof api.postJson === "function") {
    const saved = await api.postJson("/portal/fleet/maintenance-logs", vehicleTechnicalLogRowForServer(draft));
    const merged = normalizeVehicleTechnicalLogPortalRow(saved);
    const list = readVehicleTechnicalLogs().filter((l) => String(l.id) !== String(merged.id));
    list.unshift(merged);
    write(KEYS.vehicleTechnicalLogs, list);
    return merged;
  }
  const list = readVehicleTechnicalLogs();
  list.unshift(draft);
  await writeVehicleTechnicalLogsAwait(list);
  return draft;
}

export function diffMinutes(fromIso) {
  return (Date.now() - new Date(fromIso).getTime()) / 60000;
}

export function isManuallyUnavailable(resource) {
  return Boolean(resource && resource.available === false && resource.autoBusy !== true);
}

export function openTripInvoicePdf(requestId) {
  const formatRoute =
    typeof globalThis.formatRoute === "function" ? globalThis.formatRoute : () => String(requestId || "");
  const request = reqRead().find((r) => r.id === requestId);
  if (!request?.trip) {
    notify(userMessage("invoiceNoTrip"), "error");
    return;
  }
  const invoice = request.trip.invoice || buildTripInvoice(request);
  const requests = reqRead();
  void (async () => {
    try {
      await reqWriteAwait(
        requests.map((r) =>
          r.id === requestId ? { ...r, trip: { ...r.trip, invoice, updatedAt: nowIso() }, updatedAt: nowIso() } : r
        )
      );
    } catch (_e) {
      /* noop */
    }
  })();

  const html = `<!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Factura ${invoice.number}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#0f172a;margin:0;padding:24px;background:#f8fafc}
      .sheet{max-width:900px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:26px}
      .head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:18px}
      h1{font-size:24px;margin:0;color:#0b3f8a}
      .muted{color:#64748b;font-size:12px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}
      .box{border:1px solid #e2e8f0;border-radius:10px;padding:12px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:13px}
      th{background:#eff6ff;color:#1e3a8a}
      .totals{margin-top:16px;max-width:320px;margin-left:auto}
      .totals div{display:flex;justify-content:space-between;padding:6px 0}
      .grand{font-size:18px;font-weight:700;color:#0b3f8a;border-top:1px solid #cbd5e1;margin-top:6px;padding-top:10px}
      @media print{body{background:#fff;padding:0}.sheet{border:none;border-radius:0;max-width:none;padding:0}}
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="head">
        <div>
          <h1>Factura de viaje ${invoice.number}</h1>
          <div class="muted">Generada: ${fmtDate(invoice.generatedAt)}</div>
        </div>
        <div>
          <strong>${invoice.issuer}</strong><br />
          <span class="muted">NIT 900.000.000-0</span>
        </div>
      </div>
      <div class="grid">
        <div class="box">
          <strong>Cliente</strong><br />
          ${request.clientName || "-"}<br />
          <span class="muted">Solicitud: ${request.requestNumber || request.id}</span>
        </div>
        <div class="box">
          <strong>Viaje</strong><br />
          ${request.trip.tripNumber || "-"}<br />
          <span class="muted">${request.trip.vehiclePlate || "-"} · ${request.trip.driverName || "-"}</span>
        </div>
      </div>
      <table>
        <thead><tr><th>Concepto</th><th>Detalle</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Servicio de transporte</td><td>${formatRoute(request)}</td><td>$${invoice.baseValue.toLocaleString("es-CO")}</td></tr>
          <tr><td>Standby</td><td>Cargos por espera</td><td>$${invoice.standbyValue.toLocaleString("es-CO")}</td></tr>
        </tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><strong>$${invoice.subtotal.toLocaleString("es-CO")}</strong></div>
        <div><span>IVA (${Math.round(invoice.ivaRate * 100)}%)</span><strong>$${invoice.ivaValue.toLocaleString("es-CO")}</strong></div>
        <div class="grand"><span>Total</span><span>$${invoice.total.toLocaleString("es-CO")}</span></div>
      </div>
      <p class="muted" style="margin-top:18px">Documento generado automaticamente por Antares. Esta factura refleja el cierre operacional del viaje.</p>
    </div>
    <script>window.print()</script>
  </body>
  </html>`;
  const win = window.open("", "_blank");
  if (!win) {
    notify(userMessage("invoicePopupBlocked"), "error");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/**
 * Hidrata `noveltiesDetail` / `settlementDetail` desde el API si el bootstrap solo trajo la fila resumida.
 * @returns {object|null} fila fusionada o null si no hay sesión API
 */
export async function ensurePayrollRunHeavyJsonLoaded(runId) {
  const id = String(runId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return null;
  const runs = read(KEYS.payrollRuns, []);
  const idx = runs.findIndex((r) => String(r.id) === id);
  if (idx < 0) return null;
  const cur = runs[idx];
  if (cur.payrollRunHeavyOmitted !== true) return cur;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return cur;
  try {
    const detail = await api.getJson(`/portal/payroll-runs/${encodeURIComponent(id)}`);
    if (!detail || typeof detail !== "object") return cur;
    const merged = {
      ...cur,
      settlementDetail: detail.settlementDetail ?? cur.settlementDetail ?? null,
      noveltiesDetail: detail.noveltiesDetail ?? cur.noveltiesDetail ?? null,
      workedDays: detail.workedDays != null ? detail.workedDays : cur.workedDays,
      workedDaysPaymentCop:
        detail.workedDaysPaymentCop != null ? detail.workedDaysPaymentCop : cur.workedDaysPaymentCop,
      payrollRunHeavyOmitted: false
    };
    const next = [...runs];
    next[idx] = merged;
    write(KEYS.payrollRuns, next);
    return merged;
  } catch (err) {
    globalThis.devWarn?.("Portal: detalle de liquidación no disponible.", err?.message || err);
    notify(String(err?.message || "No fue posible cargar el detalle de la liquidación."), "warn");
    return cur;
  }
}

export function historyHaystack(request) {
  const formatRouteFn =
    typeof globalThis.formatRoute === "function" ? globalThis.formatRoute : () => "";
  return `${request.requestNumber || request.id || ""} ${request.clientName || ""} ${formatRouteFn(request)} ${historyVehicleColumn(request)} ${historyDriverLabel(request)} ${historyPlateLabel(request)} ${request.trip?.tripNumber || ""} ${request.serviceType || ""}`
    .toLowerCase();
}

export function historyDriverLabel(request) {
  const direct = String(request?.trip?.driverName || "").trim();
  if (direct) return direct;
  const id = String(request?.trip?.driverId || "").trim();
  if (!id) return "";
  const driver = read(KEYS.drivers, []).find((d) => String(d.id) === id);
  return String(driver?.name || "").trim();
}

export function historyPlateLabel(request) {
  return String(request?.trip?.vehiclePlate || "").trim();
}

export function renderHistoryCard(request) {
  const slugStatusFn = globalThis.slugStatus;
  const statusSlug =
    typeof slugStatusFn === "function" ? slugStatusFn(request.status) : String(request.status || "").toLowerCase();
  const number = String(request.requestNumber || request.id || "").trim();
  const client = String(request.clientName || "").trim() || "—";
  const origin = String(request.originCity || "").trim() || "—";
  const dest = String(request.destinationCity || "").trim() || "—";
  const driver = historyDriverLabel(request);
  const plate = historyPlateLabel(request);
  const fleet = historyVehicleColumn(request);
  const trip = String(request.trip?.tripNumber || "").trim();
  const tripValue = parseNum(request.trip?.tripValue ?? request.tripValue ?? 0);
  const valueLabel = tripValue > 0 ? `$${tripValue.toLocaleString("es-CO")}` : "—";
  const created = fmtDate(request.createdAt);
  const pickup = fmtDate(request.pickupAt);
  const formatRouteFn =
    typeof globalThis.formatRoute === "function" ? globalThis.formatRoute : () => "";
  const prettyStatusFn = globalThis.prettyStatus;
  const statusHtml =
    typeof prettyStatusFn === "function" ? prettyStatusFn(request.status) : escapeHtml(String(request.status || ""));
  return `<article class="history-card history-card--${escapeAttr(statusSlug)}" data-history-row data-id="${escapeAttr(String(request.id || ""))}" data-haystack="${escapeAttr(historyHaystack(request))}">
    <header class="history-card-head">
      <div class="history-card-head-main">
        <p class="history-card-kicker"><time datetime="${escapeAttr(String(request.createdAt || ""))}">${escapeHtml(created)}</time> · Recogida ${escapeHtml(pickup)}</p>
        <h3 class="history-card-title">${escapeHtml(number)}</h3>
        <p class="history-card-client">${escapeHtml(client)}</p>
      </div>
      <div class="history-card-status">${statusHtml}</div>
    </header>
    <div class="history-card-route" title="${escapeAttr(formatRouteFn(request))}">
      <span class="history-card-route-node"><span class="history-card-route-label">Origen</span><strong>${escapeHtml(origin)}</strong></span>
      <span class="history-card-route-arrow" aria-hidden="true">→</span>
      <span class="history-card-route-node"><span class="history-card-route-label">Destino</span><strong>${escapeHtml(dest)}</strong></span>
    </div>
    <dl class="history-card-meta">
      <div><dt>${ic().user}<span>Conductor</span></dt><dd>${driver ? escapeHtml(driver) : '<span class="muted">Sin asignar</span>'}</dd></div>
      <div><dt>${ic().truck}<span>Placa</span></dt><dd>${plate ? `<span class="history-plate">${escapeHtml(plate)}</span>` : '<span class="muted">—</span>'}</dd></div>
      <div><dt>${ic().compass}<span>Viaje</span></dt><dd>${trip ? escapeHtml(trip) : '<span class="muted">—</span>'}</dd></div>
      <div class="history-card-meta--value"><dt>${ic().dollar}<span>Tarifa</span></dt><dd>${escapeHtml(valueLabel)}</dd></div>
      <div class="history-card-meta--full"><dt>${ic().truck}<span>Flota / Termoking</span></dt><dd>${escapeHtml(fleet)}</dd></div>
    </dl>
    <footer class="history-card-actions">
      <button type="button" class="btn btn-sm btn-action" data-action="detail" data-id="${escapeAttr(String(request.id || ""))}">${ic().eye} Ver ficha</button>
      ${request.trip ? `<button type="button" class="btn btn-sm btn-outline" data-action="trip-detail" data-id="${escapeAttr(String(request.id || ""))}">${ic().truck} Viaje</button>` : ""}
    </footer>
  </article>`;
}

export function renderHistoryResultsList(items) {
  if (!items.length) {
    return `<div class="history-empty-state"><p class="muted">No hay registros con los filtros actuales. Prueba otro periodo, cliente o quita el filtro rápido.</p></div>`;
  }
  return `<div class="history-cards-grid" id="history-results-grid">${items.map(renderHistoryCard).join("")}</div>`;
}

export function sortFleetLogsByDate(logs) {
  return [...logs].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
}

export function historyFleetFuelHaystack(log) {
  return `${log.vehiclePlate || ""} ${log.driverName || ""} ${log.tripNumber || ""} ${log.station || ""} ${log.paidBy || ""} ${log.date || ""}`
    .toLowerCase();
}

export function historyFleetTechnicalHaystack(log) {
  return `${log.vehiclePlate || ""} ${log.description || ""} ${log.type || ""} ${log.status || ""} ${log.date || ""}`
    .toLowerCase();
}

export function applyHistoryFleetFuelFilters(logs, formData = {}) {
  let out = sortFleetLogsByDate(logs);
  if (formData.vehicleId) out = out.filter((l) => String(l.vehicleId) === String(formData.vehicleId));
  if (formData.driverId) out = out.filter((l) => String(l.driverId) === String(formData.driverId));
  if (formData.paidBy) out = out.filter((l) => String(l.paidBy) === String(formData.paidBy));
  if (formData.from) out = out.filter((l) => String(l.date || "") >= String(formData.from));
  if (formData.to) out = out.filter((l) => String(l.date || "") <= String(formData.to));
  const q = String(formData.q || "").trim().toLowerCase();
  if (q) out = out.filter((l) => historyFleetFuelHaystack(l).includes(q));
  return out;
}

export function applyHistoryFleetTechnicalFilters(logs, formData = {}) {
  let out = sortFleetLogsByDate(logs);
  if (formData.vehicleId) out = out.filter((l) => String(l.vehicleId) === String(formData.vehicleId));
  if (formData.type) out = out.filter((l) => String(l.type) === String(formData.type));
  if (formData.status) out = out.filter((l) => String(l.status) === String(formData.status));
  if (formData.from) out = out.filter((l) => String(l.date || "") >= String(formData.from));
  if (formData.to) out = out.filter((l) => String(l.date || "") <= String(formData.to));
  const q = String(formData.q || "").trim().toLowerCase();
  if (q) out = out.filter((l) => historyFleetTechnicalHaystack(l).includes(q));
  return out;
}

export function historyFleetFuelKpis(logs) {
  const liters = logs.reduce((acc, log) => acc + parseNum(log.liters), 0);
  const cost = logs.reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  const reimburse = logs
    .filter((l) => String(l.paidBy) === "conductor")
    .reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  return {
    count: logs.length,
    liters,
    cost,
    avgPerLiter: liters > 0 ? Math.round(cost / liters) : 0,
    reimburse
  };
}

export function historyFleetTechnicalKpis(logs) {
  const cost = logs.reduce((acc, log) => acc + parseNum(log.cost), 0);
  const downtime = logs.reduce((acc, log) => acc + parseNum(log.downtimeHours), 0);
  const open = logs.filter((l) => !["Resuelto"].includes(String(l.status || ""))).length;
  return { count: logs.length, cost, downtime, open };
}

export function historyFleetMoneyField(name, label, opts = {}) {
  const req = opts.required ? { required: true } : {};
  return `<label class="history-fleet-money-field">${fieldLabel(ic().dollar, label, req)}
    <span class="history-fleet-money-wrap">
      <span class="history-fleet-money-prefix" aria-hidden="true">$</span>
      <input type="text" name="${escapeAttr(name)}" inputmode="numeric" autocomplete="off" data-money-input="1" placeholder="0" ${opts.required ? "required" : ""} />
    </span>
  </label>`;
}

function slugStatusForFleetCard(status) {
  const fn = globalThis.slugStatus;
  return typeof fn === "function" ? fn(status) : String(status || "").toLowerCase().replace(/\s+/g, "_");
}

export function renderHistoryFuelLogCard(log) {
  const liters = parseNum(log.liters);
  const total = parseNum(log.totalCost);
  const perLiter = parseNum(log.costPerLiter) || (liters > 0 ? Math.round(total / liters) : 0);
  const paid = String(log.paidBy || "empresa") === "conductor" ? "conductor" : "empresa";
  const paidLabel = paid === "conductor" ? "Reembolso nómina" : "Empresa";
  const trip = String(log.tripNumber || "").trim();
  return `<article class="history-fleet-log-card history-fleet-log-card--fuel" data-fleet-fuel-row data-haystack="${escapeAttr(historyFleetFuelHaystack(log))}">
    <header class="history-fleet-log-head">
      <div>
        <time class="history-fleet-log-date" datetime="${escapeAttr(String(log.date || ""))}">${escapeHtml(fmtFleetLogDate(log.date))}</time>
        <h3 class="history-fleet-log-plate">${escapeHtml(String(log.vehiclePlate || "—"))}</h3>
        <p class="history-fleet-log-sub">${escapeHtml(String(log.driverName || "—"))}${trip ? ` · ${escapeHtml(trip)}` : ""}</p>
      </div>
      <span class="history-fleet-badge history-fleet-badge--${paid === "conductor" ? "warn" : "ok"}">${escapeHtml(paidLabel)}</span>
    </header>
    <dl class="history-fleet-log-meta">
      <div><dt>${ic().activity} Litros</dt><dd>${liters.toLocaleString("es-CO", { maximumFractionDigits: 2 })} L</dd></div>
      <div><dt>${ic().dollar} Total</dt><dd class="history-fleet-log-money">$${total.toLocaleString("es-CO")}</dd></div>
      <div><dt>${ic().dollar} $/L</dt><dd>$${perLiter.toLocaleString("es-CO")}</dd></div>
      <div><dt>${ic().mapPin} Estación</dt><dd>${log.station ? escapeHtml(log.station) : '<span class="muted">—</span>'}</dd></div>
      ${parseNum(log.odometerKm) > 0 ? `<div><dt>${ic().clock} Odómetro</dt><dd>${parseNum(log.odometerKm).toLocaleString("es-CO")} km</dd></div>` : ""}
    </dl>
  </article>`;
}

export function renderHistoryTechnicalLogCard(log) {
  const typeKey = String(log.type || "preventivo");
  const typeLabel = HISTORY_FLEET_TECH_LABELS[typeKey] || typeKey;
  const status = String(log.status || "Pendiente");
  const statusSlug = slugStatusForFleetCard(status);
  const cost = parseNum(log.cost);
  const hours = parseNum(log.downtimeHours);
  return `<article class="history-fleet-log-card history-fleet-log-card--technical history-fleet-log-card--${escapeAttr(statusSlug)}" data-fleet-technical-row data-haystack="${escapeAttr(historyFleetTechnicalHaystack(log))}">
    <header class="history-fleet-log-head">
      <div>
        <time class="history-fleet-log-date" datetime="${escapeAttr(String(log.date || ""))}">${escapeHtml(fmtFleetLogDate(log.date))}</time>
        <h3 class="history-fleet-log-plate">${escapeHtml(String(log.vehiclePlate || "—"))}</h3>
        <p class="history-fleet-log-desc">${escapeHtml(String(log.description || "—"))}</p>
      </div>
      <div class="history-fleet-log-badges">
        <span class="history-fleet-badge history-fleet-badge--type">${escapeHtml(typeLabel)}</span>
        <span class="history-fleet-badge history-fleet-badge--status">${escapeHtml(status)}</span>
      </div>
    </header>
    <dl class="history-fleet-log-meta">
      <div><dt>${ic().dollar} Costo</dt><dd class="history-fleet-log-money">$${cost.toLocaleString("es-CO")}</dd></div>
      <div><dt>${ic().clock} Fuera de servicio</dt><dd>${hours > 0 ? `${hours.toLocaleString("es-CO")} h` : '<span class="muted">0 h</span>'}</dd></div>
    </dl>
  </article>`;
}

export function renderHistoryFuelLogsList(logs) {
  if (!logs.length) {
    return `<div class="history-empty-state history-fleet-empty"><p class="muted">Aún no hay cargas de combustible registradas. Registre la primera desde el módulo <strong>Camiones</strong>.</p></div>`;
  }
  return `<div class="history-fleet-log-grid" id="history-fuel-results-grid">${logs.map(renderHistoryFuelLogCard).join("")}</div>`;
}

export function renderHistoryTechnicalLogsList(logs) {
  if (!logs.length) {
    return `<div class="history-empty-state history-fleet-empty"><p class="muted">No hay novedades de taller en este periodo. Registre preventivos, correctivos o fallas desde el módulo <strong>Camiones</strong>.</p></div>`;
  }
  return `<div class="history-fleet-log-grid" id="history-technical-results-grid">${logs.map(renderHistoryTechnicalLogCard).join("")}</div>`;
}

export function historyFleetKpiStrip(metrics) {
  return `<div class="hist-kpi-strip" role="group" aria-label="Resumen del periodo">${metrics
    .map(
      ({ label, value, tone }) =>
        `<div class="hist-kpi${tone ? ` hist-kpi--${tone}` : ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`
    )
    .join("")}</div>`;
}

export function refreshHistoryFleetKpiStrip(selector, metrics) {
  const root = document.querySelector(selector);
  if (root) root.outerHTML = historyFleetKpiStrip(metrics);
}

export function historyFleetFilterToolbar(formId, fieldsHtml) {
  return `<form id="${escapeAttr(formId)}" class="history-fleet-filter-form" novalidate>
    <div class="history-toolbar history-fleet-toolbar">
      <label class="history-toolbar-search">
        <span class="visually-hidden">Buscar</span>
        ${ic().search || ic().filter}
        <input type="search" name="q" placeholder="Placa, conductor, estación, viaje…" autocomplete="off" />
      </label>
      <details class="history-advanced-filters history-fleet-advanced">
        <summary class="btn btn-sm btn-action">${ic().filter} Filtros</summary>
        <div class="history-advanced-filters-body history-fleet-filters-body">${fieldsHtml}
          <button class="btn btn-sm btn-action" type="reset">${ic().x} Limpiar</button>
        </div>
      </details>
    </div>
  </form>`;
}

export function historyFleetFuelFormHtml(todayIsoDate, vehicleOptions, driverOptions) {
  return `<form id="form-fuel-log" class="p-form p-form-colored history-fleet-create-form">
    <fieldset class="form-section form-section-blue full">
      <legend>${ic().calendar} Carga de combustible</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(ic().calendar, "Fecha", { required: true })}<input type="date" name="date" value="${escapeAttr(todayIsoDate)}" required /></label>
        <label>${fieldLabel(ic().truck, "Camión", { required: true })}<select name="vehicleId" required><option value="">Seleccione…</option>${vehicleOptions}</select></label>
        <label>${fieldLabel(ic().user, "Conductor", { required: true })}<select name="driverId" required><option value="">Seleccione…</option>${driverOptions}</select></label>
        <label>${fieldLabel(ic().file, "Viaje (opcional)")}<input name="tripNumber" placeholder="VIA-000123" autocomplete="off" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${ic().dollar} Montos y trazabilidad</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(ic().activity, "Litros", { required: true })}<input type="number" step="0.01" min="0.01" name="liters" required data-fuel-liters-input="1" /></label>
        ${historyFleetMoneyField("totalCost", "Valor total (COP)", { required: true })}
        <label>${fieldLabel(ic().clock, "Odómetro (km)")}<input type="number" min="0" name="odometerKm" inputmode="numeric" /></label>
        <label>${fieldLabel(ic().mapPin, "Estación / EDS")}<input name="station" placeholder="EDS Roscombustible…" autocomplete="off" /></label>
        <label>${fieldLabel(ic().briefcase, "Pagado por")}
          <select name="paidBy">
            <option value="empresa">Empresa</option>
            <option value="conductor">Conductor (reembolso nómina)</option>
          </select>
        </label>
      </div>
      <p class="history-fleet-live-hint muted" id="fuel-price-per-liter-hint" hidden aria-live="polite"></p>
      <p class="history-fleet-sync-hint muted">Se guarda en <strong>registros_combustible</strong> (PostgreSQL) al enviar.</p>
    </fieldset>
    ${renderManagedCreateFormActions("create-fuel-log", `<button class="btn btn-primary" type="submit">${ic().plus} Registrar combustible</button>`)}
  </form>`;
}

export function historyFleetTechnicalFormHtml(todayIsoDate, vehicleOptions) {
  return `<form id="form-technical-log" class="p-form p-form-colored history-fleet-create-form">
    <fieldset class="form-section form-section-amber full">
      <legend>${ic().truck} Novedad de taller</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(ic().calendar, "Fecha", { required: true })}<input type="date" name="date" value="${escapeAttr(todayIsoDate)}" required /></label>
        <label>${fieldLabel(ic().truck, "Camión", { required: true })}<select name="vehicleId" required><option value="">Seleccione…</option>${vehicleOptions}</select></label>
        <label>${fieldLabel(ic().activity, "Tipo")}
          <select name="type">
            <option value="preventivo">Mantenimiento preventivo</option>
            <option value="correctivo">Mantenimiento correctivo</option>
            <option value="falla">Falla técnica</option>
          </select>
        </label>
        <label class="full">${fieldLabel(ic().file, "Descripción", { required: true })}<input name="description" required placeholder="Ej. cambio de aceite, frenos, refrigeración…" /></label>
        ${historyFleetMoneyField("cost", "Costo (COP)", { required: true })}
        <label>${fieldLabel(ic().clock, "Horas fuera de servicio")}<input type="number" min="0" step="0.5" name="downtimeHours" value="0" /></label>
        <label>${fieldLabel(ic().check, "Estado")}
          <select name="status">
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Resuelto</option>
          </select>
        </label>
      </div>
      <p class="history-fleet-sync-hint muted">Se guarda en <strong>registros_mantenimiento_vehiculo</strong> (PostgreSQL) al enviar.</p>
    </fieldset>
    ${renderManagedCreateFormActions("create-technical-log", `<button class="btn btn-primary" type="submit">${ic().plus} Registrar novedad de taller</button>`)}
  </form>`;
}
