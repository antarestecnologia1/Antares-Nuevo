(function registerUsuariosModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.usuarios = {
    adminUsersHtml: (...args) => window.AppLegacyViews?.adminUsersHtml?.(...args) || ""
  };
})();
