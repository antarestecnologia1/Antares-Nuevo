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
  normalizeDocumentsOperateSection
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
  getEmployeeDocumentTypeLabel,
  employeeDocumentTypeRequiresExpiry,
  normalizeEmployeeDocumentRow,
  normalizeEmployeeDocumentFolderRow,
  normalizeDocumentFolder,
  collectEmployeeFolders,
  countDocumentsInFolder,
  computeEmployeeDocumentStatus,
  daysUntilDocumentDue,
  formatFileSize,
  buildEmployeeDocumentExportRows,
  summarizeEmployeeDocuments,
  findEmployeeDocumentGaps,
  countEmployeesWithDocumentGaps,
  applyDocumentListFilters
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

function getDocumentsUi() {
  const ui = state.documentsUi || {};
  return {
    workspace: normalizeHrWorkspace("documents", ui.workspace || "operate"),
    operateSection: normalizeDocumentsOperateSection(ui.operateSection || "upload"),
    dataSection: normalizeDocumentsDataSection(ui.dataSection || "all"),
    listSearch: String(ui.listSearch || ""),
    selectedEmployeeId: String(ui.selectedEmployeeId || ""),
    typeFilter: String(ui.typeFilter || ""),
    folderBrowseEmployeeId: String(ui.folderBrowseEmployeeId || ""),
    folderBrowseName: String(ui.folderBrowseName || "")
  };
}

function patchDocumentsUi(partial) {
  state.documentsUi = { ...(state.documentsUi || {}), ...partial };
  try {
    localStorage.setItem(
      "antares_documents_workspace_v1",
      JSON.stringify({
        workspace: normalizeHrWorkspace("documents", state.documentsUi.workspace),
        operateSection: normalizeDocumentsOperateSection(state.documentsUi.operateSection),
        dataSection: normalizeDocumentsDataSection(state.documentsUi.dataSection),
        listSearch: String(state.documentsUi.listSearch || ""),
        selectedEmployeeId: String(state.documentsUi.selectedEmployeeId || ""),
        typeFilter: String(state.documentsUi.typeFilter || ""),
        folderBrowseEmployeeId: String(state.documentsUi.folderBrowseEmployeeId || ""),
        folderBrowseName: String(state.documentsUi.folderBrowseName || "")
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
  return "FILE";
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

function renderDocumentTypeOptions(selected) {
  return EMPLOYEE_DOCUMENT_TYPES.map((t) =>
    `<option value="${escapeAttr(t.value)}"${t.value === selected ? " selected" : ""}>${escapeHtml(t.label)}</option>`
  ).join("");
}

function renderKpiCards(summary, IC) {
  return `<div class="doc-kpi-grid" role="group" aria-label="Indicadores documentales">
    <article class="doc-kpi doc-kpi--total">
      <span class="doc-kpi__label">Documentos</span>
      <strong class="doc-kpi__value">${escapeHtml(String(summary.total))}</strong>
    </article>
    <article class="doc-kpi doc-kpi--employees">
      <span class="doc-kpi__label">Colaboradores con expediente</span>
      <strong class="doc-kpi__value">${escapeHtml(String(summary.employeesWithDocs))}</strong>
    </article>
    <article class="doc-kpi doc-kpi--warn">
      <span class="doc-kpi__label">Por vencer (30d)</span>
      <strong class="doc-kpi__value">${escapeHtml(String(summary.dueSoon))}</strong>
    </article>
    <article class="doc-kpi doc-kpi--expired">
      <span class="doc-kpi__label">Vencidos</span>
      <strong class="doc-kpi__value">${escapeHtml(String(summary.expired))}</strong>
    </article>
  </div>`;
}

function renderDocumentCards(documents, todayYmd, IC, { compact = false } = {}) {
  if (!documents.length) {
    return `<div class="empty-state doc-empty"><p class="muted">No hay documentos en este expediente.</p></div>`;
  }
  return `<div class="doc-card-grid${compact ? " doc-card-grid--compact" : ""}">
    ${documents
      .map((raw) => {
        const doc = normalizeEmployeeDocumentRow(raw);
        const rowTone = documentExpiryRowClass(doc, todayYmd);
        return `<article class="doc-card${rowTone ? ` ${rowTone}` : ""}" data-doc-id="${escapeAttr(String(doc.id))}">
          <div class="doc-card__icon" aria-hidden="true">${escapeHtml(renderMimeIcon(doc.mimeType))}</div>
          <div class="doc-card__body">
            <h4 class="doc-card__title">${escapeHtml(getEmployeeDocumentTypeLabel(doc.documentType))}</h4>
            <p class="doc-card__file muted">${escapeHtml(doc.fileName)} · ${escapeHtml(formatFileSize(doc.sizeBytes))}${doc.folder ? ` · ${escapeHtml(normalizeDocumentFolder(doc.folder))}` : ""}</p>
            <div class="doc-card__meta">
              ${renderDocStatusBadge(doc, todayYmd)}
              ${doc.dueDate ? `<span class="muted">Vence ${escapeHtml(String(doc.dueDate))}</span>` : ""}
              ${doc.documentCode ? `<span class="muted">Cód. ${escapeHtml(String(doc.documentCode))}</span>` : ""}
            </div>
          </div>
          <div class="doc-card__actions">
            <button type="button" class="btn btn-sm btn-outline" data-action="doc-download" data-id="${escapeAttr(String(doc.id))}" title="Descargar">${IC.download || "↓"}</button>
            ${
              canEditDocumentsModule() || canDeleteDocumentsModule()
                ? `${canEditDocumentsModule() ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-edit" data-id="${escapeAttr(String(doc.id))}" title="Editar metadatos">${IC.edit || "✎"}</button>` : ""}
            ${canDeleteDocumentsModule() ? `<button type="button" class="btn btn-sm btn-danger-outline" data-action="doc-delete" data-id="${escapeAttr(String(doc.id))}" title="Eliminar">${IC.trash || "×"}</button>` : ""}`
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
    return `<div class="empty-state doc-empty"><p class="muted">Sin resultados para los filtros actuales.</p></div>`;
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
  return `<div class="table-wrap doc-table-wrap"><table class="table doc-table">
    <thead><tr>
      <th>Colaborador</th><th>Carpeta</th><th>Tipo</th><th>Archivo</th><th>Código</th><th>Estado</th><th>Vencimiento</th><th>Tamaño</th><th></th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

function renderEmployeeDossierPanel(employee, documents, todayYmd, IC) {
  if (!employee) {
    return `<div class="doc-dossier doc-dossier--empty"><p class="muted">Seleccione un colaborador para ver su expediente.</p></div>`;
  }
  const empDocs = documents.filter((d) => String(normalizeEmployeeDocumentRow(d).employeeId) === String(employee.id));
  const byType = new Map();
  for (const t of EMPLOYEE_DOCUMENT_TYPES) byType.set(t.value, []);
  for (const raw of empDocs) {
    const doc = normalizeEmployeeDocumentRow(raw);
    const list = byType.get(doc.documentType) || [];
    list.push(doc);
    byType.set(doc.documentType, list);
  }
  const checklist = EMPLOYEE_DOCUMENT_TYPES.map((t) => {
    const items = byType.get(t.value) || [];
    const ok = items.length > 0;
    const latest = items[0];
    const status = latest ? computeEmployeeDocumentStatus(latest.dueDate, todayYmd) : null;
    return `<li class="doc-checklist__item${ok ? " is-ok" : " is-missing"}${status === "Vencido" ? " doc-row--expired" : status === "Por vencer" ? " doc-row--warn" : ""}">
      <span class="doc-checklist__dot" aria-hidden="true"></span>
      <span class="doc-checklist__label">${escapeHtml(t.label)}</span>
      <span class="doc-checklist__count">${items.length ? `${items.length} archivo${items.length === 1 ? "" : "s"}` : "Pendiente"}</span>
      ${status && status !== "Vigente" ? `<span class="doc-checklist__status doc-checklist__status--${status === "Vencido" ? "expired" : "warn"}">${escapeHtml(status)}</span>` : ""}
    </li>`;
  }).join("");
  return `<section class="doc-dossier">
    <header class="doc-dossier__head">
      <div>
        <p class="doc-dossier__eyebrow">Expediente digital</p>
        <h3 class="doc-dossier__name">${escapeHtml(String(employee.name || "-"))}</h3>
        <p class="muted">${escapeHtml(String(employee.documentType || "CC"))} ${escapeHtml(String(employee.idDoc || ""))} · ${escapeHtml(String(employee.position || "Sin cargo"))}</p>
      </div>
      <div class="doc-dossier__stats">
        <span><strong>${empDocs.length}</strong> documento${empDocs.length === 1 ? "" : "s"}</span>
      </div>
    </header>
    <ul class="doc-checklist">${checklist}</ul>
    ${
      canUploadDocumentsModule()
        ? `<p class="doc-dossier__actions"><button type="button" class="btn btn-sm btn-primary" data-action="doc-goto-upload" data-employee-id="${escapeAttr(String(employee.id))}">${IC.upload || "+"} Subir documento a este expediente</button></p>`
        : ""
    }
    ${renderDocumentCards(empDocs, todayYmd, IC)}
  </section>`;
}

function renderUploadForm(selectedEmployeeId, allDocs, folderRecords, IC) {
  const folders = collectEmployeeFolders(selectedEmployeeId, allDocs, folderRecords);
  const folderDefault = folders[0] || DEFAULT_EMPLOYEE_DOCUMENT_FOLDER;
  const folderOptions = folders
    .map((name) => `<option value="${escapeAttr(name)}"></option>`)
    .join("");
  return `<form id="form-employee-document" class="doc-upload-form" enctype="multipart/form-data">
    <div class="doc-upload-form__grid">
      <label class="field">
        <span>Colaborador <span class="req">*</span></span>
        <select name="employeeId" required data-doc-employee-select>${renderEmployeeOptions(read(KEYS.payrollEmployees, []), selectedEmployeeId)}</select>
      </label>
      <label class="field">
        <span>Carpeta <span class="req">*</span></span>
        <input name="folder" list="doc-folder-list" required value="${escapeAttr(folderDefault)}" maxlength="128" placeholder="Ej. General, Contratos, Certificados…" data-doc-folder-input />
        <datalist id="doc-folder-list">${folderOptions}</datalist>
      </label>
      <label class="field">
        <span>Tipo de documento <span class="req">*</span></span>
        <select name="documentType" required data-doc-type-select>${renderDocumentTypeOptions("cedula")}</select>
      </label>
      <label class="field">
        <span>Código documental</span>
        <input name="documentCode" type="text" maxlength="64" placeholder="Opcional" />
      </label>
      <label class="field">
        <span>Fecha emisión</span>
        <input name="issueDate" type="date" />
      </label>
      <label class="field" data-doc-due-wrap>
        <span>Fecha vencimiento</span>
        <input name="dueDate" type="date" />
      </label>
      <label class="field field--full">
        <span>Observaciones</span>
        <textarea name="notes" rows="2" maxlength="2000" placeholder="Notas internas RRHH"></textarea>
      </label>
    </div>
    <div class="doc-dropzone" data-doc-dropzone>
      <input type="file" name="file" id="doc-upload-file" required hidden />
      <label for="doc-upload-file" class="doc-dropzone__label">
        <span class="doc-dropzone__icon" aria-hidden="true">${IC.upload || IC.file || "↑"}</span>
        <strong>Arrastre o seleccione un archivo</strong>
        <span class="muted">Cualquier formato (excepto ejecutables) · máx. 50 MB</span>
        <span class="doc-dropzone__filename muted" data-doc-file-label>Sin archivo</span>
      </label>
    </div>
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

function renderFolderExplorer(employees, allDocs, folderRecords, ui, todayYmd, IC) {
  const searchNorm = ui.listSearch.trim().toLowerCase();
  const browseEmpId = ui.folderBrowseEmployeeId || "";
  const browseFolder = ui.folderBrowseName || "";
  const sortedEmployees = [...employees].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "es")
  );

  const toolbar = `<div class="doc-folder-toolbar">
    ${renderFolderBreadcrumb(ui, employees)}
    ${
      canUploadDocumentsModule()
        ? `<button type="button" class="btn btn-sm btn-primary" data-action="doc-new-folder"${browseEmpId ? ` data-employee-id="${escapeAttr(browseEmpId)}"` : ""}>${IC.folder || IC.plus || "+"} Nueva carpeta</button>`
        : ""
    }
  </div>`;

  if (!browseEmpId) {
    const tiles = sortedEmployees
      .filter((emp) => {
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
          <span class="doc-folder-tile__icon" aria-hidden="true">${IC.user || "👤"}</span>
          <strong class="doc-folder-tile__title">${escapeHtml(String(emp.name || "-"))}</strong>
          <span class="doc-folder-tile__meta muted">${folders.length} carpeta${folders.length === 1 ? "" : "s"} · ${docCount} archivo${docCount === 1 ? "" : "s"}</span>
        </button>`;
      })
      .join("");
    return `${toolbar}<div class="doc-folder-grid">${tiles || `<div class="empty-state doc-empty"><p class="muted">No hay colaboradores que coincidan.</p></div>`}</div>`;
  }

  const employee = employees.find((e) => String(e.id) === browseEmpId);
  if (!employee) {
    return `${toolbar}<div class="empty-state doc-empty"><p class="muted">Colaborador no encontrado.</p></div>`;
  }

  if (!browseFolder) {
    const folders = collectEmployeeFolders(browseEmpId, allDocs, folderRecords).filter((name) => {
      if (!searchNorm) return true;
      return name.toLowerCase().includes(searchNorm);
    });
    const tiles = folders
      .map((name) => {
        const count = countDocumentsInFolder(browseEmpId, name, allDocs);
        return `<button type="button" class="doc-folder-tile" data-action="doc-browse-folder" data-folder="${escapeAttr(name)}">
          <span class="doc-folder-tile__icon" aria-hidden="true">${IC.folder || "📁"}</span>
          <strong class="doc-folder-tile__title">${escapeHtml(name)}</strong>
          <span class="doc-folder-tile__meta muted">${count} archivo${count === 1 ? "" : "s"}</span>
        </button>`;
      })
      .join("");
    return `${toolbar}<div class="doc-folder-grid">${tiles || `<div class="empty-state doc-empty"><p class="muted">Sin carpetas. Cree una con «Nueva carpeta».</p></div>`}</div>`;
  }

  const folderDocs = filterDocuments(
    allDocs,
    { employeeId: browseEmpId, searchNorm, typeFilter: ui.typeFilter },
    todayYmd
  ).filter((d) => normalizeDocumentFolder(normalizeEmployeeDocumentRow(d).folder) === normalizeDocumentFolder(browseFolder));

  return `${toolbar}${renderDocumentCards(folderDocs, todayYmd, IC, { compact: true })}`;
}

function documentManagementHtml() {
  const IC = G.IC || {};
  const employees = read(KEYS.payrollEmployees, []);
  const allDocs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  const folderRecords = read(KEYS.employeeDocumentFolders, []).map(normalizeEmployeeDocumentFolderRow);
  const todayYmd = colombiaTodayIsoDate();
  const ui = getDocumentsUi();
  const searchNorm = ui.listSearch.trim().toLowerCase();
  const selectedEmployee = employees.find((e) => String(e.id) === ui.selectedEmployeeId) || null;
  const summary = summarizeEmployeeDocuments(allDocs, todayYmd);
  const gapsCount = countEmployeesWithDocumentGaps(employees, allDocs);
  const listFilters = {
    searchNorm,
    typeFilter: ui.typeFilter,
    dataSection: ui.dataSection
  };
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

  const tabsNav = renderHrWorkspaceTabs({
    module: "documents",
    ariaLabel: "Secciones del módulo Gestión documental",
    activeId: ui.workspace,
    variant: "switch",
    tabs: [
      { id: "operate", label: "Expediente", icon: "folder", hint: "Subir y consultar por colaborador" },
      { id: "data", label: "Archivo general", icon: "eye", hint: "Listado, filtros y exportación" }
    ]
  });
  const header = renderHrWorkspaceHeader(moduleHead, tabsNav, "payroll");

  const operateNavButtons = [
    canUploadDocumentsModule()
      ? `<button type="button" class="doc-operate-nav__btn${ui.operateSection === "upload" ? " is-active" : ""}" data-action="doc-operate-section" data-section="upload">${IC.upload || "+"} Subir documento</button>`
      : "",
    canViewDocumentsModule()
      ? `<button type="button" class="doc-operate-nav__btn${ui.operateSection === "dossier" ? " is-active" : ""}" data-action="doc-operate-section" data-section="dossier">${IC.user || ""} Ver expediente</button>`
      : ""
  ].filter(Boolean);
  const operateNav = operateNavButtons.length
    ? `<nav class="doc-operate-nav" aria-label="Sección expediente">${operateNavButtons.join("")}</nav>`
    : "";

  const uploadPane = `<div class="auth-tab-panel${ui.operateSection === "upload" ? "" : " hidden"}" data-doc-operate-pane="upload">
    <article class="p-card doc-upload-card">
      <header class="hr-action-card__head">
        <h3>Registrar documento</h3>
        <p class="muted">Suba cédulas, contratos, certificados y anexos al expediente del colaborador.</p>
      </header>
      ${canUploadDocumentsModule() ? renderUploadForm(ui.selectedEmployeeId, allDocs, folderRecords, IC) : `<p class="muted">No tiene permiso para registrar documentos.</p>`}
    </article>
  </div>`;

  const dossierEmployeeSelect = `<label class="doc-dossier-select field">
    <span>Colaborador</span>
    <select data-action="doc-select-employee">${renderEmployeeOptions(employees, ui.selectedEmployeeId)}</select>
  </label>`;
  const dossierDocs = ui.selectedEmployeeId
    ? filterDocuments(allDocs, { employeeId: ui.selectedEmployeeId }, todayYmd)
    : [];
  const dossierPane = `<div class="auth-tab-panel${ui.operateSection === "dossier" ? "" : " hidden"}" data-doc-operate-pane="dossier">
    ${dossierEmployeeSelect}
    ${renderEmployeeDossierPanel(selectedEmployee, dossierDocs, todayYmd, IC)}
  </div>`;

  const operatePanel = `<div class="hr-workspace-panel payroll-workspace-panel${ui.workspace === "operate" ? "" : " hidden"}" role="tabpanel" data-doc-panel="operate">
    ${renderKpiCards(summary, IC)}
    ${
      summary.expired > 0 || summary.dueSoon > 0
        ? `<p class="doc-operate-alert hr-attention-strip hr-attention-strip--warn" role="status">${IC.alert || ""} <strong>${summary.expired}</strong> vencido${summary.expired === 1 ? "" : "s"} · <strong>${summary.dueSoon}</strong> por vencer (30 días)${gapsCount > 0 ? ` · <strong>${gapsCount}</strong> colaborador${gapsCount === 1 ? "" : "es"} con expediente incompleto` : ""}</p>`
        : gapsCount > 0
          ? `<p class="doc-operate-alert hr-attention-strip" role="status">${IC.info || ""} <strong>${gapsCount}</strong> colaborador${gapsCount === 1 ? "" : "es"} con documentos pendientes en el checklist.</p>`
          : ""
    }
    ${operateNav}
    <div class="doc-operate-panels">${uploadPane}${dossierPane}</div>
  </div>`;

  const dataNav = `<nav class="doc-data-nav" aria-label="Filtros archivo">
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "all" ? " is-active" : ""}" data-action="doc-data-section" data-section="all">Todos</button>
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "due_soon" ? " is-active" : ""}" data-action="doc-data-section" data-section="due_soon">Por vencer</button>
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "expired" ? " is-active" : ""}" data-action="doc-data-section" data-section="expired">Vencidos</button>
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "employees" ? " is-active" : ""}" data-action="doc-data-section" data-section="employees">Por colaborador</button>
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "gaps" ? " is-active" : ""}" data-action="doc-data-section" data-section="gaps">Expediente incompleto</button>
  </nav>`;

  const dataToolbar = `<div class="payroll-data-search-toolbar doc-data-toolbar">
    <label class="payroll-data-search">
      <span class="muted">${IC.search || ""} Buscar</span>
      <input type="search" data-action="doc-data-search" value="${escapeAttr(ui.listSearch)}" placeholder="Colaborador, carpeta, tipo, archivo, código…" autocomplete="off" />
    </label>
    <label class="field doc-type-filter">
      <span class="muted">Tipo</span>
      <select data-action="doc-type-filter">${renderDocumentTypeFilterOptions(ui.typeFilter)}</select>
    </label>
    <button type="button" class="btn btn-sm btn-outline" data-action="doc-export-csv">${IC.download || ""} Exportar CSV</button>
  </div>`;

  let dataBody = renderDocumentsTable(filtered, todayYmd, IC);
  if (ui.dataSection === "employees") {
    dataBody = renderFolderExplorer(employees, allDocs, folderRecords, ui, todayYmd, IC);
  } else if (ui.dataSection === "gaps") {
    const rows = employees
      .map((emp) => {
        const missing = findEmployeeDocumentGaps(emp, allDocs);
        if (!missing.length) return "";
        if (searchNorm) {
          const blob = `${emp.name || ""} ${emp.idDoc || ""}`.toLowerCase();
          if (!blob.includes(searchNorm)) return "";
        }
        const labels = missing.map((t) => getEmployeeDocumentTypeLabel(t)).join(", ");
        return `<tr>
          <td><strong>${escapeHtml(String(emp.name || "-"))}</strong><br><span class="muted">${escapeHtml(String(emp.documentType || "CC"))} ${escapeHtml(String(emp.idDoc || ""))}</span></td>
          <td>${escapeHtml(String(emp.position || "—"))}</td>
          <td><span class="doc-status doc-status--warn">Pendiente</span></td>
          <td class="muted">${escapeHtml(labels)}</td>
          <td class="doc-table-actions">
            ${canUploadDocumentsModule() ? `<button type="button" class="btn btn-sm btn-primary" data-action="doc-goto-upload" data-employee-id="${escapeAttr(String(emp.id))}">${IC.upload || "+"} Subir</button>` : ""}
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

  const dataPanel = `<div class="hr-workspace-panel payroll-workspace-panel${ui.workspace === "data" ? "" : " hidden"}" role="tabpanel" data-doc-panel="data">
    ${dataToolbar}
    <div class="payroll-data-toolbar payroll-data-toolbar--compact">${dataNav}</div>
    <p class="payroll-result-meta muted"><strong>${filtered.length}</strong> documento${filtered.length === 1 ? "" : "s"}</p>
    ${dataBody}
  </div>`;

  const studioClass = `documents-studio payroll-studio payroll-shell payroll-shell--workspace hr-flow-shell${ui.workspace === "data" ? " payroll-module--clean payroll-studio--consult" : ""}`;
  return `<section class="${studioClass}" data-hr-workspace="${escapeAttr(ui.workspace)}">${header}
    <div class="hr-workspace-panels">${operatePanel}${dataPanel}</div>
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
        patchDocumentsUi({
          workspace: "data",
          dataSection: "employees",
          folderBrowseEmployeeId: employeeId,
          folderBrowseName: ""
        });
        persistHrWorkspace("documents", "data");
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

  nodes.viewRoot.querySelectorAll("[data-action='doc-operate-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({ operateSection: btn.dataset.section || "upload" });
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-data-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        dataSection: btn.dataset.section || "all",
        workspace: "data",
        folderBrowseEmployeeId: "",
        folderBrowseName: ""
      });
      persistHrWorkspace("documents", "data");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-browse-root']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({ folderBrowseEmployeeId: "", folderBrowseName: "" });
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-browse-employee-root']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        folderBrowseEmployeeId: String(btn.dataset.employeeId || ""),
        folderBrowseName: ""
      });
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-browse-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        workspace: "data",
        dataSection: "employees",
        folderBrowseEmployeeId: String(btn.dataset.employeeId || ""),
        folderBrowseName: ""
      });
      persistHrWorkspace("documents", "data");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-browse-folder']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({ folderBrowseName: String(btn.dataset.folder || "") });
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-new-folder']").forEach((btn) => {
    btn.addEventListener("click", () => {
      openCreateFolderModal(String(btn.dataset.employeeId || getDocumentsUi().folderBrowseEmployeeId || ""));
    });
  });

  const typeFilterSel = nodes.viewRoot.querySelector("[data-action='doc-type-filter']");
  if (typeFilterSel) {
    typeFilterSel.addEventListener("change", () => {
      patchDocumentsUi({ typeFilter: typeFilterSel.value || "", workspace: "data" });
      persistHrWorkspace("documents", "data");
      G.renderPortalView?.();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='doc-goto-upload']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        workspace: "operate",
        operateSection: "upload",
        selectedEmployeeId: String(btn.dataset.employeeId || "")
      });
      persistHrWorkspace("documents", "operate");
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='doc-goto-dossier']").forEach((btn) => {
    btn.addEventListener("click", () => {
      patchDocumentsUi({
        workspace: "operate",
        operateSection: "dossier",
        selectedEmployeeId: String(btn.dataset.employeeId || "")
      });
      persistHrWorkspace("documents", "operate");
      G.renderPortalView?.();
    });
  });

  const searchInput = nodes.viewRoot.querySelector("[data-action='doc-data-search']");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      G.debounce?.((ev) => {
        patchDocumentsUi({ listSearch: ev.target.value || "" });
        G.renderPortalView?.();
      }, 220) ||
        ((ev) => {
          patchDocumentsUi({ listSearch: ev.target.value || "" });
          G.renderPortalView?.();
        })
    );
  }

  nodes.viewRoot.querySelectorAll("[data-action='doc-select-employee'], [data-doc-employee-select]").forEach((sel) => {
    sel.addEventListener("change", () => {
      patchDocumentsUi({ selectedEmployeeId: sel.value || "" });
      G.renderPortalView?.();
    });
  });

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

  const typeSelect = nodes.viewRoot.querySelector("[data-doc-type-select]");
  const dueWrap = nodes.viewRoot.querySelector("[data-doc-due-wrap]");
  if (typeSelect && dueWrap) {
    const syncDue = () => {
      const req = employeeDocumentTypeRequiresExpiry(typeSelect.value);
      dueWrap.classList.toggle("is-required", req);
      const dueInput = dueWrap.querySelector('input[name="dueDate"]');
      if (dueInput) dueInput.required = req;
    };
    typeSelect.addEventListener("change", syncDue);
    syncDue();
  }

  const fileInput = nodes.viewRoot.querySelector("#doc-upload-file");
  const fileLabel = nodes.viewRoot.querySelector("[data-doc-file-label]");
  const dropzone = nodes.viewRoot.querySelector("[data-doc-dropzone]");
  if (fileInput && fileLabel) {
    fileInput.addEventListener("change", () => {
      const f = fileInput.files?.[0];
      fileLabel.textContent = f ? `${f.name} (${formatFileSize(f.size)})` : "Sin archivo";
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
      const documentType = String(fd.get("documentType") || "otro").trim();
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
        G.notify?.("Documento registrado en el expediente.", "success");
        patchDocumentsUi({ selectedEmployeeId: employeeId, operateSection: "dossier" });
        uploadForm.reset();
        if (fileLabel) fileLabel.textContent = "Sin archivo";
        G.renderPortalView?.();
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
        filterDocuments(
          read(KEYS.employeeDocuments, []),
          {
            searchNorm: ui.listSearch.trim().toLowerCase(),
            typeFilter: ui.typeFilter,
            dataSection: ui.dataSection
          },
          todayYmd
        ),
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
