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

  function portalUuidOk(value) {
    return typeof window.isUuidString === "function" && window.isUuidString(String(value || ""));
  }

  /** Con API activa prioriza `session.userId` (JWT); evita ids legacy tipo `client-1`. */
  function resolveRequestActorUserId(user) {
    const sessionUserId = String((typeof getSession === "function" ? getSession()?.userId : "") || "").trim();
    if (window.AntaresApi?.isConfigured?.()) {
      if (portalUuidOk(sessionUserId)) return sessionUserId;
      const fromUser = String(user?.id || "").trim();
      if (portalUuidOk(fromUser)) return fromUser;
      return "";
    }
    return String(user?.id || sessionUserId || "").trim();
  }

  /** Rehidrata bootstrap si usuario/empresa no están en caché RAM (evita sync-key con UUID huérfano). */
  async function ensureRequestCreateCacheHasRefs(actorUserId, companyId) {
    if (!window.AntaresApi?.isConfigured?.()) return { ok: true, uidOk: true, companyOk: true };
    const uid = String(actorUserId || "").trim();
    const cid = String(companyId || "").trim();
    if (!portalUuidOk(uid) || !portalUuidOk(cid)) {
      return { ok: false, uidOk: portalUuidOk(uid), companyOk: portalUuidOk(cid) };
    }

    const checkRefs = () => {
      const usersCache = read(KEYS.users, []);
      const companiesCache = read(KEYS.companies, []);
      const uidOk = usersCache.some((u) => String(u?.id || "").trim() === uid);
      const companyOk = companiesCache.some((c) => String(c?.id || "").trim() === cid);
      return { uidOk, companyOk, ok: uidOk && companyOk };
    };

    let refs = checkRefs();
    if (refs.ok) return refs;
    if (typeof applyPortalBootstrapFromApi === "function") {
      try {
        await applyPortalBootstrapFromApi({ skipSecondaryHydration: true });
      } catch (_bootstrap) {
        /* continuar; el servidor devolverá mensaje explícito */
      }
    }
    return checkRefs();
  }

  function buildPortalRequestSyncPayloadSafe(row) {
    const fn =
      typeof buildPortalRequestSyncPayload === "function"
        ? buildPortalRequestSyncPayload
        : typeof window.buildPortalRequestSyncPayload === "function"
          ? window.buildPortalRequestSyncPayload
          : typeof window.AntaresSolicitudesDomain?.buildPortalRequestSyncPayload === "function"
            ? window.AntaresSolicitudesDomain.buildPortalRequestSyncPayload
            : null;
    return fn ? fn(row) : row;
  }

  function readRequestFormCompanies() {
    const all = read(KEYS.companies, []);
    if (!window.AntaresApi?.isConfigured?.()) return all;
    return all.filter((c) => portalUuidOk(c?.id));
  }

  function buildRequestCompanySelectHtml(user) {
    const companies = readRequestFormCompanies();
    if (user?.role === ROLES.CLIENT) {
      const cid = String(user?.companyId || "").trim();
      if (!cid) {
        return `<div class="full">
        <p class="muted" role="alert">Su cuenta no tiene empresa asociada. Solicite al administrador que vincule su usuario a una empresa antes de crear solicitudes.</p>
        <input type="hidden" name="companyId" value="" />
      </div>`;
      }
      if (window.AntaresApi?.isConfigured?.() && !portalUuidOk(cid)) {
        return `<div class="full">
        <p class="muted" role="alert">Su empresa no está sincronizada con el servidor (falta UUID). Cierre sesión, vuelva a entrar o pida al administrador que sincronice su cuenta.</p>
        <input type="hidden" name="companyId" value="" />
      </div>`;
      }
      const c = getCompanyById(cid);
      const label = c?.name || user.company || "Mi empresa";
      const nit = String(c?.taxId || c?.nit || "").trim();
      const nitLine = nit ? `NIT ${escapeHtml(nit)}` : "Sin NIT registrado.";
      const logoUrl = companyProfileLogoUrl(c);
      const logoPreview = logoUrl
        ? `<span class="request-company-logo" role="img" aria-label="Logo de ${escapeAttr(label)}"><img src="${escapeAttr(logoUrl)}" alt="Logo de ${escapeAttr(label)}" loading="lazy" /></span>`
        : `<span class="request-company-logo request-company-logo--fallback" aria-hidden="true">${escapeHtml(String(label || "E").charAt(0).toUpperCase())}</span>`;
      return `<label class="full">${fieldLabel(IC.briefcase, "Empresa asociada", { required: true })}
      <select name="companyId" id="request-company-id" required>
        <option value="${escapeAttr(cid)}">${escapeHtml(label)}</option>
      </select>
      <div class="request-company-preview">${logoPreview}<div><strong>${escapeHtml(label)}</strong><p class="muted">${nitLine}</p></div></div>
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
        return `<option value="${escapeAttr(id)}" data-company-logo="${escapeAttr(companyProfileLogoUrl(c))}" data-company-name="${escapeAttr(String(c.name || ""))}" data-company-nit="${escapeAttr(String(c.taxId || c.nit || ""))}">${escapeHtml(String(c.name || ""))}${c.taxId ? ` (${escapeHtml(String(c.taxId))})` : ""}</option>`;
      })
      .join("");
    return `<label class="full">${fieldLabel(IC.briefcase, "Empresa asociada", { required: true })}
    <select name="companyId" id="request-company-id" required>
      <option value="">Seleccione empresa...</option>
      ${opts}
    </select>
    <div class="request-company-preview" id="request-company-preview"><span class="request-company-logo request-company-logo--fallback" aria-hidden="true">?</span><div><strong>Sin empresa seleccionada</strong><p class="muted">Seleccione una empresa para continuar.</p></div></div>
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

    nodes.viewRoot.querySelectorAll("[data-action='requests-company-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        state.requestsUi = { ...(state.requestsUi || {}), companySearch: String(el.value || "") };
        state.requestsCompanyRenderLimit = 25;
        state.__requestsCompanySearchRestore = { start, end };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='requests-company-sort']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sort = String(btn.dataset.sort || "pending");
        state.requestsUi = { ...(state.requestsUi || {}), companySort: sort };
        state.requestsCompanyRenderLimit = 25;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='requests-company-pending-only']").forEach((input) => {
      input.addEventListener("change", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        state.requestsUi = { ...(state.requestsUi || {}), companyPendingOnly: Boolean(el.checked) };
        state.requestsCompanyRenderLimit = 25;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='requests-company-render-more']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.requestsCompanyRenderLimit =
          (Number(state.requestsCompanyRenderLimit) || requestsRenderWindowSize()) + requestsRenderWindowSize();
        renderPortalView();
      });
    });
  }

  function wireRequestScheduleUi(requestForm) {
    const schedule = requestForm.querySelector("[data-request-schedule]");
    if (!schedule) return;

    const preview = schedule.querySelector("[data-request-schedule-preview]");
    const durationEl = schedule.querySelector("[data-request-schedule-duration]");
    const connector = schedule.querySelector(".acf-schedule__connector");

    const readDateIso = (fieldId) => {
      const el = requestForm.querySelector(`#${fieldId}`);
      if (!el) return "";
      return normalizePortalDateYmd(el.value) || "";
    };

    const readTime = (fieldId) => {
      const el = requestForm.querySelector(`#${fieldId}`);
      return String(el?.value || "").trim().slice(0, 5);
    };

    const formatScheduleStamp = (isoDate, time) => {
      const built =
        typeof buildColombiaOffsetDateTime === "function" ? buildColombiaOffsetDateTime(isoDate, time) : "";
      if (!built) return "";
      return typeof fmtDate === "function" ? fmtDate(built) : built;
    };

    /** Misma regla que al guardar: fecha+hora en Colombia (-05:00). */
    const scheduleInstantMs = (isoDate, time) => {
      const built =
        typeof buildColombiaOffsetDateTime === "function" ? buildColombiaOffsetDateTime(isoDate, time) : "";
      if (!built) return NaN;
      const ms = new Date(built).getTime();
      return Number.isFinite(ms) ? ms : NaN;
    };

    const formatDuration = (pickupIso, pickupTime, deliveryIso, deliveryTime) => {
      if (!pickupIso || !pickupTime || !deliveryIso || !deliveryTime) return "";
      const start = scheduleInstantMs(pickupIso, pickupTime);
      const end = scheduleInstantMs(deliveryIso, deliveryTime);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return "";
      const mins = Math.round((end - start) / 60000);
      const days = Math.floor(mins / 1440);
      const hours = Math.floor((mins % 1440) / 60);
      const rem = mins % 60;
      const parts = [];
      if (days) parts.push(`${days} d`);
      if (hours) parts.push(`${hours} h`);
      if (rem && !days) parts.push(`${rem} min`);
      return parts.length ? parts.join(" ") : "< 1 h";
    };

    const syncDeliveryMin = () => {
      const pickupIso = readDateIso("pickup-date");
      const today = colombiaTodayIsoDate();
      const minIso = pickupIso && pickupIso > today ? pickupIso : today;
      ["pickup-date", "delivery-date"].forEach((id) => {
        const el = requestForm.querySelector(`#${id}`);
        if (!el) return;
        el.dataset.antaresDateMin = minIso;
      });
    };

    const syncPreview = () => {
      const pickupIso = readDateIso("pickup-date");
      const pickupTime = readTime("pickup-time");
      const deliveryIso = readDateIso("delivery-date");
      const deliveryTime = readTime("delivery-time");
      const pickupLabel = formatScheduleStamp(pickupIso, pickupTime);
      const deliveryLabel = formatScheduleStamp(deliveryIso, deliveryTime);
      const duration = formatDuration(pickupIso, pickupTime, deliveryIso, deliveryTime);

      schedule.querySelectorAll(".acf-time-preset").forEach((btn) => {
        const target = String(btn.dataset.acfTimeTarget || "");
        const val = String(btn.dataset.acfTimePreset || "");
        const input = requestForm.querySelector(`#${target}`);
        btn.classList.toggle("is-active", Boolean(input?.value && String(input.value).slice(0, 5) === val));
      });

      if (durationEl) durationEl.textContent = duration || "—";
      if (!preview) return;

      const startMs = pickupIso && pickupTime ? scheduleInstantMs(pickupIso, pickupTime) : NaN;
      const endMs = deliveryIso && deliveryTime ? scheduleInstantMs(deliveryIso, deliveryTime) : NaN;
      const invalidOrder = Number.isFinite(startMs) && Number.isFinite(endMs) && endMs <= startMs;
      connector?.classList.toggle("acf-schedule__connector--warn", invalidOrder);
      preview.classList.toggle("acf-schedule__preview--ready", Boolean(pickupLabel && deliveryLabel && !invalidOrder));
      preview.classList.toggle("acf-schedule__preview--warn", invalidOrder);

      if (!pickupLabel && !deliveryLabel) {
        preview.innerHTML = `<span class="acf-schedule__preview-icon" aria-hidden="true">${IC.calendar}</span>
          <div class="acf-schedule__preview-copy">
            <strong class="acf-schedule__preview-title">Defina recogida y entrega</strong>
            <p class="acf-schedule__preview-detail muted">Elija fecha y hora estimadas; puede usar los accesos rápidos debajo.</p>
          </div>`;
        return;
      }

      if (invalidOrder) {
        preview.innerHTML = `<span class="acf-schedule__preview-icon acf-schedule__preview-icon--warn" aria-hidden="true">${IC.alertTriangle || IC.x}</span>
          <div class="acf-schedule__preview-copy">
            <strong class="acf-schedule__preview-title">Revise las ventanas</strong>
            <p class="acf-schedule__preview-detail muted">La entrega debe ser posterior a la recogida.</p>
          </div>`;
        return;
      }

      preview.innerHTML = `<div class="acf-schedule__preview-leg">
          <span class="acf-schedule__preview-eyebrow">Recogida</span>
          <strong>${escapeHtml(pickupLabel || "Pendiente")}</strong>
        </div>
        <span class="acf-schedule__preview-arrow" aria-hidden="true">${IC.chevronRight || "→"}</span>
        <div class="acf-schedule__preview-leg">
          <span class="acf-schedule__preview-eyebrow">Entrega</span>
          <strong>${escapeHtml(deliveryLabel || "Pendiente")}</strong>
        </div>`;
    };

    const setDateOffset = (targetId, dayOffset) => {
      const base = colombiaTodayIsoDate();
      const [y, m, d] = base.split("-").map((n) => parseInt(n, 10));
      const dt = new Date(y, m - 1, d + Number(dayOffset || 0));
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      const hidden = requestForm.querySelector(`#${targetId}`);
      if (hidden) {
        hidden.value = iso;
        hidden.dispatchEvent(new Event("input", { bubbles: true }));
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (typeof setFormDateByName === "function") {
        const name = targetId === "pickup-date" ? "pickupDate" : "deliveryDate";
        setFormDateByName(requestForm, name, iso);
      }
      if (typeof refreshAntaresSchedulePickerDisplay === "function") {
        refreshAntaresSchedulePickerDisplay(requestForm, targetId);
      }
      syncDeliveryMin();
      syncPreview();
    };

    const clearScheduleFieldErrors = () => {
      const V = window.AntaresValidation;
      if (!V?.clearFieldError) return;
      ["pickup-date", "delivery-date", "pickup-time", "delivery-time"].forEach((id) => {
        const el = requestForm.querySelector(`#${id}`);
        if (el) V.clearFieldError(el);
      });
    };

    mountAntaresSchedulePickers?.(requestForm);

    schedule.querySelectorAll("[data-acf-time-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = String(btn.dataset.acfTimeTarget || "");
        const value = String(btn.dataset.acfTimePreset || "");
        const input = requestForm.querySelector(`#${targetId}`);
        if (!input || !value) return;
        clearScheduleFieldErrors();
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        refreshAntaresSchedulePickerDisplay?.(requestForm, targetId);
        syncPreview();
      });
    });

    schedule.querySelectorAll("[data-acf-date-offset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setDateOffset(String(btn.dataset.acfDateTarget || ""), Number(btn.dataset.acfDateOffset || 0));
      });
    });

    ["pickup-date", "delivery-date", "pickup-time", "delivery-time"].forEach((id) => {
      const el = requestForm.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener("input", () => {
        clearScheduleFieldErrors();
        if (id.includes("date")) syncDeliveryMin();
        refreshAntaresSchedulePickerDisplay?.(requestForm, id);
        syncPreview();
      });
      el.addEventListener("change", () => {
        clearScheduleFieldErrors();
        if (id.includes("date")) syncDeliveryMin();
        refreshAntaresSchedulePickerDisplay?.(requestForm, id);
        syncPreview();
      });
    });

    syncDeliveryMin();
    syncPreview();
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
      ["pickup-date", "delivery-date"].forEach((id) => {
        const el = requestForm.querySelector(`#${id}`);
        if (el) el.dataset.antaresDateMin = today;
      });
    }

    wireRequestScheduleUi(requestForm);
    if (requestCompanySelect && requestCompanyPreview) {
      const refreshCompanyPreview = () => {
        const selectedOption = requestCompanySelect.options[requestCompanySelect.selectedIndex] || null;
        const name = String(selectedOption?.dataset.companyName || selectedOption?.textContent || "").trim();
        const logoUrl = String(selectedOption?.dataset.companyLogo || "").trim();
        const nit = String(selectedOption?.dataset.companyNit || "").trim();
        const nitLine = nit ? `NIT ${escapeHtml(nit)}` : "Sin NIT registrado.";
        if (!requestCompanySelect.value || !name) {
          requestCompanyPreview.innerHTML =
            '<span class="request-company-logo request-company-logo--fallback" aria-hidden="true">?</span><div><strong>Sin empresa seleccionada</strong><p class="muted">Seleccione una empresa para continuar.</p></div>';
          return;
        }
        const initial = escapeHtml(String(name || "E").charAt(0).toUpperCase());
        const logoHtml = logoUrl
          ? `<span class="request-company-logo" role="img" aria-label="Logo de ${escapeAttr(name)}"><img src="${escapeAttr(logoUrl)}" alt="Logo de ${escapeAttr(name)}" loading="lazy" /></span>`
          : `<span class="request-company-logo request-company-logo--fallback" aria-hidden="true">${initial}</span>`;
        requestCompanyPreview.innerHTML = `${logoHtml}<div><strong>${escapeHtml(name)}</strong><p class="muted">${nitLine}</p></div>`;
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
          failPortalField(requestForm, "companyId", "Debe seleccionar la empresa asociada.");
          return;
        }
        const reqCompanyRaw =
          read(KEYS.companies, []).find((c) => String(c.id) === requestCompanyId) || null;
        const reqCompany = reqCompanyRaw ? normalizePortalBootstrapCompanyRow(reqCompanyRaw) : null;
        if (!reqCompany) {
          notify("La empresa seleccionada no es válida.", "error");
          return;
        }
        const actorUserId = resolveRequestActorUserId(user);
        if (window.AntaresApi?.isConfigured?.() && !portalUuidOk(actorUserId)) {
          notify(userMessage("requestUserServerUuidRequired"), "error");
          return;
        }
        const clientCompanyId = String(reqCompany.id || "").trim();
        if (window.AntaresApi?.isConfigured?.() && !portalUuidOk(clientCompanyId)) {
          notify(userMessage("requestCompanyServerUuidRequired"), "error");
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
        if (!pickupDateValue) {
          failPortalField(requestForm, "pickupDate", userMessage("requestDatetimeMissing"));
          return;
        }
        if (!pickupTimeValue) {
          failPortalField(requestForm, "pickupTime", userMessage("requestDatetimeMissing"));
          return;
        }
        if (!deliveryDateValue) {
          failPortalField(requestForm, "deliveryDate", userMessage("requestDatetimeMissing"));
          return;
        }
        if (!deliveryTimeValue) {
          failPortalField(requestForm, "deliveryTime", userMessage("requestDatetimeMissing"));
          return;
        }
        const pickupAtBuilt = buildColombiaOffsetDateTime(pickupDateValue, pickupTimeValue);
        const etaDeliveryBuilt = buildColombiaOffsetDateTime(deliveryDateValue, deliveryTimeValue);
        if (!pickupAtBuilt || !etaDeliveryBuilt) {
          failPortalField(
            requestForm,
            !pickupAtBuilt ? "pickupDate" : "deliveryDate",
            userMessage("requestDatetimeMissing")
          );
          return;
        }
        const pickupDateTime = new Date(pickupAtBuilt);
        const deliveryDateTime = new Date(etaDeliveryBuilt);
        if (!Number.isFinite(pickupDateTime.getTime()) || !Number.isFinite(deliveryDateTime.getTime())) {
          failPortalField(requestForm, "pickupDate", userMessage("requestDatetimeMissing"));
          return;
        }
        const pickupAt = pickupDateTime.toISOString();
        const etaDelivery = deliveryDateTime.toISOString();
        if (pickupDateTime.getTime() < Date.now()) {
          failPortalField(requestForm, "pickupDate", userMessage("requestPastDatetime"));
          return;
        }
        if (deliveryDateTime.getTime() <= pickupDateTime.getTime()) {
          failPortalField(requestForm, "deliveryDate", userMessage("requestDeliveryAfterPickup"));
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
          failPortalField(requestForm, "serviceType", "Seleccione un modo de transporte válido (nacional o entre sedes del cliente).");
          return;
        }
        const tk = String(requiresThermoking || "").trim();
        if (tk !== "yes" && tk !== "no") {
          failPortalField(requestForm, "requiresThermoking", "Indique si el envío requiere Termoking o es carga seca.");
          return;
        }
        const refrigeracionTermoking = tk === "yes";
        const requiredTruckType = normalizeRequestRequiredTruckType(requiredTruckTypeRaw);
        if (!requiredTruckType) {
          failPortalField(requestForm, "requiredTruckType", "Seleccione el tipo de camión requerido.");
          return;
        }
        let fuellesVal = null;
        let weightKgVal = 0;
        if (requestRequiredTruckTypeShowsFuelles(requiredTruckType)) {
          const f = Math.floor(Number(String(fuellesFormRaw ?? "").trim()));
          if (!Number.isFinite(f) || String(fuellesFormRaw ?? "").trim() === "" || f < 0) {
            failPortalField(requestForm, "fuelles", "Indique la cantidad de fuelles.");
            return;
          }
          fuellesVal = f;
        } else if (requestRequiredTruckTypeShowsTractomulaKg(requiredTruckType)) {
          weightKgVal = Math.max(0, Number(weightKgFromForm) || 0);
          if (weightKgVal <= 0) {
            failPortalField(requestForm, "weightKg", "Indique el peso en kg para tractomula.");
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
          id: typeof window.newUuidV4 === "function" ? window.newUuidV4() : crypto.randomUUID(),
          requestNumber,
          clientUserId: actorUserId,
          clientName: normalizeLatinUpperForDb(reqCompany.name || user.company || ""),
          clientCompanyId,
          clientCompanyLogoUrl: companyProfileLogoUrl(reqCompany),
          requestedByName: normalizeLatinUpperForDb(user.name),
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
          pickupDate: pickupDateValue,
          pickupTime: pickupTimeValue,
          deliveryDate: deliveryDateValue,
          deliveryTime: deliveryTimeValue,
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
        if (window.AntaresApi?.isConfigured?.()) {
          const cacheRefs = await ensureRequestCreateCacheHasRefs(actorUserId, clientCompanyId);
          if (!cacheRefs.ok) {
            notify(
              userMessage(
                !cacheRefs.uidOk ? "requestUserServerUuidRequired" : "requestCompanyServerUuidRequired"
              ),
              "error"
            );
            return;
          }
          try {
            buildPortalRequestSyncPayloadSafe(localRow);
          } catch (err) {
            notify(String(err?.message || userMessage("requestCreateError")), "error");
            return;
          }
        }
        const prevRequests = reqRead();
        const nextRequests = [localRow, ...prevRequests];
        try {
          await reqWriteAwait(nextRequests, localRow);
        } catch (err) {
          reqWrite(prevRequests);
          const msg = String(err?.message || "").trim();
          const hint =
            /uuid|identificador/i.test(msg) && typeof clearPortalRequestsLocalAndResyncFromServer === "function"
              ? " Si el error continúa, abra la consola (F12) y ejecute: await clearPortalRequestsLocalAndResyncFromServer()"
              : "";
          notify(userMessage("requestSaveServerFail", msg) + hint, "error");
          return;
        }
        const rowToSave = localRow;
        const actingUser = currentUser();
        if (actingUser) {
          const actorEmail = String(actingUser.email || "").trim();
          const auditActorUserId = String(actingUser.id || "").trim();
          const actor = String(actingUser.name || actorEmail || "Usuario").trim();
          const usuarioFn = globalThis.historyAuditFormatStoredUsuario;
          const usuario =
            typeof usuarioFn === "function"
              ? usuarioFn(actor, actorEmail, auditActorUserId)
              : actorEmail || actor;
          globalThis.logPortalAuditEvent?.("requests", "create", {
            entityId: String(rowToSave.id || ""),
            entityLabel: String(rowToSave.requestNumber || "Solicitud"),
            summary: `${String(rowToSave.clientName || "Cliente")} · ${String(rowToSave.originCity || "")} → ${String(rowToSave.destinationCity || "")}`,
            actor,
            actorEmail,
            actorUserId: auditActorUserId,
            usuario
          });
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

    nodes.viewRoot.querySelectorAll("[data-action='requests-operate-rail-toggle']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.closest(".req-operate");
        if (!panel) return;
        const collapsed = panel.classList.toggle("is-rail-collapsed");
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        btn.setAttribute("title", collapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite");
        setOperateRailCollapsed("requests", collapsed);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='requests']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = String(btn.dataset.tab || "");
        if (!tab) return;
        const ws =
          typeof normalizeHrWorkspace === "function" ? normalizeHrWorkspace("requests", tab) : tab === "data" ? "data" : "operate";
        if (ws !== "operate" && ws !== "data") return;
        state.requestsUi = { ...(state.requestsUi || {}), workspace: ws };
        if (typeof persistHrWorkspace === "function") persistHrWorkspace("requests", ws);
        if (
          typeof switchHrWorkspacePanels === "function" &&
          switchHrWorkspacePanels({
            root: nodes.viewRoot,
            moduleId: "requests",
            workspace: ws,
            panelAttr: "data-requests-panel"
          })
        ) {
          if (ws === "data" && typeof portalCanRefreshFromApi === "function" && portalCanRefreshFromApi()) {
            void applyPortalBootstrapFromApi().then((ok) => {
              if (ok && typeof scheduleRenderPortalView === "function") scheduleRenderPortalView();
            });
          }
          return;
        }
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

    const companySearchRestore = state.__requestsCompanySearchRestore;
    if (companySearchRestore && typeof companySearchRestore.start === "number") {
      delete state.__requestsCompanySearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "requests") return;
        const inp = root.querySelector("[data-action='requests-company-search']");
        if (!inp || typeof inp.focus !== "function") return;
        inp.focus();
        if (typeof inp.setSelectionRange === "function") {
          const n = String(inp.value || "").length;
          const s = Math.max(0, Math.min(companySearchRestore.start, n));
          const e = Math.max(0, Math.min(companySearchRestore.end ?? companySearchRestore.start, n));
          inp.setSelectionRange(s, e);
        }
      });
    }
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.requests = bindMisSolicitudesPortalControls;
})();
