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
  actorAllowedInFolder,
  userHasExclusiveFolderGrants,
  collectUserFolderGrantPaths,
  pathCoveredByFolderGrants,
  pathReachableByFolderGrants,
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
function canAct(folders, path, action, role, { isAdmin = false, hasGlobal = true, userId = "" } = {}) {
  if (!hasGlobal) return false;
  if (isAdmin || role === "admin") return true;
  const actor = { role, userId };
  if (action === "view") return actorAllowedInFolder(folders, path, "view", actor);
  if (action === "upload" || action === "edit") {
    return (
      actorAllowedInFolder(folders, path, "view", actor, { forContent: true }) &&
      actorAllowedInFolder(folders, path, "upload", actor, { forContent: true })
    );
  }
  if (action === "delete") {
    return (
      actorAllowedInFolder(folders, path, "view", actor, { forContent: true }) &&
      actorAllowedInFolder(folders, path, "delete", actor, { forContent: true })
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
/* Usuario con acceso solo a una carpeta concreta                      */
/* ------------------------------------------------------------------ */

const anaId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const pedroId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const anaFolder = normalizeCompanyFolderRow({
  id: "33333333-3333-4333-8333-333333333333",
  folderName: "01. Empleados / Ana",
  usersView: [anaId],
  usersUpload: [anaId],
  usersDelete: []
});
const foldersWithUser = [...folders, anaFolder];

ok(userHasExclusiveFolderGrants(foldersWithUser, anaId) === true, "Ana queda en modo exclusivo");
ok(userHasExclusiveFolderGrants(foldersWithUser, pedroId) === false, "Pedro no tiene concesión de usuario");
ok(
  collectUserFolderGrantPaths(foldersWithUser, anaId, "view").includes("01. Empleados / Ana"),
  "concesión de Ana es su expediente"
);
ok(pathCoveredByFolderGrants("01. Empleados / Ana / Contratos", ["01. Empleados / Ana"]) === true, "hija cubierta");
ok(pathCoveredByFolderGrants("01. Empleados", ["01. Empleados / Ana"]) === false, "ancestro no cubre contenido");
ok(pathReachableByFolderGrants("01. Empleados", ["01. Empleados / Ana"]) === true, "ancestro navegable");
ok(pathReachableByFolderGrants("01. Empleados / Pedro", ["01. Empleados / Ana"]) === false, "hermano no navegable");

ok(
  actorAllowedInFolder(foldersWithUser, "01. Empleados / Ana", "view", { role: "logistica", userId: anaId }) === true,
  "Ana ve su carpeta aunque su rol no esté en allowlist"
);
ok(
  actorAllowedInFolder(foldersWithUser, "01. Empleados / Ana / Contratos", "view", { role: "logistica", userId: anaId }, { forContent: true }) === true,
  "Ana ve documentos de subcarpetas de su expediente"
);
ok(
  actorAllowedInFolder(foldersWithUser, "01. Empleados", "view", { role: "logistica", userId: anaId }) === true,
  "Ana puede abrir el padre para llegar a su carpeta"
);
ok(
  actorAllowedInFolder(foldersWithUser, "01. Empleados", "view", { role: "logistica", userId: anaId }, { forContent: true }) === false,
  "Ana no ve documentos sueltos en el padre"
);
ok(
  actorAllowedInFolder(foldersWithUser, "04. Legal", "view", { role: "rrhh", userId: anaId }) === false,
  "Ana no ve otras carpetas aunque su rol las tendría abiertas"
);
ok(
  canAct(foldersWithUser, "01. Empleados / Ana", "upload", "logistica", { userId: anaId }) === true,
  "Ana puede subir en su carpeta"
);
ok(
  canAct(foldersWithUser, "01. Empleados / Ana", "delete", "logistica", { userId: anaId }) === false,
  "Ana no elimina si no está en usersDelete"
);
ok(
  canAct(foldersWithUser, "01. Empleados", "view", "rrhh", { userId: pedroId }) === true,
  "usuario sin concesión sigue la regla de roles (carpeta abierta)"
);

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
    "usuarios_ver",
    "usuarios_subir",
    "usuarios_eliminar",
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
    "canManageFolderPermissions",
    'userRole() === "admin"',
    "isDocManager",
    "openFolderPermissionsModal",
    "data-perm-user",
    "canUploadFolder",
    "canDeleteFolder",
    "visibleDocs",
    "doc-studio",
    "companyDocuments"
  ],
  "ui-admin-only-folder-perms"
);
ok(
  /function canManageFolderPermissions\(\)\s*\{\s*return userRole\(\) === ["']admin["'];\s*\}/.test(gestionJs),
  "canManageFolderPermissions solo admin"
);
ok(
  /function isDocManager\(\)\s*\{\s*return userRole\(\) === ["']admin["'];\s*\}/.test(gestionJs),
  "isDocManager solo admin"
);

includesAll(
  sqlEmpresa,
  ["roles_ver", "roles_subir", "roles_eliminar", "usuarios_ver", "ADD COLUMN IF NOT EXISTS usuarios_ver"],
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
ok(
  portalService.includes("usersView = prev.rows[0]?.usuarios_ver ?? null"),
  "no-admin preserva usuarios_ver"
);

console.log("company-documents-folder-perms: OK");
