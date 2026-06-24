/**
 * Modales y tarjetas RRHH (liquidaciones, contratación).
 * Carga con defer después de portal-runtime.js; registra en globalThis.__antaresPortalRrhhModals
 */
(function registerPortalModals() {
  "use strict";
  const G = globalThis;
  const {
    read, write, writeAwaitServer, KEYS, IC, STATUS, ROLES,
    state, openInfoModal, openEditModal, escapeHtml, escapeAttr, fmtDate, fmtDateOr,
    parseNum, notify, renderPortalView, reqRead, reqWriteAwait, canAdminEditTrip,
    formatRoute, requestTruckRequirementSummaryHtml, prettyStatus, companyProfileLogoUrl,
    getCompanyById, requestRequiresTermoking, requestTransportModeFromRequest,
    renderRequestModificationLogSectionHtml, parsePortalJsonSnapshot, snapPick,
    toInputDate, currentUser, nowIso, recalculateResourceAvailability,
    getTripRouteRatesNormalized, parseTripRateStorageKeyToRouteParts,
    formatRouteRateAuditSummary, buildRouteRateScopeStepInnerHtml, COLOMBIA_LOCATIONS,
    setSelectValueInsensitive, attachDepartmentCitySelects, wireRouteRateScopeSection,
    failPortalField, userMessage, buildTripRouteRateKey, tripRateStorageKey,
    buildRouteRateEntry, humanTripRateRouteLabelFromStorageKey,
    formatPayrollPeriodLabel, payrollDisplayLabelUpper, payrollRunTypeLabel, payrollRunGeneratedByLabel, payrollRunIsDriverTripPayment,
    payrollRunHasAbsenceDetail, ensureCrudModalElement, renderModalHead,
    renderModalFooterActions, wireModalDismiss, scrollOpenCrudModalIntoView,
    persistHrWorkspace, scrollToCreatePanelForm, colombiaTodayIsoDate
  } = globalThis;

function renderPayrollRunCard(run, { compact = false } = {}) {
  const paid = Boolean(run.paid);
  const stateTone = paid ? "paid" : "pending";
  const monthLabel = formatPayrollPeriodLabel(run.month);
  const periodRange =
    typeof formatPayrollCutRangeLabel === "function" && typeof resolvePayrollCutForClosingDate === "function"
      ? (() => {
          const closeYmd =
            typeof payrollPeriodClosingDateYmd === "function" ? payrollPeriodClosingDateYmd(run.month) : "";
          if (!closeYmd) return "";
          const cut = resolvePayrollCutForClosingDate(closeYmd, run.payrollKind || "mensual");
          return cut ? formatPayrollCutRangeLabel(cut) : "";
        })()
      : "";
  const typeLabel =
    typeof payrollDisplayLabelUpper === "function"
      ? payrollDisplayLabelUpper(payrollRunTypeLabel(run))
      : payrollRunTypeLabel(run);
  const generatedBy = payrollRunGeneratedByLabel(run);
  const approvedBy = run.paid ? String(run.approvedBy || "").trim() : "";
  const orig = String(run.liquidacionOrigin || run.origenLiquidacion || "manual").toLowerCase();
  const isDriverRun = payrollRunIsDriverTripPayment(run);
  const hasAbsenceDetail =
    String(run.payrollKind || "mensual") !== "terminacion" &&
    payrollRunHasAbsenceDetail(run, read(KEYS.hrAbsences, []));
  const tags = [];
  if (orig === "masiva") tags.push("Masiva");
  else if (orig === "automatica") tags.push("Automática");
  if (isDriverRun) tags.push("Prestación viajes");
  if (parseNum(run.primaServiciosCop) > 0) tags.push("Prima de servicios");
  if (parseNum(run.interesesCesantiasCop) > 0) tags.push("Int. cesantías");
  if (hasAbsenceDetail) tags.push("Ausentismo");
  const hrAdminDeletes = currentUser()?.role === ROLES.ADMIN;
  const statusHtml = paid
    ? '<span class="status status-viaje_asignado">Pagado</span>'
    : '<span class="status status-pendiente">Pendiente</span>';
  const tripYm = String(run.month || "").slice(0, 7);
  // Chips de etiquetas — visibles siempre (compact o no)
  const tagsHtml = tags.length
    ? `<div class="payroll-run-card-chips">${tags.map((t) => `<span class="payroll-run-chip">${escapeHtml(t)}</span>`).join("")}</div>`
    : "";
  // Columnas del grid de importes: conductores muestran viáticos/combustible; nómina muestra devengado/deducciones
  const col1Label = isDriverRun ? "Viáticos" : "Devengado";
  const col1Val = isDriverRun ? parseNum(run.travelAllowance || 0) : parseNum(run.gross);
  const col2Label = isDriverRun ? "Combustible" : "Deducciones";
  const col2Val = isDriverRun ? parseNum(run.fuelReimbursement || 0) : parseNum(run.deductions);
  const col2Neg = !isDriverRun;
  const amountsHtml = `<div class="payroll-run-amounts">
    <div class="payroll-run-amount-col">
      <span class="payroll-run-amount-label">${escapeHtml(col1Label)}</span>
      <span class="payroll-run-amount-value">$${col1Val.toLocaleString("es-CO")}</span>
    </div>
    <div class="payroll-run-amount-col">
      <span class="payroll-run-amount-label">${escapeHtml(col2Label)}</span>
      <span class="payroll-run-amount-value${col2Neg ? " payroll-run-amount-value--ded" : ""}">
        ${col2Neg ? "-" : ""}$${col2Val.toLocaleString("es-CO")}
      </span>
    </div>
    <div class="payroll-run-amount-col payroll-run-amount-col--net">
      <span class="payroll-run-amount-label">Neto</span>
      <span class="payroll-run-amount-value payroll-run-amount-value--net">$${parseNum(run.net).toLocaleString("es-CO")}</span>
    </div>
  </div>`;
  const actions = `<div class="payroll-run-card-actions toolbar">
      <button class="btn btn-sm btn-action" type="button" data-action="payslip" data-id="${escapeAttr(String(run.id))}" title="Desprendible">${IC.printer}${compact ? "" : " Desprendible"}</button>
      ${!paid && isDriverRun
        ? `<button class="btn btn-sm btn-outline" type="button" data-action="recalc-driver-trip" data-employee-id="${escapeAttr(String(run.employeeId))}" data-month="${escapeAttr(tripYm)}" title="Recalcular desde viajes y combustible">${IC.activity}${compact ? "" : " Recalcular"}</button>`
        : ""}
      ${!paid ? `<button class="btn btn-sm btn-approve" type="button" data-action="mark-payroll-paid" data-id="${escapeAttr(String(run.id))}" title="Marcar pagado">${IC.check}${compact ? "" : " Marcar pagado"}</button>` : ""}
      ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-payroll-run" data-id="${escapeAttr(String(run.id))}" title="Eliminar liquidación">${IC.trash}</button>` : ""}
    </div>`;
  const compactClass = compact ? " payroll-run-card--compact" : "";
  return `<article class="payroll-run-card payroll-run-card--${stateTone}${compactClass}" data-payroll-state="${stateTone}">
    <div class="payroll-run-stripe" aria-hidden="true"></div>
    <header class="payroll-run-card-head">
      <div class="payroll-run-card-identity">
        <p class="payroll-run-card-kicker">${escapeHtml(typeLabel)}</p>
        <h4 class="payroll-run-card-title">${escapeHtml(monthLabel)}</h4>
        ${periodRange ? `<p class="payroll-run-card-period muted">${escapeHtml(periodRange)}</p>` : ""}
        <p class="payroll-run-card-employee">${escapeHtml(String(run.employeeName || "—"))}</p>
        ${generatedBy ? `<p class="payroll-run-card-meta muted">Generado por ${escapeHtml(generatedBy)}</p>` : ""}
        ${approvedBy ? `<p class="payroll-run-card-meta muted">Pagado · aprobado por ${escapeHtml(approvedBy)}</p>` : ""}
      </div>
      ${statusHtml}
    </header>
    ${tagsHtml}
    ${amountsHtml}
    ${actions}
  </article>`;
}

function openPayrollBulkResultModal({ title, bodyHtml }) {
  const modal = ensureCrudModalElement();
  const card = modal.querySelector(".modal-card");
  if (card) card.className = "modal-card modal-card-edit modal-card--payroll-bulk-result";
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    ${renderModalHead(title)}
    <div class="payroll-bulk-result-body">${bodyHtml}</div>
    ${renderModalFooterActions({
      showCancel: false,
      primaryHtml: `<button type="button" id="crud-ok" class="btn btn-primary">${IC.check} Entendido</button>`
    })}
  `;
  modal.classList.remove("hidden");
  const close = () => modal.classList.add("hidden");
  wireModalDismiss(content, close, { closeIds: ["crud-close", "crud-ok"] });
  scrollOpenCrudModalIntoView();
}

function openPayrollEmployeeFromCandidate(candidateId) {
  const cid = String(candidateId || "").trim();
  if (!cid) return;
  state.hiringUi = { ...(state.hiringUi || {}), prefillEmployeeFromCandidateId: cid };
  state.payrollUi = { ...(state.payrollUi || {}), workspace: "operate", operateSection: "employee" };
  state.createPanels = buildPayrollCreatePanelsState("employee", state.createPanels || {}, { expandActive: true });
  persistHrWorkspace("payroll", "operate");
  persistHrWorkspace("hiring", state.hiringUi?.workspace || "data");
  state.currentView = "payroll";
  renderPortalView();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToCreatePanelForm("create-employee"));
  });
}

function openHiringContractFromCandidate(candidateId) {
  const cid = String(candidateId || "").trim();
  if (!cid) return;
  state.hiringUi = {
    ...(state.hiringUi || {}),
    prefillContractFromCandidateId: cid,
    workspace: "operate",
    operateSection: "contract"
  };
  state.createPanels = { ...(state.createPanels || {}), "create-contract": true };
  persistHrWorkspace("hiring", "operate");
  renderPortalView();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToCreatePanelForm("create-contract"));
  });
}

  G.__antaresPortalRrhhModals = {
    renderPayrollRunCard,
    openPayrollBulkResultModal,
    openPayrollEmployeeFromCandidate,
    openHiringContractFromCandidate
  };
  Object.assign(G, G.__antaresPortalRrhhModals);
})();
