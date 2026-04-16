(function registerPerfilModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.perfil = {
    profileHtml: (...args) => window.AppLegacyViews?.profileHtml?.(...args) || ""
  };
})();
