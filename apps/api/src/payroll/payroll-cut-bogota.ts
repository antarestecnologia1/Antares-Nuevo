/**
 * Determina el corte de liquidación del **mes en curso** según periodicidad de pago y calendario **America/Bogota**.
 * La generación automática corre **cada día** 07:00 Bogotá; solo retorna corte si hoy es día de cierre de ese corte.
 */

import type { PayrollFrequencyNorm } from "./payroll-frequency";

export type LiquidationCut = {
  /** Clave única en DB `periodo_mes` */
  periodKey: string;
  /** YYYY-MM del mes calendario (prima / intereses) */
  calendarMonthYm: string;
  periodStart: Date;
  periodEnd: Date;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Mediodía en UTC anclado a una fecha civil (y, m0=0..11, dom) — mismo enfoque que `dateOnlyUtc` en motor nómina. */
export function dateOnlyUtcNoon(y: number, m0: number, dom: number): Date {
  return new Date(Date.UTC(y, m0, dom, 12, 0, 0, 0));
}

export function lastDayOfMonth(y: number, m0: number): number {
  return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
}

/** Partes del calendario colombiano para un instante. */
export function bogotaCalendarPartsFromInstant(d: Date): { y: number; m0: number; dom: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "01";
  const y = Number(g("year"));
  const m0 = Number(g("month")) - 1;
  const dom = Number(g("day"));
  return { y, m0, dom };
}

/**
 * Si el día Bogotá `dom` cierra algún período para la periodicidad dada, retorna el cut; si no hay cierre hoy, null.
 */
export function liquidationCutIfClosingToday(
  frequency: PayrollFrequencyNorm,
  y: number,
  m0: number,
  dom: number
): LiquidationCut | null {
  const ym = `${y}-${pad2(m0 + 1)}`;
  const ld = lastDayOfMonth(y, m0);

  if (frequency === "mensual") {
    if (dom !== ld) return null;
    return {
      periodKey: ym,
      calendarMonthYm: ym,
      periodStart: dateOnlyUtcNoon(y, m0, 1),
      periodEnd: dateOnlyUtcNoon(y, m0, ld)
    };
  }

  if (frequency === "quincenal") {
    if (dom === 15)
      return {
        periodKey: `${ym}-Q1`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, 1),
        periodEnd: dateOnlyUtcNoon(y, m0, 15)
      };
    if (dom === ld)
      return {
        periodKey: `${ym}-Q2`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, 16),
        periodEnd: dateOnlyUtcNoon(y, m0, ld)
      };
    return null;
  }

  if (frequency === "catorcenal") {
    if (dom === 14)
      return {
        periodKey: `${ym}-C1`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, 1),
        periodEnd: dateOnlyUtcNoon(y, m0, 14)
      };
    if (dom === ld)
      return {
        periodKey: `${ym}-C2`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, 15),
        periodEnd: dateOnlyUtcNoon(y, m0, ld)
      };
    return null;
  }

  /* semanal: segmentos [1..7], [8..14], … cierre en el último día de cada bloque o fin de mes */
  let seg = 0;
  for (let start = 1; start <= ld; start += 7) {
    seg += 1;
    const end = Math.min(start + 6, ld);
    if (dom === end)
      return {
        periodKey: `${ym}-S${seg}`,
        calendarMonthYm: ym,
        periodStart: dateOnlyUtcNoon(y, m0, start),
        periodEnd: dateOnlyUtcNoon(y, m0, end)
      };
  }
  return null;
}

/**
 * Último corte ya cerrado en el mes civil `y-m0` según el día `dom` (Bogotá).
 * Útil para liquidación masiva manual sin esperar al día exacto de cierre.
 */
export function liquidationLatestClosedCutAsOf(
  frequency: PayrollFrequencyNorm,
  y: number,
  m0: number,
  dom: number
): LiquidationCut | null {
  const ld = lastDayOfMonth(y, m0);

  if (frequency === "mensual") {
    if (dom < ld) return null;
    return liquidationCutIfClosingToday("mensual", y, m0, ld);
  }

  if (frequency === "quincenal") {
    if (dom >= ld) return liquidationCutIfClosingToday("quincenal", y, m0, ld);
    if (dom >= 15) return liquidationCutIfClosingToday("quincenal", y, m0, 15);
    return null;
  }

  if (frequency === "catorcenal") {
    if (dom >= ld) return liquidationCutIfClosingToday("catorcenal", y, m0, ld);
    if (dom >= 14) return liquidationCutIfClosingToday("catorcenal", y, m0, 14);
    return null;
  }

  let latest: LiquidationCut | null = null;
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
 * Último corte ya cerrado en o antes de la fecha que aún no tiene liquidación.
 * Evita saltar la 1ª quincena si la 2ª ya cerró pero la 1ª sigue pendiente.
 */
export function liquidationLatestPendingCutAsOf(
  frequency: PayrollFrequencyNorm,
  y: number,
  m0: number,
  dom: number,
  existingPeriodKeys: string[] = []
): LiquidationCut | null {
  const ref = dateOnlyUtcNoon(y, m0, dom);
  const existing = new Set(existingPeriodKeys.map((k) => String(k || "").trim()).filter(Boolean));
  const closed = listLiquidationCutsForMonth(frequency, y, m0).filter((c) => c.periodEnd.getTime() <= ref.getTime());
  for (let i = closed.length - 1; i >= 0; i -= 1) {
    if (!existing.has(closed[i].periodKey)) return closed[i];
  }
  return null;
}

/** Todos los cortes de liquidación de un mes civil para la periodicidad dada. */
export function listLiquidationCutsForMonth(
  frequency: PayrollFrequencyNorm,
  y: number,
  m0: number
): LiquidationCut[] {
  const ld = lastDayOfMonth(y, m0);
  const cuts: LiquidationCut[] = [];

  if (frequency === "mensual") {
    const c = liquidationCutIfClosingToday("mensual", y, m0, ld);
    if (c) cuts.push(c);
    return cuts;
  }

  if (frequency === "quincenal") {
    const c1 = liquidationCutIfClosingToday("quincenal", y, m0, 15);
    const c2 = liquidationCutIfClosingToday("quincenal", y, m0, ld);
    if (c1) cuts.push(c1);
    if (c2) cuts.push(c2);
    return cuts;
  }

  if (frequency === "catorcenal") {
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

function cutOverlapsRange(cut: LiquidationCut, rangeStart: Date, rangeEnd: Date): boolean {
  return cut.periodEnd.getTime() >= rangeStart.getTime() && cut.periodStart.getTime() <= rangeEnd.getTime();
}

/** Cortes cuya ventana [periodStart, periodEnd] intersecta el rango de fechas (inclusive, UTC noon). */
export function liquidationCutsOverlappingRange(
  frequency: PayrollFrequencyNorm,
  rangeStart: Date,
  rangeEnd: Date
): LiquidationCut[] {
  const lo = rangeStart.getTime() <= rangeEnd.getTime() ? rangeStart : rangeEnd;
  const hi = rangeStart.getTime() <= rangeEnd.getTime() ? rangeEnd : rangeStart;
  const out: LiquidationCut[] = [];
  const seen = new Set<string>();

  let y = lo.getUTCFullYear();
  let m0 = lo.getUTCMonth();
  const endY = hi.getUTCFullYear();
  const endM0 = hi.getUTCMonth();

  while (y < endY || (y === endY && m0 <= endM0)) {
    for (const cut of listLiquidationCutsForMonth(frequency, y, m0)) {
      if (!cutOverlapsRange(cut, lo, hi)) continue;
      if (seen.has(cut.periodKey)) continue;
      seen.add(cut.periodKey);
      out.push(cut);
    }
    m0 += 1;
    if (m0 > 11) {
      m0 = 0;
      y += 1;
    }
  }
  return out;
}

/** Resuelve un `periodo_mes` persistido al corte correspondiente. */
export function resolveLiquidationCutFromPeriodKey(
  frequency: PayrollFrequencyNorm,
  periodKey: string
): LiquidationCut | null {
  const key = String(periodKey || "").trim();
  const m = /^(\d{4})-(\d{2})/.exec(key);
  if (!m) return null;
  const y = Number(m[1]);
  const m0 = Number(m[2]) - 1;
  if (!Number.isFinite(y) || m0 < 0 || m0 > 11) return null;
  return listLiquidationCutsForMonth(frequency, y, m0).find((c) => c.periodKey === key) ?? null;
}
