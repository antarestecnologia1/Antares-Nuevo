/**
 * Segregación de perfiles del gestor documental corporativo.
 * - Dominio: allowlists por carpeta (ver / subir / eliminar) por rol.
 * - Estático: API + UI solo admin asigna permisos; sync/upload/download refuerzan.
 *
 * Ejecutar: node qa/company-documents-folder-perms.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  normalizeCompanyFolderRow,
  parseRoleList,
  folderRoleAllowlist,
  roleAllowedInFolder,
  topFolderRecord,
  folderInSubtree
} from "../modules/domain/company-documents.domain.js";

const ROOT = process.cwd();

function read(rel) {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

function ok(cond, msg) {
  assert.ok(cond, msg);
}

function includesAll(content, needles, area) {
  const missing = needles.filter((n) => !content.includes(n));
  ok(missing.length === 0, `[${area}] Faltan: ${missing.join(", ")}`);
}

/** Réplica de la lógica de gate del portal (coincide con gestion-documental.js). */
function canAct(folders, path, action, role, { isAdmin = false, hasGlobal = true } = {}) {
  if (!hasGlobal) return false;
  if (isAdmin || role === "admin") return true;
  if (action === "view") return roleAllowedInFolder(folders, path, "view", role);
  if (action === "upload" || action === "edit") {
    return (
      roleAllowedInFolder(folders, path, "view", role) &&
      roleAllowedInFolder(folders, path, "upload", role)
    );
  }
  if (action === "delete") {
    return (
      roleAllowedInFolder(folders, path, "view", role) &&
      roleAllowedInFolder(folders, path, "delete", role)
    );
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Dominio                                                             */
/* ------------------------------------------------------------------ */

const legal = normalizeCompanyFolderRow({
  id: "11111111-1111-4111-8111-111111111111",
  folderName: "04. Legal",
  roles_ver: "rrhh,administracion,lider_administrativo",
  roles_subir: "rrhh,lider_administrativo",
  roles_eliminar: "lider_administrativo"
});

const openFolder = normalizeCompanyFolderRow({
  id: "22222222-2222-4222-8222-222222222222",
  folderName: "01. Empleados",
  rolesView: [],
  rolesUpload: [],
  rolesDelete: []
});

const folders = [legal, openFolder];

ok(parseRoleList("RRHH, Administracion, rrhh").join(",") === "rrhh,administracion", "parseRoleList normaliza y deduplica");
ok(parseRoleList(["Logistica", ""]).join(",") === "logistica", "parseRoleList desde array");

ok(topFolderRecord(folders, "04. Legal / Contratos")?.folderName === "04. Legal", "topFolderRecord resuelve subcarpeta");
ok(folderInSubtree("04. Legal / Contratos", "04. Legal"), "folderInSubtree incluye descendientes");
ok(!folderInSubtree("01. Empleados", "04. Legal"), "folderInSubtree excluye otras ramas");

ok(
  folderRoleAllowlist(folders, "04. Legal / Contratos", "view").includes("rrhh"),
  "allowlist view hereda de carpeta principal"
);
ok(
  folderRoleAllowlist(folders, "04. Legal", "upload").includes("lider_administrativo"),
  "allowlist upload"
);
ok(
  folderRoleAllowlist(folders, "04. Legal", "delete").join(",") === "lider_administrativo",
  "allowlist delete solo líder"
);
ok(folderRoleAllowlist(folders, "01. Empleados", "view").length === 0, "carpeta abierta = sin restricción");

/* Matriz por rol: Legal restringida */
const roles = [
  "admin",
  "rrhh",
  "administracion",
  "auxiliar_administrativo",
  "lider_administrativo",
  "logistica",
  "client"
];

const expectedLegal = {
  admin: { view: true, upload: true, delete: true },
  rrhh: { view: true, upload: true, delete: false },
  administracion: { view: true, upload: false, delete: false },
  auxiliar_administrativo: { view: false, upload: false, delete: false },
  lider_administrativo: { view: true, upload: true, delete: true },
  logistica: { view: false, upload: false, delete: false },
  client: { view: false, upload: false, delete: false }
};

for (const role of roles) {
  const exp = expectedLegal[role];
  const isAdmin = role === "admin";
  ok(
    canAct(folders, "04. Legal / Contratos", "view", role, { isAdmin }) === exp.view,
    `[Legal] ${role} view=${exp.view}`
  );
  ok(
    canAct(folders, "04. Legal / Contratos", "upload", role, { isAdmin }) === exp.upload,
    `[Legal] ${role} upload=${exp.upload}`
  );
  ok(
    canAct(folders, "04. Legal / Contratos", "delete", role, { isAdmin }) === exp.delete,
    `[Legal] ${role} delete=${exp.delete}`
  );
}

/* Carpeta abierta: todos los roles con permiso global pueden actuar */
for (const role of roles) {
  if (role === "admin") continue;
  ok(canAct(folders, "01. Empleados / Manuales", "view", role) === true, `[Abierta] ${role} view`);
  ok(canAct(folders, "01. Empleados", "upload", role) === true, `[Abierta] ${role} upload`);
  ok(canAct(folders, "01. Empleados", "delete", role) === true, `[Abierta] ${role} delete`);
}

/* Sin permiso global: bloqueado aunque esté en allowlist */
ok(
  canAct(folders, "04. Legal", "upload", "rrhh", { hasGlobal: false }) === false,
  "sin permiso global no sube aunque esté en allowlist"
);

/* Carpeta sin registro de permisos: sin restricción */
ok(roleAllowedInFolder([], "99. Nueva", "view", "logistica") === true, "sin registro = abierto");

/* ------------------------------------------------------------------ */
/* Estático: API + UI + SQL                                            */
/* ------------------------------------------------------------------ */

const portalService = read("apps/api/src/portal/portal.service.ts");
const uploadsCtrl = read("apps/api/src/uploads/uploads.controller.ts");
const gestionJs = read("modules/app/gestion-documental.js");
const sqlEmpresa = read("BD/postgres/tablas/41_documentos_empresa.sql");
const sqlRls = read("BD/postgres/tablas/41_rls_documentos_empresa.sql");

includesAll(
  portalService,
  [
    "assertCanUploadToCompanyFolder",
    "assertCanDownloadCompanyDocumentByKey",
    "loadCompanyFolderPermMap",
    "Solo el administrador puede asignar/modificar permisos de carpeta",
    "roles_ver",
    "roles_subir",
    "roles_eliminar",
    "No autorizado para escribir en esta carpeta corporativa",
    "No autorizado para eliminar en esta carpeta corporativa"
  ],
  "api-portal-folder-perms"
);

includesAll(
  uploadsCtrl,
  ["assertCanUploadToCompanyFolder", "assertCanDownloadCompanyDocumentByKey"],
  "api-uploads-folder-perms"
);

includesAll(
  gestionJs,
  [
    'function canManageFolderPermissions() {\n  return userRole() === "admin";',
    'function isDocManager() {\n  return userRole() === "admin";',
    "openFolderPermissionsModal",
    "canUploadFolder",
    "canDeleteFolder",
    "visibleDocs"
  ],
  "ui-admin-only-folder-perms"
);

includesAll(
  sqlEmpresa,
  ["roles_ver", "roles_subir", "roles_eliminar", "ADD COLUMN IF NOT EXISTS roles_ver"],
  "sql-folder-role-columns"
);

includesAll(
  sqlRls,
  [
    "documentos_empresa_select",
    "carpetas_documento_empresa_escritura",
    "es_administrador_global()"
  ],
  "sql-rls-documentos-empresa"
);

/* Escritura de carpetas en RLS solo admin (no equipo RRHH genérico). */
const folderWritePolicy = sqlRls.match(
  /CREATE POLICY carpetas_documento_empresa_escritura[\s\S]*?;/
)?.[0];
ok(folderWritePolicy, "existe policy CREATE de escritura de carpetas");
ok(
  folderWritePolicy.includes("es_administrador_global()") &&
    !folderWritePolicy.includes("es_equipo_rrhh()"),
  "RLS escritura de carpetas solo admin global"
);

/* Sync de carpetas: no-admin preserva roles_* existentes */
ok(portalService.includes("isAdminActor"), "sync folders recibe flag admin");
ok(
  portalService.includes("rolesView = prev.rows[0]?.roles_ver ?? null"),
  "no-admin preserva roles_ver"
);

console.log("company-documents-folder-perms: OK");
