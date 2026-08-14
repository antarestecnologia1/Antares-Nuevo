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

export function canSyncSarlaftKey(
  key: "sarlaftRiskProfiles" | "sarlaftThirdParties" | "sarlaftAlerts" | "sarlaftReviews",
  permissionSet: ReadonlySet<string>
): boolean {
  if (key === "sarlaftRiskProfiles") return canSyncSarlaftProfiles(permissionSet);
  if (key === "sarlaftThirdParties") return canSyncSarlaftParties(permissionSet);
  if (key === "sarlaftAlerts") return canSyncSarlaftAlerts(permissionSet);
  return canSyncSarlaftReviews(permissionSet);
}
