/**
 * Selección y exportación para control, común a todos los módulos con información.
 *
 * Cada módulo registra una «colección» (lo que muestra su lista o tabla) y este archivo se encarga de:
 *  - poner una casilla en cada fila/tarjeta y «Seleccionar todo» (todo lo filtrado, no solo lo dibujado);
 *  - mostrar la barra «N seleccionados · Exportar selección · Exportar todo»;
 *  - generar el CSV (separador «;», UTF-8 con BOM, protegido contra fórmulas) con las columnas del módulo.
 *
 * Uso (desde un módulo):
 *   window.AntaresDataControls?.register({
 *     view: "transport-vehicles", id: "fleet", label: ["camión", "camiones"], filename: "camiones",
 *     anchor: (root) => root.querySelector(".vehicle-ops-cards"),   // la barra se inserta ANTES de este nodo
 *     itemSelector: "[data-vehicle-id]", idOf: (el) => el.dataset.vehicleId,
 *     records: () => filtrados,                                      // todo lo que cumple los filtros actuales
 *     recordId: (r) => r.id,
 *     columns: [{ label: "Placa", get: (r) => r.plate }]
 *   });
 */

const COLLECTIONS = new Map();
const SELECTION = new Map();

const W = typeof window !== "undefined" ? window : globalThis;

function collectionKey(cfg) {
  return `${cfg.view}::${cfg.id}`;
}

function selectionOf(cfg) {
  const key = collectionKey(cfg);
  if (!SELECTION.has(key)) SELECTION.set(key, new Set());
  return SELECTION.get(key);
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Celda CSV: sin saltos de línea y a prueba de fórmulas de Excel (=, @, +texto, -texto). */
export function csvCell(value) {
  let text = String(value ?? "").replace(/\r?\n/g, " ").trim();
  if (/^[=@]/.test(text) || /^[+-][^\d\s().-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** CSV con «;» y BOM UTF-8: Excel en español lo abre en columnas y con tildes. */
export function buildCsv(columns, rows) {
  const lines = [columns.map((c) => csvCell(c.label)).join(";")];
  rows.forEach((rec) => {
    lines.push(
      columns
        .map((c) => {
          let v;
          try {
            v = c.get(rec);
          } catch (_e) {
            v = "";
          }
          return csvCell(v);
        })
        .join(";")
    );
  });
  return `﻿${lines.join("\r\n")}\r\n`;
}

function bogotaStamp() {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  } catch (_e) {
    return new Date().toISOString().slice(0, 10);
  }
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
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

/** Fecha y hora en horario de Colombia: «2026-11-29 03:00». Vacío si el valor no es una fecha. */
export function fmtDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(d)
      .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
  } catch (_e) {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}

/** Solo la fecha (AAAA-MM-DD) en horario de Colombia. */
export function fmtDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const text = fmtDateTime(value);
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : String(value);
}

/** Texto plano de un fragmento HTML (por ejemplo, las etiquetas de estado con icono). */
export function plainText(html) {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function say(message, type = "info", ms) {
  const fn = W.notify;
  if (typeof fn === "function") fn(message, type, ms);
}

function labelsOf(cfg) {
  const l = Array.isArray(cfg.label) ? cfg.label : [String(cfg.label || "registro"), `${cfg.label || "registro"}s`];
  /* Tercer valor opcional «f»: concordancia en femenino («solicitudes seleccionadas»). */
  return { one: l[0], many: l[1] || `${l[0]}s`, fem: l[2] === "f" };
}

function recordsOf(cfg) {
  try {
    const list = cfg.records ? cfg.records() : [];
    return Array.isArray(list) ? list : [];
  } catch (_e) {
    return [];
  }
}

function idOfRecord(cfg, rec) {
  return String(cfg.recordId ? cfg.recordId(rec) : rec?.id ?? "");
}

function isAllowed(cfg) {
  try {
    return cfg.allowed ? Boolean(cfg.allowed()) : true;
  } catch (_e) {
    return false;
  }
}

/** Registra (o reemplaza) una colección. Es seguro llamarla varias veces. */
export function registerDataCollection(cfg) {
  if (!cfg || !cfg.view || !cfg.id || !Array.isArray(cfg.columns)) return;
  COLLECTIONS.set(collectionKey(cfg), cfg);
}

export function getSelectedIds(view, id) {
  return [...(SELECTION.get(`${view}::${id}`) || [])];
}

export function clearDataSelection(view, id) {
  if (id) SELECTION.delete(`${view}::${id}`);
  else [...SELECTION.keys()].filter((k) => k.startsWith(`${view}::`)).forEach((k) => SELECTION.delete(k));
}

/** Exporta lo seleccionado (mode «selected») o todo lo que cumple los filtros actuales (mode «all»). */
export function exportDataCollection(cfg, mode = "all") {
  if (!isAllowed(cfg)) {
    say(cfg.deniedMessage || "No tiene permiso para exportar esta información.", "error");
    return false;
  }
  const { one, many } = labelsOf(cfg);
  const shown = recordsOf(cfg);
  const sel = selectionOf(cfg);
  const rows = mode === "selected" ? shown.filter((r) => sel.has(idOfRecord(cfg, r))) : shown;
  if (!rows.length) {
    say(
      mode === "selected"
        ? `Seleccione al menos un ${one} para exportar.`
        : `No hay ${many} para exportar con los filtros actuales.`,
      "error"
    );
    return false;
  }
  const stamp = bogotaStamp();
  const suffix = mode === "selected" ? "_seleccion" : "";
  downloadCsv(`${cfg.filename || cfg.id}${suffix}_${stamp}.csv`, buildCsv(cfg.columns, rows));
  const noun = rows.length === 1 ? one : many;
  say(
    `Exportados ${rows.length} ${noun} a CSV.${cfg.note ? ` ${cfg.note}` : ""}`,
    "success",
    cfg.note ? 6500 : 4200
  );
  /* La bitácora registra la exportación, no los datos exportados. */
  try {
    W.logPortalAuditEvent?.(cfg.audit?.module || cfg.view, "update", {
      entityId: `csv-${stamp}`,
      entityLabel: cfg.audit?.label || cfg.filename || cfg.id,
      summary: `Exportación CSV${mode === "selected" ? " de la selección" : ""} · ${rows.length} ${noun}`
    });
  } catch (_e) {
    /* la auditoría nunca bloquea la descarga */
  }
  return true;
}

function setRowState(el, on) {
  el.classList.toggle("is-selected", on);
  const box = el.querySelector(":scope > .dc-pick input, :scope > .dc-col input, :scope .dc-pick input");
  if (box) box.checked = on;
}

function canSelect(cfg, root) {
  try {
    return cfg.selectable ? Boolean(cfg.selectable(root)) : true;
  } catch (_e) {
    return true;
  }
}

function refreshBar(cfg, bar, root) {
  const { one, many, fem } = labelsOf(cfg);
  const selectable = canSelect(cfg, root);
  bar.classList.toggle("dc-bar--export-only", !selectable);
  bar.querySelector(".dc-bar__all")?.toggleAttribute("hidden", !selectable);
  bar.querySelector("[data-dc-export='selected']")?.toggleAttribute("hidden", !selectable);
  const shown = recordsOf(cfg);
  const shownIds = new Set(shown.map((r) => idOfRecord(cfg, r)));
  const sel = selectionOf(cfg);
  [...sel].forEach((id) => {
    if (!shownIds.has(id)) sel.delete(id);
  });
  const n = sel.size;
  const total = shown.length;
  const all = bar.querySelector("[data-dc-all]");
  if (all) {
    all.checked = total > 0 && n === total;
    all.indeterminate = n > 0 && n < total;
    all.disabled = total === 0;
  }
  const count = bar.querySelector("[data-dc-count]");
  if (count && !selectable) {
    count.textContent = `${total} ${total === 1 ? one : many} ${cfg.scopeLabel || "en la lista"}${cfg.selectHint ? ` · ${cfg.selectHint}` : ""}`;
  } else if (count) {
    count.textContent =
      n > 0
        ? `${n} de ${total} ${total === 1 ? one : many} seleccionad${fem ? "a" : "o"}${n === 1 ? "" : "s"}`
        : `${total} ${total === 1 ? one : many} ${cfg.scopeLabel || "en la lista"}`;
  }
  const exportSel = bar.querySelector("[data-dc-export='selected']");
  if (exportSel) {
    exportSel.disabled = n === 0;
    exportSel.textContent = n > 0 ? `Exportar selección (${n})` : "Exportar selección";
  }
  const exportAll = bar.querySelector("[data-dc-export='all']");
  if (exportAll) {
    exportAll.disabled = total === 0;
    exportAll.textContent = `Exportar todo (${total})`;
  }
  const clear = bar.querySelector("[data-dc-clear]");
  if (clear) clear.hidden = n === 0 || !selectable;
  root.querySelectorAll(cfg.itemSelector).forEach((el) => {
    if (el.closest(".dc-bar")) return;
    const id = String(cfg.idOf ? cfg.idOf(el) : el.dataset.id || "");
    if (id) setRowState(el, sel.has(id));
  });
  const stickyHeads = root.querySelectorAll(`[data-dc-head="${CSS.escape(collectionKey(cfg))}"]`);
  stickyHeads.forEach((box) => {
    box.checked = total > 0 && n === total;
    box.indeterminate = n > 0 && n < total;
  });
}

function pickBoxHtml(cfg, labelText) {
  return `<input type="checkbox" data-dc-item aria-label="${esc(labelText)}" />`;
}

function decorateItems(cfg, root, bar) {
  const sel = selectionOf(cfg);
  const { one } = labelsOf(cfg);
  const items = [...root.querySelectorAll(cfg.itemSelector)].filter((el) => !el.closest(".dc-bar"));
  const tableHeads = new Set();
  items.forEach((el) => {
    const id = String(cfg.idOf ? cfg.idOf(el) : el.dataset.id || "");
    if (!id) return;
    if (el.dataset.dcReady === "1") return;
    el.dataset.dcReady = "1";
    const name = `Seleccionar ${one} ${el.getAttribute("aria-label") || ""}`.trim();
    if (el.tagName === "TR") {
      const td = document.createElement("td");
      td.className = "dc-col";
      td.innerHTML = pickBoxHtml(cfg, name);
      el.insertBefore(td, el.firstChild);
      const table = el.closest("table");
      if (table && !tableHeads.has(table)) {
        tableHeads.add(table);
        const headRow = table.querySelector("thead tr");
        if (headRow && !headRow.querySelector(".dc-col")) {
          const th = document.createElement("th");
          th.className = "dc-col";
          th.scope = "col";
          th.innerHTML = `<input type="checkbox" data-dc-head="${esc(collectionKey(cfg))}" aria-label="Seleccionar ${labelsOf(cfg).fem ? "todas las" : "todos los"} ${esc(labelsOf(cfg).many)} de la lista" />`;
          headRow.insertBefore(th, headRow.firstChild);
        }
      }
    } else {
      const host = (cfg.pickHost && cfg.pickHost(el)) || el;
      const wrap = document.createElement("label");
      wrap.className = host === el ? "dc-pick" : "dc-pick dc-pick--inline";
      wrap.innerHTML = pickBoxHtml(cfg, name);
      wrap.addEventListener("click", (ev) => ev.stopPropagation());
      host.insertBefore(wrap, host.firstChild);
      el.classList.add("dc-selectable");
    }
    const box = el.querySelector("input[data-dc-item]");
    box?.addEventListener("click", (ev) => ev.stopPropagation());
    box?.addEventListener("change", () => {
      if (box.checked) sel.add(id);
      else sel.delete(id);
      refreshBar(cfg, bar, root);
    });
  });
  root.querySelectorAll(`[data-dc-head="${CSS.escape(collectionKey(cfg))}"]`).forEach((head) => {
    head.addEventListener("change", () => toggleAll(cfg, bar, root, head.checked));
  });
}

function toggleAll(cfg, bar, root, on) {
  const sel = selectionOf(cfg);
  sel.clear();
  if (on) recordsOf(cfg).forEach((r) => sel.add(idOfRecord(cfg, r)));
  refreshBar(cfg, bar, root);
}

function buildBar(cfg) {
  const { many } = labelsOf(cfg);
  const bar = document.createElement("div");
  bar.className = "dc-bar";
  bar.dataset.dc = cfg.id;
  bar.setAttribute("role", "group");
  bar.setAttribute("aria-label", `Selección y exportación de ${many}`);
  bar.innerHTML = `
    <label class="dc-bar__all"><input type="checkbox" data-dc-all /><span>Seleccionar todo</span></label>
    <span class="dc-bar__count" data-dc-count aria-live="polite"></span>
    <span class="dc-bar__spacer"></span>
    <button type="button" class="btn btn-sm btn-outline" data-dc-clear hidden>Quitar selección</button>
    <button type="button" class="btn btn-sm btn-outline" data-dc-export="selected" disabled>Exportar selección</button>
    <button type="button" class="btn btn-sm btn-outline" data-dc-export="all">Exportar todo</button>`;
  return bar;
}

/** Se llama tras dibujar un módulo: añade casillas y barra a cada colección registrada para esa vista. */
export function mountDataControls(view) {
  const root = document.getElementById("view-root");
  if (!root) return;
  const key = String(view || "");
  COLLECTIONS.forEach((cfg) => {
    if (cfg.view !== key) return;
    root.querySelectorAll(`.dc-bar[data-dc="${CSS.escape(cfg.id)}"]`).forEach((n) => n.remove());
    if (!isAllowed(cfg)) return;
    let anchor = null;
    try {
      anchor = cfg.anchor ? cfg.anchor(root) : null;
    } catch (_e) {
      anchor = null;
    }
    if (!anchor || !anchor.parentNode) return;
    const bar = buildBar(cfg);
    anchor.parentNode.insertBefore(bar, anchor);
    bar.querySelector("[data-dc-all]")?.addEventListener("change", (ev) => toggleAll(cfg, bar, root, ev.target.checked));
    bar.querySelector("[data-dc-clear]")?.addEventListener("click", () => toggleAll(cfg, bar, root, false));
    bar.querySelectorAll("[data-dc-export]").forEach((btn) =>
      btn.addEventListener("click", () => exportDataCollection(cfg, btn.getAttribute("data-dc-export") || "all"))
    );
    if (canSelect(cfg, root)) decorateItems(cfg, root, bar);
    refreshBar(cfg, bar, root);
  });
}

/** Recalcula los contadores de las barras ya dibujadas (por ejemplo, tras escribir en un buscador de la propia página). */
export function refreshDataControls(view) {
  const root = document.getElementById("view-root");
  if (!root) return;
  COLLECTIONS.forEach((cfg) => {
    if (cfg.view !== String(view || "")) return;
    root.querySelectorAll(`.dc-bar[data-dc="${CSS.escape(cfg.id)}"]`).forEach((bar) => refreshBar(cfg, bar, root));
  });
}

const api = {
  refresh: refreshDataControls,
  register: registerDataCollection,
  mount: mountDataControls,
  exportCollection: exportDataCollection,
  buildCsv,
  csvCell,
  selected: getSelectedIds,
  clear: clearDataSelection,
  fmt: { dateTime: fmtDateTime, date: fmtDate, plain: plainText }
};
W.AntaresDataControls = api;
export default api;
