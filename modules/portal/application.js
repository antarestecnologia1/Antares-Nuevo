/**
 * Fachada de aplicación: capas y puntos de extensión.
 * - Portal: navegación, permisos, layout (modules/portal/*)
 * - Vistas: AppModules (feature) + AppLegacyViews (transición)
 * - Dominio: DomainRegistry + DomainModules (lógica por contexto acotado)
 * - Persistencia: AntaresPersistence (caché); PortalDataLayer (política BD ↔ caché); datos en PostgreSQL vía API
 */
(function registerApplicationFacade() {
  window.AntaresApp = {
    name: "antares-portal",
    version: "0.2.0",

    layers: {
      persistence: () => window.AntaresPersistence,
      portalDataLayer: () => window.PortalDataLayer,
      portalArchitecture: () => window.PortalArchitecture,
      portalAccess: () => window.PortalCoreAccess,
      portalRouter: () => window.PortalCoreRouter,
      portalRenderer: () => window.PortalCoreRenderer,
      domainRegistry: () => window.DomainRegistry,
      featureViews: () => window.AppModules,
      legacyViews: () => window.AppLegacyViews
    },

    /** Resumen para depuración o futuro CLI de salud */
    diagnostics() {
      const L = this.layers;
      return {
        persistence: Boolean(L.persistence()),
        portalDataLayer: Boolean(L.portalDataLayer?.()?.refreshCacheFromApi),
        portal: Boolean(L.portalArchitecture() && L.portalAccess() && L.portalRouter() && L.portalRenderer()),
        domainWired: Boolean(L.domainRegistry()?.repositories),
        featureModules: Object.keys(L.featureViews() || {}).length,
        legacyViewCount: Object.keys(L.legacyViews() || {}).length
      };
    }
  };
})();
