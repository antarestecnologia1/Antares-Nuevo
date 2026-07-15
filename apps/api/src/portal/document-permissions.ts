/** Permisos granulares del expediente documental (alineado al frontend). */

export const DOCUMENT_GRANULAR_PERMISSIONS = [
  "document_view",
  "document_upload",
  "document_edit",
  "document_delete"
] as const;

export function hasDocumentManageAll(permissionSet: ReadonlySet<string>): boolean {
  return permissionSet.has("document_manage");
}

export function canAccessDocumentsModule(permissionSet: ReadonlySet<string>): boolean {
  if (hasDocumentManageAll(permissionSet)) return true;
  return DOCUMENT_GRANULAR_PERMISSIONS.some((p) => permissionSet.has(p));
}

export function canViewEmployeeDocuments(permissionSet: ReadonlySet<string>): boolean {
  if (hasDocumentManageAll(permissionSet)) return true;
  return (
    permissionSet.has("document_view") ||
    permissionSet.has("document_upload") ||
    permissionSet.has("document_edit") ||
    permissionSet.has("document_delete")
  );
}

export function canUploadEmployeeDocuments(permissionSet: ReadonlySet<string>): boolean {
  if (hasDocumentManageAll(permissionSet)) return true;
  return permissionSet.has("document_upload");
}

export function canEditEmployeeDocuments(permissionSet: ReadonlySet<string>): boolean {
  if (hasDocumentManageAll(permissionSet)) return true;
  return permissionSet.has("document_edit");
}

export function canDeleteEmployeeDocuments(permissionSet: ReadonlySet<string>): boolean {
  if (hasDocumentManageAll(permissionSet)) return true;
  return permissionSet.has("document_delete");
}

export function canSyncEmployeeDocuments(permissionSet: ReadonlySet<string>): boolean {
  if (hasDocumentManageAll(permissionSet)) return true;
  return permissionSet.has("document_upload") || permissionSet.has("document_edit");
}

export function canDownloadEmployeeDocuments(permissionSet: ReadonlySet<string>): boolean {
  return canViewEmployeeDocuments(permissionSet);
}
