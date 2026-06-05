/**
 * Identificación de documentos en nómina / RRHH (normalización de dígitos y clave de deduplicación).
 * Expuesto en `window` desde `index.html` antes de `portal-runtime.js`.
 */
export function normalizeDocumentDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Comparación de unicidad de documento en nómina (dígitos vs pasaporte/PEP alfanumérico). */
export function payrollEmployeeDocumentDedupKey(documentType, value) {
  const dt = String(documentType || "CC").toUpperCase();
  const raw = String(value || "").trim();
  if (dt === "PAS" || dt === "PEP") return raw.replace(/[.\s]/g, "").toUpperCase();
  return normalizeDocumentDigits(raw);
}
