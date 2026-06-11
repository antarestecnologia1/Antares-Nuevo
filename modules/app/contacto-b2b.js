/**
 * Contacto web B2B — prospectos.
 * Extraído desde app.js — carga con defer después de app.js.
 */
function contactLeadsHtml() {
  const user = currentUser();
  if (!hasPermission(user, PERMISSIONS.CONTACT_B2B_VIEW)) {
    return emptyState("No tiene permiso para ver las solicitudes de contacto del sitio web.");
  }

  const loading = Boolean(state.contactLeadsLoading);
  const list = (Array.isArray(state.portalContacts) ? state.portalContacts : []).slice().sort((a, b) => {
    const ta = new Date(b.createdAt || 0).getTime();
    const tb = new Date(a.createdAt || 0).getTime();
    return ta - tb;
  });

  portalEnsureApiTokensAligned();
  const apiLive = portalCanRefreshFromApi();

  const hero = moduleFleetHeroStrip([
    { label: "Prospectos", value: loading ? "…" : String(list.length) },
    { label: "Pipeline", value: loading ? "…" : "Web → Equipo" },
    { label: "Estado", value: apiLive ? "Activo" : "Sin conexión" }
  ]);

  if (loading) {
    const shell = `<div class="b2b-leads-loading" role="status" aria-live="polite" aria-busy="true">
      <div class="b2b-leads-spinner" aria-hidden="true"></div>
      <div class="b2b-leads-loading-text">
        <strong>Cargando solicitudes</strong>
        <span class="muted">Un momento, estamos trayendo la bandeja de prospectos.</span>
      </div>
    </div>`;
    return hero + pcardWrap("mail", "Solicitudes de contacto web (B2B)", "Sincronizando datos…", shell);
  }

  if (!list.length) {
    const hint = apiLive
      ? "Todavía no hay solicitudes recibidas. Cuando un prospecto envíe el formulario aparecerá aquí."
      : "Sin conexión activa. Reintente en unos segundos o vuelva a iniciar sesión.";
    return hero + pcardWrap("mail", "Solicitudes de contacto web (B2B)", "0 prospectos visibles", emptyState(hint));
  }

  const cards = list
    .map((c, ix) => {
      const hueClass = ["b2b-accent-a", "b2b-accent-b", "b2b-accent-c"][ix % 3];
      const rawName = String(c.contactName || "").trim();
      const name = escapeHtml(rawName || "Contacto sin nombre");
      const av = escapeHtml((rawName || "?").slice(0, 1).toUpperCase());
      const company = escapeHtml(String(c.companyName || "").trim());
      const emailRaw = String(c.email || "").trim();
      const phoneRaw = String(c.phone || "").trim();
      const phoneDisp = formatPortalPhoneForDisplay(phoneRaw) || phoneRaw;
      const email = escapeHtml(emailRaw);
      const phone = escapeHtml(phoneDisp);
      const svc = escapeHtml(String(c.serviceType || "").trim()) || "—";
      const op = escapeHtml(String(c.operationType || "").trim()) || "—";
      const role = escapeHtml(String(c.role || "").trim()) || "—";
      const nit = escapeHtml(String(c.nit || "").trim()) || "—";
      const freq = escapeHtml(String(c.frequency || "").trim()) || "—";
      const win = escapeHtml(String(c.serviceWindow || "").trim()) || "—";
      const brief = escapeHtml(String(c.message || "").trim() || "(Sin mensaje corporativo)");
      const briefHtml = brief.replace(/\r\n|\r|\n/g, "<br />");
      const mailHref = escapeAttr(emailRaw);
      const telHref = escapeAttr(phoneDisp.replace(/\s+/g, ""));

      return `<article class="b2b-leads-card ${hueClass}">
        <header class="b2b-leads-card-top">
          <div class="b2b-leads-card-identity">
            <span class="b2b-leads-avatar">${av}</span>
            <div>
              <h3 class="b2b-leads-title">${name}</h3>
              ${company ? `<p class="b2b-leads-company muted">${company}</p>` : ""}
              <div class="b2b-leads-chip-row">
                <span class="b2b-chip b2b-chip-strong">${svc}</span>
                <span class="b2b-chip">${op}</span>
              </div>
            </div>
          </div>
          <time class="b2b-leads-when">${fmtDate(c.createdAt)}</time>
        </header>
        <dl class="b2b-leads-meta">
          <div><dt>Correo</dt><dd>${emailRaw ? `<a href="mailto:${mailHref}" class="b2b-leads-link">${email}</a>` : "—"}</dd></div>
          <div><dt>Teléfono</dt><dd>${phoneRaw ? `<a href="tel:${telHref}" class="b2b-leads-link">${phone}</a>` : "—"}</dd></div>
          <div><dt>Cargo contacto</dt><dd>${role}</dd></div>
          <div><dt>NIT</dt><dd>${nit}</dd></div>
          <div><dt>Frecuencia</dt><dd>${freq}</dd></div>
          <div><dt>Inicio esperado</dt><dd>${win}</dd></div>
        </dl>
        <section class="b2b-leads-brief" aria-label="Mensaje del prospecto"><h4 class="b2b-leads-brief-title">Brief de la solicitud</h4><div class="b2b-leads-brief-body">${briefHtml}</div></section>
      </article>`;
    })
    .join("");

  const leadsToolbar = `<div class="b2b-leads-toolbar">
    <div class="b2b-leads-toolbar-hint">
      <strong>Bandeja comercial</strong>
      <span class="muted">Prioriza por fecha y contacta prospectos desde correo o teléfono.</span>
    </div>
    <span class="b2b-leads-live-pill ${apiLive ? "b2b-leads-live-pill--ok" : ""}">${apiLive ? "Sincronización activa" : "Sin conexión API"}</span>
  </div>`;
  const mosaic = `${leadsToolbar}<div class="b2b-leads-mosaic">${cards}</div>`;
  const subtitle = `${list.length} prospecto${list.length === 1 ? "" : "s"} · vista enriquecida`;
  return `<section class="b2b-studio">${hero}${pcardWrap("mail", "Solicitudes de contacto web (B2B)", subtitle, mosaic)}</section>`;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({contactLeadsHtml});
})();