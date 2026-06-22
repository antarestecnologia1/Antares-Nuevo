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

  function dashTripIsDelayed(request) {
    if (!request || !tripRequestStatusIsOperational(request.status)) return false;
    const eta = String(
      request?.trip?.etaDelivery || request?.deliveryAt || request?.trip?.etaPickup || request?.pickupAt || ""
    ).trim();
    const ts = new Date(eta).getTime();
    return Number.isFinite(ts) && ts < Date.now();
  }

  function dashStatusPill(status) {
    const tone = dashRequestOutcomeTone(status);
    return `<span class="dash-pill dash-pill--${tone}">${prettyStatus(status, "request")}</span>`;
  }

  function dashBuildRing(pct, label, tone) {
    const safe = Math.min(100, Math.max(0, Number(pct) || 0));
    const r = 18;
    const c = 2 * Math.PI * r;
    const offset = c - (safe / 100) * c;
    const mod = tone ? ` dash-ring--${tone}` : "";
    return `<div class="dash-ring${mod}" role="img" aria-label="${escapeAttr(label)}: ${safe}%">
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle class="dash-ring__bg" cx="22" cy="22" r="${r}"></circle>
        <circle class="dash-ring__fg" cx="22" cy="22" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${offset}"></circle>
      </svg>
      <strong>${safe}%</strong>
      <span class="dash-ring__label">${escapeHtml(label)}</span>
    </div>`;
  }

  function dashBuildMetricCard(icon, label, value, sub, tone) {
    const mod = tone ? ` dash-metric--${tone}` : "";
    return `<article class="dash-metric${mod}">
      <div class="dash-metric__icon" aria-hidden="true">${icon}</div>
      <div class="dash-metric__body">
        <span class="dash-metric__label">${escapeHtml(label)}</span>
        <strong class="dash-metric__value">${escapeHtml(String(value))}</strong>
        ${sub ? `<span class="dash-metric__sub">${escapeHtml(sub)}</span>` : ""}
      </div>
    </article>`;
  }

  function dashBuildMetricsStrip(snap, user) {
    if (!snap) return "";
    const complianceTone = snap.compliancePct >= 80 ? "ok" : snap.compliancePct >= 50 ? "warn" : "alert";
    const cards = [
      dashBuildMetricCard(IC.truck || "", "Vehículos en ruta", snap.vehicleIdsEnRuta, "Activos ahora", "live"),
      dashBuildMetricCard(IC.compass || "", "Asignados hoy", snap.assignedToday, "Con viaje programado", ""),
      dashBuildMetricCard(IC.check || "", "Completados", snap.completedToday, "Entregas cerradas", "ok"),
      dashBuildMetricCard(
        IC.clock || "",
        "Con retraso",
        snap.delayedToday,
        snap.delayedToday ? "Requieren seguimiento" : "Sin desvíos",
        snap.delayedToday ? "alert" : "ok"
      )
    ];
    const rings = `<div class="dash-metrics-rings">
      ${dashBuildRing(snap.compliancePct, "Cumplimiento", complianceTone)}
      ${!isPortalClientUser(user) ? dashBuildRing(snap.fleetUtilPct, "Utilización flota", "") : ""}
    </div>`;
    return `<section class="dash-metrics" aria-label="Indicadores del día">
      <div class="dash-metrics-cards">${cards.join("")}</div>
      ${rings}
    </section>`;
  }

  function dashBuildVehicleMiniBars(trips) {
    if (!trips.length) return "";
    const segments = trips
      .map((r) => {
        const tone = dashRequestOutcomeTone(r.status);
        const title = `${r.requestNumber || r.id}: ${prettyStatus(r.status, "request")}`;
        return `<i class="dash-mini-bar dash-mini-bar--${tone}" style="flex:${trips.length > 1 ? 1 : trips.length}" title="${escapeAttr(title)}"></i>`;
      })
      .join("");
    return `<div class="dash-mini-bars" aria-hidden="true">${segments}</div>`;
  }

  function dashBuildVehicleCard(group) {
    const plate = String(group.plate || "Sin placa").trim();
    const driver = String(group.driverName || "Sin conductor").trim();
    const trips = group.trips || [];
    const completed = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
    const liveCount = trips.filter((r) => dashRequestOutcomeTone(r.status) === "live").length;
    const cardStatus = liveCount
      ? "en-ruta"
      : completed === trips.length && trips.length
        ? "cerrado"
        : trips.length
          ? "programado"
          : "libre";
    const statusLabel =
      cardStatus === "en-ruta"
        ? "En ruta"
        : cardStatus === "cerrado"
          ? "Cerrado"
          : cardStatus === "programado"
            ? "Programado"
            : "Libre";
    const rows = trips
      .map((r) => {
        const delivery = fmtTimeOnly(r.deliveredAt || r.trip?.etaDelivery || r.deliveryAt);
        const delayed = dashTripIsDelayed(r);
        return `<tr class="${delayed ? "dash-row--delayed" : ""}">
        <td><button type="button" class="dash-trip-link" data-action="detail" data-id="${escapeAttr(r.id)}">${escapeHtml(String(r.requestNumber || r.id))}</button></td>
        <td>${escapeHtml(String(r.clientName || "—"))}<br><span class="muted">${escapeHtml(formatRoute(r))}</span></td>
        <td>${dashStatusPill(r.status)}</td>
        <td>${delivery}${delayed ? ` <span class="dash-delay-tag" title="Fuera de ventana">${IC.alertTriangle || "!"}</span>` : ""}</td>
      </tr>`;
      })
      .join("");
    const table = rows
      ? `<div class="dash-vehicle__table-wrap"><table class="dash-vehicle__table"><thead><tr>
        <th>Solicitud</th><th>Cliente / ruta</th><th>Estado</th><th>Entrega</th>
      </tr></thead><tbody>${rows}</tbody></table></div>`
      : `<p class="muted dash-vehicle__empty">Sin viajes en este vehículo.</p>`;
    const searchBlob = [plate, driver, ...trips.map((r) => `${r.requestNumber} ${r.clientName} ${formatRoute(r)}`)].join(" ");
    const pulse = cardStatus === "en-ruta" ? `<span class="dash-live-pulse" aria-hidden="true"></span>` : "";
    return `<article class="dash-vehicle dash-vehicle--${cardStatus}" data-plate="${escapeAttr(plate)}" data-driver="${escapeAttr(driver)}" data-status="${escapeAttr(cardStatus)}" data-search="${escapeAttr(searchBlob)}">
    <header class="dash-vehicle__head">
      <div class="dash-vehicle__id">
        <div class="dash-vehicle__plate">${pulse}<strong>${escapeHtml(plate)}</strong></div>
        <span>${escapeHtml(driver)} · ${trips.length} viaje${trips.length === 1 ? "" : "s"}</span>
      </div>
      <span class="dash-vehicle__badge dash-vehicle__badge--${cardStatus}">${escapeHtml(statusLabel)}</span>
    </header>
    ${dashBuildVehicleMiniBars(trips)}
    ${table}
  </article>`;
  }

  function dashBuildAlerts(items) {
    const attention = (items || []).filter((item) => Number(item?.value) > 0).slice(0, 5);
    if (!attention.length) {
      return `<p class="dash-alert dash-alert--ok" role="status">${IC.check} Operación al día — sin pendientes críticos</p>`;
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

  function dashBuildQuickActions(user) {
    const actions = [];
    if (isViewAllowedForUser(user, "transport-trips")) {
      actions.push({ view: "transport-trips", label: "Asignar viajes", icon: IC.truck });
    }
    if (isViewAllowedForUser(user, "requests")) {
      actions.push({ view: "requests", label: "Solicitudes", icon: IC.inbox });
    }
    if (isViewAllowedForUser(user, "calendar")) {
      actions.push({ view: "calendar", label: "Calendario", icon: IC.calendar });
    }
    if (isViewAllowedForUser(user, "reports")) {
      actions.push({ view: "reports", label: "Informes", icon: IC.file });
    }
    if (canAccessAuthorizationsView?.(user) && isViewAllowedForUser(user, "authorizations")) {
      actions.push({ view: "authorizations", label: "Autorizaciones", icon: IC.shield });
    }
    if (!actions.length) return "";
    return actions
      .map(
        (a) =>
          `<button type="button" class="dash-action" data-action="dash-nav" data-target-view="${escapeAttr(a.view)}">${a.icon}<span>${escapeHtml(a.label)}</span></button>`
      )
      .join("");
  }

  function dashBuildPulsePanel(snap, user) {
    if (!snap) return "";
    const items = [
      {
        label: "Sin novedad",
        value: String(snap.okDeliveries),
        tone: ""
      },
      { label: "Con incidencia", value: String(snap.issueDeliveries), tone: snap.issueDeliveries ? "warn" : "" },
      { label: "En standby", value: String(snap.standbyToday), tone: snap.standbyToday ? "warn" : "" },
      { label: "Con retraso", value: String(snap.delayedToday), tone: snap.delayedToday ? "alert" : "" }
    ];
    if (!isPortalClientUser(user)) {
      items.push(
        { label: "Pendientes de asignar", value: String(snap.pendingAssignment), tone: snap.pendingAssignment ? "warn" : "" },
        { label: "Alertas documentales", value: String(snap.docRisk), tone: snap.docRisk ? "warn" : "" },
        { label: "Notificaciones", value: String(snap.unreadNotifications), tone: snap.unreadNotifications ? "warn" : "" }
      );
    }
    const rows = items
      .filter((item) => Number.parseInt(String(item.value), 10) > 0 || ["Sin novedad", "Notificaciones"].includes(item.label))
      .map((item) => {
        const mod = item.tone ? ` dash-pulse-item--${item.tone}` : "";
        return `<li class="dash-pulse-item${mod}"><span class="dash-pulse-item__label">${escapeHtml(item.label)}</span><span class="dash-pulse-item__value">${escapeHtml(item.value)}</span></li>`;
      })
      .join("");
    const foot = isPortalClientUser(user)
      ? `<p>Sus indicadores reflejan solo las solicitudes de su empresa.</p>`
      : `<p>Actualizado ${escapeHtml(fmtTimeOnly(snap.generatedAt) || "ahora")} · hora Colombia</p>`;
    return `<aside class="dash-panel dash-panel--pulse" aria-label="Pulso operativo del día">
    <header class="dash-panel__head"><div><h3>Pulso operativo</h3><p>Desglose del día</p></div></header>
    <ul class="dash-pulse-list">${rows}</ul>
    <footer class="dash-pulse-foot">${foot}</footer>
  </aside>`;
  }

  function dashActivitySortKey(request) {
    const candidates = [
      request?.updatedAt,
      request?.deliveredAt,
      request?.trip?.etaDelivery,
      request?.deliveryAt,
      request?.trip?.etaPickup,
      request?.pickupAt,
      request?.createdAt
    ];
    for (const value of candidates) {
      const ts = new Date(value).getTime();
      if (Number.isFinite(ts)) return ts;
    }
    return 0;
  }

  function dashBuildActivityFeed(trips) {
    const recent = [...(trips || [])].sort((a, b) => dashActivitySortKey(b) - dashActivitySortKey(a)).slice(0, 8);
    if (!recent.length) {
      return `<p class="dash-activity-empty muted">Sin movimientos recientes hoy.</p>`;
    }
    return `<ul class="dash-activity-list">${recent
      .map((r) => {
        const when = fmtTimeOnly(r.updatedAt || r.deliveredAt || r.trip?.etaDelivery || r.pickupAt) || "—";
        const tone = dashRequestOutcomeTone(r.status);
        return `<li class="dash-activity-item dash-activity-item--${tone}">
        <time>${escapeHtml(when)}</time>
        <button type="button" class="dash-activity-link" data-action="detail" data-id="${escapeAttr(r.id)}">
          <strong>${escapeHtml(String(r.requestNumber || r.id))}</strong>
          <span>${escapeHtml(String(r.clientName || "Cliente"))} · ${escapeHtml(formatRoute(r))}</span>
        </button>
        ${dashStatusPill(r.status)}
      </li>`;
      })
      .join("")}</ul>`;
  }

  function dashBuildClientRecentTable(list) {
    const recent = [...list].sort((a, b) => dashActivitySortKey(b) - dashActivitySortKey(a)).slice(0, 6);
    if (!recent.length) {
      return `<p class="muted" style="padding:1rem">Aún no tiene solicitudes registradas.</p>`;
    }
    const rows = recent
      .map(
        (r) => `<tr>
      <td><button type="button" class="dash-trip-link" data-action="detail" data-id="${escapeAttr(r.id)}">${escapeHtml(String(r.requestNumber || r.id))}</button></td>
      <td>${escapeHtml(formatRoute(r))}</td>
      <td>${dashStatusPill(r.status)}</td>
      <td>${fmtTimeOnly(r.pickupAt || r.trip?.etaPickup)}</td>
    </tr>`
      )
      .join("");
    return `<div class="dash-vehicle__table-wrap"><table class="dash-vehicle__table dash-client-table"><thead><tr>
      <th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Recogida</th>
    </tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function dashBuildClientPanel(list, user, snap) {
    const pending = list.filter((r) => r.status === STATUS.PENDIENTE).length;
    const active = list.filter((r) => r.trip && tripRequestStatusIsOperational(r.status)).length;
    const done = list.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
    const inTransit = list.filter((r) => String(r.status) === STATUS.EN_TRANSITO).length;
    const stats = [
      { label: "En tránsito", value: inTransit, tone: "live" },
      { label: "Activas", value: active, tone: "" },
      { label: "En revisión", value: pending, tone: pending ? "warn" : "" },
      { label: "Completadas", value: done, tone: "ok" }
    ];
    const statCards = stats
      .map(
        (s) => `<div class="dash-client-stat dash-client-stat--${s.tone || "neutral"}"><dt>${escapeHtml(s.label)}</dt><dd>${s.value}</dd></div>`
      )
      .join("");
    const cta = isViewAllowedForUser(user, "requests")
      ? `<button type="button" class="btn btn-primary" data-action="dash-nav" data-target-view="requests">${IC.plus || ""} Nueva solicitud</button>`
      : "";
    const compliance = snap ? dashBuildRing(snap.compliancePct, "Cumplimiento entregas", snap.compliancePct >= 80 ? "ok" : "warn") : "";
    return `<div class="dash-client-layout">
    <section class="dash-panel dash-panel--client">
      <header class="dash-panel__head"><div><h3>Mi operación</h3><p>Resumen de sus solicitudes de transporte refrigerado</p></div>${cta ? `<div class="dash-panel__tools">${cta}</div>` : ""}</header>
      <dl class="dash-client-grid">${statCards}</dl>
    </section>
    <section class="dash-panel dash-panel--client-recent">
      <header class="dash-panel__head"><div><h3>Actividad reciente</h3><p>Últimas solicitudes y su estado</p></div></header>
      ${dashBuildClientRecentTable(list)}
    </section>
    ${compliance ? `<aside class="dash-panel dash-panel--client-ring">${compliance}</aside>` : ""}
  </div>`;
  }

  function dashCountFleetByStatus(groups) {
    const counts = { all: groups.length, "en-ruta": 0, programado: 0, cerrado: 0 };
    groups.forEach((g) => {
      const trips = g.trips || [];
      const liveCount = trips.filter((r) => dashRequestOutcomeTone(r.status) === "live").length;
      const completed = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
      const status = liveCount
        ? "en-ruta"
        : completed === trips.length && trips.length
          ? "cerrado"
          : trips.length
            ? "programado"
            : "libre";
      if (status in counts) counts[status] += 1;
    });
    return counts;
  }

  function dashBuildFleetTabs(counts) {
    const tabs = [
      { id: "all", label: "Todos" },
      { id: "en-ruta", label: "En ruta" },
      { id: "programado", label: "Programados" },
      { id: "cerrado", label: "Cerrados" }
    ];
    return tabs
      .map((t) => {
        const n = counts[t.id] ?? 0;
        const active = t.id === "all" ? " is-active" : "";
        return `<button type="button" class="dash-tab${active}" data-dash-tab="${escapeAttr(t.id)}">${escapeHtml(t.label)} <em>${n}</em></button>`;
      })
      .join("");
  }

  function dashOpsStatusLabel(snap) {
    if (!snap) return "Operación";
    if (snap.delayedToday > 0) return "Atención requerida";
    if (snap.standbyToday > 0 || snap.pendingAssignment > 0) return "Seguimiento activo";
    if (snap.vehicleIdsEnRuta > 0) return "Operación en curso";
    return "Operación al día";
  }

  function dashOpsStatusTone(snap) {
    if (!snap) return "neutral";
    if (snap.delayedToday > 0) return "alert";
    if (snap.standbyToday > 0 || snap.pendingAssignment > 0) return "warn";
    if (snap.vehicleIdsEnRuta > 0) return "live";
    return "ok";
  }

  function bindDashboardControls() {
    if (String(state.currentView || "") !== "dashboard" || !nodes.viewRoot) return;
    const root = nodes.viewRoot.querySelector(".dashboard-studio");
    if (!root) return;
    const search = root.querySelector("#dash-search");
    const filter = root.querySelector("#dash-filter");
    const cards = [...root.querySelectorAll(".dash-vehicle")];
    const countEl = root.querySelector("#dash-fleet-count");
    let activeTab = "all";

    const apply = () => {
      const q = String(search?.value || "").trim().toLowerCase();
      const f = String(filter?.value || activeTab || "all");
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
    filter?.addEventListener("change", () => {
      activeTab = String(filter.value || "all");
      root.querySelectorAll(".dash-tab").forEach((tab) => {
        tab.classList.toggle("is-active", tab.dataset.dashTab === activeTab);
      });
      apply();
    });

    root.querySelectorAll(".dash-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        activeTab = String(tab.dataset.dashTab || "all");
        if (filter) filter.value = activeTab;
        root.querySelectorAll(".dash-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
        apply();
      });
    });

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
    const greeting = colombiaTimeOfDayGreeting(new Date());
    const displayName = getPortalUserDisplayName(user) || user?.name || "Operador";
    const firstName = escapeHtml(String(displayName).trim().split(/\s+/)[0] || displayName);
    const opsTone = dashOpsStatusTone(snap);
    const opsLabel = dashOpsStatusLabel(snap);
    const quickActions = dashBuildQuickActions(user);

    const hero = `<header class="dash-cc">
      <div class="dash-cc__main">
        <div class="dash-cc__status dash-cc__status--${opsTone}">
          <span class="dash-cc__status-dot" aria-hidden="true"></span>
          ${escapeHtml(opsLabel)}
        </div>
        <h2 class="dash-cc__title">${escapeHtml(greeting)}, ${firstName}</h2>
        <p class="dash-cc__meta">${escapeHtml(longDate)}${snap?.generatedAt ? ` · Actualizado ${escapeHtml(fmtTimeOnly(snap.generatedAt))}` : ""}</p>
      </div>
      ${quickActions ? `<nav class="dash-cc__actions" aria-label="Accesos rápidos">${quickActions}</nav>` : ""}
      <div class="dash-cc__alerts" role="region" aria-label="Requiere atención">${dashBuildAlerts(attentionItems)}</div>
    </header>`;

    if (isPortalClientUser(user)) {
      return `${scopeBar}<section class="dashboard-studio dashboard-studio--client">${hero}${dashBuildClientPanel(list, user, snap)}</section>`;
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
    const groupList = [...groups.values()].sort((a, b) => String(a.plate).localeCompare(String(b.plate), "es"));
    const fleetCards = groupList.map((g) => dashBuildVehicleCard(g)).join("");
    const fleetEmpty =
      fleetCards ||
      `<div class="dash-empty">
        <div class="dash-empty__icon" aria-hidden="true">${IC.truck || ""}</div>
        <p><strong>Sin vehículos activos hoy</strong></p>
        <p class="muted">Asigne rutas desde Transporte · Viajes para ver la flota en tiempo real.</p>
        ${isViewAllowedForUser(user, "transport-trips") ? `<button type="button" class="btn btn-primary btn-sm" data-action="dash-nav" data-target-view="transport-trips">${IC.truck || ""} Ir a asignación</button>` : ""}
      </div>`;
    const tabCounts = dashCountFleetByStatus(groupList);

    const body = `${dashBuildMetricsStrip(snap, user)}
    <div class="dash-layout">
    <section class="dash-panel dash-panel--fleet" aria-label="Flota en operación">
      <header class="dash-panel__head">
        <div>
          <h3>Torre de flota</h3>
          <p>Vehículos con actividad programada para hoy · seguimiento en vivo</p>
        </div>
        <div class="dash-panel__tools">
          <label class="dash-search">${IC.search}<input id="dash-search" type="search" placeholder="Buscar placa, conductor o cliente…" autocomplete="off" /></label>
          <label class="dash-filter visually-hidden">Estado
            <select id="dash-filter" aria-hidden="true" tabindex="-1">
              <option value="all">Todos</option>
              <option value="en-ruta">En ruta</option>
              <option value="programado">Programados</option>
              <option value="cerrado">Cerrados</option>
            </select>
          </label>
          <span class="dash-count" id="dash-fleet-count">${groups.size} vehículos</span>
        </div>
      </header>
      <div class="dash-tabs" role="tablist" aria-label="Filtrar flota">${dashBuildFleetTabs(tabCounts)}</div>
      <div class="dash-fleet-list">${fleetEmpty}</div>
    </section>
    <div class="dash-side">
      ${dashBuildPulsePanel(snap, user)}
      <aside class="dash-panel dash-panel--activity" aria-label="Actividad reciente">
        <header class="dash-panel__head"><div><h3>Últimos movimientos</h3><p>Actualizaciones del día</p></div></header>
        ${dashBuildActivityFeed(todayTrips)}
      </aside>
    </div>
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
