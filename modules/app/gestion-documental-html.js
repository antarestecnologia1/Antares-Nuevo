/**
 * Gestión documental — capa de render.
 *
 * Solo produce HTML: no lee `state` ni almacenamiento, no liga eventos.
 * Todo lo que necesita llega en el `ctx` que arma `gestion-documental.js`,
 * siguiendo el precedente de `gestion-humana-html.js` pero con imports ES
 * en vez de globales.
 */
import { escapeHtml, escapeAttr } from "../core/utils.js";
import {
  DOCUMENT_SECTIONS,
  DOCUMENT_TABLE_COLUMNS,
  EMPLOYEE_DOCUMENT_TYPES,
  DEFAULT_EMPLOYEE_DOCUMENT_FOLDER,
  getEmployeeDocumentTypeLabel,
  normalizeDocumentFolder,
  documentFolderKey,
  formatFileSize,
  expectedDocumentTypesForEmployee,
  findEmployeeDocumentGaps,
  formatDocumentDate
} from "../domain/employee-documents.domain.js";

/* ==========================================================================
   Iconografía y primitivas
   ========================================================================== */

/** Iconos que no existen en `portal-icons.js` y solo usa este módulo. */
const SVG = {
  star: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  starFilled:
    '<svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  kebab:
    '<svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
  sortAsc:
    '<svg class="doc-sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 15 12 9 18 15"/></svg>',
  sortDesc:
    '<svg class="doc-sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
  sortNone:
    '<svg class="doc-sort-icon doc-sort-icon--idle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="7 10 12 5 17 10"/><polyline points="7 14 12 19 17 14"/></svg>'
};

let tooltipSeq = 0;

/**
 * Tooltip accesible: el texto vive en un nodo `role="tooltip"` referenciado por
 * `aria-describedby`, no en el atributo `title` nativo (que el lector de pantalla
 * lee de forma inconsistente y no se puede estilar).
 * Devuelve los atributos que hay que pegar al control y el nodo del globo.
 */
export function tooltip(text) {
  const label = String(text || "").trim();
  if (!label) return { attrs: "", node: "" };
  tooltipSeq += 1;
  const id = `doc-tip-${tooltipSeq}`;
  return {
    attrs: `aria-describedby="${id}" data-doc-tooltip`,
    node: `<span class="doc-tooltip" role="tooltip" id="${id}">${escapeHtml(label)}</span>`
  };
}

/** Botón icónico con tooltip accesible ya cableado. */
function iconButton({ action, id = "", icon = "", label, tone = "", extraAttrs = "", disabled = false }) {
  const tip = tooltip(label);
  return `<span class="doc-icon-btn-wrap">
    <button type="button" class="doc-icon-btn${tone ? ` doc-icon-btn--${tone}` : ""}" data-action="${escapeAttr(action)}"${id ? ` data-id="${escapeAttr(String(id))}"` : ""} aria-label="${escapeAttr(label)}" ${tip.attrs} ${extraAttrs}${disabled ? " disabled" : ""}>${icon}</button>
    ${tip.node}
  </span>`;
}

/**
 * Menú kebab. El `<ul role="menu">` se renderiza cerrado; `bindKebabMenus`
 * en el módulo principal se encarga de abrirlo y de la navegación con flechas.
 */
export function renderKebabMenu({ id, label = "Más acciones", items = [], align = "end" }) {
  const options = items.filter(Boolean);
  if (!options.length) return "";
  const menuId = `doc-menu-${escapeAttr(String(id))}`;
  return `<div class="doc-kebab" data-doc-kebab>
    <button type="button" class="doc-icon-btn doc-kebab__trigger" data-doc-kebab-trigger aria-haspopup="menu" aria-expanded="false" aria-controls="${menuId}" aria-label="${escapeAttr(label)}">${SVG.kebab}</button>
    <ul class="doc-kebab__menu doc-kebab__menu--${escapeAttr(align)}" id="${menuId}" role="menu" hidden>
      ${options
        .map((item) =>
          item.separator
            ? `<li class="doc-kebab__sep" role="separator"></li>`
            : `<li role="none"><button type="button" role="menuitem" class="doc-kebab__item${item.tone ? ` doc-kebab__item--${item.tone}` : ""}" data-action="${escapeAttr(item.action)}"${item.id ? ` data-id="${escapeAttr(String(item.id))}"` : ""}${item.data || ""}>${item.icon || ""}<span>${escapeHtml(item.label)}</span></button></li>`
        )
        .join("")}
    </ul>
  </div>`;
}

/** Skeletons: reservan la altura real de cada vista para que no salte el layout. */
export function renderSkeleton(kind = "table", count = 6) {
  const bar = (w) => `<span class="doc-skel__bar" style="--w:${w}"></span>`;
  if (kind === "cards") {
    return `<div class="doc-skel doc-skel--cards" aria-hidden="true">${Array.from({ length: count })
      .map(
        () =>
          `<div class="doc-skel__card"><span class="doc-skel__thumb"></span>${bar("70%")}${bar("45%")}${bar("85%")}</div>`
      )
      .join("")}</div>`;
  }
  if (kind === "drawer") {
    return `<div class="doc-skel doc-skel--drawer" aria-hidden="true">${bar("60%")}${bar("90%")}${bar("40%")}${bar("75%")}${bar("55%")}</div>`;
  }
  return `<div class="doc-skel doc-skel--table" aria-hidden="true">${Array.from({ length: count })
    .map(() => `<div class="doc-skel__row">${bar("28%")}${bar("20%")}${bar("14%")}${bar("12%")}${bar("10%")}</div>`)
    .join("")}</div>`;
}

/**
 * Estado vacío. `variant` cambia el tono: `empty` es un vacío legítimo,
 * `filtered` sugiere limpiar filtros, `error` es un fallo recuperable.
 */
export function renderEmptyState({
  title,
  hint = "",
  icon = "",
  variant = "empty",
  actions = []
} = {}) {
  const buttons = (actions || [])
    .filter(Boolean)
    .map(
      (a) =>
        `<button type="button" class="btn btn-sm ${a.primary ? "btn-primary" : "btn-outline"}" data-action="${escapeAttr(a.action)}"${a.data || ""}>${a.icon || ""}${escapeHtml(a.label)}</button>`
    )
    .join("");
  return `<div class="doc-state doc-state--${escapeAttr(variant)}" role="${variant === "error" ? "alert" : "status"}">
    <span class="doc-state__icon" aria-hidden="true">${icon}</span>
    <p class="doc-state__title">${escapeHtml(title || "Sin resultados")}</p>
    ${hint ? `<p class="doc-state__hint">${escapeHtml(hint)}</p>` : ""}
    ${buttons ? `<div class="doc-state__actions">${buttons}</div>` : ""}
  </div>`;
}

/** Barra "Ver más" del render por ventana (mismo patrón que viajes/solicitudes). */
function renderMoreBar(total, shown, IC) {
  if (total <= shown) return "";
  return `<div class="doc-more-bar">
    <button type="button" class="btn btn-sm btn-outline" data-action="doc-render-more">${IC.chevronDown || ""} Ver más · ${shown} de ${total}</button>
  </div>`;
}

/* ==========================================================================
   Piezas compartidas
   ========================================================================== */

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Badge de estado: icono + texto, nunca solo color (WCAG 1.4.1). */
function statusBadge(row) {
  const glyph = row.status === "Vencido" ? "!" : row.status === "Por vencer" ? "•" : "✓";
  return `<span class="doc-badge doc-badge--${escapeAttr(row.statusTone)}">
    <span class="doc-badge__glyph" aria-hidden="true">${glyph}</span>${escapeHtml(row.status)}
  </span>`;
}

function fileGlyph(row) {
  return `<span class="doc-glyph doc-glyph--${escapeAttr(row.mimeGroup)}" aria-hidden="true">${escapeHtml(row.extension)}</span>`;
}

function favoriteButton(row, ctx) {
  const on = ctx.favorites.has(String(row.id));
  const label = on ? `Quitar ${row.fileName} de favoritos` : `Marcar ${row.fileName} como favorito`;
  const tip = tooltip(on ? "Quitar de favoritos" : "Marcar como favorito");
  return `<span class="doc-icon-btn-wrap">
    <button type="button" class="doc-icon-btn doc-fav${on ? " is-on" : ""}" data-action="doc-toggle-favorite" data-id="${escapeAttr(String(row.id))}" aria-pressed="${on ? "true" : "false"}" aria-label="${escapeAttr(label)}" ${tip.attrs}>${on ? SVG.starFilled : SVG.star}</button>
    ${tip.node}
  </span>`;
}

/** Acciones por documento: las de uso frecuente sueltas, el resto en el kebab. */
function rowActions(row, ctx) {
  const { IC, perms } = ctx;
  const id = String(row.id);
  const quick = [
    row.canPreview
      ? iconButton({ action: "doc-preview", id, icon: IC.eye || "", label: "Vista previa" })
      : "",
    iconButton({ action: "doc-download", id, icon: IC.download || "", label: "Descargar" })
  ]
    .filter(Boolean)
    .join("");
  const menu = renderKebabMenu({
    id,
    label: `Más acciones para ${row.fileName}`,
    items: [
      { action: "doc-open-drawer", id, icon: IC.info || "", label: "Ver detalle" },
      { action: "doc-toggle-favorite", id, icon: SVG.star, label: ctx.favorites.has(id) ? "Quitar de favoritos" : "Añadir a favoritos" },
      { action: "doc-goto-file", id, icon: IC.folder || "", label: "Abrir expediente" },
      perms.edit ? { separator: true } : null,
      perms.edit ? { action: "doc-edit", id, icon: IC.edit || "", label: "Editar metadatos" } : null,
      perms.edit ? { action: "doc-move", id, icon: IC.layers || "", label: "Mover de carpeta" } : null,
      perms.del ? { separator: true } : null,
      perms.del ? { action: "doc-delete", id, icon: IC.trash || "", label: "Eliminar", tone: "danger" } : null
    ]
  });
  return `<div class="doc-row-actions">${quick}${menu}</div>`;
}

function selectionCheckbox(row, ctx) {
  const id = String(row.id);
  const checked = ctx.selection.has(id);
  return `<label class="doc-check">
    <input type="checkbox" data-action="doc-select-row" data-id="${escapeAttr(id)}"${checked ? " checked" : ""} aria-label="Seleccionar ${escapeAttr(row.fileName)}" />
    <span class="doc-check__box" aria-hidden="true"></span>
  </label>`;
}

/* ==========================================================================
   Rail de navegación
   ========================================================================== */

export function renderRail(ctx) {
  const { IC, ui, counts, quickAccess } = ctx;
  const iconFor = (key) => IC[key] || IC.file || "";
  const item = (section) => {
    const active = ui.section === section.id;
    const count = counts[section.id];
    const badge =
      Number.isFinite(count) && count > 0
        ? `<span class="doc-rail__count${section.id === "expired" ? " doc-rail__count--danger" : section.id === "due_soon" ? " doc-rail__count--warn" : ""}">${count}</span>`
        : "";
    return `<li>
      <button type="button" class="doc-rail__item${active ? " is-active" : ""}" data-action="doc-section" data-section="${escapeAttr(section.id)}"${active ? ' aria-current="page"' : ""}>
        <span class="doc-rail__icon" aria-hidden="true">${section.id === "favorites" ? SVG.star : iconFor(section.icon)}</span>
        <span class="doc-rail__label">${escapeHtml(section.label)}</span>
        ${badge}
      </button>
    </li>`;
  };

  const groups = [
    { label: "Panel", ids: ["overview"] },
    { label: "Documentos", ids: ["all", "recent", "favorites"] },
    { label: "Control de vigencia", ids: ["due_soon", "expired", "gaps"] },
    { label: "Navegación", ids: ["files"] }
  ];

  const quick = (quickAccess || []).length
    ? `<div class="doc-rail__quick">
        <p class="doc-rail__group-label" id="doc-rail-quick-label">Accesos rápidos</p>
        <ul class="doc-rail__quick-list" aria-labelledby="doc-rail-quick-label">
          ${quickAccess
            .map(
              (q) =>
                `<li><button type="button" class="doc-rail__quick-item" data-action="doc-quick-access" data-employee-id="${escapeAttr(q.employeeId)}" data-folder="${escapeAttr(q.folder || "")}">
                  <span class="doc-rail__quick-avatar" aria-hidden="true">${escapeHtml(initials(q.label))}</span>
                  <span class="doc-rail__quick-text">
                    <span class="doc-rail__quick-name">${escapeHtml(q.label)}</span>
                    ${q.folder ? `<span class="doc-rail__quick-sub">${escapeHtml(q.folder)}</span>` : ""}
                  </span>
                </button></li>`
            )
            .join("")}
        </ul>
      </div>`
    : "";

  return `<aside class="doc-rail" id="doc-rail" data-doc-rail${ui.railOpen ? ' data-open="1"' : ""}>
    <div class="doc-rail__scroll">
      <nav class="doc-rail__nav" aria-label="Secciones de Gestión documental">
        ${groups
          .map(
            (group) => `<div class="doc-rail__group">
          <p class="doc-rail__group-label">${escapeHtml(group.label)}</p>
          <ul class="doc-rail__list">${group.ids
            .map((id) => DOCUMENT_SECTIONS.find((s) => s.id === id))
            .filter(Boolean)
            .map(item)
            .join("")}</ul>
        </div>`
          )
          .join("")}
      </nav>
      ${quick}
    </div>
    <div class="doc-rail__foot">
      <p class="doc-rail__foot-label">Almacenamiento del expediente</p>
      <p class="doc-rail__foot-value">${escapeHtml(formatFileSize(ctx.overview.sizeBytes))} · ${ctx.overview.total} archivo${ctx.overview.total === 1 ? "" : "s"}</p>
    </div>
  </aside>`;
}

/* ==========================================================================
   Encabezado: breadcrumbs, búsqueda, vista, orden, filtros
   ========================================================================== */

function renderBreadcrumbs(ctx) {
  const { ui, employees, section } = ctx;
  const crumbs = [];
  if (ui.section === "files") {
    crumbs.push(
      ui.folderBrowseEmployeeId
        ? `<button type="button" class="doc-crumb" data-action="doc-browse-root">Expedientes</button>`
        : `<span class="doc-crumb doc-crumb--current" aria-current="page">Expedientes</span>`
    );
    if (ui.folderBrowseEmployeeId) {
      const emp = employees.find((e) => String(e.id) === ui.folderBrowseEmployeeId);
      const name = String(emp?.name || "Colaborador");
      crumbs.push(
        ui.selectedFolder
          ? `<button type="button" class="doc-crumb" data-action="doc-browse-employee" data-employee-id="${escapeAttr(ui.folderBrowseEmployeeId)}">${escapeHtml(name)}</button>`
          : `<span class="doc-crumb doc-crumb--current" aria-current="page">${escapeHtml(name)}</span>`
      );
      if (ui.selectedFolder) {
        crumbs.push(
          `<span class="doc-crumb doc-crumb--current" aria-current="page">${escapeHtml(normalizeDocumentFolder(ui.selectedFolder))}</span>`
        );
      }
    }
  } else {
    crumbs.push(`<span class="doc-crumb doc-crumb--current" aria-current="page">${escapeHtml(section.label)}</span>`);
  }
  return `<nav class="doc-breadcrumbs" aria-label="Ruta de navegación">
    ${crumbs.join('<span class="doc-crumb__sep" aria-hidden="true">/</span>')}
  </nav>`;
}

function renderViewSwitch(ctx) {
  const { IC, ui } = ctx;
  let hideTable = false;
  try {
    hideTable = typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
  } catch (_mqErr) {
    hideTable = false;
  }
  const btn = (mode, icon, label) => {
    if (hideTable && mode === "table") return "";
    const active = ui.viewMode === mode;
    return `<button type="button" class="doc-segment__btn${active ? " is-active" : ""}" role="radio" aria-checked="${active ? "true" : "false"}" data-action="doc-view-mode" data-view="${mode}">
      <span aria-hidden="true">${icon}</span><span class="doc-segment__label">${escapeHtml(label)}</span>
    </button>`;
  };
  return `<div class="doc-segment" role="radiogroup" aria-label="Modo de vista">
    ${btn("table", IC.columns || "", "Tabla")}${btn("cards", IC.grid || "", "Tarjetas")}${btn("list", IC.list || "", "Lista")}
  </div>`;
}

function renderSortControl(ctx) {
  const { ui } = ctx;
  const options = DOCUMENT_TABLE_COLUMNS.filter((c) => c.sortable)
    .map(
      (c) =>
        `<option value="${escapeAttr(c.key)}"${c.key === ui.sortKey ? " selected" : ""}>${escapeHtml(c.label)}</option>`
    )
    .join("");
  return `<div class="doc-sort-control">
    <label class="doc-sort-control__field">
      <span class="doc-visually-hidden">Ordenar por</span>
      <select data-action="doc-sort-key">${options}</select>
    </label>
    <button type="button" class="doc-icon-btn doc-sort-control__dir" data-action="doc-sort-dir" aria-label="${ui.sortDir === "asc" ? "Orden ascendente, cambiar a descendente" : "Orden descendente, cambiar a ascendente"}">
      ${ui.sortDir === "asc" ? SVG.sortAsc : SVG.sortDesc}
    </button>
  </div>`;
}

function renderFilterChips(ctx) {
  const { ui, employees } = ctx;
  const chips = [];
  const chip = (key, label) =>
    `<button type="button" class="doc-chip" data-action="doc-remove-filter" data-filter="${escapeAttr(key)}">
      <span>${escapeHtml(label)}</span><span class="doc-chip__x" aria-hidden="true">×</span>
      <span class="doc-visually-hidden">Quitar filtro</span>
    </button>`;
  if (ui.filterEmployeeId) {
    const emp = employees.find((e) => String(e.id) === ui.filterEmployeeId);
    chips.push(chip("filterEmployeeId", `Colaborador: ${emp?.name || ui.filterEmployeeId}`));
  }
  if (ui.typeFilter) chips.push(chip("typeFilter", `Tipo: ${getEmployeeDocumentTypeLabel(ui.typeFilter)}`));
  if (ui.folderFilter) chips.push(chip("folderFilter", `Carpeta: ${normalizeDocumentFolder(ui.folderFilter)}`));
  if (ui.filterStatus) chips.push(chip("filterStatus", `Estado: ${ui.filterStatus}`));
  if (ui.uploadedBy) chips.push(chip("uploadedBy", `Autor: ${ui.uploadedBy}`));
  if (ui.dateFrom || ui.dateTo) {
    const fieldLabel = { created: "Creación", updated: "Modificación", issued: "Emisión", due: "Vencimiento" }[ui.dateField];
    const range = `${ui.dateFrom ? formatDocumentDate(ui.dateFrom) : "…"} – ${ui.dateTo ? formatDocumentDate(ui.dateTo) : "…"}`;
    chips.push(chip("dateRange", `${fieldLabel}: ${range}`));
  }
  if (ui.minSizeMb) chips.push(chip("minSizeMb", `Desde ${ui.minSizeMb} MB`));
  if (ui.maxSizeMb) chips.push(chip("maxSizeMb", `Hasta ${ui.maxSizeMb} MB`));
  if (ui.onlyCurrentVersions) chips.push(chip("onlyCurrentVersions", "Solo versión vigente"));
  if (!chips.length) return "";
  return `<div class="doc-chips" role="group" aria-label="Filtros activos">
    ${chips.join("")}
    <button type="button" class="doc-chip doc-chip--clear" data-action="doc-clear-filters">Limpiar todo</button>
  </div>`;
}

function renderFiltersPopover(ctx) {
  const { ui, employees, folderNames, authors } = ctx;
  const empOptions = [...employees]
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"))
    .map(
      (e) =>
        `<option value="${escapeAttr(String(e.id))}"${String(e.id) === ui.filterEmployeeId ? " selected" : ""}>${escapeHtml(String(e.name || "Sin nombre"))}</option>`
    )
    .join("");
  const typeOptions = EMPLOYEE_DOCUMENT_TYPES.map(
    (t) => `<option value="${escapeAttr(t.value)}"${t.value === ui.typeFilter ? " selected" : ""}>${escapeHtml(t.label)}</option>`
  ).join("");
  const folderOptions = (folderNames || [])
    .map(
      (name) =>
        `<option value="${escapeAttr(name)}"${documentFolderKey(name) === documentFolderKey(ui.folderFilter) ? " selected" : ""}>${escapeHtml(name)}</option>`
    )
    .join("");
  const authorOptions = (authors || [])
    .map((a) => `<option value="${escapeAttr(a)}"${a === ui.uploadedBy ? " selected" : ""}>${escapeHtml(a)}</option>`)
    .join("");
  const dateFields = [
    ["created", "Creación"],
    ["updated", "Modificación"],
    ["issued", "Emisión"],
    ["due", "Vencimiento"]
  ];

  return `<div class="doc-popover" id="doc-filters-popover" data-doc-filters-popover role="dialog" aria-label="Filtros avanzados"${ui.filtersOpen ? "" : " hidden"}>
    <div class="doc-popover__head">
      <h3 class="doc-popover__title">Filtros avanzados</h3>
      <button type="button" class="doc-icon-btn" data-action="doc-close-filters" aria-label="Cerrar filtros">${ctx.IC.x || "×"}</button>
    </div>
    <div class="doc-popover__body">
      <label class="doc-field">
        <span class="doc-field__label">Colaborador</span>
        <select data-action="doc-filter" data-filter="filterEmployeeId"><option value="">Todos</option>${empOptions}</select>
      </label>
      <label class="doc-field">
        <span class="doc-field__label">Tipo documental</span>
        <select data-action="doc-filter" data-filter="typeFilter"><option value="">Todos</option>${typeOptions}</select>
      </label>
      <label class="doc-field">
        <span class="doc-field__label">Carpeta</span>
        <select data-action="doc-filter" data-filter="folderFilter"><option value="">Todas</option>${folderOptions}</select>
      </label>
      <label class="doc-field">
        <span class="doc-field__label">Estado</span>
        <select data-action="doc-filter" data-filter="filterStatus">
          <option value="">Todos</option>
          ${["Vigente", "Por vencer", "Vencido"]
            .map((s) => `<option value="${s}"${ui.filterStatus === s ? " selected" : ""}>${s}</option>`)
            .join("")}
        </select>
      </label>
      <label class="doc-field">
        <span class="doc-field__label">Autor</span>
        <select data-action="doc-filter" data-filter="uploadedBy"><option value="">Todos</option>${authorOptions}</select>
      </label>
      <fieldset class="doc-field doc-field--full doc-fieldset">
        <legend class="doc-field__label">Rango de fechas</legend>
        <div class="doc-field-row">
          <select data-action="doc-filter" data-filter="dateField" aria-label="Campo de fecha">
            ${dateFields
              .map(([v, l]) => `<option value="${v}"${ui.dateField === v ? " selected" : ""}>${l}</option>`)
              .join("")}
          </select>
          <input type="date" data-action="doc-filter" data-filter="dateFrom" value="${escapeAttr(ui.dateFrom)}" aria-label="Desde" />
          <input type="date" data-action="doc-filter" data-filter="dateTo" value="${escapeAttr(ui.dateTo)}" aria-label="Hasta" />
        </div>
      </fieldset>
      <fieldset class="doc-field doc-field--full doc-fieldset">
        <legend class="doc-field__label">Tamaño (MB)</legend>
        <div class="doc-field-row">
          <input type="number" min="0" step="0.1" data-action="doc-filter" data-filter="minSizeMb" value="${escapeAttr(ui.minSizeMb)}" placeholder="Mínimo" aria-label="Tamaño mínimo en MB" />
          <input type="number" min="0" step="0.1" data-action="doc-filter" data-filter="maxSizeMb" value="${escapeAttr(ui.maxSizeMb)}" placeholder="Máximo" aria-label="Tamaño máximo en MB" />
        </div>
      </fieldset>
      <label class="doc-switch doc-field--full">
        <input type="checkbox" data-action="doc-filter" data-filter="onlyCurrentVersions"${ui.onlyCurrentVersions ? " checked" : ""} />
        <span class="doc-switch__track" aria-hidden="true"><span class="doc-switch__thumb"></span></span>
        <span class="doc-switch__label">Solo la versión vigente de cada documento</span>
      </label>
    </div>
    <div class="doc-popover__foot">
      <button type="button" class="btn btn-sm btn-outline" data-action="doc-clear-filters">Limpiar</button>
      <button type="button" class="btn btn-sm btn-primary" data-action="doc-close-filters">Listo</button>
    </div>
  </div>`;
}

export function renderTopbar(ctx) {
  const { IC, ui, perms, activeFilterCount, resultCount } = ctx;
  const showListControls = ui.section !== "overview";
  const searchPlaceholder =
    ui.section === "files" && !ui.folderBrowseEmployeeId
      ? "Buscar colaborador o documento…"
      : "Buscar por nombre, tipo, código, autor…";

  return `<header class="doc-topbar">
    <div class="doc-topbar__main">
      <button type="button" class="doc-icon-btn doc-rail-toggle" data-action="doc-toggle-rail" aria-controls="doc-rail" aria-expanded="${ui.railOpen ? "true" : "false"}" aria-label="Mostrar u ocultar el menú del módulo">${IC.list || ""}</button>
      ${renderBreadcrumbs(ctx)}
      <div class="doc-topbar__search">
        <label class="doc-search">
          <span class="doc-search__icon" aria-hidden="true">${IC.search || ""}</span>
          <span class="doc-visually-hidden">Buscar documentos</span>
          <input type="search" data-action="doc-search" value="${escapeAttr(ui.search)}" placeholder="${escapeAttr(searchPlaceholder)}" autocomplete="off" spellcheck="false" />
          ${ui.search ? `<button type="button" class="doc-search__clear" data-action="doc-clear-search" aria-label="Borrar búsqueda">${IC.x || "×"}</button>` : ""}
        </label>
      </div>
      <div class="doc-topbar__actions">
        ${
          showListControls
            ? `<div class="doc-filters-anchor">
          <button type="button" class="btn btn-sm btn-outline doc-filters-btn${activeFilterCount ? " is-active" : ""}" data-action="doc-toggle-filters" aria-expanded="${ui.filtersOpen ? "true" : "false"}" aria-controls="doc-filters-popover">
            ${IC.filter || ""} Filtros${activeFilterCount ? `<span class="doc-filters-btn__count">${activeFilterCount}</span>` : ""}
          </button>
          ${renderFiltersPopover(ctx)}
        </div>
        ${renderViewSwitch(ctx)}
        ${renderSortControl(ctx)}`
            : ""
        }
        ${
          perms.view
            ? iconButton({ action: "doc-export-csv", icon: IC.download || "", label: "Exportar el listado filtrado a CSV" })
            : ""
        }
        ${
          perms.upload
            ? `<button type="button" class="btn btn-sm btn-primary doc-upload-cta" data-action="doc-open-upload">${IC.upload || "+"} Subir documento</button>`
            : ""
        }
      </div>
    </div>
    ${showListControls ? renderFilterChips(ctx) : ""}
    <p class="doc-result-meta" data-doc-result-meta aria-live="polite">${escapeHtml(resultCount)}</p>
  </header>`;
}

/* ==========================================================================
   Vista tabla
   ========================================================================== */

function renderTableHead(ctx) {
  const { ui, allSelected, someSelected } = ctx;
  const cells = DOCUMENT_TABLE_COLUMNS.map((col) => {
    const isSorted = ui.sortKey === col.key;
    const ariaSort = isSorted ? (ui.sortDir === "asc" ? "ascending" : "descending") : "none";
    const icon = isSorted ? (ui.sortDir === "asc" ? SVG.sortAsc : SVG.sortDesc) : SVG.sortNone;
    const next = isSorted && ui.sortDir === "asc" ? "descendente" : "ascendente";
    return `<th scope="col" class="doc-th doc-th--${escapeAttr(col.align)} doc-col--p${col.priority}" aria-sort="${ariaSort}">
      <button type="button" class="doc-th__btn${isSorted ? " is-sorted" : ""}" data-action="doc-sort-column" data-key="${escapeAttr(col.key)}">
        <span>${escapeHtml(col.label)}</span>${icon}
        <span class="doc-visually-hidden">Ordenar de forma ${next}</span>
      </button>
    </th>`;
  }).join("");
  return `<thead class="doc-thead">
    <tr>
      <th scope="col" class="doc-th doc-th--check">
        <label class="doc-check">
          <input type="checkbox" data-action="doc-select-all"${allSelected ? " checked" : ""} data-indeterminate="${someSelected && !allSelected ? "1" : "0"}" aria-label="Seleccionar todos los documentos visibles" />
          <span class="doc-check__box" aria-hidden="true"></span>
        </label>
      </th>
      ${cells}
      <th scope="col" class="doc-th doc-th--actions"><span class="doc-visually-hidden">Acciones</span></th>
    </tr>
  </thead>`;
}

function renderTableRow(row, ctx) {
  const id = String(row.id);
  const selected = ctx.selection.has(id);
  const active = ctx.ui.drawerDocId === id;
  return `<tr class="doc-tr${selected ? " is-selected" : ""}${active ? " is-active" : ""} doc-tr--${escapeAttr(row.statusTone)}" data-doc-id="${escapeAttr(id)}" data-doc-row draggable="true">
    <td class="doc-td doc-td--check">${selectionCheckbox(row, ctx)}</td>
    <td class="doc-td doc-td--name doc-col--p3">
      <button type="button" class="doc-name" data-action="doc-open-drawer" data-id="${escapeAttr(id)}">
        ${fileGlyph(row)}
        <span class="doc-name__text">
          <span class="doc-name__title">${escapeHtml(row.fileName)}</span>
          <span class="doc-name__sub">${escapeHtml(row.typeLabel)}${row.documentCode ? ` · ${escapeHtml(String(row.documentCode))}` : ""}</span>
        </span>
      </button>
      ${favoriteButton(row, ctx)}
    </td>
    <td class="doc-td doc-col--p3">
      <button type="button" class="doc-owner" data-action="doc-goto-file" data-id="${escapeAttr(id)}">
        <span class="doc-owner__avatar" aria-hidden="true">${escapeHtml(initials(row.employeeName))}</span>
        <span class="doc-owner__text">
          <span class="doc-owner__name">${escapeHtml(row.employeeName)}</span>
          ${row.employeeIdDoc ? `<span class="doc-owner__sub">${escapeHtml(row.employeeIdDoc)}</span>` : ""}
        </span>
      </button>
    </td>
    <td class="doc-td doc-col--p2">${escapeHtml(row.typeLabel)}</td>
    <td class="doc-td doc-col--p2"><span class="doc-folder-pill">${escapeHtml(row.folderName)}</span></td>
    <td class="doc-td doc-col--p3">${statusBadge(row)}</td>
    <td class="doc-td doc-col--p2"><span class="doc-num">${row.dueDate ? escapeHtml(row.dueDateLabel) : "—"}</span></td>
    <td class="doc-td doc-td--center doc-col--p1">
      ${row.versionCount > 1 ? `<span class="doc-version-pill${row.isCurrentVersion ? " is-current" : ""}">v${row.versionIndex}</span>` : `<span class="doc-muted">v1</span>`}
    </td>
    <td class="doc-td doc-td--right doc-col--p1"><span class="doc-num">${escapeHtml(row.sizeLabel)}</span></td>
    <td class="doc-td doc-col--p1">${escapeHtml(row.uploadedBy || "—")}</td>
    <td class="doc-td doc-col--p2"><span class="doc-num">${escapeHtml(row.createdLabel || "—")}</span></td>
    <td class="doc-td doc-col--p1"><span class="doc-num">${escapeHtml(row.updatedLabel || "—")}</span></td>
    <td class="doc-td doc-td--actions">${rowActions(row, ctx)}</td>
  </tr>`;
}

export function renderTableView(ctx) {
  const { visibleRows, shownRows, IC } = ctx;
  if (!visibleRows.length) return renderListEmpty(ctx);
  return `<div class="doc-table-wrap" data-doc-scroll>
    <table class="doc-table">
      <caption class="doc-visually-hidden">Documentos filtrados, ordenados por ${escapeHtml(
        DOCUMENT_TABLE_COLUMNS.find((c) => c.key === ctx.ui.sortKey)?.label || "fecha"
      )}</caption>
      ${renderTableHead(ctx)}
      <tbody>${shownRows.map((row) => renderTableRow(row, ctx)).join("")}</tbody>
    </table>
  </div>
  ${renderMoreBar(visibleRows.length, shownRows.length, IC)}`;
}

/* ==========================================================================
   Vistas tarjetas y lista
   ========================================================================== */

function renderCard(row, ctx) {
  const id = String(row.id);
  const selected = ctx.selection.has(id);
  return `<article class="doc-card${selected ? " is-selected" : ""}${ctx.ui.drawerDocId === id ? " is-active" : ""} doc-card--${escapeAttr(row.statusTone)}" data-doc-id="${escapeAttr(id)}" data-doc-row draggable="true">
    <div class="doc-card__top">
      ${selectionCheckbox(row, ctx)}
      ${fileGlyph(row)}
      <div class="doc-card__top-actions">${favoriteButton(row, ctx)}${rowActions(row, ctx)}</div>
    </div>
    <button type="button" class="doc-card__body" data-action="doc-open-drawer" data-id="${escapeAttr(id)}">
      <h3 class="doc-card__title">${escapeHtml(row.fileName)}</h3>
      <p class="doc-card__sub">${escapeHtml(row.typeLabel)}</p>
      <p class="doc-card__owner"><span class="doc-owner__avatar" aria-hidden="true">${escapeHtml(initials(row.employeeName))}</span>${escapeHtml(row.employeeName)}</p>
    </button>
    <div class="doc-card__meta">
      ${statusBadge(row)}
      <span class="doc-folder-pill">${escapeHtml(row.folderName)}</span>
      <span class="doc-meta-chip">${escapeHtml(row.sizeLabel)}</span>
      ${row.versionCount > 1 ? `<span class="doc-version-pill is-current">v${row.versionIndex} de ${row.versionCount}</span>` : ""}
    </div>
    <p class="doc-card__foot">${escapeHtml(row.dueLabel)} · ${escapeHtml(row.createdRelative || row.createdLabel || "")}</p>
  </article>`;
}

export function renderCardsView(ctx) {
  const { visibleRows, shownRows, IC } = ctx;
  if (!visibleRows.length) return renderListEmpty(ctx);
  return `<div class="doc-card-grid">${shownRows.map((row) => renderCard(row, ctx)).join("")}</div>
  ${renderMoreBar(visibleRows.length, shownRows.length, IC)}`;
}

function renderListRow(row, ctx) {
  const id = String(row.id);
  const selected = ctx.selection.has(id);
  return `<li class="doc-listrow${selected ? " is-selected" : ""}${ctx.ui.drawerDocId === id ? " is-active" : ""}" data-doc-id="${escapeAttr(id)}" data-doc-row draggable="true">
    ${selectionCheckbox(row, ctx)}
    <button type="button" class="doc-listrow__main" data-action="doc-open-drawer" data-id="${escapeAttr(id)}">
      ${fileGlyph(row)}
      <span class="doc-listrow__text">
        <span class="doc-listrow__title">${escapeHtml(row.fileName)}</span>
        <span class="doc-listrow__sub">${escapeHtml(row.employeeName)} · ${escapeHtml(row.typeLabel)} · ${escapeHtml(row.folderName)}</span>
      </span>
    </button>
    <span class="doc-listrow__aside">
      ${statusBadge(row)}
      <span class="doc-meta-chip doc-num">${escapeHtml(row.sizeLabel)}</span>
      <span class="doc-meta-chip doc-num">${escapeHtml(row.createdLabel || "")}</span>
    </span>
    ${favoriteButton(row, ctx)}
    ${rowActions(row, ctx)}
  </li>`;
}

export function renderListView(ctx) {
  const { visibleRows, shownRows, IC } = ctx;
  if (!visibleRows.length) return renderListEmpty(ctx);
  return `<ul class="doc-list">${shownRows.map((row) => renderListRow(row, ctx)).join("")}</ul>
  ${renderMoreBar(visibleRows.length, shownRows.length, IC)}`;
}

function renderListEmpty(ctx) {
  const { IC, ui, activeFilterCount, perms } = ctx;
  if (activeFilterCount || ui.search) {
    return renderEmptyState({
      title: "Ningún documento coincide con los filtros",
      hint: "Pruebe con otros términos o quite algún filtro para ampliar la búsqueda.",
      icon: IC.search || "",
      variant: "filtered",
      actions: [{ action: "doc-clear-filters", label: "Limpiar filtros", primary: true }]
    });
  }
  const bySection = {
    favorites: {
      title: "Todavía no hay favoritos",
      hint: "Marque con la estrella los documentos que consulte a menudo y aparecerán aquí."
    },
    recent: {
      title: "Sin actividad reciente",
      hint: "Aquí verá lo que abra o suba en los últimos 30 días."
    },
    due_soon: { title: "Nada por vencer", hint: "Ningún documento vence en los próximos 30 días." },
    expired: { title: "Sin documentos vencidos", hint: "Todos los vencimientos están al día." }
  };
  const preset = bySection[ui.section] || {
    title: "El expediente digital está vacío",
    hint: "Suba el primer documento para empezar a construir los expedientes."
  };
  return renderEmptyState({
    title: preset.title,
    hint: preset.hint,
    icon: IC.file || "",
    actions: perms.upload ? [{ action: "doc-open-upload", label: "Subir documento", primary: true, icon: IC.upload || "" }] : []
  });
}

/* ==========================================================================
   Navegación por expedientes
   ========================================================================== */

function renderEmployeeTile(emp, ctx) {
  const empRows = ctx.rows.filter((r) => String(r.employeeId) === String(emp.id));
  const expected = expectedDocumentTypesForEmployee(emp);
  const missing = findEmployeeDocumentGaps(emp, empRows);
  const done = expected.length - missing.length;
  const pct = expected.length ? Math.round((done / expected.length) * 100) : 100;
  const expired = empRows.filter((r) => r.status === "Vencido").length;
  const dueSoon = empRows.filter((r) => r.status === "Por vencer").length;
  const tone = missing.length ? "gap" : pct >= 100 ? "ok" : "mid";
  return `<li>
    <button type="button" class="doc-emp-tile doc-emp-tile--${tone}" data-action="doc-browse-employee" data-employee-id="${escapeAttr(String(emp.id))}">
      <span class="doc-emp-tile__avatar" aria-hidden="true">${escapeHtml(initials(emp.name))}</span>
      <span class="doc-emp-tile__main">
        <span class="doc-emp-tile__name">${escapeHtml(String(emp.name || "Sin nombre"))}</span>
        <span class="doc-emp-tile__sub">${escapeHtml(String(emp.documentType || "CC"))} ${escapeHtml(String(emp.idDoc || ""))}${emp.position ? ` · ${escapeHtml(String(emp.position))}` : ""}</span>
      </span>
      <span class="doc-emp-tile__progress" role="img" aria-label="Checklist ${pct} por ciento completo, ${done} de ${expected.length}">
        <span class="doc-emp-tile__bar"><span class="doc-emp-tile__bar-fill" style="--pct:${pct}%"></span></span>
        <span class="doc-emp-tile__pct doc-num">${pct}%</span>
      </span>
      <span class="doc-emp-tile__stats">
        <span class="doc-meta-chip doc-num">${empRows.length} doc${empRows.length === 1 ? "" : "s"}</span>
        ${missing.length ? `<span class="doc-badge doc-badge--warn"><span class="doc-badge__glyph" aria-hidden="true">•</span>${missing.length} pendiente${missing.length === 1 ? "" : "s"}</span>` : ""}
        ${dueSoon ? `<span class="doc-badge doc-badge--warn"><span class="doc-badge__glyph" aria-hidden="true">•</span>${dueSoon} por vencer</span>` : ""}
        ${expired ? `<span class="doc-badge doc-badge--expired"><span class="doc-badge__glyph" aria-hidden="true">!</span>${expired} vencido${expired === 1 ? "" : "s"}</span>` : ""}
      </span>
      <span class="doc-emp-tile__chevron" aria-hidden="true">${ctx.IC.chevronRight || "›"}</span>
    </button>
  </li>`;
}

function renderFolderTile(folder, ctx) {
  const { IC, ui } = ctx;
  const label = `Abrir la carpeta ${folder.name}`;
  return `<li>
    <div class="doc-folder-tile${folder.count === 0 ? " is-empty" : ""}" data-doc-folder="${escapeAttr(folder.name)}" data-doc-folder-drop>
      <button type="button" class="doc-folder-tile__open" data-action="doc-browse-folder" data-folder="${escapeAttr(folder.name)}" aria-label="${escapeAttr(label)}">
        <span class="doc-folder-tile__icon" aria-hidden="true">${IC.folder || ""}</span>
        <span class="doc-folder-tile__text">
          <span class="doc-folder-tile__name">${escapeHtml(folder.name)}</span>
          <span class="doc-folder-tile__meta">${folder.count} archivo${folder.count === 1 ? "" : "s"} · ${escapeHtml(formatFileSize(folder.sizeBytes))}</span>
        </span>
      </button>
      ${renderKebabMenu({
        id: `folder-${documentFolderKey(folder.name)}`,
        label: `Acciones de la carpeta ${folder.name}`,
        items: [
          { action: "doc-export-folder", icon: IC.download || "", label: "Descargar en ZIP", data: ` data-folder="${escapeAttr(folder.name)}"` },
          ctx.perms.upload
            ? { action: "doc-open-upload", icon: IC.upload || "", label: "Subir aquí", data: ` data-employee-id="${escapeAttr(ui.folderBrowseEmployeeId)}" data-folder="${escapeAttr(folder.name)}"` }
            : null,
          ctx.perms.upload && documentFolderKey(folder.name) !== documentFolderKey(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER)
            ? { separator: true }
            : null,
          ctx.perms.upload && documentFolderKey(folder.name) !== documentFolderKey(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER)
            ? { action: "doc-delete-folder", icon: IC.trash || "", label: "Eliminar carpeta", tone: "danger", data: ` data-folder="${escapeAttr(folder.name)}"` }
            : null
        ]
      })}
    </div>
  </li>`;
}

/** Checklist del expediente con los tipos esperados y su estado. */
function renderChecklist(employee, ctx) {
  const { rows, perms, IC } = ctx;
  const empRows = rows.filter((r) => String(r.employeeId) === String(employee.id));
  const expected = expectedDocumentTypesForEmployee(employee);
  const items = expected
    .map((type) => {
      const matches = empRows.filter((r) => String(r.documentType) === type);
      const latest = matches.sort((a, b) => (b.versionIndex || 0) - (a.versionIndex || 0))[0];
      const ok = matches.length > 0;
      return `<li class="doc-checklist__item${ok ? " is-ok" : " is-missing"}">
        <span class="doc-checklist__mark" aria-hidden="true">${ok ? "✓" : "○"}</span>
        <span class="doc-checklist__text">
          <span class="doc-checklist__label">${escapeHtml(getEmployeeDocumentTypeLabel(type))}</span>
          <span class="doc-checklist__state">${ok ? `${matches.length} archivo${matches.length === 1 ? "" : "s"}` : "Pendiente"}</span>
        </span>
        ${latest && latest.status !== "Vigente" ? statusBadge(latest) : ""}
        ${
          !ok && perms.upload
            ? `<button type="button" class="btn btn-sm btn-outline doc-checklist__cta" data-action="doc-open-upload" data-employee-id="${escapeAttr(String(employee.id))}" data-document-type="${escapeAttr(type)}">Subir</button>`
            : ""
        }
      </li>`;
    })
    .join("");
  const done = expected.filter((t) => empRows.some((r) => String(r.documentType) === t)).length;
  const pct = expected.length ? Math.round((done / expected.length) * 100) : 100;
  return `<section class="doc-checklist-card" aria-labelledby="doc-checklist-title">
    <header class="doc-checklist-card__head">
      <h3 class="doc-checklist-card__title" id="doc-checklist-title">Checklist mínimo</h3>
      <span class="doc-checklist-card__pct doc-num">${done}/${expected.length}</span>
    </header>
    <div class="doc-progress" role="img" aria-label="Checklist ${pct} por ciento completo">
      <span class="doc-progress__fill" style="--pct:${pct}%"></span>
    </div>
    <ul class="doc-checklist">${items}</ul>
    ${
      perms.upload
        ? `<button type="button" class="btn btn-sm btn-outline doc-checklist-card__cta" data-action="doc-open-upload" data-employee-id="${escapeAttr(String(employee.id))}">${IC.upload || ""} Subir al expediente</button>`
        : ""
    }
  </section>`;
}

export function renderFilesView(ctx) {
  const { ui, employees, IC, perms, folderTiles, visibleRows, shownRows } = ctx;

  if (!ui.folderBrowseEmployeeId) {
    const list = ctx.visibleEmployees;
    if (!list.length) {
      return renderEmptyState({
        title: "No hay colaboradores que coincidan",
        hint: "Ajuste la búsqueda o limpie los filtros activos.",
        icon: IC.users || IC.user || "",
        variant: "filtered",
        actions: [{ action: "doc-clear-filters", label: "Limpiar filtros", primary: true }]
      });
    }
    return `<ul class="doc-emp-list">${list.map((emp) => renderEmployeeTile(emp, ctx)).join("")}</ul>`;
  }

  const employee = employees.find((e) => String(e.id) === ui.folderBrowseEmployeeId);
  if (!employee) {
    return renderEmptyState({
      title: "Colaborador no encontrado",
      hint: "El expediente pudo eliminarse o cambiar de empresa.",
      icon: IC.alertTriangle || "",
      variant: "error",
      actions: [{ action: "doc-browse-root", label: "Volver a expedientes", primary: true }]
    });
  }

  const foldersBlock = ui.selectedFolder
    ? ""
    : `<section class="doc-folders" aria-labelledby="doc-folders-title">
        <div class="doc-folders__head">
          <h3 class="doc-folders__title" id="doc-folders-title">Carpetas</h3>
          <div class="doc-folders__actions">
            ${perms.view ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-export-folders" data-employee-id="${escapeAttr(String(employee.id))}">${IC.download || ""} Exportar ZIP</button>` : ""}
            ${perms.upload ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-new-folder" data-employee-id="${escapeAttr(String(employee.id))}">${IC.plus || "+"} Nueva carpeta</button>` : ""}
          </div>
        </div>
        <ul class="doc-folder-grid">${(folderTiles || []).map((f) => renderFolderTile(f, ctx)).join("")}</ul>
      </section>`;

  const filesBlock = `<section class="doc-files" aria-labelledby="doc-files-title">
    <div class="doc-folders__head">
      <h3 class="doc-folders__title" id="doc-files-title">${ui.selectedFolder ? escapeHtml(normalizeDocumentFolder(ui.selectedFolder)) : "Archivos del expediente"}</h3>
      ${
        ui.selectedFolder
          ? `<div class="doc-folders__actions">
              ${perms.view ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-export-folder" data-folder="${escapeAttr(normalizeDocumentFolder(ui.selectedFolder))}">${IC.download || ""} ZIP de la carpeta</button>` : ""}
              ${perms.upload ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-open-upload" data-employee-id="${escapeAttr(String(employee.id))}" data-folder="${escapeAttr(normalizeDocumentFolder(ui.selectedFolder))}">${IC.upload || ""} Subir aquí</button>` : ""}
            </div>`
          : ""
      }
    </div>
    ${
      visibleRows.length
        ? ui.viewMode === "cards"
          ? `<div class="doc-card-grid">${shownRows.map((row) => renderCard(row, ctx)).join("")}</div>${renderMoreBar(visibleRows.length, shownRows.length, IC)}`
          : ui.viewMode === "list"
            ? `<ul class="doc-list">${shownRows.map((row) => renderListRow(row, ctx)).join("")}</ul>${renderMoreBar(visibleRows.length, shownRows.length, IC)}`
            : renderTableView(ctx)
        : renderListEmpty(ctx)
    }
  </section>`;

  return `<div class="doc-file-layout">
    <div class="doc-file-layout__main">${foldersBlock}${filesBlock}</div>
    <div class="doc-file-layout__side">${renderChecklist(employee, ctx)}</div>
  </div>`;
}

/* ==========================================================================
   Vista Resumen
   ========================================================================== */

function metricCard({ label, value, hint, tone = "", action = "", data = "", icon = "" }) {
  const inner = `<span class="doc-metric__icon" aria-hidden="true">${icon}</span>
    <span class="doc-metric__body">
      <span class="doc-metric__label">${escapeHtml(label)}</span>
      <strong class="doc-metric__value doc-num">${escapeHtml(String(value))}</strong>
      ${hint ? `<span class="doc-metric__hint">${escapeHtml(hint)}</span>` : ""}
    </span>`;
  if (!action) return `<div class="doc-metric${tone ? ` doc-metric--${tone}` : ""}">${inner}</div>`;
  return `<button type="button" class="doc-metric doc-metric--action${tone ? ` doc-metric--${tone}` : ""}" data-action="${escapeAttr(action)}"${data}>${inner}</button>`;
}

export function renderOverview(ctx) {
  const { IC, overview, activity, perms, employees } = ctx;

  const urgent = overview.urgent.length
    ? `<ul class="doc-alert-list">${overview.urgent
        .map(
          (row) => `<li class="doc-alert doc-alert--${escapeAttr(row.statusTone)}">
        <span class="doc-alert__icon" aria-hidden="true">${IC.alertTriangle || ""}</span>
        <button type="button" class="doc-alert__main" data-action="doc-open-drawer" data-id="${escapeAttr(String(row.id))}">
          <span class="doc-alert__title">${escapeHtml(row.typeLabel)} · ${escapeHtml(row.employeeName)}</span>
          <span class="doc-alert__sub">${escapeHtml(row.fileName)}</span>
        </button>
        <span class="doc-alert__due">${escapeHtml(row.dueLabel)}</span>
      </li>`
        )
        .join("")}</ul>`
    : renderEmptyState({
        title: "Sin vencimientos próximos",
        hint: "Ningún documento vence en los próximos 30 días.",
        icon: IC.check || ""
      });

  const gaps = overview.gapEmployees.length
    ? `<ul class="doc-gap-list">${overview.gapEmployees
        .slice(0, 8)
        .map((emp) => {
          const missing = findEmployeeDocumentGaps(emp, ctx.rows);
          return `<li class="doc-gap">
            <button type="button" class="doc-gap__main" data-action="doc-browse-employee" data-employee-id="${escapeAttr(String(emp.id))}">
              <span class="doc-owner__avatar" aria-hidden="true">${escapeHtml(initials(emp.name))}</span>
              <span class="doc-gap__text">
                <span class="doc-gap__name">${escapeHtml(String(emp.name || "Sin nombre"))}</span>
                <span class="doc-gap__sub">Falta: ${escapeHtml(missing.slice(0, 3).map(getEmployeeDocumentTypeLabel).join(", "))}${missing.length > 3 ? ` +${missing.length - 3}` : ""}</span>
              </span>
            </button>
            <span class="doc-badge doc-badge--warn"><span class="doc-badge__glyph" aria-hidden="true">•</span>${missing.length}</span>
          </li>`;
        })
        .join("")}</ul>`
    : renderEmptyState({
        title: "Todos los expedientes completos",
        hint: `Los ${employees.length} colaboradores tienen su checklist mínimo al día.`,
        icon: IC.check || ""
      });

  const feed = (activity || []).length
    ? `<ul class="doc-feed">${activity
        .slice(0, 10)
        .map(
          (entry) => `<li class="doc-feed__item">
        <span class="doc-feed__dot doc-feed__dot--${escapeAttr(entry.action)}" aria-hidden="true"></span>
        <span class="doc-feed__text">
          <span class="doc-feed__title">${escapeHtml(entry.summary)}</span>
          <span class="doc-feed__meta">${escapeHtml(entry.actor)} · ${escapeHtml(entry.when)}</span>
        </span>
      </li>`
        )
        .join("")}</ul>`
    : renderEmptyState({ title: "Sin actividad registrada", hint: "Las altas, ediciones y bajas aparecerán aquí.", icon: IC.activity || "" });

  return `<div class="doc-overview">
    <section class="doc-overview__metrics" aria-label="Indicadores del expediente digital">
      ${metricCard({ label: "Documentos", value: overview.total, hint: formatFileSize(overview.sizeBytes), icon: IC.file || "", action: "doc-section", data: ' data-section="all"' })}
      ${metricCard({ label: "Por vencer", value: overview.dueSoon, hint: "Próximos 30 días", tone: "warn", icon: IC.clock || "", action: "doc-section", data: ' data-section="due_soon"' })}
      ${metricCard({ label: "Vencidos", value: overview.expired, hint: "Requieren renovación", tone: "expired", icon: IC.alertTriangle || "", action: "doc-section", data: ' data-section="expired"' })}
      ${metricCard({ label: "Expedientes incompletos", value: overview.gapCount, hint: `de ${overview.totalEmployees} colaboradores`, tone: "gap", icon: IC.users || "", action: "doc-section", data: ' data-section="gaps"' })}
      ${metricCard({ label: "Cumplimiento", value: `${overview.compliance}%`, hint: "Checklist mínimo", tone: "ok", icon: IC.shield || "" })}
      ${metricCard({ label: "Nuevos (30 días)", value: overview.addedLast30, hint: "Documentos cargados", icon: IC.upload || "", action: "doc-section", data: ' data-section="recent"' })}
    </section>

    <div class="doc-overview__grid">
      <section class="doc-panel" aria-labelledby="doc-panel-due">
        <header class="doc-panel__head">
          <h3 class="doc-panel__title" id="doc-panel-due">Alertas de vencimiento</h3>
          <button type="button" class="doc-panel__link" data-action="doc-section" data-section="due_soon">Ver todo</button>
        </header>
        ${urgent}
      </section>

      <section class="doc-panel" aria-labelledby="doc-panel-gaps">
        <header class="doc-panel__head">
          <h3 class="doc-panel__title" id="doc-panel-gaps">Expedientes incompletos</h3>
          <button type="button" class="doc-panel__link" data-action="doc-section" data-section="gaps">Ver todo</button>
        </header>
        ${gaps}
      </section>

      <section class="doc-panel doc-panel--wide" aria-labelledby="doc-panel-activity">
        <header class="doc-panel__head">
          <h3 class="doc-panel__title" id="doc-panel-activity">Actividad reciente</h3>
        </header>
        ${feed}
      </section>
    </div>

    ${
      perms.upload
        ? `<div class="doc-overview__cta">
      <button type="button" class="btn btn-primary" data-action="doc-open-upload">${IC.upload || ""} Subir documento</button>
      <button type="button" class="btn btn-outline" data-action="doc-section" data-section="files">${IC.folder || ""} Explorar expedientes</button>
    </div>`
        : ""
    }
  </div>`;
}

/* ==========================================================================
   Vista de expedientes incompletos
   ========================================================================== */

export function renderGapsView(ctx) {
  const { IC, overview } = ctx;
  if (!overview.gapEmployees.length) {
    return renderEmptyState({
      title: "Todos los expedientes están completos",
      hint: "Ningún colaborador tiene documentos mínimos pendientes.",
      icon: IC.check || ""
    });
  }
  return `<ul class="doc-emp-list">${overview.gapEmployees.map((emp) => renderEmployeeTile(emp, ctx)).join("")}</ul>`;
}

/* ==========================================================================
   Panel lateral de detalle
   ========================================================================== */

function detailField(label, value, { mono = false } = {}) {
  const text = String(value ?? "").trim();
  return `<div class="doc-detail__field">
    <dt class="doc-detail__label">${escapeHtml(label)}</dt>
    <dd class="doc-detail__value${mono ? " doc-num" : ""}">${text ? escapeHtml(text) : '<span class="doc-muted">—</span>'}</dd>
  </div>`;
}

export function renderDrawer(ctx) {
  const { IC, ui, drawer, perms } = ctx;
  const open = Boolean(ui.drawerDocId && drawer?.row);
  if (!open) {
    return `<aside class="doc-drawer" data-doc-drawer hidden aria-hidden="true"></aside>`;
  }
  const row = drawer.row;
  const id = String(row.id);

  const preview = row.canPreview
    ? `<div class="doc-detail__preview" data-doc-preview-slot data-id="${escapeAttr(id)}">
        <button type="button" class="doc-detail__preview-btn" data-action="doc-preview" data-id="${escapeAttr(id)}">
          ${IC.eye || ""} Cargar vista previa
        </button>
      </div>`
    : `<div class="doc-detail__preview doc-detail__preview--none">
        ${fileGlyph(row)}
        <p class="doc-muted">Este formato no admite vista previa. Descárguelo para abrirlo.</p>
      </div>`;

  const permissionList = [
    ["Ver", perms.view],
    ["Subir", perms.upload],
    ["Editar", perms.edit],
    ["Eliminar", perms.del]
  ]
    .map(
      ([label, allowed]) =>
        `<li class="doc-perm${allowed ? " is-on" : ""}"><span aria-hidden="true">${allowed ? "✓" : "✕"}</span>${escapeHtml(label)}<span class="doc-visually-hidden">${allowed ? "permitido" : "no permitido"}</span></li>`
    )
    .join("");

  const versions = (drawer.versions || []).length > 1
    ? `<ol class="doc-versions">${drawer.versions
        .map(
          (v) => `<li class="doc-versions__item${String(v.id) === id ? " is-current" : ""}">
        <button type="button" class="doc-versions__btn" data-action="doc-open-drawer" data-id="${escapeAttr(String(v.id))}">
          <span class="doc-version-pill${v.isCurrentVersion ? " is-current" : ""}">v${v.versionIndex}</span>
          <span class="doc-versions__text">
            <span class="doc-versions__name">${escapeHtml(v.fileName)}</span>
            <span class="doc-versions__meta">${escapeHtml(v.createdLabel || "")} · ${escapeHtml(v.uploadedBy || "")}${v.isCurrentVersion ? " · Vigente" : ""}</span>
          </span>
        </button>
      </li>`
        )
        .join("")}</ol>`
    : `<p class="doc-muted doc-detail__note">Única versión registrada. Al subir otro ${escapeHtml(row.typeLabel)} en la carpeta ${escapeHtml(row.folderName)} se encadenará como v${row.versionCount + 1}.</p>`;

  const related = (drawer.related || []).length
    ? `<ul class="doc-related">${drawer.related
        .map(
          (r) => `<li>
        <button type="button" class="doc-related__item" data-action="doc-open-drawer" data-id="${escapeAttr(String(r.id))}">
          ${fileGlyph(r)}
          <span class="doc-related__text">
            <span class="doc-related__name">${escapeHtml(r.fileName)}</span>
            <span class="doc-related__meta">${escapeHtml(r.employeeName)} · ${escapeHtml(r.folderName)}</span>
          </span>
        </button>
      </li>`
        )
        .join("")}</ul>`
    : `<p class="doc-muted doc-detail__note">No hay documentos relacionados.</p>`;

  const activity = (drawer.activity || []).length
    ? `<ul class="doc-feed doc-feed--compact">${drawer.activity
        .map(
          (entry) => `<li class="doc-feed__item">
        <span class="doc-feed__dot doc-feed__dot--${escapeAttr(entry.action)}" aria-hidden="true"></span>
        <span class="doc-feed__text">
          <span class="doc-feed__title">${escapeHtml(entry.summary)}</span>
          <span class="doc-feed__meta">${escapeHtml(entry.actor)} · ${escapeHtml(entry.when)}</span>
        </span>
      </li>`
        )
        .join("")}</ul>`
    : `<p class="doc-muted doc-detail__note">Sin movimientos registrados para este documento.</p>`;

  return `<aside class="doc-drawer is-open" data-doc-drawer role="dialog" aria-modal="false" aria-labelledby="doc-drawer-title" tabindex="-1">
    <header class="doc-drawer__head">
      <div class="doc-drawer__identity">
        ${fileGlyph(row)}
        <div class="doc-drawer__titles">
          <p class="doc-drawer__eyebrow">${escapeHtml(row.typeLabel)}</p>
          <h2 class="doc-drawer__title" id="doc-drawer-title">${escapeHtml(row.fileName)}</h2>
          <p class="doc-drawer__sub">${escapeHtml(row.employeeName)} · ${escapeHtml(row.folderName)}</p>
        </div>
      </div>
      <div class="doc-drawer__head-actions">
        ${favoriteButton(row, ctx)}
        <button type="button" class="doc-icon-btn" data-action="doc-close-drawer" aria-label="Cerrar panel de detalle">${IC.x || "×"}</button>
      </div>
    </header>

    <div class="doc-drawer__toolbar">
      ${statusBadge(row)}
      <span class="doc-meta-chip doc-num">${escapeHtml(row.sizeLabel)}</span>
      ${row.versionCount > 1 ? `<span class="doc-version-pill is-current">v${row.versionIndex} de ${row.versionCount}</span>` : ""}
      <span class="doc-drawer__toolbar-gap"></span>
      <button type="button" class="btn btn-sm btn-outline" data-action="doc-download" data-id="${escapeAttr(id)}">${IC.download || ""} Descargar</button>
      ${perms.edit ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-edit" data-id="${escapeAttr(id)}">${IC.edit || ""} Editar</button>` : ""}
      ${renderKebabMenu({
        id: `drawer-${id}`,
        label: "Más acciones del documento",
        items: [
          { action: "doc-goto-file", id, icon: IC.folder || "", label: "Abrir expediente" },
          perms.edit ? { action: "doc-move", id, icon: IC.layers || "", label: "Mover de carpeta" } : null,
          perms.del ? { separator: true } : null,
          perms.del ? { action: "doc-delete", id, icon: IC.trash || "", label: "Eliminar", tone: "danger" } : null
        ]
      })}
    </div>

    <div class="doc-drawer__body">
      ${preview}

      <section class="doc-detail__section">
        <h3 class="doc-detail__section-title">Información</h3>
        <dl class="doc-detail__grid">
          ${detailField("Nombre", row.fileName)}
          ${detailField("Tipo documental", row.typeLabel)}
          ${detailField("Categoría", row.folderName)}
          ${detailField("Estado", row.dueLabel)}
          ${detailField("Responsable", row.employeeName)}
          ${detailField("Identificación", row.employeeIdDoc, { mono: true })}
          ${detailField("Autor", row.uploadedBy)}
          ${detailField("Versión", `v${row.versionIndex} de ${row.versionCount}`, { mono: true })}
          ${detailField("Tamaño", row.sizeLabel, { mono: true })}
          ${detailField("Formato", row.mimeType)}
          ${detailField("Creado", `${row.createdLabel || "—"}${row.createdRelative ? ` · ${row.createdRelative}` : ""}`)}
          ${detailField("Modificado", row.updatedLabel)}
          ${detailField("Emisión", row.issueLabel)}
          ${detailField("Vencimiento", row.dueDateLabel)}
          ${detailField("Código documental", row.documentCode, { mono: true })}
        </dl>
        ${row.notes ? `<div class="doc-detail__notes"><h4 class="doc-detail__label">Observaciones</h4><p>${escapeHtml(String(row.notes))}</p></div>` : ""}
      </section>

      <section class="doc-detail__section">
        <h3 class="doc-detail__section-title">Permisos efectivos</h3>
        <ul class="doc-perms">${permissionList}</ul>
      </section>

      <section class="doc-detail__section">
        <h3 class="doc-detail__section-title">Versiones</h3>
        ${versions}
      </section>

      <section class="doc-detail__section">
        <h3 class="doc-detail__section-title">Documentos relacionados</h3>
        ${related}
      </section>

      <section class="doc-detail__section">
        <h3 class="doc-detail__section-title">Actividad</h3>
        ${activity}
      </section>
    </div>
  </aside>`;
}

/* ==========================================================================
   Barra de acciones masivas
   ========================================================================== */

export function renderBulkBar(ctx) {
  const { IC, selectionSummary, perms } = ctx;
  if (!selectionSummary.count) {
    return `<div class="doc-bulkbar" data-doc-bulkbar hidden aria-hidden="true"></div>`;
  }
  const { count, sizeBytes, employeeCount, singleEmployeeId } = selectionSummary;
  return `<div class="doc-bulkbar is-open" data-doc-bulkbar role="region" aria-label="Acciones sobre la selección">
    <div class="doc-bulkbar__inner">
      <p class="doc-bulkbar__count" aria-live="polite">
        <strong>${count}</strong> documento${count === 1 ? "" : "s"} · ${escapeHtml(formatFileSize(sizeBytes))}
        ${employeeCount > 1 ? ` · ${employeeCount} expedientes` : ""}
      </p>
      <div class="doc-bulkbar__actions">
        ${
          singleEmployeeId
            ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-bulk-zip">${IC.download || ""} Descargar ZIP</button>`
            : `<span class="doc-bulkbar__hint">El ZIP requiere documentos de un solo expediente</span>`
        }
        <button type="button" class="btn btn-sm btn-outline" data-action="doc-bulk-csv">${IC.file || ""} Exportar CSV</button>
        ${perms.edit ? `<button type="button" class="btn btn-sm btn-outline" data-action="doc-bulk-move">${IC.layers || ""} Mover de carpeta</button>` : ""}
        ${perms.del ? `<button type="button" class="btn btn-sm btn-action btn-danger-soft" data-action="doc-bulk-delete">${IC.trash || ""} Eliminar</button>` : ""}
        <button type="button" class="doc-icon-btn" data-action="doc-clear-selection" aria-label="Quitar la selección">${IC.x || "×"}</button>
      </div>
    </div>
  </div>`;
}

/* ==========================================================================
   Flujo de carga (drawer)
   ========================================================================== */

function renderTypePicker(ctx) {
  const { upload } = ctx;
  const { employee, resolvedType, rows } = upload;
  if (!employee) {
    return `<p class="doc-muted">Seleccione un colaborador para ver su checklist.</p>`;
  }
  const empRows = rows.filter((r) => String(r.employeeId) === String(employee.id));
  const expected = expectedDocumentTypesForEmployee(employee);
  const others = EMPLOYEE_DOCUMENT_TYPES.map((t) => t.value).filter((v) => !expected.includes(v));
  const pick = (type) => {
    const has = empRows.some((r) => String(r.documentType) === type);
    const active = resolvedType === type;
    return `<button type="button" class="doc-type-pick${has ? " is-complete" : ""}${active ? " is-selected" : ""}" data-action="doc-pick-type" data-document-type="${escapeAttr(type)}" aria-pressed="${active ? "true" : "false"}">
      <span class="doc-type-pick__mark" aria-hidden="true">${has ? "✓" : "○"}</span>
      <span class="doc-type-pick__text">
        <span class="doc-type-pick__label">${escapeHtml(getEmployeeDocumentTypeLabel(type))}</span>
        <span class="doc-type-pick__state">${has ? `${empRows.filter((r) => String(r.documentType) === type).length} en expediente` : "Pendiente"}</span>
      </span>
    </button>`;
  };
  return `<div class="doc-type-picker">
    <input type="hidden" name="documentType" value="${escapeAttr(resolvedType)}" data-doc-type-input required />
    <div class="doc-type-picker__grid">${expected.map(pick).join("")}</div>
    <details class="doc-type-picker__more"${others.includes(resolvedType) ? " open" : ""}>
      <summary>Otros tipos documentales</summary>
      <div class="doc-type-picker__grid doc-type-picker__grid--compact">${others.map(pick).join("")}</div>
    </details>
  </div>`;
}

export function renderUploadDrawer(ctx) {
  const { IC, ui, upload, perms } = ctx;
  if (!ui.uploadOpen || !perms.upload) {
    return `<aside class="doc-upload-drawer" data-doc-upload-drawer hidden aria-hidden="true"></aside>`;
  }
  const { employees, employeeId, folders, folderDefault } = upload;
  const empOptions = [...employees]
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"))
    .map(
      (e) =>
        `<option value="${escapeAttr(String(e.id))}"${String(e.id) === employeeId ? " selected" : ""}>${escapeHtml(`${e.name || "Sin nombre"} · ${e.documentType || "CC"} ${e.idDoc || ""}`)}</option>`
    )
    .join("");
  const folderOptions = folders
    .map(
      (name) =>
        `<option value="${escapeAttr(name)}"${name === folderDefault ? " selected" : ""}>${escapeHtml(name)}</option>`
    )
    .join("");

  return `<aside class="doc-upload-drawer is-open" data-doc-upload-drawer role="dialog" aria-modal="true" aria-labelledby="doc-upload-title" tabindex="-1">
    <header class="doc-drawer__head">
      <div class="doc-drawer__titles">
        <p class="doc-drawer__eyebrow">Expediente digital</p>
        <h2 class="doc-drawer__title" id="doc-upload-title">Subir documento</h2>
      </div>
      <button type="button" class="doc-icon-btn" data-action="doc-close-upload" aria-label="Cerrar el formulario de carga">${IC.x || "×"}</button>
    </header>

    <form id="form-employee-document" class="doc-upload-form" enctype="multipart/form-data">
      <div class="doc-upload-form__body">
        <section class="doc-upload-step">
          <h3 class="doc-upload-step__title"><span class="doc-upload-step__num">1</span> Destino</h3>
          <div class="doc-upload-step__fields">
            <label class="doc-field">
              <span class="doc-field__label">Colaborador</span>
              <select name="employeeId" required data-doc-employee-select>
                <option value=""${employeeId ? "" : " selected"}>— Seleccione —</option>
                ${empOptions}
              </select>
            </label>
            <label class="doc-field">
              <span class="doc-field__label">Carpeta</span>
              <select name="folder" required data-doc-folder-select>
                ${folderOptions || `<option value="${escapeAttr(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER)}" selected>${escapeHtml(DEFAULT_EMPLOYEE_DOCUMENT_FOLDER)}</option>`}
                <option value="__create_folder__">+ Crear carpeta nueva…</option>
              </select>
            </label>
          </div>
        </section>

        <section class="doc-upload-step">
          <h3 class="doc-upload-step__title"><span class="doc-upload-step__num">2</span> Tipo documental</h3>
          ${renderTypePicker(ctx)}
        </section>

        <section class="doc-upload-step">
          <h3 class="doc-upload-step__title"><span class="doc-upload-step__num">3</span> Archivos</h3>
          <div class="doc-dropzone" data-doc-dropzone>
            <input type="file" name="file" id="doc-upload-file" multiple hidden />
            <label for="doc-upload-file" class="doc-dropzone__label">
              <span class="doc-dropzone__icon" aria-hidden="true">${IC.upload || ""}</span>
              <strong class="doc-dropzone__title">Arrastre archivos aquí o haga clic</strong>
              <span class="doc-dropzone__hint">PDF, imágenes, Word o Excel · hasta 50 MB por archivo</span>
              <span class="doc-dropzone__filename" data-doc-file-label>Sin archivos seleccionados</span>
            </label>
            <button type="button" class="doc-dropzone__clear" data-action="doc-clear-upload-files" hidden>Quitar</button>
          </div>
        </section>

        <details class="doc-upload-step doc-upload-step--extra">
          <summary class="doc-upload-step__title">Detalles opcionales</summary>
          <div class="doc-upload-step__fields doc-upload-step__fields--3">
            <label class="doc-field">
              <span class="doc-field__label">Código documental</span>
              <input name="documentCode" type="text" maxlength="64" placeholder="Opcional" />
            </label>
            <label class="doc-field">
              <span class="doc-field__label">Fecha de emisión</span>
              <input name="issueDate" type="date" />
            </label>
            <label class="doc-field" data-doc-due-wrap>
              <span class="doc-field__label">Fecha de vencimiento</span>
              <input name="dueDate" type="date" />
            </label>
            <label class="doc-field doc-field--full">
              <span class="doc-field__label">Observaciones</span>
              <textarea name="notes" rows="3" maxlength="2000" placeholder="Notas internas de RRHH"></textarea>
            </label>
          </div>
        </details>
      </div>

      <footer class="doc-upload-form__foot">
        <p class="doc-upload-form__note">Los archivos se almacenan cifrados en el expediente del colaborador.</p>
        <div class="doc-upload-form__buttons">
          <button type="button" class="btn btn-outline" data-action="doc-close-upload">Cancelar</button>
          <button type="submit" class="btn btn-primary" data-doc-submit>${IC.upload || ""} Registrar</button>
        </div>
      </footer>
    </form>
  </aside>`;
}

/* ==========================================================================
   Shell
   ========================================================================== */

function renderContent(ctx) {
  /* Primera hidratación desde el servidor: skeleton en vez de un vacío engañoso. */
  if (ctx.loading) {
    if (ctx.ui.section === "overview") return renderSkeleton("cards", 6);
    return renderSkeleton(ctx.ui.viewMode === "cards" ? "cards" : "table", 8);
  }
  switch (ctx.ui.section) {
    case "overview":
      return renderOverview(ctx);
    case "gaps":
      return renderGapsView(ctx);
    case "files":
      return renderFilesView(ctx);
    default:
      if (ctx.ui.viewMode === "cards") return renderCardsView(ctx);
      if (ctx.ui.viewMode === "list") return renderListView(ctx);
      return renderTableView(ctx);
  }
}

export function renderDocumentsShell(ctx) {
  if (!ctx.perms.view) {
    return `<section class="documents-studio doc-app">
      <div class="doc-shell doc-shell--denied">
        ${renderEmptyState({
          title: "No tiene permiso para consultar documentos",
          hint: "Solicite el permiso de acceso a Gestión documental a un administrador.",
          icon: ctx.IC.lock || "",
          variant: "error"
        })}
      </div>
    </section>`;
  }

  return `<section class="documents-studio doc-app" data-doc-root data-doc-section="${escapeAttr(ctx.ui.section)}" data-doc-view="${escapeAttr(ctx.ui.viewMode)}"${ctx.ui.drawerDocId ? ' data-doc-drawer-open="1"' : ""}>
    <div class="doc-shell">
      ${renderRail(ctx)}
      <div class="doc-main">
        ${renderTopbar(ctx)}
        <div class="doc-content" data-doc-content data-doc-dropsurface>
          ${renderContent(ctx)}
        </div>
      </div>
      ${renderDrawer(ctx)}
    </div>
    ${renderBulkBar(ctx)}
    ${renderUploadDrawer(ctx)}
    <button type="button" class="doc-scrim" data-doc-scrim data-action="doc-dismiss-overlay" aria-label="Cerrar panel"${ctx.ui.uploadOpen || ctx.ui.railOpen ? "" : " hidden"}></button>
    <div class="doc-dropveil" data-doc-dropveil hidden aria-hidden="true">
      <div class="doc-dropveil__inner">${ctx.IC.upload || ""}<p>Suelte los archivos para subirlos al expediente</p></div>
    </div>
  </section>`;
}

export const DocumentsHtml = {
  renderDocumentsShell,
  renderRail,
  renderTopbar,
  renderTableView,
  renderCardsView,
  renderListView,
  renderFilesView,
  renderOverview,
  renderGapsView,
  renderDrawer,
  renderBulkBar,
  renderUploadDrawer,
  renderEmptyState,
  renderSkeleton,
  renderKebabMenu,
  tooltip
};
