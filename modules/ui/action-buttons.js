/**
 * Sistema de botones de acción · Portal Antares
 * ---------------------------------------------------------------------------
 * Una sola familia de botones para todo el portal (estilo «píldora»: degradado suave,
 * brillo superior y sombra del mismo color):
 *   · 12 acciones con color propio (aceptar, cancelar, eliminar, guardar, editar,
 *     nuevo, buscar/consultar, regresar, descargar, imprimir, enviar, cerrar),
 *     más acciones neutras (compartir, copiar enlace, marcador) y de aviso
 *     (éxito, información, advertencia, error).
 *   · 4 variantes por acción: primary (relleno), outline (borde), ghost (sin fondo)
 *     y soft (fondo tenue).
 *   · Estados: normal, hover, clic (active), deshabilitado y cargando (aria-busy).
 *   · Íconos Lucide (https://lucide.dev, licencia ISC) incrustados: sin CDN.
 *
 * Uso en plantillas nuevas:
 *     actionButton({ action: "guardar", type: "submit", variant: "primary" })
 *     actionButton({ action: "eliminar", variant: "outline", size: "sm",
 *                    dataAction: "delete-trip", data: { id: trip.id },
 *                    confirm: { title: "Eliminar viaje", message: "…" } })
 *
 * Los botones heredados (clases .btn, .doc-btn, .trip-ops-card-btn…) se adoptan
 * solos: `installActionButtons()` los clasifica por data-action, id, clases y
 * texto, y les aplica esta misma familia. Estilos en styles/action-buttons.css.
 *
 * Reglas de seguridad integradas:
 *   · Eliminar con `confirm` pide confirmación antes de ejecutar la acción.
 *   · Cancelar/Cerrar en un formulario con cambios pendientes avisa antes de
 *     descartarlos (`formIsDirty`).
 * Sin dependencias del DOM al importar (se puede cargar desde Node para pruebas).
 */

const LUCIDE = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  circleCheck: '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  circleX: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="M4.929 4.929 19.07 19.071"/>',
  trash: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  circleAlert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  undo: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'};

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

/** SVG de Lucide listo para insertar (hereda el color con currentColor). */
export function lucideIcon(name, extraClass = "") {
  const inner = LUCIDE[name];
  if (!inner) return "";
  const cls = `ab__icon${extraClass ? ` ${extraClass}` : ""}`;
  return `<svg class="${cls}" data-ab-icon="${name}" ${SVG_ATTRS}>${inner}</svg>`;
}

/** Tonos de color (uno por familia de acción). `neutral` es el tono de reserva. */
export const ACTION_TONES = Object.freeze([
  "aceptar",
  "cancelar",
  "eliminar",
  "guardar",
  "editar",
  "nuevo",
  "buscar",
  "regresar",
  "descargar",
  "imprimir",
  "enviar",
  "cerrar",
  "neutral",
  "exito",
  "info",
  "aviso",
  "error"
]);

/** primary = relleno · outline = borde · ghost = sin fondo · soft = fondo tenue. */
export const ACTION_BUTTON_VARIANTS = Object.freeze(["primary", "outline", "ghost", "soft"]);

/**
 * Catálogo de acciones. `anular` y `rechazar` comparten el rojo de «eliminar»
 * pero no piden la confirmación de borrado (su flujo ya pide motivo/confirmación).
 */
export const ACTION_BUTTONS = Object.freeze({
  aceptar: { label: "Aceptar", icon: "circleCheck", tone: "aceptar" },
  confirmar: { label: "Confirmar", icon: "circleCheck", tone: "aceptar" },
  cancelar: { label: "Cancelar", icon: "x", tone: "cancelar" },
  eliminar: { label: "Eliminar", icon: "trash", tone: "eliminar" },
  anular: { label: "Anular", icon: "ban", tone: "eliminar" },
  rechazar: { label: "Rechazar", icon: "circleX", tone: "eliminar" },
  guardar: { label: "Guardar", icon: "save", tone: "guardar" },
  editar: { label: "Editar", icon: "pencil", tone: "editar" },
  nuevo: { label: "Nuevo", icon: "plus", tone: "nuevo" },
  buscar: { label: "Buscar", icon: "search", tone: "buscar" },
  consultar: { label: "Consultar", icon: "eye", tone: "buscar" },
  regresar: { label: "Regresar", icon: "arrowLeft", tone: "regresar" },
  descargar: { label: "Descargar", icon: "download", tone: "descargar" },
  imprimir: { label: "Imprimir", icon: "printer", tone: "imprimir" },
  enviar: { label: "Enviar", icon: "send", tone: "enviar" },
  cerrar: { label: "Cerrar", icon: "x", tone: "cerrar" },
  compartir: { label: "Compartir", icon: "share", tone: "neutral" },
  copiar: { label: "Copiar enlace", icon: "link", tone: "neutral" },
  marcador: { label: "Guardar", icon: "bookmark", tone: "neutral" },
  exito: { label: "Éxito", icon: "circleCheck", tone: "exito" },
  info: { label: "Información", icon: "info", tone: "info" },
  aviso: { label: "Advertencia", icon: "alert", tone: "aviso" },
  error: { label: "Error", icon: "circleX", tone: "error" }
});

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const DEFAULT_DELETE_CONFIRM = Object.freeze({
  title: "¿Eliminar este registro?",
  message: "Esta acción no se puede deshacer.",
  confirmText: "Sí, eliminar",
  cancelText: "Cancelar"
});

/**
 * Genera el HTML de un botón de la familia.
 * @param {object} o
 * @param {string} o.action        clave de ACTION_BUTTONS
 * @param {"primary"|"outline"|"ghost"|"soft"} [o.variant="primary"]
 * @param {"md"|"sm"} [o.size="md"]
 * @param {string} [o.tone]        color distinto al de la acción (ej. «neutral» para un «Imprimir» gris)
 * @param {string} [o.label]       texto (por defecto el de la acción)
 * @param {string|false} [o.icon]  clave Lucide, SVG propio o false para ocultar
 * @param {boolean} [o.iconOnly]   solo ícono (usa aria-label)
 * @param {string} [o.type="button"]
 * @param {string} [o.id] [o.dataAction] [o.title] [o.ariaLabel] [o.className] [o.href]
 * @param {object} [o.data]        data-* (ej. { id: "123" })
 * @param {object} [o.attrs]       atributos extra
 * @param {boolean} [o.disabled] [o.loading] [o.block]
 * @param {object|false} [o.confirm] confirmación previa (por defecto en «eliminar»)
 */
export function actionButton(o = {}) {
  const def = ACTION_BUTTONS[o.action] || { label: "", icon: "", tone: "neutral" };
  const variant = ACTION_BUTTON_VARIANTS.includes(o.variant) ? o.variant : "primary";
  const tone = ACTION_TONES.includes(o.tone) ? o.tone : def.tone;
  const small = o.size === "sm";
  const iconOnly = Boolean(o.iconOnly);
  const label = iconOnly ? "" : String(o.label ?? def.label);
  let iconHtml = "";
  if (o.icon !== false) {
    const k = typeof o.icon === "string" && o.icon ? o.icon : def.icon;
    iconHtml = LUCIDE[k] ? lucideIcon(k) : String(k || "").trim().startsWith("<svg") ? String(k) : "";
  }
  const classes = [
    "btn",
    "ab",
    `ab--${tone}`,
    `ab--${variant}`,
    small ? "ab--sm" : "",
    iconOnly ? "ab--icon" : "",
    o.block ? "ab--block" : "",
    o.loading ? "is-loading" : "",
    o.className || ""
  ]
    .filter(Boolean)
    .join(" ");
  const a = [];
  const push = (k, v) => {
    if (v === undefined || v === null || v === false || v === "") return;
    a.push(v === true ? k : `${k}="${esc(v)}"`);
  };
  push("class", classes);
  push("id", o.id);
  push("data-ab-action", o.action || "");
  push("data-action", o.dataAction);
  Object.entries(o.data || {}).forEach(([k, v]) => push(`data-${String(k).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, v));
  Object.entries(o.attrs || {}).forEach(([k, v]) => push(k, v));
  const tip = o.title ?? (iconOnly ? def.label : "");
  push("title", tip);
  if (iconOnly) push("aria-label", o.ariaLabel || o.title || def.label);
  if (o.loading) {
    push("aria-busy", "true");
    push("disabled", true);
  } else if (o.disabled) push("disabled", true);
  const needsConfirm = o.confirm !== false && (o.confirm || o.action === "eliminar");
  if (needsConfirm) {
    const c = { ...DEFAULT_DELETE_CONFIRM, ...(typeof o.confirm === "object" ? o.confirm : {}) };
    push("data-ab-confirm", "1");
    push("data-ab-confirm-title", c.title);
    push("data-ab-confirm-message", c.message);
    push("data-ab-confirm-text", c.confirmText);
    push("data-ab-confirm-cancel", c.cancelText);
  }
  const inner = `${iconHtml}${label ? `<span class="ab__label">${esc(label)}</span>` : ""}`;
  if (o.href) {
    push("href", o.href);
    return `<a ${a.join(" ")}>${inner}</a>`;
  }
  push("type", o.type === "submit" || o.type === "reset" ? o.type : "button");
  return `<button ${a.join(" ")}>${inner}</button>`;
}

/** Fila de botones con separación, alineación y apilado en móvil. */
export function actionGroup(buttonsHtml, { align = "end", stack = true, className = "" } = {}) {
  const list = (Array.isArray(buttonsHtml) ? buttonsHtml : [buttonsHtml]).filter(Boolean).join("");
  return `<div class="ab-group ab-group--${align === "start" ? "start" : align === "between" ? "between" : "end"}${stack ? " ab-group--stack" : ""}${className ? ` ${esc(className)}` : ""}">${list}</div>`;
}

/* ───────────────────────── Clasificación de botones heredados ───────────────────────── */

const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/**
 * Controles que NO son acciones (pestañas, interruptores de vista, chips, paginación,
 * tarjetas-filtro…): se dejan con su estilo propio. Se evalúa clase por clase.
 */
const NOT_ACTION_TOKEN =
  /(^|[-_])(tab|tabs|toggle|seg|chip|pill|pager|page|swatch|day|cell|avatar|lang|theme|sidebar|hamburger|nav|menu|more|layout|milestone|crumb|sort|link)([-_]|$)/;
const NOT_ACTION_CARD = /(^|[-_])card([-_]|$)/;
const NOT_ACTION_DATA_ACTION = /(^|-)(layout|tab|tabs|mode|preset|quick-status)(-|$)|-view$|^view-toggle|^cal-view|^doc-view$/;
const isNotActionClass = (cls) =>
  String(cls || "")
    .split(/\s+/)
    .filter(Boolean)
    .some((t) => NOT_ACTION_TOKEN.test(t) || (NOT_ACTION_CARD.test(t) && !/btn/.test(t)));
const NOT_ACTION_CONTAINER =
  ".transport-ops-layout, [role='tablist'], .hr-workspace-tabs, .portal-sidebar, .auth-modal, #auth-modal, .landing, .public-nav, nav, .pagination, [data-ab='off'], .ab-off";

const GUARDED_DISMISS_ACTIONS = /^(cancel-create-panel|cancel-admin-create-panel|close-edit-user|close-edit-company)$/;

/** Reglas ordenadas: gana la primera que coincide. s = { da, id, cls, text, label, type } */
const RULES = [
  ["cerrar", (s) => /(^|-)close(-|$)/.test(s.da) || /(^|-)close(-|$)/.test(s.id) || /--close\b|modal-close|drawer-close|-close-btn/.test(s.cls) || /^cerrar\b/.test(s.text) || /^cerrar\b/.test(s.label)],
  ["regresar", (s) => /(^|-)back(-|$)/.test(s.da) || /(^|-)back(-|$)/.test(s.id) || /^(regresar|volver|atras)\b/.test(s.text) || /^(regresar|volver|atras)\b/.test(s.label)],
  [
    "cancelar",
    (s) =>
      /^crud-cancel$/.test(s.id) ||
      /--cancel\b|btn-cancel\b/.test(s.cls) ||
      /^(cancel-create|cancel-admin|cancel-edit|cancel-form|cancel-panel|cancel-modal|reset-|payroll-legal-reset|clear-form)/.test(s.da) ||
      /^(cancelar|descartar|limpiar formulario|restablecer|seguir editando)( cambios| edicion| creacion| registro| formulario| accion| operacion)?$/.test(s.text) ||
      /^(quitar seleccion|limpiar( filtros?| seleccion| busqueda)?|borrar filtros?|quitar filtros?)\b/.test(s.text)
  ],
  [
    "eliminar",
    (s) =>
      (/(^|-)(delete|remove|unlink|purge)(-|$)/.test(s.da) && !/toggle|^deleted-|snapshot/.test(s.da)) ||
      /btn-danger(?!-soft)|--danger\b/.test(s.cls) ||
      /^(eliminar|borrar|desvincular|retirar|vaciar)\b/.test(s.text) ||
      /^(eliminar|borrar|desvincular)\b/.test(s.label)
  ],
  ["rechazar", (s) => /(^|-)(reject|decline|deny)(-|$)/.test(s.da) || /btn-reject\b/.test(s.cls) || /^rechazar\b/.test(s.text) || /^rechazar\b/.test(s.label)],
  ["anular", (s) => /^cancel-/.test(s.da) || /^(cancelar|anular)\s+\S+/.test(s.text) || /^(cancelar|anular)\b/.test(s.label)],
  ["consultar", (s) => /^(vista previa|previsualizar)\b/.test(s.text)],
  ["descargar", (s) => /^(pdf|excel|csv|xlsx|word)( \(\d+\))?$/.test(s.text)],
  ["aceptar", (s) => /(^|-)(approve|accept)(-|$)/.test(s.da) || /btn-approve\b/.test(s.cls) || /^(aprobar|aceptar|autorizar)\b/.test(s.text) || /^(aprobar|aceptar|autorizar)\b/.test(s.label)],
  ["confirmar", (s) => /^crud-confirm$/.test(s.id) || /(^|-)confirm(-|$)/.test(s.da) || /^(si, )?confirmar\b/.test(s.text)],
  ["enviar", (s) => /(^|-)(send|resend)(-|$)/.test(s.da) || /^(enviar|reenviar)\b/.test(s.text) || /^(enviar|reenviar)\b/.test(s.label)],
  ["imprimir", (s) => /(^|-)print(-|$)/.test(s.da) || /(^|-)print(-|$)/.test(s.cls) || /^imprimir\b/.test(s.text) || /^imprimir\b/.test(s.label)],
  [
    "descargar",
    (s) =>
      /(^|-)(download|export)(-|$)/.test(s.da) ||
      /download|export-btn/.test(s.cls) ||
      /^(descargar|exportar)\b/.test(s.text) ||
      /^(descargar|exportar)\b/.test(s.label)
  ],
  ["guardar", (s) => /(^|-)(save)(-|$)/.test(s.da) || /^(guardar|actualizar|aplicar cambios|guardando)\b/.test(s.text) || /^guardar\b/.test(s.label)],
  [
    "editar",
    (s) =>
      /^(edit|open-edit|modify)(-|$)/.test(s.da) ||
      /(^|-)edit-/.test(s.da) ||
      /(^|-)edit(-|$)/.test(s.cls) ||
      /^(editar|modificar)\b/.test(s.text) ||
      /^(editar|modificar)\b/.test(s.label)
  ],
  [
    "nuevo",
    (s) =>
      /(^|-)(new|add|create)(-|$)/.test(s.da) ||
      /^(nuevo|nueva|crear|agregar|anadir|adicionar|registrar)\b/.test(s.text) ||
      /^(nuevo|nueva|crear|agregar|anadir|registrar)\b/.test(s.label)
  ],
  [
    "consultar",
    (s) =>
      (/^view-[a-z-]+$/.test(s.da) && !/-view$/.test(s.da)) ||
      /^(trip-detail|detail|view-detail|solicitud-trip-open|open-detail)$/.test(s.da) ||
      /^(ver|consultar|abrir|detalle)\b/.test(s.text) ||
      /^(ver|consultar|abrir|detalle)\b/.test(s.label)
  ],
  ["buscar", (s) => /(^|-)search(-|$)/.test(s.da) || /^(buscar|filtrar|aplicar filtros?)\b/.test(s.text) || /^(buscar)\b/.test(s.label)]
];

function visibleText(el) {
  let t = "";
  el.childNodes.forEach((n) => {
    if (n.nodeType === 3) t += n.textContent;
    else if (n.nodeType === 1 && n.tagName !== "SVG" && !/count|badge/.test(String(n.className || ""))) t += n.textContent;
  });
  return t;
}

/**
 * Devuelve { action, tone, variant, small, iconOnly } para un botón heredado,
 * o null si debe quedar intacto (controles de vista, pestañas, chips, etc.).
 */
export function classifyActionButton(el) {
  if (!el || el.nodeType !== 1) return null;
  const cls = String(el.getAttribute("class") || "");
  if (el.hasAttribute("data-ab") && el.getAttribute("data-ab") === "off") return null;
  if (el.closest?.(NOT_ACTION_CONTAINER)) return null;
  if (isNotActionClass(norm(cls))) return null;
  if (el.hasAttribute("aria-pressed") || el.hasAttribute("aria-selected") || el.hasAttribute("aria-current")) return null;
  if (NOT_ACTION_DATA_ACTION.test(norm(el.getAttribute("data-action")))) return null;
  if (el.querySelector?.("img, input, select, textarea")) return null;
  const rawText = norm(visibleText(el)).replace(/^si,\s*/, "");
  const s = {
    da: norm(el.getAttribute("data-action")),
    id: norm(el.id),
    cls: norm(cls),
    text: rawText,
    label: norm(el.getAttribute("aria-label") || el.getAttribute("title")),
    type: norm(el.getAttribute("type"))
  };
  let action = "";
  const isFold = /--minimi[sz]e\b|--collapse\b/.test(s.cls) || /^(minimizar|contraer|ocultar|expandir|mostrar mas|mostrar menos)\b/.test(s.text);
  if (!isFold) {
    for (const [name, test] of RULES) {
      if (test(s)) {
        action = name;
        break;
      }
    }
  }
  const primaryLike = /btn-primary|btn-approve|(^|[-_])primary\b|--solid\b|btn-solid/.test(s.cls);
  const ghostLike = /ghost|btn-text|btn-link|--soft\b|--text\b|doc-iconbtn/.test(s.cls);
  if (!action && !/(^|[\s_-])btn([\s_-]|$|__)|-btn\b|btn-/.test(s.cls)) return null;
  const iconOnly = !rawText && Boolean(el.querySelector("svg"));
  let variant = primaryLike ? "primary" : ghostLike ? "ghost" : "outline";
  if (action === "cerrar" && iconOnly) variant = "ghost";
  const tone = action ? ACTION_BUTTONS[action].tone : primaryLike ? "guardar" : "neutral";
  const small = /(^|[\s_-])sm\b|btn-sm|--sm\b|trip-ops-card-btn|rq-btn|iconbtn|icon-btn|-icon-btn|ag-icon/.test(s.cls) || iconOnly;
  return { action: action || "", tone, variant, small, iconOnly };
}

/** Aplica la familia a un botón heredado (idempotente). */
export function applyActionButton(el) {
  if (!el || el.nodeType !== 1 || el.getAttribute("data-ab-done") === "1") return false;
  if (el.classList.contains("ab")) {
    el.setAttribute("data-ab-done", "1");
    return false;
  }
  const spec = classifyActionButton(el);
  if (!spec) {
    el.setAttribute("data-ab-done", "0");
    return false;
  }
  el.classList.add("ab", `ab--${spec.tone}`, `ab--${spec.variant}`);
  if (spec.small) el.classList.add("ab--sm");
  if (spec.iconOnly) el.classList.add("ab--icon");
  if (spec.action) el.setAttribute("data-ab-action", spec.action);
  el.setAttribute("data-ab-done", "1");
  if (spec.action) ensureIcon(el, ACTION_BUTTONS[spec.action].icon, spec.iconOnly);
  if (spec.iconOnly && !el.getAttribute("aria-label")) {
    const t = el.getAttribute("title") || (spec.action ? ACTION_BUTTONS[spec.action].label : "");
    if (t) el.setAttribute("aria-label", t);
  }
  return true;
}

/** Cambia el ícono principal por el de Lucide de la acción (o lo agrega si falta). */
function ensureIcon(el, iconKey, iconOnly) {
  if (!iconKey || !LUCIDE[iconKey]) return;
  const html = lucideIcon(iconKey);
  const existing = el.querySelector(":scope > svg, :scope > span:first-child > svg, :scope > .btn-icon");
  if (existing && existing.tagName.toLowerCase() === "svg") {
    if (existing.getAttribute("data-ab-icon") === iconKey) return;
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    existing.replaceWith(tpl.content.firstElementChild);
    return;
  }
  if (el.querySelector("svg")) return; // ícono propio en estructura compleja: se respeta
  if (!iconOnly && !visibleText(el).trim()) return;
  el.insertAdjacentHTML("afterbegin", html);
}

const CANDIDATE_SELECTOR =
  "button.btn, a.btn, button[class*='-btn'], button[class*='btn-'], a[class*='-btn'], a[class*='btn-'], [role='button'][class*='btn'], button[data-action]";

/** Adopta todos los botones heredados dentro de `root`. */
export function enhanceActionButtons(root) {
  const base = root || (typeof document !== "undefined" ? document : null);
  if (!base) return 0;
  let n = 0;
  if (base.nodeType === 1 && base.matches?.(CANDIDATE_SELECTOR) && applyActionButton(base)) n++;
  base.querySelectorAll?.(CANDIDATE_SELECTOR).forEach((el) => {
    if (el.getAttribute("data-ab-done") === "1" || el.getAttribute("data-ab-done") === "0") return;
    if (applyActionButton(el)) n++;
  });
  return n;
}

/* ───────────────────────── Estado de carga ───────────────────────── */

/** Activa/desactiva el estado loading de un botón (spinner + bloqueo de clics). */
export function setButtonLoading(btn, on = true, { label } = {}) {
  if (!btn) return;
  if (on) {
    if (btn.getAttribute("aria-busy") === "true") return;
    btn.dataset.abPrevDisabled = btn.disabled ? "1" : "0";
    btn.setAttribute("aria-busy", "true");
    btn.classList.add("is-loading");
    btn.disabled = true;
    if (label) {
      const l = btn.querySelector(".ab__label");
      if (l) {
        btn.dataset.abPrevLabel = l.textContent || "";
        l.textContent = label;
      }
    }
    return;
  }
  btn.removeAttribute("aria-busy");
  btn.classList.remove("is-loading");
  const l = btn.querySelector(".ab__label");
  if (l && btn.dataset.abPrevLabel !== undefined) {
    l.textContent = btn.dataset.abPrevLabel;
    delete btn.dataset.abPrevLabel;
  }
  btn.disabled = btn.dataset.abPrevDisabled === "1";
  delete btn.dataset.abPrevDisabled;
}

/** Ejecuta `fn` con el botón en loading y lo libera siempre al terminar. */
export async function withButtonLoading(btn, fn, opts = {}) {
  if (!btn || btn.getAttribute("aria-busy") === "true") return undefined;
  setButtonLoading(btn, true, opts);
  try {
    return await fn();
  } finally {
    setButtonLoading(btn, false);
  }
}

/* ───────────────────────── Confirmaciones ───────────────────────── */

/**
 * Diálogo de confirmación propio (capa independiente de #crud-modal: puede abrirse
 * encima de un formulario sin destruirlo). Devuelve Promise<boolean>.
 * El foco inicial cae en la opción segura (cancelar) cuando la acción es destructiva.
 */
export function openActionConfirm(opts = {}) {
  const {
    title = "¿Confirmar acción?",
    message = "",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    tone = "eliminar",
    icon
  } = opts;
  if (typeof document === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const prev = document.activeElement;
    const uid = `abc${Math.random().toString(36).slice(2, 8)}`;
    const destructive = tone === "eliminar";
    const layer = document.createElement("div");
    layer.className = "ab-confirm";
    layer.setAttribute("role", "alertdialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-labelledby", `${uid}-t`);
    layer.setAttribute("aria-describedby", `${uid}-m`);
    layer.innerHTML = `<div class="ab-confirm__card ab-confirm__card--${esc(tone)}">
      ${actionButton({ action: "cerrar", variant: "ghost", size: "sm", iconOnly: true, className: "ab-confirm__x", attrs: { "data-ab-role": "cancel", tabindex: "-1" } })}
      <div class="ab-confirm__icon" aria-hidden="true">${lucideIcon(destructive ? "circleAlert" : "info")}</div>
      <div class="ab-confirm__body">
        <h2 class="ab-confirm__title" id="${uid}-t">${esc(title)}</h2>
        ${message ? `<p class="ab-confirm__message" id="${uid}-m">${esc(message)}</p>` : ""}
      </div>
      <div class="ab-confirm__actions">
        ${actionButton({ action: "cancelar", variant: "soft", label: cancelText, icon: false, attrs: { "data-ab-role": "cancel" } })}
        ${actionButton({ action: destructive ? "eliminar" : tone, variant: "primary", label: confirmText, icon: icon || (destructive ? "trash" : undefined), confirm: false, attrs: { "data-ab-role": "confirm" } })}
      </div>
    </div>`;
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      document.removeEventListener("keydown", onKey, true);
      layer.classList.add("is-leaving");
      setTimeout(() => layer.remove(), 120);
      try {
        if (prev && typeof prev.focus === "function" && document.contains(prev)) prev.focus({ preventScroll: true });
      } catch (_e) {}
      resolve(Boolean(value));
    };
    const cancelBtn = () => layer.querySelector(".ab-confirm__actions [data-ab-role='cancel']");
    const okBtn = () => layer.querySelector("[data-ab-role='confirm']");
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        finish(false);
      } else if (e.key === "Tab") {
        const items = [cancelBtn(), okBtn()].filter(Boolean);
        const i = items.indexOf(document.activeElement);
        e.preventDefault();
        const next = e.shiftKey ? items[(i <= 0 ? items.length : i) - 1] : items[(i + 1) % items.length];
        next?.focus();
      }
    }
    layer.addEventListener("click", (e) => {
      if (e.target === layer) finish(false);
      const role = e.target.closest?.("[data-ab-role]")?.getAttribute("data-ab-role");
      if (role === "cancel") finish(false);
      if (role === "confirm") finish(true);
    });
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(layer);
    requestAnimationFrame(() => {
      layer.classList.add("is-open");
      (destructive ? cancelBtn() : okBtn())?.focus({ preventScroll: true });
    });
  });
}

/* ───────────────────────── Cambios pendientes ───────────────────────── */

/**
 * ¿Tiene el formulario cambios sin guardar? Compara contra los valores por defecto
 * del HTML y exige que la persona haya tocado algún campo (así los valores que la
 * pantalla precarga por código no cuentan como «cambios»).
 */
export function formIsDirty(form) {
  if (!form || form.__abTouched !== true) return false;
  const fields = [...form.querySelectorAll("input, select, textarea")];
  return fields.some((f) => {
    if (f.disabled) return false;
    const tag = f.tagName.toLowerCase();
    const type = String(f.type || "").toLowerCase();
    if (type === "hidden" || type === "button" || type === "submit" || type === "reset") return false;
    if (type === "file") return Boolean(f.files && f.files.length);
    if (type === "checkbox" || type === "radio") return f.checked !== f.defaultChecked;
    if (tag === "select") {
      const opts = [...f.options];
      let def = opts.findIndex((o) => o.defaultSelected);
      if (def < 0) def = f.multiple ? -1 : 0;
      return f.multiple ? opts.some((o) => o.selected !== o.defaultSelected) : f.selectedIndex !== def;
    }
    return String(f.value || "") !== String(f.defaultValue || "");
  });
}

function dirtyFormFor(btn) {
  const form = btn.closest("form");
  if (form) return formIsDirty(form) ? form : null;
  const modal = btn.closest(".modal");
  if (!modal) return null;
  return [...modal.querySelectorAll("form")].find((f) => formIsDirty(f)) || null;
}

function dismissKind(btn) {
  if (!btn || btn.closest(".ab-confirm")) return false;
  const act = btn.getAttribute("data-ab-action");
  if (act !== "cancelar" && act !== "cerrar") return false;
  if (GUARDED_DISMISS_ACTIONS.test(btn.getAttribute("data-action") || "")) return false;
  return true;
}

export const DISCARD_CONFIRM = Object.freeze({
  title: "¿Descartar los cambios?",
  message: "Hay cambios sin guardar en este formulario. Si sale ahora, se perderán.",
  confirmText: "Sí, descartar",
  cancelText: "Seguir editando",
  tone: "eliminar",
  icon: "x"
});

/* ───────────────────────── Instalación global ───────────────────────── */

function readConfirmOpts(btn) {
  return {
    title: btn.getAttribute("data-ab-confirm-title") || DEFAULT_DELETE_CONFIRM.title,
    message: btn.getAttribute("data-ab-confirm-message") || DEFAULT_DELETE_CONFIRM.message,
    confirmText: btn.getAttribute("data-ab-confirm-text") || DEFAULT_DELETE_CONFIRM.confirmText,
    cancelText: btn.getAttribute("data-ab-confirm-cancel") || DEFAULT_DELETE_CONFIRM.cancelText,
    tone: "eliminar"
  };
}

function onGuardClick(event) {
  const t = event.target;
  if (!(t instanceof Element) || t.closest(".ab-confirm")) return;
  const btn = t.closest("button, a, [role='button']");
  if (btn) {
    if (btn.matches(".ab[aria-busy='true'], .ab.is-loading")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (btn.__abPass) {
      btn.__abPass = false;
      return;
    }
    if (btn.hasAttribute("data-ab-confirm")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      void openActionConfirm(readConfirmOpts(btn)).then((ok) => {
        if (!ok) return;
        btn.__abPass = true;
        btn.click();
      });
      return;
    }
    if (dismissKind(btn)) {
      const form = dirtyFormFor(btn);
      if (form) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void openActionConfirm(DISCARD_CONFIRM).then((ok) => {
          if (!ok) return;
          form.__abTouched = false;
          btn.__abPass = true;
          btn.click();
        });
      }
    }
    return;
  }
  // Clic en el fondo oscuro de un modal con cambios pendientes
  if (t.classList.contains("modal") && !t.__abPass) {
    const form = [...t.querySelectorAll("form")].find((f) => formIsDirty(f));
    if (!form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void openActionConfirm(DISCARD_CONFIRM).then((ok) => {
      if (!ok) return;
      form.__abTouched = false;
      // Se cierra por el botón de cierre del modal (respeta la pila de modales);
      // el listener de fondo de wireModalDismiss es de un solo uso y puede estar gastado.
      const closer = t.querySelector("#crud-close, #crud-cancel, [data-ab-action='cerrar'], [data-ab-action='cancelar']");
      if (closer) {
        closer.__abPass = true;
        closer.click();
      } else {
        t.__abPass = true;
        t.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        t.__abPass = false;
      }
    });
  }
}

function onFieldTouched(event) {
  if (!event.isTrusted) return;
  const form = event.target?.closest?.("form");
  if (form) form.__abTouched = true;
}

/** Instala observador de botones heredados + guardas de confirmación/cancelar. Idempotente. */
export function installActionButtons() {
  if (typeof document === "undefined" || typeof window === "undefined") return null;
  if (window.__antaresActionButtons) return window.__antaresActionButtons;
  document.addEventListener("click", onGuardClick, true);
  document.addEventListener("input", onFieldTouched, true);
  document.addEventListener("change", onFieldTouched, true);
  // El callback del observador corre como microtarea, antes del siguiente pintado:
  // los botones nuevos ya salen con la familia aplicada (sin parpadeo del estilo antiguo).
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1 && n.isConnected && !n.classList?.contains("ab-confirm")) enhanceActionButtons(n);
      });
    }
  });
  const start = () => {
    enhanceActionButtons(document);
    mo.observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
  const api = { actionButton, actionGroup, enhanceActionButtons, setButtonLoading, withButtonLoading, openActionConfirm, formIsDirty, lucideIcon, ACTION_BUTTONS };
  window.__antaresActionButtons = api;
  window.AntaresActionButtons = api;
  return api;
}
