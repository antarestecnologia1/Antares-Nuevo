/**
 * Dominio de administración · usuarios: estado UI y normalización de borradores.
 */
import { state } from "../core/store.js";

export function getAdminUsersUi() {
  const ui = state.adminUsersUi;
  return {
    panel: String(ui?.panel || "").trim(),
    editUserId: String(ui?.editUserId || "").trim(),
    editCompanyId: String(ui?.editCompanyId || "").trim(),
    section: String(ui?.section || "pending").trim() || "pending",
    createUserMinimized: Boolean(ui?.createUserMinimized),
    createCompanyMinimized: Boolean(ui?.createCompanyMinimized),
    editMinimized: Boolean(ui?.editMinimized),
    permissionsMinimized: Boolean(ui?.permissionsMinimized),
    directorySearch: String(ui?.directorySearch || "").trim()
  };
}

export function patchAdminUsersUi(partial) {
  state.adminUsersUi = { ...(state.adminUsersUi || {}), ...(partial || {}) };
  return getAdminUsersUi();
}

export function getAdminUserCreateDraft() {
  const d = state.adminUsersDrafts?.createUser;
  return d && typeof d === "object" ? { ...d } : {};
}

export function getAdminCompanyCreateDraft() {
  const d = state.adminUsersDrafts?.createCompany;
  return d && typeof d === "object" ? { ...d } : {};
}

export function filterDirectoryRows(rows, search) {
  const q = String(search || "").trim().toLowerCase();
  const list = Array.isArray(rows) ? rows : [];
  if (!q) return list;
  return list.filter((row) =>
    Object.values(row || {})
      .map((v) => String(v ?? "").toLowerCase())
      .join(" ")
      .includes(q)
  );
}
