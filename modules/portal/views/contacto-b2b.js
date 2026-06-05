/** Fachada `AppModules`; HTML y datos en `modules/app/contacto-b2b.js` → `AppLegacyViews.contactLeadsHtml`. */
(function registerContactoB2bModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules["contacto-b2b"] = {
    contactLeadsHtml: (...args) => window.AppLegacyViews?.contactLeadsHtml?.(...args) || ""
  };
})();
