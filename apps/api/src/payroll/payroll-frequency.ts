/**
 * Periodicidad de pago: misma lista que creación/edición del empleado en el portal
 * (`CO_CATALOGS.payFrequency` → campo `payFrequency` / columna DB `periodicidad_pago`).
 */

export type PayrollFrequencyNorm = "mensual" | "quincenal" | "catorcenal" | "semanal";

/** Etiquetas canónicas (orden y texto idénticos al catálogo del front). */
export const PAY_FREQUENCY_CANONICAL_LABELS: Record<PayrollFrequencyNorm, string> = {
  mensual: "Mensual",
  quincenal: "Quincenal",
  semanal: "Semanal",
  catorcenal: "Catorcenal"
};

export function normalizePayrollFrequency(raw: string | null | undefined): PayrollFrequencyNorm {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s || s.includes("mensual")) return "mensual";
  if (s.includes("quincen")) return "quincenal";
  if (s.includes("catorcen") || s.includes("catorcenal")) return "catorcenal";
  if (s.includes("seman")) return "semanal";
  return "mensual";
}

/** Texto igual al seleccionado al crear empleado; sirve para homologar `periodicidad_pago` en BD. */
export function canonicalPayFrequencyLabel(raw: string | null | undefined): string {
  return PAY_FREQUENCY_CANONICAL_LABELS[normalizePayrollFrequency(raw)];
}
