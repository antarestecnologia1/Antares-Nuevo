/**
 * Puente de transición: centraliza el registro de vistas implementadas aún en app.js.
 * Sustituye la asignación directa `window.AppLegacyViews = { ... }` por lotes registrables
 * y deja un objeto estable para `AppModules.*` (modules/portal/views/*.js).
 */
import {
  clientDataScopeBarHtml,
  clientRequestsScopePrimaryLabel,
  getClientDataScope,
  isPortalClientUser
} from "../core/client-data-scope-ui.js";

(function registerLegacyViewsBridge() {
  window.AppLegacyViews = window.AppLegacyViews || {};

  /**
   * @param {Record<string, unknown>} views mapa nombre → función o valor (misma forma que antes en app.js)
   */
  window.registerLegacyPortalViews = function registerLegacyPortalViews(views) {
    if (!views || typeof views !== "object") return;
    Object.assign(window.AppLegacyViews, views);
  };

  window.registerLegacyPortalViews({
    clientDataScopeBarHtml,
    clientRequestsScopePrimaryLabel,
    isPortalClientUser,
    getClientDataScope
  });

  try {
    Object.assign(globalThis, {
      getClientDataScope,
      isPortalClientUser,
      clientRequestsScopePrimaryLabel,
      clientDataScopeBarHtml
    });
  } catch (_e) {
    /* noop */
  }
})();
