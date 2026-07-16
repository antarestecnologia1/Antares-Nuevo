/**
 * Gestión documental — expediente digital por colaborador (RRHH).
 */
import { state, nodes, persistHrWorkspace } from "../core/store.js";
import { read, write, writeAwaitServerCreate, writeAwaitServerEdit } from "../core/data-io.js";
import { KEYS, HR_VALID_DOCUMENTS_WS } from "../core/config.js";
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
  normalizeHrWorkspace,
  normalizeDocumentsDataSection,
  normalizeDocumentsOperateSection,
  resolveDocumentsWorkspace
} from "../core/utils.js";
import {
  renderHrWorkspaceTabs,
  renderHrWorkspaceHeader,
  switchHrWorkspacePanels,
  renderHrFormHero,
  renderHrFormHeroBadge
} from "../ui/components.js";
import {
  EMPLOYEE_DOCUMENT_TYPES,
  EMPLOYEE_DOC_DUE_SOON_DAYS,
  EMPLOYEE_DOCUMENT_MAX_BYTES,
  DEFAULT_EMPLOYEE_DOCUMENT_FOLDER,
  CORE_EMPLOYEE_DOCUMENT_TYPES,
  getEmployeeDocumentTypeLabel,
  employeeDocumentTypeRequiresExpiry,
  normalizeEmployeeDocumentRow,
  normalizeEmployeeDocumentFolderRow,
  normalizeDocumentFolder,
  collectEmployeeFolders,
  employeeHasFolderRecord,
  buildEmployeeDocumentFolderRecord,
  computeEmployeeDocumentStatus,
  daysUntilDocumentDue,
  formatFileSize,
  buildEmployeeDocumentExportRows,
  summarizeEmployeeDocuments,
  findEmployeeDocumentGaps,
  countEmployeesWithDocumentGaps,
  applyDocumentListFilters,
  expectedDocumentTypesForEmployee,
  countDocumentsInFolder,
  documentFolderKey
} from "../domain/employee-documents.domain.js";
import { downloadCsv } from "../domain/reporteria.domain.js";

const G = globalThis;

/** Archivos elegidos en el dropzone; sobreviven re-renders. */
let pendingUploadFiles = [];

if (typeof window !== "undefined") {
  window.normalizeEmployeeDocumentRow = normalizeEmployeeDocumentRow;
  window.normalizeEmployeeDocumentFolderRow = normalizeEmployeeDocumentFolderRow;
}

function canViewDocumentsModule() {
  const user = typeof G.currentUser === "function" ? G.currentUser() : currentUser();
  return canAccessDocumentsView(user);
}

function canUploadDocumentsModule() {
  const user = typeof G.currentUser === "function" ? G.currentUser() : currentUser();
  return canUploadDocuments(user);
}

function canEditDocumentsModule() {
  const user = typeof G.currentUser === "function" ? G.currentUser() : currentUser();
  return canEditDocuments(user);
}

function canDeleteDocumentsModule() {
  const user = typeof G.currentUser === "function" ? G.currentUser() : currentUser();
  return canDeleteDocuments(user);
}

async function ensureEmployeeFolderRecord(employeeId, folderName) {
  const id = String(employeeId || "").trim();
  const folder = normalizeDocumentFolder(folderName);
  if (!id || !folder) return;
  const employees = read(KEYS.payrollEmployees, []);
  const employee = employees.find((e) => String(e.id) === id);
  const folders = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
  const existingFolder = folders.find(
    (row) => String(row.employeeId) === id && documentFolderKey(row.folderName) === documentFolderKey(folder)
  );
  if (existingFolder?.id) return;
  const docs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  /* Si aún hay archivos en esa carpeta, no hace falta forzar el alta metadata. */
  if (employeeHasFolderRecord(id, folder, docs, folders)) return;
  const record = buildEmployeeDocumentFolderRecord(
    id,
    folder,
    employee?.name,
    G.currentUser?.()?.fullName || G.currentUser?.()?.email || "Portal"
  );
  record.id = newUuidV4();
  try {
    await writeAwaitServerCreate(KEYS.employeeDocumentFolders, [...folders, record], record);
  } catch (err) {
    /*
     * No bloquear la subida del archivo: tras borrar el último documento la carpeta
     * puede seguir existiendo en servidor (unique id_empleado+nombre) o el sync puede
     * fallar por permisos asimétricos. El expediente del archivo sí debe registrarse.
     */
    console.warn("[documents] ensureEmployeeFolderRecord", err);
    try {
      const cleaned = read(KEYS.employeeDocumentFolders, []).filter((row) => String(row?.id || "") !== String(record.id));
      write(KEYS.employeeDocumentFolders, cleaned, { skipSyncSchedule: true });
    } catch (_rollback) {
      /* noop */
    }
  }
}

function defaultDocumentsWorkspace() {
  if (canUploadDocumentsModule()) return "upload";
  if (canViewDocumentsModule()) return "consult";
  return "data";
}

function getDocumentsUi() {
  const ui = state.documentsUi || {};
  const workspace = resolveDocumentsWorkspace(ui) || defaultDocumentsWorkspace();
  return {
    workspace,
    operateSection: normalizeDocumentsOperateSection(ui.operateSection || "upload"),
    dataSection: normalizeDocumentsDataSection(ui.dataSection || "all"),
    listSearch: String(ui.listSearch || ""),
    selectedEmployeeId: String(ui.selectedEmployeeId || ""),
    typeFilter: String(ui.typeFilter || ""),
    filterEmployeeId: String(ui.filterEmployeeId || ""),
    filterStatus: String(ui.filterStatus || ""),
    folderFilter: String(ui.folderFilter || ""),
    folderBrowseEmployeeId: String(ui.folderBrowseEmployeeId || ""),
    folderBrowseName: String(ui.folderBrowseName || ""),
    selectedDocumentType: String(ui.selectedDocumentType || ""),
    highlightDocumentType: String(ui.highlightDocumentType || ""),
    listViewMode: ui.listViewMode === "grid" ? "grid" : "list",
    selectedFolder: String(ui.selectedFolder || "")
  };
}

function hasActiveDocumentFilters(ui) {
  return Boolean(
    String(ui.listSearch || "").trim() ||
      ui.typeFilter ||
      ui.filterEmployeeId ||
      ui.filterStatus ||
      ui.folderFilter ||
      (ui.dataSection && ui.dataSection !== "all")
  );
}

function collectUniqueDocumentFolders(documents) {
  const names = new Set();
  for (const raw of documents || []) {
    names.add(normalizeDocumentFolder(normalizeEmployeeDocumentRow(raw).folder));
  }
  return [...names].sort((a, b) => a.localeCompare(b, "es"));
}

function buildDocumentListFilters(ui, { employeeId = "", dataSection = null } = {}) {
  return {
    searchNorm: String(ui.listSearch || "").trim().toLowerCase(),
    employeeId: employeeId || ui.filterEmployeeId || "",
    typeFilter: ui.typeFilter,
    statusFilter: ui.filterStatus,
    folderFilter: ui.folderFilter,
    dataSection: dataSection ?? ui.dataSection
  };
}

function renderDocumentsFilterBar({ ui, employees, folderNames = [], mode = "browse", gapsCount = 0 } = {}) {
  const hasFilters = hasActiveDocumentFilters(ui);
  const showEmployee = mode === "browse" && !ui.folderBrowseEmployeeId;
  const showStatus = true;
  const showFolder = false;
  void folderNames;
  void showFolder;
  const employeeOpts = renderEmployeeOptions(employees, ui.filterEmployeeId, { placeholder: false });
  const statusValue =
    ui.dataSection === "gaps"
      ? "__gaps__"
      : ui.dataSection === "due_soon"
        ? "Por vencer"
        : ui.dataSection === "expired"
          ? "Vencido"
          : ui.filterStatus || "";

  const actions = [
    hasFilters
      ? `<button type="button" class="btn btn-sm btn-outline doc-filter-clear" data-action="doc-clear-filters">Limpiar</button>`
      : ""
  ]
    .filter(Boolean)
    .join("");

  return `<div class="doc-filter-bar" data-doc-filter-mode="${escapeAttr(mode)}">
    <div class="doc-filter-bar__search">
      <label class="doc-filter-field doc-filter-field--search">
        <span class="doc-filter-field__label">Buscar</span>
        <input type="search" data-action="doc-filter-search" data-doc-filter-mode="${escapeAttr(mode)}" value="${escapeAttr(ui.listSearch)}" placeholder="${ui.folderBrowseEmployeeId ? "Archivo, tipo, carpeta…" : "Colaborador, documento, cédula…"}" autocomplete="off" spellcheck="false" />
      </label>
    </div>
    <div class="doc-filter-bar__controls">
      ${
        showEmployee
          ? `<label class="doc-filter-field">
        <span class="doc-filter-field__label">Colaborador</span>
        <select data-action="doc-filter-employee" title="Filtrar por colaborador">
          <option value=""${ui.filterEmployeeId ? "" : " selected"}>Todos</option>
          ${employeeOpts}
        </select>
      </label>`
          : ""
      }
      <label class="doc-filter-field">
        <span class="doc-filter-field__label">Tipo documental</span>
        <select data-action="doc-type-filter" title="Filtrar por tipo">${renderDocumentTypeFilterOptions(ui.typeFilter)}</select>
      </label>
      ${
        showStatus
          ? `<label class="doc-filter-field">
        <span class="doc-filter-field__label">Estado</span>
        <select data-action="doc-filter-status" title="Filtrar por estado">
          <option value=""${!statusValue ? " selected" : ""}>Todos</option>
          <option value="Vigente"${statusValue === "Vigente" ? " selected" : ""}>Vigente</option>
          <option value="Por vencer"${statusValue === "Por vencer" ? " selected" : ""}>Por vencer</option>
          <option value="Vencido"${statusValue === "Vencido" ? " selected" : ""}>Vencido</option>
          ${
            !ui.folderBrowseEmployeeId
              ? `<option value="__gaps__"${statusValue === "__gaps__" ? " selected" : ""}>Incompleto${gapsCount > 0 ? ` (${gapsCount})` : ""}</option>`
              : ""
          }
        </select>
      </label>`
          : ""
      }
    </div>
    ${actions ? `<div class="doc-filter-bar__actions">${actions}</div>` : ""}
  </div>`;
}

function renderResultMeta(text) {
  return `<p class="doc-result-meta">${text}</p>`;
}

function patchDocumentsUi(partial) {
  state.documentsUi = { ...(state.documentsUi || {}), ...partial };
  /* Los filtros no se guardan en localStorage (solo la pestaña vía persistHrWorkspace). */
}

function renderDocStatusBadge(doc, todayYmd) {
  const status = computeEmployeeDocumentStatus(doc.dueDate, todayYmd);
  const days = daysUntilDocumentDue(doc.dueDate, todayYmd);
  if (status === "Vencido") {
    return `<span class="doc-status doc-status--expired">Vencido${days !== null ? ` · ${Math.abs(days)}d` : ""}</span>`;
  }
  if (status === "Por vencer") {
    return `<span class="doc-status doc-status--warn">Por vencer · ${days}d</span>`;
  }
  return `<span class="doc-status doc-status--ok">Vigente</span>`;
}

function documentExpiryRowClass(doc, todayYmd) {
  const status = computeEmployeeDocumentStatus(doc.dueDate, todayYmd);
  if (status === "Vencido") return "doc-row--expired";
  if (status === "Por vencer") return "doc-row--warn";
  return "";
}

function renderMimeIcon(mime) {
  const m = String(mime || "").toLowerCase();
  if (m.includes("pdf")) return "PDF";
  if (m.startsWith("image/")) return "IMG";
  if (m.includes("word") || m.includes("document")) return "DOC";
  if (m.includes("sheet") || m.includes("excel")) return "XLS";
  if (m.includes("zip") || m.includes("archive")) return "ZIP";
  return "FILE";
}

function renderMimeClass(mime) {
  const m = String(mime || "").toLowerCase();
  if (m.includes("pdf")) return "pdf";
  if (m.startsWith("image/")) return "image";
  if (m.includes("word") || m.includes("document")) return "word";
  if (m.includes("sheet") || m.includes("excel")) return "sheet";
  if (m.includes("zip") || m.includes("archive")) return "archive";
  return "file";
}

function employeeInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function filterDocuments(documents, filters, todayYmd) {
  return applyDocumentListFilters(documents, filters, todayYmd);
}

function renderEmployeeOptions(employees, selectedId, { placeholder = true } = {}) {
  const sorted = [...employees].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "es")
  );
  const head = placeholder
    ? `<option value=""${selectedId ? "" : " selected"}>— Seleccione colaborador —</option>`
    : "";
  return (
    head +
    sorted
      .map((emp) => {
        const id = String(emp.id || "");
        const label = `${String(emp.name || "Sin nombre")} · ${String(emp.documentType || "CC")} ${String(emp.idDoc || "")}`;
        return `<option value="${escapeAttr(id)}"${id === selectedId ? " selected" : ""}>${escapeHtml(label)}</option>`;
      })
      .join("")
  );
}

function renderDocumentTypeFilterOptions(selected) {
  const opts = [`<option value="">Todos los tipos</option>`];
  for (const t of EMPLOYEE_DOCUMENT_TYPES) {
    opts.push(
      `<option value="${escapeAttr(t.value)}"${t.value === selected ? " selected" : ""}>${escapeHtml(t.label)}</option>`
    );
  }
  return opts.join("");
}

function resolveUploadDocumentType(employeeId, allDocs, preferredType) {
  const preferred = String(preferredType || "").trim();
  if (preferred && EMPLOYEE_DOCUMENT_TYPES.some((t) => t.value === preferred)) return preferred;
  const employees = read(KEYS.payrollEmployees, []);
  const employee = employees.find((e) => String(e.id) === String(employeeId));
  if (employee) {
    const gaps = findEmployeeDocumentGaps(employee, allDocs);
    if (gaps.length) return gaps[0];
  }
  return "cedula";
}

function employeeHasDocumentType(employeeId, documentType, allDocs) {
  const id = String(employeeId || "");
  const type = String(documentType || "").trim();
  if (!id || !type) return false;
  return (allDocs || []).some((raw) => {
    const doc = normalizeEmployeeDocumentRow(raw);
    return String(doc.employeeId) === id && String(doc.documentType) === type;
  });
}

function renderDocumentChecklistItem(typeValue, { employeeId, allDocs, selectedType, todayYmd, highlightType, mode = "view" }) {
  const meta = EMPLOYEE_DOCUMENT_TYPES.find((t) => t.value === typeValue) || {
    value: typeValue,
    label: getEmployeeDocumentTypeLabel(typeValue)
  };
  const ok = employeeHasDocumentType(employeeId, typeValue, allDocs);
  const isSelected = String(selectedType) === String(typeValue);
  const isHighlight = String(highlightType) === String(typeValue);
  const empDocs = (allDocs || []).filter(
    (d) =>
      String(normalizeEmployeeDocumentRow(d).employeeId) === String(employeeId) &&
      String(normalizeEmployeeDocumentRow(d).documentType) === String(typeValue)
  );
  const latest = empDocs[0] ? normalizeEmployeeDocumentRow(empDocs[0]) : null;
  const status = latest ? computeEmployeeDocumentStatus(latest.dueDate, todayYmd) : null;

  if (mode === "pick") {
    return `<button type="button" class="doc-type-picker__item${ok ? " is-complete" : " is-pending"}${isSelected ? " is-selected" : ""}" data-action="doc-pick-type" data-document-type="${escapeAttr(typeValue)}" aria-pressed="${isSelected ? "true" : "false"}">
      <span class="doc-type-picker__check" aria-hidden="true">${ok ? "✓" : ""}</span>
      <span class="doc-type-picker__body">
        <span class="doc-type-picker__label">${escapeHtml(meta.label)}</span>
        <span class="doc-type-picker__state">${ok ? `${empDocs.length} en expediente` : "Pendiente"}</span>
      </span>
    </button>`;
  }

  return `<li class="doc-checklist__item${ok ? " is-ok" : " is-missing"}${isHighlight ? " is-flash" : ""}${status === "Vencido" ? " doc-row--expired" : status === "Por vencer" ? " doc-row--warn" : ""}" data-doc-type="${escapeAttr(typeValue)}">
    <span class="doc-checklist__dot" aria-hidden="true">${ok ? "✓" : ""}</span>
    <span class="doc-checklist__main">
      <span class="doc-checklist__label">${escapeHtml(meta.label)}</span>
      <span class="doc-checklist__count">${itemsLabel(empDocs.length, ok)}</span>
    </span>
    ${status && status !== "Vigente" ? `<span class="doc-checklist__status doc-checklist__status--${status === "Vencido" ? "expired" : "warn"}">${escapeHtml(status)}</span>` : ""}
    ${
      !ok && canUploadDocumentsModule() && employeeId
        ? `<button type="button" class="doc-checklist__upload btn btn-xs btn-outline" data-action="doc-goto-upload" data-employee-id="${escapeAttr(String(employeeId))}" data-document-type="${escapeAttr(typeValue)}" title="Subir ${escapeAttr(meta.label)}">Subir</button>`
        : ""
    }
  </li>`;
}

function itemsLabel(count, ok) {
  if (!ok) return "Pendiente";
  return `${count} archivo${count === 1 ? "" : "s"}`;
}

function renderUploadDocumentTypePicker(employeeId, allDocs, selectedType, todayYmd) {
  const employees = read(KEYS.payrollEmployees, []);
  const employee = employees.find((e) => String(e.id) === String(employeeId));
  const resolved = resolveUploadDocumentType(employeeId, allDocs, selectedType);
  const expected = employee
    ? expectedDocumentTypesForEmployee(employee)
    : [...CORE_EMPLOYEE_DOCUMENT_TYPES];
  const otherTypes = EMPLOYEE_DOCUMENT_TYPES.map((t) => t.value).filter(
    (v) => !expected.includes(v) && v !== "otro"
  );
  const expectedItems = expected
    .map((typeValue) =>
      renderDocumentChecklistItem(typeValue, {
        employeeId,
        allDocs,
        selectedType: resolved,
        todayYmd,
        mode: "pick"
      })
    )
    .join("");
  const otherItems = [...otherTypes, "otro"]
    .map((typeValue) =>
      renderDocumentChecklistItem(typeValue, {
        employeeId,
        allDocs,
        selectedType: resolved,
        todayYmd,
        mode: "pick"
      })
    )
    .join("");

  return `<div class="doc-type-picker doc-type-picker--form" data-doc-type-picker>
    <input type="hidden" name="documentType" value="${escapeAttr(resolved)}" data-doc-type-input required />
    ${
      employee
        ? `<div class="doc-type-picker__section">
      <p class="doc-type-picker__section-label">Checklist del colaborador</p>
      <div class="doc-type-picker__grid">${expectedItems}</div>
    </div>
    ${
      otherItems
        ? `<details class="doc-type-picker__more">
      <summary>Otros tipos documentales</summary>
      <div class="doc-type-picker__grid doc-type-picker__grid--compact">${otherItems}</div>
    </details>`
        : ""
    }`
        : `<p class="doc-type-picker__empty">Seleccione un colaborador para ver el checklist.</p>`
    }
  </div>`;
}

function renderKpiCards(summary, IC, gapsCount = 0) {
  void gapsCount;
  return `<div class="doc-kpi-block">
    <div class="doc-kpi-rail" role="group" aria-label="Indicadores documentales">
      <button type="button" class="doc-kpi doc-kpi--total" data-action="doc-quick-filter" data-filter="all" title="Ver todos los documentos">
        <span class="doc-kpi__icon" aria-hidden="true">${IC.file || ""}</span>
        <span class="doc-kpi__content">
          <span class="doc-kpi__label">Documentos</span>
          <strong class="doc-kpi__value">${escapeHtml(String(summary.total))}</strong>
        </span>
      </button>
      <button type="button" class="doc-kpi doc-kpi--employees" data-action="doc-goto-browse-toolbar" title="Consultar expedientes">
        <span class="doc-kpi__icon" aria-hidden="true">${IC.user || ""}</span>
        <span class="doc-kpi__content">
          <span class="doc-kpi__label">Expedientes</span>
          <strong class="doc-kpi__value">${escapeHtml(String(summary.employeesWithDocs))}</strong>
        </span>
      </button>
      <button type="button" class="doc-kpi doc-kpi--warn" data-action="doc-quick-filter" data-filter="due_soon" title="Por vencer">
        <span class="doc-kpi__icon" aria-hidden="true">${IC.alertTriangle || ""}</span>
        <span class="doc-kpi__content">
          <span class="doc-kpi__label">Por vencer</span>
          <strong class="doc-kpi__value">${escapeHtml(String(summary.dueSoon))}</strong>
        </span>
      </button>
      <button type="button" class="doc-kpi doc-kpi--expired" data-action="doc-quick-filter" data-filter="expired" title="Vencidos">
        <span class="doc-kpi__icon" aria-hidden="true">${IC.alertTriangle || ""}</span>
        <span class="doc-kpi__content">
          <span class="doc-kpi__label">Vencidos</span>
          <strong class="doc-kpi__value">${escapeHtml(String(summary.expired))}</strong>
        </span>
      </button>
    </div>
  </div>`;
}

function renderEmptyState(message, { icon = "", hint = "" } = {}) {
  return `<div class="empty-state doc-empty">
    ${icon ? `<div class="doc-empty__icon" aria-hidden="true">${icon}</div>` : `<div class="doc-empty__icon doc-empty__icon--mark" aria-hidden="true"></div>`}
    <p class="doc-empty__title">${escapeHtml(message)}</p>
    ${hint ? `<p class="doc-empty__hint">${escapeHtml(hint)}</p>` : ""}
  </div>`;
}

function renderDocumentCards(documents, todayYmd, IC, { compact = false, viewMode = "grid" } = {}) {
  if (!documents.length) {
    return renderEmptyState("No hay documentos en este expediente.", {
      icon: IC.file || "",
      hint: "Suba archivos o cambie los filtros de búsqueda."
    });
  }
  const isList = viewMode === "list";
  return `<div class="doc-card-grid${compact ? " doc-card-grid--compact" : ""}${isList ? " doc-card-grid--list" : ""}">
    ${documents
      .map((raw) => {
        const doc = normalizeEmployeeDocumentRow(raw);
        const rowTone = documentExpiryRowClass(doc, todayYmd);
        const mimeClass = renderMimeClass(doc.mimeType);
        return `<article class="doc-card${rowTone ? ` ${rowTone}` : ""}${isList ? " doc-card--row" : ""}" data-doc-id="${escapeAttr(String(doc.id))}">
          <div class="doc-card__icon doc-card__icon--${mimeClass}" aria-hidden="true">
            <span class="doc-card__icon-label">${escapeHtml(renderMimeIcon(doc.mimeType))}</span>
          </div>
          <div class="doc-card__body">
            <div class="doc-card__headline">
              <h4 class="doc-card__title">${escapeHtml(getEmployeeDocumentTypeLabel(doc.documentType))}</h4>
              ${doc.folder ? `<span class="doc-folder-pill">${escapeHtml(normalizeDocumentFolder(doc.folder))}</span>` : ""}
            </div>
            <p class="doc-card__file">${escapeHtml(doc.fileName)}</p>
            <div class="doc-card__meta">
              ${renderDocStatusBadge(doc, todayYmd)}
              <span class="doc-meta-chip">${escapeHtml(formatFileSize(doc.sizeBytes))}</span>
              ${doc.dueDate ? `<span class="doc-meta-chip">Vence ${escapeHtml(String(doc.dueDate))}</span>` : ""}
              ${doc.documentCode ? `<span class="doc-meta-chip">Cód. ${escapeHtml(String(doc.documentCode))}</span>` : ""}
            </div>
          </div>
          <div class="doc-card__actions">
            ${
              canPreviewDocument(doc)
                ? `<button type="button" class="doc-action-btn" data-action="doc-preview" data-id="${escapeAttr(String(doc.id))}" title="Vista previa">${IC.eye || "👁"}</button>`
                : ""
            }
            <button type="button" class="doc-action-btn" data-action="doc-download" data-id="${escapeAttr(String(doc.id))}" title="Descargar">${IC.download || "↓"}</button>
            ${
              canEditDocumentsModule() || canDeleteDocumentsModule()
                ? `${canEditDocumentsModule() ? `<button type="button" class="doc-action-btn" data-action="doc-edit" data-id="${escapeAttr(String(doc.id))}" title="Editar metadatos">${IC.edit || "✎"}</button>` : ""}
            ${canDeleteDocumentsModule() ? `<button type="button" class="doc-action-btn doc-action-btn--danger" data-action="doc-delete" data-id="${escapeAttr(String(doc.id))}" title="Eliminar">${IC.trash || "×"}</button>` : ""}`
                : ""
            }
          </div>
        </article>`;
      })
      .join("")}
  </div>`;
}

function renderDocumentsTable(documents, todayYmd, IC) {
  if (!documents.length) {
    return renderEmptyState("Sin resultados para los filtros actuales.", {
      icon: IC.search || "🔍",
      hint: "Pruebe otro término o limpie los filtros."
    });
  }
  const rows = documents
    .map((raw) => {
      const doc = normalizeEmployeeDocumentRow(raw);
      const rowTone = documentExpiryRowClass(doc, todayYmd);
      return `<tr class="${rowTone}" data-doc-id="${escapeAttr(String(doc.id))}">
        <td><strong>${escapeHtml(doc.employeeName || "-")}</strong></td>
        <td>${escapeHtml(normalizeDocumentFolder(doc.folder))}</td>
        <td>${escapeHtml(getEmployeeDocumentTypeLabel(doc.documentType))}</td>
        <td><span class="doc-file-chip">${escapeHtml(doc.fileName)}</span></td>
        <td class="muted">${doc.documentCode ? escapeHtml(String(doc.documentCode)) : "—"}</td>
        <td>${renderDocStatusBadge(doc, todayYmd)}</td>
        <td>${doc.dueDate ? escapeHtml(String(doc.dueDate)) : "—"}</td>
        <td class="muted">${escapeHtml(formatFileSize(doc.sizeBytes))}</td>
        <td class="doc-table-actions">
          <button type="button" class="btn btn-sm btn-outline" data-action="doc-download" data-id="${escapeAttr(String(doc.id))}">${IC.download || "↓"}</button>
          ${
            canEditDocumentsModule() || canDeleteDocumentsModule()
              ? `${canEditDocumentsModule() ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-edit" data-id="${escapeAttr(String(doc.id))}">${IC.edit || "✎"}</button>` : ""}
          ${canDeleteDocumentsModule() ? `<button type="button" class="btn btn-sm btn-danger-outline" data-action="doc-delete" data-id="${escapeAttr(String(doc.id))}">${IC.trash || "×"}</button>` : ""}`
              : ""
          }
        </td>
      </tr>`;
    })
    .join("");
  return `<div class="doc-table-panel">
    <div class="table-wrap doc-table-wrap"><table class="table doc-table">
    <thead><tr>
      <th>Colaborador</th><th>Carpeta</th><th>Tipo</th><th>Archivo</th><th>Código</th><th>Estado</th><th>Vencimiento</th><th>Tamaño</th><th></th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table></div></div>`;
}

function renderEmployeeDossierPanel(employee, documents, todayYmd, IC, highlightType = "", { allEmployeeDocs = null, includeFiles = true, compact = false } = {}) {
  if (!employee) {
    return `<div class="doc-dossier doc-dossier--empty">${renderEmptyState("Seleccione un colaborador", { icon: IC.user || "", hint: "Elija una persona para ver su expediente y checklist." })}</div>`;
  }
  const checklistSource = allEmployeeDocs || documents;
  const empDocs = documents;
  const allCount = checklistSource.length;
  const expected = expectedDocumentTypesForEmployee(employee);
  const completedCount = expected.filter((t) => employeeHasDocumentType(employee.id, t, checklistSource)).length;
  const completionPct = expected.length ? Math.round((completedCount / expected.length) * 100) : 100;
  const completionTone = completionPct >= 100 ? "complete" : completionPct >= 60 ? "mid" : "low";
  const extraTypes = EMPLOYEE_DOCUMENT_TYPES.map((t) => t.value).filter((v) => !expected.includes(v));
  const checklistExpected = expected
    .map((typeValue) =>
      renderDocumentChecklistItem(typeValue, {
        employeeId: employee.id,
        allDocs: checklistSource,
        todayYmd,
        highlightType,
        mode: "view"
      })
    )
    .join("");
  const checklistExtra = extraTypes
    .map((typeValue) => {
      if (!employeeHasDocumentType(employee.id, typeValue, checklistSource)) return "";
      return renderDocumentChecklistItem(typeValue, {
        employeeId: employee.id,
        allDocs: checklistSource,
        todayYmd,
        highlightType,
        mode: "view"
      });
    })
    .filter(Boolean)
    .join("");
  return `<aside class="doc-dossier${compact ? " doc-dossier--rail" : ""}">
    <header class="doc-dossier__head">
      <div class="doc-dossier__identity">
        <span class="doc-dossier__avatar" aria-hidden="true">${escapeHtml(employeeInitials(employee.name))}</span>
        <div>
          <p class="doc-dossier__eyebrow">Expediente digital</p>
          <h3 class="doc-dossier__name">${escapeHtml(String(employee.name || "-"))}</h3>
          <p class="doc-dossier__sub">${escapeHtml(String(employee.documentType || "CC"))} ${escapeHtml(String(employee.idDoc || ""))}${employee.position ? ` · ${escapeHtml(String(employee.position))}` : ""}</p>
        </div>
      </div>
      <div class="doc-dossier__gauge doc-dossier__gauge--${completionTone}" style="--doc-progress:${completionPct}" role="img" aria-label="Checklist ${completionPct}% completo, ${completedCount} de ${expected.length} documentos mínimos">
        <div class="doc-dossier__gauge-ring">
          <span class="doc-dossier__gauge-value">${completionPct}<small>%</small></span>
        </div>
        <div class="doc-dossier__gauge-meta">
          <span class="doc-dossier__gauge-label">Completitud</span>
          <strong class="doc-dossier__gauge-count">${completedCount}/${expected.length}</strong>
        </div>
      </div>
    </header>
    <div class="doc-dossier__statline">
      <span><strong>${empDocs.length}${empDocs.length !== allCount ? `/${allCount}` : ""}</strong> archivo${allCount === 1 ? "" : "s"}</span>
      <span><strong>${expected.length - completedCount}</strong> pendiente${expected.length - completedCount === 1 ? "" : "s"}</span>
    </div>
    <div class="doc-checklist-panel">
      <h4 class="doc-checklist-panel__title">Checklist mínimo</h4>
      <ul class="doc-checklist">${checklistExpected}</ul>
      ${checklistExtra ? `<h4 class="doc-checklist-panel__title doc-checklist-panel__title--extra">Otros en expediente</h4><ul class="doc-checklist doc-checklist--extra">${checklistExtra}</ul>` : ""}
    </div>
    ${
      canUploadDocumentsModule()
        ? `<div class="doc-dossier__actions">
          <button type="button" class="btn btn-sm btn-primary" data-action="doc-goto-upload" data-employee-id="${escapeAttr(String(employee.id))}">${IC.upload || "+"} Subir</button>
        </div>`
        : ""
    }
    ${
      includeFiles
        ? `<div class="doc-dossier__files">
      <h4 class="doc-dossier__files-title">Archivos del expediente</h4>
      ${renderDocumentCards(empDocs, todayYmd, IC)}
    </div>`
        : ""
    }
  </aside>`;
}

function renderUploadForm(selectedEmployeeId, selectedDocumentType, allDocs, folderRecords, IC, todayYmd) {
  const folders = collectEmployeeFolders(selectedEmployeeId, allDocs, folderRecords);
  const preferredFolder = normalizeDocumentFolder(getDocumentsUi().selectedFolder || "");
  const folderDefault =
    preferredFolder && folders.includes(preferredFolder)
      ? preferredFolder
      : folders[0] || DEFAULT_EMPLOYEE_DOCUMENT_FOLDER;
  const folderSelectOptions = folders
    .map(
      (name) =>
        `<option value="${escapeAttr(name)}"${name === folderDefault ? " selected" : ""}>${escapeHtml(name)}</option>`
    )
    .join("");
  const resolvedType = resolveUploadDocumentType(selectedEmployeeId, allDocs, selectedDocumentType);
  const canCreateFolder = canUploadDocumentsModule();
  return `<form id="form-employee-document" class="doc-upload-form" enctype="multipart/form-data">
    <div class="doc-upload-flow">
      <section class="doc-flow-section doc-flow-section--destino">
        <header class="doc-flow-section__head">
          <span class="doc-flow-section__num">01</span>
          <div>
            <h4 class="doc-flow-section__title">Destino</h4>
            <p class="doc-flow-section__hint">Colaborador y carpeta del expediente</p>
          </div>
        </header>
        <div class="doc-flow-section__body doc-flow-fields">
          <label class="field doc-field doc-field--grow">
            <span class="doc-field__label">Colaborador</span>
            <select class="doc-field__control" name="employeeId" required data-doc-employee-select>${renderEmployeeOptions(read(KEYS.payrollEmployees, []), selectedEmployeeId)}</select>
          </label>
          <div class="doc-field doc-field--folder">
            <span class="doc-field__label">Carpeta</span>
            <div class="doc-folder-control">
              <select class="doc-field__control" name="folder" required data-doc-folder-select>
                ${folderSelectOptions || `<option value="${escapeAttr(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER)}" selected>${escapeHtml(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER)}</option>`}
                ${
                  canCreateFolder
                    ? `<option value="__create_folder__">+ Crear carpeta nueva…</option>`
                    : ""
                }
              </select>
              ${
                canCreateFolder
                  ? `<button type="button" class="btn btn-sm btn-outline doc-folder-delete" data-action="doc-delete-folder" title="Eliminar carpeta seleccionada">${IC.trash || "×"}</button>`
                  : ""
              }
            </div>
          </div>
        </div>
      </section>

      <section class="doc-flow-section doc-flow-section--tipo">
        <header class="doc-flow-section__head">
          <span class="doc-flow-section__num">02</span>
          <div>
            <h4 class="doc-flow-section__title">Tipo documental</h4>
            <p class="doc-flow-section__hint">Elija el documento del checklist</p>
          </div>
        </header>
        <div class="doc-flow-section__body">
          ${renderUploadDocumentTypePicker(selectedEmployeeId, allDocs, resolvedType, todayYmd)}
        </div>
      </section>

      <section class="doc-flow-section doc-flow-section--archivo">
        <header class="doc-flow-section__head">
          <span class="doc-flow-section__num">03</span>
          <div>
            <h4 class="doc-flow-section__title">Archivo</h4>
            <p class="doc-flow-section__hint">Uno o varios · máx. 50 MB c/u</p>
          </div>
        </header>
        <div class="doc-flow-section__body">
          <div class="doc-dropzone" data-doc-dropzone>
            <input type="file" name="file" id="doc-upload-file" multiple hidden />
            <label for="doc-upload-file" class="doc-dropzone__label">
              <span class="doc-dropzone__halo" aria-hidden="true"></span>
              <span class="doc-dropzone__icon" aria-hidden="true">${IC.upload || IC.file || ""}</span>
              <strong class="doc-dropzone__title">Arrastre archivos aquí o haga clic</strong>
              <strong class="doc-dropzone__title doc-dropzone__title--filled">Archivos listos para registrar</strong>
              <span class="doc-dropzone__hint">PDF, imágenes, Word, Excel · puede seleccionar varios</span>
              <span class="doc-dropzone__filename" data-doc-file-label>Sin archivos seleccionados</span>
            </label>
          </div>
        </div>
      </section>

      <details class="doc-flow-section doc-flow-section--extra">
        <summary class="doc-flow-section__summary">
          <span class="doc-flow-section__num">+</span>
          <span>
            <strong class="doc-flow-section__title">Detalles opcionales</strong>
            <span class="doc-flow-section__hint">Código, fechas y notas</span>
          </span>
        </summary>
        <div class="doc-flow-section__body doc-flow-fields doc-flow-fields--3">
          <label class="field doc-field">
            <span class="doc-field__label">Código</span>
            <input class="doc-field__control" name="documentCode" type="text" maxlength="64" placeholder="Opcional" />
          </label>
          <label class="field doc-field">
            <span class="doc-field__label">Emisión</span>
            <input class="doc-field__control" name="issueDate" type="date" />
          </label>
          <label class="field doc-field" data-doc-due-wrap>
            <span class="doc-field__label">Vencimiento</span>
            <input class="doc-field__control" name="dueDate" type="date" />
          </label>
          <label class="field doc-field doc-field--full">
            <span class="doc-field__label">Observaciones</span>
            <textarea class="doc-field__control" name="notes" rows="2" maxlength="2000" placeholder="Notas internas RRHH"></textarea>
          </label>
        </div>
      </details>
    </div>

    <div class="doc-upload-form__actions">
      <p class="doc-upload-form__note">Los archivos se guardan de forma segura en el expediente digital.</p>
      <button type="submit" class="btn btn-primary doc-upload-submit" data-doc-submit>${IC.upload || ""} Registrar</button>
    </div>
  </form>`;
}

function renderFolderBreadcrumb(ui, employees) {
  if (!ui.folderBrowseEmployeeId) {
    return `<nav class="doc-folder-breadcrumb" aria-label="Ruta del expediente">
      <span class="doc-folder-crumb doc-folder-crumb--current">Expedientes</span>
    </nav>`;
  }
  const emp = employees.find((e) => String(e.id) === ui.folderBrowseEmployeeId);
  return `<nav class="doc-folder-breadcrumb" aria-label="Ruta del expediente">
    <button type="button" class="doc-folder-crumb" data-action="doc-browse-root">Expedientes</button>
    <span class="doc-folder-crumb-sep" aria-hidden="true">/</span>
    <span class="doc-folder-crumb doc-folder-crumb--current">${escapeHtml(String(emp?.name || "Colaborador"))}</span>
  </nav>`;
}

function employeeMatchesConsultFilters(emp, allDocs, ui, todayYmd) {
  if (ui.filterEmployeeId && String(emp.id) !== String(ui.filterEmployeeId)) return false;
  const searchNorm = String(ui.listSearch || "")
    .trim()
    .toLowerCase();
  if (searchNorm) {
    const blob = `${emp.name || ""} ${emp.idDoc || ""} ${emp.position || ""}`.toLowerCase();
    if (!blob.includes(searchNorm)) return false;
  }
  if (ui.dataSection === "gaps") {
    return findEmployeeDocumentGaps(emp, allDocs).length > 0;
  }
  const empDocs = filterDocuments(
    allDocs,
    buildDocumentListFilters(ui, { employeeId: String(emp.id), dataSection: "all" }),
    todayYmd
  );
  if (ui.dataSection === "due_soon" || ui.dataSection === "expired") {
    const scoped = filterDocuments(
      allDocs,
      buildDocumentListFilters(ui, { employeeId: String(emp.id), dataSection: ui.dataSection }),
      todayYmd
    );
    return scoped.length > 0;
  }
  if (ui.typeFilter || ui.filterStatus || ui.folderFilter) {
    return empDocs.length > 0;
  }
  return true;
}

function renderFolderExplorer(employees, allDocs, folderRecords, ui, todayYmd, IC, { embedded = false, gapsCount = 0 } = {}) {
  void folderRecords;
  const browseEmpId = ui.folderBrowseEmployeeId || "";
  const viewMode = ui.listViewMode === "grid" ? "grid" : "list";

  const sortedEmployees = [...employees].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "es")
  );

  const viewToggle = browseEmpId
    ? `<div class="doc-view-toggle" role="group" aria-label="Vista de documentos">
        <button type="button" class="doc-view-toggle__btn${viewMode === "list" ? " is-active" : ""}" data-action="doc-list-view" data-view="list" title="Vista en lista">Lista</button>
        <button type="button" class="doc-view-toggle__btn${viewMode === "grid" ? " is-active" : ""}" data-action="doc-list-view" data-view="grid" title="Vista en cuadrícula">Cuadrícula</button>
      </div>`
    : "";

  const toolbar = `<div class="doc-folder-toolbar doc-folder-toolbar--panel">
    ${renderFolderBreadcrumb(ui, employees)}
    <div class="doc-folder-toolbar__actions">
      ${viewToggle}
      ${
        canViewDocumentsModule()
          ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-export-csv" title="Exportar CSV">${IC.download || ""} CSV</button>`
          : ""
      }
      ${
        browseEmpId && canUploadDocumentsModule()
          ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-new-folder" data-employee-id="${escapeAttr(browseEmpId)}">${IC.folder || ""} Carpeta</button>
             <button type="button" class="btn btn-sm btn-primary" data-action="doc-goto-upload" data-employee-id="${escapeAttr(browseEmpId)}">${IC.upload || "+"} Subir</button>`
          : ""
      }
    </div>
  </div>`;

  const wrapExplorer = (body, resultHint = "") =>
    `<div class="doc-explorer-panel${embedded ? " doc-explorer-panel--embedded" : ""}">
      <div class="doc-explorer-top">
        ${renderDocumentsFilterBar({ ui, employees, mode: "browse", gapsCount })}
        <div class="doc-explorer-top__meta">${resultHint}${toolbar}</div>
      </div>
      <div class="doc-explorer-body">${body}</div>
    </div>`;

  if (!browseEmpId) {
    const visible = sortedEmployees.filter((emp) => employeeMatchesConsultFilters(emp, allDocs, ui, todayYmd));
    const resultHint = renderResultMeta(
      `<strong>${visible.length}</strong> expediente${visible.length === 1 ? "" : "s"}`
    );
    const tiles = visible
      .map((emp) => {
        const empDocs = allDocs.filter(
          (d) => String(normalizeEmployeeDocumentRow(d).employeeId) === String(emp.id)
        );
        const docCount = empDocs.length;
        const missing = findEmployeeDocumentGaps(emp, allDocs).length;
        const expected = expectedDocumentTypesForEmployee(emp);
        const completedCount = expected.filter((t) => employeeHasDocumentType(emp.id, t, allDocs)).length;
        const completionPct = expected.length ? Math.round((completedCount / expected.length) * 100) : 100;
        const tone = missing ? "gap" : completionPct >= 100 ? "ok" : "mid";
        const expiredCount = empDocs.filter(
          (d) => computeEmployeeDocumentStatus(normalizeEmployeeDocumentRow(d).dueDate, todayYmd) === "Vencido"
        ).length;
        return `<button type="button" class="doc-folder-tile doc-folder-tile--employee doc-folder-tile--row doc-folder-tile--${tone}" data-action="doc-browse-employee" data-employee-id="${escapeAttr(String(emp.id))}">
          <span class="doc-folder-tile__avatar" aria-hidden="true">${escapeHtml(employeeInitials(emp.name))}</span>
          <span class="doc-folder-tile__main">
            <strong class="doc-folder-tile__title">${escapeHtml(String(emp.name || "-"))}</strong>
            <span class="doc-folder-tile__sub">${escapeHtml(String(emp.documentType || "CC"))} ${escapeHtml(String(emp.idDoc || ""))}${emp.position ? ` · ${escapeHtml(String(emp.position))}` : ""}</span>
          </span>
          <span class="doc-folder-tile__stats">
            <span class="doc-folder-tile__stat"><strong>${docCount}</strong> docs</span>
            <span class="doc-folder-tile__stat"><strong>${completionPct}%</strong></span>
            ${missing ? `<span class="doc-folder-tile__badge doc-folder-tile__badge--gap">${missing} pend.</span>` : `<span class="doc-folder-tile__badge doc-folder-tile__badge--ok">OK</span>`}
            ${expiredCount ? `<span class="doc-folder-tile__badge doc-folder-tile__badge--expired">${expiredCount}</span>` : ""}
          </span>
          <span class="doc-folder-tile__chevron" aria-hidden="true">→</span>
        </button>`;
      })
      .join("");
    return wrapExplorer(
      `<div class="doc-folder-list">${tiles || renderEmptyState("No hay colaboradores que coincidan.", { icon: IC.search || "", hint: "Ajuste la búsqueda o limpie los filtros." })}</div>`,
      resultHint
    );
  }

  const employee = employees.find((e) => String(e.id) === browseEmpId);
  if (!employee) {
    return wrapExplorer(renderEmptyState("Colaborador no encontrado.", { icon: IC.alertTriangle || "" }));
  }

  const allEmployeeDocs = allDocs.filter(
    (d) => String(normalizeEmployeeDocumentRow(d).employeeId) === browseEmpId
  );
  const employeeDocs = filterDocuments(
    allDocs,
    buildDocumentListFilters(ui, {
      employeeId: browseEmpId,
      dataSection: ui.dataSection === "gaps" ? "all" : ui.dataSection
    }),
    todayYmd
  );
  const resultHint = renderResultMeta(
    `<strong>${employeeDocs.length}</strong> archivo${employeeDocs.length === 1 ? "" : "s"}`
  );

  const dossier = renderEmployeeDossierPanel(employee, employeeDocs, todayYmd, IC, ui.highlightDocumentType, {
    allEmployeeDocs,
    includeFiles: false,
    compact: true
  });
  const filesPane = `<div class="doc-files-pane">
    <header class="doc-files-pane__head">
      <h4 class="doc-files-pane__title">Archivos</h4>
    </header>
    ${renderDocumentCards(employeeDocs, todayYmd, IC, { viewMode })}
  </div>`;

  return wrapExplorer(`<div class="doc-consult-split">${dossier}${filesPane}</div>`, resultHint);
}

function documentManagementHtml() {
  const IC = G.IC || {};
  const employees = read(KEYS.payrollEmployees, []);
  const allDocs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  const folderRecords = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
  const todayYmd = colombiaTodayIsoDate();
  const ui = getDocumentsUi();
  const ws = ui.workspace === "upload" ? "upload" : "consult";
  const summary = summarizeEmployeeDocuments(allDocs, todayYmd);
  const gapsCount = countEmployeesWithDocumentGaps(employees, allDocs);

  const moduleHead = renderHrFormHero({
    eyebrow: "Recursos humanos",
    title: "Gestión documental",
    description: "Expediente digital por colaborador.",
    badges: [
      renderHrFormHeroBadge(String(summary.total), "documentos"),
      summary.expired > 0 ? renderHrFormHeroBadge(String(summary.expired), "vencidos") : "",
      renderHrFormHeroBadge(String(summary.employeesWithDocs), "expedientes")
    ].filter(Boolean)
  });

  const documentTabs = [
    canUploadDocumentsModule()
      ? { id: "upload", label: "Subir documento", icon: "upload", hint: "Registrar archivos" }
      : null,
    canViewDocumentsModule()
      ? { id: "consult", label: "Consultar", icon: "folder", hint: "Expedientes por colaborador" }
      : null
  ].filter(Boolean);

  const tabsNav = renderHrWorkspaceTabs({
    module: "documents",
    ariaLabel: "Secciones del módulo Gestión documental",
    activeId: documentTabs.some((t) => t.id === ws) ? ws : documentTabs[0]?.id || "consult",
    variant: "switch",
    tabs: documentTabs
  });
  const header = renderHrWorkspaceHeader(moduleHead, tabsNav, "payroll");

  const uploadPanel = `<div class="hr-workspace-panel payroll-workspace-panel doc-workspace-panel${ws === "upload" ? "" : " hidden"}" role="tabpanel" data-doc-panel="upload">
    <div class="doc-stage doc-stage--upload">
      ${canUploadDocumentsModule() ? renderUploadForm(ui.selectedEmployeeId, ui.selectedDocumentType, allDocs, folderRecords, IC, todayYmd) : `<p class="doc-stage__denied">No tiene permiso para registrar documentos.</p>`}
    </div>
  </div>`;

  const consultPanel = `<div class="hr-workspace-panel payroll-workspace-panel doc-workspace-panel${ws === "consult" ? "" : " hidden"}" role="tabpanel" data-doc-panel="consult">
    <div class="doc-stage doc-stage--consult">
      ${canViewDocumentsModule() ? renderFolderExplorer(employees, allDocs, folderRecords, ui, todayYmd, IC, { embedded: true, gapsCount }) : `<p class="doc-stage__denied">No tiene permiso para consultar documentos.</p>`}
    </div>
  </div>`;

  const kpiBlock = renderKpiCards(summary, IC, gapsCount);
  const studioClass = `documents-studio payroll-studio payroll-shell payroll-shell--workspace hr-flow-shell`;
  return `<section class="${studioClass}" data-hr-workspace="${escapeAttr(ws)}">${header}${kpiBlock}<div class="hr-workspace-panels doc-workspace-panels">${uploadPanel}${consultPanel}</div></section>`;
}

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

function canPreviewDocument(doc) {
  const mime = String(doc?.mimeType || "").toLowerCase();
  const name = String(doc?.fileName || "").toLowerCase();
  if (mime.startsWith("image/") || mime.includes("pdf")) return true;
  if (/\.(pdf|png|jpe?g|gif|webp|bmp|svg)$/i.test(name)) return true;
  return false;
}

function applyPendingUploadFileToDom(root = nodes.viewRoot) {
  if (!root) return;
  const fileInput = root.querySelector("#doc-upload-file");
  const fileLabel = root.querySelector("[data-doc-file-label]");
  const dropzone = root.querySelector("[data-doc-dropzone]");
  if (!fileInput) return;
  const files = pendingUploadFiles.filter((f) => f instanceof File);
  if (files.length) {
    try {
      const dt = new DataTransfer();
      for (const f of files) dt.items.add(f);
      fileInput.files = dt.files;
    } catch (_err) {
      /* submit usará pendingUploadFiles */
    }
    if (fileLabel) {
      if (files.length === 1) {
        fileLabel.textContent = `${files[0].name} (${formatFileSize(files[0].size)})`;
      } else {
        const total = files.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
        fileLabel.textContent = `${files.length} archivos · ${formatFileSize(total)}`;
      }
    }
    dropzone?.classList.add("is-filled");
  } else {
    if (fileLabel) fileLabel.textContent = "Sin archivos seleccionados";
    dropzone?.classList.remove("is-filled");
  }
}

function setPendingUploadFiles(fileList) {
  const list = Array.from(fileList || []).filter((f) => f instanceof File);
  pendingUploadFiles = list;
  applyPendingUploadFileToDom();
}

function clearPendingUploadFile() {
  pendingUploadFiles = [];
  applyPendingUploadFileToDom();
}

function getSelectedUploadFiles(fileInput) {
  const fromInput = fileInput?.files?.length ? Array.from(fileInput.files) : [];
  if (fromInput.length) return fromInput;
  return pendingUploadFiles.filter((f) => f instanceof File);
}

/** Un resumen diario a RRHH (sin saturar la bandeja). */
let __docExpiryDigestWallMs = 0;
async function maybeDispatchDocumentExpiryDigest() {
  if (!canViewDocumentsModule()) return;
  const now = Date.now();
  if (now - __docExpiryDigestWallMs < 45000) return;
  const todayYmd = colombiaTodayIsoDate();
  const storageKey = "antares_doc_expiry_digest_v1";
  try {
    if (localStorage.getItem(storageKey) === todayYmd) return;
  } catch (_e) {
    /* noop */
  }
  __docExpiryDigestWallMs = now;
  const allDocs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  const summary = summarizeEmployeeDocuments(allDocs, todayYmd);
  if (!summary.expired && !summary.dueSoon) {
    try {
      localStorage.setItem(storageKey, todayYmd);
    } catch (_e2) {
      /* noop */
    }
    return;
  }
  const dispatch = G.dispatchPortalNotification;
  if (typeof dispatch !== "function") return;
  const parts = [];
  if (summary.expired) {
    parts.push(`${summary.expired} vencido${summary.expired === 1 ? "" : "s"}`);
  }
  if (summary.dueSoon) {
    parts.push(`${summary.dueSoon} por vencer`);
  }
  const ok = await dispatch({
    audience: "hr",
    title: "Documentos por revisar",
    body: `${parts.join(" · ")}. Abra Gestión documental.`,
    category: "hr",
    deepLink: "#portal/document-management",
    entityType: "employee",
    entityId: `doc_expiry_${todayYmd}`
  });
  if (ok) {
    try {
      localStorage.setItem(storageKey, todayYmd);
    } catch (_e3) {
      /* noop */
    }
  }
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

function closeDocumentPreview() {
  document.getElementById("doc-preview-overlay")?.remove();
}

function openDocumentPreview(doc, url) {
  closeDocumentPreview();
  const mime = String(doc.mimeType || "").toLowerCase();
  const isImage =
    mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(doc.fileName || ""));
  const IC = G.IC || {};
  const body = isImage
    ? `<img class="doc-preview__media" src="${escapeAttr(url)}" alt="${escapeAttr(doc.fileName || "Documento")}" />`
    : `<iframe class="doc-preview__frame" src="${escapeAttr(url)}" title="${escapeAttr(doc.fileName || "Documento")}"></iframe>`;
  const overlay = document.createElement("div");
  overlay.id = "doc-preview-overlay";
  overlay.className = "doc-preview-overlay";
  overlay.innerHTML = `<div class="doc-preview" role="dialog" aria-modal="true" aria-label="Vista previa del documento">
    <header class="doc-preview__head">
      <div class="doc-preview__titles">
        <p class="doc-preview__eyebrow">Vista previa</p>
        <h3 class="doc-preview__title">${escapeHtml(getEmployeeDocumentTypeLabel(doc.documentType))}</h3>
        <p class="doc-preview__file">${escapeHtml(doc.fileName || "")}</p>
      </div>
      <div class="doc-preview__actions">
        <a class="btn btn-sm btn-outline" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${IC.download || ""} Abrir</a>
        <button type="button" class="btn btn-sm btn-outline doc-preview__close" data-doc-preview-close title="Cerrar">${IC.x || "×"}</button>
      </div>
    </header>
    <div class="doc-preview__body">${body}</div>
  </div>`;
  const onKey = (ev) => {
    if (ev.key === "Escape") {
      document.removeEventListener("keydown", onKey);
      closeDocumentPreview();
    }
  };
  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay || ev.target.closest("[data-doc-preview-close]")) {
      document.removeEventListener("keydown", onKey);
      closeDocumentPreview();
    }
  });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
}

async function downloadDocumentRecord(doc) {
  try {
    const url = await resolveDocumentDownloadUrl(doc);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (err) {
    G.notify?.(String(err?.message || "No se pudo descargar."), "error");
  }
}

function openDeleteFolderFlow(employeeId, folderName) {
  if (!canUploadDocumentsModule()) return;
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
        const toMove = list.filter(
          (d) => String(d.employeeId) === id && documentFolderKey(d.folder) === folderKey
        );
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
        G.logPortalAuditEvent?.("documents", "delete", {
          entityId: `${id}:${folderKey}`,
          entityLabel: `Carpeta · ${folder}`,
          summary: `Eliminada${docCount ? ` · ${docCount} docs → General` : ""}${reason ? ` · Motivo: ${reason}` : ""}`
        });
        patchDocumentsUi({
          selectedFolder: DEFAULT_EMPLOYEE_DOCUMENT_FOLDER,
          selectedEmployeeId: id
        });
        G.notify?.("Carpeta eliminada.", "success");
        G.renderPortalView?.();
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo eliminar la carpeta."), "error");
      }
    }
  });
}

function openCreateFolderModal(defaultEmployeeId = "", opts = {}) {
  if (!canUploadDocumentsModule()) return;
  const stayOnUpload = Boolean(opts.stayOnUpload);
  const employees = read(KEYS.payrollEmployees, []);
  const empOpts = employees
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
      const existsInDocs = docs.some(
        (d) => String(d.employeeId) === employeeId && documentFolderKey(d.folder) === documentFolderKey(folderName)
      );
      const existsInFolders = list.some(
        (f) => String(f.employeeId) === employeeId && documentFolderKey(f.folderName) === documentFolderKey(folderName)
      );
      if (existsInDocs || existsInFolders) {
        G.notify?.("Esa carpeta ya existe para el colaborador.", "error");
        return false;
      }
      const record = normalizeEmployeeDocumentFolderRow({
        id: newUuidV4(),
        employeeId,
        employeeName: employee?.name || "Colaborador",
        folderName,
        createdBy: G.currentUser?.()?.fullName || G.currentUser?.()?.email || "Portal",
        createdAt: new Date().toISOString()
      });
      try {
        await writeAwaitServerCreate(KEYS.employeeDocumentFolders, [...list, record], record);
        G.logPortalAuditEvent?.("documents", "create", {
          entityId: record.id,
          entityLabel: `${record.employeeName} · ${record.folderName}`,
          summary: "Carpeta documental"
        });
        G.notify?.("Carpeta creada.", "success");
        if (stayOnUpload) {
          patchDocumentsUi({
            workspace: "upload",
            selectedEmployeeId: employeeId,
            selectedFolder: folderName
          });
          persistHrWorkspace("documents", "upload");
        } else {
          patchDocumentsUi({
            workspace: "consult",
            folderBrowseEmployeeId: employeeId,
            folderBrowseName: "",
            selectedFolder: folderName
          });
          persistHrWorkspace("documents", "consult");
        }
        G.renderPortalView?.();
        return true;
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo crear la carpeta."), "error");
        return false;
      }
    }
  });
}

function openEditDocumentModal(target) {
  if (!canEditDocumentsModule() || !target?.id) return;
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
        hint: `El archivo en Cloudflare R2 no se modifica aquí (${target.fileName || "—"}). Para reemplazarlo, suba un nuevo documento del mismo tipo.`
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
        G.logPortalAuditEvent?.("documents", "update", {
          entityId: target.id,
          entityLabel: `${target.employeeName} · ${getEmployeeDocumentTypeLabel(docType)}`,
          summary: target.fileName
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

function bindDocumentManagementPortalControls() {
  if (String(state.currentView || "") !== "document-management" || !nodes.viewRoot) return;
  const IC = G.IC || {};
  const todayYmd = colombiaTodayIsoDate();
  void maybeDispatchDocumentExpiryDigest();

  nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='documents']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.tab || "");
      if (!tab) return;
      const ws = normalizeHrWorkspace("documents", tab);
      if (!HR_VALID_DOCUMENTS_WS.has(ws)) return;
      if (normalizeHrWorkspace("documents", state.documentsUi?.workspace) === ws) return;
      patchDocumentsUi({ workspace: ws });
      persistHrWorkspace("documents", ws);
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-data-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section || "all";
      patchDocumentsUi({
        dataSection: section,
        workspace: "consult",
        folderBrowseEmployeeId: "",
        folderBrowseName: "",
        filterStatus: section === "all" || section === "gaps" ? "" : getDocumentsUi().filterStatus
      });
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  const debouncedFilterRender =
    G.debounce?.(() => G.renderPortalView?.(), 220) || (() => G.renderPortalView?.());

  nodes.viewRoot.querySelectorAll("[data-action='doc-filter-search']").forEach((input) => {
    input.addEventListener("input", (ev) => {
      const el = /** @type {HTMLInputElement} */ (ev.target);
      const len = String(el.value || "").length;
      const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
      const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
      const mode = String(el.dataset.docFilterMode || el.closest("[data-doc-filter-mode]")?.dataset?.docFilterMode || "");
      patchDocumentsUi({ listSearch: el.value || "" });
      state.__documentsFilterSearchRestore = { start, end, mode };
      debouncedFilterRender();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-filter-employee']").forEach((sel) => {
    sel.addEventListener("change", () => {
      patchDocumentsUi({ filterEmployeeId: sel.value || "" });
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-filter-status']").forEach((sel) => {
    sel.addEventListener("change", () => {
      const value = String(sel.value || "");
      if (value === "__gaps__") {
        patchDocumentsUi({
          filterStatus: "",
          dataSection: "gaps",
          workspace: "consult",
          folderBrowseEmployeeId: "",
          folderBrowseName: ""
        });
      } else if (value === "Por vencer") {
        patchDocumentsUi({
          filterStatus: "",
          dataSection: "due_soon",
          workspace: "consult"
        });
      } else if (value === "Vencido") {
        patchDocumentsUi({
          filterStatus: "",
          dataSection: "expired",
          workspace: "consult"
        });
      } else {
        patchDocumentsUi({
          filterStatus: value,
          dataSection: "all",
          workspace: "consult"
        });
      }
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-filter-folder']").forEach((sel) => {
    sel.addEventListener("change", () => {
      patchDocumentsUi({ folderFilter: sel.value || "", workspace: "consult", dataSection: "all" });
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-clear-filters']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        listSearch: "",
        typeFilter: "",
        filterEmployeeId: "",
        filterStatus: "",
        folderFilter: "",
        dataSection: "all"
      });
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-goto-browse-toolbar']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const employeeId = String(btn.dataset.employeeId || getDocumentsUi().filterEmployeeId || "");
      patchDocumentsUi({
        workspace: "consult",
        folderBrowseEmployeeId: employeeId,
        folderBrowseName: ""
      });
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-quick-filter']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = String(btn.dataset.filter || "all");
      if (filter === "gaps") {
        patchDocumentsUi({
          workspace: "consult",
          dataSection: "gaps",
          filterStatus: "",
          folderBrowseEmployeeId: "",
          folderBrowseName: ""
        });
      } else if (filter === "due_soon" || filter === "expired") {
        patchDocumentsUi({
          workspace: "consult",
          dataSection: filter,
          filterStatus: "",
          listSearch: "",
          typeFilter: "",
          filterEmployeeId: "",
          folderFilter: "",
          folderBrowseEmployeeId: "",
          folderBrowseName: ""
        });
      } else if (filter === "all") {
        patchDocumentsUi({
          workspace: "consult",
          dataSection: "all",
          filterStatus: "",
          listSearch: "",
          typeFilter: "",
          filterEmployeeId: "",
          folderFilter: "",
          folderBrowseEmployeeId: "",
          folderBrowseName: ""
        });
      } else {
        patchDocumentsUi({ workspace: "consult" });
      }
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-browse-root']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        workspace: "consult",
        folderBrowseEmployeeId: "",
        folderBrowseName: ""
      });
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-browse-employee-root']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        workspace: "consult",
        folderBrowseEmployeeId: String(btn.dataset.employeeId || ""),
        folderBrowseName: ""
      });
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-browse-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        workspace: "consult",
        folderBrowseEmployeeId: String(btn.dataset.employeeId || ""),
        folderBrowseName: ""
      });
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-browse-folder']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        workspace: "consult",
        folderBrowseName: String(btn.dataset.folder || "")
      });
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-goto-browse']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        workspace: "consult",
        folderBrowseEmployeeId: String(btn.dataset.employeeId || ""),
        folderBrowseName: ""
      });
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-new-folder']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openCreateFolderModal(String(btn.dataset.employeeId || getDocumentsUi().folderBrowseEmployeeId || ""), {
        stayOnUpload: false
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-delete-folder']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const empId =
        String(nodes.viewRoot.querySelector("[data-doc-employee-select]")?.value || "").trim() ||
        getDocumentsUi().selectedEmployeeId ||
        String(btn.dataset.employeeId || "");
      const folderSel = nodes.viewRoot.querySelector("[data-doc-folder-select]");
      const folderName = String(folderSel?.value || btn.dataset.folder || "").trim();
      if (!empId) {
        G.notify?.("Seleccione primero un colaborador.", "error");
        return;
      }
      if (!folderName || folderName === "__create_folder__") {
        G.notify?.("Seleccione la carpeta que desea eliminar.", "error");
        return;
      }
      openDeleteFolderFlow(empId, folderName);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-list-view']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = String(btn.dataset.view || "grid") === "list" ? "list" : "grid";
      patchDocumentsUi({ listViewMode: view, workspace: "consult" });
      G.renderPortalView?.();
    });
  });

  const typeFilterSel = nodes.viewRoot.querySelectorAll("[data-action='doc-type-filter']");
  typeFilterSel.forEach((sel) => {
    sel.addEventListener("change", () => {
      patchDocumentsUi({
        typeFilter: sel.value || "",
        workspace: "consult"
      });
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-goto-upload']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const employeeId = String(btn.dataset.employeeId || "");
      const documentType = String(btn.dataset.documentType || "").trim();
      const employees = read(KEYS.payrollEmployees, []);
      const employee = employees.find((e) => String(e.id) === employeeId);
      const gaps = employee ? findEmployeeDocumentGaps(employee, read(KEYS.employeeDocuments, [])) : [];
      patchDocumentsUi({
        workspace: "upload",
        selectedEmployeeId: employeeId,
        selectedDocumentType: documentType || gaps[0] || ""
      });
      persistHrWorkspace("documents", "upload");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-pick-type']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const documentType = String(btn.dataset.documentType || "").trim();
      if (!documentType) return;
      const hidden = nodes.viewRoot.querySelector("[data-doc-type-input]");
      if (hidden) hidden.value = documentType;
      patchDocumentsUi({ selectedDocumentType: documentType });
      nodes.viewRoot.querySelectorAll("[data-action='doc-pick-type']").forEach((el) => {
        const active = String(el.dataset.documentType) === documentType;
        el.classList.toggle("is-selected", active);
        el.setAttribute("aria-pressed", active ? "true" : "false");
      });
      syncUploadDueRequired(documentType);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-goto-dossier']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        workspace: "consult",
        folderBrowseEmployeeId: String(btn.dataset.employeeId || ""),
        folderBrowseName: "",
        selectedEmployeeId: String(btn.dataset.employeeId || "")
      });
      persistHrWorkspace("documents", "consult");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-select-employee'], [data-doc-employee-select]").forEach((sel) => {
    sel.addEventListener("change", async () => {
      const employeeId = sel.value || "";
      const employees = read(KEYS.payrollEmployees, []);
      const employee = employees.find((e) => String(e.id) === String(employeeId));
      const gaps = employee ? findEmployeeDocumentGaps(employee, read(KEYS.employeeDocuments, [])) : [];
      if (employeeId) {
        try {
          await ensureEmployeeFolderRecord(employeeId, DEFAULT_EMPLOYEE_DOCUMENT_FOLDER);
        } catch (_err) {
          /* non-blocking */
        }
      }
      patchDocumentsUi({
        selectedEmployeeId: employeeId,
        selectedDocumentType: gaps[0] || "",
        selectedFolder: ""
      });
      G.renderPortalView?.();
    });
  });

  function syncUploadDueRequired(docType) {
    const dueWrap = nodes.viewRoot.querySelector("[data-doc-due-wrap]");
    if (!dueWrap) return;
    const req = employeeDocumentTypeRequiresExpiry(docType);
    dueWrap.classList.toggle("is-required", req);
    const dueInput = dueWrap.querySelector('input[name="dueDate"]');
    if (dueInput) dueInput.required = req;
    const extra = dueWrap.closest("details.doc-flow-section--extra");
    if (extra && req) extra.open = true;
  }

  syncUploadDueRequired(resolveUploadDocumentType(
    getDocumentsUi().selectedEmployeeId,
    read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow),
    getDocumentsUi().selectedDocumentType
  ));

  const syncUploadFolderSelect = () => {
    const empSel = nodes.viewRoot.querySelector("[data-doc-employee-select]");
    const folderSel = nodes.viewRoot.querySelector("[data-doc-folder-select]");
    if (!empSel || !folderSel) return;
    const employeeId = String(empSel.value || "");
    const folders = collectEmployeeFolders(
      employeeId,
      read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow),
      read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow)
    );
    const preferred = normalizeDocumentFolder(getDocumentsUi().selectedFolder || "");
    const current = normalizeDocumentFolder(folderSel.value);
    const selected =
      preferred && folders.includes(preferred)
        ? preferred
        : folders.includes(current)
          ? current
          : folders[0] || DEFAULT_EMPLOYEE_DOCUMENT_FOLDER;
    const createOpt = canUploadDocumentsModule()
      ? `<option value="__create_folder__">+ Crear carpeta nueva…</option>`
      : "";
    folderSel.innerHTML =
      (folders.length
        ? folders
            .map(
              (name) =>
                `<option value="${escapeAttr(name)}"${name === selected ? " selected" : ""}>${escapeHtml(name)}</option>`
            )
            .join("")
        : `<option value="${escapeAttr(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER)}" selected>${escapeHtml(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER)}</option>`) +
      createOpt;
  };
  syncUploadFolderSelect();

  nodes.viewRoot.querySelectorAll("[data-doc-folder-select]").forEach((sel) => {
    sel.addEventListener("change", () => {
      if (sel.value !== "__create_folder__") {
        patchDocumentsUi({ selectedFolder: normalizeDocumentFolder(sel.value) });
        return;
      }
      const empId =
        String(nodes.viewRoot.querySelector("[data-doc-employee-select]")?.value || "").trim() ||
        getDocumentsUi().selectedEmployeeId;
      const previous =
        normalizeDocumentFolder(getDocumentsUi().selectedFolder) ||
        DEFAULT_EMPLOYEE_DOCUMENT_FOLDER;
      sel.value = previous;
      if (!empId) {
        G.notify?.("Seleccione primero un colaborador.", "error");
        return;
      }
      openCreateFolderModal(empId, { stayOnUpload: true });
    });
  });

  const fileInput = nodes.viewRoot.querySelector("#doc-upload-file");
  const fileLabel = nodes.viewRoot.querySelector("[data-doc-file-label]");
  const dropzone = nodes.viewRoot.querySelector("[data-doc-dropzone]");
  applyPendingUploadFileToDom(nodes.viewRoot);
  if (fileInput && fileLabel) {
    fileInput.addEventListener("change", () => {
      setPendingUploadFiles(fileInput.files);
    });
  }
  if (dropzone && fileInput) {
    dropzone.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      dropzone.classList.add("is-dragover");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragover"));
    dropzone.addEventListener("drop", (ev) => {
      ev.preventDefault();
      dropzone.classList.remove("is-dragover");
      if (ev.dataTransfer?.files?.length) setPendingUploadFiles(ev.dataTransfer.files);
    });
  }

  const uploadForm = nodes.viewRoot.querySelector("#form-employee-document");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (!canUploadDocumentsModule()) {
        G.notify?.("No autorizado para subir documentos.", "error");
        return;
      }
      const fd = new FormData(uploadForm);
      const employeeId = String(fd.get("employeeId") || "").trim();
      const documentType = String(
        fd.get("documentType") || nodes.viewRoot.querySelector("[data-doc-type-input]")?.value || "otro"
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
      const submitBtn = uploadForm.querySelector("[data-doc-submit]");
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
        const uploadedBy = G.currentUser?.()?.fullName || G.currentUser?.()?.email || "Portal";
        let list = read(KEYS.employeeDocuments, []);
        let okCount = 0;
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          if (submitBtn) {
            submitBtn.textContent =
              files.length > 1 ? `Subiendo ${i + 1}/${files.length}…` : "Subiendo…";
          }
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
          G.logPortalAuditEvent?.("documents", "create", {
            entityId: record.id,
            entityLabel: `${record.employeeName} · ${getEmployeeDocumentTypeLabel(record.documentType)}`,
            summary: record.fileName
          });
          okCount += 1;
        }
        clearPendingUploadFile();
        patchDocumentsUi({
          selectedEmployeeId: employeeId,
          selectedDocumentType: "",
          workspace: "consult",
          highlightDocumentType: documentType,
          folderBrowseEmployeeId: employeeId,
          folderBrowseName: "",
          dataSection: "all"
        });
        persistHrWorkspace("documents", "consult");
        G.notify?.(
          okCount === 1
            ? `${getEmployeeDocumentTypeLabel(documentType)} registrado.`
            : `${okCount} documentos registrados.`,
          "success"
        );
        G.renderPortalView?.();
        switchHrWorkspacePanels({
          root: nodes.viewRoot,
          moduleId: "documents",
          workspace: "consult",
          panelAttr: "data-doc-panel",
          shellSelector: ".documents-studio"
        });
        setTimeout(() => {
          patchDocumentsUi({ highlightDocumentType: "" });
        }, 2800);
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

  nodes.viewRoot.querySelectorAll("[data-action='doc-download']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = String(btn.dataset.id || "");
      const doc = read(KEYS.employeeDocuments, []).find((d) => String(d.id) === id);
      if (!doc?.storageKey) {
        G.notify?.("Documento no encontrado.", "error");
        return;
      }
      try {
        await downloadDocumentRecord(normalizeEmployeeDocumentRow(doc));
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo descargar."), "error");
      }
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-preview']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = String(btn.dataset.id || "");
      const doc = normalizeEmployeeDocumentRow(
        read(KEYS.employeeDocuments, []).find((d) => String(d.id) === id)
      );
      if (!doc?.storageKey) {
        G.notify?.("Documento no encontrado.", "error");
        return;
      }
      if (!canPreviewDocument(doc)) {
        G.notify?.("Este formato no tiene vista previa. Descárguelo para abrirlo.", "info");
        return;
      }
      btn.disabled = true;
      try {
        const url = await resolveDocumentDownloadUrl(doc);
        openDocumentPreview(doc, url);
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo abrir la vista previa."), "error");
      } finally {
        btn.disabled = false;
      }
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-edit']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      const doc = normalizeEmployeeDocumentRow(
        read(KEYS.employeeDocuments, []).find((d) => String(d.id) === id)
      );
      if (!doc?.id) return;
      openEditDocumentModal(doc);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-delete']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!canDeleteDocumentsModule()) return;
      const id = String(btn.dataset.id || "");
      const doc = normalizeEmployeeDocumentRow(read(KEYS.employeeDocuments, []).find((d) => String(d.id) === id));
      if (!doc?.id) return;
      const requestDeletion = G.openConfirmReasonModal || G.openConfirmModal;
      requestDeletion?.({
        title: "Eliminar documento",
        message: `Se eliminará "${doc.fileName}" del expediente de ${doc.employeeName}. El archivo en almacenamiento puede conservarse por auditoría. Indique la justificación de la eliminación.`,
        confirmText: "Eliminar registro",
        onConfirm: async (motivo) => {
          const reason = String(motivo || "").trim();
          const ok = await G.removeFromPortalListAwaitServer?.(KEYS.employeeDocuments, id);
          if (!ok) return;
          G.logPortalAuditEvent?.("documents", "delete", {
            entityId: id,
            entityLabel: `${doc.employeeName} · ${getEmployeeDocumentTypeLabel(doc.documentType)}`,
            summary: `${doc.fileName}${reason ? ` · Motivo: ${reason}` : ""}`
          });
          G.notify?.("Documento eliminado del expediente.", "success");
          G.renderPortalView?.();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-export-csv']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ui = getDocumentsUi();
      const rows = buildEmployeeDocumentExportRows(
        filterDocuments(read(KEYS.employeeDocuments, []), buildDocumentListFilters(ui), todayYmd),
        read(KEYS.payrollEmployees, []),
        todayYmd
      );
      downloadCsv(rows, `expediente-documental-${todayYmd}.csv`);
    });
  });

  const searchRestore = state.__documentsFilterSearchRestore;
  if (searchRestore && typeof searchRestore.start === "number") {
    delete state.__documentsFilterSearchRestore;
    queueMicrotask(() => {
      const root = nodes.viewRoot;
      if (!root || String(state.currentView || "") !== "document-management") return;
      const mode = String(searchRestore.mode || "");
      const selector = mode
        ? `[data-action='doc-filter-search'][data-doc-filter-mode='${mode}']`
        : "[data-action='doc-filter-search']";
      const inp = root.querySelector(selector) || root.querySelector("[data-action='doc-filter-search']");
      if (!inp || typeof inp.focus !== "function") return;
      inp.focus();
      if (typeof inp.setSelectionRange === "function") {
        const n = String(inp.value || "").length;
        const s = Math.max(0, Math.min(searchRestore.start, n));
        const e = Math.max(0, Math.min(searchRestore.end ?? searchRestore.start, n));
        inp.setSelectionRange(s, e);
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
