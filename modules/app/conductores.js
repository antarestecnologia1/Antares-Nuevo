/**
 * Transporte · Conductores (`transport-drivers`): HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
 */
function normalizeDriverFleetLayout(raw) {
  return String(raw || "").trim().toLowerCase() === "list" ? "list" : "cards";
}

function normalizeDriverStatusFilter(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (["available", "busy", "scheduled", "offline"].includes(v)) return v;
  return "all";
}

function normalizeDriverDocFilter(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (["ok", "warning", "expired", "missing"].includes(v)) return v;
  return "all";
}

/** Texto agregado para buscar en conductores (insensible a mayúsculas). */
function driverFleetSearchHaystack(item) {
  const d = item.raw;
  const parts = [
    d.name,
    d.idDoc,
    d.phone,
    d.license,
    d.licenseCategory,
    item.companyName,
    d.email,
    d.city,
    d.address,
    item.tripHeadline,
    item.tripDetail
  ];
  return parts.map((x) => String(x ?? "").toLowerCase()).join(" ");
}

function driversHtml() {
  const drivers = read(KEYS.drivers, []);
  const canEditDriver = canEditFleetDriverAsAdmin();
  const activeTrips = getActiveTrips();
  const activeTripsByDriverId = new Map();
  activeTrips.forEach((r) => {
    const key = String(r.trip?.driverId || "").trim();
    if (!key) return;
    if (!activeTripsByDriverId.has(key)) activeTripsByDriverId.set(key, []);
    activeTripsByDriverId.get(key).push(r);
  });
  const nowTs = Date.now();
  const resolveDriverOccupancy = (driverId) => {
    const list = activeTripsByDriverId.get(String(driverId)) || [];
    if (!list.length) return { tone: "available", trip: null, detail: "Sin viaje activo" };
    const ongoing = list.find((r) => describeTripTimingVsNow(r, nowTs).timing === "ongoing") || null;
    if (ongoing) {
      const left = describeTripTimingVsNow(ongoing, nowTs).minutes;
      return {
        tone: "busy",
        trip: ongoing,
        detail: `En curso · ${left != null ? `${left} min restantes` : "Horario en curso"}`
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
        detail: `Reservado · inicia en ${upcoming.info.minutes} min`
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
        detail: `Último viaje terminó hace ${latestPast.info.minutes} min`
      };
    }
    return { tone: "available", trip: list[0] || null, detail: "Sin cruce horario activo" };
  };
  const buildDateMeta = (rawValue, missingLabel = "Sin fecha", warnDays = 60) => {
    const value = normalizePortalDateYmd(rawValue);
    if (!value) {
      return {
        bucket: "missing",
        label: missingLabel
      };
    }
    const days = daysUntil(value);
    if (days < 0) {
      return {
        bucket: "expired",
        label: `Vencida hace ${Math.abs(days)}d`,
        days
      };
    }
    if (days <= warnDays) {
      return {
        bucket: "warning",
        label: days === 0 ? "Vence hoy" : `Vence en ${days}d`,
        days
      };
    }
    return {
      bucket: "ok",
      label: `Vigente · ${days}d`,
      days
    };
  };
  const defensiveCourseMeta = (driver) => {
    const raw = String(driver.defensiveCourse || "").trim().toLowerCase();
    if (raw === "no_aplica") return { bucket: "ok", label: "No aplica" };
    if (raw === "vencido") return { bucket: "expired", label: "Curso vencido" };
    if (raw === "vigente") return buildDateMeta(driver.defensiveCourseExpiry, "Sin fecha");
    if (!raw && !driver.defensiveCourseExpiry) return { bucket: "missing", label: "Sin registro" };
    return buildDateMeta(driver.defensiveCourseExpiry, "Sin registro");
  };
  const summaries = drivers.map((driver) => {
    const occupancy = resolveDriverOccupancy(driver.id);
    const companyName = String(getCompanyById(driver.companyId)?.name || "").trim() || "Sin empresa";
    const licenseMeta = buildDateMeta(driver.licenseExpiry, "Sin fecha");
    const courseMeta = defensiveCourseMeta(driver);
    const hasSocialSecurity = Boolean(String(driver.eps || "").trim() && String(driver.arl || "").trim());
    const comparendos = Math.max(0, parseNum(driver.comparendos || 0));
    const experienceYears = Math.max(0, parseNum(driver.experienceYears || 0));
    const statusSlug = isManuallyUnavailable(driver)
      ? "offline"
      : occupancy.tone === "busy"
        ? "busy"
        : occupancy.tone === "scheduled"
          ? "scheduled"
          : "available";
    const statusTag = statusSlug === "offline"
      ? '<span class="status status-fleet-offline">No disponible</span>'
      : statusSlug === "busy"
        ? '<span class="status status-fleet-ocupado">Ocupado</span>'
        : statusSlug === "scheduled"
          ? '<span class="status status-fleet-programado">Reservado</span>'
          : '<span class="status status-fleet-disponible">Disponible</span>';
    const docBucket = (() => {
      if (licenseMeta.bucket === "expired" || courseMeta.bucket === "expired") return "expired";
      if (licenseMeta.bucket === "missing" || courseMeta.bucket === "missing" || !hasSocialSecurity) return "missing";
      if (licenseMeta.bucket === "warning" || courseMeta.bucket === "warning" || comparendos > 0) return "warning";
      return "ok";
    })();
    const docBadge = docBucket === "expired"
      ? "Critico"
      : docBucket === "missing"
        ? "Incompleto"
        : docBucket === "warning"
          ? "Por vencer"
          : "Al dia";
    const tripHeadline = occupancy.trip
      ? `Viaje ${String(occupancy.trip.trip?.tripNumber || "-")}`
      : statusSlug === "offline"
        ? "No disponible"
        : "Disponible";
    const tripDetail = occupancy.trip
      ? String(occupancy.trip.clientName || occupancy.trip.companyName || occupancy.trip.request?.clientName || "").trim() || occupancy.detail
      : occupancy.detail;
    return {
      raw: driver,
      companyName,
      statusSlug,
      statusTag,
      occupancy,
      licenseMeta,
      courseMeta,
      hasSocialSecurity,
      comparendos,
      experienceYears,
      docBucket,
      docBadge,
      tripHeadline,
      tripDetail
    };
  });
  const totalDrivers = summaries.length;
  const availableDrivers = summaries.filter((item) => item.statusSlug === "available").length;
  const occupiedDrivers = summaries.filter((item) => item.statusSlug === "busy").length;
  const scheduledDrivers = summaries.filter((item) => item.statusSlug === "scheduled").length;
  const offlineDrivers = summaries.filter((item) => item.statusSlug === "offline").length;
  const docRiskCount = summaries.filter((item) => item.docBucket !== "ok").length;
  const expiredDocsCount = summaries.filter((item) => item.docBucket === "expired").length;

  const driversUi = state.driversUi || {};
  const fleetSearchRaw = String(driversUi.fleetSearch ?? "");
  const fleetSearchNorm = fleetSearchRaw.trim().toLowerCase();
  const fleetLayout = normalizeDriverFleetLayout(driversUi.fleetLayout);
  const statusFilter = normalizeDriverStatusFilter(driversUi.statusFilter);
  const docFilter = normalizeDriverDocFilter(driversUi.docFilter);
  const companyFilter = String(driversUi.companyId ?? "").trim();

  const filteredSummaries = summaries.filter((item) => {
    if (statusFilter !== "all" && item.statusSlug !== statusFilter) return false;
    if (docFilter !== "all" && item.docBucket !== docFilter) return false;
    if (companyFilter && String(item.raw.companyId ?? "").trim() !== companyFilter) return false;
    if (fleetSearchNorm && !driverFleetSearchHaystack(item).includes(fleetSearchNorm)) return false;
    return true;
  });

  const optSel = (value, current) => (String(value) === String(current) ? "selected" : "");

  const renderDriverCard = (item) => {
    const d = item.raw;
    const initials = String(d.name || "C")
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
    const photoUrlDriver = String(d.photoUrl || "").trim();
    const hasDriverPhoto = Boolean(
      photoUrlDriver && (/^https?:\/\//i.test(photoUrlDriver) || /^data:image\//i.test(photoUrlDriver))
    );
    const avatarInner = hasDriverPhoto
      ? `<img src="${escapeAttr(photoUrlDriver)}" alt="" loading="lazy" />`
      : initials;
    const avatarClass = hasDriverPhoto
      ? "directory-card__avatar directory-card__avatar--photo"
      : "directory-card__avatar";
    const phoneValue = d.phone ? formatPortalPhoneForDisplay(String(d.phone)) : "Sin telefono";
    const expLabel = item.experienceYears ? `${item.experienceYears} año${item.experienceYears === 1 ? "" : "s"}` : "Sin dato";
    const docTone = directoryToneFromBucket(item.docBucket);
    const opsTone = directoryOpsToneFromSlug(item.statusSlug);
    const courseTone = directoryToneFromBucket(item.courseMeta.bucket);
    const licenseFact = `${String(d.license || "-")} · ${item.licenseMeta.label}`;
    return `<article class="directory-card directory-card--driver directory-card--${escapeAttr(item.statusSlug)} directory-card--doc-${escapeAttr(item.docBucket)}">
        <header class="directory-card__head">
          <div class="directory-card__identity">
            <div class="${avatarClass}">${avatarInner}</div>
            <div class="directory-card__heading">
              <p class="directory-card__kicker">${escapeHtml(item.companyName)}</p>
              <h4 class="directory-card__title">${escapeHtml(String(d.name || "Conductor"))}</h4>
            </div>
          </div>
          <div class="directory-card__status-stack">
            ${item.statusTag}
            ${directoryPillHtml(item.docBadge, docTone)}
          </div>
        </header>
        ${directoryOpsHtml(item.tripHeadline, item.tripDetail, opsTone)}
        <div class="directory-card__metrics">
          ${directoryChipHtml("Licencia", String(d.licenseCategory || "Sin cat."))}
          ${directoryChipHtml("Exper.", expLabel)}
          ${directoryChipHtml("Compar.", item.comparendos > 0 ? String(item.comparendos) : "0", item.comparendos > 0 ? "warn" : "ok")}
          ${directoryChipHtml("SS", item.hasSocialSecurity ? "Al dia" : "Pendiente", item.hasSocialSecurity ? "ok" : "warn")}
        </div>
        <dl class="directory-card__facts">
          ${directoryFactHtml("Documento", String(d.idDoc || "-"))}
          ${directoryFactHtml("Telefono", phoneValue)}
          ${directoryFactHtml("Licencia", licenseFact)}
          ${directoryFactHtml("Curso", item.courseMeta.label, { tone: courseTone })}
        </dl>
        <footer class="directory-card__actions">
          <button type="button" class="btn btn-sm btn-outline" data-action="view-driver" data-id="${escapeAttr(String(d.id ?? ""))}">${IC.eye} Ver</button>
          ${
            canEditDriver
              ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-driver" data-id="${escapeAttr(String(d.id ?? ""))}">${IC.edit} Editar</button>
          <button type="button" class="btn btn-sm btn-action" data-action="toggle-driver" data-id="${escapeAttr(String(d.id ?? ""))}">${IC.toggle} Estado</button>`
              : ""
          }
        </footer>
      </article>`;
  };

  const cardsHtml = filteredSummaries.map(renderDriverCard).join("");

  const driverListRows = filteredSummaries
    .map((item) => {
      const d = item.raw;
      const docTone = directoryToneFromBucket(item.docBucket);
      const actions = `<div class="toolbar driver-fleet-list-actions">
          <button type="button" class="btn btn-sm btn-outline" data-action="view-driver" data-id="${escapeAttr(String(d.id ?? ""))}">${IC.eye} Ver</button>
          ${
            canEditDriver
              ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-driver" data-id="${escapeAttr(String(d.id ?? ""))}">${IC.edit} Editar</button>
          <button type="button" class="btn btn-sm btn-action" data-action="toggle-driver" data-id="${escapeAttr(String(d.id ?? ""))}">${IC.toggle} Estado</button>`
              : ""
          }
        </div>`;
      return `<tr data-driver-id="${escapeAttr(String(d.id ?? ""))}">
        <td data-label="Conductor"><strong>${escapeHtml(String(d.name || "—"))}</strong><div class="muted driver-fleet-list-sub">${escapeHtml(String(d.idDoc || "—"))}</div></td>
        <td data-label="Empresa">${escapeHtml(item.companyName)}</td>
        <td data-label="Estado">${item.statusTag}</td>
        <td data-label="Docs">${directoryPillHtml(item.docBadge, docTone)}</td>
        <td data-label="Disponibilidad"><span class="driver-fleet-list-avail">${escapeHtml(item.tripHeadline)}</span><div class="muted driver-fleet-list-sub">${escapeHtml(item.tripDetail)}</div></td>
        <td data-label="Acciones" class="driver-fleet-list-actions">${actions}</td>
      </tr>`;
    })
    .join("");

  const fleetListTable =
    fleetLayout === "list" && filteredSummaries.length > 0
      ? `<div class="table-wrap driver-fleet-list-wrap"><table class="vehicle-fleet-table driver-fleet-table">
    <thead><tr>
      <th>Conductor</th><th>Empresa</th><th>Estado</th><th>Documentación</th><th>Disponibilidad</th><th>Acciones</th>
    </tr></thead>
    <tbody>${driverListRows}</tbody>
  </table></div>`
      : "";

  const fleetCardsGrid =
    fleetLayout === "cards" && cardsHtml ? `<div class="drivers-grid directory-grid">${cardsHtml}</div>` : "";

  const companies = read(KEYS.companies, []);
  const companyOptions = [`<option value="" ${companyFilter ? "" : "selected"}>Todas las empresas</option>`]
    .concat(
      companies
        .filter((c) => isCompanyRecordActive(c))
        .map(
          (c) =>
            `<option value="${escapeAttr(String(c.id))}" ${optSel(String(c.id), companyFilter)}>${escapeHtml(String(c.name || ""))}</option>`
        )
    )
    .join("");

  const fleetToolbar =
    totalDrivers > 0
      ? `<div class="transport-ops-toolbar driver-fleet-toolbar">
      <div class="driver-fleet-toolbar-top">
        <label class="transport-ops-search">
          <span class="muted">${IC.search || ""} Buscar</span>
          <input type="search" data-action="drivers-fleet-search" value="${escapeAttr(fleetSearchRaw)}" placeholder="Nombre, documento, teléfono, empresa…" autocomplete="off" />
        </label>
        <div class="driver-fleet-view-field">
          <span class="driver-fleet-field-eyebrow muted">${IC.layers || IC.grid || ""} Vista</span>
          <div class="transport-ops-layout driver-fleet-view-toggle" role="group" aria-label="Vista de conductores">
            <button type="button" class="btn btn-sm ${fleetLayout === "cards" ? "btn-primary" : "btn-outline"}" data-action="drivers-fleet-layout" data-layout="cards">Tarjetas</button>
            <button type="button" class="btn btn-sm ${fleetLayout === "list" ? "btn-primary" : "btn-outline"}" data-action="drivers-fleet-layout" data-layout="list">Lista</button>
          </div>
        </div>
      </div>
      <div class="driver-fleet-toolbar-filters">
      <label class="driver-fleet-filter">${fieldLabel(IC.activity, "Estado")}
        <select data-action="drivers-fleet-filter" data-filter="status" aria-label="Filtrar por estado operativo">
          <option value="all" ${optSel("all", statusFilter)}>Todos</option>
          <option value="available" ${optSel("available", statusFilter)}>Disponible</option>
          <option value="busy" ${optSel("busy", statusFilter)}>Ocupado</option>
          <option value="scheduled" ${optSel("scheduled", statusFilter)}>Reservado</option>
          <option value="offline" ${optSel("offline", statusFilter)}>No disponible</option>
        </select></label>
      <label class="driver-fleet-filter">${fieldLabel(IC.file, "Documentación")}
        <select data-action="drivers-fleet-filter" data-filter="doc" aria-label="Filtrar por riesgo documental">
          <option value="all" ${optSel("all", docFilter)}>Todas</option>
          <option value="ok" ${optSel("ok", docFilter)}>Al día</option>
          <option value="warning" ${optSel("warning", docFilter)}>Por vencer</option>
          <option value="missing" ${optSel("missing", docFilter)}>Incompleto</option>
          <option value="expired" ${optSel("expired", docFilter)}>Crítico</option>
        </select></label>
      <label class="driver-fleet-filter">${fieldLabel(IC.briefcase, "Empresa")}
        <select data-action="drivers-fleet-filter" data-filter="company" aria-label="Filtrar por empresa">${companyOptions}</select></label>
      </div>
    </div>`
      : "";

  let fleetMainBody;
  if (!totalDrivers) {
    fleetMainBody = emptyState("No hay conductores registrados.");
  } else if (!filteredSummaries.length) {
    fleetMainBody = `${fleetToolbar}${emptyState("Ningún conductor coincide con la búsqueda o los filtros.")}`;
  } else {
    fleetMainBody = `${fleetToolbar}${fleetLayout === "list" ? fleetListTable : fleetCardsGrid}`;
  }

  const moduleHint = canEditDriver
    ? "Alta, baja y ficha completa en Gestión humana. Aquí el admin puede ajustar datos operativos (se copian a GH)."
    : "Solo consulta. La ficha completa del empleado se edita en Gestión humana.";
  const filtersActive =
    Boolean(fleetSearchNorm) || statusFilter !== "all" || docFilter !== "all" || Boolean(companyFilter);
  const driverCardSubtitle = filtersActive
    ? `${filteredSummaries.length} de ${totalDrivers} conductores${fleetLayout === "list" ? " · vista lista" : ""} · ${moduleHint}`
    : `${totalDrivers} registrados${fleetLayout === "list" ? " · vista lista" : ""} · ${moduleHint}`;
  const heroStrip = moduleFleetHeroStrip([
    { label: "Total", value: totalDrivers },
    { label: "Disponibles", value: availableDrivers },
    { label: "Ocupados", value: occupiedDrivers, tone: occupiedDrivers ? "warn" : undefined },
    { label: "Reservados", value: scheduledDrivers },
    { label: "No disp.", value: offlineDrivers },
    { label: "Docs riesgo", value: docRiskCount, tone: docRiskCount ? "warn" : undefined },
    { label: "Vencidos", value: expiredDocsCount, tone: expiredDocsCount ? "alert" : undefined }
  ]);
  return `<section class="drivers-studio">${heroStrip}${pcardWrap("user", "Conductores", driverCardSubtitle, fleetMainBody)}</section>`;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ driversHtml });
})();

(function registerTransportDriversPortalBinds() {
  "use strict";

  function bindTransportDriversPortalControls() {
    if (String(state.currentView || "") !== "transport-drivers" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='delete-driver']").forEach((btn) => {
      btn.addEventListener("click", () => {
        notify(userMessage("driverDeleteUseHr"), "error");
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='drivers-fleet-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        state.driversUi = { ...(state.driversUi || {}), fleetSearch: String(el.value || "") };
        state.__driversFleetSearchRestore = { start, end };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='drivers-fleet-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = normalizeDriverFleetLayout(btn.dataset.layout);
        state.driversUi = { ...(state.driversUi || {}), fleetLayout: layout };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='drivers-fleet-filter']").forEach((el) => {
      el.addEventListener("change", () => {
        const sel = /** @type {HTMLSelectElement} */ (el);
        const filter = String(sel.dataset.filter || "");
        const value = String(sel.value || "");
        const prev = state.driversUi || {};
        if (filter === "status") {
          state.driversUi = { ...prev, statusFilter: normalizeDriverStatusFilter(value) };
        } else if (filter === "doc") {
          state.driversUi = { ...prev, docFilter: normalizeDriverDocFilter(value) };
        } else if (filter === "company") {
          state.driversUi = { ...prev, companyId: value };
        }
        renderPortalView();
      });
    });

    const driverForm = document.getElementById("form-driver");
    if (driverForm) {
      attachDepartmentCitySelects(driverForm, {
        departmentSelector: "select[name='department']",
        citySelector: "select[name='city']"
      });
      wireFormSubmitGuard(driverForm, async (event) => {
        const actor = currentUser();
        const data = readFormEntriesNormalized(driverForm);
        if (!/^\d{10,15}$/.test(String(data.phone || "").trim())) {
          notify(userMessage("driverPhoneInvalid"), "error");
          return;
        }
        const docValidation = validateColombianDocument(data.documentType, data.idDoc);
        if (!docValidation.ok) {
          notify(docValidation.message, "error");
          return;
        }
        data.idDoc = docValidation.normalized;
        if (new Date(String(data.licenseExpiry || "")).getTime() <= Date.now()) {
          notify(userMessage("driverLicenseRegister"), "error");
          return;
        }
        if (actor?.role !== ROLES.ADMIN) {
          await queueApproval({
            type: "create_driver",
            title: `Creacion de conductor ${normalizeLatinUpperForDb(data.name)}`,
            payload: normalizeDriverFormPayloadForStorage(data),
            requestedByUserId: actor?.id || "",
            requestedByName: actor?.name || "Usuario"
          });
          notify(userMessage("driverApprovalQueued"), "info");
          renderPortalView();
          return;
        }
        const driverPayload = normalizeDriverFormPayloadForStorage(data);
        const list = read(KEYS.drivers, []);
        list.push(
          stampCreatedRecord({
            id: newUuidV4(),
            ...driverPayload,
            available: true,
            hiredAt: nowIso()
          })
        );
        try {
          await writeAwaitServer(KEYS.drivers, list);
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el conductor en el servidor."), "error");
          return;
        }
        const employees = read(KEYS.payrollEmployees, []);
        const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(data.idDoc || ""));
        if (!existsEmployee) {
          employees.push({
            id: newUuidV4(),
            name: driverPayload.name || normalizeLatinUpperForDb(data.name),
            idDoc: data.idDoc,
            documentType: data.documentType,
            position: "CONDUCTOR",
            contractType: normalizeLatinUpperForDb(data.contractType || "Indefinido"),
            workerRole: "conductor",
            city: driverPayload.city || normalizeLatinForDb(data.city || ""),
            address: driverPayload.address || normalizeLatinUpperForDb(data.address || ""),
            phone: driverPayload.phone || normalizePortalPhoneForStorage(data.phone || ""),
            emergencyContact:
              driverPayload.emergencyContact || normalizeLatinUpperForDb(data.emergencyContact || ""),
            emergencyPhone:
              driverPayload.emergencyPhone || normalizePortalPhoneForStorage(data.emergencyPhone || ""),
            companyId: data.companyId || "",
            baseSalary: parseNum(data.baseSalary),
            startDate: data.startDate || nowIso().slice(0, 10)
          });
          try {
            await writeAwaitServer(KEYS.payrollEmployees, employees);
          } catch (err) {
            notify(String(err?.message || "Conductor guardado; no fue posible crear el vínculo de empleado en el servidor."), "error");
          }
        }
        notify(userMessage("driverCreated"), "success");
        try {
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
        } catch (_e) {}
        renderPortalView();
      }, { busyText: "Registrando conductor…" });
    }

    /* Conductor Ver/Estado: installDriverCardActionsDelegation() */

    nodes.viewRoot.querySelectorAll("[data-action='edit-driver']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (abortUnlessAdminForFleetDriverEdit()) return;
        const did = String(btn.dataset.id || "").trim();
        if (!did) return;
        if (btn.dataset.busy === "1") return;
        btn.dataset.busy = "1";
        btn.disabled = true;
        btn.setAttribute("aria-busy", "true");
        try {
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
        } catch (_e) {
        } finally {
          btn.dataset.busy = "0";
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
        }
        const all = read(KEYS.drivers, []);
        const rawTarget = all.find((v) => String(v.id ?? "").trim() === did);
        const target = normalizeDriverRowForEditor(rawTarget);
        if (!target) {
          notify("No se encontro el conductor en el servidor. Actualice la pagina o verifique su conexion.", "error");
          return;
        }
        const initials = String(target.name || "C")
          .split(/\s+/)
          .map((p) => p.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("");
        const existingPhoto = String(target.photoUrl || "").trim();
        const hasEditPhoto =
          Boolean(existingPhoto && (/^https?:\/\//i.test(existingPhoto) || /^data:image\//i.test(existingPhoto)));
        const photoOvalInner = hasEditPhoto
          ? `<img src="${escapeAttr(existingPhoto)}" alt="" />`
          : `<span class="driver-edit-photo-oval--placeholder" aria-hidden="true">${escapeHtml(
              initials.slice(0, 1) || "C"
            )}</span>`;

        const licenseCatOpts = editModalCatalogSelectOptions(
          CO_CATALOGS.licenseCategories,
          target.licenseCategory
        );
        const bloodOpts = editModalCatalogSelectOptions(CO_CATALOGS.bloodTypes, target.bloodType);
        const epsOpts = editModalCatalogSelectOptions(CO_CATALOGS.eps, target.eps);
        const arlOpts = editModalCatalogSelectOptions(CO_CATALOGS.arl, target.arl);
        const linkedEmployee = findPayrollEmployeeByIdDoc(target.idDoc);
        const hrLinkNotice = linkedEmployee
          ? `<p class="full muted modal-field-hint" style="margin:0 0 0.5rem">
              Vinculado a ${escapeHtml(String(linkedEmployee.name || linkedEmployee.idDoc || "empleado"))} en Gestión humana.
              Al guardar, solo <strong>datos básicos</strong> (nombre, contacto, licencia, exámenes, EPS/ARL, foto) se copian allí.
              Salario, contrato y baja no se modifican desde este módulo.
            </p>`
          : `<p class="full muted modal-field-hint" style="margin:0 0 0.5rem">
              No se encontró empleado con el mismo documento. Registre la persona en Gestión humana con rol conductor.
            </p>`;
        openEditModal({
          title: "Editar conductor",
          subtitle: target.name,
          submitText: "Actualizar conductor",
          fields: [
            ...(hrLinkNotice
              ? [{ type: "custom", id: "driver-hr-link-notice", html: hrLinkNotice }]
              : []),
            {
              type: "custom",
              id: "driver-edit-photo-slot",
              html: `<div class="driver-edit-photo-block full">
                <div class="driver-edit-photo-oval">${photoOvalInner}</div>
                <label class="full driver-edit-photo-hint">
                  <span>Foto del conductor</span>
                  <input type="file" name="driverPhotoFile" accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png" />
                  <input type="hidden" name="photoUrlExisting" value="${escapeAttr(existingPhoto)}" />
                </label>
                <p class="full muted modal-field-hint" style="text-align:center;font-size:0.8rem;margin:0">
                  JPG o PNG preferiblemente. Si no elige archivo, se conserva la foto actual.
                </p>
              </div>`
            },
            { name: "name", label: "Nombre completo", value: target.name, required: true },
            { name: "phone", label: "Teléfono celular", value: target.phone, required: true, placeholder: "Ej: 3001234567" },
            { name: "emergencyContact", label: "Contacto de emergencia", value: target.emergencyContact || "" },
            { name: "emergencyPhone", label: "Tel. emergencia", value: target.emergencyPhone || "" },
            { name: "bloodType", label: "Tipo de sangre (RH)", type: "select", value: target.bloodType || "", options: bloodOpts },
            { name: "license", label: "N° licencia de conducción", value: target.license || "", placeholder: "Ej: 12345678" },
            { name: "licenseCategory", label: "Categoría licencia", type: "select", value: target.licenseCategory || "", options: licenseCatOpts },
            { name: "licenseExpiry", label: "Vence licencia", type: "date", value: target.licenseExpiry || "" },
            { name: "occupationalExamDate", label: "Examen ocupacional", type: "date", value: target.occupationalExamDate || "" },
            { name: "instruvialExamDate", label: "Examen instruvial", type: "date", value: target.instruvialExamDate || "" },
            {
              name: "defensiveCourse",
              label: "Curso conducción defensiva (Res. 17220)",
              type: "select",
              value: target.defensiveCourse || "",
              options: [
                { value: "", label: "Seleccione..." },
                { value: "vigente", label: "Vigente" },
                { value: "vencido", label: "Vencido" },
                { value: "no_aplica", label: "No aplica" }
              ]
            },
            { name: "defensiveCourseExpiry", label: "Vence curso defensivo", type: "date", value: target.defensiveCourseExpiry || "" },
            { name: "eps", label: "EPS", type: "select", value: target.eps || "", options: epsOpts },
            { name: "arl", label: "ARL", type: "select", value: target.arl || "", options: arlOpts },
            { name: "comparendos", label: "Comparendos pendientes (SIMIT)", type: "number", value: target.comparendos || 0 },
            { name: "experienceYears", label: "Años de experiencia conduciendo", type: "number", value: target.experienceYears || 0 }
          ],
          afterMount: (formEl) => {
            if (!formEl) return;
            [
              ["bloodType", target.bloodType],
              ["licenseCategory", target.licenseCategory],
              ["eps", target.eps],
              ["arl", target.arl],
              ["defensiveCourse", target.defensiveCourse]
            ].forEach(([name, val]) => {
              const sel = formEl.querySelector(`select[name="${name}"]`);
              if (sel && val) setFormSelectValue(sel, val);
            });
          },
          onSubmit: async (_form, formEl) => {
            const expiryValue = String(formEl?.querySelector?.("input[name='licenseExpiry']")?.value ?? "").trim();
            if (expiryValue && new Date(expiryValue).getTime() <= Date.now()) {
              notify(userMessage("driverLicenseFutureEdit"), "error");
              return false;
            }

            let photoUrl = String(formEl?.querySelector?.("input[name='photoUrlExisting']")?.value ?? "").trim();
            const photoFile = formEl?.querySelector?.("input[name='driverPhotoFile']")?.files?.[0];
            if (photoFile) {
              try {
                photoUrl = await resolveEmployeeAvatarUrl(photoFile, photoUrl);
              } catch (_e) {
                notify("No se pudo subir la imagen seleccionada.", "error");
                return false;
              }
              if (/^data:image\//i.test(photoUrl)) {
                notify(
                  "Sin almacenamiento de fotos en el servidor (R2 / CF_R2_*), la imagen es demasiado grande para persistir aquí.",
                  "error"
                );
                return false;
              }
            }

            const getVal = (name) =>
              formEl instanceof HTMLFormElement
                ? String(new FormData(formEl).get(name) ?? "").trim()
                : "";

            const licenseExpiryNorm = normalizePortalDateYmd(expiryValue);
            const occDate = normalizePortalDateYmd(getVal("occupationalExamDate"));
            const intraDate = normalizePortalDateYmd(getVal("instruvialExamDate"));
            const defExpiry = normalizePortalDateYmd(getVal("defensiveCourseExpiry"));

            const nextDrivers = read(KEYS.drivers, []).map((d) =>
              String(d.id ?? "").trim() === String(target.id ?? "").trim()
                ? stampUpdatedRecord({
                    ...d,
                    name: getVal("name"),
                    phone: normalizePortalPhoneForStorage(getVal("phone")),
                    emergencyContact: getVal("emergencyContact"),
                    emergencyPhone: normalizePortalPhoneForStorage(getVal("emergencyPhone")),
                    bloodType: getVal("bloodType"),
                    license: getVal("license"),
                    licenseCategory: getVal("licenseCategory"),
                    licenseExpiry: licenseExpiryNorm,
                    occupationalExamDate: occDate,
                    occupationalExamExpiry: occDate ? addOneYearToYmd(occDate) : "",
                    instruvialExamDate: intraDate,
                    instruvialExamExpiry: intraDate ? addOneYearToYmd(intraDate) : "",
                    psychoTestDate: occDate,
                    psychoTestExpiry: occDate ? addOneYearToYmd(occDate) : "",
                    defensiveCourse: getVal("defensiveCourse"),
                    defensiveCourseExpiry: defExpiry,
                    eps: getVal("eps"),
                    arl: getVal("arl"),
                    comparendos: parseNum(getVal("comparendos")),
                    experienceYears: parseNum(getVal("experienceYears")),
                    photoUrl
                  })
                : d
            );
            try {
              await writeAwaitServer(KEYS.drivers, nextDrivers);
            } catch (err) {
              notify(String(err?.message || "No fue posible guardar el conductor en el servidor."), "error");
              return false;
            }
            const updatedDriver = nextDrivers.find(
              (row) => String(row.id ?? "").trim() === String(target.id ?? "").trim()
            );
            const employeeForSync =
              linkedEmployee || findPayrollEmployeeByIdDoc(updatedDriver?.idDoc || target.idDoc);
            let hrSync = { ok: true };
            if (employeeForSync && updatedDriver) {
              hrSync = await syncEmployeeFromDriver(employeeForSync, updatedDriver);
            }
            if (portalCanRefreshFromApi()) {
              try {
                await applyPortalBootstrapFromApi();
              } catch (_e) {}
            }
            notify(
              hrSync.ok ? userMessage("driverUpdatedHrSynced") : userMessage("driverUpdatedHrSyncFailed"),
              hrSync.ok ? "success" : "error"
            );
            renderPortalView();
            return true;
          }
        });
      });
    });

    const fleetSearchRestore = state.__driversFleetSearchRestore;
    if (fleetSearchRestore && typeof fleetSearchRestore.start === "number") {
      delete state.__driversFleetSearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "transport-drivers") return;
        const inp = root.querySelector("[data-action='drivers-fleet-search']");
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
  window.__portalModuleAfterRender["transport-drivers"] = bindTransportDriversPortalControls;
})();
