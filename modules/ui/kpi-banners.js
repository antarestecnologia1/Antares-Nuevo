/**
 * Banners de resumen (KPI) de los módulos.
 *
 * Todos los módulos muestran una franja de indicadores con marcas distintas (fleet-hero-metric,
 * ag-kpi, hist-trace-kpi, doc-kpi, sst-status-card…). Este módulo les da un estilo único
 * (styles/unified-cards.css): el primer cuadro en azul marino y los demás con un icono circular
 * de color según el indicador. No toca los datos ni los eventos: solo marca la franja
 * (`kpi-banner`), cada cuadro (`kpi-tile`, `data-kpi-tone`, `data-kpi-lead`) y agrega el icono.
 */

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

/** Iconos Lucide usados por los indicadores. */
export const KPI_ICONS = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  userCheck: '<path d="m16 11 2 2 4-4"/><path d="M16 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  calendarCheck: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  dollar: '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  snow: '<path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="M2 12h20"/><path d="m19.07 4.93-14.14 14.14"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="M4.929 4.929 19.07 19.071"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  trash: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'
};

/** Palabras del indicador → icono y color. El orden importa: gana la primera coincidencia. */
export const KPI_RULES = [
  [/no disponible|inactiv|bloquead|desvincul/, "ban", "amber"],
  [/docs?\.? riesgo|riesgo|vencid|cr[ií]tic|expirad/, "alert", "red"],
  [/por vencer|por revisar|pendient|sin leer|vence/, "clock", "amber"],
  [/eliminaci/, "trash", "red"],
  [/disponible|al d[ií]a|cumplid|vigente|le[ií]d/, "check", "green"],
  [/termoking|fr[ií]o/, "snow", "blue"],
  [/ocupad|tr[aá]nsito|en ruta|viaje|ruta|despacho|solicitud/, "route", "violet"],
  [/reservad|entrevista|calendario|evento/, "calendarCheck", "violet"],
  [/ausenc|incapac|novedad/, "calendar", "violet"],
  [/n[oó]mina|liquidaci|pago|salari|tarifa|cr[eé]dito/, "dollar", "blue"],
  [/legal|sst|cumplimiento|seguridad|2fa/, "shield", "blue"],
  [/vacante|contrataci|contrato|candidat|postulaci/, "briefcase", "violet"],
  [/conversi|crecimiento|tendencia/, "trend", "green"],
  [/creaci/, "plus", "green"],
  [/actualizaci/, "pencil", "blue"],
  [/m[oó]dulo/, "grid", "blue"],
  [/almacen/, "database", "violet"],
  [/carpeta/, "folder", "blue"],
  [/documento|docs?\b|archivo/, "file", "green"],
  [/lead|prospecto|contacto|correo/, "mail", "blue"],
  [/notific|aviso|alerta/, "bell", "blue"],
  [/flota|camion|veh[ií]culo/, "truck", "blue"],
  [/usuario|empresa/, "users", "amber"],
  [/total|equipo|empleado|colaborador|conductor|activo|proceso|personal|aprobad|autoriz/, "users", "blue"]
];

const TONE_CYCLE = ["blue", "green", "violet", "amber", "red", "blue"];

/** Franjas conocidas (contenedor) y de dónde sale el texto del indicador. */
export const KPI_STRIP_SELECTOR = [
  ".fleet-hero-metrics",
  ".ag-fleet__kpis",
  ".hist-trace-kpis",
  ".payroll-studio-kpis",
  ".hiring-studio-kpis",
  ".doc-kpi-grid",
  ".sst-status-cards",
  ".payroll-section-cards",
  ".ntf-studio-head__metrics"
].join(", ");

const LABEL_SELECTORS = ["dt", "[class*='__label']", "[class$='-label']", ":scope > span"];
const OWN_ICON_SELECTOR = ".hist-trace-kpi__icon, .doc-kpi__icon, .sst-status-card__ico, .payroll-section-card__ico";

/** Devuelve [icono, tono] para el texto de un indicador (pura; se prueba sin DOM). */
export function kpiFor(label, index = 0, stateTone = "") {
  const text = String(label || "").toLocaleLowerCase("es");
  for (const [re, icon, tone] of KPI_RULES) {
    if (re.test(text)) return { icon, tone: stateTone || tone };
  }
  return { icon: "chart", tone: stateTone || TONE_CYCLE[index % TONE_CYCLE.length] };
}

function toneFromClasses(el) {
  const cls = String(el.className || "");
  if (/--(?:alert|expired|danger|late)\b/.test(cls)) return "red";
  if (/--(?:warn|warning)\b/.test(cls)) return "amber";
  if (/\bag-kpi--ok\b/.test(cls)) return "green";
  return "";
}

function svg(name) {
  const inner = KPI_ICONS[name] || KPI_ICONS.chart;
  return `<svg ${SVG_ATTRS}>${inner}</svg>`;
}

function labelOf(tile) {
  for (const sel of LABEL_SELECTORS) {
    const el = tile.querySelector(sel);
    const text = (el?.textContent || "").trim();
    if (text) return text;
  }
  return (tile.getAttribute("title") || "").trim();
}

function decorateTile(tile, index, lead) {
  if (tile.dataset.kpiDone === "1") return;
  const { icon, tone } = kpiFor(labelOf(tile), index, toneFromClasses(tile));
  tile.dataset.kpiDone = "1";
  tile.classList.add("kpi-tile");
  tile.dataset.kpiTone = tone;
  if (lead) tile.dataset.kpiLead = "1";
  const own = tile.querySelector(OWN_ICON_SELECTOR);
  let ghostSvg;
  if (own) {
    own.classList.add("kpi-ico");
    ghostSvg = own.querySelector("svg")?.outerHTML || svg(icon);
  } else {
    const ico = document.createElement("span");
    ico.className = "kpi-ico";
    ico.setAttribute("aria-hidden", "true");
    ico.innerHTML = svg(icon);
    tile.prepend(ico);
    ghostSvg = svg(icon);
  }
  const ghost = document.createElement("span");
  ghost.className = "kpi-ghost";
  ghost.setAttribute("aria-hidden", "true");
  ghost.innerHTML = ghostSvg;
  tile.append(ghost);
}

/** Decora las franjas de indicadores que haya dentro de `root` (idempotente). */
export function decorateKpiBanners(root) {
  const base = root || (typeof document !== "undefined" ? document : null);
  if (!base) return 0;
  const strips = [];
  if (base.nodeType === 1 && base.matches?.(KPI_STRIP_SELECTOR)) strips.push(base);
  base.querySelectorAll?.(KPI_STRIP_SELECTOR).forEach((s) => strips.push(s));
  if (base.nodeType === 1 && !strips.length) {
    const parent = base.closest?.(KPI_STRIP_SELECTOR);
    if (parent) strips.push(parent);
  }
  let n = 0;
  strips.forEach((strip) => {
    strip.classList.add("kpi-banner");
    // Si la franja tiene una pestaña activa (p. ej. Empleados/Ausencias/Nómina), esa es la azul marino.
    const hasActive = !!strip.querySelector(":scope > .is-active, :scope > [aria-selected='true']");
    [...strip.children].forEach((tile, i) => {
      if (tile.nodeType === 1 && !tile.classList.contains("kpi-ghost")) {
        decorateTile(tile, i, !hasActive && i === 0);
        n++;
      }
    });
  });
  return n;
}

/** Los teléfonos de las tarjetas se ven como "Llamar": el número queda en el tooltip. */
const PHONE_SELECTOR = ".ag-pass__foot a.ag-pass__phone, .hr-cred__foot a.hr-cred__tel, .adm-badge__foot a.adm-badge__tel";

export function labelCardPhones(root) {
  const base = root || (typeof document !== "undefined" ? document : null);
  if (!base?.querySelectorAll) return 0;
  let n = 0;
  const apply = (a) => {
    if (a.dataset.phoneLabeled === "1") return;
    const number = (a.textContent || "").trim();
    if (!number) return;
    a.dataset.phoneLabeled = "1";
    a.title = `Llamar ${number}`;
    a.setAttribute("aria-label", `Llamar ${number}`);
    n++;
  };
  if (base.nodeType === 1 && base.matches?.(PHONE_SELECTOR)) apply(base);
  base.querySelectorAll(PHONE_SELECTOR).forEach(apply);
  return n;
}

let installed = false;

/** Observa el documento: toda franja o tarjeta nueva (o repintada) queda con el estilo único. */
export function installKpiBanners() {
  if (installed || typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  installed = true;
  const run = (node) => {
    decorateKpiBanners(node);
    labelCardPhones(node);
  };
  run(document.body);
  new MutationObserver((records) => {
    for (const rec of records) {
      rec.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && !node.classList?.contains("kpi-ico") && !node.classList?.contains("kpi-ghost")) run(node);
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
  if (typeof window !== "undefined") window.AntaresKpiBanners = { decorateKpiBanners, kpiFor };
}
