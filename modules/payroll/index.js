/**
 * Barrel `DomainModules.payroll` → `AntaresNominaDomain` (lectura delegada).
 */
window.DomainModules = window.DomainModules || {};
window.DomainModules.payroll = {
  readEmployeesSync() {
    if (typeof window.readArray === "function" && window.KEYS?.payrollEmployees) {
      return window.readArray(window.KEYS.payrollEmployees);
    }
    return [];
  }
};
