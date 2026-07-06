/**
 * Cumplimiento laboral / SST (labor-compliance): vista HTML (runtime) y listeners del portal.
 * Helpers de plantilla viven en `portal-runtime.js` hasta completar la extracción (vía `globalThis`).
 */
import { state, nodes, persistHrWorkspace } from "../core/store.js";
import { read, writeAwaitServer } from "../core/data-io.js";
import { KEYS, HR_VALID_SST_WS } from "../core/config.js";
import { escapeHtml, escapeAttr, buildModuleCreatePanelsState, normalizeHrWorkspace, normalizeSstDataSection } from "../core/utils.js";
import {
  renderHrWorkspaceTabs,
  renderHrWorkspaceHeader,
  switchHrWorkspacePanels,
  switchModuleTabPanels
} from "../ui/components.js";

const G = globalThis;

const SST_DUE_SOON_DAYS = 30;

function resolveEmployeeExpiryYmd(employee, expiryKey, dateKey) {
  const norm = typeof G.normalizePortalDateYmd === "function" ? G.normalizePortalDateYmd : (v) => String(v || "").trim();
  const expiry = norm(employee?.[expiryKey]);
  if (expiry) return expiry;
  if (!dateKey) return "";
  const examDate = norm(employee?.[dateKey]);
  if (examDate && typeof G.addOneYearToYmd === "function") return G.addOneYearToYmd(examDate);
  return "";
}

function isConductorEmployee(employee) {
  return String(employee?.workerRole || "").trim().toLowerCase() === "conductor";
}

function employeeMissingComplianceDate(employee, expiryKey, dateKey) {
  return !resolveEmployeeExpiryYmd(employee, expiryKey, dateKey);
}

function employeeMissingLicenseDate(employee) {
  if (!isConductorEmployee(employee)) return false;
  return employeeMissingComplianceDate(employee, "licenseExpiry", null);
}

function daysUntilPortalDate(ymd) {
  if (typeof G.daysUntil === "function") return G.daysUntil(ymd);
  const expTs = new Date(`${ymd}T12:00:00`).getTime();
  if (!Number.isFinite(expTs)) return null;
  const todayTs = new Date().setHours(0, 0, 0, 0);
  return Math.floor((expTs - todayTs) / 86400000);
}

function isEmployeeDueWithinDays(employee, expiryKey, dateKey, dueSoonDays, { includeExpired = false } = {}) {
  const ymd = resolveEmployeeExpiryYmd(employee, expiryKey, dateKey);
  if (!ymd) return false;
  const days = daysUntilPortalDate(ymd);
  if (days === null || !Number.isFinite(days)) return false;
  if (days < 0) return includeExpired;
  return days <= dueSoonDays;
}

function collectSstDueItems(employees, records, dueSoonDays = SST_DUE_SOON_DAYS) {
  const items = [];
  const pushEmployeeItem = (employee, controlType, expiryKey, dateKey, { allowMissing = false } = {}) => {
    const dueDate = resolveEmployeeExpiryYmd(employee, expiryKey, dateKey);
    if (!dueDate) {
      if (!allowMissing) return;
      items.push({
        employeeId: employee.id,
        employeeName: String(employee.name || "-").trim() || "-",
        position: String(employee.position || "-").trim() || "-",
        controlType,
        dueDate: "",
        days: null,
        bucket: "missing"
      });
      return;
    }
    const days = daysUntilPortalDate(dueDate);
    if (days === null || !Number.isFinite(days) || days > dueSoonDays) return;
    items.push({
      employeeId: employee.id,
      employeeName: String(employee.name || "-").trim() || "-",
      position: String(employee.position || "-").trim() || "-",
      controlType,
      dueDate,
      days,
      bucket: days < 0 ? "expired" : "warning"
    });
  };

  for (const employee of employees) {
    pushEmployeeItem(employee, "Examen médico ocupacional", "occupationalExamExpiry", "occupationalExamDate", {
      allowMissing: true
    });
    if (isConductorEmployee(employee)) {
      pushEmployeeItem(employee, "Examen instruvial", "instruvialExamExpiry", "instruvialExamDate", {
        allowMissing: true
      });
      pushEmployeeItem(employee, "Licencia de conducción", "licenseExpiry", null, { allowMissing: true });
    }
  }

  for (const record of records) {
    const status = String(record.status || "").trim().toLowerCase();
    if (status.startsWith("cumpl")) continue;
    const dueDate =
      (typeof G.normalizePortalDateYmd === "function" ? G.normalizePortalDateYmd(record.dueDate) : "") ||
      String(record.dueDate || "").trim();
    if (!dueDate) {
      const employee = employees.find((row) => String(row.id) === String(record.employeeId || ""));
      items.push({
        employeeId: record.employeeId,
        employeeName: String(record.employeeName || employee?.name || "-").trim() || "-",
        position: String(employee?.position || "-").trim() || "-",
        controlType: String(record.recordType || "Control SST").trim() || "Control SST",
        dueDate: "",
        days: null,
        bucket: "missing",
        recordId: record.id
      });
      continue;
    }
    const days = daysUntilPortalDate(dueDate);
    if (days === null || !Number.isFinite(days) || days > dueSoonDays) continue;
    const employee = employees.find((row) => String(row.id) === String(record.employeeId || ""));
    items.push({
      employeeId: record.employeeId,
      employeeName: String(record.employeeName || employee?.name || "-").trim() || "-",
      position: String(employee?.position || "-").trim() || "-",
      controlType: String(record.recordType || "Control SST").trim() || "Control SST",
      dueDate,
      days,
      bucket: days < 0 ? "expired" : "warning",
      recordId: record.id
    });
  }

  const sortRank = (item) => {
    if (item.bucket === "expired") return 0;
    if (item.bucket === "missing") return 1;
    return 2;
  };
  items.sort((a, b) => {
    const rankDiff = sortRank(a) - sortRank(b);
    if (rankDiff !== 0) return rankDiff;
    if (a.bucket === "missing" && b.bucket === "missing") {
      return String(a.employeeName).localeCompare(String(b.employeeName), "es");
    }
    return (a.days ?? 0) - (b.days ?? 0);
  });
  return items;
}

function sstDueStatusBadge(item) {
  if (item?.bucket === "missing") {
    return `<span class="status status-en_transito">Sin programar</span>`;
  }
  const days = item?.days;
  if (days < 0) {
    return `<span class="status status-vencida">Vencido · ${Math.abs(days)}d</span>`;
  }
  if (days === 0) {
    return `<span class="status status-pendiente">Vence hoy</span>`;
  }
  return `<span class="status status-pendiente">Próximo · ${days}d</span>`;
}

function countMissingComplianceItems(employees) {
  let count = 0;
  for (const employee of employees) {
    if (employeeMissingComplianceDate(employee, "occupationalExamExpiry", "occupationalExamDate")) count += 1;
    if (isConductorEmployee(employee)) {
      if (employeeMissingComplianceDate(employee, "instruvialExamExpiry", "instruvialExamDate")) count += 1;
      if (employeeMissingLicenseDate(employee)) count += 1;
    }
  }
  return count;
}

function renderSstModuleHead({ employeesCount, recordsCount, dueCount, missingCount, urgentCount, workspace = "operate" }) {
  const consultMode = String(workspace || "operate") === "data";
  const items = consultMode
    ? []
    : [
        `<div class="payroll-module-kpi__item payroll-module-kpi__item--neutral" title="Colaboradores activos en nómina"><dt>Colaboradores</dt><dd><strong>${escapeHtml(String(employeesCount))}</strong></dd></div>`,
        `<div class="payroll-module-kpi__item payroll-module-kpi__item--ok" title="Controles documentales registrados"><dt>Controles</dt><dd><strong>${escapeHtml(String(recordsCount))}</strong></dd></div>`
      ];
  if (!consultMode && dueCount > 0) {
    items.push(
      `<div class="payroll-module-kpi__item payroll-module-kpi__item--warn" title="Vencimientos próximos, vencidos o sin programar"><dt>Vencimientos</dt><dd><strong>${escapeHtml(String(dueCount))}</strong></dd></div>`
    );
  }
  if (!consultMode && missingCount > 0) {
    items.push(
      `<div class="payroll-module-kpi__item payroll-module-kpi__item--alert" title="Colaboradores o registros sin fecha de control"><dt>Sin fecha</dt><dd><strong>${escapeHtml(String(missingCount))}</strong></dd></div>`
    );
  }
  if (!consultMode && urgentCount > 0) {
    items.push(
      `<div class="payroll-module-kpi__item payroll-module-kpi__item--alert" title="Alertas críticas que requieren acción inmediata"><dt>Urgentes</dt><dd><strong>${escapeHtml(String(urgentCount))}</strong></dd></div>`
    );
  }
  const payItems = items
    .map((html) =>
      html
        .replace(/payroll-module-kpi__item--/g, "payroll-studio-kpi--")
        .replace(/payroll-module-kpi__item/g, "payroll-studio-kpi")
    )
    .join("");
  const headModeClass = consultMode ? " payroll-module-head--consult" : "";
  const kpiHtml = payItems
    ? `<dl class="payroll-studio-kpis payroll-module-head__kpi payroll-module-kpi" aria-label="Indicadores de cumplimiento SST">${payItems}</dl>`
    : "";
  return `<header class="payroll-studio-head payroll-module-head payroll-module-head--compact${headModeClass}">
    <div class="payroll-studio-head__brand payroll-module-head__title">
      ${consultMode ? "" : `<span class="payroll-studio-head__badge">SST · Colombia</span>`}
      <h2>Cumplimiento laboral y SST</h2>
      ${consultMode ? "" : `<p class="payroll-studio-head__tagline">Seguridad social, exámenes ocupacionales, instruviales y trazabilidad documental conforme a la normativa laboral vigente.</p>`}
    </div>
    ${kpiHtml}
  </header>`;
}

function renderSstDataSectionNav(activeId, counts, IC) {
  const tabs = [
    {
      id: "due",
      label: "Vencimientos",
      title: "Próximos, vencidos o sin programar",
      count: counts.due ?? 0,
      icon: IC.alertTriangle || ""
    },
    {
      id: "audit",
      label: "Auditoría",
      title: "Controles documentales registrados",
      count: counts.audit ?? 0,
      icon: IC.file || ""
    }
  ];
  return `<nav class="payroll-data-nav payroll-data-nav--minimal" role="tablist" aria-label="Consultas de cumplimiento SST">
    ${tabs
      .map((tab) => {
        const active = activeId === tab.id;
        const tip = escapeAttr(String(tab.title || tab.label || ""));
        return `<button type="button" role="tab" class="payroll-data-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="sst-data-section" data-section="${escapeAttr(tab.id)}" title="${tip}">
          <span class="payroll-data-nav-ico" aria-hidden="true">${tab.icon}</span>
          <span>${escapeHtml(tab.label)}</span>
          <span class="payroll-data-nav-count">${escapeHtml(String(tab.count))}</span>
        </button>`;
      })
      .join("")}
  </nav>`;
}

function filterSstListItems(items, searchNorm, fieldsFn) {
  if (!searchNorm) return items;
  return items.filter((item) => {
    const blob = fieldsFn(item);
    return String(blob || "").toLowerCase().includes(searchNorm);
  });
}

(function installLaborComplianceHtml() {
  function laborComplianceHtml() {
    const IC = G.IC || {};
    /** TODO: mover fieldLabel a módulo propio (hoy en portal-runtime.js) */
    const fieldLabel = G.fieldLabel;
    const emptyState = G.emptyState;
    const renderManagedCreateFormActions = G.renderManagedCreateFormActions;
    const createHrActionCard = G.createHrActionCard;
    const canManageSstModule = G.canManageSstModule;

    if (typeof fieldLabel !== "function" || typeof canManageSstModule !== "function") return "";

    const sstUi = state.sstUi || { workspace: "operate", operateSection: "create", dataSection: "due", listSearch: "" };
    const sstWorkspace = normalizeHrWorkspace("sst", sstUi.workspace);
    const sstDataSection = normalizeSstDataSection(sstUi.dataSection);
    const listSearchRaw = String(sstUi.listSearch || "");
    const listSearchNorm = listSearchRaw.trim().toLowerCase();

    const employees = read(KEYS.payrollEmployees, []);
    const contracts = read(KEYS.contracts, []);
    const records = read(KEYS.sstCompliance, []);
    const todayTs = Date.now();
    const dueSoonDays = SST_DUE_SOON_DAYS;
    const expiringContracts = contracts.filter((contract) => {
      if (!contract.endDate) return false;
      const endTs = new Date(`${contract.endDate}T12:00:00`).getTime();
      if (!Number.isFinite(endTs) || endTs < todayTs) return false;
      return (endTs - todayTs) / 86400000 <= dueSoonDays;
    });
    const missingSocialSecurity = employees.filter((employee) => !employee.eps || !employee.pensionFund || !employee.arl);
    const dueItems = collectSstDueItems(employees, records, dueSoonDays);
    const filteredDueItems = filterSstListItems(dueItems, listSearchNorm, (item) =>
      `${item.employeeName} ${item.position} ${item.controlType} ${item.dueDate || ""}`
    );
    const filteredRecords = filterSstListItems(records, listSearchNorm, (record) => {
      const employee = employees.find((item) => String(item.id) === String(record.employeeId || ""));
      return `${record.employeeName || employee?.name || ""} ${record.recordType || ""} ${record.provider || ""} ${record.documentCode || ""} ${record.status || ""} ${record.dueDate || ""}`;
    });
    const missingComplianceCount = countMissingComplianceItems(employees);
    const missingSstRecords = dueItems.filter((item) => item.recordId && item.bucket === "missing").length;
    const employeeOptions = employees.map((employee) => `<option value="${employee.id}">${employee.name} · ${employee.position || "-"}</option>`).join("");
    const statusBadgeForCompliance = (status, dueDate) => {
      const s = String(status || "Pendiente").trim().toLowerCase();
      if (s.startsWith("cumpl")) return `<span class="status status-completada">Cumplido</span>`;
      if (s.startsWith("en gest")) return `<span class="status status-en_transito">En gestión</span>`;
      if (dueDate) {
        const ts = new Date(`${dueDate}T12:00:00`).getTime();
        if (Number.isFinite(ts) && ts < Date.now()) return `<span class="status status-vencida">Vencido</span>`;
        if (Number.isFinite(ts) && (ts - Date.now()) / 86400000 <= 30) {
          return `<span class="status status-pendiente">Próximo</span>`;
        }
      }
      return `<span class="status status-pendiente">Pendiente</span>`;
    };
    const sstCanMutate = canManageSstModule();
    const recordRows = filteredRecords
      .map((record) => {
        const employee = employees.find((item) => String(item.id) === String(record.employeeId || ""));
        const stateKey = String(record.status || "Pendiente").trim().toLowerCase().replace(/\s+/g, "-");
        return `<tr class="payroll-table-row" data-sst-state="${escapeAttr(stateKey)}">
        <td><strong>${escapeHtml(String(record.recordType || "-"))}</strong><br><span class="muted">${escapeHtml(String(record.documentCode || "Sin código documental"))}</span></td>
        <td>${escapeHtml(String(employee?.name || record.employeeName || "-"))}</td>
        <td>${escapeHtml(String(record.provider || "-"))}</td>
        <td>${escapeHtml(String(record.dueDate || "-"))}</td>
        <td>${statusBadgeForCompliance(record.status, record.dueDate)}</td>
        <td class="payroll-table-cell-notes"><span class="muted">${escapeHtml(String(record.notes || "-"))}</span></td>
        <td class="payroll-contracts-table__actions"><div class="toolbar">
          <button class="btn btn-sm btn-outline" data-action="view-sst-record" data-id="${escapeAttr(String(record.id))}">${IC.eye} Ver</button>
          ${sstCanMutate ? `<button class="btn btn-sm btn-action" data-action="edit-sst-record" data-id="${escapeAttr(String(record.id))}">${IC.edit} Editar</button>` : ""}
          ${sstCanMutate ? `<button class="btn btn-sm btn-reject" data-action="delete-sst-record" data-id="${escapeAttr(String(record.id))}" title="Eliminar control SST">${IC.trash} Eliminar</button>` : ""}
        </div></td>
      </tr>`;
      })
      .join("");
    const urgentAlertCount =
      expiringContracts.length +
      missingSocialSecurity.length +
      dueItems.filter((item) => item.bucket === "expired").length;
    const complianceForm = `<form id="form-sst-compliance" class="p-form p-form-colored">
      <fieldset class="form-section form-section-blue full">
        <legend>${IC.user} Empleado y tipo</legend>
        <div class="form-section-grid">
          <label class="full">${fieldLabel(IC.user, "Empleado")}<select name="employeeId" required><option value="">Seleccione...</option>${employeeOptions}</select></label>
          <label class="full">${fieldLabel(IC.file, "Tipo de control")}
            <select name="recordType" required>
              <option value="">Seleccione...</option>
              <option value="Afiliacion EPS">Afiliacion EPS</option>
              <option value="Afiliacion pension">Afiliacion pension</option>
              <option value="Afiliacion ARL">Afiliacion ARL</option>
              <option value="Examen medico ocupacional">Examen medico ocupacional</option>
              <option value="Capacitacion SST">Capacitacion SST</option>
              <option value="Inspeccion documental">Inspeccion documental</option>
            </select>
          </label>
        </div>
      </fieldset>
      <fieldset class="form-section form-section-emerald full">
        <legend>${IC.shield} Seguimiento</legend>
        <div class="form-section-grid">
          <label>${fieldLabel(IC.briefcase, "Entidad / proveedor")}<input name="provider" required placeholder="EPS, fondo, ARL o entidad auditora" /></label>
          <label>${fieldLabel(IC.calendar, "Vencimiento / control")}<input type="date" name="dueDate" required /></label>
          <label>${fieldLabel(IC.activity, "Estado")}
            <select name="status" required>
              <option value="Pendiente">Pendiente</option>
              <option value="En gestion">En gestion</option>
              <option value="Cumplido">Cumplido</option>
            </select>
          </label>
          <label>${fieldLabel(IC.hash, "Codigo documental")}<input name="documentCode" required placeholder="Ej: SST-2026-001" /></label>
        </div>
      </fieldset>
      <label class="full">${fieldLabel(IC.file, "Evidencia / observaciones")}<textarea name="notes" rows="3" required placeholder="Detalle de soporte, auditoría y responsable"></textarea></label>
      ${renderManagedCreateFormActions("create-sst-control", `<button class="btn btn-primary" type="submit">${IC.plus} Registrar control legal/SST</button>`)}
    </form>`;
    const recordsTable = recordRows
      ? `<div class="table-wrap payroll-table-wrap payroll-contracts-table-wrap"><table class="payroll-contracts-table"><thead><tr><th>Control</th><th>Empleado</th><th>Entidad</th><th>Vencimiento</th><th>Estado</th><th>Notas</th><th class="payroll-contracts-table__actions">Acciones</th></tr></thead><tbody>${recordRows}</tbody></table></div>`
      : emptyState("No hay controles de cumplimiento registrados.");
    const dueItemRows = filteredDueItems
      .map((item) => {
        const bucketClass =
          item.bucket === "expired"
            ? "sst-row--expired"
            : item.bucket === "missing"
              ? "sst-row--missing"
              : "sst-row--warning";
        const nameCell = `<strong>${escapeHtml(item.employeeName)}</strong><br><span class="muted">${escapeHtml(item.position)}</span>`;
        const dueDateCell = item.dueDate ? escapeHtml(item.dueDate) : '<span class="muted">Sin programar</span>';
        const rowAttrs = item.bucket === "missing" ? ' data-sst-due-bucket="missing"' : ` data-sst-due-days="${escapeAttr(String(item.days))}"`;
        return `<tr class="${bucketClass}"${rowAttrs}>
        <td><strong>${escapeHtml(item.controlType)}</strong></td>
        <td>${nameCell}</td>
        <td>${dueDateCell}</td>
        <td>${sstDueStatusBadge(item)}</td>
      </tr>`;
      })
      .join("");
    const dueItemsTable = dueItemRows
      ? `<div class="table-wrap payroll-table-wrap"><table><thead><tr><th>Control</th><th>Empleado</th><th>Vencimiento</th><th>Estado</th></tr></thead><tbody>${dueItemRows}</tbody></table></div>`
      : emptyState(
          listSearchNorm
            ? "No hay vencimientos que coincidan con la búsqueda."
            : "No hay vencimientos próximos ni controles sin fecha registrada."
        );
    const sstCreateUi = buildModuleCreatePanelsState(["create-sst-control"], "create-sst-control", state.createPanels || {}, {
      expandActive: sstWorkspace === "operate"
    });
    const sstModuleHead = renderSstModuleHead({
      employeesCount: employees.length,
      recordsCount: records.length,
      dueCount: dueItems.length,
      missingCount: missingComplianceCount + missingSstRecords,
      urgentCount: urgentAlertCount,
      workspace: sstWorkspace
    });
    const sstTabsNav = renderHrWorkspaceTabs({
      module: "sst",
      ariaLabel: "Secciones del módulo Cumplimiento laboral y SST",
      activeId: sstWorkspace,
      variant: "switch",
      tabs: [
        { id: "operate", label: "Registrar", icon: "plus", hint: "Nuevo control SST / legal" },
        { id: "data", label: "Consultar", icon: "eye", hint: "Vencimientos y auditoría" }
      ]
    });
    const sstWorkspaceHeader = renderHrWorkspaceHeader(sstModuleHead, sstTabsNav, "payroll");
    const sstCreatePaneBody = sstCanMutate
      ? createHrActionCard(
          "create-sst-control",
          "shield",
          "Nuevo control SST / legal",
          "Registre obligaciones, vencimientos y evidencias de cumplimiento",
          complianceForm,
          "Abrir formulario",
          { createPanels: sstCreateUi }
        )
      : emptyState("No tiene permiso para registrar controles SST.");
    const sstOperatePanel = `<div class="hr-workspace-panel payroll-workspace-panel${sstWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-sst-panel="operate"${sstWorkspace === "operate" ? "" : " hidden"}>
      <div class="payroll-operate__main">${sstCreatePaneBody}</div>
    </div>`;
    const sstDataNav = renderSstDataSectionNav(sstDataSection, { due: dueItems.length, audit: records.length }, IC);
    const sstDataSearchBar = `<div class="payroll-data-search-toolbar">
      <label class="payroll-data-search">
        <span class="muted">${IC.search || ""} Buscar en listados</span>
        <input type="search" data-action="sst-data-list-search" value="${escapeAttr(listSearchRaw)}" placeholder="Empleado, control, entidad, documento…" autocomplete="off" />
      </label>
    </div>`;
    const dueMeta = `<p class="payroll-result-meta muted" title="Vencimientos próximos, vencidos o sin programar"><strong>${filteredDueItems.length}</strong>${listSearchNorm ? ` <span class="muted">· ${dueItems.length}</span>` : ""} ítem${filteredDueItems.length === 1 ? "" : "s"} · ventana 30 días</p>`;
    const auditMeta = `<p class="payroll-result-meta muted" title="Controles registrados en auditoría documental"><strong>${filteredRecords.length}</strong>${listSearchNorm ? ` <span class="muted">· ${records.length}</span>` : ""} registro${filteredRecords.length === 1 ? "" : "s"}</p>`;
    const duePane = `<div class="payroll-data-pane${sstDataSection === "due" ? "" : " hidden"}" data-sst-section="due"${sstDataSection === "due" ? "" : " hidden"}>
      ${dueMeta}
      <div class="payroll-table-shell">${dueItemsTable}</div>
    </div>`;
    const auditPane = `<div class="payroll-data-pane${sstDataSection === "audit" ? "" : " hidden"}" data-sst-section="audit"${sstDataSection === "audit" ? "" : " hidden"}>
      ${auditMeta}
      <div class="payroll-table-shell">${recordsTable}</div>
    </div>`;
    const sstDataBlock = `<section class="payroll-data-panel">
      ${sstDataSearchBar}
      <div class="payroll-data-toolbar payroll-data-toolbar--compact">
        ${sstDataNav}
      </div>
      <div class="payroll-data-panes">${duePane}${auditPane}</div>
    </section>`;
    const sstDataPanel = `<div class="hr-workspace-panel payroll-workspace-panel${sstWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-sst-panel="data"${sstWorkspace === "data" ? "" : " hidden"}>
      ${sstDataBlock}
    </div>`;
    const studioClass = `sst-studio payroll-studio payroll-shell payroll-shell--workspace hr-flow-shell${sstWorkspace === "data" ? " payroll-module--clean payroll-studio--consult" : ""}`;
    return `<section class="${studioClass}" data-hr-workspace="${escapeAttr(sstWorkspace)}">${sstWorkspaceHeader}
      <div class="hr-workspace-panels">
        ${sstOperatePanel}
        ${sstDataPanel}
      </div>
    </section>`;
  }

  if (typeof window.registerLegacyPortalViews === "function") {
    window.registerLegacyPortalViews({ laborComplianceHtml });
  }
})();

function bindLaborCompliancePortalControls() {
  if (String(state.currentView || "") !== "labor-compliance" || !nodes.viewRoot) return;

  nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='sst']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.tab || "");
      if (!tab) return;
      const ws = normalizeHrWorkspace("sst", tab);
      if (!HR_VALID_SST_WS.has(ws)) return;
      if (normalizeHrWorkspace("sst", state.sstUi?.workspace) === ws) return;
      state.sstUi = {
        ...(state.sstUi || {}),
        workspace: ws,
        operateSection: "create",
        ...(ws === "operate" ? { listSearch: "" } : {})
      };
      if (ws === "operate") {
        state.createPanels = buildModuleCreatePanelsState(["create-sst-control"], "create-sst-control", state.createPanels || {}, {
          expandActive: true
        });
      }
      persistHrWorkspace("sst", ws);
      G.renderPortalView?.();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='sst-data-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizeSstDataSection(btn.dataset.section);
      state.sstUi = { ...(state.sstUi || {}), dataSection: section, workspace: "data" };
      persistHrWorkspace("sst", "data");
      if (
        switchModuleTabPanels({
          root: nodes.viewRoot,
          action: "sst-data-section",
          activeValue: section,
          panelAttr: "data-sst-section",
          tabActiveClass: "is-active"
        })
      ) {
        switchHrWorkspacePanels({
          root: nodes.viewRoot,
          moduleId: "sst",
          workspace: "data",
          panelAttr: "data-sst-panel"
        });
        return;
      }
      G.renderPortalView?.();
    });
  });

  const sstSearchInput = nodes.viewRoot.querySelector("[data-action='sst-data-list-search']");
  if (sstSearchInput) {
    sstSearchInput.addEventListener("input", () => {
      state.sstUi = { ...(state.sstUi || {}), listSearch: String(sstSearchInput.value || ""), workspace: "data" };
      persistHrWorkspace("sst", "data");
      G.renderPortalView?.();
    });
  }

  const sstComplianceForm = document.getElementById("form-sst-compliance");
  if (sstComplianceForm) {
    G.wireFormSubmitGuard(sstComplianceForm, async (event) => {
      if (G.abortUnlessCanManageSst?.()) return;
      const data = G.readFormEntriesNormalized(sstComplianceForm);
      const employee = read(KEYS.payrollEmployees, []).find((item) => String(item.id) === String(data.employeeId || ""));
      if (!employee) {
        G.failPortalField(sstComplianceForm, "employeeId", G.userMessage("sstPickEmployee"));
        return;
      }
      const dueDate = String(data.dueDate || "");
      if (!dueDate) {
        G.failPortalField(sstComplianceForm, "dueDate", G.userMessage("sstDueDateRequired"));
        return;
      }
      const list = read(KEYS.sstCompliance, []);
      const createdRecord = G.stampCreatedRecord({
        id: G.newUuidV4(),
        employeeId: employee.id,
        employeeName: employee.name,
        recordType: String(data.recordType || "").trim(),
        provider: String(data.provider || "").trim(),
        dueDate,
        status: String(data.status || "Pendiente"),
        documentCode: String(data.documentCode || "").trim().toUpperCase(),
        notes: String(data.notes || "").trim()
      });
      list.unshift(createdRecord);
      try {
        await writeAwaitServerCreate(KEYS.sstCompliance, list, createdRecord);
      } catch (err) {
        G.notify(String(err?.message || "No fue posible guardar el registro SST en el servidor."), "error");
        return;
      }
      if (typeof G.logPortalAuditEvent === "function") {
        G.logPortalAuditEvent("sst", "create", {
          entityId: createdRecord.id,
          entityLabel: `${String(createdRecord.employeeName || "Colaborador")} · ${String(createdRecord.recordType || "Control")}`,
          summary: `${String(createdRecord.status || "Pendiente")} · vence ${String(createdRecord.dueDate || "—")}`,
          at: createdRecord.createdAt
        });
      }
      G.notify(G.userMessage("sstRecorded"), "success");
      G.collapseCreatePanel("create-sst-control");
      G.renderPortalView();
    });
  }

  const renderDetailRows = G.portalDetailRenderRows;
  const buildDetailGrid = G.portalDetailBuildGrid;
  const fmtDateOr = (val, fallback = "—") => {
    const y = G.normalizePortalDateYmd(val);
    return y ? escapeHtml(y) : fallback;
  };

  /* ============= SST / CUMPLIMIENTO: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-sst-record']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = read(KEYS.sstCompliance, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!r) {
        G.notify(G.userMessage("genericError"), "error");
        return;
      }
      const sections = [
        {
          icon: "shield",
          pairs: [
            ["Tipo", `<strong>${escapeHtml(String(r.recordType || "-"))}</strong>`],
            ["Código documental", escapeHtml(String(r.documentCode || "-"))],
            ["Empleado", escapeHtml(String(r.employeeName || "-"))],
            ["Entidad / proveedor", escapeHtml(String(r.provider || "-"))],
            ["Vencimiento", fmtDateOr(r.dueDate)],
            ["Estado", escapeHtml(String(r.status || "-"))],
            ["Registrado", fmtDateOr(r.createdAt)],
            ["Responsable", escapeHtml(String(r.createdBy || "-"))]
          ]
        }
      ];
      G.openPortalDetailSheet({
        title: `Control SST · ${String(r.recordType || "")}`,
        sheetTitle: `Control SST · ${String(r.recordType || "")}`,
        subtitleHtml: `${G.IC.user} ${escapeHtml(String(r.employeeName || ""))}`,
        statusHtml: escapeHtml(String(r.status || "-")),
        moduleIcon: "shield",
        moduleTone: "teal",
        sections,
        notesHtml: r.notes ? String(r.notes) : ""
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-sst-record']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (G.abortUnlessCanManageSst?.()) return;
      const all = read(KEYS.sstCompliance, []);
      const target = G.normalizeSstComplianceRow(all.find((x) => String(x.id) === String(btn.dataset.id || "")));
      if (!target) return;
      const recordTypeOpts = G.editModalCatalogSelectOptions(G.SST_COMPLIANCE_RECORD_TYPES, target.recordType);
      const sstStatusOpts = G.editModalCatalogSelectOptions(G.SST_COMPLIANCE_STATUSES, target.status || "Pendiente");
      G.openEditModal({
        title: "Editar control SST",
        subtitle: String(target.recordType || ""),
        submitText: "Guardar cambios",
        fields: [
          {
            name: "recordType",
            label: "Tipo de control",
            type: "select",
            value: target.recordType || "",
            options: recordTypeOpts,
            required: true
          },
          { name: "provider", label: "Entidad / proveedor", value: target.provider || "", required: true },
          { name: "dueDate", label: "Vencimiento", type: "date", value: target.dueDate || "", required: true },
          {
            name: "status",
            label: "Estado",
            type: "select",
            value: target.status || "Pendiente",
            options: sstStatusOpts
          },
          { name: "documentCode", label: "Código documental", value: target.documentCode || "" },
          { name: "notes", label: "Observaciones", type: "textarea", value: target.notes || "", rows: 3 }
        ],
        onSubmit: async (form) => {
          if (!form.dueDate) {
            G.failPortalField(document.getElementById("crud-form"), "dueDate", G.userMessage("sstDueDateRequired"));
            return false;
          }
          const freshRecords = read(KEYS.sstCompliance, []);
          if (!freshRecords.some((r) => String(r.id) === String(target.id))) {
            G.notify("El control SST ya no está disponible. Actualice la página.", "error");
            return false;
          }
          const nextList = freshRecords.map((r) =>
            String(r.id) !== String(target.id)
              ? r
              : G.stampUpdatedRecord({
                  ...r,
                  recordType: String(form.recordType || r.recordType || "").trim(),
                  provider: String(form.provider || "").trim(),
                  dueDate: form.dueDate,
                  status: String(form.status || "Pendiente"),
                  documentCode: String(form.documentCode || "").trim().toUpperCase(),
                  notes: String(form.notes || "").trim()
                })
          );
          try {
            await writeAwaitServerEdit(KEYS.sstCompliance, nextList, target.id);
          } catch (err) {
            G.notify(String(err?.message || "No fue posible guardar el control SST en el servidor."), "error");
            return false;
          }
          const updatedRecord = nextList.find((r) => String(r.id) === String(target.id));
          if (updatedRecord && typeof G.logPortalAuditEvent === "function") {
            G.logPortalAuditEvent("sst", "update", {
              entityId: updatedRecord.id,
              entityLabel: `${String(updatedRecord.employeeName || "Colaborador")} · ${String(updatedRecord.recordType || "Control")}`,
              summary: `${String(updatedRecord.status || "Pendiente")} · ${String(updatedRecord.provider || "Sin entidad")}`,
              at: updatedRecord.updatedAt || G.nowIso()
            });
          }
          G.notify("Control SST actualizado.", "success");
          G.renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-sst-record']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (G.abortUnlessCanManageSst?.()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.sstCompliance, []).find((r) => String(r.id) === id);
      if (!target) return;
      G.openConfirmModal({
        title: "Eliminar control SST",
        message: `Se eliminará el control "${String(target.recordType || "")}" del expediente.`,
        confirmText: "Eliminar control",
        onConfirm: async () => {
          const ok = await G.removeFromPortalListAwaitServer(KEYS.sstCompliance, id);
          if (!ok) return;
          G.logPortalAuditEvent?.("sst", "delete", {
            entityId: id,
            entityLabel: `${String(target.employeeName || "Colaborador")} · ${String(target.recordType || "Control")}`,
            summary: `${String(target.status || "Pendiente")} · vence ${String(target.dueDate || "—")}`
          });
          G.notify("Control SST eliminado.", "success");
          G.renderPortalView();
        }
      });
    });
  });
}

(function registerLaborCompliancePortalBinds() {
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["labor-compliance"] = bindLaborCompliancePortalControls;
})();
