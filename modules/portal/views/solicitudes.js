/** Fachada `AppModules.solicitudes`; HTML en `modules/app/solicitudes-html.js`. */
(function registerSolicitudesModuleFacade() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules.solicitudes = {
    ...(window.AppModules.solicitudes || {}),
    requestsHtml: (...args) => window.AppLegacyViews?.requestsHtml?.(...args) || ""
  };
})();
