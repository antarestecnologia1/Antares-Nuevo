/**
 * Consulta del historial SIMIT-FCM (datos.gov.co) por placa.
 * Dataset: Historial de Multas reportados en el SIMIT - FCM (72nf-y4v3).
 * El conjunto no clasifica fotomultas vs. otras infracciones: se reportan comparendos.
 */
import { escapeHtml } from "../core/utils.js";

export const SIMIT_DATASET_ID = "72nf-y4v3";
export const SIMIT_RESOURCE_URL = `https://www.datos.gov.co/resource/${SIMIT_DATASET_ID}.json`;
export const SIMIT_PORTAL_URL =
  "https://www.datos.gov.co/Funci-n-P-blica/Historial-de-Multas-reportados-en-el-SIMIT-FCM/72nf-y4v3";
export const SIMIT_CACHE_TTL_MS = 15 * 60 * 1000;
export const SIMIT_PAGE_SIZE = 5000;
export const SIMIT_PLATE_BATCH = 40;
export const SIMIT_MAX_ROWS = 20000;

function sodaQuote(value) {
  return `'${String(value || "").replace(/'/g, "''")}'`;
}

export function normalizeSimitPlate(raw) {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function uniqueSimitPlates(plates) {
  const seen = new Set();
  const out = [];
  (Array.isArray(plates) ? plates : [plates]).forEach((item) => {
    const plate = normalizeSimitPlate(item);
    if (!plate || seen.has(plate)) return;
    seen.add(plate);
    out.push(plate);
  });
  return out;
}

export function simitPlatesCacheKey(plates, pendingOnly) {
  return `${pendingOnly === false ? "all" : "pending"}:${uniqueSimitPlates(plates).slice().sort().join("|")}`;
}

export function isSimitPending(raw) {
  return String(raw || "")
    .trim()
    .toUpperCase() === "NO";
}

export function parseSimitDateMs(raw) {
  const m = String(raw || "")
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return 0;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return 0;
  return Date.UTC(year, month - 1, day);
}

export function formatSimitMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}

export function parseSimitFineRow(row) {
  const plate = normalizeSimitPlate(row?.placa);
  const dateLabel = String(row?.fecha_multa || "").trim();
  const value = Number(row?.valor_multa);
  const pending = isSimitPending(row?.pagado_si_no);
  return {
    plate,
    dateLabel,
    dateMs: parseSimitDateMs(dateLabel),
    value: Number.isFinite(value) ? value : 0,
    department: String(row?.departamento || "").trim(),
    city: String(row?.ciudad || "").trim(),
    paidLabel: pending ? "Pendiente" : "Pagado",
    pending,
    year: String(row?.vigencia || "").trim()
  };
}

export function sortSimitFines(rows) {
  return (Array.isArray(rows) ? rows.slice() : []).sort((a, b) => {
    const byDate = (Number(b?.dateMs) || 0) - (Number(a?.dateMs) || 0);
    if (byDate) return byDate;
    return String(b?.year || "").localeCompare(String(a?.year || ""), "es");
  });
}

export function buildSimitProxyPath({ plates = [], pendingOnly = true } = {}) {
  const params = new URLSearchParams();
  params.set("plates", uniqueSimitPlates(plates).join(","));
  params.set("pendingOnly", pendingOnly === false ? "0" : "1");
  return `/proxy/simit-fines?${params.toString()}`;
}

export function buildSimitQueryUrl({ plates = [], pendingOnly = true, limit = SIMIT_PAGE_SIZE, offset = 0 } = {}) {
  const list = uniqueSimitPlates(plates);
  if (!list.length) return "";
  const inList = list.map(sodaQuote).join(",");
  const paidClause = pendingOnly ? " AND upper(pagado_si_no)='NO'" : "";
  const where = `placa in(${inList})${paidClause}`;
  const params = new URLSearchParams();
  params.set("$select", "placa,fecha_multa,valor_multa,departamento,ciudad,pagado_si_no,vigencia");
  params.set("$where", where);
  params.set("$limit", String(Math.max(1, Math.min(Number(limit) || SIMIT_PAGE_SIZE, SIMIT_PAGE_SIZE))));
  params.set("$offset", String(Math.max(0, Number(offset) || 0)));
  return `${SIMIT_RESOURCE_URL}?${params.toString()}`;
}

export function summarizeSimitByPlate(vehicles, rows) {
  const finesByPlate = new Map();
  sortSimitFines(rows).forEach((row) => {
    const plate = normalizeSimitPlate(row?.plate);
    if (!plate) return;
    if (!finesByPlate.has(plate)) finesByPlate.set(plate, []);
    finesByPlate.get(plate).push(row);
  });
  const list = (Array.isArray(vehicles) ? vehicles : []).map((vehicle) => {
    const plate = normalizeSimitPlate(vehicle?.plate);
    const fines = finesByPlate.get(plate) || [];
    const pending = fines.filter((item) => item.pending);
    const pendingValue = pending.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const last = pending[0] || fines[0] || null;
    return {
      vehicle,
      plate,
      fines,
      pending,
      pendingCount: pending.length,
      pendingValue,
      hasPending: pending.length > 0,
      lastDateLabel: last?.dateLabel || ""
    };
  });
  const withPending = list.filter((item) => item.hasPending);
  const pendingCount = withPending.reduce((sum, item) => sum + item.pendingCount, 0);
  const pendingValue = withPending.reduce((sum, item) => sum + item.pendingValue, 0);
  return {
    list,
    withPending,
    cleanCount: list.length - withPending.length,
    pendingVehicleCount: withPending.length,
    pendingCount,
    pendingValue
  };
}

export function normalizeSimitResultFilter(raw) {
  const value = String(raw || "all").trim().toLowerCase();
  return value === "pending" || value === "clean" ? value : "all";
}

export function simitSummarySearchBlob(item) {
  const vehicle = item?.vehicle || {};
  const fines = Array.isArray(item?.fines) ? item.fines : [];
  return [
    item?.plate,
    vehicle.brand,
    vehicle.model,
    vehicle.type,
    ...fines.flatMap((fine) => [fine?.city, fine?.department, fine?.paidLabel, fine?.dateLabel, fine?.year])
  ]
    .map((part) => String(part ?? "").toLowerCase())
    .join(" ");
}

/** Filtra el resumen por placa con el mismo vocabulario de la tabla: pendientes, al día, placa y lugar. */
export function simitItemPassesFilters(item, filters = {}) {
  const result = normalizeSimitResultFilter(filters.result);
  if (result === "pending" && !item?.hasPending) return false;
  if (result === "clean" && item?.hasPending) return false;
  const query = String(filters.search || "").trim().toLowerCase();
  if (query && !simitSummarySearchBlob(item).includes(query)) return false;
  return true;
}

function simitHttpError(status) {
  if (status === 429) return "Datos.gov.co limitó las consultas. Espere un momento y vuelva a intentar.";
  if (status >= 500) return "El servicio de datos abiertos SIMIT no respondió. Intente de nuevo más tarde.";
  return "No se pudo consultar el historial SIMIT en datos.gov.co.";
}

function normalizeFetchedSimitPayload(json, pendingOnly) {
  if (json && json.ok === true && Array.isArray(json.rows)) {
    const rows = json.rows.map((item) => (item && item.plate ? item : parseSimitFineRow(item))).filter((item) => item.plate);
    return { ok: true, rows: sortSimitFines(rows), truncated: Boolean(json.truncated), pendingOnly };
  }
  if (Array.isArray(json)) {
    return {
      ok: true,
      rows: sortSimitFines(json.map(parseSimitFineRow).filter((item) => item.plate)),
      truncated: false,
      pendingOnly
    };
  }
  return null;
}

async function fetchSimitFinesDirect(unique, opts) {
  const fetchImpl = opts.fetchImpl;
  const pendingOnly = opts.pendingOnly;
  const rows = [];
  let truncated = false;
  const signal = opts.signal;
  for (let i = 0; i < unique.length; i += SIMIT_PLATE_BATCH) {
    const chunk = unique.slice(i, i + SIMIT_PLATE_BATCH);
    let offset = 0;
    for (;;) {
      const url = buildSimitQueryUrl({ plates: chunk, pendingOnly, limit: SIMIT_PAGE_SIZE, offset });
      let res;
      try {
        res = await fetchImpl(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          mode: "cors",
          credentials: "omit",
          signal
        });
      } catch (err) {
        const aborted = err?.name === "AbortError";
        return {
          ok: false,
          rows: [],
          truncated: false,
          pendingOnly,
          error: aborted
            ? "La consulta SIMIT se canceló."
            : "No hay conexión con datos.gov.co. Verifique la red o intente más tarde."
        };
      }
      if (!res.ok) {
        return { ok: false, rows: [], truncated: false, pendingOnly, error: simitHttpError(res.status) };
      }
      let json;
      try {
        json = await res.json();
      } catch (_parseErr) {
        return { ok: false, rows: [], truncated: false, pendingOnly, error: "La respuesta de SIMIT no es válida." };
      }
      if (!Array.isArray(json)) {
        return { ok: false, rows: [], truncated: false, pendingOnly, error: "La respuesta de SIMIT no es válida." };
      }
      json.forEach((item) => {
        const parsed = parseSimitFineRow(item);
        if (parsed.plate) rows.push(parsed);
      });
      if (json.length < SIMIT_PAGE_SIZE) break;
      offset += SIMIT_PAGE_SIZE;
      if (offset >= SIMIT_MAX_ROWS || rows.length >= SIMIT_MAX_ROWS) {
        truncated = true;
        break;
      }
    }
    if (truncated) break;
  }
  return { ok: true, rows: sortSimitFines(rows), truncated, pendingOnly };
}

export async function fetchSimitFinesByPlates(plates, opts = {}) {
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  const pendingOnly = opts.pendingOnly !== false;
  const unique = uniqueSimitPlates(plates);
  if (!unique.length) {
    return { ok: true, rows: [], truncated: false, pendingOnly };
  }
  if (typeof fetchImpl !== "function") {
    return { ok: false, rows: [], truncated: false, pendingOnly, error: "Consulta SIMIT no disponible en este entorno." };
  }
  const inBrowser = typeof window !== "undefined";
  if (opts.preferDirect !== true && inBrowser) {
    try {
      const proxyUrl = opts.proxyUrl || buildSimitProxyPath({ plates: unique, pendingOnly });
      const res = await fetchImpl(proxyUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        signal: opts.signal
      });
      if (res.ok) {
        const json = await res.json();
        const normalized = normalizeFetchedSimitPayload(json, pendingOnly);
        if (normalized) return normalized;
      }
    } catch (_proxyErr) {
      /* Datos.gov.co bloquea CORS en el navegador; el proxy same-origin es el canal preferido. */
    }
  }
  return fetchSimitFinesDirect(unique, { fetchImpl, pendingOnly, signal: opts.signal });
}

export function simitFineRowsTableHtml(fines) {
  const list = Array.isArray(fines) ? fines : [];
  if (!list.length) {
    return `<p class="muted vehicles-simit-empty">Sin comparendos en el historial consultado.</p>`;
  }
  const pendingList = list.filter((fine) => fine.pending);
  const pendingValue = pendingList.reduce((sum, fine) => sum + (Number(fine.value) || 0), 0);
  const ordered = [...list].sort((x, y) => Number(Boolean(y.pending)) - Number(Boolean(x.pending)));
  const items = ordered
    .map((fine) => {
      const place = [fine.city, fine.department].filter((x) => x && x !== "—").join(" · ") || "Ubicación no reportada";
      const chip = fine.pending
        ? `<span class="simit-chip simit-chip--bad"><i></i>Pendiente</span>`
        : `<span class="simit-chip simit-chip--ok"><i></i>${escapeHtml(fine.paidLabel || "Pagado")}</span>`;
      return `<li class="simit-fine${fine.pending ? " is-pending" : ""}">
        <div class="simit-fine__date"><span>Fecha</span><strong>${escapeHtml(fine.dateLabel || "—")}</strong></div>
        <div class="simit-fine__main"><strong>${escapeHtml(formatSimitMoney(fine.value))}</strong><span>${escapeHtml(place)}</span></div>
        <div class="simit-fine__meta">${chip}<span class="simit-fine__year">Vigencia ${escapeHtml(fine.year || "—")}</span></div>
      </li>`;
    })
    .join("");
  const summary = `<div class="simit-fines__sum">
      <span><b>${list.length}</b> comparendo${list.length === 1 ? "" : "s"}</span>
      <span class="${pendingList.length ? "is-due" : "is-ok"}"><b>${pendingList.length}</b> pendiente${pendingList.length === 1 ? "" : "s"}${pendingList.length ? ` · ${escapeHtml(formatSimitMoney(pendingValue))}` : ""}</span>
    </div>`;
  return `<div class="simit-fines">${summary}<ul class="simit-fines__list">${items}</ul></div>`;
}

