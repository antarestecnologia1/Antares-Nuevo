/**
 * Cumplimiento laboral / SST (labor-compliance): vista HTML (runtime) y listeners del portal.
 * Helpers de plantilla viven en `portal-runtime.js` hasta completar la extracción (vía `globalThis`).
 */
import { state, nodes } from "../core/store.js";
import { read, writeAwaitServer } from "../core/data-io.js";
import { KEYS } from "../core/config.js";
import { escapeHtml, escapeAttr, buildModuleCreatePanelsState } from "../core/utils.js";
import { currentUser } from "../core/auth.js";

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

(function installLaborComplianceHtml() {
  function laborComplianceHtml() {
    const IC = G.IC || {};
    /** TODO: mover fieldLabel a módulo propio (hoy en portal-runtime.js) */
    const fieldLabel = G.fieldLabel;
    const renderHrAlertCards = G.renderHrAlertCards;
    const emptyState = G.emptyState;
    const renderManagedCreateFormActions = G.renderManagedCreateFormActions;
    const createHrActionCard = G.createHrActionCard;
    const moduleFleetHeroStrip = G.moduleFleetHeroStrip;
    const pcardWrap = G.pcardWrap;
    const canManageSstModule = G.canManageSstModule;

    if (typeof fieldLabel !== "function" || typeof canManageSstModule !== "function") return "";

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
    const expiringLicenses = employees.filter((employee) =>
      isEmployeeDueWithinDays(employee, "licenseExpiry", null, dueSoonDays, { includeExpired: true })
    );
    const expiringOccupationalExams = employees.filter((employee) =>
      isEmployeeDueWithinDays(employee, "occupationalExamExpiry", "occupationalExamDate", dueSoonDays, {
        includeExpired: true
      })
    );
    const expiringInstruvialExams = employees.filter((employee) =>
      isEmployeeDueWithinDays(employee, "instruvialExamExpiry", "instruvialExamDate", dueSoonDays, {
        includeExpired: true
      })
    );
    const dueItems = collectSstDueItems(employees, records, dueSoonDays);
    const expiringSstRecords = dueItems.filter((item) => item.recordId && item.bucket !== "missing").length;
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
    const recordRows = records
      .map((record) => {
        const employee = employees.find((item) => String(item.id) === String(record.employeeId || ""));
        const stateKey = String(record.status || "Pendiente").trim().toLowerCase().replace(/\s+/g, "-");
        return `<tr data-sst-state="${escapeAttr(stateKey)}">
        <td><strong>${escapeHtml(String(record.recordType || "-"))}</strong><br><span class="muted">${escapeHtml(String(record.documentCode || "Sin código"))}</span></td>
        <td>${escapeHtml(String(employee?.name || record.employeeName || "-"))}</td>
        <td>${escapeHtml(String(record.provider || "-"))}</td>
        <td>${escapeHtml(String(record.dueDate || "-"))}</td>
        <td>${statusBadgeForCompliance(record.status, record.dueDate)}</td>
        <td>${escapeHtml(String(record.notes || "-"))}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-outline" data-action="view-sst-record" data-id="${escapeAttr(String(record.id))}">${IC.eye} Ver</button>
          ${sstCanMutate ? `<button class="btn btn-sm btn-action" data-action="edit-sst-record" data-id="${escapeAttr(String(record.id))}">${IC.edit} Editar</button>` : ""}
          ${sstCanMutate ? `<button class="btn btn-sm btn-reject" data-action="delete-sst-record" data-id="${escapeAttr(String(record.id))}" title="Eliminar control SST">${IC.trash} Eliminar</button>` : ""}
        </div></td>
      </tr>`;
      })
      .join("");
    const alertsBody = renderHrAlertCards([
      {
        icon: IC.calendar,
        label: "Contratos por vencer (30 días)",
        value: expiringContracts.length,
        help: "Anticipa la renovación o el reemplazo del personal.",
        tone: expiringContracts.length ? "warn" : "ok"
      },
      {
        icon: IC.shield,
        label: "Seguridad social incompleta",
        value: missingSocialSecurity.length,
        help: "Empleados sin EPS, pension o ARL en su ficha.",
        tone: missingSocialSecurity.length ? "alert" : "ok"
      },
      {
        icon: IC.activity,
        label: "Examen médico por vencer (30 días)",
        value: expiringOccupationalExams.length,
        help: "Colaboradores con examen ocupacional próximo a vencer o vencido.",
        tone: expiringOccupationalExams.length ? "warn" : "ok"
      },
      {
        icon: IC.truck,
        label: "Examen instruvial por vencer (30 días)",
        value: expiringInstruvialExams.length,
        help: "Colaboradores con examen instruvial próximo a vencer o vencido.",
        tone: expiringInstruvialExams.length ? "warn" : "ok"
      },
      {
        icon: IC.alertTriangle,
        label: "Licencias por vencer (30 días)",
        value: expiringLicenses.length,
        help: "Licencias de conducción próximas a expirar.",
        tone: expiringLicenses.length ? "warn" : "ok"
      },
      {
        icon: IC.file,
        label: "Controles SST por vencer",
        value: expiringSstRecords,
        help: "Registros documentales con vencimiento en los próximos 30 días.",
        tone: expiringSstRecords ? "warn" : "ok"
      },
      {
        icon: IC.clock,
        label: "Controles sin fecha",
        value: missingComplianceCount + missingSstRecords,
        help: "Colaboradores o registros SST pendientes de programar o registrar vencimiento.",
        tone: missingComplianceCount + missingSstRecords ? "alert" : "ok"
      }
    ]);
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
      ? `<div class="table-wrap"><table><thead><tr><th>Control</th><th>Empleado</th><th>Entidad</th><th>Vencimiento</th><th>Estado</th><th>Notas</th><th style="min-width:11rem">Acciones</th></tr></thead><tbody>${recordRows}</tbody></table></div>`
      : emptyState("No hay controles de cumplimiento registrados.");
    const dueItemRows = dueItems
      .map((item) => {
        const nameCell = `<strong>${escapeHtml(item.employeeName)}</strong><br><span class="muted">${escapeHtml(item.position)}</span>`;
        const dueDateCell = item.dueDate ? escapeHtml(item.dueDate) : '<span class="muted">Sin fecha</span>';
        const rowAttrs = item.bucket === "missing" ? ' data-sst-due-bucket="missing"' : ` data-sst-due-days="${escapeAttr(String(item.days))}"`;
        return `<tr${rowAttrs}>
        <td>${escapeHtml(item.controlType)}</td>
        <td>${nameCell}</td>
        <td>${dueDateCell}</td>
        <td>${sstDueStatusBadge(item)}</td>
      </tr>`;
      })
      .join("");
    const dueItemsTable = dueItemRows
      ? `<div class="table-wrap"><table><thead><tr><th>Control</th><th>Empleado</th><th>Vencimiento</th><th>Estado</th></tr></thead><tbody>${dueItemRows}</tbody></table></div>`
      : emptyState("No hay vencimientos próximos ni controles sin fecha registrada.");
    const laborHero = moduleFleetHeroStrip([
      { label: "Controles", value: records.length },
      {
        label: "Exam. médico prox.",
        value: expiringOccupationalExams.length,
        tone: expiringOccupationalExams.length ? "warn" : undefined
      },
      {
        label: "Exam. instruvial prox.",
        value: expiringInstruvialExams.length,
        tone: expiringInstruvialExams.length ? "warn" : undefined
      },
      {
        label: "Licencias prox.",
        value: expiringLicenses.length,
        tone: expiringLicenses.length ? "warn" : undefined
      },
      {
        label: "Sin fecha",
        value: missingComplianceCount + missingSstRecords,
        tone: missingComplianceCount + missingSstRecords ? "alert" : undefined
      },
      {
        label: "Vencimientos",
        value: dueItems.length,
        tone: dueItems.length ? "warn" : undefined
      }
    ]);
    const sstCreateUi = buildModuleCreatePanelsState(["create-sst-control"], "create-sst-control", state.createPanels || {});
    return `<section class="sst-studio">${laborHero}${pcardWrap("activity", "Alertas", null, alertsBody)}${pcardWrap("alertTriangle", "Vencimientos y pendientes", `${dueItems.length} ítems`, dueItemsTable)}${createHrActionCard("create-sst-control", "shield", "Nuevo control SST / legal", "Registre obligaciones, vencimientos y evidencias de cumplimiento", complianceForm, "Abrir formulario", { createPanels: sstCreateUi })}${pcardWrap("file", "Auditoría documental", `${records.length} registros`, recordsTable)}</section>`;
  }

  if (typeof window.registerLegacyPortalViews === "function") {
    window.registerLegacyPortalViews({ laborComplianceHtml });
  }
})();

function bindLaborCompliancePortalControls() {
  if (String(state.currentView || "") !== "labor-compliance" || !nodes.viewRoot) return;

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
