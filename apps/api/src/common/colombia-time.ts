/** America/Bogota sin horario de verano (siempre -05:00 respecto a UTC). */
const CO_OFFSET = "-05:00";

/**
 * Marca de tiempo actual expresada en componentes locales de Colombia, serializada para `timestamptz` en Postgres.
 * Así la fila refleja el mismo instante que el reloj del negocio en CO al registrarse.
 */
export function timestamptzStringColombiaNow(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}:${g("second")}.${ms}${CO_OFFSET}`;
}

/** Alias en español usado por otros módulos (p. ej. nómina). */
export const marcaTiempoColombiaIso = timestamptzStringColombiaNow;

/** Serializa un instante (Postgres `timestamptz`, ISO UTC, etc.) en hora de negocio Colombia (-05:00). */
export function timestamptzToColombiaIso(raw: string | Date): string {
  const d = raw instanceof Date ? raw : new Date(String(raw).trim());
  if (Number.isNaN(d.getTime())) return timestamptzStringColombiaNow();
  return timestamptzStringColombiaNow(d);
}

/** Fecha civil YYYY-MM-DD en America/Bogota para el instante dado. */
export function bogotaCalendarYmdFromDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "01";
  return `${g("year")}-${g("month")}-${g("day")}`;
}

/** Fecha y hora legibles en español (America/Bogota) para correos y mensajes al usuario. */
export function formatColombiaDateTimeDisplay(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(date);
  return `${formatted} (hora Colombia)`;
}

/** Días enteros desde hoy (Bogotá) hasta targetYmd (positivo = futuro). */
export function bogotaDaysUntilYmd(targetYmd: string, reference: Date = new Date()): number {
  const n = String(targetYmd || "").trim().match(/^(\d{4}-\d{2}-\d{2})/);
  if (!n) return -9999;
  const today = bogotaCalendarYmdFromDate(reference);
  const t0 = new Date(`${today}T12:00:00${CO_OFFSET}`).getTime();
  const t1 = new Date(`${n[1]}T12:00:00${CO_OFFSET}`).getTime();
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) return -9999;
  return Math.floor((t1 - t0) / 86400000);
}
