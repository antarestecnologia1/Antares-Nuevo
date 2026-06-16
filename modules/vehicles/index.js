/**
 * Barrel `DomainModules.vehicles` → dominio ES.
 */
window.DomainModules = window.DomainModules || {};
window.DomainModules.vehicles = {
  normalizeFleetLayout(raw) {
    return window.AntaresVehiclesDomain?.normalizeVehicleFleetLayout?.(raw) ?? "cards";
  },
  readAllSync() {
    return window.AntaresVehiclesDomain?.readVehiclesSync?.() ?? [];
  },
  filterBySearch(vehicles, search) {
    return window.AntaresVehiclesDomain?.filterVehiclesBySearch?.(vehicles, search) ?? vehicles;
  }
};
