/**
 * Transporte · Historial (`history`): trazabilidad unificada del portal.
 */
const HISTORY_RENDER_WINDOW = 50;

function normalizeHistoryLayout(raw) {
  return String(raw || "").trim().toLowerCase() === "list" ? "list" : "cards";
}

function historyViewToggleHtml(layout) {
  const viewLayout = normalizeHistoryLayout(layout);
  return `<div class="hist-trace-layout-toggle" role="group" aria-label="Formato de visualización">
    <button type="button" class="btn btn-sm ${viewLayout === "cards" ? "btn-primary" : "btn-outline"}" data-action="history-layout" data-layout="cards">${IC.grid || IC.layers} Línea de tiempo</button>
    <button type="button" class="btn btn-sm ${viewLayout === "list" ? "btn-primary" : "btn-outline"}" data-action="history-layout" data-layout="list">${IC.list || IC.file} Tabla</button>
  </div>`;
}

globalThis.normalizeHistoryLayout = normalizeHistoryLayout;
globalThis.historyViewToggleHtml = historyViewToggleHtml;

function historyRenderWindowSlice(list, limit) {
  const arr = Array.isArray(list) ? list : [];
  const max = Number.isFinite(limit) && limit > 0 ? limit : HISTORY_RENDER_WINDOW;
  return arr.slice(0, max);
}

function historyRenderWindowMoreBar(total, shown, action) {
  if (total <= shown) return "";
  return `<div class="render-window-more hist-trace-more"><button type="button" class="btn btn-outline btn-sm" data-action="${escapeAttr(action)}">${IC.chevronDown || ""} Cargar más · ${shown} de ${total}</button></div>`;
}

function historyTraceHaystack(entry) {
  return `${entry?.moduleLabel || ""} ${entry?.entityLabel || ""} ${entry?.summary || ""} ${entry?.actor || ""} ${entry?.action || ""}`
    .toLowerCase();
}

function historyTraceDayKey(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function historyTraceDayLabel(dayKey) {
  if (!dayKey) return "Sin fecha";
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  if (Number.isNaN(date.getTime())) return dayKey;
  const today = new Date();
  const todayKey = historyTraceDayKey(today.toISOString());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = historyTraceDayKey(yesterday.toISOString());
  if (dayKey === todayKey) return "Hoy";
  if (dayKey === yesterdayKey) return "Ayer";
  return date.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function groupHistoryTraceByDay(entries) {
  const map = new Map();
  for (const entry of entries) {
    const key = historyTraceDayKey(entry.ts);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

function collectHistoryModuleOptions(entries) {
  const set = new Set();
  for (const entry of entries) {
    const label = String(entry?.moduleLabel || "").trim();
    if (label) set.add(label);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

const HISTORY_TRACE_MODULE_ICONS = {
  Dashboard: "grid",
  "Mis solicitudes": "inbox",
  Solicitudes: "inbox",
  Viajes: "truck",
  Camiones: "fuel",
  Conductores: "user",
  Calendario: "calendar",
  Reportería: "activity",
  "Centro de reportería": "activity",
  "Gestión humana": "briefcase",
  Contratación: "userPlus",
  "Cumplimiento laboral y SST": "shield",
  "Contacto web (B2B)": "globe",
  "Usuarios y permisos": "users",
  Autorizaciones: "check",
  "Centro de aprobaciones": "check",
  "Mi perfil": "badge",
  Notificaciones: "bell",
  Timbre: "bell",
  Avisos: "alertTriangle"
};

function historyTraceModuleIconKey(moduleLabel) {
  const label = String(moduleLabel || "").trim();
  if (HISTORY_TRACE_MODULE_ICONS[label]) return HISTORY_TRACE_MODULE_ICONS[label];
  const lower = label.toLowerCase();
  if (lower.includes("solicitud")) return "inbox";
  if (lower.includes("viaje")) return "truck";
  if (lower.includes("camion") || lower.includes("flota") || lower.includes("combustible")) return "fuel";
  if (lower.includes("conductor")) return "user";
  if (lower.includes("nomina") || lower.includes("gestión humana") || lower.includes("gestion humana")) return "briefcase";
  if (lower.includes("contrat")) return "userPlus";
  if (lower.includes("sst") || lower.includes("cumplimiento")) return "shield";
  if (lower.includes("usuario") || lower.includes("permiso")) return "users";
  if (lower.includes("autoriz")) return "check";
  if (lower.includes("notific")) return "bell";
  return "layers";
}

function historyTraceModuleIconHtml(moduleLabel, className = "hist-trace-module-ico") {
  const key = historyTraceModuleIconKey(moduleLabel);
  const svg = IC[key] || IC.layers;
  return `<span class="${escapeAttr(className)}" aria-hidden="true">${svg}</span>`;
}

globalThis.historyTraceModuleIconHtml = historyTraceModuleIconHtml;
globalThis.historyTraceModuleIconKey = historyTraceModuleIconKey;

function readHistoryTraceFilterInputs(formEl) {
  const traceFilter = formEl || document.getElementById("history-trace-filter");
  const data = traceFilter ? readFormEntriesNormalized(traceFilter) : {};
  const histUi = state.historyUi || { actionFilter: "all", moduleFilter: "", layout: "cards" };
  return {
    actionFilter: String(histUi.actionFilter || "all"),
    moduleFilter: String(data.module || histUi.moduleFilter || "").trim(),
    q: data.q,
    from: data.from,
    to: data.to
  };
}

function getHistoryTraceFilteredEntries(formEl) {
  return applyHistoryTraceFilters(buildHistoryAuditEntries(), readHistoryTraceFilterInputs(formEl));
}

function historyTraceActionLabel(action) {
  const fn = globalThis.historyAuditActionLabel;
  return typeof fn === "function" ? fn(action) : String(action || "update");
}

function exportHistoryTraceCsv(entries) {
  const list = Array.isArray(entries) ? entries : [];
  if (!list.length) {
    notify("No hay eventos para exportar con los filtros actuales.", "warn");
    return;
  }
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const columns = [
    { key: "fecha", label: "Fecha y hora" },
    { key: "accion", label: "Acción" },
    { key: "modulo", label: "Módulo" },
    { key: "entidad", label: "Entidad" },
    { key: "resumen", label: "Resumen" },
    { key: "usuario", label: "Usuario" }
  ];
  const rows = list.map((entry) => ({
    fecha: fmtDate(entry.ts),
    accion: historyTraceActionLabel(entry.action),
    modulo: String(entry.moduleLabel || ""),
    entidad: String(entry.entityLabel || ""),
    resumen: String(entry.summary || ""),
    usuario: String(entry.actor || "—")
  }));
  const header = columns.map((col) => esc(col.label)).join(",");
  const body = rows.map((row) => columns.map((col) => esc(row[col.key])).join(",")).join("\n");
  const csv = `\uFEFF${header}\n${body}`;
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trazabilidad_portal_${stamp}.csv`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 400);
  notify(`Exportados ${list.length} evento${list.length === 1 ? "" : "s"} a CSV.`, "success");
}

function historyTraceStats(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const modules = new Set(list.map((e) => String(e.moduleLabel || "").trim()).filter(Boolean));
  return {
    total: list.length,
    create: list.filter((e) => e.action === "create").length,
    update: list.filter((e) => e.action === "update").length,
    delete: list.filter((e) => e.action === "delete").length,
    modules: modules.size
  };
}

function applyHistoryTraceFilters(entries, opts = {}) {
  let out = Array.isArray(entries) ? [...entries] : [];
  const actionFilter = String(opts.actionFilter || "all").trim().toLowerCase();
  const moduleFilter = String(opts.moduleFilter || "").trim();
  const q = String(opts.q || "").trim().toLowerCase();
  const from = String(opts.from || "").trim();
  const to = String(opts.to || "").trim();

  if (actionFilter && actionFilter !== "all") {
    out = out.filter((e) => String(e.action || "") === actionFilter);
  }
  if (moduleFilter) {
    out = out.filter((e) => String(e.moduleLabel || "") === moduleFilter);
  }
  if (from) {
    out = out.filter((e) => String(e.ts || "").slice(0, 10) >= from);
  }
  if (to) {
    out = out.filter((e) => String(e.ts || "").slice(0, 10) <= to);
  }
  if (q) {
    out = out.filter((e) => historyTraceHaystack(e).includes(q));
  }
  return out.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}

function renderHistoryTraceKpis(stats) {
  const items = [
    { label: "Eventos", value: stats.total, tone: "primary" },
    { label: "Creaciones", value: stats.create, tone: stats.create ? "ok" : "neutral" },
    { label: "Actualizaciones", value: stats.update, tone: stats.update ? "warn" : "neutral" },
    { label: "Eliminaciones", value: stats.delete, tone: stats.delete ? "danger" : "neutral" },
    { label: "Módulos", value: stats.modules, tone: "neutral" }
  ];
  return `<dl class="hist-trace-kpis" aria-label="Resumen de trazabilidad">${items
    .map(({ label, value, tone }) => {
      const toneClass = tone && tone !== "neutral" ? ` hist-trace-kpi--${tone}` : "";
      return `<div class="hist-trace-kpi${toneClass}"><dt>${escapeHtml(label)}</dt><dd><strong>${escapeHtml(String(value))}</strong></dd></div>`;
    })
    .join("")}</dl>`;
}

function renderHistoryModuleFilterChips(allEntries, filterOpts, activeModule) {
  const base = applyHistoryTraceFilters(allEntries, { ...filterOpts, moduleFilter: "" });
  const counts = new Map();
  for (const entry of base) {
    const label = String(entry.moduleLabel || "").trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  const active = String(activeModule || "");
  const chip = (moduleId, labelHtml, count, title = "") => {
    const isActive = moduleId === active || (!moduleId && !active);
    return `<button type="button" class="hist-trace-module-chip${isActive ? " is-active" : ""}" data-action="history-module-filter" data-module="${escapeAttr(moduleId)}"${title ? ` title="${escapeAttr(title)}"` : ""}>
      ${labelHtml}
      <span class="hist-trace-module-chip__count">${count}</span>
    </button>`;
  };
  const allLabel = `<span class="hist-trace-module-chip__ico" aria-hidden="true">${IC.layers}</span><span class="hist-trace-module-chip__label">Todos los módulos</span>`;
  let html = `<div class="hist-trace-module-filters" role="group" aria-label="Filtrar por módulo">${chip("", allLabel, base.length, "Ver todos los módulos")}`;
  for (const [label, count] of sorted) {
    const labelHtml = `${historyTraceModuleIconHtml(label, "hist-trace-module-chip__ico")}<span class="hist-trace-module-chip__label">${escapeHtml(label)}</span>`;
    html += chip(label, labelHtml, count, label);
  }
  html += `</div>`;
  return html;
}

function renderHistoryActionFilters(active) {
  const cur = String(active || "all");
  const pill = (key, label) =>
    `<button type="button" class="hist-trace-action-pill${cur === key ? " is-active" : ""}" data-action="history-action-filter" data-filter="${escapeAttr(key)}">${escapeHtml(label)}</button>`;
  return `<div class="hist-trace-action-filters" role="group" aria-label="Tipo de movimiento">
    ${pill("all", "Todos")}
    ${pill("create", "Creaciones")}
    ${pill("update", "Actualizaciones")}
    ${pill("delete", "Eliminaciones")}
  </div>`;
}

function renderHistoryTraceToolbar(viewLayout, moduleOptions, moduleFilter) {
  const moduleOpts = moduleOptions
    .map((m) => `<option value="${escapeAttr(m)}"${moduleFilter === m ? " selected" : ""}>${escapeHtml(m)}</option>`)
    .join("");
  return `<form id="history-trace-filter" class="hist-trace-filter-form" novalidate>
    <div class="hist-trace-toolbar">
      <label class="hist-trace-search">
        <span class="visually-hidden">Buscar en trazabilidad</span>
        ${IC.search || IC.filter}
        <input type="search" name="q" placeholder="Módulo, entidad, resumen, usuario…" autocomplete="off" />
      </label>
      ${historyViewToggleHtml(viewLayout)}
      <button type="button" class="btn btn-sm btn-action hist-trace-export-btn" data-action="history-export-csv">${IC.download || ""} Exportar CSV</button>
      <details class="hist-trace-advanced">
        <summary class="btn btn-sm btn-action">${IC.filter} Periodo</summary>
        <div class="hist-trace-advanced-body">
          <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="from" /></label>
          <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="to" /></label>
          <label class="hist-trace-module-select">${fieldLabel(IC.layers, "Módulo (lista)")}<select name="module"><option value="">Todos los módulos</option>${moduleOpts}</select></label>
          <button class="btn btn-sm btn-action" type="reset">${IC.x} Limpiar filtros</button>
        </div>
      </details>
    </div>
  </form>`;
}

function renderHistoryTraceFeedGrouped(entries) {
  if (!entries.length) {
    return `<div class="hist-trace-empty"><span class="hist-trace-empty__icon" aria-hidden="true">${IC.activity || IC.layers}</span><p>Sin eventos con los filtros actuales</p><p class="muted">Ajuste el periodo, el módulo o el tipo de movimiento.</p></div>`;
  }
  const groups = groupHistoryTraceByDay(entries);
  return `<div class="hist-trace-feed" id="history-trace-results-grid">${groups
    .map(([dayKey, items]) => {
      const label = historyTraceDayLabel(dayKey);
      return `<section class="hist-trace-day" aria-label="${escapeAttr(label)}">
        <header class="hist-trace-day__head">
          <h3 class="hist-trace-day__title"><time datetime="${escapeAttr(dayKey)}">${escapeHtml(label)}</time></h3>
          <span class="hist-trace-day__count">${items.length} evento${items.length === 1 ? "" : "s"}</span>
        </header>
        <div class="hist-trace-day__body">${items.map((entry) => renderHistoryAuditCard(entry)).join("")}</div>
      </section>`;
    })
    .join("")}</div>`;
}

function renderHistoryTraceResults(entries, layout) {
  const viewLayout = normalizeHistoryLayout(layout);
  if (!entries.length) {
    return `<div class="hist-trace-empty"><span class="hist-trace-empty__icon" aria-hidden="true">${IC.activity || IC.layers}</span><p>Sin eventos con los filtros actuales</p><p class="muted">Los movimientos del sistema aparecerán aquí conforme se registren.</p></div>`;
  }
  if (viewLayout === "list") {
    return renderHistoryAuditList(entries, "list");
  }
  return renderHistoryTraceFeedGrouped(entries);
}

function historyHtml() {
  const histUi = state.historyUi || { layout: "cards", actionFilter: "all", moduleFilter: "" };
  state.historyUi = histUi;
  const actionFilter = String(histUi.actionFilter || "all");
  const moduleFilter = String(histUi.moduleFilter || "");
  const viewLayout = normalizeHistoryLayout(histUi.layout);
  const viewLayoutHint = viewLayout === "list" ? " · vista tabla" : " · línea de tiempo";

  const allEntries = buildHistoryAuditEntries();
  const moduleOptions = collectHistoryModuleOptions(allEntries);
  const chipFilterOpts = { actionFilter, q: "", from: "", to: "" };
  const filtered = applyHistoryTraceFilters(allEntries, { actionFilter, moduleFilter });
  const stats = historyTraceStats(filtered);
  const renderLimit = Number(state.historyRenderLimit) > 0 ? Number(state.historyRenderLimit) : HISTORY_RENDER_WINDOW;
  const shown = historyRenderWindowSlice(filtered, renderLimit);

  const hero = `<header class="hist-trace-hero">
    <div class="hist-trace-hero__brand">
      <span class="hist-trace-hero__badge">${IC.activity || ""} Trazabilidad</span>
      <h2>Historial del sistema</h2>
      <p class="hist-trace-hero__lead">Línea de tiempo unificada de creaciones, actualizaciones y eliminaciones en todos los módulos del portal.</p>
    </div>
    ${renderHistoryTraceKpis(stats)}
  </header>`;

  const body = `<div class="hist-trace-workspace">
    ${renderHistoryActionFilters(actionFilter)}
    ${renderHistoryModuleFilterChips(allEntries, chipFilterOpts, moduleFilter)}
    ${renderHistoryTraceToolbar(viewLayout, moduleOptions, moduleFilter)}
    <div class="hist-trace-result-bar">
      <p class="hist-trace-result-meta"><span id="history-trace-result-count">${filtered.length}</span> evento${filtered.length === 1 ? "" : "s"}${escapeHtml(viewLayoutHint)}</p>
      <div class="hist-trace-result-actions">
        <span class="muted hist-trace-result-sort">Más recientes primero</span>
        <button type="button" class="btn btn-sm btn-outline hist-trace-export-btn hist-trace-export-btn--inline" data-action="history-export-csv"${filtered.length ? "" : " disabled"}>${IC.download || ""} CSV (${filtered.length})</button>
      </div>
    </div>
    <div id="history-trace-results">${renderHistoryTraceResults(shown, viewLayout)}</div>
    ${historyRenderWindowMoreBar(filtered.length, shown.length, "history-render-more")}
  </div>`;

  return `<section class="history-studio hist-trace-shell hr-flow-shell" data-history-trace="1">
    ${hero}
    ${body}
  </section>`;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ historyHtml });
})();

(function registerHistoryPortalBinds() {
  "use strict";

  function bindHistoryPortalControls() {
    if (String(state.currentView || "") !== "history" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='history-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = normalizeHistoryLayout(btn.dataset.layout);
        state.historyUi = { ...(state.historyUi || { actionFilter: "all", moduleFilter: "" }), layout };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='history-action-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = String(btn.dataset.filter || "all");
        state.historyUi = { ...(state.historyUi || { layout: "cards", moduleFilter: "" }), actionFilter: next };
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='history-module-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = String(btn.dataset.module || "").trim();
        state.historyUi = { ...(state.historyUi || { layout: "cards", actionFilter: "all" }), moduleFilter: next };
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        const traceFilter = document.getElementById("history-trace-filter");
        const moduleSelect = traceFilter?.querySelector("select[name='module']");
        if (moduleSelect) moduleSelect.value = next;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='history-export-csv']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        const entries = getHistoryTraceFilteredEntries(document.getElementById("history-trace-filter"));
        exportHistoryTraceCsv(entries);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='history-render-more']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.historyRenderLimit = (Number(state.historyRenderLimit) || HISTORY_RENDER_WINDOW) + HISTORY_RENDER_WINDOW;
        renderPortalView();
      });
    });

    const traceFilter = document.getElementById("history-trace-filter");
    if (traceFilter) {
      portalUpgradeDates(traceFilter);
      const moduleSelect = traceFilter.querySelector("select[name='module']");
      if (moduleSelect && state.historyUi?.moduleFilter) {
        moduleSelect.value = String(state.historyUi.moduleFilter || "");
      }

      const refreshTraceResults = () => {
        const histUi = state.historyUi || { actionFilter: "all", moduleFilter: "", layout: "cards" };
        const layout = normalizeHistoryLayout(histUi.layout);
        const filterInputs = readHistoryTraceFilterInputs(traceFilter);
        if (filterInputs.moduleFilter !== String(histUi.moduleFilter || "")) {
          state.historyUi = { ...histUi, moduleFilter: filterInputs.moduleFilter };
        }
        const items = applyHistoryTraceFilters(buildHistoryAuditEntries(), filterInputs);
        const chipOpts = { ...filterInputs, moduleFilter: "" };
        const limit = Number(state.historyRenderLimit) > 0 ? Number(state.historyRenderLimit) : HISTORY_RENDER_WINDOW;
        const shownItems = historyRenderWindowSlice(items, limit);
        const mount = document.getElementById("history-trace-results");
        const countEl = document.getElementById("history-trace-result-count");
        const kpiRoot = nodes.viewRoot.querySelector(".hist-trace-kpis");
        const chipRoot = nodes.viewRoot.querySelector(".hist-trace-module-filters");
        if (countEl) countEl.textContent = String(items.length);
        nodes.viewRoot.querySelectorAll("[data-action='history-export-csv']").forEach((exportBtn) => {
          exportBtn.disabled = items.length === 0;
          if (exportBtn.classList.contains("hist-trace-export-btn--inline")) {
            exportBtn.innerHTML = `${IC.download || ""} CSV (${items.length})`;
          }
        });
        if (kpiRoot) {
          const stats = historyTraceStats(items);
          kpiRoot.outerHTML = renderHistoryTraceKpis(stats);
        }
        if (chipRoot) {
          chipRoot.outerHTML = renderHistoryModuleFilterChips(buildHistoryAuditEntries(), chipOpts, filterInputs.moduleFilter);
          nodes.viewRoot.querySelectorAll("[data-action='history-module-filter']").forEach((chipBtn) => {
            chipBtn.addEventListener("click", () => {
              const next = String(chipBtn.dataset.module || "").trim();
              state.historyUi = { ...(state.historyUi || { layout: "cards", actionFilter: "all" }), moduleFilter: next };
              state.historyRenderLimit = HISTORY_RENDER_WINDOW;
              const sel = traceFilter?.querySelector("select[name='module']");
              if (sel) sel.value = next;
              renderPortalView();
            });
          });
        }
        if (mount) mount.innerHTML = renderHistoryTraceResults(shownItems, layout);
        const moreBar = nodes.viewRoot.querySelector(".hist-trace-more");
        if (moreBar) {
          const parent = moreBar.parentElement;
          const nextBar = historyRenderWindowMoreBar(items.length, shownItems.length, "history-render-more");
          if (nextBar) moreBar.outerHTML = nextBar;
          else moreBar.remove();
        } else if (items.length > shownItems.length) {
          const resultsMount = document.getElementById("history-trace-results");
          if (resultsMount?.parentElement) {
            resultsMount.insertAdjacentHTML("afterend", historyRenderWindowMoreBar(items.length, shownItems.length, "history-render-more"));
            nodes.viewRoot.querySelector("[data-action='history-render-more']")?.addEventListener("click", () => {
              state.historyRenderLimit = (Number(state.historyRenderLimit) || HISTORY_RENDER_WINDOW) + HISTORY_RENDER_WINDOW;
              renderPortalView();
            });
          }
        }
      };

      window.__historyTraceApplyFilters = refreshTraceResults;

      traceFilter.addEventListener("submit", (event) => {
        event.preventDefault();
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        refreshTraceResults();
      });
      traceFilter.addEventListener("change", () => {
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        refreshTraceResults();
      });
      const liveSearch = traceFilter.querySelector("input[name='q']");
      if (liveSearch) {
        liveSearch.addEventListener("input", () => {
          state.historyRenderLimit = HISTORY_RENDER_WINDOW;
          refreshTraceResults();
        });
      }
      traceFilter.addEventListener("reset", () => {
        state.historyUi = { ...(state.historyUi || {}), moduleFilter: "" };
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        window.requestAnimationFrame(() => refreshTraceResults());
      });
    }
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.history = bindHistoryPortalControls;
})();
