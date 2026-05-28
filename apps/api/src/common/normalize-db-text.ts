/**
 * Normalización de texto persistido en BD (alineado con app.js).
 * — Datos maestros / nombres / direcciones: MAYÚSCULAS + sin tildes (ñ → n).
 * — Catálogo (departamento, ciudad): sin tildes, conservar mayúsculas del valor.
 * — Correo: minúsculas.
 * No usar en contraseñas ni hashes.
 */

/** Claves que nunca deben pasar por normalización de mayúsculas/tildes. */
export const PASSWORD_FIELD_KEYS = new Set([
  "password",
  "passwordHash",
  "hash_contrasena",
  "hashContrasena",
  "satelliteProviderPassword",
  "password_proveedor_satelite"
]);

export function isPasswordFieldKey(key: string): boolean {
  const k = String(key || "").trim();
  if (!k) return false;
  if (PASSWORD_FIELD_KEYS.has(k)) return true;
  const lower = k.toLowerCase();
  return lower.includes("password") || lower.includes("contrasena");
}

/** Texto persistido en BD sin tildes; ñ → n. */
export function normalizeDbText(value: string | undefined | null): string | null {
  if (value == null) return null;
  const t = String(value).trim();
  if (!t) return null;
  return t
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N");
}

/** Nombres, cargo, dirección, etc.: mayúsculas + sin tildes. */
export function normalizeDbTextUpper(value: string | undefined | null): string | null {
  const t = normalizeDbText(value);
  if (!t) return null;
  return t.toUpperCase();
}

/** Departamento / ciudad (catálogo): sin tildes; no forzar mayúsculas. */
export function normalizeCatalogText(value: string | undefined | null): string | null {
  return normalizeDbText(value);
}

export function normalizeEmail(value: string | undefined | null): string | null {
  if (value == null) return null;
  const t = String(value).replace(/\u0000/g, "").trim().toLowerCase();
  return t || null;
}

/** tipo_persona solo "Natural" | "Juridica". */
export function normalizePersonTypeForDb(value: string | undefined | null): string {
  const t = normalizeDbText(value);
  if (!t) return "Natural";
  const k = t.toLowerCase();
  if (k === "juridica") return "Juridica";
  return "Natural";
}

export function normalizeDbTextUpperFromUnknown(raw: unknown): string {
  return normalizeDbTextUpper(raw == null ? null : String(raw)) ?? "";
}

export function normalizeDbTextUpperOrNullFromUnknown(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  return normalizeDbTextUpper(s);
}

export function normalizeCatalogTextFromUnknown(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  return normalizeCatalogText(s);
}

export function normalizeEmailFromUnknown(raw: unknown): string | null {
  if (raw == null) return null;
  return normalizeEmail(String(raw));
}

/** Para class-transformer en DTOs: trim + MAYÚSCULAS sin tildes. */
export function transformStripUpper({ value }: { value: unknown }): unknown {
  if (typeof value !== "string") return value;
  const t = value.replace(/\u0000/g, "").trim();
  if (!t) return t;
  return normalizeDbTextUpper(t) ?? "";
}

/** Para class-transformer: trim + minúsculas (correo). */
export function transformStripEmail({ value }: { value: unknown }): unknown {
  if (typeof value !== "string") return value;
  return value.replace(/\u0000/g, "").trim().toLowerCase();
}

/** Para class-transformer: trim + sin tildes (departamento/ciudad catálogo). */
export function transformStripCatalog({ value }: { value: unknown }): unknown {
  if (typeof value !== "string") return value;
  const t = value.replace(/\u0000/g, "").trim();
  if (!t) return t;
  return normalizeCatalogText(t) ?? "";
}

/** Normaliza strings en payloads JSON (p. ej. autorizaciones); no toca contraseñas. */
export function normalizeFreeTextPayloadRecord(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...payload };
  for (const [k, v] of Object.entries(out)) {
    if (isPasswordFieldKey(k)) continue;
    if (typeof v !== "string") continue;
    const keyLc = k.toLowerCase();
    if (keyLc === "email" || keyLc.endsWith("email")) {
      const e = normalizeEmail(v);
      if (e) out[k] = e;
      continue;
    }
    if (
      keyLc === "department" ||
      keyLc === "city" ||
      keyLc === "departamento" ||
      keyLc === "ciudad" ||
      keyLc.endsWith("department") ||
      keyLc.endsWith("city")
    ) {
      const c = normalizeCatalogText(v);
      if (c) out[k] = c;
      continue;
    }
    const u = normalizeDbTextUpper(v);
    if (u) out[k] = u;
  }
  return out;
}
