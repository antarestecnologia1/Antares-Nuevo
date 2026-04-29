/** Marca de tiempo en zona America/Bogota (UTC-5 fijo, sin horario de verano). */
const ZONA_COLOMBIA = "America/Bogota";

export function marcaTiempoColombiaIso(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_COLOMBIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(new Date());
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}:${pick("second")}-05:00`;
}
