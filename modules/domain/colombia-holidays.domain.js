/**
 * Festivos nacionales de Colombia (Ley 51 de 1983 «Ley Emiliani» y Ley 35 de 1939).
 * Espejo de `apps/api/src/payroll/colombia-holidays.ts`.
 */

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ymdFromUtc(dt) {
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

/** Domingo de Pascua (algoritmo anónimo gregoriano / Meeus). */
function easterSundayUtc(year) {
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

function addDaysUtc(dt, days) {
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() + days, 12));
}

/** Ley Emiliani: si el festivo no cae lunes, se traslada al lunes siguiente. */
function nextMondayUtc(dt) {
  const wd = dt.getUTCDay();
  return wd === 1 ? dt : addDaysUtc(dt, (8 - wd) % 7);
}

const holidayCache = new Map();

/** @returns {Set<string>} festivos del año en formato YYYY-MM-DD */
export function colombiaHolidaysForYear(year) {
  const y = Number(year);
  if (!Number.isInteger(y) || y < 1984 || y > 2200) return new Set();
  if (holidayCache.has(y)) return holidayCache.get(y);
  const fixed = [
    [1, 1],
    [5, 1],
    [7, 20],
    [8, 7],
    [12, 8],
    [12, 25]
  ].map(([m, d]) => new Date(Date.UTC(y, m - 1, d, 12)));
  const movable = [
    [1, 6],
    [3, 19],
    [6, 29],
    [8, 15],
    [10, 12],
    [11, 1],
    [11, 11]
  ].map(([m, d]) => nextMondayUtc(new Date(Date.UTC(y, m - 1, d, 12))));
  const easter = easterSundayUtc(y);
  const easterBased = [
    addDaysUtc(easter, -3),
    addDaysUtc(easter, -2),
    nextMondayUtc(addDaysUtc(easter, 39)),
    nextMondayUtc(addDaysUtc(easter, 60)),
    nextMondayUtc(addDaysUtc(easter, 68))
  ];
  const set = new Set([...fixed, ...movable, ...easterBased].map(ymdFromUtc));
  holidayCache.set(y, set);
  return set;
}

/** @param {string} ymd YYYY-MM-DD */
export function isColombiaHolidayYmd(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(ymd || ""));
  if (!m) return false;
  return colombiaHolidaysForYear(Number(m[1])).has(`${m[1]}-${m[2]}-${m[3]}`);
}

/** Usa la fecha civil local del objeto Date (las fechas del portal se crean a mediodía local). */
export function isColombiaHolidayLocalDate(dt) {
  if (!(dt instanceof Date) || Number.isNaN(dt.getTime())) return false;
  return colombiaHolidaysForYear(dt.getFullYear()).has(
    `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
  );
}
