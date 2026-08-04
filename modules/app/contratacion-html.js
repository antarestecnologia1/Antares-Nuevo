/**
 * Contratación — HTML de la vista (hiringHtml).
 */

/** Nombre legible: conserva el texto completo; si viene en MAYÚSCULAS, lo muestra en formato título. */
function hiringDisplayPersonName(raw) {
  const s = String(raw || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "Sin nombre";
  const letters = s.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  if (letters && letters === letters.toUpperCase()) {
    return s
      .toLocaleLowerCase("es-CO")
      .replace(/(^|[\s\-'])(\S)/g, (_, sep, ch) => sep + ch.toLocaleUpperCase("es-CO"));
  }
  return s;
}

/** Resuelve el nombre a mostrar del candidato (completo, sin truncar). */
function hiringCandidateDisplayName(candidate) {
  const primary = hiringDisplayPersonName(
    candidate?.name || candidate?.fullName || candidate?.nombre_completo || ""
  );
  const tokens = primary === "Sin nombre" ? [] : primary.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) return primary;
  if (typeof findPayrollEmployeeByIdDoc === "function" && candidate?.idDoc) {
    const emp = findPayrollEmployeeByIdDoc(candidate.idDoc);
    const fromEmp = hiringDisplayPersonName(emp?.name || emp?.fullName || emp?.nombre_completo || "");
    if (fromEmp !== "Sin nombre" && fromEmp.split(/\s+/).filter(Boolean).length > tokens.length) {
      return fromEmp;
    }
  }
  return primary;
}

function hiringPersonInitialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function hiringCandidateCvLabel(candidate) {
  const attachments = typeof flattenCandidateAttachmentsForCv === "function"
    ? flattenCandidateAttachmentsForCv(candidate?.attachments)
    : Array.isArray(candidate?.attachments)
      ? candidate.attachments
      : [];
  for (const item of attachments) {
    if (typeof item === "string" && item.trim()) return item.trim();
    if (item && typeof item === "object" && String(item.name || "").trim()) return String(item.name).trim();
  }
  return "Hoja de vida";
}

/**
 * Entrevistadores habilitados: personal de oficina (empleados de nómina cuyo rol
 * no es conductor) y usuarios del portal con rol administrativo, para cubrir a
 * quien entrevista sin estar en nómina. Los conductores quedan fuera del listado.
 */
function hiringOfficeInterviewerPeople() {
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const officeRoles = new Set([
    "admin",
    "rrhh",
    "administracion",
    "auxiliar_administrativo",
    "lider_administrativo",
    "logistica"
  ]);
  const seen = new Set();
  const staff = [];
  read(KEYS.payrollEmployees, []).forEach((employee) => {
    if (!employee || employee.active === false) return;
    const role = clean(employee.workerRole).toLowerCase();
    const position = clean(employee.position);
    if (role === "conductor" || position.toLowerCase().includes("conductor")) return;
    const name = clean(employee.name);
    if (!name || seen.has(name.toLowerCase())) return;
    seen.add(name.toLowerCase());
    staff.push({ name, detail: position || "Personal de oficina" });
  });
  const users = [];
  read(KEYS.users, []).forEach((user) => {
    if (!user) return;
    const role = clean(user.role).toLowerCase();
    if (!officeRoles.has(role)) return;
    const accountStatus = clean(user.accountStatus).toLowerCase();
    if (accountStatus && accountStatus !== "aprobado") return;
    const name = clean(user.name);
    if (!name || seen.has(name.toLowerCase())) return;
    seen.add(name.toLowerCase());
    users.push({ name, detail: formatPortalRoleLabel(role) });
  });
  const byName = (a, b) => a.name.localeCompare(b.name, "es");
  return { staff: staff.sort(byName), users: users.sort(byName) };
}

/** Opciones (`<optgroup>`) del selector de entrevistador del formulario de entrevista. */
function hiringInterviewerPickerOptionsHtml() {
  const { staff, users } = hiringOfficeInterviewerPeople();
  const optionHtml = (person) => {
    const detail = person.detail ? ` · ${escapeHtml(person.detail)}` : "";
    return `<option value="${escapeAttr(person.name)}">${escapeHtml(person.name)}${detail}</option>`;
  };
  const groupHtml = (label, list) =>
    list.length ? `<optgroup label="${escapeAttr(label)}">${list.map(optionHtml).join("")}</optgroup>` : "";
  const staffHtml = groupHtml("Personal de oficina (nómina)", staff);
  const usersHtml = groupHtml("Usuarios administrativos del portal", users);
  return `<option value="">Seleccione…</option>${staffHtml}${usersHtml}<option value="__other__">Otro · entrevistador externo</option>`;
}

/** Misma lista para `openEditModal`, que no admite `<optgroup>`: separadores deshabilitados. */
function hiringInterviewerPickerOptionList() {
  const { staff, users } = hiringOfficeInterviewerPeople();
  const options = [{ value: "", label: "Seleccione…" }];
  const pushGroup = (label, list, groupKey) => {
    if (!list.length) return;
    options.push({ value: `__group_${groupKey}__`, label: `— ${label} —`, disabled: true });
    list.forEach((person) => {
      options.push({ value: person.name, label: person.detail ? `${person.name} · ${person.detail}` : person.name });
    });
  };
  pushGroup("Personal de oficina (nómina)", staff, "staff");
  pushGroup("Usuarios administrativos del portal", users, "users");
  options.push({ value: "__other__", label: "Otro · entrevistador externo" });
  return options;
}

function hiringHtml() {
  const vacancies = read(KEYS.vacancies, []);
  const vacanciesOpenForApply = vacancies.filter(isVacancyAcceptingApplications);
  const candidates = read(KEYS.candidates, []);
  const positions = read(KEYS.positions, []);
  const activePositions = positions.filter((p) => p.active !== false);
  const interviews = read(KEYS.interviews, []);
  const contracts = read(KEYS.contracts, []);
  const employees = read(KEYS.payrollEmployees, []);
  const candidatesForInterviewSelect = candidates.filter((c) =>
    !["Contratado", "Descartado"].includes(String(c.status || ""))
  );
  const positionOptions = activePositions
    .map((p) => `<option value="${escapeAttr(String(p.id))}">${escapeHtml(String(p.name || ""))}</option>`)
    .join("");
  const today = new Date();
  const openVacancies = vacancies.filter((v) => v.status === "Publicada");
  const activeCandidates = candidates.filter((c) => !["Contratado", "Descartado"].includes(c.status));
  const hiringUi = state.hiringUi || {
    candidateFilter: "active",
    vacancyFilter: "open",
    candidateSort: "recent",
    candidateView: "board",
    pipelineStage: "",
    workspace: "data"
  };
  const candidateFilter = String(hiringUi.candidateFilter || "active");
  const vacancyFilter = String(hiringUi.vacancyFilter || "open");
  const candidateSort = String(hiringUi.candidateSort || "recent");
  const candidateView = String(hiringUi.candidateView || "board") === "list" ? "list" : "board";
  const pipelineStageFilter = String(hiringUi.pipelineStage || "").trim();
  const vacancyIdFilter = String(hiringUi.vacancyIdFilter || "").trim();
  const boardExpand = hiringUi.boardExpand && typeof hiringUi.boardExpand === "object" ? hiringUi.boardExpand : {};
  const drawerOpen = hiringUi.drawerOpen !== false;
  const drawerTab = ["resumen", "timeline", "documentos", "notas", "evaluaciones"].includes(String(hiringUi.drawerTab || ""))
    ? String(hiringUi.drawerTab)
    : "resumen";
  const hiringWorkspace = normalizeHrWorkspace("hiring", hiringUi.workspace);
  const hiringOperateSection = normalizeHiringOperateSection(hiringUi.operateSection);
  const hiringDataSection = normalizeHiringDataSection(hiringUi.dataSection);
  const hiringCreateUi = buildHiringCreatePanelsState(hiringOperateSection, state.createPanels || {});
  const dataListSearchRaw = String(hiringUi.dataListSearch || "");
  const dataListSearch = dataListSearchRaw.trim().toLowerCase();
  const hiringDataMatches = (blob) => !dataListSearch || String(blob || "").toLowerCase().includes(dataListSearch);
  const shortcutHint = /Mac|iPhone|iPad/i.test(String(navigator?.platform || navigator?.userAgent || "")) ? "⌘ K" : "Ctrl K";
  const contractsThisMonth = contracts.filter((c) => {
    const d = new Date(c.createdAt || "");
    return Number.isFinite(d.getTime()) && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  const soonClosingVacancies = openVacancies.filter((v) => {
    if (!v.deadline) return false;
    const days = Math.ceil((new Date(`${v.deadline}T12:00:00`).getTime() - today.getTime()) / 86400000);
    return days >= 0 && days <= 7;
  });
  const contractsEndingSoon = contracts.filter((c) => {
    if (!c.endDate) return false;
    const days = Math.ceil((new Date(`${c.endDate}T12:00:00`).getTime() - today.getTime()) / 86400000);
    return days >= 0 && days <= 30;
  });

  const positionCanEdit = canManageHiringModule();
  const positionCanDelete = isAdminActor();
  const positionFilter = String(hiringUi.positionFilter || "active");
  const positionRoleFilter = String(hiringUi.positionRoleFilter || "all");
  const positionsScoped = positions.filter((p) => {
    const active = p.active !== false;
    if (positionFilter === "active" && !active) return false;
    if (positionFilter === "inactive" && active) return false;
    const role = String(p.workerRole || "empleado").toLowerCase();
    if (positionRoleFilter === "conductor" && role !== "conductor") return false;
    if (positionRoleFilter === "empleado" && role === "conductor") return false;
    return true;
  });
  const positionsView = dataListSearch
    ? positionsScoped.filter((p) =>
        hiringDataMatches(
          `${p.name} ${p.workerRole} ${p.contractTypeDefault} ${p.legalBasis} ${parseNum(p.baseSalary)}`
        )
      )
    : positionsScoped;
  const filteredVacancies = vacancies.filter((v) => (vacancyFilter === "open" ? v.status === "Publicada" : true));
  const filteredVacanciesView = dataListSearch
    ? filteredVacancies.filter((v) =>
        hiringDataMatches(
          `${v.title} ${v.positionName} ${v.city} ${v.modality} ${v.status} ${v.deadline} ${parseNum(v.salaryOffer)}`
        )
      )
    : filteredVacancies;
  const vacancyCanEdit = canManageHiringModule();
  const vacancyCanDelete = isAdminActor();
  const filteredCandidates = candidates.filter((c) => {
    if (candidateFilter === "active") return !["Contratado", "Descartado"].includes(String(c.status || ""));
    if (candidateFilter === "finalized") return ["Contratado", "Descartado"].includes(String(c.status || ""));
    return true;
  });
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (candidateSort === "pipeline") return PIPELINE.indexOf(String(a.status || PIPELINE[0])) - PIPELINE.indexOf(String(b.status || PIPELINE[0]));
    if (candidateSort === "experience") return parseNum(b.experienceYears || 0) - parseNum(a.experienceYears || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
  const sortedCandidatesSearched = dataListSearch
    ? sortedCandidates.filter((c) =>
        hiringDataMatches(
          `${c.name} ${c.email} ${c.phone} ${c.vacancyTitle} ${c.status} ${c.idDoc} ${c.city} ${c.address} ${c.source}`
        )
      )
    : sortedCandidates;
  const sortedCandidatesByVacancy = vacancyIdFilter
    ? sortedCandidatesSearched.filter((c) => String(c.vacancyId || "") === vacancyIdFilter)
    : sortedCandidatesSearched;
  const sortedCandidatesView = pipelineStageFilter
    ? sortedCandidatesByVacancy.filter((c) => String(c.status || PIPELINE[0]) === pipelineStageFilter)
    : sortedCandidatesByVacancy;
  const pipelineStageCounts = PIPELINE.reduce((acc, stage) => {
    acc[stage] = sortedCandidatesByVacancy.filter((c) => String(c.status || PIPELINE[0]) === stage).length;
    return acc;
  }, {});
  const hiringCanEdit = canManageHiringModule();
  const hiringCanDelete = isAdminActor();
  const selectedCandidateIdRaw = String(hiringUi.selectedCandidateId || "").trim();
  const selectedCandidate =
    sortedCandidatesView.find((c) => String(c.id) === selectedCandidateIdRaw) ||
    (drawerOpen || candidateView === "list" ? sortedCandidatesView[0] || null : null);
  const selectedCandidateId = selectedCandidate ? String(selectedCandidate.id) : "";
  const candBoard =
    typeof renderHiringPipelineBoard === "function"
      ? renderHiringPipelineBoard(sortedCandidatesView, {
          canEdit: hiringCanEdit,
          canDelete: hiringCanDelete,
          canScheduleInterview: true,
          hideTerminal: candidateFilter === "active" && !pipelineStageFilter,
          stageFilter: pipelineStageFilter,
          boardExpand,
          boardLimit: 4,
          selectedId: selectedCandidateId,
          canDlCvFor: (c) => {
            const cvDlRow = extractCandidateCvDownload(c);
            return Boolean(cvDlRow?.href) || candidateMayHaveCvInStorage(c);
          }
        })
      : "";
  const interviewsView = dataListSearch
    ? interviews.filter((i) =>
        hiringDataMatches(
          `${i.candidateName} ${i.when} ${i.mode || ""} ${i.modality || ""} ${i.locationOrLink || i.place || ""} ${i.interviewer}`
        )
      )
    : interviews;
  const contractsView = dataListSearch
    ? contracts.filter((c) =>
        hiringDataMatches(
          `${c.candidateName} ${c.employeeName} ${c.position} ${c.positionName} ${c.contractType} ${c.source} ${c.sourceTag}`
        )
      )
    : contracts;

  const arlRiskOpts = selectOptionsFromCatalog(CO_CATALOGS.arlRiskLevels);
  const workScheduleOpts = selectOptionsFromCatalog(CO_CATALOGS.workSchedule);
  const fPosition = `<form id="form-position" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.briefcase} Definición del cargo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.briefcase, "Nombre del cargo")}<input name="name" required placeholder="Ej: Coordinador de transporte" /></label>
        <label>${fieldLabel(IC.users, "Rol del cargo")}<select name="workerRole" required>
          <option value="empleado">Empleado</option>
          <option value="conductor">Conductor</option>
        </select></label>
        <label>${fieldLabel(IC.dollar, "Referencia salarial")}<select name="salaryBasis" id="position-salary-basis" required>
          <option value="smmlv">Salario mínimo legal (SMMLV)</option>
          <option value="custom">Otro valor (ajustar)</option>
        </select></label>
        <label>${fieldLabel(IC.dollar, "Salario base mensual (COP)")}<input type="number" name="baseSalary" id="position-base-salary" min="${CO_HR_RULES.minMonthlySalary}" value="${CO_HR_RULES.minMonthlySalary}" required readonly placeholder="Mín. SMMLV ${CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")}" data-antares-restrict="decimal" data-antares-validate-blur="decimal" /></label>
        <label>${fieldLabel(IC.truck, "Auxilio legal transporte / conectividad (COP)")}<input type="number" name="transportAllowance" id="position-transport-allowance" value="${suggestedEmployeeTransportAllowanceCop(CO_HR_RULES.minMonthlySalary)}" min="0" data-antares-restrict="decimal" data-antares-validate-blur="decimal" /></label>
        <p class="full muted" id="position-legal-comp-hint" style="font-size:0.82rem;line-height:1.45;margin:0">${escapeHtml(employeeTransportAllowanceGuidance(CO_HR_RULES.minMonthlySalary))}</p>
        <label>${fieldLabel(IC.activity, "Tipo de contrato sugerido")}<select name="contractTypeDefault" required>
          ${CO_CATALOGS.positionContractTypes.map((c) => `<option>${c}</option>`).join("")}
        </select></label>
        <label>${fieldLabel(IC.clock, "Jornada laboral")}<select name="workSchedule">${workScheduleOpts}</select></label>
        <label>${fieldLabel(IC.alertTriangle, "Nivel de riesgo ARL")}<select name="arlRiskLevel">${arlRiskOpts}</select></label>
        <label>${fieldLabel(IC.shield, "Salario integral")}<select name="integralSalary">
          <option value="false">No (10+ prestaciones)</option>
          <option value="true">Sí (≥ 13 SMMLV + 30% factor prestacional)</option>
        </select></label>
        <label class="full">${fieldLabel(IC.file, "Base legal")}<input name="legalBasis" value="CST art. 45-46, Ley 50/1990 y normatividad laboral vigente" /></label>
      </div>
    </fieldset>
    ${renderManagedCreateFormActions("create-position", `<button class="btn btn-primary" type="submit">${IC.plus} Crear cargo</button>`)}
  </form>`;
  const fVac = `<form id="form-vacancy" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.send} Publicación de la vacante</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.briefcase, "Cargo publicado")}<select name="positionId" required><option value="">Seleccione</option>${positionOptions}</select></label>
        <label>${fieldLabel(IC.file, "Título visible")}<input name="title" required placeholder="Ej: Conductor C2 Bogotá Sabana" /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="vacancy-department" required><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="vacancy-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label>${fieldLabel(IC.globe, "Modalidad")}<select name="modality" required><option value="Presencial">Presencial</option><option value="Híbrido">Híbrido</option><option value="Remoto">Remoto</option></select></label>
        <label>${fieldLabel(IC.clock, "Jornada")}<select name="workday" required><option value="Tiempo completo">Tiempo completo</option><option value="Turnos">Turnos</option><option value="Medio tiempo">Medio tiempo</option></select></label>
        <label>${fieldLabel(IC.users, "Cupos")}<input type="number" min="1" name="openings" value="1" required /></label>
        <label>${fieldLabel(IC.dollar, "Salario ofrecido")}<input type="number" min="${CO_HR_RULES.minMonthlySalary}" name="salaryOffer" id="vacancy-salary-offer" required placeholder="Mín. SMMLV" data-antares-restrict="decimal" data-antares-validate-blur="decimal" /></label>
        <p class="full muted" id="vacancy-salary-hint" style="font-size:0.82rem;line-height:1.45;margin:0">Se precarga desde el cargo; no puede ser inferior al salario del catálogo ni al SMMLV.</p>
        <label>${fieldLabel(IC.calendar, "Fecha límite")}<input type="date" name="deadline" required /></label>
        <label>${fieldLabel(IC.calendar, "Visible en web desde")}<input type="date" name="publishedFrom" /><span class="muted" style="font-size:0.78rem;display:block;margin-top:4px">Opcional. Si se deja vacío, la vacante puede mostrarse de inmediato en el portal de empleos.</span></label>
        <label class="full">${fieldLabel(IC.file, "Requisitos")}<textarea name="requirements" rows="3" required placeholder="Ej: Licencia C2 vigente, 3 años de experiencia, curso defensivo..."></textarea></label>
        <div class="full vacancy-image-field">
          ${fieldLabel(IC.upload, "Imagen del cargo")}
          <label class="vacancy-image-dropzone" data-vacancy-image-dropzone for="vacancy-image-file" title="Clic para elegir imagen del cargo">
            <input type="file" name="imageFile" id="vacancy-image-file" accept="image/jpeg,image/png,image/webp,image/gif" class="vacancy-image-file-input" aria-label="Imagen del cargo para la vacante" />
            <span class="vacancy-image-dropzone__empty" data-vacancy-image-empty>
              <span class="vacancy-image-dropzone__icon" aria-hidden="true">${IC.upload}</span>
              <span class="vacancy-image-dropzone__copy">
                <span class="vacancy-image-dropzone__title">Elegir imagen del cargo</span>
                <span class="vacancy-image-dropzone__meta">Opcional · JPG, PNG, WebP o GIF · Se muestra en Carreras</span>
              </span>
            </span>
            <img id="vacancy-image-preview" class="vacancy-image-preview" data-vacancy-image-preview alt="" width="640" height="360" decoding="async" hidden />
            <span class="vacancy-image-dropzone__overlay" aria-hidden="true"><span>Cambiar imagen</span></span>
          </label>
        </div>
      </div>
    </fieldset>
    <div class="vacancy-publish-progress" data-vacancy-publish-progress hidden aria-live="polite" aria-busy="false">
      <span class="vacancy-publish-progress__spinner" aria-hidden="true"></span>
      <div class="vacancy-publish-progress__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-vacancy-publish-bar>
        <span class="vacancy-publish-progress__fill" data-vacancy-publish-fill style="width:0%"></span>
      </div>
    </div>
    ${renderManagedCreateFormActions("create-vacancy", `<button class="btn btn-primary" type="submit">${IC.plus} Publicar vacante</button>`)}
  </form>`;
  const educationOptsCand = selectOptionsFromCatalog(CO_CATALOGS.educationLevel);
  const docTypeCand = CO_CATALOGS.documentTypes.map((d) => `<option value="${d}">${d === "CC" ? "Cédula de ciudadanía" : d === "CE" ? "Cédula de extranjería" : d === "PAS" ? "Pasaporte" : d === "PEP" ? "Permiso especial (PEP)" : "Tarjeta de identidad"}</option>`).join("");
  const fCand = `<form id="form-candidate" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <div class="hr-form-wizard" data-hr-wizard="candidate" aria-label="Registro de candidato por pasos">
      <div class="hr-form-wizard-toolbar">
        <div>
          <p class="hr-form-wizard-kicker">Registro en dos pasos</p>
        </div>
        <div class="hr-form-wizard-meta">
          <div class="hr-wizard-progress-track" aria-hidden="true"><span class="hr-wizard-progress-fill" data-hr-wizard-progress-fill style="width:50%"></span></div>
          <span class="hr-wizard-progress-label" data-hr-wizard-progress>Paso 1 de 2</span>
        </div>
      </div>
      <div class="hr-form-wizard-dots hr-form-wizard-dots--few" role="tablist" aria-label="Secciones">
        <button type="button" class="hr-form-wizard-dot is-active" data-hr-wizard-dot="0" aria-label="Paso 1: datos personales"><span class="hr-dot-num">1</span><small>Identidad</small></button>
        <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="1" aria-label="Paso 2: perfil profesional"><span class="hr-dot-num">2</span><small>Perfil</small></button>
      </div>

      <div class="hr-form-step is-active" data-step-index="0">
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.user} Datos personales del candidato</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" required data-antares-restrict="person-name" data-antares-field="person-name" placeholder="Ej: Julián Andrés Botero" autocomplete="name" /></label>
        <label>${fieldLabel(IC.mail, "Correo electrónico")}<input type="email" name="email" required data-antares-validate-blur="email" data-antares-restrict="email-local" /></label>
        <label>${fieldLabel(IC.phone, "Teléfono celular")}<input name="phone" required placeholder="3001234567" data-antares-restrict="digits" data-antares-validate-blur="phone-loose" /></label>
        <label>${fieldLabel(IC.file, "Tipo documento")}<select name="documentType" required>${docTypeCand}</select></label>
        <label>${fieldLabel(IC.badge, "N° documento")}<input name="idDoc" required data-antares-restrict="alnum-doc" data-antares-field="doc" /></label>
        <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" required data-antares-validate-blur="date-iso" /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}<select name="department" id="candidate-department" required><option value="">Seleccione...</option>${departmentOptions()}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad")}<select name="city" id="candidate-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Dirección")}<input name="address" required /></label>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="1">
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.briefcase} Perfil profesional</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.graduation, "Nivel educativo")}<select name="educationLevel">${educationOptsCand}</select></label>
        <label>${fieldLabel(IC.star, "Años de experiencia en el cargo")}<input type="number" min="0" step="1" name="experienceYears" value="0" required /></label>
        <label>${fieldLabel(IC.dollar, "Aspiración salarial (COP)")}<input type="number" min="${CO_HR_RULES.minMonthlySalary}" name="expectedSalary" required placeholder="Mín. SMMLV" /></label>
        <label>${fieldLabel(IC.calendar, "Disponibilidad ingreso")}<input type="date" name="availabilityDate" required /></label>
        <label>${fieldLabel(IC.send, "Vacante")}<select name="vacancyId" required><option value="">Seleccione</option>${vacanciesOpenForApply.map((v) => `<option value="${escapeAttr(String(v.id))}">${escapeHtml(String(v.title || ""))}</option>`).join("")}</select><span class="muted" style="font-size:0.78rem;display:block;margin-top:4px">Solo vacantes publicadas con fecha límite vigente.</span></label>
        <label class="full">${fieldLabel(IC.upload, "Adjunto hoja de vida")}<input type="file" name="attachments" multiple /></label>
      </div>
    </fieldset>
      </div>

      ${renderHrFormWizardFooter(
        "create-candidate",
        `<button class="btn btn-primary hr-form-wizard-submit" type="submit" disabled aria-disabled="true">${IC.userPlus} Registrar candidato</button>`
      )}
    </div>
  </form>`;
  const interviewCandidateOptions = candidatesForInterviewSelect
    .map((c) => {
      const status = String(c.status || PIPELINE[0]);
      return `<option value="${escapeAttr(String(c.id))}" data-candidate-name="${escapeAttr(String(c.name || ""))}" data-candidate-status="${escapeAttr(status)}" data-candidate-vacancy="${escapeAttr(String(c.vacancyTitle || ""))}" data-candidate-phone="${escapeAttr(String(c.phone || ""))}" data-candidate-email="${escapeAttr(String(c.email || ""))}">${escapeHtml(String(c.name || ""))} · ${escapeHtml(status)}</option>`;
    })
    .join("");
  const interviewQuickChips = [
    { days: 1, time: "09:00", label: "Mañana 9:00 a. m." },
    { days: 1, time: "14:00", label: "Mañana 2:00 p. m." },
    { days: 3, time: "09:00", label: "En 3 días 9:00 a. m." },
    { weekday: 1, time: "09:00", label: "Próximo lunes 9:00 a. m." }
  ]
    .map(
      (chip) =>
        `<button type="button" class="hiring-interview-chip" data-interview-quick${chip.weekday ? ` data-quick-weekday="${chip.weekday}"` : ` data-quick-days="${chip.days}"`} data-quick-time="${chip.time}">${escapeHtml(chip.label)}</button>`
    )
    .join("");
  const fInt = `<form id="form-interview" class="p-form p-form-colored hr-form-flow hr-form-compact hiring-interview-form">
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.calendar} 1 · Candidato y agenda</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.user, "Candidato (en proceso)", { required: true })}<select name="candidateId" required><option value="">Seleccione</option>${interviewCandidateOptions}</select><span class="hiring-interview-hint">${
          candidatesForInterviewSelect.length
            ? "Solo candidatos que no están contratados ni descartados."
            : "No hay candidatos activos en el pipeline: registre un candidato antes de agendar."
        }</span></label>
        <div class="full hiring-interview-context hidden" data-interview-context hidden aria-live="polite"></div>
        <label class="full">${fieldLabel(IC.clock, "Fecha y hora", { required: true })}<input type="datetime-local" name="when" required step="60" min="${escapeAttr(colombiaDatetimeLocalString())}" /><span class="hiring-interview-hint">Hora de Colombia (UTC−5). La cita debe quedar en el futuro.</span></label>
        <div class="full hiring-interview-quick" role="group" aria-label="Atajos de fecha y hora">
          <span class="hiring-interview-quick__label">${IC.clock} Atajos</span>
          ${interviewQuickChips}
        </div>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.users} 2 · Entrevistador responsable</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.briefcase, "Personal de oficina")}<select data-interview-field="interviewer-pick">${hiringInterviewerPickerOptionsHtml()}</select><span class="hiring-interview-hint">Incluye empleados administrativos y usuarios del portal con rol de oficina; los conductores no se listan.</span></label>
        <label class="full">${fieldLabel(IC.user, "Nombre del entrevistador", { required: true })}<input name="interviewer" required placeholder="Nombre del entrevistador" autocomplete="off" /><span class="hiring-interview-hint" data-interview-field="interviewer-hint">Elija a alguien de la lista o escriba el nombre si el entrevistador es externo.</span></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-cyan full">
      <legend>${IC.globe} 3 · Modalidad y notas</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.globe, "Modalidad")}<select name="mode">
          <option value="presencial">Presencial · en sede</option>
          <option value="virtual">Virtual · videollamada</option>
          <option value="telefonica">Telefónica · llamada</option>
        </select></label>
        <label class="full" data-interview-field="place-label">${fieldLabel(IC.mapPin, "Lugar de la entrevista")}<input name="place" placeholder="Sala de juntas, oficina o dirección" /><span class="hiring-interview-hint" data-interview-field="place-hint">Indique sede, piso y sala para orientar al candidato.</span></label>
        <label class="full">${fieldLabel(IC.file, "Notas previas")}<textarea name="notes" rows="2" placeholder="Temas a revisar, pruebas a aplicar, documentos a solicitar…"></textarea></label>
      </div>
    </fieldset>
    <div class="hiring-interview-summary" data-interview-summary aria-live="polite"></div>
    ${renderManagedCreateFormActions("create-interview", `<button class="btn btn-primary" type="submit">${IC.calendar} Guardar entrevista</button>`)}
  </form>`;
  const signDateDefault = colombiaTodayIsoDate();
  const candidatesForContractSelect = candidates.filter((c) => !["Descartado"].includes(String(c.status || "")));
  const fCon = `<form id="form-contract" class="p-form p-form-colored hr-form-flow hr-form-compact">
    <div class="hr-form-wizard" data-hr-wizard="contract" aria-label="Generación de contrato por pasos">
      <div class="hr-form-wizard-toolbar">
        <div>
          <p class="hr-form-wizard-kicker">Contrato Word · 2 pasos</p>
        </div>
        <div class="hr-form-wizard-meta">
          <div class="hr-wizard-progress-track" aria-hidden="true"><span class="hr-wizard-progress-fill" data-hr-wizard-progress-fill style="width:50%"></span></div>
          <span class="hr-wizard-progress-label" data-hr-wizard-progress>Paso 1 de 2</span>
        </div>
      </div>
      <div class="hr-form-wizard-dots hr-form-wizard-dots--few" role="tablist">
        <button type="button" class="hr-form-wizard-dot is-active" data-hr-wizard-dot="0" aria-label="Datos de descarga"><span class="hr-dot-num">1</span><small>Datos</small></button>
        <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="1" aria-label="Pruebas y referencia"><span class="hr-dot-num">2</span><small>Plantillas</small></button>
      </div>

      <div class="hr-form-step is-active" data-step-index="0">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.file} Descargar contrato Word</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.user, "Origen del contrato")}<select name="contractPersonMode" id="contract-person-mode">
          <option value="employee">Empleado ya registrado</option>
          <option value="candidate">Candidato en proceso</option>
        </select></label>
        <label class="full hiring-contract-employee-picker">${fieldLabel(IC.user, "Empleado")}<select name="employeeId"><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} · ${e.position || "-"} · CC ${e.idDoc || "-"}</option>`).join("")}</select></label>
        <label class="full hiring-contract-candidate-picker hidden" hidden>${fieldLabel(IC.user, "Candidato")}<select name="candidateId"><option value="">Seleccione</option>${candidatesForContractSelect
          .map(
            (c) =>
              `<option value="${escapeAttr(String(c.id))}">${escapeHtml(String(c.name || ""))} · ${escapeHtml(String(c.status || PIPELINE[0]))} · CC ${escapeHtml(String(c.idDoc || "-"))}</option>`
          )
          .join("")}</select><span class="muted" style="font-size:0.78rem;display:block;margin-top:4px">Debe existir un empleado con la misma cédula. Use «Crear empleado» desde el candidato si aún no está en nómina.</span></label>
        <p class="full muted hidden" id="contract-candidate-match-hint" style="font-size:0.82rem;line-height:1.45;margin:0"></p>
        <label>${fieldLabel(IC.file, "Plantilla Word")}<select name="contractTemplateKind">
          ${renderContractTemplateSelectOptions("", true)}
        </select></label>
        <label>${fieldLabel(IC.calendar, "Fecha de firma (constancia)")}<input type="date" name="signDate" required value="${signDateDefault}" /></label>
        <div class="full" data-contract-merge-preview style="grid-column:1/-1;margin-top:0.25rem">
          <p class="muted" style="margin:0 0 0.35rem;font-size:0.82rem">${escapeHtml("Vista previa: solo se reemplazan marcadores del empleado en la plantilla Word.")}</p>
          ${renderContractMergePreviewHtml(null)}
        </div>
      </div>
    </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="1">
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.download} Vista previa de plantilla</legend>
      <div class="form-section-grid hr-form-contract-tests">
        <button type="button" class="btn btn-outline" data-action="contract-test-docx" data-template="oficina">${IC.file} Prueba · Oficina</button>
        <button type="button" class="btn btn-outline" data-action="contract-test-docx" data-template="fijo">${IC.file} Prueba · Termino fijo</button>
        <button type="button" class="btn btn-outline" data-action="contract-test-docx" data-template="prestacion">${IC.file} Prueba · Prestacion servicios</button>
      </div>
    </fieldset>
      </div>

      ${renderHrFormWizardFooter(
        "create-contract",
        `<button class="btn btn-primary hr-form-wizard-submit" type="submit" aria-disabled="false">${IC.file} Generar y descargar contrato Word</button>`,
        { hint: "Puede generar el contrato desde el paso que prefiera o revisar plantillas en el paso 2." }
      )}
    </div>
  </form>`;

  const vacCards = filteredVacanciesView
    .map((v) => {
      const statusHtml =
        v.status === "Publicada"
          ? '<span class="status status-viaje_asignado">Publicada</span>'
          : '<span class="status status-rechazada">Cerrada</span>';
      return `<article class="hiring-browse-row hiring-browse-row--vacancy">
        <div class="hiring-browse-row__main">
          <span class="hiring-browse-row__ico" aria-hidden="true">${IC.send}</span>
          <div>
            <h4>${escapeHtml(String(v.title || ""))}</h4>
            <p>${escapeHtml(String(v.positionName || "-"))} · ${escapeHtml(String(v.city || "-"))} · ${escapeHtml(String(v.modality || "-"))}</p>
          </div>
          ${statusHtml}
        </div>
        <div class="hiring-browse-row__stats">
          <span><small>Cupos</small><strong>${escapeHtml(String(v.openings ?? 1))}</strong></span>
          <span><small>Salario</small><strong>$${parseNum(v.salaryOffer).toLocaleString("es-CO")}</strong></span>
          <span><small>Límite</small><strong>${escapeHtml(String(v.deadline || "-"))}</strong></span>
        </div>
        <div class="toolbar hiring-browse-row__actions">
          <button type="button" class="btn btn-sm btn-outline" data-action="view-vacancy" data-id="${escapeAttr(String(v.id))}">${IC.eye} Ver</button>
          ${vacancyCanEdit ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-vacancy" data-id="${escapeAttr(String(v.id))}">${IC.edit}</button>` : ""}
          ${vacancyCanEdit ? `<button type="button" class="btn btn-sm btn-action" data-action="close-vacancy" data-id="${escapeAttr(String(v.id))}">${IC.x} Cerrar</button>` : ""}
          ${vacancyCanDelete ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-vacancy" data-id="${escapeAttr(String(v.id))}" title="Solo administradores">${IC.trash}</button>` : ""}
        </div>
      </article>`;
    })
    .join("");
  const interviewCards = interviewsView
    .map(
      (i) => `<article class="hiring-browse-row hiring-browse-row--interview">
        <div class="hiring-browse-row__main">
          <span class="hiring-browse-row__ico hiring-browse-row__ico--amber" aria-hidden="true">${IC.calendar}</span>
          <div>
            <h4>${escapeHtml(String(i.candidateName || "-"))}</h4>
            <p>${escapeHtml(formatInterviewWhenDisplay(i.when))} · ${escapeHtml(formatInterviewModeLabel(i.mode || i.modality))}</p>
          </div>
        </div>
        <div class="hiring-browse-row__stats">
          <span><small>Entrevistador</small><strong>${escapeHtml(String(i.interviewer || "-"))}</strong></span>
          <span><small>Lugar / enlace</small><strong>${escapeHtml(String(i.locationOrLink || i.place || "-"))}</strong></span>
        </div>
        <div class="toolbar hiring-browse-row__actions">
          <button class="btn btn-sm btn-outline" data-action="view-interview" data-id="${escapeAttr(String(i.id))}">${IC.eye} Ver</button>
          ${hiringCanEdit ? `<button class="btn btn-sm btn-action" data-action="edit-interview" data-id="${escapeAttr(String(i.id))}">${IC.edit}</button>` : ""}
          ${hiringCanDelete ? `<button class="btn btn-sm btn-reject" data-action="delete-interview" data-id="${escapeAttr(String(i.id))}" title="Solo administradores">${IC.trash}</button>` : ""}
        </div>
      </article>`
    )
    .join("");
  const contractCards = contractsView
    .map(
      (c) => `<article class="hiring-browse-row hiring-browse-row--contract">
        <div class="hiring-browse-row__main">
          <span class="hiring-browse-row__ico hiring-browse-row__ico--violet" aria-hidden="true">${IC.file}</span>
          <div>
            <h4>${escapeHtml(String(c.candidateName || c.employeeName || "-"))}</h4>
            <p>${escapeHtml(String(c.position || c.positionName || "-"))} · ${escapeHtml(String(c.contractType || "-"))}</p>
          </div>
          <span class="hiring-browse-chip">${escapeHtml(String(c.source || c.sourceTag || (c.employeeId ? "Empleado" : "Candidato")))}</span>
        </div>
        <div class="hiring-browse-row__stats">
          <span><small>Salario</small><strong>$${parseNum(c.salary).toLocaleString("es-CO")}</strong></span>
          <span><small>Inicio</small><strong>${fmtDateOr(c.startDate, "—")}</strong></span>
          <span><small>Fin</small><strong>${fmtDateOr(c.endDate, "—")}</strong></span>
        </div>
        <div class="toolbar hiring-browse-row__actions">
          <button class="btn btn-sm btn-outline" data-action="view-contract-detail" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
          <button class="btn btn-sm btn-action" data-action="view-contract" data-id="${escapeAttr(String(c.id))}" title="Descargar Word">${IC.download} Word</button>
          ${hiringCanDelete ? `<button class="btn btn-sm btn-reject" data-action="delete-contract" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash}</button>` : ""}
        </div>
      </article>`
    )
    .join("");
  const positionCards = positionsView
    .map((p) => {
      const isActive = p.active !== false;
      const isDriver = String(p.workerRole || "").toLowerCase() === "conductor";
      const linkedVacancies = vacancies.filter((v) => String(v.positionId || "") === String(p.id)).length;
      const openLinked = vacancies.filter(
        (v) => String(v.positionId || "") === String(p.id) && String(v.status || "") === "Publicada"
      ).length;
      const integral = String(p.integralSalary) === "true" || p.integralSalary === true;
      return `<article class="hiring-position-card${isActive ? " hiring-position-card--active" : " hiring-position-card--inactive"}${isDriver ? " hiring-position-card--driver" : ""}">
        <header class="hiring-position-card__head">
          <span class="hiring-position-card__ico" aria-hidden="true">${IC.briefcase || ""}</span>
          <div class="hiring-position-card__titles">
            <h4 title="${escapeAttr(String(p.name || ""))}">${escapeHtml(String(p.name || ""))}</h4>
            <p>${isDriver ? "Conductor" : "Empleado"} · ${escapeHtml(String(p.contractTypeDefault || "—"))}</p>
          </div>
          <span class="hiring-stage-pill hiring-stage-pill--${isActive ? "contratado" : "descartado"}">${isActive ? "Activo" : "Inactivo"}</span>
        </header>
        <ul class="hiring-position-card__meta">
          <li><small>Salario base</small><strong>$${parseNum(p.baseSalary).toLocaleString("es-CO")}</strong></li>
          <li><small>Aux. transporte</small><strong>$${readPositionTransportAllowanceCop(p).toLocaleString("es-CO")}</strong></li>
          <li><small>Integral</small><strong>${integral ? "Sí" : "No"}</strong></li>
          <li><small>Vacantes</small><strong>${linkedVacancies}${openLinked ? ` · ${openLinked} abiertas` : ""}</strong></li>
        </ul>
        <div class="hiring-position-card__actions">
          <button type="button" class="hiring-icon-btn" data-action="view-position" data-id="${escapeAttr(String(p.id))}" title="Ver cargo">${IC.eye}</button>
          ${positionCanEdit ? `<button type="button" class="hiring-icon-btn" data-action="edit-position" data-id="${escapeAttr(String(p.id))}" title="Editar">${IC.edit}</button>` : ""}
          <button type="button" class="hiring-icon-btn" data-action="toggle-position" data-id="${escapeAttr(String(p.id))}" title="${isActive ? "Desactivar" : "Activar"}">${IC.toggle}</button>
          ${
            positionCanEdit
              ? `<button type="button" class="btn btn-sm btn-outline" data-action="hiring-open-create" data-section="vacancy" data-position-id="${escapeAttr(String(p.id))}" title="Publicar vacante desde este cargo">${IC.send} Vacante</button>`
              : ""
          }
          ${positionCanDelete ? `<button type="button" class="hiring-icon-btn hiring-icon-btn--danger" data-action="delete-position" data-id="${escapeAttr(String(p.id))}" title="Eliminar (solo administradores)">${IC.trash}</button>` : ""}
        </div>
      </article>`;
    })
    .join("");
  const tPos = positionCards
    ? `<div class="hiring-position-grid">${positionCards}</div>`
    : hiringEmptyState("Sin cargos en esta vista", { action: "hiring-open-create", section: "position", label: "Definir cargo" });
  const tVac = vacCards
    ? `<div class="hiring-browse-list hiring-browse-list--vacancies">${vacCards}</div>`
    : hiringEmptyState("Sin vacantes", { action: "hiring-operate-section", section: "vacancy", label: "Publicar vacante" });
  const pipelineListItems = sortedCandidatesView
    .map((c) => {
      const displayName = hiringCandidateDisplayName(c);
      const ageInfo = portalCandidateAgeFromBirthIso(c.birthDate);
      const expCargo = parseNum(c.experienceYears || 0);
      const statusClass = hiringPipelineStatusClass(c.status);
      const active = String(c.id) === selectedCandidateId;
      const whenLabel = c.createdAt ? formatInterviewWhenDisplay(c.createdAt).split(",")[0] || "" : "";
      return `<button type="button" class="hiring-pipeline__item${active ? " is-active" : ""}" data-action="hiring-select-candidate" data-id="${escapeAttr(String(c.id))}" aria-current="${active ? "true" : "false"}">
        <span class="hiring-browse-avatar" aria-hidden="true">${escapeHtml(hiringPersonInitialsFromName(displayName))}</span>
        <span class="hiring-pipeline__item-copy">
          <strong title="${escapeAttr(displayName)}">${escapeHtml(displayName)}</strong>
          <small title="${escapeAttr(String(c.vacancyTitle || ""))}">${escapeHtml(String(c.vacancyTitle || "Sin vacante"))}</small>
          <span class="hiring-pipeline__item-meta">${expCargo} años${ageInfo.age != null ? ` · ${ageInfo.age} años` : ""}${whenLabel ? ` · ${escapeHtml(whenLabel)}` : ""}</span>
        </span>
        <span class="status ${statusClass}">${escapeHtml(String(c.status || PIPELINE[0]))}</span>
      </button>`;
    })
    .join("");

  let pipelineDetailHtml = "";
  if (selectedCandidate) {
    const c = selectedCandidate;
    const displayName = hiringCandidateDisplayName(c);
    const ageInfo = portalCandidateAgeFromBirthIso(c.birthDate);
    const expCargo = parseNum(c.experienceYears || 0);
    const statusClass = hiringPipelineStatusClass(c.status);
    const canDlCv =
      typeof candidateCanAttemptCvDownload === "function"
        ? candidateCanAttemptCvDownload(c)
        : Boolean(extractCandidateCvDownload(c)?.href) || candidateMayHaveCvInStorage(c);
    const canScheduleInterview = !["Contratado", "Descartado"].includes(String(c.status || ""));
    const employeeMatch = findPayrollEmployeeByIdDoc(c.idDoc);
    const linkedInterviews = interviews.filter((i) => String(i.candidateId || "") === String(c.id));
    const cvLabel = hiringCandidateCvLabel(c);
    const status = String(c.status || PIPELINE[0]);
    const activePipeline = PIPELINE.filter((s) => s !== "Descartado");
    const stageIdx = activePipeline.indexOf(status);
    const isDiscarded = status === "Descartado";
    const pipelineSteps = activePipeline
      .map((step, idx) => {
        const done = !isDiscarded && ((stageIdx >= 0 && idx < stageIdx) || status === "Contratado");
        const current = !isDiscarded && status === step;
        return `<li class="hiring-pipeline__step${done ? " is-done" : ""}${current ? " is-current" : ""}"><span>${escapeHtml(step)}</span></li>`;
      })
      .join("");
    const infoTiles = [
      ["Correo", String(c.email || "-"), IC.mail],
      ["Teléfono", String(c.phone || "-"), IC.phone],
      ["Edad", ageInfo.age != null ? `${ageInfo.age} años · nac. ${ageInfo.birthLabel}` : "—", IC.cake],
      ["Ubicación", [c.city, c.department].filter(Boolean).join(", ") || "—", IC.mapPin],
      ["Experiencia", `${expCargo} años en el cargo`, IC.star],
      ["Origen", String(c.source || "Portal"), IC.globe]
    ]
      .map(
        ([label, value, icon]) =>
          `<div class="hiring-pipeline__tile"><span class="hiring-pipeline__tile-ico" aria-hidden="true">${icon || ""}</span><small>${escapeHtml(label)}</small><strong title="${escapeAttr(value)}">${escapeHtml(value)}</strong></div>`
      )
      .join("");
    pipelineDetailHtml = `<article class="hiring-pipeline__profile">
        <header class="hiring-pipeline__profile-head">
          <span class="hiring-browse-avatar hiring-browse-avatar--lg" aria-hidden="true">${escapeHtml(hiringPersonInitialsFromName(displayName))}</span>
          <div class="hiring-pipeline__profile-identity">
            <h3 title="${escapeAttr(displayName)}">${escapeHtml(displayName)}</h3>
            <p>${escapeHtml(String(c.vacancyTitle || "Sin vacante asociada"))}</p>
            <div class="hiring-pipeline__profile-chips">
              <span class="hiring-browse-chip">${expCargo} años de experiencia</span>
              ${ageInfo.age != null ? `<span class="hiring-browse-chip">${ageInfo.age} años</span>` : ""}
              <span class="status ${statusClass}">${escapeHtml(String(c.status || PIPELINE[0]))}</span>
              ${canDlCv ? `<span class="hiring-browse-chip hiring-browse-chip--cv">${IC.file} CV adjunto</span>` : ""}
            </div>
          </div>
          <div class="hiring-pipeline__profile-actions">
            ${
              canScheduleInterview
                ? `<button type="button" class="btn btn-primary" data-action="schedule-interview-for-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.calendar} Programar entrevista</button>`
                : ""
            }
            ${
              hiringCanEdit
                ? `<button type="button" class="btn btn-action" data-action="create-employee-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.userPlus} Contratar</button>`
                : ""
            }
            <button type="button" class="btn btn-outline"${canDlCv ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}" title="${canDlCv ? "Descargar hoja de vida" : "Sin CV disponible"}">${IC.download} Descargar CV</button>
            ${hiringCanEdit ? `<button type="button" class="btn btn-outline" data-action="edit-candidate" data-id="${escapeAttr(String(c.id))}">${IC.edit} Editar</button>` : ""}
            ${
              hiringCanEdit && employeeMatch
                ? `<button type="button" class="btn btn-outline" data-action="generate-contract-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.file} Contrato</button>`
                : ""
            }
            ${hiringCanDelete ? `<button type="button" class="btn btn-reject" data-action="delete-candidate" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash}</button>` : ""}
          </div>
        </header>
        <div class="hiring-pipeline__tiles">${infoTiles}</div>
        <div class="hiring-pipeline__grid">
          <section class="hiring-pipeline__panel">
            <h4>${IC.activity} Etapa del proceso</h4>
            <ol class="hiring-pipeline__steps">${pipelineSteps}</ol>
            ${isDiscarded ? `<p class="muted hiring-pipeline__panel-note">Candidato descartado del proceso.</p>` : ""}
            <label class="hiring-pipeline__stage-select">${fieldLabel(IC.toggle, "Cambiar etapa")}
              <select class="hiring-status-select" data-action="candidate-status" data-id="${escapeAttr(String(c.id))}">${hiringPipelineSelectOptions(c.status)}</select>
            </label>
          </section>
          <section class="hiring-pipeline__panel">
            <h4>${IC.file} Documentos</h4>
            <ul class="hiring-pipeline__docs">
              <li>
                <span>${IC.file} ${escapeHtml(cvLabel)}</span>
                <button type="button" class="btn btn-sm btn-action"${canDlCv ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}">${IC.download} Descargar</button>
              </li>
            </ul>
            <p class="muted hiring-pipeline__panel-note">${canDlCv ? "Hoja de vida disponible para descarga." : "Este candidato aún no tiene CV descargable."}</p>
          </section>
          <section class="hiring-pipeline__panel">
            <h4>${IC.calendar} Entrevistas</h4>
            ${
              linkedInterviews.length
                ? `<ul class="hiring-pipeline__docs">${linkedInterviews
                    .slice(0, 4)
                    .map(
                      (i) =>
                        `<li><span>${IC.calendar} ${escapeHtml(formatInterviewWhenDisplay(i.when))} · ${escapeHtml(String(i.interviewer || "-"))}</span><button type="button" class="btn btn-sm btn-outline" data-action="view-interview" data-id="${escapeAttr(String(i.id))}">${IC.eye}</button></li>`
                    )
                    .join("")}</ul>`
                : `<p class="muted hiring-pipeline__panel-note">Sin entrevistas programadas.</p>`
            }
          </section>
          <section class="hiring-pipeline__panel">
            <h4>${IC.user} Identificación</h4>
            <dl class="hiring-pipeline__facts">
              <div><dt>Documento</dt><dd>${escapeHtml(String(c.documentType || "-"))} ${escapeHtml(String(c.idDoc || ""))}</dd></div>
              <div><dt>Dirección</dt><dd>${escapeHtml(String(c.address || "-"))}</dd></div>
              <div><dt>Educación</dt><dd>${escapeHtml(String(c.educationLevel || "-"))}</dd></div>
              <div><dt>Disponibilidad</dt><dd>${escapeHtml(String(c.availabilityDate || "-"))}</dd></div>
              <div><dt>Aspiración</dt><dd>$${parseNum(c.expectedSalary).toLocaleString("es-CO")}</dd></div>
            </dl>
          </section>
        </div>
      </article>`;
  } else {
    pipelineDetailHtml = `<div class="hiring-pipeline__empty">
        <p>Seleccione un candidato del listado para ver su ficha completa.</p>
      </div>`;
  }

  const hiredCandidates = candidates.filter((c) => String(c.status || "") === "Contratado").length;
  const candidateConversion = computeHiringConversionPct(candidates);
  const urgentItems = soonClosingVacancies.length + contractsEndingSoon.length;
  const receivedCandidates = candidates.filter((c) => String(c.status || "") === "Recibido").length;
  const interviewsPending = candidates.filter((c) => String(c.status || "") === "Preseleccionado").length;
  const todayYmd = colombiaTodayIsoDate();
  const interviewsToday = interviews.filter((i) => String(i.when || "").slice(0, 10) === todayYmd).length;

  let candidateDrawerHtml = "";
  if (selectedCandidate && drawerOpen) {
    const c = selectedCandidate;
    const displayName = hiringCandidateDisplayName(c);
    const ageInfo = portalCandidateAgeFromBirthIso(c.birthDate);
    const expCargo = parseNum(c.experienceYears || 0);
    const statusClass = hiringPipelineStatusClass(c.status);
    const status = String(c.status || PIPELINE[0]);
    const canDlCv =
      typeof candidateCanAttemptCvDownload === "function"
        ? candidateCanAttemptCvDownload(c)
        : Boolean(extractCandidateCvDownload(c)?.href) || candidateMayHaveCvInStorage(c);
    const canScheduleInterview = !["Contratado", "Descartado"].includes(status);
    const employeeMatch = findPayrollEmployeeByIdDoc(c.idDoc);
    const linkedInterviews = interviews.filter((i) => String(i.candidateId || "") === String(c.id));
    const cvLabel = hiringCandidateCvLabel(c);
    const activePipeline = PIPELINE.filter((s) => s !== "Descartado");
    const stageIdx = activePipeline.indexOf(status);
    const isDiscarded = status === "Descartado";
    const location = [c.city, c.department].filter(Boolean).join(", ") || "—";
    const availability =
      String(c.availabilityDate || "").trim() === todayYmd || !c.availabilityDate
        ? c.availabilityDate
          ? String(c.availabilityDate)
          : "—"
        : String(c.availabilityDate);
    const availLabel =
      c.availabilityDate && String(c.availabilityDate).slice(0, 10) <= todayYmd
        ? "Disponibilidad inmediata"
        : availability !== "—"
          ? `Disponible ${availability}`
          : "Disponibilidad —";
    const timelineSteps = activePipeline
      .map((step, idx) => {
        const done = !isDiscarded && ((stageIdx >= 0 && idx < stageIdx) || status === "Contratado");
        const current = !isDiscarded && status === step;
        const when =
          step === "Recibido" && c.createdAt
            ? formatInterviewWhenDisplay(c.createdAt).split(",")[0] || ""
            : current && linkedInterviews[0]?.when
              ? formatInterviewWhenDisplay(linkedInterviews[0].when).split(",")[0] || ""
              : "";
        return `<li class="hiring-drawer__step${done ? " is-done" : ""}${current ? " is-current" : ""}">
          <span class="hiring-drawer__step-dot" aria-hidden="true"></span>
          <div><strong>${escapeHtml(step)}</strong>${when ? `<small>${escapeHtml(when)}</small>` : current ? "" : `<small class="muted">Pendiente</small>`}</div>
        </li>`;
      })
      .join("");
    const drawerTabs = [
      { id: "resumen", label: "Resumen" },
      { id: "timeline", label: "Timeline" },
      { id: "documentos", label: "Documentos" },
      { id: "notas", label: "Notas" },
      { id: "evaluaciones", label: "Evaluaciones" }
    ]
      .map(
        (t) =>
          `<button type="button" class="hiring-drawer__tab${drawerTab === t.id ? " is-active" : ""}" data-action="hiring-drawer-tab" data-tab="${escapeAttr(t.id)}" aria-selected="${drawerTab === t.id ? "true" : "false"}">${escapeHtml(t.label)}</button>`
      )
      .join("");
    const resumenPane = `<div class="hiring-drawer__pane${drawerTab === "resumen" ? "" : " hidden"}" data-drawer-pane="resumen">
        <dl class="hiring-drawer__facts">
          <div><dt>${IC.phone || ""} Teléfono</dt><dd>${escapeHtml(String(c.phone || "—"))}</dd></div>
          <div><dt>${IC.mail || ""} Correo</dt><dd>${escapeHtml(String(c.email || "—"))}</dd></div>
          <div><dt>${IC.globe || ""} Origen</dt><dd>${escapeHtml(String(c.source || "Portal"))}</dd></div>
          <div><dt>${IC.dollar || ""} Aspiración</dt><dd>$${parseNum(c.expectedSalary).toLocaleString("es-CO")}</dd></div>
          <div><dt>${IC.send || ""} Vacante</dt><dd>${escapeHtml(String(c.vacancyTitle || "—"))}</dd></div>
          <div><dt>${IC.star || ""} Experiencia</dt><dd>${expCargo} años</dd></div>
          <div><dt>${IC.graduation || ""} Educación</dt><dd>${escapeHtml(String(c.educationLevel || "—"))}</dd></div>
          <div><dt>${IC.badge || ""} Documento</dt><dd>${escapeHtml(String(c.documentType || "—"))} ${escapeHtml(String(c.idDoc || ""))}</dd></div>
        </dl>
      </div>`;
    const timelinePane = `<div class="hiring-drawer__pane${drawerTab === "timeline" ? "" : " hidden"}" data-drawer-pane="timeline">
        <ol class="hiring-drawer__timeline">${timelineSteps}</ol>
        ${isDiscarded ? `<p class="muted">Candidato descartado del proceso.</p>` : ""}
        ${
          hiringCanEdit
            ? `<label class="hiring-drawer__stage-select">${fieldLabel(IC.toggle, "Cambiar etapa")}
          <select class="hiring-status-select" data-action="candidate-status" data-id="${escapeAttr(String(c.id))}">${hiringPipelineSelectOptions(c.status)}</select>
        </label>`
            : ""
        }
      </div>`;
    const docsPane = `<div class="hiring-drawer__pane${drawerTab === "documentos" ? "" : " hidden"}" data-drawer-pane="documentos">
        <ul class="hiring-drawer__docs">
          <li>
            <span>${IC.file || ""} ${escapeHtml(cvLabel)}</span>
            <button type="button" class="btn btn-sm btn-action"${canDlCv ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}">${IC.download} Descargar</button>
          </li>
        </ul>
        <p class="muted">${canDlCv ? "Hoja de vida disponible para descarga." : "Este candidato aún no tiene CV descargable."}</p>
        ${
          linkedInterviews.length
            ? `<h5>Entrevistas</h5><ul class="hiring-drawer__docs">${linkedInterviews
                .slice(0, 4)
                .map(
                  (i) =>
                    `<li><span>${IC.calendar || ""} ${escapeHtml(formatInterviewWhenDisplay(i.when))} · ${escapeHtml(String(i.interviewer || "-"))}</span><button type="button" class="btn btn-sm btn-outline" data-action="view-interview" data-id="${escapeAttr(String(i.id))}">${IC.eye}</button></li>`
                )
                .join("")}</ul>`
            : ""
        }
      </div>`;
    const notesPane = `<div class="hiring-drawer__pane${drawerTab === "notas" ? "" : " hidden"}" data-drawer-pane="notas">
        <p class="muted">${escapeHtml(String(c.experienceNotes || c.notes || "").trim() || "Sin notas registradas para este candidato.")}</p>
      </div>`;
    const evalPane = `<div class="hiring-drawer__pane${drawerTab === "evaluaciones" ? "" : " hidden"}" data-drawer-pane="evaluaciones">
        <p class="muted">Las evaluaciones formales se registrarán en una próxima iteración. Use entrevistas y notas mientras tanto.</p>
      </div>`;
    const email = String(c.email || "").trim();
    candidateDrawerHtml = `<aside class="hiring-drawer" aria-label="Detalle del candidato">
      <button type="button" class="hiring-drawer__close" data-action="hiring-drawer-close" title="Cerrar ficha" aria-label="Cerrar ficha">${IC.x || "×"}</button>
      <div class="hiring-drawer__profile">
        <span class="hiring-browse-avatar hiring-browse-avatar--lg" aria-hidden="true">${escapeHtml(hiringPersonInitialsFromName(displayName))}</span>
        <div>
          <h3 title="${escapeAttr(displayName)}">${escapeHtml(displayName)}</h3>
          <p>${escapeHtml(String(c.vacancyTitle || "Sin vacante"))}</p>
          <span class="status ${statusClass}">${escapeHtml(status)}</span>
        </div>
        <ul class="hiring-drawer__side-meta">
          <li>${IC.star || ""} ${expCargo} años exp.</li>
          <li>${IC.mapPin || ""} ${escapeHtml(location)}</li>
          <li>${IC.cake || ""} ${ageInfo.age != null ? `${ageInfo.age} años` : "Edad —"}</li>
          <li>${IC.clock || ""} ${escapeHtml(availLabel)}</li>
          <li>${IC.file || ""} CV ${canDlCv ? "disponible" : "pendiente"}</li>
        </ul>
      </div>
      <div class="hiring-drawer__main">
        <div class="hiring-drawer__tabs" role="tablist">${drawerTabs}</div>
        ${resumenPane}${timelinePane}${docsPane}${notesPane}${evalPane}
      </div>
      <div class="hiring-drawer__actions">
        <button type="button" class="btn btn-outline" data-action="view-candidate" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver ficha completa</button>
        <button type="button" class="btn btn-outline"${canDlCv ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}">${IC.file} Ver CV</button>
        ${
          email
            ? `<a class="btn btn-outline" href="mailto:${escapeAttr(email)}">${IC.mail} Enviar mensaje</a>`
            : `<button type="button" class="btn btn-outline" disabled>${IC.mail} Enviar mensaje</button>`
        }
        ${
          canScheduleInterview
            ? `<button type="button" class="btn btn-primary" data-action="schedule-interview-for-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.calendar} Entrevista</button>`
            : ""
        }
        ${
          hiringCanEdit
            ? `<button type="button" class="btn btn-action" data-action="create-employee-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.userPlus} Contratar</button>`
            : ""
        }
        ${hiringCanEdit ? `<button type="button" class="btn btn-outline" data-action="edit-candidate" data-id="${escapeAttr(String(c.id))}">${IC.edit} Editar</button>` : ""}
        ${
          hiringCanEdit && employeeMatch
            ? `<button type="button" class="btn btn-outline" data-action="generate-contract-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.file} Contrato</button>`
            : ""
        }
        ${hiringCanDelete ? `<button type="button" class="btn btn-reject" data-action="delete-candidate" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash}</button>` : ""}
      </div>
    </aside>`;
  }

  const tCand = sortedCandidatesView.length
    ? candidateView === "board"
      ? `<div class="hiring-candidates-board-wrap">${candBoard}${candidateDrawerHtml}</div>`
      : `<div class="hiring-pipeline">
        <aside class="hiring-pipeline__rail" aria-label="Pipeline de selección">
          <div class="hiring-pipeline__rail-head">
            <p>Pipeline de selección</p>
            <span>${sortedCandidatesView.length}</span>
          </div>
          <div class="hiring-pipeline__list">${pipelineListItems}</div>
        </aside>
        <div class="hiring-pipeline__detail">${pipelineDetailHtml}</div>
      </div>`
    : hiringEmptyState(
        candidateFilter === "finalized" ? "Sin candidatos finalizados" : "Sin candidatos en esta vista",
        { action: "hiring-operate-section", section: "candidate", label: "Registrar candidato" }
      );
  const tInt = interviewCards
    ? `<div class="hiring-browse-list hiring-browse-list--interviews">${interviewCards}</div>`
    : hiringEmptyState("Sin entrevistas", { action: "hiring-operate-section", section: "interview", label: "Programar entrevista" });
  const tCon = contractCards
    ? `<div class="hiring-browse-list hiring-browse-list--contracts">${contractCards}</div>`
    : hiringEmptyState("Sin contratos", { action: "hiring-operate-section", section: "contract", label: "Generar contrato" });
  const hiringModuleHead = renderHiringModuleHead({
    openVacancies: openVacancies.length,
    activeCandidates: activeCandidates.length,
    urgentItems,
    contractsThisMonth: contractsThisMonth.length,
    candidateConversion,
    hiredCandidates,
    totalCandidates: candidates.length,
    receivedCandidates,
    interviewsPending,
    slim: hiringWorkspace === "data"
  });
  const hiringOperateNav = renderHiringOperateSectionNav(hiringOperateSection);
  const hiringOperatePaneHidden = (section) => hiringOperateSection !== section;
  const hiringOperatePane = (section, body) =>
    `<div class="auth-tab-panel${hiringOperatePaneHidden(section) ? " hidden" : ""}" data-hiring-operate-pane="${section}"${hiringOperatePaneHidden(section) ? " hidden" : ""} aria-hidden="${hiringOperatePaneHidden(section) ? "true" : "false"}">${body}</div>`;
  const hiringOperatePositionPane = hiringOperatePane(
    "position",
    createHrActionCard("create-position", "briefcase", "Definir cargo", "Catálogo salarial, jornada y plantilla de contrato sugerida", fPosition, "Abrir formulario", { createPanels: hiringCreateUi })
  );
  const hiringOperateVacancyPane = hiringOperatePane(
    "vacancy",
    createHrActionCard("create-vacancy", "plus", "Publicar vacante", "Vacante visible para postulaciones internas o externas", fVac, "Abrir formulario", { createPanels: hiringCreateUi })
  );
  const hiringOperateCandidatePane = hiringOperatePane(
    "candidate",
    createHrActionCard("create-candidate", "userPlus", "Agregar candidato", "Hoja de vida, vacante y seguimiento del pipeline", fCand, "Abrir formulario", { createPanels: hiringCreateUi })
  );
  const hiringOperateInterviewPane = hiringOperatePane(
    "interview",
    createHrActionCard("create-interview", "calendar", "Programar entrevista", "Fecha, hora y responsable del proceso", fInt, "Abrir formulario", { createPanels: hiringCreateUi })
  );
  const hiringOperateContractPane = hiringOperatePane(
    "contract",
    createHrActionCard("create-contract", "file", "Generar contrato (Word)", "Plantilla según cargo y tipo de vinculación colombiana", fCon, "Abrir formulario", { createPanels: hiringCreateUi })
  );
  const hiringRailCollapsed = isOperateRailCollapsed("hiring");
  const hiringExecutionBlock = `<section class="hiring-operate hiring-operate-panel${hiringRailCollapsed ? " is-rail-collapsed" : ""}">
      <aside class="hiring-operate__rail" aria-label="Trámites de registro">
        <div class="hiring-operate__rail-head">
          <p class="hiring-operate__rail-label">Tipo de trámite</p>
          <button type="button" class="hiring-operate__rail-toggle" data-action="hiring-operate-rail-toggle" aria-expanded="${hiringRailCollapsed ? "false" : "true"}" title="${hiringRailCollapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite"}">
            <span class="hiring-operate__rail-toggle-ico" aria-hidden="true">${IC.chevronLeft}</span>
          </button>
        </div>
        ${hiringOperateNav}
      </aside>
      <div class="hiring-operate__main auth-tab-panels">${hiringOperatePositionPane}${hiringOperateVacancyPane}${hiringOperateCandidatePane}${hiringOperateInterviewPane}${hiringOperateContractPane}</div>
    </section>`;
  const pipelineStagePills = [
    { id: "", label: "Todas las etapas" },
    ...PIPELINE.filter((s) => (candidateFilter === "active" ? !["Contratado", "Descartado"].includes(s) : true)).map((s) => ({
      id: s,
      label: `${s}${pipelineStageCounts[s] ? ` (${pipelineStageCounts[s]})` : ""}`
    }))
  ]
    .map(
      (s) =>
        `<button type="button" class="hiring-stage-filter${pipelineStageFilter === s.id ? " is-active" : ""}" data-action="hiring-pipeline-stage" data-stage="${escapeAttr(s.id)}">${escapeHtml(s.label)}</button>`
    )
    .join("");
  const vacancyFilterOptions = [
    `<option value="">Todas las vacantes</option>`,
    ...vacancies.map(
      (v) =>
        `<option value="${escapeAttr(String(v.id))}"${vacancyIdFilter === String(v.id) ? " selected" : ""}>${escapeHtml(String(v.title || v.positionName || "Vacante"))}</option>`
    )
  ].join("");
  const hiringQuickBarCandidates = `<div class="hiring-selection-toolbar">
      <div class="payroll-quick-bar hiring-selection-toolbar__scope" role="group" aria-label="Alcance de candidatos">
        <button type="button" class="payroll-quick-pill${candidateFilter === "active" ? " is-active" : ""}" data-action="hiring-candidates-active">En proceso</button>
        <button type="button" class="payroll-quick-pill${candidateFilter === "finalized" ? " is-active" : ""}" data-action="hiring-candidates-finalized">Cerrados</button>
        <button type="button" class="payroll-quick-pill${candidateFilter === "all" ? " is-active" : ""}" data-action="hiring-candidates-all">Todos</button>
      </div>
      <label class="hiring-selection-toolbar__select">
        <span class="sr-only">Filtrar por vacante</span>
        <select data-action="hiring-filter-vacancy" aria-label="Filtrar por vacante">${vacancyFilterOptions}</select>
      </label>
      <label class="hiring-selection-toolbar__select">
        <span class="sr-only">Ordenar candidatos</span>
        <select data-action="hiring-sort-candidates-select" aria-label="Ordenar candidatos">
          <option value="recent"${candidateSort === "recent" ? " selected" : ""}>Ordenar por: Más recientes</option>
          <option value="experience"${candidateSort === "experience" ? " selected" : ""}>Ordenar por: Experiencia</option>
          <option value="pipeline"${candidateSort === "pipeline" ? " selected" : ""}>Ordenar por: Etapa</option>
        </select>
      </label>
      <div class="payroll-quick-bar hiring-selection-toolbar__view" role="group" aria-label="Vista del pipeline">
        <button type="button" class="payroll-quick-pill${candidateView === "board" ? " is-active" : ""}" data-action="hiring-candidates-view" data-view="board">Tablero</button>
        <button type="button" class="payroll-quick-pill${candidateView === "list" ? " is-active" : ""}" data-action="hiring-candidates-view" data-view="list">Lista</button>
      </div>
      ${candidateView === "list" ? `<div class="hiring-stage-filters" role="group" aria-label="Filtrar por etapa del pipeline">${pipelineStagePills}</div>` : ""}
    </div>`;
  const hiringQuickBarVacancies = `<div class="payroll-quick-bar" role="group" aria-label="Filtros de vacantes">
      <button type="button" class="payroll-quick-pill${vacancyFilter === "open" ? " is-active" : ""}" data-action="hiring-vacancies-open">Solo abiertas</button>
      <button type="button" class="payroll-quick-pill${vacancyFilter === "all" ? " is-active" : ""}" data-action="hiring-vacancies-all">Todas</button>
    </div>`;
  const hiringQuickBarPositions = `<div class="hiring-selection-toolbar">
      <div class="payroll-quick-bar hiring-selection-toolbar__scope" role="group" aria-label="Estado de cargos">
        <button type="button" class="payroll-quick-pill${positionFilter === "active" ? " is-active" : ""}" data-action="hiring-positions-active">Activos</button>
        <button type="button" class="payroll-quick-pill${positionFilter === "inactive" ? " is-active" : ""}" data-action="hiring-positions-inactive">Inactivos</button>
        <button type="button" class="payroll-quick-pill${positionFilter === "all" ? " is-active" : ""}" data-action="hiring-positions-all">Todos</button>
      </div>
      <div class="payroll-quick-bar" role="group" aria-label="Rol del cargo">
        <button type="button" class="payroll-quick-pill${positionRoleFilter === "all" ? " is-active" : ""}" data-action="hiring-positions-role" data-role="all">Todos los roles</button>
        <button type="button" class="payroll-quick-pill${positionRoleFilter === "empleado" ? " is-active" : ""}" data-action="hiring-positions-role" data-role="empleado">Empleado</button>
        <button type="button" class="payroll-quick-pill${positionRoleFilter === "conductor" ? " is-active" : ""}" data-action="hiring-positions-role" data-role="conductor">Conductor</button>
      </div>
    </div>`;
  const browseTabs = [
    { id: "candidates", label: "Candidatos", count: sortedCandidates.length, icon: "user", hint: "Pipeline de selección" },
    { id: "vacancies", label: "Vacantes", count: filteredVacancies.length, icon: "send", hint: "Ofertas publicadas" },
    { id: "positions", label: "Cargos", count: positions.length, icon: "briefcase", hint: "Catálogo salarial" },
    { id: "interviews", label: "Agenda", count: interviews.length, icon: "calendar", hint: "Entrevistas" },
    { id: "contracts", label: "Contratos", count: contracts.length, icon: "file", hint: "Documentos Word" }
  ];
  const hiringDataNav = `<nav class="hiring-browse__tabs hiring-browse__tabs--secondary" role="tablist" aria-label="Consultas de contratación">
    ${browseTabs
      .map((t) => {
        const active = hiringDataSection === t.id;
        const ico = IC[t.icon] || "";
        return `<button type="button" role="tab" class="hiring-browse__tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="hiring-data-section" data-section="${escapeAttr(t.id)}" title="${escapeAttr(t.hint)}">
          <span class="hiring-browse__tab-ico" aria-hidden="true">${ico}</span>
          <span class="hiring-browse__tab-copy"><span>${escapeHtml(t.label)}</span><small>${escapeHtml(t.hint)}</small></span>
          <span class="hiring-browse__tab-count">${escapeHtml(String(t.count))}</span>
        </button>`;
      })
      .join("")}
  </nav>`;
  const hiringDataFilters =
    hiringDataSection === "candidates"
      ? hiringQuickBarCandidates
      : hiringDataSection === "vacancies"
        ? hiringQuickBarVacancies
        : hiringDataSection === "positions"
          ? hiringQuickBarPositions
          : "";
  const hiringMetaVacancies = `<p class="hiring-browse__meta" title="Vacantes según filtros y búsqueda"><strong>${filteredVacanciesView.length}</strong>${dataListSearch ? ` <span>· ${filteredVacancies.length}</span>` : ""} <span>/ ${vacancies.length}</span> vacantes</p>`;
  const hiringMetaInterviews = `<p class="hiring-browse__meta" title="Entrevistas registradas"><strong>${interviewsView.length}</strong>${dataListSearch ? ` <span>· ${interviews.length}</span>` : ""} entrevistas programadas</p>`;
  const hiringMetaContracts = `<p class="hiring-browse__meta" title="Contratos en el listado y firmados este mes"><strong>${contractsView.length}</strong>${dataListSearch ? ` <span>· ${contracts.length}</span>` : ""} contratos · <strong>${contractsThisMonth.length}</strong> este mes</p>`;
  const inactivePositionsCount = positions.filter((p) => p.active === false).length;
  const driverPositionsCount = positions.filter((p) => String(p.workerRole || "").toLowerCase() === "conductor").length;
  const employeePositionsCount = positions.length - driverPositionsCount;
  const positionsWithVacancy = positions.filter((p) =>
    vacancies.some((v) => String(v.positionId || "") === String(p.id))
  ).length;
  const bandejaCreateActions = hiringCanEdit
    ? `<div class="hiring-bandeja__actions">
        <button type="button" class="btn btn-outline" data-action="hiring-open-create" data-section="position">${IC.briefcase} Nuevo cargo</button>
        <button type="button" class="btn btn-outline" data-action="hiring-open-create" data-section="vacancy">${IC.plus} Nueva vacante</button>
        <button type="button" class="btn btn-primary" data-action="hiring-open-create" data-section="candidate">${IC.plus} Nuevo candidato</button>
      </div>`
    : "";
  const bandejaKpis = `<ul class="hiring-bandeja__kpis" aria-label="Indicadores de selección">
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--users" aria-hidden="true">${IC.users || ""}</span><div><small>Candidatos</small><strong>${candidates.length}</strong></div></li>
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--brief" aria-hidden="true">${IC.briefcase || ""}</span><div><small>Vacantes</small><strong>${openVacancies.length}</strong></div></li>
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--cal" aria-hidden="true">${IC.calendar || ""}</span><div><small>Entrevistas hoy</small><strong>${interviewsToday}</strong></div></li>
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--ok" aria-hidden="true">${IC.file || ""}</span><div><small>Contrataciones</small><strong>${hiredCandidates}</strong></div></li>
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--warn" aria-hidden="true">${IC.clock || ""}</span><div><small>Pendientes</small><strong>${receivedCandidates}</strong></div></li>
    </ul>`;
  const cargosKpis = `<ul class="hiring-bandeja__kpis" aria-label="Indicadores del catálogo de cargos">
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--brief" aria-hidden="true">${IC.briefcase || ""}</span><div><small>Cargos</small><strong>${positions.length}</strong></div></li>
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--ok" aria-hidden="true">${IC.check || ""}</span><div><small>Activos</small><strong>${activePositions.length}</strong></div></li>
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--users" aria-hidden="true">${IC.user || ""}</span><div><small>Empleado</small><strong>${employeePositionsCount}</strong></div></li>
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--cal" aria-hidden="true">${IC.truck || ""}</span><div><small>Conductor</small><strong>${driverPositionsCount}</strong></div></li>
      <li class="hiring-bandeja__kpi"><span class="hiring-bandeja__kpi-ico hiring-bandeja__kpi-ico--warn" aria-hidden="true">${IC.send || ""}</span><div><small>Con vacante</small><strong>${positionsWithVacancy}</strong></div></li>
    </ul>`;
  const bandejaTopbar = `<header class="hiring-bandeja__topbar">
      <div class="hiring-bandeja__titles">
        <h3>Bandeja de selección</h3>
        <p>Gestiona y da seguimiento a los candidatos en cada etapa del proceso.</p>
      </div>
      <label class="hiring-bandeja__search">
        <span class="hiring-bandeja__search-ico" aria-hidden="true">${IC.search || ""}</span>
        <input type="search" data-action="hiring-data-list-search" data-hiring-search-focus value="${escapeAttr(dataListSearchRaw)}" placeholder="Buscar candidatos..." autocomplete="off" />
        <kbd class="hiring-bandeja__kbd">${escapeHtml(shortcutHint)}</kbd>
      </label>
      ${bandejaCreateActions}
    </header>`;
  const cargosCreateActions = hiringCanEdit
    ? `<div class="hiring-bandeja__actions">
        <button type="button" class="btn btn-primary" data-action="hiring-open-create" data-section="position">${IC.plus} Nuevo cargo</button>
        <button type="button" class="btn btn-outline" data-action="hiring-open-create" data-section="vacancy">${IC.send} Nueva vacante</button>
      </div>`
    : "";
  const cargosTopbar = `<header class="hiring-bandeja__topbar">
      <div class="hiring-bandeja__titles">
        <h3>Catálogo de cargos</h3>
        <p>Define salarios, jornada y plantilla contractual que alimentan vacantes y contrataciones.</p>
      </div>
      <label class="hiring-bandeja__search">
        <span class="hiring-bandeja__search-ico" aria-hidden="true">${IC.search || ""}</span>
        <input type="search" data-action="hiring-data-list-search" value="${escapeAttr(dataListSearchRaw)}" placeholder="Buscar cargos..." autocomplete="off" />
        <kbd class="hiring-bandeja__kbd">${escapeHtml(shortcutHint)}</kbd>
      </label>
      ${cargosCreateActions}
    </header>`;
  const hiringCandidatesPane = `<div class="payroll-data-pane hiring-browse__pane${hiringDataSection === "candidates" ? "" : " hidden"}" data-hiring-section="candidates">
      ${bandejaTopbar}
      ${bandejaKpis}
      ${hiringDataFilters ? `<div class="hiring-browse__filters">${hiringDataFilters}</div>` : ""}
      ${tCand}
    </div>`;
  const hiringVacanciesPane = `<div class="payroll-data-pane hiring-browse__pane${hiringDataSection === "vacancies" ? "" : " hidden"}" data-hiring-section="vacancies">
      <label class="hiring-browse__search hiring-browse__search--inline">
        <span class="hiring-browse__search-ico" aria-hidden="true">${IC.search || ""}</span>
        <input type="search" data-action="hiring-data-list-search" value="${escapeAttr(dataListSearchRaw)}" placeholder="Buscar vacantes…" autocomplete="off" />
      </label>
      ${hiringDataFilters ? `<div class="hiring-browse__filters">${hiringDataFilters}</div>` : ""}
      ${hiringMetaVacancies}
      ${tVac}
    </div>`;
  const hiringInterviewsPane = `<div class="payroll-data-pane hiring-browse__pane${hiringDataSection === "interviews" ? "" : " hidden"}" data-hiring-section="interviews">
      ${hiringMetaInterviews}
      ${tInt}
    </div>`;
  const hiringContractsPane = `<div class="payroll-data-pane hiring-browse__pane${hiringDataSection === "contracts" ? "" : " hidden"}" data-hiring-section="contracts">
      ${hiringMetaContracts}
      ${tCon}
    </div>`;
  const hiringPositionsPane = `<div class="payroll-data-pane hiring-browse__pane${hiringDataSection === "positions" ? "" : " hidden"}" data-hiring-section="positions">
      ${cargosTopbar}
      ${cargosKpis}
      ${hiringDataFilters ? `<div class="hiring-browse__filters">${hiringDataFilters}</div>` : ""}
      <p class="hiring-browse__meta" title="Cargos visibles según filtros y búsqueda"><strong>${positionsView.length}</strong>${dataListSearch ? ` <span>· ${positionsScoped.length}</span>` : ""} <span>/ ${positions.length}</span> cargos · <strong>${inactivePositionsCount}</strong> inactivos</p>
      ${tPos}
    </div>`;
  const hiringDataBlock = `<section class="hiring-browse hiring-data-panel hiring-bandeja">
      ${hiringDataNav}
      <div class="payroll-data-panes hiring-browse__panes">${hiringCandidatesPane}${hiringVacanciesPane}${hiringInterviewsPane}${hiringContractsPane}${hiringPositionsPane}</div>
    </section>`;
  const hiringTabsNav = renderHrWorkspaceTabs({
    module: "hiring",
    ariaLabel: "Secciones del módulo Contratación",
    activeId: hiringWorkspace,
    variant: "switch",
    tabs: [
      { id: "data", label: "Selección", icon: "users", hint: "Pipeline y seguimiento" },
      { id: "operate", label: "Registrar", icon: "plus", hint: "Altas y formularios" }
    ]
  });
  const hiringWorkspaceHeader = renderHrWorkspaceHeader(hiringModuleHead, hiringTabsNav, "hiring");
  const hiringDataPanel = `<div class="hr-workspace-panel payroll-workspace-panel${hiringWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-hiring-panel="data">
      ${hiringDataBlock}
    </div>`;
  const hiringOperatePanel = `<div class="hr-workspace-panel payroll-workspace-panel${hiringWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-hiring-panel="operate">
      ${hiringExecutionBlock}
    </div>`;
  return `<section class="hiring-studio hiring-shell hiring-shell--workspace hr-flow-shell" data-hr-workspace="${escapeAttr(hiringWorkspace)}">${hiringWorkspaceHeader}
      <div class="hr-workspace-panels">
        ${hiringDataPanel}
        ${hiringOperatePanel}
      </div>
    </section>`;
}

/** Postulación web (API/R2): adjuntos_json con kind cv_file | cv_blob | cv_filename · Local: solo nombres o cv_blob desde RRHH. */

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ hiringHtml });
})();
