/**
 * Gestión humana / nómina (`payroll`): HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
 */
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
  const nominaEmployees = listPayrollNominaEmployees(employees);
  const payrollLiquidationMode = String(payrollUi.liquidationMode || "single").toLowerCase() === "bulk" ? "bulk" : "single";
  const payrollNominaEmployeeOptions = nominaEmployees
    .map(
      (e) =>
        `<option value="${escapeAttr(String(e.id))}">${escapeHtml(String(e.name || ""))} · ${escapeHtml(String(e.idDoc || "—"))} · ${escapeHtml(String(e.payFrequency || "Mensual"))}</option>`
    )
    .join("");
  const absences = readArray(KEYS.hrAbsences);
  const filters = state.payrollFilters || defaultPayrollFilters();
  const payrollUi = state.payrollUi || { runSort: "recent", workspace: "operate", dataSection: "employees" };
  const runSort = String(payrollUi.runSort || "recent");
  const payrollWorkspace = normalizeHrWorkspace("payroll", payrollUi.workspace);
  const payrollDataSection = normalizePayrollDataSection(payrollUi.dataSection);
  const payrollOperateSection = normalizePayrollOperateSection(payrollUi.operateSection);
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
    .map((item) => renderPayrollEmployeeDirectoryCard(item, hrAdminDeletes, { compact: true }))
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
      return `<tr data-payroll-state="${state}">
        <td><strong>${escapeHtml(monthLabel)}</strong></td>
        <td>${typeCell}</td>
        <td>${escapeHtml(String(r.employeeName || "—"))}</td>
        <td>$${parseNum(r.gross).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.travelAllowance || 0).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.fuelReimbursement || 0).toLocaleString("es-CO")}</td>
        <td>$${parseNum(r.deductions).toLocaleString("es-CO")}</td>
        <td><strong>$${parseNum(r.net).toLocaleString("es-CO")}</strong></td>
        <td>${r.paid ? '<span class="status status-viaje_asignado">Pagado</span>' : '<span class="status status-pendiente">Pendiente</span>'}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-action" data-action="payslip" data-id="${escapeAttr(String(r.id))}">${IC.printer} Desprendible</button>
          ${!r.paid ? `<button class="btn btn-sm btn-approve" data-action="mark-payroll-paid" data-id="${escapeAttr(String(r.id))}">${IC.check} Marcar pagado</button>` : ""}
          ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-payroll-run" data-id="${escapeAttr(String(r.id))}" title="Eliminar esta liquidacion (solo administradores)">${IC.trash} Eliminar liquidacion</button>` : ""}
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
  const payFreqOpts = selectOptionsFromCatalog(CO_CATALOGS.payFrequency);
  const formEmp = `<form id="form-employee" class="gh-emp-form p-form p-form-colored hr-form-flow">
    <div class="hr-form-wizard gh-emp-wizard" data-hr-wizard="employee" aria-label="Registro de empleado por pasos">
      <header class="gh-emp-wizard__head">
        <div class="gh-emp-wizard__head-copy">
          <span class="gh-emp-wizard__eyebrow">Vinculación laboral</span>
          <h3 class="gh-emp-wizard__title">Expediente del colaborador</h3>
          <p class="gh-emp-wizard__desc">Identificación, contrato, EPS, ARL, fondos de pensiones y cesantías, datos bancarios y requisitos de conductor según normativa colombiana.</p>
        </div>
        <div class="gh-emp-wizard__progress hr-form-wizard-meta">
          <div class="hr-wizard-progress-track" aria-hidden="true"><span class="hr-wizard-progress-fill" data-hr-wizard-progress-fill style="width:16.666667%"></span></div>
          <span class="hr-wizard-progress-label" data-hr-wizard-progress>Paso 1 de 6</span>
        </div>
      </header>
      <div class="gh-emp-wizard__layout">
        <nav class="gh-emp-wizard__steps hr-form-wizard-dots" role="tablist" aria-label="Secciones del formulario">
          <button type="button" class="hr-form-wizard-dot is-active" data-hr-wizard-dot="0" aria-label="Paso 1: identidad"><span class="hr-dot-num">1</span><span><small>Identidad</small><span class="gh-step-hint">CC, datos personales</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="1" aria-label="Paso 2: contacto"><span class="hr-dot-num">2</span><span><small>Contacto</small><span class="gh-step-hint">Ubicación y emergencias</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="2" aria-label="Paso 3: contrato laboral"><span class="hr-dot-num">3</span><span><small>Contrato</small><span class="gh-step-hint">Cargo, salario, plazo</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="3" aria-label="Paso 4: seguridad social"><span class="hr-dot-num">4</span><span><small>Seg. social</small><span class="gh-step-hint">EPS, ARL, fondos</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="4" aria-label="Paso 5: dispersión nómina"><span class="hr-dot-num">5</span><span><small>Nómina</small><span class="gh-step-hint">Cuenta bancaria</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="5" aria-label="Paso 6: conductor"><span class="hr-dot-num">6</span><span><small>Conductor</small><span class="gh-step-hint">Licencia y SIMIT</span></span></button>
        </nav>
        <div class="gh-emp-wizard__panels">

      <div class="hr-form-step is-active" data-step-index="0">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.user} Datos personales</legend>
      <div class="form-section-grid">
        <div class="full hr-employee-avatar-row" style="grid-column:1/-1">
          <div class="hr-employee-avatar-inner">
            <label for="emp-create-avatar-input" class="profile-avatar profile-avatar-lg profile-avatar-upload" data-emp-create-avatar-label title="Foto del empleado">
              <span class="profile-avatar-initial" data-emp-avatar-initial>E</span>
              <span class="profile-avatar-overlay"><span class="profile-avatar-overlay-inner">${IC.upload}<span>Foto</span></span></span>
            </label>
            <input type="file" id="emp-create-avatar-input" name="avatarFile" accept="image/*" class="profile-avatar-file-input" aria-label="Foto del empleado" />
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
        <label>${fieldLabel(IC.phone, "Teléfono celular")}<input name="phone" required placeholder="3001234567" data-antares-restrict="digits" data-antares-validate-blur="phone-loose" /></label>
        <label>${fieldLabel(IC.mail, "Correo personal")}<input type="email" name="personalEmail" placeholder="empleado@correo.com" data-antares-validate-blur="email" data-antares-restrict="email-local" /></label>
        <label>${fieldLabel(IC.user, "Contacto de emergencia")}<input name="emergencyContact" required data-antares-restrict="person-name" data-antares-field="person-name" /></label>
        <label>${fieldLabel(IC.phone, "Teléfono emergencia")}<input name="emergencyPhone" required data-antares-restrict="digits" data-antares-validate-blur="phone-loose" /></label>
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
            : "Primero cree el cargo en Contratación › Cargos. Aquí solo se listan los cargos del catálogo, no se escriben a mano."
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
  const todayYmdBulk = new Date().toISOString().slice(0, 10);
  const payrollLiquidationModeNav = `<div class="payroll-liquidation-mode" role="tablist" aria-label="Modo de liquidación">
      <button type="button" class="payroll-liquidation-mode__btn${payrollLiquidationMode === "single" ? " is-active" : ""}" role="tab" aria-selected="${payrollLiquidationMode === "single" ? "true" : "false"}" data-action="payroll-liquidation-mode" data-mode="single">${IC.user} Un colaborador</button>
      <button type="button" class="payroll-liquidation-mode__btn${payrollLiquidationMode === "bulk" ? " is-active" : ""}" role="tab" aria-selected="${payrollLiquidationMode === "bulk" ? "true" : "false"}" data-action="payroll-liquidation-mode" data-mode="bulk">${IC.users} Todos (cascada)</button>
    </div>`;
  const formPayBulk = `<section class="payroll-bulk-panel payroll-liquidation-pane${payrollLiquidationMode === "bulk" ? "" : " hidden"}" data-payroll-liquidation-pane="bulk" aria-labelledby="payroll-bulk-title"${payrollLiquidationMode === "bulk" ? "" : " hidden"}>
      <div class="payroll-bulk-panel__intro">
        <h4 id="payroll-bulk-title" class="payroll-bulk-title">${IC.users} Liquidación masiva</h4>
        <p class="muted payroll-bulk-lead">Liquidaciones para todos los colaboradores según su periodicidad de pago (mensual, quincenal, etc.). En <strong>junio</strong> y <strong>diciembre</strong> incluye prima de servicios al cerrar el último corte del mes; en <strong>enero</strong> o <strong>febrero</strong> puede incluir intereses de cesantías si configuró la base en el servidor. Quedan pendientes de pago.</p>
      </div>
      <div class="payroll-bulk-fields">
        <label class="payroll-bulk-field">${fieldLabel(IC.calendar, "Fecha de cierre del período")}<input type="date" id="payroll-bulk-fecha" name="fechaReferencia" value="${escapeAttr(todayYmdBulk)}" required /></label>
        <label class="payroll-bulk-option">
          <input type="checkbox" id="payroll-bulk-force" checked />
          <span class="payroll-bulk-option__copy">
            <span class="payroll-bulk-option__label">Usar el último corte ya cerrado en esa fecha</span>
            <span class="payroll-bulk-option__hint muted">Útil si hoy no es día 15 ni fin de mes.</span>
          </span>
        </label>
      </div>
      <div class="payroll-bulk-actions">
        <button type="button" class="btn btn-primary payroll-bulk-generate-btn" id="payroll-bulk-generate">${IC.dollar}<span>Generar liquidaciones</span></button>
      </div>
    </section>`;
  const formPay = `<form id="form-payroll" class="p-form p-form-colored hr-form-flow hr-form-compact payroll-single-form${payrollLiquidationMode === "single" ? "" : " hidden"}" data-payroll-liquidation-pane="single"${payrollLiquidationMode === "single" ? "" : " hidden"}>
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
        <label>${fieldLabel(IC.calendar, "Mes calendario")}<input type="month" name="month" required /></label>
        <label id="payroll-quincena-wrap" class="hidden" aria-hidden="true">${fieldLabel(IC.clock, "Quincena")}
          <select name="payrollQuincena" id="payroll-quincena-select">
            <option value="Q1">1ª quincena (días 1–15)</option>
            <option value="Q2">2ª quincena (días 16–fin de mes)</option>
          </select>
        </label>
      </div>
    </fieldset>
    <fieldset id="payroll-prima-fieldset" class="form-section form-section-amber full hidden" aria-hidden="true">
      <legend>${IC.award} Prima de servicios (semestral)</legend>
      <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.65rem">
        Junio y diciembre pueden incluir prima. Cálculo orientativo: (salario base × días trabajados en el semestre) ÷ 360 (CST). Revise siempre con contador antes de pagar.
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
      </div>
    </fieldset>
    <fieldset id="payroll-cesantias-int-fieldset" class="form-section form-section-violet full hidden" aria-hidden="true">
      <legend>${IC.dollar} Intereses sobre cesantías (enero o febrero)</legend>
      <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.65rem">
        <strong>Ley 52 de 1975:</strong> el trabajador tiene derecho a intereses del <strong>12% anual</strong> sobre sus cesantías; el legislador prevé el pago al trabajador <strong>en enero</strong> del año siguiente al causado (y reglas especiales en retiros o ceses). Este bloque aparece si el mes liquidado es enero (01) o febrero (02): use enero para coincidir con el plazo habitual, o febrero solo si así lo acuerda política interna y contabilidad sin omitir cumplimiento. Coordine fecha y base con extracto del fondo o contador.
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
      </div>
    </fieldset>
    <fieldset id="payroll-variable-fieldset" class="form-section form-section-cyan full">
      <legend id="payroll-variable-legend">${IC.dollar} Pagos y deducciones variables</legend>
      <p class="full muted hidden" id="payroll-conductor-trip-hint" style="font-size:0.82rem;line-height:1.45;margin:0"></p>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.dollar, "Viáticos manuales (COP)")}<input type="number" name="travelAllowanceManual" value="0" min="0" /></label>
        <label>${fieldLabel(IC.dollar, "Reembolso combustible manual (COP)")}<input type="number" name="fuelReimbursementManual" value="0" min="0" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.clock, "Horas extras")}<input type="number" name="extras" value="0" min="0" /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.truck, "Auxilio transporte (COP)")}<input type="number" name="aux" value="${CO_HR_RULES.transportAllowance}" min="0" title="Se rellena con el subsidio registrado en la ficha del empleado; puede ajustarlo si aplica otro valor en el periodo." /></label>
        <label data-payroll-nomina-only="1">${fieldLabel(IC.award, "Bonificaciones (COP)")}<input type="number" name="bonus" value="0" min="0" /></label>
      </div>
    </fieldset>
    ${renderManagedCreateFormActions("create-payroll", `<button class="btn btn-primary" type="submit" id="payroll-submit-btn">${IC.dollar} Generar liquidación</button>`)}
  </form>`;
  const conductorTripPayOpts = conductorEmployees
    .map((e) => `<option value="${e.id}">${escapeHtml(e.name)} · ${escapeHtml(String(e.idDoc || ""))}</option>`)
    .join("");
  const formDriverTripPay = `<form id="form-driver-trip-payment" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.truck} Prestación de servicios — pago por viajes</legend>
      <p class="muted" style="font-size:0.85rem;line-height:1.45;margin:0 0 0.75rem">
        Liquida viáticos por viajes <strong>interdepartamentales</strong> completados en el mes y reembolsos de combustible registrados a nombre del conductor.
        No genera salario ni aportes de nómina. Los datos se guardan en <code>liquidaciones_nomina</code> con tipo <strong>prestacion_viajes</strong>.
      </p>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Conductor")}<select name="employeeId" required><option value="">Seleccione conductor</option>${conductorTripPayOpts}</select></label>
        <label>${fieldLabel(IC.calendar, "Mes de servicio")}<input type="month" name="month" required /></label>
        <label>${fieldLabel(IC.dollar, "Viáticos manuales (COP)")}<input type="number" name="travelAllowanceManual" value="0" min="0" /></label>
        <label>${fieldLabel(IC.dollar, "Reembolso combustible manual (COP)")}<input type="number" name="fuelReimbursementManual" value="0" min="0" /></label>
        <p class="full muted" style="margin:0;font-size:0.82rem">Tarifa interdepartamental vigente: <strong>$${parseNum(rules.interDepartmentTripAmount).toLocaleString("es-CO")}</strong> por viaje (tabla <code>reglas_viatico_interdepartamental</code>).</p>
      </div>
    </fieldset>
    ${renderManagedCreateFormActions("create-driver-trip-payment", `<button class="btn btn-primary" type="submit">${IC.truck} Liquidar viajes del mes</button>`)}
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
        <label>${fieldLabel(IC.calendar, "Mes de retiro (periodo)")}<input type="month" name="month" required /></label>
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
      <div class="form-section-grid">
        <label>${fieldLabel(IC.clock, "Días (año 360 — cesantías)")}<input type="number" name="days360Year" min="0" max="360" value="360" /></label>
        <label>${fieldLabel(IC.clock, "Días proporcional prima")}<input type="number" name="primaPropDays" min="0" max="360" value="0" /></label>
        <label>${fieldLabel(IC.calendar, "Días vacaciones a compensar (÷720)")}<input type="number" name="vacationDays" min="0" max="366" step="1" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Indemnización (COP)")}<input type="number" name="indemnization" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Otros conceptos (COP)")}<input type="number" name="otrosSettlement" min="0" value="0" /></label>
        <div class="full toolbar" style="justify-content:flex-start">
          <button type="button" class="btn btn-sm btn-outline" data-action="settlement-recalc">${IC.activity} Calcular rubros sugeridos</button>
        </div>
        <label>${fieldLabel(IC.dollar, "Cesantías (COP)")}<input type="number" name="cesantiasCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Intereses cesantías (COP)")}<input type="number" name="interesesCesantiasCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Prima proporcional (COP)")}<input type="number" name="primaPropCop" min="0" value="0" /></label>
        <label>${fieldLabel(IC.dollar, "Vacaciones (COP)")}<input type="number" name="vacacionesCop" min="0" value="0" /></label>
      </div>
    </fieldset>
    ${renderManagedCreateFormActions("create-payroll-settlement", `<button class="btn btn-primary" type="submit">${IC.save} Registrar liquidación contractual</button>`)}
  </form>`;
  const formAbsence = `<form id="form-hr-absence" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.calendar} Datos de la novedad</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Empleado")}<select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} · ${e.idDoc}</option>`).join("")}</select></label>
        <label>${fieldLabel(IC.activity, "Tipo de ausencia")}
          <select name="absenceType" required>${buildPayrollAbsenceTypeOptionsHtml("incapacidad_eps")}</select>
        </label>
        <label class="hidden" data-absence-subtype-wrap aria-hidden="true">${fieldLabel(IC.layers, "Subtipo")}
          <select name="absenceSubtype">${buildPayrollAbsenceSubtypeOptionsHtml("incapacidad_eps", "")}</select>
        </label>
        <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="startDate" required /></label>
        <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="endDate" required /></label>
        <label>${fieldLabel(IC.hash, "Días reconocidos")}<input type="number" name="recognizedDays" min="0.5" step="0.5" value="1" required /></label>
        <p class="full muted" data-absence-recognition-hint style="margin:0;font-size:0.82rem"></p>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.file} Soporte</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.hash, "No. soporte o radicado")}<input name="supportNumber" placeholder="Radicado, acta, certificado o soporte" /></label>
        <label class="full">${fieldLabel(IC.heart, "EPS / ARL / entidad")}<select name="epsEntity">${epsOptions}<option value="ARL">ARL</option><option value="Juzgado">Juzgado</option><option value="Registraduría">Registraduría</option><option value="Otra">Otra</option></select></label>
        <p class="full muted" data-absence-support-hint style="margin:0;font-size:0.82rem"></p>
        <label class="full">${fieldLabel(IC.file, "Observaciones")}<textarea name="notes" rows="2" placeholder="Detalle para archivo de personal"></textarea></label>
      </div>
    </fieldset>
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
      ${hrAdminDeletes ? `<div class="payroll-employee-toolbar-actions toolbar">
        <button type="button" id="employees-select-all" class="btn btn-sm btn-action">${IC.check} Seleccionar todo</button>
        <button type="button" id="employees-delete-selected" class="btn btn-sm btn-reject" title="Solo administradores">${IC.trash} Eliminar seleccionados</button>
      </div>` : ""}
    </div>`;
  const empTable = employeeCards
    ? `${employeeToolbar}<div class="employees-grid directory-grid payroll-employees-grid">${employeeCards}</div>`
    : emptyState("No hay empleados registrados.");
  const runCardsGrid = sortedRuns.length
    ? `<div class="payroll-run-cards-grid">${runsToRender.map((r) => renderPayrollRunCard(r, { compact: true })).join("")}</div>${payrollRunsMoreBar}`
    : emptyState("Sin liquidaciones que coincidan con los filtros.");
  const runTableLegacy = runRows
    ? `<details class="payroll-table-fallback"><summary class="btn btn-sm btn-outline">Ver como tabla</summary><div class="table-wrap payroll-table-wrap"><table><thead><tr><th>Mes</th><th>Tipo</th><th>Empleado</th><th>Devengado</th><th>Viáticos</th><th>Combustible</th><th>Deducciones</th><th>Neto</th><th>Estado</th><th></th></tr></thead><tbody>${runRows}</tbody></table></div>${payrollRunsMoreBar}</details>`
    : "";
  const runsPaneBody = `${runCardsGrid}${runTableLegacy}`;
  const employeeOpts = employees
    .map((e) => `<option value="${e.id}" ${filterEmployee === e.id ? "selected" : ""}>${e.name}</option>`)
    .join("");
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
        <option value="catorcenal" ${filterFrequency === "catorcenal" ? "selected" : ""}>Solo catorcenal</option>
        <option value="semanal" ${filterFrequency === "semanal" ? "selected" : ""}>Solo semanal</option>
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
  const payrollOperateNav = renderModuleWindowTabs({
    ariaLabel: "Flujos de Gestión humana",
    activeId: payrollOperateSection,
    action: "payroll-operate-section",
    valueAttr: "section",
    tabs: [
      { id: "employee", label: "Empleado" },
      { id: "payroll", label: "Nómina laboral" },
      { id: "driverPay", label: "Pagos conductores" },
      { id: "settlement", label: "Terminación" },
      { id: "absence", label: "Ausencia" }
    ]
  });
  const employeeOperatePane = `<div class="auth-tab-panel${payrollOperateSection === "employee" ? "" : " hidden"}" data-payroll-operate-pane="employee">${createCollapsibleProCard("create-employee", "userPlus", "Nuevo colaborador", "Expediente de vinculación con contrato Word y seguridad social (Colombia)", formEmp, "admin-users-data-card hr-form-card gh-form-card hr-form-card--xl", "Abrir expediente", { createPanels: state.createPanels })}</div>`;
  const payrollOperatePaneBody = `<div class="auth-tab-panel${payrollOperateSection === "payroll" ? "" : " hidden"}" data-payroll-operate-pane="payroll">${createCollapsibleProCard("create-payroll", "dollar", "Liquidación de nómina", "Relación laboral — devengos, deducciones y aportes parafiscales", `${payrollLiquidationModeNav}${formPayBulk}${formPay}`, "admin-users-data-card hr-form-card gh-form-card hr-form-card--lg hr-form-card--payroll-liquidation", "Abrir liquidación", { createPanels: state.createPanels })}</div>`;
  const driverPayOperatePane = `<div class="auth-tab-panel${payrollOperateSection === "driverPay" ? "" : " hidden"}" data-payroll-operate-pane="driverPay">${createCollapsibleProCard("create-driver-trip-payment", "truck", "Pago por viajes", "Prestación de servicios — viáticos interdepartamentales y combustible", formDriverTripPay, "admin-users-data-card hr-form-card gh-form-card hr-form-card--md", "Abrir liquidación", { createPanels: state.createPanels })}</div>`;
  const settlementOperatePane = `<div class="auth-tab-panel${payrollOperateSection === "settlement" ? "" : " hidden"}" data-payroll-operate-pane="settlement">${createCollapsibleProCard("create-payroll-settlement", "hash", "Liquidación final", "Terminación contractual — cesantías, prima y vacaciones (CST)", formPayrollSettlement, "admin-users-data-card hr-form-card gh-form-card hr-form-card--lg", "Abrir liquidación", { createPanels: state.createPanels })}</div>`;
  const absenceOperatePane = `<div class="auth-tab-panel${payrollOperateSection === "absence" ? "" : " hidden"}" data-payroll-operate-pane="absence">${createCollapsibleProCard("create-hr-absence", "calendar", "Ausencias e incapacidades", "Vacaciones, licencias, incapacidades y permisos remunerados", formAbsence, "admin-users-data-card hr-form-card gh-form-card hr-form-card--md", "Registrar ausencia", { createPanels: state.createPanels })}</div>`;
  const payrollExecutionBlock = `<section class="gh-operate payroll-operate-panel">
      <aside class="gh-operate__rail" aria-label="Flujos de registro">
        <span class="gh-operate__rail-label">Registrar</span>
        ${payrollOperateNav}
      </aside>
      <div class="gh-operate__main auth-tab-panels">${employeeOperatePane}${payrollOperatePaneBody}${driverPayOperatePane}${settlementOperatePane}${absenceOperatePane}</div>
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
    : emptyState("Sin liquidaciones de viajes. Vaya a Registrar → Pagos conductores para liquidar el mes.");
  const driverPaymentsPane = `<div class="payroll-data-pane${payrollDataSection === "driverPayments" ? "" : " hidden"}" data-payroll-section="driverPayments">
      ${pcardWrapPro(
        "truck",
        "Cuentas por pagar — conductores",
        "Prestación de servicios · liquidaciones_nomina (prestacion_viajes)",
        `${driverPaymentsSummary}${driverPaymentsCards}${
          driverRunRows
            ? `<details class="payroll-table-fallback"><summary class="btn btn-sm btn-outline">Ver como tabla</summary><div class="table-wrap payroll-table-wrap"><table><thead><tr><th>Periodo</th><th>Conductor</th><th>Viajes</th><th>Interdep.</th><th>Viáticos</th><th>Combustible</th><th>Neto</th><th>Estado</th><th></th></tr></thead><tbody>${driverRunRows}</tbody></table></div></details>`
            : ""
        }`,
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
      <div class="payroll-runs-toolbar">
        <p class="payroll-result-meta muted">Mostrando <strong>${runs.length}</strong> de ${nominaRunsAll.length} liquidación${nominaRunsAll.length === 1 ? "" : "es"} de nómina laboral</p>
        <button type="button" class="btn btn-sm btn-outline" id="export-payroll">${IC.download} Exportar CSV</button>
      </div>
      ${runsPaneBody}
    </div>`;
  const payrollDataBlock = `<section class="gh-data-panel payroll-data-panel">
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
  return `<section class="gh-studio payroll-shell payroll-shell--workspace hr-flow-shell" data-hr-workspace="${escapeAttr(payrollWorkspace)}">${payrollWorkspaceHeader}
      <div class="hr-workspace-panels">
        ${payrollOperatePanel}
        ${payrollDataPanel}
      </div>
    </section>`;
}

function bindPayrollPortalControls() {
  if (String(state.currentView || "") !== "payroll" || !nodes.viewRoot) return;


  nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='payroll']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.tab || "");
      if (!tab) return;
      const ws = normalizeHrWorkspace("payroll", tab);
      if (!HR_VALID_PAYROLL_WS.has(ws)) return;
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
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-operate-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizePayrollOperateSection(btn.dataset.section);
      state.payrollUi = { ...(state.payrollUi || {}), operateSection: section, workspace: "operate" };
      persistHrWorkspace("payroll", "operate");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='payroll-liquidation-mode']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = String(btn.dataset.mode || "single").toLowerCase() === "bulk" ? "bulk" : "single";
      state.payrollUi = { ...(state.payrollUi || {}), liquidationMode: mode, workspace: "operate", operateSection: "payroll" };
      persistHrWorkspace("payroll", "operate");
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

  nodes.viewRoot.querySelectorAll("[data-action='payroll-legal-set-year']").forEach((el) => {
    const applyYearSelection = (yearLike) => {
      const year = clampLaborSystemParameterYear(yearLike);
      state.payrollLegalUi = { ...(state.payrollLegalUi || {}), year: String(year) };
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

  const payrollLegalForm = nodes.viewRoot.querySelector("#form-payroll-legal-params");
  if (payrollLegalForm) {
    payrollLegalForm.setAttribute("data-antares-skip-validate", "1");
    wireFormSubmitGuard(payrollLegalForm, async () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify("Solo administradores pueden editar los parametros legales.", "error");
        return;
      }
      const fd = new FormData(payrollLegalForm);
      const year = clampLaborSystemParameterYear(fd.get("year"));
      const body = {
        year,
        smmlvCop: Math.max(1, parseNum(fd.get("smmlvCop"))),
        transportAllowanceCop: Math.max(0, parseNum(fd.get("transportAllowanceCop"))),
        healthEmployeeRate: Math.max(0, parseNum(fd.get("healthEmployeeRatePct")) / 100),
        pensionEmployeeRate: Math.max(0, parseNum(fd.get("pensionEmployeeRatePct")) / 100),
        uvtCop: String(fd.get("uvtCop") || "").trim() ? Math.max(0, parseNum(fd.get("uvtCop"))) : null,
        legalWeeklyHours: Math.max(1, parseNum(fd.get("legalWeeklyHours")) || CO_HR_RULES.legalWeeklyHours),
        platformReferenceYear:
          String(fd.get("platformReferenceMode") || "automatic") === "manual"
            ? clampLaborSystemParameterYear(fd.get("platformReferenceYear") || year)
            : null
      };
      const submit = async () => {
        try {
          const saved = await postPortalAuthorized("/portal/labor-system-parameters", body);
          applyLaborSystemParametersApiResponse(saved);
          state.payrollLegalUi = { ...(state.payrollLegalUi || {}), year: String(year) };
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
          notify(err?.message || "No se pudieron guardar los parametros legales.", "error");
        }
      };
      const affectedRuns = readArray(KEYS.payrollRuns).filter((run) => String(run.month || "").startsWith(`${year}`)).length;
      if (affectedRuns > 0) {
        openConfirmModal({
          title: `Actualizar vigencia ${year}`,
          message: `Este año ya tiene ${affectedRuns} liquidacion${affectedRuns === 1 ? "" : "es"} registradas. Confirme para actualizar las referencias legales sin borrar el historico.`,
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
        state.payrollLegalUi = { ...(state.payrollLegalUi || {}), year: String(fallbackYear) };
        state.payrollUi = { ...(state.payrollUi || {}), workspace: "data", dataSection: "legal" };
        persistHrWorkspace("payroll", "data");
        renderPortalView();
        notify(userMessage("payrollLegalVigenciaDeleted", year), "success");
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
    const employeeContractDraftLockButtons = [
      employeeForm.querySelector(".hr-form-wizard-submit"),
      employeeForm.querySelector("[data-hr-wizard-next]"),
      employeeForm.querySelector("[data-hr-wizard-prev]"),
      employeeForm.querySelector("[data-action='cancel-create-panel']"),
      employeeForm.querySelector("[data-action='toggle-create-panel']")
    ].filter(Boolean);
    employeeForm.querySelectorAll("[data-action='employee-form-generate-contract-draft']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await runWithBusyButton(
          btn,
          async () => {
            const raw = readFormEntriesNormalized(employeeForm);
            const docValidation = validateColombianDocument(raw.documentType, raw.idDoc);
            if (!docValidation.ok) {
              notify(docValidation.message, "error");
              return;
            }
            const packed = buildPayrollEmployeePayloadFromWizard(raw, docValidation.normalized, {
              avatarUrl: "",
              stripLargeAvatar: false
            });
            if (!packed.ok) {
              notify(packed.msg, "error");
              return;
            }
            const payload = packed.payload;
            const miss = validateEmployeeContractDocFields(payload);
            if (miss.length) {
              notify(userMessage("contractEmployeeMissingFields", miss.join(", ")), "error");
              return;
            }
            if (payload.workerRole === "conductor") {
              if (!payload.license || !payload.licenseCategory || !payload.licenseExpiry) {
                notify(userMessage("employeeDriverFieldsRequired"), "error");
                return;
              }
              if (new Date(payload.licenseExpiry).getTime() <= Date.now()) {
                notify(userMessage("payrollLicenseExpired"), "error");
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
          { busyText: "Generando…", lockExtraButtons: employeeContractDraftLockButtons }
        );
      });
    });
    wireFormSubmitGuard(employeeForm, async (event) => {
      const actor = currentUser();
      const raw = readFormEntriesNormalized(employeeForm);
      const docValidation = validateColombianDocument(raw.documentType, raw.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
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
          notify(packed.msg, "error");
          return;
        }
        const payload = packed.payload;
        if (actor?.role !== ROLES.ADMIN) {
          await queueApproval({
            type: "create_employee",
            title: `Creacion de empleado ${payload.name}`,
            payload,
            requestedByUserId: actor?.id || "",
            requestedByName: actor?.name || "Usuario"
          });
          notify(userMessage("employeeRequestQueued"), "info");
          collapseCreatePanel("create-employee");
          renderPortalView();
          return;
        }
        if (payload.workerRole === "conductor") {
          if (!payload.license || !payload.licenseCategory || !payload.licenseExpiry) {
            notify(userMessage("employeeDriverFieldsRequired"), "error");
            return;
          }
          if (new Date(payload.licenseExpiry).getTime() <= Date.now()) {
            notify(userMessage("payrollLicenseExpired"), "error");
            return;
          }
        }
        const newEmployeeId = newUuidV4();
        const createdEmployee = stampCreatedRecord({ id: newEmployeeId, ...payload });
        const all = read(KEYS.payrollEmployees, []);
        all.push(createdEmployee);
        try {
          await writeAwaitServer(KEYS.payrollEmployees, all, { notifyOnFailure: false });
        } catch (err) {
          const rolledBack = read(KEYS.payrollEmployees, []).filter(
            (row) => String(row.id) !== newEmployeeId
          );
          write(KEYS.payrollEmployees, rolledBack, { skipSyncSchedule: true });
          notify(userMessage("employeeSaveServerFail", err?.message), "error");
          return;
        }
        const propagate = await propagateEmployeeChanges(createdEmployee, {
          license: payload.license,
          licenseCategory: payload.licenseCategory,
          licenseExpiry: payload.licenseExpiry
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
    }, {
      busyText: "Guardando empleado…",
      submitButton: employeeForm.querySelector(".hr-form-wizard-submit"),
      lockExtraButtons: [
        employeeForm.querySelector("[data-hr-wizard-next]"),
        employeeForm.querySelector("[data-hr-wizard-prev]"),
        ...employeeForm.querySelectorAll("[data-action='employee-form-generate-contract-draft']"),
        employeeForm.querySelector("[data-action='cancel-create-panel']"),
        employeeForm.querySelector("[data-action='toggle-create-panel']")
      ].filter(Boolean),
      wireKey: "employeeSubmitGuardWired"
    });
  }

  const absenceForm = document.getElementById("form-hr-absence");
  if (absenceForm) {
    wireHrAbsenceFormBehavior(absenceForm);
    wireFormSubmitGuard(absenceForm, async (event) => {
      const actor = currentUser();
      const data = readFormEntriesNormalized(absenceForm);
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) {
        notify(userMessage("absencePickEmployee"), "error");
        return;
      }
      const start = new Date(`${data.startDate}T12:00:00`);
      const end = new Date(`${data.endDate}T12:00:00`);
      if (end.getTime() < start.getTime()) {
        notify(userMessage("absenceDateOrder"), "error");
        return;
      }
      const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
      const absenceType = payrollNormalizeAbsenceTypeKey(data.absenceType);
      const absenceSubtype = payrollNormalizeAbsenceSubtype(absenceType, data.absenceSubtype);
      const recognizedDays = Math.max(
        0.5,
        Number(
          parseNum(
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
        notify(legalValidation.message, "error");
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
        notes: normalizeLatinUpperForDb(data.notes || ""),
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
        await writeAwaitServer(KEYS.hrAbsences, list);
      } catch (err) {
        notify(String(err?.message || "No fue posible registrar la ausencia en el servidor."), "error");
        return;
      }
      const linkResult = await refreshPayrollDraftsLinked(employee.id, data.startDate, data.endDate, {
        notifyOnError: false
      });
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      collapseCreatePanel("create-hr-absence");
      notify(payrollDraftLinkSuccessMessage(linkResult), "success");
      renderPortalView();
    });
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
      const contractAction = `<button type="button" class="btn btn-action" data-action="employee-generate-contract" data-id="${escapeAttr(String(target.id || ""))}">${IC.download} Descargar contrato</button>`;
      openInfoModal({
        title: "Ficha del colaborador",
        subtitle: `${String(target.position || "Colaborador").trim()} · ${String(target.idDoc || "").trim()}`,
        bodyHtml: buildEmployeePayrollProfileBodyHtml(target),
        wide: true,
        secondaryActionsHtml: contractAction
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
          formEl.querySelector("input[name='phone']")?.setAttribute("pattern", "[0-9]{10,15}");
          formEl.querySelector("input[name='phone']")?.setAttribute("minlength", "10");
          formEl.querySelector("input[name='phone']")?.setAttribute("maxlength", "15");
          formEl.querySelector("input[name='phone']")?.setAttribute("inputmode", "tel");
          formEl.querySelector("input[name='emergencyPhone']")?.setAttribute("pattern", "[0-9]{10,15}");
          formEl.querySelector("input[name='emergencyPhone']")?.setAttribute("minlength", "10");
          formEl.querySelector("input[name='emergencyPhone']")?.setAttribute("maxlength", "15");
          formEl.querySelector("input[name='emergencyPhone']")?.setAttribute("inputmode", "tel");
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
          const docValidation = validateColombianDocument(payload.documentType, payload.idDoc);
          if (!docValidation.ok) {
            notify(docValidation.message, "error");
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
            stripLargeAvatar: false
          });
          if (!packed.ok) {
            notify(packed.msg, "error");
            return false;
          }
          const nextPayload = packed.payload;
          if (nextPayload.workerRole === "conductor") {
            if (!nextPayload.license || !nextPayload.licenseCategory || !nextPayload.licenseExpiry) {
              notify(userMessage("employeeDriverFieldsRequired"), "error");
              return false;
            }
            if (new Date(nextPayload.licenseExpiry).getTime() <= Date.now()) {
              notify(userMessage("payrollLicenseExpired"), "error");
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
          try {
            await writeAwaitServer(KEYS.payrollEmployees, nextEmployees);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el empleado en el servidor."), "error");
            return false;
          }
          scheduleContractRenewalNotificationCheck();
          const refreshed = read(KEYS.payrollEmployees, []).find((empRow) => String(empRow.id) === String(target.id));
          if (refreshed) {
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
            notify(userMessage("employeeUpdatedDriverSynced"), "success");
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

  nodes.viewRoot.querySelectorAll("[data-action='delete-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      openConfirmModal({
        title: "Eliminar empleado",
        message: "El empleado sera removido en cascada (nomina, ausencias, contratos y conductor relacionado).",
        confirmText: "Eliminar",
        onConfirm: async () => {
          const empId = String(btn.dataset.id || "");
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
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
          notify(userMessage("employeeDeletedCascade"), "success");
          renderPortalView();
        }
      });
    });
  });

  wirePayrollEmployeeDirectoryFilters();

  const employeesSelectAll = document.getElementById("employees-select-all");
  if (employeesSelectAll) {
    employeesSelectAll.addEventListener("click", (event) => {
      event.preventDefault();
      const checks = [
        ...nodes.viewRoot.querySelectorAll(".directory-card--employee [data-employee-select]"),
        ...nodes.viewRoot.querySelectorAll("[data-employee-select]")
      ];
      const allSelected = checks.length > 0 && checks.every((check) => check.checked);
      checks.forEach((check) => {
        check.checked = !allSelected;
      });
    });
  }

  const employeesDeleteSelected = document.getElementById("employees-delete-selected");
  if (employeesDeleteSelected) {
    employeesDeleteSelected.addEventListener("click", (event) => {
      event.preventDefault();
      if (!isAdminActor()) {
        notify(userMessage("adminOnlyModule"), "error");
        return;
      }
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
        message: `Se eliminaran ${selectedIds.length} empleados en cascada (nomina, ausencias, contratos y conductores asociados).`,
        confirmText: "Eliminar seleccionados",
        onConfirm: async () => {
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
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
          notify(userMessage("employeesBulkRemoved", selectedIds.length), "success");
          renderPortalView();
        }
      });
    });
  }

  const payrollBulkBtn = document.getElementById("payroll-bulk-generate");
  if (payrollBulkBtn) {
    payrollBulkBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      const actor = currentUser();
      if (!actor || ![ROLES.ADMIN, ROLES.RRHH].includes(actor.role)) {
        notify("Solo administradores o recursos humanos pueden ejecutar liquidación masiva.", "error");
        return;
      }
      const fechaEl = document.getElementById("payroll-bulk-fecha");
      const forceEl = document.getElementById("payroll-bulk-force");
      const fechaReferencia = readFormDateIso(document, "payroll-bulk-fecha") || readFormDateIso(document, "fechaReferencia");
      if (!fechaReferencia) {
        notify("Indique una fecha de cierre válida (DD/MM/AAAA).", "error");
        return;
      }
      const force = Boolean(forceEl?.checked);
      const busyLabel = payrollBulkBtn.querySelector("span");
      const busyOrig = busyLabel?.textContent || "";
      payrollBulkBtn.disabled = true;
      payrollBulkBtn.setAttribute("aria-busy", "true");
      if (busyLabel) busyLabel.textContent = "Generando…";
      try {
        const result = await postPortalAuthorized("/payroll/autogenerate-period", {
          fechaReferencia,
          force,
          origin: "masiva"
        });
        if (result && typeof result === "object") {
          await applyPortalBootstrapFromApi();
          presentPayrollBulkAutogenResult(result);
          state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data", dataSection: "runs" };
          persistHrWorkspace("payroll", "data");
          renderPortalView();
        }
      } catch (err) {
        notify(String(err?.message || "No fue posible ejecutar la liquidación masiva."), "error");
      } finally {
        payrollBulkBtn.disabled = false;
        payrollBulkBtn.removeAttribute("aria-busy");
        if (busyLabel) busyLabel.textContent = busyOrig || "Generar liquidaciones";
      }
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
        notify(userMessage("contractPickEmployee"), "error");
        return;
      }
      if (!monthRange(data.month)) {
        notify(userMessage("payrollSelectMonth"), "error");
        return;
      }

      if (employeeIsConductorServiceProvider(employee)) {
        notify(userMessage("payrollConductorUseDriverForm"), "error");
        return;
      }

      const payFreqNorm = normalizePayrollFrequencyJs(employee.payFrequency);
      const periodKey = buildPayrollPeriodKeyFromForm(data.month, employee.payFrequency, data.payrollQuincena);
      const payrollKind = payFreqNorm === "mensual" ? "mensual" : payFreqNorm;
      const diasCorte = payrollDaysInManualCut(data.month, employee.payFrequency, data.payrollQuincena);
      const payPrima = Boolean(data.payPrimaServicios) && payFreqNorm === "mensual";
      if (payPrima && !payrollMonthIsPrimaSemester(data.month)) {
        notify("La prima de servicios solo se parametriza cuando el mes liquidado es junio (06) o diciembre (12).", "error");
        return;
      }
      const payInteresesCesantias = Boolean(data.payInteresesCesantias);
      if (payInteresesCesantias && !payrollMonthIsCesantiasInterestMonth(data.month)) {
        notify(
          "Los intereses sobre cesantías (Ley 52/1975) solo se parametrizan cuando el mes liquidado es enero (01) o febrero (02), períodos donde suele consignarse o pagarse ese concepto cercano al cierre legal de enero. Ajuste con su contador.",
          "error"
        );
        return;
      }
      const primaDaysRounded = Math.floor(parseNum(data.primaServiciosDays));
      let primaServiciosCop = payPrima ? Math.max(0, parseNum(data.primaServiciosCop)) : 0;
      if (payPrima && (!Number.isFinite(primaDaysRounded) || primaDaysRounded < 1)) {
        notify("Indique los días laborados en el semestre para calcular o validar la prima de servicios.", "error");
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
        notify("Indique la base en pesos de las cesantías (p. ej. consignaciones del año anterior) para calcular o registrar los intereses.", "error");
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
      const monthlyDriver = linkedDriver ? calculateDriverTripReport(linkedDriver.id, data.month) : null;
      let autoTravelAllowance = monthlyDriver ? monthlyDriver.viaticTotal : 0;
      let autoFuelReimbursement = linkedDriver
        ? readFuelLogs()
            .filter((log) => String(log.driverId || "") === String(linkedDriver.id) && String(log.paidBy || "empresa") === "conductor" && dateInRange(log.date, monthRange(data.month)))
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
        liquidacionMonthYm: data.month,
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
          periodStart: monthRange(data.month)?.start,
          periodEnd: monthRange(data.month)?.end,
          absencesAll: payrollAbsencesAll
        })
      };
      const run = {
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
        createdAt: nowIso(),
        payrollKind,
        payPrimaServicios: payPrima,
        primaServiciosDays: payPrima ? primaDaysRounded : null,
        primaServiciosCop: payPrima ? primaServiciosCop : 0,
        payInteresesCesantias,
        interesesCesantiasCop: payInteresesCesantias ? interesesCesantiasCop : 0,
        cesantiasInterestBaseCop: payInteresesCesantias ? cesantiasInterestBaseCop : null,
        cesantiasInterestDays: payInteresesCesantias ? cesantiasInterestDays : null,
        settlementDetail: null
      };
      const runs = read(KEYS.payrollRuns, []);
      if (payrollRunAlreadyExists(runs, employee.id, periodKey, payrollKind)) {
        notify(
          `Ya existe una liquidación (${payrollRunTypeLabel({ payrollKind, month: periodKey })}) para este empleado y periodo.`,
          "error"
        );
        return;
      }
      runs.unshift(run);
      try {
        await writeAwaitServer(KEYS.payrollRuns, runs);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la nómina en el servidor."), "error");
        return;
      }
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      collapseCreatePanel("create-payroll");
      notify(userMessage("payrollSaved"), "success");
      renderPortalView();
    });
  }

  const driverTripPayForm = document.getElementById("form-driver-trip-payment");
  if (driverTripPayForm) {
    wireFormSubmitGuard(driverTripPayForm, async () => {
      const data = readFormEntriesNormalized(driverTripPayForm);
      const employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(data.employeeId || ""));
      if (!employee) {
        notify(userMessage("contractPickEmployee"), "error");
        return;
      }
      if (!employeeIsConductorServiceProvider(employee)) {
        notify("Seleccione un colaborador configurado como conductor en prestación de servicios.", "error");
        return;
      }
      const periodYm = String(data.month || "").trim().slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(periodYm)) {
        notify(userMessage("payrollSelectMonth"), "error");
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
    });
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
        notify(userMessage("contractPickEmployee"), "error");
        return;
      }
      if (employeeIsConductorServiceProvider(employee)) {
        notify(
          "La liquidación contractual de terminación no aplica a conductores en prestación de servicios. Liquide viajes pendientes y cierre el contrato según su abogado laboral.",
          "error"
        );
        return;
      }
      if (!monthRange(data.month)) {
        notify(userMessage("payrollSelectMonth"), "error");
        return;
      }
      const termDate = String(data.terminationDate || "").trim();
      if (!termDate) {
        notify("Seleccione la fecha de terminación del contrato.", "error");
        return;
      }
      const employeeStartDate = String(normalizePortalDateYmd(employee.startDate) || "").trim();
      if (employeeStartDate && termDate < employeeStartDate) {
        notify("La fecha de terminación no puede ser anterior al ingreso del colaborador.", "error");
        return;
      }
      if (String(data.month || "").trim() && String(termDate).slice(0, 7) !== String(data.month).trim()) {
        notify("La fecha de terminación debe corresponder al mes liquidado.", "error");
        return;
      }
      const cesantias = Math.max(0, parseNum(data.cesantiasCop));
      const interesesCesantias = Math.max(0, parseNum(data.interesesCesantiasCop));
      const primaProp = Math.max(0, parseNum(data.primaPropCop));
      const vacaciones = Math.max(0, parseNum(data.vacacionesCop));
      const indemnization = Math.max(0, parseNum(data.indemnization));
      const otrosSettlement = Math.max(0, parseNum(data.otrosSettlement));
      const gross =
        cesantias + interesesCesantias + primaProp + vacaciones + indemnization + otrosSettlement;
      if (gross <= 0) {
        notify("Ingrese valores en los rubros de liquidación; el total debe ser mayor que cero.", "error");
        return;
      }
      const settlementDetail = {
        terminationDate: termDate,
        terminationCause: String(data.terminationCause || ""),
        cesantias,
        interesesCesantias,
        primaProporcional: primaProp,
        vacaciones,
        indemnization,
        otrosSettlement,
        referenceDays360: parseNum(data.days360Year),
        primaPropDaysReference: parseNum(data.primaPropDays),
        vacationDaysReference: parseNum(data.vacationDays),
        legalDisclaimer:
          "Cálculos orientativos conforme prácticas usuales CST y normativa colombiana sobre cesantías, intereses proporcionales, prima y vacaciones. No sustituye asesoría legal ni contable."
      };
      const run = {
        id: newUuidV4(),
        employeeId: employee.id,
        employeeName: employee.name,
        month: data.month,
        gross,
        ibc: 0,
        travelAllowance: 0,
        fuelReimbursement: 0,
        travelAllowanceAuto: 0,
        fuelReimbursementAuto: 0,
        travelAllowanceManual: 0,
        fuelReimbursementManual: 0,
        extras: 0,
        aux: 0,
        bonus: 0,
        tripCount: 0,
        interDepartmentTrips: 0,
        health: 0,
        pension: 0,
        solidarity: 0,
        deductions: 0,
        net: gross,
        paid: false,
        createdAt: nowIso(),
        payrollKind: "terminacion",
        payPrimaServicios: false,
        primaServiciosDays: null,
        primaServiciosCop: 0,
        payInteresesCesantias: false,
        interesesCesantiasCop: 0,
        cesantiasInterestBaseCop: null,
        cesantiasInterestDays: null,
        settlementDetail
      };
      const runs = read(KEYS.payrollRuns, []);
      if (payrollRunAlreadyExists(runs, employee.id, data.month, "terminacion")) {
        notify("Ya existe una liquidación de terminación para este empleado y periodo.", "error");
        return;
      }
      runs.unshift(run);
      try {
        await writeAwaitServer(KEYS.payrollRuns, runs);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la liquidación en el servidor."), "error");
        return;
      }
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      collapseCreatePanel("create-payroll-settlement");
      notify("Liquidación contractual registrada. Revise montos antes de marcar pagado.", "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='payslip']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      let run = read(KEYS.payrollRuns, []).find((r) => r.id === btn.dataset.id);
      if (!run) return;
      if (portalCanRefreshFromApi()) {
        const hydrated = await ensurePayrollRunHeavyJsonLoaded(String(btn.dataset.id || ""));
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
        const c = parseNum(sd.cesantias);
        const ic = parseNum(sd.interesesCesantias);
        const pp = parseNum(sd.primaProporcional);
        const vac = parseNum(sd.vacaciones);
        const ind = parseNum(sd.indemnization);
        const otros = parseNum(sd.otrosSettlement);
        const devRows =
          `<tr><td style="${cL}"><strong>Cesantías definitivas / saldo a favor (referencia CST)</strong></td><td style="${cR}"><strong>${fmtPay(c)}</strong></td></tr>` +
          `<tr><td style="${cL}">Intereses moratorios sobre cesantías (${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual — Ley 52/1975, orientativo)</td><td style="${cR}">${fmtPay(ic)}</td></tr>` +
          `<tr><td style="${cL}">Prima de servicios proporcional (CST)</td><td style="${cR}">${fmtPay(pp)}</td></tr>` +
          `<tr><td style="${cL}">Indemnización compensatoria de vacaciones u holgura (÷720 referencia)</td><td style="${cR}">${fmtPay(vac)}</td></tr>` +
          (ind > 0
            ? `<tr><td style="${cL}">Indemnización sustitutiva u otros (orden judicial / pacto)</td><td style="${cR}">${fmtPay(ind)}</td></tr>`
            : "") +
          (otros > 0
            ? `<tr><td style="${cL}">Otros conceptos de finiquito</td><td style="${cR}">${fmtPay(otros)}</td></tr>`
            : "") +
          `<tr><td style="${cL}"><strong>Total devengos liquidación</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;

        const ded = parseNum(run.deductions);
        const dedRows =
          ded > 0
            ? `<tr><td style="${cL}">Retenciones y aportes asociados (detalle en nómina extraordinaria)</td><td style="${cR}">${fmtPay(ded)}</td></tr>`
            : `<tr><td colspan="2" style="padding:8px;color:#495057;font-size:0.88rem">Sin deducciones registradas en esta liquidación. Informe retención en la fuente, embargos u obligaciones con su contador.</td></tr>`;

        payslipBodyBlocks = `
          <h2 style="font-size:1rem;margin:1.25rem 0 0.35rem">I. Devengos (finiquito / liquidación)</h2>
          <p style="margin:0 0 0.5rem;font-size:0.86rem;color:#495057">Ítems típicos por terminación conforme ordenamiento laboral colombiano (valores editables en el registro del sistema).</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${devRows}</tbody></table>
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">II. Deducciones</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${dedRows}</tbody></table>
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
          devRowsMes += `<tr><td style="${cL}"><strong>Total devengos del periodo</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;
        } else {
          const ex = parseNum(run.extras);
          const au = parseNum(run.aux);
          const bo = parseNum(run.bonus);
          const via = parseNum(run.travelAllowance);
          const comb = parseNum(run.fuelReimbursement);
          const prima = parseNum(run.primaServiciosCop);
          const intCe = parseNum(run.interesesCesantiasCop);
          const salarioBasicoDevengo = Math.max(
            0,
            parseNum(run.gross) - ex - au - bo - via - comb - prima - intCe
          );
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
            `<tr><td style="${cL}"><strong>Total devengos del periodo</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;
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
          ? `Liquidacion contractual ${run.employeeName}`
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
          disclaimerPieces.push(
            "Prima de servicios (CST): cálculo orientativo; validar política empresarial y contador."
          );
        if (parseNum(run.interesesCesantiasCop) > 0)
          disclaimerPieces.push(
            `Intereses de cesantías (Ley 52/1975, ${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual): el texto legal establece que deben pagarse al trabajador en enero del año siguiente al período causado (y reglas especiales en retiros o ceses antes de ese cierre). Lo habitual es liquidarlos con la nómina de enero del año siguiente o, si su política lo retrasa hasta febrero, documente ese desfase con contador para no omitir obligaciones ya exigidas.`
          );
        const incNv = run.noveltiesDetail?.incapacity;
        if (incNv && Array.isArray(incNv.episodes) && incNv.episodes.length) {
          disclaimerPieces.push(
            String(
              incNv.legalNote ||
                "Incapacidad: montos orientativos en este comprobante; valide con EPS/ARL y contador."
            )
          );
        }
      }
      const disclaimer =
        isTerm &&
        run.settlementDetail &&
        typeof run.settlementDetail === "object" &&
        run.settlementDetail.legalDisclaimer
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
            ${employeeMetaRows}
            ${metaExtra}
            <tr><td style="padding:4px 0"><strong>Estado</strong></td><td>${run.paid ? "Pagado" : "Pendiente de pago"}</td></tr>
            <tr><td style="padding:4px 0"><strong>Fecha de pago</strong></td><td>${escapeHtml(String(paidAtLabel))}</td></tr>
          </table>
          <h2 style="font-size:1rem;margin:1.05rem 0 0">Comprobante de pago</h2>
          ${payslipBodyBlocks}
          ${absenceDetailBlock}
          ${disclaimer}
          <p style="margin-top:1.5rem"><button onclick="window.print()" style="padding:10px 18px;border-radius:8px;border:none;background:#0B1D33;color:#fff;cursor:pointer">Imprimir / PDF</button></p>
        </body></html>
      `);
      pop.document.close();
    });
  });


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
            title: `Aprobar pago de nomina ${run.employeeName} (${run.month})`,
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
        title: "Confirmar pago de nomina",
        message: `Marcar como pagada la liquidacion de ${run.employeeName} (${run.month}) por ${parseNum(run.net).toLocaleString("es-CO")} COP neto.`,
        confirmText: "Marcar pagado",
        onConfirm: async () => {
          try {
            await writeAwaitServer(
              KEYS.payrollRuns,
              all.map((item) => (item.id === id ? { ...item, paid: true, paidAt: nowIso() } : item))
            );
          } catch (err) {
            notify(String(err?.message || "No fue posible marcar el pago en el servidor."), "error");
            return;
          }
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
            moduleId: "hr_absences",
            moduleLabel: "Ausencias",
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
        title: "Eliminar liquidacion",
        message: run
          ? `Eliminar el registro de liquidacion (${run.month} · ${run.employeeName}). Indique la justificación. Solo administradores; no hay deshacer automatico si ya se sincrono con servidor.`
          : "Eliminar este registro de liquidacion.",
        confirmText: "Eliminar liquidacion",
        onConfirm: async (motivo) => {
          const ok = await removeFromPortalListAwaitServer(KEYS.payrollRuns, id);
          if (!ok) return;
          appendModuleAuditLog({
            action: "delete",
            moduleId: "payroll",
            moduleLabel: "Nómina laboral",
            entityId: id,
            entityLabel: run
              ? `${String(run.employeeName || "Colaborador")} · ${String(run.month || "-")}`
              : "Liquidación",
            summary: run
              ? `Liquidación eliminada (${String(run.month || "-")} · ${String(run.employeeName || "Colaborador")}). Motivo: ${String(motivo || "").trim()}`
              : `Liquidación eliminada. Motivo: ${String(motivo || "").trim()}`,
            actor: String(currentUser()?.email || currentUser()?.name || "—").trim()
          });
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
          if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
            notify("Fechas inválidas.", "error");
            return false;
          }
          if (end.getTime() < start.getTime()) {
            notify(userMessage("absenceDateOrder"), "error");
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
            notify(legalValidation.message, "error");
            return false;
          }
          const nextList = all.map((a) =>
            String(a.id) !== String(target.id)
              ? a
              : {
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
                }
          );
          try {
            await writeAwaitServer(KEYS.hrAbsences, nextList);
          } catch (err) {
            notify(String(err?.message || "No fue posible actualizar la ausencia en el servidor."), "error");
            return false;
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


(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ payrollHtml });
})();

(function registerPayrollPortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.payroll = bindPayrollPortalControls;
})();
