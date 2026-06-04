/**
 * Notificaciones, avisos emergentes y timbre (preferencias en esta vista).
 * Archivo canónico en legacy-views.
 */
/**
 * Vista HTML de notificaciones del portal — migrada desde app.js.
 * Requiere `window.AntaresPortalRuntime`.
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
