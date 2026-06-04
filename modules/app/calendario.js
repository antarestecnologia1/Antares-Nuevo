/**
 * Transporte · Calendario (`transport-calendar`): HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
 */
function transportCalendarHtml() {
  const filters = state.calendarFilters || { driver: "", vehicle: "", status: "", kind: "" };
  const allTrips = reqRead().filter((r) => r.trip);
  const interviews = read(KEYS.interviews, []);
  const absences = read(KEYS.hrAbsences, []);
  const trips = allTrips
    .filter((r) => {
      if (filters.driver && String(r.trip.driverId || "") !== filters.driver) return false;
      if (filters.vehicle && String(r.trip.vehicleId || "") !== filters.vehicle) return false;
      if (filters.status && String(r.status || "") !== filters.status) return false;
      return true;
    })
    .sort((a, b) => new Date(rSafePickup(a)).getTime() - new Date(rSafePickup(b)).getTime());

  const interviewEvents = interviews
    .map((i) => {
      const ts = new Date(String(i.when || "")).getTime();
      if (!Number.isFinite(ts)) return null;
      return {
        kind: "interview",
        id: String(i.id || ""),
        start: new Date(ts),
        dot: "dot-interview",
        title: `Entrevista · ${String(i.candidateName || "Candidato")}`,
        subtitle: String(i.interviewer || "-")
      };
    })
    .filter(Boolean);
  const absenceEvents = absences
    .map((a) => {
      const ts = new Date(`${String(a.startDate || "")}T12:00:00`).getTime();
      if (!Number.isFinite(ts)) return null;
      const typeLabel = payrollAbsenceTypeLabel(a.absenceType);
      return {
        kind: "absence",
        id: String(a.id || ""),
        start: new Date(ts),
        dot: "dot-absence",
        title: `${typeLabel} · ${String(a.employeeName || "Colaborador")}`,
        subtitle: `${String(a.startDate || "-")} → ${String(a.endDate || "-")}`
      };
    })
    .filter(Boolean);
  const tripEvents = trips
    .map((r) => {
      const ts = new Date(rSafePickup(r)).getTime();
      if (!Number.isFinite(ts)) return null;
      return {
        kind: "trip",
        id: String(r.id || ""),
        start: new Date(ts),
        dot: "dot-trip",
        title: `${String(r.trip?.tripNumber || "-")} · ${String(r.clientName || "")}`,
        subtitle: `${String(r.trip?.driverName || "-")} · ${String(r.trip?.vehiclePlate || "-")}`,
        request: r
      };
    })
    .filter(Boolean);

  const allEvents = [...tripEvents, ...interviewEvents, ...absenceEvents]
    .filter((evt) => !filters.kind || evt.kind === filters.kind)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const driversList = read(KEYS.drivers, []);
  const vehiclesList = read(KEYS.vehicles, []);
  const statusList = [...new Set(allTrips.map((r) => r.status))];

  const focus = state.calendarFocus instanceof Date && !Number.isNaN(state.calendarFocus.getTime())
    ? new Date(state.calendarFocus)
    : new Date();
  focus.setHours(12, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const viewRaw = state.calendarViewMode;
  const view = viewRaw === "week" || viewRaw === "day" ? viewRaw : "month";

  const year = focus.getFullYear();
  const month = focus.getMonth();

  const eventsByDay = new Map();
  allEvents.forEach((evt) => {
    const d = evt.start;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key).push(evt);
  });

  const monthLabel = focus.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const buildCellFromDate = (cellDateRaw, isOther) => {
    const cellDate = new Date(cellDateRaw.getFullYear(), cellDateRaw.getMonth(), cellDateRaw.getDate());
    const key = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`;
    const dayEvents = eventsByDay.get(key) || [];
    const isToday = cellDate.getTime() === today.getTime();
    const dayNum = cellDate.getDate();
    const maxEv = view === "day" ? 24 : 3;
    const eventList = dayEvents
      .slice(0, maxEv)
      .map((evt) => {
        const time = evt.start.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
        return `<button type="button" class="cal-event ${evt.dot}" data-action="cal-event" data-kind="${escapeAttr(evt.kind)}" data-id="${escapeAttr(evt.id)}">
          <span class="cal-event-time">${time}</span>
          <span class="cal-event-title">${escapeHtml(String(evt.title || "-"))}</span>
        </button>`;
      })
      .join("");
    const more =
      dayEvents.length > maxEv ? `<span class="cal-more">+${dayEvents.length - maxEv} más</span>` : "";
    return `<div class="cal-cell ${isOther ? "cal-cell-other" : ""} ${isToday ? "cal-cell-today" : ""} ${dayEvents.length ? "cal-cell-has-events" : ""}">
      <div class="cal-day">${dayNum}${isToday ? '<span class="cal-today-pill">Hoy</span>' : ""}</div>
      <div class="cal-events">${eventList}${more}</div>
    </div>`;
  };

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  let periodTitle = monthLabelCap;
  let cells = [];
  let weekdayHeaders = "";

  if (view === "month") {
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      cells.push(buildCellFromDate(d, true));
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(buildCellFromDate(new Date(year, month, d), false));
    }
    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - (startWeekday + daysInMonth) + 1;
      cells.push(buildCellFromDate(new Date(year, month + 1, nextDay), true));
    }
    weekdayHeaders = weekDays.map((d) => `<div class="cal-weekday">${d}</div>`).join("");
    periodTitle = monthLabelCap;
  } else if (view === "week") {
    const anchor = new Date(focus.getFullYear(), focus.getMonth(), focus.getDate());
    const sow = new Date(anchor);
    sow.setDate(anchor.getDate() - anchor.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(sow.getFullYear(), sow.getMonth(), sow.getDate() + i);
      cells.push(buildCellFromDate(d, false));
    }
    weekdayHeaders = weekDays.map((d) => `<div class="cal-weekday">${d}</div>`).join("");
    const eow = new Date(sow.getFullYear(), sow.getMonth(), sow.getDate() + 6);
    const sameMonth = sow.getMonth() === eow.getMonth() && sow.getFullYear() === eow.getFullYear();
    let rangeStr;
    if (sameMonth) {
      rangeStr = `${sow.getDate()}–${eow.getDate()} ${sow.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}`;
    } else {
      rangeStr = `${sow.toLocaleDateString("es-CO", { day: "numeric", month: "short" })} – ${eow.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    periodTitle = rangeStr.charAt(0).toUpperCase() + rangeStr.slice(1);
  } else {
    const d = new Date(focus.getFullYear(), focus.getMonth(), focus.getDate());
    cells.push(buildCellFromDate(d, false));
    const dayLong = d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    periodTitle = dayLong.charAt(0).toUpperCase() + dayLong.slice(1);
  }

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const todayEvents = eventsByDay.get(todayKey) || [];
  const upcoming = allEvents
    .filter((evt) => evt.start.getTime() >= today.getTime())
    .slice(0, 8);

  const todayList = todayEvents.length
    ? todayEvents
        .map((evt) => {
          const time = evt.start.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
          const statusCell =
            evt.kind === "trip"
              ? prettyStatus(evt.request?.status, "trip")
              : evt.kind === "interview"
                ? '<span class="status status-en_transito">Entrevista</span>'
                : '<span class="status status-espera_standby">Novedad</span>';
          return `<div class="cal-day-event">
            <div class="cal-day-event-time">${time}</div>
            <div class="cal-day-event-info">
              <strong>${escapeHtml(String(evt.title || "-"))}</strong>
              <span class="muted">${escapeHtml(String(evt.subtitle || "-"))}</span>
            </div>
            <div class="cal-day-event-status">${statusCell}</div>
          </div>`;
        })
        .join("")
    : `<p class="muted">Sin eventos para hoy.</p>`;

  const upcomingList = upcoming.length
    ? upcoming
        .map((evt) => {
          const date = evt.start;
          const dateLabel = date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
          const time = date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
          const badge =
            evt.kind === "trip"
              ? prettyStatus(evt.request?.status, "trip")
              : evt.kind === "interview"
                ? '<span class="status status-en_transito">Entrevista</span>'
                : '<span class="status status-espera_standby">Novedad</span>';
          return `<div class="cal-upcoming-item">
            <div class="cal-upcoming-date">
              <strong>${dateLabel}</strong>
              <span class="muted">${time}</span>
            </div>
            <div class="cal-upcoming-info">
              <strong>${escapeHtml(String(evt.title || "-"))}</strong>
              <span class="muted">${escapeHtml(String(evt.subtitle || "-"))}</span>
            </div>
            <div>${badge}</div>
          </div>`;
        })
        .join("")
    : `<p class="muted">No hay programación próxima.</p>`;

  const viewToggle = `<div class="calendar-view-toggle" role="group" aria-label="Vista del calendario">
        <button type="button" class="btn btn-action btn-sm${view === "month" ? " is-active" : ""}" data-action="cal-view" data-view="month">Mes</button>
        <button type="button" class="btn btn-action btn-sm${view === "week" ? " is-active" : ""}" data-action="cal-view" data-view="week">Semana</button>
        <button type="button" class="btn btn-action btn-sm${view === "day" ? " is-active" : ""}" data-action="cal-view" data-view="day">Día</button>
      </div>`;

  const calendarShell = `<section class="calendar-shell calendar-shell--view-${view}" data-cal-view="${view}">
    <div class="calendar-toolbar">
      <div class="calendar-title-block">
        <h2>${escapeHtml(periodTitle)}</h2>
        ${viewToggle}
      </div>
      <div class="calendar-controls">
        <button type="button" class="btn btn-action btn-sm" data-action="cal-nav" data-step="-1">${IC.chevronLeft || ""} Anterior</button>
        <button type="button" class="btn btn-action btn-sm" data-action="cal-today">Hoy</button>
        <button type="button" class="btn btn-action btn-sm" data-action="cal-nav" data-step="1">Siguiente ${IC.chevronRight || ""}</button>
      </div>
    </div>
    <form id="calendar-filters" class="calendar-filters-bar">
      <label>${fieldLabel(IC.user, "Conductor")}<select name="driver"><option value="">Todos</option>${driversList.map((d) => `<option value="${escapeAttr(String(d.id || ""))}" ${filters.driver === d.id ? "selected" : ""}>${escapeHtml(String(d.name || ""))}</option>`).join("")}</select></label>
      <label>${fieldLabel(IC.truck, "Camión")}<select name="vehicle"><option value="">Todos</option>${vehiclesList.map((v) => `<option value="${escapeAttr(String(v.id || ""))}" ${filters.vehicle === v.id ? "selected" : ""}>${escapeHtml(String(v.plate || ""))} · ${escapeHtml(String(v.type || ""))}</option>`).join("")}</select></label>
      <label>${fieldLabel(IC.activity, "Estado")}<select name="status"><option value="">Todos</option>${statusList.map((s) => `<option value="${s}" ${filters.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label>
      <label>${fieldLabel(IC.calendar, "Tipo")}<select name="kind"><option value="">Todos</option><option value="trip" ${filters.kind === "trip" ? "selected" : ""}>Viaje</option><option value="interview" ${filters.kind === "interview" ? "selected" : ""}>Entrevista</option><option value="absence" ${filters.kind === "absence" ? "selected" : ""}>Novedad</option></select></label>
      <button type="button" class="btn btn-sm btn-action" data-action="cal-clear-filters">${IC.x} Limpiar</button>
    </form>
    <div class="calendar-legend">
      <span class="cal-legend-item"><span class="cal-dot dot-trip"></span>Viajes</span>
      <span class="cal-legend-item"><span class="cal-dot dot-interview"></span>Entrevistas</span>
      <span class="cal-legend-item"><span class="cal-dot dot-absence"></span>Novedades</span>
    </div>
    <div class="calendar-grid">
      ${view === "day" ? "" : `<div class="cal-weekdays">${weekdayHeaders}</div>`}
      <div class="cal-days cal-days--view-${view}">${cells.join("")}</div>
    </div>
    <div class="calendar-side-grid">
      ${pcardWrap("clock", "Hoy", `${todayEvents.length} viajes programados`, `<div class="cal-day-list">${todayList}</div>`)}
      ${pcardWrapPro("calendar", "Próximas programaciones", upcoming.length + " viajes", `<div class="cal-upcoming-list">${upcomingList}</div>`)}
    </div>
  </section>`;

  const calHero = moduleFleetHeroStrip([
    { label: "Viajes en sistema", value: allTrips.length },
    { label: "Entrevistas", value: interviewEvents.length },
    { label: "Novedades", value: absenceEvents.length },
    { label: "Tras filtros", value: allEvents.length },
    { label: "Hoy", value: todayEvents.length },
    { label: "Proximos", value: upcoming.length }
  ]);

  return calHero + calendarShell;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ transportCalendarHtml });
})();

(function registerTransportCalendarPortalBinds() {
  "use strict";

  function bindTransportCalendarPortalControls() {
    if (String(state.currentView || "") !== "transport-calendar" || !nodes.viewRoot) return;

    const calendarFiltersForm = document.getElementById("calendar-filters");
    if (calendarFiltersForm) {
      calendarFiltersForm.querySelectorAll("select").forEach((select) => {
        select.addEventListener("change", () => {
          state.calendarFilters = state.calendarFilters || { driver: "", vehicle: "", status: "", kind: "" };
          const key = String(select.name || "");
          if (!key) return;
          state.calendarFilters[key] = String(select.value || "");
          renderPortalView();
        });
      });
    }

    nodes.viewRoot.querySelectorAll("[data-action='cal-clear-filters']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.calendarFilters = { driver: "", vehicle: "", status: "", kind: "" };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='cal-nav']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = parseInt(btn.dataset.step || "0", 10) || 0;
        const base = state.calendarFocus instanceof Date && !Number.isNaN(state.calendarFocus.getTime())
          ? new Date(state.calendarFocus)
          : new Date();
        base.setHours(12, 0, 0, 0);
        const v = state.calendarViewMode === "week" || state.calendarViewMode === "day" ? state.calendarViewMode : "month";
        if (v === "month") {
          base.setMonth(base.getMonth() + step);
        } else if (v === "week") {
          base.setDate(base.getDate() + step * 7);
        } else {
          base.setDate(base.getDate() + step);
        }
        state.calendarFocus = base;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='cal-view']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = String(btn.dataset.view || "month");
        state.calendarViewMode = next === "week" || next === "day" ? next : "month";
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='cal-today']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.calendarFocus = new Date();
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='cal-event']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = String(btn.dataset.id || "");
        const kind = String(btn.dataset.kind || "trip");
        if (kind === "trip") {
          const req = reqRead().find((r) => r.id === id);
          if (!req?.trip) return;
          openInfoModal({
            title: `Viaje ${req.trip.tripNumber || ""}`,
            subtitleHtml: `${escapeHtml(req.clientName || "")}${req.clientName ? " · " : ""}${prettyStatus(req.status, "trip")}`,
            bodyHtml: `<div class="dash-grid">
            <div><strong>Cliente:</strong> ${req.clientName || "-"}</div>
            <div><strong>Ruta:</strong> ${req.trip.route || formatRoute(req)}</div>
            <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
            <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
            <div><strong>Camión:</strong> ${req.trip.vehiclePlate} (${req.trip.vehicleType || "-"})</div>
            <div><strong>Conductor:</strong> ${req.trip.driverName} · ${req.trip.driverPhone || "-"}</div>
          </div>`
          });
          return;
        }
        if (kind === "interview") {
          const interview = read(KEYS.interviews, []).find((i) => String(i.id) === id);
          if (!interview) return;
          openInfoModal({
            title: `Entrevista · ${escapeHtml(String(interview.candidateName || "Candidato"))}`,
            subtitle: String(interview.when || ""),
            bodyHtml: `<div class="dash-grid">
            <div><strong>Candidato:</strong> ${escapeHtml(String(interview.candidateName || "-"))}</div>
            <div><strong>Fecha:</strong> ${fmtDate(interview.when)}</div>
            <div><strong>Entrevistador:</strong> ${escapeHtml(String(interview.interviewer || "-"))}</div>
            <div><strong>Modalidad:</strong> ${escapeHtml(String(interview.modality || "-"))}</div>
            <div class="full"><strong>Lugar / enlace:</strong> ${escapeHtml(String(interview.locationOrLink || "-"))}</div>
            <div class="full"><strong>Notas:</strong> ${escapeHtml(String(interview.notes || "-"))}</div>
          </div>`
          });
          return;
        }
        const absence = read(KEYS.hrAbsences, []).find((a) => String(a.id) === id);
        if (!absence) return;
        const typeLabel = payrollAbsenceTypeLabel(absence.absenceType);
        openInfoModal({
          title: `${typeLabel} · ${escapeHtml(String(absence.employeeName || "Colaborador"))}`,
          subtitle: `${escapeHtml(String(absence.startDate || "-"))} → ${escapeHtml(String(absence.endDate || "-"))}`,
          bodyHtml: `<div class="dash-grid">
          <div><strong>Empleado:</strong> ${escapeHtml(String(absence.employeeName || "-"))}</div>
          <div><strong>Tipo:</strong> ${escapeHtml(typeLabel)}</div>
          <div><strong>Desde:</strong> ${escapeHtml(String(absence.startDate || "-"))}</div>
          <div><strong>Hasta:</strong> ${escapeHtml(String(absence.endDate || "-"))}</div>
          <div><strong>Días:</strong> ${parseNum(absence.days).toLocaleString("es-CO")}</div>
          <div><strong>Soporte:</strong> ${escapeHtml(String(absence.supportNumber || "-"))}</div>
          <div class="full"><strong>Entidad:</strong> ${escapeHtml(String(absence.epsEntity || "-"))}</div>
          <div class="full"><strong>Notas:</strong> ${escapeHtml(String(absence.notes || "-"))}</div>
        </div>`
        });
      });
    });
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["transport-calendar"] = bindTransportCalendarPortalControls;
})();
