/**
 * Notificaciones del portal (bandeja, avisos emergentes y timbre).
 * HTML y listeners; carga como módulo ES tras `portal-runtime.js`.
 */
import { state, nodes } from "../core/store.js";
import { read, write } from "../core/data-io.js";
import { KEYS } from "../core/config.js";
import { escapeAttr, escapeHtml, fmtDate } from "../core/utils.js";
import { currentUser } from "../core/auth.js";
import {
  NOTIFICATION_UI_FILTERS,
  bindNotificationSidebarPrefs,
  filterNotificationsByUiFilter,
  getCurrentNotifications,
  groupNotificationsByDateBucket,
  isNotificationsEnabled,
  notificationCategoryLabel,
  notificationIsRead,
  persistNotificationsReadState,
  resolveNotificationCategory,
  resolveNotificationDeepLink,
  sanitizeNotificationBodyForDisplay,
  toggleNotificationsEnabled,
  deleteNotificationsFromServer
} from "../domain/notificaciones.domain.js";

const G = globalThis;

const FILTER_TABS = [
  { id: NOTIFICATION_UI_FILTERS.ALL, label: "Todas" },
  { id: NOTIFICATION_UI_FILTERS.UNREAD, label: "Sin leer" },
  { id: NOTIFICATION_UI_FILTERS.REQUEST, label: "Solicitudes" },
  { id: NOTIFICATION_UI_FILTERS.AUTHORIZATION, label: "Autorizaciones" },
  { id: NOTIFICATION_UI_FILTERS.HR, label: "RRHH" },
  { id: NOTIFICATION_UI_FILTERS.SYSTEM, label: "Sistema" }
];

function ntfCategoryTone(category) {
  const c = String(category || "").toLowerCase();
  if (c === "request") return "blue";
  if (c === "authorization") return "violet";
  if (c === "hr") return "emerald";
  return "slate";
}

function ntfFilterRailHtml(activeFilter) {
  const items = FILTER_TABS.map((tab) => {
    const active = tab.id === activeFilter;
    return `<button type="button" class="ntf-filter-btn${active ? " ntf-filter-btn--active" : ""}" data-action="notif-filter" data-filter="${escapeAttr(tab.id)}" aria-pressed="${active ? "true" : "false"}">${escapeHtml(tab.label)}</button>`;
  }).join("");
  return `<nav class="ntf-filter-rail" aria-label="Filtrar notificaciones">${items}</nav>`;
}

function ntfBellToggleHtml(enabled) {
  const on = Boolean(enabled);
  return `<button
    type="button"
    class="ntf-bell-toggle${on ? "" : " ntf-bell-toggle--off"}"
    data-action="notif-toggle-master"
    aria-pressed="${on ? "true" : "false"}"
    aria-label="${on ? "Notificaciones activadas. Pulsar para desactivar" : "Notificaciones desactivadas. Pulsar para activar"}"
    title="${on ? "Desactivar notificaciones" : "Activar notificaciones"}"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  </button>`;
}

function ntfCardHtml(n, IC) {
  const read = notificationIsRead(n);
  const category = resolveNotificationCategory(n);
  const tone = ntfCategoryTone(category);
  const tag = `<span class="ntf-tag ntf-tag--${tone}">${escapeHtml(notificationCategoryLabel(category))}</span>`;
  const deepLink = resolveNotificationDeepLink(n);
  const safeId = escapeAttr(n.id);
  const title = escapeHtml(String(n.title || "Notificación"));
  const body = escapeHtml(sanitizeNotificationBodyForDisplay(n.body || ""));
  const time = escapeHtml(fmtDate(n.createdAt));
  const openBtn = deepLink
    ? `<button type="button" class="btn btn-sm btn-action" data-action="notif-open" data-id="${safeId}" data-href="${escapeAttr(deepLink)}">${IC.externalLink || IC.eye || ""} Abrir</button>`
    : "";
  return `<article class="ntf-card${read ? "" : " ntf-card--unread"}" data-id="${safeId}" data-category="${escapeAttr(category)}">
    <div class="ntf-card__leading">
      ${read ? "" : '<span class="ntf-card__dot" aria-hidden="true"></span>'}
      <span class="ntf-card__icon" aria-hidden="true">${IC.bell || ""}</span>
    </div>
    <div class="ntf-card__body">
      <div class="ntf-card__meta">${tag}<time class="ntf-card__time" datetime="${escapeAttr(String(n.createdAt || ""))}">${time}</time></div>
      <h3 class="ntf-card__title">${title}</h3>
      ${body ? `<p class="ntf-card__text">${body}</p>` : ""}
    </div>
    <div class="ntf-card__actions">
      ${openBtn}
      ${
        read
          ? '<span class="ntf-card__read-badge">Leída</span>'
          : `<button type="button" class="btn btn-sm btn-action" data-action="notif-read" data-id="${safeId}">${IC.check || ""} Marcar leída</button>`
      }
      <button type="button" class="btn btn-sm btn-action btn-danger-soft" data-action="notif-delete" data-id="${safeId}" title="Eliminar" aria-label="Eliminar notificación">${IC.trash || ""}</button>
    </div>
  </article>`;
}

function ntfGroupedListHtml(buckets, IC) {
  return buckets
    .map(
      (bucket) => `<section class="ntf-date-group" aria-label="${escapeAttr(bucket.label)}">
      <h3 class="ntf-date-group__title">${escapeHtml(bucket.label)}</h3>
      <div class="ntf-list">${bucket.items.map((n) => ntfCardHtml(n, IC)).join("")}</div>
    </section>`
    )
    .join("");
}

function notificationsHtml() {
  const emptyState = G.emptyState;
  const IC = G.IC || {};

  const all = getCurrentNotifications().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const activeFilter = String(state.notificationsUi?.filter || NOTIFICATION_UI_FILTERS.ALL).trim().toLowerCase();
  const filtered = filterNotificationsByUiFilter(all, activeFilter, notificationIsRead);
  const alertsOn = isNotificationsEnabled();
  const unread = all.filter((n) => !notificationIsRead(n)).length;
  const readCount = all.length - unread;
  const readPct = all.length ? Math.round((readCount / all.length) * 100) : 100;

  const prefHint = !alertsOn
    ? `<p class="ntf-pref-hint" role="status">Notificaciones desactivadas: no recibirás avisos emergentes ni timbre. La bandeja conserva el historial.</p>`
    : "";

  const toolbar =
    filtered.length || all.length
      ? `<div class="ntf-toolbar">
        <button type="button" class="btn btn-sm btn-action" data-action="notif-read-all"${unread ? "" : " disabled"}>${IC.check || ""} Marcar todas leídas</button>
        <button type="button" class="btn btn-sm btn-action btn-danger-soft" data-action="notif-delete-all"${all.length ? "" : " disabled"}>${IC.trash || ""} Eliminar todas</button>
      </div>`
      : "";

  const listBody = filtered.length
    ? ntfGroupedListHtml(groupNotificationsByDateBucket(filtered), IC)
    : all.length
      ? typeof emptyState === "function"
        ? emptyState("Ninguna notificación coincide con este filtro.")
        : `<p class="muted">Ninguna notificación coincide con este filtro.</p>`
      : typeof emptyState === "function"
        ? emptyState("No tienes notificaciones.")
        : `<p class="muted">No tienes notificaciones.</p>`;

  const head = `<header class="ntf-studio-head notifications-studio-head">
    <div class="ntf-studio-head__copy">
      <p class="ntf-studio-head__kicker">Centro de avisos</p>
      <div class="ntf-studio-head__title-row">
        <h2 class="ntf-studio-head__title">Notificaciones</h2>
        ${ntfBellToggleHtml(alertsOn)}
      </div>
      <p class="ntf-studio-head__sub">${all.length} mensaje${all.length === 1 ? "" : "s"} · ${unread} sin leer</p>
    </div>
    <dl class="ntf-studio-head__metrics">
      <div class="ntf-metric"><dt>Total</dt><dd>${all.length}</dd></div>
      <div class="ntf-metric ntf-metric--warn"><dt>Sin leer</dt><dd>${unread}</dd></div>
      <div class="ntf-metric"><dt>Leídas</dt><dd>${readCount}</dd></div>
      <div class="ntf-metric"><dt>% leídas</dt><dd>${readPct}%</dd></div>
    </dl>
  </header>`;

  const operate = `<div class="ntf-operate">
    <aside class="ntf-operate__rail">
      <span class="ntf-operate__rail-label">Filtros</span>
      ${ntfFilterRailHtml(activeFilter)}
    </aside>
    <div class="ntf-operate__main">
      <div class="ntf-data-panel">
        ${prefHint}
        ${toolbar}
        ${listBody}
      </div>
    </div>
  </div>`;

  return `<section class="notifications-studio">${head}${operate}</section>`;
}

if (typeof window.registerLegacyPortalViews === "function") {
  window.registerLegacyPortalViews({ notificationsHtml });
}

function bindNotificationsPortalControls() {
  if (String(state.currentView || "") !== "notifications" || !nodes.viewRoot) return;
  const root = nodes.viewRoot;

  root.querySelectorAll("[data-action='notif-filter']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = String(btn.dataset.filter || NOTIFICATION_UI_FILTERS.ALL).trim().toLowerCase();
      state.notificationsUi = { ...(state.notificationsUi || {}), filter: next };
      G.renderPortalView();
    });
  });

  root.querySelectorAll("[data-action='notif-open']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void G.runWithBusyButton(btn, async () => {
        const id = String(btn.dataset.id || "");
        const href = String(btn.dataset.href || "").trim();
        if (id && !notificationIsRead(getCurrentNotifications().find((n) => n.id === id) || {})) {
          await persistNotificationsReadState([id]);
        }
        if (href.startsWith("#portal/")) {
          const view = href.slice("#portal/".length).split("?")[0].trim();
          if (view) G.setView(view);
        }
        G.refreshNotificationsUiAfterReadMutation?.();
      });
    });
  });

  root.querySelectorAll("[data-action='notif-read']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void G.runWithBusyButton(btn, async () => {
        const id = String(btn.dataset.id || "");
        const visibleIds = new Set(getCurrentNotifications().map((n) => n.id));
        if (!visibleIds.has(id)) return;
        const ok = await persistNotificationsReadState([id]);
        if (!ok) return;
        G.refreshNotificationsUiAfterReadMutation();
      });
    });
  });

  root.querySelectorAll("[data-action='notif-toggle-master']").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleNotificationsEnabled();
      G.renderPortalView();
      G.syncNotificationPrefsSidebarUi?.();
      G.updateNotificationBadge();
    });
  });

  root.querySelectorAll("[data-action='notif-read-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void G.runWithBusyButton(btn, async () => {
        const unreadIds = getCurrentNotifications()
          .filter((n) => !notificationIsRead(n))
          .map((n) => n.id);
        if (!unreadIds.length) return;
        const ok = await persistNotificationsReadState(unreadIds);
        if (!ok) return;
        G.refreshNotificationsUiAfterReadMutation();
      });
    });
  });

  root.querySelectorAll("[data-action='notif-delete-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const visible = getCurrentNotifications();
      if (!visible.length) return;
      G.openConfirmReasonModal({
        title: "Eliminar todas las notificaciones",
        message: `¿Eliminar ${visible.length} notificación${visible.length === 1 ? "" : "es"} de tu bandeja? Indica la justificación. Esta acción no se puede deshacer.`,
        confirmText: "Eliminar todas",
        onConfirm: async (motivo) => {
          const visibleIds = new Set(visible.map((n) => n.id));
          const list = read(KEYS.notifications, []);
          const nextList = list.filter((n) => !visibleIds.has(n.id));
          write(KEYS.notifications, nextList, { skipSyncSchedule: true });
          try {
            await deleteNotificationsFromServer([...visibleIds]);
          } catch (err) {
            write(KEYS.notifications, list, { skipSyncSchedule: true });
            G.notify(String(err?.message || "No fue posible eliminar las notificaciones en el servidor."), "error");
            G.renderPortalView();
            G.updateNotificationBadge();
            return;
          }
          G.logPortalAuditEvent?.("notifications", "delete", {
            entityId: "bulk",
            entityLabel: "Bandeja (eliminar todas)",
            summary: `${visible.length} notificación(es) eliminadas. Motivo: ${String(motivo || "").trim()}`
          });
          G.notify("Notificaciones eliminadas.", "success");
          G.renderPortalView();
          G.updateNotificationBadge();
        }
      });
    });
  });

  root.querySelectorAll("[data-action='notif-delete']").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const id = String(btn.dataset.id || "");
      if (!id) return;
      G.openConfirmModal({
        title: "Eliminar notificación",
        message: "¿Eliminar esta notificación de tu bandeja? Esta acción no se puede deshacer.",
        confirmText: "Eliminar",
        onConfirm: async () => {
          const visibleIds = new Set(getCurrentNotifications().map((n) => n.id));
          if (!visibleIds.has(id)) return;
          const list = read(KEYS.notifications, []);
          const removedNotification = list.find((n) => n.id === id) || null;
          const nextList = list.filter((n) => n.id !== id);
          write(KEYS.notifications, nextList, { skipSyncSchedule: true });
          try {
            await deleteNotificationsFromServer([id]);
          } catch (err) {
            write(KEYS.notifications, list, { skipSyncSchedule: true });
            G.notify(String(err?.message || "No fue posible eliminar la notificación en el servidor."), "error");
            G.renderPortalView();
            G.updateNotificationBadge();
            return;
          }
          G.logPortalAuditEvent?.("notifications", "delete", {
            entityId: id,
            entityLabel: String(removedNotification?.title || "Notificación").trim() || "Notificación",
            summary: "Notificación eliminada de bandeja."
          });
          G.notify("Notificación eliminada.", "success");
          G.renderPortalView();
          G.updateNotificationBadge();
        }
      });
    });
  });
}

window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
window.__portalModuleAfterRender.notifications = bindNotificationsPortalControls;

bindNotificationSidebarPrefs();
