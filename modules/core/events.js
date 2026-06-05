/**
 * Antares Portal — delegación global de eventos y hooks post-render del `viewRoot`.
 * Las funciones usan helpers del runtime clásico (`portal-runtime.js`) vía `window`.
 */
import { state, nodes, persistClientDataScope } from "./store.js";
import { isPortalClientUser } from "./client-data-scope-ui.js";
import { currentUser, hasPermission, renderAuthTab, wireSupabasePasswordRecoveryUi } from "./auth.js";
import { KEYS, PERMISSIONS, CLIENT_DATA_SCOPE, ROLES, UI_PREFS } from "./config.js";
import { read, write, writeAwaitServer } from "./data-io.js";
import {
  registerBindEventsCallback,
  scheduleRenderPortalView,
  setView,
  renderPortalView,
  syncPublicNavDrawer,
  closePublicNavDrawer,
  setPortalDrawerOpen,
  viewFromPortalHash,
  syncPortalHash
} from "./router.js";
import { isCreatePanelExpanded } from "../ui/components.js";
import { applyPublicLanguage, applyTheme } from "./i18n.js";
function applyModuleMicroAnimations() {
  if (state.__skipModuleAnimationsOnce) {
    state.__skipModuleAnimationsOnce = false;
    return;
  }
  /** Repintados de la bandeja (poll / marcar leída) no deben re-disparar el fade de la tarjeta. */
  if (state.currentView === "notifications" && state.__notificationsViewStickyRender) {
    return;
  }
  const targets = [...nodes.viewRoot.querySelectorAll(".p-card, .table-wrap, .user-card, .users-hero-item")];
  targets.forEach((node, idx) => {
    node.classList.remove("module-appear");
    node.style.animationDelay = `${Math.min(idx * 45, 380)}ms`;
    requestAnimationFrame(() => node.classList.add("module-appear"));
  });
}
function wireAdminCompanyLocationSelects() {
  const createForm = document.getElementById("form-admin-company-create");
  if (createForm) {
    const draft = getAdminUsersDraft("createCompany");
    attachDepartmentCitySelects(createForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']",
      initialDepartment: String(draft.department || ""),
      initialCity: String(draft.city || "")
    });
  }
  const editForm = document.getElementById("form-admin-company-edit");
  if (editForm) {
    const ui = state.adminUsersUi || {};
    const cid = String(ui.editCompanyId || "");
    const companies = read(KEYS.companies, []);
    const raw = cid ? companies.find((c) => String(c.id) === cid) : null;
    const row = raw ? normalizePortalBootstrapCompanyRow(raw) : null;
    const idept = row ? matchColombiaDepartmentToCatalogKey(row.department || "") : "";
    const icity = row ? matchColombiaCityInDepartment(idept, row.city || "") : "";
    attachDepartmentCitySelects(editForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']",
      initialDepartment: idept,
      initialCity: icity
    });
  }
}
function wireAdminCompanyLogoOvals() {
  const wireForm = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    const input = form.querySelector("input[name='logoFile']");
    const wrap = form.querySelector("[data-company-logo-preview-wrap]");
    if (!input || !wrap) return;
    const img = wrap.querySelector("[data-company-logo-preview-img]");
    const fallback = wrap.querySelector("[data-company-logo-fallback]");
    let previewBlobUrl = "";
    if (img && img.dataset.companyLogoOriginal === "1" && img.src) {
      img.dataset.originalSrc = img.src;
    }
    const clearBlob = () => {
      if (previewBlobUrl && previewBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewBlobUrl);
      }
      previewBlobUrl = "";
    };
    const applyPreview = () => {
      const file = input.files?.[0] || null;
      if (file) {
        clearBlob();
        previewBlobUrl = URL.createObjectURL(file);
        if (img) {
          img.src = previewBlobUrl;
          img.removeAttribute("hidden");
        }
        wrap.classList.add("has-image");
        if (fallback) fallback.setAttribute("hidden", "");
        return;
      }
      clearBlob();
      if (img?.dataset.originalSrc) {
        img.src = img.dataset.originalSrc;
        img.removeAttribute("hidden");
        wrap.classList.add("has-image");
        if (fallback) fallback.setAttribute("hidden", "");
      } else {
        if (img) {
          img.removeAttribute("src");
          img.setAttribute("hidden", "");
        }
        wrap.classList.remove("has-image");
        if (fallback) fallback.removeAttribute("hidden");
      }
    };
    input.addEventListener("change", applyPreview);
  };
  wireForm("form-admin-company-create");
  wireForm("form-admin-company-edit");
}
function ensurePositionsCatalogLiveSelects() {
  if (window.__antaresPositionsSelectLiveWired) return;
  window.__antaresPositionsSelectLiveWired = true;
  document.addEventListener("antares-positions-catalog-updated", () => refreshPositionSelectsInDocument());
  refreshPositionSelectsInDocument();
}
function installVehicleCardActionsDelegation() {
  if (state.vehicleCardActionsDelegationBound || !nodes.viewRoot) return;
  state.vehicleCardActionsDelegationBound = true;
  nodes.viewRoot.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action='view-vehicle'], [data-action='toggle-vehicle']");
    if (!btn || !nodes.viewRoot.contains(btn)) return;
    event.preventDefault();
    event.stopPropagation();
    const vid = String(btn.dataset.id || "").trim();
    if (!vid) return;
    const action = String(btn.dataset.action || "");
    if (action === "view-vehicle") {
      const vehicle = findPortalVehicleById(vid);
      if (!vehicle) {
        notify(userMessage("genericError"), "error");
        return;
      }
      openVehicleTechnicalSheetModal(vehicle);
      return;
    }
    if (action === "toggle-vehicle") {
      if (abortUnlessCanToggleVehicleStatus()) return;
      togglePortalVehicleManualAvailability(vid);
    }
  });
}
function installRequestDetailDelegation() {
  if (state.requestDetailDelegationBound || !nodes.viewRoot) return;
  state.requestDetailDelegationBound = true;
  nodes.viewRoot.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action='detail']");
    if (!btn || !nodes.viewRoot.contains(btn)) return;
    if (btn.hasAttribute("disabled")) return;
    const id = String(btn.dataset.id || "").trim();
    if (!id) return;
    const req = findTransportRequestById(id);
    if (!req) {
      notify(userMessage("bulkRequestMissing"), "error");
      return;
    }
    event.preventDefault();
    openRequestDetailModal(req);
  });
}
function installDriverCardActionsDelegation() {
  if (state.driverCardActionsDelegationBound || !nodes.viewRoot) return;
  state.driverCardActionsDelegationBound = true;
  nodes.viewRoot.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action='view-driver'], [data-action='toggle-driver']");
    if (!btn || !nodes.viewRoot.contains(btn)) return;
    event.preventDefault();
    event.stopPropagation();
    const did = String(btn.dataset.id || "").trim();
    if (!did) return;
    const action = String(btn.dataset.action || "");
    if (action === "view-driver") {
      const driver = findPortalDriverById(did);
      if (!driver) {
        notify(userMessage("genericError"), "error");
        return;
      }
      openDriverDetailSheetModal(driver);
      return;
    }
    if (action === "toggle-driver") {
      if (abortUnlessAdminForFleetDriverEdit()) return;
      togglePortalDriverManualAvailability(did);
    }
  });
}
function mountUniversalModuleFilters() {
  if (!nodes.viewRoot) return;
  const moduleView = String(state.currentView || "");
  const cardFirstViews = new Set([
    "profile",
    "payroll",
    "hiring",
    "labor-compliance",
    "admin-users",
    "authorizations",
    "contact-leads",
    "notifications"
  ]);
  if (cardFirstViews.has(moduleView)) return;
  const tableBodies = [...nodes.viewRoot.querySelectorAll(".table-wrap table tbody")];
  const tableRows = tableBodies.flatMap((tbody) => [...tbody.querySelectorAll("tr")]);
  const cards = [...nodes.viewRoot.querySelectorAll(".user-card, .careers-card")];
  if (!tableRows.length && !cards.length) return;

  const firstTable = nodes.viewRoot.querySelector(".table-wrap table");
  const headers = firstTable ? [...firstTable.querySelectorAll("thead th")].map((th) => String(th.textContent || "").trim()) : [];
  const moduleLabels = {
    requests: "Solicitudes",
    "transport-trips": "Viajes",
    "transport-vehicles": "Flota",
    "transport-drivers": "Conductores",
    "transport-calendar": "Calendario",
    history: "Historial",
    payroll: "Gestión humana",
    hiring: "Contratacion",
    "admin-users": "Usuarios",
    authorizations: "Centro de aprobaciones",
    notifications: "Notificaciones",
    reports: "Reporteria"
  };
  const moduleLabel = moduleLabels[moduleView] || "Modulo";

  const toIsoDateSafe = (textValue) => {
    const text = String(textValue || "");
    const localDateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (localDateMatch) {
      const day = Number(localDateMatch[1]);
      const month = Number(localDateMatch[2]);
      const year = Number(localDateMatch[3].length === 2 ? `20${localDateMatch[3]}` : localDateMatch[3]);
      if (day > 0 && month > 0 && month <= 12 && year >= 2000) {
        return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }
    const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
    return isoMatch ? `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}` : "";
  };

  const statusValues = [...new Set(
    tableRows
      .map((row) => row.querySelector(".status, .status-pretty"))
      .filter(Boolean)
      .map((node) => String(node.textContent || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
  )];

  const host = document.createElement("section");
  host.className = "module-filters";
  host.innerHTML = `
    <div class="module-filters-head">
      <div class="module-filters-title">${IC.filter} Filtros inteligentes · ${moduleLabel}</div>
      <div class="module-filters-count" id="module-filter-count">0 resultados</div>
    </div>
    <div class="module-filters-grid">
      <label class="module-filter-field">
        <span>Busqueda general</span>
        <input id="module-filter-text" type="search" placeholder="Ej: cliente, placa, conductor, solicitud..." />
      </label>
      <label class="module-filter-field">
        <span>Campo</span>
        <select id="module-filter-column">
          <option value="">Todos los campos</option>
          ${headers.map((header, idx) => `<option value="${idx}">${header}</option>`).join("")}
        </select>
      </label>
      <label class="module-filter-field">
        <span>Valor exacto/parcial</span>
        <input id="module-filter-value" type="search" placeholder="Valor del campo seleccionado..." />
      </label>
      <label class="module-filter-field">
        <span>Estado</span>
        <select id="module-filter-status">
          <option value="">Todos</option>
          ${statusValues.map((status) => `<option value="${status.toLowerCase()}">${status}</option>`).join("")}
        </select>
      </label>
      <label class="module-filter-field">
        <span>Fecha desde</span>
        <input id="module-filter-date-from" type="date" />
      </label>
      <label class="module-filter-field">
        <span>Fecha hasta</span>
        <input id="module-filter-date-to" type="date" />
      </label>
    </div>
    <div class="module-filters-actions">
      <div class="module-filter-quick-status" id="module-filter-quick-status"></div>
      <button id="module-filter-clear" type="button" class="btn btn-sm btn-action">${IC.x} Limpiar filtros</button>
    </div>
  `;
  nodes.viewRoot.prepend(host);
  portalUpgradeDates(host);

  const input = host.querySelector("#module-filter-text");
  const colSelect = host.querySelector("#module-filter-column");
  const valueInput = host.querySelector("#module-filter-value");
  const statusSelect = host.querySelector("#module-filter-status");
  const fromInput = host.querySelector("#module-filter-date-from");
  const toInput = host.querySelector("#module-filter-date-to");
  const clearBtn = host.querySelector("#module-filter-clear");
  const resultCounter = host.querySelector("#module-filter-count");
  const quickStatusHost = host.querySelector("#module-filter-quick-status");

  if (quickStatusHost && statusValues.length) {
    quickStatusHost.innerHTML = statusValues
      .map((status) => `<button type="button" class="filter-pill" data-status-pill="${status.toLowerCase()}">${status}</button>`)
      .join("");
  }

  const apply = () => {
    const needle = String(input?.value || "").toLowerCase().trim();
    const colIndex = Number(colSelect?.value || NaN);
    const colNeedle = String(valueInput?.value || "").toLowerCase().trim();
    const selectedStatus = String(statusSelect?.value || "").toLowerCase().trim();
    const fromDate =
      window.AntaresValidation?.portalDateInputValueIso?.(fromInput) || String(fromInput?.value || "").trim();
    const toDate =
      window.AntaresValidation?.portalDateInputValueIso?.(toInput) || String(toInput?.value || "").trim();
    let visibleRows = 0;
    let visibleCards = 0;

    tableRows.forEach((row) => {
      const text = String(row.textContent || "").toLowerCase();
      const cells = [...row.querySelectorAll("td")];
      const colText = Number.isFinite(colIndex) && cells[colIndex] ? String(cells[colIndex].textContent || "").toLowerCase() : "";
      const statusText = String(row.querySelector(".status, .status-pretty")?.textContent || "").toLowerCase().trim();
      const rowDate = toIsoDateSafe(row.textContent || "");
      const passGlobal = !needle || text.includes(needle);
      const passColumn = !colNeedle || (Number.isFinite(colIndex) ? colText.includes(colNeedle) : text.includes(colNeedle));
      const passStatus = !selectedStatus || statusText.includes(selectedStatus);
      const passFrom = !fromDate || (rowDate && rowDate >= fromDate);
      const passTo = !toDate || (rowDate && rowDate <= toDate);
      const visible = passGlobal && passColumn && passStatus && passFrom && passTo;
      row.style.display = visible ? "" : "none";
      if (visible) visibleRows += 1;
    });

    cards.forEach((card) => {
      const text = String(card.textContent || "").toLowerCase();
      const passGlobal = !needle || text.includes(needle);
      const passColumn = !colNeedle || text.includes(colNeedle);
      const passStatus = !selectedStatus || text.includes(selectedStatus);
      const visible = passGlobal && passColumn && passStatus;
      card.style.display = visible ? "" : "none";
      if (visible) visibleCards += 1;
    });

    const totalVisible = visibleRows + visibleCards;
    if (resultCounter) {
      resultCounter.textContent = `${totalVisible} resultado${totalVisible === 1 ? "" : "s"}`;
    }
  };

  input?.addEventListener("input", apply);
  colSelect?.addEventListener("change", apply);
  valueInput?.addEventListener("input", apply);
  statusSelect?.addEventListener("change", apply);
  fromInput?.addEventListener("change", apply);
  toInput?.addEventListener("change", apply);
  clearBtn?.addEventListener("click", () => {
    if (input) input.value = "";
    if (valueInput) valueInput.value = "";
    if (colSelect) colSelect.value = "";
    if (statusSelect) statusSelect.value = "";
    if (fromInput) clearFormDateInput(fromInput);
    if (toInput) clearFormDateInput(toInput);
    apply();
  });

  quickStatusHost?.querySelectorAll("[data-status-pill]").forEach((pill) => {
    pill.addEventListener("click", () => {
      const value = String(pill.getAttribute("data-status-pill") || "");
      const current = String(statusSelect?.value || "");
      if (statusSelect) statusSelect.value = current === value ? "" : value;
      quickStatusHost.querySelectorAll("[data-status-pill]").forEach((node) => {
        node.classList.toggle("active", node.getAttribute("data-status-pill") === statusSelect?.value);
      });
      apply();
    });
  });

  apply();
}
function enforceColombianFormStandards() {
  const setAttr = (selector, attrs = {}) => {
    const node = document.querySelector(selector);
    if (!node) return;
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      node.setAttribute(key, String(value));
    });
  };
  const ensureSelectOptions = (selector, values = [], placeholder = "Seleccione...") => {
    const select = document.querySelector(selector);
    if (!select || select.tagName !== "SELECT") return;
    const currentValue = String(select.value || "");
    select.innerHTML = selectOptionsFromCatalog(values, currentValue, placeholder);
    if (currentValue && values.includes(currentValue)) {
      select.value = currentValue;
    }
  };

  setAttr("#form-vehicle input[name='plate']", { pattern: "[A-Z]{3}[0-9]{3}", maxlength: "6", placeholder: "ABC123" });
  setAttr("#form-vehicle input[name='year']", { min: "1990", max: String(new Date().getFullYear() + 1) });
  ensureSelectOptions("#form-driver select[name='licenseCategory']", CO_CATALOGS.licenseCategories, "Seleccione categoria...");

  setAttr("#form-admin-company-create input[name='taxId']", {
    pattern: "[0-9\\-]{6,32}",
    minlength: "6",
    maxlength: "32",
    placeholder: "900123456-7"
  });
  setAttr("#form-admin-company-create input[name='phone']", { maxlength: "32", inputmode: "tel", autocomplete: "tel", placeholder: "+57 601 234 5678" });

  setAttr("#form-admin-company-edit input[name='taxId']", {
    pattern: "[0-9\\-]{6,32}",
    minlength: "6",
    maxlength: "32",
    placeholder: "900123456-7"
  });
  setAttr("#form-admin-company-edit input[name='phone']", {
    maxlength: "32",
    inputmode: "tel",
    autocomplete: "tel",
    placeholder: "+57 300 000 0000"
  });
  setAttr("#form-admin-user-create input[name='phone']", { maxlength: "32", inputmode: "tel", autocomplete: "tel", placeholder: "+57 300 000 0000" });
  setAttr("#form-admin-user-edit input[name='phone']", { maxlength: "32", inputmode: "tel", autocomplete: "tel", placeholder: "+57 300 000 0000" });

  setAttr("#form-employee input[name='phone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  setAttr("#form-employee input[name='emergencyPhone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  setAttr("#form-employee input[name='bankAccount']", { minlength: "8", maxlength: "24", placeholder: "Cuenta bancaria del trabajador" });
  ensureSelectOptions("#form-employee select[name='bloodType']", CO_CATALOGS.bloodTypes, "Seleccione tipo de sangre...");
  ensureSelectOptions("#form-employee select[name='licenseCategory']", CO_CATALOGS.licenseCategories, "Seleccione categoria...");
  ensureSelectOptions("#form-employee select[name='eps']", CO_CATALOGS.eps, "Seleccione EPS...");
  ensureSelectOptions("#form-employee select[name='pensionFund']", CO_CATALOGS.pensionFunds, "Seleccione fondo...");
  ensureSelectOptions("#form-employee select[name='arl']", CO_CATALOGS.arl, "Seleccione ARL...");
  applyDocumentFieldConstraints(nodes.viewRoot || document, {
    typeSelector: "#form-employee select[name='documentType']",
    docSelector: "#form-employee input[name='idDoc']"
  });

  setAttr("#form-position input[name='baseSalary']", { min: String(CO_HR_RULES.minMonthlySalary) });

  setAttr("#form-vacancy input[name='openings']", { min: "1" });
  setAttr("#form-vacancy input[name='deadline']", { min: nowIso().slice(0, 10) });

  setAttr("#form-candidate input[name='phone']", { pattern: "[0-9]{10,15}", minlength: "10", maxlength: "15" });
  applyDocumentFieldConstraints(nodes.viewRoot || document, {
    typeSelector: "#form-candidate select[name='documentType']",
    docSelector: "#form-candidate input[name='idDoc']"
  });
  setAttr("#form-interview input[name='when']", { min: colombiaDatetimeLocalString() });

  setAttr("#form-hr-absence input[name='supportNumber']", { minlength: "4", maxlength: "40", placeholder: "Radicado o soporte legal" });
  ensureSelectOptions("#form-hr-absence select[name='epsEntity']", [...CO_CATALOGS.eps, "ARL", "Juzgado", "Registraduría", "Otra"], "Seleccione EPS/ARL o entidad...");

  setAttr("#form-sst-compliance input[name='documentCode']", { minlength: "4", maxlength: "32" });

  const requestPrice = document.querySelector("#form-request input[name='tripValue']");
  if (requestPrice) {
    requestPrice.value = "0";
    requestPrice.setAttribute("readonly", "true");
    requestPrice.setAttribute("aria-readonly", "true");
  }

  const V = window.AntaresValidation;
  if (V?.prepareFormsInRoot) {
    if (nodes.viewRoot) V.prepareFormsInRoot(nodes.viewRoot);
    const authContent = document.getElementById("auth-content");
    if (authContent) V.prepareFormsInRoot(authContent);
    if (nodes.b2bForm) V.decorateFormFields(nodes.b2bForm);
  }
  const todayYmd = colombiaTodayIsoDate();
  ["pickup-date", "delivery-date"].forEach((id) => {
    const el = queryPortalDateField(nodes.viewRoot || document, id);
    if (el) el.dataset.antaresDateMin = todayYmd;
  });
}
function bindDynamicEvents() {
  const actor = currentUser();
  const isAdmin = actor?.role === ROLES.ADMIN;
  const fleetDriverEditor = canEditFleetDriverAsAdmin(actor);
  const hiringEditor = canManageHiringModule(actor);
  const restrictedActions = PORTAL_NON_ADMIN_BLOCKED_ACTIONS;

  if (!fleetDriverEditor) {
    nodes.viewRoot
      .querySelectorAll("[data-action='edit-driver'], [data-action='toggle-driver']")
      .forEach((node) => {
        if (node.matches("button")) node.classList.add("hidden");
      });
  }

  if (!isAdmin) {
    nodes.viewRoot.querySelectorAll("[data-action]").forEach((node) => {
      const action = String(node.dataset.action || "");
      if (FLEET_DRIVER_EDIT_ACTIONS.has(action) && fleetDriverEditor) return;
      if (HIRING_RRHH_EDIT_ACTIONS.has(action) && hiringEditor) return;
      if (canPerformPermissionGatedAction(actor, action, node)) return;
      if (!restrictedActions.has(action)) return;
      if (node.matches("button")) node.classList.add("hidden");
      if (node.matches("select")) {
        node.setAttribute("disabled", "true");
        node.style.opacity = "0.6";
        node.style.cursor = "not-allowed";
      }
    });
    if (!state.portalNonAdminCaptureBound) {
      state.portalNonAdminCaptureBound = true;
      nodes.viewRoot.addEventListener("click", portalNonAdminRestrictedCaptureClick, true);
      nodes.viewRoot.addEventListener("change", portalNonAdminRestrictedCaptureChange, true);
    }
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-password']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetForm = String(btn.dataset.target || "");
      let input = null;
      if (targetForm === "admin-create") input = document.querySelector("#form-admin-user-create input[name='password']");
      else if (targetForm === "admin-edit") input = document.querySelector("#form-admin-user-edit input[name='password']");
      else if (targetForm === "register") input = document.querySelector("#form-register input[name='password']");
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      btn.textContent = `${IC.eye} ${visible ? "Mostrar" : "Ocultar"}`;
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-create-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panelId = String(btn.dataset.panel || "");
      if (!panelId) return;
      const PAYROLL_CREATE_IDS = [
    "create-employee",
    "create-payroll",
    "create-driver-trip-payment",
    "create-payroll-settlement",
    "create-hr-absence"
  ];
      const HIRING_CREATE_IDS = ["create-position", "create-vacancy", "create-candidate", "create-interview", "create-contract"];
      const payrollSet = new Set(PAYROLL_CREATE_IDS);
      const hiringSet = new Set(HIRING_CREATE_IDS);
      const wasOpen = isCreatePanelExpanded(panelId, false, state.createPanels || {});
      const nextOpen = !wasOpen;
      state.createPanels = { ...(state.createPanels || {}) };

      if (payrollSet.has(panelId)) {
        PAYROLL_CREATE_IDS.forEach((id) => {
          state.createPanels[id] = nextOpen && id === panelId;
        });
      } else if (hiringSet.has(panelId)) {
        HIRING_CREATE_IDS.forEach((id) => {
          state.createPanels[id] = nextOpen && id === panelId;
        });
      } else {
        state.createPanels[panelId] = nextOpen;
      }

      if (payrollSet.has(panelId) && nextOpen) {
        state.payrollUi = { ...(state.payrollUi || {}), workspace: "operate" };
        persistHrWorkspace("payroll", "operate");
      }
      if (hiringSet.has(panelId) && nextOpen) {
        state.hiringUi = { ...(state.hiringUi || {}), workspace: "operate" };
        persistHrWorkspace("hiring", "operate");
      }
      renderPortalView();
      if (nextOpen) {
        scrollToCreatePanelForm(panelId);
      }
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cancel-create-panel']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const panelId = String(btn.dataset.panel || "");
      const formEl = btn.closest("form");
      if (!panelId || !formEl) return;
      await resetCreatePanelForm(panelId, formEl);
    });
  });

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

  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = String(btn.dataset.panel || "");
      const ui = getAdminUsersUi();
      const samePanel = ui.panel === panel;
      const isCreateUser = panel === "create-user";
      const isCreateCompany = panel === "create-company";
      if (samePanel && isCreateUser) {
        if (ui.createUserMinimized) {
          document.querySelector("[data-action='toggle-admin-create-user-panel']")?.click();
        } else {
          scrollToAdminUsersFocusedForm();
        }
        return;
      }
      if (samePanel && isCreateCompany) {
        if (ui.createCompanyMinimized) {
          document.querySelector("[data-action='toggle-admin-create-company-panel']")?.click();
        } else {
          scrollToAdminUsersFocusedForm();
        }
        return;
      }
      const willOpen =
        !samePanel ||
        (isCreateUser && ui.createUserMinimized) ||
        (isCreateCompany && ui.createCompanyMinimized);
      setAdminUsersUi({
        panel: samePanel && !willOpen ? "" : panel,
        editUserId: "",
        editCompanyId: "",
        section: "actions",
        createUserMinimized: isCreateUser ? false : ui.createUserMinimized,
        createCompanyMinimized: isCreateCompany ? false : ui.createCompanyMinimized,
        editMinimized: false,
        permissionsMinimized: panel === "set-permissions" ? false : ui.permissionsMinimized
      });
      renderPortalView();
      if (willOpen && getAdminUsersUi().panel) {
        scrollToAdminUsersFocusedForm();
      }
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-create-user-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ui = getAdminUsersUi();
      setAdminUsersUi({ createUserMinimized: !ui.createUserMinimized });
      renderPortalView();
      if (!getAdminUsersUi().createUserMinimized) scrollToAdminUsersFocusedForm();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-create-company-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ui = getAdminUsersUi();
      setAdminUsersUi({ createCompanyMinimized: !ui.createCompanyMinimized });
      renderPortalView();
      if (!getAdminUsersUi().createCompanyMinimized) scrollToAdminUsersFocusedForm();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cancel-admin-create-panel']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const panel = String(btn.dataset.panel || "");
      const formEl = btn.closest("form");
      if (!panel || !formEl) return;
      if (!(await confirmDiscardCreateFormAsync(formEl))) return;
      if (panel === "create-user") {
        clearAdminUsersDraft("createUser");
        setAdminUsersUi({
          panel: "create-user",
          createUserMinimized: false,
          editUserId: "",
          editCompanyId: ""
        });
      } else if (panel === "create-company") {
        clearAdminUsersDraft("createCompany");
        setAdminUsersUi({
          panel: "create-company",
          createCompanyMinimized: false,
          editUserId: "",
          editCompanyId: ""
        });
      } else {
        return;
      }
      renderPortalView();
      scrollToAdminUsersFocusedForm();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='admin-users-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizeAdminUsersSection(btn.dataset.section, adminUsersHasPendingInCache());
      setAdminUsersUi({ section });
      if (section === "sessions" && portalCanRefreshFromApi() && !state.adminUserSessionsHydrated) {
        renderPortalView();
        void ensureAdminUserSessionsLoaded().finally(() => {
          if (state.currentView === "admin-users" && getAdminUsersUi().section === "sessions") {
            scheduleRenderPortalView();
          }
        });
        return;
      }
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-permissions-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ui = getAdminUsersUi();
      setAdminUsersUi({ permissionsMinimized: !ui.permissionsMinimized });
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-edit-user-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ui = getAdminUsersUi();
      setAdminUsersUi({ editMinimized: !ui.editMinimized });
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='client-data-scope']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isPortalClientUser(currentUser())) return;
      const scope = String(btn.dataset.scope || CLIENT_DATA_SCOPE.COMPANY);
      persistClientDataScope(scope);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-sessions-log']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!hasPermission(currentUser(), PERMISSIONS.USERS_MANAGE)) return;
      state.adminSessionsLogMinimized = !Boolean(state.adminSessionsLogMinimized);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='refresh-user-sessions']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!hasPermission(currentUser(), PERMISSIONS.USERS_MANAGE)) return;
      renderPortalView();
      void ensureAdminUserSessionsLoaded({ force: true }).finally(() => {
        if (state.currentView === "admin-users") scheduleRenderPortalView();
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='clear-user-sessions-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!hasPermission(currentUser(), PERMISSIONS.USERS_MANAGE)) return;
      openConfirmModal({
        title: "Finalizar sesiones",
        message:
          "Se cerrarán las sesiones de usuarios desde el módulo raíz. Los usuarios deberán iniciar sesión nuevamente.",
        confirmText: "Finalizar sesiones",
        onConfirm: async () => {
          try {
            await postPortalAuthorized("/portal/admin-clear-user-sessions", {});
          } catch (err) {
            notify(String(err?.message || "No fue posible finalizar sesiones en el servidor."), "error");
            return;
          }
          notify("Sesiones finalizadas correctamente.", "success");
          renderPortalView();
          void ensureAdminUserSessionsLoaded({ force: true }).finally(() => {
            if (state.currentView === "admin-users") scheduleRenderPortalView();
          });
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='open-edit-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      if (!id) return;
      setAdminUsersUi({ panel: "", editUserId: id, editCompanyId: "", section: "actions", editMinimized: false });
      renderPortalView();
      scrollToAdminUsersFocusedForm();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-edit-user']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const formEl = document.getElementById("form-admin-user-edit");
      if (formEl && !(await confirmDiscardCreateFormAsync(formEl))) return;
      setAdminUsersUi({ panel: "", editUserId: "", editCompanyId: "", section: "actions", editMinimized: false });
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='open-edit-company']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      if (!id) return;
      state.adminUsersUi = { ...getAdminUsersUi(), panel: "", editUserId: "", editCompanyId: id, section: "actions" };
      renderPortalView();
      scrollToAdminUsersFocusedForm();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-edit-company']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const formEl = document.getElementById("form-admin-company-edit");
      if (formEl && !(await confirmDiscardCreateFormAsync(formEl))) return;
      state.adminUsersUi = { ...getAdminUsersUi(), panel: "", editUserId: "", editCompanyId: "", section: "actions" };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-company-active']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const companyId = String(btn.dataset.id || "");
      if (!companyId) return;
      const companies = read(KEYS.companies, []);
      const target = companies.find((c) => String(c.id) === companyId);
      if (!target) return;
      const active = isCompanyRecordActive(target);
      const verb = active ? "desactivar" : "activar";
      openConfirmModal({
        title: `${active ? "Desactivar" : "Activar"} empresa`,
        message: `Se va a ${verb} "${String(target.name || "").trim()}". Las empresas inactivas no aparecen al asignar usuarios nuevos.`,
        confirmText: active ? "Desactivar" : "Activar",
        onConfirm: async () => {
          const updatedTs = nowIso();
          const next = companies.map((c) =>
            String(c.id) === companyId ? { ...c, active: !active, updatedAt: updatedTs } : c
          );
          await writeAwaitServer(KEYS.companies, next);
          notify(userMessage(active ? "companyDeactivated" : "companyActivated"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-company']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const companyId = String(btn.dataset.id || "");
      if (!companyId) return;
      const companies = read(KEYS.companies, []);
      const target = companies.find((c) => String(c.id) === companyId);
      if (!target) return;
      const linkedUsers = read(KEYS.users, []).filter((u) => String(u.companyId || "") === companyId);
      if (linkedUsers.length > 0) {
        notify(userMessage("companyDeleteBlockedUsers"), "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar empresa",
        message: `Eliminar permanentemente "${String(target.name || "").trim()}" del sistema.`,
        confirmText: "Eliminar",
        onConfirm: async () => {
          try {
            await postPortalAuthorized("/portal/admin-company-delete", { companyId });
          } catch (err) {
            notify(String(err?.message || userMessage("genericError")), "error");
            return;
          }
          const snapshotCompany = read(KEYS.companies, []).find((c) => String(c.id) === String(companyId));
          const ok = await removeFromPortalListAwaitServer(KEYS.companies, companyId, { notifyOnFailure: false });
          if (!ok) {
            notify("La empresa se eliminó en el servidor, pero no se pudo actualizar la vista local.", "error");
            if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
            renderPortalView();
            return;
          }
          if (snapshotCompany) {
            appendModuleAuditLog({
              action: "delete",
              moduleId: "companies",
              moduleLabel: "Usuarios y permisos",
              entityId: String(snapshotCompany.id || ""),
              entityLabel: String(snapshotCompany.name || "Empresa"),
              summary: `${String(snapshotCompany.taxId || snapshotCompany.nit || "Sin NIT")} · ${String(snapshotCompany.city || "Sin ciudad")}`
            });
          }
          state.adminUsersUi = { ...getAdminUsersUi(), panel: "", editUserId: "", editCompanyId: "", section: "actions" };
          notify(userMessage("companyDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  const adminUserCreate = document.getElementById("form-admin-user-create");
  if (adminUserCreate) {
    const draft = getAdminUsersDraft("createUser");
    attachDepartmentCitySelects(adminUserCreate, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']",
      initialDepartment: String(draft.department || ""),
      initialCity: String(draft.city || "")
    });
    bindPasswordStrengthSuite(
      adminUserCreate.querySelector("input[name='password']"),
      adminUserCreate.querySelector("#admin-password-strength-suite")
    );
    wireAdminUserFormPermGridOnRoleChange(adminUserCreate);
    if (draft.role) repaintPermGridInForm(adminUserCreate, draft.role || ROLES.ADMIN);
    applyAdminUsersFormDraft(adminUserCreate, draft);
    adminUserCreate.addEventListener("input", () => {
      setAdminUsersDraft("createUser", readAdminUsersFormDraft(adminUserCreate, { excludeNames: ["password"] }));
    });
    adminUserCreate.addEventListener("change", () => {
      setAdminUsersDraft("createUser", readAdminUsersFormDraft(adminUserCreate, { excludeNames: ["password"] }));
    });
    wireFormSubmitGuard(adminUserCreate, async (event) => {
      const actor = currentUser();
      const data = readFormEntriesNormalized(adminUserCreate);
      const permissions = [...adminUserCreate.querySelectorAll("input[name='permissions']:checked")].map(
        (input) => input.value
      );
      const users = read(KEYS.users, []);
      if (users.some((item) => normalizeEmail(item.email) === normalizeEmail(data.email))) {
        notify(userMessage("userEmailExists"), "error");
        return;
      }
      const docValidation = validateColombianDocument(data.documentType, data.taxId);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.taxId = docValidation.normalized;
      const company = getCompanyById(data.companyId);
      if (!company) {
        notify(userMessage("userSelectCompany"), "error");
        return;
      }
      const passPolicy = validatePasswordPolicy(data.password);
      if (!passPolicy.ok) {
        notify(userMessage(passPolicy.key), "error");
        return;
      }
      if (actor?.role !== ROLES.ADMIN) {
        await queueApproval({
          type: "create_user",
          title: `Creacion de usuario ${normalizeLatinUpperForDb(data.name)}`,
          payload: { ...data, companyName: company.name, permissions },
          requestedByUserId: actor?.id || "",
          requestedByName: actor?.name || "Usuario"
        });
        notify(userMessage("userApprovalQueued"), "info");
        clearAdminUsersDraft("createUser");
        state.adminUsersUi = {
          ...getAdminUsersUi(),
          panel: "",
          editUserId: "",
          editCompanyId: "",
          section: "actions",
          createUserMinimized: false
        };
        renderPortalView();
        return;
      }
      const registrationKindCreate = normalizeRegistrationKindForDb(data.registrationKind);
      users.push({
        id: newUuidV4(),
        name: normalizeLatinUpperForDb(data.name),
        email: normalizeEmail(data.email),
        password: await hashPassword(data.password),
        role: data.role,
        documentType: data.documentType,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        personType: normalizePersonTypeForDb(data.personType),
        documentIssuedAt: data.documentIssuedAt || "",
        company: normalizeLatinUpperForDb(data.company || company.name),
        companyId: company.id,
        taxId: data.taxId,
        phone: normalizePortalPhoneForStorage(data.phone),
        city: normalizeLatinForDb(data.city),
        department: normalizeLatinForDb(data.department),
        address: normalizeLatinUpperForDb(data.address),
        registrationKind: registrationKindCreate,
        profileQualityChecklist: {
          registrationKind: registrationKindCreate
        },
        twoFactorEnabled: String(data.twoFactorEnabled || "false") === "true",
        systemJoinDate: data.systemJoinDate || nowIso().slice(0, 10),
        createdAt: nowIso(),
        permissions: normalizeSavedUserPermissions(data.role, permissions)
      });
      await writeAwaitServer(KEYS.users, users);
      notify(userMessage("userCreated"), "success");
      clearAdminUsersDraft("createUser");
      state.adminUsersUi = {
        ...getAdminUsersUi(),
        panel: "",
        editUserId: "",
        editCompanyId: "",
        section: "actions",
        createUserMinimized: false
      };
      renderPortalView();
    });
  }

  const adminCompanyCreate = document.getElementById("form-admin-company-create");
  if (adminCompanyCreate) {
    const draft = getAdminUsersDraft("createCompany");
    applyAdminUsersFormDraft(adminCompanyCreate, draft);
    adminCompanyCreate.addEventListener("input", () => {
      setAdminUsersDraft("createCompany", readAdminUsersFormDraft(adminCompanyCreate));
    });
    adminCompanyCreate.addEventListener("change", () => {
      setAdminUsersDraft("createCompany", readAdminUsersFormDraft(adminCompanyCreate));
    });
    wireFormSubmitGuard(adminCompanyCreate, async (event) => {
      const data = readFormEntriesNormalized(adminCompanyCreate);
      const logoFile = adminCompanyCreate.querySelector("input[name='logoFile']")?.files?.[0] || null;
      if (!logoFile) {
        notify("Debe cargar el logo de la empresa.", "error");
        return;
      }
      const nitValidation = validateColombianDocument("NIT", data.taxId);
      if (!nitValidation.ok) {
        notify(userMessage("companyNitInvalid", nitValidation.message), "error");
        return;
      }
      const nameTrim = normalizeLatinUpperForDb(String(data.name || "").trim());
      if (!nameTrim) {
        notify(userMessage("validationStep"), "error");
        return;
      }
      if (nameTrim.length > 255) {
        notify(userMessage("companyNameTooLong"), "error");
        return;
      }
      const phoneStored = normalizePortalPhoneForStorage(String(data.phone || ""));
      const phoneDigits = phoneStored.replace(/\D/g, "");
      if (phoneStored && phoneDigits.length < 7) {
        notify(userMessage("companyPhoneInvalid"), "error");
        return;
      }
      const emailStored = normalizeEmail(String(data.email || ""));
      if (emailStored && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStored)) {
        notify("Ingrese un correo empresarial válido.", "error");
        return;
      }
      if (!phoneStored && !emailStored) {
        notify("Incluya al menos un canal de contacto: teléfono o correo.", "error");
        return;
      }
      const contactName = normalizeLatinUpperForDb(String(data.contactName || ""));
      const department = normalizeLatinForDb(String(data.department || ""));
      const city = normalizeLatinForDb(String(data.city || ""));
      const address = normalizeLatinUpperForDb(String(data.address || ""));
      const logoUrl = await resolveEmployeeAvatarUrl(logoFile, "");
      if (!String(logoUrl || "").trim()) {
        notify("No fue posible procesar el logo de la empresa. Intente de nuevo.", "error");
        return;
      }
      if (window.AntaresApi?.isConfigured?.() && isDataUrl(logoUrl)) {
        notify(
          "No se pudo obtener una URL pública del logo (R2). Revise CF_R2_* y CF_R2_PUBLIC_BASE en el servidor, CORS del bucket si usa subida directa, formato JPEG/PNG/WebP/GIF, o reintente. En modo servidor no se admite logo embebido (data URL).",
          "error"
        );
        return;
      }
      const companies = read(KEYS.companies, []);
      const nitNorm = nitValidation.normalized;
      const nameLc = nameTrim.toLowerCase();
      if (companies.some((c) => String(c.name || "").trim().toLowerCase() === nameLc)) {
        notify(userMessage("companyNameDuplicate"), "error");
        return;
      }
      if (companies.some((c) => String(c.taxId || c.nit || "").trim() === nitNorm)) {
        notify(userMessage("companyNitDuplicate"), "error");
        return;
      }
      const kind = normalizeCompanyKindForDb(data.companyKind);
      if (kind === "propia" && companies.some((c) => normalizeCompanyKindForDb(c.companyKind) === "propia")) {
        notify(userMessage("companyPropiaDuplicate"), "error");
        return;
      }
      companies.push(stampCreatedRecord({
        id: newUuidV4(),
        name: nameTrim,
        taxId: nitNorm,
        nit: nitNorm,
        phone: phoneStored,
        email: emailStored,
        contactName,
        department,
        city,
        address,
        logoUrl: String(logoUrl || "").trim(),
        companyKind: kind,
        active: true
      }));
      try {
        await writeAwaitServer(KEYS.companies, normalizeCompaniesForSync(companies));
      } catch (err) {
        const raw = String(err?.message || "");
        const msg =
          /too large|413|payload/i.test(raw)
            ? "El logo es demasiado grande para sincronizar. Cargue una imagen más liviana (ideal: PNG/JPG optimizado)."
            : "La empresa no se pudo guardar en el servidor.";
        notify(msg, "error");
        return;
      }
      notify(userMessage("companyCreated"), "success");
      clearAdminUsersDraft("createCompany");
      state.adminUsersUi = {
        ...getAdminUsersUi(),
        panel: "",
        editUserId: "",
        editCompanyId: "",
        section: "actions",
        createCompanyMinimized: false
      };
      renderPortalView();
    });
  }

  const adminCompanyEdit = document.getElementById("form-admin-company-edit");
  if (adminCompanyEdit) {
    wireFormSubmitGuard(adminCompanyEdit, async (event) => {
      const data = readFormEntriesNormalized(adminCompanyEdit);
      const logoFile = adminCompanyEdit.querySelector("input[name='logoFile']")?.files?.[0] || null;
      let logoUrlResolved = String(data.logoUrlExisting || "").trim();
      if (logoFile) {
        logoUrlResolved = String(await resolveEmployeeAvatarUrl(logoFile, logoUrlResolved || "") || "").trim();
      }
      if (!logoUrlResolved) {
        notify("La empresa debe tener un logo cargado.", "error");
        return;
      }
      if (window.AntaresApi?.isConfigured?.() && isDataUrl(logoUrlResolved)) {
        notify(
          "El logo actual está embebido y no se puede sincronizar con el servidor. Vuelva a cargarlo para subirlo correctamente.",
          "error"
        );
        return;
      }
      const companyId = String(data.id || "");
      if (!companyId) return;
      const companies = read(KEYS.companies, []);
      const existing = companies.find((c) => String(c.id) === companyId);
      if (!existing) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const nitValidation = validateColombianDocument("NIT", data.taxId);
      if (!nitValidation.ok) {
        notify(userMessage("companyNitInvalid", nitValidation.message), "error");
        return;
      }
      const nameTrim = normalizeLatinUpperForDb(String(data.name || "").trim());
      if (!nameTrim) {
        notify(userMessage("validationStep"), "error");
        return;
      }
      if (nameTrim.length > 255) {
        notify(userMessage("companyNameTooLong"), "error");
        return;
      }
      const nitNorm = nitValidation.normalized;
      const nameLc = nameTrim.toLowerCase();
      if (companies.some((c) => String(c.id) !== companyId && String(c.name || "").trim().toLowerCase() === nameLc)) {
        notify(userMessage("companyNameDuplicate"), "error");
        return;
      }
      if (companies.some((c) => String(c.id) !== companyId && String(c.taxId || c.nit || "").trim() === nitNorm)) {
        notify(userMessage("companyNitDuplicate"), "error");
        return;
      }
      const kind = normalizeCompanyKindForDb(data.companyKind);
      if (
        kind === "propia" &&
        companies.some((c) => String(c.id) !== companyId && normalizeCompanyKindForDb(c.companyKind) === "propia")
      ) {
        notify(userMessage("companyPropiaDuplicate"), "error");
        return;
      }
      const phoneStored = normalizePortalPhoneForStorage(String(data.phone || ""));
      const phoneDigits = phoneStored.replace(/\D/g, "");
      if (phoneStored && phoneDigits.length < 7) {
        notify(userMessage("companyPhoneInvalid"), "error");
        return;
      }
      const emailStored = normalizeEmail(String(data.email || ""));
      if (emailStored && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStored)) {
        notify("Ingrese un correo empresarial válido.", "error");
        return;
      }
      if (!phoneStored && !emailStored) {
        notify("Incluya al menos un canal de contacto: teléfono o correo.", "error");
        return;
      }
      const contactName = normalizeLatinUpperForDb(String(data.contactName || ""));
      const department = normalizeLatinForDb(String(data.department || ""));
      const city = normalizeLatinForDb(String(data.city || ""));
      const address = normalizeLatinUpperForDb(String(data.address || ""));
      const nextCompanies = companies.map((c) =>
        String(c.id) === companyId
          ? stampUpdatedRecord({
              ...c,
              name: nameTrim,
              taxId: nitNorm,
              nit: nitNorm,
              phone: phoneStored,
              email: emailStored,
              contactName,
              department,
              city,
              address,
              logoUrl: logoUrlResolved,
              companyKind: kind
            })
          : c
      );
      try {
        await writeAwaitServer(KEYS.companies, normalizeCompaniesForSync(nextCompanies));
      } catch (err) {
        notify(String(err?.message || "La empresa no se pudo guardar en el servidor."), "error");
        return;
      }
      notify(userMessage("companyUpdated"), "success");
      state.adminUsersUi = { ...getAdminUsersUi(), panel: "", editUserId: "", editCompanyId: "", section: "actions" };
      renderPortalView();
    });
  }

  const adminUserPermissions = document.getElementById("form-admin-user-permissions");
  if (adminUserPermissions) {
    const syncPermGridFromSelectedUser = () => {
      const sel = adminUserPermissions.querySelector("select[name='userId']");
      const grid = adminUserPermissions.querySelector(".perm-grid");
      if (!sel || !grid) return;
      const uid = String(sel.value || "").trim();
      if (!uid) {
        grid.innerHTML = buildGranularPermissionsCheckboxesHtml([]);
        return;
      }
      const u = read(KEYS.users, []).find((x) => String(x.id) === uid);
      if (!u) {
        grid.innerHTML = buildGranularPermissionsCheckboxesHtml([]);
        return;
      }
      grid.innerHTML = buildGranularPermissionsCheckboxesHtml(effectiveUserPermissions(u));
    };
    const userSel = adminUserPermissions.querySelector("select[name='userId']");
    if (userSel && !userSel.dataset.antaresPermGridWired) {
      userSel.dataset.antaresPermGridWired = "1";
      userSel.addEventListener("change", syncPermGridFromSelectedUser);
    }
    syncPermGridFromSelectedUser();

    wireFormSubmitGuard(adminUserPermissions, async (event) => {
      const form = new FormData(adminUserPermissions);
      const userId = String(form.get("userId") || "");
      if (!userId) {
        notify(userMessage("userPick"), "error");
        return;
      }
      const permissions = [...adminUserPermissions.querySelectorAll("input[name='permissions']:checked")].map(
        (input) => input.value
      );
      const users = read(KEYS.users, []);
      const target = users.find((u) => String(u.id) === userId);
      const nextUsers = users.map((user) =>
        String(user.id) === userId
          ? stampUpdatedRecord({
              ...user,
              permissions: normalizeSavedUserPermissions(
                String(user.role || target?.role || ROLES.CLIENT),
                permissions
              )
            })
          : user
      );
      try {
        await writeAwaitServer(KEYS.users, nextUsers);
      } catch (err) {
        notify(String(err?.message || userMessage("genericError")), "error");
        return;
      }
      if (state.session?.userId === userId) {
        const refreshed = read(KEYS.users, []).find((item) => String(item.id) === userId);
        if (refreshed && !hasPermission(refreshed, PERMISSIONS.USERS_MANAGE)) {
          notify(userMessage("permissionsChangedLogout"), "error");
          clearSession();
          renderPortal();
          return;
        }
        syncSessionProfileSnapshotFromCache();
        updatePortalSidebarSessionMeta();
      }
      notify(userMessage("permissionsUpdated"), "success");
      setAdminUsersUi({
        panel: "set-permissions",
        editUserId: "",
        editCompanyId: "",
        permissionsMinimized: true,
        editMinimized: true
      });
      renderPortalView();
    });
  }

  const adminUserEdit = document.getElementById("form-admin-user-edit");
  if (adminUserEdit) {
    attachDepartmentCitySelects(adminUserEdit, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']",
      initialDepartment: String(adminUserEdit.querySelector("select[name='department']")?.value || ""),
      initialCity: String(adminUserEdit.querySelector("select[name='city']")?.value || "")
    });
    const adminEditAvatarInput = document.getElementById("admin-edit-user-avatar-input");
    const adminEditAvatarLabel = document.getElementById("admin-edit-user-avatar-label");
    bindEmployeeAvatarFilePreview(adminEditAvatarInput, adminEditAvatarLabel);
    wireAdminUserFormPermGridOnRoleChange(adminUserEdit);
    wireFormSubmitGuard(adminUserEdit, async (event) => {
      const data = readFormEntriesNormalized(adminUserEdit);
      const userId = String(data.id || "");
      if (!userId) return;
      const users = read(KEYS.users, []);
      const existing = users.find((u) => String(u.id) === userId);
      if (!existing) {
        notify(userMessage("userNotFound"), "error");
        return;
      }
      const duplicated = users.some((u) => u.id !== userId && normalizeEmail(u.email) === normalizeEmail(data.email));
      if (duplicated) {
        notify(userMessage("userEmailDuplicate"), "error");
        return;
      }
      const docValidation = validateColombianDocument(data.documentType, data.taxId);
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return;
      }
      data.taxId = docValidation.normalized;
      const company = getCompanyById(String(data.companyId || ""));
      if (!company) {
        notify(userMessage("userSelectCompany"), "error");
        return;
      }
      const permissions = [...adminUserEdit.querySelectorAll("input[name='permissions']:checked")].map((input) => input.value);
      let nextPassword = existing.password;
      const nextEmail = normalizeEmail(data.email);
      const passwordPlain = String(data.password || "").trim();
      if (String(data.password || "").trim()) {
        const pp = validatePasswordPolicy(data.password);
        if (!pp.ok) {
          notify(userMessage(pp.key), "error");
          return;
        }
        nextPassword = await hashPassword(passwordPlain);
      }
      if (window.AntaresApi?.isConfigured?.()) {
        const emailChanged = nextEmail !== normalizeEmail(existing.email);
        const passwordChanged = Boolean(passwordPlain);
        if (emailChanged || passwordChanged) {
          try {
            await postPortalAuthorized("/portal/admin-user-credentials", {
              userId,
              email: emailChanged ? nextEmail : undefined,
              password: passwordChanged ? passwordPlain : undefined
            });
          } catch (err) {
            notify(String(err?.message || "No fue posible actualizar las credenciales del usuario en el servidor."), "error");
            return;
          }
        }
      }
      const fn = normalizeLatinUpperForDb(String(data.firstName ?? "").trim());
      const mn = normalizeLatinUpperForDb(String(data.middleName ?? "").trim());
      const ln = normalizeLatinUpperForDb(String(data.lastName ?? "").trim());
      const sln = normalizeLatinUpperForDb(String(data.secondLastName ?? "").trim());
      const composedFromParts = [fn, mn, ln, sln].filter(Boolean).join(" ").trim();
      const nameFromInput = normalizeLatinUpperForDb(String(data.name ?? "").trim());
      const resolvedFullName = nameFromInput || composedFromParts || normalizeLatinUpperForDb(String(existing.name ?? "").trim());
      const birthIn = String(data.birthDate ?? "").trim();
      const birthStored =
        !birthIn
          ? ""
          : /^\d{4}-\d{2}-\d{2}$/.test(birthIn.slice(0, 10))
            ? birthIn.slice(0, 10)
            : String(existing.birthDate || "").slice(0, 10) || "";
      const gRaw = String(data.gender ?? "").trim();
      const genderStored = gRaw ? normalizeLatinUpperForDb(gRaw) : "";
      const registrationKindStored = normalizeRegistrationKindForDb(data.registrationKind);
      const avatarFile = adminUserEdit.querySelector("input[name='avatarFile']")?.files?.[0] || null;
      const avatarExisting = String(data.avatarUrlExisting ?? existing.avatarUrl ?? "").trim();
      let resolvedAvatarUrl = avatarExisting;
      if (avatarFile) {
        try {
          resolvedAvatarUrl = await resolveEmployeeAvatarUrl(avatarFile, avatarExisting);
        } catch (presignErr) {
          devWarn?.("admin-user-edit-avatar-resolve", presignErr);
          notify(String(presignErr?.message || "No fue posible subir la foto. Intente de nuevo."), "error");
          return;
        }
        const trimmedAv = String(resolvedAvatarUrl || "").trim();
        if (!trimmedAv) {
          notify("No se obtuvo una imagen válida para la foto del usuario.", "error");
          return;
        }
        if (window.AntaresApi?.isConfigured?.() && isDataUrl(trimmedAv)) {
          notify(
            "No se pudo obtener una URL pública de la foto (R2). Revise la configuración del servidor o reintente.",
            "error"
          );
          return;
        }
        resolvedAvatarUrl = trimmedAv;
      }
      const nextEdited = users.map((u) =>
        String(u.id) === userId
          ? stampUpdatedRecord({
              ...u,
              name: resolvedFullName,
              firstName: fn || undefined,
              middleName: mn || undefined,
              lastName: ln || undefined,
              secondLastName: sln || undefined,
              email: nextEmail,
              password: nextPassword,
              role: String(data.role || u.role),
              documentType: String(data.documentType || u.documentType || "CC"),
              personType: normalizePersonTypeForDb(String(data.personType || u.personType || "")),
              documentIssuedAt: String(data.documentIssuedAt || u.documentIssuedAt || ""),
              birthDate: birthStored,
              gender: genderStored,
              avatarUrl: resolvedAvatarUrl,
              companyId: company.id,
              company: normalizeLatinUpperForDb(String(data.company || company.name).trim()),
              taxId: String(data.taxId || "").trim(),
              phone: normalizePortalPhoneForStorage(String(data.phone || "").trim()),
              city: normalizeLatinForDb(String(data.city || "").trim()),
              department: normalizeLatinForDb(String(data.department || u.department || "").trim()),
              address: normalizeLatinUpperForDb(String(data.address || u.address || "").trim()),
              position: normalizeLatinUpperForDb(String(data.position ?? u.position ?? "").trim()),
              workArea: normalizeLatinUpperForDb(String(data.workArea ?? u.workArea ?? "").trim()),
              registrationKind: registrationKindStored,
              profileQualityChecklist: {
                ...(u.profileQualityChecklist && typeof u.profileQualityChecklist === "object"
                  ? u.profileQualityChecklist
                  : {}),
                registrationKind: registrationKindStored
              },
              twoFactorEnabled: String(data.twoFactorEnabled || "false") === "true",
              systemJoinDate: String(data.systemJoinDate || u.systemJoinDate || ""),
              permissions: normalizeSavedUserPermissions(String(data.role || u.role), permissions)
            })
          : u
      );
      try {
        await writeAwaitServer(KEYS.users, nextEdited);
      } catch (err) {
        notify(String(err?.message || userMessage("genericError")), "error");
        return;
      }
      notify(userMessage("userUpdated"), "success");
      setAdminUsersUi({
        panel: "",
        editUserId: "",
        editCompanyId: "",
        editMinimized: true,
        permissionsMinimized: false
      });
      if (state.session?.userId === userId) {
        syncSessionProfileSnapshotFromCache();
        updatePortalSidebarSessionMeta();
      }
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='approve-registration']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanApprovePortalRegistration()) return;
      const userId = btn.dataset.id;
      if (!userId) return;
      const users = read(KEYS.users, []);
      const target = users.find((u) => String(u.id) === String(userId));
      if (!target) return;
      const isOrphan = pendingUserOrigin(target) === "supabase_auth_only";
      const companiesAll = read(KEYS.companies, []);
      const apiOn = Boolean(window.AntaresApi?.isConfigured?.());
      const companies = apiOn
        ? companiesAll.filter((c) => isUuidString(String(c.id || "")))
        : companiesAll;
      if (!companies.length) {
        if (apiOn && companiesAll.length) {
          notify(
            "Las empresas en lista no tienen id compatible con el servidor (deben ser UUID). Registre la empresa de nuevo con «Nueva empresa» o cargue datos desde el servidor.",
            "error"
          );
        } else {
          notify(userMessage("noCompaniesForUser"), "error");
        }
        return;
      }
      // El modal muestra los datos completos al admin (acción auditada);
      // las tarjetas de bandeja siguen enmascaradas para limitar exposición.
      const modalSubtitleLines = [
        `${getPortalUserDisplayName(target)} · ${target.email || "—"}`
      ];
      if (target.registrationKind) {
        modalSubtitleLines.push(`Tipo de vínculo: ${registrationKindLabel(target.registrationKind)}`);
      }
      if (target.documentType || target.taxId || target.personalDoc) {
        const docPart = [
          String(target.documentType || "").trim(),
          String(target.taxId || target.personalDoc || "").trim()
        ]
          .filter(Boolean)
          .join(" ");
        if (docPart) modalSubtitleLines.push(`Documento: ${docPart}`);
      }
      if (target.phone) modalSubtitleLines.push(`Tel.: ${String(target.phone).trim()}`);
      const initialRole = target.role || ROLES.CLIENT;
      const initialPerms = effectiveUserPermissions(target);
      const renderPermsChecklistHtml = (selected) => {
        const setSel = new Set(selected);
        const items = ALL_PERMISSIONS.map((permission) => {
          const meta = PERMISSION_META[permission] || { title: permission, desc: "" };
          const checked = setSel.has(permission) ? "checked" : "";
          return `<label class="perm-check perm-check--compact">
            <input type="checkbox" name="permissions" value="${escapeAttr(permission)}" ${checked} />
            <span><strong>${escapeHtml(meta.title)}</strong>${meta.desc ? `<small>${escapeHtml(meta.desc)}</small>` : ""}</span>
          </label>`;
        }).join("");
        return `<div class="approve-perms-shell" data-approve-perms-shell>
          <div class="approve-perms-head">
            <p class="muted approve-perms-help">Marca o desmarca lo que el usuario podrá ver/usar. Se prellena con los permisos típicos del rol seleccionado, pero puedes ajustarlos antes de aprobar.</p>
            <div class="approve-perms-actions">
              <button type="button" class="btn btn-action btn-sm" data-perm-bulk="all">${IC.check} Marcar todos</button>
              <button type="button" class="btn btn-action btn-sm" data-perm-bulk="none">${IC.x} Desmarcar todos</button>
              <button type="button" class="btn btn-action btn-sm" data-perm-bulk="role">${IC.shield} Volver al rol</button>
            </div>
          </div>
          <div class="approve-perms-grid perm-grid" data-approve-perms-grid>${items}</div>
          <p class="muted approve-perms-counter" data-approve-perms-counter></p>
        </div>`;
      };

      openEditModal({
        title: "Aprobar usuario y asociar empresa",
        subtitle: modalSubtitleLines.join(" · "),
        submitText: "Aprobar cuenta",
        fields: [
          {
            name: "companyId",
            label: "Empresa a asociar",
            type: "select",
            required: true,
            value:
              target.companyId && (!apiOn || isUuidString(String(target.companyId)))
                ? target.companyId
                : "",
            options: companies.map((c) => ({ value: c.id, label: `${c.name} (${c.taxId || "Sin NIT"})` }))
          },
          {
            name: "role",
            label: "Rol en el sistema",
            type: "select",
            required: true,
            value: initialRole,
            options: portalRoleSelectOptionsForModal(initialRole).map((r) => ({
              value: r.value,
              label: r.label
            }))
          },
          {
            name: "__permissions_block",
            type: "custom",
            label: "Permisos del usuario",
            id: "approve-permissions-block",
            html: renderPermsChecklistHtml(initialPerms)
          }
        ],
        afterMount: (form) => {
          if (!form) return;
          const roleSelect = form.querySelector("select[name='role']");
          const shell = form.querySelector("[data-approve-perms-shell]");
          if (!shell) return;
          const refreshCounter = () => {
            const counter = shell.querySelector("[data-approve-perms-counter]");
            if (!counter) return;
            const total = ALL_PERMISSIONS.length;
            const marked = shell.querySelectorAll("input[name='permissions']:checked").length;
            counter.textContent = `${marked} de ${total} permisos seleccionados`;
          };
          const repaintForRole = (role, opts = {}) => {
            const grid = shell.querySelector("[data-approve-perms-grid]");
            if (!grid) return;
            const base = defaultPermissionsForRole(role);
            const next = opts.preserveSelection
              ? base
              : base;
            const setNext = new Set(next);
            grid.innerHTML = ALL_PERMISSIONS.map((permission) => {
              const meta = PERMISSION_META[permission] || { title: permission, desc: "" };
              const checked = setNext.has(permission) ? "checked" : "";
              return `<label class="perm-check perm-check--compact">
                <input type="checkbox" name="permissions" value="${escapeAttr(permission)}" ${checked} />
                <span><strong>${escapeHtml(meta.title)}</strong>${meta.desc ? `<small>${escapeHtml(meta.desc)}</small>` : ""}</span>
              </label>`;
            }).join("");
            refreshCounter();
          };
          if (roleSelect) {
            roleSelect.addEventListener("change", () => {
              repaintForRole(roleSelect.value || ROLES.CLIENT);
            });
          }
          shell.addEventListener("click", (event) => {
            const trigger = event.target.closest("[data-perm-bulk]");
            if (!trigger) return;
            const mode = trigger.getAttribute("data-perm-bulk");
            const inputs = [...shell.querySelectorAll("input[name='permissions']")];
            if (mode === "all") inputs.forEach((i) => { i.checked = true; });
            else if (mode === "none") inputs.forEach((i) => { i.checked = false; });
            else if (mode === "role") repaintForRole(roleSelect?.value || ROLES.CLIENT);
            refreshCounter();
          });
          shell.addEventListener("change", (event) => {
            if (event.target?.name === "permissions") refreshCounter();
          });
          refreshCounter();
        },
        onSubmit: async (form, formEl) => {
          const selected = getCompanyById(String(form.companyId || ""));
          if (!selected) {
            notify(userMessage("userSelectCompany"), "error");
            return false;
          }
          const chosenRole = String(form.role || ROLES.CLIENT).trim();
          if (!Object.values(ROLES).includes(chosenRole)) {
            notify("Seleccione un rol válido.", "error");
            return false;
          }
          /**
           * Lectura de permisos manual (varios checkboxes con el mismo `name`): FormData solo trae
           * la última coincidencia, así que extraemos los marcados directamente del DOM. Si el
           * admin desmarcó todos, conservamos al menos los mínimos del rol para no dejar la cuenta
           * sin acceso a Dashboard / Mi perfil / Notificaciones.
           */
          const checkedPerms = formEl
            ? [...formEl.querySelectorAll("input[name='permissions']:checked")]
                .map((el) => el.value)
                .filter((p) => ALL_PERMISSIONS.includes(p))
            : [];
          const finalPerms = normalizeSavedUserPermissions(chosenRole, checkedPerms);
          const api = window.AntaresApi;
          if (api?.isConfigured?.()) {
            try {
              await api.postJson("/portal/approve-pending-user", {
                userId: String(target.id),
                companyId: String(selected.id),
                role: chosenRole,
                permissions: finalPerms
              });
              /**
               * Proyección local alineada al servidor: si /portal/bootstrap falla, antes quedaba el usuario
               * como pendiente hasta un volcado exitoso (y tras F5 seguía la cola mal).
               */
              portalPatchUsersCacheWithoutSyncKey(() => {
                write(
                  KEYS.users,
                  read(KEYS.users, []).map((u) =>
                    String(u.id) === String(target.id)
                      ? {
                          ...u,
                          accountStatus: ACCOUNT_STATUS.APROBADO,
                          companyId: selected.id,
                          company: selected.name,
                          role: chosenRole,
                          permissions: finalPerms,
                          source: "portal_db"
                        }
                      : u
                  )
                );
              });
              await portalRefreshBootstrapThenPendingRegistrations();
            } catch (err) {
              notify(String(err?.message || userMessage("registerServerError")), "error");
              return false;
            }
          } else {
            write(
              KEYS.users,
              read(KEYS.users, []).map((u) =>
                String(u.id) === String(userId)
                  ? {
                      ...u,
                      accountStatus: ACCOUNT_STATUS.APROBADO,
                      companyId: selected.id,
                      company: selected.name,
                      role: chosenRole,
                      permissions: finalPerms
                    }
                  : u
              )
            );
          }
          saveNotification({
            userId: target.id,
            title: "Cuenta aprobada",
            body: `Su cuenta ha sido aprobada con el rol asignado y asociada a ${selected.name}. Revise su correo para definir la contraseña y entrar al portal.`
          });
          sendEmail({
            to: target.email,
            subject: "Cuenta aprobada - Antares Portal",
            body: `Hola ${target.name}, su cuenta fue aprobada y asociada a ${selected.name}. Le hemos enviado un correo con el enlace para definir su contraseña e iniciar sesión.`
          });
          /**
           * Correo de activación real. Al aprobar reutilizamos el flujo de recuperación de contraseña
           * (POST /auth/password-recovery/request), que en Supabase manda un email con un enlace
           * único. Así el usuario recibe la activación aunque su contraseña original ya esté en BD.
           */
          if (api?.postJsonPublic && target?.email) {
            try {
              const redirectTo = buildSupabasePasswordRecoveryRedirectUrl();
              await api.postJsonPublic("/auth/password-recovery/request", {
                email: String(target.email).trim(),
                redirectTo
              });
            } catch (err) {
              devWarn("approve-registration: password-recovery email no enviado.", err?.message || err);
            }
          }
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(target.id);
          notify(userMessage("accountApproved", target.name), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='reject-registration']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanApprovePortalRegistration()) return;
      const userId = btn.dataset.id;
      if (!userId) return;
      openEditModal({
        title: "Rechazar registro",
        subtitle: "Ingresa motivo de rechazo",
        submitText: "Rechazar",
        fields: [{ name: "reason", label: "Motivo", value: "", required: true }],
        onSubmit: async (form) => {
          const reason = String(form.reason || "").trim();
          if (!reason) return false;
          const users = read(KEYS.users, []);
          const target = users.find((u) => String(u.id) === String(userId));
          if (!target) return false;
          const api = window.AntaresApi;
          if (api?.isConfigured?.()) {
            try {
              await api.postJson("/portal/admin-user-status", {
                userId: String(target.id),
                status: "rechazado",
                reason
              });
              portalPatchUsersCacheWithoutSyncKey(() => {
                write(
                  KEYS.users,
                  read(KEYS.users, []).map((u) =>
                    String(u.id) === String(target.id)
                      ? { ...u, accountStatus: ACCOUNT_STATUS.RECHAZADO, rejectionReason: reason }
                      : u
                  )
                );
              });
              await portalRefreshBootstrapThenPendingRegistrations();
            } catch (err) {
              notify(String(err?.message || "No se pudo rechazar en el servidor."), "error");
              return false;
            }
          } else {
            write(
              KEYS.users,
              users.map((u) =>
                String(u.id) === String(userId) ? { ...u, accountStatus: ACCOUNT_STATUS.RECHAZADO, rejectionReason: reason } : u
              )
            );
          }
          saveNotification({
            userId: target.id,
            title: "Registro rechazado",
            body: `Su solicitud de registro fue rechazada. Motivo: ${reason}`
          });
          sendEmail({
            to: target.email,
            subject: "Registro rechazado - Antares Portal",
            body: `Hola ${target.name}, su solicitud de registro fue rechazada. Motivo: ${reason}. Contacte a soporte para más información.`
          });
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(target.id);
          notify(userMessage("accountRejected", target.name), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const userId = btn.dataset.id;
      if (!userId) return;
      if (state.session?.userId === userId) {
        notify(userMessage("userSelfDelete"), "error");
        return;
      }
      openConfirmReasonModal({
        title: "Eliminar usuario",
        message: "Esta acción eliminará el usuario de forma permanente. Indique el motivo; quedará registrado en los correos de notificación.",
        confirmText: "Eliminar",
        onConfirm: async (motivo) => {
          try {
            await postPortalAuthorized("/portal/admin-user-delete", { userId, motivo });
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar el usuario."), "error");
            return;
          }
          const snapshotUser = read(KEYS.users, []).find((user) => String(user.id) === String(userId));
          const ok = await removeFromPortalListAwaitServer(KEYS.users, userId, { notifyOnFailure: false });
          if (!ok) {
            notify("El usuario se eliminó en el servidor, pero no se pudo actualizar la vista local.", "error");
            if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
            renderPortalView();
            return;
          }
          if (snapshotUser) {
            appendModuleAuditLog({
              action: "delete",
              moduleId: "users",
              moduleLabel: "Usuarios y permisos",
              entityId: String(snapshotUser.id || ""),
              entityLabel: getPortalUserDisplayName(snapshotUser) || String(snapshotUser.email || "Usuario"),
              summary: `${formatPortalRoleLabel(snapshotUser.role)} · ${String(snapshotUser.email || "Sin correo")}`
            });
          }
          notify(userMessage("userDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-user-active']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = String(btn.dataset.id || "");
      if (!userId) return;
      const users = read(KEYS.users, []);
      const target = users.find((u) => String(u.id) === String(userId));
      if (!target) return;
      const nextStatus = target.accountStatus === ACCOUNT_STATUS.RECHAZADO
        ? ACCOUNT_STATUS.APROBADO
        : ACCOUNT_STATUS.RECHAZADO;
      const nextLabel = nextStatus === ACCOUNT_STATUS.RECHAZADO ? "desactivar" : "activar";
      const applyStatusChange = async (reason) => {
        const api = window.AntaresApi;
        if (api?.isConfigured?.() && typeof api.postJson === "function") {
          try {
            const payload = { userId, status: nextStatus };
            if (reason) payload.reason = reason;
            await api.postJson("/portal/admin-user-status", payload);
          } catch (err) {
            notify(String(err?.message || "No fue posible actualizar el estado de la cuenta."), "error");
            return;
          }
        }
        portalPatchUsersCacheWithoutSyncKey(() => {
          write(
            KEYS.users,
            read(KEYS.users, []).map((u) =>
              String(u.id) === String(userId)
                ? stampUpdatedRecord({
                    ...u,
                    accountStatus: nextStatus,
                    ...(reason ? { rejectionReason: reason } : {})
                  })
                : u
            )
          );
        });
        try {
          await writeAwaitServer(KEYS.users, read(KEYS.users, []));
        } catch (_e) {
          return;
        }
        notify(`Usuario ${nextStatus === ACCOUNT_STATUS.RECHAZADO ? "desactivado" : "activado"} correctamente.`, "success");
        renderPortalView();
      };
      if (nextStatus === ACCOUNT_STATUS.RECHAZADO) {
        openConfirmReasonModal({
          title: "Desactivar usuario",
          message: `Se va a desactivar la cuenta de ${target.name}. Indique el motivo; quedará en el correo al usuario y en la alerta administrativa.`,
          confirmText: "Desactivar",
          onConfirm: async (motivo) => {
            await applyStatusChange(motivo);
          }
        });
        return;
      }
      openConfirmModal({
        title: "Activar usuario",
        message: `Se va a activar la cuenta de ${target.name}.`,
        confirmText: "Activar",
        onConfirm: async () => {
          await applyStatusChange();
        }
      });
    });
  });

  /* Bandeja de notificaciones (notif-read, toggles, eliminar) → `modules/app/notificaciones.js` (__portalModuleAfterRender.notifications). */

  /* Calendario transporte: filtros, navegación y cal-event → `modules/app/calendario.js` (__portalModuleAfterRender["transport-calendar"]). */

  /* Detalle solicitud: installRequestDetailDelegation() */

  nodes.viewRoot.querySelectorAll("[data-action='edit-request']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const req = findTransportRequestById(btn.dataset.id);
      if (!req) return;
      const actor = currentUser();
      if (!canPortalUserEditTransportRequest(req, actor)) {
        notify(
          req.trip ? userMessage("requestEditWithTripDenied") : "No tiene permiso para editar esta solicitud en su estado actual.",
          "error"
        );
        return;
      }
      const editingWithTrip = Boolean(req.trip);
      const tripJustificationFields = editingWithTrip
        ? [
            {
              type: "section",
              id: "edit-req-justify",
              title: "Justificación de modificación",
              hint: "Obligatoria: la solicitud ya tiene un viaje asignado. Quedará en el historial.",
              full: true
            },
            {
              name: "editJustification",
              label: "Motivo de la modificación",
              type: "textarea",
              value: "",
              required: true,
              rows: 4,
              full: true,
              placeholder: "Ej.: cambio de ventana horaria acordado con el cliente, corrección de dirección en sitio..."
            }
          ]
        : [];
      /** ISO desde API (`pickupAt`/`etaDelivery`), caché legacy (fecha+hora) o ventanas del viaje (`trip`). */
      const [pickupDateInit, pickupTimeInit] = String(toInputDate(requestPickupIsoForEdit(req)) || "").split("T");
      const [deliveryDateInit, deliveryTimeInit] = String(toInputDate(requestDeliveryIsoForEdit(req)) || "").split("T");
      openEditModal({
        title: "Editar solicitud de viaje",
        subtitle: `${req.requestNumber || req.id} · ${req.clientName || ""}${editingWithTrip ? ` · Viaje ${req.trip.tripNumber || ""}` : ""}`,
        submitText: "Guardar cambios",
        extraModalCardClass: "modal-card-edit--request-full",
        fields: [
          ...tripJustificationFields,
          { type: "section", id: "edit-req-route", title: "Origen y destino", hint: "Ciudades y direcciones del servicio." },
          {
            name: "originDepartment",
            label: "Departamento origen",
            type: "select",
            value: req.originDepartment || "",
            required: true,
            options: [{ value: "", label: "Seleccione..." }].concat(
              Object.keys(COLOMBIA_LOCATIONS).map((d) => ({ value: d, label: d }))
            )
          },
          {
            name: "originCity",
            label: "Ciudad origen",
            type: "select",
            value: req.originCity || "",
            required: true,
            options: [{ value: "", label: "Seleccione..." }].concat(
              (COLOMBIA_LOCATIONS[req.originDepartment || ""] || []).map((c) => ({ value: c, label: c }))
            )
          },
          { name: "originAddress", label: "Dirección origen", value: req.originAddress || "", full: true, required: true },
          {
            name: "destinationDepartment",
            label: "Departamento destino",
            type: "select",
            value: req.destinationDepartment || "",
            required: true,
            options: [{ value: "", label: "Seleccione..." }].concat(
              Object.keys(COLOMBIA_LOCATIONS).map((d) => ({ value: d, label: d }))
            )
          },
          {
            name: "destinationCity",
            label: "Ciudad destino",
            type: "select",
            value: req.destinationCity || "",
            required: true,
            options: [{ value: "", label: "Seleccione..." }].concat(
              (COLOMBIA_LOCATIONS[req.destinationDepartment || ""] || []).map((c) => ({ value: c, label: c }))
            )
          },
          { name: "destinationAddress", label: "Dirección destino", value: req.destinationAddress || "", full: true, required: true },
          { type: "section", id: "edit-req-window", title: "Ventanas de servicio", hint: "Fechas y horas estimadas de recogida y entrega.", gridClass: "datetime-group" },
          { name: "pickupDate", label: "Fecha de recogida", type: "date", value: pickupDateInit || "", required: true, lang: "es-CO" },
          { name: "pickupTime", label: "Hora de recogida", type: "time", value: pickupTimeInit || "", required: true },
          { name: "deliveryDate", label: "Fecha de entrega", type: "date", value: deliveryDateInit || "", required: true, lang: "es-CO" },
          { name: "deliveryTime", label: "Hora de entrega", type: "time", value: deliveryTimeInit || "", required: true },
          { type: "section", id: "edit-req-cargo", title: "Carga y servicio", hint: "Características del envío." },
          {
            name: "serviceType",
            label: "Modo de transporte",
            type: "select",
            value: normalizeRequestTransportMode(req.serviceType),
            required: true,
            options: [
              { value: "", label: "Seleccione..." },
              { value: "Transporte nacional", label: "Transporte nacional" },
              { value: "Transporte entre sedes del cliente", label: "Transporte entre sedes del cliente" }
            ]
          },
          { name: "cargoDescription", label: "Descripción de carga", value: req.cargoDescription || "", required: true, full: true },
          {
            name: "requiresThermoking",
            label: "Refrigeración Termoking",
            type: "select",
            value: requestRequiresTermoking(req) ? "yes" : "no",
            required: true,
            options: [
              { value: "yes", label: "Sí, requiere equipo Termoking" },
              { value: "no", label: "No, carga seca" }
            ]
          },
          ...buildRequestTruckTypeEditFieldRows(req),
          { name: "tripValue", label: "Valor del viaje (COP)", type: "number", min: 0, value: parseNum(req.tripValue || req.insuredValue || 0), required: false },
          { name: "insuredValue", label: "Valor asegurado (COP)", type: "number", min: 0, value: parseNum(req.insuredValue || 0), required: false },
          { name: "distanceKm", label: "Distancia estimada (km)", type: "number", min: 0, step: 0.01, value: parseNum(req.distanceKm || 0), required: false },
          { type: "section", id: "edit-req-contact", title: "Contacto en sitio", hint: "Persona que recibe / entrega." },
          { name: "siteContactName", label: "Nombre de contacto", value: req.siteContactName || req.contactName || "", required: true },
          {
            name: "siteContactPhone",
            label: "Teléfono de contacto",
            value:
              formatPortalPhoneForDisplay(req.siteContactPhone || req.contactPhone || "") ||
              req.siteContactPhone ||
              req.contactPhone ||
              "",
            required: true
          },
          { name: "notes", label: "Observaciones", type: "textarea", value: req.notes || req.observations || "", rows: 3 }
        ],
        afterMount: (formEl) => {
          /**
           * Departamento ↔ ciudad encadenados: al cambiar departamento, las
           * ciudades se repueblan. Mismo patrón usado en el form de creación.
           */
          attachDepartmentCitySelects(formEl, {
            departmentSelector: "select[name='originDepartment']",
            citySelector: "select[name='originCity']",
            initialDepartment: req.originDepartment,
            initialCity: req.originCity
          });
          attachDepartmentCitySelects(formEl, {
            departmentSelector: "select[name='destinationDepartment']",
            citySelector: "select[name='destinationCity']",
            initialDepartment: req.destinationDepartment,
            initialCity: req.destinationCity
          });
          attachRequestTruckTypeFields(formEl);
        },
        onSubmit: async (form) => {
          let editJustification = "";
          if (editingWithTrip) {
            editJustification = String(form.editJustification || "").trim();
            if (editJustification.length < REQUEST_EDIT_JUSTIFICATION_MIN_LEN) {
              notify(userMessage("requestEditJustificationRequired"), "error");
              return false;
            }
            if (!canEditTransportRequestWithAssignedTrip(req, actor)) {
              notify(userMessage("requestEditWithTripDenied"), "error");
              return false;
            }
          }
          const modo = String(form.serviceType || "").trim();
          if (!TRANSPORT_MODOS_SERVICIO.has(modo)) {
            notify("Seleccione un modo de transporte válido.", "error");
            return false;
          }
          const pickupDateValue = String(form.pickupDate || "").trim();
          const pickupTimeValue = String(form.pickupTime || "").trim();
          const deliveryDateValue = String(form.deliveryDate || "").trim();
          const deliveryTimeValue = String(form.deliveryTime || "").trim();
          if (!pickupDateValue || !pickupTimeValue || !deliveryDateValue || !deliveryTimeValue) {
            notify(userMessage("requestDatetimeMissing"), "error");
            return false;
          }
          const pickupAtBuilt = buildColombiaOffsetDateTime(pickupDateValue, pickupTimeValue);
          const etaDeliveryBuilt = buildColombiaOffsetDateTime(deliveryDateValue, deliveryTimeValue);
          if (!pickupAtBuilt || !etaDeliveryBuilt) {
            notify(userMessage("requestDatetimeMissing"), "error");
            return false;
          }
          const pickupDateTime = new Date(pickupAtBuilt);
          const deliveryDateTime = new Date(etaDeliveryBuilt);
          if (deliveryDateTime.getTime() <= pickupDateTime.getTime()) {
            notify(userMessage("requestDeliveryAfterPickup"), "error");
            return false;
          }
          const pickupAtIso = pickupDateTime.toISOString();
          const etaDeliveryIso = deliveryDateTime.toISOString();
          const refrigeracionTermoking = form.requiresThermoking === "yes";
          const requiredTruckType = normalizeRequestRequiredTruckType(form.requiredTruckType);
          if (!requiredTruckType) {
            notify("Seleccione el tipo de camión requerido.", "error");
            return false;
          }
          let fuellesVal = null;
          let weightKgVal = 0;
          if (requestRequiredTruckTypeShowsFuelles(requiredTruckType)) {
            const f = Math.floor(Number(String(form.fuelles ?? "").trim()));
            if (!Number.isFinite(f) || String(form.fuelles ?? "").trim() === "" || f < 0) {
              notify("Indique la cantidad de fuelles.", "error");
              return false;
            }
            fuellesVal = f;
          } else if (requestRequiredTruckTypeShowsTractomulaKg(requiredTruckType)) {
            weightKgVal = Math.max(0, parseNum(form.weightKg));
            if (weightKgVal <= 0) {
              notify("Indique el peso en kg para tractomula.", "error");
              return false;
            }
          }
          const updates = {
            originDepartment: String(form.originDepartment || "").trim(),
            originCity: String(form.originCity || "").trim(),
            originAddress: String(form.originAddress || "").trim(),
            destinationDepartment: String(form.destinationDepartment || "").trim(),
            destinationCity: String(form.destinationCity || "").trim(),
            destinationAddress: String(form.destinationAddress || "").trim(),
            pickupDate: pickupDateValue,
            pickupTime: pickupTimeValue,
            deliveryDate: deliveryDateValue,
            deliveryTime: deliveryTimeValue,
            pickupAt: pickupAtIso,
            etaDelivery: etaDeliveryIso,
            cargoDescription: String(form.cargoDescription || "").trim(),
            serviceType: modo,
            refrigeracionTermoking,
            vehicleType: requiredTruckType,
            fuelles: requestRequiredTruckTypeShowsFuelles(requiredTruckType) ? fuellesVal : null,
            boxes: 0,
            boxesCount: 0,
            weightKg: requestRequiredTruckTypeShowsTractomulaKg(requiredTruckType) ? weightKgVal : 0,
            tripValue: parseNum(form.tripValue),
            insuredValue: Math.max(0, parseNum(form.insuredValue)) || null,
            distanceKm: Math.max(0, parseNum(form.distanceKm)) || null,
            siteContactName: String(form.siteContactName || "").trim(),
            siteContactPhone: String(form.siteContactPhone || "").trim(),
            contactName: String(form.siteContactName || "").trim(),
            contactPhone: String(form.siteContactPhone || "").trim(),
            notes: String(form.notes || "").trim(),
            observations: String(form.notes || "").trim(),
            updatedAt: nowIso(),
            updatedBy: actor?.name || (actor?.role === ROLES.CLIENT ? "Cliente" : "Usuario")
          };
          const changesSummary = summarizeTransportRequestEditChanges(req, { ...req, ...updates });
          const modificationLog = editingWithTrip
            ? recordTransportRequestModification(req, {
                justification: editJustification,
                actor,
                changesSummary
              })
            : req.modificationLog;
          const mergedRow = {
            ...req,
            ...updates,
            ...(modificationLog ? { modificationLog } : {})
          };
          if (mergedRow.trip) {
            mergedRow.trip = {
              ...mergedRow.trip,
              etaPickup: pickupAtIso,
              etaDelivery: etaDeliveryIso,
              updatedAt: nowIso()
            };
          }
          const allRequests = reqRead();
          const updated = allRequests.map((r) => (r.id === req.id ? mergedRow : r));
          try {
            await reqWriteAwait(updated);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar los cambios en el servidor."), "error");
            return false;
          }
          recalculateResourceAvailability();
          notify(editingWithTrip ? userMessage("requestEditWithTripLogged") : "Solicitud actualizada correctamente.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cancel-request']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void runWithBusyButton(btn, async () => {
        const requests = reqRead();
        const req = requests.find((r) => r.id === btn.dataset.id);
        if (!req) return;
        const actor = currentUser();
        if (!actor || req.trip || !canPortalUserEditTransportRequest(req, actor)) {
          notify("No puede cancelar esta solicitud en el estado actual o ya tiene viaje asignado.", "error");
          return;
        }
        const updated = requests.map((r) =>
          r.id === req.id
            ? {
                ...r,
                status: STATUS.CANCELADA,
                updatedAt: nowIso(),
                updatedBy: actor?.name || (actor.role === ROLES.CLIENT ? "Cliente" : "Usuario")
              }
            : r
        );
        try {
          await reqWriteAwait(updated);
        } catch (err) {
          notify(String(err?.message || "No fue posible cancelar la solicitud en el servidor."), "error");
          return;
        }
        notify("Solicitud cancelada.", "success");
        renderPortalView();
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approve']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanApproveTransport()) return;
      const actor = currentUser();
      const requestId = String(btn.dataset.id || "");
      const request = reqRead().find((item) => item.id === requestId);
      if (!request) return;
      const needsTermoking = requestRequiresTermoking(request);
      void refreshTransportScheduleBusyFromApi(request, requestId);
      const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
      const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
      const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
      const driverCandidates = getDriverCandidatesForRequest(request, requestId);
      const tripRateUi = buildTripRateModalFields(request, { required: false });
      openEditModal({
        title: "Aprobar solicitud de viaje",
        subtitle: "",
        introHtml: buildTripApprovalHeroHtml(request, needsTermoking, "table"),
          extraModalCardClass: "modal-card-edit--approve-trip modal-card-edit--assign-revamp",
        submitText: "Confirmar aprobación",
        afterMount: (formEl) => {
          if (typeof tripRateUi.afterMount === "function") tripRateUi.afterMount(formEl);
          wireTripApprovalModeFields(formEl);
          wireTripAssignmentScheduleBusyRefresh(formEl, request, requestId, needsTermoking);
        },
        fields: [
          {
            type: "section",
            id: "approve-decision",
            title: "1. Modo de aprobación",
            hint: "Apruebe ahora o complete la asignación en este paso."
          },
          {
            name: "mode",
            label: "Seleccione una opción",
            type: "select",
            required: true,
            full: true,
            value: "pending",
            options: [
              {
                value: "pending",
                label: "Solo aprobar — queda pendiente asignar camión y conductor"
              },
              {
                value: "assign_now",
                label: "Aprobar y asignar ahora — elija vehículo, conductor y precio abajo"
              }
            ]
          },
          {
            type: "section",
            id: "approve-resources",
            title: "2. Vehículo y conductor",
            hint: needsTermoking
              ? "Se muestran opciones compatibles con tipo de camión y Termoking."
              : "Se muestran opciones compatibles con el tipo de camión solicitado."
          },
          {
            name: "vehicleId",
            labelHtml: `${IC.truck}<span>Vehículo</span>`,
            type: "select",
            searchable: true,
            searchablePlaceholder: "Buscar por placa, tipo o capacidad…",
            required: false,
            full: true,
            options: [
              {
                value: "",
                label: vehicleCandidates.length
                  ? "Sin asignar por ahora"
                  : needsTermoking
                    ? "No hay vehículos con Termoking para capacidad, documentos u horario"
                    : "No hay vehículos para capacidad, documentos u horario"
              },
              ...vehicleCandidates.map((vehicle) => ({
                value: vehicle.id,
                disabled: Boolean(vehicle.isBusy || vehicle.isUnavailable || vehicle.hasExpiredDocs || vehicle.wrongTruckType),
                label: tripAssignmentVehicleOptionLabel(vehicle, {
                  needsTermoking,
                  isBusy: vehicle.isBusy,
                  isUnavailable: vehicle.isUnavailable,
                  hasExpiredDocs: vehicle.hasExpiredDocs,
                  wrongTruckType: vehicle.wrongTruckType,
                  requestTruckType: normalizeRequestRequiredTruckType(request?.vehicleType)
                })
              }))
            ]
          },
          {
            name: "driverId",
            labelHtml: `${IC.user}<span>Conductor</span>`,
            type: "select",
            searchable: true,
            searchablePlaceholder: "Buscar por nombre, documento o teléfono…",
            required: false,
            full: true,
            options: [
              { value: "", label: driverCandidates.length ? "Sin asignar por ahora" : "No hay conductores registrados" },
              ...driverCandidates.map((driver) => ({
                value: driver.id,
                disabled: Boolean(driver.isBusy || driver.isUnavailable || driver.hasExpiredDocs),
                label: tripAssignmentDriverOptionLabel(driver, {
                  isBusy: driver.isBusy,
                  isUnavailable: driver.isUnavailable,
                  hasExpiredDocs: driver.hasExpiredDocs
                })
              }))
            ]
          },
          {
            type: "section",
            id: "approve-price",
            title: "3. Precio del viaje",
            hint: "Solo es obligatorio si asigna vehículo y conductor."
          },
          ...tripRateUi.fields.map((tf) => ({ ...tf, full: true }))
        ],
        onSubmit: async (form) => {
          const selectedMode = String(form.mode || "pending");
          const vehicleId = String(form.vehicleId || "").trim();
          const driverId = String(form.driverId || "").trim();
          const tripValue = parseNum(form.tripValue);
          const mode = vehicleId && driverId ? "assign_now" : selectedMode;
          const schedPickup = requestSchedulingPickupIso(request);
          const schedDelivery = requestSchedulingDeliveryIso(request);
          if (mode === "assign_now" && !isRequestPickupSameDayOrFuture(request)) {
            notify(userMessage("assignPastRequestDate"), "error");
            return false;
          }
          if (mode === "assign_now" && (!vehicleId || !driverId)) {
            notify(userMessage("assignSelectResources"), "error");
            return false;
          }
          if (mode === "assign_now" && tripValue <= 0) {
            notify(userMessage("assignPriceRequired"), "error");
            return false;
          }
          if (mode === "assign_now") {
            await refreshTransportScheduleBusyFromApi(request, requestId);
            if (
              notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "vehículo", (t) =>
                String(t.vehicleId || "").trim() === vehicleId
              )
            ) {
              return false;
            }
            if (
              notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "conductor", (t) =>
                String(t.driverId || "").trim() === driverId
              )
            ) {
              return false;
            }
          }
          if (mode === "assign_now" && (!compatibleVehicles.some((v) => v.id === vehicleId) || !compatibleDrivers.some((d) => d.id === driverId))) {
            notify(userMessage("assignResourcesBusy"), "error");
            return false;
          }
          const ok = mode === "assign_now"
            ? approveRequest(requestId, actor?.name || "Administrador", false, vehicleId, driverId, tripValue, {
                allowApproveAndAssign: true
              })
            : approveRequest(requestId, actor?.name || "Administrador", true);
          if (!ok) return false;
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(request.clientUserId);
          notify(
            mode === "assign_now"
              ? userMessage("requestApprovedAssigned")
              : userMessage("requestApprovedPending"),
            "success"
          );
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='generate-report']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const reportId = String(btn.dataset.report || "");
      const format = String(btn.dataset.format || "preview");
      const actor = currentUser();
      const exportFilters = normalizeReportsExportFilters(state.reportsUi?.exportFilters || { period: state.reportsUi?.period || "90d" });
      if (!canAccessReport(actor, reportId)) {
        notify(userMessage("reportNoPermission"), "error");
        return;
      }
      if (reportId === "payroll_summary" && portalCanRefreshFromApi()) {
        const pf = normalizeReportsExportFilters(state.reportsUi?.exportFilters || { period: state.reportsUi?.period || "90d" });
        const payrollRunsPre = reportsFilterItemsByPeriod(read(KEYS.payrollRuns, []), pf.period, (run) =>
          run.paidAt || run.createdAt || `${run.month || ""}-01`
        );
        for (const run of payrollRunsPre) {
          if (run.payrollRunHeavyOmitted === true) {
            await ensurePayrollRunHeavyJsonLoaded(String(run.id || ""));
          }
        }
      }
      const report = buildReportDataset(reportId, actor, exportFilters);
      try {
        if (format === "preview") {
          openReportPreviewModal(report);
          notify(userMessage("reportPreviewReady"), "success");
          return;
        }
        await exportCatalogReport(report, format === "excel" ? "excel" : "pdf");
        notify(userMessage(format === "excel" ? "reportExcelExported" : "reportPdfOk"), "success");
      } catch (_e) {
        notify(userMessage("reportExportError"), "error");
      }
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='reject']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanApproveTransport()) return;
      openEditModal({
        title: "Rechazar solicitud",
        subtitle: "Indica motivo para trazabilidad",
        submitText: "Rechazar solicitud",
        fields: [{ name: "reason", label: "Motivo", value: "", required: true }],
        onSubmit: async (form) => {
          const reason = String(form.reason || "").trim();
          if (!reason) return false;
          try {
            await rejectRequest(btn.dataset.id, reason, currentUser().name);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el rechazo en el servidor."), "error");
            return false;
          }
          const rejectedReq = reqRead().find((r) => r.id === btn.dataset.id);
          suppressSelfInboxPollToastIfRecipientIsCurrentUser(rejectedReq?.clientUserId);
          notify(userMessage("requestRejected"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-admin']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const req = findTransportRequestById(btn.dataset.id);
      if (!req) return;
      const actor = currentUser();
      if (!canPortalUserEditTransportRequest(req, actor)) {
        notify(
          req.trip ? userMessage("requestEditWithTripDenied") : "No tiene permiso para editar esta solicitud.",
          "error"
        );
        return;
      }
      const editingWithTrip = Boolean(req.trip);
      const [pickupDate, pickupTime] = String(toInputDate(requestPickupIsoForEdit(req)) || "").split("T");
      const [deliveryDate, deliveryTime] = String(toInputDate(requestDeliveryIsoForEdit(req)) || "").split("T");
      const tripJustificationFields = editingWithTrip
        ? [
            {
              type: "section",
              id: "admin-req-justify",
              title: "Justificación de modificación",
              hint: "Obligatoria con viaje asignado.",
              full: true
            },
            {
              name: "editJustification",
              label: "Motivo de la modificación",
              type: "textarea",
              value: "",
              required: true,
              rows: 3,
              full: true
            }
          ]
        : [];
      openEditModal({
        title: "Editar solicitud",
        subtitle: `${req.requestNumber || req.id}${editingWithTrip ? ` · Viaje ${req.trip.tripNumber || ""}` : ""}`,
        submitText: "Actualizar solicitud",
        fields: [
          ...tripJustificationFields,
          {
            type: "section",
            id: "admin-req-window",
            title: "Ventanas de servicio",
            hint: "Fechas y horas de recogida y entrega.",
            gridClass: "datetime-group"
          },
          { name: "pickupDate", label: "Fecha de recogida", type: "date", value: pickupDate, required: true, lang: "es-CO" },
          { name: "pickupTime", label: "Hora de recogida", type: "time", value: pickupTime, required: true },
          { name: "deliveryDate", label: "Fecha de entrega", type: "date", value: deliveryDate, required: true, lang: "es-CO" },
          { name: "deliveryTime", label: "Hora de entrega", type: "time", value: deliveryTime, required: true }
        ],
        onSubmit: async (form) => {
          let editJustification = "";
          if (editingWithTrip) {
            editJustification = String(form.editJustification || "").trim();
            if (editJustification.length < REQUEST_EDIT_JUSTIFICATION_MIN_LEN) {
              notify(userMessage("requestEditJustificationRequired"), "error");
              return false;
            }
          }
          const pickupDateValue = String(form.pickupDate || "").trim();
          const pickupTimeValue = String(form.pickupTime || "").trim();
          const deliveryDateValue = String(form.deliveryDate || "").trim();
          const deliveryTimeValue = String(form.deliveryTime || "").trim();
          const pickupAtBuilt = buildColombiaOffsetDateTime(pickupDateValue, pickupTimeValue);
          const etaDeliveryBuilt = buildColombiaOffsetDateTime(deliveryDateValue, deliveryTimeValue);
          if (!pickupAtBuilt || !etaDeliveryBuilt) {
            notify(userMessage("requestDatetimeMissing"), "error");
            return false;
          }
          const pickupMs = new Date(pickupAtBuilt).getTime();
          const deliveryMs = new Date(etaDeliveryBuilt).getTime();
          if (deliveryMs <= pickupMs) {
            notify(userMessage("requestScheduleInvalid"), "error");
            return false;
          }
          const pickupAtIso = new Date(pickupAtBuilt).toISOString();
          const etaDeliveryIso = new Date(etaDeliveryBuilt).toISOString();
          const scheduleUpdates = {
            pickupAt: pickupAtIso,
            etaDelivery: etaDeliveryIso,
            pickupDate: pickupDateValue,
            pickupTime: pickupTimeValue,
            deliveryDate: deliveryDateValue,
            deliveryTime: deliveryTimeValue,
            updatedAt: nowIso(),
            updatedBy: actor?.name || "Administrador"
          };
          const changesSummary = summarizeTransportRequestEditChanges(req, { ...req, ...scheduleUpdates });
          const modificationLog = editingWithTrip
            ? recordTransportRequestModification(req, {
                justification: editJustification,
                actor,
                changesSummary
              })
            : req.modificationLog;
          const mergedRow = {
            ...req,
            ...scheduleUpdates,
            ...(modificationLog ? { modificationLog } : {}),
            trip: req.trip
              ? { ...req.trip, etaPickup: pickupAtIso, etaDelivery: etaDeliveryIso, updatedAt: nowIso() }
              : req.trip
          };
          try {
            await reqWriteAwait(reqRead().map((r) => (r.id === req.id ? mergedRow : r)));
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar los cambios en el servidor."), "error");
            return false;
          }
          notify(editingWithTrip ? userMessage("requestEditWithTripLogged") : userMessage("requestUpdated"), "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-admin']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const requestId = String(btn.dataset.id || "");
      if (!requestId) return;
      const reqSnapshot = reqRead().find((r) => String(r.id) === requestId);
      if (reqSnapshot?.trip) {
        notify(
          "Esta solicitud tiene un viaje asignado. Elimine primero el viaje en Transporte · Viajes (con motivo registrado) y luego podrá eliminar la solicitud.",
          "error"
        );
        return;
      }
      openConfirmReasonModal({
        title: "Eliminar solicitud",
        message:
          "Se eliminará la solicitud seleccionada del sistema. Indique el motivo; quedará guardado en el historial de eliminados.",
        confirmText: "Eliminar",
        onConfirm: async (motivo) => {
          try {
            await postPortalAuthorized("/portal/admin-request-delete", { requestId, motivo });
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar la solicitud en el servidor."), "error");
            return;
          }
          await reqWriteAwait(reqRead().filter((r) => String(r.id) !== requestId));
          recalculateResourceAvailability();
          try {
            await applyPortalBootstrapFromApi();
          } catch (_e) {
            /* el listado de eliminados se actualizara en el proximo bootstrap */
          }
          notify(userMessage("requestDeleted"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-client-request']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const actor = currentUser();
      const requestId = String(btn.dataset.id || "");
      if (!requestId || !actor) return;
      const req = reqRead().find((r) => String(r.id) === requestId);
      if (!req || !canClientEditOwnPendingTransportRequest(req, actor)) {
        notify("Solo puede eliminar solicitudes pendientes de aprobación de su empresa.", "error");
        return;
      }
      if (req.trip) {
        notify(
          "No puede eliminar esta solicitud porque tiene un viaje asignado. Solicite a operaciones que quite el viaje primero; luego podrá eliminar la solicitud.",
          "error"
        );
        return;
      }
      openConfirmReasonModal({
        title: "Eliminar solicitud",
        message:
          "Se eliminara definitivamente esta solicitud. Solo es posible cuando aun no ha sido aprobada. Indique el motivo.",
        confirmText: "Eliminar",
        onConfirm: async (motivo) => {
          try {
            await postPortalAuthorized("/portal/client-request-delete", { requestId, motivo });
          } catch (err) {
            notify(String(err?.message || "No fue posible eliminar la solicitud en el servidor."), "error");
            return;
          }
          await reqWriteAwait(reqRead().filter((r) => String(r.id) !== requestId));
          recalculateResourceAvailability();
          try {
            await applyPortalBootstrapFromApi();
          } catch (_e) {}
          notify("Solicitud eliminada.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* Conductores: delete-driver, form-driver, edit-driver → `modules/app/conductores.js` (__portalModuleAfterRender["transport-drivers"]). */

  /* Historial: workspace, flota, filtros → `modules/app/historial.js` (__portalModuleAfterRender.history). */

  /* Nómina → `modules/app/gestion-humana.js`. Contratación → `modules/app/contratacion.js`. SST → `modules/app/cumplimiento-laboral.js`. Perfil → `modules/app/mi-perfil.js`. Autorizaciones → `modules/app/autorizaciones.js`. */


}

function initGlobalEvents() {
  const V = window.AntaresValidation;
  if (V?.installLiveValidation) {
    V.installLiveValidation(document);
  }
  if (V?.installFormSubmitGuard) {
    V.installFormSubmitGuard(document, {
      onInvalid(_form, firstInvalid) {
        try {
          firstInvalid?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
        } catch (_e) {
          /* noop */
        }
        firstInvalid?.focus?.();
        if (typeof notify === "function") notify(userMessage("validationStep"), "error");
      }
    });
  }
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const opener = target.closest("#open-auth, #open-auth-hero");
    if (!opener) return;
    event.preventDefault();
    if (typeof window.showAuth === "function") window.showAuth();
  });

  const savedTheme = String(localStorage.getItem(UI_PREFS.theme) || "light");
  const savedLang = String(localStorage.getItem(UI_PREFS.publicLang) || "es");
  applyTheme(savedTheme);
  state.publicLang = savedLang === "en" ? "en" : "es";
  applyPublicLanguage(state.publicLang);

  nodes.closeAuth?.addEventListener("click", () => {
    if (typeof window.hideAuth === "function") window.hideAuth();
  });

  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mainNav = document.getElementById("main-nav");
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      mainNav.classList.toggle("nav-open");
      syncPublicNavDrawer();
    });
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closePublicNavDrawer());
    });
    document.addEventListener("click", (event) => {
      if (!mainNav.classList.contains("nav-open")) return;
      const t = event.target;
      if (mainNav.contains(t) || hamburgerBtn.contains(t)) return;
      closePublicNavDrawer();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !mainNav.classList.contains("nav-open")) return;
      closePublicNavDrawer();
      hamburgerBtn.focus();
    });
    syncPublicNavDrawer();
  }

  const portalMenuBtn = document.getElementById("portal-menu-btn");
  const portalBackdrop = document.getElementById("portal-nav-backdrop");
  if (portalMenuBtn && portalBackdrop) {
    portalMenuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      setPortalDrawerOpen(!document.body.classList.contains("portal-drawer-open"));
    });
    portalBackdrop.addEventListener("click", () => setPortalDrawerOpen(false));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) {
        setPortalDrawerOpen(false);
        closePublicNavDrawer();
      }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !document.body.classList.contains("portal-drawer-open")) return;
    setPortalDrawerOpen(false);
    document.getElementById("portal-menu-btn")?.focus();
  });

  if (nodes.themeButtonsPublic.length || nodes.themeButtonsPortal.length) {
    [...nodes.themeButtonsPublic, ...nodes.themeButtonsPortal].forEach((btn) => {
      btn.addEventListener("click", () => {
        applyTheme(String(btn.dataset.themeOption || "light"));
      });
    });
  }

  if (nodes.langButtonsPublic.length) {
    nodes.langButtonsPublic.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.publicLang = String(btn.dataset.langOption || "es") === "en" ? "en" : "es";
        localStorage.setItem(UI_PREFS.publicLang, state.publicLang);
        applyPublicLanguage(state.publicLang);
        window.initCoverageCorridors?.();
        window.initPublicCareers?.();
      });
    });
  }
  nodes.authTabs.forEach((tabBtn) =>
    tabBtn.addEventListener("click", () => {
      if (state.authSupabaseRecovery) return;
      state.authTab = tabBtn.dataset.tab;
      renderAuthTab();
    })
  );

  wireSupabasePasswordRecoveryUi();

  if (nodes.b2bForm) {
    const b2bSubmitBtn = nodes.b2bForm.querySelector("[data-step-submit]");
    const b2bStepPrev = nodes.b2bForm.querySelector("[data-step-prev]");
    const b2bStepNext = nodes.b2bForm.querySelector("[data-step-next]");
    wireFormSubmitGuard(
      nodes.b2bForm,
      async (event) => {
    setB2bFormFeedback("", "");
    syncPhoneHiddenFull(nodes.b2bForm, "b2b");
    nodes.b2bForm.querySelectorAll("input,select,textarea").forEach((field) => clearFieldError(field));
    const data = readFormEntriesNormalized(nodes.b2bForm);
    const V = window.AntaresValidation;
    const jumpToStepForField = (selector) => {
      const field = nodes.b2bForm.querySelector(selector);
      const pane = field?.closest("[data-step-pane]");
      const paneIndex = pane ? Number(pane.getAttribute("data-step-pane")) : 0;
      if (typeof nodes.b2bForm.__setB2BStep === "function" && Number.isFinite(paneIndex)) {
        nodes.b2bForm.__setB2BStep(paneIndex);
      }
    };
    let messageValue = String(data.message || "").trim();
    if (V && typeof V.validateB2bProspectClient === "function") {
      const b2bVal = V.validateB2bProspectClient(nodes.b2bForm, data, () =>
        getSelectedPhoneCountry(nodes.b2bForm, "b2b")
      );
      if (!b2bVal.ok) {
        const first = b2bVal.first || b2bVal.errors?.[0];
        if (first === "email") jumpToStepForField("input[name='email']");
        if (first === "phone") jumpToStepForField(".js-b2b-phone-national");
        if (first === "message") jumpToStepForField("textarea[name='message']");
        if (first === "name") jumpToStepForField("input[name='name']");
        if (first === "company") jumpToStepForField("input[name='company']");
        if (first === "taxId") jumpToStepForField("input[name='taxId']");
        if (first === "position") jumpToStepForField("input[name='position']");
        notify(userMessage("b2bFieldsInvalid"), "error");
        return;
      }
      Object.assign(data, b2bVal.sanitized);
      messageValue = String(data.message || "").trim();
    } else {
    const emailValue = normalizeEmail(data.email);
    messageValue = String(data.message || "").trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(emailValue);
    const meta = getSelectedPhoneCountry(nodes.b2bForm, "b2b");
    const phoneDigitsAll = String(data.phone || "").replace(/\D/g, "");

    const errors = [];
    if (!emailValid) {
      setFieldError(nodes.b2bForm.querySelector("input[name='email']"), "Ingresa un correo corporativo valido.");
      errors.push("email");
    }
    const natPhoneField = nodes.b2bForm.querySelector(".js-b2b-phone-national");
    let phoneErrMsg = "";
    if (!phoneDigitsAll.startsWith(meta.dial)) {
      phoneErrMsg = "El telefono no coincide con el pais seleccionado en el indicativo.";
    } else {
      const nationalLen = phoneDigitsAll.length - meta.dial.length;
      if (nationalLen < meta.minNat || nationalLen > meta.maxNat) {
        phoneErrMsg =
          meta.style === "co"
            ? "Ingrese un celular colombiano valido (10 digitos nacionales; puede incluir +57 en el mismo campo o usar solo el numero local)."
            : `Ingrese entre ${meta.minNat} y ${meta.maxNat} digitos del numero local para ${meta.label}.`;
      } else if (meta.style === "co") {
        const nat = phoneDigitsAll.slice(meta.dial.length);
        if (!nat.startsWith("3")) {
          phoneErrMsg = "El celular en Colombia debe ser movil (empieza por 3).";
        }
      }
    }
    if (phoneErrMsg) {
      setFieldError(natPhoneField, phoneErrMsg);
      errors.push("phone");
    }
    if (messageValue.length < 30) {
      setFieldError(nodes.b2bForm.querySelector("textarea[name='message']"), "Cuéntanos un poco mas del requerimiento (minimo 30 caracteres).");
      errors.push("message");
    }
    if (errors.length) {
      const firstError = errors[0];
      if (firstError === "email") jumpToStepForField("input[name='email']");
      if (firstError === "phone") jumpToStepForField(".js-b2b-phone-national");
      if (firstError === "message") jumpToStepForField("textarea[name='message']");
      notify(userMessage("b2bFieldsInvalid"), "error");
      return;
    }

    data.email = emailValue;
    data.phone = String(data.phone || "").trim();
    data.message = messageValue;
    }

    const api = window.AntaresApi;
    const apiBase = typeof api?.getBase === "function" ? api.getBase() : "";
    if (!apiBase || typeof api?.postJsonPublic !== "function") {
      const apiMissing =
        state.publicLang === "en"
          ? "API URL is not configured (antares_api_base or __ANTARES_API_BASE__). The request could not be sent to the server."
          : userMessage("b2bApiMissing");
      setB2bFormFeedback("error", apiMissing);
      notify(apiMissing, "error");
      return;
    }

      try {
        await api.postJsonPublic("/public/b2b-prospect", {
          name: normalizeLatinUpperForDb(data.name),
          company: normalizeLatinUpperForDb(data.company),
          taxId: data.taxId,
          position: normalizeLatinUpperForDb(data.position),
          phone: data.phone,
          email: normalizeEmail(data.email),
          serviceType: normalizeLatinUpperForDb(data.serviceType),
          operationType: normalizeLatinUpperForDb(data.operationType),
          operationFrequency: normalizeLatinUpperForDb(data.operationFrequency),
          startWindow: normalizeLatinUpperForDb(data.startWindow),
          message: normalizeLatinUpperForDb(messageValue)
        });
        nodes.b2bForm.reset();
        if (typeof nodes.b2bForm.__setB2BStep === "function") nodes.b2bForm.__setB2BStep(0);
        const sentOk =
          state.publicLang === "en"
            ? "Your request was submitted successfully. Our commercial team has received it and will contact you shortly. Thank you for contacting Transportes Antares."
            : userMessage("b2bContactSent");
        setB2bFormFeedback("success", sentOk);
        notify(sentOk, "success", 5600);
      } catch (err) {
        const errBody =
          state.publicLang === "en"
            ? String(err?.message || "").trim() ||
              "Could not save to the server. Please try again or contact us by phone or email."
            : String(err?.message || userMessage("b2bServerError"));
        setB2bFormFeedback("error", errBody);
        notify(errBody, "error");
      }
      },
      {
        submitButton: b2bSubmitBtn,
        busyText: state.publicLang === "en" ? "Sending…" : "Enviando…",
        lockExtraButtons: [b2bStepPrev, b2bStepNext]
      }
    );
  }

  nodes.sideLinks.forEach((link) => {
    link.addEventListener("click", (ev) => {
      if (link.dataset.view === "notifications") {
        const prefTarget = ev.target.closest("[data-notif-pref]");
        if (prefTarget) {
          ev.preventDefault();
          ev.stopPropagation();
          const which = prefTarget.getAttribute("data-notif-pref") || "";
          if (which === "sound") toggleNotificationSoundMuted();
          else if (which === "alerts") toggleNotificationAlertsEnabled();
          return;
        }
      }
      setView(link.dataset.view);
      setPortalDrawerOpen(false);
    });
  });

  window.addEventListener("hashchange", () => {
    const user = currentUser();
    if (!state.session || !user) return;
    const urlView = viewFromPortalHash();
    if (!urlView) return;
    if (!isViewAllowedForUser(user, urlView)) {
      state.currentView = "dashboard";
      syncPortalHash("dashboard");
      renderPortalView();
      return;
    }
    state.currentView = urlView;
    renderPortalView();
  });

  nodes.logout?.addEventListener("click", async () => {
    /**
     * Cierre de sesión completo: pedimos al servidor que invalide el refresh token
     * (POST /portal/logout) ANTES de borrar la sesión local. Si no hay conexión o el
     * servidor responde fuera de tiempo, igual seguimos con `clearSession()` para no
     * dejar al usuario atrapado en el portal. El timeout corto evita que el botón
     * "Cerrar sesión" se sienta colgado cuando el API está caído.
     */
    const logoutBtn = nodes.logout;
    if (logoutBtn?.dataset.busy === "1") return;
    if (logoutBtn) {
      logoutBtn.dataset.busy = "1";
      logoutBtn.disabled = true;
      logoutBtn.setAttribute("aria-busy", "true");
    }
    try {
      const api = window.AntaresApi;
      if (api?.getBase?.() && portalCanRefreshFromApi()) {
        await Promise.race([
          api.postJson("/portal/logout", {}),
          new Promise((resolve) => setTimeout(resolve, 2500))
        ]);
      }
    } catch (_e) {
      /* best-effort: el clearSession local debe seguir aunque el server no responda. */
    }
    clearSession();
    state.currentView = "dashboard";
    history.replaceState(null, "", window.location.pathname + window.location.search);
    renderPortal();
  });

  initRequiredFieldIndicators();
  installCandidateCvDownloadDelegation();
  installEmployeeContractDelegation();
  initB2BFormExperience();
  portalUpgradeDates(nodes.viewRoot);
  if (nodes.b2bForm) portalUpgradeDates(nodes.b2bForm);
}
function bindExtendedViewEditHandlers() {
  /** Fichas «Ver» compartidas (empresa, usuario). Ausencias, contratación (tablas) y SST → `gestion-humana.js`, `contratacion.js`, `cumplimiento-laboral.js`. */
  const renderDetailRows = portalDetailRenderRows;
  const buildDetailGrid = portalDetailBuildGrid;
  const portalDetailTile = portalDetailTileMarkup;

  const fmtMoney = (val) => `$${parseNum(val).toLocaleString("es-CO")}`;
  const fmtBool = (val) => (val ? "Sí" : "No");
  const fmtDateOr = (val, fallback = "—") => {
    const y = normalizePortalDateYmd(val);
    return y ? escapeHtml(y) : fallback;
  };

  /* Vehículo Ver/Estado: installVehicleCardActionsDelegation() */
  /* Conductor Ver/Estado: installDriverCardActionsDelegation() */

  /* ============= EMPRESA: VER ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-company']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cRaw = read(KEYS.companies, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      const c = cRaw ? normalizePortalBootstrapCompanyRow(cRaw) : null;
      if (!c) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const usersCount = read(KEYS.users, []).filter((u) => String(u.companyId || "") === String(c.id)).length;
      const phoneDisp = c.phone ? formatPortalPhoneForDisplay(String(c.phone)) : "";
      const logoUrl = companyProfileLogoUrl(c);
      const kindUi = patchOperatorCompanyKindIfNeeded([{ ...c }])[0]?.companyKind ?? c.companyKind;
      const active = isCompanyRecordActive(c);
      const statusChip = active
        ? `<span class="status status-viaje_asignado">Activa</span>`
        : `<span class="status status-rechazada">Inactiva</span>`;
      const nitStr = String(c.taxId || c.nit || "").trim();
      const logoHero = logoUrl
        ? `<div class="portal-detail-logo"><img src="${escapeAttr(logoUrl)}" alt="" loading="lazy" decoding="async" /></div>`
        : `<div class="portal-detail-logo portal-detail-logo--fallback" aria-hidden="true"><span>${escapeHtml(String(c.name || "E").charAt(0).toUpperCase())}</span></div>`;
      const rawPhone = String(c.phone || "").trim();
      const telDigits = rawPhone.replace(/\D/g, "");
      const telHref = telDigits.length >= 6 ? `tel:${telDigits}` : "";
      const mail = String(c.email || "").trim();
      const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
      const mailHref = mailOk ? `mailto:${mail}` : "";
      const contactName = String(c.contactName || "").trim();
      const addr = String(c.address || "").trim();
      const city = String(c.city || "").trim();
      const dept = String(c.department || "").trim();
      const locLine = [city, dept].filter(Boolean).join(city && dept ? ", " : "");
      const hasLoc = Boolean(addr || locLine);
      const createdLbl = fmtDateOr(c.createdAt, "—");
      const updatedLbl = fmtDateOr(c.updatedAt || c.createdAt, "—");

      const phoneValue = phoneDisp ? escapeHtml(phoneDisp) : `<span class="muted">Sin teléfono</span>`;
      const phoneBlock = telHref
        ? portalDetailTile(IC.phone, "Teléfono", phoneValue, { href: telHref })
        : portalDetailTile(IC.phone, "Teléfono", phoneValue, { muted: !phoneDisp });

      const emailValue = mail ? escapeHtml(mail) : `<span class="muted">Sin correo</span>`;
      const emailBlock = mailHref
        ? portalDetailTile(IC.mail, "Correo empresarial", emailValue, { href: mailHref })
        : portalDetailTile(IC.mail, "Correo empresarial", emailValue, { muted: !mail });

      const contactValue = contactName ? escapeHtml(contactName) : `<span class="muted">Sin contacto principal</span>`;
      const contactBlock = portalDetailTile(IC.user, "Contacto principal", contactValue, { muted: !contactName });

      const locBody = hasLoc
        ? `<p class="portal-detail-loc-line">${addr ? escapeHtml(addr) : `<span class="muted">Sin dirección</span>`}</p>${
            locLine ? `<p class="portal-detail-loc-sub muted">${IC.mapPin} ${escapeHtml(locLine)}</p>` : ""
          }`
        : `<p class="portal-detail-loc-line muted">Sin ubicación registrada.</p>`;
      const heroHtml = `<div class="portal-detail-hero">
    ${logoHero}
    <div class="portal-detail-hero-main">
      <p class="portal-detail-eyebrow">${IC.briefcase} Ficha comercial</p>
      <div class="portal-detail-badges">${companyKindChipHtml(kindUi)} ${statusChip}</div>
      ${
        nitStr
          ? `<p class="portal-detail-meta"><span class="muted">NIT</span> <strong>${escapeHtml(nitStr)}</strong></p>`
          : `<p class="portal-detail-meta muted">Sin NIT registrado</p>`
      }
      <ul class="portal-detail-stats" aria-label="Resumen">
        <li><strong>${escapeHtml(String(usersCount))}</strong><span>Usuario${usersCount === 1 ? "" : "s"} portal</span></li>
        <li><strong>${createdLbl}</strong><span>Alta en sistema</span></li>
        <li><strong>${updatedLbl}</strong><span>Última actualización</span></li>
      </ul>
    </div>
  </div>`;
      const highlightHtml = `<section class="portal-detail-loc" aria-label="Ubicación">
    <h4 class="portal-detail-loc-title">${IC.mapPin} Ubicación</h4>
    ${locBody}
  </section>`;

      openPortalDetailSheet({
        title: String(c.name || "Empresa"),
        subtitle: nitStr ? `NIT ${nitStr}` : "",
        heroHtml,
        tilesHtml: `${phoneBlock}${emailBlock}${contactBlock}`,
        highlightHtml
      });
    });
  });

  /* ============= USUARIO: VER ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const u = read(KEYS.users, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!u) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const company = getCompanyById(u.companyId);
      const companyName = String(company?.name || u.company || "").trim();
      const displayName = getPortalUserDisplayName(u);
      const avatarUrlRaw = String(u.avatarUrl || "").trim();
      const avatarCss = employeeAvatarCssUrl(u.avatarUrl);
      const avatarHero = avatarCss
        ? `<div class="portal-detail-logo portal-detail-logo--avatar"><img src="${escapeAttr(avatarUrlRaw)}" alt="" loading="lazy" decoding="async" /></div>`
        : `<div class="portal-detail-logo portal-detail-logo--avatar portal-detail-logo--fallback" aria-hidden="true"><span>${escapeHtml(
            (displayName.charAt(0) || "?").toUpperCase()
          )}</span></div>`;
      const roleKey = String(u.role || "");
      const roleColors = {
        admin: "#377cc0",
        rrhh: "#7C3AED",
        administracion: "#1D4ED8",
        auxiliar_administrativo: "#0EA5E9",
        lider_administrativo: "#4F46E5",
        logistica: "#0D9488",
        client: "#0E7490"
      };
      const roleChip = `<span class="role-chip" style="--role-color:${roleColors[roleKey] || "#64748B"}">${escapeHtml(
        formatPortalRoleLabel(u.role)
      )}</span>`;
      const docTypeLabel =
        String(u.documentType || "").toUpperCase() === "CC"
          ? "Cédula de ciudadanía"
          : String(u.documentType || "").toUpperCase() === "CE"
            ? "Cédula de extranjería"
            : String(u.documentType || "").toUpperCase() === "NIT"
              ? "NIT"
              : String(u.documentType || "").toUpperCase() === "PAS"
                ? "Pasaporte"
                : "Sin definir";
      const normAcc = normalizeUserAccountStatus(u);
      const accountStatusChip =
        normAcc === ACCOUNT_STATUS.PENDIENTE
          ? `<span class="status status-pendiente">Pendiente</span>`
          : normAcc === ACCOUNT_STATUS.RECHAZADO
            ? `<span class="status status-rechazada">Rechazado</span>`
            : `<span class="status status-viaje_asignado">Aprobado</span>`;
      const idDoc = String(u.idDoc || u.taxId || "").trim();
      const metaLine = idDoc
        ? `<p class="portal-detail-meta"><span class="muted">Documento</span> <strong>${escapeHtml(idDoc)}</strong></p>`
        : `<p class="portal-detail-meta muted">Sin documento registrado</p>`;
      const createdLbl = fmtDateOr(u.createdAt, "—");
      const joinLbl = fmtDateOr(u.systemJoinDate || u.createdAt, "—");
      const email = String(u.email || "").trim();
      const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const mailHref = mailOk ? `mailto:${email}` : "";
      const rawPhone = String(u.phone || "").trim();
      const telDigits = rawPhone.replace(/\D/g, "");
      const telHref = telDigits.length >= 6 ? `tel:${telDigits}` : "";
      const phoneDisp = u.phone ? formatPortalPhoneForDisplay(String(u.phone)) : "";
      const emailValue = email ? escapeHtml(email) : `<span class="muted">Sin correo</span>`;
      const emailBlock = mailHref
        ? portalDetailTile(IC.mail, "Correo", emailValue, { href: mailHref })
        : portalDetailTile(IC.mail, "Correo", emailValue, { muted: !email });
      const phoneValue = phoneDisp ? escapeHtml(phoneDisp) : `<span class="muted">Sin teléfono</span>`;
      const phoneBlock = telHref
        ? portalDetailTile(IC.phone, "Teléfono", phoneValue, { href: telHref })
        : portalDetailTile(IC.phone, "Teléfono", phoneValue, { muted: !phoneDisp });
      const companyValue = companyName ? escapeHtml(companyName) : `<span class="muted">Sin empresa</span>`;
      const companyBlock = portalDetailTile(IC.briefcase, "Empresa", companyValue, { muted: !companyName });
      const storedCompanyLabel = String(u.company || "").trim() || "Sin nombre comercial";
      const city = String(u.city || "").trim();
      const dept = String(u.department || "").trim();
      const permsHtml = effectiveUserPermissions(u)
        .map((p) => `<span class="perm-tag">${escapeHtml(PERMISSION_META[p]?.title || String(p))}</span>`)
        .join(" ");
      const regKind = registrationKindLabel(u.registrationKind);
      const detailSections = buildDetailGrid([
        {
          icon: "user",
          title: "Datos personales",
          rows: renderDetailRows([
            ["Nombre completo", `<strong>${escapeHtml(displayName || "Usuario")}</strong>`],
            ["Correo corporativo", escapeHtml(email || "Sin correo")],
            ["Tipo documento", escapeHtml(docTypeLabel)],
            ["Documento / NIT", escapeHtml(idDoc || "Sin documento")],
            ["Teléfono", escapeHtml(phoneDisp || "Sin teléfono")],
            ["Avatar", escapeHtml(avatarCss ? "Cargado" : "Sin foto")]
          ])
        },
        {
          icon: "shield",
          title: "Acceso y rol",
          rows: renderDetailRows([
            ["Rol", escapeHtml(formatPortalRoleLabel(u.role) || "Sin rol")],
            ["Tipo de vínculo", escapeHtml(regKind || "Sin vínculo")],
            ["Empresa vinculada", escapeHtml(companyName || "Sin empresa")],
            ["Nombre comercial", escapeHtml(storedCompanyLabel)],
            ["Autenticación 2FA", escapeHtml(u.twoFactorEnabled ? "Habilitada" : "Deshabilitada")],
            ["Fecha de ingreso", escapeHtml(joinLbl)],
            ["Estado de cuenta", escapeHtml(normAcc === ACCOUNT_STATUS.RECHAZADO ? "Rechazada" : normAcc === ACCOUNT_STATUS.PENDIENTE ? "Pendiente" : "Aprobada")],
            ["Contraseña", `<span class="muted">Oculta por seguridad</span>`]
          ])
        },
        {
          icon: "mapPin",
          title: "Ubicación",
          rows: renderDetailRows([
            ["Departamento", escapeHtml(dept || "Sin departamento")],
            ["Ciudad", escapeHtml(city || "Sin ciudad")],
            ["Dirección", escapeHtml(String(u.address || "").trim() || "Sin dirección")]
          ])
        }
      ]);
      const permsBody = permsHtml
        ? `<p class="portal-detail-loc-line"><span class="muted">Permisos asignados</span> ${escapeHtml(String(effectiveUserPermissions(u).length))}</p><div class="detail-perms-list">${permsHtml}</div>`
        : `<p class="portal-detail-loc-line muted">Sin permisos asignados.</p>`;
      const heroHtml = `<div class="portal-detail-hero">
    ${avatarHero}
    <div class="portal-detail-hero-main">
      <p class="portal-detail-eyebrow">${IC.user} Usuario del sistema</p>
      <div class="portal-detail-badges">${roleChip} ${accountStatusChip}</div>
      ${metaLine}
      <ul class="portal-detail-stats" aria-label="Resumen">
        <li><strong>${companyName ? escapeHtml(companyName) : "—"}</strong><span>Empresa</span></li>
        <li><strong>${createdLbl}</strong><span>Alta en sistema</span></li>
      </ul>
    </div>
  </div>`;
      const highlightHtml = `<section class="portal-detail-loc" aria-label="Permisos">
    <h4 class="portal-detail-loc-title">${IC.layers} Permisos</h4>
    ${permsBody}
  </section>`;

      openPortalDetailSheet({
        title: displayName || "Usuario",
        subtitle: email,
        heroHtml,
        tilesHtml: `${emailBlock}${phoneBlock}${companyBlock}`,
        sectionsHtml: detailSections,
        highlightHtml
      });
    });
  });

}

function initRequiredFieldIndicators() {
  const markerClass = "required-marker";

  const placeMarker = (label) => {
    if (!label || label.querySelector(`.${markerClass}`) || label.querySelector(".field-required-mark")) return;
    const marker = document.createElement("span");
    marker.className = markerClass;
    marker.textContent = "*";
    marker.setAttribute("aria-hidden", "true");

    const labelTextNode = label.querySelector("span");
    if (labelTextNode) {
      labelTextNode.classList.add("required-with-marker");
      labelTextNode.append(" ", marker);
      return;
    }

    label.classList.add("required-with-marker");
    label.append(" ", marker);
  };

  const scanRequiredFields = (root = document) => {
    const requiredFields = root.querySelectorAll("input[required], select[required], textarea[required]");
    requiredFields.forEach((field) => {
      if (field.type === "hidden") return;
      const label = field.closest("label");
      placeMarker(label);
    });
  };

  scanRequiredFields(document);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("input[required], select[required], textarea[required]")) {
          const label = node.closest("label");
          placeMarker(label);
        }
        scanRequiredFields(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/** Carreras públicas: combina GET /api/public/vacancies con vacantes publicadas en este navegador.
 *  Estado en `window.*` porque `initPublicCareers` vive en `portal-runtime.js` (script clásico). */
function normalizeVacancyForCareersPublic(v) {
  if (!v) return null;
  return {
    id: v.id,
    title: String(v.title || ""),
    department: String(v.department || ""),
    city: String(v.city || ""),
    deadline: v.deadline || "",
    publishedFrom: v.publishedFrom || v.visibleFrom || "",
    salaryOffer: parseNum(v.salaryOffer),
    requirements: String(v.requirements || ""),
    status: String(v.status || ""),
    positionName: String(v.positionName || ""),
    modality: String(v.modality || ""),
    openings: v.openings != null ? v.openings : 1,
    workerRole: String(v.workerRole || "")
  };
}

/** Fecha YYYY-MM-DD válida para ventana pública. */
function publicVacancyYmdValid(s) {
  const t = String(s || "").trim();
  if (!t) return false;
  const parts = t.split("-");
  if (parts.length !== 3) return false;
  const cand = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  return Number.isFinite(cand);
}

function publicVacancyYmdToMidnight(s) {
  const parts = String(s || "").trim().split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
}

/** Fin de ventana: día de cierre inclusive; al día siguiente ya no se lista. Requiere fecha de cierre. */
function vacancyPublicationDeadlineOk(isoDateStr) {
  const s = String(isoDateStr || "").trim();
  if (!s) return false;
  const parts = s.split("-");
  if (parts.length !== 3) return false;
  const cand = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  if (!Number.isFinite(cand)) return false;
  const t = new Date();
  const t0 = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  return cand >= t0;
}

/** Inicio de ventana opcional: si hay fecha, solo se lista cuando el calendario ya llegó a ese día. */
function vacancyPublicationStartOk(isoDateStr) {
  const s = String(isoDateStr || "").trim();
  if (!s) return true;
  const parts = s.split("-");
  if (parts.length !== 3) return false;
  const start = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  if (!Number.isFinite(start)) return false;
  const t = new Date();
  const t0 = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  return t0 >= start;
}

function mergeApiVacanciesWithLocalPublished(apiList, localRawList) {
  const out = [];
  const seen = new Set();
  (apiList || []).forEach((row) => {
    const norm = normalizeVacancyForCareersPublic(row);
    if (norm == null || norm.id === undefined || norm.id === null || String(norm.id).trim() === "") return;
    const id = String(norm.id);
    out.push(norm);
    seen.add(id);
  });
  (localRawList || []).forEach((row) => {
    if (String(row?.status || "") !== "Publicada") return;
    const norm = normalizeVacancyForCareersPublic(row);
    if (norm == null || norm.id === undefined || norm.id === null || String(norm.id).trim() === "") return;
    const id = String(norm.id);
    if (seen.has(id)) return;
    out.push(norm);
    seen.add(id);
  });
  return out;
}

function getPublicPublishedVacancies() {
  const source = window.publicCareersVacanciesSource ?? "local";
  const fromApi = window.publicCareersVacanciesFromApi;
  const rows =
    source === "api" && fromApi !== null && Array.isArray(fromApi)
      ? fromApi
      : (read(KEYS.vacancies, []) || []).map((v) => normalizeVacancyForCareersPublic(v)).filter(Boolean);
  return rows.filter(
    (v) =>
      String(v.status || "") === "Publicada" &&
      vacancyPublicationStartOk(v.publishedFrom) &&
      vacancyPublicationDeadlineOk(v.deadline)
  );
}

/** Tras montar el modal de postulación pública: nombre del archivo y botón para quitar y elegir otro. */
function afterMountPublicVacancyAttachmentUi(formEl) {
  const attachInput = formEl?.querySelector?.("input[name='attachment']");
  if (!attachInput) return;
  const label = attachInput.closest("label");
  if (!label) return;
  const bar = document.createElement("div");
  bar.className = "modal-file-attach-actions";
  bar.innerHTML =
    '<span class="muted modal-attach-filename" data-attach-filename title=""></span>' +
    '<button type="button" class="btn btn-sm btn-outline" data-attach-clear hidden>Quitar archivo</button>';
  label.appendChild(bar);
  const nameEl = bar.querySelector("[data-attach-filename]");
  const clearBtn = bar.querySelector("[data-attach-clear]");
  const sync = () => {
    const f = attachInput.files?.[0];
    if (f) {
      nameEl.textContent = f.name;
      nameEl.title = f.name;
      clearBtn.hidden = false;
    } else {
      nameEl.textContent = "";
      nameEl.title = "";
      clearBtn.hidden = true;
    }
  };
  attachInput.addEventListener("change", sync);
  clearBtn.addEventListener("click", () => {
    attachInput.value = "";
    sync();
    try {
      attachInput.focus();
    } catch (_e) {}
  });
}

function openPublicVacancyApplyModal(vacancy) {
  openEditModal({
    title: "Postulacion en linea",
    subtitle: `${vacancy.title} — ${vacancy.positionName || "Vacante Antares"}`,
    submitText: "Enviar candidatura",
    afterMount: afterMountPublicVacancyAttachmentUi,
    fields: [
      { type: "hidden", name: "vacancyId", value: vacancy.id },
      { name: "name", label: "Nombre completo", required: true },
      { name: "email", label: "Correo electronico", type: "email", required: true },
      { name: "phone", label: "Telefono", required: true },
      {
        name: "documentType",
        label: "Tipo de documento",
        type: "select",
        required: true,
        value: "CC",
        options: [
          { value: "CC", label: "Cedula de ciudadania" },
          { value: "CE", label: "Cedula de extranjeria" },
          { value: "PAS", label: "Pasaporte" }
        ]
      },
      { name: "idDoc", label: "Numero de documento", required: true },
      { name: "birthDate", label: "Fecha de nacimiento", type: "date", required: true },
      {
        name: "experienceYears",
        label: "Años de experiencia en el cargo o similar",
        type: "number",
        value: "0",
        min: 0,
        max: 65,
        required: true
      },
      { name: "city", label: "Ciudad de residencia", required: true },
      { name: "address", label: "Direccion", required: true },
      {
        name: "attachment",
        label: "Hoja de vida (PDF, Word o imagen)",
        type: "file",
        accept: ".pdf,.doc,.docx,image/*",
        required: true
      }
    ],
    onSubmit: async (_payload, formEl) => {
      if (!formEl) return false;
      const vac = vacancy;
      if (!vac || vac.status !== "Publicada") {
        notify(userMessage("vacancyPublicClosed"), "error");
        return false;
      }
      const fd = new FormData(formEl);
      const docValidation = validateColombianDocument(String(fd.get("documentType") || ""), String(fd.get("idDoc") || ""));
      if (!docValidation.ok) {
        notify(docValidation.message, "error");
        return false;
      }
      fd.set("idDoc", docValidation.normalized);
      const birth = String(fd.get("birthDate") || "")
        .trim()
        .slice(0, 10);
      const pubAgeInfo = portalCandidateAgeFromBirthIso(birth);
      if (pubAgeInfo.age === null) {
        notify("Indique una fecha de nacimiento válida.", "error");
        return false;
      }
      if (pubAgeInfo.age < 18) {
        notify("Debe tener al menos 18 años para postularse.", "error");
        return false;
      }
      const expY = Math.min(65, Math.max(0, parseNum(String(fd.get("experienceYears") ?? "0"))));
      fd.set("experienceYears", String(expY));
      const attachInput = formEl.querySelector("input[name='attachment']");
      if (!attachInput?.files?.[0]) {
        notify("Adjunte la hoja de vida (PDF, Word o imagen).", "error");
        return false;
      }
      fd.set("email", normalizeEmail(String(fd.get("email") || "")));
      const apiPub = window.AntaresApi;
      if (apiPub?.hasBase?.() && typeof apiPub.postFormDataPublic === "function") {
        try {
          await apiPub.postFormDataPublic("/public/job-application", fd);
          notify(userMessage("candidacySentOk"), "success");
          return true;
        } catch (err) {
          notify(String(err?.message || err), "error");
          return false;
        }
      }
      const vacancyIdFd = String(fd.get("vacancyId") || "");
      const vacLocal = read(KEYS.vacancies, []).find((x) => String(x.id) === vacancyIdFd);
      if (!vacLocal || vacLocal.status !== "Publicada") {
        notify(userMessage("vacancyPublicClosed"), "error");
        return false;
      }
      const cvPieces = await readCandidateHrAttachmentsFromInput(attachInput);
      if (cvPieces === null) return false;
      const nm = String(fd.get("name") || "").trim();
      const all = read(KEYS.candidates, []);
      all.unshift({
        id: newUuidV4(),
        name: normalizeLatinUpperForDb(nm),
        email: normalizeEmail(String(fd.get("email") || "")),
        phone: normalizePortalPhoneForStorage(String(fd.get("phone") || "").trim()),
        documentType: String(fd.get("documentType") || ""),
        idDoc: docValidation.normalized,
        birthDate: birth,
        experienceYears: expY,
        city: normalizeLatinForDb(String(fd.get("city") || "").trim()),
        address: normalizeLatinUpperForDb(String(fd.get("address") || "").trim()),
        vacancyId: vacLocal.id,
        vacancyTitle: vacLocal.title,
        experienceNotes: "",
        expectedSalary: 0,
        availabilityDate: "",
        status: PIPELINE[0],
        attachments: cvPieces,
        source: "Sitio web",
        createdAt: nowIso()
      });
      try {
        await writeAwaitServer(KEYS.candidates, all);
      } catch (err) {
        const raw = String(err?.message || "No fue posible registrar la postulación en el servidor.");
        const msg = /failed to fetch/i.test(raw)
          ? "No fue posible conectar con el servidor para guardar la postulación. Compruebe su conexion y que la API este disponible."
          : raw;
        notify(msg, "error");
        return false;
      }
      sendEmail({
        to: normalizeEmail(String(fd.get("email") || "")),
        subject: "Postulacion recibida - Antares",
        body: `Hola ${nm}, registramos tu postulacion a "${vacLocal.title}". Nuestro equipo de seleccion revisara tu perfil.`
      });
      try {
        await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
      } catch (_e) {}
      notifyHrUsers(
        "Nueva postulacion (web)",
        `${nm} aplico a "${vacLocal.title}". Revise Contratacion · Pipeline de candidatos.`
      );
      notify(userMessage("candidacySentOk"), "success");
      return true;
    }
  });
}

Object.assign(window, {
  applyModuleMicroAnimations,
  wireAdminCompanyLocationSelects,
  wireAdminCompanyLogoOvals,
  ensurePositionsCatalogLiveSelects,
  installVehicleCardActionsDelegation,
  installRequestDetailDelegation,
  installDriverCardActionsDelegation,
  mountUniversalModuleFilters,
  enforceColombianFormStandards,
  bindExtendedViewEditHandlers,
  /** `app.js` lo toma de `window`; en módulo ES las funciones no son globales automáticamente. */
  initGlobalEvents,
  /** Carreras sitio público: usados desde `portal-runtime.js` (script clásico). */
  getPublicPublishedVacancies,
  mergeApiVacanciesWithLocalPublished,
  openPublicVacancyApplyModal
});

registerBindEventsCallback(bindDynamicEvents);
