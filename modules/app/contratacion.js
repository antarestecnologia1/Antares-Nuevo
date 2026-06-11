/**
 * Contratación (`hiring`): vista HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
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
      <td>${escapeHtml(String(c.contractType || "-"))}${c.endDate ? `<br><span class="muted">Fin: ${escapeHtml(String(c.endDate))}</span>` : ""}</td>
      <td>${escapeHtml(String(c.source || c.sourceTag || (c.employeeId ? "Empleado" : "Candidato")))}</td>
      <td>${fmtDate(c.createdAt)}</td>
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
    ? `<div class="table-wrap hiring-table-wrap hiring-table-wrap--contracts"><table class="hiring-table hiring-table--contracts"><thead><tr><th>Persona</th><th>Cargo</th><th>Salario</th><th>Tipo contrato</th><th>Origen</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>${contractRows}</tbody></table></div>`
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
  const hiringOperatePositionPane = `<div class="auth-tab-panel${hiringOperateSection === "position" ? "" : " hidden"}" data-hiring-operate-pane="position"${hiringOperateSection === "position" ? "" : " hidden"}>${createCollapsibleProCard("create-position", "briefcase", "Definir cargo", "Catálogo salarial, jornada y plantilla de contrato sugerida", fPosition, "admin-users-data-card hr-form-card gh-form-card hr-form-card--md", "Abrir formulario", { createPanels: state.createPanels })}</div>`;
  const hiringOperateVacancyPane = `<div class="auth-tab-panel${hiringOperateSection === "vacancy" ? "" : " hidden"}" data-hiring-operate-pane="vacancy"${hiringOperateSection === "vacancy" ? "" : " hidden"}>${createCollapsibleProCard("create-vacancy", "plus", "Publicar vacante", "Vacante visible para postulaciones internas o externas", fVac, "admin-users-data-card hr-form-card gh-form-card hr-form-card--lg", "Abrir formulario", { createPanels: state.createPanels })}</div>`;
  const hiringOperateCandidatePane = `<div class="auth-tab-panel${hiringOperateSection === "candidate" ? "" : " hidden"}" data-hiring-operate-pane="candidate"${hiringOperateSection === "candidate" ? "" : " hidden"}>${createCollapsibleProCard("create-candidate", "userPlus", "Agregar candidato", "Hoja de vida, vacante y seguimiento del pipeline", fCand, "admin-users-data-card hr-form-card gh-form-card hr-form-card--xl", "Abrir formulario", { createPanels: state.createPanels })}</div>`;
  const hiringOperateInterviewPane = `<div class="auth-tab-panel${hiringOperateSection === "interview" ? "" : " hidden"}" data-hiring-operate-pane="interview"${hiringOperateSection === "interview" ? "" : " hidden"}>${createCollapsibleProCard("create-interview", "calendar", "Programar entrevista", "Fecha, hora y responsable del proceso", fInt, "admin-users-data-card hr-form-card gh-form-card hr-form-card--md", "Abrir formulario", { createPanels: state.createPanels })}</div>`;
  const hiringOperateContractPane = `<div class="auth-tab-panel${hiringOperateSection === "contract" ? "" : " hidden"}" data-hiring-operate-pane="contract"${hiringOperateSection === "contract" ? "" : " hidden"}>${createCollapsibleProCard("create-contract", "file", "Generar contrato (Word)", "Plantilla según cargo y tipo de vinculación colombiana", fCon, "admin-users-data-card hr-form-card gh-form-card hr-form-card--lg", "Abrir formulario", { createPanels: state.createPanels })}</div>`;
  const hiringExecutionBlock = `<section class="gh-operate hiring-operate-panel">
      <aside class="gh-operate__rail" aria-label="Flujos de registro">
        <span class="gh-operate__rail-label">Registrar</span>
        ${hiringOperateNav}
      </aside>
      <div class="gh-operate__main auth-tab-panels">${hiringOperatePositionPane}${hiringOperateVacancyPane}${hiringOperateCandidatePane}${hiringOperateInterviewPane}${hiringOperateContractPane}</div>
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
  const hiringDataBlock = `<section class="gh-data-panel hiring-data-panel">
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
  return `<section class="gh-studio hiring-shell hiring-shell--workspace hr-flow-shell" data-hr-workspace="${escapeAttr(hiringWorkspace)}">${hiringWorkspaceHeader}
      <div class="hr-workspace-panels">
        ${hiringOperatePanel}
        ${hiringDataPanel}
      </div>
    </section>`;
}

/** Postulación web (API/R2): adjuntos_json con kind cv_file | cv_blob | cv_filename · Local: solo nombres o cv_blob desde RRHH. */
function parseCandidateAttachmentsForView(raw, opts = {}) {
  const candidateId = String(opts.candidateId || "").trim();
  let experienceFromJson = "";
  /** @type {string[]} */
  const parts = [];

  const safeHttps = (u) => {
    const s = String(u || "").trim();
    return /^https?:\/\/.+/i.test(s) ? s : "";
  };
  /** MIME permitido conservador para armar data: URL desde JSON almacenado. */
  const safeMimeForDataUrl = (m) => {
    const base = String(m || "application/octet-stream")
      .split(";")[0]
      ?.trim()
      .toLowerCase();
    if (/^[\w/+.-]+$/.test(base) && base.length < 96) return base;
    return "application/octet-stream";
  };

  const walk = (arr) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (item == null) continue;
      if (typeof item === "string") {
        const n = String(item).trim();
        if (n) parts.push(`<span class="perm-tag" title="${escapeAttr(n)}">${IC.file}<span>${escapeHtml(n)}</span></span>`);
        continue;
      }
      if (typeof item !== "object") continue;
      const k = String(item.kind || "");
      if (k === "experience_notes" && item.text) {
        experienceFromJson = String(item.text || "").trim();
        continue;
      }
      if (k === "cv_filename" && item.name) {
        const n = escapeHtml(String(item.name).trim());
        parts.push(`<span class="perm-tag">${IC.file}<span>${n}</span></span>`);
        continue;
      }
      if (k === "cv_file") {
        const displayName = escapeHtml(String(item.name || "Hoja de vida").trim());
        const url = safeHttps(item.url);
        if (url) {
          parts.push(
            `<a class="btn btn-sm btn-outline" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" download>${IC.download} Ver / descargar</a> <span class="muted">${displayName}</span>`
          );
        } else if (item.storageKey && candidateId) {
          parts.push(
            `<button type="button" class="btn btn-sm btn-outline" data-action="download-candidate-cv" data-id="${escapeAttr(candidateId)}">${IC.download} Ver / descargar</button> <span class="muted">${displayName}</span>`
          );
        } else if (item.storageKey) {
          parts.push(
            `<span class="perm-tag">${IC.file}<span>${displayName}</span></span> <span class="muted" title="${escapeAttr(String(item.storageKey))}">(CV en almacenamiento; use Descargar CV)</span>`
          );
        } else {
          parts.push(`<span class="perm-tag">${IC.file}<span>${displayName}</span></span>`);
        }
        continue;
      }
      if (k === "cv_blob" && item.data && item.mime) {
        const dn = escapeAttr(String(item.name || "hoja-de-vida").slice(0, 120));
        const mime = safeMimeForDataUrl(item.mime);
        const href = `data:${mime};base64,${String(item.data)}`;
        parts.push(
          `<a class="btn btn-sm btn-outline" href="${escapeAttr(href)}" download="${dn}">${IC.download} Descargar</a> <span class="muted">${escapeHtml(String(item.name || "Adjunto"))}</span>`
        );
        continue;
      }
    }
  };

  if (Array.isArray(raw)) walk(raw);
  else if (raw != null && typeof raw === "object" && typeof raw !== "bigint") walk([raw]);
  else if (typeof raw === "string" && raw.trim()) {
    try {
      walk(JSON.parse(raw));
    } catch (_e) {
      const n = raw.trim();
      parts.push(`<span class="perm-tag">${escapeHtml(n)}</span>`);
    }
  }

  return {
    attachmentsHtml: parts.filter(Boolean).join(" "),
    experienceFromJson
  };
}

function bindHiringPortalControls() {
  if (String(state.currentView || "") !== "hiring" || !nodes.viewRoot) return;

  nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='hiring']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.tab || "");
      if (!tab) return;
      const ws = normalizeHrWorkspace("hiring", tab);
      if (!HR_VALID_HIRING_WS.has(ws)) return;
      state.hiringUi = { ...(state.hiringUi || {}), workspace: ws, ...(ws === "operate" ? { dataListSearch: "" } : {}) };
      persistHrWorkspace("hiring", ws);
      renderPortalView();
    });
  });

  const vacancyForm = document.getElementById("form-vacancy");
  if (vacancyForm) {
    attachDepartmentCitySelects(vacancyForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    const positionSelect = vacancyForm.querySelector("select[name='positionId']");
    const titleInput = vacancyForm.querySelector("input[name='title']");
    const salaryOfferInput = vacancyForm.querySelector("#vacancy-salary-offer");
    const vacancySalaryHint = vacancyForm.querySelector("#vacancy-salary-hint");
    if (positionSelect) {
      const syncFromPosition = () => {
        const position = getPositionById(String(positionSelect.value || ""));
        if (!position) return;
        if (titleInput && !titleInput.value.trim()) titleInput.value = `Vacante ${position.name}`;
        if (salaryOfferInput) {
          salaryOfferInput.min = String(Math.max(CO_HR_RULES.minMonthlySalary, parseNum(position.baseSalary)));
          salaryOfferInput.value = String(parseNum(position.baseSalary));
        }
        if (vacancySalaryHint) {
          const catalog = parseNum(position.baseSalary).toLocaleString("es-CO");
          vacancySalaryHint.textContent = `Cargo «${position.name}»: salario catálogo $${catalog}. Mínimo legal SMMLV $${CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")}.`;
        }
      };
      positionSelect.addEventListener("change", syncFromPosition);
      syncFromPosition();
    }

    wireFormSubmitGuard(vacancyForm, async (event) => {
      const data = readFormEntriesNormalized(vacancyForm);
      const deadlineOk = (() => {
        const s = String(data.deadline || "").trim();
        const parts = s.split("-");
        if (parts.length !== 3) return false;
        const cand = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
        if (!Number.isFinite(cand)) return false;
        const t = new Date();
        const t0 = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
        return cand >= t0;
      })();
      if (!deadlineOk) {
        notify(userMessage("vacancyDeadlineFuture"), "error");
        return;
      }
      const pFrom = String(data.publishedFrom || "").trim();
      if (pFrom) {
        if (!publicVacancyYmdValid(pFrom)) {
          notify("Indique una fecha válida en “Visible en web desde”, o déjela vacía.", "error");
          return;
        }
        const dlim = String(data.deadline || "").trim();
        if (publicVacancyYmdValid(dlim) && publicVacancyYmdToMidnight(pFrom) > publicVacancyYmdToMidnight(dlim)) {
          notify("“Visible desde” no puede ser posterior a la fecha límite de postulaciones.", "error");
          return;
        }
      }
      const position = getPositionById(String(data.positionId || ""));
      if (!position || position.active === false) {
        notify(userMessage("vacancySelectPosition"), "error");
        return;
      }
      const salaryValidation = validateVacancySalaryOffer(data.salaryOffer, position);
      if (!salaryValidation.ok) {
        notify(salaryValidation.message, "error");
        return;
      }
      const all = read(KEYS.vacancies, []);
      all.unshift(stampCreatedRecord({
        id: newUuidV4(),
        positionId: data.positionId,
        title: normalizeLatinUpperForDb(data.title || `Vacante ${position.name}`),
        department: normalizeLatinForDb(data.department || ""),
        city: normalizeLatinForDb(data.city || ""),
        modality: normalizeLatinUpperForDb(data.modality || ""),
        workday: normalizeLatinUpperForDb(data.workday || ""),
        deadline: data.deadline,
        publishedFrom: String(data.publishedFrom || "").trim(),
        openings: Math.max(1, parseNum(data.openings || 1)),
        salaryOffer: salaryValidation.salaryOffer,
        positionName: position.name,
        workerRole: position.workerRole || "empleado",
        contractTypeDefault: normalizeLatinUpperForDb(
          data.contractTypeDefault || position.contractTypeDefault || "Termino indefinido"
        ),
        requirements: normalizeLatinUpperForDb(data.requirements || ""),
        status: "Publicada"
      }));
      try {
        await writeAwaitServer(KEYS.vacancies, all);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la vacante en el servidor."), "error");
        return;
      }
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.vacancyFilter = "open";
      state.hiringUi.workspace = "data";
      persistHrWorkspace("hiring", "data");
      collapseCreatePanel("create-vacancy");
      notify(userMessage("vacancyPublishedOk"), "success");
      renderPortalView();
    });
  }

  const positionForm = document.getElementById("form-position");
  if (positionForm) {
    bindPositionCompensationFields(positionForm, {
      basisSelector: "#position-salary-basis",
      salarySelector: "#position-base-salary",
      auxSelector: "#position-transport-allowance",
      hintSelector: "#position-legal-comp-hint"
    });
    /* Si el nombre del cargo es de conductor, preseleccionar el rol «Conductor» para que
       el alta de empleado habilite licencia/exámenes y sincronice con el módulo Conductores. */
    const positionNameInput = positionForm.querySelector("input[name='name']");
    const positionRoleSelect = positionForm.querySelector("select[name='workerRole']");
    if (positionNameInput && positionRoleSelect && positionForm.dataset.roleAutoWired !== "1") {
      positionForm.dataset.roleAutoWired = "1";
      positionNameInput.addEventListener("input", () => {
        if (/conductor/i.test(String(positionNameInput.value || ""))) {
          positionRoleSelect.value = "conductor";
        }
      });
    }
    wireFormSubmitGuard(positionForm, async (event) => {
      const data = readFormEntriesNormalized(positionForm);
      const minSalary = CO_HR_RULES.minMonthlySalary;
      const baseSalary =
        String(data.salaryBasis || "smmlv") === "smmlv" ? minSalary : parseNum(data.baseSalary);
      const comp = validateColombiaPositionCompensation({
        baseSalary,
        integralSalary: String(data.integralSalary || "false") === "true",
        transportAllowance: data.transportAllowance
      });
      if (!comp.ok) {
        notify(comp.message, "error");
        return;
      }
      const all = read(KEYS.positions, []);
      all.unshift(stampCreatedRecord({
        id: newUuidV4(),
        name: normalizeLatinUpperForDb(String(data.name || "").trim()),
        workerRole: String(data.workerRole || "empleado"),
        baseSalary: comp.baseSalary,
        transportAllowance: comp.transportAllowance,
        contractTypeDefault: normalizeLatinUpperForDb(data.contractTypeDefault || "Termino indefinido"),
        workSchedule: normalizeLatinUpperForDb(data.workSchedule),
        arlRiskLevel: normalizeLatinUpperForDb(data.arlRiskLevel),
        integralSalary: String(data.integralSalary || "false") === "true",
        legalBasis: normalizeLatinUpperForDb(data.legalBasis || "CST art. 45-46 y normatividad laboral vigente"),
        active: true
      }));
      // optimistic:false → esperamos confirmación del servidor antes de cerrar el panel.
      // Así el cargo queda realmente en la BD (tabla cargos) antes de que cualquier alta de
      // empleado lo referencie por id_cargo, evitando que el colaborador no se guarde por una
      // carrera entre el sync de cargos y el de empleados.
      const ok = await persistPositionsCatalog(all, { optimistic: false });
      if (!ok) return;
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.workspace = "data";
      persistHrWorkspace("hiring", "data");
      collapseCreatePanel("create-position");
      notify(userMessage("positionCreatedOk"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void runWithBusyButton(btn, async () => {
        const all = read(KEYS.positions, []);
        const target = all.find((p) => p.id === btn.dataset.id);
        if (!target) return;
        const nextPositions = all.map((p) =>
          p.id === target.id ? { ...p, active: target.active === false, updatedAt: nowIso() } : p
        );
        const ok = await persistPositionsCatalog(nextPositions, { optimistic: true });
        if (!ok) return;
        notify(target.active === false ? userMessage("positionActivated") : userMessage("positionDeactivated"), "info");
        renderPortalView();
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void runWithBusyButton(btn, async () => {
        const all = read(KEYS.vacancies, []);
        const nextVacancies = all.map((v) =>
          v.id === btn.dataset.id ? { ...v, status: "Cerrada", updatedAt: nowIso() } : v
        );
        try {
          await writeAwaitServer(KEYS.vacancies, nextVacancies);
        } catch (err) {
          notify(String(err?.message || "No fue posible cerrar la vacante en el servidor."), "error");
          return;
        }
        notify(userMessage("vacancyClosed"), "success");
        renderPortalView();
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='view-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = read(KEYS.vacancies, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!v) return;
      const sal = parseNum(v.salaryOffer);
      const reqs = escapeHtml(String(v.requirements || "").trim() || "Sin requisitos detallados.");
      const body = `<div class="vacancy-detail-sheet">
        <div class="vacancy-detail-pills">
          <span class="vacancy-pill">${escapeHtml(String(v.positionName || "Cargo"))}</span>
          <span class="vacancy-pill">${escapeHtml(String(v.city || "Ciudad"))}</span>
          <span class="vacancy-pill">${escapeHtml(String(v.modality || "Modalidad"))}</span>
          <span class="vacancy-pill">$${sal.toLocaleString("es-CO")} COP</span>
          <span class="vacancy-pill">Cupos: ${escapeHtml(String(v.openings ?? 1))}</span>
        </div>
        <p><strong>Cierre postulaciones:</strong> ${escapeHtml(String(v.deadline || "—"))}</p>
        <p><strong>Última actualización:</strong> ${escapeHtml(fmtDateOr(v.updatedAt || v.createdAt, "—"))}</p>
        <div class="vacancy-detail-reqs"><strong>Requisitos y perfil</strong><p class="muted" style="margin:0.35rem 0 0;white-space:pre-wrap">${reqs}</p></div>
      </div>`;
      openInfoModal({
        title: String(v.title || "Vacante"),
        subtitle: `${String(v.department || "").trim()} · ${String(v.workerRole || "").trim() || "RR.HH."}`,
        bodyHtml: body,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify(userMessage("adminOnlyModule"), "error");
        return;
      }
      const id = String(btn.dataset.id || "").trim();
      if (!id) return;
      openConfirmModal({
        title: "Eliminar vacante",
        message:
          "Se eliminara la vacante del listado. Esta accion no borra candidatos ya postulados en el pipeline, pero puede dejar registros con referencia huérfana.",
        confirmText: "Eliminar vacante",
        onConfirm: async () => {
          const ok = await removeFromPortalListAwaitServer(KEYS.vacancies, id);
          if (!ok) return;
          notify(userMessage("vacancyDeletedOk"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-active']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateFilter = "active";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "candidates";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateFilter = "all";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "candidates";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-finalized']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateFilter = "finalized";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "candidates";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-vacancies-open']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.vacancyFilter = "open";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "vacancies";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-vacancies-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.vacancyFilter = "all";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "vacancies";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-sort-candidates']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateSort = String(btn.dataset.sort || "recent");
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "candidates";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-operate-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizeHiringOperateSection(btn.dataset.section);
      state.hiringUi = { ...(state.hiringUi || {}), operateSection: section, workspace: "operate" };
      const panelBySection = {
        position: "create-position",
        vacancy: "create-vacancy",
        candidate: "create-candidate",
        interview: "create-interview",
        contract: "create-contract"
      };
      const panelId = panelBySection[section];
      if (panelId) {
        state.createPanels = { ...(state.createPanels || {}) };
        ["create-position", "create-vacancy", "create-candidate", "create-interview", "create-contract"].forEach((id) => {
          state.createPanels[id] = id === panelId;
        });
      }
      persistHrWorkspace("hiring", "operate");
      renderPortalView();
      if (panelId) {
        requestAnimationFrame(() => scrollToCreatePanelForm(panelId));
      }
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-data-list-search']").forEach((input) => {
    input.addEventListener("input", () => {
      const el = /** @type {HTMLInputElement} */ (input);
      const len = String(el.value || "").length;
      const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
      const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
      state.hiringUi = { ...(state.hiringUi || {}), dataListSearch: String(el.value || ""), workspace: "data" };
      state.__hiringDataListSearchRestore = { start, end };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-data-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizeHiringDataSection(btn.dataset.section);
      state.hiringUi = { ...(state.hiringUi || {}), dataSection: section, workspace: "data" };
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  const candidateForm = document.getElementById("form-candidate");
  if (candidateForm) {
    window.AntaresValidation?.decorateFormFields?.(candidateForm);
    attachDepartmentCitySelects(candidateForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    applyDocumentFieldConstraints(candidateForm);
    const candidateDuplicateDocCheck = wireFormDocDuplicateCheck(candidateForm, {
      storageKey: KEYS.candidates,
      useCompanyScope: false,
      entityLabel: "candidato"
    });
    candidateForm.__antaresDupDocCheck = candidateDuplicateDocCheck;
    bindHrFormWizard(candidateForm);
    wireFormSubmitGuard(candidateForm, async (event) => {
      const data = readFormEntriesNormalized(candidateForm);
      const docValidation = validateColombianDocument(data.documentType, data.idDoc);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      if (!(await candidateDuplicateDocCheck({ forceServer: false, fromSubmit: true }))) {
        /* wireFormDocDuplicateCheck ya notificó y marcó el campo si hay duplicado. */
        return;
      }
      data.idDoc = docValidation.normalized;
      const birthRaw = String(data.birthDate || "").trim().slice(0, 10);
      const candAgeInfo = portalCandidateAgeFromBirthIso(birthRaw);
      if (candAgeInfo.age === null) {
        notify("Indique una fecha de nacimiento válida.", "error");
        return;
      }
      if (candAgeInfo.age < 18) {
        notify("El candidato debe ser mayor de 18 años.", "error");
        return;
      }
      const vac = read(KEYS.vacancies, []).find((v) => v.id === data.vacancyId);
      if (!vac) {
        notify(userMessage("hireSelectVacancy"), "error");
        return;
      }
      if (!isVacancyAcceptingApplications(vac)) {
        notify("La vacante seleccionada está cerrada o venció la fecha límite de postulación.", "error");
        return;
      }
      const filesFromInput = await readCandidateHrAttachmentsFromInput(candidateForm.querySelector("input[name='attachments']"));
      if (filesFromInput === null) return;
      const attachmentList =
        filesFromInput.length > 0
          ? filesFromInput
          : [...(candidateForm.querySelector("input[name='attachments']")?.files ?? [])].map((f) => f.name);
      const aspirationCheck = validateColombiaMonthlySalaryCop(data.expectedSalary, "Aspiración salarial");
      if (!aspirationCheck.ok) {
        notify(aspirationCheck.message, "error");
        return;
      }
      const expectedSalary = aspirationCheck.amount;
      const offerRef = parseNum(vac.salaryOffer);
      if (offerRef > 0 && expectedSalary < offerRef) {
        notify(
          `La aspiración salarial no puede ser inferior al salario ofrecido en la vacante ($${offerRef.toLocaleString("es-CO")}).`,
          "error"
        );
        return;
      }
      const availabilityTs = new Date(`${String(data.availabilityDate || "")}T12:00:00`).getTime();
      if (!Number.isFinite(availabilityTs) || availabilityTs < new Date(new Date().toDateString()).getTime()) {
        notify(userMessage("candidateAvailabilityFuture"), "error");
        return;
      }
      const all = read(KEYS.candidates, []);
      all.unshift(stampCreatedRecord({
        id: newUuidV4(),
        name: normalizeLatinUpperForDb(data.name),
        email: normalizeEmail(data.email),
        phone: normalizePortalPhoneForStorage(data.phone),
        documentType: data.documentType,
        idDoc: data.idDoc,
        birthDate: birthRaw,
        department: normalizeLatinForDb(data.department || ""),
        city: normalizeLatinForDb(data.city),
        address: normalizeLatinUpperForDb(data.address),
        educationLevel: normalizeLatinUpperForDb(data.educationLevel || ""),
        experienceYears: Math.max(0, parseNum(data.experienceYears || 0)),
        expectedSalary,
        availabilityDate: data.availabilityDate || "",
        vacancyId: vac.id,
        vacancyTitle: vac.title,
        status: PIPELINE[0],
        attachments: attachmentList,
        source: "Portal RRHH"
      }));
      try {
        await writeAwaitServer(KEYS.candidates, all);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el candidato en el servidor."), "error");
        return;
      }
      sendEmail({ to: data.email, subject: "Registro recibido", body: "Gracias por aplicar." });
      try {
        await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
      } catch (_e) {}
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateFilter = "active";
      state.hiringUi.workspace = "data";
      persistHrWorkspace("hiring", "data");
      collapseCreatePanel("create-candidate");
      notify(userMessage("candidateRegisteredOk"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='candidate-status']").forEach((select) => {
    select.addEventListener("change", async () => {
      const all = read(KEYS.candidates, []);
      const currentCandidate = all.find((c) => c.id === select.dataset.id);
      if (!currentCandidate) return;
      const statusValidation = validateCandidatePipelineTransition(currentCandidate, select.value);
      if (!statusValidation.ok) {
        notify(statusValidation.message, "error");
        renderPortalView();
        return;
      }
      const updated = all.map((c) =>
        c.id === select.dataset.id ? { ...c, status: select.value, updatedAt: nowIso() } : c
      );
      try {
        await writeAwaitServer(KEYS.candidates, updated);
      } catch (err) {
        notify(String(err?.message || "No fue posible actualizar el candidato en el servidor."), "error");
        renderPortalView();
        return;
      }
      const current = updated.find((c) => c.id === select.dataset.id);
      if (current) {
        sendEmail({
          to: current.email,
          subject: "Actualizacion de proceso",
          body: `Tu estado cambio a: ${current.status}`
        });
        try {
          await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
        } catch (_e) {}
      }
      notify(userMessage("candidateUpdated"), "success");
      renderPortalView();
    });
  });

  const interviewForm = document.getElementById("form-interview");
  if (interviewForm) {
    wireFormSubmitGuard(interviewForm, async (event) => {
      const data = readFormEntriesNormalized(interviewForm);
      const whenRaw = String(data.when || "").trim();
      const interviewTs = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(whenRaw)
        ? new Date(`${whenRaw}:00-05:00`).getTime()
        : new Date(whenRaw).getTime();
      if (!Number.isFinite(interviewTs) || interviewTs < Date.now()) {
        notify(userMessage("interviewScheduleFuture"), "error");
        return;
      }
      const candidate = read(KEYS.candidates, []).find((c) => String(c.id) === String(data.candidateId || ""));
      if (!candidate) {
        notify(userMessage("interviewCandidateMissing"), "error");
        return;
      }
      if (["Descartado", "Contratado"].includes(String(candidate.status || ""))) {
        notify(userMessage("interviewInvalidCandidate"), "error");
        return;
      }
      const all = read(KEYS.interviews, []);
      all.unshift({
        id: newUuidV4(),
        candidateId: candidate.id,
        candidateName: candidate.name,
        when: data.when,
        interviewer: normalizeLatinUpperForDb(String(data.interviewer || "").trim()),
        modality: (() => {
          const modeKey = String(data.mode || "").trim().toLowerCase();
          if (modeKey === "virtual") return "Virtual";
          if (modeKey === "telefonica") return "Telefónica";
          return "Presencial";
        })(),
        locationOrLink: normalizeLatinUpperForDb(String(data.place || "").trim()),
        notes: normalizeLatinUpperForDb(String(data.notes || "").trim())
      });
      write(KEYS.interviews, all, { skipSyncSchedule: true });
      try {
        await writeAwaitServer(KEYS.interviews, all);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la entrevista en el servidor."), "error");
        return;
      }
      const candidateList = read(KEYS.candidates, []);
      const nextCandidates = candidateList.map((item) => {
        if (String(item.id) !== String(candidate.id)) return item;
        const status = String(item.status || "");
        if (["Contratado", "Descartado"].includes(status)) return item;
        if (status === "Entrevistado") return item;
        return stampUpdatedRecord({ ...item, status: "Entrevistado" });
      });
      write(KEYS.candidates, nextCandidates, { skipSyncSchedule: true });
      try {
        await writeAwaitServer(KEYS.candidates, nextCandidates);
      } catch (err) {
        notify(String(err?.message || "Entrevista guardada; no fue posible actualizar el estado del candidato en el servidor."), "error");
        renderPortalView();
        return;
      }
      sendEmail({
        to: candidate.email,
        subject: "Entrevista programada",
        body: `Fecha y hora: ${formatInterviewWhenDisplay(data.when)} (ajuste según su zona horaria).`
      });
      try {
        await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
      } catch (_e) {}
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.workspace = "data";
      persistHrWorkspace("hiring", "data");
      collapseCreatePanel("create-interview");
      notify(userMessage("interviewScheduledOk"), "success");
      renderPortalView();
    });
    const applyPendingInterviewCandidate = () => {
      const cid = String(state.hiringUi?.scheduleInterviewOpenForCandidateId || "").trim();
      if (!cid) return;
      state.hiringUi = { ...(state.hiringUi || {}), scheduleInterviewOpenForCandidateId: "" };
      const sel = interviewForm.querySelector('select[name="candidateId"]');
      if (sel && [...sel.options].some((o) => String(o.value) === cid)) {
        sel.value = cid;
      }
      const minWhen = colombiaDatetimeLocalString();
      const whenWrap = interviewForm.querySelector(".portal-datetime-dmy-row");
      const V = window.AntaresValidation;
      if (whenWrap && typeof V?.portalDatetimeInputSetIso === "function") {
        V.portalDatetimeInputSetIso(whenWrap, "");
        const dateVis =
          whenWrap.querySelector(".portal-date-dmy") || whenWrap.querySelector('input[type="date"]');
        if (dateVis) dateVis.min = minWhen.slice(0, 10);
        dateVis?.focus?.();
      } else {
        const whenEl =
          interviewForm.querySelector('input[type="datetime-local"][name="when"]') ||
          interviewForm.querySelector('input[name="when"]');
        if (whenEl) {
          whenEl.setAttribute("min", minWhen);
          whenEl.value = "";
          whenEl.focus();
        }
      }
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(applyPendingInterviewCandidate);
    });
  }

  const contractForm = document.getElementById("form-contract");
  if (contractForm) {
    const syncContractPersonMode = () => {
      const mode = String(contractForm.querySelector("#contract-person-mode")?.value || "employee");
      const empPicker = contractForm.querySelector(".hiring-contract-employee-picker");
      const candPicker = contractForm.querySelector(".hiring-contract-candidate-picker");
      const empSel = contractForm.querySelector("select[name='employeeId']");
      const candSel = contractForm.querySelector("select[name='candidateId']");
      const hint = contractForm.querySelector("#contract-candidate-match-hint");
      const isCandidate = mode === "candidate";
      if (empPicker) {
        empPicker.classList.toggle("hidden", isCandidate);
        empPicker.toggleAttribute("hidden", isCandidate);
      }
      if (candPicker) {
        candPicker.classList.toggle("hidden", !isCandidate);
        candPicker.toggleAttribute("hidden", !isCandidate);
      }
      if (empSel) {
        if (isCandidate) empSel.removeAttribute("required");
        else empSel.setAttribute("required", "required");
      }
      if (candSel) {
        if (isCandidate) candSel.setAttribute("required", "required");
        else candSel.removeAttribute("required");
      }
      if (hint && isCandidate) {
        const cand = read(KEYS.candidates, []).find((c) => String(c.id) === String(candSel?.value || ""));
        const emp = cand ? findPayrollEmployeeByIdDoc(cand.idDoc) : null;
        if (!cand) {
          hint.classList.add("hidden");
          hint.setAttribute("hidden", "hidden");
          hint.textContent = "";
        } else if (emp) {
          hint.classList.remove("hidden");
          hint.removeAttribute("hidden");
          hint.textContent = `Empleado vinculado: ${emp.name} (CC ${emp.idDoc}). Se generará el contrato sobre su ficha.`;
        } else {
          hint.classList.remove("hidden");
          hint.removeAttribute("hidden");
          hint.textContent =
            "Aún no hay empleado con esta cédula. Regístrelo desde «Crear empleado» en el candidato antes de generar el contrato.";
        }
      } else if (hint) {
        hint.classList.add("hidden");
        hint.setAttribute("hidden", "hidden");
      }
    };
    contractForm.querySelector("#contract-person-mode")?.addEventListener("change", syncContractPersonMode);
    contractForm.querySelector("select[name='candidateId']")?.addEventListener("change", () => {
      syncContractPersonMode();
      syncContractFormFromSelection(contractForm);
    });
    syncContractPersonMode();
    const contractFormBusyLockButtons = [
      contractForm.querySelector(".hr-form-wizard-submit"),
      contractForm.querySelector("[data-hr-wizard-next]"),
      contractForm.querySelector("[data-hr-wizard-prev]"),
      contractForm.querySelector("[data-action='cancel-create-panel']"),
      contractForm.querySelector("[data-action='toggle-create-panel']"),
      ...contractForm.querySelectorAll("[data-action='contract-test-docx']")
    ].filter(Boolean);
    contractForm.querySelectorAll("[data-action='contract-test-docx']").forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        const kind = String(btn.dataset.template || "oficina");
        await runWithBusyButton(
          btn,
          async () => {
            try {
              await generateOfficialWordContract(buildContractDocxTestPayload(kind));
              notify(userMessage("contractTestDownloaded", kind), "success");
            } catch (err) {
              notify(userMessage("contractWordError", String(err?.message || err)), "error");
            }
          },
          { busyText: "Generando…", lockExtraButtons: contractFormBusyLockButtons }
        );
      });
    });
    const templateSelect = contractForm.querySelector("select[name='contractTemplateKind']");
    const employeeSelect = contractForm.querySelector("select[name='employeeId']");
    const signDateEl = contractForm.querySelector("input[name='signDate']");
    const onContractFormSelectionChange = () => syncContractFormFromSelection(contractForm);
    if (employeeSelect) employeeSelect.addEventListener("change", onContractFormSelectionChange);
    if (templateSelect) templateSelect.addEventListener("change", onContractFormSelectionChange);
    if (signDateEl) signDateEl.addEventListener("change", onContractFormSelectionChange);

    bindHrFormWizard(contractForm);

    const applyPendingContractCandidate = () => {
      const cid = String(state.hiringUi?.prefillContractFromCandidateId || "").trim();
      if (!cid) return;
      state.hiringUi = { ...(state.hiringUi || {}), prefillContractFromCandidateId: "" };
      const modeEl = contractForm.querySelector("#contract-person-mode");
      const candSel = contractForm.querySelector("select[name='candidateId']");
      if (modeEl) modeEl.value = "candidate";
      if (candSel && [...candSel.options].some((o) => String(o.value) === cid)) candSel.value = cid;
      syncContractPersonMode();
      syncContractFormFromSelection(contractForm);
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(applyPendingContractCandidate);
    });

    wireFormSubmitGuard(
      contractForm,
      async (event) => {
      const data = readFormEntriesNormalized(contractForm);
      const personMode = String(data.contractPersonMode || "employee");
      let employee = null;
      let linkedCandidate = null;
      if (personMode === "candidate") {
        linkedCandidate = read(KEYS.candidates, []).find((c) => String(c.id) === String(data.candidateId || ""));
        if (!linkedCandidate) {
          notify("Seleccione un candidato válido.", "error");
          return;
        }
        employee = findPayrollEmployeeByIdDoc(linkedCandidate.idDoc);
        if (!employee) {
          notify(
            "Primero registre al candidato como empleado (botón «Empleado» en Consultar o desde el detalle del candidato).",
            "error"
          );
          return;
        }
      } else {
        employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(data.employeeId || ""));
      }
      if (!employee) {
        notify(userMessage("contractPickEmployee"), "error");
        return;
      }
      const missing = validateEmployeeContractDocFields(employee);
      if (missing.length) {
        notify(userMessage("contractEmployeeMissingFields", missing.join(", ")), "error");
        return;
      }
      const signDate = String(data.signDate || "").trim();
      if (!signDate) {
        notify(userMessage("contractSignDateRequired"), "error");
        return;
      }
      const payload = buildEmployeeContractDocxPayload(employee, {
        contractTemplateKind: data.contractTemplateKind,
        signDate
      });
      const contractText =
        `CONTRATO LABORAL\n` +
        `Empleado: ${employee.name}\n` +
        `Cedula: ${employee.idDoc}\n` +
        `Cargo: ${payload.cargo_empleado}\n` +
        `Tipo: ${payload.contractType}\n` +
        `Plantilla: ${payload.contractTemplateKind}\n` +
        `Salario: ${payload.salario}\n` +
        `Firma constancia: ${signDate}\n`;
      try {
        await generateOfficialWordContract(payload);
        const all = read(KEYS.contracts, []);
        const employeeCompany = getCompanyById(String(employee.companyId || ""));
        const employeePosition = getPositionById(String(employee.positionId || ""));
        const empId = String(employee.id || "").trim();
        const empDoc = String(employee.idDoc || "").trim();
        const tplKind = String(payload.contractTemplateKind || "").trim().toLowerCase();
        const matchesExisting = (row) => {
          if (!row) return false;
          const sameEmployee =
            (empId && String(row.employeeId || "") === empId) ||
            (empDoc && String(row.idDocSnapshot || "").trim() === empDoc);
          if (!sameEmployee) return false;
          const sameTemplate =
            String(row.contractTemplateKind || "").trim().toLowerCase() === tplKind;
          const sameStart = String(row.startDate || "").trim() === signDate;
          return sameTemplate && sameStart;
        };
        const existingIdx = all.findIndex(matchesExisting);
        const recordBase = {
          employeeId: employee.id,
          employeeName: employee.name,
          candidateId: linkedCandidate ? String(linkedCandidate.id) : "",
          candidateName: linkedCandidate ? String(linkedCandidate.name || "") : "",
          personType: linkedCandidate ? "Candidato" : "Empleado",
          sourceTag: linkedCandidate ? "Generado desde candidato" : "Generado desde contratación",
          positionId: String(employee.positionId || employeePosition?.id || "").trim(),
          position: payload.cargo_empleado,
          positionName: payload.cargo_empleado,
          companyId: String(employee.companyId || employeeCompany?.id || "").trim(),
          companyName: String(employeeCompany?.name || "").trim(),
          salary: payload.salario,
          transportAllowance: readEmployeeTransportAllowanceCop(employee),
          startDate: signDate,
          contractType: payload.contractType,
          contractTemplateKind: payload.contractTemplateKind,
          templateKind: payload.contractTemplateKind,
          idDocSnapshot: empDoc,
          workerRole: payload.workerRole,
          eps: String(employee.eps || "").trim(),
          pensionFund: String(employee.pensionFund || "").trim(),
          arl: String(employee.arl || "").trim(),
          schedule: String(employee.workSchedule || employeePosition?.workSchedule || "Diurna").trim(),
          source: linkedCandidate ? "Candidato" : "Empleado",
          content: contractText
        };
        if (existingIdx >= 0) {
          const previous = all[existingIdx];
          all.splice(existingIdx, 1, {
            ...previous,
            ...recordBase,
            id: previous.id,
            createdAt: previous.createdAt || nowIso(),
            updatedAt: nowIso()
          });
          notify("Contrato actualizado (mismo empleado, plantilla y fecha).", "info");
        } else {
          all.unshift({
            id: newUuidV4(),
            ...recordBase,
            createdAt: nowIso()
          });
          notify(userMessage("contractWordSaved"), "success");
        }
        const deduped =
          typeof window.dedupContracts === "function" ? window.dedupContracts(all) : all;
        try {
          await writeAwaitServer(KEYS.contracts, deduped);
          if (linkedCandidate) {
            const statusValidation = validateCandidatePipelineTransition(linkedCandidate, "Contratado");
            if (statusValidation.ok) {
              const nextCandidates = read(KEYS.candidates, []).map((c) =>
                String(c.id) === String(linkedCandidate.id)
                  ? stampUpdatedRecord({ ...c, status: "Contratado", updatedAt: nowIso() })
                  : c
              );
              try {
                await writeAwaitServer(KEYS.candidates, nextCandidates);
              } catch (_candErr) {
                /* contrato ya guardado */
              }
            }
          }
          state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
          state.hiringUi.workspace = "data";
          persistHrWorkspace("hiring", "data");
          collapseCreatePanel("create-contract");
        } catch (persistErr) {
          notify(String(persistErr?.message || "No fue posible guardar el contrato en el servidor."), "error");
        }
      } catch (wordErr) {
        notify(userMessage("contractWordError", String(wordErr?.message || "error")), "error");
      }
      renderPortalView();
      },
      {
        busyText: "Generando…",
        submitButton: contractForm.querySelector(".hr-form-wizard-submit"),
        lockExtraButtons: contractFormBusyLockButtons
      }
    );
  }

  const renderDetailRows = portalDetailRenderRows;
  const buildDetailGrid = portalDetailBuildGrid;
  const fmtMoney = (val) => `$${parseNum(val).toLocaleString("es-CO")}`;
  const fmtBool = (val) => (val ? "Sí" : "No");
  const fmtDateOr = (val, fallback = "—") => {
    const y = normalizePortalDateYmd(val);
    return y ? escapeHtml(y) : fallback;
  };
  /* ============= VACANTE: EDITAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='edit-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const all = read(KEYS.vacancies, []);
      const target = normalizeVacancyRowForEditor(all.find((v) => String(v.id) === String(btn.dataset.id || "")));
      if (!target) return;
      const positions = getActivePositions();
      const positionOpts = [
        { value: "", label: "Seleccione cargo..." },
        ...positions.map((p) => ({ value: p.id, label: String(p.name || "") }))
      ];
      openEditModal({
        title: "Editar vacante",
        subtitle: String(target.title || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "title", label: "Título de la vacante", value: target.title || "", required: true },
          { name: "positionId", label: "Cargo base", type: "select", value: target.positionId || "", options: positionOpts, required: true },
          { name: "city", label: "Ciudad", value: target.city || "" },
          { name: "department", label: "Departamento", value: target.department || "" },
          {
            name: "modality",
            label: "Modalidad",
            type: "select",
            value: target.modality || "Presencial",
            options: [
              { value: "Presencial", label: "Presencial" },
              { value: "Remoto", label: "Remoto" },
              { value: "Híbrido", label: "Híbrido" }
            ]
          },
          { name: "openings", label: "Cupos", type: "number", value: parseNum(target.openings || 1), required: true },
          { name: "salaryOffer", label: "Salario ofrecido (COP)", type: "number", value: parseNum(target.salaryOffer || 0), required: true },
          { name: "deadline", label: "Cierre postulaciones", type: "date", value: target.deadline || "", required: true },
          {
            name: "publishedFrom",
            label: "Visible en web desde",
            type: "date",
            value: target.publishedFrom || ""
          },
          { name: "requirements", label: "Requisitos y perfil", type: "textarea", value: target.requirements || "", rows: 4 },
          {
            name: "status",
            label: "Estado",
            type: "select",
            value: target.status || "Publicada",
            options: [
              { value: "Publicada", label: "Publicada" },
              { value: "Cerrada", label: "Cerrada" }
            ]
          }
        ],
        onSubmit: async (form) => {
          const position = getPositionById(String(form.positionId || ""));
          if (!position) {
            notify(userMessage("vacancySelectPosition"), "error");
            return false;
          }
          const salaryValidation = validateVacancySalaryOffer(form.salaryOffer, position);
          if (!salaryValidation.ok) {
            notify(salaryValidation.message, "error");
            return false;
          }
          const deadline = String(form.deadline || "").trim();
          const deadlineOk = (() => {
            const parts = deadline.split("-");
            if (parts.length !== 3) return false;
            const cand = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
            if (!Number.isFinite(cand)) return false;
            const t = new Date();
            const t0 = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
            return cand >= t0;
          })();
          if (!deadlineOk) {
            notify(userMessage("vacancyDeadlineFuture"), "error");
            return false;
          }
          const pFrom = String(form.publishedFrom || "").trim();
          if (pFrom) {
            if (!publicVacancyYmdValid(pFrom)) {
              notify("Indique una fecha válida en “Visible en web desde”, o déjela vacía.", "error");
              return false;
            }
            if (publicVacancyYmdValid(deadline) && publicVacancyYmdToMidnight(pFrom) > publicVacancyYmdToMidnight(deadline)) {
              notify("“Visible desde” no puede ser posterior a la fecha límite de postulaciones.", "error");
              return false;
            }
          }
          const freshVacancies = read(KEYS.vacancies, []);
          const nextVacancies = freshVacancies.map((v) =>
            String(v.id) !== String(target.id)
              ? v
              : stampUpdatedRecord({
                  ...v,
                  title: normalizeLatinUpperForDb(String(form.title || "").trim()),
                  positionId: position.id,
                  positionName: position.name,
                  workerRole: position.workerRole || v.workerRole || "empleado",
                  contractTypeDefault: position.contractTypeDefault || v.contractTypeDefault,
                  city: normalizeLatinForDb(String(form.city || "").trim()),
                  department: normalizeLatinForDb(String(form.department || "").trim()),
                  modality: normalizeLatinUpperForDb(String(form.modality || "").trim()),
                  openings: Math.max(1, parseNum(form.openings || 1)),
                  salaryOffer: salaryValidation.salaryOffer,
                  deadline,
                  publishedFrom: pFrom,
                  requirements: normalizeLatinUpperForDb(String(form.requirements || "").trim()),
                  status: String(form.status || "Publicada")
                })
          );
          write(KEYS.vacancies, nextVacancies, { skipSyncSchedule: true });
          try {
            await writeAwaitServer(KEYS.vacancies, nextVacancies);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar la vacante en el servidor."), "error");
            return false;
          }
          notify("Vacante actualizada.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  /* ============= CARGO: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = read(KEYS.positions, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!p) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const sections = [
        {
          icon: "briefcase",
          title: "Cargo",
          rows: renderDetailRows([
            ["Nombre", `<strong>${escapeHtml(String(p.name || ""))}</strong>`],
            ["Rol", p.workerRole === "conductor" ? "Conductor" : "Empleado"],
            ["Salario base", fmtMoney(p.baseSalary)],
            ["Auxilio transporte", fmtMoney(readPositionTransportAllowanceCop(p))],
            ["Tipo de contrato", escapeHtml(String(p.contractTypeDefault || "-"))],
            ["Estado", p.active === false ? '<span class="status status-rechazada">Inactivo</span>' : '<span class="status status-viaje_asignado">Activo</span>'],
            ["Jornada", escapeHtml(String(p.workSchedule || "-"))],
            ["Riesgo ARL", escapeHtml(String(p.arlRiskLevel || "-"))],
            ["Salario integral", fmtBool(String(p.integralSalary) === "true" || p.integralSalary === true)],
            ["Base legal", escapeHtml(String(p.legalBasis || "CST"))],
            ["Creado", fmtDateOr(p.createdAt)],
            ["Última actualización", fmtDateOr(p.updatedAt || p.createdAt)]
          ])
        }
      ];
      openInfoModal({
        title: `Cargo: ${String(p.name || "")}`,
        subtitle: p.workerRole === "conductor" ? "Conductor" : "Empleado",
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const all = read(KEYS.positions, []);
      const target = normalizePositionRowForEditor(all.find((p) => String(p.id) === String(btn.dataset.id || "")));
      if (!target) return;
      const contractOpts = editModalCatalogSelectOptions(
        CO_CATALOGS.positionContractTypes,
        target.contractTypeDefault
      );
      const scheduleOpts = editModalCatalogSelectOptions(CO_CATALOGS.workSchedule, target.workSchedule);
      const arlOpts = editModalCatalogSelectOptions(CO_CATALOGS.arlRiskLevels, target.arlRiskLevel);
      openEditModal({
        title: "Editar cargo",
        subtitle: String(target.name || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "name", label: "Nombre del cargo", value: target.name || "", required: true },
          {
            name: "workerRole",
            label: "Rol del cargo",
            type: "select",
            value: target.workerRole || "empleado",
            options: [
              { value: "empleado", label: "Empleado" },
              { value: "conductor", label: "Conductor" }
            ]
          },
          {
            name: "salaryBasis",
            label: "Referencia salarial",
            type: "select",
            value: positionSalaryUsesSmmlv(target.baseSalary) ? "smmlv" : "custom",
            options: [
              { value: "smmlv", label: "Salario mínimo legal (SMMLV)" },
              { value: "custom", label: "Otro valor (ajustar)" }
            ]
          },
          { name: "baseSalary", label: "Salario base (COP)", type: "number", value: parseNum(target.baseSalary || 0), required: true },
          {
            name: "transportAllowance",
            label: "Auxilio transporte (COP)",
            type: "number",
            value: readPositionTransportAllowanceCop(target),
            required: true
          },
          { name: "contractTypeDefault", label: "Contrato sugerido", type: "select", value: target.contractTypeDefault || "", options: contractOpts },
          { name: "workSchedule", label: "Jornada", type: "select", value: target.workSchedule || "", options: scheduleOpts },
          { name: "arlRiskLevel", label: "Nivel ARL", type: "select", value: target.arlRiskLevel || "", options: arlOpts },
          {
            name: "integralSalary",
            label: "Salario integral",
            type: "select",
            value: String(target.integralSalary) === "true" || target.integralSalary === true ? "true" : "false",
            options: [
              { value: "false", label: "No" },
              { value: "true", label: "Sí" }
            ]
          },
          { name: "legalBasis", label: "Base legal", value: target.legalBasis || "CST art. 45-46 y normatividad laboral vigente" }
        ],
        afterMount: (formEl) => {
          bindPositionCompensationFields(formEl, {
            basisSelector: 'select[name="salaryBasis"]',
            salarySelector: 'input[name="baseSalary"]',
            auxSelector: 'input[name="transportAllowance"]',
            preserveExistingValue: true
          });
        },
        onSubmit: async (form) => {
          const minSalary = CO_HR_RULES.minMonthlySalary;
          const baseSalary =
            String(form.salaryBasis || "smmlv") === "smmlv" ? minSalary : parseNum(form.baseSalary);
          const comp = validateColombiaPositionCompensation({
            baseSalary,
            integralSalary: String(form.integralSalary || "false") === "true",
            transportAllowance: form.transportAllowance
          });
          if (!comp.ok) {
            notify(comp.message, "error");
            return false;
          }
          const freshAll = read(KEYS.positions, []);
          const nextPos = freshAll.map((p) =>
              String(p.id) !== String(target.id)
                ? p
                : stampUpdatedRecord({
                    ...p,
                    name: normalizeLatinUpperForDb(String(form.name || "").trim()),
                    workerRole: String(form.workerRole || "empleado"),
                    baseSalary: comp.baseSalary,
                    transportAllowance: comp.transportAllowance,
                    contractTypeDefault: normalizeLatinUpperForDb(
                      String(form.contractTypeDefault || p.contractTypeDefault || "").trim()
                    ),
                    workSchedule: normalizeLatinUpperForDb(String(form.workSchedule || "").trim()),
                    arlRiskLevel: normalizeLatinUpperForDb(String(form.arlRiskLevel || p.arlRiskLevel || "").trim()),
                    integralSalary: String(form.integralSalary || "false") === "true",
                    legalBasis: normalizeLatinUpperForDb(String(form.legalBasis || p.legalBasis || "").trim())
                  })
            );
          const ok = await persistPositionsCatalog(nextPos, { optimistic: true });
          if (!ok) return false;
          notify("Cargo actualizado.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.positions, []).find((p) => String(p.id) === id);
      if (!target) return;
      const linkedVacancies = read(KEYS.vacancies, []).filter((v) => String(v.positionId || "") === id).length;
      const linkedContracts = read(KEYS.contracts, []).filter((c) => String(c.positionId || "") === id).length;
      if (linkedVacancies > 0) {
        notify(`No se puede eliminar: hay ${linkedVacancies} vacante(s) que referencian este cargo. Cierra o reasigna primero.`, "error");
        return;
      }
      if (linkedContracts > 0) {
        notify(`No se puede eliminar: hay ${linkedContracts} contrato(s) vinculados a este cargo. Elimine o reasigne esos contratos primero.`, "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar cargo",
        message: `Se eliminará permanentemente el cargo "${String(target.name || "")}" del catálogo. Los empleados en nómina conservan su historial; no se borran contratos ya registrados.`,
        confirmText: "Eliminar cargo",
        onConfirm: async () => {
          const ok = await removeFromPortalListAwaitServer(KEYS.positions, id);
          if (!ok) return;
          notify("Cargo eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= CANDIDATO: PROGRAMAR ENTREVISTA DESDE TABLA ============= */
  nodes.viewRoot.querySelectorAll("[data-action='schedule-interview-for-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cid = String(btn.dataset.candidateId || "").trim();
      if (!cid) return;
      const cand = read(KEYS.candidates, []).find((c) => String(c.id) === cid);
      if (!cand) {
        notify(userMessage("genericError"), "error");
        return;
      }
      if (["Contratado", "Descartado"].includes(String(cand.status || ""))) {
        notify("Este candidato ya no está en proceso; no se puede agendar entrevista.", "info");
        return;
      }
      state.hiringUi = { ...(state.hiringUi || {}), scheduleInterviewOpenForCandidateId: cid };
      state.createPanels = { ...(state.createPanels || {}) };
      const HIRING_CREATE_IDS = ["create-position", "create-vacancy", "create-candidate", "create-interview", "create-contract"];
      HIRING_CREATE_IDS.forEach((id) => {
        state.createPanels[id] = id === "create-interview";
      });
      state.hiringUi.workspace = "operate";
      persistHrWorkspace("hiring", "operate");
      renderPortalView();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToCreatePanelForm("create-interview"));
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='create-employee-from-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const cid = String(btn.dataset.candidateId || "").trim();
      if (!cid) return;
      openPayrollEmployeeFromCandidate(cid);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='generate-contract-from-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const cid = String(btn.dataset.candidateId || "").trim();
      if (!cid) return;
      const cand = read(KEYS.candidates, []).find((c) => String(c.id) === cid);
      if (!cand) {
        notify(userMessage("genericError"), "error");
        return;
      }
      if (!findPayrollEmployeeByIdDoc(cand.idDoc)) {
        notify("Registre primero al candidato como empleado antes de generar el contrato.", "error");
        openPayrollEmployeeFromCandidate(cid);
        return;
      }
      openHiringContractFromCandidate(cid);
    });
  });

  /* ============= CANDIDATO: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = read(KEYS.candidates, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!c) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const { attachmentsHtml: attHtml, experienceFromJson } = parseCandidateAttachmentsForView(c.attachments);
      const experienceSummary = String(c.experienceNotes || experienceFromJson || "").trim();
      const ageDisp = portalCandidateAgeFromBirthIso(c.birthDate);
      const attachmentsInner =
        String(attHtml || "").trim() !== ""
          ? attHtml
          : `<span class="muted">Sin archivos adjuntos registrados para este candidato.</span>`;
      const salaryShow = parseNum(c.expectedSalary ?? c.salaryExpectation ?? c.aspiration ?? 0);
      const availShow = String(c.availabilityDate || c.availableFrom || "").trim();
      const statusShow = String(c.status || c.pipelineStage || "").trim();
      const postulationRows = [
        ["Vacante", escapeHtml(String(c.vacancyTitle || "-"))],
        ["Estado", statusShow ? `<span class="status ${hiringPipelineStatusClass(statusShow)}">${escapeHtml(statusShow)}</span>` : "—"],
        ["Origen", escapeHtml(String(c.source || "Portal"))],
        ["Años de experiencia en el cargo", `${String(parseNum(c.experienceYears || 0))} años`]
      ];
      if (experienceSummary) {
        postulationRows.push(["Experiencia (resumen)", `<p class="detail-note" style="white-space:pre-wrap;margin:0">${escapeHtml(experienceSummary)}</p>`]);
      }
      postulationRows.push(
        ["Aspiración salarial", fmtMoney(salaryShow)],
        ["Disponibilidad", fmtDateOr(availShow)],
        ["Registrado", fmtDateOr(c.createdAt)],
        ["Última actualización", fmtDateOr(c.updatedAt || c.createdAt)]
      );
      const sections = [
        {
          icon: "user",
          title: "Identificación",
          rows: renderDetailRows([
            ["Nombre", `<strong>${escapeHtml(String(c.name || ""))}</strong>`],
            ["Documento", `${escapeHtml(String(c.documentType || "-"))} ${escapeHtml(String(c.idDoc || ""))}`],
            ["Fecha de nacimiento", fmtDateOr(ageDisp.birthLabel === "—" ? "" : ageDisp.birthLabel)],
            ["Edad", ageDisp.age != null ? `${String(ageDisp.age)} años` : "—"],
            ["Correo", escapeHtml(String(c.email || "-"))],
            ["Teléfono", escapeHtml(String(c.phone || "-"))],
            ["Ciudad", escapeHtml(String(c.city || "-"))],
            ["Departamento", escapeHtml(String(c.department || "-"))],
            ["Dirección", escapeHtml(String(c.address || "-"))]
          ])
        },
        {
          icon: "briefcase",
          title: "Postulación",
          rows: renderDetailRows(postulationRows)
        },
        {
          icon: "file",
          title: "Adjuntos",
          rows: `<div class="detail-perms-list">${attachmentsInner}</div>`
        }
      ];
      const cvDlModal = extractCandidateCvDownload(c);
      const canDlCvModal = Boolean(cvDlModal?.href) || candidateMayHaveCvInStorage(c);
      const canSchedule = !["Contratado", "Descartado"].includes(String(c.status || ""));
      const employeeMatch = findPayrollEmployeeByIdDoc(c.idDoc);
      const modalActions = [
        `<button type="button" class="btn btn-action"${canDlCvModal ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}">${IC.download} Descargar CV</button>`,
        canSchedule && canManageHiringModule()
          ? `<button type="button" class="btn btn-action" data-action="schedule-interview-for-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.calendar} Agendar entrevista</button>`
          : "",
        canManageHiringModule()
          ? `<button type="button" class="btn btn-action" data-action="create-employee-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.userPlus} Crear empleado</button>`
          : "",
        canManageHiringModule() && employeeMatch
          ? `<button type="button" class="btn btn-primary" data-action="generate-contract-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.file} Generar contrato</button>`
          : ""
      ]
        .filter(Boolean)
        .join("");
      openInfoModal({
        title: String(c.name || "Candidato"),
        subtitle: String(c.vacancyTitle || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true,
        secondaryActionsHtml: modalActions
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const all = read(KEYS.candidates, []);
      const target = all.find((c) => String(c.id) === String(btn.dataset.id || ""));
      if (!target) return;
      const vacancyOpts = [
        { value: "", label: "Seleccione vacante..." },
        ...read(KEYS.vacancies, []).map((v) => ({ value: v.id, label: `${v.title || "Vacante"}${v.positionName ? ` (${v.positionName})` : ""}` }))
      ];
      const docTypeOpts = [
        { value: "", label: "Seleccione..." },
        ...CO_CATALOGS.documentTypes.map((d) => ({ value: d, label: d }))
      ];
      const educationOpts = [
        { value: "", label: "Seleccione..." },
        ...CO_CATALOGS.educationLevel.map((level) => ({ value: level, label: level }))
      ];
      const statusOpts = [...new Set([String(target.status || PIPELINE[0]), ...(PIPELINE_TRANSITIONS[String(target.status || PIPELINE[0])] || [])])].map(
        (s) => ({ value: s, label: s })
      );
      openEditModal({
        title: "Editar candidato",
        subtitle: String(target.name || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "name", label: "Nombre completo", value: target.name || "", required: true },
          { name: "email", label: "Correo", type: "email", value: target.email || "", required: true },
          { name: "phone", label: "Teléfono", value: target.phone || "" },
          { name: "documentType", label: "Tipo documento", type: "select", value: target.documentType || "CC", options: docTypeOpts, required: true },
          { name: "idDoc", label: "N° documento", value: target.idDoc || "", required: true },
          { name: "birthDate", label: "Fecha de nacimiento", type: "date", value: target.birthDate || "", required: true },
          { name: "city", label: "Ciudad", value: target.city || "" },
          { name: "department", label: "Departamento", value: target.department || "" },
          { name: "address", label: "Dirección", value: target.address || "" },
          { name: "educationLevel", label: "Nivel educativo", type: "select", value: target.educationLevel || "", options: educationOpts },
          { name: "experienceYears", label: "Años de experiencia en el cargo", type: "number", value: parseNum(target.experienceYears || 0), min: 0, max: 65, required: true },
          { name: "expectedSalary", label: "Aspiración salarial", type: "number", value: parseNum(target.expectedSalary || 0) },
          { name: "availabilityDate", label: "Disponibilidad", type: "date", value: target.availabilityDate || "" },
          { name: "vacancyId", label: "Vacante", type: "select", value: target.vacancyId || "", options: vacancyOpts, required: true },
          { name: "status", label: "Estado pipeline", type: "select", value: target.status || PIPELINE[0], options: statusOpts },
          { name: "source", label: "Origen", value: target.source || "Portal RRHH" }
        ],
        afterMount: (formEl) => {
          applyDocumentFieldConstraints(formEl);
          formEl.querySelector("input[name='phone']")?.setAttribute("pattern", "[0-9]{10,15}");
          formEl.querySelector("input[name='phone']")?.setAttribute("minlength", "10");
          formEl.querySelector("input[name='phone']")?.setAttribute("maxlength", "15");
          formEl.querySelector("input[name='phone']")?.setAttribute("inputmode", "tel");
        },
        onSubmit: async (form) => {
          const docValidation = validateColombianDocument(form.documentType, form.idDoc);
          if (!docValidation.ok) {
            notify(docValidation.message, "error");
            return false;
          }
          const birthCand = String(form.birthDate || "")
            .trim()
            .slice(0, 10);
          const ageCheck = validateWorkerMinimumAge(birthCand, "candidato");
          if (!ageCheck.ok) {
            notify(ageCheck.message, "error");
            return false;
          }
          const aspirationCheck = validateColombiaMonthlySalaryCop(form.expectedSalary, "Aspiración salarial");
          if (!aspirationCheck.ok) {
            notify(aspirationCheck.message, "error");
            return false;
          }
          const expectedSalary = aspirationCheck.amount;
          const vac = read(KEYS.vacancies, []).find((v) => String(v.id) === String(form.vacancyId));
          if (!vac) {
            notify(userMessage("hireSelectVacancy"), "error");
            return false;
          }
          if (
            String(form.vacancyId || "") !== String(target.vacancyId || "") &&
            !isVacancyAcceptingApplications(vac)
          ) {
            notify("No puede asignar a una vacante cerrada o con fecha límite vencida.", "error");
            return false;
          }
          const offerRef = parseNum(vac.salaryOffer);
          if (offerRef > 0 && expectedSalary < offerRef) {
            notify(
              `La aspiración salarial no puede ser inferior al salario ofrecido ($${offerRef.toLocaleString("es-CO")}).`,
              "error"
            );
            return false;
          }
          const nextStatus = String(form.status || target.status || PIPELINE[0]);
          const statusValidation = validateCandidatePipelineTransition(
            { ...target, status: target.status },
            nextStatus
          );
          if (!statusValidation.ok) {
            notify(statusValidation.message, "error");
            return false;
          }
          const freshCandidates = read(KEYS.candidates, []);
          const nextCandidates = freshCandidates.map((c) =>
              String(c.id) !== String(target.id)
                ? c
                : stampUpdatedRecord({
                    ...c,
                    name: normalizeLatinUpperForDb(String(form.name || "").trim()),
                    email: normalizeEmail(String(form.email || "").trim()),
                    phone: normalizePortalPhoneForStorage(form.phone),
                    documentType: form.documentType,
                    idDoc: docValidation.normalized,
                    birthDate: birthCand,
                    city: normalizeLatinForDb(String(form.city || "").trim()),
                    department: normalizeLatinForDb(String(form.department || "").trim()),
                    address: normalizeLatinUpperForDb(String(form.address || "").trim()),
                    educationLevel: normalizeLatinUpperForDb(String(form.educationLevel || "").trim()),
                    experienceYears: Math.max(0, parseNum(form.experienceYears || 0)),
                    expectedSalary,
                    availabilityDate: form.availabilityDate || "",
                    vacancyId: vac.id,
                    vacancyTitle: vac.title,
                    status: nextStatus,
                    source: String(form.source || "Portal RRHH")
                  })
            );
          write(KEYS.candidates, nextCandidates, { skipSyncSchedule: true });
          try {
            await writeAwaitServer(KEYS.candidates, nextCandidates);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el candidato en el servidor."), "error");
            return false;
          }
          notify("Candidato actualizado.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.candidates, []).find((c) => String(c.id) === id);
      if (!target) return;
      const linkedInterviews = read(KEYS.interviews, []).filter((i) => String(i.candidateId || "") === id).length;
      openConfirmModal({
        title: "Eliminar candidato",
        message: `Se eliminará al candidato "${String(target.name || "")}" del pipeline${linkedInterviews ? ` y sus ${linkedInterviews} entrevista(s) asociada(s)` : ""}.`,
        confirmText: "Eliminar candidato",
        onConfirm: async () => {
          const interviewIds = read(KEYS.interviews, [])
            .filter((i) => String(i.candidateId || "") === id)
            .map((i) => String(i.id || ""))
            .filter(Boolean);
          const okCandidate = await removeFromPortalListAwaitServer(KEYS.candidates, id);
          if (!okCandidate) return;
          if (interviewIds.length > 0) {
            const prevInterviews = read(KEYS.interviews, []);
            const nextInterviews = prevInterviews.filter((i) => String(i.candidateId || "") !== id);
            const okInterviews = await writePortalListPrunedAwaitServer(
              KEYS.interviews,
              nextInterviews,
              interviewIds,
              { notifyOnFailure: false }
            );
            if (!okInterviews) {
              notify(
                "Candidato eliminado, pero no se pudieron quitar las entrevistas en el servidor. Actualice la página.",
                "error"
              );
              renderPortalView();
              return;
            }
          }
          notify("Candidato eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= ENTREVISTA: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-interview']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = read(KEYS.interviews, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!i) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const sections = [
        {
          icon: "calendar",
          title: "Programación",
          rows: renderDetailRows([
            ["Candidato", `<strong>${escapeHtml(String(i.candidateName || "-"))}</strong>`],
            ["Fecha y hora", escapeHtml(formatInterviewWhenDisplay(i.when))],
            ["Entrevistador", escapeHtml(String(i.interviewer || "-"))],
            ["Modalidad", escapeHtml(String(i.modality || "-"))],
            ["Lugar / enlace", escapeHtml(String(i.locationOrLink || "-"))]
          ])
        },
        {
          icon: "file",
          title: "Notas",
          rows: i.notes
            ? `<p class="detail-note" style="white-space:pre-wrap;margin:0">${escapeHtml(String(i.notes))}</p>`
            : `<span class="muted">Sin notas.</span>`
        }
      ];
      openInfoModal({
        title: `Entrevista · ${String(i.candidateName || "")}`,
        subtitle: formatInterviewWhenDisplay(i.when),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>`,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-interview']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const all = read(KEYS.interviews, []);
      const target = normalizeInterviewRowForEditor(all.find((i) => String(i.id) === String(btn.dataset.id || "")));
      if (!target) return;
      openEditModal({
        title: "Editar entrevista",
        subtitle: String(target.candidateName || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "when", label: "Fecha y hora", type: "datetime-local", value: target.whenLocal || "", required: true },
          { name: "interviewer", label: "Entrevistador(a)", value: target.interviewer || "", required: true },
          {
            name: "modality",
            label: "Modalidad",
            type: "select",
            value: target.modality || "Presencial",
            options: [
              { value: "Presencial", label: "Presencial" },
              { value: "Virtual", label: "Virtual" },
              { value: "Telefónica", label: "Telefónica" }
            ]
          },
          { name: "locationOrLink", label: "Lugar o enlace", value: target.locationOrLink || "" },
          { name: "notes", label: "Notas", type: "textarea", value: target.notes || "", rows: 3 }
        ],
        onSubmit: async (form) => {
          const ts = new Date(String(form.when || "")).getTime();
          if (!Number.isFinite(ts)) {
            notify("Fecha y hora inválidas.", "error");
            return false;
          }
          const freshInterviews = read(KEYS.interviews, []);
          const nextInterviews = freshInterviews.map((i) =>
              String(i.id) !== String(target.id)
                ? i
                : stampUpdatedRecord({
                    ...i,
                    when: form.when,
                    interviewer: normalizeLatinUpperForDb(String(form.interviewer || "").trim()),
                    modality: String(form.modality || ""),
                    locationOrLink: normalizeLatinUpperForDb(String(form.locationOrLink || "").trim()),
                    notes: normalizeLatinUpperForDb(String(form.notes || "").trim())
                  })
            );
          write(KEYS.interviews, nextInterviews, { skipSyncSchedule: true });
          try {
            await writeAwaitServer(KEYS.interviews, nextInterviews);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar la entrevista en el servidor."), "error");
            return false;
          }
          notify("Entrevista actualizada.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-interview']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.interviews, []).find((i) => String(i.id) === id);
      if (!target) return;
      openConfirmModal({
        title: "Eliminar entrevista",
        message: `Se eliminará la entrevista de "${String(target.candidateName || "")}".`,
        confirmText: "Eliminar entrevista",
        onConfirm: async () => {
          const ok = await removeFromPortalListAwaitServer(KEYS.interviews, id);
          if (!ok) return;
          notify("Entrevista eliminada.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= CONTRATO: VER (DETALLE) / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-contract-detail']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = read(KEYS.contracts, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!c) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const employee = c.employeeId
        ? read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(c.employeeId))
        : null;
      const sections = [
        {
          icon: "user",
          title: "Persona",
          rows: renderDetailRows([
            ["Nombre", `<strong>${escapeHtml(String(c.candidateName || c.employeeName || employee?.name || "-"))}</strong>`],
            ["Documento", escapeHtml(String(c.idDocSnapshot || employee?.idDoc || "-"))],
            ["Cargo", escapeHtml(String(c.position || c.positionName || employee?.position || "-"))],
            ["Origen", escapeHtml(String(c.source || c.sourceTag || (c.employeeId ? "Empleado" : "Candidato")))]
          ])
        },
        {
          icon: "file",
          title: "Contrato",
          rows: renderDetailRows([
            ["Tipo", escapeHtml(String(c.contractType || "-"))],
            ["Plantilla", escapeHtml(String(c.contractTemplateKind || c.templateKind || "-"))],
            ["Salario", fmtMoney(c.salary)],
            ["Inicio", fmtDateOr(c.startDate)],
            ["Fin", fmtDateOr(c.endDate)],
            ["Generado", fmtDateOr(c.createdAt)]
          ])
        }
      ];
      const contentHtml = c.content
        ? `<section class="detail-section"><h4 class="detail-section-title">${IC.file || ""}<span>Resumen interno</span></h4><pre class="detail-pre">${escapeHtml(String(c.content))}</pre></section>`
        : "";
      openInfoModal({
        title: `Contrato · ${String(c.candidateName || c.employeeName || "")}`,
        subtitle: String(c.position || ""),
        bodyHtml: `<div class="detail-grid">${buildDetailGrid(sections)}</div>${contentHtml}`,
        wide: true
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-contract']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.contracts, []).find((c) => String(c.id) === id);
      if (!target) return;
      openConfirmModal({
        title: "Eliminar contrato",
        message: `Se eliminará el registro del contrato de "${String(target.candidateName || target.employeeName || "")}". El archivo Word ya descargado no se borrará automáticamente.`,
        confirmText: "Eliminar contrato",
        onConfirm: async () => {
          const ok = await removeFromPortalListAwaitServer(KEYS.contracts, id);
          if (!ok) return;
          notify("Contrato eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  const hiringSearchRestore = state.__hiringDataListSearchRestore;
  if (hiringSearchRestore && typeof hiringSearchRestore.start === "number") {
    delete state.__hiringDataListSearchRestore;
    queueMicrotask(() => {
      const root = nodes.viewRoot;
      if (!root || String(state.currentView || "") !== "hiring") return;
      const inp = root.querySelector("[data-action='hiring-data-list-search']");
      if (!inp || typeof inp.focus !== "function") return;
      inp.focus();
      if (typeof inp.setSelectionRange === "function") {
        const n = String(inp.value || "").length;
        const s = Math.max(0, Math.min(hiringSearchRestore.start, n));
        const e = Math.max(0, Math.min(hiringSearchRestore.end ?? hiringSearchRestore.start, n));
        inp.setSelectionRange(s, e);
      }
    });
  }
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ hiringHtml });
})();

(function registerHiringPortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.hiring = bindHiringPortalControls;
})();
