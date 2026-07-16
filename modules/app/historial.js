/**
 * Transporte · Historial (`history`): trazabilidad unificada del portal.
 */
const HISTORY_RENDER_WINDOW = 50;
const HISTORY_DEFAULT_LAYOUT = "cards";

function defaultHistoryUi() {
  return { layout: HISTORY_DEFAULT_LAYOUT, actionFilter: "all", moduleFilter: "" };
}

function normalizeHistoryLayout(raw) {
  const value = String(raw || "").trim().toLowerCase();
  return value === "list" || value === "cards" ? value : HISTORY_DEFAULT_LAYOUT;
}

function historyTraceRelativeTime(ts) {
  const t = new Date(ts).getTime();
  if (!Number.isFinite(t)) return "";
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return "";
}

function historyTraceActionIcon(action) {
  if (action === "create") return IC.plus || IC.check;
  if (action === "delete") return IC.trash || IC.x;
  return IC.edit || IC.activity;
}

function historyTraceActorInitials(label) {
  const text = String(label || "").trim();
  if (!text) return "?";
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase();
}

globalThis.historyTraceRelativeTime = historyTraceRelativeTime;
globalThis.historyTraceActionIcon = historyTraceActionIcon;
globalThis.historyTraceActorInitials = historyTraceActorInitials;

function historyViewToggleHtml(layout) {
  const viewLayout = normalizeHistoryLayout(layout);
  return `<div class="hist-trace-layout-toggle" role="group" aria-label="Formato de visualización">
    <button type="button" class="hist-trace-layout-btn${viewLayout === "cards" ? " is-active" : ""}" data-action="history-layout" data-layout="cards" aria-pressed="${viewLayout === "cards"}">${IC.grid || IC.layers}<span>Línea de tiempo</span></button>
    <button type="button" class="hist-trace-layout-btn${viewLayout === "list" ? " is-active" : ""}" data-action="history-layout" data-layout="list" aria-pressed="${viewLayout === "list"}">${IC.list || IC.file}<span>Tabla</span></button>
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
  return `${entry?.moduleLabel || ""} ${entry?.entityLabel || ""} ${entry?.summary || ""} ${entry?.usuario || entry?.actor || ""} ${entry?.action || ""}`
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
  const listFn = globalThis.listPortalAuditModuleLabels;
  if (typeof listFn === "function") {
    for (const label of listFn()) {
      if (label) set.add(label);
    }
  }
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
  Historial: "layers",
  Reportería: "activity",
  "Centro de reportería": "activity",
  "Gestión humana": "briefcase",
  Contratación: "userPlus",
  "Cumplimiento laboral y SST": "shield",
  "Gestión documental": "file",
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
  const fn = globalThis.portalAuditModuleIconKey;
  if (typeof fn === "function") return fn(moduleLabel);
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
  const histUi = state.historyUi || defaultHistoryUi();
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

function historyTraceActionTone(action) {
  const fn = globalThis.historyAuditActionStatus;
  return typeof fn === "function" ? fn(action) : "status-pendiente";
}

function openHistoryAuditEventDetail(entryId) {
  const id = String(entryId || "").trim();
  if (!id) return;
  const entry = (typeof buildHistoryAuditEntries === "function" ? buildHistoryAuditEntries() : []).find(
    (row) => String(row?.id || "") === id
  );
  if (!entry) {
    notify("No se encontró el evento de auditoría.", "error");
    return;
  }
  const actionLabel = historyTraceActionLabel(entry.action);
  const actionTone = historyTraceActionTone(entry.action);
  const actorLabel =
    (typeof historyAuditUsuarioFromLogRow === "function"
      ? historyAuditUsuarioFromLogRow(entry, { fallbackToSession: false })
      : entry.usuario || entry.actor) || "Sin registrar";
  const changesText = String(entry.changesText || "").trim();
  const pairs = [
    ["Entidad", `<strong>${escapeHtml(entry.entityLabel || "—")}</strong>`],
    ["Resumen", escapeHtml(entry.summary || "Sin resumen")],
    ["Usuario", escapeHtml(String(actorLabel))],
    ["Fecha", escapeHtml(fmtDate(entry.ts))],
    ["Módulo", escapeHtml(String(entry.moduleLabel || "—"))],
    ["Acción", `<span class="status ${escapeAttr(actionTone)}">${escapeHtml(actionLabel)}</span>`]
  ];
  if (changesText) pairs.push(["Detalle del cambio", escapeHtml(changesText)]);

  const hasLinked =
    String(entry.detailAction || "").trim() && String(entry.detailId || "").trim();
  const secondaryActionsHtml = hasLinked
    ? `<button type="button" class="btn btn-outline" id="hist-audit-linked-detail">${IC.eye || ""}<span>Ver registro vinculado</span></button>`
    : "";

  if (typeof openPortalDetailSheet === "function") {
    openPortalDetailSheet({
      title: "Detalle del evento",
      sheetTitle: String(entry.entityLabel || "Evento de auditoría"),
      subtitleHtml: `${escapeHtml(String(entry.moduleLabel || ""))} · ${escapeHtml(fmtDate(entry.ts))}`,
      statusHtml: `<span class="status ${escapeAttr(actionTone)}">${escapeHtml(actionLabel)}</span>`,
      moduleIcon: "activity",
      moduleTone: "blue",
      sections: [{ icon: "layers", pairs }],
      secondaryActionsHtml,
      afterMount: (content) => {
        const linkedBtn = content?.querySelector?.("#hist-audit-linked-detail");
        if (!linkedBtn || !hasLinked) return;
        linkedBtn.addEventListener("click", () => {
          document.getElementById("crud-modal")?.classList.add("hidden");
          const action = String(entry.detailAction || "").trim();
          const detailId = String(entry.detailId || "").trim();
          if (action === "detail" && typeof openRequestDetailModal === "function") {
            const req =
              typeof findTransportRequestById === "function" ? findTransportRequestById(detailId) : null;
            if (req) {
              openRequestDetailModal(req);
              return;
            }
          }
          if (action === "deleted-request-snapshot-detail" && typeof openDeletedTransportRequestAuditModal === "function") {
            const rows = typeof read === "function" ? read(KEYS.deletedTransportRequestLogs, []) : [];
            const row = rows.find((r) => String(r.id) === detailId);
            if (row) {
              openDeletedTransportRequestAuditModal(row);
              return;
            }
          }
          if (action === "deleted-trip-snapshot-detail" && typeof openDeletedTransportTripAuditModal === "function") {
            const rows = typeof read === "function" ? read(KEYS.deletedTransportTripLogs, []) : [];
            const row = rows.find((r) => String(r.id) === detailId);
            if (row) {
              openDeletedTransportTripAuditModal(row);
              return;
            }
          }
          notify("No se pudo abrir el registro vinculado.", "warn");
        });
      }
    });
    return;
  }

  if (typeof openInfoModal === "function") {
    openInfoModal({
      title: "Detalle del evento",
      subtitle: `${entry.moduleLabel || ""} · ${fmtDate(entry.ts)}`,
      bodyHtml: `<dl class="hist-trace-event-detail">${pairs
        .map(
          ([label, value]) =>
            `<div><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`
        )
        .join("")}</dl>`,
      secondaryActionsHtml
    });
  }
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
    { key: "cambios", label: "Detalle del cambio" },
    { key: "usuario", label: "Usuario" }
  ];
  const rows = list.map((entry) => ({
    fecha: fmtDate(entry.ts),
    accion: historyTraceActionLabel(entry.action),
    modulo: String(entry.moduleLabel || ""),
    entidad: String(entry.entityLabel || ""),
    resumen: String(entry.summary || ""),
    cambios: String(entry.changesText || ""),
    usuario: String(
      (typeof historyAuditUsuarioFromLogRow === "function"
        ? historyAuditUsuarioFromLogRow(entry, { fallbackToSession: false })
        : entry.usuario) || "Sin registrar"
    )
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
  globalThis.logPortalAuditEvent?.("history", "update", {
    entityId: `csv-${stamp}`,
    entityLabel: "Trazabilidad",
    summary: `Exportación CSV · ${list.length} evento${list.length === 1 ? "" : "s"}`
  });
}

/**
 * Depuración del historial (solo administradores): elimina en PostgreSQL los eventos que
 * coinciden con los filtros activos (fecha/módulo/tipo de movimiento) o, si no hay filtros
 * activos, todo el historial. Requiere motivo y confirmación explícita porque es irreversible.
 */
function historyDeleteEventsFlow(formEl) {
  if (!historyCurrentUserIsAdmin()) {
    notify("Solo un administrador puede eliminar el historial de auditoría.", "error");
    return;
  }
  if (!(typeof AntaresPortalAuditSync !== "undefined" && typeof AntaresPortalAuditSync.deleteEventsFromApi === "function")) {
    notify("Esta acción requiere conexión con el servidor.", "error");
    return;
  }
  const traceFilter = formEl || document.getElementById("history-trace-filter");
  const filterInputs = readHistoryTraceFilterInputs(traceFilter);
  const activeAction = String(filterInputs.actionFilter || "all");
  const hasFilters = Boolean(filterInputs.moduleFilter || filterInputs.from || filterInputs.to || activeAction !== "all");
  const matching = applyHistoryTraceFilters(buildHistoryAuditEntries(), filterInputs);
  if (!matching.length) {
    notify("No hay eventos que coincidan con los filtros actuales para eliminar.", "warn");
    return;
  }
  const count = matching.length;
  const scopeDescription = hasFilters
    ? `los ${count} evento${count === 1 ? "" : "s"} que coinciden con los filtros activos`
    : `TODO el historial (${count} evento${count === 1 ? "" : "s"})`;

  openConfirmReasonModal({
    title: "Eliminar historial de auditoría",
    message: `Esta acción eliminará de forma permanente ${scopeDescription}. Esta operación no se puede deshacer.`,
    confirmText: "Eliminar historial",
    onConfirm: async (motivo) => {
      const payload = { motivo };
      if (hasFilters) {
        if (filterInputs.from) payload.from = filterInputs.from;
        if (filterInputs.to) payload.to = filterInputs.to;
        if (filterInputs.moduleFilter) {
          const moduleId =
            typeof resolvePortalAuditModuleId === "function" ? resolvePortalAuditModuleId(filterInputs.moduleFilter) : "";
          if (moduleId) payload.moduleId = moduleId;
        }
        if (activeAction !== "all") payload.action = activeAction;
      } else {
        payload.scope = "all";
      }
      const res = await AntaresPortalAuditSync.deleteEventsFromApi(payload);
      state.__historyAuditPresentationBackfilled = false;
      state.__historyAuditEntriesCache = null;
      state.historyRenderLimit = HISTORY_RENDER_WINDOW;
      notify(`Se eliminaron ${Number(res?.deleted ?? count)} evento(s) del historial.`, "success");
      renderPortalView();
    }
  });
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
    { label: "Eventos", value: stats.total, tone: "primary", icon: IC.activity || IC.layers },
    { label: "Creaciones", value: stats.create, tone: stats.create ? "ok" : "neutral", icon: IC.plus || IC.check },
    { label: "Actualizaciones", value: stats.update, tone: stats.update ? "warn" : "neutral", icon: IC.edit || IC.activity },
    { label: "Eliminaciones", value: stats.delete, tone: stats.delete ? "danger" : "neutral", icon: IC.trash || IC.x },
    { label: "Módulos", value: stats.modules, tone: "neutral", icon: IC.layers }
  ];
  return `<dl class="hist-trace-kpis" aria-label="Resumen de trazabilidad">${items
    .map(({ label, value, tone, icon }) => {
      const toneClass = tone && tone !== "neutral" ? ` hist-trace-kpi--${tone}` : "";
      return `<div class="hist-trace-kpi${toneClass}">
        <span class="hist-trace-kpi__icon" aria-hidden="true">${icon}</span>
        <div class="hist-trace-kpi__text"><dt>${escapeHtml(label)}</dt><dd><strong>${escapeHtml(String(value))}</strong></dd></div>
      </div>`;
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

function renderHistoryActionFilters(active, stats = {}) {
  const cur = String(active || "all");
  const pill = (key, label, icon, count) =>
    `<button type="button" class="hist-trace-action-pill hist-trace-action-pill--${escapeAttr(key)}${cur === key ? " is-active" : ""}" data-action="history-action-filter" data-filter="${escapeAttr(key)}" aria-pressed="${cur === key}">
      <span class="hist-trace-action-pill__ico" aria-hidden="true">${icon}</span>
      <span class="hist-trace-action-pill__label">${escapeHtml(label)}</span>
      <span class="hist-trace-action-pill__count">${Number(count) || 0}</span>
    </button>`;
  return `<div class="hist-trace-action-filters" role="group" aria-label="Tipo de movimiento">
    ${pill("all", "Todos", IC.layers, stats.total)}
    ${pill("create", "Creaciones", IC.plus || IC.check, stats.create)}
    ${pill("update", "Actualizaciones", IC.edit || IC.activity, stats.update)}
    ${pill("delete", "Eliminaciones", IC.trash || IC.x, stats.delete)}
  </div>`;
}

function historyCurrentUserIsAdmin() {
  try {
    return typeof currentUser === "function" && currentUser()?.role === ROLES.ADMIN;
  } catch (_e) {
    return false;
  }
}

function renderHistoryTraceToolbar(viewLayout, moduleOptions, moduleFilter) {
  const moduleOpts = moduleOptions
    .map((m) => `<option value="${escapeAttr(m)}"${moduleFilter === m ? " selected" : ""}>${escapeHtml(m)}</option>`)
    .join("");
  const canDeleteHistory = historyCurrentUserIsAdmin();
  return `<form id="history-trace-filter" class="hist-trace-filter-form" novalidate>
    <div class="hist-trace-toolbar">
      <label class="hist-trace-search">
        <span class="hist-trace-search__icon" aria-hidden="true">${IC.search || IC.filter}</span>
        <span class="visually-hidden">Buscar en trazabilidad</span>
        <input type="search" name="q" placeholder="Buscar por módulo, entidad, resumen o usuario…" autocomplete="off" />
      </label>
      <div class="hist-trace-toolbar__actions">
        ${historyViewToggleHtml(viewLayout)}
        <details class="hist-trace-advanced">
          <summary class="hist-trace-advanced-trigger">${IC.filter}<span>Periodo</span></summary>
          <div class="hist-trace-advanced-body">
            <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="from" /></label>
            <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="to" /></label>
            <label class="hist-trace-module-select">${fieldLabel(IC.layers, "Módulo (lista)")}<select name="module"><option value="">Todos los módulos</option>${moduleOpts}</select></label>
            <button class="btn btn-sm btn-outline" type="reset">${IC.x} Limpiar filtros</button>
          </div>
        </details>
        <button type="button" class="btn btn-sm btn-action hist-trace-export-btn" data-action="history-export-csv">${IC.download || ""}<span>Exportar</span></button>
        ${canDeleteHistory ? `<button type="button" class="btn btn-sm btn-action btn-danger-soft hist-trace-delete-btn" data-action="history-delete-events" title="Eliminar eventos del historial (solo administradores)">${IC.trash || ""}<span>Eliminar</span></button>` : ""}
      </div>
    </div>
  </form>`;
}

function renderHistoryTraceEmptyState(hint = "Los movimientos del sistema aparecerán aquí conforme se registren.") {
  return `<div class="hist-trace-empty">
    <div class="hist-trace-empty__visual" aria-hidden="true">
      <span class="hist-trace-empty__ring">${IC.activity || IC.layers}</span>
    </div>
    <h3 class="hist-trace-empty__title">Sin eventos que mostrar</h3>
    <p class="hist-trace-empty__hint muted">${escapeHtml(hint)}</p>
    <ul class="hist-trace-empty__tips">
      <li>Pruebe ampliar el periodo de fechas</li>
      <li>Seleccione otro módulo o tipo de movimiento</li>
      <li>Limpie la búsqueda activa</li>
    </ul>
  </div>`;
}

function renderHistoryTraceFeedGrouped(entries) {
  if (!entries.length) {
    return renderHistoryTraceEmptyState("Ajuste el periodo, el módulo o el tipo de movimiento.");
  }
  const groups = groupHistoryTraceByDay(entries);
  return `<div class="hist-trace-feed" id="history-trace-results-grid">${groups
    .map(([dayKey, items]) => {
      const label = historyTraceDayLabel(dayKey);
      const isToday = label === "Hoy";
      const isYesterday = label === "Ayer";
      const dayTone = isToday ? " is-today" : isYesterday ? " is-yesterday" : "";
      return `<section class="hist-trace-day${dayTone}" aria-label="${escapeAttr(label)}">
        <header class="hist-trace-day__head">
          <div class="hist-trace-day__marker" aria-hidden="true"></div>
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
    return renderHistoryTraceEmptyState();
  }
  if (viewLayout === "list") {
    return renderHistoryAuditList(entries, "list");
  }
  return renderHistoryTraceFeedGrouped(entries);
}

function historyHtml() {
  const histUi = state.historyUi || defaultHistoryUi();
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

  const allStats = historyTraceStats(allEntries);

  const hero = `<header class="hist-trace-hero history-studio-head">
    <div class="hist-trace-hero__brand history-studio-head__brand">
      <span class="hist-trace-hero__badge history-studio-head__badge">${IC.activity || ""} Auditoría</span>
      <h2>Historial y trazabilidad</h2>
      <p class="hist-trace-hero__lead history-studio-head__tagline">Registro auditable de creaciones, actualizaciones y eliminaciones en todos los módulos del portal. Cada evento incluye usuario, fecha y resumen del cambio.</p>
    </div>
    ${renderHistoryTraceKpis(stats)}
  </header>`;

  const body = `<div class="hist-trace-workspace">
    <div class="hist-trace-control-panel">
      <div class="hist-trace-control-panel__section">
        <span class="hist-trace-control-panel__label">Tipo de movimiento</span>
        ${renderHistoryActionFilters(actionFilter, allStats)}
      </div>
      <div class="hist-trace-control-panel__section hist-trace-control-panel__section--modules">
        <span class="hist-trace-control-panel__label">Módulo</span>
        ${renderHistoryModuleFilterChips(allEntries, chipFilterOpts, moduleFilter)}
      </div>
      <div class="hist-trace-control-panel__section hist-trace-control-panel__section--toolbar">
        ${renderHistoryTraceToolbar(viewLayout, moduleOptions, moduleFilter)}
      </div>
    </div>
    <div class="hist-trace-results-panel">
      <div class="hist-trace-result-bar">
        <p class="hist-trace-result-meta">
          <span class="hist-trace-result-meta__count" id="history-trace-result-count">${filtered.length}</span>
          <span class="hist-trace-result-meta__label">evento${filtered.length === 1 ? "" : "s"}${escapeHtml(viewLayoutHint)}</span>
        </p>
        <div class="hist-trace-result-actions">
          <span class="hist-trace-result-sort">${IC.clock || ""}<span>Más recientes primero</span></span>
          <button type="button" class="btn btn-sm btn-outline hist-trace-export-btn hist-trace-export-btn--inline" data-action="history-export-csv"${filtered.length ? "" : " disabled"}>${IC.download || ""}<span>CSV (${filtered.length})</span></button>
        </div>
      </div>
      <div id="history-trace-results" class="hist-trace-results-mount">${renderHistoryTraceResults(shown, viewLayout)}</div>
      ${historyRenderWindowMoreBar(filtered.length, shown.length, "history-render-more")}
    </div>
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

    if (!state.__historyAuditHydratedFromApi && !state.__historyAuditHydrating) {
      state.__historyAuditHydrating = true;
      void (typeof AntaresPortalAuditSync !== "undefined"
        ? AntaresPortalAuditSync.refreshModuleAuditLogsFromApi({ limit: 5000 })
        : Promise.resolve(false)
      ).then((ok) => {
        state.__historyAuditHydrating = false;
        if (ok) {
          state.__historyAuditHydratedFromApi = true;
          state.__historyAuditPresentationBackfilled = false;
          state.__historyAuditEntriesCache = null;
          if (typeof scheduleRenderPortalView === "function") scheduleRenderPortalView();
          else if (typeof renderPortalView === "function") renderPortalView();
        }
      });
    }

    nodes.viewRoot.querySelectorAll("[data-action='history-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = normalizeHistoryLayout(btn.dataset.layout);
        state.historyUi = { ...(state.historyUi || defaultHistoryUi()), layout };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='history-action-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = String(btn.dataset.filter || "all");
        state.historyUi = { ...(state.historyUi || defaultHistoryUi()), actionFilter: next };
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='history-module-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = String(btn.dataset.module || "").trim();
        state.historyUi = { ...(state.historyUi || defaultHistoryUi()), moduleFilter: next };
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

    nodes.viewRoot.querySelectorAll("[data-action='history-delete-events']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        historyDeleteEventsFlow(document.getElementById("history-trace-filter"));
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='history-render-more']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.historyRenderLimit = (Number(state.historyRenderLimit) || HISTORY_RENDER_WINDOW) + HISTORY_RENDER_WINDOW;
        renderPortalView();
      });
    });

    if (!state.__historyAuditDetailDelegationBound) {
      state.__historyAuditDetailDelegationBound = true;
      nodes.viewRoot.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-action='history-audit-event-detail']");
        if (!btn || !nodes.viewRoot.contains(btn)) return;
        if (String(state.currentView || "") !== "history") return;
        event.preventDefault();
        openHistoryAuditEventDetail(btn.dataset.id);
      });
    }

    const traceFilter = document.getElementById("history-trace-filter");
    if (traceFilter) {
      portalUpgradeDates(traceFilter);
      const moduleSelect = traceFilter.querySelector("select[name='module']");
      if (moduleSelect && state.historyUi?.moduleFilter) {
        moduleSelect.value = String(state.historyUi.moduleFilter || "");
      }

      const refreshTraceResults = () => {
        const histUi = state.historyUi || defaultHistoryUi();
        const layout = normalizeHistoryLayout(histUi.layout);
        const filterInputs = readHistoryTraceFilterInputs(traceFilter);
        if (filterInputs.moduleFilter !== String(histUi.moduleFilter || "")) {
          state.historyUi = { ...histUi, moduleFilter: filterInputs.moduleFilter };
        }
        const allEntries = buildHistoryAuditEntries();
        const items = applyHistoryTraceFilters(allEntries, filterInputs);
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
            exportBtn.innerHTML = `${IC.download || ""}<span>CSV (${items.length})</span>`;
          }
        });
        if (kpiRoot) {
          const stats = historyTraceStats(items);
          kpiRoot.outerHTML = renderHistoryTraceKpis(stats);
        }
        if (chipRoot) {
          chipRoot.outerHTML = renderHistoryModuleFilterChips(allEntries, chipOpts, filterInputs.moduleFilter);
          nodes.viewRoot.querySelectorAll("[data-action='history-module-filter']").forEach((chipBtn) => {
            chipBtn.addEventListener("click", () => {
              const next = String(chipBtn.dataset.module || "").trim();
              state.historyUi = { ...(state.historyUi || defaultHistoryUi()), moduleFilter: next };
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
      let historySearchTimer = 0;
      const scheduleTraceResultsRefresh = () => {
        window.clearTimeout(historySearchTimer);
        historySearchTimer = window.setTimeout(refreshTraceResults, 220);
      };

      traceFilter.addEventListener("submit", (event) => {
        event.preventDefault();
        window.clearTimeout(historySearchTimer);
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        refreshTraceResults();
      });
      traceFilter.addEventListener("change", () => {
        window.clearTimeout(historySearchTimer);
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        refreshTraceResults();
      });
      const liveSearch = traceFilter.querySelector("input[name='q']");
      if (liveSearch) {
        liveSearch.addEventListener("input", () => {
          state.historyRenderLimit = HISTORY_RENDER_WINDOW;
          scheduleTraceResultsRefresh();
        });
      }
      traceFilter.addEventListener("reset", () => {
        window.clearTimeout(historySearchTimer);
        state.historyUi = { ...(state.historyUi || {}), moduleFilter: "" };
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        window.requestAnimationFrame(() => refreshTraceResults());
      });
    }
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.history = bindHistoryPortalControls;
})();
