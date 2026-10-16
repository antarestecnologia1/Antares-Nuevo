/**
 * Transporte · Calendario (`transport-calendar`): HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
 */

function calendarTripRangeFn(request) {
  if (typeof AntaresViajesDomain !== "undefined" && AntaresViajesDomain.tripWindowRangeFromTransportRequest) {
    return AntaresViajesDomain.tripWindowRangeFromTransportRequest(request);
  }
  const pickup = String(request?.trip?.etaPickup || request?.pickupAt || "").trim();
  const delivery = String(request?.trip?.etaDelivery || request?.etaDelivery || pickup).trim();
  const start = new Date(pickup).getTime();
  const endRaw = new Date(delivery).getTime();
  if (!Number.isFinite(start)) return null;
  const end = Number.isFinite(endRaw) && endRaw > start ? endRaw : start + 60 * 60 * 1000;
  return { start, end };
}

function calendarTripStatusSlug(request) {
  const raw = String(request?.status || "").trim();
  if (typeof slugStatus === "function") return slugStatus(raw);
  return raw.toLowerCase().replace(/\s+/g, "_");
}

/** Cancelada / Rechazada liberan conductor y camión: no cuentan como programación. */
function calendarIsDeadTrip(request) {
  const slug = calendarTripStatusSlug(request);
  return slug === "cancelada" || slug === "rechazada";
}

/** Viaje que ya no está por ejecutarse (completado, cerrado, cancelado o rechazado). */
function calendarIsFinishedTrip(request) {
  const slug = calendarTripStatusSlug(request);
  return slug === "completada" || slug === "cerrada" || slug === "cancelada" || slug === "rechazada";
}

function calendarDayKeyOf(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function calendarClock(value) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
}

/** `dd/mm hh:mm` (neutro al idioma) para tooltips de viajes que cruzan de día. */
function calendarShortDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" })} ${calendarClock(d)}`;
}

/** Ventana [inicio, fin) de un evento en ms: viajes = recogida → entrega; entrevistas = su hora; novedades = sus días. */
function calendarEventRange(evt) {
  if (evt.kind === "trip" && evt.request) {
    const r = calendarTripRangeFn(evt.request);
    if (r) return { start: r.start, end: r.end };
  }
  const s = evt.start.getTime();
  const e = evt.end instanceof Date && !Number.isNaN(evt.end.getTime()) ? evt.end.getTime() : s;
  return { start: s, end: Math.max(e, s) };
}

/** Texto horario de un evento dentro de un día concreto (viajes de varios días, novedades de día completo). */
function calendarItemTimeLabel(item) {
  const { evt, range, isFirst, isLast } = item;
  if (evt.kind === "absence") return "Todo el día";
  if (isFirst && isLast) return calendarClock(range.start);
  if (isFirst) return `${calendarClock(range.start)} →`;
  if (isLast) return `← ${calendarClock(range.end)}`;
  return "Todo el día";
}

function calendarItemTooltip(item) {
  const { evt, range } = item;
  if (evt.kind === "trip") {
    return `${evt.title} · ${calendarShortDateTime(range.start)} – ${calendarShortDateTime(range.end)}`;
  }
  return `${evt.title}${evt.subtitle ? ` · ${evt.subtitle}` : ""}`;
}

/** «2 viajes · 1 entrevista» / «Sin eventos». */
function calendarCountLabel(events) {
  const rows = Array.isArray(events) ? events : [];
  const n = (kind) => rows.filter((e) => e.kind === kind).length;
  const trips = n("trip");
  const interviews = n("interview");
  const absences = n("absence");
  const parts = [];
  if (trips) parts.push(`${trips} viaje${trips === 1 ? "" : "s"}`);
  if (interviews) parts.push(`${interviews} entrevista${interviews === 1 ? "" : "s"}`);
  if (absences) parts.push(`${absences} novedad${absences === 1 ? "" : "es"}`);
  return parts.length ? parts.join(" · ") : "Sin eventos";
}

function calendarKindBadgeHtml(evt) {
  if (evt.kind === "trip") return prettyStatus(evt.request?.status, "trip");
  if (evt.kind === "interview") return '<span class="status status-en_transito">Entrevista</span>';
  return '<span class="status status-espera_standby">Novedad</span>';
}

function calendarResourceAvatarHtml(res) {
  const kind = String(res?.kind || "driver").toLowerCase();
  const photoUrl = kind === "driver" ? String(res?.photoUrl || "").trim() : "";

  if (photoUrl && (/^https?:\/\//i.test(photoUrl) || /^data:image\//i.test(photoUrl))) {
    return `<div class="cal-timeline-avatar cal-timeline-avatar--photo" aria-hidden="true">
      <img src="${escapeAttr(photoUrl)}" alt="" loading="lazy" decoding="async" />
    </div>`;
  }

  if (kind === "vehicle") {
    return `<div class="cal-timeline-avatar cal-timeline-avatar--fallback cal-timeline-avatar--vehicle" aria-hidden="true">
      <span class="cal-timeline-avatar-icon">${IC.truck || ""}</span>
    </div>`;
  }

  if (kind === "driver") {
    return `<div class="cal-timeline-avatar cal-timeline-avatar--fallback cal-timeline-avatar--driver" aria-hidden="true">
      <span class="cal-timeline-avatar-icon">${IC.user || ""}</span>
    </div>`;
  }

  return `<div class="cal-timeline-avatar cal-timeline-avatar--fallback" aria-hidden="true">
    <span class="cal-timeline-avatar-letter">${escapeHtml(res.initials || "?")}</span>
  </div>`;
}

function buildCalendarResourceTimelineHtml({ allEvents, driversList, vehiclesList, filters, focus, today }) {
  const Cal = typeof AntaresCalendarDomain !== "undefined" ? AntaresCalendarDomain : null;
  const resourceGroup = Cal?.resolveCalendarResourceGroup
    ? Cal.resolveCalendarResourceGroup(filters, state.calendarResourceGroup || "auto")
    : String(filters.vehicle || "").trim()
      ? "vehicle"
      : "driver";
  const showFree = Boolean(state.calendarShowFree);

  const layout = Cal?.buildResourceTimelineLayout
    ? Cal.buildResourceTimelineLayout({
        events: allEvents,
        drivers: driversList,
        vehicles: vehiclesList,
        focusDate: focus,
        resourceGroup,
        filters,
        opts: { tripRangeFn: calendarTripRangeFn, includeAllResources: showFree }
      })
    : { resources: [], blocks: [], hourLabels: [], totalHeightPx: 0, isToday: false, nowTopPx: null, tripCount: 0 };

  const { resources, blocks, hourLabels, totalHeightPx, isToday, nowTopPx, tripCount } = layout;
  const groupSingular = resourceGroup === "vehicle" ? "camión" : "conductor";
  const groupPlural = resourceGroup === "vehicle" ? "camiones" : "conductores";
  const resourceGroupUi = String(state.calendarResourceGroup || "auto");

  const resourceGroupToggle = `<div class="cal-resource-group-toggle" role="group" aria-label="Agrupar programación por">
    <button type="button" class="btn btn-sm btn-action${resourceGroupUi === "auto" ? " is-active" : ""}" data-action="cal-resource-group" data-group="auto">Auto</button>
    <button type="button" class="btn btn-sm btn-action${resourceGroupUi === "driver" ? " is-active" : ""}" data-action="cal-resource-group" data-group="driver">${IC.user || ""} Conductor</button>
    <button type="button" class="btn btn-sm btn-action${resourceGroupUi === "vehicle" ? " is-active" : ""}" data-action="cal-resource-group" data-group="vehicle">${IC.truck || ""} Camión</button>
  </div>`;
  const showFreeToggle = `<button type="button" class="btn btn-sm btn-action cal-show-free${showFree ? " is-active" : ""}" data-action="cal-show-free" aria-pressed="${showFree ? "true" : "false"}" title="Mostrar también los conductores y camiones sin viajes ese día">Mostrar libres</button>`;

  if (!resources.length) {
    return `<div class="cal-timeline-wrap">
      <div class="cal-timeline-meta">${resourceGroupToggle}${showFreeToggle}</div>
      <div class="cal-timeline-empty">
        <div class="cal-timeline-empty-icon">${IC.calendar || ""}</div>
        <h3>Sin programación para este día</h3>
        <p class="muted">No hay viajes asignados${filters.driver || filters.vehicle ? " con los filtros actuales" : ""} en la fecha seleccionada.</p>
        <p class="muted cal-timeline-empty-hint">Prueba otro día o ajusta los filtros de conductor / camión.</p>
      </div>
    </div>`;
  }

  const timeGutter = hourLabels
    .map(
      (slot) =>
        `<div class="cal-timeline-time-slot" style="top:${slot.topPx}px"><span>${escapeHtml(slot.label)}</span></div>`
    )
    .join("");

  const hourBands = hourLabels
    .map(
      (slot, i) =>
        `<div class="cal-timeline-hour-band${i % 2 ? " cal-timeline-hour-band--alt" : ""}" style="top:${slot.topPx}px;height:${layout.slotHeightPx}px"></div>`
    )
    .join("");

  const resourceHeaders = resources
    .map((res, colIndex) => {
      const count = blocks.filter((b) => b.resourceId === res.id).length;
      const icon = res.kind === "vehicle" ? IC.truck : IC.user;
      const flag = res.unavailable
        ? `<span class="cal-timeline-resource-flag" title="Marcado como no disponible">No disponible</span>`
        : "";
      return `<div class="cal-timeline-resource-head" style="--res-accent:${escapeAttr(res.accent)};grid-column:${colIndex + 2};grid-row:1">
        ${calendarResourceAvatarHtml(res)}
        <div class="cal-timeline-resource-meta">
          <strong title="${escapeAttr(res.label)}">${escapeHtml(res.label)}</strong>
          <span class="muted">${escapeHtml(res.subtitle || (res.kind === "vehicle" ? "Vehículo" : "Conductor"))}</span>
          ${flag}
        </div>
        <span class="cal-timeline-resource-count" title="Viajes del día">${count}</span>
        <span class="cal-timeline-resource-kind" aria-hidden="true">${icon || ""}</span>
      </div>`;
    })
    .join("");

  const resourceColumns = resources
    .map((res, colIndex) => {
      const colBlocks = blocks
        .filter((b) => b.resourceId === res.id)
        .map((b) => {
          const evt = b.evt;
          const rangeStart = Number.isFinite(b.rangeStartMs) ? b.rangeStartMs : evt.start.getTime();
          const rangeEnd = Number.isFinite(b.rangeEndMs) ? b.rangeEndMs : rangeStart + 60 * 60 * 1000;
          const timeStart = calendarClock(rangeStart);
          const timeEnd = calendarClock(rangeEnd);
          const crossesDays = Boolean(b.clippedStart || b.clippedEnd);
          /* Un viaje que sigue de otro día se muestra como «Hasta…» / «Desde…» / «Todo el día». */
          const timeText =
            evt.kind === "absence" || (b.clippedStart && b.clippedEnd)
              ? "Todo el día"
              : b.clippedStart
                ? `Hasta ${timeEnd}`
                : b.clippedEnd
                  ? `Desde ${timeStart}`
                  : `${timeStart} – ${timeEnd}`;
          const tooltip =
            evt.kind === "trip"
              ? `${evt.title} · ${crossesDays ? `${calendarShortDateTime(rangeStart)} – ${calendarShortDateTime(rangeEnd)}` : `${timeStart} – ${timeEnd}`}`
              : `${evt.title}${evt.subtitle ? ` · ${evt.subtitle}` : ""}`;
          const statusSlug =
            evt.kind === "trip" ? calendarTripStatusSlug(evt.request) : String(evt.kind || "trip");
          const metaLine =
            evt.kind === "trip" && evt.request?.trip
              ? `${evt.request.trip.route || formatRoute(evt.request)}`
              : String(evt.subtitle || "");
          const compact = b.heightPx < 52;
          const compactTime = crossesDays || evt.kind === "absence" ? timeText : timeStart;
          return `<button type="button"
            class="cal-timeline-block cal-timeline-block--${escapeAttr(evt.kind)} cal-timeline-block--status-${escapeAttr(statusSlug)}${b.clipped ? " cal-timeline-block--clipped" : ""}${b.clippedStart ? " cal-timeline-block--cont-start" : ""}${b.clippedEnd ? " cal-timeline-block--cont-end" : ""}${compact ? " cal-timeline-block--compact" : ""}"
            style="top:${b.topPx}px;height:${b.heightPx}px;left:calc(${b.leftPct}% + 4px);width:calc(${b.widthPct}% - 8px);--block-accent:${escapeAttr(res.accent)}"
            data-action="cal-event" data-kind="${escapeAttr(evt.kind)}" data-id="${escapeAttr(evt.id)}"
            title="${escapeAttr(tooltip)}">
            <span class="cal-timeline-block-time">${escapeHtml(compact ? compactTime : timeText)}</span>
            <strong class="cal-timeline-block-title">${escapeHtml(String(evt.title || "-"))}</strong>
            ${compact ? "" : `<span class="cal-timeline-block-sub">${escapeHtml(metaLine)}</span>`}
          </button>`;
        })
        .join("");
      return `<div class="cal-timeline-col" style="--res-accent:${escapeAttr(res.accent)};grid-column:${colIndex + 2};grid-row:2">
        <div class="cal-timeline-col-bands" style="height:${totalHeightPx}px">${hourBands}</div>
        <div class="cal-timeline-col-events" style="height:${totalHeightPx}px">${colBlocks}</div>
      </div>`;
    })
    .join("");

  const nowLine =
    isToday && nowTopPx != null
      ? `<div class="cal-timeline-now" style="top:${nowTopPx}px" aria-hidden="true">
          <span class="cal-timeline-now-label">Ahora</span>
          <span class="cal-timeline-now-line"></span>
        </div>`
      : "";

  return `<div class="cal-timeline-wrap">
    <div class="cal-timeline-meta">
      ${resourceGroupToggle}
      ${showFreeToggle}
      <span class="cal-timeline-meta-pill">${resources.length} ${resources.length === 1 ? groupSingular : groupPlural} · ${tripCount} viaje${tripCount === 1 ? "" : "s"}</span>
    </div>
    <div class="cal-timeline-scroll" tabindex="0" aria-label="Programación por ${groupSingular}">
      <div class="cal-timeline-grid" style="--cal-slot-h:${layout.slotHeightPx}px;--cal-timeline-h:${totalHeightPx}px;--cal-cols:${resources.length}">
        <div class="cal-timeline-corner" aria-hidden="true"></div>
        <div class="cal-timeline-resources-header">${resourceHeaders}</div>
        <div class="cal-timeline-times" style="height:${totalHeightPx}px">${timeGutter}</div>
        <div class="cal-timeline-columns">${resourceColumns}</div>
        ${nowLine}
      </div>
    </div>
  </div>`;
}

function transportCalendarHtml() {
  const filters = state.calendarFilters || { driver: "", vehicle: "", status: "", kind: "" };
  /* Cancelada / Rechazada liberan conductor y camión: solo se listan al filtrar por ese estado. */
  const allTrips = reqRead()
    .filter((r) => r.trip)
    .filter((r) => {
      if (filters.driver && String(r.trip.driverId || "") !== filters.driver) return false;
      if (filters.vehicle && String(r.trip.vehicleId || "") !== filters.vehicle) return false;
      if (filters.status && String(r.status || "") !== filters.status) return false;
      if (!filters.status && calendarIsDeadTrip(r)) return false;
      return true;
    });
  /* Conductor / camión / estado son filtros de viaje: entrevistas y novedades de RR. HH. quedan fuera. */
  const tripOnlyFilter = Boolean(filters.driver || filters.vehicle || filters.status);
  const interviews = tripOnlyFilter ? [] : read(KEYS.interviews, []);
  const absences = tripOnlyFilter ? [] : read(KEYS.hrAbsences, []);

  let allEvents = [];
  if (typeof AntaresCalendarDomain !== "undefined") {
    const merged = AntaresCalendarDomain.mergeCalendarEvents({
      requests: allTrips,
      interviews,
      absences,
      absenceTypeLabel: typeof payrollAbsenceTypeLabel === "function" ? payrollAbsenceTypeLabel : undefined
    });
    const filtered = AntaresCalendarDomain.filterCalendarEvents(merged, { kind: filters.kind });
    allEvents = AntaresCalendarDomain.calendarEventsToUiRows(filtered, { reqRead });
  } else {
    const trips = [...allTrips].sort(
      (a, b) => new Date(rSafePickup(a)).getTime() - new Date(rSafePickup(b)).getTime()
    );
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
        const endTs = new Date(`${String(a.endDate || a.startDate || "")}T23:59:59`).getTime();
        return {
          kind: "absence",
          id: String(a.id || ""),
          start: new Date(ts),
          end: new Date(Number.isFinite(endTs) && endTs >= ts ? endTs : ts),
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
    allEvents = [...tripEvents, ...interviewEvents, ...absenceEvents]
      .filter((evt) => !filters.kind || evt.kind === filters.kind)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  const interviewEvents = allEvents.filter((e) => e.kind === "interview");
  const absenceEvents = allEvents.filter((e) => e.kind === "absence");

  const driversList = read(KEYS.drivers, []);
  const vehiclesList = read(KEYS.vehicles, []);
  const statusList = [...new Set(reqRead().filter((r) => r.trip).map((r) => r.status))];

  const focus = state.calendarFocus instanceof Date && !Number.isNaN(state.calendarFocus.getTime())
    ? new Date(state.calendarFocus)
    : new Date();
  focus.setHours(12, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const viewRaw = state.calendarViewMode;
  const view =
    viewRaw === "week" || viewRaw === "day" || viewRaw === "resources" ? viewRaw : "month";

  const year = focus.getFullYear();
  const month = focus.getMonth();

  /* Un viaje de varios días (o que cruza la medianoche) aparece en cada día que ocupa. */
  const eventsByDay = new Map();
  const CalDomain = typeof AntaresCalendarDomain !== "undefined" ? AntaresCalendarDomain : null;
  allEvents.forEach((evt) => {
    const range = calendarEventRange(evt);
    const spans =
      CalDomain && typeof CalDomain.calendarRangeDayKeys === "function"
        ? CalDomain.calendarRangeDayKeys(range.start, range.end)
        : [];
    const days = spans.length ? spans : [{ key: calendarDayKeyOf(evt.start), date: evt.start }];
    days.forEach((day, idx) => {
      if (!eventsByDay.has(day.key)) eventsByDay.set(day.key, []);
      eventsByDay.get(day.key).push({ evt, range, isFirst: idx === 0, isLast: idx === days.length - 1 });
    });
  });
  const itemsOnDay = (dayDate) => {
    const dayStartMs = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()).getTime();
    return (eventsByDay.get(calendarDayKeyOf(dayDate)) || [])
      .slice()
      .sort(
        (a, b) =>
          (a.isFirst ? a.range.start : dayStartMs) - (b.isFirst ? b.range.start : dayStartMs)
      );
  };

  const monthLabel = focus.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const buildCellFromDate = (cellDateRaw, isOther) => {
    const cellDate = new Date(cellDateRaw.getFullYear(), cellDateRaw.getMonth(), cellDateRaw.getDate());
    const dayItems = itemsOnDay(cellDate);
    const isToday = cellDate.getTime() === today.getTime();
    const dayNum = cellDate.getDate();
    const maxEv = view === "day" ? Infinity : 3;
    const eventList = dayItems
      .slice(0, maxEv)
      .map((item) => {
        const { evt } = item;
        const statusSlug = evt.kind === "trip" ? calendarTripStatusSlug(evt.request) : String(evt.kind || "");
        return `<button type="button" class="cal-event ${evt.dot} cal-event--status-${escapeAttr(statusSlug)}${item.isFirst ? "" : " cal-event--cont"}${item.isLast ? "" : " cal-event--to-next"}" data-action="cal-event" data-kind="${escapeAttr(evt.kind)}" data-id="${escapeAttr(evt.id)}" title="${escapeAttr(calendarItemTooltip(item))}">
          <span class="cal-event-time">${escapeHtml(calendarItemTimeLabel(item))}</span>
          <span class="cal-event-title">${escapeHtml(String(evt.title || "-"))}</span>
        </button>`;
      })
      .join("");
    const hiddenCount = dayItems.length - maxEv;
    const more =
      hiddenCount > 0
        ? `<button type="button" class="cal-more" data-action="cal-day" data-date="${cellDate.getFullYear()}-${cellDate.getMonth() + 1}-${cellDate.getDate()}">+${hiddenCount} más</button>`
        : "";
    return `<div class="cal-cell ${isOther ? "cal-cell-other" : ""} ${isToday ? "cal-cell-today" : ""} ${dayItems.length ? "cal-cell-has-events" : ""}">
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
    if (view === "day") cells.push(buildCellFromDate(d, false));
    const dayLong = d.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    periodTitle = dayLong.charAt(0).toUpperCase() + dayLong.slice(1);
  }

  const resourceTimelineHtml =
    view === "resources"
      ? buildCalendarResourceTimelineHtml({
          allEvents,
          driversList,
          vehiclesList,
          filters,
          focus,
          today
        })
      : "";

  const mainCalendarHtml =
    view === "resources"
      ? `<div class="calendar-grid calendar-grid--timeline">${resourceTimelineHtml}</div>`
      : `<div class="calendar-grid">
      ${view === "day" ? "" : `<div class="cal-weekdays">${weekdayHeaders}</div>`}
      <div class="cal-days cal-days--view-${view}">${cells.join("")}</div>
    </div>`;

  /* «Hoy»: todo lo que ocupa el día de hoy (incluye viajes que vienen de ayer). «Próximas»: lo que aún no empieza. */
  const todayItems = itemsOnDay(today);
  const nowMs = Date.now();
  const upcomingAll = allEvents.filter(
    (evt) => evt.start.getTime() > nowMs && !(evt.kind === "trip" && calendarIsFinishedTrip(evt.request))
  );
  const upcoming = upcomingAll.slice(0, 8);

  const todayList = todayItems.length
    ? todayItems
        .map((item) => {
          const { evt } = item;
          return `<div class="cal-day-event">
            <div class="cal-day-event-time">${escapeHtml(calendarItemTimeLabel(item))}</div>
            <div class="cal-day-event-info">
              <strong>${escapeHtml(String(evt.title || "-"))}</strong>
              <span class="muted">${escapeHtml(String(evt.subtitle || "-"))}</span>
            </div>
            <div class="cal-day-event-status">${calendarKindBadgeHtml(evt)}</div>
          </div>`;
        })
        .join("")
    : `<p class="muted cal-side-empty">Sin eventos para hoy.</p>`;

  const upcomingList = upcoming.length
    ? upcoming
        .map((evt) => {
          const date = evt.start;
          const dateLabel = date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
          return `<div class="cal-upcoming-item">
            <div class="cal-upcoming-date">
              <strong>${escapeHtml(dateLabel)}</strong>
              <span class="muted">${escapeHtml(calendarClock(date))}</span>
            </div>
            <div class="cal-upcoming-info">
              <strong>${escapeHtml(String(evt.title || "-"))}</strong>
              <span class="muted">${escapeHtml(String(evt.subtitle || "-"))}</span>
            </div>
            <div>${calendarKindBadgeHtml(evt)}</div>
          </div>`;
        })
        .join("")
    : `<p class="muted cal-side-empty">No hay programación próxima.</p>`;

  const viewToggle = `<div class="calendar-view-toggle" role="group" aria-label="Vista del calendario">
        <button type="button" class="btn btn-action btn-sm${view === "month" ? " is-active" : ""}" data-action="cal-view" data-view="month">Mes</button>
        <button type="button" class="btn btn-action btn-sm${view === "week" ? " is-active" : ""}" data-action="cal-view" data-view="week">Semana</button>
        <button type="button" class="btn btn-action btn-sm${view === "day" ? " is-active" : ""}" data-action="cal-view" data-view="day">Día</button>
        <button type="button" class="btn btn-action btn-sm${view === "resources" ? " is-active" : ""}" data-action="cal-view" data-view="resources">${IC.activity || ""} Recursos</button>
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
      ${view === "resources" ? '<span class="cal-legend-item cal-legend-item--hint muted">Bloques proporcionales a la ventana de recogida → entrega</span>' : ""}
    </div>
    ${mainCalendarHtml}
    <div class="calendar-side-grid${view === "resources" ? " calendar-side-grid--compact" : ""}">
      ${pcardWrapPro("clock", "Hoy", calendarCountLabel(todayItems.map((item) => item.evt)), `<div class="cal-day-list">${todayList}</div>`)}
      ${pcardWrapPro("calendar", "Próximas programaciones", calendarCountLabel(upcoming), `<div class="cal-upcoming-list">${upcomingList}</div>`)}
    </div>
  </section>`;

  const calHero = moduleFleetHeroStrip([
    { label: "Viajes en sistema", value: typeof AntaresDashboardDomain !== "undefined" ? AntaresDashboardDomain.computeDashboardKpis().tripsTotal : reqRead().filter((r) => r.trip).length },
    { label: "Entrevistas", value: interviewEvents.length },
    { label: "Novedades", value: absenceEvents.length },
    { label: "Tras filtros", value: allEvents.length },
    { label: "Hoy", value: todayItems.length },
    { label: "Próximos", value: upcomingAll.length }
  ]);

  return `<section class="calendar-studio">${calHero}${calendarShell}</section>`;
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
          if ((key === "driver" || key === "vehicle") && state.calendarFilters[key]) {
            state.calendarViewMode = "resources";
          }
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
        const v =
          state.calendarViewMode === "week" ||
          state.calendarViewMode === "day" ||
          state.calendarViewMode === "resources"
            ? state.calendarViewMode
            : "month";
        if (v === "month") {
          /* Del 29–31 saltar al mes siguiente se desbordaba (31 ene + 1 mes = 3 mar): se ajusta al último día. */
          const keepDay = base.getDate();
          base.setDate(1);
          base.setMonth(base.getMonth() + step);
          base.setDate(Math.min(keepDay, new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()));
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
        state.calendarViewMode =
          next === "week" || next === "day" || next === "resources" ? next : "month";
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='cal-resource-group']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = String(btn.dataset.group || "auto");
        state.calendarResourceGroup =
          group === "driver" || group === "vehicle" ? group : "auto";
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='cal-show-free']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.calendarShowFree = !state.calendarShowFree;
        renderPortalView();
      });
    });

    /* «+N más» de una celda: abre ese día para ver todos sus eventos. */
    nodes.viewRoot.querySelectorAll("[data-action='cal-day']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [y, m, d] = String(btn.dataset.date || "")
          .split("-")
          .map((n) => parseInt(n, 10));
        if (!y || !m || !d) return;
        state.calendarFocus = new Date(y, m - 1, d, 12, 0, 0, 0);
        state.calendarViewMode = "day";
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
          if (typeof openAssignedTripInfoModal === "function") {
            openAssignedTripInfoModal(req);
            return;
          }
          openInfoModal({
            title: `Viaje ${req.trip.tripNumber || ""}`,
            subtitleHtml: `${escapeHtml(req.clientName || "")}${req.clientName ? " · " : ""}${prettyStatus(req.status, "trip")}`,
            bodyHtml: `<div class="dash-grid">
            <div><strong>Cliente:</strong> ${escapeHtml(req.clientName || "-")}</div>
            <div><strong>Ruta:</strong> ${escapeHtml(req.trip.route || formatRoute(req))}</div>
            <div><strong>Recogida:</strong> ${escapeHtml(fmtDate(req.trip.etaPickup))}</div>
            <div><strong>Entrega:</strong> ${escapeHtml(fmtDate(req.trip.etaDelivery))}</div>
            <div><strong>Camión:</strong> ${escapeHtml(req.trip.vehiclePlate || "-")} (${escapeHtml(req.trip.vehicleType || "-")})</div>
            <div><strong>Conductor:</strong> ${escapeHtml(req.trip.driverName || "-")} · ${escapeHtml(req.trip.driverPhone || "-")}</div>
          </div>`
          });
          return;
        }
        if (kind === "interview") {
          const interview = read(KEYS.interviews, []).find((i) => String(i.id) === id);
          if (!interview) return;
          openPortalDetailSheet({
            title: `Entrevista · ${escapeHtml(String(interview.candidateName || "Candidato"))}`,
            sheetTitle: `Entrevista · ${escapeHtml(String(interview.candidateName || "Candidato"))}`,
            subtitleHtml: `${IC.calendar} ${escapeHtml(fmtDate(interview.when))}`,
            moduleIcon: "calendar",
            moduleTone: "blue",
            sections: [
              {
                icon: "user",
                pairs: [
                  ["Candidato", `<strong>${escapeHtml(String(interview.candidateName || "-"))}</strong>`],
                  ["Fecha", escapeHtml(fmtDate(interview.when))],
                  ["Entrevistador", escapeHtml(String(interview.interviewer || "-"))],
                  ["Modalidad", escapeHtml(String(interview.modality || "-"))],
                  ["Lugar / enlace", escapeHtml(String(interview.locationOrLink || "-"))],
                  ["Notas", escapeHtml(String(interview.notes || "-"))]
                ]
              }
            ]
          });
          return;
        }
        const absence = read(KEYS.hrAbsences, []).find((a) => String(a.id) === id);
        if (!absence) return;
        const typeLabel = payrollAbsenceTypeLabel(absence.absenceType);
        openPortalDetailSheet({
          title: `${typeLabel} · ${escapeHtml(String(absence.employeeName || "Colaborador"))}`,
          sheetTitle: `${typeLabel}`,
          subtitleHtml: `${IC.user} ${escapeHtml(String(absence.employeeName || ""))}`,
          moduleIcon: "calendar",
          moduleTone: "orange",
          sections: [
            {
              icon: "calendar",
              pairs: [
                ["Empleado", `<strong>${escapeHtml(String(absence.employeeName || "-"))}</strong>`],
                ["Tipo", escapeHtml(typeLabel)],
                ["Desde", escapeHtml(String(absence.startDate || "-"))],
                ["Hasta", escapeHtml(String(absence.endDate || "-"))],
                ["Días", parseNum(absence.days).toLocaleString("es-CO")],
                ["Soporte", escapeHtml(String(absence.supportNumber || "-"))],
                ["Entidad", escapeHtml(String(absence.epsEntity || "-"))]
              ]
            }
          ],
          notesHtml: absence.notes ? String(absence.notes) : ""
        });
      });
    });

    /* Al abrir la vista de recursos: centrar en «ahora» (hoy) o en el primer viaje del día. */
    const timelineScroll = nodes.viewRoot.querySelector(".cal-timeline-scroll");
    if (timelineScroll) {
      const nowMarker = nodes.viewRoot.querySelector(".cal-timeline-now");
      let focusTop = null;
      if (nowMarker) {
        focusTop = parseFloat(nowMarker.style.top || "0") || 0;
      } else {
        const tops = Array.from(timelineScroll.querySelectorAll(".cal-timeline-block")).map(
          (el) => parseFloat(el.style.top || "0") || 0
        );
        if (tops.length) focusTop = Math.min(...tops);
      }
      if (focusTop != null) {
        timelineScroll.scrollTop = Math.max(0, focusTop - timelineScroll.clientHeight * 0.35);
      }
    }
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["transport-calendar"] = bindTransportCalendarPortalControls;
})();
