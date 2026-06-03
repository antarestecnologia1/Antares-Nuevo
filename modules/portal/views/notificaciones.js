(function registerNotificacionesModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.notificaciones = {
    notificationsHtml: (...args) => window.AppLegacyViews?.notificationsHtml?.(...args) || ""
  };
})();
