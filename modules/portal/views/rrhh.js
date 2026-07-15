(function registerRrhhModule() {
  if (!window.AppModules) window.AppModules = {};
  /**
   * Fachadas hacia implementaciones legacy en app.js (transición).
   * Plan de extracción: docs/MODULARIZACION_PORTAL.md
   */
  window.AppModules.rrhh = {
    payrollHtml: (...args) => window.AppLegacyViews?.payrollHtml?.(...args) || "",
    hiringHtml: (...args) => window.AppLegacyViews?.hiringHtml?.(...args) || "",
    laborComplianceHtml: (...args) => window.AppLegacyViews?.laborComplianceHtml?.(...args) || "",
    documentManagementHtml: (...args) => window.AppLegacyViews?.documentManagementHtml?.(...args) || ""
  };
})();
