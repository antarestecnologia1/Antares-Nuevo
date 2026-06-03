/**
 * Capa de datos del portal (política única).
 *
 * - Fuente de verdad: PostgreSQL (p. ej. Supabase) expuesta por apps/api.
 * - Proyección en cliente: memoria + persistencia local (AntaresPersistence), repoblada con GET /api/portal/bootstrap.
 * - Escrituras: POST /api/portal/sync-key (vía AntaresPortalSync tras write hacia la proyección local).
 *
 * No duplica lógica de negocio: solo orquesta cuándo refrescar la caché desde el servidor.
 */
(function registerPortalDataLayer() {
  var VIS_DEBOUNCE_MS = 120000;
  var lastVisibilityPull = 0;
  var visibilityHookInstalled = false;

  function isServerBacked() {
    var a = window.AntaresApi;
    if (!a || typeof a.getBase !== "function" || !a.getBase()) return false;
    if (typeof window.portalCanRefreshFromApi === "function") {
      return window.portalCanRefreshFromApi();
    }
    return Boolean(typeof a.getAccessToken === "function" && String(a.getAccessToken() || "").trim());
  }

  /**
   * Hidrata todas las claves de portal desde GET /portal/bootstrap (implementado en app.js).
   * @returns {Promise<boolean>}
   */
  function refreshCacheFromApi() {
    if (!isServerBacked()) return Promise.resolve(false);
    var fn = window.applyPortalBootstrapFromApi;
    if (typeof fn !== "function") return Promise.resolve(false);
    return Promise.resolve(fn());
  }

  function notifyUiIfPossible() {
    var cb = window.__portalRefreshAfterBootstrap;
    if (typeof cb === "function") {
      try {
        cb();
      } catch (_e) {
        /* noop */
      }
    }
  }

  /** Tras volver a la pestaña, refresca caché ante cambios hechos en otro dispositivo o pestaña (debounced). */
  function enableVisibilityRefresh() {
    if (visibilityHookInstalled) return;
    visibilityHookInstalled = true;
    document.addEventListener("visibilitychange", function onVis() {
      if (document.visibilityState !== "visible") return;
      if (!isServerBacked()) return;
      var now = Date.now();
      if (now - lastVisibilityPull < VIS_DEBOUNCE_MS) return;
      if (typeof window.portalSnapshotIsFresh === "function" && window.portalSnapshotIsFresh()) {
        return;
      }
      lastVisibilityPull = now;
      void refreshCacheFromApi().then(function (ok) {
        if (ok) notifyUiIfPossible();
      });
    });
  }

  window.PortalDataLayer = {
    SOURCE_OF_TRUTH: "postgresql-api",
    CACHE_PROJECTION: "antares-persistence",
    isServerBacked: isServerBacked,
    refreshCacheFromApi: refreshCacheFromApi,
    enableVisibilityRefresh: enableVisibilityRefresh
  };
})();
