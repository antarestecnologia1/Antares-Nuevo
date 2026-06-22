/**
 * Gestión humana — listeners post-render (bindPayrollPortalControls).
 */
function switchPayrollLiquidationModePanels(root, mode) {
  if (!root) return false;
  const tabs = [...root.querySelectorAll("[data-action='payroll-liquidation-mode']")];
  if (!tabs.length) return false;
  const next = String(mode || "single").toLowerCase() === "bulk" ? "bulk" : "single";
  tabs.forEach((btn) => {
    const active = String(btn.dataset.mode || "") === next;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  let matched = false;
  root.querySelectorAll("[data-payroll-liquidation-pane]").forEach((pane) => {
    const paneMode = String(pane.getAttribute("data-payroll-liquidation-pane") || "");
    const show = paneMode === next;
    pane.classList.toggle("hidden", !show);
    pane.toggleAttribute("hidden", !show);
    pane.setAttribute("aria-hidden", show ? "false" : "true");
    if (show) matched = true;
  });
  const visiblePane = root.querySelector(`[data-payroll-liquidation-pane="${next}"]:not(.hidden)`);
  if (visiblePane) {
    window.AntaresValidation?.upgradePortalDateFields?.(visiblePane);
    window.AntaresValidation?.resyncPortalDateValuesInRoot?.(visiblePane);
  }
  if (next === "bulk") wirePayrollBulkPreview();
  return matched;
}

function payrollCreateFormSubmitOpts(formEl, { busyText, submitButton, extra = [], wireKey } = {}) {
  const collectFn =
    typeof collectManagedCreateFormLockButtons === "function"
      ? collectManagedCreateFormLockButtons
      : (el, extras) => [...extras].filter(Boolean);
  const opts = {
    busyText: String(busyText || "").trim(),
    lockExtraButtons: collectFn(formEl, extra)
  };
  if (submitButton) opts.submitButton = submitButton;
  if (wireKey) opts.wireKey = wireKey;
  return opts;
}

function wirePayrollBulkPreview() {
  const fechaEl = document.getElementById("payroll-bulk-fecha");
  const forceEl = document.getElementById("payroll-bulk-force");
  const previewEl = document.getElementById("payroll-bulk-preview");
  if (!fechaEl || !previewEl || typeof previewPayrollBulkEligibility !== "function") return;

  const render = () => {
    const fechaReferencia = readFormDateIso(document, "payroll-bulk-fecha") || String(fechaEl.value || "").trim();
    if (!fechaReferencia) {
      previewEl.innerHTML = "";
      return;
    }
    const force = Boolean(forceEl?.checked);
    const employees = read(KEYS.payrollEmployees, []);
    const runs = read(KEYS.payrollRuns, []);
    const { eligible, skipped, total, details } = previewPayrollBulkEligibility(fechaReferencia, force, employees, runs);
    const samples = (details || [])
      .map((d) => `<li>${escapeHtml(d.name)} · ${escapeHtml(formatPayrollPeriodLabel(d.periodKey))}</li>`)
      .join("");
    previewEl.innerHTML = `<div class="payroll-bulk-preview__summary">
      <strong>${eligible}</strong> de <strong>${total}</strong> colaborador${total === 1 ? "" : "es"} recibirán liquidación
      ${skipped > 0 ? `<span class="muted">(${skipped} omitido${skipped === 1 ? "" : "s"}: sin corte en esa fecha o ya liquidados)</span>` : ""}
    </div>${samples ? `<ul class="payroll-bulk-preview__list">${samples}</ul>` : ""}`;
  };

  if (fechaEl.dataset.bulkPreviewBound !== "1") {
    fechaEl.dataset.bulkPreviewBound = "1";
    fechaEl.addEventListener("change", render);
    forceEl?.addEventListener("change", render);
  }
  render();
}

function focusPayrollEmployeeLiquidations(employeeId, opts = {}) {
  const empId = String(employeeId || "").trim();
  if (!empId) return;
  const section =
    String(opts.dataSection || "runs").trim() === "driverPayments" ? "driverPayments" : "runs";
  const status = String(opts.status || "all").trim().toLowerCase();
  state.payrollFilters = {
    ...defaultPayrollFilters(),
    employee: empId,
    status: status === "pending" ? "pending" : "all",
    period: "all",
    frequency: "all"
  };
  state.payrollUi = {
    ...(state.payrollUi || { runSort: "recent" }),
    workspace: "data",
    dataSection: normalizePayrollDataSection(section)
  };
  state.payrollRunsRenderLimit = RENDER_WINDOW_SIZE;
  persistHrWorkspace("payroll", "data");
  document.getElementById("crud-modal")?.classList.add("hidden");
  renderPortalView();
  requestAnimationFrame(() => {
    const pane = nodes.viewRoot?.querySelector(`[data-payroll-section="${section}"]`);
    pane?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function wirePayrollEmployeeLiquidationActions(root) {
  const scope = root || nodes.viewRoot;
  if (!scope) return;
  scope.querySelectorAll("[data-action='payroll-focus-employee-runs']").forEach((btn) => {
    if (btn.dataset.payrollFocusBound === "1") return;
    btn.dataset.payrollFocusBound = "1";
    btn.addEventListener("click", () => {
      focusPayrollEmployeeLiquidations(btn.dataset.employeeId, {
        dataSection: btn.dataset.payrollSection || "runs",
        status: btn.dataset.status || "all"
      });
    });
  });
  scope.querySelectorAll("[data-action='payroll-employee-liquidations']").forEach((btn) => {
    if (btn.dataset.payrollFocusBound === "1") return;
    btn.dataset.payrollFocusBound = "1";
    btn.addEventListener("click", () => {
      const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(btn.dataset.id || ""));
      const section = emp && employeeIsConductorServiceProvider(emp) ? "driverPayments" : "runs";
      focusPayrollEmployeeLiquidations(btn.dataset.id, { dataSection: section });
    });
  });
  scope.querySelectorAll("[data-action='payroll-clear-employee-filter']").forEach((btn) => {
    if (btn.dataset.payrollClearBound === "1") return;
    btn.dataset.payrollClearBound = "1";
    btn.addEventListener("click", () => {
      state.payrollFilters = { ...(state.payrollFilters || defaultPayrollFilters()), employee: "" };
      state.payrollRunsRenderLimit = RENDER_WINDOW_SIZE;
      renderPortalView();
    });
  });
}

function bindPayrollPayslipButtons(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-action='payslip']").forEach((btn) => {
    if (btn.dataset.payrollPayslipBound === "1") return;
    btn.dataset.payrollPayslipBound = "1";
    btn.addEventListener("click", () => void openPayrollRunPayslipById(String(btn.dataset.id || "")));
  });
}

async function openPayrollRunPayslipById(runId) {
  const id = String(runId || "").trim();
  if (!id) return;
  let run = read(KEYS.payrollRuns, []).find((r) => String(r.id) === id);
  if (!run) return;
  if (portalCanRefreshFromApi()) {
    const hydrated = await ensurePayrollRunHeavyJsonLoaded(id);
    if (hydrated) run = hydrated;
  }
  const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === run.employeeId);
  const company = employee ? getCompanyById(employee.companyId) : null;
  const pop = window.open("", "_blank", "width=720,height=900");
  if (!pop) return;
  const netStr = `$${parseNum(run.net).toLocaleString("es-CO")}`;
  const isTerm = String(run.payrollKind || "mensual") === "terminacion";
  const workedDays = parseNum(
    run.workedDays ??
      run?.noveltiesDetail?.colillaPagoDiasLaborados?.diasLaborados ??
      run?.noveltiesDetail?.diasServicioEnCorteCalendario ??
      0
  );
  const workedDaysPaymentCop = parseNum(
    run.workedDaysPaymentCop ?? run?.noveltiesDetail?.colillaPagoDiasLaborados?.pagoDiasLaboradosCop ?? 0
  );
  const paidAtLabel = run?.paidAt ? fmtDate(run.paidAt) : "-";
  const logoSrc = payrollDocumentLogoUrl(company);
  const logoAlt = `Logo de ${String(company?.name || "Transportes Antares")}`;
  const cleanSlipText = (value) =>
    String(value ?? "")
      .replace(/^\s*[A-Z]?\d{4,}\s*[-.:]\s*/i, "")
      .replace(/^\s*\d{4,}\s+/i, "")
      .trim();
  const causeLabels = {
    renuncia_voluntaria: "Renuncia voluntaria",
    despido_sin_justa: "Despido sin justa causa",
    despido_justa: "Despido con justa causa",
    mutuo_acuerdo: "Mutuo acuerdo",
    vencimiento_contrato: "Vencimiento de contrato",
    otro: "Otro"
  };
  const fmtPay = (v) => `$${parseNum(v).toLocaleString("es-CO")}`;
  const cL = "padding:8px;border-bottom:1px solid #e9ecef";
  const cR = "padding:8px;border-bottom:1px solid #e9ecef;text-align:right;font-variant-numeric:tabular-nums";
  const theadP = `<thead><tr style="background:#E8EEF5"><th style="text-align:left;padding:8px">Concepto</th><th style="text-align:right;padding:8px">Valor (COP)</th></tr></thead>`;

  let payslipBodyBlocks = "";
  if (isTerm && run.settlementDetail && typeof run.settlementDetail === "object") {
    const sd = run.settlementDetail;
    const slipLines = Array.isArray(sd.devengosLines) ? sd.devengosLines : [];
    let devRows = "";
    if (slipLines.length) {
      devRows = slipLines
        .filter((L) => parseNum(L.amount) > 0 || L.code === "SALARIO_PENDIENTE")
        .map(
          (L) =>
            `<tr><td style="${cL}">${escapeHtml(String(L.label || L.code || "Concepto"))}</td><td style="${cR}">${fmtPay(L.amount)}</td></tr>`
        )
        .join("");
    } else {
      const salP = parseNum(sd.salarioPendiente);
      const auxP = parseNum(sd.auxilioPendiente);
      devRows =
        (salP > 0
          ? `<tr><td style="${cL}">Salario pendiente mes de retiro</td><td style="${cR}">${fmtPay(salP)}</td></tr>`
          : "") +
        (auxP > 0
          ? `<tr><td style="${cL}">Auxilio de transporte proporcional</td><td style="${cR}">${fmtPay(auxP)}</td></tr>`
          : "") +
        `<tr><td style="${cL}"><strong>Cesantías (causadas + fondo)</strong></td><td style="${cR}"><strong>${fmtPay(sd.cesantias)}</strong></td></tr>` +
        `<tr><td style="${cL}">Intereses cesantías (${CO_CESANTIAS_INTERES_ANUAL_PCT}% Ley 52/1975)</td><td style="${cR}">${fmtPay(sd.interesesCesantias)}</td></tr>` +
        `<tr><td style="${cL}">Prima proporcional (CST)</td><td style="${cR}">${fmtPay(sd.primaProporcional)}</td></tr>` +
        `<tr><td style="${cL}">Vacaciones compensadas</td><td style="${cR}">${fmtPay(sd.vacaciones)}</td></tr>` +
        (parseNum(sd.indemnizacionDespido) > 0
          ? `<tr><td style="${cL}">Indemnización despido sin justa causa (CST art. 64)</td><td style="${cR}">${fmtPay(sd.indemnizacionDespido)}</td></tr>`
          : "") +
        (parseNum(sd.indemnizacionAviso) > 0
          ? `<tr><td style="${cL}">Indemnización sustitutiva aviso previo</td><td style="${cR}">${fmtPay(sd.indemnizacionAviso)}</td></tr>`
          : "") +
        (parseNum(sd.otrosSettlement) > 0
          ? `<tr><td style="${cL}">Otros conceptos</td><td style="${cR}">${fmtPay(sd.otrosSettlement)}</td></tr>`
          : "");
    }
    devRows += `<tr><td style="${cL}"><strong>Total devengos liquidación</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;

    const ded = parseNum(run.deductions);
    const dedLines = Array.isArray(sd.deductionsLines) ? sd.deductionsLines : [];
    let dedRows = "";
    if (dedLines.length) {
      dedRows = dedLines
        .map(
          (L) =>
            `<tr><td style="${cL}">${escapeHtml(String(L.label || L.code))}</td><td style="${cR}">${fmtPay(L.amount)}</td></tr>`
        )
        .join("");
      dedRows += `<tr><td style="${cL}"><strong>Total deducciones</strong></td><td style="${cR}"><strong>${fmtPay(ded)}</strong></td></tr>`;
    } else if (ded > 0) {
      dedRows =
        `<tr><td style="${cL}">Salud empleado</td><td style="${cR}">${fmtPay(run.health)}</td></tr>` +
        `<tr><td style="${cL}">Pensión empleado</td><td style="${cR}">${fmtPay(run.pension)}</td></tr>` +
        (parseNum(run.withholding) > 0
          ? `<tr><td style="${cL}">Retención Proc. 1 (Art. 383)</td><td style="${cR}">${fmtPay(run.withholding)}</td></tr>`
          : "") +
        `<tr><td style="${cL}"><strong>Total deducciones</strong></td><td style="${cR}"><strong>${fmtPay(ded)}</strong></td></tr>`;
    } else {
      dedRows = `<tr><td colspan="2" style="padding:8px;color:#495057;font-size:0.88rem">Sin deducciones registradas.</td></tr>`;
    }
    const checklist = Array.isArray(sd.finiquitoChecklist) ? sd.finiquitoChecklist : [];
    const checklistBlock = checklist.length
      ? `<h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">III. Checklist legal post-liquidación</h2>
          <ul style="margin:0 0 1rem 1.1rem;font-size:0.86rem;color:#495057;line-height:1.5">${checklist.map((x) => `<li>${escapeHtml(String(x))}</li>`).join("")}</ul>`
      : "";

    payslipBodyBlocks = `
          <h2 style="font-size:1rem;margin:1.25rem 0 0.35rem">I. Devengos (finiquito / liquidación)</h2>
          <p style="margin:0 0 0.5rem;font-size:0.86rem;color:#495057">Ítems típicos por terminación conforme ordenamiento laboral colombiano (valores editables en el registro del sistema).</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${devRows}</tbody></table>
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">II. Deducciones</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${dedRows}</tbody></table>
          ${checklistBlock}
          <table style="width:100%;border-collapse:collapse;font-size:0.95rem;margin-top:0.5rem"><tbody>
            <tr><td style="padding:12px 8px"><strong>Total neto a consignar / pagar</strong></td><td style="padding:12px 8px;text-align:right;font-size:1.12rem"><strong>${netStr}</strong></td></tr>
          </tbody></table>`;
  } else {
    const linesFromRun = resolvePayrollDevengosLines(run);
    const baseInt = parseNum(run.cesantiasInterestBaseCop);
    const diasInt = run.cesantiasInterestDays != null ? run.cesantiasInterestDays : "—";
    const intLabel =
      baseInt > 0
        ? `Intereses sobre cesantías (${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual Ley 52/1975; base ref. ${fmtPay(baseInt)}, ${diasInt} días/360)`
        : `Intereses sobre cesantías (${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual Ley 52/1975)`;

    let devRowsMes;
    if (linesFromRun && linesFromRun.length) {
      const showLine = (L) => {
        const code = String(L.code || "");
        if (code.startsWith("INCAPACIDAD")) return true;
        const a = parseNum(L.amount);
        return a > 0 || code === "SALARIO_ORDINARIO" || code === "AUXILIO_TRANSPORTE";
      };
      devRowsMes = linesFromRun
        .filter(showLine)
        .map((L) => {
          let labelHtml = escapeHtml(cleanSlipText(String(L.label || L.code || "Concepto")));
          if (L.code === "PRIMA_SERVICIOS") {
            labelHtml = escapeHtml(
              `Prima de servicios semestral (CST arts. 244–249 — ${run.primaServiciosDays ?? "—"} días semestre)`
            );
          }
          if (L.code === "INT_CESANTIAS" && parseNum(L.amount) > 0) {
            labelHtml = escapeHtml(intLabel);
          }
          if (L.incapacityNote) {
            labelHtml += `<span style="font-size:0.82rem;color:#6c757d;display:block;margin-top:3px;line-height:1.35">${escapeHtml(String(L.incapacityNote))}</span>`;
          }
          return `<tr><td style="${cL}">${labelHtml}</td><td style="${cR}">${fmtPay(L.amount)}</td></tr>`;
        })
        .join("");
      devRowsMes += `<tr><td style="${cL}"><strong>Total devengos del período</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;
    } else {
      const ex = parseNum(run.extras);
      const au = parseNum(run.aux);
      const bo = parseNum(run.bonus);
      const via = parseNum(run.travelAllowance);
      const comb = parseNum(run.fuelReimbursement);
      const prima = parseNum(run.primaServiciosCop);
      const intCe = parseNum(run.interesesCesantiasCop);
      const salarioBasicoDevengo = Math.max(0, parseNum(run.gross) - ex - au - bo - via - comb - prima - intCe);
      devRowsMes =
        `<tr><td style="${cL}">Salario básico mensual (devengo ordinario)</td><td style="${cR}">${fmtPay(salarioBasicoDevengo)}</td></tr>` +
        (ex > 0
          ? `<tr><td style="${cL}">Horas extras, dominicales o recargos nocturnos</td><td style="${cR}">${fmtPay(ex)}</td></tr>`
          : "") +
        `<tr><td style="${cL}">Auxilio legal de transporte (no constitutivo de salario)</td><td style="${cR}">${fmtPay(au)}</td></tr>` +
        (bo > 0
          ? `<tr><td style="${cL}">Bonificaciones y pagos ocasionales gravables (devengo)</td><td style="${cR}">${fmtPay(bo)}</td></tr>`
          : "") +
        `<tr><td style="${cL}">Viáticos y anticipos de viaje (reintegro / no salario)</td><td style="${cR}">${fmtPay(via)}</td></tr>` +
        `<tr><td style="${cL}">Reembolso combustible y gastos de ruta deducibles</td><td style="${cR}">${fmtPay(comb)}</td></tr>` +
        (prima > 0
          ? `<tr><td style="${cL}">Prima de servicios semestral (CST arts. 244–249 — ${run.primaServiciosDays ?? "—"} días semestre)</td><td style="${cR}">${fmtPay(prima)}</td></tr>`
          : "") +
        (intCe > 0 ? `<tr><td style="${cL}">${escapeHtml(intLabel)}</td><td style="${cR}">${fmtPay(intCe)}</td></tr>` : "") +
        `<tr><td style="${cL}"><strong>Total devengos del período</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;
    }

    const isTripPrestacion = payrollRunFrequencyKind(run) === "prestacion_viajes";
    const dedRowsMes = isTripPrestacion
      ? `<tr><td style="${cL}" colspan="2">Prestación de servicios: sin aportes de salud, pensión ni FSP en este comprobante (pago por viajes).</td></tr>` +
        `<tr><td style="${cL}"><strong>Total deducciones</strong></td><td style="${cR}"><strong>${fmtPay(run.deductions)}</strong></td></tr>`
      : `<tr><td style="${cL}">Salario integral de cotización — IBC (base aportes empleador/empleado)</td><td style="${cR}">${fmtPay(run.ibc)}</td></tr>` +
        `<tr><td style="${cL}">Aporte obligatorio salud — empleado (${(CO_PAYROLL.healthEmployeeRate * 100).toFixed(2).replace(/\.00$/, "")}% sobre IBC)</td><td style="${cR}">${fmtPay(run.health)}</td></tr>` +
        `<tr><td style="${cL}">Aporte pensión obligatoria — empleado (${(CO_PAYROLL.pensionEmployeeRate * 100).toFixed(2).replace(/\.00$/, "")}% sobre IBC)</td><td style="${cR}">${fmtPay(run.pension)}</td></tr>` +
        `<tr><td style="${cL}">Fondo de solidaridad pensional FSP (cuando aplique rangos Ley 797/2003)</td><td style="${cR}">${fmtPay(run.solidarity)}</td></tr>` +
        `<tr><td style="${cL}"><strong>Total deducciones al empleado</strong></td><td style="${cR}"><strong>${fmtPay(run.deductions)}</strong></td></tr>`;
    const workedDaysRows =
      workedDays > 0 || workedDaysPaymentCop > 0
        ? `<tr><td style="${cL}">Pago por días laborados (${workedDays.toLocaleString("es-CO")} días)</td><td style="${cR}">${fmtPay(workedDaysPaymentCop)}</td></tr>`
        : `<tr><td style="${cL}" colspan="2">Sin detalle de días laborados para este comprobante.</td></tr>`;

    payslipBodyBlocks = `
          <h2 style="font-size:1rem;margin:1.25rem 0 0.35rem">I. Devengos e ingresos período</h2>
          <p style="margin:0 0 0.45rem;font-size:0.86rem;color:#495057">${
            isTripPrestacion
              ? "Pago por prestación de servicios (viajes interdepartamentales y reembolsos de ruta)."
              : "Ingresos y conceptos pagados por el empleador; prima e intereses de cesantías solo si se liquidaron en este comprobante."
          }</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${devRowsMes}</tbody></table>
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">II. Deducciones (aportes del trabajador)</h2>
          <p style="margin:0 0 0.45rem;font-size:0.86rem;color:#495057">Descuentos legales incidentes sobre nómina; prima e intereses de cesantías no integran habitualmente esta base de cotización en este modelo simplificado.</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${dedRowsMes}</tbody></table>
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">III. Resumen de días laborados</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${workedDaysRows}</tbody></table>
          <table style="width:100%;border-collapse:collapse;font-size:0.95rem;margin-top:0.5rem"><tbody>
            <tr><td style="padding:12px 8px"><strong>Neto pagado / a pagar al trabajador</strong></td><td style="padding:12px 8px;text-align:right;font-size:1.12rem"><strong>${netStr}</strong></td></tr>
          </tbody></table>`;
  }
  const docTitle =
    isTerm && run.settlementDetail && typeof run.settlementDetail === "object"
      ? `Liquidación contractual ${run.employeeName}`
      : `Desprendible ${run.employeeName}`;
  const h1Title = isTerm ? "Liquidación contractual" : "Desprendible de nómina";
  let metaExtra = "";
  if (isTerm && run.settlementDetail && typeof run.settlementDetail === "object") {
    const sd = run.settlementDetail;
    metaExtra += `<tr><td style="padding:4px 0"><strong>Fecha terminación</strong></td><td>${escapeHtml(String(sd.terminationDate || "-"))}</td></tr>`;
    metaExtra += `<tr><td style="padding:4px 0"><strong>Motivo</strong></td><td>${escapeHtml(String(causeLabels[sd.terminationCause] || sd.terminationCause || "-"))}</td></tr>`;
  }
  const absenceDetailRows = !isTerm ? resolvePayrollAbsenceSlipRows(run, read(KEYS.hrAbsences, [])) : [];
  const absenceDetailBlock = absenceDetailRows.length
    ? `
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">IV. Detalle de ausentismo</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">
            <thead>
              <tr style="background:#F5F7FA">
                <th style="text-align:left;padding:8px">Ausentismo</th>
                <th style="text-align:left;padding:8px">Concepto</th>
                <th style="text-align:right;padding:8px">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${absenceDetailRows
                .map(
                  (row) =>
                    `<tr><td style="${cL}">${escapeHtml(cleanSlipText(String(row.typeLabel || "Ausentismo")))}</td><td style="${cL}">${escapeHtml(cleanSlipText(String(row.conceptLabel || "")))}</td><td style="${cR}">${escapeHtml(payrollFormatAbsenceQuantity(row.quantity))}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>`
    : "";
  const disclaimerPieces = [];
  if (!isTerm) {
    const ori = String(run.liquidacionOrigin || run.origenLiquidacion || "manual").toLowerCase();
    if (ori === "masiva") {
      disclaimerPieces.push(
        "Liquidación generada por liquidación masiva (RRHH). Validar incapacidades, vacaciones, viáticos de ruta y bases de cotización con contador antes del pago."
      );
    } else if (ori === "automatica") {
      disclaimerPieces.push(
        "Liquidación generada automáticamente en servidor (cron diario, calendario Bogotá). Validar incapacidades, vacaciones y bases de cotización con RRHH y contador."
      );
      const nv = run.noveltiesDetail;
      if (nv && typeof nv === "object" && Array.isArray(nv.disclaimers)) {
        const top = nv.disclaimers.slice(0, 2).map((x) => String(x)).join(" ");
        if (top) disclaimerPieces.push(top);
      }
    }
    if (parseNum(run.primaServiciosCop) > 0)
      disclaimerPieces.push("Prima de servicios (CST): cálculo orientativo; validar política empresarial y contador.");
    if (parseNum(run.interesesCesantiasCop) > 0)
      disclaimerPieces.push(
        `Intereses de cesantías (Ley 52/1975, ${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual): el texto legal establece que deben pagarse al trabajador en enero del año siguiente al período causado (y reglas especiales en retiros o ceses antes de ese cierre). Lo habitual es liquidarlos con la nómina de enero del año siguiente o, si su política lo retrasa hasta febrero, documente ese desfase con contador para no omitir obligaciones ya exigidas.`
      );
    const incNv = run.noveltiesDetail?.incapacity;
    if (incNv && Array.isArray(incNv.episodes) && incNv.episodes.length) {
      disclaimerPieces.push(
        String(incNv.legalNote || "Incapacidad: montos orientativos en este comprobante; valide con EPS/ARL y contador.")
      );
    }
  }
  const disclaimer =
    isTerm && run.settlementDetail && typeof run.settlementDetail === "object" && run.settlementDetail.legalDisclaimer
      ? `<p style="font-size:0.82rem;color:#495057;margin-top:1rem;line-height:1.45">${escapeHtml(String(run.settlementDetail.legalDisclaimer))}</p>`
      : disclaimerPieces.length
        ? `<p style="font-size:0.82rem;color:#495057;margin-top:1rem;line-height:1.45">${escapeHtml(disclaimerPieces.join(" "))}</p>`
        : "";
  const employeeMetaRows = [
    { label: "Tipo de contrato", value: String(employee?.contractType || "-") },
    { label: "Periodicidad de pago", value: String(employee?.payFrequency || "-") },
    { label: "Centro de costos", value: String(resolvePayrollEmployeeCostCenter(employee) || "-") },
    {
      label: "Banco",
      value:
        employee?.bankName && employee?.bankAccount
          ? `${String(employee.bankName)} · ${String(employee.bankAccountType || "Cuenta")} ${String(employee.bankAccount)}`
          : "-"
    },
    {
      label: "Salario básico",
      value: employee?.baseSalary != null ? `$${parseNum(employee.baseSalary).toLocaleString("es-CO")}` : "-"
    },
    { label: "IBC (base de cotización)", value: `$${parseNum(run.ibc || 0).toLocaleString("es-CO")}` }
  ]
    .map(
      (row) =>
        `<tr><td style="padding:4px 0"><strong>${escapeHtml(row.label)}</strong></td><td>${escapeHtml(
          cleanSlipText(String(row.value || "-"))
        )}</td></tr>`
    )
    .join("");
  pop.document.write(`
        <html><head><meta charset="utf-8"/><title>${escapeHtml(docTitle)}</title></head>
        <body style="font-family:system-ui,Segoe UI,Arial,sans-serif;padding:28px;color:#0B1D33;line-height:1.5">
          <div style="border-bottom:2px solid #0B1D33;padding-bottom:12px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:18px">
            <div style="min-width:0;flex:1 1 auto">
              <h1 style="margin:0;font-size:1.35rem">${escapeHtml(h1Title)}</h1>
              <p style="margin:0.35rem 0 0;font-size:0.9rem;color:#495057">${escapeHtml(String(company?.name || "Transportes Antares"))}</p>
            </div>
            <div style="width:94px;min-width:94px;height:94px;border-radius:18px;background:#fff;border:1px solid #d7e5f3;padding:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(11,33,56,0.10)">
              <img src="${escapeAttr(logoSrc)}" alt="${escapeAttr(logoAlt)}" style="width:100%;height:100%;object-fit:contain;display:block" />
            </div>
          </div>
          <table style="width:100%;font-size:0.92rem;margin-bottom:1.2rem">
            <tr><td style="padding:4px 0"><strong>Empleador</strong></td><td>${escapeHtml(String(company?.name || "Antares"))}</td></tr>
            <tr><td style="padding:4px 0"><strong>Trabajador</strong></td><td>${escapeHtml(String(run.employeeName || ""))}</td></tr>
            <tr><td style="padding:4px 0"><strong>Documento</strong></td><td>${escapeHtml(String(employee?.idDoc || "-"))}</td></tr>
            <tr><td style="padding:4px 0"><strong>Cargo</strong></td><td>${escapeHtml(String(employee?.position || "-"))}</td></tr>
            <tr><td style="padding:4px 0"><strong>Periodo registrado</strong></td><td>${escapeHtml(String(run.month || ""))}</td></tr>
            ${(() => {
              const generatedBy = payrollRunGeneratedByLabel(run);
              return generatedBy
                ? `<tr><td style="padding:4px 0"><strong>Generado por</strong></td><td>${escapeHtml(generatedBy)}</td></tr>`
                : "";
            })()}
            ${employeeMetaRows}
            ${metaExtra}
            <tr><td style="padding:4px 0"><strong>Estado</strong></td><td>${run.paid ? "Pagado" : "Pendiente de pago"}</td></tr>
            <tr><td style="padding:4px 0"><strong>Fecha de pago</strong></td><td>${escapeHtml(String(paidAtLabel))}</td></tr>
            ${run.paid && run.approvedBy ? `<tr><td style="padding:4px 0"><strong>Aprobado por</strong></td><td>${escapeHtml(String(run.approvedBy))}</td></tr>` : ""}
          </table>
          <h2 style="font-size:1rem;margin:1.05rem 0 0">Comprobante de pago</h2>
          ${payslipBodyBlocks}
          ${absenceDetailBlock}
          ${disclaimer}
          <p style="margin-top:1.5rem"><button onclick="window.print()" style="padding:10px 18px;border-radius:8px;border:none;background:#0B1D33;color:#fff;cursor:pointer">Imprimir / PDF</button></p>
        </body></html>
      `);
  pop.document.close();
}

function bindPayrollPortalControls() {
  if (typeof scheduleContractRenewalNotificationCheck === "function") {
    scheduleContractRenewalNotificationCheck();
  }
  if (String(state.currentView || "") !== "payroll" || !nodes.viewRoot) return;


  nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='payroll']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.tab || "");
      if (!tab) return;
      const ws = normalizeHrWorkspace("payroll", tab);
      if (!HR_VALID_PAYROLL_WS.has(ws)) return;
      if (normalizeHrWorkspace("payroll", state.payrollUi?.workspace) === ws) return;
      state.payrollUi = { ...(state.payrollUi || {}), workspace: ws };
      persistHrWorkspace("payroll", ws);
      if (ws === "data" && portalCanRefreshFromApi()) {
        void applyPortalBootstrapFromApi().then((ok) => {
          if (ok) scheduleRenderPortalView();
        });
      }
      renderPortalView();
    });
  });
  nodes.viewRoot.querySelectorAll("[data-action='payroll-runs-render-more']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollRunsRenderLimit = (Number(state.payrollRunsRenderLimit) || RENDER_WINDOW_SIZE) + RENDER_WINDOW_SIZE;
      renderPortalView();
    });
  });

  const payrollFiltersForm = document.getElementById("payroll-filters");
  if (payrollFiltersForm) {
    payrollFiltersForm.querySelectorAll("select").forEach((select) => {
      select.addEventListener("change", () => {
        state.payrollFilters = state.payrollFilters || defaultPayrollFilters();
        const key = String(select.name || "");
        if (!key) return;
        state.payrollFilters[key] = String(select.value || "");
        state.payrollRunsRenderLimit = RENDER_WINDOW_SIZE;
        renderPortalView();
      });
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='payroll-clear-filters']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollFilters = defaultPayrollFilters();
      state.payrollRunsRenderLimit = RENDER_WINDOW_SIZE;
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-focus-pending']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollFilters = { ...(state.payrollFilters || {}), status: "pending" };
      state.payrollUi = { ...(state.payrollUi || {}), workspace: "data", dataSection: "runs" };
      state.payrollRunsRenderLimit = RENDER_WINDOW_SIZE;
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-focus-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollFilters = { ...(state.payrollFilters || defaultPayrollFilters()), status: "all", period: "all", frequency: "all" };
      state.payrollUi = { ...(state.payrollUi || {}), workspace: "data", dataSection: "runs" };
      state.payrollRunsRenderLimit = RENDER_WINDOW_SIZE;
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-quick-filter']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const quick = String(btn.dataset.quick || "all");
      state.payrollRunsRenderLimit = RENDER_WINDOW_SIZE;
      state.payrollFilters = state.payrollFilters || defaultPayrollFilters();
      if (quick === "pending") {
        state.payrollFilters.status = "pending";
        state.payrollFilters.period = state.payrollFilters.period || "all";
        state.payrollFilters.frequency = state.payrollFilters.frequency || "all";
      } else if (quick === "current") {
        state.payrollFilters.period = "current";
        state.payrollFilters.status = state.payrollFilters.status || "all";
        state.payrollFilters.frequency = state.payrollFilters.frequency || "all";
      } else if (quick === "mensual" || quick === "quincenal") {
        state.payrollFilters.frequency = quick;
        state.payrollFilters.status = state.payrollFilters.status || "all";
        state.payrollFilters.period = state.payrollFilters.period || "all";
      } else {
        state.payrollFilters = defaultPayrollFilters();
      }
      state.payrollUi = { ...(state.payrollUi || {}), workspace: "data", dataSection: quick === "all" ? state.payrollUi?.dataSection || "employees" : "runs" };
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-data-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizePayrollDataSection(btn.dataset.section);
      state.payrollUi = { ...(state.payrollUi || {}), dataSection: section, workspace: "data" };
      persistHrWorkspace("payroll", "data");
      switchHrWorkspacePanels({
        root: nodes.viewRoot,
        moduleId: "payroll",
        workspace: "data",
        panelAttr: "data-payroll-panel"
      });
      if (
        switchModuleTabPanels({
          root: nodes.viewRoot,
          action: "payroll-data-section",
          activeValue: section,
          panelAttr: "data-payroll-section",
          tabActiveClass: "is-active"
        })
      ) {
        syncPayrollConsultHeaderDom(nodes.viewRoot, section);
        return;
      }
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-operate-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizePayrollOperateSection(btn.dataset.section);
      const panelId = payrollCreatePanelForSection(section);
      state.payrollUi = { ...(state.payrollUi || {}), operateSection: section, workspace: "operate" };
      state.createPanels = buildPayrollCreatePanelsState(section, state.createPanels || {}, { expandActive: true });
      persistHrWorkspace("payroll", "operate");
      switchHrWorkspacePanels({
        root: nodes.viewRoot,
        moduleId: "payroll",
        workspace: "operate",
        panelAttr: "data-payroll-panel"
      });
      if (
        switchModuleTabPanels({
          root: nodes.viewRoot,
          action: "payroll-operate-section",
          activeValue: section,
          panelAttr: "data-payroll-operate-pane",
          tabActiveClass: "is-active"
        })
      ) {
        syncPayrollCreatePanelsInDom(nodes.viewRoot, panelId);
        const activePane = nodes.viewRoot.querySelector(
          `[data-payroll-operate-pane="${section}"]:not(.hidden)`
        );
        window.AntaresValidation?.upgradePortalDateFields?.(activePane || nodes.viewRoot);
        window.AntaresValidation?.resyncPortalDateValuesInRoot?.(activePane || nodes.viewRoot);
        requestAnimationFrame(() => scrollToCreatePanelForm(panelId));
        return;
      }
      renderPortalView();
      requestAnimationFrame(() => scrollToCreatePanelForm(panelId));
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-liquidation-mode']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = String(btn.dataset.mode || "single").toLowerCase() === "bulk" ? "bulk" : "single";
      state.payrollUi = { ...(state.payrollUi || {}), liquidationMode: mode, workspace: "operate", operateSection: "payroll" };
      persistHrWorkspace("payroll", "operate");
      if (switchPayrollLiquidationModePanels(nodes.viewRoot, mode)) return;
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-sort-runs']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollUi = state.payrollUi || { runSort: "recent", workspace: "operate", dataSection: "runs" };
      state.payrollUi.runSort = String(btn.dataset.sort || "recent");
      state.payrollUi.workspace = "data";
      state.payrollUi.dataSection = "runs";
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-runs-view']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = String(btn.dataset.view || "cards").toLowerCase() === "list" ? "list" : "cards";
      const ctx = String(btn.dataset.context || "nomina").toLowerCase() === "driver" ? "driverPayments" : "runs";
      state.payrollUi = {
        ...(state.payrollUi || { runSort: "recent", workspace: "data", dataSection: "runs" }),
        runsView: view,
        workspace: "data",
        dataSection: ctx
      };
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-employees-view']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = String(btn.dataset.view || "list").toLowerCase() === "cards" ? "cards" : "list";
      state.payrollUi = {
        ...(state.payrollUi || { runSort: "recent", workspace: "data", dataSection: "employees" }),
        employeesView: view,
        workspace: "data",
        dataSection: "employees"
      };
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-legal-set-year']").forEach((el) => {
    const applyYearSelection = (yearLike) => {
      const year = clampLaborSystemParameterYear(yearLike);
      state.payrollLegalUi = { ...(state.payrollLegalUi || {}), year: String(year), draftOverride: null };
      state.payrollUi = { ...(state.payrollUi || {}), workspace: "data", dataSection: "legal" };
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    };
    if (el.tagName === "SELECT") {
      el.addEventListener("change", () => applyYearSelection(el.value));
      return;
    }
    el.addEventListener("click", () => applyYearSelection(el.dataset.year));
  });

  const navigatePayrollLegalYear = (yearLike, { draftOverride = null } = {}) => {
    const year = clampLaborSystemParameterYear(yearLike);
    state.payrollLegalUi = {
      ...(state.payrollLegalUi || {}),
      year: String(year),
      draftOverride: draftOverride && typeof draftOverride === "object" ? draftOverride : null
    };
    state.payrollUi = { ...(state.payrollUi || {}), workspace: "data", dataSection: "legal" };
    persistHrWorkspace("payroll", "data");
    renderPortalView();
  };

  nodes.viewRoot.querySelectorAll("[data-action='payroll-legal-new']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const history = laborSystemParametersHistoryRows();
      const lastSaved = history.reduce((max, row) => Math.max(max, Number(row?.year) || 0), 0);
      const year = clampLaborSystemParameterYear(
        Number(btn.dataset.year) || Math.max(new Date().getFullYear(), lastSaved + 1)
      );
      navigatePayrollLegalYear(year);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-legal-duplicate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const history = laborSystemParametersHistoryRows();
      if (!history.length) {
        notify("No hay vigencias previas para duplicar.", "warn");
        return;
      }
      const source = history[0];
      const lastSaved = history.reduce((max, row) => Math.max(max, Number(row?.year) || 0), 0);
      const year = clampLaborSystemParameterYear(lastSaved + 1);
      navigatePayrollLegalYear(year, {
        draftOverride: {
          smmlvCop: parseNum(source.smmlvCop),
          transportAllowanceCop: parseNum(source.transportAllowanceCop),
          healthEmployeeRate: parseNum(source.healthEmployeeRate),
          pensionEmployeeRate: parseNum(source.pensionEmployeeRate),
          uvtCop: parseNum(source.uvtCop || 0) || null,
          legalWeeklyHours: parseNum(source.legalWeeklyHours || CO_HR_RULES.legalWeeklyHours)
        }
      });
      notify(`Vigencia ${year} preparada con los valores de ${source.year}. Revise y guarde.`, "info");
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-legal-reset']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.payrollLegalUi = { ...(state.payrollLegalUi || {}), draftOverride: null };
      state.payrollUi = { ...(state.payrollUi || {}), workspace: "data", dataSection: "legal" };
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  const payrollLegalForm = nodes.viewRoot.querySelector("#form-payroll-legal-params");
  if (payrollLegalForm) {
    payrollLegalForm.setAttribute("data-antares-skip-validate", "1");
    wireFormSubmitGuard(payrollLegalForm, async () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify("Solo administradores pueden editar los parámetros legales.", "error");
        return;
      }
      const fd = new FormData(payrollLegalForm);
      const year = clampLaborSystemParameterYear(fd.get("year"));
      const smmlvCop = parseNum(fd.get("smmlvCop"));
      if (smmlvCop <= 0) {
        failPortalField(payrollLegalForm, "smmlvCop", "Indique un SMMLV válido mayor que cero.");
        return;
      }
      const transportAllowanceCop = parseNum(fd.get("transportAllowanceCop"));
      if (transportAllowanceCop < 0) {
        failPortalField(payrollLegalForm, "transportAllowanceCop", "El auxilio de transporte no puede ser negativo.");
        return;
      }
      const transportAllowanceCap = smmlvCop * CO_TRANSPORT_ALLOWANCE_MAX_SMMLV;
      if (transportAllowanceCop > transportAllowanceCap) {
        failPortalField(
          payrollLegalForm,
          "transportAllowanceCop",
          `El auxilio de transporte no puede superar 2 SMMLV ($${transportAllowanceCap.toLocaleString("es-CO")}).`
        );
        return;
      }
      const healthEmployeeRatePct = parseNum(fd.get("healthEmployeeRatePct"));
      if (healthEmployeeRatePct < 0 || healthEmployeeRatePct > 100) {
        failPortalField(payrollLegalForm, "healthEmployeeRatePct", "La tarifa de salud debe estar entre 0 y 100 %.");
        return;
      }
      const pensionEmployeeRatePct = parseNum(fd.get("pensionEmployeeRatePct"));
      if (pensionEmployeeRatePct < 0 || pensionEmployeeRatePct > 100) {
        failPortalField(payrollLegalForm, "pensionEmployeeRatePct", "La tarifa de pensión debe estar entre 0 y 100 %.");
        return;
      }
      const uvtRaw = String(fd.get("uvtCop") || "").trim();
      if (uvtRaw && parseNum(uvtRaw) <= 0) {
        failPortalField(payrollLegalForm, "uvtCop", "Si indica UVT, debe ser un valor mayor que cero.");
        return;
      }
      const legalWeeklyHours = parseNum(fd.get("legalWeeklyHours")) || CO_HR_RULES.legalWeeklyHours;
      if (legalWeeklyHours < 1 || legalWeeklyHours > 168) {
        failPortalField(payrollLegalForm, "legalWeeklyHours", "Indique horas semanales entre 1 y 168.");
        return;
      }
      const platformReferenceMode = String(fd.get("platformReferenceMode") || "automatic");
      if (platformReferenceMode === "manual" && !String(fd.get("platformReferenceYear") || "").trim()) {
        failPortalField(
          payrollLegalForm,
          "platformReferenceYear",
          "Seleccione el año de vigencia a aplicar globalmente en modo manual."
        );
        return;
      }
      const body = {
        year: Math.trunc(year),
        smmlvCop: Math.trunc(smmlvCop),
        transportAllowanceCop: Math.trunc(transportAllowanceCop),
        healthEmployeeRate: healthEmployeeRatePct / 100,
        pensionEmployeeRate: pensionEmployeeRatePct / 100,
        uvtCop: uvtRaw ? Math.trunc(parseNum(uvtRaw)) : null,
        legalWeeklyHours: Math.trunc(legalWeeklyHours),
        platformReferenceYear:
          platformReferenceMode === "manual"
            ? clampLaborSystemParameterYear(fd.get("platformReferenceYear") || year)
            : null
      };
      const submit = async () => {
        try {
          const saved = await postPortalAuthorized("/portal/labor-system-parameters", body);
          applyLaborSystemParametersApiResponse(saved);
          state.payrollLegalUi = { ...(state.payrollLegalUi || {}), year: String(year), draftOverride: null };
          state.payrollUi = { ...(state.payrollUi || {}), workspace: "data", dataSection: "legal" };
          persistHrWorkspace("payroll", "data");
          renderPortalView();
          notify(
            saved?.affectedPayrollRuns
              ? `Vigencia ${year} guardada. Se detectaron ${saved.affectedPayrollRuns} liquidaciones de ese año.`
              : `Vigencia ${year} guardada correctamente. Plataforma en ${body.platformReferenceYear ? `modo manual ${body.platformReferenceYear}` : "modo automático"}.`,
            saved?.affectedPayrollRuns ? "warn" : "success"
          );
        } catch (err) {
          notify(err?.message || "No se pudieron guardar los parámetros legales.", "error");
        }
      };
      const affectedRuns = readArray(KEYS.payrollRuns).filter((run) => String(run.month || "").startsWith(`${year}`)).length;
      if (affectedRuns > 0) {
        openConfirmModal({
          title: `Actualizar vigencia ${year}`,
          message: `Este año ya tiene ${affectedRuns} liquidación${affectedRuns === 1 ? "" : "es"} registradas. Confirme para actualizar las referencias legales sin borrar el histórico.`,
          confirmText: "Guardar vigencia",
          onConfirm: submit
        });
        return;
      }
      await submit();
    }, { busyText: "Guardando vigencia…" });
  }

  const runPayrollLegalDelete = async (yearLike) => {
    const year = clampLaborSystemParameterYear(yearLike);
    if (!year) {
      notify("Indique un año válido.", "error");
      return;
    }
    if (currentUser()?.role !== ROLES.ADMIN) {
      notify("Solo administradores pueden eliminar vigencias legales.", "error");
      return;
    }
    const affectedRuns = readArray(KEYS.payrollRuns).filter((run) => String(run.month || "").startsWith(`${year}`)).length;
    const performDelete = async () => {
      try {
        const result = await postPortalAuthorized("/portal/labor-system-parameters/delete", { year });
        applyLaborSystemParametersApiResponse(result);
        const remaining = laborSystemParametersHistoryRows();
        const fallbackYear = remaining[0]?.year ?? new Date().getFullYear();
        state.payrollLegalUi = { ...(state.payrollLegalUi || {}), year: String(fallbackYear), draftOverride: null };
        state.payrollUi = { ...(state.payrollUi || {}), workspace: "data", dataSection: "legal" };
        persistHrWorkspace("payroll", "data");
        renderPortalView();
        notify(userMessage("payrollLegalVigenciaDeleted", year), "success");
        appendModuleAuditLog({
          action: "delete",
          moduleId: "payroll",
          moduleLabel: "Gestión humana",
          entityId: String(year),
          entityLabel: `Vigencia legal ${year}`,
          summary:
            affectedRuns > 0
              ? `Parámetros legales ${year} eliminados · ${affectedRuns} liquidación(es) conservadas`
              : `Parámetros legales ${year} eliminados`
        });
      } catch (err) {
        notify(String(err?.message || userMessage("payrollLegalVigenciaDeleteFail")), "error");
      }
    };
    openConfirmModal({
      title: `Eliminar vigencia ${year}`,
      message:
        affectedRuns > 0
          ? `Se eliminarán los parámetros legales del año ${year} en base de datos. Las ${affectedRuns} liquidación${affectedRuns === 1 ? "" : "es"} de ese año no se borran; solo dejan de tener esta vigencia como referencia guardada.`
          : `Se eliminarán todos los parámetros legales registrados para el año ${year}. Esta acción no se puede deshacer.`,
      confirmText: "Eliminar vigencia",
      onConfirm: performDelete
    });
  };

  nodes.viewRoot.querySelectorAll("[data-action='payroll-legal-delete']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      void runPayrollLegalDelete(btn.dataset.year);
    });
  });
  const employeeForm = document.getElementById("form-employee");
  if (employeeForm) {
    window.AntaresValidation?.decorateFormFields?.(employeeForm);
    wirePayrollEmployeeFormFieldSanitization(employeeForm);
    const employeeDuplicateDocCheck = wireEmployeePayrollDuplicateDocCheck(employeeForm);
    employeeForm.__antaresDupDocCheck = employeeDuplicateDocCheck;
    attachDepartmentCitySelects(employeeForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    ensurePositionsCatalogLiveSelects();
    const empPosSelect = employeeForm.querySelector("#emp-position-select");
    const empSalary = employeeForm.querySelector("#emp-base-salary");
    const empContract = employeeForm.querySelector("#emp-contract-type");
    const employeeCompRule = bindEmployeeTransportAllowanceRule(employeeForm, {
      salarySelector: "#emp-base-salary",
      auxSelector: "#emp-transport-allowance",
      hintSelector: "#emp-legal-comp-hint"
    });
    const syncPlazoVisibility = setupContractDurationPlazoVisibility(employeeForm, {
      contractSelect: "#emp-contract-type",
      block: "#emp-contract-duration-block",
      unit: "#emp-contract-duration-unit",
      qtyWrap: "#emp-contract-duration-qty-wrap",
      otherWrap: "#emp-contract-duration-other-wrap",
      amount: "#emp-contract-duration-amount",
      otherText: "#emp-contract-duration-other"
    });
    const syncFixedTermEnd = bindFixedTermContractEndPreview(employeeForm, {
      contractSelect: "#emp-contract-type",
      startDate: "#emp-start-date",
      contractVigenteStartDate: "#emp-contract-vigente-start-date",
      vigenteWrap: "#emp-contract-vigente-start-wrap",
      contractEndDate: "#emp-contract-end-date",
      endWrap: "#emp-contract-end-wrap",
      hint: "#emp-contract-renewal-hint",
      unit: "#emp-contract-duration-unit",
      amount: "#emp-contract-duration-amount"
    });
    const syncEmpFromPosition = () => {
      const position = getPositionById(String(empPosSelect?.value || ""));
      applyPositionCatalogToEmployeeForm(employeeForm, position, {
        salarySelector: "#emp-base-salary",
        contractSelector: "#emp-contract-type",
        auxSelector: "#emp-transport-allowance",
        arlRiskSelector: "#emp-arl-risk-level",
        templateSelector: "#emp-contract-template-kind",
        scheduleSelector: "#emp-work-schedule",
        hintSelector: "#emp-position-catalog-hint",
        onAfterApply: () => {
          employeeCompRule.sync({ force: true });
          syncPlazoVisibility();
          syncFixedTermEnd();
        }
      });
      if (!position) syncPlazoVisibility();
    };
    if (empPosSelect) {
      empPosSelect.addEventListener("change", syncEmpFromPosition);
      syncEmpFromPosition();
    }
    syncPlazoVisibility();
    syncFixedTermEnd();
    const empIllnessSelect = employeeForm.querySelector("#emp-has-illness");
    const empIllnessDetailLabel = employeeForm.querySelector("#emp-illness-detail-label");
    const empIllnessDetail = employeeForm.querySelector("#emp-illness-detail");
    const syncIllnessVisibility = () => {
      if (!empIllnessSelect || !empIllnessDetailLabel || !empIllnessDetail) return;
      const yes = String(empIllnessSelect.value || "").toLowerCase() === "si";
      empIllnessDetailLabel.classList.toggle("hidden", !yes);
      empIllnessDetailLabel.toggleAttribute("hidden", !yes);
      if (yes) {
        empIllnessDetail.setAttribute("required", "required");
      } else {
        empIllnessDetail.removeAttribute("required");
        empIllnessDetail.value = "";
      }
    };
    if (empIllnessSelect) {
      empIllnessSelect.addEventListener("change", syncIllnessVisibility);
      syncIllnessVisibility();
    }
    const empCreateAvatarInput = employeeForm.querySelector("#emp-create-avatar-input");
    const empCreateAvatarLabel = employeeForm.querySelector("[data-emp-create-avatar-label]");
    bindEmployeeAvatarFilePreview(empCreateAvatarInput, empCreateAvatarLabel);
    const empUploadZone = employeeForm.querySelector(".payroll-wizard-upload-zone");
    if (empUploadZone && empCreateAvatarInput) {
      ["dragenter", "dragover"].forEach((ev) => {
        empUploadZone.addEventListener(ev, (e) => {
          e.preventDefault();
          empUploadZone.classList.add("is-dragover");
        });
      });
      ["dragleave", "drop"].forEach((ev) => {
        empUploadZone.addEventListener(ev, (e) => {
          e.preventDefault();
          empUploadZone.classList.remove("is-dragover");
        });
      });
      empUploadZone.addEventListener("drop", (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (!file || !String(file.type || "").startsWith("image/")) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        empCreateAvatarInput.files = dt.files;
        empCreateAvatarInput.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
    employeeForm.querySelector("[data-action='employee-form-save-draft']")?.addEventListener("click", () => {
      try {
        const raw = readFormEntriesNormalized(employeeForm);
        localStorage.setItem("antares-employee-create-draft", JSON.stringify({ savedAt: Date.now(), fields: raw }));
        notify("Borrador guardado en este navegador.", "success");
      } catch (_err) {
        notify("No se pudo guardar el borrador.", "error");
      }
    });
    const empNameForAvatar = employeeForm.querySelector("input[name='name']");
    const empAvatarInitialSpan = employeeForm.querySelector("[data-emp-avatar-initial]");
    const syncEmpCreateAvatarInitial = () => {
      if (!empAvatarInitialSpan || !empCreateAvatarLabel) return;
      if (empCreateAvatarLabel.classList.contains("has-image")) return;
      const n = String(empNameForAvatar?.value || "").trim();
      empAvatarInitialSpan.textContent = n ? n.charAt(0).toUpperCase() : "E";
    };
    empNameForAvatar?.addEventListener("input", syncEmpCreateAvatarInitial);
    syncEmpCreateAvatarInitial();
    try {
      const draftRaw = localStorage.getItem("antares-employee-create-draft");
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        const fields = draft?.fields;
        if (fields && typeof fields === "object") {
          Object.entries(fields).forEach(([name, value]) => {
            const el = employeeForm.querySelector(`[name="${name}"]`);
            if (!el || el.type === "file") return;
            if (el.tagName === "SELECT") el.value = String(value ?? "");
            else el.value = String(value ?? "");
          });
          syncIllnessVisibility();
          employeeCompRule.sync({ force: true });
          syncPlazoVisibility();
          syncFixedTermEnd();
          syncEmpCreateAvatarInitial();
        }
      }
    } catch (_draftErr) {
      /* borrador opcional */
    }
    bindHrFormWizard(employeeForm);
    applyDocumentFieldConstraints(employeeForm);
    const prefillCandidateId = String(state.hiringUi?.prefillEmployeeFromCandidateId || "").trim();
    if (prefillCandidateId) {
      state.hiringUi = { ...(state.hiringUi || {}), prefillEmployeeFromCandidateId: "" };
      const prefillCandidate = read(KEYS.candidates, []).find((c) => String(c.id) === prefillCandidateId);
      if (prefillCandidate) {
        applyCandidateToEmployeeForm(employeeForm, prefillCandidate);
        const birthIso = normalizePortalDateYmd(prefillCandidate.birthDate);
        if (birthIso) {
          window.AntaresValidation?.setPortalFormDateByName?.(employeeForm, "birthDate", birthIso);
        }
        window.AntaresValidation?.setPortalFormDateByName?.(
          employeeForm,
          "startDate",
          colombiaTodayIsoDate()
        );
        employeeCompRule.sync({ force: true });
        syncPlazoVisibility();
        syncFixedTermEnd();
        notify(`Formulario precargado desde candidato «${String(prefillCandidate.name || "").trim()}». Complete seguridad social y banco.`, "info");
      }
    }
    syncFixedTermEnd();
    employeeForm.querySelectorAll("[data-action='employee-form-generate-contract-draft']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await runWithBusyButton(
          btn,
          async () => {
            const raw = readFormEntriesNormalized(employeeForm);
            const docValidation = validateColombianDocument(raw.documentType, raw.idDoc);
            if (!docValidation.ok) {
              failPortalField(employeeForm, "idDoc", docValidation.message);
              return;
            }
            const packed = buildPayrollEmployeePayloadFromWizard(raw, docValidation.normalized, {
              avatarUrl: "",
              stripLargeAvatar: false
            });
            if (!packed.ok) {
              failPortalField(employeeForm, packed.field || "name", packed.msg);
              return;
            }
            const payload = packed.payload;
            const miss = validateEmployeeContractDocFields(payload);
            if (miss.length) {
              failPortalField(
                employeeForm,
                firstEmployeeContractDocFieldFromMissing(miss),
                userMessage("contractEmployeeMissingFields", miss.join(", "))
              );
              return;
            }
            if (payload.workerRole === "conductor") {
              if (!payload.license) {
                failPortalField(employeeForm, "license", userMessage("employeeDriverFieldsRequired"));
                return;
              }
              if (!payload.licenseCategory) {
                failPortalField(employeeForm, "licenseCategory", userMessage("employeeDriverFieldsRequired"));
                return;
              }
              if (!payload.licenseExpiry) {
                failPortalField(employeeForm, "licenseExpiry", userMessage("employeeDriverFieldsRequired"));
                return;
              }
              if (new Date(payload.licenseExpiry).getTime() <= Date.now()) {
                failPortalField(employeeForm, "licenseExpiry", userMessage("payrollLicenseExpired"));
                return;
              }
            }
            try {
              await generateOfficialWordContract(
                buildEmployeeContractDocxPayload(payload, { contractTemplateKind: payload.contractTemplateKind })
              );
              notify(userMessage("employeeContractWordOk"), "success");
            } catch (err) {
              notify(String(err?.message || userMessage("genericError")), "error");
            }
          },
          payrollCreateFormSubmitOpts(employeeForm, { busyText: "Generando…" })
        );
      });
    });
    wireFormSubmitGuard(employeeForm, async (event) => {
      const actor = currentUser();
      const raw = readFormEntriesNormalized(employeeForm);
      const docValidation = validateColombianDocument(raw.documentType, raw.idDoc);
      if (!docValidation.ok) {
        failPortalField(employeeForm, "idDoc", docValidation.message);
        return;
      }
      if (!(await employeeDuplicateDocCheck({ forceServer: true, fromSubmit: true }))) {
        /* wireFormDocDuplicateCheck ya notificó y marcó el campo con el duplicado. */
        return;
      }
      const fileInput = employeeForm.querySelector("input[name='avatarFile']");
      const file = fileInput?.files?.[0];
      const avatarBaseFromForm = String(raw.avatarUrl || "").trim();
      let resolvedAvatar = avatarBaseFromForm;
      try {
        resolvedAvatar = await resolveEmployeeAvatarUrl(file, avatarBaseFromForm);
      } catch (err) {
        devWarn?.("avatar-upload-failed", err);
      }
      // Si el avatar terminó como `data:` URL (R2 no disponible), recortarlo
      // para no-admin para evitar colmar localStorage.
      const stripAvatar =
        actor?.role !== ROLES.ADMIN && String(resolvedAvatar || "").startsWith("data:");
      const saveEmployee = async (avatarUrlValue) => {
        const packed = buildPayrollEmployeePayloadFromWizard(raw, docValidation.normalized, {
          avatarUrl: avatarUrlValue,
          stripLargeAvatar: stripAvatar
        });
        if (!packed.ok) {
          failPortalField(employeeForm, packed.field || "name", packed.msg);
          return;
        }
        const payload = packed.payload;
        if (!payrollIsAllowedPayFrequency(payload.payFrequency)) {
          failPortalField(employeeForm, "payFrequency", "Seleccione periodicidad Mensual o Quincenal.");
          return;
        }
        if (!canManagePayrollModule(actor)) {
          try {
            await queueApproval({
              type: "create_employee",
              title: `Creación de empleado ${payload.name}`,
              payload,
              requestedByUserId: actor?.id || "",
              requestedByName: actor?.name || "Usuario"
            });
          } catch (_err) {
            return;
          }
          notify(userMessage("employeeRequestQueued"), "info");
          collapseCreatePanel("create-employee");
          renderPortalView();
          return;
        }
        if (payload.workerRole === "conductor") {
          if (!payload.license) {
            failPortalField(employeeForm, "license", userMessage("employeeDriverFieldsRequired"));
            return;
          }
          if (!payload.licenseCategory) {
            failPortalField(employeeForm, "licenseCategory", userMessage("employeeDriverFieldsRequired"));
            return;
          }
          if (!payload.licenseExpiry) {
            failPortalField(employeeForm, "licenseExpiry", userMessage("employeeDriverFieldsRequired"));
            return;
          }
          if (new Date(payload.licenseExpiry).getTime() <= Date.now()) {
            failPortalField(employeeForm, "licenseExpiry", userMessage("payrollLicenseExpired"));
            return;
          }
        }
        const newEmployeeId = newUuidV4();
        const createdEmployee = stampCreatedRecord({ id: newEmployeeId, ...payload });
        const all = read(KEYS.payrollEmployees, []);
        all.push(createdEmployee);
        try {
          await writeAwaitServerCreate(KEYS.payrollEmployees, all, createdEmployee, { notifyOnFailure: false });
        } catch (err) {
          const rolledBack = read(KEYS.payrollEmployees, []).filter(
            (row) => String(row.id) !== newEmployeeId
          );
          write(KEYS.payrollEmployees, rolledBack, { skipSyncSchedule: true });
          notify(userMessage("employeeSaveServerFail", err?.message), "error");
          return;
        }
        appendPayrollEmployeeAuditLog("create", createdEmployee);
        const propagate = await propagateEmployeeChanges(createdEmployee, {
          license: payload.license,
          licenseCategory: payload.licenseCategory,
          licenseExpiry: payload.licenseExpiry,
          isNewHire: true
        });
        if (!propagate.ok) {
          notify(propagate.message || userMessage("employeeCreatedDriverSyncFail"), "error");
          state.payrollUi = {
            ...(state.payrollUi || { runSort: "recent" }),
            workspace: "data",
            dataSection: "employees"
          };
          persistHrWorkspace("payroll", "data");
          collapseCreatePanel("create-employee");
          renderPortalView();
          return;
        }
        if (portalCanRefreshFromApi()) {
          try {
            const refreshed = await window.PayrollEmployeeListSync?.refreshFromApi?.();
            if (!refreshed) {
              await applyPortalBootstrapFromApi({ skipSecondaryHydration: true });
            }
          } catch (_e) {}
        }
        state.payrollUi = {
          ...(state.payrollUi || { runSort: "recent" }),
          workspace: "data",
          dataSection: "employees"
        };
        persistHrWorkspace("payroll", "data");
        collapseCreatePanel("create-employee");
        notify(
          payload.workerRole === "conductor"
            ? userMessage("employeeCreatedDriverSynced")
            : userMessage("employeeCreatedOk"),
          "success"
        );
        renderPortalView();
        scheduleContractRenewalNotificationCheck();
      };
      await saveEmployee(resolvedAvatar);
    }, payrollCreateFormSubmitOpts(employeeForm, {
      busyText: "Guardando empleado…",
      submitButton: employeeForm.querySelector(".hr-form-wizard-submit"),
      wireKey: "employeeSubmitGuardWired"
    }));
  }

  const absenceForm = document.getElementById("form-hr-absence");
  if (absenceForm) {
    wireHrAbsenceFormBehavior(absenceForm);
    wireFormSubmitGuard(absenceForm, async (event) => {
      const actor = currentUser();
      const data = readFormEntriesNormalized(absenceForm);
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) {
        failPortalField(absenceForm, "employeeId", userMessage("absencePickEmployee"));
        return;
      }
      const start = new Date(`${data.startDate}T12:00:00`);
      const end = new Date(`${data.endDate}T12:00:00`);
      if (end.getTime() < start.getTime()) {
        failPortalField(absenceForm, "endDate", userMessage("absenceDateOrder"));
        return;
      }
      const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
      const { absenceType, absenceSubtype } = payrollResolveAbsenceFormType(data);
      const recognizedDays = Math.max(
        0.5,
        Number(
          parseNum(
            data.requestAmount ||
              data.recognizedDays ||
              payrollComputeAbsenceSuggestedRecognizedDays({
                absenceType,
                absenceSubtype,
                startDate: data.startDate,
                endDate: data.endDate
              })
          )
        )
      );
      const notesBase = normalizeLatinUpperForDb(data.notes || "");
      const notes = data.periodicAbsence
        ? normalizeLatinUpperForDb(`[PERIÓDICA] ${notesBase}`.trim())
        : notesBase;
      const legalValidation = payrollValidateAbsenceLegalRules({
        absenceType,
        absenceSubtype,
        startDate: data.startDate,
        endDate: data.endDate,
        recognizedDays,
        supportNumber: data.supportNumber,
        epsEntity: data.epsEntity,
        notes: data.notes
      });
      if (!legalValidation.ok) {
        failPortalField(absenceForm, legalValidation.field || "startDate", legalValidation.message);
        return;
      }
      const list = read(KEYS.hrAbsences, []);
      const absencePayload = {
        id: newUuidV4(),
        employeeId: employee.id,
        employeeName: normalizeLatinUpperForDb(employee.name),
        absenceType,
        absenceSubtype: absenceSubtype || null,
        startDate: data.startDate,
        endDate: data.endDate,
        days,
        recognizedDays,
        recognizedUnit: payrollAbsenceRecognizedUnit(absenceType, absenceSubtype),
        supportNumber: normalizeLatinUpperForDb(data.supportNumber || ""),
        epsEntity: normalizeLatinUpperForDb(data.epsEntity || ""),
        notes,
        createdAt: nowIso()
      };
      if (requiresAdminHrApproval(actor?.role || "")) {
        await queueApproval({
          type: "register_hr_absence",
          title: `Registro de ausencia de ${employee.name}`,
          payload: absencePayload,
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        notify(userMessage("absenceApprovalQueued"), "info");
        collapseCreatePanel("create-hr-absence");
        renderPortalView();
        return;
      }
      list.unshift(absencePayload);
      try {
        await writeAwaitServerCreate(KEYS.hrAbsences, list, absencePayload);
      } catch (err) {
        notify(String(err?.message || "No fue posible registrar la ausencia en el servidor."), "error");
        return;
      }
      logPortalAuditEvent?.("payroll", "create", {
        entityId: absencePayload.id,
        entityLabel: `${String(employee.name || "Colaborador")} · ${String(data.startDate || "-")}`,
        summary: `${String(absenceType || "Ausencia")} · ${days} día(s)`,
        at: absencePayload.createdAt
      });
      const linkResult = await refreshPayrollDraftsLinked(employee.id, data.startDate, data.endDate, {
        notifyOnError: false
      });
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      collapseCreatePanel("create-hr-absence");
      notify(payrollDraftLinkSuccessMessage(linkResult), "success");
      renderPortalView();
    }, payrollCreateFormSubmitOpts(absenceForm, { busyText: "Registrando ausencia…" }));
  }

  nodes.viewRoot.querySelectorAll("[data-action='view-employee']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const empId = String(btn.dataset.id || "");
      let target = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === empId);
      if (!target) {
        notify(userMessage("employeeDeleteNotFound"), "error");
        return;
      }
      if (portalCanRefreshFromApi() && btn.dataset.busy !== "1") {
        btn.dataset.busy = "1";
        btn.disabled = true;
        btn.setAttribute("aria-busy", "true");
        try {
          await applyPortalBootstrapFromApi();
          target = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === empId) || target;
        } catch (_e) {
          /* usar caché local */
        } finally {
          btn.dataset.busy = "0";
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
        }
      }
      target = normalizePayrollEmployeeRowDates(target);
      const payrollHistoryHtml =
        typeof buildEmployeePayrollHistorySectionHtml === "function"
          ? buildEmployeePayrollHistorySectionHtml(target, read(KEYS.payrollRuns, []))
          : "";
      const isDriverSvc = employeeIsConductorServiceProvider(target);
      const liquidacionesSection = isDriverSvc ? "driverPayments" : "runs";
      const contractAction = `<button type="button" class="btn btn-action" data-action="employee-generate-contract" data-id="${escapeAttr(String(target.id || ""))}">${IC.download} Descargar contrato</button>`;
      const liquidacionesAction = `<button type="button" class="btn btn-outline" data-action="payroll-focus-employee-runs" data-employee-id="${escapeAttr(String(target.id || ""))}" data-payroll-section="${escapeAttr(liquidacionesSection)}">${IC.dollar} Ver liquidaciones</button>`;
      openInfoModal({
        title: "Ficha del colaborador",
        subtitle: `${String(target.position || "Colaborador").trim()} · ${String(target.idDoc || "").trim()}`,
        bodyHtml: `${buildEmployeePayrollProfileBodyHtml(target)}${payrollHistoryHtml}`,
        wide: true,
        secondaryActionsHtml: `${liquidacionesAction}${contractAction}`,
        afterMount: (content) => {
          bindPayrollPayslipButtons(content);
          wirePayrollEmployeeLiquidationActions(content);
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.payrollEmployees, []);
      const target = all.find((e) => String(e.id) === String(btn.dataset.id || ""));
      if (!target) return;
      openEditModal({
        title: "Editar colaborador",
        subtitle: String(target.name || "").trim(),
        submitText: "Guardar cambios",
        extraModalCardClass: "modal-card-edit--employee",
        fields: buildPayrollEmployeeEditModalFields(target),
        afterMount: (formEl) => {
          attachDepartmentCitySelects(formEl, {
            departmentSelector: "select[name='department']",
            citySelector: "select[name='city']",
            initialDepartment: target.department || "",
            initialCity: target.city || ""
          });
          applyDocumentFieldConstraints(formEl);
          formEl.querySelector("input[name='bankAccount']")?.setAttribute("minlength", "8");
          formEl.querySelector("input[name='bankAccount']")?.setAttribute("maxlength", "24");
          const pos = formEl.querySelector("#employee-modal-position");
          const salary = formEl.querySelector("#employee-modal-salary");
          const compensationRule = bindEmployeeTransportAllowanceRule(formEl, {
            salarySelector: "#employee-modal-salary",
            auxSelector: "#employee-modal-transport-allowance",
            hintSelector: "#employee-modal-legal-comp-hint",
            preserveExistingValue: true
          });
          const contract = formEl.querySelector("#employee-modal-contract-type");
          const syncPlazoEdit = setupContractDurationPlazoVisibility(formEl, {
            contractSelect: "#employee-modal-contract-type",
            block: "#emp-edit-contract-duration-block",
            unit: "#emp-edit-contract-duration-unit",
            qtyWrap: "#emp-edit-contract-duration-qty-wrap",
            otherWrap: "#emp-edit-contract-duration-other-wrap",
            amount: "#emp-edit-contract-duration-amount",
            otherText: "#emp-edit-contract-duration-other"
          });
          const syncFixedTermEdit = bindFixedTermContractEndPreview(formEl, {
            contractSelect: "#employee-modal-contract-type",
            startDate: "#employee-modal-start-date",
            contractVigenteStartDate: "#employee-modal-contract-vigente-start-date",
            vigenteWrap: "#emp-edit-contract-vigente-start-wrap",
            contractEndDate: "#emp-edit-contract-end-date",
            endWrap: "#emp-edit-contract-end-wrap",
            hint: "#emp-edit-contract-renewal-hint",
            unit: "#emp-edit-contract-duration-unit",
            amount: "#emp-edit-contract-duration-amount"
          });
          const syncFromPos = () => {
            const p = getPositionById(String(pos?.value || ""));
            applyPositionCatalogToEmployeeForm(formEl, p, {
              salarySelector: "#employee-modal-salary",
              contractSelector: "#employee-modal-contract-type",
              auxSelector: "#employee-modal-transport-allowance",
              arlRiskSelector: "#employee-modal-arl-risk",
              templateSelector: "#employee-modal-contract-template",
              scheduleSelector: "#employee-modal-work-schedule",
              hintSelector: "#employee-modal-legal-comp-hint",
              onAfterApply: () => {
                compensationRule.sync({ force: true });
                syncPlazoEdit();
                syncFixedTermEdit();
              }
            });
            if (!p) syncPlazoEdit();
          };
          pos?.addEventListener("change", syncFromPos);
          syncFixedTermEdit();
          const illnessSel = formEl.querySelector("[data-emp-edit-illness]");
          const illnessDetailLabel = formEl.querySelector("[data-emp-edit-illness-detail]");
          const illnessDetailField = illnessDetailLabel?.querySelector("textarea[name='illnessDescription']");
          const syncIllness = () => {
            if (!illnessSel || !illnessDetailLabel || !illnessDetailField) return;
            const yes = String(illnessSel.value || "").toLowerCase() === "si";
            illnessDetailLabel.toggleAttribute("hidden", !yes);
            illnessDetailLabel.classList.toggle("hidden", !yes);
            if (yes) {
              illnessDetailField.setAttribute("required", "required");
            } else {
              illnessDetailField.removeAttribute("required");
              illnessDetailField.value = "";
            }
          };
          illnessSel?.addEventListener("change", syncIllness);
          syncIllness();
          syncPlazoEdit();
          bindEmployeeAvatarFilePreview(
            formEl.querySelector("#emp-edit-modal-avatar-input"),
            formEl.querySelector("[data-emp-edit-avatar-label]")
          );
          const editAvLab = formEl.querySelector("[data-emp-edit-avatar-label]");
          const editNameInp = formEl.querySelector("input[name='name']");
          const editAvInit = editAvLab?.querySelector(".profile-avatar-initial");
          const syncEditAvatarInitial = () => {
            if (!editAvLab || !editAvInit || editAvLab.classList.contains("has-image")) return;
            const n = String(editNameInp?.value || "").trim();
            editAvInit.textContent = n ? n.charAt(0).toUpperCase() : "?";
          };
          editNameInp?.addEventListener("input", syncEditAvatarInitial);
          syncEditAvatarInitial();
          syncEmployeeEditCatalogSelects(formEl, target);
          wirePayrollEmployeeFormFieldSanitization(formEl);
          wireEmployeePayrollDuplicateDocCheck(formEl, { excludeId: target.id });
        },
        onSubmit: async (payload, formEl) => {
          const actor = currentUser();
          const docValidation = validateColombianDocument(payload.documentType, payload.idDoc);
          if (!docValidation.ok) {
            failPortalField(formEl, "idDoc", docValidation.message);
            return false;
          }
          const dupCheck = wireEmployeePayrollDuplicateDocCheck(formEl, { excludeId: target.id });
          if (!(await dupCheck({ forceServer: true, fromSubmit: true }))) {
            /* wireFormDocDuplicateCheck ya notificó y marcó el campo con el duplicado. */
            return false;
          }
          let nextAvatar = String(payload.avatarUrlExisting || "").trim();
          try {
            const file = formEl?.querySelector?.("input[name='avatarFile']")?.files?.[0];
            if (file) {
              nextAvatar = await resolveEmployeeAvatarUrl(file, nextAvatar);
            }
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return false;
          }
          const raw = { ...payload, avatarUrl: nextAvatar };
          const packed = buildPayrollEmployeePayloadFromWizard(raw, docValidation.normalized, {
            avatarUrl: nextAvatar,
            stripLargeAvatar: false,
            preserveEmployee: target
          });
          if (!packed.ok) {
            failPortalField(formEl, packed.field || "name", packed.msg);
            return false;
          }
          const nextPayload = packed.payload;
          if (!payrollIsAllowedPayFrequency(nextPayload.payFrequency)) {
            failPortalField(formEl, "payFrequency", "Seleccione periodicidad Mensual o Quincenal.");
            return false;
          }
          if (nextPayload.workerRole === "conductor") {
            if (!nextPayload.license) {
              failPortalField(formEl, "license", userMessage("employeeDriverFieldsRequired"));
              return false;
            }
            if (!nextPayload.licenseCategory) {
              failPortalField(formEl, "licenseCategory", userMessage("employeeDriverFieldsRequired"));
              return false;
            }
            if (!nextPayload.licenseExpiry) {
              failPortalField(formEl, "licenseExpiry", userMessage("employeeDriverFieldsRequired"));
              return false;
            }
            if (new Date(nextPayload.licenseExpiry).getTime() <= Date.now()) {
              failPortalField(formEl, "licenseExpiry", userMessage("payrollLicenseExpired"));
              return false;
            }
          }
          if (!canManagePayrollModule(actor)) {
            const stripAvatar = String(nextAvatar || "").startsWith("data:");
            try {
              await queueApproval({
                type: "update_employee",
                title: `Modificación de colaborador ${nextPayload.name}`,
                payload: {
                  employeeId: target.id,
                  ...nextPayload,
                  avatarUrl: stripAvatar ? "" : nextAvatar || nextPayload.avatarUrl || ""
                },
                requestedByUserId: actor?.id || "",
                requestedByName: actor?.name || "Usuario"
              });
            } catch (_err) {
              return false;
            }
            notify(userMessage("employeeUpdateRequestQueued"), "info");
            return true;
          }
          const apiOn =
            window.AntaresApi?.isConfigured?.() &&
            typeof window.AntaresApi?.getBase === "function" &&
            Boolean(window.AntaresApi.getBase());
          if (apiOn) {
            if (!isUuidString(String(target.id || ""))) {
              notify(userMessage("employeeServerUuidRequired"), "error");
              return false;
            }
            if (!isUuidString(String(nextPayload.companyId || ""))) {
              notify(userMessage("employeeServerCompanyUuidRequired"), "error");
              return false;
            }
          }
          const nextEmployees = all.map((empRow) =>
              String(empRow.id) !== String(target.id)
                ? empRow
                : stampUpdatedRecord({
                    ...empRow,
                    ...nextPayload,
                    id: empRow.id,
                    avatarUrl:
                      typeof nextAvatar === "string" && nextAvatar.trim()
                        ? nextAvatar.trim()
                        : empRow.avatarUrl || nextPayload.avatarUrl
                  })
            );
          const updatedEmployee = nextEmployees.find(
            (empRow) => String(empRow.id) === String(target.id)
          );
          try {
            await writeAwaitServerEdit(KEYS.payrollEmployees, nextEmployees, target.id);
          } catch (err) {
            notify(userMessage("employeeSaveServerFail", err?.message), "error");
            return false;
          }
          scheduleContractRenewalNotificationCheck();
          const refreshed = read(KEYS.payrollEmployees, []).find((empRow) => String(empRow.id) === String(target.id));
          if (refreshed) {
            appendPayrollEmployeeAuditLog("update", refreshed);
            const propagate = await propagateEmployeeChanges(refreshed);
            if (!propagate.ok) {
              notify(propagate.message || userMessage("employeeCreatedDriverSyncFail"), "error");
              return false;
            }
            await refreshPayrollDraftsLinked(refreshed.id, null, null, { notifyOnError: false });
            if (portalCanRefreshFromApi()) {
              try {
                await applyPortalBootstrapFromApi();
              } catch (_e) {}
            }
            notify(
              nextPayload.workerRole === "conductor"
                ? userMessage("employeeUpdatedDriverSynced")
                : userMessage("employeeUpdatedOk"),
              "success"
            );
            renderPortalView();
            return true;
          }
          notify(userMessage("employeeUpdatedOk"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='renew-employee-contract']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManagePayroll()) return;
      const all = read(KEYS.payrollEmployees, []);
      const target = all.find((e) => String(e.id) === String(btn.dataset.id || ""));
      if (!target) return;
      if (!isFixedTermContractType(target.contractType)) {
        notify("La renovación solo aplica a contratos a término fijo.", "error");
        return;
      }
      const normalized = normalizePayrollEmployeeRowDates(target);
      const renewalToday = colombiaTodayIsoDate();
      const periodStart = suggestRenewalPeriodStartYmd(normalized);
      const duration = String(normalized.contractDuration || normalized.contractDurationText || "1 año").trim();
      const endPreview = resolveEmployeeContractEndDateYmd(
        normalized.contractType,
        periodStart,
        { contractDurationUnit: "anios", contractDurationAmount: "1" }
      );
      const endFromDuration = ensureEmployeeContractFields({
        ...normalized,
        contractVigenteStartDate: periodStart,
        contractDuration: duration
      }).contractEndDate;
      openEditModal({
        title: "Renovar contrato",
        subtitle: `${String(normalized.name || "").trim()} · ingreso ${fmtDateOr(normalized.startDate, "—")}`,
        submitText: "Confirmar renovación",
        cancelBtnClass: "btn btn-sm btn-outline module-panel-btn module-panel-btn--cancel",
        extraModalCardClass: "modal-card-edit--employee-renewal",
        fields: [
          {
            type: "section",
            title: "Nuevo período contractual",
            hint: "La fecha de ingreso no cambia. Se registrará un nuevo período y la fecha de renovación en la tabla."
          },
          {
            name: "renewalDate",
            label: "Fecha renovación (firma / acta)",
            type: "date",
            value: renewalToday,
            required: true
          },
          {
            name: "contractVigenteStartDate",
            label: "Inicio nuevo período",
            type: "date",
            value: periodStart,
            required: true
          },
          {
            name: "contractDuration",
            label: "Duración del período",
            type: "text",
            value: duration,
            required: true
          },
          {
            name: "contractEndDate",
            label: "Fin del período",
            type: "date",
            value: endFromDuration || endPreview || ""
          },
          {
            name: "baseSalary",
            label: "Salario base (COP)",
            type: "number",
            min: 0,
            value: String(normalized.baseSalary ?? "")
          },
          {
            type: "custom",
            full: true,
            html: `<label class="employee-contract-renewal-word"><input type="checkbox" name="generateWord" checked /><span>Generar contrato Word al confirmar</span></label>`
          }
        ],
        afterMount: (formEl) => {
          const startEl = formEl.querySelector("[name='contractVigenteStartDate']");
          const durEl = formEl.querySelector("[name='contractDuration']");
          const endEl = formEl.querySelector("[name='contractEndDate']");
          durEl?.setAttribute("placeholder", "Ej.: 1 año, 12 meses");
          endEl?.setAttribute("readonly", "");
          endEl?.setAttribute("tabindex", "-1");
          const syncRenewEnd = () => {
            const start = normalizePortalDateYmd(startEl?.value || "");
            const dur = String(durEl?.value || "").trim();
            if (!start || !endEl) return;
            const parsed = parseContractDurationText(dur || "1 año");
            const end = resolveEmployeeContractEndDateYmd(normalized.contractType, start, {
              contractDurationUnit: parsed.unit === "otro" ? "anios" : parsed.unit,
              contractDurationAmount: parsed.amount || "1"
            });
            endEl.value = end || "";
          };
          startEl?.addEventListener("change", syncRenewEnd);
          durEl?.addEventListener("input", syncRenewEnd);
          syncRenewEnd();
        },
        onSubmit: async (payload, formEl) => {
          const fields = {
            renewalDate: normalizePortalDateYmd(payload.renewalDate),
            contractVigenteStartDate: normalizePortalDateYmd(payload.contractVigenteStartDate),
            contractEndDate: normalizePortalDateYmd(payload.contractEndDate),
            contractDuration: String(payload.contractDuration || "").trim(),
            baseSalary: payload.baseSalary
          };
          const check = validateContractRenewal(normalized, fields);
          if (!check.ok) {
            failPortalField(formEl, check.field || "renewalDate", check.message);
            return false;
          }
          const result = await executeEmployeeContractRenewal(normalized, fields, {
            generateWord: String(payload.generateWord || "").toLowerCase() === "on" || payload.generateWord === true
          });
          if (!result.ok) {
            notify(String(result.message || "No se pudo completar la renovación."), "error");
            return false;
          }
          notify("Contrato renovado. Fechas actualizadas sin modificar la fecha de ingreso.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='non-renew-employee-contract']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManagePayroll()) return;
      const all = read(KEYS.payrollEmployees, []);
      const target = all.find((e) => String(e.id) === String(btn.dataset.id || ""));
      if (!target) return;
      if (!isFixedTermContractType(target.contractType)) {
        notify("El aviso de no renovación solo aplica a contratos a término fijo.", "error");
        return;
      }
      const normalized = normalizePayrollEmployeeRowDates(ensureEmployeeContractFields(target));
      const meta = buildNonRenewalNoticeMeta(normalized);
      const noticeToday = colombiaTodayIsoDate();
      openEditModal({
        title: "Aviso de no renovación",
        subtitle: `${String(normalized.name || "").trim()} · vence ${fmtDateOr(meta.endYmd, "—")}`,
        submitText: "Generar carta",
        cancelBtnClass: "btn btn-sm btn-outline module-panel-btn module-panel-btn--cancel",
        extraModalCardClass: "modal-card-edit--employee-non-renewal",
        fields: [
          {
            type: "section",
            title: "Datos del aviso",
            hint: "Carta conforme al CST art. 47 (mínimo 30 días antes del vencimiento). La fecha de ingreso no se modifica."
          },
          {
            name: "noticeDate",
            label: "Fecha del aviso",
            type: "date",
            value: noticeToday,
            required: true
          },
          {
            type: "custom",
            full: true,
            html: `<div class="employee-contract-non-renewal-meta">
              <p class="muted">Fin del contrato: <strong>${escapeHtml(meta.endLabel || "—")}</strong></p>
              <p class="muted">Plazo máximo de aviso: <strong>${escapeHtml(meta.deadlineLabel || "—")}</strong></p>${
                meta.lateNotice
                  ? `<p class="employee-contract-non-renewal-late">Hoy ya está dentro de los 30 días previos al vencimiento. Revise con asesoría laboral antes de enviar.</p>`
                  : ""
              }
            </div>`
          }
        ],
        onSubmit: async (payload, formEl) => {
          const check = validateNonRenewalNotice(normalized, {
            noticeDate: normalizePortalDateYmd(payload.noticeDate)
          });
          if (!check.ok) {
            failPortalField(formEl, check.field || "noticeDate", check.message);
            return false;
          }
          if (check.lateNotice) {
            const proceed = window.confirm(
              "El aviso se está generando después del plazo orientativo de 30 días de anticipación. ¿Desea continuar?"
            );
            if (!proceed) return false;
          }
          const result = await executeEmployeeContractNonRenewalNotice(
            normalized,
            { noticeDate: check.noticeDate },
            { openLetter: true }
          );
          if (!result.ok) {
            notify(String(result.message || "No se pudo registrar el aviso."), "error");
            return false;
          }
          notify("Aviso de no renovación registrado. Revise la carta, imprímala y entréguela al colaborador.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManagePayroll()) return;
      openConfirmModal({
        title: "Eliminar empleado",
        message: "El empleado será removido en cascada (nómina, ausencias, contratos y conductor relacionado).",
        confirmText: "Eliminar",
        onConfirm: async () => {
          const empId = String(btn.dataset.id || "");
          const snapshot = read(KEYS.payrollEmployees, []).find((row) => String(row.id) === empId) || null;
          try {
            await postPortalAuthorized("/portal/admin-employee-delete", { employeeId: empId });
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar el empleado en el servidor."), "error");
            return;
          }
          try {
            await deleteEmployeesCascade([empId]);
          } catch (err) {
            devWarn("deleteEmployeesCascade", err);
          }
          if (snapshot) appendPayrollEmployeeAuditLog("delete", snapshot);
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
          notify(userMessage("employeeDeletedCascade"), "success");
          renderPortalView();
        }
      });
    });
  });

  wirePayrollEmployeeDirectoryFilters();

  function syncPayrollEmployeeSelectionBadge() {
    const badge = document.getElementById("employees-selected-count");
    if (!badge) return;
    const selected = [...nodes.viewRoot.querySelectorAll("[data-employee-select]:checked")].filter(
      (el) => !el.closest(".is-filtered-out")
    );
    const count = selected.length;
    badge.textContent = `${count} seleccionado${count === 1 ? "" : "s"}`;
    badge.hidden = count <= 0;
  }
  window.syncPayrollEmployeeSelectionBadge = syncPayrollEmployeeSelectionBadge;

  nodes.viewRoot.querySelectorAll("[data-employee-select]").forEach((check) => {
    check.addEventListener("change", syncPayrollEmployeeSelectionBadge);
  });

  const employeesSelectAllHeader = document.getElementById("employees-select-all-header");
  const toggleEmployeeSelectAll = (checked) => {
    const checks = [...nodes.viewRoot.querySelectorAll(".payroll-employee-table-row:not(.is-filtered-out) [data-employee-select]")];
    checks.forEach((el) => {
      el.checked = checked;
    });
    syncPayrollEmployeeSelectionBadge();
  };
  employeesSelectAllHeader?.addEventListener("change", () => {
    toggleEmployeeSelectAll(Boolean(employeesSelectAllHeader.checked));
  });

  const employeesSelectAll = document.getElementById("employees-select-all");
  if (employeesSelectAll) {
    employeesSelectAll.addEventListener("click", (event) => {
      event.preventDefault();
      const checks = [
        ...nodes.viewRoot.querySelectorAll(".directory-card--employee [data-employee-select]"),
        ...nodes.viewRoot.querySelectorAll("[data-employee-select]")
      ].filter((el) => !el.closest(".is-filtered-out"));
      const allSelected = checks.length > 0 && checks.every((check) => check.checked);
      checks.forEach((check) => {
        check.checked = !allSelected;
      });
      if (employeesSelectAllHeader) employeesSelectAllHeader.checked = !allSelected && checks.length > 0;
      syncPayrollEmployeeSelectionBadge();
    });
  }
  syncPayrollEmployeeSelectionBadge();

  nodes.viewRoot.querySelectorAll("[data-action='payroll-employees-page']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const page = Math.max(1, Number(btn.dataset.page) || 1);
      state.payrollUi = {
        ...(state.payrollUi || { runSort: "recent", workspace: "data", dataSection: "employees" }),
        employeesPage: page,
        workspace: "data",
        dataSection: "employees"
      };
      persistHrWorkspace("payroll", "data");
      renderPortalView();
    });
  });

  const employeesPageSizeEl = document.getElementById("payroll-employees-page-size");
  employeesPageSizeEl?.addEventListener("change", () => {
    state.payrollUi = {
      ...(state.payrollUi || { runSort: "recent", workspace: "data", dataSection: "employees" }),
      employeesPageSize: Math.max(5, Number(employeesPageSizeEl.value) || 10),
      employeesPage: 1,
      workspace: "data",
      dataSection: "employees"
    };
    persistHrWorkspace("payroll", "data");
    renderPortalView();
  });

  document.getElementById("payroll-contracts-clear-filters")?.addEventListener("click", () => {
    ["payroll-employee-search", "payroll-employee-contract-filter", "payroll-employee-contract-type-filter", "payroll-employee-contract-date-filter"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.tagName === "SELECT") el.value = "all";
        else el.value = "";
      }
    );
    document.getElementById("payroll-employee-search")?.dispatchEvent(new Event("input", { bubbles: true }));
  });

  document.getElementById("export-employees-contracts")?.addEventListener("click", () => {
    const rows = [...nodes.viewRoot.querySelectorAll(".payroll-employee-table-row:not(.is-filtered-out)")];
    if (!rows.length) {
      notify("No hay filas visibles para exportar.", "error");
      return;
    }
    const lines = [
      ["Nombre", "Documento", "Cargo", "Ingreso", "Inicio vigente", "Renovación", "Aviso no renov.", "Fin contrato", "Estado"].join(";")
    ];
    rows.forEach((row) => {
      const cells = [...row.querySelectorAll("td")];
      const offset = cells[0]?.querySelector("[data-employee-select]") ? 1 : 0;
      const personCell = cells[offset];
      const strong = personCell?.querySelector("strong");
      const muted = personCell?.querySelector(".muted");
      const values = [
        strong?.textContent || "",
        muted?.textContent || "",
        cells[offset + 1]?.textContent || "",
        cells[offset + 2]?.textContent || "",
        cells[offset + 3]?.textContent || "",
        cells[offset + 4]?.textContent || "",
        cells[offset + 5]?.textContent || "",
        cells[offset + 6]?.textContent || "",
        cells[offset + 7]?.textContent || ""
      ].map((t) => `"${String(t).trim().replace(/"/g, '""')}"`);
      lines.push(values.join(";"));
    });
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contratos-${colombiaTodayIsoDate()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const employeesDeleteSelected = document.getElementById("employees-delete-selected");
  if (employeesDeleteSelected) {
    employeesDeleteSelected.addEventListener("click", (event) => {
      event.preventDefault();
      if (abortUnlessCanManagePayroll()) return;
      const selectedIds = [
        ...new Set(
          [...nodes.viewRoot.querySelectorAll("[data-employee-select]:checked")].map((check) =>
            String(check.value || "")
          )
        )
      ];
      if (!selectedIds.length) {
        notify(userMessage("employeesBulkSelect"), "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar empleados seleccionados",
        message: `Se eliminarán ${selectedIds.length} empleados en cascada (nómina, ausencias, contratos y conductores asociados).`,
        confirmText: "Eliminar seleccionados",
        onConfirm: async () => {
          const snapshots = selectedIds
            .map((employeeId) => read(KEYS.payrollEmployees, []).find((row) => String(row.id) === employeeId))
            .filter(Boolean);
          try {
            for (const employeeId of selectedIds) {
              await postPortalAuthorized("/portal/admin-employee-delete", { employeeId });
            }
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar un empleado en el servidor."), "error");
            return;
          }
          try {
            await deleteEmployeesCascade(selectedIds);
          } catch (err) {
            devWarn("deleteEmployeesCascade bulk", err);
          }
          snapshots.forEach((employee) => appendPayrollEmployeeAuditLog("delete", employee));
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
          notify(userMessage("employeesBulkRemoved", selectedIds.length), "success");
          renderPortalView();
        }
      });
    });
  }

  const payrollBulkBtn = document.getElementById("payroll-bulk-generate");
  wirePayrollBulkPreview();
  if (payrollBulkBtn && payrollBulkBtn.dataset.payrollBulkBound !== "1") {
    payrollBulkBtn.dataset.payrollBulkBound = "1";
    payrollBulkBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      const actor = currentUser();
      if (!actor || ![ROLES.ADMIN, ROLES.RRHH].includes(actor.role)) {
        notify("Solo administradores o recursos humanos pueden ejecutar liquidación masiva.", "error");
        return;
      }
      const bulkForm = document.getElementById("form-payroll-bulk");
      const fechaEl = document.getElementById("payroll-bulk-fecha");
      const forceEl = document.getElementById("payroll-bulk-force");
      const fechaReferencia = readFormDateIso(document, "payroll-bulk-fecha") || readFormDateIso(document, "fechaReferencia");
      if (!fechaReferencia) {
        failPortalField(bulkForm || fechaEl?.closest("form") || nodes.viewRoot, fechaEl || "fechaReferencia", "Indique una fecha de cierre válida (DD/MM/AAAA).");
        return;
      }
      const force = Boolean(forceEl?.checked);
      await runWithBusyButton(
        payrollBulkBtn,
        async () => {
          try {
            const result = await postPortalAuthorized("/payroll/autogenerate-period", {
              fechaReferencia,
              force,
              origin: "masiva"
            });
            if (result && typeof result === "object") {
              await applyPortalBootstrapFromApi();
              appendModuleAuditLog({
                action: "create",
                moduleId: "payroll",
                moduleLabel: "Gestión humana",
                entityId: String(result.periodKey || fechaReferencia),
                entityLabel: "Liquidación masiva",
                summary: `Cierre ${fechaReferencia}: ${parseNum(result.created ?? result.createdCount)} liquidación(es) generada(s)`
              });
              presentPayrollBulkAutogenResult(result);
              state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data", dataSection: "runs" };
              persistHrWorkspace("payroll", "data");
              renderPortalView();
            }
          } catch (err) {
            notify(String(err?.message || "No fue posible ejecutar la liquidación masiva."), "error");
          }
        },
        payrollCreateFormSubmitOpts(bulkForm, { busyText: "Generando…" })
      );
    });
  }

  const payrollForm = document.getElementById("form-payroll");
  if (payrollForm) {
    enhancePayrollLiquidationSelects(payrollForm);
    wireMonthlyPayrollConcepts(payrollForm);
    wireFormSubmitGuard(payrollForm, async (event) => {
      const data = readFormEntriesNormalized(payrollForm);
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) {
        failPortalField(payrollForm, "employeeId", userMessage("contractPickEmployee"));
        return;
      }
      const fechaCierre =
        readFormDateIso(document, "payroll-fecha-cierre") || String(data.fechaCierre || "").trim();
      if (!fechaCierre) {
        failPortalField(payrollForm, "fechaCierre", "Indique la fecha de cierre del período (día 15, fin de mes, etc.).");
        return;
      }

      if (employeeIsConductorServiceProvider(employee)) {
        failPortalField(payrollForm, "employeeId", userMessage("payrollConductorUseDriverForm"));
        return;
      }
      if (!payrollIsAllowedPayFrequency(employee.payFrequency)) {
        failPortalField(
          payrollForm,
          "employeeId",
          "Solo se liquidan colaboradores con periodicidad Mensual o Quincenal. Actualice la ficha del empleado."
        );
        return;
      }

      const payFreqNorm = normalizePayrollFrequencyJs(employee.payFrequency);
      const existingPayrollRuns = read(KEYS.payrollRuns, []);
      const existingPeriodKeys = existingPayrollRuns
        .filter((r) => String(r.employeeId || "") === String(employee.id || ""))
        .map((r) => String(r.month || ""));
      const cut = resolvePayrollCutForClosingDate(fechaCierre, payFreqNorm, { existingPeriodKeys });
      if (!cut) {
        const hint = payrollClosingDatesHint(payFreqNorm);
        failPortalField(
          payrollForm,
          "fechaCierre",
          `La fecha no es un día de cierre válido para nómina ${String(employee.payFrequency || "Mensual")}. Use ${hint}.`
        );
        return;
      }
      if (existingPeriodKeys.includes(cut.periodKey)) {
        failPortalField(
          payrollForm,
          "fechaCierre",
          `Ya existe una liquidación (${payrollRunTypeLabel({ payrollKind: payFreqNorm, month: cut.periodKey })}) para este empleado y período.`
        );
        return;
      }

      const dataMonth = cut.calendarMonthYm;
      const periodKey = cut.periodKey;
      const payrollKind = payFreqNorm === "mensual" ? "mensual" : payFreqNorm;
      const diasCorte = payrollDaysInManualCut(
        dataMonth,
        employee.payFrequency,
        /-Q2$/i.test(periodKey) ? "Q2" : "Q1"
      );
      const primaRequested = Boolean(data.payPrimaServicios);
      const interesesRequested = Boolean(data.payInteresesCesantias);
      let payPrima = false;
      if (primaRequested) {
        const primaCheck = payrollValidatePrimaForManualCut({
          employeeId: employee.id,
          calendarMonthYm: dataMonth,
          periodKey,
          payFrequency: employee.payFrequency,
          existingRuns: existingPayrollRuns
        });
        if (!primaCheck.ok) {
          failPortalField(payrollForm, primaCheck.field || "payPrimaServicios", primaCheck.message);
          return;
        }
        payPrima = true;
      }
      if (payPrima && !payrollMonthIsPrimaSemester(dataMonth)) {
        failPortalField(payrollForm, "fechaCierre", "La prima de servicios solo se parametriza cuando el mes liquidado es junio (06) o diciembre (12).");
        return;
      }
      let payInteresesCesantias = false;
      if (interesesRequested) {
        const intCheck = payrollValidateCesantiasInterestForManualCut({
          employeeId: employee.id,
          calendarMonthYm: dataMonth,
          periodKey,
          payFrequency: employee.payFrequency,
          existingRuns: existingPayrollRuns
        });
        if (!intCheck.ok) {
          failPortalField(payrollForm, intCheck.field || "payInteresesCesantias", intCheck.message);
          return;
        }
        payInteresesCesantias = true;
      }
      if (payInteresesCesantias && !payrollMonthIsCesantiasInterestMonth(dataMonth)) {
        failPortalField(
          payrollForm,
          "fechaCierre",
          "Los intereses sobre cesantías (Ley 52/1975) solo se parametrizan cuando el mes liquidado es enero (01) o febrero (02), períodos donde suele consignarse o pagarse ese concepto cercano al cierre legal de enero. Ajuste con su contador."
        );
        return;
      }
      const primaDaysRounded = Math.floor(parseNum(data.primaServiciosDays));
      let primaServiciosCop = payPrima ? Math.max(0, parseNum(data.primaServiciosCop)) : 0;
      if (payPrima && (!Number.isFinite(primaDaysRounded) || primaDaysRounded < 1)) {
        failPortalField(payrollForm, "primaServiciosDays", "Indique los días laborados en el semestre para calcular o validar la prima de servicios.");
        return;
      }
      if (payPrima && primaServiciosCop <= 0 && primaDaysRounded >= 1) {
        primaServiciosCop = calcColombiaPrimaServiciosCop(parseNum(employee.baseSalary), primaDaysRounded);
      }
      let cesantiasInterestBaseCop = payInteresesCesantias ? Math.max(0, parseNum(data.cesantiasInterestBaseCop)) : 0;
      const diasIntFloored = payInteresesCesantias ? Math.floor(parseNum(data.cesantiasInterestDays)) : null;
      const cesantiasInterestDays = !payInteresesCesantias
        ? null
        : Number.isFinite(diasIntFloored) && diasIntFloored > 0
          ? Math.min(366, diasIntFloored)
          : 360;
      let interesesCesantiasCop = payInteresesCesantias ? Math.max(0, parseNum(data.interesesCesantiasCopMonthly)) : 0;
      if (payInteresesCesantias && cesantiasInterestBaseCop <= 0) {
        failPortalField(payrollForm, "cesantiasInterestBaseCop", "Indique la base en pesos de las cesantías (p. ej. consignaciones del año anterior) para calcular o registrar los intereses.");
        return;
      }
      if (
        payInteresesCesantias &&
        interesesCesantiasCop <= 0 &&
        cesantiasInterestBaseCop > 0 &&
        cesantiasInterestDays != null
      ) {
        interesesCesantiasCop = calcColombiaInteresesCesantiasCop(cesantiasInterestBaseCop, cesantiasInterestDays);
      }
      const linkedDriver = employee.workerRole === "conductor" ? resolveDriverForEmployee(employee) : null;
      const monthlyDriver = linkedDriver ? calculateDriverTripReport(linkedDriver.id, dataMonth) : null;
      let autoTravelAllowance = monthlyDriver ? monthlyDriver.viaticTotal : 0;
      let autoFuelReimbursement = linkedDriver
        ? readFuelLogs()
            .filter((log) => String(log.driverId || "") === String(linkedDriver.id) && String(log.paidBy || "empresa") === "conductor" && dateInRange(log.date, monthRange(dataMonth)))
            .reduce((acc, log) => acc + parseNum(log.totalCost), 0)
        : 0;
      if (payFreqNorm === "quincenal" && diasCorte < 30) {
        const prorate = diasCorte / 30;
        autoTravelAllowance = Math.round(autoTravelAllowance * prorate);
        autoFuelReimbursement = Math.round(autoFuelReimbursement * prorate);
      }
      const travelAllowanceManual = parseNum(data.travelAllowanceManual);
      const fuelReimbursementManual = parseNum(data.fuelReimbursementManual);
      const travelAllowance = autoTravelAllowance + travelAllowanceManual;
      const fuelReimbursement = autoFuelReimbursement + fuelReimbursementManual;
      const baseSalaryMonthly = parseNum(employee.baseSalary);
      const baseSalary =
        payFreqNorm === "quincenal"
          ? Math.round((baseSalaryMonthly / 30) * diasCorte)
          : baseSalaryMonthly;
      const extras = parseNum(data.extras);
      const auxRaw = parseNum(data.aux);
      const aux =
        payFreqNorm === "quincenal" && auxRaw > 0
          ? Math.round((auxRaw / 30) * diasCorte)
          : auxRaw;
      const bonus = parseNum(data.bonus);
      const empleadoAuxilioRef = readEmployeeTransportAllowanceCop(employee);
      const payrollAbsencesAll = read(KEYS.hrAbsences, []);
      const incapacityCalc = computePayrollIncapacityColombiaForMonth({
        employee,
        liquidacionMonthYm: dataMonth,
        absencesAll: payrollAbsencesAll
      });
      const incapacityAdjustCop = parseNum(incapacityCalc.adjustCop);
      const grossMonthlyBase =
        baseSalary + extras + aux + bonus + travelAllowance + fuelReimbursement + incapacityAdjustCop;
      const gross =
        grossMonthlyBase +
        (payPrima ? primaServiciosCop : 0) +
        (payInteresesCesantias ? interesesCesantiasCop : 0);
      const ibc = baseSalary + extras + bonus;
      const health = ibc * CO_PAYROLL.healthEmployeeRate;
      const pension = ibc * CO_PAYROLL.pensionEmployeeRate;
      const solidarity = ibc > CO_PAYROLL.smmlv * CO_PAYROLL.solidarityThresholdSmmlv ? ibc * CO_PAYROLL.solidarityRate : 0;
      const deductions = health + pension + solidarity;
      const net = gross - deductions;
      const devengosLines = buildPayrollMensualDevengosLines({
        baseSalary,
        extras,
        aux,
        bonus,
        travelAllowance,
        fuelReimbursement,
        primaServiciosCop: payPrima ? primaServiciosCop : 0,
        interesesCesantiasCop: payInteresesCesantias ? interesesCesantiasCop : 0,
        empleadoAuxilioTransporteMensualCop: empleadoAuxilioRef,
        incapacityEpisodes: incapacityCalc.episodes
      });
      const incapacityNovelty = {
        episodes: incapacityCalc.episodes,
        totalAdjustCop: incapacityAdjustCop,
        smmlvRef: incapacityCalc.smmlv,
        legalNote:
          "Ajustes orientativos por ausencias con efecto en nómina (incapacidades y licencias no remuneradas). No sustituyen liquidación legal, soporte médico, acto del empleador ni validación contable."
      };
      const absenceSlipDetail = {
        rows: buildPayrollAbsenceSlipRowsForPeriod({
          employeeId: employee.id,
          periodStart: cut.periodStart,
          periodEnd: cut.periodEnd,
          absencesAll: payrollAbsencesAll
        })
      };
      const run = stampCreatedRecord({
        id: newUuidV4(),
        employeeId: employee.id,
        employeeName: employee.name,
        month: periodKey,
        gross,
        ibc,
        travelAllowance,
        fuelReimbursement,
        travelAllowanceAuto: autoTravelAllowance,
        fuelReimbursementAuto: autoFuelReimbursement,
        travelAllowanceManual,
        fuelReimbursementManual,
        extras,
        aux,
        bonus,
        devengosLines,
        liquidacionOrigin: "manual",
        noveltiesDetail: { devengosLines, incapacity: incapacityNovelty, absenceSlipDetail },
        tripCount: monthlyDriver?.tripCount || 0,
        interDepartmentTrips: monthlyDriver?.interDepartmentTrips || 0,
        health,
        pension,
        solidarity,
        deductions,
        net,
        paid: false,
        payrollKind,
        payPrimaServicios: payPrima,
        primaServiciosDays: payPrima ? primaDaysRounded : null,
        primaServiciosCop: payPrima ? primaServiciosCop : 0,
        payInteresesCesantias,
        interesesCesantiasCop: payInteresesCesantias ? interesesCesantiasCop : 0,
        cesantiasInterestBaseCop: payInteresesCesantias ? cesantiasInterestBaseCop : null,
        cesantiasInterestDays: payInteresesCesantias ? cesantiasInterestDays : null,
        settlementDetail: null
      });
      const runs = read(KEYS.payrollRuns, []);
      if (payrollRunAlreadyExists(runs, employee.id, periodKey, payrollKind)) {
        failPortalField(
          payrollForm,
          "month",
          `Ya existe una liquidación (${payrollRunTypeLabel({ payrollKind, month: periodKey })}) para este empleado y período.`
        );
        return;
      }
      runs.unshift(run);
      try {
        await writeAwaitServerCreate(KEYS.payrollRuns, runs, run);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la nómina en el servidor."), "error");
        return;
      }
      appendPayrollRunAuditLog("create", run, {
        summary: `Liquidación manual creada (${payrollRunTypeLabel(run)}) · neto $${parseNum(run.net).toLocaleString("es-CO")}`
      });
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      collapseCreatePanel("create-payroll");
      notify(userMessage("payrollSaved"), "success");
      renderPortalView();
    }, payrollCreateFormSubmitOpts(payrollForm, {
      busyText: "Generando liquidación…",
      submitButton: payrollForm.querySelector("#payroll-submit-btn")
    }));
  }

  const driverTripPayForm = document.getElementById("form-driver-trip-payment");
  if (driverTripPayForm) {
    wireFormSubmitGuard(driverTripPayForm, async () => {
      const data = readFormEntriesNormalized(driverTripPayForm);
      const employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(data.employeeId || ""));
      if (!employee) {
        failPortalField(driverTripPayForm, "employeeId", userMessage("contractPickEmployee"));
        return;
      }
      if (!employeeIsConductorServiceProvider(employee)) {
        failPortalField(driverTripPayForm, "employeeId", "Seleccione un colaborador configurado como conductor en prestación de servicios.");
        return;
      }
      const periodYm = String(data.month || "").trim().slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(periodYm)) {
        failPortalField(driverTripPayForm, "month", userMessage("payrollSelectMonth"));
        return;
      }
      if (!portalCanRefreshFromApi()) {
        notify(
          "Para liquidar viajes en base de datos debe iniciar sesión con el servidor (API). No se guardan solo en el navegador.",
          "error"
        );
        return;
      }
      const travelManual = Math.max(0, parseNum(data.travelAllowanceManual));
      const fuelManual = Math.max(0, parseNum(data.fuelReimbursementManual));
      try {
        const result = await refreshDriverTripPaymentLinked(employee.id, periodYm, {
          travelAllowanceManualCop: travelManual,
          fuelReimbursementManualCop: fuelManual,
          bootstrap: true,
          notifyOnError: false
        });
        if (!result) {
          notify("No fue posible liquidar los viajes en el servidor.", "error");
          return;
        }
        state.payrollUi = {
          ...(state.payrollUi || { runSort: "recent" }),
          workspace: "data",
          dataSection: "driverPayments"
        };
        persistHrWorkspace("payroll", "data");
        collapseCreatePanel("create-driver-trip-payment");
        const gross = parseNum(result.grossCop);
        const trips = parseNum(result.tripCount);
        const inter = parseNum(result.interDepartmentTrips);
        notify(userMessage("driverTripPaymentSaved", gross, trips, inter), "success");
        renderPortalView();
      } catch (err) {
        notify(String(err?.message || userMessage("payrollConductorNoTrips")), "error");
      }
    }, payrollCreateFormSubmitOpts(driverTripPayForm, { busyText: "Liquidando viajes…" }));
  }

  nodes.viewRoot.querySelectorAll("[data-action='recalc-driver-trip']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const eid = String(btn.dataset.employeeId || "").trim();
      const ym = String(btn.dataset.month || "").trim().slice(0, 7);
      if (!eid || !/^\d{4}-\d{2}$/.test(ym)) {
        notify(userMessage("payrollSelectMonth"), "error");
        return;
      }
      if (!portalCanRefreshFromApi()) {
        notify("Conéctese al servidor para recalcular desde viajes y combustible en base de datos.", "error");
        return;
      }
      btn.disabled = true;
      try {
        const result = await refreshDriverTripPaymentLinked(eid, ym, { bootstrap: true, notifyOnError: false });
        if (!result) {
          notify("No fue posible recalcular el pago por viajes.", "error");
          return;
        }
        notify(userMessage("driverTripPaymentRecalculated", parseNum(result.grossCop)), "success");
        renderPortalView();
      } catch (err) {
        notify(String(err?.message || "No fue posible recalcular."), "error");
      } finally {
        btn.disabled = false;
      }
    });
  });

  const settlementForm = document.getElementById("form-payroll-settlement");
  if (settlementForm) {
    enhancePayrollLiquidationSelects(settlementForm);
    wireTerminationSettlementForm(settlementForm);
    wireFormSubmitGuard(settlementForm, async (event) => {
      const data = readFormEntriesNormalized(settlementForm);
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) {
        failPortalField(settlementForm, "employeeId", userMessage("contractPickEmployee"));
        return;
      }
      if (employeeIsConductorServiceProvider(employee)) {
        failPortalField(
          settlementForm,
          "employeeId",
          "La liquidación contractual de terminación no aplica a conductores en prestación de servicios. Liquide viajes pendientes y cierre el contrato según su abogado laboral."
        );
        return;
      }
      if (!monthRange(data.month)) {
        failPortalField(settlementForm, "month", userMessage("payrollSelectMonth"));
        return;
      }
      const termDate = String(data.terminationDate || "").trim();
      if (!termDate) {
        failPortalField(settlementForm, "terminationDate", "Seleccione la fecha de terminación del contrato.");
        return;
      }
      const employeeStartDate = String(normalizePortalDateYmd(employee.startDate) || "").trim();
      if (employeeStartDate && termDate < employeeStartDate) {
        failPortalField(settlementForm, "terminationDate", "La fecha de terminación no puede ser anterior al ingreso del colaborador.");
        return;
      }
      if (String(data.month || "").trim() && String(termDate).slice(0, 7) !== String(data.month).trim()) {
        failPortalField(settlementForm, "terminationDate", "La fecha de terminación debe corresponder al mes liquidado.");
        return;
      }
      const position =
        typeof getPositionById === "function" ? getPositionById(String(employee.positionId || "")) : null;
      const settlement = computeTerminationSettlementFromForm(settlementForm, {
        employee,
        position,
        absencesAll: read(KEYS.hrAbsences, [])
      });
      if (!settlement || settlement.gross <= 0) {
        failPortalField(
          settlementForm,
          "cesantiasCop",
          "No fue posible calcular la liquidación. Use «Calcular liquidación sugerida» o revise fechas y rubros."
        );
        return;
      }
      const settlementDetail = {
        terminationDate: termDate,
        terminationCause: String(data.terminationCause || ""),
        employedDays: settlement.employedDays,
        cesantiasDaysYear: settlement.cesantiasDaysYear,
        cesantiasCausadas: settlement.cesantiasCausadas,
        cesantiasFondoBalance: settlement.cesantiasFondoBalance,
        cesantias: settlement.cesantias,
        interesesCesantias: settlement.interesesCesantias,
        primaProporcional: settlement.primaProporcional,
        vacaciones: settlement.vacaciones,
        salarioPendiente: settlement.salarioPendiente,
        auxilioPendiente: settlement.auxilioPendiente,
        pendingOvertimeCop: settlement.pendingOvertimeCop,
        pendingBonusCop: settlement.pendingBonusCop,
        indemnizacionDespido: settlement.indemnizacionDespido,
        indemnizacionAviso: settlement.indemnizacionAviso,
        indemnizacionContratoFijo: settlement.indemnizacionContratoFijo,
        renunciaAvisoDeduction: settlement.renunciaAvisoDeduction,
        indemnization: settlement.indemnizacionDespido + settlement.indemnizacionAviso,
        otrosSettlement: settlement.otrosSettlement,
        referenceDays360: settlement.cesantiasDaysYear,
        primaPropDaysReference: settlement.primaSemesterDays,
        vacationDaysReference: settlement.vacationDaysAccrued,
        vacationDaysTaken: settlement.vacationDaysTaken,
        primaSemesterDays: settlement.primaSemesterDays,
        eligibility: settlement.eligibility,
        integralSalaryApplied: settlement.integralSalaryApplied,
        indemnizacionFormula: settlement.indemnizacionFormula,
        taxClassification: settlement.taxClassification,
        devengosLines: settlement.devengosLines,
        deductionsLines: settlement.deductionsLines,
        finiquitoChecklist: settlement.finiquitoChecklist,
        withholdingNote: settlement.withholdingNote,
        legalDisclaimer: settlement.legalDisclaimer
      };
      const gross = settlement.gross;
      const run = stampCreatedRecord({
        id: newUuidV4(),
        employeeId: employee.id,
        employeeName: employee.name,
        month: data.month,
        gross,
        ibc: settlement.ibc,
        travelAllowance: 0,
        fuelReimbursement: 0,
        travelAllowanceAuto: 0,
        fuelReimbursementAuto: 0,
        travelAllowanceManual: 0,
        fuelReimbursementManual: 0,
        extras: settlement.pendingOvertimeCop,
        aux: settlement.auxilioPendiente,
        bonus: settlement.pendingBonusCop,
        tripCount: 0,
        interDepartmentTrips: 0,
        health: settlement.health,
        pension: settlement.pension,
        solidarity: settlement.solidarity,
        subsistence: settlement.subsistence,
        withholding: settlement.withholding,
        deductions: settlement.deductions,
        net: settlement.net,
        paid: false,
        payrollKind: "terminacion",
        payPrimaServicios: false,
        primaServiciosDays: null,
        primaServiciosCop: 0,
        payInteresesCesantias: false,
        interesesCesantiasCop: 0,
        cesantiasInterestBaseCop: null,
        cesantiasInterestDays: null,
        settlementDetail
      });
      const runs = read(KEYS.payrollRuns, []);
      if (payrollRunAlreadyExists(runs, employee.id, data.month, "terminacion")) {
        failPortalField(settlementForm, "month", "Ya existe una liquidación de terminación para este empleado y período.");
        return;
      }
      runs.unshift(run);
      try {
        await writeAwaitServerCreate(KEYS.payrollRuns, runs, run);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la liquidación en el servidor."), "error");
        return;
      }
      appendPayrollRunAuditLog("create", run, {
        summary: `Liquidación de terminación creada · neto $${parseNum(run.net).toLocaleString("es-CO")}`
      });
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      collapseCreatePanel("create-payroll-settlement");
      notify("Liquidación contractual registrada. Revise montos antes de marcar pagado.", "success");
      renderPortalView();
    }, payrollCreateFormSubmitOpts(settlementForm, { busyText: "Registrando liquidación…" }));
  }

  bindPayrollPayslipButtons(nodes.viewRoot);
  wirePayrollEmployeeLiquidationActions(nodes.viewRoot);



  nodes.viewRoot.querySelectorAll("[data-action='mark-payroll-paid']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const actor = currentUser();
      const id = String(btn.dataset.id || "");
      const all = read(KEYS.payrollRuns, []);
      const run = all.find((r) => r.id === id);
      if (!run || run.paid) return;
      if (requiresAdminHrApproval(actor?.role || "")) {
        if (btn.dataset.busy === "1") return;
        btn.dataset.busy = "1";
        btn.disabled = true;
        btn.setAttribute("aria-busy", "true");
        try {
          await queueApproval({
            type: "mark_payroll_paid",
            title: `Aprobar pago de nómina ${run.employeeName} (${run.month})`,
            payload: { payrollRunId: run.id, employeeName: run.employeeName, month: run.month },
            requestedByUserId: actor?.id || "",
            requestedByName: actor?.name || "Usuario"
          });
          notify(userMessage("payrollMarkPaidApprovalAdmin"), "info");
          renderPortalView();
        } catch (err) {
          btn.dataset.busy = "0";
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          notify(String(err?.message || "No fue posible enviar la solicitud de aprobación."), "error");
        }
        return;
      }
      openConfirmModal({
        title: "Confirmar pago de nómina",
        message: `Marcar como pagada la liquidación de ${run.employeeName} (${run.month}) por ${parseNum(run.net).toLocaleString("es-CO")} COP neto.`,
        confirmText: "Marcar pagado",
        onConfirm: async () => {
          const approver = payrollAuditActorLabel();
          const nextRuns = all.map((item) =>
                item.id === id
                  ? stampUpdatedRecord({
                      ...item,
                      paid: true,
                      paidAt: nowIso(),
                      approvedBy: approver
                    })
                  : item
              );
          try {
            await writeAwaitServerEdit(KEYS.payrollRuns, nextRuns, id);
          } catch (err) {
            notify(String(err?.message || "No fue posible marcar el pago en el servidor."), "error");
            return;
          }
          appendPayrollRunAuditLog("update", run, {
            summary: `Liquidación marcada como pagada · aprobado por ${approver} · neto $${parseNum(run.net).toLocaleString("es-CO")}`
          });
          notify(userMessage("payrollPaidMarked"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-hr-absence']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify(userMessage("adminOnlyDeleteHrPayrollRecord"), "error");
        return;
      }
      const id = String(btn.dataset.id || "").trim();
      if (!id) return;
      const removed = read(KEYS.hrAbsences, []).find((a) => String(a.id) === id) || null;
      openConfirmReasonModal({
        title: "Eliminar ausencia",
        message: removed
          ? `Se eliminará la ausencia de ${String(removed.employeeName || "colaborador")} (${String(removed.startDate || "-")} a ${String(removed.endDate || "-")}). Indique la justificación.`
          : "Se eliminará este registro de ausencia del expediente digital. Indique la justificación.",
        confirmText: "Eliminar",
        onConfirm: async (motivo) => {
          const ok = await removeFromPortalListAwaitServer(KEYS.hrAbsences, id);
          if (!ok) return;
          appendModuleAuditLog({
            action: "delete",
            moduleId: "payroll",
            entityId: id,
            entityLabel: removed
              ? `${String(removed.employeeName || "Colaborador")} · ${String(removed.startDate || "-")}`
              : "Ausencia",
            summary: removed
              ? `Ausencia eliminada (${String(removed.employeeName || "Colaborador")} · ${String(removed.startDate || "-")} a ${String(removed.endDate || "-")}). Motivo: ${String(motivo || "").trim()}`
              : `Ausencia eliminada. Motivo: ${String(motivo || "").trim()}`,
            actor: String(currentUser()?.email || currentUser()?.name || "—").trim()
          });
          if (removed?.employeeId) {
            await refreshPayrollDraftsLinked(removed.employeeId, removed.startDate, removed.endDate, {
              notifyOnError: false
            });
          }
          notify(userMessage("hrAbsenceDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-payroll-run']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify(userMessage("adminOnlyDeleteHrPayrollRecord"), "error");
        return;
      }
      const id = String(btn.dataset.id || "").trim();
      if (!id) return;
      const run = read(KEYS.payrollRuns, []).find((r) => String(r.id) === id);
      openConfirmReasonModal({
        title: "Eliminar liquidación",
        message: run
          ? `Eliminar el registro de liquidación (${run.month} · ${run.employeeName}). Indique la justificación. Solo administradores; no hay deshacer automático si ya se sincronó con servidor.`
          : "Eliminar este registro de liquidación.",
        confirmText: "Eliminar liquidación",
        onConfirm: async (motivo) => {
          const ok = await removeFromPortalListAwaitServer(KEYS.payrollRuns, id);
          if (!ok) return;
          appendPayrollRunAuditLog("delete", run, {
            summary: `Liquidación eliminada (${String(run?.month || "-")} · ${String(run?.employeeName || "Colaborador")})`,
            motivo
          });
          if (portalCanRefreshFromApi()) {
            await applyPortalBootstrapFromApi();
          }
          notify(userMessage("payrollRunDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  const exportPayroll = document.getElementById("export-payroll");
  if (exportPayroll) {
    exportPayroll.addEventListener("click", async () => {
      let rows = sortPayrollRunsByUiState(
        filterPayrollRunsByUiState(read(KEYS.payrollRuns, []), state.payrollFilters || defaultPayrollFilters()),
        String(state.payrollUi?.runSort || "recent")
      );
      if (portalCanRefreshFromApi()) {
        for (const r of rows) {
          if (r.payrollRunHeavyOmitted === true) {
            await ensurePayrollRunHeavyJsonLoaded(String(r.id || ""));
          }
        }
        rows = sortPayrollRunsByUiState(
          filterPayrollRunsByUiState(read(KEYS.payrollRuns, []), state.payrollFilters || defaultPayrollFilters()),
          String(state.payrollUi?.runSort || "recent")
        );
      }
      const hrAbsences = read(KEYS.hrAbsences, []);
      const csv = [
        "Mes,Tipo,Empleado,Devengado,IncapacidadAjusteCOP,IncapacidadResumen,AusentismosResumen,PrimaServicios,InteresesCesantias,BaseCesantíasIntereses,DíasInterés360,Viaticos,ReembolsoCombustible,IBC,Salud,Pension,Solidaridad,Deducciones,Neto,Estado"
      ]
        .concat(
          rows.map((r) => {
            const tipo = String(r.payrollKind || "mensual").toLowerCase();
            const esc = (v) =>
              `"${String(v ?? "")
                .replace(/\\/g, "\\\\")
                .replace(/"/g, '""')}"`;
            const inc = r.noveltiesDetail?.incapacity;
            const incapacityAdjust = inc ? parseNum(inc.totalAdjustCop) : 0;
            const incapacitySummary =
              inc && Array.isArray(inc.episodes) && inc.episodes.length
                ? inc.episodes.map((e) => `${e.days ?? "?"}d·${parseNum(e.adjustCop)}`).join("|")
                : "";
            const absenceSummary = buildPayrollAbsenceSummaryText(r, hrAbsences);
            return [
              r.month,
              tipo,
              r.employeeName,
              r.gross,
              incapacityAdjust,
              incapacitySummary,
              absenceSummary,
              r.primaServiciosCop ?? 0,
              r.interesesCesantiasCop ?? 0,
              r.cesantiasInterestBaseCop ?? "",
              r.cesantiasInterestDays ?? "",
              r.travelAllowance || 0,
              r.fuelReimbursement || 0,
              r.ibc || 0,
              r.health || 0,
              r.pension || 0,
              r.solidarity || 0,
              r.deductions,
              r.net,
              r.paid ? "Pagado" : "Pendiente"
            ]
              .map((cell) => (typeof cell === "number" ? cell : esc(cell)))
              .join(",");
          })
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nomina_resumen.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const renderDetailRows = portalDetailRenderRows;
  const buildDetailGrid = portalDetailBuildGrid;
  const fmtDateOr = (val, fallback = "—") => {
    const y = normalizePortalDateYmd(val);
    return y ? escapeHtml(y) : fallback;
  };

  /* ============= AUSENCIA: VER ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-hr-absence']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = read(KEYS.hrAbsences, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!a) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const typeLabel = payrollAbsenceTypeLabel(a.absenceType);
      const subtypeLabel = payrollAbsenceSubtypeLabel(a.absenceType, a.absenceSubtype);
      const sections = [
        {
          icon: "calendar",
          title: "Detalle",
          rows: renderDetailRows([
            ["Empleado", `<strong>${escapeHtml(String(a.employeeName || "-"))}</strong>`],
            ["Tipo", escapeHtml(typeLabel)],
            ["Subtipo", escapeHtml(subtypeLabel || "No aplica")],
            ["Inicio", fmtDateOr(a.startDate)],
            ["Fin", fmtDateOr(a.endDate)],
            ["Días calendario", String(parseNum(a.days || 0))],
            ["Días reconocidos", payrollFormatAbsenceQuantity(a.recognizedDays ?? a.days)],
            ["Soporte (N°)", escapeHtml(String(a.supportNumber || "-"))],
            ["Entidad/EPS/ARL", escapeHtml(String(a.epsEntity || "-"))],
            ["Registrado", fmtDateOr(a.createdAt)]
          ])
        },
        {
          icon: "file",
          title: "Observaciones",
          rows: a.notes
            ? `<p class="detail-note" style="white-space:pre-wrap;margin:0">${escapeHtml(String(a.notes))}</p>`
            : `<span class="muted">Sin observaciones.</span>`
        }
      ];
      openInfoModal({
        title: `Ausencia · ${typeLabel}`,
        subtitle: String(a.employeeName || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  /* ============= AUSENCIA: EDITAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='edit-hr-absence']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const all = read(KEYS.hrAbsences, []);
      const target = normalizeHrAbsenceRowForEditor(all.find((x) => String(x.id) === String(btn.dataset.id || "")));
      if (!target) return;
      openEditModal({
        title: "Editar ausencia",
        subtitle: String(target.employeeName || ""),
        submitText: "Guardar cambios",
        fields: [
          {
            name: "absenceType",
            label: "Tipo",
            type: "select",
            value: target.absenceType,
            options: payrollAbsenceSelectOptions()
          },
          {
            name: "absenceSubtype",
            label: "Subtipo",
            type: "select",
            value: target.absenceSubtype,
            options: payrollGetAbsenceSubtypeOptions(target.absenceType).length
              ? payrollGetAbsenceSubtypeOptions(target.absenceType)
              : [{ value: "", label: "No aplica" }]
          },
          { name: "startDate", label: "Fecha de inicio", type: "date", value: target.startDate || "", required: true },
          { name: "endDate", label: "Fecha de fin", type: "date", value: target.endDate || "", required: true },
          { name: "recognizedDays", label: "Días reconocidos", type: "number", value: String(target.recognizedDays ?? target.days ?? 1), min: 0.5, step: 0.5 },
          {
            type: "custom",
            html: `<p class="full muted" data-absence-recognition-hint style="margin:0;font-size:0.82rem"></p>`
          },
          { name: "supportNumber", label: "N° soporte / radicado", value: target.supportNumber || "" },
          { name: "epsEntity", label: "EPS / ARL / entidad", value: target.epsEntity || "" },
          {
            type: "custom",
            html: `<p class="full muted" data-absence-support-hint style="margin:0;font-size:0.82rem"></p>`
          },
          { name: "notes", label: "Observaciones", type: "textarea", value: target.notes || "", rows: 3 }
        ],
        afterMount: (formEl) => {
          const subtypeLabel = formEl.querySelector('[name="absenceSubtype"]')?.closest("label");
          if (subtypeLabel) subtypeLabel.setAttribute("data-absence-subtype-wrap", "");
          wireHrAbsenceFormBehavior(formEl);
        },
        onSubmit: async (form) => {
          const start = new Date(`${form.startDate}T12:00:00`);
          const end = new Date(`${form.endDate}T12:00:00`);
          const absenceEditForm = document.getElementById("crud-form");
          if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
            failPortalField(absenceEditForm, "startDate", "Fechas inválidas.");
            return false;
          }
          if (end.getTime() < start.getTime()) {
            failPortalField(absenceEditForm, "endDate", userMessage("absenceDateOrder"));
            return false;
          }
          const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
          const normalizedType = payrollNormalizeAbsenceTypeKey(form.absenceType || target.absenceType);
          const normalizedSubtype = payrollNormalizeAbsenceSubtype(normalizedType, form.absenceSubtype);
          const nextRecognizedDays = Math.max(0.5, Number(parseNum(form.recognizedDays || target.recognizedDays || days)));
          const legalValidation = payrollValidateAbsenceLegalRules({
            absenceType: normalizedType,
            absenceSubtype: normalizedSubtype,
            startDate: form.startDate,
            endDate: form.endDate,
            recognizedDays: nextRecognizedDays,
            supportNumber: form.supportNumber,
            epsEntity: form.epsEntity,
            notes: form.notes
          });
          if (!legalValidation.ok) {
            failPortalField(absenceEditForm, legalValidation.field || "startDate", legalValidation.message);
            return false;
          }
          const nextList = all.map((a) =>
            String(a.id) !== String(target.id)
              ? a
              : stampUpdatedRecord({
                  ...a,
                  absenceType: normalizedType,
                  absenceSubtype: normalizedSubtype || null,
                  startDate: form.startDate,
                  endDate: form.endDate,
                  days,
                  recognizedDays: nextRecognizedDays,
                  recognizedUnit: payrollAbsenceRecognizedUnit(normalizedType, normalizedSubtype),
                  supportNumber: String(form.supportNumber || "").trim(),
                  epsEntity: String(form.epsEntity || "").trim(),
                  notes: String(form.notes || "").trim()
                })
          );
          try {
            await writeAwaitServerEdit(KEYS.hrAbsences, nextList, target.id);
          } catch (err) {
            notify(String(err?.message || "No fue posible actualizar la ausencia en el servidor."), "error");
            return false;
          }
          const updatedAbsence = nextList.find((a) => String(a.id) === String(target.id));
          if (updatedAbsence) {
            logPortalAuditEvent?.("payroll", "update", {
              entityId: updatedAbsence.id,
              entityLabel: `${String(updatedAbsence.employeeName || "Colaborador")} · ${String(updatedAbsence.startDate || "-")}`,
              summary: `${String(updatedAbsence.absenceType || "Ausencia")} · ${parseNum(updatedAbsence.days)} día(s)`,
              at: updatedAbsence.updatedAt || nowIso()
            });
          }
          const linkResult = await refreshPayrollDraftsLinked(
            target.employeeId,
            form.startDate,
            form.endDate,
            { notifyOnError: false }
          );
          notify(payrollDraftLinkSuccessMessage(linkResult) || "Ausencia actualizada.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });
}

(function registerPayrollPortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.payroll = bindPayrollPortalControls;
})();
