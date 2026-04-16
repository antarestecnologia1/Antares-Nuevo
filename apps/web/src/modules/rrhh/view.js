(function registerRrhhModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.rrhh = {
    payrollHtml: (...args) => window.AppLegacyViews?.payrollHtml?.(...args) || "",
    hiringHtml: (...args) => window.AppLegacyViews?.hiringHtml?.(...args) || ""
  };
})();
