/**
 * Cumplimiento laboral / SST (labor-compliance): vista HTML (runtime) y listeners del portal.
 */

/**
 * Vista "Cumplimiento laboral" (RRHH / SST) — migrada desde app.js.
 * Requiere `window.AntaresPortalRuntime` (poblado desde `portal-runtime.js` antes de los `registerLegacyPortalViews` de los módulos en `modules/app/`).
 */
(function installLaborComplianceHtml() {
  function laborComplianceHtml() {
    const rt = window.AntaresPortalRuntime;
    if (!rt) return "";
    const {
      read,
      KEYS,
      IC,
      escapeHtml,
      escapeAttr,
      fieldLabel,
      renderHrAlertCards,
      emptyState,
      renderManagedCreateFormActions,
      createCollapsibleCard,
      moduleFleetHeroStrip,
      pcardWrap,
      isAdminActor
    } = rt;

    const employees = read(KEYS.payrollEmployees, []);
    const contracts = read(KEYS.contracts, []);
    const records = read(KEYS.sstCompliance, []);
    const todayTs = Date.now();
    const dueSoonDays = 30;
    const expiringContracts = contracts.filter((contract) => {
      if (!contract.endDate) return false;
      const endTs = new Date(`${contract.endDate}T12:00:00`).getTime();
      if (!Number.isFinite(endTs) || endTs < todayTs) return false;
      return (endTs - todayTs) / 86400000 <= dueSoonDays;
    });
    const missingSocialSecurity = employees.filter((employee) => !employee.eps || !employee.pensionFund || !employee.arl);
    const expiringLicenses = employees.filter((employee) => {
      if (!employee.licenseExpiry) return false;
      const expTs = new Date(`${employee.licenseExpiry}T12:00:00`).getTime();
      if (!Number.isFinite(expTs) || expTs < todayTs) return false;
      return (expTs - todayTs) / 86400000 <= dueSoonDays;
    });
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
    const sstAdminMutates = isAdminActor();
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
          ${sstAdminMutates ? `<button class="btn btn-sm btn-action" data-action="edit-sst-record" data-id="${escapeAttr(String(record.id))}">${IC.edit} Editar</button>` : ""}
          ${sstAdminMutates ? `<button class="btn btn-sm btn-reject" data-action="delete-sst-record" data-id="${escapeAttr(String(record.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
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
        help: "Empleados sin EPS, pensión o ARL en su ficha.",
        tone: missingSocialSecurity.length ? "alert" : "ok"
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
        label: "Registros documentales",
        value: records.length,
        help: "Controles SST y de cumplimiento en auditoría.",
        tone: "info"
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
    const laborHero = moduleFleetHeroStrip([
      { label: "Controles", value: records.length },
      {
        label: "Contratos por vencer",
        value: expiringContracts.length,
        tone: expiringContracts.length ? "warn" : undefined
      },
      {
        label: "SS incompleta",
        value: missingSocialSecurity.length,
        tone: missingSocialSecurity.length ? "warn" : undefined
      },
      {
        label: "Licencias prox.",
        value: expiringLicenses.length,
        tone: expiringLicenses.length ? "warn" : undefined
      }
    ]);
    return (
      laborHero +
      pcardWrap("activity", "Alertas", null, alertsBody) +
      createCollapsibleCard("create-sst-control", "shield", "Nuevo control SST / legal", null, complianceForm, "Registrar") +
      pcardWrap("file", "Auditoria documental", `${records.length} registros`, recordsTable)
    );
  }

  if (typeof window.registerLegacyPortalViews === "function") {
    window.registerLegacyPortalViews({ laborComplianceHtml });
  }
})();

function bindLaborCompliancePortalControls() {
  if (String(state.currentView || "") !== "labor-compliance" || !nodes.viewRoot) return;

  const sstComplianceForm = document.getElementById("form-sst-compliance");
  if (sstComplianceForm) {
    wireFormSubmitGuard(sstComplianceForm, async (event) => {
      const data = readFormEntriesNormalized(sstComplianceForm);
      const employee = read(KEYS.payrollEmployees, []).find((item) => String(item.id) === String(data.employeeId || ""));
      if (!employee) {
        notify(userMessage("sstPickEmployee"), "error");
        return;
      }
      const dueDate = String(data.dueDate || "");
      if (!dueDate) {
        notify(userMessage("sstDueDateRequired"), "error");
        return;
      }
      const list = read(KEYS.sstCompliance, []);
      list.unshift({
        id: newUuidV4(),
        employeeId: employee.id,
        employeeName: employee.name,
        recordType: String(data.recordType || "").trim(),
        provider: String(data.provider || "").trim(),
        dueDate,
        status: String(data.status || "Pendiente"),
        documentCode: String(data.documentCode || "").trim().toUpperCase(),
        notes: String(data.notes || "").trim(),
        createdAt: nowIso(),
        createdBy: currentUser()?.name || "Sistema"
      });
      try {
        await writeAwaitServer(KEYS.sstCompliance, list);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el registro SST en el servidor."), "error");
        return;
      }
      notify(userMessage("sstRecorded"), "success");
      collapseCreatePanel("create-sst-control");
      renderPortalView();
    });
  }

  const renderDetailRows = portalDetailRenderRows;
  const buildDetailGrid = portalDetailBuildGrid;
  const fmtDateOr = (val, fallback = "—") => {
    const y = normalizePortalDateYmd(val);
    return y ? escapeHtml(y) : fallback;
  };

  /* ============= SST / CUMPLIMIENTO: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-sst-record']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = read(KEYS.sstCompliance, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!r) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const sections = [
        {
          icon: "shield",
          title: "Control",
          rows: renderDetailRows([
            ["Tipo", `<strong>${escapeHtml(String(r.recordType || "-"))}</strong>`],
            ["Código documental", escapeHtml(String(r.documentCode || "-"))],
            ["Empleado", escapeHtml(String(r.employeeName || "-"))],
            ["Entidad / proveedor", escapeHtml(String(r.provider || "-"))],
            ["Vencimiento", fmtDateOr(r.dueDate)],
            ["Estado", escapeHtml(String(r.status || "-"))],
            ["Registrado", fmtDateOr(r.createdAt)],
            ["Responsable", escapeHtml(String(r.createdBy || "-"))]
          ])
        },
        {
          icon: "file",
          title: "Evidencia / observaciones",
          rows: r.notes
            ? `<p class="detail-note" style="white-space:pre-wrap;margin:0">${escapeHtml(String(r.notes))}</p>`
            : `<span class="muted">Sin observaciones.</span>`
        }
      ];
      openInfoModal({
        title: `Control SST · ${String(r.recordType || "")}`,
        subtitle: String(r.employeeName || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-sst-record']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const all = read(KEYS.sstCompliance, []);
      const target = normalizeSstComplianceRow(
        all.find((x) => String(x.id) === String(btn.dataset.id || ""))
      );
      if (!target) return;
      const recordTypeOpts = editModalCatalogSelectOptions(
        SST_COMPLIANCE_RECORD_TYPES,
        target.recordType
      );
      const sstStatusOpts = editModalCatalogSelectOptions(SST_COMPLIANCE_STATUSES, target.status || "Pendiente");
      openEditModal({
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
            notify(userMessage("sstDueDateRequired"), "error");
            return false;
          }
          const nextList = all.map((r) =>
              String(r.id) !== String(target.id)
                ? r
                : {
                    ...r,
                    recordType: String(form.recordType || r.recordType || "").trim(),
                    provider: String(form.provider || "").trim(),
                    dueDate: form.dueDate,
                    status: String(form.status || "Pendiente"),
                    documentCode: String(form.documentCode || "").trim().toUpperCase(),
                    notes: String(form.notes || "").trim()
                  }
            );
          try {
            await writeAwaitServer(KEYS.sstCompliance, nextList);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el control SST en el servidor."), "error");
            return false;
          }
          notify("Control SST actualizado.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-sst-record']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.sstCompliance, []).find((r) => String(r.id) === id);
      if (!target) return;
      openConfirmModal({
        title: "Eliminar control SST",
        message: `Se eliminará el control "${String(target.recordType || "")}" del expediente.`,
        confirmText: "Eliminar control",
        onConfirm: async () => {
          const ok = await removeFromPortalListAwaitServer(KEYS.sstCompliance, id);
          if (!ok) return;
          notify("Control SST eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });
}

(function registerLaborCompliancePortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["labor-compliance"] = bindLaborCompliancePortalControls;
})();