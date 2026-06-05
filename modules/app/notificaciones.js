/**
 * Notificaciones del portal (bandeja, avisos emergentes y timbre).
 * HTML y listeners; carga con defer después de app.js.
 */
(function installNotificacionesHtml() {
  function notificationsHtml() {
    const rt = window.AntaresPortalRuntime;
    if (!rt) return "";
    const {
      getCurrentNotifications,
      isInAppNotificationAlertsEnabled,
      isSonidoNotificacionesHabilitado,
      notificationIsRead,
      escapeAttr,
      fmtDate,
      emptyState,
      moduleFleetHeroStrip,
      pcardWrap,
      IC
    } = rt;

    const list = getCurrentNotifications().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const alertsOn = isInAppNotificationAlertsEnabled();
    const soundOn = isSonidoNotificacionesHabilitado();
    const prefBanner =
      !alertsOn || !soundOn
        ? `<div class="notif-pref-banner" role="status">
          <strong>Preferencias activas</strong>
          <span class="muted">${
            !alertsOn
              ? "Avisos emergentes desactivados: no verás ventanas por avisos nuevos y el servidor no creará notificaciones para tu cuenta. "
              : ""
          }${
            !soundOn && alertsOn
              ? "Timbre silenciado; los avisos emergentes siguen llegando en pantalla. "
              : ""
          }${
            !soundOn && !alertsOn
              ? "El timbre permanece desactivado; al reactivar solo «Avisos», podrás activar el timbre de forma independiente. "
              : ""
          }</span>
          <span class="muted">Use «Avisos» / «Timbre» junto a la campana del menú lateral.</span>
        </div>`
        : "";
    const unread = list.filter((n) => !notificationIsRead(n)).length;
    const items = list
      .map((n) => {
        const read = notificationIsRead(n);
        const tag = String(n.title || "").toLowerCase().includes("solicitud")
          ? '<span class="notif-tag notif-tag-blue">Solicitud</span>'
          : String(n.title || "").toLowerCase().includes("autoriza")
            ? '<span class="notif-tag notif-tag-violet">Autorización</span>'
            : '<span class="notif-tag notif-tag-slate">Sistema</span>';
        const dot = read ? "" : '<span class="notif-dot"></span>';
        const safeId = escapeAttr(n.id);
        return `<article class="notif-card ${read ? "" : "notif-card-unread"}">
        <div class="notif-leading">${dot}<span class="notif-icon">${IC.bell}</span></div>
        <div class="notif-content">
          <div class="notif-head">${tag}<span class="muted notif-time">${fmtDate(n.createdAt)}</span></div>
          <h4>${n.title || "Notificación"}</h4>
          <p>${n.body || ""}</p>
        </div>
        <div class="notif-actions">
          ${read ? '<span class="status status-completada">Leída</span>' : `<button type="button" class="btn btn-sm btn-action" data-action="notif-read" data-id="${safeId}">${IC.check} Marcar leída</button>`}
          <button type="button" class="btn btn-sm btn-action btn-danger-soft" data-action="notif-delete" data-id="${safeId}" title="Eliminar notificación" aria-label="Eliminar notificación">${IC.trash} Eliminar</button>
        </div>
      </article>`;
      })
      .join("");
    const readCount = list.length - unread;
    const readPct = list.length ? Math.round((readCount / list.length) * 100) : 100;
    const body = list.length
      ? `${prefBanner}<div class="notif-toolbar">
        <button type="button" class="btn btn-sm btn-action notif-pref-toolbar-btn" data-action="notif-toggle-alerts" title="Activa o desactiva ventanas emergentes y nuevas filas desde el servidor">
          ${IC.bell} Avisos emergentes: ${alertsOn ? "activados" : "desactivados"}
        </button>
        <button type="button" class="btn btn-sm btn-action notif-pref-toolbar-btn" data-action="notif-toggle-sound" title="Solo el timbre; no afecta la bandeja">
          ${soundOn ? "Silenciar timbre" : "Activar timbre"}
        </button>
        <button type="button" class="btn btn-sm btn-action" data-action="notif-read-all">${IC.check} Marcar todas como leídas</button>
        <button type="button" class="btn btn-sm btn-action btn-danger-soft" data-action="notif-delete-all" title="Eliminar todas las notificaciones visibles">${IC.trash} Eliminar todas</button>
      </div>
      <div class="notif-list">${items}</div>`
      : `${prefBanner}${emptyState("No tienes notificaciones.")}`;
    const heroStrip = moduleFleetHeroStrip([
      { label: "Total", value: list.length },
      { label: "Sin leer", value: unread, tone: unread ? "warn" : undefined },
      { label: "Leidas", value: readCount },
      { label: "% leidas", value: `${readPct}%` }
    ]);
    return heroStrip + pcardWrap("bell", "Notificaciones", list.length + " mensajes · " + unread + " sin leer", body);
  }

  if (typeof window.registerLegacyPortalViews === "function") {
    window.registerLegacyPortalViews({ notificationsHtml });
  }
})();

function bindNotificationsPortalControls() {
  if (String(state.currentView || "") !== "notifications" || !nodes.viewRoot) return;

  nodes.viewRoot.querySelectorAll("[data-action='notif-read']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void runWithBusyButton(btn, async () => {
        const id = String(btn.dataset.id || "");
        const visibleIds = new Set(getCurrentNotifications().map((n) => n.id));
        if (!visibleIds.has(id)) return;
        const ok = await persistNotificationsReadState([id]);
        if (!ok) return;
        refreshNotificationsUiAfterReadMutation();
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='notif-toggle-alerts']").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleNotificationAlertsEnabled();
      renderPortalView();
      updateNotificationBadge();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='notif-toggle-sound']").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleNotificationSoundMuted();
      renderPortalView();
      updateNotificationBadge();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='notif-read-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void runWithBusyButton(btn, async () => {
        const unreadIds = getCurrentNotifications()
          .filter((n) => !notificationIsRead(n))
          .map((n) => n.id);
        if (!unreadIds.length) return;
        const ok = await persistNotificationsReadState(unreadIds);
        if (!ok) return;
        refreshNotificationsUiAfterReadMutation();
      });
    });
  });

  /** Eliminar todas las notificaciones visibles en la bandeja (mismo contrato que eliminar una). */
  nodes.viewRoot.querySelectorAll("[data-action='notif-delete-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const visible = getCurrentNotifications();
      if (!visible.length) return;
      openConfirmReasonModal({
        title: "Eliminar todas las notificaciones",
        message: `¿Eliminar ${visible.length} notificación${visible.length === 1 ? "" : "es"} de tu bandeja? Indica la justificación. Esta acción no se puede deshacer.`,
        confirmText: "Eliminar todas",
        onConfirm: async (motivo) => {
          const visibleIds = new Set(visible.map((n) => n.id));
          const list = read(KEYS.notifications, []);
          const nextList = list.filter((n) => !visibleIds.has(n.id));
          write(KEYS.notifications, nextList);
          try {
            await writeNotificationsAwaitServer([...visibleIds]);
          } catch (err) {
            write(KEYS.notifications, list);
            notify(String(err?.message || "No fue posible eliminar las notificaciones en el servidor."), "error");
            renderPortalView();
            updateNotificationBadge();
            return;
          }
          appendModuleAuditLog({
            action: "delete",
            moduleId: "notifications",
            moduleLabel: "Notificaciones",
            entityId: "bulk",
            entityLabel: "Bandeja (eliminar todas)",
            summary: `${visible.length} notificación(es) eliminadas. Motivo: ${String(motivo || "").trim()}`,
            actor: String(currentUser()?.email || currentUser()?.name || "—").trim()
          });
          notify("Notificaciones eliminadas.", "success");
          renderPortalView();
          updateNotificationBadge();
        }
      });
    });
  });

  /** Eliminar una notificación de la bandeja (local + `deletedIds` en sync para PostgreSQL). */
  nodes.viewRoot.querySelectorAll("[data-action='notif-delete']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      if (!id) return;
      openConfirmReasonModal({
        title: "Eliminar notificación",
        message: "¿Quieres eliminar esta notificación de tu bandeja? Indica la justificación. Esta acción no se puede deshacer.",
        confirmText: "Eliminar",
        onConfirm: async (motivo) => {
          const visibleIds = new Set(getCurrentNotifications().map((n) => n.id));
          if (!visibleIds.has(id)) return;
          const list = read(KEYS.notifications, []);
          const removedNotification = list.find((n) => n.id === id) || null;
          const nextList = list.filter((n) => n.id !== id);
          write(KEYS.notifications, nextList);
          try {
            await writeNotificationsAwaitServer([id]);
          } catch (err) {
            write(KEYS.notifications, list);
            notify(String(err?.message || "No fue posible eliminar la notificación en el servidor."), "error");
            renderPortalView();
            updateNotificationBadge();
            return;
          }
          appendModuleAuditLog({
            action: "delete",
            moduleId: "notifications",
            moduleLabel: "Notificaciones",
            entityId: id,
            entityLabel: String(removedNotification?.title || "Notificación").trim() || "Notificación",
            summary: `Notificación eliminada de bandeja. Motivo: ${String(motivo || "").trim()}`,
            actor: String(currentUser()?.email || currentUser()?.name || "—").trim()
          });
          notify("Notificación eliminada.", "success");
          renderPortalView();
          updateNotificationBadge();
        }
      });
    });
  });
}

(function registerNotificationsPortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.notifications = bindNotificationsPortalControls;
})();
