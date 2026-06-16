/**
 * Barrel `DomainModules.users` → `AntaresUsersDomain`.
 */
window.DomainModules = window.DomainModules || {};
window.DomainModules.users = {
  getAdminUi() {
    return window.AntaresUsersDomain?.getAdminUsersUi?.() ?? {};
  },
  patchAdminUi(partial) {
    return window.AntaresUsersDomain?.patchAdminUsersUi?.(partial);
  },
  filterDirectory(rows, search) {
    return window.AntaresUsersDomain?.filterDirectoryRows?.(rows, search) ?? rows;
  }
};
