/**
 * Estado central (`state`), referencias DOM (`nodes`) y helpers asociados se definen en
 * `modules/core/store.js` y se exponen en `window` desde `index.html` (junto con config y utils).
 */
try {
  purgeDuplicateContracts();
} catch (_) {
  /* no-op: purge is best-effort */
}

window.AntaresDataAccess = Object.freeze({
  getPortalContacts() {
    return Array.isArray(state.portalContacts) ? state.portalContacts : [];
  },
  setPortalContacts(rows) {
    state.portalContacts = Array.isArray(rows) ? rows : [];
  }
});

function pcardWrap(iconKey, title, subtitle, bodyHtml, extraClass = "") {
  return `<div class="p-card ${extraClass}"><div class="p-card-header"><div class="p-card-header-left"><svg class="p-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[iconKey]?.replace(/<svg[^>]*>|<\/svg>/g, "") || ""}</svg><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}</div></div></div><div class="p-card-body">${bodyHtml}</div></div>`;
}

function hrCardIconMarkup(iconKey) {
  const inner = IC[String(iconKey || "")]?.replace(/<svg[^>]*>|<\/svg>/g, "") || "";
  if (!inner) return "";
  return `<span class="hr-card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></span>`;
}

function pcardWrapPro(iconKey, title, subtitle, bodyHtml, extraClass = "") {
  const stat = subtitle
    ? `<span class="hr-data-card__stat">${escapeHtml(String(subtitle))}</span>`
    : "";
  return `<article class="p-card hr-data-card ${extraClass}">
    <header class="hr-data-card__head">
      <div class="hr-data-card__brand">
        ${hrCardIconMarkup(iconKey)}
        <div class="hr-data-card__titles">
          <h2>${escapeHtml(title)}</h2>
        </div>
      </div>
      ${stat}
    </header>
    <div class="p-card-body hr-data-card__body">${bodyHtml}</div>
  </article>`;
}

function renderHrFormHeroBadge(value, label) {
  const safeValue = String(value || "").trim();
  const safeLabel = String(label || "").trim();
  if (!safeValue && !safeLabel) return "";
  return `<span class="hr-form-hero-badge">${safeValue ? `<strong>${escapeHtml(safeValue)}</strong>` : ""}${safeLabel ? `<small>${escapeHtml(safeLabel)}</small>` : ""}</span>`;
}

function renderHrFormHero({ eyebrow = "", title = "", description = "", tone = "brand", badges = [] } = {}) {
  const badgeHtml = Array.isArray(badges) ? badges.filter(Boolean).join("") : "";
  return `<section class="hr-form-hero hr-form-hero--${escapeAttr(String(tone || "brand"))}">
    <div class="hr-form-hero__copy">
      ${eyebrow ? `<p class="hr-form-hero__eyebrow">${escapeHtml(String(eyebrow))}</p>` : ""}
      ${title ? `<h3 class="hr-form-hero__title">${escapeHtml(String(title))}</h3>` : ""}
      ${description ? `<p class="hr-form-hero__text">${escapeHtml(String(description))}</p>` : ""}
    </div>
    ${badgeHtml ? `<div class="hr-form-hero__badges">${badgeHtml}</div>` : ""}
  </section>`;
}

function isCreatePanelExpanded(panelId, fallbackExpanded = false) {
  const id = String(panelId || "").trim();
  if (!id) return Boolean(fallbackExpanded);
  const panels = state.createPanels || {};
  if (Object.prototype.hasOwnProperty.call(panels, id)) return Boolean(panels[id]);
  return DEFAULT_OPEN_CREATE_PANELS.has(id) || Boolean(fallbackExpanded);
}

function renderModulePanelBtnInner(iconHtml, label) {
  const icon = String(iconHtml || "").trim();
  const text = escapeHtml(String(label || "").trim());
  return `<span class="module-panel-btn__inner">${icon}<span class="module-panel-btn__label">${text}</span></span>`;
}

function renderModulePanelToggleBtn(opts = {}) {
  const expanded = Boolean(opts.expanded);
  const toggleAction = String(opts.toggleAction || "toggle-create-panel").trim();
  const panelId = String(opts.panelId || "").trim();
  const panelAttr = panelId ? ` data-panel="${escapeAttr(panelId)}"` : "";
  const expandLabel = String(opts.expandLabel || MODULE_PANEL_LABELS.expand).trim();
  if (expanded) {
    return `<button type="button" class="btn btn-sm module-panel-btn module-panel-btn--minimize" data-action="${escapeAttr(toggleAction)}"${panelAttr} aria-expanded="true" title="${escapeAttr(MODULE_PANEL_BTN_TITLES.minimize)}">${renderModulePanelBtnInner(IC.chevronDown, MODULE_PANEL_LABELS.minimize)}</button>`;
  }
  return `<button type="button" class="btn btn-sm module-panel-btn module-panel-btn--expand" data-action="${escapeAttr(toggleAction)}"${panelAttr} aria-expanded="false" title="${escapeAttr(MODULE_PANEL_BTN_TITLES.expand)}">${renderModulePanelBtnInner(IC.plus, expandLabel)}</button>`;
}

function renderModulePanelCancelBtn(opts = {}) {
  const cancelAction = String(opts.cancelAction || "cancel-create-panel").trim();
  const panelId = String(opts.panelId || "").trim();
  const panelAttr = panelId ? ` data-panel="${escapeAttr(panelId)}"` : "";
  const cancelLabel = String(opts.cancelLabel || MODULE_PANEL_LABELS.cancel).trim();
  const title = String(opts.title || MODULE_PANEL_BTN_TITLES.cancel).trim();
  return `<button type="button" class="btn btn-sm btn-action btn-danger-soft module-panel-btn module-panel-btn--cancel" data-action="${escapeAttr(cancelAction)}"${panelAttr} title="${escapeAttr(title)}">${renderModulePanelBtnInner(IC.rotateCcw, cancelLabel)}</button>`;
}

/** Barra superior: expandir (colapsado) o minimizar (expandido) — misma posición en todos los módulos. */
function renderModulePanelToolbar(opts = {}) {
  const expanded = Boolean(opts.expanded);
  const showWhen = String(opts.showWhen || "always").trim();
  if (showWhen === "collapsed" && expanded) return "";
  if (showWhen === "expanded" && !expanded) return "";
  return `<div class="module-panel-toolbar" role="toolbar" aria-label="Controles del panel">${renderModulePanelToggleBtn(opts)}</div>`;
}

function renderManagedCreateFormActions(panelId, submitHtml, opts = {}) {
  const id = String(panelId || "").trim();
  const extraClass = String(opts.className || "").trim();
  const isWizard = extraClass.includes("wizard");
  const className = [
    "module-panel-actions",
    "module-panel-actions--footer",
    "form-flow-actions",
    "full",
    extraClass,
    isWizard ? "module-panel-actions--wizard" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const toggleAction = String(opts.toggleAction || "toggle-create-panel").trim();
  const cancelAction = String(opts.cancelAction || "cancel-create-panel").trim();
  const expandLabel = String(opts.expandLabel || MODULE_PANEL_LABELS.expand).trim();
  const extraActionsHtml = String(opts.extraActionsHtml || "").trim();
  const submitMarkup = String(submitHtml || "").trim();
  const showCancel = opts.showCancel !== false;
  const toolsHtml = extraActionsHtml
    ? `<div class="module-panel-actions__group module-panel-actions__group--tools">${extraActionsHtml}</div>`
    : "";
  return `<div class="${escapeAttr(className)}">
    <div class="module-panel-actions__bar">
      <div class="module-panel-actions__group module-panel-actions__group--secondary">
        ${renderModulePanelToggleBtn({ expanded: true, toggleAction, panelId: id, expandLabel })}
        ${showCancel ? renderModulePanelCancelBtn({ cancelAction, panelId: id, cancelLabel: opts.cancelLabel }) : ""}
      </div>
      ${toolsHtml}
      ${submitMarkup ? `<div class="module-panel-actions__group module-panel-actions__group--primary">${submitMarkup}</div>` : ""}
    </div>
  </div>`;
}

/** Anterior / Siguiente en formularios por pasos (RRHH, contratación). */
function renderHrWizardNavButtons() {
  return `<div class="hr-form-wizard-footer-nav" role="group" aria-label="Navegación entre pasos">
    <button type="button" class="btn btn-outline btn-sm hr-wizard-nav-btn" data-hr-wizard-prev disabled>${renderModulePanelBtnInner(IC.chevronLeft, "Anterior")}</button>
    <button type="button" class="btn btn-primary btn-sm hr-wizard-nav-btn" data-hr-wizard-next>${renderModulePanelBtnInner(IC.chevronRight, "Siguiente")}</button>
  </div>`;
}

/** Pie unificado: pasos + hint + minimizar / cancelar / acciones / guardar. */
function renderHrFormWizardFooter(panelId, submitHtml, opts = {}) {
  const hintText =
    opts.hint === false
      ? ""
      : String(
          opts.hint != null && opts.hint !== ""
            ? opts.hint
            : "Avance hasta el último paso para habilitar guardar."
        ).trim();
  const hintHtml = hintText
    ? `<p class="hr-form-wizard-hint muted" data-hr-wizard-hint>${escapeHtml(hintText)}</p>`
    : `<p class="hr-form-wizard-hint muted" data-hr-wizard-hint hidden></p>`;
  return `<div class="hr-form-wizard-footer">
    <div class="hr-form-wizard-footer__head">
      ${renderHrWizardNavButtons()}
      ${hintHtml}
    </div>
    ${renderManagedCreateFormActions(panelId, submitHtml, {
      ...opts,
      className: "form-flow-actions form-flow-actions--wizard"
    })}
  </div>`;
}

/** Pie de formulario de edición: minimizar (opcional), cancelar y guardar. */
function renderModulePanelEditActions(submitHtml, opts = {}) {
  const cancelAction = String(opts.cancelAction || "").trim();
  const toggleAction = String(opts.toggleAction || "").trim();
  const submitMarkup = String(submitHtml || "").trim();
  if (!cancelAction || !submitMarkup) return "";
  const minimizeHtml = toggleAction
    ? renderModulePanelToggleBtn({ expanded: true, toggleAction, expandLabel: opts.expandLabel })
    : "";
  return `<div class="module-panel-actions module-panel-actions--footer form-flow-actions full">
    <div class="module-panel-actions__bar">
      <div class="module-panel-actions__group module-panel-actions__group--secondary">
        ${minimizeHtml}
        ${renderModulePanelCancelBtn({ cancelAction, cancelLabel: opts.cancelLabel })}
      </div>
      <div class="module-panel-actions__group module-panel-actions__group--primary">${submitMarkup}</div>
    </div>
  </div>`;
}

/** Cerrar modal (esquina superior derecha). */
function renderModalCloseBtn(id = "crud-close") {
  const safeId = String(id || "crud-close").trim() || "crud-close";
  return `<button type="button" id="${escapeAttr(safeId)}" class="btn btn-sm btn-outline module-panel-btn module-panel-btn--close" aria-label="Cerrar">${IC.x}</button>`;
}

/** Cancelar en pie de modal (mismo estilo que módulos). */
function renderModalCancelBtn(id = "crud-cancel", label = MODULE_PANEL_LABELS.cancel, btnClass = "") {
  const safeId = String(id || "crud-cancel").trim() || "crud-cancel";
  const safeLabel = String(label || MODULE_PANEL_LABELS.cancel).trim();
  const classes =
    String(btnClass || "").trim() ||
    "btn btn-sm btn-action btn-danger-soft module-panel-btn module-panel-btn--cancel";
  return `<button type="button" id="${escapeAttr(safeId)}" class="${escapeAttr(classes)}" title="${escapeAttr(MODULE_PANEL_BTN_TITLES.cancel)}">${renderModulePanelBtnInner(IC.rotateCcw, safeLabel)}</button>`;
}

function renderModalHead(title, opts = {}) {
  const safeTitle = String(title ?? "").trim();
  const closeId = String(opts.closeId || "crud-close").trim() || "crud-close";
  const subtitle = String(opts.subtitle || "").trim();
  const subtitleHtml = opts.subtitleHtml ? String(opts.subtitleHtml) : "";
  const subtitleBlock = subtitleHtml
    ? subtitleHtml
    : subtitle
      ? `<p class="muted modal-head__subtitle">${escapeHtml(subtitle)}</p>`
      : "";
  const headClass = String(opts.headClass || "").trim();
  const titleId = String(opts.titleId || "").trim();
  const titleIdAttr = titleId ? ` id="${escapeAttr(titleId)}"` : "";
  return `<div class="modal-head${headClass ? ` ${escapeAttr(headClass)}` : ""}">
    <div class="modal-head__copy">
      <h2${titleIdAttr}>${escapeHtml(safeTitle)}</h2>
      ${subtitleBlock}
    </div>
    ${renderModalCloseBtn(closeId)}
  </div>`;
}

function renderModalFooterActions(opts = {}) {
  const extraClass = String(opts.className || "").trim();
  const showCancel = opts.showCancel !== false;
  const cancelId = String(opts.cancelId || "crud-cancel").trim() || "crud-cancel";
  const cancelLabel = String(opts.cancelLabel || MODULE_PANEL_LABELS.cancel).trim();
  const cancelBtnClass = String(opts.cancelBtnClass || "").trim();
  const secondaryHtml = String(opts.secondaryHtml || "").trim();
  const primaryHtml = String(opts.primaryHtml || "").trim();
  return `<div class="module-panel-actions module-panel-actions--footer modal-edit-actions${extraClass ? ` ${escapeAttr(extraClass)}` : ""}">
    <div class="module-panel-actions__group module-panel-actions__group--secondary">
      ${showCancel ? renderModalCancelBtn(cancelId, cancelLabel, cancelBtnClass) : ""}
      ${secondaryHtml}
    </div>
    ${primaryHtml ? `<div class="module-panel-actions__group module-panel-actions__group--primary">${primaryHtml}</div>` : ""}
  </div>`;
}

function wireModalDismiss(content, close, opts = {}) {
  if (!content || typeof close !== "function") return;
  const escId = (id) =>
    typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : String(id).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const closeIds = Array.isArray(opts.closeIds) ? opts.closeIds : ["crud-close", "crud-cancel"];
  closeIds.forEach((id) => {
    content.querySelector(`#${escId(id)}`)?.addEventListener("click", close);
  });
  const okId = String(opts.okId || "").trim();
  if (okId) {
    content.querySelector(`#${escId(okId)}`)?.addEventListener("click", close);
  }
  const modal = content.closest(".modal") || document.getElementById("crud-modal");
  if (opts.backdrop !== false && modal) {
    modal.addEventListener(
      "click",
      (event) => {
        if (event.target === modal) close();
      },
      { once: true }
    );
  }
}

function createHrActionCard(panelId, iconKey, title, subtitle, bodyHtml, expandLabel = "Crear nuevo") {
  const expanded = isCreatePanelExpanded(panelId);
  const tone = String(iconKey || "plus").replace(/[^a-z0-9_-]/gi, "");
  const extraClass = expanded ? "p-card--expanded hr-action-card--open" : "p-card--collapsed";
  const desc = subtitle
    ? `<p class="hr-action-card__desc">${escapeHtml(String(subtitle))}</p>`
    : "";
  const cardBody = `<div class="hr-action-card__panel${expanded ? " is-open" : ""}" data-create-panel="${escapeAttr(panelId)}"${expanded ? "" : ' hidden'}>
    ${bodyHtml}
  </div>`;
  return `<article class="p-card hr-action-card hr-action-card--${escapeAttr(tone)} ${extraClass}" data-hr-panel="${escapeAttr(panelId)}">
    <header class="hr-action-card__head">
      ${hrCardIconMarkup(iconKey)}
      <div class="hr-action-card__copy">
        <h3>${escapeHtml(title)}</h3>
        ${desc}
      </div>
      ${renderModulePanelToolbar({ expanded, toggleAction: "toggle-create-panel", panelId, expandLabel, showWhen: "always" })}
    </header>
    ${cardBody}
  </article>`;
}

function emptyState(text) {
  return `<div class="empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><p>${escapeHtml(text)}</p></div>`;
}

function moduleFleetHeroStrip(metrics, hrVariant = "") {
  const stripTone =
    hrVariant === "payroll" ? " fleet-hero-strip--hr-payroll" : hrVariant === "hiring" ? " fleet-hero-strip--hr-hiring" : "";
  const inner = (metrics || [])
    .map(({ label, value, tone }) => {
      const extra =
        tone === "warn" ? " fleet-hero-metric-warn" : tone === "alert" ? " fleet-hero-metric-alert" : "";
      return `<div class="fleet-hero-metric${extra}"><span>${escapeHtml(String(label))}</span><strong>${escapeHtml(String(value))}</strong></div>`;
    })
    .join("");
  return `<div class="fleet-hero-strip fleet-hero-strip--solo${stripTone}"><div class="fleet-hero-metrics">${inner}</div></div>`;
}

function renderHrAlertCards(items = []) {
  const cards = (items || [])
    .map((item) => {
      const tone = ["ok", "info", "warn", "alert"].includes(item?.tone) ? item.tone : "info";
      const iconHtml = item?.icon || "";
      const value = item?.value === undefined || item?.value === null ? "—" : item.value;
      return `<div class="hr-alert-card hr-alert-card--${tone}">
        <span class="hr-alert-card-ico" aria-hidden="true">${iconHtml}</span>
        <div class="hr-alert-card-body">
          <span class="hr-alert-card-label">${escapeHtml(String(item?.label || ""))}</span>
          <strong class="hr-alert-card-value">${escapeHtml(String(value))}</strong>
          ${item?.help ? `<p class="hr-alert-card-help">${escapeHtml(String(item.help))}</p>` : ""}
        </div>
      </div>`;
    })
    .join("");
  return `<div class="hr-alert-grid">${cards}</div>`;
}

/** Barra compacta: solo ítems que requieren atención (warn/alert o valor numérico &gt; 0). */
function renderHrAttentionStrip(items = [], { okMessage = "Sin pendientes urgentes" } = {}) {
  const attention = (items || []).filter((item) => {
    const tone = item?.tone;
    if (tone === "warn" || tone === "alert") return true;
    const v = item?.value;
    if (typeof v === "number" && v > 0) return tone !== "ok";
    if (typeof v === "string" && v.startsWith("$")) return false;
    return false;
  });
  if (!attention.length) {
    return `<p class="hr-attention-strip hr-attention-strip--ok" role="status">${IC.check} ${escapeHtml(okMessage)}</p>`;
  }
  const pills = attention
    .map((item) => {
      const tone = ["warn", "alert"].includes(item?.tone) ? item.tone : "warn";
      const value = item?.value === undefined || item?.value === null ? "—" : item.value;
      const title = item?.help ? ` title="${escapeAttr(String(item.help))}"` : "";
      return `<span class="hr-attention-pill hr-attention-pill--${tone}"${title}><strong>${escapeHtml(String(value))}</strong> ${escapeHtml(String(item?.label || ""))}</span>`;
    })
    .join("");
  return `<div class="hr-attention-strip" role="status" aria-label="Requiere atención">${pills}</div>`;
}

function renderPayrollModuleHead({
  employees,
  pending,
  pendingDriverPayments = 0,
  pendingDriverCop = 0,
  pendingAbsenceApprovals,
  totalPayrollMonth,
  currentYm,
  contractNoticeCount = 0
}) {
  const chips = [
    `<span class="payroll-head-stat"><strong>${employees}</strong> colaboradores</span>`,
    `<span class="payroll-head-stat payroll-head-stat--muted"><strong>$${parseNum(totalPayrollMonth).toLocaleString("es-CO")}</strong> nómina neta ${escapeHtml(currentYm)}</span>`
  ];
  if (pending > 0) {
    chips.push(
      `<span class="payroll-head-stat payroll-head-stat--warn" title="Liquidaciones laborales sin marcar como pagadas"><strong>${pending}</strong> nómina pendiente</span>`
    );
  }
  if (pendingDriverPayments > 0) {
    chips.push(
      `<span class="payroll-head-stat payroll-head-stat--warn" title="Prestación de servicios — viajes por pagar"><strong>${pendingDriverPayments}</strong> conductores · $${parseNum(pendingDriverCop).toLocaleString("es-CO")}</span>`
    );
  }
  if (pendingAbsenceApprovals > 0) {
    chips.push(
      `<span class="payroll-head-stat payroll-head-stat--warn" title="Bandeja de aprobaciones"><strong>${pendingAbsenceApprovals}</strong> ausencias por revisar</span>`
    );
  }
  if (contractNoticeCount > 0) {
    chips.push(
      `<span class="payroll-head-stat payroll-head-stat--warn" title="Término fijo en ventana de 30 días o vencido"><strong>${contractNoticeCount}</strong> contratos en aviso</span>`
    );
  }
  return `<header class="payroll-module-head payroll-module-head--compact">
      <div class="payroll-module-head__title">
        <h2>Gestión humana</h2>
      </div>
      <div class="payroll-module-head__chips" role="list">${chips.join("")}</div>
    </header>`;
}

function renderHiringModuleHead({
  openVacancies,
  activeCandidates,
  urgentItems,
  contractsThisMonth,
  candidateConversion,
  hiredCandidates,
  totalCandidates
}) {
  const chips = [
    `<span class="payroll-head-stat"><strong>${openVacancies}</strong> vacantes abiertas</span>`,
    `<span class="payroll-head-stat payroll-head-stat--muted"><strong>${activeCandidates}</strong> en proceso</span>`,
    `<span class="payroll-head-stat payroll-head-stat--muted" title="${hiredCandidates ?? 0} contratados de ${totalCandidates ?? 0} candidatos registrados"><strong>${candidateConversion}%</strong> contratación</span>`
  ];
  if (urgentItems > 0) {
    chips.push(
      `<span class="payroll-head-stat payroll-head-stat--warn" title="Vacantes por cerrar o contratos por vencer"><strong>${urgentItems}</strong> alertas</span>`
    );
  }
  if (contractsThisMonth > 0) {
    chips.push(`<span class="payroll-head-stat"><strong>${contractsThisMonth}</strong> contratos este mes</span>`);
  }
  return `<header class="payroll-module-head payroll-module-head--compact">
      <div class="payroll-module-head__title">
        <h2>Contratación</h2>
      </div>
      <div class="payroll-module-head__chips" role="list">${chips.join("")}</div>
    </header>`;
}

function renderHiringDataSectionNav(activeId, counts = {}, { minimal = false } = {}) {
  const tabs = [
    { id: "candidates", label: "Candidatos", count: counts.candidates ?? 0, icon: "user" },
    { id: "vacancies", label: "Vacantes", count: counts.vacancies ?? 0, icon: "send" },
    { id: "interviews", label: "Entrevistas", count: counts.interviews ?? 0, icon: "calendar" },
    { id: "contracts", label: "Contratos", count: counts.contracts ?? 0, icon: "file" },
    { id: "positions", label: "Cargos", count: counts.positions ?? 0, icon: "briefcase" }
  ];
  const navClass = minimal ? "payroll-data-nav payroll-data-nav--minimal" : "payroll-data-nav";
  return `<nav class="${navClass}" role="tablist" aria-label="Consultas de contratación">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const icon = IC[t.icon] ? `<span class="payroll-data-nav-ico" aria-hidden="true">${IC[t.icon]}</span>` : "";
        return `<button type="button" role="tab" class="payroll-data-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="hiring-data-section" data-section="${escapeAttr(t.id)}">${icon}<span>${escapeHtml(t.label)}</span><span class="payroll-data-nav-count">${escapeHtml(String(t.count))}</span></button>`;
      })
      .join("")}
  </nav>`;
}

/** Prestación de servicios (conductores): pago por viaje, no nómina laboral ordinaria. */
function employeeIsConductorServiceProvider(employee) {
  if (!employee) return false;
  const role = String(employee.workerRole || "").trim().toLowerCase();
  if (role === "conductor") return true;
  const ct = String(employee.contractType || "").trim().toLowerCase();
  if (/prestaci[oó]n\s*de\s*servicios|prestacion.*servicio/i.test(ct)) return true;
  const tpl = String(employee.contractTemplateKind || employee.contractTemplate || "").trim().toLowerCase();
  if (tpl === "prestacion" || tpl.includes("prestacion")) return true;
  return false;
}

function employeeReceivesPayrollNomina(employee) {
  return !employeeIsConductorServiceProvider(employee);
}

function payrollRunIsDriverTripPayment(run) {
  return payrollRunFrequencyKind(run) === "prestacion_viajes";
}

function filterPayrollNominaRuns(allRuns = []) {
  return (Array.isArray(allRuns) ? allRuns : []).filter((run) => !payrollRunIsDriverTripPayment(run));
}

function filterDriverTripPaymentRuns(allRuns = []) {
  return (Array.isArray(allRuns) ? allRuns : []).filter((run) => payrollRunIsDriverTripPayment(run));
}

function listConductorServiceEmployees(employees = []) {
  return (Array.isArray(employees) ? employees : []).filter((e) => employeeIsConductorServiceProvider(e));
}

function payrollRunTypeLabel(run) {
  const pk = String(run?.payrollKind || "").trim().toLowerCase();
  if (pk === "prestacion_viajes" || pk === "conductor_viajes") return "Pago por viajes (prestación)";
  if (pk === "terminacion") return "Terminación contractual";
  if (pk === "quincenal") return "Nómina quincenal";
  if (pk === "catorcenal") return "Nómina catorcenal";
  if (pk === "semanal") return "Nómina semanal";
  const key = String(run?.month || "");
  if (/-Q[12]$/i.test(key)) return "Nómina quincenal";
  if (/-C[12]$/i.test(key)) return "Nómina catorcenal";
  if (/-S\d+$/i.test(key)) return "Nómina semanal";
  return "Nómina mensual";
}

/** `mensual` | `quincenal` | `catorcenal` | `semanal` | `terminacion` — infiere desde tipo_registro o clave de periodo. */
function payrollRunFrequencyKind(run) {
  const pk = String(run?.payrollKind || "").trim().toLowerCase();
  if (pk === "terminacion") return "terminacion";
  if (pk === "prestacion_viajes" || pk === "conductor_viajes") return "prestacion_viajes";
  if (pk === "quincenal" || pk === "catorcenal" || pk === "semanal" || pk === "mensual") return pk;
  const key = String(run?.month || "");
  if (/-Q[12]$/i.test(key)) return "quincenal";
  if (/-C[12]$/i.test(key)) return "catorcenal";
  if (/-S\d+$/i.test(key)) return "semanal";
  return "mensual";
}

function payrollRunMatchesFrequencyFilter(run, frequencyFilter) {
  const f = String(frequencyFilter || "all").trim().toLowerCase();
  if (!f || f === "all") return true;
  return payrollRunFrequencyKind(run) === f;
}

function defaultPayrollFilters() {
  return { period: "all", employee: "", status: "all", frequency: "all" };
}

function payrollRunMatchesPeriodFilter(run, period, currentYm, previousYm) {
  if (period === "all") return true;
  const runYm = payrollPeriodCalendarYm(run.month);
  if (period === "current") return runYm === currentYm;
  if (period === "previous") return runYm === previousYm;
  return true;
}

function buildPayrollPeriodKeyFromForm(monthYm, payFrequency, quincenaHalf) {
  const ym = String(monthYm || "").trim();
  const freq = normalizePayrollFrequencyJs(payFrequency);
  if (freq === "quincenal") {
    const half = String(quincenaHalf || "Q1").trim().toUpperCase();
    return `${ym}-${half === "Q2" ? "Q2" : "Q1"}`;
  }
  return ym;
}

function payrollDaysInManualCut(monthYm, payFrequency, quincenaHalf) {
  const freq = normalizePayrollFrequencyJs(payFrequency);
  const range = monthRange(monthYm);
  if (!range) return 30;
  if (freq !== "quincenal") return 30;
  if (String(quincenaHalf || "Q1").toUpperCase() === "Q2") {
    const end = new Date(range.end);
    const start = new Date(range.start);
    start.setDate(16);
    return Math.max(1, Math.min(30, Math.round((end - start) / 86400000) + 1));
  }
  return 15;
}

function filterPayrollRunsByUiState(
  allRuns = [],
  filters = state.payrollFilters || defaultPayrollFilters(),
  scope = "all"
) {
  let source = Array.isArray(allRuns) ? allRuns : [];
  if (scope === "nomina") source = filterPayrollNominaRuns(source);
  else if (scope === "driver") source = filterDriverTripPaymentRuns(source);
  const period = String(filters.period || "all");
  const employee = String(filters.employee || "");
  const status = String(filters.status || "all");
  const frequency = String(filters.frequency || "all");
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousYm = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
  return source.filter((run) => {
    const matchPeriod = payrollRunMatchesPeriodFilter(run, period, currentYm, previousYm);
    const matchEmployee = !employee || String(run.employeeId || "") === employee;
    const matchFrequency = payrollRunMatchesFrequencyFilter(run, frequency);
    const matchStatus =
      status === "all" ||
      (status === "paid" && Boolean(run.paid)) ||
      (status === "pending" && !run.paid);
    return matchPeriod && matchEmployee && matchFrequency && matchStatus;
  });
}

function sortPayrollRunsByUiState(runs = [], sortKey = "recent") {
  const source = Array.isArray(runs) ? [...runs] : [];
  const runSort = String(sortKey || "recent");
  return source.sort((a, b) => {
    if (runSort === "pending_first") {
      if (Boolean(a.paid) !== Boolean(b.paid)) return a.paid ? 1 : -1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (runSort === "net_desc") return parseNum(b.net) - parseNum(a.net);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

function payrollRunAlreadyExists(runs = [], employeeId, month, payrollKind = "mensual") {
  const emp = String(employeeId || "").trim();
  const ym = String(month || "").trim();
  const kind = String(payrollKind || "mensual").trim().toLowerCase();
  if (!emp || !ym) return false;
  return (Array.isArray(runs) ? runs : []).some(
    (run) =>
      String(run.employeeId || "").trim() === emp &&
      String(run.month || "").trim() === ym &&
      String(run.payrollKind || "mensual").trim().toLowerCase() === kind
  );
}

function renderPayrollRunCard(run, { compact = false } = {}) {
  const paid = Boolean(run.paid);
  const stateTone = paid ? "paid" : "pending";
  const monthLabel = formatPayrollPeriodLabel(run.month);
  const typeLabel = payrollRunTypeLabel(run);
  const orig = String(run.liquidacionOrigin || run.origenLiquidacion || "manual").toLowerCase();
  const tags = [];
  const hasAbsenceDetail = String(run.payrollKind || "mensual") !== "terminacion" && payrollRunHasAbsenceDetail(run, read(KEYS.hrAbsences, []));
  if (orig === "masiva") tags.push("Masiva");
  else if (orig === "automatica") tags.push("Automática");
  if (payrollRunIsDriverTripPayment(run)) tags.push("Prestación viajes");
  if (parseNum(run.primaServiciosCop) > 0) tags.push("Prima");
  if (parseNum(run.interesesCesantiasCop) > 0) tags.push("Int. cesantías");
  if (hasAbsenceDetail) tags.push("Ausentismo");
  const tagsHtml =
    !compact && tags.length
      ? `<p class="payroll-run-card-tags">${tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</p>`
      : "";
  const hrAdminDeletes = currentUser()?.role === ROLES.ADMIN;
  const statusHtml = paid
    ? '<span class="status status-viaje_asignado">Pagado</span>'
    : '<span class="status status-pendiente">Pendiente</span>';
  const tripYm = String(run.month || "").slice(0, 7);
  const actions = `<div class="payroll-run-card-actions toolbar">
      <button class="btn btn-sm btn-action" type="button" data-action="payslip" data-id="${escapeAttr(String(run.id))}" title="Desprendible">${IC.printer}${compact ? "" : " Desprendible"}</button>
      ${
        !paid && payrollRunIsDriverTripPayment(run)
          ? `<button class="btn btn-sm btn-outline" type="button" data-action="recalc-driver-trip" data-employee-id="${escapeAttr(String(run.employeeId))}" data-month="${escapeAttr(tripYm)}" title="Recalcular desde viajes y combustible">${IC.activity}${compact ? "" : " Recalcular"}</button>`
          : ""
      }
      ${!paid ? `<button class="btn btn-sm btn-approve" type="button" data-action="mark-payroll-paid" data-id="${escapeAttr(String(run.id))}" title="Marcar pagado">${IC.check}${compact ? "" : " Marcar pagado"}</button>` : ""}
      ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-payroll-run" data-id="${escapeAttr(String(run.id))}" title="Eliminar liquidación">${IC.trash}</button>` : ""}
    </div>`;
  const metricsHtml = compact
    ? `<dl class="payroll-run-card-metrics payroll-run-card-metrics--compact">
      <div><dt>Deducciones</dt><dd>$${parseNum(run.deductions).toLocaleString("es-CO")}</dd></div>
      <div class="payroll-run-card-net"><dt>Neto</dt><dd>$${parseNum(run.net).toLocaleString("es-CO")}</dd></div>
    </dl>`
    : `<dl class="payroll-run-card-metrics">
      <div><dt>Devengado</dt><dd>$${parseNum(run.gross).toLocaleString("es-CO")}</dd></div>
      <div><dt>Viáticos</dt><dd>$${parseNum(run.travelAllowance || 0).toLocaleString("es-CO")}</dd></div>
      <div><dt>Combustible</dt><dd>$${parseNum(run.fuelReimbursement || 0).toLocaleString("es-CO")}</dd></div>
      <div><dt>Deducciones</dt><dd>$${parseNum(run.deductions).toLocaleString("es-CO")}</dd></div>
      <div class="payroll-run-card-net"><dt>Neto a pagar</dt><dd>$${parseNum(run.net).toLocaleString("es-CO")}</dd></div>
    </dl>`;
  const compactClass = compact ? " payroll-run-card--compact" : "";
  const compactTags =
    compact && tags.length ? `<span class="payroll-run-card-tags-inline muted">${escapeHtml(tags.join(" · "))}</span>` : "";
  return `<article class="payroll-run-card payroll-run-card--${stateTone}${compactClass}" data-payroll-state="${stateTone}">
    <header class="payroll-run-card-head">
      <div>
        <p class="payroll-run-card-kicker">${escapeHtml(typeLabel)}</p>
        <h4 class="payroll-run-card-title">${escapeHtml(monthLabel)}</h4>
        <p class="payroll-run-card-employee">${escapeHtml(String(run.employeeName || "—"))}${compactTags}</p>
        ${tagsHtml}
      </div>
      ${statusHtml}
    </header>
    ${metricsHtml}
    ${actions}
  </article>`;
}

function renderPayrollDataSectionNav(activeId, counts = {}, { minimal = false } = {}) {
  const tabs = [
    { id: "employees", label: "Empleados", count: counts.employees ?? 0, icon: "user" },
    { id: "absences", label: "Ausencias", count: counts.absences ?? 0, icon: "calendar" },
    { id: "runs", label: "Nómina laboral", count: counts.runs ?? 0, icon: "dollar" },
    { id: "driverPayments", label: "Pagos conductores", count: counts.driverPayments ?? 0, icon: "truck" },
    { id: "legal", label: "Parámetros legales", count: counts.legal ?? 0, icon: "hash" }
  ];
  const navClass = minimal ? "payroll-data-nav payroll-data-nav--minimal" : "payroll-data-nav";
  return `<nav class="${navClass}" role="tablist" aria-label="Listas de personal y nómina">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const icon = IC[t.icon] ? `<span class="payroll-data-nav-ico" aria-hidden="true">${IC[t.icon]}</span>` : "";
        return `<button type="button" role="tab" class="payroll-data-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="payroll-data-section" data-section="${escapeAttr(t.id)}">${icon}<span>${escapeHtml(t.label)}</span><span class="payroll-data-nav-count">${escapeHtml(String(t.count))}</span></button>`;
      })
      .join("")}
  </nav>`;
}

function renderModuleWindowTabs({ ariaLabel, activeId, action, valueAttr = "section", tabs = [] }) {
  const attrName = String(valueAttr || "section").replace(/[^a-z0-9_-]/gi, "");
  return `<div class="auth-tabs-layout"><nav class="auth-tabs-bar" role="tablist" aria-label="${escapeAttr(ariaLabel)}">
    ${tabs
      .map((tab) => {
        const active = activeId === tab.id;
        const badge = tab.count != null ? `<span class="auth-tab-badge">${escapeHtml(String(tab.count))}</span>` : "";
        return `<button type="button" role="tab" class="auth-tab-btn${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="${escapeAttr(action)}" data-${attrName}="${escapeAttr(tab.id)}">${escapeHtml(String(tab.label))}${badge}</button>`;
      })
      .join("")}
  </nav></div>`;
}

function hrWorkspaceTabIcon(iconKey) {
  const raw = IC[String(iconKey || "")];
  if (!raw) return "";
  const svg = raw.replace(/class="btn-icon"/, 'class="hr-tab-icon-svg"');
  return `<span class="hr-workspace-tab-ico" aria-hidden="true">${svg}</span>`;
}

function renderHrWorkspaceTabs({ module, ariaLabel, activeId, tabs, variant = "pro" }) {
  const safeModule = escapeAttr(module);
  const safeAria = escapeAttr(ariaLabel);
  const navClass =
    variant === "segment"
      ? "hr-workspace-tabs hr-workspace-tabs--segment"
      : variant === "switch"
        ? "hr-workspace-tabs hr-workspace-tabs--switch"
        : "hr-workspace-tabs hr-workspace-tabs--pro";
  return `<nav class="${navClass}" role="tablist" aria-label="${safeAria}">
    ${tabs
      .map((t, idx) => {
        const active = activeId === t.id;
        const isSwitch = variant === "switch";
        const hintHtml =
          variant === "segment" || (!t.hint && !isSwitch)
            ? ""
            : `<span class="hr-workspace-tab-hint">${escapeHtml(t.hint || (t.id === "operate" ? "Altas y formularios" : "Consultas y reportes"))}</span>`;
        const iconKey = t.icon;
        const hasIcon = Boolean(iconKey) && (variant === "pro" || isSwitch);
        const badge = hasIcon
          ? hrWorkspaceTabIcon(iconKey)
          : variant === "segment"
            ? ""
            : variant === "switch"
              ? ""
              : `<span class="hr-workspace-tab-num" aria-hidden="true">${idx + 1}</span>`;
        const proClass = hasIcon ? " hr-workspace-tab--has-icon" : "";
        const tabClass =
          variant === "segment"
            ? "hr-workspace-tab hr-workspace-tab--segment"
            : variant === "switch"
              ? "hr-workspace-tab hr-workspace-tab--switch"
              : "hr-workspace-tab hr-workspace-tab--pro";
        return `<button type="button" role="tab" aria-selected="${active}" class="${tabClass}${active ? " is-active" : ""}${proClass}" data-action="hr-workspace-tab" data-module="${safeModule}" data-tab="${escapeAttr(t.id)}">
      ${badge}
      <span class="hr-workspace-tab-body"><span class="hr-workspace-tab-label">${escapeHtml(t.label)}</span>${hintHtml}</span>
    </button>`;
      })
      .join("")}
  </nav>`;
}

/** Cabecera del módulo RRHH / Contratación: título + KPIs + conmutador Registrar | Consultar. */
function renderHrWorkspaceHeader(moduleHeadHtml, tabsNavHtml, tone = "payroll") {
  const toneClass = tone === "hiring" ? "hr-workspace-header--hiring" : "hr-workspace-header--payroll";
  return `<header class="hr-workspace-header ${toneClass}">
    ${moduleHeadHtml}
    <div class="hr-workspace-header__switch">${tabsNavHtml}</div>
  </header>`;
}

function hrWizardValidityTargets(stepEl) {
  if (!stepEl) return [];
  return [...stepEl.querySelectorAll("input, select, textarea")].filter((el) => {
    if (el.disabled || el.type === "hidden") return false;
    return true;
  });
}

/** Texto de error visible (`.field-error`) o mensaje nativo del campo (p. ej. `setCustomValidity`). */
function readInlineOrNativeFieldError(fieldEl) {
  if (!fieldEl) return "";
  const label = fieldEl.closest("label");
  const hint = label?.querySelector(".field-error");
  const inline = String(hint?.textContent || "").trim();
  if (inline) return inline;
  return String(fieldEl.validationMessage || "").trim();
}

/**
 * Marca el paso como inválido: enfoca/desplaza al primer campo con error.
 * Prioriza la validación inline de AntaresValidation (mensajes claros y `.field-error`) y
 * usa la validación nativa del navegador solo como respaldo (p. ej. patrones HTML).
 * @returns {{ ok: true } | { ok: false, detail: string, firstInvalid: Element }} `detail` para toasts / avisos.
 */
function hrWizardStepValid(stepEl) {
  if (!stepEl) return { ok: true };
  const V = window.AntaresValidation;
  let firstInvalid = null;
  let hasInlineError = false;
  if (V && typeof V.validateDomForm === "function") {
    const res = V.validateDomForm(stepEl);
    if (!res.ok) {
      firstInvalid = res.firstInvalid || null;
      hasInlineError = true;
    }
  }
  if (!firstInvalid) {
    for (const el of hrWizardValidityTargets(stepEl)) {
      if (typeof el.checkValidity === "function" && !el.checkValidity()) {
        firstInvalid = el;
        // Puente: mensajes nativos (incl. setCustomValidity, p. ej. documento duplicado) se
        // muestran con el mismo estilo inline `.field-error` del resto del formulario.
        const nativeMsg = String(el.validationMessage || "").trim();
        if (nativeMsg && V && typeof V.setFieldError === "function") {
          V.setFieldError(el, nativeMsg);
          hasInlineError = true;
        }
        break;
      }
    }
  }
  if (!firstInvalid) return { ok: true };
  const detail = readInlineOrNativeFieldError(firstInvalid);
  try {
    firstInvalid.scrollIntoView?.({ behavior: "smooth", block: "center" });
  } catch (_e) {
    /* noop */
  }
  try {
    firstInvalid.focus?.({ preventScroll: true });
  } catch (_e) {
    firstInvalid.focus?.();
  }
  // Si no hay error inline visible (campo nativo sin regla Antares), mostramos la burbuja nativa.
  if (!hasInlineError && typeof firstInvalid.reportValidity === "function") {
    firstInvalid.reportValidity();
  }
  return { ok: false, detail, firstInvalid };
}

/** Etiqueta corta del paso (texto del dot) para mensajes de error específicos. */
function hrWizardStepLabel(wizard, stepIndex) {
  const dot = wizard?.querySelector?.(`[data-hr-wizard-dot="${stepIndex}"] small`);
  const txt = String(dot?.textContent || "").trim();
  return txt || `Paso ${Number(stepIndex) + 1}`;
}

/** Resalta brevemente el dot del paso con error para guiar al usuario entre pantallas. */
function flashHrWizardDotError(wizard, stepIndex) {
  const dot = wizard?.querySelector?.(`[data-hr-wizard-dot="${stepIndex}"]`);
  if (!dot) return;
  dot.classList.add("is-error");
  window.setTimeout(() => dot.classList.remove("is-error"), 1600);
}

/**
 * Solo **Término fijo** y **Prestación de servicios** requieren texto de plazo/duración.
 * Contrato indefinido u otros tipos: no se solicita (se guarda vacío en BD).
 */
function contractTypeRequiresDurationPlazo(contractType) {
  const t = String(contractType || "").trim();
  return t === "Termino fijo" || t === "Prestacion de servicios";
}

function isFixedTermContractType(contractType) {
  return String(contractType || "").trim() === "Termino fijo";
}

function addDaysToYmd(ymd, deltaDays) {
  const n = normalizePortalDateYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.trunc(Number(deltaDays) || 0));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Suma meses calendario a `YYYY-MM-DD` (local). */
function addMonthsToYmd(ymd, months) {
  const n = normalizePortalDateYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + Math.trunc(Number(months) || 0));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Inicio del plazo del contrato vigente (renovación); si falta, usa fecha de ingreso. */
function resolveEmployeeContractPlazoStartYmd(emp) {
  const e = emp && typeof emp === "object" ? emp : {};
  const vigente = normalizePortalDateYmd(
    e.contractVigenteStartDate ?? e.fecha_inicio_contrato_vigente ?? ""
  );
  const hire = normalizePortalDateYmd(e.startDate ?? e.fecha_ingreso ?? "");
  return vigente || hire;
}

/** Término fijo: fin = inicio contrato vigente + plazo (meses/años); por defecto 1 año calendario. */
function resolveEmployeeContractEndDateYmd(contractType, plazoStartYmd, raw = {}) {
  const start = normalizePortalDateYmd(plazoStartYmd);
  if (!isFixedTermContractType(contractType)) {
    return normalizePortalDateYmd(raw.contractEndDate || raw.fecha_fin_contrato || "");
  }
  if (!start) return "";
  const unit = String(raw.contractDurationUnit || "").trim().toLowerCase();
  const parsedAmt = parseInt(String(raw.contractDurationAmount ?? "").trim(), 10);
  const amount = Number.isFinite(parsedAmt) ? Math.max(1, Math.floor(parsedAmt)) : 0;
  if (unit === "meses" && amount >= 1) return addMonthsToYmd(start, amount);
  if (unit === "anios" && amount >= 1) {
    let cursor = start;
    for (let i = 0; i < amount; i += 1) {
      cursor = addOneYearToYmd(cursor);
      if (!cursor) return "";
    }
    return cursor;
  }
  if (raw.honorExplicitContractEndDate === true) {
    const explicit = normalizePortalDateYmd(raw.contractEndDate || raw.fecha_fin_contrato || "");
    if (explicit) return explicit;
  }
  return addOneYearToYmd(start);
}

function ensureEmployeeContractFields(emp) {
  const e = emp && typeof emp === "object" ? { ...emp } : {};
  const ct = String(e.contractType || "").trim();
  if (!isFixedTermContractType(ct)) return e;
  if (!String(e.contractDuration || e.contractDurationText || "").trim()) {
    e.contractDuration = "1 año";
  }
  const plazoStart = resolveEmployeeContractPlazoStartYmd(e);
  if (isFixedTermContractType(ct) && plazoStart) {
    const durText = String(e.contractDuration || e.contractDurationText || "1 año").trim();
    const parsed = parseContractDurationText(durText || "1 año");
    e.contractEndDate = resolveEmployeeContractEndDateYmd(ct, plazoStart, {
      contractDurationUnit: parsed.unit === "otro" ? "anios" : parsed.unit,
      contractDurationAmount: parsed.amount || "1"
    });
  }
  return e;
}

/**
 * Colombia (CST): si no se renovará el contrato a término fijo, avisar con al menos 30 días de anticipación.
 * @returns meta para tarjetas y perfil
 */
function computeEmployeeContractRenewalMeta(emp) {
  const e = ensureEmployeeContractFields(emp || {});
  if (!isFixedTermContractType(e.contractType)) {
    return { applies: false, statusSlug: "na" };
  }
  const endYmd = normalizePortalDateYmd(e.contractEndDate);
  if (!endYmd) {
    return {
      applies: true,
      statusSlug: "unknown",
      endYmd: "",
      noticeDeadlineYmd: "",
      daysToEnd: null,
      headline: "Término fijo sin fecha fin",
      detail: "Indique la fecha de inicio del contrato vigente (o la de ingreso) para calcular el plazo.",
      pillLabel: "Sin fecha fin",
      pillTone: "warn"
    };
  }
  const daysToEnd = daysUntil(endYmd);
  const noticeDeadlineYmd = addDaysToYmd(endYmd, -30);
  let statusSlug = "active";
  let headline = `Vence ${fmtDateOr(endYmd)}`;
  let detail = `Si no renovará, notifique por escrito a más tardar el ${fmtDateOr(noticeDeadlineYmd)} (30 días de anticipación, CST).`;
  let pillLabel = "Vigente";
  let pillTone = "ok";
  if (daysToEnd < 0) {
    statusSlug = "expired";
    headline = "Contrato vencido";
    detail = `Finalizó el ${fmtDateOr(endYmd)}. Revise renovación o terminación.`;
    pillLabel = "Vencido";
    pillTone = "alert";
  } else if (daysToEnd <= 30) {
    statusSlug = "notice_window";
    headline = `Vence en ${daysToEnd} día${daysToEnd === 1 ? "" : "s"}`;
    detail = `Ventana de aviso: notifique la no renovación antes del ${fmtDateOr(noticeDeadlineYmd)} si aplica.`;
    pillLabel = "Aviso urgente";
    pillTone = "alert";
  }
  return {
    applies: true,
    statusSlug,
    endYmd,
    noticeDeadlineYmd,
    daysToEnd,
    headline,
    detail,
    pillLabel,
    pillTone
  };
}

/** Vista previa de fin de contrato (término fijo = plazo desde inicio contrato vigente). */
function bindFixedTermContractEndPreview(root, cfg) {
  const contractSel = root.querySelector(cfg.contractSelect);
  const startEl = root.querySelector(cfg.startDate);
  const vigenteEl = cfg.contractVigenteStartDate
    ? root.querySelector(cfg.contractVigenteStartDate)
    : null;
  const vigenteWrap = cfg.vigenteWrap ? root.querySelector(cfg.vigenteWrap) : null;
  const endEl = root.querySelector(cfg.contractEndDate);
  const wrap = root.querySelector(cfg.endWrap);
  const hintEl = cfg.hint ? root.querySelector(cfg.hint) : null;
  const unitSel = cfg.unit ? root.querySelector(cfg.unit) : null;
  const amtEl = cfg.amount ? root.querySelector(cfg.amount) : null;
  if (!contractSel || !startEl || !endEl || !wrap) return () => {};
  const startFieldName =
    String(startEl.getAttribute("name") || "").trim() ||
    String(cfg.startDate || "").replace(/^#/, "").trim() ||
    "startDate";
  const readStartYmd = () => {
    const byName = readFormDateIso(root, startFieldName);
    if (byName) return normalizePortalDateYmd(byName);
    const vis =
      queryPortalDateField(root, cfg.startDate) ||
      queryPortalDateField(root, startFieldName) ||
      startEl;
    const iso =
      window.AntaresValidation?.portalDateInputValueIso?.(vis) || String(vis?.value || "").trim();
    return normalizePortalDateYmd(iso);
  };
  const vigenteFieldName =
    vigenteEl && String(vigenteEl.getAttribute("name") || "").trim()
      ? String(vigenteEl.getAttribute("name") || "").trim()
      : "contractVigenteStartDate";
  const readPlazoStartYmd = () => {
    if (vigenteEl) {
      const byName = readFormDateIso(root, vigenteFieldName);
      if (byName) return normalizePortalDateYmd(byName);
      const vis =
        queryPortalDateField(root, cfg.contractVigenteStartDate) ||
        queryPortalDateField(root, vigenteFieldName) ||
        vigenteEl;
      const iso =
        window.AntaresValidation?.portalDateInputValueIso?.(vis) ||
        String(vis?.value || "").trim();
      const vigente = normalizePortalDateYmd(iso);
      if (vigente) return vigente;
    }
    return readStartYmd();
  };
  const writeEndYmd = (endYmd) => {
    const ymd = normalizePortalDateYmd(endYmd);
    if (!ymd) {
      clearFormDateInput(endEl);
      return;
    }
    setFormDateByName(root, "contractEndDate", ymd);
    const endVis = queryPortalDateField(root, "contractEndDate") || endEl;
    window.AntaresValidation?.portalDateInputSetIso?.(endVis, ymd);
  };
  const sync = () => {
    const contractType = String(contractSel.value || "").trim();
    const fixed = isFixedTermContractType(contractType);
    setContractDurationBranchVisible(wrap, fixed);
    if (vigenteWrap) setContractDurationBranchVisible(vigenteWrap, fixed);
    if (!fixed) {
      if (vigenteEl) clearFormDateInput(vigenteEl);
      clearFormDateInput(endEl);
      if (hintEl) hintEl.textContent = "";
      return;
    }
    if (amtEl && !String(amtEl.value || "").trim()) amtEl.value = "1";
    if (unitSel && String(unitSel.value || "").trim().toLowerCase() !== "anios") {
      unitSel.value = "anios";
      unitSel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const start = readPlazoStartYmd();
    const endYmd = resolveEmployeeContractEndDateYmd(contractType, start, {
      contractDurationUnit: unitSel?.value,
      contractDurationAmount: amtEl?.value,
      honorExplicitContractEndDate: false
    });
    writeEndYmd(endYmd);
    if (hintEl) {
      const notice = endYmd ? addDaysToYmd(endYmd, -30) : "";
      hintEl.textContent = endYmd
        ? `Plazo legal sugerido: 1 año (hasta ${fmtDateOr(endYmd)}). Si no renovará, avise al trabajador antes del ${fmtDateOr(notice)}.`
        : "Indique la fecha de inicio del contrato vigente (o de ingreso) para calcular la fecha fin.";
    }
  };
  const scheduleSync = () => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(sync);
    else sync();
  };
  contractSel.addEventListener("change", sync);
  startEl.addEventListener("change", scheduleSync);
  startEl.addEventListener("input", scheduleSync);
  startEl.addEventListener("blur", scheduleSync);
  const hiddenStart = root.querySelector(
    'input[type="hidden"][name="startDate"][data-portal-date-iso="1"]'
  );
  if (hiddenStart) {
    hiddenStart.addEventListener("change", scheduleSync);
    hiddenStart.addEventListener("input", scheduleSync);
  }
  if (vigenteEl) {
    vigenteEl.addEventListener("change", scheduleSync);
    vigenteEl.addEventListener("input", scheduleSync);
    vigenteEl.addEventListener("blur", scheduleSync);
    const hiddenVigente = root.querySelector(
      `input[type="hidden"][name="${vigenteFieldName}"][data-portal-date-iso="1"]`
    );
    if (hiddenVigente) {
      hiddenVigente.addEventListener("change", scheduleSync);
      hiddenVigente.addEventListener("input", scheduleSync);
    }
  }
  if (unitSel && unitSel.dataset.fixedTermEndWired !== "1") {
    unitSel.dataset.fixedTermEndWired = "1";
    unitSel.addEventListener("change", sync);
  }
  if (amtEl && amtEl.dataset.fixedTermEndWired !== "1") {
    amtEl.dataset.fixedTermEndWired = "1";
    amtEl.addEventListener("input", sync);
    amtEl.addEventListener("change", sync);
  }
  return sync;
}

/** Oculta ramas del bloque de plazo sin dejar “cajas” vacías del grid de labels. */
function setContractDurationBranchVisible(el, show) {
  if (!el) return;
  el.classList.toggle("hidden", !show);
  el.toggleAttribute("hidden", !show);
  el.setAttribute("aria-hidden", show ? "false" : "true");
}

/** Muestra cantidad u “otro” según la unidad de duración (solo cuando aplica plazo). */
function wireContractDurationBranch({ unitSel, qtyWrap, otherWrap, amtEl, otherEl }) {
  if (!unitSel || !qtyWrap || !otherWrap) return () => {};
  const sync = () => {
    const u = String(unitSel.value || "").trim().toLowerCase();
    const showQty = u === "meses" || u === "anios";
    const showOtro = u === "otro";
    setContractDurationBranchVisible(qtyWrap, showQty);
    setContractDurationBranchVisible(otherWrap, showOtro);
    if (amtEl) {
      if (showQty) amtEl.setAttribute("required", "required");
      else {
        amtEl.removeAttribute("required");
        amtEl.value = "";
      }
    }
    if (otherEl) {
      if (showOtro) otherEl.setAttribute("required", "required");
      else {
        otherEl.removeAttribute("required");
        otherEl.value = "";
      }
    }
  };
  if (unitSel.dataset.contractDurBranchWired !== "1") {
    unitSel.dataset.contractDurBranchWired = "1";
    unitSel.addEventListener("change", sync);
  }
  return sync;
}

/**
 * Muestra u oculta el bloque de duración según tipo de contrato; limpia campos si no aplica.
 * @returns {() => void} función `sync` para llamar tras cambiar cargo (tipo contrato por defecto).
 */
function setupContractDurationPlazoVisibility(root, cfg) {
  const contractSel = root.querySelector(cfg.contractSelect);
  const block = root.querySelector(cfg.block);
  const unitSel = root.querySelector(cfg.unit);
  const qtyWrap = root.querySelector(cfg.qtyWrap);
  const otherWrap = root.querySelector(cfg.otherWrap);
  const amtEl = root.querySelector(cfg.amount);
  const otherEl = root.querySelector(cfg.otherText);
  if (!contractSel || !block) return () => {};
  const syncBranch = wireContractDurationBranch({ unitSel, qtyWrap, otherWrap, amtEl, otherEl });
  const sync = () => {
    const ct = String(contractSel.value || "").trim();
    const need = contractTypeRequiresDurationPlazo(ct);
    setContractDurationBranchVisible(block, need);
    if (unitSel) {
      if (need) {
        unitSel.setAttribute("required", "required");
        if (!String(unitSel.value || "").trim()) {
          unitSel.value = isFixedTermContractType(ct) ? "anios" : "meses";
        }
      } else {
        unitSel.removeAttribute("required");
        unitSel.value = "";
        if (amtEl) {
          amtEl.removeAttribute("required");
          amtEl.value = "";
        }
        if (otherEl) {
          otherEl.removeAttribute("required");
          otherEl.value = "";
        }
      }
    }
    syncBranch();
  };
  contractSel.addEventListener("change", sync);
  return sync;
}

function bindHrFormWizard(form) {
  if (!form || form.dataset.hrWizardBound === "1") return;
  const wizard = form.querySelector("[data-hr-wizard]");
  if (!wizard) return;
  const steps = [...wizard.querySelectorAll(":scope > .hr-form-step")];
  if (steps.length < 2) return;
  form.dataset.hrWizardBound = "1";

  const prevBtn = wizard.querySelector("[data-hr-wizard-prev]");
  const nextBtn = wizard.querySelector("[data-hr-wizard-next]");
  const submitBtn = wizard.querySelector(".hr-form-wizard-submit");
  const progressEl = wizard.querySelector("[data-hr-wizard-progress]");
  const progressFill = wizard.querySelector("[data-hr-wizard-progress-fill]");
  const hintEl = wizard.querySelector("[data-hr-wizard-hint]");
  const dots = [...wizard.querySelectorAll("[data-hr-wizard-dot]")];

  let idx = Math.max(
    0,
    steps.findIndex((s) => s.classList.contains("is-active"))
  );

  const sync = () => {
    steps.forEach((s, i) => {
      const on = i === idx;
      s.classList.toggle("is-active", on);
      s.classList.toggle("hidden", !on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
    });
    dots.forEach((d, i) => {
      const on = i === idx;
      d.classList.toggle("is-active", on);
      d.classList.toggle("is-done", i < idx);
      if (on) d.setAttribute("aria-current", "step");
      else d.removeAttribute("aria-current");
    });
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) {
      nextBtn.classList.toggle("hidden", idx >= steps.length - 1);
      nextBtn.disabled = idx >= steps.length - 1;
    }
    const submitSyncButtons = [...wizard.querySelectorAll("[data-hr-wizard-submit-sync]")];
    if (submitBtn) {
      const wizKind = String(wizard.getAttribute("data-hr-wizard") || "");
      const contractEarly = wizKind === "contract";
      const last = idx >= steps.length - 1;
      const enableSubmit = contractEarly || last;
      submitBtn.disabled = !enableSubmit;
      submitBtn.setAttribute("aria-disabled", enableSubmit ? "false" : "true");
      submitSyncButtons.forEach((btn) => {
        btn.disabled = !enableSubmit;
        btn.setAttribute("aria-disabled", enableSubmit ? "false" : "true");
      });
    }
    const pct = steps.length ? ((idx + 1) / steps.length) * 100 : 0;
    if (progressEl) progressEl.textContent = `Paso ${idx + 1} de ${steps.length}`;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (hintEl) {
      const wizKind = String(wizard.getAttribute("data-hr-wizard") || "");
      if (wizKind === "contract") {
        hintEl.textContent = "Puede generar el contrato desde el paso que prefiera.";
      } else if (wizKind === "candidate" && idx === 0 && idx < steps.length - 1) {
        hintEl.textContent =
          "Si el documento ya existe en candidatos, verá el aviso al escribir y no podrá avanzar hasta corregirlo.";
      } else {
        hintEl.textContent =
          idx < steps.length - 1
            ? "Avance hasta el último paso para habilitar guardar."
            : wizKind === "employee"
              ? "Último paso: puede generar el contrato Word antes de guardar la ficha."
              : wizKind === "candidate"
                ? "Último paso: adjunte CV y confirme; el documento ya se validó en el paso 1."
                : "Último paso: revise y guarde.";
      }
    }
    window.AntaresValidation?.upgradePortalDateFields?.(form);
    window.AntaresValidation?.resyncPortalDateValuesInRoot?.(form);
  };

  prevBtn?.addEventListener("click", () => {
    if (idx > 0) {
      idx -= 1;
      sync();
    }
  });

  nextBtn?.addEventListener("click", async () => {
    if (typeof form.__antaresDupDocCheck === "function") {
      await form.__antaresDupDocCheck({ silent: false, forceServer: true });
    }
    const stepRes = hrWizardStepValid(steps[idx]);
    if (!stepRes.ok) {
      flashHrWizardDotError(wizard, idx);
      const stepName = hrWizardStepLabel(wizard, idx);
      const tail = stepRes.detail ? ` ${stepRes.detail}` : "";
      notify(`Revise «${stepName}».${tail ? ` ${tail}` : " Hay campos obligatorios o datos incorrectos."}`, "error");
      return;
    }
    if (idx < steps.length - 1) {
      idx += 1;
      sync();
    }
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", async () => {
      const raw = dot.dataset.hrWizardDot;
      const targetIdx = Number.parseInt(String(raw ?? ""), 10);
      if (!Number.isFinite(targetIdx) || targetIdx < 0 || targetIdx >= steps.length) return;
      if (targetIdx === idx) return;
      if (targetIdx > idx) {
        if (typeof form.__antaresDupDocCheck === "function") {
          await form.__antaresDupDocCheck({ silent: false, forceServer: true });
        }
        for (let i = idx; i < targetIdx; i++) {
          const hopRes = hrWizardStepValid(steps[i]);
          if (!hopRes.ok) {
            idx = i;
            sync();
            flashHrWizardDotError(wizard, i);
            const nm = hrWizardStepLabel(wizard, i);
            const tail = hopRes.detail ? ` ${hopRes.detail}` : "";
            notify(`Complete «${nm}» antes de avanzar.${tail ? ` ${tail}` : ""}`, "error");
            return;
          }
        }
      }
      idx = targetIdx;
      sync();
    });
  });

  form.addEventListener(
    "submit",
    async (ev) => {
      if (typeof form.__antaresDupDocCheck === "function") {
        const dupOk = await form.__antaresDupDocCheck({ silent: false, forceServer: true });
        if (!dupOk) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          notify("Ya existe un colaborador con ese documento. Revise el número o la ficha existente.", "error");
          return;
        }
      }
      for (let i = 0; i < steps.length; i++) {
        const subRes = hrWizardStepValid(steps[i]);
        if (!subRes.ok) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          idx = i;
          sync();
          flashHrWizardDotError(wizard, i);
          const nm = hrWizardStepLabel(wizard, i);
          const tail = subRes.detail ? ` ${subRes.detail}` : "";
          notify(`Revise «${nm}».${tail ? ` ${tail}` : " Hay campos por completar o corregir."}`, "error");
          return;
        }
      }
    },
    true
  );

  sync();
}

function createCollapsibleCard(panelId, iconKey, title, subtitle, bodyHtml, expandLabel = "Crear nuevo") {
  const expanded = isCreatePanelExpanded(panelId);
  const cardBody = `${renderModulePanelToolbar({ expanded, toggleAction: "toggle-create-panel", panelId, expandLabel, showWhen: "collapsed" })}
  <div class="${expanded ? "" : "hidden"}" data-create-panel="${escapeAttr(panelId)}">
    ${bodyHtml}
  </div>`;
  const extraClass = expanded ? "p-card--expanded" : "p-card--collapsed";
  return pcardWrap(iconKey, title, subtitle, cardBody, extraClass);
}

function createCollapsibleProCard(panelId, iconKey, title, subtitle, bodyHtml, extraClass = "", expandLabel = "Abrir formulario") {
  const expanded = isCreatePanelExpanded(panelId);
  const cardBody = `${renderModulePanelToolbar({ expanded, toggleAction: "toggle-create-panel", panelId, expandLabel, showWhen: "collapsed" })}
  <div class="${expanded ? "" : "hidden"}" data-create-panel="${escapeAttr(panelId)}">
    ${bodyHtml}
  </div>`;
  const classes = [expanded ? "p-card--expanded" : "p-card--collapsed", String(extraClass || "").trim()].filter(Boolean).join(" ");
  return pcardWrapPro(iconKey, title, subtitle, cardBody, classes);
}

function notify(message, type = "info", durationMs = 3200) {
  let box = document.getElementById("toast-container");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast-container";
    box.className = "toast-container";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  box.style.position = "fixed";
  box.style.zIndex = "2147483647";
  const item = document.createElement("div");
  item.className = `toast toast-${type}`;
  item.textContent = message;
  box.appendChild(item);
  requestAnimationFrame(() => item.classList.add("show"));
  const ms = Number(durationMs);
  const hideAfter = Number.isFinite(ms) && ms > 0 ? ms : 3200;
  setTimeout(() => {
    item.classList.remove("show");
    setTimeout(() => item.remove(), 240);
  }, hideAfter);
}

/** Si la bandeja guardó una notificación para quien ya vio el toast de éxito en pantalla, no repetir en el poll. */
function suppressSelfInboxPollToastIfRecipientIsCurrentUser(recipientUserId) {
  const self = currentUser();
  if (!self || recipientUserId === undefined || recipientUserId === null || recipientUserId === "") return;
  if (String(recipientUserId) !== String(self.id)) return;
  state.portalSuppressSelfPollToastUntil = Date.now() + 5200;
}

/** Deshabilita el botón principal de envío y opcionalmente botones auxiliares del formulario. */
function lockFormSubmitUi(formEl, opts = {}) {
  const submitBtn =
    opts.submitButton ??
    formEl.querySelector?.("button[type='submit']") ??
    formEl.querySelector?.("[data-step-submit]");
  if (!submitBtn) return;
  if (!submitBtn.dataset.submitOrigHtml) submitBtn.dataset.submitOrigHtml = submitBtn.innerHTML;
  const labelEl = submitBtn.querySelector(".auth-submit-label");
  if (labelEl && !labelEl.dataset.submitOrigText) labelEl.dataset.submitOrigText = labelEl.textContent || "";
  submitBtn.disabled = true;
  submitBtn.setAttribute("aria-busy", "true");
  if (opts.busyText) {
    if (labelEl) labelEl.textContent = opts.busyText;
    else if (!opts.busyHtml) submitBtn.textContent = opts.busyText;
  }
  if (opts.busyHtml) submitBtn.innerHTML = opts.busyHtml;
  if (opts.loadingClass) submitBtn.classList.add(opts.loadingClass);
  (opts.lockExtraButtons || []).forEach((btn) => {
    if (!btn) return;
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
  });
}

/** Restaura el estado del botón de envío tras `lockFormSubmitUi`. */
function releaseFormSubmitUi(formEl, opts = {}) {
  if (formEl) formEl.dataset.submitting = "0";
  const submitBtn =
    opts.submitButton ??
    formEl?.querySelector?.("button[type='submit']") ??
    formEl?.querySelector?.("[data-step-submit]");
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.removeAttribute("aria-busy");
    if (submitBtn.dataset.submitOrigHtml) submitBtn.innerHTML = submitBtn.dataset.submitOrigHtml;
    const labelEl = submitBtn.querySelector(".auth-submit-label");
    if (labelEl?.dataset.submitOrigText) labelEl.textContent = labelEl.dataset.submitOrigText;
    if (opts.loadingClass) submitBtn.classList.remove(opts.loadingClass);
  }
  (opts.lockExtraButtons || []).forEach((btn) => {
    if (!btn) return;
    btn.disabled = false;
    btn.removeAttribute("aria-busy");
  });
}

/**
 * Ejecuta una acción async bloqueando un botón (evita doble clic y saturación del servidor).
 * @param {HTMLElement} btn
 * @param {() => void|Promise<void>} fn
 * @param {{ busyText?: string, lockExtraButtons?: HTMLElement[] }} [opts]
 */
async function runWithBusyButton(btn, fn, opts = {}) {
  if (!btn || typeof fn !== "function" || btn.dataset.busy === "1") return;
  btn.dataset.busy = "1";
  lockFormSubmitUi(null, { ...opts, submitButton: btn });
  try {
    await fn();
  } finally {
    releaseFormSubmitUi(null, { ...opts, submitButton: btn });
    btn.dataset.busy = "0";
  }
}

/**
 * Evita doble envío en formularios async: bloquea el submit hasta que termina el handler.
 * @param {HTMLFormElement} formEl
 * @param {(event: SubmitEvent) => void|boolean|Promise<void|boolean>} onSubmit
 * @param {{ busyText?: string, busyHtml?: string, loadingClass?: string, submitButton?: HTMLElement, lockExtraButtons?: HTMLElement[], wireKey?: string, onFinally?: (formEl: HTMLFormElement) => void }} [opts]
 */
function wireFormSubmitGuard(formEl, onSubmit, opts = {}) {
  if (!formEl || typeof onSubmit !== "function") return;
  const wireKey = opts.wireKey || "submitGuardWired";
  if (formEl.dataset[wireKey] === "1") return;
  formEl.dataset[wireKey] = "1";
  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (formEl.dataset.submitting === "1") return;
    if (!prepareCreationFormForSubmit(formEl)) return;
    formEl.dataset.submitting = "1";
    lockFormSubmitUi(formEl, opts);
    try {
      await onSubmit(event);
    } catch (err) {
      releaseFormSubmitUi(formEl, opts);
      throw err;
    } finally {
      releaseFormSubmitUi(formEl, opts);
      opts.onFinally?.(formEl);
    }
  });
}

/** Mensajes en {@link window.AntaresFeedback} (modules/core/feedback-messages.js). */
function userMessage(key, ...args) {
  const M = window.AntaresFeedback;
  if (!M) return String(key);
  const v = M[key];
  if (typeof v === "function") return v(...args);
  return v != null ? v : String(key);
}

/**
 * Atributos estándar Antares para validación en vivo / al enviar en modales CRUD (`openEditModal`).
 */
function editModalAntaresAttrString(f) {
  const a = f?.antares;
  if (!a || typeof a !== "object") return "";
  let s = "";
  if (a.restrict) s += ` data-antares-restrict="${escapeAttr(String(a.restrict))}"`;
  if (a.blur) s += ` data-antares-validate-blur="${escapeAttr(String(a.blur))}"`;
  if (a.field) s += ` data-antares-field="${escapeAttr(String(a.field))}"`;
  if (a.max != null && String(a.max).trim() !== "") s += ` data-antares-max="${escapeAttr(String(a.max))}"`;
  if (a.skipValidate) s += ` data-antares-skip-validate="1"`;
  return s;
}

/**
 * Fila de campo para {@link openEditModal} (sin agrupación por sección).
 */
function editModalLabelClassAttr(f) {
  const parts = [];
  if (f.full) parts.push("full");
  const w = String(f.wrapperClass || "").trim();
  if (w) parts.push(w);
  if (!parts.length) return "";
  return ` class="${escapeAttr(parts.join(" "))}"`;
}

function renderEditModalFieldRow(f, fieldIdx) {
  if (f.type === "section") return "";
  if (f.type === "select") {
    const options = (f.options || [])
      .map((opt) => {
        const v = escapeAttr(String(opt.value ?? ""));
        const sel = editModalSelectOptionSelected(opt, f.value) ? "selected" : "";
        const dis = opt.disabled ? "disabled" : "";
        return `<option value="${v}" ${sel} ${dis}>${escapeHtml(opt.label)}</option>`;
      })
      .join("");
    const labelInner = f.labelHtml ? f.labelHtml : escapeHtml(f.label);
    const labelWrap = f.labelHtml
      ? `<span class="modal-field-label modal-field-label--html">${labelInner}</span>`
      : `<span>${labelInner}</span>`;
    const hiddenAttr = f.hidden ? " hidden" : "";
    const searchableAttr = f.searchable
      ? ` class="searchable-select-native" data-searchable-select="1" data-searchable-placeholder="${escapeAttr(String(f.searchablePlaceholder || "Escriba placa, nombre o documento…"))}"`
      : "";
    return `<label${editModalLabelClassAttr(f)}${hiddenAttr}>${labelWrap}<select name="${escapeAttr(f.name)}"${searchableAttr} ${f.required ? "required" : ""}${editModalAntaresAttrString(f)}>${options}</select></label>`;
  }
  if (f.type === "hidden") {
    return `<input type="hidden" name="${escapeAttr(f.name)}" value="${escapeAttr(String(f.value ?? ""))}" />`;
  }
  if (f.type === "textarea") {
    return `<label${editModalLabelClassAttr({ ...f, full: true })}><span>${escapeHtml(f.label)}</span><textarea name="${escapeAttr(f.name)}" rows="${f.rows || 3}" ${f.required ? "required" : ""}${editModalAntaresAttrString(f)}>${escapeHtml(f.value ?? "")}</textarea></label>`;
  }
  if (f.type === "file") {
    return `<label${editModalLabelClassAttr({ ...f, full: true })}><span>${escapeHtml(f.label)}</span><input type="file" name="${escapeAttr(f.name)}" ${f.accept ? `accept="${escapeAttr(f.accept)}"` : ""} ${f.multiple ? "multiple" : ""} ${f.required ? "required" : ""} /></label>`;
  }
  if (f.type === "custom") {
    /**
     * Bloque HTML libre dentro del modal (p.ej. checklist de permisos editables).
     * El consumidor wirea sus interacciones con `afterMount(form)` y/o lee los inputs en `onSubmit`.
     */
    const labelHtml = f.label ? `<span class="modal-edit-section-title">${escapeHtml(f.label)}</span>` : "";
    return `<div class="full modal-edit-custom-slot"${f.id ? ` id="${escapeAttr(f.id)}"` : ""}>${labelHtml}${f.html || ""}</div>`;
  }
  const inputType = String(f.type || "text").replace(/[^a-z0-9\-]/gi, "") || "text";
  const minAttr = f.min != null ? ` min="${escapeAttr(String(f.min))}"` : "";
  const maxAttr = f.max != null ? ` max="${escapeAttr(String(f.max))}"` : "";
  const stepAttr = f.step != null ? ` step="${escapeAttr(String(f.step))}"` : "";
  const langAttr = f.lang ? ` lang="${escapeAttr(String(f.lang))}"` : "";
  const labelInner = f.labelHtml ? f.labelHtml : escapeHtml(f.label);
  const labelWrap = f.labelHtml
    ? `<span class="modal-field-label modal-field-label--html">${labelInner}</span>`
    : `<span>${labelInner}</span>`;
  const hiddenAttr = f.hidden ? " hidden" : "";
  let inputValue = String(f.value ?? "");
  if (inputType === "date") {
    inputValue = normalizePortalDateYmd(f.value) || inputValue;
  } else if (inputType === "datetime-local") {
    const raw = String(f.value ?? "").trim();
    inputValue =
      raw.length >= 16 && raw.includes("T") ? raw.slice(0, 16) : String(toInputDate(raw) || "").slice(0, 16) || inputValue;
  } else if (inputType === "time") {
    const raw = String(f.value ?? "").trim();
    inputValue = raw.length >= 5 ? raw.slice(0, 5) : raw;
  }
  return `<label${editModalLabelClassAttr(f)}${hiddenAttr}>${labelWrap}<input type="${inputType}" name="${escapeAttr(f.name)}" value="${escapeAttr(inputValue)}"${minAttr}${maxAttr}${stepAttr}${langAttr} ${f.required ? "required" : ""}${editModalAntaresAttrString(f)} /></label>`;
}

/**
 * Agrupa campos por `type: "section"` y genera el mismo patrón visual que el
 * editor de solicitudes (`fieldset.form-section` dentro de `p-form-colored`).
 */
function buildOpenEditModalFieldsHtml(fields, fallbackSectionTitle = "Información") {
  if (!fields.length) return "";
  const toneCycle = ["blue", "violet", "emerald", "amber", "cyan", "rose"];
  let toneIdx = 0;
  const firstSectionAt = fields.findIndex((x) => x.type === "section");
  if (firstSectionAt === -1) {
    const inner = fields.map((f, i) => renderEditModalFieldRow(f, i)).join("");
    if (fields.every((x) => x.type === "hidden")) return inner;
    return `<fieldset class="form-section form-section-blue full" role="group">
      <legend>${escapeHtml(fallbackSectionTitle)}</legend>
      <div class="form-section-grid">${inner}</div>
    </fieldset>`;
  }
  let html = "";
  if (firstSectionAt > 0) {
    const leading = fields.slice(0, firstSectionAt);
    const leadH = leading.filter((x) => x.type === "hidden");
    const leadV = leading.filter((x) => x.type !== "hidden");
    html += leadH.map((f, i) => renderEditModalFieldRow(f, i)).join("");
    if (leadV.length) {
      html += `<fieldset class="form-section form-section-blue full" role="group">
        <legend>${escapeHtml(fallbackSectionTitle)}</legend>
        <div class="form-section-grid">${leadV.map((f, i) => renderEditModalFieldRow(f, i)).join("")}</div>
      </fieldset>`;
    }
  }
  const rest = firstSectionAt > 0 ? fields.slice(firstSectionAt) : fields;
  let i = 0;
  while (i < rest.length) {
    const head = rest[i];
    if (head.type !== "section") {
      html += renderEditModalFieldRow(head, i);
      i++;
      continue;
    }
    const section = head;
    i++;
    const chunk = [];
    while (i < rest.length && rest[i].type !== "section") {
      chunk.push(rest[i]);
      i++;
    }
    const sid = escapeAttr(String(section.id || `edit-section-${toneIdx}`));
    const explicitTone =
      section.sectionTone && toneCycle.includes(String(section.sectionTone)) ? String(section.sectionTone) : null;
    const tone = explicitTone || toneCycle[toneIdx % toneCycle.length];
    if (!explicitTone) toneIdx += 1;
    const hint = section.hint ? `<p class="muted form-section-hint">${escapeHtml(section.hint)}</p>` : "";
    const gridExtra = section.gridClass ? ` ${escapeAttr(String(section.gridClass))}` : "";
    const gridInner = chunk.map((f, j) => renderEditModalFieldRow(f, j)).join("");
    html += `<fieldset class="form-section form-section-${tone} full" role="group" aria-labelledby="${sid}-lg">
      <legend id="${sid}-lg">${escapeHtml(section.title || "Sección")}</legend>
      ${hint}
      <div class="form-section-grid${gridExtra}">${gridInner}</div>
    </fieldset>`;
  }
  return html;
}

function openEditModal({
  title,
  subtitle = "",
  introHtml = "",
  fields = [],
  submitText = "Guardar",
  onSubmit,
  afterMount,
  extraModalCardClass = ""
}) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const card = modal.querySelector(".modal-card");
  if (card) {
    card.className = `modal-card modal-card-edit${extraModalCardClass ? ` ${extraModalCardClass}` : ""}`;
  }
  const content = modal.querySelector("#crud-modal-content");
  const fieldsHtml = buildOpenEditModalFieldsHtml(fields);

  content.innerHTML = `
    ${renderModalHead(title, { subtitle })}
    ${introHtml || ""}
    <form id="crud-form" class="p-form p-form-colored modal-edit-form">
      ${fieldsHtml}
      ${renderModalFooterActions({
        className: "full",
        primaryHtml: `<button type="submit" class="btn btn-primary">${IC.save} ${escapeHtml(submitText)}</button>`
      })}
    </form>
  `;

  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  wireModalDismiss(content, close);
  const formEl = content.querySelector("#crud-form");
  if (typeof afterMount === "function") {
    try {
      afterMount(formEl);
    } catch (err) {
      devWarn("openEditModal afterMount", err);
    }
  }
  window.AntaresValidation?.decorateFormFields?.(formEl);
  wireEditModalFieldValues(formEl, fields);
  window.AntaresValidation?.resyncPortalDateValuesInRoot?.(formEl);
  enhanceTripAssignmentSelects(formEl);
  scrollIntoViewSmoothBlockStart(formEl);
  scrollOpenCrudModalIntoView();
  wireFormSubmitGuard(
    formEl,
    async (event) => {
      const currentForm = event.currentTarget;
      const V = window.AntaresValidation;
      if (V && typeof V.validateDomForm === "function") {
        const domVal = V.validateDomForm(currentForm);
        if (!domVal.ok) {
          domVal.firstInvalid?.focus?.();
          notify(userMessage("validationStep"), "error");
          return false;
        }
        V.applyDomFormPatch?.(currentForm, domVal.patch);
      }
      const payload = readFormEntriesNormalized(currentForm);
      const fileInputs = [...currentForm.querySelectorAll("input[type='file']")];
      fileInputs.forEach((input) => {
        if (input.multiple) {
          payload[input.name] = [...input.files].map((file) => file.name).join(", ");
        } else if (input.files?.[0]) {
          payload[input.name] = input.files[0].name;
        }
      });
      let result;
      try {
        result = onSubmit?.(payload, currentForm);
        if (result && typeof result.then === "function") {
          result = await result;
        }
      } catch (err) {
        devWarn("openEditModal onSubmit", err);
        return false;
      }
      if (result === false) return false;
      close();
    },
    { busyText: "Guardando…", wireKey: "crudSubmitGuardWired" }
  );
}

function ensureCrudModalElement() {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  return modal;
}

/**
 * Modal de confirmación (Promise). Resuelve `true` al confirmar, `false` al cancelar o cerrar.
 */
function openConfirmModalAsync({
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmBtnClass = "btn-primary",
  cancelBtnClass = "",
  confirmIcon = "check",
  cardClass = "modal-card-edit",
  onConfirm
}) {
  return new Promise((resolve) => {
    const modal = ensureCrudModalElement();
    const card = modal.querySelector(".modal-card");
    if (card) card.className = `modal-card ${cardClass}`.trim();
    const content = modal.querySelector("#crud-modal-content");
    const safeConfirmClass = String(confirmBtnClass || "btn-primary").trim() || "btn-primary";
    const confirmIconHtml = IC[String(confirmIcon || "check")] || IC.check;
    const safeCancelBtnClass = String(cancelBtnClass || "").trim();
    content.innerHTML = `
    ${renderModalHead(title)}
    <p class="modal-body-lead">${escapeHtml(message)}</p>
    ${renderModalFooterActions({
      cancelLabel: cancelText,
      cancelBtnClass: safeCancelBtnClass,
      primaryHtml: `<button type="button" id="crud-confirm" class="btn ${escapeAttr(safeConfirmClass)}">${confirmIconHtml} ${escapeHtml(confirmText)}</button>`
    })}
  `;
    let settled = false;
    const finish = (confirmed) => {
      if (settled) return;
      settled = true;
      modal.classList.add("hidden");
      resolve(Boolean(confirmed));
    };
    modal.classList.remove("hidden");
    wireModalDismiss(content, () => finish(false));

    const confirmBtn = content.querySelector("#crud-confirm");
    let confirmConsumed = false;
    confirmBtn?.addEventListener(
      "click",
      async () => {
        if (confirmConsumed) return;
        confirmConsumed = true;
        confirmBtn.disabled = true;
        confirmBtn.setAttribute("aria-busy", "true");
        try {
          let out = onConfirm?.();
          if (out && typeof out.then === "function") {
            await out;
          }
          finish(true);
        } catch (_e) {
          try {
            const msg =
              _e && typeof _e === "object" && _e.message
                ? String(_e.message)
                : typeof _e === "string"
                  ? _e
                  : typeof userMessage === "function"
                    ? userMessage("genericError")
                    : "Error";
            if (msg && typeof notify === "function") notify(msg, "error");
          } catch (_) {}
          confirmConsumed = false;
          confirmBtn.disabled = false;
          confirmBtn.removeAttribute("aria-busy");
        }
      },
      { once: true }
    );
    scrollOpenCrudModalIntoView();
  });
}

function openConfirmModal({ title, message, confirmText = "Confirmar", onConfirm }) {
  void openConfirmModalAsync({ title, message, confirmText, onConfirm });
}

/**
 * Confirmación con campo obligatorio de motivo (eliminaciones de transporte con auditoría).
 * @param {{ title: string, message: string, confirmText?: string, onConfirm: (motivo: string) => void|Promise<void> }} opts
 */
function openConfirmReasonModal({ title, message, confirmText = "Confirmar", onConfirm }) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const card = modal.querySelector(".modal-card");
  if (card) card.className = "modal-card modal-card-edit";
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    ${renderModalHead(title)}
    <p class="modal-body-lead">${escapeHtml(message)}</p>
    <label class="full modal-reason-field">
      <span class="muted">Motivo (obligatorio, mínimo 3 caracteres)</span>
      <textarea id="crud-delete-reason" rows="4" class="full" required></textarea>
    </label>
    ${renderModalFooterActions({
      primaryHtml: `<button type="button" id="crud-confirm" class="btn btn-primary">${IC.check} ${escapeHtml(confirmText)}</button>`
    })}
  `;
  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  wireModalDismiss(content, close);
  const ta = content.querySelector("#crud-delete-reason");
  const confirmBtn = content.querySelector("#crud-confirm");
  let confirmConsumed = false;
  confirmBtn.addEventListener("click", async () => {
    if (confirmConsumed) return;
    const motivo = String(ta?.value || "").trim();
    if (motivo.length < 3) {
      notify("Indique el motivo (mínimo 3 caracteres).", "error");
      ta?.focus();
      return;
    }
    confirmConsumed = true;
    confirmBtn.disabled = true;
    confirmBtn.setAttribute("aria-busy", "true");
    try {
      let out = onConfirm?.(motivo);
      if (out && typeof out.then === "function") {
        await out;
      }
    } catch (_e) {
      try {
        const msg =
          _e && typeof _e === "object" && _e.message
            ? String(_e.message)
            : typeof _e === "string"
              ? _e
              : typeof userMessage === "function"
                ? userMessage("genericError")
                : "Error";
        if (msg && typeof notify === "function") notify(msg, "error");
      } catch (_) {}
    } finally {
      close();
      confirmBtn.disabled = false;
      confirmBtn.removeAttribute("aria-busy");
    }
  });
  scrollOpenCrudModalIntoView();
  setTimeout(() => {
    try {
      ta?.focus();
    } catch (_) {}
  }, 50);
}

function openInfoModal({
  title,
  subtitle = "",
  subtitleHtml = "",
  bodyHtml = "",
  wide = false,
  extraModalCardClass = "",
  secondaryActionsHtml = "",
  afterMount
}) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const card = modal.querySelector(".modal-card");
  if (card) {
    const extra = [wide ? "modal-card-edit--wide-info" : "", extraModalCardClass].filter(Boolean).join(" ");
    card.className = `modal-card modal-card-edit${extra ? ` ${extra}` : ""}`;
  }
  const content = modal.querySelector("#crud-modal-content");
  const subtitleBlock = subtitleHtml
    ? subtitleHtml
    : subtitle
      ? `<p class="muted modal-head__subtitle">${escapeHtml(subtitle)}</p>`
      : "";
  const isPortalDetail = String(extraModalCardClass || "").includes("modal-card--portal-detail");
  const infoBodyClass = [
    "modal-info-body",
    wide ? "modal-info-body--profile" : "",
    isPortalDetail ? "modal-info-body--portal-detail" : ""
  ]
    .filter(Boolean)
    .join(" ");
  content.innerHTML = `
    ${renderModalHead(title, { subtitleHtml: subtitleBlock })}
    <div class="${escapeAttr(infoBodyClass)}">${bodyHtml}</div>
    ${renderModalFooterActions({
      showCancel: false,
      secondaryHtml: secondaryActionsHtml,
      primaryHtml: `<button type="button" id="crud-ok" class="btn btn-primary">${IC.x} Cerrar</button>`
    })}
  `;
  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  wireModalDismiss(content, close, { closeIds: ["crud-close"], okId: "crud-ok" });
  if (typeof afterMount === "function") {
    try {
      afterMount(content);
    } catch (err) {
      devWarn("openInfoModal afterMount", err);
    }
  }
  scrollOpenCrudModalIntoView();
}

/**
 * Modal de ficha de viaje. Muestra detalles operativos del viaje y, según
 * permisos, expone:
 *   - "Ver solicitud" → abre el detalle de la solicitud asociada.
 *   - "Editar viaje"  → abre el formulario de edición (solo admin).
 */
function openAssignedTripInfoModal(req) {
  if (!req?.trip) return;
  const canEditTrip = canAdminEditTrip(req);
  const secondaryActions = [
    `<button type="button" class="btn btn-outline" data-trip-info-action="view-request">${IC.eye} Ver solicitud</button>`,
    canEditTrip ? `<button type="button" class="btn btn-action" data-trip-info-action="edit-trip">${IC.edit} Editar viaje</button>` : ""
  ].filter(Boolean).join("");
  openInfoModal({
    title: `Viaje ${req.trip.tripNumber}`,
    subtitleHtml: prettyStatus(req.status, "trip"),
    wide: true,
    secondaryActionsHtml: secondaryActions,
    afterMount: (contentEl) => {
      contentEl
        .querySelector("[data-trip-info-action='view-request']")
        ?.addEventListener("click", () => {
          /**
           * Salta del detalle del viaje al detalle de la solicitud. Se hace
           * fire-and-forget vía el handler global de `data-action=detail`.
           * Como `data-action=detail` está en cards del módulo y aquí el
           * botón es modal, abrimos el modal de info directamente.
           */
          openRequestDetailModal(req);
        });
      contentEl
        .querySelector("[data-trip-info-action='edit-trip']")
        ?.addEventListener("click", () => {
          openEditTripModal(req);
        });
    },
    bodyHtml: `
          <div class="dash-grid">
            <div><strong>Solicitud:</strong> ${escapeHtml(String(req.requestNumber || req.id))}</div>
            <div><strong>Cliente:</strong> ${escapeHtml(String(req.clientName || "-"))}</div>
            <div class="full"><strong>Ruta:</strong> ${escapeHtml(formatRoute(req))}</div>
            <div><strong>Carga:</strong> ${escapeHtml(String(req.cargoDescription || "-"))} · ${requestTruckRequirementSummaryHtml(req)}</div>
            <div><strong>Valor viaje:</strong> $${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}</div>
            ${parseNum(req.insuredValue || 0) > 0 ? `<div><strong>Valor asegurado:</strong> $${parseNum(req.insuredValue).toLocaleString("es-CO")}</div>` : ""}
            ${parseNum(req.distanceKm || 0) > 0 ? `<div><strong>Distancia estimada:</strong> ${parseNum(req.distanceKm).toLocaleString("es-CO")} km</div>` : ""}
            <div><strong>Camión:</strong> ${escapeHtml(String(req.trip.vehiclePlate || ""))} (${escapeHtml(String(req.trip.vehicleType || "-"))})</div>
            <div><strong>Conductor:</strong> ${escapeHtml(String(req.trip.driverName || ""))} · ${escapeHtml(String(req.trip.driverPhone || "-"))}</div>
            <div><strong>Asignado por:</strong> ${escapeHtml(String(req.trip.assignedBy || req.approvedBy || "-"))}</div>
            <div><strong>Fecha asignación:</strong> ${fmtDate(req.trip.assignedAt || req.approvedAt || req.createdAt)}</div>
            <div><strong>Creado</strong> ${escapeHtml(fmtDateOr(req.trip.createdAt || req.createdAt, "—"))}</div>
            <div><strong>Última actualización</strong> ${escapeHtml(fmtDateOr(req.trip.updatedAt || req.trip.createdAt || req.updatedAt, "—"))}</div>
            ${req.autoApproved ? `<div><strong>Aprobación:</strong> Automática</div>` : ""}
            <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
            <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
            ${req.closedAt ? `<div><strong>Cierre:</strong> ${fmtDate(req.closedAt)}</div>` : ""}
            ${req.trip.invoice ? `<div><strong>Factura:</strong> ${escapeHtml(String(req.trip.invoice.number))} · $${parseNum(req.trip.invoice.total).toLocaleString("es-CO")}</div>` : ""}
          </div>
          ${parseNum(req.standbyChargeTotal) > 0 ? `<p style="margin-top:0.6rem"><strong>Standby acumulado:</strong> $${parseNum(req.standbyChargeTotal).toLocaleString("es-CO")}</p>` : ""}
        `
  });
}

/**
 * Modal de detalle de solicitud (read-only) reutilizable desde la ficha
 * de viaje y desde otros lugares. Mantiene la misma estructura visual
 * que la del listado de solicitudes pero sin acciones de edición.
 */
function openRequestDetailModal(req) {
  if (!req) return;
  const company = typeof getCompanyById === "function" ? getCompanyById(req.clientCompanyId) : null;
  const clientLogoUrl =
    companyProfileLogoUrl(company) || String(req.clientCompanyLogoUrl || "").trim();
  const clientDisplayName = String(req.clientName || company?.name || "-").trim() || "-";
  const clientBlock =
    clientLogoUrl && !/^data:/i.test(clientLogoUrl)
      ? `<div class="solicitud-detail-client-row"><span class="request-company-logo request-company-logo--sm" role="img" aria-label="Logo de ${escapeAttr(clientDisplayName)}"><img src="${escapeAttr(clientLogoUrl)}" alt="" loading="lazy" /></span><span class="muted">${escapeHtml(clientDisplayName)}</span></div>`
      : `<span class="muted">${escapeHtml(clientDisplayName)}</span>`;
  const thermokingReq = requestRequiresTermoking(req);
  const obs = String(req.notes || req.observations || "").trim();
  const origAddr = String(req.originAddress || "").trim();
  const destAddr = String(req.destinationAddress || "").trim();
  const modoTransporte = escapeHtml(requestTransportModeFromRequest(req));
  const tripDetail = req.trip
    ? `<div class="dash-grid solicitud-trip-summary">
            <div class="full"><strong>Resumen del viaje asignado</strong></div>
            <div><strong>Código:</strong> ${escapeHtml(String(req.trip.tripNumber || ""))}</div>
            <div><strong>Camión:</strong> ${escapeHtml(String(req.trip.vehiclePlate || ""))} (${escapeHtml(String(req.trip.vehicleType || "-"))})</div>
            <div><strong>Conductor:</strong> ${escapeHtml(String(req.trip.driverName || ""))} · ${escapeHtml(String(req.trip.driverPhone || "-"))}</div>
            <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
            <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
            <div class="full solicitud-trip-summary-actions">
              <button type="button" class="btn btn-action" data-action="solicitud-trip-open">${IC.eye} Abrir detalle del viaje</button>
            </div>
          </div>`
    : `<p class="muted" style="margin:0.35rem 0 0">Aún no tiene viaje asignado.</p>`;
  openInfoModal({
    title: `Solicitud ${req.requestNumber || req.id}`,
    subtitleHtml: prettyStatus(req.status, "request"),
    wide: true,
    afterMount: req.trip
      ? (contentEl) => {
          contentEl.querySelector("[data-action='solicitud-trip-open']")?.addEventListener("click", () => {
            openAssignedTripInfoModal(req);
          });
        }
      : undefined,
    bodyHtml: `
      <section aria-label="Viaje asignado principal">
        <h3 class="solicitud-detail-heading">Viaje asignado</h3>
        ${tripDetail}
      </section>
      <hr style="border:0;border-top:1px solid var(--line);margin:1rem 0;" />
      <section class="solicitud-detail-section" aria-label="Datos de la solicitud">
        <h3 class="solicitud-detail-heading">Solicitud de transporte</h3>
        <div class="dash-grid">
          <div class="full"><strong>Cliente</strong><br />${clientBlock}</div>
          <div><strong>Modo de transporte</strong><br /><span class="muted">${modoTransporte}</span></div>
          <div><strong>Refrigeración Termoking</strong><br /><span class="muted">${thermokingReq ? "Sí, requerida" : "No"}</span></div>
          <div><strong>Ruta</strong><br /><span class="muted">${escapeHtml(formatRoute(req))}</span></div>
          ${origAddr ? `<div class="full"><strong>Origen (dirección)</strong><br /><span class="muted">${escapeHtml(origAddr)}</span></div>` : ""}
          ${destAddr ? `<div class="full"><strong>Destino (dirección)</strong><br /><span class="muted">${escapeHtml(destAddr)}</span></div>` : ""}
          <div><strong>Recogida programada</strong><br /><span class="muted">${fmtDate(req.pickupAt || `${req.pickupDate || ""}T${req.pickupTime || ""}`)}</span></div>
          <div><strong>Entrega estimada</strong><br /><span class="muted">${fmtDate(req.etaDelivery || `${req.deliveryDate || ""}T${req.deliveryTime || ""}`)}</span></div>
          <div><strong>Solicita</strong><br /><span class="muted">${escapeHtml(String(req.requestedByName || "-"))}</span></div>
          <div><strong>Contacto en sitio</strong><br /><span class="muted">${escapeHtml(String(req.siteContactName || req.contactName || "-"))} · ${escapeHtml(String(req.siteContactPhone || req.contactPhone || "-"))}</span></div>
          <div><strong>Carga</strong><br /><span class="muted">${escapeHtml(String(req.cargoDescription || "-"))}</span></div>
          <div><strong>Requisitos de camión</strong><br /><span class="muted">${requestTruckRequirementSummaryHtml(req)}</span></div>
          <div><strong>Valor del viaje</strong><br /><span class="muted">$${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}</span></div>
          ${parseNum(req.insuredValue || 0) > 0 ? `<div><strong>Valor asegurado</strong><br /><span class="muted">$${parseNum(req.insuredValue).toLocaleString("es-CO")}</span></div>` : ""}
          ${parseNum(req.distanceKm || 0) > 0 ? `<div><strong>Distancia estimada</strong><br /><span class="muted">${parseNum(req.distanceKm).toLocaleString("es-CO")} km</span></div>` : ""}
          ${req.autoApproved ? `<div><strong>Aprobación</strong><br /><span class="muted">Automática</span></div>` : ""}
          ${parseNum(req.standbyChargeTotal) > 0 ? `<div class="full"><strong>Standby</strong><br /><span class="muted">$${parseNum(req.standbyChargeTotal).toLocaleString("es-CO")}</span></div>` : ""}
          ${req.rejectionReason ? `<div class="full"><strong>Motivo rechazo</strong><br /><span class="muted">${escapeHtml(String(req.rejectionReason))}</span></div>` : ""}
        </div>
        ${obs ? `<div class="solicitud-detail-notes full"><strong>Observaciones</strong><p class="detail-note" style="white-space:pre-wrap;margin:0.35rem 0 0">${escapeHtml(obs)}</p></div>` : ""}
      </section>
      ${renderRequestModificationLogSectionHtml(req)}
    `
  });
}

/** Copia JSON de auditoría de viaje: bootstrap puede traer solo `snapshotSummary`. */
function deletedTripSnapshotForTableRow(row) {
  const direct = parsePortalJsonSnapshot(row.snapshot);
  if (direct) return direct;
  const s = row.snapshotSummary;
  return s && typeof s === "object" ? s : null;
}

/** Copia JSON de auditoría de solicitud: bootstrap puede traer solo `snapshotSummary`. */
function deletedRequestSnapshotForTableRow(row) {
  const direct = parsePortalJsonSnapshot(row.snapshot);
  if (direct) return direct;
  const s = row.snapshotSummary;
  return s && typeof s === "object" ? s : null;
}

/**
 * Hidrata `noveltiesDetail` / `settlementDetail` desde el API si el bootstrap solo trajo la fila resumida.
 * @returns {object|null} fila fusionada o null si no hay sesión API
 */
async function ensurePayrollRunHeavyJsonLoaded(runId) {
  const id = String(runId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return null;
  const runs = read(KEYS.payrollRuns, []);
  const idx = runs.findIndex((r) => String(r.id) === id);
  if (idx < 0) return null;
  const cur = runs[idx];
  if (cur.payrollRunHeavyOmitted !== true) return cur;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return cur;
  try {
    const detail = await api.getJson(`/portal/payroll-runs/${encodeURIComponent(id)}`);
    if (!detail || typeof detail !== "object") return cur;
    const merged = {
      ...cur,
      settlementDetail: detail.settlementDetail ?? cur.settlementDetail ?? null,
      noveltiesDetail: detail.noveltiesDetail ?? cur.noveltiesDetail ?? null,
      workedDays: detail.workedDays != null ? detail.workedDays : cur.workedDays,
      workedDaysPaymentCop:
        detail.workedDaysPaymentCop != null ? detail.workedDaysPaymentCop : cur.workedDaysPaymentCop,
      payrollRunHeavyOmitted: false
    };
    const next = [...runs];
    next[idx] = merged;
    write(KEYS.payrollRuns, next);
    return merged;
  } catch (err) {
    devWarn("Portal: detalle de liquidación no disponible.", err?.message || err);
    notify(String(err?.message || "No fue posible cargar el detalle de la liquidación."), "warn");
    return cur;
  }
}

async function ensureDeletedTransportTripAuditSnapshotLoaded(logId) {
  const id = String(logId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return false;
  const rows = read(KEYS.deletedTransportTripLogs, []);
  const row = rows.find((r) => String(r.id) === id);
  if (!row) return false;
  if (parsePortalJsonSnapshot(row.snapshot)) return true;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return false;
  try {
    const res = await api.getJson(`/portal/deleted-transport-trip-audit/${encodeURIComponent(id)}`);
    const snap = res && typeof res === "object" ? res.snapshot : null;
    const idx = rows.findIndex((r) => String(r.id) === id);
    if (idx < 0) return false;
    const next = [...rows];
    next[idx] = { ...next[idx], snapshot: snap };
    write(KEYS.deletedTransportTripLogs, next);
    return true;
  } catch (err) {
    devWarn("Portal: snapshot de auditoría (viaje) no disponible.", err?.message || err);
    notify(String(err?.message || "No fue posible cargar la copia del viaje."), "warn");
    return false;
  }
}

async function ensureDeletedTransportRequestAuditSnapshotLoaded(logId) {
  const id = String(logId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return false;
  const rows = read(KEYS.deletedTransportRequestLogs, []);
  const row = rows.find((r) => String(r.id) === id);
  if (!row) return false;
  if (parsePortalJsonSnapshot(row.snapshot)) return true;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return false;
  try {
    const res = await api.getJson(`/portal/deleted-transport-request-audit/${encodeURIComponent(id)}`);
    const snap = res && typeof res === "object" ? res.snapshot : null;
    const idx = rows.findIndex((r) => String(r.id) === id);
    if (idx < 0) return false;
    const next = [...rows];
    next[idx] = { ...next[idx], snapshot: snap };
    write(KEYS.deletedTransportRequestLogs, next);
    return true;
  } catch (err) {
    devWarn("Portal: snapshot de auditoría (solicitud) no disponible.", err?.message || err);
    notify(String(err?.message || "No fue posible cargar la copia de la solicitud."), "warn");
    return false;
  }
}

function snapPick(obj, ...keys) {
  if (!obj) return "";
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function formatDeletedRequestSnapshotRouteLine(snap) {
  if (!snap) return "Sin datos de ruta.";
  const od = snapPick(snap, "departamento_origen", "originDepartment");
  const oc = snapPick(snap, "ciudad_origen", "originCity");
  const dd = snapPick(snap, "departamento_destino", "destinationDepartment");
  const dc = snapPick(snap, "ciudad_destino", "destinationCity");
  const left = [oc, od].filter(Boolean).join(", ") || oc || od || "";
  const right = [dc, dd].filter(Boolean).join(", ") || dc || dd || "";
  if (left && right) return `${left} → ${right}`;
  return left || right || "Sin datos de ruta.";
}

function formatDeletedRequestSnapshotTableSummary(snap) {
  if (!snap) return "—";
  const route = formatDeletedRequestSnapshotRouteLine(snap);
  const cargo = snapPick(snap, "descripcion_carga", "cargoDescription");
  if (!cargo) return route;
  const short = cargo.length > 90 ? `${cargo.slice(0, 87)}…` : cargo;
  return `${route} · ${short}`;
}

/**
 * Ficha de solo lectura desde la fila de `auditoria_solicitudes_eliminadas`
 * (copia JSON al momento de borrar).
 */
function openDeletedTransportRequestAuditModal(logRow) {
  if (!logRow) return;
  const snap = parsePortalJsonSnapshot(logRow.snapshot);
  const reqN = String(logRow.requestNumber || logRow.requestId || "-").trim();
  const baseAuditSubtitle = `<span class="muted">Eliminada:</span> ${escapeHtml(fmtDate(logRow.deletedAt))}<br />
    <span class="muted">Usuario:</span> ${escapeHtml(String(logRow.deletedByEmail || "—"))}<br />
    <span class="muted">Motivo:</span> ${escapeHtml(String(logRow.reason || "—"))}`;
  if (!snap) {
    openInfoModal({
      title: `Solicitud eliminada ${reqN}`,
      subtitleHtml: `${baseAuditSubtitle}<br /><span class="muted">Estado al eliminar:</span> —`,
      wide: true,
      bodyHtml:
        '<p class="muted">No hay copia JSON de la solicitud en este registro de auditoría (registros antiguos o sin snapshot).</p>'
    });
    return;
  }
  const modo = escapeHtml(snapPick(snap, "tipo_servicio", "serviceType") || "—");
  const tkRaw = snap.refrigeracion_termoking ?? snap.requiresThermoking;
  const thermoking =
    tkRaw === true ||
    String(tkRaw).toLowerCase() === "true" ||
    String(tkRaw).toLowerCase() === "yes";
  const routeLine = escapeHtml(formatDeletedRequestSnapshotRouteLine(snap));
  const origAddr = escapeHtml(snapPick(snap, "direccion_origen", "originAddress"));
  const destAddr = escapeHtml(snapPick(snap, "direccion_destino", "destinationAddress"));
  const pickupIso = snapPick(snap, "fecha_hora_recogida", "pickupAt");
  const deliveryIso = snapPick(snap, "fecha_hora_entrega_estimada", "etaDelivery");
  const requestedBy = escapeHtml(snapPick(snap, "nombre_quien_solicita", "requestedByName") || "—");
  const contactName = escapeHtml(snapPick(snap, "nombre_contacto_en_sitio", "siteContactName", "contactName") || "—");
  const contactPhone = escapeHtml(snapPick(snap, "telefono_contacto_en_sitio", "siteContactPhone", "contactPhone") || "—");
  const cargo = escapeHtml(snapPick(snap, "descripcion_carga", "cargoDescription") || "—");
  const peso = parseNum(snap.peso_kg ?? snap.weightKg);
  const cajas = parseNum(snap.numero_cajas ?? snap.boxes ?? snap.boxesCount);
  const estadoPlain = snapPick(snap, "estado", "status") || "—";
  const estado = escapeHtml(estadoPlain);
  const fullSubtitleHtml = `${baseAuditSubtitle}<br /><span class="muted">Estado al eliminar:</span> ${estado}`;
  openInfoModal({
    title: `Solicitud eliminada ${reqN}`,
    subtitleHtml: fullSubtitleHtml,
    wide: true,
    bodyHtml: `
      <section class="solicitud-detail-section" aria-label="Copia de la solicitud eliminada">
        <div class="dash-grid">
          <div class="full"><strong>Cliente</strong><br /><span class="muted">${escapeHtml(
            snapPick(snap, "nombre_cliente", "clientName") || "—"
          )}</span></div>
          <div><strong>Modo de transporte</strong><br /><span class="muted">${modo}</span></div>
          <div><strong>Refrigeración Termoking</strong><br /><span class="muted">${thermoking ? "Sí, requerida" : "No"}</span></div>
          <div><strong>Tipo de vehículo solicitado</strong><br /><span class="muted">${tipoVeh}</span></div>
          <div><strong>Ruta (ciudad / depto.)</strong><br /><span class="muted">${routeLine}</span></div>
          ${origAddr ? `<div class="full"><strong>Origen (dirección)</strong><br /><span class="muted">${origAddr}</span></div>` : ""}
          ${destAddr ? `<div class="full"><strong>Destino (dirección)</strong><br /><span class="muted">${destAddr}</span></div>` : ""}
          <div><strong>Recogida programada</strong><br /><span class="muted">${escapeHtml(fmtDate(pickupIso))}</span></div>
          <div><strong>Entrega estimada</strong><br /><span class="muted">${escapeHtml(fmtDate(deliveryIso))}</span></div>
          <div><strong>Solicita</strong><br /><span class="muted">${requestedBy}</span></div>
          <div><strong>Contacto en sitio</strong><br /><span class="muted">${contactName} · ${contactPhone}</span></div>
          <div><strong>Carga</strong><br /><span class="muted">${cargo}</span></div>
          <div><strong>Peso / cajas</strong><br /><span class="muted">${peso.toLocaleString("es-CO")} kg · ${cajas.toLocaleString("es-CO")} cajas</span></div>
        </div>
        ${obs ? `<div class="solicitud-detail-notes"><strong>Observaciones</strong><p class="detail-note" style="white-space:pre-wrap;margin:0.35rem 0 0">${escapeHtml(obs)}</p></div>` : ""}
      </section>
    `
  });
}

function formatDeletedTripSnapshotTableSummary(snap) {
  if (!snap) return "—";
  const num = snapPick(snap, "numero_viaje", "tripNumber");
  const plate = snapPick(snap, "placa_vehiculo", "vehiclePlate");
  const driver = snapPick(snap, "nombre_conductor", "driverName");
  const route = snapPick(snap, "descripcion_ruta", "routeDescription", "notes");
  const parts = [];
  if (num) parts.push(`Viaje ${num}`);
  if (plate) parts.push(plate);
  if (driver) parts.push(driver);
  let line = parts.length ? parts.join(" · ") : "Viaje";
  if (route) {
    const rShort = route.length > 72 ? `${route.slice(0, 69)}…` : route;
    line += ` · ${rShort}`;
  }
  return line;
}

/**
 * Ficha de solo lectura desde `auditoria_viajes_eliminados.datos_json`
 * (fila de viajes_transporte al momento de desasignar).
 */
function openDeletedTransportTripAuditModal(logRow) {
  if (!logRow) return;
  const snap = parsePortalJsonSnapshot(logRow.snapshot);
  const tripLabel = String(logRow.tripNumber || "").trim() || "—";
  const reqLabel = String(logRow.requestNumber || logRow.requestId || "").trim() || "—";
  const baseAuditSubtitle = `<span class="muted">Registrado:</span> ${escapeHtml(fmtDate(logRow.deletedAt))}<br />
    <span class="muted">Usuario:</span> ${escapeHtml(String(logRow.deletedByEmail || "—"))}<br />
    <span class="muted">Motivo:</span> ${escapeHtml(String(logRow.reason || "—"))}<br />
    <span class="muted">Solicitud:</span> ${escapeHtml(reqLabel)} · <span class="muted">Viaje:</span> ${escapeHtml(tripLabel)}`;
  if (!snap) {
    openInfoModal({
      title: `Viaje desasignado ${tripLabel}`,
      subtitleHtml: baseAuditSubtitle,
      wide: true,
      bodyHtml:
        '<p class="muted">No hay copia JSON del viaje en este registro de auditoría (registros antiguos o sin snapshot).</p>'
    });
    return;
  }
  const estadoOp = escapeHtml(snapPick(snap, "estado_operativo_en_vivo", "liveOperationalStatus") || "—");
  const fullSubtitleHtml = `${baseAuditSubtitle}<br /><span class="muted">Estado operativo (copia):</span> ${estadoOp}`;
  const pickup = snapPick(snap, "fecha_hora_recogida_programada", "etaPickup");
  const delivery = snapPick(snap, "fecha_hora_entrega_programada", "etaDelivery");
  const assignedBy = escapeHtml(snapPick(snap, "asignado_por", "assignedBy") || "—");
  const assignedAt = snapPick(snap, "fecha_hora_asignacion", "assignedAt");
  const tipoVeh = escapeHtml(snapPick(snap, "tipo_vehiculo_asignado", "vehicleType") || "—");
  const plate = escapeHtml(snapPick(snap, "placa_vehiculo", "vehiclePlate") || "—");
  const driver = escapeHtml(snapPick(snap, "nombre_conductor", "driverName") || "—");
  const driverPhone = escapeHtml(snapPick(snap, "telefono_conductor", "driverPhone") || "—");
  const routeDesc = escapeHtml(snapPick(snap, "descripcion_ruta", "routeDescription") || "—");
  const numViajeRaw = snapPick(snap, "numero_viaje", "tripNumber") || tripLabel;
  const numViaje = escapeHtml(numViajeRaw);
  const idSol = escapeHtml(snapPick(snap, "id_solicitud", "requestId") || String(logRow.requestId || "—"));
  const invoiceRaw = snap.datos_factura_json ?? snap.invoiceData;
  let invoiceBlock = "";
  if (invoiceRaw != null && invoiceRaw !== "") {
    try {
      const txt =
        typeof invoiceRaw === "string" ? invoiceRaw : JSON.stringify(invoiceRaw, null, 2);
      const short = txt.length > 1200 ? `${txt.slice(0, 1197)}…` : txt;
      invoiceBlock = `<div class="solicitud-detail-notes"><strong>Datos facturación (JSON)</strong><pre class="detail-note" style="white-space:pre-wrap;margin:0.35rem 0 0;font-size:0.82em;max-height:14rem;overflow:auto">${escapeHtml(short)}</pre></div>`;
    } catch {
      invoiceBlock = "";
    }
  }
  openInfoModal({
    title: `Viaje desasignado ${numViajeRaw}`,
    subtitleHtml: fullSubtitleHtml,
    wide: true,
    bodyHtml: `
      <section class="solicitud-detail-section" aria-label="Copia del viaje desasignado">
        <div class="dash-grid">
          <div><strong>Número de viaje</strong><br /><span class="muted">${numViaje}</span></div>
          <div class="full"><strong>ID solicitud asociada</strong><br /><span class="muted">${idSol}</span></div>
          <div><strong>Vehículo (placa)</strong><br /><span class="muted">${plate}</span></div>
          <div><strong>Tipo vehículo asignado</strong><br /><span class="muted">${tipoVeh}</span></div>
          <div><strong>Conductor</strong><br /><span class="muted">${driver}</span></div>
          <div><strong>Teléfono conductor</strong><br /><span class="muted">${driverPhone}</span></div>
          <div class="full"><strong>Descripción de ruta / observaciones</strong><br /><span class="muted">${routeDesc}</span></div>
          <div><strong>Recogida programada</strong><br /><span class="muted">${escapeHtml(fmtDate(pickup))}</span></div>
          <div><strong>Entrega programada</strong><br /><span class="muted">${escapeHtml(fmtDate(delivery))}</span></div>
          <div><strong>Asignado por</strong><br /><span class="muted">${assignedBy}</span></div>
          <div><strong>Fecha de asignación</strong><br /><span class="muted">${escapeHtml(fmtDate(assignedAt))}</span></div>
        </div>
        ${invoiceBlock}
      </section>
    `
  });
}

/**
 * Editor del viaje (admin). Permite actualizar fechas estimadas, vehículo,
 * conductor y observaciones operativas. Las acciones destructivas como
 * cambiar el estado del viaje siguen ocurriendo a través del select de
 * estado en el card (transitionRequestStatus).
 */
function openEditTripModal(req) {
  if (!req?.trip) return;
  if (!canAdminEditTrip(req)) {
    notify("Solo un administrador puede editar este viaje.", "error");
    return;
  }
  const vehicles = read(KEYS.vehicles, []);
  const drivers = read(KEYS.drivers, []);
  const vehicleOptions = [{ value: req.trip.vehicleId || "", label: `${req.trip.vehiclePlate || "—"} · ${req.trip.vehicleType || ""}` }]
    .concat(
      vehicles
        .filter((v) => String(v.id || "") !== String(req.trip.vehicleId || ""))
        .map((v) => ({ value: String(v.id || ""), label: `${v.plate} · ${v.type || ""}` }))
    );
  const driverOptions = [{ value: req.trip.driverId || "", label: req.trip.driverName || "—" }]
    .concat(
      drivers
        .filter((d) => String(d.id || "") !== String(req.trip.driverId || ""))
        .map((d) => ({ value: String(d.id || ""), label: `${d.fullName || d.name || ""}${d.taxId ? ` · ${d.taxId}` : ""}` }))
    );
  const etaPickupLocal = String(toInputDate(req.trip.etaPickup || "") || "").slice(0, 16);
  const etaDeliveryLocal = String(toInputDate(req.trip.etaDelivery || "") || "").slice(0, 16);
  openEditModal({
    title: `Editar viaje ${req.trip.tripNumber}`,
    subtitle: `Solicitud ${req.requestNumber || req.id} · ${req.clientName || ""}`,
    submitText: "Guardar cambios del viaje",
    extraModalCardClass: "modal-card-edit--trip",
    fields: [
      { type: "section", id: "edit-trip-assign", title: "Asignación", hint: "Vehículo y conductor actualmente asignados al viaje." },
      { name: "vehicleId", label: "Vehículo", type: "select", value: req.trip.vehicleId || "", required: true, options: vehicleOptions },
      { name: "driverId", label: "Conductor", type: "select", value: req.trip.driverId || "", required: true, options: driverOptions },
      { type: "section", id: "edit-trip-times", title: "Fechas estimadas", hint: "Permite reprogramar la recogida o la entrega del viaje." },
      { name: "etaPickup", label: "Recogida (fecha y hora)", type: "datetime-local", value: etaPickupLocal, required: true },
      { name: "etaDelivery", label: "Entrega (fecha y hora)", type: "datetime-local", value: etaDeliveryLocal, required: true },
      { type: "section", id: "edit-trip-money", title: "Tarifa y observaciones", hint: "Ajustes manuales que no exigen cambiar el estado del viaje." },
      { name: "tripValue", label: "Tarifa del viaje (COP)", type: "number", min: 0, value: parseNum(req.tripValue || 0), required: false },
      { name: "tripNotes", label: "Observaciones del viaje", type: "textarea", value: req.trip.notes || "", rows: 3 }
    ],
    onSubmit: async (form) => {
      const requests = reqRead();
      const targetVehicle = vehicles.find((v) => String(v.id || "") === String(form.vehicleId || ""));
      const targetDriver = drivers.find((d) => String(d.id || "") === String(form.driverId || ""));
      const updates = {
        tripValue: parseNum(form.tripValue) || parseNum(req.tripValue || 0),
        updatedAt: nowIso(),
        updatedBy: currentUser()?.name || "Admin",
        trip: {
          ...req.trip,
          vehicleId: String(form.vehicleId || req.trip.vehicleId || ""),
          vehiclePlate: targetVehicle?.plate || req.trip.vehiclePlate || "",
          vehicleType: targetVehicle?.type || req.trip.vehicleType || "",
          driverId: String(form.driverId || req.trip.driverId || ""),
          driverName: targetDriver?.fullName || targetDriver?.name || req.trip.driverName || "",
          driverPhone: targetDriver?.phone || req.trip.driverPhone || "",
          etaPickup: form.etaPickup ? new Date(form.etaPickup).toISOString() : req.trip.etaPickup,
          etaDelivery: form.etaDelivery ? new Date(form.etaDelivery).toISOString() : req.trip.etaDelivery,
          notes: String(form.tripNotes || "").trim(),
          updatedAt: nowIso(),
          updatedBy: currentUser()?.name || "Admin"
        }
      };
      const updated = requests.map((r) => (r.id === req.id ? { ...r, ...updates } : r));
      try {
        await reqWriteAwait(updated);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar los cambios del viaje."), "error");
        return false;
      }
      recalculateResourceAvailability();
      notify("Viaje actualizado correctamente.", "success");
      renderPortalView();
      return true;
    }
  });
}

/**
 * Edición de tarifa por trayecto (admin): mismo patrón visual que {@link openEditTripModal}
 * (secciones, `modal-card-edit--trip`), sin depender del formulario colapsable.
 */
function openEditRouteRateModal(storageKey) {
  const key = String(storageKey || "").trim();
  if (!key) return;
  const entry = getTripRouteRatesNormalized()[key];
  if (!entry) return;
  const parts = parseTripRateStorageKeyToRouteParts(key);
  const companies = read(KEYS.companies, []);
  const selectedCompanyIds = (Array.isArray(entry.companyIds) ? entry.companyIds : [])
    .map((id) => String(id).trim())
    .filter(Boolean);
  const rateScopeValue = selectedCompanyIds.length ? "specific" : "all";
  const auditSummary = `Registro ${String(entry.id || "").trim() || "pendiente"} · creado ${fmtDateOr(
    entry.createdAt,
    "—"
  )} · actualizado ${fmtDateOr(entry.updatedAt || entry.createdAt, "—")}`;
  const scopeStepHtml = buildRouteRateScopeStepInnerHtml(companies, {
    scopeValue: rateScopeValue,
    selectedCompanyIds
  });
  const deptOpts = [{ value: "", label: "Seleccione..." }, ...Object.keys(COLOMBIA_LOCATIONS).sort().map((d) => ({ value: d, label: d }))];
  const cityPlaceholder = [{ value: "", label: "Seleccione departamento..." }];
  openEditModal({
    title: "Editar tarifa de trayecto",
    subtitle: humanTripRateRouteLabelFromStorageKey(key),
    submitText: "Guardar cambios de tarifa",
    extraModalCardClass: "modal-card-edit--trip",
    fields: [
      { type: "hidden", name: "editingRateKey", value: key },
      { type: "section", id: "edit-rate-origin", title: "Origen", hint: "Departamento y ciudad desde los que se pactó el trayecto." },
      { name: "originDepartment", label: "Departamento de origen", type: "select", value: parts.originDepartment, required: true, options: deptOpts },
      { name: "originCity", label: "Ciudad de origen", type: "select", value: parts.originCity, required: true, options: cityPlaceholder },
      { type: "section", id: "edit-rate-dest", title: "Destino", hint: "Departamento y ciudad de entrega." },
      { name: "destinationDepartment", label: "Departamento de destino", type: "select", value: parts.destinationDepartment, required: true, options: deptOpts },
      { name: "destinationCity", label: "Ciudad de destino", type: "select", value: parts.destinationCity, required: true, options: cityPlaceholder },
      { type: "section", id: "edit-rate-money", title: "Tarifa pactada", hint: "Valor en COP que se sugiere al asignar un viaje en esta ruta." },
      { name: "tripRateCop", label: "Valor del viaje (COP)", type: "number", min: 1, step: 1, value: parseNum(entry.value), required: true },
      { type: "custom", full: true, html: `<p class="muted" style="margin:0">${escapeHtml(auditSummary)}</p>` },
      {
        type: "section",
        id: "edit-rate-scope",
        title: "¿A qué clientes aplica?",
        hint: "General para todos; por empresa solo para los clientes que marque abajo.",
        gridClass: "route-rate-scope-grid"
      },
      { type: "custom", full: true, html: `<div data-route-rate-scope-mount>${scopeStepHtml}</div>` }
    ],
    afterMount: (formEl) => {
      const od = formEl.querySelector("select[name='originDepartment']");
      const oc = formEl.querySelector("select[name='originCity']");
      const dd = formEl.querySelector("select[name='destinationDepartment']");
      const dc = formEl.querySelector("select[name='destinationCity']");
      setSelectValueInsensitive(od, parts.originDepartment);
      attachDepartmentCitySelects(formEl, {
        departmentSelector: "select[name='originDepartment']",
        citySelector: "select[name='originCity']",
        initialDepartment: parts.originDepartment,
        initialCity: parts.originCity
      });
      setSelectValueInsensitive(oc, parts.originCity);
      setSelectValueInsensitive(dd, parts.destinationDepartment);
      attachDepartmentCitySelects(formEl, {
        departmentSelector: "select[name='destinationDepartment']",
        citySelector: "select[name='destinationCity']",
        initialDepartment: parts.destinationDepartment,
        initialCity: parts.destinationCity
      });
      setSelectValueInsensitive(dc, parts.destinationCity);
      wireRouteRateScopeSection(formEl);
    },
    onSubmit: async (payload, formEl) => {
      const fd = new FormData(formEl);
      const scopeField = formEl.querySelector("[data-route-rate-scope-field]");
      const scope = String(scopeField?.value || payload.rateScope || "all");
      const companyIdsRaw = [...fd.getAll("rateClientCompanies")].map((v) => String(v || "").trim()).filter(Boolean);
      const companyIds = scope === "specific" ? companyIdsRaw : [];
      const od = String(payload.originDepartment || "").trim();
      const oc = String(payload.originCity || "").trim();
      const dd = String(payload.destinationDepartment || "").trim();
      const dc = String(payload.destinationCity || "").trim();
      const tripRateCop = parseNum(payload.tripRateCop);
      if (!od || !oc || !dd || !dc) {
        notify(userMessage("routeRateSelectRoute"), "error");
        return false;
      }
      if (tripRateCop <= 0) {
        notify(userMessage("routeRateInvalidCop"), "error");
        return false;
      }
      if (scope === "specific" && !companyIds.length) {
        notify("Selecciona al menos una empresa para una tarifa específica.", "error");
        return false;
      }
      const routeKey = buildTripRouteRateKey(od, oc, dd, dc);
      const normalized = getTripRouteRatesNormalized();
      const newStorageKey = tripRateStorageKey(routeKey, companyIds);
      const editingKey = String(payload.editingRateKey || "").trim();
      const previousEntry = editingKey ? normalized[editingKey] : normalized[newStorageKey];
      const next = { ...normalized, [newStorageKey]: buildRouteRateEntry(tripRateCop, companyIds, previousEntry) };
      if (editingKey && editingKey !== newStorageKey) delete next[editingKey];
      try {
        await writeAwaitServer(KEYS.tripRouteRates, next);
      } catch (err) {
        notify(String(err?.message || userMessage("genericError")), "error");
        return false;
      }
      notify("Tarifa por trayecto actualizada.", "success");
      renderPortalView();
      return true;
    }
  });
}

function validateColombianDocument(docType, rawValue) {
  const type = String(docType || "").toUpperCase();
  const base = String(rawValue || "").trim();
  const compact = base.replace(/[.\s]/g, "");
  if (!compact) return { ok: false, message: "El documento es obligatorio.", normalized: "" };
  if (type === "CC") {
    const ok = /^\d{6,10}$/.test(compact);
    return { ok, message: ok ? "" : "La cedula CC debe tener entre 6 y 10 digitos.", normalized: compact };
  }
  if (type === "CE") {
    const ok = /^\d{6,12}$/.test(compact);
    return { ok, message: ok ? "" : "La cedula CE debe tener entre 6 y 12 digitos.", normalized: compact };
  }
  if (type === "NIT") {
    const ok = /^\d{8,10}(-\d)?$/.test(compact);
    return { ok, message: ok ? "" : "El NIT debe tener formato 900123456 o 900123456-7.", normalized: compact };
  }
  if (type === "PAS") {
    const ok = /^[A-Za-z0-9]{5,20}$/.test(compact);
    return { ok, message: ok ? "" : "El pasaporte debe ser alfanumerico (5-20 caracteres).", normalized: compact.toUpperCase() };
  }
  if (type === "PEP") {
    const ok = /^[A-Za-z0-9-]{5,20}$/.test(compact);
    return {
      ok,
      message: ok ? "" : "El PEP/PPT debe ser alfanumerico (5-20 caracteres).",
      normalized: compact.toUpperCase()
    };
  }
  if (type === "TI") {
    const ok = /^\d{8,11}$/.test(compact);
    return { ok, message: ok ? "" : "La tarjeta de identidad debe tener entre 8 y 11 digitos.", normalized: compact };
  }
  return { ok: compact.length >= 5, message: "Tipo de documento no valido.", normalized: compact };
}

function documentFieldRule(docType) {
  const type = String(docType || "").toUpperCase();
  if (type === "CC") return { pattern: "[0-9]{6,10}", minlength: "6", maxlength: "10", inputmode: "numeric", placeholder: "Cédula sin puntos" };
  if (type === "CE") return { pattern: "[0-9]{6,12}", minlength: "6", maxlength: "12", inputmode: "numeric", placeholder: "Cédula de extranjería" };
  if (type === "TI") return { pattern: "[0-9]{8,11}", minlength: "8", maxlength: "11", inputmode: "numeric", placeholder: "Tarjeta de identidad" };
  if (type === "PAS") return { pattern: "[A-Za-z0-9]{5,20}", minlength: "5", maxlength: "20", inputmode: "text", placeholder: "Pasaporte alfanumérico" };
  if (type === "PEP") return { pattern: "[A-Za-z0-9-]{5,20}", minlength: "5", maxlength: "20", inputmode: "text", placeholder: "PEP/PPT alfanumérico" };
  return { pattern: "", minlength: "5", maxlength: "20", inputmode: "text", placeholder: "Documento" };
}

function applyDocumentFieldConstraints(root, config = {}) {
  const scope = root && typeof root.querySelector === "function" ? root : document;
  const typeField = scope.querySelector(config.typeSelector || "select[name='documentType']");
  const docField = scope.querySelector(config.docSelector || "input[name='idDoc']");
  if (!typeField || !docField) return;
  const sync = () => {
    const rule = documentFieldRule(typeField.value);
    if (rule.pattern) docField.setAttribute("pattern", rule.pattern);
    else docField.removeAttribute("pattern");
    if (rule.minlength) docField.setAttribute("minlength", rule.minlength);
    else docField.removeAttribute("minlength");
    if (rule.maxlength) docField.setAttribute("maxlength", rule.maxlength);
    else docField.removeAttribute("maxlength");
    if (rule.inputmode) docField.setAttribute("inputmode", rule.inputmode);
    else docField.removeAttribute("inputmode");
    if (rule.placeholder) docField.setAttribute("placeholder", rule.placeholder);
  };
  typeField.addEventListener("change", sync);
  sync();
}

/** Clave estable para validar que la cédula/documento personal no se repita (incluye registros previos). */
function getPersonalRegistrationKey(user) {
  if (!user) return "";
  const raw =
    (user.personalDoc != null && String(user.personalDoc).trim() !== "" && String(user.personalDoc)) ||
    (user.personalTaxId != null && String(user.personalTaxId).trim() !== "" && String(user.personalTaxId)) ||
    "";
  if (raw) {
    const onlyDig = raw.replace(/\D/g, "");
    if (onlyDig.length >= 5) return onlyDig;
    return String(raw).trim().toUpperCase();
  }
  const dt = String(user.documentType || "").toUpperCase();
  if (dt === "PAS") return String(user.taxId || "").replace(/\s/g, "").toUpperCase();
  if (dt === "NIT") return "";
  return String(user.taxId || "").replace(/\D/g, "");
}


/**
 * Preferencias de notificaciones: única persistencia en PostgreSQL (`preferencias_notificacion_usuario`),
 * vía GET /portal/bootstrap (`notificationPreferences`) y POST /portal/notification-preferences.
 * En memoria solo `state.notificationPreferences` (hasta que llegue el bootstrap).
 */
let __notifInboxAudioCtx = null;
let __notifInboxAudioUnlockInstalled = false;

/** Edad de una notificación respecto al reloj local; 0 si no hay fecha fiable (se trata como recién vista). */
function __notificationPollAgeMs(n, nowMs) {
  const raw = n?.createdAt;
  if (raw === undefined || raw === null || String(raw).trim() === "") return 0;
  const createdTs = new Date(raw).getTime();
  if (!Number.isFinite(createdTs)) return 0;
  return nowMs - createdTs;
}

/**
 * Ventana «en vivo» del poll: evita re-toastear historial.
 * Si el servidor va adelantado (age < 0), igual contamos como fresca para no silenciar timbre/toast.
 */
function __inboxNotificationIsFreshForPoll(n, nowMs, windowMs) {
  return __notificationPollAgeMs(n, nowMs) < windowMs;
}

function ensureInboxNotificationAudioUnlocked() {
  if (typeof document === "undefined" || __notifInboxAudioUnlockInstalled) return;
  __notifInboxAudioUnlockInstalled = true;
  const resume = () => {
    try {
      const ctx = __notifInboxAudioCtx;
      if (ctx && ctx.state === "suspended") void ctx.resume();
    } catch (_e) {}
  };
  ["pointerdown", "keydown", "click"].forEach((ev) => {
    document.addEventListener(ev, resume, { capture: true, passive: true });
  });
}

function getNotificationPreferencesNormalized() {
  const p = state.notificationPreferences;
  if (p && typeof p === "object") {
    return {
      id: String(p.id || "").trim() || null,
      notificacionesHabilitadas: p.notificacionesHabilitadas !== false,
      sonidoNotificacionesHabilitadas: p.sonidoNotificacionesHabilitadas !== false,
      createdAt: p.createdAt ? String(p.createdAt) : null,
      updatedAt: p.updatedAt ? String(p.updatedAt) : null
    };
  }
  return {
    id: null,
    notificacionesHabilitadas: true,
    sonidoNotificacionesHabilitadas: true,
    createdAt: null,
    updatedAt: null
  };
}

/** Timbre audible (columna `sonido_notificaciones_habilitadas`); independiente de avisos emergentes. */
function isSonidoNotificacionesHabilitado() {
  return getNotificationPreferencesNormalized().sonidoNotificacionesHabilitadas !== false;
}

/** Avisos emergentes (toasts) y fila server-side respetan este flag. */
function isInAppNotificationAlertsEnabled() {
  return getNotificationPreferencesNormalized().notificacionesHabilitadas !== false;
}

/** Reproduce timbre solo si avisos y sonido están activos. */
function isInboxNotificationSoundEnabled() {
  const n = getNotificationPreferencesNormalized();
  if (!n.notificacionesHabilitadas) return false;
  return n.sonidoNotificacionesHabilitadas !== false;
}

async function persistNotificationPreferencesToApi(partial) {
  const api = window.AntaresApi;
  if (!api?.getBase?.() || typeof api.postJson !== "function") return null;
  if (!String(api.getAccessToken?.() || "").trim()) return null;
  const body = {};
  if (partial.notificacionesHabilitadas !== undefined) {
    body.notificacionesHabilitadas = Boolean(partial.notificacionesHabilitadas);
  }
  if (partial.sonidoNotificacionesHabilitadas !== undefined) {
    body.sonidoNotificacionesHabilitadas = Boolean(partial.sonidoNotificacionesHabilitadas);
  }
  if (!Object.keys(body).length) return null;
  try {
    const res = await api.postJson("/portal/notification-preferences", body);
    if (res && typeof res === "object") {
      if (typeof window.applyNotificationPreferencesFromBootstrapPayload === "function") {
        window.applyNotificationPreferencesFromBootstrapPayload(res);
      }
    }
    return res;
  } catch (_e) {
    notify("No se pudieron guardar las preferencias de notificaciones.", "error");
    return null;
  }
}

function setNotificationSoundMuted(muted) {
  const sonidoOn = !muted;
  state.notificationPreferences = {
    ...getNotificationPreferencesNormalized(),
    sonidoNotificacionesHabilitadas: sonidoOn,
    updatedAt: nowIso()
  };
  syncNotificationPrefsSidebarUi();
  if (sonidoOn) primeInboxNotificationAudioFromUserGesture();
  void persistNotificationPreferencesToApi({ sonidoNotificacionesHabilitadas: sonidoOn });
}

function setNotificationAlertsEnabled(enabled) {
  state.notificationPreferences = {
    ...getNotificationPreferencesNormalized(),
    notificacionesHabilitadas: Boolean(enabled),
    updatedAt: nowIso()
  };
  syncNotificationPrefsSidebarUi();
  void persistNotificationPreferencesToApi({ notificacionesHabilitadas: Boolean(enabled) });
}

function toggleNotificationSoundMuted() {
  const wasSoundOn = isSonidoNotificacionesHabilitado();
  setNotificationSoundMuted(wasSoundOn);
    notify(
    wasSoundOn
      ? "Timbre silenciado (solo audio). Los avisos en pantalla no cambian si los tienes activos."
      : "Timbre activado.",
    "info",
    2600
  );
}

function toggleNotificationAlertsEnabled() {
  const next = !isInAppNotificationAlertsEnabled();
  setNotificationAlertsEnabled(next);
  notify(
    next
      ? "Avisos emergentes activados. Verás mensajes al instante cuando lleguen avisos nuevos."
      : "Avisos emergentes desactivados: sin ventanas por avisos nuevos ni notificaciones nuevas del servidor. La bandeja conserva el historial ya recibido.",
    "info",
    3800
  );
}

function syncNotificationPrefsSidebarUi() {
  const link = document.querySelector('.side-link[data-view="notifications"]');
  if (!link) return;
  const soundOff = !isSonidoNotificacionesHabilitado();
  const alertsOff = !isInAppNotificationAlertsEnabled();
  link.classList.toggle("side-link--notif-sound-muted", soundOff);
  link.classList.toggle("side-link--notif-alerts-off", alertsOff);
  const soundPill = link.querySelector(".side-link-notif-sound-pill");
  if (soundPill) {
    soundPill.textContent = soundOff ? "Sin timbre" : "Timbre";
    soundPill.title = soundOff
      ? "Clic para volver a reproducir el timbre al llegar avisos nuevos"
      : "Clic para silenciar solo el timbre (la bandeja y los avisos en pantalla siguen igual)";
  }
  const alertsPill = link.querySelector(".side-link-notif-alerts-pill");
  if (alertsPill) {
    alertsPill.textContent = alertsOff ? "Sin avisos" : "Avisos";
    alertsPill.title = alertsOff
      ? "Clic para volver a recibir avisos emergentes y notificaciones del servidor"
      : "Clic para pausar avisos emergentes y dejar de recibir notificaciones nuevas en el servidor";
  }
  const control = link.querySelector(".side-link-notif-control");
  if (control) {
    let aria = "";
    if (alertsOff && soundOff) {
      aria =
        "Preferencias: avisos emergentes desactivados y timbre silenciado. Use «Avisos» o «Timbre» para activar cada uno.";
    } else if (alertsOff) {
      aria = "Avisos emergentes desactivados (sin toasts ni notificaciones nuevas en servidor). «Timbre»: solo el audio.";
    } else if (soundOff) {
      aria = "Timbre silenciado; los avisos emergentes siguen activos si no los desactivó.";
    } else {
      aria = "«Timbre» controla el audio; «Avisos» controla ventanas emergentes y notificaciones nuevas del servidor.";
    }
    control.setAttribute("aria-label", aria);
  }
}

/** @deprecated usar syncNotificationPrefsSidebarUi */
function syncNotificationSoundMutedUi() {
  syncNotificationPrefsSidebarUi();
}

/**
 * Timbre breve para nuevas notificaciones de bandeja (no afecta otros `notify()` de la app).
 * Puede quedar en silencio hasta la primera interacción del usuario (política del navegador).
 */
function playInboxNotificationSound() {
  if (!isInboxNotificationSoundEnabled()) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!__notifInboxAudioCtx) __notifInboxAudioCtx = new AC();
    ensureInboxNotificationAudioUnlocked();
    const ctx = __notifInboxAudioCtx;
    const run = () => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = "sine";
      const t0 = ctx.currentTime;
      osc.frequency.setValueAtTime(740, t0);
      osc.frequency.setValueAtTime(988, t0 + 0.07);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.075, t0 + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
      osc.start(t0);
      osc.stop(t0 + 0.34);
    };
    if (ctx.state === "suspended") {
      void ctx.resume().then(run).catch(() => {});
    } else {
      run();
    }
  } catch (_e) {}
}

/**
 * Tras un gesto explícito (p. ej. activar timbre), deja el AudioContext listo para el poll sin esperar otro clic.
 */
function primeInboxNotificationAudioFromUserGesture() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!__notifInboxAudioCtx) __notifInboxAudioCtx = new AC();
    ensureInboxNotificationAudioUnlocked();
    const ctx = __notifInboxAudioCtx;
    if (ctx.state === "suspended") void ctx.resume();
  } catch (_e) {}
}

const CO_TIMEZONE = "America/Bogota";
const REGISTER_TERMS_URL = "./terminos-condiciones.html";
const REGISTER_PRIVACY_URL = "./politica-privacidad.html";

/** Orden en la grilla de permisos (Usuarios y permisos). */
const PERMISSION_UI_GROUPS = [
  {
    title: "General",
    permissions: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.PROFILE_VIEW, PERMISSIONS.NOTIFICATIONS_VIEW]
  },
  {
    title: "Solicitudes y operación de transporte",
    permissions: [
      PERMISSIONS.CLIENT_REQUESTS,
      PERMISSIONS.TRANSPORT_REQUESTS,
      PERMISSIONS.TRANSPORT_TRIPS,
      PERMISSIONS.TRANSPORT_DRIVERS,
      PERMISSIONS.TRANSPORT_CALENDAR,
      PERMISSIONS.TRANSPORT_HISTORY
    ]
  },
  {
    title: "Flota · camiones (por acción)",
    permissions: [
      PERMISSIONS.TRANSPORT_VEHICLES,
      PERMISSIONS.TRANSPORT_VEHICLES_VIEW,
      PERMISSIONS.TRANSPORT_VEHICLES_CREATE,
      PERMISSIONS.TRANSPORT_VEHICLES_EDIT,
      PERMISSIONS.TRANSPORT_VEHICLES_STATUS,
      PERMISSIONS.TRANSPORT_VEHICLES_DELETE
    ]
  },
  {
    title: "Centro de aprobaciones (por bandeja)",
    permissions: [
      PERMISSIONS.AUTHORIZATIONS_MANAGE,
      PERMISSIONS.AUTHORIZATIONS_TRANSPORT,
      PERMISSIONS.AUTHORIZATIONS_PORTAL_REGISTRATIONS,
      PERMISSIONS.AUTHORIZATIONS_PORTAL_USERS,
      PERMISSIONS.AUTHORIZATIONS_FLEET,
      PERMISSIONS.AUTHORIZATIONS_WORKFORCE,
      PERMISSIONS.AUTHORIZATIONS_HR_ABSENCES,
      PERMISSIONS.AUTHORIZATIONS_PAYROLL_PAY
    ]
  },
  {
    title: "Recursos humanos y administración",
    permissions: [
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.HIRING_MANAGE,
      PERMISSIONS.SST_COMPLIANCE,
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.CONTACT_B2B_VIEW
    ]
  }
];

const STATUS = {
  PENDIENTE: "Pendiente",
  APROBADA_PENDIENTE_ASIGNACION: "Aprobada pendiente asignacion",
  VIAJE_ASIGNADO: "Viaje asignado",
  EN_TRANSITO: "En transito",
  ESPERA_STANDBY: "Espera standby",
  COMPLETADA: "Completada",
  CERRADA: "Cerrada",
  CANCELADA: "Cancelada",
  RECHAZADA: "Rechazada"
};

const STATUS_TRANSITIONS = {
  [STATUS.PENDIENTE]: [STATUS.APROBADA_PENDIENTE_ASIGNACION, STATUS.VIAJE_ASIGNADO, STATUS.CANCELADA, STATUS.RECHAZADA],
  [STATUS.APROBADA_PENDIENTE_ASIGNACION]: [STATUS.VIAJE_ASIGNADO, STATUS.CANCELADA],
  [STATUS.VIAJE_ASIGNADO]: [STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY, STATUS.CANCELADA],
  [STATUS.EN_TRANSITO]: [STATUS.ESPERA_STANDBY, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.ESPERA_STANDBY]: [STATUS.EN_TRANSITO, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.COMPLETADA]: [STATUS.CERRADA],
  [STATUS.CERRADA]: [],
  [STATUS.CANCELADA]: [],
  [STATUS.RECHAZADA]: []
};

function statusIconEmoji(status) {
  switch (String(status || "").trim()) {
    case STATUS.PENDIENTE:
      return "🕒";
    case STATUS.APROBADA_PENDIENTE_ASIGNACION:
      return "📥";
    case STATUS.VIAJE_ASIGNADO:
      return "🟢";
    case STATUS.EN_TRANSITO:
      return "🚚";
    case STATUS.ESPERA_STANDBY:
      return "⏸️";
    case STATUS.COMPLETADA:
      return "✅";
    case STATUS.CERRADA:
      return "📦";
    case STATUS.CANCELADA:
      return "⛔";
    case STATUS.RECHAZADA:
      return "❌";
    default:
      return "•";
  }
}

function tripStatusOptionLabel(status) {
  return `${statusIconEmoji(status)} ${String(status || "").trim()}`;
}

/** URL del logo corporativo para UI (solicitudes, detalle, selector). */
function companyProfileLogoUrl(company) {
  if (!company || typeof company !== "object") return "";
  const norm =
    typeof window.normalizePortalBootstrapCompanyRow === "function"
      ? window.normalizePortalBootstrapCompanyRow(company)
      : company;
  return String(norm.logoUrl || "").trim();
}

function payrollDocumentLogoUrl(company) {
  return companyProfileLogoUrl(company) || reportBrandLogoSrc();
}

/** Alinea texto guardado con la clave exacta del catálogo COLOMBIA_LOCATIONS (tildes, espacios, mayúsculas). */
function matchColombiaDepartmentToCatalogKey(departmentRaw) {
  const raw = String(departmentRaw || "").trim();
  if (!raw) return "";
  if (Object.prototype.hasOwnProperty.call(COLOMBIA_LOCATIONS, raw)) return raw;
  const norm = (s) =>
    normalizeLatinForDb(String(s || ""))
      .replace(/[_\s]+/g, "")
      .toLowerCase();
  const target = norm(raw);
  for (const key of Object.keys(COLOMBIA_LOCATIONS)) {
    if (norm(key) === target) return key;
  }
  return "";
}

function matchColombiaCityInDepartment(deptKey, cityRaw) {
  const d = String(deptKey || "").trim();
  const raw = String(cityRaw || "").trim();
  if (!d || !raw) return raw;
  const cities = COLOMBIA_LOCATIONS[d] || [];
  if (cities.includes(raw)) return raw;
  const norm = (s) =>
    normalizeLatinForDb(String(s || ""))
      .replace(/[_\s]+/g, "")
      .toLowerCase();
  const t = norm(raw);
  for (const city of cities) {
    if (norm(city) === t) return city;
  }
  return raw;
}

/** Cuentas creadas en el sitio / API con estado pendiente en PostgreSQL o solo en Supabase Auth. */
function isPortalUserPendingApproval(user) {
  if (pendingUserOrigin(user) === "supabase_auth_only") return true;
  const s = normalizeUserAccountStatus(user);
  return s === ACCOUNT_STATUS.PENDIENTE || s === "pending";
}

const PIPELINE = ["Recibido", "Preseleccionado", "Entrevistado", "Oferta enviada", "Contratado", "Descartado"];
const PIPELINE_TRANSITIONS = {
  Recibido: ["Preseleccionado", "Descartado"],
  Preseleccionado: ["Entrevistado", "Descartado"],
  Entrevistado: ["Oferta enviada", "Descartado"],
  "Oferta enviada": ["Contratado", "Descartado"],
  Contratado: [],
  Descartado: []
};
const AUTO_APPROVE_MINUTES = 10;
const CO_PAYROLL = {
  healthEmployeeRate: 0.04,
  pensionEmployeeRate: 0.04,
  solidarityRate: 0.01,
  solidarityThresholdSmmlv: 4,
  // SMMLV 2026 orientativo (~ $1.750.905 COP — verificar decreto del año fiscal).
  smmlv: 1750905
};

/** Ley 52/1975: interés legal anual sobre cesantías (referencia normativa vigente). */
const CO_CESANTIAS_INTERES_ANUAL_PCT = 12;

/** Junio (06) o diciembre (12): periodo habitual semestral de prima de servicios. */
function payrollMonthIsPrimaSemester(ym) {
  return /^(\d{4})-(06|12)(-|$)/.test(String(ym || "").trim());
}

/**
 * Enero u febrero: ventana habitual en nómina para liquidar o pagar intereses de cesantías del año causado (Ley 52/1975).
 * La ley señala pago **en el mes de enero** del año siguiente; muchas empresas lo registran en la planilla **01**, otras en **02** — valide con contador y fondo.
 */
function payrollMonthIsCesantiasInterestMonth(ym) {
  return /^(\d{4})-(01|02)(-|$)/.test(String(ym || "").trim());
}

/**
 * Intereses sobre cesantías (referencia Ley 52/1975): 12% anual.
 * Si `days360` > 0: proporcional (días/360). Si no, aplica tasa plena sobre la base (año completo orientativo).
 */
function calcColombiaInteresesCesantiasCop(baseCesantias, days360) {
  const b = Math.max(0, parseNum(baseCesantias));
  const d = Math.max(0, parseNum(days360));
  const rate = CO_CESANTIAS_INTERES_ANUAL_PCT / 100;
  if (d <= 0) return Math.round(b * rate);
  return Math.round(b * rate * (Math.min(d, 360) / 360));
}

/**
 * Prima de servicios semestral (referencia CST arts. 244–249): (salario mensual × días) ÷ 360.
 * Validar siempre con contador y política interna de la empresa.
 */
function calcColombiaPrimaServiciosCop(salaryMonthly, daysInSemester) {
  const s = Math.max(0, parseNum(salaryMonthly));
  const d = Math.max(0, parseNum(daysInSemester));
  return Math.round((s * d) / 360);
}

/**
 * Liquidación contractual por terminación (referencia orientativa — CST y normativa salarial colombiana).
 * Cesantías: salario × días ÷ 360. Intereses: 12% anual proporcional sobre cesantías calculadas (simplificado).
 * Prima proporcional: (salario × días proporcionales) ÷ 360. Vacaciones: (salario × días compensar) ÷ 720 (uso frecuente en nómina).
 */
function calcColombiaTerminationLines({ baseSalary, days360Year, primaPropDays, vacationDays }) {
  const base = Math.max(0, parseNum(baseSalary));
  const d360 = Math.max(0, parseNum(days360Year));
  const dPrima = Math.max(0, parseNum(primaPropDays));
  const dVac = Math.max(0, parseNum(vacationDays));
  const cesantias = Math.round((base * d360) / 360);
  const interesesCesantias = Math.round(((cesantias * 12) / 100) * (Math.min(d360, 360) / 360));
  const primaProporcional = Math.round((base * dPrima) / 360);
  const vacaciones = Math.round((base * dVac) / 720);
  return { cesantias, interesesCesantias, primaProporcional, vacaciones };
}

/** Rellena rubros del formulario de liquidación contractual a partir del salario y días ingresados. */
function fillSettlementSuggestedAmounts(form) {
  if (!form) return;
  const employeeId = String(form.querySelector("[name='employeeId']")?.value || "");
  const employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === employeeId);
  if (!employee) {
    notify(userMessage("contractPickEmployee"), "error");
    return;
  }
  const base = parseNum(employee.baseSalary);
  const days360 = parseNum(form.querySelector("[name='days360Year']")?.value);
  const primaPropDays = parseNum(form.querySelector("[name='primaPropDays']")?.value);
  const vacationDays = parseNum(form.querySelector("[name='vacationDays']")?.value);
  const lines = calcColombiaTerminationLines({ baseSalary: base, days360Year: days360, primaPropDays, vacationDays });
  const c = form.querySelector("[name='cesantiasCop']");
  const i = form.querySelector("[name='interesesCesantiasCop']");
  const p = form.querySelector("[name='primaPropCop']");
  const v = form.querySelector("[name='vacacionesCop']");
  if (c) c.value = String(lines.cesantias);
  if (i) i.value = String(lines.interesesCesantias);
  if (p) p.value = String(lines.primaProporcional);
  if (v) v.value = String(lines.vacaciones);
}

/**
 * Rubros de devengo de la liquidación mensual como arreglo (incluye auxilio según ficha del empleado).
 * Se persiste en `devengosLines` y dentro de `noveltiesDetail` para columnas JSON en servidor.
 */
function buildPayrollMensualDevengosLines({
  baseSalary,
  extras,
  aux,
  bonus,
  travelAllowance,
  fuelReimbursement,
  primaServiciosCop,
  interesesCesantiasCop,
  empleadoAuxilioTransporteMensualCop,
  incapacityEpisodes
}) {
  const bs = Math.max(0, parseNum(baseSalary));
  const ex = Math.max(0, parseNum(extras));
  const au = Math.max(0, parseNum(aux));
  const bo = Math.max(0, parseNum(bonus));
  const via = Math.max(0, parseNum(travelAllowance));
  const comb = Math.max(0, parseNum(fuelReimbursement));
  const prima = Math.max(0, parseNum(primaServiciosCop));
  const intCe = Math.max(0, parseNum(interesesCesantiasCop));
  const refAux = Math.max(0, parseNum(empleadoAuxilioTransporteMensualCop));
  const lines = [
    { code: "SALARIO_ORDINARIO", label: "Salario básico mensual (ordinario)", amount: bs },
    {
      code: "AUXILIO_TRANSPORTE",
      label: "Auxilio legal de transporte (no constitutivo de salario)",
      amount: au,
      empleadoAuxilioMensualRefCop: refAux > 0 ? refAux : null
    }
  ];
  if (ex > 0) lines.push({ code: "EXTRAS", label: "Horas extras, dominicales o recargos nocturnos", amount: ex });
  if (bo > 0) lines.push({ code: "BONIFICACIONES", label: "Bonificaciones y pagos ocasionales gravables", amount: bo });
  if (via > 0) lines.push({ code: "VIATICOS", label: "Viáticos y anticipos de viaje (reintegro)", amount: via });
  if (comb > 0) lines.push({ code: "REEMBOLSO_COMBUSTIBLE", label: "Reembolso combustible y gastos de ruta", amount: comb });
  if (prima > 0) lines.push({ code: "PRIMA_SERVICIOS", label: "Prima de servicios (CST)", amount: prima });
  if (intCe > 0) lines.push({ code: "INT_CESANTIAS", label: "Intereses sobre cesantías (Ley 52/1975)", amount: intCe });
  const incapEp = Array.isArray(incapacityEpisodes) ? incapacityEpisodes : [];
  incapEp.forEach((ep, i) => {
    const amt = Math.round(parseNum(ep.adjustCop));
    lines.push({
      code: `INCAPACIDAD_EP_${i}`,
      label: `${String(ep.label || "Incapacidad")} · ${ep.days ?? "—"} días liq. · ${String(ep.rangeLabel || "")}`,
      amount: amt,
      incapacityNote: ep.note ? String(ep.note) : ""
    });
  });
  return lines;
}

function resolvePayrollDevengosLines(run) {
  if (!run || typeof run !== "object") return null;
  if (Array.isArray(run.devengosLines) && run.devengosLines.length) return run.devengosLines;
  const nv = run.noveltiesDetail;
  if (nv && typeof nv === "object" && Array.isArray(nv.devengosLines) && nv.devengosLines.length) return nv.devengosLines;
  return null;
}

/**
 * Fecha local mediodía (alineado a cortes de mes del portal).
 */
function payrollDateAtNoonLocal(y, m0, d) {
  return new Date(y, m0, d, 12, 0, 0, 0);
}

function payrollParseLocalYmd(raw) {
  const s = String(raw || "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  const dt = payrollDateAtNoonLocal(y, mo, da);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function payrollInclusiveCalendarDaysLocal(a, b) {
  const msDay = 86400000;
  const n = Math.floor((b.getTime() - a.getTime()) / msDay) + 1;
  return n > 0 ? n : 0;
}

function payrollInclusiveBusinessDaysLocal(a, b) {
  if (!a || !b || !(a instanceof Date) || !(b instanceof Date)) return 0;
  let total = 0;
  let cur = payrollDateAtNoonLocal(a.getFullYear(), a.getMonth(), a.getDate());
  const end = payrollDateAtNoonLocal(b.getFullYear(), b.getMonth(), b.getDate());
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) total += 1;
    cur = payrollDateAtNoonLocal(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
  }
  return total;
}

function payrollMaxDateLocal(a, b) {
  return a >= b ? a : b;
}

function payrollMinDateLocal(a, b) {
  return a <= b ? a : b;
}

function payrollOverlapInclusiveLocal(aStart, aEnd, bStart, bEnd) {
  const s = payrollMaxDateLocal(aStart, bStart);
  const e = payrollMinDateLocal(aEnd, bEnd);
  if (s > e) return null;
  return { s, e };
}

function payrollFmtYmdLocal(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function payrollNormalizeAbsenceTypeKey(absenceType) {
  const t = String(absenceType || "").trim().toLowerCase();
  if (!t) return "";
  if (t.includes("vacac")) return "vacaciones";
  if (t.includes("arl")) return "incapacidad_arl";
  if (t.includes("incapaci") || t === "eps") return "incapacidad_eps";
  if (t.includes("matern")) return "licencia_maternidad";
  if (t.includes("patern")) return "licencia_paternidad";
  if (t.includes("luto") || t.includes("duelo")) return "licencia_luto";
  if (t.includes("calam")) return "calamidad_domestica";
  if ((t.includes("cita") && t.includes("med")) || t.includes("medic")) return "permiso_cita_medica";
  if (t.includes("judic")) return "permiso_citacion_judicial";
  if (t.includes("sufrag") || t.includes("vot")) return "permiso_sufragio";
  if (t.includes("sin goce") || t.includes("no remuner") || t.includes("no_remuner")) return "licencia_no_remunerada";
  if (t === "incapacidad") return "incapacidad_eps";
  if (t === "licencia") return "licencia_remunerada";
  if (t === "calamidad") return "calamidad_domestica";
  return t;
}

const PAYROLL_ABSENCE_LEGAL_LIMITS = {
  maternidadOrdinariaDays: 126,
  maternidadMultipleDays: 140,
  maternidadPrematuroMaxDays: 140,
  maternidadExtensionMedicaMaxDays: 182,
  paternidadDays: 14,
  paternidadParentalCompartidaDays: 7,
  lutoMaxBusinessDays: 5
};

function payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype) {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const raw = String(absenceSubtype || "").trim().toLowerCase();
  if (!raw) return "";
  if (typeKey === "permiso_sufragio") {
    if (raw.includes("jurad")) return "jurado";
    if (raw.includes("votan") || raw.includes("sufrag")) return "votante";
    return "";
  }
  if (typeKey === "licencia_maternidad") {
    if (raw.includes("multi")) return "parto_multiple";
    if (raw.includes("prematur") || raw.includes("prematuro")) return "parto_prematuro";
    if (raw.includes("adopc")) return "adopcion";
    if (raw.includes("extension") || raw.includes("medica") || raw.includes("complic")) return "extension_medica";
    if (raw.includes("ordin")) return "ordinaria";
    return ["ordinaria", "parto_multiple", "parto_prematuro", "adopcion", "extension_medica"].includes(raw) ? raw : "";
  }
  if (typeKey === "licencia_paternidad") {
    if (raw.includes("flex")) return "flexible";
    if (raw.includes("parental") || raw.includes("compart")) return "parental_compartida";
    if (raw.includes("contin")) return "continua";
    return ["continua", "flexible", "parental_compartida"].includes(raw) ? raw : "";
  }
  return "";
}

function payrollGetAbsenceSubtypeOptions(absenceType) {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  if (typeKey === "permiso_sufragio") {
    return [
      { value: "votante", label: "Votante (medio día compensatorio)" },
      { value: "jurado", label: "Jurado de votación (1 día compensatorio)" }
    ];
  }
  if (typeKey === "licencia_maternidad") {
    return [
      { value: "ordinaria", label: "Ordinaria (18 semanas / 126 días)" },
      { value: "parto_multiple", label: "Parto múltiple (+2 semanas / 140 días)" },
      { value: "parto_prematuro", label: "Parto prematuro (completar 18 semanas)" },
      { value: "adopcion", label: "Adopción o acogimiento (18 semanas)" },
      { value: "extension_medica", label: "Extensión médica por complicaciones" }
    ];
  }
  if (typeKey === "licencia_paternidad") {
    return [
      { value: "continua", label: "Continua (hasta 14 días calendario)" },
      { value: "flexible", label: "Flexible (jornadas parciales dentro del mes)" },
      { value: "parental_compartida", label: "Parental compartida (hasta 7 días cedidos)" }
    ];
  }
  return [];
}

function payrollAbsenceRequiresSubtype(absenceType) {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  return typeKey === "permiso_sufragio" || typeKey === "licencia_maternidad" || typeKey === "licencia_paternidad";
}

function payrollGetAbsenceMaternityMaxDays(subtype) {
  const norm = String(subtype || "").trim().toLowerCase();
  if (norm === "parto_multiple") return PAYROLL_ABSENCE_LEGAL_LIMITS.maternidadMultipleDays;
  if (norm === "parto_prematuro") return PAYROLL_ABSENCE_LEGAL_LIMITS.maternidadPrematuroMaxDays;
  if (norm === "extension_medica") return PAYROLL_ABSENCE_LEGAL_LIMITS.maternidadExtensionMedicaMaxDays;
  return PAYROLL_ABSENCE_LEGAL_LIMITS.maternidadOrdinariaDays;
}

function payrollGetAbsencePaternityMaxDays(subtype) {
  const norm = String(subtype || "").trim().toLowerCase();
  if (norm === "parental_compartida") return PAYROLL_ABSENCE_LEGAL_LIMITS.paternidadParentalCompartidaDays;
  return PAYROLL_ABSENCE_LEGAL_LIMITS.paternidadDays;
}

function payrollGetAbsenceSupportRules(absenceType, absenceSubtype = "") {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  const base = {
    requiresSupportNumber: false,
    requiresEntity: false,
    requiresNotes: false,
    suggestedEntity: "",
    supportHint: "Opcional: radicado, acta, certificado o soporte documental.",
    entityHint: "Indique EPS, ARL u otra entidad cuando aplique."
  };
  if (typeKey === "incapacidad_eps") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresEntity: true,
      supportHint: "Obligatorio: número de incapacidad o radicado EPS.",
      entityHint: "Obligatorio: EPS que expide la incapacidad."
    };
  }
  if (typeKey === "incapacidad_arl") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresEntity: true,
      suggestedEntity: "ARL",
      supportHint: "Obligatorio: radicado o número de reporte ARL.",
      entityHint: "Obligatorio: ARL."
    };
  }
  if (typeKey === "licencia_maternidad") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresNotes: subtype === "parto_prematuro" || subtype === "extension_medica",
      supportHint: "Obligatorio: certificado médico, prenatal o acta de nacimiento según el caso.",
      entityHint: "Recomendado: EPS o entidad de salud."
    };
  }
  if (typeKey === "licencia_paternidad") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresNotes: subtype === "flexible" || subtype === "parental_compartida",
      supportHint: "Obligatorio: registro civil del recién nacido o soporte equivalente.",
      entityHint: "Opcional: entidad de salud o registraduría."
    };
  }
  if (typeKey === "licencia_luto") {
    return {
      ...base,
      requiresSupportNumber: true,
      supportHint: "Obligatorio: acta de defunción o certificado equivalente."
    };
  }
  if (typeKey === "calamidad_domestica") {
    return {
      ...base,
      requiresNotes: true,
      supportHint: "Recomendado: soporte que acredite la calamidad.",
      entityHint: "Opcional."
    };
  }
  if (typeKey === "permiso_cita_medica") {
    return {
      ...base,
      requiresSupportNumber: true,
      supportHint: "Obligatorio: orden médica, cita o constancia de asistencia."
    };
  }
  if (typeKey === "permiso_citacion_judicial") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresEntity: true,
      suggestedEntity: "Juzgado",
      supportHint: "Obligatorio: número de citación o acta judicial.",
      entityHint: "Obligatorio: juzgado o autoridad."
    };
  }
  if (typeKey === "permiso_sufragio") {
    return {
      ...base,
      suggestedEntity: "Registraduría",
      supportHint: "Recomendado: certificado de jurado o constancia electoral."
    };
  }
  if (typeKey === "licencia_no_remunerada") {
    return {
      ...base,
      requiresNotes: true,
      supportHint: "Recomendado: acto o comunicación del empleador.",
      entityHint: "Opcional."
    };
  }
  return base;
}

function payrollAbsenceSubtypeLabel(absenceType, absenceSubtype) {
  const norm = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  const option = payrollGetAbsenceSubtypeOptions(absenceType).find((item) => item.value === norm);
  return option ? option.label : "";
}

function payrollGetAbsenceTypeMeta(absenceType, absenceSubtype = "") {
  const raw = String(absenceType || "").trim();
  const key = payrollNormalizeAbsenceTypeKey(raw);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  const catalog = {
    vacaciones: {
      label: "Vacaciones",
      optionLabel: "Vacaciones remuneradas",
      conceptLabel: "Días hábiles en Vacaciones",
      quantityKind: "business"
    },
    incapacidad_eps: {
      label: "Incapacidad EPS",
      optionLabel: "Incapacidad por enfermedad general (EPS)",
      conceptLabel: "Días calendario en Incapacidad EPS",
      quantityKind: "calendar"
    },
    incapacidad_arl: {
      label: "Incapacidad ARL",
      optionLabel: "Incapacidad por accidente o enfermedad laboral (ARL)",
      conceptLabel: "Días calendario en Incapacidad ARL",
      quantityKind: "calendar"
    },
    licencia_maternidad: {
      label: "Licencia de maternidad",
      optionLabel: "Licencia de maternidad",
      conceptLabel:
        subtype === "parto_multiple"
          ? "Días calendario de licencia de maternidad por parto múltiple"
          : subtype === "parto_prematuro"
            ? "Días calendario de licencia de maternidad por parto prematuro"
            : subtype === "adopcion"
              ? "Días calendario de licencia de maternidad por adopción"
              : subtype === "extension_medica"
                ? "Días calendario de extensión médica de maternidad"
                : "Días calendario de licencia de maternidad",
      quantityKind: "calendar"
    },
    licencia_paternidad: {
      label: "Licencia de paternidad",
      optionLabel: "Licencia de paternidad",
      conceptLabel:
        subtype === "flexible"
          ? "Jornadas de licencia de paternidad flexible"
          : subtype === "parental_compartida"
            ? "Días calendario de licencia parental compartida"
            : "Días calendario de licencia de paternidad",
      quantityKind: "calendar"
    },
    licencia_luto: {
      label: "Licencia por luto",
      optionLabel: "Licencia por luto",
      conceptLabel: "Días hábiles de licencia por luto",
      quantityKind: "business"
    },
    calamidad_domestica: {
      label: "Calamidad doméstica",
      optionLabel: "Licencia por grave calamidad doméstica",
      conceptLabel: "Días de calamidad doméstica",
      quantityKind: "calendar"
    },
    permiso_cita_medica: {
      label: "Permiso cita médica",
      optionLabel: "Permiso por cita médica o atención en salud",
      conceptLabel: "Días hábiles por cita médica",
      quantityKind: "business"
    },
    permiso_citacion_judicial: {
      label: "Permiso citación judicial",
      optionLabel: "Permiso por citación judicial o deber legal",
      conceptLabel: "Días hábiles por citación judicial",
      quantityKind: "business"
    },
    permiso_sufragio: {
      label: "Permiso por sufragio",
      optionLabel: "Permiso por sufragio / jornada electoral",
      conceptLabel:
        subtype === "jurado"
          ? "Día compensatorio por jurado de votación"
          : "Permiso compensatorio por sufragio",
      quantityKind: "recognized"
    },
    licencia_remunerada: {
      label: "Licencia remunerada",
      optionLabel: "Otra licencia o permiso remunerado",
      conceptLabel: "Días de licencia remunerada",
      quantityKind: "calendar"
    },
    licencia_no_remunerada: {
      label: "Licencia no remunerada",
      optionLabel: "Licencia no remunerada / suspensión autorizada",
      conceptLabel: "Días de licencia no remunerada",
      quantityKind: "calendar"
    }
  };
  const meta = catalog[key];
  if (meta) return { key, ...meta };
  return {
    key,
    label: raw || "Ausentismo",
    optionLabel: raw || "Ausentismo",
    conceptLabel: "Días de ausentismo registrados",
    quantityKind: "calendar"
  };
}

function payrollAbsenceTypeLabel(absenceType) {
  return payrollGetAbsenceTypeMeta(absenceType).label;
}

function payrollAbsenceConceptForSlip(absenceType, absenceSubtype = "") {
  const meta = payrollGetAbsenceTypeMeta(absenceType, absenceSubtype);
  return {
    typeLabel: meta.label,
    conceptLabel: meta.conceptLabel,
    quantityKind: meta.quantityKind
  };
}

function payrollAbsenceSelectOptions() {
  return [
    "vacaciones",
    "incapacidad_eps",
    "incapacidad_arl",
    "licencia_maternidad",
    "licencia_paternidad",
    "licencia_luto",
    "calamidad_domestica",
    "permiso_cita_medica",
    "permiso_citacion_judicial",
    "permiso_sufragio",
    "licencia_remunerada",
    "licencia_no_remunerada"
  ].map((value) => ({
    value,
    label: payrollGetAbsenceTypeMeta(value).optionLabel
  }));
}

function buildPayrollAbsenceTypeOptionsHtml(selectedValue = "") {
  const normalizedSelected = payrollNormalizeAbsenceTypeKey(selectedValue);
  return payrollAbsenceSelectOptions()
    .map((opt) => `<option value="${escapeAttr(opt.value)}"${opt.value === normalizedSelected ? " selected" : ""}>${escapeHtml(opt.label)}</option>`)
    .join("");
}

function buildPayrollAbsenceSubtypeOptionsHtml(absenceType, selectedValue = "") {
  const normalizedSelected = payrollNormalizeAbsenceSubtype(absenceType, selectedValue);
  const options = payrollGetAbsenceSubtypeOptions(absenceType);
  if (!options.length) return `<option value="">No aplica</option>`;
  return options
    .map((opt) => `<option value="${escapeAttr(opt.value)}"${opt.value === normalizedSelected ? " selected" : ""}>${escapeHtml(opt.label)}</option>`)
    .join("");
}

function payrollAbsenceIsIncapacityType(absenceType) {
  const key = payrollNormalizeAbsenceTypeKey(absenceType);
  return key === "incapacidad_eps" || key === "incapacidad_arl";
}

function payrollAbsenceRecognizedUnit(absenceType, absenceSubtype = "") {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  if (typeKey === "permiso_sufragio") return "jornada";
  const meta = payrollGetAbsenceTypeMeta(absenceType, absenceSubtype);
  return meta.quantityKind === "business" ? "habil" : "calendario";
}

function payrollComputeAbsenceSuggestedRecognizedDays({ absenceType, absenceSubtype, startDate, endDate }) {
  const abStart = payrollParseLocalYmd(startDate);
  const abEnd = payrollParseLocalYmd(endDate) || abStart;
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  if (typeKey === "permiso_sufragio") {
    return subtype === "jurado" ? 1 : 0.5;
  }
  if (!abStart || !abEnd) return 1;
  if (typeKey === "licencia_luto") {
    return Math.min(PAYROLL_ABSENCE_LEGAL_LIMITS.lutoMaxBusinessDays, payrollInclusiveBusinessDaysLocal(abStart, abEnd));
  }
  if (typeKey === "licencia_maternidad") {
    const maxDays = payrollGetAbsenceMaternityMaxDays(subtype || "ordinaria");
    return Math.min(maxDays, payrollInclusiveCalendarDaysLocal(abStart, abEnd));
  }
  if (typeKey === "licencia_paternidad") {
    const maxDays = payrollGetAbsencePaternityMaxDays(subtype || "continua");
    return Math.min(maxDays, payrollInclusiveCalendarDaysLocal(abStart, abEnd));
  }
  return payrollAbsenceRecognizedUnit(absenceType, absenceSubtype) === "habil"
    ? payrollInclusiveBusinessDaysLocal(abStart, abEnd)
    : payrollInclusiveCalendarDaysLocal(abStart, abEnd);
}

function payrollAbsenceLegalHint(absenceType, absenceSubtype = "") {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  if (typeKey === "permiso_sufragio") {
    return subtype === "jurado"
      ? "Regla legal aplicada: jurado de votación = 1 jornada compensatoria."
      : "Regla legal aplicada: sufragante = 0,5 jornada compensatoria.";
  }
  if (typeKey === "licencia_luto") {
    return "Regla legal aplicada: máximo 5 días hábiles de licencia por luto.";
  }
  if (typeKey === "licencia_maternidad") {
    const maxDays = payrollGetAbsenceMaternityMaxDays(subtype || "ordinaria");
    const labels = {
      ordinaria: "18 semanas (126 días calendario)",
      parto_multiple: "20 semanas (140 días calendario)",
      parto_prematuro: "completar 18 semanas desde la fecha probable de parto",
      adopcion: "18 semanas desde la entrega del menor",
      extension_medica: "extensión médica con soporte clínico"
    };
    return `Referencia legal: ${labels[subtype] || labels.ordinaria}; tope parametrizado ${maxDays} días.`;
  }
  if (typeKey === "licencia_paternidad") {
    if (subtype === "parental_compartida") {
      return "Regla legal aplicada: hasta 7 días calendario cedidos desde la licencia de maternidad.";
    }
    if (subtype === "flexible") {
      return "Regla legal aplicada: hasta 14 días calendario, tomables en jornadas parciales dentro del primer mes.";
    }
    return "Regla legal aplicada: hasta 14 días calendario de licencia de paternidad.";
  }
  const supportRules = payrollGetAbsenceSupportRules(absenceType, absenceSubtype);
  if (supportRules.requiresSupportNumber || supportRules.requiresNotes) {
    return "Revise los soportes obligatorios indicados abajo.";
  }
  return "";
}

function payrollValidateAbsenceLegalRules({
  absenceType,
  absenceSubtype,
  startDate,
  endDate,
  recognizedDays,
  supportNumber = "",
  epsEntity = "",
  notes = ""
}) {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  const start = payrollParseLocalYmd(startDate);
  const end = payrollParseLocalYmd(endDate) || start;
  const recognized = Number(parseNum(recognizedDays));
  const support = String(supportNumber || "").trim();
  const entity = String(epsEntity || "").trim();
  const obs = String(notes || "").trim();
  if (!start || !end || !Number.isFinite(recognized) || recognized <= 0) {
    return { ok: false, message: "Complete fechas válidas y días reconocidos mayores a cero." };
  }
  if (payrollAbsenceRequiresSubtype(absenceType) && !subtype) {
    const labels = {
      permiso_sufragio: "En permiso por sufragio debe indicar si fue votante o jurado de votación.",
      licencia_maternidad: "En licencia de maternidad debe seleccionar el subtipo aplicable.",
      licencia_paternidad: "En licencia de paternidad debe seleccionar continua, flexible o parental compartida."
    };
    return { ok: false, message: labels[typeKey] || "Debe seleccionar un subtipo válido." };
  }
  const businessDays = payrollInclusiveBusinessDaysLocal(start, end);
  const calendarDays = payrollInclusiveCalendarDaysLocal(start, end);
  const supportRules = payrollGetAbsenceSupportRules(absenceType, subtype);
  if (supportRules.requiresSupportNumber && !support) {
    return { ok: false, message: "Debe registrar el número de soporte o radicado para este tipo de ausencia." };
  }
  if (supportRules.requiresEntity && !entity) {
    return { ok: false, message: "Debe indicar la entidad (EPS, ARL, juzgado u otra) para este tipo de ausencia." };
  }
  if (supportRules.requiresNotes && !obs) {
    return { ok: false, message: "Debe registrar observaciones que expliquen el caso y el soporte legal." };
  }
  if (typeKey === "permiso_sufragio") {
    const expected = subtype === "jurado" ? 1 : 0.5;
    if (Math.abs(recognized - expected) > 0.001) {
      return {
        ok: false,
        message: subtype === "jurado" ? "Jurado de votación reconoce 1 jornada." : "Sufragante reconoce 0,5 jornada."
      };
    }
  }
  if (typeKey === "licencia_luto" && (recognized > PAYROLL_ABSENCE_LEGAL_LIMITS.lutoMaxBusinessDays || businessDays > PAYROLL_ABSENCE_LEGAL_LIMITS.lutoMaxBusinessDays)) {
    return { ok: false, message: "La licencia por luto no puede exceder 5 días hábiles en esta parametrización." };
  }
  if (typeKey === "licencia_maternidad") {
    const maxDays = payrollGetAbsenceMaternityMaxDays(subtype);
    if (recognized > maxDays || calendarDays > maxDays) {
      return {
        ok: false,
        message: `La licencia de maternidad (${payrollAbsenceSubtypeLabel(absenceType, subtype) || "subtipo seleccionado"}) no puede exceder ${maxDays} días calendario.`
      };
    }
  }
  if (typeKey === "licencia_paternidad") {
    const maxDays = payrollGetAbsencePaternityMaxDays(subtype);
    if (recognized > maxDays || calendarDays > maxDays) {
      const label = subtype === "parental_compartida" ? "licencia parental compartida" : "licencia de paternidad";
      return { ok: false, message: `La ${label} no puede exceder ${maxDays} días calendario en esta parametrización.` };
    }
    if (subtype === "flexible" && Math.abs(recognized * 2 - Math.round(recognized * 2)) > 0.001) {
      return { ok: false, message: "En paternidad flexible los días reconocidos deben ser múltiplos de 0,5 jornada." };
    }
  }
  if (typeKey === "vacaciones" && recognized > businessDays) {
    return { ok: false, message: "En vacaciones los días reconocidos no pueden superar los días hábiles del periodo." };
  }
  if ((typeKey === "incapacidad_eps" || typeKey === "incapacidad_arl") && recognized > calendarDays) {
    return { ok: false, message: "En incapacidades los días reconocidos no pueden superar los días calendario del periodo." };
  }
  return { ok: true, message: "" };
}

function payrollFormatAbsenceQuantity(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "0";
  return num.toLocaleString("es-CO", {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 1,
    maximumFractionDigits: 2
  });
}

function wireHrAbsenceFormBehavior(form) {
  if (!form || form.dataset.hrAbsenceBehaviorBound === "1") return;
  form.dataset.hrAbsenceBehaviorBound = "1";
  const typeEl = form.querySelector('[name="absenceType"]');
  const subtypeWrap =
    form.querySelector("[data-absence-subtype-wrap]") ||
    (subtypeEl?.closest("label") ?? null);
  const subtypeEl = form.querySelector('[name="absenceSubtype"]');
  const startEl = form.querySelector('[name="startDate"]');
  const endEl = form.querySelector('[name="endDate"]');
  const recognizedEl = form.querySelector('[name="recognizedDays"]');
  const supportEl = form.querySelector('[name="supportNumber"]');
  const entityEl = form.querySelector('[name="epsEntity"]');
  const notesEl = form.querySelector('[name="notes"]');
  const hintEl = form.querySelector("[data-absence-recognition-hint]");
  const supportHintEl = form.querySelector("[data-absence-support-hint]");
  if (!typeEl || !subtypeEl || !recognizedEl) return;

  const sync = () => {
    subtypeEl.innerHTML = buildPayrollAbsenceSubtypeOptionsHtml(typeEl.value, subtypeEl.value);
    const showSubtype = payrollGetAbsenceSubtypeOptions(typeEl.value).length > 0;
    if (subtypeWrap) {
      subtypeWrap.classList.toggle("hidden", !showSubtype);
      subtypeWrap.setAttribute("aria-hidden", showSubtype ? "false" : "true");
    }
    subtypeEl.required = showSubtype;
    if (showSubtype && !subtypeEl.value) {
      const defaultOpts = payrollGetAbsenceSubtypeOptions(typeEl.value);
      if (defaultOpts.length) subtypeEl.value = defaultOpts[0].value;
    }
    if (!showSubtype) subtypeEl.value = "";
    const suggested = payrollComputeAbsenceSuggestedRecognizedDays({
      absenceType: typeEl.value,
      absenceSubtype: subtypeEl.value,
      startDate: startEl?.value,
      endDate: endEl?.value
    });
    if (!recognizedEl.dataset.userEdited || !String(recognizedEl.value || "").trim()) {
      recognizedEl.value = String(suggested);
    }
    if (hintEl) {
      const unit = payrollAbsenceRecognizedUnit(typeEl.value, subtypeEl.value);
      const subtypeLabel = payrollAbsenceSubtypeLabel(typeEl.value, subtypeEl.value);
      const legalHint = payrollAbsenceLegalHint(typeEl.value, subtypeEl.value);
      hintEl.textContent = `Sugerido: ${payrollFormatAbsenceQuantity(suggested)} ${unit === "habil" ? "días hábiles" : unit === "jornada" ? "jornadas" : "días calendario"}${subtypeLabel ? ` · ${subtypeLabel}` : ""}.${legalHint ? ` ${legalHint}` : ""}`;
    }
    const supportRules = payrollGetAbsenceSupportRules(typeEl.value, subtypeEl.value);
    if (supportEl) supportEl.required = !!supportRules.requiresSupportNumber;
    if (entityEl) entityEl.required = !!supportRules.requiresEntity;
    if (notesEl) notesEl.required = !!supportRules.requiresNotes;
    if (entityEl && supportRules.suggestedEntity && !String(entityEl.value || "").trim()) {
      entityEl.value = supportRules.suggestedEntity;
    }
    if (supportHintEl) {
      const parts = [supportRules.supportHint];
      if (supportRules.entityHint) parts.push(supportRules.entityHint);
      if (supportRules.requiresNotes) parts.push("Observaciones obligatorias para este caso.");
      supportHintEl.textContent = parts.filter(Boolean).join(" ");
    }
  };

  typeEl.addEventListener("change", () => {
    delete recognizedEl.dataset.userEdited;
    sync();
  });
  subtypeEl.addEventListener("change", () => {
    delete recognizedEl.dataset.userEdited;
    sync();
  });
  startEl?.addEventListener("change", () => {
    delete recognizedEl.dataset.userEdited;
    sync();
  });
  endEl?.addEventListener("change", () => {
    delete recognizedEl.dataset.userEdited;
    sync();
  });
  recognizedEl.addEventListener("input", () => {
    recognizedEl.dataset.userEdited = "1";
  });
  sync();
}

function payrollMergeAbsenceSlipRows(rows) {
  const acc = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    if (!row || typeof row !== "object") return;
    const quantity = Math.max(0, Number(parseNum(row.quantity)));
    if (quantity <= 0) return;
    const typeLabel = String(row.typeLabel || "Ausentismo").trim() || "Ausentismo";
    const conceptLabel = String(row.conceptLabel || "Días de ausentismo registrados").trim() || "Días de ausentismo registrados";
    const key = `${typeLabel}__${conceptLabel}`;
    const prev = acc.get(key);
    if (prev) {
      prev.quantity = Math.round((prev.quantity + quantity) * 100) / 100;
    } else {
      acc.set(key, { typeLabel, conceptLabel, quantity });
    }
  });
  return Array.from(acc.values()).sort((a, b) =>
    `${a.typeLabel} ${a.conceptLabel}`.localeCompare(`${b.typeLabel} ${b.conceptLabel}`, "es")
  );
}

function payrollResolveRunPeriodBounds(run) {
  if (!run || typeof run !== "object") return null;
  const nv = run.noveltiesDetail;
  const cutStart = payrollParseLocalYmd(nv?.corteNomina?.desde);
  const cutEnd = payrollParseLocalYmd(nv?.corteNomina?.hasta);
  if (cutStart && cutEnd && cutStart <= cutEnd) {
    return { start: cutStart, end: cutEnd };
  }
  const monthBounds = monthRange(run.month);
  if (!monthBounds) return null;
  return { start: monthBounds.start, end: monthBounds.end };
}

function buildPayrollAbsenceSlipRowsForPeriod({ employeeId, periodStart, periodEnd, absencesAll }) {
  if (!employeeId || !periodStart || !periodEnd) return [];
  const rows = [];
  (Array.isArray(absencesAll) ? absencesAll : []).forEach((ab) => {
    if (String(ab?.employeeId || "") !== String(employeeId)) return;
    const abStart = payrollParseLocalYmd(ab?.startDate);
    const abEnd = payrollParseLocalYmd(ab?.endDate) || abStart;
    if (!abStart || !abEnd) return;
    const ov = payrollOverlapInclusiveLocal(abStart, abEnd, periodStart, periodEnd);
    if (!ov) return;
    const concept = payrollAbsenceConceptForSlip(ab?.absenceType || ab?.type, ab?.absenceSubtype || ab?.subtype);
    const recognizedDays = Number(parseNum(ab?.recognizedDays ?? ab?.diasReconocidos ?? 0));
    const recognizedUnit = String(ab?.recognizedUnit || ab?.unidadDiasReconocidos || "").trim().toLowerCase();
    const fullOverlap =
      payrollFmtYmdLocal(ov.s) === payrollFmtYmdLocal(abStart) &&
      payrollFmtYmdLocal(ov.e) === payrollFmtYmdLocal(abEnd);
    const quantity =
      recognizedDays > 0 && (fullOverlap || recognizedUnit === "jornada" || concept.quantityKind === "recognized")
        ? recognizedDays
        : concept.quantityKind === "business"
          ? payrollInclusiveBusinessDaysLocal(ov.s, ov.e)
          : payrollInclusiveCalendarDaysLocal(ov.s, ov.e);
    rows.push({
      typeLabel: concept.typeLabel,
      conceptLabel: concept.conceptLabel,
      quantity
    });
  });
  return payrollMergeAbsenceSlipRows(rows);
}

function resolvePayrollAbsenceSlipRows(run, absencesAll) {
  const bounds = payrollResolveRunPeriodBounds(run);
  if (bounds) {
    const liveRows = buildPayrollAbsenceSlipRowsForPeriod({
      employeeId: run?.employeeId,
      periodStart: bounds.start,
      periodEnd: bounds.end,
      absencesAll
    });
    if (liveRows.length) return liveRows;
  }
  const storedRows = payrollMergeAbsenceSlipRows(run?.noveltiesDetail?.absenceSlipDetail?.rows);
  if (storedRows.length) return storedRows;
  const legacyRows = [];
  const vacations = run?.noveltiesDetail?.vacaciones;
  if (vacations && typeof vacations === "object") {
    Object.values(vacations).forEach((item) => {
      legacyRows.push({
        typeLabel: "Vacaciones",
        conceptLabel: "Días hábiles en Vacaciones",
        quantity: parseNum(item?.dias)
      });
    });
  }
  const adjustments = Array.isArray(run?.noveltiesDetail?.ausenciasAjustes)
    ? run.noveltiesDetail.ausenciasAjustes
    : [];
  adjustments.forEach((item) => {
    const concept = payrollAbsenceConceptForSlip(item?.tipo);
    legacyRows.push({
      typeLabel: concept.typeLabel,
      conceptLabel: concept.conceptLabel,
      quantity: parseNum(item?.dias)
    });
  });
  return payrollMergeAbsenceSlipRows(legacyRows);
}

function buildPayrollAbsenceSummaryText(run, absencesAll) {
  const rows = resolvePayrollAbsenceSlipRows(run, absencesAll);
  return rows.length
    ? rows.map((row) => `${row.typeLabel}: ${payrollFormatAbsenceQuantity(row.quantity)}`).join("; ")
    : "";
}

function payrollRunHasAbsenceDetail(run, absencesAll) {
  return resolvePayrollAbsenceSlipRows(run, absencesAll).length > 0;
}

/**
 * Clasificación incapacidad común (EPS) vs laboral (ARL) según observaciones / tipo.
 * Misma heurística que `classifyAusenciaTipo` en apps/api/src/payroll/colombian-monthly-payroll.ts
 */
function payrollClassifyIncapacityKind(absenceType, observaciones) {
  const t = String(absenceType || "").trim().toLowerCase();
  const obs = String(observaciones || "").trim().toLowerCase();
  if (/\barl\b|origen.?labor|risk|riesgo.?labor/i.test(obs) || t.includes("arl")) {
    return { kind: "incapacidad_arl", label: "Incapacidad origen laboral (ARL)" };
  }
  return { kind: "incapacidad_eps", label: "Incapacidad común (EPS)" };
}

/**
 * Ajuste orientativo al devengo por incapacidades del mes (normativa laboral colombiana, criterio salario÷30).
 * Ver `computeColombiaPayrollForPeriodCut` en API. No sustituye liquidación EPS/ARL ni tablas de porcentajes.
 */
function computePayrollIncapacityColombiaForMonth({ employee, liquidacionMonthYm, absencesAll }) {
  const smmlv = CO_PAYROLL.smmlv;
  const baseSalary = Math.max(0, parseNum(employee?.baseSalary));
  const daily = baseSalary > 0 ? baseSalary / 30 : 0;
  const range = monthRange(liquidacionMonthYm);
  if (!range || daily <= 0) {
    return { adjustCop: 0, episodes: [], smmlv };
  }
  const hire = payrollParseLocalYmd(employee?.startDate);
  const lo = payrollMaxDateLocal(hire || range.start, range.start);
  const hi = range.end;
  if (lo > hi) return { adjustCop: 0, episodes: [], smmlv };

  const absences = (absencesAll || []).filter((a) => String(a.employeeId || "") === String(employee?.id || ""));
  let salarioAjuste = 0;
  const episodes = [];

  for (const ab of absences) {
    const typeKey = payrollNormalizeAbsenceTypeKey(ab.absenceType);
    if (!payrollAbsenceIsIncapacityType(ab.absenceType) && typeKey !== "licencia_no_remunerada") continue;
    const abStart = payrollParseLocalYmd(ab.startDate);
    const abEnd = payrollParseLocalYmd(ab.endDate) || abStart;
    if (!abStart || !abEnd) continue;
    const ov = payrollOverlapInclusiveLocal(abStart, abEnd, lo, hi);
    if (!ov) continue;

    if (typeKey === "licencia_no_remunerada") {
      const days = payrollInclusiveCalendarDaysLocal(ov.s, ov.e);
      const ded = -Math.round(days * daily);
      salarioAjuste += ded;
      episodes.push({
        kind: "licencia_no_remunerada",
        absenceId: ab.id,
        days,
        adjustCop: ded,
        label: payrollAbsenceTypeLabel(ab.absenceType || ab.type),
        rangeLabel: `${payrollFmtYmdLocal(ov.s)} → ${payrollFmtYmdLocal(ov.e)}`,
        note: "Licencia no remunerada: descuento orientativo de salario por días del periodo (salario÷30)."
      });
      continue;
    }

    const obs = [ab.notes, ab.epsEntity, ab.supportNumber].filter(Boolean).join(" · ");
    const cl = payrollClassifyIncapacityKind(ab.absenceType, obs);

    const rad = String(ab.supportNumber || "").trim();
    const baseTypeLabel = payrollAbsenceTypeLabel(ab.absenceType || ab.type);
    const baseLabel = rad ? `${baseTypeLabel} · radicado ${rad}` : baseTypeLabel;

    if (cl.kind === "incapacidad_arl") {
      const days = payrollInclusiveCalendarDaysLocal(ov.s, ov.e);
      const ded = -Math.round(days * daily);
      salarioAjuste += ded;
      episodes.push({
        kind: "arl",
        absenceId: ab.id,
        days,
        adjustCop: ded,
        label: `${cl.label}`,
        rangeLabel: `${payrollFmtYmdLocal(ov.s)} → ${payrollFmtYmdLocal(ov.e)}`,
        note:
          "Incapacidad laboral / ARL: descuento orientativo del salario por días en el periodo (pago a cargo de ARL según calificación). Validar dictamen y resolución."
      });
      continue;
    }

    if (baseSalary > 0 && baseSalary <= smmlv) {
      const days = payrollInclusiveCalendarDaysLocal(ov.s, ov.e);
      episodes.push({
        kind: "eps_smmlv",
        absenceId: ab.id,
        days,
        adjustCop: 0,
        label: baseLabel,
        rangeLabel: `${payrollFmtYmdLocal(ov.s)} → ${payrollFmtYmdLocal(ov.e)}`,
        note:
          "Salario hasta SMMLV: sin ajuste automático en este motor. Verificar pago al trabajador según tablas EPS (100% en etapas iniciales) y soporte médico."
      });
      continue;
    }

    let netIncap = 0;
    const msDay = 86400000;
    for (let cur = ov.s.getTime(); cur <= ov.e.getTime(); cur += msDay) {
      const dt = new Date(cur);
      const idx = payrollInclusiveCalendarDaysLocal(abStart, dt);
      netIncap += -daily + (idx <= 2 ? (daily * 2) / 3 : 0);
    }
    const roundedIncap = Math.round(netIncap);
    salarioAjuste += roundedIncap;
    episodes.push({
      kind: "eps",
      absenceId: ab.id,
      days: payrollInclusiveCalendarDaysLocal(ov.s, ov.e),
      adjustCop: roundedIncap,
      label: baseLabel,
      rangeLabel: `${payrollFmtYmdLocal(ov.s)} → ${payrollFmtYmdLocal(ov.e)}`,
      note:
        "Incapacidad común (EPS): sin salario empresa el día; complemento orientativo de ⅔ del salario diario en los dos primeros días corridos del episodio (Dec. 780/2016 / CST — validar año y liquidación en EPS)."
    });
  }

  return { adjustCop: Math.round(salarioAjuste), episodes, smmlv };
}

function wireMonthlyPayrollConcepts(form) {
  if (!form || form.dataset.monthlyPayrollConceptsBound === "1") return;
  form.dataset.monthlyPayrollConceptsBound = "1";
  const monthEl = form.querySelector('[name="month"]');
  const empEl = form.querySelector('[name="employeeId"]');
  const auxInput = form.querySelector('[name="aux"]');
  if (!monthEl || !empEl) return;

  const syncAuxTransportFromEmployee = () => {
    if (!auxInput || !empEl) return;
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || "").trim());
    if (!emp) {
      auxInput.value = String(CO_HR_RULES.transportAllowance);
      return;
    }
    auxInput.value = String(readEmployeeTransportAllowanceCop(emp));
  };

  const fsP = form.querySelector("#payroll-prima-fieldset");
  const cbP = form.querySelector("#payroll-pay-prima");
  const daysP = form.querySelector('[name="primaServiciosDays"]');
  const copP = form.querySelector('[name="primaServiciosCop"]');

  const fsC = form.querySelector("#payroll-cesantias-int-fieldset");
  const cbC = form.querySelector("#payroll-pay-int-cesantias");
  const baseC = form.querySelector('[name="cesantiasInterestBaseCop"]');
  const daysC = form.querySelector('[name="cesantiasInterestDays"]');
  const copC = form.querySelector('[name="interesesCesantiasCopMonthly"]');

  const applyPrima = () => {
    if (!fsP || !cbP || !daysP || !copP) return;
    const show = payrollMonthIsPrimaSemester(monthEl.value);
    fsP.classList.toggle("hidden", !show);
    fsP.setAttribute("aria-hidden", show ? "false" : "true");
    if (!show) {
      cbP.checked = false;
      daysP.value = "";
      copP.value = "";
      delete copP.dataset.userEdited;
    }
    daysP.disabled = !(show && cbP.checked);
    copP.disabled = !(show && cbP.checked);
  };

  const recalcPrimaCop = () => {
    if (!cbP || !daysP || !copP) return;
    if (!payrollMonthIsPrimaSemester(monthEl.value) || !cbP.checked) return;
    if (copP.dataset.userEdited === "1") return;
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || ""));
    const bs = emp ? parseNum(emp.baseSalary) : 0;
    const d = parseNum(daysP.value);
    if (d > 0) copP.value = String(calcColombiaPrimaServiciosCop(bs, d));
    else copP.value = "";
  };

  const applyCesantias = () => {
    if (!fsC || !cbC || !baseC || !daysC || !copC) return;
    const show = payrollMonthIsCesantiasInterestMonth(monthEl.value);
    fsC.classList.toggle("hidden", !show);
    fsC.setAttribute("aria-hidden", show ? "false" : "true");
    if (!show) {
      cbC.checked = false;
      baseC.value = "";
      daysC.value = "360";
      copC.value = "";
      delete copC.dataset.userEdited;
    }
    baseC.disabled = !(show && cbC.checked);
    daysC.disabled = !(show && cbC.checked);
    copC.disabled = !(show && cbC.checked);
  };

  const recalcInteresesCop = () => {
    if (!cbC || !baseC || !daysC || !copC) return;
    if (!payrollMonthIsCesantiasInterestMonth(monthEl.value) || !cbC.checked) return;
    if (copC.dataset.userEdited === "1") return;
    const base = parseNum(baseC.value);
    const d = parseNum(daysC.value) || 360;
    if (base > 0) copC.value = String(calcColombiaInteresesCesantiasCop(base, d));
    else copC.value = "";
  };

  const onMonthChange = () => {
    applyPrima();
    applyCesantias();
    recalcPrimaCop();
    recalcInteresesCop();
  };

  const quincenaWrap = form.querySelector("#payroll-quincena-wrap");
  const freqHint = form.querySelector("#payroll-freq-hint");
  const conductorHint = form.querySelector("#payroll-conductor-trip-hint");
  const salaryLabel = form.querySelector("#payroll-monthly-base-salary")?.closest("label");
  const submitBtn = form.querySelector("#payroll-submit-btn");
  const syncPayFrequencyUi = () => {
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || "").trim());
    const isDriver = Boolean(emp && employeeIsConductorServiceProvider(emp));
    const freq = normalizePayrollFrequencyJs(emp?.payFrequency);
    const isQuinc = !isDriver && freq === "quincenal";
    if (quincenaWrap) {
      quincenaWrap.classList.toggle("hidden", !isQuinc);
      quincenaWrap.toggleAttribute("hidden", !isQuinc);
      quincenaWrap.setAttribute("aria-hidden", isQuinc ? "false" : "true");
    }
    if (fsP) {
      fsP.classList.toggle("hidden", !emp || isDriver);
      fsP.setAttribute("aria-hidden", !emp || isDriver ? "true" : "false");
    }
    if (fsC) {
      fsC.classList.toggle("hidden", !emp || isDriver);
      fsC.setAttribute("aria-hidden", !emp || isDriver ? "true" : "false");
    }
    if (salaryLabel) {
      salaryLabel.classList.toggle("hidden", isDriver);
      salaryLabel.toggleAttribute("hidden", isDriver);
    }
    form.querySelectorAll("[data-payroll-nomina-only]").forEach((el) => {
      el.classList.toggle("hidden", isDriver);
      el.toggleAttribute("hidden", isDriver);
    });
    if (conductorHint) {
      if (isDriver) {
        conductorHint.classList.remove("hidden");
        conductorHint.textContent = userMessage("payrollConductorTripOnly");
      } else {
        conductorHint.classList.add("hidden");
        conductorHint.textContent = "";
      }
    }
    if (freqHint) {
      if (!emp) {
        freqHint.classList.add("hidden");
        freqHint.textContent = "";
      } else if (isDriver) {
        freqHint.classList.remove("hidden");
        freqHint.textContent =
          "Mes calendario del servicio. Viáticos interdepartamentales y combustible pagado por el conductor se calculan desde viajes y flota.";
      } else {
        freqHint.classList.remove("hidden");
        freqHint.textContent = isQuinc
          ? "Periodicidad quincenal: liquide 1ª o 2ª quincena del mes. Salario y auxilio se prorratean (÷30 × días del corte)."
          : `Periodicidad ${String(emp.payFrequency || "Mensual")}: liquidación del mes calendario completo.`;
      }
    }
    if (submitBtn) {
      const span = submitBtn.querySelector("span");
      const label = isDriver ? "Liquidar viajes del mes" : "Generar liquidación";
      if (span) span.textContent = label;
      else submitBtn.textContent = label;
    }
    if (isQuinc) {
      const qSel = form.querySelector("#payroll-quincena-select");
      const dom = new Date().getDate();
      if (qSel && dom >= 16) qSel.value = "Q2";
    }
  };

  monthEl.addEventListener("change", onMonthChange);
  empEl.addEventListener("change", () => {
    syncPayrollEmployeeSalaryReadonly(form, "payroll-monthly-base-salary");
    syncAuxTransportFromEmployee();
    syncPayFrequencyUi();
    recalcPrimaCop();
    recalcInteresesCop();
  });
  form.querySelector("#payroll-quincena-select")?.addEventListener("change", onMonthChange);
  syncPayrollEmployeeSalaryReadonly(form, "payroll-monthly-base-salary");
  syncAuxTransportFromEmployee();
  syncPayFrequencyUi();

  if (cbP && daysP && copP) {
    cbP.addEventListener("change", applyPrima);
    daysP.addEventListener("input", recalcPrimaCop);
    copP.addEventListener("input", () => {
      copP.dataset.userEdited = parseNum(copP.value) > 0 ? "1" : "";
    });
  }
  if (cbC && baseC && daysC && copC) {
    cbC.addEventListener("change", applyCesantias);
    baseC.addEventListener("input", recalcInteresesCop);
    daysC.addEventListener("input", recalcInteresesCop);
    copC.addEventListener("input", () => {
      copC.dataset.userEdited = parseNum(copC.value) > 0 ? "1" : "";
    });
  }

  onMonthChange();
}

/** Muestra el salario base del empleado en un input de solo lectura (sin `name`, no va en el envío). */
function syncPayrollEmployeeSalaryReadonly(form, inputId) {
  const empSel = form?.querySelector?.('[name="employeeId"]');
  const salEl = form?.querySelector?.(`#${inputId}`);
  if (!salEl) return;
  const id = String(empSel?.value || "").trim();
  const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === id);
  if (!id || !emp) {
    salEl.value = "";
    salEl.placeholder = "Seleccione empleado";
    return;
  }
  const n = parseNum(emp.baseSalary);
  salEl.placeholder = "";
  salEl.value = n > 0 ? `$${n.toLocaleString("es-CO")}` : "Sin salario base registrado";
}

function wireTerminationSettlementForm(form) {
  if (!form || form.dataset.settlementWire === "1") return;
  form.dataset.settlementWire = "1";
  const btn = form.querySelector('[data-action="settlement-recalc"]');
  if (btn) btn.addEventListener("click", () => fillSettlementSuggestedAmounts(form));
  const empSel = form.querySelector('[name="employeeId"]');
  if (empSel) {
    empSel.addEventListener("change", () => syncPayrollEmployeeSalaryReadonly(form, "payroll-settlement-base-salary"));
    syncPayrollEmployeeSalaryReadonly(form, "payroll-settlement-base-salary");
  }
}
const CO_HR_RULES = {
  legalWeeklyHours: 46,
  minMonthlySalary: 1750905,
  transportAllowance: 249095
};
const CO_TRANSPORT_ALLOWANCE_MAX_SMMLV = 2;
/** Salario integral (CST / práctica): referencia mínima habitual 13 SMMLV. */
const CO_INTEGRAL_SALARY_MIN_SMMLV = 13;
const CO_SYSTEM_PARAMS_DEFAULTS = {
  smmlvCop: CO_PAYROLL.smmlv,
  minMonthlySalaryCop: CO_HR_RULES.minMonthlySalary,
  transportAllowanceCop: CO_HR_RULES.transportAllowance,
  legalWeeklyHours: CO_HR_RULES.legalWeeklyHours,
  healthEmployeeRate: CO_PAYROLL.healthEmployeeRate,
  pensionEmployeeRate: CO_PAYROLL.pensionEmployeeRate,
  uvtCop: null,
  activeYear: new Date().getFullYear(),
  referenceMode: "automatic"
};

function applySystemParametersToClientRules(raw) {
  const normalize =
    typeof window.normalizeSystemParametersPayload === "function"
      ? window.normalizeSystemParametersPayload
      : () => null;
  const normalized = normalize(raw);
  if (!normalized) return null;
  CO_PAYROLL.smmlv = normalized.smmlvCop;
  CO_PAYROLL.healthEmployeeRate = normalized.healthEmployeeRate;
  CO_PAYROLL.pensionEmployeeRate = normalized.pensionEmployeeRate;
  CO_HR_RULES.minMonthlySalary = normalized.minMonthlySalaryCop;
  CO_HR_RULES.transportAllowance = normalized.transportAllowanceCop;
  CO_HR_RULES.legalWeeklyHours = normalized.legalWeeklyHours;
  return normalized;
}

function colombiaTransportAllowanceSalaryCapCop() {
  return Math.max(0, parseNum(CO_HR_RULES.minMonthlySalary)) * CO_TRANSPORT_ALLOWANCE_MAX_SMMLV;
}

function colombiaTransportAllowanceEligible(baseSalary) {
  const salary = Math.max(0, parseNum(baseSalary));
  const cap = colombiaTransportAllowanceSalaryCapCop();
  return salary > 0 && cap > 0 && salary <= cap;
}

function suggestedEmployeeTransportAllowanceCop(baseSalary) {
  return colombiaTransportAllowanceEligible(baseSalary) ? CO_HR_RULES.transportAllowance : 0;
}

function resolveEmployeeTransportAllowanceCop(rawTransportAllowance, baseSalary) {
  if (!colombiaTransportAllowanceEligible(baseSalary)) return 0;
  const rawValue = String(rawTransportAllowance ?? "").trim();
  if (!rawValue) return CO_HR_RULES.transportAllowance;
  return Math.max(0, parseNum(rawTransportAllowance));
}

function readEmployeeTransportAllowanceCop(employee) {
  if (!employee) return 0;
  const rawValue = employee.transportAllowance;
  if (rawValue != null && String(rawValue).trim() !== "") {
    return Math.max(0, parseNum(rawValue));
  }
  return suggestedEmployeeTransportAllowanceCop(employee.baseSalary);
}

function readPositionTransportAllowanceCop(position) {
  if (!position) return 0;
  const rawValue = position.transportAllowance;
  if (rawValue != null && String(rawValue).trim() !== "") {
    return Math.max(0, parseNum(rawValue));
  }
  return suggestedEmployeeTransportAllowanceCop(position.baseSalary);
}

function positionSalaryUsesSmmlv(baseSalary) {
  return parseNum(baseSalary) === parseNum(CO_HR_RULES.minMonthlySalary);
}

function colombiaIntegralSalaryFloorCop() {
  return Math.max(0, parseNum(CO_HR_RULES.minMonthlySalary)) * CO_INTEGRAL_SALARY_MIN_SMMLV;
}

function validateColombiaMonthlySalaryCop(salary, label = "Salario") {
  const amount = parseNum(salary);
  const minSalary = CO_HR_RULES.minMonthlySalary;
  if (amount < minSalary) {
    return {
      ok: false,
      message: `${label}: debe ser al menos el SMMLV vigente ($${minSalary.toLocaleString("es-CO")}).`
    };
  }
  return { ok: true, amount };
}

function validateColombiaIntegralSalary(baseSalary, integralSalary) {
  const isIntegral = integralSalary === true || String(integralSalary || "").toLowerCase() === "true";
  if (!isIntegral) return { ok: true };
  const base = parseNum(baseSalary);
  const floor = colombiaIntegralSalaryFloorCop();
  if (base < floor) {
    return {
      ok: false,
      message: `Salario integral: el monto debe ser al menos 13 SMMLV ($${floor.toLocaleString("es-CO")}) según la norma laboral colombiana.`
    };
  }
  return { ok: true };
}

function validateColombiaPositionCompensation(raw = {}) {
  const minCheck = validateColombiaMonthlySalaryCop(raw.baseSalary, "Salario base del cargo");
  if (!minCheck.ok) return minCheck;
  const integralCheck = validateColombiaIntegralSalary(minCheck.amount, raw.integralSalary);
  if (!integralCheck.ok) return integralCheck;
  return {
    ok: true,
    baseSalary: minCheck.amount,
    transportAllowance: resolveEmployeeTransportAllowanceCop(raw.transportAllowance, minCheck.amount)
  };
}

function isVacancyAcceptingApplications(vacancy) {
  if (!vacancy) return false;
  if (String(vacancy.status || "").trim() !== "Publicada") return false;
  const deadline = String(vacancy.deadline || "").trim();
  if (!deadline) return true;
  const parts = deadline.split("-");
  if (parts.length !== 3) return true;
  const endTs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  if (!Number.isFinite(endTs)) return true;
  const today = new Date();
  const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return endTs >= today0;
}

function validateVacancySalaryOffer(salaryOffer, position) {
  const offerCheck = validateColombiaMonthlySalaryCop(salaryOffer, "Salario ofrecido");
  if (!offerCheck.ok) return offerCheck;
  if (position) {
    const catalogSalary = parseNum(position.baseSalary);
    if (catalogSalary > 0 && offerCheck.amount < catalogSalary) {
      return {
        ok: false,
        message: `El salario ofrecido no puede ser inferior al del cargo en catálogo ($${catalogSalary.toLocaleString("es-CO")}).`
      };
    }
  }
  return { ok: true, salaryOffer: offerCheck.amount };
}

function validateWorkerMinimumAge(birthIso, label = "trabajador") {
  const birth = String(birthIso || "").trim().slice(0, 10);
  if (!birth) return { ok: true };
  const ageInfo = portalCandidateAgeFromBirthIso(birth);
  if (ageInfo.age === null) {
    return { ok: false, message: "Indique una fecha de nacimiento válida." };
  }
  if (ageInfo.age < 18) {
    return { ok: false, message: `El ${label} debe ser mayor de 18 años (Código Sustantivo del Trabajo).` };
  }
  return { ok: true };
}

function setFormSelectValue(selectEl, value) {
  if (!selectEl || value == null) return;
  const v = String(value).trim();
  if (!v) return;
  const vLower = v.toLowerCase();
  const match = [...selectEl.options].find((o) => {
    const ov = String(o.value).trim();
    const ot = String(o.textContent || "").trim();
    return (
      ov === v ||
      ot === v ||
      (ov && ov.toLowerCase() === vLower) ||
      (ot && ot.toLowerCase() === vLower)
    );
  });
  if (match) selectEl.value = match.value;
}

/** ¿La opción del `<select>` corresponde al valor guardado? (exacto, etiqueta o sin distinguir mayúsculas). */
function editModalSelectOptionSelected(opt, fieldValue) {
  const fv = String(fieldValue ?? "").trim();
  if (!fv) return false;
  const ov = String(opt.value ?? "").trim();
  const ol = String(opt.label ?? "").trim();
  const fvLower = fv.toLowerCase();
  return (
    ov === fv ||
    ol === fv ||
    (ov && ov.toLowerCase() === fvLower) ||
    (ol && ol.toLowerCase() === fvLower)
  );
}

/**
 * Tras montar un modal CRUD: reaplica valores en selects, fechas y horas
 * (catálogos, BD en mayúsculas, ISO con hora, etc.).
 */
function wireEditModalFieldValues(formEl, fields) {
  if (!formEl || !Array.isArray(fields)) return;
  fields.forEach((f) => {
    if (!f?.name) return;
    if (f.type === "select") {
      const sel = formEl.querySelector(`select[name="${f.name}"]`);
      if (sel && f.value != null && String(f.value).trim() !== "") {
        setFormSelectValue(sel, f.value);
      }
      return;
    }
    if (f.type === "date") {
      const norm = normalizePortalDateYmd(f.value);
      if (norm) setFormDateByName(formEl, f.name, norm);
      return;
    }
    if (f.type === "datetime-local") {
      if (f.value == null || String(f.value).trim() === "") return;
      const raw = String(f.value).trim();
      const local =
        raw.length >= 16 && raw.includes("T") ? raw.slice(0, 16) : String(toInputDate(raw) || "").slice(0, 16);
      if (!local) return;
      const V = window.AntaresValidation;
      const hidden = formEl.querySelector(
        `input[type="hidden"][name="${f.name}"][data-portal-datetime-iso="1"]`
      );
      const wrap = hidden?.closest?.(".portal-datetime-dmy-row");
      if (wrap && V?.portalDatetimeInputSetIso) {
        V.portalDatetimeInputSetIso(wrap, local);
        return;
      }
      const inp = formEl.querySelector(`input[type="datetime-local"][name="${f.name}"]`);
      if (!inp) return;
      inp.value = local;
      V?.mountPortalDatetimeDmyInput?.(inp);
      const mountedWrap = inp.closest?.(".portal-datetime-dmy-row") || inp;
      V?.portalDatetimeInputSetIso?.(mountedWrap, local);
      return;
    }
    if (f.type === "time") {
      const inp = formEl.querySelector(`input[type="time"][name="${f.name}"]`);
      const raw = String(f.value ?? "").trim();
      if (inp && raw) inp.value = raw.length >= 5 ? raw.slice(0, 5) : raw;
    }
  });
}

/**
 * Precarga en el formulario de empleado los datos definidos en el catálogo de cargos (Contratación).
 */
function applyPositionCatalogToEmployeeForm(form, position, options = {}) {
  const hintEl = form?.querySelector?.(options.hintSelector || "#emp-position-catalog-hint");
  if (!form) return false;
  if (!position) {
    if (hintEl) {
      hintEl.textContent =
        "Seleccione un cargo del catálogo para cargar salario, tipo de contrato, jornada, riesgo ARL y auxilio de transporte.";
    }
    const conductorBlock = form.querySelector("#hr-conductor-fields");
    if (conductorBlock) {
      conductorBlock.classList.remove("hidden");
      conductorBlock.removeAttribute("hidden");
    }
    return false;
  }

  const salaryEl = form.querySelector(options.salarySelector || "#emp-base-salary, input[name='baseSalary']");
  const contractEl = form.querySelector(options.contractSelector || "#emp-contract-type, select[name='contractType']");
  const transportEl = form.querySelector(options.auxSelector || "#emp-transport-allowance, input[name='transportAllowance']");
  const arlEl = form.querySelector(options.arlRiskSelector || "select[name='arlRiskLevel']");
  const templateEl = form.querySelector(options.templateSelector || "select[name='contractTemplateKind']");
  const scheduleEl = form.querySelector(options.scheduleSelector || "#emp-work-schedule, input[name='workSchedule']");

  const contractType = String(position.contractTypeDefault || "Termino indefinido").trim();
  const wr = String(position.workerRole || "empleado").toLowerCase();
  const schedule = String(position.workSchedule || position.schedule || "").trim();

  if (salaryEl) salaryEl.value = String(parseNum(position.baseSalary));
  if (contractEl) setFormSelectValue(contractEl, contractType);
  if (transportEl) {
    transportEl.value = String(readPositionTransportAllowanceCop(position));
    delete transportEl.dataset.userEdited;
  }
  if (arlEl && position.arlRiskLevel) setFormSelectValue(arlEl, position.arlRiskLevel);
  if (scheduleEl) scheduleEl.value = schedule;
  if (templateEl && window.RecruitmentDomain?.inferTemplateKind) {
    templateEl.value = window.RecruitmentDomain.inferTemplateKind(contractType, wr);
  }

  const conductorBlock = form.querySelector("#hr-conductor-fields");
  if (conductorBlock) {
    const isDriver = wr === "conductor";
    conductorBlock.classList.toggle("hidden", !isDriver);
    if (isDriver) conductorBlock.removeAttribute("hidden");
    else conductorBlock.setAttribute("hidden", "hidden");
    conductorBlock.querySelectorAll("input, select").forEach((inp) => {
      const name = String(inp.getAttribute("name") || "");
      if (!name) return;
      if (isDriver && ["license", "licenseCategory", "licenseExpiry"].includes(name)) {
        inp.setAttribute("required", "required");
      } else if (["license", "licenseCategory", "licenseExpiry"].includes(name)) {
        inp.removeAttribute("required");
      }
    });
  }

  if (hintEl) {
    const integral =
      position.integralSalary === true || String(position.integralSalary).toLowerCase() === "true";
    const bits = [
      `Cargo: ${String(position.name || "").trim()}`,
      wr === "conductor" ? "Conductor" : "Empleado",
      contractType ? `Contrato: ${contractType}` : "",
      schedule ? `Jornada: ${schedule}` : "",
      integral ? "Salario integral (catálogo)" : "",
      `Salario $${parseNum(position.baseSalary).toLocaleString("es-CO")}`,
      `Auxilio $${readPositionTransportAllowanceCop(position).toLocaleString("es-CO")}`
    ].filter(Boolean);
    hintEl.textContent = `${bits.join(" · ")}. Puede ajustar salario o auxilio si el pacto lo exige.`;
  }

  if (typeof options.onAfterApply === "function") options.onAfterApply(position);
  return true;
}

function bindPositionCompensationFields(form, config = {}) {
  const basisSelect = form?.querySelector?.(config.basisSelector || 'select[name="salaryBasis"]');
  const salaryInput = form?.querySelector?.(config.salarySelector || 'input[name="baseSalary"]');
  const minSalary = CO_HR_RULES.minMonthlySalary;
  const transportRule = bindEmployeeTransportAllowanceRule(form, {
    salarySelector: config.salarySelector || 'input[name="baseSalary"]',
    auxSelector: config.auxSelector || 'input[name="transportAllowance"]',
    hintSelector: config.hintSelector || "#position-legal-comp-hint",
    preserveExistingValue: Boolean(config.preserveExistingValue)
  });
  if (!basisSelect || !salaryInput) return { sync: transportRule.sync };
  const syncBasis = () => {
    const isSmmlv = String(basisSelect.value || "smmlv") === "smmlv";
    if (isSmmlv) {
      salaryInput.value = String(minSalary);
      salaryInput.readOnly = true;
      salaryInput.setAttribute("readonly", "readonly");
    } else {
      salaryInput.readOnly = false;
      salaryInput.removeAttribute("readonly");
      if (parseNum(salaryInput.value) < minSalary) salaryInput.value = String(minSalary);
    }
    transportRule.sync({ force: isSmmlv });
  };
  basisSelect.addEventListener("change", syncBasis);
  salaryInput.addEventListener("input", () => {
    if (String(basisSelect.value || "") === "custom") transportRule.sync();
  });
  syncBasis();
  return {
    sync: ({ force = false } = {}) => {
      syncBasis();
      transportRule.sync({ force });
    }
  };
}

const LABOR_SYSTEM_PARAMETERS_MIN_YEAR = 2020;
const LABOR_SYSTEM_PARAMETERS_MAX_YEAR = 2035;

function clampLaborSystemParameterYear(yearLike) {
  const y = Math.trunc(Number(yearLike) || new Date().getFullYear());
  return Math.min(LABOR_SYSTEM_PARAMETERS_MAX_YEAR, Math.max(LABOR_SYSTEM_PARAMETERS_MIN_YEAR, y));
}

function employeeTransportAllowanceGuidance(baseSalary) {
  const legalAux = parseNum(CO_HR_RULES.transportAllowance).toLocaleString("es-CO");
  const cap = colombiaTransportAllowanceSalaryCapCop().toLocaleString("es-CO");
  const activeParams =
    (typeof window.normalizeSystemParametersPayload === "function"
      ? window.normalizeSystemParametersPayload(read(KEYS.systemParameters, null))
      : null) || CO_SYSTEM_PARAMS_DEFAULTS;
  const activeYear = clampLaborSystemParameterYear(activeParams.activeYear);
  if (colombiaTransportAllowanceEligible(baseSalary)) {
    return `${activeYear}: se sugiere auxilio legal de transporte/conectividad por $${legalAux}. Aplica hasta 2 SMMLV ($${cap}).`;
  }
  const salary = Math.max(0, parseNum(baseSalary));
  if (salary > 0) {
    return `${activeYear}: si el salario supera 2 SMMLV ($${cap}), el auxilio legal se registra en $0. Si la empresa reconoce un valor adicional, debe tratarse como beneficio extralegal.`;
  }
  return `${activeYear}: el SMMLV es $${parseNum(CO_HR_RULES.minMonthlySalary).toLocaleString("es-CO")} y el auxilio legal de transporte/conectividad es $${legalAux}.`;
}

function bindEmployeeTransportAllowanceRule(form, config = {}) {
  const salaryInput = form?.querySelector?.(config.salarySelector || 'input[name="baseSalary"]');
  const auxInput = form?.querySelector?.(config.auxSelector || 'input[name="transportAllowance"]');
  const hintEl = form?.querySelector?.(config.hintSelector || "");
  const preserveExistingValue = Boolean(config.preserveExistingValue);
  if (!salaryInput || !auxInput) return { sync: () => {} };
  let initialized = false;
  const sync = ({ force = false } = {}) => {
    const baseSalary = parseNum(salaryInput.value);
    const eligible = colombiaTransportAllowanceEligible(baseSalary);
    const preserveOnInit = preserveExistingValue && !initialized;
    if (!preserveOnInit) {
      if (force || auxInput.dataset.userEdited !== "1" || !eligible) {
        auxInput.value = String(suggestedEmployeeTransportAllowanceCop(baseSalary));
      }
    } else if (!eligible) {
      auxInput.value = "0";
    }
    if (!eligible) delete auxInput.dataset.userEdited;
    if (hintEl) hintEl.textContent = employeeTransportAllowanceGuidance(baseSalary);
    initialized = true;
  };
  salaryInput.addEventListener("input", () => sync());
  auxInput.addEventListener("input", () => {
    auxInput.dataset.userEdited = "1";
    if (hintEl) hintEl.textContent = employeeTransportAllowanceGuidance(salaryInput.value);
  });
  sync({ force: !preserveExistingValue });
  return { sync };
}

function applyLaborSystemParametersApiResponse(saved) {
  if (saved?.systemParameters && typeof window.applySystemParametersFromBootstrapPayload === "function") {
    window.applySystemParametersFromBootstrapPayload(saved.systemParameters);
  }
  if (saved?.systemParametersHistory !== undefined) {
    state.systemParametersHistory = Array.isArray(saved.systemParametersHistory) ? saved.systemParametersHistory : [];
  }
}

function laborSystemParametersHistoryRows() {
  return Array.isArray(state.systemParametersHistory) ? state.systemParametersHistory.filter(Boolean) : [];
}

function laborSystemParametersDraftForYear(yearLike, historyRows = laborSystemParametersHistoryRows()) {
  const active =
    (typeof window.normalizeSystemParametersPayload === "function"
      ? window.normalizeSystemParametersPayload(read(KEYS.systemParameters, null))
      : null) || CO_SYSTEM_PARAMS_DEFAULTS;
  const numericYear = clampLaborSystemParameterYear(yearLike);
  const exact = historyRows.find((row) => Number(row?.year) === numericYear) || null;
  const fallback = exact || historyRows[0] || {};
  return {
    year: numericYear,
    effectiveFrom: String(fallback.effectiveFrom || `${numericYear}-01-01`),
    effectiveTo: String(fallback.effectiveTo || `${numericYear}-12-31`),
    smmlvCop: Math.max(0, parseNum(fallback.smmlvCop ?? fallback.minMonthlySalaryCop ?? active.smmlvCop)),
    minMonthlySalaryCop: Math.max(
      0,
      parseNum(fallback.minMonthlySalaryCop ?? fallback.smmlvCop ?? active.minMonthlySalaryCop)
    ),
    transportAllowanceCop: Math.max(0, parseNum(fallback.transportAllowanceCop ?? active.transportAllowanceCop)),
    legalWeeklyHours: Math.max(0, parseNum(fallback.legalWeeklyHours ?? active.legalWeeklyHours)),
    healthEmployeeRate: Math.max(0, parseNum(fallback.healthEmployeeRate ?? active.healthEmployeeRate)),
    pensionEmployeeRate: Math.max(0, parseNum(fallback.pensionEmployeeRate ?? active.pensionEmployeeRate)),
    uvtCop: Math.max(0, parseNum(fallback.uvtCop ?? active.uvtCop ?? 0)),
    activeYear: clampLaborSystemParameterYear(active.activeYear || numericYear),
    referenceMode: active.referenceMode === "manual" ? "manual" : "automatic",
    isCurrent: Boolean(fallback.isCurrent)
  };
}

function laborSystemParametersSelectableYears(historyRows = laborSystemParametersHistoryRows()) {
  const years = new Set(
    (Array.isArray(historyRows) ? historyRows : [])
      .map((row) => Number(row?.year) || 0)
      .filter((y) => y >= LABOR_SYSTEM_PARAMETERS_MIN_YEAR && y <= LABOR_SYSTEM_PARAMETERS_MAX_YEAR)
  );
  for (let y = LABOR_SYSTEM_PARAMETERS_MIN_YEAR; y <= LABOR_SYSTEM_PARAMETERS_MAX_YEAR; y += 1) {
    years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

function renderPayrollLegalHistoryCard(row, allRuns = [], { canDelete = false } = {}) {
  const rowYear = Number(row?.year) || 0;
  const rowRuns = (Array.isArray(allRuns) ? allRuns : []).filter((run) =>
    String(run.month || "").startsWith(`${rowYear}`)
  ).length;
  const healthPct = ((parseNum(row.healthEmployeeRate) || 0) * 100).toFixed(2).replace(/\.00$/, "");
  const pensionPct = ((parseNum(row.pensionEmployeeRate) || 0) * 100).toFixed(2).replace(/\.00$/, "");
  const statusHtml = row.isCurrent
    ? '<span class="status status-completada">Vigente hoy</span>'
    : '<span class="status">Histórica</span>';
  return `<article class="payroll-legal-vigencia-card${row.isCurrent ? " is-current" : ""}" data-legal-year="${escapeAttr(String(rowYear))}">
    <header class="payroll-legal-vigencia-card__head">
      <div>
        <p class="payroll-legal-vigencia-card__year">${escapeHtml(String(rowYear || "—"))}</p>
        <p class="muted payroll-legal-vigencia-card__range">${escapeHtml(String(row.effectiveFrom || "—"))} → ${escapeHtml(String(row.effectiveTo || "—"))}</p>
      </div>
      ${statusHtml}
    </header>
    <dl class="payroll-legal-vigencia-card__metrics">
      <div><dt>SMMLV</dt><dd>$${parseNum(row.smmlvCop).toLocaleString("es-CO")}</dd></div>
      <div><dt>Auxilio</dt><dd>$${parseNum(row.transportAllowanceCop).toLocaleString("es-CO")}</dd></div>
      <div><dt>Salud / pensión</dt><dd>${healthPct}% / ${pensionPct}%</dd></div>
      <div><dt>UVT</dt><dd>${row.uvtCop != null ? `$${parseNum(row.uvtCop).toLocaleString("es-CO")}` : "—"}</dd></div>
      <div><dt>Horas / liq.</dt><dd>${escapeHtml(String(parseNum(row.legalWeeklyHours || 0) || "—"))} · <strong>${rowRuns}</strong></dd></div>
    </dl>
    <footer class="payroll-legal-vigencia-card__actions toolbar">
      <button type="button" class="btn btn-sm btn-outline" data-action="payroll-legal-set-year" data-year="${escapeAttr(String(rowYear))}">${IC.edit} Editar</button>
      ${
        canDelete
          ? `<button type="button" class="btn btn-sm btn-reject" data-action="payroll-legal-delete" data-year="${escapeAttr(String(rowYear))}" title="Eliminar vigencia del año (solo administradores)">${IC.trash} Eliminar</button>`
          : ""
      }
    </footer>
  </article>`;
}

const CO_CATALOGS = {
  licenseCategories: ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"],
  eps: ["Sura", "Nueva EPS", "Sanitas", "Compensar", "Famisanar", "Salud Total", "Aliansalud", "Coosalud", "Mutual Ser", "S.O.S."],
  arl: ["Sura", "Positiva", "Colmena", "Bolivar", "Alfa", "Equidad", "Mapfre"],
  bloodTypes: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
  pensionFunds: ["Colpensiones", "Porvenir", "Proteccion", "Colfondos", "Skandia"],
  severanceFunds: ["Porvenir", "Proteccion", "Colfondos", "Skandia", "FNA"],
  compensationFunds: ["Colsubsidio", "Cafam", "Compensar", "Comfama", "Comfandi", "Cafaba", "Comfenalco Antioquia", "Comfenalco Valle", "Cajacopi"],
  arlRiskLevels: ["I", "II", "III", "IV", "V"],
  bodyTypes: ["Furgon seco", "Furgon refrigerado (Termoking)", "Estacas", "Plancha", "Cisterna", "Granelero", "Volqueta"],
  fuelTypes: ["Diesel ACPM", "Gas Natural Vehicular (GNV)", "Gasolina corriente", "Hibrido"],
  axleConfig: ["2 ejes (4 llantas)", "3 ejes (6 llantas)", "4 ejes (8 llantas)", "5 ejes (10 llantas)", "6 ejes (12 llantas)"],
  documentTypes: ["CC", "CE", "PAS", "PEP", "TI"],
  contractTypes: ["Termino indefinido", "Termino fijo", "Obra o labor", "Prestacion de servicios", "Aprendizaje SENA"],
  /** Tipos con plantilla Word en documentacion/ (solo formulario de cargo). */
  positionContractTypes: ["Termino indefinido", "Termino fijo", "Prestacion de servicios"],
  workSchedule: ["Diurna", "Nocturna", "Mixta"],
  payFrequency: ["Mensual", "Quincenal", "Semanal", "Catorcenal"], // mismo canon que apps/api/src/payroll/payroll-frequency.ts → periodicidad_pago
  contributorTypes: ["Dependiente", "Independiente", "Aprendiz SENA lectivo", "Aprendiz SENA productivo", "Pensionado activo"],
  banks: ["Bancolombia", "Davivienda", "BBVA", "Banco de Bogota", "Banco Popular", "Itau (Corpbanca)", "Banco Caja Social", "Banco AV Villas", "Banco Falabella", "Scotiabank Colpatria", "Banco Agrario", "Banco GNB Sudameris", "Nequi", "Daviplata"],
  accountTypes: ["Ahorros", "Corriente"],
  educationLevel: ["Primaria", "Bachiller", "Tecnico", "Tecnologo", "Profesional", "Posgrado"],
  maritalStatus: ["Soltero(a)", "Casado(a)", "Union libre", "Separado(a)", "Divorciado(a)", "Viudo(a)"],
  genders: ["Masculino", "Femenino", "Otro", "Prefiero no decirlo"],
  vehicleColors: ["Blanco", "Negro", "Gris", "Plata", "Azul", "Rojo", "Verde", "Amarillo", "Naranja"],
  contractTerminationCauses: ["Vencimiento de termino", "Mutuo acuerdo", "Justa causa", "Sin justa causa", "Renuncia voluntaria", "Termino de obra", "Pension"],
  uniformIssuance: ["Enero/Mayo/Septiembre", "Abril/Agosto/Diciembre", "No aplica"]
};

function selectOptionsFromCatalog(values = [], selected = "", placeholder = "Seleccione...") {
  const matched = matchCatalogOptionValue(values, selected);
  const normalizedSelected = String(matched || selected || "").trim();
  const list = Array.isArray(values) ? [...values] : [];
  if (
    normalizedSelected &&
    !list.some((v) => String(v).trim().toLowerCase() === normalizedSelected.toLowerCase())
  ) {
    list.push(normalizedSelected);
  }
  const options = list.map((value) => {
    const safeValue = String(value || "").trim();
    const sel =
      safeValue === normalizedSelected ||
      safeValue.toLowerCase() === normalizedSelected.toLowerCase()
        ? "selected"
        : "";
    return `<option value="${safeValue}" ${sel}>${safeValue}</option>`;
  });
  return [`<option value="">${placeholder}</option>`, ...options].join("");
}

/** Opciones `{ value, label }` para `openEditModal`: incluye valor guardado aunque no esté en el catálogo. */
function editModalCatalogSelectOptions(catalog, selected, placeholder = "Seleccione...") {
  const matched = matchCatalogOptionValue(catalog, selected);
  const values = Array.isArray(catalog) ? [...catalog] : [];
  if (matched && !values.some((v) => String(v).trim() === String(matched).trim())) {
    values.push(matched);
  }
  return [{ value: "", label: placeholder }, ...values.map((item) => ({ value: item, label: item }))];
}

function validateCandidatePipelineTransition(candidate, nextStatus) {
  const currentStatus = String(candidate?.status || PIPELINE[0]);
  const targetStatus = String(nextStatus || currentStatus);
  if (currentStatus === targetStatus) return { ok: true };
  const allowed = PIPELINE_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return { ok: false, message: `Flujo invalido: ${currentStatus} -> ${targetStatus}. Debes respetar el orden del pipeline.` };
  }
  if (targetStatus === "Oferta enviada") {
    const hasInterview = read(KEYS.interviews, []).some((item) => String(item.candidateId || "") === String(candidate.id || ""));
    if (!hasInterview) {
      return { ok: false, message: "Para enviar oferta primero debes registrar entrevista del candidato." };
    }
  }
  if (targetStatus === "Contratado") {
    const byCandidate = read(KEYS.contracts, []).some((item) => String(item.candidateId || "") === String(candidate.id || ""));
    const candDoc = String(candidate.idDoc || "").trim();
    const byEmployeeDoc =
      Boolean(candDoc) &&
      read(KEYS.contracts, []).some((item) => {
        if (!item.employeeId) return false;
        const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(item.employeeId));
        return emp && String(emp.idDoc || "").trim() === candDoc;
      });
    if (!byCandidate && !byEmployeeDoc) {
      return {
        ok: false,
        message:
          "Para marcar como contratado debe existir un contrato generado (desde Gestión humana o Contratación, misma cédula) o el registro histórico por candidato."
      };
    }
  }
  return { ok: true };
}

const HIRING_RRHH_EDIT_ACTIONS = new Set([
  "edit-vacancy",
  "edit-position",
  "edit-candidate",
  "edit-interview",
  "candidate-status",
  "toggle-position"
]);

function canPerformHiringEditAction(action) {
  return HIRING_RRHH_EDIT_ACTIONS.has(String(action || "")) && canManageHiringModule();
}

function hiringPipelineStatusClass(status) {
  const s = String(status || "");
  if (s === "Contratado") return "status-viaje_asignado";
  if (s === "Descartado") return "status-rechazada";
  if (s === "Oferta enviada") return "status-viaje_completado";
  if (s === "Entrevistado") return "status-en_transito";
  if (s === "Preseleccionado") return "status-pendiente";
  return "status-pendiente";
}

function hiringPipelineSelectOptions(currentStatus) {
  const current = String(currentStatus || PIPELINE[0]);
  const allowed = PIPELINE_TRANSITIONS[current] || [];
  const options = new Set([current, ...allowed]);
  return [...options]
    .map((p) => `<option value="${escapeAttr(p)}"${p === current ? " selected" : ""}>${escapeHtml(p)}</option>`)
    .join("");
}

function computeHiringConversionPct(candidates) {
  const rows = Array.isArray(candidates) ? candidates : [];
  if (!rows.length) return 0;
  const hired = rows.filter((c) => String(c.status || "") === "Contratado").length;
  return Math.round((hired / rows.length) * 100);
}

function formatInterviewModeLabel(mode) {
  const m = String(mode || "").trim().toLowerCase();
  if (m === "virtual") return "Virtual";
  if (m === "telefonica" || m === "telefónica") return "Telefónica";
  if (m === "presencial") return "Presencial";
  return mode ? String(mode) : "—";
}

function getCandidateVacancyAndPosition(candidate) {
  const vacancy =
    read(KEYS.vacancies, []).find((v) => String(v.id) === String(candidate?.vacancyId || "")) || null;
  const position = vacancy ? getPositionById(String(vacancy.positionId || "")) : null;
  return { vacancy, position };
}

function hiringEmptyState(text, cta = null) {
  const ctaHtml =
    cta && cta.action
      ? `<div class="hiring-empty-actions"><button type="button" class="btn btn-primary btn-sm" data-action="${escapeAttr(
          cta.action
        )}"${cta.section ? ` data-section="${escapeAttr(cta.section)}"` : ""}>${IC.plus} ${escapeHtml(
          cta.label || "Registrar"
        )}</button></div>`
      : "";
  return `<div class="empty-state hiring-empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><p>${escapeHtml(
    text
  )}</p>${ctaHtml}</div>`;
}

function applyCandidateToEmployeeForm(form, candidate) {
  if (!form || !candidate) return false;
  const { position } = getCandidateVacancyAndPosition(candidate);
  const setVal = (selector, value) => {
    const el = form.querySelector(selector);
    if (el && value != null && String(value).trim() !== "") el.value = String(value);
  };
  setVal("input[name='name']", candidate.name);
  setVal("select[name='documentType']", candidate.documentType || "CC");
  setVal("input[name='idDoc']", candidate.idDoc);
  const setDate = (name, iso) => {
    const ymd = normalizePortalDateYmd(iso);
    if (!ymd) return;
    window.AntaresValidation?.setPortalFormDateByName?.(form, name, ymd);
  };
  setDate("birthDate", String(candidate.birthDate || "").slice(0, 10));
  setVal("select[name='educationLevel']", candidate.educationLevel);
  setVal("input[name='phone']", candidate.phone);
  setVal("input[name='personalEmail']", candidate.email);
  setVal("input[name='address']", candidate.address);
  setDate("startDate", colombiaTodayIsoDate());
  const deptSel = form.querySelector("select[name='department']");
  if (deptSel && candidate.department) {
    setFormSelectValue(deptSel, candidate.department);
    deptSel.dispatchEvent(new Event("change", { bubbles: true }));
    requestAnimationFrame(() => setVal("select[name='city']", candidate.city));
  } else {
    setVal("select[name='city']", candidate.city);
  }
  const posSel = form.querySelector("#emp-position-select, select[name='positionId']");
  if (posSel && position) {
    setFormSelectValue(posSel, position.id);
    posSel.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const hintEl = form.querySelector("#emp-position-catalog-hint");
  if (hintEl) {
    hintEl.textContent = `Datos precargados desde candidato «${String(candidate.name || "").trim()}». Complete seguridad social, banco y demás campos obligatorios antes de guardar.`;
  }
  form.dataset.prefillCandidateId = String(candidate.id || "");
  return true;
}

function openPayrollEmployeeFromCandidate(candidateId) {
  const cid = String(candidateId || "").trim();
  if (!cid) return;
  state.hiringUi = { ...(state.hiringUi || {}), prefillEmployeeFromCandidateId: cid };
  state.payrollUi = { ...(state.payrollUi || {}), workspace: "operate", operateSection: "employee" };
  state.createPanels = { ...(state.createPanels || {}), "create-employee": true };
  persistHrWorkspace("payroll", "operate");
  persistHrWorkspace("hiring", state.hiringUi?.workspace || "data");
  state.currentView = "payroll";
  renderPortalView();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToCreatePanelForm("create-employee"));
  });
}

function openHiringContractFromCandidate(candidateId) {
  const cid = String(candidateId || "").trim();
  if (!cid) return;
  state.hiringUi = {
    ...(state.hiringUi || {}),
    prefillContractFromCandidateId: cid,
    workspace: "operate",
    operateSection: "contract"
  };
  state.createPanels = { ...(state.createPanels || {}), "create-contract": true };
  persistHrWorkspace("hiring", "operate");
  renderPortalView();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToCreatePanelForm("create-contract"));
  });
}

function getClientDataScope() {
  const s = String(state.clientDataScope || CLIENT_DATA_SCOPE.COMPANY);
  return s === CLIENT_DATA_SCOPE.INDIVIDUAL ? CLIENT_DATA_SCOPE.INDIVIDUAL : CLIENT_DATA_SCOPE.COMPANY;
}

function isPortalClientUser(user) {
  return user?.role === ROLES.CLIENT;
}

function clientRequestsScopePrimaryLabel() {
  return getClientDataScope() === CLIENT_DATA_SCOPE.INDIVIDUAL
    ? "Mis solicitudes"
    : "Solicitudes de mi empresa";
}

function clientDataScopeBarHtml(activeScope) {
  const active =
    String(activeScope || "") === CLIENT_DATA_SCOPE.INDIVIDUAL
      ? CLIENT_DATA_SCOPE.INDIVIDUAL
      : CLIENT_DATA_SCOPE.COMPANY;
  const pill = (key, label) =>
    `<button type="button" class="ops-filter-pill${active === key ? " is-active" : ""}" data-action="client-data-scope" data-scope="${escapeAttr(key)}"><span>${escapeHtml(label)}</span></button>`;
  return `<div class="client-data-scope-bar ops-filters-bar" role="group" aria-label="Alcance de datos">
    <span class="muted client-data-scope-label">${IC.briefcase} Ver:</span>
    ${pill(CLIENT_DATA_SCOPE.COMPANY, "Toda mi empresa")}
    ${pill(CLIENT_DATA_SCOPE.INDIVIDUAL, "Solo mis solicitudes")}
  </div>`;
}

/** Misma política que modules/core/persistence.js cuando no hay AntaresPersistence. */
function capStoredArrayRows(key, value) {
  const caps = { [KEYS.notifications]: 500, [KEYS.emails]: 400 };
  const max = caps[key];
  if (!max || !Array.isArray(value) || value.length <= max) return value;
  return value.slice(0, max);
}

function read(key, fallback = []) {
  const P = window.AntaresPersistence;
  const normalizeShape = (value) => {
    if (Array.isArray(fallback)) return Array.isArray(value) ? value : fallback;
    if (fallback && typeof fallback === "object") {
      return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
    }
    return value ?? fallback;
  };
  if (P && typeof P.read === "function") return normalizeShape(P.read(key, fallback));
  try {
    return normalizeShape(JSON.parse(localStorage.getItem(key)));
  } catch (_error) {
    return fallback;
  }
}

function readArray(key) {
  const value = read(key, []);
  return Array.isArray(value) ? value : [];
}

function write(key, value, opts = {}) {
  const skipSyncSchedule = opts?.skipSyncSchedule === true;
  const P = window.AntaresPersistence;
  if (P && typeof P.write === "function") {
    P.write(key, value, opts);
  } else {
    const stored = capStoredArrayRows(key, value);
    localStorage.setItem(key, JSON.stringify(stored));
    if (!skipSyncSchedule && window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
      window.AntaresPortalSync.schedule(key, stored);
    }
  }
  /** Contador de campana lateral: mismo valor que tras F5 ante cualquier mutación local o bootstrap. */
  if (key === KEYS.notifications && getSession()) {
    try {
      updateNotificationBadge();
    } catch (_e) {
      /* DOM aún sin portal o función no inicializada */
    }
  }
}

/**
 * Persiste una lista podada en PostgreSQL; admite lista vacía vía deletedIds.
 * @returns {Promise<boolean>}
 */
async function writePortalListPrunedAwaitServer(storageKey, nextList, deletedIds = [], opts = {}) {
  const prev = read(storageKey, []);
  const normalizedDeleted = [
    ...new Set(
      (Array.isArray(deletedIds) ? deletedIds : [deletedIds])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  ];
  try {
    await writeAwaitServer(storageKey, nextList, {
      deletedIds: normalizedDeleted.length ? normalizedDeleted : undefined,
      notifyOnFailure: opts.notifyOnFailure
    });
    return true;
  } catch (err) {
    write(storageKey, prev, { skipSyncSchedule: true });
    if (opts.notifyOnFailure !== false) {
      notify(String(err?.message || "No se pudo guardar el cambio en el servidor."), "error");
    }
    return false;
  }
}

/**
 * Quita una fila del catálogo en memoria y confirma en PostgreSQL (incluye lista vacía).
 * @returns {Promise<boolean>} true si el servidor confirmó (o no hay API).
 */
async function removeFromPortalListAwaitServer(storageKey, rowId, opts = {}) {
  const id = String(rowId || "").trim();
  if (!id) return false;
  const prev = read(storageKey, []);
  if (!Array.isArray(prev)) return false;
  const next = prev.filter((row) => String(row?.id || "") !== id);
  if (next.length === prev.length) return false;
  return writePortalListPrunedAwaitServer(storageKey, next, [id], opts);
}

/**
 * Inserta o reemplaza una fila de usuario (formato `loadUsers`) en `KEYS.users`.
 * Usado como fallback ligero si /portal/bootstrap falla pero /portal/me responde:
 * así Mi perfil renderiza con datos reales en vez de stub vacío del JWT.
 */
function upsertPortalUserRowIntoCache(row) {
  if (!row || typeof row !== "object") return null;
  const uid = String(row.id || "").trim();
  if (!uid) return null;
  const normalized =
    typeof window.normalizePortalBootstrapUserRow === "function"
      ? window.normalizePortalBootstrapUserRow(row)
      : row;
  const users = read(KEYS.users, []);
  const prev = users.find((u) => String(u.id) === uid);
  const others = users.filter((u) => String(u.id) !== uid);
  const merged = { ...prev, ...normalized };
  write(KEYS.users, [merged, ...others], { skipSyncSchedule: true });
  return merged;
}

function defaultAdminUsersUi() {
  return {
    panel: "",
    editUserId: "",
    editCompanyId: "",
    section: "pending",
    createUserMinimized: false,
    createCompanyMinimized: false,
    editMinimized: false,
    permissionsMinimized: false
  };
}

function getAdminUsersUi() {
  return { ...defaultAdminUsersUi(), ...(state.adminUsersUi || {}) };
}

function setAdminUsersUi(patch) {
  state.adminUsersUi = { ...getAdminUsersUi(), ...(patch && typeof patch === "object" ? patch : {}) };
}

function getAdminUsersDraft(slot) {
  const key = String(slot || "").trim();
  if (!key) return {};
  const drafts = state.adminUsersDrafts && typeof state.adminUsersDrafts === "object" ? state.adminUsersDrafts : {};
  const raw = drafts[key];
  return raw && typeof raw === "object" ? { ...raw } : {};
}

function setAdminUsersDraft(slot, draft) {
  const key = String(slot || "").trim();
  if (!key) return;
  const next = draft && typeof draft === "object" ? { ...draft } : {};
  state.adminUsersDrafts = {
    ...(state.adminUsersDrafts && typeof state.adminUsersDrafts === "object" ? state.adminUsersDrafts : {}),
    [key]: next
  };
}

function clearAdminUsersDraft(slot) {
  setAdminUsersDraft(slot, {});
}

/** Cuerpo de p-card colapsable (mismo patrón que registro de sesiones en admin). */
function adminUsersCollapsibleCardBody(expanded, toggleAction, panelHtml) {
  return `${renderModulePanelToolbar({ expanded, toggleAction, showWhen: "collapsed" })}
  <div class="${expanded ? "" : "hidden"}" data-admin-collapsible-panel>
    ${panelHtml}
  </div>`;
}

/**
 * POST autenticado al API: usa la misma alineacion JWT↔sesion que bootstrap.
 * Sin URL de backend: no llama al servidor (retorna undefined).
 * Con backend pero sin token/sesión valida: lanza Error (evita borrados solo en caché en produccion).
 */
async function postPortalAuthorized(path, body) {
  const api = window.AntaresApi;
  if (!api?.getBase?.()) return undefined;
  if (!portalCanRefreshFromApi()) {
    throw new Error(
      "No hay sesion valida con el servidor. Revise antares_api_base y vuelva a iniciar sesion."
    );
  }
  return api.postJson(path, body);
}

/**
 * Tras novedades que afectan nómina laboral (ausencias, cambios de salario): crea/actualiza
 * borradores en servidor. Conductores (prestación de servicios) se excluyen — pago por viajes.
 */
async function refreshDriverTripPaymentLinked(employeeId, periodYm, opts = {}) {
  const eid = String(employeeId || "").trim();
  const ym = String(periodYm || "").trim().slice(0, 7);
  if (!eid || !/^\d{4}-\d{2}$/.test(ym) || !portalCanRefreshFromApi()) return null;
  const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === eid);
  if (!emp || !employeeIsConductorServiceProvider(emp)) {
    return { skipped: true, message: "No es conductor en prestación de servicios" };
  }
  try {
    const result = await postPortalAuthorized("/payroll/driver-trip-payment", {
      employeeId: eid,
      periodYm: ym,
      travelAllowanceManualCop: opts.travelAllowanceManualCop,
      fuelReimbursementManualCop: opts.fuelReimbursementManualCop
    });
    if (opts.bootstrap !== false) {
      try {
        await applyPortalBootstrapFromApi();
      } catch (_e) {}
    }
    return result;
  } catch (err) {
    if (opts.notifyOnError !== false) {
      notify(String(err?.message || "No fue posible liquidar los viajes en el servidor."), "warn");
    }
    return null;
  }
}

async function refreshPayrollDraftsLinked(employeeId, startDate, endDate, opts = {}) {
  const eid = String(employeeId || "").trim();
  if (!eid || !portalCanRefreshFromApi()) return null;
  const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === eid);
  if (emp && !employeeReceivesPayrollNomina(emp)) {
    return { created: 0, updated: 0, skipped: 0, conductorTripPay: true };
  }
  try {
    const result = await postPortalAuthorized("/payroll/refresh-drafts", {
      employeeId: eid,
      startDate: startDate ? String(startDate).slice(0, 10) : undefined,
      endDate: endDate ? String(endDate).slice(0, 10) : undefined
    });
    if (opts.bootstrap !== false) {
      try {
        await applyPortalBootstrapFromApi();
      } catch (_e) {}
    }
    return result;
  } catch (err) {
    if (opts.notifyOnError !== false) {
      notify(
        String(err?.message || "La novedad se guardó, pero no se pudo actualizar el borrador de nómina."),
        "warn"
      );
    }
    return null;
  }
}

function payrollDraftLinkSuccessMessage(result, fallback = userMessage("absenceRecorded")) {
  if (result?.conductorTripPay) return userMessage("absenceRecordedConductorTripPay");
  if (!result || typeof result !== "object") return fallback;
  const created = Number(result.created) || 0;
  const updated = Number(result.updated) || 0;
  if (created + updated > 0) {
    const parts = [];
    if (created > 0) parts.push(`${created} borrador${created === 1 ? "" : "es"} creado${created === 1 ? "" : "s"}`);
    if (updated > 0) parts.push(`${updated} liquidación${updated === 1 ? "" : "es"} actualizada${updated === 1 ? "" : "s"}`);
    return `Novedad registrada. Nómina vinculada: ${parts.join(" y ")}.`;
  }
  return fallback;
}

/** Repone datos de la última sesión en RAM (instantáneo tras F5). */
function restorePortalSnapshotIfAvailable() {
  const session = getSession();
  const uid = session?.userId;
  const cache = window.PortalBootstrapCache;
  if (!uid || !cache?.tryRestore) return false;
  if (!cache.tryRestore(String(uid), { deferNonEssential: true })) return false;
  if (typeof window.applyPortalSnapshotExtras === "function") {
    window.applyPortalSnapshotExtras(cache.consumeRestoredExtras?.());
  }
  state.portalSnapshotRestored = true;
  state.portalDataHydrated = true;
  try {
    ensureUsersPermissions();
    syncSessionProfileSnapshotFromCache();
  } catch (_e) {
    /* noop */
  }
  return true;
}

/** Indica / oculta el aviso global de carga de datos del servidor. */
function setPortalDataHydrating(on) {
  const next = Boolean(on);
  if (state.portalDataHydrating === next) {
    updatePortalDataHydratingBanner();
    return;
  }
  state.portalDataHydrating = next;
  updatePortalDataHydratingBanner();
}

function updatePortalDataHydratingBanner() {
  const root = document.getElementById("view-root");
  if (!root) return;
  const id = "portal-data-hydrating-banner";
  let el = document.getElementById(id);
  const show = Boolean(state.portalDataHydrating && getSession());
  if (!show) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.className = "portal-data-hydrating-banner";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    root.prepend(el);
  }
  el.textContent =
    state.portalDataHydrated || state.portalSnapshotRestored
      ? "Actualizando datos del servidor…"
      : "Cargando datos del servidor…";
}

window.setPortalDataHydrating = setPortalDataHydrating;
window.isPortalDataHydrating = function isPortalDataHydrating() {
  return Boolean(state.portalDataHydrating);
};

window.refreshPositionsCatalogFromApi = refreshPositionsCatalogFromApi;

/** Fusiona filas de GET /portal/pending-user-registrations sin borrar el resto de usuarios en caché. */
function mergePendingUserRegistrationsIntoCache(rows) {
  if (!Array.isArray(rows)) return;
  const normalized = rows.map((row) =>
    typeof window.normalizePortalBootstrapUserRow === "function" ? window.normalizePortalBootstrapUserRow(row) : row
  );
  const existing = read(KEYS.users, []);
  const byId = new Map(existing.map((u) => [String(u.id), { ...u }]));
  /** Sólo huérfanos vivos en la respuesta actual: si el admin los borra, deben desaparecer. */
  const orphansSeen = new Set();
  for (const row of normalized) {
    const id = String(row.id || "").trim();
    if (!id) continue;
    const prev = byId.get(id) || {};
    if (pendingUserOrigin(row) === "supabase_auth_only") {
      orphansSeen.add(id);
    }
    byId.set(id, {
      ...prev,
      ...row,
      accountStatus: row.accountStatus || prev.accountStatus || ACCOUNT_STATUS.PENDIENTE,
      source: row.source || prev.source || "portal_db"
    });
  }
  // Remueve huérfanos cacheados que la API ya no devuelve (p.ej. usuario eliminado en Supabase Auth).
  const out = [];
  for (const u of byId.values()) {
    if (pendingUserOrigin(u) === "supabase_auth_only" && !orphansSeen.has(String(u.id))) {
      continue;
    }
    out.push(u);
  }
  write(KEYS.users, out, { skipSyncSchedule: true });
}

/** Bandeja de altas pendientes (requiere permiso de autorización de registros web). */
async function applyPendingUserRegistrationsFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  if (!canApprovePortalRegistration(currentUser())) return false;
  const api = window.AntaresApi;
  try {
    const rows = await api.getJson("/portal/pending-user-registrations");
    if (!Array.isArray(rows)) return false;
    mergePendingUserRegistrationsIntoCache(rows);
    return true;
  } catch (err) {
    devWarn("Portal: GET /portal/pending-user-registrations fallo.", err?.message || err);
    return false;
  }
}

/** Lista prospectos B2B sin depender del bootstrap pesado (mitiga fallos al abrir Solicitudes contacto web). */
async function refreshContactB2bProspectsFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  const api = window.AntaresApi;
  try {
    const rows = await api.getJson("/portal/contact-b2b-prospects");
    if (!Array.isArray(rows)) return false;
    state.portalContacts = rows;
    return true;
  } catch (err) {
    devWarn("Portal: GET /portal/contact-b2b-prospects fallo.", err?.message || err);
    return false;
  }
}

/** Solo administración/usuarios: sesiones activas e históricas desde API (tabla sesiones_usuario). */
async function refreshAdminUserSessionsFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  const user = currentUser();
  if (!user || !hasPermission(user, PERMISSIONS.USERS_MANAGE)) return false;
  const api = window.AntaresApi;
  try {
    const rows = await api.getJson("/portal/user-sessions");
    state.adminUserSessions = Array.isArray(rows) ? rows : [];
    state.adminUserSessionsError = null;
    return true;
  } catch (err) {
    state.adminUserSessionsError = String(
      err?.message || "No fue posible consultar sesiones de usuarios en el servidor."
    );
    return false;
  }
}

function adminUsersHasPendingInCache() {
  return read(KEYS.users, []).some((u) => isPortalUserPendingApproval(u));
}

function resolveAdminUsersSectionAfterEntrySync() {
  const ui = getAdminUsersUi();
  const section = normalizeAdminUsersSection(ui.section, adminUsersHasPendingInCache());
  if (section !== ui.section) setAdminUsersUi({ section });
}

let __adminUserSessionsLoadGen = 0;

/**
 * Carga sesiones bajo demanda (pestaña Sesiones o botón Actualizar).
 * Evita un repintado completo del módulo al entrar en Usuarios.
 */
async function ensureAdminUserSessionsLoaded(opts = {}) {
  const force = Boolean(opts && opts.force);
  if (!portalCanRefreshFromApi()) return false;
  if (!hasPermission(currentUser(), PERMISSIONS.USERS_MANAGE)) return false;
  if (state.adminUserSessionsHydrated && !force) return true;
  if (state.adminUserSessionsLoading) return false;
  state.adminUserSessionsLoading = true;
  state.adminUserSessionsError = null;
  const gen = ++__adminUserSessionsLoadGen;
  let ok = false;
  try {
    ok = await refreshAdminUserSessionsFromApi();
  } catch (_e) {
    ok = false;
  } finally {
    if (gen === __adminUserSessionsLoadGen) {
      state.adminUserSessionsLoading = false;
      if (ok) state.adminUserSessionsHydrated = true;
    }
  }
  return ok;
}

/** Pendientes en servidor + bootstrap en curso antes del primer pintado estable del módulo. */
async function syncAdminUsersModuleOnEntry() {
  if (!portalCanRefreshFromApi()) return;
  const tasks = [];
  const boot = window.__portalBootstrapInFlight;
  if (boot && typeof boot.then === "function") tasks.push(boot.catch(() => false));
  if (currentUser()?.role === ROLES.ADMIN) {
    tasks.push(applyPendingUserRegistrationsFromApi().catch(() => false));
  }
  if (tasks.length) await Promise.all(tasks);
}

function finalizeAdminUsersModuleEntry() {
  resolveAdminUsersSectionAfterEntrySync();
  state.adminUsersEntryHydrating = false;
  const ui = getAdminUsersUi();
  if (
    ui.section === "sessions" &&
    portalCanRefreshFromApi() &&
    hasPermission(currentUser(), PERMISSIONS.USERS_MANAGE)
  ) {
    void ensureAdminUserSessionsLoaded().finally(() => {
      if (state.currentView === "admin-users") scheduleRenderPortalView();
    });
    return;
  }
  if (state.currentView === "admin-users") scheduleRenderPortalView();
}

function adminUsersEntryHydratingBodyHtml(activeSection) {
  const active = String(activeSection || "users");
  const panelIds = ["actions", "pending", "users", "companies", "sessions"];
  const panels = panelIds
    .map((id) => {
      const hidden = id !== active ? " hidden" : "";
      const body =
        id === active
          ? `<p class="admin-users-inline-note muted">Actualizando directorio desde el servidor…</p>`
          : "";
      return `<div class="auth-tab-panel${hidden}" data-admin-users-panel="${escapeAttr(id)}"${hidden}>${body}</div>`;
    })
    .join("");
  return `<div class="auth-tab-panels">${panels}</div>`;
}

function adminUsersHydratingShellHtml({ pendingUsers, activeUsers, companies, ui }) {
  const approvedCount = activeUsers.filter((u) => u.accountStatus === ACCOUNT_STATUS.APROBADO).length;
  const activeCompaniesCount = companies.filter((c) => isCompanyRecordActive(c)).length;
  const inactiveCompaniesCount = Math.max(0, companies.length - activeCompaniesCount);
  const section = String(ui.section || "users");
  const sessions = Array.isArray(state.adminUserSessions) ? state.adminUserSessions : [];
  const hero = `<section class="users-hero-strip users-hero-strip--command">
    <div class="admin-users-hero-main">
      <p class="users-hero-kicker">Sistema de acceso y gobierno</p>
      <h2>Usuarios y permisos con una lectura mas clara</h2>
      <p>
        Centralice aprobaciones, altas y cambios de acceso en una vista mas limpia, con menos ruido visual y mejor jerarquia.
      </p>
      <div class="admin-users-hero-chips">
        <span class="status ${pendingUsers.length ? "status-pendiente" : "status-viaje_asignado"}">Pendientes ${pendingUsers.length}</span>
        <span class="status status-viaje_asignado">Aprobados ${approvedCount}</span>
        <span class="status ${inactiveCompaniesCount ? "status-pendiente" : "status-viaje_asignado"}">Empresas activas ${activeCompaniesCount}</span>
      </div>
    </div>
    <div class="admin-users-hero-panel admin-users-hero-panel--compact">
      <p class="admin-users-hero-panel__eyebrow">Acciones rapidas</p>
      <p class="admin-users-hero-panel__copy">
        Abra solo el flujo que necesita y mantenga el resto del modulo despejado.
      </p>
      <div class="users-hero-actions">
        <button class="btn btn-primary btn-sm" data-action="toggle-admin-panel" data-panel="create-user" disabled>${IC.userPlus} Nuevo usuario</button>
        <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="create-company" disabled>${IC.building || IC.briefcase} Nueva empresa</button>
        <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="set-permissions" disabled>${IC.shield} Asignar permisos</button>
        <button class="btn btn-outline btn-sm" data-action="refresh-user-sessions" disabled>${IC.activity} Actualizar sesiones</button>
      </div>
    </div>
  </section>`;
  const workspaceNav = renderModuleWindowTabs({
    ariaLabel: "Opciones del módulo Usuarios y permisos",
    activeId: section,
    action: "admin-users-section",
    valueAttr: "section",
    tabs: [
      { id: "actions", label: "Acciones" },
      { id: "pending", label: "Pendientes", count: pendingUsers.length },
      { id: "users", label: "Usuarios", count: activeUsers.length },
      { id: "companies", label: "Empresas", count: companies.length },
      { id: "sessions", label: "Sesiones", count: sessions.length }
    ]
  });
  return `${hero}${workspaceNav}${adminUsersEntryHydratingBodyHtml(section)}`;
}

/** Evita POST /portal/sync-key con el array completo de usuarios mientras se ajusta caché a mano. */
function portalPatchUsersCacheWithoutSyncKey(mutator) {
  if (typeof mutator !== "function") return;
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    mutator();
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

/**
 * Tras POST que muta usuarios en PostgreSQL: volcado bootstrap y cola de pendientes (admin).
 * El merge de pendientes también va bajo begin/end para no disparar sync-key redundante.
 */
async function portalRefreshBootstrapThenPendingRegistrations() {
  await startPortalBootstrapForInteractiveSession();
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    if (currentUser()?.role === ROLES.ADMIN) {
      await applyPendingUserRegistrationsFromApi();
    }
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

if (typeof window.DomainModules?.requests?.attachStorage === "function") {
  window.DomainModules.requests.attachStorage({ KEYS, read, write });
}
if (typeof window.DomainRegistry?.wireFromAntares === "function") {
  window.DomainRegistry.wireFromAntares({ KEYS, read, write });
}

/** Diccionario ES→EN del sitio público: `modules/domain/public-site.i18n.js` (`window.translatePublicText`). */
const publicTextStore = [];
let publicTextCaptured = false;

function capturePublicTextNodes() {
  if (publicTextCaptured) return;
  const scopes = [document.querySelector(".top-nav"), document.getElementById("public-app"), document.querySelector(".site-footer"), document.getElementById("auth-modal")].filter(Boolean);
  scopes.forEach((scope) => {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      const original = current.nodeValue;
      if (String(original || "").trim()) {
        publicTextStore.push({ node: current, original });
      }
      current = walker.nextNode();
    }
  });
  publicTextCaptured = true;
}


function tPublic(textEs) {
  if (state.publicLang !== "en") return textEs;
  const tr = window.translatePublicText;
  return typeof tr === "function" ? tr(textEs, "en") : textEs;
}

function setElementTextPreserveChildren(selector, text) {
  const el = document.querySelector(selector);
  if (!el) return;
  const textNodes = [...el.childNodes].filter(
    (node) => node.nodeType === Node.TEXT_NODE && String(node.nodeValue || "").trim()
  );
  if (!textNodes.length) {
    el.appendChild(document.createTextNode(` ${text}`));
    return;
  }
  const target = textNodes[textNodes.length - 1];
  const leading = /^\s/.test(target.nodeValue || "") ? " " : "";
  const trailing = /\s$/.test(target.nodeValue || "") ? " " : "";
  target.nodeValue = `${leading}${text}${trailing}`;
}

const PUBLIC_TEXT_OVERRIDES = {
  es: {
    "#trusted .section-head p": "Aliados del sector floricultor, comercializador y exportador que priorizan puntualidad y conservacion de cadena de frio.",
    "#trusted .mini-metric:nth-child(1) p": "Viajes estimados al año.",
    "#trusted .mini-metric:nth-child(2) p": "Clientes satisfechos por nivel de servicio.",
    "#trusted .mini-metric:nth-child(3) p": "Monitoreo de operacion y trazabilidad.",
    "#about .about-grid article:nth-child(1) p": "Somos un operador logistico B2B especializado en transporte refrigerado para floricultores, comercializadores y exportadores. Integramos tecnologia, disciplina operativa y servicio cercano para garantizar entregas puntuales.",
    "#hierarchy .section-head p": "Liderazgo estrategico y operativo para asegurar excelencia en cada viaje y en toda la cadena de servicio.",
    "#testimonials .section-head p": "Experiencias reales de empresas que gestionan volumen, calidad y tiempos exigentes.",
    "#services .section-head p": "Soluciones logisticas integrales para el sector floricultor y de exportacion.",
    "#coverage-headline":
      "Ciudades y trayectos con mayor demanda registrada en solicitudes de transporte (se actualiza con los datos del servidor).",
    "#news .section-head p": "Cambios recientes en operacion, tecnologia y servicio para mantener a nuestros clientes informados.",
    "#contact .container > article:nth-child(2) .muted":
      "Con el servidor configurado, las solicitudes se registran de forma segura. Sin conexión, la información puede quedar solo en este navegador."
  },
  en: {
    "#trusted .section-head p": "Allies across floriculture, trading, and exports who prioritize punctuality and cold-chain integrity.",
    "#trusted .mini-metric:nth-child(1) p": "Estimated trips per year.",
    "#trusted .mini-metric:nth-child(2) p": "Repeat clients driven by service quality.",
    "#trusted .mini-metric:nth-child(3) p": "Operations monitoring and traceability.",
    "#about .about-grid article:nth-child(1) p": "We are a B2B logistics operator specialized in refrigerated transport for growers, distributors, and exporters. We combine technology, operational discipline, and close support to ensure on-time deliveries.",
    "#hierarchy .section-head p": "Strategic and operational leadership that ensures excellence on every trip and across the full service chain.",
    "#testimonials .section-head p": "Real stories from companies managing high volume, strict quality, and demanding timelines.",
    "#services .section-head p": "End-to-end logistics solutions for floriculture and export operations.",
    "#coverage-headline":
      "Main routes and frequent corridors for floriculture and exports.",
    "#news .section-head p": "Recent updates in operations, technology, and service to keep our clients informed.",
    "#contact .container > article:nth-child(2) .muted":
      "With the server configured, requests are stored securely. Without a connection, information may remain only in this browser."
  }
};

function applyPublicLanguage(lang = "es") {
  capturePublicTextNodes();
  publicTextStore.forEach(({ node, original }) => {
    const tr = window.translatePublicText;
    node.nodeValue =
      lang === "en" && typeof tr === "function" ? tr(original, "en") : original;
  });
  nodes.langButtonsPublic.forEach((btn) => {
    btn.classList.toggle("active", String(btn.dataset.langOption || "") === lang);
  });
  const attrMap = {
    es: {
      "#open-auth": "Portal",
      "#open-auth-hero": "Ingresar al portal",
      "#logout": "Cerrar sesion"
    },
    en: {
      "#open-auth": "Portal",
      "#open-auth-hero": "Enter portal",
      "#logout": "Sign out"
    }
  };
  const attrs = attrMap[lang] || attrMap.es;
  Object.entries(attrs).forEach(([selector, value]) => {
    setElementTextPreserveChildren(selector, value);
  });

  const textOverrides = PUBLIC_TEXT_OVERRIDES[lang] || PUBLIC_TEXT_OVERRIDES.es;
  Object.entries(textOverrides).forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  });

  const placeholderMap = {
    es: {
      "input[name='name']": "Ej. Laura Castaneda",
      "input[name='company']": "Ej. Comercializadora S.A.S.",
      "input[name='taxId']": "Ej. 900123456-7",
      "input[name='position']": "Ej. Directora de Operaciones",
      "input[name='phone']": "+57 300 000 0000",
      "input[name='email']": "nombre@empresa.com",
      "textarea[name='message']": "Cuentanos origen/destino, volumen aproximado, frecuencia y ventana de entrega."
    },
    en: {
      "input[name='name']": "E.g. Laura Castaneda",
      "input[name='company']": "E.g. Trading Company S.A.S.",
      "input[name='taxId']": "E.g. 900123456-7",
      "input[name='position']": "E.g. Director of Operations",
      "input[name='phone']": "+57 300 000 0000",
      "input[name='email']": "name@company.com",
      "textarea[name='message']": "Tell us origin/destination, approximate volume, frequency, and delivery window."
    }
  };
  const placeholders = placeholderMap[lang] || placeholderMap.es;
  Object.entries(placeholders).forEach(([selector, value]) => {
    const el = document.querySelector(`#contact ${selector}`);
    if (el) el.setAttribute("placeholder", value);
  });

  const docLang = lang === "en" ? "en-US" : "es";
  document.documentElement.setAttribute("lang", docLang);

  document.title = lang === "en" ? "Transportes Antares" : "Transportes Antares";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      "content",
      lang === "en"
        ? "B2B logistics operator specialized in refrigerated transport for floriculture and exports, with traceability, compliance, and 24/7 monitoring across Colombia."
        : "Operador logistico B2B especializado en transporte refrigerado para floricultura y exportacion, con trazabilidad, cumplimiento y monitoreo 24/7 en Colombia."
    );
  }

  const mainNav = document.getElementById("main-nav");
  if (mainNav) mainNav.setAttribute("aria-label", lang === "en" ? "Main" : "Principal");

  const logoMarquee = document.querySelector(".logo-marquee");
  if (logoMarquee) logoMarquee.setAttribute("aria-label", lang === "en" ? "Partner companies" : "Empresas aliadas");

  const waFab = document.querySelector(".whatsapp-fab");
  if (waFab) {
    const waLabel = lang === "en" ? "Contact via WhatsApp" : "Contactar por WhatsApp";
    waFab.setAttribute("aria-label", waLabel);
    waFab.setAttribute("title", waLabel);
  }

  if (nodes.themeTogglePublic) nodes.themeTogglePublic.setAttribute("aria-label", lang === "en" ? "Theme" : "Tema");
  if (nodes.langTogglePublic) nodes.langTogglePublic.setAttribute("aria-label", lang === "en" ? "Language" : "Idioma");

  syncPublicNavDrawer();
}

function applyTheme(theme = "light") {
  const mode = theme === "dark" ? "dark" : "light";
  document.body.setAttribute("data-theme", mode);
  state.theme = mode;
  localStorage.setItem(UI_PREFS.theme, mode);
  [...nodes.themeButtonsPublic, ...nodes.themeButtonsPortal].forEach((btn) => {
    btn.classList.toggle("active", String(btn.dataset.themeOption || "") === mode);
  });
}

/** IDs cortos locales (no usar para filas que sincronizan a PostgreSQL con `::uuid`; usar `newUuidV4`). */
function uid() {
  return Math.random().toString(36).slice(2, 11);
}

/** UUID v4 para entidades que persisten en PostgreSQL (empresas, etc.). */
function newUuidV4() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidString(value) {
  return typeof value === "string" && UUID_V4_RE.test(value.trim());
}

/**
 * Registro teléfono: países principales (Colombia siempre primero = opción por defecto).
 * `flag`: sufijo CSS `.register-lang-flag--*` (gradientes locales, sin red).
 */
const REGISTER_PHONE_COUNTRIES = [
  { id: "CO", label: "Colombia", dial: "57", minNat: 10, maxNat: 10, style: "co", flag: "co" },
  { id: "MX", label: "México", dial: "52", minNat: 10, maxNat: 10, style: "generic", flag: "mx" },
  { id: "US", label: "Estados Unidos", dial: "1", minNat: 10, maxNat: 10, style: "generic", flag: "us" },
  { id: "EC", label: "Ecuador", dial: "593", minNat: 9, maxNat: 9, style: "generic", flag: "ec" },
  { id: "PE", label: "Perú", dial: "51", minNat: 9, maxNat: 9, style: "generic", flag: "pe" },
  { id: "CL", label: "Chile", dial: "56", minNat: 9, maxNat: 9, style: "generic", flag: "cl" },
  { id: "AR", label: "Argentina", dial: "54", minNat: 10, maxNat: 10, style: "generic", flag: "ar" },
  { id: "BR", label: "Brasil", dial: "55", minNat: 10, maxNat: 11, style: "generic", flag: "br" },
  { id: "PA", label: "Panamá", dial: "507", minNat: 8, maxNat: 8, style: "generic", flag: "pa" },
  { id: "CR", label: "Costa Rica", dial: "506", minNat: 8, maxNat: 8, style: "generic", flag: "cr" },
  { id: "ES", label: "España", dial: "34", minNat: 9, maxNat: 9, style: "generic", flag: "es" },
  { id: "VE", label: "Venezuela", dial: "58", minNat: 10, maxNat: 10, style: "generic", flag: "ve" },
  { id: "GT", label: "Guatemala", dial: "502", minNat: 8, maxNat: 8, style: "generic", flag: "gt" },
  { id: "HN", label: "Honduras", dial: "504", minNat: 8, maxNat: 8, style: "generic", flag: "hn" }
];

const PHONE_UI_PRESETS = {
  register: {
    cc: ".js-register-phone-cc",
    nat: ".js-register-phone-national",
    flag: ".js-register-lang-flag",
    hintId: "register-phone-hint",
    full: ".js-register-phone-full"
  },
  b2b: {
    cc: ".js-b2b-phone-cc",
    nat: ".js-b2b-phone-national",
    flag: ".js-b2b-lang-flag",
    hintId: "b2b-phone-hint",
    full: ".js-b2b-phone-full"
  }
};

function registerPhoneCountryOptionsHtml() {
  return REGISTER_PHONE_COUNTRIES.map((c, index) => {
    const escLabel = String(c.label || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;");
    const selected = index === 0 ? " selected" : "";
    return `<option value="${c.id}" title="${escLabel}"${selected}>+${c.dial}</option>`;
  }).join("");
}

function getSelectedPhoneCountry(form, presetKey) {
  const p = PHONE_UI_PRESETS[presetKey];
  if (!form || !p) return REGISTER_PHONE_COUNTRIES[0];
  const sel = form.querySelector(p.cc);
  const id = sel?.value || "CO";
  return REGISTER_PHONE_COUNTRIES.find((c) => c.id === id) || REGISTER_PHONE_COUNTRIES[0];
}

function stripDigitsForRegisterNational(raw, meta) {
  let d = String(raw || "").replace(/\D/g, "");
  const dial = meta.dial;
  if (d.startsWith(dial)) d = d.slice(dial.length);
  if (meta.style === "co") {
    if (d.startsWith("57")) d = d.slice(2);
    return d.slice(0, 10);
  }
  while (d.length > meta.maxNat && d.startsWith("0")) {
    d = d.slice(1);
  }
  return d.slice(0, meta.maxNat);
}

function updatePhoneFieldForCountry(form, presetKey) {
  const p = PHONE_UI_PRESETS[presetKey];
  if (!form || !p) return;
  const meta = getSelectedPhoneCountry(form, presetKey);
  const nat = form.querySelector(p.nat);
  const wrap = nat?.closest(".phone-input-professional") || form.querySelector(".phone-input-professional");
  const ccSel = form.querySelector(p.cc);
  const langFlag = form.querySelector(p.flag);
  const hint = document.getElementById(p.hintId);
  if (langFlag) {
    const sfx = meta.flag || "co";
    const flagBase = presetKey === "b2b" ? "js-b2b-lang-flag" : "js-register-lang-flag";
    langFlag.className = `${flagBase} register-lang-flag register-lang-flag--${sfx}`;
    langFlag.setAttribute("title", meta.label);
  }
  if (ccSel) {
    ccSel.setAttribute("aria-label", `Indicativo +${meta.dial} (${meta.label})`);
  }
  if (wrap) {
    wrap.setAttribute(
      "aria-label",
      meta.id === "CO" ? "Teléfono celular Colombia" : `Teléfono ${meta.label}`
    );
  }
  if (hint) {
    hint.textContent =
      meta.style === "co"
        ? "Celular Colombia: 10 dígitos (empieza por 3)."
        : meta.minNat === meta.maxNat
          ? `Indicativo +${meta.dial}: ingrese ${meta.maxNat} dígitos del número local.`
          : `Indicativo +${meta.dial}: entre ${meta.minNat} y ${meta.maxNat} dígitos del número local.`;
  }
  if (nat) {
    nat.placeholder = meta.style === "co" ? "300 123 4567" : "Número local";
    const maxFormatted =
      meta.style === "co"
        ? 14
        : meta.maxNat + (Math.ceil(meta.maxNat / 3) - 1);
    nat.setAttribute("maxlength", String(maxFormatted));
  }
}

function syncPhoneHiddenFull(form, presetKey) {
  const p = PHONE_UI_PRESETS[presetKey];
  if (!form || !p) return;
  const nat = form.querySelector(p.nat);
  const hid = form.querySelector(p.full);
  if (!nat || !hid) return;
  const meta = getSelectedPhoneCountry(form, presetKey);
  let digits = stripDigitsForRegisterNational(nat.value, meta);
  if (meta.style === "co") {
    nat.value = digits ? formatColombianNationalDisplay(digits) : "";
    hid.value = digits ? formatColombianPhone("57" + digits) : "";
    return;
  }
  nat.value = digits ? formatGenericNationalDisplay(digits, meta.maxNat) : "";
  hid.value = digits ? `+${meta.dial} ${formatGenericNationalDisplay(digits, meta.maxNat)}` : "";
}

function clearFieldError(field) {
  const V = window.AntaresValidation;
  if (V && typeof V.clearFieldError === "function") {
    V.clearFieldError(field);
    return;
  }
  if (!field) return;
  field.classList.remove("field-invalid");
  const label = field.closest("label");
  const error = label?.querySelector(".field-error");
  if (error) error.remove();
}

function setFieldError(field, message) {
  const V = window.AntaresValidation;
  if (V && typeof V.setFieldError === "function") {
    V.setFieldError(field, message);
    return;
  }
  if (!field) return;
  const label = field.closest("label");
  if (!label) return;
  clearFieldError(field);
  field.classList.add("field-invalid");
  const hint = document.createElement("small");
  hint.className = "field-error";
  hint.textContent = message;
  label.appendChild(hint);
}

let b2bFormFeedbackHideTimer = null;

/** Aviso visible en el formulario B2B (complementa el toast). */
function setB2bFormFeedback(kind, message) {
  const el = document.getElementById("b2b-form-feedback");
  if (!el) return;
  if (b2bFormFeedbackHideTimer) {
    clearTimeout(b2bFormFeedbackHideTimer);
    b2bFormFeedbackHideTimer = null;
  }
  el.textContent = message || "";
  el.classList.remove("b2b-form-feedback--hidden", "b2b-form-feedback--success", "b2b-form-feedback--error");
  if (!kind || !String(message || "").trim()) {
    el.classList.add("b2b-form-feedback--hidden");
    return;
  }
  el.classList.add(kind === "success" ? "b2b-form-feedback--success" : "b2b-form-feedback--error");
  try {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (_) {
    /* noop */
  }
  if (kind === "success") {
    b2bFormFeedbackHideTimer = setTimeout(() => {
      el.classList.add("b2b-form-feedback--hidden");
      el.textContent = "";
      b2bFormFeedbackHideTimer = null;
    }, 12000);
  }
}

function initB2BFormExperience() {
  const form = nodes.b2bForm;
  if (!form) return;
  const panes = [...form.querySelectorAll("[data-step-pane]")];
  const chips = [...form.querySelectorAll("[data-step-chip]")];
  const actions = form.querySelector(".contact-step-actions");
  const prevBtn = form.querySelector("[data-step-prev]");
  const nextBtn = form.querySelector("[data-step-next]");
  const submitBtn = form.querySelector("[data-step-submit]");
  let currentStep = 0;

  const setStep = (index) => {
    currentStep = Math.max(0, Math.min(index, panes.length - 1));
    panes.forEach((pane, idx) => pane.classList.toggle("active", idx === currentStep));
    chips.forEach((chip, idx) => chip.classList.toggle("active", idx === currentStep));
    if (actions) {
      actions.classList.toggle("is-first", currentStep === 0);
      actions.classList.toggle("is-last", currentStep === panes.length - 1);
    }
    form.setAttribute("data-step-current", String(currentStep));
  };
  form.__setB2BStep = setStep;

  const validateStep = (index) => {
    const pane = panes[index];
    if (!pane) return true;
    const V = window.AntaresValidation;
    if (V && typeof V.validateDomForm === "function") {
      const domVal = V.validateDomForm(pane);
      if (!domVal.ok) {
        domVal.firstInvalid?.focus?.();
        return false;
      }
    }
    const requiredFields = [...pane.querySelectorAll("input[required], select[required], textarea[required]")];
    let firstInvalid = null;
    requiredFields.forEach((field) => {
      const value = String(field.value || "").trim();
      if (!value) {
        setFieldError(field, V?.MSG?.required || "Este campo es obligatorio.");
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }
    return true;
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => setStep(currentStep - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      syncPhoneHiddenFull(form, "b2b");
      if (!validateStep(currentStep)) return;
      setStep(currentStep + 1);
    });
  }
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      syncPhoneHiddenFull(form, "b2b");
      if (!validateStep(currentStep)) return;
    });
  }

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLTextAreaElement) return;
    if (currentStep >= panes.length - 1) return;
    event.preventDefault();
    syncPhoneHiddenFull(form, "b2b");
    if (!validateStep(currentStep)) return;
    setStep(currentStep + 1);
  });

  setStep(0);

  const ccB2b = form.querySelector(".js-b2b-phone-cc");
  if (ccB2b && ccB2b.options.length === 0) {
    ccB2b.innerHTML = registerPhoneCountryOptionsHtml();
  }
  const b2bPhoneNat = form.querySelector(".js-b2b-phone-national");
  const b2bPhoneCc = form.querySelector(".js-b2b-phone-cc");
  if (b2bPhoneNat) {
    b2bPhoneNat.addEventListener("input", () => {
      syncPhoneHiddenFull(form, "b2b");
      clearFieldError(b2bPhoneNat);
    });
  }
  if (b2bPhoneCc) {
    b2bPhoneCc.addEventListener("change", () => {
      clearFieldError(b2bPhoneNat);
      updatePhoneFieldForCountry(form, "b2b");
      syncPhoneHiddenFull(form, "b2b");
    });
  }
  updatePhoneFieldForCountry(form, "b2b");
  syncPhoneHiddenFull(form, "b2b");

  const emailInput = form.querySelector("input[name='email']");
  const messageInput = form.querySelector("textarea[name='message']");

  if (emailInput) {
    emailInput.addEventListener("input", () => clearFieldError(emailInput));
  }
  if (messageInput) {
    messageInput.addEventListener("input", () => clearFieldError(messageInput));
  }

  form.querySelectorAll("input,select,textarea").forEach((field) => {
    field.addEventListener("change", () => clearFieldError(field));
  });
}

function nowIso() {
  return colombiaNowIso();
}

function stampCreatedRecord(record, ts = nowIso()) {
  return {
    ...record,
    createdAt: record?.createdAt || ts,
    updatedAt: record?.updatedAt || ts
  };
}

function stampUpdatedRecord(record, ts = nowIso()) {
  return {
    ...record,
    updatedAt: ts
  };
}

function readModuleAuditLogs() {
  const rows = read(KEYS.moduleAuditLogs, []);
  return Array.isArray(rows) ? rows : [];
}

function appendModuleAuditLog(entry) {
  const row = entry && typeof entry === "object" ? entry : {};
  const at = String(row.at || nowIso()).trim();
  if (!at) return;
  const list = readModuleAuditLogs();
  list.unshift({
    id: String(row.id || newUuidV4()),
    at,
    action: String(row.action || "update"),
    moduleId: String(row.moduleId || "").trim(),
    moduleLabel: String(row.moduleLabel || row.moduleId || "Módulo").trim(),
    entityId: String(row.entityId || "").trim(),
    entityLabel: String(row.entityLabel || "Registro").trim(),
    summary: String(row.summary || "").trim(),
    actor: String(row.actor || currentUser()?.email || currentUser()?.name || "—").trim(),
    detailAction: String(row.detailAction || "").trim(),
    detailId: String(row.detailId || "").trim()
  });
  write(KEYS.moduleAuditLogs, list.slice(0, 600));
}

function buildRouteRateEntry(value, companyIds, previousEntry = null, ts = nowIso()) {
  const prev = previousEntry && typeof previousEntry === "object" ? previousEntry : {};
  const ids = Array.isArray(companyIds) ? companyIds.map(String).filter(Boolean) : [];
  const existingId = String(prev.id || "").trim();
  return {
    value: parseNum(value),
    companyIds: ids,
    id: existingId || newUuidV4(),
    createdAt: prev.createdAt || ts,
    updatedAt: ts
  };
}

function nowLocalIso() {
  return colombiaNowIso().slice(0, 19);
}

function getColombiaDateParts(dateValue = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: CO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(dateValue);
  const pick = (type) => parts.find((part) => part.type === type)?.value || "00";
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second")
  };
}

function colombiaNowIso() {
  const p = getColombiaDateParts(new Date());
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}-05:00`;
}

function colombiaTodayIsoDate() {
  const p = getColombiaDateParts(new Date());
  return `${p.year}-${p.month}-${p.day}`;
}

/** Año calendario después de una fecha `YYYY-MM-DD` (p. ej. vencimiento SOAT un año tras expedición). */
function addCalendarYearsIsoDate(isoDateStr, years = 1) {
  const raw = String(isoDateStr || "").trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  const dt = new Date(y, mo - 1, d);
  if (Number.isNaN(dt.getTime())) return "";
  const n = Number(years);
  const deltaYears = Number.isFinite(n) && n !== 0 ? n : 1;
  dt.setFullYear(dt.getFullYear() + deltaYears);
  const oy = dt.getFullYear();
  const om = String(dt.getMonth() + 1).padStart(2, "0");
  const od = String(dt.getDate()).padStart(2, "0");
  return `${oy}-${om}-${od}`;
}

/** SOAT y tecnomecánica: al cambiar fecha de expedición, sugerir vencimiento un año después. */
function bindVehicleDocExpiryAutoFill(formEl) {
  if (!formEl || typeof formEl.querySelector !== "function") return;
  const soatExpEl = queryPortalDateField(formEl, "soatExpeditionDate");
  const soatVenEl = queryPortalDateField(formEl, "soatExpiryDate");
  if (soatExpEl && soatVenEl) {
    const syncSoat = () => {
      const iso = readFormDateIso(formEl, "soatExpeditionDate");
      const next = addCalendarYearsIsoDate(iso, 1);
      if (next) window.AntaresValidation?.portalDateInputSetIso?.(soatVenEl, next);
    };
    soatExpEl.addEventListener("change", syncSoat);
    soatExpEl.addEventListener("blur", syncSoat);
  }
  const techExpEl = queryPortalDateField(formEl, "techInspectionExpeditionDate");
  const techVenEl = queryPortalDateField(formEl, "techInspectionExpiryDate");
  if (techExpEl && techVenEl) {
    const syncTech = () => {
      const iso = readFormDateIso(formEl, "techInspectionExpeditionDate");
      const next = addCalendarYearsIsoDate(iso, 1);
      if (next) window.AntaresValidation?.portalDateInputSetIso?.(techVenEl, next);
    };
    techExpEl.addEventListener("change", syncTech);
    techExpEl.addEventListener("blur", syncTech);
  }
}

/** Valor para `input type="datetime-local"` (sin offset): misma pared de reloj que America/Bogota. */
function colombiaDatetimeLocalString(dateValue = new Date()) {
  const p = getColombiaDateParts(dateValue);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Texto legible para valores guardados desde `datetime-local` (YYYY-MM-DDTHH:mm). */
function formatInterviewWhenDisplay(whenRaw) {
  const s = String(whenRaw || "").trim();
  if (!s) return "—";
  let d;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) {
    d = new Date(`${s}:00`);
  } else {
    d = new Date(s);
  }
  if (!Number.isFinite(d.getTime())) return s;
  try {
    return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  } catch (_e) {
    return s;
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isDataUrl(value) {
  return /^data:/i.test(String(value || "").trim());
}

function normalizeCompaniesForSync(companies) {
  const list = Array.isArray(companies) ? companies : [];
  if (!window.AntaresApi?.isConfigured?.()) return list;
  return list.map((company) => {
    const logoUrl = String(company?.logoUrl || "").trim();
    if (!isDataUrl(logoUrl)) return company;
    return { ...company, logoUrl: "" };
  });
}

/** Para persistencia en BD/sincronización: sin tildes; ñ → n (ASCII estable). */
function normalizeLatinForDb(value) {
  if (value == null) return "";
  return String(value)
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N");
}

/**
 * Teléfono en admin edición / alta usuario / perfil: acepta +57, espacios y separadores.
 * Quita el patrón HTML solo-dígitos que bloqueaba "+57 …".
 * — Colombia: 10 dígitos nacionales o prefijo 57 + 10 → guarda "+57 XXX XXX XX XX".
 * — Otros: si solo dígitos y longitud internacional típica → "+…".
 */
function normalizePortalPhoneForStorage(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return "";
  const d = trimmed.replace(/\D/g, "");
  if (!d) return trimmed.replace(/\s+/g, " ").trim();

  let national = d;
  if (d.startsWith("57") && d.length >= 11) {
    national = d.slice(2);
  }

  if (/^\d{10}$/.test(national)) {
    const n = national;
    return `+57 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`;
  }

  if (d.startsWith("57")) {
    return `+${d}`;
  }

  if (/^\d{11,15}$/.test(d)) {
    return `+${d}`;
  }

  return trimmed.replace(/\s+/g, " ").trim();
}

/** Listados y tarjetas: mismo criterio que al guardar cuando solo hay dígitos (p. ej. fijo medellín → +57 …). */
function formatPortalPhoneForDisplay(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const normalized = normalizePortalPhoneForStorage(s);
  return normalized && /\d/.test(normalized) ? normalized : s;
}

/** Nombres, cargo, dirección, etc.: mayúsculas + sin tildes (uniforme en BD y listados). No usar en correo/contraseña ni en valores de catálogo (departamento/ciudad). */
function normalizeLatinUpperForDb(value) {
  return normalizeLatinForDb(value).toUpperCase();
}

/** tipo_persona siempre "Natural" | "Juridica": una sola forma al persistir; las consultas usan = sin LOWER(). */
function normalizePersonTypeForDb(value) {
  const k = normalizeLatinForDb(value).toLowerCase();
  if (k === "juridica") return "Juridica";
  return "Natural";
}

/** tipo_vinculo_registro / registrationKind: siempre "cliente" | "empleado_interno". */
function normalizeRegistrationKindForDb(value) {
  const k = String(value || "")
    .trim()
    .toLowerCase();
  return k === "empleado_interno" ? "empleado_interno" : "cliente";
}

/** empresas.tipo_relacion_empresa / companyKind: cliente | tercero | propia */
function normalizeCompanyKindForDb(value) {
  const k = String(value || "")
    .trim()
    .toLowerCase();
  if (k === "tercero") return "tercero";
  if (k === "propia") return "propia";
  return "cliente";
}

function companyKindLabel(kind) {
  const k = normalizeCompanyKindForDb(kind);
  if (k === "propia") return "Empresa propia (Antares)";
  if (k === "tercero") return "Tercero";
  return "Cliente";
}

/** Claves de payload que no deben normalizarse (contraseñas, hashes, credenciales satelital). */
function isPasswordPayloadKey(key) {
  const k = String(key || "").trim();
  if (!k) return false;
  if (
    k === "password" ||
    k === "passwordHash" ||
    k === "passwordConfirm" ||
    k === "confirmPassword" ||
    k === "newPassword" ||
    k === "oldPassword" ||
    k === "currentPassword" ||
    k === "satelliteProviderPassword" ||
    k === "hash_contrasena" ||
    k === "hashContrasena" ||
    k === "password_proveedor_satelite"
  ) {
    return true;
  }
  const lower = k.toLowerCase();
  return lower.includes("password") || lower.includes("contrasena");
}

/** Normaliza strings en objetos de formulario/autorización (delegado en AntaresValidation). */
function normalizePayloadTextFields(payload) {
  const fn = window.AntaresValidation?.normalizePayloadTextFields;
  if (typeof fn === "function") return fn(payload);
  return payload;
}

/** Valida, aplica mayúsculas en campos de texto y devuelve false si el formulario no es válido. */
function prepareCreationFormForSubmit(formEl) {
  const V = window.AntaresValidation;
  if (!V || !formEl) return true;
  V.decorateFormFields?.(formEl);
  const domVal = V.validateDomForm(formEl);
  if (!domVal.ok) {
    domVal.firstInvalid?.focus?.();
    const detail = readInlineOrNativeFieldError(domVal.firstInvalid);
    notify(detail || userMessage("validationStep"), "error");
    return false;
  }
  V.applyDomFormPatch?.(formEl, domVal.patch);
  return true;
}

/** Lee FormData tras validación previa y normaliza texto para BD (todos los módulos). */
function readFormEntriesNormalized(formEl) {
  const fn = window.AntaresValidation?.readFormEntriesNormalized;
  if (typeof fn === "function") return fn(formEl);
  if (!formEl) return {};
  return normalizePayloadTextFields(Object.fromEntries(new FormData(formEl).entries()));
}

/** Chip en tarjetas (`.role-chip` fuerza mayúsculas); texto corto para no desalinear la cabecera. */
function companyKindChipShortLabel(kind) {
  const k = normalizeCompanyKindForDb(kind);
  if (k === "propia") return "Propia";
  if (k === "tercero") return "Tercero";
  return "Cliente";
}

function isCompanyRecordActive(c) {
  return c && c.active !== false;
}

function companyKindChipHtml(kind) {
  const k = normalizeCompanyKindForDb(kind);
  const colors = { cliente: "#0E7490", tercero: "#7C3AED", propia: "#377cc0" };
  return `<span class="role-chip company-kind-chip" style="--role-color:${colors[k] || "#64748B"}">${escapeHtml(companyKindChipShortLabel(k))}</span>`;
}

/**
 * Una sola fila con nombre canónico "antares" como cliente y sin otra empresa "propia":
 * se interpreta como operador (misma semántica que tipo_relacion propia en BD).
 */
function patchOperatorCompanyKindIfNeeded(companies) {
  if (!Array.isArray(companies) || companies.length === 0) return companies;
  const normName = (n) =>
    normalizeLatinForDb(String(n || ""))
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  const antaresRows = companies.filter((c) => normName(c.name) === "antares");
  if (antaresRows.length !== 1) return companies;
  const hasPropia = companies.some((c) => normalizeCompanyKindForDb(c.companyKind) === "propia");
  if (hasPropia) return companies;
  const targetId = String(antaresRows[0].id ?? "");
  return companies.map((c) => {
    if (String(c.id ?? "") !== targetId) return c;
    if (normalizeCompanyKindForDb(c.companyKind) !== "cliente") return c;
    return { ...c, companyKind: "propia" };
  });
}

function isPersonTypeJuridica(value) {
  return normalizePersonTypeForDb(value) === "Juridica";
}

function validatePasswordPolicy(password) {
  const p = String(password || "");
  if (p.length < 10) return { ok: false, key: "passwordPolicyLength" };
  if (!/[a-z]/.test(p)) return { ok: false, key: "passwordPolicyLower" };
  if (!/[A-Z]/.test(p)) return { ok: false, key: "passwordPolicyUpper" };
  if (!/[0-9]/.test(p)) return { ok: false, key: "passwordPolicyDigit" };
  if (!/[^A-Za-z0-9]/.test(p)) return { ok: false, key: "passwordPolicySpecial" };
  return { ok: true };
}

function getPasswordStrengthReport(password) {
  const p = String(password || "");
  const checks = [
    { rule: "len", ok: p.length >= 10 },
    { rule: "lower", ok: /[a-z]/.test(p) },
    { rule: "upper", ok: /[A-Z]/.test(p) },
    { rule: "digit", ok: /[0-9]/.test(p) },
    { rule: "special", ok: /[^A-Za-z0-9]/.test(p) }
  ];
  const met = checks.filter((c) => c.ok).length;
  const pct = Math.round((met / 5) * 100);
  let tier = "weak";
  if (pct >= 80) tier = "strong";
  else if (pct >= 60) tier = "good";
  else if (pct >= 40) tier = "fair";
  let headline = "Indique una contraseña segura";
  if (p.length > 0) {
    if (met === 5) headline = "Excelente: cumple todos los requisitos";
    else if (met === 4) headline = "Muy buena: falta un detalle";
    else if (met === 3) headline = "Media: refuerce los puntos pendientes";
    else if (met >= 1) headline = "Débil: complete más requisitos";
    else headline = "Muy débil: siga las indicaciones";
  }
  return { pct, tier, met, checks, headline };
}

/** Panel de fortaleza (barra, píldora %, checklist). El contenedor incluye .password-strength-bar-fill, .password-strength-pill, .password-strength-headline, .password-rule-grid li[data-rule]. */
function bindPasswordStrengthSuite(passInput, container) {
  if (!passInput || !container) return;
  const fill = container.querySelector(".password-strength-bar-fill");
  const pill = container.querySelector(".password-strength-pill");
  const headline = container.querySelector(".password-strength-headline");
  const bar = container.querySelector(".password-strength-bar");
  const rules = [...container.querySelectorAll(".password-rule-grid li[data-rule]")];
  const sync = () => {
    const r = getPasswordStrengthReport(passInput.value);
    const active = passInput.value.length > 0;
    const complete = r.met === 5;
    if (fill) {
      fill.style.width = `${r.pct}%`;
      fill.className = `password-strength-bar-fill password-strength-bar-fill--${r.tier}`;
    }
    if (bar) {
      bar.setAttribute("aria-valuenow", String(r.pct));
      bar.classList.toggle("password-strength-bar--active", active);
      bar.classList.toggle("password-strength-bar--complete", complete);
    }
    if (pill) {
      pill.textContent = `${r.pct}%`;
      pill.className = `password-strength-pill password-strength-pill--${r.tier}`;
    }
    if (headline) headline.textContent = r.headline;
    for (const li of rules) {
      const key = li.getAttribute("data-rule");
      const ok = r.checks.find((c) => c.rule === key)?.ok;
      li.classList.toggle("password-rule-met", Boolean(ok));
    }
  };
  passInput.addEventListener("input", sync);
  sync();
}

async function hashPassword(raw) {
  const input = String(raw || "");
  if (!input) return "";
  if (input.startsWith("sha256:")) return input;
  if (!window.crypto?.subtle) return `sha256:${btoa(input)}`;
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hex = [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256:${hex}`;
}

async function verifyPassword(raw, storedHash) {
  if (!String(storedHash || "").startsWith("sha256:")) {
    return String(raw || "") === String(storedHash || "");
  }
  const hashed = await hashPassword(raw);
  return hashed === storedHash;
}

function readCounters() {
  return read(KEYS.counters, {});
}

function nextCounter(prefix) {
  const counters = readCounters();
  const current = Number(counters[prefix] || 0) + 1;
  counters[prefix] = current;
  write(KEYS.counters, counters);
  return current;
}

function makeRequestNumber(existingNumbers = new Set()) {
  let code = `SOL-${String(nextCounter("request")).padStart(6, "0")}`;
  while (existingNumbers.has(code)) {
    code = `SOL-${String(nextCounter("request")).padStart(6, "0")}`;
  }
  return code;
}

function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CO", { timeZone: CO_TIMEZONE });
}

function fmtDateOr(value, fallback = "—") {
  const ymd = normalizePortalDateYmd(value);
  if (!ymd) return fallback;
  const dmy = window.AntaresValidation?.formatIsoDateToDmy?.(ymd);
  return dmy || ymd;
}

function addYears(dateValue, years) {
  const d = new Date(dateValue);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function daysUntil(dateValue) {
  const target = new Date(dateValue).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((target - now) / 86400000);
}

/** Para inputs `type="date"` y datos desde API/pg (DATE, ISO con hora). */
function normalizePortalDateYmd(raw) {
  if (raw == null || raw === "") return "";
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString().slice(0, 10);
  const s = String(raw).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const dmy = window.AntaresValidation?.parseDmyToIsoDate?.(s);
  if (dmy) return dmy;
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return "";
}

/** Monta DD/MM/AAAA y sincroniza valores ISO en un contenedor (vista, modal, filtros). */
function portalUpgradeDates(root) {
  const V = window.AntaresValidation;
  const scope = root || nodes.viewRoot || document;
  if (!V || !scope?.querySelectorAll) return;
  V.prepareFormsInRoot?.(scope);
}

/** Campo de fecha visible (DMY) o nativo dentro de un formulario o panel. */
function queryPortalDateField(root, fieldNameOrId) {
  return window.AntaresValidation?.findPortalDateVisibleInForm?.(root, fieldNameOrId) || null;
}

/** Lee fecha ISO desde un campo del formulario (DMY, hidden o nativo). */
function readFormDateIso(root, fieldNameOrId) {
  const el = queryPortalDateField(root, fieldNameOrId);
  if (!el) return "";
  const iso = window.AntaresValidation?.portalDateInputValueIso?.(el);
  return iso || normalizePortalDateYmd(el.value) || "";
}

/** Asigna fecha ISO a un campo por `name` o `id` (visible DMY + hidden). */
function setFormDateByName(form, fieldName, isoYmd) {
  const ymd = normalizePortalDateYmd(isoYmd);
  if (!form || !fieldName || !ymd) return;
  window.AntaresValidation?.setPortalFormDateByName?.(form, fieldName, ymd);
}

function setFormDateById(root, elementId, isoYmd) {
  const ymd = normalizePortalDateYmd(isoYmd);
  if (!root || !elementId || !ymd) return;
  window.AntaresValidation?.setPortalFormDateById?.(root, elementId, ymd);
}

function clearFormDateInput(el) {
  window.AntaresValidation?.clearPortalDateInput?.(el);
}

/** Suma un año calendario a `YYYY-MM-DD` (local), para vigencias de examen. */
function addOneYearToYmd(ymd) {
  const n = normalizePortalDateYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const y = Number(p[1]);
  const mo = Number(p[2]) - 1;
  const day = Number(p[3]);
  const d = new Date(y, mo, day);
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Centro de costos: clave portal `costCenter` ↔ columna BD `centro_costos`. */
function resolvePayrollEmployeeCostCenter(emp) {
  if (!emp || typeof emp !== "object") return "";
  const direct = String(emp.costCenter ?? "").trim();
  if (direct) return direct;
  return String(emp.centro_costos ?? emp.centroCostos ?? "").trim();
}

/**
 * Fechas de ficha de nómina en formato `YYYY-MM-DD` para formularios y caché local.
 * Acepta alias snake_case por si algún flujo devuelve columnas crudas de BD.
 */
function normalizePayrollEmployeeRowDates(emp) {
  if (!emp || typeof emp !== "object") return emp;
  const e = { ...emp };
  const first = (...vals) => {
    for (const v of vals) {
      if (v != null && String(v).trim() !== "") return v;
    }
    return "";
  };
  e.birthDate = normalizePortalDateYmd(first(e.birthDate, e.fecha_nacimiento));
  e.licenseExpiry = normalizePortalDateYmd(first(e.licenseExpiry, e.fecha_vencimiento_licencia));
  e.startDate = normalizePortalDateYmd(first(e.startDate, e.fecha_ingreso));
  e.contractVigenteStartDate = normalizePortalDateYmd(
    first(e.contractVigenteStartDate, e.fecha_inicio_contrato_vigente)
  );
  e.occupationalExamDate = normalizePortalDateYmd(
    first(
      e.occupationalExamDate,
      e.psychoTestDate,
      e.fecha_examen_ocupacional,
      e.fecha_examen_psicosensometrico
    )
  );
  e.occupationalExamExpiry = normalizePortalDateYmd(
    first(
      e.occupationalExamExpiry,
      e.psychoTestExpiry,
      e.fecha_vencimiento_examen_ocupacional,
      e.fecha_vencimiento_psicosensometrico
    )
  );
  e.instruvialExamDate = normalizePortalDateYmd(
    first(
      e.instruvialExamDate,
      e.intravehicularExamDate,
      e.fecha_examen_instruvial,
      e.fecha_examen_intravehicular
    )
  );
  e.instruvialExamExpiry = normalizePortalDateYmd(
    first(
      e.instruvialExamExpiry,
      e.intravehicularExamExpiry,
      e.fecha_vencimiento_examen_instruvial,
      e.fecha_vencimiento_examen_intravehicular
    )
  );
  if (e.occupationalExamDate && !e.occupationalExamExpiry) {
    e.occupationalExamExpiry = addOneYearToYmd(e.occupationalExamDate);
  }
  if (e.instruvialExamDate && !e.instruvialExamExpiry) {
    e.instruvialExamExpiry = addOneYearToYmd(e.instruvialExamDate);
  }
  e.psychoTestDate = e.occupationalExamDate;
  e.psychoTestExpiry = e.occupationalExamExpiry;
  e.contractEndDate = normalizePortalDateYmd(first(e.contractEndDate, e.fecha_fin_contrato));
  Object.assign(e, ensureEmployeeContractFields(e));
  e.costCenter = resolvePayrollEmployeeCostCenter(e) || String(first(e.costCenter, e.centro_costos, e.centroCostos) || "").trim();
  if (!String(e.contractDuration || "").trim()) {
    e.contractDuration = String(
      first(e.contractDuration, e.contractDurationText, e.duracion_contrato_texto) || ""
    ).trim();
  }
  e.documentType =
    matchCatalogOptionValue(CO_CATALOGS.documentTypes, e.documentType) || String(e.documentType || "CC").trim();
  e.gender = matchCatalogOptionValue(CO_CATALOGS.genders, e.gender);
  e.maritalStatus = matchCatalogOptionValue(CO_CATALOGS.maritalStatus, e.maritalStatus);
  e.educationLevel = matchCatalogOptionValue(CO_CATALOGS.educationLevel, e.educationLevel);
  e.bloodType = matchCatalogOptionValue(CO_CATALOGS.bloodTypes, e.bloodType);
  e.contractType = matchCatalogOptionValue(CO_CATALOGS.contractTypes, e.contractType) || String(e.contractType || "").trim();
  e.payFrequency =
    matchCatalogOptionValue(CO_CATALOGS.payFrequency, e.payFrequency) || String(e.payFrequency || "Mensual").trim();
  e.arlRiskLevel = matchCatalogOptionValue(CO_CATALOGS.arlRiskLevels, e.arlRiskLevel);
  e.workSchedule = matchCatalogOptionValue(CO_CATALOGS.workSchedule, e.workSchedule);
  e.contributorType = matchCatalogOptionValue(CO_CATALOGS.contributorTypes, e.contributorType);
  e.eps = matchCatalogOptionValue(CO_CATALOGS.eps, e.eps);
  e.pensionFund = matchCatalogOptionValue(CO_CATALOGS.pensionFunds, e.pensionFund);
  e.arl = matchCatalogOptionValue(CO_CATALOGS.arl, e.arl);
  e.severanceFund = matchCatalogOptionValue(CO_CATALOGS.severanceFunds, e.severanceFund);
  e.compensationFund = matchCatalogOptionValue(CO_CATALOGS.compensationFunds, e.compensationFund);
  e.bankName = matchCatalogOptionValue(CO_CATALOGS.banks, e.bankName);
  e.bankAccountType = matchCatalogOptionValue(CO_CATALOGS.accountTypes, e.bankAccountType || "Ahorros");
  e.licenseCategory = matchCatalogOptionValue(CO_CATALOGS.licenseCategories, e.licenseCategory);
  e.defensiveCourse = normalizeDefensiveCourseForPortal(e.defensiveCourse);
  return e;
}

/**
 * Estado de vigencia usando fecha de **vencimiento** si existe (`soatExpiryDate`),
 * si no extrapola desde expedición + 1 año (compatibilidad registros antiguos).
 */
function docExpiryStatus(expeditionDate, expiryDate) {
  const expYmd = expiryDate !== undefined ? normalizePortalDateYmd(expiryDate) : "";
  const exdYmd = normalizePortalDateYmd(expeditionDate);
  let expiresAt;
  if (expYmd) {
    expiresAt = new Date(`${expYmd}T12:00:00`);
  } else if (exdYmd) {
    expiresAt = addYears(new Date(`${exdYmd}T12:00:00`), 1);
  } else {
    return { label: "Sin fecha", cls: "status-rechazada", days: -9999, expiresAt: null };
  }
  if (Number.isNaN(expiresAt.getTime())) {
    return { label: "Sin fecha", cls: "status-rechazada", days: -9999, expiresAt: null };
  }
  const days = daysUntil(expiresAt);
  if (days < 0) return { label: `Vencido hace ${Math.abs(days)} dias`, cls: "status-rechazada", days, expiresAt };
  if (days <= 30) return { label: `Por vencer (${days} dias)`, cls: "status-pendiente", days, expiresAt };
  return { label: `Vigente (${days} dias)`, cls: "status-viaje_asignado", days, expiresAt };
}

function formatRoute(request) {
  const origin = `${request.originDepartment ? `${request.originDepartment}, ` : ""}${request.originCity || "-"}`;
  const destination = `${request.destinationDepartment ? `${request.destinationDepartment}, ` : ""}${request.destinationCity || "-"}`;
  return `${origin} → ${destination}`;
}

/** Hero del modal al aprobar desde tabla de solicitudes o desde Autorizaciones. */
function buildTripApprovalHeroHtml(request, needsTermoking, variant = "table") {
  const route = escapeHtml(formatRoute(request));
  const client = escapeHtml(String(request.clientName || "-"));
  const ref = escapeHtml(String(request.requestNumber || request.id || ""));
  const kgLine = requestTruckRequirementSummaryHtml(request);
  const pickup = fmtDate(request.pickupAt);
  const cargo = escapeHtml(String(request.cargoDescription || "—").trim().slice(0, 120));
  const srcBadge =
    variant === "auth"
      ? `<span class="approve-trip-source-badge">${IC.inbox}<span>Bandeja de autorizaciones</span></span>`
      : `<span class="approve-trip-source-badge approve-trip-source-badge--portal">${IC.compass}<span>Módulo solicitudes</span></span>`;
  const tkPill = needsTermoking
    ? `<span class="approve-trip-pill approve-trip-pill--tk">Termoking</span>`
    : `<span class="approve-trip-pill approve-trip-pill--dry">Sin Termoking</span>`;
  return `
    <div class="approve-trip-hero assign-revamp-hero" role="region" aria-label="Resumen de la solicitud">
      <div class="approve-trip-hero-top">
        ${srcBadge}
        ${tkPill}
      </div>
      <p class="approve-trip-hero-kicker">Confirmación rápida</p>
      <p class="approve-trip-hero-ref"><span class="approve-trip-ref-pill">${ref}</span></p>
      <div class="approve-trip-hero-route">${IC.mapPin}<span>${route}</span></div>
      <div class="approve-trip-hero-grid">
        <div class="approve-trip-hero-cell"><span class="approve-trip-meta-k">Cliente</span><span class="approve-trip-meta-v">${client}</span></div>
        <div class="approve-trip-hero-cell"><span class="approve-trip-meta-k">Camión / carga</span><span class="approve-trip-meta-v">${kgLine}</span></div>
        <div class="approve-trip-hero-cell"><span class="approve-trip-meta-k">Recogida</span><span class="approve-trip-meta-v">${pickup}</span></div>
      </div>
      <p class="approve-trip-hero-cargo"><strong>Carga:</strong> ${cargo}${String(request.cargoDescription || "").trim().length > 120 ? "…" : ""}</p>
    </div>`;
}

function toInputDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const p = getColombiaDateParts(d);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

function routeRateKeyFromRequest(request) {
  const origin = `${String(request?.originDepartment || "").trim()}|${String(request?.originCity || "").trim()}`.toLowerCase();
  const destination = `${String(request?.destinationDepartment || "").trim()}|${String(request?.destinationCity || "").trim()}`.toLowerCase();
  return `${origin}->${destination}`;
}

function buildTripRouteRateKey(originDepartment, originCity, destinationDepartment, destinationCity) {
  const origin = `${String(originDepartment || "").trim()}|${String(originCity || "").trim()}`.toLowerCase();
  const destination = `${String(destinationDepartment || "").trim()}|${String(destinationCity || "").trim()}`.toLowerCase();
  return `${origin}->${destination}`;
}

/** Separador entre clave de ruta y ámbito de empresas en almacenamiento local / sync */
const TRIP_RATE_SCOPE_SEP = "@@";

function tripRateStorageKey(routeKey, companyIds) {
  const ids = Array.isArray(companyIds) ? companyIds.map(String).filter(Boolean).sort() : [];
  const suffix = ids.length ? ids.join(",") : "*";
  return `${routeKey}${TRIP_RATE_SCOPE_SEP}${suffix}`;
}

/** Partes de ruta (depto/ciudad) a partir de la clave de almacenamiento del catálogo de tarifas. */
function parseTripRateStorageKeyToRouteParts(storageKey) {
  const raw = String(storageKey || "");
  const sepIdx = raw.lastIndexOf(TRIP_RATE_SCOPE_SEP);
  const routeOnly = sepIdx === -1 ? raw : raw.slice(0, sepIdx);
  const [orig, dest] = String(routeOnly).split("->");
  const [od, oc] = String(orig || "").split("|");
  const [dd, dc] = String(dest || "").split("|");
  return {
    originDepartment: od || "",
    originCity: oc || "",
    destinationDepartment: dd || "",
    destinationCity: dc || ""
  };
}

function buildRouteRateCompanyCheckboxesHtml(companies, selectedIds = []) {
  const selected = new Set((selectedIds || []).map((id) => String(id).trim()).filter(Boolean));
  const list = Array.isArray(companies) ? companies : [];
  if (!list.length) {
    return `<p class="muted route-rate-clients-empty">No hay empresas registradas. Cree clientes en administración para usar tarifas por empresa.</p>`;
  }
  return list
    .map((c) => {
      const id = String(c.id || "").trim();
      const name = String(c.name || "").trim() || "Sin nombre";
      const labelKey = `${name} ${String(c.taxId || "")}`.trim().toLowerCase();
      const checked = selected.has(id) ? " checked" : "";
      const tax = c.taxId ? `<span class="route-rate-company-tax muted">${escapeHtml(String(c.taxId))}</span>` : "";
      return `<div class="route-rate-company-item" data-company-label="${escapeAttr(labelKey)}" role="listitem">
        <input type="checkbox" name="rateClientCompanies" value="${escapeAttr(id)}" id="${escapeAttr(`route-rate-co-${id}`)}"${checked} />
        <label class="route-rate-company-item-text" for="${escapeAttr(`route-rate-co-${id}`)}"><span class="route-rate-company-name">${escapeHtml(name)}</span>${tax}</label>
      </div>`;
    })
    .join("");
}

/** Paso 4 del formulario de tarifa: alcance general vs empresas (checkboxes + búsqueda). */
function buildRouteRateScopeStepInnerHtml(companies, opts = {}) {
  const o = opts && typeof opts === "object" ? opts : {};
  const selectedIds = (Array.isArray(o.selectedCompanyIds) ? o.selectedCompanyIds : [])
    .map((id) => String(id).trim())
    .filter(Boolean);
  const scope = o.scopeValue === "specific" || selectedIds.length ? "specific" : "all";
  const companyList = Array.isArray(companies) ? companies : [];
  const checkboxes = buildRouteRateCompanyCheckboxesHtml(companyList, selectedIds);
  const totalCompanies = companyList.length;
  return `
    <input type="hidden" name="rateScope" value="${escapeAttr(scope)}" data-route-rate-scope-field />
    <div class="route-rate-scope-cards" role="radiogroup" aria-label="Alcance de la tarifa">
      <button type="button" class="route-rate-scope-card${scope === "all" ? " is-selected" : ""}" data-route-rate-scope-pick="all" aria-pressed="${scope === "all" ? "true" : "false"}">
        <span class="route-rate-scope-card-body">
          <strong class="route-rate-scope-card-title">${IC.grid} General</strong>
          <span class="muted">La misma tarifa para todos los clientes en esta ruta</span>
        </span>
      </button>
      <button type="button" class="route-rate-scope-card${scope === "specific" ? " is-selected" : ""}" data-route-rate-scope-pick="specific" aria-pressed="${scope === "specific" ? "true" : "false"}">
        <span class="route-rate-scope-card-body">
          <strong class="route-rate-scope-card-title">${IC.briefcase} Por empresa</strong>
          <span class="muted">Solo para clientes con precio negociado</span>
        </span>
      </button>
    </div>
    <div class="route-rate-clients-block${scope === "specific" ? " is-active" : " is-disabled"}" data-route-rate-clients-panel>
      <div class="route-rate-clients-block-head">
        <div class="route-rate-company-count-wrap">
          <span class="route-rate-company-count-label">Empresas seleccionadas</span>
          <strong class="route-rate-company-count-value" data-route-rate-company-count>${scope === "specific" ? String(selectedIds.length) : "Todas"}</strong>
        </div>
        <div class="toolbar route-rate-clients-toolbar">
          <button type="button" class="btn btn-sm btn-outline" data-route-rate-select-visible>${IC.check} Visibles</button>
          <button type="button" class="btn btn-sm btn-outline" data-route-rate-select-all>${IC.check} Todas (${totalCompanies})</button>
          <button type="button" class="btn btn-sm btn-outline" data-route-rate-clear-all>${IC.x} Ninguna</button>
        </div>
      </div>
      <div class="route-rate-clients-search-row">
        <input type="search" data-route-rate-clients-search placeholder="Buscar por nombre o NIT…" autocomplete="off" ${scope === "specific" ? "" : "disabled"} />
        <span class="route-rate-clients-filter-meta muted" data-route-rate-clients-filter-meta>${totalCompanies} empresa${totalCompanies === 1 ? "" : "s"}</span>
      </div>
      <div class="route-rate-clients-list" data-route-rate-clients-list role="list" aria-label="Empresas cliente">
        ${checkboxes}
      </div>
    </div>
    <p class="muted route-rate-scope-help" data-route-rate-scope-help></p>`;
}

function wireRouteRateScopeSection(formEl) {
  if (!formEl) return;
  const scopeMount = formEl.querySelector("[data-route-rate-scope-mount]") || formEl;
  const scopeField = scopeMount.querySelector("[data-route-rate-scope-field]");
  const scopePickBtns = scopeMount.querySelectorAll("[data-route-rate-scope-pick]");
  if (!scopeField || !scopePickBtns.length) return;

  const clientsPanel = scopeMount.querySelector("[data-route-rate-clients-panel]");
  const clientsList = scopeMount.querySelector("[data-route-rate-clients-list]");
  const searchInput = scopeMount.querySelector("[data-route-rate-clients-search]");
  const countEl = scopeMount.querySelector("[data-route-rate-company-count]");
  const filterMeta = scopeMount.querySelector("[data-route-rate-clients-filter-meta]");
  const scopeHelp = scopeMount.querySelector("[data-route-rate-scope-help]");
  const selectAllBtn = scopeMount.querySelector("[data-route-rate-select-all]");
  const selectVisibleBtn = scopeMount.querySelector("[data-route-rate-select-visible]");
  const clearAllBtn = scopeMount.querySelector("[data-route-rate-clear-all]");
  const scopeCards = scopeMount.querySelectorAll(".route-rate-scope-card");
  const totalCompanies = clientsList
    ? clientsList.querySelectorAll('input[name="rateClientCompanies"]').length
    : 0;

  const getScope = () => {
    const v = String(scopeField?.value || "all").trim();
    return v === "specific" ? "specific" : "all";
  };

  const setScope = (value) => {
    const v = value === "specific" ? "specific" : "all";
    scopeField.value = v;
    scopePickBtns.forEach((btn) => {
      const on = String(btn.getAttribute("data-route-rate-scope-pick") || "") === v;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };

  const countSelected = () => {
    if (!clientsList) return 0;
    return clientsList.querySelectorAll('input[name="rateClientCompanies"]:checked').length;
  };

  const visibleCompanyItems = () => {
    if (!clientsList) return [];
    return [...clientsList.querySelectorAll(".route-rate-company-item")].filter((item) => !item.hidden);
  };

  const clearCompanySelection = () => {
    if (!clientsList) return;
    clientsList.querySelectorAll('input[name="rateClientCompanies"]').forEach((cb) => {
      cb.checked = false;
    });
  };

  const syncUi = () => {
    const specific = getScope() === "specific";
    if (clientsPanel) {
      clientsPanel.classList.toggle("is-disabled", !specific);
      clientsPanel.classList.toggle("is-active", specific);
    }
    if (selectAllBtn) selectAllBtn.disabled = !specific;
    if (selectVisibleBtn) selectVisibleBtn.disabled = !specific;
    if (clearAllBtn) clearAllBtn.disabled = !specific;
    if (searchInput) searchInput.disabled = !specific;
    if (clientsList) {
      clientsList.querySelectorAll('input[name="rateClientCompanies"]').forEach((cb) => {
        cb.disabled = !specific;
      });
    }
    if (scopeHelp) {
      scopeHelp.textContent = specific
        ? totalCompanies > 80
          ? `Marque las empresas aplicables (hay ${totalCompanies} registradas). Use la búsqueda para filtrar por nombre o NIT.`
          : "Marque una o más empresas. Esta tarifa solo se sugerirá cuando la solicitud sea de esos clientes."
        : "Modo general: la tarifa aplica a todos los clientes en esta ruta.";
    }
    if (countEl) countEl.textContent = specific ? String(countSelected()) : "Todas";
    scopeCards.forEach((card) => {
      const pick = String(card.getAttribute("data-route-rate-scope-pick") || "");
      card.classList.toggle("is-selected", pick === getScope());
    });
  };

  const filterCompanies = () => {
    const needle = String(searchInput?.value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (!clientsList) return;
    let visible = 0;
    clientsList.querySelectorAll(".route-rate-company-item").forEach((item) => {
      const label = String(item.getAttribute("data-company-label") || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const show = !needle || label.includes(needle);
      item.hidden = !show;
      if (show) visible += 1;
    });
    if (filterMeta) {
      filterMeta.textContent = needle
        ? `${visible} de ${totalCompanies} coinciden con la búsqueda`
        : `${totalCompanies} empresa${totalCompanies === 1 ? "" : "s"}`;
    }
    if (selectVisibleBtn) {
      selectVisibleBtn.innerHTML = `${IC.check} Visibles (${visible})`;
    }
  };

  if (scopeMount.dataset.routeRateScopeWired === "1") {
    syncUi();
    filterCompanies();
    return;
  }
  scopeMount.dataset.routeRateScopeWired = "1";

  scopePickBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = String(btn.getAttribute("data-route-rate-scope-pick") || "all");
      setScope(next);
      if (next !== "specific") clearCompanySelection();
      syncUi();
      if (next === "specific") searchInput?.focus();
    });
  });
  if (clientsList) {
    clientsList.addEventListener("change", syncUi);
    clientsList.addEventListener("click", (ev) => {
      if (getScope() !== "specific") return;
      const row = ev.target.closest(".route-rate-company-item");
      if (!row || ev.target.matches('input[type="checkbox"]') || ev.target.closest("label")) return;
      const cb = row.querySelector('input[name="rateClientCompanies"]');
      if (cb && !cb.disabled) {
        cb.checked = !cb.checked;
        syncUi();
      }
    });
  }
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      if (getScope() !== "specific" || !clientsList) return;
      clientsList.querySelectorAll('input[name="rateClientCompanies"]').forEach((cb) => {
        cb.checked = true;
      });
      syncUi();
    });
  }
  if (selectVisibleBtn) {
    selectVisibleBtn.addEventListener("click", () => {
      if (getScope() !== "specific" || !clientsList) return;
      visibleCompanyItems().forEach((item) => {
        const cb = item.querySelector('input[name="rateClientCompanies"]');
        if (cb) cb.checked = true;
      });
      syncUi();
    });
  }
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      clearCompanySelection();
      syncUi();
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterCompanies();
      syncUi();
    });
  }
  syncUi();
  filterCompanies();
}

function openRouteRateInlineEdit(storageKey) {
  const key = String(storageKey || "").trim();
  if (!key) return;
  state.transportTripsUi = { ...(state.transportTripsUi || {}), workspace: "routes" };
  state.createPanels = { ...(state.createPanels || {}), ["create-route-rate"]: true };
  state.pendingRouteRateEditKey = key;
  renderPortalView();
}

function populateRouteRateInlineForm(storageKey) {
  const form = document.getElementById("form-route-rate");
  if (!form) return false;
  const key = String(storageKey || "").trim();
  const entry = getTripRouteRatesNormalized()[key];
  if (!entry) return false;
  const parts = parseTripRateStorageKeyToRouteParts(key);
  const companyIds = (Array.isArray(entry.companyIds) ? entry.companyIds : [])
    .map((id) => String(id).trim())
    .filter(Boolean);
  const scope = companyIds.length ? "specific" : "all";
  const companies = read(KEYS.companies, []);

  const editingKeyInput = form.querySelector("#route-rate-editing-key");
  const submitBtn = form.querySelector("#route-rate-submit-btn");
  const cancelEditBtn = form.querySelector("#route-rate-cancel-edit");
  const editingHint = form.querySelector("#route-rate-editing-hint");
  const tripRateInput = form.querySelector("input[name='tripRateCop']");
  const scopeMount = form.querySelector("[data-route-rate-scope-mount]");

  if (editingKeyInput) editingKeyInput.value = key;
  if (submitBtn) submitBtn.textContent = `${IC.save} Guardar cambios de tarifa`;
  if (cancelEditBtn) cancelEditBtn.style.display = "";
  if (editingHint) {
    editingHint.style.display = "";
    editingHint.textContent = `Editando registro ${String(entry.id || "").trim() || "pendiente"} · creado ${fmtDateOr(
      entry.createdAt,
      "—"
    )} · actualizado ${fmtDateOr(entry.updatedAt || entry.createdAt, "—")}`;
  }
  if (tripRateInput) tripRateInput.value = String(parseNum(entry.value));

  if (scopeMount) {
    scopeMount.innerHTML = buildRouteRateScopeStepInnerHtml(companies, {
      scopeValue: scope,
      selectedCompanyIds: companyIds
    });
    delete form.dataset.routeRateScopeWired;
    const scopeMountNode = form.querySelector("[data-route-rate-scope-mount]");
    if (scopeMountNode) delete scopeMountNode.dataset.routeRateScopeWired;
    wireRouteRateScopeSection(form);
  }

  const originDept = form.querySelector("#route-rate-origin-dept");
  const originCity = form.querySelector("#route-rate-origin-city");
  const destDept = form.querySelector("#route-rate-dest-dept");
  const destCity = form.querySelector("#route-rate-dest-city");
  if (originDept && originCity) {
    setSelectValueInsensitive(originDept, parts.originDepartment);
    originDept.dispatchEvent(new Event("change"));
    setSelectValueInsensitive(originCity, parts.originCity);
  }
  if (destDept && destCity) {
    setSelectValueInsensitive(destDept, parts.destinationDepartment);
    destDept.dispatchEvent(new Event("change"));
    setSelectValueInsensitive(destCity, parts.destinationCity);
  }
  return true;
}

/** Alinea el valor de un `<select>` con opciones aunque difiera mayúsculas/espacios. */
function setSelectValueInsensitive(selectEl, rawValue) {
  if (!selectEl) return;
  const target = String(rawValue || "").trim().toLowerCase();
  if (!target) {
    selectEl.value = "";
    return;
  }
  const options = [...selectEl.options];
  const hit = options.find((opt) => String(opt.value || "").trim().toLowerCase() === target);
  selectEl.value = hit ? hit.value : "";
}

function getTripRouteRatesNormalized() {
  const raw = read(KEYS.tripRouteRates, {});
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  let needWrite = false;
  for (const [k, val] of Object.entries(raw)) {
    if (typeof val === "number" && Number.isFinite(val)) {
      if (!k.includes(TRIP_RATE_SCOPE_SEP)) {
        out[`${k}${TRIP_RATE_SCOPE_SEP}*`] = { value: val, companyIds: [] };
        needWrite = true;
      } else {
        out[k] = { value: val, companyIds: [] };
      }
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      const v = parseNum(val.value ?? 0);
      if (v <= 0) continue;
      const ids = Array.isArray(val.companyIds) ? val.companyIds.map(String).filter(Boolean) : [];
      const meta = {
        id: String(val.id || "").trim() || undefined,
        createdAt: val.createdAt ? String(val.createdAt) : null,
        updatedAt: val.updatedAt ? String(val.updatedAt) : null
      };
      if (!k.includes(TRIP_RATE_SCOPE_SEP)) {
        const suffix = ids.length ? ids.slice().sort().join(",") : "*";
        out[`${k}${TRIP_RATE_SCOPE_SEP}${suffix}`] = { value: v, companyIds: ids, ...meta };
        needWrite = true;
      } else {
        out[k] = { value: v, companyIds: ids, ...meta };
      }
    }
  }
  if (needWrite) write(KEYS.tripRouteRates, out);
  return out;
}

function getConfiguredTripValue(request) {
  const rates = getTripRouteRatesNormalized();
  const rk = routeRateKeyFromRequest(request);
  const cid = String(request?.clientCompanyId || "").trim();
  let bestSpecific = 0;
  let bestGlobal = 0;
  for (const [fullKey, entry] of Object.entries(rates)) {
    const sepIdx = fullKey.lastIndexOf(TRIP_RATE_SCOPE_SEP);
    const routePart = sepIdx === -1 ? fullKey : fullKey.slice(0, sepIdx);
    if (routePart !== rk) continue;
    const v = parseNum(entry.value);
    if (v <= 0) continue;
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    if (!ids.length) {
      if (v > bestGlobal) bestGlobal = v;
    } else if (cid && ids.includes(cid)) {
      if (v > bestSpecific) bestSpecific = v;
    }
  }
  return bestSpecific > 0 ? bestSpecific : bestGlobal;
}

/** Opciones de tarifa guardadas que coinciden con la ruta de la solicitud (misma clave origen→destino). */
function listTripRateOptionsForRequest(request) {
  const rates = getTripRouteRatesNormalized();
  const rk = routeRateKeyFromRequest(request);
  const cid = String(request?.clientCompanyId || "").trim();
  const items = [];
  for (const [storageKey, entry] of Object.entries(rates)) {
    const sepIdx = storageKey.lastIndexOf(TRIP_RATE_SCOPE_SEP);
    const routePart = sepIdx === -1 ? storageKey : storageKey.slice(0, sepIdx);
    if (routePart !== rk) continue;
    const v = parseNum(entry.value);
    if (v <= 0) continue;
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    const scopeLabel = ids.length
      ? ids.map((id) => getCompanyById(id)?.name || id).join(", ")
      : "Todos los clientes";
    const appliesToRequest = !ids.length || (cid && ids.includes(cid));
    items.push({ storageKey, value: v, scopeLabel, appliesToRequest });
  }
  items.sort((a, b) => {
    if (a.appliesToRequest !== b.appliesToRequest) return a.appliesToRequest ? -1 : 1;
    if (b.value !== a.value) return b.value - a.value;
    return String(a.storageKey).localeCompare(String(b.storageKey));
  });
  return items;
}

function humanTripRateRouteLabelFromStorageKey(storageKey) {
  const toSmartTitle = (value) => {
    const raw = String(value || "").trim().replace(/\s+/g, " ");
    if (!raw) return "";
    return raw
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };
  const sepIdx = String(storageKey).lastIndexOf(TRIP_RATE_SCOPE_SEP);
  const routeOnly = sepIdx === -1 ? String(storageKey) : String(storageKey).slice(0, sepIdx);
  const parts = String(routeOnly).split("->");
  if (parts.length < 2) return routeOnly || String(storageKey);
  const fmt = (chunk) => {
    const [dep, city] = String(chunk || "").split("|");
    const d = toSmartTitle(dep);
    const c = toSmartTitle(city);
    if (!d && !c) return "—";
    return c ? `${d}, ${c}` : d || "—";
  };
  return `${fmt(parts[0])} → ${fmt(parts[1])}`;
}

/** Opciones por ruta; si no hay coincidencia, lista todo el catálogo para poder elegir tarifa manualmente. */
function listTripRateOptionsWithFallback(request) {
  const direct = listTripRateOptionsForRequest(request);
  if (direct.length) return direct;
  const rates = getTripRouteRatesNormalized();
  const cid = String(request?.clientCompanyId || "").trim();
  const items = [];
  for (const [storageKey, entry] of Object.entries(rates)) {
    const v = parseNum(entry.value);
    if (v <= 0) continue;
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    const scopeLabel = ids.length
      ? ids.map((id) => getCompanyById(id)?.name || id).join(", ")
      : "Todos los clientes";
    const appliesToRequest = !ids.length || (cid && ids.includes(cid));
    const routeHuman = humanTripRateRouteLabelFromStorageKey(storageKey);
    items.push({
      storageKey,
      value: v,
      scopeLabel: `${routeHuman} · ${scopeLabel}`,
      appliesToRequest
    });
  }
  items.sort((a, b) => {
    if (a.appliesToRequest !== b.appliesToRequest) return a.appliesToRequest ? -1 : 1;
    if (b.value !== a.value) return b.value - a.value;
    return String(a.storageKey).localeCompare(String(b.storageKey));
  });
  return items;
}

function defaultTripRateStorageKeyForRequest(request) {
  const items = listTripRateOptionsWithFallback(request);
  const pref = items.find((i) => i.appliesToRequest);
  return pref ? pref.storageKey : items.length ? items[0].storageKey : "";
}

function initialTripValueForAssignment(request, preferredStorageKey) {
  const rates = getTripRouteRatesNormalized();
  if (preferredStorageKey && rates[preferredStorageKey]) {
    const v = parseNum(rates[preferredStorageKey].value);
    if (v > 0) return v;
  }
  const cfg = getConfiguredTripValue(request);
  if (cfg > 0) return cfg;
  return parseNum(request.tripValue || 0);
}

function wireTripValueMoneyInput(formEl) {
  const num = formEl?.querySelector?.("input[name='tripValue'][data-trip-money-input]");
  if (!num || num.dataset.tripMoneyWired === "1") return;
  num.dataset.tripMoneyWired = "1";
  const formatLive = () => {
    const n = parseMoneyFieldValue(num.value);
    const end = num.selectionEnd;
    num.value = formatMoneyFieldValue(n);
    if (typeof end === "number") {
      const len = num.value.length;
      num.setSelectionRange(len, len);
    }
  };
  num.addEventListener("input", () => {
    formatLive();
    updateCreateTripStepper(formEl);
  });
  num.addEventListener("blur", () => {
    num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
    updateCreateTripStepper(formEl);
  });
  if (num.value) num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
}

/** Campos COP con prefijo $ (formularios de historial flota, etc.). */
function wireMoneyInputs(formEl) {
  if (!formEl) return;
  formEl.querySelectorAll("input[data-money-input='1']").forEach((num) => {
    if (num.dataset.moneyWired === "1") return;
    num.dataset.moneyWired = "1";
    const formatLive = () => {
      num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
      const end = num.selectionEnd;
      if (typeof end === "number") {
        const len = num.value.length;
        num.setSelectionRange(len, len);
      }
    };
    num.addEventListener("input", formatLive);
    num.addEventListener("blur", () => {
      num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
    });
    if (num.value) num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
  });
}

/** Enlaza el selector de tarifa con el campo numérico de precio en el modal de asignación. */
function wireTripRateChoiceSelect(formEl) {
  const sel = formEl.querySelector("select[name='tripRateChoice']");
  const num = formEl.querySelector("input[name='tripValue']");
  const meta = formEl.querySelector("[data-trip-rate-meta]");
  wireTripValueMoneyInput(formEl);
  if (!num) return;
  const setTripValueAmount = (amount) => {
    const n = Math.max(0, parseNum(amount));
    if (num.dataset.tripMoneyInput === "1") num.value = formatMoneyFieldValue(n);
    else num.value = String(n);
    updateCreateTripStepper(formEl);
  };
  if (!sel) return;
  const renderMeta = (storageKey = "") => {
    if (!meta) return;
    if (!storageKey) {
      meta.innerHTML = `<span class="trip-rate-meta-chip trip-rate-meta-chip--muted">Manual</span>`;
      return;
    }
    const rates = getTripRouteRatesNormalized();
    const entry = rates[storageKey];
    if (!entry) {
      meta.innerHTML = `<span class="muted">Tarifa no disponible en catálogo.</span>`;
      return;
    }
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    const clientsLabel = ids.length
      ? ids.map((id) => getCompanyById(id)?.name || id).join(", ")
      : "Todos los clientes";
    meta.innerHTML = `<span class="trip-rate-meta-chip">${escapeHtml(humanTripRateRouteLabelFromStorageKey(storageKey))}</span>
      <span class="trip-rate-meta-chip">${escapeHtml(clientsLabel)}</span>
      <span class="trip-rate-meta-chip trip-rate-meta-chip--value">$${parseNum(entry.value).toLocaleString("es-CO")}</span>`;
  };
  const onRateChange = () => {
    const key = String(sel.value || "").trim();
    if (!key) {
      renderMeta("");
      setTripValueAmount(0);
      return;
    }
    const rates = getTripRouteRatesNormalized();
    const entry = rates[key];
    if (entry && parseNum(entry.value) > 0) setTripValueAmount(entry.value);
    renderMeta(key);
  };
  sel.addEventListener("change", onRateChange);
  if (num.dataset.tripMoneyInput !== "1") {
    num.addEventListener("input", () => updateCreateTripStepper(formEl));
  }
  renderMeta(String(sel.value || "").trim());
}

function createTripSummaryTile(iconKey, label, valueHtml) {
  const inner = IC[String(iconKey || "file")]?.replace(/<svg[^>]*>|<\/svg>/g, "") || "";
  return `<div class="create-trip-summary-tile">
    <span class="create-trip-summary-tile-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></span>
    <div class="create-trip-summary-tile-body">
      <span class="create-trip-sk">${escapeHtml(label)}</span>
      <span class="create-trip-sv">${valueHtml}</span>
    </div>
  </div>`;
}

function createTripEmptyHint(iconKey, title, detail = "") {
  const inner = IC[String(iconKey || "inbox")]?.replace(/<svg[^>]*>|<\/svg>/g, "") || "";
  const detailHtml = detail ? `<p class="create-trip-empty-detail">${escapeHtml(detail)}</p>` : "";
  return `<div class="create-trip-empty-hint assign-trip-empty" role="status">
    <span class="create-trip-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></span>
    <div class="create-trip-empty-copy"><p class="create-trip-empty-title">${escapeHtml(title)}</p>${detailHtml}</div>
  </div>`;
}

/** Resumen compacto de la solicitud (formulario asignar viaje). */
function renderAssignTripRequestPreview(request) {
  const needsTermoking = requestRequiresTermoking(request);
  const assignableByDate = isRequestPickupSameDayOrFuture(request);
  const tkBadge = needsTermoking
    ? `<span class="create-trip-status-pill create-trip-status-pill--info" title="Refrigeración Termoking">TK</span>`
    : `<span class="create-trip-status-pill create-trip-status-pill--neutral" title="Carga seca">Seco</span>`;
  const dateBadge = assignableByDate
    ? `<span class="create-trip-status-pill create-trip-status-pill--ok" title="Fecha de recogida asignable">OK</span>`
    : `<span class="create-trip-status-pill create-trip-status-pill--bad" title="Fecha de recogida vencida">Vencida</span>`;
  const cargo = String(request.cargoDescription || "—").trim();
  const cargoShort = cargo.length > 88 ? `${escapeHtml(cargo.slice(0, 88))}…` : escapeHtml(cargo);
  return `<div class="assign-trip-preview-active create-trip-summary-panel--active">
      <div class="assign-trip-preview-head">
        <p class="assign-trip-preview-route">${IC.mapPin}<span>${escapeHtml(formatRoute(request))}</span></p>
        <div class="assign-trip-preview-badges">${tkBadge}${dateBadge}</div>
      </div>
      <dl class="assign-trip-preview-facts">
        <div><dt>Cliente</dt><dd>${escapeHtml(String(request.clientName || "—"))}</dd></div>
        <div><dt>Solicita</dt><dd>${escapeHtml(String(request.requestedByName || "—"))}</dd></div>
        <div><dt>Camión</dt><dd>${requestTruckRequirementSummaryHtml(request)}</dd></div>
        <div><dt>Recogida</dt><dd>${escapeHtml(fmtDate(request.pickupAt))}</dd></div>
        <div class="assign-trip-preview-facts--wide"><dt>Carga</dt><dd>${cargoShort}</dd></div>
      </dl>
    </div>`;
}

/** Actualiza stepper y checklist de preparación del formulario asignar viaje. */
function updateCreateTripStepper(formEl) {
  if (!formEl) return;
  const steps = [...formEl.querySelectorAll(".create-trip-step")];
  if (!steps.length) return;
  const requestId = String(formEl.querySelector("select[name='requestId']")?.value || "").trim();
  const request = requestId ? reqRead().find((r) => r.id === requestId) : null;
  const assignable = !!(request && isRequestPickupSameDayOrFuture(request));
  const vehicleId = String(formEl.querySelector("select[name='vehicleId']")?.value || "").trim();
  const driverId = String(formEl.querySelector("select[name='driverId']")?.value || "").trim();
  const tripValue = parseMoneyFieldValue(formEl.querySelector("input[name='tripValue']")?.value || 0);
  const step1Done = !!requestId && assignable;
  const step2Done = step1Done && !!vehicleId && !!driverId;
  const step3Done = step2Done && tripValue > 0;
  let current = 1;
  if (step1Done) current = 2;
  if (step2Done) current = 3;

  steps.forEach((el, i) => {
    const n = i + 1;
    el.classList.remove("create-trip-step--current", "create-trip-step--done", "create-trip-step--locked");
    if ((n === 1 && step1Done) || (n === 2 && step2Done) || (n === 3 && step3Done)) el.classList.add("create-trip-step--done");
    if (n === current) el.classList.add("create-trip-step--current");
    if ((n === 2 && !step1Done) || (n === 3 && !step2Done)) el.classList.add("create-trip-step--locked");
    el.setAttribute("aria-current", n === current ? "step" : "false");
  });

  const checklist = formEl.querySelector("[data-create-trip-readiness]");
  if (checklist) {
    const items = [
      { done: !!requestId, label: "Solicitud", short: "Sol." },
      { done: assignable, label: "Fecha válida", short: "Fecha" },
      { done: !!vehicleId, label: "Vehículo", short: "Veh." },
      { done: !!driverId, label: "Conductor", short: "Cond." },
      { done: tripValue > 0, label: "Precio", short: "Precio" }
    ];
    checklist.innerHTML = items
      .map(
        (it) =>
          `<li class="create-trip-readiness-item assign-trip-check${it.done ? " is-done" : ""}" title="${escapeAttr(it.label)}"><span class="create-trip-readiness-mark" aria-hidden="true">${it.done ? IC.check : ""}</span><span class="assign-trip-check-label">${escapeHtml(it.short)}</span></li>`
      )
      .join("");
  }

  const submitBtn = formEl.querySelector(".create-trip-submit-btn");
  if (submitBtn) submitBtn.classList.toggle("create-trip-submit-btn--ready", step1Done && step2Done && tripValue > 0);
}

/** Select con búsqueda por texto (listas largas de flota / conductores). */
const SEARCHABLE_SELECT_MIN_OPTIONS = 8;

function getSearchableSelectParts(selectEl) {
  const wrap = selectEl?.closest?.(".searchable-select");
  if (!wrap) return null;
  return {
    wrap,
    input: wrap.querySelector(".searchable-select-input"),
    list: wrap.querySelector(".searchable-select-dropdown"),
    select: selectEl
  };
}

function syncSearchableSelectInputFromValue(selectEl) {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.input) return;
  const opt = selectEl.options[selectEl.selectedIndex];
  parts.input.value = opt && String(opt.value || "").trim() ? String(opt.textContent || "").trim() : "";
}

function renderSearchableSelectDropdown(selectEl, filterText = "") {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.list) return [];
  const needle = String(filterText || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const rows = [...selectEl.options]
    .map((opt) => {
      const text = String(opt.textContent || "").trim();
      const value = String(opt.value || "");
      if (!text && !value) return null;
      const hay = `${text} ${value}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (needle && !hay.includes(needle)) return null;
      return { text, value, disabled: opt.disabled };
    })
    .filter(Boolean);
  if (!rows.length) {
    parts.list.innerHTML = `<li class="searchable-select-empty" role="presentation">Sin coincidencias</li>`;
    parts.list.classList.remove("hidden");
    return rows;
  }
  parts.list.innerHTML = rows
    .map(
      (row) =>
        `<li role="option" data-value="${escapeAttr(row.value)}" class="searchable-select-option${row.disabled ? " is-disabled" : ""}"${row.disabled ? ' aria-disabled="true"' : ""} tabindex="-1">${escapeHtml(row.text)}</li>`
    )
    .join("");
  parts.list.classList.remove("hidden");
  return rows;
}

function positionSearchableSelectDropdown(selectEl) {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.list || !parts.input) return;
  parts.list.classList.remove("searchable-select-dropdown--fixed");
  parts.list.style.left = "";
  parts.list.style.top = "";
  parts.list.style.width = "";
  parts.list.style.maxHeight = "";
}

function openSearchableSelectDropdown(selectEl, filterText = "") {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.input || parts.input.disabled) return;
  renderSearchableSelectDropdown(selectEl, filterText ?? parts.input.value);
  parts.wrap.classList.add("searchable-select--open");
  parts.input.setAttribute("aria-expanded", "true");
  positionSearchableSelectDropdown(selectEl);
}

function closeSearchableSelectDropdown(selectEl) {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.list) return;
  parts.list.classList.add("hidden");
  parts.list.classList.remove("searchable-select-dropdown--fixed");
  parts.list.style.left = "";
  parts.list.style.top = "";
  parts.list.style.width = "";
  parts.wrap?.classList.remove("searchable-select--open");
  parts.input?.setAttribute("aria-expanded", "false");
}

function refreshSearchableSelect(selectEl) {
  if (!selectEl || selectEl.dataset.searchableMounted !== "1") return;
  syncSearchableSelectInputFromValue(selectEl);
  const parts = getSearchableSelectParts(selectEl);
  if (parts?.list) parts.list.classList.add("hidden");
}

function mountSearchableSelect(selectEl, opts = {}) {
  if (!selectEl || selectEl.tagName !== "SELECT") return;
  const force = !!(opts && opts.force);
  if (selectEl.dataset.searchableMounted === "1") {
    refreshSearchableSelect(selectEl);
    return;
  }
  if (!force && selectEl.options.length < SEARCHABLE_SELECT_MIN_OPTIONS) return;

  const placeholder =
    String(selectEl.getAttribute("data-searchable-placeholder") || "").trim() || "Escriba para buscar…";
  const wrap = document.createElement("div");
  wrap.className = "searchable-select";
  selectEl.parentNode.insertBefore(wrap, selectEl);
  wrap.appendChild(selectEl);

  const input = document.createElement("input");
  input.type = "search";
  input.className = "searchable-select-input";
  input.setAttribute("autocomplete", "off");
  input.setAttribute("spellcheck", "false");
  input.setAttribute("aria-autocomplete", "list");
  input.placeholder = placeholder;
  wrap.insertBefore(input, selectEl);

  const list = document.createElement("ul");
  list.className = "searchable-select-dropdown hidden";
  list.setAttribute("role", "listbox");
  wrap.appendChild(list);

  selectEl.classList.add("searchable-select-native");
  selectEl.dataset.searchableMounted = "1";

  const pickValue = (value) => {
    const v = String(value ?? "");
    const match = [...selectEl.options].find((o) => String(o.value) === v && !o.disabled);
    if (!match) return;
    selectEl.value = v;
    syncSearchableSelectInputFromValue(selectEl);
    list.classList.add("hidden");
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
  };
  input.addEventListener("focus", () => {
    renderSearchableSelectDropdown(selectEl, input.value);
  });
  input.addEventListener("input", () => {
    renderSearchableSelectDropdown(selectEl, input.value);
  });
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      list.classList.add("hidden");
      syncSearchableSelectInputFromValue(selectEl);
      return;
    }
    if (ev.key === "Enter") {
      ev.preventDefault();
      const first = list.querySelector(".searchable-select-option:not(.is-disabled)");
      if (first) pickValue(first.getAttribute("data-value"));
    }
  });
  list.addEventListener("mousedown", (ev) => {
    const li = ev.target.closest(".searchable-select-option:not(.is-disabled)");
    if (!li) return;
    ev.preventDefault();
    pickValue(li.getAttribute("data-value"));
  });
  input.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (!wrap.contains(document.activeElement)) {
        list.classList.add("hidden");
        syncSearchableSelectInputFromValue(selectEl);
      }
    }, 120);
  });
  selectEl.addEventListener("change", () => syncSearchableSelectInputFromValue(selectEl));

  refreshSearchableSelect(selectEl);
}

/** Lista compacta visible cuando hay pocas opciones (crear viaje). */
function syncCreateTripCompactPickList(selectEl) {
  const parts = getSearchableSelectParts(selectEl);
  const mount = parts?.wrap?.querySelector(".create-trip-pick-list-mount");
  if (!mount || !selectEl.closest("#form-create-trip")) return;
  const rows = [...selectEl.options]
    .map((opt) => ({
      text: String(opt.textContent || "").trim(),
      value: String(opt.value || ""),
      disabled: opt.disabled
    }))
    .filter((row) => row.text || row.value);
  const selectable = rows.filter((row) => row.value && !row.disabled);
  if (selectable.length < 1 || selectable.length > 6) {
    mount.classList.add("hidden");
    mount.setAttribute("aria-hidden", "true");
    mount.innerHTML = "";
    return;
  }
  mount.classList.remove("hidden");
  mount.setAttribute("aria-hidden", "false");
  const current = String(selectEl.value || "");
  mount.innerHTML = `<div class="create-trip-pick-list" role="listbox">${selectable
    .map((row) => {
      const selected = row.value === current ? " is-selected" : "";
      return `<button type="button" class="create-trip-pick-option${selected}" data-value="${escapeAttr(row.value)}" role="option"${selected ? ' aria-selected="true"' : ""}>${escapeHtml(row.text)}</button>`;
    })
    .join("")}</div>`;
  mount.querySelectorAll(".create-trip-pick-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.getAttribute("data-value");
      const match = [...selectEl.options].find((o) => String(o.value) === String(v) && !o.disabled);
      if (!match) return;
      selectEl.value = String(v);
      syncSearchableSelectInputFromValue(selectEl);
      closeSearchableSelectDropdown(selectEl);
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      syncCreateTripCompactPickList(selectEl);
    });
  });
}

function updateCreateTripResourceFieldHints(formEl, request, vehicleCandidates, driverCandidates, vehicles, drivers) {
  if (!formEl) return;
  const needsTermoking = requestRequiresTermoking(request);
  const setHint = (name, html) => {
    const sel = formEl.querySelector(`select[name='${name}']`);
    const field = sel?.closest(".assign-trip-fleet-field, .create-trip-fleet-field");
    if (!field) return;
    let box = field.querySelector(".create-trip-resource-empty");
    if (!html) {
      box?.remove();
      const parts = getSearchableSelectParts(sel);
      const hint = parts?.wrap?.querySelector(".searchable-select-hint");
      if (hint) {
        hint.classList.remove("searchable-select-hint--warn");
        if (!formEl.closest("#form-create-trip")) {
          hint.textContent = "Clic en ▼ o escriba para ver y filtrar opciones.";
        }
      }
      return;
    }
    if (!box) {
      box = document.createElement("p");
      box.className = "create-trip-resource-empty";
      field.appendChild(box);
    }
    box.innerHTML = html;
    const parts = getSearchableSelectParts(sel);
    const hint = parts?.wrap?.querySelector(".searchable-select-hint");
    if (hint) {
      hint.classList.add("searchable-select-hint--warn");
      hint.textContent = "Revise el mensaje debajo.";
    }
  };
  if (!vehicles.length) {
    const blocked = vehicleCandidates.filter((v) => v.wrongTruckType).length;
    const termokingBlock = vehicleCandidates.filter(
      (v) =>
        !v.wrongTruckType &&
        ((needsTermoking && !vehicleHasTermokingEquipment(v)) ||
          (!needsTermoking && vehicleHasTermokingEquipment(v)))
    ).length;
    let msg = needsTermoking ? "Sin vehículos Termoking disponibles." : "Sin vehículos secos disponibles.";
    if (blocked) msg += ` ${blocked} no coinciden con el tipo pedido.`;
    if (termokingBlock) msg += ` ${termokingBlock} no cumplen Termoking.`;
    if (!vehicleCandidates.length) msg = "Sin vehículos en flota.";
    setHint("vehicleId", escapeHtml(msg));
  } else {
    setHint("vehicleId", "");
  }
  if (!drivers.length) {
    let msg = driverCandidates.length
      ? "Ningún conductor disponible (ocupado, no disponible o doc. vencida)."
      : "Sin conductores en flota.";
    setHint("driverId", escapeHtml(msg));
  } else {
    setHint("driverId", "");
  }
}

/** Vehículo y conductor en crear viaje, aprobar solicitud y autorizaciones. */
function enhanceTripAssignmentSelects(rootEl) {
  const root = rootEl && rootEl.querySelector ? rootEl : document;
  root.querySelectorAll("select[name='vehicleId'], select[name='driverId']").forEach((sel) => {
    mountSearchableSelect(sel, { force: true });
  });
}

function setTripAssignmentFieldsDisabled(formEl, disabled) {
  if (!formEl) return;
  [
    "select[name='vehicleId']",
    "select[name='driverId']",
    "select[name='tripRateChoice']",
    "input[name='tripValue']"
  ].forEach((selector) => {
    const el = formEl.querySelector(selector);
    if (!el) return;
    const searchable = getSearchableSelectParts(el);
    if (searchable?.input) {
      if (disabled) {
        searchable.input.setAttribute("disabled", "disabled");
        searchable.input.setAttribute("aria-disabled", "true");
      } else {
        searchable.input.removeAttribute("disabled");
        searchable.input.removeAttribute("aria-disabled");
      }
    }
    if (disabled) {
      el.setAttribute("disabled", "disabled");
    } else {
      el.removeAttribute("disabled");
    }
  });
}

function wireTripApprovalModeFields(formEl) {
  if (!formEl) return;
  const modeSel = formEl.querySelector("select[name='mode']");
  if (!modeSel) return;
  const apply = () => {
    const assignNow = String(modeSel.value || "") === "assign_now";
    setTripAssignmentFieldsDisabled(formEl, !assignNow);
  };
  modeSel.addEventListener("change", apply);
  apply();
}

function slugStatus(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(" ", "_");
}

/** Campos de precio con selector de tarifa por trayecto (si hay) + valor editable. */
function buildTripRateModalFields(request, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const required = !!o.required;
  const items = listTripRateOptionsWithFallback(request);
  const defaultKey = defaultTripRateStorageKeyForRequest(request);
  const initial = initialTripValueForAssignment(request, defaultKey);
  const fallbackVal = initial > 0 ? initial : parseNum(request?.tripValue || 0);

  const selectOptions = items.length
    ? [
        { value: "", label: "Manual / sin aplicar tarifa del catalogo" },
        ...items.map((i) => ({
          value: i.storageKey,
          label: `Trayecto: ${humanTripRateRouteLabelFromStorageKey(i.storageKey)} · $${parseNum(i.value).toLocaleString("es-CO")} · ${i.scopeLabel}${i.appliesToRequest ? "" : " (otra ruta o alcance)"}`
        }))
      ]
    : [
        {
          value: "",
          label: "Sin tarifas guardadas — definalas en Viajes · Tarifas o indique solo el precio manual"
        }
      ];

  return {
    fields: [
      {
        name: "tripRateChoice",
        label: items.length ? "Tarifa por trayecto (catálogo)" : "Tarifa por trayecto",
        type: "select",
        required: false,
        value: defaultKey || "",
        options: selectOptions,
        antares: { skipValidate: true }
      },
      {
        type: "custom",
        full: true,
        html: `<div class="trip-rate-meta" data-trip-rate-meta><span class="muted">Seleccione una tarifa para ver trayecto, alcance y valor sugerido.</span></div>`
      },
      {
        name: "tripValue",
        label: "Precio del viaje (COP) · editable",
        type: "number",
        required,
        value: fallbackVal
      }
    ],
    afterMount: (formEl) => wireTripRateChoiceSelect(formEl)
  };
}

/** Mismos campos de tarifa que el modal, para formulario inline (crear viaje desde módulo). */
function buildTripRateInlineFieldsHtml(request, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const required = !!o.required;
  const items = listTripRateOptionsForRequest(request);
  let defaultKey = "";
  let fallbackVal = 0;
  if (items.length) {
    const pref = items.find((i) => i.appliesToRequest) || items[0];
    defaultKey = pref.storageKey;
    fallbackVal = parseNum(pref.value);
  }

  const optRows = [
    { value: "", label: "Manual (sin catálogo)" },
    ...items.map((i) => ({
      value: i.storageKey,
      label: `${humanTripRateRouteLabelFromStorageKey(i.storageKey)} · $${parseNum(i.value).toLocaleString("es-CO")}`
    }))
  ];

  const optionsHtml = optRows
    .map((row) => {
      const v = escapeAttr(String(row.value ?? ""));
      const sel = String(row.value) === String(defaultKey || "") ? " selected" : "";
      return `<option value="${v}"${sel}>${escapeHtml(row.label)}</option>`;
    })
    .join("");

  return `<div class="create-trip-rate-inner assign-trip-rate-inner assign-trip-rate-card">
    <label class="full create-trip-rate-catalog assign-trip-field">${fieldLabel(IC.layers, "Tarifa catálogo")}
      <select name="tripRateChoice" id="create-trip-rate-choice" class="trip-rate-choice-select" data-antares-skip-validate="1">${optionsHtml}</select>
    </label>
    <div class="trip-rate-meta assign-trip-rate-meta" data-trip-rate-meta aria-live="polite"></div>
    <label class="full create-trip-price-field create-trip-price-field--hero assign-trip-field">${fieldLabel(IC.dollar, "Precio (COP)", { required: true })}
      <div class="create-trip-price-wrap">
        <span class="create-trip-price-prefix" aria-hidden="true">$</span>
        <input type="text" name="tripValue" id="create-trip-trip-value" inputmode="numeric" autocomplete="off" data-trip-money-input="1" placeholder="Ej. 4.200.000" ${required ? "required" : ""} value="${escapeAttr(formatMoneyFieldValue(fallbackVal))}" />
      </div>
    </label>
  </div>`;
}

/** Sincroniza resumen, listas de flota y tarifas al elegir solicitud (formulario crear viaje). */
function refreshCreateTripModuleForm(formEl) {
  if (!formEl) return;
  const selReq = formEl.querySelector("select[name='requestId']");
  const requestId = String(selReq?.value || "").trim();
  const preview = formEl.querySelector("#trip-request-preview");
  const vehSel = formEl.querySelector("select[name='vehicleId']");
  const drvSel = formEl.querySelector("select[name='driverId']");
  const rateMount = formEl.querySelector("#create-trip-rate-fields");
  const prevVehicleId = String(vehSel?.value || "").trim();
  const prevDriverId = String(drvSel?.value || "").trim();
  const prevRateChoice = String(formEl.querySelector("select[name='tripRateChoice']")?.value || "").trim();
  const prevTripValue = String(formEl.querySelector("input[name='tripValue']")?.value || "").trim();
  const restoreSelectValue = (selectEl, value) => {
    if (!selectEl || !value) return;
    const hasOption = [...selectEl.options].some((opt) => String(opt.value) === value && !opt.disabled);
    if (hasOption) selectEl.value = value;
  };
  const request = requestId ? reqRead().find((r) => r.id === requestId) : null;

  const fleetStats = formEl.querySelector("#create-trip-fleet-stats");

  const tripFormUser = currentUser();
  if (request && !canAssignTripFromViajesModule(request, tripFormUser)) {
    if (preview) {
      preview.innerHTML = createTripEmptyHint(
        "lock",
        "Solicitud no disponible para asignar",
        request.status === STATUS.PENDIENTE
          ? "Apruebe la solicitud en Centro de autorizaciones; luego podrá asignar el viaje aquí."
          : "Esta solicitud no está en un estado válido para asignación de viaje."
      );
      preview.classList.add("create-trip-summary-panel--active", "assign-trip-preview--filled");
    }
    if (fleetStats) fleetStats.innerHTML = "";
    if (vehSel) {
      vehSel.innerHTML = `<option value="">No asignable en este módulo</option>`;
      vehSel.disabled = true;
    }
    if (drvSel) {
      drvSel.innerHTML = `<option value="">No asignable en este módulo</option>`;
      drvSel.disabled = true;
    }
    if (rateMount) {
      rateMount.innerHTML = createTripEmptyHint("lock", "Apruebe la solicitud primero");
    }
    updateCreateTripStepper(formEl);
    return;
  }

  if (!request) {
    if (preview) {
      preview.innerHTML = createTripEmptyHint("inbox", "Seleccione una solicitud");
      preview.classList.remove("create-trip-summary-panel--active", "assign-trip-preview--filled");
    }
    if (fleetStats) fleetStats.innerHTML = "";
    if (vehSel) {
      vehSel.innerHTML = `<option value="">— Elija solicitud primero —</option>`;
      vehSel.disabled = true;
    }
    if (drvSel) {
      drvSel.innerHTML = `<option value="">— Elija solicitud primero —</option>`;
      drvSel.disabled = true;
    }
    if (rateMount) {
      rateMount.innerHTML = createTripEmptyHint("dollar", "Tarifa pendiente");
    }
    updateCreateTripStepper(formEl);
    return;
  }

  const needsTermoking = requestRequiresTermoking(request);
  const assignableByDate = isRequestPickupSameDayOrFuture(request);
  void refreshTransportScheduleBusyFromApi(request, requestId);
  const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
  const driverCandidates = getDriverCandidatesForRequest(request, requestId);
  const vehicles = vehicleCandidates.filter(
    (v) => !v.isBusy && !v.isUnavailable && !v.hasExpiredDocs && !v.wrongTruckType
  );
  const drivers = driverCandidates.filter((d) => !d.isBusy && !d.isUnavailable && !d.hasExpiredDocs);

  if (preview) {
    preview.classList.add("create-trip-summary-panel--active", "assign-trip-preview--filled");
    preview.innerHTML = renderAssignTripRequestPreview(request);
  }

  if (fleetStats && assignableByDate) {
    fleetStats.innerHTML = `
      <span class="create-trip-fleet-stat create-trip-fleet-stat--ok" title="Vehículos listos para asignar"><strong>${vehicles.length}</strong> veh.</span>
      <span class="create-trip-fleet-stat create-trip-fleet-stat--ok" title="Conductores listos para asignar"><strong>${drivers.length}</strong> cond.</span>
      <span class="create-trip-fleet-stat create-trip-fleet-stat--muted" title="Total en lista con banderas">${vehicleCandidates.length} / ${driverCandidates.length} en lista</span>`;
  } else if (fleetStats) {
    fleetStats.innerHTML = "";
  }

  if (!assignableByDate) {
    if (vehSel) {
      vehSel.innerHTML = `<option value="">Solicitud vencida: no se puede asignar viaje en fecha anterior</option>`;
      vehSel.disabled = true;
    }
    if (drvSel) {
      drvSel.innerHTML = `<option value="">Solicitud vencida: no se puede asignar viaje en fecha anterior</option>`;
      drvSel.disabled = true;
    }
    if (rateMount) {
      rateMount.innerHTML = `<div class="create-trip-rate-guard assign-trip-rate-guard" role="alert"><span class="create-trip-rate-guard-pill">${IC.lock} Fecha vencida</span><p class="assign-trip-rate-guard-note">Solo se asignan viajes con recogida hoy o en fechas futuras.</p></div>`;
    }
    updateCreateTripStepper(formEl);
    return;
  }

  if (vehSel) {
    vehSel.disabled = false;
    if (!vehicleCandidates.length) {
      vehSel.innerHTML = `<option value="">${
        needsTermoking
          ? "No hay vehículos con Termoking para esta solicitud"
          : "No hay vehículos secos (sin Termoking) para esta capacidad y ruta"
      }</option>`;
    } else {
      vehSel.innerHTML =
        `<option value="">${vehicles.length ? "Seleccione vehículo…" : "Sin vehículo asignable ahora (revise banderas)"}</option>` +
        vehicleCandidates
          .map((v) => {
            const lab = tripAssignmentVehicleOptionLabel(v, {
              needsTermoking,
              isBusy: v.isBusy,
              isUnavailable: v.isUnavailable,
              hasExpiredDocs: v.hasExpiredDocs,
              wrongTruckType: v.wrongTruckType,
              requestTruckType: normalizeRequestRequiredTruckType(request?.vehicleType)
            });
            const disabled = v.isBusy || v.isUnavailable || v.hasExpiredDocs || v.wrongTruckType ? " disabled" : "";
            return `<option value="${escapeAttr(v.id)}"${disabled}>${escapeHtml(lab)}</option>`;
          })
          .join("");
    }
    restoreSelectValue(vehSel, prevVehicleId);
  }

  if (drvSel) {
    drvSel.disabled = false;
    if (!driverCandidates.length) {
      drvSel.innerHTML = `<option value="">No hay conductores registrados</option>`;
    } else {
      drvSel.innerHTML =
        `<option value="">${drivers.length ? "Seleccione conductor…" : "Sin conductor asignable ahora (revise banderas)"}</option>` +
        driverCandidates
          .map((d) => {
            const lab = tripAssignmentDriverOptionLabel(d, {
              isBusy: d.isBusy,
              isUnavailable: d.isUnavailable,
              hasExpiredDocs: d.hasExpiredDocs
            });
            const disabled = d.isBusy || d.isUnavailable || d.hasExpiredDocs ? " disabled" : "";
            return `<option value="${escapeAttr(d.id)}"${disabled}>${escapeHtml(lab)}</option>`;
          })
          .join("");
    }
    restoreSelectValue(drvSel, prevDriverId);
  }

  if (rateMount) {
    rateMount.innerHTML = `<div class="create-trip-rate-mount">${buildTripRateInlineFieldsHtml(request, { required: true })}</div>`;
    wireTripRateChoiceSelect(formEl);
    const rateChoiceSel = formEl.querySelector("select[name='tripRateChoice']");
    restoreSelectValue(rateChoiceSel, prevRateChoice);
    if (rateChoiceSel && prevRateChoice) {
      rateChoiceSel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const tripValueInput = formEl.querySelector("input[name='tripValue']");
    if (tripValueInput && prevTripValue) {
      tripValueInput.value = prevTripValue;
    }
  }
  enhanceTripAssignmentSelects(formEl);
  updateCreateTripResourceFieldHints(formEl, request, vehicleCandidates, driverCandidates, vehicles, drivers);
  updateCreateTripStepper(formEl);
}

function prettyStatus(status, scope = "general") {
  const key = slugStatus(status);
  const iconMap = {
    pendiente: IC.clock,
    aprobada_pendiente_asignacion: IC.inbox,
    viaje_asignado: IC.truck,
    en_transito: IC.truck,
    espera_standby: IC.clock,
    completada: IC.check,
    cerrada: IC.briefcase,
    cancelada: IC.x,
    rechazada: IC.x
  };
  const icon = iconMap[key] || IC.activity;
  /**
   * Animación de "ruta" debajo del badge: aplica tanto al ver una solicitud con
   * viaje en curso como cuando se gestiona directamente el viaje. Mejora la
   * legibilidad rápida en módulos de operación (un viaje vivo se distingue
   * visualmente de uno cerrado/pendiente).
   */
  const movingScopes = scope === "request" || scope === "trip";
  const road = movingScopes && (key === "viaje_asignado" || key === "en_transito");
  return `<span class="status-pretty status-${key} ${road ? "status-road" : ""}">${icon}<span>${status}</span></span>`;
}

function fieldLabel(icon, text, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const mark = o.required
    ? '<span class="field-required-mark" aria-hidden="true" title="Obligatorio">*</span>'
    : "";
  return `<span class="field-label">${icon}<span>${text}</span>${mark}</span>`;
}

function departmentOptions(selected = "") {
  return Object.keys(COLOMBIA_LOCATIONS)
    .map((dept) => `<option value="${dept}" ${dept === selected ? "selected" : ""}>${dept}</option>`)
    .join("");
}

function cityOptionsFromDepartment(department = "", selectedCity = "") {
  const cities = COLOMBIA_LOCATIONS[String(department || "")] || [];
  const sel = String(selectedCity || "").trim();
  const list = sel && !cities.includes(sel) ? [...cities, sel] : cities;
  return list
    .map(
      (city) =>
        `<option value="${escapeAttr(city)}" ${city === sel ? "selected" : ""}>${escapeHtml(city)}</option>`
    )
    .join("");
}

function attachDepartmentCitySelects(form, {
  departmentSelector = "select[name='department']",
  citySelector = "select[name='city']",
  initialDepartment = "",
  initialCity = ""
} = {}) {
  if (!form) return;
  const deptSelect = form.querySelector(departmentSelector);
  const citySelect = form.querySelector(citySelector);
  if (!deptSelect || !citySelect) return;

  const fill = (dept, preferredCity = "") => {
    const cities = COLOMBIA_LOCATIONS[String(dept || "")] || [];
    const pref = String(preferredCity || "").trim();
    const list = pref && !cities.includes(pref) ? [...cities, pref] : cities;
    citySelect.innerHTML = `<option value="">Seleccione...</option>${list
      .map((c) => `<option value="${escapeAttr(c)}" ${c === pref ? "selected" : ""}>${escapeHtml(c)}</option>`)
      .join("")}`;
  };

  const startDept = String(deptSelect.value || initialDepartment || "");
  if (startDept) {
    deptSelect.value = startDept;
    fill(startDept, String(citySelect.value || initialCity || ""));
  } else {
    citySelect.innerHTML = `<option value="">Seleccione un departamento...</option>`;
  }
  deptSelect.addEventListener("change", () => fill(deptSelect.value, ""));
}

/** `requestAnimationFrame` + `scrollIntoView` suave; útil tras `renderPortalView()` o al abrir modales con formulario largo. */
function scrollIntoViewSmoothBlockStart(target) {
  if (!target) return;
  requestAnimationFrame(() => {
    try {
      target.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    } catch (_e) {
      try {
        target.scrollIntoView(true);
      } catch (__e) {}
    }
  });
}

/** `#crud-modal` (ediciones, fichas, confirmaciones): acerca la tarjeta al viewport. */
function scrollOpenCrudModalIntoView() {
  const modal = document.getElementById("crud-modal");
  if (!modal || modal.classList.contains("hidden")) return;
  const card = modal.querySelector(".modal-card");
  scrollIntoViewSmoothBlockStart(card || modal);
}

/**
 * Paneles colapsables (`createCollapsibleCard` / `data-create-panel`): al abrir,
 * acerca el formulario para no quedar abajo del listado u otras tarjetas.
 */
function scrollToCreatePanelForm(panelId) {
  const id = String(panelId || "").trim();
  if (!id) return;
  const esc = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const wrap = document.querySelector(`[data-create-panel="${esc}"]`);
      if (!wrap) return;
      const formEl = wrap.querySelector("form");
      scrollIntoViewSmoothBlockStart(formEl || wrap);
    });
  });
}

/** Cierra un panel de alta (`createCollapsibleCard`, `data-create-panel`) tras guardado exitoso. */
function collapseCreatePanel(panelId) {
  const id = String(panelId || "").trim();
  if (!id) return;
  state.createPanels = { ...(state.createPanels || {}), [id]: false };
}

/** Limpia estado transitorio antes de reiniciar un panel de alta al cancelar. */
function prepareCancelCreatePanel(panelId) {
  const id = String(panelId || "").trim();
  if (!id) return;
  if (id === "create-route-rate") {
    state.pendingRouteRateEditKey = null;
  }
}

/**
 * Cancelar en paneles de alta: descarta cambios, reinicia el formulario (re-render)
 * y mantiene el panel abierto. «Minimizar» sigue siendo solo `toggle-create-panel`.
 */
async function resetCreatePanelForm(panelId, formEl) {
  const id = String(panelId || "").trim();
  if (!id || !formEl) return false;
  if (!(await confirmDiscardCreateFormAsync(formEl))) return false;
  prepareCancelCreatePanel(id);
  const PAYROLL_CREATE_IDS = [
    "create-employee",
    "create-payroll",
    "create-driver-trip-payment",
    "create-payroll-settlement",
    "create-hr-absence"
  ];
  const HIRING_CREATE_IDS = ["create-position", "create-vacancy", "create-candidate", "create-interview", "create-contract"];
  const payrollSet = new Set(PAYROLL_CREATE_IDS);
  const hiringSet = new Set(HIRING_CREATE_IDS);
  state.createPanels = { ...(state.createPanels || {}) };
  if (payrollSet.has(id)) {
    PAYROLL_CREATE_IDS.forEach((pid) => {
      state.createPanels[pid] = pid === id;
    });
  } else if (hiringSet.has(id)) {
    HIRING_CREATE_IDS.forEach((pid) => {
      state.createPanels[pid] = pid === id;
    });
  } else {
    state.createPanels[id] = true;
  }
  renderPortalView();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToCreatePanelForm(id));
  });
  return true;
}

function formHasDirtyValues(formEl) {
  if (!formEl) return false;
  const fields = [...formEl.querySelectorAll("input, select, textarea")];
  return fields.some((field) => {
    if (field.disabled) return false;
    const tag = String(field.tagName || "").toLowerCase();
    const type = String(field.type || "").toLowerCase();
    if (type === "hidden") return false;
    if (type === "file") return Boolean(field.files?.length);
    if (type === "checkbox" || type === "radio") return field.checked !== field.defaultChecked;
    if (tag === "select") return field.value !== (field.defaultValue || "");
    return String(field.value || "") !== String(field.defaultValue || "");
  });
}

function payrollBulkEmployeeNameMap() {
  const map = new Map();
  readArray(KEYS.payrollEmployees).forEach((e) => {
    const id = String(e?.id || "").trim();
    if (id) map.set(id, String(e.name || "Colaborador").trim() || "Colaborador");
  });
  return map;
}

function humanizePayrollBulkSkipReason(raw) {
  let text = String(raw || "").trim();
  const hireMatch = text.match(/fecha de ingreso\s*\(?(\d{4}-\d{2}-\d{2})\)?/i);
  if (/sin días (efectivos en el corte|laborables en el período)/i.test(text)) {
    const hireLabel = hireMatch ? fmtDateOr(hireMatch[1], hireMatch[1]) : "";
    return hireLabel
      ? `Sin días laborables en el período (ingresó el ${hireLabel}, después del corte seleccionado).`
      : "Sin días laborables en el período seleccionado.";
  }
  if (/sin fecha de ingreso/i.test(text)) return "Falta fecha de ingreso válida en la ficha del colaborador.";
  if (/prima omitida/i.test(text)) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function parsePayrollBulkAutogenMessage(msg, nameById = new Map()) {
  const s = String(msg || "").trim();
  let m = s.match(/^Empleado\s+([0-9a-f-]{36})\s+\(([^)]+)\):\s*(.+)$/i);
  if (m) {
    return { name: m[2].trim(), reason: humanizePayrollBulkSkipReason(m[3]) };
  }
  m = s.match(/^Empleado\s+([0-9a-f-]{36}):\s*(.+)$/i);
  if (m) {
    return {
      name: nameById.get(m[1]) || "Colaborador",
      reason: humanizePayrollBulkSkipReason(m[2])
    };
  }
  m = s.match(/^([^:]+):\s*(.+)$/);
  if (m) {
    return { name: m[1].trim(), reason: humanizePayrollBulkSkipReason(m[2]) };
  }
  return { name: "", reason: humanizePayrollBulkSkipReason(s) };
}

function openPayrollBulkResultModal({ title, bodyHtml }) {
  const modal = ensureCrudModalElement();
  const card = modal.querySelector(".modal-card");
  if (card) card.className = "modal-card modal-card-edit modal-card--payroll-bulk-result";
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    ${renderModalHead(title)}
    <div class="payroll-bulk-result-body">${bodyHtml}</div>
    ${renderModalFooterActions({
      showCancel: false,
      primaryHtml: `<button type="button" id="crud-ok" class="btn btn-primary">${IC.check} Entendido</button>`
    })}
  `;
  modal.classList.remove("hidden");
  const close = () => modal.classList.add("hidden");
  wireModalDismiss(content, close, { closeIds: ["crud-close", "crud-ok"] });
  scrollOpenCrudModalIntoView();
}

function presentPayrollBulkAutogenResult(result) {
  const created = Number(result?.created || 0);
  const skipped = Number(result?.skipped || 0);
  const rawMsgs = Array.isArray(result?.messages) ? result.messages.filter(Boolean) : [];
  const nameById = payrollBulkEmployeeNameMap();
  const items = rawMsgs.map((msg) => parsePayrollBulkAutogenMessage(msg, nameById));

  const summaryBits = [];
  if (created > 0) {
    summaryBits.push(
      `<span class="payroll-bulk-result-stat payroll-bulk-result-stat--ok"><strong>${created}</strong> creada${created === 1 ? "" : "s"}</span>`
    );
  }
  if (skipped > 0) {
    summaryBits.push(
      `<span class="payroll-bulk-result-stat payroll-bulk-result-stat--skip"><strong>${skipped}</strong> omitida${skipped === 1 ? "" : "s"}</span>`
    );
  }

  const title =
    created > 0 ? "Liquidación masiva completada" : skipped > 0 ? "Sin nuevas liquidaciones" : "Liquidación masiva";

  let bodyHtml = `<div class="payroll-bulk-result-summary">${summaryBits.join("") || '<span class="muted">No hubo cambios.</span>'}</div>`;

  if (items.length) {
    bodyHtml += `<ul class="payroll-bulk-result-list" aria-label="Detalle por colaborador">${items
      .map(
        (it) =>
          `<li><span class="payroll-bulk-result-name">${escapeHtml(it.name || "Colaborador")}</span><span class="payroll-bulk-result-reason">${escapeHtml(it.reason)}</span></li>`
      )
      .join("")}</ul>`;
  } else if (skipped > 0 && created === 0) {
    bodyHtml += `<p class="muted payroll-bulk-result-hint">Ningún colaborador tenía un corte pendiente en esa fecha, o ya existía su liquidación para el mismo período.</p>`;
  }

  if (items.length || (skipped > 0 && created === 0)) {
    openPayrollBulkResultModal({ title, bodyHtml });
    return;
  }

  if (created > 0) {
    notify(
      created === 1 ? "Se generó 1 liquidación." : `Se generaron ${created} liquidaciones.`,
      "success"
    );
    return;
  }

  notify("No se generaron liquidaciones para la fecha indicada.", "info");
}

function confirmDiscardCreateFormAsync(formEl, opts = {}) {
  if (!formHasDirtyValues(formEl)) return Promise.resolve(true);
  return openConfirmModalAsync({
    title: opts.title || "¿Descartar cambios?",
    message:
      opts.message ||
      "Se perderán los cambios no guardados de este formulario. Los datos que escribió no se guardarán.",
    confirmText: opts.confirmText || "Sí, descartar",
    cancelText: opts.cancelText || "Seguir editando",
    confirmBtnClass: opts.confirmBtnClass || "btn-reject",
    cancelBtnClass:
      opts.cancelBtnClass ||
      "btn btn-sm btn-outline module-panel-btn module-panel-btn--cancel modal-btn--safe",
    confirmIcon: opts.confirmIcon || "x",
    cardClass: "modal-card-edit modal-card--discard"
  });
}

function readAdminUsersFormDraft(formEl, opts = {}) {
  if (!formEl) return {};
  const excludeNames = new Set(Array.isArray(opts.excludeNames) ? opts.excludeNames.map((x) => String(x || "")) : []);
  const excludeTypes = new Set(Array.isArray(opts.excludeTypes) ? opts.excludeTypes.map((x) => String(x || "").toLowerCase()) : ["file"]);
  const out = {};
  const byName = new Map();
  [...formEl.querySelectorAll("input[name], select[name], textarea[name]")].forEach((field) => {
    const name = String(field.name || "").trim();
    if (!name || excludeNames.has(name)) return;
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(field);
  });
  byName.forEach((fields, name) => {
    const first = fields[0];
    const type = String(first.type || "").toLowerCase();
    if (excludeTypes.has(type)) return;
    if (type === "checkbox") {
      out[name] = fields.filter((field) => field.checked).map((field) => String(field.value || ""));
      return;
    }
    if (type === "radio") {
      const checked = fields.find((field) => field.checked);
      out[name] = checked ? String(checked.value || "") : "";
      return;
    }
    out[name] = String(first.value || "");
  });
  return out;
}

function applyAdminUsersFormDraft(formEl, draft = {}) {
  if (!formEl || !draft || typeof draft !== "object") return;
  Object.entries(draft).forEach(([name, rawValue]) => {
    const safeName =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(name)
        : String(name).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const fields = [...formEl.querySelectorAll(`[name="${safeName}"]`)];
    if (!fields.length) return;
    const first = fields[0];
    const type = String(first.type || "").toLowerCase();
    if (type === "checkbox") {
      const selected = new Set(Array.isArray(rawValue) ? rawValue.map((x) => String(x || "")) : []);
      fields.forEach((field) => {
        field.checked = selected.has(String(field.value || ""));
      });
      return;
    }
    if (type === "radio") {
      fields.forEach((field) => {
        field.checked = String(field.value || "") === String(rawValue || "");
      });
      return;
    }
    first.value = rawValue == null ? "" : String(rawValue);
  });
}

/**
 * Administración · Usuarios: acerca el scroll al formulario visible (edición,
 * creación de usuario/empresa o permisos) para no quedar abajo del listado.
 */
function scrollToAdminUsersFocusedForm() {
  const target =
    document.getElementById("form-admin-user-edit") ||
    document.getElementById("form-admin-company-edit") ||
    document.getElementById("form-admin-user-create") ||
    document.getElementById("form-admin-company-create") ||
    document.getElementById("form-admin-user-permissions");
  scrollIntoViewSmoothBlockStart(target);
}

/** Alta/edición empresa (admin): cascada departamento→ciudad y valores iniciales coherentes con el catálogo. */

/** Vista previa del logo en el óvalo (formularios alta/edición empresa en admin). */

function getNotificationRecipientId(n) {
  if (!n || typeof n !== "object") return "";
  return String(n.userId ?? n.user_id ?? n.id_usuario ?? "").trim();
}

/** Solo el rol administrador ve la bandeja global; el resto solo las propias. */
function canViewAllNotifications(user) {
  return isAdminActor(user);
}

function notificationTargetsUser(n, user) {
  if (!user) return false;
  if (canViewAllNotifications(user)) return true;
  const uid = String(user.id ?? "").trim();
  if (!uid) return false;
  return getNotificationRecipientId(n) === uid;
}

/** Destinatario real de la fila (borrados masivos / vaciar bandeja; distinto de «puede verla»). */
function notificationBelongsToUser(n, user) {
  if (!user) return false;
  const uid = String(user.id ?? "").trim();
  if (!uid) return false;
  return getNotificationRecipientId(n) === uid;
}

function filterNotificationsForUser(user, list) {
  const rows = Array.isArray(list) ? list : [];
  if (!user) return [];
  if (canViewAllNotifications(user)) return rows;
  return rows.filter((n) => notificationTargetsUser(n, user));
}

async function dispatchPortalNotification(payload) {
  const api = window.AntaresApi;
  if (!api?.getBase?.() || typeof api.postJson !== "function") return false;
  if (!portalCanRefreshFromApi()) return false;
  try {
    await api.postJson("/portal/notifications/dispatch", payload);
    return true;
  } catch (_e) {
    return false;
  }
}

function saveNotification({ userId, title, body }) {
  const actor = currentUser();
  const targetId = String(userId ?? "").trim();
  if (!targetId) return;
  const row = {
    id: newUuidV4(),
    userId: targetId,
    title: String(title ?? ""),
    body: String(body ?? ""),
    createdAt: nowIso(),
    readAt: null
  };
  if (actor && canViewAllNotifications(actor)) {
    const all = read(KEYS.notifications, []);
    all.unshift(row);
    write(KEYS.notifications, all);
    const actorId = String(actor.id ?? "").trim();
    if (actorId && actorId !== targetId) {
      void dispatchPortalNotification({ userIds: [targetId], title: row.title, body: row.body });
    }
    return;
  }
  if (actor && String(actor.id ?? "") === targetId) {
    const all = read(KEYS.notifications, []);
    all.unshift(row);
    write(KEYS.notifications, all);
    return;
  }
  void dispatchPortalNotification({ userIds: [targetId], title: row.title, body: row.body });
}

function notifyAdminUsers(title, body) {
  void dispatchPortalNotification({ audience: "admins", title, body });
}

function notifyHrUsers(title, body) {
  void dispatchPortalNotification({ audience: "hr", title, body });
}

let __contractRenewalNoticeCheckWallMs = 0;

/** Pide al servidor crear notificaciones de aviso de no renovación (término fijo) y refresca la bandeja. */
async function refreshContractRenewalNotificationsFromServer() {
  const api = window.AntaresApi;
  if (!api?.postJson || !portalCanRefreshFromApi()) return false;
  const actor = currentUser();
  if (!actor || !hasPermission(actor, PERMISSIONS.PAYROLL_MANAGE)) return false;
  const now = Date.now();
  if (now - __contractRenewalNoticeCheckWallMs < 45000) return false;
  __contractRenewalNoticeCheckWallMs = now;
  try {
    await api.postJson("/portal/hr/contract-renewal-notices/run", {});
    await applyPortalBootstrapFromApi();
    try {
      reconcileNotificationsCacheForSession();
      updateNotificationBadge();
    } catch (_e) {
      /* noop */
    }
    return true;
  } catch (err) {
    if (typeof notify === "function") {
      notify(
        String(err?.message || "No fue posible actualizar los avisos de renovación contractual."),
        "error"
      );
    }
    return false;
  }
}

function scheduleContractRenewalNotificationCheck() {
  void refreshContractRenewalNotificationsFromServer();
}

async function writeNotificationsAwaitServer(deletedIds) {
  const user = currentUser();
  const all = read(KEYS.notifications, []);
  const payload =
    user && !canViewAllNotifications(user) ? filterNotificationsForUser(user, all) : all;
  const normalizedDeleted = [
    ...new Set(
      (Array.isArray(deletedIds) ? deletedIds : [deletedIds])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  ];
  await writeAwaitServer(KEYS.notifications, payload, {
    deletedIds: normalizedDeleted.length ? normalizedDeleted : undefined
  });
  /** Parche solo notificaciones (idle): evita serializar todo el portal en cada lectura/borrado. */
  savePortalSnapshotAfterBootstrap({ dirtyKeys: [KEYS.notifications] });
}

/** Quita de la caché local notificaciones ajenas (p. ej. tras crear solicitud antes del filtro). */
function reconcileNotificationsCacheForSession() {
  const user = currentUser();
  if (!user || canViewAllNotifications(user)) return;
  const filtered = filterNotificationsForUser(user, read(KEYS.notifications, []));
  write(KEYS.notifications, filtered);
}

function __notificationReadAtEpochMs(v) {
  if (v == null || v === "") return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** True si la fila tiene `fecha_lectura` fiable (API camelCase o snake legacy). */
function notificationIsRead(n) {
  if (!n || typeof n !== "object") return false;
  const raw = n.readAt ?? n.read_at;
  if (raw == null || raw === "") return false;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms);
}

/**
 * GET /portal/notifications y el bootstrap pueden llegar antes de que sync-key persista `readAt`.
 * Fusionar evita que la caché (y un flush posterior) reviertan «leída» en UI y en PostgreSQL.
 */
function mergeNotificationsListPreserveReadAt(prevList, serverList) {
  const prev = Array.isArray(prevList) ? prevList : [];
  const server = Array.isArray(serverList) ? serverList : [];
  const prevById = new Map(
    prev.map((n) => [String(n?.id || "").trim(), n]).filter(([id]) => Boolean(id))
  );
  return server.map((n) => {
    const id = String(n?.id || "").trim();
    if (!id || !n || typeof n !== "object") return n;
    const p = prevById.get(id);
    if (!p) return n;
    const pr = p.readAt ?? p.read_at;
    const sr = n.readAt ?? n.read_at;
    const prMs = __notificationReadAtEpochMs(pr);
    const srMs = __notificationReadAtEpochMs(sr);
    if (prMs <= 0 && srMs <= 0) return n;
    if (prMs >= srMs && prMs > 0) return { ...n, readAt: pr || sr || null };
    if (srMs > 0) return n;
    return pr ? { ...n, readAt: pr } : n;
  });
}

/**
 * Persiste lecturas en PostgreSQL (endpoint dedicado) y alinea la caché local + snapshot de F5.
 * @returns {Promise<boolean>}
 */
async function persistNotificationsReadState(ids) {
  const normalized = [
    ...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))
  ];
  if (!normalized.length) return true;
  const visibleIds = new Set(getCurrentNotifications().map((n) => n.id));
  const targetIds = normalized.filter((id) => visibleIds.has(id));
  if (!targetIds.length) return true;

  const ts = nowIso();
  const list = read(KEYS.notifications, []);
  write(
    KEYS.notifications,
    list.map((n) => (targetIds.includes(n.id) && !notificationIsRead(n) ? { ...n, readAt: ts } : n)),
    { skipSyncSchedule: true }
  );

  const api = window.AntaresApi;
  if (api?.postJson && portalCanRefreshFromApi()) {
    try {
      const res = await api.postJson("/portal/notifications/mark-read", { ids: targetIds });
      const readAt = String(res?.readAt || ts).trim() || ts;
      const merged = read(KEYS.notifications, []);
      write(
        KEYS.notifications,
        merged.map((n) => (targetIds.includes(n.id) ? { ...n, readAt: n.readAt || readAt } : n)),
        { skipSyncSchedule: true }
      );
      savePortalSnapshotAfterBootstrap({ dirtyKeys: [KEYS.notifications] });
      syncNotificationsInboxRenderSignature();
      return true;
    } catch (_apiErr) {
      try {
        await writeNotificationsAwaitServer();
        savePortalSnapshotAfterBootstrap({ dirtyKeys: [KEYS.notifications] });
        syncNotificationsInboxRenderSignature();
        return true;
      } catch (err) {
        if (typeof notify === "function") {
          notify(
            String(err?.message || "No fue posible guardar las notificaciones leídas en el servidor."),
            "error"
          );
        }
        return false;
      }
    }
  }

  try {
    await writeNotificationsAwaitServer();
    savePortalSnapshotAfterBootstrap({ dirtyKeys: [KEYS.notifications] });
    syncNotificationsInboxRenderSignature();
    return true;
  } catch (err) {
    if (typeof notify === "function") {
      notify(
        String(err?.message || "No fue posible guardar las notificaciones leídas en el servidor."),
        "error"
      );
    }
    return false;
  }
}

function refreshNotificationsUiAfterReadMutation() {
  updateNotificationBadge();
  if (state.currentView !== "notifications") return;
  state.__skipModuleAnimationsOnce = true;
  scheduleRenderPortalView();
}

/** Evita repintar la bandeja (y re-disparar micro-animaciones) si el poll no cambió el inbox. */
let __lastNotificationsInboxRenderSig = "";

function notificationsInboxRenderSignature(list) {
  const rows = Array.isArray(list) ? list : [];
  return rows
    .map((n) => {
      const id = String(n?.id || "").trim();
      if (!id) return "";
      const readMs = __notificationReadAtEpochMs(n?.readAt ?? n?.read_at);
      return `${id}:${readMs > 0 ? readMs : 0}`;
    })
    .filter(Boolean)
    .sort()
    .join("|");
}

function syncNotificationsInboxRenderSignature() {
  __lastNotificationsInboxRenderSig = notificationsInboxRenderSignature(getCurrentNotifications());
}

function scheduleNotificationsViewRenderIfChanged() {
  if (state.currentView !== "notifications") return;
  const sig = notificationsInboxRenderSignature(getCurrentNotifications());
  if (sig === __lastNotificationsInboxRenderSig) return;
  __lastNotificationsInboxRenderSig = sig;
  state.__skipModuleAnimationsOnce = true;
  scheduleRenderPortalView();
}

function sendEmail({ to, subject, body }) {
  /**
   * Con API activa, `emails` solo sincroniza admin (sync-key). Un cliente que encola correos
   * dispara 403 en segundo plano y el toast genérico de “sin conexión” aunque la operación principal
   * (p. ej. solicitud) ya se guardó en PostgreSQL.
   */
  const api = window.AntaresApi;
  if (api?.isConfigured?.()) {
    const actor = currentUser();
    if (actor && actor.role !== ROLES.ADMIN) return;
  }
  const outbox = read(KEYS.emails, []);
  outbox.unshift({ id: newUuidV4(), to, subject, body, createdAt: nowIso(), sentAt: null, error: null, status: "queued" });
  write(KEYS.emails, outbox);
}

/**
 * URL de retorno tras recuperar contraseña (sin hash ni query). En producción use __PORTAL_PUBLIC_ORIGIN__
 * en antares.public.js para que el correo no apunte a localhost.
 */
function buildSupabasePasswordRecoveryRedirectUrl() {
  const configured = String(window.__PORTAL_PUBLIC_ORIGIN__ || "").trim().replace(/\/+$/, "");
  if (configured && /^https?:\/\//i.test(configured)) {
    return `${configured}/`;
  }
  const u = new URL(window.location.href);
  u.hash = "";
  u.search = "";
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost") ||
    host === "::1"
  ) {
    return "https://www.transportesantares.co/";
  }
  return u.toString();
}

function stripSupabaseAuthHashFromUrl() {
  const u = new URL(window.location.href);
  if (!u.hash || u.hash.length < 2) return;
  u.hash = "";
  history.replaceState(null, "", u.toString());
}

function scheduleStripSupabaseRecoveryHash(delayMs = 400) {
  window.setTimeout(() => {
    try {
      stripSupabaseAuthHashFromUrl();
    } catch (_e) {}
  }, delayMs);
}

/**
 * Supabase Auth deja el fallo del enlace (p. ej. OTP vencido) en el fragmento:
 * `#error=access_denied&error_code=otp_expired&error_description=...`
 */
function parseSupabaseAuthErrorHashParams() {
  const h = String(window.location.hash || "");
  if (!h || h.length < 2) return null;
  const body = h.slice(1);
  if (!body) return null;
  /** No mezclar con rutas del portal (`#portal/...`). */
  if (body.startsWith("portal/")) return null;
  try {
    const params = new URLSearchParams(body);
    if (!params.get("error")) return null;
    return params;
  } catch (_e) {
    return null;
  }
}

/**
 * Si la URL trae error de enlace mágico/OTP de Supabase, abre el modal en «Recuperar», avisa y limpia el hash.
 * @returns {boolean} true si hubo un error de fragmento OAuth/Auth y se atendió.
 */
function maybeHandleSupabaseAuthUrlErrorFromHash() {
  const params = parseSupabaseAuthErrorHashParams();
  if (!params) return false;
  try {
    sessionStorage.removeItem("antares_pw_recovery_pending");
  } catch (_e) {}
  state.authSupabaseRecovery = false;
  state.authTab = "recover";
  try {
    stripSupabaseAuthHashFromUrl();
  } catch (_e) {}
  showAuth();
  const msg =
    state.publicLang === "en"
      ? userMessage("recoverLinkInvalidOrExpiredEn")
      : userMessage("recoverLinkInvalidOrExpired");
  notify(msg, "error", 9000);
  return true;
}

async function waitForAntaresSupabaseClient(timeoutMs) {
  const cap = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 15000;
  if (window.antaresSupabase) return window.antaresSupabase;
  const ready = window.antaresSupabaseReady;
  if (!ready || typeof ready.then !== "function") return null;
  return await Promise.race([
    ready.then(() => window.antaresSupabase || null),
    new Promise((resolve) => {
      setTimeout(() => resolve(window.antaresSupabase || null), cap);
    })
  ]);
}

/** Escucha enlace de recuperación Supabase y abre el modal con el formulario de nueva contraseña. */
function wireSupabasePasswordRecoveryUi() {
  if (window.__antaresSupabaseRecoveryWired) return;
  window.__antaresSupabaseRecoveryWired = true;

  maybeHandleSupabaseAuthUrlErrorFromHash();
  window.addEventListener("hashchange", () => {
    maybeHandleSupabaseAuthUrlErrorFromHash();
  });

  function enterRecoveryFlowFromStorage() {
    try {
      if (sessionStorage.getItem("antares_pw_recovery_pending") !== "1") return false;
      sessionStorage.removeItem("antares_pw_recovery_pending");
      state.authSupabaseRecovery = true;
      showAuth();
      renderAuthTab();
      scheduleStripSupabaseRecoveryHash(300);
      return true;
    } catch (_e) {
      return false;
    }
  }

  enterRecoveryFlowFromStorage();

  window.addEventListener("antares:supabase-password-recovery", () => {
    try {
      sessionStorage.setItem("antares_pw_recovery_pending", "1");
    } catch (_s) {}
    state.authSupabaseRecovery = true;
    showAuth();
    renderAuthTab();
    scheduleStripSupabaseRecoveryHash(500);
  });

  void waitForAntaresSupabaseClient(20000).then((client) => {
    if (!client) {
      enterRecoveryFlowFromStorage();
      return;
    }
    if (maybeHandleSupabaseAuthUrlErrorFromHash()) return;
    void client.auth.getSession().then(({ data }) => {
      const session = data?.session;
      const hash = String(window.location.hash || "");
      const recoveryUrl = /type=recovery/i.test(hash);
      let pending = false;
      try {
        pending = sessionStorage.getItem("antares_pw_recovery_pending") === "1";
      } catch (_e) {
        pending = false;
      }
      if (session && (recoveryUrl || pending)) {
        state.authSupabaseRecovery = true;
        showAuth();
        renderAuthTab();
        try {
          sessionStorage.removeItem("antares_pw_recovery_pending");
        } catch (_e2) {}
        scheduleStripSupabaseRecoveryHash(400);
        return;
      }
      enterRecoveryFlowFromStorage();
    });
  });
}

function findOrCreateCompanyIdByName(name) {
  const companyName = String(name || "").trim();
  if (!companyName) return null;
  const companies = read(KEYS.companies, []);
  const existing = companies.find(
    (item) => item.name.toLowerCase() === companyName.toLowerCase()
  );
  if (existing) return existing.id;
  const company = {
    id: newUuidV4(),
    name: companyName,
    taxId: "",
    nit: "",
    phone: "",
    companyKind: "cliente",
    active: true,
    createdAt: nowIso()
  };
  companies.push(company);
  write(KEYS.companies, companies);
  return company.id;
}

function getCompanyById(companyId) {
  return readArray(KEYS.companies).find((item) => item.id === companyId) || null;
}

function companySelectOptions(selectedId = "") {
  const sel = String(selectedId || "").trim();
  return readArray(KEYS.companies)
    .filter((company) => isCompanyRecordActive(company) || String(company.id) === sel)
    .map(
      (company) =>
        `<option value="${company.id}" ${String(company.id) === sel ? "selected" : ""}>${escapeHtml(String(company.name || ""))} (${escapeHtml(companyKindLabel(company.companyKind))})</option>`
    )
    .join("");
}

function getActivePositions() {
  return readArray(KEYS.positions).filter((p) => p.active !== false && String(p.name || "").trim());
}

function getPositionById(positionId) {
  const needle = String(positionId || "").trim();
  if (!needle) return null;
  return readArray(KEYS.positions).find((item) => String(item.id || "").trim() === needle) || null;
}

function positionSelectOptions(selectedId = "") {
  return getActivePositions()
    .map((position) => `<option value="${position.id}" ${position.id === selectedId ? "selected" : ""}>${position.name} · $${parseNum(position.baseSalary).toLocaleString("es-CO")}</option>`)
    .join("");
}

function dispatchPositionsCatalogUpdated() {
  try {
    window.dispatchEvent(new CustomEvent("antares-positions-catalog-updated"));
  } catch (_e) {
    /* noop */
  }
}

/**
 * Hidrata el catálogo de cargos desde GET /portal/positions (no depende del bootstrap masivo).
 * @returns {Promise<boolean>} true si se guardó al menos un cargo en memoria.
 */
async function refreshPositionsCatalogFromApi(opts = {}) {
  const api = window.AntaresApi;
  if (!api?.getJson || !portalCanRefreshFromApi()) return false;
  try {
    const payload = await api.getJson("/portal/positions");
    const raw = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.positions)
        ? payload.positions
        : [];
    const list = raw.map(normalizePortalBootstrapPositionRow).filter(Boolean);
    write(KEYS.positions, list, { skipSyncSchedule: true });
    dispatchPositionsCatalogUpdated();
    if (opts.rerender !== false && !hasUnsavedPortalFormData()) {
      scheduleRenderPortalView();
    }
    return list.length > 0;
  } catch (err) {
    devWarn("Portal: no se pudo cargar GET /portal/positions.", err?.message || err);
    return false;
  }
}

function refreshPositionSelectsInDocument() {
  const hasActive = getActivePositions().length > 0;
  document.querySelectorAll("select[name='positionId'], #emp-position-select").forEach((sel) => {
    const prev = String(sel.value || "").trim();
    const keep = prev && getPositionById(prev)?.active !== false ? prev : "";
    const isEmp = sel.id === "emp-position-select" || sel.closest("#form-employee");
    const head = isEmp
      ? `<option value="">${hasActive ? "Seleccione un cargo de Contratación" : "No hay cargos creados todavía"}</option>`
      : `<option value="">Seleccione</option>`;
    sel.innerHTML = `${head}${positionSelectOptions(keep)}`;
    if (keep) sel.value = keep;
    // El selector de cargo del alta de empleado se deshabilita si aún no hay cargos creados.
    if (isEmp) {
      sel.disabled = !hasActive;
      sel.setAttribute("aria-disabled", hasActive ? "false" : "true");
      const hint = sel.closest("#form-employee")?.querySelector("#emp-position-catalog-hint");
      if (hint) hint.classList.toggle("emp-position-empty-hint", !hasActive);
      if (hint) hint.classList.toggle("muted", hasActive);
    }
  });
}


/**
 * Guarda cargos en memoria al instante; sincroniza con PostgreSQL en segundo plano (o en espera si optimistic=false).
 * @returns {Promise<boolean>}
 */
async function persistPositionsCatalog(nextList, opts = {}) {
  const optimistic = opts.optimistic !== false;
  const prev = read(KEYS.positions, []);
  write(KEYS.positions, nextList, { skipSyncSchedule: true });
  dispatchPositionsCatalogUpdated();
  if (!optimistic) {
    try {
      await writeAwaitServer(KEYS.positions, nextList, { notifyOnFailure: opts.notifyOnFailure });
      return true;
    } catch (err) {
      write(KEYS.positions, prev, { skipSyncSchedule: true });
      dispatchPositionsCatalogUpdated();
      if (opts.notifyOnFailure !== false) {
        notify(String(err?.message || "No fue posible guardar el cargo en el servidor."), "error");
      }
      return false;
    }
  }
  void (async () => {
    try {
      await writeAwaitServer(KEYS.positions, nextList, { notifyOnFailure: false });
    } catch (err) {
      write(KEYS.positions, prev, { skipSyncSchedule: true });
      dispatchPositionsCatalogUpdated();
      if (opts.notifyOnFailure !== false) {
        notify(
          String(err?.message || "El cargo se guardó en pantalla pero no se sincronizó con el servidor."),
          "error"
        );
      }
    }
  })();
  return true;
}

function ensureCompaniesAndUserMapping() {
  const companies = read(KEYS.companies, []);
  const users = read(KEYS.users, []);

  let nextCompanies = [...companies];

  const companyByName = (name) =>
    nextCompanies.find(
      (company) => company.name.toLowerCase() === String(name || "").toLowerCase()
    );

  const mappedUsers = users.map((user) => {
    if (user.companyId) return user;
    const existing = companyByName(user.company);
    if (existing) return { ...user, companyId: existing.id };
    const created = {
      id: newUuidV4(),
      name: user.company || "Empresa sin nombre",
      taxId: user.taxId || "",
      nit: user.taxId || "",
      phone: user.phone || "",
      companyKind: "cliente",
      active: true,
      createdAt: nowIso()
    };
    nextCompanies.push(created);
    return { ...user, companyId: created.id };
  });

  write(KEYS.companies, nextCompanies);
  write(KEYS.users, mappedUsers);
}

function ensureRequestsCompanyMapping() {
  const users = read(KEYS.users, []);
  const requests = reqRead();
  const mapped = requests.map((request) => {
    if (request.clientCompanyId) return request;
    const owner = users.find((user) => user.id === request.clientUserId);
    return {
      ...request,
      clientCompanyId: owner?.companyId || null,
      requestedByName: request.requestedByName || owner?.name || request.clientName
    };
  });
  reqWrite(mapped);
}

function ensureRequestAndTripIdentifiers() {
  const requests = reqRead();
  let changed = false;
  const usedRequestNumbers = new Set(requests.map((r) => String(r.requestNumber || "").trim()).filter(Boolean));
  const usedTripNumbers = new Set(
    requests.map((r) => String(r.trip?.tripNumber || "").trim()).filter(Boolean)
  );
  const mapped = requests.map((request) => {
    const next = { ...request };
    if (!next.requestNumber) {
      next.requestNumber = makeRequestNumber(usedRequestNumbers);
      usedRequestNumbers.add(next.requestNumber);
      changed = true;
    }
    if (next.trip && !next.trip.tripNumber) {
      const tripNumber = makeTripNumber(usedTripNumbers);
      usedTripNumbers.add(tripNumber);
      next.trip = { ...next.trip, tripNumber };
      changed = true;
    }
    return next;
  });
  if (changed) reqWrite(mapped);
}

/** Permisos guardados desde formulario: respeta lo marcado; si queda vacío, defaults del rol (no re-expandir admin). */
function normalizeSavedUserPermissions(role, checkedPermissions) {
  const filtered = (Array.isArray(checkedPermissions) ? checkedPermissions : []).filter((p) =>
    ALL_PERMISSIONS.includes(p)
  );
  if (filtered.length > 0) return [...new Set(filtered)];
  return defaultPermissionsForRole(role);
}

function repaintPermGridInForm(form, role) {
  if (!form) return;
  const grid = form.querySelector(".perm-grid");
  if (!grid) return;
  grid.innerHTML = buildGranularPermissionsCheckboxesHtml(defaultPermissionsForRole(role || ROLES.CLIENT));
}

function wireAdminUserFormPermGridOnRoleChange(form) {
  if (!form || form.dataset.antaresPermRoleWired === "1") return;
  const roleSel = form.querySelector("select[name='role']");
  if (!roleSel || !form.querySelector(".perm-grid")) return;
  form.dataset.antaresPermRoleWired = "1";
  roleSel.addEventListener("change", () => {
    repaintPermGridInForm(form, roleSel.value || ROLES.CLIENT);
  });
}

function ensureUsersPermissions() {
  const users = read(KEYS.users, []);
  const updated = users.map((user) => {
    const current = Array.isArray(user.permissions) ? user.permissions : [];
    const filtered = current.filter((permission) => ALL_PERMISSIONS.includes(permission));
    if (filtered.length > 0) {
      return { ...user, permissions: filtered };
    }
    const merged = [...new Set(defaultPermissionsForRole(user.role))].filter((permission) =>
      ALL_PERMISSIONS.includes(permission)
    );
    return { ...user, permissions: merged };
  });
  const changed = updated.some((u, i) => {
    const a = JSON.stringify([...(u.permissions || [])].sort());
    const b = JSON.stringify([...(users[i]?.permissions || [])].sort());
    return a !== b;
  });
  if (changed) write(KEYS.users, updated);
}

function ensureUsersAccountStatus() {
  const users = read(KEYS.users, []);
  const serverBacked = Boolean(window.AntaresApi?.isConfigured?.() && window.AntaresApi?.getBase?.());
  let changed = false;
  const updated = users.map((user) => {
    const raw = user.accountStatus;
    if (raw !== undefined && raw !== null && String(raw).trim() !== "") return user;
    if (serverBacked) {
      return user;
    }
    changed = true;
    return { ...user, accountStatus: ACCOUNT_STATUS.APROBADO };
  });
  if (changed) write(KEYS.users, updated);
}

async function sanitizeApprovalPayloadForQueue(type, payload) {
  const base = payload && typeof payload === "object" ? { ...payload } : {};
  if (type === "create_user") {
    const next = { ...base };
    const passwordRaw = String(next.password || "");
    delete next.password;
    if (!next.passwordHash && passwordRaw) {
      next.passwordHash = await hashPassword(passwordRaw);
    }
    return normalizePayloadTextFields(next);
  }
  if (type === "mark_payroll_paid") {
    return normalizePayloadTextFields({
      payrollRunId: String(base.payrollRunId || "").trim(),
      employeeName: String(base.employeeName || "").trim(),
      month: String(base.month || "").trim()
    });
  }
  if (type === "approve_trip_request") {
    return {
      requestId: String(base.requestId || "").trim()
    };
  }
  if (type === "create_driver") {
    return normalizeDriverFormPayloadForStorage(base);
  }
  if (type === "create_employee") {
    return sanitizePayrollEmployeeFieldsForPersist(normalizePayloadTextFields(base));
  }
  return normalizePayloadTextFields(base);
}

async function queueApproval({ type, title, payload, requestedByUserId, requestedByName }) {
  const safePayload = await sanitizeApprovalPayloadForQueue(type, payload);
  const approvals = read(KEYS.approvals, []);
  approvals.unshift({
    id: newUuidV4(),
    type,
    title,
    payload: safePayload,
    status: "pendiente",
    requestedByUserId,
    requestedByName,
    requestedAt: nowIso(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: ""
  });
  try {
    await writeAwaitServer(KEYS.approvals, approvals);
  } catch (_e) {}
  notifyAdminUsers("Nueva autorización pendiente", `${title} solicitada por ${requestedByName}.`);
}

async function sanitizeLegacyApprovalPayloads() {
  const approvals = read(KEYS.approvals, []);
  if (!Array.isArray(approvals) || !approvals.length) return;
  let changed = false;
  const next = [];
  for (const approval of approvals) {
    if (!approval || typeof approval !== "object") {
      next.push(approval);
      continue;
    }
    const payload = approval.payload && typeof approval.payload === "object" ? { ...approval.payload } : {};
    if (approval.type === "create_user" && payload.password && !payload.passwordHash) {
      payload.passwordHash = await hashPassword(payload.password);
      delete payload.password;
      changed = true;
    } else if (approval.type === "create_user" && payload.password) {
      delete payload.password;
      changed = true;
    }
    next.push({ ...approval, payload });
  }
  if (changed) write(KEYS.approvals, next);
}

void sanitizeLegacyApprovalPayloads();

/** Metadatos UI: cola de autorizaciones agrupada por ambito operativo (ver también queueApproval). */
const APPROVAL_TYPE_META = {
  create_user: { sectionKey: "portal_access", label: "Alta de usuario del portal" },
  create_driver: { sectionKey: "transport_fleet", label: "Alta de conductor" },
  create_employee: { sectionKey: "workforce", label: "Alta de colaborador (gestión humana)" },
  register_hr_absence: { sectionKey: "hr_absences", label: "Registro de ausencia o incapacidad" },
  mark_payroll_paid: { sectionKey: "payroll_pay", label: "Confirmar pago de liquidación" },
  approve_trip_request: { sectionKey: "misc", label: "Solicitud de transporte pendiente (historico en cola)" }
};

const APPROVAL_UI_BLOCKS = [
  {
    key: "portal_access",
    kind: "queue",
    title: "Acceso y usuarios del portal",
    description:
      "Creación de cuentas que un operador sin rol administrador registra en el módulo de usuarios. Al aprobar, el sistema materializa el usuario, permisos y empresa asociada.",
    origin: "Usuarios y permisos → nuevo usuario (no administrador)"
  },
  {
    key: "transport_fleet",
    kind: "queue",
    title: "Conductores y flota operativa",
    description:
      "Alta de conductor solicitada por un perfil que no es administrador. Al aprobar, se crea el conductor disponible para asignación y, si aplica, el registro vinculado en gestión humana.",
    origin: "Conductores → nuevo registro (no administrador)"
  },
  {
    key: "workforce",
    kind: "queue",
    title: "Talento, contratación y gestión humana",
    description:
      "Ingreso de colaborador al expediente de personal cuando quien registra no es administrador. Incluye datos contractuales, seguridad social y desempeño del flujo de aprobación previo a la ficha activa.",
    origin: "Gestión humana → nuevo empleado (no administrador)"
  },
  {
    key: "hr_absences",
    kind: "queue",
    title: "Ausencias, incapacidades y SST",
    description:
      "Registro formal de ausencia cuando quien carga el dato tiene rol de Recursos Humanos, Administración, Auxiliar administrativo o Líder administrativo. El administrador valida antes de dejar constancia.",
    origin: "Cumplimiento laboral y SST → registro de ausencia (roles RRHH / administrativos)"
  },
  {
    key: "payroll_pay",
    kind: "queue",
    title: "Liquidación y marcas de pago",
    description:
      "Marcar liquidación de nómina como pagada cuando la acción la inicia un perfil RRHH o administrativo (no administrador de sistema). Evita cierres contables sin doble validación.",
    origin: "Gestión humana → marcar liquidación pagada (roles RRHH / administrativos)"
  }
];

function approvalTypeLabel(type) {
  return APPROVAL_TYPE_META[type]?.label || type;
}

/** Referencias cortas para correlacionar colas en soporte (no sustituyen UUID completos en API). */
function shortAuthRefSegment(rawId) {
  const s = String(rawId || "").replace(/-/g, "");
  return s.length >= 8 ? s.slice(0, 8).toUpperCase() : (s || "--------").toUpperCase();
}
function authRefAltaUsuario(id) {
  return `USR-${shortAuthRefSegment(id)}`;
}

/**
 * Enmascara un número/documento mostrando solo los últimos N caracteres.
 * Pensado para PII (cédulas, NIT, teléfonos) en listados visibles a varios
 * operadores: el admin reconoce el registro pero no expone el dato completo.
 * El valor sin máscara solo se ve dentro del modal de aprobación.
 */
function maskSensitiveTail(raw, keep = 3) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const compact = s.replace(/\s+/g, "");
  if (compact.length <= keep) return "•".repeat(Math.max(2, compact.length));
  const visible = compact.slice(-keep);
  return `${"•".repeat(Math.max(3, compact.length - keep))}${visible}`;
}

/** Enmascara teléfono dejando los últimos 4 dígitos visibles (estándar para PII). */
function maskSensitivePhone(raw) {
  return maskSensitiveTail(raw, 4);
}
function authRefSolicitudViaje(r) {
  const n = String(r.requestNumber || "").trim();
  return n ? `VIA-${n}` : `VIA-${shortAuthRefSegment(r.id)}`;
}
function authRefColaInterna(approvalId) {
  return `COL-${shortAuthRefSegment(approvalId)}`;
}

function approvalDetailLine(approval) {
  const p = approval.payload || {};
  switch (approval.type) {
    case "create_user":
      return [maskSensitiveTail(normalizeEmail(p.email || ""), 10), p.role].filter(Boolean).join(" · ") || "—";
    case "create_driver":
      return [String(p.name || "").trim(), p.idDoc ? `Doc. ${maskSensitiveTail(p.idDoc, 3)}` : ""].filter(Boolean).join(" · ") || "—";
    case "create_employee":
      return [String(p.name || "").trim(), p.idDoc ? `ID ${maskSensitiveTail(p.idDoc, 3)}` : "", String(p.position || "").trim()]
        .filter(Boolean)
        .join(" · ") || "—";
    case "register_hr_absence":
      return [payrollAbsenceTypeLabel(p.absenceType), p.startDate && p.endDate ? `${p.startDate} → ${p.endDate}` : ""]
        .filter(Boolean)
        .join(" · ") || "—";
    case "mark_payroll_paid":
      return [String(p.employeeName || "").trim(), String(p.month || "").trim()].filter(Boolean).join(" · ") || "—";
    case "approve_trip_request":
      return String(p.requestId || "").trim() ? `Solicitud ${p.requestId}` : "—";
    default:
      return "—";
  }
}

/** Misma barra de acciones en todas las colas de Autorizaciones (solo cambian los data-action). */
function buildAuthStandardActionsHtml(mode, id) {
  const eid = escapeAttr(String(id));
  if (mode === "registration") {
    return `<div class="toolbar auth-approval-toolbar">
      <button type="button" class="btn btn-sm btn-approve" data-action="approve-registration" data-id="${eid}">${IC.check} Aprobar</button>
      <button type="button" class="btn btn-sm btn-reject" data-action="reject-registration" data-id="${eid}">${IC.x} Rechazar</button>
    </div>`;
  }
  return `<div class="toolbar auth-approval-toolbar">
      <button type="button" class="btn btn-sm btn-approve" data-action="approval-approve" data-id="${eid}">${IC.check} Aprobar</button>
      <button type="button" class="btn btn-sm btn-reject" data-action="approval-reject" data-id="${eid}">${IC.x} Rechazar</button>
    </div>`;
}

/** Orden: más reciente primero (fecha ISO). */
function sortAuthQueueByDateDesc(items, getIso) {
  const getTs = typeof getIso === "function" ? getIso : (x) => x;
  return items.slice().sort((a, b) => {
    const ta = new Date(getTs(a) || 0).getTime();
    const tb = new Date(getTs(b) || 0).getTime();
    return tb - ta;
  });
}

const AUTH_QUEUE_SHORT_TAB_LABELS = {
  portal_access: "Alta usuarios",
  transport_fleet: "Conductores",
  workforce: "Empleados",
  hr_absences: "Ausencias",
  payroll_pay: "Liquidaciones"
};

function buildAuthorizationsTransportRequestsSection(pendingRequests) {
  const n = pendingRequests.length;
  const actor = currentUser();
  const canApprove = canApproveTransportRequests(actor);
  const countBadge = `<span class="auth-section-count">${n} solicitud pendiente${n === 1 ? "" : "es"}</span>`;
  const cards = pendingRequests
    .map((r) => {
      const eid = escapeAttr(String(r.id));
      const allowEdit = canPortalUserEditTransportRequest(r, actor);
      const editBtn = allowEdit
        ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-request" data-id="${eid}">${IC.edit} Editar</button>`
        : "";
      const decisionBtns = canApprove
        ? `<button type="button" class="btn btn-sm btn-approve" data-action="approve" data-id="${eid}">${IC.check} Aprobar</button>
        <button type="button" class="btn btn-sm btn-reject" data-action="reject" data-id="${eid}">${IC.x} Rechazar</button>`
        : "";
      return `<article class="auth-request-card">
      <div class="auth-request-card-top">
        <span class="auth-ref-pill" title="Código solicitud">${escapeHtml(authRefSolicitudViaje(r))}</span>
        <span class="auth-request-card-id">${escapeHtml(String(r.requestNumber || r.id))}</span>
        ${prettyStatus(r.status, "request")}
      </div>
      <p class="auth-request-card-route">${escapeHtml(formatRoute(r))}</p>
      <p class="muted auth-request-card-meta">${escapeHtml(String(r.clientName || "").trim() || "—")} · ${escapeHtml(String(r.requestedByName || "").trim() || "—")}</p>
      <p class="muted auth-request-card-date">${fmtDate(r.createdAt)}</p>
      <div class="toolbar auth-request-card-actions">
        <button type="button" class="btn btn-sm btn-action" data-action="detail" data-id="${eid}">${IC.eye} Ver</button>
        ${editBtn}
        ${decisionBtns}
      </div>
    </article>`;
    })
    .join("");
  const body = n
    ? `<div class="auth-request-cards-scroll">${cards}</div>`
    : emptyState("No hay solicitudes de transporte pendientes de aprobación.");
  return `<section class="auth-queue-section auth-queue-section--transport-req" data-auth-section="transport_requests" aria-label="Solicitudes de transporte pendientes">
      <header class="auth-queue-section-head">
        <div class="auth-queue-section-title-row">
          <h3 class="auth-queue-section-title">Solicitudes pendientes</h3>
          ${countBadge}
        </div>
        <p class="muted auth-queue-section-desc">Pendientes de aprobación operativa. Use <strong>Editar</strong> para ajustar tipo de camión (fuelles o kg) antes de <strong>Aprobar</strong>.</p>
      </header>
      <div class="auth-queue-section-body">${body}</div>
    </section>`;
}

function portalRegistrationDetailLine(u) {
  const company = getCompanyById(u.companyId)?.name || u.company || "";
  const doc = [u.documentType, u.taxId].filter(Boolean).join(" ");
  const pers = u.personalTaxId || u.personalDoc;
  const persBit = pers ? `pers. ${String(pers).trim()}` : "";
  const parts = [
    normalizeEmail(u.email || ""),
    company,
    doc,
    persBit,
    u.phone ? String(u.phone).trim() : ""
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function registrationKindLabel(kind) {
  const k = String(kind || "")
    .trim()
    .toLowerCase();
  if (k === "empleado_interno") return "Empleado interno";
  return "Cliente externo";
}

/** Etiqueta breve para chips de tarjeta de usuario. */
function registrationKindChipLabel(kind) {
  const k = String(kind || "")
    .trim()
    .toLowerCase();
  if (k === "empleado_interno") return "Interno";
  return "Externo";
}

function portalRegistrationInboxInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function buildPortalRegistrationInboxCardsHtml(pendingUsers) {
  const sorted = sortAuthQueueByDateDesc(pendingUsers || [], (u) => u.registeredAt || u.createdAt);
  return sorted
    .map((u) => {
      const eid = escapeAttr(String(u.id));
      const when = u.registeredAt || u.createdAt;
      const loc = [u.city, u.department].filter(Boolean).join(", ");
      const personLabel = u.personType === "juridica" ? "Jurídica" : u.personType === "natural" ? "Natural" : String(u.personType || "").trim() || "—";
      // PII enmascarada en la bandeja: el admin solo ve los últimos dígitos para
      // reconocer la solicitud. El número completo se muestra dentro del modal
      // de aprobación, donde la acción ya queda auditada.
      const docTypeStr = String(u.documentType || "").trim();
      const docNumRaw = String(u.taxId || u.personalDoc || "").trim();
      const docMasked = docNumRaw ? maskSensitiveTail(docNumRaw, 3) : "";
      const docLine = [docTypeStr, docMasked].filter(Boolean).join(" ");
      const nitEmpRaw = String(u.companyNit || "").trim();
      const nitMasked = nitEmpRaw ? maskSensitiveTail(nitEmpRaw, 3) : "";
      const phoneRaw = String(u.phone || "").trim();
      const phoneMasked = phoneRaw ? maskSensitivePhone(phoneRaw) : "";
      return `<article class="auth-inbox-card" data-pending-user-id="${eid}">
        <div class="auth-inbox-card-accent" aria-hidden="true"></div>
        <div class="auth-inbox-card-main">
          <div class="auth-inbox-card-avatar" aria-hidden="true">${escapeHtml(portalRegistrationInboxInitials(u.name))}</div>
          <div class="auth-inbox-card-body">
            <div class="auth-inbox-card-top">
              <div class="auth-inbox-card-title-row">
                <h4 class="auth-inbox-card-name">${escapeHtml(String(u.name || "").trim() || "Sin nombre")}</h4>
                <span class="auth-ref-pill" title="Código de alta">${escapeHtml(authRefAltaUsuario(u.id))}</span>
              </div>
              <span class="auth-inbox-pulse">${IC.userPlus} En revisión</span>
            </div>
            <p class="auth-inbox-card-email">${escapeHtml(normalizeEmail(u.email || ""))}</p>
            <div class="auth-inbox-chip-row">
              <span class="auth-inbox-chip">${IC.briefcase} ${escapeHtml(personLabel)}</span>
              ${docLine ? `<span class="auth-inbox-chip" title="Documento enmascarado por privacidad. Verá el número completo al aprobar.">${IC.badge} ${escapeHtml(docLine)}</span>` : ""}
              ${nitMasked ? `<span class="auth-inbox-chip" title="NIT enmascarado por privacidad. Verá el número completo al aprobar.">${IC.building} NIT ${escapeHtml(nitMasked)}</span>` : ""}
              ${u.registrationKind ? `<span class="auth-inbox-chip">${IC.shield} ${escapeHtml(registrationKindLabel(u.registrationKind))}</span>` : ""}
              ${u.position ? `<span class="auth-inbox-chip">${IC.award} ${escapeHtml(String(u.position).trim())}</span>` : ""}
              ${loc ? `<span class="auth-inbox-chip">${IC.mapPin} ${escapeHtml(loc)}</span>` : ""}
              ${phoneMasked ? `<span class="auth-inbox-chip" title="Teléfono enmascarado por privacidad. Verá el número completo al aprobar.">${IC.phone} ${escapeHtml(phoneMasked)}</span>` : ""}
            </div>
            <p class="auth-inbox-card-date">${IC.clock} Solicitud · ${when ? escapeHtml(fmtDate(when)) : "—"}</p>
            <div class="auth-inbox-card-actions">${buildAuthStandardActionsHtml("registration", u.id).replace("auth-approval-toolbar", "auth-approval-toolbar auth-inbox-actions")}</div>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function buildPortalRegistrationPendingTableHtml(pendingUsers) {
  return `<div class="auth-inbox-grid">${buildPortalRegistrationInboxCardsHtml(pendingUsers)}</div>`;
}

function buildPendingApprovalsTableHtml(rows) {
  const sorted = sortAuthQueueByDateDesc(rows || [], (a) => a.requestedAt);
  const body = sorted
    .map((a) => {
      const detail = approvalDetailLine(a);
      const detailHtml = escapeHtml(detail);
      return `<tr>
    <td><span class="auth-ref-pill">${escapeHtml(authRefColaInterna(a.id))}</span></td>
    <td><span class="auth-type-badge">${escapeHtml(approvalTypeLabel(a.type))}</span></td>
    <td><strong>${escapeHtml(String(a.title || "").trim() || "—")}</strong></td>
    <td class="auth-detail-cell">${detailHtml}</td>
    <td>${escapeHtml(String(a.requestedByName || "").trim() || "—")}</td>
    <td>${fmtDate(a.requestedAt)}</td>
    <td>${buildAuthStandardActionsHtml("approval", a.id)}</td>
  </tr>`;
    })
    .join("");
  return `<div class="table-wrap auth-pending-table"><table><thead><tr>
    <th>Código</th><th>Tipo</th><th>Resumen</th><th>Detalle</th><th>Solicitante</th><th>Fecha</th><th>Acciones</th>
  </tr></thead><tbody>${body}</tbody></table></div>`;
}

function ensureVehicleDocs() {
  const vehicles = read(KEYS.vehicles, []);
  let changed = false;
  const nowDate = colombiaTodayIsoDate();
  const updated = vehicles.map((v) => {
    if (v.soatExpeditionDate && v.techInspectionExpeditionDate) return v;
    changed = true;
    return {
      ...v,
      soatExpeditionDate: v.soatExpeditionDate || nowDate,
      techInspectionExpeditionDate: v.techInspectionExpeditionDate || nowDate
    };
  });
  if (changed) write(KEYS.vehicles, updated);
}

/** Migraciones de esquema. Datos de negocio: memoria de sesión + PostgreSQL (no localStorage). */
function initPortalClientStorage() {
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    const PORTAL_DATA_VERSION = "v8-server-backed-memory-only";
    if (localStorage.getItem("antares_portal_data_ver") !== PORTAL_DATA_VERSION) {
      if (typeof window.AntaresPersistence?.purgeServerBackedFromDisk === "function") {
        window.AntaresPersistence.purgeServerBackedFromDisk();
      }
      localStorage.removeItem("antares_enterprise_seed_v1");
      localStorage.removeItem("antares_purge_demo_v1");
      localStorage.setItem("antares_portal_data_ver", PORTAL_DATA_VERSION);
    }

    if (localStorage.getItem("antares_users_storage_ver") !== "v5-memory") {
      localStorage.setItem("antares_users_storage_ver", "v5-memory");
    }

    ensureCompaniesAndUserMapping();
    ensureRequestsCompanyMapping();
    ensureRequestAndTripIdentifiers();
    ensureUsersPermissions();
    ensureUsersAccountStatus();
    ensureVehicleDocs();
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

/**
 * Política de sesión (lectura/escritura de `KEYS.session`, idle, bump de actividad): `modules/core/auth.js`
 * (`getSession`, `setSession`, `SESSION_IDLE_MS`, `throttledBumpSessionActivity`, etc.).
 * Aquí solo quedan temporizadores del portal y el aviso en página pública por idle.
 */
const SESSION_API_REFRESH_MS = 12 * 60 * 1000;
const SESSION_CLIENT_TOKEN_ROTATE_MS = 15 * 60 * 1000;

let __sessionIdleCheckTimer = null;
let __sessionApiRefreshTimer = null;
let __sessionActivityHandler = null;
const SESSION_IDLE_PUBLIC_NOTICE_KEY = "antares_session_idle_notice_v1";

function stopSessionSecurityWatch() {
  if (__sessionActivityHandler) {
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) => {
      window.removeEventListener(ev, __sessionActivityHandler);
    });
    __sessionActivityHandler = null;
  }
  if (__sessionIdleCheckTimer) {
    clearInterval(__sessionIdleCheckTimer);
    __sessionIdleCheckTimer = null;
  }
  if (__sessionApiRefreshTimer) {
    clearInterval(__sessionApiRefreshTimer);
    __sessionApiRefreshTimer = null;
  }
}

function checkSessionIdleAndLogout() {
  const s = getSession();
  if (!s) return;
  const last = getEffectiveLastActivityAt();
  if (!last || Date.now() - last <= SESSION_IDLE_MS) return;
  stopSessionSecurityWatch();
  clearSession();
  state.currentView = "dashboard";
  history.replaceState(null, "", window.location.pathname + window.location.search);
  announceSessionClosedByIdle();
  renderPortal();
}

/**
 * Intenta renovar el JWT contra POST /api/auth/refresh.
 * Devuelve:
 *   - { status: "ok" } cuando rota el access token (y opcionalmente el refresh).
 *   - { status: "invalid" } cuando el servidor responde 401/403 → el refresh token ya no sirve
 *     (rotado por otra pestaña, sesión invalidada por admin, contraseña cambiada).
 *   - { status: "network" } ante errores transitorios (sin conexión, 5xx) — la sesión local
 *     se conserva para reintentar luego sin expulsar al usuario.
 *   - { status: "skipped" } cuando no hay sesión/URL/refresh para usar.
 */
async function tryApiRefreshBridge() {
  const api = window.AntaresApi;
  const session = getSession();
  if (!api?.getBase?.() || !session?.userId || !session?.refreshToken) {
    return { status: "skipped" };
  }
  const base = String(api.getBase()).replace(/\/+$/, "");
  let res;
  try {
    res = await fetch(`${base}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ userId: session.userId, refreshToken: session.refreshToken })
    });
  } catch (_netErr) {
    return { status: "network" };
  }
  if (res.status === 401 || res.status === 403) {
    return { status: "invalid", httpStatus: res.status };
  }
  if (!res.ok) return { status: "network", httpStatus: res.status };
  let body = null;
  try {
    body = await res.json();
  } catch (_jsonErr) {
    return { status: "network" };
  }
  if (!body?.accessToken) return { status: "network" };
  api.setAccessToken(body.accessToken);
  const now = Date.now();
  setSession({
    ...session,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken || session.refreshToken,
    lastActivityAt: now
  });
  syncSessionProfileSnapshotFromCache();
  return { status: "ok" };
}

function refreshClientSessionTokenIfDue() {
  const s = getSession();
  if (!s) return;
  const user = currentUser();
  if (!user) return;
  const now = Date.now();
  const lastAct = getEffectiveLastActivityAt() || now;
  if (now - lastAct > SESSION_IDLE_MS) return;
  const issued = typeof s.tokenIssuedAt === "number" ? s.tokenIssuedAt : 0;
  if (now - issued < SESSION_CLIENT_TOKEN_ROTATE_MS) return;
  setSession({ ...getSession(), token: buildToken(user), tokenIssuedAt: now });
}

async function scheduledSessionTokenMaintenance() {
  const s = getSession();
  if (!s || !currentUser()) return;
  const lastAct = getEffectiveLastActivityAt() || Date.now();
  if (Date.now() - lastAct > SESSION_IDLE_MS) return;
  await tryApiRefreshBridge();
  refreshClientSessionTokenIfDue();
}

function queueSessionIdlePublicNotice() {
  try {
    sessionStorage.setItem(SESSION_IDLE_PUBLIC_NOTICE_KEY, "1");
  } catch (_e) {
    /* noop */
  }
}

function dismissSessionIdlePublicNotice() {
  try {
    sessionStorage.removeItem(SESSION_IDLE_PUBLIC_NOTICE_KEY);
  } catch (_e) {
    /* noop */
  }
  document.getElementById("session-idle-banner")?.remove();
}

function mountSessionIdlePublicNoticeIfNeeded() {
  if (typeof document === "undefined") return;
  let pending = false;
  try {
    pending = sessionStorage.getItem(SESSION_IDLE_PUBLIC_NOTICE_KEY) === "1";
  } catch (_e) {
    return;
  }
  if (!pending) return;
  if (document.getElementById("session-idle-banner")) return;
  const aside = document.createElement("aside");
  aside.id = "session-idle-banner";
  aside.className = "session-idle-banner";
  aside.setAttribute("role", "status");

  const inner = document.createElement("div");
  inner.className = "session-idle-banner-inner";

  const text = document.createElement("div");
  text.className = "session-idle-banner-text";

  const title = document.createElement("p");
  title.className = "session-idle-banner-title";
  title.textContent = userMessage("sessionIdle");

  const hint = document.createElement("p");
  hint.className = "session-idle-banner-hint muted";
  const hintMsg = userMessage("sessionIdleBannerHint");
  hint.textContent = typeof hintMsg === "string" && hintMsg !== "sessionIdleBannerHint" ? hintMsg : "";

  text.appendChild(title);
  if (hint.textContent) text.appendChild(hint);

  const actions = document.createElement("div");
  actions.className = "session-idle-banner-actions";

  const btnIn = document.createElement("button");
  btnIn.type = "button";
  btnIn.className = "btn btn-primary btn-sm session-idle-banner-login";
  btnIn.textContent = "Ingresar al portal";
  btnIn.addEventListener("click", () => {
    dismissSessionIdlePublicNotice();
    (document.getElementById("open-auth-hero") || document.getElementById("open-auth"))?.click();
  });

  const btnOk = document.createElement("button");
  btnOk.type = "button";
  btnOk.className = "btn btn-ghost btn-sm session-idle-banner-dismiss";
  btnOk.textContent = "Entendido";
  btnOk.addEventListener("click", () => dismissSessionIdlePublicNotice());

  actions.appendChild(btnIn);
  actions.appendChild(btnOk);

  inner.appendChild(text);
  inner.appendChild(actions);
  aside.appendChild(inner);

  const host =
    document.getElementById("public-app") ||
    document.getElementById("hero") ||
    document.body;
  host.insertBefore(aside, host.firstChild);
}

function announceSessionClosedByIdle() {
  queueSessionIdlePublicNotice();
  mountSessionIdlePublicNoticeIfNeeded();
}

function ensureSessionLifecycleHooks() {
  if (typeof window === "undefined" || window.__antaresSessionLifecycleOk) return;
  window.__antaresSessionLifecycleOk = true;
  window.addEventListener("pagehide", () => flushSessionActivityToStorage(), { capture: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSessionActivityToStorage();
  });
}

function startSessionSecurityWatch() {
  stopSessionSecurityWatch();
  ensureSessionLifecycleHooks();
  __sessionActivityHandler = window.throttledBumpSessionActivity;
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) => {
    window.addEventListener(ev, __sessionActivityHandler, { passive: true });
  });
  __sessionIdleCheckTimer = setInterval(checkSessionIdleAndLogout, 60 * 1000);
  __sessionApiRefreshTimer = setInterval(() => void scheduledSessionTokenMaintenance(), SESSION_API_REFRESH_MS);
}

function clearSession() {
  stopSessionSecurityWatch();
  stopNotificationsPolling();
  if (typeof resetSessionActivityMemory === "function") resetSessionActivityMemory();
  const snapUid = getSession()?.userId || state.session?.userId;
  localStorage.removeItem(KEYS.session);
  state.session = null;
  state.portalContacts = [];
  state.adminUserSessions = [];
  state.adminUserSessionsLoading = false;
  state.adminUserSessionsError = null;
  state.adminUserSessionsHydrated = false;
  state.adminUsersEntryHydrating = false;
  state.portalDataHydrating = false;
  state.portalDataHydrated = false;
  state.portalSnapshotRestored = false;
  try {
    window.PortalBootstrapCache?.clear?.(snapUid);
  } catch (_snapClear) {
    /* noop */
  }
  state.adminSessionsLogMinimized = true;
  state.deletedTransportRequestsLogMinimized = true;
  state.deletedTransportTripsLogMinimized = true;
  state.notificationPreferences = {
    id: null,
    notificacionesHabilitadas: true,
    sonidoNotificacionesHabilitadas: true,
    createdAt: null,
    updatedAt: null
  };
  state.__notificationPrefsHydratedFromServer = false;
  if (typeof window.AntaresPersistence?.clearServerBackedMemory === "function") {
    window.AntaresPersistence.clearServerBackedMemory();
  }
  try {
    localStorage.removeItem("antares_api_access_token");
  } catch (_e) {
    /* noop */
  }
}

async function tryApiLoginBridge(user, password) {
  const api = window.AntaresApi;
  if (!api?.getBase?.() || !user?.email) return;
  try {
    const url = `${api.getBase()}/api/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: user.email, password })
    });
    const body = res.ok ? await res.json() : null;
    if (!body?.accessToken) return;
    api.setAccessToken(body.accessToken);
    const session = getSession();
    if (session) {
      setSession({
        ...session,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken || "",
        lastActivityAt: Date.now()
      });
    }
    await startPortalBootstrapForInteractiveSession();
    syncSessionProfileSnapshotFromCache();
    if (state.session && currentUser()) {
      scheduleRenderPortalView();
      updateNotificationBadge();
    }
  } catch (_e) {
    /* API opcional: sesion local sigue valida */
  }
}

function buildToken(user) {
  const nonce = crypto.getRandomValues(new Uint32Array(2)).join("");
  return btoa(`${user.id}.${user.role}.${Date.now()}.${nonce}`);
}

async function ensureUsersPasswordHashing() {
  const users = read(KEYS.users, []);
  if (window.AntaresApi?.getBase?.()) {
    let anyPlain = false;
    for (const user of users) {
      const p = String(user.password || "");
      if (p && !p.startsWith("sha256:")) {
        anyPlain = true;
        break;
      }
    }
    if (!anyPlain) return;
  }
  let changed = false;
  const secured = [];
  for (const user of users) {
    const p = String(user.password || "");
    if (p.startsWith("sha256:")) {
      secured.push(user);
      continue;
    }
    if (!p) {
      secured.push(user);
      continue;
    }
    changed = true;
    secured.push({ ...user, password: await hashPassword(p) });
  }
  if (changed) write(KEYS.users, secured);
}

function currentTurnstileTheme() {
  return String(document.body?.dataset?.theme || "light") === "dark" ? "dark" : "light";
}

/** Marca opcional para el widget Turnstile. Si la site key no está configurada (dev sin captcha), devuelve cadena vacía y el formulario igual envía. */
function turnstileWidgetMarkup() {
  const siteKey = String(window.ANTARES_TURNSTILE_SITE_KEY || "").trim();
  if (!siteKey) return "";
  const theme = currentTurnstileTheme();
  return `
    <div class="full turnstile-row">
      <div class="turnstile-shell">
        <span class="turnstile-shell-label">Verificación de seguridad</span>
        <div class="cf-turnstile" data-sitekey="${siteKey}" data-size="flexible" data-theme="${theme}" data-antares-pending="1"></div>
      </div>
    </div>
  `;
}

/**
 * Renderiza explícitamente todos los widgets Turnstile presentes en el DOM. La auto-detección de
 * `api.js` falla a veces en formularios montados dinámicamente; este paso es defensivo y se vuelve
 * no-op cuando un nodo ya fue inicializado (marcamos con `data-antares-pending="0"`).
 */
function ensureTurnstileWidgets() {
  const siteKey = String(window.ANTARES_TURNSTILE_SITE_KEY || "").trim();
  if (!siteKey) return;
  const theme = currentTurnstileTheme();
  const nodes = document.querySelectorAll('.cf-turnstile[data-antares-pending="1"]');
  if (!nodes.length) return;
  const tryRender = () => {
    if (!window.turnstile?.render) return false;
    nodes.forEach((node) => {
      try {
        if (node.dataset.antaresPending !== "1") return;
        node.dataset.antaresPending = "0";
        window.turnstile.render(node, {
          sitekey: siteKey,
          theme,
          callback: (token) => {
            try {
              node.dataset.antaresToken = String(token || "");
              node.dataset.antaresError = "";
            } catch (_e) {}
          },
          /**
           * Marcamos `data-antares-error="1"` para que `waitForTurnstileToken`
           * pueda resolver de inmediato y no haga esperar al usuario hasta
           * agotar el timeout (típicamente 4-6s). Esto evita que el login se
           * "cuelgue" cuando el hostname no está permitido en el panel de
           * Turnstile o cuando el script de Cloudflare está bloqueado por
           * algún antivirus / red corporativa.
           */
          "error-callback": () => {
            try {
              node.dataset.antaresToken = "";
              node.dataset.antaresError = "1";
            } catch (_e) {}
          },
          "expired-callback": () => {
            try {
              node.dataset.antaresToken = "";
            } catch (_e) {}
          }
        });
      } catch (_e) {
        node.dataset.antaresPending = "1";
      }
    });
    return true;
  };
  if (!tryRender()) {
    // El script `api.js` aún no terminó de cargar (defer). Reintentamos cuando esté disponible.
    const interval = window.setInterval(() => {
      if (tryRender()) window.clearInterval(interval);
    }, 250);
    window.setTimeout(() => window.clearInterval(interval), 8000);
  }
}

/**
 * Espera a que el widget Turnstile produzca un token (hasta `timeoutMs`).
 * Devuelve cadena vacía cuando:
 *  - El formulario no tiene widget (sitekey ausente, dev sin captcha, etc.).
 *  - El widget reportó error (`data-antares-error="1"`, p. ej. hostname no
 *    permitido o script de Cloudflare bloqueado): no esperamos al timeout.
 *  - Pasaron `timeoutMs` ms sin token.
 *
 * El backend tiene su propia guarda (`TurnstileService.assertValid`): si el
 * token llega vacío y `CF_TURNSTILE_REQUIRED` está apagado, login pasa igual;
 * si está encendido, responde 400 limpio en lugar de hacer esperar al usuario.
 */
function waitForTurnstileToken(form, timeoutMs = 4000) {
  return new Promise((resolve) => {
    if (!form) return resolve("");
    const widget = form.querySelector(".cf-turnstile");
    if (!widget) return resolve("");
    const readNow = () => {
      const fromWidget = String(widget.dataset.antaresToken || "").trim();
      if (fromWidget) return fromWidget;
      try {
        if (window.turnstile?.getResponse) {
          const v = window.turnstile.getResponse(widget);
          if (v) return String(v).trim();
        }
      } catch (_e) {}
      try {
        const fd = new FormData(form);
        const v = fd.get("cf-turnstile-response");
        return typeof v === "string" ? v.trim() : "";
      } catch (_e) {
        return "";
      }
    };
    const hasError = () => String(widget.dataset.antaresError || "") === "1";
    const immediate = readNow();
    if (immediate) return resolve(immediate);
    if (hasError()) return resolve("");
    const start = Date.now();
    const timer = window.setInterval(() => {
      const now = readNow();
      if (now) {
        window.clearInterval(timer);
        resolve(now);
        return;
      }
      if (hasError()) {
        window.clearInterval(timer);
        resolve("");
        return;
      }
      if (Date.now() - start > timeoutMs) {
        window.clearInterval(timer);
        resolve("");
      }
    }, 200);
  });
}

/** Lectura síncrona del token (sin esperar). Útil cuando ya validamos antes en submit. */
function readTurnstileToken(form) {
  if (!form) return "";
  const widget = form.querySelector?.(".cf-turnstile");
  if (widget) {
    const fromWidget = String(widget.dataset.antaresToken || "").trim();
    if (fromWidget) return fromWidget;
    try {
      if (window.turnstile?.getResponse) {
        const v = window.turnstile.getResponse(widget);
        if (v) return String(v).trim();
      }
    } catch (_e) {}
  }
  try {
    const fd = new FormData(form);
    const v = fd.get("cf-turnstile-response");
    return typeof v === "string" ? v.trim() : "";
  } catch (_e) {
    return "";
  }
}

/** Reinicia el widget tras un error o submit fallido (cada token es de un solo uso). */
function resetTurnstile(form) {
  try {
    const widget = form?.querySelector?.(".cf-turnstile");
    if (!widget) return;
    if (widget.dataset) widget.dataset.antaresToken = "";
    if (window.turnstile?.reset) window.turnstile.reset(widget);
  } catch (_e) {}
}

function authView() {
  if (state.authSupabaseRecovery) {
    return `
    <div class="auth-header-premium">
      <h3>Asignar contraseña</h3>
      <p class="muted">Elija una contraseña segura. Quedará aplicada para el inicio de sesión en este portal.</p>
    </div>
    <form id="form-recover-complete" class="form-grid auth-pane auth-form" autocomplete="off">
      <label class="full auth-field-stack">
        <span class="auth-plain-label">${fieldLabel(IC.lock, "Asignar contraseña", { required: true })}</span>
        <div class="password-field auth-password-row">
          <div class="auth-input-row auth-input-row--grow">
            <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
            <input class="auth-input-control" type="password" name="password" minlength="10" autocomplete="new-password" autocapitalize="off" spellcheck="false" required aria-describedby="recover-password-strength-headline recover-password-hint" />
          </div>
          <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="recover-complete">${IC.eye} Mostrar</button>
        </div>
      </label>
      <label class="full auth-field-stack">
        <span class="auth-plain-label">${fieldLabel(IC.shield, "Confirmar contraseña", { required: true })}</span>
        <div class="password-field auth-password-row">
          <div class="auth-input-row auth-input-row--grow">
            <span class="auth-input-prefix" aria-hidden="true">${IC.shield}</span>
            <input class="auth-input-control" type="password" name="passwordConfirm" minlength="10" autocomplete="new-password" autocapitalize="off" spellcheck="false" required />
          </div>
          <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="recover-complete-c">${IC.eye} Mostrar</button>
        </div>
        <small class="muted register-password-match-hint">Repita la contraseña exactamente igual.</small>
      </label>
      <div id="recover-password-strength-suite" class="password-strength-suite full">
        <div class="password-strength-bar-wrap">
          <div class="password-strength-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Progreso de requisitos de contraseña">
            <div class="password-strength-bar-fill password-strength-bar-fill--weak"></div>
          </div>
          <div class="password-strength-meta">
            <span class="password-strength-pill password-strength-pill--weak">0%</span>
            <p id="recover-password-strength-headline" class="password-strength-headline">Indique una contraseña segura</p>
          </div>
        </div>
        <ul class="password-rule-grid" role="list" aria-label="Requisitos de contraseña">
          <li data-rule="len"><span class="password-rule-dot" aria-hidden="true"></span><span>10+ caracteres</span></li>
          <li data-rule="lower"><span class="password-rule-dot" aria-hidden="true"></span><span>Minúscula (a-z)</span></li>
          <li data-rule="upper"><span class="password-rule-dot" aria-hidden="true"></span><span>Mayúscula (A-Z)</span></li>
          <li data-rule="digit"><span class="password-rule-dot" aria-hidden="true"></span><span>Número (0-9)</span></li>
          <li data-rule="special"><span class="password-rule-dot" aria-hidden="true"></span><span>Símbolo (!@#$…)</span></li>
        </ul>
        <p id="recover-password-hint" class="muted password-policy-hint">Mínimo 10 caracteres con mayúscula, minúscula, número y símbolo. Escriba la contraseña como prefiera: en pantalla se muestra tal cual (mayúsculas y minúsculas). En el servidor se almacena de forma segura (hash), no en texto plano.</p>
      </div>
      <button class="btn btn-primary full" type="submit">${IC.check} Guardar contraseña e iniciar sesión después</button>
    </form>`;
  }
  const tab = state.authTab;
  const deptOptions = departmentOptions();
  if (tab === "login") {
    const regOk = state.registrationSuccessBanner;
    const regBanner =
      regOk && typeof regOk.message === "string" && regOk.message.trim()
        ? `<div class="auth-register-success-banner" role="status">
        <button type="button" class="auth-register-success-dismiss" data-action="dismiss-reg-success" aria-label="Cerrar aviso">×</button>
        <p class="auth-register-success-title">${IC.check} Solicitud registrada</p>
        <p class="auth-register-success-body">${escapeHtml(regOk.message.trim())}</p>
        ${
          regOk.email
            ? `<p class="muted auth-register-success-email">Correo de contacto: <strong>${escapeHtml(String(regOk.email).trim())}</strong></p>`
            : ""
        }
        <p class="muted auth-register-success-hint">Un administrador revisará su solicitud antes de habilitar el ingreso al portal. <strong>Cuando su cuenta sea aprobada</strong> recibirá un correo con el enlace de activación para definir su contraseña e iniciar sesión. Si no lo ve en su bandeja, revise la carpeta de spam o filtros corporativos.</p>
      </div>`
        : "";
    return `
      <div class="auth-header-premium">
        <h3>Ingreso empresarial seguro</h3>
        <p class="muted">Acceda a su operación con trazabilidad, control de permisos y registro de actividad.</p>
      </div>
      ${regBanner}
      <div class="auth-login-shell">
        <form id="form-login" class="form-grid auth-form auth-pane">
          <label class="full auth-field-stack">
            <span class="auth-plain-label">${fieldLabel(IC.mail, "Correo corporativo")}</span>
            <div class="auth-input-row">
              <span class="auth-input-prefix" aria-hidden="true">${IC.mail}</span>
              <input class="auth-input-control" type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required data-antares-validate-blur="email" data-antares-restrict="email-local" />
            </div>
          </label>
          <label class="full auth-field-stack">
            <span class="auth-plain-label">${fieldLabel(IC.lock, "Contraseña")}</span>
            <div class="password-field auth-password-row">
              <div class="auth-input-row auth-input-row--grow">
                <span class="auth-input-prefix" aria-hidden="true">${IC.lock}</span>
                <input class="auth-input-control" type="password" name="password" autocomplete="current-password" required />
              </div>
              <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="login">${IC.eye} Mostrar</button>
            </div>
          </label>
          <label class="full auth-remember-row">
            <span class="auth-remember-check">
              <input type="checkbox" name="rememberCredentials" id="login-remember-credentials" value="1" />
              <span>Recordar usuario y contraseña en este equipo</span>
            </span>
            <small class="muted auth-remember-hint">Solo recomendable en su equipo personal. Evite esta opción en dispositivos compartidos o públicos.</small>
          </label>
          ${turnstileWidgetMarkup()}
          <button class="btn btn-primary full" type="submit" data-login-submit>
            <span class="auth-submit-content"><span class="auth-submit-icon">${IC.check}</span><span class="auth-submit-label">Ingresar al portal</span></span>
            <span class="auth-submit-spinner" aria-hidden="true"></span>
          </button>
        </form>
      </div>
    `;
  }

  if (tab === "register") {
    return `
      <div class="auth-header-premium">
        <h3>Registro al portal</h3>
        <p class="muted">Complete sus datos con cuidado e indique si es <strong>cliente externo</strong> o <strong>empleado interno</strong>. Un administrador revisará y aprobará su cuenta antes de que pueda ingresar. Tras enviar el formulario recibirá un correo con la confirmación.</p>
      </div>
      <form id="form-register" class="form-grid auth-form auth-register-form auth-pane">
        <div class="register-kind-field full">
          <span class="register-kind-label">${fieldLabel(IC.users, "Tipo de vínculo")}</span>
          <div class="register-kind-options" role="radiogroup" aria-label="Tipo de vínculo con Antares">
            <label class="register-kind-option">
              <input type="radio" name="registrationKind" value="cliente" required checked />
              <span>Cliente externo</span>
            </label>
            <label class="register-kind-option">
              <input type="radio" name="registrationKind" value="empleado_interno" required />
              <span>Empleado interno</span>
            </label>
          </div>
          <small class="muted register-kind-hint">Cliente: empresas u organizaciones que contratan el servicio. Empleado interno: personal de Transportes Antares.</small>
        </div>
        <label>${fieldLabel(IC.user, "Primer nombre")}<input name="firstName" required autocomplete="given-name" data-antares-restrict="person-name" data-antares-field="person-name" /></label>
        <label>${fieldLabel(IC.user, "Segundo nombre")}<input name="middleName" autocomplete="additional-name" data-antares-restrict="person-name" /></label>
        <label>${fieldLabel(IC.users, "Primer apellido")}<input name="lastName" required autocomplete="family-name" data-antares-restrict="person-name" data-antares-field="person-name" /></label>
        <label>${fieldLabel(IC.users, "Segundo apellido")}<input name="secondLastName" autocomplete="family-name" data-antares-restrict="person-name" /></label>
        <div class="register-doc-section full">
          <label class="register-field-person-type">${fieldLabel(IC.briefcase, "Tipo de persona")}
            <select name="personType" required>
              <option value="">Seleccione...</option>
              <option value="natural">Natural</option>
              <option value="juridica">Jurídica</option>
            </select>
          </label>
          <div id="register-doc-persona" class="register-doc-block register-doc-block--natural">
            <label>${fieldLabel(IC.file, "Tipo de documento")}
              <select name="documentType" required>
                <option value="CC">Cédula de ciudadanía</option>
                <option value="CE">Cédula de extranjería</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </label>
            <label>${fieldLabel(IC.badge, "Número de documento")}<input name="taxId" inputmode="numeric" autocomplete="off" aria-required="true" data-antares-restrict="alnum-doc" data-antares-field="doc" /></label>
          </div>
          <div id="register-doc-empresa" class="register-doc-block register-doc-block--empresa hidden" hidden>
            <label>${fieldLabel(IC.briefcase, "NIT de la empresa")}
              <input name="companyNit" inputmode="numeric" autocomplete="off" placeholder="Ej. 900123456-7" data-antares-restrict="alnum-doc" data-antares-field="nit" />
            </label>
            <label>${fieldLabel(IC.file, "Tipo de cédula (representante)")}
              <select name="personalDocumentType">
                <option value="CC">Cédula de ciudadanía</option>
                <option value="CE">Cédula de extranjería</option>
              </select>
            </label>
            <label>${fieldLabel(IC.badge, "Número de cédula")}
              <input name="personalTaxId" inputmode="numeric" autocomplete="off" placeholder="Debe ser única en el portal" data-antares-restrict="alnum-doc" data-antares-field="doc" data-antares-doc-type-selector="select[name='personalDocumentType']" />
            </label>
            <p class="muted register-doc-empresa-note">Varios usuarios pueden compartir el NIT de la empresa; la duplicidad se valida solo sobre el número de cédula del representante.</p>
          </div>
        </div>
        <label>${fieldLabel(IC.cake, "Fecha de nacimiento")}<input type="date" name="birthDate" required data-antares-validate-blur="date-iso" /></label>
        <label>${fieldLabel(IC.users, "Género")}
          <select name="gender" required>
            <option value="">Seleccione...</option>
            <option>Femenino</option>
            <option>Masculino</option>
            <option>No binario</option>
            <option>Prefiero no decirlo</option>
          </select>
        </label>
        <label>${fieldLabel(IC.award, "Cargo")}<input name="position" required /></label>
        <label>${fieldLabel(IC.grid, "Área")}<input name="workArea" required placeholder="Ej.: Operaciones" /></label>
        <label class="phone-field-register">
          ${fieldLabel(IC.phone, "Teléfono")}
          <div class="phone-input-professional" role="group" aria-label="Teléfono celular Colombia">
            <div class="phone-reg-flag-slot">
              <span class="js-register-lang-flag register-lang-flag register-lang-flag--co" aria-hidden="true" title="Colombia"></span>
            </div>
            <select class="js-register-phone-cc phone-cc-select" aria-label="Indicativo +57 (Colombia)" required>
              ${registerPhoneCountryOptionsHtml()}
            </select>
            <input
              type="tel"
              class="js-register-phone-national phone-national-input"
              inputmode="numeric"
              autocomplete="tel-national"
              placeholder="300 123 4567"
              maxlength="14"
              required
              aria-describedby="register-phone-hint"
            />
            <input type="hidden" name="phone" class="js-register-phone-full" value="" />
          </div>
          <small id="register-phone-hint" class="muted phone-field-hint">Celular Colombia: 10 dígitos (empieza por 3).</small>
        </label>
        <label>${fieldLabel(IC.mapPin, "Departamento")}
          <select name="department" id="register-department" required>
            <option value="">Seleccione...</option>
            ${deptOptions}
          </select>
        </label>
        <label>${fieldLabel(IC.building, "Ciudad")}
          <select name="city" id="register-city" required>
            <option value="">Seleccione un departamento...</option>
          </select>
        </label>
        <label class="full">${fieldLabel(IC.compass, "Dirección")}<input name="address" required placeholder="Dirección principal" autocomplete="street-address" /></label>
        <label class="full">${fieldLabel(IC.mail, "Correo electrónico")}<input type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required data-antares-validate-blur="email" data-antares-restrict="email-local" /></label>
        <label class="full">${fieldLabel(IC.lock, "Contraseña")}
          <div class="password-field">
            <input type="password" minlength="10" name="password" autocomplete="new-password" autocapitalize="off" spellcheck="false" required aria-describedby="password-strength password-hint" class="auth-password-input" />
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="register">${IC.eye} Mostrar</button>
          </div>
        </label>
        <label class="full">${fieldLabel(IC.shield, "Confirmar contraseña")}
          <input type="password" minlength="10" name="passwordConfirm" autocomplete="new-password" autocapitalize="off" spellcheck="false" required class="auth-password-input" />
          <small class="muted register-password-match-hint">Repita la contraseña exactamente igual.</small>
        </label>
        <div id="register-password-strength-suite" class="password-strength-suite full">
          <div class="password-strength-bar-wrap">
            <div class="password-strength-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Progreso de requisitos de contraseña">
              <div class="password-strength-bar-fill password-strength-bar-fill--weak"></div>
            </div>
            <div class="password-strength-meta">
              <span class="password-strength-pill password-strength-pill--weak">0%</span>
              <p id="password-strength" class="password-strength-headline">Indique una contraseña segura</p>
            </div>
          </div>
          <ul class="password-rule-grid" role="list" aria-label="Requisitos de contraseña">
            <li data-rule="len"><span class="password-rule-dot" aria-hidden="true"></span><span>10+ caracteres</span></li>
            <li data-rule="lower"><span class="password-rule-dot" aria-hidden="true"></span><span>Minúscula (a-z)</span></li>
            <li data-rule="upper"><span class="password-rule-dot" aria-hidden="true"></span><span>Mayúscula (A-Z)</span></li>
            <li data-rule="digit"><span class="password-rule-dot" aria-hidden="true"></span><span>Número (0-9)</span></li>
            <li data-rule="special"><span class="password-rule-dot" aria-hidden="true"></span><span>Símbolo (!@#$…)</span></li>
          </ul>
          <p id="password-hint" class="muted password-policy-hint">Mínimo 10 caracteres con mayúscula, minúscula, número y símbolo. Escriba la contraseña como prefiera: en pantalla se muestra tal cual (mayúsculas y minúsculas). En el servidor se almacena de forma segura (hash), no en texto plano.</p>
        </div>
        <label class="full register-terms-card">
          <span class="register-terms-title">${fieldLabel(IC.file, "Términos y condiciones")}</span>
          <span class="register-terms-copy muted">
            Al crear su cuenta acepta los
            <a class="register-terms-link" href="${REGISTER_TERMS_URL}" target="_blank" rel="noopener noreferrer">Términos de uso</a>,
            la
            <a class="register-terms-link" href="${REGISTER_PRIVACY_URL}" target="_blank" rel="noopener noreferrer">Política de privacidad</a>
            y el tratamiento de datos (Habeas Data), y confirma que la información registrada es veraz.
          </span>
          <span class="checkbox-inline register-terms-check">
            <input type="checkbox" name="acceptTerms" required />
            Acepto los términos y la política para continuar con la solicitud.
          </span>
        </label>
        <div class="full auth-inline-note">
          <small class="muted">${IC.shield} Su solicitud quedará pendiente hasta que un administrador apruebe y asocie una empresa.</small>
        </div>
        ${turnstileWidgetMarkup()}
        <button class="btn btn-primary full" type="submit">${IC.userPlus} Enviar solicitud de registro</button>
      </form>
    `;
  }

    return `
    <div class="auth-header-premium">
      <h3>Recuperación de acceso</h3>
      <p class="muted">Indique el <strong>correo corporativo asociado a su cuenta</strong>. Si el usuario está activo en el sistema, recibirá un mensaje con las instrucciones para restablecer su contraseña de forma segura.</p>
    </div>
    <form id="form-recover" class="form-grid auth-pane auth-form auth-form-recover">
      <label class="full auth-field-stack">
        <span class="auth-plain-label">${fieldLabel(IC.mail, "Correo registrado")}</span>
        <div class="auth-input-row">
          <span class="auth-input-prefix" aria-hidden="true">${IC.mail}</span>
          <input class="auth-input-control" type="email" name="email" autocomplete="username" placeholder="nombre@empresa.com" required data-antares-validate-blur="email" data-antares-restrict="email-local" />
        </div>
      </label>
      <div class="auth-recover-hint" role="note">
        <div class="auth-recover-hint-inner">
          <span class="auth-recover-hint-icon" aria-hidden="true">${IC.shield}</span>
          <div class="auth-recover-hint-body">
            <p class="auth-recover-hint-title">Enlace seguro y de vigencia limitada</p>
            <p class="auth-recover-hint-text">Recibirá un enlace personalizado y cifrado. Por estándares de seguridad, el enlace caduca transcurrido un plazo breve y solo puede utilizarse para completar el restablecimiento; si expira, podrá solicitar uno nuevo desde esta misma pantalla.</p>
            <p class="auth-recover-hint-text">Una vez actualizada la contraseña, podrá ingresar al portal con <strong>el mismo correo</strong> y sus nuevas credenciales. Si no ve el mensaje en unos minutos, revise la carpeta de spam o correo no deseado y confirme que el correo indicado coincide con el registrado. Para escalamiento técnico, diríjase al equipo de soporte de su organización.</p>
          </div>
        </div>
      </div>
      ${turnstileWidgetMarkup()}
      <div class="auth-recover-actions">
        <button class="btn btn-primary full auth-recover-submit" type="submit">${IC.send} Enviar enlace al correo</button>
      </div>
    </form>
  `;
}

function showAuth() {
  const modal = nodes.authModal || document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderAuthTab();
}

function hideAuth() {
  const modal = nodes.authModal || document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.add("hidden");
}

function renderAuthTab() {
  const tabsWrap = document.querySelector("#auth-modal .tabs");
  if (tabsWrap) tabsWrap.classList.toggle("hidden", Boolean(state.authSupabaseRecovery));
  const tabs = nodes.authTabs.length ? nodes.authTabs : [...document.querySelectorAll("#auth-modal .tab")];
  const content = nodes.authContent || document.getElementById("auth-content");
  tabs.forEach((tabBtn) => {
    tabBtn.classList.toggle("active", tabBtn.dataset.tab === state.authTab);
  });
  if (!content) return;
  content.innerHTML = authView();
  bindAuthForms();
  ensureTurnstileWidgets();
}

function bindAuthForms() {
  document.querySelector("[data-action='dismiss-reg-success']")?.addEventListener("click", () => {
    state.registrationSuccessBanner = null;
    renderAuthTab();
  });
  const login = document.getElementById("form-login");
  const register = document.getElementById("form-register");
  const recover = document.getElementById("form-recover");
  const togglePassword = document.querySelectorAll("[data-action='toggle-password']");
  togglePassword.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetForm = String(btn.dataset.target || "");
      let input = null;
      if (targetForm === "register") input = register?.querySelector("input[name='password']");
      else if (targetForm === "admin-create") input = document.querySelector("#form-admin-user-create input[name='password']");
      else if (targetForm === "admin-edit") input = document.querySelector("#form-admin-user-edit input[name='password']");
      else if (targetForm === "recover-complete")
        input = document.querySelector("#form-recover-complete input[name='password']");
      else if (targetForm === "recover-complete-c")
        input = document.querySelector("#form-recover-complete input[name='passwordConfirm']");
      else input = login?.querySelector("input[name='password']");
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      const eye = typeof IC !== "undefined" && IC.eye ? `${IC.eye} ` : "";
      btn.innerHTML = `${eye}${visible ? "Mostrar" : "Ocultar"}`;
    });
  });

  if (login) {
    const remembered = readRememberedLoginCredentials();
    if (remembered) {
      const em = login.querySelector("input[name='email']");
      const pw = login.querySelector("input[name='password']");
      const cb = login.querySelector("#login-remember-credentials");
      if (em) em.value = remembered.email;
      if (pw) pw.value = remembered.password;
      if (cb) cb.checked = true;
    }
    const loginSubmitBtn = login.querySelector("[data-login-submit]");
    wireFormSubmitGuard(
      login,
      async (event) => {
      if (Date.now() < state.authSecurity.lockUntil) {
        const secs = Math.ceil((state.authSecurity.lockUntil - Date.now()) / 1000);
        notify(userMessage("authLoginLock", secs), "error");
        return;
      }
      const data = readFormEntriesNormalized(login);
      const passwordRaw = String(data.password || "");
      const V = window.AntaresValidation;
      if (V && typeof V.validateAuthLogin === "function") {
        const loginVal = V.validateAuthLogin(data);
        if (!loginVal.ok) {
          const field = login.querySelector(loginVal.fieldSelector || "input[name='email']");
          if (field) setFieldError(field, loginVal.hint || loginVal.message);
          notify(loginVal.message, "error");
          return;
        }
        data.email = loginVal.sanitized.email;
      }

        /**
         * Si hay URL de API, la autenticacion es SOLO contra el servidor (PostgreSQL).
         * No se usa fallback local respecto a credenciales guardadas solo en el navegador.
         */
        if (window.AntaresApi?.getBase?.()) {
          try {
            const base = String(window.AntaresApi.getBase()).replace(/\/+$/, "");
            const turnstileToken = await waitForTurnstileToken(login);
            const res = await fetch(`${base}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({ email: data.email, password: passwordRaw, turnstileToken })
            });
            const body = await res.json().catch(() => null);
            if (res.ok && body?.accessToken) {
              const refreshTok = String(body.refreshToken || "").trim();
              window.AntaresApi.setAccessToken(body.accessToken);
              const payload = decodeJwtPayload(body.accessToken);
              const uid = payload?.sub;
              let usersAfter = read(KEYS.users, []);
              let userApi = usersAfter.find((u) => String(u.id) === String(uid));
              if (!userApi) {
                try {
                  const me = await window.AntaresApi.getJson("/portal/me");
                  if (me?.id) {
                    upsertPortalUserRowIntoCache(me);
                    usersAfter = read(KEYS.users, []);
                    userApi = usersAfter.find((u) => String(u.id) === String(uid));
                  }
                } catch (_meErr) {
                  /* el stub del JWT rellena el minimo hasta que llegue bootstrap en segundo plano */
                }
              }
              if (!userApi) {
                userApi = upsertPortalUserStubFromJwtPayload(payload);
              }
              if (!userApi) {
                notify(userMessage("authProfileLoadFailed"), "error");
                return;
              }
              /** La API solo devuelve tokens si estado_cuenta es aprobado; no bloquear por caché local desactualizado. */
              state.authSecurity.failedAttempts = 0;
              state.authSecurity.lockUntil = 0;
              state.registrationSuccessBanner = null;
              setSession({
                userId: userApi.id,
                role: userApi.role,
                token: buildToken(userApi),
                accessToken: body.accessToken,
                refreshToken: refreshTok,
                lastActivityAt: Date.now(),
                tokenIssuedAt: Date.now(),
                profileSnapshot: buildProfileSnapshotFromUserRow(userApi)
              });
              if (data.rememberCredentials) writeRememberedLoginCredentials(data.email, passwordRaw);
              else clearRememberedLoginCredentials();
              hideAuth();
              startSessionSecurityWatch();
              renderPortal();
              void startPortalBootstrapForInteractiveSession();
              return;
            }
            const apiMsg = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
            notify(String(apiMsg || userMessage("authInvalidServer")), "error");
            state.authSecurity.failedAttempts += 1;
            if (state.authSecurity.failedAttempts >= 5) {
              state.authSecurity.lockUntil = Date.now() + 60_000;
              state.authSecurity.failedAttempts = 0;
            }
            return;
          } catch (_e) {
            notify(userMessage("authNoConnection"), "error");
            return;
          }
        }

        const users = read(KEYS.users, []);
        const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(data.email));
        const valid = user ? await verifyPassword(passwordRaw, user.password) : false;
        if (!valid || !user) {
          state.authSecurity.failedAttempts += 1;
          if (state.authSecurity.failedAttempts >= 5) {
            state.authSecurity.lockUntil = Date.now() + 60_000;
            state.authSecurity.failedAttempts = 0;
          }
          notify(userMessage("authInvalidLocal"), "error");
          return;
        }
        state.authSecurity.failedAttempts = 0;
        state.authSecurity.lockUntil = 0;
        if (isPortalUserPendingApproval(user)) {
          notify(userMessage("authPendingApproval"), "info");
          return;
        }
        if (user.accountStatus === ACCOUNT_STATUS.RECHAZADO) {
          notify(userMessage("authRejected"), "error");
          return;
        }
        setSession({
          userId: user.id,
          role: user.role,
          token: buildToken(user),
          lastActivityAt: Date.now(),
          tokenIssuedAt: Date.now(),
          profileSnapshot: buildProfileSnapshotFromUserRow(user)
        });
        void tryApiLoginBridge(user, passwordRaw);
        if (data.rememberCredentials) writeRememberedLoginCredentials(data.email, passwordRaw);
        else clearRememberedLoginCredentials();
        hideAuth();
        startSessionSecurityWatch();
        renderPortal();
      },
      {
        submitButton: loginSubmitBtn,
        busyText: "Ingresando…",
        loadingClass: "is-loading",
        onFinally: () => {
          if (!state.session) resetTurnstile(login);
        }
      }
    );
  }

  if (register) {
    attachDepartmentCitySelects(register, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    const personTypeSel = register.querySelector("select[name='personType']");
    const docTypeSel = register.querySelector("#register-doc-persona select[name='documentType']");
    const blockPersona = register.querySelector("#register-doc-persona");
    const blockEmpresa = register.querySelector("#register-doc-empresa");
    const inputTaxPersona = register.querySelector("input[name='taxId']");
    const inputCompanyNit = register.querySelector("input[name='companyNit']");
    const inputPersonalTax = register.querySelector("input[name='personalTaxId']");
    const syncRegisterDocLayout = () => {
      const isJuridica = isPersonTypeJuridica(personTypeSel?.value);
      if (blockPersona) {
        blockPersona.classList.toggle("hidden", isJuridica);
        blockPersona.toggleAttribute("hidden", isJuridica);
      }
      if (blockEmpresa) {
        blockEmpresa.classList.toggle("hidden", !isJuridica);
        blockEmpresa.toggleAttribute("hidden", !isJuridica);
      }
      if (docTypeSel) {
        if (isJuridica) {
          docTypeSel.removeAttribute("required");
        } else {
          docTypeSel.setAttribute("required", "required");
        }
      }
      if (inputTaxPersona) {
        if (isJuridica) {
          inputTaxPersona.removeAttribute("required");
          inputTaxPersona.value = "";
        } else {
          inputTaxPersona.setAttribute("required", "required");
        }
      }
      if (inputCompanyNit) {
        if (isJuridica) inputCompanyNit.setAttribute("required", "required");
        else {
          inputCompanyNit.removeAttribute("required");
          inputCompanyNit.value = "";
        }
      }
      if (inputPersonalTax) {
        if (isJuridica) inputPersonalTax.setAttribute("required", "required");
        else {
          inputPersonalTax.removeAttribute("required");
          inputPersonalTax.value = "";
        }
      }
    };
    personTypeSel?.addEventListener("change", syncRegisterDocLayout);
    syncRegisterDocLayout();

    const registerPhoneNat = register.querySelector(".js-register-phone-national");
    const registerPhoneCc = register.querySelector(".js-register-phone-cc");
    if (registerPhoneNat) {
      registerPhoneNat.addEventListener("input", () => syncPhoneHiddenFull(register, "register"));
    }
    if (registerPhoneCc) {
      registerPhoneCc.addEventListener("change", () => {
        clearFieldError(registerPhoneNat);
        updatePhoneFieldForCountry(register, "register");
        syncPhoneHiddenFull(register, "register");
      });
    }
    updatePhoneFieldForCountry(register, "register");
    syncPhoneHiddenFull(register, "register");
    const regPass = register.querySelector("input[name='password']");
    const regPassConfirm = register.querySelector("input[name='passwordConfirm']");
    const syncRegisterPasswordMatchState = () => {
      if (!regPass || !regPassConfirm) return;
      regPass.classList.remove("password-match-ok", "password-match-bad");
      regPassConfirm.classList.remove("password-match-ok", "password-match-bad");
      const p1 = String(regPass.value || "");
      const p2 = String(regPassConfirm.value || "");
      if (!p1 && !p2) return;
      const same = p1.length > 0 && p1 === p2;
      regPass.classList.add(same ? "password-match-ok" : "password-match-bad");
      regPassConfirm.classList.add(same ? "password-match-ok" : "password-match-bad");
    };
    regPass?.addEventListener("input", syncRegisterPasswordMatchState);
    regPassConfirm?.addEventListener("input", syncRegisterPasswordMatchState);
    bindPasswordStrengthSuite(regPass, register.querySelector("#register-password-strength-suite"));
    wireFormSubmitGuard(
      register,
      async (event) => {
      syncPhoneHiddenFull(register, "register");
      const data = readFormEntriesNormalized(register);
      const Vreg = window.AntaresValidation;
      if (Vreg && typeof Vreg.validateDomForm === "function") {
        const domVal = Vreg.validateDomForm(register);
        if (!domVal.ok) {
          domVal.firstInvalid?.focus?.();
          notify(userMessage("validationStep"), "error");
          return;
        }
      }
      const fullName = [
        normalizeLatinUpperForDb(data.firstName),
        normalizeLatinUpperForDb(data.middleName),
        normalizeLatinUpperForDb(data.lastName),
        normalizeLatinUpperForDb(data.secondLastName)
      ]
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .join(" ");
      if (!fullName) {
        notify(userMessage("registerNamesInvalid"), "error");
        return;
      }
      data.personType = normalizePersonTypeForDb(data.personType);
      const isJuridica = data.personType === "Juridica";
      const docTypeUpper = String(data.documentType || "").toUpperCase();
      let personalDocStored = "";
      if (isJuridica) {
        const personalDocType = String(data.personalDocumentType || "CC").toUpperCase() === "CE" ? "CE" : "CC";
        const nitVal = validateColombianDocument("NIT", data.companyNit || "");
        const personalVal = validateColombianDocument(personalDocType, data.personalTaxId || "");
        if (!nitVal.ok) {
          notify(nitVal.message, "error");
          return;
        }
        if (!personalVal.ok) {
          notify(personalVal.message, "error");
          return;
        }
        data.companyNit = nitVal.normalized;
        data.personalTaxId = personalVal.normalized;
        data.taxId = nitVal.normalized;
        data.documentType = "NIT";
        personalDocStored = String(personalVal.normalized || "")
          .replace(/[.\s]/g, "")
          .replace(/\D/g, "");
      } else {
        const docValidation = validateColombianDocument(data.documentType, data.taxId);
        if (!docValidation.ok) {
          notify(docValidation.message, "error");
          return;
        }
        data.taxId = docValidation.normalized;
        data.companyNit = "";
        data.personalTaxId = "";
        if (docTypeUpper === "PAS") {
          personalDocStored = String(docValidation.normalized || "").trim().toUpperCase();
        } else {
          personalDocStored = String(docValidation.normalized || "")
            .replace(/[.\s]/g, "")
            .replace(/\D/g, "");
        }
      }
      if (String(data.password || "") !== String(data.passwordConfirm || "")) {
        notify(userMessage("registerPasswordMismatch"), "error");
        return;
      }
      const policy = validatePasswordPolicy(data.password);
      if (!policy.ok) {
        notify(userMessage(policy.key), "error");
        return;
      }
      if (!data.acceptTerms) {
        notify(userMessage("registerTerms"), "error");
        return;
      }
      const birthDateValue = new Date(String(data.birthDate || ""));
      if (!Number.isFinite(birthDateValue.getTime())) {
        notify(userMessage("registerBirthInvalid"), "error");
        return;
      }
      const ageYears = Math.floor((Date.now() - birthDateValue.getTime()) / 31557600000);
      if (ageYears < 18) {
        notify(userMessage("registerMinor"), "error");
        return;
      }
      const meta = getSelectedPhoneCountry(register, "register");
      const phoneDigitsAll = String(data.phone || "").replace(/\D/g, "");
      if (!phoneDigitsAll.startsWith(meta.dial)) {
        notify("El teléfono no coincide con el país seleccionado.", "error");
        return;
      }
      const nationalLen = phoneDigitsAll.length - meta.dial.length;
      if (nationalLen < meta.minNat || nationalLen > meta.maxNat) {
        notify(
          meta.style === "co"
            ? "Ingrese un celular colombiano válido (10 dígitos después de +57)."
            : `Ingrese entre ${meta.minNat} y ${meta.maxNat} dígitos del número local para ${meta.label}.`,
          "error"
        );
        return;
      }
      if (meta.style === "co") {
        const nat = phoneDigitsAll.slice(meta.dial.length);
        if (!nat.startsWith("3")) {
          notify("El celular en Colombia debe ser móvil (empieza por 3).", "error");
          return;
        }
      }

      if (window.AntaresApi?.getBase?.() && typeof window.AntaresApi.postJsonPublic === "function") {
        try {
          const turnstileToken = await waitForTurnstileToken(register);
          const body = await window.AntaresApi.postJsonPublic("/auth/register-portal", {
            firstName: normalizeLatinUpperForDb(data.firstName),
            middleName: normalizeLatinUpperForDb(data.middleName || ""),
            lastName: normalizeLatinUpperForDb(data.lastName),
            secondLastName: normalizeLatinUpperForDb(data.secondLastName || ""),
            personType: data.personType,
            documentType: normalizeLatinUpperForDb(data.documentType),
            taxId: data.taxId,
            companyNit: data.companyNit || "",
            personalTaxId: data.personalTaxId || "",
            personalDocumentType: isJuridica
              ? String(data.personalDocumentType || "CC").trim().toUpperCase()
              : undefined,
            birthDate: data.birthDate,
            gender: normalizeLatinUpperForDb(data.gender),
            position: normalizeLatinUpperForDb(data.position),
            workArea: normalizeLatinUpperForDb(data.workArea),
            phone: normalizeLatinUpperForDb(data.phone),
            department: normalizeLatinForDb(data.department),
            city: normalizeLatinForDb(data.city),
            address: normalizeLatinUpperForDb(data.address),
            email: data.email,
            registrationKind: normalizeRegistrationKindForDb(data.registrationKind),
            password: data.password,
            acceptTerms: Boolean(data.acceptTerms),
            turnstileToken
          });
          const serverMsg =
            typeof body === "object" && body !== null && typeof body.message === "string"
              ? body.message.trim()
              : "";
          const successMsg = serverMsg || userMessage("registerSuccess");
          state.registrationSuccessBanner = {
            message: successMsg,
            email: String(data.email || "").trim(),
            pendingApproval: !(typeof body === "object" && body !== null && body.pendingApproval === false)
          };
          notify(userMessage("registerToastSuccess"), "success", 12000);
          state.authTab = "login";
          renderAuthTab();
          return;
        } catch (err) {
          const rawMsg = String(err?.message || "");
          const msg = /failed to fetch/i.test(rawMsg)
            ? "No fue posible conectar con la API. Verifica CORS_ORIGINS en Render y que la API este activa."
            : rawMsg || userMessage("genericError");
          notify(msg, "error");
          resetTurnstile(register);
          return;
        }
      }

      const users = read(KEYS.users, []);
      if (users.some((u) => normalizeEmail(u.email) === normalizeEmail(data.email))) {
        notify(userMessage("registerEmailExists"), "error");
        return;
      }
      if (personalDocStored && users.some((u) => getPersonalRegistrationKey(u) === personalDocStored)) {
        notify(userMessage("registerPersonalDocExists"), "error");
        return;
      }
      const { passwordConfirm, acceptTerms, companyNit, personalTaxId, personalDocumentType, ...profileData } =
        data;
      const newUser = {
        id: newUuidV4(),
        ...profileData,
        firstName: normalizeLatinUpperForDb(data.firstName),
        middleName: normalizeLatinUpperForDb(data.middleName || ""),
        lastName: normalizeLatinUpperForDb(data.lastName),
        secondLastName: normalizeLatinUpperForDb(data.secondLastName || ""),
        personType: data.personType,
        documentType: normalizeLatinUpperForDb(data.documentType),
        companyNit: isJuridica ? normalizeLatinUpperForDb(data.companyNit || "") : "",
        personalTaxId: isJuridica ? normalizeLatinUpperForDb(data.personalTaxId || "") : "",
        personalDoc: String(personalDocStored || ""),
        gender: normalizeLatinUpperForDb(data.gender),
        position: normalizeLatinUpperForDb(data.position),
        workArea: normalizeLatinUpperForDb(data.workArea),
        phone: normalizeLatinUpperForDb(data.phone),
        department: normalizeLatinForDb(data.department),
        city: normalizeLatinForDb(data.city),
        address: normalizeLatinUpperForDb(data.address),
        registrationKind: normalizeRegistrationKindForDb(data.registrationKind),
        name: fullName,
        email: normalizeEmail(data.email),
        password: await hashPassword(data.password),
        role: ROLES.CLIENT,
        accountStatus: ACCOUNT_STATUS.PENDIENTE,
        companyId: null,
        company: "",
        permissions: defaultPermissionsForRole(ROLES.CLIENT),
        profileQualityChecklist: {
          idVerified: true,
          acceptedTermsAt: nowIso(),
          requiredFieldsCompleted: true,
          termsOfUseAccepted: true,
          privacyPolicyAccepted: true,
          habeasDataAcknowledged: true,
          registrationKind: normalizeRegistrationKindForDb(data.registrationKind),
          ...(isJuridica
            ? {
                representativeDocumentType: String(data.personalDocumentType || "CC")
                  .trim()
                  .toUpperCase()
              }
            : {})
        },
        registeredAt: nowIso()
      };
      users.push(newUser);
      write(KEYS.users, users);
      sendEmail({
        to: data.email,
        subject: "Registro recibido - Antares Portal",
        body: "Tu solicitud de registro fue recibida. Un administrador revisara tu cuenta y te notificaremos cuando sea aprobada."
      });
      notifyAdminUsers(
        "Nuevo registro de cliente pendiente",
        `${fullName} solicita acceso al portal. Falta asociar empresa en aprobacion.`
      );
      read(KEYS.users, [])
        .filter((u) => u.role === ROLES.ADMIN)
        .forEach((admin) => {
          sendEmail({
            to: admin.email,
            subject: "Nuevo registro de cliente pendiente de aprobacion",
            body: `Cliente: ${fullName} | Documento: ${data.documentType || "-"} ${data.taxId || "-"} | Correo: ${data.email}`
          });
        });
      const offlineMsg = userMessage("registerSuccess");
      state.registrationSuccessBanner = {
        message: offlineMsg,
        email: String(data.email || "").trim(),
        pendingApproval: true
      };
      notify(userMessage("registerOfflineToast"), "success", 12000);
      state.authTab = "login";
      renderAuthTab();
      },
      { busyText: "Registrando…" }
    );
  }

  if (recover) {
    wireFormSubmitGuard(recover, async (event) => {
      const data = readFormEntriesNormalized(recover);
      const V = window.AntaresValidation;
      if (V && typeof V.validateDomForm === "function") {
        const domVal = V.validateDomForm(recover);
        if (!domVal.ok) {
          domVal.firstInvalid?.focus?.();
          notify(userMessage("validationStep"), "error");
          return;
        }
      }
      const email = normalizeEmail(String(data.email || ""));
      if (!email) {
        notify(userMessage("validationStep"), "error");
        return;
      }

      const api = window.AntaresApi;
      const apiBase = typeof api?.getBase === "function" ? api.getBase() : "";
      if (apiBase && typeof api?.postJsonPublic === "function") {
        try {
          const redirectTo = buildSupabasePasswordRecoveryRedirectUrl();
          const turnstileToken = await waitForTurnstileToken(recover);
          const body = await api.postJsonPublic("/auth/password-recovery/request", {
            email,
            redirectTo,
            turnstileToken
          });
          notify(String(body?.message || userMessage("recoverSentSupabase")), "info");
        } catch (err) {
          notify(String(err?.message || userMessage("recoverSupabaseError")), "error");
          resetTurnstile(recover);
        }
        return;
      }

      const supabase = await waitForAntaresSupabaseClient(15000);
      if (supabase) {
        try {
          const redirectTo = buildSupabasePasswordRecoveryRedirectUrl();
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
          if (error) {
            notify(String(error.message || userMessage("recoverSupabaseError")), "error");
            return;
          }
          notify(userMessage("recoverSentSupabase"), "info");
        } catch (err) {
          notify(String(err?.message || userMessage("recoverSupabaseError")), "error");
        }
        return;
      }

      const users = read(KEYS.users, []);
      const user = users.find((u) => normalizeEmail(u.email) === email);
      if (!user) {
        notify(userMessage("recoverNoUser"), "error");
        return;
      }
      sendEmail({
        to: user.email,
        subject: "Recuperacion de contrasena",
        body: `Hola ${user.name}, se solicito recuperacion de acceso. Por seguridad, solicita a un administrador restablecer tu contrasena.`
      });
      notify(userMessage("recoverSent"), "info");
    });
  }

  const recoverComplete = document.getElementById("form-recover-complete");
  if (recoverComplete) {
    const recoverPass = recoverComplete.querySelector("input[name='password']");
    const recoverPassConfirm = recoverComplete.querySelector("input[name='passwordConfirm']");
    bindPasswordStrengthSuite(recoverPass, recoverComplete.querySelector("#recover-password-strength-suite"));
    const syncRecoverPasswordMatchState = () => {
      if (!recoverPass || !recoverPassConfirm) return;
      recoverPass.classList.remove("password-match-ok", "password-match-bad");
      recoverPassConfirm.classList.remove("password-match-ok", "password-match-bad");
      const p1 = String(recoverPass.value || "");
      const p2 = String(recoverPassConfirm.value || "");
      if (!p1 && !p2) return;
      const same = p1.length > 0 && p1 === p2;
      recoverPass.classList.add(same ? "password-match-ok" : "password-match-bad");
      recoverPassConfirm.classList.add(same ? "password-match-ok" : "password-match-bad");
    };
    recoverPass?.addEventListener("input", syncRecoverPasswordMatchState);
    recoverPassConfirm?.addEventListener("input", syncRecoverPasswordMatchState);

    wireFormSubmitGuard(recoverComplete, async (event) => {
      const apiBase = window.AntaresApi?.getBase?.();
      if (!apiBase) {
        notify(userMessage("recoverCompleteNeedsApi"), "error");
        return;
      }
      const fd = new FormData(recoverComplete);
      const p1 = String(fd.get("password") || "");
      const p2 = String(fd.get("passwordConfirm") || "");
      if (p1 !== p2) {
        notify(userMessage("registerPasswordMismatch"), "error");
        return;
      }
      const policy = validatePasswordPolicy(p1);
      if (!policy.ok) {
        notify(userMessage(policy.key), "error");
        return;
      }
      const supabase = window.antaresSupabase || (await waitForAntaresSupabaseClient(5000));
      if (!supabase) {
        notify(userMessage("recoverSupabaseUnavailable"), "error");
        return;
      }
      const { data: sessWrap } = await supabase.auth.getSession();
      const token = sessWrap?.session?.access_token;
      if (!token) {
        notify(userMessage("recoverSessionMissing"), "error");
        return;
      }
      try {
        const base = String(apiBase).replace(/\/+$/, "");
        const res = await fetch(`${base}/api/auth/password-recovery/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ password: p1 })
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
          notify(String(msg || userMessage("recoverCompleteError")), "error");
          return;
        }
        await supabase.auth.signOut();
        try {
          sessionStorage.removeItem("antares_pw_recovery_pending");
        } catch (_e0) {}
        state.authSupabaseRecovery = false;
        state.authTab = "login";
        const okMsg = String(body?.message || userMessage("recoverCompleteSuccess"));
        notify(okMsg, "success", 9000);
        hideAuth();
        if (!getSession()) {
          try {
            history.replaceState(null, "", window.location.pathname + window.location.search);
          } catch (_u) {}
          window.scrollTo(0, 0);
        }
        renderPortal();
      } catch (_e) {
        notify(userMessage("authNoConnection"), "error");
      }
    });
  }

  window.AntaresValidation?.prepareFormsInRoot?.(document.getElementById("auth-content"));
}

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Valor monetario desde input con formato es-CO ($ y separadores de miles). */
function parseMoneyFieldValue(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return 0;
  const digits = s.replace(/[^\d]/g, "");
  if (digits) return parseInt(digits, 10) || 0;
  return parseNum(s);
}

function formatMoneyFieldValue(amount) {
  const n = Math.max(0, Math.floor(parseNum(amount)));
  if (n <= 0) return "0";
  return n.toLocaleString("es-CO");
}

/** Normaliza fila de combustible (bootstrap API ↔ portal). */
function normalizeFuelLogPortalRow(log) {
  if (!log || typeof log !== "object") return log;
  const plate = String(log.vehiclePlate || log.plate || log.placa_vehiculo || "").trim().toUpperCase();
  const dateRaw = log.date || log.fecha;
  const date =
    typeof dateRaw === "string" && dateRaw.length >= 10
      ? dateRaw.slice(0, 10)
      : dateRaw
        ? String(new Date(dateRaw).toISOString()).slice(0, 10)
        : "";
  const liters = parseNum(log.liters ?? log.litros);
  const totalCost = parseNum(log.totalCost ?? log.costo_total ?? log.total_cost);
  return {
    ...log,
    id: log.id,
    date,
    vehicleId: log.vehicleId || log.id_vehiculo || log.vehicle_id,
    plate,
    vehiclePlate: plate,
    driverId: log.driverId || log.id_conductor,
    driverName: normalizeLatinUpperForDb(log.driverName || log.nombre_conductor || ""),
    tripNumber: String(log.tripNumber || log.numero_viaje || "").trim(),
    liters,
    totalCost,
    costPerLiter:
      log.costPerLiter != null
        ? parseNum(log.costPerLiter)
        : log.costo_por_litro != null
          ? parseNum(log.costo_por_litro)
          : liters > 0
            ? Math.round(totalCost / liters)
            : 0,
    odometerKm:
      log.odometerKm != null
        ? parseNum(log.odometerKm)
        : log.kilometraje_odometro != null
          ? parseNum(log.kilometraje_odometro)
          : null,
    station: normalizeLatinUpperForDb(log.station || log.estacion || ""),
    paidBy: String(log.paidBy || log.pagado_por || "empresa").toLowerCase() === "conductor" ? "conductor" : "empresa",
    createdAt: log.createdAt || log.fecha_registro || nowIso()
  };
}

/** Payload alineado con registros_combustible (sync-key / PostgreSQL). */
function fuelLogRowForServer(log) {
  const n = normalizeFuelLogPortalRow(log);
  const liters = parseNum(n.liters);
  const totalCost = parseNum(n.totalCost);
  return {
    id: n.id,
    date: n.date || nowIso().slice(0, 10),
    vehicleId: n.vehicleId,
    plate: n.plate || n.vehiclePlate,
    driverId: n.driverId,
    driverName: n.driverName,
    tripNumber: n.tripNumber || null,
    liters,
    totalCost,
    costPerLiter: liters > 0 ? Math.round(totalCost / liters) : parseNum(n.costPerLiter) || null,
    odometerKm: parseNum(n.odometerKm) > 0 ? parseNum(n.odometerKm) : null,
    station: n.station || null,
    paidBy: n.paidBy || "empresa",
    createdAt: n.createdAt
  };
}

function normalizeFuelLogsList(list) {
  return (Array.isArray(list) ? list : []).map(normalizeFuelLogPortalRow);
}

/** Normaliza fila de taller (bootstrap API ↔ portal). */
function normalizeVehicleTechnicalLogPortalRow(log) {
  if (!log || typeof log !== "object") return log;
  const plate = String(log.vehiclePlate || log.plate || log.placa_vehiculo || "").trim().toUpperCase();
  const typeKey = String(log.interventionType || log.type || log.tipo_intervencion || "preventivo").toLowerCase();
  const status = String(log.followUpStatus || log.status || log.estado_seguimiento || "Pendiente").trim();
  const dateRaw = log.date || log.fecha;
  const date =
    typeof dateRaw === "string" && dateRaw.length >= 10
      ? dateRaw.slice(0, 10)
      : dateRaw
        ? String(new Date(dateRaw).toISOString()).slice(0, 10)
        : "";
  return {
    ...log,
    id: log.id,
    date,
    vehicleId: log.vehicleId || log.id_vehiculo,
    plate,
    vehiclePlate: plate,
    interventionType: typeKey,
    type: typeKey,
    description: normalizeLatinUpperForDb(log.description || log.descripcion || ""),
    cost: parseNum(log.cost ?? log.costo),
    downtimeHours: parseNum(log.downtimeHours ?? log.horas_inactividad ?? log.hoursOut),
    followUpStatus: status,
    status,
    createdAt: log.createdAt || log.fecha_registro || nowIso()
  };
}

function vehicleTechnicalLogRowForServer(log) {
  const n = normalizeVehicleTechnicalLogPortalRow(log);
  return {
    id: n.id,
    date: n.date || nowIso().slice(0, 10),
    vehicleId: n.vehicleId,
    plate: n.plate || n.vehiclePlate,
    interventionType: n.interventionType || n.type || "preventivo",
    description: n.description || "",
    cost: parseNum(n.cost),
    downtimeHours: parseNum(n.downtimeHours),
    followUpStatus: n.followUpStatus || n.status || "Pendiente",
    createdAt: n.createdAt
  };
}

function normalizeVehicleTechnicalLogsList(list) {
  return (Array.isArray(list) ? list : []).map(normalizeVehicleTechnicalLogPortalRow);
}

function readFuelLogs() {
  return normalizeFuelLogsList(read(KEYS.fuelLogs, []));
}

function readVehicleTechnicalLogs() {
  return normalizeVehicleTechnicalLogsList(read(KEYS.vehicleTechnicalLogs, []));
}

async function writeFuelLogsAwait(list) {
  const normalized = normalizeFuelLogsList(list);
  write(KEYS.fuelLogs, normalized);
  const sync = window.AntaresPortalSync;
  const api = window.AntaresApi;
  if (sync?.flushEntityNow && api?.getBase?.() && String(api.getAccessToken?.() || "").trim()) {
    await sync.flushEntityNow("fuelLogs", normalized.map(fuelLogRowForServer));
    return;
  }
  await writeAwaitServer(KEYS.fuelLogs, normalized.map(fuelLogRowForServer));
}

async function writeVehicleTechnicalLogsAwait(list) {
  const normalized = normalizeVehicleTechnicalLogsList(list);
  write(KEYS.vehicleTechnicalLogs, normalized);
  const sync = window.AntaresPortalSync;
  const api = window.AntaresApi;
  if (sync?.flushEntityNow && api?.getBase?.() && String(api.getAccessToken?.() || "").trim()) {
    await sync.flushEntityNow("vehicleTechnicalLogs", normalized.map(vehicleTechnicalLogRowForServer));
    return;
  }
  await writeAwaitServer(KEYS.vehicleTechnicalLogs, normalized.map(vehicleTechnicalLogRowForServer));
}

/** Alta de combustible: INSERT en registros_combustible y actualiza caché del portal. */
async function appendFuelLogAwait(row) {
  const draft = normalizeFuelLogPortalRow(row);
  const api = window.AntaresApi;
  if (api?.isConfigured?.() && String(api.getAccessToken?.() || "").trim() && typeof api.postJson === "function") {
    const saved = await api.postJson("/portal/fleet/fuel-logs", fuelLogRowForServer(draft));
    const merged = normalizeFuelLogPortalRow(saved);
    const list = readFuelLogs().filter((l) => String(l.id) !== String(merged.id));
    list.unshift(merged);
    write(KEYS.fuelLogs, list);
    return merged;
  }
  const list = readFuelLogs();
  list.unshift(draft);
  await writeFuelLogsAwait(list);
  return draft;
}

/** Alta de taller: INSERT en registros_mantenimiento_vehiculo y actualiza caché del portal. */
async function appendVehicleTechnicalLogAwait(row) {
  const draft = normalizeVehicleTechnicalLogPortalRow(row);
  const api = window.AntaresApi;
  if (api?.isConfigured?.() && String(api.getAccessToken?.() || "").trim() && typeof api.postJson === "function") {
    const saved = await api.postJson("/portal/fleet/maintenance-logs", vehicleTechnicalLogRowForServer(draft));
    const merged = normalizeVehicleTechnicalLogPortalRow(saved);
    const list = readVehicleTechnicalLogs().filter((l) => String(l.id) !== String(merged.id));
    list.unshift(merged);
    write(KEYS.vehicleTechnicalLogs, list);
    return merged;
  }
  const list = readVehicleTechnicalLogs();
  list.unshift(draft);
  await writeVehicleTechnicalLogsAwait(list);
  return draft;
}

function diffMinutes(fromIso) {
  return (Date.now() - new Date(fromIso).getTime()) / 60000;
}

function isManuallyUnavailable(resource) {
  return Boolean(resource && resource.available === false && resource.autoBusy !== true);
}

function openTripInvoicePdf(requestId) {
  const request = reqRead().find((r) => r.id === requestId);
  if (!request?.trip) {
    notify(userMessage("invoiceNoTrip"), "error");
    return;
  }
  const invoice = request.trip.invoice || buildTripInvoice(request);
  const requests = reqRead();
  void (async () => {
    try {
      await reqWriteAwait(
        requests.map((r) =>
          r.id === requestId ? { ...r, trip: { ...r.trip, invoice, updatedAt: nowIso() }, updatedAt: nowIso() } : r
        )
      );
    } catch (_e) {}
  })();

  const html = `<!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Factura ${invoice.number}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#0f172a;margin:0;padding:24px;background:#f8fafc}
      .sheet{max-width:900px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:26px}
      .head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:18px}
      h1{font-size:24px;margin:0;color:#0b3f8a}
      .muted{color:#64748b;font-size:12px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}
      .box{border:1px solid #e2e8f0;border-radius:10px;padding:12px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:13px}
      th{background:#eff6ff;color:#1e3a8a}
      .totals{margin-top:16px;max-width:320px;margin-left:auto}
      .totals div{display:flex;justify-content:space-between;padding:6px 0}
      .grand{font-size:18px;font-weight:700;color:#0b3f8a;border-top:1px solid #cbd5e1;margin-top:6px;padding-top:10px}
      @media print{body{background:#fff;padding:0}.sheet{border:none;border-radius:0;max-width:none;padding:0}}
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="head">
        <div>
          <h1>Factura de viaje ${invoice.number}</h1>
          <div class="muted">Generada: ${fmtDate(invoice.generatedAt)}</div>
        </div>
        <div>
          <strong>${invoice.issuer}</strong><br />
          <span class="muted">NIT 900.000.000-0</span>
        </div>
      </div>
      <div class="grid">
        <div class="box">
          <strong>Cliente</strong><br />
          ${request.clientName || "-"}<br />
          <span class="muted">Solicitud: ${request.requestNumber || request.id}</span>
        </div>
        <div class="box">
          <strong>Viaje</strong><br />
          ${request.trip.tripNumber || "-"}<br />
          <span class="muted">${request.trip.vehiclePlate || "-"} · ${request.trip.driverName || "-"}</span>
        </div>
      </div>
      <table>
        <thead><tr><th>Concepto</th><th>Detalle</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Servicio de transporte</td><td>${formatRoute(request)}</td><td>$${invoice.baseValue.toLocaleString("es-CO")}</td></tr>
          <tr><td>Standby</td><td>Cargos por espera</td><td>$${invoice.standbyValue.toLocaleString("es-CO")}</td></tr>
        </tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><strong>$${invoice.subtotal.toLocaleString("es-CO")}</strong></div>
        <div><span>IVA (${Math.round(invoice.ivaRate * 100)}%)</span><strong>$${invoice.ivaValue.toLocaleString("es-CO")}</strong></div>
        <div class="grand"><span>Total</span><span>$${invoice.total.toLocaleString("es-CO")}</span></div>
      </div>
      <p class="muted" style="margin-top:18px">Documento generado automaticamente por Antares. Esta factura refleja el cierre operacional del viaje.</p>
    </div>
    <script>window.print()</script>
  </body>
  </html>`;
  const win = window.open("", "_blank");
  if (!win) {
    notify(userMessage("invoicePopupBlocked"), "error");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function canTransitionStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

const REQUEST_EDIT_JUSTIFICATION_MIN_LEN = 10;

/**
 * Administrador: puede editar/cancelar solicitud mientras no esté en estado final (sin viaje asignado).
 */
function canAdminEditTransportRequestFields(request, actor) {
  if (!request) return false;
  const user = actor || currentUser();
  if (!user) return false;
  const canOps =
    user.role === ROLES.ADMIN || canApproveTransportRequests(user) || canManageTransportTrips(user);
  if (!canOps) return false;
  if (request.trip) return false;
  return !REQUEST_EDIT_FINAL_STATUSES.includes(request.status);
}

/**
 * Cliente: solo mientras la solicitud sigue en **Pendiente** (no aprobada aún) y sin viaje.
 */
function canClientEditOwnPendingTransportRequest(request, actor) {
  const user = actor || currentUser();
  if (!request || !user || user.role !== ROLES.CLIENT) return false;
  if (request.trip) return false;
  return request.status === STATUS.PENDIENTE;
}

/**
 * Puede abrir el formulario de edición de solicitud.
 * Sin viaje: admin (no final) o cliente pendiente. Con viaje: permiso operativo + justificación al guardar.
 */
function canPortalUserEditTransportRequest(request, actor) {
  if (!request) return false;
  if (request.trip) return canEditTransportRequestWithAssignedTrip(request, actor);
  return canAdminEditTransportRequestFields(request) || canClientEditOwnPendingTransportRequest(request, actor);
}

function mergeTransportRequestModificationLog(request, entry) {
  const prev = Array.isArray(request?.modificationLog) ? request.modificationLog : [];
  const row = {
    id: String(entry?.id || newUuidV4()),
    at: String(entry?.at || nowIso()),
    actorName: String(entry?.actorName || "").trim(),
    actorEmail: String(entry?.actorEmail || "").trim(),
    justification: String(entry?.justification || "").trim(),
    tripNumber: String(entry?.tripNumber || request?.trip?.tripNumber || "").trim(),
    changesSummary: String(entry?.changesSummary || "").trim()
  };
  return [row, ...prev].slice(0, 80);
}

function summarizeTransportRequestEditChanges(before, after) {
  const labels = {
    originCity: "origen",
    destinationCity: "destino",
    originAddress: "dirección origen",
    destinationAddress: "dirección destino",
    pickupAt: "recogida",
    etaDelivery: "entrega",
    cargoDescription: "carga",
    serviceType: "modo de transporte",
    vehicleType: "tipo de camión",
    siteContactName: "contacto",
    siteContactPhone: "teléfono contacto",
    tripValue: "valor del viaje",
    notes: "observaciones"
  };
  const changed = [];
  for (const [key, label] of Object.entries(labels)) {
    const a = before?.[key];
    const b = after?.[key];
    if (String(a ?? "").trim() !== String(b ?? "").trim()) changed.push(label);
  }
  if (Boolean(before?.refrigeracionTermoking) !== Boolean(after?.refrigeracionTermoking)) {
    changed.push("Termoking");
  }
  return changed.length ? changed.join(", ") : "datos de la solicitud";
}

function recordTransportRequestModification(request, { justification, actor, changesSummary }) {
  const user = actor || currentUser();
  const actorName = String(user?.name || user?.email || "Usuario").trim();
  const actorEmail = String(user?.email || "").trim();
  const tripNumber = String(request?.trip?.tripNumber || "").trim();
  const just = String(justification || "").trim();
  const summary = String(changesSummary || "").trim();
  const modificationLog = mergeTransportRequestModificationLog(request, {
    justification: just,
    actorName,
    actorEmail,
    tripNumber,
    changesSummary: summary
  });
  const auditSummary = tripNumber
    ? `Viaje ${tripNumber}${summary ? ` · ${summary}` : ""}: ${just}`
    : `${summary ? `${summary}: ` : ""}${just}`;
  appendModuleAuditLog({
    action: "update",
    moduleId: "requests",
    moduleLabel: "Solicitudes",
    entityId: String(request?.id || ""),
    entityLabel: String(request?.requestNumber || request?.id || "Solicitud"),
    summary: auditSummary,
    actor: actorEmail || actorName,
    detailAction: "detail",
    detailId: String(request?.id || "")
  });
  return modificationLog;
}

function renderRequestModificationLogSectionHtml(request) {
  const rows = Array.isArray(request?.modificationLog) ? request.modificationLog : [];
  if (!rows.length) return "";
  const items = rows
    .map((row) => {
      const when = fmtDate(row.at);
      const who = escapeHtml(String(row.actorName || row.actorEmail || "—"));
      const trip = row.tripNumber ? ` · Viaje ${escapeHtml(String(row.tripNumber))}` : "";
      const changes = row.changesSummary
        ? `<p class="muted" style="margin:0.25rem 0 0;font-size:0.88em">Campos: ${escapeHtml(String(row.changesSummary))}</p>`
        : "";
      return `<li class="request-mod-log-item">
        <p class="request-mod-log-meta"><time datetime="${escapeAttr(String(row.at || ""))}">${escapeHtml(when)}</time> · ${who}${trip}</p>
        <p class="request-mod-log-just">${escapeHtml(String(row.justification || "—"))}</p>
        ${changes}
      </li>`;
    })
    .join("");
  return `<section class="solicitud-detail-section solicitud-detail-section--mod-log" aria-label="Historial de modificaciones con viaje asignado">
    <h3 class="solicitud-detail-heading">Historial de modificaciones</h3>
    <ul class="request-mod-log-list">${items}</ul>
  </section>`;
}

/**
 * @deprecated Nombre histórico; equivale a {@link canAdminEditTransportRequestFields}.
 */
function canClientManageRequest(request) {
  return canAdminEditTransportRequestFields(request);
}

/**
 * Permiso de edición sobre el detalle del viaje (vehículo, conductor,
 * fechas estimadas, observaciones). Solo administradores y mientras el
 * viaje no haya sido cerrado/completado/cancelado.
 */
function canAdminEditTrip(request, actor) {
  if (!request?.trip) return false;
  const user = actor || currentUser();
  if (!canManageTransportTrips(user) && !isAdminActor(user)) return false;
  return !REQUEST_EDIT_FINAL_STATUSES.includes(request.status);
}

function hasUnsavedPortalFormData() {
  const modal = document.getElementById("crud-modal");
  if (modal && !modal.classList.contains("hidden")) return true;
  if (!nodes.viewRoot) return false;
  const forms = [...nodes.viewRoot.querySelectorAll("form")];
  if (!forms.length) return false;
  if (document.activeElement && nodes.viewRoot.contains(document.activeElement) && document.activeElement.closest("form")) {
    return true;
  }
  return forms.some((form) => {
    const fields = [...form.querySelectorAll("input, select, textarea")];
    return fields.some((field) => {
      const el = field;
      if (el.disabled || el.readOnly) return false;
      const type = String(el.type || "").toLowerCase();
      if (["hidden", "submit", "button", "reset"].includes(type)) return false;
      if (type === "checkbox" || type === "radio") return !!el.checked;
      if (type === "file") return !!el.files?.length;
      return String(el.value || "").trim() !== "";
    });
  });
}

function requestStandbyChargeInput() {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    openEditModal({
      title: "Registrar standby",
      subtitle: "Define las horas y tarifa para este evento de espera.",
      submitText: "Guardar standby",
      fields: [
        {
          name: "hours",
          labelHtml: fieldLabel(IC.clock, "Horas en standby", { required: true }),
          type: "number",
          value: "1",
          min: "1",
          required: true
        },
        {
          name: "rate",
          labelHtml: fieldLabel(IC.dollar || IC.file, "Valor por hora (COP)", { required: true }),
          type: "number",
          value: "50000",
          min: "0",
          required: true
        }
      ],
      onSubmit: (form) => {
        const hours = Math.max(1, parseNum(form.hours));
        const rate = Math.max(0, parseNum(form.rate));
        if (!Number.isFinite(hours) || hours <= 0) {
          notify("Ingresa una cantidad valida de horas (minimo 1).", "error");
          return false;
        }
        if (!Number.isFinite(rate) || rate < 0) {
          notify("Ingresa una tarifa valida por hora.", "error");
          return false;
        }
        settle({ hours, rate });
        return true;
      }
    });
    const modal = document.getElementById("crud-modal");
    if (!modal) {
      settle(null);
      return;
    }
    const abort = () => settle(null);
    const closeBtn = modal.querySelector("#crud-close");
    const cancelBtn = modal.querySelector("#crud-cancel");
    closeBtn?.addEventListener("click", abort, { once: true });
    cancelBtn?.addEventListener("click", abort, { once: true });
    modal.addEventListener(
      "click",
      (event) => {
        if (event.target === modal) abort();
      },
      { once: true }
    );
  });
}

async function applyStandbyCharge(request, actorName) {
  const input = await requestStandbyChargeInput();
  if (!input) return null;
  const hours = input.hours;
  const rate = input.rate;
  const value = hours * rate;
  const currentTotal = parseNum(request.standbyChargeTotal);
  const event = {
    id: newUuidV4(),
    hours,
    rate,
    value,
    createdAt: nowIso(),
    createdBy: actorName
  };
  return {
    standbyChargeTotal: currentTotal + value,
    standbyEvents: [...(request.standbyEvents || []), event]
  };
}

async function transitionRequestStatus(requestId, nextStatus, actorName = "Sistema") {
  const requests = reqRead();
  const target = requests.find((request) => request.id === requestId);
  if (!target) return false;

  if (!canTransitionStatus(target.status, nextStatus)) {
    notify(userMessage("tripTransitionDenied", target.status, nextStatus), "error");
    return false;
  }

  let extra = {};
  if (nextStatus === STATUS.ESPERA_STANDBY) {
    const standbyData = await applyStandbyCharge(target, actorName);
    if (!standbyData) return false;
    extra = standbyData;
  }

  const updated = requests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status: nextStatus,
          ...extra,
          deliveredAt: nextStatus === STATUS.COMPLETADA ? nowIso() : request.deliveredAt,
          closedAt: nextStatus === STATUS.CERRADA ? nowLocalIso() : request.closedAt,
          trip: request.trip
            ? {
                ...request.trip,
                realtimeStatus: nextStatus,
                invoice: nextStatus === STATUS.CERRADA ? request.trip.invoice || buildTripInvoice(request) : request.trip.invoice,
                updatedAt: nowIso()
              }
            : request.trip
        }
      : request
  );
  void (async () => {
    try {
      await reqWriteAwait(updated);
    } catch (_e) {}
    recalculateResourceAvailability();
  })();
  return true;
}

function notifyScheduleConflictIfAny(pickupAt, etaDelivery, currentRequestId, resourceLabel, tripMatches) {
  const conflict = findActiveTripScheduleConflict(pickupAt, etaDelivery, currentRequestId, tripMatches);
  if (!conflict) return false;
  const tripNum = String(conflict.trip?.tripNumber || conflict.requestNumber || "-").trim();
  const range = transportRequestScheduledRange(conflict);
  const windowLabel =
    range && Number.isFinite(range.start) && Number.isFinite(range.end)
      ? `${fmtDate(new Date(range.start).toISOString())} – ${fmtDate(new Date(range.end).toISOString())}`
      : "";
  notify(userMessage("scheduleConflict", resourceLabel, tripNum, windowLabel), "error");
  return true;
}

/** POST /portal/transport-schedule-busy — una ida al servidor; resultado en caché ~90 s. */
function refreshTransportScheduleBusyFromApi(request, requestId) {
  const pickup = requestSchedulingPickupIso(request);
  const delivery = requestSchedulingDeliveryIso(request);
  const key = transportScheduleBusyCacheKey(requestId, pickup, delivery);
  if (isTransportScheduleBusyCacheReady(request, requestId)) {
    return Promise.resolve(getTransportScheduleBusyStateSnapshot());
  }
  const busySnap0 = getTransportScheduleBusyStateSnapshot();
  if (busySnap0.inflight && busySnap0.key === key) {
    return busySnap0.inflight;
  }
  const api = window.AntaresApi;
  if (!api?.postJson || !pickup || !delivery) {
    return Promise.resolve(null);
  }
  transportScheduleBusySetKeyForFetch(key);
  const run = api
    .postJson("/portal/transport-schedule-busy", {
      excludeRequestId: requestId || undefined,
      pickupAt: pickup,
      deliveryAt: delivery
    })
    .then((res) => {
      transportScheduleBusyApplySuccessForKey(key, res);
      document.dispatchEvent(
        new CustomEvent("transport-schedule-busy-updated", {
          detail: { requestId, pickup, delivery }
        })
      );
      return getTransportScheduleBusyStateSnapshot();
    })
    .catch(() => {
      transportScheduleBusyApplyErrorForKey(key);
      return null;
    })
    .finally(() => {
      transportScheduleBusyClearInflightIfSame(run);
    });
  transportScheduleBusySetInflight(run);
  return run;
}

function isVehicleBusyAtHour(vehicle, pickupAt, etaDelivery, currentRequestId = null) {
  const vid = String(vehicle?.id || "").trim();
  const vplate = String(vehicle?.plate || "").trim().toUpperCase();
  const busySnap = getTransportScheduleBusyStateSnapshot();
  if (vid && scheduleBusyCacheMatches(pickupAt, etaDelivery, currentRequestId)) {
    return busySnap.busyVehicleIds && busySnap.busyVehicleIds.has(vid);
  }
  return activeTripSchedulingConflictsWith(pickupAt, etaDelivery, currentRequestId, (t) => {
    if (t.vehicleId) return String(t.vehicleId).trim() === vid;
    return Boolean(vplate && String(t.vehiclePlate || "").trim().toUpperCase() === vplate);
  });
}

function isDriverBusyAtHour(driver, pickupAt, etaDelivery, currentRequestId = null) {
  const did = String(driver?.id || "").trim();
  const dname = String(driver?.name || "").trim().toLowerCase();
  const busySnap = getTransportScheduleBusyStateSnapshot();
  if (did && scheduleBusyCacheMatches(pickupAt, etaDelivery, currentRequestId)) {
    return busySnap.busyDriverIds && busySnap.busyDriverIds.has(did);
  }
  return activeTripSchedulingConflictsWith(pickupAt, etaDelivery, currentRequestId, (t) => {
    if (t.driverId) return String(t.driverId).trim() === did;
    return Boolean(dname && String(t.driverName || "").trim().toLowerCase() === dname);
  });
}

function rebuildTripAssignmentSelectOptions(formEl, request, requestId, needsTermoking) {
  if (!formEl || !request) return;
  const vehSel = formEl.querySelector("select[name='vehicleId']");
  const drvSel = formEl.querySelector("select[name='driverId']");
  if (!vehSel && !drvSel) return;
  const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
  const driverCandidates = getDriverCandidatesForRequest(request, requestId);
  if (vehSel) {
    const prev = String(vehSel.value || "");
    vehSel.innerHTML = [
      `<option value="">${vehicleCandidates.length ? "Sin asignar por ahora" : needsTermoking ? "No hay vehículos con Termoking para capacidad, documentos u horario" : "No hay vehículos para capacidad, documentos u horario"}</option>`,
      ...vehicleCandidates.map((vehicle) => {
        const dis = Boolean(vehicle.isBusy || vehicle.isUnavailable || vehicle.hasExpiredDocs || vehicle.wrongTruckType);
        const label = tripAssignmentVehicleOptionLabel(vehicle, {
          needsTermoking,
          isBusy: vehicle.isBusy,
          isUnavailable: vehicle.isUnavailable,
          hasExpiredDocs: vehicle.hasExpiredDocs,
          wrongTruckType: vehicle.wrongTruckType,
          request
        });
        return `<option value="${escapeAttr(String(vehicle.id))}"${dis ? " disabled" : ""}>${escapeHtml(label)}</option>`;
      })
    ].join("");
    if (prev && [...vehSel.options].some((o) => o.value === prev && !o.disabled)) vehSel.value = prev;
    refreshSearchableSelect(vehSel);
  }
  if (drvSel) {
    const prev = String(drvSel.value || "");
    drvSel.innerHTML = [
      `<option value="">${driverCandidates.length ? "Sin asignar por ahora" : "No hay conductores disponibles para el horario"}</option>`,
      ...driverCandidates.map((driver) => {
        const dis = Boolean(driver.isBusy || driver.isUnavailable || driver.hasExpiredDocs);
        const label = tripAssignmentDriverOptionLabel(driver, {
          isBusy: driver.isBusy,
          isUnavailable: driver.isUnavailable,
          hasExpiredDocs: driver.hasExpiredDocs
        });
        return `<option value="${escapeAttr(String(driver.id))}"${dis ? " disabled" : ""}>${escapeHtml(label)}</option>`;
      })
    ].join("");
    if (prev && [...drvSel.options].some((o) => o.value === prev && !o.disabled)) drvSel.value = prev;
    refreshSearchableSelect(drvSel);
  }
}

/** Prefetch POST /portal/transport-schedule-busy y refresca selects al responder (modales + crear viaje). */
function wireTripAssignmentScheduleBusyRefresh(formEl, request, requestId, needsTermoking) {
  if (!formEl || !request) return;
  const rid = String(requestId || request.id || "").trim();
  formEl.dataset.scheduleBusyRequestId = rid;
  const refreshUi = () => {
    if (String(formEl.id || "") === "form-create-trip") {
      refreshCreateTripModuleForm(formEl);
      return;
    }
    rebuildTripAssignmentSelectOptions(formEl, request, rid, needsTermoking);
  };
  if (formEl._scheduleBusyHandler) {
    document.removeEventListener("transport-schedule-busy-updated", formEl._scheduleBusyHandler);
  }
  const onBusy = (ev) => {
    const d = ev?.detail || {};
    if (String(d.requestId || "") !== rid) return;
    refreshUi();
  };
  formEl._scheduleBusyHandler = onBusy;
  document.addEventListener("transport-schedule-busy-updated", onBusy);
  void refreshTransportScheduleBusyFromApi(request, rid).then(refreshUi);
}

function selectBestVehicle(weight, pickupAt, etaDelivery, currentRequestId = null, options = {}) {
  const requiresRefrigeration = Boolean(options.requiresRefrigeration);
  const reqForType = options.request && typeof options.request === "object" ? options.request : null;
  const vehicles = read(KEYS.vehicles, []);
  /** Con Termoking en solicitud → solo unidades con equipo; sin Termoking → solo secas (excluye refrigerados). */
  const matchesThermal = (v) =>
    requiresRefrigeration ? vehicleHasTermokingEquipment(v) : !vehicleHasTermokingEquipment(v);
  const matchesReqTruck = (v) => !reqForType || vehicleMatchesRequestTruckType(v, reqForType);
  const filtered = vehicles.filter(
    (v) =>
      !isManuallyUnavailable(v) &&
      isVehicleEligibleForTripAssignment(v) &&
      matchesThermal(v) &&
      matchesReqTruck(v) &&
      !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)
  );
  const pick =
    filtered.find((v) => v.capacityKg >= weight) ||
    filtered[0] ||
    vehicles.find(
      (v) =>
        !isManuallyUnavailable(v) &&
        isVehicleEligibleForTripAssignment(v) &&
        matchesThermal(v) &&
        matchesReqTruck(v) &&
        !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)
    ) ||
    null;
  return pick || null;
}

function selectDriver(pickupAt, etaDelivery, currentRequestId = null) {
  const drivers = read(KEYS.drivers, []);
  return (
    drivers.find((d) => !isManuallyUnavailable(d) && !isDriverBusyAtHour(d, pickupAt, etaDelivery, currentRequestId)) ||
    null
  );
}

/**
 * Solicitud con equipo refrigerado (Termoking) o equivalentes legacy.
 * Importante: "Transporte nacional sin termoking" contiene la subcadena "termoking";
 * hay que excluir explícitamente el caso seco antes de buscar "termoking".
 */
function serviceTypeRequiresRefrigeration(serviceType) {
  const s = String(serviceType || "").toLowerCase().trim();
  if (!s) return false;
  if (s === "dry" || s.includes("sin termoking") || s.includes("without thermo")) return false;
  if (s === "refrigerated") return true;
  return (
    s.includes("termoking") ||
    s.includes("thermo king") ||
    s.includes("refrigerada") ||
    s.includes("refrigerado")
  );
}

const TRANSPORT_MODOS_SERVICIO = new Set(["Transporte nacional", "Transporte entre sedes del cliente"]);

function normalizeRequestTransportMode(serviceType) {
  const raw = String(serviceType || "").trim();
  if (TRANSPORT_MODOS_SERVICIO.has(raw)) return raw;
  const lower = raw.toLowerCase();
  if (lower.includes("entre sedes") || lower.includes("sedes del cliente")) {
    return "Transporte entre sedes del cliente";
  }
  return "Transporte nacional";
}

/** Modo de transporte legible para fichas de solicitud (detalle, modal). */
function requestTransportModeFromRequest(req) {
  const raw = String(req?.serviceType ?? "").trim();
  if (!raw) return "—";
  return normalizeRequestTransportMode(raw);
}

function requestRequiredTruckTypeShowsTractomulaKg(t) {
  return t === "Tractomula";
}

/** Muestra/oculta fuelles (Turbo/Camión) vs kg (Tractomula) y limpia el campo que no aplica. */
function attachRequestTruckTypeFields(formEl) {
  if (!formEl) return;
  const truckSel = formEl.querySelector("select[name='requiredTruckType']");
  const fuellesRow = formEl.querySelector(".request-truck-field--fuelles");
  const kgRow = formEl.querySelector(".request-truck-field--kg");
  const fuellesInput = formEl.querySelector("input[name='fuelles']");
  const kgInput = formEl.querySelector("input[name='weightKg']");
  if (!truckSel || !fuellesRow || !kgRow) return;

  const stripRequiredMarkers = (label) => {
    label?.querySelectorAll?.(".required-marker")?.forEach((m) => m.remove());
  };

  const sync = () => {
    const t = normalizeRequestRequiredTruckType(truckSel.value);
    const showF = requestRequiredTruckTypeShowsFuelles(t);
    const showKg = requestRequiredTruckTypeShowsTractomulaKg(t);
    fuellesRow.hidden = !showF;
    kgRow.hidden = !showKg;
    if (fuellesInput) {
      fuellesInput.required = showF;
      fuellesInput.toggleAttribute("required", showF);
      if (!showF) {
        fuellesInput.value = "";
        stripRequiredMarkers(fuellesRow);
      }
    }
    if (kgInput) {
      kgInput.required = showKg;
      kgInput.toggleAttribute("required", showKg);
      if (!showKg) {
        kgInput.value = "";
        stripRequiredMarkers(kgRow);
      }
    }
  };

  if (truckSel.dataset.truckTypeWired !== "1") {
    truckSel.dataset.truckTypeWired = "1";
    truckSel.addEventListener("change", sync);
  }
  sync();
}

/** Filas de edición (modal) para tipo de camión, fuelles y peso tractomula. */
function buildRequestTruckTypeEditFieldRows(req) {
  const truckVt = normalizeRequestRequiredTruckType(req?.vehicleType);
  const showFuelles = requestRequiredTruckTypeShowsFuelles(truckVt);
  const showKg = requestRequiredTruckTypeShowsTractomulaKg(truckVt);
  return [
    {
      name: "requiredTruckType",
      label: "Tipo de camión requerido",
      type: "select",
      value: truckVt || "",
      required: true,
      full: true,
      options: [
        { value: "", label: "Seleccione..." },
        { value: "Turbo", label: "Turbo" },
        { value: "Camión", label: "Camión" },
        { value: "Tractomula", label: "Tractomula" }
      ]
    },
    {
      name: "fuelles",
      label: "Cantidad de fuelles",
      type: "number",
      min: 0,
      step: 1,
      value: req.fuelles != null && req.fuelles !== "" ? parseNum(req.fuelles) : "",
      required: showFuelles,
      hidden: !showFuelles,
      wrapperClass: "request-truck-field request-truck-field--fuelles"
    },
    {
      name: "weightKg",
      label: "Peso (kg) tractomula",
      type: "number",
      min: 0,
      step: 0.01,
      value: showKg ? parseNum(req.weightKg) || "" : "",
      required: showKg,
      hidden: !showKg,
      wrapperClass: "request-truck-field request-truck-field--kg"
    }
  ];
}

/** Resumen legible de tipo de camión, fuelles o peso (tarjetas y detalle). */
function requestTruckRequirementSummaryHtml(req) {
  const vt = normalizeRequestRequiredTruckType(req?.vehicleType);
  if (vt === "Tractomula") {
    const kg = parseNum(req?.weightKg).toLocaleString("es-CO");
    return `${escapeHtml(vt)} · ${kg} kg`;
  }
  if (requestRequiredTruckTypeShowsFuelles(vt)) {
    const n = parseNum(req?.fuelles);
    return `${escapeHtml(vt)} · ${n.toLocaleString("es-CO")} fuelle(s)`;
  }
  const boxes = parseNum(req?.boxes ?? req?.boxesCount);
  const w = parseNum(req?.weightKg);
  const legacy = (boxes > 0 || w > 0) && !vt;
  if (legacy) {
    return `${w.toLocaleString("es-CO")} kg · ${boxes.toLocaleString("es-CO")} cajas`;
  }
  const shown = String(req?.vehicleType || "").trim();
  if (shown && shown !== "Por definir") return escapeHtml(shown);
  return escapeHtml("—");
}

/** Termoking: columna `refrigeracionTermoking` si existe; si no, inferencia legacy desde `serviceType`. */
function requestRequiresTermoking(request) {
  if (request && typeof request.refrigeracionTermoking === "boolean") return request.refrigeracionTermoking;
  return serviceTypeRequiresRefrigeration(request?.serviceType);
}

/** BD `vehiculos.refrigerado_termoking` ↔ portal `refrigerated`; tolera strings legacy en sincronización. */
function vehicleHasTermokingEquipment(vehicle) {
  if (!vehicle || typeof vehicle !== "object") return false;
  const r = vehicle.refrigerated ?? vehicle.refrigerado_termoking;
  if (r === true || r === 1) return true;
  if (typeof r === "string") {
    const t = r.trim().toLowerCase();
    return t === "true" || t === "t" || t === "1" || t === "si" || t === "yes";
  }
  return false;
}

/** Placa miniatura estilo Colombia (fondo amarillo) para tarjetas de vehículo. */
function renderColombianPlateBadgeHtml(plate) {
  const p = String(plate || "—").trim().toUpperCase() || "—";
  const len = p.replace(/[^A-Z0-9]/gi, "").length;
  const sizeClass =
    len >= 7 ? " directory-card__avatar--plate-plate7" : len >= 6 ? " directory-card__avatar--plate-plate6" : "";
  return `<div class="directory-card__avatar directory-card__avatar--plate${sizeClass}" title="${escapeAttr(p)}" aria-label="Placa ${escapeAttr(p)}"><span class="directory-card__plate-text">${escapeHtml(p)}</span></div>`;
}

/** Lo que el cliente define en la solicitud: solo Termoking sí / no (sin tipo de carrocería). */
function requestTermokingClientLabel(request) {
  if (!request) return "—";
  if (typeof request.refrigeracionTermoking === "boolean") {
    return request.refrigeracionTermoking ? "Con Termoking" : "Sin Termoking";
  }
  if (!String(request.serviceType || "").trim()) return "—";
  return serviceTypeRequiresRefrigeration(request.serviceType) ? "Con Termoking" : "Sin Termoking";
}

/** Columna historial: preferencia Termoking del cliente + tipo de flota si ya hay viaje asignado. */
function historyVehicleColumn(request) {
  const tk = requestTermokingClientLabel(request);
  const assigned = String(request?.trip?.vehicleType || "").trim();
  if (assigned) return `${tk} · ${assigned}`;
  return tk;
}

/** Categoría de flota elegible para asignación operativa: Camión / Turbo / Tractomula. La solicitud restringe el tipo cuando `vehicleType` está informado; Termoking vía `refrigeracionTermoking` o legacy en `serviceType`. */
const TRIP_ASSIGNMENT_FLEET_TYPE_KEYS = new Set(["camion", "turbo", "tractomula"]);

function normalizeFleetTypeForTripAssignment(type) {
  return String(type || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Turbo / Camión / Tractomula de la solicitud ↔ mismo tipo en flota (tolerante a tildes/mayúsculas). Sin tipo requerido → no se filtra (datos legacy). */
function vehicleMatchesRequestTruckType(vehicle, request) {
  const reqLabel = normalizeRequestRequiredTruckType(request?.vehicleType);
  if (!reqLabel) return true;
  const reqKey = normalizeFleetTypeForTripAssignment(reqLabel);
  const vKey = normalizeFleetTypeForTripAssignment(vehicle?.type);
  return Boolean(reqKey && vKey && reqKey === vKey);
}

function isVehicleEligibleForTripAssignment(vehicle) {
  return TRIP_ASSIGNMENT_FLEET_TYPE_KEYS.has(normalizeFleetTypeForTripAssignment(vehicle?.type));
}

/** Etiqueta unificada en selects de asignación; con Termoking en solicitud muestra bandera explícita. */
function tripAssignmentVehicleOptionLabel(vehicle, options = {}) {
  const needsTermoking = Boolean(options.needsTermoking);
  const isBusy = Boolean(options.isBusy);
  const isUnavailable = Boolean(options.isUnavailable);
  const hasExpiredDocs = Boolean(options.hasExpiredDocs);
  const cap = `${parseNum(vehicle.capacityKg).toLocaleString("es-CO")} kg`;
  const soat = docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate).label;
  const tec = docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate).label;
  const thermal = needsTermoking
    ? vehicleHasTermokingEquipment(vehicle)
      ? " · Termoking: sí"
      : " · Termoking: no"
    : ` · ${vehicleHasTermokingEquipment(vehicle) ? "Refrigerado" : "Seco"}`;
  let tail = ` · SOAT ${soat} · Tec ${tec}`;
  if (isBusy) tail += " · Ocupado (horario)";
  if (isUnavailable) tail += " · No disponible";
  if (hasExpiredDocs) tail += " · Documentación vencida";
  if (options.wrongTruckType) {
    const rt = String(options.requestTruckType || "").trim();
    tail += rt ? ` · Tipo no coincide (solicitud: ${rt})` : " · Tipo no coincide con la solicitud";
  }
  return `${vehicle.plate} · ${vehicle.type} · ${cap}${thermal}${tail}`;
}

function tripAssignmentDriverOptionLabel(driver, options = {}) {
  const isBusy = Boolean(options.isBusy);
  const isUnavailable = Boolean(options.isUnavailable);
  const hasExpiredDocs = Boolean(options.hasExpiredDocs);
  let tail = `${driver.name} · Lic ${driver.license || "-"} · vence ${driver.licenseExpiry || "-"} · ${driver.phone || "-"}`;
  if (isBusy) tail += " · Ocupado (horario)";
  if (isUnavailable) tail += " · No disponible";
  if (hasExpiredDocs) tail += " · Licencia vencida";
  return tail;
}

function getCompatibleVehiclesForRequest(request, currentRequestId = null, compatOpts = {}) {
  const moduleCreate = !!(compatOpts && compatOpts.moduleCreateTrip);
  const requiresRefrigeration = requestRequiresTermoking(request);
  return read(KEYS.vehicles, []).filter((vehicle) => {
    if (isManuallyUnavailable(vehicle)) return false;
    if (!vehicleMatchesRequestTruckType(vehicle, request)) return false;
    if (moduleCreate) {
      // Asistente en Viajes: sin filtro estricto Camión/Turbo/Tractomula en `isVehicleEligible…`;
      // el tipo pedido en la solicitud sí restringe (`vehicleMatchesRequestTruckType` arriba).
    } else {
      if (!isVehicleEligibleForTripAssignment(vehicle)) return false;
    }
    if (parseNum(vehicle.capacityKg) < parseNum(request?.weightKg)) return false;
    if (requiresRefrigeration && !vehicleHasTermokingEquipment(vehicle)) return false;
    if (!requiresRefrigeration && vehicleHasTermokingEquipment(vehicle)) return false;
    if (docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate).days < 0) return false;
    if (docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate).days < 0)
      return false;
    if (
      isVehicleBusyAtHour(
        vehicle,
        requestSchedulingPickupIso(request),
        requestSchedulingDeliveryIso(request),
        currentRequestId
      )
    )
      return false;
    return true;
  });
}

function getCompatibleDriversForRequest(request, currentRequestId = null) {
  return read(KEYS.drivers, []).filter(
    (driver) =>
      !isManuallyUnavailable(driver) &&
      daysUntil(driver.licenseExpiry) >= 0 &&
      !isDriverBusyAtHour(driver, requestSchedulingPickupIso(request), requestSchedulingDeliveryIso(request), currentRequestId)
  );
}

function getVehicleCandidatesForRequest(request, currentRequestId = null) {
  const requiresRefrigeration = requestRequiresTermoking(request);
  return read(KEYS.vehicles, [])
    .filter((vehicle) => {
      if (!isVehicleEligibleForTripAssignment(vehicle)) return false;
      if (parseNum(vehicle.capacityKg) < parseNum(request?.weightKg)) return false;
      if (requiresRefrigeration && !vehicleHasTermokingEquipment(vehicle)) return false;
      if (!requiresRefrigeration && vehicleHasTermokingEquipment(vehicle)) return false;
      return true;
    })
    .map((vehicle) => {
      const soatDays = docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate).days;
      const techDays = docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate).days;
      const busyBySchedule = isVehicleBusyAtHour(
        vehicle,
        requestSchedulingPickupIso(request),
        requestSchedulingDeliveryIso(request),
        currentRequestId
      );
      const unavailableManual = isManuallyUnavailable(vehicle);
      const wrongTruckType = !vehicleMatchesRequestTruckType(vehicle, request);
      return {
        ...vehicle,
        isBusy: busyBySchedule,
        isUnavailable: unavailableManual,
        hasExpiredDocs: soatDays < 0 || techDays < 0,
        wrongTruckType
      };
    });
}

function getDriverCandidatesForRequest(request, currentRequestId = null) {
  return read(KEYS.drivers, []).map((driver) => {
    const expiredLicense = daysUntil(driver.licenseExpiry) < 0;
    const busyBySchedule = isDriverBusyAtHour(
      driver,
      requestSchedulingPickupIso(request),
      requestSchedulingDeliveryIso(request),
      currentRequestId
    );
    const unavailableManual = isManuallyUnavailable(driver);
    return {
      ...driver,
      isBusy: busyBySchedule,
      isUnavailable: unavailableManual,
      hasExpiredDocs: expiredLicense
    };
  });
}

function makeTripNumber(existingNumbers = new Set()) {
  let code = `VIA-${String(nextCounter("trip")).padStart(6, "0")}`;
  while (existingNumbers.has(code)) {
    code = `VIA-${String(nextCounter("trip")).padStart(6, "0")}`;
  }
  return code;
}

async function setVehicleAvailability(vehicleId, available) {
  const id = String(vehicleId || "").trim();
  const vehicles = read(KEYS.vehicles, []);
  const updatedTs = nowIso();
  const next = vehicles.map((v) =>
    String(v.id || "").trim() === id ? { ...v, available: Boolean(available), updatedAt: updatedTs } : v
  );
  await writeAwaitServer(KEYS.vehicles, next);
}

function findPortalVehicleById(vehicleId) {
  const id = String(vehicleId || "").trim();
  if (!id) return null;
  return read(KEYS.vehicles, []).find((v) => String(v.id || "").trim() === id) || null;
}

function describePortalVehicleOccupancy(vehicle) {
  const vehicleId = String(vehicle?.id || "").trim();
  if (!vehicleId) return { tone: "available", trip: null, detail: "Sin datos" };
  if (isManuallyUnavailable(vehicle)) {
    return { tone: "offline", trip: null, detail: "Marcado manualmente como no disponible" };
  }
  const activeTrips = getActiveTrips().filter((r) => String(r.trip?.vehicleId || "").trim() === vehicleId);
  if (!activeTrips.length) return { tone: "available", trip: null, detail: "Sin viaje activo" };
  const nowTs = Date.now();
  const ongoing =
    activeTrips.find((r) => describeTripTimingVsNow(r, nowTs).timing === "ongoing") || null;
  if (ongoing) {
    const left = describeTripTimingVsNow(ongoing, nowTs).minutes;
    return {
      tone: "busy",
      trip: ongoing,
      detail: `En curso · ${left != null ? `${left} min restantes` : "Horario en curso"}`
    };
  }
  const upcoming = activeTrips
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
  return { tone: "available", trip: null, detail: "Sin viaje activo en este momento" };
}

function portalVehicleAvailabilityStatusHtml(vehicle) {
  const occupancy = describePortalVehicleOccupancy(vehicle);
  if (isManuallyUnavailable(vehicle)) {
    return '<span class="status status-fleet-offline">No disponible (manual)</span>';
  }
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
    parseNum(v.capacityKg) > 0 ? `${parseNum(v.capacityKg).toLocaleString("es-CO")} kg` : "Sin dato";
  const mileageLbl =
    parseNum(v.mileageKm) > 0 ? `${parseNum(v.mileageKm).toLocaleString("es-CO")} km` : "Sin dato";
  const hasGps = !(v.hasGps === false || String(v.hasGps).toLowerCase() === "false");
  const termoChip = isRefrigerated
    ? '<span class="status status-viaje_asignado">Termoking</span>'
    : '<span class="status status-pendiente">Carga seca</span>';
  const heroHtml = `<div class="portal-detail-hero portal-detail-hero--vehicle">
    <div class="portal-detail-hero-plate" aria-hidden="true">${renderColombianPlateBadgeHtml(plate)}</div>
    <div class="portal-detail-hero-main">
      <p class="portal-detail-eyebrow">${IC.truck} Ficha técnica</p>
      <div class="portal-detail-badges">${portalVehicleAvailabilityStatusHtml(v)} ${termoChip}</div>
      <p class="portal-detail-meta"><strong>${escapeHtml(vehicleTitle)}</strong> · ${escapeHtml(String(v.type || "Vehículo"))} · ${escapeHtml(String(v.year || "—"))}</p>
      <ul class="portal-detail-stats" aria-label="Resumen">
        <li><strong>${escapeHtml(capacityLbl)}</strong><span>Capacidad</span></li>
        <li><strong>${escapeHtml(mileageLbl)}</strong><span>Kilometraje</span></li>
        <li><strong>${escapeHtml(fmtDateOr(v.createdAt))}</strong><span>Alta en sistema</span></li>
      </ul>
    </div>
  </div>`;
  const tilesHtml = [
    portalDetailTileMarkup(IC.layers, "Carrocería", escapeHtml(String(v.bodyType || "Sin dato")), {
      muted: !String(v.bodyType || "").trim()
    }),
    portalDetailTileMarkup(IC.activity, "Combustible", escapeHtml(String(v.fuelType || "Sin dato")), {
      muted: !String(v.fuelType || "").trim()
    }),
    portalDetailTileMarkup(
      IC.satellite,
      "GPS",
      hasGps ? escapeHtml(String(v.gpsProvider || "Instalado")) : `<span class="muted">Sin GPS</span>`,
      { muted: !hasGps }
    )
  ].join("");
  const tripHighlightBody = trip
    ? `<p class="portal-detail-loc-line"><strong>Viaje ${escapeHtml(String(trip.trip?.tripNumber || "—"))}</strong> · ${escapeHtml(String(trip.clientName || trip.companyName || ""))}</p><p class="portal-detail-loc-sub muted">${IC.clock} ${escapeHtml(occupancy.detail)}</p>`
    : `<p class="portal-detail-loc-line">${escapeHtml(occupancy.detail)}</p>`;
  const highlightHtml = portalDetailHighlightHtml("Operación actual", tripHighlightBody, "truck");
  const row = (pairs) => portalDetailRenderRows(pairs, { skipEmpty: false });
  const sections = [
    {
      icon: "activity",
      title: "Estado operativo",
      rows: row([
        ["Disponibilidad", portalVehicleAvailabilityStatusHtml(v)],
        ["Detalle", escapeHtml(occupancy.detail)],
        ["Termoking", isRefrigerated ? "Sí, equipo Termoking" : "No, carga seca"],
        ["Registrado", fmtDateOr(v.createdAt)],
        ["Última actualización", fmtDateOr(v.updatedAt)]
      ])
    },
    {
      icon: "truck",
      title: "Identificación",
      rows: row([
        ["Placa", `<strong>${escapeHtml(plate)}</strong>`],
        ["Marca", escapeHtml(String(v.brand || "—"))],
        ["Línea / modelo", escapeHtml(String(v.model || "—"))],
        ["Año modelo", escapeHtml(String(v.year || "—"))],
        ["Color", escapeHtml(String(v.color || "—"))],
        ["Tipo de vehículo", escapeHtml(String(v.type || "—"))]
      ])
    },
    {
      icon: "layers",
      title: "Características técnicas",
      rows: row([
        ["Carrocería", escapeHtml(String(v.bodyType || "—"))],
        ["Capacidad", capacityLbl],
        ["Combustible", escapeHtml(String(v.fuelType || "—"))],
        ["Configuración de ejes", escapeHtml(String(v.axleConfig || "—"))],
        ["N° motor", escapeHtml(String(v.engineNumber || "—"))],
        ["Chasis (VIN)", escapeHtml(String(v.vin || "—"))],
        ["Kilometraje", mileageLbl]
      ])
    },
    {
      icon: "shield",
      title: "Documentación legal",
      rows: row([
        ["Tarjeta de propiedad", escapeHtml(String(v.ownershipCard || "—"))],
        ["SOAT expedido", fmtDateOr(v.soatExpeditionDate)],
        ["SOAT vence", `${fmtDateOr(v.soatExpiryDate)} <span class="status ${soat.cls}">${escapeHtml(soat.label)}</span>`],
        ["Tecnomecánica expedida", fmtDateOr(v.techInspectionExpeditionDate)],
        ["Tecnomecánica vence", `${fmtDateOr(v.techInspectionExpiryDate)} <span class="status ${tec.cls}">${escapeHtml(tec.label)}</span>`],
        ["Póliza RC contractual", escapeHtml(String(v.rcPolicyContract || "—"))],
        ["Póliza RC extracontractual", escapeHtml(String(v.rcPolicyExtra || "—"))],
        [
          "Vence pólizas RCP",
          v.rcPolicyExpiry
            ? `${fmtDateOr(v.rcPolicyExpiry)} <span class="status ${rcExpiry.cls}">${escapeHtml(rcExpiry.label)}</span>`
            : "—"
        ]
      ])
    },
    {
      icon: "satellite",
      title: "GPS y trazabilidad",
      rows: row([
        ["GPS satelital", hasGps ? "Sí" : "No"],
        ["Proveedor GPS", escapeHtml(String(v.gpsProvider || "—"))],
        ["Usuario proveedor satélite", escapeHtml(String(v.satelliteProviderUser || "—"))],
        ["Contraseña proveedor satélite", v.satelliteProviderPassword ? "••••••••" : "—"]
      ])
    }
  ];
  openPortalDetailSheet({
    title: `Ficha técnica · ${plate}`,
    subtitle: `${String(v.type || "Vehículo")} · ${String(v.year || "")}`,
    heroHtml,
    tilesHtml,
    highlightHtml,
    sectionsHtml: portalDetailBuildGrid(sections),
    secondaryActionsHtml: isAdminActor()
      ? `<button type="button" class="btn btn-action" data-vehicle-sheet-action="edit">${IC.edit} Editar vehículo</button>`
      : "",
    afterMount: (contentEl) => {
      contentEl.querySelector("[data-vehicle-sheet-action='edit']")?.addEventListener("click", () => {
        document.getElementById("crud-modal")?.classList.add("hidden");
        nodes.viewRoot?.querySelector(`[data-action='edit-vehicle'][data-id="${escapeAttr(String(v.id || ""))}"]`)?.click();
      });
    }
  });
}

function togglePortalVehicleManualAvailability(vehicleId) {
  const target = findPortalVehicleById(vehicleId);
  if (!target) {
    notify("No se encontró el vehículo. Actualice la página.", "error");
    return;
  }
  if (target.autoBusy) {
    notify(
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
        recalculateResourceAvailability();
        notify(
          markingUnavailable ? `Vehículo ${plate} marcado como no disponible.` : `Vehículo ${plate} disponible.`,
          "success"
        );
        renderPortalView();
      } catch (err) {
        notify(String(err?.message || "No fue posible actualizar la disponibilidad."), "error");
      }
    }
  });
}


/** Detalle de solicitud: delegación en viewRoot (tarjetas del módulo Solicitudes y tablas legacy). */

async function setDriverAvailability(driverId, available) {
  const key = String(driverId ?? "").trim();
  if (!key) return false;
  const drivers = read(KEYS.drivers, []);
  const updatedTs = nowIso();
  let found = false;
  const next = drivers.map((d) => {
    if (String(d.id ?? "").trim() !== key) return d;
    found = true;
    return { ...d, available: Boolean(available), updatedAt: updatedTs };
  });
  if (!found) return false;
  try {
    await writeAwaitServer(KEYS.drivers, next);
    recalculateResourceAvailability();
    return true;
  } catch (_e) {
    return false;
  }
}

function findPortalDriverById(driverId) {
  const id = String(driverId ?? "").trim();
  if (!id) return null;
  return read(KEYS.drivers, []).find((d) => String(d.id ?? "").trim() === id) || null;
}

function portalDetailTileMarkup(iconSvg, label, valueHtml, opts = {}) {
  const { href = "", muted = false } = opts;
  const inner = `<span class="portal-detail-tile-icon" aria-hidden="true">${iconSvg}</span><span class="portal-detail-tile-text"><span class="portal-detail-tile-label">${escapeHtml(label)}</span><span class="portal-detail-tile-value">${valueHtml}</span></span>`;
  if (href) {
    return `<a class="portal-detail-tile" href="${escapeAttr(href)}">${inner}</a>`;
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
      return `<div class="detail-row"><span class="detail-row-label">${escapeHtml(String(label))}</span><span class="detail-row-value">${display}</span></div>`;
    })
    .filter(Boolean)
    .join("");
}

function portalDetailBuildGrid(sections) {
  const blocks = (sections || [])
    .filter((sec) => sec && String(sec.rows || "").trim())
    .map((sec, idx) => {
      const toneClass = sec.tone ? ` detail-section--${escapeAttr(String(sec.tone))}` : "";
      return `<section class="detail-section detail-section--card${toneClass}" style="--detail-section-i:${idx % 6}">
        <h4 class="detail-section-title">${IC[sec.icon] || ""}<span>${escapeHtml(sec.title)}</span></h4>
        <div class="detail-section-grid">${sec.rows}</div>
      </section>`;
    })
    .join("");
  return blocks ? `<div class="detail-grid detail-grid--sections">${blocks}</div>` : "";
}

function portalDetailHighlightHtml(title, bodyHtml, iconKey = "activity") {
  const safeTitle = String(title || "").trim() || "Detalle";
  return `<section class="portal-detail-highlight" aria-label="${escapeAttr(safeTitle)}">
    <h4 class="portal-detail-highlight__title">${IC[iconKey] || ""}<span>${escapeHtml(safeTitle)}</span></h4>
    <div class="portal-detail-highlight__body">${bodyHtml}</div>
  </section>`;
}

function portalDetailComposeModal(parts = {}) {
  const hero = String(parts.heroHtml || "").trim();
  const tiles = String(parts.tilesHtml || "").trim();
  const highlight = String(parts.highlightHtml || "").trim();
  const sections = String(parts.sectionsHtml || "").trim();
  return `<div class="portal-detail-modal">
    ${hero}
    ${tiles ? `<div class="portal-detail-tiles">${tiles}</div>` : ""}
    ${highlight}
    ${sections}
  </div>`;
}

function openPortalDetailSheet(opts = {}) {
  openInfoModal({
    title: opts.title || "Detalle",
    subtitle: opts.subtitle || "",
    bodyHtml: portalDetailComposeModal(opts),
    wide: opts.wide !== false,
    extraModalCardClass: `modal-card--portal-detail${opts.extraModalCardClass ? ` ${escapeAttr(String(opts.extraModalCardClass).trim())}` : ""}`,
    secondaryActionsHtml: String(opts.secondaryActionsHtml || ""),
    afterMount: opts.afterMount
  });
}

function openDriverDetailSheetModal(driver) {
  if (!driver) return;
  const d = normalizeDriverRowForEditor(driver) || driver;
  const company = getCompanyById(d.companyId);
  const companyName = String(company?.name || "").trim();
  const avatarCss = employeeAvatarCssUrl(d.photoUrl);
  const avatarUrlRaw = String(d.photoUrl || "").trim();
  const avatarHero = avatarCss
    ? `<div class="portal-detail-logo portal-detail-logo--avatar"><img src="${escapeAttr(avatarUrlRaw)}" alt="" loading="lazy" decoding="async" /></div>`
    : `<div class="portal-detail-logo portal-detail-logo--avatar portal-detail-logo--fallback" aria-hidden="true"><span>${escapeHtml(
        (String(d.name || "C").charAt(0) || "C").toUpperCase()
      )}</span></div>`;
  const buildDateChip = (rawValue, missingLabel = "Sin fecha", warnDays = 60) => {
    const ymd = normalizePortalDateYmd(rawValue);
    if (!ymd) {
      return {
        bucket: "missing",
        label: missingLabel,
        chipHtml: `<span class="status status-pendiente">${escapeHtml(missingLabel)}</span>`
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
        chipHtml: `<span class="status status-pendiente">${escapeHtml(label)}</span>`
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
      .sort((a, b) => parseNum(a.info.minutes) - parseNum(b.info.minutes))[0];
    if (upcoming) {
      return {
        tone: "scheduled",
        trip: upcoming.trip,
        detail: `Reservado · inicia en ${upcoming.info.minutes} min`
      };
    }
    return { tone: "available", detail: "Sin cruce horario activo", trip: driverTrips[0] || null };
  })();
  const availabilityTag =
    occupancy.tone === "offline"
      ? '<span class="status status-fleet-offline">No disponible</span>'
      : occupancy.tone === "busy"
        ? '<span class="status status-fleet-ocupado">Ocupado</span>'
        : occupancy.tone === "scheduled"
          ? '<span class="status status-fleet-programado">Reservado</span>'
          : '<span class="status status-fleet-disponible">Disponible</span>';
  const comparendos = Math.max(0, parseNum(d.comparendos || 0));
  const comparendosTag =
    comparendos > 0
      ? `<span class="driver-doc-pill driver-doc-pill--warning">${comparendos} comparendo${comparendos === 1 ? "" : "s"}</span>`
      : "";
  const phoneDisp = d.phone ? formatPortalPhoneForDisplay(String(d.phone)) : "";
  const rawPhone = String(d.phone || "").trim();
  const telDigits = rawPhone.replace(/\D/g, "");
  const telHref = telDigits.length >= 6 ? `tel:${telDigits}` : "";
  const phoneValue = phoneDisp ? escapeHtml(phoneDisp) : `<span class="muted">Sin teléfono</span>`;
  const phoneBlock = telHref
    ? portalDetailTileMarkup(IC.phone, "Teléfono", phoneValue, { href: telHref })
    : portalDetailTileMarkup(IC.phone, "Teléfono", phoneValue, { muted: !phoneDisp });
  const companyValue = companyName ? escapeHtml(companyName) : `<span class="muted">Sin empresa</span>`;
  const companyBlock = portalDetailTileMarkup(IC.briefcase, "Empresa", companyValue, { muted: !companyName });
  const licenseBlock = portalDetailTileMarkup(
    IC.file,
    "Licencia",
    escapeHtml(`${String(d.license || "Sin licencia")} · ${String(d.licenseCategory || "Sin categoría")}`),
    { muted: !d.license }
  );
  const emergencyValue = String(d.emergencyPhone || "").trim()
    ? escapeHtml(String(d.emergencyPhone || "").trim())
    : `<span class="muted">Sin teléfono</span>`;
  const emergencyBlock = portalDetailTileMarkup(IC.heart, "Emergencia", emergencyValue, {
    muted: !String(d.emergencyPhone || "").trim()
  });
  const tripTitle = occupancy.trip
    ? `Viaje ${escapeHtml(String(occupancy.trip.trip?.tripNumber || "-"))}`
    : occupancy.tone === "offline"
      ? "Fuera de operación"
      : "Disponible para asignación";
  const tripSub = occupancy.trip
    ? `${escapeHtml(String(occupancy.trip.clientName || occupancy.trip.companyName || "-"))} · ${escapeHtml(String(occupancy.detail || ""))}`
    : escapeHtml(String(occupancy.detail || "Sin viaje activo"));
  const sections = [
    {
      icon: "user",
      title: "Datos personales",
      rows: portalDetailRenderRows([
        ["Nombre", `<strong>${escapeHtml(String(d.name || "-"))}</strong>`],
        ["Documento", escapeHtml(String(d.idDoc || "-"))],
        ["Teléfono", escapeHtml(String(d.phone || "-"))],
        ["Tipo de sangre", escapeHtml(String(d.bloodType || "-"))],
        ["Contacto emergencia", escapeHtml(String(d.emergencyContact || "-"))],
        ["Tel. emergencia", escapeHtml(String(d.emergencyPhone || "-"))],
        ["Empresa", escapeHtml(String(companyName || "-"))]
      ])
    },
    {
      icon: "file",
      title: "Licencia y formación",
      rows: portalDetailRenderRows([
        ["N° licencia", escapeHtml(String(d.license || "-"))],
        ["Categoría", escapeHtml(String(d.licenseCategory || "-"))],
        ["Vence licencia", `${fmtDateOr(d.licenseExpiry)} ${licenseMeta.chipHtml}`],
        ["Examen ocupacional", fmtDateOr(d.occupationalExamDate)],
        ["Vence examen ocupacional", fmtDateOr(d.occupationalExamExpiry)],
        ["Examen instruvial", fmtDateOr(d.instruvialExamDate)],
        ["Vence examen instruvial", fmtDateOr(d.instruvialExamExpiry)],
        ["Curso defensivo", `${escapeHtml(String(d.defensiveCourse || "-"))} ${courseMeta.chipHtml}`],
        ["Vence curso defensivo", fmtDateOr(d.defensiveCourseExpiry)],
        ["Años experiencia", String(parseNum(d.experienceYears || 0))]
      ])
    },
    {
      icon: "shield",
      title: "Seguridad social y disciplina",
      rows: portalDetailRenderRows([
        ["EPS", escapeHtml(String(d.eps || "-"))],
        ["ARL", escapeHtml(String(d.arl || "-"))],
        ["Comparendos pendientes", String(parseNum(d.comparendos || 0))],
        ["Estado operativo", availabilityTag],
        ["Última actualización", fmtDateOr(d.updatedAt || d.createdAt)]
      ])
    }
  ];
  const heroHtml = `<div class="portal-detail-hero">
    ${avatarHero}
    <div class="portal-detail-hero-main">
      <p class="portal-detail-eyebrow">${IC.user} Conductor operativo</p>
      <div class="portal-detail-badges">${availabilityTag} ${licenseMeta.chipHtml} ${comparendosTag}</div>
      <p class="portal-detail-meta"><span class="muted">Documento</span> <strong>${escapeHtml(String(d.idDoc || "Sin documento"))}</strong></p>
      <ul class="portal-detail-stats" aria-label="Resumen">
        <li><strong>${companyName ? escapeHtml(companyName) : "—"}</strong><span>Empresa</span></li>
        <li><strong>${escapeHtml(String(d.licenseCategory || "—"))}</strong><span>Categoría</span></li>
        <li><strong>${escapeHtml(`${parseNum(d.experienceYears || 0)} año${parseNum(d.experienceYears || 0) === 1 ? "" : "s"}`)}</strong><span>Experiencia</span></li>
      </ul>
    </div>
  </div>`;
  const highlightHtml = portalDetailHighlightHtml(
    "Operación actual",
    `<p class="portal-detail-loc-line"><strong>${tripTitle}</strong></p><p class="portal-detail-loc-sub muted">${IC.clock} ${tripSub}</p>`,
    "truck"
  );
  openPortalDetailSheet({
    title: `Conductor ${String(d.name || "")}`,
    subtitle: `${String(d.licenseCategory || "")} · ${String(d.idDoc || "")}`,
    heroHtml,
    tilesHtml: `${phoneBlock}${companyBlock}${licenseBlock}${emergencyBlock}`,
    highlightHtml,
    sectionsHtml: portalDetailBuildGrid(sections),
    secondaryActionsHtml: isAdminActor()
      ? `<button type="button" class="btn btn-action" data-driver-sheet-action="edit">${IC.edit} Editar conductor</button>`
      : "",
    afterMount: (contentEl) => {
      contentEl.querySelector("[data-driver-sheet-action='edit']")?.addEventListener("click", () => {
        document.getElementById("crud-modal")?.classList.add("hidden");
        nodes.viewRoot?.querySelector(`[data-action='edit-driver'][data-id="${escapeAttr(String(d.id || ""))}"]`)?.click();
      });
    }
  });
}

function togglePortalDriverManualAvailability(driverId) {
  const target = findPortalDriverById(driverId);
  if (!target) {
    notify("No se encontró el conductor. Actualice la página.", "error");
    return;
  }
  if (target.autoBusy) {
    notify(
      "Este conductor está en un viaje activo. La disponibilidad se ajustará al finalizar el viaje.",
      "info"
    );
    return;
  }
  const name = String(target.name || "Conductor").trim();
  const markingUnavailable = !isManuallyUnavailable(target);
  openConfirmModal({
    title: "Cambiar disponibilidad",
    message: markingUnavailable
      ? `¿Marcar a ${name} como no disponible manualmente? No se ofrecerá en asignaciones hasta reactivarlo.`
      : `¿Marcar a ${name} como disponible nuevamente?`,
    confirmText: markingUnavailable ? "Marcar no disponible" : "Marcar disponible",
    onConfirm: async () => {
      try {
        const ok = await setDriverAvailability(target.id, !markingUnavailable);
        if (!ok) {
          notify("No fue posible actualizar la disponibilidad.", "error");
          return;
        }
        notify(
          markingUnavailable ? `${name} marcado como no disponible.` : `${name} marcado como disponible.`,
          "success"
        );
        renderPortalView();
      } catch (err) {
        notify(String(err?.message || "No fue posible actualizar la disponibilidad."), "error");
      }
    }
  });
}


function approveRequest(
  requestId,
  actorName = "Sistema",
  auto = false,
  selectedVehicleId = "",
  selectedDriverId = "",
  selectedTripValue = null,
  options = {}
) {
  const requests = reqRead();
  const current = requests.find((r) => r.id === requestId);
  const canAssignTrip = current && [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(current.status);
  if (!current || !canAssignTrip) return false;
  if (!auto && !isRequestPickupSameDayOrFuture(current)) {
    notify(userMessage("assignPastRequestDate"), "error");
    return false;
  }

  if (auto) {
    const systemTimerApprove = String(actorName || "").trim() === "Sistema";
    const mapped = requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: STATUS.APROBADA_PENDIENTE_ASIGNACION,
            approvedAt: nowIso(),
            approvedBy: actorName,
            autoApproved: systemTimerApprove,
            rejectionReason: ""
          }
        : r
    );
    void (async () => {
      try {
        await reqWriteAwait(mapped);
      } catch (err) {
        if (typeof notify === "function") {
          notify(
            String(err?.message || "No fue posible guardar la aprobación en el servidor."),
            "error"
          );
        }
        return;
      }
      const targetUser = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
      if (targetUser) {
        saveNotification({
          userId: targetUser.id,
          title: systemTimerApprove ? "Solicitud aprobada automáticamente" : "Solicitud aprobada",
          body: systemTimerApprove
            ? `Su solicitud ${current.requestNumber || current.id} fue aprobada por el tiempo de respuesta configurado y queda pendiente de asignación de viaje.`
            : `Su solicitud ${current.requestNumber || current.id} fue aprobada y queda pendiente de asignación de viaje.`
        });
        try {
          await writeNotificationsAwaitServer();
        } catch (_e) {}
      }
    })();
    return true;
  }

  const allowApproveAndAssign = Boolean(options.allowApproveAndAssign);
  if (current.status === STATUS.PENDIENTE && !allowApproveAndAssign) {
    notify(userMessage("requestMustBeApprovedBeforeAssign"), "error");
    return false;
  }
  const actor = currentUser();
  if (
    actor &&
    !allowApproveAndAssign &&
    !canViewAllTransportRequests(actor) &&
    !transportRequestBelongsToUserScope(current, actor)
  ) {
    notify(userMessage("requestAssignOutOfScope"), "error");
    return false;
  }

  const compatibleVehicles = getCompatibleVehiclesForRequest(current, requestId);
  const compatibleDrivers = getCompatibleDriversForRequest(current, requestId);

  const schedPickup = requestSchedulingPickupIso(current);
  const schedDelivery = requestSchedulingDeliveryIso(current);
  const vehicle = selectedVehicleId
    ? compatibleVehicles.find((item) => item.id === selectedVehicleId) || null
    : selectBestVehicle(
      parseNum(current.weightKg),
      schedPickup,
      schedDelivery,
      requestId,
      { requiresRefrigeration: requestRequiresTermoking(current), request: current }
    );
  const driver = selectedDriverId
    ? compatibleDrivers.find((item) => item.id === selectedDriverId) || null
    : selectDriver(schedPickup, schedDelivery, requestId);

  if (!vehicle || !driver) {
    const vid = String(selectedVehicleId || "").trim();
    const did = String(selectedDriverId || "").trim();
    const vplate = vid
      ? String(read(KEYS.vehicles, []).find((v) => v.id === vid)?.plate || "").trim().toUpperCase()
      : "";
    const dname = did
      ? String(read(KEYS.drivers, []).find((d) => d.id === did)?.name || "")
          .trim()
          .toLowerCase()
      : "";
    if (
      notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "vehículo", (t) => {
        if (vid && t.vehicleId) return String(t.vehicleId).trim() === vid;
        if (vplate) return String(t.vehiclePlate || "").trim().toUpperCase() === vplate;
        return false;
      })
    ) {
      return false;
    }
    if (
      notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "conductor", (t) => {
        if (did && t.driverId) return String(t.driverId).trim() === did;
        if (dname) return String(t.driverName || "").trim().toLowerCase() === dname;
        return false;
      })
    ) {
      return false;
    }
    notify(userMessage("noCompatibleResources"), "error");
    return false;
  }

  const usedTripNumbers = new Set(
    requests.map((request) => String(request.trip?.tripNumber || "").trim()).filter(Boolean)
  );
  invalidateTransportScheduleBusyCache();
  const trip = {
    id: newUuidV4(),
    tripNumber: makeTripNumber(usedTripNumbers),
    vehicleId: vehicle.id,
    vehiclePlate: vehicle ? vehicle.plate : "SIN-DISP",
    vehicleType: vehicle ? vehicle.type : "Por definir",
    driverId: driver.id,
    driverName: driver ? driver.name : "Por definir",
    driverPhone: driver ? driver.phone : "-",
    route: formatRoute(current),
    etaPickup: schedPickup || current.pickupAt || "",
    etaDelivery: schedDelivery || current.etaDelivery || current.pickupAt || "",
    assignedBy: actorName,
    assignedAt: nowLocalIso(),
    realtimeStatus: STATUS.VIAJE_ASIGNADO,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  const next = requests.map((r) =>
    r.id === requestId
      ? {
          ...r,
          tripValue: parseNum(selectedTripValue ?? r.tripValue),
          status: STATUS.VIAJE_ASIGNADO,
          approvedAt: nowLocalIso(),
          approvedBy: actorName,
          autoApproved: auto,
          rejectionReason: "",
          trip
        }
      : r
  );
  void (async () => {
    try {
      await reqWriteAwait(next);
    } catch (_e) {}

    const users = read(KEYS.users, []);
    const target = users.find((u) => u.id === current.clientUserId);
    if (target) {
      saveNotification({
        userId: target.id,
        title: "Viaje asignado",
        body: `Se asignó el viaje ${trip.tripNumber} a su solicitud ${current.requestNumber || current.id}. Vehículo ${trip.vehiclePlate} · Conductor ${trip.driverName}.`
      });
      sendEmail({
        to: target.email,
        subject: "Viaje asignado - Antares",
        body: `Viaje ${trip.tripNumber} · Vehículo ${trip.vehiclePlate} · Conductor ${trip.driverName}`
      });
      try {
        await writeNotificationsAwaitServer();
        await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
      } catch (_e) {}
    }
  })();
  return true;
}

async function rejectRequest(requestId, reason, actorName) {
  const requests = reqRead();
  const current = requests.find((r) => r.id === requestId);
  if (!current) return;
  const next = requests.map((r) =>
    r.id === requestId
      ? { ...r, status: STATUS.RECHAZADA, approvedAt: nowIso(), approvedBy: actorName, rejectionReason: reason }
      : r
  );
  await reqWriteAwait(next);

  const user = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
  if (user) {
    saveNotification({ userId: user.id, title: "Solicitud rechazada", body: `Su solicitud fue rechazada. Motivo: ${reason}` });
    sendEmail({ to: user.email, subject: "Solicitud rechazada", body: reason });
    try {
      await writeNotificationsAwaitServer();
      await writeAwaitServer(KEYS.emails, read(KEYS.emails, []));
    } catch (_e) {}
  }
}

function updateAutoApprove() {
  return window.AntaresViajesDomain.runPendingTransportAutoApprove(approveRequest, { PENDIENTE: STATUS.PENDIENTE });
}

function minutesRemaining(createdAt) {
  const left = AUTO_APPROVE_MINUTES - diffMinutes(createdAt);
  return Math.max(0, Math.ceil(left));
}

function formatPortalRoleLabel(role) {
  const r = String(role || "").toLowerCase();
  if (r === ROLES.ADMIN) return "Administrador";
  if (r === ROLES.CLIENT) return "Cliente";
  if (r === ROLES.RRHH) return "Recursos humanos";
  if (r === ROLES.ADMINISTRACION) return "Administración";
  if (r === ROLES.AUXILIAR_ADMINISTRATIVO) return "Auxiliar administrativo";
  if (r === ROLES.LIDER_ADMINISTRATIVO) return "Líder administrativo";
  if (r === ROLES.LOGISTICA) return "Logística";
  return String(role || "usuario").toUpperCase();
}

/** Documento/NIT mostrado en UI (bootstrap expone `taxId`, `personalDoc` o legado `idDoc`). */
function portalUserDocumentValue(user) {
  if (!user) return "";
  return String(user.taxId || user.personalDoc || user.personalTaxId || user.idDoc || "").trim();
}

/** Nombre de empresa para tarjetas y Mi perfil. */
function portalUserCompanyDisplay(user) {
  if (!user) return "-";
  const cid = String(user.companyId || "").trim();
  if (cid) {
    const fromCatalog = String(getCompanyById(cid)?.name || "").trim();
    if (fromCatalog) return fromCatalog;
  }
  const fromUser = String(user.company || "").trim();
  return fromUser || "-";
}

function portalProfileEmergencyFilled(user) {
  return Boolean(
    String(user?.emergencyContact || "").trim() && String(user?.emergencyPhone || "").trim()
  );
}

/** Falta algún dato de emergencia (nombre, teléfono o parentesco). */
function portalProfileEmergencyNeedsEnrichment(user) {
  if (!user) return true;
  return (
    !String(user.emergencyContact || "").trim() ||
    !String(user.emergencyPhone || "").trim() ||
    !String(user.emergencyRelationship || user.emergencyRelation || "").trim()
  );
}

function portalProfileEnrichmentChanged(before, after) {
  if (!after?.id) return false;
  const keys = [
    "emergencyContact",
    "emergencyPhone",
    "emergencyRelation",
    "emergencyRelationship",
    "phone",
    "birthDate",
    "city",
    "department"
  ];
  return keys.some(
    (k) => !String(before?.[k] ?? "").trim() && String(after?.[k] ?? "").trim()
  );
}

function portalUserPayrollMatchKey(user, employee) {
  const doc = portalUserDocumentValue(user).replace(/\D/g, "");
  const eDoc = String(employee?.idDoc || "").replace(/\D/g, "");
  const email = String(user?.email || "").trim().toLowerCase();
  const eMail = String(employee?.personalEmail || "").trim().toLowerCase();
  const foldName = (s) => String(s || "").trim().toUpperCase().replace(/\s+/g, " ");
  const uName = foldName(getPortalUserDisplayName(user));
  const eName = foldName(employee?.name);
  return (
    (doc.length >= 5 && eDoc === doc) ||
    (email && eMail && eMail === email) ||
    (uName.length >= 6 && eName === uName)
  );
}

/**
 * Si el usuario portal no tiene contacto de emergencia, toma los datos de su ficha en nómina
 * (documento, correo personal o nombre completo) ya cargada en caché por bootstrap.
 */
function enrichPortalUserFromPayrollCache(user) {
  if (!user || typeof user !== "object") return user;
  if (!portalProfileEmergencyNeedsEnrichment(user)) return user;

  const employees = read(KEYS.payrollEmployees, []);
  const match = employees.find((e) => portalUserPayrollMatchKey(user, e));
  if (!match) return user;

  const emergencyRelation = String(
    user.emergencyRelation || user.emergencyRelationship || match.emergencyRelation || ""
  ).trim();

  return {
    ...user,
    emergencyContact: String(user.emergencyContact || match.emergencyContact || "").trim(),
    emergencyPhone: String(user.emergencyPhone || match.emergencyPhone || "").trim(),
    emergencyRelation,
    emergencyRelationship: emergencyRelation,
    phone: String(user.phone || match.phone || "").trim(),
    birthDate: String(user.birthDate || match.birthDate || "").trim(),
    city: String(user.city || match.city || "").trim(),
    department: String(user.department || match.department || "").trim(),
    address: String(user.address || match.address || "").trim()
  };
}

/** Usuario listo para pintar Mi perfil (portal + respaldo nómina en caché). */
function resolvePortalProfileUser(user) {
  return enrichPortalUserFromPayrollCache(user);
}

/**
 * Hidrata la fila del usuario autenticado desde GET /portal/me (datos completos de BD).
 * Necesario porque el JWT y el profileSnapshot no incluyen teléfono, documento ni fechas.
 */
async function hydrateOwnProfileFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  const api = window.AntaresApi;
  if (!api?.getJson) return false;
  try {
    const me = await api.getJson("/portal/me");
    if (me && me.id) {
      upsertPortalUserRowIntoCache(enrichPortalUserFromPayrollCache(me));
      syncSessionProfileSnapshotFromCache();
      return true;
    }
  } catch (err) {
    devWarn("Portal: GET /portal/me fallo.", err?.message || err);
  }
  const cur = currentUser();
  const local = enrichPortalUserFromPayrollCache(cur);
  if (local?.id && portalProfileEnrichmentChanged(cur, local)) {
    upsertPortalUserRowIntoCache(local);
    return true;
  }
  return false;
}

/** Etiqueta breve para chips en tarjetas (cabecera estrecha); el nombre completo va en `title`. */
function formatPortalRoleChipLabel(role) {
  const r = String(role || "").toLowerCase();
  if (r === ROLES.ADMIN) return "Admin";
  if (r === ROLES.CLIENT) return "Cliente";
  if (r === ROLES.RRHH) return "RRHH";
  if (r === ROLES.ADMINISTRACION) return "Administración";
  if (r === ROLES.AUXILIAR_ADMINISTRATIVO) return "Aux. adm.";
  if (r === ROLES.LIDER_ADMINISTRATIVO) return "Líder adm.";
  if (r === ROLES.LOGISTICA) return "Logística";
  return formatPortalRoleLabel(role);
}

/** Segunda línea del bloque de sesión en el drawer: clientes ven el nombre de la empresa, no la etiqueta «Cliente». */
function getPortalSidebarSessionSubtitle(user) {
  if (!user) return "";
  if (user.role === ROLES.CLIENT) {
    const cid = String(user.companyId || "").trim();
    const fromCatalog = cid ? getCompanyById(cid)?.name : "";
    const fromUser = String(user.company || "").trim();
    const companyName = String(fromCatalog || fromUser).trim();
    return companyName || formatPortalRoleLabel(user.role);
  }
  return formatPortalRoleLabel(user.role);
}

function updatePortalSidebarSessionMeta() {
  const user = currentUser();
  const meta = nodes.sessionMeta;
  const nameEl = document.getElementById("sidebar-session-display-name");
  const avatarWrap = document.getElementById("sidebar-session-avatar-wrap");
  const avatarImg = document.getElementById("sidebar-session-avatar-img");
  const avatarInitial = document.getElementById("sidebar-session-avatar-initial");
  if (!user) {
    if (meta) meta.textContent = "";
    if (nameEl) nameEl.textContent = "Transportes Antares";
    if (avatarWrap) avatarWrap.classList.remove("has-photo");
    if (avatarImg) {
      avatarImg.removeAttribute("src");
      avatarImg.setAttribute("hidden", "");
    }
    if (avatarInitial) {
      avatarInitial.textContent = "A";
      avatarInitial.removeAttribute("hidden");
    }
    return;
  }
  const displayName = getPortalUserDisplayName(user);
  const roleLabel = getPortalSidebarSessionSubtitle(user);
  if (nameEl) nameEl.textContent = displayName;
  if (meta) meta.textContent = roleLabel;
  const avatarUrlRaw = String(user.avatarUrl || "").trim();
  const avatarCss = employeeAvatarCssUrl(user.avatarUrl);
  if (avatarWrap && avatarImg && avatarInitial) {
    if (avatarCss && avatarUrlRaw) {
      avatarImg.src = avatarUrlRaw;
      avatarImg.removeAttribute("hidden");
      avatarInitial.setAttribute("hidden", "");
      avatarWrap.classList.add("has-photo");
    } else {
      avatarImg.removeAttribute("src");
      avatarImg.setAttribute("hidden", "");
      avatarInitial.textContent = (displayName.charAt(0) || "U").toUpperCase();
      avatarInitial.removeAttribute("hidden");
      avatarWrap.classList.remove("has-photo");
    }
  }
}

/**
 * Alcance de solicitudes de transporte.
 * - Cliente: solo su empresa asignada (nunca otras); en vista individual solo sus propias solicitudes.
 * - Interno sin permiso global: solicitante o misma empresa.
 * @see `AntaresSolicitudesDomain.transportRequestBelongsToUserScope`
 */
function transportRequestBelongsToUserScope(request, user) {
  const SD = window.AntaresSolicitudesDomain;
  if (!SD || typeof SD.transportRequestBelongsToUserScope !== "function") return false;
  return SD.transportRequestBelongsToUserScope(request, user, getClientDataScope);
}

function getVisibleRequestsForUser(user) {
  const SD = window.AntaresSolicitudesDomain;
  if (!SD || typeof SD.filterVisibleTransportRequests !== "function") return [];
  const requests = reqRead();
  return SD.filterVisibleTransportRequests(requests, user, {
    getClientDataScope,
    canViewAllTransportRequests
  });
}

/**
 * Solicitudes visibles en Transporte · Viajes para asignar.
 * - Con permiso de aprobación: Pendiente o Aprobada pendiente asignación (flujo en un paso).
 * - Solo transport_trips: únicamente ya aprobadas.
 */
function pendingRequestsForTripAssignment(user) {
  const SD = window.AntaresSolicitudesDomain;
  if (!SD || typeof SD.filterPendingRequestsForTripAssignment !== "function") return [];
  const u = user || currentUser();
  const visible = getVisibleRequestsForUser(u);
  return SD.filterPendingRequestsForTripAssignment(visible, u, canApproveTransportRequests);
}

function canAssignTripFromViajesModule(request, user) {
  const SD = window.AntaresSolicitudesDomain;
  if (!SD || typeof SD.transportRequestEligibleForViajesAssignment !== "function") return false;
  return SD.transportRequestEligibleForViajesAssignment(request, user, canApproveTransportRequests);
}

function canViewAllTransportRequests(user) {
  if (!user) return false;
  if (isPortalClientUser(user)) return false;
  if (isAdminActor(user)) return true;
  const ops = [
    PERMISSIONS.TRANSPORT_TRIPS,
    PERMISSIONS.TRANSPORT_REQUESTS,
    PERMISSIONS.AUTHORIZATIONS_TRANSPORT,
    PERMISSIONS.AUTHORIZATIONS_MANAGE,
    PERMISSIONS.TRANSPORT_HISTORY,
    PERMISSIONS.TRANSPORT_CALENDAR,
    PERMISSIONS.TRANSPORT_DRIVERS,
    ...VEHICLE_GRANULAR_PERMISSIONS
  ];
  return ops.some((p) => hasPermission(user, p)) || canAccessVehiclesView(user);
}

const FLEET_DRIVER_EDIT_ACTIONS = new Set(["edit-driver", "toggle-driver"]);

function findPayrollEmployeeByIdDoc(idDoc) {
  const digits = normalizeDocumentDigits(idDoc);
  if (!digits) return null;
  return (
    read(KEYS.payrollEmployees, []).find(
      (employee) => normalizeDocumentDigits(employee?.idDoc) === digits
    ) || null
  );
}

function abortUnlessAdminForFleetDriverEdit(reason = "driversManageForbidden") {
  if (canEditFleetDriverAsAdmin()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanCreateVehicle(reason = "vehiclesManageForbidden") {
  if (canCreateVehicle()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanEditVehicle(reason = "vehiclesManageForbidden") {
  if (canEditVehicle()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanToggleVehicleStatus(reason = "vehiclesManageForbidden") {
  if (canToggleVehicleStatus()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanDeleteVehicle(reason = "vehiclesManageForbidden") {
  if (canDeleteVehicle()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function requiresAdminHrApproval(role) {
  return [
    ROLES.RRHH,
    ROLES.ADMINISTRACION,
    ROLES.AUXILIAR_ADMINISTRATIVO,
    ROLES.LIDER_ADMINISTRATIVO
  ].includes(role);
}

function isBrowserReloadNavigation() {
  if (typeof performance === "undefined") return false;
  try {
    const entry = performance.getEntriesByType("navigation")[0];
    if (entry && entry.type === "reload") return true;
  } catch (_e) {}
  try {
    if (performance.navigation && performance.navigation.type === 1) return true;
  } catch (_e2) {}
  return false;
}

function isAntaresProductionSiteHost(hostname) {
  const h = String(hostname || "").toLowerCase();
  return h === "www.transportesantares.co" || h === "transportesantares.co";
}

/**
 * Tras F5 en un módulo del portal (#portal/...), siempre abrimos el dashboard.
 * En producción la URL canónica es https://www.transportesantares.co/#portal/dashboard .
 * @returns {boolean} true si se disparó `location.replace` y debe cortarse `renderPortal`.
 */
function applyPortalDashboardOnFullReload() {
  if (!isBrowserReloadNavigation()) return false;
  const raw = String(window.location.hash || "").split("?")[0];
  if (!raw.startsWith("#portal")) return false;
  state.currentView = "dashboard";
  const canonicalOrigin = "https://www.transportesantares.co";
  try {
    const u = new URL(window.location.href);
    if (isAntaresProductionSiteHost(u.hostname)) {
      if (u.protocol === "https:" && u.hostname === "www.transportesantares.co") {
        history.replaceState(null, "", `${u.pathname}${u.search}#portal/dashboard`);
        return false;
      }
      window.location.replace(`${canonicalOrigin}/#portal/dashboard`);
      return true;
    }
  } catch (_e) {}
  history.replaceState(null, "", "#portal/dashboard");
  return false;
}

function enforcePortalViewFromUrl(user) {
  PortalRouterCore.enforceViewFromUrl({
    state,
    user,
    getViewFromHashFn: viewFromPortalHash,
    syncHashFn: syncPortalHash,
    isViewAllowed: isViewAllowedForUser,
    fallbackView: "dashboard",
    onUnauthorized: () => alert("Ruta no autorizada. Se redirigio al dashboard.")
  });
}

function renderPortal() {
  let session = getSession();
  if (!session) {
    stopSessionSecurityWatch();
    stopNotificationsPolling();
    setPortalDrawerOpen(false);
    closePublicNavDrawer();
    document.body.classList.remove("portal-mode");
    /** Quitamos el guard de booting: el usuario no tiene sesión, debe ver el sitio público. */
    document.documentElement.classList.remove("antares-booting-portal");
    nodes.publicApp.classList.remove("hidden");
    nodes.portalApp.classList.add("hidden");
    mountSessionIdlePublicNoticeIfNeeded();
    return;
  }
  const ts = Date.now();
  if (typeof session.lastActivityAt !== "number") {
    /**
     * F5 sin bump previo: la sesión existe pero le falta `lastActivityAt`. La consideramos
     * activa "ahora" para no expulsar al usuario por culpa de un timestamp ausente, y
     * persistimos el cambio para que la próxima recarga ya tenga marca consistente.
     */
    session = {
      ...session,
      lastActivityAt: ts,
      tokenIssuedAt: typeof session.tokenIssuedAt === "number" ? session.tokenIssuedAt : ts
    };
    setSession(session);
  } else if (ts - getEffectiveLastActivityAt() > SESSION_IDLE_MS) {
    /** Solo aquí cerramos sesión: > 30 min sin uso activo con la pestaña visible. */
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      /* En segundo plano no forzamos cierre; el tiempo oculto se compensa al volver a la pestaña. */
    } else {
      clearSession();
      announceSessionClosedByIdle();
      renderPortal();
      return;
    }
  }
  dismissSessionIdlePublicNotice();
  state.session = session;
  closePublicNavDrawer();
  document.body.classList.add("portal-mode");
  setPortalDrawerOpen(false);
  nodes.publicApp.classList.add("hidden");
  nodes.portalApp.classList.remove("hidden");
  /** El portal ya está en pantalla: liberamos la regla anti-flash del boot guard inline. */
  document.documentElement.classList.remove("antares-booting-portal");
  if (applyPortalDashboardOnFullReload()) return;
  const user = materializePortalUserFromSession(session);
  if (!user) {
    /**
     * Materialización falló (caso muy raro: sesión sin userId+role+snapshot). En vez de
     * expulsar al usuario, mostramos aviso y dejamos visible el portal vacío para que pueda
     * reintentar (recargar manualmente o esperar al bootstrap diferido). Cerrar sesión aquí
     * provocaba "deslogueo" al pulsar F5 cuando la API tarda en responder.
     */
    devWarn("Portal: no se pudo materializar usuario tras F5; se mantiene la sesión.");
    notify(userMessage("authProfileLoadFailed") || "Cargando perfil…", "info");
    return;
  }

  updatePortalSidebarSessionMeta();
  document.querySelectorAll(".admin-only").forEach((n) => n.classList.toggle("hidden", user.role !== ROLES.ADMIN));
  document.querySelectorAll(".client-only").forEach((n) => n.classList.toggle("hidden", user.role !== ROLES.CLIENT));
  document.querySelectorAll(".rrhh-only").forEach((n) => n.classList.toggle("hidden", !canAccessRRHH(user.role)));
  nodes.sideLinks.forEach((link) => {
    const isRoleHidden =
      (link.classList.contains("admin-only") && user.role !== ROLES.ADMIN) ||
      (link.classList.contains("client-only") && user.role !== ROLES.CLIENT) ||
      (link.classList.contains("rrhh-only") && !canAccessRRHH(user.role));
    const view = link.dataset.view;
    const allowedByPermission = isViewAllowedForUser(user, view);
    link.classList.toggle("hidden", isRoleHidden || !allowedByPermission);
  });
  document.querySelectorAll(".sidebar-section-label").forEach((label) => {
    let sibling = label.nextElementSibling;
    let hasVisibleLinks = false;
    while (sibling && !sibling.classList.contains("sidebar-section-label")) {
      if (
        sibling.matches?.(".side-link[data-view]") &&
        !sibling.classList.contains("hidden")
      ) {
        hasVisibleLinks = true;
        break;
      }
      sibling = sibling.nextElementSibling;
    }
    label.classList.toggle("hidden", !hasVisibleLinks);
  });
  renderKpis();
  /**
   * Si tras F5 caímos en stub (cache de usuarios todavía no rehidratado y permisos vacíos para no-admin),
   * no reescribimos la URL todavía: respetamos el hash original (`#portal/...`) y dejamos que
   * `__portalRefreshAfterBootstrap` re-evalúe permisos cuando la API responda. Así el usuario no
   * pierde su vista actual aunque el bootstrap esté lento o falle temporalmente.
   */
  const userPermsArr = Array.isArray(user.permissions) ? user.permissions : [];
  const hydratingStub = userPermsArr.length === 0;
  if (hydratingStub) {
    const urlView = viewFromPortalHash();
    if (urlView && PortalArch.isKnownView(urlView)) {
      state.currentView = urlView;
    }
  } else {
    enforcePortalViewFromUrl(user);
    if (!isViewAllowedForUser(user, state.currentView)) {
      state.currentView = "dashboard";
      syncPortalHash("dashboard");
    }
  }
  renderPortalView();
  updatePortalDataHydratingBanner();
  updateNotificationBadge();
  startNotificationsPolling();
  startSessionSecurityWatch();
}

let __notificationsPollHandle = null;
let __lastSeenNotificationIds = null;
/** Última vez que el poll arrastró bootstrap para traer notificaciones del servidor (otros usuarios). */
let __lastNotificationsSilentBootstrapWallMs = 0;

function stopNotificationsPolling() {
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", __onNotificationsVisibilityChange);
  }
  if (__notificationsPollHandle != null) {
    clearInterval(__notificationsPollHandle);
    __notificationsPollHandle = null;
  }
  __lastSeenNotificationIds = null;
}

function __notificationsPollIntervalMs() {
  return typeof document !== "undefined" && document.hidden ? 50000 : 8000;
}

function __onNotificationsVisibilityChange() {
  if (__notificationsPollHandle == null) return;
  clearInterval(__notificationsPollHandle);
  __notificationsPollHandle = null;
  __notificationsPollHandle = setInterval(__tickNotificationsPoll, __notificationsPollIntervalMs());
}

/**
 * Ejecuta una rutina automática del sistema (auto-aprobación, cierres por
 * timer, etc.) y marca como "ya vistas" cualquier notificación que esa
 * rutina haya generado, para que el poll de la bandeja NO las re-toaste.
 *
 * Motivación: el usuario reportó que al entrar al módulo de Solicitudes
 * salían múltiples toasts de "Solicitud aprobada automáticamente"
 * cada vez que navegaba, porque el render dispara `updateAutoApprove()`
 * y el siguiente tick del poll las leía como "nuevas". El cambio ya queda
 * reflejado en el badge de la campana y en la lista de notificaciones,
 * por lo que un toast intrusivo por cada navegación es ruido.
 */
function runAsSilentSystemNotifications(callback) {
  let result;
  try {
    const before = new Set(read(KEYS.notifications, []).map((n) => n.id));
    result = typeof callback === "function" ? callback() : undefined;
    const after = read(KEYS.notifications, []);
    let added = false;
    for (const n of after) {
      if (before.has(n.id)) continue;
      if (!__lastSeenNotificationIds) {
        __lastSeenNotificationIds = new Set(after.map((m) => m.id));
        added = true;
        break;
      }
      __lastSeenNotificationIds.add(n.id);
      added = true;
    }
    if (added) {
      try { updateNotificationBadge(); } catch (_e) {}
    }
  } catch (_err) {
    /** Si la captura de IDs falla, no bloqueamos la rutina del sistema. */
    if (typeof callback === "function" && result === undefined) {
      try { result = callback(); } catch (_e) {}
    }
  }
  return result;
}

/** Mínimo entre refrescos LIGEROS de la campana (GET /portal/notifications, sin re-descargar todo). */
const NOTIF_LIGHT_REFRESH_MIN_MS = 7000;
/**
 * Mínimo entre bootstraps COMPLETOS lanzados en segundo plano para refrescar datos operativos.
 * Antes la campana arrastraba un bootstrap completo cada ~12s (re-descargaba TODO el dataset),
 * lo que volvía lenta la plataforma. Ahora la campana usa un endpoint liviano y el bootstrap
 * completo corre con mucha menor frecuencia.
 */
const NOTIF_SILENT_BOOTSTRAP_MIN_MS = 180000;
let __lastNotificationsLightRefreshWallMs = 0;

/** Refresca solo la bandeja de notificaciones con un endpoint liviano (sin re-descargar todo). */
async function __refreshNotificationsBellIfStale() {
  if (!portalCanRefreshFromApi()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  const now = Date.now();
  if (now - __lastNotificationsLightRefreshWallMs < NOTIF_LIGHT_REFRESH_MIN_MS) return;
  __lastNotificationsLightRefreshWallMs = now;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return;
  try {
    const res = await api.getJson("/portal/notifications");
    const raw = Array.isArray(res?.notifications) ? res.notifications : [];
    const actor = currentUser();
    const filtered =
      actor && !canViewAllNotifications(actor) ? filterNotificationsForUser(actor, raw) : raw;
    const prev = read(KEYS.notifications, []);
    const merged = mergeNotificationsListPreserveReadAt(prev, filtered);
    write(KEYS.notifications, merged, { skipSyncSchedule: true });
    if (!getSession()) return;
    reconcileNotificationsCacheForSession();
    updateNotificationBadge();
    scheduleNotificationsViewRenderIfChanged();
  } catch (_e) {
    /* noop: la campana se reintenta en el próximo tick */
  }
}

/** Bootstrap completo en segundo plano (datos operativos) con baja frecuencia. */
function __silentFullBootstrapIfStale() {
  if (!portalCanRefreshFromApi()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  /** Con snapshot reciente el poll no debe re-descargar todo el portal cada minuto. */
  if (portalSnapshotIsFresh()) return;
  const now = Date.now();
  if (now - __lastNotificationsSilentBootstrapWallMs < NOTIF_SILENT_BOOTSTRAP_MIN_MS) return;
  __lastNotificationsSilentBootstrapWallMs = now;
  void applyPortalBootstrapFromApi({ skipSecondaryHydration: true }).then((ok) => {
    if (!ok || !getSession()) return;
    try {
      syncSessionProfileSnapshotFromCache();
      reconcileNotificationsCacheForSession();
      updateNotificationBadge();
      if (state.currentView === "notifications") scheduleNotificationsViewRenderIfChanged();
    } catch (_e) {
      /* noop */
    }
  });
}

function __tickNotificationsPoll() {
  const user = currentUser();
  if (!user) return;
  void __refreshNotificationsBellIfStale();
  __silentFullBootstrapIfStale();
  const current = getCurrentNotifications();
  const seen = __lastSeenNotificationIds || new Set();
  /**
   * Solo avisar en toast las notificaciones dirigidas al usuario de la sesión. Los admins ven en
   * la bandeja las de otros (p. ej. "Cuenta aprobada" para un cliente), pero no deben duplicar el
   * mensaje explícito que ya muestra la acción (Aprobar usuario, etc.).
   */
  const suppressUntil = Number(state.portalSuppressSelfPollToastUntil || 0);
  const now = Date.now();
  const selfNew = current.filter(
    (n) => !seen.has(n.id) && getNotificationRecipientId(n) === String(user.id || "")
  );
  const toToast = [];
  /** Timbre ante cualquier fila nueva para el usuario en este tick (desacoplado de la ventana de toast). */
  let toSound = false;
  /**
   * Solo se notifica en toast lo que ocurre en tiempo real (≤ 30s). Las notificaciones
   * viejas que se materializan ahora — porque vinieron del servidor en un bootstrap
   * tardío, porque la auto-aprobación cruzó su umbral en una sesión anterior o porque
   * el usuario nunca leyó la campana — siguen visibles en la bandeja, pero no se
   * vuelven a "tirar a la cara" cada vez que entra a un módulo.
   */
  const FRESH_TOAST_WINDOW_MS = 30_000;
  for (const n of selfNew) {
    const ageMs = __notificationPollAgeMs(n, now);
    const skipDuplicateExplicitSuccess = suppressUntil > now && ageMs < 6500;
    if (skipDuplicateExplicitSuccess) continue;
    toSound = true;
    if (__inboxNotificationIsFreshForPoll(n, now, FRESH_TOAST_WINDOW_MS)) {
      toToast.push(n);
    }
  }
  if (toSound) playInboxNotificationSound();
  if (toToast.length && isInAppNotificationAlertsEnabled()) {
    toToast.forEach((n) => {
      if (typeof notify === "function") {
        const message = `${n.title}${n.body ? " — " + n.body : ""}`;
        notify(message, "info");
      }
    });
  }
  if (selfNew.length) {
    __lastSeenNotificationIds = new Set(current.map((n) => n.id));
    updateNotificationBadge();
    if (state.currentView === "notifications") {
      scheduleNotificationsViewRenderIfChanged();
    }
  } else {
    updateNotificationBadge();
  }
}

function getCurrentNotifications() {
  const user = currentUser();
  if (!user) return [];
  return filterNotificationsForUser(user, read(KEYS.notifications, []));
}

function updateNotificationBadge() {
  const link = document.querySelector('.side-link[data-view="notifications"]');
  if (!link) return;
  const list = getCurrentNotifications();
  const unread = list.filter((n) => !notificationIsRead(n)).length;
  let badge = link.querySelector(".side-link-badge");
  if (unread > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "side-link-badge";
      link.appendChild(badge);
    }
    badge.textContent = unread > 99 ? "99+" : String(unread);
  } else if (badge) {
    badge.remove();
  }
  syncNotificationSoundMutedUi();
}

function startNotificationsPolling() {
  if (__notificationsPollHandle != null) return;
  ensureInboxNotificationAudioUnlocked();
  __lastSeenNotificationIds = new Set(getCurrentNotifications().map((n) => n.id));
  __lastNotificationsSilentBootstrapWallMs = Date.now();
  __notificationsPollHandle = setInterval(__tickNotificationsPoll, __notificationsPollIntervalMs());
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", __onNotificationsVisibilityChange);
  }
}

function buildHeaderKpiCardsForView(view, user) {
  return [];
}

function renderKpis() {
  if (!nodes.kpiCards) return;
  const user = currentUser();
  if (!user) {
    nodes.kpiCards.innerHTML = "";
    return;
  }
  const view = String(state.currentView || "dashboard");
  const cards = buildHeaderKpiCardsForView(view, user);
  nodes.kpiCards.innerHTML = cards.map((c) => `
    <article class="kpi">
      <div class="kpi-icon ${c.color}">${c.icon}</div>
      <div class="kpi-data"><span>${c.label}</span><b class="kpi-value">${c.value}</b></div>
    </article>
  `).join("");
}

function formatColombiaLongDate(dateValue = new Date()) {
  try {
    const raw = new Date(dateValue).toLocaleDateString("es-CO", {
      timeZone: CO_TIMEZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  } catch (_e) {
    return "";
  }
}

function fmtTimeOnly(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleTimeString("es-CO", {
      timeZone: CO_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (_e) {
    return "—";
  }
}


/** Selector de empresa en nueva solicitud: obligatorio; cliente solo su empresa; admin elige de la lista. */

function directoryToneFromBucket(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (!value) return "neutral";
  if (
    value === "expired" ||
    value === "alert" ||
    value === "critico" ||
    value === "inactive" ||
    /rechazada|vencida|offline|no-disponible/.test(value)
  ) {
    return "alert";
  }
  if (
    value === "warning" ||
    value === "warn" ||
    value === "missing" ||
    value === "busy" ||
    value === "scheduled" ||
    value === "pending" ||
    /pendiente|ocupado|reservado/.test(value)
  ) {
    return "warn";
  }
  return "ok";
}

function directoryChipHtml(label, value, tone = "neutral", title = "") {
  const safeValue = String(value ?? "").trim() || "Sin dato";
  const toneClass = tone && tone !== "neutral" ? ` directory-chip--${escapeAttr(tone)}` : "";
  const titleAttr = String(title || "").trim() ? ` title="${escapeAttr(String(title).trim())}"` : "";
  return `<span class="directory-chip${toneClass}"><small>${escapeHtml(label)}</small><strong${titleAttr}>${escapeHtml(safeValue)}</strong></span>`;
}

function directoryFactHtml(label, value, opts = {}) {
  const toneClass = opts.tone ? ` directory-card__fact--${escapeAttr(opts.tone)}` : "";
  const content = opts.raw ? (value || '<span class="muted">Sin dato</span>') : escapeHtml(String(value ?? "").trim() || "Sin dato");
  return `<div class="directory-card__fact${toneClass}"><dt>${escapeHtml(label)}</dt><dd>${content}</dd></div>`;
}

function directoryPillHtml(label, tone = "neutral") {
  const toneClass = tone && tone !== "neutral" ? ` directory-pill--${escapeAttr(tone)}` : "";
  return `<span class="directory-pill${toneClass}">${escapeHtml(String(label ?? "").trim() || "Sin dato")}</span>`;
}

function directoryOpsHtml(headline, detail = "", tone = "neutral") {
  const title = String(headline ?? "").trim() || "—";
  const meta = String(detail ?? "").trim();
  const toneClass = tone && tone !== "neutral" ? ` directory-card__ops--${escapeAttr(tone)}` : "";
  const detailHtml = meta
    ? `<span class="directory-card__ops-detail">${escapeHtml(meta)}</span>`
    : "";
  return `<div class="directory-card__ops${toneClass}"><span class="directory-card__ops-dot" aria-hidden="true"></span><div class="directory-card__ops-body"><strong>${escapeHtml(title)}</strong>${detailHtml}</div></div>`;
}

function directoryOpsToneFromSlug(slug) {
  const key = String(slug || "").trim().toLowerCase();
  if (["busy", "ocupado", "scheduled", "reservado", "pending", "warn", "warning"].includes(key)) return "warn";
  if (["offline", "no-disponible", "inactive", "expired", "alert", "fail"].includes(key)) return "alert";
  if (["available", "disponible", "ok", "active"].includes(key)) return "ok";
  return "neutral";
}

function summarizePayrollEmployeeForDirectory(emp) {
  const raw = normalizePayrollEmployeeRowDates(emp || {});
  const contract = computeEmployeeContractRenewalMeta(raw);
  const companyName = getCompanyById(raw.companyId)?.name || "Sin empresa";
  const isDriverSvc = employeeIsConductorServiceProvider(raw);
  const roleLabel = isDriverSvc
    ? "Conductor · prestación servicios"
    : String(raw.workerRole || "").toLowerCase() === "conductor"
      ? "Conductor"
      : "Empleado";
  const searchBlob = [
    raw.name,
    raw.idDoc,
    raw.position,
    raw.contractType,
    raw.costCenter,
    companyName,
    roleLabel
  ]
    .map((v) => String(v || "").toLowerCase())
    .join(" ");
  return {
    raw,
    contract,
    companyName,
    roleLabel,
    isDriverSvc,
    searchBlob,
    transportCop: readEmployeeTransportAllowanceCop(raw),
    salaryCop: parseNum(raw.baseSalary)
  };
}

function renderPayrollEmployeeDirectoryCard(item, hrAdminDeletes, { compact = false } = {}) {
  const e = item.raw;
  const contract = item.contract;
  const avCss = employeeAvatarCssUrl(e.avatarUrl);
  const initials = String(e.name || "E")
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
  const avatarInner = avCss ? `<img src="${escapeAttr(e.avatarUrl)}" alt="" loading="lazy" />` : initials;
  const avatarClass = avCss
    ? "directory-card__avatar directory-card__avatar--photo"
    : "directory-card__avatar";
  const statusSlug = contract.applies ? contract.statusSlug : "indefinite";
  const opsTone = directoryOpsToneFromSlug(
    contract.statusSlug === "notice_window" || contract.statusSlug === "expired"
      ? "alert"
      : contract.statusSlug === "unknown"
        ? "warn"
        : "ok"
  );
  const contractPillTone =
    contract.pillTone === "alert" ? "alert" : contract.pillTone === "warn" ? "warn" : "ok";
  const contractOps =
    contract.applies && contract.headline
      ? directoryOpsHtml(contract.headline, contract.detail, opsTone)
      : directoryOpsHtml(
          String(e.contractType || "Contrato"),
          e.contractDuration ? `Plazo: ${e.contractDuration}` : "Sin plazo definido",
          "neutral"
        );
  const selectHtml = hrAdminDeletes
    ? `<label class="directory-card__select" title="Seleccionar para eliminación masiva"><input type="checkbox" data-employee-select value="${escapeAttr(String(e.id))}" /><span class="muted">Sel.</span></label>`
    : "";
  const docLine = `${String(e.documentType || "").trim()} ${String(e.idDoc || "").trim()}`.trim() || "—";
  const showContractAlert =
    compact &&
    contract.applies &&
    (contract.statusSlug === "notice_window" || contract.statusSlug === "expired");
  const compactClass = compact ? " directory-card--compact" : "";
  if (compact) {
    const contractBlock = showContractAlert ? contractOps : "";
    return `<article class="directory-card directory-card--employee directory-card--compact directory-card--contract-${escapeAttr(statusSlug)}${compactClass}" data-employee-id="${escapeAttr(String(e.id || ""))}" data-employee-search="${escapeAttr(item.searchBlob)}" data-employee-contract-filter="${escapeAttr(contract.applies ? contract.statusSlug : "all")}">
    <div class="directory-card__compact-row">
      <div class="${avatarClass}">${avatarInner}</div>
      <div class="directory-card__compact-main">
        <h4 class="directory-card__title">${escapeHtml(String(e.name || "Colaborador"))}</h4>
        <p class="directory-card__subline muted">${escapeHtml(item.roleLabel)} · ${escapeHtml(docLine)}</p>
      </div>
      <div class="directory-card__compact-meta">
        ${contract.applies ? directoryPillHtml(contract.pillLabel, contractPillTone) : ""}
        <span class="directory-card__salary">$${item.salaryCop.toLocaleString("es-CO")}</span>
      </div>
      <div class="directory-card__compact-actions toolbar">
        <button type="button" class="btn btn-sm btn-outline" data-action="view-employee" data-id="${escapeAttr(String(e.id))}" title="Perfil">${IC.eye}</button>
        <button type="button" class="btn btn-sm btn-action" data-action="edit-employee" data-id="${escapeAttr(String(e.id))}" title="Editar">${IC.edit}</button>
        <button type="button" class="btn btn-sm btn-outline" data-action="employee-generate-contract" data-id="${escapeAttr(String(e.id))}" title="Generar o descargar contrato Word">${IC.download}</button>
        ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-employee" data-id="${escapeAttr(String(e.id))}" title="Eliminar">${IC.trash}</button>` : ""}
        ${selectHtml}
      </div>
    </div>
    ${contractBlock}
  </article>`;
  }
  return `<article class="directory-card directory-card--employee directory-card--contract-${escapeAttr(statusSlug)}" data-employee-id="${escapeAttr(String(e.id || ""))}" data-employee-search="${escapeAttr(item.searchBlob)}" data-employee-contract-filter="${escapeAttr(contract.applies ? contract.statusSlug : "all")}">
    <header class="directory-card__head">
      <div class="directory-card__identity">
        <div class="${avatarClass}">${avatarInner}</div>
        <div class="directory-card__heading">
          <p class="directory-card__kicker">${escapeHtml(item.companyName)} · ${escapeHtml(item.roleLabel)}</p>
          <h4 class="directory-card__title">${escapeHtml(String(e.name || "Colaborador"))}</h4>
        </div>
      </div>
      <div class="directory-card__status-stack">
        ${item.isDriverSvc ? directoryPillHtml("Prestación servicios", "warn") : ""}
        ${contract.applies ? directoryPillHtml(contract.pillLabel, contractPillTone) : directoryPillHtml(String(e.contractType || "Contrato").slice(0, 24), "neutral")}
        ${selectHtml}
      </div>
    </header>
    ${contractOps}
    <div class="directory-card__metrics">
      ${directoryChipHtml("Salario", `$${item.salaryCop.toLocaleString("es-CO")}`)}
      ${directoryChipHtml("Aux. legal", `$${item.transportCop.toLocaleString("es-CO")}`)}
      ${directoryChipHtml("Ingreso", fmtDateOr(e.startDate, "—"))}
      ${directoryChipHtml("Fin contrato", contract.applies ? fmtDateOr(contract.endYmd, "—") : "N/A", contract.statusSlug === "notice_window" ? "warn" : "neutral")}
    </div>
    <dl class="directory-card__facts">
      ${directoryFactHtml("Documento", docLine)}
      ${directoryFactHtml("Cargo", String(e.position || "—"))}
      ${directoryFactHtml("Centro costos", String(resolvePayrollEmployeeCostCenter(e) || "—"))}
      ${directoryFactHtml("Tipo contrato", String(e.contractType || "—"))}
      ${contract.applies && contract.noticeDeadlineYmd ? directoryFactHtml("Aviso no renovación", fmtDateOr(contract.noticeDeadlineYmd), { tone: contract.statusSlug === "notice_window" ? "warn" : "neutral" }) : ""}
    </dl>
    <footer class="directory-card__actions">
      <button type="button" class="btn btn-sm btn-outline" data-action="view-employee" data-id="${escapeAttr(String(e.id))}">${IC.eye} Perfil</button>
      <button type="button" class="btn btn-sm btn-action" data-action="edit-employee" data-id="${escapeAttr(String(e.id))}">${IC.edit} Editar</button>
      <button type="button" class="btn btn-sm btn-outline" data-action="employee-generate-contract" data-id="${escapeAttr(String(e.id))}">${IC.file} Contrato</button>
      ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-employee" data-id="${escapeAttr(String(e.id))}" title="Solo administradores">${IC.trash}</button>` : ""}
    </footer>
  </article>`;
}

function wirePayrollEmployeeDirectoryFilters() {
  const searchEl = document.getElementById("payroll-employee-search");
  const filterEl = document.getElementById("payroll-employee-contract-filter");
  const cards = [...document.querySelectorAll(".directory-card--employee")];
  if (!cards.length) return;
  const apply = () => {
    const q = String(searchEl?.value || "")
      .trim()
      .toLowerCase();
    const cf = String(filterEl?.value || "all");
    cards.forEach((card) => {
      const blob = String(card.getAttribute("data-employee-search") || "");
      const slug = String(card.getAttribute("data-employee-contract-filter") || "all");
      const matchQ = !q || blob.includes(q);
      const matchC = cf === "all" || slug === cf;
      card.classList.toggle("is-filtered-out", !(matchQ && matchC));
    });
  };
  searchEl?.addEventListener("input", apply);
  filterEl?.addEventListener("change", apply);
  apply();
}


function historyHaystack(request) {
  return `${request.requestNumber || request.id || ""} ${request.clientName || ""} ${formatRoute(request)} ${historyVehicleColumn(request)} ${historyDriverLabel(request)} ${historyPlateLabel(request)} ${request.trip?.tripNumber || ""} ${request.serviceType || ""}`
    .toLowerCase();
}

function historyDriverLabel(request) {
  const direct = String(request?.trip?.driverName || "").trim();
  if (direct) return direct;
  const id = String(request?.trip?.driverId || "").trim();
  if (!id) return "";
  const driver = read(KEYS.drivers, []).find((d) => String(d.id) === id);
  return String(driver?.name || "").trim();
}

function historyPlateLabel(request) {
  return String(request?.trip?.vehiclePlate || "").trim();
}

function historyTripValueCell(request) {
  const value = parseNum(request?.trip?.tripValue ?? request?.tripValue ?? 0);
  if (value <= 0) return '<span class="muted">—</span>';
  return `<span class="history-money">$${value.toLocaleString("es-CO")}</span>`;
}

function historyRouteCell(request) {
  const origin = String(request?.originCity || "").trim() || "—";
  const dest = String(request?.destinationCity || "").trim() || "—";
  const full = formatRoute(request);
  return `<span class="history-route" title="${escapeAttr(full)}"><span class="history-route-cities">${escapeHtml(origin)}</span><span class="history-route-arrow" aria-hidden="true">→</span><span class="history-route-cities">${escapeHtml(dest)}</span></span>`;
}

function historyStatusFilterOptions() {
  const groups = [
    { label: "En gestión", values: [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION] },
    { label: "En operación", values: [STATUS.VIAJE_ASIGNADO, STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY] },
    { label: "Cerradas", values: [STATUS.COMPLETADA, STATUS.CERRADA] },
    { label: "Anuladas", values: [STATUS.CANCELADA, STATUS.RECHAZADA] }
  ];
  let html = '<option value="">Todos los estados</option>';
  groups.forEach((group) => {
    html += `<optgroup label="${escapeAttr(group.label)}">`;
    group.values.forEach((status) => {
      html += `<option value="${escapeAttr(status)}">${escapeHtml(status)}</option>`;
    });
    html += "</optgroup>";
  });
  return html;
}

function sortHistoryRequests(items) {
  return [...items].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

function historyMatchesQuickFilter(request, filterKey) {
  const key = String(filterKey || "all");
  if (key === "closed") return [STATUS.COMPLETADA, STATUS.CERRADA].includes(request.status);
  if (key === "active") return Boolean(request.trip) && tripRequestStatusIsOperational(request.status);
  if (key === "pending") {
    return !request.trip && [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(request.status);
  }
  if (key === "cancelled") return [STATUS.CANCELADA, STATUS.RECHAZADA].includes(request.status);
  return true;
}

function applyHistoryFilters(items, opts = {}) {
  let out = [...items];
  const quickFilter = String(opts.quickFilter || "all");
  if (quickFilter !== "all") out = out.filter((r) => historyMatchesQuickFilter(r, quickFilter));
  const data = opts.formData || {};
  if (data.client) out = out.filter((i) => i.clientUserId === data.client);
  if (data.status) out = out.filter((i) => i.status === data.status);
  if (data.from) out = out.filter((i) => new Date(i.createdAt) >= new Date(`${data.from}T00:00`));
  if (data.to) out = out.filter((i) => new Date(i.createdAt) <= new Date(`${data.to}T23:59`));
  const q = String(data.q || "").trim().toLowerCase();
  if (q) out = out.filter((i) => historyHaystack(i).includes(q));
  return sortHistoryRequests(out);
}

function historyQuickFilterCounts(all) {
  return {
    all: all.length,
    closed: all.filter((r) => historyMatchesQuickFilter(r, "closed")).length,
    active: all.filter((r) => historyMatchesQuickFilter(r, "active")).length,
    pending: all.filter((r) => historyMatchesQuickFilter(r, "pending")).length,
    cancelled: all.filter((r) => historyMatchesQuickFilter(r, "cancelled")).length
  };
}

function renderHistoryCard(request) {
  const statusSlug = slugStatus(request.status);
  const number = String(request.requestNumber || request.id || "").trim();
  const client = String(request.clientName || "").trim() || "—";
  const origin = String(request.originCity || "").trim() || "—";
  const dest = String(request.destinationCity || "").trim() || "—";
  const driver = historyDriverLabel(request);
  const plate = historyPlateLabel(request);
  const fleet = historyVehicleColumn(request);
  const trip = String(request.trip?.tripNumber || "").trim();
  const tripValue = parseNum(request.trip?.tripValue ?? request.tripValue ?? 0);
  const valueLabel =
    tripValue > 0 ? `$${tripValue.toLocaleString("es-CO")}` : "—";
  const created = fmtDate(request.createdAt);
  const pickup = fmtDate(request.pickupAt);
  return `<article class="history-card history-card--${escapeAttr(statusSlug)}" data-history-row data-id="${escapeAttr(String(request.id || ""))}" data-haystack="${escapeAttr(historyHaystack(request))}">
    <header class="history-card-head">
      <div class="history-card-head-main">
        <p class="history-card-kicker"><time datetime="${escapeAttr(String(request.createdAt || ""))}">${escapeHtml(created)}</time> · Recogida ${escapeHtml(pickup)}</p>
        <h3 class="history-card-title">${escapeHtml(number)}</h3>
        <p class="history-card-client">${escapeHtml(client)}</p>
      </div>
      <div class="history-card-status">${prettyStatus(request.status)}</div>
    </header>
    <div class="history-card-route" title="${escapeAttr(formatRoute(request))}">
      <span class="history-card-route-node"><span class="history-card-route-label">Origen</span><strong>${escapeHtml(origin)}</strong></span>
      <span class="history-card-route-arrow" aria-hidden="true">→</span>
      <span class="history-card-route-node"><span class="history-card-route-label">Destino</span><strong>${escapeHtml(dest)}</strong></span>
    </div>
    <dl class="history-card-meta">
      <div><dt>${IC.user}<span>Conductor</span></dt><dd>${driver ? escapeHtml(driver) : '<span class="muted">Sin asignar</span>'}</dd></div>
      <div><dt>${IC.truck}<span>Placa</span></dt><dd>${plate ? `<span class="history-plate">${escapeHtml(plate)}</span>` : '<span class="muted">—</span>'}</dd></div>
      <div><dt>${IC.compass}<span>Viaje</span></dt><dd>${trip ? escapeHtml(trip) : '<span class="muted">—</span>'}</dd></div>
      <div class="history-card-meta--value"><dt>${IC.dollar}<span>Tarifa</span></dt><dd>${escapeHtml(valueLabel)}</dd></div>
      <div class="history-card-meta--full"><dt>${IC.truck}<span>Flota / Termoking</span></dt><dd>${escapeHtml(fleet)}</dd></div>
    </dl>
    <footer class="history-card-actions">
      <button type="button" class="btn btn-sm btn-action" data-action="detail" data-id="${escapeAttr(String(request.id || ""))}">${IC.eye} Ver ficha</button>
      ${request.trip ? `<button type="button" class="btn btn-sm btn-outline" data-action="trip-detail" data-id="${escapeAttr(String(request.id || ""))}">${IC.truck} Viaje</button>` : ""}
    </footer>
  </article>`;
}

function renderHistoryResultsList(items) {
  if (!items.length) {
    return `<div class="history-empty-state"><p class="muted">No hay registros con los filtros actuales. Prueba otro periodo, cliente o quita el filtro rápido.</p></div>`;
  }
  return `<div class="history-cards-grid" id="history-results-grid">${items.map(renderHistoryCard).join("")}</div>`;
}

const HISTORY_FLEET_TECH_LABELS = {
  preventivo: "Preventivo",
  correctivo: "Correctivo",
  falla: "Falla técnica"
};

function fmtFleetLogDate(value) {
  const s = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return fmtDate(value);
  const [y, m, d] = s.split("-").map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function sortFleetLogsByDate(logs) {
  return [...logs].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
}

function historyFleetFuelHaystack(log) {
  return `${log.vehiclePlate || ""} ${log.driverName || ""} ${log.tripNumber || ""} ${log.station || ""} ${log.paidBy || ""} ${log.date || ""}`
    .toLowerCase();
}

function historyFleetTechnicalHaystack(log) {
  return `${log.vehiclePlate || ""} ${log.description || ""} ${log.type || ""} ${log.status || ""} ${log.date || ""}`
    .toLowerCase();
}

function applyHistoryFleetFuelFilters(logs, formData = {}) {
  let out = sortFleetLogsByDate(logs);
  if (formData.vehicleId) out = out.filter((l) => String(l.vehicleId) === String(formData.vehicleId));
  if (formData.driverId) out = out.filter((l) => String(l.driverId) === String(formData.driverId));
  if (formData.paidBy) out = out.filter((l) => String(l.paidBy) === String(formData.paidBy));
  if (formData.from) out = out.filter((l) => String(l.date || "") >= String(formData.from));
  if (formData.to) out = out.filter((l) => String(l.date || "") <= String(formData.to));
  const q = String(formData.q || "").trim().toLowerCase();
  if (q) out = out.filter((l) => historyFleetFuelHaystack(l).includes(q));
  return out;
}

function applyHistoryFleetTechnicalFilters(logs, formData = {}) {
  let out = sortFleetLogsByDate(logs);
  if (formData.vehicleId) out = out.filter((l) => String(l.vehicleId) === String(formData.vehicleId));
  if (formData.type) out = out.filter((l) => String(l.type) === String(formData.type));
  if (formData.status) out = out.filter((l) => String(l.status) === String(formData.status));
  if (formData.from) out = out.filter((l) => String(l.date || "") >= String(formData.from));
  if (formData.to) out = out.filter((l) => String(l.date || "") <= String(formData.to));
  const q = String(formData.q || "").trim().toLowerCase();
  if (q) out = out.filter((l) => historyFleetTechnicalHaystack(l).includes(q));
  return out;
}

function historyFleetFuelKpis(logs) {
  const liters = logs.reduce((acc, log) => acc + parseNum(log.liters), 0);
  const cost = logs.reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  const reimburse = logs
    .filter((l) => String(l.paidBy) === "conductor")
    .reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  return {
    count: logs.length,
    liters,
    cost,
    avgPerLiter: liters > 0 ? Math.round(cost / liters) : 0,
    reimburse
  };
}

function historyFleetTechnicalKpis(logs) {
  const cost = logs.reduce((acc, log) => acc + parseNum(log.cost), 0);
  const downtime = logs.reduce((acc, log) => acc + parseNum(log.downtimeHours), 0);
  const open = logs.filter((l) => !["Resuelto"].includes(String(l.status || ""))).length;
  return { count: logs.length, cost, downtime, open };
}

function historyFleetMoneyField(name, label, opts = {}) {
  const req = opts.required ? { required: true } : {};
  return `<label class="history-fleet-money-field">${fieldLabel(IC.dollar, label, req)}
    <span class="history-fleet-money-wrap">
      <span class="history-fleet-money-prefix" aria-hidden="true">$</span>
      <input type="text" name="${escapeAttr(name)}" inputmode="numeric" autocomplete="off" data-money-input="1" placeholder="0" ${opts.required ? "required" : ""} />
    </span>
  </label>`;
}

function renderHistoryFuelLogCard(log) {
  const liters = parseNum(log.liters);
  const total = parseNum(log.totalCost);
  const perLiter = parseNum(log.costPerLiter) || (liters > 0 ? Math.round(total / liters) : 0);
  const paid = String(log.paidBy || "empresa") === "conductor" ? "conductor" : "empresa";
  const paidLabel = paid === "conductor" ? "Reembolso nómina" : "Empresa";
  const trip = String(log.tripNumber || "").trim();
  return `<article class="history-fleet-log-card history-fleet-log-card--fuel" data-fleet-fuel-row data-haystack="${escapeAttr(historyFleetFuelHaystack(log))}">
    <header class="history-fleet-log-head">
      <div>
        <time class="history-fleet-log-date" datetime="${escapeAttr(String(log.date || ""))}">${escapeHtml(fmtFleetLogDate(log.date))}</time>
        <h3 class="history-fleet-log-plate">${escapeHtml(String(log.vehiclePlate || "—"))}</h3>
        <p class="history-fleet-log-sub">${escapeHtml(String(log.driverName || "—"))}${trip ? ` · ${escapeHtml(trip)}` : ""}</p>
      </div>
      <span class="history-fleet-badge history-fleet-badge--${paid === "conductor" ? "warn" : "ok"}">${escapeHtml(paidLabel)}</span>
    </header>
    <dl class="history-fleet-log-meta">
      <div><dt>${IC.activity} Litros</dt><dd>${liters.toLocaleString("es-CO", { maximumFractionDigits: 2 })} L</dd></div>
      <div><dt>${IC.dollar} Total</dt><dd class="history-fleet-log-money">$${total.toLocaleString("es-CO")}</dd></div>
      <div><dt>${IC.dollar} $/L</dt><dd>$${perLiter.toLocaleString("es-CO")}</dd></div>
      <div><dt>${IC.mapPin} Estación</dt><dd>${log.station ? escapeHtml(log.station) : '<span class="muted">—</span>'}</dd></div>
      ${parseNum(log.odometerKm) > 0 ? `<div><dt>${IC.clock} Odómetro</dt><dd>${parseNum(log.odometerKm).toLocaleString("es-CO")} km</dd></div>` : ""}
    </dl>
  </article>`;
}

function renderHistoryTechnicalLogCard(log) {
  const typeKey = String(log.type || "preventivo");
  const typeLabel = HISTORY_FLEET_TECH_LABELS[typeKey] || typeKey;
  const status = String(log.status || "Pendiente");
  const statusSlug = slugStatus(status);
  const cost = parseNum(log.cost);
  const hours = parseNum(log.downtimeHours);
  return `<article class="history-fleet-log-card history-fleet-log-card--technical history-fleet-log-card--${escapeAttr(statusSlug)}" data-fleet-technical-row data-haystack="${escapeAttr(historyFleetTechnicalHaystack(log))}">
    <header class="history-fleet-log-head">
      <div>
        <time class="history-fleet-log-date" datetime="${escapeAttr(String(log.date || ""))}">${escapeHtml(fmtFleetLogDate(log.date))}</time>
        <h3 class="history-fleet-log-plate">${escapeHtml(String(log.vehiclePlate || "—"))}</h3>
        <p class="history-fleet-log-desc">${escapeHtml(String(log.description || "—"))}</p>
      </div>
      <div class="history-fleet-log-badges">
        <span class="history-fleet-badge history-fleet-badge--type">${escapeHtml(typeLabel)}</span>
        <span class="history-fleet-badge history-fleet-badge--status">${escapeHtml(status)}</span>
      </div>
    </header>
    <dl class="history-fleet-log-meta">
      <div><dt>${IC.dollar} Costo</dt><dd class="history-fleet-log-money">$${cost.toLocaleString("es-CO")}</dd></div>
      <div><dt>${IC.clock} Fuera de servicio</dt><dd>${hours > 0 ? `${hours.toLocaleString("es-CO")} h` : '<span class="muted">0 h</span>'}</dd></div>
    </dl>
  </article>`;
}

function renderHistoryFuelLogsList(logs) {
  if (!logs.length) {
    return `<div class="history-empty-state history-fleet-empty"><p class="muted">Aún no hay cargas de combustible registradas. Registre la primera desde el módulo <strong>Camiones</strong>.</p></div>`;
  }
  return `<div class="history-fleet-log-grid" id="history-fuel-results-grid">${logs.map(renderHistoryFuelLogCard).join("")}</div>`;
}

function renderHistoryTechnicalLogsList(logs) {
  if (!logs.length) {
    return `<div class="history-empty-state history-fleet-empty"><p class="muted">No hay novedades de taller en este periodo. Registre preventivos, correctivos o fallas desde el módulo <strong>Camiones</strong>.</p></div>`;
  }
  return `<div class="history-fleet-log-grid" id="history-technical-results-grid">${logs.map(renderHistoryTechnicalLogCard).join("")}</div>`;
}

function historyFleetKpiStrip(metrics) {
  return `<div class="history-fleet-kpis" role="group" aria-label="Resumen del periodo">${metrics
    .map(
      ({ label, value, tone }) =>
        `<div class="history-fleet-kpi${tone ? ` history-fleet-kpi--${tone}` : ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`
    )
    .join("")}</div>`;
}

function refreshHistoryFleetKpiStrip(selector, metrics) {
  const root = document.querySelector(selector);
  if (root) root.outerHTML = historyFleetKpiStrip(metrics);
}

function historyFleetFilterToolbar(formId, fieldsHtml) {
  return `<form id="${escapeAttr(formId)}" class="history-fleet-filter-form" novalidate>
    <div class="history-toolbar history-fleet-toolbar">
      <label class="history-toolbar-search">
        <span class="visually-hidden">Buscar</span>
        ${IC.search || IC.filter}
        <input type="search" name="q" placeholder="Placa, conductor, estación, viaje…" autocomplete="off" />
      </label>
      <details class="history-advanced-filters history-fleet-advanced">
        <summary class="btn btn-sm btn-action">${IC.filter} Filtros</summary>
        <div class="history-advanced-filters-body history-fleet-filters-body">${fieldsHtml}
          <button class="btn btn-sm btn-action" type="reset">${IC.x} Limpiar</button>
        </div>
      </details>
    </div>
  </form>`;
}

function historyFleetFuelFormHtml(todayIsoDate, vehicleOptions, driverOptions) {
  return `<form id="form-fuel-log" class="p-form p-form-colored history-fleet-create-form">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.calendar} Carga de combustible</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.calendar, "Fecha", { required: true })}<input type="date" name="date" value="${escapeAttr(todayIsoDate)}" required /></label>
        <label>${fieldLabel(IC.truck, "Camión", { required: true })}<select name="vehicleId" required><option value="">Seleccione…</option>${vehicleOptions}</select></label>
        <label>${fieldLabel(IC.user, "Conductor", { required: true })}<select name="driverId" required><option value="">Seleccione…</option>${driverOptions}</select></label>
        <label>${fieldLabel(IC.file, "Viaje (opcional)")}<input name="tripNumber" placeholder="VIA-000123" autocomplete="off" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.dollar} Montos y trazabilidad</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.activity, "Litros", { required: true })}<input type="number" step="0.01" min="0.01" name="liters" required data-fuel-liters-input="1" /></label>
        ${historyFleetMoneyField("totalCost", "Valor total (COP)", { required: true })}
        <label>${fieldLabel(IC.clock, "Odómetro (km)")}<input type="number" min="0" name="odometerKm" inputmode="numeric" /></label>
        <label>${fieldLabel(IC.mapPin, "Estación / EDS")}<input name="station" placeholder="EDS Roscombustible…" autocomplete="off" /></label>
        <label>${fieldLabel(IC.briefcase, "Pagado por")}
          <select name="paidBy">
            <option value="empresa">Empresa</option>
            <option value="conductor">Conductor (reembolso nómina)</option>
          </select>
        </label>
      </div>
      <p class="history-fleet-live-hint muted" id="fuel-price-per-liter-hint" hidden aria-live="polite"></p>
      <p class="history-fleet-sync-hint muted">Se guarda en <strong>registros_combustible</strong> (PostgreSQL) al enviar.</p>
    </fieldset>
    ${renderManagedCreateFormActions("create-fuel-log", `<button class="btn btn-primary" type="submit">${IC.plus} Registrar combustible</button>`)}
  </form>`;
}

function historyFleetTechnicalFormHtml(todayIsoDate, vehicleOptions) {
  return `<form id="form-technical-log" class="p-form p-form-colored history-fleet-create-form">
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.truck} Novedad de taller</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.calendar, "Fecha", { required: true })}<input type="date" name="date" value="${escapeAttr(todayIsoDate)}" required /></label>
        <label>${fieldLabel(IC.truck, "Camión", { required: true })}<select name="vehicleId" required><option value="">Seleccione…</option>${vehicleOptions}</select></label>
        <label>${fieldLabel(IC.activity, "Tipo")}
          <select name="type">
            <option value="preventivo">Mantenimiento preventivo</option>
            <option value="correctivo">Mantenimiento correctivo</option>
            <option value="falla">Falla técnica</option>
          </select>
        </label>
        <label class="full">${fieldLabel(IC.file, "Descripción", { required: true })}<input name="description" required placeholder="Ej. cambio de aceite, frenos, refrigeración…" /></label>
        ${historyFleetMoneyField("cost", "Costo (COP)", { required: true })}
        <label>${fieldLabel(IC.clock, "Horas fuera de servicio")}<input type="number" min="0" step="0.5" name="downtimeHours" value="0" /></label>
        <label>${fieldLabel(IC.check, "Estado")}
          <select name="status">
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Resuelto</option>
          </select>
        </label>
      </div>
      <p class="history-fleet-sync-hint muted">Se guarda en <strong>registros_mantenimiento_vehiculo</strong> (PostgreSQL) al enviar.</p>
    </fieldset>
    ${renderManagedCreateFormActions("create-technical-log", `<button class="btn btn-primary" type="submit">${IC.plus} Registrar novedad de taller</button>`)}
  </form>`;
}

function historyAuditActionLabel(action) {
  if (action === "create") return "Creación";
  if (action === "delete") return "Eliminación";
  return "Actualización";
}

function historyAuditActionStatus(action) {
  if (action === "create") return "status-viaje_asignado";
  if (action === "delete") return "status-rechazada";
  return "status-pendiente";
}

function buildHistoryAuditEntries() {
  const entries = [];
  const pushEntry = (entry) => {
    if (!entry || typeof entry !== "object") return;
    const ts = String(entry.ts || "").trim();
    if (!ts || Number.isNaN(new Date(ts).getTime())) return;
    entries.push({
      id: String(entry.id || newUuidV4()),
      ts,
      action: String(entry.action || "update"),
      moduleLabel: String(entry.moduleLabel || "Módulo"),
      entityLabel: String(entry.entityLabel || "Registro"),
      summary: String(entry.summary || "").trim(),
      actor: String(entry.actor || "").trim(),
      detailAction: String(entry.detailAction || "").trim(),
      detailId: String(entry.detailId || "").trim()
    });
  };

  readArray(KEYS.users).forEach((user) => {
    const companyName = String(getCompanyById(user.companyId)?.name || user.company || "Sin empresa").trim();
    const userLabel = getPortalUserDisplayName(user) || String(user.email || "Usuario");
    pushEntry({
      id: `audit-user-create-${user.id}`,
      ts: String(user.createdAt || user.registeredAt || user.systemJoinDate || ""),
      action: "create",
      moduleLabel: "Usuarios y permisos",
      entityLabel: userLabel,
      summary: `${formatPortalRoleLabel(user.role)} · ${companyName || "Sin empresa"}`
    });
    if (user.updatedAt && String(user.updatedAt) !== String(user.createdAt || "")) {
      pushEntry({
        id: `audit-user-update-${user.id}`,
        ts: String(user.updatedAt),
        action: "update",
        moduleLabel: "Usuarios y permisos",
        entityLabel: userLabel,
        summary: `${String(user.email || "Sin correo")} · ${String(user.city || "Sin ciudad")}`
      });
    }
  });

  readArray(KEYS.companies).forEach((company) => {
    const companyLabel = String(company.name || "Empresa").trim();
    pushEntry({
      id: `audit-company-create-${company.id}`,
      ts: String(company.createdAt || ""),
      action: "create",
      moduleLabel: "Usuarios y permisos",
      entityLabel: companyLabel,
      summary: `${String(company.taxId || company.nit || "Sin NIT")} · ${String(company.city || "Sin ciudad")}`
    });
    if (company.updatedAt && String(company.updatedAt) !== String(company.createdAt || "")) {
      pushEntry({
        id: `audit-company-update-${company.id}`,
        ts: String(company.updatedAt),
        action: "update",
        moduleLabel: "Usuarios y permisos",
        entityLabel: companyLabel,
        summary: `${companyKindLabel(company.companyKind) || "Sin clasificación"} · ${isCompanyRecordActive(company) ? "Activa" : "Inactiva"}`
      });
    }
  });

  readArray(KEYS.vehicles).forEach((vehicle) => {
    const vehicleLabel = String(vehicle.plate || vehicle.id || "Camión").trim().toUpperCase();
    pushEntry({
      id: `audit-vehicle-create-${vehicle.id}`,
      ts: String(vehicle.createdAt || ""),
      action: "create",
      moduleLabel: "Camiones",
      entityLabel: vehicleLabel,
      summary: `${String(vehicle.type || "Vehículo")} · ${String(vehicle.brand || "")} ${String(vehicle.model || "")}`.trim()
    });
    if (vehicle.updatedAt && String(vehicle.updatedAt) !== String(vehicle.createdAt || "")) {
      pushEntry({
        id: `audit-vehicle-update-${vehicle.id}`,
        ts: String(vehicle.updatedAt),
        action: "update",
        moduleLabel: "Camiones",
        entityLabel: vehicleLabel,
        summary: `${vehicle.refrigerated ? "Termoking" : "Carga seca"} · ${parseNum(vehicle.capacityKg).toLocaleString("es-CO")} kg`
      });
    }
  });

  readArray(KEYS.drivers).forEach((driver) => {
    const driverLabel = String(driver.name || "Conductor").trim();
    pushEntry({
      id: `audit-driver-create-${driver.id}`,
      ts: String(driver.createdAt || driver.hiredAt || ""),
      action: "create",
      moduleLabel: "Conductores",
      entityLabel: driverLabel,
      summary: `${String(driver.licenseCategory || "Sin categoría")} · ${String(driver.city || "Sin ciudad")}`
    });
    if (driver.updatedAt && String(driver.updatedAt) !== String(driver.createdAt || "")) {
      pushEntry({
        id: `audit-driver-update-${driver.id}`,
        ts: String(driver.updatedAt),
        action: "update",
        moduleLabel: "Conductores",
        entityLabel: driverLabel,
        summary: `${String(driver.phone || "Sin teléfono")} · ${String(getCompanyById(driver.companyId)?.name || "Sin empresa")}`
      });
    }
  });

  reqRead().forEach((request) => {
    const requestLabel = String(request.requestNumber || request.id || "Solicitud").trim();
    pushEntry({
      id: `audit-request-create-${request.id}`,
      ts: String(request.createdAt || ""),
      action: "create",
      moduleLabel: "Solicitudes",
      entityLabel: requestLabel,
      summary: `${String(request.clientName || "Cliente")} · ${formatRoute(request)}`
    });
    if (request.updatedAt && String(request.updatedAt) !== String(request.createdAt || "")) {
      pushEntry({
        id: `audit-request-update-${request.id}`,
        ts: String(request.updatedAt),
        action: "update",
        moduleLabel: "Solicitudes",
        entityLabel: requestLabel,
        summary: `${String(request.status || "Sin estado")} · ${String(request.serviceType || "Sin servicio")}`
      });
    }
    (Array.isArray(request.modificationLog) ? request.modificationLog : []).forEach((logRow, idx) => {
      const just = String(logRow?.justification || "").trim();
      if (!just) return;
      const tripN = String(logRow?.tripNumber || request.trip?.tripNumber || "").trim();
      const changes = String(logRow?.changesSummary || "").trim();
      pushEntry({
        id: `audit-request-mod-${request.id}-${logRow?.id || idx}`,
        ts: String(logRow?.at || ""),
        action: "update",
        moduleLabel: "Solicitudes",
        entityLabel: requestLabel,
        summary: tripN
          ? `Modificación con viaje ${tripN}${changes ? ` (${changes})` : ""}: ${just}`
          : `Modificación${changes ? ` (${changes})` : ""}: ${just}`,
        actor: String(logRow?.actorEmail || logRow?.actorName || ""),
        detailAction: "detail",
        detailId: String(request.id || "")
      });
    });
    if (request.trip) {
      const tripCreatedAt = String(
        request.trip.createdAt || request.trip.assignedAt || request.approvedAt || request.updatedAt || request.createdAt || ""
      );
      const tripLabel = String(request.trip.tripNumber || requestLabel || "Viaje").trim();
      pushEntry({
        id: `audit-trip-create-${request.id}`,
        ts: tripCreatedAt,
        action: "create",
        moduleLabel: "Viajes",
        entityLabel: tripLabel,
        summary: `${String(request.trip.vehiclePlate || "Sin camión")} · ${String(request.trip.driverName || "Sin conductor")}`
      });
      if (request.trip.updatedAt && String(request.trip.updatedAt) !== tripCreatedAt) {
        pushEntry({
          id: `audit-trip-update-${request.id}`,
          ts: String(request.trip.updatedAt),
          action: "update",
          moduleLabel: "Viajes",
          entityLabel: tripLabel,
          summary: `${String(request.status || "Sin estado")} · ${String(request.clientName || "Cliente")}`
        });
      }
    }
  });

  readFuelLogs().forEach((log) => {
    pushEntry({
      id: `audit-fuel-create-${log.id}`,
      ts: String(log.createdAt || log.date || ""),
      action: "create",
      moduleLabel: "Camiones",
      entityLabel: String(log.vehiclePlate || log.plate || "Combustible"),
      summary: `${parseNum(log.liters).toLocaleString("es-CO", { maximumFractionDigits: 1 })} L · $${parseNum(log.totalCost).toLocaleString("es-CO")}`
    });
    if (log.updatedAt && String(log.updatedAt) !== String(log.createdAt || log.date || "")) {
      pushEntry({
        id: `audit-fuel-update-${log.id}`,
        ts: String(log.updatedAt),
        action: "update",
        moduleLabel: "Camiones",
        entityLabel: String(log.vehiclePlate || log.plate || "Combustible"),
        summary: `${String(log.station || "Sin estación")} · ${String(log.paidBy || "empresa")}`
      });
    }
  });

  readVehicleTechnicalLogs().forEach((log) => {
    pushEntry({
      id: `audit-technical-create-${log.id}`,
      ts: String(log.createdAt || log.date || ""),
      action: "create",
      moduleLabel: "Camiones",
      entityLabel: String(log.vehiclePlate || log.plate || "Taller"),
      summary: `${String(log.type || log.interventionType || "Novedad")} · ${String(log.description || "").trim() || "Sin descripción"}`
    });
    if (log.updatedAt && String(log.updatedAt) !== String(log.createdAt || log.date || "")) {
      pushEntry({
        id: `audit-technical-update-${log.id}`,
        ts: String(log.updatedAt),
        action: "update",
        moduleLabel: "Camiones",
        entityLabel: String(log.vehiclePlate || log.plate || "Taller"),
        summary: `${String(log.status || log.followUpStatus || "Pendiente")} · $${parseNum(log.cost).toLocaleString("es-CO")}`
      });
    }
  });

  readModuleAuditLogs().forEach((row) => {
    pushEntry({
      id: `audit-explicit-${row.id}`,
      ts: String(row.at || ""),
      action: String(row.action || "delete"),
      moduleLabel: String(row.moduleLabel || row.moduleId || "Módulo"),
      entityLabel: String(row.entityLabel || "Registro"),
      summary: String(row.summary || ""),
      actor: String(row.actor || ""),
      detailAction: String(row.detailAction || ""),
      detailId: String(row.detailId || "")
    });
  });

  read(KEYS.deletedTransportRequestLogs, []).forEach((row) => {
    const snap = deletedRequestSnapshotForTableRow(row);
    pushEntry({
      id: `audit-deleted-request-${row.id}`,
      ts: String(row.deletedAt || ""),
      action: "delete",
      moduleLabel: "Solicitudes",
      entityLabel: String(row.requestNumber || row.requestId || "Solicitud"),
      summary: `${formatDeletedRequestSnapshotTableSummary(snap)} · Motivo: ${String(row.reason || "—")}`,
      actor: String(row.deletedByEmail || ""),
      detailAction: "deleted-request-snapshot-detail",
      detailId: String(row.id || "")
    });
  });

  read(KEYS.deletedTransportTripLogs, []).forEach((row) => {
    const snap = parsePortalJsonSnapshot(row.snapshot);
    pushEntry({
      id: `audit-deleted-trip-${row.id}`,
      ts: String(row.deletedAt || ""),
      action: "delete",
      moduleLabel: "Viajes",
      entityLabel: String(row.tripNumber || row.requestNumber || row.requestId || "Viaje"),
      summary: `${formatDeletedTripSnapshotTableSummary(snap)} · Motivo: ${String(row.reason || "—")}`,
      actor: String(row.deletedByEmail || ""),
      detailAction: "deleted-trip-snapshot-detail",
      detailId: String(row.id || "")
    });
  });

  return entries
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 180);
}

function renderHistoryAuditCard(entry) {
  const actionLabel = historyAuditActionLabel(entry.action);
  const actionTone = historyAuditActionStatus(entry.action);
  const detailButton =
    entry.detailAction && entry.detailId
      ? `<button type="button" class="btn btn-sm btn-outline" data-action="${escapeAttr(entry.detailAction)}" data-id="${escapeAttr(entry.detailId)}">${IC.eye} Detalle</button>`
      : "";
  return `<article class="history-card">
    <header class="history-card-head">
      <div class="history-card-head-main">
        <p class="history-card-kicker"><time datetime="${escapeAttr(String(entry.ts || ""))}">${escapeHtml(fmtDate(entry.ts))}</time> · ${escapeHtml(entry.moduleLabel)}</p>
        <h3 class="history-card-title">${escapeHtml(entry.entityLabel)}</h3>
        <p class="history-card-client">${escapeHtml(actionLabel)}</p>
      </div>
      <div class="history-card-status"><span class="status ${escapeAttr(actionTone)}">${escapeHtml(actionLabel)}</span></div>
    </header>
    <dl class="history-card-meta">
      <div><dt>${IC.layers}<span>Módulo</span></dt><dd>${escapeHtml(entry.moduleLabel)}</dd></div>
      <div><dt>${IC.clock}<span>Fecha</span></dt><dd>${escapeHtml(fmtDate(entry.ts))}</dd></div>
      <div class="history-card-meta--full"><dt>${IC.file}<span>Resumen</span></dt><dd>${escapeHtml(entry.summary || "Sin resumen")}</dd></div>
      ${entry.actor ? `<div class="history-card-meta--full"><dt>${IC.user}<span>Usuario</span></dt><dd>${escapeHtml(entry.actor)}</dd></div>` : ""}
    </dl>
    ${detailButton ? `<footer class="history-card-actions">${detailButton}</footer>` : ""}
  </article>`;
}

function renderHistoryAuditList(entries) {
  if (!entries.length) {
    return `<div class="history-empty-state"><p class="muted">No hay movimientos auditables para mostrar todavía.</p></div>`;
  }
  return `<div class="history-cards-grid">${entries.map(renderHistoryAuditCard).join("")}</div>`;
}


function topClients(requests) {
  const acc = {};
  requests.forEach((r) => {
    acc[r.clientName] = (acc[r.clientName] || 0) + 1;
  });
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);
}

function topVehicles(requests) {
  const acc = {};
  requests.forEach((r) => {
    const key = r.trip?.vehicleType?.trim() || "Sin viaje asignado";
    acc[key] = (acc[key] || 0) + 1;
  });
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);
}

function toCsv(rows = [], columns = []) {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const header = columns.map((col) => esc(col.label)).join(",");
  const body = rows.map((row) => columns.map((col) => esc(row[col.key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

const REPORT_RULES = {
  executive_control_tower: { permission: PERMISSIONS.DASHBOARD_VIEW, rrhhAllowed: true },
  service_levels: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  fleet_summary: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  trips_operations: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  requests_lifecycle: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  drivers_performance: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  fuel_operations: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  maintenance_fleet: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  revenue_by_route: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  request_funnel: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  document_compliance: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  payroll_summary: { permission: PERMISSIONS.PAYROLL_MANAGE, rrhhAllowed: true },
  hiring_pipeline: { permission: PERMISSIONS.HIRING_MANAGE, rrhhAllowed: true },
  labor_compliance: { permission: PERMISSIONS.SST_COMPLIANCE, rrhhAllowed: true },
  users_access: { permission: PERMISSIONS.USERS_MANAGE, adminOnly: true },
  authorizations_traceability: { permission: PERMISSIONS.AUTHORIZATIONS_MANAGE, adminOnly: true }
};

function canAccessReport(user, reportId) {
  if (!user) return false;
  if (user.role === ROLES.CLIENT) return false;
  const rule = REPORT_RULES[reportId];
  if (!rule) return false;
  if (!hasPermission(user, rule.permission)) return false;
  if (rule.adminOnly) return user.role === ROLES.ADMIN;
  if (rule.rrhhAllowed) return canAccessRRHH(user.role) || user.role === ROLES.ADMIN;
  return true;
}

const REPORT_EXPORT_BRAND = Object.freeze({
  primary: "#377cc0",
  primaryDeep: "#2a6399",
  primaryDeeper: "#1e4a73",
  soft: "#cce5f8",
  text: "#0b2138",
  muted: "#64748b",
  line: "#b8d4eb"
});

const REPORT_BRAND_LOGO_PATH = "./imagenes%20empresa/Logo.png";
let reportBrandLogoDataUrlPromise = null;

function reportPreviewValueIsEmpty(value) {
  const text = String(value ?? "").trim();
  return !text || text === "-" || text === "—" || text.toLowerCase() === "null" || text.toLowerCase() === "undefined";
}

function reportPreviewSamples(rows = [], key = "") {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => row?.[key])
    .filter((value) => !reportPreviewValueIsEmpty(value))
    .slice(0, 8);
}

function reportPreviewInferColumnType(column = {}, rows = []) {
  const key = String(column?.key || "").toLowerCase();
  const label = String(column?.label || "").toLowerCase();
  const meta = `${key} ${label}`;
  const samples = reportPreviewSamples(rows, column?.key || "");
  const sampleText = samples.map((value) => String(value).trim()).join(" | ");
  const allBoolean = samples.length > 0 && samples.every((value) => /^(si|sí|no)$/i.test(String(value).trim()));

  if (/(status|estado|sla)/i.test(meta)) return "status";
  if (/(riesgo|risk|vigencia|vence|vencimiento)/i.test(meta)) return "risk";
  if (allBoolean || /(termoking|tiene|entrevista|contrato)/i.test(meta)) return "boolean";
  if (/(categor|tipo|rol|origen|modalidad|fuente)/i.test(meta)) return "tag";
  if (/(cop|costo|cost|valor|neto|net|gross|devengado|deducc|reembolso|viatic|salario|aspiracion|combustible|standby)/i.test(meta)) return "currency";
  if (/%/.test(sampleText) || /(porcentaje|tasa|pct|rate|closure|cierre)/i.test(meta)) return "percent";
  if (/(fecha|date|venc|entrega|asign|cread|pago|revision|solicitud|ingreso|registro)/i.test(meta)) return "date";
  if (/(min|hora|horas|hour|hours|dia|dias|days|kg|litro|liters|permis|edad|viajes|entrevistas|resoluci|capacidad|cantidad)/i.test(meta)) return "number";
  if (/(detalle|novedad|observ|resumen|reason|nota)/i.test(meta)) return "longtext";
  if (/(placa|solicitud|viaje|factura|documento|doc|codigo|correo|licencia)/i.test(meta)) return "id";
  return "text";
}

function reportPreviewFormatValue(value, type = "text") {
  if (reportPreviewValueIsEmpty(value)) return "—";
  if (type === "currency" && (typeof value === "number" || /^-?\d+(?:[.,]\d+)?$/.test(String(value).trim()))) {
    return `$${parseNum(value).toLocaleString("es-CO")}`;
  }
  if (type === "percent" && typeof value === "number") {
    return `${parseNum(value).toLocaleString("es-CO")}%`;
  }
  if (type === "number" && typeof value === "number") {
    return parseNum(value).toLocaleString("es-CO");
  }
  return String(value);
}

function reportPreviewTone(type = "text", value) {
  const text = String(reportPreviewFormatValue(value, type)).toLowerCase();
  if (type === "boolean") return /^(si|sí)$/i.test(text) ? "success" : "neutral";
  if (type === "tag") return "info";
  if (/(rechaz|vencid|crit|cr[ií]tic|no disponible|incumpl|cancel|alert|sin fecha|fuera)/i.test(text)) return "danger";
  if (/(pendient|pr[oó]xim|atenci[oó]n|espera|riesgo)/i.test(text)) return "warning";
  if (/(aprob|pagad|cumpl|complet|cerrad|controlad|vigent|disponible|si|sí)/i.test(text)) return "success";
  if (/(ocupad|asignad|activo|operaci[oó]n|proceso|ruta|revisi[oó]n)/i.test(text)) return "info";
  return "neutral";
}

function reportPreviewColumnMeta(columns = [], rows = []) {
  return (Array.isArray(columns) ? columns : []).map((column, index) => ({
    ...column,
    type: reportPreviewInferColumnType(column, rows),
    pinned: index === 0
  }));
}

function reportPreviewCellInnerHtml(value, type = "text") {
  const display = reportPreviewFormatValue(value, type);
  if (display === "—") return `<span class="report-empty">—</span>`;
  const safe = escapeHtml(display);
  if (["status", "risk", "boolean", "tag"].includes(type)) {
    return `<span class="report-badge report-badge--${reportPreviewTone(type, display)}">${safe}</span>`;
  }
  if (type === "id") return `<span class="report-code">${safe}</span>`;
  if (type === "longtext") return `<span class="report-note">${safe}</span>`;
  return `<span class="report-value">${safe}</span>`;
}

function downloadBlobFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 400);
}

function downloadCsv(filename, rows = [], columns = []) {
  downloadBlobFile(filename, toCsv(rows, columns), "text/csv;charset=utf-8;");
}

function reportExportStamp() {
  return new Date().toISOString().slice(0, 10);
}

function reportExportSlug(title) {
  return String(title || "reporte")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

function reportExportFilename(report, ext) {
  const base = String(report?.fileName || "reporte")
    .replace(/\.(csv|html|xls|pdf)$/i, "")
    .trim();
  const slug = reportExportSlug(report?.title || base);
  return `${slug || base || "reporte"}_${reportExportStamp()}.${ext}`;
}

function reportPdfCellText(value) {
  if (value == null) return "-";
  const normalized = String(value).replace(/\s+/g, " ").trim();
  return normalized || "-";
}

function reportBrandCopyrightText() {
  return `© ${new Date().getFullYear()} Transportes Antares. Todos los derechos reservados.`;
}

function reportBrandLogoSrc() {
  const liveLogo = document.querySelector(".hero-brand-logo, .auth-modal-brand-logo, .brand-logo, .sidebar-brand-logo");
  const src = String(liveLogo?.currentSrc || liveLogo?.src || "").trim();
  if (src) return src;
  try {
    return new URL(REPORT_BRAND_LOGO_PATH, window.location.href).href;
  } catch (_e) {
    return REPORT_BRAND_LOGO_PATH;
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("blob-to-data-url-failed"));
    reader.readAsDataURL(blob);
  });
}

function imageElementToDataUrl(img) {
  try {
    if (!(img instanceof HTMLImageElement)) return "";
    const width = Number(img.naturalWidth || img.width || 0);
    const height = Number(img.naturalHeight || img.height || 0);
    if (!width || !height) return "";
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } catch (_e) {
    return "";
  }
}

async function getReportBrandLogoDataUrl() {
  if (!reportBrandLogoDataUrlPromise) {
    reportBrandLogoDataUrlPromise = (async () => {
      const liveLogo = document.querySelector(".hero-brand-logo, .auth-modal-brand-logo, .brand-logo, .sidebar-brand-logo");
      if (liveLogo instanceof HTMLImageElement && liveLogo.complete && Number(liveLogo.naturalWidth || 0) > 0) {
        const dataUrl = imageElementToDataUrl(liveLogo);
        if (dataUrl) return dataUrl;
      }
      const src = reportBrandLogoSrc();
      if (/^data:/i.test(src)) return src;
      try {
        const res = await fetch(src, { credentials: "same-origin", cache: "force-cache" });
        if (!res.ok) throw new Error(`logo-${res.status}`);
        return await blobToDataUrl(await res.blob());
      } catch (_e) {
        return "";
      }
    })();
  }
  return reportBrandLogoDataUrlPromise;
}

async function exportCatalogReportPdf(report, meta = {}) {
  const jsPdfCtor = window.jspdf?.jsPDF;
  if (!jsPdfCtor) throw new Error("PDF export unavailable");
  const title = report?.title || "Reporte";
  const columns = Array.isArray(report?.columns) && report.columns.length ? report.columns : [{ key: "message", label: "Detalle" }];
  const rows = Array.isArray(report?.rows) ? report.rows : [];
  const generatedAt = reportPdfCellText(meta.generatedAt || fmtDate(nowIso()));
  const generatedBy = meta.generatedBy ? reportPdfCellText(meta.generatedBy) : "";
  const rowCount = rows.length;
  const orientation = columns.length > 6 ? "landscape" : "portrait";
  const doc = new jsPdfCtor({ orientation, unit: "pt", format: "a4", compress: true });
  if (typeof doc.autoTable !== "function") throw new Error("PDF table export unavailable");
  const logoDataUrl = await getReportBrandLogoDataUrl();
  const logoFormatRaw = /^data:image\/([a-z0-9+.-]+);/i.exec(String(logoDataUrl || ""))?.[1] || "png";
  const logoFormat = logoFormatRaw.toLowerCase() === "jpg" ? "JPEG" : logoFormatRaw.toUpperCase();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const headerY = 28;
  const headerHeight = 72;
  const tableStartY = 138;
  const titleText = reportPdfCellText(title);
  const copyrightText = reportBrandCopyrightText();

  doc.setProperties({
    title: titleText,
    subject: "Reporte operativo",
    author: "Transportes Antares",
    creator: "Antares"
  });

  const metaParts = [`Generado: ${generatedAt}`];
  if (generatedBy) metaParts.push(`Usuario: ${generatedBy}`);
  metaParts.push(`Registros: ${rowCount}`);

  const drawPageHeader = (pageNumber) => {
    doc.setFillColor(30, 74, 115);
    doc.roundedRect(marginX, headerY, pageWidth - marginX * 2, headerHeight, 12, 12, "F");
    const logoBoxSize = headerHeight - 20;
    const logoX = marginX + 12;
    const logoY = headerY + 10;
    const titleStartX = logoDataUrl ? logoX + logoBoxSize + 14 : marginX + 14;
    const titleMaxWidth = pageWidth - marginX - titleStartX - 14;
    if (logoDataUrl) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(logoX, logoY, logoBoxSize, logoBoxSize, 10, 10, "F");
      try {
        doc.addImage(logoDataUrl, logoFormat, logoX + 6, logoY + 6, logoBoxSize - 12, logoBoxSize - 12, undefined, "FAST");
      } catch (_e) {
        // Si el logo no se puede incrustar, mantenemos el reporte legible.
      }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(titleText, titleStartX, headerY + 29, { maxWidth: titleMaxWidth });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Transportes Antares · Centro de reportería", titleStartX, headerY + 50, { maxWidth: titleMaxWidth });

    doc.setTextColor(11, 33, 56);
    doc.setFontSize(9.5);
    doc.text(metaParts.join("   |   "), marginX, headerY + headerHeight + 16, {
      maxWidth: pageWidth - marginX * 2
    });

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(copyrightText, pageWidth / 2, pageHeight - 18, { align: "center" });
    doc.text(`Página ${pageNumber}`, pageWidth - marginX, pageHeight - 18, { align: "right" });
  };

  const tableBody = rows.length
    ? rows.map((row) => columns.map((col) => reportPdfCellText(row?.[col.key])))
    : [[{
        content: "Sin datos para el periodo o filtros seleccionados.",
        colSpan: columns.length,
        styles: { halign: "center", fontStyle: "italic", textColor: [100, 116, 139] }
      }]];

  doc.autoTable({
    head: [columns.map((col) => reportPdfCellText(col.label))],
    body: tableBody,
    startY: tableStartY,
    margin: { top: tableStartY, right: marginX, bottom: 34, left: marginX },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.4,
      textColor: [11, 33, 56],
      lineColor: [184, 212, 235],
      cellPadding: { top: 6, right: 7, bottom: 6, left: 7 },
      overflow: "linebreak",
      valign: "top"
    },
    headStyles: {
      fillColor: [30, 74, 115],
      textColor: [255, 255, 255],
      lineColor: [30, 74, 115],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [245, 250, 255]
    },
    didDrawPage: ({ pageNumber }) => {
      drawPageHeader(pageNumber);
    }
  });

  doc.save(reportExportFilename(report, "pdf"));
}

function buildReportExportHtml(title, columns = [], rows = [], meta = {}) {
  const b = REPORT_EXPORT_BRAND;
  const logoSrc = reportsBiExcelEsc(meta.logoSrc || reportBrandLogoSrc());
  const copyrightText = reportsBiExcelEsc(meta.copyrightText || reportBrandCopyrightText());
  const safeTitle = reportsBiExcelEsc(title || "Reporte");
  const cols = Array.isArray(columns) ? columns : [];
  const dataRows = Array.isArray(rows) ? rows : [];
  const colMeta = reportPreviewColumnMeta(cols, dataRows);
  const thead = colMeta
    .map((col) => {
      const classes = ["th", `th-${col.type}`];
      if (["currency", "number", "percent"].includes(col.type)) classes.push("is-numeric");
      if (col.pinned) classes.push("is-primary");
      return `<th class="${classes.join(" ")}">${reportsBiExcelEsc(col.label)}</th>`;
    })
    .join("");
  const tbody = dataRows.length
    ? dataRows
        .map(
          (row) =>
            `<tr>${colMeta
              .map((col) => {
                const classes = ["td", `td-${col.type}`];
                if (["currency", "number", "percent"].includes(col.type)) classes.push("is-numeric");
                if (col.pinned) classes.push("is-primary");
                const display = reportsBiExcelEsc(reportPreviewFormatValue(row[col.key], col.type));
                if (display === "—") return `<td class="${classes.join(" ")}"><span class="empty-value">—</span></td>`;
                if (["status", "risk", "boolean", "tag"].includes(col.type)) {
                  return `<td class="${classes.join(" ")}"><span class="pill pill-${reportPreviewTone(col.type, row[col.key])}">${display}</span></td>`;
                }
                if (col.type === "id") return `<td class="${classes.join(" ")}"><span class="code">${display}</span></td>`;
                if (col.type === "longtext") return `<td class="${classes.join(" ")}"><span class="note">${display}</span></td>`;
                return `<td class="${classes.join(" ")}">${display}</td>`;
              })
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${Math.max(1, cols.length)}" class="empty">Sin datos para el periodo o filtros seleccionados.</td></tr>`;
  const generatedAt = reportsBiExcelEsc(meta.generatedAt || fmtDate(nowIso()));
  const generatedBy = meta.generatedBy ? reportsBiExcelEsc(meta.generatedBy) : "";
  const rowCount = dataRows.length;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${safeTitle} — Transportes Antares</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Montserrat, Arial, sans-serif; color: ${b.text}; background: #f5fbff; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 24px 20px 32px; }
  .banner { background: linear-gradient(135deg, ${b.primaryDeeper}, ${b.primary}); color: #fff; padding: 18px 20px; border-radius: 12px 12px 0 0; }
  .banner-brand { display: flex; align-items: center; gap: 16px; }
  .banner-logo-wrap { width: 86px; min-width: 86px; height: 86px; border-radius: 18px; background: rgba(255,255,255,0.98); padding: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 24px rgba(11, 33, 56, 0.18); }
  .banner-logo { width: 100%; height: 100%; object-fit: contain; display: block; }
  .banner-copy { min-width: 0; flex: 1 1 auto; }
  .banner h1 { margin: 0 0 6px; font-size: 1.35rem; font-weight: 700; }
  .banner p { margin: 0; font-size: 0.82rem; opacity: 0.92; }
  .meta { display: flex; flex-wrap: wrap; gap: 12px 20px; padding: 12px 20px; background: ${b.soft}; border: 1px solid ${b.line}; border-top: none; font-size: 0.78rem; color: ${b.muted}; }
  .meta strong { color: ${b.primaryDeep}; }
  .table-shell { background: #fff; border: 1px solid ${b.line}; border-top: none; border-radius: 0 0 12px 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(55, 124, 192, 0.1); }
  table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.8rem; }
  th { background: ${b.primary}; color: #fff; text-align: left; padding: 11px 12px; font-weight: 700; border: 1px solid ${b.primaryDeep}; vertical-align: bottom; }
  td { padding: 9px 12px; border: 1px solid ${b.line}; vertical-align: top; background: #ffffff; }
  tbody tr:nth-child(even) td { background: rgba(204, 229, 248, 0.22); }
  .is-numeric { text-align: right; font-variant-numeric: tabular-nums; }
  .code { display: inline-block; padding: 2px 7px; border-radius: 999px; background: rgba(55, 124, 192, 0.12); color: ${b.primaryDeeper}; font-weight: 700; }
  .note { display: inline-block; line-height: 1.45; color: ${b.text}; }
  .empty-value { color: ${b.muted}; }
  .pill { display: inline-flex; align-items: center; justify-content: center; min-height: 26px; padding: 2px 10px; border-radius: 999px; font-size: 0.73rem; font-weight: 800; border: 1px solid transparent; white-space: nowrap; }
  .pill-success { background: rgba(27, 142, 95, 0.12); color: #156f4b; border-color: rgba(27, 142, 95, 0.22); }
  .pill-warning { background: rgba(217, 119, 6, 0.12); color: #9a5a04; border-color: rgba(217, 119, 6, 0.22); }
  .pill-danger { background: rgba(214, 40, 40, 0.1); color: #a11d1d; border-color: rgba(214, 40, 40, 0.2); }
  .pill-info { background: rgba(55, 124, 192, 0.12); color: ${b.primaryDeeper}; border-color: rgba(55, 124, 192, 0.2); }
  .pill-neutral { background: rgba(100, 116, 139, 0.12); color: ${b.muted}; border-color: rgba(100, 116, 139, 0.18); }
  td.empty { text-align: center; color: ${b.muted}; font-style: italic; }
  .foot { margin-top: 14px; font-size: 0.72rem; color: ${b.muted}; text-align: center; }
  .print-hint { margin-top: 16px; padding: 10px 14px; background: #fff; border: 1px dashed ${b.line}; border-radius: 8px; font-size: 0.78rem; color: ${b.muted}; }
  @media print {
    body { background: #fff; }
    .wrap { padding: 0; max-width: none; }
    .print-hint { display: none; }
    .table-shell { box-shadow: none; border-radius: 0; }
  }
  @media (max-width: 720px) {
    .banner-brand { align-items: flex-start; }
    .banner-logo-wrap { width: 68px; min-width: 68px; height: 68px; border-radius: 14px; padding: 8px; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <header class="banner">
      <div class="banner-brand">
        <div class="banner-logo-wrap"><img class="banner-logo" src="${logoSrc}" alt="Logo de Transportes Antares" /></div>
        <div class="banner-copy">
          <h1>${safeTitle}</h1>
          <p>Transportes Antares · Centro de reportería</p>
        </div>
      </div>
    </header>
    <div class="meta">
      <span><strong>Generado:</strong> ${generatedAt}</span>
      ${generatedBy ? `<span><strong>Usuario:</strong> ${generatedBy}</span>` : ""}
      <span><strong>Registros:</strong> ${rowCount}</span>
    </div>
    <div class="table-shell">
      <table>
        <thead><tr>${thead}</tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
    <p class="print-hint">Para guardar como PDF: abra este archivo en el navegador y use <strong>Imprimir → Guardar como PDF</strong> (Ctrl+P).</p>
    <p class="foot">${copyrightText}<br/>Documento generado por Antares. Uso interno y operativo.</p>
  </div>
</body>
</html>`;
}

function buildCatalogReportExcelHtml(title, columns = [], rows = [], meta = {}) {
  const safeTitle = reportsBiExcelEsc(title || "Reporte");
  const tableHtml = reportsBiExcelTable(
    (columns || []).map((c) => c.label),
    (rows || []).map((row) => (columns || []).map((col) => row[col.key] ?? "-"))
  );
  const b = REPORT_EXPORT_BRAND;
  const logoSrc = reportsBiExcelEsc(meta.logoSrc || reportBrandLogoSrc());
  const generatedAt = reportsBiExcelEsc(meta.generatedAt || fmtDate(nowIso()));
  const generatedBy = meta.generatedBy ? reportsBiExcelEsc(meta.generatedBy) : "";
  const copyrightText = reportsBiExcelEsc(meta.copyrightText || reportBrandCopyrightText());
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" lang="es">
<head><meta charset="utf-8"/>
<style>
body{font-family:Montserrat,Arial,sans-serif;color:${b.text}}
.xls-logo-cell{background:#ffffff;padding:12px 14px 6px;border-bottom:0}
.xls-logo{width:150px;max-width:150px;height:auto;display:block}
.xls-banner{background:${b.primaryDeeper};color:#fff;font-size:16pt;font-weight:700;padding:12px 14px}
.xls-meta{color:${b.muted};font-size:9pt;padding:8px 14px}
.xls-foot{color:${b.muted};font-size:9pt;padding:10px 14px}
</style>
</head>
<body>
<table width="100%" cellspacing="0" cellpadding="0">
<tr><td class="xls-logo-cell" colspan="${Math.max(4, (columns || []).length)}"><img class="xls-logo" src="${logoSrc}" alt="Logo de Transportes Antares" /></td></tr>
<tr><td class="xls-banner" colspan="${Math.max(4, (columns || []).length)}">${safeTitle}</td></tr>
<tr><td class="xls-meta" colspan="${Math.max(4, (columns || []).length)}">Transportes Antares · ${generatedAt}${generatedBy ? ` · ${generatedBy}` : ""}</td></tr>
<tr><td colspan="${Math.max(4, (columns || []).length)}">${tableHtml}</td></tr>
<tr><td class="xls-foot" colspan="${Math.max(4, (columns || []).length)}">${copyrightText}</td></tr>
</table>
</body></html>`;
}

async function exportCatalogReport(report, format = "pdf") {
  const title = report?.title || "Reporte";
  const columns = report?.columns || [];
  const rows = report?.rows || [];
  const actor = currentUser();
  const meta = {
    generatedAt: fmtDate(nowIso()),
    generatedBy: actor?.name || actor?.email || "",
    logoSrc: reportBrandLogoSrc(),
    copyrightText: reportBrandCopyrightText()
  };
  if (format === "excel") {
    const html = buildCatalogReportExcelHtml(title, columns, rows, meta);
    downloadBlobFile(reportExportFilename(report, "xls"), "\ufeff" + html, "application/vnd.ms-excel;charset=utf-8;");
    return;
  }
  if (format === "html") {
    const html = buildReportExportHtml(title, columns, rows, meta);
    downloadBlobFile(reportExportFilename(report, "html"), html, "text/html;charset=utf-8;");
    return;
  }
  await exportCatalogReportPdf(report, meta);
}

function renderReportPreviewTableHtml(columns = [], rows = []) {
  const cols = Array.isArray(columns) ? columns : [];
  const dataRows = Array.isArray(rows) ? rows : [];
  const colMeta = reportPreviewColumnMeta(cols, dataRows);
  const thead = colMeta
    .map((col) => {
      const classes = ["report-preview-header", `report-preview-header--${col.type}`];
      if (["currency", "number", "percent"].includes(col.type)) classes.push("is-numeric");
      if (col.pinned) classes.push("is-primary");
      return `<th class="${classes.join(" ")}">${escapeHtml(col.label)}</th>`;
    })
    .join("");
  const tbody = dataRows.length
    ? dataRows
        .map(
          (row) =>
            `<tr>${colMeta
              .map((col) => {
                const classes = ["report-preview-cell", `report-preview-cell--${col.type}`];
                if (["currency", "number", "percent"].includes(col.type)) classes.push("is-numeric");
                if (col.pinned) classes.push("is-primary");
                return `<td class="${classes.join(" ")}">${reportPreviewCellInnerHtml(row[col.key], col.type)}</td>`;
              })
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${Math.max(1, cols.length)}" class="report-preview-empty-row">Sin datos para el periodo o filtros seleccionados.</td></tr>`;
  return `<div class="report-preview-table-wrap"><table class="table report-preview-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
}

function ensureReportPreviewModal() {
  let modal = document.getElementById("report-preview-modal");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "report-preview-modal";
  modal.className = "modal hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "report-preview-title");
  modal.innerHTML = `<div class="modal-card modal-card-report-preview">
    <div class="modal-head report-preview-head">
      <div class="modal-head__copy report-preview-brand">
        <div class="report-preview-logo-wrap">
          <img id="report-preview-logo" class="report-preview-logo" src="${escapeAttr(reportBrandLogoSrc())}" alt="Logo de Transportes Antares" />
        </div>
        <div>
          <p class="report-preview-kicker">Centro de reportería</p>
          <h2 id="report-preview-title">Reporte</h2>
          <p id="report-preview-meta" class="report-preview-meta muted"></p>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-outline module-panel-btn module-panel-btn--close" data-action="report-preview-close" aria-label="Cerrar vista previa">${IC.x}</button>
    </div>
    <div id="report-preview-body" class="report-preview-body table-wrap"></div>
    <p id="report-preview-copy" class="report-preview-copy muted"></p>
    ${renderModalFooterActions({
      showCancel: false,
      className: "report-preview-actions",
      secondaryHtml: `<button type="button" class="btn btn-sm btn-approve module-panel-btn" data-action="report-preview-download-pdf">${IC.download} PDF</button>
        <button type="button" class="btn btn-sm btn-action module-panel-btn" data-action="report-preview-download-excel">${IC.file} Excel</button>
        <button type="button" class="btn btn-sm btn-action module-panel-btn" data-action="report-preview-print">${IC.printer} Imprimir</button>`,
      primaryHtml: `<button type="button" class="btn btn-primary btn-sm module-panel-btn" data-action="report-preview-close">${IC.x} Cerrar</button>`
    })}
  </div>`;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-action='report-preview-close']").forEach((btn) => {
    btn.addEventListener("click", closeReportPreviewModal);
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeReportPreviewModal();
  });
  modal.querySelector("[data-action='report-preview-download-pdf']")?.addEventListener("click", async () => {
    const payload = state.reportPreviewPayload;
    if (!payload) return;
    try {
      await exportCatalogReport(payload, "pdf");
      notify(userMessage("reportPdfOk"), "success");
    } catch (_e) {
      notify(userMessage("reportExportError"), "error");
    }
  });
  modal.querySelector("[data-action='report-preview-download-excel']")?.addEventListener("click", async () => {
    const payload = state.reportPreviewPayload;
    if (!payload) return;
    try {
      await exportCatalogReport(payload, "excel");
      notify(userMessage("reportExcelExported"), "success");
    } catch (_e) {
      notify(userMessage("reportExportError"), "error");
    }
  });
  modal.querySelector("[data-action='report-preview-print']")?.addEventListener("click", () => {
    printReportPreviewDocument();
  });
  return modal;
}

function printReportPreviewDocument() {
  const report = state.reportPreviewPayload;
  if (!report) return;
  const actor = currentUser();
  const html = buildReportExportHtml(report.title, report.columns, report.rows, {
    generatedAt: fmtDate(nowIso()),
    generatedBy: actor?.name || actor?.email || ""
  });
  let frame = document.getElementById("report-print-frame");
  if (!frame) {
    frame = document.createElement("iframe");
    frame.id = "report-print-frame";
    frame.setAttribute("title", "Impresión de reporte");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none";
    document.body.appendChild(frame);
  }
  const doc = frame.contentWindow?.document;
  if (!doc) {
    notify(userMessage("reportExportError"), "error");
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  frame.contentWindow.focus();
  setTimeout(() => {
    try {
      frame.contentWindow.print();
    } catch (_e) {
      notify(userMessage("reportExportError"), "error");
    }
  }, 320);
}

function closeReportPreviewModal() {
  const modal = document.getElementById("report-preview-modal");
  if (modal) modal.classList.add("hidden");
  document.removeEventListener("keydown", reportPreviewEscHandler);
}

function reportPreviewEscHandler(event) {
  if (event.key === "Escape") closeReportPreviewModal();
}

function openReportPreviewModal(report) {
  const payload = {
    title: report?.title || "Reporte",
    columns: report?.columns || [],
    rows: report?.rows || [],
    fileName: report?.fileName || "reporte.pdf"
  };
  state.reportPreviewPayload = payload;
  const modal = ensureReportPreviewModal();
  const actor = currentUser();
  const titleEl = modal.querySelector("#report-preview-title");
  const metaEl = modal.querySelector("#report-preview-meta");
  const bodyEl = modal.querySelector("#report-preview-body");
  const logoEl = modal.querySelector("#report-preview-logo");
  const copyEl = modal.querySelector("#report-preview-copy");
  if (titleEl) titleEl.textContent = payload.title;
  if (metaEl) {
    metaEl.textContent = `Generado ${fmtDate(nowIso())}${actor?.name ? ` · ${actor.name}` : ""} · ${payload.rows.length} registro${payload.rows.length === 1 ? "" : "s"} · ${payload.columns.length} columna${payload.columns.length === 1 ? "" : "s"}`;
  }
  if (logoEl) logoEl.src = reportBrandLogoSrc();
  if (bodyEl) bodyEl.innerHTML = renderReportPreviewTableHtml(payload.columns, payload.rows);
  if (copyEl) copyEl.textContent = `${reportBrandCopyrightText()} · Estados, riesgos y valores destacados para facilitar la lectura del reporte.`;
  modal.classList.remove("hidden");
  document.addEventListener("keydown", reportPreviewEscHandler);
}

/** @deprecated Usar openReportPreviewModal o exportCatalogReport */
function openReportPdf(title, columns = [], rows = []) {
  openReportPreviewModal({ title, columns, rows, fileName: "reporte.pdf" });
}

function deriveRequestOperationalValue(request) {
  const invoiceTotal = parseNum(request?.trip?.invoice?.total || 0);
  if (invoiceTotal > 0) return invoiceTotal;
  const base = parseNum(request?.insuredValue || request?.tripValue || 0);
  const standby = parseNum(request?.standbyChargeTotal || 0);
  return base + standby;
}

function minutesBetween(startDate, endDate) {
  const startTs = new Date(startDate || "").getTime();
  const endTs = new Date(endDate || "").getTime();
  if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || endTs < startTs) return 0;
  return Math.round((endTs - startTs) / 60000);
}

function hoursBetween(startDate, endDate) {
  const mins = minutesBetween(startDate, endDate);
  return Number((mins / 60).toFixed(2));
}

function requestExpectedDeliveryDate(request) {
  return request?.trip?.etaDelivery || request?.etaDelivery || "";
}

function requestActualDeliveryDate(request) {
  return request?.deliveredAt || request?.closedAt || "";
}

function requestIsOperationallyClosed(request) {
  return Boolean(requestActualDeliveryDate(request)) || [STATUS.COMPLETADA, STATUS.CERRADA].includes(request?.status);
}

function reportPercent(value, total, digits = 1) {
  const denom = parseNum(total);
  if (denom <= 0) return 0;
  return Number(((parseNum(value) / denom) * 100).toFixed(digits));
}

function slaDelayMinutesForRequest(request) {
  if (!request?.trip || !requestIsOperationallyClosed(request)) return null;
  const etaTs = new Date(requestExpectedDeliveryDate(request)).getTime();
  const deliveredTs = new Date(requestActualDeliveryDate(request)).getTime();
  if (!Number.isFinite(etaTs) || !Number.isFinite(deliveredTs)) return null;
  return Math.max(0, Math.round((deliveredTs - etaTs) / 60000));
}

function slaStatusForRequest(request) {
  if (!request?.trip) return "Sin viaje";
  const etaTs = new Date(requestExpectedDeliveryDate(request)).getTime();
  if (!Number.isFinite(etaTs)) return "Sin ETA";
  if (!requestIsOperationallyClosed(request)) return "En curso";
  const deliveredTs = new Date(requestActualDeliveryDate(request)).getTime();
  if (!Number.isFinite(deliveredTs)) return "Sin dato";
  return deliveredTs <= etaTs ? "Cumple SLA" : "Incumple SLA";
}

function requestLifecycleSummary(request) {
  const notes = [];
  const rejection = String(request?.rejectionReason || "").trim();
  const cancellation = String(request?.cancellationReason || "").trim();
  const standby = parseNum(request?.standbyChargeTotal || 0);
  const insuredValue = parseNum(request?.insuredValue || 0);
  const distanceKm = parseNum(request?.distanceKm || 0);
  const invoiceNumber = String(request?.trip?.invoice?.number || "").trim();
  if (cancellation) notes.push(`Cancelación: ${cancellation}`);
  if (rejection) notes.push(`Rechazo: ${rejection}`);
  if (request?.autoApproved) notes.push("Aprobación automática");
  if (insuredValue > 0) notes.push(`Asegurado $${insuredValue.toLocaleString("es-CO")}`);
  if (distanceKm > 0) notes.push(`${distanceKm.toLocaleString("es-CO")} km`);
  if (standby > 0) notes.push(`Standby $${standby.toLocaleString("es-CO")}`);
  if (invoiceNumber) notes.push(`Factura ${invoiceNumber}`);
  return notes.join(" · ") || "-";
}

function requestFunnelStageDescription(status) {
  const descriptions = {
    [STATUS.PENDIENTE]: "Solicitud radicada y pendiente de revisión.",
    [STATUS.APROBADA_PENDIENTE_ASIGNACION]: "Solicitud aprobada, pendiente de asignación de recursos.",
    [STATUS.VIAJE_ASIGNADO]: "Viaje creado y listo para iniciar operación.",
    [STATUS.EN_TRANSITO]: "Servicio en ejecución con recursos asignados.",
    [STATUS.ESPERA_STANDBY]: "Operación en espera con cargos de standby activos.",
    [STATUS.COMPLETADA]: "Servicio entregado y pendiente de cierre administrativo final.",
    [STATUS.CERRADA]: "Proceso operativo y administrativo cerrado.",
    [STATUS.CANCELADA]: "Solicitud cancelada antes del cierre.",
    [STATUS.RECHAZADA]: "Solicitud rechazada en validación."
  };
  return descriptions[status] || "Estado operativo registrado en el portal.";
}

function buildReportDataset(reportId, actor = currentUser(), filters = null) {
  const exportFilters = normalizeReportsExportFilters(filters || state.reportsUi?.exportFilters);
  if (!canAccessReport(actor, reportId)) {
    return {
      title: "Reporte restringido",
      columns: [{ key: "message", label: "Detalle" }],
      rows: [{ message: "No tienes permisos para generar este reporte." }],
      fileName: "reporte_restringido.csv"
    };
  }
  const requests = reportsFilterByPeriod(reqRead(), exportFilters.period);
  if (reportId === "executive_control_tower") {
    const trips = requests.filter((request) => request.trip);
    const closedTrips = requests.filter((request) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(request.status));
    const pendingApprovals = requests.filter((request) => request.status === STATUS.PENDIENTE).length;
    const sstControls = reportsFilterItemsByPeriod(read(KEYS.sstCompliance, []), exportFilters.period, (item) => item.dueDate || item.createdAt);
    const payrollRuns = reportsFilterItemsByPeriod(read(KEYS.payrollRuns, []), exportFilters.period, (run) => run.paidAt || run.createdAt || `${run.month || ""}-01`);
    const contracts = reportsFilterItemsByPeriod(read(KEYS.contracts, []), exportFilters.period, (item) => item.createdAt || item.generatedAt || item.signedAt);
    const totalRevenue = requests.reduce((acc, request) => acc + deriveRequestOperationalValue(request), 0);
    const paidPayroll = payrollRuns.filter((run) => run.paid).reduce((acc, run) => acc + parseNum(run.net), 0);
    const openApprovals = reportsFilterItemsByPeriod(read(KEYS.approvals, []), exportFilters.period, (approval) => approval.requestedAt || approval.reviewedAt || approval.createdAt)
      .filter((approval) => approval.status === "pendiente").length;
    const rows = [
      { metric: "Solicitudes totales", value: requests.length, detail: "Acumulado histórico", category: "Operación" },
      { metric: "Solicitudes pendientes", value: pendingApprovals, detail: "Esperando gestión operativa", category: "Operación" },
      { metric: "Viajes cerrados", value: closedTrips.length, detail: `${trips.length} viajes creados`, category: "Operación" },
      { metric: "Ingresos operativos estimados", value: `$${parseNum(totalRevenue).toLocaleString("es-CO")}`, detail: "Incluye standby e invoice", category: "Finanzas" },
      { metric: "Nómina neta pagada", value: `$${parseNum(paidPayroll).toLocaleString("es-CO")}`, detail: `${payrollRuns.length} liquidaciones`, category: "Finanzas" },
      { metric: "Contratos emitidos", value: contracts.length, detail: "Formalización laboral", category: "RRHH" },
      { metric: "Controles SST activos", value: sstControls.length, detail: "Seguridad social y documental", category: "Cumplimiento" },
      { metric: "Aprobaciones abiertas", value: openApprovals, detail: "Solicitudes por decidir", category: "Gobierno" }
    ];
    return {
      title: "Resumen ejecutivo de gestión",
      columns: [
        { key: "category", label: "Categoría" },
        { key: "metric", label: "Métrica" },
        { key: "value", label: "Valor" },
        { key: "detail", label: "Detalle" }
      ],
      rows,
      fileName: "reporte_resumen_ejecutivo.csv"
    };
  }
  if (reportId === "service_levels") {
    const rows = requests
      .filter((request) => request.trip)
      .map((request) => {
        const expectedDelivery = requestExpectedDeliveryDate(request);
        const actualDelivery = requestActualDeliveryDate(request);
        const cycleHours = actualDelivery ? hoursBetween(request.createdAt, actualDelivery) : "-";
        const approvalMinutes = request.approvedAt ? minutesBetween(request.createdAt, request.approvedAt) : "-";
        const delayMinutes = slaDelayMinutesForRequest(request);
        return {
          requestNumber: request.requestNumber || request.id,
          tripNumber: request.trip?.tripNumber || "-",
          client: request.clientName || "-",
          route: formatRoute(request),
          assignedAt: fmtDate(request.trip?.assignedAt || request.approvedAt || request.createdAt),
          etaDelivery: expectedDelivery ? fmtDate(expectedDelivery) : "-",
          deliveredAt: actualDelivery ? fmtDate(actualDelivery) : "-",
          status: prettyStatus(request.status, "request").replace(/<[^>]+>/g, ""),
          cycleHours,
          approvalMinutes,
          delayMinutes: delayMinutes == null ? "-" : delayMinutes,
          slaStatus: slaStatusForRequest(request)
        };
      });
    return {
      title: "Cumplimiento de nivel de servicio",
      columns: [
        { key: "requestNumber", label: "Solicitud" },
        { key: "tripNumber", label: "Viaje" },
        { key: "slaStatus", label: "SLA" },
        { key: "status", label: "Estado actual" },
        { key: "client", label: "Cliente" },
        { key: "route", label: "Ruta" },
        { key: "assignedAt", label: "Asignación" },
        { key: "etaDelivery", label: "ETA entrega" },
        { key: "deliveredAt", label: "Entrega real" },
        { key: "approvalMinutes", label: "Aprobación (min)" },
        { key: "delayMinutes", label: "Desviación (min)" },
        { key: "cycleHours", label: "Ciclo (h)" }
      ],
      rows,
      fileName: "reporte_cumplimiento_nivel_servicio.csv"
    };
  }
  if (reportId === "fleet_summary") {
    const activeTrips = getActiveTrips();
    const busyVehicleIds = new Set(activeTrips.map((r) => String(r.trip?.vehicleId || "")).filter(Boolean));
    const rows = read(KEYS.vehicles, []).map((vehicle) => {
      const trips = requests.filter((r) => r.trip?.vehicleId === vehicle.id);
      const activeTripsForVehicle = trips.filter((r) => tripRequestStatusIsOperational(r.status)).length;
      const completed = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
      const closurePct = reportPercent(completed, trips.length, 1);
      const soatRisk = docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate);
      const techRisk = docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate);
      const occupancy =
        busyVehicleIds.has(String(vehicle.id))
          ? "Ocupado (viaje activo)"
          : vehicle.available
            ? "Disponible"
            : "No disponible";
      return {
        plate: vehicle.plate,
        type: vehicle.type,
        capacityKg: parseNum(vehicle.capacityKg),
        operationalState: occupancy,
        activeTrips: activeTripsForVehicle,
        historicalTrips: trips.length,
        completedTrips: completed,
        closurePct: `${closurePct}%`,
        documentRisk: soatRisk.days < 0 || techRisk.days < 0 ? "Crítico" : (soatRisk.days <= 30 || techRisk.days <= 30 ? "Atención" : "Controlado"),
        soatExpiry: vehicle.soatExpiryDate || "-",
        techExpiry: vehicle.techInspectionExpiryDate || "-"
      };
    });
    return {
      title: "Disponibilidad y productividad de flota",
      columns: [
        { key: "plate", label: "Placa" },
        { key: "type", label: "Tipo" },
        { key: "capacityKg", label: "Capacidad kg" },
        { key: "operationalState", label: "Estado operativo" },
        { key: "activeTrips", label: "Viajes activos" },
        { key: "historicalTrips", label: "Viajes históricos" },
        { key: "completedTrips", label: "Viajes finalizados" },
        { key: "closurePct", label: "Cierre histórico" },
        { key: "documentRisk", label: "Riesgo documental" },
        { key: "soatExpiry", label: "Vence SOAT" },
        { key: "techExpiry", label: "Vence tecnomecánica" }
      ],
      rows,
      fileName: "reporte_disponibilidad_flota.csv"
    };
  }
  if (reportId === "trips_operations") {
    const rows = requests.filter((r) => r.trip).map((request) => {
      const actualDelivery = requestActualDeliveryDate(request);
      return {
        tripNumber: request.trip.tripNumber,
        requestNumber: request.requestNumber || request.id,
        client: request.clientName,
        driver: request.trip.driverName,
        vehicle: request.trip.vehiclePlate,
        route: formatRoute(request),
        serviceMode: normalizeRequestTransportMode(request.serviceType),
        thermoking: requestRequiresTermoking(request) ? "Sí" : "No",
        status: prettyStatus(request.status, "request").replace(/<[^>]+>/g, ""),
        slaStatus: slaStatusForRequest(request),
        cycleHours: actualDelivery ? hoursBetween(request.createdAt, actualDelivery) : "-",
        operationalValue: parseNum(deriveRequestOperationalValue(request)),
        standbyValue: parseNum(request.standbyChargeTotal || 0),
        invoiceNumber: request.trip?.invoice?.number || "-",
        assignedAt: fmtDate(request.trip.assignedAt || request.approvedAt || request.createdAt),
        deliveredAt: actualDelivery ? fmtDate(actualDelivery) : "-"
      };
    });
    return {
      title: "Seguimiento operativo de viajes",
      columns: [
        { key: "tripNumber", label: "Viaje" },
        { key: "status", label: "Estado" },
        { key: "slaStatus", label: "SLA" },
        { key: "client", label: "Cliente" },
        { key: "route", label: "Ruta" },
        { key: "driver", label: "Conductor" },
        { key: "vehicle", label: "Camion" },
        { key: "serviceMode", label: "Modalidad" },
        { key: "thermoking", label: "Termoking" },
        { key: "assignedAt", label: "Asignado" },
        { key: "deliveredAt", label: "Entrega/Cierre" },
        { key: "cycleHours", label: "Ciclo (h)" },
        { key: "operationalValue", label: "Valor operativo" },
        { key: "standbyValue", label: "Standby" },
        { key: "invoiceNumber", label: "Factura" },
        { key: "requestNumber", label: "Solicitud" }
      ],
      rows,
      fileName: "reporte_seguimiento_viajes.csv"
    };
  }
  if (reportId === "requests_lifecycle") {
    const rows = requests.map((request) => ({
      requestNumber: request.requestNumber || request.id,
      requestedBy: request.requestedByName || request.clientName || "-",
      company: getCompanyById(request.clientCompanyId)?.name || "-",
      route: formatRoute(request),
      serviceMode: normalizeRequestTransportMode(request.serviceType),
      value: parseNum(deriveRequestOperationalValue(request)),
      status: prettyStatus(request.status, "request").replace(/<[^>]+>/g, ""),
      approvedBy: request.approvedBy || "-",
      approvalMinutes: request.approvedAt ? minutesBetween(request.createdAt, request.approvedAt) : "-",
      hasTrip: request.trip ? "Sí" : "No",
      createdAt: fmtDate(request.createdAt),
      approvedAt: request.approvedAt ? fmtDate(request.approvedAt) : "-",
      lifecycleNote: requestLifecycleSummary(request)
    }));
    return {
      title: "Trazabilidad de solicitudes",
      columns: [
        { key: "requestNumber", label: "Solicitud" },
        { key: "status", label: "Estado" },
        { key: "requestedBy", label: "Solicitante" },
        { key: "company", label: "Empresa" },
        { key: "route", label: "Ruta" },
        { key: "serviceMode", label: "Modalidad" },
        { key: "value", label: "Valor viaje" },
        { key: "hasTrip", label: "Tiene viaje" },
        { key: "approvedBy", label: "Responsable decisión" },
        { key: "approvalMinutes", label: "Aprobación (min)" },
        { key: "createdAt", label: "Creada" },
        { key: "approvedAt", label: "Aprobada" },
        { key: "lifecycleNote", label: "Novedad relevante" }
      ],
      rows,
      fileName: "reporte_trazabilidad_solicitudes.csv"
    };
  }
  if (reportId === "drivers_performance") {
    const rows = read(KEYS.drivers, []).map((driver) => {
      const trips = requests.filter((r) => r.trip?.driverId === driver.id);
      const licenseDays = daysUntil(driver.licenseExpiry);
      const activeTrips = trips.filter((r) => tripRequestStatusIsOperational(r.status)).length;
      const completedTrips = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
      return {
        name: driver.name,
        doc: driver.idDoc || "-",
        phone: driver.phone || "-",
        company: getCompanyById(driver.companyId)?.name || "-",
        license: `${driver.license || "-"} (${driver.licenseCategory || "-"})`,
        licenseRisk:
          !Number.isFinite(licenseDays)
            ? "Sin fecha"
            : licenseDays < 0
              ? `Vencida (${Math.abs(licenseDays)} días)`
              : licenseDays <= 30
                ? `Por vencer (${licenseDays} días)`
                : `Vigente (${licenseDays} días)`,
        activeTrips,
        trips: trips.length,
        completedTrips,
        completionRate: `${reportPercent(completedTrips, trips.length, 1)}%`
      };
    });
    return {
      title: "Desempeño y habilitación de conductores",
      columns: [
        { key: "name", label: "Conductor" },
        { key: "doc", label: "Documento" },
        { key: "phone", label: "Telefono" },
        { key: "company", label: "Empresa" },
        { key: "license", label: "Licencia" },
        { key: "licenseRisk", label: "Vigencia licencia" },
        { key: "activeTrips", label: "Viajes activos" },
        { key: "trips", label: "Viajes totales" },
        { key: "completedTrips", label: "Viajes finalizados" },
        { key: "completionRate", label: "Tasa de cierre" }
      ],
      rows,
      fileName: "reporte_desempeno_conductores.csv"
    };
  }
  if (reportId === "payroll_summary") {
    const payrollRuns = reportsFilterItemsByPeriod(read(KEYS.payrollRuns, []), exportFilters.period, (run) => run.paidAt || run.createdAt || `${run.month || ""}-01`);
    const hrAbsences = read(KEYS.hrAbsences, []);
    const rows = payrollRuns.map((run) => {
      const inc = run.noveltiesDetail?.incapacity;
      const incapacityAdjust = inc ? parseNum(inc.totalAdjustCop) : 0;
      const incapacitySummary =
        inc && Array.isArray(inc.episodes) && inc.episodes.length
          ? inc.episodes
              .map((e) => `${e.days ?? "?"}d·${parseNum(e.adjustCop).toLocaleString("es-CO")}`)
              .join("; ")
          : "";
      const absenceSummary = buildPayrollAbsenceSummaryText(run, hrAbsences);
      return {
        month: run.month,
        employee: run.employeeName,
        gross: parseNum(run.gross),
        incapacityAdjust,
        incapacitySummary,
        absenceSummary,
        travelAllowance: parseNum(run.travelAllowance || 0),
        fuelReimbursement: parseNum(run.fuelReimbursement || 0),
        deductions: parseNum(run.deductions),
        net: parseNum(run.net),
        paidAt: run.paidAt ? fmtDate(run.paidAt) : "-",
        paidApprovedBy: run.paidApprovedBy || "-",
        status: run.paid ? "Pagado" : "Pendiente"
      };
    });
    return {
      title: "Consolidado de nómina",
      columns: [
        { key: "month", label: "Mes" },
        { key: "employee", label: "Empleado" },
        { key: "gross", label: "Devengado" },
        { key: "incapacityAdjust", label: "Ajuste ausentismos (COP)" },
        { key: "incapacitySummary", label: "Incapacidad (resumen)" },
        { key: "absenceSummary", label: "Ausentismos (resumen)" },
        { key: "travelAllowance", label: "Viaticos" },
        { key: "fuelReimbursement", label: "Reembolso combustible" },
        { key: "deductions", label: "Deducciones" },
        { key: "net", label: "Neto" },
        { key: "paidAt", label: "Fecha pago" },
        { key: "paidApprovedBy", label: "Aprobado por" },
        { key: "status", label: "Estado" }
      ],
      rows,
      fileName: "reporte_consolidado_nomina.csv"
    };
  }
  if (reportId === "hiring_pipeline") {
    const interviews = read(KEYS.interviews, []);
    const contracts = reportsFilterItemsByPeriod(read(KEYS.contracts, []), exportFilters.period, (item) => item.createdAt || item.generatedAt || item.signedAt);
    const candidates = reportsFilterItemsByPeriod(read(KEYS.candidates, []), exportFilters.period, (candidate) => candidate.createdAt);
    const rows = candidates.map((candidate) => {
      const ai = portalCandidateAgeFromBirthIso(candidate.birthDate);
      const interviewCount = interviews.filter((item) => String(item.candidateId || "") === String(candidate.id)).length;
      const contract = contracts.find((item) => String(item.candidateId || "") === String(candidate.id));
      return {
        name: candidate.name,
        vacancy: candidate.vacancyTitle,
        source: candidate.source || "-",
        status: candidate.status,
        birthDate: ai.birthLabel === "—" ? "-" : ai.birthLabel,
        ageYears: ai.age != null ? String(ai.age) : "-",
        expCargoYears: parseNum(candidate.experienceYears || 0),
        expectedSalary: parseNum(candidate.expectedSalary || 0),
        interviewCount,
        hasInterview: interviewCount > 0 ? "Sí" : "No",
        hasContract: contract ? "Sí" : "No",
        contractDate: contract?.createdAt ? fmtDate(contract.createdAt) : "-",
        stageAgeDays: Math.max(0, Math.floor((Date.now() - new Date(candidate.createdAt || nowIso()).getTime()) / 86400000)),
        createdAt: fmtDate(candidate.createdAt)
      };
    });
    return {
      title: "Gestión de selección y contratación",
      columns: [
        { key: "name", label: "Candidato" },
        { key: "vacancy", label: "Vacante" },
        { key: "source", label: "Fuente" },
        { key: "status", label: "Estado proceso" },
        { key: "birthDate", label: "Fecha nacimiento" },
        { key: "ageYears", label: "Edad" },
        { key: "expCargoYears", label: "Años exp. cargo" },
        { key: "expectedSalary", label: "Aspiracion" },
        { key: "interviewCount", label: "Entrevistas" },
        { key: "hasInterview", label: "Entrevista" },
        { key: "hasContract", label: "Contrato" },
        { key: "contractDate", label: "Fecha contrato" },
        { key: "stageAgeDays", label: "Edad etapa (días)" },
        { key: "createdAt", label: "Fecha" }
      ],
      rows,
      fileName: "reporte_seleccion_contratacion.csv"
    };
  }
  if (reportId === "labor_compliance") {
    const employees = read(KEYS.payrollEmployees, []);
    const records = reportsFilterItemsByPeriod(read(KEYS.sstCompliance, []), exportFilters.period, (item) => item.dueDate || item.createdAt);
    const rows = records.map((item) => {
      const employee = employees.find((row) => String(row.id || "") === String(item.employeeId || ""));
      const dueDays = Number.isFinite(daysUntil(item.dueDate)) ? daysUntil(item.dueDate) : null;
      return {
        employee: item.employeeName || employee?.name || "-",
        employeeDoc: employee?.idDoc || "-",
        control: item.recordType || "-",
        provider: item.provider || "-",
        dueDate: item.dueDate || "-",
        daysToDue: dueDays == null ? "-" : dueDays,
        riskLevel: dueDays == null ? "Sin fecha" : dueDays < 0 ? "Vencido" : dueDays <= 30 ? "Próximo a vencer" : "Controlado",
        status: item.status || "-",
        documentCode: item.documentCode || "-",
        createdAt: fmtDate(item.createdAt)
      };
    });
    return {
      title: "Cumplimiento laboral y SST",
      columns: [
        { key: "employee", label: "Empleado" },
        { key: "employeeDoc", label: "Documento" },
        { key: "control", label: "Control" },
        { key: "provider", label: "Entidad" },
        { key: "dueDate", label: "Vencimiento" },
        { key: "daysToDue", label: "Días al vencimiento" },
        { key: "riskLevel", label: "Riesgo" },
        { key: "status", label: "Estado" },
        { key: "documentCode", label: "Codigo" },
        { key: "createdAt", label: "Registro" }
      ],
      rows,
      fileName: "reporte_cumplimiento_laboral_sst.csv"
    };
  }
  if (reportId === "users_access") {
    const users = reportsFilterItemsByPeriod(read(KEYS.users, []), exportFilters.period, (user) => user.systemJoinDate || user.registeredAt || user.createdAt);
    const rows = users.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      company: getCompanyById(user.companyId)?.name || user.company || "-",
      status: user.accountStatus || "aprobado",
      permissions: (user.permissions || []).length,
      source: user.source || "portal_db",
      joinDate: fmtDate(user.systemJoinDate || user.registeredAt || user.createdAt)
    }));
    return {
      title: "Gobierno de usuarios y accesos",
      columns: [
        { key: "name", label: "Nombre" },
        { key: "email", label: "Correo" },
        { key: "role", label: "Rol" },
        { key: "company", label: "Empresa" },
        { key: "status", label: "Estado cuenta" },
        { key: "permissions", label: "Permisos" },
        { key: "source", label: "Origen" },
        { key: "joinDate", label: "Ingreso sistema" }
      ],
      rows,
      fileName: "reporte_gobierno_accesos.csv"
    };
  }
  if (reportId === "authorizations_traceability") {
    const approvals = reportsFilterItemsByPeriod(read(KEYS.approvals, []), exportFilters.period, (approval) => approval.requestedAt || approval.reviewedAt || approval.createdAt);
    const rows = approvals.map((approval) => ({
      title: approval.title,
      type: approval.type,
      status: approval.status,
      requestedBy: approval.requestedByName,
      requestedAt: fmtDate(approval.requestedAt),
      reviewedBy: approval.reviewedBy || "-",
      reviewedAt: fmtDate(approval.reviewedAt),
      resolutionHours: approval.reviewedAt ? hoursBetween(approval.requestedAt, approval.reviewedAt) : "-",
      rejectionReason: approval.rejectionReason || "-"
    }));
    return {
      title: "Trazabilidad de autorizaciones",
      columns: [
        { key: "title", label: "Titulo" },
        { key: "type", label: "Tipo" },
        { key: "status", label: "Estado" },
        { key: "requestedBy", label: "Solicitante" },
        { key: "requestedAt", label: "Fecha solicitud" },
        { key: "reviewedBy", label: "Aprobador" },
        { key: "reviewedAt", label: "Fecha revision" },
        { key: "resolutionHours", label: "Resolución (h)" },
        { key: "rejectionReason", label: "Observación / rechazo" }
      ],
      rows,
      fileName: "reporte_trazabilidad_autorizaciones.csv"
    };
  }
  if (reportId === "fuel_operations") {
    const rows = reportsFilterItemsByPeriod(readFuelLogs(), exportFilters.period, (log) => log.date || log.createdAt).map((log) => ({
      date: log.date || "-",
      driver: log.driverName || "-",
      vehicle: log.vehiclePlate || "-",
      station: log.station || "-",
      liters: parseNum(log.liters),
      totalCost: parseNum(log.totalCost),
      costPerLiter: parseNum(log.costPerLiter),
      paidBy: String(log.paidBy || "empresa").toLowerCase() === "conductor" ? "Conductor (reembolso)" : "Empresa",
      odometerKm: parseNum(log.odometerKm) > 0 ? parseNum(log.odometerKm) : "-",
      tripRef: log.tripNumber || log.requestNumber || "-"
    }));
    return {
      title: "Consumo y costos de combustible",
      columns: [
        { key: "date", label: "Fecha" },
        { key: "driver", label: "Conductor" },
        { key: "vehicle", label: "Vehículo" },
        { key: "station", label: "Estación" },
        { key: "liters", label: "Litros" },
        { key: "totalCost", label: "Costo COP" },
        { key: "costPerLiter", label: "Costo por litro" },
        { key: "paidBy", label: "Pagado por" },
        { key: "odometerKm", label: "Odómetro km" },
        { key: "tripRef", label: "Viaje / solicitud" }
      ],
      rows,
      fileName: "reporte_consumo_combustible.csv"
    };
  }
  if (reportId === "maintenance_fleet") {
    const rows = reportsFilterItemsByPeriod(readVehicleTechnicalLogs(), exportFilters.period, (log) => log.date || log.createdAt).map((log) => ({
      date: log.date || "-",
      vehicle: log.vehiclePlate || "-",
      kind: log.kind || log.type || "-",
      description: String(log.description || "-").slice(0, 120),
      cost: parseNum(log.cost),
      downtimeHours: parseNum(log.downtimeHours || log.hoursOut || 0),
      costPerDowntimeHour:
        parseNum(log.downtimeHours || log.hoursOut || 0) > 0
          ? Math.round(parseNum(log.cost) / parseNum(log.downtimeHours || log.hoursOut || 0))
          : "-",
      status: log.status || "-"
    }));
    return {
      title: "Gestión de mantenimiento de flota",
      columns: [
        { key: "date", label: "Fecha" },
        { key: "vehicle", label: "Vehículo" },
        { key: "kind", label: "Tipo" },
        { key: "description", label: "Descripción" },
        { key: "cost", label: "Costo COP" },
        { key: "downtimeHours", label: "Horas fuera" },
        { key: "costPerDowntimeHour", label: "Costo / hora fuera" },
        { key: "status", label: "Estado" }
      ],
      rows,
      fileName: "reporte_mantenimiento_flota.csv"
    };
  }
  if (reportId === "revenue_by_route") {
    const byRoute = {};
    const totalRevenue = requests.reduce((acc, request) => acc + deriveRequestOperationalValue(request), 0);
    requests
      .filter((r) => r.trip)
      .forEach((r) => {
        const route = formatRoute(r);
        if (!byRoute[route]) byRoute[route] = { trips: 0, revenue: 0, clients: new Set() };
        byRoute[route].trips += 1;
        byRoute[route].revenue += deriveRequestOperationalValue(r);
        byRoute[route].clients.add(String(r.clientName || "Sin cliente").trim() || "Sin cliente");
      });
    const rows = Object.entries(byRoute)
      .map(([route, data]) => ({
        route,
        clients: data.clients.size,
        trips: data.trips,
        revenue: parseNum(data.revenue),
        avgTicket: data.trips ? Math.round(data.revenue / data.trips) : 0,
        sharePct: `${reportPercent(data.revenue, totalRevenue, 1)}%`
      }))
      .sort((a, b) => b.revenue - a.revenue);
    return {
      title: "Ingresos y ticket promedio por ruta",
      columns: [
        { key: "route", label: "Ruta" },
        { key: "clients", label: "Clientes" },
        { key: "trips", label: "Viajes" },
        { key: "revenue", label: "Recaudo COP" },
        { key: "avgTicket", label: "Ticket promedio" },
        { key: "sharePct", label: "% participación" }
      ],
      rows,
      fileName: "reporte_ingresos_por_ruta.csv"
    };
  }
  if (reportId === "request_funnel") {
    const counts = {
      [STATUS.PENDIENTE]: 0,
      [STATUS.APROBADA_PENDIENTE_ASIGNACION]: 0,
      [STATUS.VIAJE_ASIGNADO]: 0,
      [STATUS.EN_TRANSITO]: 0,
      [STATUS.ESPERA_STANDBY]: 0,
      [STATUS.COMPLETADA]: 0,
      [STATUS.CERRADA]: 0,
      [STATUS.CANCELADA]: 0,
      [STATUS.RECHAZADA]: 0
    };
    requests.forEach((r) => {
      if (counts[r.status] != null) counts[r.status] += 1;
      else counts[r.status] = 1;
    });
    const rows = Object.entries(counts)
      .filter(([, n]) => n > 0)
      .map(([status, count]) => ({
        stage: prettyStatus(status, "request").replace(/<[^>]+>/g, ""),
        description: requestFunnelStageDescription(status),
        count,
        pct: requests.length ? `${Number(((count / requests.length) * 100).toFixed(1))}%` : "0%"
      }))
      .sort((a, b) => b.count - a.count);
    return {
      title: "Conversión operativa de solicitudes",
      columns: [
        { key: "stage", label: "Etapa" },
        { key: "description", label: "Lectura de negocio" },
        { key: "count", label: "Cantidad" },
        { key: "pct", label: "% del total" }
      ],
      rows,
      fileName: "reporte_conversion_solicitudes.csv"
    };
  }
  if (reportId === "document_compliance") {
    const rows = read(KEYS.vehicles, []).map((vehicle) => {
      const soat = docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate);
      const tech = docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate);
      const worst = Math.min(soat.days, tech.days);
      return {
        plate: vehicle.plate,
        type: vehicle.type,
        soatStatus: soat.label,
        soatDays: soat.days,
        techStatus: tech.label,
        techDays: tech.days,
        risk:
          worst < 0 ? "Vencido" : worst <= 15 ? "Crítico (15d)" : worst <= 30 ? "Atención (30d)" : "Al día",
        soatExpiry: vehicle.soatExpiryDate || "-",
        techExpiry: vehicle.techInspectionExpiryDate || "-"
      };
    });
    return {
      title: "Cumplimiento documental de flota",
      columns: [
        { key: "plate", label: "Placa" },
        { key: "type", label: "Tipo" },
        { key: "soatStatus", label: "Estado SOAT" },
        { key: "soatDays", label: "Días SOAT" },
        { key: "techStatus", label: "Estado tecnomecánica" },
        { key: "techDays", label: "Días tecnomecánica" },
        { key: "risk", label: "Riesgo" },
        { key: "soatExpiry", label: "Vence SOAT" },
        { key: "techExpiry", label: "Vence técnico" }
      ],
      rows,
      fileName: "reporte_cumplimiento_documental_flota.csv"
    };
  }
  return {
    title: "Reporte",
    columns: [{ key: "message", label: "Detalle" }],
    rows: [{ message: "Reporte no definido." }],
    fileName: "reporte.csv"
  };
}

function reportsPeriodStart(period) {
  const key = String(period || "all").trim();
  const now = new Date();
  if (key === "30d") return new Date(now.getTime() - 30 * 86400000);
  if (key === "90d") return new Date(now.getTime() - 90 * 86400000);
  if (key === "ytd") return new Date(now.getFullYear(), 0, 1);
  if (key === "month") {
    const p = getColombiaDateParts(now);
    return new Date(Number(p.year), Number(p.month) - 1, 1);
  }
  return null;
}

function reportsPeriodLabel(period) {
  const labels = {
    "30d": "Últimos 30 días",
    "90d": "Últimos 90 días",
    month: "Mes actual",
    ytd: "Año en curso",
    all: "Histórico completo"
  };
  return labels[String(period || "90d").trim()] || labels["90d"];
}

function reportsExportDefaultFilters() {
  return { period: "90d" };
}

function normalizeReportsExportFilters(raw) {
  const base = reportsExportDefaultFilters();
  const next = raw && typeof raw === "object" ? { ...base, ...raw } : base;
  const period = String(next.period || base.period).trim();
  return {
    period: ["30d", "90d", "month", "ytd", "all"].includes(period) ? period : base.period
  };
}

function reportsFilterByPeriod(requests, period) {
  const start = reportsPeriodStart(period);
  if (!start) return requests;
  const t0 = start.getTime();
  return requests.filter((r) => {
    const ts = new Date(r.createdAt || r.pickupAt || 0).getTime();
    return Number.isFinite(ts) && ts >= t0;
  });
}

function reportsFilterItemsByPeriod(items, period, pickDateValue) {
  const start = reportsPeriodStart(period);
  const list = Array.isArray(items) ? items : [];
  if (!start) return list;
  const t0 = start.getTime();
  return list.filter((item) => {
    const raw = typeof pickDateValue === "function" ? pickDateValue(item) : item?.createdAt;
    const ts = new Date(raw || "").getTime();
    return Number.isFinite(ts) && ts >= t0;
  });
}

function reportsMonthKey(isoValue) {
  const ts = new Date(isoValue || "").getTime();
  if (!Number.isFinite(ts)) return "";
  const p = getColombiaDateParts(new Date(ts));
  return `${p.year}-${p.month}`;
}

function destroyReportsCharts() {
  const list = state.reportsChartInstances || [];
  list.forEach((ch) => {
    try {
      ch.destroy();
    } catch (_e) {
      /* noop */
    }
  });
  state.reportsChartInstances = [];
}

function loadChartJsLib() {
  if (window.Chart) return Promise.resolve(window.Chart);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-antares-chartjs]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Chart));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.crossOrigin = "anonymous";
    s.referrerPolicy = "no-referrer";
    s.dataset.antaresChartjs = "1";
    s.onload = () => resolve(window.Chart);
    s.onerror = () => reject(new Error("Chart.js no cargó"));
    document.head.appendChild(s);
  });
}

function reportsHumanMonth(key) {
  const k = String(key || "");
  if (!/^\d{4}-\d{2}$/.test(k)) return k || "—";
  const [y, m] = k.split("-");
  const names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const mi = Number(m);
  return `${names[mi - 1] || m} ${y}`;
}

function reportsPctDelta(current, previous) {
  const c = parseNum(current);
  const p = parseNum(previous);
  if (p <= 0) return c > 0 ? 100 : 0;
  return Math.round(((c - p) / p) * 100);
}

function reportsFilterPreviousPeriod(all, period) {
  const start = reportsPeriodStart(period);
  if (!start) return [];
  const t0 = start.getTime();
  const duration = Date.now() - t0;
  const prevStart = t0 - duration;
  return all.filter((r) => {
    const ts = new Date(r.createdAt || r.pickupAt || 0).getTime();
    return Number.isFinite(ts) && ts >= prevStart && ts < t0;
  });
}

function reportsWeekKey(isoValue) {
  const ts = new Date(isoValue || "").getTime();
  if (!Number.isFinite(ts)) return "";
  const d = new Date(ts);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const p = getColombiaDateParts(monday);
  return `${p.year}-W${p.month}-${p.day}`;
}

function reportsBuildInsights(snapshot) {
  const insights = [];
  const k = snapshot.kpis;
  if (k.slaPct >= 90) insights.push({ tone: "ok", title: "SLA sólido", text: `El ${k.slaPct}% de viajes cumple entrega a tiempo en el periodo.` });
  else if (k.slaPct > 0) insights.push({ tone: "warn", title: "SLA mejorable", text: `Solo ${k.slaPct}% cumple SLA. Revise rutas con retraso en el tablero operativo.` });
  if (k.trends.revenue > 15) insights.push({ tone: "ok", title: "Recaudo al alza", text: `Ingresos +${k.trends.revenue}% vs periodo anterior.` });
  else if (k.trends.revenue < -10) insights.push({ tone: "warn", title: "Recaudo a la baja", text: `Ingresos ${k.trends.revenue}% vs periodo anterior.` });
  if (k.docRisk > 0) insights.push({ tone: "alert", title: "Flota en riesgo", text: `${k.docRisk} vehículo(s) con SOAT o tecnomecánica vencida o por vencer.` });
  if (k.assignRate < 70 && k.requests > 5) insights.push({ tone: "warn", title: "Cola de asignación", text: `Solo ${k.assignRate}% de solicitudes tiene viaje. Priorice pendientes de asignar.` });
  if (k.avgTicket > 0) insights.push({ tone: "neutral", title: "Ticket promedio", text: `${snapshot.fmtCop(k.avgTicket)} por operación en el periodo.` });
  return insights.slice(0, 4);
}

function buildReportsAnalyticsSnapshot(user, period = "90d") {
  const all = getVisibleRequestsForUser(user);
  const requests = reportsFilterByPeriod(all, period);
  const prevRequests = reportsFilterPreviousPeriod(all, period);
  const trips = requests.filter((r) => r.trip);
  const prevTrips = prevRequests.filter((r) => r.trip);
  const closed = requests.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status));
  const revenue = requests.reduce((acc, r) => acc + deriveRequestOperationalValue(r), 0);
  const prevRevenue = prevRequests.reduce((acc, r) => acc + deriveRequestOperationalValue(r), 0);
  const slaOk = trips.filter((r) => slaStatusForRequest(r) === "Cumple SLA").length;
  const slaPct = trips.length ? Math.round((slaOk / trips.length) * 100) : 0;
  const standbyTotal = requests.reduce((acc, r) => acc + parseNum(r.standbyChargeTotal || 0), 0);

  const approvalSamples = requests.filter((r) => r.approvedAt).length;
  const approvalMinSum = requests.reduce((acc, r) => acc + minutesBetween(r.createdAt, r.approvedAt), 0);
  const avgApprovalMin = approvalSamples ? Math.round(approvalMinSum / approvalSamples) : 0;

  const cycleSamples = closed.filter((r) => r.deliveredAt || r.closedAt).length;
  const cycleSum = closed.reduce(
    (acc, r) => acc + hoursBetween(r.createdAt, r.deliveredAt || r.closedAt || r.trip?.etaDelivery),
    0
  );
  const avgCycleHours = cycleSamples ? Number((cycleSum / cycleSamples).toFixed(1)) : 0;
  const avgTicket = trips.length ? Math.round(revenue / trips.length) : 0;
  const assignRate = requests.length ? Math.round((trips.length / requests.length) * 100) : 0;
  const closeRate = requests.length ? Math.round((closed.length / requests.length) * 100) : 0;

  const statusCounts = {};
  requests.forEach((r) => {
    const label = String(r.status || "sin_estado");
    statusCounts[label] = (statusCounts[label] || 0) + 1;
  });
  const statusChart = Object.entries(statusCounts)
    .map(([label, value]) => ({ label: prettyStatus(label, "request").replace(/<[^>]+>/g, ""), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const monthRevenue = {};
  const monthTrips = {};
  trips.forEach((r) => {
    const mk = reportsMonthKey(r.trip?.assignedAt || r.approvedAt || r.createdAt);
    if (!mk) return;
    monthRevenue[mk] = (monthRevenue[mk] || 0) + deriveRequestOperationalValue(r);
    monthTrips[mk] = (monthTrips[mk] || 0) + 1;
  });
  const revenueMonths = Object.keys(monthRevenue).sort().slice(-8);
  const revenueSeries = revenueMonths.map((m) => monthRevenue[m] || 0);
  const tripsSeries = revenueMonths.map((m) => monthTrips[m] || 0);
  const revenueLabels = revenueMonths.map(reportsHumanMonth);

  const weekTrips = {};
  trips.forEach((r) => {
    const wk = reportsWeekKey(r.trip?.assignedAt || r.createdAt);
    if (!wk) return;
    weekTrips[wk] = (weekTrips[wk] || 0) + 1;
  });
  const weekKeys = Object.keys(weekTrips).sort().slice(-10);
  const weekSeries = weekKeys.map((k) => weekTrips[k] || 0);

  const clientRevenue = {};
  requests.forEach((r) => {
    const c = String(r.clientName || "Sin cliente").trim();
    clientRevenue[c] = (clientRevenue[c] || 0) + deriveRequestOperationalValue(r);
  });
  const topClients = Object.entries(clientRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const routeTrips = {};
  trips.forEach((r) => {
    const route = formatRoute(r);
    routeTrips[route] = (routeTrips[route] || 0) + 1;
  });
  const topRoutes = Object.entries(routeTrips)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const driverTrips = {};
  trips.forEach((r) => {
    const d = String(r.trip?.driverName || "Sin conductor").trim();
    driverTrips[d] = (driverTrips[d] || 0) + 1;
  });
  const topDrivers = Object.entries(driverTrips)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const tkYes = requests.filter((r) => requestRequiresTermoking(r)).length;
  const tkNo = Math.max(0, requests.length - tkYes);

  const funnel = [
    { label: "Solicitudes", value: requests.length },
    { label: "Aprobadas", value: requests.filter((r) => r.approvedAt).length },
    { label: "Con viaje", value: trips.length },
    { label: "En operación", value: requests.filter((r) => [STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY, STATUS.VIAJE_ASIGNADO].includes(r.status)).length },
    { label: "Cerradas", value: closed.length }
  ];

  const fuelLogs = reportsFilterByPeriod(
    readFuelLogs().map((log) => ({ ...log, createdAt: log.date })),
    period
  );
  const fuelCost = fuelLogs.reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  const fuelLiters = fuelLogs.reduce((acc, log) => acc + parseNum(log.liters), 0);
  const maintCost = reportsFilterByPeriod(
    readVehicleTechnicalLogs().map((log) => ({ ...log, createdAt: log.date })),
    period
  ).reduce((acc, log) => acc + parseNum(log.cost), 0);

  const vehicles = read(KEYS.vehicles, []);
  const activeTrips = getActiveTrips();
  const busyIds = new Set(activeTrips.map((r) => String(r.trip?.vehicleId || "")).filter(Boolean));
  const fleetBusy = busyIds.size;
  const fleetAvailable = vehicles.filter((v) => v.available !== false && !busyIds.has(String(v.id))).length;
  const docRisk = vehicles.filter((v) => {
    const soat = docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
    const tech = docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
    return soat.days < 0 || tech.days < 0 || soat.days <= 30 || tech.days <= 30;
  }).length;
  const fleetUtilPct = vehicles.length ? Math.round((fleetBusy / vehicles.length) * 100) : 0;

  const periodLabels = { "30d": "Últimos 30 días", "90d": "Últimos 90 días", month: "Mes actual", ytd: "Año en curso", all: "Histórico completo" };
  const fmtCop = (n) => `$${parseNum(n).toLocaleString("es-CO")}`;

  const snapshot = {
    period,
    periodLabel: periodLabels[period] || periodLabels["90d"],
    generatedAt: fmtDate(nowIso()),
    fmtCop,
    kpis: {
      requests: requests.length,
      trips: trips.length,
      revenue,
      slaPct,
      fuelCost,
      maintCost,
      standbyTotal,
      fleetAvailable,
      fleetTotal: vehicles.length,
      fleetBusy,
      fleetUtilPct,
      docRisk,
      avgTicket,
      avgApprovalMin,
      avgCycleHours,
      assignRate,
      closeRate,
      slaOk,
      slaTotal: trips.length,
      activeOps: requests.filter((r) => tripRequestStatusIsOperational(r.status)).length,
      trends: {
        revenue: reportsPctDelta(revenue, prevRevenue),
        trips: reportsPctDelta(trips.length, prevTrips.length),
        requests: reportsPctDelta(requests.length, prevRequests.length)
      }
    },
    statusChart,
    revenueMonths,
    revenueLabels,
    revenueSeries,
    tripsSeries,
    weekKeys,
    weekSeries,
    topClients,
    topRoutes,
    topDrivers,
    funnel,
    fuelLiters,
    thermoking: { yes: tkYes, no: tkNo },
    slaOk,
    slaTotal: trips.length
  };
  snapshot.insights = reportsBuildInsights(snapshot);
  return snapshot;
}

function reportsBiTrendHtml(delta) {
  const d = parseNum(delta);
  const cls = d > 0 ? "up" : d < 0 ? "down" : "flat";
  const sign = d > 0 ? "+" : "";
  return `<span class="reports-bi-trend reports-bi-trend--${cls}" title="Vs periodo anterior">${sign}${d}%</span>`;
}

function reportsBiKpiCard(opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const mod = o.mod ? ` reports-bi-kpi--${o.mod}` : "";
  const trend = o.trend != null && o.trend !== "" ? reportsBiTrendHtml(o.trend) : "";
  const meta = o.meta ? `<span class="reports-bi-kpi-meta">${escapeHtml(o.meta)}</span>` : "";
  const icon = o.icon ? `<span class="reports-bi-kpi-ico" aria-hidden="true">${o.icon}</span>` : "";
  return `<article class="reports-bi-kpi${mod}">
    ${icon}
    <div class="reports-bi-kpi-body">
      <span class="reports-bi-kpi-val">${reportsBiDisplayVal(o.value)}</span>
      <span class="reports-bi-kpi-lbl">${escapeHtml(o.label || "")}</span>
      ${meta}
    </div>
    ${trend}
  </article>`;
}

function reportsBiLeaderboardHtml(title, rows, valueKey, format = "num") {
  if (!rows.length) return `<p class="reports-bi-empty">Sin datos en el periodo.</p>`;
  const max = Math.max(...rows.map((r) => parseNum(r[1])), 1);
  const items = rows
    .map((row, i) => {
      const pct = Math.round((parseNum(row[1]) / max) * 100);
      const val =
        format === "cop" ? `$${parseNum(row[1]).toLocaleString("es-CO")}` : String(parseNum(row[1]));
      return `<li class="reports-bi-lb-item">
        <span class="reports-bi-lb-rank">${i + 1}</span>
        <div class="reports-bi-lb-main">
          <span class="reports-bi-lb-name" title="${escapeAttr(row[0])}">${escapeHtml(row[0].length > 32 ? `${row[0].slice(0, 30)}…` : row[0])}</span>
          <span class="reports-bi-lb-bar"><i style="width:${pct}%"></i></span>
        </div>
        <span class="reports-bi-lb-val">${val}</span>
      </li>`;
    })
    .join("");
  return `<div class="reports-bi-lb"><h4>${escapeHtml(title)}</h4><ol>${items}</ol></div>`;
}

function reportsBiPeriodChip(value, label, current) {
  const active = current === value ? " is-active" : "";
  return `<button type="button" class="reports-bi-chip${active}" data-action="reports-bi-period-chip" data-period="${escapeAttr(value)}" aria-pressed="${current === value ? "true" : "false"}">${escapeHtml(label)}</button>`;
}

function reportsExportPeriodChip(value, label, current) {
  const active = current === value ? " is-active" : "";
  return `<button type="button" class="reports-bi-chip${active}" data-action="reports-export-period-chip" data-period="${escapeAttr(value)}" aria-pressed="${current === value ? "true" : "false"}">${escapeHtml(label)}</button>`;
}

const REPORTS_BI_LAYOUT_STORAGE = "antares_reports_bi_layout_v1";

function reportsBiDefaultLayout() {
  return {
    insights: true,
    kpis: {
      revenue: true,
      trips: true,
      requests: true,
      sla: true,
      cycle: true,
      fuel: true,
      maint: true,
      fleet: true,
      docs: true
    },
    scores: { sla: true, assign: true, thermoking: true },
    charts: {
      revenue: true,
      weekly: true,
      funnel: true,
      status: true,
      clients: true,
      routes: true,
      drivers: true,
      rankings: true
    }
  };
}

function normalizeReportsBiLayout(raw) {
  const def = reportsBiDefaultLayout();
  if (!raw || typeof raw !== "object") return def;
  return {
    insights: raw.insights !== false,
    kpis: { ...def.kpis, ...(raw.kpis && typeof raw.kpis === "object" ? raw.kpis : {}) },
    scores: { ...def.scores, ...(raw.scores && typeof raw.scores === "object" ? raw.scores : {}) },
    charts: { ...def.charts, ...(raw.charts && typeof raw.charts === "object" ? raw.charts : {}) }
  };
}

function reportsBiLayoutStorageKey() {
  const u = currentUser();
  const id = String(u?.id || u?.email || "anon").trim() || "anon";
  return `${REPORTS_BI_LAYOUT_STORAGE}_${id}`;
}

function loadReportsBiLayout() {
  if (state.reportsUi?.layout) return normalizeReportsBiLayout(state.reportsUi.layout);
  try {
    const raw = localStorage.getItem(reportsBiLayoutStorageKey());
    if (raw) return normalizeReportsBiLayout(JSON.parse(raw));
  } catch (_e) {
    /* noop */
  }
  return reportsBiDefaultLayout();
}

function persistReportsBiLayout(layout) {
  const normalized = normalizeReportsBiLayout(layout);
  state.reportsUi = { ...(state.reportsUi || {}), layout: normalized };
  try {
    localStorage.setItem(reportsBiLayoutStorageKey(), JSON.stringify(normalized));
  } catch (_e) {
    /* noop */
  }
  return normalized;
}

function reportsBiLayoutFromPanel(root) {
  const panel = root?.querySelector(".reports-bi-customizer");
  if (!panel) return loadReportsBiLayout();
  const readChecked = (sel) => panel.querySelector(sel)?.checked === true;
  const layout = reportsBiDefaultLayout();
  layout.insights = readChecked('[data-bi-scope="insights"]');
  Object.keys(layout.kpis).forEach((key) => {
    layout.kpis[key] = readChecked(`[data-bi-scope="kpis"][data-bi-key="${key}"]`);
  });
  Object.keys(layout.scores).forEach((key) => {
    layout.scores[key] = readChecked(`[data-bi-scope="scores"][data-bi-key="${key}"]`);
  });
  Object.keys(layout.charts).forEach((key) => {
    layout.charts[key] = readChecked(`[data-bi-scope="charts"][data-bi-key="${key}"]`);
  });
  return normalizeReportsBiLayout(layout);
}

function reportsBiLayoutPreset(preset) {
  const all = reportsBiDefaultLayout();
  if (preset === "all") return all;
  if (preset === "min") {
    return normalizeReportsBiLayout({
      insights: false,
      kpis: { revenue: true, trips: true, requests: true, sla: true, cycle: false, fuel: false, maint: false, fleet: false, docs: false },
      scores: { sla: true, assign: true, thermoking: false },
      charts: { revenue: true, weekly: false, funnel: true, status: true, clients: false, routes: false, drivers: false, rankings: false }
    });
  }
  if (preset === "finance") {
    return normalizeReportsBiLayout({
      insights: true,
      kpis: { revenue: true, trips: true, requests: false, sla: false, cycle: false, fuel: true, maint: true, fleet: false, docs: false },
      scores: { sla: false, assign: false, thermoking: false },
      charts: { revenue: true, weekly: false, funnel: false, status: false, clients: true, routes: false, drivers: false, rankings: true }
    });
  }
  if (preset === "ops") {
    return normalizeReportsBiLayout({
      insights: true,
      kpis: { revenue: false, trips: true, requests: true, sla: true, cycle: true, fuel: false, maint: false, fleet: true, docs: true },
      scores: { sla: true, assign: true, thermoking: true },
      charts: { revenue: false, weekly: true, funnel: true, status: true, clients: false, routes: true, drivers: true, rankings: false }
    });
  }
  return all;
}

function reportsBiDisplayVal(value, fallback = "—") {
  if (value === undefined || value === null) return fallback;
  const s = String(value);
  if (s === "undefined" || s === "NaN" || s === "[object Object]") return fallback;
  return s;
}

function reportsBiCustomizerHtml(layout) {
  const L = normalizeReportsBiLayout(layout);
  const chk = (scope, key, label, checked) =>
    `<label class="reports-bi-customizer-item"><input type="checkbox" data-bi-scope="${escapeAttr(scope)}" data-bi-key="${escapeAttr(key)}"${checked ? " checked" : ""}/><span class="reports-bi-customizer-item-label">${escapeHtml(label)}</span></label>`;
  const kpiChecks = [
    chk("kpis", "revenue", "Recaudo", L.kpis.revenue),
    chk("kpis", "trips", "Viajes", L.kpis.trips),
    chk("kpis", "requests", "Solicitudes", L.kpis.requests),
    chk("kpis", "sla", "SLA", L.kpis.sla),
    chk("kpis", "cycle", "Ciclo / aprobación", L.kpis.cycle),
    chk("kpis", "fuel", "Combustible", L.kpis.fuel),
    chk("kpis", "maint", "Taller", L.kpis.maint),
    chk("kpis", "fleet", "Flota", L.kpis.fleet),
    chk("kpis", "docs", "Documentos", L.kpis.docs)
  ].join("");
  const scoreChecks = [
    chk("scores", "sla", "Anillo SLA", L.scores.sla),
    chk("scores", "assign", "Conversión a viaje", L.scores.assign),
    chk("scores", "thermoking", "Termoking vs seco", L.scores.thermoking)
  ].join("");
  const chartChecks = [
    chk("charts", "revenue", "Recaudo mensual", L.charts.revenue),
    chk("charts", "weekly", "Actividad semanal", L.charts.weekly),
    chk("charts", "funnel", "Conversión operativa", L.charts.funnel),
    chk("charts", "status", "Estados", L.charts.status),
    chk("charts", "clients", "Top clientes", L.charts.clients),
    chk("charts", "routes", "Rutas", L.charts.routes),
    chk("charts", "drivers", "Conductores", L.charts.drivers),
    chk("charts", "rankings", "Rankings", L.charts.rankings)
  ].join("");
  return `<div class="reports-bi-customizer" aria-label="Personalizar analítica">
    <div class="reports-bi-customizer-head">
      <div class="reports-bi-customizer-copy">
        <h3 class="reports-bi-customizer-title">${IC.grid} Arme su vista</h3>
        <p class="reports-bi-customizer-hint">Elija indicadores y gráficas. La selección se guarda en este equipo y aplica al Excel.</p>
      </div>
      <div class="reports-bi-customizer-presets">
        <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-layout-preset" data-preset="all">Todo</button>
        <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-layout-preset" data-preset="min">Mínimo</button>
        <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-layout-preset" data-preset="finance">Finanzas</button>
        <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-layout-preset" data-preset="ops">Operación</button>
        <button type="button" class="btn btn-sm btn-approve" data-action="reports-bi-layout-apply">${IC.check} Aplicar vista</button>
      </div>
    </div>
    <div class="reports-bi-customizer-grid">
      <fieldset class="reports-bi-customizer-group">
        <legend>General</legend>
        <div class="reports-bi-customizer-checks">
          ${chk("insights", "insights", "Hallazgos automáticos", L.insights)}
        </div>
      </fieldset>
      <fieldset class="reports-bi-customizer-group">
        <legend>Indicadores</legend>
        <div class="reports-bi-customizer-checks">
          ${kpiChecks}
        </div>
      </fieldset>
      <fieldset class="reports-bi-customizer-group">
        <legend>Cumplimiento</legend>
        <div class="reports-bi-customizer-checks">
          ${scoreChecks}
        </div>
      </fieldset>
      <fieldset class="reports-bi-customizer-group">
        <legend>Gráficas y rankings</legend>
        <div class="reports-bi-customizer-checks reports-bi-customizer-checks--dual">
          ${chartChecks}
        </div>
      </fieldset>
    </div>
  </div>`;
}

function reportsAnalyticsPanelHtml(snapshot, layout) {
  const L = normalizeReportsBiLayout(layout);
  const k = snapshot.kpis;
  const fmtCop = snapshot.fmtCop;
  const slaOk = k.slaOk ?? snapshot.slaOk ?? 0;
  const slaTotal = k.slaTotal ?? snapshot.slaTotal ?? 0;
  const activeOps = k.activeOps ?? snapshot.activeOps ?? 0;
  const period = snapshot.period || "90d";
  const insightsHtml = (snapshot.insights || [])
    .map(
      (ins) =>
        `<article class="reports-bi-insight reports-bi-insight--${escapeAttr(ins.tone || "neutral")}">
          <strong>${escapeHtml(ins.title)}</strong>
          <p>${escapeHtml(ins.text)}</p>
        </article>`
    )
    .join("");
  return `<section class="reports-bi" aria-label="Analítica operativa">
    <header class="reports-bi-toolbar">
      <div class="reports-bi-toolbar-intro">
        <p class="reports-bi-kicker">Reportería · BI</p>
        <h2 class="reports-bi-title">Analítica operativa</h2>
        <p class="reports-bi-sub">${escapeHtml(snapshot.periodLabel)} · comparativa vs periodo anterior</p>
        <span class="reports-bi-updated">Corte ${escapeHtml(snapshot.generatedAt)}</span>
      </div>
      <div class="reports-bi-toolbar-controls">
        <div class="reports-bi-period-chips" role="group" aria-label="Periodo rápido">
          ${reportsBiPeriodChip("30d", "30 d", period)}
          ${reportsBiPeriodChip("90d", "90 d", period)}
          ${reportsBiPeriodChip("month", "Mes", period)}
          ${reportsBiPeriodChip("ytd", "Año", period)}
          ${reportsBiPeriodChip("all", "Todo", period)}
        </div>
        <div class="reports-bi-period-summary" aria-label="Periodo analizado">
          <span class="reports-bi-period-badge">${IC.calendar} ${escapeHtml(snapshot.periodLabel)}</span>
          <span class="reports-bi-period-note">Corte activo del tablero</span>
        </div>
        <div class="reports-bi-toolbar-btns">
          <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-refresh" title="Recalcular indicadores">${IC.clock} Actualizar</button>
          <button type="button" class="btn btn-sm btn-approve" data-action="reports-bi-export-excel" title="Excel con gráficas y datos del periodo">${IC.download} Excel</button>
          <button type="button" class="btn btn-sm btn-action" data-action="generate-report" data-report="executive_control_tower" data-format="preview" title="Vista previa sin ventana emergente">${IC.eye} Resumen ejecutivo</button>
        </div>
      </div>
      <div class="reports-bi-toolbar-stats" aria-label="Resumen del periodo">
        <span class="reports-bi-stat"><strong>${activeOps}</strong><span>En operación</span></span>
        <span class="reports-bi-stat"><strong>${k.assignRate}%</strong><span>Asignadas</span></span>
        <span class="reports-bi-stat"><strong>${k.closeRate}%</strong><span>Cerradas</span></span>
        <span class="reports-bi-stat"><strong>${k.slaPct}%</strong><span>SLA</span></span>
      </div>
    </header>
    ${reportsBiCustomizerHtml(L)}
    ${L.insights && insightsHtml ? `<div class="reports-bi-insights" role="region" aria-label="Hallazgos">${insightsHtml}</div>` : ""}
    ${
      Object.values(L.kpis).some(Boolean)
        ? `<div class="reports-bi-section">
      <h3 class="reports-bi-section-title">Indicadores clave</h3>
      <div class="reports-bi-kpis">
      ${L.kpis.revenue ? reportsBiKpiCard({ mod: "primary", icon: IC.dollar, value: fmtCop(k.revenue), label: "Recaudo operativo", trend: k.trends?.revenue }) : ""}
      ${L.kpis.trips ? reportsBiKpiCard({ icon: IC.truck, value: k.trips, label: "Viajes", trend: k.trends?.trips, meta: `Ticket ${fmtCop(k.avgTicket)}` }) : ""}
      ${L.kpis.requests ? reportsBiKpiCard({ icon: IC.file, value: k.requests, label: "Solicitudes", trend: k.trends?.requests }) : ""}
      ${L.kpis.sla ? reportsBiKpiCard({ mod: "sla", icon: IC.check, value: `${k.slaPct}%`, label: "SLA cumplido", meta: `${slaOk}/${slaTotal} viajes` }) : ""}
      ${L.kpis.cycle ? reportsBiKpiCard({ icon: IC.clock, value: `${k.avgCycleHours}h`, label: "Ciclo promedio", meta: `Aprob. ${k.avgApprovalMin} min` }) : ""}
      ${L.kpis.fuel ? reportsBiKpiCard({ icon: IC.fuel, value: fmtCop(k.fuelCost), label: "Combustible", meta: `${parseNum(snapshot.fuelLiters).toLocaleString("es-CO")} L` }) : ""}
      ${L.kpis.maint ? reportsBiKpiCard({ icon: IC.activity, value: fmtCop(k.maintCost), label: "Taller", meta: k.standbyTotal > 0 ? `Standby ${fmtCop(k.standbyTotal)}` : "Sin standby" }) : ""}
      ${L.kpis.fleet ? reportsBiKpiCard({ icon: IC.truck, value: `${k.fleetAvailable}/${k.fleetTotal}`, label: "Flota libre", meta: `${k.fleetUtilPct}% ocupación` }) : ""}
      ${L.kpis.docs ? reportsBiKpiCard({ mod: k.docRisk ? "warn" : "", icon: IC.shield, value: k.docRisk, label: "Alertas documentales" }) : ""}
    </div>
    </div>`
        : ""
    }
    ${
      Object.values(L.scores).some(Boolean)
        ? `<div class="reports-bi-section reports-bi-section--compact">
      <h3 class="reports-bi-section-title">Cumplimiento y conversión</h3>
    <div class="reports-bi-score-row">
      ${
        L.scores.sla
          ? `<article class="reports-bi-score-card">
        <div class="reports-bi-ring" style="--pct:${k.slaPct}">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <path class="reports-bi-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="reports-bi-ring-fg" stroke-dasharray="${k.slaPct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <strong>${k.slaPct}%</strong>
        </div>
        <div>
          <h3>${IC.check} Cumplimiento SLA</h3>
          <p>${slaOk} de ${slaTotal} viajes entregan a tiempo</p>
        </div>
      </article>`
          : ""
      }
      ${
        L.scores.assign
          ? `<article class="reports-bi-score-card">
        <div class="reports-bi-ring reports-bi-ring--assign" style="--pct:${k.assignRate}">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <path class="reports-bi-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="reports-bi-ring-fg" stroke-dasharray="${k.assignRate}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <strong>${k.assignRate}%</strong>
        </div>
        <div>
          <h3>${IC.compass} Conversión a viaje</h3>
          <p>${k.trips} viajes sobre ${k.requests} solicitudes</p>
        </div>
      </article>`
          : ""
      }
      ${
        L.scores.thermoking
          ? `<article class="reports-bi-score-card reports-bi-score-card--chart">
        <h3>${IC.truck} Termoking vs seco</h3>
        <div class="reports-bi-chart-wrap reports-bi-chart-wrap--mini"><canvas id="reports-chart-thermoking" aria-label="Termoking"></canvas></div>
      </article>`
          : ""
      }
    </div>
    </div>`
        : ""
    }
    ${
      Object.values(L.charts).some(Boolean)
        ? `<div class="reports-bi-section">
      <h3 class="reports-bi-section-title">Visualizaciones</h3>
    <div class="reports-bi-grid">
      ${
        L.charts.revenue
          ? `<article class="reports-bi-card reports-bi-card--xl">
        <header class="reports-bi-card-head">
          <div><h3>${IC.dollar} Recaudo y volumen mensual</h3><p class="reports-bi-card-sub">Ingresos (barras) y viajes (línea)</p></div>
          <span class="reports-bi-card-stat">${fmtCop(k.revenue)}</span>
        </header>
        <div class="reports-bi-chart-wrap reports-bi-chart-wrap--tall"><canvas id="reports-chart-revenue" aria-label="Recaudo mensual"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.weekly
          ? `<article class="reports-bi-card reports-bi-card--wide">
        <header class="reports-bi-card-head">
          <div><h3>${IC.activity} Actividad semanal</h3><p class="reports-bi-card-sub">Viajes por semana</p></div>
        </header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-weekly" aria-label="Tendencia semanal"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.funnel
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.layers} Conversión operativa de solicitudes</h3><p class="reports-bi-card-sub">Desde la radicación hasta el cierre</p></div></header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-funnel" aria-label="Conversión operativa"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.status
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.activity} Estados</h3><p class="reports-bi-card-sub">Distribución actual</p></div></header>
        <div class="reports-bi-chart-wrap reports-bi-chart-wrap--donut"><canvas id="reports-chart-status" aria-label="Estados"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.clients
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.briefcase} Top clientes</h3><p class="reports-bi-card-sub">Por recaudo</p></div></header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-clients" aria-label="Clientes"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.routes
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.mapPin} Rutas activas</h3><p class="reports-bi-card-sub">Por viajes</p></div></header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-routes" aria-label="Rutas"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.drivers
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.user} Top conductores</h3><p class="reports-bi-card-sub">Viajes asignados</p></div></header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-drivers" aria-label="Conductores"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.rankings
          ? `<article class="reports-bi-card reports-bi-card--wide reports-bi-card--rankings">
        <header class="reports-bi-card-head"><div><h3>${IC.star} Rankings del periodo</h3><p class="reports-bi-card-sub">Mayor impacto comercial y operativo</p></div></header>
        <div class="reports-bi-rankings">
          ${reportsBiLeaderboardHtml("Clientes por recaudo", snapshot.topClients, 1, "cop")}
          ${reportsBiLeaderboardHtml("Conductores por viajes", snapshot.topDrivers, 1, "num")}
        </div>
      </article>`
          : ""
      }
    </div>
    </div>`
        : `<p class="reports-bi-empty reports-bi-section">Seleccione al menos una gráfica en «Arme su vista» y pulse Aplicar.</p>`
    }
    <p class="reports-bi-foot muted">Mismos criterios que exportación PDF/CSV · Tendencias vs periodo anterior equivalente · ${escapeHtml(snapshot.periodLabel)}</p>
  </section>`;
}

const REPORTS_BI_BRAND = Object.freeze({
  primary: "#377cc0",
  primaryDeep: "#2a6399",
  primaryDeeper: "#1e4a73",
  accent: "#5a94c8",
  soft: "#dceaf7",
  success: "#1b8e5f",
  warning: "#d97706",
  danger: "#d62828",
  neutral: "#94a3b8",
  text: "#0b2138",
  muted: "#64748b",
  line: "#b8d4eb",
  onPrimary: "#f0f7ff",
  white: "#ffffff"
});

function reportsBiBrandPalette() {
  const b = REPORTS_BI_BRAND;
  return [b.primaryDeep, b.primary, b.primaryDeeper, b.success, b.warning, "#356fa8", "#4a7fb8", b.neutral];
}

function reportsBiChartColors() {
  const b = REPORTS_BI_BRAND;
  const dark = String(document.body?.dataset?.theme || "light") === "dark";
  return {
    dark,
    primary: dark ? b.accent : b.primary,
    primaryDeep: dark ? "#5a9fd4" : b.primaryDeep,
    accent: dark ? "#6eb5e8" : b.accent,
    success: dark ? "#3ecf9a" : b.success,
    warning: dark ? "#f5b84a" : b.warning,
    neutral: dark ? "#64748b" : b.neutral,
    palette: reportsBiBrandPalette(),
    barPrimary: dark ? "rgba(42, 99, 153, 0.88)" : "rgba(42, 99, 153, 0.92)",
    barDeep: dark ? "rgba(30, 74, 115, 0.88)" : "rgba(30, 74, 115, 0.92)",
    barSuccess: dark ? "rgba(27, 142, 95, 0.82)" : "rgba(27, 142, 95, 0.9)",
    fillPrimary: dark ? "rgba(42, 99, 153, 0.2)" : "rgba(42, 99, 153, 0.14)",
    fillSuccess: dark ? "rgba(27, 142, 95, 0.16)" : "rgba(27, 142, 95, 0.12)",
    funnel: [b.primaryDeeper, b.primaryDeep, b.primary, b.success, "#356fa8"]
  };
}

function reportsBiChartTheme() {
  const b = REPORTS_BI_BRAND;
  const dark = String(document.body?.dataset?.theme || "light") === "dark";
  const text = dark ? "#e8f4fc" : b.text;
  const muted = dark ? "#9ec7e8" : b.muted;
  const grid = dark ? "rgba(148, 163, 184, 0.14)" : "rgba(184, 212, 235, 0.55)";
  const font = { family: "'Montserrat', system-ui, sans-serif", size: 11, weight: "600" };
  const copTooltip = {
    callbacks: {
      label(ctx) {
        const raw = ctx.parsed?.y ?? ctx.parsed?.x ?? ctx.raw;
        const n = parseNum(raw);
        if (String(ctx.dataset?.label || "").toLowerCase().includes("cop") || ctx.chart?.canvas?.id === "reports-chart-clients") {
          return `${ctx.dataset.label || ""}: $${n.toLocaleString("es-CO")}`;
        }
        return `${ctx.dataset.label || ""}: ${n.toLocaleString("es-CO")}`;
      }
    }
  };
  return { text, muted, grid, font, copTooltip };
}

function reportsBiExcelEsc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function reportsBiExcelTable(headers, rows) {
  const th = headers.map((h) => `<th class="xls-th">${reportsBiExcelEsc(h)}</th>`).join("");
  const body = (rows || [])
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td class="xls-td">${reportsBiExcelEsc(cell)}</td>`).join("")}</tr>`
    )
    .join("");
  return `<table class="xls-table" cellspacing="0" cellpadding="0"><thead><tr>${th}</tr></thead><tbody>${body || `<tr><td class="xls-td" colspan="${headers.length}">Sin datos</td></tr>`}</tbody></table>`;
}

function reportsBiCaptureChartImages(root) {
  const ids = [
    "reports-chart-revenue",
    "reports-chart-weekly",
    "reports-chart-funnel",
    "reports-chart-status",
    "reports-chart-thermoking",
    "reports-chart-clients",
    "reports-chart-routes",
    "reports-chart-drivers"
  ];
  const out = {};
  ids.forEach((id) => {
    const canvas = root?.querySelector(`#${id}`);
    if (!canvas) return;
    try {
      out[id] = canvas.toDataURL("image/png");
    } catch (_e) {
      out[id] = "";
    }
  });
  return out;
}

function reportsBiExcelChartBlock(title, subtitle, imageData, tableHtml) {
  const img = imageData
    ? `<img src="${imageData}" alt="${reportsBiExcelEsc(title)}" width="560" height="280" style="display:block;margin:8px 0;border:1px solid ${REPORTS_BI_BRAND.line};"/>`
    : `<p class="xls-muted">Gráfica no disponible — consulte la tabla de datos.</p>`;
  return `<tr><td colspan="4" class="xls-section">
    <h3 class="xls-chart-title">${reportsBiExcelEsc(title)}</h3>
    ${subtitle ? `<p class="xls-muted">${reportsBiExcelEsc(subtitle)}</p>` : ""}
    ${img}
    ${tableHtml}
  </td></tr>`;
}

function buildReportsBiExcelHtml(snapshot, chartImages = {}, layout) {
  const b = REPORTS_BI_BRAND;
  const L = normalizeReportsBiLayout(layout || loadReportsBiLayout());
  const logoSrc = reportsBiExcelEsc(reportBrandLogoSrc());
  const copyrightText = reportsBiExcelEsc(reportBrandCopyrightText());
  const k = snapshot.kpis;
  const fmtCop = snapshot.fmtCop;
  const slaOk = k.slaOk ?? snapshot.slaOk ?? 0;
  const slaTotal = k.slaTotal ?? snapshot.slaTotal ?? 0;
  const trendTxt = (d) => {
    const n = parseNum(d);
    if (n > 0) return `+${n}%`;
    if (n < 0) return `${n}%`;
    return "0%";
  };
  const kpiRows = [];
  if (L.kpis.revenue) kpiRows.push(["Recaudo operativo", fmtCop(k.revenue), trendTxt(k.trends?.revenue), `Ticket ${fmtCop(k.avgTicket)}`]);
  if (L.kpis.trips) kpiRows.push(["Viajes", String(k.trips), trendTxt(k.trends?.trips), ""]);
  if (L.kpis.requests) kpiRows.push(["Solicitudes", String(k.requests), trendTxt(k.trends?.requests), ""]);
  if (L.kpis.sla) kpiRows.push(["SLA cumplido", `${k.slaPct}%`, "", `${slaOk}/${slaTotal} viajes`]);
  if (L.kpis.cycle) kpiRows.push(["Ciclo promedio", `${k.avgCycleHours} h`, "", `Aprob. ${k.avgApprovalMin} min`]);
  if (L.kpis.fuel) kpiRows.push(["Combustible", fmtCop(k.fuelCost), "", `${parseNum(snapshot.fuelLiters).toLocaleString("es-CO")} L`]);
  if (L.kpis.maint) kpiRows.push(["Taller", fmtCop(k.maintCost), "", k.standbyTotal > 0 ? `Standby ${fmtCop(k.standbyTotal)}` : "Sin standby"]);
  if (L.kpis.fleet) kpiRows.push(["Flota libre", `${k.fleetAvailable}/${k.fleetTotal}`, "", `${k.fleetUtilPct}% ocupación`]);
  if (L.kpis.docs) kpiRows.push(["Alertas documentales", String(k.docRisk), "", ""]);
  const insightRows = L.insights ? (snapshot.insights || []).map((ins) => [ins.title, ins.text]) : [];
  const revenueRows = (snapshot.revenueLabels || snapshot.revenueMonths || []).map((label, i) => [
    label,
    fmtCop(snapshot.revenueSeries[i] || 0),
    String(snapshot.tripsSeries[i] || 0)
  ]);
  const weeklyRows = (snapshot.weekKeys || []).map((wk, i) => [wk, String(snapshot.weekSeries[i] || 0)]);
  const statusRows = (snapshot.statusChart || []).map((x) => [x.label, String(x.value)]);
  const funnelRows = (snapshot.funnel || []).map((x) => [x.label, String(x.value)]);
  const clientRows = (snapshot.topClients || []).map((x) => [x[0], fmtCop(x[1])]);
  const routeRows = (snapshot.topRoutes || []).map((x) => [x[0], String(x[1])]);
  const driverRows = (snapshot.topDrivers || []).map((x) => [x[0], String(x[1])]);

  const chartBlocks = [
    L.charts.revenue
      ? reportsBiExcelChartBlock(
          "Recaudo y volumen mensual",
          "Barras: ingresos · Línea: viajes",
          chartImages["reports-chart-revenue"],
          reportsBiExcelTable(["Mes", "Recaudo COP", "Viajes"], revenueRows)
        )
      : "",
    L.charts.weekly
      ? reportsBiExcelChartBlock(
          "Actividad semanal",
          "Viajes por semana",
          chartImages["reports-chart-weekly"],
          reportsBiExcelTable(["Semana", "Viajes"], weeklyRows)
        )
      : "",
    L.charts.funnel
      ? reportsBiExcelChartBlock(
          "Conversión operativa de solicitudes",
          "Desde la radicación hasta el cierre",
          chartImages["reports-chart-funnel"],
          reportsBiExcelTable(["Etapa", "Cantidad"], funnelRows)
        )
      : "",
    L.charts.status
      ? reportsBiExcelChartBlock(
          "Estados de solicitudes",
          "Distribución en el periodo",
          chartImages["reports-chart-status"],
          reportsBiExcelTable(["Estado", "Cantidad"], statusRows)
        )
      : "",
    L.scores.thermoking
      ? reportsBiExcelChartBlock(
          "Termoking vs carga seca",
          "",
          chartImages["reports-chart-thermoking"],
          reportsBiExcelTable(["Tipo", "Solicitudes"], [
            ["Con Termoking", String(snapshot.thermoking?.yes || 0)],
            ["Carga seca", String(snapshot.thermoking?.no || 0)]
          ])
        )
      : "",
    L.charts.clients
      ? reportsBiExcelChartBlock(
          "Top clientes por recaudo",
          "",
          chartImages["reports-chart-clients"],
          reportsBiExcelTable(["Cliente", "Recaudo COP"], clientRows)
        )
      : "",
    L.charts.routes
      ? reportsBiExcelChartBlock(
          "Rutas activas",
          "Por cantidad de viajes",
          chartImages["reports-chart-routes"],
          reportsBiExcelTable(["Ruta", "Viajes"], routeRows)
        )
      : "",
    L.charts.drivers
      ? reportsBiExcelChartBlock(
          "Top conductores",
          "Viajes asignados",
          chartImages["reports-chart-drivers"],
          reportsBiExcelTable(["Conductor", "Viajes"], driverRows)
        )
      : ""
  ]
    .filter(Boolean)
    .join("");

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" lang="es">
<head>
<meta charset="utf-8"/>
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Analitica</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
body{font-family:Montserrat,Arial,sans-serif;color:${b.text};font-size:11pt}
.xls-logo-cell{background:#ffffff;padding:12px 16px 6px}
.xls-logo{width:160px;max-width:160px;height:auto;display:block}
.xls-banner{background:${b.primaryDeeper};color:${b.onPrimary};font-size:18pt;font-weight:700;padding:14px 16px}
.xls-subbanner{background:${b.primaryDeep};color:${b.onPrimary};font-size:10pt;padding:8px 16px}
.xls-meta{color:${b.muted};font-size:9pt;padding:10px 16px;border-bottom:2px solid ${b.line}}
.xls-section{padding:12px 8px;vertical-align:top;border-bottom:1px solid ${b.line}}
.xls-section-title{background:${b.soft};color:${b.primaryDeeper};font-size:11pt;font-weight:700;padding:8px 12px;border-left:4px solid ${b.primaryDeep}}
.xls-chart-title{margin:0 0 4px;color:${b.primaryDeep};font-size:12pt;font-weight:700}
.xls-muted{margin:0 0 6px;color:${b.muted};font-size:9pt}
.xls-table{width:100%;border-collapse:collapse;margin-top:8px}
.xls-th{background:${b.primaryDeep};color:${b.onPrimary};font-size:9pt;font-weight:700;padding:7px 8px;text-align:left;border:1px solid ${b.primaryDeeper}}
.xls-td{font-size:9pt;padding:6px 8px;border:1px solid ${b.line};vertical-align:top}
.xls-kpi-primary{background:${b.primaryDeeper};color:${b.onPrimary};font-weight:700}
.xls-kpi-warn{background:rgba(217,119,6,0.12);color:${b.text}}
.xls-stat strong{color:${b.primaryDeep};font-size:14pt}
.xls-foot{color:${b.muted};font-size:9pt;padding:10px 16px}
</style>
</head>
<body>
<table width="100%" cellspacing="0" cellpadding="0">
<tr><td colspan="4" class="xls-logo-cell"><img class="xls-logo" src="${logoSrc}" alt="Logo de Transportes Antares" /></td></tr>
<tr><td colspan="4" class="xls-banner">Transportes Antares — Analítica operativa</td></tr>
<tr><td colspan="4" class="xls-subbanner">${reportsBiExcelEsc(snapshot.periodLabel)} · Corte ${reportsBiExcelEsc(snapshot.generatedAt)}</td></tr>
<tr><td colspan="4" class="xls-meta">En operación: ${k.activeOps ?? snapshot.activeOps ?? 0} · Asignadas: ${k.assignRate}% · Cerradas: ${k.closeRate}% · SLA: ${k.slaPct}% · Conversión: ${k.assignRate}%</td></tr>
<tr><td colspan="4" class="xls-section-title">Indicadores clave</td></tr>
<tr>
  <th class="xls-th">Indicador</th><th class="xls-th">Valor</th><th class="xls-th">Tendencia</th><th class="xls-th">Detalle</th>
</tr>
${
  kpiRows.length
    ? kpiRows
        .map(
          (row, i) =>
            `<tr class="${i === 0 ? "xls-kpi-primary" : row[0] === "Alertas documentales" && k.docRisk ? "xls-kpi-warn" : ""}">
        <td class="xls-td">${reportsBiExcelEsc(row[0])}</td>
        <td class="xls-td">${reportsBiExcelEsc(row[1])}</td>
        <td class="xls-td">${reportsBiExcelEsc(row[2])}</td>
        <td class="xls-td">${reportsBiExcelEsc(row[3])}</td>
      </tr>`
        )
        .join("")
    : `<tr><td class="xls-td" colspan="4">Sin indicadores seleccionados en la vista personalizada.</td></tr>`
}
${
  insightRows.length
    ? `<tr><td colspan="4" class="xls-section-title">Hallazgos automáticos</td></tr>
${insightRows.map((r) => `<tr><td class="xls-td"><strong>${reportsBiExcelEsc(r[0])}</strong></td><td class="xls-td" colspan="3">${reportsBiExcelEsc(r[1])}</td></tr>`).join("")}`
    : ""
}
${
  L.scores.sla || L.scores.assign
    ? `<tr><td colspan="4" class="xls-section-title">Cumplimiento y conversión</td></tr>
<tr>
  ${L.scores.sla ? `<td class="xls-td"><strong>SLA</strong></td><td class="xls-td">${k.slaPct}% (${slaOk}/${slaTotal})</td>` : "<td colspan=\"2\"></td>"}
  ${L.scores.assign ? `<td class="xls-td"><strong>Conversión a viaje</strong></td><td class="xls-td">${k.assignRate}% (${k.trips}/${k.requests})</td>` : "<td colspan=\"2\"></td>"}
</tr>`
    : ""
}
${chartBlocks ? `<tr><td colspan="4" class="xls-section-title">Visualizaciones (gráficas + datos)</td></tr>` : ""}
${chartBlocks}
<tr><td colspan="4" class="xls-meta">Exportado desde Antares · Mismos criterios que el panel BI · ${reportsBiExcelEsc(snapshot.periodLabel)}</td></tr>
<tr><td colspan="4" class="xls-foot">${copyrightText}</td></tr>
</table>
</body></html>`;
}

function downloadReportsBiExcel(filename, html) {
  const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportReportsBiToExcel(snapshot, root, layout) {
  if (!root) throw new Error("Panel BI no visible");
  const L = normalizeReportsBiLayout(layout || loadReportsBiLayout());
  await loadChartJsLib();
  if (!state.reportsChartInstances?.length) {
    wireReportsCharts(snapshot, L);
  }
  await new Promise((resolve) => setTimeout(resolve, 560));
  const chartImages = reportsBiCaptureChartImages(root);
  const hasAnyChart = Object.values(chartImages).some((src) => String(src || "").startsWith("data:image"));
  if (!hasAnyChart && Object.values(L.charts).some(Boolean)) {
    notify(userMessage("reportBiExcelChartsPending"), "warn");
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const period = String(snapshot.period || "90d");
  const html = buildReportsBiExcelHtml(snapshot, chartImages, L);
  downloadReportsBiExcel(`analitica_operativa_${period}_${stamp}.xls`, html);
}

function wireReportsCharts(snapshot, layout) {
  destroyReportsCharts();
  const root = nodes.viewRoot?.querySelector(".reports-bi");
  if (!root || !window.Chart) return;
  const L = normalizeReportsBiLayout(layout || loadReportsBiLayout());
  const Chart = window.Chart;
  const { text, muted, grid, font, copTooltip } = reportsBiChartTheme();
  const c = reportsBiChartColors();
  const { primary, primaryDeep, success, palette, barPrimary, barDeep, barSuccess, fillPrimary, fillSuccess, funnel } = c;
  const tooltipBg = c.dark ? "rgba(15, 28, 46, 0.96)" : "rgba(255, 255, 255, 0.98)";
  const tooltipBorder = c.dark ? "rgba(131, 190, 233, 0.35)" : "rgba(55, 124, 192, 0.35)";
  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 480, easing: "easeOutQuart" },
    plugins: {
      legend: { labels: { color: text, font, boxWidth: 12, padding: 12 } },
      tooltip: {
        ...copTooltip,
        backgroundColor: tooltipBg,
        titleColor: text,
        bodyColor: muted,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10
      }
    }
  };
  const scaleOpts = {
    x: { ticks: { color: muted, font }, grid: { color: grid } },
    y: { ticks: { color: muted, font }, grid: { color: grid } }
  };

  const push = (id, config) => {
    const canvas = root.querySelector(id);
    if (!canvas) return;
    state.reportsChartInstances.push(new Chart(canvas, config));
  };

  const labels = snapshot.revenueLabels || snapshot.revenueMonths;

  if (L.charts.revenue) push("#reports-chart-revenue", {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Recaudo COP",
          data: snapshot.revenueSeries,
          backgroundColor: barPrimary,
          borderColor: barPrimary,
          borderRadius: 6,
          yAxisID: "y"
        },
        {
          type: "line",
          label: "Viajes",
          data: snapshot.tripsSeries,
          borderColor: success,
          backgroundColor: fillSuccess,
          fill: true,
          tension: 0.35,
          yAxisID: "y1"
        }
      ]
    },
    options: {
      ...baseOpts,
      scales: {
        x: scaleOpts.x,
        y: { ...scaleOpts.y, position: "left" },
        y1: { position: "right", grid: { drawOnChartArea: false }, ticks: { color: success, font } }
      }
    }
  });

  if (L.charts.weekly) push("#reports-chart-weekly", {
    type: "line",
    data: {
      labels: snapshot.weekKeys.map((k, i) => `S${i + 1}`),
      datasets: [
        {
          label: "Viajes / semana",
          data: snapshot.weekSeries,
          borderColor: primaryDeep,
          backgroundColor: fillPrimary,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: primaryDeep
        }
      ]
    },
    options: { ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } }, scales: scaleOpts }
  });

  if (L.charts.status) push("#reports-chart-status", {
    type: "doughnut",
    data: {
      labels: snapshot.statusChart.map((x) => x.label),
      datasets: [{
        data: snapshot.statusChart.map((x) => x.value),
        backgroundColor: palette,
        borderColor: c.dark ? "rgba(15, 28, 46, 0.9)" : "#ffffff",
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: { ...baseOpts, cutout: "62%", plugins: { ...baseOpts.plugins, legend: { position: "bottom", labels: { color: text, font, boxWidth: 10 } } } }
  });

  if (L.scores.thermoking) push("#reports-chart-thermoking", {
    type: "doughnut",
    data: {
      labels: ["Con Termoking", "Carga seca"],
      datasets: [{
        data: [snapshot.thermoking.yes, snapshot.thermoking.no],
        backgroundColor: [c.primaryDeep, c.neutral],
        borderColor: c.dark ? "rgba(15, 28, 46, 0.9)" : "#ffffff",
        borderWidth: 2
      }]
    },
    options: { ...baseOpts, cutout: "65%", plugins: { ...baseOpts.plugins, legend: { position: "bottom", labels: { color: text, font } } } }
  });

  const hBar = (id, rows, label, color) => {
    push(id, {
      type: "bar",
      data: {
        labels: rows.map((x) => (x[0].length > 24 ? `${x[0].slice(0, 22)}…` : x[0])),
        datasets: [{ label, data: rows.map((x) => x[1]), backgroundColor: color, borderRadius: 6 }]
      },
      options: { indexAxis: "y", ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } }, scales: scaleOpts }
    });
  };

  if (L.charts.clients) hBar("#reports-chart-clients", snapshot.topClients, "COP", barPrimary);
  if (L.charts.routes) hBar("#reports-chart-routes", snapshot.topRoutes, "Viajes", barDeep);
  if (L.charts.drivers) hBar("#reports-chart-drivers", snapshot.topDrivers, "Viajes", barSuccess);

  if (L.charts.funnel) push("#reports-chart-funnel", {
    type: "bar",
    data: {
      labels: snapshot.funnel.map((x) => x.label),
      datasets: [{ label: "Cantidad", data: snapshot.funnel.map((x) => x.value), backgroundColor: funnel, borderRadius: 8 }]
    },
    options: {
      ...baseOpts,
      plugins: { legend: { display: false }, tooltip: baseOpts.plugins.tooltip },
      scales: { x: { ...scaleOpts.x, grid: { display: false } }, y: scaleOpts.y }
    }
  });
}

function reportsExportFiltersHtml() {
  const filters = normalizeReportsExportFilters(state.reportsUi?.exportFilters);
  return `<section class="reports-export-filters" aria-label="Corte temporal de reportes">
    <div class="reports-export-filters-head">
      <div>
        <p class="reports-export-filters-kicker">Corte exportable</p>
        <h3>Periodo de análisis</h3>
        <p class="reports-export-filters-copy">Este corte se aplica al generar reportes con fecha operativa. Inventarios y cumplimiento documental siguen mostrando estado vigente.</p>
      </div>
      <span class="reports-export-filters-badge">${escapeHtml(reportsPeriodLabel(filters.period))}</span>
    </div>
    <div class="reports-bi-period-chips" role="group" aria-label="Periodo exportable">
      ${reportsExportPeriodChip("30d", "30 d", filters.period)}
      ${reportsExportPeriodChip("90d", "90 d", filters.period)}
      ${reportsExportPeriodChip("month", "Mes", filters.period)}
      ${reportsExportPeriodChip("ytd", "Año", filters.period)}
      ${reportsExportPeriodChip("all", "Todo", filters.period)}
    </div>
  </section>`;
}

function reportsExportPanelHtml(user) {
  const cards = [
    { id: "executive_control_tower", icon: "activity", title: "Resumen ejecutivo de gestión", subtitle: "Indicadores integrados de operación, finanzas, RRHH y cumplimiento.", group: "Estrategia" },
    { id: "service_levels", icon: "clock", title: "Cumplimiento de nivel de servicio", subtitle: "Tiempos de respuesta, entrega y desviación frente al SLA.", group: "Operación" },
    { id: "fleet_summary", icon: "truck", title: "Disponibilidad y productividad de flota", subtitle: "Estado operativo, cierres históricos y riesgo documental.", group: "Operación" },
    { id: "trips_operations", icon: "compass", title: "Seguimiento operativo de viajes", subtitle: "Control de viajes, modalidad, SLA y facturación asociada.", group: "Operación" },
    { id: "requests_lifecycle", icon: "file", title: "Trazabilidad de solicitudes", subtitle: "Seguimiento integral desde la radicación hasta la decisión final.", group: "Operación" },
    { id: "drivers_performance", icon: "user", title: "Desempeño y habilitación de conductores", subtitle: "Productividad, vigencia documental y cierre de servicios.", group: "Operación" },
    { id: "fuel_operations", icon: "fuel", title: "Consumo y costos de combustible", subtitle: "Litros, costo por litro, odómetro y responsable del pago.", group: "Costos" },
    { id: "maintenance_fleet", icon: "activity", title: "Gestión de mantenimiento de flota", subtitle: "Intervenciones técnicas, costo e impacto por indisponibilidad.", group: "Costos" },
    { id: "revenue_by_route", icon: "dollar", title: "Ingresos y ticket promedio por ruta", subtitle: "Recaudo, clientes atendidos y participación por trayecto.", group: "Finanzas" },
    { id: "request_funnel", icon: "layers", title: "Conversión operativa de solicitudes", subtitle: "Evolución del volumen por etapa del proceso operativo.", group: "Operación" },
    { id: "document_compliance", icon: "shield", title: "Cumplimiento documental de flota", subtitle: "Estado de SOAT, tecnomecánica y alertas por vencimiento.", group: "Cumplimiento" },
    { id: "payroll_summary", icon: "dollar", title: "Consolidado de nómina", subtitle: "Devengados, deducciones, pagos y aprobaciones de gestión humana.", group: "RRHH" },
    { id: "hiring_pipeline", icon: "briefcase", title: "Gestión de selección y contratación", subtitle: "Seguimiento del proceso de reclutamiento, entrevistas y contratación.", group: "RRHH" },
    { id: "labor_compliance", icon: "shield", title: "Cumplimiento laboral y SST", subtitle: "Controles regulatorios, vencimientos y trazabilidad documental.", group: "Cumplimiento" },
    { id: "users_access", icon: "shield", title: "Gobierno de usuarios y accesos", subtitle: "Roles, permisos, origen del usuario e ingreso al sistema.", group: "Gobierno" },
    { id: "authorizations_traceability", icon: "check", title: "Trazabilidad de autorizaciones", subtitle: "Tiempos de resolución, aprobadores y observaciones de cierre.", group: "Gobierno" }
  ];
  const visibleCards = cards.filter((card) => canAccessReport(user, card.id));
  if (!visibleCards.length) {
    return `<p class="muted">Tu perfil no tiene reportes habilitados. Solicita permisos al administrador.</p>`;
  }
  const groups = [...new Set(visibleCards.map((c) => c.group))];
  const sections = groups
    .map((group) => {
      const groupCards = visibleCards.filter((c) => c.group === group);
      return `<div class="reports-export-group">
        <h3 class="reports-export-group-title">${escapeHtml(group)}</h3>
        <div class="dash-grid reports-export-grid">
        ${groupCards
          .map(
            (card) => `
      <article class="p-card reports-card-pro">
        <div class="p-card-header">
          <div class="p-card-header-left">
            <div class="p-card-icon">${IC[card.icon] || IC.activity}</div>
            <div>
              <h2>${escapeHtml(card.title)}</h2>
              <p class="reports-card-subtitle">${escapeHtml(card.subtitle)}</p>
            </div>
          </div>
        </div>
        <div class="p-card-body">
          <div class="toolbar reports-card-actions">
            <button class="btn btn-sm btn-approve" type="button" data-action="generate-report" data-report="${escapeAttr(card.id)}" data-format="preview" title="Ver en pantalla, sin ventanas emergentes">${IC.eye} Vista previa</button>
            <button class="btn btn-sm btn-action" type="button" data-action="generate-report" data-report="${escapeAttr(card.id)}" data-format="pdf" title="Descarga el reporte en PDF">${IC.download} PDF</button>
            <button class="btn btn-sm btn-action" type="button" data-action="generate-report" data-report="${escapeAttr(card.id)}" data-format="excel" title="Descarga Excel (.xls) con formato corporativo">${IC.file} Excel</button>
          </div>
        </div>
      </article>`
          )
          .join("")}
        </div>
      </div>`;
    })
    .join("");
  return reportsExportFiltersHtml() + sections;
}

function dateInRange(value, range) {
  if (!range) return false;
  const ts = new Date(value || "").getTime();
  if (!Number.isFinite(ts)) return false;
  return ts >= range.start.getTime() && ts <= range.end.getTime();
}

function resolveDriverForEmployee(employee) {
  if (!employee) return null;
  const drivers = read(KEYS.drivers, []);
  const doc = String(employee.idDoc || "").trim();
  if (doc) {
    const byDoc = drivers.find((d) => String(d.idDoc || "").trim() === doc);
    if (byDoc) return byDoc;
  }
  const name = String(employee.name || "").trim().toLowerCase();
  if (!name) return null;
  return drivers.find((d) => String(d.name || "").trim().toLowerCase() === name) || null;
}

const PORTAL_VEHICLE_TYPE_OPTIONS = ["Camion", "Turbo", "Tractomula", "Bus"];

/** Fila de vehículo lista para modales de edición / ficha (catálogos y fechas YYYY-MM-DD). */
function normalizeVehicleRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const v = { ...raw };
  v.color = matchCatalogOptionValue(CO_CATALOGS.vehicleColors, v.color);
  v.bodyType = matchCatalogOptionValue(CO_CATALOGS.bodyTypes, v.bodyType);
  v.fuelType = matchCatalogOptionValue(CO_CATALOGS.fuelTypes, v.fuelType);
  v.axleConfig = matchCatalogOptionValue(CO_CATALOGS.axleConfig, v.axleConfig);
  const typeRaw = String(v.type || "").trim();
  v.type =
    PORTAL_VEHICLE_TYPE_OPTIONS.find((t) => t.toLowerCase() === typeRaw.toLowerCase()) || typeRaw;
  v.soatExpeditionDate = normalizePortalDateYmd(v.soatExpeditionDate);
  v.soatExpiryDate = normalizePortalDateYmd(v.soatExpiryDate);
  v.techInspectionExpeditionDate = normalizePortalDateYmd(v.techInspectionExpeditionDate);
  v.techInspectionExpiryDate = normalizePortalDateYmd(v.techInspectionExpiryDate);
  v.rcPolicyExpiry = normalizePortalDateYmd(v.rcPolicyExpiry);
  return v;
}

/** Estado del curso defensivo para selects del portal (`vigente` | `vencido` | `no_aplica`). */
function normalizeDefensiveCourseForPortal(raw) {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (v === "vigente" || v === "vencido" || v === "no_aplica") return v;
  if (/vencid/.test(v)) return "vencido";
  if (/no\s*aplica/.test(v)) return "no_aplica";
  if (/vigent/.test(v)) return "vigente";
  return "";
}

/**
 * Fila de conductor lista para modales de edición: fechas en YYYY-MM-DD, alias API↔portal
 * y campos que solo viven en RRHH (tipo sangre, EPS, ARL) si el documento coincide.
 */
function normalizeDriverRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const d = { ...raw };
  const occD = d.occupationalExamDate ?? d.psychoTestDate ?? d.psychometricExamDate;
  const intraD = d.instruvialExamDate ?? d.intravehicularExamDate;
  d.occupationalExamDate = normalizePortalDateYmd(occD);
  d.instruvialExamDate = normalizePortalDateYmd(intraD);
  d.occupationalExamExpiry = normalizePortalDateYmd(
    d.occupationalExamExpiry ?? d.psychoTestExpiry ?? d.psychometricExpiry
  );
  d.instruvialExamExpiry = normalizePortalDateYmd(d.instruvialExamExpiry);
  if (d.occupationalExamDate && !d.occupationalExamExpiry) {
    d.occupationalExamExpiry = addOneYearToYmd(d.occupationalExamDate);
  }
  if (d.instruvialExamDate && !d.instruvialExamExpiry) {
    d.instruvialExamExpiry = addOneYearToYmd(d.instruvialExamDate);
  }
  d.psychoTestDate = d.occupationalExamDate;
  d.psychoTestExpiry = d.occupationalExamExpiry;
  d.licenseExpiry = normalizePortalDateYmd(d.licenseExpiry);
  d.defensiveCourseExpiry = normalizePortalDateYmd(d.defensiveCourseExpiry);

  const emp = findPayrollEmployeeByIdDoc(d.idDoc);
  if (emp && typeof emp === "object") {
    const fill = (key) => {
      const cur = d[key];
      const empty = cur == null || (typeof cur === "string" && !String(cur).trim());
      if (empty && emp[key] != null && String(emp[key]).trim() !== "") d[key] = emp[key];
    };
    fill("bloodType");
    fill("eps");
    fill("arl");
    fill("comparendos");
    fill("experienceYears");
    fill("defensiveCourse");
    fill("defensiveCourseExpiry");
    fill("emergencyContact");
    fill("emergencyPhone");
    fill("license");
    fill("licenseCategory");
    fill("licenseExpiry");
    fill("occupationalExamDate");
    fill("occupationalExamExpiry");
    fill("instruvialExamDate");
    fill("instruvialExamExpiry");
    if (!String(d.photoUrl || "").trim()) {
      const av = String(emp.avatarUrl || emp.photoUrl || "").trim();
      if (av) d.photoUrl = av;
    }
  }

  const defPick =
    d.defensiveCourse != null && String(d.defensiveCourse).trim() !== ""
      ? d.defensiveCourse
      : d.defensiveDrivingCourse;
  d.defensiveCourse = normalizeDefensiveCourseForPortal(defPick);
  d.bloodType = matchCatalogOptionValue(CO_CATALOGS.bloodTypes, d.bloodType);
  d.licenseCategory = matchCatalogOptionValue(CO_CATALOGS.licenseCategories, d.licenseCategory);
  d.eps = matchCatalogOptionValue(CO_CATALOGS.eps, d.eps);
  d.arl = matchCatalogOptionValue(CO_CATALOGS.arl, d.arl);
  d.licenseExpiry = normalizePortalDateYmd(d.licenseExpiry);
  d.defensiveCourseExpiry = normalizePortalDateYmd(d.defensiveCourseExpiry);
  d.occupationalExamDate = normalizePortalDateYmd(d.occupationalExamDate);
  d.instruvialExamDate = normalizePortalDateYmd(d.instruvialExamDate);
  if (d.occupationalExamDate && !d.occupationalExamExpiry) {
    d.occupationalExamExpiry = addOneYearToYmd(d.occupationalExamDate);
  }
  if (d.instruvialExamDate && !d.instruvialExamExpiry) {
    d.instruvialExamExpiry = addOneYearToYmd(d.instruvialExamDate);
  }
  const phoneDisp = formatPortalPhoneForDisplay(d.phone);
  if (phoneDisp) d.phone = phoneDisp;
  return d;
}

/** Normaliza payload de formulario de conductor antes de persistir (alta o edición). */
function normalizeDriverFormPayloadForStorage(data) {
  if (!data || typeof data !== "object") return data;
  const d = { ...data };
  if (d.name != null) d.name = normalizeLatinUpperForDb(d.name);
  if (d.address != null) d.address = normalizeLatinUpperForDb(d.address);
  if (d.department != null) d.department = normalizeLatinForDb(d.department);
  if (d.city != null) d.city = normalizeLatinForDb(d.city);
  if (d.eps != null) d.eps = matchCatalogOptionValue(CO_CATALOGS.eps, d.eps);
  if (d.arl != null) d.arl = matchCatalogOptionValue(CO_CATALOGS.arl, d.arl);
  if (d.emergencyContact != null) d.emergencyContact = normalizeLatinUpperForDb(d.emergencyContact);
  if (d.bloodType != null) d.bloodType = matchCatalogOptionValue(CO_CATALOGS.bloodTypes, d.bloodType);
  d.phone = normalizePortalPhoneForStorage(d.phone);
  d.emergencyPhone = normalizePortalPhoneForStorage(d.emergencyPhone);
  d.licenseExpiry = normalizePortalDateYmd(d.licenseExpiry);
  const occDate = normalizePortalDateYmd(d.occupationalExamDate);
  const intraDate = normalizePortalDateYmd(d.instruvialExamDate);
  d.occupationalExamDate = occDate;
  d.instruvialExamDate = intraDate;
  d.occupationalExamExpiry = occDate
    ? addOneYearToYmd(occDate)
    : normalizePortalDateYmd(d.occupationalExamExpiry);
  d.instruvialExamExpiry = intraDate
    ? addOneYearToYmd(intraDate)
    : normalizePortalDateYmd(d.instruvialExamExpiry);
  d.psychoTestDate = occDate;
  d.psychoTestExpiry = occDate ? addOneYearToYmd(occDate) : "";
  d.defensiveCourseExpiry = normalizePortalDateYmd(d.defensiveCourseExpiry);
  return d;
}

/** GH → Conductores: todos los campos del empleado que existen en la ficha de flota (sin pisar disponible/ocupado). */
function pickFirstNonEmpty(...vals) {
  for (const v of vals) {
    if (v != null && String(v).trim() !== "") return v;
  }
  return "";
}

function buildDriverPatchFromEmployee(employee, extraDriverData = {}) {
  const doc = String(employee?.idDoc || "").trim();
  const occ = normalizePortalDateYmd(
    pickFirstNonEmpty(
      employee?.occupationalExamDate,
      employee?.psychoTestDate,
      employee?.psychometricExamDate,
      extraDriverData.occupationalExamDate,
      extraDriverData.psychoTestDate
    )
  );
  const intra = normalizePortalDateYmd(
    pickFirstNonEmpty(
      employee?.instruvialExamDate,
      employee?.intravehicularExamDate,
      extraDriverData.instruvialExamDate,
      extraDriverData.intravehicularExamDate
    )
  );
  const occEx = occ ? addOneYearToYmd(occ) : normalizePortalDateYmd(employee?.occupationalExamExpiry);
  const intraEx = intra ? addOneYearToYmd(intra) : normalizePortalDateYmd(employee?.instruvialExamExpiry);
  const photo = pickFirstNonEmpty(employee?.avatarUrl, employee?.photoUrl, extraDriverData.photoUrl);
  return {
    name: String(employee?.name || "").trim(),
    documentType: String(employee?.documentType || "CC").trim() || "CC",
    idDoc: doc,
    phone: String(employee?.phone || "").trim(),
    city: String(employee?.city || "").trim(),
    department: String(employee?.department || "").trim(),
    address: String(employee?.address || "").trim(),
    emergencyContact: String(employee?.emergencyContact || "").trim(),
    emergencyPhone: String(employee?.emergencyPhone || "").trim(),
    companyId: String(employee?.companyId || "").trim(),
    bloodType: String(employee?.bloodType || "").trim(),
    license: String(extraDriverData.license || employee?.license || "").trim(),
    licenseCategory: String(extraDriverData.licenseCategory || employee?.licenseCategory || "C2").trim(),
    licenseExpiry: normalizePortalDateYmd(extraDriverData.licenseExpiry || employee?.licenseExpiry),
    occupationalExamDate: occ,
    occupationalExamExpiry: occEx,
    instruvialExamDate: intra,
    instruvialExamExpiry: intraEx,
    psychoTestDate: occ,
    psychoTestExpiry: occEx,
    defensiveCourse: String(employee?.defensiveCourse || "").trim(),
    defensiveCourseExpiry: normalizePortalDateYmd(employee?.defensiveCourseExpiry),
    eps: String(employee?.eps || "").trim(),
    arl: String(employee?.arl || "").trim(),
    comparendos: parseNum(employee?.comparendos ?? 0),
    experienceYears: parseNum(employee?.experienceYears ?? 0),
    photoUrl: photo,
    contractType: String(employee?.contractType || "").trim(),
    baseSalary: parseNum(employee?.baseSalary ?? 0),
    startDate: normalizePortalDateYmd(employee?.startDate)
  };
}

function buildEmployeeBasicPatchFromDriver(driver) {
  const occ = normalizePortalDateYmd(driver?.occupationalExamDate);
  const intra = normalizePortalDateYmd(driver?.instruvialExamDate);
  const occEx = occ ? addOneYearToYmd(occ) : normalizePortalDateYmd(driver?.occupationalExamExpiry);
  const intraEx = intra ? addOneYearToYmd(intra) : normalizePortalDateYmd(driver?.instruvialExamExpiry);
  const avatar = pickFirstNonEmpty(driver?.photoUrl, driver?.avatarUrl);
  return {
    name: String(driver?.name || "").trim(),
    phone: String(driver?.phone || "").trim(),
    city: String(driver?.city || "").trim(),
    department: String(driver?.department || "").trim(),
    address: String(driver?.address || "").trim(),
    emergencyContact: String(driver?.emergencyContact || "").trim(),
    emergencyPhone: String(driver?.emergencyPhone || "").trim(),
    bloodType: String(driver?.bloodType || "").trim(),
    license: String(driver?.license || "").trim(),
    licenseCategory: String(driver?.licenseCategory || "").trim(),
    licenseExpiry: normalizePortalDateYmd(driver?.licenseExpiry),
    occupationalExamDate: occ,
    occupationalExamExpiry: occEx,
    instruvialExamDate: intra,
    instruvialExamExpiry: intraEx,
    psychoTestDate: occ,
    psychoTestExpiry: occEx,
    defensiveCourse: String(driver?.defensiveCourse || "").trim(),
    defensiveCourseExpiry: normalizePortalDateYmd(driver?.defensiveCourseExpiry),
    eps: String(driver?.eps || "").trim(),
    arl: String(driver?.arl || "").trim(),
    comparendos: parseNum(driver?.comparendos ?? 0),
    experienceYears: parseNum(driver?.experienceYears ?? 0),
    avatarUrl: avatar
  };
}

/** Gestión humana → Conductores: copia la ficha operativa del empleado; conserva disponibilidad y ocupación. */
async function syncDriverFromEmployee(employee, extraDriverData = {}) {
  if (!employee || String(employee.workerRole || "") !== "conductor") {
    return { ok: true, skipped: true };
  }
  const drivers = read(KEYS.drivers, []);
  const doc = String(employee.idDoc || "").trim();
  const existing = drivers.find((d) => normalizeDocumentDigits(d.idDoc) === normalizeDocumentDigits(doc));
  const driverPatch = buildDriverPatchFromEmployee(employee, extraDriverData);
  if (!driverPatch.license || !driverPatch.licenseExpiry) {
    return { ok: false, message: userMessage("payrollDriverLicenseSync") };
  }
  if (new Date(driverPatch.licenseExpiry).getTime() <= Date.now()) {
    return { ok: false, message: userMessage("payrollLicenseExpired") };
  }
  try {
    if (existing) {
      const nextDrivers = drivers.map((d) =>
        d.id === existing.id
          ? stampUpdatedRecord({
              ...d,
              ...driverPatch,
              id: existing.id,
              available: d.available !== false,
              autoBusy: d.autoBusy,
              hiredAt: d.hiredAt || employee.hiredAt || employee.startDate || nowIso()
            })
          : d
      );
      await writeAwaitServer(KEYS.drivers, nextDrivers, { notifyOnFailure: false });
      return { ok: true, driverId: existing.id };
    }
    const newId = newUuidV4();
    await writeAwaitServer(
      KEYS.drivers,
      [
        stampCreatedRecord({
          id: newId,
          ...driverPatch,
          available: true,
          hiredAt: employee.hiredAt || employee.startDate || nowIso()
        }),
        ...drivers
      ],
      { notifyOnFailure: false }
    );
    return { ok: true, driverId: newId };
  } catch (err) {
    return {
      ok: false,
      message: String(err?.message || "No fue posible sincronizar la ficha de conductor en el servidor.")
    };
  }
}

const SST_COMPLIANCE_RECORD_TYPES = [
  "Afiliacion EPS",
  "Afiliacion pension",
  "Afiliacion ARL",
  "Examen medico ocupacional",
  "Capacitacion SST",
  "Inspeccion documental"
];

const SST_COMPLIANCE_STATUSES = ["Pendiente", "En gestion", "Cumplido"];

function normalizeSstComplianceRow(row) {
  if (!row || typeof row !== "object") return row;
  const due = normalizePortalDateYmd(row.dueDate || row.expiryDate);
  const recordType = String(row.recordType || "").trim();
  const status = String(row.status || "Pendiente").trim();
  const rtMatch =
    SST_COMPLIANCE_RECORD_TYPES.find(
      (t) => t.toLowerCase() === recordType.toLowerCase()
    ) || recordType;
  const stMatch =
    SST_COMPLIANCE_STATUSES.find((t) => t.toLowerCase() === status.toLowerCase()) || status;
  return { ...row, dueDate: due, expiryDate: due, recordType: rtMatch, status: stMatch };
}

function normalizeVacancyRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const v = { ...raw };
  v.deadline = normalizePortalDateYmd(v.deadline);
  v.publishedFrom = normalizePortalDateYmd(v.publishedFrom || v.visibleFrom);
  return v;
}

function normalizePositionRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const p = { ...raw };
  p.contractTypeDefault = matchCatalogOptionValue(CO_CATALOGS.positionContractTypes, p.contractTypeDefault);
  p.workSchedule = matchCatalogOptionValue(CO_CATALOGS.workSchedule, p.workSchedule);
  p.arlRiskLevel = matchCatalogOptionValue(CO_CATALOGS.arlRiskLevels, p.arlRiskLevel);
  return p;
}

function normalizeCandidateRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const c = { ...raw };
  c.documentType =
    matchCatalogOptionValue(CO_CATALOGS.documentTypes, c.documentType) || String(c.documentType || "CC").trim();
  c.educationLevel = matchCatalogOptionValue(CO_CATALOGS.educationLevel, c.educationLevel);
  c.birthDate = normalizePortalDateYmd(c.birthDate);
  c.availabilityDate = normalizePortalDateYmd(c.availabilityDate);
  const phoneDisp = formatPortalPhoneForDisplay(c.phone);
  if (phoneDisp) c.phone = phoneDisp;
  return c;
}

function normalizeInterviewRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const i = { ...raw };
  const rawWhen = String(i.when || "").trim();
  i.whenLocal =
    rawWhen.length >= 16 && rawWhen.includes("T") && !rawWhen.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(rawWhen)
      ? rawWhen.slice(0, 16)
      : String(toInputDate(rawWhen) || "").slice(0, 16);
  return i;
}

function normalizeHrAbsenceRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const a = { ...raw };
  a.startDate = normalizePortalDateYmd(a.startDate);
  a.endDate = normalizePortalDateYmd(a.endDate);
  a.absenceType = payrollNormalizeAbsenceTypeKey(a.absenceType || "incapacidad_eps");
  a.absenceSubtype = payrollNormalizeAbsenceSubtype(a.absenceType, a.absenceSubtype);
  return a;
}

function patchApprovalRowForEmployee(approval, employee, empId, empName) {
  if (!approval || typeof approval !== "object") return approval;
  const payload =
    approval.payload && typeof approval.payload === "object" ? { ...approval.payload } : null;
  if (!payload) return approval;
  let changed = false;
  let next = approval;
  const docMatch =
    normalizeDocumentDigits(payload.idDoc) &&
    normalizeDocumentDigits(payload.idDoc) === normalizeDocumentDigits(employee?.idDoc);

  if (approval.type === "register_hr_absence" && String(payload.employeeId || "") === empId) {
    payload.employeeName = empName;
    changed = true;
    next = {
      ...next,
      title: `Registro de ausencia de ${empName}`,
      payload
    };
  } else if (approval.type === "mark_payroll_paid") {
    const run = read(KEYS.payrollRuns, []).find((row) => String(row.id) === String(payload.payrollRunId || ""));
    if (run && String(run.employeeId || "") === empId) {
      payload.employeeName = empName;
      changed = true;
      const month = String(payload.month || run.month || "").trim();
      next = {
        ...next,
        title: month ? `Aprobar pago de nomina ${empName} (${month})` : `Aprobar pago de nomina ${empName}`,
        payload
      };
    }
  } else if (approval.type === "create_employee" && (String(payload.employeeId || "") === empId || docMatch)) {
    payload.name = empName;
    payload.phone = employee.phone;
    payload.position = employee.position;
    payload.idDoc = employee.idDoc;
    changed = true;
    next = { ...next, title: `Creacion de empleado ${empName}`, payload };
  }

  return changed ? next : approval;
}

/**
 * Tras guardar en Gestión humana: actualiza conductor (si aplica) y copias desnormalizadas
 * (contratos, liquidaciones, ausencias, SST, autorizaciones, viajes, combustible).
 */
async function propagateEmployeeChanges(employee, extraDriverData = {}) {
  if (!employee?.id) return { ok: true, skipped: true };
  const empId = String(employee.id);
  const empName = String(employee.name || "").trim();
  const empDoc = String(employee.idDoc || "").trim();
  const company = read(KEYS.companies, []).find((row) => String(row.id) === String(employee.companyId || ""));
  const companyName = String(company?.name || "").trim();

  let driverResult = { ok: true, skipped: true };
  if (String(employee.workerRole || "") === "conductor") {
    driverResult = await syncDriverFromEmployee(employee, extraDriverData);
    if (!driverResult.ok) return driverResult;
  }

  const contractFields = {
    employeeName: empName,
    employeeIdDoc: empDoc,
    idDocSnapshot: empDoc,
    position: String(employee.position || "").trim(),
    positionName: String(employee.position || "").trim(),
    positionId: String(employee.positionId || "").trim(),
    companyId: String(employee.companyId || "").trim(),
    companyName,
    salary: employee.baseSalary,
    transportAllowance: readEmployeeTransportAllowanceCop(employee),
    contractType: employee.contractType,
    workerRole: employee.workerRole,
    eps: String(employee.eps || "").trim(),
    pensionFund: String(employee.pensionFund || "").trim(),
    arl: String(employee.arl || "").trim(),
    schedule: String(employee.workSchedule || "").trim()
  };

  const contracts = read(KEYS.contracts, []);
  const empDocDigits = normalizeDocumentDigits(empDoc);
  let contractsChanged = false;
  const nextContracts = contracts.map((row) => {
    const linkedById = String(row.employeeId || "") === empId;
    const linkedByDoc =
      !linkedById &&
      empDocDigits &&
      normalizeDocumentDigits(row.idDocSnapshot || row.employeeIdDoc) === empDocDigits;
    if (!linkedById && !linkedByDoc) return row;
    contractsChanged = true;
    return stampUpdatedRecord({
      ...row,
      ...contractFields,
      id: row.id,
      employeeId: row.employeeId || empId
    });
  });

  const payrollRuns = read(KEYS.payrollRuns, []);
  let runsChanged = false;
  const nextRuns = payrollRuns.map((row) => {
    if (String(row.employeeId || "") !== empId) return row;
    runsChanged = true;
    return stampUpdatedRecord({ ...row, employeeName: empName, id: row.id });
  });

  const absences = read(KEYS.hrAbsences, []);
  let absencesChanged = false;
  const nextAbsences = absences.map((row) => {
    if (String(row.employeeId || "") !== empId) return row;
    absencesChanged = true;
    return stampUpdatedRecord({ ...row, employeeName: empName, id: row.id });
  });

  const sstRecords = read(KEYS.sstCompliance, []);
  let sstChanged = false;
  const nextSst = sstRecords.map((row) => {
    if (String(row.employeeId || "") !== empId) return normalizeSstComplianceRow(row);
    sstChanged = true;
    return normalizeSstComplianceRow(
      stampUpdatedRecord({ ...row, employeeName: empName, id: row.id })
    );
  });

  const approvals = read(KEYS.approvals, []);
  let approvalsChanged = false;
  const nextApprovals = approvals.map((row) => {
    const patched = patchApprovalRowForEmployee(row, employee, empId, empName);
    if (patched !== row) approvalsChanged = true;
    return patched;
  });

  const drivers = read(KEYS.drivers, []);
  const driver =
    drivers.find((row) => String(row.id) === String(driverResult.driverId || "")) ||
    drivers.find((row) => normalizeDocumentDigits(row.idDoc) === normalizeDocumentDigits(empDoc));
  const driverId = driver ? String(driver.id) : "";
  const driverPhone = normalizePortalPhoneForStorage(String(driver?.phone || employee.phone || ""));

  let tripsChanged = false;
  let nextRequests = reqRead();
  if (driverId || empName) {
    const nameLower = empName.toLowerCase();
    nextRequests = nextRequests.map((req) => {
      if (!req.trip) return req;
      const tripDriverId = String(req.trip.driverId || "");
      const matchById = driverId && tripDriverId === driverId;
      const matchByName =
        !tripDriverId && empName && String(req.trip.driverName || "").trim().toLowerCase() === nameLower;
      if (!matchById && !matchByName) return req;
      tripsChanged = true;
      return {
        ...req,
        trip: stampUpdatedRecord({
          ...req.trip,
          driverName: empName || req.trip.driverName,
          driverPhone: driverPhone || req.trip.driverPhone
        })
      };
    });
  }

  const fuelLogs = read(KEYS.fuelLogs, []);
  let fuelChanged = false;
  const nextFuel = fuelLogs.map((row) => {
    if (!driverId || String(row.driverId || "") !== driverId) return row;
    fuelChanged = true;
    return stampUpdatedRecord({
      ...row,
      driverName: empName,
      driverPhone: driverPhone,
      id: row.id
    });
  });

  try {
    if (contractsChanged) await writeAwaitServer(KEYS.contracts, nextContracts, { notifyOnFailure: false });
    if (runsChanged) await writeAwaitServer(KEYS.payrollRuns, nextRuns, { notifyOnFailure: false });
    if (absencesChanged) await writeAwaitServer(KEYS.hrAbsences, nextAbsences, { notifyOnFailure: false });
    if (sstChanged) await writeAwaitServer(KEYS.sstCompliance, nextSst, { notifyOnFailure: false });
    if (approvalsChanged) await writeAwaitServer(KEYS.approvals, nextApprovals, { notifyOnFailure: false });
    if (tripsChanged) await reqWriteAwait(nextRequests);
    if (fuelChanged) await writeFuelLogsAwait(nextFuel);
    if (tripsChanged) recalculateResourceAvailability();
  } catch (err) {
    return {
      ok: false,
      message: String(err?.message || "Empleado guardado, pero falló la actualización en módulos vinculados.")
    };
  }
  return { ok: true, driver: driverResult };
}

/** Conductores → Gestión humana: solo datos básicos; no toca nómina ni contrato. */
async function syncEmployeeFromDriver(employee, driverPatch) {
  if (!employee?.id || !driverPatch) return { ok: true, skipped: true };
  const basicPatch = buildEmployeeBasicPatchFromDriver(driverPatch);
  const merged = stampUpdatedRecord({
    ...employee,
    ...basicPatch,
    id: employee.id,
    workerRole: employee.workerRole,
    companyId: employee.companyId,
    idDoc: employee.idDoc,
    documentType: employee.documentType
  });
  try {
    const employees = read(KEYS.payrollEmployees, []);
    const next = employees.map((row) => (String(row.id) === String(employee.id) ? merged : row));
    await writeAwaitServer(KEYS.payrollEmployees, next, { notifyOnFailure: false });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: String(err?.message || userMessage("driverUpdatedHrSyncFailed"))
    };
  }
}

function contractDedupKey(row) {
  if (!row) return "";
  const empKey =
    String(row.employeeId || "").trim().toLowerCase() ||
    String(row.idDocSnapshot || "").trim().toLowerCase() ||
    String(row.candidateId || "").trim().toLowerCase();
  const tpl = String(row.contractTemplateKind || row.templateKind || "").trim().toLowerCase();
  const start = String(row.startDate || "").trim();
  if (!empKey) return "";
  return `${empKey}::${tpl}::${start}`;
}

function dedupContracts(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Map();
  const result = [];
  for (const row of list) {
    if (!row) continue;
    const key = contractDedupKey(row);
    if (!key) {
      result.push(row);
      continue;
    }
    if (!seen.has(key)) {
      seen.set(key, result.length);
      result.push(row);
      continue;
    }
    const idx = seen.get(key);
    const prev = result[idx];
    const prevTs = new Date(prev?.updatedAt || prev?.createdAt || 0).getTime() || 0;
    const curTs = new Date(row.updatedAt || row.createdAt || 0).getTime() || 0;
    result[idx] = curTs > prevTs ? { ...prev, ...row, id: prev.id || row.id } : { ...row, ...prev, id: prev.id || row.id };
  }
  return result;
}

function purgeDuplicateContracts() {
  const before = read(KEYS.contracts, []);
  const after = dedupContracts(before);
  if (after.length !== before.length) {
    write(KEYS.contracts, after);
  }
}

function normalizeDocumentDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Comparación de unicidad de documento en nómina (dígitos vs pasaporte/PEP alfanumérico). */
function payrollEmployeeDocumentDedupKey(documentType, value) {
  const dt = String(documentType || "CC").toUpperCase();
  const raw = String(value || "").trim();
  if (dt === "PAS" || dt === "PEP") return raw.replace(/[.\s]/g, "").toUpperCase();
  return normalizeDocumentDigits(raw);
}

/** Consulta PostgreSQL para duplicidad de documento de colaborador (validación inmediata en formularios). */
async function queryPayrollEmployeeDocumentDuplicateFromApi({
  documentType,
  idDoc,
  companyId,
  excludeId
} = {}) {
  if (!portalCanRefreshFromApi()) return null;
  const api = window.AntaresApi;
  if (!api?.getJson) return null;
  const params = new URLSearchParams({
    documentType: String(documentType || "CC"),
    idDoc: String(idDoc || "").trim()
  });
  const cid = String(companyId || "").trim();
  const xid = String(excludeId || "").trim();
  if (cid) params.set("companyId", cid);
  if (xid) params.set("excludeId", xid);
  try {
    return await api.getJson(`/portal/payroll-employees/check-document?${params.toString()}`);
  } catch (_e) {
    return null;
  }
}

/**
 * Reglas de persistencia empleado (portal ↔ PostgreSQL empleados_nomina):
 * — MAYÚSCULAS sin tildes: nombre, dirección, contacto emergencia, cargo texto, centro costos, etc.
 * — Catálogo (texto exacto): EPS, banco, tipo contrato, género, plantilla Word (oficina|fijo|prestacion).
 * — Sin mayúsculas forzadas: departamento/ciudad, correo, teléfono, selects de catálogo.
 */
function sanitizePayrollEmployeeFieldsForPersist(fields) {
  const f = fields && typeof fields === "object" ? { ...fields } : {};
  const wr =
    String(f.workerRole || "").trim() ||
    (String(f.position || "").toLowerCase().includes("conductor") ? "conductor" : "empleado");
  const contractType =
    matchCatalogOptionValue(CO_CATALOGS.contractTypes, f.contractType) ||
    String(f.contractType || "Termino indefinido").trim();
  return {
    ...f,
    name: normalizeLatinUpperForDb(String(f.name || "").trim()),
    documentType: matchCatalogOptionValue(CO_CATALOGS.documentTypes, f.documentType) || String(f.documentType || "CC").trim(),
    gender: matchCatalogOptionValue(CO_CATALOGS.genders, f.gender),
    maritalStatus: matchCatalogOptionValue(CO_CATALOGS.maritalStatus, f.maritalStatus),
    educationLevel: matchCatalogOptionValue(CO_CATALOGS.educationLevel, f.educationLevel),
    bloodType: matchCatalogOptionValue(CO_CATALOGS.bloodTypes, f.bloodType),
    department: normalizeLatinForDb(String(f.department || "").trim()),
    city: normalizeLatinForDb(String(f.city || "").trim()),
    address: normalizeLatinUpperForDb(String(f.address || "").trim()),
    phone: normalizePortalPhoneForStorage(String(f.phone || "").trim()),
    personalEmail: normalizeEmail(String(f.personalEmail || "")),
    emergencyContact: normalizeLatinUpperForDb(String(f.emergencyContact || "").trim()),
    emergencyPhone: normalizePortalPhoneForStorage(String(f.emergencyPhone || "").trim()),
    emergencyRelation: normalizeLatinUpperForDb(String(f.emergencyRelation || "").trim()),
    position: normalizeLatinUpperForDb(String(f.position || "").trim()),
    workerRole: wr,
    contractType,
    costCenter: normalizeLatinUpperForDb(String(f.costCenter || "").trim()),
    payFrequency: matchCatalogOptionValue(CO_CATALOGS.payFrequency, f.payFrequency) || String(f.payFrequency || "Mensual").trim(),
    arlRiskLevel: matchCatalogOptionValue(CO_CATALOGS.arlRiskLevels, f.arlRiskLevel),
    workSchedule: matchCatalogOptionValue(CO_CATALOGS.workSchedule, f.workSchedule),
    contributorType: matchCatalogOptionValue(CO_CATALOGS.contributorTypes, f.contributorType),
    eps: matchCatalogOptionValue(CO_CATALOGS.eps, f.eps),
    pensionFund: matchCatalogOptionValue(CO_CATALOGS.pensionFunds, f.pensionFund),
    arl: matchCatalogOptionValue(CO_CATALOGS.arl, f.arl),
    severanceFund: matchCatalogOptionValue(CO_CATALOGS.severanceFunds, f.severanceFund),
    compensationFund: matchCatalogOptionValue(CO_CATALOGS.compensationFunds, f.compensationFund),
    bankName: matchCatalogOptionValue(CO_CATALOGS.banks, f.bankName),
    bankAccountType: matchCatalogOptionValue(CO_CATALOGS.accountTypes, f.bankAccountType || "Ahorros"),
    bankAccount: String(f.bankAccount || "").trim(),
    licenseCategory: matchCatalogOptionValue(CO_CATALOGS.licenseCategories, f.licenseCategory),
    contractTemplateKind: normalizeContractTemplateKind(f.contractTemplateKind, contractType, wr),
    illnessDescription:
      String(f.hasIllness || "").toLowerCase() === "si"
        ? normalizeLatinUpperForDb(String(f.illnessDescription || "").trim())
        : ""
  };
}

if (typeof window.setBootstrapCallbacks === "function") {
  window.setBootstrapCallbacks({
    applySystemParametersToClientRules,
    onNotificationPreferencesApplied: syncNotificationPrefsSidebarUi,
    setPortalDataHydrating,
    onPostInteractiveBootstrap: () => {
      if (typeof window.__portalRefreshAfterBootstrap === "function") {
        try {
          window.__portalRefreshAfterBootstrap();
        } catch (_e) {}
      }
    },
    orchestration: {
      tryApiRefreshBridge,
      refreshPositionsCatalogFromApi,
      hydrateOwnProfileFromApi,
      devWarn
    },
    applyPayloadHooks: {
      ensureUsersPermissions,
      normalizeFuelLogsList,
      normalizeVehicleTechnicalLogsList,
      patchOperatorCompanyKindIfNeeded,
      canViewAllNotifications,
      filterNotificationsForUser,
      mergeNotificationsListPreserveReadAt,
      sanitizePayrollEmployeeFieldsForPersist,
      normalizePayrollEmployeeRowDates,
      normalizeSstComplianceRow,
      dispatchPositionsCatalogUpdated
    }
  });
}
if (typeof window.hydrateSystemParametersFromCache === "function") {
  window.hydrateSystemParametersFromCache();
}

/** Aplica validación en vivo (mayúsculas / catálogo) a campos libres del formulario de empleado. */
function wirePayrollEmployeeFormFieldSanitization(formEl) {
  if (!formEl) return;
  const upperBlur = [
    "input[name='address']",
    "input[name='costCenter']",
    "textarea[name='illnessDescription']",
    "textarea[name='contractDurationOther']"
  ];
  upperBlur.forEach((sel) => {
    const el = formEl.querySelector(sel);
    if (!el || el.dataset.payrollSanitizeWired === "1") return;
    el.dataset.payrollSanitizeWired = "1";
    const mode =
      String(el.tagName || "").toUpperCase() === "TEXTAREA" && sel.includes("contractDurationOther")
        ? "preserve-text"
        : "db-upper";
    el.setAttribute("data-antares-validate-blur", mode);
    if (mode === "db-upper") el.setAttribute("data-antares-field", "db-upper");
  });
  window.AntaresValidation?.decorateFormFields?.(formEl);
}

/**
 * Verificación inmediata de documento duplicado en formularios de personas: en cuanto el
 * usuario sale del campo «N° documento» (o cambia tipo de documento/empresa) se avisa si ya
 * existe un registro con ese documento, sin esperar a diligenciar todo el formulario ni a que
 * el servidor rechace el guardado.
 *
 * @param {HTMLFormElement} formEl
 * @param {{ storageKey?: string, useCompanyScope?: boolean, excludeId?: string, entityLabel?: string, serverCheck?: boolean }} [opts]
 * @returns {(opts?: { silent?: boolean }) => Promise<boolean>} `check`: true si NO hay duplicado bloqueante.
 */
function wireFormDocDuplicateCheck(formEl, opts = {}) {
  const V = window.AntaresValidation;
  const docInput = formEl?.querySelector("input[name='idDoc']");
  if (!docInput) return async () => true;
  const storageKey = opts.storageKey || KEYS.payrollEmployees;
  const useCompanyScope = opts.useCompanyScope !== false;
  const entityLabel = opts.entityLabel || "colaborador";
  const serverCheck = opts.serverCheck === true;
  const docTypeSel = formEl.querySelector("select[name='documentType']");
  const companySel = useCompanyScope ? formEl.querySelector("select[name='companyId']") : null;
  const excludeId = String(opts.excludeId || "").trim();
  let dupNotifyTimer = null;
  let lastDupToastSig = "";
  let serverCheckTimer = null;
  let serverCheckSeq = 0;

  const clearBlock = () => {
    if (dupNotifyTimer) {
      clearTimeout(dupNotifyTimer);
      dupNotifyTimer = null;
    }
    lastDupToastSig = "";
    docInput.dataset.dupLastToastMsg = "";
    docInput.dataset.serverDupError = "";
    if (String(docInput.dataset.dupError || "") === "1") {
      docInput.dataset.dupError = "";
      V?.clearFieldError?.(docInput);
    }
    docInput.setCustomValidity?.("");
  };

  const applyDuplicateMessage = (dupMsg, { silent, toastKey, blocking }) => {
    if (blocking) {
      docInput.dataset.dupError = "1";
      docInput.dataset.serverDupError = "1";
      V?.setFieldError?.(docInput, dupMsg);
      docInput.setCustomValidity?.(dupMsg);
    } else {
      docInput.dataset.dupError = "";
      docInput.dataset.serverDupError = "";
      docInput.setCustomValidity?.("");
      V?.setFieldError?.(docInput, dupMsg);
    }
    const fireDupToast = () => {
      try {
        if (typeof notify === "function") notify(dupMsg, blocking ? "error" : "info", 4200);
      } catch (_e) {
        /* noop */
      }
    };
    if (!silent) {
      if (docInput.dataset.dupLastToastMsg !== dupMsg) {
        docInput.dataset.dupLastToastMsg = dupMsg;
        fireDupToast();
      }
    } else if (lastDupToastSig !== toastKey) {
      lastDupToastSig = toastKey;
      if (dupNotifyTimer) clearTimeout(dupNotifyTimer);
      dupNotifyTimer = setTimeout(() => {
        dupNotifyTimer = null;
        const stillBlocked =
          String(docInput.dataset.dupError || "") === "1" ||
          String(docInput.dataset.serverDupError || "") === "1";
        if ((stillBlocked || !blocking) && docInput.value.trim()) {
          docInput.dataset.dupLastToastMsg = dupMsg;
          fireDupToast();
        }
      }, 380);
    }
    if (!silent && blocking) {
      try {
        docInput.scrollIntoView?.({ behavior: "smooth", block: "center" });
      } catch (_e) {
        /* noop */
      }
    }
  };

  const runServerDuplicateCheck = async ({ silent, docType, docVal, companyId, force = false }) => {
    if (!serverCheck || !portalCanRefreshFromApi()) return null;
    const seq = ++serverCheckSeq;
    if (!force) {
      await new Promise((resolve) => {
        clearTimeout(serverCheckTimer);
        serverCheckTimer = setTimeout(resolve, force ? 0 : 320);
      });
      if (seq !== serverCheckSeq) return null;
    }
    const remote = await queryPayrollEmployeeDocumentDuplicateFromApi({
      documentType: docType,
      idDoc: docVal.normalized,
      companyId,
      excludeId
    });
    if (seq !== serverCheckSeq || !remote) return remote;
    if (remote.found) {
      const who = String(remote.name || "").trim() ? ` (${String(remote.name).trim()})` : "";
      const scopeTail = useCompanyScope && companyId ? " en esta empresa" : "";
      const toastKey = `srv:${docVal.normalized}:${companyId || "none"}:${excludeId || "new"}`;
      if (remote.blocking) {
        const dupMsg = `Ya existe un ${entityLabel} con el documento ${docVal.normalized}${who}${scopeTail}. No puede repetirse.`;
        applyDuplicateMessage(dupMsg, { silent, toastKey, blocking: true });
      } else if (useCompanyScope && !companyId) {
        const dupMsg = `Este documento ya existe${who}. Si es para otra empresa puede continuar; al elegir la empresa se verificará.`;
        applyDuplicateMessage(dupMsg, { silent, toastKey, blocking: false });
      } else {
        clearBlock();
      }
    } else if (String(docInput.dataset.dupError || "") !== "1") {
      clearBlock();
    }
    return remote;
  };

  const check = async ({ silent = false, forceServer = false } = {}) => {
    const rawDoc = String(docInput.value || "").trim();
    if (!rawDoc) {
      clearBlock();
      serverCheckSeq += 1;
      return true;
    }
    const docType = String(docTypeSel?.value || "CC").toUpperCase();
    const docVal = validateColombianDocument(docType, rawDoc);
    if (!docVal.ok) return true;
    const needle = payrollEmployeeDocumentDedupKey(docType, docVal.normalized);
    const companyId = String(companySel?.value || "").trim();
    const records = read(storageKey, []);
    const matches = records.filter((r) => {
      if (String(r.id || "") === excludeId) return false;
      const rdt = String(r.documentType || "CC").toUpperCase();
      if (rdt !== docType) return false;
      return payrollEmployeeDocumentDedupKey(rdt, r.idDoc) === needle;
    });
    if (!matches.length) {
      if (String(docInput.dataset.dupError || "") !== "1") {
        docInput.dataset.dupError = "";
        if (String(docInput.dataset.serverDupError || "") !== "1") clearBlock();
      }
    } else {
      const blocking = useCompanyScope
        ? companyId
          ? matches.find((r) => String(r.companyId || "") === companyId)
          : null
        : matches[0];
      if (blocking) {
        const who = String(blocking.name || "").trim() ? ` (${String(blocking.name).trim()})` : "";
        const scopeTail = useCompanyScope ? " en esta empresa" : "";
        const dupMsg = `Ya existe un ${entityLabel} con el documento ${needle}${who}${scopeTail}. No puede repetirse.`;
        const toastKey = `dup:${needle}:${companyId || "none"}:${excludeId || "new"}`;
        applyDuplicateMessage(dupMsg, { silent, toastKey, blocking: true });
      } else if (useCompanyScope && !companyId) {
        const ref = String(matches[0]?.name || "").trim();
        const who = ref ? ` (${ref})` : "";
        const dupMsg = `Este documento ya existe${who}. Si es para otra empresa puede continuar; al elegir la empresa se verificará.`;
        const toastKey = `warn:${needle}:${excludeId || "new"}`;
        applyDuplicateMessage(dupMsg, { silent, toastKey, blocking: false });
      } else {
        clearBlock();
      }
    }
    if (serverCheck) {
      await runServerDuplicateCheck({ silent, docType, docVal, companyId, force: forceServer });
    }
    const blocked =
      String(docInput.dataset.dupError || "") === "1" ||
      String(docInput.dataset.serverDupError || "") === "1";
    return !blocked;
  };

  if (docInput.dataset.dupCheckWired !== "1") {
    docInput.dataset.dupCheckWired = "1";
    docInput.addEventListener("input", () => {
      void check({ silent: true });
    });
    docInput.addEventListener("blur", () => {
      void check({ silent: false, forceServer: true });
    });
    docInput.addEventListener("change", () => {
      void check({ silent: false, forceServer: true });
    });
    docTypeSel?.addEventListener("change", () => {
      void check({ silent: false, forceServer: true });
    });
    companySel?.addEventListener("change", () => {
      void check({ silent: false, forceServer: true });
    });
  }
  return check;
}

/** Alta de empleado (unicidad por empresa, documento + verificación en servidor). */
function wireEmployeePayrollDuplicateDocCheck(formEl, opts = {}) {
  return wireFormDocDuplicateCheck(formEl, {
    storageKey: KEYS.payrollEmployees,
    useCompanyScope: true,
    entityLabel: "colaborador",
    excludeId: opts.excludeId,
    serverCheck: true
  });
}

/** Coincide valor guardado (p. ej. mayúsculas en BD) con opción del catálogo del formulario. */
function matchCatalogOptionValue(catalog, stored) {
  const s = String(stored || "").trim();
  if (!s) return "";
  const list = Array.isArray(catalog) ? catalog : [];
  const exact = list.find((v) => String(v).trim() === s);
  if (exact) return exact;
  const lower = s.toLowerCase();
  const ci = list.find((v) => String(v).trim().toLowerCase() === lower);
  return ci || s;
}

function normalizeContractTemplateKind(raw, contractType, workerRole) {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^documentacion\//, "");
  const byFile = {
    "contrato_administrativo_oficina.docx": "oficina",
    contrato_administrativo_oficina: "oficina",
    "contrato_termino_fijo.docx": "fijo",
    contrato_termino_fijo: "fijo",
    "contrato_prestacion_de_servicios.docx": "prestacion",
    contrato_prestacion_de_servicios: "prestacion"
  };
  if (byFile[s]) return byFile[s];
  if (["oficina", "fijo", "prestacion"].includes(s)) return s;
  if (s.includes("termino_fijo") || s.includes("término_fijo")) return "fijo";
  if (s.includes("prestacion")) return "prestacion";
  if (s.includes("oficina") || s.includes("administrativo")) return "oficina";
  if (window.RecruitmentDomain?.inferTemplateKind) {
    return window.RecruitmentDomain.inferTemplateKind(
      String(contractType || "Termino indefinido"),
      String(workerRole || "empleado")
    );
  }
  return "oficina";
}

function prepareEmployeeForContractDocx(employee) {
  const e = ensureEmployeeContractFields(normalizePayrollEmployeeRowDates({ ...(employee || {}) }));
  const positionName = getPositionById(String(e.positionId || ""))?.name || String(e.position || "").trim();
  const wr = String(
    e.workerRole || (positionName.toLowerCase().includes("conductor") ? "conductor" : "empleado")
  );
  const contractType = String(e.contractType || "Termino indefinido").trim();
  let contractDuration = String(e.contractDuration || e.contractDurationText || "").trim();
  if (!contractDuration && isFixedTermContractType(contractType)) {
    contractDuration = "1 año";
  }
  return {
    ...e,
    position: positionName || e.position,
    workerRole: wr,
    city: String(e.city || "").trim(),
    bankName: matchCatalogOptionValue(CO_CATALOGS.banks, e.bankName),
    bankAccountType: matchCatalogOptionValue(CO_CATALOGS.accountTypes, e.bankAccountType || "Ahorros"),
    eps: matchCatalogOptionValue(CO_CATALOGS.eps, e.eps),
    pensionFund: matchCatalogOptionValue(CO_CATALOGS.pensionFunds, e.pensionFund),
    arl: matchCatalogOptionValue(CO_CATALOGS.arl, e.arl),
    contractTemplateKind: normalizeContractTemplateKind(e.contractTemplateKind, contractType, wr),
    contractDuration
  };
}

async function runEmployeeContractGeneration(employeeId) {
  const id = String(employeeId || "").trim();
  const empRaw = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === id);
  if (!empRaw) {
    notify(userMessage("genericError"), "error");
    return;
  }
  const emp = prepareEmployeeForContractDocx(empRaw);
  const miss = validateEmployeeContractDocFields(emp);
  if (miss.length) {
    notify(userMessage("contractEmployeeMissingFields", miss.join(", ")), "error");
    return;
  }
  try {
    await generateOfficialWordContract(
      buildEmployeeContractDocxPayload(emp, { contractTemplateKind: emp.contractTemplateKind })
    );
    notify(userMessage("employeeContractWordOk"), "success");
  } catch (err) {
    notify(String(err?.message || userMessage("genericError")), "error");
  }
}

function syncEmployeeEditCatalogSelects(formEl, employee) {
  if (!formEl || !employee) return;
  const pairs = [
    ["eps", CO_CATALOGS.eps],
    ["pensionFund", CO_CATALOGS.pensionFunds],
    ["arl", CO_CATALOGS.arl],
    ["severanceFund", CO_CATALOGS.severanceFunds],
    ["compensationFund", CO_CATALOGS.compensationFunds],
    ["bankName", CO_CATALOGS.banks],
    ["bankAccountType", CO_CATALOGS.accountTypes],
    ["contributorType", CO_CATALOGS.contributorTypes],
    ["licenseCategory", CO_CATALOGS.licenseCategories],
    ["bloodType", CO_CATALOGS.bloodTypes]
  ];
  for (const [name, catalog] of pairs) {
    const sel = formEl.querySelector(`select[name='${name}']`);
    if (!sel) continue;
    setFormSelectValue(sel, matchCatalogOptionValue(catalog, employee[name]));
  }
  const tplSel = formEl.querySelector("select[name='contractTemplateKind']");
  if (tplSel) {
    setFormSelectValue(
      tplSel,
      normalizeContractTemplateKind(employee.contractTemplateKind, employee.contractType, employee.workerRole)
    );
  }
}

function installEmployeeContractDelegation() {
  if (typeof document === "undefined" || !document.body) return;
  if (document.body.dataset.antaresEmpContractBound === "1") return;
  document.body.dataset.antaresEmpContractBound = "1";
  document.body.addEventListener("click", async (event) => {
    const btn =
      event.target instanceof Element
        ? event.target.closest("[data-action='employee-generate-contract']")
        : null;
    if (!btn) return;
    event.preventDefault();
    const id = String(btn.dataset.id || "").trim();
    if (!id || btn.disabled || btn.dataset.busy === "1") return;
    await runWithBusyButton(btn, () => runEmployeeContractGeneration(id), { busyText: "Generando…" });
  });
}

async function deleteEmployeesCascade(employeeIds = []) {
  const ids = [...new Set(employeeIds.map((id) => String(id || "").trim()).filter(Boolean))];
  if (!ids.length) return 0;
  const employees = read(KEYS.payrollEmployees, []);
  const targets = employees.filter((employee) => ids.includes(String(employee.id)));
  const targetDocDigitsSet = new Set(
    targets.map((employee) => normalizeDocumentDigits(employee.idDoc)).filter(Boolean)
  );

  const payrollRuns = read(KEYS.payrollRuns, []);
  const removedRunIds = payrollRuns
    .filter((run) => ids.includes(String(run.employeeId || "")))
    .map((run) => String(run.id || ""))
    .filter(Boolean);
  const nextPayrollRuns = payrollRuns.filter((run) => !ids.includes(String(run.employeeId || "")));

  const hrAbsences = read(KEYS.hrAbsences, []);
  const removedAbsenceIds = hrAbsences
    .filter((absence) => ids.includes(String(absence.employeeId || "")))
    .map((absence) => String(absence.id || ""))
    .filter(Boolean);
  const nextHrAbsences = hrAbsences.filter((absence) => !ids.includes(String(absence.employeeId || "")));

  const contracts = read(KEYS.contracts, []);
  const removedContractIds = contracts
    .filter((contract) => {
      const employeeId = String(contract.employeeId || "");
      const docDigits = normalizeDocumentDigits(contract.employeeIdDoc);
      return ids.includes(employeeId) || (docDigits && targetDocDigitsSet.has(docDigits));
    })
    .map((contract) => String(contract.id || ""))
    .filter(Boolean);
  const nextContracts = contracts.filter((contract) => {
    const employeeId = String(contract.employeeId || "");
    const docDigits = normalizeDocumentDigits(contract.employeeIdDoc);
    if (ids.includes(employeeId)) return false;
    if (docDigits && targetDocDigitsSet.has(docDigits)) return false;
    return true;
  });

  const nextEmployees = employees.filter((employee) => !ids.includes(String(employee.id)));
  const nextDrivers = read(KEYS.drivers, []).filter((driver) => {
    const docDigits = normalizeDocumentDigits(driver.idDoc);
    return !docDigits || !targetDocDigitsSet.has(docDigits);
  });

  const steps = [
    [KEYS.payrollEmployees, nextEmployees, ids],
    [KEYS.payrollRuns, nextPayrollRuns, removedRunIds],
    [KEYS.hrAbsences, nextHrAbsences, removedAbsenceIds],
    [KEYS.contracts, nextContracts, removedContractIds],
    [KEYS.drivers, nextDrivers, []]
  ];

  for (const [storageKey, nextList, deletedIds] of steps) {
    const ok = await writePortalListPrunedAwaitServer(storageKey, nextList, deletedIds, {
      notifyOnFailure: false
    });
    if (!ok) {
      const err = new Error("No se pudo sincronizar la eliminacion en cascada.");
      devWarn("deleteEmployeesCascade local sync", err);
      throw err;
    }
  }
  return targets.length;
}


function tripsForDriverMonth(driver, month) {
  const range = monthRange(month);
  if (!range || !driver) return [];
  return reqRead().filter((request) => {
    if (!request?.trip || ![STATUS.COMPLETADA, STATUS.CERRADA].includes(request.status)) return false;
    if (String(request.trip.driverId || "") !== String(driver.id || "")) return false;
    const refDate = request.closedAt || request.deliveredAt || request.trip.etaDelivery || request.trip.etaPickup || request.createdAt;
    return dateInRange(refDate, range);
  });
}

function calculateDriverTripReport(driverId, month) {
  const range = monthRange(month);
  if (!range || !driverId) {
    return { trips: [], tripCount: 0, interDepartmentTrips: 0, viaticTotal: 0, fuelTotal: 0, technicalTotal: 0, kmEstimated: 0 };
  }
  const driver = read(KEYS.drivers, []).find((d) => String(d.id) === String(driverId));
  if (!driver) {
    return { trips: [], tripCount: 0, interDepartmentTrips: 0, viaticTotal: 0, fuelTotal: 0, technicalTotal: 0, kmEstimated: 0 };
  }
  const trips = tripsForDriverMonth(driver, month);
  const rules = read(KEYS.travelAllowanceRules, { interDepartmentTripAmount: 85000 });
  const interDepartmentTrips = trips.filter((trip) => String(trip.originDepartment || "") !== String(trip.destinationDepartment || "")).length;
  const viaticTotal = interDepartmentTrips * parseNum(rules.interDepartmentTripAmount);
  const fuelLogs = readFuelLogs().filter((log) => String(log.driverId || "") === String(driver.id) && dateInRange(log.date, range));
  const fuelTotal = fuelLogs.reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  const technicalTotal = readVehicleTechnicalLogs()
    .filter((log) => dateInRange(log.date, range) && trips.some((t) => String(t.trip?.vehicleId || "") === String(log.vehicleId || "")))
    .reduce((acc, log) => acc + parseNum(log.cost), 0);
  const kmEstimated = trips.reduce((acc, trip) => acc + Math.max(0, parseNum(trip.distanceKm || 0)), 0);
  return { trips, tripCount: trips.length, interDepartmentTrips, viaticTotal, fuelTotal, technicalTotal, kmEstimated };
}

function portalCandidateAgeFromBirthIso(birthIso) {
  const s = String(birthIso ?? "")
    .trim()
    .slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { age: null, birthLabel: "—" };
  const [y, mo, d] = s.split("-").map((x) => Number(x));
  const birth = new Date(y, mo - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== mo - 1 || birth.getDate() !== d) {
    return { age: null, birthLabel: s };
  }
  const today = new Date();
  let age = today.getFullYear() - y;
  const md = today.getMonth() - (mo - 1);
  if (md < 0 || (md === 0 && today.getDate() < d)) age -= 1;
  return { age, birthLabel: s };
}

function safeHttpsUrlForCandidateCv(u) {
  const s = String(u || "").trim();
  return /^https?:\/\/.+/i.test(s) ? s : "";
}

function safeMimeForCvBlobStored(m) {
  const base = String(m || "application/octet-stream")
    .split(";")[0]
    ?.trim()
    .toLowerCase();
  if (/^[\w/+.-]+$/.test(base) && base.length < 96) return base;
  return "application/octet-stream";
}

function flattenCandidateAttachmentsForCv(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw != null && typeof raw === "object" && typeof raw !== "bigint") return [raw];
  if (typeof raw === "string" && raw.trim()) {
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p;
      if (p != null && typeof p === "object" && typeof p !== "bigint") return [p];
    } catch (_e) {}
  }
  return [];
}

/** Hay CV persistido (inline, R2 con key o URL) aunque el enlace no este aun en caché local. */
function candidateMayHaveCvInStorage(candidateLike) {
  const attachments = flattenCandidateAttachmentsForCv(candidateLike?.attachments);
  for (const item of attachments) {
    if (item == null || typeof item !== "object") continue;
    const k = String(item.kind || "");
    if (k === "cv_blob" && item.data && item.mime) return true;
    if (k === "cv_file" && (String(item.storageKey || "").trim() || safeHttpsUrlForCandidateCv(item.url))) {
      return true;
    }
  }
  return false;
}

/** Primera fuente descargable: cv_blob inline, si no cv_file con URL http(s) incl. prefirmadas. */
function extractCandidateCvDownload(candidateLike) {
  const attachments = flattenCandidateAttachmentsForCv(candidateLike?.attachments);
  for (const item of attachments) {
    if (item == null || typeof item !== "object") continue;
    const k = String(item.kind || "");
    if (k === "cv_blob" && item.data && item.mime) {
      const mime = safeMimeForCvBlobStored(item.mime);
      const href = `data:${mime};base64,${String(item.data)}`;
      const fileName = String(item.name || "hoja-de-vida").trim() || "hoja-de-vida";
      return { href, fileName };
    }
    if (k === "cv_file") {
      const url = safeHttpsUrlForCandidateCv(item.url);
      if (url) {
        const fileName = String(item.name || "Hoja-de-vida").trim() || "Hoja-de-vida";
        return { href: url, fileName };
      }
    }
  }
  return null;
}

/** GET /portal/candidates/:id/cv-download — URL R2 prefirmada/pública o base64 inline. */
async function fetchCandidateCvDownloadFromApi(candidateId) {
  const id = String(candidateId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return null;
  const api = window.AntaresApi;
  if (!api?.getJson) return null;
  try {
    const data = await api.getJson(`/portal/candidates/${encodeURIComponent(id)}/cv-download`);
    if (!data || typeof data !== "object") return null;
    if (data.url && /^https?:\/\//i.test(String(data.url))) {
      return {
        href: String(data.url),
        fileName: String(data.fileName || "hoja-de-vida").trim() || "hoja-de-vida"
      };
    }
    if (data.data && data.mime) {
      const mime = safeMimeForCvBlobStored(data.mime);
      return {
        href: `data:${mime};base64,${String(data.data)}`,
        fileName: String(data.fileName || "hoja-de-vida").trim() || "hoja-de-vida"
      };
    }
    return null;
  } catch (_e) {
    return null;
  }
}

async function resolveCandidateCvDownload(candidateLike) {
  const local = extractCandidateCvDownload(candidateLike);
  if (local?.href) return local;
  const id = String(candidateLike?.id || "").trim();
  if (!id || !candidateMayHaveCvInStorage(candidateLike)) return null;
  return fetchCandidateCvDownloadFromApi(id);
}

function candidateCvDataUrlToBlob(href) {
  const m = /^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,(.*)$/i.exec(String(href || ""));
  if (!m) return null;
  const mime = (m[1] || "application/octet-stream").trim();
  const payload = m[3] || "";
  if (m[2]) {
    const bin = atob(payload);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  return new Blob([decodeURIComponent(payload)], { type: mime });
}

function triggerBlobDownload(blob, fileNameFallback) {
  const name = String(fileNameFallback || "cv").replace(/[\\/]/g, "_");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** GET /portal/candidates/:id/cv-file — binario con Content-Disposition: attachment. */
async function fetchCandidateCvBlobFromApi(candidateId) {
  const id = String(candidateId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return null;
  const api = window.AntaresApi;
  if (!api?.getBase || !api?.getAccessToken) return null;
  const base = api.getBase();
  const auth = api.getAccessToken();
  if (!base || !auth) return null;
  const url = `${base}/api/portal/candidates/${encodeURIComponent(id)}/cv-file`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${auth}` }
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob || !blob.size) return null;
    const cd = res.headers.get("Content-Disposition") || "";
    const fnMatch = /filename\*?=(?:UTF-8''|utf-8'')?["']?([^"';]+)["']?/i.exec(cd);
    const fileName = fnMatch
      ? decodeURIComponent(fnMatch[1].trim())
      : String("hoja-de-vida").trim();
    return { blob, fileName };
  } catch (_e) {
    return null;
  }
}

async function triggerCandidateCvDownload(href, fileNameFallback, candidateId) {
  const name = String(fileNameFallback || "cv").replace(/[\\/]/g, "_");
  const id = String(candidateId || "").trim();
  if (id) {
    const fromApi = await fetchCandidateCvBlobFromApi(id);
    if (fromApi?.blob) {
      triggerBlobDownload(fromApi.blob, fromApi.fileName || name);
      return;
    }
  }
  try {
    let blob = null;
    if (String(href || "").startsWith("data:")) {
      blob = candidateCvDataUrlToBlob(href);
    } else if (/^https?:\/\//i.test(String(href || ""))) {
      const res = await fetch(href, { mode: "cors", credentials: "omit" });
      if (!res.ok) throw new Error("fetch failed");
      blob = await res.blob();
    }
    if (blob && blob.size) {
      triggerBlobDownload(blob, name);
      return;
    }
  } catch (_e) {
    /* continuar al respaldo */
  }
  if (href) {
    window.open(href, "_blank", "noopener,noreferrer");
  }
}

function installCandidateCvDownloadDelegation() {
  if (typeof document === "undefined" || !document.body) return;
  if (document.body.dataset.antaresCvDlBound === "1") return;
  document.body.dataset.antaresCvDlBound = "1";
  document.body.addEventListener("click", async (event) => {
    const btn = event.target instanceof Element ? event.target.closest("[data-action='download-candidate-cv']") : null;
    if (!btn) return;
    if (
      btn.hasAttribute("disabled") ||
      btn.getAttribute("aria-disabled") === "true" ||
      btn.getAttribute("aria-busy") === "true"
    )
      return;
    const id = String(btn.dataset.id || "").trim();
    if (!id) return;
    event.preventDefault();
    const cand = read(KEYS.candidates, []).find((x) => String(x.id) === id);
    if (!cand) {
      notify(userMessage("genericError"), "error");
      return;
    }
    btn.setAttribute("aria-busy", "true");
    btn.disabled = true;
    try {
      const dl = await resolveCandidateCvDownload(cand);
      if (!dl?.href) {
        notify("No hay CV descargable para este candidato.", "info");
        return;
      }
      await triggerCandidateCvDownload(dl.href, dl.fileName, id);
    } finally {
      btn.removeAttribute("aria-busy");
      btn.disabled = false;
    }
  });
}

function renderHiringCandidateCard(c, ctx) {
  const ageInfo = portalCandidateAgeFromBirthIso(c.birthDate);
  const expCargo = parseNum(c.experienceYears || 0);
  const canDlCv = Boolean(ctx.canDlCv);
  const statusClass = hiringPipelineStatusClass(c.status);
  const employeeMatch = findPayrollEmployeeByIdDoc(c.idDoc);
  return `<article class="hiring-candidate-card">
    <header class="hiring-candidate-card__head">
      <div>
        <h4>${escapeHtml(String(c.name || ""))}</h4>
        <p class="muted">${escapeHtml(String(c.vacancyTitle || "-"))}</p>
      </div>
      <span class="status ${statusClass}">${escapeHtml(String(c.status || ""))}</span>
    </header>
    <dl class="hiring-candidate-card__meta">
      <div><dt>Contacto</dt><dd>${escapeHtml(String(c.email || "-"))}<br><span class="muted">${escapeHtml(String(c.phone || "-"))}</span></dd></div>
      <div><dt>Experiencia</dt><dd>${expCargo} años · Edad ${ageInfo.age != null ? `${ageInfo.age} años` : "—"}</dd></div>
      <div><dt>Etapa</dt><dd><select class="hiring-status-select" data-action="candidate-status" data-id="${escapeAttr(String(c.id))}">${hiringPipelineSelectOptions(c.status)}</select></dd></div>
    </dl>
    <div class="toolbar hiring-candidate-card__actions">
      <button class="btn btn-sm btn-outline" data-action="view-candidate" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
      ${
        ctx.canScheduleInterview
          ? `<button type="button" class="btn btn-sm btn-action" data-action="schedule-interview-for-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.calendar} Entrevista</button>`
          : ""
      }
      <button type="button" class="btn btn-sm btn-action"${canDlCv ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}">${IC.download} CV</button>
      ${
        ctx.canEdit
          ? `<button class="btn btn-sm btn-action" data-action="create-employee-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}" title="Abrir alta de empleado con datos precargados">${IC.userPlus} Empleado</button>`
          : ""
      }
      ${
        ctx.canEdit && employeeMatch
          ? `<button class="btn btn-sm btn-action" data-action="generate-contract-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}" title="Generar contrato Word">${IC.file} Contrato</button>`
          : ""
      }
      ${ctx.canEdit ? `<button class="btn btn-sm btn-action" data-action="edit-candidate" data-id="${escapeAttr(String(c.id))}">${IC.edit} Editar</button>` : ""}
      ${ctx.canDelete ? `<button class="btn btn-sm btn-reject" data-action="delete-candidate" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash}</button>` : ""}
    </div>
  </article>`;
}



const PortalArch = window.PortalArchitecture || {
  isKnownView: (view) => Boolean(window.VIEW_PERMISSIONS?.[String(view || "")]),
  shouldUseShell: () => true,
  getTitle: (view) => String(view || "Dashboard"),
  getLayoutPlan: () => null,
  isAllowedByRole: () => true,
  resolveContent: ({ accessDeniedFactory }) => accessDeniedFactory()
};

const PortalAccessCore = window.PortalCoreAccess || {
  isViewAllowed: ({ user, view, canAccessView, portalArch, ROLES, canAccessRRHH }) =>
    Boolean(user) && canAccessView(user, view) && portalArch.isAllowedByRole(user, view, { ROLES, canAccessRRHH })
};

const PortalRouterCore = window.PortalCoreRouter || {
  getViewFromHash: ({ hash, isKnownView }) => {
    const raw = String(hash || "");
    if (!raw.startsWith("#portal/")) return "";
    const view = raw.slice("#portal/".length).trim();
    return isKnownView(view) ? view : "";
  },
  syncHash: ({ view, isKnownView, fallbackView = "dashboard" }) => {
    const safeView = isKnownView(view) ? view : fallbackView;
    const nextHash = `#portal/${safeView}`;
    if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
  },
  enforceViewFromUrl: ({ state, user, getViewFromHashFn, syncHashFn, isViewAllowed, fallbackView = "dashboard", onUnauthorized }) => {
    if (!state?.session || !user) return;
    const candidate = getViewFromHashFn();
    if (!candidate) {
      syncHashFn(state.currentView || fallbackView);
      return;
    }
    if (!isViewAllowed(user, candidate)) {
      state.currentView = fallbackView;
      syncHashFn(fallbackView);
      if (typeof onUnauthorized === "function") onUnauthorized(candidate);
      return;
    }
    state.currentView = candidate;
  },
  activateSideLinks: (sideLinks, view) =>
    (sideLinks || []).forEach((link) => link.classList.toggle("active", link.dataset.view === view))
};

const PortalRendererCore = window.PortalCoreRenderer || {
  resolveViewContent: ({ user, view, isViewAllowed, resolveContent, accessDeniedFactory }) =>
    !isViewAllowed(user, view) ? accessDeniedFactory() : resolveContent(user, view),
  safeResolve: ({ view, resolver, onError, fallbackFactory }) => {
    try {
      return resolver();
    } catch (error) {
      if (typeof onError === "function") onError({ view, error });
      return fallbackFactory();
    }
  },
  applyManualLayout: ({ viewRoot, plan }) => {
    if (!viewRoot || !plan) return;
    plan.forEach(({ container, order }) => {
      const nodesToOrder = [...viewRoot.querySelectorAll(container)];
      nodesToOrder.forEach((containerNode) => {
        const children = [...containerNode.children];
        if (children.length < 2 || !Array.isArray(order) || !order.length) return;
        const ordered = [];
        const used = new Set();
        order.forEach((selector) => {
          children.forEach((child) => {
            if (used.has(child) || !child.matches(selector)) return;
            ordered.push(child);
            used.add(child);
          });
        });
        children.forEach((child) => {
          if (used.has(child)) return;
          ordered.push(child);
        });
        const changed = ordered.some((child, idx) => child !== children[idx]);
        if (changed) ordered.forEach((child) => containerNode.appendChild(child));
      });
    });
  }
};

function applyManualModuleLayout() {
  if (!nodes.viewRoot || state.currentView === "profile") return;
  const view = String(state.currentView || "");
  const plan = PortalArch.getLayoutPlan(view);
  if (!plan) return;
  PortalRendererCore.applyManualLayout({ viewRoot: nodes.viewRoot, plan });
}


function describeContractDurationForDocx(data) {
  const ct = String(data.contractType || "");
  const start = String(data.startDate || "").trim();
  const end = String(data.endDate || data.contractEndDate || "").trim();
  if (ct === "Termino fijo" && start && end) return `Término fijo: ${start} a ${end}`;
  if (ct === "Termino fijo") return "Término fijo (plazo contractual en cláusulas)";
  if (ct === "Prestacion de servicios") return "Prestación de servicios";
  return start ? `Vigencia desde ${start} · ${ct || "según anexo"}` : String(ct || "Según cláusulas y normativa aplicable");
}

/** Descompone texto guardado (p. ej. "12 meses", "1 año") para el formulario de edición. */
function parseContractDurationFields(text) {
  const t = String(text || "").trim();
  if (!t) return { unit: "", amount: "", other: "" };
  const lower = t.toLowerCase();
  if (/^ind/i.test(lower) || /indefinid/i.test(lower)) return { unit: "otro", amount: "", other: t };
  const mMes = t.match(/^(\d+)\s*mes(es)?\s*$/i);
  if (mMes) {
    const n = parseInt(mMes[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "meses", amount: String(n), other: "" };
  }
  const mAn = t.match(/^(\d+)\s*(años|anos|año|ano)\s*$/i);
  if (mAn) {
    const n = parseInt(mAn[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "anios", amount: String(n), other: "" };
  }
  return { unit: "otro", amount: "", other: t };
}

/** Arma el texto único `contractDuration` a partir de unidad + cantidad u “otro” (texto libre). */
function composeContractDurationText(raw) {
  const unit = String(raw.contractDurationUnit || "").trim().toLowerCase();
  const parsedAmt = parseInt(String(raw.contractDurationAmount ?? "").trim(), 10);
  const amount = Number.isFinite(parsedAmt) ? Math.floor(parsedAmt) : NaN;
  const other = String(raw.contractDurationOther || "").trim();
  const legacy = String(raw.contractDuration || "").trim();
  if (unit === "otro") return other;
  if (unit === "meses" && Number.isFinite(amount) && amount >= 1) {
    return `${amount} ${amount === 1 ? "mes" : "meses"}`;
  }
  if (unit === "anios" && Number.isFinite(amount) && amount >= 1) {
    return `${amount} ${amount === 1 ? "año" : "años"}`;
  }
  return legacy;
}

/**
 * Resuelve URL de imagen (avatar, logo, etc.): intenta presign + PUT directo a R2;
 * si no hay URL pública HTTPS, reintenta con `POST /uploads/image` (subida vía API,
 * evita CORS del bucket). Si no hay API o todo falla, usa `data:` URL (FileReader).
 *
 * Devuelve la URL final (`https://...` o `data:image/...`) o cadena vacía si
 * no hay archivo.
 */
async function resolveEmployeeAvatarUrl(file, fallbackDataUrl = "") {
  if (!file) return String(fallbackDataUrl || "").trim();
  const api = window.AntaresApi;
  const rawMime = String(file.type || "image/jpeg").split(";")[0].trim().toLowerCase();
  const contentType =
    !rawMime || rawMime === "image/jpg" || rawMime === "image/pjpeg" ? "image/jpeg" : rawMime;
  const canUseBackend =
    api &&
    typeof api.postJson === "function" &&
    typeof api.getBase === "function" &&
    api.getBase() &&
    typeof api.getAccessToken === "function" &&
    api.getAccessToken();

  if (canUseBackend) {
    let publicFromPresign = "";
    try {
      const presign = await api.postJson("/uploads/avatar/presign", {
        fileName: String(file.name || "avatar.jpg"),
        contentType
      });
      const uploadUrl = String(presign?.uploadUrl || "").trim();
      publicFromPresign = String(presign?.publicUrl || "").trim();
      if (uploadUrl) {
        const resp = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file
        });
        if (!resp.ok) throw new Error(`R2 PUT respondió ${resp.status}`);
      }
    } catch (err) {
      devWarn?.("avatar-upload-r2-presign-failed", err);
      publicFromPresign = "";
    }
    if (/^https?:\/\//i.test(publicFromPresign)) return publicFromPresign;

    try {
      if (typeof api.postFormData === "function") {
        const fd = new FormData();
        fd.append("file", file, file.name || "upload.jpg");
        const viaServer = await api.postFormData("/uploads/image", fd);
        const u = String(viaServer?.publicUrl || "").trim();
        if (/^https?:\/\//i.test(u)) return u;
      }
    } catch (err) {
      devWarn?.("avatar-upload-api-failed", err);
    }
  }

  return new Promise((resolve) => {
    const r = new FileReader();
    r.onerror = () => resolve(String(fallbackDataUrl || "").trim());
    r.onload = () => resolve(String(r.result || "").trim());
    r.readAsDataURL(file);
  });
}

/** Vista previa local en el óvalo (misma lógica que perfil de usuario). */
function bindEmployeeAvatarFilePreview(fileInput, labelEl) {
  if (!fileInput || !labelEl) return;
  let previewBlobUrl = "";
  fileInput.addEventListener("change", () => {
    const f = fileInput.files?.[0];
    if (!f || !String(f.type || "").startsWith("image/")) return;
    if (previewBlobUrl && previewBlobUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(previewBlobUrl);
      } catch (_e) {}
      previewBlobUrl = "";
    }
    try {
      previewBlobUrl = URL.createObjectURL(f);
    } catch (_e) {
      previewBlobUrl = "";
    }
    const cssSafe = previewBlobUrl ? previewBlobUrl.replace(/'/g, "\\'") : "";
    labelEl.style.backgroundImage = cssSafe ? `url('${cssSafe}')` : "";
    labelEl.classList.toggle("has-image", Boolean(cssSafe));
    const initial = labelEl.querySelector(".profile-avatar-initial");
    if (initial) initial.textContent = "";
  });
}

/** Alta empleado (wizard): objeto listo para guardar Word o persistir (sin id). */
function buildPayrollEmployeePayloadFromWizard(raw, docNormalized, avatarOpts = {}) {
  const stripLargeAvatar = Boolean(avatarOpts.stripLargeAvatar);
  let merged = String(avatarOpts.avatarUrl ?? raw.avatarUrl ?? "").trim();
  if (stripLargeAvatar && merged.startsWith("data:")) merged = "";
  const avatarUrl = merged;
  const position = getPositionById(String(raw.positionId || ""));
  if (!position || position.active === false) {
    return { ok: false, msg: userMessage("recruitSelectActivePosition") };
  }
  const salaryCheck = validateColombiaMonthlySalaryCop(raw.baseSalary, "Salario base");
  if (!salaryCheck.ok) {
    return { ok: false, msg: salaryCheck.message };
  }
  const baseSalary = salaryCheck.amount;
  const ageCheck = validateWorkerMinimumAge(raw.birthDate, "trabajador");
  if (!ageCheck.ok) {
    return { ok: false, msg: ageCheck.message };
  }
  const posIntegral = position.integralSalary === true || String(position.integralSalary) === "true";
  const integralCheck = validateColombiaIntegralSalary(baseSalary, posIntegral);
  if (!integralCheck.ok) {
    return { ok: false, msg: integralCheck.message };
  }
  const effectiveContractType = String(
    raw.contractType || position.contractTypeDefault || "Termino indefinido"
  ).trim();
  const needsDurationPlazo = contractTypeRequiresDurationPlazo(effectiveContractType);
  let composedDur = needsDurationPlazo ? composeContractDurationText(raw) : "";
  if (isFixedTermContractType(effectiveContractType) && !String(composedDur || "").trim()) {
    composedDur = "1 año";
  }
  const startDateYmd = normalizePortalDateYmd(raw.startDate);
  const contractVigenteStartDateYmd = normalizePortalDateYmd(raw.contractVigenteStartDate);
  const plazoStartYmd = isFixedTermContractType(effectiveContractType)
    ? contractVigenteStartDateYmd || startDateYmd
    : "";
  const contractEndDate = resolveEmployeeContractEndDateYmd(
    effectiveContractType,
    plazoStartYmd,
    raw
  );
  if (needsDurationPlazo && !String(composedDur || "").trim()) {
    const unitDur = String(raw.contractDurationUnit || "").trim().toLowerCase();
    const msg =
      unitDur === "otro"
        ? "Describa la duración en el campo de texto libre o elija meses/años."
        : unitDur === "meses" || unitDur === "anios"
          ? "Indique la cantidad (número) de meses o de años."
          : "Complete la duración del contrato: unidad (meses o años) o texto en “Otro”.";
    return { ok: false, msg };
  }
  const sanitized = sanitizePayrollEmployeeFieldsForPersist({
    ...raw,
    position: position.name,
    workerRole: position.workerRole || "empleado",
    contractType: effectiveContractType,
    arlRiskLevel: raw.arlRiskLevel || position.arlRiskLevel || "",
    workSchedule: raw.workSchedule || position.workSchedule || position.schedule || "",
    contractTemplateKind:
      raw.contractTemplateKind ||
      (window.RecruitmentDomain?.inferTemplateKind
        ? window.RecruitmentDomain.inferTemplateKind(
            effectiveContractType,
            position.workerRole || "empleado"
          )
        : "oficina")
  });
  return {
    ok: true,
    payload: {
      ...sanitized,
      idDoc: docNormalized,
      birthDate: normalizePortalDateYmd(raw.birthDate),
      hasIllness: String(raw.hasIllness || "no").toLowerCase() === "si" ? "si" : "no",
      positionId: position.id,
      companyId: raw.companyId,
      baseSalary,
      transportAllowance: resolveEmployeeTransportAllowanceCop(
        raw.transportAllowance != null && String(raw.transportAllowance).trim() !== ""
          ? raw.transportAllowance
          : position.transportAllowance,
        baseSalary
      ),
      contractDuration: composedDur,
      contractEndDate,
      startDate: startDateYmd,
      contractVigenteStartDate: isFixedTermContractType(effectiveContractType)
        ? contractVigenteStartDateYmd || startDateYmd
        : "",
      license: String(raw.license || "").trim(),
      licenseExpiry: normalizePortalDateYmd(raw.licenseExpiry),
      occupationalExamDate: normalizePortalDateYmd(raw.occupationalExamDate),
      occupationalExamExpiry: addOneYearToYmd(raw.occupationalExamDate),
      instruvialExamDate: normalizePortalDateYmd(raw.instruvialExamDate),
      instruvialExamExpiry: addOneYearToYmd(raw.instruvialExamDate),
      defensiveCourse: String(raw.defensiveCourse || "").trim().toLowerCase(),
      avatarUrl
    }
  };
}

function validateEmployeeContractDocFields(emp) {
  const miss = [];
  if (!String(emp.name || "").trim()) miss.push("nombre completo");
  if (!String(emp.idDoc || "").trim()) miss.push("numero de documento");
  if (!String(emp.city || "").trim()) miss.push("ciudad de residencia");
  if (!String(emp.bankName || "").trim()) miss.push("banco");
  if (!String(emp.bankAccount || "").trim()) miss.push("numero de cuenta");
  if (!validateColombiaMonthlySalaryCop(emp.baseSalary).ok) miss.push("salario base (minimo legal)");
  const pos = getPositionById(String(emp.positionId || ""));
  const integralFlag = pos?.integralSalary === true || String(pos?.integralSalary) === "true";
  if (integralFlag && !validateColombiaIntegralSalary(emp.baseSalary, true).ok) {
    miss.push("salario integral (minimo 13 SMMLV)");
  }
  if (contractTypeRequiresDurationPlazo(emp.contractType) && !String(emp.contractDuration || "").trim()) {
    miss.push("duracion del contrato");
  }
  if (!String(emp.contractType || "").trim()) miss.push("tipo de contrato");
  if (!String(emp.startDate || "").trim()) miss.push("fecha de ingreso");
  if (isFixedTermContractType(emp.contractType) && !resolveEmployeeContractPlazoStartYmd(emp)) {
    miss.push("fecha inicio contrato vigente");
  }
  if (!String(emp.eps || "").trim()) miss.push("EPS");
  if (!String(emp.pensionFund || "").trim()) miss.push("fondo de pension");
  if (!String(emp.arl || "").trim()) miss.push("ARL");
  if (!String(emp.position || "").trim() && !pos?.name) miss.push("cargo");
  if (!String(emp.companyId || "").trim()) miss.push("empresa");
  return miss;
}

function employeeAvatarCssUrl(av) {
  const u = String(av || "").trim();
  if (/^https?:\/\//i.test(u) || /^data:image\//i.test(u)) return u.replace(/'/g, "\\'");
  return "";
}

function fmtProfileCell(value) {
  const s = value == null || String(value).trim() === "" ? "—" : String(value);
  return escapeHtml(s);
}

/** Creado / actualizado: ISO con hora en zona Colombia, no UTC crudo del servidor. */
function fmtProfileAuditTimestamp(value) {
  if (value == null || String(value).trim() === "") return "—";
  const raw = String(value).trim();
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime()) && /T|\d{2}:\d{2}/.test(raw)) {
    return fmtDate(d);
  }
  return raw;
}

function employeeProfileKvRow(label, value) {
  return `<div class="employee-profile-kv"><span>${escapeHtml(label)}</span><strong>${fmtProfileCell(value)}</strong></div>`;
}

function buildEmployeePayrollProfileBodyHtml(emp) {
  if (!emp) return `<p class="muted">Sin datos.</p>`;
  const e = normalizePayrollEmployeeRowDates(emp);
  const contractRenewal = computeEmployeeContractRenewalMeta(e);
  const css = employeeAvatarCssUrl(e.avatarUrl);
  const initial = escapeHtml(String(e.name || "E").charAt(0).toUpperCase());
  const heroBanner = css
    ? `<div class="employee-profile-hero-photo" style="background-image:url('${css}')" role="img" aria-label="Foto del colaborador"></div>`
    : `<div class="employee-profile-hero-photo employee-profile-hero-photo--letter" aria-hidden="true"><span>${initial}</span></div>`;
  const heroAvatar = css
    ? `<div class="employee-profile-hero-avatar" role="img" aria-label="Foto del colaborador"><img src="${escapeAttr(e.avatarUrl)}" alt="Foto de ${escapeAttr(String(e.name || "Empleado"))}" loading="lazy" /></div>`
    : `<div class="employee-profile-hero-avatar employee-profile-hero-avatar--letter" aria-hidden="true"><span>${initial}</span></div>`;
  const hero = `${heroBanner}<div class="employee-profile-hero-photo-wrap">${heroAvatar}<p class="employee-profile-hero-photo-caption muted">${css ? "Foto del colaborador" : "Sin foto cargada — recomendamos subirla al editar el empleado."}</p></div>`;
  const docs = `${String(e.documentType || "").trim()} ${String(e.idDoc || "").trim()}`.trim();
  const companyName = getCompanyById(e.companyId)?.name || "—";
  const isDriver = String(e.workerRole || "").toLowerCase() === "conductor";
  const driverBlock = isDriver
    ? `
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Conductor</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("N° licencia", e.license)}
      ${employeeProfileKvRow("Categoría licencia", e.licenseCategory)}
      ${employeeProfileKvRow("Vence licencia", e.licenseExpiry)}
      ${employeeProfileKvRow("Examen ocupacional", e.occupationalExamDate)}
      ${employeeProfileKvRow("Vence examen ocupacional", e.occupationalExamExpiry)}
      ${employeeProfileKvRow("Examen instruvial", e.instruvialExamDate)}
      ${employeeProfileKvRow("Vence examen instruvial", e.instruvialExamExpiry)}
      ${employeeProfileKvRow("Curso conducción defensiva", e.defensiveCourse)}
    </div></section>`
    : "";
  return `
  <article class="employee-profile-card">${hero}<div class="employee-profile-intro">
      <h3 class="employee-profile-name">${escapeHtml(String(e.name || "").trim())}</h3>
      <p class="employee-profile-intro-meta muted">${escapeHtml(String(e.position || "").trim())} · ${escapeHtml(String(e.contractType || "").trim())}${isDriver ? ` · ${escapeHtml("Conductor")}` : ""}</p>
      <span class="employee-profile-chip">${fmtProfileCell(`${parseNum(e.baseSalary).toLocaleString("es-CO")} COP · salario base`)}</span>
    </div>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Identidad</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Documento", docs)}
      ${employeeProfileKvRow("Fecha de nacimiento", e.birthDate)}
      ${employeeProfileKvRow("Género", e.gender)}
      ${employeeProfileKvRow("Estado civil", e.maritalStatus)}
      ${employeeProfileKvRow("Nivel educativo", e.educationLevel)}
      ${employeeProfileKvRow("Tipo sangre RH", e.bloodType)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Contacto</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Departamento", e.department)}
      ${employeeProfileKvRow("Ciudad", e.city)}
      ${employeeProfileKvRow("Dirección", e.address)}
      ${employeeProfileKvRow("Teléfono celular", e.phone)}
      ${employeeProfileKvRow("Correo personal", e.personalEmail)}
      ${employeeProfileKvRow("Contacto emergencia", e.emergencyContact)}
      ${employeeProfileKvRow("Tel. emergencia", e.emergencyPhone)}
      ${employeeProfileKvRow("Parentesco emergencia", e.emergencyRelation)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Salud</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow(
        "¿Condición médica?",
        String(e.hasIllness || "").toLowerCase() === "si" ? "Sí" : "No"
      )}
      ${
        String(e.hasIllness || "").toLowerCase() === "si"
          ? employeeProfileKvRow("Detalle médico", e.illnessDescription || "Sin detalle")
          : ""
      }
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Laboral</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Empresa", companyName)}
      ${employeeProfileKvRow("Centro costos", resolvePayrollEmployeeCostCenter(e))}
      ${employeeProfileKvRow("Fecha ingreso", e.startDate)}
      ${
        isFixedTermContractType(e.contractType)
          ? employeeProfileKvRow(
              "Inicio contrato vigente",
              e.contractVigenteStartDate || e.startDate || "—"
            )
          : ""
      }
      ${employeeProfileKvRow("Fecha fin contrato", e.contractEndDate)}
      ${
        contractRenewal.applies
          ? employeeProfileKvRow("Aviso no renovación (máx.)", fmtDateOr(contractRenewal.noticeDeadlineYmd, "—"))
          : ""
      }
      ${employeeProfileKvRow("Duración contrato", e.contractDuration || e.contractDurationText)}
      ${employeeProfileKvRow("Periodicidad", e.payFrequency)}
      ${employeeProfileKvRow("Creado", fmtProfileAuditTimestamp(e.createdAt))}
      ${employeeProfileKvRow("Última actualización", fmtProfileAuditTimestamp(e.updatedAt))}
      ${employeeProfileKvRow("Aux. transporte (COP)", readEmployeeTransportAllowanceCop(e).toLocaleString("es-CO"))}
      ${employeeProfileKvRow("Tipo cotizante", e.contributorType)}
      ${employeeProfileKvRow("ARL nivel riesgo", e.arlRiskLevel)}
      ${employeeProfileKvRow("Plantilla contrato Word", e.contractTemplateKind)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Seguridad social</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("EPS", e.eps)}
      ${employeeProfileKvRow("Fondo pensión", e.pensionFund)}
      ${employeeProfileKvRow("ARL", e.arl)}
      ${employeeProfileKvRow("Cesantías", e.severanceFund)}
      ${employeeProfileKvRow("Caja compensación", e.compensationFund)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Pagos</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Banco", e.bankName)}
      ${employeeProfileKvRow("Tipo cuenta", e.bankAccountType)}
      ${employeeProfileKvRow("N° cuenta", e.bankAccount)}
    </div></section>
    ${driverBlock}</article>`;
}

function buildPayrollEmployeeEditModalFields(emp) {
  const e = normalizePayrollEmployeeRowDates(emp || {});
  const empId = escapeAttr(String(e.id || ""));
  const deps = `<option value="">${escapeHtml("Seleccione...")}</option>${departmentOptions(e.department || "")}`;
  const docSel = CO_CATALOGS.documentTypes.map((d) => {
    const lab =
      d === "CC"
        ? "Cédula de ciudadanía"
        : d === "CE"
          ? "Cédula de extranjería"
          : d === "PAS"
            ? "Pasaporte"
            : d === "PEP"
              ? "Permiso especial (PEP)"
              : "Tarjeta de identidad";
    return `<option value="${escapeAttr(d)}" ${String(e.documentType || "") === d ? "selected" : ""}>${escapeHtml(lab)}</option>`;
  }).join("");
  const genderSel = CO_CATALOGS.genders.map(
    (g) => `<option value="${escapeAttr(g)}" ${String(e.gender || "") === g ? "selected" : ""}>${escapeHtml(g)}</option>`
  ).join("");
  const maritalSel = CO_CATALOGS.maritalStatus.map(
    (g) =>
      `<option value="${escapeAttr(g)}" ${String(e.maritalStatus || "").trim() === g ? "selected" : ""}>${escapeHtml(g)}</option>`
  ).join("");
  const eduSel = CO_CATALOGS.educationLevel.map(
    (g) =>
      `<option value="${escapeAttr(g)}" ${String(e.educationLevel || "").trim() === g ? "selected" : ""}>${escapeHtml(g)}</option>`
  ).join("");
  const contractSel = CO_CATALOGS.contractTypes.map(
    (c) =>
      `<option value="${escapeAttr(c)}" ${String(e.contractType || "").trim() === c ? "selected" : ""}>${escapeHtml(c)}</option>`
  ).join("");
  const tmplSel = renderContractTemplateSelectOptions(String(e.contractTemplateKind || "").trim().toLowerCase(), false);
  const payFreqSel = selectOptionsFromCatalog(CO_CATALOGS.payFrequency, e.payFrequency || "Mensual", "Seleccione...");
  const companyOptsInner = [`<option value="">${escapeHtml("Seleccione")}</option>`]
    .concat(
      read(KEYS.companies, [])
        .filter((c) => isCompanyRecordActive(c))
        .map(
          (c) =>
            `<option value="${escapeAttr(c.id)}" ${String(e.companyId || "") === String(c.id || "") ? "selected" : ""}>${escapeHtml(String(c.name || ""))}</option>`
        )
    )
    .join("");
  const posOptsInner = [`<option value="">${escapeHtml("Seleccione")}</option>`]
    .concat(
      getActivePositions().map(
        (p) =>
          `<option value="${escapeAttr(p.id)}" ${String(e.positionId || "") === String(p.id || "") ? "selected" : ""}>${escapeHtml(`${p.name} · $${parseNum(p.baseSalary).toLocaleString("es-CO")}`)}</option>`
      )
    )
    .join("");
  const tplKind = escapeAttr(String(e.contractTemplateKind || "oficina").toLowerCase());
  const defCourse = escapeAttr(String(e.defensiveCourse || ""));
  const existingAvatar = escapeAttr(String(e.avatarUrl || ""));
  const editPhotoCss = employeeAvatarCssUrl(e.avatarUrl);
  const editPhotoHasImage = Boolean(editPhotoCss);
  const editPhotoInitial = escapeHtml(String(e.name || "E").charAt(0).toUpperCase());
  const dur = parseContractDurationFields(
    String(e.contractDuration || e.contractDurationText || "").trim()
  );
  const showPlazoBlockInit = contractTypeRequiresDurationPlazo(String(e.contractType || "").trim());
  const showFixedEndInit = isFixedTermContractType(String(e.contractType || "").trim());
  return [
    {
      type: "hidden",
      name: "__employee_edit_id",
      value: empId
    },
    {
      type: "custom",
      label: "Identidad",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Nombre completo")}</span><input name="name" required value="${escapeAttr(e.name || "")}" /></label>
<label><span>${escapeHtml("Tipo documento")}</span><select name="documentType" required>${docSel}</select></label>
<label><span>${escapeHtml("N° documento")}</span><input name="idDoc" required value="${escapeAttr(e.idDoc || "")}" /></label>
<label><span>${escapeHtml("Fecha nacimiento")}</span><input type="date" name="birthDate" value="${escapeAttr(normalizePortalDateYmd(e.birthDate))}" /></label>
<label><span>${escapeHtml("Género")}</span><select name="gender">${genderSel}</select></label>
<label><span>${escapeHtml("Estado civil")}</span><select name="maritalStatus">${maritalSel}</select></label>
<label><span>${escapeHtml("Nivel educativo")}</span><select name="educationLevel">${eduSel}</select></label>
<label><span>${escapeHtml("Tipo de sangre RH")}</span><select name="bloodType">${selectOptionsFromCatalog(CO_CATALOGS.bloodTypes, e.bloodType || "", "Seleccione tipo de sangre...")}</select></label>
<label><span>${escapeHtml("¿Sufre alguna enfermedad o condición médica?")}</span><select name="hasIllness" data-emp-edit-illness required>
<option value="no" ${String(e.hasIllness || "").toLowerCase() !== "si" ? "selected" : ""}>${escapeHtml("No")}</option>
<option value="si" ${String(e.hasIllness || "").toLowerCase() === "si" ? "selected" : ""}>${escapeHtml("Sí")}</option>
</select></label>
<label class="full" data-emp-edit-illness-detail ${String(e.hasIllness || "").toLowerCase() === "si" ? "" : "hidden"}><span>${escapeHtml("¿Cuál? (descripción libre)")}</span><textarea name="illnessDescription" rows="2" placeholder="Detalle breve para uso médico/HR">${escapeHtml(e.illnessDescription || "")}</textarea></label>
</div>`
    },
    {
      type: "custom",
      label: "Contacto y ubicación",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Departamento")}</span><select name="department" id="employee-modal-department" required>${deps}</select></label>
<label><span>${escapeHtml("Ciudad")}</span><select name="city" id="employee-modal-city" required><option value="">${escapeHtml("Seleccione un departamento...")}</option></select></label>
<label class="full"><span>${escapeHtml("Dirección")}</span><input name="address" required value="${escapeAttr(e.address || "")}" /></label>
<label><span>${escapeHtml("Teléfono celular")}</span><input name="phone" required value="${escapeAttr(e.phone || "")}" /></label>
<label><span>${escapeHtml("Correo personal")}</span><input type="email" name="personalEmail" value="${escapeAttr(e.personalEmail || "")}" /></label>
<label><span>${escapeHtml("Contacto emergencia")}</span><input name="emergencyContact" required value="${escapeAttr(e.emergencyContact || "")}" /></label>
<label><span>${escapeHtml("Tel. emergencia")}</span><input name="emergencyPhone" required value="${escapeAttr(e.emergencyPhone || "")}" /></label>
<label class="full"><span>${escapeHtml("Parentesco emergencia")}</span><input name="emergencyRelation" value="${escapeAttr(e.emergencyRelation || "")}" /></label>
</div>`
    },
    {
      type: "custom",
      label: "Laboral",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Empresa")}</span><select name="companyId" required>${companyOptsInner}</select></label>
<label><span>${escapeHtml("Cargo")}</span><select name="positionId" id="employee-modal-position" required>${posOptsInner}</select></label>
<input type="hidden" name="workSchedule" id="employee-modal-work-schedule" value="${escapeAttr(String(e.workSchedule || ""))}" />
<label><span>${escapeHtml("Tipo contrato")}</span><select name="contractType" id="employee-modal-contract-type" required>${contractSel}</select></label>
<div id="emp-edit-contract-duration-block" class="emp-contract-duration-panel full${showPlazoBlockInit ? "" : " hidden"}" style="grid-column:1/-1"${showPlazoBlockInit ? "" : " hidden"}${showPlazoBlockInit ? "" : ' aria-hidden="true"'}>
<p class="emp-contract-duration-title"><span>${escapeHtml("Plazo o duración del contrato")}</span></p>
<p class="full muted modal-field-hint emp-contract-duration-hint" style="margin:0">Obligatorio para <strong>término fijo</strong> o <strong>prestación de servicios</strong>. En contrato indefinido u otros tipos no aplica.</p>
<div class="form-section-grid employee-edit-grid emp-contract-duration-fields" style="grid-column:1/-1">
<label><span>${escapeHtml("Unidad de tiempo")}</span><select name="contractDurationUnit" id="emp-edit-contract-duration-unit">
<option value="">${escapeHtml("Seleccione...")}</option>
<option value="meses" ${dur.unit === "meses" ? "selected" : ""}>${escapeHtml("Meses")}</option>
<option value="anios" ${dur.unit === "anios" ? "selected" : ""}>${escapeHtml("Años")}</option>
<option value="otro" ${dur.unit === "otro" ? "selected" : ""}>${escapeHtml("Otro (texto libre)")}</option>
</select></label>
<div id="emp-edit-contract-duration-qty-wrap" class="emp-contract-duration-branch${dur.unit === "meses" || dur.unit === "anios" ? "" : " hidden"}"${dur.unit === "meses" || dur.unit === "anios" ? "" : " hidden"}>
<label><span>${escapeHtml("Cantidad")}</span><input type="number" name="contractDurationAmount" id="emp-edit-contract-duration-amount" min="1" max="600" placeholder="Ej.: 12" value="${escapeAttr(dur.amount)}" /></label>
</div>
<div id="emp-edit-contract-duration-other-wrap" class="emp-contract-duration-branch full${dur.unit === "otro" ? "" : " hidden"}"${dur.unit === "otro" ? "" : " hidden"}>
<label class="full"><span>${escapeHtml("Describa la duración")}</span><textarea name="contractDurationOther" id="emp-edit-contract-duration-other" rows="2" placeholder="Ej.: hasta finalización del proyecto">${escapeHtml(dur.other)}</textarea></label>
</div>
</div>
</div>
<label><span>${escapeHtml("Fecha ingreso a la empresa")}</span><input type="date" name="startDate" id="employee-modal-start-date" required value="${escapeAttr(normalizePortalDateYmd(e.startDate))}" /></label>
<div id="emp-edit-contract-vigente-start-wrap" class="emp-contract-vigente-start full${showFixedEndInit ? "" : " hidden"}" style="grid-column:1/-1"${showFixedEndInit ? "" : " hidden"}>
<label><span>${escapeHtml("Fecha inicio contrato vigente")}</span><input type="date" name="contractVigenteStartDate" id="employee-modal-contract-vigente-start-date" value="${escapeAttr(normalizePortalDateYmd(e.contractVigenteStartDate))}" /></label>
<p class="muted modal-field-hint" style="margin:0.35rem 0 0;font-size:0.82rem;line-height:1.45">Plazo del contrato fijo o renovación vigente. Si queda vacío al guardar, se usará la fecha de ingreso.</p>
</div>
<div id="emp-edit-contract-end-wrap" class="emp-contract-end-preview full${showFixedEndInit ? "" : " hidden"}" style="grid-column:1/-1"${showFixedEndInit ? "" : " hidden"}>
<label><span>${escapeHtml("Fecha fin del contrato")}</span><input type="date" name="contractEndDate" id="emp-edit-contract-end-date" readonly tabindex="-1" value="${escapeAttr(normalizePortalDateYmd(e.contractEndDate))}" /></label>
<p class="muted emp-contract-renewal-hint" id="emp-edit-contract-renewal-hint" style="margin:0.35rem 0 0;font-size:0.82rem;line-height:1.45"></p>
</div>
<label><span>${escapeHtml("Salario base (COP)")}</span><input type="number" name="baseSalary" id="employee-modal-salary" min="${CO_HR_RULES.minMonthlySalary}" required value="${escapeAttr(parseNum(e.baseSalary))}" /></label>
<label><span>${escapeHtml("Auxilio legal transporte / conectividad")}</span><input type="number" name="transportAllowance" id="employee-modal-transport-allowance" min="0" value="${escapeAttr(readEmployeeTransportAllowanceCop(e))}" /></label>
<p class="full muted modal-field-hint" id="employee-modal-legal-comp-hint" style="grid-column:1/-1;font-size:0.82rem;line-height:1.45;margin:0">${escapeHtml(employeeTransportAllowanceGuidance(e.baseSalary))}</p>
<label><span>${escapeHtml("Periodicidad pago")}</span><select name="payFrequency">${payFreqSel}</select></label>
<label><span>${escapeHtml("Centro de costos")}</span><input name="costCenter" value="${escapeAttr(resolvePayrollEmployeeCostCenter(e))}" data-antares-field="db-upper" data-antares-validate-blur="db-upper" /></label>
<label><span>${escapeHtml("Tipo cotizante")}</span><select name="contributorType">${selectOptionsFromCatalog(CO_CATALOGS.contributorTypes, e.contributorType || "")}</select></label>
<label><span>${escapeHtml("Nivel riesgo ARL")}</span><select name="arlRiskLevel" id="employee-modal-arl-risk">${selectOptionsFromCatalog(CO_CATALOGS.arlRiskLevels, e.arlRiskLevel || "")}</select></label>
<label><span>${escapeHtml("Plantilla contrato Word")}</span><select name="contractTemplateKind" id="employee-modal-contract-template" required>${tmplSel}</select></label>
</div>`
    },
    {
      type: "custom",
      label: "Seguridad social",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("EPS")}</span><select name="eps" required>${selectOptionsFromCatalog(CO_CATALOGS.eps, e.eps || "", "Seleccione EPS...")}</select></label>
<label><span>${escapeHtml("Pensión")}</span><select name="pensionFund" required>${selectOptionsFromCatalog(CO_CATALOGS.pensionFunds, e.pensionFund || "", "Seleccione fondo...")}</select></label>
<label><span>${escapeHtml("ARL")}</span><select name="arl" required>${selectOptionsFromCatalog(CO_CATALOGS.arl, e.arl || "", "Seleccione ARL...")}</select></label>
<label><span>${escapeHtml("Fondo cesantías")}</span><select name="severanceFund">${selectOptionsFromCatalog(CO_CATALOGS.severanceFunds, e.severanceFund || "")}</select></label>
<label><span>${escapeHtml("Caja compensación")}</span><select name="compensationFund">${selectOptionsFromCatalog(CO_CATALOGS.compensationFunds, e.compensationFund || "")}</select></label>
</div>`
    },
    {
      type: "custom",
      label: "Datos bancarios",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Banco")}</span><select name="bankName" required>${selectOptionsFromCatalog(CO_CATALOGS.banks, e.bankName || "", "Seleccione...")}</select></label>
<label><span>${escapeHtml("Tipo cuenta")}</span><select name="bankAccountType">${selectOptionsFromCatalog(CO_CATALOGS.accountTypes, e.bankAccountType || "Ahorros")}</select></label>
<label class="full"><span>${escapeHtml("Número cuenta")}</span><input name="bankAccount" required value="${escapeAttr(e.bankAccount || "")}" /></label>
</div>`
    },
    {
      type: "custom",
      label: "Conductor",
      html: `<div class="form-section-grid employee-edit-grid hr-modal-conductor-block">
<label><span>${escapeHtml("N° licencia")}</span><input name="license" value="${escapeAttr(e.license || "")}" /></label>
<label><span>${escapeHtml("Categoría licencia")}</span><select name="licenseCategory">${selectOptionsFromCatalog(CO_CATALOGS.licenseCategories, e.licenseCategory || "", "Seleccione categoría...")}</select></label>
<label><span>${escapeHtml("Vence licencia")}</span><input type="date" name="licenseExpiry" value="${escapeAttr(normalizePortalDateYmd(e.licenseExpiry))}" /></label>
<label><span>${escapeHtml("Examen ocupacional")}</span><input type="date" name="occupationalExamDate" value="${escapeAttr(normalizePortalDateYmd(e.occupationalExamDate))}" /></label>
<label><span>${escapeHtml("Examen instruvial")}</span><input type="date" name="instruvialExamDate" value="${escapeAttr(normalizePortalDateYmd(e.instruvialExamDate))}" /></label>
<p class="full muted modal-field-hint" style="grid-column:1/-1;font-size:0.78rem">Las fechas de vencimiento de ambos exámenes se calculan automáticamente (+1 año desde cada fecha de examen).</p>
<label><span>${escapeHtml("Conducción defensiva")}</span><select name="defensiveCourse">
<option value="">${escapeHtml("Seleccione...")}</option>
<option value="vigente" ${defCourse === "vigente" ? "selected" : ""}>${escapeHtml("Vigente")}</option>
<option value="vencido" ${defCourse === "vencido" ? "selected" : ""}>${escapeHtml("Vencido")}</option>
<option value="no_aplica" ${defCourse === "no_aplica" ? "selected" : ""}>${escapeHtml("No aplica")}</option>
</select></label>
<p class="full muted modal-field-hint" style="grid-column:1/-1;font-size:0.82rem">Si el cargo no es conductor, puede dejar esta sección en blanco.</p>
</div>`
    },
    {
      type: "custom",
      label: "Foto",
      html: `<div class="form-section-grid employee-edit-grid">
<div class="full hr-employee-avatar-row" style="grid-column:1/-1">
<div class="hr-employee-avatar-inner">
<label for="emp-edit-modal-avatar-input" class="profile-avatar profile-avatar-lg profile-avatar-upload${editPhotoHasImage ? " has-image" : ""}" data-emp-edit-avatar-label style="${editPhotoHasImage ? `background-image:url('${editPhotoCss}');` : ""}" title="Foto del empleado">
<span class="profile-avatar-initial">${editPhotoHasImage ? "" : editPhotoInitial}</span>
<span class="profile-avatar-overlay"><span class="profile-avatar-overlay-inner">${IC.upload}<span>${editPhotoHasImage ? escapeHtml("Cambiar") : escapeHtml("Subir foto")}</span></span></span>
</label>
<input type="file" id="emp-edit-modal-avatar-input" name="avatarFile" accept="image/*" class="profile-avatar-file-input" aria-label="Foto del empleado" />
<input type="hidden" name="avatarUrlExisting" value="${existingAvatar}" />
<p class="muted hr-employee-avatar-caption">${escapeHtml("Pulse el círculo. Si no elige archivo, se conserva la foto actual.")}</p>
</div>
</div>
</div>`
    }
  ];
}

function contractTemplateFileName(kind) {
  const k = String(kind || "").trim().toLowerCase();
  return window.RecruitmentDomain?.TEMPLATE_FILE_BY_KIND?.[k] || "";
}

function renderContractTemplateSelectOptions(selectedKind = "", includeAuto = false) {
  const kinds = ["oficina", "fijo", "prestacion"];
  const cur = String(selectedKind || "").trim().toLowerCase();
  let html = includeAuto
    ? `<option value="">${escapeHtml("Automatica segun tipo de contrato y rol")}</option>`
    : "";
  for (const k of kinds) {
    const label = contractTemplateFileName(k) || k;
    html += `<option value="${escapeAttr(k)}"${cur === k ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }
  return html;
}

function renderContractMergePreviewHtml(employee, opts = {}) {
  if (!employee) {
    return `<p class="muted" style="margin:0">${escapeHtml("Seleccione un empleado para ver los datos que se insertaran en el Word (solo marcadores de la plataforma).")}</p>`;
  }
  const missing = validateEmployeeContractDocFields(employee);
  const payload = buildEmployeeContractDocxPayload(employee, opts);
  const file = contractTemplateFileName(payload.contractTemplateKind) || payload.contractTemplateKind;
  const rows = [
    ["Archivo", file],
    ["Nombre", payload.nombre_empleado],
    ["Documento", payload.cedula_empleado],
    ["Ciudad / municipio", payload.ciudad_empleado],
    ["Cargo", payload.cargo_empleado],
    ["Salario", payload.salario ? `$${Math.round(Number(payload.salario)).toLocaleString("es-CO")}` : ""],
    ["Salario en letras", payload.salario_letras],
    ["Duracion", payload.duracion_contrato],
    ["Banco", payload.banco_cuenta_bancaria],
    ["Cuenta", payload.cuenta_bancaria],
    ["Fecha firma (constancia)", opts.signDate || ""]
  ];
  const missHtml = missing.length
    ? `<p class="muted" style="margin:0 0 0.5rem;color:var(--danger,#c0392b)">${escapeHtml(`Faltan en la ficha: ${missing.join(", ")}`)}</p>`
    : "";
  const body = rows
    .filter(([, v]) => String(v || "").trim())
    .map(
      ([k, v]) =>
        `<tr><th scope="row" style="text-align:left;padding:0.2rem 0.75rem 0.2rem 0;white-space:nowrap">${escapeHtml(k)}</th><td style="padding:0.2rem 0">${escapeHtml(String(v))}</td></tr>`
    )
    .join("");
  return `${missHtml}<table class="contract-merge-preview-table" style="width:100%;font-size:0.88rem;border-collapse:collapse"><tbody>${body}</tbody></table>`;
}

function syncContractFormFromSelection(form) {
  if (!form) return;
  const employeeSelect = form.querySelector("select[name='employeeId']");
  const candidateSelect = form.querySelector("select[name='candidateId']");
  const personMode = String(form.querySelector("#contract-person-mode")?.value || "employee");
  const templateSelect = form.querySelector("select[name='contractTemplateKind']");
  const signDateEl = form.querySelector("input[name='signDate']");
  const previewEl = form.querySelector("[data-contract-merge-preview]");
  let employee = read(KEYS.payrollEmployees, []).find(
    (item) => String(item.id) === String(employeeSelect?.value || "")
  );
  if (personMode === "candidate") {
    const candidate = read(KEYS.candidates, []).find(
      (item) => String(item.id) === String(candidateSelect?.value || "")
    );
    employee = candidate ? findPayrollEmployeeByIdDoc(candidate.idDoc) : null;
  }
  if (!employee) {
    if (previewEl) previewEl.innerHTML = renderContractMergePreviewHtml(null);
    return;
  }
  const empTpl = String(employee.contractTemplateKind || "").trim().toLowerCase();
  if (templateSelect) {
    if (empTpl && [...templateSelect.options].some((o) => String(o.value) === empTpl)) {
      templateSelect.value = empTpl;
    } else if (!String(templateSelect.value || "").trim() && window.RecruitmentDomain?.inferTemplateKind) {
      const wr =
        employee.workerRole ||
        (String(employee.position || "").toLowerCase().includes("conductor") ? "conductor" : "empleado");
      templateSelect.value = window.RecruitmentDomain.inferTemplateKind(
        employee.contractType || "Termino indefinido",
        wr
      );
    }
  }
  const signDate = String(signDateEl?.value || colombiaTodayIsoDate()).trim();
  const kind = String(templateSelect?.value || "").trim();
  if (previewEl) {
    previewEl.innerHTML = renderContractMergePreviewHtml(employee, {
      contractTemplateKind: kind,
      signDate
    });
  }
}

function buildEmployeeContractDocxPayload(employee, opts = {}) {
  const emp = prepareEmployeeForContractDocx(employee);
  let kind = normalizeContractTemplateKind(
    opts.contractTemplateKind || emp.contractTemplateKind,
    emp.contractType,
    emp.workerRole
  );
  const signDate = String(opts.signDate || emp.startDate || colombiaTodayIsoDate()).trim();
  const positionName = String(emp.position || "").trim();
  const wr = String(emp.workerRole || "empleado");
  const ct = String(emp.contractType || "Termino indefinido");
  const templates = window.RecruitmentDomain?.TEMPLATE_BY_KIND || {};
  if (!kind || !templates[kind]) {
    kind = window.RecruitmentDomain?.inferTemplateKind ? window.RecruitmentDomain.inferTemplateKind(ct, wr) : "oficina";
  }
  const base = parseNum(emp.baseSalary);
  const wordsSalary =
    window.RecruitmentDomain?.formatSalarioLetrasPesos
      ? window.RecruitmentDomain.formatSalarioLetrasPesos(base)
      : "";
  return {
    contractTemplateKind: kind,
    contractType: ct,
    workerRole: wr,
    nombre_empleado: String(emp.name || "").trim(),
    cedula_empleado: String(emp.idDoc || "").trim(),
    ciudad_empleado: String(emp.city || "").trim(),
    municipio_empleado: String(emp.city || "").trim(),
    departamento_empleado: String(emp.department || "").trim(),
    banco_cuenta_bancaria: String(emp.bankName || "").trim(),
    cuenta_bancaria: String(emp.bankAccount || "").trim(),
    salario: base,
    salario_letras: wordsSalary,
    duracion_contrato:
      String(emp.contractDuration || emp.contractDurationText || "").trim() ||
      describeContractDurationForDocx({
        contractType: ct,
        startDate: resolveEmployeeContractPlazoStartYmd(emp) || signDate,
        endDate: emp.contractEndDate || emp.endDate || ""
      }),
    cargo_empleado: positionName,
    signDate
  };
}

async function generateOfficialWordContract(payload) {
  if (!window.RecruitmentDomain?.generateEmployeeContractDocx) {
    throw new Error("Módulo de contratos Word no disponible (recarga la página).");
  }
  return window.RecruitmentDomain.generateEmployeeContractDocx(payload);
}

/** Valores de ejemplo para generar un Word de prueba sin persistir contrato. */
function buildContractDocxTestPayload(templateKind) {
  const kind = String(templateKind || "oficina").toLowerCase();
  const contractType =
    kind === "prestacion" ? "Prestacion de servicios" : kind === "fijo" ? "Termino fijo" : "Termino indefinido";
  const workerRole = kind === "prestacion" ? "conductor" : "empleado";
  const today = colombiaTodayIsoDate();
  const endDate = kind === "fijo" ? "2027-12-31" : "";
  return {
    contractTemplateKind: kind,
    contractType,
    workerRole,
    nombre_empleado: "Nombre Apellido Ejemplo",
    cedula_empleado: "1000000000",
    ciudad_empleado: "Bogota D.C.",
    departamento_empleado: "Cundinamarca",
    banco_cuenta_bancaria: "Bancolombia",
    cuenta_bancaria: "000000000000",
    salario: CO_HR_RULES.minMonthlySalary,
    salario_letras: "",
    duracion_contrato: describeContractDurationForDocx({ contractType, startDate: today, endDate }),
    cargo_empleado: kind === "prestacion" ? "Conductor nacional (ejemplo C2)" : "Auxiliar administrativo (ejemplo)",
    signDate: today
  };
}


/** Acciones que los usuarios que no son administrador no pueden ejecutar (listeners capture en `viewRoot`, una sola vez). */
const PORTAL_NON_ADMIN_BLOCKED_ACTIONS = new Set([
  "approve",
  "reject",
  "edit-admin",
  "delete-admin",
  "trip-status",
  "delete-trip",
  "edit-vehicle",
  "toggle-vehicle",
  "delete-vehicle",
  "edit-driver",
  "toggle-driver",
  "delete-driver",
  "delete-route-rate",
  "delete-employee",
  "delete-vacancy",
  "toggle-position",
  "candidate-status",
  "open-edit-user",
  "delete-user",
  "approve-registration",
  "reject-registration",
  "approval-approve",
  "approval-reject",
  "open-edit-company",
  "close-edit-company",
  "toggle-company-active",
  "delete-company",
  "delete-payroll-run",
  "delete-hr-absence",
  "edit-hr-absence",
  "edit-vacancy",
  "edit-position",
  "delete-position",
  "edit-candidate",
  "delete-candidate",
  "edit-interview",
  "delete-interview",
  "delete-contract",
  "edit-sst-record",
  "delete-sst-record",
  "toggle-deleted-requests-log",
  "deleted-request-snapshot-detail",
  "toggle-deleted-trips-log",
  "deleted-trip-snapshot-detail"
]);

function portalNonAdminRestrictedCaptureClick(event) {
  const trigger = event.target.closest("[data-action]");
  const action = String(trigger?.dataset?.action || "");
  if (FLEET_DRIVER_EDIT_ACTIONS.has(action)) {
    if (canEditFleetDriverAsAdmin()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    notify(userMessage("driversManageForbidden"), "error");
    return;
  }
  if (action === "delete-driver") {
    event.preventDefault();
    event.stopImmediatePropagation();
    notify(userMessage("driverDeleteUseHr"), "error");
    return;
  }
  if (isAdminActor()) return;
  if (canPerformHiringEditAction(action)) return;
  if (canPerformPermissionGatedAction(currentUser(), action, trigger)) return;
  if (!PORTAL_NON_ADMIN_BLOCKED_ACTIONS.has(action)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notify(userMessage("adminOnlyModule"), "error");
}

function portalNonAdminRestrictedCaptureChange(event) {
  const trigger = event.target.closest("[data-action]");
  const action = String(trigger?.dataset?.action || "");
  if (FLEET_DRIVER_EDIT_ACTIONS.has(action)) {
    if (canEditFleetDriverAsAdmin()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    notify(userMessage("driversManageForbidden"), "error");
    return;
  }
  if (isAdminActor()) return;
  if (canPerformHiringEditAction(action)) return;
  if (canPerformPermissionGatedAction(currentUser(), action, trigger)) return;
  if (!PORTAL_NON_ADMIN_BLOCKED_ACTIONS.has(action)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notify(userMessage("adminOnlyModule"), "error");
}

/**
 * Guarda dura para handlers destructivos. Aunque la barrera de captura cubre el camino feliz,
 * si alguien manipula el DOM (devtools, extensión) o re-renderea sin pasar por viewRoot, este
 * check rechaza la acción antes de tocar localStorage o la API.
 * @returns {boolean} true si se debe abortar la acción.
 */
function abortIfNotAdmin(reason = "adminOnlyModule") {
  if (isAdminActor()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanApproveTransport(reason = "adminOnlyModule") {
  if (canApproveTransportRequests()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanApprovePortalRegistration(reason = "adminOnlyApprove") {
  if (canApprovePortalRegistration()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanManageTransportTrips(reason = "adminOnlyModule") {
  if (canManageTransportTrips()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanManageHiring(reason = "adminOnlyModule") {
  if (canManageHiringModule()) return false;
  notify(userMessage(reason), "error");
  return true;
}



/** Cobertura pública: GET /api/public/transport-request-coverage-stats (sin JWT). */
let publicCoverageStatsView = null;

/** Rutas principales del index: lista fija (no se sustituye por topHubs de la API). */
const COVERAGE_MAIN_ROUTES_ES = [
  "Santa Marta",
  "Barranquilla",
  "Cartagena",
  "Buenaventura",
  "Puerto Antioquia",
  "Medellin",
  "Oriente Antioqueño",
  "Bogota"
];

function coverageMainRouteHubRows() {
  return COVERAGE_MAIN_ROUTES_ES.map((city) => ({
    city,
    department: null,
    requestCount: null
  }));
}

/** Corredores de referencia (misma forma que topCorridors de la API) para fallback o sin datos. */
const COVERAGE_FALLBACK_CORRIDORS = [
  { cityA: "Santa Marta", cityB: "Barranquilla" },
  { cityA: "Barranquilla", cityB: "Cartagena" },
  { cityA: "Cartagena", cityB: "Buenaventura" },
  { cityA: "Buenaventura", cityB: "Medellin" },
  { cityA: "Medellin", cityB: "Bogota" },
  { cityA: "Oriente Antioqueño", cityB: "Medellin" },
  { cityA: "Medellin", cityB: "Puerto Antioquia" }
];

/** Ventana de meses para GET /public/transport-request-coverage-stats (API acota entre 3 y 36). */
const COVERAGE_STATS_API_MONTHS = 12;

function renderPublicCoverageHubGrid(hubs, showCounts) {
  return hubs
    .map((row) => {
      const city = String(row.city || "").trim();
      if (!city) return "";
      const dept = String(row.department || "").trim();
      const labelHtml = dept
        ? `${escapeHtml(tPublic(city))} (${escapeHtml(dept)})`
        : escapeHtml(tPublic(city));
      const cnt = row.requestCount != null ? Number(row.requestCount) : NaN;
      const badge =
        showCounts && Number.isFinite(cnt)
          ? `<span class="coverage-count" aria-label="${escapeHtml(String(cnt))} solicitudes">${escapeHtml(
              String(cnt)
            )}</span>`
          : "";
      return `<div class="coverage-item"><span class="coverage-dot"></span><span class="coverage-item-label">${labelHtml}</span>${badge}</div>`;
    })
    .filter(Boolean)
    .join("");
}

function renderPublicCoverageCorridorGrid(rows, showCounts) {
  return rows
    .map((row) => {
      const a = String(row.cityA ?? row.originCity ?? "").trim();
      const b = String(row.cityB ?? row.destinationCity ?? "").trim();
      if (!a || !b) return "";
      const deptA = String(row.departmentA ?? row.originDepartment ?? "").trim();
      const deptB = String(row.departmentB ?? row.destinationDepartment ?? "").trim();
      const ta = tPublic(a);
      const tb = tPublic(b);
      const linePlain = `${ta} \u2194 ${tb}`;
      const left = deptA ? `${ta} (${tPublic(deptA)})` : ta;
      const right = deptB ? `${tb} (${tPublic(deptB)})` : tb;
      const title = `${left} \u2194 ${right}`;
      const cnt = row.requestCount != null ? Number(row.requestCount) : NaN;
      const badge =
        showCounts && Number.isFinite(cnt)
          ? `<span class="coverage-count" aria-label="${escapeHtml(String(cnt))} solicitudes">${escapeHtml(
              String(cnt)
            )}</span>`
          : "";
      return `<div class="coverage-item"><span class="coverage-dot"></span><span class="coverage-item-label coverage-corridor-line" title="${escapeHtml(
        title
      )}">${escapeHtml(linePlain)}</span>${badge}</div>`;
    })
    .filter(Boolean)
    .join("");
}

function renderPublicCoverageFromView() {
  const hubGrid = document.getElementById("coverage-hub-grid");
  const corridorGrid = document.getElementById("coverage-corridor-grid");
  const captHub = document.getElementById("coverage-hubs-caption");
  const captCor = document.getElementById("coverage-corridors-caption");
  const foot = document.getElementById("coverage-stats-footnote");
  if (!hubGrid || !corridorGrid) return;

  if (captHub) {
    captHub.textContent = tPublic("Principales puntos de recogida y entrega donde hoy concentramos mas operacion.");
  }
  if (captCor) {
    captCor.textContent = tPublic(
      "Trayectos entre ciudades que mas se repiten; ida y vuelta del mismo corredor se muestran como un solo movimiento."
    );
  }

  const view = publicCoverageStatsView;
  hubGrid.innerHTML = renderPublicCoverageHubGrid(coverageMainRouteHubRows(), false);

  if (!view || view.kind === "fallback") {
    corridorGrid.innerHTML = renderPublicCoverageCorridorGrid(COVERAGE_FALLBACK_CORRIDORS, false);
    if (foot) {
      foot.hidden = false;
      foot.textContent =
        view?.reason === "nobase"
          ? tPublic("Configure la URL del servidor para ver la demanda real en esta seccion.")
          : view?.reason === "empty"
            ? tPublic("No hay solicitudes suficientes en la ventana analizada; se muestra referencia geografica.")
            : view?.reason === "error"
              ? tPublic(
                  "No fue posible cargar las estadisticas de cobertura. Se muestra referencia geografica."
                )
              : tPublic("Configure la URL del servidor para ver la demanda real en esta seccion.");
    }
    return;
  }

  const data = view.data;
  const total = Number(data?.totalRequestsAnalyzed) || 0;
  const topCorridors = Array.isArray(data?.topCorridors) ? data.topCorridors : [];

  const corOk = topCorridors.length > 0;

  corridorGrid.innerHTML = corOk
    ? renderPublicCoverageCorridorGrid(topCorridors, true)
    : renderPublicCoverageCorridorGrid(COVERAGE_FALLBACK_CORRIDORS, false);

  if (foot) {
    if (total > 0 && corOk) {
      foot.hidden = true;
      foot.textContent = "";
    } else {
      foot.hidden = false;
      foot.textContent = tPublic(
        "No hay solicitudes suficientes en la ventana analizada; se muestra referencia geografica."
      );
    }
  }
}

function initCoverageCorridors() {
  const hubGrid = document.getElementById("coverage-hub-grid");
  if (!hubGrid) return;

  if (publicCoverageStatsView) {
    renderPublicCoverageFromView();
    return;
  }

  const api = window.AntaresApi;
  if (!api?.hasBase?.() || typeof api.getJsonPublic !== "function") {
    publicCoverageStatsView = { kind: "fallback", reason: "nobase" };
    renderPublicCoverageFromView();
    return;
  }

  hubGrid.innerHTML = `<div class="coverage-item coverage-item-loading"><span class="coverage-dot"></span><span class="coverage-item-label">${escapeHtml(
    tPublic("Cargando datos de cobertura...")
  )}</span></div>`;
  const corridorGrid = document.getElementById("coverage-corridor-grid");
  if (corridorGrid) {
    corridorGrid.innerHTML = hubGrid.innerHTML;
  }

  void api
    .getJsonPublic(`/public/transport-request-coverage-stats?months=${COVERAGE_STATS_API_MONTHS}`)
    .then((data) => {
      const total = Number(data?.totalRequestsAnalyzed) || 0;
      const topHubs = Array.isArray(data?.topHubs) ? data.topHubs : [];
      const topCorridors = Array.isArray(data?.topCorridors) ? data.topCorridors : [];
      if (total === 0 && !topHubs.length && !topCorridors.length) {
        publicCoverageStatsView = { kind: "fallback", reason: "empty" };
      } else {
        publicCoverageStatsView = { kind: "api", data };
      }
    })
    .catch((err) => {
      devWarn("Cobertura: error al cargar estadisticas desde la API.", err?.message || err);
      publicCoverageStatsView = { kind: "fallback", reason: "error" };
    })
    .finally(() => {
      renderPublicCoverageFromView();
    });
}

function initPublicCareers() {
  const grid = document.getElementById("careers-vacancies-grid");
  if (!grid) return;
  const render = () => {
    const list = getPublicPublishedVacancies();
    if (!list.length) {
      grid.innerHTML =
        `<div class="careers-card"><p class="muted" style="margin:0">${tPublic("No hay vacantes publicadas en este momento. Vuelve pronto o escribenos en Contacto.")}</p></div>`;
      return;
    }
    grid.innerHTML = list
      .map((v) => {
        const salary = parseNum(v.salaryOffer);
        const salaryStr = `$${salary.toLocaleString("es-CO")}`;
        const deadline = v.deadline ? `${tPublic("Cierre")}: ${v.deadline}` : tPublic("Sin fecha limite");
        const req = String(v.requirements || "").slice(0, 180);
        const more = String(v.requirements || "").length > 180 ? "…" : "";
        return `<article class="careers-card lift-card">
          <h3>${v.title}</h3>
          <div class="careers-meta">${v.positionName || tPublic("Cargo")} · ${salaryStr} · ${deadline}</div>
          <p class="careers-req muted">${req}${more}</p>
          <button type="button" class="btn btn-primary full" data-careers-apply data-id="${v.id}">${tPublic("Aplicar")}</button>
        </article>`;
      })
      .join("");
    grid.querySelectorAll("[data-careers-apply]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const vac = getPublicPublishedVacancies().find((x) => x.id === btn.dataset.id);
        if (vac) openPublicVacancyApplyModal(vac);
      });
    });
  };

  const api = window.AntaresApi;
  if (api?.hasBase?.()) {
    publicCareersVacanciesSource = "api";
    publicCareersVacanciesFromApi = null;
    grid.innerHTML =
      `<div class="careers-card"><p class="muted" style="margin:0">${state.publicLang === "en" ? "Loading openings…" : "Cargando vacantes…"}</p></div>`;
    void api
      .getJsonPublic("/public/vacancies")
      .then((rows) => {
        const mapped = Array.isArray(rows)
          ? rows.map((row) => ({
              id: row.id,
              title: row.title,
              department: row.department,
              city: row.city,
              deadline: row.deadline,
              publishedFrom: row.publishedFrom || row.visibleFrom || "",
              salaryOffer: row.salaryOffer,
              requirements: row.requirements,
              status: row.status || "Publicada",
              positionName: row.positionName,
              modality: row.modality,
              openings: row.openings,
              workerRole: row.workerRole
            }))
          : [];
        publicCareersVacanciesFromApi = mergeApiVacanciesWithLocalPublished(mapped, read(KEYS.vacancies, []));
      })
      .catch((err) => {
        devWarn("Carreras: error al cargar vacantes desde la API.", err?.message || err);
        publicCareersVacanciesSource = "local";
        publicCareersVacanciesFromApi = null;
      })
      .finally(() => {
        render();
      });
    return;
  }

  publicCareersVacanciesSource = "local";
  publicCareersVacanciesFromApi = null;
  render();
}

function initPublicScrollSpy() {
  const mainNav = document.getElementById("main-nav");
  if (!mainNav) return;
  const links = [...mainNav.querySelectorAll("a[href^='#']")];
  if (!links.length) return;

  const sectionIds = links
    .map((link) => String(link.getAttribute("href") || "").replace("#", "").trim())
    .filter(Boolean);
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const targetId = String(link.getAttribute("href") || "").replace("#", "").trim();
      link.classList.toggle("active", targetId === id);
    });
  };

  const visibleRatioById = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        visibleRatioById.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      const best = [...visibleRatioById.entries()].sort((a, b) => b[1] - a[1])[0];
      if (best && best[1] > 0) setActive(best[0]);
    },
    { threshold: [0.2, 0.35, 0.5, 0.7], rootMargin: "-18% 0px -55% 0px" }
  );

  sections.forEach((section) => {
    visibleRatioById.set(section.id, 0);
    observer.observe(section);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = String(link.getAttribute("href") || "").replace("#", "").trim();
      if (targetId) setActive(targetId);
    });
  });

  setActive(sectionIds[0]);
}

function initPublicEffects() {
  if (window.AntaresValidation?.installLiveValidation) {
    window.AntaresValidation.installLiveValidation(document);
  }
  initCoverageCorridors();
  initPublicCareers();
  initPublicScrollSpy();

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 40, 280)}ms`;
    observer.observe(item);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.getElementById("hero");
  if (!hero || prefersReducedMotion) return;

  window.addEventListener(
    "scroll",
    () => {
      const offset = window.scrollY * 0.15;
      hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
    },
    { passive: true }
  );

  const tiltCards = document.querySelectorAll("[data-tilt]");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateY = ((x / bounds.width) - 0.5) * 7;
      const rotateX = (0.5 - y / bounds.height) * 7;
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

}

/** Dependencias compartidas para vistas RRHH extraídas a `modules/payroll/*-html.js` (carga posterior a app.js). */
window.AntaresPortalRuntime = window.AntaresPortalRuntime || {};
Object.assign(window.AntaresPortalRuntime, {
  read,
  KEYS,
  IC,
  escapeHtml,
  escapeAttr,
  fieldLabel,
  renderHrAlertCards,
  emptyState,
  renderManagedCreateFormActions,
  createCollapsibleCard,
  moduleFleetHeroStrip,
  pcardWrap,
  isAdminActor,
  getCurrentNotifications,
  isInAppNotificationAlertsEnabled,
  isSonidoNotificacionesHabilitado,
  notificationIsRead,
  fmtDate
});

if (typeof window.registerLegacyPortalViews === "function") {
  window.registerLegacyPortalViews({
    clientDataScopeBarHtml,
    clientRequestsScopePrimaryLabel,
    isPortalClientUser,
    getClientDataScope
  });
} else {
  window.AppLegacyViews = {
    clientDataScopeBarHtml,
    clientRequestsScopePrimaryLabel,
    isPortalClientUser,
    getClientDataScope
  };
}

/** Tras bootstrap remoto (p. ej. al volver a la pestaña): repinta vista y badge sin duplicar lógica en cada módulo. */
window.__portalRefreshAfterBootstrap = function __portalRefreshAfterCacheFromApi() {
  if (!getSession()) return;
  try {
    syncSessionProfileSnapshotFromCache();
    reconcileNotificationsCacheForSession();
    updatePortalSidebarSessionMeta();
  } catch (_e) {
    /* noop */
  }
  /**
   * Tras la rehidratación, el usuario ya tiene permisos reales. Re-evaluamos la vista de la URL
   * para que, si en F5 caímos a `dashboard` por permisos en blanco, podamos volver a la vista
   * previa (#portal/...) sin que el usuario tenga que renavegar.
   */
  try {
    const u = currentUser();
    if (u) {
      enforcePortalViewFromUrl(u);
    }
  } catch (_e) {
    /* noop */
  }
  void (window.__portalBootstrapPositionsFresh
    ? Promise.resolve()
    : refreshPositionsCatalogFromApi({ rerender: false })
  ).finally(() => {
    window.__portalBootstrapPositionsFresh = false;
    try {
      dispatchPositionsCatalogUpdated();
    } catch (_pos) {
      /* noop */
    }
    if (!hasUnsavedPortalFormData()) {
      if (state.currentView === "notifications") {
        scheduleNotificationsViewRenderIfChanged();
      } else {
        scheduleRenderPortalView();
      }
    }
    updateNotificationBadge();
  });
};
