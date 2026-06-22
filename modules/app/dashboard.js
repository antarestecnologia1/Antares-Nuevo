/**
 * Portal — Dashboard (torre operativa y estadísticas).
 * Módulo autocontenido: helpers, vista HTML y listeners post-render.
 * Carga con `defer` después de `app.js` (depende de estado global del portal).
 *
 * Rediseño visual completo — Antares Portal v2
 */
(function registerDashboardPortalModule() {
  "use strict";

  /* ─────────────────────────────────────────────────────────────
     HELPERS DE TONO Y ESTADO
  ───────────────────────────────────────────────────────────── */

  function dashDomain() {
    return typeof AntaresDashboardDomain !== "undefined" ? AntaresDashboardDomain : null;
  }

  function dashRequestOutcomeTone(status) {
    const fn = dashDomain()?.requestOutcomeTone;
    return typeof fn === "function" ? fn(status) : "neutral";
  }

  function dashTripIsDelayed(request) {
    const fn = dashDomain()?.requestIsDelayed;
    return typeof fn === "function" ? fn(request) : false;
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

  /* ─────────────────────────────────────────────────────────────
     COMPONENTES ATOM
  ───────────────────────────────────────────────────────────── */

  function dashStatusPill(status) {
    const tone = dashRequestOutcomeTone(status);
    return `<span class="dash-pill dash-pill--${tone}">${prettyStatus(status, "request")}</span>`;
  }

  /** Anillo SVG de cumplimiento */
  function dashBuildRing(pct, label, tone) {
    const safe = Math.min(100, Math.max(0, Number(pct) || 0));
    const r = 20;
    const c = 2 * Math.PI * r;
    const offset = c - (safe / 100) * c;
    const mod = tone ? ` dash-ring--${tone}` : "";
    return `<div class="dash-ring${mod}" role="img" aria-label="${escapeAttr(label)}: ${safe}%">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle class="dash-ring__bg" cx="24" cy="24" r="${r}"></circle>
        <circle class="dash-ring__fg" cx="24" cy="24" r="${r}"
          stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"></circle>
      </svg>
      <div class="dash-ring__inner">
        <strong class="dash-ring__pct">${safe}%</strong>
        <span class="dash-ring__label">${escapeHtml(label)}</span>
      </div>
    </div>`;
  }

  function dashFormatTimeAgo(iso) {
    const ts = new Date(iso).getTime();
    if (!Number.isFinite(ts)) return "ahora";
    const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (mins < 1) return "ahora";
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.round(mins / 60);
    return `hace ${hrs} h`;
  }

  /** KPI premium con gradiente y jerarquía visual */
  function dashBuildPremiumKpi(icon, label, value, sub, tone, hero) {
    const mod = tone ? ` dash-kpi--${tone}` : "";
    const heroMod = hero ? " dash-kpi--hero" : "";
    return `<article class="dash-kpi${mod}${heroMod}">
      <div class="dash-kpi__glow" aria-hidden="true"></div>
      <div class="dash-kpi__icon" aria-hidden="true">${icon}</div>
      <strong class="dash-kpi__value">${escapeHtml(String(value))}</strong>
      <span class="dash-kpi__label">${escapeHtml(label)}</span>
      ${sub ? `<span class="dash-kpi__sub">${escapeHtml(sub)}</span>` : ""}
    </article>`;
  }

  /** Tarjeta de métrica superior (legacy / cliente) */
  function dashBuildMetricCard(icon, label, value, sub, tone) {
    const mod = tone ? ` dash-metric--${tone}` : "";
    return `<article class="dash-metric${mod}">
      <div class="dash-metric__top">
        <span class="dash-metric__label">${escapeHtml(label)}</span>
        <span class="dash-metric__icon" aria-hidden="true">${icon}</span>
      </div>
      <strong class="dash-metric__value">${escapeHtml(String(value))}</strong>
      ${sub ? `<span class="dash-metric__sub">${escapeHtml(sub)}</span>` : ""}
    </article>`;
  }

  /* ─────────────────────────────────────────────────────────────
     STRIP DE MÉTRICAS
  ───────────────────────────────────────────────────────────── */

  function dashBuildMetricsStrip(snap, user, exec) {
    if (!snap) return "";
    const complianceSub =
      snap.compliancePct >= 80 ? "Meta alcanzada" : snap.compliancePct >= 50 ? "Seguimiento activo" : "Bajo objetivo";
    const cards = [
      dashBuildPremiumKpi(IC.truck || "🚚", "En ruta", snap.vehicleIdsEnRuta, "Vehículos activos", "live"),
      dashBuildPremiumKpi(IC.compass || "📋", "Asignados", snap.assignedToday, "Programados hoy", "blue"),
      dashBuildPremiumKpi(IC.check || "✅", "Completados", snap.completedToday, "Entregas cerradas", "purple"),
      dashBuildPremiumKpi(
        IC.alertTriangle || "⚠️",
        "Retrasos",
        snap.delayedToday,
        snap.delayedToday ? "Requieren acción" : "Sin desvíos",
        snap.delayedToday ? "alert" : "muted"
      ),
      dashBuildPremiumKpi(
        IC.activity || "🎯",
        "Cumplimiento SLA",
        `${snap.compliancePct}%`,
        complianceSub,
        snap.compliancePct >= 80 ? "hero-ok" : snap.compliancePct >= 50 ? "hero-warn" : "hero-alert",
        true
      )
    ];
    const execRow = exec
      ? `<div class="dash-exec-strip" aria-label="Métricas ejecutivas">
          <div class="dash-exec-item"><span>Puntualidad</span><strong>${exec.punctualityPct}%</strong></div>
          <div class="dash-exec-item"><span>Utilización flota</span><strong>${exec.fleetUtilPct}%</strong></div>
          <div class="dash-exec-item"><span>Combustible hoy</span><strong>${exec.fuelLiters > 0 ? `${exec.fuelLiters} L` : "—"}</strong></div>
          <div class="dash-exec-item"><span>Km recorridos</span><strong>${exec.kmToday > 0 ? `${exec.kmToday.toLocaleString("es-CO")} km` : "—"}</strong></div>
        </div>`
      : "";
    return `<section class="dash-metrics dash-metrics--tower" aria-label="Indicadores del día">
      <div class="dash-metrics-cards dash-kpi-grid">${cards.join("")}</div>
      ${execRow}
    </section>`;
  }

  function dashBuildStatusChips(snap, attentionItems) {
    const alertCount =
      (snap?.unreadNotifications || 0) +
      (attentionItems || []).reduce((acc, item) => acc + (Number(item?.value) > 0 ? Number(item.value) : 0), 0);
    const docCount = snap?.docRisk || 0;
    const opsTone = dashOpsStatusTone(snap);
    const opsLabels = { live: "Operación en curso", ok: "Sistema operativo", warn: "Seguimiento activo", alert: "Atención requerida", neutral: "Operación" };
    return `<div class="dash-cc__chips" role="status">
      <button type="button" class="dash-chip dash-chip--warn" data-action="dash-nav" data-target-view="notifications">
        <span class="dash-chip__ico" aria-hidden="true">🔔</span>
        <span>${alertCount} alerta${alertCount === 1 ? "" : "s"}</span>
      </button>
      ${docCount > 0 ? `<button type="button" class="dash-chip dash-chip--doc" data-action="dash-nav" data-target-view="transport-vehicles">
        <span class="dash-chip__ico" aria-hidden="true">📄</span>
        <span>${docCount} doc${docCount === 1 ? "" : "s"} por vencer</span>
      </button>` : ""}
      <span class="dash-chip dash-chip--${opsTone}">
        <span class="dash-chip__dot" aria-hidden="true"></span>
        <span>${escapeHtml(opsLabels[opsTone] || "Operación")}</span>
      </span>
    </div>`;
  }

  function dashBuildLiveMap(markers) {
    const list = Array.isArray(markers) ? markers : [];
    const pins = list
      .map(
        (m) => `<button type="button" class="dash-map-pin dash-map-pin--${m.delayed ? "alert" : "live"}" style="left:${m.x}%;top:${m.y}%" title="${escapeAttr(`${m.plate} · ${m.city}`)}" data-action="dash-focus-fleet" data-dash-tab="en-ruta">
          <span class="dash-map-pin__ico" aria-hidden="true">🚚</span>
          <span class="dash-map-pin__label">${escapeHtml(m.plate)}</span>
        </button>`
      )
      .join("");
    const empty = !list.length
      ? `<div class="dash-map-empty">
          <span aria-hidden="true">🗺️</span>
          <p>Sin unidades en movimiento</p>
          <span class="muted">Los vehículos activos aparecerán aquí en tiempo real</span>
        </div>`
      : "";
    return `<section class="dash-panel dash-panel--map" aria-label="Mapa en vivo">
      <header class="dash-panel__head dash-panel__head--compact">
        <div><h3>Mapa en vivo</h3><p>${list.length} vehículo${list.length === 1 ? "" : "s"} en operación</p></div>
        <span class="dash-live-badge"><span class="dash-live-pulse" aria-hidden="true"></span> LIVE</span>
      </header>
      <div class="dash-map-stage">
        <div class="dash-map-grid" aria-hidden="true"></div>
        <div class="dash-map-terrain" aria-hidden="true"></div>
        ${pins}
        ${empty}
      </div>
    </section>`;
  }

  function dashBuildCriticalAlertsPanel(alerts) {
    const items = Array.isArray(alerts) ? alerts : [];
    const body = items.length
      ? `<ul class="dash-critical-list">${items
          .map((a) => {
            const navAttrs = a.targetView
              ? `data-action="${a.fleetTab ? "dash-focus-fleet" : "dash-attention-nav"}" data-target-view="${escapeAttr(a.targetView)}"${a.fleetTab ? ` data-dash-tab="${escapeAttr(a.fleetTab)}"` : ""}`
              : "";
            const title = a.help ? ` title="${escapeAttr(String(a.help))}"` : "";
            return `<li>
              <button type="button" class="dash-critical-item dash-critical-item--${escapeAttr(a.tone || "warn")}" ${navAttrs}${title}>
                <span class="dash-critical-item__ico" aria-hidden="true">⚠️</span>
                <span class="dash-critical-item__text">${escapeHtml(String(a.message || ""))}</span>
              </button>
            </li>`;
          })
          .join("")}</ul>`
      : `<p class="dash-critical-ok" role="status">${IC.check || "✓"} Operación al día — sin alertas críticas</p>`;
    return `<aside class="dash-panel dash-panel--critical" aria-label="Alertas críticas">
      <header class="dash-panel__head dash-panel__head--compact">
        <div><h3>Alertas críticas</h3><p>Requieren acción inmediata</p></div>
      </header>
      ${body}
    </aside>`;
  }

  function dashBuildAnalyticsRow(snap, hourly, fleetPie) {
    if (!snap) return "";
    const complianceTone = snap.compliancePct >= 80 ? "ok" : snap.compliancePct >= 50 ? "warn" : "alert";
    const hourlyBars = (hourly || [])
      .map(
        (b) => `<div class="dash-hour-row">
          <span class="dash-hour-label">${escapeHtml(b.label)}</span>
          <div class="dash-hour-track"><i class="dash-hour-fill" style="width:${b.pct}%"></i></div>
          <span class="dash-hour-val">${b.count}</span>
        </div>`
      )
      .join("");
    const pieTotal = Math.max(1, fleetPie?.total || fleetPie?.activos + fleetPie?.espera + fleetPie?.mantenimiento || 1);
    const aPct = Math.round(((fleetPie?.activos || 0) / pieTotal) * 100);
    const ePct = Math.round(((fleetPie?.espera || 0) / pieTotal) * 100);
    const mPct = Math.max(0, 100 - aPct - ePct);
    const pieStyle = `background: conic-gradient(var(--dash-live-mid) 0% ${aPct}%, var(--dash-warn-mid) ${aPct}% ${aPct + ePct}%, var(--dash-alert-mid) ${aPct + ePct}% 100%)`;
    return `<section class="dash-analytics" aria-label="Análisis operativo del día">
      <article class="dash-panel dash-panel--chart">
        <header class="dash-panel__head dash-panel__head--compact">
          <div><h3>Cumplimiento diario</h3><p>Entregas cerradas vs programadas</p></div>
        </header>
        <div class="dash-compliance-block dash-compliance-block--${complianceTone}">
          <div class="dash-compliance-bar" role="progressbar" aria-valuenow="${snap.compliancePct}" aria-valuemin="0" aria-valuemax="100">
            <i style="width:${snap.compliancePct}%"></i>
          </div>
          <strong class="dash-compliance-pct">${snap.compliancePct}%</strong>
        </div>
      </article>
      <article class="dash-panel dash-panel--chart">
        <header class="dash-panel__head dash-panel__head--compact">
          <div><h3>Entregas por hora</h3><p>Distribución del día</p></div>
        </header>
        <div class="dash-hour-chart">${hourlyBars || '<p class="muted dash-chart-empty">Sin entregas registradas hoy.</p>'}</div>
      </article>
      <article class="dash-panel dash-panel--chart">
        <header class="dash-panel__head dash-panel__head--compact">
          <div><h3>Estado de flota</h3><p>Activos · Espera · Mantenimiento</p></div>
        </header>
        <div class="dash-fleet-pie-wrap">
          <div class="dash-fleet-pie" style="${pieStyle}" role="img" aria-label="Flota: ${fleetPie?.activos || 0} activos, ${fleetPie?.espera || 0} en espera, ${fleetPie?.mantenimiento || 0} en mantenimiento">
            <div class="dash-fleet-pie__hole"><strong>${pieTotal}</strong><span>Total</span></div>
          </div>
          <ul class="dash-fleet-legend">
            <li><i class="dash-legend-dot dash-legend-dot--live"></i>Activos <strong>${fleetPie?.activos || 0}</strong></li>
            <li><i class="dash-legend-dot dash-legend-dot--warn"></i>Espera <strong>${fleetPie?.espera || 0}</strong></li>
            <li><i class="dash-legend-dot dash-legend-dot--alert"></i>Mantenimiento <strong>${fleetPie?.mantenimiento || 0}</strong></li>
          </ul>
        </div>
      </article>
    </section>`;
  }

  /* ─────────────────────────────────────────────────────────────
     MINI BARRAS DE ESTADO
  ───────────────────────────────────────────────────────────── */

  function dashBuildVehicleMiniBars(trips) {
    if (!trips.length) return "";
    const segments = trips
      .map((r) => {
        const tone = dashRequestOutcomeTone(r.status);
        const title = `${r.requestNumber || r.id}: ${prettyStatus(r.status, "request")}`;
        return `<i class="dash-mini-bar dash-mini-bar--${tone}" title="${escapeAttr(title)}"></i>`;
      })
      .join("");
    return `<div class="dash-mini-bars" aria-hidden="true">${segments}</div>`;
  }

  /* ─────────────────────────────────────────────────────────────
     TARJETA DE VEHÍCULO
  ───────────────────────────────────────────────────────────── */

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

    const statusLabel = { "en-ruta": "En ruta", cerrado: "Cerrado", programado: "Programado", libre: "Libre" }[cardStatus] || cardStatus;

    const rows = trips
      .map((r) => {
        const delivery = fmtTimeOnly(r.deliveredAt || r.trip?.etaDelivery || r.deliveryAt);
        const delayed = dashTripIsDelayed(r);
        return `<tr class="${delayed ? "dash-row--delayed" : ""}">
          <td>
            <button type="button" class="dash-trip-link" data-action="detail" data-id="${escapeAttr(r.id)}">
              ${escapeHtml(String(r.requestNumber || r.id))}
            </button>
          </td>
          <td>
            <span class="dash-trip-client" title="${escapeAttr(String(r.clientName || "—"))}">${escapeHtml(String(r.clientName || "—"))}</span>
            <span class="dash-trip-route muted" title="${escapeAttr(formatRoute(r))}">${escapeHtml(formatRoute(r))}</span>
          </td>
          <td>${dashStatusPill(r.status)}</td>
          <td class="dash-trip-eta">
            ${delivery}
            ${delayed ? `<span class="dash-delay-tag" title="Fuera de ventana">${IC.alertTriangle || "!"}</span>` : ""}
          </td>
        </tr>`;
      })
      .join("");

    const table = rows
      ? `<div class="dash-vehicle__table-wrap">
          <table class="dash-vehicle__table">
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Cliente / ruta</th>
                <th>Estado</th>
                <th>Entrega</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
         </div>`
      : `<p class="muted dash-vehicle__empty">Sin viajes en este vehículo.</p>`;

    const searchBlob = [plate, driver, ...trips.map((r) => `${r.requestNumber} ${r.clientName} ${formatRoute(r)}`)].join(" ");
    const pulse = cardStatus === "en-ruta" ? `<span class="dash-live-pulse" aria-hidden="true"></span>` : "";

    return `<article
      class="dash-vehicle dash-vehicle--${cardStatus}"
      data-plate="${escapeAttr(plate)}"
      data-driver="${escapeAttr(driver)}"
      data-status="${escapeAttr(cardStatus)}"
      data-search="${escapeAttr(searchBlob)}">
      <header class="dash-vehicle__head">
        <div class="dash-vehicle__id">
          <div class="dash-vehicle__plate">${pulse}<strong>${escapeHtml(plate)}</strong></div>
          <span class="muted">${escapeHtml(driver)} · ${trips.length} viaje${trips.length === 1 ? "" : "s"}</span>
        </div>
        <span class="dash-vehicle__badge dash-vehicle__badge--${cardStatus}">${escapeHtml(statusLabel)}</span>
      </header>
      ${dashBuildVehicleMiniBars(trips)}
      ${table}
    </article>`;
  }

  /* ─────────────────────────────────────────────────────────────
     TABS DE FLOTA
  ───────────────────────────────────────────────────────────── */

  function dashBuildFleetTabs(counts, activeTab = "all") {
    const tabs = [
      { id: "all", label: "Todos" },
      { id: "en-ruta", label: "En ruta" },
      { id: "programado", label: "Programados" },
      { id: "cerrado", label: "Cerrados" }
    ];
    return tabs
      .map((t) => {
        const n = counts[t.id] ?? 0;
        const active = t.id === activeTab;
        return `<button type="button" role="tab" class="dash-tab${active ? " is-active" : ""}" data-dash-tab="${escapeAttr(t.id)}" aria-selected="${active ? "true" : "false"}" tabindex="${active ? "0" : "-1"}">${escapeHtml(t.label)}<em>${n}</em></button>`;
      })
      .join("");
  }

  /* ─────────────────────────────────────────────────────────────
     PANEL ALERTAS
  ───────────────────────────────────────────────────────────── */

  function dashBuildAlerts(items) {
    const attention = (items || []).filter((item) => Number(item?.value) > 0).slice(0, 5);
    if (!attention.length) {
      return `<p class="dash-alert dash-alert--ok" role="status">${IC.check || ""} Operación al día — sin pendientes críticos</p>`;
    }
    return attention
      .map((item) => {
        const tone = item?.tone === "alert" ? "alert" : "warn";
        const target = String(item?.targetView || "").trim();
        const title = item?.help ? ` title="${escapeAttr(String(item.help))}"` : "";
        const fleetFocus = target === "dashboard";
        const fleetTab = item?.id === "delayed" ? "en-ruta" : "all";
        if (fleetFocus) {
          return `<button type="button"
            class="dash-alert dash-alert--${tone}"
            data-action="dash-focus-fleet"
            data-dash-tab="${escapeAttr(fleetTab)}"
            ${title}>
            <strong>${escapeHtml(String(item.value))}</strong>
            ${escapeHtml(String(item.label || ""))}
          </button>`;
        }
        return `<button type="button"
          class="dash-alert dash-alert--${tone}"
          data-action="dash-attention-nav"
          data-target-view="${escapeAttr(target)}"
          ${title}>
          <strong>${escapeHtml(String(item.value))}</strong>
          ${escapeHtml(String(item.label || ""))}
        </button>`;
      })
      .join("");
  }

  /* ─────────────────────────────────────────────────────────────
     ACCIONES RÁPIDAS
  ───────────────────────────────────────────────────────────── */

  function dashBuildQuickActions(user) {
    const actions = [];
    if (isViewAllowedForUser(user, "transport-trips"))
      actions.push({ view: "transport-trips", label: "Asignar viajes", icon: IC.truck });
    if (isViewAllowedForUser(user, "requests"))
      actions.push({ view: "requests", label: "Solicitudes", icon: IC.inbox });
    if (isViewAllowedForUser(user, "calendar"))
      actions.push({ view: "calendar", label: "Calendario", icon: IC.calendar });
    if (isViewAllowedForUser(user, "reports"))
      actions.push({ view: "reports", label: "Informes", icon: IC.file });
    if (canAccessAuthorizationsView?.(user) && isViewAllowedForUser(user, "authorizations"))
      actions.push({ view: "authorizations", label: "Autorizaciones", icon: IC.shield });
    if (!actions.length) return "";
    return actions
      .map(
        (a) =>
          `<button type="button" class="dash-action" data-action="dash-nav" data-target-view="${escapeAttr(a.view)}">${a.icon}<span>${escapeHtml(a.label)}</span></button>`
      )
      .join("");
  }

  /* ─────────────────────────────────────────────────────────────
     PANEL PULSO OPERATIVO
  ───────────────────────────────────────────────────────────── */

  function dashBuildPulsePanel(snap, user) {
    if (!snap) return "";
    const items = [
      { label: "Sin novedad", value: String(snap.okDeliveries), tone: "" },
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
      .filter(
        (item) =>
          (Number.parseInt(String(item.value), 10) > 0 || ["Sin novedad", "Notificaciones"].includes(item.label)) &&
          item.label !== "Con retraso"
      )
      .map((item) => {
        const mod = item.tone ? ` dash-pulse-item--${item.tone}` : "";
        return `<li class="dash-pulse-item${mod}">
          <span class="dash-pulse-item__label">${escapeHtml(item.label)}</span>
          <span class="dash-pulse-item__value">${escapeHtml(item.value)}</span>
        </li>`;
      })
      .join("");

    const foot = isPortalClientUser(user)
      ? `<p>Sus indicadores reflejan solo las solicitudes de su empresa.</p>`
      : `<p>Actualizado ${escapeHtml(fmtTimeOnly(snap.generatedAt) || "ahora")} · hora Colombia</p>`;

    return `<aside class="dash-panel dash-panel--pulse" aria-label="Pulso operativo del día">
      <header class="dash-panel__head">
        <div>
          <h3>Pulso operativo</h3>
          <p>Desglose complementario del día</p>
        </div>
      </header>
      <ul class="dash-pulse-list">${rows}</ul>
      <footer class="dash-pulse-foot">${foot}</footer>
    </aside>`;
  }

  /* ─────────────────────────────────────────────────────────────
     FEED DE ACTIVIDAD RECIENTE
  ───────────────────────────────────────────────────────────── */

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
          <time class="dash-activity-time">${escapeHtml(when)}</time>
          <button type="button" class="dash-activity-link" data-action="detail" data-id="${escapeAttr(r.id)}" title="${escapeAttr(`${r.requestNumber || r.id} · ${r.clientName || "Cliente"} · ${formatRoute(r)}`)}">
            <strong>${escapeHtml(String(r.requestNumber || r.id))}</strong>
            <span>${escapeHtml(String(r.clientName || "Cliente"))} · ${escapeHtml(formatRoute(r))}</span>
          </button>
          ${dashStatusPill(r.status)}
        </li>`;
      })
      .join("")}</ul>`;
  }

  /* ─────────────────────────────────────────────────────────────
     VISTA CLIENTE
  ───────────────────────────────────────────────────────────── */

  function dashBuildClientRecentTable(list) {
    const recent = [...list].sort((a, b) => dashActivitySortKey(b) - dashActivitySortKey(a)).slice(0, 6);
    if (!recent.length) {
      return `<p class="muted dash-client-empty">Aún no tiene solicitudes registradas.</p>`;
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
    return `<div class="dash-vehicle__table-wrap">
      <table class="dash-vehicle__table dash-client-table">
        <thead>
          <tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Recogida</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
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
        (s) =>
          `<div class="dash-client-stat dash-client-stat--${s.tone || "neutral"}">
            <dt>${escapeHtml(s.label)}</dt>
            <dd>${s.value}</dd>
          </div>`
      )
      .join("");
    const cta = isViewAllowedForUser(user, "requests")
      ? `<button type="button" class="btn btn-primary" data-action="dash-nav" data-target-view="requests">${IC.plus || ""} Nueva solicitud</button>`
      : "";
    const compliance = snap ? dashBuildRing(snap.compliancePct, "Cumplimiento entregas", snap.compliancePct >= 80 ? "ok" : "warn") : "";
    return `<div class="dash-client-layout">
      <section class="dash-panel dash-panel--client">
        <header class="dash-panel__head">
          <div><h3>Mi operación</h3><p>Resumen de sus solicitudes de transporte refrigerado</p></div>
          ${cta ? `<div class="dash-panel__tools">${cta}</div>` : ""}
        </header>
        <dl class="dash-client-grid">${statCards}</dl>
      </section>
      <section class="dash-panel dash-panel--client-recent">
        <header class="dash-panel__head">
          <div><h3>Actividad reciente</h3><p>Últimas solicitudes y su estado</p></div>
        </header>
        ${dashBuildClientRecentTable(list)}
      </section>
      ${compliance ? `<aside class="dash-panel dash-panel--client-ring">${compliance}</aside>` : ""}
    </div>`;
  }

  /* ─────────────────────────────────────────────────────────────
     VISTA PRINCIPAL
  ───────────────────────────────────────────────────────────── */

  function viewDashboard() {
    const user = currentUser();
    const list = getVisibleRequestsForUser(user);
    const DD = dashDomain();
    const snap = DD?.computeTodayOperationsSnapshot ? DD.computeTodayOperationsSnapshot(user) : null;
    const attentionItems = DD?.computeDashboardAttentionItems ? DD.computeDashboardAttentionItems(user) : [];
    const scopeBar = isPortalClientUser(user) ? clientDataScopeBarHtml(getClientDataScope()) : "";
    const longDate = formatColombiaLongDate(new Date());
    const greeting = colombiaTimeOfDayGreeting(new Date());
    const displayName = getPortalUserDisplayName(user) || user?.name || "Operador";
    const firstName = escapeHtml(String(displayName).trim().split(/\s+/)[0] || displayName);
    const quickActions = dashBuildQuickActions(user);
    const updatedAgo = snap?.generatedAt ? dashFormatTimeAgo(snap.generatedAt) : "ahora";

    /* ── Hero Control Tower ── */
    const hero = `<header class="dash-cc dash-hero dash-hero--tower">
      <div class="dash-cc__main">
        <p class="dash-cc__wave" aria-hidden="true">👋</p>
        <h2 class="dash-cc__title">${escapeHtml(greeting)}, <span class="dash-cc__name">${firstName}</span></h2>
        <p class="dash-cc__subtitle">Centro Inteligente de Transporte</p>
        <p class="dash-cc__meta">
          <span>${escapeHtml(longDate)}</span>
          <span class="dash-cc__sep" aria-hidden="true">·</span>
          <span>Actualizado ${escapeHtml(updatedAgo)}</span>
        </p>
      </div>
      <div class="dash-cc__aside">
        ${dashBuildStatusChips(snap, attentionItems)}
        ${quickActions ? `<nav class="dash-cc__actions" aria-label="Accesos rápidos">${quickActions}</nav>` : ""}
      </div>
    </header>`;

    /* ── Vista cliente ── */
    if (isPortalClientUser(user)) {
      return `${scopeBar}<section class="dashboard-studio dashboard-studio--client">${hero}${dashBuildClientPanel(list, user, snap)}</section>`;
    }

    /* ── Vista operacional ── */
    const todayIso = snap?.todayIso || colombiaTodayIsoDate();
    const todayTrips = list.filter((r) => {
      const pickupDay = requestPickupIsoDate(r);
      if (pickupDay === todayIso) return true;
      return r.trip && tripRequestStatusIsOperational(r.status);
    });

    const groupList = (DD?.groupRequestsByVehicleForDashboard
      ? DD.groupRequestsByVehicleForDashboard(todayTrips.filter((r) => r.trip?.vehicleId))
      : []
    ).sort((a, b) => String(a.plate).localeCompare(String(b.plate), "es"));
    const fleetCards = groupList.map((g) => dashBuildVehicleCard(g)).join("");

    const fleetContent =
      fleetCards ||
      `<div class="dash-empty">
        <div class="dash-empty__icon" aria-hidden="true">${IC.truck || ""}</div>
        <p><strong>Sin vehículos activos hoy</strong></p>
        <p class="muted">Asigne rutas desde Transporte · Viajes para ver la flota en tiempo real.</p>
        ${isViewAllowedForUser(user, "transport-trips")
          ? `<button type="button" class="btn btn-primary btn-sm" data-action="dash-nav" data-target-view="transport-trips">${IC.truck || ""} Ir a asignación</button>`
          : ""}
      </div>`;

    const tabCounts = dashCountFleetByStatus(groupList);
    const exec = DD?.computeTodayExecutiveMetrics ? DD.computeTodayExecutiveMetrics(user) : null;
    const hourly = DD?.computeDeliveriesByHour ? DD.computeDeliveriesByHour(todayTrips) : [];
    const fleetPie = DD?.computeFleetStatusBreakdown ? DD.computeFleetStatusBreakdown(user, groupList) : null;
    const mapMarkers = DD?.computeDashboardMapMarkers ? DD.computeDashboardMapMarkers(groupList) : [];
    const criticalAlerts = DD?.computeDashboardCriticalAlerts ? DD.computeDashboardCriticalAlerts(user) : [];

    const body = `
      ${dashBuildMetricsStrip(snap, user, exec)}
      <div class="dash-command-center">
        ${dashBuildLiveMap(mapMarkers)}
        ${dashBuildCriticalAlertsPanel(criticalAlerts)}
      </div>
      ${dashBuildAnalyticsRow(snap, hourly, fleetPie)}
      <div class="dash-layout dash-layout--fleet">
        <section class="dash-panel dash-panel--fleet" id="dash-fleet-panel" aria-label="Torre de flota">
          <header class="dash-panel__head">
            <div>
              <h3>Torre de flota</h3>
              <p>Seguimiento en vivo de vehículos programados para hoy</p>
            </div>
            <div class="dash-panel__tools">
              <label class="dash-search">
                ${IC.search || ""}
                <input id="dash-search" type="search" placeholder="Buscar placa, conductor o cliente…" autocomplete="off" />
              </label>
              <label class="dash-filter visually-hidden">Estado
                <select id="dash-filter" aria-hidden="true" tabindex="-1">
                  <option value="all">Todos</option>
                  <option value="en-ruta">En ruta</option>
                  <option value="programado">Programados</option>
                  <option value="cerrado">Cerrados</option>
                </select>
              </label>
              <span class="dash-count" id="dash-fleet-count">${groupList.length} vehículo${groupList.length === 1 ? "" : "s"}</span>
            </div>
          </header>
          <div class="dash-tabs" role="tablist" aria-label="Filtrar flota">${dashBuildFleetTabs(tabCounts)}</div>
          <div class="dash-fleet-list">${fleetContent}</div>
        </section>
        <aside class="dash-panel dash-panel--activity" aria-label="Actividad reciente">
          <header class="dash-panel__head dash-panel__head--compact">
            <div><h3>Últimos movimientos</h3><p>Actualizaciones del día</p></div>
          </header>
          ${dashBuildActivityFeed(todayTrips)}
        </aside>
      </div>`;

    return `${scopeBar}<section class="dashboard-studio">${hero}${body}</section>`;
  }

  /* ─────────────────────────────────────────────────────────────
     CONTROLES POST-RENDER
  ───────────────────────────────────────────────────────────── */

  function bindDashboardControls() {
    if (String(state.currentView || "") !== "dashboard" || !nodes.viewRoot) return;
    const root = nodes.viewRoot.querySelector(".dashboard-studio");
    if (!root) return;

    const search = root.querySelector("#dash-search");
    const filter = root.querySelector("#dash-filter");
    const cards = [...root.querySelectorAll(".dash-vehicle")];
    const countEl = root.querySelector("#dash-fleet-count");
    const tablist = root.querySelector(".dash-tabs");
    let activeTab = "all";

    const syncTabA11y = (tabId) => {
      root.querySelectorAll(".dash-tab").forEach((tab) => {
        const isActive = tab.dataset.dashTab === tabId;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
        tab.tabIndex = isActive ? 0 : -1;
      });
    };

    const selectTab = (tabId) => {
      activeTab = String(tabId || "all");
      if (filter) filter.value = activeTab;
      syncTabA11y(activeTab);
      apply();
    };

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
    filter?.addEventListener("change", () => selectTab(filter.value));

    root.querySelectorAll(".dash-tab").forEach((tab) => {
      tab.addEventListener("click", () => selectTab(tab.dataset.dashTab));
    });

    tablist?.addEventListener("keydown", (event) => {
      const tabs = [...root.querySelectorAll(".dash-tab")];
      if (!tabs.length) return;
      const currentIdx = tabs.findIndex((tab) => tab.classList.contains("is-active"));
      let nextIdx = currentIdx;
      if (event.key === "ArrowRight") nextIdx = (currentIdx + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIdx = 0;
      else if (event.key === "End") nextIdx = tabs.length - 1;
      else return;
      event.preventDefault();
      const nextTab = tabs[nextIdx];
      selectTab(nextTab.dataset.dashTab);
      nextTab.focus();
    });

    apply();

    root.querySelectorAll("[data-action='dash-nav'], [data-action='dash-attention-nav']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = String(btn.dataset.targetView || "").trim();
        if (target) setView(target);
      });
    });

    root.querySelectorAll("[data-action='dash-focus-fleet']").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectTab(btn.dataset.dashTab || "all");
        root.querySelector("#dash-fleet-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     REGISTRO DE MÓDULO
  ───────────────────────────────────────────────────────────── */

  if (typeof window.registerLegacyPortalViews === "function") {
    window.registerLegacyPortalViews({ viewDashboard });
  } else {
    window.AppLegacyViews = window.AppLegacyViews || {};
    Object.assign(window.AppLegacyViews, { viewDashboard });
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.dashboard = bindDashboardControls;
})();