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
    /* Se recorta a los máximos del servidor: un texto largo no debe provocar «Bad Request» en todo el lote. */
    var cut = function (v, max) {
      var t = String(v == null ? "" : v).trim();
      return t ? t.slice(0, max) : undefined;
    };
    return {
      id: cut(r.id, 64),
      action: String(r.action || "update"),
      moduleId: String(r.moduleId || "").trim().slice(0, 64),
      moduleLabel: String(r.moduleLabel || r.moduleId || "Módulo").trim().slice(0, 120),
      entityId: cut(r.entityId, 64),
      entityLabel: cut(r.entityLabel, 500),
      summary: cut(r.summary, 2000),
      at: cut(r.at, 64),
      actorUserId: actorUserId,
      actorEmail: actorEmail ? String(actorEmail).slice(0, 255) : undefined,
      detailAction: cut(r.detailAction, 64),
      detailId: cut(r.detailId, 64),
      changesText: cut(r.changesText, 2000),
      companyId: cut(r.companyId, 64)
    };
  }

  /* Reintentos con espera creciente solo ante fallos transitorios (red, 5xx, 408, 429). */
  var failStreak = 0;
  var RETRY_DELAYS_MS = [1500, 4000, 10000, 30000, 60000];
  var MAX_TRANSIENT_FAILS = RETRY_DELAYS_MS.length;

  function isTransientStatus(status) {
    var st = Number(status) || 0;
    return st === 0 || st === 408 || st === 429 || st >= 500;
  }

  /**
   * Un lote rechazado con 400/413/422 ya NO se reinserta (antes se reintentaba cada 500 ms para siempre y el
   * servidor devolvía «Bad Request» hasta cerrar sesión): se reenvía evento por evento y solo se descarta el
   * que el servidor rechaza. 401/403 (sin sesión o sin permiso de auditoría) descartan el lote.
   */
  function sendBatch(batch) {
    return window.AntaresApi.postJson("/portal/audit-events", { events: batch });
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
    var requeueBatch = function (rows) {
      failStreak += 1;
      if (failStreak > MAX_TRANSIENT_FAILS) {
        failStreak = 0; /* demasiados fallos seguidos: se descarta para no saturar al servidor */
        return;
      }
      queue = rows.concat(queue);
    };
    var sendOneByOne = async function (rows) {
      for (var i = 0; i < rows.length; i += 1) {
        try {
          await sendBatch([rows[i]]);
        } catch (err) {
          if (isTransientStatus(err && err.status)) {
            requeueBatch(rows.slice(i));
            return;
          }
          /* Rechazo definitivo de este evento: se descarta y se continúa con el resto. */
        }
      }
      failStreak = 0;
    };
    return sendBatch(batch)
      .then(function () {
        failStreak = 0;
      })
      .catch(function (err) {
        var status = err && err.status;
        if (isTransientStatus(status)) {
          requeueBatch(batch);
          return null;
        }
        if (status === 401 || status === 403) {
          queue = [];
          return null;
        }
        return sendOneByOne(batch);
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
    var delay = failStreak > 0 ? RETRY_DELAYS_MS[Math.min(failStreak, RETRY_DELAYS_MS.length) - 1] : 500;
    timer = setTimeout(function () {
      timer = null;
      void flush();
    }, delay);
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
      throw new Error("Su sesión expiró. Vuelva a iniciar sesión para depurar el historial.");
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
