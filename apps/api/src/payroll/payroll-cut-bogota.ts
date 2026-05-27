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

/** Liquidación masiva (RRHH): parcial hasta el día de referencia o cierre total 1–2 días antes del pago. */
export type BulkLiquidationMode = "parcial" | "cerrado";

export type BulkLiquidationCut = LiquidationCut & {
  mode: BulkLiquidationMode;
};

/** Días calendario de pago de nómina (programar liquidación 1–2 días antes). */
export const PAYROLL_PAY_DAY_FIRST = 15;
export const PAYROLL_PAY_DAY_SECOND = 30;

/** Segundo pago del mes: día 30 o último del mes si el mes es más corto (p. ej. febrero → 28). */
export function payrollBulkPaymentDaySecond(ld: number): number {
  return Math.min(PAYROLL_PAY_DAY_SECOND, ld);
}

/**
 * Días en que RRHH debe **cerrar** la liquidación masiva (1–2 días antes del pago 15 y 30).
 * Ej. mayo: 13–14 (pago 15) y 28–29 (pago 30).
 */
export function payrollBulkClosureDays(ld: number): { firstHalf: number[]; secondHalf: number[] } {
  const pay2 = payrollBulkPaymentDaySecond(ld);
  const secondHalf = [pay2 - 2, pay2 - 1].filter((d) => d > PAYROLL_PAY_DAY_FIRST && d <= ld);
  return { firstHalf: [PAYROLL_PAY_DAY_FIRST - 2, PAYROLL_PAY_DAY_FIRST - 1], secondHalf };
}

export function isPayrollBulkFirstHalfClosureDay(dom: number): boolean {
  return dom === PAYROLL_PAY_DAY_FIRST - 2 || dom === PAYROLL_PAY_DAY_FIRST - 1;
}

export function isPayrollBulkSecondHalfClosureDay(dom: number, ld: number): boolean {
  return payrollBulkClosureDays(ld).secondHalf.includes(dom);
}

export function isPayrollBulkFullClosureDay(dom: number, ld: number): boolean {
  return isPayrollBulkFirstHalfClosureDay(dom) || isPayrollBulkSecondHalfClosureDay(dom, ld);
}

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

function bulkPartialCut(
  periodKey: string,
  calendarMonthYm: string,
  periodStart: Date,
  y: number,
  m0: number,
  dom: number
): BulkLiquidationCut {
  return {
    periodKey,
    calendarMonthYm,
    periodStart,
    periodEnd: dateOnlyUtcNoon(y, m0, dom),
    mode: "parcial"
  };
}

function bulkClosedCut(cut: LiquidationCut): BulkLiquidationCut {
  return { ...cut, mode: "cerrado" };
}

function bulkQuincenalQ2ClosedCut(y: number, m0: number, ld: number): BulkLiquidationCut {
  const ym = `${y}-${pad2(m0 + 1)}`;
  const payEnd = payrollBulkPaymentDaySecond(ld);
  return {
    periodKey: `${ym}-Q2`,
    calendarMonthYm: ym,
    periodStart: dateOnlyUtcNoon(y, m0, 16),
    periodEnd: dateOnlyUtcNoon(y, m0, payEnd),
    mode: "cerrado"
  };
}

function bulkMensualClosedCut(y: number, m0: number, ld: number): BulkLiquidationCut {
  const ym = `${y}-${pad2(m0 + 1)}`;
  const payEnd = payrollBulkPaymentDaySecond(ld);
  return {
    periodKey: ym,
    calendarMonthYm: ym,
    periodStart: dateOnlyUtcNoon(y, m0, 1),
    periodEnd: dateOnlyUtcNoon(y, m0, payEnd),
    mode: "cerrado"
  };
}

function bulkCatorcenalC2ClosedCut(y: number, m0: number, ld: number): BulkLiquidationCut {
  const ym = `${y}-${pad2(m0 + 1)}`;
  const payEnd = payrollBulkPaymentDaySecond(ld);
  return {
    periodKey: `${ym}-C2`,
    calendarMonthYm: ym,
    periodStart: dateOnlyUtcNoon(y, m0, 15),
    periodEnd: dateOnlyUtcNoon(y, m0, payEnd),
    mode: "cerrado"
  };
}

/**
 * Corte para **liquidación masiva** según día civil Bogotá:
 * - **Parcial** (resto del mes): nómina acumulada hasta `dom` para seguimiento.
 * - **Cierre total** días **13–14** (pago programado **15**) y **28–29** o equivalente 1–2 días antes del **30** (o fin de mes corto).
 * La fecha de ingreso se aplica en el motor (`max(periodStart, hire)`).
 */
export function liquidationBulkCutAsOf(
  frequency: PayrollFrequencyNorm,
  y: number,
  m0: number,
  dom: number
): BulkLiquidationCut | null {
  const ym = `${y}-${pad2(m0 + 1)}`;
  const ld = lastDayOfMonth(y, m0);
  const closeFirst = isPayrollBulkFirstHalfClosureDay(dom);
  const closeSecond = isPayrollBulkSecondHalfClosureDay(dom, ld);
  const secondClosureStart = payrollBulkClosureDays(ld).secondHalf[0] ?? 28;

  if (frequency === "mensual") {
    if (closeSecond) return bulkMensualClosedCut(y, m0, ld);
    if (dom === PAYROLL_PAY_DAY_FIRST || dom === payrollBulkPaymentDaySecond(ld)) return null;
    return bulkPartialCut(ym, ym, dateOnlyUtcNoon(y, m0, 1), y, m0, dom);
  }

  if (frequency === "quincenal") {
    if (closeFirst) {
      const c = liquidationCutIfClosingToday("quincenal", y, m0, 15);
      return c ? bulkClosedCut(c) : null;
    }
    if (closeSecond) return bulkQuincenalQ2ClosedCut(y, m0, ld);
    if (dom <= 12) {
      return bulkPartialCut(`${ym}-Q1`, ym, dateOnlyUtcNoon(y, m0, 1), y, m0, dom);
    }
    if (dom >= 16 && dom < secondClosureStart) {
      return bulkPartialCut(`${ym}-Q2`, ym, dateOnlyUtcNoon(y, m0, 16), y, m0, dom);
    }
    return null;
  }

  if (frequency === "catorcenal") {
    if (closeFirst) {
      const c = liquidationCutIfClosingToday("catorcenal", y, m0, 14);
      return c ? bulkClosedCut(c) : null;
    }
    if (closeSecond) return bulkCatorcenalC2ClosedCut(y, m0, ld);
    if (dom <= 12) {
      return bulkPartialCut(`${ym}-C1`, ym, dateOnlyUtcNoon(y, m0, 1), y, m0, dom);
    }
    if (dom >= 15 && dom < secondClosureStart) {
      return bulkPartialCut(`${ym}-C2`, ym, dateOnlyUtcNoon(y, m0, 15), y, m0, dom);
    }
    return null;
  }

  /* semanal */
  let seg = 0;
  for (let start = 1; start <= ld; start += 7) {
    seg += 1;
    const end = Math.min(start + 6, ld);
    if (dom < start || dom > end) continue;

    const key = `${ym}-S${seg}`;
    const pStart = dateOnlyUtcNoon(y, m0, start);

    if (closeSecond && end >= 16) {
      return bulkClosedCut({
        periodKey: key,
        calendarMonthYm: ym,
        periodStart: pStart,
        periodEnd: dateOnlyUtcNoon(y, m0, Math.min(end, payrollBulkPaymentDaySecond(ld)))
      });
    }
    if (closeFirst && end <= 15) {
      const c = liquidationCutIfClosingToday("semanal", y, m0, end);
      return c ? bulkClosedCut(c) : null;
    }
    return bulkPartialCut(key, ym, pStart, y, m0, dom);
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
