/**
 * Vista "Cumplimiento laboral" (RRHH / SST) — migrada desde app.js.
 * Requiere `window.AntaresPortalRuntime` (poblado en app.js antes del primer `registerLegacyPortalViews`).
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
