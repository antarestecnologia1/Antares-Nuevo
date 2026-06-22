/**
 * Contratación — HTML de la vista (hiringHtml).
 */
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
    workspace: "operate"
  };
  const candidateFilter = String(hiringUi.candidateFilter || "active");
  const vacancyFilter = String(hiringUi.vacancyFilter || "open");
  const candidateSort = String(hiringUi.candidateSort || "recent");
  const hiringWorkspace = normalizeHrWorkspace("hiring", hiringUi.workspace);
  const hiringOperateSection = normalizeHiringOperateSection(hiringUi.operateSection);
  const hiringDataSection = normalizeHiringDataSection(hiringUi.dataSection);
  const hiringCreateUi = buildHiringCreatePanelsState(hiringOperateSection, state.createPanels || {});
  const dataListSearchRaw = String(hiringUi.dataListSearch || "");
  const dataListSearch = dataListSearchRaw.trim().toLowerCase();
  const hiringDataMatches = (blob) => !dataListSearch || String(blob || "").toLowerCase().includes(dataListSearch);
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
  const positionsView = dataListSearch
    ? positions.filter((p) =>
        hiringDataMatches(
          `${p.name} ${p.workerRole} ${p.contractTypeDefault} ${p.legalBasis} ${parseNum(p.baseSalary)}`
        )
      )
    : positions;
  const positionRows = positionsView
    .map((p) => `<tr class="hiring-table-row hiring-table-row--position">
      <td class="hiring-table-cell-main"><div class="hiring-table-primary"><strong>${escapeHtml(String(p.name || ""))}</strong><span>Catálogo base de contratación</span></div></td>
      <td>${p.workerRole === "conductor" ? "Conductor" : "Empleado"}</td>
      <td>$${parseNum(p.baseSalary).toLocaleString("es-CO")}</td>
      <td>$${readPositionTransportAllowanceCop(p).toLocaleString("es-CO")}</td>
      <td>${String(p.integralSalary) === "true" || p.integralSalary === true ? "Sí" : "No"}</td>
      <td>${escapeHtml(String(p.contractTypeDefault || "-"))}</td>
      <td>${escapeHtml(String(p.legalBasis || "CST"))}</td>
      <td>${p.active === false ? '<span class="status status-rechazada">Inactivo</span>' : '<span class="status status-viaje_asignado">Activo</span>'}</td>
      <td class="hiring-table-cell-actions"><div class="toolbar hiring-table-actions">
        <button class="btn btn-sm btn-outline" data-action="view-position" data-id="${escapeAttr(String(p.id))}">${IC.eye} Ver</button>
        ${positionCanEdit ? `<button class="btn btn-sm btn-action" data-action="edit-position" data-id="${escapeAttr(String(p.id))}">${IC.edit} Editar</button>` : ""}
        <button class="btn btn-sm btn-action" data-action="toggle-position" data-id="${escapeAttr(String(p.id))}">${IC.toggle} Estado</button>
        ${positionCanDelete ? `<button class="btn btn-sm btn-reject" data-action="delete-position" data-id="${escapeAttr(String(p.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`)
    .join("");

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
  const sortedCandidatesView = dataListSearch
    ? sortedCandidates.filter((c) =>
        hiringDataMatches(
          `${c.name} ${c.email} ${c.phone} ${c.vacancyTitle} ${c.status} ${c.idDoc} ${c.city} ${c.address} ${c.source}`
        )
      )
    : sortedCandidates;
  const vacRows = filteredVacanciesView
    .map((v) => {
      const delCell = vacancyCanDelete
        ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-vacancy" data-id="${escapeAttr(String(v.id))}" title="Solo administradores del sistema">${IC.trash} Eliminar</button>`
        : `<span class="muted" title="Eliminar solo con rol administrador">—</span>`;
      const statusHtml =
        v.status === "Publicada"
          ? '<span class="status status-viaje_asignado">Publicada</span>'
          : '<span class="status status-rechazada">Cerrada</span>';
      return `<tr class="hiring-table-row hiring-table-row--vacancy">
      <td class="hiring-table-cell-main"><div class="hiring-table-primary"><strong>${escapeHtml(String(v.title || ""))}</strong><span>Publicación de vacante</span></div></td>
      <td>${escapeHtml(String(v.positionName || "-"))}</td>
      <td>${escapeHtml(String(v.city || "-"))} · ${escapeHtml(String(v.modality || "-"))}</td>
      <td>${escapeHtml(String(v.openings ?? 1))}</td>
      <td>$${parseNum(v.salaryOffer).toLocaleString("es-CO")}</td>
      <td>${escapeHtml(String(v.deadline || "-"))}</td>
      <td>${statusHtml}</td>
      <td class="hiring-table-cell-actions"><div class="toolbar vacancy-row-actions hiring-table-actions">${[
        `<button type="button" class="btn btn-sm btn-outline" data-action="view-vacancy" data-id="${escapeAttr(String(v.id))}">${IC.eye} Ver</button>`,
        vacancyCanEdit ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-vacancy" data-id="${escapeAttr(String(v.id))}">${IC.edit} Editar</button>` : "",
        `<button type="button" class="btn btn-sm btn-action" data-action="close-vacancy" data-id="${escapeAttr(String(v.id))}">${IC.x} Cerrar</button>`,
        delCell
      ].filter(Boolean).join("")}</div></td>
    </tr>`;
    })
    .join("");
  const hiringCanEdit = canManageHiringModule();
  const hiringCanDelete = isAdminActor();
  const candRows = sortedCandidatesView
    .map((c) => {
      const ageInfo = portalCandidateAgeFromBirthIso(c.birthDate);
      const ageStr = ageInfo.age != null ? `${ageInfo.age} años` : "—";
      const expCargo = parseNum(c.experienceYears || 0);
      const cvDlRow = extractCandidateCvDownload(c);
      const canDlCv = Boolean(cvDlRow?.href) || candidateMayHaveCvInStorage(c);
      const canScheduleInterview = !["Contratado", "Descartado"].includes(String(c.status || ""));
      const statusClass = hiringPipelineStatusClass(c.status);
      const employeeMatch = findPayrollEmployeeByIdDoc(c.idDoc);
      return `<tr class="hiring-table-row hiring-table-row--candidate">
      <td class="hiring-table-cell-main"><div class="hiring-table-primary"><strong>${escapeHtml(String(c.name || ""))}</strong><span>Pipeline de selección</span></div></td>
      <td>${escapeHtml(String(c.email || ""))}<br><span class="muted">${escapeHtml(String(c.phone || "-"))}</span></td>
      <td>${escapeHtml(String(c.vacancyTitle || "-"))}</td>
      <td><strong>${expCargo} años</strong> en el cargo<br><span class="muted">Edad: ${escapeHtml(ageStr)} · Nac.: ${escapeHtml(ageInfo.birthLabel)}</span><br><span class="muted">Disp.: ${escapeHtml(String(c.availabilityDate || "-"))}</span></td>
      <td><span class="muted">${escapeHtml(String(c.source || "Portal"))}</span></td>
      <td><span class="status ${statusClass}">${escapeHtml(String(c.status || ""))}</span></td>
      <td><select class="hiring-status-select" data-action="candidate-status" data-id="${escapeAttr(String(c.id))}">${hiringPipelineSelectOptions(c.status)}</select></td>
      <td class="hiring-table-cell-actions"><div class="toolbar hiring-table-actions">
        <button class="btn btn-sm btn-outline" data-action="view-candidate" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
        ${
          canScheduleInterview
            ? `<button type="button" class="btn btn-sm btn-action" data-action="schedule-interview-for-candidate" data-candidate-id="${escapeAttr(String(c.id))}" title="Abrir formulario de entrevista con fecha y hora">${IC.calendar} Entrevista</button>`
            : ""
        }
        <button type="button" class="btn btn-sm btn-action"${canDlCv ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}" title="${canDlCv ? "Descargar CV" : "Sin CV disponible"}">${IC.download} Descargar CV</button>
        ${
          hiringCanEdit
            ? `<button type="button" class="btn btn-sm btn-action" data-action="create-employee-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}" title="Alta en Gestión humana con datos precargados">${IC.userPlus} Empleado</button>`
            : ""
        }
        ${
          hiringCanEdit && employeeMatch
            ? `<button type="button" class="btn btn-sm btn-action" data-action="generate-contract-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}" title="Generar contrato Word">${IC.file} Contrato</button>`
            : ""
        }
        ${hiringCanEdit ? `<button class="btn btn-sm btn-action" data-action="edit-candidate" data-id="${escapeAttr(String(c.id))}">${IC.edit} Editar</button>` : ""}
        ${hiringCanDelete ? `<button class="btn btn-sm btn-reject" data-action="delete-candidate" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`;
    })
    .join("");
  const candCards = sortedCandidatesView
    .map((c) => {
      const cvDlRow = extractCandidateCvDownload(c);
      const canDlCv = Boolean(cvDlRow?.href) || candidateMayHaveCvInStorage(c);
      const canScheduleInterview = !["Contratado", "Descartado"].includes(String(c.status || ""));
      return renderHiringCandidateCard(c, {
        canEdit: hiringCanEdit,
        canDelete: hiringCanDelete,
        canScheduleInterview,
        canDlCv
      });
    })
    .join("");
  const interviewsView = dataListSearch
    ? interviews.filter((i) =>
        hiringDataMatches(
          `${i.candidateName} ${i.when} ${i.mode || ""} ${i.modality || ""} ${i.place} ${i.interviewer}`
        )
      )
    : interviews;
  const interviewRows = interviewsView
    .map((i) => `<tr class="hiring-table-row hiring-table-row--interview">
      <td class="hiring-table-cell-main"><div class="hiring-table-primary"><strong>${escapeHtml(String(i.candidateName || "-"))}</strong><span>Entrevista agendada</span></div></td>
      <td>${escapeHtml(formatInterviewWhenDisplay(i.when))}</td>
      <td>${escapeHtml(formatInterviewModeLabel(i.mode || i.modality))}<br><span class="muted">${escapeHtml(String(i.place || "-"))}</span></td>
      <td>${escapeHtml(String(i.interviewer || "-"))}</td>
      <td class="hiring-table-cell-actions"><div class="toolbar hiring-table-actions">
        <button class="btn btn-sm btn-outline" data-action="view-interview" data-id="${escapeAttr(String(i.id))}">${IC.eye} Ver</button>
        ${hiringCanEdit ? `<button class="btn btn-sm btn-action" data-action="edit-interview" data-id="${escapeAttr(String(i.id))}">${IC.edit} Editar</button>` : ""}
        ${hiringCanDelete ? `<button class="btn btn-sm btn-reject" data-action="delete-interview" data-id="${escapeAttr(String(i.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`)
    .join("");
  const contractsView = dataListSearch
    ? contracts.filter((c) =>
        hiringDataMatches(
          `${c.candidateName} ${c.employeeName} ${c.position} ${c.positionName} ${c.contractType} ${c.source} ${c.sourceTag}`
        )
      )
    : contracts;
  const contractRows = contractsView
    .map((c) => `<tr class="hiring-table-row hiring-table-row--contract">
      <td class="hiring-table-cell-main"><div class="hiring-table-primary"><strong>${escapeHtml(String(c.candidateName || c.employeeName || "-"))}</strong><span>${escapeHtml(String(c.source || c.sourceTag || (c.employeeId ? "Empleado" : "Candidato")))}</span></div></td>
      <td>${escapeHtml(String(c.position || c.positionName || ""))}</td>
      <td>$${parseNum(c.salary).toLocaleString("es-CO")}</td>
      <td>${escapeHtml(String(c.contractType || "-"))}</td>
      <td>${fmtDateOr(c.startDate, "—")}</td>
      <td>${fmtDateOr(c.renewalDate, "—")}</td>
      <td>${fmtDateOr(c.endDate, "—")}</td>
      <td>${escapeHtml(String(c.source || c.sourceTag || (c.employeeId ? "Empleado" : "Candidato")))}</td>
      <td class="hiring-table-cell-actions"><div class="toolbar hiring-table-actions">
        <button class="btn btn-sm btn-outline" data-action="view-contract-detail" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
        <button class="btn btn-sm btn-action" data-action="view-contract" data-id="${escapeAttr(String(c.id))}" title="Descargar Word">${IC.download} Word</button>
        ${hiringCanDelete ? `<button class="btn btn-sm btn-reject" data-action="delete-contract" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`)
    .join("");

  const arlRiskOpts = selectOptionsFromCatalog(CO_CATALOGS.arlRiskLevels);
  const workScheduleOpts = selectOptionsFromCatalog(CO_CATALOGS.workSchedule);
  const fPosition = `<form id="form-position" class="p-form p-form-colored hr-form-flow hr-form-compact">
    ${renderHrFormHero({
      eyebrow: "Catálogo base",
      title: "Defina el cargo con más contexto",
      description: "Aproveche el panel independiente para comparar salario, jornada, riesgo y base legal sin que el formulario se sienta comprimido.",
      tone: "hiring",
      badges: [
        renderHrFormHeroBadge("Cargo", "maestro"),
        renderHrFormHeroBadge("ARL", "riesgo"),
        renderHrFormHeroBadge("Contrato", "referencia")
      ]
    })}
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
    ${renderHrFormHero({
      eyebrow: "Publicación",
      title: "Vacantes con layout más amplio",
      description: "Visualice cargo, ciudad, modalidad y requisitos en un bloque más cómodo para publicar sin repetir información.",
      tone: "hiring",
      badges: [
        renderHrFormHeroBadge("Ubicación", "departamento y ciudad"),
        renderHrFormHeroBadge("Cupos", "controlados"),
        renderHrFormHeroBadge("Requisitos", "visibles")
      ]
    })}
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
      </div>
    </fieldset>
    ${renderManagedCreateFormActions("create-vacancy", `<button class="btn btn-primary" type="submit">${IC.plus} Publicar vacante</button>`)}
  </form>`;
  const educationOptsCand = selectOptionsFromCatalog(CO_CATALOGS.educationLevel);
  const docTypeCand = CO_CATALOGS.documentTypes.map((d) => `<option value="${d}">${d === "CC" ? "Cédula de ciudadanía" : d === "CE" ? "Cédula de extranjería" : d === "PAS" ? "Pasaporte" : d === "PEP" ? "Permiso especial (PEP)" : "Tarjeta de identidad"}</option>`).join("");
  const fCand = `<form id="form-candidate" class="p-form p-form-colored hr-form-flow">
    ${renderHrFormHero({
      eyebrow: "Pipeline de selección",
      title: "Registro de candidato más cómodo",
      description: "Divida identidad y perfil profesional en pasos claros, con más ancho para datos personales, vacante y hoja de vida.",
      tone: "hiring",
      badges: [
        renderHrFormHeroBadge("2 pasos", "asistidos"),
        renderHrFormHeroBadge("CV", "adjuntos"),
        renderHrFormHeroBadge("Vacante", "relacionada")
      ]
    })}
    <div class="hr-form-wizard" data-hr-wizard="candidate" aria-label="Registro de candidato por pasos">
      <div class="hr-form-wizard-toolbar">
        <div>
          <p class="hr-form-wizard-kicker">Registro en dos pasos</p>
          <p class="hr-form-wizard-lead">Primero identidad y ubicación; luego perfil, vacante y adjuntos.</p>
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
        <label>${fieldLabel(IC.user, "Nombre completo")}<input name="name" required data-antares-restrict="person-name" data-antares-field="person-name" /></label>
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
  const fInt = `<form id="form-interview" class="p-form p-form-colored hr-form-flow hr-form-compact">
    ${renderHrFormHero({
      eyebrow: "Agenda",
      title: "Entrevistas rápidas de programar",
      description: "Con el formulario aislado, los datos clave de cita, modalidad y lugar quedan visibles en un solo bloque.",
      tone: "hiring",
      badges: [
        renderHrFormHeroBadge("Futura", "fecha y hora"),
        renderHrFormHeroBadge("Modalidad", "presencial o virtual"),
        renderHrFormHeroBadge("Notas", "previas")
      ]
    })}
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.calendar} Programación de entrevista</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.user, "Candidato (en proceso)")}<select name="candidateId" required><option value="">Seleccione</option>${candidatesForInterviewSelect
          .map(
            (c) =>
              `<option value="${escapeAttr(String(c.id))}">${escapeHtml(String(c.name || ""))} · ${escapeHtml(String(c.status || PIPELINE[0]))}</option>`
          )
          .join("")}</select><span class="muted" style="font-size:0.78rem;display:block;margin-top:4px">Solo candidatos que no están contratados ni descartados.</span></label>
        <label class="full">${fieldLabel(IC.calendar, "Fecha y hora")}<input type="datetime-local" name="when" required step="60" /><span class="muted" style="font-size:0.78rem;display:block;margin-top:4px">Elija día y hora en el control del navegador (se valida que sea una cita futura).</span></label>
        <label>${fieldLabel(IC.user, "Entrevistador")}<input name="interviewer" required placeholder="Nombre del entrevistador" /></label>
        <label>${fieldLabel(IC.globe, "Modalidad")}<select name="mode">
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
          <option value="telefonica">Telefónica</option>
        </select></label>
        <label class="full">${fieldLabel(IC.mapPin, "Lugar / Link")}<input name="place" placeholder="Sala 1 / link Google Meet / Teams..." /></label>
        <label class="full">${fieldLabel(IC.file, "Notas previas")}<textarea name="notes" rows="2"></textarea></label>
      </div>
    </fieldset>
    ${renderManagedCreateFormActions("create-interview", `<button class="btn btn-primary" type="submit">${IC.calendar} Guardar entrevista</button>`)}
  </form>`;
  const signDateDefault = colombiaTodayIsoDate();
  const candidatesForContractSelect = candidates.filter((c) => !["Descartado"].includes(String(c.status || "")));
  const fCon = `<form id="form-contract" class="p-form p-form-colored hr-form-flow">
    ${renderHrFormHero({
      eyebrow: "Formalización",
      title: "Generación de contrato con más aire visual",
      description: "Seleccione empleado, fecha y plantilla con mejor jerarquía antes de pasar a pruebas y descarga del documento Word.",
      tone: "hiring",
      badges: [
        renderHrFormHeroBadge("Empleado", "selección"),
        renderHrFormHeroBadge("Plantilla", "Word"),
        renderHrFormHeroBadge("2 pasos", "revisión")
      ]
    })}
    <div class="hr-form-wizard" data-hr-wizard="contract" aria-label="Generación de contrato por pasos">
      <div class="hr-form-wizard-toolbar">
        <div>
          <p class="hr-form-wizard-kicker">Contrato Word</p>
          <p class="hr-form-wizard-lead">Primero datos de firma; en el siguiente paso puede probar las plantillas.</p>
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

  const tPos = positionRows
    ? `<div class="table-wrap hiring-table-wrap hiring-table-wrap--positions"><table class="hiring-table hiring-table--positions"><thead><tr><th>Cargo</th><th>Rol</th><th>Salario</th><th>Auxilio transporte</th><th>Integral</th><th>Contrato</th><th>Base legal</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${positionRows}</tbody></table></div>`
    : hiringEmptyState("Sin cargos definidos", { action: "hiring-operate-section", section: "position", label: "Definir cargo" });
  const tVac = vacRows
    ? `<div class="table-wrap hiring-table-wrap hiring-table-wrap--vacancies"><table class="hiring-table hiring-table--vacancies"><thead><tr><th>Vacante</th><th>Cargo base</th><th>Ubicación</th><th>Cupos</th><th>Salario</th><th>Límite</th><th>Estado</th><th style="min-width:11rem">Acciones</th></tr></thead><tbody>${vacRows}</tbody></table></div>`
    : hiringEmptyState("Sin vacantes", { action: "hiring-operate-section", section: "vacancy", label: "Publicar vacante" });
  const tCand = candRows
    ? `<div class="hiring-cards hiring-cards--candidates">${candCards}</div><div class="hiring-table-desktop table-wrap hiring-table-wrap hiring-table-wrap--candidates"><table class="hiring-table hiring-table--candidates"><thead><tr><th>Candidato</th><th>Contacto</th><th>Vacante</th><th>Experiencia / edad</th><th>Origen</th><th>Estado</th><th>Cambiar</th><th>Acciones</th></tr></thead><tbody>${candRows}</tbody></table></div>`
    : hiringEmptyState(
        candidateFilter === "finalized" ? "Sin candidatos finalizados" : "Sin candidatos en esta vista",
        { action: "hiring-operate-section", section: "candidate", label: "Registrar candidato" }
      );
  const tInt = interviewRows
    ? `<div class="table-wrap hiring-table-wrap hiring-table-wrap--interviews"><table class="hiring-table hiring-table--interviews"><thead><tr><th>Candidato</th><th>Fecha y hora</th><th>Modalidad / lugar</th><th>Entrevistador</th><th>Acciones</th></tr></thead><tbody>${interviewRows}</tbody></table></div>`
    : hiringEmptyState("Sin entrevistas", { action: "hiring-operate-section", section: "interview", label: "Programar entrevista" });
  const tCon = contractRows
    ? `<div class="table-wrap hiring-table-wrap hiring-table-wrap--contracts"><table class="hiring-table hiring-table--contracts"><thead><tr><th>Persona</th><th>Cargo</th><th>Salario</th><th>Tipo contrato</th><th>Inicio</th><th>Renovación</th><th>Fin</th><th>Origen</th><th>Acciones</th></tr></thead><tbody>${contractRows}</tbody></table></div>`
    : hiringEmptyState("Sin contratos", { action: "hiring-operate-section", section: "contract", label: "Generar contrato" });
  const hiredCandidates = candidates.filter((c) => String(c.status || "") === "Contratado").length;
  const candidateConversion = computeHiringConversionPct(candidates);
  const urgentItems = soonClosingVacancies.length + contractsEndingSoon.length;

  const hiringModuleHead = renderHiringModuleHead({
    openVacancies: openVacancies.length,
    activeCandidates: activeCandidates.length,
    urgentItems,
    contractsThisMonth: contractsThisMonth.length,
    candidateConversion,
    hiredCandidates,
    totalCandidates: candidates.length
  });
  const hiringOperateNav = renderModuleWindowTabs({
    ariaLabel: "Flujos de Contratación",
    activeId: hiringOperateSection,
    action: "hiring-operate-section",
    valueAttr: "section",
    tabs: [
      { id: "position", label: "Cargo" },
      { id: "vacancy", label: "Vacante" },
      { id: "candidate", label: "Candidato" },
      { id: "interview", label: "Entrevista" },
      { id: "contract", label: "Contrato" }
    ]
  });
  const hiringOperatePositionPane = `<div class="auth-tab-panel${hiringOperateSection === "position" ? "" : " hidden"}" data-hiring-operate-pane="position"${hiringOperateSection === "position" ? "" : " hidden"}>${createHrActionCard("create-position", "briefcase", "Definir cargo", "Catálogo salarial, jornada y plantilla de contrato sugerida", fPosition, "Abrir formulario", { createPanels: hiringCreateUi })}</div>`;
  const hiringOperateVacancyPane = `<div class="auth-tab-panel${hiringOperateSection === "vacancy" ? "" : " hidden"}" data-hiring-operate-pane="vacancy"${hiringOperateSection === "vacancy" ? "" : " hidden"}>${createHrActionCard("create-vacancy", "plus", "Publicar vacante", "Vacante visible para postulaciones internas o externas", fVac, "Abrir formulario", { createPanels: hiringCreateUi })}</div>`;
  const hiringOperateCandidatePane = `<div class="auth-tab-panel${hiringOperateSection === "candidate" ? "" : " hidden"}" data-hiring-operate-pane="candidate"${hiringOperateSection === "candidate" ? "" : " hidden"}>${createHrActionCard("create-candidate", "userPlus", "Agregar candidato", "Hoja de vida, vacante y seguimiento del pipeline", fCand, "Abrir formulario", { createPanels: hiringCreateUi })}</div>`;
  const hiringOperateInterviewPane = `<div class="auth-tab-panel${hiringOperateSection === "interview" ? "" : " hidden"}" data-hiring-operate-pane="interview"${hiringOperateSection === "interview" ? "" : " hidden"}>${createHrActionCard("create-interview", "calendar", "Programar entrevista", "Fecha, hora y responsable del proceso", fInt, "Abrir formulario", { createPanels: hiringCreateUi })}</div>`;
  const hiringOperateContractPane = `<div class="auth-tab-panel${hiringOperateSection === "contract" ? "" : " hidden"}" data-hiring-operate-pane="contract"${hiringOperateSection === "contract" ? "" : " hidden"}>${createHrActionCard("create-contract", "file", "Generar contrato (Word)", "Plantilla según cargo y tipo de vinculación colombiana", fCon, "Abrir formulario", { createPanels: hiringCreateUi })}</div>`;
  const hiringExecutionBlock = `<section class="hiring-operate hiring-operate-panel">
      <aside class="hiring-operate__rail" aria-label="Flujos de registro">
        <span class="hiring-operate__rail-label">Registrar</span>
        ${hiringOperateNav}
      </aside>
      <div class="hiring-operate__main auth-tab-panels">${hiringOperatePositionPane}${hiringOperateVacancyPane}${hiringOperateCandidatePane}${hiringOperateInterviewPane}${hiringOperateContractPane}</div>
    </section>`;
  const hiringQuickBarCandidates = `<div class="payroll-quick-bar" role="group" aria-label="Filtros de candidatos">
      <button type="button" class="payroll-quick-pill${candidateFilter === "active" ? " is-active" : ""}" data-action="hiring-candidates-active">Activos</button>
      <button type="button" class="payroll-quick-pill${candidateFilter === "finalized" ? " is-active" : ""}" data-action="hiring-candidates-finalized">Finalizados</button>
      <button type="button" class="payroll-quick-pill${candidateFilter === "all" ? " is-active" : ""}" data-action="hiring-candidates-all">Todos</button>
      <button type="button" class="payroll-quick-pill${candidateSort === "pipeline" ? " is-active" : ""}" data-action="hiring-sort-candidates" data-sort="pipeline">Por etapa</button>
      <button type="button" class="payroll-quick-pill${candidateSort === "experience" ? " is-active" : ""}" data-action="hiring-sort-candidates" data-sort="experience">Experiencia</button>
      <button type="button" class="payroll-quick-pill${candidateSort === "recent" ? " is-active" : ""}" data-action="hiring-sort-candidates" data-sort="recent">Recientes</button>
    </div>`;
  const hiringQuickBarVacancies = `<div class="payroll-quick-bar" role="group" aria-label="Filtros de vacantes">
      <button type="button" class="payroll-quick-pill${vacancyFilter === "open" ? " is-active" : ""}" data-action="hiring-vacancies-open">Solo abiertas</button>
      <button type="button" class="payroll-quick-pill${vacancyFilter === "all" ? " is-active" : ""}" data-action="hiring-vacancies-all">Todas</button>
    </div>`;
  const hiringDataNav = renderHiringDataSectionNav(
    hiringDataSection,
    {
      candidates: sortedCandidates.length,
      vacancies: filteredVacancies.length,
      interviews: interviews.length,
      contracts: contracts.length,
      positions: positions.length
    },
    { minimal: true }
  );
  const hiringDataFilters =
    hiringDataSection === "candidates"
      ? hiringQuickBarCandidates
      : hiringDataSection === "vacancies"
        ? hiringQuickBarVacancies
        : "";
  const hiringMetaCandidates = `<p class="payroll-result-meta muted" title="Candidatos visibles según filtro de vista y búsqueda"><strong>${sortedCandidatesView.length}</strong>${dataListSearch ? ` <span class="muted">· ${sortedCandidates.length}</span>` : ""} <span class="muted">/ ${candidates.length}</span> candidatos</p>`;
  const hiringMetaVacancies = `<p class="payroll-result-meta muted" title="Vacantes según filtros y búsqueda"><strong>${filteredVacanciesView.length}</strong>${dataListSearch ? ` <span class="muted">· ${filteredVacancies.length}</span>` : ""} <span class="muted">/ ${vacancies.length}</span> vacantes</p>`;
  const hiringMetaInterviews = `<p class="payroll-result-meta muted" title="Entrevistas registradas"><strong>${interviewsView.length}</strong>${dataListSearch ? ` <span class="muted">· ${interviews.length}</span>` : ""} entrevistas</p>`;
  const hiringMetaContracts = `<p class="payroll-result-meta muted" title="Contratos en el listado y firmados este mes"><strong>${contractsView.length}</strong>${dataListSearch ? ` <span class="muted">· ${contracts.length}</span>` : ""} contratos · <strong>${contractsThisMonth.length}</strong> este mes</p>`;
  const activePositionsInView = positionsView.filter((p) => p.active !== false);
  const hiringMetaPositions = `<p class="payroll-result-meta muted" title="Cargos activos en el catálogo"><strong>${activePositionsInView.length}</strong>${dataListSearch ? ` <span class="muted">· ${activePositions.length}</span>` : ""} <span class="muted">/ ${positions.length}</span> cargos</p>`;
  const hiringCandidatesPane = `<div class="payroll-data-pane${hiringDataSection === "candidates" ? "" : " hidden"}" data-hiring-section="candidates">
      ${hiringMetaCandidates}
      <div class="payroll-table-shell">${tCand}</div>
    </div>`;
  const hiringVacanciesPane = `<div class="payroll-data-pane${hiringDataSection === "vacancies" ? "" : " hidden"}" data-hiring-section="vacancies">
      ${hiringMetaVacancies}
      <div class="payroll-table-shell">${tVac}</div>
    </div>`;
  const hiringInterviewsPane = `<div class="payroll-data-pane${hiringDataSection === "interviews" ? "" : " hidden"}" data-hiring-section="interviews">
      ${hiringMetaInterviews}
      <div class="payroll-table-shell">${tInt}</div>
    </div>`;
  const hiringContractsPane = `<div class="payroll-data-pane${hiringDataSection === "contracts" ? "" : " hidden"}" data-hiring-section="contracts">
      ${hiringMetaContracts}
      <div class="payroll-table-shell">${tCon}</div>
    </div>`;
  const hiringPositionsPane = `<div class="payroll-data-pane${hiringDataSection === "positions" ? "" : " hidden"}" data-hiring-section="positions">
      ${hiringMetaPositions}
      <div class="payroll-table-shell">${tPos}</div>
    </div>`;
  const hiringDataSearchBar = `<div class="hiring-data-search-toolbar">
      <label class="hiring-data-search">
        <span class="muted">${IC.search || ""} Buscar</span>
        <input type="search" data-action="hiring-data-list-search" value="${escapeAttr(dataListSearchRaw)}" placeholder="Nombre, correo, cargo, vacante, documento…" autocomplete="off" />
      </label>
    </div>`;
  const hiringDataBlock = `<section class="hiring-data-panel">
      ${hiringDataSearchBar}
      <div class="payroll-data-toolbar payroll-data-toolbar--compact">
        ${hiringDataNav}
        ${hiringDataFilters ? `<div class="payroll-data-toolbar__filters">${hiringDataFilters}</div>` : ""}
      </div>
      <div class="payroll-data-panes">${hiringCandidatesPane}${hiringVacanciesPane}${hiringInterviewsPane}${hiringContractsPane}${hiringPositionsPane}</div>
    </section>`;
  const hiringTabsNav = renderHrWorkspaceTabs({
    module: "hiring",
    ariaLabel: "Secciones del módulo Contratación",
    activeId: hiringWorkspace,
    variant: "switch",
    tabs: [
      { id: "operate", label: "Registrar", icon: "plus", hint: "Cargos, vacantes y contratos" },
      { id: "data", label: "Consultar", icon: "eye", hint: "Candidatos y seguimiento" }
    ]
  });
  const hiringWorkspaceHeader = renderHrWorkspaceHeader(hiringModuleHead, hiringTabsNav, "hiring");
  const hiringOperatePanel = `<div class="hr-workspace-panel payroll-workspace-panel${hiringWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-hiring-panel="operate">
      ${hiringExecutionBlock}
    </div>`;
  const hiringDataPanel = `<div class="hr-workspace-panel payroll-workspace-panel${hiringWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-hiring-panel="data">
      ${hiringDataBlock}
    </div>`;
  return `<section class="hiring-studio hiring-shell hiring-shell--workspace hr-flow-shell" data-hr-workspace="${escapeAttr(hiringWorkspace)}">${hiringWorkspaceHeader}
      <div class="hr-workspace-panels">
        ${hiringOperatePanel}
        ${hiringDataPanel}
      </div>
    </section>`;
}

/** Postulación web (API/R2): adjuntos_json con kind cv_file | cv_blob | cv_filename · Local: solo nombres o cv_blob desde RRHH. */

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ hiringHtml });
})();
