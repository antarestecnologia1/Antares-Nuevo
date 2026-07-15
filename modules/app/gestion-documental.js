/**
 * Gestión documental — expediente digital por colaborador (RRHH).
 */
import { state, nodes, persistHrWorkspace } from "../core/store.js";
import { read, writeAwaitServerCreate, writeAwaitServerEdit } from "../core/data-io.js";
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
  countDocumentsInFolder,
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
  expectedDocumentTypesForEmployee
} from "../domain/employee-documents.domain.js";
import { downloadCsv } from "../domain/reporteria.domain.js";

const G = globalThis;

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
  const docs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  const folders = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
  if (employeeHasFolderRecord(id, folder, docs, folders)) return;
  const record = buildEmployeeDocumentFolderRecord(
    id,
    folder,
    employee?.name,
    G.currentUser?.()?.fullName || G.currentUser?.()?.email || "Portal"
  );
  record.id = newUuidV4();
  await writeAwaitServerCreate(KEYS.employeeDocumentFolders, [...folders, record], record);
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
    highlightDocumentType: String(ui.highlightDocumentType || "")
  };
}

function hasActiveDocumentFilters(ui) {
  return Boolean(
    String(ui.listSearch || "").trim() ||
      ui.typeFilter ||
      ui.filterEmployeeId ||
      ui.filterStatus ||
      ui.folderFilter
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

function renderDocumentsFilterBar({ ui, employees, folderNames = [], mode = "data" }) {
  const hasFilters = hasActiveDocumentFilters(ui);
  const showEmployee = mode === "data" || (mode === "browse" && !ui.folderBrowseEmployeeId);
  const showFolder = mode === "data" && folderNames.length > 0;
  const showStatus = mode === "data" || mode === "dossier";
  const employeeOpts = renderEmployeeOptions(employees, ui.filterEmployeeId, { placeholder: false });
  const folderOpts = folderNames
    .map(
      (name) =>
        `<option value="${escapeAttr(name)}"${name === ui.folderFilter ? " selected" : ""}>${escapeHtml(name)}</option>`
    )
    .join("");

  return `<div class="doc-filter-bar" data-doc-filter-mode="${escapeAttr(mode)}">
    <div class="doc-filter-bar__row">
      <label class="doc-filter-field doc-filter-field--search">
        <span class="doc-filter-field__label">Buscar</span>
        <input type="search" data-action="doc-filter-search" value="${escapeAttr(ui.listSearch)}" placeholder="Colaborador, archivo, carpeta, tipo…" autocomplete="off" />
      </label>
      ${
        showEmployee
          ? `<label class="doc-filter-field">
        <span class="doc-filter-field__label">Colaborador</span>
        <select data-action="doc-filter-employee">
          <option value=""${ui.filterEmployeeId ? "" : " selected"}>Todos</option>
          ${employeeOpts}
        </select>
      </label>`
          : ""
      }
      <label class="doc-filter-field">
        <span class="doc-filter-field__label">Tipo documental</span>
        <select data-action="doc-type-filter">${renderDocumentTypeFilterOptions(ui.typeFilter)}</select>
      </label>
      ${
        showStatus
          ? `<label class="doc-filter-field">
        <span class="doc-filter-field__label">Estado</span>
        <select data-action="doc-filter-status">
          <option value=""${ui.filterStatus ? "" : " selected"}>Todos</option>
          <option value="Vigente"${ui.filterStatus === "Vigente" ? " selected" : ""}>Vigente</option>
          <option value="Por vencer"${ui.filterStatus === "Por vencer" ? " selected" : ""}>Por vencer</option>
          <option value="Vencido"${ui.filterStatus === "Vencido" ? " selected" : ""}>Vencido</option>
        </select>
      </label>`
          : ""
      }
      ${
        showFolder
          ? `<label class="doc-filter-field">
        <span class="doc-filter-field__label">Carpeta</span>
        <select data-action="doc-filter-folder">
          <option value=""${ui.folderFilter ? "" : " selected"}>Todas</option>
          ${folderOpts}
        </select>
      </label>`
          : ""
      }
      ${
        hasFilters
          ? `<button type="button" class="btn btn-sm btn-outline doc-filter-clear" data-action="doc-clear-filters">Limpiar filtros</button>`
          : ""
      }
      ${
        mode === "data"
          ? `<button type="button" class="btn btn-sm btn-primary doc-filter-browse" data-action="doc-goto-browse-toolbar">Consultar carpetas</button>`
          : ""
      }
    </div>
  </div>`;
}

function renderResultMeta(text) {
  return `<p class="doc-result-meta">${text}</p>`;
}

function patchDocumentsUi(partial) {
  state.documentsUi = { ...(state.documentsUi || {}), ...partial };
  try {
    localStorage.setItem(
      "antares_documents_workspace_v1",
      JSON.stringify({
        workspace: resolveDocumentsWorkspace(state.documentsUi),
        operateSection: normalizeDocumentsOperateSection(state.documentsUi.operateSection),
        dataSection: normalizeDocumentsDataSection(state.documentsUi.dataSection),
        listSearch: String(state.documentsUi.listSearch || ""),
        selectedEmployeeId: String(state.documentsUi.selectedEmployeeId || ""),
        typeFilter: String(state.documentsUi.typeFilter || ""),
        folderBrowseEmployeeId: String(state.documentsUi.folderBrowseEmployeeId || ""),
        folderBrowseName: String(state.documentsUi.folderBrowseName || ""),
        selectedDocumentType: String(state.documentsUi.selectedDocumentType || ""),
        highlightDocumentType: String(state.documentsUi.highlightDocumentType || ""),
        filterEmployeeId: String(state.documentsUi.filterEmployeeId || ""),
        filterStatus: String(state.documentsUi.filterStatus || ""),
        folderFilter: String(state.documentsUi.folderFilter || "")
      })
    );
  } catch (_e) {}
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
    <div class="doc-type-picker__section">
      <p class="doc-type-picker__section-label">Otros tipos</p>
      <div class="doc-type-picker__grid doc-type-picker__grid--compact">${otherItems}</div>
    </div>`
        : `<p class="muted doc-type-picker__empty">Seleccione un colaborador en el paso 1 para ver el checklist.</p>`
    }
  </div>`;
}

function renderKpiCards(summary, IC, gapsCount = 0) {
  return `<div class="doc-kpi-grid" role="group" aria-label="Indicadores documentales">
    <button type="button" class="doc-kpi doc-kpi--total" data-action="doc-quick-filter" data-filter="all" title="Ver todos los documentos">
      <div class="doc-kpi__icon" aria-hidden="true">${IC.file || ""}</div>
      <div class="doc-kpi__content">
        <span class="doc-kpi__label">Documentos</span>
        <strong class="doc-kpi__value">${escapeHtml(String(summary.total))}</strong>
      </div>
    </button>
    <button type="button" class="doc-kpi doc-kpi--employees" data-action="doc-goto-browse-toolbar" title="Consultar expedientes por colaborador">
      <div class="doc-kpi__icon" aria-hidden="true">${IC.user || ""}</div>
      <div class="doc-kpi__content">
        <span class="doc-kpi__label">Expedientes activos</span>
        <strong class="doc-kpi__value">${escapeHtml(String(summary.employeesWithDocs))}</strong>
      </div>
    </button>
    <button type="button" class="doc-kpi doc-kpi--warn" data-action="doc-quick-filter" data-filter="due_soon" title="Filtrar por vencer">
      <div class="doc-kpi__icon" aria-hidden="true">${IC.alert || ""}</div>
      <div class="doc-kpi__content">
        <span class="doc-kpi__label">Por vencer (30d)</span>
        <strong class="doc-kpi__value">${escapeHtml(String(summary.dueSoon))}</strong>
      </div>
    </button>
    <button type="button" class="doc-kpi doc-kpi--expired" data-action="doc-quick-filter" data-filter="expired" title="Filtrar vencidos">
      <div class="doc-kpi__icon" aria-hidden="true">${IC.warning || ""}</div>
      <div class="doc-kpi__content">
        <span class="doc-kpi__label">Vencidos</span>
        <strong class="doc-kpi__value">${escapeHtml(String(summary.expired))}</strong>
      </div>
    </button>
  </div>${gapsCount > 0 ? `<p class="doc-kpi-foot muted"><button type="button" class="doc-kpi-link" data-action="doc-quick-filter" data-filter="gaps">${gapsCount} colaborador${gapsCount === 1 ? "" : "es"} con expediente incompleto →</button></p>` : ""}`;
}

function renderEmptyState(message, { icon = "📂", hint = "" } = {}) {
  return `<div class="empty-state doc-empty">
    <div class="doc-empty__icon" aria-hidden="true">${icon}</div>
    <p class="doc-empty__title">${escapeHtml(message)}</p>
    ${hint ? `<p class="doc-empty__hint muted">${escapeHtml(hint)}</p>` : ""}
  </div>`;
}

function renderDocumentCards(documents, todayYmd, IC, { compact = false } = {}) {
  if (!documents.length) {
    return renderEmptyState("No hay documentos en este expediente.", {
      icon: IC.file || "📄",
      hint: "Suba archivos o cambie los filtros de búsqueda."
    });
  }
  return `<div class="doc-card-grid${compact ? " doc-card-grid--compact" : ""}">
    ${documents
      .map((raw) => {
        const doc = normalizeEmployeeDocumentRow(raw);
        const rowTone = documentExpiryRowClass(doc, todayYmd);
        const mimeClass = renderMimeClass(doc.mimeType);
        return `<article class="doc-card${rowTone ? ` ${rowTone}` : ""}" data-doc-id="${escapeAttr(String(doc.id))}">
          <div class="doc-card__icon doc-card__icon--${mimeClass}" aria-hidden="true">
            <span class="doc-card__icon-label">${escapeHtml(renderMimeIcon(doc.mimeType))}</span>
          </div>
          <div class="doc-card__body">
            <div class="doc-card__headline">
              <h4 class="doc-card__title">${escapeHtml(getEmployeeDocumentTypeLabel(doc.documentType))}</h4>
              ${doc.folder ? `<span class="doc-folder-pill">${escapeHtml(normalizeDocumentFolder(doc.folder))}</span>` : ""}
            </div>
            <p class="doc-card__file muted">${escapeHtml(doc.fileName)}</p>
            <p class="doc-card__size muted">${escapeHtml(formatFileSize(doc.sizeBytes))}</p>
            <div class="doc-card__meta">
              ${renderDocStatusBadge(doc, todayYmd)}
              ${doc.dueDate ? `<span class="doc-meta-chip">Vence ${escapeHtml(String(doc.dueDate))}</span>` : ""}
              ${doc.documentCode ? `<span class="doc-meta-chip">Cód. ${escapeHtml(String(doc.documentCode))}</span>` : ""}
            </div>
          </div>
          <div class="doc-card__actions">
            <button type="button" class="btn btn-sm btn-outline doc-action-btn" data-action="doc-download" data-id="${escapeAttr(String(doc.id))}" title="Descargar">${IC.download || "↓"}</button>
            ${
              canEditDocumentsModule() || canDeleteDocumentsModule()
                ? `${canEditDocumentsModule() ? `<button type="button" class="btn btn-sm btn-outline doc-action-btn" data-action="doc-edit" data-id="${escapeAttr(String(doc.id))}" title="Editar metadatos">${IC.edit || "✎"}</button>` : ""}
            ${canDeleteDocumentsModule() ? `<button type="button" class="btn btn-sm btn-danger-outline doc-action-btn" data-action="doc-delete" data-id="${escapeAttr(String(doc.id))}" title="Eliminar">${IC.trash || "×"}</button>` : ""}`
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

function renderEmployeeDossierPanel(employee, documents, todayYmd, IC, highlightType = "", { allEmployeeDocs = null } = {}) {
  if (!employee) {
    return `<div class="doc-dossier doc-dossier--empty">${renderEmptyState("Seleccione un colaborador", { icon: IC.user || "", hint: "Elija una persona para ver su expediente y checklist." })}</div>`;
  }
  const checklistSource = allEmployeeDocs || documents;
  const empDocs = documents;
  const allCount = checklistSource.length;
  const expected = expectedDocumentTypesForEmployee(employee);
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
  return `<section class="doc-dossier">
    <header class="doc-dossier__head">
      <div class="doc-dossier__identity">
        <span class="doc-dossier__avatar" aria-hidden="true">${escapeHtml(employeeInitials(employee.name))}</span>
        <div>
          <p class="doc-dossier__eyebrow">Expediente digital</p>
          <h3 class="doc-dossier__name">${escapeHtml(String(employee.name || "-"))}</h3>
          <p class="doc-dossier__sub muted">${escapeHtml(String(employee.documentType || "CC"))} ${escapeHtml(String(employee.idDoc || ""))} · ${escapeHtml(String(employee.position || "Sin cargo"))}</p>
        </div>
      </div>
      <div class="doc-dossier__stats">
        <span class="doc-stat-chip"><strong>${empDocs.length}</strong>${empDocs.length !== allCount ? `<span class="muted"> / ${allCount}</span>` : ""} documento${empDocs.length === 1 && allCount === 1 ? "" : "s"}</span>
      </div>
    </header>
    <div class="doc-checklist-panel">
      <h4 class="doc-checklist-panel__title">Checklist mínimo</h4>
      <ul class="doc-checklist">${checklistExpected}</ul>
      ${checklistExtra ? `<h4 class="doc-checklist-panel__title doc-checklist-panel__title--extra">Otros en expediente</h4><ul class="doc-checklist doc-checklist--extra">${checklistExtra}</ul>` : ""}
    </div>
    ${
      canUploadDocumentsModule()
        ? `<p class="doc-dossier__actions">
          <button type="button" class="btn btn-sm btn-primary" data-action="doc-goto-upload" data-employee-id="${escapeAttr(String(employee.id))}">${IC.upload || "+"} Subir documento a este expediente</button>
          ${canViewDocumentsModule() ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-goto-browse" data-employee-id="${escapeAttr(String(employee.id))}">${IC.folder || ""} Ver carpetas</button>` : ""}
        </p>`
        : canViewDocumentsModule()
          ? `<p class="doc-dossier__actions"><button type="button" class="btn btn-sm btn-outline" data-action="doc-goto-browse" data-employee-id="${escapeAttr(String(employee.id))}">${IC.folder || ""} Ver carpetas del colaborador</button></p>`
          : ""
    }
    ${renderDocumentCards(empDocs, todayYmd, IC)}
  </section>`;
}

function renderUploadForm(selectedEmployeeId, selectedDocumentType, allDocs, folderRecords, IC, todayYmd) {
  const folders = collectEmployeeFolders(selectedEmployeeId, allDocs, folderRecords);
  const folderDefault = folders[0] || DEFAULT_EMPLOYEE_DOCUMENT_FOLDER;
  const folderOptions = folders
    .map((name) => `<option value="${escapeAttr(name)}"></option>`)
    .join("");
  const resolvedType = resolveUploadDocumentType(selectedEmployeeId, allDocs, selectedDocumentType);
  return `<form id="form-employee-document" class="doc-upload-form" enctype="multipart/form-data">
    <section class="doc-form-block">
      <header class="doc-form-block__head">
        <span class="doc-form-block__step">1</span>
        <div>
          <h4 class="doc-form-block__title">Colaborador y carpeta</h4>
          <p class="doc-form-block__hint muted">Indique dónde se guardará el archivo en el expediente.</p>
        </div>
      </header>
      <div class="doc-form-block__grid doc-form-block__grid--2">
        <label class="field doc-field">
          <span class="doc-field__label">Colaborador <span class="req">*</span></span>
          <select class="doc-field__control" name="employeeId" required data-doc-employee-select>${renderEmployeeOptions(read(KEYS.payrollEmployees, []), selectedEmployeeId)}</select>
        </label>
        <label class="field doc-field">
          <span class="doc-field__label">Carpeta <span class="req">*</span></span>
          <input class="doc-field__control" name="folder" list="doc-folder-list" required value="${escapeAttr(folderDefault)}" maxlength="128" placeholder="General, Contratos, Certificados…" data-doc-folder-input />
          <datalist id="doc-folder-list">${folderOptions}</datalist>
          <span class="doc-field__hint muted">Subcarpetas se crean en la pestaña Consultar.</span>
        </label>
      </div>
    </section>

    <section class="doc-form-block">
      <header class="doc-form-block__head">
        <span class="doc-form-block__step">2</span>
        <div>
          <h4 class="doc-form-block__title">Tipo documental</h4>
          <p class="doc-form-block__hint muted">Seleccione el ítem del checklist que corresponde al archivo.</p>
        </div>
      </header>
      ${renderUploadDocumentTypePicker(selectedEmployeeId, allDocs, resolvedType, todayYmd)}
    </section>

    <section class="doc-form-block">
      <header class="doc-form-block__head">
        <span class="doc-form-block__step">3</span>
        <div>
          <h4 class="doc-form-block__title">Detalles opcionales</h4>
        </div>
      </header>
      <div class="doc-form-block__grid doc-form-block__grid--2">
        <label class="field doc-field">
          <span class="doc-field__label">Código documental</span>
          <input class="doc-field__control" name="documentCode" type="text" maxlength="64" placeholder="Opcional" />
        </label>
        <label class="field doc-field">
          <span class="doc-field__label">Fecha emisión</span>
          <input class="doc-field__control" name="issueDate" type="date" />
        </label>
        <label class="field doc-field" data-doc-due-wrap>
          <span class="doc-field__label">Fecha vencimiento</span>
          <input class="doc-field__control" name="dueDate" type="date" />
        </label>
        <label class="field doc-field doc-field--full">
          <span class="doc-field__label">Observaciones</span>
          <textarea class="doc-field__control" name="notes" rows="2" maxlength="2000" placeholder="Notas internas RRHH"></textarea>
        </label>
      </div>
    </section>

    <section class="doc-form-block doc-form-block--file">
      <header class="doc-form-block__head">
        <span class="doc-form-block__step">4</span>
        <div>
          <h4 class="doc-form-block__title">Archivo</h4>
          <p class="doc-form-block__hint muted">Cualquier formato · máximo 50 MB</p>
        </div>
      </header>
      <div class="doc-dropzone" data-doc-dropzone>
        <input type="file" name="file" id="doc-upload-file" required hidden />
        <label for="doc-upload-file" class="doc-dropzone__label">
          <span class="doc-dropzone__halo" aria-hidden="true"></span>
          <span class="doc-dropzone__icon" aria-hidden="true">${IC.upload || IC.file || ""}</span>
          <strong class="doc-dropzone__title">Arrastre el archivo aquí o haga clic</strong>
          <span class="doc-dropzone__filename" data-doc-file-label>Sin archivo seleccionado</span>
        </label>
      </div>
    </section>

    <div class="doc-upload-form__actions">
      <button type="submit" class="btn btn-primary" data-doc-submit>${IC.upload || ""} Registrar documento</button>
    </div>
  </form>`;
}

function renderFolderBreadcrumb(ui, employees) {
  const parts = [`<button type="button" class="doc-folder-crumb" data-action="doc-browse-root">Colaboradores</button>`];
  if (ui.folderBrowseEmployeeId) {
    const emp = employees.find((e) => String(e.id) === ui.folderBrowseEmployeeId);
    parts.push(
      `<button type="button" class="doc-folder-crumb" data-action="doc-browse-employee-root" data-employee-id="${escapeAttr(ui.folderBrowseEmployeeId)}">${escapeHtml(String(emp?.name || "Colaborador"))}</button>`
    );
  }
  if (ui.folderBrowseEmployeeId && ui.folderBrowseName) {
    parts.push(`<span class="doc-folder-crumb doc-folder-crumb--current">${escapeHtml(ui.folderBrowseName)}</span>`);
  }
  return `<nav class="doc-folder-breadcrumb" aria-label="Ruta del expediente">${parts.join('<span class="doc-folder-crumb-sep" aria-hidden="true">/</span>')}</nav>`;
}

function renderFolderExplorer(employees, allDocs, folderRecords, ui, todayYmd, IC, { embedded = false } = {}) {
  const searchNorm = ui.listSearch.trim().toLowerCase();
  const browseEmpId = ui.folderBrowseEmployeeId || "";
  const browseFolder = ui.folderBrowseName || "";

  let resultHint = "";
  if (!browseEmpId) {
    const visible = employees.filter((emp) => {
      if (ui.filterEmployeeId && String(emp.id) !== String(ui.filterEmployeeId)) return false;
      if (!searchNorm) return true;
      const blob = `${emp.name || ""} ${emp.idDoc || ""} ${emp.position || ""}`.toLowerCase();
      return blob.includes(searchNorm);
    }).length;
    resultHint = renderResultMeta(`<strong>${visible}</strong> colaborador${visible === 1 ? "" : "es"} visible${visible === 1 ? "" : "s"}`);
  } else if (!browseFolder) {
    const folders = collectEmployeeFolders(browseEmpId, allDocs, folderRecords).filter((name) => {
      if (!searchNorm) return true;
      return name.toLowerCase().includes(searchNorm);
    });
    resultHint = renderResultMeta(`<strong>${folders.length}</strong> carpeta${folders.length === 1 ? "" : "s"} en este expediente`);
  } else {
    const folderDocs = filterDocuments(
      allDocs,
      buildDocumentListFilters(ui, { employeeId: browseEmpId, dataSection: "all" }),
      todayYmd
    ).filter((d) => normalizeDocumentFolder(normalizeEmployeeDocumentRow(d).folder) === normalizeDocumentFolder(browseFolder));
    resultHint = renderResultMeta(`<strong>${folderDocs.length}</strong> archivo${folderDocs.length === 1 ? "" : "s"} en «${escapeHtml(browseFolder)}»`);
  }

  const sortedEmployees = [...employees].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "es")
  );

  const toolbar = `<div class="doc-folder-toolbar doc-folder-toolbar--panel">
    ${renderFolderBreadcrumb(ui, employees)}
    ${
      canUploadDocumentsModule()
        ? `<button type="button" class="btn btn-sm btn-primary doc-new-folder-btn" data-action="doc-new-folder"${browseEmpId ? ` data-employee-id="${escapeAttr(browseEmpId)}"` : ""}>${IC.folder || IC.plus || ""} Nueva carpeta</button>`
        : ""
    }
  </div>`;

  const wrapExplorer = (body) =>
    `<div class="doc-explorer-panel${embedded ? " doc-explorer-panel--embedded" : ""}">${renderDocumentsFilterBar({ ui, employees, mode: "browse" })}${resultHint}${toolbar}<div class="doc-explorer-body">${body}</div></div>`;

  if (!browseEmpId) {
    const tiles = sortedEmployees
      .filter((emp) => {
        if (ui.filterEmployeeId && String(emp.id) !== String(ui.filterEmployeeId)) return false;
        if (!searchNorm) return true;
        const blob = `${emp.name || ""} ${emp.idDoc || ""}`.toLowerCase();
        return blob.includes(searchNorm);
      })
      .map((emp) => {
        const folders = collectEmployeeFolders(emp.id, allDocs, folderRecords);
        const docCount = allDocs.filter(
          (d) => String(normalizeEmployeeDocumentRow(d).employeeId) === String(emp.id)
        ).length;
        return `<button type="button" class="doc-folder-tile doc-folder-tile--employee" data-action="doc-browse-employee" data-employee-id="${escapeAttr(String(emp.id))}">
          <span class="doc-folder-tile__avatar" aria-hidden="true">${escapeHtml(employeeInitials(emp.name))}</span>
          <strong class="doc-folder-tile__title">${escapeHtml(String(emp.name || "-"))}</strong>
          <span class="doc-folder-tile__sub muted">${escapeHtml(String(emp.documentType || "CC"))} ${escapeHtml(String(emp.idDoc || ""))}</span>
          <span class="doc-folder-tile__meta">${folders.length} carpeta${folders.length === 1 ? "" : "s"} · ${docCount} archivo${docCount === 1 ? "" : "s"}</span>
          <span class="doc-folder-tile__chevron" aria-hidden="true">→</span>
        </button>`;
      })
      .join("");
    return wrapExplorer(
      `<div class="doc-folder-grid doc-folder-grid--employees">${tiles || renderEmptyState("No hay colaboradores que coincidan.", { icon: IC.search || "" })}</div>`
    );
  }

  const employee = employees.find((e) => String(e.id) === browseEmpId);
  if (!employee) {
    return wrapExplorer(renderEmptyState("Colaborador no encontrado.", { icon: IC.alert || "!" }));
  }

  if (!browseFolder) {
    const folders = collectEmployeeFolders(browseEmpId, allDocs, folderRecords).filter((name) => {
      if (!searchNorm) return true;
      return name.toLowerCase().includes(searchNorm);
    });
    const tiles = folders
      .map((name) => {
        const count = countDocumentsInFolder(browseEmpId, name, allDocs);
        return `<button type="button" class="doc-folder-tile doc-folder-tile--folder" data-action="doc-browse-folder" data-folder="${escapeAttr(name)}">
          <span class="doc-folder-tile__folder-icon" aria-hidden="true">${IC.folder || ""}</span>
          <strong class="doc-folder-tile__title">${escapeHtml(name)}</strong>
          <span class="doc-folder-tile__meta">${count} archivo${count === 1 ? "" : "s"}</span>
          <span class="doc-folder-tile__chevron" aria-hidden="true">→</span>
        </button>`;
      })
      .join("");
    return wrapExplorer(
      `<div class="doc-folder-grid">${tiles || renderEmptyState("Sin carpetas todavía.", { icon: IC.folder || "", hint: "Use «Nueva carpeta» para organizar el expediente." })}</div>`
    );
  }

  const folderDocs = filterDocuments(
    allDocs,
    buildDocumentListFilters(ui, { employeeId: browseEmpId, dataSection: "all" }),
    todayYmd
  ).filter((d) => normalizeDocumentFolder(normalizeEmployeeDocumentRow(d).folder) === normalizeDocumentFolder(browseFolder));

  return wrapExplorer(renderDocumentCards(folderDocs, todayYmd, IC, { compact: true }));
}

function documentManagementHtml() {
  const IC = G.IC || {};
  const employees = read(KEYS.payrollEmployees, []);
  const allDocs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  const folderRecords = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
  const todayYmd = colombiaTodayIsoDate();
  const ui = getDocumentsUi();
  const ws = ui.workspace;
  const searchNorm = ui.listSearch.trim().toLowerCase();
  const selectedEmployee = employees.find((e) => String(e.id) === ui.selectedEmployeeId) || null;
  const summary = summarizeEmployeeDocuments(allDocs, todayYmd);
  const gapsCount = countEmployeesWithDocumentGaps(employees, allDocs);
  const folderNames = collectUniqueDocumentFolders(allDocs);
  const listFilters = buildDocumentListFilters(ui);
  const filtered = filterDocuments(allDocs, listFilters, todayYmd);

  const moduleHead = renderHrFormHero({
    eyebrow: "Recursos humanos",
    title: "Gestión documental",
    description: "Expediente digital por colaborador: cédulas, contratos, afiliaciones, exámenes y certificados almacenados de forma segura.",
    badges: [
      renderHrFormHeroBadge(String(summary.total), "documentos"),
      summary.expired > 0 ? renderHrFormHeroBadge(String(summary.expired), "vencidos") : "",
      renderHrFormHeroBadge(String(summary.employeesWithDocs), "expedientes")
    ].filter(Boolean)
  });

  const documentTabs = [
    canUploadDocumentsModule()
      ? { id: "upload", label: "Subir documento", icon: "upload", hint: "Registrar archivos en el expediente" }
      : null,
    canViewDocumentsModule()
      ? { id: "consult", label: "Consultar", icon: "folder", hint: "Explorar carpetas por colaborador" }
      : null,
    canViewDocumentsModule()
      ? { id: "dossier", label: "Expediente", icon: "user", hint: "Checklist y documentos del colaborador" }
      : null,
    { id: "data", label: "Archivo general", icon: "eye", hint: "Listado, filtros y exportación" }
  ].filter(Boolean);

  const tabsNav = renderHrWorkspaceTabs({
    module: "documents",
    ariaLabel: "Secciones del módulo Gestión documental",
    activeId: documentTabs.some((t) => t.id === ws) ? ws : documentTabs[0]?.id || "data",
    variant: "switch",
    tabs: documentTabs
  });
  const header = renderHrWorkspaceHeader(moduleHead, tabsNav, "payroll");

  const uploadPanel = `<div class="hr-workspace-panel payroll-workspace-panel doc-workspace-panel${ws === "upload" ? "" : " hidden"}" role="tabpanel" data-doc-panel="upload">
    <article class="p-card doc-panel-card doc-upload-card">
      <header class="doc-panel-card__head">
        <div>
          <p class="doc-panel-card__eyebrow">Registro</p>
          <h3>Subir documento al expediente</h3>
          <p class="muted">Complete los pasos y adjunte el archivo. El checklist se actualizará al guardar.</p>
        </div>
      </header>
      ${canUploadDocumentsModule() ? renderUploadForm(ui.selectedEmployeeId, ui.selectedDocumentType, allDocs, folderRecords, IC, todayYmd) : `<p class="muted doc-panel-card__denied">No tiene permiso para registrar documentos.</p>`}
    </article>
  </div>`;

  const consultPanel = `<div class="hr-workspace-panel payroll-workspace-panel doc-workspace-panel${ws === "consult" ? "" : " hidden"}" role="tabpanel" data-doc-panel="consult">
    <article class="p-card doc-panel-card doc-consult-card">
      <header class="doc-panel-card__head">
        <div>
          <p class="doc-panel-card__eyebrow">Consultar</p>
          <h3>Expedientes por colaborador</h3>
          <p class="muted">Navegue por colaborador → carpeta → archivos. Use los filtros para ubicar información rápidamente.</p>
        </div>
      </header>
      ${canViewDocumentsModule() ? renderFolderExplorer(employees, allDocs, folderRecords, ui, todayYmd, IC, { embedded: true }) : `<p class="muted doc-panel-card__denied">No tiene permiso para consultar documentos.</p>`}
    </article>
  </div>`;

  const dossierEmployeeSelect = `<div class="doc-dossier-select-wrap">
    <label class="field doc-field doc-field--inline">
      <span class="doc-field__label">Colaborador</span>
      <select class="doc-field__control" data-action="doc-select-employee">${renderEmployeeOptions(employees, ui.selectedEmployeeId)}</select>
    </label>
  </div>`;
  const dossierFilters = buildDocumentListFilters(ui, { employeeId: ui.selectedEmployeeId, dataSection: "all" });
  const dossierDocsAll = ui.selectedEmployeeId
    ? filterDocuments(allDocs, { employeeId: ui.selectedEmployeeId }, todayYmd)
    : [];
  const dossierDocs = ui.selectedEmployeeId ? filterDocuments(allDocs, dossierFilters, todayYmd) : [];
  const dossierFilterBar = selectedEmployee ? renderDocumentsFilterBar({ ui, employees, mode: "dossier" }) : "";
  const dossierResultMeta = selectedEmployee
    ? renderResultMeta(`<strong>${dossierDocs.length}</strong> documento${dossierDocs.length === 1 ? "" : "s"} para ${escapeHtml(String(selectedEmployee.name || "colaborador"))}${hasActiveDocumentFilters(ui) ? " (filtrados)" : ""}`)
    : "";
  const dossierPanel = `<div class="hr-workspace-panel payroll-workspace-panel doc-workspace-panel${ws === "dossier" ? "" : " hidden"}" role="tabpanel" data-doc-panel="dossier">
    <article class="p-card doc-panel-card doc-dossier-card">
      <header class="doc-panel-card__head">
        <div>
          <p class="doc-panel-card__eyebrow">Expediente</p>
          <h3>Checklist y documentos del colaborador</h3>
          <p class="muted">Revise el cumplimiento documental y los archivos registrados.</p>
        </div>
      </header>
      <div class="doc-dossier-card__body">
        ${dossierEmployeeSelect}
        ${dossierFilterBar}
        ${dossierResultMeta}
        ${renderEmployeeDossierPanel(selectedEmployee, dossierDocs, todayYmd, IC, ui.highlightDocumentType, { allEmployeeDocs: dossierDocsAll })}
      </div>
    </article>
  </div>`;

  const dataNav = `<nav class="doc-segment-nav doc-data-nav doc-segment-nav--wide" aria-label="Vista del archivo">
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "all" ? " is-active" : ""}" data-action="doc-data-section" data-section="all">Listado completo</button>
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "due_soon" ? " is-active" : ""}" data-action="doc-data-section" data-section="due_soon">Por vencer</button>
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "expired" ? " is-active" : ""}" data-action="doc-data-section" data-section="expired">Vencidos</button>
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "gaps" ? " is-active" : ""}" data-action="doc-data-section" data-section="gaps">Incompletos</button>
  </nav>`;

  let dataResultText = `<strong>${filtered.length}</strong> documento${filtered.length === 1 ? "" : "s"}`;
  if (ui.dataSection === "gaps") {
    const gapRows = employees.filter((emp) => {
      const missing = findEmployeeDocumentGaps(emp, allDocs);
      if (!missing.length) return false;
      if (searchNorm) {
        const blob = `${emp.name || ""} ${emp.idDoc || ""}`.toLowerCase();
        if (!blob.includes(searchNorm)) return false;
      }
      if (ui.filterEmployeeId && String(emp.id) !== String(ui.filterEmployeeId)) return false;
      return true;
    });
    dataResultText = `<strong>${gapRows.length}</strong> colaborador${gapRows.length === 1 ? "" : "es"} con documentos pendientes`;
  }

  const dataToolbar = `<div class="doc-data-shell">
    ${renderDocumentsFilterBar({ ui, employees, folderNames, mode: "data" })}
    <div class="doc-data-filters">${dataNav}</div>
    ${renderResultMeta(`${dataResultText}${hasActiveDocumentFilters(ui) && ui.dataSection === "all" ? " (con filtros activos)" : ""}`)}
    <div class="doc-data-actions">
      <button type="button" class="btn btn-sm btn-outline doc-export-btn" data-action="doc-export-csv">${IC.download || ""} Exportar CSV</button>
    </div>
  </div>`;

  let dataBody = renderDocumentsTable(filtered, todayYmd, IC);
  if (ui.dataSection === "gaps") {
    const rows = employees
      .map((emp) => {
        const missing = findEmployeeDocumentGaps(emp, allDocs);
        if (!missing.length) return "";
        if (searchNorm) {
          const blob = `${emp.name || ""} ${emp.idDoc || ""}`.toLowerCase();
          if (!blob.includes(searchNorm)) return "";
        }
        if (ui.filterEmployeeId && String(emp.id) !== String(ui.filterEmployeeId)) return "";
        const labels = missing.map((t) => getEmployeeDocumentTypeLabel(t)).join(", ");
        return `<tr>
          <td><strong>${escapeHtml(String(emp.name || "-"))}</strong><br><span class="muted">${escapeHtml(String(emp.documentType || "CC"))} ${escapeHtml(String(emp.idDoc || ""))}</span></td>
          <td>${escapeHtml(String(emp.position || "—"))}</td>
          <td><span class="doc-status doc-status--warn">Pendiente</span></td>
          <td class="muted">${escapeHtml(labels)}</td>
          <td class="doc-table-actions">
            ${canUploadDocumentsModule() ? `<button type="button" class="btn btn-sm btn-primary" data-action="doc-goto-upload" data-employee-id="${escapeAttr(String(emp.id))}" data-document-type="${escapeAttr(missing[0] || "")}">${IC.upload || "+"} Subir</button>` : ""}
            ${canViewDocumentsModule() ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-goto-dossier" data-employee-id="${escapeAttr(String(emp.id))}">${IC.eye || ""} Ver</button>` : ""}
          </td>
        </tr>`;
      })
      .filter(Boolean)
      .join("");
    dataBody = rows
      ? `<div class="table-wrap doc-table-wrap"><table class="table doc-table">
        <thead><tr><th>Colaborador</th><th>Cargo</th><th>Estado</th><th>Documentos faltantes</th><th>Acciones</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`
      : `<div class="empty-state doc-empty"><p class="muted">Todos los colaboradores tienen el checklist mínimo completo.</p></div>`;
  }

  const dataPanel = `<div class="hr-workspace-panel payroll-workspace-panel doc-workspace-panel${ws === "data" ? "" : " hidden"}" role="tabpanel" data-doc-panel="data">
    ${dataToolbar}
    <div class="doc-data-content">${dataBody}</div>
  </div>`;

  const kpiBlock = ws !== "data" ? renderKpiCards(summary, IC, gapsCount) : "";

  const studioClass = `documents-studio payroll-studio payroll-shell payroll-shell--workspace hr-flow-shell${ws === "data" ? " payroll-module--clean payroll-studio--consult" : ""}`;
  return `<section class="${studioClass}" data-hr-workspace="${escapeAttr(ws)}">${header}
    ${kpiBlock}
    <div class="hr-workspace-panels doc-workspace-panels">${uploadPanel}${consultPanel}${dossierPanel}${dataPanel}</div>
  </section>`;
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

async function downloadDocumentRecord(doc) {
  const api = window.AntaresApi;
  if (!api?.postJson || !api.isConfigured?.()) {
    G.notify?.("Configure la API para descargar documentos.", "error");
    return;
  }
  const res = await api.postJson("/uploads/employee-document/download", {
    employeeId: doc.employeeId,
    storageKey: doc.storageKey
  });
  const url = String(res?.downloadUrl || "").trim();
  if (!url) throw new Error("No se obtuvo enlace de descarga.");
  window.open(url, "_blank", "noopener,noreferrer");
}

function openCreateFolderModal(defaultEmployeeId = "") {
  if (!canUploadDocumentsModule()) return;
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
      if (!folderName || folderName === DEFAULT_EMPLOYEE_DOCUMENT_FOLDER) {
        /* General always exists logically */
      }
      const employee = employees.find((e) => String(e.id) === employeeId);
      const list = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
      const docs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
      const existsInDocs = docs.some(
        (d) => String(d.employeeId) === employeeId && normalizeDocumentFolder(d.folder) === folderName
      );
      const existsInFolders = list.some(
        (f) => String(f.employeeId) === employeeId && normalizeDocumentFolder(f.folderName) === folderName
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
        const uiNow = getDocumentsUi();
        const targetWs = resolveDocumentsWorkspace({ workspace: uiNow.workspace }) === "data" ? "consult" : resolveDocumentsWorkspace({ workspace: uiNow.workspace });
        patchDocumentsUi({
          workspace: targetWs === "upload" ? "consult" : targetWs,
          folderBrowseEmployeeId: employeeId,
          folderBrowseName: folderName
        });
        persistHrWorkspace("documents", targetWs === "upload" ? "consult" : targetWs);
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
        workspace: "data",
        folderBrowseEmployeeId: "",
        folderBrowseName: "",
        filterStatus: section === "all" ? getDocumentsUi().filterStatus : ""
      });
      persistHrWorkspace("documents", "data");
      G.renderPortalView?.();
    });
  });

  const debouncedFilterRender =
    G.debounce?.(() => G.renderPortalView?.(), 220) || (() => G.renderPortalView?.());

  nodes.viewRoot.querySelectorAll("[data-action='doc-filter-search']").forEach((input) => {
    input.addEventListener("input", (ev) => {
      patchDocumentsUi({ listSearch: ev.target.value || "" });
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
      patchDocumentsUi({
        filterStatus: sel.value || "",
        dataSection: "all",
        workspace: sel.closest("[data-doc-panel='data']") ? "data" : getDocumentsUi().workspace
      });
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-filter-folder']").forEach((sel) => {
    sel.addEventListener("change", () => {
      patchDocumentsUi({ folderFilter: sel.value || "", workspace: "data", dataSection: "all" });
      persistHrWorkspace("documents", "data");
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
        folderFilter: ""
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
          workspace: "data",
          dataSection: "gaps",
          filterStatus: ""
        });
        persistHrWorkspace("documents", "data");
      } else if (filter === "due_soon" || filter === "expired") {
        patchDocumentsUi({
          workspace: "data",
          dataSection: filter,
          filterStatus: "",
          listSearch: "",
          typeFilter: "",
          filterEmployeeId: "",
          folderFilter: ""
        });
        persistHrWorkspace("documents", "data");
      } else if (filter === "all") {
        patchDocumentsUi({
          workspace: "data",
          dataSection: "all",
          filterStatus: "",
          listSearch: "",
          typeFilter: "",
          filterEmployeeId: "",
          folderFilter: ""
        });
        persistHrWorkspace("documents", "data");
      } else {
        patchDocumentsUi({ workspace: "consult" });
        persistHrWorkspace("documents", "consult");
      }
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
      openCreateFolderModal(String(btn.dataset.employeeId || getDocumentsUi().folderBrowseEmployeeId || ""));
    });
  });

  const typeFilterSel = nodes.viewRoot.querySelectorAll("[data-action='doc-type-filter']");
  typeFilterSel.forEach((sel) => {
    sel.addEventListener("change", () => {
      const inData = Boolean(sel.closest("[data-doc-panel='data']"));
      patchDocumentsUi({
        typeFilter: sel.value || "",
        workspace: inData ? "data" : getDocumentsUi().workspace
      });
      if (inData) persistHrWorkspace("documents", "data");
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
        workspace: "dossier",
        selectedEmployeeId: String(btn.dataset.employeeId || "")
      });
      persistHrWorkspace("documents", "dossier");
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
        selectedDocumentType: gaps[0] || ""
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
  }

  syncUploadDueRequired(resolveUploadDocumentType(
    getDocumentsUi().selectedEmployeeId,
    read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow),
    getDocumentsUi().selectedDocumentType
  ));

  const syncUploadFolderDatalist = () => {
    const empSel = nodes.viewRoot.querySelector("[data-doc-employee-select]");
    const folderInput = nodes.viewRoot.querySelector("[data-doc-folder-input]");
    const datalist = nodes.viewRoot.querySelector("#doc-folder-list");
    if (!empSel || !folderInput || !datalist) return;
    const employeeId = String(empSel.value || "");
    const folders = collectEmployeeFolders(
      employeeId,
      read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow),
      read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow)
    );
    datalist.innerHTML = folders.map((name) => `<option value="${escapeAttr(name)}"></option>`).join("");
    if (!String(folderInput.value || "").trim()) {
      folderInput.value = folders[0] || DEFAULT_EMPLOYEE_DOCUMENT_FOLDER;
    }
  };
  syncUploadFolderDatalist();

  const fileInput = nodes.viewRoot.querySelector("#doc-upload-file");
  const fileLabel = nodes.viewRoot.querySelector("[data-doc-file-label]");
  const dropzone = nodes.viewRoot.querySelector("[data-doc-dropzone]");
  if (fileInput && fileLabel) {
    fileInput.addEventListener("change", () => {
      const f = fileInput.files?.[0];
      fileLabel.textContent = f ? `${f.name} (${formatFileSize(f.size)})` : "Sin archivo seleccionado";
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
      const f = ev.dataTransfer?.files?.[0];
      if (f) {
        const dt = new DataTransfer();
        dt.items.add(f);
        fileInput.files = dt.files;
        fileLabel.textContent = `${f.name} (${formatFileSize(f.size)})`;
      }
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
      const folder = normalizeDocumentFolder(fd.get("folder"));
      const file = fileInput?.files?.[0];
      if (!employeeId || !file) {
        G.notify?.("Seleccione colaborador y archivo.", "error");
        return;
      }
      if (file.size > EMPLOYEE_DOCUMENT_MAX_BYTES) {
        G.notify?.("El archivo supera 50 MB.", "error");
        return;
      }
      const submitBtn = uploadForm.querySelector("[data-doc-submit]");
      if (submitBtn) submitBtn.disabled = true;
      try {
        await ensureEmployeeFolderRecord(employeeId, folder);
        const uploaded = await uploadFileToR2(file, employeeId, documentType, folder);
        const employees = read(KEYS.payrollEmployees, []);
        const employee = employees.find((e) => String(e.id) === employeeId);
        const dueDate = String(fd.get("dueDate") || "").trim() || null;
        const issueDate = String(fd.get("issueDate") || "").trim() || null;
        const status = computeEmployeeDocumentStatus(dueDate, todayYmd);
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
          documentCode: String(fd.get("documentCode") || "").trim(),
          notes: String(fd.get("notes") || "").trim(),
          uploadedBy: G.currentUser?.()?.fullName || G.currentUser?.()?.email || "Portal",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        const list = read(KEYS.employeeDocuments, []);
        await writeAwaitServerCreate(KEYS.employeeDocuments, [...list, record], record);
        G.logPortalAuditEvent?.("documents", "create", {
          entityId: record.id,
          entityLabel: `${record.employeeName} · ${getEmployeeDocumentTypeLabel(record.documentType)}`,
          summary: record.fileName
        });
        G.notify?.(
          `${getEmployeeDocumentTypeLabel(documentType)} registrado. El checklist del expediente se actualizó.`,
          "success"
        );
        patchDocumentsUi({
          selectedEmployeeId: employeeId,
          selectedDocumentType: "",
          workspace: "dossier",
          highlightDocumentType: documentType,
          folderBrowseEmployeeId: employeeId,
          folderBrowseName: folder
        });
        uploadForm.reset();
        const typeInput = nodes.viewRoot.querySelector("[data-doc-type-input]");
        if (typeInput) typeInput.value = documentType;
        if (fileLabel) fileLabel.textContent = "Sin archivo seleccionado";
        G.renderPortalView?.();
        setTimeout(() => {
          patchDocumentsUi({ highlightDocumentType: "" });
          G.renderPortalView?.();
        }, 2800);
      } catch (err) {
        G.notify?.(String(err?.message || "No se pudo subir el documento."), "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
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
      G.openConfirmModal?.({
        title: "Eliminar documento",
        message: `Se eliminará "${doc.fileName}" del expediente de ${doc.employeeName}. El archivo en almacenamiento puede conservarse por auditoría.`,
        confirmText: "Eliminar registro",
        onConfirm: async () => {
          const ok = await G.removeFromPortalListAwaitServer?.(KEYS.employeeDocuments, id);
          if (!ok) return;
          G.logPortalAuditEvent?.("documents", "delete", {
            entityId: id,
            entityLabel: `${doc.employeeName} · ${getEmployeeDocumentTypeLabel(doc.documentType)}`,
            summary: doc.fileName
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
}

if (typeof window.registerLegacyPortalViews === "function") {
  window.registerLegacyPortalViews({ documentManagementHtml });
}

(function registerDocumentManagementPortalBinds() {
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["document-management"] = bindDocumentManagementPortalControls;
})();

export { documentManagementHtml, bindDocumentManagementPortalControls };
