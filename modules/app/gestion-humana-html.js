/**
 * Gestión humana — HTML de la vista (payrollHtml).
 * Carga con defer antes de gestion-humana.js.
 */
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
  return `<div class="payroll-runs-view-toggle" role="tablist" aria-label="Vista de colaboradores">${mkBtn("list", IC.list, "Tabla")}${mkBtn("cards", IC.grid, "Tarjetas")}</div>`;
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
  const legalDraft = laborSystemParametersDraftForYear(legalSelectedYear, legalHistory);
  const legalYearOptions = laborSystemParametersSelectableYears(legalHistory);
  const legalAppliedYearOptions = [...new Set([legalDraft.year, ...legalYearOptions])].sort((a, b) => b - a);
  const payrollRunsForLegalYear = allRuns.filter((run) => String(run.month || "").startsWith(`${legalDraft.year}`)).length;
  const legalCurrentCap = Math.max(0, parseNum(legalDraft.smmlvCop) * CO_TRANSPORT_ALLOWANCE_MAX_SMMLV);
  const healthRatePct = (parseNum(legalDraft.healthEmployeeRate) * 100).toFixed(2).replace(/\.00$/, "");
  const pensionRatePct = (parseNum(legalDraft.pensionEmployeeRate) * 100).toFixed(2).replace(/\.00$/, "");
  const employeeSummaries = employees.map((e) => summarizePayrollEmployeeForDirectory(e));
  const fixedTermCount = employeeSummaries.filter((s) => isFixedTermContractType(s.raw.contractType)).length;
  const contractNoticeCount = employeeSummaries.filter(
    (s) => s.contract.applies && (s.contract.statusSlug === "notice_window" || s.contract.statusSlug === "expired")
  ).length;
  const employeeCards = employeeSummaries
    .map((item) => renderPayrollEmployeeDirectoryCard(item, canDeletePayrollEmployees, { compact: true }))
    .join("");
  const employeeTableRows = employeeSummaries
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
  const formEmp = `<form id="form-employee" class="payroll-emp-form p-form p-form-colored hr-form-flow">
    <div class="hr-form-wizard payroll-wizard" data-hr-wizard="employee" aria-label="Registro de empleado por pasos">
      <header class="payroll-wizard__head">
        <div class="payroll-wizard__head-copy">
          <span class="payroll-wizard__eyebrow">Vinculación laboral</span>
          <h3 class="payroll-wizard__title">Expediente del colaborador</h3>
          <p class="payroll-wizard__desc">Identificación, contrato, EPS, ARL, fondos de pensiones y cesantías, datos bancarios y requisitos de conductor según normativa colombiana.</p>
        </div>
        <div class="payroll-wizard__progress hr-form-wizard-meta">
          <div class="hr-wizard-progress-track" aria-hidden="true"><span class="hr-wizard-progress-fill" data-hr-wizard-progress-fill style="width:16.666667%"></span></div>
          <span class="hr-wizard-progress-label" data-hr-wizard-progress>Paso 1 de 6</span>
        </div>
      </header>
      <div class="payroll-wizard__layout">
        <nav class="payroll-wizard__steps hr-form-wizard-dots" role="tablist" aria-label="Secciones del formulario">
          <button type="button" class="hr-form-wizard-dot is-active" data-hr-wizard-dot="0" aria-label="Paso 1: identidad"><span class="hr-dot-num">1</span><span><small>Identidad</small><span class="payroll-wizard__step-hint">CC, datos personales</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="1" aria-label="Paso 2: contacto"><span class="hr-dot-num">2</span><span><small>Contacto</small><span class="payroll-wizard__step-hint">Ubicación y emergencias</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="2" aria-label="Paso 3: contrato laboral"><span class="hr-dot-num">3</span><span><small>Contrato</small><span class="payroll-wizard__step-hint">Cargo, salario, plazo</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="3" aria-label="Paso 4: seguridad social"><span class="hr-dot-num">4</span><span><small>Seg. social</small><span class="payroll-wizard__step-hint">EPS, ARL, fondos</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="4" aria-label="Paso 5: dispersión nómina"><span class="hr-dot-num">5</span><span><small>Nómina</small><span class="payroll-wizard__step-hint">Cuenta bancaria</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="5" aria-label="Paso 6: conductor"><span class="hr-dot-num">6</span><span><small>Conductor</small><span class="payroll-wizard__step-hint">Licencia y SIMIT</span></span></button>
        </nav>
        <div class="payroll-wizard__panels">

      <div class="hr-form-step is-active" data-step-index="0">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.user} Datos personales</legend>
      <div class="form-section-grid">
        <div class="full hr-employee-avatar-row" style="grid-column:1/-1">
          <div class="hr-employee-avatar-inner">
            <label for="emp-create-avatar-input" class="profile-avatar profile-avatar-lg profile-avatar-upload" data-emp-create-avatar-label title="Foto del empleado">
              <span class="profile-avatar-initial" data-emp-avatar-initial>E</span>
              <span class="profile-avatar-overlay"><span class="profile-avatar-overlay-inner">${IC.upload}<span>Foto</span></span></span>
              <input type="file" id="emp-create-avatar-input" name="avatarFile" accept="image/*" class="profile-avatar-file-input" aria-label="Foto del empleado" />
            </label>
            <p class="muted hr-employee-avatar-caption">JPG o PNG, opcional. Pulse el círculo para elegir archivo.</p>
          </div>
        </div>
        <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" required placeholder="Nombres y apellidos completos" data-antares-restrict="person-name" data-antares-field="person-name" /></label>
        <label>${fieldLabel(IC.file, "Tipo documento")}<select name="documentType" required>${docTypeOptions}</select></label>
        <label>${fieldLabel(IC.badge, "N° documento")}<input name="idDoc" required data-antares-restrict="alnum-doc" data-antares-field="doc" /></label>
        <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" data-antares-validate-blur="date-iso" /></label>
        <label>${fieldLabel(IC.users, "Género")}<select name="gender">${genderOpts}</select></label>
        <label>${fieldLabel(IC.heart, "Estado civil")}<select name="maritalStatus">${maritalOpts}</select></label>
        <label>${fieldLabel(IC.activity, "Tipo de sangre (RH)")}<select name="bloodType" required>${bloodTypeOptions}</select></label>
        <label>${fieldLabel(IC.graduation, "Nivel educativo")}<select name="educationLevel">${educationOpts}</select></label>
        <label>${fieldLabel(IC.heart, "¿Sufre alguna enfermedad o condición médica?")}<select name="hasIllness" id="emp-has-illness" required>
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select></label>
        <label class="full hidden" id="emp-illness-detail-label">${fieldLabel(IC.alertTriangle, "¿Cuál? (descripción libre)")}<textarea name="illnessDescription" id="emp-illness-detail" rows="2" placeholder="Detalle breve para uso médico/HR (alergias, condiciones crónicas, medicación regular, etc.)" data-antares-validate-blur="db-upper-multiline" data-antares-field="db-upper-multiline"></textarea></label>
      </div>
    </fieldset>
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
        <label>${fieldLabel(IC.award, "Curso conducción defensiva (Res. 17220)")}<select name="defensiveCourse">
          <option value="">Seleccione...</option>
          <option value="vigente">Vigente</option>
          <option value="vencido">Vencido</option>
          <option value="no_aplica">No aplica</option>
        </select></label>
        <label>${fieldLabel(IC.calendar, "Vence curso defensivo")}<input type="date" name="defensiveCourseExpiry" /></label>
        <label>${fieldLabel(IC.alertTriangle, "Comparendos pendientes (SIMIT)")}<input type="number" name="comparendos" min="0" max="9999" value="0" /></label>
        <label>${fieldLabel(IC.activity, "Años de experiencia conduciendo")}<input type="number" name="experienceYears" min="0" max="80" value="0" /></label>
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
  const formPay = `<form id="form-payroll" class="p-form p-form-colored hr-form-flow hr-form-compact payroll-single-form payroll-liquidation-pane${payrollLiquidationMode === "single" ? "" : " hidden"}" data-payroll-liquidation-pane="single" role="tabpanel" aria-hidden="${payrollLiquidationMode === "single" ? "false" : "true"}">
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.user} Periodo y persona</legend>
      ${
        nominaEmployees.length
          ? ""
          : `<p class="full payroll-single-empty muted">No hay colaboradores de nómina laboral en el directorio. Los conductores en prestación de servicios se liquidan en <strong>Pagos conductores</strong>.</p>`
      }
      <div class="form-section-grid payroll-single-form__grid">
        <label class="payroll-employee-picker">${fieldLabel(IC.user, "Empleado")}<select name="employeeId" id="payroll-employee-select" class="searchable-select-native" data-searchable-select="1" data-searchable-placeholder="Buscar por nombre, documento o periodicidad…" required${nominaEmployees.length ? "" : " disabled"}><option value="">Seleccione colaborador</option>${payrollNominaEmployeeOptions}</select></label>
        <label>${fieldLabel(IC.dollar, "Salario base mensual (COP)")}<input type="text" id="payroll-monthly-base-salary" readonly tabindex="-1" aria-readonly="true" value="" placeholder="Seleccione empleado" /></label>
        <p class="full muted hidden" id="payroll-freq-hint" style="font-size:0.82rem;margin:0"></p>
        <p class="full muted hidden" id="payroll-cesantias-consign-alert" style="font-size:0.82rem;line-height:1.45;margin:0"></p>
        <label>${fieldLabel(IC.calendar, "Fecha de cierre del período")}<input type="date" name="fechaCierre" id="payroll-fecha-cierre" value="${escapeAttr(todayYmdBulk)}" required /></label>
        <input type="hidden" name="month" id="payroll-month-hidden" value="" />
        <input type="hidden" name="payrollQuincena" id="payroll-quincena-hidden" value="Q1" />
        <div id="payroll-period-preview" class="payroll-period-preview full" role="status" aria-live="polite"></div>
      </div>
    </fieldset>
    <fieldset id="payroll-prima-fieldset" class="form-section form-section-amber full hidden" aria-hidden="true">
      <legend>${IC.award} Prima de servicios (semestral)</legend>
        <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.65rem">
        Junio y diciembre pueden incluir prima (una sola vez por mes del semestre). En nómina <strong>quincenal</strong> puede liquidarla en la 1ª quincena (día 15) o en la 2ª (cierre de mes), pero <strong>no en ambas</strong>. Cálculo orientativo: (salario base × días trabajados en el semestre) ÷ 360 (CST). Revise siempre con contador antes de pagar.
      </p>
      <div class="form-section-grid">
        <label class="full" style="align-items:flex-start;display:flex;gap:0.5rem;flex-wrap:wrap">
          <input type="checkbox" name="payPrimaServicios" value="1" id="payroll-pay-prima" style="margin-top:0.2rem" />
          <span>Sí, incluir prima de servicios en esta liquidación</span>
        </label>
        <label>${fieldLabel(IC.clock, "Días laborados en el semestre")}
          <input type="number" name="primaServiciosDays" min="1" max="183" placeholder="Ej. 180" disabled /></label>
        <label>${fieldLabel(IC.dollar, "Valor prima (COP)")}
          <input type="number" name="primaServiciosCop" min="0" step="100" disabled /></label>
        <p id="payroll-prima-dup-hint" class="full muted hidden" style="font-size:0.82rem;line-height:1.45;margin:0"></p>
      </div>
    </fieldset>
    <fieldset id="payroll-cesantias-int-fieldset" class="form-section form-section-violet full hidden" aria-hidden="true">
      <legend>${IC.dollar} Intereses sobre cesantías (enero o febrero)</legend>
      <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.65rem">
        <strong>Ley 52 de 1975:</strong> el trabajador tiene derecho a intereses del <strong>12% anual</strong> sobre sus cesantías; el legislador prevé el pago al trabajador <strong>en enero</strong> del año siguiente al causado. En nómina <strong>quincenal</strong> puede registrarse en enero o febrero, <strong>una sola vez por año</strong> (no repetir en la 2ª quincena si ya se pagó en la 1ª). Coordine fecha y base con extracto del fondo o contador.
      </p>
      <div class="form-section-grid">
        <label class="full" style="align-items:flex-start;display:flex;gap:0.5rem;flex-wrap:wrap">
          <input type="checkbox" name="payInteresesCesantias" value="1" id="payroll-pay-int-cesantias" style="margin-top:0.2rem" />
          <span>Incluir en esta liquidación el pago de intereses sobre cesantías</span>
        </label>
        <label>${fieldLabel(IC.dollar, "Base cesantías (COP)")}
          <input type="number" name="cesantiasInterestBaseCop" min="0" step="100" placeholder="Saldo/consignación año referencia" disabled /></label>
        <label>${fieldLabel(IC.clock, "Días (sobre 360 para proporcional)")}
          <input type="number" name="cesantiasInterestDays" min="1" max="366" value="360" disabled /></label>
        <label>${fieldLabel(IC.dollar, "Valor intereses (COP)")}
          <input type="number" name="interesesCesantiasCopMonthly" min="0" step="100" disabled /></label>
        <p id="payroll-int-ces-dup-hint" class="full muted hidden" style="font-size:0.82rem;line-height:1.45;margin:0"></p>
      </div>
    </fieldset>
    <fieldset id="payroll-variable-fieldset" class="form-section form-section-cyan full">
      <legend id="payroll-variable-legend">${IC.dollar} Pagos y deducciones variables</legend>
      <p class="full muted hidden" id="payroll-conductor-trip-hint" style="font-size:0.82rem;line-height:1.45;margin:0"></p>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.dollar, "Viáticos manuales (COP)")}<input type="number" name="travelAllowanceManual" value="0" min="0" /></label>
        <label>${fieldLabel(IC.dollar, "Reembolso combustible manual (COP)")}<input type="number" name="fuelReimbursementManual" value="0" min="0" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.clock, "HED — hora extra diurna")}<input type="number" name="hedHours" value="0" min="0" step="0.5" title="Hora extra diurna (+25%)" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.clock, "HEN — hora extra nocturna")}<input type="number" name="henHours" value="0" min="0" step="0.5" title="Hora extra nocturna (+75%)" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.clock, "HRDF — recargo dom./festivo")}<input type="number" name="hrdfHours" value="0" min="0" step="0.5" title="Hora recargo dominical o festivo (+100%)" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.clock, "HRNF — recargo noct. festivo")}<input type="number" name="hrnfHours" value="0" min="0" step="0.5" title="Hora recargo nocturno en festivo (+75%)" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.clock, "Recargo nocturno (horas)")}<input type="number" name="recargoNocturnoHoras" value="0" min="0" step="0.5" title="Recargo nocturno ordinario (+35%)" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.dollar, "Otros extras gravables (COP)")}<input type="number" name="extras" value="0" min="0" title="Montos adicionales no desglosados en horas" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.truck, "Auxilio transporte (COP)")}<input type="number" name="aux" value="${CO_HR_RULES.transportAllowance}" min="0" title="Se rellena con el subsidio registrado en la ficha del empleado; puede ajustarlo si aplica otro valor en el período." /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.award, "Bonificaciones (COP)")}<input type="number" name="bonus" value="0" min="0" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.user, "Dependientes retención (N°)")}<input type="number" name="withholdingDependents" value="0" min="0" max="10" step="1" title="Procedimiento 1 orientativo: 32 UVT por dependiente" /></label>
      </div>
      <p class="full muted" data-payroll-nomina-only="1" style="font-size:0.8rem;line-height:1.45;margin:0.35rem 0 0">Horas extras según CST (orientativo). IBC con salario integral al 70%. Solidaridad y subsistencia por tramos SMMLV. Retención estimada con UVT de parámetros legales.</p>
    </fieldset>
    ${renderManagedCreateFormActions("create-payroll", `<button class="btn btn-primary" type="submit" id="payroll-submit-btn">${IC.dollar} Generar liquidación</button>`)}
  </form>`;
  const conductorTripPayOpts = conductorEmployees
    .map((e) => `<option value="${e.id}">${escapeHtml(e.name)} · ${escapeHtml(String(e.idDoc || "—"))}</option>`)
    .join("");
  const formDriverTripPay = `<form id="form-driver-trip-payment" class="p-form p-form-colored hr-form-flow hr-form-compact">
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
  const formPayrollSettlement = `<form id="form-payroll-settlement" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.activity} Liquidación contractual (terminación)</legend>
      <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.75rem">
        Para renuncia, despido u otras causas de terminación. Montos orientativos (cesantías, intereses proporcionales, prima proporcional, vacaciones según ordenamiento laboral colombiano). Ajuste cada rubro y consolide con contabilidad y fondos.
      </p>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Empleado")}<select name="employeeId" required>${payrollEmpOptionsSettlement}</select></label>
        <label>${fieldLabel(IC.dollar, "Salario base mensual (COP)")}<input type="text" id="payroll-settlement-base-salary" readonly tabindex="-1" aria-readonly="true" value="" placeholder="Seleccione empleado" /></label>
        <label>${fieldLabel(IC.calendar, "Mes de retiro (período)")}<input type="month" name="month" required /></label>
        <label>${fieldLabel(IC.calendar, "Fecha de terminación")}<input type="date" name="terminationDate" required /></label>
        <label>${fieldLabel(IC.file, "Motivo de terminación")}
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
    </fieldset>
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.clock} Referencias para el cálculo</legend>
      <p id="settlement-cause-hint" class="full muted hidden" style="font-size:0.82rem;line-height:1.45;margin:0 0 0.65rem"></p>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.clock, "Días totales laborados")}<input type="number" name="employedDays" min="0" max="20000" readonly tabindex="-1" /></label>
        <label>${fieldLabel(IC.clock, "Días año 360 (cesantías)")}<input type="number" name="days360Year" min="0" max="360" value="0" /></label>
        <label>${fieldLabel(IC.clock, "Días proporcional prima")}<input type="number" name="primaPropDays" min="0" max="360" value="0" /></label>
        <label>${fieldLabel(IC.calendar, "Días vacaciones pendientes")}<input type="number" name="vacationDays" min="0" max="366" step="0.01" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Saldo cesantías en fondo (COP)")}<input type="number" name="cesantiasFondoBalanceCop" min="0" step="100" value="0" /></label>
        <label>${fieldLabel(IC.clock, "Días aviso previo cumplidos")}<input type="number" name="avisoPrevioDaysWorked" min="0" max="60" value="0" title="Despido sin justa: 30 días si indefinido. Renuncia: 15 días al empleador." /></label>
        <label>${fieldLabel(IC.clock, "Días aviso renuncia (trabajador)")}<input type="number" name="renunciaAvisoDaysWorked" min="0" max="60" value="0" title="Si renuncia y no cumplió 15 días de aviso, se descuenta del finiquito (CST art. 62)." /></label>
        <label>${fieldLabel(IC.dollar, "Horas extras pendientes (COP)")}<input type="number" name="pendingOvertimeCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Bonificaciones pendientes (COP)")}<input type="number" name="pendingBonusCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.user, "Dependientes retención")}<input type="number" name="withholdingDependents" min="0" max="10" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Indemnización pactada (COP)")}<input type="number" name="indemnization" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Otros conceptos (COP)")}<input type="number" name="otrosSettlement" min="0" value="0" /></label>
        <div class="full toolbar" style="justify-content:flex-start;align-items:center;gap:0.75rem;flex-wrap:wrap">
          <button type="button" class="btn btn-sm btn-outline" data-action="settlement-recalc">${IC.activity} Calcular liquidación sugerida</button>
          <strong id="settlement-preview-net" class="muted" style="font-size:0.9rem"></strong>
        </div>
        <label>${fieldLabel(IC.dollar, "Salario pendiente mes retiro (COP)")}<input type="number" name="salarioPendienteCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.truck, "Auxilio transporte pendiente (COP)")}<input type="number" name="auxilioPendienteCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Cesantías total (COP)")}<input type="number" name="cesantiasCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Intereses cesantías (COP)")}<input type="number" name="interesesCesantiasCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Prima proporcional (COP)")}<input type="number" name="primaPropCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Vacaciones (COP)")}<input type="number" name="vacacionesCop" min="0" value="0" /></label>
        <input type="hidden" name="indemnizacionDespidoCop" value="0" />
        <input type="hidden" name="indemnizacionAvisoCop" value="0" />
      </div>
      <p class="full muted" style="font-size:0.8rem;line-height:1.45;margin:0.35rem 0 0">Causal define indemnización (CST art. 64). Vacaciones: 15 días/año menos gozadas. Retención orientativa sobre salario pendiente.</p>
    </fieldset>
    ${renderManagedCreateFormActions("create-payroll-settlement", `<button class="btn btn-primary" type="submit">${IC.save} Registrar liquidación contractual</button>`)}
  </form>`;
  const formAbsence = `<form id="form-hr-absence" class="p-form p-form-colored hr-form-flow hr-absence-create-form">
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
  const employeeToolbar = `<div class="payroll-employee-toolbar">
      ${renderPayrollEmployeesViewToggle(employeesView)}
      <label class="payroll-employee-search">${fieldLabel(IC.search, "Buscar")}
        <input type="search" id="payroll-employee-search" placeholder="Nombre, documento, cargo, centro de costos…" autocomplete="off" />
      </label>
      <label class="payroll-employee-filter">${fieldLabel(IC.calendar, "Contrato")}
        <select id="payroll-employee-contract-filter">
          <option value="all">Todos</option>
          <option value="notice_window">Aviso urgente (≤30 días)</option>
          <option value="expired">Vencidos</option>
          <option value="active">Término fijo vigente</option>
        </select>
      </label>
      ${canDeletePayrollEmployees ? `<div class="payroll-employee-toolbar-actions toolbar">
        <button type="button" id="employees-select-all" class="btn btn-sm btn-action">${IC.check} Seleccionar todo</button>
        <button type="button" id="employees-delete-selected" class="btn btn-sm btn-reject" title="Eliminar colaboradores seleccionados">${IC.trash} Eliminar seleccionados</button>
      </div>` : ""}
    </div>`;
  const employeeTable = employeeTableRows
    ? `<div class="table-wrap payroll-table-wrap payroll-employees-list-view"><table class="payroll-employees-table"><thead><tr><th>Colaborador</th><th>Cargo</th><th>Ingreso</th><th>Inicio vigente</th><th>Renovación</th><th>Fin contrato</th><th>Estado</th><th style="min-width:12rem">Acciones</th></tr></thead><tbody>${employeeTableRows}</tbody></table></div>`
    : "";
  const empTable =
    employeesView === "list"
      ? employeeTableRows
        ? `${employeeToolbar}${employeeTable}`
        : emptyState("No hay empleados registrados.")
      : employeeCards
        ? `${employeeToolbar}<div class="employees-grid directory-grid payroll-employees-grid">${employeeCards}</div>`
        : emptyState("No hay empleados registrados.");
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
      <button type="button" class="btn btn-outline btn-sm" data-action="payroll-clear-filters">${IC.x} Limpiar</button>
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
    contractNoticeCount
  });
  const payrollOperateNav = renderPayrollOperateSectionNav(payrollOperateSection);
  const payrollOperatePaneHidden = (section) => payrollOperateSection !== section;
  const payrollOperatePane = (section, body) =>
    `<div class="auth-tab-panel${payrollOperatePaneHidden(section) ? " hidden" : ""}" data-payroll-operate-pane="${section}"${payrollOperatePaneHidden(section) ? " hidden" : ""} aria-hidden="${payrollOperatePaneHidden(section) ? "true" : "false"}">${body}</div>`;
  const employeeOperatePane = payrollOperatePane(
    "employee",
    createHrActionCard("create-employee", "userPlus", "Nuevo colaborador", "Expediente de vinculación con contrato Word y seguridad social (Colombia)", formEmp, "Abrir expediente", { createPanels: payrollCreateUi })
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
  const payrollExecutionBlock = `<section class="payroll-operate payroll-operate-panel">
      <aside class="payroll-operate__rail" aria-label="Trámites de registro">
        <p class="payroll-operate__rail-label">Tipo de trámite</p>
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
  const legalSummary = `<dl class="payroll-legal-summary" aria-label="Parámetros del año seleccionado">
      <div><dt>SMMLV ${legalDraft.year}</dt><dd>$${parseNum(legalDraft.smmlvCop).toLocaleString("es-CO")}</dd></div>
      <div><dt>Auxilio transporte</dt><dd>$${parseNum(legalDraft.transportAllowanceCop).toLocaleString("es-CO")}</dd></div>
      <div><dt>Salud / pensión</dt><dd>${healthRatePct}% / ${pensionRatePct}%</dd></div>
      <div><dt>Horas semanales</dt><dd>${parseNum(legalDraft.legalWeeklyHours || CO_HR_RULES.legalWeeklyHours)}</dd></div>
      <div><dt>Tope auxilio (2 SMMLV)</dt><dd>$${legalCurrentCap.toLocaleString("es-CO")}</dd></div>
      <div><dt>Modo plataforma</dt><dd><strong>${legalDraft.referenceMode === "manual" ? `Manual · ${escapeHtml(String(legalDraft.activeYear))}` : "Automático"}</strong></dd></div>
    </dl>`;
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
    : `<p class="payroll-legal-empty muted">Aún no hay vigencias guardadas en base de datos. Cree la primera con el formulario.</p>`;
  const legalReadOnlyNotice = canEditLegalParameters
    ? ""
    : `<p class="payroll-legal-notice payroll-legal-notice--info muted">Solo administradores pueden editar o eliminar vigencias. RRHH consulta el histórico y los valores aplicados en nómina.</p>`;
  const legalPayrollWarning = payrollRunsForLegalYear
    ? `<p class="payroll-legal-notice payroll-legal-notice--warn status status-pendiente">Advertencia: ${payrollRunsForLegalYear} liquidación${payrollRunsForLegalYear === 1 ? "" : "es"} del año ${legalDraft.year} ya usan referencias de esta vigencia. Guardar actualiza parámetros; eliminar la vigencia no borra liquidaciones.</p>`
    : "";
  const legalFormActions = canEditLegalParameters
    ? `<div class="payroll-legal-form-actions">
        <button type="submit" class="btn btn-primary">${IC.check} Guardar vigencia ${escapeHtml(String(legalDraft.year))}</button>
        ${
          legalHasSavedYear
            ? `<button type="button" class="btn btn-outline btn-reject" data-action="payroll-legal-delete" data-year="${escapeAttr(String(legalDraft.year))}">${IC.trash} Eliminar vigencia ${escapeHtml(String(legalDraft.year))}</button>`
            : ""
        }
      </div>`
    : "";
  const legalPane = `<div class="payroll-data-pane${payrollDataSection === "legal" ? "" : " hidden"}" data-payroll-section="legal">
      <div class="payroll-legal-panel admin-users-data-card hr-form-card hr-form-card--xl hr-form-card--payroll">
        <header class="payroll-legal-panel__head">
          <div class="payroll-legal-panel__brand">
            ${hrCardIconMarkup("hash")}
            <div>
              <h2>Parámetros legales anuales</h2>
              <p class="muted">SMMLV, auxilio, UVT, aportes y horas legales por vigencia. Contratación y nómina consumen la referencia activa.</p>
            </div>
          </div>
        </header>
        <div class="payroll-legal-panel__body">
          ${legalReadOnlyNotice}
          <div class="payroll-legal-layout">
            <section class="payroll-legal-editor" aria-labelledby="payroll-legal-editor-title">
              <h3 id="payroll-legal-editor-title" class="payroll-legal-section-title">${IC.edit} Editar vigencia <span class="payroll-legal-editor-year">${escapeHtml(String(legalDraft.year))}</span></h3>
              ${legalSummary}
              ${legalPayrollWarning}
              <form id="form-payroll-legal-params" class="p-form p-form-colored hr-form-flow hr-form-compact payroll-legal-form">
                <fieldset class="form-section form-section-violet full">
                  <legend>${IC.hash} Valores del año</legend>
                  <div class="form-section-grid">
                    <label>${fieldLabel(IC.calendar, "Año de vigencia")}
                      <select name="year" data-action="payroll-legal-set-year">${legalYearOptionsHtml}</select>
                    </label>
                    <label>${fieldLabel(IC.dollar, "SMMLV (COP)")}
                      <input name="smmlvCop" type="number" min="1" step="1" value="${escapeAttr(String(parseNum(legalDraft.smmlvCop)))}" ${canEditLegalParameters ? "" : "disabled"} />
                    </label>
                    <label>${fieldLabel(IC.activity, "Auxilio transporte (COP)")}
                      <input name="transportAllowanceCop" type="number" min="0" step="1" value="${escapeAttr(String(parseNum(legalDraft.transportAllowanceCop)))}" ${canEditLegalParameters ? "" : "disabled"} />
                    </label>
                    <label>${fieldLabel(IC.heart, "Salud empleado %")}
                      <input name="healthEmployeeRatePct" type="number" min="0" max="100" step="0.01" value="${escapeAttr(String(healthRatePct))}" ${canEditLegalParameters ? "" : "disabled"} />
                    </label>
                    <label>${fieldLabel(IC.shield, "Pensión empleado %")}
                      <input name="pensionEmployeeRatePct" type="number" min="0" max="100" step="0.01" value="${escapeAttr(String(pensionRatePct))}" ${canEditLegalParameters ? "" : "disabled"} />
                    </label>
                    <label>${fieldLabel(IC.hash, "UVT (COP)")}
                      <input name="uvtCop" type="number" min="0" step="1" value="${escapeAttr(String(parseNum(legalDraft.uvtCop || 0) || ""))}" placeholder="Opcional" ${canEditLegalParameters ? "" : "disabled"} />
                    </label>
                    <label>${fieldLabel(IC.clock, "Horas legales semanales")}
                      <input name="legalWeeklyHours" type="number" min="1" max="168" step="1" value="${escapeAttr(String(parseNum(legalDraft.legalWeeklyHours || CO_HR_RULES.legalWeeklyHours)))}" ${canEditLegalParameters ? "" : "disabled"} />
                    </label>
                  </div>
                </fieldset>
                <fieldset class="form-section form-section-cyan full">
                  <legend>${IC.layers} Referencia global en plataforma</legend>
                  <div class="form-section-grid">
                    <label>${fieldLabel(IC.layers, "Modo de vigencia")}
                      <select name="platformReferenceMode" ${canEditLegalParameters ? "" : "disabled"}>
                        <option value="automatic" ${legalDraft.referenceMode === "automatic" ? "selected" : ""}>Automática por fecha actual</option>
                        <option value="manual" ${legalDraft.referenceMode === "manual" ? "selected" : ""}>Forzar vigencia manual</option>
                      </select>
                    </label>
                    <label>${fieldLabel(IC.calendar, "Año aplicado globalmente")}
                      <select name="platformReferenceYear" ${canEditLegalParameters ? "" : "disabled"}>${legalAppliedYearOptionsHtml}</select>
                    </label>
                    <p class="full muted payroll-legal-form-hint">El tope del auxilio de transporte se calcula con <strong>2 SMMLV</strong> ($${legalCurrentCap.toLocaleString("es-CO")} para ${legalDraft.year}).</p>
                  </div>
                </fieldset>
                ${legalFormActions}
              </form>
            </section>
            <section class="payroll-legal-history" aria-labelledby="payroll-legal-history-title">
              <div class="payroll-legal-history__head">
                <h3 id="payroll-legal-history-title" class="payroll-legal-section-title">${IC.layers} Historial de vigencias</h3>
                <span class="payroll-legal-history__count muted">${legalHistory.length} registro${legalHistory.length === 1 ? "" : "s"}</span>
              </div>
              ${legalHistoryCards}
            </section>
          </div>
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
  const driverPaymentsSummary = `<dl class="payroll-driver-kpi" aria-label="Resumen pagos conductores">
      <div><dt>Pendientes de pago</dt><dd><strong>${pendingDriverPayments}</strong> · $${pendingDriverCop.toLocaleString("es-CO")}</dd></div>
      <div><dt>Neto conductores (${escapeHtml(currentYm)})</dt><dd><strong>$${totalDriverMonth.toLocaleString("es-CO")}</strong></dd></div>
      <div><dt>Fichas conductor</dt><dd><strong>${conductorEmployees.length}</strong></dd></div>
      <div><dt>Tarifa interdepartamental</dt><dd><strong>$${parseNum(rules.interDepartmentTripAmount).toLocaleString("es-CO")}</strong></dd></div>
    </dl>`;
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
  const driverPaymentsToolbar = `<div class="payroll-runs-toolbar payroll-runs-toolbar--embedded">
      ${renderPayrollRunsViewToggle(runsView, "driver")}
      <p class="payroll-result-meta muted payroll-runs-toolbar__meta">${sortedDriverRuns.length} liquidación${sortedDriverRuns.length === 1 ? "" : "es"} de conductores</p>
    </div>`;
  const driverPaymentsPane = `<div class="payroll-data-pane${payrollDataSection === "driverPayments" ? "" : " hidden"}" data-payroll-section="driverPayments">
      ${employeeFilterBanner}
      ${pcardWrapPro(
        "truck",
        "Cuentas por pagar — conductores",
        "Prestación de servicios · liquidaciones_nomina (prestacion_viajes)",
        `${driverPaymentsSummary}${driverPaymentsToolbar}<div class="payroll-runs-body">${driverPaymentsBody}</div>`,
        "admin-users-data-card"
      )}
    </div>`;
  const payrollDataNav = renderPayrollDataSectionNav(
    payrollDataSection,
    {
      employees: employees.length,
      absences: absences.length,
      runs: nominaRunsAll.length,
      driverPayments: driverPaymentRunsAll.length,
      legal: legalHistory.length || 1
    },
    { minimal: true }
  );
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
      <div class="payroll-runs-toolbar">
        ${renderPayrollRunsViewToggle(runsView, "nomina")}
        <div class="payroll-runs-toolbar__actions">
          <p class="payroll-result-meta muted">Mostrando <strong>${runs.length}</strong> de ${nominaRunsAll.length} liquidación${nominaRunsAll.length === 1 ? "" : "es"} de nómina laboral</p>
          <button type="button" class="btn btn-sm btn-outline" id="export-payroll">${IC.download} Exportar CSV</button>
        </div>
      </div>
      <div class="payroll-runs-body">${runsPaneBody}</div>
    </div>`;
  const payrollDataBlock = `<section class="payroll-data-panel">
      <div class="payroll-data-toolbar payroll-data-toolbar--compact">
        ${payrollDataNav}
        ${payrollRunFilters}
      </div>
      <div class="payroll-data-panes">${employeesPane}${absencesPane}${runsPane}${driverPaymentsPane}${legalPane}</div>
    </section>`;
  const payrollTabsNav = renderHrWorkspaceTabs({
    module: "payroll",
    ariaLabel: "Secciones del módulo Personal y nómina",
    activeId: payrollWorkspace,
    variant: "switch",
    tabs: [
      { id: "operate", label: "Registrar", icon: "plus", hint: "Altas, nómina y ausencias" },
      { id: "data", label: "Consultar", icon: "eye", hint: "Expedientes y liquidaciones" }
    ]
  });
  const payrollWorkspaceHeader = renderHrWorkspaceHeader(payrollModuleHead, payrollTabsNav, "payroll");
  const payrollOperatePanel = `<div class="hr-workspace-panel payroll-workspace-panel${payrollWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-payroll-panel="operate">
      ${payrollExecutionBlock}
    </div>`;
  const payrollDataPanel = `<div class="hr-workspace-panel payroll-workspace-panel${payrollWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-payroll-panel="data">
      ${payrollDataBlock}
    </div>`;
  return `<section class="payroll-studio payroll-shell payroll-shell--workspace hr-flow-shell" data-hr-workspace="${escapeAttr(payrollWorkspace)}">${payrollWorkspaceHeader}
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
