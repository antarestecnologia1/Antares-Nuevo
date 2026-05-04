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

/** Ayuda cuando Supabase pooler responde «Tenant or user not found» (a menudo SQLSTATE XX000). No es un problema de scripts SQL. */
export const SUPABASE_POOLER_TENANT_ERROR_HELP =
  "Este error no se arregla ejecutando scripts SQL. En Supabase: Project Settings → Database → Connection string. Use «Session pooler» o «Transaction pooler» y copie la URI completa: el usuario debe ser postgres.SU_PROJECT_REF (no solo postgres). Opción recomendada: modo «URI» con host db.xxxxx.supabase.co, puerto 5432 y usuario postgres. Pegue la cadena en Render sin comillas ni espacios; codifique caracteres especiales en la contraseña (%40 para @).";

/**
 * Host pooler *.pooler.supabase.* exige usuario `postgres.<project_ref>`.
 * Con solo `postgres`, Supabase responde XX000 / Tenant or user not found.
 */
export function supabasePoolerUrlUsesBarePostgresUser(rawUrl: string): boolean {
  const url = rawUrl.trim();
  if (!/pooler\.supabase\.(com|co)/i.test(url)) return false;
  try {
    const u = new URL(url.replace(/^postgresql:/i, "http:"));
    const user = decodeURIComponent(u.username || "");
    return !/^postgres\..+/i.test(user);
  } catch {
    return false;
  }
}
