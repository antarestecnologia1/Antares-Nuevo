/**
 * Festivos nacionales de Colombia (Ley 51 de 1983 «Ley Emiliani» y Ley 35 de 1939).
 * Espejo de `modules/domain/colombia-holidays.domain.js`.
 */

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ymdFromUtc(dt: Date): string {
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

function easterSundayUtc(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function addDaysUtc(dt: Date, days: number): Date {
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() + days, 12));
}

/** Ley Emiliani: si el festivo no cae lunes, se traslada al lunes siguiente. */
function nextMondayUtc(dt: Date): Date {
  const wd = dt.getUTCDay();
  return wd === 1 ? dt : addDaysUtc(dt, (8 - wd) % 7);
}

const holidayCache = new Map<number, Set<string>>();

export function colombiaHolidaysForYear(year: number): Set<string> {
  if (!Number.isInteger(year) || year < 1984 || year > 2200) return new Set();
  const cached = holidayCache.get(year);
  if (cached) return cached;
  const fixed = (
    [
      [1, 1],
      [5, 1],
      [7, 20],
      [8, 7],
      [12, 8],
      [12, 25]
    ] as const
  ).map(([m, d]) => new Date(Date.UTC(year, m - 1, d, 12)));
  const movable = (
    [
      [1, 6],
      [3, 19],
      [6, 29],
      [8, 15],
      [10, 12],
      [11, 1],
      [11, 11]
    ] as const
  ).map(([m, d]) => nextMondayUtc(new Date(Date.UTC(year, m - 1, d, 12))));
  const easter = easterSundayUtc(year);
  const easterBased = [
    addDaysUtc(easter, -3),
    addDaysUtc(easter, -2),
    nextMondayUtc(addDaysUtc(easter, 39)),
    nextMondayUtc(addDaysUtc(easter, 60)),
    nextMondayUtc(addDaysUtc(easter, 68))
  ];
  const set = new Set([...fixed, ...movable, ...easterBased].map(ymdFromUtc));
  holidayCache.set(year, set);
  return set;
}

/** Usa la fecha civil UTC (las fechas de nómina del API se crean a mediodía UTC). */
export function isColombiaHolidayUtcDate(dt: Date): boolean {
  if (Number.isNaN(dt.getTime())) return false;
  return colombiaHolidaysForYear(dt.getUTCFullYear()).has(ymdFromUtc(dt));
}
