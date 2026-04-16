(function registerDashboardModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.dashboard = {
    viewDashboard: (...args) => window.AppLegacyViews?.viewDashboard?.(...args) || ""
  };
})();
