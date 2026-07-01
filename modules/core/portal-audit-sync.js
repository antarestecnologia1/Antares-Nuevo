/**
 * Cola de envío de eventos de auditoría del portal a PostgreSQL (POST /portal/audit-events).
 */
(function registerPortalAuditSync() {
  "use strict";

  var queue = [];
  var timer = null;
  var flushing = false;

  function apiReady() {
    var api = window.AntaresApi;
    return api && typeof api.isConfigured === "function" && api.isConfigured() && typeof api.postJson === "function";
  }

  function mapRow(row) {
    var r = row && typeof row === "object" ? row : {};
    var snapshot =
      typeof window.buildPortalAuditActorSnapshot === "function" ? window.buildPortalAuditActorSnapshot() : {};
    var actorUserId = String(r.actorUserId || snapshot.userId || "").trim() || undefined;
    var actorEmail = String(r.actorEmail || snapshot.email || "").trim() || undefined;
    return {
      id: String(r.id || "").trim() || undefined,
      action: String(r.action || "update"),
      moduleId: String(r.moduleId || "").trim(),
      moduleLabel: String(r.moduleLabel || r.moduleId || "Módulo").trim(),
      entityId: String(r.entityId || "").trim() || undefined,
      entityLabel: String(r.entityLabel || "").trim() || undefined,
      summary: String(r.summary || "").trim() || undefined,
      at: String(r.at || "").trim() || undefined,
      actorUserId: actorUserId,
      actorEmail: actorEmail,
      detailAction: String(r.detailAction || "").trim() || undefined,
      detailId: String(r.detailId || "").trim() || undefined,
      changesText: String(r.changesText || "").trim() || undefined,
      companyId: String(r.companyId || "").trim() || undefined
    };
  }

  function flush() {
    if (flushing || !queue.length || !apiReady()) return Promise.resolve(false);
    flushing = true;
    var batch = queue.splice(0, 40).map(mapRow).filter(function (row) {
      return row.moduleId;
    });
    if (!batch.length) {
      flushing = false;
      return Promise.resolve(false);
    }
    return window.AntaresApi.postJson("/portal/audit-events", { events: batch })
      .catch(function () {
        queue = batch.concat(queue);
        return null;
      })
      .finally(function () {
        flushing = false;
        if (queue.length) scheduleFlush();
      })
      .then(function () {
        return true;
      });
  }

  function scheduleFlush() {
    if (timer != null) return;
    timer = setTimeout(function () {
      timer = null;
      void flush();
    }, 500);
  }

  function enqueue(row) {
    if (!row || typeof row !== "object") return;
    queue.push(row);
    if (queue.length > 200) queue = queue.slice(-200);
    scheduleFlush();
  }

  async function refreshModuleAuditLogsFromApi(opts) {
    if (!apiReady() || typeof window.AntaresApi.getJson !== "function") return false;
    var o = opts && typeof opts === "object" ? opts : {};
    var limit = Number(o.limit) > 0 ? Math.min(Number(o.limit), 10000) : 5000;
    var qs = new URLSearchParams({ limit: String(limit) });
    if (o.from) qs.set("from", String(o.from));
    if (o.to) qs.set("to", String(o.to));
    try {
      var res = await window.AntaresApi.getJson("/portal/audit-events?" + qs.toString());
      var items = res && Array.isArray(res.items) ? res.items : [];
      if (!o.force && !items.length && !(res && res.total > 0)) return false;
      var KEYS = window.KEYS;
      var P = window.AntaresPersistence;
      var key = KEYS && KEYS.moduleAuditLogs ? KEYS.moduleAuditLogs : "antares_module_audit_logs_v1";
      var serverRows = Array.isArray(items) ? items : [];
      if (P && typeof P.write === "function") P.write(key, serverRows, { skipSyncSchedule: true });
      else {
        try {
          if (serverRows.length) localStorage.setItem(key, JSON.stringify(serverRows));
          else localStorage.removeItem(key);
        } catch (_rm) {
          /* noop */
        }
      }
      return true;
    } catch (_err) {
      return false;
    }
  }

  /**
   * Depura la bitácora de auditoría en PostgreSQL (solo administradores; ver `PortalService.deletePortalAuditEvents`).
   * `payload` puede traer `from`/`to`/`moduleId`/`action` (filtros) o `scope: "all"` para vaciarla por completo.
   * Siempre requiere `motivo`. Tras borrar, refresca la caché local para reflejar el estado del servidor.
   */
  async function deleteEventsFromApi(payload) {
    if (!apiReady()) {
      throw new Error("Sesión sin autenticación API. Vuelva a iniciar sesión para depurar el historial.");
    }
    var body = payload && typeof payload === "object" ? payload : {};
    var res = await window.AntaresApi.postJson("/portal/audit-events/delete", body);
    await refreshModuleAuditLogsFromApi({ limit: 5000, force: true });
    return res;
  }

  window.AntaresPortalAuditSync = {
    enqueue: enqueue,
    flush: flush,
    refreshModuleAuditLogsFromApi: refreshModuleAuditLogsFromApi,
    deleteEventsFromApi: deleteEventsFromApi
  };
})();
