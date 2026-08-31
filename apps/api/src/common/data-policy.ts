/** Versión vigente de la Política de Tratamiento de Datos Personales (documentacion/). */
export const DATA_POLICY_VERSION = "2025-v1";

export function toIsoDateOrNull(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (raw instanceof Date) {
    return Number.isFinite(raw.getTime()) ? raw.toISOString() : null;
  }
  const d = new Date(String(raw));
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

export function parsePortalChecklist(raw: unknown): Record<string, unknown> | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return null;
}

function checklistFlagTrue(checklist: Record<string, unknown> | null, key: string): boolean {
  if (!checklist) return false;
  const v = checklist[key];
  return v === true || v === 1 || v === "true" || v === "on" || v === "1";
}

export function userRequiresDataPolicyAcceptance(
  acceptedAt: string | Date | null | undefined,
  acceptedVersion: string | null | undefined
): boolean {
  if (!acceptedAt) return true;
  const version = String(acceptedVersion || "").trim();
  if (!version || version !== DATA_POLICY_VERSION) return true;
  return false;
}

/** Términos de uso, privacidad y Habeas Data (`usuarios.fecha_aceptacion_terminos`). */
export function userRequiresTermsAcceptance(termsAcceptedAt: string | Date | null | undefined): boolean {
  return !termsAcceptedAt;
}

export type ResolvedLegalAcceptance = {
  dataPolicyAcceptedAt: string | null;
  dataPolicyVersion: string | null;
  termsAcceptedAt: string | null;
  requiresDataPolicyAcceptance: boolean;
  requiresTermsAcceptance: boolean;
  /** Columnas de BD vacías que ya constan en checklist u otros campos; conviene persistirlas. */
  missingDbColumns: {
    dataPolicyAcceptedAt: boolean;
    dataPolicyVersion: boolean;
    termsAcceptedAt: boolean;
  };
};

/**
 * Unifica columnas de `usuarios` + `checklist_registro_json` para no volver a pedir
 * términos/privacidad/política en un navegador nuevo si ya se aceptaron al registrarse.
 */
export function resolveLegalAcceptanceFields(input: {
  dataPolicyAcceptedAt?: unknown;
  dataPolicyVersion?: unknown;
  termsAcceptedAt?: unknown;
  createdAt?: unknown;
  checklist?: unknown;
}): ResolvedLegalAcceptance {
  const checklist = parsePortalChecklist(input.checklist);
  const dbDataPolicyAcceptedAt = toIsoDateOrNull(input.dataPolicyAcceptedAt);
  const dbDataPolicyVersion = String(input.dataPolicyVersion ?? "").trim() || null;
  const dbTermsAcceptedAt = toIsoDateOrNull(input.termsAcceptedAt);

  let dataPolicyAcceptedAt =
    dbDataPolicyAcceptedAt || toIsoDateOrNull(checklist?.dataPolicyAcceptedAt);
  let dataPolicyVersion =
    dbDataPolicyVersion || String(checklist?.dataPolicyVersion ?? "").trim() || null;
  let termsAcceptedAt =
    dbTermsAcceptedAt ||
    toIsoDateOrNull(checklist?.acceptedTermsAt) ||
    toIsoDateOrNull(checklist?.termsAcceptedAt);

  if (
    !dataPolicyAcceptedAt &&
    (checklistFlagTrue(checklist, "dataPolicyAccepted") || Boolean(dataPolicyVersion))
  ) {
    dataPolicyAcceptedAt =
      toIsoDateOrNull(checklist?.dataPolicyAcceptedAt) ||
      toIsoDateOrNull(input.createdAt) ||
      toIsoDateOrNull(checklist?.acceptedTermsAt);
  }
  if (dataPolicyAcceptedAt && !dataPolicyVersion) {
    dataPolicyVersion = DATA_POLICY_VERSION;
  }

  if (
    !termsAcceptedAt &&
    (checklistFlagTrue(checklist, "termsOfUseAccepted") ||
      checklistFlagTrue(checklist, "privacyPolicyAccepted") ||
      checklistFlagTrue(checklist, "habeasDataAcknowledged") ||
      Boolean(toIsoDateOrNull(checklist?.acceptedTermsAt)))
  ) {
    termsAcceptedAt =
      toIsoDateOrNull(checklist?.acceptedTermsAt) ||
      toIsoDateOrNull(checklist?.termsAcceptedAt) ||
      toIsoDateOrNull(input.createdAt);
  }

  return {
    dataPolicyAcceptedAt,
    dataPolicyVersion,
    termsAcceptedAt,
    requiresDataPolicyAcceptance: userRequiresDataPolicyAcceptance(
      dataPolicyAcceptedAt,
      dataPolicyVersion
    ),
    requiresTermsAcceptance: userRequiresTermsAcceptance(termsAcceptedAt),
    missingDbColumns: {
      dataPolicyAcceptedAt: !dbDataPolicyAcceptedAt && Boolean(dataPolicyAcceptedAt),
      dataPolicyVersion: !dbDataPolicyVersion && Boolean(dataPolicyVersion),
      termsAcceptedAt: !dbTermsAcceptedAt && Boolean(termsAcceptedAt)
    }
  };
}
