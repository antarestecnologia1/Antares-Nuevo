/**
 * Gestión documental — gestor documental corporativo (DMS general de empresa).
 * Reemplaza el expediente por colaborador. Carpetas jerárquicas, R2, KPIs,
 * permisos por carpeta (solo admin), vista previa lateral y dropzone.
 */
import { state, nodes } from "../core/store.js";
import { read, writeAwaitServerCreate, writeAwaitServerEdit, writeAwaitServerDelete } from "../core/data-io.js";
import { KEYS, PORTAL_ASSIGNABLE_ROLES } from "../core/config.js";
import {
  canAccessDocumentsView,
  canUploadDocuments,
  canEditDocuments,
  canDeleteDocuments,
  canDownloadDocuments,
  canManageAllDocuments,
  canAccessSarlaftView,
  currentUser,
  getPortalUserDisplayName
} from "../core/auth.js";
import { escapeHtml, escapeAttr, newUuidV4, devWarn, colombiaTodayIsoDate, normalizeCompanyKindForDb } from "../core/utils.js";
import {
  COMPANY_DOCUMENT_MAX_BYTES,
  COMPANY_DOCUMENT_CATEGORIES,
  COMPANY_DOCUMENT_ENTITY_TYPES,
  COMPANY_DOCUMENT_PROCESSES,
  DOCUMENT_VALIDITY_STATUSES,
  DOCUMENT_TYPES_CATALOG_FOLDER,
  DEFAULT_COMPANY_FOLDER,
  EMPLOYEES_ROOT_FOLDER,
  SUGGESTED_COMPANY_FOLDERS,
  employeeCompanyFolderPath,
  listMissingEmployeeFolderPaths,
  buildPayrollCompanyDocumentFileName,
  buildAbsenceSupportCompanyFileName,
  absenceSupportDocumentMarker,
  employeeHireDocumentMarker,
  buildEmployeeContractCompanyFileName,
  buildEmployeeLaborLetterCompanyFileName,
  buildEmployeePhotoCompanyFileName,
  formatCompanyDocumentDisplayName,
  sanitizeCompanyDocumentDescription,
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
  actorAllowedInFolder,
  getCompanyDocumentCategoryLabel,
  getCompanyDocumentEntityTypeLabel,
  getCompanyDocumentProcessLabel,
  getDocumentValidityStatusLabel,
  listCompanyDocumentCategories,
  findCompanyDocumentCategory,
  readDocumentTypesFromFolderRecords,
  serializeDocumentTypesCatalog,
  serializeCompanyDocumentTags,
  isHiddenCompanyFolder,
  computeDocumentValidityStatus,
  listDocumentVersionChain,
  nextDocumentVersionState,
  summarizeCompanyDocuments,
  applyCompanyDocumentFilters,
  sortByRecent,
  buildCompanyDocumentExportRows
} from "../domain/company-documents.domain.js";
import {
  normalizeEmployeeDocumentRow,
  normalizeEmployeeDocumentFolderRow
} from "../domain/employee-documents.domain.js";
import { downloadCsv } from "../domain/reporteria.domain.js";
import { payrollRunTypeLabel, payrollAbsenceTypeLabel } from "../domain/nomina.domain.js";
import { buildEmployeeContractDocxPayload, prepareEmployeeForContractDocx, validateEmployeeContractDocFields } from "../domain/contratacion.domain.js";
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
      categoryFilter: "all",
      statusFilter: "all",
      entityTypeFilter: "all",
      processFilter: "all",
      dateFrom: "",
      dateTo: "",
      dateField: "updated",
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
  if (!ui.categoryFilter) ui.categoryFilter = "all";
  if (!ui.statusFilter) ui.statusFilter = "all";
  if (!ui.entityTypeFilter) ui.entityTypeFilter = "all";
  if (!ui.processFilter) ui.processFilter = "all";
  if (!ui.dateField) ui.dateField = "updated";
  if (ui.dateFrom == null) ui.dateFrom = "";
  if (ui.dateTo == null) ui.dateTo = "";
  return ui;
}
function patchUi(patch) {
  return Object.assign(getUi(), patch || {});
}

function userObj() {
  return (typeof G.currentUser === "function" ? G.currentUser() : currentUser()) || {};
}
function userId() {
  return String(userObj().id || "").trim();
}
function userRole() {
  return String(userObj().role || "").toLowerCase();
}
function folderActor() {
  return { role: userRole(), userId: userId() };
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
  return actorAllowedInFolder(folders, path, "view", folderActor());
}
function canViewFolderContent(folders, path) {
  if (!canView()) return false;
  if (isDocManager()) return true;
  return actorAllowedInFolder(folders, path, "view", folderActor(), { forContent: true });
}
function canUploadFolder(folders, path) {
  if (!canUpload()) return false;
  if (isDocManager()) return true;
  return (
    actorAllowedInFolder(folders, path, "view", folderActor(), { forContent: true }) &&
    actorAllowedInFolder(folders, path, "upload", folderActor(), { forContent: true })
  );
}
function canEditFolder(folders, path) {
  if (!canEdit()) return false;
  if (isDocManager()) return true;
  return (
    actorAllowedInFolder(folders, path, "view", folderActor(), { forContent: true }) &&
    actorAllowedInFolder(folders, path, "upload", folderActor(), { forContent: true })
  );
}
function canDeleteFolder(folders, path) {
  if (!canDelete()) return false;
  if (isDocManager()) return true;
  return (
    actorAllowedInFolder(folders, path, "view", folderActor(), { forContent: true }) &&
    actorAllowedInFolder(folders, path, "delete", folderActor(), { forContent: true })
  );
}

function readDocs() {
  return read(KEYS.companyDocuments, [])
    .map((row) => {
      try {
        return normalizeCompanyDocumentRow(row);
      } catch (err) {
        devWarn("[companyDocuments] normalize row", err?.message || err);
        return null;
      }
    })
    .filter((d) => d && d.id);
}
function readFolders() {
  return read(KEYS.companyDocumentFolders, [])
    .map((row) => {
      try {
        return normalizeCompanyFolderRow(row);
      } catch (err) {
        devWarn("[companyDocuments] normalize folder", err?.message || err);
        return null;
      }
    })
    .filter((f) => f && f.id);
}
function visibleDocs(docs, folders) {
  if (isDocManager()) return docs;
  return docs.filter((d) => canViewFolderContent(folders, d.folder));
}
function visibleFolders(folders) {
  const list = isDocManager() ? folders : folders.filter((f) => canViewFolder(folders, f.folderName));
  return list.filter((f) => !isHiddenCompanyFolder(f.folderName));
}

function canDownload() {
  return canDownloadDocuments(userObj());
}

function canDownloadCompanyDoc(doc) {
  if (canDownload()) return true;
  if (!doc) return false;
  const process = String(doc.process || "").toLowerCase();
  const entity = String(doc.entityType || "").toLowerCase();
  const folder = String(doc.folder || "").toLowerCase();
  const sarlaft = process === "sarlaft" || entity === "tercero" || folder.includes("sarlaft");
  return sarlaft && canAccessSarlaftView(userObj());
}

function canManageTypes() {
  return canManageAllDocuments(userObj()) || isDocManager();
}

function customDocumentTypes() {
  return readDocumentTypesFromFolderRecords(readFolders());
}

function documentCategories() {
  return listCompanyDocumentCategories(customDocumentTypes());
}

function logDocumentAction(action, doc, extra = {}) {
  if (!doc?.id) return;
  const display = formatCompanyDocumentDisplayName(doc);
  const titles = {
    view: "Consulta de documento",
    download: "Descarga de documento",
    status: "Cambio de estado documental",
    version: "Nueva versión de documento"
  };
  G.logPortalAuditEvent?.("documents", action === "create" || action === "delete" ? action : "update", {
    entityId: doc.id,
    entityKind: "document",
    entityLabel: `${doc.folder} · ${display.label || doc.fileName}`,
    summary: `${titles[action] || extra.summary || "Actualización de documento"} · ${display.label || doc.fileName}`,
    detailAction: action,
    usuario: actor(),
    actor: actor(),
    at: extra.at || new Date().toISOString(),
    ...extra
  });
}

function entityOptionsForType(entityType) {
  const t = String(entityType || "").trim();
  const opts = [{ value: "", label: "Sin asociar" }];
  if (t === "empleado") {
    for (const e of read(KEYS.payrollEmployees, [])) {
      const id = String(e?.id || "").trim();
      const name = String(e?.name || e?.fullName || "").trim();
      if (id && name) {
        const unlinked =
          typeof window.isPayrollEmployeeUnlinked === "function"
            ? window.isPayrollEmployeeUnlinked(e)
            : e?.active === false;
        const suffix = unlinked ? " · Desvinculado" : "";
        opts.push({ value: id, label: `${name}${suffix}` });
      }
    }
  } else if (t === "conductor") {
    for (const d of read(KEYS.drivers, [])) {
      const id = String(d?.id || "").trim();
      const name = String(d?.fullName || d?.name || "").trim();
      if (id && name) opts.push({ value: id, label: name });
    }
  } else if (t === "vehiculo") {
    for (const v of read(KEYS.vehicles, [])) {
      const id = String(v?.id || "").trim();
      const plate = String(v?.plate || "").trim().toUpperCase();
      if (id && plate) opts.push({ value: id, label: [plate, v.brand, v.model].filter(Boolean).join(" · ") });
    }
  } else if (t === "tercero") {
    for (const c of read(KEYS.companies, [])) {
      if (normalizeCompanyKindForDb(c?.companyKind) !== "tercero") continue;
      const id = String(c?.id || "").trim();
      const name = String(c?.name || "").trim();
      if (id && name) opts.push({ value: id, label: name });
    }
  } else if (t === "contrato") {
    for (const c of read(KEYS.contracts, [])) {
      const id = String(c?.id || "").trim();
      if (!id) continue;
      const label =
        String(c?.employeeName || c?.candidateName || c?.positionTitle || c?.id || "").trim() || "Contrato";
      opts.push({ value: id, label });
    }
  } else if (t === "sst") {
    for (const r of read(KEYS.sstCompliance, [])) {
      const id = String(r?.id || "").trim();
      if (!id) continue;
      const label = [r.recordType, r.employeeName, r.documentCode].filter(Boolean).join(" · ") || "Control SST";
      opts.push({ value: id, label });
    }
  }
  return opts;
}

function resolveEntityLabel(entityType, entityId, fallback = "") {
  const hit = entityOptionsForType(entityType).find((o) => o.value && o.value === String(entityId || ""));
  return String(hit?.label || fallback || "").trim();
}

function suggestedFolderForEntity(entityType, entityLabel = "") {
  const t = String(entityType || "").trim();
  const leaf = String(entityLabel || "")
    .replace(/[\\/]+/g, " ")
    .trim()
    .slice(0, 120);
  if (t === "empleado" && leaf) return `${EMPLOYEES_ROOT_FOLDER}${leaf ? ` / ${leaf}` : ""}`;
  if (t === "conductor" && leaf) return `07. Operación / Conductores / ${leaf}`;
  if (t === "vehiculo" && leaf) return `07. Operación / Vehículos / ${leaf}`;
  if (t === "tercero" && leaf) return `06. Terceros / ${leaf}`;
  if (t === "contrato") return "02. Contratación";
  if (t === "sst") return "03. SST";
  if (t === "operacion") return "07. Operación";
  return "";
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
  const typesBtn = canManageTypes()
    ? `<button type="button" class="doc-btn doc-btn--ghost" data-action="doc-manage-types">${IC.file || ""}<span>Tipos documentales</span></button>`
    : "";
  return `<header class="doc-topbar">
    <div class="doc-topbar__titles">
      <h1 class="doc-topbar__title">Gestión documental</h1>
      <p class="doc-topbar__subtitle">Administra y organiza todos los documentos de la empresa.</p>
    </div>
    <div class="doc-topbar__actions">
      ${typesBtn}
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

function renderValidityBanner(summary) {
  const due = Number(summary.dueSoonCount) || 0;
  const expired = Number(summary.expiredCount) || 0;
  if (!due && !expired) return "";
  const parts = [];
  if (expired) {
    parts.push(
      `<button type="button" class="doc-alert-chip doc-alert-chip--expired" data-action="doc-filter-status" data-status="vencido">${expired} vencido${expired === 1 ? "" : "s"}</button>`
    );
  }
  if (due) {
    parts.push(
      `<button type="button" class="doc-alert-chip doc-alert-chip--soon" data-action="doc-filter-status" data-status="por_vencer">${due} por vencer</button>`
    );
  }
  return `<section class="doc-alert-bar" role="status" aria-label="Alertas de vigencia">
    <p class="doc-alert-bar__text">Hay documentos con vigencia crítica. Filtre para revisarlos.</p>
    <div class="doc-alert-bar__chips">${parts.join("")}</div>
  </section>`;
}

function validityBadge(doc) {
  const status = computeDocumentValidityStatus(doc);
  if (status === "sin_vigencia") return "";
  const label = getDocumentValidityStatusLabel(status);
  const extra = doc.expiresAt && (status === "por_vencer" || status === "vencido") ? ` · ${formatDateShort(doc.expiresAt)}` : "";
  return `<span class="doc-validity doc-validity--${status}">${escapeHtml(label)}${escapeHtml(extra)}</span>`;
}

/** Une carpetas reales con la estructura sugerida para que el rail no quede vacío. */
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
      const active = !ui.showTrash && ui.folderFilter && ui.folderFilter !== "*" && folderKey(topFolderName(ui.folderFilter)) === f.key;
      const count =
        f.subfolderCount > 0
          ? `${f.subfolderCount} carpeta${f.subfolderCount === 1 ? "" : "s"}`
          : `${f.docCount} archivo${f.docCount === 1 ? "" : "s"}`;
      const restricted =
        folderRoleAllowlist(allFolders, f.name, "view").length > 0 ||
        (allFolders || []).some(
          (rec) =>
            rec &&
            folderKey(topFolderName(rec.folderName)) === f.key &&
            ((rec.usersView || []).length || (rec.usersUpload || []).length || (rec.usersDelete || []).length)
        );
      const permsBtn = showPerms
        ? `<button type="button" class="doc-cat-card__perms" data-action="doc-folder-perms" data-folder="${escapeAttr(f.name)}" aria-label="Permisos de ${escapeAttr(f.name)}" title="Permisos">${IC_LOCK}</button>`
        : "";
      return `<div class="doc-cat-card${active ? " is-active" : ""}${restricted ? " is-restricted" : ""}">
        <button type="button" class="doc-cat-card__open" data-action="doc-open-folder" data-folder="${escapeAttr(f.name)}" title="${escapeAttr(f.name)}">
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
  if (ui.folderFilter === "*") {
    return `<div class="doc-explorer-path">
      <nav class="doc-breadcrumb" aria-label="Ruta">
        <button type="button" class="doc-crumb" data-action="doc-crumb" data-path="">Documentos</button>
        <span class="doc-crumb-sep">›</span>
        <span class="doc-crumb is-current">Todos (filtro de vigencia)</span>
      </nav>
      <button type="button" class="doc-trash-link" data-action="doc-toggle-trash" aria-pressed="false">${IC_TRASH}<span>Ver papelera</span></button>
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
            canManageFolderPermissions()
              ? `<button type="button" class="doc-btn doc-btn--ghost doc-btn--sm" data-action="doc-folder-perms" data-folder="${escapeAttr(ui.folderFilter)}">${IC_LOCK}<span>Permisos</span></button>`
              : ""
          }
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
  const categoryOptions = [
    { value: "all", label: "Todos los tipos documentales" },
    ...documentCategories()
  ]
    .map(
      (t) =>
        `<option value="${escapeAttr(t.value)}"${ui.categoryFilter === t.value ? " selected" : ""}>${escapeHtml(t.label)}</option>`
    )
    .join("");
  const statusOptions = [{ value: "all", label: "Todos los estados" }, ...DOCUMENT_VALIDITY_STATUSES]
    .map(
      (t) =>
        `<option value="${escapeAttr(t.value)}"${ui.statusFilter === t.value ? " selected" : ""}>${escapeHtml(t.label)}</option>`
    )
    .join("");
  const entityOptions = [{ value: "all", label: "Todas las entidades" }, ...COMPANY_DOCUMENT_ENTITY_TYPES]
    .map(
      (t) =>
        `<option value="${escapeAttr(t.value)}"${ui.entityTypeFilter === t.value ? " selected" : ""}>${escapeHtml(t.label)}</option>`
    )
    .join("");
  const processOptions = [{ value: "all", label: "Todos los procesos" }, ...COMPANY_DOCUMENT_PROCESSES]
    .map(
      (t) =>
        `<option value="${escapeAttr(t.value)}"${ui.processFilter === t.value ? " selected" : ""}>${escapeHtml(t.label)}</option>`
    )
    .join("");
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
      <label class="doc-select doc-select--labeled"><span>Archivo</span><select data-action="doc-type-filter" aria-label="Filtrar por tipo de archivo">${typeOptions}</select></label>
      <label class="doc-select doc-select--labeled"><span>Tipo documental</span><select data-action="doc-category-filter" aria-label="Filtrar por tipo documental">${categoryOptions}</select></label>
      <label class="doc-select doc-select--labeled"><span>Estado</span><select data-action="doc-status-filter" aria-label="Filtrar por vigencia">${statusOptions}</select></label>
      <label class="doc-select doc-select--labeled"><span>Entidad</span><select data-action="doc-entity-filter" aria-label="Filtrar por entidad">${entityOptions}</select></label>
      <label class="doc-select doc-select--labeled"><span>Proceso</span><select data-action="doc-process-filter" aria-label="Filtrar por proceso">${processOptions}</select></label>
      <label class="doc-select doc-select--labeled"><span>Desde</span><input type="date" data-action="doc-date-from" value="${escapeAttr(ui.dateFrom || "")}" aria-label="Fecha desde" /></label>
      <label class="doc-select doc-select--labeled"><span>Hasta</span><input type="date" data-action="doc-date-to" value="${escapeAttr(ui.dateTo || "")}" aria-label="Fecha hasta" /></label>
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
              ${
                canManageFolderPermissions()
                  ? `<button type="button" data-action="doc-folder-perms" data-folder="${escapeAttr(s.path)}">${IC_LOCK}<span>Permisos</span></button>`
                  : ""
              }
              <button type="button" class="is-danger" data-action="doc-delete-folder" data-path="${escapeAttr(s.path)}">${IC.trash || IC_TRASH}<span>Eliminar</span></button>
            </div>
          </details>`
        : "";
      return `<div class="doc-subfolder-card">
        <button type="button" class="doc-subfolder-card__open" data-action="doc-open-subfolder" data-path="${escapeAttr(s.path)}" title="${escapeAttr(s.name)}">
          <span class="doc-subfolder-card__icon">${IC.folder || ""}</span>
          <span class="doc-subfolder-card__body">
            <span class="doc-subfolder-card__name">${escapeHtml(s.name || "")}</span>
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

function documentNameBlock(doc, { compact = false } = {}) {
  const display = formatCompanyDocumentDisplayName(doc);
  const sub = [display.subtitle, display.ext].filter(Boolean).join(" · ");
  if (compact) {
    return `<span class="doc-nameblock doc-nameblock--compact" title="${escapeAttr(display.fullName)}">
      <span class="doc-nameblock__title">${escapeHtml(display.title)}</span>
    </span>`;
  }
  return `<span class="doc-nameblock" title="${escapeAttr(display.fullName)}">
    <span class="doc-nameblock__title">${escapeHtml(display.title)}</span>
    ${sub ? `<span class="doc-nameblock__sub">${escapeHtml(sub)}</span>` : ""}
  </span>`;
}

function rowMenu(doc, IC, folders = []) {
  const items = [];
  if (canPreviewFileType(doc.fileName, doc.mimeType)) {
    items.push(`<button type="button" data-action="doc-preview" data-id="${escapeAttr(doc.id)}">${IC.eye || ""}<span>Vista previa</span></button>`);
  }
  if (canDownload()) {
    items.push(`<button type="button" data-action="doc-download" data-id="${escapeAttr(doc.id)}">${IC.download || ""}<span>Descargar</span></button>`);
  }
  if (canEditFolder(folders, doc.folder)) {
    items.push(`<button type="button" data-action="doc-edit" data-id="${escapeAttr(doc.id)}">${IC.edit || ""}<span>Editar / mover</span></button>`);
  }
  if (canDeleteFolder(folders, doc.folder)) {
    items.push(`<button type="button" class="is-danger" data-action="doc-delete" data-id="${escapeAttr(doc.id)}">${IC.trash || ""}<span>Eliminar</span></button>`);
  }
  return `<details class="doc-rowmenu"><summary class="doc-iconbtn" aria-label="Acciones">${IC_DOTS}</summary><div class="doc-rowmenu__list">${items.join("")}</div></details>`;
}

function categoryPill(doc) {
  const label = getCompanyDocumentCategoryLabel(doc.documentCategory || doc.tags, customDocumentTypes());
  if (!label) return "";
  const ver = Number(doc.version) > 1 ? ` v${doc.version}` : "";
  return `<span class="doc-category-pill">${escapeHtml(label)}${escapeHtml(ver)}</span>`;
}

function renderTable(pageDocs, IC, folders = []) {
  if (!pageDocs.length) return "";
  const rows = pageDocs
    .map(
      (d) => `<tr>
      <td class="doc-cell-name"><span class="doc-fileicon doc-fileicon--${fileTypeGroup(d.fileName, d.mimeType)}" aria-hidden="true">${IC.file || ""}</span>${documentNameBlock(d)}</td>
      <td>${typeBadge(d)}</td>
      <td>${categoryPill(d) || `<span class="muted">—</span>`}</td>
      <td>${d.entityLabel ? `<span title="${escapeAttr(getCompanyDocumentEntityTypeLabel(d.entityType))}">${escapeHtml(d.entityLabel)}</span>` : `<span class="muted">—</span>`}</td>
      <td>${validityBadge(d) || `<span class="muted">—</span>`}</td>
      <td class="doc-cell-folder" title="${escapeAttr(d.folder)}">${escapeHtml(folderLeafName(d.folder) || d.folder)}</td>
      <td class="doc-cell-size">${escapeHtml(formatFileSize(d.sizeBytes))}</td>
      <td class="doc-cell-date">${escapeHtml(formatDate(d.updatedAt))}</td>
      <td class="doc-cell-actions">${rowMenu(d, IC, folders)}</td>
    </tr>`
    )
    .join("");
  return `<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>Nombre</th><th>Archivo</th><th>Tipo documental</th><th>Entidad</th><th>Vigencia</th><th>Carpeta</th><th>Tamaño</th><th>Fecha de modificación</th><th aria-label="Acciones"></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderGrid(pageDocs, IC, folders = []) {
  if (!pageDocs.length) return "";
  const cards = pageDocs
    .map((d) => {
      const display = formatCompanyDocumentDisplayName(d);
      return `<article class="doc-card">
      <header class="doc-card__head"><span class="doc-fileicon doc-fileicon--lg doc-fileicon--${fileTypeGroup(d.fileName, d.mimeType)}" aria-hidden="true">${IC.file || ""}</span>${rowMenu(d, IC, folders)}</header>
      <p class="doc-card__name" title="${escapeAttr(display.fullName)}">${escapeHtml(display.title)}</p>
      <p class="doc-card__sub">${escapeHtml([display.subtitle, display.ext].filter(Boolean).join(" · "))}</p>
      <p class="doc-card__folder" title="${escapeAttr(d.folder)}">${escapeHtml(folderLeafName(d.folder) || d.folder)}</p>
      ${categoryPill(d)}
      ${d.entityLabel ? `<p class="doc-card__entity">${escapeHtml(d.entityLabel)}</p>` : ""}
      ${validityBadge(d)}
      <footer class="doc-card__foot"><span>${escapeHtml(formatFileSize(d.sizeBytes))}</span><span>${escapeHtml(formatDateShort(d.updatedAt))}</span></footer>
    </article>`;
    })
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
          const display = formatCompanyDocumentDisplayName(d);
          const recentLabel = display.label || display.title;
          return `<li class="doc-recent-item">
        <button type="button" class="doc-recent-item__open" data-action="doc-recent-open" data-id="${escapeAttr(d.id)}">
          <span class="doc-fileicon doc-fileicon--${fileTypeGroup(d.fileName, d.mimeType)}" aria-hidden="true">${IC.file || ""}</span>
          <span class="doc-recent-item__body">
            <span class="doc-recent-item__name" title="${escapeAttr(display.fullName)}">${escapeHtml(recentLabel)}</span>
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
    <p class="doc-onboarding__text">Las carpetas base (Empleados, Contratación, SST, Legal, Finanzas, Terceros y Operación) y una carpeta por colaborador se crean automáticamente. Sube el primer documento para empezar.</p>
    ${actions}
  </section>`;
}

function documentManagementHtml() {
  try {
    return renderDocumentManagementShell();
  } catch (err) {
    devWarn("[companyDocuments] render", err?.message || err);
    return `<section class="documents-studio doc-studio"><div class="doc-empty"><p class="doc-empty__title">No se pudo cargar la gestión documental.</p><p class="doc-empty__hint">Recargue el portal. Si el problema continúa, revise la consola del navegador.</p></div></section>`;
  }
}

function renderDocumentManagementShell() {
  const IC = G.IC || {};
  if (!canView()) {
    return `<section class="documents-studio doc-studio"><div class="doc-empty"><p class="doc-empty__title">No tiene permiso para consultar la gestión documental.</p></div></section>`;
  }
  const ui = getUi();
  const allFolders = readFolders();
  const docs = visibleDocs(readDocs(), allFolders);
  const folders = visibleFolders(allFolders);
  const summary = summarizeCompanyDocuments(docs, folders, usersWithAccessCount());
  const topFolders = mergeSuggestedTopFolders(collectTopFolders(docs, folders)).filter(
    (f) => !isHiddenCompanyFolder(f.name) && canViewFolder(allFolders, f.name)
  );

  if (!ui.showTrash && ui.folderFilter !== "*" && !ui.folderFilter && topFolders.length) {
    ui.folderFilter = topFolders[0].name;
  } else if (
    !ui.showTrash &&
    ui.folderFilter &&
    ui.folderFilter !== "*" &&
    !canViewFolder(allFolders, ui.folderFilter)
  ) {
    ui.folderFilter = topFolders[0]?.name || EMPLOYEES_ROOT_FOLDER;
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

  const browseAll = ui.folderFilter === "*";
  const q = stripSearch(ui.search);
  let subfolders = browseAll || !ui.folderFilter ? [] : collectSubfolders(docs, folders, ui.folderFilter);
  if (q) subfolders = subfolders.filter((s) => stripSearch(s.name).includes(q) || stripSearch(s.path).includes(q));
  subfolders = sortSubfolders(subfolders, ui.sortKey);

  const filtered = sortDocuments(
    applyCompanyDocumentFilters(docs, {
      search: ui.search,
      type: ui.typeFilter,
      folder: browseAll ? "" : ui.folderFilter,
      category: ui.categoryFilter,
      status: ui.statusFilter,
      entityType: ui.entityTypeFilter,
      process: ui.processFilter,
      dateField: ui.dateField,
      dateFrom: ui.dateFrom,
      dateTo: ui.dateTo,
      onlyCurrentVersions: false
    }),
    ui.sortKey
  );
  /*
   * Si hay subcarpetas: mostrar docs de la carpeta actual + descendientes cuando el
   * usuario busca, o solo los de la ruta exacta si no. En hojas (sin subcarpetas)
   * siempre mostrar elSubtree completo (incluye la carpeta actual).
   */
  const depth = browseAll ? 0 : folderSegments(ui.folderFilter || "").length;
  const listDocs =
    !browseAll && subfolders.length && !q && depth <= 1
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
    ${renderValidityBanner(summary)}
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

/** Layout compacto A4 (1 hoja) del desprendible de Gestión humana. */
const PAYSLIP_LAYOUT_MARKER = "slipLayout=a4-1p";
const payslipArchiveInflight = new Map();

function payrollRunSlipMarker(runId) {
  const id = String(runId || "").trim();
  return id ? `payrollRunId=${id}` : "";
}

function findPayrollSlipDoc(runId) {
  const marker = payrollRunSlipMarker(runId);
  if (!marker) return null;
  return readDocs().find((d) => String(d.description || "").includes(marker)) || null;
}

function payrollSlipDocHasCurrentLayout(doc) {
  return String(doc?.description || "").includes(PAYSLIP_LAYOUT_MARKER);
}

function isPayrollSlipDocument(doc) {
  return (
    String(doc?.documentCategory || "") === "comprobante_pago" ||
    String(doc?.tags || "").includes("comprobante_pago") ||
    /colilla de pago/i.test(String(doc?.description || ""))
  );
}

function payrollRunIdFromSlipDoc(doc) {
  const m = String(doc?.description || "").match(/payrollRunId=([^\s·]+)/);
  return m ? String(m[1] || "").trim() : "";
}

async function resolvePayslipBlobBuilder() {
  if (typeof window.buildPayrollRunPayslipFileBlob === "function") {
    return window.buildPayrollRunPayslipFileBlob;
  }
  for (let i = 0; i < 25; i += 1) {
    await new Promise((r) => setTimeout(r, 120));
    if (typeof window.buildPayrollRunPayslipFileBlob === "function") {
      return window.buildPayrollRunPayslipFileBlob;
    }
  }
  return null;
}

/**
 * Archiva el comprobante de una liquidación PAGADA en `01. Empleados / Nombre`.
 * Usa el desprendible de 1 hoja de Gestión humana (HTML→PDF).
 * Si ya existe una colilla con layout anterior, la reemplaza.
 */
async function archivePayrollRunToEmployeeFolder(run, { force = false } = {}) {
  if (!run?.id || !run.employeeId) return { ok: false, skipped: true };
  if (!run.paid) {
    return { ok: false, skipped: true, message: "Solo se archiva la colilla cuando el pago está marcado como pagado." };
  }
  const inflightKey = String(run.id);
  const pending = payslipArchiveInflight.get(inflightKey);
  if (pending) return pending;
  const job = archivePayrollRunToEmployeeFolderNow(run, { force }).finally(() => {
    payslipArchiveInflight.delete(inflightKey);
  });
  payslipArchiveInflight.set(inflightKey, job);
  return job;
}

async function archivePayrollRunToEmployeeFolderNow(run, { force = false } = {}) {
  if (!run?.id || !run.employeeId) return { ok: false, skipped: true };
  if (!run.paid) {
    return { ok: false, skipped: true, message: "Solo se archiva la colilla cuando el pago está marcado como pagado." };
  }
  const runMarker = payrollRunSlipMarker(run.id);
  const existing = findPayrollSlipDoc(run.id);
  if (existing && payrollSlipDocHasCurrentLayout(existing) && !force) {
    return { ok: true, skipped: true, id: existing.id };
  }
  const employee = {
    id: run.employeeId,
    name: run.employeeName || read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(run.employeeId))?.name
  };
  const folderRes = await ensureCompanyEmployeeDocumentFolder(employee);
  const folder = folderRes?.path || employeeCompanyFolderPath(employee);
  if (!folder) return { ok: false, message: "No se pudo resolver la carpeta del colaborador." };

  const typeLabel = payrollRunTypeLabel(run);
  const fallbackName = buildPayrollCompanyDocumentFileName(run, typeLabel);
  try {
    const buildSlip = await resolvePayslipBlobBuilder();
    if (!buildSlip) {
      return { ok: false, message: "Desprendible de Gestión humana no disponible." };
    }
    const packed = await buildSlip(run);
    if (!packed?.blob) {
      return { ok: false, message: "No se pudo generar la colilla con el formato de Gestión humana." };
    }
    const fileName = packed.fileName || fallbackName;
    const file = new File([packed.blob], fileName, {
      type: packed.mimeType || "application/pdf"
    });
    const uploaded = await uploadFileToR2(file, folder);
    const by = actor();
    const nowIso = new Date().toISOString();
    const description = `Colilla de pago (Gestión humana) · ${typeLabel} · ${run.month || ""} · neto ${fmtCop(run.net)} · ${runMarker} · ${PAYSLIP_LAYOUT_MARKER}`;
    if (existing?.id) {
      const updated = normalizeCompanyDocumentRow({
        ...existing,
        fileName: uploaded.fileName || fileName,
        type: "PDF",
        documentCategory: "comprobante_pago",
        folder: uploaded.folder || existing.folder || folder,
        mimeType: uploaded.mimeType || "application/pdf",
        sizeBytes: Number(uploaded.sizeBytes) || file.size || 0,
        storageKey: uploaded.key,
        description,
        tags: "comprobante_pago",
        updatedAt: nowIso,
        ...employeeEntityMeta(employee),
        process: "rrhh"
      });
      await writeAwaitServerEdit(
        KEYS.companyDocuments,
        readDocs().map((d) => (d.id === existing.id ? updated : d)),
        existing.id
      );
      return { ok: true, updated: true, path: folder, fileName: updated.fileName, id: updated.id };
    }
    const record = normalizeCompanyDocumentRow({
      id: newUuidV4(),
      fileName: uploaded.fileName || fileName,
      type: "PDF",
      documentCategory: "comprobante_pago",
      folder: uploaded.folder || folder,
      mimeType: uploaded.mimeType || "application/pdf",
      sizeBytes: Number(uploaded.sizeBytes) || file.size || 0,
      storageKey: uploaded.key,
      description,
      tags: "comprobante_pago",
      uploadedBy: by,
      createdAt: nowIso,
      updatedAt: nowIso,
      ...employeeEntityMeta(employee),
      process: "rrhh"
    });
    await writeAwaitServerCreate(KEYS.companyDocuments, [...readDocs(), record], record);
    return { ok: true, created: true, path: folder, fileName: record.fileName, id: record.id };
  } catch (err) {
    devWarn("[companyDocuments] archivePayrollRun", err?.message || err);
    return { ok: false, message: String(err?.message || err) };
  }
}

async function ensureCompactPayslipDocument(doc) {
  if (!isPayrollSlipDocument(doc) || payrollSlipDocHasCurrentLayout(doc)) return doc;
  const runId = payrollRunIdFromSlipDoc(doc);
  if (!runId) return doc;
  const run = read(KEYS.payrollRuns, []).find((r) => String(r.id) === runId);
  if (!run?.paid) return doc;
  const res = await archivePayrollRunToEmployeeFolder(run, { force: true });
  if (!res?.ok) return doc;
  return readDocs().find((d) => String(d.id) === String(res.id || doc.id)) || doc;
}

/** Metadatos de clasificación para evidencias archivadas en el expediente del colaborador. */
function employeeEntityMeta(employee) {
  const id = String(employee?.id || "").trim();
  const name = String(employee?.name || employee?.fullName || "").trim();
  return {
    entityType: "empleado",
    entityId: id,
    entityLabel: name,
    process: "rrhh"
  };
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
  description,
  force = false
}) {
  if (!employee?.id || !blob || !fileName || !marker) return { ok: false, skipped: true };
  if (!force && hasHireDocMarker(marker)) return { ok: true, skipped: true };
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
      updatedAt: nowIso,
      ...employeeEntityMeta(employee),
      process: cat === "contrato" || cat === "hoja_vida" ? "contratacion" : "rrhh"
    });
    await writeAwaitServerCreate(KEYS.companyDocuments, [...readDocs(), record], record);
    return {
      ok: true,
      created: true,
      id: record.id,
      path: folder,
      fileName: record.fileName,
      storageKey: record.storageKey
    };
  } catch (err) {
    devWarn("[companyDocuments] archiveBlob", err?.message || err);
    return { ok: false, message: String(err?.message || err) };
  }
}

/**
 * Archiva el soporte de una ausencia en `01. Empleados / Nombre`.
 * Idempotente por `absenceId=` salvo `force` (reemplazo en edición).
 */
async function archiveAbsenceSupportToEmployeeFolder({ employee, file, absence, force = false } = {}) {
  if (!employee?.id || !file || !absence?.id) return { ok: false, skipped: true };
  const marker = absenceSupportDocumentMarker(absence.id);
  if (!marker) return { ok: false, message: "Ausencia sin identificador." };
  const typeLabel =
    typeof payrollAbsenceTypeLabel === "function"
      ? payrollAbsenceTypeLabel(absence.absenceType)
      : String(absence.absenceType || "Ausencia");
  const fileName = buildAbsenceSupportCompanyFileName(absence, file.name, typeLabel);
  const result = await archiveBlobToEmployeeFolder({
    employee,
    blob: file,
    fileName,
    mimeType: file.type,
    documentCategory: "soporte_ausencia",
    marker,
    force: Boolean(force),
    description: `Soporte de ausencia · ${typeLabel} · ${absence.startDate || ""} → ${absence.endDate || ""}`
  });
  if (result?.ok && result.skipped && !result.id) {
    const existing = readDocs().find((d) => String(d.description || "").includes(marker));
    if (existing) {
      return {
        ok: true,
        skipped: true,
        id: existing.id,
        path: existing.folder,
        fileName: existing.fileName,
        storageKey: existing.storageKey
      };
    }
  }
  return result;
}

/**
 * Genera el Word oficial (misma plantilla y merge que Gestión humana / Contratación).
 * @returns {{ blob: Blob, fileName: string, kind: string, employee: object } | null}
 */
async function buildContractBlobForEmployee(employee) {
  const buildBlob = window.RecruitmentDomain?.buildEmployeeContractDocxBlob;
  if (typeof buildBlob !== "function") return null;
  try {
    const prepareFn =
      typeof window.prepareEmployeeForContractDocx === "function"
        ? window.prepareEmployeeForContractDocx
        : prepareEmployeeForContractDocx;
    const validateFn =
      typeof window.validateEmployeeContractDocFields === "function"
        ? window.validateEmployeeContractDocFields
        : validateEmployeeContractDocFields;
    const payloadFn =
      typeof window.buildEmployeeContractDocxPayload === "function"
        ? window.buildEmployeeContractDocxPayload
        : buildEmployeeContractDocxPayload;

    const emp = prepareFn(employee);
    const missing = typeof validateFn === "function" ? validateFn(emp) : [];
    if (Array.isArray(missing) && missing.length) {
      return { ok: false, skipped: true, message: `Faltan datos del contrato: ${missing.join(", ")}` };
    }
    const payload = payloadFn(emp, {
      contractTemplateKind: emp.contractTemplateKind,
      signDate: emp.startDate || emp.contractVigenteStartDate
    });
    const built = await buildBlob(payload);
    if (!built?.blob) return null;
    return { ...built, employee: emp, ok: true };
  } catch (err) {
    devWarn("[companyDocuments] buildContractBlob", err?.message || err);
    return null;
  }
}

/** Archiva el contrato Word oficial (plantilla Antares) en la carpeta del colaborador. */
async function archiveEmployeeContractToFolder(employee, opts = {}) {
  if (!employee?.id) return { ok: false, skipped: true };
  const signKey = String(
    opts.signDate || employee.contractVigenteStartDate || employee.startDate || ""
  )
    .trim()
    .slice(0, 10);
  const markerKind = signKey ? `contrato_oficial:${signKey}` : "contrato_oficial";
  const marker = employeeHireDocumentMarker(employee.id, markerKind);
  if (!opts.force && hasHireDocMarker(marker)) return { ok: true, skipped: true };

  let built = opts.built && opts.built.blob ? opts.built : null;
  if (!built) built = await buildContractBlobForEmployee(employee);
  if (!built?.blob) {
    return {
      ok: false,
      skipped: true,
      message: built?.message || "No se pudo generar el contrato Word oficial."
    };
  }
  const emp = built.employee || employee;
  const fileName = buildEmployeeContractCompanyFileName(emp, built.kind || emp.contractTemplateKind || "oficina");
  return archiveBlobToEmployeeFolder({
    employee: emp,
    blob: built.blob,
    fileName,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    documentCategory: "contrato",
    marker,
    description: `Contrato laboral oficial · plantilla ${built.kind || ""} · ${emp.name || ""}`
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

async function archiveEmployeePhotoToFolder(employee, opts = {}) {
  if (!employee?.id) return { ok: false, skipped: true };
  const marker = employeeHireDocumentMarker(employee.id, "foto");
  if (!opts.force && hasHireDocMarker(marker)) return { ok: true, skipped: true };
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

async function archiveEmployeeLaborLetterToFolder(employee, opts = {}) {
  if (!employee?.id) return { ok: false, skipped: true };
  const marker = employeeHireDocumentMarker(employee.id, "carta_oficial");
  if (!opts.force && hasHireDocMarker(marker)) return { ok: true, skipped: true };

  const letterApi = window.AntaresEmploymentLetter || {};
  const validate =
    typeof letterApi.validateEmploymentLetterRequest === "function"
      ? letterApi.validateEmploymentLetterRequest
      : null;
  const buildPdf =
    typeof letterApi.buildEmploymentLetterPdfBlob === "function"
      ? letterApi.buildEmploymentLetterPdfBlob
      : null;
  if (!buildPdf) return { ok: false, skipped: true, message: "Módulo de carta laboral no disponible." };

  const ensureFields =
    typeof window.ensureEmployeeContractFields === "function" ? window.ensureEmployeeContractFields : (e) => e;
  const normalizeDates =
    typeof window.normalizePayrollEmployeeRowDates === "function"
      ? window.normalizePayrollEmployeeRowDates
      : (e) => e;
  const normalized = normalizeDates(ensureFields(employee));

  const terminated =
    normalized?.active === false ||
    String(normalized?.active || "").toLowerCase() === "false" ||
    /retir|inactiv|terminad/i.test(String(normalized?.status || "")) ||
    Boolean(String(normalized?.terminationDate || "").trim());
  const letterKind = terminated ? "retiro" : "vigente";
  const termDate = String(normalized?.terminationDate || colombiaTodayIsoDate()).trim().slice(0, 10);
  const letterOpts = {
    letterKind,
    letterDate: colombiaTodayIsoDate(),
    addressee: "A quien interese",
    terminationDate: letterKind === "retiro" ? termDate : undefined,
    terminationCause: String(normalized?.terminationCause || "otro").trim() || "otro",
    includeSalary: true,
    includeSocialSecurity: true
  };
  if (typeof validate === "function") {
    const check = validate(normalized, letterOpts);
    if (!check?.ok) return { ok: false, skipped: true, message: check?.message || "Datos insuficientes para carta." };
  }
  try {
    const built = await buildPdf(normalized, letterOpts);
    if (!built?.ok || !built.blob) {
      return { ok: false, message: built?.message || "No se pudo generar la carta laboral." };
    }
    const fileName = buildEmployeeLaborLetterCompanyFileName(normalized, letterKind);
    return archiveBlobToEmployeeFolder({
      employee: normalized,
      blob: built.blob,
      fileName,
      mimeType: "application/pdf",
      documentCategory: "carta_laboral",
      marker,
      description: `Carta laboral (${letterKind}) · formato oficial · ${normalized.name || ""}`
    });
  } catch (err) {
    devWarn("[companyDocuments] archiveLaborLetter", err?.message || err);
    return { ok: false, message: String(err?.message || err) };
  }
}

/**
 * Archiva en la carpeta del colaborador solo lo oficial:
 * - contrato Word (plantilla Antares)
 * - carta laboral (formato oficial GH)
 * Foto/CV/legacy quedan opt-in. Las colillas solo se archivan al marcar pago en GH.
 */
async function archiveEmployeeHirePackageToFolder(employee, opts = {}) {
  if (!employee?.id) return { ok: false, skipped: true };
  const results = {
    contract: null,
    photo: null,
    letter: null,
    cv: null,
    legacy: null
  };
  if (opts.includeContract !== false) {
    try {
      results.contract = await archiveEmployeeContractToFolder(employee, {
        force: opts.forceContract === true || opts.forceAll === true
      });
    } catch (err) {
      results.contract = { ok: false, message: String(err?.message || err) };
    }
  }
  if (opts.includeLaborLetter !== false) {
    try {
      results.letter = await archiveEmployeeLaborLetterToFolder(employee, {
        force: opts.forceLetter === true || opts.forceAll === true
      });
    } catch (err) {
      results.letter = { ok: false, message: String(err?.message || err) };
    }
  }
  if (opts.includePhoto === true) {
    try {
      results.photo = await archiveEmployeePhotoToFolder(employee, {
        force: opts.forcePhoto === true || opts.forceAll === true
      });
    } catch (err) {
      results.photo = { ok: false, message: String(err?.message || err) };
    }
  }
  if (opts.includeCv === true) {
    try {
      results.cv = await archiveEmployeeCandidateCvToFolder(employee, opts.candidateId);
    } catch (err) {
      results.cv = { ok: false, message: String(err?.message || err) };
    }
  }
  if (opts.includeLegacyDocs === true) {
    try {
      results.legacy = await archiveEmployeeLegacyDocsToFolder(employee);
    } catch (err) {
      results.legacy = { ok: false, message: String(err?.message || err) };
    }
  }
  const created =
    Number(!!results.contract?.created) +
    Number(!!results.photo?.created) +
    Number(!!results.letter?.created) +
    Number(!!results.cv?.created) +
    Number(results.legacy?.created || 0);
  return { ok: true, created, results };
}

const DMS_EMPLOYEE_BACKFILL_BATCH = 1;
const dmsEmployeeBackfillAttempted = new Set();
let dmsBackfillNotifyStarted = false;
let dmsBackfillHadWork = false;
let dmsResetRecreatePromise = null;
let dmsOfficialBackfillPromise = null;

const DMS_RESET_RECREATE_FLAG = "antares-dms-purge-recreate-v20260804c";

function employeeHasOfficialContractArchived(employeeId) {
  const id = String(employeeId || "").trim();
  if (!id) return false;
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`employeeHireDoc=contrato_oficial(?::\\d{4}-\\d{2}-\\d{2})?:${escaped}(?:\\b|\\s|$)`);
  return readDocs().some((d) => re.test(String(d.description || "")));
}

function employeeNeedsDmsBackfill(emp, { forceAll = false } = {}) {
  const id = String(emp.id);
  if (dmsEmployeeBackfillAttempted.has(id)) return false;
  if (forceAll) return true;
  const needsContract = !employeeHasOfficialContractArchived(id);
  const needsLetter = !hasHireDocMarker(employeeHireDocumentMarker(id, "carta_oficial"));
  return needsContract || needsLetter;
}

/** Borra todos los documentos del DMS corporativo en servidor + memoria. */
async function purgeAllCompanyDocuments() {
  const docs = readDocs();
  const ids = docs.map((d) => String(d.id || "").trim()).filter(Boolean);
  if (!ids.length) return { ok: true, deleted: 0 };
  const prev = docs.slice();
  try {
    await writeAwaitServerDelete(KEYS.companyDocuments, [], ids, { notifyOnFailure: false });
    return { ok: true, deleted: ids.length };
  } catch (err) {
    /* Restaura lectura local si el delete falló a medias. */
    try {
      const { write } = await import("../core/data-io.js");
      write(KEYS.companyDocuments, prev, { skipSyncSchedule: true });
    } catch (_e) {
      /* noop */
    }
    devWarn("[companyDocuments] purgeAll", err?.message || err);
    return { ok: false, deleted: 0, message: String(err?.message || err) };
  }
}

function resetDmsBackfillState() {
  dmsEmployeeBackfillAttempted.clear();
  dmsBackfillNotifyStarted = false;
  dmsBackfillHadWork = false;
}

/**
 * Rellena solo contratos oficiales y cartas laborales oficiales (faltantes).
 * Con `forceAll` regenera esos dos tipos para todos los colaboradores.
 */
async function backfillEmployeeHireDocuments(opts = {}) {
  const forceAll = opts.forceAll === true;
  if (!canUpload()) return { created: 0, pending: 0 };
  if (!dmsBackfillNotifyStarted) {
    dmsBackfillNotifyStarted = true;
    G.notify?.(
      forceAll
        ? "Regenerando contratos y cartas laborales oficiales en Gestión documental…"
        : "Archivando contratos y cartas laborales oficiales en Gestión documental…",
      "info"
    );
  }

  const employees = read(KEYS.payrollEmployees, []).filter((e) => e?.id && String(e.name || "").trim());
  let created = 0;
  let pending = employees.filter((e) => employeeNeedsDmsBackfill(e, { forceAll })).length;

  while (pending > 0) {
    const pendingEmps = employees.filter((e) => employeeNeedsDmsBackfill(e, { forceAll }));
    if (!pendingEmps.length) break;
    for (const emp of pendingEmps.slice(0, DMS_EMPLOYEE_BACKFILL_BATCH)) {
      dmsEmployeeBackfillAttempted.add(String(emp.id));
      const res = await archiveEmployeeHirePackageToFolder(emp, {
        includeContract: true,
        includeLaborLetter: true,
        includePhoto: false,
        includeCv: false,
        includeLegacyDocs: false,
        forceContract: forceAll,
        forceLetter: forceAll
      });
      created += Number(res?.created || 0);
    }
    if (created > 0) dmsBackfillHadWork = true;
    pending = employees.filter((e) => employeeNeedsDmsBackfill(e, { forceAll })).length;
    if (pending > 0) await new Promise((r) => setTimeout(r, 700));
  }

  if (dmsBackfillHadWork) {
    dmsBackfillHadWork = false;
    G.notify?.("Gestión documental: contratos y cartas laborales actualizados.", "success");
    if (String(state.currentView || "") === "document-management") {
      G.renderPortalView?.();
    }
  }

  return { created, pending: 0 };
}

/** Archiva o actualiza colillas de liquidaciones pagadas al formato de 1 hoja. */
async function backfillPaidPayrollSlips() {
  if (!canUpload()) return { created: 0 };
  const buildSlip = await resolvePayslipBlobBuilder();
  if (!buildSlip) {
    return { created: 0, skipped: true };
  }
  const runs = read(KEYS.payrollRuns, []).filter((r) => r?.id && r.employeeId && r.paid);
  let created = 0;
  const BATCH = 1;
  for (let i = 0; i < runs.length; i += BATCH) {
    const slice = runs.slice(i, i + BATCH);
    for (const run of slice) {
      try {
        const res = await archivePayrollRunToEmployeeFolder(run);
        if (res?.created || res?.updated) created += 1;
      } catch (err) {
        devWarn("[companyDocuments] backfillPaidSlip", err?.message || err);
      }
    }
    if (i + BATCH < runs.length) {
      await new Promise((r) => setTimeout(r, 450));
    }
  }
  return { created };
}

/**
 * Al abrir DMS: contratos/cartas faltantes + colillas pagadas de GH.
 * Sin borrar nada. Idempotente y en segundo plano.
 */
async function runOfficialEmployeeDocumentsBackfill() {
  if (!canUpload()) return { ok: false, skipped: true };
  if (dmsOfficialBackfillPromise) return dmsOfficialBackfillPromise;
  dmsOfficialBackfillPromise = (async () => {
    await new Promise((r) => setTimeout(r, 400));
    resetDmsBackfillState();
    const hire = await backfillEmployeeHireDocuments({ forceAll: false });
    const slips = await backfillPaidPayrollSlips();
    if ((Number(hire?.created || 0) > 0 || Number(slips?.created || 0) > 0) &&
      String(state.currentView || "") === "document-management") {
      G.renderPortalView?.();
    }
    if (Number(slips?.created || 0) > 0) {
      G.notify?.("Gestión documental: comprobantes de pago actualizados a 1 hoja.", "success");
    }
    return { ok: true, hire, slips };
  })().finally(() => {
    dmsOfficialBackfillPromise = null;
  });
  return dmsOfficialBackfillPromise;
}

/**
 * Purge + regeneración. SOLO bajo demanda: `resetAndRecreateCompanyDocuments({ force: true })`.
 * No se ejecuta al abrir el módulo.
 */
async function resetAndRecreateCompanyDocuments({ force = false } = {}) {
  if (!canUpload()) return { ok: false, skipped: true };
  if (!force) return { ok: true, skipped: true, message: "Requiere force:true" };
  if (dmsResetRecreatePromise) return dmsResetRecreatePromise;

  dmsResetRecreatePromise = (async () => {
    G.notify?.("Limpiando Gestión documental y regenerando archivos oficiales…", "info");
    const purged = await purgeAllCompanyDocuments();
    if (!purged.ok) {
      G.notify?.(purged.message || "No se pudieron borrar los documentos actuales.", "error");
      return { ok: false, purged };
    }
    resetDmsBackfillState();
    await ensureCompanyDocumentStructure({ skipBackfill: true });
    resetDmsBackfillState();
    const backfill = await backfillEmployeeHireDocuments({ forceAll: true });
    const slips = await backfillPaidPayrollSlips();
    try {
      localStorage.setItem(DMS_RESET_RECREATE_FLAG, "1");
    } catch (_e) {
      /* noop */
    }
    return { ok: true, deleted: purged.deleted, backfill, slips };
  })().finally(() => {
    dmsResetRecreatePromise = null;
  });

  return dmsResetRecreatePromise;
}

if (typeof window !== "undefined") {
  window.archivePayrollRunToEmployeeFolder = archivePayrollRunToEmployeeFolder;
  window.archiveAbsenceSupportToEmployeeFolder = archiveAbsenceSupportToEmployeeFolder;
  window.archiveEmployeeHirePackageToFolder = archiveEmployeeHirePackageToFolder;
  window.archiveEmployeeContractToFolder = archiveEmployeeContractToFolder;
  window.archiveEmployeePhotoToFolder = archiveEmployeePhotoToFolder;
  window.archiveEmployeeLaborLetterToFolder = archiveEmployeeLaborLetterToFolder;
  window.backfillEmployeeHireDocuments = backfillEmployeeHireDocuments;
  window.backfillPaidPayrollSlips = backfillPaidPayrollSlips;
  window.runOfficialEmployeeDocumentsBackfill = runOfficialEmployeeDocumentsBackfill;
  window.resetAndRecreateCompanyDocuments = resetAndRecreateCompanyDocuments;
  window.purgeAllCompanyDocuments = purgeAllCompanyDocuments;
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
async function ensureCompanyDocumentStructure(opts = {}) {
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
    /* Carpetas sí; relleno masivo de contratos/cartas solo si se pide (congelaba el portal). */
    if (opts.skipBackfill !== true && opts.runHireBackfill === true) {
      try {
        const backfill = await backfillEmployeeHireDocuments();
        created += Number(backfill?.created || 0);
      } catch (err) {
        devWarn("[companyDocuments] ensureStructure.backfillHireDocs", err?.message || err);
      }
    }
    return { created };
  })().finally(() => {
    ensureStructurePromise = null;
  });
  return ensureStructurePromise;
}

function documentCategoryOptionsHtml(selected = "otro") {
  const sel = String(selected || "otro");
  return documentCategories().map((c) => ({
    value: c.value,
    label: c.label,
    selected: c.value === sel
  }));
}

function selectOptionsHtml(items, selected) {
  const sel = String(selected || "");
  return (items || [])
    .map(
      (o) =>
        `<option value="${escapeAttr(o.value)}"${String(o.value) === sel ? " selected" : ""}>${escapeHtml(o.label)}</option>`
    )
    .join("");
}

function documentMetaFieldsHtml(values = {}, { includeFolderHint = false } = {}) {
  const cats = documentCategories();
  const selectedCat = findCompanyDocumentCategory(values.documentCategory || "otro", customDocumentTypes());
  const entityType = String(values.entityType || "");
  const entityOpts = entityOptionsForType(entityType);
  return `<section class="doc-upload-modal__section">
    <header class="doc-upload-modal__head">
      <span class="doc-upload-modal__step">4</span>
      <div>
        <h4 class="doc-upload-modal__title">Clasificación y vigencia</h4>
        <p class="doc-upload-modal__hint">Asocie el documento a una entidad, proceso y fechas de control</p>
      </div>
    </header>
    <div class="doc-meta-grid">
      <label class="doc-upload-modal__select-wrap">
        <span>Proceso</span>
        <select name="process">${selectOptionsHtml([{ value: "", label: "Sin proceso" }, ...COMPANY_DOCUMENT_PROCESSES], values.process || selectedCat?.process || "")}</select>
      </label>
      <label class="doc-upload-modal__select-wrap">
        <span>Área / necesidad</span>
        <input type="text" name="area" maxlength="80" value="${escapeAttr(values.area || selectedCat?.area || "")}" placeholder="Ej. flota, SST, nómina" />
      </label>
      <label class="doc-upload-modal__select-wrap">
        <span>Clasificar por entidad</span>
        <select name="entityType" data-doc-entity-type>
          ${selectOptionsHtml([{ value: "", label: "Sin entidad" }, ...COMPANY_DOCUMENT_ENTITY_TYPES], entityType)}
        </select>
      </label>
      <label class="doc-upload-modal__select-wrap">
        <span>Entidad</span>
        <select name="entityId" data-doc-entity-id>${selectOptionsHtml(entityOpts, values.entityId || "")}</select>
        <small>También puede escribir un nombre libre si no está parametrizado.</small>
      </label>
      <label class="doc-upload-modal__select-wrap">
        <span>Nombre de entidad (si no está en lista)</span>
        <input type="text" name="entityLabel" maxlength="200" value="${escapeAttr(values.entityLabel || "")}" placeholder="Tercero, proceso u otra referencia" />
      </label>
      <label class="doc-upload-modal__select-wrap">
        <span>Código documental</span>
        <input type="text" name="documentCode" maxlength="64" value="${escapeAttr(values.documentCode || "")}" placeholder="Opcional" />
      </label>
      <label class="doc-upload-modal__select-wrap">
        <span>Fecha de emisión</span>
        <input type="date" name="issuedAt" value="${escapeAttr(values.issuedAt || "")}" />
      </label>
      <label class="doc-upload-modal__select-wrap">
        <span>Fecha de vencimiento</span>
        <input type="date" name="expiresAt" value="${escapeAttr(values.expiresAt || "")}" />
      </label>
    </div>
    ${includeFolderHint ? `<p class="doc-upload-modal__hint">Si asocia un empleado, conductor, vehículo o tercero, se sugerirá la carpeta de evidencias correspondiente.</p>` : ""}
  </section>`;
}

function wireDocumentMetaFields(formEl) {
  if (!formEl) return;
  const typeSel = formEl.querySelector("[data-doc-entity-type]");
  const idSel = formEl.querySelector("[data-doc-entity-id]");
  const labelInput = formEl.querySelector("[name='entityLabel']");
  const processSel = formEl.querySelector("[name='process']");
  const areaInput = formEl.querySelector("[name='area']");
  const expiresInput = formEl.querySelector("[name='expiresAt']");
  const catInput = formEl.querySelector("[data-doc-category-input]");
  const syncEntity = () => {
    if (!idSel || !typeSel) return;
    const current = idSel.value;
    idSel.innerHTML = selectOptionsHtml(entityOptionsForType(typeSel.value), current);
    const chosen = entityOptionsForType(typeSel.value).find((o) => o.value && o.value === idSel.value);
    if (chosen && labelInput && !String(labelInput.value || "").trim()) labelInput.value = chosen.label;
  };
  typeSel?.addEventListener("change", syncEntity);
  idSel?.addEventListener("change", () => {
    const chosen = entityOptionsForType(typeSel?.value).find((o) => o.value && o.value === idSel.value);
    if (chosen && labelInput) labelInput.value = chosen.label;
  });
  const applyCategoryDefaults = (value) => {
    const cat = findCompanyDocumentCategory(value, customDocumentTypes());
    if (!cat) return;
    if (processSel && !String(processSel.value || "").trim()) processSel.value = cat.process || "";
    if (areaInput && !String(areaInput.value || "").trim()) areaInput.value = cat.area || "";
    if (expiresInput) expiresInput.required = Boolean(cat.requiresExpiry);
  };
  catInput && applyCategoryDefaults(catInput.value);
  formEl.querySelector("[data-doc-category-select]")?.addEventListener("change", (e) => applyCategoryDefaults(e.target.value));
}

function readMetaFromForm(form) {
  const entityType = String(form.entityType || "").trim();
  const entityId = String(form.entityId || "").trim();
  const entityLabel =
    String(form.entityLabel || "").trim() || resolveEntityLabel(entityType, entityId);
  return {
    process: String(form.process || "").trim(),
    area: String(form.area || "").trim(),
    entityType,
    entityId,
    entityLabel,
    documentCode: String(form.documentCode || "").trim(),
    issuedAt: String(form.issuedAt || "").trim(),
    expiresAt: String(form.expiresAt || "").trim()
  };
}

async function supersedePreviousVersions(incoming) {
  const docs = readDocs();
  const next = nextDocumentVersionState(docs, incoming);
  const versionGroup = next.versionGroup || incoming.id;
  for (const id of next.previousIds || []) {
    const prev = docs.find((d) => String(d.id) === String(id));
    if (!prev) continue;
    const updated = normalizeCompanyDocumentRow({
      ...prev,
      isCurrentVersion: false,
      versionGroup,
      updatedAt: new Date().toISOString()
    });
    await writeAwaitServerEdit(
      KEYS.companyDocuments,
      readDocs().map((d) => (d.id === prev.id ? updated : d)),
      prev.id
    );
  }
  return {
    version: next.previousIds.length ? next.version : incoming.version || 1,
    versionGroup,
    superseded: next.previousIds.length
  };
}

async function saveCustomDocumentTypes(types) {
  const folders = readFolders();
  const payload = serializeDocumentTypesCatalog(types);
  const existing = folders.find((f) => folderKey(f.folderName) === folderKey(DOCUMENT_TYPES_CATALOG_FOLDER));
  if (existing) {
    const updated = normalizeCompanyFolderRow({ ...existing, description: payload });
    await writeAwaitServerEdit(
      KEYS.companyDocumentFolders,
      folders.map((f) => (f.id === existing.id ? updated : f)),
      existing.id
    );
    return;
  }
  const record = normalizeCompanyFolderRow({
    id: newUuidV4(),
    folderName: DOCUMENT_TYPES_CATALOG_FOLDER,
    description: payload,
    createdBy: actor(),
    createdAt: new Date().toISOString()
  });
  await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...folders, record], record);
}

function openUploadModal() {
  if (!canUpload()) return;
  const rawFolder = getUi().folderFilter;
  const currentFolder = normalizeCompanyFolder(
    !rawFolder || rawFolder === "*" ? EMPLOYEES_ROOT_FOLDER : rawFolder
  );
  const lockDestination = folderSegments(currentFolder).length >= 2;
  const folderOpts = folderOptionsHtml(currentFolder);
  const categoryOpts = documentCategoryOptionsHtml("otro");
  const categoryChips = documentCategories()
    .slice(0, 16)
    .map(
      (c) =>
        `<button type="button" class="doc-upload-chip${c.value === "otro" ? " is-selected" : ""}" data-doc-cat="${escapeAttr(c.value)}" aria-pressed="${c.value === "otro" ? "true" : "false"}">${escapeHtml(c.label)}</button>`
    )
    .join("");
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
          ${documentMetaFieldsHtml({}, { includeFolderHint: !lockDestination })}
          <label class="doc-upload-modal__select-wrap">
            <span>Observaciones (opcional)</span>
            <textarea name="description" rows="2" maxlength="2000" placeholder="Notas internas"></textarea>
          </label>
        </div>`
      }
    ],
    afterMount: (formEl) => {
      wireDropzone(formEl);
      wireDocumentMetaFields(formEl);
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
        const cat = findCompanyDocumentCategory(v, customDocumentTypes());
        const processSel = formEl?.querySelector("[name='process']");
        const areaInput = formEl?.querySelector("[name='area']");
        if (cat && processSel) processSel.value = cat.process || processSel.value;
        if (cat && areaInput && !String(areaInput.value || "").trim()) areaInput.value = cat.area || "";
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
      const description = String(form.description || "").trim();
      const meta = readMetaFromForm(form);
      const by = actor();
      const categoryLabel = getCompanyDocumentCategoryLabel(documentCategory, customDocumentTypes()) || documentCategory;
      let folder = normalizeCompanyFolder(
        lockDestination
          ? currentFolder
          : String(form.folderNew || "").trim() ||
              String(form.folderExisting || "").trim() ||
              suggestedFolderForEntity(meta.entityType, meta.entityLabel) ||
              currentFolder ||
              DEFAULT_COMPANY_FOLDER
      );
      if (!canUploadFolder(readFolders(), folder)) {
        G.notify?.("No tiene permiso para subir a esa carpeta.", "error");
        return false;
      }
      let ok = 0;
      for (const file of files) {
        try {
          const uploaded = await uploadFileToR2(file, folder);
          const nowIso = new Date().toISOString();
          const recordId = newUuidV4();
          const versionState = await supersedePreviousVersions({
            id: recordId,
            folder,
            documentCategory,
            entityType: meta.entityType,
            entityId: meta.entityId,
            entityLabel: meta.entityLabel
          });
          const record = normalizeCompanyDocumentRow({
            id: recordId,
            fileName: uploaded.fileName || file.name,
            type: fileTypeLabel(uploaded.fileName || file.name, uploaded.mimeType || file.type),
            documentCategory,
            folder: normalizeCompanyFolder(uploaded.folder || folder),
            mimeType: uploaded.mimeType || file.type || "application/octet-stream",
            sizeBytes: Number(uploaded.sizeBytes) || file.size || 0,
            storageKey: uploaded.key,
            description,
            uploadedBy: by,
            createdAt: nowIso,
            updatedAt: nowIso,
            ...meta,
            version: versionState.version,
            versionGroup: versionState.versionGroup || recordId,
            isCurrentVersion: true
          });
          record.tags = serializeCompanyDocumentTags(record);
          await writeAwaitServerCreate(KEYS.companyDocuments, [...readDocs(), record], record);
          G.logPortalAuditEvent?.("documents", "create", {
            entityId: record.id,
            entityKind: "document",
            entityLabel: `${record.folder} · ${record.fileName}`,
            summary: `${versionState.superseded ? "Nueva versión de documento" : "Alta de documento"} · ${categoryLabel} · ${record.fileName}`,
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
  const rawParent = parentPathRaw || getUi().folderFilter || "";
  const parent = normalizeCompanyFolder(rawParent === "*" ? "" : rawParent);
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
  const targetPath = normalizeCompanyFolder(folderNameRaw);
  const topFolder = topFolderName(targetPath);
  if (!targetPath || !topFolder) return;
  const isNested = folderKey(targetPath) !== folderKey(topFolder);
  const folders = readFolders();
  const topRec = folders.find((f) => folderKey(f.folderName) === folderKey(topFolder)) || null;
  const targetRec = folders.find((f) => folderKey(f.folderName) === folderKey(targetPath)) || null;
  const currentRoles = {
    view: (topRec?.rolesView || []).slice(),
    upload: (topRec?.rolesUpload || []).slice(),
    delete: (topRec?.rolesDelete || []).slice()
  };
  const currentUsers = {
    view: (targetRec?.usersView || []).slice(),
    upload: (targetRec?.usersUpload || []).slice(),
    delete: (targetRec?.usersDelete || []).slice()
  };
  const roleChoices = PORTAL_ASSIGNABLE_ROLES.filter((r) => r.value !== "admin");
  const roleLabel = (slug) => PORTAL_ASSIGNABLE_ROLES.find((r) => r.value === slug)?.label || slug;
  const actions = [
    { key: "view", label: "Ver" },
    { key: "upload", label: "Subir" },
    { key: "delete", label: "Eliminar" }
  ];
  const roleRows = roleChoices
    .map(
      (r) => `<tr>
        <th scope="row">${escapeHtml(r.label)}</th>
        ${actions
          .map((a) => {
            const checked = currentRoles[a.key].includes(r.value) ? " checked" : "";
            return `<td><label class="doc-perm-check"><input type="checkbox" data-perm data-act="${a.key}" data-role="${escapeAttr(r.value)}"${checked}/></label></td>`;
          })
          .join("")}
      </tr>`
    )
    .join("");
  const userChoices = read(KEYS.users, [])
    .filter((u) => u && String(u.id || "").trim())
    .filter((u) => String(u.active ?? "true").toLowerCase() !== "false")
    .filter((u) => String(u.role || "").toLowerCase() !== "admin")
    .map((u) => {
      const id = String(u.id).trim();
      const name = getPortalUserDisplayName(u) || String(u.name || u.email || "Usuario").trim() || "Usuario";
      const email = String(u.email || "").trim();
      const role = String(u.role || "").trim().toLowerCase();
      return { id, name, email, role };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  const userRows = userChoices.length
    ? userChoices
        .map((u) => {
          const search = `${u.name} ${u.email} ${u.role} ${roleLabel(u.role)}`.toLowerCase();
          return `<tr data-perm-user-row data-search="${escapeAttr(search)}">
            <th scope="row">
              <span class="doc-perm-user-name">${escapeHtml(u.name)}</span>
              <span class="doc-perm-user-meta">${escapeHtml([roleLabel(u.role), u.email].filter(Boolean).join(" · "))}</span>
            </th>
            ${actions
              .map((a) => {
                const checked = currentUsers[a.key].includes(u.id.toLowerCase()) || currentUsers[a.key].includes(u.id) ? " checked" : "";
                return `<td><label class="doc-perm-check"><input type="checkbox" data-perm-user data-act="${a.key}" data-user="${escapeAttr(u.id)}"${checked}/></label></td>`;
              })
              .join("")}
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="4" class="doc-perm-empty">No hay usuarios activos para asignar.</td></tr>`;
  G.openEditModal?.({
    title: `Permisos · ${isNested ? folderLeafName(targetPath) : topFolder}`,
    subtitle: isNested
      ? `Acceso a «${targetPath}» y sus subcarpetas. Los roles de la carpeta principal (${topFolder}) siguen aplicando al resto de la rama.`
      : "Defina qué roles o usuarios pueden ver, subir o eliminar en esta carpeta y sus subcarpetas.",
    submitText: "Guardar permisos",
    fields: [
      {
        type: "custom",
        id: "doc-perm-field",
        html: `<div class="doc-perm-modal">
          <p class="doc-perm-help">Solo el administrador puede asignar permisos. Un usuario marcado queda limitado a esta carpeta (y subcarpetas): no verá el resto del gestor. Si no marca roles ni usuarios, la acción queda abierta a quien tenga el permiso global.</p>
          <h4 class="doc-perm-section-title">Por rol${isNested ? ` · carpeta principal (${escapeHtml(topFolder)})` : ""}</h4>
          <table class="doc-perm-grid"><thead><tr><th>Rol</th>${actions.map((a) => `<th>${a.label}</th>`).join("")}</tr></thead><tbody>${roleRows}</tbody></table>
          <h4 class="doc-perm-section-title">Usuarios con acceso solo a esta carpeta</h4>
          <label class="doc-perm-user-search">
            <input type="search" data-perm-user-search placeholder="Buscar por nombre, correo o rol…" autocomplete="off" aria-label="Buscar usuario" />
          </label>
          <div class="doc-perm-users-wrap">
            <table class="doc-perm-grid doc-perm-grid--users"><thead><tr><th>Usuario</th>${actions.map((a) => `<th>${a.label}</th>`).join("")}</tr></thead><tbody>${userRows}</tbody></table>
          </div>
        </div>`
      }
    ],
    afterMount: (formEl) => {
      const input = formEl?.querySelector("[data-perm-user-search]");
      const rows = [...(formEl?.querySelectorAll("[data-perm-user-row]") || [])];
      input?.addEventListener("input", () => {
        const q = String(input.value || "").trim().toLowerCase();
        rows.forEach((row) => {
          const hay = String(row.getAttribute("data-search") || "");
          row.hidden = Boolean(q) && !hay.includes(q);
        });
      });
    },
    onSubmit: async (_form, formEl) => {
      const roleChecks = [...(formEl?.querySelectorAll("input[data-perm]:checked") || [])];
      const userChecks = [...(formEl?.querySelectorAll("input[data-perm-user]:checked") || [])];
      const collectRoles = (act) => roleChecks.filter((c) => c.dataset.act === act).map((c) => c.dataset.role);
      const collectUsers = (act) => userChecks.filter((c) => c.dataset.act === act).map((c) => c.dataset.user);
      const rolesView = collectRoles("view");
      const rolesUpload = collectRoles("upload");
      const rolesDelete = collectRoles("delete");
      const usersView = collectUsers("view");
      const usersUpload = collectUsers("upload");
      const usersDelete = collectUsers("delete");
      const by = actor();
      const fresh = readFolders();
      const foundTop = fresh.find((f) => folderKey(f.folderName) === folderKey(topFolder)) || null;
      const foundTarget = fresh.find((f) => folderKey(f.folderName) === folderKey(targetPath)) || null;
      const sameRecord = foundTop && foundTarget && foundTop.id === foundTarget.id;
      try {
        let list = fresh;
        if (foundTop) {
          const patched = normalizeCompanyFolderRow({
            ...foundTop,
            rolesView,
            rolesUpload,
            rolesDelete,
            ...(sameRecord ? { usersView, usersUpload, usersDelete } : {})
          });
          list = list.map((f) => (f.id === foundTop.id ? patched : f));
          await writeAwaitServerEdit(KEYS.companyDocumentFolders, list, foundTop.id);
        } else if (!isNested) {
          const record = normalizeCompanyFolderRow({
            id: newUuidV4(),
            folderName: topFolder,
            rolesView,
            rolesUpload,
            rolesDelete,
            usersView,
            usersUpload,
            usersDelete,
            createdBy: by,
            createdAt: new Date().toISOString()
          });
          list = [...list, record];
          await writeAwaitServerCreate(KEYS.companyDocumentFolders, list, record);
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
          list = [...list, record];
          await writeAwaitServerCreate(KEYS.companyDocumentFolders, list, record);
        }
        if (isNested && !sameRecord) {
          const latest = readFolders();
          const foundNested = latest.find((f) => folderKey(f.folderName) === folderKey(targetPath)) || null;
          if (foundNested) {
            const nextList = latest.map((f) =>
              f.id === foundNested.id
                ? normalizeCompanyFolderRow({ ...f, usersView, usersUpload, usersDelete })
                : f
            );
            await writeAwaitServerEdit(KEYS.companyDocumentFolders, nextList, foundNested.id);
          } else {
            const record = normalizeCompanyFolderRow({
              id: newUuidV4(),
              folderName: targetPath,
              usersView,
              usersUpload,
              usersDelete,
              createdBy: by,
              createdAt: new Date().toISOString()
            });
            await writeAwaitServerCreate(KEYS.companyDocumentFolders, [...latest, record], record);
          }
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
  const versions = listDocumentVersionChain(readDocs(), target);
  const versionHtml = versions.length
    ? `<p class="doc-upload-modal__hint">Versión ${escapeHtml(String(target.version || 1))} de ${escapeHtml(String(versions.length))}. Subir el mismo tipo sobre la misma entidad crea una versión nueva y conserva el historial.</p>
       <ul class="doc-version-list">${versions
         .map(
           (v) =>
             `<li class="doc-version-list__item${v.id === target.id ? " is-current" : ""}">
               <span>v${escapeHtml(String(v.version || 1))} · ${escapeHtml(v.fileName)} · ${escapeHtml(formatDateShort(v.updatedAt))}</span>
               ${v.id !== target.id && canDownload() ? `<button type="button" class="doc-btn doc-btn--ghost doc-btn--sm" data-action="doc-download" data-id="${escapeAttr(v.id)}">Descargar</button>` : ""}
             </li>`
         )
         .join("")}</ul>`
    : "";
  G.openEditModal?.({
    title: "Editar documento",
    subtitle: target.fileName || "",
    submitText: "Guardar cambios",
    fields: [
      { name: "fileName", label: "Nombre del archivo", value: target.fileName, required: true },
      { name: "folder", label: "Carpeta", value: target.folder, required: true, hint: "Use “ / ” para mover a una subcarpeta." },
      {
        name: "documentCategory",
        label: "Tipo documental",
        type: "select",
        value: target.documentCategory || "otro",
        options: documentCategories().map((c) => ({ value: c.value, label: c.label }))
      },
      {
        type: "custom",
        id: "doc-edit-meta",
        html: `${documentMetaFieldsHtml(target)}${versionHtml}
          <label class="doc-upload-modal__select-wrap">
            <span>Estado</span>
            <select name="validityStatus">${selectOptionsHtml(
              DOCUMENT_VALIDITY_STATUSES.filter((s) => s.value !== "por_vencer" && s.value !== "vencido"),
              target.validityStatus === "archivado" ? "archivado" : "vigente"
            )}</select>
            <small>La vigencia por fechas se calcula sola. Use Archivado para retirar el documento del control activo.</small>
          </label>`
      },
      { name: "description", label: "Descripción", type: "textarea", rows: 2, value: sanitizeCompanyDocumentDescription(target.description || "") }
    ],
    afterMount: (formEl) => {
      wireDocumentMetaFields(formEl);
      formEl?.querySelectorAll("[data-action='doc-download']").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const doc = findDoc(btn.dataset.id);
          if (!doc) return;
          try {
            await triggerDownload(doc);
          } catch (err) {
            G.notify?.(String(err?.message || "No se pudo descargar."), "error");
          }
        });
      });
    },
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
      const meta = readMetaFromForm(form);
      const documentCategory = String(form.documentCategory || target.documentCategory || "otro").trim();
      const archived = String(form.validityStatus || "") === "archivado";
      const nextList = fresh.map((r) =>
        String(r.id) !== String(target.id)
          ? r
          : normalizeCompanyDocumentRow({
              ...r,
              fileName,
              folder,
              documentCategory,
              description: String(form.description || "").trim(),
              updatedAt: new Date().toISOString(),
              ...meta,
              validityStatus: archived ? "archivado" : ""
            })
      );
      try {
        await writeAwaitServerEdit(KEYS.companyDocuments, nextList, target.id);
        await ensureFolderRecord(folder, by);
        G.logPortalAuditEvent?.("documents", "update", {
          entityId: target.id,
          entityKind: "document",
          entityLabel: `${folder} · ${fileName}`,
          summary: archived
            ? `Cambio de estado documental · Archivado · ${fileName}`
            : `Actualización de documento · ${fileName}`,
          detailAction: archived ? "status" : "update",
          usuario: by,
          actor: by
        });
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

function openManageTypesModal() {
  if (!canManageTypes()) return;
  const builtin = COMPANY_DOCUMENT_CATEGORIES.map((c) => ({ ...c, builtin: true }));
  const custom = customDocumentTypes();
  const rows = [...builtin, ...custom]
    .map(
      (t) => `<tr>
        <td>${escapeHtml(t.label)}</td>
        <td>${escapeHtml(getCompanyDocumentProcessLabel(t.process) || t.process || "—")}</td>
        <td>${escapeHtml(t.area || "—")}</td>
        <td>${t.requiresExpiry ? "Sí" : "No"}</td>
        <td>${t.builtin ? `<span class="muted">Catálogo base</span>` : `<button type="button" class="doc-btn doc-btn--ghost doc-btn--sm is-danger" data-remove-type="${escapeAttr(t.value)}">Quitar</button>`}</td>
      </tr>`
    )
    .join("");
  G.openEditModal?.({
    title: "Tipos y categorías documentales",
    subtitle: "Parametrice tipos según proceso, área o necesidad de negocio. Los del catálogo base no se eliminan.",
    submitText: "Agregar tipo",
    fields: [
      {
        type: "custom",
        id: "doc-types-table",
        html: `<div class="doc-types-modal">
          <div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>Tipo</th><th>Proceso</th><th>Área</th><th>Vigencia</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
        </div>`
      },
      { name: "label", label: "Nuevo tipo documental", required: true, placeholder: "Ej. Póliza de cumplimiento" },
      {
        name: "process",
        label: "Proceso",
        type: "select",
        options: [{ value: "", label: "Sin proceso" }, ...COMPANY_DOCUMENT_PROCESSES]
      },
      { name: "area", label: "Área o necesidad de negocio", placeholder: "Ej. contratación, flota, SST" },
      {
        name: "requiresExpiry",
        label: "Requiere fecha de vencimiento",
        type: "select",
        options: [
          { value: "", label: "No" },
          { value: "1", label: "Sí" }
        ]
      }
    ],
    afterMount: (formEl) => {
      formEl?.querySelectorAll("[data-remove-type]").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const value = String(btn.getAttribute("data-remove-type") || "");
          try {
            await saveCustomDocumentTypes(customDocumentTypes().filter((t) => t.value !== value));
            G.notify?.("Tipo documental eliminado.", "success");
            document.getElementById("crud-modal")?.classList.add("hidden");
            G.renderPortalView?.();
          } catch (err) {
            G.notify?.(String(err?.message || "No se pudo eliminar el tipo."), "error");
          }
        });
      });
    },
    onSubmit: async (form, formEl) => {
      const label = String(form.label || "").trim();
      if (!label) {
        G.failPortalField?.(formEl, "label", "Indique el nombre del tipo.");
        return false;
      }
      const next = [
        ...customDocumentTypes(),
        {
          id: newUuidV4(),
          label,
          process: String(form.process || "").trim(),
          area: String(form.area || "").trim(),
          requiresExpiry: String(form.requiresExpiry || "") === "1"
        }
      ];
      try {
        await saveCustomDocumentTypes(next);
        G.logPortalAuditEvent?.("documents", "update", {
          entityKind: "document",
          entityLabel: label,
          summary: `Alta de tipo documental · ${label}`,
          usuario: actor(),
          actor: actor()
        });
        G.notify?.("Tipo documental creado.", "success");
        G.renderPortalView?.();
        return true;
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo guardar el tipo."), "error");
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

/**
 * Trae el archivo por la API (cookie/CSRF) y crea un blob: URL local.
 * Evita iframes rotos contra URLs firmadas de R2 (CORS / Content-Type / visor PDF).
 */
async function fetchCompanyDocumentBlob(doc) {
  const api = window.AntaresApi;
  if (!api?.postForBlob) throw new Error("API no disponible.");
  const blob = await api.postForBlob("/uploads/company-document/content", {
    storageKey: doc.storageKey,
    disposition: "inline",
    fileName: doc.fileName || "documento"
  });
  if (!blob || !blob.size) throw new Error("El archivo llegó vacío.");
  return blob;
}

async function resolvePreviewObjectUrl(doc) {
  const blob = await fetchCompanyDocumentBlob(doc);
  const group = fileTypeGroup(doc.fileName, doc.mimeType);
  const buffer = await blob.arrayBuffer();
  let mime = String(blob.type || "").trim();
  if (group === "pdf") mime = "application/pdf";
  else if (group === "image" && !mime.startsWith("image/")) mime = String(doc.mimeType || "image/jpeg");
  else if (group === "text" && !mime.startsWith("text/")) mime = "text/plain;charset=utf-8";
  else if (!mime) mime = "application/octet-stream";
  return URL.createObjectURL(new Blob([buffer], { type: mime }));
}

const MAMMOTH_CDN = "https://cdn.jsdelivr.net/npm/mammoth@1.9.0/mammoth.browser.min.js";
let mammothLoadPromise = null;
const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
let pdfJsLoadPromise = null;

function ensurePdfJs() {
  if (window.pdfjsLib?.getDocument) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
    return Promise.resolve(window.pdfjsLib);
  }
  if (pdfJsLoadPromise) return pdfJsLoadPromise;
  pdfJsLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = PDFJS_CDN;
    s.onload = () => {
      if (window.pdfjsLib?.getDocument) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
        resolve(window.pdfjsLib);
      } else {
        pdfJsLoadPromise = null;
        reject(new Error("PDF.js no quedó disponible."));
      }
    };
    s.onerror = () => {
      pdfJsLoadPromise = null;
      reject(new Error("No se pudo cargar el visor PDF (compruebe la conexión)."));
    };
    document.head.appendChild(s);
  });
  return pdfJsLoadPromise;
}

function assertPdfMagic(bytes) {
  if (!bytes || bytes.length < 5) return false;
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ); /* %PDF */
}

/** Render PDF a canvas (evita el visor nativo de Chromium, roto dentro de paneles con transform). */
async function renderPdfPreviewInto(stage, blob) {
  if (!stage) return;
  stage.innerHTML = `<div class="doc-preview__loading"><span class="doc-preview__spinner"></span>Cargando PDF…</div>`;
  const pdfjs = await ensurePdfJs();
  const data = new Uint8Array(await blob.arrayBuffer());
  if (!assertPdfMagic(data)) {
    throw new Error("El archivo no es un PDF válido o llegó corrupto.");
  }
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  const wrap = document.createElement("div");
  wrap.className = "doc-preview__pdfjs";
  const maxPages = Math.min(Number(pdf.numPages) || 1, 40);
  const stageWidth = Math.max(280, (stage.clientWidth || 640) - 28);
  for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo);
    const unscaled = page.getViewport({ scale: 1 });
    const scale = Math.min(2.2, stageWidth / unscaled.width);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.className = "doc-preview__pdf-page";
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.setAttribute("aria-label", `Página ${pageNo}`);
    const ctx = canvas.getContext("2d", { alpha: false });
    await page.render({ canvasContext: ctx, viewport }).promise;
    wrap.appendChild(canvas);
  }
  if (pdf.numPages > maxPages) {
    const note = document.createElement("p");
    note.className = "doc-preview__pdf-note";
    note.textContent = `Mostrando ${maxPages} de ${pdf.numPages} páginas. Use Abrir en pestaña o Descargar para ver el documento completo.`;
    wrap.appendChild(note);
  }
  stage.replaceChildren(wrap);
}

function ensureMammoth() {
  if (typeof window.mammoth?.convertToHtml === "function") return Promise.resolve(window.mammoth);
  if (mammothLoadPromise) return mammothLoadPromise;
  mammothLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = MAMMOTH_CDN;
    s.onload = () => {
      if (typeof window.mammoth?.convertToHtml === "function") resolve(window.mammoth);
      else {
        mammothLoadPromise = null;
        reject(new Error("Mammoth no quedó disponible para vista previa Word."));
      }
    };
    s.onerror = () => {
      mammothLoadPromise = null;
      reject(new Error("No se pudo cargar el visor Word (compruebe la conexión)."));
    };
    document.head.appendChild(s);
  });
  return mammothLoadPromise;
}

function isDocxDocument(doc) {
  const ext = String(doc?.fileName || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  if (ext === "docx") return true;
  return /wordprocessingml\.document/i.test(String(doc?.mimeType || ""));
}

function isPdfDocument(doc) {
  const ext = String(doc?.fileName || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  if (ext === "pdf") return true;
  return /application\/pdf/i.test(String(doc?.mimeType || ""));
}

async function convertDocxBlobToHtml(blob) {
  const mammoth = await ensureMammoth();
  const arrayBuffer = await blob.arrayBuffer();
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Heading 1'] => h2:fresh",
        "p[style-name='Heading 2'] => h3:fresh"
      ]
    }
  );
  return String(result?.value || "").trim();
}

function docxPreviewStageHtml(innerHtml) {
  if (!innerHtml) {
    return `<div class="doc-preview__nopreview"><p>El contrato no tiene contenido previsualizable.</p></div>`;
  }
  return `<div class="doc-preview__docx" data-docx-preview>
    <p class="doc-preview__docx-note">Vista previa del documento Word (puede diferir ligeramente del archivo original).</p>
    <article class="doc-preview__docx-body">${innerHtml}</article>
  </div>`;
}

async function triggerDownload(doc) {
  if (!canDownloadCompanyDoc(doc)) {
    G.notify?.("No tiene permiso para descargar documentos.", "error");
    return;
  }
  const url = await resolveDownloadUrl(doc, { disposition: "attachment" });
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.fileName || "documento";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  logDocumentAction("download", doc);
}

let previewKeyHandler = null;
let previewObjectUrl = "";
let previewDocxHtml = "";

function closePreviewPanel() {
  document.querySelector("[data-doc-preview]")?.remove();
  if (previewKeyHandler) {
    document.removeEventListener("keydown", previewKeyHandler);
    previewKeyHandler = null;
  }
  if (previewObjectUrl) {
    try {
      URL.revokeObjectURL(previewObjectUrl);
    } catch (_e) {
      /* noop */
    }
    previewObjectUrl = "";
  }
  previewDocxHtml = "";
}

function previewStageHtml(doc, url) {
  const group = fileTypeGroup(doc.fileName, doc.mimeType);
  if (group === "image") return `<img class="doc-preview__img" src="${escapeAttr(url)}" alt="${escapeAttr(doc.fileName)}" />`;
  if (group === "pdf") {
    /* Sin #fragment en blob: URLs: algunos visores PDF fallan con hash. */
    return `<iframe class="doc-preview__frame" src="${escapeAttr(url)}" title="${escapeAttr(doc.fileName)}"></iframe>`;
  }
  if (group === "text") {
    return `<iframe class="doc-preview__frame doc-preview__frame--text" src="${escapeAttr(url)}" title="${escapeAttr(doc.fileName)}"></iframe>`;
  }
  return `<div class="doc-preview__nopreview"><p>No hay vista previa disponible para este tipo de archivo.</p></div>`;
}

function openDocxHtmlInTab(fileName, html) {
  const title = escapeHtml(fileName || "Contrato");
  const page = `<!doctype html><html lang="es"><head><meta charset="utf-8"/><title>${title}</title>
<style>
  body{margin:0;background:#f4f4f1;color:#1a1a1a;font:16px/1.55 Georgia,"Times New Roman",serif;}
  .wrap{max-width:720px;margin:0 auto;padding:2rem 1.25rem 3rem;background:#fff;min-height:100vh;box-shadow:0 0 0 1px rgba(0,0,0,.06);}
  h1,h2,h3{line-height:1.25} p{margin:0 0 .85em} table{border-collapse:collapse;width:100%}
  td,th{border:1px solid #ccc;padding:.35em .5em;vertical-align:top}
</style></head><body><div class="wrap">${html || "<p>Sin contenido.</p>"}</div></body></html>`;
  const url = URL.createObjectURL(new Blob([page], { type: "text/html;charset=utf-8" }));
  window.open(url, "_blank", "noopener");
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch (_e) {
      /* noop */
    }
  }, 60_000);
}

function foldKeyForCompare(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function buildPreviewMetaLine(doc, display) {
  const person = String(display.subtitle || "").trim();
  const folder = String(folderLeafName(doc.folder) || "").trim();
  const sameAsPerson = person && folder && foldKeyForCompare(person) === foldKeyForCompare(folder);
  const parts = [];
  if (person) parts.push(person);
  parts.push(display.ext || fileTypeLabel(doc.fileName, doc.mimeType) || "");
  parts.push(formatFileSize(doc.sizeBytes));
  if (folder && !sameAsPerson) parts.push(folder);
  return parts.filter(Boolean).join(" · ");
}

function buildPreviewDescriptionLine(doc, display) {
  let text = sanitizeCompanyDocumentDescription(doc.description || "");
  if (!text) return "";
  /* Evita repetir el nombre del colaborador si ya está en el encabezado. */
  const person = foldKeyForCompare(display.subtitle || folderLeafName(doc.folder) || "");
  if (person) {
    text = text
      .split("·")
      .map((p) => p.trim())
      .filter((p) => p && foldKeyForCompare(p) !== person)
      .join(" · ");
  }
  text = text
    .replace(/Carta laboral\s*\(\s*vigente\s*\)/gi, "Carta laboral vigente")
    .replace(/Carta laboral\s*\(\s*retiro\s*\)/gi, "Certificado de retiro")
    .replace(/\s*·\s*formato oficial/gi, " · Formato oficial")
    .replace(/\s{2,}/g, " ")
    .trim();
  return text;
}

async function openPreview(doc) {
  let previewDoc = doc;
  const IC = G.IC || {};
  const group = fileTypeGroup(doc.fileName, doc.mimeType);
  const canInline = canPreviewFileType(doc.fileName, doc.mimeType);
  const docx = isDocxDocument(doc);
  const display = formatCompanyDocumentDisplayName(doc);
  const previewMeta = buildPreviewMetaLine(doc, display);
  const previewDesc = buildPreviewDescriptionLine(doc, display);
  const validityLine = [getCompanyDocumentCategoryLabel(doc.documentCategory, customDocumentTypes()), doc.entityLabel, getDocumentValidityStatusLabel(computeDocumentValidityStatus(doc)), doc.expiresAt ? `Vence ${formatDateShort(doc.expiresAt)}` : "", Number(doc.version) > 1 ? `v${doc.version}` : ""].filter(Boolean).join(" · ");
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
          <p class="doc-preview__name" title="${escapeAttr(display.fullName)}">${escapeHtml(display.title)}</p>
          <p class="doc-preview__meta">${escapeHtml(previewMeta)}</p>
        </div>
        <button type="button" class="doc-iconbtn doc-preview__close" data-close aria-label="Cerrar">${IC.x || "×"}</button>
      </header>
      <div class="doc-preview__body"><div class="doc-preview__stage" data-stage><div class="doc-preview__loading"><span class="doc-preview__spinner"></span>Cargando…</div></div></div>
      <footer class="doc-preview__foot">
        <div class="doc-preview__info">
          <span>Subido por ${escapeHtml(doc.uploadedBy || "—")}</span>
          <span>${escapeHtml(formatDate(doc.updatedAt))}</span>
          ${previewDesc ? `<p class="doc-preview__desc">${escapeHtml(previewDesc)}</p>` : ""}
          ${validityLine ? `<p class="doc-preview__desc">${escapeHtml(validityLine)}</p>` : ""}
        </div>
        <div class="doc-preview__actions">
          <button type="button" class="doc-btn doc-btn--ghost" data-open-tab>${IC_EXTERNAL}<span>Abrir en pestaña</span></button>
          ${canDownloadCompanyDoc(doc) ? `<button type="button" class="doc-btn doc-btn--primary" data-download>${IC.download || ""}<span>Descargar</span></button>` : ""}
        </div>
      </footer>
    </aside>`;
  document.body.appendChild(overlay);
  logDocumentAction("view", doc);
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  previewKeyHandler = (e) => {
    if (e.key === "Escape") closePreviewPanel();
  };
  document.addEventListener("keydown", previewKeyHandler);
  overlay.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closePreviewPanel));
  const stage = overlay.querySelector("[data-stage]");
  overlay.querySelector("[data-download]")?.addEventListener("click", async () => {
    try {
      await triggerDownload(previewDoc);
    } catch (err) {
      G.notify?.(String(err?.message || "No se pudo descargar."), "error");
    }
  });
  overlay.querySelector("[data-open-tab]")?.addEventListener("click", async () => {
    try {
      if (docx) {
        if (!previewDocxHtml) {
          const blob = await fetchCompanyDocumentBlob(previewDoc);
          previewDocxHtml = await convertDocxBlobToHtml(blob);
        }
        openDocxHtmlInTab(previewDoc.fileName, previewDocxHtml);
        return;
      }
      const url = previewObjectUrl || (await resolvePreviewObjectUrl(previewDoc));
      if (!previewObjectUrl) previewObjectUrl = url;
      window.open(url, "_blank", "noopener");
    } catch (err) {
      try {
        window.open(await resolveDownloadUrl(previewDoc, { disposition: "inline" }), "_blank", "noopener");
      } catch (err2) {
        G.notify?.(String(err2?.message || err?.message || "No se pudo abrir."), "error");
      }
    }
  });
  if (!canInline) {
    if (stage) stage.innerHTML = previewStageHtml(doc, "");
    return;
  }
  if (docx) {
    try {
      const blob = await fetchCompanyDocumentBlob(doc);
      previewDocxHtml = await convertDocxBlobToHtml(blob);
      if (document.body.contains(overlay) && stage) stage.innerHTML = docxPreviewStageHtml(previewDocxHtml);
    } catch (err) {
      if (stage) {
        stage.innerHTML = `<div class="doc-preview__nopreview"><p>No se pudo cargar la vista previa del contrato.</p><p class="doc-preview__nopreview-hint">${escapeHtml(String(err?.message || ""))}</p></div>`;
      }
    }
    return;
  }
  if (isPdfDocument(previewDoc)) {
    try {
      if (isPayrollSlipDocument(previewDoc) && !payrollSlipDocHasCurrentLayout(previewDoc)) {
        if (stage) {
          stage.innerHTML = `<div class="doc-preview__loading"><span class="doc-preview__spinner"></span>Actualizando comprobante a 1 hoja…</div>`;
        }
        previewDoc = await ensureCompactPayslipDocument(previewDoc);
      }
      const blob = await fetchCompanyDocumentBlob(previewDoc);
      const buffer = await blob.arrayBuffer();
      const pdfBlob = new Blob([buffer], { type: "application/pdf" });
      previewObjectUrl = URL.createObjectURL(pdfBlob);
      if (document.body.contains(overlay) && stage) {
        await renderPdfPreviewInto(stage, pdfBlob);
      }
    } catch (err) {
      if (stage) {
        stage.innerHTML = `<div class="doc-preview__nopreview"><p>No se pudo cargar la vista previa del PDF.</p><p class="doc-preview__nopreview-hint">${escapeHtml(String(err?.message || ""))}</p><p class="doc-preview__nopreview-hint">Use «Abrir en pestaña» o «Descargar».</p></div>`;
      }
    }
    return;
  }
  try {
    const url = await resolvePreviewObjectUrl(doc);
    previewObjectUrl = url;
    if (document.body.contains(overlay) && stage) stage.innerHTML = previewStageHtml(doc, url);
  } catch (err) {
    /* Respaldo: URL firmada R2 (puede fallar en iframe según navegador/CORS). */
    try {
      const fallbackUrl = await resolveDownloadUrl(doc, { disposition: "inline" });
      if (document.body.contains(overlay) && stage) stage.innerHTML = previewStageHtml(doc, fallbackUrl);
    } catch (err2) {
      if (stage) {
        stage.innerHTML = `<div class="doc-preview__nopreview"><p>No se pudo cargar la vista previa.</p><p class="doc-preview__nopreview-hint">${escapeHtml(String(err?.message || err2?.message || ""))}</p></div>`;
      }
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
  on(root, "[data-action='doc-manage-types']", "click", () => openManageTypesModal());
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
  on(root, "[data-action='doc-category-filter']", "change", (e) => {
    patchUi({ categoryFilter: e.currentTarget.value || "all", page: 1 });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-status-filter']", "change", (e) => {
    patchUi({ statusFilter: e.currentTarget.value || "all", page: 1, showFilters: true });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-entity-filter']", "change", (e) => {
    patchUi({ entityTypeFilter: e.currentTarget.value || "all", page: 1 });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-process-filter']", "change", (e) => {
    patchUi({ processFilter: e.currentTarget.value || "all", page: 1 });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-date-from']", "change", (e) => {
    patchUi({ dateFrom: e.currentTarget.value || "", page: 1 });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-date-to']", "change", (e) => {
    patchUi({ dateTo: e.currentTarget.value || "", page: 1 });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-filter-status']", "click", (e) => {
    patchUi({
      statusFilter: e.currentTarget.dataset.status || "all",
      showFilters: true,
      page: 1,
      folderFilter: "*",
      showTrash: false
    });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-folder-filter']", "change", (e) => {
    patchUi({ folderFilter: e.currentTarget.value || "", page: 1, folderPage: 1, showTrash: false });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-clear-filters']", "click", () => {
    patchUi({
      search: "",
      typeFilter: "all",
      categoryFilter: "all",
      statusFilter: "all",
      entityTypeFilter: "all",
      processFilter: "all",
      dateFrom: "",
      dateTo: "",
      page: 1,
      folderPage: 1
    });
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
    patchUi({ folderFilter: EMPLOYEES_ROOT_FOLDER, search: "", typeFilter: "all", categoryFilter: "all", statusFilter: "all", entityTypeFilter: "all", processFilter: "all", dateFrom: "", dateTo: "", page: 1, folderPage: 1, showTrash: false });
    G.renderPortalView?.();
  });
  on(root, "[data-action='doc-export-csv']", "click", () => {
    const folders = readFolders();
    const docs = visibleDocs(readDocs(), folders);
    const filtered = applyCompanyDocumentFilters(docs, {
      search: getUi().search,
      type: getUi().typeFilter,
      folder: getUi().folderFilter === "*" ? "" : getUi().folderFilter,
      category: getUi().categoryFilter,
      status: getUi().statusFilter,
      entityType: getUi().entityTypeFilter,
      process: getUi().processFilter,
      dateField: getUi().dateField,
      dateFrom: getUi().dateFrom,
      dateTo: getUi().dateTo
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

  /* Carpetas + carga oficial (contrato, carta, colillas pagadas). Sin purge. */
  if (canUpload()) {
    void ensureCompanyDocumentStructure().then((res) => {
      if (res?.created > 0 && String(state.currentView || "") === "document-management") {
        G.renderPortalView?.();
      }
      void runOfficialEmployeeDocumentsBackfill();
    });
  }
}

if (typeof window.registerLegacyPortalViews === "function") {
  window.registerLegacyPortalViews({ documentManagementHtml });
} else {
  window.AppLegacyViews = window.AppLegacyViews || {};
  Object.assign(window.AppLegacyViews, { documentManagementHtml });
}

(function registerDocumentManagementPortalBinds() {
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["document-management"] = bindDocumentManagementPortalControls;
})();

if (typeof window !== "undefined") {
  window.openCompanyDocumentPreview = openPreview;
  window.downloadCompanyDocumentFile = triggerDownload;
}

export { documentManagementHtml, bindDocumentManagementPortalControls };
