/**
 * Builders HTML reutilizables del portal (tarjetas, paneles de módulo, cabeceras modales, RRHH, directorio).
 * `IC` proviene de `window.IC` (portal-icons).
 * `isCreatePanelExpanded` / `createHrActionCard`: pasar `opts.createPanels` desde quien renderiza (sin importar `store`).
 */
import { MODULE_PANEL_LABELS, MODULE_PANEL_BTN_TITLES, DEFAULT_OPEN_CREATE_PANELS } from "../core/config.js";
import { escapeHtml, escapeAttr } from "../core/utils.js";

function ic() {
  return typeof window !== "undefined" && window.IC ? window.IC : {};
}

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function pcardWrap(iconKey, title, subtitle, bodyHtml, extraClass = "") {
  const inner = ic()[iconKey]?.replace(/<svg[^>]*>|<\/svg>/g, "") || "";
  return `<div class="p-card ${extraClass}"><div class="p-card-header"><div class="p-card-header-left"><svg class="p-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}</div></div></div><div class="p-card-body">${bodyHtml}</div></div>`;
}

export function hrCardIconMarkup(iconKey) {
  const inner = ic()[String(iconKey || "")]?.replace(/<svg[^>]*>|<\/svg>/g, "") || "";
  if (!inner) return "";
  return `<span class="hr-card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></span>`;
}

export function pcardWrapPro(iconKey, title, subtitle, bodyHtml, extraClass = "") {
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

export function renderHrFormHeroBadge(value, label) {
  const safeValue = String(value || "").trim();
  const safeLabel = String(label || "").trim();
  if (!safeValue && !safeLabel) return "";
  return `<span class="hr-form-hero-badge">${safeValue ? `<strong>${escapeHtml(safeValue)}</strong>` : ""}${safeLabel ? `<small>${escapeHtml(safeLabel)}</small>` : ""}</span>`;
}

export function renderHrFormHero({ eyebrow = "", title = "", description = "", tone = "brand", badges = [] } = {}) {
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

export function isCreatePanelExpanded(panelId, fallbackExpanded = false, createPanels = {}) {
  const id = String(panelId || "").trim();
  if (!id) return Boolean(fallbackExpanded);
  const panels = createPanels && typeof createPanels === "object" ? createPanels : {};
  if (Object.prototype.hasOwnProperty.call(panels, id)) return Boolean(panels[id]);
  return DEFAULT_OPEN_CREATE_PANELS.has(id) || Boolean(fallbackExpanded);
}

export function renderModulePanelBtnInner(iconHtml, label) {
  const icon = String(iconHtml || "").trim();
  const text = escapeHtml(String(label || "").trim());
  return `<span class="module-panel-btn__inner">${icon}<span class="module-panel-btn__label">${text}</span></span>`;
}

export function renderModulePanelToggleBtn(opts = {}) {
  const expanded = Boolean(opts.expanded);
  const toggleAction = String(opts.toggleAction || "toggle-create-panel").trim();
  const panelId = String(opts.panelId || "").trim();
  const panelAttr = panelId ? ` data-panel="${escapeAttr(panelId)}"` : "";
  const expandLabel = String(opts.expandLabel || MODULE_PANEL_LABELS.expand).trim();
  if (expanded) {
    return `<button type="button" class="btn btn-sm module-panel-btn module-panel-btn--minimize" data-action="${escapeAttr(toggleAction)}"${panelAttr} aria-expanded="true" title="${escapeAttr(MODULE_PANEL_BTN_TITLES.minimize)}">${renderModulePanelBtnInner(ic().chevronDown, MODULE_PANEL_LABELS.minimize)}</button>`;
  }
  return `<button type="button" class="btn btn-sm module-panel-btn module-panel-btn--expand" data-action="${escapeAttr(toggleAction)}"${panelAttr} aria-expanded="false" title="${escapeAttr(MODULE_PANEL_BTN_TITLES.expand)}">${renderModulePanelBtnInner(ic().plus, expandLabel)}</button>`;
}

export function renderModulePanelCancelBtn(opts = {}) {
  const cancelAction = String(opts.cancelAction || "cancel-create-panel").trim();
  const panelId = String(opts.panelId || "").trim();
  const panelAttr = panelId ? ` data-panel="${escapeAttr(panelId)}"` : "";
  const cancelLabel = String(opts.cancelLabel || MODULE_PANEL_LABELS.cancel).trim();
  const title = String(opts.title || MODULE_PANEL_BTN_TITLES.cancel).trim();
  return `<button type="button" class="btn btn-sm btn-action btn-danger-soft module-panel-btn module-panel-btn--cancel" data-action="${escapeAttr(cancelAction)}"${panelAttr} title="${escapeAttr(title)}">${renderModulePanelBtnInner(ic().rotateCcw, cancelLabel)}</button>`;
}

/** Barra superior: expandir (colapsado) o minimizar (expandido) — misma posición en todos los módulos. */
export function renderModulePanelToolbar(opts = {}) {
  const expanded = Boolean(opts.expanded);
  const showWhen = String(opts.showWhen || "always").trim();
  if (showWhen === "collapsed" && expanded) return "";
  if (showWhen === "expanded" && !expanded) return "";
  return `<div class="module-panel-toolbar" role="toolbar" aria-label="Controles del panel">${renderModulePanelToggleBtn(opts)}</div>`;
}

export function renderManagedCreateFormActions(panelId, submitHtml, opts = {}) {
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
export function renderHrWizardNavButtons() {
  return `<div class="hr-form-wizard-footer-nav" role="group" aria-label="Navegación entre pasos">
    <button type="button" class="btn btn-outline btn-sm hr-wizard-nav-btn" data-hr-wizard-prev disabled>${renderModulePanelBtnInner(ic().chevronLeft, "Anterior")}</button>
    <button type="button" class="btn btn-primary btn-sm hr-wizard-nav-btn" data-hr-wizard-next>${renderModulePanelBtnInner(ic().chevronRight, "Siguiente")}</button>
  </div>`;
}

/** Pie unificado: pasos + hint + minimizar / cancelar / acciones / guardar. */
export function renderHrFormWizardFooter(panelId, submitHtml, opts = {}) {
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
export function renderModulePanelEditActions(submitHtml, opts = {}) {
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
export function renderModalCloseBtn(id = "crud-close") {
  const safeId = String(id || "crud-close").trim() || "crud-close";
  return `<button type="button" id="${escapeAttr(safeId)}" class="btn btn-sm btn-outline module-panel-btn module-panel-btn--close" aria-label="Cerrar">${ic().x}</button>`;
}

/** Cancelar en pie de modal (mismo estilo que módulos). */
export function renderModalCancelBtn(id = "crud-cancel", label = MODULE_PANEL_LABELS.cancel, btnClass = "") {
  const safeId = String(id || "crud-cancel").trim() || "crud-cancel";
  const safeLabel = String(label || MODULE_PANEL_LABELS.cancel).trim();
  const classes =
    String(btnClass || "").trim() ||
    "btn btn-sm btn-action btn-danger-soft module-panel-btn module-panel-btn--cancel";
  return `<button type="button" id="${escapeAttr(safeId)}" class="${escapeAttr(classes)}" title="${escapeAttr(MODULE_PANEL_BTN_TITLES.cancel)}">${renderModulePanelBtnInner(ic().rotateCcw, safeLabel)}</button>`;
}

export function renderModalHead(title, opts = {}) {
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

export function renderModalFooterActions(opts = {}) {
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

export function createHrActionCard(panelId, iconKey, title, subtitle, bodyHtml, expandLabel = "Crear nuevo", opts = {}) {
  const createPanels =
    opts && typeof opts === "object" && Object.prototype.hasOwnProperty.call(opts, "createPanels")
      ? opts.createPanels
      : {};
  const expanded = isCreatePanelExpanded(panelId, false, createPanels);
  const tone = String(iconKey || "plus").replace(/[^a-z0-9_-]/gi, "");
  const extraClass = expanded ? "p-card--expanded hr-action-card--open" : "p-card--collapsed";
  const desc = subtitle
    ? `<p class="hr-action-card__desc">${escapeHtml(String(subtitle))}</p>`
    : "";
  const cardBody = `<div class="hr-action-card__panel${expanded ? " is-open" : " hidden"}" data-create-panel="${escapeAttr(panelId)}"${expanded ? "" : " hidden"}>
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

export function moduleFleetHeroStrip(metrics, hrVariant = "") {
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

export function renderHrAlertCards(items = []) {
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
export function renderHrAttentionStrip(items = [], { okMessage = "Sin pendientes urgentes" } = {}) {
  const attention = (items || []).filter((item) => {
    const tone = item?.tone;
    if (tone === "warn" || tone === "alert") return true;
    const v = item?.value;
    if (typeof v === "number" && v > 0) return tone !== "ok";
    if (typeof v === "string" && v.startsWith("$")) return false;
    return false;
  });
  if (!attention.length) {
    return `<p class="hr-attention-strip hr-attention-strip--ok" role="status">${ic().check} ${escapeHtml(okMessage)}</p>`;
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

export function renderPayrollModuleHead({
  employees,
  pending,
  pendingDriverPayments = 0,
  pendingDriverCop = 0,
  pendingAbsenceApprovals,
  totalPayrollMonth,
  currentYm,
  contractNoticeCount = 0
}) {
  const items = [
    `<div class="payroll-module-kpi__item payroll-module-kpi__item--ok" title="Fichas activas en el directorio"><dt>Equipo</dt><dd><strong>${escapeHtml(String(employees))}</strong></dd></div>`,
    `<div class="payroll-module-kpi__item payroll-module-kpi__item--neutral" title="Suma neta del mes ${escapeHtml(currentYm)}"><dt>Nómina neta</dt><dd><strong>$${parseNum(totalPayrollMonth).toLocaleString("es-CO")}</strong></dd></div>`
  ];
  if (pending > 0) {
    items.push(
      `<div class="payroll-module-kpi__item payroll-module-kpi__item--warn" title="Liquidaciones laborales sin marcar como pagadas"><dt>Pendientes</dt><dd><strong>${escapeHtml(String(pending))}</strong></dd></div>`
    );
  }
  if (pendingDriverPayments > 0) {
    items.push(
      `<div class="payroll-module-kpi__item payroll-module-kpi__item--warn" title="Prestación de servicios — viajes por pagar"><dt>Conductores</dt><dd><strong>${escapeHtml(String(pendingDriverPayments))}</strong> · $${parseNum(pendingDriverCop).toLocaleString("es-CO")}</dd></div>`
    );
  }
  if (pendingAbsenceApprovals > 0) {
    items.push(
      `<div class="payroll-module-kpi__item payroll-module-kpi__item--alert" title="Solicitudes en bandeja de aprobaciones"><dt>Ausencias</dt><dd><strong>${escapeHtml(String(pendingAbsenceApprovals))}</strong></dd></div>`
    );
  }
  if (contractNoticeCount > 0) {
    items.push(
      `<div class="payroll-module-kpi__item payroll-module-kpi__item--alert" title="Término fijo en ventana de 30 días o vencido"><dt>Contratos</dt><dd><strong>${escapeHtml(String(contractNoticeCount))}</strong></dd></div>`
    );
  }
  const payItems = items
    .map((html) =>
      html
        .replace(/payroll-module-kpi__item--/g, "payroll-studio-kpi--")
        .replace(/payroll-module-kpi__item/g, "payroll-studio-kpi")
    )
    .join("");
  return `<header class="payroll-studio-head payroll-module-head payroll-module-head--compact">
      <div class="payroll-studio-head__brand payroll-module-head__title">
        <span class="payroll-studio-head__badge">RRHH · Colombia</span>
        <h2>Gestión humana</h2>
        <p class="payroll-studio-head__tagline">Nómina, seguridad social y talento humano conforme al CST, Ley 50 y normativa vigente.</p>
      </div>
      <dl class="payroll-studio-kpis payroll-module-head__kpi payroll-module-kpi" aria-label="Indicadores de gestión humana">${payItems}</dl>
    </header>`;
}

export function renderHiringModuleHead({
  openVacancies,
  activeCandidates,
  urgentItems,
  contractsThisMonth,
  candidateConversion,
  hiredCandidates,
  totalCandidates
}) {
  const items = [
    `<div class="hiring-studio-kpi hiring-studio-kpi--ok" title="Vacantes abiertas u ofertas activas"><dt>Vacantes</dt><dd><strong>${escapeHtml(String(openVacancies))}</strong></dd></div>`,
    `<div class="hiring-studio-kpi hiring-studio-kpi--neutral" title="Candidatos que siguen en proceso de selección"><dt>En proceso</dt><dd><strong>${escapeHtml(String(activeCandidates))}</strong></dd></div>`,
    `<div class="hiring-studio-kpi hiring-studio-kpi--neutral" title="${escapeHtml(String(hiredCandidates ?? 0))} contratados de ${escapeHtml(String(totalCandidates ?? 0))} candidatos registrados"><dt>Conversión</dt><dd><strong>${escapeHtml(String(candidateConversion))}%</strong></dd></div>`
  ];
  if (urgentItems > 0) {
    items.push(
      `<div class="hiring-studio-kpi hiring-studio-kpi--warn" title="Vacantes por cerrar o contratos por vencer"><dt>Alertas</dt><dd><strong>${escapeHtml(String(urgentItems))}</strong></dd></div>`
    );
  }
  if (contractsThisMonth > 0) {
    items.push(
      `<div class="hiring-studio-kpi hiring-studio-kpi--ok" title="Contratos con fecha de firma en el mes en curso"><dt>Este mes</dt><dd><strong>${escapeHtml(String(contractsThisMonth))}</strong></dd></div>`
    );
  }
  return `<header class="hiring-studio-head hiring-module-head hiring-module-head--compact">
      <div class="hiring-studio-head__brand hiring-module-head__title">
        <span class="hiring-studio-head__badge">Selección · Colombia</span>
        <h2>Contratación</h2>
        <p class="hiring-studio-head__tagline">Vacantes, pipeline de candidatos y generación de contratos conforme al CST y normativa laboral vigente.</p>
      </div>
      <dl class="hiring-studio-kpis hiring-module-head__kpi" aria-label="Indicadores de contratación">${items.join("")}</dl>
    </header>`;
}

export function renderHiringDataSectionNav(activeId, counts = {}, { minimal = false } = {}) {
  const tabs = [
    { id: "candidates", label: "Candidatos", title: "Pipeline y fichas de candidatos", count: counts.candidates ?? 0, icon: "user" },
    { id: "vacancies", label: "Vacantes", title: "Publicaciones y cupos", count: counts.vacancies ?? 0, icon: "send" },
    { id: "interviews", label: "Agenda", title: "Entrevistas programadas", count: counts.interviews ?? 0, icon: "calendar" },
    { id: "contracts", label: "Contratos", title: "Contratos generados y referencias", count: counts.contracts ?? 0, icon: "file" },
    { id: "positions", label: "Cargos", title: "Catálogo de cargos y salarios base", count: counts.positions ?? 0, icon: "briefcase" }
  ];
  const navClass = minimal ? "payroll-data-nav payroll-data-nav--minimal" : "payroll-data-nav";
  return `<nav class="${navClass}" role="tablist" aria-label="Consultas de contratación">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const iconSvg = ic()[t.icon] ? `<span class="payroll-data-nav-ico" aria-hidden="true">${ic()[t.icon]}</span>` : "";
        const tip = escapeAttr(String(t.title || t.label || ""));
        return `<button type="button" role="tab" class="payroll-data-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="hiring-data-section" data-section="${escapeAttr(t.id)}" title="${tip}">${iconSvg}<span>${escapeHtml(t.label)}</span><span class="payroll-data-nav-count">${escapeHtml(String(t.count))}</span></button>`;
      })
      .join("")}
  </nav>`;
}

/** Rail lateral de trámites en Gestión humana (Registrar). */
export function renderPayrollOperateSectionNav(activeId) {
  const tabs = [
    {
      id: "employee",
      label: "Empleado",
      title: "Alta y vinculación laboral",
      hint: "Expediente, EPS, ARL y contrato Word",
      norm: "Relación laboral",
      icon: "userPlus"
    },
    {
      id: "payroll",
      label: "Nómina laboral",
      title: "Liquidación de nómina",
      hint: "Devengos, deducciones y parafiscales",
      norm: "CST · Ley 50",
      icon: "dollar"
    },
    {
      id: "driverPay",
      label: "Pagos conductores",
      title: "Prestación de servicios",
      hint: "Viáticos interdepartamentales y combustible",
      norm: "Sin nómina",
      icon: "truck"
    },
    {
      id: "settlement",
      label: "Terminación",
      title: "Liquidación final",
      hint: "Cesantías, prima y vacaciones",
      norm: "CST art. 61",
      icon: "hash"
    },
    {
      id: "absence",
      label: "Ausencia",
      title: "Ausencias e incapacidades",
      hint: "Vacaciones, licencias y permisos",
      norm: "Novedades RH",
      icon: "calendar"
    }
  ];
  return `<nav class="payroll-operate-nav" role="tablist" aria-label="Trámites de gestión humana">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const iconSvg = ic()[t.icon] ? `<span class="payroll-operate-nav-ico" aria-hidden="true">${ic()[t.icon]}</span>` : "";
        const tip = escapeAttr(`${t.title} — ${t.hint}`);
        return `<button type="button" role="tab" class="payroll-operate-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="payroll-operate-section" data-section="${escapeAttr(t.id)}" title="${tip}">
          ${iconSvg}
          <span class="payroll-operate-nav-copy">
            <strong class="payroll-operate-nav-label">${escapeHtml(t.label)}</strong>
            <small class="payroll-operate-nav-hint">${escapeHtml(t.hint)}</small>
            <span class="payroll-operate-nav-norm">${escapeHtml(t.norm)}</span>
          </span>
        </button>`;
      })
      .join("")}
  </nav>`;
}

export function renderPayrollDataSectionNav(activeId, counts = {}, { minimal = false } = {}) {
  const tabs = [
    { id: "employees", label: "Empleados", title: "Directorio de empleados", count: counts.employees ?? 0, icon: "user" },
    { id: "absences", label: "Ausencias", title: "Ausencias e incapacidades", count: counts.absences ?? 0, icon: "calendar" },
    { id: "runs", label: "Nómina", title: "Nómina laboral y liquidaciones", count: counts.runs ?? 0, icon: "dollar" },
    { id: "driverPayments", label: "Viajes", title: "Pagos conductores — prestación de servicios", count: counts.driverPayments ?? 0, icon: "truck" },
    { id: "legal", label: "Legal", title: "Parámetros legales anuales (SMMLV, auxilio…)", count: counts.legal ?? 0, icon: "hash" }
  ];
  const navClass = minimal ? "payroll-data-nav payroll-data-nav--minimal" : "payroll-data-nav";
  return `<nav class="${navClass}" role="tablist" aria-label="Listas de personal y nómina">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const iconSvg = ic()[t.icon] ? `<span class="payroll-data-nav-ico" aria-hidden="true">${ic()[t.icon]}</span>` : "";
        const tip = escapeAttr(String(t.title || t.label || ""));
        return `<button type="button" role="tab" class="payroll-data-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="payroll-data-section" data-section="${escapeAttr(t.id)}" title="${tip}">${iconSvg}<span>${escapeHtml(t.label)}</span><span class="payroll-data-nav-count">${escapeHtml(String(t.count))}</span></button>`;
      })
      .join("")}
  </nav>`;
}

export function renderModuleWindowTabs({ ariaLabel, activeId, action, valueAttr = "section", tabs = [] }) {
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

export function hrWorkspaceTabIcon(iconKey) {
  const raw = ic()[String(iconKey || "")];
  if (!raw) return "";
  const svg = raw.replace(/class="btn-icon"/, 'class="hr-tab-icon-svg"');
  return `<span class="hr-workspace-tab-ico" aria-hidden="true">${svg}</span>`;
}

export function renderHrWorkspaceTabs({ module, ariaLabel, activeId, tabs, variant = "pro" }) {
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
export function renderHrWorkspaceHeader(moduleHeadHtml, tabsNavHtml, tone = "payroll") {
  const toneClass = tone === "hiring" ? "hr-workspace-header--hiring" : "hr-workspace-header--payroll";
  return `<header class="hr-workspace-header ${toneClass}">
    ${moduleHeadHtml}
    <div class="hr-workspace-header__switch">${tabsNavHtml}</div>
  </header>`;
}

export function directoryToneFromBucket(raw) {
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

export function directoryChipHtml(label, value, tone = "neutral", title = "") {
  const safeValue = String(value ?? "").trim() || "Sin dato";
  const toneClass = tone && tone !== "neutral" ? ` directory-chip--${escapeAttr(tone)}` : "";
  const titleAttr = String(title || "").trim() ? ` title="${escapeAttr(String(title).trim())}"` : "";
  return `<span class="directory-chip${toneClass}"><small>${escapeHtml(label)}</small><strong${titleAttr}>${escapeHtml(safeValue)}</strong></span>`;
}

export function directoryFactHtml(label, value, opts = {}) {
  const toneClass = opts.tone ? ` directory-card__fact--${escapeAttr(opts.tone)}` : "";
  const content = opts.raw ? value || '<span class="muted">Sin dato</span>' : escapeHtml(String(value ?? "").trim() || "Sin dato");
  return `<div class="directory-card__fact${toneClass}"><dt>${escapeHtml(label)}</dt><dd>${content}</dd></div>`;
}

export function directoryPillHtml(label, tone = "neutral") {
  const toneClass = tone && tone !== "neutral" ? ` directory-pill--${escapeAttr(tone)}` : "";
  return `<span class="directory-pill${toneClass}">${escapeHtml(String(label ?? "").trim() || "Sin dato")}</span>`;
}

export function directoryOpsHtml(headline, detail = "", tone = "neutral") {
  const title = String(headline ?? "").trim() || "—";
  const meta = String(detail ?? "").trim();
  const toneClass = tone && tone !== "neutral" ? ` directory-card__ops--${escapeAttr(tone)}` : "";
  const detailHtml = meta
    ? `<span class="directory-card__ops-detail">${escapeHtml(meta)}</span>`
    : "";
  return `<div class="directory-card__ops${toneClass}"><span class="directory-card__ops-dot" aria-hidden="true"></span><div class="directory-card__ops-body"><strong>${escapeHtml(title)}</strong>${detailHtml}</div></div>`;
}

/**
 * Alterna pestañas/paneles sin re-render completo (evita saltos de layout y clics fallidos).
 * @returns {boolean}
 */
export function switchModuleTabPanels({
  root,
  action,
  activeValue,
  valueAttr = "section",
  panelAttr,
  panelAttrs,
  tabSelector,
  tabActiveClass = "is-active",
  panelHiddenClass = "hidden"
}) {
  if (!root || activeValue == null || activeValue === "") return false;
  const attr = String(valueAttr || "section").replace(/[^a-z0-9_-]/gi, "");
  const dataAttr = `data-${attr}`;
  const tabSel = tabSelector || `[data-action="${action}"]`;
  const tabs = [...root.querySelectorAll(tabSel)];
  if (!tabs.length) return false;

  let matchedTab = false;
  tabs.forEach((btn) => {
    const val = btn.getAttribute(dataAttr) ?? btn.dataset[attr];
    const active = String(val) === String(activeValue);
    btn.classList.toggle(tabActiveClass, active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
    if (typeof btn.setAttribute === "function" && btn.hasAttribute("aria-pressed")) {
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (active) matchedTab = true;
  });
  if (!matchedTab) return false;

  const panelAttrList = [...(Array.isArray(panelAttrs) ? panelAttrs : []), panelAttr].filter(Boolean);
  panelAttrList.forEach((name) => {
    root.querySelectorAll(`[${name}]`).forEach((panel) => {
      const panelVal = panel.getAttribute(name);
      const show = String(panelVal) === String(activeValue);
      panel.classList.toggle(panelHiddenClass, !show);
      panel.toggleAttribute("hidden", !show);
      panel.setAttribute("aria-hidden", show ? "false" : "true");
      if (show) panel.classList.add("tab-switch-instant");
    });
  });
  return true;
}

/**
 * Conmutador Registrar | Consultar sin re-render completo.
 * @returns {boolean}
 */
export function switchHrWorkspacePanels({ root, moduleId, workspace, panelAttr, shellSelector }) {
  if (!root || !moduleId || !workspace) return false;
  const attr = panelAttr || `data-${moduleId}-panel`;
  let foundPanel = false;
  root.querySelectorAll(`[${attr}]`).forEach((panel) => {
    const panelWs = panel.getAttribute(attr);
    const show = panelWs === workspace;
    panel.classList.toggle("hidden", !show);
    if (show) {
      panel.classList.add("tab-switch-instant");
      foundPanel = true;
    }
  });
  root.querySelectorAll(`[data-action="hr-workspace-tab"][data-module="${moduleId}"]`).forEach((btn) => {
    const active = btn.dataset.tab === workspace;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  const shellSel = shellSelector || `[data-hr-workspace], [data-history-workspace]`;
  const shell = root.querySelector(shellSel);
  if (shell) {
    if (shell.hasAttribute("data-hr-workspace")) shell.setAttribute("data-hr-workspace", workspace);
    if (shell.hasAttribute("data-history-workspace")) shell.setAttribute("data-history-workspace", workspace);
  }
  return foundPanel;
}

/** Expande/colapsa una tarjeta de creación en el DOM (sin re-render). */
function applyCreatePanelExpandedInDom(card, panelEl, panelId, open) {
  if (!card && !panelEl) return;
  const cardEl = card || panelEl?.closest?.(".p-card");
  const panel = panelEl || cardEl?.querySelector?.(`[data-create-panel="${panelId}"]`);
  if (cardEl) {
    cardEl.classList.toggle("p-card--expanded", open);
    cardEl.classList.toggle("p-card--collapsed", !open);
    cardEl.classList.toggle("hr-action-card--open", open);
  }
  if (panel) {
    panel.classList.toggle("hidden", !open);
    panel.classList.toggle("is-open", open);
    panel.toggleAttribute("hidden", !open);
  }
  const scope = cardEl || panel?.closest?.(".payroll-operate") || panel?.closest?.("[data-hr-workspace]") || document;
  scope.querySelectorAll?.('[data-action="toggle-create-panel"]')?.forEach?.((btn) => {
    if (String(btn.dataset.panel || "") !== String(panelId || "")) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.classList.toggle("module-panel-btn--minimize", open);
    btn.classList.toggle("module-panel-btn--expand", !open);
  });
  const collapsedToolbar = cardEl?.querySelector?.(".module-panel-toolbar");
  if (collapsedToolbar) collapsedToolbar.classList.toggle("hidden", open);
}

/** Expande/colapsa tarjetas de creación en el DOM (sin re-render). */
export function setCreatePanelExpandedInDom(root, panelId, expanded = true) {
  if (!root || !panelId) return;
  root.querySelectorAll(`[data-hr-panel="${panelId}"]`).forEach((card) => {
    applyCreatePanelExpandedInDom(card, null, panelId, expanded);
  });
  root.querySelectorAll(`[data-create-panel="${panelId}"]`).forEach((panel) => {
    applyCreatePanelExpandedInDom(panel.closest(".p-card"), panel, panelId, expanded);
  });
}

/** Sincroniza los cinco formularios de alta de Gestión humana: solo uno abierto. */
export function syncPayrollCreatePanelsInDom(root, activePanelId, { expandActive = true } = {}) {
  if (!root) return;
  const ids = [
    "create-employee",
    "create-payroll",
    "create-driver-trip-payment",
    "create-payroll-settlement",
    "create-hr-absence"
  ];
  ids.forEach((id) => {
    setCreatePanelExpandedInDom(root, id, Boolean(expandActive && id === activePanelId));
  });
}
