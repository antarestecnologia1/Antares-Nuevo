/**
 * Gestión humana — lista de colaboradores: rehidratación desde API sin volcar todo el bootstrap.
 * Depende de funciones globales definidas en app.js (carga previa de este script en index.html).
 */
(function registerPayrollEmployeeListSync() {
  var PAYROLL_EMPLOYEES_STORAGE_KEY = "antares_payroll_employees_v2";

  function logWarn(msg, err) {
    try {
      if (typeof window !== "undefined" && window.__ANTARES_DEBUG__ === true && console.warn) {
        console.warn(msg, err);
      }
    } catch (_e) {}
  }

  /**
   * @returns {Promise<boolean>}
   */
  async function refreshFromApi() {
    if (typeof window.portalCanRefreshFromApi !== "function" || !window.portalCanRefreshFromApi()) return false;
    var api = window.AntaresApi;
    if (!api || typeof api.getJson !== "function") return false;
    if (typeof window.applyPortalBootstrapPayload !== "function") return false;
    try {
      var rows = await api.getJson("/portal/payroll-employees", { timeoutMs: 28000 });
      if (!Array.isArray(rows)) return false;
      window.applyPortalBootstrapPayload({ payrollEmployees: rows });
      try {
        if (typeof window.savePortalSnapshotAfterBootstrap === "function") {
          window.savePortalSnapshotAfterBootstrap({ dirtyKeys: [PAYROLL_EMPLOYEES_STORAGE_KEY] });
        }
      } catch (_snap) {}
      return true;
    } catch (err) {
      logWarn("Portal: GET /portal/payroll-employees fallo.", err && err.message ? err.message : err);
      return false;
    }
  }

  window.PayrollEmployeeListSync = {
    refreshFromApi: refreshFromApi,
    PAYROLL_EMPLOYEES_STORAGE_KEY: PAYROLL_EMPLOYEES_STORAGE_KEY
  };
})();
