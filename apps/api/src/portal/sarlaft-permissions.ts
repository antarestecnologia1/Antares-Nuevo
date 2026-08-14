/** Permisos granulares de SARLAFT / PTE (alineado al frontend). */

export const SARLAFT_GRANULAR_PERMISSIONS = [
  "sarlaft_view",
  "sarlaft_parties",
  "sarlaft_alerts",
  "sarlaft_reviews",
  "sarlaft_profiles",
  "sarlaft_delete"
] as const;

export function hasSarlaftManageAll(permissionSet: ReadonlySet<string>): boolean {
  return permissionSet.has("sarlaft_manage");
}

export function canAccessSarlaftModule(permissionSet: ReadonlySet<string>): boolean {
  if (hasSarlaftManageAll(permissionSet)) return true;
  return SARLAFT_GRANULAR_PERMISSIONS.some((p) => permissionSet.has(p));
}

export function canSyncSarlaftParties(permissionSet: ReadonlySet<string>): boolean {
  return hasSarlaftManageAll(permissionSet) || permissionSet.has("sarlaft_parties");
}

export function canSyncSarlaftAlerts(permissionSet: ReadonlySet<string>): boolean {
  return hasSarlaftManageAll(permissionSet) || permissionSet.has("sarlaft_alerts");
}

export function canSyncSarlaftReviews(permissionSet: ReadonlySet<string>): boolean {
  return hasSarlaftManageAll(permissionSet) || permissionSet.has("sarlaft_reviews");
}

export function canSyncSarlaftProfiles(permissionSet: ReadonlySet<string>): boolean {
  return hasSarlaftManageAll(permissionSet) || permissionSet.has("sarlaft_profiles");
}

export function canDeleteSarlaftRecords(permissionSet: ReadonlySet<string>): boolean {
  return hasSarlaftManageAll(permissionSet) || permissionSet.has("sarlaft_delete");
}

/** Alta de evidencias KYC desde el módulo SARLAFT (carpeta 08. SARLAFT / PTE). */
export function canUploadSarlaftEvidence(permissionSet: ReadonlySet<string>): boolean {
  return (
    hasSarlaftManageAll(permissionSet) ||
    permissionSet.has("sarlaft_parties") ||
    permissionSet.has("sarlaft_alerts") ||
    permissionSet.has("sarlaft_reviews")
  );
}

export function isSarlaftEvidenceFolder(folderPath: unknown): boolean {
  const key = String(folderPath || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  return key.includes("sarlaft");
}

export function isSarlaftEvidenceDocument(row: unknown): boolean {
  if (!row || typeof row !== "object") return false;
  const rec = row as Record<string, unknown>;
  const process = String(rec.process || rec.proceso || "").trim().toLowerCase();
  const entityType = String(rec.entityType || rec.entidadTipo || rec.entidad_tipo || "").trim().toLowerCase();
  const folder = rec.folder ?? rec.carpeta ?? "";
  return process === "sarlaft" || entityType === "tercero" || isSarlaftEvidenceFolder(folder);
}

export function canSyncSarlaftKey(
  key: "sarlaftRiskProfiles" | "sarlaftThirdParties" | "sarlaftAlerts" | "sarlaftReviews",
  permissionSet: ReadonlySet<string>
): boolean {
  if (key === "sarlaftRiskProfiles") return canSyncSarlaftProfiles(permissionSet);
  if (key === "sarlaftThirdParties") return canSyncSarlaftParties(permissionSet);
  if (key === "sarlaftAlerts") return canSyncSarlaftAlerts(permissionSet);
  return canSyncSarlaftReviews(permissionSet);
}
