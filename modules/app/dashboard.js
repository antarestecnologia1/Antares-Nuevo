/**
 * Portal — Dashboard (torre operativa y estadísticas).
 * Módulo autocontenido: helpers, vista HTML y listeners post-render.
 * Carga con `defer` después de `app.js` (depende de estado global del portal).
 */
(function registerDashboardPortalModule() {
  "use strict";

  function dashMinuteOfDayColombia(isoValue) {
    const ts = new Date(isoValue).getTime();
    if (!Number.isFinite(ts)) return null;
    const p = getColombiaDateParts(new Date(ts));
    return parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10);
  }

  function dashTimelinePct(isoValue) {
    const minutes = dashMinuteOfDayColombia(isoValue);
    if (minutes == null) return null;
    return Math.min(100, Math.max(0, (minutes / 1439) * 100));
  }

  function dashRequestOutcomeTone(status) {
    const key = slugStatus(status);
    if (["completada", "cerrada"].includes(key)) return "ok";
    if (["cancelada", "rechazada"].includes(key)) return "fail";
    if (["espera_standby"].includes(key)) return "warn";
    if (["en_transito", "viaje_asignado"].includes(key)) return "live";
    return "neutral";
  }

  function dashBuildTimelineHtml(trips) {
    const hourMarks = [0, 6, 12, 18, 23]
      .map((h) => {
        const label = h === 0 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`;
        return `<span style="left:${(h / 23) * 100}%">${label}</span>`;
      })
      .join("");
    const markers = [];
    (trips || []).forEach((request) => {
      const pickupPct = dashTimelinePct(request?.trip?.etaPickup || request?.pickupAt);
      const deliveryPct = dashTimelinePct(request?.trip?.etaDelivery || request?.deliveryAt);
      const tone = dashRequestOutcomeTone(request?.status);
      if (pickupPct != null) {
        markers.push(
          `<span class="ops-dash-tl-marker ops-dash-tl-marker--start" style="left:${pickupPct}%" title="Recogida ${escapeAttr(request.requestNumber || "")}">${IC.mapPin}</span>`
        );
      }
      if (deliveryPct != null) {
        markers.push(
          `<span class="ops-dash-tl-marker ops-dash-tl-marker--${tone}" style="left:${deliveryPct}%" title="Entrega ${escapeAttr(request.requestNumber || "")}">${IC.package}</span>`
        );
      }
    });
    const nowPct = dashTimelinePct(colombiaNowIso());
    const nowMarker =
      nowPct != null
        ? `<span class="ops-dash-tl-marker ops-dash-tl-marker--now" style="left:${nowPct}%" title="Ahora">${IC.activity}</span>`
        : "";
    return `<div class="ops-dash-timeline" aria-hidden="true">
    <div class="ops-dash-tl-track">${markers.join("")}${nowMarker}<i class="ops-dash-tl-progress"></i></div>
    <div class="ops-dash-tl-hours">${hourMarks}</div>
  </div>`;
  }

  function dashBuildVehicleCard(group, vehicleById) {
    const vehicleId = String(group.vehicleId || "");
    const vehicle = vehicleById.get(vehicleId) || {};
    const plate = String(group.plate || vehicle.plate || "Sin placa").trim();
    const driver = String(group.driverName || "Sin conductor").trim();
    const trips = group.trips || [];
    const assigned = trips.length;
    const completed = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
    const okCount = trips.filter((r) => dashRequestOutcomeTone(r.status) === "ok").length;
    const warnCount = trips.filter((r) => dashRequestOutcomeTone(r.status) === "warn").length;
    const failCount = trips.filter((r) => dashRequestOutcomeTone(r.status) === "fail").length;
    const liveCount = trips.filter((r) => dashRequestOutcomeTone(r.status) === "live").length;
    const totalValue = trips.reduce((acc, r) => acc + parseNum(r.tripValue || r.insuredValue || 0), 0);
    const cardStatus = liveCount ? "en-ruta" : completed === assigned && assigned ? "cerrado" : assigned ? "programado" : "libre";
    const statusLabel =
      cardStatus === "en-ruta" ? "En ruta" : cardStatus === "cerrado" ? "Cerrado hoy" : cardStatus === "programado" ? "Programado" : "Sin viaje";
    const rows = trips
      .map((r) => {
        const arrival = fmtTimeOnly(r.trip?.etaPickup || r.pickupAt);
        const delivery = fmtTimeOnly(r.deliveredAt || r.trip?.etaDelivery || r.deliveryAt);
        const recaudo = parseNum(r.tripValue || r.insuredValue || 0);
        return `<tr>
        <td><strong>${escapeHtml(String(r.requestNumber || r.id))}</strong></td>
        <td>${escapeHtml(String(r.clientName || "—"))}<br><span class="muted">${escapeHtml(formatRoute(r))}</span></td>
        <td>${arrival}</td>
        <td>${delivery}</td>
        <td>${prettyStatus(r.status, "request")}</td>
        <td><span class="muted">${escapeHtml(String(r.cancellationReason || r.rejectionReason || "—"))}</span></td>
        <td>${recaudo > 0 ? `$${recaudo.toLocaleString("es-CO")}` : "—"}</td>
        <td><span class="muted">${escapeHtml(String(r.notes || "—").slice(0, 80))}</span></td>
      </tr>`;
      })
      .join("");
    const table = rows
      ? `<div class="table-wrap ops-dash-table-wrap"><table><thead><tr>
        <th>Solicitud</th><th>Cliente / ruta</th><th>Recogida</th><th>Entrega</th><th>Estado</th><th>Motivo</th><th>Valor</th><th>Notas</th>
      </tr></thead><tbody>${rows}</tbody></table></div>`
      : emptyState("Sin solicitudes en este vehículo hoy.");
    const searchBlob = [plate, driver, ...trips.map((r) => `${r.requestNumber} ${r.clientName} ${formatRoute(r)}`)].join(" ");
    return `<article class="ops-dash-vehicle-card" data-plate="${escapeAttr(plate)}" data-driver="${escapeAttr(driver)}" data-status="${escapeAttr(cardStatus)}" data-search="${escapeAttr(searchBlob)}">
    <header class="ops-dash-vehicle-head">
      <div class="ops-dash-vehicle-meta">
        <span class="ops-dash-chip">${IC.truck}<strong>${escapeHtml(plate)}</strong></span>
        <span class="ops-dash-chip">${IC.user}<span>${escapeHtml(driver)}</span></span>
        <span class="ops-dash-chip">${IC.briefcase}<span>$${totalValue.toLocaleString("es-CO")}</span></span>
      </div>
      <span class="ops-dash-vehicle-status ops-dash-vehicle-status--${cardStatus}">${IC.compass}<span>${statusLabel}</span></span>
    </header>
    <div class="ops-dash-vehicle-summary">
      <div>
        <strong>${assigned}</strong><span>Viajes hoy</span>
        <strong>${completed}</strong><span>Cumplidos</span>
      </div>
      <div class="ops-dash-mini-bars">
        ${okCount ? `<span class="ops-dash-mini-bar ops-dash-mini-bar--ok" style="flex:${okCount}">${okCount} OK</span>` : ""}
        ${warnCount ? `<span class="ops-dash-mini-bar ops-dash-mini-bar--warn" style="flex:${warnCount}">${warnCount} Standby</span>` : ""}
        ${failCount ? `<span class="ops-dash-mini-bar ops-dash-mini-bar--fail" style="flex:${failCount}">${failCount} Incid.</span>` : ""}
        ${liveCount && !okCount && !warnCount && !failCount ? `<span class="ops-dash-mini-bar ops-dash-mini-bar--live" style="flex:${liveCount}">${liveCount} En curso</span>` : ""}
      </div>
    </div>
    ${dashBuildTimelineHtml(trips)}
    ${table}
    <footer class="ops-dash-vehicle-foot">
      <button type="button" class="btn btn-sm btn-action" data-action="detail" data-id="${escapeAttr(trips[0]?.id || "")}" ${trips[0]?.id ? "" : "disabled"}>${IC.eye} Ver solicitud</button>
    </footer>
  </article>`;
  }

  function bindDashboardControls() {
    if (String(state.currentView || "") !== "dashboard" || !nodes.viewRoot) return;
    const root = nodes.viewRoot.querySelector(".ops-dash");
    if (!root) return;
    const search = root.querySelector("#dash-search");
    const filter = root.querySelector("#dash-filter");
    const cards = [...root.querySelectorAll(".ops-dash-vehicle-card")];
    const countEl = root.querySelector("#dash-fleet-count");
    const apply = () => {
      const q = String(search?.value || "").trim().toLowerCase();
      const f = String(filter?.value || "all");
      let visible = 0;
      cards.forEach((card) => {
        const blob = String(card.dataset.search || "").toLowerCase();
        const plate = String(card.dataset.plate || "").toLowerCase();
        const driver = String(card.dataset.driver || "").toLowerCase();
        const status = String(card.dataset.status || "");
        const matchQ = !q || plate.includes(q) || driver.includes(q) || blob.includes(q);
        const matchF = f === "all" || status === f;
        const show = matchQ && matchF;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (countEl) countEl.textContent = `${visible} vehículo${visible === 1 ? "" : "s"}`;
    };
    search?.addEventListener("input", apply);
    filter?.addEventListener("change", apply);
    apply();
    root.querySelectorAll("[data-action='dash-nav']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = String(btn.dataset.targetView || "").trim();
        if (target) setView(target);
      });
    });
  }

  function viewDashboard() {
    const user = currentUser();
    const list = getVisibleRequestsForUser(user);
    const byThermoking = {};
    list.forEach((r) => {
      const key = requestTermokingClientLabel(r);
      byThermoking[key] = (byThermoking[key] || 0) + 1;
    });
    const thermokingColors = {
      "Con Termoking": "#0EA5E9",
      "Sin Termoking": "#94A3B8",
      "—": "#CBD5E1"
    };
    const vehicleStats = Object.entries(byThermoking)
      .map(([k, v]) => `<div class="dash-stat-row"><div class="dash-stat-label"><span class="dash-stat-dot" style="background:${thermokingColors[k] || "#94A3B8"}"></span>${k}</div><div class="dash-stat-value">${v}</div></div>`)
      .join("");

    const byStatus = {};
    list.forEach((r) => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });
    const statusStats = Object.entries(byStatus)
      .map(([k, v]) => `<div class="dash-stat-row"><div class="dash-stat-label">${prettyStatus(k)}</div><div class="dash-stat-value">${v}</div></div>`)
      .join("");

    const users =
      user?.role === ROLES.CLIENT
        ? read(KEYS.users, []).filter((u) => u.companyId === user.companyId)
        : read(KEYS.users, []);
    const drivers =
      user?.role === ROLES.CLIENT
        ? read(KEYS.drivers, []).filter((d) => d.companyId === user.companyId)
        : read(KEYS.drivers, []);
    const vehicles =
      user?.role === ROLES.CLIENT
        ? read(KEYS.vehicles, []).filter((vehicle) => {
            const companyTrips = list.filter((request) => request.trip?.vehicleId === vehicle.id);
            return companyTrips.length > 0;
          })
        : read(KEYS.vehicles, []);
    const avg = (rows) => (rows.length ? Math.round(rows.reduce((acc, val) => acc + val, 0) / rows.length) : 0);
    const userQuality = avg(
      users.map((u) => {
        const required = ["name", "email", "documentType", "taxId", "phone", "city", "address", "companyId"];
        const done = required.filter((field) => String(u[field] ?? "").trim() !== "").length;
        return Math.round((done / required.length) * 100);
      })
    );
    const driverQuality = avg(
      drivers.map((d) => {
        const required = ["name", "documentType", "idDoc", "phone", "license", "licenseExpiry", "licenseCategory", "city", "companyId"];
        const done = required.filter((field) => String(d[field] ?? "").trim() !== "").length;
        return Math.round((done / required.length) * 100);
      })
    );
    const vehicleQuality = avg(
      vehicles.map((v) => {
        const required = ["plate", "brand", "model", "year", "type", "capacityKg", "mileageKm", "soatExpeditionDate", "techInspectionExpeditionDate"];
        const done = required.filter((field) => String(v[field] ?? "").trim() !== "").length;
        return Math.round((done / required.length) * 100);
      })
    );
    const qualityBody = `
    <div class="quality-row"><span>Usuarios</span><div class="quality-bar"><i style="width:${userQuality}%"></i></div><b>${userQuality}%</b></div>
    <div class="quality-row"><span>Conductores</span><div class="quality-bar"><i style="width:${driverQuality}%"></i></div><b>${driverQuality}%</b></div>
    <div class="quality-row"><span>Vehiculos</span><div class="quality-bar"><i style="width:${vehicleQuality}%"></i></div><b>${vehicleQuality}%</b></div>
  `;

    const qualityCard = user?.role === ROLES.CLIENT ? "" : pcardWrap("shield", "Calidad de datos", "Completitud de registros", qualityBody);

    const todayIso = colombiaTodayIsoDate();
    const todayTrips = list.filter((r) => {
      const pickupDay = requestPickupIsoDate(r);
      if (pickupDay === todayIso) return true;
      return r.trip && tripRequestStatusIsOperational(r.status);
    });
    const activeTrips = todayTrips.filter((r) => r.trip && tripRequestStatusIsOperational(r.status));
    const vehicleIdsEnRuta = new Set(activeTrips.map((r) => String(r.trip?.vehicleId || "").trim()).filter(Boolean));
    const assignedToday = todayTrips.filter((r) => r.trip).length;
    const completedToday = todayTrips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
    const compliancePct = assignedToday ? Math.round((completedToday / assignedToday) * 100) : 0;
    const okDeliveries = todayTrips.filter((r) => dashRequestOutcomeTone(r.status) === "ok").length;
    const issueDeliveries = todayTrips.filter((r) => ["fail", "warn"].includes(dashRequestOutcomeTone(r.status))).length;
    const deliveryBarPct = assignedToday ? Math.round((okDeliveries / assignedToday) * 100) : 0;

    const allVehicles = read(KEYS.vehicles, []);
    const vehicleById = new Map(allVehicles.map((v) => [String(v.id), v]));
    const groups = new Map();
    todayTrips
      .filter((r) => r.trip?.vehicleId)
      .forEach((r) => {
        const vid = String(r.trip.vehicleId);
        if (!groups.has(vid)) {
          groups.set(vid, {
            vehicleId: vid,
            plate: r.trip.vehiclePlate,
            driverName: r.trip.driverName,
            trips: []
          });
        }
        groups.get(vid).trips.push(r);
      });
    const fleetCards = [...groups.values()]
      .sort((a, b) => String(a.plate).localeCompare(String(b.plate), "es"))
      .map((g) => dashBuildVehicleCard(g, vehicleById))
      .join("");

    const scopeBar = isPortalClientUser(user) ? clientDataScopeBarHtml(getClientDataScope()) : "";
    const canTrips = isViewAllowedForUser(user, "transport-trips");
    const canReports = isViewAllowedForUser(user, "reports") || isViewAllowedForUser(user, "history");
    const assignTarget = canTrips ? "transport-trips" : "requests";
    const reportsTarget = isViewAllowedForUser(user, "reports") ? "reports" : "history";
    const longDate = formatColombiaLongDate(new Date());

    const opsDash = `<section class="ops-dash" aria-label="Torre de control operativa">
    <nav class="ops-dash-tabs" aria-label="Accesos rápidos">
      <button type="button" class="ops-dash-tab is-active" aria-current="page">${IC.truck} Vehículos en ruta</button>
      <button type="button" class="ops-dash-tab" data-action="dash-nav" data-target-view="${escapeAttr(assignTarget)}">${IC.compass} Asignar rutas</button>
      <button type="button" class="ops-dash-tab" data-action="dash-nav" data-target-view="${escapeAttr(canReports ? reportsTarget : "requests")}">${IC.file} Informes</button>
    </nav>
    <div class="ops-dash-kpis">
      <div class="ops-dash-kpi ops-dash-kpi--primary">
        <span class="ops-dash-kpi-value">${vehicleIdsEnRuta.size}</span>
        <span class="ops-dash-kpi-label">Vehículos en ruta</span>
        <span class="ops-dash-kpi-date">Hoy, ${escapeHtml(longDate)}</span>
      </div>
      <div class="ops-dash-kpi">
        <span class="ops-dash-kpi-value">${assignedToday}</span>
        <span class="ops-dash-kpi-label">Viajes asignados hoy</span>
      </div>
      <div class="ops-dash-kpi">
        <span class="ops-dash-kpi-value">${completedToday}</span>
        <span class="ops-dash-kpi-label">Viajes cumplidos</span>
      </div>
      <div class="ops-dash-kpi ops-dash-kpi--ring">
        <div class="ops-dash-ring" style="--pct:${compliancePct}">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <path class="ops-dash-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="ops-dash-ring-fg" stroke-dasharray="${compliancePct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <strong>${compliancePct}%</strong>
        </div>
        <span class="ops-dash-kpi-label">Cumplimiento</span>
      </div>
      <div class="ops-dash-kpi ops-dash-kpi--bar">
        <span class="ops-dash-kpi-label">Entregas del día</span>
        <div class="ops-dash-progress" role="progressbar" aria-valuenow="${deliveryBarPct}" aria-valuemin="0" aria-valuemax="100">
          <i style="width:${deliveryBarPct}%"></i>
        </div>
        <div class="ops-dash-legend">
          <span class="ops-dash-legend-item ops-dash-legend-item--ok">${okDeliveries} Sin novedad</span>
          <span class="ops-dash-legend-item ops-dash-legend-item--warn">${issueDeliveries} Con incidencia</span>
        </div>
      </div>
    </div>
    <div class="ops-dash-toolbar">
      <label class="ops-dash-search">${IC.search}<input id="dash-search" type="search" placeholder="Buscar vehículo, placa o conductor..." autocomplete="off" /></label>
      <label class="ops-dash-filter">Filtrar por
        <select id="dash-filter">
          <option value="all">Todos</option>
          <option value="en-ruta">En ruta</option>
          <option value="programado">Programados</option>
          <option value="cerrado">Cerrados hoy</option>
        </select>
      </label>
      <span class="ops-dash-fleet-count" id="dash-fleet-count">${groups.size} vehículos</span>
    </div>
    <div class="ops-dash-fleet-list">
      ${fleetCards || emptyState("No hay vehículos con viajes programados para hoy. Asigne rutas desde Transporte · Viajes.")}
    </div>
    <div class="dash-grid ops-dash-insights">
      ${pcardWrap("truck", "Por Termoking", `${list.length} solicitudes`, vehicleStats || emptyState("Sin datos aún"))}
      ${pcardWrapPro("activity", "Por estado", "Distribución general", statusStats || emptyState("Sin solicitudes aún"))}
      ${qualityCard}
    </div>
  </section>`;

    return `${scopeBar}${opsDash}`;
  }

  if (typeof window.registerLegacyPortalViews === "function") {
    window.registerLegacyPortalViews({ viewDashboard });
  } else {
    window.AppLegacyViews = window.AppLegacyViews || {};
    Object.assign(window.AppLegacyViews, { viewDashboard });
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.dashboard = bindDashboardControls;

  if (!window.AppModules) window.AppModules = {};
  window.AppModules.dashboard = {
    viewDashboard: (...args) => window.AppLegacyViews?.viewDashboard?.(...args) || ""
  };
})();
