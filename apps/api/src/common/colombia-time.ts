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
