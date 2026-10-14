/**
 * Contacto web B2B — bandeja de solo lectura.
 * Extraído desde app.js — carga con defer después de app.js.
 */
let contactLeadsQuery = "";

function b2bIsShouting(text) {
  const letters = String(text || "").replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  return Boolean(letters) && letters === letters.toLocaleUpperCase("es-CO") && letters !== letters.toLocaleLowerCase("es-CO");
}

function b2bTitle(raw) {
  const text = String(raw || "").replace(/\s+/g, " ").trim();
  if (!text || !b2bIsShouting(text)) return text;
  const particles = new Set(["de", "del", "la", "las", "los", "y", "e", "da", "do", "dos", "con", "sin", "por", "el", "en", "al", "un", "una", "o", "a", "que"]);
  return text
    .split(" ")
    .map((part, index) => {
      if (!part) return part;
      const lower = part.toLocaleLowerCase("es-CO");
      if (index > 0 && particles.has(lower)) return lower;
      const core = lower.replace(/[^a-záéíóúüñ]/gi, "");
      const acronym = /[0-9]/.test(part) || (part.includes(".") && core.length > 0 && core.length <= 5) || (core.length > 0 && core.length <= 3 && !particles.has(lower));
      if (acronym) return part.toLocaleUpperCase("es-CO");
      return lower.charAt(0).toLocaleUpperCase("es-CO") + lower.slice(1);
    })
    .join(" ");
}

function b2bEmailHtml(email) {
  return escapeHtml(email).replace(/([@.])/g, "$1<wbr>");
}

function b2bBrief(raw) {
  const text = String(raw || "").replace(/\r\n/g, "\n").trim();
  if (!text || !b2bIsShouting(text)) return text;
  return text
    .split("\n")
    .map((line) => {
      const lower = line.toLocaleLowerCase("es-CO");
      const match = lower.match(/\p{L}/u);
      if (!match) return lower;
      const i = match.index;
      return lower.slice(0, i) + lower.charAt(i).toLocaleUpperCase("es-CO") + lower.slice(i + 1);
    })
    .join("\n");
}

function b2bWhen(raw) {
  const t = new Date(raw || 0);
  if (Number.isNaN(t.getTime())) return { short: "—", full: "—", iso: "" };
  const short = t.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  const full = typeof fmtDate === "function" ? fmtDate(raw) : t.toLocaleString("es-CO");
  return { short, full, iso: t.toISOString() };
}

function contactLeadsHtml() {
  const user = currentUser();
  if (!hasPermission(user, PERMISSIONS.CONTACT_B2B_VIEW)) {
    return emptyState("No tiene permiso para ver las solicitudes de contacto del sitio web.");
  }

  const loading = Boolean(state.contactLeadsLoading);
  const syncError = String(state.contactLeadsSyncError || "").trim();
  const list = (Array.isArray(state.portalContacts) ? state.portalContacts : []).slice().sort((a, b) => {
    const ta = new Date(b.createdAt || 0).getTime();
    const tb = new Date(a.createdAt || 0).getTime();
    return ta - tb;
  });
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const recent = list.filter((c) => {
    const t = new Date(c.createdAt || 0).getTime();
    return Number.isFinite(t) && now - t >= 0 && now - t <= weekMs;
  }).length;

  portalEnsureApiTokensAligned();
  const apiLive = portalCanRefreshFromApi();
  const bandeja = loading ? "…" : syncError ? "Desactualizada" : apiLive ? "Al día" : "Sin conexión";

  const hero = moduleFleetHeroStrip([
    { label: "Prospectos", value: loading ? "…" : String(list.length) },
    { label: "Últimos 7 días", value: loading ? "…" : String(recent) },
    { label: "Bandeja", value: bandeja }
  ]);

  const studio = (inner) => `<section class="b2b-studio">${hero}${inner}</section>`;

  if (loading) {
    const shell = `<div class="b2b-leads-loading" role="status" aria-live="polite" aria-busy="true">
      <div class="b2b-leads-spinner" aria-hidden="true"></div>
      <div class="b2b-leads-loading-text">
        <strong>Cargando solicitudes</strong>
        <span class="muted">Un momento, estamos trayendo la bandeja de prospectos.</span>
      </div>
    </div>`;
    return studio(pcardWrap("mail", "Solicitudes de contacto web (B2B)", "Sincronizando datos…", shell));
  }

  if (!list.length) {
    const hint = syncError
      ? syncError
      : apiLive
        ? "Todavía no hay solicitudes recibidas. Cuando un prospecto envíe el formulario aparecerá aquí."
        : "Sin conexión activa. Reintente en unos segundos o vuelva a iniciar sesión.";
    return studio(pcardWrap("mail", "Solicitudes de contacto web (B2B)", "0 prospectos visibles", emptyState(hint)));
  }

  const leadsUi = state.contactLeadsUi && typeof state.contactLeadsUi === "object" ? state.contactLeadsUi : {};
  const lf = {
    fService: String(leadsUi.fService || ""),
    fOperation: String(leadsUi.fOperation || ""),
    fFrequency: String(leadsUi.fFrequency || ""),
    fWindow: String(leadsUi.fWindow || ""),
    fPeriod: String(leadsUi.fPeriod || "")
  };
  const leadVal = (c, k) => b2bTitle(String(c[k] || "").trim());
  const leadPairs = (k) =>
    uniqueSortedFilterValues(list.map((c) => leadVal(c, k))).map((v) => [v, v]);
  const periodDays = Number(lf.fPeriod) || 0;
  const filteredList = list.filter((c) => {
    if (lf.fService && leadVal(c, "serviceType") !== lf.fService) return false;
    if (lf.fOperation && leadVal(c, "operationType") !== lf.fOperation) return false;
    if (lf.fFrequency && leadVal(c, "frequency") !== lf.fFrequency) return false;
    if (lf.fWindow && leadVal(c, "serviceWindow") !== lf.fWindow) return false;
    if (periodDays) {
      const t = new Date(c.createdAt || 0).getTime();
      if (!Number.isFinite(t) || now - t > periodDays * 24 * 60 * 60 * 1000) return false;
    }
    return true;
  });
  const leadsFilters = renderModuleFieldFilters({
    ariaLabel: "Filtros de prospectos",
    action: "b2b-field",
    clearAction: "b2b-fields-clear",
    extraClass: "b2b-field-filters",
    fields: [
      { key: "fService", label: "Servicio de interés", value: lf.fService, allLabel: "Todos los servicios", options: leadPairs("serviceType") },
      { key: "fOperation", label: "Tipo de operación", value: lf.fOperation, allLabel: "Todas las operaciones", options: leadPairs("operationType") },
      { key: "fFrequency", label: "Frecuencia", value: lf.fFrequency, allLabel: "Cualquier frecuencia", options: leadPairs("frequency") },
      { key: "fWindow", label: "Inicio estimado", value: lf.fWindow, allLabel: "Cualquier fecha de inicio", options: leadPairs("serviceWindow") },
      { key: "fPeriod", label: "Recibido", value: lf.fPeriod, allLabel: "Todo el historial",
        options: [["7", "Últimos 7 días"], ["30", "Últimos 30 días"], ["90", "Últimos 90 días"]] }
    ]
  });
  const cards = filteredList
    .map((c, ix) => {
      const hueClass = ["b2b-accent-a", "b2b-accent-b", "b2b-accent-c"][ix % 3];
      const rawName = String(c.contactName || "").trim();
      const displayName = b2bTitle(rawName) || "Contacto sin nombre";
      const name = escapeHtml(displayName);
      const av = escapeHtml((rawName || "?").slice(0, 1).toLocaleUpperCase("es-CO"));
      const companyRaw = String(c.companyName || "").trim();
      const company = escapeHtml(b2bTitle(companyRaw) || "Sin empresa");
      const emailRaw = String(c.email || "").trim();
      const phoneRaw = String(c.phone || "").trim();
      const phoneDisp = (typeof formatPortalPhoneForDisplay === "function" ? formatPortalPhoneForDisplay(phoneRaw) : "") || phoneRaw;
      const email = b2bEmailHtml(emailRaw);
      const phone = escapeHtml(phoneDisp);
      const svc = escapeHtml(b2bTitle(String(c.serviceType || "").trim()) || "Servicio sin definir");
      const op = escapeHtml(b2bTitle(String(c.operationType || "").trim()) || "Operación sin definir");
      const role = escapeHtml(b2bTitle(String(c.role || "").trim()) || "Cargo sin definir");
      const nit = escapeHtml(String(c.nit || "").trim() || "—");
      const freq = escapeHtml(b2bTitle(String(c.frequency || "").trim()) || "—");
      const win = escapeHtml(b2bTitle(String(c.serviceWindow || "").trim()) || "—");
      const briefPlain = b2bBrief(String(c.message || "").trim());
      const briefHtml = escapeHtml(briefPlain || "Sin mensaje").replace(/\n/g, "<br />");
      const when = b2bWhen(c.createdAt);
      const mailHref = escapeAttr(emailRaw);
      const telHref = escapeAttr(String(phoneDisp).replace(/[^\d+]/g, ""));
      const searchBlob = escapeAttr(
        [rawName, companyRaw, emailRaw, phoneRaw, phoneDisp, c.nit, c.role, c.serviceType, c.operationType, c.frequency, c.serviceWindow, briefPlain]
          .join(" ")
          .toLocaleLowerCase("es-CO")
      );
      const longBrief = briefPlain.length > 220;
      const briefBlock = !briefPlain
        ? `<p class="b2b-cred__note b2b-cred__note--empty">Sin mensaje</p>`
        : longBrief
          ? `<details class="b2b-cred__brief"><summary>Brief de la solicitud</summary><div class="b2b-leads-brief-body">${briefHtml}</div></details>`
          : `<p class="b2b-cred__note">${briefHtml}</p>`;

      return `<article class="b2b-leads-card b2b-cred ${hueClass}" data-search="${searchBlob}">
        <div class="b2b-cred__band" aria-hidden="true"></div>
        <header class="b2b-cred__head">
          <span class="b2b-leads-avatar" aria-hidden="true">${av}</span>
          <time class="b2b-cred__when" datetime="${escapeAttr(when.iso)}" title="${escapeAttr(when.full)}">${escapeHtml(when.short)}</time>
        </header>
        <div class="b2b-cred__who">
          <h3 class="b2b-leads-title">${name}</h3>
          <p class="b2b-cred__org">${company}</p>
          <p class="b2b-cred__role">${role}</p>
          <div class="b2b-leads-chip-row">
            <span class="b2b-chip b2b-chip-strong">${svc}</span>
            <span class="b2b-chip">${op}</span>
          </div>
        </div>
        <dl class="b2b-leads-meta b2b-cred__facts">
          <div><dt>NIT</dt><dd title="${nit}">${nit}</dd></div>
          <div><dt>Frecuencia</dt><dd title="${freq}">${freq}</dd></div>
          <div><dt>Inicio</dt><dd title="${win}">${win}</dd></div>
        </dl>
        ${briefBlock}
        <footer class="b2b-cred__foot">
          ${emailRaw ? `<a class="b2b-cred__mail b2b-leads-link" href="mailto:${mailHref}">${email}</a>` : `<span class="b2b-cred__mail b2b-cred__mail--muted">Sin correo</span>`}
          ${phoneRaw ? `<a class="b2b-cred__tel b2b-leads-link" href="tel:${telHref}">${phone}</a>` : `<span class="b2b-cred__tel b2b-cred__tel--muted">Sin teléfono</span>`}
        </footer>
      </article>`;
    })
    .join("");

  const capNote = list.length >= 500
    ? `<p class="b2b-cred-cap">Se muestran las 500 solicitudes más recientes.</p>`
    : "";
  const banner = syncError ? `<p class="b2b-sync-banner" role="alert">${escapeHtml(syncError)}</p>` : "";
  const countLabel = `${filteredList.length} prospecto${filteredList.length === 1 ? "" : "s"}`;
  const toolbar = `<div class="b2b-leads-toolbar">
    <label class="b2b-cred-search">
      <span class="b2b-cred-search__label">Buscar</span>
      <input id="b2b-leads-search" type="search" placeholder="Nombre, empresa, correo, NIT o teléfono" autocomplete="off" />
    </label>
    <span class="b2b-cred-count" data-b2b-count>${countLabel}</span>
  </div>`;
  const mosaic = `${banner}${toolbar}${leadsFilters}<div class="b2b-leads-mosaic">${cards}</div><p class="b2b-cred-nomatch"${filteredList.length ? " hidden" : ""}>Ningún prospecto coincide con la búsqueda o los filtros.</p>${capNote}`;
  return studio(pcardWrap("mail", "Solicitudes de contacto web (B2B)", "Solo lectura · contacto por correo o teléfono", mosaic));
}

function bindContactLeadsPortalControls() {
  const root = document.getElementById("view-root");
  const input = root?.querySelector("#b2b-leads-search");
  const cards = root ? [...root.querySelectorAll(".b2b-leads-card")] : [];
  if (root && typeof bindModuleFieldFilters === "function") {
    bindModuleFieldFilters(root, {
      action: "b2b-field",
      clearAction: "b2b-fields-clear",
      onChange: (key, value) => {
        if (!["fService", "fOperation", "fFrequency", "fWindow", "fPeriod"].includes(key)) return;
        state.contactLeadsUi = { ...(state.contactLeadsUi || {}), [key]: value };
        renderPortalView();
      },
      onClear: () => {
        state.contactLeadsUi = {};
        renderPortalView();
      }
    });
  }
  if (!input) return;
  const empty = root.querySelector(".b2b-cred-nomatch");
  const count = root.querySelector("[data-b2b-count]");
  const total = cards.length;
  const apply = () => {
    const q = input.value.trim().toLocaleLowerCase("es-CO");
    let n = 0;
    cards.forEach((card) => {
      const blob = String(card.getAttribute("data-search") || "");
      const show = !q || blob.includes(q);
      card.hidden = !show;
      if (show) n += 1;
    });
    if (empty) empty.hidden = n !== 0;
    if (count) {
      count.textContent = q ? `${n} de ${total}` : `${total} prospecto${total === 1 ? "" : "s"}`;
    }
  };
  if (contactLeadsQuery) input.value = contactLeadsQuery;
  input.addEventListener("input", () => {
    contactLeadsQuery = input.value;
    apply();
  });
  apply();
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews === "function") {
    window.registerLegacyPortalViews({ contactLeadsHtml });
  }
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["contact-leads"] = bindContactLeadsPortalControls;
})();
