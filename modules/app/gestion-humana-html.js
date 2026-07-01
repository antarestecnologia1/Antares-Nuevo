/**
 * Gestión humana — HTML de la vista (payrollHtml).
 * Carga con defer antes de gestion-humana.js.
 */
/** Lee si el riel de "Tipo de trámite" quedó contraído en una sesión anterior. */
function isPayrollOperateRailCollapsed() {
  try {
    return localStorage.getItem("antares_payroll_rail_collapsed") === "1";
  } catch (_err) {
    return false;
  }
}

function renderPayrollRunsViewToggle(activeView, context = "nomina") {
  const view = String(activeView || "cards").toLowerCase() === "list" ? "list" : "cards";
  const ctx = String(context || "nomina").toLowerCase() === "driver" ? "driver" : "nomina";
  const mkBtn = (mode, icon, label) => {
    const active = view === mode;
    return `<button type="button" class="payroll-runs-view-toggle__btn${active ? " is-active" : ""}" role="tab" aria-selected="${active ? "true" : "false"}" data-action="payroll-runs-view" data-view="${mode}" data-context="${ctx}">${icon}<span>${escapeHtml(label)}</span></button>`;
  };
  return `<div class="payroll-runs-view-toggle" role="tablist" aria-label="Vista de liquidaciones">${mkBtn("cards", IC.grid, "Tarjetas")}${mkBtn("list", IC.list, "Lista")}</div>`;
}

function renderPayrollEmployeesViewToggle(activeView) {
  const view = String(activeView || "list").toLowerCase() === "cards" ? "cards" : "list";
  const mkBtn = (mode, icon, label) => {
    const active = view === mode;
    return `<button type="button" class="payroll-runs-view-toggle__btn${active ? " is-active" : ""}" role="tab" aria-selected="${active ? "true" : "false"}" data-action="payroll-employees-view" data-view="${mode}">${icon}<span>${escapeHtml(label)}</span></button>`;
  };
  return `<div class="payroll-runs-view-toggle payroll-contracts-view-toggle" role="tablist" aria-label="Vista de colaboradores">${mkBtn("list", IC.list, "Tabla")}${mkBtn("cards", IC.grid, "Tarjetas")}</div>`;
}

function computePayrollContractDashboardStats(summaries) {
  const fixed = (summaries || []).filter((s) => isFixedTermContractType(s.raw?.contractType));
  return {
    total: fixed.length,
    expired: fixed.filter((s) => s.contract?.statusSlug === "expired").length,
    notice: fixed.filter((s) => s.contract?.statusSlug === "notice_window").length,
    active: fixed.filter((s) => s.contract?.statusSlug === "active").length
  };
}

function renderPayrollEmployeesConsultAlerts(stats) {
  const s = stats || { total: 0, expired: 0, notice: 0, active: 0 };
  const chips = [];
  if (s.expired > 0) {
    chips.push(
      `<span class="payroll-consult-alert payroll-consult-alert--expired">${IC.alertTriangle} ${escapeHtml(String(s.expired))} vencido${s.expired === 1 ? "" : "s"}</span>`
    );
  }
  if (s.notice > 0) {
    chips.push(
      `<span class="payroll-consult-alert payroll-consult-alert--notice">${IC.clock} ${escapeHtml(String(s.notice))} por vencer</span>`
    );
  }
  if (!chips.length) return "";
  return `<div class="payroll-consult-alerts" role="status" aria-label="Alertas de contratos">${chips.join("")}</div>`;
}

function renderPayrollEmployeesConsultToolbar(canDeletePayrollEmployees) {
  return `<div class="payroll-consult-toolbar">${renderPayrollContractsFilterBar(canDeletePayrollEmployees)}</div>`;
}

function renderPayrollContractsFilterBar(canDeletePayrollEmployees) {
  return `<div class="payroll-contracts-filterbar">
    <label class="payroll-contracts-search">
      <span class="visually-hidden">Buscar</span>
      ${IC.search}
      <input type="search" id="payroll-employee-search" placeholder="Buscar colaborador, documento o cargo…" autocomplete="off" />
    </label>
    <label class="payroll-contracts-filter">
      <span>Contrato</span>
      <select id="payroll-employee-contract-type-filter">
        <option value="all">Todos</option>
        <option value="fixed">Término fijo</option>
        <option value="indefinite">Indefinido</option>
        <option value="services">Prestación de servicios</option>
      </select>
    </label>
    <label class="payroll-contracts-filter">
      <span>Estado</span>
      <select id="payroll-employee-contract-filter">
        <option value="all">Todos</option>
        <option value="notice_window">Por vencer (30 días)</option>
        <option value="expired">Vencidos</option>
        <option value="active">Vigentes</option>
      </select>
    </label>
    <label class="payroll-contracts-filter">
      <span>Fecha</span>
      <select id="payroll-employee-contract-date-filter">
        <option value="all">Todas</option>
        <option value="ends_30">Vence en 30 días</option>
        <option value="ends_month">Vence este mes</option>
      </select>
    </label>
    <div class="payroll-contracts-filterbar__actions">
      <button type="button" class="payroll-filters-reset" id="payroll-contracts-clear-filters" aria-label="Limpiar filtros de búsqueda">${IC.rotateCcw}<span>Limpiar filtros</span></button>
    </div>
  </div>`;
}

function renderPayrollContractsTableToolbar(activeView, canDeletePayrollEmployees) {
  const bulk = canDeletePayrollEmployees
    ? `<div class="payroll-contracts-bulk toolbar">
        <span class="payroll-contracts-bulk__count" id="employees-selected-count" hidden>0 seleccionados</span>
        <button type="button" class="btn btn-sm btn-outline" id="export-employees-contracts">${IC.download} Exportar</button>
        <button type="button" class="btn btn-sm btn-outline btn-reject" id="employees-delete-selected">${IC.trash} Eliminar seleccionados</button>
      </div>`
    : `<div class="payroll-contracts-bulk toolbar">
        <button type="button" class="btn btn-sm btn-outline" id="export-employees-contracts">${IC.download} Exportar</button>
      </div>`;
  return `<div class="payroll-contracts-table-toolbar">
    ${renderPayrollEmployeesViewToggle(activeView)}
    ${bulk}
  </div>`;
}

function renderPayrollContractsPagination(total, page, pageSize) {
  const safeSize = Math.max(5, Number(pageSize) || 10);
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * safeSize + 1;
  const end = Math.min(total, safePage * safeSize);
  const pages = [];
  const windowStart = Math.max(1, safePage - 2);
  const windowEnd = Math.min(totalPages, safePage + 2);
  for (let p = windowStart; p <= windowEnd; p++) {
    pages.push(
      `<button type="button" class="payroll-contracts-page-btn${p === safePage ? " is-active" : ""}" data-action="payroll-employees-page" data-page="${p}" aria-label="Página ${p}"${p === safePage ? ' aria-current="page"' : ""}>${p}</button>`
    );
  }
  return `<footer class="payroll-contracts-pagination">
    <p class="payroll-contracts-pagination__meta muted">Mostrando <strong>${start}</strong> a <strong>${end}</strong> de <strong>${total}</strong> colaborador${total === 1 ? "" : "es"}</p>
    <div class="payroll-contracts-pagination__controls">
      <label class="payroll-contracts-page-size">
        <select id="payroll-employees-page-size" data-action="payroll-employees-page-size">
          ${[5, 10, 20, 50].map((n) => `<option value="${n}"${n === safeSize ? " selected" : ""}>${n} por página</option>`).join("")}
        </select>
      </label>
      <div class="payroll-contracts-page-nav">
        <button type="button" class="payroll-contracts-page-btn" data-action="payroll-employees-page" data-page="${Math.max(1, safePage - 1)}" aria-label="Anterior"${safePage <= 1 ? " disabled" : ""}>${IC.chevronLeft || "‹"}</button>
        ${pages.join("")}
        <button type="button" class="payroll-contracts-page-btn" data-action="payroll-employees-page" data-page="${Math.min(totalPages, safePage + 1)}" aria-label="Siguiente"${safePage >= totalPages ? " disabled" : ""}>${IC.chevronRight || "›"}</button>
      </div>
    </div>
  </footer>`;
}

function payrollHtml() {
  const employees = readArray(KEYS.payrollEmployees);
  const companies = readArray(KEYS.companies);
  const rules = read(KEYS.travelAllowanceRules, { interDepartmentTripAmount: 85000 });
  const rulesUpdatedLabel = fmtDateOr(rules.updatedAt || rules.createdAt, "—");
  const positions = getActivePositions();
  const hasActivePositions = positions.length > 0;
  const positionOpts = positions
    .map(
      (p) =>
        `<option value="${escapeAttr(String(p.id))}">${escapeHtml(String(p.name || ""))} · $${parseNum(p.baseSalary).toLocaleString("es-CO")}</option>`
    )
    .join("");
  const companyOptions = companies
    .filter((c) => isCompanyRecordActive(c))
    .map((c) => `<option value="${c.id}">${escapeHtml(String(c.name || ""))} (${escapeHtml(companyKindLabel(c.companyKind))})</option>`)
    .join("");
  const allRuns = readArray(KEYS.payrollRuns);
  const nominaRunsAll = filterPayrollNominaRuns(allRuns);
  const driverPaymentRunsAll = filterDriverTripPaymentRuns(allRuns);
  const conductorEmployees = listConductorServiceEmployees(employees);
  const nominaEmployees = listPayrollLiquidationEmployees(employees);
  const payrollUi = state.payrollUi || { runSort: "recent", workspace: "operate", dataSection: "employees" };
  const payrollLiquidationMode = String(payrollUi.liquidationMode || "single").toLowerCase() === "bulk" ? "bulk" : "single";
  const payrollNominaEmployeeOptions = nominaEmployees
    .map(
      (e) =>
        `<option value="${escapeAttr(String(e.id))}">${escapeHtml(String(e.name || ""))} · ${escapeHtml(String(e.idDoc || "—"))} · ${escapeHtml(String(e.payFrequency || "Mensual"))}</option>`
    )
    .join("");
  const absences = readArray(KEYS.hrAbsences);
  const filters = state.payrollFilters || defaultPayrollFilters();
  const runSort = String(payrollUi.runSort || "recent");
  const runsView = String(payrollUi.runsView || "cards").toLowerCase() === "list" ? "list" : "cards";
  const employeesView = String(payrollUi.employeesView || "list").toLowerCase() === "cards" ? "cards" : "list";
  const payrollWorkspace = normalizeHrWorkspace("payroll", payrollUi.workspace);
  const payrollDataSection = normalizePayrollDataSection(payrollUi.dataSection);
  const payrollOperateSection = normalizePayrollOperateSection(payrollUi.operateSection);
  const payrollCreateUi = buildPayrollCreatePanelsState(payrollOperateSection, state.createPanels || {});
  const filterPeriod = String(filters.period || "all");
  const filterEmployee = String(filters.employee || "");
  const filterStatus = String(filters.status || "all");
  const filterFrequency = String(filters.frequency || "all");
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const runs = filterPayrollRunsByUiState(nominaRunsAll, filters, "nomina");
  const sortedRuns = sortPayrollRunsByUiState(runs, runSort);
  const payrollRunsRenderLimit = Number(state.payrollRunsRenderLimit) || RENDER_WINDOW_SIZE;
  const runsToRender = renderWindowSlice(sortedRuns, payrollRunsRenderLimit);
  const payrollRunsMoreBar = renderWindowMoreBar(sortedRuns.length, runsToRender.length, "payroll-runs-render-more");
  const sortedDriverRuns = sortPayrollRunsByUiState(
    filterPayrollRunsByUiState(driverPaymentRunsAll, filters, "driver"),
    runSort
  );
  const pending = nominaRunsAll.filter((r) => !r.paid).length;
  const pendingDriverPayments = driverPaymentRunsAll.filter((r) => !r.paid).length;
  const pendingDriverCop = driverPaymentRunsAll.filter((r) => !r.paid).reduce((a, r) => a + parseNum(r.net), 0);
  const totalPayrollMonth = nominaRunsAll
    .filter((r) => payrollPeriodCalendarYm(r.month) === currentYm)
    .reduce((acc, run) => acc + parseNum(run.net), 0);
  const totalDriverMonth = driverPaymentRunsAll
    .filter((r) => payrollPeriodCalendarYm(r.month) === currentYm)
    .reduce((acc, run) => acc + parseNum(run.net), 0);
  const pendingAbsenceApprovals = readArray(KEYS.approvals).filter((a) => a.status === "pendiente" && a.type === "register_hr_absence").length;
  const hrAdminDeletes = currentUser()?.role === ROLES.ADMIN;
  const canDeletePayrollEmployees = canManagePayrollModule(currentUser());
  const canEditLegalParameters = currentUser()?.role === ROLES.ADMIN;
  const legalHistory = laborSystemParametersHistoryRows();
  const legalSelectedYear = Number(state.payrollLegalUi?.year || legalHistory[0]?.year || now.getFullYear());
  const legalDraftBase = laborSystemParametersDraftForYear(legalSelectedYear, legalHistory);
  const legalDraftOverride =
    state.payrollLegalUi?.draftOverride && typeof state.payrollLegalUi.draftOverride === "object"
      ? state.payrollLegalUi.draftOverride
      : null;
  const legalDraft = legalDraftOverride
    ? { ...legalDraftBase, ...legalDraftOverride, year: legalSelectedYear }
    : legalDraftBase;
  const legalYearOptions = laborSystemParametersSelectableYears(legalHistory);
  const legalAppliedYearOptions = [...new Set([legalDraft.year, ...legalYearOptions])].sort((a, b) => b - a);
  const payrollRunsForLegalYear = allRuns.filter((run) => String(run.month || "").startsWith(`${legalDraft.year}`)).length;
  const legalCurrentCap = Math.max(0, parseNum(legalDraft.smmlvCop) * CO_TRANSPORT_ALLOWANCE_MAX_SMMLV);
  const healthRatePct = (parseNum(legalDraft.healthEmployeeRate) * 100).toFixed(2).replace(/\.00$/, "");
  const pensionRatePct = (parseNum(legalDraft.pensionEmployeeRate) * 100).toFixed(2).replace(/\.00$/, "");
  const employeeSummaries = employees.map((e) => summarizePayrollEmployeeForDirectory(e));
  const contractNoticeCount = employeeSummaries.filter(
    (s) => s.contract.applies && (s.contract.statusSlug === "notice_window" || s.contract.statusSlug === "expired")
  ).length;
  const contractDashboardStats = computePayrollContractDashboardStats(employeeSummaries);
  const employeesPageSize = Math.max(5, Number(payrollUi.employeesPageSize) || 10);
  const employeesPage = Math.max(1, Number(payrollUi.employeesPage) || 1);
  const employeesTotal = employeeSummaries.length;
  const employeesPageCount = Math.max(1, Math.ceil(employeesTotal / employeesPageSize));
  const employeesSafePage = Math.min(employeesPage, employeesPageCount);
  const employeesPageStart = (employeesSafePage - 1) * employeesPageSize;
  const employeeSummariesPage = employeeSummaries.slice(employeesPageStart, employeesPageStart + employeesPageSize);
  const employeeCards = employeeSummariesPage
    .map((item) => renderPayrollEmployeeDirectoryCard(item, canDeletePayrollEmployees, { compact: true }))
    .join("");
  const employeeTableRows = employeeSummariesPage
    .map((item) => renderPayrollEmployeeDirectoryTableRow(item, canDeletePayrollEmployees))
    .join("");
  const runRows = runsToRender
    .map((r) => {
      const state = r.paid ? "paid" : "pending";
      const monthLabel = formatPayrollPeriodLabel(r.month);
      const pk = String(r.payrollKind || "mensual");
      const typeCell = (() => {
        if (pk === "terminacion") return '<span class="status status-viaje_asignado">Terminación</span>';
        const bits = [escapeHtml(payrollRunTypeLabel(r).replace(/^Nómina\s+/i, ""))];
        const orig = String(r.liquidacionOrigin || r.origenLiquidacion || "manual").toLowerCase();
        if (orig === "masiva") bits.push('<span class="status status-pendiente" title="Generada por liquidación masiva (RRHH)">Masiva</span>');
        else if (orig === "automatica") bits.push('<span class="status status-pendiente" title="Generada por el servidor según periodicidad de pago">Automática</span>');
        if (parseNum(r.primaServiciosCop) > 0) bits.push("Prima");
        if (parseNum(r.interesesCesantiasCop) > 0) bits.push("Int. cesantías");
        if (String(r.payrollKind || "mensual") !== "terminacion" && payrollRunHasAbsenceDetail(r, read(KEYS.hrAbsences, []))) {
          bits.push("Ausentismo");
        }
        return `<span class="muted">${bits.join(" · ")}</span>`;
      })();
      const generatedBy = payrollRunGeneratedByLabel(r);
      return `<tr data-payroll-state="${state}">
        <td><strong>${escapeHtml(monthLabel)}</strong></td>
        <td>${typeCell}</td>
        <td>${escapeHtml(String(r.employeeName || "—"))}${generatedBy ? `<div class="muted" style="font-size:0.82rem;margin-top:2px">Generado por ${escapeHtml(generatedBy)}</div>` : ""}</td>
        <td>$${parseNum(r.gross).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.travelAllowance || 0).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.fuelReimbursement || 0).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.deductions).toLocaleString("es-CO")}</td>
        <td><strong>$${parseNum(r.net).toLocaleString("es-CO")}</strong></td>
        <td>${r.paid ? '<span class="status status-viaje_asignado">Pagado</span>' : '<span class="status status-pendiente">Pendiente</span>'}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-action" data-action="payslip" data-id="${escapeAttr(String(r.id))}">${IC.printer} Desprendible</button>
          ${!r.paid ? `<button class="btn btn-sm btn-approve" data-action="mark-payroll-paid" data-id="${escapeAttr(String(r.id))}">${IC.check} Marcar pagado</button>` : ""}
          ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-payroll-run" data-id="${escapeAttr(String(r.id))}" title="Eliminar esta liquidación (solo administradores)">${IC.trash} Eliminar liquidación</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");

  const licenseCategoryOptions = selectOptionsFromCatalog(CO_CATALOGS.licenseCategories);
  const epsOptions = selectOptionsFromCatalog(CO_CATALOGS.eps);
  const arlOptions = selectOptionsFromCatalog(CO_CATALOGS.arl);
  const bloodTypeOptions = selectOptionsFromCatalog(CO_CATALOGS.bloodTypes);
  const pensionFundOptions = selectOptionsFromCatalog(CO_CATALOGS.pensionFunds);
  const docTypeOptions = CO_CATALOGS.documentTypes.map((d) => `<option value="${d}">${d === "CC" ? "Cédula de ciudadanía" : d === "CE" ? "Cédula de extranjería" : d === "PAS" ? "Pasaporte" : d === "PEP" ? "Permiso especial (PEP)" : "Tarjeta de identidad"}</option>`).join("");
  const contractTypeOpts = CO_CATALOGS.contractTypes.map((c) => `<option>${c}</option>`).join("");
  const severanceOpts = selectOptionsFromCatalog(CO_CATALOGS.severanceFunds);
  const compensationOpts = selectOptionsFromCatalog(CO_CATALOGS.compensationFunds);
  const arlRiskOpts = selectOptionsFromCatalog(CO_CATALOGS.arlRiskLevels);
  const contributorOpts = selectOptionsFromCatalog(CO_CATALOGS.contributorTypes);
  const banksOpts = selectOptionsFromCatalog(CO_CATALOGS.banks);
  const accountTypeOpts = selectOptionsFromCatalog(CO_CATALOGS.accountTypes);
  const educationOpts = selectOptionsFromCatalog(CO_CATALOGS.educationLevel);
  const maritalOpts = selectOptionsFromCatalog(CO_CATALOGS.maritalStatus);
  const genderOpts = selectOptionsFromCatalog(CO_CATALOGS.genders);
  const payFreqOpts = payrollPayFrequencySelectOptions("Mensual");
  const formEmp = `<form id="form-employee" novalidate class="payroll-emp-form p-form p-form-colored hr-form-flow">
    <div class="hr-form-wizard payroll-wizard" data-hr-wizard="employee" aria-label="Registro de empleado por pasos">
      <header class="payroll-wizard__head">
        <div class="payroll-wizard__head-copy">
          <span class="payroll-wizard__eyebrow">Vinculación laboral</span>
          <h3 class="payroll-wizard__title">Expediente del colaborador</h3>
          <p class="payroll-wizard__desc">Complete la información del colaborador y genere el expediente de vinculación con contrato Word.</p>
        </div>
        <div class="payroll-wizard__progress hr-form-wizard-meta">
          <span class="hr-wizard-progress-label" data-hr-wizard-progress>Paso 1 de 6</span>
          <div class="hr-wizard-progress-track" aria-hidden="true"><span class="hr-wizard-progress-fill" data-hr-wizard-progress-fill style="width:16.666667%"></span></div>
          <span class="payroll-wizard__progress-pct" data-hr-wizard-progress-pct>16% completado</span>
        </div>
      </header>
      <div class="payroll-wizard__layout">
        <nav class="payroll-wizard__steps hr-form-wizard-dots" role="tablist" aria-label="Secciones del formulario">
          <button type="button" class="hr-form-wizard-dot is-active" data-hr-wizard-dot="0" aria-label="Paso 1: identidad"><span class="hr-dot-num">1</span><span><small>Identidad</small><span class="payroll-wizard__step-hint">CC, datos personales</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="1" aria-label="Paso 2: contacto"><span class="hr-dot-num">2</span><span><small>Contacto</small><span class="payroll-wizard__step-hint">Ubicación y emergencias</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="2" aria-label="Paso 3: contrato laboral"><span class="hr-dot-num">3</span><span><small>Contrato</small><span class="payroll-wizard__step-hint">Cargo, salario, plazo</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="3" aria-label="Paso 4: seguridad social"><span class="hr-dot-num">4</span><span><small>Seguridad social</small><span class="payroll-wizard__step-hint">EPS, ARL, fondos</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="4" aria-label="Paso 5: datos bancarios"><span class="hr-dot-num">5</span><span><small>Datos bancarios</small><span class="payroll-wizard__step-hint">Cuenta de pago</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="5" aria-label="Paso 6: conductor"><span class="hr-dot-num">6</span><span><small>Conductor</small><span class="payroll-wizard__step-hint">Opcional si aplica</span></span></button>
        </nav>
        <div class="payroll-wizard__panels">

      <div class="hr-form-step is-active" data-step-index="0">
    <div class="payroll-wizard__section">
      <h4 class="payroll-wizard__section-title">${IC.user} Datos personales</h4>
      <div class="form-section-grid payroll-wizard__section-grid">
        <div class="full payroll-wizard-photo-row">
          <label class="payroll-wizard-upload-zone" data-emp-create-avatar-label for="emp-create-avatar-input" title="Arrastra y suelta una imagen o haz clic para seleccionar · JPG o PNG · Máx. 5 MB">
            <input type="file" id="emp-create-avatar-input" name="avatarFile" accept="image/jpeg,image/png,image/webp" class="profile-avatar-file-input" aria-label="Foto del empleado" />
            <span class="payroll-wizard-upload-zone__icon" aria-hidden="true">${IC.upload}</span>
            <span class="payroll-wizard-upload-zone__preview profile-avatar-initial" data-emp-avatar-initial aria-hidden="true">E</span>
          </label>
          <div class="payroll-wizard-photo-copy">
            <span class="payroll-wizard-photo-copy__title">Foto del colaborador</span>
            <span class="payroll-wizard-photo-copy__meta">Clic o arrastra una imagen · JPG/PNG · Máx. 5 MB</span>
          </div>
          <button type="button" class="payroll-wizard-tip-trigger" aria-label="Consejo para la foto del colaborador">
            <span aria-hidden="true">${IC.info}</span>
            <span class="payroll-wizard-tip-trigger__pop" role="tooltip">Use una foto clara del rostro, fondo neutro y buena iluminación. Mejora la credencial interna y el contrato Word.</span>
          </button>
        </div>
        <label class="full">${fieldLabel(IC.user, "Nombre completo", { required: true })}<input name="name" required placeholder="Nombres y apellidos completos" data-antares-restrict="person-name" data-antares-field="person-name" /></label>
        <label>${fieldLabel(IC.file, "Tipo de documento", { required: true })}<select name="documentType" required>${docTypeOptions}</select></label>
        <label>${fieldLabel(IC.badge, "Número de documento", { required: true })}<input name="idDoc" required placeholder="Ej.: 1036785371" data-antares-restrict="alnum-doc" data-antares-field="doc" /></label>
        <label>${fieldLabel(IC.cake, "Fecha de nacimiento", { required: true })}<input type="date" name="birthDate" required data-antares-validate-blur="date-iso" /></label>
        <label>${fieldLabel(IC.users, "Género", { required: true })}<select name="gender" required><option value="">Seleccionar…</option>${genderOpts}</select></label>
        <label>${fieldLabel(IC.heart, "Estado civil")}<select name="maritalStatus">${maritalOpts}</select></label>
        <label>${fieldLabel(IC.activity, "Tipo de sangre (RH)", { required: true })}<select name="bloodType" required>${bloodTypeOptions}</select></label>
        <label>${fieldLabel(IC.graduation, "Nivel educativo")}<select name="educationLevel">${educationOpts}</select></label>
        <label>${fieldLabel(IC.heart, "¿Sufre alguna enfermedad o condición médica?", { required: true })}<select name="hasIllness" id="emp-has-illness" required>
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select></label>
        <label class="full hidden" id="emp-illness-detail-label">${fieldLabel(IC.alertTriangle, "¿Cuál? (descripción libre)")}<textarea name="illnessDescription" id="emp-illness-detail" rows="2" placeholder="Detalle breve para uso médico/HR (alergias, condiciones crónicas, medicación regular, etc.)" data-antares-validate-blur="db-upper-multiline" data-antares-field="db-upper-multiline"></textarea></label>
      </div>
    </div>
      </div>

      <div class="hr-form-step hidden" data-step-index="1">
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.mapPin} Contacto y residencia</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="employee-department" required><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="employee-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Dirección de residencia")}<input name="address" required placeholder="Carrera 15 # 6-56, Apto 302, Barrio La Floresta" data-antares-validate-blur="db-upper" data-antares-field="db-upper" /></label>
        <label>${fieldLabel(IC.phone, "Teléfono celular")}
        <div class="phone-input-professional" role="group" aria-label="Teléfono celular">
        <span class="phone-cc-badge" aria-hidden="true"><span class="phone-dial-code">+57</span></span>
        <input class="phone-national-input" name="phone" required placeholder="3001234567" data-antares-restrict="digits" data-antares-validate-blur="phone-loose" maxlength="10" inputmode="tel" pattern="[0-9]{10}" />
        </div></label>
        <label>${fieldLabel(IC.mail, "Correo personal")}<input type="email" name="personalEmail" placeholder="empleado@correo.com" data-antares-validate-blur="email" data-antares-restrict="email-local" /></label>
        <label>${fieldLabel(IC.user, "Contacto de emergencia")}<input name="emergencyContact" required data-antares-restrict="person-name" data-antares-field="person-name" /></label>
        <label>${fieldLabel(IC.phone, "Teléfono emergencia")}
        <div class="phone-input-professional" role="group" aria-label="Teléfono emergencia">
        <span class="phone-cc-badge" aria-hidden="true"><span class="phone-dial-code">+57</span></span>
        <input class="phone-national-input" name="emergencyPhone" required placeholder="3001234567" data-antares-restrict="digits" data-antares-validate-blur="phone-loose" maxlength="10" inputmode="tel" pattern="[0-9]{10}" />
        </div></label>
        <label>${fieldLabel(IC.heart, "Parentesco emergencia")}<input name="emergencyRelation" placeholder="Cónyuge, padre, hermano(a)..." data-antares-restrict="person-name" data-antares-field="person-name" /></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="2">
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.briefcase} Datos laborales</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.briefcase, "Empresa")}<select name="companyId" required><option value="">Seleccione</option>${companyOptions}</select></label>
        <label>${fieldLabel(IC.briefcase, "Cargo (catálogo)")}<select name="positionId" id="emp-position-select" required${hasActivePositions ? "" : " disabled aria-disabled=\"true\""}><option value="">${hasActivePositions ? "Seleccione un cargo creado en Contratación" : "No hay cargos creados todavía"}</option>${positionOpts}</select></label>
        <p class="full ${hasActivePositions ? "muted" : "emp-position-empty-hint"}" id="emp-position-catalog-hint" style="font-size:0.82rem;line-height:1.45;margin:0">${
          hasActivePositions
            ? "Solo aparecen los cargos creados y activos en Contratación. Al elegir uno se cargan salario, tipo de contrato, jornada, riesgo ARL y auxilio de transporte."
            : "Primero cree el cargo en Contratación → Cargos. Aquí solo se listan los cargos del catálogo, no se escriben a mano."
        }</p>
        <input type="hidden" name="workSchedule" id="emp-work-schedule" value="" />
        <label>${fieldLabel(IC.activity, "Tipo de contrato")}<select name="contractType" id="emp-contract-type" required>${contractTypeOpts}</select></label>
        <div id="emp-contract-duration-block" class="emp-contract-duration-panel full hidden" style="grid-column:1/-1" hidden aria-hidden="true">
          <p class="emp-contract-duration-title">${fieldLabel(IC.calendar, "Plazo o duración del contrato")}</p>
          <p class="muted emp-contract-duration-hint">Obligatorio solo para <strong>término fijo</strong> o <strong>prestación de servicios</strong>. Elija meses, años o texto libre (otro).</p>
          <div class="form-section-grid emp-contract-duration-fields">
            <label>${fieldLabel(IC.calendar, "Unidad de tiempo")}<select name="contractDurationUnit" id="emp-contract-duration-unit">
              <option value="">${escapeHtml("Seleccione...")}</option>
              <option value="meses">${escapeHtml("Meses")}</option>
              <option value="anios">${escapeHtml("Años")}</option>
              <option value="otro">${escapeHtml("Otro (texto libre)")}</option>
            </select></label>
            <div id="emp-contract-duration-qty-wrap" class="emp-contract-duration-branch hidden" hidden aria-hidden="true">
              <label>${fieldLabel(IC.hash, "Cantidad")}<input type="number" name="contractDurationAmount" id="emp-contract-duration-amount" min="1" max="600" placeholder="Ej.: 12" /></label>
            </div>
            <div id="emp-contract-duration-other-wrap" class="emp-contract-duration-branch full hidden" hidden aria-hidden="true">
              <label>${fieldLabel(IC.file, "Describa la duración")}<textarea name="contractDurationOther" id="emp-contract-duration-other" rows="2" placeholder="Ej.: plazo legal o alcance del encargo"></textarea></label>
            </div>
          </div>
        </div>
        <label>${fieldLabel(IC.calendar, "Fecha ingreso a la empresa")}<input type="date" name="startDate" id="emp-start-date" required /></label>
        <div id="emp-contract-vigente-start-wrap" class="emp-contract-vigente-start full hidden" style="grid-column:1/-1" hidden aria-hidden="true">
          <label>${fieldLabel(IC.calendar, "Fecha inicio contrato vigente")}<input type="date" name="contractVigenteStartDate" id="emp-contract-vigente-start-date" /></label>
          <p class="muted" style="margin:0.35rem 0 0;font-size:0.82rem;line-height:1.45">Inicio del contrato a término fijo o de la renovación actual. La antigüedad laboral sigue en «Fecha ingreso a la empresa».</p>
        </div>
        <div id="emp-contract-end-wrap" class="emp-contract-end-preview full hidden" style="grid-column:1/-1" hidden aria-hidden="true">
          <label>${fieldLabel(IC.calendar, "Fecha fin del contrato")}<input type="date" name="contractEndDate" id="emp-contract-end-date" readonly tabindex="-1" aria-readonly="true" /></label>
          <p class="muted emp-contract-renewal-hint" id="emp-contract-renewal-hint" style="margin:0.35rem 0 0;font-size:0.82rem;line-height:1.45"></p>
        </div>
        <label>${fieldLabel(IC.dollar, "Salario base mensual (COP)")}<input type="number" name="baseSalary" id="emp-base-salary" value="${CO_HR_RULES.minMonthlySalary}" min="${CO_HR_RULES.minMonthlySalary}" required placeholder="Mín. SMMLV ${CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")}" data-antares-restrict="decimal" data-antares-validate-blur="decimal" /></label>
        <label>${fieldLabel(IC.dollar, "Auxilio legal transporte / conectividad (COP)")}<input type="number" name="transportAllowance" id="emp-transport-allowance" value="${CO_HR_RULES.transportAllowance}" min="0" /></label>
        <p class="full muted" id="emp-legal-comp-hint" style="font-size:0.82rem;line-height:1.45;margin:0">${escapeHtml(employeeTransportAllowanceGuidance(CO_HR_RULES.minMonthlySalary))}</p>
        <label>${fieldLabel(IC.clock, "Periodicidad de pago")}<select name="payFrequency">${payFreqOpts}</select></label>
        <label>${fieldLabel(IC.layers, "Centro de costos")}<input name="costCenter" placeholder="Ej: CC-OPERACIONES-01" data-antares-validate-blur="db-upper" data-antares-field="db-upper" /></label>
        <label>${fieldLabel(IC.shield, "Tipo de cotizante")}<select name="contributorType">${contributorOpts}</select></label>
        <label>${fieldLabel(IC.alertTriangle, "Nivel de riesgo ARL")}<select name="arlRiskLevel" id="emp-arl-risk-level">${arlRiskOpts}</select></label>
        <label>${fieldLabel(IC.heart, "Examen médico ocupacional de ingreso")}<input type="date" name="occupationalExamDate" id="emp-occupational-exam-date" /></label>
        <p class="full muted" style="grid-column:1/-1;font-size:0.82rem;line-height:1.45;margin:0">Obligatorio para todo trabajador, sin importar el cargo (evaluación médica de ingreso, Resolución 2346 de 2007). La vigencia se guarda automáticamente a un año desde la fecha indicada.</p>
        <label>${fieldLabel(IC.file, "Plantilla de contrato Word")}<select name="contractTemplateKind" id="emp-contract-template-kind" required>
          ${renderContractTemplateSelectOptions("", false)}
        </select></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="3">
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.shield} Seguridad social y parafiscales</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.heart, "EPS")}<select name="eps" required>${epsOptions}</select></label>
        <label>${fieldLabel(IC.shield, "Fondo de pensión")}<select name="pensionFund" required>${pensionFundOptions}</select></label>
        <label>${fieldLabel(IC.shield, "ARL")}<select name="arl" required>${arlOptions}</select></label>
        <label>${fieldLabel(IC.shield, "Fondo de cesantías")}<select name="severanceFund">${severanceOpts}</select></label>
        <label>${fieldLabel(IC.users, "Caja de compensación")}<select name="compensationFund">${compensationOpts}</select></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="4">
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.bank} Datos bancarios</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.bank, "Banco")}<select name="bankName" required>${banksOpts}</select></label>
        <label>${fieldLabel(IC.card, "Tipo de cuenta")}<select name="bankAccountType">${accountTypeOpts}</select></label>
        <label>${fieldLabel(IC.hash, "Número de cuenta")}<input name="bankAccount" required placeholder="Ej: 1234567890" /></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="5">
    <fieldset class="form-section form-section-rose full hr-conductor-fields" id="hr-conductor-fields">
      <legend>${IC.truck} Si el cargo es CONDUCTOR (datos adicionales)</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.file, "N° licencia de conducción")}<input name="license" placeholder="Ej: 12C34567890" /></label>
        <label>${fieldLabel(IC.activity, "Categoría licencia")}<select name="licenseCategory">${licenseCategoryOptions}</select></label>
        <label>${fieldLabel(IC.calendar, "Vence licencia")}<input type="date" name="licenseExpiry" /></label>
        <label>${fieldLabel(IC.calendar, "Examen instruvial")}<input type="date" name="instruvialExamDate" /></label>
        <p class="full muted" style="grid-column:1/-1;font-size:0.82rem;margin:0">La vigencia del examen instruvial se guarda automáticamente a un año desde la fecha indicada. El examen médico ocupacional de ingreso se registra en el paso «Laboral» (aplica a todos los cargos).</p>
        <label>${fieldLabel(IC.alertTriangle, "Comparendos pendientes (SIMIT)")}<input type="number" name="comparendos" min="0" max="9999" value="0" /></label>
        <label>${fieldLabel(IC.activity, "Años de experiencia conduciendo")}<input type="number" name="experienceYears" min="0" max="80" value="0" /></label>
        <label class="full">${fieldLabel(IC.truck, "¿De cuáles vehículos de la flota es conductor?")}
          <div class="hr-conductor-vehicle-types">${driverVehicleTypesCheckboxesHtml("")}</div>
        </label>
        <p class="full muted" style="grid-column:1/-1;font-size:0.82rem;margin:0">Marque los tipos de vehículo del módulo Transportes que puede conducir (camión, turbo, tractomula, bus). Puede completarlo luego desde Conductores.</p>
      </div>
    </fieldset>

      </div>

        </div>
      </div>
      ${renderHrFormWizardFooter(
        "create-employee",
        `<button class="btn btn-primary hr-form-wizard-submit" type="submit" disabled aria-disabled="true">${IC.save} Guardar empleado</button>`,
        {
          extraActionsHtml: `<button type="button" class="btn btn-outline hr-form-wizard-contract-draft" data-action="employee-form-generate-contract-draft" data-hr-wizard-submit-sync disabled aria-disabled="true">${IC.file} Generar contrato Word</button>`
        }
      )}
    </div>
  </form>`;
  const todayYmdBulk = typeof colombiaTodayIsoDate === "function" ? colombiaTodayIsoDate() : new Date().toISOString().slice(0, 10);
  const defaultSingleFechaCierre = (() => {
    const today = todayYmdBulk;
    const parts = today.split("-").map(Number);
    if (parts.length < 3 || !parts[0] || !parts[1]) return today;
    const [y, m] = parts;
    const ld = typeof lastDayOfMonth === "function" ? lastDayOfMonth(y, m - 1) : new Date(y, m, 0).getDate();
    return `${y}-${String(m).padStart(2, "0")}-${String(ld).padStart(2, "0")}`;
  })();
  const payrollLiquidationModeNav = `<div class="payroll-liquidation-mode" role="tablist" aria-label="Modo de liquidación">
      <button type="button" class="payroll-liquidation-mode__btn${payrollLiquidationMode === "single" ? " is-active" : ""}" role="tab" aria-selected="${payrollLiquidationMode === "single" ? "true" : "false"}" data-action="payroll-liquidation-mode" data-mode="single">${IC.user} Un colaborador</button>
      <button type="button" class="payroll-liquidation-mode__btn${payrollLiquidationMode === "bulk" ? " is-active" : ""}" role="tab" aria-selected="${payrollLiquidationMode === "bulk" ? "true" : "false"}" data-action="payroll-liquidation-mode" data-mode="bulk">${IC.users} Todos (cascada)</button>
    </div>`;
  const formPayBulk = `<form id="form-payroll-bulk" class="payroll-bulk-panel payroll-liquidation-pane${payrollLiquidationMode === "bulk" ? "" : " hidden"}" data-payroll-liquidation-pane="bulk" role="tabpanel" aria-labelledby="payroll-bulk-title" aria-hidden="${payrollLiquidationMode === "bulk" ? "false" : "true"}">
      <div class="payroll-bulk-panel__intro">
        <h4 id="payroll-bulk-title" class="payroll-bulk-title">${IC.users} Liquidación masiva (cascada)</h4>
        <p class="muted payroll-bulk-lead">Genera liquidaciones para <strong>colaboradores de nómina laboral con periodicidad Mensual o Quincenal</strong> cuyo corte cierra en la fecha indicada. Los conductores en prestación de servicios se liquidan en <strong>Pagos conductores</strong>.</p>
      </div>
      <div class="payroll-bulk-fields">
        <label class="payroll-bulk-field">${fieldLabel(IC.calendar, "Fecha de cierre del período")}<input type="date" id="payroll-bulk-fecha" name="fechaReferencia" value="${escapeAttr(todayYmdBulk)}" required /></label>
        <label class="payroll-bulk-option">
          <input type="checkbox" id="payroll-bulk-force" checked />
          <span class="payroll-bulk-option__copy">
            <span class="payroll-bulk-option__label">Incluir el último corte pendiente por colaborador</span>
            <span class="payroll-bulk-option__hint muted">Si un colaborador quincenal aún no tiene la 1.ª quincena, la genera aunque la fecha sea fin de mes. Desmarque para exigir que la fecha sea exactamente el día de cierre (15, fin de mes, etc.).</span>
          </span>
        </label>
      </div>
      <div id="payroll-bulk-preview" class="payroll-bulk-preview muted" role="status" aria-live="polite"></div>
      <div class="payroll-bulk-actions">
        <button type="button" class="btn btn-primary payroll-bulk-generate-btn" id="payroll-bulk-generate">${IC.dollar}<span>Generar liquidaciones</span></button>
      </div>
    </form>`;
  const formPay = `<form id="form-payroll" novalidate class="p-form p-form-colored hr-form-flow payroll-liquidation-create-form payroll-single-form payroll-liquidation-pane${payrollLiquidationMode === "single" ? "" : " hidden"}" data-payroll-liquidation-pane="single" role="tabpanel" aria-hidden="${payrollLiquidationMode === "single" ? "false" : "true"}">
    <div class="payroll-liq-form__body">
      <section class="payroll-liq-section payroll-liq-section--period">
        <header class="payroll-liq-section__head">
          <span class="payroll-liq-section__icon" aria-hidden="true">${IC.user}</span>
          <div class="payroll-liq-section__copy">
            <h4 class="payroll-liq-section__title">Periodo y colaborador</h4>
            <p class="payroll-liq-section__lead muted">Indique quién liquida y la fecha de cierre del corte de nómina.</p>
          </div>
        </header>
        ${
          nominaEmployees.length
            ? ""
            : `<p class="payroll-single-empty muted">No hay colaboradores de nómina laboral en el directorio. Los conductores en prestación de servicios se liquidan en <strong>Pagos conductores</strong>.</p>`
        }
        <div class="payroll-liq-grid payroll-liq-grid--period">
          <div class="payroll-liq-field payroll-liq-field--employee">
            <label>${fieldLabel(IC.user, "Colaborador", { required: true })}<select name="employeeId" id="payroll-employee-select" class="searchable-select-native" data-searchable-select="1" data-searchable-placeholder="Buscar por nombre, documento o periodicidad…" required${nominaEmployees.length ? "" : " disabled"}><option value="">Seleccione colaborador</option>${payrollNominaEmployeeOptions}</select></label>
          </div>
          <div class="payroll-liq-field payroll-liq-field--salary">
            <label>${fieldLabel(IC.dollar, "Salario base mensual (COP)")}<input type="text" id="payroll-monthly-base-salary" class="payroll-liq-readonly" readonly tabindex="-1" aria-readonly="true" value="" placeholder="Seleccione colaborador" /></label>
          </div>
          <div class="payroll-liq-field payroll-liq-field--date">
            <label>${fieldLabel(IC.calendar, "Fecha de cierre del período", { required: true })}<input type="date" name="fechaCierre" id="payroll-fecha-cierre" value="${escapeAttr(defaultSingleFechaCierre)}" required /></label>
          </div>
          <input type="hidden" name="month" id="payroll-month-hidden" value="" />
          <input type="hidden" name="payrollQuincena" id="payroll-quincena-hidden" value="Q1" />
          <p class="payroll-liq-hint muted hidden" id="payroll-freq-hint"></p>
          <p class="payroll-liq-hint muted hidden" id="payroll-cesantias-consign-alert"></p>
          <div id="payroll-period-preview" class="payroll-period-preview" role="status" aria-live="polite"></div>
        </div>
      </section>
      <fieldset id="payroll-prima-fieldset" class="payroll-liq-section payroll-liq-section--prima hidden" aria-hidden="true">
        <header class="payroll-liq-section__head">
          <span class="payroll-liq-section__icon payroll-liq-section__icon--amber" aria-hidden="true">${IC.award}</span>
          <div class="payroll-liq-section__copy">
            <legend class="payroll-liq-section__title">Prima de servicios</legend>
            <p class="payroll-liq-section__lead muted">Semestral (junio o diciembre). En nómina quincenal puede liquidarse en la 1.ª o 2.ª quincena, pero no en ambas.</p>
          </div>
        </header>
        <label class="payroll-liq-check">
          <input type="checkbox" name="payPrimaServicios" value="1" id="payroll-pay-prima" />
          <span class="payroll-liq-check__copy">
            <span class="payroll-liq-check__label">Incluir prima de servicios en esta liquidación</span>
            <span class="payroll-liq-check__hint muted">Cálculo orientativo: (salario base × días del semestre) ÷ 360. Revise con contador.</span>
          </span>
        </label>
        <div class="payroll-liq-grid payroll-liq-grid--2">
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.clock, "Días laborados en el semestre")}<input type="number" name="primaServiciosDays" min="1" max="183" placeholder="Ej. 180" disabled /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Valor prima (COP)")}<input type="number" name="primaServiciosCop" min="0" step="100" disabled /></label>
          </div>
        </div>
        <p id="payroll-prima-dup-hint" class="payroll-liq-hint payroll-liq-hint--warn muted hidden"></p>
      </fieldset>
      <fieldset id="payroll-cesantias-int-fieldset" class="payroll-liq-section payroll-liq-section--cesantias hidden" aria-hidden="true">
        <header class="payroll-liq-section__head">
          <span class="payroll-liq-section__icon payroll-liq-section__icon--violet" aria-hidden="true">${IC.dollar}</span>
          <div class="payroll-liq-section__copy">
            <legend class="payroll-liq-section__title">Intereses sobre cesantías</legend>
            <p class="payroll-liq-section__lead muted">Ley 52 de 1975: 12% anual, pago habitual en enero. En quincenal, una sola vez por año (enero o febrero).</p>
          </div>
        </header>
        <label class="payroll-liq-check">
          <input type="checkbox" name="payInteresesCesantias" value="1" id="payroll-pay-int-cesantias" />
          <span class="payroll-liq-check__copy">
            <span class="payroll-liq-check__label">Incluir intereses sobre cesantías</span>
            <span class="payroll-liq-check__hint muted">Coordine la base con el extracto del fondo o contador.</span>
          </span>
        </label>
        <div class="payroll-liq-grid payroll-liq-grid--3">
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Base cesantías (COP)")}<input type="number" name="cesantiasInterestBaseCop" min="0" step="100" placeholder="Saldo año referencia" disabled /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.clock, "Días (base 360)")}<input type="number" name="cesantiasInterestDays" min="1" max="366" value="360" disabled /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Valor intereses (COP)")}<input type="number" name="interesesCesantiasCopMonthly" min="0" step="100" disabled /></label>
          </div>
        </div>
        <p id="payroll-int-ces-dup-hint" class="payroll-liq-hint payroll-liq-hint--warn muted hidden"></p>
      </fieldset>
      <fieldset id="payroll-variable-fieldset" class="payroll-liq-section payroll-liq-section--variables">
        <header class="payroll-liq-section__head">
          <span class="payroll-liq-section__icon payroll-liq-section__icon--cyan" aria-hidden="true">${IC.dollar}</span>
          <div class="payroll-liq-section__copy">
            <legend id="payroll-variable-legend" class="payroll-liq-section__title">Pagos y deducciones variables</legend>
            <p class="payroll-liq-section__lead muted">Ajuste viáticos, horas extras, bonificaciones y retención del período.</p>
          </div>
        </header>
        <p class="payroll-liq-hint muted hidden" id="payroll-conductor-trip-hint"></p>
        <div class="payroll-liq-subgroup">
          <h5 class="payroll-liq-subgroup__title">${IC.truck} Reembolsos y viáticos</h5>
          <div class="payroll-liq-grid payroll-liq-grid--2">
            <div class="payroll-liq-field">
              <label>${fieldLabel(IC.dollar, "Viáticos manuales (COP)")}<input type="number" name="travelAllowanceManual" value="0" min="0" /></label>
            </div>
            <div class="payroll-liq-field">
              <label>${fieldLabel(IC.dollar, "Reembolso combustible (COP)")}<input type="number" name="fuelReimbursementManual" value="0" min="0" /></label>
            </div>
          </div>
        </div>
        <div class="payroll-liq-subgroup" data-payroll-nomina-only="1">
          <h5 class="payroll-liq-subgroup__title">${IC.clock} Horas extras y recargos</h5>
          <div class="payroll-overtime-grid">
            <label class="payroll-overtime-field" data-payroll-nomina-only="1">
              <span class="payroll-overtime-field__badge payroll-overtime-field__badge--hed">HED</span>
              <span class="payroll-overtime-field__meta">Diurna · +25%</span>
              <input type="number" name="hedHours" value="0" min="0" step="0.5" title="Hora extra diurna (+25%)" aria-label="HED horas" />
            </label>
            <label class="payroll-overtime-field" data-payroll-nomina-only="1">
              <span class="payroll-overtime-field__badge payroll-overtime-field__badge--hen">HEN</span>
              <span class="payroll-overtime-field__meta">Nocturna · +75%</span>
              <input type="number" name="henHours" value="0" min="0" step="0.5" title="Hora extra nocturna (+75%)" aria-label="HEN horas" />
            </label>
            <label class="payroll-overtime-field" data-payroll-nomina-only="1">
              <span class="payroll-overtime-field__badge payroll-overtime-field__badge--hrdf">HRDF</span>
              <span class="payroll-overtime-field__meta">Dom./festivo · +100%</span>
              <input type="number" name="hrdfHours" value="0" min="0" step="0.5" title="Hora recargo dominical o festivo (+100%)" aria-label="HRDF horas" />
            </label>
            <label class="payroll-overtime-field" data-payroll-nomina-only="1">
              <span class="payroll-overtime-field__badge payroll-overtime-field__badge--hrnf">HRNF</span>
              <span class="payroll-overtime-field__meta">Noct. festivo · +75%</span>
              <input type="number" name="hrnfHours" value="0" min="0" step="0.5" title="Hora recargo nocturno en festivo (+75%)" aria-label="HRNF horas" />
            </label>
            <label class="payroll-overtime-field payroll-overtime-field--wide" data-payroll-nomina-only="1">
              <span class="payroll-overtime-field__badge payroll-overtime-field__badge--rn">RN</span>
              <span class="payroll-overtime-field__meta">Recargo nocturno ordinario · +35%</span>
              <input type="number" name="recargoNocturnoHoras" value="0" min="0" step="0.5" title="Recargo nocturno ordinario (+35%)" aria-label="Recargo nocturno horas" />
            </label>
          </div>
        </div>
        <div class="payroll-liq-subgroup" data-payroll-nomina-only="1">
          <h5 class="payroll-liq-subgroup__title">${IC.award} Otros devengos y retención</h5>
          <div class="payroll-liq-grid payroll-liq-grid--2">
            <div class="payroll-liq-field" data-payroll-nomina-only="1">
              <label>${fieldLabel(IC.dollar, "Otros extras gravables (COP)")}<input type="number" name="extras" value="0" min="0" title="Montos adicionales no desglosados en horas" /></label>
            </div>
            <div class="payroll-liq-field" data-payroll-nomina-only="1">
              <label>${fieldLabel(IC.truck, "Auxilio transporte (COP)")}<input type="number" name="aux" value="${CO_HR_RULES.transportAllowance}" min="0" title="Se rellena con el subsidio registrado en la ficha del empleado." /></label>
            </div>
            <div class="payroll-liq-field" data-payroll-nomina-only="1">
              <label>${fieldLabel(IC.award, "Bonificaciones (COP)")}<input type="number" name="bonus" value="0" min="0" /></label>
            </div>
            <div class="payroll-liq-field" data-payroll-nomina-only="1">
              <label>${fieldLabel(IC.user, "Dependientes retención", { help: "Procedimiento 1: 32 UVT por dependiente." })}<input type="number" name="withholdingDependents" value="0" min="0" max="10" step="1" /></label>
            </div>
          </div>
          <p class="payroll-liq-footnote muted" data-payroll-nomina-only="1">Horas extras según CST (orientativo). IBC con salario integral al 70%. Solidaridad y subsistencia por tramos SMMLV.</p>
        </div>
      </fieldset>
    </div>
    ${renderManagedCreateFormActions("create-payroll", `<button class="btn btn-primary payroll-liq-submit" type="submit" id="payroll-submit-btn">${IC.dollar}<span>Generar liquidación</span></button>`)}
  </form>`;
  const conductorTripPayOpts = conductorEmployees
    .map((e) => `<option value="${e.id}">${escapeHtml(e.name)} · ${escapeHtml(String(e.idDoc || "—"))}</option>`)
    .join("");
  const formDriverTripPay = `<form id="form-driver-trip-payment" novalidate class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.truck} Prestación de servicios — pago por viajes</legend>
      <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.75rem">
        Liquida viáticos por viajes <strong>interdepartamentales</strong> completados en el mes y reembolsos de combustible registrados a nombre del conductor.
        No genera salario ni aportes de nómina. Los datos se guardan en <code>liquidaciones_nomina</code> con tipo <strong>prestacion_viajes</strong>.
      </p>
      <div class="form-section-grid">
        ${conductorEmployees.length ? `<label>${fieldLabel(IC.user, "Conductor")}<select name="employeeId" required><option value="">Seleccione conductor</option>${conductorTripPayOpts}</select></label>` : `<p class="full payroll-single-empty muted">No hay conductores en prestación de servicios en el directorio.</p><input type="hidden" name="employeeId" value="" />`}
        <label>${fieldLabel(IC.calendar, "Mes de servicio")}<input type="month" name="month" required /></label>
        <label>${fieldLabel(IC.dollar, "Viáticos manuales (COP)")}<input type="number" name="travelAllowanceManual" value="0" min="0" /></label>
        <label>${fieldLabel(IC.dollar, "Reembolso combustible manual (COP)")}<input type="number" name="fuelReimbursementManual" value="0" min="0" /></label>
        <p class="full muted" style="margin:0;font-size:0.82rem">Tarifa interdepartamental vigente: <strong>$${parseNum(rules.interDepartmentTripAmount).toLocaleString("es-CO")}</strong> por viaje (tabla <code>reglas_viatico_interdepartamental</code>).</p>
      </div>
    </fieldset>
    ${renderManagedCreateFormActions("create-driver-trip-payment", `<button class="btn btn-primary" type="submit"${conductorEmployees.length ? "" : " disabled"}>${IC.truck} Liquidar viajes del mes</button>`)}
  </form>`;
  const payrollEmpOptionsSettlement = `<option value="">Seleccione</option>${nominaEmployees
    .map((e) => `<option value="${escapeAttr(String(e.id))}">${escapeHtml(String(e.name || ""))}</option>`)
    .join("")}`;
  const formPayrollSettlement = `<form id="form-payroll-settlement" novalidate class="p-form p-form-colored hr-form-flow payroll-settlement-create-form">
    <div class="payroll-liq-form__body">
      <section class="payroll-liq-section payroll-liq-section--period">
        <header class="payroll-liq-section__head">
          <span class="payroll-liq-section__icon" aria-hidden="true">${IC.activity}</span>
          <div class="payroll-liq-section__copy">
            <h4 class="payroll-liq-section__title">Datos del retiro</h4>
            <p class="payroll-liq-section__lead muted">Renuncia, despido u otras causas de terminación. Montos orientativos según ordenamiento laboral colombiano.</p>
          </div>
        </header>
        <div class="payroll-liq-grid payroll-liq-grid--2">
          <div class="payroll-liq-field payroll-liq-field--employee">
            <label>${fieldLabel(IC.user, "Colaborador", { required: true })}<select name="employeeId" required>${payrollEmpOptionsSettlement}</select></label>
          </div>
          <div class="payroll-liq-field payroll-liq-field--salary">
            <label>${fieldLabel(IC.dollar, "Salario base mensual (COP)")}<input type="text" id="payroll-settlement-base-salary" class="payroll-liq-readonly" readonly tabindex="-1" aria-readonly="true" value="" placeholder="Seleccione colaborador" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.calendar, "Mes de retiro", { required: true })}<input type="month" name="month" required /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.calendar, "Fecha de terminación", { required: true })}<input type="date" name="terminationDate" required /></label>
          </div>
          <div class="payroll-liq-field payroll-liq-field--wide">
            <label>${fieldLabel(IC.file, "Motivo de terminación", { required: true })}
              <select name="terminationCause" required>
                <option value="renuncia_voluntaria">Renuncia voluntaria</option>
                <option value="despido_sin_justa">Despido sin justa causa</option>
                <option value="despido_justa">Despido con justa causa</option>
                <option value="mutuo_acuerdo">Mutuo acuerdo</option>
                <option value="vencimiento_contrato">Vencimiento de contrato</option>
                <option value="otro">Otro</option>
              </select>
            </label>
          </div>
        </div>
      </section>
      <section class="payroll-liq-section payroll-liq-section--refs">
        <header class="payroll-liq-section__head">
          <span class="payroll-liq-section__icon payroll-liq-section__icon--violet" aria-hidden="true">${IC.clock}</span>
          <div class="payroll-liq-section__copy">
            <h4 class="payroll-liq-section__title">Referencias para el cálculo</h4>
            <p class="payroll-liq-section__lead muted">Complete colaborador y fecha de terminación arriba, luego pulse <strong>Calcular</strong> para auto-rellenar los rubros.</p>
          </div>
        </header>
        <p id="settlement-cause-hint" class="payroll-liq-hint payroll-liq-hint--info muted hidden"></p>
        <p class="payroll-liq-subgroup__title">${IC.clock} Tiempos laborados</p>
        <div class="payroll-liq-grid payroll-liq-grid--3">
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.clock, "Días totales laborados")}<input type="number" name="employedDays" min="0" max="20000" readonly tabindex="-1" class="payroll-liq-readonly" placeholder="Auto" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.clock, "Días año 360 (cesantías)")}<input type="number" name="days360Year" min="0" max="360" value="0" placeholder="Auto" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.clock, "Días proporcional prima")}<input type="number" name="primaPropDays" min="0" max="360" value="0" placeholder="Auto" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.calendar, "Días vacaciones pendientes")}<input type="number" name="vacationDays" min="0" max="366" step="0.01" value="0" placeholder="Auto" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Saldo cesantías en fondo (COP)")}<input type="number" name="cesantiasFondoBalanceCop" min="0" step="100" value="0" /></label>
          </div>
        </div>
        <p class="payroll-liq-subgroup__title" style="margin-top:0.65rem">${IC.dollar} Conceptos pendientes y novedades</p>
        <div class="payroll-liq-grid payroll-liq-grid--3">
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.clock, "Días aviso previo cumplidos", { help: "Despido sin justa causa: 30 días si indefinido (CST art. 64)." })}<input type="number" name="avisoPrevioDaysWorked" min="0" max="60" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.clock, "Días aviso renuncia", { help: "Si no cumplió 15 días, puede descontarse del finiquito (CST art. 62)." })}<input type="number" name="renunciaAvisoDaysWorked" min="0" max="60" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Horas extras pendientes (COP)")}<input type="number" name="pendingOvertimeCop" min="0" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Bonificaciones pendientes (COP)")}<input type="number" name="pendingBonusCop" min="0" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.user, "Dependientes para retención", { help: "Procedimiento 1: 32 UVT por dependiente (Art. 383 ET)." })}<input type="number" name="withholdingDependents" min="0" max="10" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Indemnización pactada (COP)", { help: "Solo si la causal requiere monto manual. El sistema calcula la legal automáticamente." })}<input type="number" name="indemnization" min="0" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Otros conceptos (COP)")}<input type="number" name="otrosSettlement" min="0" value="0" /></label>
          </div>
        </div>
        <div class="payroll-settlement-calc-bar">
          <button type="button" class="btn btn-primary payroll-settlement-calc-bar__btn" data-action="settlement-recalc">${IC.activity}<span>Calcular liquidación sugerida</span></button>
          <div class="payroll-settlement-calc-bar__preview" id="settlement-preview-net" role="status" aria-live="polite"></div>
        </div>
      </section>
      <section class="payroll-liq-section payroll-liq-section--amounts">
        <header class="payroll-liq-section__head">
          <span class="payroll-liq-section__icon payroll-liq-section__icon--emerald" aria-hidden="true">${IC.dollar}</span>
          <div class="payroll-liq-section__copy">
            <h4 class="payroll-liq-section__title">Montos de liquidación</h4>
            <p class="payroll-liq-section__lead muted">Valores orientativos sugeridos por el sistema. Revise, ajuste y confirme con contador antes de registrar.</p>
          </div>
        </header>
        <div class="payroll-liq-grid payroll-liq-grid--2">
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Salario pendiente mes retiro (COP)")}<input type="number" name="salarioPendienteCop" min="0" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.truck, "Auxilio transporte pendiente (COP)")}<input type="number" name="auxilioPendienteCop" min="0" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Cesantías total (COP)")}<input type="number" name="cesantiasCop" min="0" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Intereses cesantías (COP)")}<input type="number" name="interesesCesantiasCop" min="0" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Prima proporcional (COP)")}<input type="number" name="primaPropCop" min="0" value="0" /></label>
          </div>
          <div class="payroll-liq-field">
            <label>${fieldLabel(IC.dollar, "Vacaciones compensadas (COP)")}<input type="number" name="vacacionesCop" min="0" value="0" /></label>
          </div>
        </div>
        <input type="hidden" name="indemnizacionDespidoCop" value="0" />
        <input type="hidden" name="indemnizacionAvisoCop" value="0" />
        <p class="payroll-liq-footnote muted">${IC.alertTriangle} Indemnización por causal (CST art. 64) se calcula automáticamente al calcular. Vacaciones: 15 días/año proporcionales. Sin transmisión PILA/DIAN — consolide con contador.</p>
      </section>
    </div>
    ${renderManagedCreateFormActions("create-payroll-settlement", `<button class="btn btn-primary payroll-liq-submit" type="submit">${IC.save}<span>Registrar liquidación contractual</span></button>`)}
  </form>`;
  const formAbsence = `<form id="form-hr-absence" novalidate class="p-form p-form-colored hr-form-flow hr-absence-create-form">
    <header class="hr-absence-create-form__head">
      <h3 class="hr-absence-create-form__title">Crear ausencia</h3>
      <p class="muted hr-absence-create-form__lead">Vacaciones, licencias, incapacidades, compensatorios y suspensiones con validación legal Colombia.</p>
    </header>
    <div class="hr-absence-create-form__body">
      <div class="hr-absence-field hr-absence-field--employee full">
        <label>${fieldLabel(IC.user, "Colaborador", { required: true })}<select name="employeeId" required><option value="">Seleccione colaborador</option>${employees.map((e) => `<option value="${escapeAttr(String(e.id))}">${escapeHtml(String(e.name || ""))} · ${escapeHtml(String(e.idDoc || "—"))}</option>`).join("")}</select></label>
      </div>
      <div class="hr-absence-field full">
        <label>${fieldLabel(IC.activity, "Tipo de tiempo", { required: true, help: "Clasificación de la ausencia para nómina y archivo de personal." })}
          <select name="absenceType" class="hr-absence-type-select" required>${buildPayrollAbsencePortalTypeOptionsHtml("vacaciones")}</select>
        </label>
      </div>
      <div class="hr-absence-field full hidden" data-incapacity-origin-wrap aria-hidden="true">
        <label>${fieldLabel(IC.heart, "Origen de incapacidad", { required: true })}
          <select name="incapacityOrigin">
            <option value="incapacidad_eps">Enfermedad general (EPS)</option>
            <option value="incapacidad_arl">Accidente o enfermedad laboral (ARL)</option>
          </select>
        </label>
      </div>
      <div class="hr-absence-field full hidden" data-absence-subtype-wrap aria-hidden="true">
        <label>${fieldLabel(IC.layers, "Detalle")}
          <select name="absenceSubtype">${buildPayrollAbsenceSubtypeOptionsHtml("permiso_sufragio", "votante")}</select>
        </label>
      </div>
      <div class="hr-absence-dates-row">
        <div class="hr-absence-field">
          <label>${fieldLabel(IC.calendar, "Fecha de inicio", { required: true })}<input type="date" name="startDate" required /></label>
        </div>
        <div class="hr-absence-field">
          <label>${fieldLabel(IC.calendar, "Fecha de finalización", { required: true })}<input type="date" name="endDate" required /></label>
        </div>
      </div>
      <div class="hr-absence-field">
        <label>${fieldLabel(IC.clock, "Solicitud", { help: "Cantidad de días o jornadas reconocidas según el tipo y el periodo." })}
          <select name="requestAmount" data-absence-request-select></select>
          <input type="hidden" name="recognizedDays" value="1" />
        </label>
        <p class="hr-absence-hint muted" data-absence-recognition-hint></p>
      </div>
      <label class="hr-absence-check">
        <input type="checkbox" name="periodicAbsence" value="1" />
        <span>${fieldLabel(IC.rotateCcw, "Ausencia periódica")}</span>
      </label>
      <section class="hr-absence-team-panel" aria-labelledby="hr-absence-team-title">
        <h4 id="hr-absence-team-title" class="hr-absence-team-panel__title">${fieldLabel(IC.users, "Ausencias de equipo")}</h4>
        <div class="hr-absence-team-panel__body" data-absence-team-body>
          <p class="hr-absence-team-panel__empty">Seleccione colaborador y fechas para ver ausencias del equipo.</p>
        </div>
      </section>
      <div class="hr-absence-field full">
        <label>${fieldLabel(IC.file, "Comentario")}<textarea name="notes" rows="3" placeholder="Motivo, contexto o detalle adicional"></textarea></label>
      </div>
      <details class="hr-absence-support-details">
        <summary class="hr-absence-support-details__summary">${IC.file} Soporte documental</summary>
        <div class="hr-absence-support-details__body">
          <div class="hr-absence-field full">
            <label>${fieldLabel(IC.hash, "N.º soporte o radicado")}<input name="supportNumber" placeholder="Radicado, acta, certificado o soporte" /></label>
          </div>
          <div class="hr-absence-field full">
            <label>${fieldLabel(IC.heart, "EPS / ARL / entidad")}<select name="epsEntity">${epsOptions}<option value="ARL">ARL</option><option value="Juzgado">Juzgado</option><option value="Registraduría">Registraduría</option><option value="Otra">Otra</option></select></label>
          </div>
          <p class="hr-absence-hint muted" data-absence-support-hint></p>
        </div>
      </details>
    </div>
    ${renderManagedCreateFormActions("create-hr-absence", `<button class="btn btn-primary" type="submit">${IC.save} Registrar ausencia</button>`)}
  </form>`;
  const absenceRows = absences
    .map((a) => {
      const absKey =
        typeof payrollNormalizeAbsenceTypeKey === "function"
          ? payrollNormalizeAbsenceTypeKey(a.absenceType)
          : String(a.absenceType || "").toLowerCase();
      const absChipTone =
        absKey === "incapacidad_eps" || absKey === "incapacidad_arl"
          ? "warn"
          : absKey === "vacaciones"
            ? "ok"
            : absKey === "licencia_maternidad" || absKey === "licencia_paternidad"
              ? "info"
              : absKey === "suspension" || absKey === "licencia_no_remunerada"
                ? "neutral"
                : "neutral";
      return `<tr>
      <td>${fmtDate(a.createdAt)}</td>
      <td>${escapeHtml(a.employeeName)}</td>
      <td><span class="payroll-abs-chip payroll-abs-chip--${absChipTone}">${escapeHtml(payrollAbsenceTypeLabel(a.absenceType))}</span>${a.absenceSubtype ? `<br><span class="muted" style="font-size:0.8rem">${escapeHtml(payrollAbsenceSubtypeLabel(a.absenceType, a.absenceSubtype) || String(a.absenceSubtype))}</span>` : ""}</td>
      <td>${escapeHtml(String(a.startDate))} → ${escapeHtml(String(a.endDate))}</td>
      <td>${escapeHtml(payrollFormatAbsenceQuantity(a.recognizedDays ?? a.days))}</td>
      <td><span class="muted">${escapeHtml(a.supportNumber || "-")}</span></td>
      <td><div class="toolbar">
        <button type="button" class="btn btn-sm btn-outline" data-action="view-hr-absence" data-id="${escapeAttr(String(a.id))}">${IC.eye} Ver</button>
        ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-hr-absence" data-id="${escapeAttr(String(a.id))}">${IC.edit} Editar</button>` : ""}
        ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-hr-absence" data-id="${escapeAttr(String(a.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`;
    })
    .join("");
  const absenceTable = absenceRows
    ? `<div class="table-wrap"><table><thead><tr><th>Registro</th><th>Empleado</th><th>Tipo</th><th>Periodo</th><th>Días rec.</th><th>Soporte</th><th style="min-width:11rem">Acciones</th></tr></thead><tbody>${absenceRows}</tbody></table></div>`
    : emptyState("Sin ausencias laborales registradas.");
  const employeeSelectHeader = canDeletePayrollEmployees
    ? `<th class="payroll-contracts-table__check"><input type="checkbox" id="employees-select-all-header" aria-label="Seleccionar todos" /></th>`
    : "";
  const employeeContractsDashboard = renderPayrollEmployeesConsultToolbar(canDeletePayrollEmployees);
  const employeeTableToolbar = renderPayrollContractsTableToolbar(employeesView, canDeletePayrollEmployees);
  const employeePagination = renderPayrollContractsPagination(employeesTotal, employeesSafePage, employeesPageSize);
  const employeeTable = employeeTableRows
    ? `<div class="payroll-contracts-table-shell">
        ${employeeTableToolbar}
        <div class="table-wrap payroll-table-wrap payroll-employees-list-view payroll-contracts-table-wrap">
          <table class="payroll-employees-table payroll-contracts-table">
            <thead><tr>${employeeSelectHeader}<th>Colaborador</th><th>Cargo</th><th>Ingreso</th><th>Inicio vigente</th><th>Renovación</th><th>Aviso no renov.</th><th>Fin contrato</th><th>Estado</th><th class="payroll-contracts-table__actions">Acciones</th></tr></thead>
            <tbody>${employeeTableRows}</tbody>
          </table>
        </div>
        ${employeePagination}
      </div>`
    : "";
  const empTable =
    employeesView === "list"
      ? employeeTableRows
        ? `${employeeContractsDashboard}${employeeTable}`
        : `${employeeContractsDashboard}${emptyState("No hay empleados registrados.")}`
      : employeeCards
        ? `${employeeContractsDashboard}${employeeTableToolbar}<div class="employees-grid directory-grid payroll-employees-grid portal-ops-cards">${employeeCards}</div>${employeePagination}`
        : `${employeeContractsDashboard}${emptyState("No hay empleados registrados.")}`;
  const runCardsGrid = sortedRuns.length
    ? `<div class="payroll-run-cards-grid">${runsToRender.map((r) => renderPayrollRunCard(r, { compact: true })).join("")}</div>${payrollRunsMoreBar}`
    : "";
  const runTableView = runRows
    ? `<div class="table-wrap payroll-table-wrap payroll-runs-list-view"><table><thead><tr><th>Período</th><th>Tipo</th><th>Empleado</th><th>Devengado</th><th>Viáticos</th><th>Combustible</th><th>Deducciones</th><th>Neto</th><th>Estado</th><th></th></tr></thead><tbody>${runRows}</tbody></table></div>${payrollRunsMoreBar}`
    : "";
  const runsEmpty = emptyState("Sin liquidaciones que coincidan con los filtros.");
  const runsPaneBody =
    runsView === "list"
      ? runTableView || runsEmpty
      : runCardsGrid || runsEmpty;
  const employeeOpts = employees
    .map((e) => `<option value="${e.id}" ${filterEmployee === e.id ? "selected" : ""}>${e.name}</option>`)
    .join("");
  const filteredEmployeeRecord = filterEmployee
    ? employees.find((e) => String(e.id) === String(filterEmployee))
    : null;
  const employeeFilterBanner = filteredEmployeeRecord
    ? `<div class="payroll-employee-filter-banner" role="status">
        <div class="payroll-employee-filter-banner__copy">
          <span class="payroll-employee-filter-banner__label">Colaborador</span>
          <strong>${escapeHtml(String(filteredEmployeeRecord.name || "—"))}</strong>
          <span class="muted">${escapeHtml(String(filteredEmployeeRecord.idDoc || ""))}</span>
        </div>
        <div class="toolbar">
          <button type="button" class="btn btn-sm btn-outline" data-action="view-employee" data-id="${escapeAttr(String(filteredEmployeeRecord.id))}">${IC.eye} Perfil</button>
          <button type="button" class="btn btn-sm btn-outline" data-action="payroll-clear-employee-filter">${IC.x} Quitar filtro</button>
        </div>
      </div>`
    : "";
  const filtersHtml = `<details class="payroll-filters-advanced">
      <summary class="payroll-filters-advanced__summary">${IC.layers} Filtros avanzados</summary>
      <form id="payroll-filters" class="payroll-data-toolbar-filters">
      <label class="payroll-filter-field">${fieldLabel(IC.calendar, "Periodo")}<select name="period">
        <option value="all" ${filterPeriod === "all" ? "selected" : ""}>Todos</option>
        <option value="current" ${filterPeriod === "current" ? "selected" : ""}>Mes actual</option>
        <option value="previous" ${filterPeriod === "previous" ? "selected" : ""}>Mes anterior</option>
      </select></label>
      <label class="payroll-filter-field">${fieldLabel(IC.clock, "Tipo de nómina")}<select name="frequency">
        <option value="all" ${filterFrequency === "all" ? "selected" : ""}>Todos</option>
        <option value="mensual" ${filterFrequency === "mensual" ? "selected" : ""}>Solo mensual</option>
        <option value="quincenal" ${filterFrequency === "quincenal" ? "selected" : ""}>Solo quincenal</option>
        <option value="terminacion" ${filterFrequency === "terminacion" ? "selected" : ""}>Solo terminación</option>
        ${
          payrollDataSection === "driverPayments"
            ? `<option value="prestacion_viajes" ${filterFrequency === "prestacion_viajes" ? "selected" : ""}>Solo pago por viajes</option>`
            : ""
        }
      </select></label>
      <label class="payroll-filter-field">${fieldLabel(IC.user, "Empleado")}<select name="employee">
        <option value="">Todos</option>${employeeOpts}
      </select></label>
      <label class="payroll-filter-field">${fieldLabel(IC.activity, "Estado pago")}<select name="status">
        <option value="all" ${filterStatus === "all" ? "selected" : ""}>Todos</option>
        <option value="paid" ${filterStatus === "paid" ? "selected" : ""}>Pagado</option>
        <option value="pending" ${filterStatus === "pending" ? "selected" : ""}>Pendiente</option>
      </select></label>
      <button type="button" class="payroll-filters-reset" data-action="payroll-clear-filters" aria-label="Limpiar filtros">${IC.rotateCcw}<span>Limpiar filtros</span></button>
    </form>
    </details>`;
  const payrollModuleHead = renderPayrollModuleHead({
    employees: employees.length,
    pending,
    pendingDriverPayments,
    pendingDriverCop,
    pendingAbsenceApprovals,
    totalPayrollMonth,
    currentYm,
    contractNoticeCount,
    workspace: payrollWorkspace
  });
  const payrollOperateNav = renderPayrollOperateSectionNav(payrollOperateSection);
  const payrollRailCollapsed = isPayrollOperateRailCollapsed();
  const payrollOperatePaneHidden = (section) => payrollOperateSection !== section;
  const payrollOperatePane = (section, body) =>
    `<div class="auth-tab-panel${payrollOperatePaneHidden(section) ? " hidden" : ""}" data-payroll-operate-pane="${section}"${payrollOperatePaneHidden(section) ? " hidden" : ""} aria-hidden="${payrollOperatePaneHidden(section) ? "true" : "false"}">${body}</div>`;
  const employeeOperatePane = payrollOperatePane(
    "employee",
    createHrActionCard("create-employee", "userPlus", "Nuevo colaborador", "Expediente de vinculación con contrato Word y seguridad social (Colombia)", formEmp, "Abrir expediente", {
      createPanels: payrollCreateUi,
      toolbarExtras: `<button type="button" class="btn btn-sm btn-outline module-panel-btn" data-action="employee-form-save-draft" title="Guardar borrador en este navegador">${IC.save} Guardar borrador</button>`
    })
  );
  const payrollOperatePaneBody = payrollOperatePane(
    "payroll",
    createHrActionCard("create-payroll", "dollar", "Liquidación de nómina", "Relación laboral — devengos, deducciones y aportes parafiscales", `${payrollLiquidationModeNav}${formPayBulk}${formPay}`, "Abrir liquidación", { createPanels: payrollCreateUi })
  );
  const driverPayOperatePane = payrollOperatePane(
    "driverPay",
    createHrActionCard("create-driver-trip-payment", "truck", "Pago por viajes", "Prestación de servicios — viáticos interdepartamentales y combustible", formDriverTripPay, "Abrir liquidación", { createPanels: payrollCreateUi })
  );
  const settlementOperatePane = payrollOperatePane(
    "settlement",
    createHrActionCard("create-payroll-settlement", "hash", "Liquidación final", "Terminación contractual — cesantías, prima y vacaciones (CST)", formPayrollSettlement, "Abrir liquidación", { createPanels: payrollCreateUi })
  );
  const absenceOperatePane = payrollOperatePane(
    "absence",
    createHrActionCard("create-hr-absence", "calendar", "Crear ausencia", "Vacaciones, licencias, incapacidades, compensatorios y suspensiones", formAbsence, "Abrir formulario", { createPanels: payrollCreateUi })
  );
  const payrollExecutionBlock = `<section class="payroll-operate payroll-operate-panel${payrollRailCollapsed ? " is-rail-collapsed" : ""}">
      <aside class="payroll-operate__rail" aria-label="Trámites de registro">
        <div class="payroll-operate__rail-head">
          <p class="payroll-operate__rail-label">Tipo de trámite</p>
          <button type="button" class="payroll-operate__rail-toggle" data-action="payroll-operate-rail-toggle" aria-expanded="${payrollRailCollapsed ? "false" : "true"}" title="${payrollRailCollapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite"}">
            <span class="payroll-operate__rail-toggle-ico" aria-hidden="true">${IC.chevronLeft}</span>
          </button>
        </div>
        ${payrollOperateNav}
      </aside>
      <div class="payroll-operate__main auth-tab-panels">${employeeOperatePane}${payrollOperatePaneBody}${driverPayOperatePane}${settlementOperatePane}${absenceOperatePane}</div>
    </section>`;
  const payrollQuickActive =
    filterStatus === "pending"
      ? "pending"
      : filterFrequency === "quincenal"
        ? "quincenal"
        : filterFrequency === "mensual"
          ? "mensual"
          : filterPeriod === "current"
            ? "current"
            : "all";
  const payrollQuickBar = `<div class="payroll-quick-bar" role="group" aria-label="Filtros rápidos">
      <button type="button" class="payroll-quick-pill${payrollQuickActive === "all" ? " is-active" : ""}" data-action="payroll-quick-filter" data-quick="all">Todos</button>
      <button type="button" class="payroll-quick-pill${payrollQuickActive === "current" ? " is-active" : ""}" data-action="payroll-quick-filter" data-quick="current">Mes actual</button>
      <button type="button" class="payroll-quick-pill${payrollQuickActive === "pending" ? " is-active" : ""}" data-action="payroll-quick-filter" data-quick="pending">Pendientes</button>
      <button type="button" class="payroll-quick-pill${runSort === "pending_first" ? " is-active" : ""}" data-action="payroll-sort-runs" data-sort="pending_first">Orden: pendientes</button>
    </div>`;
  const legalHasSavedYear = legalHistory.some((row) => Number(row?.year) === Number(legalDraft.year));
  const legalActiveRow = legalHistory.find((row) => row.isCurrent) || legalHistory[0] || null;
  const legalActiveYear = Number(legalActiveRow?.year || legalDraft.activeYear || legalDraft.year);
  const legalLastSavedYear = legalHistory.reduce((max, row) => Math.max(max, Number(row?.year) || 0), 0);
  const legalSuggestedNewYear = clampLaborSystemParameterYear(Math.max(now.getFullYear(), legalLastSavedYear + 1));
  const legalKpi = (tone, icon, label, valueHtml) =>
    `<div class="payroll-legal-kpi payroll-legal-kpi--${tone}">
      <span class="payroll-legal-kpi__ico" aria-hidden="true">${icon || ""}</span>
      <div class="payroll-legal-kpi__body"><dt>${escapeHtml(label)}</dt><dd>${valueHtml}</dd></div>
    </div>`;
  const legalSummary = `<div class="payroll-legal-kpi-bar" aria-label="Resumen de la vigencia seleccionada">
      ${legalKpi(
        "ok",
        IC.check,
        `Vigencia activa (${legalActiveYear})`,
        `<strong>${escapeHtml(String(legalActiveYear))}</strong>`
      )}
      ${legalKpi(
        "neutral",
        IC.dollar,
        "SMMLV",
        `<strong>$${parseNum(legalDraft.smmlvCop).toLocaleString("es-CO")}</strong>`
      )}
      ${legalKpi(
        "violet",
        IC.truck,
        "Auxilio transporte",
        `<strong>$${parseNum(legalDraft.transportAllowanceCop).toLocaleString("es-CO")}</strong>`
      )}
      ${legalKpi(
        "rose",
        IC.heart,
        "Salud / Pensión",
        `<strong>${healthRatePct}% / ${pensionRatePct}%</strong>`
      )}
      ${legalKpi(
        "warn",
        IC.clock,
        "Horas semanales",
        `<strong>${parseNum(legalDraft.legalWeeklyHours || CO_HR_RULES.legalWeeklyHours)}</strong>`
      )}
    </div>`;
  const legalYearOptionsHtml = legalYearOptions
    .map(
      (year) =>
        `<option value="${year}" ${year === legalDraft.year ? "selected" : ""}>${escapeHtml(
          String(year)
        )}</option>`
    )
    .join("");
  const legalAppliedYearOptionsHtml = legalAppliedYearOptions
    .map(
      (year) =>
        `<option value="${year}" ${year === legalDraft.activeYear ? "selected" : ""}>${escapeHtml(String(year))}</option>`
    )
    .join("");
  const legalHistoryCards = legalHistory.length
    ? `<div class="payroll-legal-vigencias-grid">${legalHistory
        .map((row) => renderPayrollLegalHistoryCard(row, allRuns, { canDelete: canEditLegalParameters }))
        .join("")}</div>`
    : `<div class="payroll-legal-empty">
        <p class="muted">Aún no hay vigencias registradas en base de datos. Cree la primera con el formulario.</p>
        ${
          canEditLegalParameters
            ? `<button type="button" class="btn btn-outline btn-sm" data-action="payroll-legal-new">${IC.plus} Crear primera vigencia</button>`
            : ""
        }
      </div>`;
  const legalReadOnlyNotice = canEditLegalParameters
    ? ""
    : `<p class="payroll-legal-notice payroll-legal-notice--info muted">Solo administradores pueden editar o eliminar vigencias. RRHH consulta el histórico y los valores aplicados en nómina.</p>`;
  const legalPayrollWarning = payrollRunsForLegalYear
    ? `<p class="payroll-legal-notice payroll-legal-notice--warn status status-pendiente">Advertencia: ${payrollRunsForLegalYear} liquidación${payrollRunsForLegalYear === 1 ? "" : "es"} del año ${legalDraft.year} ya usan referencias de esta vigencia. Guardar actualiza parámetros; eliminar la vigencia no borra liquidaciones.</p>`
    : "";
  const legalFormActions = canEditLegalParameters
    ? `<footer class="payroll-legal-form-footer">
        <div class="payroll-legal-form-actions">
          <button type="submit" class="btn btn-primary">${IC.save} Guardar vigencia</button>
          <button type="button" class="btn btn-outline" data-action="payroll-legal-reset">${IC.x} Cancelar cambios</button>
          ${
            legalHasSavedYear
              ? `<button type="button" class="btn btn-outline btn-reject payroll-legal-form-actions__delete" data-action="payroll-legal-delete" data-year="${escapeAttr(String(legalDraft.year))}">${IC.trash} Eliminar</button>`
              : ""
          }
        </div>
        <p class="payroll-legal-form-note muted">${IC.lock} Los cambios aplicarán a toda la plataforma una vez guardados.</p>
      </footer>`
    : "";
  const legalHeaderActions = canEditLegalParameters
    ? `<div class="payroll-legal-panel__actions toolbar">
        <button type="button" class="btn btn-outline btn-sm" data-action="payroll-legal-duplicate"${legalHistory.length ? "" : " disabled"}>${IC.layers} Duplicar última vigencia</button>
        <button type="button" class="btn btn-primary btn-sm" data-action="payroll-legal-new" data-year="${escapeAttr(String(legalSuggestedNewYear))}">${IC.plus} Nueva vigencia</button>
      </div>`
    : "";
  const legalInputSuffix = (inputHtml, suffix) =>
    `<span class="payroll-legal-input-wrap">${inputHtml}<span class="payroll-legal-input-suffix" aria-hidden="true">${escapeHtml(String(suffix))}</span></span>`;
  const legalPane = `<div class="payroll-data-pane${payrollDataSection === "legal" ? "" : " hidden"}" data-payroll-section="legal">
      <div class="payroll-legal-panel">
        <header class="payroll-legal-panel__head">
          <div class="payroll-legal-panel__brand">
            ${hrCardIconMarkup("hash")}
            <div>
              <h2>Parámetros legales anuales</h2>
              <p class="muted">SMMLV, auxilio, UVT, aportes y horas legales por vigencia.</p>
            </div>
          </div>
          ${legalHeaderActions}
        </header>
        <div class="payroll-legal-panel__body">
          ${legalReadOnlyNotice}
          ${legalSummary}
          ${legalPayrollWarning}
          <form id="form-payroll-legal-params" class="p-form payroll-legal-form">
            <div class="payroll-legal-layout">
              <section class="payroll-legal-editor payroll-legal-card" aria-labelledby="payroll-legal-editor-title">
                <h3 id="payroll-legal-editor-title" class="payroll-legal-section-title">
                  <span class="payroll-legal-section-num">1</span>
                  Datos de la vigencia
                </h3>
                <div class="payroll-legal-form-grid">
                  <label class="payroll-legal-field">${fieldLabel(IC.calendar, "Año de vigencia")}
                    <select name="year" data-action="payroll-legal-set-year">${legalYearOptionsHtml}</select>
                  </label>
                  <label class="payroll-legal-field">${fieldLabel(IC.dollar, "SMMLV (COP)")}
                    <input name="smmlvCop" type="number" min="1" step="1" value="${escapeAttr(String(parseNum(legalDraft.smmlvCop)))}" ${canEditLegalParameters ? "" : "disabled"} />
                  </label>
                  <label class="payroll-legal-field">${fieldLabel(IC.truck, "Auxilio de transporte (COP)")}
                    <input name="transportAllowanceCop" type="number" min="0" step="1" value="${escapeAttr(String(parseNum(legalDraft.transportAllowanceCop)))}" ${canEditLegalParameters ? "" : "disabled"} />
                  </label>
                  <label class="payroll-legal-field">${fieldLabel(IC.hash, "UVT (COP)")}
                    <input name="uvtCop" type="number" min="0" step="1" value="${escapeAttr(String(parseNum(legalDraft.uvtCop || 0) || ""))}" placeholder="Opcional" ${canEditLegalParameters ? "" : "disabled"} />
                  </label>
                  <label class="payroll-legal-field">${fieldLabel(IC.heart, "Salud empleado (%)")}
                    ${legalInputSuffix(`<input name="healthEmployeeRatePct" type="number" min="0" max="100" step="0.01" value="${escapeAttr(String(healthRatePct))}" ${canEditLegalParameters ? "" : "disabled"} />`, "%")}
                  </label>
                  <label class="payroll-legal-field">${fieldLabel(IC.shield, "Pensión empleado (%)")}
                    ${legalInputSuffix(`<input name="pensionEmployeeRatePct" type="number" min="0" max="100" step="0.01" value="${escapeAttr(String(pensionRatePct))}" ${canEditLegalParameters ? "" : "disabled"} />`, "%")}
                  </label>
                  <label class="payroll-legal-field">${fieldLabel(IC.clock, "Horas legales semanales")}
                    ${legalInputSuffix(`<input name="legalWeeklyHours" type="number" min="1" max="168" step="1" value="${escapeAttr(String(parseNum(legalDraft.legalWeeklyHours || CO_HR_RULES.legalWeeklyHours)))}" ${canEditLegalParameters ? "" : "disabled"} />`, "horas")}
                  </label>
                </div>
                ${legalFormActions}
              </section>
              <aside class="payroll-legal-sidebar">
                <section class="payroll-legal-history payroll-legal-card" aria-labelledby="payroll-legal-history-title">
                  <div class="payroll-legal-history__head">
                    <h3 id="payroll-legal-history-title" class="payroll-legal-section-title">
                      <span class="payroll-legal-section-num">2</span>
                      Historial de vigencias
                    </h3>
                    ${
                      legalHistory.length
                        ? `<button type="button" class="payroll-legal-history__link muted" data-action="payroll-legal-set-year" data-year="${escapeAttr(String(legalHistory[0]?.year || legalDraft.year))}">Ver todas ${IC.chevronRight}</button>`
                        : ""
                    }
                  </div>
                  ${legalHistoryCards}
                </section>
                <section class="payroll-legal-global payroll-legal-card" aria-labelledby="payroll-legal-global-title">
                  <h3 id="payroll-legal-global-title" class="payroll-legal-section-title">
                    <span class="payroll-legal-section-num">3</span>
                    Referencia global
                  </h3>
                  <div class="payroll-legal-form-grid payroll-legal-form-grid--stack">
                    <label class="payroll-legal-field">${fieldLabel(IC.layers, "Modo de vigencia")}
                      <select name="platformReferenceMode" ${canEditLegalParameters ? "" : "disabled"}>
                        <option value="automatic" ${legalDraft.referenceMode === "automatic" ? "selected" : ""}>Automática por defecto</option>
                        <option value="manual" ${legalDraft.referenceMode === "manual" ? "selected" : ""}>Forzar vigencia manual</option>
                      </select>
                    </label>
                    <label class="payroll-legal-field">${fieldLabel(IC.calendar, "Año aplicado globalmente")}
                      <select name="platformReferenceYear" ${canEditLegalParameters ? "" : "disabled"}>${legalAppliedYearOptionsHtml}</select>
                    </label>
                  </div>
                  <p class="payroll-legal-form-hint muted">El tope del auxilio de transporte se calcula con <strong>2 SMMLV</strong> ($${legalCurrentCap.toLocaleString("es-CO")} para ${legalDraft.year}). Contratación y nómina consumen la referencia activa.</p>
                </section>
              </aside>
            </div>
          </form>
          <aside class="payroll-legal-tip" aria-label="Consejo">
            ${IC.compass}
            <div>
              <strong>Consejo</strong>
              <p class="muted">Mantenga actualizados los valores legales al inicio de cada año para que nómina, contratos y liquidaciones calculen correctamente SMMLV, auxilio, UVT y aportes.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>`;
  const driverRunRows = sortedDriverRuns
    .map((r) => {
      const nv = r.noveltiesDetail?.tripSummary || {};
      const state = r.paid ? "paid" : "pending";
      const monthLabel = formatPayrollPeriodLabel(r.month);
      return `<tr data-payroll-state="${state}">
        <td><strong>${escapeHtml(monthLabel)}</strong></td>
        <td>${escapeHtml(String(r.employeeName || "—"))}</td>
        <td class="num">${parseNum(r.tripCount ?? nv.tripCount ?? 0)}</td>
        <td class="num">${parseNum(r.interDepartmentTrips ?? nv.interDepartmentTrips ?? 0)}</td>
        <td>$${parseNum(r.travelAllowance || 0).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.fuelReimbursement || 0).toLocaleString("es-CO")}</td>
        <td><strong>$${parseNum(r.net).toLocaleString("es-CO")}</strong></td>
        <td>${r.paid ? '<span class="status status-viaje_asignado">Pagado</span>' : '<span class="status status-pendiente">Pendiente</span>'}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-action" data-action="payslip" data-id="${escapeAttr(String(r.id))}">${IC.printer} Comprobante</button>
          ${!r.paid ? `<button class="btn btn-sm btn-outline" data-action="recalc-driver-trip" data-employee-id="${escapeAttr(String(r.employeeId))}" data-month="${escapeAttr(String(r.month || "").slice(0, 7))}">${IC.activity} Recalcular</button>` : ""}
          ${!r.paid ? `<button class="btn btn-sm btn-approve" data-action="mark-payroll-paid" data-id="${escapeAttr(String(r.id))}">${IC.check} Marcar pagado</button>` : ""}
          ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-payroll-run" data-id="${escapeAttr(String(r.id))}">${IC.trash}</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");
  const driverPaymentsMeta =
    pendingDriverPayments > 0
      ? `<p class="payroll-consult-meta muted" role="status">${pendingDriverPayments} pendiente${pendingDriverPayments === 1 ? "" : "s"} · $${pendingDriverCop.toLocaleString("es-CO")}</p>`
      : `<p class="payroll-consult-meta muted" role="status">${sortedDriverRuns.length} liquidación${sortedDriverRuns.length === 1 ? "" : "es"} · tarifa $${parseNum(rules.interDepartmentTripAmount).toLocaleString("es-CO")}</p>`;
  const driverPaymentsCards = sortedDriverRuns.length
    ? `<div class="payroll-run-cards-grid">${sortedDriverRuns.map((r) => renderPayrollRunCard(r, { compact: true })).join("")}</div>`
    : "";
  const driverTableView = driverRunRows
    ? `<div class="table-wrap payroll-table-wrap payroll-runs-list-view"><table><thead><tr><th>Periodo</th><th>Conductor</th><th>Viajes</th><th>Interdep.</th><th>Viáticos</th><th>Combustible</th><th>Neto</th><th>Estado</th><th></th></tr></thead><tbody>${driverRunRows}</tbody></table></div>`
    : "";
  const driverPaymentsEmpty = emptyState("Sin liquidaciones de viajes. Vaya a Registrar → Pagos conductores para liquidar el mes.");
  const driverPaymentsBody =
    runsView === "list"
      ? driverTableView || driverPaymentsEmpty
      : driverPaymentsCards || driverPaymentsEmpty;
  const driverPaymentsToolbar = `<div class="payroll-runs-toolbar payroll-runs-toolbar--embedded payroll-consult-toolbar-row">
      ${renderPayrollRunsViewToggle(runsView, "driver")}
      ${driverPaymentsMeta}
    </div>`;
  const driverPaymentsPane = `<div class="payroll-data-pane${payrollDataSection === "driverPayments" ? "" : " hidden"}" data-payroll-section="driverPayments">
      ${employeeFilterBanner}
      <div class="payroll-consult-section">
        ${driverPaymentsToolbar}
        <div class="payroll-runs-body">${driverPaymentsBody}</div>
      </div>
    </div>`;
  const payrollDataCounts = {
    employees: employees.length,
    absences: absences.length,
    runs: nominaRunsAll.length,
    driverPayments: driverPaymentRunsAll.length,
    legal: legalHistory.length || 1
  };
  const payrollRunFilters =
    payrollDataSection === "runs" || payrollDataSection === "driverPayments"
      ? `<div class="payroll-data-toolbar__filters">${payrollQuickBar}${filtersHtml}</div>`
      : "";
  const employeesPane = `<div class="payroll-data-pane${payrollDataSection === "employees" ? "" : " hidden"}" data-payroll-section="employees">
      <div class="payroll-table-shell">${empTable}</div>
    </div>`;
  const absencesPane = `<div class="payroll-data-pane${payrollDataSection === "absences" ? "" : " hidden"}" data-payroll-section="absences">
      <div class="payroll-table-shell">${absenceTable}</div>
    </div>`;
  const runsPane = `<div class="payroll-data-pane${payrollDataSection === "runs" ? "" : " hidden"}" data-payroll-section="runs">
      ${employeeFilterBanner}
      <div class="payroll-runs-toolbar payroll-consult-toolbar-row">
        ${renderPayrollRunsViewToggle(runsView, "nomina")}
        <div class="payroll-runs-toolbar__actions">
          <p class="payroll-consult-meta muted"><strong>${runs.length}</strong> de ${nominaRunsAll.length}</p>
          <button type="button" class="btn btn-sm btn-outline" id="export-payroll">${IC.download} Exportar</button>
        </div>
      </div>
      <div class="payroll-runs-body">${runsPaneBody}</div>
    </div>`;
  const payrollDataBlock = `<section class="payroll-data-panel">
      ${payrollRunFilters ? `<div class="payroll-data-toolbar payroll-data-toolbar--compact">${payrollRunFilters}</div>` : ""}
      <div class="payroll-data-panes">${employeesPane}${absencesPane}${runsPane}${driverPaymentsPane}${legalPane}</div>
    </section>`;
  const payrollTabsNav = renderHrWorkspaceTabs({
    module: "payroll",
    ariaLabel: "Secciones del módulo Gestión humana",
    activeId: payrollWorkspace,
    variant: "switch",
    tabs: [
      { id: "operate", label: "Registrar", icon: "plus", hint: "Altas, nómina y ausencias" },
      { id: "data", label: "Consultar", icon: "eye", hint: "Colaboradores y liquidaciones" }
    ]
  });
  const payrollContractAlerts = renderPayrollEmployeesConsultAlerts(contractDashboardStats);
  const payrollWorkspaceHeader =
    payrollWorkspace === "data"
      ? renderPayrollConsultWorkspaceHeader({
          dataSection: payrollDataSection,
          counts: payrollDataCounts,
          contractAlertsHtml: payrollContractAlerts,
          actionsHtml: payrollTabsNav
        })
      : renderHrWorkspaceHeader(payrollModuleHead, payrollTabsNav, "payroll");
  const payrollOperatePanel = `<div class="hr-workspace-panel payroll-workspace-panel${payrollWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-payroll-panel="operate">
      ${payrollExecutionBlock}
    </div>`;
  const payrollDataPanel = `<div class="hr-workspace-panel payroll-workspace-panel${payrollWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-payroll-panel="data">
      ${payrollDataBlock}
    </div>`;
  const payrollStudioClass = `payroll-studio payroll-shell payroll-shell--workspace hr-flow-shell${payrollWorkspace === "data" ? " payroll-module--clean payroll-studio--consult" : ""}`;
  return `<section class="${payrollStudioClass}" data-hr-workspace="${escapeAttr(payrollWorkspace)}">${payrollWorkspaceHeader}
      <div class="hr-workspace-panels">
        ${payrollOperatePanel}
        ${payrollDataPanel}
      </div>
    </section>`;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ payrollHtml });
})();
