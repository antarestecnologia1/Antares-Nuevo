/**
 * Transporte · Camiones (`transport-vehicles`): HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
 */
function normalizeVehicleFleetLayout(raw) {
  if (typeof AntaresVehiclesDomain !== "undefined" && AntaresVehiclesDomain.normalizeVehicleFleetLayout) {
    return AntaresVehiclesDomain.normalizeVehicleFleetLayout(raw);
  }
  return String(raw || "").trim().toLowerCase() === "list" ? "list" : "cards";
}

/** Texto agregado para filtrar en la flota (insensible a mayúsculas). */
function vehicleFleetSearchHaystack(v) {
  const parts = [
    v.plate,
    v.brand,
    v.model,
    v.type,
    v.year,
    v.color,
    v.vin,
    v.engineNumber,
    v.ownershipCard,
    v.gpsProvider,
    v.bodyType,
    v.fuelType,
    v.axleConfig,
    v.capacityKg,
    v.rcPolicyContract,
    v.rcPolicyExtra
  ];
  return parts.map((x) => String(x ?? "").toLowerCase()).join(" ");
}

function vehicleMatchesFleetSearch(v, qNorm) {
  if (!qNorm) return true;
  return vehicleFleetSearchHaystack(v).includes(qNorm);
}

function vehicleDomainFn(name) {
  const domain = typeof AntaresVehiclesDomain !== "undefined" ? AntaresVehiclesDomain : null;
  const fn = domain && domain[name];
  return typeof fn === "function" ? fn : null;
}

function simitFinesDomain() {
  return typeof AntaresSimitFinesDomain !== "undefined" ? AntaresSimitFinesDomain : null;
}

function emptyVehiclesSimitState() {
  return {
    status: "idle",
    platesKey: "",
    pendingOnly: true,
    fetchedAt: null,
    error: null,
    rows: [],
    truncated: false,
    query: "",
    resultFilter: "all"
  };
}

function normalizeSimitResultFilter(raw) {
  const fn = simitFinesDomain()?.normalizeSimitResultFilter;
  if (fn) return fn(raw);
  const value = String(raw || "all").trim().toLowerCase();
  return value === "pending" || value === "clean" ? value : "all";
}

function withSimitUi(source, patch = {}) {
  const base = source && typeof source === "object" ? source : emptyVehiclesSimitState();
  const next = { ...emptyVehiclesSimitState(), ...base, ...patch };
  next.query = Object.prototype.hasOwnProperty.call(patch, "query") ? String(patch.query || "") : String(base.query || "");
  next.resultFilter = normalizeSimitResultFilter(
    Object.prototype.hasOwnProperty.call(patch, "resultFilter") ? patch.resultFilter : base.resultFilter
  );
  return next;
}

function vehiclesSimitPlates(vehicles) {
  return (Array.isArray(vehicles) ? vehicles : []).map((item) => item?.plate);
}

function vehiclesSimitCacheKey(vehicles, pendingOnly) {
  const D = simitFinesDomain();
  if (D?.simitPlatesCacheKey) return D.simitPlatesCacheKey(vehiclesSimitPlates(vehicles), pendingOnly);
  return `${pendingOnly === false ? "all" : "pending"}:${vehiclesSimitPlates(vehicles)
    .map((plate) => String(plate || "").trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join("|")}`;
}

function vehiclesSimitPaneHtml(vehicles, simitState) {
  const D = simitFinesDomain();
  const pendingOnly = simitState?.pendingOnly !== false;
  const status = String(simitState?.status || "idle");
  const sourceUrl = D?.SIMIT_PORTAL_URL || "https://www.datos.gov.co/Funci-n-P-blica/Historial-de-Multas-reportados-en-el-SIMIT-FCM/72nf-y4v3";
  const svg = (d) =>
    `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICO = {
    alert: svg('<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/>'),
    check: svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/>'),
    doc: svg('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>'),
    money: svg('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 12h.01M17.5 12h.01"/>'),
    refresh: svg('<path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>'),
    chevron: svg('<path d="M9 6l6 6-6 6"/>')
  };
  const money = typeof D?.formatSimitMoney === "function" ? D.formatSimitMoney : (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;
  const aboutBlock = `<details class="simit-about"><summary>${ICO.info}<span>Acerca de esta consulta</span></summary>
      <p>Fuente: <a href="${escapeAttr(sourceUrl)}" target="_blank" rel="noopener noreferrer">Historial de Multas SIMIT · FCM</a> en datos.gov.co. Cubre comparendos reportados del 1 ene 2019 al 31 dic 2025 (actualización anual). El conjunto no distingue fotomultas de otras infracciones: se muestran comparendos ${pendingOnly ? "con pago pendiente" : "del historial"}. No reemplaza la consulta oficial en el portal SIMIT.</p>
    </details>`;
  const fetchedTxt = simitState?.fetchedAt
    ? `Última consulta: ${typeof fmtDate === "function" ? fmtDate(simitState.fetchedAt) : simitState.fetchedAt}`
    : "";
  const toolbar = `<div class="simit-head">
      <div class="simit-head__scope">
        <div class="simit-seg" role="group" aria-label="Alcance de la consulta SIMIT">
          <button type="button" class="${pendingOnly ? "is-on" : ""}" data-action="vehicles-simit-scope" data-scope="pending" aria-pressed="${pendingOnly ? "true" : "false"}">Pendientes</button>
          <button type="button" class="${pendingOnly ? "" : "is-on"}" data-action="vehicles-simit-scope" data-scope="all" aria-pressed="${pendingOnly ? "false" : "true"}">Historial completo</button>
        </div>
        ${fetchedTxt ? `<span class="simit-head__meta">${escapeHtml(fetchedTxt)}</span>` : ""}
      </div>
      <button type="button" class="simit-refresh${status === "loading" ? " is-loading" : ""}" data-action="vehicles-simit-refresh"${status === "loading" ? " disabled" : ""}>${ICO.refresh}<span>${status === "loading" ? "Consultando…" : "Actualizar consulta"}</span></button>
    </div>`;
  if (!vehicles.length) {
    return `<div class="simit-pane">${toolbar}${emptyState("Registre vehículos en la flota para consultar comparendos SIMIT por placa.")}${aboutBlock}</div>`;
  }
  if (status === "loading" || status === "idle") {
    const sk = Array.from({ length: 4 }, () => '<div class="simit-skeleton"></div>').join("");
    return `<div class="simit-pane" aria-busy="true">${toolbar}<p class="simit-status" role="status">Consultando el historial SIMIT por las placas de la flota…</p><div class="simit-kpis">${sk}</div><div class="simit-skeleton simit-skeleton--row"></div><div class="simit-skeleton simit-skeleton--row"></div>${aboutBlock}</div>`;
  }
  if (status === "error") {
    return `<div class="simit-pane">${toolbar}${emptyState(String(simitState?.error || "No se pudo consultar SIMIT."))}${aboutBlock}</div>`;
  }
  const summary = D?.summarizeSimitByPlate
    ? D.summarizeSimitByPlate(vehicles, simitState?.rows || [])
    : { list: [], withPending: [], cleanCount: vehicles.length, pendingVehicleCount: 0, pendingCount: 0, pendingValue: 0 };
  const total = summary.list.length || 1;
  const pendingPct = Math.round((summary.pendingVehicleCount / total) * 100);
  const kpi = (tone, icon, value, label, hint = "") =>
    `<article class="simit-kpi simit-kpi--${tone}"><span class="simit-kpi__ico">${icon}</span><div><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span>${hint ? `<em>${escapeHtml(hint)}</em>` : ""}</div></article>`;
  const kpis = `<div class="simit-kpis" aria-label="Resumen SIMIT">
      ${kpi(summary.pendingVehicleCount ? "alert" : "ok", ICO.alert, summary.pendingVehicleCount, "Vehículos con pendientes", `${pendingPct}% de la flota`)}
      ${kpi("ok", ICO.check, summary.cleanCount, "Al día en este corte")}
      ${kpi(summary.pendingCount ? "warn" : "neutral", ICO.doc, summary.pendingCount, "Comparendos pendientes")}
      ${kpi(summary.pendingValue ? "alert" : "neutral", ICO.money, money(summary.pendingValue), "Valor pendiente")}
    </div>
    <div class="simit-fleetbar" role="img" aria-label="${summary.pendingVehicleCount} de ${summary.list.length} vehículos con pendientes"><span style="width:${pendingPct}%"></span></div>`;
  const truncated = simitState?.truncated
    ? `<p class="simit-note">La consulta alcanzó el tope de filas de datos abiertos. Refine por pendientes o actualice más tarde.</p>`
    : "";
  const query = String(simitState?.query || "");
  const resultFilter = normalizeSimitResultFilter(simitState?.resultFilter);
  const simitFiltersOn = Boolean(query.trim()) || resultFilter !== "all";
  const visibleList = (summary.list || [])
    .filter((item) => {
      const fn = D?.simitItemPassesFilters;
      if (fn) return fn(item, { search: query, result: resultFilter });
      if (resultFilter === "pending" && !item.hasPending) return false;
      if (resultFilter === "clean" && item.hasPending) return false;
      return true;
    })
    .sort((x, y) => (y.pendingValue || 0) - (x.pendingValue || 0) || String(x.plate).localeCompare(String(y.plate)));
  const pill = (key, label, count) =>
    `<button type="button" class="simit-pill${resultFilter === key ? " is-on" : ""}" data-action="vehicles-simit-result" data-result="${key}" aria-pressed="${resultFilter === key ? "true" : "false"}"><span>${label}</span><b>${count}</b></button>`;
  const simitFilterBar = `<div class="simit-filters">
      <label class="simit-search">${ICO.search}<span class="visually-hidden">Buscar en SIMIT</span>
        <input type="search" data-action="vehicles-simit-search" value="${escapeAttr(query)}" placeholder="Buscar por placa, marca, ciudad o departamento" autocomplete="off" />
      </label>
      <div class="simit-pills" role="group" aria-label="Estado SIMIT de la flota">
        ${pill("all", "Todos", summary.list.length)}${pill("pending", "Con pendientes", summary.pendingVehicleCount)}${pill("clean", "Al día", summary.cleanCount)}
      </div>
      ${simitFiltersOn ? `<button type="button" class="simit-clear" data-action="vehicles-simit-clear">Limpiar filtros</button>` : ""}
    </div>`;
  const rows = visibleList
    .map((item) => {
      const plate = String(item.plate || item.vehicle?.plate || "—").toUpperCase();
      const brand = `${String(item.vehicle?.brand || "").trim()} ${String(item.vehicle?.model || "").trim()}`.trim() || "Vehículo sin marca";
      const chip = item.hasPending
        ? `<span class="simit-chip simit-chip--bad"><i></i>${item.pendingCount} pendiente${item.pendingCount === 1 ? "" : "s"}</span>`
        : `<span class="simit-chip simit-chip--ok"><i></i>Al día</span>`;
      const hasFines = Boolean(item.fines?.length);
      const detail = hasFines ? D.simitFineRowsTableHtml?.(item.fines) || "" : "";
      const head = `<div class="simit-plate" aria-label="Placa ${escapeAttr(plate)}"><span>${escapeHtml(plate)}</span></div>
        <div class="simit-row__who"><strong>${escapeHtml(brand)}</strong><span>${item.lastDateLabel ? `Última multa: ${escapeHtml(item.lastDateLabel)}` : "Sin registros en este alcance"}</span></div>
        <div class="simit-row__chip">${chip}</div>
        <div class="simit-row__value${item.pendingValue ? " is-due" : ""}"><span>Valor pendiente</span><strong>${escapeHtml(money(item.pendingValue))}</strong></div>`;
      return hasFines
        ? `<details class="simit-row${item.hasPending ? " is-pending" : ""}"><summary class="simit-row__head">${head}<span class="simit-row__chev" aria-hidden="true">${ICO.chevron}</span></summary><div class="simit-row__body">${detail}</div></details>`
        : `<div class="simit-row simit-row--static"><div class="simit-row__head">${head}<span class="simit-row__chev simit-row__chev--empty" aria-hidden="true"></span></div></div>`;
    })
    .join("");
  const matchLine = simitFiltersOn
    ? `<p class="simit-match">${visibleList.length} de ${summary.list.length} vehículos</p>`
    : "";
  const list = visibleList.length
    ? `<div class="simit-list">${rows}</div>`
    : emptyState("Ningún vehículo coincide con la búsqueda o el estado SIMIT.");
  return `<div class="simit-pane">${toolbar}${kpis}${truncated}${simitFilterBar}${matchLine}${list}${aboutBlock}</div>`;
}

async function ensureVehiclesSimitLoaded({ force = false } = {}) {
  const D = simitFinesDomain();
  if (!D?.fetchSimitFinesByPlates) {
    state.vehiclesSimit = withSimitUi(state.vehiclesSimit, {
      status: "error",
      error: "El módulo de consulta SIMIT no está disponible. Recargue la página.",
      rows: [],
      truncated: false
    });
    renderPortalView();
    return;
  }
  const vehicles = typeof read === "function" ? read(KEYS.vehicles, []) : [];
  const pendingOnly = state.vehiclesSimit?.pendingOnly !== false;
  const platesKey = vehiclesSimitCacheKey(vehicles, pendingOnly);
  const current = state.vehiclesSimit || emptyVehiclesSimitState();
  const ttl = Number(D.SIMIT_CACHE_TTL_MS) || 15 * 60 * 1000;
  const fetchedMs = current.fetchedAt ? Date.parse(current.fetchedAt) : 0;
  const fresh =
    current.status === "ready" &&
    current.platesKey === platesKey &&
    current.pendingOnly === pendingOnly &&
    Number.isFinite(fetchedMs) &&
    Date.now() - fetchedMs < ttl;
  if (!force && current.status === "loading") return;
  if (!force && fresh) return;
  // Back-off tras error: evita el bucle render → consulta → error → render (cientos de peticiones).
  const failedMs = Number(current.failedAt) || 0;
  if (
    !force &&
    current.status === "error" &&
    current.platesKey === platesKey &&
    current.pendingOnly === pendingOnly &&
    failedMs &&
    Date.now() - failedMs < 60000
  ) {
    return;
  }
  const seq = (state.__vehiclesSimitSeq || 0) + 1;
  state.__vehiclesSimitSeq = seq;
  state.vehiclesSimit = withSimitUi(current, {
    status: "loading",
    platesKey,
    pendingOnly,
    error: null
  });
  renderPortalView();
  let result = null;
  const api = window.AntaresApi;
  if (api?.isConfigured?.() && typeof api.getJson === "function") {
    try {
      const params = new URLSearchParams();
      const plates = D.uniqueSimitPlates
        ? D.uniqueSimitPlates(vehiclesSimitPlates(vehicles))
        : vehiclesSimitPlates(vehicles);
      params.set("plates", plates.join(","));
      params.set("pendingOnly", pendingOnly === false ? "0" : "1");
      result = await api.getJson(`/portal/simit-fines?${params.toString()}`, { timeoutMs: 25000 });
    } catch (_apiErr) {
      result = null;
    }
  }
  const isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(String(window.location?.hostname || ""));
  const apiConfigured = Boolean(api?.isConfigured?.());
  if (!result?.ok && (!apiConfigured || isLocalHost)) {
    // Respaldo directo a datos.gov.co solo sin API configurada o en desarrollo: en producción la CSP lo bloquea.
    result = await D.fetchSimitFinesByPlates(vehiclesSimitPlates(vehicles), { pendingOnly });
  } else if (!result?.ok) {
    result = { ok: false, error: "No se pudo consultar SIMIT desde el servidor. Intente de nuevo en unos minutos." };
  }
  if (state.__vehiclesSimitSeq !== seq) return;
  if (result?.ok) {
    state.vehiclesSimit = withSimitUi(state.vehiclesSimit, {
      status: "ready",
      platesKey,
      pendingOnly,
      fetchedAt: new Date().toISOString(),
      error: null,
      rows: result.rows || [],
      truncated: Boolean(result.truncated)
    });
  } else {
    state.vehiclesSimit = withSimitUi(state.vehiclesSimit, {
      status: "error",
      platesKey,
      pendingOnly,
      fetchedAt: null,
      failedAt: Date.now(),
      error: String(result?.error || "No se pudo consultar SIMIT."),
      rows: [],
      truncated: false
    });
  }
  if (String(state.currentView || "") === "transport-vehicles") renderPortalView();
}

const VEHICLE_TONE_UI = {
  offline: { slug: "no-disponible", label: "No disponible", listClass: "status-fleet-offline" },
  busy: { slug: "ocupado", label: "Ocupado", listClass: "status-fleet-ocupado" },
  scheduled: { slug: "reservado", label: "Reservado", listClass: "status-fleet-programado" },
  available: { slug: "disponible", label: "Disponible", listClass: "status-fleet-disponible" }
};

const VEHICLE_TONE_SEARCH = {
  offline: "no disponible offline",
  busy: "ocupado en curso",
  scheduled: "reservado programado",
  available: "disponible"
};

function normalizeVehicleFleetStatusFilter(raw) {
  return vehicleDomainFn("normalizeVehicleFleetStatusFilter")?.(raw) || "all";
}

function normalizeVehicleFleetTypeFilter(raw) {
  return vehicleDomainFn("normalizeVehicleFleetTypeFilter")?.(raw) || "all";
}

function normalizeVehicleFleetComplianceFilter(raw) {
  return vehicleDomainFn("normalizeVehicleFleetComplianceFilter")?.(raw) || "all";
}

function normalizeVehicleFleetEquipFilter(raw) {
  return vehicleDomainFn("normalizeVehicleFleetEquipFilter")?.(raw) || "all";
}

function normalizeVehicleFleetGpsFilter(raw) {
  return vehicleDomainFn("normalizeVehicleFleetGpsFilter")?.(raw) || "all";
}

function vehicleComplianceState(status) {
  const fn = vehicleDomainFn("vehicleComplianceState");
  if (fn) return fn(status);
  const label = String(status?.label || "").toLowerCase();
  if (label.startsWith("sin fecha") || Number(status?.days) === -9999) return "missing";
  const cls = String(status?.cls || "");
  if (cls === "status-rechazada" || cls === "status-vencida") return "expired";
  if (cls === "status-pendiente") return "soon";
  return "ok";
}

function vehicleOperationalTone(vehicle, occupancyTone) {
  const fn = vehicleDomainFn("vehicleOperationalTone");
  if (fn) return fn(vehicle, occupancyTone);
  if (vehicle && vehicle.available === false && vehicle.autoBusy !== true) return "offline";
  if (occupancyTone === "busy") return "busy";
  if (occupancyTone === "scheduled") return "scheduled";
  return "available";
}

function vehicleDocumentRiskLevel(soatClass, techClass) {
  const fn = vehicleDomainFn("vehicleDocumentRiskLevel");
  if (fn) return fn(soatClass, techClass);
  const classes = [soatClass, techClass].map((item) => String(item || ""));
  if (classes.some((item) => item === "status-rechazada" || item === "status-vencida")) return "expired";
  if (classes.some((item) => item === "status-pendiente")) return "soon";
  return "ok";
}

function vehicleTypeKey(raw) {
  return vehicleDomainFn("vehicleTypeKey")?.(raw) || "other";
}

function vehicleHasActiveGps(vehicle) {
  const fn = vehicleDomainFn("vehicleHasActiveGps");
  if (fn) return fn(vehicle);
  return vehicle?.hasGps === true || String(vehicle?.hasGps || "").trim().toLowerCase() === "true";
}

function compareVehiclesByPlate(a, b) {
  const fn = vehicleDomainFn("compareVehiclesByPlate");
  if (fn) return fn(a, b);
  return String(a?.plate || "").localeCompare(String(b?.plate || ""), "es", { numeric: true, sensitivity: "base" });
}

function vehiclePassesFleetFilters(item, filters) {
  const fn = vehicleDomainFn("vehiclePassesFleetFilters");
  if (fn) return fn(item, filters);
  return true;
}

function validateVehicleFormPayload(data, vehicles, options) {
  const fn = vehicleDomainFn("validateVehicleFormPayload");
  if (!fn) {
    return { ok: false, field: "plate", message: "No se pudo validar la ficha del vehículo. Recargue la página." };
  }
  return fn(data, vehicles, options);
}

function vehicleFleetSearchText(vehicle) {
  const blob = vehicleDomainFn("vehicleSearchBlob")?.(vehicle);
  if (blob) return blob;
  return vehicleFleetSearchHaystack(vehicle);
}

function showVehicleFormIssue(formEl, fieldName, message) {
  if (formEl && fieldName) {
    const field = formEl.querySelector(`[name="${fieldName}"]`);
    const stepIndex = field?.closest?.(".hr-form-step")?.getAttribute?.("data-step-index");
    if (stepIndex != null) formEl.querySelector(`[data-hr-wizard-dot="${stepIndex}"]`)?.click();
    if (typeof failPortalField === "function") {
      failPortalField(formEl, fieldName, message);
      return;
    }
  }
  if (typeof notify === "function") notify(message, "error");
}

function withVehicleDocExpiryDefaults(data) {
  const next = { ...(data || {}) };
  if (next.soatExpeditionDate && (!next.soatExpiryDate || !String(next.soatExpiryDate).trim())) {
    next.soatExpiryDate = addCalendarYearsIsoDate(next.soatExpeditionDate, 1) || next.soatExpiryDate;
  }
  if (next.techInspectionExpeditionDate && (!next.techInspectionExpiryDate || !String(next.techInspectionExpiryDate).trim())) {
    next.techInspectionExpiryDate = addCalendarYearsIsoDate(next.techInspectionExpeditionDate, 1) || next.techInspectionExpiryDate;
  }
  return next;
}

/** Alinea Termoking con la carrocería del catálogo (Termoking ↔ carga seca). */
function bindVehicleTermokingBodySync(formEl) {
  if (!formEl || formEl.dataset.vehicleTermokingBound === "1") return;
  const bodyEl = formEl.querySelector("[name='bodyType']");
  const refrEl = formEl.querySelector("[name='refrigerated']");
  if (!bodyEl || !refrEl) return;
  formEl.dataset.vehicleTermokingBound = "1";
  const impliesTk = (raw) => vehicleDomainFn("bodyTypeImpliesTermoking")?.(raw) ?? /termoking|refrigerad/i.test(String(raw || ""));
  const impliesDry = (raw) => vehicleDomainFn("bodyTypeImpliesDryCargo")?.(raw) ?? /furgon seco|carga seca/i.test(String(raw || ""));
  const sync = () => {
    const body = String(bodyEl.value || "");
    if (impliesTk(body) && refrEl.value !== "true") {
      refrEl.value = "true";
      refrEl.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (impliesDry(body) && refrEl.value !== "false") {
      refrEl.value = "false";
      refrEl.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };
  bodyEl.addEventListener("change", sync);
  sync();
}

/** Proveedor y credenciales GPS solo aplican con rastreo activo. */
function bindVehicleGpsDependentFields(formEl) {
  if (!formEl || formEl.dataset.vehicleGpsBound === "1") return;
  const hasGpsEl = formEl.querySelector("[name='hasGps']");
  const providerEl = formEl.querySelector("[name='gpsProvider']");
  if (!hasGpsEl || !providerEl) return;
  formEl.dataset.vehicleGpsBound = "1";
  const dependents = [...formEl.querySelectorAll("[data-vehicle-gps-dependent], [name='gpsProvider'], [name='satelliteProviderUser'], [name='satelliteProviderPassword']")];
  const sync = () => {
    const on = String(hasGpsEl.value || "") === "true";
    providerEl.required = on;
    if (on) providerEl.setAttribute("required", "required");
    else providerEl.removeAttribute("required");
    dependents.forEach((node) => {
      const field = node.matches("input, select, textarea") ? node : node.querySelector("input, select, textarea");
      if (!field) return;
      field.disabled = !on;
      field.setAttribute("aria-disabled", on ? "false" : "true");
      if (!on && field.name !== "satelliteProviderPassword") {
        /* En alta, limpia proveedor/usuario al desactivar GPS. En edición la contraseña ya viaja vacía. */
        if (field.name === "gpsProvider" || field.name === "satelliteProviderUser") field.value = "";
      }
      if (!on && field.name === "satelliteProviderPassword") field.value = "";
    });
    formEl.querySelectorAll("[data-vehicle-gps-dependent]").forEach((label) => {
      label.classList.toggle("is-disabled", !on);
      label.toggleAttribute("hidden", false);
      label.style.opacity = on ? "" : "0.55";
    });
  };
  hasGpsEl.addEventListener("change", sync);
  sync();
}

function bindVehicleCreateFormExtras(formEl) {
  if (!formEl) return;
  bindVehicleDocExpiryAutoFill(formEl);
  bindVehicleTermokingBodySync(formEl);
  bindVehicleGpsDependentFields(formEl);
}

function vehicleRecordFromVerdict(base, value) {
  const text = (item) =>
    typeof normalizeLatinUpperForDb === "function" ? normalizeLatinUpperForDb(item) : String(item || "").trim();
  const next = {
    ...base,
    plate: value.plate,
    brand: text(value.brand),
    model: text(value.model),
    year: value.year,
    type: value.type,
    color: text(value.color),
    capacityKg: value.capacityKg,
    refrigerated: value.refrigerated,
    bodyType: text(value.bodyType),
    fuelType: text(value.fuelType),
    axleConfig: text(value.axleConfig),
    engineNumber: text(value.engineNumber),
    vin: value.vin,
    ownershipCard: text(value.ownershipCard),
    soatExpeditionDate: value.soatExpeditionDate,
    soatExpiryDate: value.soatExpiryDate,
    techInspectionExpeditionDate: value.techInspectionExpeditionDate,
    techInspectionExpiryDate: value.techInspectionExpiryDate,
    rcPolicyContract: text(value.rcPolicyContract),
    rcPolicyExtra: text(value.rcPolicyExtra),
    rcPolicyExpiry: value.rcPolicyExpiry || "",
    hasGps: value.hasGps,
    gpsProvider: text(value.gpsProvider),
    satelliteProviderUser: String(value.satelliteProviderUser || "").trim()
  };
  if (String(value.satelliteProviderPassword || "").trim()) {
    next.satelliteProviderPassword = String(value.satelliteProviderPassword).trim();
    next.satelliteProviderPasswordSet = true;
  }
  return next;
}

const VEHICLE_TYPE_FILTER_ORDER = ["camion", "turbo", "tractomula", "bus", "other"];
const VEHICLE_TYPE_FILTER_LABEL = {
  camion: "Camión",
  turbo: "Turbo",
  tractomula: "Tractomula",
  bus: "Bus",
  other: "Otro"
};

function fleetFilterSelect(filter, label, value, options) {
  const opts = options
    .map(([id, text]) => `<option value="${escapeAttr(id)}"${id === value ? " selected" : ""}>${escapeHtml(text)}</option>`)
    .join("");
  return `<label class="vehicle-fleet-filter">
    <span class="muted">${escapeHtml(label)}</span>
    <select data-action="vehicles-fleet-filter" data-filter="${escapeAttr(filter)}" aria-label="${escapeAttr(label)}">${opts}</select>
  </label>`;
}

function countedFilterOptions(allLabel, entries, active) {
  const options = [["all", allLabel]];
  entries.forEach(([id, label, count]) => {
    if (!count && id !== active) return;
    options.push([id, `${label} (${count})`]);
  });
  return options;
}

function fleetStatusPills(active, counts) {
  const items = [
    ["all", "Todos", counts.total],
    ["available", "Disponibles", counts.available],
    ["busy", "Ocupados", counts.occupied],
    ["scheduled", "Reservados", counts.scheduled],
    ["offline", "No disponibles", counts.offline]
  ];
  return `<div class="ops-filters-bar vehicle-fleet-status" role="group" aria-label="Disponibilidad de la flota">${items
    .map(([id, label, count]) => {
      const on = id === active;
      return `<button type="button" class="ops-filter-pill${on ? " is-active" : ""}" data-action="vehicles-fleet-status" data-status="${escapeAttr(id)}" aria-pressed="${on ? "true" : "false"}"><span>${escapeHtml(label)}</span><strong>${count}</strong></button>`;
    })
    .join("")}</div>`;
}

function vehiclesHtml() {
  const vehicles = read(KEYS.vehicles, []).slice().sort(compareVehiclesByPlate);
  const drivers = read(KEYS.drivers, []);
  const vehiclesUi = state.vehiclesUi || { workspace: "data", section: "fleet" };
  const fleetSearchRaw = String(vehiclesUi.fleetSearch ?? "");
  const fleetSearchNorm = fleetSearchRaw.trim().toLowerCase();
  const fleetLayout = normalizeVehicleFleetLayout(vehiclesUi.fleetLayout);
  const statusFilter = normalizeVehicleFleetStatusFilter(vehiclesUi.statusFilter);
  const typeFilter = normalizeVehicleFleetTypeFilter(vehiclesUi.typeFilter);
  const soatFilter = normalizeVehicleFleetComplianceFilter(vehiclesUi.soatFilter);
  const techFilter = normalizeVehicleFleetComplianceFilter(vehiclesUi.techFilter);
  const equipFilter = normalizeVehicleFleetEquipFilter(vehiclesUi.equipFilter);
  const gpsFilter = normalizeVehicleFleetGpsFilter(vehiclesUi.gpsFilter);
  const vehicleRenderWindowSize = Number(window.RENDER_WINDOW_SIZE) || 30;
  const vehicleRenderLimit = Number(state.vehiclesRenderLimit) || vehicleRenderWindowSize;
  let filteredVehicles = vehicles;
  let visibleVehicles = vehicles.slice(0, vehicleRenderLimit);
  let vehiclesMoreBar = "";
  const canEditVeh = canEditVehicle();
  const canToggleVeh = canToggleVehicleStatus();
  const canDeleteVeh = canDeleteVehicle();
  const canCreateVeh = canCreateVehicle();
  const canFuelLogs = hasPermission(currentUser(), PERMISSIONS.TRANSPORT_HISTORY);
  const canTechnicalLogs = canFuelLogs;
  const vehicleOperateTabs = [];
  if (canCreateVeh) vehicleOperateTabs.push({ id: "create", label: "Registrar vehículo" });
  if (canFuelLogs) vehicleOperateTabs.push({ id: "fuel", label: "Combustible", count: readFuelLogs().length });
  if (canTechnicalLogs) vehicleOperateTabs.push({ id: "technical", label: "Taller", count: readVehicleTechnicalLogs().length });
  let vehicleWorkspace = normalizeVehicleWorkspace(vehiclesUi.workspace);
  let vehicleSection = resolveVehicleSection(vehiclesUi);
  if (vehicleWorkspace === "operate" && !vehicleOperateTabs.length) {
    vehicleWorkspace = "data";
    vehicleSection = "fleet";
  } else if (vehicleWorkspace === "operate" && !vehicleOperateTabs.some((tab) => tab.id === vehicleSection)) {
    vehicleSection = String(vehicleOperateTabs[0]?.id || "fleet");
    if (!vehicleOperateTabs.length) {
      vehicleWorkspace = "data";
      vehicleSection = "fleet";
    }
  }
  if (vehicleWorkspace === "data" && !isVehicleDataSection(vehicleSection)) vehicleSection = "fleet";
  const vehiclesCreateUi = buildVehiclesCreatePanelsState(
    vehicleWorkspace === "operate" ? vehicleSection : "create",
    state.createPanels || {},
    {
      expandActive: false
    }
  );
  state.vehiclesUi = {
    ...vehiclesUi,
    workspace: vehicleWorkspace,
    section: vehicleSection,
    fleetSearch: fleetSearchRaw,
    fleetLayout,
    statusFilter,
    typeFilter,
    soatFilter,
    techFilter,
    equipFilter,
    gpsFilter
  };
  const activeTrips = getActiveTrips();
  const activeTripsByVehicleId = new Map();
  activeTrips.forEach((r) => {
    const key = String(r.trip?.vehicleId || "").trim();
    if (!key) return;
    if (!activeTripsByVehicleId.has(key)) activeTripsByVehicleId.set(key, []);
    activeTripsByVehicleId.get(key).push(r);
  });
  const nowTs = Date.now();
  const resolveVehicleOccupancy = (vehicleId) => {
    const list = activeTripsByVehicleId.get(String(vehicleId)) || [];
    if (!list.length) return { tone: "available", trip: null, detail: "Sin viaje activo" };
    const ongoing = list.find((r) => describeTripTimingVsNow(r, nowTs).timing === "ongoing") || null;
    if (ongoing) {
      const ongoingInfo = describeTripTimingVsNow(ongoing, nowTs);
      return {
        tone: "busy",
        trip: ongoing,
        overdue: Boolean(ongoingInfo.overdue),
        detail: formatTripOngoingDetail(ongoingInfo)
      };
    }
    const upcoming = list
      .map((r) => ({ r, info: describeTripTimingVsNow(r, nowTs) }))
      .filter((x) => x.info.timing === "upcoming")
      .sort((a, b) => parseNum(a.info.minutes) - parseNum(b.info.minutes))[0];
    if (upcoming) {
      return {
        tone: "scheduled",
        trip: upcoming.r,
        detail: `Reservado · inicia en ${formatTripMinutes(upcoming.info.minutes)}`
      };
    }
    const latestPast = list
      .map((r) => ({ r, info: describeTripTimingVsNow(r, nowTs) }))
      .filter((x) => x.info.timing === "past")
      .sort((a, b) => parseNum(a.info.minutes) - parseNum(b.info.minutes))[0];
    if (latestPast) {
      return {
        tone: "available",
        trip: latestPast.r,
        detail: `Último viaje terminó hace ${formatTripMinutes(latestPast.info.minutes)}`
      };
    }
    return { tone: "available", trip: list[0] || null, detail: "Sin cruce horario activo" };
  };
  const fleetViews = vehicles.map((v) => {
    const occupancy = resolveVehicleOccupancy(v.id);
    const soat = docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
    const tec = docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
    const tone = vehicleOperationalTone(v, occupancy.tone);
    const docLevel = vehicleDocumentRiskLevel(soat.cls, tec.cls);
    return {
      vehicle: v,
      occupancy,
      soat,
      tec,
      tone,
      docLevel,
      soatState: vehicleComplianceState(soat),
      techState: vehicleComplianceState(tec),
      typeKey: vehicleTypeKey(v.type),
      refrigerated: vehicleHasTermokingEquipment(v),
      gps: vehicleHasActiveGps(v),
      searchBlob: `${vehicleFleetSearchText(v)} ${VEHICLE_TONE_SEARCH[tone] || ""} ${soat.label} ${tec.label}`
    };
  });
  const vehicleViewById = new Map(fleetViews.map((row) => [String(row.vehicle.id || ""), row]));
  const totalCount = vehicles.length;
  const availableCount = fleetViews.filter((row) => row.tone === "available").length;
  const occupiedCount = fleetViews.filter((row) => row.tone === "busy").length;
  const scheduledCount = fleetViews.filter((row) => row.tone === "scheduled").length;
  const offlineCount = fleetViews.filter((row) => row.tone === "offline").length;
  const thermokingCount = vehicles.filter((v) => vehicleHasTermokingEquipment(v)).length;
  const documentRiskCount = fleetViews.filter((row) => row.docLevel !== "ok").length;
  filteredVehicles = fleetViews
    .filter((row) =>
      vehiclePassesFleetFilters(row, {
        search: fleetSearchRaw,
        status: statusFilter,
        type: typeFilter,
        soat: soatFilter,
        tech: techFilter,
        equip: equipFilter,
        gps: gpsFilter
      })
    )
    .map((row) => row.vehicle);
  visibleVehicles = filteredVehicles.slice(0, vehicleRenderLimit);
  vehiclesMoreBar =
    typeof renderWindowMoreBar === "function"
      ? renderWindowMoreBar(filteredVehicles.length, visibleVehicles.length, "vehicles-render-more")
      : filteredVehicles.length > visibleVehicles.length
        ? `<div class="render-window-more"><button type="button" class="btn btn-outline btn-sm" data-action="vehicles-render-more">Ver más · mostrando ${visibleVehicles.length} de ${filteredVehicles.length}</button></div>`
        : "";
  const fleetFiltersActive =
    Boolean(fleetSearchNorm) ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    soatFilter !== "all" ||
    techFilter !== "all" ||
    equipFilter !== "all" ||
    gpsFilter !== "all";
  const vehicleCards = visibleVehicles
    .map((v) => {
      const view = vehicleViewById.get(String(v.id || "")) || {};
      const soat = view.soat || docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
      const tecno = view.tec || docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
      const isRefrigerated = vehicleHasTermokingEquipment(v);
      const occupancy = view.occupancy || resolveVehicleOccupancy(v.id);
      const toneUi = VEHICLE_TONE_UI[view.tone] || VEHICLE_TONE_UI.available;
      const occupancySlug = toneUi.slug;
      const availabilityLabel = toneUi.label;
      const plate = String(v.plate || "—").toUpperCase();
      const typeLabel = String(v.type || "Vehículo").trim().toUpperCase() || "VEHÍCULO";
      const brandTitle =
        `${String(v.brand || "").trim()}${v.brand && v.model ? " " : ""}${String(v.model || "").trim()}`.trim() || "Sin marca/modelo";
      const yearLabel = v.year ? String(v.year) : "";
      const soatTone = directoryToneFromBucket(soat.cls);
      const tecnoTone = directoryToneFromBucket(tecno.cls);
      const gpsEnabled = vehicleHasActiveGps(v);
      const gpsProvider = String(v.gpsProvider || "").trim();
      const gpsSubLabel = gpsEnabled ? gpsProvider || "Trazabilidad activa" : "Sin trazabilidad";
      const tripClient = occupancy.trip
        ? String(occupancy.trip.clientName || occupancy.trip.companyName || occupancy.trip.request?.clientName || "").trim()
        : "";
      const occupancyDetail = view.tone === "offline"
        ? "Marcado manualmente como no disponible"
        : tripClient || occupancy.detail;
      const capacityLabel = parseNum(v.capacityKg) > 0 ? `${parseNum(v.capacityKg).toLocaleString("es-CO")} kg` : "Sin capacidad";
      const ownershipCardLabel = String(v.ownershipCard || "").trim() || "Sin tarjeta";
      const bodyTypeLabel = String(v.bodyType || "").trim() || "Sin carrocería";
      const lastUpdateLabel = formatPortalOpsCardTimestamp(v.updatedAt || v.createdAt || "");
      const statusBadgeHtml = buildPortalOpsCardStatusPill(availabilityLabel, occupancySlug);
      const termokingBadgeHtml = isRefrigerated
        ? `<span class="portal-ops-card-doc-pill portal-ops-card-doc-pill--ok vehicle-card-equip-pill vehicle-card-equip-pill--tk" title="Equipo Termoking">
            <span class="vehicle-card-equip-pill__icon" aria-hidden="true">❄</span>
            <span>TERMOKING</span>
          </span>`
        : "";
      const primaryButtons = [
        `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--outline" data-action="view-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Ver ficha técnica del vehículo">${IC.eye} Ver detalles</button>`,
        canEditVeh
          ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--solid" data-action="edit-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Editar datos del vehículo">${IC.edit} Editar información</button>`
          : ""
      ]
        .filter(Boolean)
        .join("");
      const fullWidthButtons = [
        canToggleVeh
          ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--soft" data-action="toggle-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Alternar disponibilidad manual">${IC.toggle} Cambiar estado</button>`
          : "",
        canDeleteVeh
          ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--danger" data-action="delete-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Eliminar del catálogo">${IC.trash} Eliminar camión</button>`
          : ""
      ]
        .filter(Boolean)
        .join("");
      const fullWidthActionsHtml = fullWidthButtons
        ? `<div class="portal-ops-card-actions-stack">${fullWidthButtons}</div>`
        : "";
      return `<article class="trip-ops-card portal-ops-card trip-ops-card--vehicle trip-ops-card--vehicle-${escapeAttr(occupancySlug)}" data-vehicle-id="${escapeAttr(String(v.id || ""))}">
        <header class="trip-ops-card-head trip-ops-card-head--vehicle">
          <div class="trip-ops-card-head-main">
            <div class="vehicle-plate-badge" title="Placa ${escapeAttr(plate)}" aria-label="Placa ${escapeAttr(plate)}">
              <span class="vehicle-plate-badge__icon" aria-hidden="true">${IC.truck}</span>
              <span class="vehicle-plate-badge__text">${escapeHtml(plate)}</span>
            </div>
            <div class="trip-ops-card-head-info">
              <p class="trip-ops-card-kicker">${escapeHtml(typeLabel)}</p>
              <h4 aria-level="3" class="trip-ops-card-title vehicle-plate-title" title="${escapeAttr(brandTitle)}">${escapeHtml(brandTitle)}</h4>
              ${yearLabel ? `<p class="vehicle-card-year">${escapeHtml(yearLabel)}</p>` : ""}
            </div>
          </div>
          <div class="portal-ops-card-badges vehicle-card-badges">
            ${statusBadgeHtml}
            ${termokingBadgeHtml}
          </div>
        </header>
        <div class="vehicle-availability-bar portal-ops-card-highlight vehicle-availability-bar--${escapeAttr(occupancySlug)}" role="status">
          <div class="vehicle-availability-bar__main">
            <span class="vehicle-availability-bar__dot portal-ops-card-highlight__dot" aria-hidden="true"></span>
            <div class="vehicle-availability-bar__copy portal-ops-card-highlight__copy">
              <strong>${escapeHtml(availabilityLabel)}</strong>
              <span class="vehicle-availability-bar__detail">${escapeHtml(occupancyDetail)}</span>
            </div>
          </div>
          <div class="vehicle-availability-bar__update" title="Última actualización: ${escapeAttr(lastUpdateLabel)}">
            <span class="vehicle-availability-bar__update-label">${IC.calendar}<span>Actualización</span></span>
            <strong>${escapeHtml(lastUpdateLabel)}</strong>
          </div>
        </div>
        <div class="trip-ops-card-grid portal-ops-card-spec-grid vehicle-card-spec-grid">
          ${buildPortalOpsCardGridItem("Capacidad", IC.scale, capacityLabel)}
          ${buildPortalOpsCardGridItem("Carrocería", IC.package || IC.file, bodyTypeLabel)}
          ${buildPortalOpsCardGridItem("SOAT", IC.shield, soat.label, { tone: soatTone })}
          ${buildPortalOpsCardGridItem("Tecnomecánica", IC.file, tecno.label, { tone: tecnoTone })}
          ${buildPortalOpsCardGridItem("GPS", IC.mapPin, gpsEnabled ? "Activo" : "Inactivo", { tone: gpsEnabled ? "ok" : "warn", subValue: gpsSubLabel, subTone: gpsEnabled ? "ok" : "warn" })}
          ${buildPortalOpsCardGridItem("Tarjeta de propiedad", IC.card, ownershipCardLabel)}
        </div>
        ${buildPortalOpsCardActions(primaryButtons, fullWidthActionsHtml)}
        ${buildPortalOpsCardFoot("Última actualización", lastUpdateLabel)}
      </article>`;
    })
    .join("");
  const bodyTypeOptions = selectOptionsFromCatalog(CO_CATALOGS.bodyTypes);
  const fuelTypeOptions = selectOptionsFromCatalog(CO_CATALOGS.fuelTypes);
  const axleOptions = selectOptionsFromCatalog(CO_CATALOGS.axleConfig);
  const colorOptions = selectOptionsFromCatalog(CO_CATALOGS.vehicleColors);
  const vehicleSelectOptions = vehicles
    .map((v) => `<option value="${escapeAttr(String(v.id || ""))}">${escapeHtml(`${String(v.plate || "").toUpperCase()} · ${String(v.type || "Vehículo")}`)}</option>`)
    .join("");
  const driverSelectOptions = drivers
    .map((d) => `<option value="${escapeAttr(String(d.id || ""))}">${escapeHtml(String(d.name || "Conductor"))}</option>`)
    .join("");
  const todayIsoDate = nowIso().slice(0, 10);
  const fuelLogsCount = readFuelLogs().length;
  const technicalLogsCount = readVehicleTechnicalLogs().length;
  const formBody =
    typeof window.AppModules?.vehicles?.vehicleCreateFormBodyHtml === "function"
      ? window.AppModules.vehicles.vehicleCreateFormBodyHtml({
          bodyTypeOptions,
          fuelTypeOptions,
          axleOptions,
          colorOptions,
          currentYear: new Date().getFullYear()
        })
      : "";
  const vehicleListRows = visibleVehicles
    .map((v) => {
      const view = vehicleViewById.get(String(v.id || "")) || {};
      const soat = view.soat || docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
      const tecno = view.tec || docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
      const isRefrigerated = vehicleHasTermokingEquipment(v);
      const toneUi = VEHICLE_TONE_UI[view.tone] || VEHICLE_TONE_UI.available;
      const availabilityTag = `<span class="status ${toneUi.listClass}">${escapeHtml(toneUi.label)}</span>`;
      const plate = String(v.plate || "—").toUpperCase();
      const typeLabel = String(v.type || "Vehículo").trim() || "Vehículo";
      const brandModel =
        `${String(v.brand || "").trim()}${v.brand && v.model ? " · " : ""}${String(v.model || "").trim()}${v.year ? ` · ${v.year}` : ""}`.trim() ||
        "—";
      const capacityLabel = parseNum(v.capacityKg) > 0 ? `${parseNum(v.capacityKg).toLocaleString("es-CO")} kg` : "—";
      const cold = isRefrigerated ? "TK" : "Seco";
      return `<tr data-vehicle-id="${escapeAttr(String(v.id || ""))}">
        <td data-label="Placa"><strong class="vehicle-fleet-list-plate">${escapeHtml(plate)}</strong><div class="muted vehicle-fleet-list-sub">${escapeHtml(typeLabel)} · ${escapeHtml(cold)}</div></td>
        <td data-label="Marca / modelo">${escapeHtml(brandModel)}</td>
        <td data-label="Estado">${availabilityTag}</td>
        <td data-label="SOAT"><span class="vehicle-fleet-list-doc">${escapeHtml(soat.label)}</span></td>
        <td data-label="Tecno"><span class="vehicle-fleet-list-doc">${escapeHtml(tecno.label)}</span></td>
        <td data-label="Cap.">${escapeHtml(capacityLabel)}</td>
        <td data-label="Acciones" class="vehicle-fleet-list-actions"><div class="toolbar">
          <button type="button" class="btn btn-sm btn-outline" data-action="view-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Ver ficha">${IC.eye} Ver</button>
          ${canEditVeh ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-vehicle" data-id="${escapeAttr(String(v.id || ""))}">${IC.edit} Editar</button>` : ""}
          ${canToggleVeh ? `<button type="button" class="btn btn-sm btn-action" data-action="toggle-vehicle" data-id="${escapeAttr(String(v.id || ""))}">${IC.toggle} Estado</button>` : ""}
          ${canDeleteVeh ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-vehicle" data-id="${escapeAttr(String(v.id))}">${IC.trash} Eliminar</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");
  const typeCounts = new Map();
  fleetViews.forEach((row) => {
    const key = row.typeKey || "other";
    typeCounts.set(key, (typeCounts.get(key) || 0) + 1);
  });
  const complianceEntries = (field) =>
    [
      ["ok", "Vigente"],
      ["soon", "Por vencer"],
      ["expired", "Vencido"],
      ["missing", "Sin fecha"]
    ].map(([id, label]) => [id, label, fleetViews.filter((row) => row[field] === id).length]);
  const fleetToolbar =
    totalCount > 0
      ? `<div class="vehicle-fleet-toolbar">
      <div class="vehicle-fleet-toolbar-top">
        <label class="transport-ops-search">
          <span class="muted">${IC.search || IC.eye} Buscar en flota</span>
          <input type="search" data-action="vehicles-fleet-search" value="${escapeAttr(fleetSearchRaw)}" placeholder="Placa, marca, modelo, VIN, SOAT, GPS, tarjeta…" autocomplete="off" />
        </label>
        <div class="vehicle-fleet-view-field">
          <span class="muted">${IC.layers || IC.grid || ""} Vista</span>
          <div class="transport-ops-layout" role="group" aria-label="Vista de flota">
            <button type="button" class="btn btn-sm ${fleetLayout === "cards" ? "btn-primary" : "btn-outline"}" data-action="vehicles-fleet-layout" data-layout="cards">Tarjetas</button>
            <button type="button" class="btn btn-sm ${fleetLayout === "list" ? "btn-primary" : "btn-outline"}" data-action="vehicles-fleet-layout" data-layout="list">Lista</button>
          </div>
        </div>
      </div>
      ${fleetStatusPills(statusFilter, {
        total: totalCount,
        available: availableCount,
        occupied: occupiedCount,
        scheduled: scheduledCount,
        offline: offlineCount
      })}
      <div class="vehicle-fleet-selects">
        ${fleetFilterSelect(
          "type",
          "Tipo",
          typeFilter,
          countedFilterOptions(
            "Todos los tipos",
            VEHICLE_TYPE_FILTER_ORDER.map((key) => [key, VEHICLE_TYPE_FILTER_LABEL[key] || key, typeCounts.get(key) || 0]),
            typeFilter
          )
        )}
        ${fleetFilterSelect(
          "equip",
          "Equipo",
          equipFilter,
          countedFilterOptions(
            "Todo el equipo",
            [
              ["termoking", "Termoking", thermokingCount],
              ["dry", "Carga seca", totalCount - thermokingCount]
            ],
            equipFilter
          )
        )}
        ${fleetFilterSelect("soat", "SOAT", soatFilter, countedFilterOptions("Todo el SOAT", complianceEntries("soatState"), soatFilter))}
        ${fleetFilterSelect("tech", "Tecnomecánica", techFilter, countedFilterOptions("Toda la tecnomecánica", complianceEntries("techState"), techFilter))}
        ${fleetFilterSelect(
          "gps",
          "GPS",
          gpsFilter,
          countedFilterOptions(
            "Todo el GPS",
            [
              ["on", "Activo", fleetViews.filter((row) => row.gps).length],
              ["off", "Inactivo", fleetViews.filter((row) => !row.gps).length]
            ],
            gpsFilter
          )
        )}
      </div>
      ${fleetFiltersActive ? `<div class="vehicle-fleet-toolbar-clear"><button type="button" class="btn btn-sm btn-outline" data-action="vehicles-fleet-clear">${IC.x || ""} Limpiar filtros</button></div>` : ""}
    </div>`
      : "";
  const fleetListTable =
    fleetLayout === "list" && filteredVehicles.length > 0
      ? `<div class="table-wrap vehicle-fleet-list-wrap"><table class="vehicle-fleet-table">
    <thead><tr>
      <th>Placa</th><th>Marca / modelo</th><th>Estado</th><th>SOAT</th><th>Tecnomecánica</th><th>Capacidad</th><th>Acciones</th>
    </tr></thead>
    <tbody>${vehicleListRows}</tbody>
  </table></div>`
      : "";
  const fleetCardsGrid = fleetLayout === "cards" && vehicleCards ? `<div class="trip-ops-cards portal-ops-cards vehicle-ops-cards">${vehicleCards}</div>` : "";
  let fleetMainBody;
  if (!totalCount) {
    fleetMainBody = emptyState("No hay vehículos registrados.");
  } else if (!filteredVehicles.length) {
    fleetMainBody = `${fleetToolbar}${emptyState("Ningún vehículo coincide con la búsqueda o los filtros. Pruebe otras palabras o límpielos.")}`;
  } else {
    fleetMainBody = `${fleetToolbar}${fleetLayout === "list" ? fleetListTable : fleetCardsGrid}${vehiclesMoreBar}`;
  }
  const fleetCardSubtitle = fleetFiltersActive
    ? `${filteredVehicles.length} de ${totalCount} vehículos${filteredVehicles.length > visibleVehicles.length ? ` · ${visibleVehicles.length} visibles` : ""}`
    : fleetLayout === "list"
      ? `${totalCount} vehículos · vista lista${filteredVehicles.length > visibleVehicles.length ? ` · ${visibleVehicles.length} visibles` : ""}`
      : `${totalCount} vehículos${filteredVehicles.length > visibleVehicles.length ? ` · ${visibleVehicles.length} visibles` : ""}`;
  const heroStrip = moduleFleetHeroStrip([
    { label: "Flota", value: totalCount },
    { label: "Disponibles", value: availableCount },
    { label: "Ocupados", value: occupiedCount, tone: occupiedCount ? "warn" : undefined },
    { label: "Reservados", value: scheduledCount },
    { label: "No disponibles", value: offlineCount },
    { label: "Termoking", value: thermokingCount },
    { label: "Docs riesgo", value: documentRiskCount, tone: documentRiskCount ? "alert" : undefined }
  ]);
  const vehiclesHrTabs = [
    ...(vehicleOperateTabs.length
      ? [{ id: "operate", label: "Registrar", icon: "plus", hint: "Alta de flota, combustible y taller" }]
      : []),
    { id: "data", label: "Consultar", icon: "eye", hint: "Flota y disponibilidad" }
  ];
  const vehiclesTabsNav = renderHrWorkspaceTabs({
    module: "transport-vehicles",
    ariaLabel: "Secciones del módulo Transporte · Camiones",
    activeId: vehicleWorkspace,
    variant: "switch",
    tabs: vehiclesHrTabs
  });
  const vehiclesWorkspaceHeader = renderHrWorkspaceHeader(heroStrip, vehiclesTabsNav, "payroll");
  const vehiclesEnabledSections = vehicleOperateTabs.map((tab) => String(tab.id || ""));
  const vehicleOperateNav = renderVehiclesOperateSectionNav(vehicleSection, {
    enabledSections: vehiclesEnabledSections
  });
  const simitSummary = simitFinesDomain()?.summarizeSimitByPlate?.(vehicles, state.vehiclesSimit?.rows || []);
  const simitPendingCount =
    state.vehiclesSimit?.status === "ready" && simitSummary ? simitSummary.pendingVehicleCount : null;
  const vehicleDataNav = renderModuleWindowTabs({
    ariaLabel: "Consultas de flota",
    activeId: vehicleSection,
    action: "vehicles-section",
    valueAttr: "section",
    tabs: [
      { id: "fleet", label: "Flota", count: vehicles.length },
      { id: "fotomultas", label: "Fotomultas SIMIT", count: simitPendingCount }
    ]
  });
  const fuelFormBody = vehicles.length
    ? historyFleetFuelFormHtml(todayIsoDate, vehicleSelectOptions, driverSelectOptions)
    : emptyState("Registre al menos un camión en la flota para cargar combustible.");
  const technicalFormBody = vehicles.length
    ? historyFleetTechnicalFormHtml(todayIsoDate, vehicleSelectOptions)
    : emptyState("Registre al menos un camión en la flota para registrar novedades de taller.");
  const createPanel = canCreateVeh
    ? `<div class="auth-tab-panel${vehicleSection === "create" ? "" : " hidden"}" data-vehicle-operate-pane="create">${createHrActionCard("create-vehicle", "truck", "Registrar vehículo", "Ficha técnica, documentación legal y trazabilidad GPS (Colombia)", formBody, "Abrir ficha", { createPanels: vehiclesCreateUi })}</div>`
    : "";
  const fuelPanel = canFuelLogs
    ? `<div class="auth-tab-panel${vehicleSection === "fuel" ? "" : " hidden"}" data-vehicle-operate-pane="fuel">${createHrActionCard("create-fuel-log", "fuel", "Combustible", `${fuelLogsCount} carga${fuelLogsCount === 1 ? "" : "s"} registrada${fuelLogsCount === 1 ? "" : "s"} — litros, costo y estación`, fuelFormBody, "Abrir registro", { createPanels: vehiclesCreateUi })}</div>`
    : "";
  const technicalPanel = canTechnicalLogs
    ? `<div class="auth-tab-panel${vehicleSection === "technical" ? "" : " hidden"}" data-vehicle-operate-pane="technical">${createHrActionCard("create-technical-log", "activity", "Taller", `${technicalLogsCount} novedad${technicalLogsCount === 1 ? "" : "es"} de mantenimiento — preventivo o correctivo`, technicalFormBody, "Abrir formulario", { createPanels: vehiclesCreateUi })}</div>`
    : "";
  const vehicleRailCollapsed = isOperateRailCollapsed("vehicles");
  const vehicleOperatePanel =
    vehicleOperateTabs.length > 0
      ? `<div class="hr-workspace-panel vehicles-workspace-panel${vehicleWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-vehicle-panel="operate">
      <section class="vehicles-operate vehicles-operate-panel${vehicleRailCollapsed ? " is-rail-collapsed" : ""}">
        <aside class="vehicles-operate__rail" aria-label="Trámites de registro">
          <div class="vehicles-operate__rail-head">
            <p class="vehicles-operate__rail-label">Tipo de trámite</p>
            <button type="button" class="vehicles-operate__rail-toggle" data-action="vehicles-operate-rail-toggle" aria-expanded="${vehicleRailCollapsed ? "false" : "true"}" title="${vehicleRailCollapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite"}">
              <span class="vehicles-operate__rail-toggle-ico" aria-hidden="true">${IC.chevronLeft}</span>
            </button>
          </div>
          ${vehicleOperateNav}
        </aside>
        <div class="vehicles-operate__main auth-tab-panels">${createPanel}${fuelPanel}${technicalPanel}</div>
      </section>
    </div>`
      : "";
  const fleetDataPane = `<div class="vehicles-data-pane${vehicleSection === "fleet" ? "" : " hidden"}" data-vehicle-data-pane="fleet">
      ${pcardWrap("truck", "Flota de camiones", fleetCardSubtitle, fleetMainBody)}
    </div>`;
  const simitCardSubtitle =
    state.vehiclesSimit?.status === "ready"
      ? `${simitPendingCount || 0} vehículo${simitPendingCount === 1 ? "" : "s"} con comparendos pendientes`
      : "Consulta el historial SIMIT-FCM por las placas de la flota";
  const simitDataPane = `<div class="vehicles-data-pane${vehicleSection === "fotomultas" ? "" : " hidden"}" data-vehicle-data-pane="fotomultas">
      ${pcardWrap("shield", "Fotomultas y comparendos SIMIT", simitCardSubtitle, vehiclesSimitPaneHtml(vehicles, state.vehiclesSimit || emptyVehiclesSimitState()))}
    </div>`;
  const vehicleDataPanel = `<div class="hr-workspace-panel vehicles-workspace-panel${vehicleWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-vehicle-panel="data">
      <section class="vehicles-data-panel">
        <div class="vehicles-data-toolbar payroll-data-toolbar payroll-data-toolbar--compact">${vehicleDataNav}</div>
        <div class="vehicles-data-panes">${fleetDataPane}${simitDataPane}</div>
      </section>
    </div>`;
  return `<section class="vehicles-studio vehicles-shell vehicles-shell--workspace hr-flow-shell" data-hr-workspace="${escapeAttr(vehicleWorkspace)}">${vehiclesWorkspaceHeader}
      <div class="hr-workspace-panels">
        ${vehicleOperatePanel}
        ${vehicleDataPanel}
      </div>
    </section>`;
}


(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ vehiclesHtml });
})();

(function registerTransportVehiclesPortalBinds() {
  "use strict";

  function bindTransportVehiclesPortalControls() {
    if (String(state.currentView || "") !== "transport-vehicles" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='transport-vehicles']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = String(btn.dataset.tab || "");
        if (!tab) return;
        const ws = normalizeVehicleWorkspace(tab);
        if (!HR_VALID_TRANSPORT_VEHICLES_WS.has(ws)) return;
        state.vehiclesUi = { ...(state.vehiclesUi || {}), workspace: ws };
        if (ws === "data") state.vehiclesUi.section = "fleet";
        if (ws === "operate") {
          const section = resolveVehicleSection(state.vehiclesUi);
          const panelId = vehiclesCreatePanelForSection(section);
          state.createPanels = buildVehiclesCreatePanelsState(section, state.createPanels || {}, { expandActive: false });
          persistHrWorkspace("transport-vehicles", ws);
          if (
            switchHrWorkspacePanels({
              root: nodes.viewRoot,
              moduleId: "transport-vehicles",
              workspace: ws,
              panelAttr: "data-vehicle-panel"
            })
          ) {
            if (panelId) syncVehiclesCreatePanelsInDom(nodes.viewRoot, panelId, { expandActive: false });
            return;
          }
          renderPortalView();
          return;
        }
        persistHrWorkspace("transport-vehicles", ws);
        if (
          switchHrWorkspacePanels({
            root: nodes.viewRoot,
            moduleId: "transport-vehicles",
            workspace: ws,
            panelAttr: "data-vehicle-panel"
          })
        ) {
          switchModuleTabPanels({
            root: nodes.viewRoot,
            action: "vehicles-section",
            activeValue: "fleet",
            panelAttr: "data-vehicle-data-pane",
            tabActiveClass: "is-active"
          });
          return;
        }
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-section']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = normalizeVehicleSection(btn.dataset.section);
        const panelId = vehiclesCreatePanelForSection(section);
        const ws = isVehicleDataSection(section) ? "data" : "operate";
        state.vehiclesUi = { ...(state.vehiclesUi || {}), workspace: ws, section };
        if (ws === "operate" && panelId) {
          state.createPanels = buildVehiclesCreatePanelsState(section, state.createPanels || {}, { expandActive: false });
        }
        persistHrWorkspace("transport-vehicles", ws);
        switchHrWorkspacePanels({
          root: nodes.viewRoot,
          moduleId: "transport-vehicles",
          workspace: ws,
          panelAttr: "data-vehicle-panel"
        });
        const panelAttr = ws === "data" ? "data-vehicle-data-pane" : "data-vehicle-operate-pane";
        if (
          switchModuleTabPanels({
            root: nodes.viewRoot,
            action: "vehicles-section",
            activeValue: section,
            panelAttr,
            tabActiveClass: "is-active"
          })
        ) {
          if (ws === "operate" && panelId) {
            syncVehiclesCreatePanelsInDom(nodes.viewRoot, panelId, { expandActive: false });
          }
          if (section === "fotomultas") void ensureVehiclesSimitLoaded();
          return;
        }
        renderPortalView();
        if (section === "fotomultas") void ensureVehiclesSimitLoaded();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-operate-rail-toggle']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.closest(".vehicles-operate");
        if (!panel) return;
        const collapsed = panel.classList.toggle("is-rail-collapsed");
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        btn.setAttribute("title", collapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite");
        setOperateRailCollapsed("vehicles", collapsed);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-fleet-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        state.vehiclesUi = { ...(state.vehiclesUi || {}), fleetSearch: String(el.value || "") };
        state.vehiclesRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        state.__vehiclesFleetSearchRestore = { start, end };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-render-more']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = Number(window.RENDER_WINDOW_SIZE) || 30;
        state.vehiclesRenderLimit = (Number(state.vehiclesRenderLimit) || step) + step;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-fleet-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = normalizeVehicleFleetLayout(btn.dataset.layout);
        state.vehiclesUi = { ...(state.vehiclesUi || {}), fleetLayout: layout };
        state.vehiclesRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-fleet-status']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.vehiclesUi = {
          ...(state.vehiclesUi || {}),
          statusFilter: normalizeVehicleFleetStatusFilter(btn.dataset.status)
        };
        state.vehiclesRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-fleet-filter']").forEach((select) => {
      select.addEventListener("change", () => {
        const key = String(select.dataset.filter || "");
        const value = String(select.value || "all");
        const patch = {};
        if (key === "type") patch.typeFilter = normalizeVehicleFleetTypeFilter(value);
        else if (key === "soat") patch.soatFilter = normalizeVehicleFleetComplianceFilter(value);
        else if (key === "tech") patch.techFilter = normalizeVehicleFleetComplianceFilter(value);
        else if (key === "equip") patch.equipFilter = normalizeVehicleFleetEquipFilter(value);
        else if (key === "gps") patch.gpsFilter = normalizeVehicleFleetGpsFilter(value);
        else return;
        state.vehiclesUi = { ...(state.vehiclesUi || {}), ...patch };
        state.vehiclesRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-fleet-clear']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.vehiclesUi = {
          ...(state.vehiclesUi || {}),
          fleetSearch: "",
          statusFilter: "all",
          typeFilter: "all",
          soatFilter: "all",
          techFilter: "all",
          equipFilter: "all",
          gpsFilter: "all"
        };
        state.vehiclesRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='delete-vehicle']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (abortUnlessCanDeleteVehicle()) return;
        const vehicleId = String(btn.dataset.id || "");
        if (!vehicleId) return;
        /* Viajes aún vivos (no finalizados) con este camión: eliminarlo los dejaría sin vehículo y con estado "Viaje asignado". */
        const finalTripStatuses = ["Completada", "Cerrada", "Cancelada", "Rechazada"];
        const liveTrips = reqRead().filter(
          (request) =>
            request.trip &&
            String(request.trip.vehicleId || "") === vehicleId &&
            !finalTripStatuses.includes(String(request.status || ""))
        );
        if (liveTrips.length > 0) {
          const labels = liveTrips
            .slice(0, 5)
            .map((request) => String(request.trip?.tripNumber || request.requestNumber || request.id))
            .join(", ");
          notify(
            `No se puede eliminar: el camión tiene ${liveTrips.length} viaje(s) activo(s) (${labels}${liveTrips.length > 5 ? ", …" : ""}). Reasigna o cancela esos viajes primero.`,
            "error"
          );
          return;
        }
        openConfirmModal({
          title: "Eliminar camión",
          message: "Se eliminará del catálogo y se limpiará su referencia en los viajes históricos.",
          confirmText: "Eliminar camión",
          onConfirm: async () => {
            try {
              await postPortalAuthorized("/portal/admin-vehicle-delete", { vehicleId });
            } catch (err) {
              notify(String(err?.message || "No fue posible eliminar el vehiculo en el servidor."), "error");
              return;
            }
            const snapshotVehicle = read(KEYS.vehicles, []).find((vehicle) => String(vehicle.id) === vehicleId);
            const ok = await removeFromPortalListAwaitServer(KEYS.vehicles, vehicleId, { notifyOnFailure: false });
            if (!ok) {
              notify("El vehículo se eliminó en el servidor, pero no se pudo actualizar la vista local.", "error");
              if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
              recalculateResourceAvailability();
              renderPortalView();
              return;
            }
            if (snapshotVehicle) {
              appendModuleAuditLog({
                action: "delete",
                moduleId: "vehicles",
                moduleLabel: "Camiones",
                entityId: String(snapshotVehicle.id || ""),
                entityLabel: String(snapshotVehicle.plate || "Camión").toUpperCase(),
                summary: `${String(snapshotVehicle.type || "Vehículo")} · ${String(snapshotVehicle.brand || "")} ${String(snapshotVehicle.model || "")}`.trim()
              });
            }
            const changedRequests = [];
            const nextRequests = reqRead().map((request) => {
              if (!request.trip || String(request.trip.vehicleId || "") !== vehicleId) return request;
              const nextRequest = {
                ...request,
                trip: {
                  ...request.trip,
                  vehicleId: null,
                  vehiclePlate: "CAMIÓN ELIMINADO",
                  updatedAt: nowIso()
                }
              };
              changedRequests.push(nextRequest);
              return nextRequest;
            });
            await reqWriteAwait(nextRequests, changedRequests);
            recalculateResourceAvailability();
            notify(userMessage("vehicleDeleted"), "success");
            renderPortalView();
          }
        });
      });
    });

    const vehicleForm = document.getElementById("form-vehicle");
    if (vehicleForm) {
      bindHrFormWizard(vehicleForm);
      bindVehicleCreateFormExtras(vehicleForm);
      wireFormSubmitGuard(vehicleForm, async (event) => {
        if (abortUnlessCanCreateVehicle()) return;
        const data = withVehicleDocExpiryDefaults(readFormEntriesNormalized(vehicleForm));
        const list = read(KEYS.vehicles, []);
        const verdict = validateVehicleFormPayload(data, list);
        if (!verdict.ok) {
          showVehicleFormIssue(vehicleForm, verdict.field, verdict.message);
          return;
        }
        const createdVehicle = stampCreatedRecord(
          vehicleRecordFromVerdict(
            {
              id: newUuidV4(),
              available: true,
              satelliteProviderPassword: "",
              satelliteProviderPasswordSet: false
            },
            verdict.value
          )
        );
        list.push(createdVehicle);
        try {
          await writeAwaitServerCreate(KEYS.vehicles, list, createdVehicle);
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el vehículo en el servidor."), "error");
          return;
        }
        appendPortalEntityAuditLog(
          "create",
          "vehicles",
          "Camiones",
          createdVehicle,
          `${String(createdVehicle.type || "Vehículo")} · ${String(createdVehicle.brand || "")} ${String(createdVehicle.model || "")}`.trim(),
          {
            entityLabel: String(createdVehicle.plate || "").toUpperCase(),
            actor: getPortalAuditActorLabel()
          }
        );
        if (createdVehicle.updatedAt) {
          recordEntityHistoryActor(
            "Camiones",
            createdVehicle.id,
            createdVehicle.updatedAt,
            getPortalAuditActorLabel()
          );
        }
        notify(userMessage("vehicleRegistered"), "success");
        {
          const todayYmd = typeof colombiaTodayIsoDate === "function" ? colombiaTodayIsoDate() : new Date().toISOString().slice(0, 10);
          const expiredDocs = [];
          if (String(verdict.value.soatExpiryDate || "") < todayYmd) expiredDocs.push("SOAT");
          if (String(verdict.value.techInspectionExpiryDate || "") < todayYmd) expiredDocs.push("tecnomecánica");
          if (expiredDocs.length) {
            notify(
              `Atención: el vehículo ${String(createdVehicle.plate || "").toUpperCase()} quedó registrado con ${expiredDocs.join(" y ")} vencido. No podrá asignarse a viajes hasta renovarlo.`,
              "warn",
              7000
            );
          }
        }
        collapseCreatePanel("create-vehicle");
        try {
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
        } catch (_e) { window.AntaresLogSilentError?.("camiones.js:1399", _e); }
        const refreshedVehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(createdVehicle.id));
        const createActor = getPortalAuditActorLabel();
        if (refreshedVehicle?.updatedAt && createActor) {
          recordEntityHistoryActor(
            "Camiones",
            refreshedVehicle.id,
            refreshedVehicle.updatedAt,
            createActor
          );
        }
        renderPortalView();
      }, { busyText: "Registrando vehículo…" });
    }

    nodes.viewRoot.querySelectorAll("[data-action='edit-vehicle']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (abortUnlessCanEditVehicle()) return;
        const vid = String(btn.dataset.id || "").trim();
        const all = read(KEYS.vehicles, []);
        const rawTarget = all.find((v) => String(v.id || "").trim() === vid);
        const target = normalizeVehicleRowForEditor(rawTarget);
        if (!target) {
          notify("No se encontró el vehículo. Actualice la página.", "error");
          return;
        }
        const colorOpts = editModalCatalogSelectOptions(CO_CATALOGS.vehicleColors, target.color);
        const bodyOpts = editModalCatalogSelectOptions(CO_CATALOGS.bodyTypes, target.bodyType);
        const fuelOpts = editModalCatalogSelectOptions(CO_CATALOGS.fuelTypes, target.fuelType);
        const axleOpts = editModalCatalogSelectOptions(CO_CATALOGS.axleConfig, target.axleConfig);
        const vehicleTypeOpts = [
          { value: "", label: "Seleccione..." },
          { value: "Camion", label: "Camión / rígido" },
          { value: "Turbo", label: "Turbo" },
          { value: "Tractomula", label: "Tractomula" },
          { value: "Bus", label: "Bus" }
        ];
        if (target.type && !vehicleTypeOpts.some((o) => String(o.value) === String(target.type))) {
          vehicleTypeOpts.push({ value: target.type, label: target.type });
        }
        openEditModal({
          title: "Editar camión",
          subtitle: target.plate,
          submitText: "Guardar cambios",
          fields: [
            { name: "plate", label: "Placa", value: target.plate, required: true },
            { name: "brand", label: "Marca", value: target.brand || "", required: true },
            { name: "model", label: "Línea/Modelo", value: target.model || "", required: true },
            { name: "year", label: "Año modelo", type: "number", value: target.year || "", required: true },
            {
              name: "type",
              label: "Tipo",
              type: "select",
              required: true,
              value: String(target.type || "").trim(),
              options: vehicleTypeOpts
            },
            { name: "color", label: "Color", type: "select", value: target.color || "", options: colorOpts, required: true },
            { name: "capacityKg", label: "Capacidad (kg)", type: "number", value: target.capacityKg, required: true },
            { name: "bodyType", label: "Carrocería", type: "select", value: target.bodyType || "", options: bodyOpts, required: true },
            { name: "fuelType", label: "Combustible", type: "select", value: target.fuelType || "", options: fuelOpts, required: true },
            { name: "axleConfig", label: "Ejes", type: "select", value: target.axleConfig || "", options: axleOpts, required: true },
            { name: "engineNumber", label: "N° motor", value: target.engineNumber || "", required: true },
            { name: "vin", label: "Chasis (VIN)", value: target.vin || "", required: true },
            { name: "ownershipCard", label: "Tarjeta propiedad N°", value: target.ownershipCard || "", required: true },
            {
              name: "refrigerated",
              label: "Termoking (refrigerado)",
              type: "select",
              value: vehicleHasTermokingEquipment(target) ? "true" : "false",
              options: [
                { value: "true", label: "Sí, equipo Termoking" },
                { value: "false", label: "No, carga seca" }
              ]
            },
            {
              name: "soatExpeditionDate",
              label: "Expedición SOAT",
              type: "date",
              value: target.soatExpeditionDate || "",
              required: true
            },
            { name: "soatExpiryDate", label: "Vence SOAT", type: "date", value: target.soatExpiryDate || "", required: true },
            {
              name: "techInspectionExpeditionDate",
              label: "Expedición tecnomecánica",
              type: "date",
              value: target.techInspectionExpeditionDate || "",
              required: true
            },
            {
              name: "techInspectionExpiryDate",
              label: "Vence tecnomecánica",
              type: "date",
              value: target.techInspectionExpiryDate || "",
              required: true
            },
            { name: "rcPolicyContract", label: "Póliza RC contractual N°", value: target.rcPolicyContract || "" },
            { name: "rcPolicyExtra", label: "Póliza RC extracontractual N°", value: target.rcPolicyExtra || "" },
            {
              name: "rcPolicyExpiry",
              label: "Vence pólizas RCP",
              type: "date",
              value: normalizePortalDateYmd(target.rcPolicyExpiry)
            },
            {
              name: "hasGps",
              label: "GPS satelital",
              type: "select",
              value: vehicleHasActiveGps(target) ? "true" : "false",
              options: [{ value: "true", label: "Sí" }, { value: "false", label: "No" }]
            },
            { name: "gpsProvider", label: "Proveedor GPS", value: target.gpsProvider || "" },
            { name: "satelliteProviderUser", label: "Usuario proveedor satélite", value: target.satelliteProviderUser || "" },
            {
              name: "satelliteProviderPassword",
              label: "Contraseña proveedor satélite",
              type: "password",
              value: "",
              placeholder: target.satelliteProviderPasswordSet
                ? "Dejar vacío para no cambiar la contraseña guardada"
                : "Contraseña en el portal del GPS"
            }
          ],
          afterMount: (formEl) => bindVehicleCreateFormExtras(formEl),
          onSubmit: async (form, formEl) => {
            const draft = withVehicleDocExpiryDefaults(form);
            const freshVehicles = read(KEYS.vehicles, []);
            if (!freshVehicles.some((v) => String(v.id) === String(target.id))) {
              notify("El vehículo ya no está disponible. Actualice la página.", "error");
              return false;
            }
            const verdict = validateVehicleFormPayload(draft, freshVehicles, { ignoreId: target.id });
            if (!verdict.ok) {
              showVehicleFormIssue(formEl, verdict.field, verdict.message);
              return false;
            }
            const nextVehicles = freshVehicles.map((v) =>
              String(v.id) === String(target.id)
                ? stampUpdatedRecord(vehicleRecordFromVerdict(v, verdict.value))
                : v
            );
            try {
              await writeAwaitServerEdit(KEYS.vehicles, nextVehicles, target.id);
            } catch (err) {
              notify(String(err?.message || "No fue posible guardar el vehículo en el servidor."), "error");
              return false;
            }
            const updatedVehicle = nextVehicles.find((row) => row.id === target.id);
            const vehicleActor = getPortalAuditActorLabel();
            if (updatedVehicle) {
              appendPortalEntityAuditLog(
                "update",
                "vehicles",
                "Camiones",
                updatedVehicle,
                `${updatedVehicle.refrigerated ? "Termoking" : "Carga seca"} · ${parseNum(updatedVehicle.capacityKg).toLocaleString("es-CO")} kg`,
                {
                  entityLabel: String(updatedVehicle.plate || "").toUpperCase(),
                  actor: vehicleActor
                }
              );
              if (updatedVehicle.updatedAt && vehicleActor) {
                recordEntityHistoryActor("Camiones", updatedVehicle.id, updatedVehicle.updatedAt, vehicleActor);
              }
            }
            const linkedPlate = String(updatedVehicle?.plate || verdict.value.plate || "").trim().toUpperCase();
            const linkedType = String(updatedVehicle?.type || verdict.value.type || "").trim();
            const changedRequests = [];
            const nextRequests = reqRead().map((request) => {
              const trip = request?.trip;
              if (!trip || String(trip.vehicleId || "") !== String(target.id)) return request;
              const samePlate = String(trip.vehiclePlate || "").trim().toUpperCase() === linkedPlate;
              const sameType = String(trip.vehicleType || "").trim() === linkedType;
              if (samePlate && sameType) return request;
              const nextRequest = {
                ...request,
                trip: {
                  ...trip,
                  vehiclePlate: linkedPlate,
                  vehicleType: linkedType,
                  updatedAt: nowIso()
                }
              };
              changedRequests.push(nextRequest);
              return nextRequest;
            });
            if (changedRequests.length) {
              try {
                await reqWriteAwait(nextRequests, changedRequests);
              } catch (_err) {
                notify("El camión se guardó, pero no se actualizó la placa en los viajes vinculados.", "info");
              }
            }
            notify(userMessage("vehicleUpdated"), "success");
            renderPortalView();
            return true;
          }
        });
      });
    });

    const fuelLogForm = document.getElementById("form-fuel-log");
    if (fuelLogForm) {
      wireMoneyInputs(fuelLogForm);
      const fuelLitersInput = fuelLogForm.querySelector("[data-fuel-liters-input]");
      const fuelCostInput = fuelLogForm.querySelector("input[name='totalCost']");
      const fuelHint = document.getElementById("fuel-price-per-liter-hint");
      const refreshFuelPerLiterHint = () => {
        if (!fuelHint) return;
        const liters = parseNum(fuelLitersInput?.value);
        const total = parseMoneyFieldValue(fuelCostInput?.value);
        if (liters > 0 && total > 0) {
          const per = Math.round(total / liters);
          fuelHint.hidden = false;
          fuelHint.textContent = `Precio estimado: $${per.toLocaleString("es-CO")} por litro`;
        } else {
          fuelHint.hidden = true;
          fuelHint.textContent = "";
        }
      };
      fuelLitersInput?.addEventListener("input", refreshFuelPerLiterHint);
      fuelCostInput?.addEventListener("input", refreshFuelPerLiterHint);
      wireFormSubmitGuard(fuelLogForm, async (event) => {
        const data = readFormEntriesNormalized(fuelLogForm);
        const vehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(data.vehicleId || ""));
        const driver = read(KEYS.drivers, []).find((d) => String(d.id) === String(data.driverId || ""));
        if (!vehicle) {
          failPortalField(fuelLogForm, "vehicleId", userMessage("fuelSelectBoth"));
          return;
        }
        if (!driver) {
          failPortalField(fuelLogForm, "driverId", userMessage("fuelSelectBoth"));
          return;
        }
        const liters = parseNum(data.liters);
        const totalCost = parseMoneyFieldValue(data.totalCost);
        if (liters <= 0) {
          failPortalField(fuelLogForm, "liters", userMessage("fuelInvalidAmounts"));
          return;
        }
        if (totalCost <= 0) {
          failPortalField(fuelLogForm, "totalCost", userMessage("fuelInvalidAmounts"));
          return;
        }
        const odometerKm = parseNum(data.odometerKm);
        if (odometerKm < 0) {
          failPortalField(fuelLogForm, "odometerKm", "El odómetro no puede ser negativo.");
          return;
        }
        try {
          const savedFuelLog = await appendFuelLogAwait({
            id: newUuidV4(),
            date: data.date || nowIso().slice(0, 10),
            vehicleId: vehicle.id,
            plate: vehicle.plate,
            vehiclePlate: vehicle.plate,
            driverId: driver.id,
            driverName: driver.name,
            tripNumber: String(data.tripNumber || "").trim(),
            liters,
            totalCost,
            costPerLiter: liters > 0 ? Math.round(totalCost / liters) : 0,
            odometerKm,
            station: normalizeLatinUpperForDb(data.station || ""),
            paidBy: String(data.paidBy || "empresa"),
            createdAt: nowIso()
          });
          logPortalAuditEvent?.("vehicles", "create", {
            entityId: String(savedFuelLog?.id || ""),
            entityLabel: String(savedFuelLog?.vehiclePlate || vehicle.plate || "").toUpperCase(),
            summary: formatFuelLogAuditSummary(savedFuelLog),
            at: savedFuelLog?.createdAt
          });
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el combustible en el servidor."), "error");
          return;
        }
        notify(userMessage("fuelLogged"), "success");
        collapseCreatePanel("create-fuel-log");
        state.historyUi = { ...(state.historyUi || defaultHistoryUi()), moduleFilter: "Camiones", actionFilter: "create" };
        setView("history");
      });
    }

    const technicalLogForm = document.getElementById("form-technical-log");
    if (technicalLogForm) {
      wireMoneyInputs(technicalLogForm);
      wireFormSubmitGuard(technicalLogForm, async (event) => {
        const data = readFormEntriesNormalized(technicalLogForm);
        const vehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(data.vehicleId || ""));
        if (!vehicle) {
          failPortalField(technicalLogForm, "vehicleId", userMessage("fuelSelectVehicle"));
          return;
        }
        const cost = parseMoneyFieldValue(data.cost);
        if (!String(data.description || "").trim()) {
          failPortalField(technicalLogForm, "description", "Indique una descripción de la novedad de taller.");
          return;
        }
        if (cost < 0) {
          failPortalField(technicalLogForm, "cost", "El costo de taller no puede ser negativo.");
          return;
        }
        const downtimeHours = parseNum(data.downtimeHours);
        if (downtimeHours < 0) {
          failPortalField(technicalLogForm, "downtimeHours", "Las horas fuera de servicio no pueden ser negativas.");
          return;
        }
        try {
          const savedTechLog = await appendVehicleTechnicalLogAwait({
            id: newUuidV4(),
            date: data.date || nowIso().slice(0, 10),
            vehicleId: vehicle.id,
            plate: vehicle.plate,
            vehiclePlate: vehicle.plate,
            interventionType: String(data.type || "preventivo"),
            type: String(data.type || "preventivo"),
            description: normalizeLatinUpperForDb(data.description || ""),
            cost,
            downtimeHours,
            followUpStatus: String(data.status || "Pendiente"),
            status: String(data.status || "Pendiente"),
            createdAt: nowIso()
          });
          logPortalAuditEvent?.("vehicles", "create", {
            entityId: String(savedTechLog?.id || ""),
            entityLabel: String(savedTechLog?.vehiclePlate || vehicle.plate || "").toUpperCase(),
            summary: formatTechnicalLogAuditSummary(savedTechLog),
            at: savedTechLog?.createdAt
          });
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el mantenimiento en el servidor."), "error");
          return;
        }
        notify(userMessage("technicalLogged"), "success");
        collapseCreatePanel("create-technical-log");
        state.historyUi = { ...(state.historyUi || defaultHistoryUi()), moduleFilter: "Camiones", actionFilter: "create" };
        setView("history");
      });
    }

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-simit-refresh']").forEach((btn) => {
      btn.addEventListener("click", () => {
        void ensureVehiclesSimitLoaded({ force: true });
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-simit-scope']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pendingOnly = String(btn.dataset.scope || "pending") !== "all";
        state.vehiclesSimit = withSimitUi(state.vehiclesSimit, { pendingOnly });
        void ensureVehiclesSimitLoaded({ force: true });
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-simit-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        state.vehiclesSimit = withSimitUi(state.vehiclesSimit, { query: String(el.value || "") });
        state.__vehiclesSimitSearchRestore = { start, end };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-simit-result']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.vehiclesSimit = withSimitUi(state.vehiclesSimit, {
          resultFilter: normalizeSimitResultFilter(btn.dataset.result)
        });
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-simit-clear']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.vehiclesSimit = withSimitUi(state.vehiclesSimit, { query: "", resultFilter: "all" });
        renderPortalView();
      });
    });

    if (String(state.vehiclesUi?.workspace) === "data" && String(state.vehiclesUi?.section) === "fotomultas") {
      queueMicrotask(() => {
        if (String(state.currentView || "") !== "transport-vehicles") return;
        if (String(state.vehiclesUi?.section) !== "fotomultas") return;
        void ensureVehiclesSimitLoaded();
      });
    }

    const simitSearchRestore = state.__vehiclesSimitSearchRestore;
    if (simitSearchRestore && typeof simitSearchRestore.start === "number") {
      delete state.__vehiclesSimitSearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "transport-vehicles") return;
        const inp = root.querySelector("[data-action='vehicles-simit-search']");
        if (!inp || typeof inp.focus !== "function") return;
        inp.focus();
        if (typeof inp.setSelectionRange === "function") {
          const n = String(inp.value || "").length;
          const s = Math.max(0, Math.min(simitSearchRestore.start, n));
          const e = Math.max(0, Math.min(simitSearchRestore.end ?? simitSearchRestore.start, n));
          inp.setSelectionRange(s, e);
        }
      });
    }

    const fleetSearchRestore = state.__vehiclesFleetSearchRestore;
    if (fleetSearchRestore && typeof fleetSearchRestore.start === "number") {
      delete state.__vehiclesFleetSearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "transport-vehicles") return;
        const inp = root.querySelector("[data-action='vehicles-fleet-search']");
        if (!inp || typeof inp.focus !== "function") return;
        inp.focus();
        if (typeof inp.setSelectionRange === "function") {
          const n = String(inp.value || "").length;
          const s = Math.max(0, Math.min(fleetSearchRestore.start, n));
          const e = Math.max(0, Math.min(fleetSearchRestore.end ?? fleetSearchRestore.start, n));
          inp.setSelectionRange(s, e);
        }
      });
    }
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["transport-vehicles"] = bindTransportVehiclesPortalControls;
})();
