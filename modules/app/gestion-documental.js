/**
 * Gestión documental — gestor documental corporativo (DMS general de empresa).
 * Reemplaza el expediente por colaborador. Carpetas jerárquicas, R2, KPIs,
 * permisos por carpeta (solo admin), vista previa lateral y dropzone.
 */
import { state, nodes } from "../core/store.js";
import { read, writeAwaitServerCreate, writeAwaitServerEdit } from "../core/data-io.js";
import { KEYS, PORTAL_ASSIGNABLE_ROLES } from "../core/config.js";
import {
  canAccessDocumentsView,
  canUploadDocuments,
  canEditDocuments,
  canDeleteDocuments,
  currentUser
} from "../core/auth.js";
import { escapeHtml, escapeAttr, newUuidV4, devWarn } from "../core/utils.js";
import {
  COMPANY_DOCUMENT_MAX_BYTES,
  COMPANY_DOCUMENT_CATEGORIES,
  DEFAULT_COMPANY_FOLDER,
  EMPLOYEES_ROOT_FOLDER,
  SUGGESTED_COMPANY_FOLDERS,
  employeeCompanyFolderPath,
  listMissingEmployeeFolderPaths,
  buildPayrollCompanyDocumentFileName,
  employeeHireDocumentMarker,
  buildEmployeeContractCompanyFileName,
  buildEmployeePhotoCompanyFileName,
  mapEmployeeDocumentTypeToCompanyCategory,
  normalizeCompanyDocumentRow,
  normalizeCompanyFolderRow,
  normalizeCompanyFolder,
  fileTypeLabel,
  fileTypeGroup,
  canPreviewFileType,
  formatFileSize,
  collectAllFolderPaths,
  collectTopFolders,
  collectSubfolders,
  topFolderName,
  folderLeafName,
  folderSegments,
  folderKey,
  folderInSubtree,
  folderRoleAllowlist,
  roleAllowedInFolder,
  getCompanyDocumentCategoryLabel,
  summarizeCompanyDocuments,
  applyCompanyDocumentFilters,
  sortByRecent,
  buildCompanyDocumentExportRows
} from "../domain/company-documents.domain.js";
import {
  normalizeEmployeeDocumentRow,
  normalizeEmployeeDocumentFolderRow
} from "../domain/employee-documents.domain.js";
import { downloadCsv, ensureJsPdfLoaded } from "../domain/reporteria.domain.js";
import { payrollRunTypeLabel } from "../domain/nomina.domain.js";
import { buildEmployeeContractDocxPayload } from "../domain/contratacion.domain.js";
import {
  SAFE_DOCUMENT_ACCEPT,
  validateUploadFile
} from "../core/file-upload-security.js";

const G = globalThis;
const PAGE_SIZE = 12;
const SUBFOLDER_PAGE_SIZE = 8;
const RECENT_SIDEBAR_COUNT = 4;

const SORT_OPTIONS = [
  { value: "name_asc", label: "Nombre (A-Z)" },
  { value: "name_desc", label: "Nombre (Z-A)" },
  { value: "recent", label: "Más recientes" },
  { value: "size_desc", label: "Tamaño" }
];

if (typeof window !== "undefined") {
  window.normalizeEmployeeDocumentRow = normalizeEmployeeDocumentRow;
  window.normalizeEmployeeDocumentFolderRow = normalizeEmployeeDocumentFolderRow;
  window.normalizeCompanyDocumentRow = normalizeCompanyDocumentRow;
  window.normalizeCompanyFolderRow = normalizeCompanyFolderRow;
}

/** Crea (si falta) la carpeta `01. Empleados / Nombre` de un colaborador. */
async function ensureCompanyEmployeeDocumentFolder(employee, by = actor()) {
  const path = employeeCompanyFolderPath(employee);
  if (!path) return { ok: false, skipped: true };
  const folders = readFolders();
  if (folders.some((f) => folderKey(f.folderName) === folderKey(path))) {
    return { ok: true, skipped: true, path };
  }
  /* Asegura también la raíz 01. Empleados. */
  if (!folders.some((f) => folderKey(f.folderName) === folderKey(EMPLOYEES_ROOT_FOLDER))) {
    const root = normalizeCompanyFolderRow({
      id: newUuidV4(),
      folderName: EMPLOYEES_ROOT_FOLDER,
      description: "Expedientes por colaborador",
      createdBy: by,
      createdAt: new Date().toISOString()
    });
    try {
      await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...folders, root], root);
    } catch (err) {
      devWarn("[companyDocuments] ensureEmployeesRoot", err?.message || err);
    }
  }
  const fresh = readFolders();
  if (fresh.some((f) => folderKey(f.folderName) === folderKey(path))) {
    return { ok: true, skipped: true, path };
  }
  const record = normalizeCompanyFolderRow({
    id: newUuidV4(),
    folderName: path,
    description: `Expediente documental de ${sanitizeLeaf(employee?.name)}`,
    createdBy: by,
    createdAt: new Date().toISOString()
  });
  try {
    await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...fresh, record], record);
    return { ok: true, created: true, path, id: record.id };
  } catch (err) {
    devWarn("[companyDocuments] ensureCompanyEmployeeDocumentFolder", err?.message || err);
    return { ok: false, message: String(err?.message || err), path };
  }
}

function sanitizeLeaf(name) {
  return String(name || "").replace(/[\\/]+/g, " ").trim() || "Colaborador";
}

if (typeof window !== "undefined") {
  window.ensureCompanyEmployeeDocumentFolder = ensureCompanyEmployeeDocumentFolder;
}

const IC_HDD =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="10" y1="12" x2="18" y2="12"/></svg>';
const IC_DOTS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>';
const IC_UPLOAD_BIG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
const IC_EXTERNAL =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
const IC_LOCK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
const IC_TRASH =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
const IC_CHEVRON_DOWN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
const IC_SORT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h10M11 9h7M11 13h4M3 5l3 3 3-3M6 8v13"/></svg>';
const IC_EMPTY_FOLDER =
  '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="8" y="18" width="48" height="34" rx="4" fill="#e8eef7" stroke="#2563eb" stroke-width="2"/><path d="M8 26h20l4-6h24v6" stroke="#2563eb" stroke-width="2" stroke-linejoin="round"/><circle cx="48" cy="14" r="3" fill="#93c5fd"/><circle cx="16" cy="48" r="2" fill="#bfdbfe"/><path d="M28 38h8M32 34v8" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/></svg>';

const TYPE_FILTERS = [
  { value: "all", label: "Todos los tipos" },
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Documentos Word" },
  { value: "sheet", label: "Hojas de cálculo" },
  { value: "slide", label: "Presentaciones" },
  { value: "image", label: "Imágenes" },
  { value: "archive", label: "Comprimidos" },
  { value: "text", label: "Texto" }
];

function getUi() {
  if (!state.companyDocsUi || typeof state.companyDocsUi !== "object") {
    state.companyDocsUi = {
      viewMode: "grid",
      search: "",
      typeFilter: "all",
      folderFilter: EMPLOYEES_ROOT_FOLDER,
      showFilters: false,
      showTrash: false,
      sortKey: "name_asc",
      page: 1,
      folderPage: 1
    };
  }
  const ui = state.companyDocsUi;
  if (!ui.sortKey) ui.sortKey = "name_asc";
  if (!ui.folderPage) ui.folderPage = 1;
  if (ui.showTrash == null) ui.showTrash = false;
  if (!ui.viewMode) ui.viewMode = "grid";
  return ui;
}
function patchUi(patch) {
  return Object.assign(getUi(), patch || {});
}

function userObj() {
  return (typeof G.currentUser === "function" ? G.currentUser() : currentUser()) || {};
}
function userRole() {
  return String(userObj().role || "").toLowerCase();
}
function actor() {
  const u = userObj();
  return String(u.fullName || u.name || u.email || "Portal").trim() || "Portal";
}
function canView() {
  return canAccessDocumentsView(userObj());
}
function canUpload() {
  return canUploadDocuments(userObj());
}
function canEdit() {
  return canEditDocuments(userObj());
}
function canDelete() {
  return canDeleteDocuments(userObj());
}
function isDocManager() {
  return userRole() === "admin";
}
function canManageFolderPermissions() {
  return userRole() === "admin";
}

function canViewFolder(folders, path) {
  if (!canView()) return false;
  if (isDocManager()) return true;
  return roleAllowedInFolder(folders, path, "view", userRole());
}
function canUploadFolder(folders, path) {
  if (!canUpload()) return false;
  if (isDocManager()) return true;
  return (
    roleAllowedInFolder(folders, path, "view", userRole()) &&
    roleAllowedInFolder(folders, path, "upload", userRole())
  );
}
function canEditFolder(folders, path) {
  if (!canEdit()) return false;
  if (isDocManager()) return true;
  return (
    roleAllowedInFolder(folders, path, "view", userRole()) &&
    roleAllowedInFolder(folders, path, "upload", userRole())
  );
}
function canDeleteFolder(folders, path) {
  if (!canDelete()) return false;
  if (isDocManager()) return true;
  return (
    roleAllowedInFolder(folders, path, "view", userRole()) &&
    roleAllowedInFolder(folders, path, "delete", userRole())
  );
}

function readDocs() {
  return read(KEYS.companyDocuments, []).map(normalizeCompanyDocumentRow).filter((d) => d && d.id);
}
function readFolders() {
  return read(KEYS.companyDocumentFolders, []).map(normalizeCompanyFolderRow).filter((f) => f && f.id);
}
function visibleDocs(docs, folders) {
  if (isDocManager()) return docs;
  return docs.filter((d) => canViewFolder(folders, d.folder));
}
function visibleFolders(folders) {
  if (isDocManager()) return folders;
  return folders.filter((f) => canViewFolder(folders, f.folderName));
}

function usersWithAccessCount() {
  let count = 0;
  for (const u of read(KEYS.users, [])) {
    if (!u || typeof u !== "object") continue;
    if (String(u.active ?? "true").toLowerCase() === "false") continue;
    try {
      if (canAccessDocumentsView(u)) count += 1;
    } catch {
      /* ignore */
    }
  }
  return count;
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}
function formatDateShort(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function renderHeader(ui, IC) {
  const uploadBtn = canUpload()
    ? `<button type="button" class="doc-btn doc-btn--primary" data-action="doc-upload">${IC.upload || ""}<span>Subir documento</span></button>`
    : "";
  const newFolderBtn = canUpload()
    ? `<button type="button" class="doc-btn doc-btn--ghost" data-action="doc-new-folder">${IC.plus || ""}<span>Nueva carpeta</span></button>`
    : "";
  return `<header class="doc-topbar">
    <div class="doc-topbar__titles">
      <h1 class="doc-topbar__title">Gestión documental</h1>
      <p class="doc-topbar__subtitle">Administra y organiza todos los documentos de la empresa.</p>
    </div>
    <div class="doc-topbar__actions">
      ${newFolderBtn}
      ${uploadBtn}
    </div>
  </header>`;
}

function renderKpis(summary, IC) {
  const cards = [
    { icon: IC.folder || "", tone: "blue", label: "Carpetas", value: String(summary.folderCount), sub: "Total carpetas" },
    { icon: IC.file || "", tone: "green", label: "Documentos", value: String(summary.docCount), sub: "Total archivos" },
    { icon: IC_HDD, tone: "violet", label: "Almacenamiento", value: formatFileSize(summary.totalBytes), sub: `De ${formatFileSize(summary.quotaBytes)} utilizados` },
    { icon: IC.users || "", tone: "amber", label: "Usuarios", value: String(summary.usersWithAccess), sub: "Con acceso" }
  ];
  return `<section class="doc-kpi-grid doc-kpi-grid--compact" aria-label="Indicadores documentales">
    ${cards
      .map(
        (c) => `<article class="doc-kpi">
        <span class="doc-kpi__icon doc-kpi__icon--${c.tone}">${c.icon}</span>
        <div class="doc-kpi__body">
          <span class="doc-kpi__label">${escapeHtml(c.label)}</span>
          <strong class="doc-kpi__value">${escapeHtml(c.value)}</strong>
        </div>
      </article>`
      )
      .join("")}
  </section>`;
}

function mergeSuggestedTopFolders(topFolders) {
  const map = new Map((topFolders || []).map((f) => [f.key, f]));
  const suggested = SUGGESTED_COMPANY_FOLDERS.map((name) => {
    const key = folderKey(name);
    const existing = map.get(key);
    if (existing) {
      map.delete(key);
      return existing;
    }
    return { name, key, subfolderCount: 0, docCount: 0, sizeBytes: 0 };
  });
  const extras = [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }));
  return [...suggested, ...extras];
}

function stripSearch(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function sortSubfolders(list, sortKey) {
  const items = [...(list || [])];
  if (sortKey === "name_desc") return items.sort((a, b) => b.name.localeCompare(a.name, "es", { numeric: true }));
  if (sortKey === "size_desc") return items.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0) || a.name.localeCompare(b.name, "es", { numeric: true }));
  if (sortKey === "recent") return items.sort((a, b) => (b.docCount || 0) - (a.docCount || 0) || a.name.localeCompare(b.name, "es", { numeric: true }));
  return items.sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }));
}

function sortDocuments(list, sortKey) {
  const items = [...(list || [])];
  if (sortKey === "name_asc") return items.sort((a, b) => String(a.fileName || "").localeCompare(String(b.fileName || ""), "es", { numeric: true }));
  if (sortKey === "name_desc") return items.sort((a, b) => String(b.fileName || "").localeCompare(String(a.fileName || ""), "es", { numeric: true }));
  if (sortKey === "size_desc") return items.sort((a, b) => (Number(b.sizeBytes) || 0) - (Number(a.sizeBytes) || 0));
  return sortByRecent(items);
}

function renderCategoryRail(topFolders, ui, IC) {
  const showPerms = canManageFolderPermissions();
  const allFolders = readFolders();
  const cards = topFolders
    .map((f, i) => {
      const active = !ui.showTrash && ui.folderFilter && folderKey(topFolderName(ui.folderFilter)) === f.key;
      const count =
        f.subfolderCount > 0
          ? `${f.subfolderCount} carpeta${f.subfolderCount === 1 ? "" : "s"}`
          : `${f.docCount} archivo${f.docCount === 1 ? "" : "s"}`;
      const restricted = folderRoleAllowlist(allFolders, f.name, "view").length > 0;
      const permsBtn = showPerms
        ? `<button type="button" class="doc-cat-card__perms" data-action="doc-folder-perms" data-folder="${escapeAttr(f.name)}" aria-label="Permisos de ${escapeAttr(f.name)}" title="Permisos">${IC_LOCK}</button>`
        : "";
      return `<div class="doc-cat-card${active ? " is-active" : ""}${restricted ? " is-restricted" : ""}">
        <button type="button" class="doc-cat-card__open" data-action="doc-open-folder" data-folder="${escapeAttr(f.name)}">
          <span class="doc-cat-card__icon doc-cat-card__icon--${folderTone(i)}">${IC.folder || ""}</span>
          <span class="doc-cat-card__body">
            <span class="doc-cat-card__name">${escapeHtml(f.name)}</span>
            <span class="doc-cat-card__meta">${escapeHtml(count)}</span>
          </span>
        </button>
        ${permsBtn}
      </div>`;
    })
    .join("");
  return `<section class="doc-categories" aria-label="Carpetas principales">${cards}</section>`;
}

function renderExplorerPath(ui, IC) {
  if (ui.showTrash) {
    return `<div class="doc-explorer-path">
      <nav class="doc-breadcrumb" aria-label="Ruta">
        <button type="button" class="doc-crumb" data-action="doc-crumb" data-path="${escapeAttr(EMPLOYEES_ROOT_FOLDER)}">Documentos</button>
        <span class="doc-crumb-sep">›</span>
        <span class="doc-crumb is-current">Papelera</span>
      </nav>
      <button type="button" class="doc-trash-link is-active" data-action="doc-toggle-trash" aria-pressed="true">${IC_TRASH}<span>Papelera</span></button>
    </div>`;
  }
  const segs = ui.folderFilter ? folderSegments(ui.folderFilter) : [];
  const parts = [`<button type="button" class="doc-crumb" data-action="doc-crumb" data-path="">Documentos</button>`];
  const acc = [];
  segs.forEach((seg, i) => {
    acc.push(seg);
    const path = acc.join(" / ");
    parts.push(`<span class="doc-crumb-sep">›</span>`);
    if (i === segs.length - 1) parts.push(`<span class="doc-crumb is-current">${escapeHtml(seg)}</span>`);
    else parts.push(`<button type="button" class="doc-crumb" data-action="doc-crumb" data-path="${escapeAttr(path)}">${escapeHtml(seg)}</button>`);
  });
  const depth = segs.length;
  const folderActions =
    ui.folderFilter && canUpload()
      ? `<div class="doc-path-actions">
          ${
            depth >= 1
              ? `<button type="button" class="doc-btn doc-btn--ghost doc-btn--sm" data-action="doc-new-subfolder" data-parent="${escapeAttr(ui.folderFilter)}">${IC.plus || "+"}<span>Crear subcarpeta</span></button>`
              : ""
          }
          <button type="button" class="doc-btn doc-btn--ghost doc-btn--sm" data-action="doc-edit-folder" data-path="${escapeAttr(ui.folderFilter)}">${IC.edit || ""}<span>Renombrar</span></button>
          ${
            !SUGGESTED_COMPANY_FOLDERS.some((n) => folderKey(n) === folderKey(ui.folderFilter))
              ? `<button type="button" class="doc-btn doc-btn--ghost doc-btn--sm doc-btn--danger" data-action="doc-delete-folder" data-path="${escapeAttr(ui.folderFilter)}">${IC.trash || IC_TRASH}<span>Eliminar</span></button>`
              : ""
          }
          <button type="button" class="doc-trash-link" data-action="doc-toggle-trash" aria-pressed="false">${IC_TRASH}<span>Ver papelera</span></button>
        </div>`
      : `<button type="button" class="doc-trash-link" data-action="doc-toggle-trash" aria-pressed="false">${IC_TRASH}<span>Ver papelera</span></button>`;
  return `<div class="doc-explorer-path">
    <nav class="doc-breadcrumb" aria-label="Ruta de carpeta">${parts.join("")}</nav>
    ${folderActions}
  </div>`;
}

function renderExplorerToolbar(ui, IC) {
  const sortLabel = SORT_OPTIONS.find((o) => o.value === ui.sortKey)?.label || "Nombre (A-Z)";
  const sortOpts = SORT_OPTIONS.map(
    (o) => `<option value="${escapeAttr(o.value)}"${ui.sortKey === o.value ? " selected" : ""}>${escapeHtml(o.label)}</option>`
  ).join("");
  const typeOptions = TYPE_FILTERS.map(
    (t) => `<option value="${escapeAttr(t.value)}"${ui.typeFilter === t.value ? " selected" : ""}>${escapeHtml(t.label)}</option>`
  ).join("");
  return `<div class="doc-explorer-toolbar">
    <label class="doc-explorer-search">
      <span class="doc-explorer-search__icon">${IC.search || ""}</span>
      <input type="search" data-action="doc-search" placeholder="Buscar carpetas o documentos…" value="${escapeAttr(ui.search || "")}" aria-label="Buscar carpetas o documentos" />
    </label>
    <div class="doc-explorer-toolbar__actions">
      <button type="button" class="doc-btn doc-btn--ghost${ui.showFilters ? " is-active" : ""}" data-action="doc-toggle-filters" aria-pressed="${ui.showFilters ? "true" : "false"}">${IC.filter || ""}<span>Filtros</span></button>
      <label class="doc-sort-select" title="Ordenar">
        <span class="doc-sort-select__icon">${IC_SORT}</span>
        <span class="doc-sort-select__label">Ordenar por:</span>
        <select data-action="doc-sort" aria-label="Ordenar por">${sortOpts}</select>
      </label>
      <div class="doc-viewtoggle" role="group" aria-label="Vista">
        <button type="button" class="doc-viewtoggle__btn${ui.viewMode === "grid" ? " is-active" : ""}" data-action="doc-view" data-view-mode="grid" aria-label="Vista en cuadrícula" aria-pressed="${ui.viewMode === "grid" ? "true" : "false"}">${IC.grid || ""}</button>
        <button type="button" class="doc-viewtoggle__btn${ui.viewMode !== "grid" ? " is-active" : ""}" data-action="doc-view" data-view-mode="list" aria-label="Vista en lista" aria-pressed="${ui.viewMode !== "grid" ? "true" : "false"}">${IC.list || ""}</button>
      </div>
    </div>
    ${
      ui.showFilters
        ? `<div class="doc-filterbar doc-filterbar--inline">
      <label class="doc-select doc-select--labeled"><span>Tipo</span><select data-action="doc-type-filter" aria-label="Filtrar por tipo">${typeOptions}</select></label>
      <button type="button" class="doc-btn doc-btn--ghost doc-btn--sm" data-action="doc-clear-filters">Limpiar</button>
      <button type="button" class="doc-btn doc-btn--ghost doc-btn--sm" data-action="doc-export-csv">Exportar CSV</button>
      <span class="doc-filterbar__hint muted">Orden: ${escapeHtml(sortLabel)}</span>
    </div>`
        : ""
    }
  </div>`;
}

function folderTone(index) {
  return ["blue", "green", "violet", "amber", "cyan", "rose"][index % 6];
}

function renderSubfolderGrid(subfolders, ui, IC) {
  const parent = String(ui.folderFilter || "").trim();
  const depth = folderSegments(parent).length;
  const canManage = canUpload();
  /* Dentro de un colaborador (o cualquier carpeta anidada) siempre mostrar bloque de subcarpetas. */
  const showBlock = Boolean(parent) && (subfolders.length > 0 || depth >= 2);
  if (!showBlock) return "";

  const page = Math.max(1, Number(ui.folderPage) || 1);
  const visible = subfolders.slice(0, page * SUBFOLDER_PAGE_SIZE);
  const hasMore = visible.length < subfolders.length;
  const isList = ui.viewMode === "list";
  const head = `<div class="doc-subfolder-block__head">
    <h3 class="doc-subfolder-block__title">Subcarpetas</h3>
    ${
      canManage
        ? `<button type="button" class="doc-btn doc-btn--ghost doc-btn--sm" data-action="doc-new-subfolder" data-parent="${escapeAttr(parent)}">${IC.plus || "+"}<span>Crear subcarpeta</span></button>`
        : ""
    }
  </div>`;

  if (!subfolders.length) {
    return `<section class="doc-subfolder-block">
      ${head}
      <div class="doc-subfolder-empty">
        <p>No hay subcarpetas en este expediente.</p>
        ${
          canManage
            ? `<button type="button" class="doc-btn doc-btn--primary doc-btn--sm" data-action="doc-new-subfolder" data-parent="${escapeAttr(parent)}">${IC.plus || "+"}<span>Crear subcarpeta</span></button>`
            : ""
        }
      </div>
    </section>`;
  }

  const cards = visible
    .map((s) => {
      const countLabel = `${s.docCount} archivo${s.docCount === 1 ? "" : "s"}`;
      const menu = canManage
        ? `<details class="doc-folder-menu">
            <summary class="doc-iconbtn" aria-label="Acciones de carpeta">${IC_DOTS}</summary>
            <div class="doc-rowmenu__list">
              <button type="button" data-action="doc-edit-folder" data-path="${escapeAttr(s.path)}">${IC.edit || ""}<span>Renombrar</span></button>
              <button type="button" class="is-danger" data-action="doc-delete-folder" data-path="${escapeAttr(s.path)}">${IC.trash || IC_TRASH}<span>Eliminar</span></button>
            </div>
          </details>`
        : "";
      return `<div class="doc-subfolder-card">
        <button type="button" class="doc-subfolder-card__open" data-action="doc-open-subfolder" data-path="${escapeAttr(s.path)}" title="${escapeAttr(s.name)}">
          <span class="doc-subfolder-card__icon">${IC.folder || ""}</span>
          <span class="doc-subfolder-card__body">
            <span class="doc-subfolder-card__name">${escapeHtml(String(s.name || "").toUpperCase())}</span>
            <span class="doc-subfolder-card__meta">${escapeHtml(countLabel)}</span>
          </span>
        </button>
        ${menu}
      </div>`;
    })
    .join("");
  return `<section class="doc-subfolder-block">
    ${head}
    <div class="doc-subfolder-grid${isList ? " doc-subfolder-grid--list" : ""}">${cards}</div>
    ${
      hasMore
        ? `<button type="button" class="doc-more-folders" data-action="doc-more-folders">${IC_CHEVRON_DOWN}<span>Ver más carpetas</span></button>`
        : ""
    }
  </section>`;
}

function renderDocsEmpty(IC, { title, hint, showUpload = true } = {}) {
  const upload = showUpload && canUpload()
    ? `<button type="button" class="doc-btn doc-btn--primary" data-action="doc-upload">${IC.plus || "+"}<span>Subir documento</span></button>`
    : "";
  return `<div class="doc-empty doc-empty--panel">
    <div class="doc-empty__art" aria-hidden="true">${IC_EMPTY_FOLDER}</div>
    <p class="doc-empty__title">${escapeHtml(title || "No hay documentos que coincidan")}</p>
    <p class="doc-empty__hint">${escapeHtml(hint || "Ajuste la búsqueda o los filtros, o suba un nuevo documento.")}</p>
    ${upload}
  </div>`;
}

function typeBadge(doc) {
  const group = fileTypeGroup(doc.fileName, doc.mimeType);
  const label = fileTypeLabel(doc.fileName, doc.mimeType);
  return `<span class="doc-filetype doc-filetype--${group}">${escapeHtml(label.slice(0, 4))}</span>`;
}

function rowMenu(doc, IC, folders = []) {
  const items = [];
  if (canPreviewFileType(doc.fileName, doc.mimeType)) {
    items.push(`<button type="button" data-action="doc-preview" data-id="${escapeAttr(doc.id)}">${IC.eye || ""}<span>Vista previa</span></button>`);
  }
  items.push(`<button type="button" data-action="doc-download" data-id="${escapeAttr(doc.id)}">${IC.download || ""}<span>Descargar</span></button>`);
  if (canEditFolder(folders, doc.folder)) {
    items.push(`<button type="button" data-action="doc-edit" data-id="${escapeAttr(doc.id)}">${IC.edit || ""}<span>Editar / mover</span></button>`);
  }
  if (canDeleteFolder(folders, doc.folder)) {
    items.push(`<button type="button" class="is-danger" data-action="doc-delete" data-id="${escapeAttr(doc.id)}">${IC.trash || ""}<span>Eliminar</span></button>`);
  }
  return `<details class="doc-rowmenu"><summary class="doc-iconbtn" aria-label="Acciones">${IC_DOTS}</summary><div class="doc-rowmenu__list">${items.join("")}</div></details>`;
}

function categoryPill(doc) {
  const label = getCompanyDocumentCategoryLabel(doc.documentCategory || doc.tags);
  if (!label) return "";
  return `<span class="doc-category-pill">${escapeHtml(label)}</span>`;
}

function renderTable(pageDocs, IC, folders = []) {
  if (!pageDocs.length) return "";
  const rows = pageDocs
    .map(
      (d) => `<tr>
      <td class="doc-cell-name"><span class="doc-fileicon doc-fileicon--${fileTypeGroup(d.fileName, d.mimeType)}">${IC.file || ""}</span><span class="doc-cell-name__text" title="${escapeAttr(d.fileName)}">${escapeHtml(d.fileName)}</span></td>
      <td>${typeBadge(d)}</td>
      <td>${categoryPill(d) || `<span class="muted">—</span>`}</td>
      <td class="doc-cell-folder">${escapeHtml(d.folder)}</td>
      <td class="doc-cell-size">${escapeHtml(formatFileSize(d.sizeBytes))}</td>
      <td class="doc-cell-date">${escapeHtml(formatDate(d.updatedAt))}</td>
      <td class="doc-cell-actions">${rowMenu(d, IC, folders)}</td>
    </tr>`
    )
    .join("");
  return `<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>Nombre</th><th>Archivo</th><th>Tipo documental</th><th>Carpeta</th><th>Tamaño</th><th>Fecha de modificación</th><th aria-label="Acciones"></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderGrid(pageDocs, IC, folders = []) {
  if (!pageDocs.length) return "";
  const cards = pageDocs
    .map(
      (d) => `<article class="doc-card">
      <header class="doc-card__head"><span class="doc-fileicon doc-fileicon--${fileTypeGroup(d.fileName, d.mimeType)}">${IC.file || ""}</span>${rowMenu(d, IC, folders)}</header>
      <p class="doc-card__name" title="${escapeAttr(d.fileName)}">${escapeHtml(d.fileName)}</p>
      <p class="doc-card__folder">${escapeHtml(d.folder)}</p>
      ${categoryPill(d)}
      <footer class="doc-card__foot"><span>${escapeHtml(formatFileSize(d.sizeBytes))}</span><span>${escapeHtml(formatDateShort(d.updatedAt))}</span></footer>
    </article>`
    )
    .join("");
  return `<div class="doc-grid">${cards}</div>`;
}

function renderPagination(totalItems, page) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  if (totalItems === 0) return "";
  if (totalPages <= 1) {
    return `<div class="doc-listfoot"><span class="doc-count">${totalItems} documento${totalItems === 1 ? "" : "s"}</span></div>`;
  }
  const current = Math.min(Math.max(1, page), totalPages);
  let pages = "";
  for (let p = 1; p <= totalPages; p += 1) {
    pages += `<button type="button" class="doc-page${p === current ? " is-active" : ""}" data-action="doc-page" data-page="${p}">${p}</button>`;
  }
  return `<div class="doc-listfoot">
    <span class="doc-count">${totalItems} documento${totalItems === 1 ? "" : "s"}</span>
    <nav class="doc-pager" aria-label="Paginación">
      <button type="button" class="doc-page doc-page--nav" data-action="doc-page" data-page="${current - 1}"${current === 1 ? " disabled" : ""}>‹</button>
      ${pages}
      <button type="button" class="doc-page doc-page--nav" data-action="doc-page" data-page="${current + 1}"${current === totalPages ? " disabled" : ""}>›</button>
    </nav>
  </div>`;
}

function renderStorageCard(summary, IC) {
  const pct = summary.usedPercent;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  return `<article class="doc-side-card doc-storage-card">
    <h3 class="doc-side-card__title">Almacenamiento</h3>
    <div class="doc-storage">
      <div class="doc-donut" role="img" aria-label="${pct}% de almacenamiento utilizado">
        <svg viewBox="0 0 120 120">
          <circle class="doc-donut__track" cx="60" cy="60" r="${radius}" />
          <circle class="doc-donut__value" cx="60" cy="60" r="${radius}" stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" transform="rotate(-90 60 60)" />
        </svg>
        <span class="doc-donut__label">${pct}%</span>
      </div>
      <div class="doc-storage__meta">
        <strong>${escapeHtml(formatFileSize(summary.totalBytes))} <span>utilizados</span></strong>
        <span class="doc-storage__quota">De ${escapeHtml(formatFileSize(summary.quotaBytes))}</span>
      </div>
    </div>
    <button type="button" class="doc-link doc-link--row" data-action="doc-storage-details">Ver detalles de almacenamiento ${IC.chevronRight || "›"}</button>
  </article>`;
}

function renderRecentSidebar(recentDocs, IC, folders = []) {
  const items = recentDocs.length
    ? recentDocs
        .map((d) => {
          const canRemove = isDocManager() || canDeleteFolder(folders, d.folder);
          const delBtn = canRemove
            ? `<button type="button" class="doc-recent-item__delete" data-action="doc-delete" data-id="${escapeAttr(d.id)}" aria-label="Eliminar ${escapeAttr(d.fileName)}" title="Eliminar">${IC.trash || IC_TRASH}</button>`
            : "";
          return `<li class="doc-recent-item">
        <button type="button" class="doc-recent-item__open" data-action="doc-recent-open" data-id="${escapeAttr(d.id)}">
          <span class="doc-fileicon doc-fileicon--${fileTypeGroup(d.fileName, d.mimeType)}">${IC.file || ""}</span>
          <span class="doc-recent-item__body">
            <span class="doc-recent-item__name" title="${escapeAttr(d.fileName)}">${escapeHtml(d.fileName)}</span>
            <span class="doc-recent-item__date">${escapeHtml(formatDate(d.updatedAt))}</span>
          </span>
        </button>
        ${delBtn}
      </li>`;
        })
        .join("")
    : `<li class="doc-recent-empty">Sin documentos recientes.</li>`;
  return `<article class="doc-side-card">
    <h3 class="doc-side-card__title">Documentos recientes</h3>
    <ul class="doc-recent-list">${items}</ul>
    <button type="button" class="doc-link doc-link--row" data-action="doc-storage-details">Ver almacenamiento ${IC.chevronRight || "›"}</button>
  </article>`;
}

function renderOnboarding(IC) {
  const actions = canUpload()
    ? `<div class="doc-onboarding__actions">
        <button type="button" class="doc-btn doc-btn--primary" data-action="doc-upload">${IC.upload || ""}<span>Subir documento</span></button>
      </div>`
    : `<p class="doc-onboarding__hint">Aún no hay documentos. Pida acceso de carga para empezar.</p>`;
  return `<section class="doc-onboarding">
    <span class="doc-onboarding__icon">${IC.folder || ""}</span>
    <h2 class="doc-onboarding__title">Comienza tu gestor documental</h2>
    <p class="doc-onboarding__text">Las carpetas base (Empleados, Contratación, SST, Legal, Finanzas) y una carpeta por colaborador se crean automáticamente. Sube el primer documento para empezar.</p>
    ${actions}
  </section>`;
}

function documentManagementHtml() {
  const IC = G.IC || {};
  if (!canView()) {
    return `<section class="documents-studio doc-studio"><div class="doc-empty"><p class="doc-empty__title">No tiene permiso para consultar la gestión documental.</p></div></section>`;
  }
  const ui = getUi();
  const allFolders = readFolders();
  const docs = visibleDocs(readDocs(), allFolders);
  const folders = visibleFolders(allFolders);
  const summary = summarizeCompanyDocuments(docs, folders, usersWithAccessCount());
  const topFolders = mergeSuggestedTopFolders(collectTopFolders(docs, folders));

  if (!ui.showTrash && !ui.folderFilter && topFolders.length) {
    ui.folderFilter = topFolders[0].name;
  }

  if (ui.showTrash) {
    return `<section class="documents-studio doc-studio doc-studio--explorer">
      ${renderHeader(ui, IC)}
      ${renderCategoryRail(topFolders, ui, IC)}
      <div class="doc-explorer">
        ${renderExplorerPath(ui, IC)}
        ${renderExplorerToolbar(ui, IC)}
        ${renderDocsEmpty(IC, {
          title: "La papelera está vacía",
          hint: "Los documentos eliminados no se conservan en papelera por ahora. La eliminación es definitiva tras confirmar.",
          showUpload: false
        })}
      </div>
    </section>`;
  }

  const q = stripSearch(ui.search);
  let subfolders = ui.folderFilter ? collectSubfolders(docs, folders, ui.folderFilter) : [];
  if (q) subfolders = subfolders.filter((s) => stripSearch(s.name).includes(q) || stripSearch(s.path).includes(q));
  subfolders = sortSubfolders(subfolders, ui.sortKey);

  const filtered = sortDocuments(
    applyCompanyDocumentFilters(docs, {
      search: ui.search,
      type: ui.typeFilter,
      folder: ui.folderFilter
    }),
    ui.sortKey
  );
  /*
   * Si hay subcarpetas: mostrar docs de la carpeta actual + descendientes cuando el
   * usuario busca, o solo los de la ruta exacta si no. En hojas (sin subcarpetas)
   * siempre mostrar elSubtree completo (incluye la carpeta actual).
   */
  const depth = folderSegments(ui.folderFilter || "").length;
  const listDocs =
    subfolders.length && !q && depth <= 1
      ? filtered.filter((d) => folderKey(d.folder) === folderKey(ui.folderFilter))
      : filtered;

  const totalPages = Math.max(1, Math.ceil(listDocs.length / PAGE_SIZE));
  if (ui.page > totalPages) ui.page = totalPages;
  if (ui.page < 1) ui.page = 1;
  const pageDocs = listDocs.slice((ui.page - 1) * PAGE_SIZE, ui.page * PAGE_SIZE);
  const recent = sortByRecent(docs).slice(0, RECENT_SIDEBAR_COUNT);
  const isBootstrapEmpty = docs.length === 0 && folders.length === 0;

  if (isBootstrapEmpty) {
    return `<section class="documents-studio doc-studio">
      ${renderHeader(ui, IC)}
      ${renderOnboarding(IC)}
    </section>`;
  }

  const listBody = listDocs.length
    ? ui.viewMode === "grid"
      ? renderGrid(pageDocs, IC, folders)
      : renderTable(pageDocs, IC, folders)
    : subfolders.length
      ? `<div class="doc-docs-hint"><p>Abra una carpeta para ver o subir documentos.</p>${
          canUpload()
            ? `<button type="button" class="doc-btn doc-btn--primary" data-action="doc-upload">${IC.plus || "+"}<span>Subir documento</span></button>`
            : ""
        }</div>`
      : renderDocsEmpty(IC);

  return `<section class="documents-studio doc-studio doc-studio--explorer">
    ${renderHeader(ui, IC)}
    ${renderKpis(summary, IC)}
    ${renderCategoryRail(topFolders, ui, IC)}
    <div class="doc-layout">
      <div class="doc-main">
        <div class="doc-explorer">
          ${renderExplorerPath(ui, IC)}
          ${renderExplorerToolbar(ui, IC)}
          ${renderSubfolderGrid(subfolders, ui, IC)}
          <section class="doc-docs-panel" aria-label="Documentos">
            ${listBody}
            ${renderPagination(listDocs.length, ui.page)}
          </section>
        </div>
      </div>
      <aside class="doc-side" aria-label="Resumen y recientes">
        ${renderStorageCard(summary, IC)}
        ${renderRecentSidebar(recent, IC, folders)}
      </aside>
    </div>
  </section>`;
}

async function uploadFileToR2(file, folder) {
  const api = window.AntaresApi;
  if (!api?.postFormData) throw new Error("API no disponible.");
  const check = await validateUploadFile(file, "document");
  if (!check.ok) throw new Error(check.message || "Archivo no permitido.");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await api.postFormData("/uploads/company-document", fd);
  if (!res?.key) throw new Error("No se obtuvo la clave de almacenamiento.");
  return res;
}

function fmtCop(n) {
  return `$${Number(n || 0).toLocaleString("es-CO")}`;
}

/** PDF corto del comprobante de pago (jsPDF) para archivar en el DMS. */
async function buildPayrollComprobantePdfBlob(run) {
  const JsPDF = await ensureJsPdfLoaded();
  const doc = new JsPDF({ unit: "pt", format: "letter" });
  const typeLabel = payrollRunTypeLabel(run);
  const name = String(run.employeeName || "Colaborador").trim();
  const period = String(run.month || "—").trim();
  let y = 48;
  const line = (text, size = 11, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(String(text || ""), 48, y);
    y += size + 8;
  };
  line("TRANSPORTES ANTARES", 14, true);
  line("Comprobante oficial de pago", 16, true);
  y += 6;
  line(`Trabajador: ${name}`, 11, true);
  line(`Período: ${period}`);
  line(`Tipo: ${typeLabel}`);
  line(`Estado: ${run.paid ? "Pagado" : "Pendiente de pago"}`);
  y += 8;
  line("Resumen", 12, true);
  line(`Devengado / bruto: ${fmtCop(run.gross)}`);
  if (Number(run.aux) > 0) line(`Auxilio de transporte: ${fmtCop(run.aux)}`);
  if (Number(run.extras) > 0) line(`Extras / horas extras: ${fmtCop(run.extras)}`);
  if (Number(run.travelAllowance) > 0) line(`Viáticos: ${fmtCop(run.travelAllowance)}`);
  if (Number(run.fuelReimbursement) > 0) line(`Combustible: ${fmtCop(run.fuelReimbursement)}`);
  if (Number(run.primaServiciosCop) > 0) line(`Prima de servicios: ${fmtCop(run.primaServiciosCop)}`);
  if (Number(run.interesesCesantiasCop) > 0) line(`Intereses de cesantías: ${fmtCop(run.interesesCesantiasCop)}`);
  y += 4;
  line(`Salud: ${fmtCop(run.health)}`);
  line(`Pensión: ${fmtCop(run.pension)}`);
  if (Number(run.solidarity) > 0) line(`FSP / solidaridad: ${fmtCop(run.solidarity)}`);
  line(`Total deducciones: ${fmtCop(run.deductions)}`);
  y += 10;
  line(`Neto a pagar: ${fmtCop(run.net)}`, 13, true);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Documento generado automáticamente por Antares al registrar el pago.", 48, y);
  return doc.output("blob");
}

/**
 * Archiva el comprobante de una liquidación en `01. Empleados / Nombre`.
 * Idempotente por marcador `payrollRunId=` en la descripción.
 */
async function archivePayrollRunToEmployeeFolder(run) {
  if (!run?.id || !run.employeeId) return { ok: false, skipped: true };
  const runMarker = `payrollRunId=${String(run.id).trim()}`;
  if (readDocs().some((d) => String(d.description || "").includes(runMarker))) {
    return { ok: true, skipped: true };
  }
  const employee = {
    id: run.employeeId,
    name: run.employeeName || read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(run.employeeId))?.name
  };
  const folderRes = await ensureCompanyEmployeeDocumentFolder(employee);
  const folder = folderRes?.path || employeeCompanyFolderPath(employee);
  if (!folder) return { ok: false, message: "No se pudo resolver la carpeta del colaborador." };

  const typeLabel = payrollRunTypeLabel(run);
  const fileName = buildPayrollCompanyDocumentFileName(run, typeLabel);
  try {
    const blob = await buildPayrollComprobantePdfBlob(run);
    const file = new File([blob], fileName, { type: "application/pdf" });
    const uploaded = await uploadFileToR2(file, folder);
    const by = actor();
    const nowIso = new Date().toISOString();
    const record = normalizeCompanyDocumentRow({
      id: newUuidV4(),
      fileName: uploaded.fileName || fileName,
      type: "PDF",
      documentCategory: "comprobante_pago",
      folder: uploaded.folder || folder,
      mimeType: uploaded.mimeType || "application/pdf",
      sizeBytes: Number(uploaded.sizeBytes) || file.size || 0,
      storageKey: uploaded.key,
      description: `Comprobante de pago · ${typeLabel} · ${run.month || ""} · neto ${fmtCop(run.net)} · ${runMarker}`,
      tags: "comprobante_pago",
      uploadedBy: by,
      createdAt: nowIso,
      updatedAt: nowIso
    });
    await writeAwaitServerCreate(KEYS.companyDocuments, [...readDocs(), record], record);
    return { ok: true, created: true, path: folder, fileName: record.fileName, id: record.id };
  } catch (err) {
    devWarn("[companyDocuments] archivePayrollRun", err?.message || err);
    return { ok: false, message: String(err?.message || err) };
  }
}

/** ¿Ya existe un documento corporativo con este marcador de alta? */
function hasHireDocMarker(marker) {
  if (!marker) return false;
  return readDocs().some((d) => String(d.description || "").includes(marker));
}

/** Sube un blob al DMS en la carpeta del colaborador (idempotente por marcador). */
async function archiveBlobToEmployeeFolder({
  employee,
  blob,
  fileName,
  mimeType,
  documentCategory,
  marker,
  description
}) {
  if (!employee?.id || !blob || !fileName || !marker) return { ok: false, skipped: true };
  if (hasHireDocMarker(marker)) return { ok: true, skipped: true };
  const folderRes = await ensureCompanyEmployeeDocumentFolder(employee);
  const folder = folderRes?.path || employeeCompanyFolderPath(employee);
  if (!folder) return { ok: false, message: "No se pudo resolver la carpeta del colaborador." };
  try {
    const file = new File([blob], fileName, { type: mimeType || blob.type || "application/octet-stream" });
    const uploaded = await uploadFileToR2(file, folder);
    const by = actor();
    const nowIso = new Date().toISOString();
    const cat = String(documentCategory || "otro");
    const record = normalizeCompanyDocumentRow({
      id: newUuidV4(),
      fileName: uploaded.fileName || fileName,
      type: fileTypeLabel(uploaded.fileName || fileName, uploaded.mimeType || file.type),
      documentCategory: cat,
      folder: uploaded.folder || folder,
      mimeType: uploaded.mimeType || file.type || "application/octet-stream",
      sizeBytes: Number(uploaded.sizeBytes) || file.size || 0,
      storageKey: uploaded.key,
      description: `${String(description || fileName).trim()} · ${marker}`,
      tags: cat,
      uploadedBy: by,
      createdAt: nowIso,
      updatedAt: nowIso
    });
    await writeAwaitServerCreate(KEYS.companyDocuments, [...readDocs(), record], record);
    return { ok: true, created: true, id: record.id, path: folder, fileName: record.fileName };
  } catch (err) {
    devWarn("[companyDocuments] archiveBlob", err?.message || err);
    return { ok: false, message: String(err?.message || err) };
  }
}

async function buildContractBlobForEmployee(employee) {
  const buildBlob = window.RecruitmentDomain?.buildEmployeeContractDocxBlob;
  if (typeof buildBlob !== "function") return null;
  try {
    const payloadFn =
      typeof window.buildEmployeeContractDocxPayload === "function"
        ? window.buildEmployeeContractDocxPayload
        : buildEmployeeContractDocxPayload;
    const payload = payloadFn(employee, { contractTemplateKind: employee.contractTemplateKind });
    return await buildBlob(payload);
  } catch (err) {
    devWarn("[companyDocuments] buildContractBlob", err?.message || err);
    return null;
  }
}

async function archiveEmployeeContractToFolder(employee) {
  if (!employee?.id) return { ok: false, skipped: true };
  const marker = employeeHireDocumentMarker(employee.id, "contrato");
  if (hasHireDocMarker(marker)) return { ok: true, skipped: true };
  const built = await buildContractBlobForEmployee(employee);
  if (!built?.blob) return { ok: false, skipped: true, message: "No se pudo generar el contrato Word." };
  const fileName =
    buildEmployeeContractCompanyFileName(employee, built.kind) || built.fileName || "contrato.docx";
  return archiveBlobToEmployeeFolder({
    employee,
    blob: built.blob,
    fileName,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    documentCategory: "contrato",
    marker,
    description: `Contrato laboral · ${employee.name || ""} · ${built.kind || ""}`
  });
}

async function blobFromAvatarUrl(avatarUrl) {
  const src = String(avatarUrl || "").trim();
  if (!src) return null;
  try {
    if (src.startsWith("data:")) {
      const res = await fetch(src);
      const blob = await res.blob();
      if (!blob?.size) return null;
      const mime = blob.type || "image/jpeg";
      const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "jpg";
      return { blob, mimeType: mime, ext };
    }
    if (/^https?:\/\//i.test(src)) {
      const res = await fetch(src, { credentials: "omit", mode: "cors" });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob?.size) return null;
      const mime = blob.type || "image/jpeg";
      const fromUrl = (() => {
        try {
          const path = new URL(src).pathname;
          const m = /\.([a-z0-9]+)$/i.exec(path);
          return m ? m[1].toLowerCase() : "";
        } catch (_e) {
          return "";
        }
      })();
      const ext =
        fromUrl ||
        (mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "jpg");
      return { blob, mimeType: mime, ext };
    }
  } catch (err) {
    devWarn("[companyDocuments] blobFromAvatarUrl", err?.message || err);
  }
  return null;
}

async function archiveEmployeePhotoToFolder(employee) {
  if (!employee?.id) return { ok: false, skipped: true };
  const marker = employeeHireDocumentMarker(employee.id, "foto");
  if (hasHireDocMarker(marker)) return { ok: true, skipped: true };
  const avatarUrl = String(employee.avatarUrl || employee.photoUrl || "").trim();
  if (!avatarUrl) return { ok: false, skipped: true };
  const packed = await blobFromAvatarUrl(avatarUrl);
  if (!packed?.blob) return { ok: false, skipped: true, message: "No se pudo leer la foto." };
  const fileName = buildEmployeePhotoCompanyFileName(employee, packed.ext);
  return archiveBlobToEmployeeFolder({
    employee,
    blob: packed.blob,
    fileName,
    mimeType: packed.mimeType,
    documentCategory: "foto",
    marker,
    description: `Foto del colaborador · ${employee.name || ""}`
  });
}

async function archiveEmployeeCandidateCvToFolder(employee, candidateId) {
  const cid = String(candidateId || "").trim();
  if (!employee?.id || !cid) return { ok: false, skipped: true };
  const marker = employeeHireDocumentMarker(employee.id, "cv");
  if (hasHireDocMarker(marker)) return { ok: true, skipped: true };
  const fetchCv =
    typeof window.fetchCandidateCvBlobFromApi === "function" ? window.fetchCandidateCvBlobFromApi : null;
  if (!fetchCv) return { ok: false, skipped: true };
  try {
    const packed = await fetchCv(cid);
    if (!packed?.blob?.size) return { ok: false, skipped: true };
    const rawName = String(packed.fileName || "hoja-de-vida.pdf").replace(/[\\/]+/g, "_");
    const fileName = rawName.toLowerCase().includes("hoja") ? rawName : `Hoja de vida · ${rawName}`;
    const mime = packed.blob.type || "application/pdf";
    return archiveBlobToEmployeeFolder({
      employee,
      blob: packed.blob,
      fileName,
      mimeType: mime,
      documentCategory: "hoja_vida",
      marker,
      description: `Hoja de vida (candidato) · ${employee.name || ""}`
    });
  } catch (err) {
    devWarn("[companyDocuments] archiveCandidateCv", err?.message || err);
    return { ok: false, message: String(err?.message || err) };
  }
}

async function downloadEmployeeDocumentBlob(doc) {
  const storageKey = String(doc?.storageKey || "").trim();
  const employeeId = String(doc?.employeeId || "").trim();
  if (!storageKey || !employeeId) return null;
  const api = window.AntaresApi;
  if (!api?.postJson) return null;
  try {
    const res = await api.postJson("/uploads/employee-document/download", { storageKey, employeeId });
    const url = String(res?.downloadUrl || "").trim();
    if (!url) return null;
    const fileRes = await fetch(url);
    if (!fileRes.ok) return null;
    const blob = await fileRes.blob();
    if (!blob?.size) return null;
    return blob;
  } catch (err) {
    devWarn("[companyDocuments] downloadEmployeeDocumentBlob", err?.message || err);
    return null;
  }
}

/** Copia documentos del expediente legacy (employeeDocuments) a la carpeta DMS. */
async function archiveEmployeeLegacyDocsToFolder(employee) {
  if (!employee?.id || !KEYS.employeeDocuments) return { ok: true, created: 0 };
  const legacy = read(KEYS.employeeDocuments, [])
    .map(normalizeEmployeeDocumentRow)
    .filter((d) => d && String(d.employeeId) === String(employee.id) && d.storageKey);
  let created = 0;
  for (const doc of legacy) {
    const marker = employeeHireDocumentMarker(employee.id, `empDoc:${doc.id}`);
    if (hasHireDocMarker(marker)) continue;
    const blob = await downloadEmployeeDocumentBlob(doc);
    if (!blob) continue;
    const cat = mapEmployeeDocumentTypeToCompanyCategory(doc.documentType);
    const fileName = String(doc.fileName || `${cat || "documento"}.bin`).replace(/[\\/]+/g, "_");
    const res = await archiveBlobToEmployeeFolder({
      employee,
      blob,
      fileName,
      mimeType: doc.mimeType || blob.type || "application/octet-stream",
      documentCategory: cat,
      marker,
      description: `Expediente · ${doc.documentType || cat} · ${employee.name || ""}`
    });
    if (res?.created) created += 1;
  }
  return { ok: true, created };
}

/**
 * Archiva en Gestión documental: contrato Word, foto, CV de candidato y docs del expediente.
 * Idempotente. No bloquea el alta si falla.
 */
async function archiveEmployeeHirePackageToFolder(employee, opts = {}) {
  if (!employee?.id) return { ok: false, skipped: true };
  const results = { contract: null, photo: null, cv: null, legacy: null };
  try {
    results.contract = await archiveEmployeeContractToFolder(employee);
  } catch (err) {
    results.contract = { ok: false, message: String(err?.message || err) };
  }
  try {
    results.photo = await archiveEmployeePhotoToFolder(employee);
  } catch (err) {
    results.photo = { ok: false, message: String(err?.message || err) };
  }
  if (opts.candidateId || opts.includeCv !== false) {
    try {
      results.cv = await archiveEmployeeCandidateCvToFolder(employee, opts.candidateId);
    } catch (err) {
      results.cv = { ok: false, message: String(err?.message || err) };
    }
  }
  if (opts.includeLegacyDocs !== false) {
    try {
      results.legacy = await archiveEmployeeLegacyDocsToFolder(employee);
    } catch (err) {
      results.legacy = { ok: false, message: String(err?.message || err) };
    }
  }
  const created =
    Number(!!results.contract?.created) +
    Number(!!results.photo?.created) +
    Number(!!results.cv?.created) +
    Number(results.legacy?.created || 0);
  return { ok: true, created, results };
}

const HIRE_DOCS_BACKFILL_BATCH = 4;
const hireDocsBackfillAttempted = new Set();

/** Rellena contrato/foto/docs faltantes para empleados ya existentes (lotes al abrir el DMS). */
async function backfillEmployeeHireDocuments() {
  if (!canUpload()) return { created: 0 };
  const employees = read(KEYS.payrollEmployees, []).filter((e) => e?.id && String(e.name || "").trim());
  const pending = employees.filter((emp) => {
    const id = String(emp.id);
    if (hireDocsBackfillAttempted.has(id)) return false;
    const needsContract = !hasHireDocMarker(employeeHireDocumentMarker(id, "contrato"));
    const needsPhoto =
      Boolean(String(emp.avatarUrl || emp.photoUrl || "").trim()) &&
      !hasHireDocMarker(employeeHireDocumentMarker(id, "foto"));
    return needsContract || needsPhoto;
  });
  let created = 0;
  for (const emp of pending.slice(0, HIRE_DOCS_BACKFILL_BATCH)) {
    hireDocsBackfillAttempted.add(String(emp.id));
    const res = await archiveEmployeeHirePackageToFolder(emp, { includeCv: false, includeLegacyDocs: true });
    created += Number(res?.created || 0);
  }
  return { created, pending: Math.max(0, pending.length - HIRE_DOCS_BACKFILL_BATCH) };
}

if (typeof window !== "undefined") {
  window.archivePayrollRunToEmployeeFolder = archivePayrollRunToEmployeeFolder;
  window.archiveEmployeeHirePackageToFolder = archiveEmployeeHirePackageToFolder;
  window.archiveEmployeeContractToFolder = archiveEmployeeContractToFolder;
  window.archiveEmployeePhotoToFolder = archiveEmployeePhotoToFolder;
}

function folderOptionsHtml(selectedPath) {
  const folders = readFolders();
  let paths = collectAllFolderPaths(readDocs(), folders).filter((p) => canUploadFolder(folders, p));
  const sel = normalizeCompanyFolder(selectedPath || paths[0] || EMPLOYEES_ROOT_FOLDER);
  if (sel && !paths.some((p) => folderKey(p) === folderKey(sel))) paths = [sel, ...paths];
  if (!paths.length) paths.push(sel || DEFAULT_COMPANY_FOLDER);
  return paths
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }))
    .map((p) => ({ value: p, label: p, selected: folderKey(p) === folderKey(sel) }));
}

function wireDropzone(formEl) {
  if (!formEl) return;
  const area = formEl.querySelector("#doc-dropzone-area");
  const input = formEl.querySelector("#doc-file-input");
  const list = formEl.querySelector("#doc-file-list");
  if (!area || !input || !list) return;
  const renderList = () => {
    list.innerHTML = [...input.files]
      .map((f, i) => {
        const over = f.size > COMPANY_DOCUMENT_MAX_BYTES;
        return `<li class="doc-dropzone__item${over ? " is-over" : ""}">
          <span class="doc-dropzone__fname" title="${escapeAttr(f.name)}">${escapeHtml(f.name)}</span>
          <span class="doc-dropzone__fsize">${escapeHtml(formatFileSize(f.size))}${over ? " · excede el máximo" : ""}</span>
          <button type="button" class="doc-dropzone__remove" data-i="${i}" aria-label="Quitar">×</button>
        </li>`;
      })
      .join("");
    list.querySelectorAll(".doc-dropzone__remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.i, 10);
        const dt = new DataTransfer();
        [...input.files].forEach((f, i) => {
          if (i !== idx) dt.items.add(f);
        });
        input.files = dt.files;
        renderList();
      });
    });
  };
  const addFiles = (incoming) => {
    if (!incoming?.length) return;
    const dt = new DataTransfer();
    [...input.files, ...incoming].forEach((f) => dt.items.add(f));
    input.files = dt.files;
    renderList();
  };
  area.addEventListener("click", (e) => {
    if (e.target !== input) input.click();
  });
  area.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      input.click();
    }
  });
  ["dragenter", "dragover"].forEach((ev) =>
    area.addEventListener(ev, (e) => {
      e.preventDefault();
      area.classList.add("is-drag");
    })
  );
  ["dragleave", "dragend"].forEach((ev) => area.addEventListener(ev, () => area.classList.remove("is-drag")));
  area.addEventListener("drop", (e) => {
    e.preventDefault();
    area.classList.remove("is-drag");
    addFiles([...(e.dataTransfer?.files || [])]);
  });
  input.addEventListener("change", () => renderList());
}

async function ensureFolderRecord(folderPath, by) {
  const folder = normalizeCompanyFolder(folderPath);
  if (!folder || folderKey(folder) === folderKey(DEFAULT_COMPANY_FOLDER)) return;
  const folders = readFolders();
  if (folders.some((f) => folderKey(f.folderName) === folderKey(folder))) return;
  if (readDocs().some((d) => folderKey(d.folder) === folderKey(folder))) return;
  const record = normalizeCompanyFolderRow({
    id: newUuidV4(),
    folderName: folder,
    createdBy: by || actor(),
    createdAt: new Date().toISOString()
  });
  try {
    await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...folders, record], record);
  } catch (err) {
    devWarn("[companyDocuments] ensureFolderRecord", err?.message || err);
  }
}

/** Evita carreras si varios usuarios / re-renders disparan el ensure a la vez. */
let ensureStructurePromise = null;

/**
 * Crea en silencio las carpetas base + una por empleado si faltan.
 * Idempotente: si ya existen, no hace nada. Seguro con varios usuarios concurrentes
 * (índice único en BD + skip local por nombre).
 */
async function ensureCompanyDocumentStructure() {
  if (!canUpload()) return { created: 0 };
  if (ensureStructurePromise) return ensureStructurePromise;
  ensureStructurePromise = (async () => {
    const by = actor();
    let list = readFolders();
    let created = 0;

    for (const name of SUGGESTED_COMPANY_FOLDERS) {
      if (list.some((f) => folderKey(f.folderName) === folderKey(name))) continue;
      const record = normalizeCompanyFolderRow({
        id: newUuidV4(),
        folderName: name,
        description: name === EMPLOYEES_ROOT_FOLDER ? "Expedientes por colaborador" : "",
        createdBy: by,
        createdAt: new Date().toISOString()
      });
      try {
        await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...list, record], record);
        list = [...list, record];
        created += 1;
      } catch (err) {
        /* Otro usuario pudo crearla al mismo tiempo: relee y sigue. */
        devWarn("[companyDocuments] ensureStructure", err?.message || err);
        list = readFolders();
      }
    }

    list = readFolders();
    const employees = read(KEYS.payrollEmployees, []).filter((e) => e && String(e.name || "").trim());
    for (const path of listMissingEmployeeFolderPaths(employees, list)) {
      if (list.some((f) => folderKey(f.folderName) === folderKey(path))) continue;
      const record = normalizeCompanyFolderRow({
        id: newUuidV4(),
        folderName: path,
        description: `Expediente documental de ${folderLeafName(path)}`,
        createdBy: by,
        createdAt: new Date().toISOString()
      });
      try {
        await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...list, record], record);
        list = [...list, record];
        created += 1;
      } catch (err) {
        devWarn("[companyDocuments] ensureStructure.employee", err?.message || err);
        list = readFolders();
      }
    }
    /* Empleados existentes: archiva contrato, foto y docs de alta faltantes. */
    try {
      const backfill = await backfillEmployeeHireDocuments();
      created += Number(backfill?.created || 0);
    } catch (err) {
      devWarn("[companyDocuments] ensureStructure.backfillHireDocs", err?.message || err);
    }
    return { created };
  })().finally(() => {
    ensureStructurePromise = null;
  });
  return ensureStructurePromise;
}

function documentCategoryOptionsHtml(selected = "otro") {
  const sel = String(selected || "otro");
  return COMPANY_DOCUMENT_CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
    selected: c.value === sel
  }));
}

function openUploadModal() {
  if (!canUpload()) return;
  const currentFolder = normalizeCompanyFolder(getUi().folderFilter || EMPLOYEES_ROOT_FOLDER);
  const lockDestination = folderSegments(currentFolder).length >= 2;
  const folderOpts = folderOptionsHtml(currentFolder);
  const categoryOpts = documentCategoryOptionsHtml("otro");
  const categoryChips = COMPANY_DOCUMENT_CATEGORIES.map(
    (c) =>
      `<button type="button" class="doc-upload-chip${c.value === "otro" ? " is-selected" : ""}" data-doc-cat="${escapeAttr(c.value)}" aria-pressed="${c.value === "otro" ? "true" : "false"}">${escapeHtml(c.label)}</button>`
  ).join("");
  const destinationSection = lockDestination
    ? `<section class="doc-upload-modal__section">
        <header class="doc-upload-modal__head">
          <span class="doc-upload-modal__step">2</span>
          <div>
            <h4 class="doc-upload-modal__title">Destino</h4>
            <p class="doc-upload-modal__hint">Se guardará en la carpeta abierta</p>
          </div>
        </header>
        <input type="hidden" name="folderExisting" value="${escapeAttr(currentFolder)}" />
        <div class="doc-upload-destination" role="status">
          <span class="doc-upload-destination__icon">${(G.IC || {}).folder || ""}</span>
          <div>
            <strong>Carpeta actual</strong>
            <p>${escapeHtml(currentFolder)}</p>
          </div>
        </div>
      </section>`
    : `<section class="doc-upload-modal__section">
        <header class="doc-upload-modal__head">
          <span class="doc-upload-modal__step">2</span>
          <div>
            <h4 class="doc-upload-modal__title">Destino</h4>
            <p class="doc-upload-modal__hint">Carpeta donde se guardará el archivo</p>
          </div>
        </header>
        <label class="doc-upload-modal__select-wrap">
          <span>Carpeta</span>
          <select name="folderExisting" required>
            ${folderOpts.map((o) => `<option value="${escapeAttr(o.value)}"${o.selected ? " selected" : ""}>${escapeHtml(o.label)}</option>`).join("")}
          </select>
        </label>
        <label class="doc-upload-modal__select-wrap">
          <span>Carpeta nueva (opcional)</span>
          <input type="text" name="folderNew" placeholder="Ej. 01. Empleados / Manuales" maxlength="200" />
          <small>Si la completa, reemplaza la carpeta seleccionada. Use “ / ” para subcarpetas.</small>
        </label>
      </section>`;
  G.openEditModal?.({
    title: "Subir documento",
    subtitle: lockDestination
      ? `El archivo se subirá a: ${currentFolder}`
      : "Indique el tipo documental, la carpeta destino y adjunte los archivos.",
    submitText: "Subir documento",
    fields: [
      {
        type: "custom",
        id: "doc-upload-shell",
        html: `<div class="doc-upload-modal">
          <section class="doc-upload-modal__section">
            <header class="doc-upload-modal__head">
              <span class="doc-upload-modal__step">1</span>
              <div>
                <h4 class="doc-upload-modal__title">Tipo de documento</h4>
                <p class="doc-upload-modal__hint">Seleccione qué está cargando al expediente</p>
              </div>
            </header>
            <input type="hidden" name="documentCategory" value="otro" data-doc-category-input />
            <div class="doc-upload-chips" data-doc-category-chips>${categoryChips}</div>
            <label class="doc-upload-modal__select-wrap">
              <span>O elija de la lista</span>
              <select name="documentCategorySelect" data-doc-category-select aria-label="Tipo de documento">
                ${categoryOpts.map((o) => `<option value="${escapeAttr(o.value)}"${o.selected ? " selected" : ""}>${escapeHtml(o.label)}</option>`).join("")}
              </select>
            </label>
          </section>
          ${destinationSection}
          <section class="doc-upload-modal__section">
            <header class="doc-upload-modal__head">
              <span class="doc-upload-modal__step">3</span>
              <div>
                <h4 class="doc-upload-modal__title">Archivos</h4>
                <p class="doc-upload-modal__hint">PDF, Office, texto, ZIP o imagen · máx. ${escapeHtml(formatFileSize(COMPANY_DOCUMENT_MAX_BYTES))} c/u</p>
              </div>
            </header>
            <div class="doc-dropzone" id="doc-dropzone-area" tabindex="0" role="button" aria-label="Seleccionar o soltar archivos">
              <span class="doc-dropzone__icon">${IC_UPLOAD_BIG}</span>
              <p class="doc-dropzone__title">Arrastre archivos aquí o haga clic</p>
              <p class="doc-dropzone__hint">Puede seleccionar varios archivos a la vez</p>
              <input type="file" id="doc-file-input" name="file" multiple accept="${SAFE_DOCUMENT_ACCEPT}" class="doc-dropzone__input" />
            </div>
            <ul class="doc-dropzone__list" id="doc-file-list"></ul>
          </section>
          <label class="doc-upload-modal__select-wrap">
            <span>Observaciones (opcional)</span>
            <textarea name="description" rows="2" maxlength="2000" placeholder="Notas internas"></textarea>
          </label>
        </div>`
      }
    ],
    afterMount: (formEl) => {
      wireDropzone(formEl);
      const hidden = formEl?.querySelector("[data-doc-category-input]");
      const select = formEl?.querySelector("[data-doc-category-select]");
      const chips = formEl?.querySelectorAll("[data-doc-cat]");
      const sync = (value) => {
        const v = String(value || "otro");
        if (hidden) hidden.value = v;
        if (select) select.value = v;
        chips?.forEach((btn) => {
          const on = btn.dataset.docCat === v;
          btn.classList.toggle("is-selected", on);
          btn.setAttribute("aria-pressed", on ? "true" : "false");
        });
      };
      chips?.forEach((btn) => btn.addEventListener("click", () => sync(btn.dataset.docCat)));
      select?.addEventListener("change", () => sync(select.value));
    },
    onSubmit: async (form, formEl) => {
      const input = formEl?.querySelector("#doc-file-input");
      const files = input?.files ? [...input.files] : [];
      if (!files.length) {
        G.failPortalField?.(formEl, "file", "Adjunte al menos un archivo.");
        return false;
      }
      const oversize = files.find((f) => f.size > COMPANY_DOCUMENT_MAX_BYTES);
      if (oversize) {
        G.notify?.(`"${oversize.name}" supera el tamaño máximo (${formatFileSize(COMPANY_DOCUMENT_MAX_BYTES)}).`, "error");
        return false;
      }
      for (const file of files) {
        const check = await validateUploadFile(file, "document");
        if (!check.ok) {
          G.notify?.(`"${file.name}": ${check.message}`, "error");
          return false;
        }
      }
      const documentCategory = String(
        form.documentCategory || formEl?.querySelector("[data-doc-category-input]")?.value || form.documentCategorySelect || "otro"
      ).trim() || "otro";
      /* Dentro del expediente del colaborador el destino queda fijado a la carpeta abierta. */
      const folder = normalizeCompanyFolder(
        lockDestination
          ? currentFolder
          : String(form.folderNew || "").trim() ||
              String(form.folderExisting || "").trim() ||
              currentFolder ||
              DEFAULT_COMPANY_FOLDER
      );
      if (!canUploadFolder(readFolders(), folder)) {
        G.notify?.("No tiene permiso para subir a esa carpeta.", "error");
        return false;
      }
      const description = String(form.description || "").trim();
      const by = actor();
      const categoryLabel = getCompanyDocumentCategoryLabel(documentCategory) || documentCategory;
      let ok = 0;
      for (const file of files) {
        try {
          const uploaded = await uploadFileToR2(file, folder);
          const nowIso = new Date().toISOString();
          const record = normalizeCompanyDocumentRow({
            id: newUuidV4(),
            fileName: uploaded.fileName || file.name,
            type: fileTypeLabel(uploaded.fileName || file.name, uploaded.mimeType || file.type),
            documentCategory,
            tags: documentCategory,
            folder: normalizeCompanyFolder(uploaded.folder || folder),
            mimeType: uploaded.mimeType || file.type || "application/octet-stream",
            sizeBytes: Number(uploaded.sizeBytes) || file.size || 0,
            storageKey: uploaded.key,
            description,
            uploadedBy: by,
            createdAt: nowIso,
            updatedAt: nowIso
          });
          await writeAwaitServerCreate(KEYS.companyDocuments, [...readDocs(), record], record);
          G.logPortalAuditEvent?.("documents", "create", {
            entityId: record.id,
            entityKind: "document",
            entityLabel: `${record.folder} · ${record.fileName}`,
            summary: `Alta de documento · ${categoryLabel} · ${record.fileName}`,
            usuario: by,
            actor: by,
            at: nowIso
          });
          ok += 1;
        } catch (err) {
          G.notify?.(`No se pudo subir "${file.name}": ${String(err?.message || err)}`, "error");
        }
      }
      if (ok > 0) {
        await ensureFolderRecord(folder, by);
        patchUi({ page: 1, folderFilter: folder, folderPage: 1, showTrash: false, search: "" });
        G.notify?.(
          ok === 1
            ? `${categoryLabel} registrado en la carpeta.`
            : `${ok} documentos (${categoryLabel}) registrados.`,
          "success"
        );
        G.renderPortalView?.();
        return true;
      }
      return false;
    }
  });
}

function parentFolderPath(path) {
  const segs = folderSegments(path);
  if (segs.length <= 1) return "";
  return segs.slice(0, -1).join(" / ");
}

function remapFolderPath(path, fromPath, toPath) {
  const pk = folderKey(path);
  const fk = folderKey(fromPath);
  if (pk === fk) return normalizeCompanyFolder(toPath);
  if (pk.startsWith(`${fk} / `)) {
    const rest = folderSegments(path).slice(folderSegments(fromPath).length).join(" / ");
    return normalizeCompanyFolder(`${toPath} / ${rest}`);
  }
  return path;
}

function openEditFolderModal(folderPathRaw) {
  if (!canUpload()) return;
  const path = normalizeCompanyFolder(folderPathRaw);
  if (!path) return;
  const leaf = folderLeafName(path);
  const parent = parentFolderPath(path);
  G.openEditModal?.({
    title: "Renombrar carpeta",
    subtitle: path,
    submitText: "Guardar",
    fields: [
      {
        name: "folderName",
        label: "Nombre de carpeta",
        required: true,
        value: leaf,
        hint: parent ? `Quedará dentro de: ${parent}` : "Carpeta de primer nivel."
      }
    ],
    onSubmit: async (form, formEl) => {
      const newLeaf = String(form.folderName || "")
        .replace(/[\\/]+/g, " ")
        .trim();
      if (!newLeaf) {
        G.failPortalField?.(formEl, "folderName", "Indique el nombre.");
        return false;
      }
      const newPath = normalizeCompanyFolder(parent ? `${parent} / ${newLeaf}` : newLeaf);
      if (folderKey(newPath) === folderKey(path)) return true;
      if (readFolders().some((f) => folderKey(f.folderName) === folderKey(newPath))) {
        G.notify?.("Ya existe una carpeta con ese nombre.", "error");
        return false;
      }
      try {
        const folders = readFolders();
        for (const row of folders.filter((f) => folderInSubtree(f.folderName, path))) {
          const updated = normalizeCompanyFolderRow({
            ...row,
            folderName: remapFolderPath(row.folderName, path, newPath)
          });
          const next = readFolders().map((f) => (f.id === row.id ? updated : f));
          await writeAwaitServerEdit(KEYS.companyDocumentFolders, next, row.id);
        }
        const docs = readDocs().filter((d) => folderInSubtree(d.folder, path));
        for (const doc of docs) {
          const updated = normalizeCompanyDocumentRow({
            ...doc,
            folder: remapFolderPath(doc.folder, path, newPath),
            updatedAt: new Date().toISOString()
          });
          const next = readDocs().map((d) => (d.id === doc.id ? updated : d));
          await writeAwaitServerEdit(KEYS.companyDocuments, next, doc.id);
        }
        patchUi({ folderFilter: newPath, page: 1, folderPage: 1 });
        G.notify?.("Carpeta renombrada.", "success");
        G.renderPortalView?.();
        return true;
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo renombrar."), "error");
        return false;
      }
    }
  });
}

function openDeleteFolderFlow(folderPathRaw) {
  if (!canUpload()) return;
  const path = normalizeCompanyFolder(folderPathRaw);
  if (!path) return;
  if (SUGGESTED_COMPANY_FOLDERS.some((n) => folderKey(n) === folderKey(path))) {
    G.notify?.("Las carpetas principales del sistema no se pueden eliminar.", "error");
    return;
  }
  const docs = readDocs().filter((d) => folderInSubtree(d.folder, path));
  const childFolders = readFolders().filter(
    (f) => folderKey(f.folderName) !== folderKey(path) && folderInSubtree(f.folderName, path)
  );
  const parent = parentFolderPath(path) || DEFAULT_COMPANY_FOLDER;
  const message =
    docs.length || childFolders.length
      ? `Se eliminará "${folderLeafName(path)}". ${docs.length} documento${docs.length === 1 ? "" : "s"} y ${childFolders.length} subcarpeta${childFolders.length === 1 ? "" : "s"} pasarán a “${parent}”.`
      : `Se eliminará la carpeta vacía "${folderLeafName(path)}".`;
  const requestDeletion = G.openConfirmReasonModal || G.openConfirmModal;
  requestDeletion?.({
    title: "Eliminar carpeta",
    message,
    confirmText: "Eliminar carpeta",
    onConfirm: async (motivo) => {
      try {
        for (const doc of docs) {
          const updated = normalizeCompanyDocumentRow({
            ...doc,
            folder: parent,
            updatedAt: new Date().toISOString()
          });
          const next = readDocs().map((d) => (d.id === doc.id ? updated : d));
          await writeAwaitServerEdit(KEYS.companyDocuments, next, doc.id);
        }
        const folders = readFolders().filter((f) => folderInSubtree(f.folderName, path));
        for (const row of folders) {
          if (folderKey(row.folderName) === folderKey(path)) {
            const ok = await G.removeFromPortalListAwaitServer?.(KEYS.companyDocumentFolders, row.id);
            if (!ok) {
              G.notify?.("No se pudo eliminar el registro de carpeta.", "error");
              return;
            }
          } else {
            const updated = normalizeCompanyFolderRow({
              ...row,
              folderName: remapFolderPath(row.folderName, path, parent)
            });
            const next = readFolders().map((f) => (f.id === row.id ? updated : f));
            await writeAwaitServerEdit(KEYS.companyDocumentFolders, next, row.id);
          }
        }
        G.logPortalAuditEvent?.("documents", "delete", {
          entityId: path,
          entityKind: "folder",
          entityLabel: `Carpeta · ${path}`,
          summary: `Eliminación de carpeta · ${path}${motivo ? ` · ${motivo}` : ""}`,
          usuario: actor(),
          actor: actor()
        });
        patchUi({ folderFilter: parent, page: 1, folderPage: 1 });
        G.notify?.("Carpeta eliminada.", "success");
        G.renderPortalView?.();
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo eliminar la carpeta."), "error");
      }
    }
  });
}

function openNewFolderModal(parentPathRaw = "") {
  if (!canUpload()) return;
  const parent = normalizeCompanyFolder(parentPathRaw || getUi().folderFilter || "");
  const isSubfolder = Boolean(parent) && folderSegments(parent).length >= 1;
  G.openEditModal?.({
    title: isSubfolder ? "Nueva subcarpeta" : "Nueva carpeta",
    subtitle: isSubfolder
      ? `Se creará dentro de: ${parent}`
      : "Organice los documentos corporativos por carpetas.",
    submitText: isSubfolder ? "Crear subcarpeta" : "Crear carpeta",
    fields: [
      {
        name: "folderName",
        label: isSubfolder ? "Nombre de la subcarpeta" : "Nombre de carpeta",
        required: true,
        placeholder: isSubfolder ? "Ej. Contratos 2026, Certificados médicos" : "Ej. 06. Calidad",
        hint: isSubfolder
          ? "Solo el nombre; se guardará dentro de la carpeta actual."
          : "Use “ / ” si desea indicar una ruta completa."
      },
      { name: "description", label: "Descripción", type: "textarea", rows: 2 }
    ],
    onSubmit: async (form, formEl) => {
      const leaf = String(form.folderName || "")
        .replace(/[\\/]+/g, " ")
        .trim();
      if (!leaf) {
        G.failPortalField?.(formEl, "folderName", "Indique el nombre de la carpeta.");
        return false;
      }
      const folderName = normalizeCompanyFolder(
        isSubfolder ? `${parent} / ${leaf}` : String(form.folderName || "").trim()
      );
      if (!folderName || folderKey(folderName) === folderKey(DEFAULT_COMPANY_FOLDER)) {
        G.failPortalField?.(formEl, "folderName", "Indique un nombre de carpeta.");
        return false;
      }
      const folders = readFolders();
      if (folders.some((f) => folderKey(f.folderName) === folderKey(folderName))) {
        G.notify?.("Esa carpeta ya existe.", "error");
        return false;
      }
      const by = actor();
      const record = normalizeCompanyFolderRow({
        id: newUuidV4(),
        folderName,
        description: String(form.description || "").trim(),
        createdBy: by,
        createdAt: new Date().toISOString()
      });
      try {
        await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...folders, record], record);
        G.notify?.(isSubfolder ? "Subcarpeta creada." : "Carpeta creada.", "success");
        patchUi({
          folderFilter: isSubfolder ? parent : folderName,
          page: 1,
          folderPage: 1,
          showTrash: false
        });
        G.renderPortalView?.();
        return true;
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo crear la carpeta."), "error");
        return false;
      }
    }
  });
}

function openFolderPermissionsModal(folderNameRaw) {
  if (!canManageFolderPermissions()) return;
  const topFolder = topFolderName(normalizeCompanyFolder(folderNameRaw));
  if (!topFolder) return;
  const folders = readFolders();
  const existing = folders.find((f) => folderKey(f.folderName) === folderKey(topFolder)) || null;
  const current = {
    view: (existing?.rolesView || []).slice(),
    upload: (existing?.rolesUpload || []).slice(),
    delete: (existing?.rolesDelete || []).slice()
  };
  const roleChoices = PORTAL_ASSIGNABLE_ROLES.filter((r) => r.value !== "admin");
  const actions = [
    { key: "view", label: "Ver" },
    { key: "upload", label: "Subir" },
    { key: "delete", label: "Eliminar" }
  ];
  const rows = roleChoices
    .map(
      (r) => `<tr>
        <th scope="row">${escapeHtml(r.label)}</th>
        ${actions
          .map((a) => {
            const checked = current[a.key].includes(r.value) ? " checked" : "";
            return `<td><label class="doc-perm-check"><input type="checkbox" data-perm data-act="${a.key}" data-role="${escapeAttr(r.value)}"${checked}/></label></td>`;
          })
          .join("")}
      </tr>`
    )
    .join("");
  G.openEditModal?.({
    title: `Permisos · ${topFolder}`,
    subtitle: "Defina qué roles pueden ver, subir o eliminar en esta carpeta y sus subcarpetas.",
    submitText: "Guardar permisos",
    fields: [
      {
        type: "custom",
        id: "doc-perm-field",
        html: `<div class="doc-perm-modal">
          <p class="doc-perm-help">Solo el administrador puede asignar permisos. Si no marca ningún rol en una columna, esa acción queda abierta a quien tenga el permiso global.</p>
          <table class="doc-perm-grid"><thead><tr><th>Rol</th>${actions.map((a) => `<th>${a.label}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>
        </div>`
      }
    ],
    onSubmit: async (_form, formEl) => {
      const checks = [...(formEl?.querySelectorAll("input[data-perm]:checked") || [])];
      const collect = (act) => checks.filter((c) => c.dataset.act === act).map((c) => c.dataset.role);
      const rolesView = collect("view");
      const rolesUpload = collect("upload");
      const rolesDelete = collect("delete");
      const by = actor();
      const fresh = readFolders();
      const found = fresh.find((f) => folderKey(f.folderName) === folderKey(topFolder)) || null;
      try {
        if (found) {
          const nextList = fresh.map((f) =>
            f.id === found.id ? normalizeCompanyFolderRow({ ...f, rolesView, rolesUpload, rolesDelete }) : f
          );
          await writeAwaitServerEdit(KEYS.companyDocumentFolders, nextList, found.id);
        } else {
          const record = normalizeCompanyFolderRow({
            id: newUuidV4(),
            folderName: topFolder,
            rolesView,
            rolesUpload,
            rolesDelete,
            createdBy: by,
            createdAt: new Date().toISOString()
          });
          await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...fresh, record], record);
        }
        G.notify?.("Permisos de carpeta actualizados.", "success");
        G.renderPortalView?.();
        return true;
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudieron guardar los permisos."), "error");
        return false;
      }
    }
  });
}

function openEditDocumentModal(target) {
  if (!canEdit() || !target?.id) return;
  if (!canEditFolder(readFolders(), target.folder)) {
    G.notify?.("No tiene permiso para editar en esa carpeta.", "error");
    return;
  }
  G.openEditModal?.({
    title: "Editar documento",
    subtitle: target.fileName || "",
    submitText: "Guardar cambios",
    fields: [
      { name: "fileName", label: "Nombre del archivo", value: target.fileName, required: true },
      { name: "folder", label: "Carpeta", value: target.folder, required: true, hint: "Use “ / ” para mover a una subcarpeta." },
      { name: "description", label: "Descripción", type: "textarea", rows: 2, value: target.description || "" }
    ],
    onSubmit: async (form, formEl) => {
      const fileName = String(form.fileName || "").trim();
      const folder = normalizeCompanyFolder(form.folder);
      if (!fileName) {
        G.failPortalField?.(formEl, "fileName", "Indique el nombre del archivo.");
        return false;
      }
      if (!canEditFolder(readFolders(), folder)) {
        G.notify?.("No tiene permiso para mover a esa carpeta.", "error");
        return false;
      }
      const fresh = readDocs();
      if (!fresh.some((r) => String(r.id) === String(target.id))) {
        G.notify?.("El documento ya no está disponible.", "error");
        return false;
      }
      const by = actor();
      const nextList = fresh.map((r) =>
        String(r.id) !== String(target.id)
          ? r
          : normalizeCompanyDocumentRow({
              ...r,
              fileName,
              folder,
              description: String(form.description || "").trim(),
              updatedAt: new Date().toISOString()
            })
      );
      try {
        await writeAwaitServerEdit(KEYS.companyDocuments, nextList, target.id);
        await ensureFolderRecord(folder, by);
        G.notify?.("Documento actualizado.", "success");
        G.renderPortalView?.();
        return true;
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo guardar."), "error");
        return false;
      }
    }
  });
}

async function resolveDownloadUrl(doc, { disposition = "attachment" } = {}) {
  const api = window.AntaresApi;
  if (!api?.postJson) throw new Error("API no disponible.");
  const res = await api.postJson("/uploads/company-document/download", {
    storageKey: doc.storageKey,
    disposition,
    fileName: doc.fileName || "documento"
  });
  const url = String(res?.downloadUrl || "").trim();
  if (!url) throw new Error("No se obtuvo el enlace de descarga.");
  return url;
}

async function triggerDownload(doc) {
  const url = await resolveDownloadUrl(doc, { disposition: "attachment" });
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.fileName || "documento";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

let previewKeyHandler = null;
function closePreviewPanel() {
  document.querySelector("[data-doc-preview]")?.remove();
  if (previewKeyHandler) {
    document.removeEventListener("keydown", previewKeyHandler);
    previewKeyHandler = null;
  }
}

function previewStageHtml(doc, url) {
  const group = fileTypeGroup(doc.fileName, doc.mimeType);
  if (group === "image") return `<img class="doc-preview__img" src="${escapeAttr(url)}" alt="${escapeAttr(doc.fileName)}" />`;
  if (group === "pdf") {
    return `<iframe class="doc-preview__frame" src="${escapeAttr(url)}#toolbar=1&navpanes=0" title="${escapeAttr(doc.fileName)}"></iframe>`;
  }
  if (group === "text") {
    return `<iframe class="doc-preview__frame doc-preview__frame--text" src="${escapeAttr(url)}" title="${escapeAttr(doc.fileName)}"></iframe>`;
  }
  return `<div class="doc-preview__nopreview"><p>No hay vista previa disponible para este tipo de archivo.</p></div>`;
}

async function openPreview(doc) {
  const IC = G.IC || {};
  const group = fileTypeGroup(doc.fileName, doc.mimeType);
  const canInline = canPreviewFileType(doc.fileName, doc.mimeType);
  closePreviewPanel();
  const overlay = document.createElement("div");
  overlay.className = "doc-preview-overlay documents-studio doc-studio";
  overlay.setAttribute("data-doc-preview", "");
  overlay.innerHTML = `
    <div class="doc-preview-backdrop" data-close></div>
    <aside class="doc-preview-drawer" role="dialog" aria-modal="true" aria-label="Vista previa">
      <header class="doc-preview__head">
        <span class="doc-fileicon doc-fileicon--${group}">${IC.file || ""}</span>
        <div class="doc-preview__titles">
          <p class="doc-preview__name" title="${escapeAttr(doc.fileName)}">${escapeHtml(doc.fileName)}</p>
          <p class="doc-preview__meta">${escapeHtml(fileTypeLabel(doc.fileName, doc.mimeType))} · ${escapeHtml(formatFileSize(doc.sizeBytes))} · ${escapeHtml(doc.folder)}</p>
        </div>
        <button type="button" class="doc-iconbtn doc-preview__close" data-close aria-label="Cerrar">${IC.x || "×"}</button>
      </header>
      <div class="doc-preview__body"><div class="doc-preview__stage" data-stage><div class="doc-preview__loading"><span class="doc-preview__spinner"></span>Cargando…</div></div></div>
      <footer class="doc-preview__foot">
        <div class="doc-preview__info">
          <span>Subido por ${escapeHtml(doc.uploadedBy || "—")}</span>
          <span>${escapeHtml(formatDate(doc.updatedAt))}</span>
          ${doc.description ? `<p class="doc-preview__desc">${escapeHtml(doc.description)}</p>` : ""}
        </div>
        <div class="doc-preview__actions">
          <button type="button" class="doc-btn doc-btn--ghost" data-open-tab>${IC_EXTERNAL}<span>Abrir en pestaña</span></button>
          <button type="button" class="doc-btn doc-btn--primary" data-download>${IC.download || ""}<span>Descargar</span></button>
        </div>
      </footer>
    </aside>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  previewKeyHandler = (e) => {
    if (e.key === "Escape") closePreviewPanel();
  };
  document.addEventListener("keydown", previewKeyHandler);
  overlay.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closePreviewPanel));
  const stage = overlay.querySelector("[data-stage]");
  overlay.querySelector("[data-download]")?.addEventListener("click", async () => {
    try {
      await triggerDownload(doc);
    } catch (err) {
      G.notify?.(String(err?.message || "No se pudo descargar."), "error");
    }
  });
  overlay.querySelector("[data-open-tab]")?.addEventListener("click", async () => {
    try {
      window.open(await resolveDownloadUrl(doc, { disposition: "inline" }), "_blank", "noopener");
    } catch (err) {
      G.notify?.(String(err?.message || "No se pudo abrir."), "error");
    }
  });
  if (!canInline) {
    if (stage) stage.innerHTML = previewStageHtml(doc, "");
    return;
  }
  try {
    const url = await resolveDownloadUrl(doc, { disposition: "inline" });
    if (document.body.contains(overlay) && stage) stage.innerHTML = previewStageHtml(doc, url);
  } catch (err) {
    if (stage) {
      stage.innerHTML = `<div class="doc-preview__nopreview"><p>No se pudo cargar la vista previa.</p><p class="doc-preview__nopreview-hint">${escapeHtml(String(err?.message || ""))}</p></div>`;
    }
  }
}

function openStorageDetails() {
  const docs = visibleDocs(readDocs(), readFolders());
  const folders = visibleFolders(readFolders());
  const top = collectTopFolders(docs, folders).sort((a, b) => b.sizeBytes - a.sizeBytes);
  const summary = summarizeCompanyDocuments(docs, folders, usersWithAccessCount());
  const rows = top.length
    ? top
        .map(
          (f) => `<div class="doc-storage-row">
        <span class="doc-storage-row__name">${escapeHtml(f.name)}</span>
        <span class="doc-storage-row__bar"><span style="width:${summary.totalBytes ? Math.round((f.sizeBytes / summary.totalBytes) * 100) : 0}%"></span></span>
        <span class="doc-storage-row__size">${escapeHtml(formatFileSize(f.sizeBytes))}</span>
      </div>`
        )
        .join("")
    : `<p class="muted">Sin documentos almacenados.</p>`;
  G.openInfoModal?.({
    title: "Detalles de almacenamiento",
    bodyHtml: `<div class="doc-storage-details"><p class="doc-storage-details__total">${escapeHtml(formatFileSize(summary.totalBytes))} de ${escapeHtml(formatFileSize(summary.quotaBytes))} · ${summary.usedPercent}%</p>${rows}</div>`
  });
}

function findDoc(id) {
  return readDocs().find((d) => String(d.id) === String(id)) || null;
}

/** Confirmación + borrado de un documento corporativo (admin / permiso por carpeta). */
function confirmDeleteDocument(doc) {
  if (!doc) return;
  if (!canDelete() && !isDocManager()) {
    G.notify?.("No tiene permiso para eliminar documentos.", "error");
    return;
  }
  if (!isDocManager() && !canDeleteFolder(readFolders(), doc.folder)) {
    G.notify?.("No tiene permiso para eliminar en esa carpeta.", "error");
    return;
  }
  const requestDeletion = G.openConfirmReasonModal || G.openConfirmModal;
  requestDeletion?.({
    title: "Eliminar documento",
    message: `Se eliminará "${doc.fileName}" de ${doc.folder}. Indique la justificación.`,
    confirmText: "Eliminar",
    onConfirm: async (motivo) => {
      const reason = String(motivo || "").trim();
      const ok = await G.removeFromPortalListAwaitServer?.(KEYS.companyDocuments, doc.id);
      if (!ok) {
        G.notify?.("No se pudo eliminar el documento.", "error");
        return;
      }
      G.logPortalAuditEvent?.("documents", "delete", {
        entityId: doc.id,
        entityKind: "document",
        entityLabel: `${doc.folder} · ${doc.fileName}`,
        summary: `Eliminación de documento corporativo · ${doc.fileName}`,
        reason,
        usuario: actor(),
        actor: actor(),
        at: new Date().toISOString()
      });
      G.notify?.("Documento eliminado.", "success");
      G.renderPortalView?.();
    }
  });
}

function on(root, selector, event, handler) {
  root.querySelectorAll(selector).forEach((el) => el.addEventListener(event, handler));
}

function bindDocumentManagementPortalControls() {
  const root = nodes.viewRoot;
  if (!root) return;

  on(root, "[data-action='doc-upload']", "click", () => openUploadModal());
  on(root, "[data-action='doc-new-folder']", "click", () => openNewFolderModal(""));
  on(root, "[data-action='doc-new-subfolder']", "click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openNewFolderModal(String(e.currentTarget.dataset.parent || getUi().folderFilter || ""));
  });
  on(root, "[data-action='doc-toggle-filters']", "click", () => {
    patchUi({ showFilters: !getUi().showFilters });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-toggle-trash']", "click", () => {
    const next = !getUi().showTrash;
    patchUi({
      showTrash: next,
      page: 1,
      folderPage: 1,
      ...(next ? {} : { folderFilter: getUi().folderFilter || EMPLOYEES_ROOT_FOLDER })
    });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-sort']", "change", (e) => {
    patchUi({ sortKey: e.currentTarget.value || "name_asc", page: 1, folderPage: 1 });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-more-folders']", "click", () => {
    patchUi({ folderPage: (Number(getUi().folderPage) || 1) + 1 });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-type-filter']", "change", (e) => {
    patchUi({ typeFilter: e.currentTarget.value || "all", page: 1 });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-folder-filter']", "change", (e) => {
    patchUi({ folderFilter: e.currentTarget.value || "", page: 1, folderPage: 1, showTrash: false });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-clear-filters']", "click", () => {
    patchUi({ search: "", typeFilter: "all", page: 1, folderPage: 1 });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-clear-folder']", "click", () => {
    patchUi({ folderFilter: EMPLOYEES_ROOT_FOLDER, page: 1, folderPage: 1, showTrash: false });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-view']", "click", (e) => {
    patchUi({ viewMode: e.currentTarget.dataset.viewMode === "grid" ? "grid" : "list" });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-page']", "click", (e) => {
    const p = parseInt(e.currentTarget.dataset.page, 10);
    if (!Number.isFinite(p) || p < 1) return;
    patchUi({ page: p });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-see-all']", "click", () => {
    patchUi({ folderFilter: EMPLOYEES_ROOT_FOLDER, search: "", typeFilter: "all", page: 1, folderPage: 1, showTrash: false });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-export-csv']", "click", () => {
    const folders = readFolders();
    const docs = visibleDocs(readDocs(), folders);
    const filtered = applyCompanyDocumentFilters(docs, {
      search: getUi().search,
      type: getUi().typeFilter,
      folder: getUi().folderFilter
    });
    downloadCsv("documentos-empresa.csv", buildCompanyDocumentExportRows(filtered));
  });
  on(root, "[data-action='doc-open-folder']", "click", (e) => {
    const folder = String(e.currentTarget.dataset.folder || "");
    patchUi({ folderFilter: folder, page: 1, folderPage: 1, showTrash: false });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-folder-perms']", "click", (e) => {
    e.stopPropagation();
    openFolderPermissionsModal(String(e.currentTarget.dataset.folder || ""));
  });
  on(root, "[data-action='doc-open-subfolder']", "click", (e) => {
    patchUi({ folderFilter: String(e.currentTarget.dataset.path || ""), page: 1, folderPage: 1, showTrash: false });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-edit-folder']", "click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openEditFolderModal(String(e.currentTarget.dataset.path || ""));
  });
  on(root, "[data-action='doc-delete-folder']", "click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openDeleteFolderFlow(String(e.currentTarget.dataset.path || ""));
  });
  on(root, "[data-action='doc-crumb']", "click", (e) => {
    const path = String(e.currentTarget.dataset.path || "");
    patchUi({
      folderFilter: path || EMPLOYEES_ROOT_FOLDER,
      page: 1,
      folderPage: 1,
      showTrash: false
    });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-storage-details']", "click", () => openStorageDetails());
  on(root, "[data-action='doc-preview']", "click", async (e) => {
    const doc = findDoc(e.currentTarget.dataset.id);
    if (!doc) return;
    try {
      await openPreview(doc);
    } catch (err) {
      G.notify?.(String(err?.message || "No se pudo abrir la vista previa."), "error");
    }
  });
  on(root, "[data-action='doc-download']", "click", async (e) => {
    const doc = findDoc(e.currentTarget.dataset.id);
    if (!doc) return;
    try {
      await triggerDownload(doc);
    } catch (err) {
      G.notify?.(String(err?.message || "No se pudo descargar."), "error");
    }
  });
  on(root, "[data-action='doc-recent-open']", "click", async (e) => {
    const doc = findDoc(e.currentTarget.dataset.id);
    if (!doc) return;
    try {
      if (canPreviewFileType(doc.fileName, doc.mimeType)) await openPreview(doc);
      else await triggerDownload(doc);
    } catch (err) {
      G.notify?.(String(err?.message || "No se pudo abrir el documento."), "error");
    }
  });
  on(root, "[data-action='doc-edit']", "click", (e) => {
    const doc = findDoc(e.currentTarget.dataset.id);
    if (doc) openEditDocumentModal(doc);
  });
  on(root, "[data-action='doc-delete']", "click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    confirmDeleteDocument(findDoc(e.currentTarget.dataset.id));
  });

  const searchInput = root.querySelector("[data-action='doc-search']");
  if (searchInput) {
    const runSearch = () => {
      const el = root.querySelector("[data-action='doc-search']");
      if (!el) return;
      state.__companyDocsSearchRestore = { start: el.selectionStart, end: el.selectionEnd };
      patchUi({ search: el.value, page: 1 });
      G.renderPortalView?.();
    };
    searchInput.addEventListener("input", typeof G.debounce === "function" ? G.debounce(runSearch, 260) : runSearch);
  }
  const restore = state.__companyDocsSearchRestore;
  if (restore) {
    delete state.__companyDocsSearchRestore;
    queueMicrotask(() => {
      const el = nodes.viewRoot?.querySelector("[data-action='doc-search']");
      if (!el) return;
      el.focus();
      if (typeof el.setSelectionRange === "function") {
        const n = String(el.value || "").length;
        el.setSelectionRange(Math.min(restore.start ?? n, n), Math.min(restore.end ?? n, n));
      }
    });
  }

  if (!window.__companyDocsHotkeyBound) {
    window.__companyDocsHotkeyBound = true;
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === "k") {
        const el = nodes.viewRoot?.querySelector("[data-action='doc-search']");
        if (el && String(state.currentView || "") === "document-management") {
          e.preventDefault();
          el.focus();
          el.select?.();
        }
      }
    });
  }

  /* Estructura base + carpetas de empleados: se asegura sola (sin botón). */
  if (canUpload()) {
    void ensureCompanyDocumentStructure().then((res) => {
      if (res?.created > 0 && String(state.currentView || "") === "document-management") {
        G.renderPortalView?.();
      }
    });
  }
}

if (typeof window.registerLegacyPortalViews === "function") {
  window.registerLegacyPortalViews({ documentManagementHtml });
}

(function registerDocumentManagementPortalBinds() {
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["document-management"] = bindDocumentManagementPortalControls;
})();

export { documentManagementHtml, bindDocumentManagementPortalControls };
