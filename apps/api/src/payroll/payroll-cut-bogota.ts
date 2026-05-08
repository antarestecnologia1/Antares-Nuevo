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
