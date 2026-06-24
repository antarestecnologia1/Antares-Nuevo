/**
 * Cortes de liquidación según periodicidad (calendario Colombia).
 * Espejo de `apps/api/src/payroll/payroll-cut-bogota.ts` para el portal.
 */
import { CO_TIMEZONE } from "../core/config.js";
import { payrollDisplayLabelUpper } from "../core/utils.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function lastDayOfMonth(y, m0) {
  return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
}

export function dateOnlyUtcNoon(y, m0, dom) {
  return new Date(Date.UTC(y, m0, dom, 12, 0, 0, 0));
}

export function parseIsoDateParts(isoYmd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoYmd || "").trim());
  if (!m) return null;
  const y = Number(m[1]);
  const m0 = Number(m[2]) - 1;
  const dom = Number(m[3]);
  if (!Number.isFinite(y) || m0 < 0 || m0 > 11 || dom < 1 || dom > 31) return null;
  return { y, m0, dom };
}

/**
 * @param {string} frequency - mensual | quincenal | catorcenal | semanal
 * @returns {{ periodKey: string, calendarMonthYm: string, periodStart: Date, periodEnd: Date } | null}
 */
export function liquidationCutIfClosingToday(frequency, y, m0, dom) {
  const freq = String(frequency || "mensual").toLowerCase();
  const ym = `${y}-${pad2(m0 + 1)}`;
  const ld = lastDayOfMonth(y, m0);

  if (freq === "mensual") {
    if (dom !== ld) return null;
    return {
      periodKey: ym,
      calendarMonthYm: ym,
      periodStart: dateOnlyUtcNoon(y, m0, 1),
      periodEnd: dateOnlyUtcNoon(y, m0, ld)
    };
  }

  if (freq === "quincenal") {
    if (dom === 15) {
      return {
        periodKey: `${ym}-Q1`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, 1),
        periodEnd: dateOnlyUtcNoon(y, m0, 15)
      };
    }
    if (dom === ld) {
      return {
        periodKey: `${ym}-Q2`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, 16),
        periodEnd: dateOnlyUtcNoon(y, m0, ld)
      };
    }
    return null;
  }

  if (freq === "catorcenal") {
    if (dom === 14) {
      return {
        periodKey: `${ym}-C1`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, 1),
        periodEnd: dateOnlyUtcNoon(y, m0, 14)
      };
    }
    if (dom === ld) {
      return {
        periodKey: `${ym}-C2`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, 15),
        periodEnd: dateOnlyUtcNoon(y, m0, ld)
      };
    }
    return null;
  }

  let seg = 0;
  for (let start = 1; start <= ld; start += 7) {
    seg += 1;
    const end = Math.min(start + 6, ld);
    if (dom === end) {
      return {
        periodKey: `${ym}-S${seg}`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, start),
        periodEnd: dateOnlyUtcNoon(y, m0, end)
      };
    }
  }
  return null;
}

/** Todos los cortes de un mes civil para la periodicidad dada. */
export function listLiquidationCutsForMonth(frequency, y, m0) {
  const freq = String(frequency || "mensual").toLowerCase();
  const ld = lastDayOfMonth(y, m0);
  const cuts = [];

  if (freq === "mensual") {
    const c = liquidationCutIfClosingToday("mensual", y, m0, ld);
    if (c) cuts.push(c);
    return cuts;
  }

  if (freq === "quincenal") {
    const c1 = liquidationCutIfClosingToday("quincenal", y, m0, 15);
    const c2 = liquidationCutIfClosingToday("quincenal", y, m0, ld);
    if (c1) cuts.push(c1);
    if (c2) cuts.push(c2);
    return cuts;
  }

  if (freq === "catorcenal") {
    const c1 = liquidationCutIfClosingToday("catorcenal", y, m0, 14);
    const c2 = liquidationCutIfClosingToday("catorcenal", y, m0, ld);
    if (c1) cuts.push(c1);
    if (c2) cuts.push(c2);
    return cuts;
  }

  for (let start = 1; start <= ld; start += 7) {
    const end = Math.min(start + 6, ld);
    const c = liquidationCutIfClosingToday("semanal", y, m0, end);
    if (c) cuts.push(c);
  }
  return cuts;
}

/**
 * Último corte ya cerrado en el mes según el día de referencia (modo legacy).
 */
export function liquidationLatestClosedCutAsOf(frequency, y, m0, dom) {
  const freq = String(frequency || "mensual").toLowerCase();
  const ld = lastDayOfMonth(y, m0);

  if (freq === "mensual") {
    if (dom < ld) return null;
    return liquidationCutIfClosingToday("mensual", y, m0, ld);
  }

  if (freq === "quincenal") {
    if (dom >= ld) return liquidationCutIfClosingToday("quincenal", y, m0, ld);
    if (dom >= 15) return liquidationCutIfClosingToday("quincenal", y, m0, 15);
    return null;
  }

  if (freq === "catorcenal") {
    if (dom >= ld) return liquidationCutIfClosingToday("catorcenal", y, m0, ld);
    if (dom >= 14) return liquidationCutIfClosingToday("catorcenal", y, m0, 14);
    return null;
  }

  let latest = null;
  for (let start = 1; start <= ld; start += 7) {
    const end = Math.min(start + 6, ld);
    if (dom >= end) {
      const c = liquidationCutIfClosingToday("semanal", y, m0, end);
      if (c) latest = c;
    }
  }
  return latest;
}

/**
 * Último corte cerrado en o antes de la fecha que aún no tiene liquidación.
 * @param {string[]} existingPeriodKeys
 */
export function liquidationLatestPendingCutAsOf(frequency, y, m0, dom, existingPeriodKeys = []) {
  const ref = dateOnlyUtcNoon(y, m0, dom);
  const existing = new Set((existingPeriodKeys || []).map((k) => String(k || "").trim()).filter(Boolean));
  const closed = listLiquidationCutsForMonth(frequency, y, m0).filter((c) => c.periodEnd.getTime() <= ref.getTime());
  for (let i = closed.length - 1; i >= 0; i -= 1) {
    if (!existing.has(closed[i].periodKey)) return closed[i];
  }
  return null;
}

/** Resuelve corte para fecha de cierre + periodicidad del empleado. */
export function resolvePayrollCutForClosingDate(fechaYmd, payFrequency, { force = false, existingPeriodKeys = [] } = {}) {
  const parts = parseIsoDateParts(fechaYmd);
  if (!parts) return null;
  const freq = String(payFrequency || "mensual").toLowerCase();
  if (force) {
    const exact = liquidationCutIfClosingToday(freq, parts.y, parts.m0, parts.dom);
    if (exact && !existingPeriodKeys.includes(exact.periodKey)) return exact;
    return liquidationLatestPendingCutAsOf(freq, parts.y, parts.m0, parts.dom, existingPeriodKeys);
  }
  return liquidationCutIfClosingToday(freq, parts.y, parts.m0, parts.dom);
}

export function formatPayrollCutRangeLabel(cut) {
  if (!cut) return "";
  const fmt = (d) =>
    d.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: CO_TIMEZONE
    });
  return payrollDisplayLabelUpper(`${fmt(cut.periodStart)} – ${fmt(cut.periodEnd)}`);
}

export function payrollClosingDatesHint(frequency) {
  const freq = String(frequency || "mensual").toLowerCase();
  if (freq === "quincenal") return "día 15 o último día del mes";
  if (freq === "catorcenal") return "día 14 o último día del mes";
  if (freq === "semanal") return "cada 7 días (fin de semana del mes)";
  return "último día del mes";
}
