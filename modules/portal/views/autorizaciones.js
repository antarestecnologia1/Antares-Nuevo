(function registerAutorizacionesModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.autorizaciones = {
    authorizationsHtml: (...args) => window.AppLegacyViews?.authorizationsHtml?.(...args) || ""
  };
})();
