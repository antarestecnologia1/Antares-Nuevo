/**
 * Builders HTML reutilizables del portal (tarjetas, paneles de módulo, cabeceras modales, RRHH, directorio).
 * `IC` proviene de `window.IC` (portal-icons).
 * `isCreatePanelExpanded` / `createHrActionCard`: pasar `opts.createPanels` desde quien renderiza (sin importar `store`).
 */
import {
  HIRING_OPERATE_CREATE_PANEL_IDS,
  MODULE_PANEL_LABELS,
  MODULE_PANEL_BTN_TITLES,
  DEFAULT_OPEN_CREATE_PANELS,
  PAYROLL_OPERATE_CREATE_PANEL_IDS,
  TRANSPORT_TRIPS_OPERATE_CREATE_PANEL_IDS,
  VEHICLES_OPERATE_CREATE_PANEL_IDS
} from "../core/config.js";
import { escapeHtml, escapeAttr, fmtDate } from "../core/utils.js";

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

/** Lee si un panel de alta está expandido en el DOM (fuente de verdad al minimizar sin re-render). */
export function readCreatePanelExpandedInDom(root, panelId) {
  const id = String(panelId || "").trim();
  if (!root || !id) return null;
  const panel = root.querySelector(`[data-create-panel="${id}"]`);
  if (panel) {
    if (panel.hasAttribute("hidden")) return false;
    if (panel.classList.contains("hidden")) return false;
    return true;
  }
  const card = root.querySelector(`[data-hr-panel="${id}"]`);
  if (!card) return null;
  if (card.classList.contains("p-card--expanded") || card.classList.contains("hr-action-card--open")) return true;
  if (card.classList.contains("p-card--collapsed")) return false;
  const nested = card.querySelector("[data-create-panel]");
  if (!nested) return null;
  if (nested.hasAttribute("hidden") || nested.classList.contains("hidden")) return false;
  return true;
}

export function renderModulePanelBtnInner(iconHtml, label) {
  const icon = String(iconHtml || "").trim();
  const text = escapeHtml(String(label || "").trim());
  return `<span class="module-panel-btn__inner">${icon}<span class="module-panel-btn__label">${text}</span></span>`;
}

function modulePanelToggleBtnContent(expanded, expandLabel) {
  const label = expanded ? MODULE_PANEL_LABELS.minimize : String(expandLabel || MODULE_PANEL_LABELS.expand).trim();
  const icon = expanded ? ic().chevronUp || ic().chevronDown : ic().plus;
  return renderModulePanelBtnInner(icon, label);
}

function applyModulePanelToggleBtnState(btn, expanded) {
  if (!btn) return;
  const expandLabel = String(btn.dataset.expandLabel || MODULE_PANEL_LABELS.expand).trim();
  btn.innerHTML = modulePanelToggleBtnContent(expanded, expandLabel);
  btn.title = expanded ? MODULE_PANEL_BTN_TITLES.minimize : MODULE_PANEL_BTN_TITLES.expand;
  btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  btn.classList.toggle("module-panel-btn--minimize", expanded);
  btn.classList.toggle("module-panel-btn--expand", !expanded);
}

export function renderModulePanelToggleBtn(opts = {}) {
  const expanded = Boolean(opts.expanded);
  const toggleAction = String(opts.toggleAction || "toggle-create-panel").trim();
  const panelId = String(opts.panelId || "").trim();
  const panelAttr = panelId ? ` data-panel="${escapeAttr(panelId)}"` : "";
  const expandLabel = String(opts.expandLabel || MODULE_PANEL_LABELS.expand).trim();
  const expandLabelAttr = ` data-expand-label="${escapeAttr(expandLabel)}"`;
  const variant = expanded ? "minimize" : "expand";
  const title = expanded ? MODULE_PANEL_BTN_TITLES.minimize : MODULE_PANEL_BTN_TITLES.expand;
  const ariaExpanded = expanded ? "true" : "false";
  return `<button type="button" class="btn btn-sm module-panel-btn module-panel-btn--${variant}" data-action="${escapeAttr(toggleAction)}"${panelAttr}${expandLabelAttr} aria-expanded="${ariaExpanded}" title="${escapeAttr(title)}">${modulePanelToggleBtnContent(expanded, expandLabel)}</button>`;
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
  return `<div class="module-panel-toolbar" role="toolbar" aria-label="Controles del panel" data-show-when="${escapeAttr(showWhen)}">${renderModulePanelToggleBtn(opts)}</div>`;
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
    <button type="button" class="btn btn-outline btn-sm hr-wizard-nav-btn hr-wizard-nav-btn--prev" data-hr-wizard-prev disabled>${renderModulePanelBtnInner(ic().chevronLeft, "Anterior")}</button>
    <button type="button" class="btn btn-outline btn-sm hr-wizard-nav-btn hr-wizard-nav-btn--next" data-hr-wizard-next>${renderModulePanelBtnInner(ic().chevronRight, "Siguiente")}</button>
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

/** Modal de confirmación «descartar cambios» (Cancelar en formularios de alta). */
export function renderConfirmDiscardModalBody(opts = {}) {
  const title = String(opts.title ?? "").trim();
  const message = String(opts.message ?? "").trim();
  const cancelLabel = String(opts.cancelLabel || "Seguir editando").trim();
  const confirmText = String(opts.confirmText || "Sí, descartar").trim();
  const confirmIconKey = String(opts.confirmIcon || "x").trim();
  const confirmIconHtml = ic()[confirmIconKey] || ic().x || "";
  const keepIconHtml = ic().edit || ic().rotateCcw || "";
  return `<div class="modal-discard">
    <div class="modal-discard__top">
      ${renderModalCloseBtn("crud-close")}
    </div>
    <div class="modal-discard__hero">
      <div class="modal-discard__icon" aria-hidden="true">${ic().alertTriangle || ""}</div>
      <h2 class="modal-discard__title">${escapeHtml(title)}</h2>
      <p class="modal-discard__message">${escapeHtml(message)}</p>
    </div>
    <div class="modal-discard__actions">
      <button type="button" id="crud-confirm" class="btn modal-discard__btn modal-discard__btn--discard">${confirmIconHtml}<span>${escapeHtml(confirmText)}</span></button>
      <button type="button" id="crud-cancel" class="btn modal-discard__btn modal-discard__btn--keep btn-primary">${keepIconHtml}<span>${escapeHtml(cancelLabel)}</span></button>
    </div>
  </div>`;
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

const DETAIL_VIEW_TONES = ["blue", "green", "orange", "purple", "teal", "rose"];
const DETAIL_VIEW_DEFAULT_ICONS = [
  "package",
  "file",
  "truck",
  "user",
  "layers",
  "calendar",
  "clock",
  "activity",
  "mapPin",
  "list",
  "phone",
  "briefcase"
];

/** Iconos por etiqueta legible (evita asignar $ u otros iconos fuera de contexto). */
const DETAIL_VIEW_LABEL_ICONS = {
  Acción: "activity",
  Accion: "activity",
  Entidad: "layers",
  Resumen: "log",
  Usuario: "user",
  Actor: "user",
  Responsable: "user",
  Fecha: "clock",
  "Fecha y hora": "clock",
  Hora: "clock",
  Módulo: "grid",
  Modulo: "grid",
  "Detalle del cambio": "list",
  Detalle: "list",
  Cambios: "list",
  Motivo: "file",
  Observaciones: "log",
  Descripción: "log",
  Descripcion: "log",
  Documento: "file",
  Archivo: "file",
  Carpeta: "folder",
  Empresa: "building",
  Correo: "mail",
  Teléfono: "phone",
  Telefono: "phone",
  Placa: "truck",
  Vehículo: "truck",
  Vehiculo: "truck",
  Conductor: "user",
  Viaje: "map",
  Solicitud: "inbox",
  Estado: "flag",
  Rol: "badge",
  Permisos: "shield",
  Salario: "dollar",
  Valor: "dollar",
  Tarifa: "dollar",
  Factura: "dollar",
  Costo: "dollar",
  Neto: "dollar",
  Pago: "dollar"
};

function resolveDetailViewIconForLabel(label = "", explicitIconKey = "", idx = 0) {
  const explicit = String(explicitIconKey || "").trim();
  if (explicit) return explicit;
  const raw = String(label || "").trim();
  if (DETAIL_VIEW_LABEL_ICONS[raw]) return DETAIL_VIEW_LABEL_ICONS[raw];
  const lower = raw.toLowerCase();
  if (/acci[oó]n|movimiento|tipo de/.test(lower)) return "activity";
  if (/resumen|descripci[oó]n|observaci|nota|comentario/.test(lower)) return "log";
  if (/entidad|registro|asunto|t[ií]tulo/.test(lower)) return "layers";
  if (/usuario|actor|responsable|operador|solicitante/.test(lower)) return "user";
  if (/fecha|hora|periodo|vigencia/.test(lower)) return "clock";
  if (/m[oó]dulo|secci[oó]n|área|area/.test(lower)) return "grid";
  if (/detalle|cambio|diff|diferencia/.test(lower)) return "list";
  if (/documento|archivo|anexo/.test(lower)) return "file";
  if (/carpeta|folder|expediente/.test(lower)) return "folder";
  if (/empresa|compa[nñ][ií]a/.test(lower)) return "building";
  if (/correo|email|mail/.test(lower)) return "mail";
  if (/tel[eé]fono|celular|phone/.test(lower)) return "phone";
  if (/placa|veh[ií]culo|cami[oó]n|flota/.test(lower)) return "truck";
  if (/conductor|colaborador|empleado|candidato/.test(lower)) return "user";
  if (/viaje|ruta|trayecto/.test(lower)) return "map";
  if (/solicitud|pedido/.test(lower)) return "inbox";
  if (/estado|estatus/.test(lower)) return "flag";
  if (/salario|valor|tarifa|factura|neto|pago|costo|precio|cop\b|\$/.test(lower)) return "dollar";
  return DETAIL_VIEW_DEFAULT_ICONS[Math.abs(idx) % DETAIL_VIEW_DEFAULT_ICONS.length];
}

/** Tarjeta de campo para fichas «Ver detalle» (grid icono + etiqueta + valor). */
export function detailViewCardMarkup(opts = {}) {
  const {
    iconKey = "activity",
    label = "",
    valueHtml = "",
    tone = "blue",
    highlight = false,
    full = false,
    subHtml = ""
  } = opts;
  const icon = ic()[iconKey] || ic().activity || "";
  const toneClass = tone ? ` detail-view-card--${escapeAttr(String(tone))}` : "";
  const highlightClass = highlight ? " detail-view-card--highlight" : "";
  const fullClass = full ? " detail-view-card--full" : "";
  return `<article class="detail-view-card${toneClass}${highlightClass}${fullClass}">
    <span class="detail-view-card__icon" aria-hidden="true">${icon}</span>
    <div class="detail-view-card__body">
      <span class="detail-view-card__label">${escapeHtml(String(label))}</span>
      <span class="detail-view-card__value">${valueHtml}</span>
      ${subHtml ? `<span class="detail-view-card__sub">${subHtml}</span>` : ""}
    </div>
  </article>`;
}

export function detailViewGridMarkup(cardsHtml = "") {
  const inner = String(cardsHtml || "").trim();
  return inner ? `<div class="detail-view-grid">${inner}</div>` : "";
}

export function detailViewCardsFromPairs(pairs, opts = {}) {
  const skipEmpty = opts.skipEmpty !== false;
  const iconKeys = opts.iconKeys && typeof opts.iconKeys === "object" ? opts.iconKeys : {};
  const toneKeys = opts.toneKeys && typeof opts.toneKeys === "object" ? opts.toneKeys : {};
  let idx = 0;
  return (pairs || [])
    .filter((pair) => {
      if (!pair) return false;
      if (!skipEmpty) return true;
      const val = pair[1];
      return val !== null && val !== undefined && String(val).trim() !== "";
    })
    .map((pair) => {
      const label = pair[0];
      const value = pair[1];
      const cardOpts = pair[2] && typeof pair[2] === "object" ? pair[2] : {};
      const iconKey = resolveDetailViewIconForLabel(
        label,
        cardOpts.iconKey || iconKeys[label] || "",
        idx
      );
      const tone = cardOpts.tone || toneKeys[label] || DETAIL_VIEW_TONES[idx % DETAIL_VIEW_TONES.length];
      const highlight =
        cardOpts.highlight === true ||
        (cardOpts.highlight !== false &&
          iconKey === "dollar" &&
          /valor|salario|tarifa|factura|neto|pago|costo|precio/i.test(String(label)));
      idx += 1;
      const valueHtml =
        value === null || value === undefined || String(value).trim() === ""
          ? '<span class="muted">—</span>'
          : String(value);
      return detailViewCardMarkup({
        iconKey,
        label,
        valueHtml,
        tone,
        highlight,
        full: Boolean(cardOpts.full),
        subHtml: cardOpts.subHtml || ""
      });
    })
    .join("");
}

export function detailViewCardsFromSections(sections, opts = {}) {
  const sectionIconDefaults = {
    user: "user",
    truck: "truck",
    calendar: "calendar",
    file: "file",
    briefcase: "briefcase",
    activity: "activity",
    shield: "shield",
    layers: "layers",
    mapPin: "mapPin",
    phone: "phone",
    heart: "heart",
    dollar: "dollar",
    package: "package"
  };
  let globalIdx = 0;
  return (sections || [])
    .map((sec) => {
      if (!sec) return "";
      const pairs = Array.isArray(sec.pairs) ? sec.pairs : null;
      if (!pairs) return "";
      const defaultIcon = sectionIconDefaults[sec.icon] || "activity";
      return detailViewCardsFromPairs(pairs, {
        skipEmpty: opts.skipEmpty,
        iconKeys: pairs.reduce((acc, pair, pairIdx) => {
          if (pair?.[2]?.iconKey) acc[pair[0]] = pair[2].iconKey;
          else if (pairIdx === 0) acc[pair[0]] = defaultIcon;
          return acc;
        }, {})
      });
    })
    .filter(Boolean)
    .join("");
}

export function composeDetailViewSheet(opts = {}) {
  const moduleIcon = ic()[opts.moduleIcon || "activity"] || ic().activity || "";
  const moduleTone = escapeAttr(String(opts.moduleTone || "blue"));
  const title = escapeHtml(String(opts.title || "Detalle"));
  const subtitleHtml = String(opts.subtitleHtml || "").trim();
  const statusHtml = String(opts.statusHtml || "").trim();
  const cardsHtml = String(opts.cardsHtml || "").trim();
  const notesHtml = String(opts.notesHtml || "").trim();
  const extraHtml = String(opts.extraHtml || "").trim();
  return `<div class="detail-view-sheet">
    <header class="detail-view-sheet__head">
      <div class="detail-view-sheet__brand">
        <span class="detail-view-sheet__module-icon detail-view-sheet__module-icon--${moduleTone}" aria-hidden="true">${moduleIcon}</span>
        <div class="detail-view-sheet__titles">
          <h3 class="detail-view-sheet__title">${title}</h3>
          ${subtitleHtml ? `<p class="detail-view-sheet__subtitle">${subtitleHtml}</p>` : ""}
        </div>
      </div>
      ${statusHtml ? `<div class="detail-view-sheet__status">${statusHtml}</div>` : ""}
    </header>
    ${
      cardsHtml
        ? /detail-view-section|detail-view-grid/.test(cardsHtml)
          ? cardsHtml
          : detailViewGridMarkup(cardsHtml)
        : ""
    }
    ${
      notesHtml
        ? `<section class="detail-view-notes" aria-label="Observaciones">
            <h4 class="detail-view-notes__title">${ic().file || ""}<span>Observaciones</span></h4>
            <div class="detail-view-notes__body"><p class="detail-note">${notesHtml}</p></div>
          </section>`
        : ""
    }
    ${extraHtml}
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
  return `<div class="module-panel-actions module-panel-actions--footer modal-edit-actions form-flow-actions${extraClass ? ` ${escapeAttr(extraClass)}` : ""}">
    <div class="module-panel-actions__bar">
      <div class="module-panel-actions__group module-panel-actions__group--secondary">
        ${showCancel ? renderModalCancelBtn(cancelId, cancelLabel, cancelBtnClass) : ""}
        ${secondaryHtml}
      </div>
      ${primaryHtml ? `<div class="module-panel-actions__group module-panel-actions__group--primary">${primaryHtml}</div>` : ""}
    </div>
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
  const toolbarExtras = String(opts.toolbarExtras || "").trim();
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
      <div class="hr-action-card__toolbar">
        ${toolbarExtras}
        ${renderModulePanelToolbar({ expanded, toggleAction: "toggle-create-panel", panelId, expandLabel, showWhen: "always" })}
      </div>
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
  contractNoticeCount = 0,
  workspace = "operate"
}) {
  const consultMode = String(workspace || "operate") === "data";
  const items = consultMode
    ? []
    : [
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
  if (!consultMode && contractNoticeCount > 0) {
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
  const headModeClass = consultMode ? " payroll-module-head--consult" : "";
  const headAlertsClass = consultMode && items.length ? " payroll-module-head--consult-alerts" : "";
  const kpiHtml = payItems
    ? `<dl class="payroll-studio-kpis payroll-module-head__kpi payroll-module-kpi" aria-label="Indicadores de gestión humana">${payItems}</dl>`
    : "";
  return `<header class="payroll-studio-head payroll-module-head payroll-module-head--compact${headModeClass}${headAlertsClass}">
      <div class="payroll-studio-head__brand payroll-module-head__title">
        ${consultMode ? "" : `<span class="payroll-studio-head__badge">RRHH · Colombia</span>`}
        <h2>Gestión humana</h2>
        ${consultMode ? "" : `<p class="payroll-studio-head__tagline">Nómina, seguridad social y talento humano conforme al CST, Ley 50 y normativa vigente.</p>`}
      </div>
      ${kpiHtml}
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
        const ariaLbl = escapeAttr(`${t.label} — ${t.hint}`);
        return `<button type="button" role="tab" class="payroll-operate-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="payroll-operate-section" data-section="${escapeAttr(t.id)}" title="${tip}" aria-label="${ariaLbl}">
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

/** Rail lateral de flujos en Transporte · Camiones (Registrar). */
export function renderVehiclesOperateSectionNav(activeId, opts = {}) {
  const enabled = new Set(
    Array.isArray(opts.enabledSections) && opts.enabledSections.length
      ? opts.enabledSections.map((s) => String(s))
      : ["create", "fuel", "technical"]
  );
  const allTabs = [
    {
      id: "create",
      label: "Vehículo",
      title: "Registrar vehículo en flota",
      hint: "Ficha técnica, documentación y GPS",
      norm: "Catálogo",
      icon: "truck"
    },
    {
      id: "fuel",
      label: "Combustible",
      title: "Registro de combustible",
      hint: "Litros, costo, estación y odómetro",
      norm: "Historial",
      icon: "fuel"
    },
    {
      id: "technical",
      label: "Taller",
      title: "Novedad de mantenimiento",
      hint: "Preventivo, correctivo o parada",
      norm: "Mantenimiento",
      icon: "activity"
    }
  ];
  const tabs = allTabs.filter((t) => enabled.has(t.id));
  return `<nav class="vehicles-operate-nav" role="tablist" aria-label="Trámites de camiones">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const iconSvg = ic()[t.icon] ? `<span class="vehicles-operate-nav-ico" aria-hidden="true">${ic()[t.icon]}</span>` : "";
        const tip = escapeAttr(`${t.title} — ${t.hint}`);
        return `<button type="button" role="tab" class="vehicles-operate-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="vehicles-section" data-section="${escapeAttr(t.id)}" title="${tip}">
          ${iconSvg}
          <span class="vehicles-operate-nav-copy">
            <strong class="vehicles-operate-nav-label">${escapeHtml(t.label)}</strong>
            <small class="vehicles-operate-nav-hint">${escapeHtml(t.hint)}</small>
            <span class="vehicles-operate-nav-norm">${escapeHtml(t.norm)}</span>
          </span>
        </button>`;
      })
      .join("")}
  </nav>`;
}

/** Rail lateral de flujos en Transporte · Viajes (Registrar). */
export function renderTransportOperateSectionNav(activeId) {
  const tabs = [
    {
      id: "trips",
      label: "Asignar viaje",
      title: "Crear viaje operativo",
      hint: "Solicitud, flota y tarifa pactada",
      norm: "Operación",
      icon: "truck"
    },
    {
      id: "routes",
      label: "Trayecto y tarifa",
      title: "Catálogo de rutas",
      hint: "Precios por origen, destino y cliente",
      norm: "Catálogo",
      icon: "mapPin"
    }
  ];
  return `<nav class="transport-operate-nav" role="tablist" aria-label="Flujos de registro de transporte">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const iconSvg = ic()[t.icon] ? `<span class="transport-operate-nav-ico" aria-hidden="true">${ic()[t.icon]}</span>` : "";
        const tip = escapeAttr(`${t.title} — ${t.hint}`);
        return `<button type="button" role="tab" class="transport-operate-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="transport-trips-section" data-section="${escapeAttr(t.id)}" title="${tip}">
          ${iconSvg}
          <span class="transport-operate-nav-copy">
            <strong class="transport-operate-nav-label">${escapeHtml(t.label)}</strong>
            <small class="transport-operate-nav-hint">${escapeHtml(t.hint)}</small>
            <span class="transport-operate-nav-norm">${escapeHtml(t.norm)}</span>
          </span>
        </button>`;
      })
      .join("")}
  </nav>`;
}

/** Rail lateral en Cumplimiento SST (Registrar). */
export function renderSstOperateSectionNav(activeId = "create") {
  const active = String(activeId || "create").trim().toLowerCase() === "guide" ? "guide" : "create";
  const tabs = [
    {
      id: "create",
      label: "Nuevo control",
      title: "Registrar obligación legal o control SST",
      hint: "Colaborador, vencimiento y evidencia",
      norm: "Auditoría",
      icon: "shield"
    },
    {
      id: "guide",
      label: "Guía de cumplimiento",
      title: "Checklist y buenas prácticas SST",
      hint: "Qué registrar y cuándo renovar",
      norm: "Referencia",
      icon: "file"
    }
  ];
  return `<nav class="sst-operate-nav" role="tablist" aria-label="Registro de controles SST">
    ${tabs
      .map((t) => {
        const isActive = active === t.id;
        const iconHtml = ic()[t.icon] ? `<span class="sst-operate-nav-ico" aria-hidden="true">${ic()[t.icon]}</span>` : "";
        return `<button type="button" role="tab" class="sst-operate-nav-tab${isActive ? " is-active" : ""}" aria-selected="${isActive ? "true" : "false"}" data-action="sst-operate-section" data-section="${escapeAttr(t.id)}" title="${escapeAttr(t.title)}">
          ${iconHtml}
          <span class="sst-operate-nav-copy">
            <strong class="sst-operate-nav-label">${escapeHtml(t.label)}</strong>
            <small class="sst-operate-nav-hint">${escapeHtml(t.hint)}</small>
            <span class="sst-operate-nav-norm">${escapeHtml(t.norm)}</span>
          </span>
        </button>`;
      })
      .join("")}
  </nav>`;
}

/** Rail lateral en Solicitudes (Registrar). */
export function renderRequestsOperateSectionNav() {
  const iconSvg = ic().plus ? `<span class="requests-operate-nav-ico" aria-hidden="true">${ic().plus}</span>` : "";
  return `<nav class="requests-operate-nav" role="tablist" aria-label="Registro de solicitudes">
    <button type="button" role="tab" class="requests-operate-nav-tab is-active" aria-selected="true" title="Nueva solicitud de viaje — ruta, carga y ventana de servicio">
      ${iconSvg}
      <span class="requests-operate-nav-copy">
        <strong class="requests-operate-nav-label">Nueva solicitud</strong>
        <small class="requests-operate-nav-hint">Ruta, carga y ventana de servicio</small>
        <span class="requests-operate-nav-norm">Transporte</span>
      </span>
    </button>
  </nav>`;
}

/** Rail lateral de trámites en Contratación (Registrar). */
export function renderHiringOperateSectionNav(activeId) {
  const tabs = [
    {
      id: "position",
      label: "Cargo",
      title: "Definir cargo en catálogo",
      hint: "Salario base, jornada y plantilla sugerida",
      norm: "Catálogo RH",
      icon: "briefcase"
    },
    {
      id: "vacancy",
      label: "Vacante",
      title: "Publicar vacante",
      hint: "Oferta visible para postulaciones",
      norm: "Selección",
      icon: "plus"
    },
    {
      id: "candidate",
      label: "Candidato",
      title: "Registrar candidato",
      hint: "Hoja de vida y pipeline de selección",
      norm: "Pipeline",
      icon: "userPlus"
    },
    {
      id: "interview",
      label: "Entrevista",
      title: "Programar entrevista",
      hint: "Fecha, hora y responsable del proceso",
      norm: "Agenda",
      icon: "calendar"
    },
    {
      id: "contract",
      label: "Contrato",
      title: "Generar contrato Word",
      hint: "Plantilla según cargo y vinculación",
      norm: "CST · Word",
      icon: "file"
    }
  ];
  return `<nav class="hiring-operate-nav" role="tablist" aria-label="Trámites de contratación">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const iconSvg = ic()[t.icon] ? `<span class="hiring-operate-nav-ico" aria-hidden="true">${ic()[t.icon]}</span>` : "";
        const tip = escapeAttr(`${t.title} — ${t.hint}`);
        return `<button type="button" role="tab" class="hiring-operate-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="hiring-operate-section" data-section="${escapeAttr(t.id)}" title="${tip}">
          ${iconSvg}
          <span class="hiring-operate-nav-copy">
            <strong class="hiring-operate-nav-label">${escapeHtml(t.label)}</strong>
            <small class="hiring-operate-nav-hint">${escapeHtml(t.hint)}</small>
            <span class="hiring-operate-nav-norm">${escapeHtml(t.norm)}</span>
          </span>
        </button>`;
      })
      .join("")}
  </nav>`;
}

function payrollDataSectionTabs(counts = {}, { cards = false } = {}) {
  return [
    { id: "employees", label: "Empleados", title: "Directorio de empleados", count: counts.employees ?? 0, icon: "user" },
    { id: "absences", label: "Ausencias", title: "Ausencias e incapacidades", count: counts.absences ?? 0, icon: "calendar" },
    { id: "runs", label: "Nómina", title: "Nómina laboral y liquidaciones", count: counts.runs ?? 0, icon: "dollar" },
    { id: "driverPayments", label: "Viajes", title: "Pagos conductores — prestación de servicios", count: counts.driverPayments ?? 0, icon: "truck" },
    {
      id: "legal",
      label: "Legal",
      title: "Parámetros legales anuales (SMMLV, auxilio…)",
      count: counts.legal ?? 0,
      icon: cards ? "shield" : "hash"
    }
  ];
}

export function renderPayrollDataSectionNav(activeId, counts = {}, { minimal = false, cards = false } = {}) {
  const tabs = payrollDataSectionTabs(counts, { cards });
  if (cards) {
    return `<nav class="payroll-section-cards" role="tablist" aria-label="Secciones de gestión humana">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const iconSvg = ic()[t.icon] ? `<span class="payroll-section-card__ico" aria-hidden="true">${ic()[t.icon]}</span>` : "";
        const tip = escapeAttr(String(t.title || t.label || ""));
        return `<button type="button" role="tab" class="payroll-section-card${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="payroll-data-section" data-section="${escapeAttr(t.id)}" title="${tip}">
          ${iconSvg}
          <span class="payroll-section-card__body">
            <span class="payroll-section-card__label">${escapeHtml(t.label)}</span>
            <strong class="payroll-section-card__count">${escapeHtml(String(t.count))}</strong>
          </span>
        </button>`;
      })
      .join("")}
  </nav>`;
  }
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

/** Botones Registrar / Consultar al estilo de la cabecera de empleados. */
export function renderPayrollWorkspaceActionButtons(module, activeId) {
  const safeModule = escapeAttr(module);
  const tabs = [
    { id: "operate", label: "Registrar", icon: "plus", primary: false },
    { id: "data", label: "Consultar", icon: "eye", primary: true }
  ];
  return `<div class="payroll-workspace-actions" role="tablist" aria-label="Modo del módulo de gestión humana">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const filled = active && (t.id === "operate" || t.primary);
        const btnClass = filled
          ? "btn btn-sm btn-primary payroll-workspace-actions__btn is-active"
          : active
            ? "btn btn-sm btn-outline payroll-workspace-actions__btn is-active"
            : "btn btn-sm btn-outline payroll-workspace-actions__btn";
        const icon = ic()[t.icon] || "";
        return `<button type="button" role="tab" aria-selected="${active ? "true" : "false"}" class="${btnClass}" data-action="hr-workspace-tab" data-module="${safeModule}" data-tab="${escapeAttr(t.id)}">${icon}<span>${escapeHtml(t.label)}</span></button>`;
      })
      .join("")}
  </div>`;
}

const PAYROLL_CONSULT_SECTION_META = {
  employees: {
    label: "Empleados",
    subtitle: "Administra colaboradores y su información"
  },
  absences: {
    label: "Ausencias",
    subtitle: "Vacaciones, licencias e incapacidades registradas"
  },
  runs: {
    label: "Nómina",
    subtitle: "Liquidaciones y pagos de nómina laboral"
  },
  driverPayments: {
    label: "Viajes",
    subtitle: "Pagos a conductores por prestación de servicios"
  },
  legal: {
    label: "Legal",
    subtitle: "Parámetros legales anuales (SMMLV, auxilio y aportes)"
  }
};

/** Cabecera del modo Consultar: título, acciones, tarjetas de sección y alertas. */
export function renderPayrollConsultWorkspaceHeader({
  dataSection,
  counts = {},
  contractAlertsHtml = "",
  actionsHtml = ""
}) {
  const sectionId = String(dataSection || "employees");
  const meta = PAYROLL_CONSULT_SECTION_META[sectionId] || PAYROLL_CONSULT_SECTION_META.employees;
  const navHtml = renderPayrollDataSectionNav(sectionId, counts, { cards: true });
  const alertsBlock =
    sectionId === "employees" && String(contractAlertsHtml || "").trim()
      ? `<div class="payroll-consult-head__alerts">${contractAlertsHtml}</div>`
      : "";
  return `<header class="hr-workspace-header hr-workspace-header--payroll hr-workspace-header--consult">
    <div class="payroll-consult-head">
      <div class="payroll-consult-head__top">
        <div class="payroll-consult-head__title">
          <h2>${escapeHtml(meta.label)}</h2>
          <p class="payroll-consult-head__subtitle">${escapeHtml(meta.subtitle)}</p>
        </div>
        <div class="payroll-consult-head__actions">${actionsHtml}</div>
      </div>
      ${navHtml}
      ${alertsBlock}
    </div>
  </header>`;
}

/** Actualiza título y alertas de la cabecera Consultar sin re-render completo. */
export function syncPayrollConsultHeaderDom(root, dataSection) {
  const header = root?.querySelector?.(".hr-workspace-header--consult");
  if (!header) return false;
  const sectionId = String(dataSection || "employees");
  const meta = PAYROLL_CONSULT_SECTION_META[sectionId] || PAYROLL_CONSULT_SECTION_META.employees;
  const titleEl = header.querySelector(".payroll-consult-head__title h2");
  const subtitleEl = header.querySelector(".payroll-consult-head__subtitle");
  if (titleEl) titleEl.textContent = meta.label;
  if (subtitleEl) subtitleEl.textContent = meta.subtitle;
  const alertsWrap = header.querySelector(".payroll-consult-head__alerts");
  if (alertsWrap) alertsWrap.hidden = sectionId !== "employees";
  return true;
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
  const toneClass =
    tone === "hiring" ? "hr-workspace-header--hiring" : tone === "sst" ? "hr-workspace-header--sst" : "hr-workspace-header--payroll";
  const switchClass =
    String(tabsNavHtml || "").includes("payroll-workspace-actions")
      ? "hr-workspace-header__switch hr-workspace-header__switch--actions"
      : "hr-workspace-header__switch";
  return `<header class="hr-workspace-header ${toneClass}">
    ${moduleHeadHtml}
    <div class="${switchClass}">${tabsNavHtml}</div>
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
  return `<div class="directory-card__ops portal-ops-card-highlight${toneClass}"><span class="directory-card__ops-dot portal-ops-card-highlight__dot" aria-hidden="true"></span><div class="directory-card__ops-body portal-ops-card-highlight__copy"><strong>${escapeHtml(title)}</strong>${detailHtml}</div></div>`;
}

/** Marca de tiempo relativa para pie de tarjetas operativas. */
export function formatPortalOpsCardTimestamp(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const timePart = d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true });
  if (sameDay) return `Hoy, ${timePart}`;
  if (isYesterday) return `Ayer, ${timePart}`;
  return fmtDate(iso);
}

/**
 * Tiempo relativo compacto para pies de tarjeta ("hace 3 días", "en 2 meses").
 * Pensado para dar contexto temporal sin ocupar más espacio que una fecha plana.
 */
export function formatPortalOpsCardRelative(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const future = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const minutes = Math.floor(absMs / 60000);
  if (minutes < 1) return "hace instantes";
  if (minutes < 60) return future ? `en ${minutes} min` : `hace ${minutes} min`;
  const hours = Math.floor(absMs / 3600000);
  if (hours < 24) return future ? `en ${hours} h` : `hace ${hours} h`;
  const days = Math.floor(absMs / 86400000);
  if (days === 1) return future ? "mañana" : "ayer";
  if (days < 30) return future ? `en ${days} días` : `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) {
    const unit = months === 1 ? "mes" : "meses";
    return future ? `en ${months} ${unit}` : `hace ${months} ${unit}`;
  }
  const years = Math.floor(days / 365);
  const unit = years === 1 ? "año" : "años";
  return future ? `en ${years} ${unit}` : `hace ${years} ${unit}`;
}

/**
 * Urgencia de una fecha de recogida/cita (comparación por día calendario).
 * Devuelve `{ label, tone }` para usarse como subvalor de una celda de tarjeta.
 * `tone`: alert (vencida) · warn (hoy / próxima) · ok (con holgura).
 */
export function portalOpsCardPickupUrgency(value) {
  if (!value) return { label: "", tone: "" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { label: "", tone: "" };
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startTarget.getTime() - startToday.getTime()) / 86400000);
  if (days < 0) {
    return { label: days === -1 ? "Vencida ayer" : `Vencida hace ${Math.abs(days)} días`, tone: "alert" };
  }
  if (days === 0) return { label: "Recoge hoy", tone: "warn" };
  if (days === 1) return { label: "Recoge mañana", tone: "warn" };
  if (days <= 3) return { label: `Recoge en ${days} días`, tone: "warn" };
  return { label: `Recoge en ${days} días`, tone: "ok" };
}

/** Celda de cuadrícula estándar para tarjetas del portal. */
export function buildPortalOpsCardGridItem(label, icon, value, options = {}) {
  const tone = String(options.tone || "");
  const subValue = String(options.subValue || "").trim();
  const subTone = String(options.subTone || tone || "");
  const raw = Boolean(options.raw);
  const toneClass = tone ? ` trip-ops-card-item--${tone}` : "";
  const valueClass =
    tone === "ok"
      ? " trip-ops-card-item-value--ok"
      : tone === "warn"
        ? " trip-ops-card-item-value--warn"
        : tone === "alert"
          ? " trip-ops-card-item-value--alert"
          : "";
  const valueHtml = raw ? String(value ?? "") : escapeHtml(String(value ?? ""));
  const subHtml = subValue
    ? `<span class="portal-ops-card-spec-sub${subTone ? ` portal-ops-card-spec-sub--${escapeAttr(subTone)}` : ""}">${escapeHtml(subValue)}</span>`
    : "";
  const bodyClass = subValue ? " portal-ops-card-spec-body" : "";
  const valueInner = subValue
    ? `<span class="trip-ops-card-item-value-wrap"><span class="trip-ops-card-item-value${valueClass}" title="${escapeAttr(String(value ?? ""))}">${valueHtml}</span>${subHtml}</span>`
    : `<span class="trip-ops-card-item-value${valueClass}" title="${escapeAttr(String(value ?? ""))}">${valueHtml}</span>`;
  return `<div class="trip-ops-card-item${toneClass}">
    <span class="trip-ops-card-item-label">${escapeHtml(label)}</span>
    <div class="trip-ops-card-item-body${bodyClass}">
      <span class="trip-ops-card-item-icon" aria-hidden="true">${icon}</span>
      ${valueInner}
    </div>
  </div>`;
}

/** Texto plano para pills (evita HTML accidental de prettyStatus). */
function portalOpsCardPlainLabel(label) {
  const raw = String(label ?? "").trim();
  if (!raw) return "—";
  if (!raw.includes("<")) return raw;
  return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "—";
}

/** Referencias de cabecera (viaje, solicitud, etc.) en chips separados y legibles. */
export function buildPortalOpsCardRefs(items = []) {
  const chips = (Array.isArray(items) ? items : [])
    .map((item) => {
      const label = String(item?.label ?? "").trim();
      const value = String(item?.value ?? "").trim();
      if (!label || !value) return "";
      return `<span class="portal-ops-card-ref" title="${escapeAttr(`${label} ${value}`)}">
        <span class="portal-ops-card-ref-label">${escapeHtml(label)}</span>
        <strong class="portal-ops-card-ref-value">${escapeHtml(value)}</strong>
      </span>`;
    })
    .filter(Boolean)
    .join("");
  return chips ? `<div class="portal-ops-card-refs">${chips}</div>` : "";
}

/** Badge de estado principal (flota / viajes / solicitudes). */
export function buildPortalOpsCardStatusPill(label, slug) {
  const text = portalOpsCardPlainLabel(label);
  const key = escapeAttr(String(slug || "neutral").trim() || "neutral");
  return `<span class="portal-ops-card-status-pill portal-ops-card-status-pill--${key}" role="status" title="${escapeAttr(text)}">
    <span class="portal-ops-card-status-pill__dot" aria-hidden="true"></span>
    <span class="portal-ops-card-status-pill__text">${escapeHtml(text)}</span>
  </span>`;
}

/** Badge documental secundario. */
export function buildPortalOpsCardDocPill(label, bucket = "ok", iconHtml = "") {
  const tone =
    bucket === "expired" || bucket === "alert"
      ? "expired"
      : bucket === "missing"
        ? "missing"
        : bucket === "warning" || bucket === "warn"
          ? "warning"
          : "ok";
  const icon = iconHtml || ic().award || "";
  return `<span class="portal-ops-card-doc-pill portal-ops-card-doc-pill--${escapeAttr(tone)} driver-card-doc-pill driver-card-doc-pill--${escapeAttr(tone)}" title="${escapeAttr(String(label ?? "").trim() || "Estado documental")}">
    ${icon ? `<span class="portal-ops-card-doc-pill__icon" aria-hidden="true">${icon}</span>` : ""}
    <span>${escapeHtml(String(label ?? "").trim() || "—")}</span>
  </span>`;
}

/** Pie estándar sin ID confidencial. */
export function buildPortalOpsCardFoot(prefix, value) {
  const label = String(prefix || "Creado").trim();
  const text = String(value ?? "").trim() || "—";
  return `<footer class="trip-ops-card-foot portal-ops-card-foot">
    <span class="trip-ops-card-foot-created">${ic().clock || ""}<span>${escapeHtml(label)}: ${escapeHtml(text)}</span></span>
  </footer>`;
}

/** Contenedor de acciones en cuadrícula 2×2 (+ opcional ancho completo). */
export function buildPortalOpsCardActions(primaryButtonsHtml, fullWidthButtonHtml = "") {
  const primary = String(primaryButtonsHtml || "").trim();
  const full = String(fullWidthButtonHtml || "").trim();
  if (!primary && !full) return "";
  return `<div class="trip-ops-card-actions portal-ops-card-actions">
    ${primary ? `<div class="portal-ops-card-actions-grid">${primary}</div>` : ""}
    ${full}
  </div>`;
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
    applyModulePanelToggleBtnState(btn, open);
  });
  const collapsedToolbar = cardEl?.querySelector?.(".module-panel-toolbar");
  if (collapsedToolbar?.dataset?.showWhen === "collapsed") {
    collapsedToolbar.classList.toggle("hidden", open);
  }
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

/** Expande/colapsa tarjetas de creación en el DOM (sin re-render). */
export function syncModuleCreatePanelsInDom(root, panelIds, activePanelId, { expandActive = true } = {}) {
  if (!root) return;
  const ids = Array.isArray(panelIds) ? panelIds : [];
  const active = String(activePanelId || "").trim();
  ids.forEach((id) => {
    setCreatePanelExpandedInDom(root, id, Boolean(expandActive && String(id) === active));
  });
}

/** Sincroniza los formularios de alta de Gestión humana: solo uno abierto. */
export function syncPayrollCreatePanelsInDom(root, activePanelId, { expandActive = true } = {}) {
  syncModuleCreatePanelsInDom(root, PAYROLL_OPERATE_CREATE_PANEL_IDS, activePanelId, { expandActive });
}

/** Sincroniza los formularios de alta de Contratación: solo uno abierto. */
export function syncHiringCreatePanelsInDom(root, activePanelId, { expandActive = true } = {}) {
  syncModuleCreatePanelsInDom(root, HIRING_OPERATE_CREATE_PANEL_IDS, activePanelId, { expandActive });
}

/** Sincroniza los formularios de alta de Camiones: solo uno abierto. */
export function syncVehiclesCreatePanelsInDom(root, activePanelId, { expandActive = true } = {}) {
  syncModuleCreatePanelsInDom(root, VEHICLES_OPERATE_CREATE_PANEL_IDS, activePanelId, { expandActive });
}

/** Sincroniza los formularios de alta de Viajes: solo uno abierto. */
export function syncTransportTripsCreatePanelsInDom(root, activePanelId, { expandActive = true } = {}) {
  syncModuleCreatePanelsInDom(root, TRANSPORT_TRIPS_OPERATE_CREATE_PANEL_IDS, activePanelId, { expandActive });
}
