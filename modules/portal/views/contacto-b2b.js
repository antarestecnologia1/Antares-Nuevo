(function registerContactoB2bModule() {
  if (!window.AppModules) window.AppModules = {};
  window.AppModules["contacto-b2b"] = {
    contactLeadsHtml: (...args) => window.AppLegacyViews?.contactLeadsHtml?.(...args) || ""
  };
})();
