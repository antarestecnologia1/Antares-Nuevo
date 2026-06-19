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
  "password_proveedor_satelite",
  "passwordConfirm",
  "confirmPassword",
  "newPassword",
  "oldPassword",
  "currentPassword"
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

/** Para class-transformer: trim + sin NUL (sin cambiar mayúsculas). */
export function transformStripNulTrim({ value }: { value: unknown }): unknown {
  if (typeof value !== "string") return value;
  return value.replace(/\u0000/g, "").trim();
}

/** Texto multilínea: sin NUL, saltos normalizados, sin mayúsculas forzadas. */
export function normalizeMultilineText(value: string | undefined | null, maxLen?: number): string | null {
  let s = String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  if (maxLen && s.length > maxLen) s = s.slice(0, maxLen);
  return s || null;
}

/** Para class-transformer: motivos, cuerpos de notificación, etc. */
export function transformStripMultiline({ value }: { value: unknown }): unknown {
  if (typeof value !== "string") return value;
  return normalizeMultilineText(value) ?? "";
}

/** Multilínea persistida en BD como mayúsculas sin tildes (mensajes B2B, notas). */
export function transformStripMultilineUpper({ value }: { value: unknown }): unknown {
  if (typeof value !== "string") return value;
  const t = normalizeMultilineText(value);
  if (!t) return "";
  return normalizeDbTextUpper(t) ?? "";
}

/** Solo dígitos (teléfonos en DTO). */
export function transformStripPhoneDigits({ value }: { value: unknown }): unknown {
  if (typeof value !== "string") return value;
  return value.replace(/\u0000/g, "").replace(/\D/g, "").trim();
}

/** Alineado con `normalizePortalPhoneForStorage` del portal (modules/domain/payroll-catalog-sanitize.domain.js). */
export function normalizePortalPhoneForStorage(raw: unknown, fallback = "3000000000"): string {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return fallback;
  const d = trimmed.replace(/\D/g, "");
  if (!d) return trimmed.replace(/\s+/g, " ").trim().slice(0, 32) || fallback;

  let national = d;
  if (d.startsWith("57") && d.length >= 11) {
    national = d.slice(2);
  }

  if (/^\d{10}$/.test(national)) {
    const n = national;
    return `+57 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
  }

  if (d.startsWith("57")) {
    return `+${d}`.slice(0, 32);
  }

  if (/^\d{11,15}$/.test(d)) {
    return `+${d}`.slice(0, 32);
  }

  return trimmed.replace(/\s+/g, " ").trim().slice(0, 32) || fallback;
}

/** Documento alfanumérico compacto. */
export function transformStripDoc({ value }: { value: unknown }): unknown {
  if (typeof value !== "string") return value;
  return value
    .replace(/\u0000/g, "")
    .replace(/[.\s]/g, "")
    .trim()
    .toUpperCase();
}

function isPreserveCaseMultilineKey(key: string): boolean {
  const k = key.toLowerCase();
  return (
    k === "reason" ||
    k === "motivo" ||
    k === "body" ||
    k === "experience" ||
    k === "description" ||
    k === "content" ||
    k === "subject" ||
    k.endsWith("reason") ||
    k.endsWith("motivo") ||
    k.endsWith("description") ||
    k.endsWith("experience")
  );
}

function isMultilineUpperKey(key: string): boolean {
  const k = key.toLowerCase();
  return k === "message" || k === "notes" || k === "requirements" || k.endsWith("notes");
}

function shouldSkipStringNormalizeKey(key: string): boolean {
  const k = key.toLowerCase();
  if (isPasswordFieldKey(key)) return true;
  if (k === "id" || k.endsWith("id") || k.includes("uuid")) return true;
  if (k.includes("url") || k.includes("hash") || k.includes("token") || k.includes("secret")) return true;
  if (k.endsWith("at") && (k.includes("created") || k.includes("updated") || k.includes("expir"))) return true;
  return false;
}

/** Elimina caracteres NUL en cualquier string dentro de JSON (sync-key, arrays). */
export function stripNulFromUnknown(raw: unknown, depth = 0): unknown {
  if (depth > 24) return raw;
  if (typeof raw === "string") return raw.replace(/\u0000/g, "");
  if (Array.isArray(raw)) return raw.map((item) => stripNulFromUnknown(item, depth + 1));
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      out[k] = stripNulFromUnknown(v, depth + 1);
    }
    return out;
  }
  return raw;
}

/** Sanitiza el array/objeto de sync-key antes de persistir. */
export function sanitizeSyncKeyPayload(data: unknown): unknown {
  return stripNulFromUnknown(data);
}

/** Normaliza strings en payloads JSON (p. ej. autorizaciones); no toca contraseñas. */
export function normalizeFreeTextPayloadRecord(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...payload };
  for (const [k, v] of Object.entries(out)) {
    if (shouldSkipStringNormalizeKey(k)) continue;
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
    if (isPreserveCaseMultilineKey(k)) {
      const m = normalizeMultilineText(v);
      if (m) out[k] = m;
      continue;
    }
    if (isMultilineUpperKey(k)) {
      const m = normalizeMultilineText(v);
      if (m) {
        const u = normalizeDbTextUpper(m);
        if (u) out[k] = u;
      }
      continue;
    }
    const u = normalizeDbTextUpper(v);
    if (u) out[k] = u;
  }
  return out;
}
