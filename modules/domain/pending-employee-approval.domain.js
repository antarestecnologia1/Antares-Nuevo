/**
 * Solicitudes de alta de colaborador pendientes (cola de autorizaciones).
 */
import { payrollEmployeeDocumentDedupKey } from "./payroll-identifiers.domain.js";

/** Filas `create_employee` pendientes con el mismo documento (tipo incluido). */
export function listPendingCreateEmployeeApprovalsByDocument(approvals, documentType, idDoc) {
  const docType = String(documentType || "CC").toUpperCase();
  const needle = payrollEmployeeDocumentDedupKey(docType, idDoc);
  if (!needle) return [];
  const rows = Array.isArray(approvals) ? approvals : [];
  return rows.filter((approval) => {
    if (String(approval?.type || "") !== "create_employee") return false;
    if (String(approval?.status || "").toLowerCase() !== "pendiente") return false;
    const payload = approval.payload && typeof approval.payload === "object" ? approval.payload : {};
    const payloadDocType = String(payload.documentType || "CC").toUpperCase();
    if (payloadDocType !== docType) return false;
    return payrollEmployeeDocumentDedupKey(payloadDocType, payload.idDoc) === needle;
  });
}

/**
 * Solicitud pendiente que bloquea un nuevo alta con el mismo documento en la empresa.
 * @returns {object|null} fila de autorización o null
 */
export function findPendingCreateEmployeeApproval(approvals, documentType, idDoc, companyId) {
  const company = String(companyId || "").trim();
  if (!company) return null;
  const matches = listPendingCreateEmployeeApprovalsByDocument(approvals, documentType, idDoc);
  return matches.find((row) => String(row?.payload?.companyId || "").trim() === company) || null;
}
