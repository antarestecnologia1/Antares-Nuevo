/**
 * Barrel `DomainModules.notifications` → `AntaresNotificacionesDomain`.
 */
window.DomainModules = window.DomainModules || {};
window.DomainModules.notifications = {
  listForCurrentUser() {
    return window.AntaresNotificacionesDomain?.getCurrentNotifications?.() ?? [];
  },
  markRead(ids) {
    return window.AntaresNotificacionesDomain?.persistNotificationsReadState?.(ids);
  },
  unreadCount() {
    const list = window.AntaresNotificacionesDomain?.getCurrentNotifications?.() ?? [];
    const isRead = window.AntaresNotificacionesDomain?.notificationIsRead;
    if (typeof isRead !== "function") return 0;
    return list.filter((n) => !isRead(n)).length;
  }
};
