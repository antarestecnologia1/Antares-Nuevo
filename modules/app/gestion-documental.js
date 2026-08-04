/**
 * Gestión documental — expediente digital por colaborador (RRHH).
 *
 * Este archivo concentra estado, acciones y binds; el HTML vive en
 * `gestion-documental-html.js`. La vista se reconstruye completa en cada cambio
 * (`renderPortalView`), así que los listeners se cuelgan del nodo raíz del módulo,
 * que se recrea en cada render, y no de `nodes.viewRoot`, que persiste.
 */
import { state, nodes, persistHrWorkspace } from "../core/store.js";
import { read, write, writeAwaitServerCreate, writeAwaitServerEdit } from "../core/data-io.js";
import { KEYS } from "../core/config.js";
import {
  canAccessDocumentsView,
  canUploadDocuments,
  canEditDocuments,
  canDeleteDocuments,
  currentUser
} from "../core/auth.js";
import {
  escapeHtml,
  escapeAttr,
  colombiaTodayIsoDate,
  newUuidV4,
  devWarn
} from "../core/utils.js";
import {
  EMPLOYEE_DOCUMENT_TYPES,
  EMPLOYEE_DOCUMENT_MAX_BYTES,
  DEFAULT_EMPLOYEE_DOCUMENT_FOLDER,
  getEmployeeDocumentTypeLabel,
  employeeDocumentTypeRequiresExpiry,
  normalizeEmployeeDocumentRow,
  normalizeEmployeeDocumentFolderRow,
  normalizeDocumentFolder,
  collectEmployeeFolders,
  employeeHasFolderRecord,
  buildEmployeeDocumentFolderRecord,
  computeEmployeeDocumentStatus,
  formatFileSize,
  buildEmployeeDocumentExportRows,
  summarizeEmployeeDocuments,
  findEmployeeDocumentGaps,
  countDocumentsInFolder,
  documentFolderKey,
  buildDocumentIndexRows,
  buildDocumentOverview,
  applyDocumentSection,
  applyDocumentAdvancedFilters,
  sortDocumentRows,
  countActiveDocumentFilters,
  findRelatedDocuments,
  getDocumentVersionChain,
  summarizeDocumentSelection,
  normalizeDocumentSection,
  normalizeDocumentViewMode,
  normalizeDocumentSortKey,
  normalizeDocumentSortDir,
  normalizeDocumentDateField,
  defaultSortDirForKey,
  getDocumentSection,
  formatDocumentRelative
} from "../domain/employee-documents.domain.js";
import { downloadBlobFile, downloadCsv } from "../domain/reporteria.domain.js";
import { renderDocumentsShell } from "./gestion-documental-html.js";

const G = globalThis;

/** Archivos elegidos en el dropzone; sobreviven a los re-renders. */
let pendingUploadFiles = [];
/** Scroll del listado, para no saltar al inicio tras cada re-render. */
let pendingScrollTop = 0;
/** Los listeners de documento (Esc, cierre de menús) se registran una sola vez. */
let globalListenersBound = false;

if (typeof window !== "undefined") {
  window.normalizeEmployeeDocumentRow = normalizeEmployeeDocumentRow;
  window.normalizeEmployeeDocumentFolderRow = normalizeEmployeeDocumentFolderRow;
}

/* ==========================================================================
   Permisos
   ========================================================================== */

function actingUser() {
  return typeof G.currentUser === "function" ? G.currentUser() : currentUser();
}

function modulePerms() {
  const user = actingUser();
  return {
    view: canAccessDocumentsView(user),
    upload: canUploadDocuments(user),
    edit: canEditDocuments(user),
    del: canDeleteDocuments(user)
  };
}

/* ==========================================================================
   Preferencias locales (favoritos, recientes, accesos rápidos)
   ========================================================================== */

const PREF_KEYS = {
  favorites: "antares_docs_favorites_v1",
  recents: "antares_docs_recents_v1"
};

/** Cuántos documentos recuerda la vista "Recientes". */
const RECENTS_LIMIT = 40;

function readPref(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_err) {
    return fallback;
  }
}

function writePref(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_err) {
    /* Cuota llena o almacenamiento bloqueado: las preferencias no son críticas. */
  }
}

function readFavorites() {
  return readPref(PREF_KEYS.favorites, []).map(String);
}

function toggleFavorite(id) {
  const key = String(id);
  const current = readFavorites();
  const next = current.includes(key) ? current.filter((x) => x !== key) : [...current, key];
  writePref(PREF_KEYS.favorites, next);
  return next.includes(key);
}

function readRecents() {
  return readPref(PREF_KEYS.recents, []).filter((r) => r && r.id);
}

/** Registra el documento como visto: alimenta "Recientes" y los accesos rápidos. */
function touchRecent(row) {
  if (!row?.id) return;
  const entry = {
    id: String(row.id),
    at: new Date().toISOString(),
    employeeId: String(row.employeeId || ""),
    employeeName: String(row.employeeName || ""),
    folder: normalizeDocumentFolder(row.folderName || row.folder || "")
  };
  const next = [entry, ...readRecents().filter((r) => String(r.id) !== entry.id)].slice(0, RECENTS_LIMIT);
  writePref(PREF_KEYS.recents, next);
}

/** Los 4 destinos más recientes distintos (colaborador + carpeta). */
function buildQuickAccess(recents, employees) {
  const seen = new Set();
  const out = [];
  const empMap = new Map((employees || []).map((e) => [String(e.id), e]));
  for (const entry of recents) {
    const empId = String(entry.employeeId || "");
    if (!empId || !empMap.has(empId)) continue;
    const key = `${empId}|${documentFolderKey(entry.folder || "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      employeeId: empId,
      folder: entry.folder || "",
      label: empMap.get(empId)?.name || entry.employeeName || "Colaborador"
    });
    if (out.length >= 4) break;
  }
  return out;
}

/* ==========================================================================
   Estado de UI
   ========================================================================== */

function getUi() {
  const ui = state.documentsUi || {};
  return {
    section: normalizeDocumentSection(ui.section),
    folderBrowseEmployeeId: String(ui.folderBrowseEmployeeId || ""),
    selectedFolder: String(ui.selectedFolder || ""),
    viewMode: normalizeDocumentViewMode(ui.viewMode),
    sortKey: normalizeDocumentSortKey(ui.sortKey),
    sortDir: normalizeDocumentSortDir(ui.sortDir),
    search: String(ui.search || ""),
    filterEmployeeId: String(ui.filterEmployeeId || ""),
    typeFilter: String(ui.typeFilter || ""),
    folderFilter: String(ui.folderFilter || ""),
    filterStatus: String(ui.filterStatus || ""),
    dateField: normalizeDocumentDateField(ui.dateField),
    dateFrom: String(ui.dateFrom || ""),
    dateTo: String(ui.dateTo || ""),
    uploadedBy: String(ui.uploadedBy || ""),
    minSizeMb: String(ui.minSizeMb ?? ""),
    maxSizeMb: String(ui.maxSizeMb ?? ""),
    onlyCurrentVersions: Boolean(ui.onlyCurrentVersions),
    selectedIds: Array.isArray(ui.selectedIds) ? ui.selectedIds.map(String) : [],
    drawerDocId: String(ui.drawerDocId || ""),
    renderLimit: Number(ui.renderLimit) > 0 ? Number(ui.renderLimit) : 60,
    uploadOpen: Boolean(ui.uploadOpen),
    railOpen: Boolean(ui.railOpen),
    filtersOpen: Boolean(ui.filtersOpen),
    selectedEmployeeId: String(ui.selectedEmployeeId || ""),
    selectedDocumentType: String(ui.selectedDocumentType || "")
  };
}

function patchUi(partial) {
  state.documentsUi = { ...(state.documentsUi || {}), ...partial };
}

/** Cambios que alteran el conjunto de resultados reinician ventana y selección. */
function patchUiAndResetWindow(partial) {
  patchUi({ ...partial, renderLimit: 60, selectedIds: [] });
}

const FILTER_KEYS = [
  "filterEmployeeId",
  "typeFilter",
  "folderFilter",
  "filterStatus",
  "uploadedBy",
  "dateFrom",
  "dateTo",
  "minSizeMb",
  "maxSizeMb"
];

function emptyFilters() {
  const out = { onlyCurrentVersions: false, dateField: "created", search: "" };
  for (const key of FILTER_KEYS) out[key] = "";
  return out;
}

/**
 * Repinta la vista completa conservando el scroll.
 * El módulo usa scroll de página (rail y cabeceras son `sticky`), así que lo que
 * hay que preservar es `window.scrollY`, no el de un contenedor interno.
 */
function rerender() {
  pendingScrollTop = window.scrollY || 0;
  G.renderPortalView?.();
}

/* ==========================================================================
   Datos derivados
   ========================================================================== */

function canPreviewDocument(doc) {
  const mime = String(doc?.mimeType || "").toLowerCase();
  const name = String(doc?.fileName || "").toLowerCase();
  if (mime.startsWith("image/") || mime.includes("pdf")) return true;
  return /\.(pdf|png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
}

function readDocumentRows(employees, todayYmd) {
  const raw = read(KEYS.employeeDocuments, []);
  return buildDocumentIndexRows(raw, employees, todayYmd).map((row) => ({
    ...row,
    canPreview: canPreviewDocument(row)
  }));
}

function findRow(rows, id) {
  const key = String(id || "");
  return rows.find((r) => String(r.id) === key) || null;
}

/** Entradas de auditoría del módulo, opcionalmente acotadas a un documento. */
function readDocumentActivity(entityId = "", limit = 12) {
  const logs = read(KEYS.moduleAuditLogs, []);
  const wanted = String(entityId || "");
  return logs
    .filter((row) => String(row?.moduleId || "") === "documents")
    .filter((row) => (wanted ? String(row?.entityId || "") === wanted : true))
    .slice(0, limit)
    .map((row) => ({
      action: String(row.action || "update"),
      summary: String(row.summary || row.entityLabel || "Movimiento"),
      actor: String(row.usuario || row.actor || "Portal"),
      when: formatAuditWhen(row.at)
    }));
}

function formatAuditWhen(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const relative = formatDocumentRelative(raw.slice(0, 10), colombiaTodayIsoDate());
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return relative || raw.slice(0, 10);
  const time = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return relative ? `${relative} · ${time}` : time;
}

/** Carpetas del colaborador con conteo y peso. */
function buildFolderTiles(employeeId, rows, folderRecords) {
  const id = String(employeeId || "");
  const empRows = rows.filter((r) => String(r.employeeId) === id);
  return collectEmployeeFolders(
    id,
    empRows,
    folderRecords
  ).map((name) => {
    const key = documentFolderKey(name);
    const inFolder = empRows.filter((r) => documentFolderKey(r.folderName) === key);
    return {
      name,
      count: inFolder.length,
      sizeBytes: inFolder.reduce((sum, r) => sum + (Number(r.sizeBytes) || 0), 0)
    };
  });
}

/** ¿El colaborador encaja con la búsqueda del explorador de expedientes? */
function employeeMatchesSearch(emp, rows, search) {
  const norm = String(search || "").trim().toLocaleLowerCase("es");
  if (!norm) return true;
  const identity = `${emp.name || ""} ${emp.idDoc || ""} ${emp.position || ""}`.toLocaleLowerCase("es");
  if (identity.includes(norm)) return true;
  return rows.some(
    (r) =>
      String(r.employeeId) === String(emp.id) &&
      `${r.fileName} ${r.typeLabel} ${r.folderName}`.toLocaleLowerCase("es").includes(norm)
  );
}

/**
 * Arma el contexto único que consume toda la capa de render.
 * Concentrar aquí el filtrado evita que cada vista recalcule lo mismo.
 */
function buildCtx() {
  const IC = G.IC || {};
  const todayYmd = colombiaTodayIsoDate();
  const perms = modulePerms();
  const ui = getUi();
  const employees = read(KEYS.payrollEmployees, []);
  const folderRecords = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
  const rows = readDocumentRows(employees, todayYmd);
  const favorites = new Set(readFavorites());
  const recents = readRecents();
  const recentIds = new Set(recents.map((r) => String(r.id)));
  const overview = buildDocumentOverview(rows, employees, todayYmd);
  const section = getDocumentSection(ui.section);

  /* 1. Alcance de la sección. */
  let scoped;
  if (ui.section === "files" && ui.folderBrowseEmployeeId) {
    scoped = rows.filter((r) => String(r.employeeId) === ui.folderBrowseEmployeeId);
    if (ui.selectedFolder) {
      const key = documentFolderKey(ui.selectedFolder);
      scoped = scoped.filter((r) => documentFolderKey(r.folderName) === key);
    }
  } else if (ui.section === "files" || ui.section === "gaps" || ui.section === "overview") {
    scoped = rows;
  } else {
    scoped = applyDocumentSection(rows, ui.section, { todayYmd, favoriteIds: favorites, recentIds });
  }

  /* 2. Filtros del encabezado y del popover. */
  const filtered = applyDocumentAdvancedFilters(scoped, {
    search: ui.search,
    employeeId: ui.filterEmployeeId,
    documentType: ui.typeFilter,
    folder: ui.folderFilter,
    status: ui.filterStatus,
    dateField: ui.dateField,
    dateFrom: ui.dateFrom,
    dateTo: ui.dateTo,
    uploadedBy: ui.uploadedBy,
    minSizeMb: ui.minSizeMb,
    maxSizeMb: ui.maxSizeMb,
    onlyCurrentVersions: ui.onlyCurrentVersions
  });

  const visibleRows = sortDocumentRows(filtered, ui.sortKey, ui.sortDir);
  const shownRows = visibleRows.slice(0, ui.renderLimit);

  const selection = new Set(ui.selectedIds.filter((id) => visibleRows.some((r) => String(r.id) === id)));
  const selectionSummary = summarizeDocumentSelection(rows, selection);
  const activeFilterCount = countActiveDocumentFilters(ui);

  const visibleEmployees = [...employees]
    .filter((emp) => employeeMatchesSearch(emp, rows, ui.search))
    .filter((emp) => !ui.filterEmployeeId || String(emp.id) === ui.filterEmployeeId)
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));

  const folderNames = [
    ...new Map(
      (ui.section === "files" && ui.folderBrowseEmployeeId
        ? rows.filter((r) => String(r.employeeId) === ui.folderBrowseEmployeeId)
        : rows
      ).map((r) => [documentFolderKey(r.folderName), r.folderName])
    ).values()
  ].sort((a, b) => a.localeCompare(b, "es"));

  const authors = [...new Set(rows.map((r) => String(r.uploadedBy || "").trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  const drawerRow = ui.drawerDocId ? findRow(rows, ui.drawerDocId) : null;
  const drawer = drawerRow
    ? {
        row: drawerRow,
        versions: getDocumentVersionChain(drawerRow, rows),
        related: findRelatedDocuments(drawerRow, rows, 6),
        activity: readDocumentActivity(String(drawerRow.id), 8)
      }
    : null;

  const uploadEmployeeId = ui.selectedEmployeeId || ui.folderBrowseEmployeeId || "";
  const uploadFolders = uploadEmployeeId
    ? collectEmployeeFolders(
        uploadEmployeeId,
        rows.filter((r) => String(r.employeeId) === uploadEmployeeId),
        folderRecords
      )
    : [DEFAULT_EMPLOYEE_DOCUMENT_FOLDER];
  const preferredFolder = normalizeDocumentFolder(ui.selectedFolder || "");

  const counts = {
    all: rows.length,
    recent: applyDocumentSection(rows, "recent", { todayYmd, recentIds }).length,
    favorites: applyDocumentSection(rows, "favorites", { favoriteIds: favorites }).length,
    due_soon: overview.dueSoon,
    expired: overview.expired,
    gaps: overview.gapCount,
    files: employees.length
  };

  const resultCount = buildResultCount({ ui, visibleRows, visibleEmployees, overview, selection });

  /*
   * En ≤900px la tabla no cabe: forzamos tarjetas en el render sin tocar la
   * preferencia persistida (al volver a escritorio se recupera la tabla).
   */
  let viewMode = ui.viewMode;
  try {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches && viewMode === "table") {
      viewMode = "cards";
    }
  } catch (_mqErr) {
    /* matchMedia no disponible: se respeta la preferencia tal cual. */
  }

  return {
    IC,
    ui: { ...ui, viewMode },
    section,
    todayYmd,
    perms,
    /* Primera carga desde el servidor: el módulo muestra skeletons, no "sin datos". */
    loading: Boolean(state.portalDataHydrating) && !rows.length,
    employees,
    folderRecords,
    rows,
    scoped,
    visibleRows,
    shownRows,
    visibleEmployees,
    folderTiles: ui.folderBrowseEmployeeId ? buildFolderTiles(ui.folderBrowseEmployeeId, rows, folderRecords) : [],
    folderNames,
    authors,
    favorites,
    recents,
    quickAccess: buildQuickAccess(recents, employees),
    overview,
    activity: readDocumentActivity("", 10),
    counts,
    selection,
    selectionSummary,
    activeFilterCount,
    allSelected: visibleRows.length > 0 && selection.size === visibleRows.length,
    someSelected: selection.size > 0,
    resultCount,
    drawer,
    upload: {
      employees,
      employeeId: uploadEmployeeId,
      folders: uploadFolders,
      folderDefault:
        preferredFolder && uploadFolders.includes(preferredFolder)
          ? preferredFolder
          : uploadFolders[0] || DEFAULT_EMPLOYEE_DOCUMENT_FOLDER,
      resolvedType: resolveUploadDocumentType(uploadEmployeeId, rows, ui.selectedDocumentType, employees),
      employee: employees.find((e) => String(e.id) === uploadEmployeeId) || null,
      rows
    }
  };
}

/** Texto del `aria-live` con el recuento de resultados y la selección. */
function buildResultCount({ ui, visibleRows, visibleEmployees, overview, selection }) {
  if (ui.section === "overview") {
    return `${overview.total} documento${overview.total === 1 ? "" : "s"} en ${overview.employeesWithDocs} expediente${overview.employeesWithDocs === 1 ? "" : "s"}`;
  }
  if (ui.section === "gaps") {
    return `${overview.gapCount} expediente${overview.gapCount === 1 ? "" : "s"} con documentos pendientes`;
  }
  if (ui.section === "files" && !ui.folderBrowseEmployeeId) {
    return `${visibleEmployees.length} colaborador${visibleEmployees.length === 1 ? "" : "es"}`;
  }
  const base = `${visibleRows.length} documento${visibleRows.length === 1 ? "" : "s"}`;
  return selection.size ? `${base} · ${selection.size} seleccionado${selection.size === 1 ? "" : "s"}` : base;
}

function resolveUploadDocumentType(employeeId, rows, preferred, employees) {
  const wanted = String(preferred || "").trim();
  if (wanted && EMPLOYEE_DOCUMENT_TYPES.some((t) => t.value === wanted)) return wanted;
  const employee = (employees || []).find((e) => String(e.id) === String(employeeId));
  if (employee) {
    const gaps = findEmployeeDocumentGaps(
      employee,
      rows.filter((r) => String(r.employeeId) === String(employeeId))
    );
    if (gaps.length) return gaps[0];
  }
  return "cedula";
}

/* ==========================================================================
   Vista
   ========================================================================== */

function documentManagementHtml() {
  return renderDocumentsShell(buildCtx());
}

/* ==========================================================================
   Carpetas y auditoría (se conservan del módulo anterior)
   ========================================================================== */

async function ensureEmployeeFolderRecord(employeeId, folderName) {
  const id = String(employeeId || "").trim();
  const folder = normalizeDocumentFolder(folderName);
  if (!id || !folder) return;
  const employees = read(KEYS.payrollEmployees, []);
  const employee = employees.find((e) => String(e.id) === id);
  const folders = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
  const existing = folders.find(
    (row) => String(row.employeeId) === id && documentFolderKey(row.folderName) === documentFolderKey(folder)
  );
  if (existing?.id) return;
  const docs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  if (employeeHasFolderRecord(id, folder, docs, folders)) return;
  const record = buildEmployeeDocumentFolderRecord(id, folder, employee?.name, currentActorLabel());
  record.id = newUuidV4();
  try {
    await writeAwaitServerCreate(KEYS.employeeDocumentFolders, [...folders, record], record);
  } catch (err) {
    /*
     * No bloquear la subida: la carpeta puede seguir existiendo en servidor
     * (unique id_empleado+nombre) o fallar por permisos asimétricos.
     */
    devWarn("[documents] ensureEmployeeFolderRecord", err?.message || err);
    try {
      const cleaned = read(KEYS.employeeDocumentFolders, []).filter(
        (row) => String(row?.id || "") !== String(record.id)
      );
      write(KEYS.employeeDocumentFolders, cleaned, { skipSyncSchedule: true });
    } catch (_rollback) {
      /* noop */
    }
  }
}

function currentActorLabel() {
  const user = actingUser();
  return String(user?.fullName || user?.email || "Portal").trim() || "Portal";
}

function formatUploadDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "—";
  const fmt = typeof G.fmtDate === "function" ? G.fmtDate : null;
  if (fmt) {
    const labeled = String(fmt(raw) || "").trim();
    if (labeled) return labeled;
  }
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  return raw.slice(0, 10);
}

/** Payload de auditoría para Historial (módulo Gestión documental). */
function buildDocumentAuditDetail(action, doc, extra = {}) {
  const row = normalizeEmployeeDocumentRow(doc || {});
  const typeLabel = getEmployeeDocumentTypeLabel(row.documentType || "otro");
  const uploadedBy = String(row.uploadedBy || extra.uploadedBy || currentActorLabel()).trim();
  const uploadedAt = formatUploadDate(row.createdAt || extra.at || new Date().toISOString());
  const folder = normalizeDocumentFolder(row.folder || extra.folder || "");
  const fileName = String(row.fileName || extra.fileName || "").trim();
  const reason = String(extra.reason || "").trim();
  const actionTitle =
    action === "create"
      ? "Alta de documento"
      : action === "delete"
        ? "Eliminación de documento"
        : "Actualización de documento";
  const parts = [actionTitle];
  if (fileName) parts.push(fileName);
  if (action === "create") parts.push(`Subido por ${uploadedBy}`);
  else if (action === "update") parts.push(`Actualizado por ${uploadedBy}`);
  else if (action === "delete") parts.push(`Eliminado por ${uploadedBy}`);
  if (reason) parts.push(`Motivo: ${reason}`);
  const changeBits = [
    `Fecha subida: ${uploadedAt}`,
    `Usuario: ${uploadedBy}`,
    folder ? `Carpeta: ${folder}` : "",
    typeLabel ? `Tipo: ${typeLabel}` : ""
  ].filter(Boolean);
  const detail = {
    entityId: String(row.id || extra.entityId || "").trim(),
    entityKind: "document",
    entityLabel: String(extra.entityLabel || `${row.employeeName || "Colaborador"} · ${typeLabel}`).trim(),
    summary: String(extra.summary || parts.join(" · ")).trim(),
    changesText: String(extra.changesText || changeBits.join(" · ")).trim(),
    usuario: uploadedBy,
    actor: uploadedBy
  };
  /* Solo fijar `at` en altas: conserva la fecha de subida real en Historial. */
  if (action === "create") detail.at = row.createdAt || extra.at || new Date().toISOString();
  else if (extra.at) detail.at = extra.at;
  return detail;
}

/* ==========================================================================
   API de archivos
   ========================================================================== */

async function uploadFileToR2(file, employeeId, documentType, folder) {
  const api = window.AntaresApi;
  if (!api?.postFormData || !api.isConfigured?.()) {
    throw new Error("API no configurada para subir archivos.");
  }
  const fd = new FormData();
  fd.append("file", file, file.name || "documento");
  fd.append("employeeId", employeeId);
  fd.append("documentType", documentType);
  fd.append("folder", normalizeDocumentFolder(folder));
  return api.postFormData("/uploads/employee-document", fd);
}

async function resolveDocumentDownloadUrl(doc) {
  const api = window.AntaresApi;
  if (!api?.postJson || !api.isConfigured?.()) {
    throw new Error("Configure la API para abrir documentos.");
  }
  const res = await api.postJson("/uploads/employee-document/download", {
    employeeId: doc.employeeId,
    storageKey: doc.storageKey
  });
  const url = String(res?.downloadUrl || "").trim();
  if (!url) throw new Error("No se obtuvo enlace del archivo.");
  return url;
}

async function downloadDocumentRecord(doc) {
  const url = await resolveDocumentDownloadUrl(doc);
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ==========================================================================
   Vista previa
   ========================================================================== */

function closeDocumentPreview() {
  document.getElementById("doc-preview-overlay")?.remove();
}

function openDocumentPreview(doc, url) {
  closeDocumentPreview();
  const mime = String(doc.mimeType || "").toLowerCase();
  const isImage = mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(doc.fileName || ""));
  const IC = G.IC || {};
  const body = isImage
    ? `<img class="doc-preview__media" src="${escapeAttr(url)}" alt="${escapeAttr(doc.fileName || "Documento")}" />`
    : `<iframe class="doc-preview__frame" src="${escapeAttr(url)}" title="${escapeAttr(doc.fileName || "Documento")}"></iframe>`;
  const overlay = document.createElement("div");
  overlay.id = "doc-preview-overlay";
  overlay.className = "doc-preview-overlay";
  overlay.innerHTML = `<div class="doc-preview" role="dialog" aria-modal="true" aria-label="Vista previa de ${escapeAttr(doc.fileName || "documento")}">
    <header class="doc-preview__head">
      <div class="doc-preview__titles">
        <p class="doc-preview__eyebrow">${escapeHtml(getEmployeeDocumentTypeLabel(doc.documentType))}</p>
        <h3 class="doc-preview__title">${escapeHtml(doc.fileName || "")}</h3>
      </div>
      <div class="doc-preview__actions">
        <a class="btn btn-sm btn-outline" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${IC.download || ""} Abrir en pestaña</a>
        <button type="button" class="doc-icon-btn" data-doc-preview-close aria-label="Cerrar vista previa">${IC.x || "×"}</button>
      </div>
    </header>
    <div class="doc-preview__body">${body}</div>
  </div>`;
  const previouslyFocused = document.activeElement;
  const close = () => {
    document.removeEventListener("keydown", onKey);
    closeDocumentPreview();
    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  };
  const onKey = (ev) => {
    if (ev.key === "Escape") close();
    else if (ev.key === "Tab") trapFocus(overlay, ev);
  };
  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay || ev.target.closest("[data-doc-preview-close]")) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
  overlay.querySelector("[data-doc-preview-close]")?.focus();
}

/** Mantiene el foco dentro del contenedor mientras esté abierto. */
function trapFocus(container, ev) {
  const focusables = [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ].filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (ev.shiftKey && document.activeElement === first) {
    ev.preventDefault();
    last.focus();
  } else if (!ev.shiftKey && document.activeElement === last) {
    ev.preventDefault();
    first.focus();
  }
}

/* ==========================================================================
   Exportaciones
   ========================================================================== */

function exportSlug(value, fallback = "colaborador") {
  return (
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .toLowerCase() || fallback
  );
}

/**
 * Pide al API el ZIP de las carpetas indicadas y lo entrega al navegador.
 * El servidor decide qué archivos entran: aquí solo viajan nombres de carpeta.
 */
async function exportEmployeeFoldersZip(employeeId, folders, employeeName) {
  const api = window.AntaresApi;
  if (!api?.postForBlob || !api.isConfigured?.()) {
    throw new Error("Configure la API para exportar carpetas del expediente.");
  }
  const unique = [
    ...new Map(
      (folders || [])
        .map((name) => normalizeDocumentFolder(name))
        .filter(Boolean)
        .map((name) => [documentFolderKey(name), name])
    ).values()
  ];
  if (!unique.length) throw new Error("Seleccione al menos una carpeta.");
  const blob = await api.postForBlob("/uploads/employee-documents/export-zip", {
    employeeId: String(employeeId || ""),
    folders: unique
  });
  const suffix = unique.length === 1 ? exportSlug(unique[0], "carpeta") : `${unique.length}-carpetas`;
  downloadBlobFile(
    `expediente-${exportSlug(employeeName)}-${suffix}-${colombiaTodayIsoDate()}.zip`,
    blob,
    "application/zip"
  );
  return unique;
}

function closeFolderExportModal() {
  document.getElementById("doc-export-overlay")?.remove();
}

async function runSingleFolderExport(employeeId, folderName, triggerBtn) {
  const employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(employeeId));
  if (triggerBtn) {
    triggerBtn.disabled = true;
    triggerBtn.classList.add("is-loading");
  }
  try {
    await exportEmployeeFoldersZip(employeeId, [folderName], employee?.name);
    G.notify?.(`Carpeta "${normalizeDocumentFolder(folderName)}" exportada en ZIP.`, "success");
  } catch (err) {
    G.notify?.(String(err?.message || "No se pudo exportar la carpeta."), "error");
  } finally {
    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.classList.remove("is-loading");
    }
  }
}

/** Diálogo para exportar una o varias carpetas del expediente en un único ZIP. */
function openFolderExportModal(employeeId, preselect = []) {
  if (!modulePerms().view) return;
  const id = String(employeeId || "").trim();
  if (!id) {
    G.notify?.("Abra el expediente de un colaborador para exportar carpetas.", "info");
    return;
  }
  const employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === id);
  const todayYmd = colombiaTodayIsoDate();
  const rows = readDocumentRows(read(KEYS.payrollEmployees, []), todayYmd);
  const options = buildFolderTiles(
    id,
    rows,
    read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow)
  );
  if (!options.some((opt) => opt.count > 0)) {
    G.notify?.("El expediente no tiene archivos para exportar.", "info");
    return;
  }
  const preselectKeys = new Set((preselect || []).filter(Boolean).map((name) => documentFolderKey(name)));
  const IC = G.IC || {};
  const items = options
    .map((opt) => {
      const empty = opt.count === 0;
      const checked = !empty && (!preselectKeys.size || preselectKeys.has(documentFolderKey(opt.name)));
      return `<li class="doc-export__item${empty ? " doc-export__item--empty" : ""}">
        <label class="doc-export__check">
          <input type="checkbox" data-doc-export-folder value="${escapeAttr(opt.name)}" data-count="${opt.count}" data-size="${opt.sizeBytes}"${checked ? " checked" : ""}${empty ? " disabled" : ""} />
          <span class="doc-export__folder">
            <span class="doc-export__folder-name">${IC.folder || ""} ${escapeHtml(opt.name)}</span>
            <span class="doc-export__folder-meta">${
              empty
                ? "Sin archivos"
                : `${opt.count} archivo${opt.count === 1 ? "" : "s"} · ${escapeHtml(formatFileSize(opt.sizeBytes))}`
            }</span>
          </span>
        </label>
      </li>`;
    })
    .join("");

  closeFolderExportModal();
  const overlay = document.createElement("div");
  overlay.id = "doc-export-overlay";
  overlay.className = "doc-export-overlay";
  overlay.innerHTML = `<div class="doc-export" role="dialog" aria-modal="true" aria-labelledby="doc-export-title">
    <header class="doc-export__head">
      <div class="doc-export__titles">
        <p class="doc-export__eyebrow">Exportar expediente</p>
        <h3 class="doc-export__title" id="doc-export-title">Descargar carpetas en ZIP</h3>
        <p class="doc-export__subtitle">${escapeHtml(String(employee?.name || "Colaborador"))}</p>
      </div>
      <button type="button" class="doc-icon-btn" data-doc-export-close aria-label="Cerrar">${IC.x || "×"}</button>
    </header>
    <form class="doc-export__form" data-doc-export-form>
      <div class="doc-export__toolbar">
        <label class="doc-export__check doc-export__check--all">
          <input type="checkbox" data-doc-export-all />
          <span>Seleccionar todas</span>
        </label>
        <span class="doc-export__summary" data-doc-export-summary aria-live="polite"></span>
      </div>
      <ul class="doc-export__list">${items}</ul>
      <footer class="doc-export__actions">
        <button type="button" class="btn btn-sm btn-outline" data-doc-export-close>Cancelar</button>
        <button type="submit" class="btn btn-sm btn-primary" data-doc-export-submit>${IC.download || ""} Descargar ZIP</button>
      </footer>
    </form>
  </div>`;

  const previouslyFocused = document.activeElement;
  const close = () => {
    document.removeEventListener("keydown", onKey);
    closeFolderExportModal();
    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  };
  const onKey = (ev) => {
    if (ev.key === "Escape") close();
    else if (ev.key === "Tab") trapFocus(overlay, ev);
  };
  const boxes = () => [...overlay.querySelectorAll("[data-doc-export-folder]:not(:disabled)")];
  const syncSummary = () => {
    const selected = boxes().filter((box) => box.checked);
    const files = selected.reduce((sum, box) => sum + (Number(box.dataset.count) || 0), 0);
    const bytes = selected.reduce((sum, box) => sum + (Number(box.dataset.size) || 0), 0);
    const summary = overlay.querySelector("[data-doc-export-summary]");
    if (summary) {
      summary.textContent = selected.length
        ? `${selected.length} carpeta${selected.length === 1 ? "" : "s"} · ${files} archivo${files === 1 ? "" : "s"} · ${formatFileSize(bytes)}`
        : "Ninguna carpeta seleccionada";
    }
    const all = overlay.querySelector("[data-doc-export-all]");
    if (all) {
      all.checked = selected.length > 0 && selected.length === boxes().length;
      all.indeterminate = selected.length > 0 && selected.length < boxes().length;
    }
    const submit = overlay.querySelector("[data-doc-export-submit]");
    if (submit) submit.disabled = !selected.length;
  };

  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay || ev.target.closest("[data-doc-export-close]")) close();
  });
  overlay.addEventListener("change", (ev) => {
    if (ev.target.matches("[data-doc-export-all]")) {
      const next = ev.target.checked;
      boxes().forEach((box) => {
        box.checked = next;
      });
    }
    syncSummary();
  });
  overlay.querySelector("[data-doc-export-form]")?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const selected = boxes()
      .filter((box) => box.checked)
      .map((box) => box.value);
    if (!selected.length) return;
    const submit = overlay.querySelector("[data-doc-export-submit]");
    const prevHtml = submit ? submit.innerHTML : "";
    if (submit) {
      submit.disabled = true;
      submit.classList.add("is-loading");
      submit.textContent = "Preparando ZIP…";
    }
    try {
      const exported = await exportEmployeeFoldersZip(id, selected, employee?.name);
      G.notify?.(
        exported.length === 1
          ? `Carpeta "${exported[0]}" exportada en ZIP.`
          : `${exported.length} carpetas exportadas en ZIP.`,
        "success"
      );
      close();
    } catch (err) {
      G.notify?.(String(err?.message || "No se pudo exportar el expediente."), "error");
      if (submit) {
        submit.disabled = false;
        submit.classList.remove("is-loading");
        if (prevHtml) submit.innerHTML = prevHtml;
      }
    }
  });

  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
  syncSummary();
  overlay.querySelector("[data-doc-export-all]")?.focus();
}

function exportRowsToCsv(rows, filename) {
  if (!rows.length) {
    G.notify?.("No hay documentos que coincidan con los filtros actuales.", "info");
    return;
  }
  const todayYmd = colombiaTodayIsoDate();
  const csvRows = buildEmployeeDocumentExportRows(rows, read(KEYS.payrollEmployees, []), todayYmd);
  const columns = Object.keys(csvRows[0]).map((key) => ({ key, label: key }));
  downloadCsv(filename, csvRows, columns);
}

/* ==========================================================================
   Modales de carpeta y documento
   ========================================================================== */

function openCreateFolderModal(defaultEmployeeId = "") {
  if (!modulePerms().upload) return;
  const employees = read(KEYS.payrollEmployees, []);
  const empOpts = [...employees]
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"))
    .map((emp) => ({
      value: String(emp.id),
      label: `${String(emp.name || "Sin nombre")} · ${String(emp.documentType || "CC")} ${String(emp.idDoc || "")}`,
      selected: String(emp.id) === String(defaultEmployeeId || "")
    }));
  G.openEditModal?.({
    title: "Nueva carpeta",
    subtitle: "Organice el expediente por carpetas dentro de cada colaborador.",
    submitText: "Crear carpeta",
    fields: [
      {
        name: "employeeId",
        label: "Colaborador",
        type: "select",
        required: true,
        value: defaultEmployeeId || "",
        options: [{ value: "", label: "— Seleccione —", selected: !defaultEmployeeId }, ...empOpts]
      },
      {
        name: "folderName",
        label: "Nombre de carpeta",
        required: true,
        placeholder: "Ej. Contratos 2025, Certificados médicos"
      }
    ],
    onSubmit: async (form) => {
      const employeeId = String(form.employeeId || "").trim();
      const folderName = normalizeDocumentFolder(form.folderName);
      if (!employeeId) {
        G.failPortalField?.(document.getElementById("crud-form"), "employeeId", "Seleccione un colaborador.");
        return false;
      }
      if (!folderName) {
        G.failPortalField?.(document.getElementById("crud-form"), "folderName", "Indique el nombre de la carpeta.");
        return false;
      }
      const employee = employees.find((e) => String(e.id) === employeeId);
      const list = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
      const docs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
      const key = documentFolderKey(folderName);
      const exists =
        docs.some((d) => String(d.employeeId) === employeeId && documentFolderKey(d.folder) === key) ||
        list.some((f) => String(f.employeeId) === employeeId && documentFolderKey(f.folderName) === key);
      if (exists) {
        G.notify?.("Esa carpeta ya existe para el colaborador.", "error");
        return false;
      }
      const record = normalizeEmployeeDocumentFolderRow({
        id: newUuidV4(),
        employeeId,
        employeeName: employee?.name || "Colaborador",
        folderName,
        createdBy: currentActorLabel(),
        createdAt: new Date().toISOString()
      });
      try {
        await writeAwaitServerCreate(KEYS.employeeDocumentFolders, [...list, record], record);
        const actor = String(record.createdBy || currentActorLabel()).trim();
        G.logPortalAuditEvent?.("documents", "create", {
          entityId: record.id,
          entityKind: "folder",
          entityLabel: `${record.employeeName} · ${record.folderName}`,
          summary: `Alta de carpeta documental · ${record.folderName} · Creada por ${actor}`,
          changesText: `Fecha: ${formatUploadDate(record.createdAt)} · Usuario: ${actor}`,
          usuario: actor,
          actor,
          at: record.createdAt
        });
        G.notify?.("Carpeta creada.", "success");
        patchUi({
          section: "files",
          folderBrowseEmployeeId: employeeId,
          selectedFolder: folderName,
          selectedEmployeeId: employeeId
        });
        persistHrWorkspace("documents", "files");
        rerender();
        return true;
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo crear la carpeta."), "error");
        return false;
      }
    }
  });
}

function openDeleteFolderFlow(employeeId, folderName) {
  if (!modulePerms().upload) return;
  const id = String(employeeId || "").trim();
  const folder = normalizeDocumentFolder(folderName);
  if (!id || !folder) {
    G.notify?.("Seleccione colaborador y carpeta.", "error");
    return;
  }
  if (documentFolderKey(folder) === documentFolderKey(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER)) {
    G.notify?.("La carpeta General no se puede eliminar.", "error");
    return;
  }
  const docs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  const docCount = countDocumentsInFolder(id, folder, docs);
  const message =
    docCount > 0
      ? `Se eliminará la carpeta "${folder}". Sus ${docCount} documento${docCount === 1 ? "" : "s"} pasarán a General.`
      : `Se eliminará la carpeta vacía "${folder}".`;
  const requestDeletion = G.openConfirmReasonModal || G.openConfirmModal;
  requestDeletion?.({
    title: "Eliminar carpeta",
    message,
    confirmText: "Eliminar carpeta",
    onConfirm: async (motivo) => {
      try {
        const folderKey = documentFolderKey(folder);
        const list = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
        const toMove = list.filter((d) => String(d.employeeId) === id && documentFolderKey(d.folder) === folderKey);
        for (const doc of toMove) {
          const updated = normalizeEmployeeDocumentRow({
            ...doc,
            folder: DEFAULT_EMPLOYEE_DOCUMENT_FOLDER,
            updatedAt: new Date().toISOString()
          });
          const nextList = read(KEYS.employeeDocuments, []).map((row) =>
            String(row?.id) === String(doc.id) ? updated : row
          );
          await writeAwaitServerEdit(KEYS.employeeDocuments, nextList, doc.id);
        }
        const folders = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
        const toDelete = folders.filter(
          (f) => String(f.employeeId) === id && documentFolderKey(f.folderName) === folderKey
        );
        for (const row of toDelete) {
          if (!row.id) continue;
          const ok = await G.removeFromPortalListAwaitServer?.(KEYS.employeeDocumentFolders, row.id);
          if (!ok) {
            G.notify?.("No se pudo eliminar el registro de carpeta.", "error");
            return;
          }
        }
        const reason = String(motivo || "").trim();
        const actor = currentActorLabel();
        G.logPortalAuditEvent?.("documents", "delete", {
          entityId: `${id}:${folderKey}`,
          entityKind: "folder",
          entityLabel: `Carpeta · ${folder}`,
          summary: `Eliminación de carpeta documental · ${folder} · Eliminada por ${actor}${docCount ? ` · ${docCount} docs → General` : ""}${reason ? ` · Motivo: ${reason}` : ""}`,
          changesText: `Usuario: ${actor}${reason ? ` · Motivo: ${reason}` : ""}`,
          usuario: actor,
          actor
        });
        patchUi({ selectedFolder: "", selectedEmployeeId: id });
        G.notify?.("Carpeta eliminada.", "success");
        rerender();
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo eliminar la carpeta."), "error");
      }
    }
  });
}

function openEditDocumentModal(target) {
  if (!modulePerms().edit || !target?.id) return;
  const todayYmd = colombiaTodayIsoDate();
  const typeOpts = EMPLOYEE_DOCUMENT_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
    selected: String(target.documentType) === t.value
  }));
  if (!typeOpts.some((o) => o.selected) && target.documentType) {
    typeOpts.unshift({
      value: target.documentType,
      label: getEmployeeDocumentTypeLabel(target.documentType),
      selected: true
    });
  }
  G.openEditModal?.({
    title: "Editar documento",
    subtitle: `${target.employeeName || "Colaborador"} · ${target.fileName || ""}`,
    submitText: "Guardar cambios",
    fields: [
      {
        name: "documentType",
        label: "Tipo de documento",
        type: "select",
        value: target.documentType || "otro",
        options: typeOpts,
        required: true
      },
      {
        name: "folder",
        label: "Carpeta",
        value: normalizeDocumentFolder(target.folder),
        required: true,
        hint: "Nombre lógico de la carpeta dentro del expediente del colaborador."
      },
      { name: "documentCode", label: "Código documental", value: target.documentCode || "" },
      { name: "issueDate", label: "Fecha emisión", type: "date", value: target.issueDate || "" },
      {
        name: "dueDate",
        label: "Fecha vencimiento",
        type: "date",
        value: target.dueDate || "",
        hint: "Obligatoria para contratos, afiliaciones, exámenes y licencias."
      },
      { name: "notes", label: "Observaciones", type: "textarea", value: target.notes || "", rows: 3 },
      {
        type: "section",
        title: "Archivo",
        hint: `El archivo en Cloudflare R2 no se modifica aquí (${target.fileName || "—"}). Para reemplazarlo, suba un nuevo documento del mismo tipo: quedará como versión vigente.`
      }
    ],
    onSubmit: async (form) => {
      const docType = String(form.documentType || target.documentType || "otro").trim();
      if (employeeDocumentTypeRequiresExpiry(docType) && !String(form.dueDate || "").trim()) {
        G.failPortalField?.(
          document.getElementById("crud-form"),
          "dueDate",
          "Indique la fecha de vencimiento para este tipo de documento."
        );
        return false;
      }
      const fresh = read(KEYS.employeeDocuments, []);
      if (!fresh.some((r) => String(r.id) === String(target.id))) {
        G.notify?.("El documento ya no está disponible. Actualice la página.", "error");
        return false;
      }
      const dueDate = String(form.dueDate || "").trim() || null;
      const issueDate = String(form.issueDate || "").trim() || null;
      const folder = normalizeDocumentFolder(form.folder);
      const nextList = fresh.map((r) => {
        if (String(r.id) !== String(target.id)) return r;
        const updated = normalizeEmployeeDocumentRow({
          ...r,
          documentType: docType,
          folder,
          documentCode: String(form.documentCode || "").trim(),
          issueDate,
          dueDate,
          expiryDate: dueDate,
          notes: String(form.notes || "").trim(),
          status: computeEmployeeDocumentStatus(dueDate, todayYmd),
          updatedAt: new Date().toISOString()
        });
        return typeof G.stampUpdatedRecord === "function" ? G.stampUpdatedRecord(updated) : updated;
      });
      try {
        await writeAwaitServerEdit(KEYS.employeeDocuments, nextList, target.id);
        await ensureEmployeeFolderRecord(String(target.employeeId || ""), folder);
        const updatedDoc = nextList.find((r) => String(r.id) === String(target.id)) || target;
        G.logPortalAuditEvent?.(
          "documents",
          "update",
          buildDocumentAuditDetail("update", updatedDoc, { uploadedBy: currentActorLabel() })
        );
        G.notify?.("Documento actualizado.", "success");
        rerender();
        return true;
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo guardar."), "error");
        return false;
      }
    }
  });
}

/** Mueve uno o varios documentos del mismo colaborador a otra carpeta. */
async function moveDocumentsToFolder(docIds, folderName) {
  const folder = normalizeDocumentFolder(folderName);
  const ids = (docIds || []).map(String).filter(Boolean);
  if (!folder || !ids.length) return 0;
  let moved = 0;
  let firstEmployeeId = "";
  for (const id of ids) {
    const list = read(KEYS.employeeDocuments, []);
    const current = list.find((r) => String(r.id) === id);
    if (!current) continue;
    const row = normalizeEmployeeDocumentRow(current);
    if (documentFolderKey(row.folder) === documentFolderKey(folder)) continue;
    firstEmployeeId = firstEmployeeId || String(row.employeeId);
    const updated = normalizeEmployeeDocumentRow({
      ...row,
      folder,
      updatedAt: new Date().toISOString()
    });
    const nextList = list.map((r) => (String(r.id) === id ? updated : r));
    await writeAwaitServerEdit(KEYS.employeeDocuments, nextList, id);
    G.logPortalAuditEvent?.(
      "documents",
      "update",
      buildDocumentAuditDetail("update", updated, {
        uploadedBy: currentActorLabel(),
        summary: `Cambio de carpeta · ${updated.fileName} · ${row.folder} → ${folder}`
      })
    );
    moved += 1;
  }
  if (moved && firstEmployeeId) await ensureEmployeeFolderRecord(firstEmployeeId, folder);
  return moved;
}

function openMoveFolderModal(docIds, employeeId) {
  if (!modulePerms().edit) return;
  const ids = (docIds || []).map(String).filter(Boolean);
  if (!ids.length) return;
  const todayYmd = colombiaTodayIsoDate();
  const employees = read(KEYS.payrollEmployees, []);
  const rows = readDocumentRows(employees, todayYmd);
  const folders = collectEmployeeFolders(
    employeeId,
    rows.filter((r) => String(r.employeeId) === String(employeeId)),
    read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow)
  );
  G.openEditModal?.({
    title: ids.length === 1 ? "Mover documento" : `Mover ${ids.length} documentos`,
    subtitle: "El archivo no se vuelve a subir: solo cambia de carpeta dentro del expediente.",
    submitText: "Mover",
    fields: [
      {
        name: "folder",
        label: "Carpeta destino",
        type: "select",
        required: true,
        options: folders.map((name) => ({ value: name, label: name }))
      }
    ],
    onSubmit: async (form) => {
      const folder = normalizeDocumentFolder(form.folder);
      if (!folder) {
        G.failPortalField?.(document.getElementById("crud-form"), "folder", "Seleccione la carpeta destino.");
        return false;
      }
      try {
        const moved = await moveDocumentsToFolder(ids, folder);
        G.notify?.(
          moved === 0
            ? "Los documentos ya estaban en esa carpeta."
            : `${moved} documento${moved === 1 ? "" : "s"} movido${moved === 1 ? "" : "s"} a "${folder}".`,
          moved ? "success" : "info"
        );
        patchUi({ selectedIds: [] });
        rerender();
        return true;
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo mover el documento."), "error");
        return false;
      }
    }
  });
}

function deleteDocumentFlow(rows, ids) {
  if (!modulePerms().del) return;
  const targets = ids.map((id) => findRow(rows, id)).filter(Boolean);
  if (!targets.length) return;
  const single = targets.length === 1 ? targets[0] : null;
  const requestDeletion = G.openConfirmReasonModal || G.openConfirmModal;
  requestDeletion?.({
    title: single ? "Eliminar documento" : `Eliminar ${targets.length} documentos`,
    message: single
      ? `Se eliminará "${single.fileName}" del expediente de ${single.employeeName}. El archivo en almacenamiento puede conservarse por auditoría. Indique la justificación.`
      : `Se eliminarán ${targets.length} registros del expediente digital. Los archivos en almacenamiento pueden conservarse por auditoría. Indique la justificación.`,
    confirmText: single ? "Eliminar registro" : `Eliminar ${targets.length} registros`,
    onConfirm: async (motivo) => {
      const reason = String(motivo || "").trim();
      let removed = 0;
      for (const doc of targets) {
        const ok = await G.removeFromPortalListAwaitServer?.(KEYS.employeeDocuments, String(doc.id));
        if (!ok) continue;
        G.logPortalAuditEvent?.(
          "documents",
          "delete",
          buildDocumentAuditDetail("delete", doc, { uploadedBy: currentActorLabel(), reason })
        );
        removed += 1;
      }
      if (!removed) {
        G.notify?.("No se pudo eliminar.", "error");
        return;
      }
      G.notify?.(
        removed === 1 ? "Documento eliminado del expediente." : `${removed} documentos eliminados.`,
        "success"
      );
      patchUi({ selectedIds: [], drawerDocId: "" });
      rerender();
    }
  });
}

/* ==========================================================================
   Resumen diario de vencimientos
   ========================================================================== */

let lastDigestWallMs = 0;
async function maybeDispatchDocumentExpiryDigest() {
  if (!modulePerms().view) return;
  const now = Date.now();
  if (now - lastDigestWallMs < 45000) return;
  const todayYmd = colombiaTodayIsoDate();
  const storageKey = "antares_doc_expiry_digest_v1";
  try {
    if (localStorage.getItem(storageKey) === todayYmd) return;
  } catch (_e) {
    /* noop */
  }
  lastDigestWallMs = now;
  const allDocs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  const summary = summarizeEmployeeDocuments(allDocs, todayYmd);
  const markDone = () => {
    try {
      localStorage.setItem(storageKey, todayYmd);
    } catch (_e) {
      /* noop */
    }
  };
  if (!summary.expired && !summary.dueSoon) {
    markDone();
    return;
  }
  const dispatch = G.dispatchPortalNotification;
  if (typeof dispatch !== "function") return;
  const parts = [];
  if (summary.expired) parts.push(`${summary.expired} vencido${summary.expired === 1 ? "" : "s"}`);
  if (summary.dueSoon) parts.push(`${summary.dueSoon} por vencer`);
  const ok = await dispatch({
    audience: "hr",
    title: "Documentos por revisar",
    body: `${parts.join(" · ")}. Abra Gestión documental.`,
    category: "hr",
    deepLink: "#portal/document-management",
    entityType: "employee",
    entityId: `doc_expiry_${todayYmd}`
  });
  if (ok) markDone();
}

/* ==========================================================================
   Dropzone de carga
   ========================================================================== */

function applyPendingUploadFileToDom(root) {
  const scope = root || document;
  const fileInput = scope.querySelector("#doc-upload-file");
  if (!fileInput) return;
  const fileLabel = scope.querySelector("[data-doc-file-label]");
  const dropzone = scope.querySelector("[data-doc-dropzone]");
  const clearBtn = scope.querySelector("[data-action='doc-clear-upload-files']");
  const files = pendingUploadFiles.filter((f) => f instanceof File);
  if (files.length) {
    try {
      const dt = new DataTransfer();
      for (const f of files) dt.items.add(f);
      fileInput.files = dt.files;
    } catch (_err) {
      /* El submit usará `pendingUploadFiles` si el navegador no deja escribir `files`. */
    }
    if (fileLabel) {
      const total = files.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
      fileLabel.textContent =
        files.length === 1
          ? `${files[0].name} (${formatFileSize(files[0].size)})`
          : `${files.length} archivos · ${formatFileSize(total)}`;
    }
    dropzone?.classList.add("is-filled");
    if (clearBtn) clearBtn.hidden = false;
  } else {
    if (fileLabel) fileLabel.textContent = "Sin archivos seleccionados";
    dropzone?.classList.remove("is-filled");
    fileInput.value = "";
    if (clearBtn) clearBtn.hidden = true;
  }
}

function setPendingUploadFiles(fileList, root) {
  pendingUploadFiles = Array.from(fileList || []).filter((f) => f instanceof File);
  applyPendingUploadFileToDom(root);
}

function getSelectedUploadFiles(fileInput) {
  const fromInput = fileInput?.files?.length ? Array.from(fileInput.files) : [];
  return fromInput.length ? fromInput : pendingUploadFiles.filter((f) => f instanceof File);
}

/** Abre el drawer de carga con destino y tipo preseleccionados. */
function openUploadDrawer({ employeeId = "", folder = "", documentType = "" } = {}) {
  if (!modulePerms().upload) {
    G.notify?.("No tiene permiso para subir documentos.", "error");
    return;
  }
  const ui = getUi();
  patchUi({
    uploadOpen: true,
    selectedEmployeeId: employeeId || ui.selectedEmployeeId || ui.folderBrowseEmployeeId || "",
    selectedFolder: folder || ui.selectedFolder || "",
    selectedDocumentType: documentType || ""
  });
  rerender();
}

/* ==========================================================================
   Binds
   ========================================================================== */

function bindDocumentManagementPortalControls() {
  if (String(state.currentView || "") !== "document-management" || !nodes.viewRoot) return;
  const root = nodes.viewRoot.querySelector("[data-doc-root]");
  if (!root) return;

  void maybeDispatchDocumentExpiryDigest();

  restoreScroll();
  syncIndeterminateCheckboxes(root);
  applyPendingUploadFileToDom(root);
  bindKebabMenus(root);
  bindDragAndDrop(root);
  bindUploadForm(root);
  bindGlobalListenersOnce();

  root.addEventListener("click", (ev) => onRootClick(ev, root));
  root.addEventListener("change", (ev) => onRootChange(ev, root));
  root.addEventListener("input", onRootInput);

  focusAfterRender(root);
}

function restoreScroll() {
  if (!pendingScrollTop) return;
  const target = pendingScrollTop;
  pendingScrollTop = 0;
  window.scrollTo({ top: target, behavior: "instant" in window ? "instant" : "auto" });
}

/** `indeterminate` no es un atributo HTML: hay que fijarlo por propiedad. */
function syncIndeterminateCheckboxes(root) {
  root.querySelectorAll("[data-action='doc-select-all']").forEach((box) => {
    box.indeterminate = box.dataset.indeterminate === "1";
  });
}

/* --- Click ---------------------------------------------------------------- */

function onRootClick(ev, root) {
  const trigger = ev.target.closest("[data-action]");
  if (!trigger || !root.contains(trigger)) return;
  const action = String(trigger.dataset.action || "");
  const id = String(trigger.dataset.id || "");
  const ui = getUi();

  switch (action) {
    case "doc-section": {
      const section = normalizeDocumentSection(trigger.dataset.section);
      patchUiAndResetWindow({
        section,
        drawerDocId: "",
        railOpen: false,
        filtersOpen: false,
        folderBrowseEmployeeId: section === "files" ? ui.folderBrowseEmployeeId : "",
        selectedFolder: section === "files" ? ui.selectedFolder : ""
      });
      persistHrWorkspace("documents", section);
      rerender();
      return;
    }
    case "doc-toggle-rail":
      patchUi({ railOpen: !ui.railOpen });
      rerender();
      return;
    case "doc-close-drawer":
      patchUi({ drawerDocId: "" });
      rerender();
      return;
    case "doc-dismiss-overlay":
      /* Scrim: cierra rail móvil o el flujo de carga, lo que esté abierto. */
      if (ui.uploadOpen) patchUi({ uploadOpen: false });
      else if (ui.railOpen) patchUi({ railOpen: false });
      rerender();
      return;
    case "doc-quick-access":
      patchUiAndResetWindow({
        section: "files",
        folderBrowseEmployeeId: String(trigger.dataset.employeeId || ""),
        selectedFolder: String(trigger.dataset.folder || ""),
        railOpen: false
      });
      persistHrWorkspace("documents", "files");
      rerender();
      return;
    case "doc-browse-root":
      patchUiAndResetWindow({ section: "files", folderBrowseEmployeeId: "", selectedFolder: "" });
      rerender();
      return;
    case "doc-browse-employee":
      patchUiAndResetWindow({
        section: "files",
        folderBrowseEmployeeId: String(trigger.dataset.employeeId || ""),
        selectedFolder: ""
      });
      persistHrWorkspace("documents", "files");
      rerender();
      return;
    case "doc-browse-folder":
      patchUiAndResetWindow({ selectedFolder: String(trigger.dataset.folder || "") });
      rerender();
      return;
    case "doc-view-mode": {
      const viewMode = normalizeDocumentViewMode(trigger.dataset.view);
      patchUi({ viewMode });
      persistHrWorkspace("documents", ui.section);
      rerender();
      return;
    }
    case "doc-sort-dir":
      patchUi({ sortDir: ui.sortDir === "asc" ? "desc" : "asc" });
      rerender();
      return;
    case "doc-sort-column": {
      const key = normalizeDocumentSortKey(trigger.dataset.key);
      const sortDir = ui.sortKey === key ? (ui.sortDir === "asc" ? "desc" : "asc") : defaultSortDirForKey(key);
      patchUi({ sortKey: key, sortDir });
      rerender();
      return;
    }
    case "doc-toggle-filters":
      patchUi({ filtersOpen: !ui.filtersOpen });
      rerender();
      return;
    case "doc-close-filters":
      patchUi({ filtersOpen: false });
      rerender();
      return;
    case "doc-remove-filter": {
      const key = String(trigger.dataset.filter || "");
      if (key === "dateRange") patchUiAndResetWindow({ dateFrom: "", dateTo: "" });
      else if (key === "onlyCurrentVersions") patchUiAndResetWindow({ onlyCurrentVersions: false });
      else patchUiAndResetWindow({ [key]: "" });
      rerender();
      return;
    }
    case "doc-clear-filters":
      patchUiAndResetWindow(emptyFilters());
      rerender();
      return;
    case "doc-clear-search":
      patchUiAndResetWindow({ search: "" });
      rerender();
      return;
    case "doc-render-more":
      patchUi({ renderLimit: ui.renderLimit + 60 });
      rerender();
      return;
    case "doc-open-upload":
      openUploadDrawer({
        employeeId: String(trigger.dataset.employeeId || ""),
        folder: String(trigger.dataset.folder || ""),
        documentType: String(trigger.dataset.documentType || "")
      });
      return;
    case "doc-close-upload":
      patchUi({ uploadOpen: false });
      rerender();
      return;
    case "doc-pick-type": {
      const documentType = String(trigger.dataset.documentType || "");
      if (!documentType) return;
      const hidden = root.querySelector("[data-doc-type-input]");
      if (hidden) hidden.value = documentType;
      patchUi({ selectedDocumentType: documentType });
      root.querySelectorAll("[data-action='doc-pick-type']").forEach((el) => {
        const active = String(el.dataset.documentType) === documentType;
        el.classList.toggle("is-selected", active);
        el.setAttribute("aria-pressed", active ? "true" : "false");
      });
      syncDueRequired(root, documentType);
      return;
    }
    case "doc-clear-upload-files":
      ev.preventDefault();
      setPendingUploadFiles([], root);
      return;
    case "doc-new-folder":
      openCreateFolderModal(String(trigger.dataset.employeeId || ui.folderBrowseEmployeeId || ""));
      return;
    case "doc-delete-folder":
      openDeleteFolderFlow(ui.folderBrowseEmployeeId, String(trigger.dataset.folder || ""));
      return;
    case "doc-export-folders":
      openFolderExportModal(
        String(trigger.dataset.employeeId || ui.folderBrowseEmployeeId || ""),
        ui.selectedFolder ? [ui.selectedFolder] : []
      );
      return;
    case "doc-export-folder":
      void runSingleFolderExport(ui.folderBrowseEmployeeId, String(trigger.dataset.folder || ""), trigger);
      return;
    case "doc-export-csv": {
      const ctx = buildCtx();
      exportRowsToCsv(ctx.visibleRows, `expediente-documental-${ctx.todayYmd}.csv`);
      return;
    }
    case "doc-clear-selection":
      patchUi({ selectedIds: [] });
      rerender();
      return;
    default:
      break;
  }

  /* Acciones que necesitan resolver el documento por id. */
  const needsRow = new Set([
    "doc-open-drawer",
    "doc-preview",
    "doc-download",
    "doc-edit",
    "doc-move",
    "doc-delete",
    "doc-goto-file",
    "doc-toggle-favorite"
  ]);
  if (needsRow.has(action)) {
    handleRowAction(action, id, trigger);
    return;
  }

  const bulkActions = new Set(["doc-bulk-zip", "doc-bulk-csv", "doc-bulk-move", "doc-bulk-delete"]);
  if (bulkActions.has(action)) handleBulkAction(action);
}

function handleRowAction(action, id, trigger) {
  const todayYmd = colombiaTodayIsoDate();
  const employees = read(KEYS.payrollEmployees, []);
  const rows = readDocumentRows(employees, todayYmd);
  const row = findRow(rows, id);
  if (!row) {
    G.notify?.("El documento ya no está disponible. Actualice la página.", "error");
    return;
  }

  switch (action) {
    case "doc-open-drawer":
      touchRecent(row);
      patchUi({ drawerDocId: String(row.id) });
      rerender();
      return;
    case "doc-toggle-favorite": {
      const on = toggleFavorite(row.id);
      G.notify?.(on ? "Añadido a favoritos." : "Quitado de favoritos.", "info");
      rerender();
      return;
    }
    case "doc-goto-file":
      patchUiAndResetWindow({
        section: "files",
        folderBrowseEmployeeId: String(row.employeeId),
        selectedFolder: row.folderName,
        drawerDocId: ""
      });
      persistHrWorkspace("documents", "files");
      rerender();
      return;
    case "doc-download":
      void (async () => {
        if (!row.storageKey) {
          G.notify?.("El documento no tiene archivo asociado.", "error");
          return;
        }
        try {
          await downloadDocumentRecord(row);
          touchRecent(row);
        } catch (err) {
          G.notify?.(String(err?.message || "No se pudo descargar."), "error");
        }
      })();
      return;
    case "doc-preview":
      void (async () => {
        if (!row.canPreview) {
          G.notify?.("Este formato no tiene vista previa. Descárguelo para abrirlo.", "info");
          return;
        }
        if (trigger) trigger.disabled = true;
        try {
          const url = await resolveDocumentDownloadUrl(row);
          openDocumentPreview(row, url);
          touchRecent(row);
        } catch (err) {
          G.notify?.(String(err?.message || "No se pudo abrir la vista previa."), "error");
        } finally {
          if (trigger) trigger.disabled = false;
        }
      })();
      return;
    case "doc-edit":
      openEditDocumentModal(row);
      return;
    case "doc-move":
      openMoveFolderModal([row.id], row.employeeId);
      return;
    case "doc-delete":
      deleteDocumentFlow(rows, [row.id]);
      return;
    default:
      break;
  }
}

function handleBulkAction(action) {
  const ctx = buildCtx();
  const { selectionSummary } = ctx;
  if (!selectionSummary.count) return;

  switch (action) {
    case "doc-bulk-csv":
      exportRowsToCsv(selectionSummary.rows, `documentos-seleccionados-${ctx.todayYmd}.csv`);
      return;
    case "doc-bulk-zip": {
      if (!selectionSummary.singleEmployeeId) {
        G.notify?.("El ZIP se genera por expediente: seleccione documentos de un solo colaborador.", "info");
        return;
      }
      /*
       * El endpoint exporta carpetas completas, no archivos sueltos. Se abre el
       * diálogo con las carpetas de la selección ya marcadas para que quede
       * explícito qué se va a descargar.
       */
      const folders = [...new Set(selectionSummary.rows.map((r) => r.folderName))];
      openFolderExportModal(selectionSummary.singleEmployeeId, folders);
      return;
    }
    case "doc-bulk-move":
      if (!selectionSummary.singleEmployeeId) {
        G.notify?.("Las carpetas son propias de cada expediente: seleccione un solo colaborador.", "info");
        return;
      }
      openMoveFolderModal(
        selectionSummary.rows.map((r) => r.id),
        selectionSummary.singleEmployeeId
      );
      return;
    case "doc-bulk-delete":
      deleteDocumentFlow(ctx.rows, selectionSummary.rows.map((r) => r.id));
      return;
    default:
      break;
  }
}

/* --- Change --------------------------------------------------------------- */

function onRootChange(ev, root) {
  const target = ev.target;
  const action = String(target?.dataset?.action || "");
  const ui = getUi();

  if (action === "doc-filter") {
    const key = String(target.dataset.filter || "");
    if (!key) return;
    const value = target.type === "checkbox" ? target.checked : target.value;
    patchUiAndResetWindow({ [key]: value, filtersOpen: true });
    rerender();
    return;
  }
  if (action === "doc-sort-key") {
    const key = normalizeDocumentSortKey(target.value);
    patchUi({ sortKey: key, sortDir: defaultSortDirForKey(key) });
    rerender();
    return;
  }
  if (action === "doc-select-all") {
    const ctx = buildCtx();
    patchUi({ selectedIds: target.checked ? ctx.visibleRows.map((r) => String(r.id)) : [] });
    rerender();
    return;
  }
  if (action === "doc-select-row") {
    const id = String(target.dataset.id || "");
    const next = new Set(ui.selectedIds);
    if (target.checked) next.add(id);
    else next.delete(id);
    patchUi({ selectedIds: [...next] });
    rerender();
    return;
  }
  if (target.matches?.("[data-doc-employee-select]")) {
    const employeeId = String(target.value || "");
    if (employeeId) void ensureEmployeeFolderRecord(employeeId, DEFAULT_EMPLOYEE_DOCUMENT_FOLDER);
    patchUi({ selectedEmployeeId: employeeId, selectedDocumentType: "", selectedFolder: "" });
    rerender();
    return;
  }
  if (target.matches?.("[data-doc-folder-select]")) {
    if (target.value !== "__create_folder__") {
      patchUi({ selectedFolder: normalizeDocumentFolder(target.value) });
      return;
    }
    const employeeId = String(root.querySelector("[data-doc-employee-select]")?.value || ui.selectedEmployeeId);
    target.value = normalizeDocumentFolder(ui.selectedFolder) || DEFAULT_EMPLOYEE_DOCUMENT_FOLDER;
    if (!employeeId) {
      G.notify?.("Seleccione primero un colaborador.", "error");
      return;
    }
    openCreateFolderModal(employeeId);
    return;
  }
  if (target.id === "doc-upload-file") setPendingUploadFiles(target.files, root);
}

/* --- Input (búsqueda) ------------------------------------------------------ */

let searchTimer = 0;
function onRootInput(ev) {
  const target = ev.target;
  if (String(target?.dataset?.action || "") !== "doc-search") return;
  const value = String(target.value || "");
  const start = typeof target.selectionStart === "number" ? target.selectionStart : value.length;
  patchUi({ search: value, renderLimit: 60, selectedIds: [] });
  state.__documentsSearchCaret = start;
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => rerender(), 220);
}

/** Devuelve el foco al buscador tras el re-render por debounce. */
function focusAfterRender(root) {
  const caret = state.__documentsSearchCaret;
  if (typeof caret !== "number") return;
  delete state.__documentsSearchCaret;
  queueMicrotask(() => {
    const input = root.querySelector("[data-action='doc-search']");
    if (!input) return;
    input.focus();
    const n = String(input.value || "").length;
    const pos = Math.max(0, Math.min(caret, n));
    input.setSelectionRange?.(pos, pos);
  });
}

/* --- Menús kebab ----------------------------------------------------------- */

function closeAllKebabs(except = null) {
  document.querySelectorAll("[data-doc-kebab]").forEach((wrap) => {
    if (wrap === except) return;
    const trigger = wrap.querySelector("[data-doc-kebab-trigger]");
    const menu = wrap.querySelector("[role='menu']");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (menu) menu.hidden = true;
    wrap.classList.remove("is-open");
  });
}

function bindKebabMenus(root) {
  root.querySelectorAll("[data-doc-kebab]").forEach((wrap) => {
    const trigger = wrap.querySelector("[data-doc-kebab-trigger]");
    const menu = wrap.querySelector("[role='menu']");
    if (!trigger || !menu) return;

    trigger.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const willOpen = menu.hidden;
      closeAllKebabs(wrap);
      menu.hidden = !willOpen;
      wrap.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
      if (willOpen) menu.querySelector("[role='menuitem']")?.focus();
    });

    trigger.addEventListener("keydown", (ev) => {
      if (ev.key !== "ArrowDown" && ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      closeAllKebabs(wrap);
      menu.hidden = false;
      wrap.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      menu.querySelector("[role='menuitem']")?.focus();
    });

    menu.addEventListener("keydown", (ev) => {
      const items = [...menu.querySelectorAll("[role='menuitem']")];
      const index = items.indexOf(document.activeElement);
      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        items[(index + 1) % items.length]?.focus();
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
      } else if (ev.key === "Home") {
        ev.preventDefault();
        items[0]?.focus();
      } else if (ev.key === "End") {
        ev.preventDefault();
        items[items.length - 1]?.focus();
      } else if (ev.key === "Escape" || ev.key === "Tab") {
        closeAllKebabs();
        if (ev.key === "Escape") {
          ev.preventDefault();
          trigger.focus();
        }
      }
    });

    menu.addEventListener("click", () => closeAllKebabs());
  });
}

/* --- Arrastrar y soltar ---------------------------------------------------- */

function bindDragAndDrop(root) {
  const veil = root.querySelector("[data-doc-dropveil]");
  const surface = root.querySelector("[data-doc-dropsurface]");
  let dragDepth = 0;

  /* 1. Archivos del sistema sobre cualquier parte del módulo: abre la carga. */
  if (surface) {
    surface.addEventListener("dragenter", (ev) => {
      if (!hasFiles(ev)) return;
      dragDepth += 1;
      if (veil) veil.hidden = false;
    });
    surface.addEventListener("dragover", (ev) => {
      if (!hasFiles(ev)) return;
      ev.preventDefault();
    });
    surface.addEventListener("dragleave", (ev) => {
      if (!hasFiles(ev)) return;
      dragDepth = Math.max(0, dragDepth - 1);
      if (!dragDepth && veil) veil.hidden = true;
    });
    surface.addEventListener("drop", (ev) => {
      if (!hasFiles(ev)) return;
      ev.preventDefault();
      dragDepth = 0;
      if (veil) veil.hidden = true;
      if (!modulePerms().upload) {
        G.notify?.("No tiene permiso para subir documentos.", "error");
        return;
      }
      const folderTile = ev.target.closest?.("[data-doc-folder-drop]");
      pendingUploadFiles = Array.from(ev.dataTransfer.files).filter((f) => f instanceof File);
      openUploadDrawer({
        employeeId: getUi().folderBrowseEmployeeId,
        folder: folderTile ? String(folderTile.dataset.docFolder || "") : getUi().selectedFolder
      });
    });
  }

  /* 2. Filas del listado sobre una carpeta: mueve el documento. */
  root.querySelectorAll("[data-doc-row]").forEach((node) => {
    node.addEventListener("dragstart", (ev) => {
      const id = String(node.dataset.docId || "");
      if (!id) return;
      const selected = getUi().selectedIds;
      const payload = selected.includes(id) ? selected : [id];
      ev.dataTransfer.setData("application/x-antares-docs", JSON.stringify(payload));
      ev.dataTransfer.effectAllowed = "move";
      node.classList.add("is-dragging");
    });
    node.addEventListener("dragend", () => node.classList.remove("is-dragging"));
  });

  root.querySelectorAll("[data-doc-folder-drop]").forEach((tile) => {
    tile.addEventListener("dragover", (ev) => {
      if (hasFiles(ev) || !modulePerms().edit) return;
      ev.preventDefault();
      tile.classList.add("is-droptarget");
    });
    tile.addEventListener("dragleave", () => tile.classList.remove("is-droptarget"));
    tile.addEventListener("drop", (ev) => {
      tile.classList.remove("is-droptarget");
      if (hasFiles(ev)) return;
      ev.preventDefault();
      if (!modulePerms().edit) {
        G.notify?.("No tiene permiso para mover documentos.", "error");
        return;
      }
      let ids = [];
      try {
        ids = JSON.parse(ev.dataTransfer.getData("application/x-antares-docs") || "[]");
      } catch (_err) {
        ids = [];
      }
      const folder = String(tile.dataset.docFolder || "");
      if (!ids.length || !folder) return;
      void (async () => {
        try {
          const moved = await moveDocumentsToFolder(ids, folder);
          G.notify?.(
            moved
              ? `${moved} documento${moved === 1 ? "" : "s"} movido${moved === 1 ? "" : "s"} a "${folder}".`
              : "Los documentos ya estaban en esa carpeta.",
            moved ? "success" : "info"
          );
          patchUi({ selectedIds: [] });
          rerender();
        } catch (err) {
          G.notify?.(String(err?.message || "No se pudo mover el documento."), "error");
        }
      })();
    });
  });
}

function hasFiles(ev) {
  return Array.from(ev.dataTransfer?.types || []).includes("Files");
}

/* --- Formulario de carga --------------------------------------------------- */

function syncDueRequired(root, docType) {
  const wrap = root.querySelector("[data-doc-due-wrap]");
  if (!wrap) return;
  const required = employeeDocumentTypeRequiresExpiry(docType);
  wrap.classList.toggle("is-required", required);
  const input = wrap.querySelector('input[name="dueDate"]');
  if (input) input.required = required;
  if (required) {
    const details = wrap.closest("details");
    if (details) details.open = true;
  }
}

function bindUploadForm(root) {
  const form = root.querySelector("#form-employee-document");
  if (!form) return;
  const fileInput = root.querySelector("#doc-upload-file");
  const dropzone = root.querySelector("[data-doc-dropzone]");
  syncDueRequired(root, root.querySelector("[data-doc-type-input]")?.value || "");

  if (dropzone) {
    dropzone.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      dropzone.classList.add("is-dragover");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragover"));
    dropzone.addEventListener("drop", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      dropzone.classList.remove("is-dragover");
      if (ev.dataTransfer?.files?.length) setPendingUploadFiles(ev.dataTransfer.files, root);
    });
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (!modulePerms().upload) {
      G.notify?.("No autorizado para subir documentos.", "error");
      return;
    }
    const todayYmd = colombiaTodayIsoDate();
    const fd = new FormData(form);
    const employeeId = String(fd.get("employeeId") || "").trim();
    const documentType = String(
      fd.get("documentType") || root.querySelector("[data-doc-type-input]")?.value || "otro"
    ).trim();
    if (!documentType) {
      G.notify?.("Seleccione el documento del checklist que va a subir.", "error");
      return;
    }
    if (employeeDocumentTypeRequiresExpiry(documentType) && !String(fd.get("dueDate") || "").trim()) {
      G.notify?.("Indique la fecha de vencimiento para este tipo de documento.", "error");
      return;
    }
    const folderRaw = String(fd.get("folder") || "").trim();
    if (folderRaw === "__create_folder__") {
      G.notify?.("Seleccione una carpeta o cree una nueva.", "error");
      return;
    }
    const folder = normalizeDocumentFolder(folderRaw);
    const files = getSelectedUploadFiles(fileInput);
    if (!employeeId || !files.length) {
      G.notify?.("Seleccione colaborador y al menos un archivo.", "error");
      return;
    }
    const oversized = files.find((f) => f.size > EMPLOYEE_DOCUMENT_MAX_BYTES);
    if (oversized) {
      G.notify?.(`"${oversized.name}" supera 50 MB.`, "error");
      return;
    }

    const submitBtn = form.querySelector("[data-doc-submit]");
    const prevSubmitHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      submitBtn.textContent = files.length > 1 ? `Subiendo 0/${files.length}…` : "Subiendo…";
    }

    try {
      await ensureEmployeeFolderRecord(employeeId, folder);
      const employees = read(KEYS.payrollEmployees, []);
      const employee = employees.find((e) => String(e.id) === employeeId);
      const dueDate = String(fd.get("dueDate") || "").trim() || null;
      const issueDate = String(fd.get("issueDate") || "").trim() || null;
      const status = computeEmployeeDocumentStatus(dueDate, todayYmd);
      const documentCode = String(fd.get("documentCode") || "").trim();
      const notes = String(fd.get("notes") || "").trim();
      const uploadedBy = currentActorLabel();
      let list = read(KEYS.employeeDocuments, []);
      let okCount = 0;
      const queue = [...files];

      while (queue.length) {
        const file = queue[0];
        if (submitBtn) {
          submitBtn.textContent = files.length > 1 ? `Subiendo ${okCount + 1}/${files.length}…` : "Subiendo…";
        }
        try {
          const uploaded = await uploadFileToR2(file, employeeId, documentType, folder);
          const record = normalizeEmployeeDocumentRow({
            id: newUuidV4(),
            employeeId,
            employeeName: employee?.name || "Colaborador",
            documentType,
            folder: uploaded.folder || folder,
            fileName: uploaded.fileName || file.name,
            mimeType: uploaded.mimeType || file.type,
            sizeBytes: uploaded.sizeBytes || file.size,
            storageKey: uploaded.key,
            issueDate,
            dueDate,
            status,
            documentCode,
            notes,
            uploadedBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          list = [...list, record];
          await writeAwaitServerCreate(KEYS.employeeDocuments, list, record);
          G.logPortalAuditEvent?.("documents", "create", buildDocumentAuditDetail("create", record));
          touchRecent({ ...record, folderName: record.folder });
          queue.shift();
          pendingUploadFiles = [...queue];
          applyPendingUploadFileToDom(root);
          okCount += 1;
        } catch (fileErr) {
          setPendingUploadFiles(queue, root);
          if (okCount > 0) {
            /* Parcial: se conservan los que sí subieron y el resto queda en el dropzone. */
            G.notify?.(
              `${okCount} archivo${okCount === 1 ? "" : "s"} registrado${okCount === 1 ? "" : "s"}; falló "${file.name}": ${String(fileErr?.message || "error de subida")}.`,
              "error"
            );
            patchUi({ selectedEmployeeId: employeeId, folderBrowseEmployeeId: employeeId });
            rerender();
            return;
          }
          throw fileErr;
        }
      }

      setPendingUploadFiles([], root);
      patchUiAndResetWindow({
        uploadOpen: false,
        section: "files",
        folderBrowseEmployeeId: employeeId,
        selectedFolder: folder,
        selectedEmployeeId: employeeId,
        selectedDocumentType: ""
      });
      persistHrWorkspace("documents", "files");
      G.notify?.(
        okCount === 1
          ? `${getEmployeeDocumentTypeLabel(documentType)} registrado.`
          : `${okCount} documentos registrados.`,
        "success"
      );
      rerender();
    } catch (err) {
      G.notify?.(String(err?.message || "No se pudo subir el documento."), "error");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
        if (prevSubmitHtml) submitBtn.innerHTML = prevSubmitHtml;
        else submitBtn.textContent = "Registrar";
      }
    }
  });
}

/* --- Listeners de documento ------------------------------------------------ */

function bindGlobalListenersOnce() {
  if (globalListenersBound) return;
  globalListenersBound = true;

  document.addEventListener("click", (ev) => {
    if (!ev.target.closest("[data-doc-kebab]")) closeAllKebabs();
    const popover = document.querySelector("[data-doc-filters-popover]:not([hidden])");
    if (popover && !ev.target.closest("[data-doc-filters-popover]") && !ev.target.closest("[data-action='doc-toggle-filters']")) {
      patchUi({ filtersOpen: false });
      rerender();
    }
  });

  document.addEventListener("keydown", (ev) => {
    if (String(state.currentView || "") !== "document-management") return;
    if (ev.key !== "Escape") {
      handleDrawerTab(ev);
      return;
    }
    const ui = getUi();
    if (document.getElementById("doc-preview-overlay") || document.getElementById("doc-export-overlay")) return;
    if (ui.uploadOpen) {
      patchUi({ uploadOpen: false });
      rerender();
    } else if (ui.filtersOpen) {
      patchUi({ filtersOpen: false });
      rerender();
    } else if (ui.drawerDocId) {
      patchUi({ drawerDocId: "" });
      rerender();
    } else if (ui.railOpen) {
      patchUi({ railOpen: false });
      rerender();
    }
  });
}

/** El drawer de carga es modal: el tabulador no debe salir de él. */
function handleDrawerTab(ev) {
  if (ev.key !== "Tab") return;
  const uploadDrawer = document.querySelector("[data-doc-upload-drawer].is-open");
  if (uploadDrawer) trapFocus(uploadDrawer, ev);
}

/* ==========================================================================
   Registro en el portal
   ========================================================================== */

if (typeof window.registerLegacyPortalViews === "function") {
  window.registerLegacyPortalViews({ documentManagementHtml });
}

(function registerDocumentManagementPortalBinds() {
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["document-management"] = bindDocumentManagementPortalControls;
})();

export { documentManagementHtml, bindDocumentManagementPortalControls };
