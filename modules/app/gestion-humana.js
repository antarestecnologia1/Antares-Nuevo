/**
 * Gestión humana — listeners post-render (indPayrollPortalControls).
 */
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
      const smmlvCop = parseNum(fd.get("smmlvCop"));
      if (smmlvCop <= 0) {
        failPortalField(payrollLegalForm, "smmlvCop", "Indique un SMMLV vÃ¡lido mayor que cero.");
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
        failPortalField(payrollLegalForm, "pensionEmployeeRatePct", "La tarifa de pensiÃ³n debe estar entre 0 y 100 %.");
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
          "Seleccione el aÃ±o de vigencia a aplicar globalmente en modo manual."
        );
        return;
      }
      const body = {
        year,
        smmlvCop,
        transportAllowanceCop,
        healthEmployeeRate: healthEmployeeRatePct / 100,
        pensionEmployeeRate: pensionEmployeeRatePct / 100,
        uvtCop: uvtRaw ? parseNum(uvtRaw) : null,
        legalWeeklyHours,
        platformReferenceYear:
          platformReferenceMode === "manual"
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
              ? `Vigencia ${year} guardada. Se detectaron ${saved.affectedPayrollRuns} liquidaciones de ese aÃ±o.`
              : `Vigencia ${year} guardada correctamente. Plataforma en ${body.platformReferenceYear ? `modo manual ${body.platformReferenceYear}` : "modo automÃ¡tico"}.`,
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
          message: `Este aÃ±o ya tiene ${affectedRuns} liquidacion${affectedRuns === 1 ? "" : "es"} registradas. Confirme para actualizar las referencias legales sin borrar el historico.`,
          confirmText: "Guardar vigencia",
          onConfirm: submit
        });
        return;
      }
      await submit();
    }, { busyText: "Guardando vigenciaâ€¦" });
  }

  const runPayrollLegalDelete = async (yearLike) => {
    const year = clampLaborSystemParameterYear(yearLike);
    if (!year) {
      notify("Indique un aÃ±o vÃ¡lido.", "error");
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
          ? `Se eliminarÃ¡n los parÃ¡metros legales del aÃ±o ${year} en base de datos. Las ${affectedRuns} liquidaciÃ³n${affectedRuns === 1 ? "" : "es"} de ese aÃ±o no se borran; solo dejan de tener esta vigencia como referencia guardada.`
          : `Se eliminarÃ¡n todos los parÃ¡metros legales registrados para el aÃ±o ${year}. Esta acciÃ³n no se puede deshacer.`,
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
        notify(`Formulario precargado desde candidato Â«${String(prefillCandidate.name || "").trim()}Â». Complete seguridad social y banco.`, "info");
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
          { busyText: "Generandoâ€¦", lockExtraButtons: employeeContractDraftLockButtons }
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
        /* wireFormDocDuplicateCheck ya notificÃ³ y marcÃ³ el campo con el duplicado. */
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
      // Si el avatar terminÃ³ como `data:` URL (R2 no disponible), recortarlo
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
      busyText: "Guardando empleadoâ€¦",
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
          /* usar cachÃ© local */
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
        subtitle: `${String(target.position || "Colaborador").trim()} Â· ${String(target.idDoc || "").trim()}`,
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
          const actor = currentUser();
          const docValidation = validateColombianDocument(payload.documentType, payload.idDoc);
          if (!docValidation.ok) {
            failPortalField(formEl, "idDoc", docValidation.message);
            return false;
          }
          const dupCheck = wireEmployeePayrollDuplicateDocCheck(formEl, { excludeId: target.id });
          if (!(await dupCheck({ forceServer: true, fromSubmit: true }))) {
            /* wireFormDocDuplicateCheck ya notificÃ³ y marcÃ³ el campo con el duplicado. */
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
            failPortalField(formEl, packed.field || "name", packed.msg);
            return false;
          }
          const nextPayload = packed.payload;
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
          if (actor?.role !== ROLES.ADMIN) {
            const stripAvatar = String(nextAvatar || "").startsWith("data:");
            try {
              await queueApproval({
                type: "update_employee",
                title: `Modificacion de colaborador ${nextPayload.name}`,
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
        notify("Solo administradores o recursos humanos pueden ejecutar liquidaciÃ³n masiva.", "error");
        return;
      }
      const fechaEl = document.getElementById("payroll-bulk-fecha");
      const forceEl = document.getElementById("payroll-bulk-force");
      const fechaReferencia = readFormDateIso(document, "payroll-bulk-fecha") || readFormDateIso(document, "fechaReferencia");
      if (!fechaReferencia) {
        failPortalField(fechaEl?.closest("form") || nodes.viewRoot, fechaEl || "fechaReferencia", "Indique una fecha de cierre vÃ¡lida (DD/MM/AAAA).");
        return;
      }
      const force = Boolean(forceEl?.checked);
      const busyLabel = payrollBulkBtn.querySelector("span");
      const busyOrig = busyLabel?.textContent || "";
      payrollBulkBtn.disabled = true;
      payrollBulkBtn.setAttribute("aria-busy", "true");
      if (busyLabel) busyLabel.textContent = "Generandoâ€¦";
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
        notify(String(err?.message || "No fue posible ejecutar la liquidaciÃ³n masiva."), "error");
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
        failPortalField(payrollForm, "employeeId", userMessage("contractPickEmployee"));
        return;
      }
      if (!monthRange(data.month)) {
        failPortalField(payrollForm, "month", userMessage("payrollSelectMonth"));
        return;
      }

      if (employeeIsConductorServiceProvider(employee)) {
        failPortalField(payrollForm, "employeeId", userMessage("payrollConductorUseDriverForm"));
        return;
      }

      const payFreqNorm = normalizePayrollFrequencyJs(employee.payFrequency);
      const periodKey = buildPayrollPeriodKeyFromForm(data.month, employee.payFrequency, data.payrollQuincena);
      const payrollKind = payFreqNorm === "mensual" ? "mensual" : payFreqNorm;
      const diasCorte = payrollDaysInManualCut(data.month, employee.payFrequency, data.payrollQuincena);
      const existingPayrollRuns = read(KEYS.payrollRuns, []);
      const primaRequested = Boolean(data.payPrimaServicios);
      const interesesRequested = Boolean(data.payInteresesCesantias);
      let payPrima = false;
      if (primaRequested) {
        const primaCheck = payrollValidatePrimaForManualCut({
          employeeId: employee.id,
          calendarMonthYm: data.month,
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
      if (payPrima && !payrollMonthIsPrimaSemester(data.month)) {
        failPortalField(payrollForm, "month", "La prima de servicios solo se parametriza cuando el mes liquidado es junio (06) o diciembre (12).");
        return;
      }
      let payInteresesCesantias = false;
      if (interesesRequested) {
        const intCheck = payrollValidateCesantiasInterestForManualCut({
          employeeId: employee.id,
          calendarMonthYm: data.month,
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
      if (payInteresesCesantias && !payrollMonthIsCesantiasInterestMonth(data.month)) {
        failPortalField(
          payrollForm,
          "month",
          "Los intereses sobre cesantÃ­as (Ley 52/1975) solo se parametrizan cuando el mes liquidado es enero (01) o febrero (02), perÃ­odos donde suele consignarse o pagarse ese concepto cercano al cierre legal de enero. Ajuste con su contador."
        );
        return;
      }
      const primaDaysRounded = Math.floor(parseNum(data.primaServiciosDays));
      let primaServiciosCop = payPrima ? Math.max(0, parseNum(data.primaServiciosCop)) : 0;
      if (payPrima && (!Number.isFinite(primaDaysRounded) || primaDaysRounded < 1)) {
        failPortalField(payrollForm, "primaServiciosDays", "Indique los dÃ­as laborados en el semestre para calcular o validar la prima de servicios.");
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
        failPortalField(payrollForm, "cesantiasInterestBaseCop", "Indique la base en pesos de las cesantÃ­as (p. ej. consignaciones del aÃ±o anterior) para calcular o registrar los intereses.");
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
          "Ajustes orientativos por ausencias con efecto en nÃ³mina (incapacidades y licencias no remuneradas). No sustituyen liquidaciÃ³n legal, soporte mÃ©dico, acto del empleador ni validaciÃ³n contable."
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
        failPortalField(
          payrollForm,
          "month",
          `Ya existe una liquidaciÃ³n (${payrollRunTypeLabel({ payrollKind, month: periodKey })}) para este empleado y periodo.`
        );
        return;
      }
      runs.unshift(run);
      try {
        await writeAwaitServer(KEYS.payrollRuns, runs);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la nÃ³mina en el servidor."), "error");
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
        failPortalField(driverTripPayForm, "employeeId", userMessage("contractPickEmployee"));
        return;
      }
      if (!employeeIsConductorServiceProvider(employee)) {
        failPortalField(driverTripPayForm, "employeeId", "Seleccione un colaborador configurado como conductor en prestaciÃ³n de servicios.");
        return;
      }
      const periodYm = String(data.month || "").trim().slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(periodYm)) {
        failPortalField(driverTripPayForm, "month", userMessage("payrollSelectMonth"));
        return;
      }
      if (!portalCanRefreshFromApi()) {
        notify(
          "Para liquidar viajes en base de datos debe iniciar sesiÃ³n con el servidor (API). No se guardan solo en el navegador.",
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
        notify("ConÃ©ctese al servidor para recalcular desde viajes y combustible en base de datos.", "error");
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
          "La liquidaciÃ³n contractual de terminaciÃ³n no aplica a conductores en prestaciÃ³n de servicios. Liquide viajes pendientes y cierre el contrato segÃºn su abogado laboral."
        );
        return;
      }
      if (!monthRange(data.month)) {
        failPortalField(settlementForm, "month", userMessage("payrollSelectMonth"));
        return;
      }
      const termDate = String(data.terminationDate || "").trim();
      if (!termDate) {
        failPortalField(settlementForm, "terminationDate", "Seleccione la fecha de terminaciÃ³n del contrato.");
        return;
      }
      const employeeStartDate = String(normalizePortalDateYmd(employee.startDate) || "").trim();
      if (employeeStartDate && termDate < employeeStartDate) {
        failPortalField(settlementForm, "terminationDate", "La fecha de terminaciÃ³n no puede ser anterior al ingreso del colaborador.");
        return;
      }
      if (String(data.month || "").trim() && String(termDate).slice(0, 7) !== String(data.month).trim()) {
        failPortalField(settlementForm, "terminationDate", "La fecha de terminaciÃ³n debe corresponder al mes liquidado.");
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
        failPortalField(settlementForm, "cesantiasCop", "Ingrese valores en los rubros de liquidaciÃ³n; el total debe ser mayor que cero.");
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
          "CÃ¡lculos orientativos conforme prÃ¡cticas usuales CST y normativa colombiana sobre cesantÃ­as, intereses proporcionales, prima y vacaciones. No sustituye asesorÃ­a legal ni contable."
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
        failPortalField(settlementForm, "month", "Ya existe una liquidaciÃ³n de terminaciÃ³n para este empleado y periodo.");
        return;
      }
      runs.unshift(run);
      try {
        await writeAwaitServer(KEYS.payrollRuns, runs);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la liquidaciÃ³n en el servidor."), "error");
        return;
      }
      state.payrollUi = { ...(state.payrollUi || { runSort: "recent" }), workspace: "data" };
      persistHrWorkspace("payroll", "data");
      collapseCreatePanel("create-payroll-settlement");
      notify("LiquidaciÃ³n contractual registrada. Revise montos antes de marcar pagado.", "success");
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
          `<tr><td style="${cL}"><strong>CesantÃ­as definitivas / saldo a favor (referencia CST)</strong></td><td style="${cR}"><strong>${fmtPay(c)}</strong></td></tr>` +
          `<tr><td style="${cL}">Intereses moratorios sobre cesantÃ­as (${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual â€” Ley 52/1975, orientativo)</td><td style="${cR}">${fmtPay(ic)}</td></tr>` +
          `<tr><td style="${cL}">Prima de servicios proporcional (CST)</td><td style="${cR}">${fmtPay(pp)}</td></tr>` +
          `<tr><td style="${cL}">IndemnizaciÃ³n compensatoria de vacaciones u holgura (Ã·720 referencia)</td><td style="${cR}">${fmtPay(vac)}</td></tr>` +
          (ind > 0
            ? `<tr><td style="${cL}">IndemnizaciÃ³n sustitutiva u otros (orden judicial / pacto)</td><td style="${cR}">${fmtPay(ind)}</td></tr>`
            : "") +
          (otros > 0
            ? `<tr><td style="${cL}">Otros conceptos de finiquito</td><td style="${cR}">${fmtPay(otros)}</td></tr>`
            : "") +
          `<tr><td style="${cL}"><strong>Total devengos liquidaciÃ³n</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;

        const ded = parseNum(run.deductions);
        const dedRows =
          ded > 0
            ? `<tr><td style="${cL}">Retenciones y aportes asociados (detalle en nÃ³mina extraordinaria)</td><td style="${cR}">${fmtPay(ded)}</td></tr>`
            : `<tr><td colspan="2" style="padding:8px;color:#495057;font-size:0.88rem">Sin deducciones registradas en esta liquidaciÃ³n. Informe retenciÃ³n en la fuente, embargos u obligaciones con su contador.</td></tr>`;

        payslipBodyBlocks = `
          <h2 style="font-size:1rem;margin:1.25rem 0 0.35rem">I. Devengos (finiquito / liquidaciÃ³n)</h2>
          <p style="margin:0 0 0.5rem;font-size:0.86rem;color:#495057">Ãtems tÃ­picos por terminaciÃ³n conforme ordenamiento laboral colombiano (valores editables en el registro del sistema).</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${devRows}</tbody></table>
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">II. Deducciones</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${dedRows}</tbody></table>
          <table style="width:100%;border-collapse:collapse;font-size:0.95rem;margin-top:0.5rem"><tbody>
            <tr><td style="padding:12px 8px"><strong>Total neto a consignar / pagar</strong></td><td style="padding:12px 8px;text-align:right;font-size:1.12rem"><strong>${netStr}</strong></td></tr>
          </tbody></table>`;
      } else {
        const linesFromRun = resolvePayrollDevengosLines(run);
        const baseInt = parseNum(run.cesantiasInterestBaseCop);
        const diasInt = run.cesantiasInterestDays != null ? run.cesantiasInterestDays : "â€”";
        const intLabel =
          baseInt > 0
            ? `Intereses sobre cesantÃ­as (${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual Ley 52/1975; base ref. ${fmtPay(baseInt)}, ${diasInt} dÃ­as/360)`
            : `Intereses sobre cesantÃ­as (${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual Ley 52/1975)`;

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
                  `Prima de servicios semestral (CST arts. 244â€“249 â€” ${run.primaServiciosDays ?? "â€”"} dÃ­as semestre)`
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
            `<tr><td style="${cL}">Salario bÃ¡sico mensual (devengo ordinario)</td><td style="${cR}">${fmtPay(salarioBasicoDevengo)}</td></tr>` +
            (ex > 0
              ? `<tr><td style="${cL}">Horas extras, dominicales o recargos nocturnos</td><td style="${cR}">${fmtPay(ex)}</td></tr>`
              : "") +
            `<tr><td style="${cL}">Auxilio legal de transporte (no constitutivo de salario)</td><td style="${cR}">${fmtPay(au)}</td></tr>` +
            (bo > 0
              ? `<tr><td style="${cL}">Bonificaciones y pagos ocasionales gravables (devengo)</td><td style="${cR}">${fmtPay(bo)}</td></tr>`
              : "") +
            `<tr><td style="${cL}">ViÃ¡ticos y anticipos de viaje (reintegro / no salario)</td><td style="${cR}">${fmtPay(via)}</td></tr>` +
            `<tr><td style="${cL}">Reembolso combustible y gastos de ruta deducibles</td><td style="${cR}">${fmtPay(comb)}</td></tr>` +
            (prima > 0
              ? `<tr><td style="${cL}">Prima de servicios semestral (CST arts. 244â€“249 â€” ${run.primaServiciosDays ?? "â€”"} dÃ­as semestre)</td><td style="${cR}">${fmtPay(prima)}</td></tr>`
              : "") +
            (intCe > 0 ? `<tr><td style="${cL}">${escapeHtml(intLabel)}</td><td style="${cR}">${fmtPay(intCe)}</td></tr>` : "") +
            `<tr><td style="${cL}"><strong>Total devengos del periodo</strong></td><td style="${cR}"><strong>${fmtPay(run.gross)}</strong></td></tr>`;
        }

        const isTripPrestacion = payrollRunFrequencyKind(run) === "prestacion_viajes";
        const dedRowsMes = isTripPrestacion
          ? `<tr><td style="${cL}" colspan="2">PrestaciÃ³n de servicios: sin aportes de salud, pensiÃ³n ni FSP en este comprobante (pago por viajes).</td></tr>` +
            `<tr><td style="${cL}"><strong>Total deducciones</strong></td><td style="${cR}"><strong>${fmtPay(run.deductions)}</strong></td></tr>`
          : `<tr><td style="${cL}">Salario integral de cotizaciÃ³n â€” IBC (base aportes empleador/empleado)</td><td style="${cR}">${fmtPay(run.ibc)}</td></tr>` +
            `<tr><td style="${cL}">Aporte obligatorio salud â€” empleado (${(CO_PAYROLL.healthEmployeeRate * 100).toFixed(2).replace(/\.00$/, "")}% sobre IBC)</td><td style="${cR}">${fmtPay(run.health)}</td></tr>` +
            `<tr><td style="${cL}">Aporte pensiÃ³n obligatoria â€” empleado (${(CO_PAYROLL.pensionEmployeeRate * 100).toFixed(2).replace(/\.00$/, "")}% sobre IBC)</td><td style="${cR}">${fmtPay(run.pension)}</td></tr>` +
            `<tr><td style="${cL}">Fondo de solidaridad pensional FSP (cuando aplique rangos Ley 797/2003)</td><td style="${cR}">${fmtPay(run.solidarity)}</td></tr>` +
            `<tr><td style="${cL}"><strong>Total deducciones al empleado</strong></td><td style="${cR}"><strong>${fmtPay(run.deductions)}</strong></td></tr>`;
        const workedDaysRows =
          workedDays > 0 || workedDaysPaymentCop > 0
            ? `<tr><td style="${cL}">Pago por dÃ­as laborados (${workedDays.toLocaleString("es-CO")} dÃ­as)</td><td style="${cR}">${fmtPay(workedDaysPaymentCop)}</td></tr>`
            : `<tr><td style="${cL}" colspan="2">Sin detalle de dÃ­as laborados para este comprobante.</td></tr>`;

        payslipBodyBlocks = `
          <h2 style="font-size:1rem;margin:1.25rem 0 0.35rem">I. Devengos e ingresos perÃ­odo</h2>
          <p style="margin:0 0 0.45rem;font-size:0.86rem;color:#495057">${
            isTripPrestacion
              ? "Pago por prestaciÃ³n de servicios (viajes interdepartamentales y reembolsos de ruta)."
              : "Ingresos y conceptos pagados por el empleador; prima e intereses de cesantÃ­as solo si se liquidaron en este comprobante."
          }</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${devRowsMes}</tbody></table>
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">II. Deducciones (aportes del trabajador)</h2>
          <p style="margin:0 0 0.45rem;font-size:0.86rem;color:#495057">Descuentos legales incidentes sobre nÃ³mina; prima e intereses de cesantÃ­as no integran habitualmente esta base de cotizaciÃ³n en este modelo simplificado.</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${dedRowsMes}</tbody></table>
          <h2 style="font-size:1rem;margin:0.75rem 0 0.35rem">III. Resumen de dÃ­as laborados</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:1rem">${theadP}<tbody>${workedDaysRows}</tbody></table>
          <table style="width:100%;border-collapse:collapse;font-size:0.95rem;margin-top:0.5rem"><tbody>
            <tr><td style="padding:12px 8px"><strong>Neto pagado / a pagar al trabajador</strong></td><td style="padding:12px 8px;text-align:right;font-size:1.12rem"><strong>${netStr}</strong></td></tr>
          </tbody></table>`;
      }
      const docTitle =
        isTerm && run.settlementDetail && typeof run.settlementDetail === "object"
          ? `Liquidacion contractual ${run.employeeName}`
          : `Desprendible ${run.employeeName}`;
      const h1Title = isTerm ? "LiquidaciÃ³n contractual" : "Desprendible de nÃ³mina";
      let metaExtra = "";
      if (isTerm && run.settlementDetail && typeof run.settlementDetail === "object") {
        const sd = run.settlementDetail;
        metaExtra += `<tr><td style="padding:4px 0"><strong>Fecha terminaciÃ³n</strong></td><td>${escapeHtml(String(sd.terminationDate || "-"))}</td></tr>`;
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
            "LiquidaciÃ³n generada por liquidaciÃ³n masiva (RRHH). Validar incapacidades, vacaciones, viÃ¡ticos de ruta y bases de cotizaciÃ³n con contador antes del pago."
          );
        } else if (ori === "automatica") {
          disclaimerPieces.push(
            "LiquidaciÃ³n generada automÃ¡ticamente en servidor (cron diario, calendario BogotÃ¡). Validar incapacidades, vacaciones y bases de cotizaciÃ³n con RRHH y contador."
          );
          const nv = run.noveltiesDetail;
          if (nv && typeof nv === "object" && Array.isArray(nv.disclaimers)) {
            const top = nv.disclaimers.slice(0, 2).map((x) => String(x)).join(" ");
            if (top) disclaimerPieces.push(top);
          }
        }
        if (parseNum(run.primaServiciosCop) > 0)
          disclaimerPieces.push(
            "Prima de servicios (CST): cÃ¡lculo orientativo; validar polÃ­tica empresarial y contador."
          );
        if (parseNum(run.interesesCesantiasCop) > 0)
          disclaimerPieces.push(
            `Intereses de cesantÃ­as (Ley 52/1975, ${CO_CESANTIAS_INTERES_ANUAL_PCT}% anual): el texto legal establece que deben pagarse al trabajador en enero del aÃ±o siguiente al perÃ­odo causado (y reglas especiales en retiros o ceses antes de ese cierre). Lo habitual es liquidarlos con la nÃ³mina de enero del aÃ±o siguiente o, si su polÃ­tica lo retrasa hasta febrero, documente ese desfase con contador para no omitir obligaciones ya exigidas.`
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
              ? `${String(employee.bankName)} Â· ${String(employee.bankAccountType || "Cuenta")} ${String(employee.bankAccount)}`
              : "-"
        },
        {
          label: "Salario bÃ¡sico",
          value: employee?.baseSalary != null ? `$${parseNum(employee.baseSalary).toLocaleString("es-CO")}` : "-"
        },
        { label: "IBC (base de cotizaciÃ³n)", value: `$${parseNum(run.ibc || 0).toLocaleString("es-CO")}` }
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
          notify(String(err?.message || "No fue posible enviar la solicitud de aprobaciÃ³n."), "error");
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
          ? `Se eliminarÃ¡ la ausencia de ${String(removed.employeeName || "colaborador")} (${String(removed.startDate || "-")} a ${String(removed.endDate || "-")}). Indique la justificaciÃ³n.`
          : "Se eliminarÃ¡ este registro de ausencia del expediente digital. Indique la justificaciÃ³n.",
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
              ? `${String(removed.employeeName || "Colaborador")} Â· ${String(removed.startDate || "-")}`
              : "Ausencia",
            summary: removed
              ? `Ausencia eliminada (${String(removed.employeeName || "Colaborador")} Â· ${String(removed.startDate || "-")} a ${String(removed.endDate || "-")}). Motivo: ${String(motivo || "").trim()}`
              : `Ausencia eliminada. Motivo: ${String(motivo || "").trim()}`,
            actor: String(currentUser()?.email || currentUser()?.name || "â€”").trim()
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
          ? `Eliminar el registro de liquidacion (${run.month} Â· ${run.employeeName}). Indique la justificaciÃ³n. Solo administradores; no hay deshacer automatico si ya se sincrono con servidor.`
          : "Eliminar este registro de liquidacion.",
        confirmText: "Eliminar liquidacion",
        onConfirm: async (motivo) => {
          const ok = await removeFromPortalListAwaitServer(KEYS.payrollRuns, id);
          if (!ok) return;
          appendModuleAuditLog({
            action: "delete",
            moduleId: "payroll",
            moduleLabel: "NÃ³mina laboral",
            entityId: id,
            entityLabel: run
              ? `${String(run.employeeName || "Colaborador")} Â· ${String(run.month || "-")}`
              : "LiquidaciÃ³n",
            summary: run
              ? `LiquidaciÃ³n eliminada (${String(run.month || "-")} Â· ${String(run.employeeName || "Colaborador")}). Motivo: ${String(motivo || "").trim()}`
              : `LiquidaciÃ³n eliminada. Motivo: ${String(motivo || "").trim()}`,
            actor: String(currentUser()?.email || currentUser()?.name || "â€”").trim()
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
        "Mes,Tipo,Empleado,Devengado,IncapacidadAjusteCOP,IncapacidadResumen,AusentismosResumen,PrimaServicios,InteresesCesantias,BaseCesantÃ­asIntereses,DÃ­asInterÃ©s360,Viaticos,ReembolsoCombustible,IBC,Salud,Pension,Solidaridad,Deducciones,Neto,Estado"
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
                ? inc.episodes.map((e) => `${e.days ?? "?"}dÂ·${parseNum(e.adjustCop)}`).join("|")
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
  const fmtDateOr = (val, fallback = "â€”") => {
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
            ["DÃ­as calendario", String(parseNum(a.days || 0))],
            ["DÃ­as reconocidos", payrollFormatAbsenceQuantity(a.recognizedDays ?? a.days)],
            ["Soporte (NÂ°)", escapeHtml(String(a.supportNumber || "-"))],
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
        title: `Ausencia Â· ${typeLabel}`,
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
          { name: "recognizedDays", label: "DÃ­as reconocidos", type: "number", value: String(target.recognizedDays ?? target.days ?? 1), min: 0.5, step: 0.5 },
          {
            type: "custom",
            html: `<p class="full muted" data-absence-recognition-hint style="margin:0;font-size:0.82rem"></p>`
          },
          { name: "supportNumber", label: "NÂ° soporte / radicado", value: target.supportNumber || "" },
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
            failPortalField(absenceEditForm, "startDate", "Fechas invÃ¡lidas.");
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

(function registerPayrollPortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.payroll = bindPayrollPortalControls;
})();
