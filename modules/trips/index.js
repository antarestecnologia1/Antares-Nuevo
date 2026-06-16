/**
 * Barrel `DomainModules.trips` → `AntaresViajesDomain`.
 */
window.DomainModules = window.DomainModules || {};
window.DomainModules.trips = {
  readRequestsSync() {
    if (typeof window.readPortalTransportRequests === "function") {
      return window.readPortalTransportRequests();
    }
    return window.AntaresViajesDomain?.readPortalTransportRequests?.() ?? [];
  },
  getActiveTrips(requests) {
    return window.AntaresViajesDomain?.getActiveTrips?.(requests) ?? [];
  }
};
