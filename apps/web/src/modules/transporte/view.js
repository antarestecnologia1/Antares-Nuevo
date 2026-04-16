(function registerTransporteModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.transporte = {
    adminQueueHtml: (...args) => window.AppLegacyViews?.adminQueueHtml?.(...args) || "",
    transportTripsHtml: (...args) => window.AppLegacyViews?.transportTripsHtml?.(...args) || "",
    vehiclesHtml: (...args) => window.AppLegacyViews?.vehiclesHtml?.(...args) || "",
    driversHtml: (...args) => window.AppLegacyViews?.driversHtml?.(...args) || "",
    transportCalendarHtml: (...args) => window.AppLegacyViews?.transportCalendarHtml?.(...args) || "",
    historyHtml: (...args) => window.AppLegacyViews?.historyHtml?.(...args) || ""
  };
})();
