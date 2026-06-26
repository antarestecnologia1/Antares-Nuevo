/**
 * Fichas modales de flota (vehículo técnico, conductor).
 */
const G = globalThis;

  if (vehicle?.autoBusy) {
    return '<span class="status status-fleet-ocupado">Ocupado por viaje</span>';
  }
  if (occupancy.tone === "busy") {
    return '<span class="status status-fleet-ocupado">En viaje</span>';
  }
  if (occupancy.tone === "scheduled") {
    return '<span class="status status-fleet-programado">Reservado</span>';
  }
  return '<span class="status status-fleet-disponible">Disponible</span>';
}

function openVehicleTechnicalSheetModal(vehicle) {
  if (!vehicle) return;
  const v = normalizeVehicleRowForEditor(vehicle) || vehicle;
  const plate = String(v.plate || "").trim().toUpperCase() || "—";
  const soat = docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
  const tec = docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
  const rcExpiry = docExpiryStatus(null, v.rcPolicyExpiry);
  const occupancy = describePortalVehicleOccupancy(v);
  const isRefrigerated = vehicleHasTermokingEquipment(v);
  const trip = occupancy.trip;
  const vehicleTitle = `${String(v.brand || "").trim()} ${String(v.model || "").trim()}`.trim() || plate;
  const capacityLbl =
    G.parseNum(v.capacityKg) > 0 ? `${G.parseNum(v.capacityKg).toLocaleString("es-CO")} kg` : "Sin dato";
  const mileageLbl =
    G.parseNum(v.mileageKm) > 0 ? `${G.parseNum(v.mileageKm).toLocaleString("es-CO")} km` : "Sin dato";
  const hasGps = !(v.hasGps === false || String(v.hasGps).toLowerCase() === "false");
  const termoChip = isRefrigerated
    ? '<span class="status status-viaje_asignado">Termoking</span>'
    : '<span class="status status-pendiente">Carga seca</span>';
  const heroHtml = `<div class="portal-detail-hero portal-detail-hero--vehicle">
    <div class="portal-detail-hero-plate" aria-hidden="true">${renderColombianPlateBadgeHtml(plate)}</div>
    <div class="portal-detail-hero-main">
      <p class="portal-detail-eyebrow">${G.IC.truck} Ficha técnica</p>
      <div class="portal-detail-badges">${portalVehicleAvailabilityStatusHtml(v)} ${termoChip}</div>
      <p class="portal-detail-meta"><strong>${G.escapeHtml(vehicleTitle)}</strong> · ${G.escapeHtml(String(v.type || "Vehículo"))} · ${G.escapeHtml(String(v.year || "—"))}</p>
      <ul class="portal-detail-stats" aria-label="Resumen">
        <li><strong>${G.escapeHtml(capacityLbl)}</strong><span>Capacidad</span></li>
        <li><strong>${G.escapeHtml(mileageLbl)}</strong><span>Kilometraje</span></li>
        <li><strong>${G.escapeHtml(G.fmtDateOr(v.createdAt))}</strong><span>Alta en sistema</span></li>
      </ul>
    </div>
  </div>`;
  const tilesHtml = [
    portalDetailTileMarkup(G.IC.layers, "Carrocería", G.escapeHtml(String(v.bodyType || "Sin dato")), {
      muted: !String(v.bodyType || "").trim()
    }),
    portalDetailTileMarkup(G.IC.activity, "Combustible", G.escapeHtml(String(v.fuelType || "Sin dato")), {
      muted: !String(v.fuelType || "").trim()
    }),
    portalDetailTileMarkup(
      G.IC.satellite,
      "GPS",
      hasGps ? G.escapeHtml(String(v.gpsProvider || "Instalado")) : `<span class="muted">Sin GPS</span>`,
      { muted: !hasGps }
    )
  ].join("");
  const tripHighlightBody = trip
    ? `<p class="portal-detail-loc-line"><strong>Viaje ${G.escapeHtml(String(trip.trip?.tripNumber || "—"))}</strong> · ${G.escapeHtml(String(trip.clientName || trip.companyName || ""))}</p><p class="portal-detail-loc-sub muted">${G.IC.clock} ${G.escapeHtml(occupancy.detail)}</p>`
    : `<p class="portal-detail-loc-line">${G.escapeHtml(occupancy.detail)}</p>`;
  const highlightHtml = portalDetailHighlightHtml("Operación actual", tripHighlightBody, "truck");
  const row = (pairs) => portalDetailRenderRows(pairs, { skipEmpty: false });
  const sections = [
    {
      icon: "activity",
      title: "Estado operativo",
      rows: row([
        ["Disponibilidad", portalVehicleAvailabilityStatusHtml(v)],
        ["Detalle", G.escapeHtml(occupancy.detail)],
        ["Termoking", isRefrigerated ? "Sí, equipo Termoking" : "No, carga seca"],
        ["Registrado", G.fmtDateOr(v.createdAt)],
        ["Última actualización", G.fmtDateOr(v.updatedAt)]
      ])
    },
    {
      icon: "truck",
      title: "Identificación",
      rows: row([
        ["Placa", `<strong>${G.escapeHtml(plate)}</strong>`],
        ["Marca", G.escapeHtml(String(v.brand || "—"))],
        ["Línea / modelo", G.escapeHtml(String(v.model || "—"))],
        ["Año modelo", G.escapeHtml(String(v.year || "—"))],
        ["Color", G.escapeHtml(String(v.color || "—"))],
        ["Tipo de vehículo", G.escapeHtml(String(v.type || "—"))]
      ])
    },
    {
      icon: "layers",
      title: "Características técnicas",
      rows: row([
        ["Carrocería", G.escapeHtml(String(v.bodyType || "—"))],
        ["Capacidad", capacityLbl],
        ["Combustible", G.escapeHtml(String(v.fuelType || "—"))],
        ["Configuración de ejes", G.escapeHtml(String(v.axleConfig || "—"))],
        ["N° motor", G.escapeHtml(String(v.engineNumber || "—"))],
        ["Chasis (VIN)", G.escapeHtml(String(v.vin || "—"))],
        ["Kilometraje", mileageLbl]
      ])
    },
    {
      icon: "shield",
      title: "Documentación legal",
      rows: row([
        ["Tarjeta de propiedad", G.escapeHtml(String(v.ownershipCard || "—"))],
        ["SOAT expedido", G.fmtDateOr(v.soatExpeditionDate)],
        ["SOAT vence", `${G.fmtDateOr(v.soatExpiryDate)} <span class="status ${soat.cls}">${G.escapeHtml(soat.label)}</span>`],
        ["Tecnomecánica expedida", G.fmtDateOr(v.techInspectionExpeditionDate)],
        ["Tecnomecánica vence", `${G.fmtDateOr(v.techInspectionExpiryDate)} <span class="status ${tec.cls}">${G.escapeHtml(tec.label)}</span>`],
        ["Póliza RC contractual", G.escapeHtml(String(v.rcPolicyContract || "—"))],
        ["Póliza RC extracontractual", G.escapeHtml(String(v.rcPolicyExtra || "—"))],
        [
          "Vence pólizas RCP",
          v.rcPolicyExpiry
            ? `${G.fmtDateOr(v.rcPolicyExpiry)} <span class="status ${rcExpiry.cls}">${G.escapeHtml(rcExpiry.label)}</span>`
            : "—"
        ]
      ])
    },
    {
      icon: "satellite",
      title: "GPS y trazabilidad",
      rows: row([
        ["GPS satelital", hasGps ? "Sí" : "No"],
        ["Proveedor GPS", G.escapeHtml(String(v.gpsProvider || "—"))],
        ["Usuario proveedor satélite", G.escapeHtml(String(v.satelliteProviderUser || "—"))],
        ["Contraseña proveedor satélite", v.satelliteProviderPassword ? "••••••••" : "—"]
      ])
    }
  ];
  G.openPortalDetailSheet({
    title: `Ficha técnica · ${plate}`,
    subtitle: `${String(v.type || "Vehículo")} · ${String(v.year || "")}`,
    heroHtml,
    tilesHtml,
    highlightHtml,
    sectionsHtml: portalDetailBuildGrid(sections),
    secondaryActionsHtml: isAdminActor()
      ? `<button type="button" class="btn btn-action" data-vehicle-sheet-action="edit">${G.IC.edit} Editar vehículo</button>`
      : "",
    afterMount: (contentEl) => {
      contentEl.querySelector("[data-vehicle-sheet-action='edit']")?.addEventListener("click", () => {
        document.getElementById("crud-modal")?.classList.add("hidden");
        nodes.viewRoot?.querySelector(`[data-action='edit-vehicle'][data-id="${G.escapeAttr(String(v.id || ""))}"]`)?.click();
      });
    }
  });
}

function togglePortalVehicleManualAvailability(vehicleId) {
  const target = findPortalVehicleById(vehicleId);
  if (!target) {
    G.notify("No se encontró el vehículo. Actualice la página.", "error");
    return;
  }
  if (target.autoBusy) {
    G.notify(
      "Este vehículo está ocupado por un viaje activo. La disponibilidad se ajustará automáticamente al finalizar el viaje.",
      "info"
    );
    return;
  }
  const plate = String(target.plate || "").trim().toUpperCase();
  const markingUnavailable = !isManuallyUnavailable(target);
  openConfirmModal({
    title: "Cambiar disponibilidad",
    message: markingUnavailable
      ? `¿Marcar el vehículo ${plate} como no disponible manualmente? No se ofrecerá en asignaciones hasta que lo reactive.`
      : `¿Marcar el vehículo ${plate} como disponible nuevamente?`,
    confirmText: markingUnavailable ? "Marcar no disponible" : "Marcar disponible",
    onConfirm: async () => {
      try {
        await setVehicleAvailability(target.id, !markingUnavailable);
        G.recalculateResourceAvailability();
        G.notify(
          markingUnavailable ? `Vehículo ${plate} marcado como no disponible.` : `Vehículo ${plate} disponible.`,
          "success"
        );
        G.renderPortalView();
      } catch (err) {
        G.notify(String(err?.message || "No fue posible actualizar la disponibilidad."), "error");
      }
    }
  });
}


/** Detalle de solicitud: delegación en viewRoot (tarjetas del módulo Solicitudes y tablas legacy). */

async function setDriverAvailability(driverId, available) {
  const key = String(driverId ?? "").trim();
  if (!key) return false;
  const drivers = G.read(G.KEYS.drivers, []);
  const updatedTs = G.nowIso();
  let found = false;
  const next = drivers.map((d) => {
    if (String(d.id ?? "").trim() !== key) return d;
    found = true;
    return { ...d, available: Boolean(available), updatedAt: updatedTs };
  });
  if (!found) return false;
  try {
    await G.writeAwaitServerEdit(G.KEYS.drivers, next, key);
    G.recalculateResourceAvailability();
    return true;
  } catch (_e) {
    return false;
  }
}

function findPortalDriverById(driverId) {
  const id = String(driverId ?? "").trim();
  if (!id) return null;
  return G.read(G.KEYS.drivers, []).find((d) => String(d.id ?? "").trim() === id) || null;
}

function portalDetailTileMarkup(iconSvg, label, valueHtml, opts = {}) {
  const { href = "", muted = false } = opts;
  const inner = `<span class="portal-detail-tile-icon" aria-hidden="true">${iconSvg}</span><span class="portal-detail-tile-text"><span class="portal-detail-tile-label">${G.escapeHtml(label)}</span><span class="portal-detail-tile-value">${valueHtml}</span></span>`;
  if (href) {
    return `<a class="portal-detail-tile" href="${G.escapeAttr(href)}">${inner}</a>`;
  }
  return `<div class="portal-detail-tile${muted ? " portal-detail-tile--muted" : ""}" role="group">${inner}</div>`;
}

function portalDetailRenderRows(pairs, opts = {}) {
  const skipEmpty = opts.skipEmpty !== false;
  const emptyHtml = opts.emptyHtml ?? '<span class="muted">—</span>';
  return (pairs || [])
    .filter((p) => {
      if (!p) return false;
      if (!skipEmpty) return true;
      const val = p[1];
      return val !== null && val !== undefined && String(val).trim() !== "";
    })
    .map(([label, value]) => {
      const display =
        value === null || value === undefined || String(value).trim() === ""
          ? skipEmpty
            ? null
            : emptyHtml
          : value;
      if (display === null) return "";
      return `<div class="detail-row"><span class="detail-row-label">${G.escapeHtml(String(label))}</span><span class="detail-row-value">${display}</span></div>`;
    })
    .filter(Boolean)
    .join("");
}

function portalDetailBuildGrid(sections) {
  const blocks = (sections || [])
    .filter((sec) => sec && String(sec.rows || "").trim())
    .map((sec, idx) => {
      const toneClass = sec.tone ? ` detail-section--${G.escapeAttr(String(sec.tone))}` : "";
      return `<section class="detail-section detail-section--card${toneClass}" style="--detail-section-i:${idx % 6}">
        <h4 class="detail-section-title">${G.IC[sec.icon] || ""}<span>${G.escapeHtml(sec.title)}</span></h4>
        <div class="detail-section-grid">${sec.rows}</div>
      </section>`;
    })
    .join("");
  return blocks ? `<div class="detail-grid detail-grid--sections">${blocks}</div>` : "";
}

function portalDetailHighlightHtml(title, bodyHtml, iconKey = "activity") {
  const safeTitle = String(title || "").trim() || "Detalle";
  return `<section class="portal-detail-highlight" aria-label="${G.escapeAttr(safeTitle)}">
    <h4 class="portal-detail-highlight__title">${G.IC[iconKey] || ""}<span>${G.escapeHtml(safeTitle)}</span></h4>
    <div class="portal-detail-highlight__body">${bodyHtml}</div>
  </section>`;
}

function portalDetailComposeModal(parts = {}) {
  const hero = String(parts.heroHtml || "").trim();
  const tiles = String(parts.tilesHtml || "").trim();
  const highlight = String(parts.highlightHtml || "").trim();
  const sections = String(parts.sectionsHtml || "").trim();
  const extra = String(parts.extraHtml || "").trim();
  return `<div class="portal-detail-modal">
    ${hero}
    ${tiles ? `<div class="portal-detail-tiles">${tiles}</div>` : ""}
    ${highlight}
    ${sections}
    ${extra}
  </div>`;
}


function openPortalDetailSheet(opts = {}) {
  const subtitleHtml = String(opts.subtitleHtml || "").trim();
  const subtitle = String(opts.subtitle || "").trim();
  G.openInfoModal({
    title: opts.title || "Detalle",
    subtitle: subtitleHtml ? "" : subtitle,
    subtitleHtml: subtitleHtml || "",
    bodyHtml: G.portalDetailComposeModal(opts),
    wide: opts.wide !== false,
    extraModalCardClass: `modal-card--portal-detail${opts.extraModalCardClass ? ` ${G.escapeAttr(String(opts.extraModalCardClass).trim())}` : ""}`,
    secondaryActionsHtml: String(opts.secondaryActionsHtml || ""),
    afterMount: opts.afterMount
  });
}

function openDriverDetailSheetModal(driver) {
  if (!driver) return;
  const d = normalizeDriverRowForEditor(driver) || driver;
  const company = G.getCompanyById(d.companyId);
  const companyName = String(company?.name || "").trim();
  const avatarCss = employeeAvatarCssUrl(d.photoUrl);
  const avatarUrlRaw = String(d.photoUrl || "").trim();
  const avatarHero = avatarCss
    ? `<div class="portal-detail-logo portal-detail-logo--avatar"><img src="${G.escapeAttr(avatarUrlRaw)}" alt="" loading="lazy" decoding="async" /></div>`
    : `<div class="portal-detail-logo portal-detail-logo--avatar portal-detail-logo--fallback" aria-hidden="true"><span>${G.escapeHtml(
        (String(d.name || "C").charAt(0) || "C").toUpperCase()
      )}</span></div>`;
  const buildDateChip = (rawValue, missingLabel = "Sin fecha", warnDays = 60) => {
    const ymd = normalizePortalDateYmd(rawValue);
    if (!ymd) {
      return {
        bucket: "missing",
        label: missingLabel,
        chipHtml: `<span class="status status-pendiente">${G.escapeHtml(missingLabel)}</span>`
      };
    }
    const days = daysUntil(ymd);
    if (days < 0) {
      return {
        bucket: "expired",
        label: `Vencida hace ${Math.abs(days)}d`,
        chipHtml: '<span class="status status-rechazada">Vencida</span>'
      };
    }
    if (days <= warnDays) {
      const label = days === 0 ? "Vence hoy" : `Vence en ${days}d`;
      return {
        bucket: "warning",
        label,
        chipHtml: `<span class="status status-pendiente">${G.escapeHtml(label)}</span>`
      };
    }
    return {
      bucket: "ok",
      label: `Vigente · ${days}d`,
      chipHtml: '<span class="status status-viaje_asignado">Vigente</span>'
    };
  };
  const licenseMeta = buildDateChip(d.licenseExpiry, "Sin fecha");
  const courseMeta = (() => {
    const raw = String(d.defensiveCourse || "").trim().toLowerCase();
    if (raw === "no_aplica") {
      return {
        bucket: "ok",
        label: "No aplica",
        chipHtml: '<span class="status status-viaje_asignado">No aplica</span>'
      };
    }
    if (raw === "vencido") {
      return {
        bucket: "expired",
        label: "Curso vencido",
        chipHtml: '<span class="status status-rechazada">Vencido</span>'
      };
    }
    if (raw === "vigente") return buildDateChip(d.defensiveCourseExpiry, "Sin fecha");
    if (!raw && !d.defensiveCourseExpiry) {
      return {
        bucket: "missing",
        label: "Sin registro",
        chipHtml: '<span class="status status-pendiente">Sin registro</span>'
      };
    }
    return buildDateChip(d.defensiveCourseExpiry, "Sin registro");
  })();
  const driverTrips = getActiveTrips().filter((trip) => String(trip.trip?.driverId || "") === String(d.id || ""));
  const nowTs = Date.now();
  const occupancy = (() => {
    if (isManuallyUnavailable(d)) return { tone: "offline", detail: "Marcado manualmente como no disponible", trip: null };
    if (!driverTrips.length) return { tone: "available", detail: "Sin viaje activo", trip: null };
    const ongoing = driverTrips.find((trip) => describeTripTimingVsNow(trip, nowTs).timing === "ongoing") || null;
    if (ongoing) {
      const left = describeTripTimingVsNow(ongoing, nowTs).minutes;
      return {
        tone: "busy",
        trip: ongoing,
        detail: `En curso · ${left != null ? `${left} min restantes` : "Horario en curso"}`
      };
    }
    const upcoming = driverTrips
      .map((trip) => ({ trip, info: describeTripTimingVsNow(trip, nowTs) }))
      .filter((item) => item.info.timing === "upcoming")
      .sort((a, b) => G.parseNum(a.info.minutes) - G.parseNum(b.info.minutes))[0];
    if (upcoming) {
      return {

export { openVehicleTechnicalSheetModal, openDriverDetailSheetModal };
