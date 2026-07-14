/** Versión vigente de la Política de Tratamiento de Datos Personales (documentacion/). */
export const DATA_POLICY_VERSION = "2025-v1";

export function userRequiresDataPolicyAcceptance(
  acceptedAt: string | Date | null | undefined,
  acceptedVersion: string | null | undefined
): boolean {
  if (!acceptedAt) return true;
  const version = String(acceptedVersion || "").trim();
  if (!version || version !== DATA_POLICY_VERSION) return true;
  return false;
}
