/**
 * Cumplimiento laboral / SST (labor-compliance): vista HTML (runtime) y listeners del portal.
 * Helpers de plantilla viven en `portal-runtime.js` hasta completar la extracción (vía `globalThis`).
 */
import { state, nodes, persistHrWorkspace } from "../core/store.js";
import { read, writeAwaitServerCreate, writeAwaitServerEdit } from "../core/data-io.js";
import { KEYS, HR_VALID_SST_WS } from "../core/config.js";
import { escapeHtml, escapeAttr, buildModuleCreatePanelsState, normalizeHrWorkspace, normalizeSstDataSection, normalizeSstOperateSection, colombiaTodayIsoDate } from "../core/utils.js";
import {
  renderHrWorkspaceTabs,
  renderHrWorkspaceHeader,
  switchHrWorkspacePanels,
  switchModuleTabPanels,
  renderHrFormHero,
  renderHrFormHeroBadge,
  renderSstOperateSectionNav,
  renderHrAlertCards
} from "../ui/components.js";
import {
  resolveEmployeeComplianceExpiryYmd,
  COMPLIANCE_DUE_SOON_DAYS
} from "../domain/driver-compliance-vigencia.domain.js";
import {
  resolveSstControlKey,
  executeSstRenewal,
  applySstRecordCompletion,
  sstControlRequiresProvider,
  getSstControlRecordType,
  mergeSstEvidenceRef
} from "../domain/sst-renewal.domain.js";
import {
  findSstEmployeeReconciliationIssues,
  buildSstDueExportRows
} from "../domain/sst-reconciliation.domain.js";
import { downloadCsv } from "../domain/reporteria.domain.js";

const G = globalThis;

const SST_DUE_SOON_DAYS = COMPLIANCE_DUE_SOON_DAYS;

function resolveEmployeeExpiryYmd(employee, expiryKey, dateKey) {
  const norm = typeof G.normalizePortalDateYmd === "function" ? G.normalizePortalDateYmd : (v) => String(v || "").trim();
  return resolveEmployeeComplianceExpiryYmd(employee, expiryKey, dateKey, norm);
}

function isConductorEmployee(employee) {
  return String(employee?.workerRole || "").trim().toLowerCase() === "conductor";
}

function employeeMissingComplianceDate(employee, expiryKey, dateKey) {
  return !resolveEmployeeExpiryYmd(employee, expiryKey, dateKey);
}

function employeeMissingLicenseDate(employee) {
  if (!isConductorEmployee(employee)) return false;
  return !resolveEmployeeExpiryYmd(employee, "licenseExpiry", "licenseIssueDate");
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
  const pushEmployeeItem = (employee, controlType, expiryKey, dateKey, controlKey, { allowMissing = false } = {}) => {
    const dueDate = resolveEmployeeExpiryYmd(employee, expiryKey, dateKey);
    if (!dueDate) {
      if (!allowMissing) return;
      items.push({
        employeeId: employee.id,
        employeeName: String(employee.name || "-").trim() || "-",
        position: String(employee.position || "-").trim() || "-",
        controlType,
        controlKey,
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
      controlKey,
      dueDate,
      days,
      bucket: days < 0 ? "expired" : "warning"
    });
  };

  for (const employee of employees) {
    pushEmployeeItem(
      employee,
      "Examen médico ocupacional",
      "occupationalExamExpiry",
      "occupationalExamDate",
      "occupational_exam",
      { allowMissing: true }
    );
    if (isConductorEmployee(employee)) {
      pushEmployeeItem(employee, "Examen instruvial", "instruvialExamExpiry", "instruvialExamDate", "instruvial_exam", {
        allowMissing: true
      });
      pushEmployeeItem(employee, "Licencia de conducción", "licenseExpiry", "licenseIssueDate", "license", {
        allowMissing: true
      });
    }
    const pushMissingAffiliation = (emp, controlType, field, controlKey) => {
      if (String(emp[field] || "").trim()) return;
      items.push({
        employeeId: emp.id,
        employeeName: String(emp.name || "-").trim() || "-",
        position: String(emp.position || "-").trim() || "-",
        controlType,
        controlKey,
        dueDate: "",
        days: null,
        bucket: "missing"
      });
    };
    pushMissingAffiliation(employee, "Afiliación EPS", "eps", "eps_affiliation");
    pushMissingAffiliation(employee, "Afiliación pensión", "pensionFund", "pension_affiliation");
    pushMissingAffiliation(employee, "Afiliación ARL", "arl", "arl_affiliation");
  }

  for (const record of records) {
    const status = String(record.status || "").trim().toLowerCase();
    if (status.startsWith("cumpl")) continue;
    const controlKey = resolveSstControlKey(record.recordType);
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
        controlKey,
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
      controlKey,
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

function renderSstRenewButton(IC, { employeeId, controlKey, recordId, controlType, label = "Renovar" }) {
  if (!controlKey) return "";
  return `<button type="button" class="btn btn-sm btn-primary" data-action="renew-sst-control"
    data-employee-id="${escapeAttr(String(employeeId || ""))}"
    data-control-key="${escapeAttr(String(controlKey || ""))}"
    data-record-id="${escapeAttr(String(recordId || ""))}"
    data-control-type="${escapeAttr(String(controlType || ""))}"
    title="Renovar control y actualizar ficha del colaborador">${IC.activity || "↻"} ${escapeHtml(label)}</button>`;
}

function openSstRenewalModal(ctx) {
  const {
    employeeId,
    controlKey,
    recordId,
    controlType,
    provider: initialProvider = "",
    documentCode: initialDocumentCode = "",
    notes: initialNotes = ""
  } = ctx;
  const employees = read(KEYS.payrollEmployees, []);
  const employee = employees.find((row) => String(row.id) === String(employeeId || ""));
  if (!employee) {
    G.notify("Colaborador no encontrado.", "error");
    return;
  }
  const key = String(controlKey || "").trim();
  if (!key) {
    G.notify("Este control no admite renovación automática.", "error");
    return;
  }
  const today = colombiaTodayIsoDate();
  const needsProvider = sstControlRequiresProvider(key);
  const displayType = String(controlType || getSstControlRecordType(key) || key);
  const defaultProvider =
    String(initialProvider || "").trim() ||
    (key === "eps_affiliation"
      ? String(employee.eps || "")
      : key === "pension_affiliation"
        ? String(employee.pensionFund || "")
        : key === "arl_affiliation"
          ? String(employee.arl || "")
          : "");

  G.openEditModal({
    title: "Renovar control SST",
    subtitle: `${String(employee.name || "").trim()} · ${displayType}`,
    submitText: "Renovar y actualizar",
    fields: [
      {
        type: "section",
        title: "Renovación",
        hint: "Al confirmar se actualiza la ficha del colaborador (y conductor si aplica), se registra el cumplimiento y se calcula el próximo vencimiento."
      },
      {
        name: "completionDate",
        label: needsProvider ? "Fecha de afiliación / renovación" : "Fecha de realización",
        type: "date",
        value: today,
        required: true
      },
      ...(needsProvider
        ? [
            {
              name: "provider",
              label: "Entidad (EPS, fondo o ARL)",
              value: defaultProvider,
              required: true,
              placeholder: "Ej. Sura, Colpensiones, Positiva"
            }
          ]
        : [
            {
              name: "provider",
              label: "Entidad / proveedor (opcional)",
              value: defaultProvider
            }
          ]),
      {
        name: "documentCode",
        label: "Código documental (opcional)",
        value: String(initialDocumentCode || "")
      },
      {
        name: "notes",
        label: "Observaciones (opcional)",
        type: "textarea",
        value: String(initialNotes || ""),
        rows: 2
      },
      {
        name: "evidenceRef",
        label: "Referencia evidencia (URL o código, opcional)",
        value: "",
        placeholder: "Ej. https://… o Carpeta física A-12 (sin subir archivos)"
      }
    ],
    onSubmit: async (form) => {
      const result = await executeSstRenewal({
        employeeId: employee.id,
        controlKey: key,
        completionDate: form.completionDate,
        provider: form.provider,
        documentCode: form.documentCode,
        notes: form.notes,
        recordId: recordId || undefined,
        createAuditRecord: true,
        evidenceRef: form.evidenceRef
      });
      if (!result.ok) {
        G.notify(String(result.message || "No fue posible completar la renovación."), "error");
        return false;
      }
      G.logPortalAuditEvent?.("sst", "renew", {
        entityId: result.record?.id || recordId || employee.id,
        entityLabel: `${String(employee.name || "Colaborador")} · ${displayType}`,
        summary: `Renovado ${String(result.completionDate || "")} · próximo ${String(result.nextDueDate || "—")}`,
        at: G.nowIso?.() || new Date().toISOString()
      });
      G.notify(
        `Control renovado. Ficha del colaborador actualizada${result.nextDueDate ? ` · próximo vencimiento ${result.nextDueDate}` : ""}.`,
        "success"
      );
      G.renderPortalView();
      return true;
    }
  });
}

function sstPreviewStatusChip(label, ymd, { missingLabel = "Sin fecha" } = {}) {
  if (!ymd) {
    return `<span class="sst-preview-chip sst-preview-chip--missing" title="${escapeAttr(label)}">${escapeHtml(label)} · ${escapeHtml(missingLabel)}</span>`;
  }
  const days = daysUntilPortalDate(ymd);
  let tone = "ok";
  if (days !== null && days < 0) tone = "expired";
  else if (days !== null && days <= SST_DUE_SOON_DAYS) tone = "warn";
  return `<span class="sst-preview-chip sst-preview-chip--${tone}" title="${escapeAttr(label)} · vence ${escapeAttr(ymd)}">${escapeHtml(label)} · ${escapeHtml(ymd)}</span>`;
}

function buildSstEmployeePreviewHtml(employee, records = []) {
  const IC = G.IC || {};
  if (!employee) {
    return `<p class="sst-employee-preview__empty muted">${IC.user || ""} Seleccione un colaborador para ver su estado de cumplimiento, vencimientos activos y controles registrados.</p>`;
  }
  const name = String(employee.name || "-").trim() || "-";
  const position = String(employee.position || "-").trim() || "-";
  const role = isConductorEmployee(employee) ? "Conductor" : "Colaborador";
  const dueForEmployee = collectSstDueItems([employee], records, SST_DUE_SOON_DAYS);
  const employeeRecords = records.filter((record) => String(record.employeeId) === String(employee.id));
  const dueRows = dueForEmployee.length
    ? dueForEmployee
        .map((item) => {
          const tone =
            item.bucket === "expired" ? "expired" : item.bucket === "missing" ? "missing" : "warn";
          const dueLabel = item.dueDate ? escapeHtml(item.dueDate) : "Sin programar";
          return `<li class="sst-preview-due sst-preview-due--${tone}"><strong>${escapeHtml(item.controlType)}</strong><span>${dueLabel}</span></li>`;
        })
        .join("")
    : `<li class="sst-preview-due sst-preview-due--ok"><strong>Sin vencimientos urgentes</strong><span>Ventana 30 días</span></li>`;
  const chips = [
    sstPreviewStatusChip("EPS", resolveEmployeeExpiryYmd(employee, "epsExpiry", "epsAffiliationDate")),
    sstPreviewStatusChip("Pensión", resolveEmployeeExpiryYmd(employee, "pensionExpiry", "pensionAffiliationDate")),
    sstPreviewStatusChip("ARL", resolveEmployeeExpiryYmd(employee, "arlExpiry", "arlAffiliationDate")),
    sstPreviewStatusChip("Examen ocup.", resolveEmployeeExpiryYmd(employee, "medicalExamExpiry", "medicalExamDate"))
  ];
  if (isConductorEmployee(employee)) {
    chips.push(sstPreviewStatusChip("Instruvial", resolveEmployeeExpiryYmd(employee, "instruvialExpiry", "instruvialDate")));
    chips.push(sstPreviewStatusChip("Licencia", resolveEmployeeExpiryYmd(employee, "licenseExpiry", "licenseIssueDate")));
  }
  return `<div class="sst-employee-preview__card">
    <header class="sst-employee-preview__head">
      <span class="sst-employee-preview__avatar" aria-hidden="true">${IC.user || ""}</span>
      <div>
        <h4 class="sst-employee-preview__name">${escapeHtml(name)}</h4>
        <p class="sst-employee-preview__meta muted">${escapeHtml(position)} · ${escapeHtml(role)}</p>
      </div>
    </header>
    <div class="sst-employee-preview__chips">${chips.join("")}</div>
    <div class="sst-employee-preview__due">
      <p class="sst-employee-preview__due-label">Atención prioritaria</p>
      <ul class="sst-preview-due-list">${dueRows}</ul>
    </div>
    <p class="sst-employee-preview__records muted">${employeeRecords.length} control${employeeRecords.length === 1 ? "" : "es"} en auditoría documental</p>
  </div>`;
}

function renderSstComplianceGuidePane(IC, { dueCount, recordsCount, reconcileCount, missingCount }) {
  const cards = renderHrAlertCards([
    {
      tone: dueCount > 0 ? "warn" : "ok",
      icon: IC.calendar || "",
      label: "Vencimientos",
      value: dueCount,
      help: "Controles próximos, vencidos o sin fecha en ventana de 30 días."
    },
    {
      tone: missingCount > 0 ? "alert" : "ok",
      icon: IC.activity || "",
      label: "Sin fecha",
      value: missingCount,
      help: "Colaboradores o afiliaciones sin vigencia registrada en ficha."
    },
    {
      tone: reconcileCount > 0 ? "warn" : "ok",
      icon: IC.shield || "",
      label: "Desincronizados",
      value: reconcileCount,
      help: "Registros SST cumplidos cuya ficha no coincide."
    },
    {
      tone: "info",
      icon: IC.file || "",
      label: "Auditoría",
      value: recordsCount,
      help: "Controles documentales registrados en el módulo."
    }
  ]);
  return `<section class="sst-guide-panel" aria-label="Guía de cumplimiento SST">
    <header class="sst-guide-panel__head">
      <p class="sst-guide-panel__eyebrow">Referencia operativa</p>
      <h3 class="sst-guide-panel__title">Checklist de cumplimiento</h3>
      <p class="sst-guide-panel__lead muted">Use esta guía para decidir qué registrar. Al marcar un control como <strong>Cumplido</strong> con fecha de realización, la ficha del colaborador se actualiza en todos los módulos vinculados.</p>
    </header>
    ${cards}
    <div class="sst-guide-checklist">
      <article class="sst-guide-card">
        <h4>${IC.briefcase || ""} Afiliaciones obligatorias</h4>
        <p class="muted">EPS, pensión y ARL deben tener entidad, código documental y fecha de vencimiento alineada con la ficha del colaborador.</p>
      </article>
      <article class="sst-guide-card">
        <h4>${IC.shield || ""} Exámenes y capacitación</h4>
        <p class="muted">Examen médico ocupacional, instruvial (conductores) y capacitaciones SST requieren fecha de realización al cerrar como cumplido.</p>
      </article>
      <article class="sst-guide-card">
        <h4>${IC.link || IC.file || ""} Evidencia sin archivos</h4>
        <p class="muted">Registre referencias externas (URL o código de carpeta). El portal no almacena PDFs; la trazabilidad queda en observaciones.</p>
      </article>
    </div>
    <footer class="sst-guide-panel__footer">
      <button type="button" class="btn btn-outline" data-action="hr-workspace-tab" data-module="sst" data-tab="data">${IC.eye || ""} Ir a Consultar vencimientos</button>
      <button type="button" class="btn btn-primary" data-action="sst-operate-section" data-section="create">${IC.plus || ""} Registrar nuevo control</button>
    </footer>
  </section>`;
}

function updateSstCreateFormProgress(form) {
  if (!form) return;
  const employeeId = String(form.querySelector('[name="employeeId"]')?.value || "").trim();
  const recordType = String(form.querySelector('[name="recordType"]')?.value || "").trim();
  const provider = String(form.querySelector('[name="provider"]')?.value || "").trim();
  const dueDate = String(form.querySelector('[name="dueDate"]')?.value || "").trim();
  const documentCode = String(form.querySelector('[name="documentCode"]')?.value || "").trim();
  const notes = String(form.querySelector('[name="notes"]')?.value || "").trim();
  const step1 = Boolean(employeeId && recordType);
  const step2 = Boolean(provider && dueDate && documentCode);
  const step3 = Boolean(notes);
  const completed = [step1, step2, step3].filter(Boolean).length;
  const fill = form.querySelector("[data-sst-create-progress]");
  if (fill) fill.style.width = `${Math.round((completed / 3) * 100)}%`;
  form.querySelectorAll("[data-sst-create-milestone]").forEach((node) => {
    const key = String(node.dataset.sstCreateMilestone || "");
    const done = key === "employee" ? step1 : key === "control" ? step2 : key === "evidence" ? step3 : false;
    node.classList.toggle("is-active", done);
    node.classList.toggle("is-done", done);
  });
}

function refreshSstEmployeePreview(form) {
  if (!form) return;
  const preview = document.getElementById("sst-employee-preview");
  if (!preview) return;
  const employeeId = String(form.querySelector('[name="employeeId"]')?.value || "").trim();
  const employees = read(KEYS.payrollEmployees, []);
  const records = read(KEYS.sstCompliance, []);
  const employee = employees.find((item) => String(item.id) === employeeId);
  preview.innerHTML = buildSstEmployeePreviewHtml(employee, records);
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
    },
    {
      id: "reconcile",
      label: "Reconciliar",
      title: "Desincronización SST vs ficha del colaborador",
      count: counts.reconcile ?? 0,
      icon: IC.activity || ""
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
    const sstOperateSection = normalizeSstOperateSection(sstUi.operateSection);
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
    const reconcileIssues = findSstEmployeeReconciliationIssues(employees, records);
    const filteredDueItems = filterSstListItems(dueItems, listSearchNorm, (item) =>
      `${item.employeeName} ${item.position} ${item.controlType} ${item.dueDate || ""}`
    );
    const filteredRecords = filterSstListItems(records, listSearchNorm, (record) => {
      const employee = employees.find((item) => String(item.id) === String(record.employeeId || ""));
      return `${record.employeeName || employee?.name || ""} ${record.recordType || ""} ${record.provider || ""} ${record.documentCode || ""} ${record.status || ""} ${record.dueDate || ""}`;
    });
    const filteredReconcileIssues = filterSstListItems(reconcileIssues, listSearchNorm, (issue) =>
      `${issue.employeeName} ${issue.controlType} ${issue.message} ${issue.type}`
    );
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
          ${sstCanMutate && resolveSstControlKey(record.recordType) ? renderSstRenewButton(IC, { employeeId: record.employeeId, controlKey: resolveSstControlKey(record.recordType), recordId: record.id, controlType: record.recordType }) : ""}
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
              <option value="Examen instruvial">Examen instruvial</option>
              <option value="Licencia de conduccion">Licencia de conduccion</option>
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
          <label class="sst-completion-date-field">${fieldLabel(IC.calendar, "Fecha de realización")}<input type="date" name="completionDate" /></label>
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
      <label class="full">${fieldLabel(IC.link || IC.file, "Referencia evidencia (opcional)")}<input name="evidenceRef" placeholder="URL externa o código de carpeta física — no se almacenan archivos en el portal" /></label>
      <p class="muted full sst-renewal-hint">Al marcar el control como <strong>Cumplido</strong>, con fecha de realización, se renovará automáticamente la ficha del colaborador en todos los módulos vinculados. Use la referencia de evidencia solo como enlace o código (sin cargar PDFs).</p>
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
        const renewBtn =
          sstCanMutate && item.controlKey
            ? `<td class="payroll-contracts-table__actions"><div class="toolbar">${renderSstRenewButton(IC, {
                employeeId: item.employeeId,
                controlKey: item.controlKey,
                recordId: item.recordId,
                controlType: item.controlType
              })}</div></td>`
            : `<td class="muted">—</td>`;
        return `<tr class="${bucketClass}"${rowAttrs}>
        <td><strong>${escapeHtml(item.controlType)}</strong></td>
        <td>${nameCell}</td>
        <td>${dueDateCell}</td>
        <td>${sstDueStatusBadge(item)}</td>
        ${renewBtn}
      </tr>`;
      })
      .join("");
    const dueItemsTable = dueItemRows
      ? `<div class="table-wrap payroll-table-wrap"><table><thead><tr><th>Control</th><th>Empleado</th><th>Vencimiento</th><th>Estado</th><th class="payroll-contracts-table__actions">Acciones</th></tr></thead><tbody>${dueItemRows}</tbody></table></div>`
      : emptyState(
          listSearchNorm
            ? "No hay vencimientos que coincidan con la búsqueda."
            : "No hay vencimientos próximos ni controles sin fecha registrada."
        );
    const reconcileRows = filteredReconcileIssues
      .map((issue) => {
        const typeBadge =
          issue.type === "desync"
            ? `<span class="status status-vencida">Desincronizado</span>`
            : issue.type === "expired"
              ? `<span class="status status-vencida">Vencido</span>`
              : `<span class="status status-en_transito">Faltante</span>`;
        const renewBtn =
          sstCanMutate && issue.controlKey
            ? renderSstRenewButton(IC, {
                employeeId: issue.employeeId,
                controlKey: issue.controlKey,
                recordId: issue.recordId,
                controlType: issue.controlType,
                label: "Corregir"
              })
            : "";
        return `<tr>
        <td>${typeBadge}</td>
        <td><strong>${escapeHtml(issue.controlType)}</strong><br><span class="muted">${escapeHtml(issue.employeeName)}</span></td>
        <td class="payroll-table-cell-notes"><span class="muted">${escapeHtml(issue.message)}</span><br><span class="muted">${escapeHtml(issue.suggestedAction || "")}</span></td>
        <td class="payroll-contracts-table__actions">${renewBtn ? `<div class="toolbar">${renewBtn}</div>` : '<span class="muted">—</span>'}</td>
      </tr>`;
      })
      .join("");
    const reconcileTable = reconcileRows
      ? `<div class="table-wrap payroll-table-wrap"><table><thead><tr><th>Tipo</th><th>Control / empleado</th><th>Detalle</th><th class="payroll-contracts-table__actions">Acción</th></tr></thead><tbody>${reconcileRows}</tbody></table></div>`
      : emptyState(
          listSearchNorm
            ? "No hay inconsistencias que coincidan con la búsqueda."
            : "No hay desincronización entre SST y fichas de colaboradores."
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
    const sstDataNav = renderSstDataSectionNav(
      sstDataSection,
      { due: dueItems.length, audit: records.length, reconcile: reconcileIssues.length },
      IC
    );
    const sstDataSearchBar = `<div class="payroll-data-search-toolbar">
      <label class="payroll-data-search">
        <span class="muted">${IC.search || ""} Buscar en listados</span>
        <input type="search" data-action="sst-data-list-search" value="${escapeAttr(listSearchRaw)}" placeholder="Empleado, control, entidad, documento…" autocomplete="off" />
      </label>
      <button type="button" class="btn btn-sm btn-outline" data-action="export-sst-due-csv" title="Descargar vencimientos actuales">${IC.download || IC.file || ""} Exportar CSV</button>
    </div>`;
    const dueMeta = `<p class="payroll-result-meta muted" title="Vencimientos próximos, vencidos o sin programar"><strong>${filteredDueItems.length}</strong>${listSearchNorm ? ` <span class="muted">· ${dueItems.length}</span>` : ""} ítem${filteredDueItems.length === 1 ? "" : "s"} · ventana 30 días</p>`;
    const auditMeta = `<p class="payroll-result-meta muted" title="Controles registrados en auditoría documental"><strong>${filteredRecords.length}</strong>${listSearchNorm ? ` <span class="muted">· ${records.length}</span>` : ""} registro${filteredRecords.length === 1 ? "" : "s"}</p>`;
    const reconcileMeta = `<p class="payroll-result-meta muted" title="Controles SST cumplidos cuya ficha no coincide, o vigencias faltantes"><strong>${filteredReconcileIssues.length}</strong>${listSearchNorm ? ` <span class="muted">· ${reconcileIssues.length}</span>` : ""} inconsistencia${filteredReconcileIssues.length === 1 ? "" : "s"}</p>`;
    const duePane = `<div class="payroll-data-pane${sstDataSection === "due" ? "" : " hidden"}" data-sst-section="due"${sstDataSection === "due" ? "" : " hidden"}>
      ${dueMeta}
      <div class="payroll-table-shell">${dueItemsTable}</div>
    </div>`;
    const auditPane = `<div class="payroll-data-pane${sstDataSection === "audit" ? "" : " hidden"}" data-sst-section="audit"${sstDataSection === "audit" ? "" : " hidden"}>
      ${auditMeta}
      <div class="payroll-table-shell">${recordsTable}</div>
    </div>`;
    const reconcilePane = `<div class="payroll-data-pane${sstDataSection === "reconcile" ? "" : " hidden"}" data-sst-section="reconcile"${sstDataSection === "reconcile" ? "" : " hidden"}>
      ${reconcileMeta}
      <p class="muted payroll-result-meta">Revise registros marcados Cumplido en SST cuya ficha no se actualizó, o colaboradores con EPS/ARL/pensión o exámenes pendientes.</p>
      <div class="payroll-table-shell">${reconcileTable}</div>
    </div>`;
    const sstDataBlock = `<section class="payroll-data-panel">
      ${sstDataSearchBar}
      <div class="payroll-data-toolbar payroll-data-toolbar--compact">
        ${sstDataNav}
      </div>
      <div class="payroll-data-panes">${duePane}${auditPane}${reconcilePane}</div>
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

  nodes.viewRoot.querySelectorAll("[data-action='export-sst-due-csv']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const employees = read(KEYS.payrollEmployees, []);
      const records = read(KEYS.sstCompliance, []);
      const rows = buildSstDueExportRows(employees, collectSstDueItems(employees, records, SST_DUE_SOON_DAYS));
      downloadCsv(`vencimientos_sst_${colombiaTodayIsoDate()}.csv`, rows, [
        { key: "empleado", label: "Empleado" },
        { key: "documento", label: "Documento" },
        { key: "control", label: "Control" },
        { key: "vencimiento", label: "Vencimiento" },
        { key: "estado", label: "Estado" },
        { key: "dias", label: "Días" }
      ]);
      G.notify?.("Exportación de vencimientos SST descargada.", "success");
    });
  });

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
      const status = String(data.status || "Pendiente");
      const isComplete = status.trim().toLowerCase().startsWith("cumpl");
      const completionDate = String(data.completionDate || "").trim();
      if (isComplete && !completionDate) {
        G.failPortalField(
          sstComplianceForm,
          "completionDate",
          "Indique la fecha de realización al marcar el control como Cumplido."
        );
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
        completionDate: completionDate || "",
        status,
        documentCode: String(data.documentCode || "").trim().toUpperCase(),
        notes: mergeSstEvidenceRef(String(data.notes || "").trim(), data.evidenceRef)
      });
      list.unshift(createdRecord);
      try {
        await writeAwaitServerCreate(KEYS.sstCompliance, list, createdRecord);
      } catch (err) {
        G.notify(String(err?.message || "No fue posible guardar el registro SST en el servidor."), "error");
        return;
      }
      if (isComplete) {
        const renewal = await applySstRecordCompletion(createdRecord, {
          completionDate: completionDate || dueDate,
          provider: data.provider,
          documentCode: data.documentCode,
          notes: createdRecord.notes,
          evidenceRef: data.evidenceRef
        });
        if (!renewal.ok) {
          G.notify(
            String(renewal.message || "Control registrado, pero no se pudo actualizar la ficha del colaborador."),
            "error"
          );
          G.renderPortalView();
          return;
        }
      }
      if (typeof G.logPortalAuditEvent === "function") {
        G.logPortalAuditEvent("sst", "create", {
          entityId: createdRecord.id,
          entityLabel: `${String(createdRecord.employeeName || "Colaborador")} · ${String(createdRecord.recordType || "Control")}`,
          summary: `${String(createdRecord.status || "Pendiente")} · vence ${String(createdRecord.dueDate || "—")}`,
          at: createdRecord.createdAt
        });
      }
      G.notify(
        isComplete
          ? "Control registrado y ficha del colaborador actualizada."
          : G.userMessage("sstRecorded"),
        "success"
      );
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
            ["Realización", fmtDateOr(r.completionDate)],
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
            name: "completionDate",
            label: "Fecha de realización",
            type: "date",
            value: target.completionDate || "",
            hint: "Obligatoria al marcar como Cumplido. Actualiza la ficha del colaborador."
          },
          {
            name: "status",
            label: "Estado",
            type: "select",
            value: target.status || "Pendiente",
            options: sstStatusOpts
          },
          { name: "documentCode", label: "Código documental", value: target.documentCode || "" },
          { name: "notes", label: "Observaciones", type: "textarea", value: target.notes || "", rows: 3 },
          {
            name: "evidenceRef",
            label: "Referencia evidencia (URL o código)",
            value: "",
            placeholder: "Opcional — sin subir archivos al portal"
          }
        ],
        onSubmit: async (form) => {
          if (!form.dueDate) {
            G.failPortalField(document.getElementById("crud-form"), "dueDate", G.userMessage("sstDueDateRequired"));
            return false;
          }
          const nextStatus = String(form.status || "Pendiente");
          const isComplete = nextStatus.trim().toLowerCase().startsWith("cumpl");
          const completionDate = String(form.completionDate || "").trim();
          if (isComplete && !completionDate) {
            G.failPortalField(
              document.getElementById("crud-form"),
              "completionDate",
              "Indique la fecha de realización al marcar como Cumplido."
            );
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
                  completionDate: completionDate || r.completionDate || "",
                  status: nextStatus,
                  documentCode: String(form.documentCode || "").trim().toUpperCase(),
                  notes: mergeSstEvidenceRef(String(form.notes || "").trim(), form.evidenceRef)
                })
          );
          try {
            await writeAwaitServerEdit(KEYS.sstCompliance, nextList, target.id);
          } catch (err) {
            G.notify(String(err?.message || "No fue posible guardar el control SST en el servidor."), "error");
            return false;
          }
          const updatedRecord = nextList.find((r) => String(r.id) === String(target.id));
          if (updatedRecord && isComplete) {
            const renewal = await applySstRecordCompletion(updatedRecord, {
              completionDate: completionDate || updatedRecord.dueDate,
              provider: form.provider,
              documentCode: form.documentCode,
              notes: String(form.notes || "").trim(),
              evidenceRef: form.evidenceRef
            });
            if (!renewal.ok) {
              G.notify(
                String(renewal.message || "Control guardado, pero no se pudo actualizar la ficha del colaborador."),
                "error"
              );
              G.renderPortalView();
              return false;
            }
          }
          if (updatedRecord && typeof G.logPortalAuditEvent === "function") {
            G.logPortalAuditEvent("sst", "update", {
              entityId: updatedRecord.id,
              entityLabel: `${String(updatedRecord.employeeName || "Colaborador")} · ${String(updatedRecord.recordType || "Control")}`,
              summary: `${String(updatedRecord.status || "Pendiente")} · ${String(updatedRecord.provider || "Sin entidad")}`,
              at: updatedRecord.updatedAt || G.nowIso()
            });
          }
          G.notify(
            isComplete ? "Control actualizado y ficha del colaborador renovada." : "Control SST actualizado.",
            "success"
          );
          G.renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='renew-sst-control']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (G.abortUnlessCanManageSst?.()) return;
      openSstRenewalModal({
        employeeId: btn.dataset.employeeId,
        controlKey: btn.dataset.controlKey,
        recordId: btn.dataset.recordId,
        controlType: btn.dataset.controlType
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
