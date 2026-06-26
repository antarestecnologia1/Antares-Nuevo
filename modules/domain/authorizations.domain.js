/**
 * Dominio del centro de autorizaciones: colas y secciones visibles.
 */
import { KEYS } from "../core/config.js";
import { read } from "../core/data-io.js";
import { hasPermission, isAdminActor } from "../core/auth.js";
import { PERMISSIONS } from "../core/config.js";

export function readApprovalsSync() {
  return read(KEYS.approvals, []);
}

export function readPendingPortalRegistrationsSync() {
  const users = read(KEYS.users, []);
  const fn = globalThis.isPortalUserPendingApproval;
  if (typeof fn === "function") {
    return users.filter((u) => fn(u));
  }
  return users.filter((u) => String(u?.accountStatus || u?.status || "").toLowerCase() === "pending");
}

export function filterPendingApprovalsForActor(approvals, user) {
  const rows = Array.isArray(approvals) ? approvals : [];
  if (!user) return [];
  if (isAdminActor(user)) return rows.filter((a) => String(a?.status || "").toLowerCase() === "pending");
  return rows.filter((a) => {
    if (String(a?.status || "").toLowerCase() !== "pending") return false;
    const type = String(a?.type || a?.approvalType || "").trim();
    if (type === "transport_request" && hasPermission(user, PERMISSIONS.AUTHORIZATIONS_TRANSPORT)) return true;
    if (type === "portal_registration" && hasPermission(user, PERMISSIONS.USERS_MANAGE)) return true;
    return false;
  });
}

export function authorizationQueueCounts(approvals, pendingUsers, user) {
  const pendingApprovals = filterPendingApprovalsForActor(approvals, user);
  const registrations = Array.isArray(pendingUsers) ? pendingUsers : [];
  const pendingRegs = registrations.filter((u) => String(u?.status || "").toLowerCase() === "pending");
  return {
    approvals: pendingApprovals.length,
    registrations: pendingRegs.length,
    total: pendingApprovals.length + pendingRegs.length
  };
}
