/**
 * Portal — Mis solicitudes (`#portal/requests`).
 * Selector de empresa para el formulario, filtros/listado admin y envío de nueva solicitud.
 * Carga con `defer` después de `app.js` y de `viajes.js` (define `RENDER_WINDOW_SIZE` compartido).
 */
(function registerMisSolicitudesPortalModule() {
  "use strict";

  function requestsRenderWindowSize() {
    return typeof RENDER_WINDOW_SIZE !== "undefined" ? RENDER_WINDOW_SIZE : 30;
  }

  function buildRequestCompanySelectHtml(user) {
    const companies = read(KEYS.companies, []);
    if (user?.role === ROLES.CLIENT) {
      const cid = String(user?.companyId || "").trim();
      if (!cid) {
        return `<div class="full">
        <p class="muted" role="alert">Su cuenta no tiene empresa asociada. Solicite al administrador que vincule su usuario a una empresa antes de crear solicitudes.</p>
        <input type="hidden" name="companyId" value="" />
      </div>`;
      }
      const c = getCompanyById(cid);
      const label = c?.name || user.company || "Mi empresa";
      const logoUrl = companyProfileLogoUrl(c);
      const logoPreview = logoUrl
        ? `<span class="request-company-logo" role="img" aria-label="Logo de ${escapeAttr(label)}"><img src="${escapeAttr(logoUrl)}" alt="Logo de ${escapeAttr(label)}" loading="lazy" /></span>`
        : `<span class="request-company-logo request-company-logo--fallback" aria-hidden="true">${escapeHtml(String(label || "E").charAt(0).toUpperCase())}</span>`;
      return `<label class="full">${fieldLabel(IC.briefcase, "Empresa asociada", { required: true })}
      <select name="companyId" id="request-company-id" required>
        <option value="${escapeAttr(cid)}">${escapeHtml(label)}</option>
      </select>
      <div class="request-company-preview">${logoPreview}<div><strong>${escapeHtml(label)}</strong><p class="muted">Empresa asociada al usuario autenticado.</p></div></div>
    </label>`;
    }
    if (!companies.length) {
      return `<div class="full">
      <p class="muted" role="alert">No hay empresas registradas. Cree una empresa en <strong>Administración · Usuarios</strong> antes de solicitar viajes.</p>
      <input type="hidden" name="companyId" value="" />
    </div>`;
    }
    const opts = companies
      .map((c) => {
        const id = String(c.id || "");
        return `<option value="${escapeAttr(id)}" data-company-logo="${escapeAttr(companyProfileLogoUrl(c))}" data-company-name="${escapeAttr(String(c.name || ""))}">${escapeHtml(String(c.name || ""))}${c.taxId ? ` (${escapeHtml(String(c.taxId))})` : ""}</option>`;
      })
      .join("");
    return `<label class="full">${fieldLabel(IC.briefcase, "Empresa asociada", { required: true })}
    <select name="companyId" id="request-company-id" required>
      <option value="">Seleccione empresa...</option>
      ${opts}
    </select>
    <div class="request-company-preview" id="request-company-preview"><span class="request-company-logo request-company-logo--fallback" aria-hidden="true">?</span><div><strong>Sin empresa seleccionada</strong><p class="muted">Seleccione una empresa para cargar su imagen en la solicitud.</p></div></div>
  </label>`;
  }

  window.buildRequestCompanySelectHtml = buildRequestCompanySelectHtml;

  function wireMisSolicitudesListActions() {
    if (!nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='request-company-filter']").forEach((btn) => {
      const apply = () => {
        const companyId = String(btn.dataset.companyId || "");
        const isToggleOff = String(window.AppModules?.solicitudes?.adminCompanyFilterId || "") === companyId;
        const nextId = isToggleOff ? "" : companyId;
        state.requestsUi = { ...(state.requestsUi || {}), companyId: nextId };
        if (window.AppModules?.solicitudes) window.AppModules.solicitudes.adminCompanyFilterId = nextId;
        state.requestsRenderLimit = requestsRenderWindowSize();
        renderPortalView();
      };
      btn.addEventListener("click", apply);
      btn.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          apply();
        }
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='request-company-clear']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.requestsUi = { ...(state.requestsUi || {}), companyId: "" };
        if (window.AppModules?.solicitudes) window.AppModules.solicitudes.adminCompanyFilterId = "";
        state.requestsRenderLimit = requestsRenderWindowSize();
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='requests-render-more']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.requestsRenderLimit =
          (Number(state.requestsRenderLimit) || requestsRenderWindowSize()) + requestsRenderWindowSize();
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='requests-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const filterKey = String(btn.dataset.filter || "active");
        state.requestsFilter = filterKey;
        state.requestsRenderLimit = requestsRenderWindowSize();
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='requests-list-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        state.requestsUi = { ...(state.requestsUi || {}), listSearch: String(el.value || "") };
        state.requestsRenderLimit = requestsRenderWindowSize();
        state.__requestsListSearchRestore = { start, end };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='requests-list-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = String(btn.dataset.layout || "").trim().toLowerCase() === "list" ? "list" : "cards";
        state.requestsUi = { ...(state.requestsUi || {}), listLayout: layout };
        renderPortalView();
      });
    });
  }

  function wireRequestCreateForm() {
    const requestForm = document.getElementById("form-request");
    if (!requestForm) return;
    const originDepartment = requestForm.querySelector("#origin-department");
    const originCity = requestForm.querySelector("#origin-city");
    const destinationDepartment = requestForm.querySelector("#destination-department");
    const destinationCity = requestForm.querySelector("#destination-city");
    const pickupDate = requestForm.querySelector("#pickup-date");
    const pickupTime = requestForm.querySelector("#pickup-time");
    const deliveryDate = requestForm.querySelector("#delivery-date");
    const deliveryTime = requestForm.querySelector("#delivery-time");
    const requestCompanySelect = requestForm.querySelector("#request-company-id");
    const requestCompanyPreview = requestForm.querySelector("#request-company-preview");

    const fillCityOptions = (departmentSelect, citySelect) => {
      const department = String(departmentSelect?.value || "");
      const cities = COLOMBIA_LOCATIONS[department] || [];
      citySelect.innerHTML = `<option value="">Seleccione...</option>${cities
        .map((c) => `<option value="${c}">${c}</option>`)
        .join("")}`;
    };

    if (originDepartment && originCity) {
      originDepartment.addEventListener("change", () => fillCityOptions(originDepartment, originCity));
    }
    if (destinationDepartment && destinationCity) {
      destinationDepartment.addEventListener("change", () => fillCityOptions(destinationDepartment, destinationCity));
    }
    if (pickupDate) {
      const today = colombiaTodayIsoDate();
      pickupDate.min = today;
      if (deliveryDate) deliveryDate.min = today;
    }
    if (requestCompanySelect && requestCompanyPreview) {
      const refreshCompanyPreview = () => {
        const selectedOption = requestCompanySelect.options[requestCompanySelect.selectedIndex] || null;
        const name = String(selectedOption?.dataset.companyName || selectedOption?.textContent || "").trim();
        const logoUrl = String(selectedOption?.dataset.companyLogo || "").trim();
        if (!requestCompanySelect.value || !name) {
          requestCompanyPreview.innerHTML =
            '<span class="request-company-logo request-company-logo--fallback" aria-hidden="true">?</span><div><strong>Sin empresa seleccionada</strong><p class="muted">Seleccione una empresa para cargar su imagen en la solicitud.</p></div>';
          return;
        }
        const initial = escapeHtml(String(name || "E").charAt(0).toUpperCase());
        const logoHtml = logoUrl
          ? `<span class="request-company-logo" role="img" aria-label="Logo de ${escapeAttr(name)}"><img src="${escapeAttr(logoUrl)}" alt="Logo de ${escapeAttr(name)}" loading="lazy" /></span>`
          : `<span class="request-company-logo request-company-logo--fallback" aria-hidden="true">${initial}</span>`;
        requestCompanyPreview.innerHTML = `${logoHtml}<div><strong>${escapeHtml(name)}</strong><p class="muted">${logoUrl ? "Logo cargado automáticamente para esta empresa." : "Empresa sin logo registrado."}</p></div>`;
      };
      requestCompanySelect.addEventListener("change", refreshCompanyPreview);
      refreshCompanyPreview();
    }

    attachRequestTruckTypeFields(requestForm);

    wireFormSubmitGuard(
      requestForm,
      async (event) => {
        const user = currentUser();
        const data = readFormEntriesNormalized(requestForm);
        const requestCompanyId = String(data.companyId || "").trim();
        if (!requestCompanyId) {
          notify("Debe seleccionar la empresa asociada.", "error");
          return;
        }
        const reqCompanyRaw =
          read(KEYS.companies, []).find((c) => String(c.id) === requestCompanyId) || null;
        const reqCompany = reqCompanyRaw ? normalizePortalBootstrapCompanyRow(reqCompanyRaw) : null;
        if (!reqCompany) {
          notify("La empresa seleccionada no es válida.", "error");
          return;
        }
        if (user?.role === ROLES.CLIENT) {
          const ucid = String(user.companyId || "").trim();
          if (ucid && ucid !== requestCompanyId) {
            notify("No puede crear solicitudes para otra empresa.", "error");
            return;
          }
        }
        const pickupDateValue = String(data.pickupDate || "");
        const pickupTimeValue = String(data.pickupTime || "");
        const deliveryDateValue = String(data.deliveryDate || "");
        const deliveryTimeValue = String(data.deliveryTime || "");
        if (!pickupDateValue || !pickupTimeValue || !deliveryDateValue || !deliveryTimeValue) {
          notify(userMessage("requestDatetimeMissing"), "error");
          return;
        }
        const pickupAt = buildColombiaOffsetDateTime(pickupDateValue, pickupTimeValue);
        const etaDelivery = buildColombiaOffsetDateTime(deliveryDateValue, deliveryTimeValue);
        const pickupDateTime = new Date(pickupAt);
        const deliveryDateTime = new Date(etaDelivery);
        if (pickupDateTime.getTime() < Date.now()) {
          notify(userMessage("requestPastDatetime"), "error");
          return;
        }
        if (deliveryDateTime.getTime() <= pickupDateTime.getTime()) {
          notify(userMessage("requestDeliveryAfterPickup"), "error");
          return;
        }
        const {
          pickupDate,
          pickupTime,
          deliveryDate,
          deliveryTime,
          siteContactName,
          siteContactPhone,
          notes,
          requiresThermoking,
          serviceType: modoTransporte,
          requiredTruckType: requiredTruckTypeRaw,
          fuelles: fuellesFormRaw,
          weightKg: weightKgFromForm,
          ...payloadRest
        } = data;
        const serviceType = String(modoTransporte || "").trim();
        if (!TRANSPORT_MODOS_SERVICIO.has(serviceType)) {
          notify("Seleccione un modo de transporte válido (nacional o entre sedes del cliente).", "error");
          return;
        }
        const tk = String(requiresThermoking || "").trim();
        if (tk !== "yes" && tk !== "no") {
          notify("Indique si el envío requiere Termoking o es carga seca.", "error");
          return;
        }
        const refrigeracionTermoking = tk === "yes";
        const requiredTruckType = normalizeRequestRequiredTruckType(requiredTruckTypeRaw);
        if (!requiredTruckType) {
          notify("Seleccione el tipo de camión requerido.", "error");
          return;
        }
        let fuellesVal = null;
        let weightKgVal = 0;
        if (requestRequiredTruckTypeShowsFuelles(requiredTruckType)) {
          const f = Math.floor(Number(String(fuellesFormRaw ?? "").trim()));
          if (!Number.isFinite(f) || String(fuellesFormRaw ?? "").trim() === "" || f < 0) {
            notify("Indique la cantidad de fuelles.", "error");
            return;
          }
          fuellesVal = f;
        } else if (requestRequiredTruckTypeShowsTractomulaKg(requiredTruckType)) {
          weightKgVal = Math.max(0, Number(weightKgFromForm) || 0);
          if (weightKgVal <= 0) {
            notify("Indique el peso en kg para tractomula.", "error");
            return;
          }
        }
        payloadRest.tripValue = 0;
        const contactName = normalizeLatinUpperForDb(String(siteContactName ?? "").trim());
        const contactPhone = normalizePortalPhoneForStorage(String(siteContactPhone ?? "").trim());
        const boxesCount = 0;
        const notesTrim = normalizeLatinUpperForDb(String(notes ?? "").trim());
        const insuredValueNum = Math.max(0, parseNum(payloadRest.insuredValue));
        const distanceKmNum = Math.max(0, parseNum(payloadRest.distanceKm));
        const all = reqRead();
        const usedRequestNumbers = new Set(all.map((r) => String(r.requestNumber || "").trim()).filter(Boolean));
        const requestNumber = makeRequestNumber(usedRequestNumbers);
        const localRow = {
          id: newUuidV4(),
          requestNumber,
          clientUserId: user.id,
          clientName: normalizeLatinUpperForDb(reqCompany.name || user.company || ""),
          clientCompanyId: reqCompany.id,
          clientCompanyLogoUrl: companyProfileLogoUrl(reqCompany),
          requestedByName: normalizeLatinUpperForDb(user.name),
          ...payloadRest,
          originDepartment: normalizeLatinForDb(payloadRest.originDepartment || ""),
          originCity: normalizeLatinForDb(payloadRest.originCity || ""),
          originAddress: normalizeLatinUpperForDb(payloadRest.originAddress || ""),
          destinationDepartment: normalizeLatinForDb(payloadRest.destinationDepartment || ""),
          destinationCity: normalizeLatinForDb(payloadRest.destinationCity || ""),
          destinationAddress: normalizeLatinUpperForDb(payloadRest.destinationAddress || ""),
          cargoDescription: normalizeLatinUpperForDb(payloadRest.cargoDescription || ""),
          serviceType,
          refrigeracionTermoking,
          contactName,
          contactPhone,
          siteContactName: contactName,
          siteContactPhone: contactPhone,
          boxesCount,
          boxes: boxesCount,
          insuredValue: insuredValueNum > 0 ? insuredValueNum : null,
          distanceKm: distanceKmNum > 0 ? distanceKmNum : null,
          notes: notesTrim,
          observations: notesTrim || null,
          vehicleType: requiredTruckType,
          fuelles: requestRequiredTruckTypeShowsFuelles(requiredTruckType) ? fuellesVal : null,
          weightKg: requestRequiredTruckTypeShowsTractomulaKg(requiredTruckType) ? weightKgVal : 0,
          pickupAt,
          etaDelivery,
          status: STATUS.PENDIENTE,
          createdAt: nowIso(),
          approvedAt: null,
          approvedBy: null,
          autoApproved: false,
          trip: null,
          standbyChargeTotal: 0,
          standbyEvents: [],
          rejectionReason: ""
        };
        let rowToSave = localRow;
        if (window.AntaresApi?.isConfigured?.() && window.DomainModules?.requests?.createViaApi) {
          try {
            rowToSave = await window.DomainModules.requests.createViaApi(localRow, pickupAt);
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return;
          }
        }
        all.unshift(rowToSave);
        try {
          await reqWriteAwait(all);
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar la solicitud en el servidor."), "error");
          return;
        }

        notifyAdminUsers(
          "Nueva solicitud pendiente",
          `Solicitud ${requestNumber} de ${rowToSave.clientName || user.name || ""}`
        );
        if (!window.AntaresApi?.isConfigured?.()) {
          read(KEYS.users, [])
            .filter((u) => u.role === ROLES.ADMIN)
            .forEach((admin) => {
              sendEmail({
                to: admin.email,
                subject: "Nueva solicitud de viaje",
                body: `Revisar solicitud ${requestNumber}`
              });
            });
        }

        const actingUser = currentUser();
        if (actingUser?.role === ROLES.ADMIN) {
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(actingUser.id);
        }
        notify(userMessage("requestCreated"), "success");
        requestForm.reset();
        state.requestsUi = { ...(state.requestsUi || {}), workspace: "data" };
        if (typeof persistHrWorkspace === "function") persistHrWorkspace("requests", "data");
        renderPortalView();
      },
      { busyText: "Creando solicitud…" }
    );
  }

  function bindMisSolicitudesPortalControls() {
    if (String(state.currentView || "") !== "requests" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='requests']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = String(btn.dataset.tab || "");
        if (!tab) return;
        const ws =
          typeof normalizeHrWorkspace === "function" ? normalizeHrWorkspace("requests", tab) : tab === "data" ? "data" : "operate";
        if (ws !== "operate" && ws !== "data") return;
        state.requestsUi = { ...(state.requestsUi || {}), workspace: ws };
        if (typeof persistHrWorkspace === "function") persistHrWorkspace("requests", ws);
        if (ws === "data" && typeof portalCanRefreshFromApi === "function" && portalCanRefreshFromApi()) {
          void applyPortalBootstrapFromApi().then((ok) => {
            if (ok && typeof scheduleRenderPortalView === "function") scheduleRenderPortalView();
          });
        }
        renderPortalView();
      });
    });

    wireMisSolicitudesListActions();
    wireRequestCreateForm();

    const reqSearchRestore = state.__requestsListSearchRestore;
    if (reqSearchRestore && typeof reqSearchRestore.start === "number") {
      delete state.__requestsListSearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "requests") return;
        const inp = root.querySelector("[data-action='requests-list-search']");
        if (!inp || typeof inp.focus !== "function") return;
        inp.focus();
        if (typeof inp.setSelectionRange === "function") {
          const n = String(inp.value || "").length;
          const s = Math.max(0, Math.min(reqSearchRestore.start, n));
          const e = Math.max(0, Math.min(reqSearchRestore.end ?? reqSearchRestore.start, n));
          inp.setSelectionRange(s, e);
        }
      });
    }
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.requests = bindMisSolicitudesPortalControls;
})();
