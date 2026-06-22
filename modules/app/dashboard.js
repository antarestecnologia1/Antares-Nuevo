/**
 * Portal — Dashboard (torre operativa y estadísticas).
 * Módulo autocontenido: helpers, vista HTML y listeners post-render.
 * Carga con `defer` después de `app.js` (depende de estado global del portal).
 */
(function registerDashboardPortalModule() {
  "use strict";

  function dashRequestOutcomeTone(status) {
    const key = slugStatus(status);
    if (["completada", "cerrada"].includes(key)) return "ok";
    if (["cancelada", "rechazada"].includes(key)) return "fail";
    if (["espera_standby"].includes(key)) return "warn";
    if (["en_transito", "viaje_asignado"].includes(key)) return "live";
    return "neutral";
  }

  function dashBuildVehicleCard(group) {
    const plate = String(group.plate || "Sin placa").trim();
    const driver = String(group.driverName || "Sin conductor").trim();
    const trips = group.trips || [];
    const completed = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
    const liveCount = trips.filter((r) => dashRequestOutcomeTone(r.status) === "live").length;
    const cardStatus = liveCount ? "en-ruta" : completed === trips.length && trips.length ? "cerrado" : trips.length ? "programado" : "libre";
    const statusLabel =
      cardStatus === "en-ruta" ? "En ruta" : cardStatus === "cerrado" ? "Cerrado" : cardStatus === "programado" ? "Programado" : "Libre";
    const rows = trips
      .map((r) => {
        const delivery = fmtTimeOnly(r.deliveredAt || r.trip?.etaDelivery || r.deliveryAt);
        return `<tr>
        <td><button type="button" class="dash-trip-link" data-action="detail" data-id="${escapeAttr(r.id)}">${escapeHtml(String(r.requestNumber || r.id))}</button></td>
        <td>${escapeHtml(String(r.clientName || "—"))}<br><span class="muted">${escapeHtml(formatRoute(r))}</span></td>
        <td>${prettyStatus(r.status, "request")}</td>
        <td>${delivery}</td>
      </tr>`;
      })
      .join("");
    const table = rows
      ? `<div class="dash-vehicle__table-wrap"><table class="dash-vehicle__table"><thead><tr>
        <th>Solicitud</th><th>Cliente / ruta</th><th>Estado</th><th>Entrega</th>
      </tr></thead><tbody>${rows}</tbody></table></div>`
      : `<p class="muted" style="padding:0.75rem 0.85rem;margin:0;font-size:0.82rem">Sin viajes en este vehículo.</p>`;
    const searchBlob = [plate, driver, ...trips.map((r) => `${r.requestNumber} ${r.clientName} ${formatRoute(r)}`)].join(" ");
    return `<article class="dash-vehicle" data-plate="${escapeAttr(plate)}" data-driver="${escapeAttr(driver)}" data-status="${escapeAttr(cardStatus)}" data-search="${escapeAttr(searchBlob)}">
    <header class="dash-vehicle__head">
      <div class="dash-vehicle__id"><strong>${escapeHtml(plate)}</strong><span>${escapeHtml(driver)} · ${trips.length} viaje${trips.length === 1 ? "" : "s"}</span></div>
      <span class="dash-vehicle__badge dash-vehicle__badge--${cardStatus}">${escapeHtml(statusLabel)}</span>
    </header>
    ${table}
  </article>`;
  }

  function dashBuildAlerts(items) {
    const attention = (items || []).filter((item) => Number(item?.value) > 0).slice(0, 4);
    if (!attention.length) {
      return `<p class="dash-alert dash-alert--ok" role="status">${IC.check} Operación al día</p>`;
    }
    return attention
      .map((item) => {
        const tone = item?.tone === "alert" ? "alert" : "warn";
        const target = String(item?.targetView || "").trim();
        const title = item?.help ? ` title="${escapeAttr(String(item.help))}"` : "";
        return `<button type="button" class="dash-alert dash-alert--${tone}" data-action="dash-attention-nav" data-target-view="${escapeAttr(target)}"${title}><strong>${escapeHtml(String(item.value))}</strong> ${escapeHtml(String(item.label || ""))}</button>`;
      })
      .join("");
  }

  function dashBuildHeroNav(user) {
    const links = [];
    if (isViewAllowedForUser(user, "transport-trips")) {
      links.push({ view: "transport-trips", label: "Asignar viajes" });
    } else if (isViewAllowedForUser(user, "requests")) {
      links.push({ view: "requests", label: "Mis solicitudes" });
    }
    if (isViewAllowedForUser(user, "reports")) links.push({ view: "reports", label: "Informes" });
    else if (isViewAllowedForUser(user, "history")) links.push({ view: "history", label: "Historial" });
    if (canAccessAuthorizationsView?.(user) && isViewAllowedForUser(user, "authorizations")) {
      links.push({ view: "authorizations", label: "Autorizaciones" });
    }
    if (!links.length) return "";
    return links
      .map(
        (l) =>
          `<button type="button" class="dash-hero__link" data-action="dash-nav" data-target-view="${escapeAttr(l.view)}">${escapeHtml(l.label)}</button>`
      )
      .join("");
  }

  function dashBuildPulsePanel(snap, user) {
    if (!snap) return "";
    const items = [
      {
        label: "Cumplimiento de entregas",
        value: `${snap.compliancePct}%`,
        bar: snap.compliancePct,
        tone: snap.compliancePct >= 80 ? "" : snap.compliancePct >= 50 ? "warn" : "alert"
      },
      { label: "Sin novedad", value: String(snap.okDeliveries), tone: "" },
      { label: "Con incidencia", value: String(snap.issueDeliveries), tone: snap.issueDeliveries ? "warn" : "" },
      { label: "En standby", value: String(snap.standbyToday), tone: snap.standbyToday ? "warn" : "" },
      { label: "Con retraso", value: String(snap.delayedToday), tone: snap.delayedToday ? "alert" : "" }
    ];
    if (!isPortalClientUser(user)) {
      items.push(
        { label: "Utilización flota", value: `${snap.fleetUtilPct}%`, tone: "" },
        { label: "Pendientes de asignar", value: String(snap.pendingAssignment), tone: snap.pendingAssignment ? "warn" : "" },
        { label: "Alertas documentales", value: String(snap.docRisk), tone: snap.docRisk ? "warn" : "" }
      );
    }
    const rows = items
      .filter((item) => item.bar != null || Number.parseInt(String(item.value), 10) > 0 || String(item.label).includes("Utilización"))
      .map((item) => {
        const mod = item.tone ? ` dash-pulse-item--${item.tone}` : "";
        const bar =
          item.bar != null
            ? `<div class="dash-pulse-item__bar" aria-hidden="true"><i style="width:${Math.min(100, Math.max(0, item.bar))}%"></i></div>`
            : "";
        return `<li class="dash-pulse-item${mod}"><span class="dash-pulse-item__label">${escapeHtml(item.label)}</span><span class="dash-pulse-item__value">${escapeHtml(item.value)}</span>${bar}</li>`;
      })
      .join("");
  const foot = isPortalClientUser(user)
      ? `<p>Sus indicadores reflejan solo las solicitudes de su empresa.</p>`
      : `<p>Indicadores complementarios a las tarjetas del encabezado.</p>`;
    return `<aside class="dash-panel dash-panel--pulse" aria-label="Pulso operativo del día">
    <header class="dash-panel__head"><div><h3>Pulso del día</h3><p>Indicadores de seguimiento</p></div></header>
    <ul class="dash-pulse-list">${rows}</ul>
    <footer class="dash-pulse-foot">${foot}</footer>
  </aside>`;
  }

  function dashBuildClientPanel(list, user) {
    const pending = list.filter((r) => r.status === STATUS.PENDIENTE).length;
    const active = list.filter((r) => r.trip && tripRequestStatusIsOperational(r.status)).length;
    const done = list.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
    const cta = isViewAllowedForUser(user, "requests")
      ? `<footer class="dash-pulse-foot"><button type="button" class="btn btn-primary btn-sm" data-action="dash-nav" data-target-view="requests">${IC.plus || ""} Nueva solicitud</button></footer>`
      : "";
    return `<section class="dash-panel dash-panel--client">
    <header class="dash-panel__head"><div><h3>Mi operación</h3><p>Resumen de sus solicitudes de transporte</p></div></header>
    <dl class="dash-client-grid">
      <div class="dash-client-stat"><dt>Activas</dt><dd>${active}</dd></div>
      <div class="dash-client-stat"><dt>En revisión</dt><dd>${pending}</dd></div>
      <div class="dash-client-stat"><dt>Completadas</dt><dd>${done}</dd></div>
      <div class="dash-client-stat"><dt>Total</dt><dd>${list.length}</dd></div>
    </dl>
    ${cta}
  </section>`;
  }

  function bindDashboardControls() {
    if (String(state.currentView || "") !== "dashboard" || !nodes.viewRoot) return;
    const root = nodes.viewRoot.querySelector(".dashboard-studio");
    if (!root) return;
    const search = root.querySelector("#dash-search");
    const filter = root.querySelector("#dash-filter");
    const cards = [...root.querySelectorAll(".dash-vehicle")];
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
    root.querySelectorAll("[data-action='dash-nav'], [data-action='dash-attention-nav']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = String(btn.dataset.targetView || "").trim();
        if (target) setView(target);
      });
    });
  }

  function viewDashboard() {
    const user = currentUser();
    const list = getVisibleRequestsForUser(user);
    const DD = typeof AntaresDashboardDomain !== "undefined" ? AntaresDashboardDomain : null;
    const snap = DD?.computeTodayOperationsSnapshot ? DD.computeTodayOperationsSnapshot(user) : null;
    const attentionItems = DD?.computeDashboardAttentionItems ? DD.computeDashboardAttentionItems(user) : [];
    const scopeBar = isPortalClientUser(user) ? clientDataScopeBarHtml(getClientDataScope()) : "";
    const longDate = formatColombiaLongDate(new Date());
    const displayName = getPortalUserDisplayName(user) || user?.name || "Operador";
    const firstName = escapeHtml(String(displayName).trim().split(/\s+/)[0] || displayName);

    const hero = `<header class="dash-hero">
      <div class="dash-hero__main">
        <p class="dash-hero__eyebrow">Dashboard operativo</p>
        <h2>Buenos días, ${firstName}</h2>
        <p class="dash-hero__meta">${escapeHtml(longDate)}</p>
      </div>
      <nav class="dash-hero__nav" aria-label="Accesos">${dashBuildHeroNav(user)}</nav>
      <div class="dash-hero__alerts">${dashBuildAlerts(attentionItems)}</div>
    </header>`;

    if (isPortalClientUser(user)) {
      return `${scopeBar}<section class="dashboard-studio">${hero}${dashBuildClientPanel(list, user)}</section>`;
    }

    const todayIso = snap?.todayIso || colombiaTodayIsoDate();
    const todayTrips = list.filter((r) => {
      const pickupDay = requestPickupIsoDate(r);
      if (pickupDay === todayIso) return true;
      return r.trip && tripRequestStatusIsOperational(r.status);
    });
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
      .map((g) => dashBuildVehicleCard(g))
      .join("");
    const fleetEmpty = fleetCards || `<div class="dash-empty"><p>No hay vehículos con viajes para hoy.</p><p class="muted" style="margin-top:0.35rem;font-size:0.82rem">Asigne rutas desde Transporte · Viajes.</p></div>`;

    const body = `<div class="dash-layout">
    <section class="dash-panel dash-panel--fleet" aria-label="Flota en operación">
      <header class="dash-panel__head">
        <div>
          <h3>Flota en operación</h3>
          <p>Vehículos con actividad programada para hoy</p>
        </div>
        <div class="dash-panel__tools">
          <label class="dash-search">${IC.search}<input id="dash-search" type="search" placeholder="Buscar placa o conductor…" autocomplete="off" /></label>
          <label class="dash-filter">Estado
            <select id="dash-filter">
              <option value="all">Todos</option>
              <option value="en-ruta">En ruta</option>
              <option value="programado">Programados</option>
              <option value="cerrado">Cerrados</option>
            </select>
          </label>
          <span class="dash-count" id="dash-fleet-count">${groups.size} vehículos</span>
        </div>
      </header>
      <div class="dash-fleet-list">${fleetEmpty}</div>
    </section>
    ${dashBuildPulsePanel(snap, user)}
  </div>`;

    return `${scopeBar}<section class="dashboard-studio">${hero}${body}</section>`;
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
