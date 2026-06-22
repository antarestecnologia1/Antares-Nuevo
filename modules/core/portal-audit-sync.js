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
    return {
      id: String(r.id || "").trim() || undefined,
      action: String(r.action || "update"),
      moduleId: String(r.moduleId || "").trim(),
      moduleLabel: String(r.moduleLabel || r.moduleId || "Módulo").trim(),
      entityId: String(r.entityId || "").trim() || undefined,
      entityLabel: String(r.entityLabel || "").trim() || undefined,
      summary: String(r.summary || "").trim() || undefined,
      at: String(r.at || "").trim() || undefined,
      detailAction: String(r.detailAction || "").trim() || undefined,
      detailId: String(r.detailId || "").trim() || undefined
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

  function mergeModuleAuditLogs(serverRows, localRows) {
    var map = Object.create(null);
    var all = []
      .concat(Array.isArray(serverRows) ? serverRows : [])
      .concat(Array.isArray(localRows) ? localRows : []);
    all.forEach(function (row) {
      if (!row || typeof row !== "object") return;
      var id = String(row.id || "").trim();
      if (!id) return;
      var prev = map[id];
      if (!prev || String(row.at || "") > String(prev.at || "")) map[id] = row;
    });
    return Object.keys(map)
      .map(function (k) {
        return map[k];
      })
      .sort(function (a, b) {
        return String(b.at || "").localeCompare(String(a.at || ""));
      })
      .slice(0, 600);
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
      if (!items.length && !(res && res.total > 0)) return false;
      var KEYS = window.KEYS;
      var P = window.AntaresPersistence;
      var key = KEYS && KEYS.moduleAuditLogs ? KEYS.moduleAuditLogs : "antares_module_audit_logs_v1";
      var serverRows = Array.isArray(items) ? items : [];
      if (P && typeof P.write === "function") P.write(key, serverRows, { skipSyncSchedule: true });
      else {
        try {
          localStorage.removeItem(key);
        } catch (_rm) {
          /* noop */
        }
      }
      return true;
    } catch (_err) {
      return false;
    }
  }

  window.AntaresPortalAuditSync = {
    enqueue: enqueue,
    flush: flush,
    mergeModuleAuditLogs: mergeModuleAuditLogs,
    refreshModuleAuditLogsFromApi: refreshModuleAuditLogsFromApi
  };
})();
