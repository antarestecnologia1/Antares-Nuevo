/**
 * El cliente JS/admin de Supabase espera la URL base del proyecto
 * (ej. https://xxxx.supabase.co), no el endpoint REST (/rest/v1).
 */
export function normalizeSupabaseProjectUrl(raw: string | undefined | null): string {
  let u = String(raw ?? "").trim();
  if (!u) return "";
  u = u.replace(/\/rest\/v1\/?$/i, "");
  u = u.replace(/\/+$/, "");
  return u;
}
