/** Fachada `AppModules.dashboard`; HTML en `modules/app/dashboard.js` → `AppLegacyViews`. */
(function registerDashboardModuleFacade() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.dashboard = {
    viewDashboard: (...args) => window.AppLegacyViews?.viewDashboard?.(...args) || ""
  };
})();
