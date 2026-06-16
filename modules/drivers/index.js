/**
 * Barrel `DomainModules.drivers` → dominio ES.
 */
window.DomainModules = window.DomainModules || {};
window.DomainModules.drivers = {
  readAllSync() {
    return window.AntaresDriversDomain?.readDriversSync?.() ?? [];
  },
  normalizeFleetLayout(raw) {
    return window.AntaresDriversDomain?.normalizeDriversFleetLayout?.(raw) ?? "cards";
  },
  filterBySearch(drivers, search) {
    return window.AntaresDriversDomain?.filterDriversBySearch?.(drivers, search) ?? drivers;
  },
  displayName(driver) {
    return window.AntaresDriversDomain?.driverDisplayName?.(driver) ?? "Sin nombre";
  }
};
