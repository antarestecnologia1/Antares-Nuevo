/**
 * Gestión documental — expediente digital por colaborador (RRHH).
 */
import { state, nodes, persistHrWorkspace } from "../core/store.js";
import { read, writeAwaitServerCreate, writeAwaitServerEdit } from "../core/data-io.js";
import { KEYS, HR_VALID_DOCUMENTS_WS, PERMISSIONS } from "../core/config.js";
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
  getEmployeeDocumentTypeLabel,
  employeeDocumentTypeRequiresExpiry,
  normalizeEmployeeDocumentRow,
  computeEmployeeDocumentStatus,
  daysUntilDocumentDue,
  formatFileSize,
  buildEmployeeDocumentExportRows,
  summarizeEmployeeDocuments
} from "../domain/employee-documents.domain.js";
import { downloadCsv } from "../domain/reporteria.domain.js";

const G = globalThis;

if (typeof window !== "undefined") {
  window.normalizeEmployeeDocumentRow = normalizeEmployeeDocumentRow;
}

function canManageDocuments() {
  const user = typeof G.currentUser === "function" ? G.currentUser() : null;
  if (!user) return false;
  if (user.role === "admin") return true;
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  return perms.includes(PERMISSIONS.DOCUMENT_MANAGE);
}

function getDocumentsUi() {
  const ui = state.documentsUi || {};
  return {
    workspace: normalizeHrWorkspace("documents", ui.workspace || "operate"),
    operateSection: normalizeDocumentsOperateSection(ui.operateSection || "upload"),
    dataSection: normalizeDocumentsDataSection(ui.dataSection || "all"),
    listSearch: String(ui.listSearch || ""),
    selectedEmployeeId: String(ui.selectedEmployeeId || "")
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
        selectedEmployeeId: String(state.documentsUi.selectedEmployeeId || "")
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

function renderMimeIcon(mime) {
  const m = String(mime || "").toLowerCase();
  if (m.includes("pdf")) return "PDF";
  if (m.startsWith("image/")) return "IMG";
  if (m.includes("word") || m.includes("document")) return "DOC";
  return "FILE";
}

function filterDocuments(documents, { searchNorm, employeeId, typeFilter, statusFilter, todayYmd }) {
  return documents.filter((raw) => {
    const doc = normalizeEmployeeDocumentRow(raw);
    if (employeeId && String(doc.employeeId) !== String(employeeId)) return false;
    if (typeFilter && String(doc.documentType) !== typeFilter) return false;
    if (statusFilter) {
      const st = computeEmployeeDocumentStatus(doc.dueDate, todayYmd);
      if (st !== statusFilter) return false;
    }
    if (!searchNorm) return true;
    const blob = [
      doc.employeeName,
      doc.fileName,
      getEmployeeDocumentTypeLabel(doc.documentType),
      doc.documentCode,
      doc.notes,
      doc.uploadedBy
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(searchNorm);
  });
}

function renderEmployeeOptions(employees, selectedId) {
  const sorted = [...employees].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "es")
  );
  return sorted
    .map((emp) => {
      const id = String(emp.id || "");
      const label = `${String(emp.name || "Sin nombre")} · ${String(emp.documentType || "CC")} ${String(emp.idDoc || "")}`;
      return `<option value="${escapeAttr(id)}"${id === selectedId ? " selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
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
        return `<article class="doc-card" data-doc-id="${escapeAttr(String(doc.id))}">
          <div class="doc-card__icon" aria-hidden="true">${escapeHtml(renderMimeIcon(doc.mimeType))}</div>
          <div class="doc-card__body">
            <h4 class="doc-card__title">${escapeHtml(getEmployeeDocumentTypeLabel(doc.documentType))}</h4>
            <p class="doc-card__file muted">${escapeHtml(doc.fileName)} · ${escapeHtml(formatFileSize(doc.sizeBytes))}</p>
            <div class="doc-card__meta">
              ${renderDocStatusBadge(doc, todayYmd)}
              ${doc.dueDate ? `<span class="muted">Vence ${escapeHtml(String(doc.dueDate))}</span>` : ""}
            </div>
          </div>
          <div class="doc-card__actions">
            <button type="button" class="btn btn-sm btn-outline" data-action="doc-download" data-id="${escapeAttr(String(doc.id))}" title="Descargar">${IC.download || "↓"}</button>
            ${
              canManageDocuments()
                ? `<button type="button" class="btn btn-sm btn-danger-outline" data-action="doc-delete" data-id="${escapeAttr(String(doc.id))}" title="Eliminar">${IC.trash || "×"}</button>`
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
      return `<tr data-doc-id="${escapeAttr(String(doc.id))}">
        <td><strong>${escapeHtml(doc.employeeName || "-")}</strong></td>
        <td>${escapeHtml(getEmployeeDocumentTypeLabel(doc.documentType))}</td>
        <td><span class="doc-file-chip">${escapeHtml(doc.fileName)}</span></td>
        <td>${renderDocStatusBadge(doc, todayYmd)}</td>
        <td>${doc.dueDate ? escapeHtml(String(doc.dueDate)) : "—"}</td>
        <td class="muted">${escapeHtml(formatFileSize(doc.sizeBytes))}</td>
        <td class="doc-table-actions">
          <button type="button" class="btn btn-sm btn-outline" data-action="doc-download" data-id="${escapeAttr(String(doc.id))}">${IC.download || "↓"}</button>
          ${
            canManageDocuments()
              ? `<button type="button" class="btn btn-sm btn-danger-outline" data-action="doc-delete" data-id="${escapeAttr(String(doc.id))}">${IC.trash || "×"}</button>`
              : ""
          }
        </td>
      </tr>`;
    })
    .join("");
  return `<div class="table-wrap doc-table-wrap"><table class="table doc-table">
    <thead><tr>
      <th>Colaborador</th><th>Tipo</th><th>Archivo</th><th>Estado</th><th>Vencimiento</th><th>Tamaño</th><th></th>
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
    return `<li class="doc-checklist__item${ok ? " is-ok" : " is-missing"}">
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
    ${renderDocumentCards(empDocs, todayYmd, IC)}
  </section>`;
}

function renderUploadForm(selectedEmployeeId, IC) {
  return `<form id="form-employee-document" class="doc-upload-form" enctype="multipart/form-data">
    <div class="doc-upload-form__grid">
      <label class="field">
        <span>Colaborador <span class="req">*</span></span>
        <select name="employeeId" required data-doc-employee-select>${renderEmployeeOptions(read(KEYS.payrollEmployees, []), selectedEmployeeId)}</select>
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
      <input type="file" name="file" id="doc-upload-file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,application/pdf,image/*" required hidden />
      <label for="doc-upload-file" class="doc-dropzone__label">
        <span class="doc-dropzone__icon" aria-hidden="true">${IC.upload || IC.file || "↑"}</span>
        <strong>Arrastre o seleccione un archivo</strong>
        <span class="muted">PDF, JPG, PNG, WebP o Word · máx. 15 MB</span>
        <span class="doc-dropzone__filename muted" data-doc-file-label>Sin archivo</span>
      </label>
    </div>
    <div class="doc-upload-form__actions">
      <button type="submit" class="btn btn-primary" data-doc-submit>${IC.upload || ""} Registrar documento</button>
    </div>
  </form>`;
}

function documentManagementHtml() {
  const IC = G.IC || {};
  const employees = read(KEYS.payrollEmployees, []);
  const allDocs = read(KEYS.employeeDocuments, []).map(normalizeEmployeeDocumentRow);
  const todayYmd = colombiaTodayIsoDate();
  const ui = getDocumentsUi();
  const searchNorm = ui.listSearch.trim().toLowerCase();
  const selectedEmployee = employees.find((e) => String(e.id) === ui.selectedEmployeeId) || null;
  const summary = summarizeEmployeeDocuments(allDocs, todayYmd);

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

  const operateNav = `<nav class="doc-operate-nav" aria-label="Sección expediente">
    <button type="button" class="doc-operate-nav__btn${ui.operateSection === "upload" ? " is-active" : ""}" data-action="doc-operate-section" data-section="upload">${IC.upload || "+"} Subir documento</button>
    <button type="button" class="doc-operate-nav__btn${ui.operateSection === "dossier" ? " is-active" : ""}" data-action="doc-operate-section" data-section="dossier">${IC.user || ""} Ver expediente</button>
  </nav>`;

  const uploadPane = `<div class="auth-tab-panel${ui.operateSection === "upload" ? "" : " hidden"}" data-doc-operate-pane="upload">
    <article class="p-card doc-upload-card">
      <header class="hr-action-card__head">
        <h3>Registrar documento</h3>
        <p class="muted">Suba cédulas, contratos, certificados y anexos al expediente del colaborador.</p>
      </header>
      ${canManageDocuments() ? renderUploadForm(ui.selectedEmployeeId, IC) : `<p class="muted">No tiene permiso para registrar documentos.</p>`}
    </article>
  </div>`;

  const dossierEmployeeSelect = `<label class="doc-dossier-select field">
    <span>Colaborador</span>
    <select data-action="doc-select-employee">${renderEmployeeOptions(employees, ui.selectedEmployeeId)}</select>
  </label>`;
  const dossierDocs = filterDocuments(allDocs, { employeeId: ui.selectedEmployeeId, searchNorm: "", todayYmd });
  const dossierPane = `<div class="auth-tab-panel${ui.operateSection === "dossier" ? "" : " hidden"}" data-doc-operate-pane="dossier">
    ${dossierEmployeeSelect}
    ${renderEmployeeDossierPanel(selectedEmployee, dossierDocs, todayYmd, IC)}
  </div>`;

  const operatePanel = `<div class="hr-workspace-panel payroll-workspace-panel${ui.workspace === "operate" ? "" : " hidden"}" role="tabpanel" data-doc-panel="operate">
    ${renderKpiCards(summary, IC)}
    ${operateNav}
    <div class="doc-operate-panels">${uploadPane}${dossierPane}</div>
  </div>`;

  const dataNav = `<nav class="doc-data-nav" aria-label="Filtros archivo">
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "all" ? " is-active" : ""}" data-action="doc-data-section" data-section="all">Todos</button>
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "expired" ? " is-active" : ""}" data-action="doc-data-section" data-section="expired">Vencidos</button>
    <button type="button" class="doc-data-nav__btn${ui.dataSection === "employees" ? " is-active" : ""}" data-action="doc-data-section" data-section="employees">Por colaborador</button>
  </nav>`;

  let filtered = filterDocuments(allDocs, { searchNorm, todayYmd });
  if (ui.dataSection === "expired") {
    filtered = filtered.filter((d) => computeEmployeeDocumentStatus(d.dueDate, todayYmd) === "Vencido");
  }

  const dataToolbar = `<div class="payroll-data-search-toolbar doc-data-toolbar">
    <label class="payroll-data-search">
      <span class="muted">${IC.search || ""} Buscar</span>
      <input type="search" data-action="doc-data-search" value="${escapeAttr(ui.listSearch)}" placeholder="Colaborador, tipo, archivo, código…" autocomplete="off" />
    </label>
    <button type="button" class="btn btn-sm btn-outline" data-action="doc-export-csv">${IC.download || ""} Exportar CSV</button>
  </div>`;

  let dataBody = renderDocumentsTable(filtered, todayYmd, IC);
  if (ui.dataSection === "employees") {
    const grouped = employees
      .map((emp) => {
        const docs = filterDocuments(allDocs, { employeeId: emp.id, searchNorm, todayYmd });
        if (!docs.length && searchNorm) return "";
        return `<details class="doc-employee-group"${docs.length ? " open" : ""}>
          <summary><strong>${escapeHtml(String(emp.name || "-"))}</strong> <span class="muted">${docs.length} documento${docs.length === 1 ? "" : "s"}</span></summary>
          ${renderDocumentCards(docs, todayYmd, IC, { compact: true })}
        </details>`;
      })
      .filter(Boolean)
      .join("");
    dataBody = grouped || `<div class="empty-state doc-empty"><p class="muted">Sin expedientes que coincidan.</p></div>`;
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

async function uploadFileToR2(file, employeeId, documentType) {
  const api = window.AntaresApi;
  if (!api?.postFormData || !api.isConfigured?.()) {
    throw new Error("API no configurada para subir archivos.");
  }
  const fd = new FormData();
  fd.append("file", file, file.name || "documento");
  fd.append("employeeId", employeeId);
  fd.append("documentType", documentType);
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
      patchDocumentsUi({ dataSection: btn.dataset.section || "all" });
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
      if (!canManageDocuments()) {
        G.notify?.("No autorizado.", "error");
        return;
      }
      const fd = new FormData(uploadForm);
      const employeeId = String(fd.get("employeeId") || "").trim();
      const documentType = String(fd.get("documentType") || "otro").trim();
      const file = fileInput?.files?.[0];
      if (!employeeId || !file) {
        G.notify?.("Seleccione colaborador y archivo.", "error");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        G.notify?.("El archivo supera 15 MB.", "error");
        return;
      }
      const submitBtn = uploadForm.querySelector("[data-doc-submit]");
      if (submitBtn) submitBtn.disabled = true;
      try {
        const uploaded = await uploadFileToR2(file, employeeId, documentType);
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

  nodes.viewRoot.querySelectorAll("[data-action='doc-delete']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!canManageDocuments()) return;
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
      const searchNorm = ui.listSearch.trim().toLowerCase();
      const rows = buildEmployeeDocumentExportRows(
        filterDocuments(read(KEYS.employeeDocuments, []), { searchNorm, todayYmd }),
        read(KEYS.payrollEmployees, [])
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
