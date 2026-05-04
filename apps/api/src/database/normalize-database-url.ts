/**
 * Limpia DATABASE_URL desde Render/Supabase (espacios, comillas, BOM, saltos de línea).
 * Detecta contraseñas con @ sin codificar (varios @ en la URI).
 */
export function normalizeDatabaseUrl(raw: string): string {
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  if (s.charCodeAt(0) === 0xfeff) {
    s = s.slice(1).trim();
  }
  s = s.replace(/\r\n/g, "").replace(/\r/g, "").trim();
  return s;
}

/** Tras postgresql://, más de un @ suele indicar @ literal en la contraseña sin %40. */
export function databaseUrlLikelyHasUnencodedPasswordAt(url: string): boolean {
  const lower = url.trim().toLowerCase();
  if (!lower.startsWith("postgresql://") && !lower.startsWith("postgres://")) return false;
  const rest = url.slice(url.indexOf("://") + 3);
  const atCount = (rest.match(/@/g) || []).length;
  return atCount > 1;
}
