/** Fachada `AppModules`; HTML y listeners en `modules/app/notificaciones.js` → `AppLegacyViews.notificationsHtml`. */
(function registerNotificacionesModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.notificaciones = {
    notificationsHtml: (...args) => window.AppLegacyViews?.notificationsHtml?.(...args) || ""
  };
})();
