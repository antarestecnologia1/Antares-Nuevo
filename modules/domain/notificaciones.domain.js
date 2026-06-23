/**
 * Dominio de notificaciones del portal: preferencias y audio, bandeja / lectura, polling de campana.
 * Extraído desde modules/core/portal-runtime.js (FASE 7).
 *
 * Persistencia bandeja: lectura y borrado solo vía PostgreSQL (`POST mark-read`, `POST delete`,
 * `GET /portal/notifications`). La RAM de sesión se reemplaza con la respuesta del servidor.
 */
import {
  KEYS,
  NOTIF_LIGHT_REFRESH_MIN_MS,
  NOTIF_SILENT_BOOTSTRAP_MIN_MS,
  PERMISSIONS,
  ROLES
} from "../core/config.js";
import { read, write } from "../core/data-io.js";
import { state } from "../core/store.js";
import { nowIso } from "../core/utils.js";
import { currentUser, getSession, isAdminActor, hasPermission } from "../core/auth.js";
import {
  applyPortalBootstrapFromApi,
  portalCanRefreshFromApi,
  portalSnapshotIsFresh,
  syncSessionProfileSnapshotFromCache
} from "../core/bootstrap.js";

/**
 * Preferencias de notificaciones: única persistencia en PostgreSQL (`preferencias_notificacion_usuario`),
 * vía GET /portal/bootstrap (`notificationPreferences`) y POST /portal/notification-preferences.
 * En memoria solo `state.notificationPreferences` (hasta que llegue el bootstrap).
 */
let __notifInboxAudioCtx = null;
let __notifInboxAudioUnlockInstalled = false;

/** IDs eliminados recientemente: evita que un GET obsoleto del poll los restaure. */
const __pendingDeletionIds = new Set();
let __pendingDeletionClearTimeout = null;

function __markPendingDeletion(ids) {
  for (const id of Array.isArray(ids) ? ids : []) {
    const n = String(id || "").trim();
    if (n) __pendingDeletionIds.add(n);
  }
  clearTimeout(__pendingDeletionClearTimeout);
  __pendingDeletionClearTimeout = setTimeout(() => __pendingDeletionIds.clear(), 30000);
}

/** Edad de una notificación respecto al reloj local; sin fecha fiable → antigua (no re-toast). */
function __notificationPollAgeMs(n, nowMs) {
  const raw = n?.createdAt;
  if (raw === undefined || raw === null || String(raw).trim() === "") return Number.POSITIVE_INFINITY;
  const createdTs = new Date(raw).getTime();
  if (!Number.isFinite(createdTs)) return Number.POSITIVE_INFINITY;
  return nowMs - createdTs;
}

const __NOTIF_TOAST_SEEN_LS_PREFIX = "antares_notif_toast_seen:";
const __NOTIF_TOAST_SEEN_MAX = 500;

function __toastSeenStorageKey(userId) {
  return `${__NOTIF_TOAST_SEEN_LS_PREFIX}${String(userId || "").trim()}`;
}

function __loadPersistedToastSeenIds(userId) {
  const uid = String(userId || "").trim();
  if (!uid || typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(__toastSeenStorageKey(uid));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(
      (Array.isArray(arr) ? arr : [])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    );
  } catch (_e) {
    return new Set();
  }
}

function __persistToastSeenIds(userId, idSet) {
  const uid = String(userId || "").trim();
  if (!uid || typeof localStorage === "undefined") return;
  try {
    const arr = [...idSet].slice(-__NOTIF_TOAST_SEEN_MAX);
    localStorage.setItem(__toastSeenStorageKey(uid), JSON.stringify(arr));
  } catch (_e) {
    /* noop */
  }
}

function __ensureLastSeenNotificationIds() {
  if (!__lastSeenNotificationIds) __lastSeenNotificationIds = new Set();
  return __lastSeenNotificationIds;
}

/**
 * Marca avisos como ya «mostrados» (toast/timbre) para no repetirlos en cada ingreso.
 * Persiste por usuario en localStorage.
 */
export function markInboxNotificationsAsToastSeen(ids) {
  const user = currentUser();
  const uid = String(user?.id ?? "").trim();
  const normalized = [
    ...new Set(
      (Array.isArray(ids) ? ids : [ids])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  ];
  if (!normalized.length) return;
  const seen = __ensureLastSeenNotificationIds();
  for (const id of normalized) seen.add(id);
  if (!uid) return;
  const persisted = __loadPersistedToastSeenIds(uid);
  for (const id of normalized) persisted.add(id);
  __persistToastSeenIds(uid, persisted);
}

function __notificationAlreadySurfacedToUser(n) {
  const id = String(n?.id || "").trim();
  if (!id) return true;
  if (__lastSeenNotificationIds?.has(id)) return true;
  const user = currentUser();
  if (!user) return false;
  return __loadPersistedToastSeenIds(user.id).has(id);
}

/**
 * Ventana «en vivo» del poll: evita re-toastear historial.
 * Si el servidor va adelantado (age < 0), igual contamos como fresca para no silenciar timbre/toast.
 */
function __inboxNotificationIsFreshForPoll(n, nowMs, windowMs) {
  return __notificationPollAgeMs(n, nowMs) < windowMs;
}

export function ensureInboxNotificationAudioUnlocked() {
  if (typeof document === "undefined" || __notifInboxAudioUnlockInstalled) return;
  __notifInboxAudioUnlockInstalled = true;
  const resume = () => {
    try {
      const ctx = __notifInboxAudioCtx;
      if (ctx && ctx.state === "suspended") void ctx.resume();
    } catch (_e) {}
  };
  ["pointerdown", "keydown", "click"].forEach((ev) => {
    document.addEventListener(ev, resume, { capture: true, passive: true });
  });
}

export function getNotificationPreferencesNormalized() {
  const p = state.notificationPreferences;
  if (p && typeof p === "object") {
    return {
      id: String(p.id || "").trim() || null,
      notificacionesHabilitadas: p.notificacionesHabilitadas !== false,
      sonidoNotificacionesHabilitadas: p.sonidoNotificacionesHabilitadas !== false,
      createdAt: p.createdAt ? String(p.createdAt) : null,
      updatedAt: p.updatedAt ? String(p.updatedAt) : null
    };
  }
  return {
    id: null,
    notificacionesHabilitadas: true,
    sonidoNotificacionesHabilitadas: true,
    createdAt: null,
    updatedAt: null
  };
}

/** Timbre audible (columna `sonido_notificaciones_habilitadas`); independiente de avisos emergentes. */
export function isSonidoNotificacionesHabilitado() {
  return getNotificationPreferencesNormalized().sonidoNotificacionesHabilitadas !== false;
}

/** Avisos emergentes (toasts) y fila server-side respetan este flag. */
export function isInAppNotificationAlertsEnabled() {
  return getNotificationPreferencesNormalized().notificacionesHabilitadas !== false;
}

/** Reproduce timbre solo si avisos y sonido están activos. */
export function isInboxNotificationSoundEnabled() {
  const n = getNotificationPreferencesNormalized();
  if (!n.notificacionesHabilitadas) return false;
  return n.sonidoNotificacionesHabilitadas !== false;
}

export async function persistNotificationPreferencesToApi(partial) {
  const api = window.AntaresApi;
  if (!api?.getBase?.() || typeof api.postJson !== "function") return null;
  if (!api?.isConfigured?.()) return null;
  const body = {};
  if (partial.notificacionesHabilitadas !== undefined) {
    body.notificacionesHabilitadas = Boolean(partial.notificacionesHabilitadas);
  }
  if (partial.sonidoNotificacionesHabilitadas !== undefined) {
    body.sonidoNotificacionesHabilitadas = Boolean(partial.sonidoNotificacionesHabilitadas);
  }
  if (!Object.keys(body).length) return null;
  try {
    const res = await api.postJson("/portal/notification-preferences", body);
    if (res && typeof res === "object") {
      if (typeof window.applyNotificationPreferencesFromBootstrapPayload === "function") {
        window.applyNotificationPreferencesFromBootstrapPayload(res);
      }
    }
    return res;
  } catch (_e) {
    window.notify("No se pudieron guardar las preferencias de notificaciones.", "error");
    return null;
  }
}

export function setNotificationsEnabled(enabled) {
  const on = Boolean(enabled);
  state.notificationPreferences = {
    ...getNotificationPreferencesNormalized(),
    notificacionesHabilitadas: on,
    sonidoNotificacionesHabilitadas: on,
    updatedAt: nowIso()
  };
  syncNotificationPrefsSidebarUi();
  if (on) primeInboxNotificationAudioFromUserGesture();
  void persistNotificationPreferencesToApi({
    notificacionesHabilitadas: on,
    sonidoNotificacionesHabilitadas: on
  });
}

export function isNotificationsEnabled() {
  return isInAppNotificationAlertsEnabled();
}

export function toggleNotificationsEnabled() {
  const next = !isNotificationsEnabled();
  setNotificationsEnabled(next);
  globalThis.logPortalAuditEvent?.("bell", "update", {
    entityId: String(globalThis.currentUser?.()?.id || "prefs"),
    entityLabel: "Timbre",
    summary: next ? "Notificaciones activadas (timbre y avisos)" : "Notificaciones desactivadas"
  });
  window.notify(
    next
      ? "Notificaciones activadas: avisos y timbre."
      : "Notificaciones desactivadas. La bandeja sigue disponible.",
    "info",
    2600
  );
}

export function setNotificationSoundMuted(muted) {
  const sonidoOn = !muted;
  state.notificationPreferences = {
    ...getNotificationPreferencesNormalized(),
    sonidoNotificacionesHabilitadas: sonidoOn,
    updatedAt: nowIso()
  };
  syncNotificationPrefsSidebarUi();
  if (sonidoOn) primeInboxNotificationAudioFromUserGesture();
  void persistNotificationPreferencesToApi({ sonidoNotificacionesHabilitadas: sonidoOn });
}

export function setNotificationAlertsEnabled(enabled) {
  state.notificationPreferences = {
    ...getNotificationPreferencesNormalized(),
    notificacionesHabilitadas: Boolean(enabled),
    updatedAt: nowIso()
  };
  syncNotificationPrefsSidebarUi();
  void persistNotificationPreferencesToApi({ notificacionesHabilitadas: Boolean(enabled) });
}

export function toggleNotificationSoundMuted() {
  const wasSoundOn = isSonidoNotificacionesHabilitado();
  setNotificationSoundMuted(wasSoundOn);
  globalThis.logPortalAuditEvent?.("bell", "update", {
    entityId: String(globalThis.currentUser?.()?.id || "prefs"),
    entityLabel: "Timbre",
    summary: wasSoundOn ? "Timbre silenciado" : "Timbre activado"
  });
  window.notify(
    wasSoundOn
      ? "Timbre silenciado (solo audio). Los avisos en pantalla no cambian si los tienes activos."
      : "Timbre activado.",
    "info",
    2600
  );
}

export function toggleNotificationAlertsEnabled() {
  const next = !isInAppNotificationAlertsEnabled();
  setNotificationAlertsEnabled(next);
  globalThis.logPortalAuditEvent?.("alerts", "update", {
    entityId: String(globalThis.currentUser?.()?.id || "prefs"),
    entityLabel: "Avisos",
    summary: next ? "Avisos emergentes activados" : "Avisos emergentes desactivados"
  });
  window.notify(
    next
      ? "Avisos emergentes activados. Verás mensajes al instante cuando lleguen avisos nuevos."
      : "Avisos emergentes desactivados: sin ventanas por avisos nuevos ni notificaciones nuevas del servidor. La bandeja conserva el historial ya recibido.",
    "info",
    3800
  );
}

export function syncNotificationPrefsSidebarUi() {
  const group = document.querySelector(".sidebar-notif-group");
  const link =
    group?.querySelector('.side-link[data-view="notifications"]') ||
    document.querySelector('.side-link[data-view="notifications"]');
  if (!link && !group) return;
  const off = !isNotificationsEnabled();
  if (link) {
    link.classList.toggle("side-link--notif-alerts-off", off);
  }
  const bellBtn = group?.querySelector('[data-notif-pref="master"]');
  if (bellBtn) {
    bellBtn.setAttribute("aria-pressed", off ? "false" : "true");
    bellBtn.setAttribute(
      "aria-label",
      off ? "Notificaciones desactivadas. Pulsar para activar" : "Notificaciones activadas. Pulsar para desactivar"
    );
    bellBtn.title = off ? "Activar notificaciones" : "Desactivar notificaciones";
    bellBtn.classList.toggle("sidebar-notif-bell-toggle--off", off);
  }
  if (group) {
    group.classList.toggle("sidebar-notif-group--off", off);
  }
}

/** @deprecated usar syncNotificationPrefsSidebarUi */
export function syncNotificationSoundMutedUi() {
  syncNotificationPrefsSidebarUi();
}

/**
 * Timbre breve para nuevas notificaciones de bandeja (no afecta otros `window.notify()` de la app).
 * Puede quedar en silencio hasta la primera interacción del usuario (política del navegador).
 */
export function playInboxNotificationSound() {
  if (!isInboxNotificationSoundEnabled()) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!__notifInboxAudioCtx) __notifInboxAudioCtx = new AC();
    ensureInboxNotificationAudioUnlocked();
    const ctx = __notifInboxAudioCtx;
    const run = () => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = "sine";
      const t0 = ctx.currentTime;
      osc.frequency.setValueAtTime(740, t0);
      osc.frequency.setValueAtTime(988, t0 + 0.07);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.075, t0 + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
      osc.start(t0);
      osc.stop(t0 + 0.34);
    };
    if (ctx.state === "suspended") {
      void ctx.resume().then(run).catch(() => {});
    } else {
      run();
    }
  } catch (_e) {}
}

/**
 * Tras un gesto explícito (p. ej. activar timbre), deja el AudioContext listo para el poll sin esperar otro clic.
 */
export function primeInboxNotificationAudioFromUserGesture() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!__notifInboxAudioCtx) __notifInboxAudioCtx = new AC();
    ensureInboxNotificationAudioUnlocked();
    const ctx = __notifInboxAudioCtx;
    if (ctx.state === "suspended") void ctx.resume();
  } catch (_e) {}
}

export function getNotificationRecipientId(n) {
  if (!n || typeof n !== "object") return "";
  return String(n.userId ?? n.user_id ?? n.id_usuario ?? "").trim();
}

export function getNotificationAudience(n) {
  if (!n || typeof n !== "object") return "";
  return String(n.audience ?? n.audiencia ?? "").trim().toLowerCase();
}

const HR_NOTIFICATION_AUDIENCE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.RRHH,
  ROLES.ADMINISTRACION,
  ROLES.AUXILIAR_ADMINISTRATIVO,
  ROLES.LIDER_ADMINISTRATIVO
]);

function userReceivesHrAudienceNotifications(user) {
  return HR_NOTIFICATION_AUDIENCE_ROLES.has(String(user?.role || ""));
}

/**
 * Capacidad operativa (sync-key). La bandeja muestra notificaciones personales y las
 * compartidas por audiencia (admins / RRHH) visibles para el rol de la sesión.
 */
export function canViewAllNotifications(user) {
  return isAdminActor(user);
}

function notificationTargetsUser(n, user) {
  if (!user) return false;
  const audience = getNotificationAudience(n);
  if (audience === "admins" && isAdminActor(user)) return true;
  if (audience === "hr" && userReceivesHrAudienceNotifications(user)) return true;
  const uid = String(user.id ?? "").trim();
  if (!uid) return false;
  const recipientId = getNotificationRecipientId(n);
  if (!recipientId) return false;
  return recipientId === uid;
}

function notificationDedupeKey(n) {
  const audience = getNotificationAudience(n) || "_personal";
  const recipient =
    audience === "admins" || audience === "hr" ? audience : getNotificationRecipientId(n) || "_none";
  const createdMinute = String(n?.createdAt ?? "").slice(0, 16);
  return `${audience}\x1e${recipient}\x1e${String(n?.title ?? "").trim()}\x1e${String(n?.body ?? "").trim()}\x1e${createdMinute}`;
}

function __notificationReadAtEpochMs(v) {
  if (v == null || v === "") return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** True si la fila tiene `fecha_lectura` fiable (API camelCase o snake legacy). */
export function notificationIsRead(n) {
  if (!n || typeof n !== "object") return false;
  const raw = n.readAt ?? n.read_at;
  if (raw == null || raw === "") return false;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms);
}

/** Quita copias con mismo destino, título y cuerpo (p. ej. legacy «una por admin» o sync duplicado). */
export function dedupeNotificationsList(list) {
  const rows = Array.isArray(list) ? list : [];
  const byKey = new Map();
  for (const n of rows) {
    if (!n || typeof n !== "object") continue;
    const key = notificationDedupeKey(n);
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, n);
      continue;
    }
    const prevRead = notificationIsRead(prev);
    const nextRead = notificationIsRead(n);
    if (nextRead && !prevRead) {
      byKey.set(key, n);
      continue;
    }
    if (prevRead && !nextRead) continue;
    const prevTs = new Date(prev.createdAt || 0).getTime();
    const nextTs = new Date(n.createdAt || 0).getTime();
    if (Number.isFinite(nextTs) && (!Number.isFinite(prevTs) || nextTs >= prevTs)) {
      byKey.set(key, n);
    }
  }
  return [...byKey.values()];
}

function __expandNotificationReadTargetIds(ids, list) {
  const rows = Array.isArray(list) ? list : [];
  const normalized = [
    ...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))
  ];
  if (!normalized.length) return [];
  const dedupeKeys = new Set();
  for (const id of normalized) {
    const row = rows.find((n) => String(n?.id || "").trim() === id);
    if (row) dedupeKeys.add(notificationDedupeKey(row));
  }
  const expanded = new Set(normalized);
  for (const n of rows) {
    const id = String(n?.id || "").trim();
    if (!id) continue;
    if (dedupeKeys.has(notificationDedupeKey(n))) expanded.add(id);
  }
  return [...expanded];
}

function __notificationIdSetIncludes(targetIds, notificationId) {
  const id = String(notificationId || "").trim();
  if (!id) return false;
  return (Array.isArray(targetIds) ? targetIds : []).some((raw) => String(raw || "").trim() === id);
}

export function filterNotificationsForUser(user, list) {
  const rows = Array.isArray(list) ? list : [];
  if (!user) return [];
  return dedupeNotificationsList(rows.filter((n) => notificationTargetsUser(n, user)));
}

function __cancelNotificationsSyncSchedule() {
  try {
    window.AntaresPortalSync?.cancelScheduled?.(KEYS.notifications);
  } catch (_e) {
    /* noop */
  }
}

/** Quita de RAM las filas cuyo id (o duplicado lógico) fue borrado en servidor. */
function __removeNotificationsFromSessionCache(ids) {
  const idSet = new Set(
    (Array.isArray(ids) ? ids : [])
      .map((id) => String(id || "").trim())
      .filter(Boolean)
  );
  if (!idSet.size) return;
  const list = read(KEYS.notifications, []);
  const dedupeKeys = new Set();
  for (const id of idSet) {
    const row = list.find((n) => String(n?.id || "").trim() === id);
    if (row) dedupeKeys.add(notificationDedupeKey(row));
  }
  const actor = currentUser();
  const remaining = list.filter((n) => {
    const id = String(n?.id || "").trim();
    if (id && idSet.has(id)) return false;
    if (dedupeKeys.size && dedupeKeys.has(notificationDedupeKey(n))) return false;
    return true;
  });
  write(KEYS.notifications, actor ? filterNotificationsForUser(actor, remaining) : remaining, {
    skipSyncSchedule: true
  });
}

let __contractRenewalNoticeCheckWallMs = 0;

/** Aplica la lista devuelta por PostgreSQL en RAM, fusionando lecturas locales recientes. */
function applyNotificationsServerList(serverList) {
  const actor = currentUser();
  const prev = read(KEYS.notifications, []);
  let filtered = actor
    ? filterNotificationsForUser(actor, Array.isArray(serverList) ? serverList : [])
    : [];
  if (__pendingDeletionIds.size) {
    filtered = filtered.filter((n) => !__pendingDeletionIds.has(String(n?.id || "").trim()));
  }
  const merged = mergeNotificationsListPreserveReadAt(prev, filtered);
  write(KEYS.notifications, merged, { skipSyncSchedule: true });
  reconcileNotificationsCacheForSession();
  return merged;
}

/** GET /portal/notifications → reemplaza la bandeja en RAM (sin fusionar estado local). */
export async function refreshNotificationsFromServer() {
  const api = window.AntaresApi;
  if (!api?.getJson || !portalCanRefreshFromApi()) return false;
  try {
    const res = await api.getJson("/portal/notifications");
    const raw = Array.isArray(res?.notifications) ? res.notifications : [];
    const applied = applyNotificationsServerList(raw);
    updateNotificationBadge();
    return applied;
  } catch (_e) {
    return false;
  }
}

/** Refresco liviano de la bandeja (sin bootstrap completo). */
async function refreshNotificationsBellFromApi() {
  return refreshNotificationsFromServer();
}

/** Pide al servidor crear notificaciones de aviso de no renovación (término fijo) y refresca la bandeja. */
export async function refreshContractRenewalNotificationsFromServer() {
  const api = window.AntaresApi;
  if (!api?.postJson || !portalCanRefreshFromApi()) return false;
  const actor = currentUser();
  if (!actor || !hasPermission(actor, PERMISSIONS.PAYROLL_MANAGE)) return false;
  const now = Date.now();
  if (now - __contractRenewalNoticeCheckWallMs < 45000) return false;
  __contractRenewalNoticeCheckWallMs = now;
  try {
    const prevIds = new Set(read(KEYS.notifications, []).map((n) => String(n?.id || "").trim()));
    await api.postJson("/portal/hr/contract-renewal-notices/run", {});
    const merged = await refreshNotificationsBellFromApi();
    if (Array.isArray(merged) && merged.length) {
      const brandNew = merged.filter((n) => {
        const id = String(n?.id || "").trim();
        return id && !prevIds.has(id);
      });
      if (!brandNew.length) {
        markInboxNotificationsAsToastSeen(merged.map((n) => n.id));
      }
    }
    return true;
  } catch (err) {
    try {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "Avisos de renovación contractual (segundo plano):",
          err?.message || err
        );
      }
    } catch (_e) {
      /* noop */
    }
    return false;
  }
}

export function scheduleContractRenewalNotificationCheck() {
  void refreshContractRenewalNotificationsFromServer();
}

export async function writeNotificationsAwaitServer(_deletedIds) {
  __cancelNotificationsSyncSchedule();
  return refreshNotificationsFromServer();
}

/**
 * Elimina notificaciones en PostgreSQL vía endpoint dedicado y refresca la bandeja desde el servidor.
 * Expande IDs duplicados (misma lógica que marcar leída).
 */
export async function deleteNotificationsFromServer(ids) {
  const normalized = [
    ...new Set(
      (Array.isArray(ids) ? ids : [ids])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  ];
  if (!normalized.length) return { ok: true, deleted: 0 };

  const list = read(KEYS.notifications, []);
  const targetIds = __expandNotificationReadTargetIds(normalized, list);
  const idsToDelete = targetIds.length ? targetIds : normalized;

  const api = window.AntaresApi;
  if (!api?.postJson || !portalCanRefreshFromApi()) {
    throw new Error("Sesión sin autenticación API. Vuelva a iniciar sesión para guardar en el servidor.");
  }

  __markPendingDeletion(idsToDelete);
  __removeNotificationsFromSessionCache(idsToDelete);

  __cancelNotificationsSyncSchedule();
  try {
    const res = await api.postJson("/portal/notifications/delete", { ids: idsToDelete });
    await refreshNotificationsFromServer();
    __lastNotificationsLightRefreshWallMs = Date.now();
    syncNotificationsInboxRenderSignature();
    return res;
  } catch (err) {
    for (const id of idsToDelete) __pendingDeletionIds.delete(id);
    await refreshNotificationsFromServer();
    throw err;
  }
}

/** Quita de la caché local notificaciones ajenas (p. ej. tras crear solicitud antes del filtro). */
export function reconcileNotificationsCacheForSession() {
  const user = currentUser();
  if (!user) return;
  const filtered = filterNotificationsForUser(user, read(KEYS.notifications, []));
  write(KEYS.notifications, filtered, { skipSyncSchedule: true });
}

/**
 * Fusiona bandeja del servidor con lecturas/borrados recientes en RAM.
 * Evita que un bootstrap o GET en vuelo revierta «leída» antes de que PostgreSQL responda.
 */
export function mergeNotificationsListPreserveReadAt(prevList, serverList) {
  const prev = Array.isArray(prevList) ? prevList : [];
  let server = Array.isArray(serverList) ? serverList : [];
  if (__pendingDeletionIds.size) {
    server = server.filter((n) => {
      const id = String(n?.id || "").trim();
      return id && !__pendingDeletionIds.has(id);
    });
  }
  const prevById = new Map(
    prev.map((n) => [String(n?.id || "").trim(), n]).filter(([id]) => Boolean(id))
  );
  const prevReadAtByDedupe = new Map();
  for (const p of prev) {
    if (!p || typeof p !== "object") continue;
    const pr = p.readAt ?? p.read_at;
    const prMs = __notificationReadAtEpochMs(pr);
    if (prMs <= 0) continue;
    const dkey = notificationDedupeKey(p);
    const existing = prevReadAtByDedupe.get(dkey);
    const existingMs = __notificationReadAtEpochMs(existing);
    if (!existing || prMs >= existingMs) prevReadAtByDedupe.set(dkey, pr);
  }
  return server.map((n) => {
    const id = String(n?.id || "").trim();
    if (!id || !n || typeof n !== "object") return n;
    const p = prevById.get(id);
    const pr = p?.readAt ?? p?.read_at;
    const sr = n.readAt ?? n.read_at;
    const prMs = __notificationReadAtEpochMs(pr);
    const srMs = __notificationReadAtEpochMs(sr);
    if (prMs <= 0 && srMs <= 0) {
      const fromDedupe = prevReadAtByDedupe.get(notificationDedupeKey(n));
      return fromDedupe ? { ...n, readAt: fromDedupe } : n;
    }
    if (prMs >= srMs && prMs > 0) return { ...n, readAt: pr || sr || null };
    if (srMs > 0) return n;
    const fromDedupe = prevReadAtByDedupe.get(notificationDedupeKey(n));
    return fromDedupe || pr ? { ...n, readAt: fromDedupe || pr } : n;
  });
}

/**
 * Persiste lecturas en PostgreSQL (endpoint dedicado) y alinea la bandeja con GET /portal/notifications.
 * @returns {Promise<boolean>}
 */
export async function persistNotificationsReadState(ids) {
  const normalized = [
    ...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))
  ];
  if (!normalized.length) return true;

  const list = read(KEYS.notifications, []);
  const targetIds = __expandNotificationReadTargetIds(normalized, list);
  if (!targetIds.length) return true;

  const ts = nowIso();
  write(
    KEYS.notifications,
    list.map((n) =>
      __notificationIdSetIncludes(targetIds, n.id) && !notificationIsRead(n) ? { ...n, readAt: ts } : n
    ),
    { skipSyncSchedule: true }
  );

  const api = window.AntaresApi;
  if (!api?.postJson || !portalCanRefreshFromApi()) {
    if (typeof window.notify === "function") {
      window.notify(
        "Sesión sin autenticación API. Vuelva a iniciar sesión para guardar en el servidor.",
        "error"
      );
    }
    return false;
  }

  try {
    __cancelNotificationsSyncSchedule();
    const res = await api.postJson("/portal/notifications/mark-read", { ids: targetIds });
    const readAt = String(res?.readAt || ts).trim() || ts;
    const merged = read(KEYS.notifications, []);
    write(
      KEYS.notifications,
      merged.map((n) =>
        __notificationIdSetIncludes(targetIds, n.id) ? { ...n, readAt: n.readAt || readAt } : n
      ),
      { skipSyncSchedule: true }
    );
    await refreshNotificationsFromServer();
    syncNotificationsInboxRenderSignature();
    refreshNotificationsUiAfterReadMutation();
    return true;
  } catch (err) {
    if (typeof window.notify === "function") {
      window.notify(
        String(err?.message || "No fue posible guardar las notificaciones leídas en el servidor."),
        "error"
      );
    }
    return false;
  }
}

export function refreshNotificationsUiAfterReadMutation() {
  updateNotificationBadge();
  if (state.currentView !== "notifications") return;
  state.__skipModuleAnimationsOnce = true;
  if (typeof window.renderPortalView === "function") {
    window.renderPortalView();
  } else {
    window.scheduleRenderPortalView?.();
  }
}

/** Evita repintar la bandeja (y re-disparar micro-animaciones) si el poll no cambió el inbox. */
let __lastNotificationsInboxRenderSig = "";

export function notificationsInboxRenderSignature(list) {
  const rows = Array.isArray(list) ? list : [];
  return rows
    .map((n) => {
      const id = String(n?.id || "").trim();
      if (!id) return "";
      const readMs = __notificationReadAtEpochMs(n?.readAt ?? n?.read_at);
      return `${id}:${readMs > 0 ? readMs : 0}`;
    })
    .filter(Boolean)
    .sort()
    .join("|");
}

export function syncNotificationsInboxRenderSignature() {
  __lastNotificationsInboxRenderSig = notificationsInboxRenderSignature(getCurrentNotifications());
}

export function scheduleNotificationsViewRenderIfChanged() {
  if (state.currentView !== "notifications") return;
  const sig = notificationsInboxRenderSignature(getCurrentNotifications());
  if (sig === __lastNotificationsInboxRenderSig) return;
  __lastNotificationsInboxRenderSig = sig;
  state.__skipModuleAnimationsOnce = true;
  window.scheduleRenderPortalView();
}

let __notificationsPollHandle = null;
let __lastSeenNotificationIds = null;
/** Última vez que el poll arrastró bootstrap para traer notificaciones del servidor (otros usuarios). */
let __lastNotificationsSilentBootstrapWallMs = 0;

export function stopNotificationsPolling() {
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", __onNotificationsVisibilityChange);
  }
  if (__notificationsPollHandle != null) {
    clearInterval(__notificationsPollHandle);
    __notificationsPollHandle = null;
  }
  __lastSeenNotificationIds = null;
}

function __notificationsPollIntervalMs() {
  return typeof document !== "undefined" && document.hidden ? 50000 : 8000;
}

function __onNotificationsVisibilityChange() {
  if (__notificationsPollHandle == null) return;
  clearInterval(__notificationsPollHandle);
  __notificationsPollHandle = null;
  __notificationsPollHandle = setInterval(__tickNotificationsPoll, __notificationsPollIntervalMs());
}

/**
 * Ejecuta una rutina automática del sistema (auto-aprobación, cierres por
 * timer, etc.) y marca como "ya vistas" cualquier notificación que esa
 * rutina haya generado, para que el poll de la bandeja NO las re-toaste.
 *
 * Motivación: el usuario reportó que al entrar al módulo de Solicitudes
 * salían múltiples toasts de "Solicitud aprobada automáticamente"
 * cada vez que navegaba, porque el render dispara `updateAutoApprove()`
 * y el siguiente tick del poll las leía como "nuevas". El cambio ya queda
 * reflejado en el badge de la campana y en la lista de notificaciones,
 * por lo que un toast intrusivo por cada navegación es ruido.
 */
export function runAsSilentSystemNotifications(callback) {
  let result;
  try {
    const before = new Set(read(KEYS.notifications, []).map((n) => n.id));
    result = typeof callback === "function" ? callback() : undefined;
    const after = read(KEYS.notifications, []);
    const newIds = after.filter((n) => !before.has(n.id)).map((n) => n.id);
    if (newIds.length) {
      if (!__lastSeenNotificationIds) {
        markInboxNotificationsAsToastSeen(after.map((m) => m.id));
      } else {
        markInboxNotificationsAsToastSeen(newIds);
      }
      try { updateNotificationBadge(); } catch (_e) {}
    }
  } catch (_err) {
    /** Si la captura de IDs falla, no bloqueamos la rutina del sistema. */
    if (typeof callback === "function" && result === undefined) {
      try { result = callback(); } catch (_e) {}
    }
  }
  return Promise.resolve(result);
}

/** Mínimo entre refrescos LIGEROS de la campana (GET /portal/notifications, sin re-descargar todo). */
let __lastNotificationsLightRefreshWallMs = 0;

/** Refresca solo la bandeja de notificaciones con un endpoint liviano (sin re-descargar todo). */
async function __refreshNotificationsBellIfStale() {
  if (!portalCanRefreshFromApi()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  const now = Date.now();
  if (now - __lastNotificationsLightRefreshWallMs < NOTIF_LIGHT_REFRESH_MIN_MS) return;
  __lastNotificationsLightRefreshWallMs = now;
  try {
    await refreshNotificationsFromServer();
    if (!getSession()) return;
    scheduleNotificationsViewRenderIfChanged();
  } catch (_e) {
    /* noop: la campana se reintenta en el próximo tick */
  }
}

/** Bootstrap completo en segundo plano (datos operativos) con baja frecuencia. */
function __silentFullBootstrapIfStale() {
  if (!portalCanRefreshFromApi()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  /** Con snapshot reciente el poll no debe re-descargar todo el portal cada minuto. */
  if (portalSnapshotIsFresh()) return;
  const now = Date.now();
  if (now - __lastNotificationsSilentBootstrapWallMs < NOTIF_SILENT_BOOTSTRAP_MIN_MS) return;
  __lastNotificationsSilentBootstrapWallMs = now;
  void applyPortalBootstrapFromApi({ skipSecondaryHydration: true }).then((ok) => {
    if (!ok || !getSession()) return;
    try {
      syncSessionProfileSnapshotFromCache();
      reconcileNotificationsCacheForSession();
      updateNotificationBadge();
      if (state.currentView === "notifications") scheduleNotificationsViewRenderIfChanged();
    } catch (_e) {
      /* noop */
    }
  });
}

function __tickNotificationsPoll() {
  const user = currentUser();
  if (!user) return;
  void __refreshNotificationsBellIfStale();
  __silentFullBootstrapIfStale();
  const current = getCurrentNotifications();
  const seen = __lastSeenNotificationIds || new Set();
  /** Solo avisar en toast/timbre las notificaciones nuevas dirigidas al usuario de la sesión. */
  const suppressUntil = Number(state.portalSuppressSelfPollToastUntil || 0);
  const now = Date.now();
  const selfNew = current.filter(
    (n) => !seen.has(n.id) && !__notificationAlreadySurfacedToUser(n) && notificationTargetsUser(n, user)
  );
  const toToast = [];
  let toSound = false;
  /**
   * Solo se notifica en toast lo que ocurre en tiempo real (≤ 30s). Las notificaciones
   * viejas que se materializan ahora — porque vinieron del servidor en un bootstrap
   * tardío, porque la auto-aprobación cruzó su umbral en una sesión anterior o porque
   * el usuario nunca leyó la campana — siguen visibles en la bandeja, pero no se
   * vuelven a "tirar a la cara" cada vez que entra a un módulo.
   */
  const FRESH_TOAST_WINDOW_MS = 30_000;
  for (const n of selfNew) {
    const ageMs = __notificationPollAgeMs(n, now);
    const skipDuplicateExplicitSuccess = suppressUntil > now && ageMs < 6500;
    if (skipDuplicateExplicitSuccess) continue;
    if (!__inboxNotificationIsFreshForPoll(n, now, FRESH_TOAST_WINDOW_MS)) continue;
    toSound = true;
    toToast.push(n);
  }
  if (toSound) playInboxNotificationSound();
  if (toToast.length && isInAppNotificationAlertsEnabled()) {
    toToast.forEach((n) => {
      if (typeof notify === "function") {
        const message = `${n.title}${n.body ? " — " + sanitizeNotificationBodyForDisplay(n.body) : ""}`;
        window.notify(message, "info");
      }
    });
    markInboxNotificationsAsToastSeen(toToast.map((n) => n.id));
  }
  if (selfNew.length) {
    markInboxNotificationsAsToastSeen(selfNew.map((n) => n.id));
    __lastSeenNotificationIds = new Set(current.map((n) => n.id));
    updateNotificationBadge();
    if (state.currentView === "notifications") {
      scheduleNotificationsViewRenderIfChanged();
    }
  } else {
    updateNotificationBadge();
  }
}

export function getCurrentNotifications() {
  const user = currentUser();
  if (!user) return [];
  return filterNotificationsForUser(user, read(KEYS.notifications, []));
}

export function updateNotificationBadge() {
  const link = document.querySelector('.side-link[data-view="notifications"]');
  if (!link) return;
  const list = getCurrentNotifications();
  const unread = list.filter((n) => !notificationIsRead(n)).length;
  let badge = link.querySelector(".side-link-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "side-link-badge";
    badge.setAttribute("aria-hidden", "true");
    link.appendChild(badge);
  }
  if (unread > 0) {
    badge.hidden = false;
    badge.textContent = unread > 99 ? "99+" : String(unread);
  } else {
    badge.hidden = true;
    badge.textContent = "";
  }
  syncNotificationSoundMutedUi();
}

export function startNotificationsPolling() {
  if (__notificationsPollHandle != null) return;
  ensureInboxNotificationAudioUnlocked();
  const user = currentUser();
  __lastSeenNotificationIds = new Set(getCurrentNotifications().map((n) => n.id));
  if (user?.id) {
    for (const id of __loadPersistedToastSeenIds(user.id)) {
      __lastSeenNotificationIds.add(id);
    }
  }
  __lastNotificationsSilentBootstrapWallMs = Date.now();
  __notificationsPollHandle = setInterval(__tickNotificationsPoll, __notificationsPollIntervalMs());
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", __onNotificationsVisibilityChange);
  }
}

/** Filtros de la bandeja (UI). */
export const NOTIFICATION_UI_FILTERS = Object.freeze({
  ALL: "all",
  UNREAD: "unread",
  REQUEST: "request",
  AUTHORIZATION: "authorization",
  HR: "hr",
  SYSTEM: "system"
});

const __CATEGORY_LABELS = {
  request: "Solicitud",
  authorization: "Autorización",
  hr: "RRHH",
  system: "Sistema"
};

/** Categoría operativa: campo explícito del servidor o inferencia por título/cuerpo. */
export function resolveNotificationCategory(n) {
  const explicit = String(n?.category ?? n?.categoria ?? "").trim().toLowerCase();
  if (explicit && __CATEGORY_LABELS[explicit]) return explicit;
  const blob = `${String(n?.title ?? "")} ${String(n?.body ?? "")}`.toLowerCase();
  if (blob.includes("solicitud")) return "request";
  if (blob.includes("autoriza") || blob.includes("aprobación") || blob.includes("aprobacion")) return "authorization";
  if (
    blob.includes("contrato") ||
    blob.includes("nómina") ||
    blob.includes("nomina") ||
    blob.includes("renovación") ||
    blob.includes("renovacion") ||
    blob.includes("empleado")
  ) {
    return "hr";
  }
  return "system";
}

export function notificationCategoryLabel(category) {
  return __CATEGORY_LABELS[String(category || "").trim().toLowerCase()] || "Sistema";
}

/** Quita tokens internos de deduplicación u otros metadatos técnicos del cuerpo visible. */
export function sanitizeNotificationBodyForDisplay(body) {
  return String(body ?? "")
    .replace(/\[ref:[^\]]+\]\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Enlace hash del portal si existe metadata o se puede inferir la categoría. */
export function resolveNotificationDeepLink(n) {
  const explicit = String(n?.deepLink ?? n?.deep_link ?? "").trim();
  if (explicit.startsWith("#portal/")) return explicit;
  const entityType = String(n?.entityType ?? n?.entity_type ?? "").trim().toLowerCase();
  if (entityType === "request" || entityType === "solicitud") return "#portal/requests";
  if (entityType === "trip" || entityType === "viaje") return "#portal/transport-trips";
  if (entityType === "authorization" || entityType === "aprobacion") return "#portal/authorizations";
  if (
    entityType === "employee" ||
    entityType === "payroll" ||
    entityType === "contract_notice"
  ) {
    return "#portal/payroll";
  }
  const cat = resolveNotificationCategory(n);
  if (cat === "request") return "#portal/requests";
  if (cat === "authorization") return "#portal/authorizations";
  if (cat === "hr") return "#portal/payroll";
  return "";
}

export function filterNotificationsByUiFilter(list, filter, isReadFn = notificationIsRead) {
  const rows = Array.isArray(list) ? list : [];
  const key = String(filter || NOTIFICATION_UI_FILTERS.ALL).trim().toLowerCase();
  if (key === NOTIFICATION_UI_FILTERS.UNREAD) {
    return rows.filter((n) => !isReadFn(n));
  }
  if (key === NOTIFICATION_UI_FILTERS.ALL) return rows;
  return rows.filter((n) => resolveNotificationCategory(n) === key);
}

function __notificationDayKey(isoValue) {
  const raw = String(isoValue ?? "").trim();
  if (!raw) return "";
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

/** Agrupa notificaciones en Hoy / Ayer / Esta semana / Anteriores (zona Colombia). */
export function groupNotificationsByDateBucket(list, nowMs = Date.now()) {
  const rows = Array.isArray(list) ? [...list] : [];
  const todayKey = new Date(nowMs).toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const yesterdayMs = nowMs - 86_400_000;
  const yesterdayKey = new Date(yesterdayMs).toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const weekStartMs = nowMs - 6 * 86_400_000;
  const buckets = [
    { id: "today", label: "Hoy", items: [] },
    { id: "yesterday", label: "Ayer", items: [] },
    { id: "week", label: "Esta semana", items: [] },
    { id: "older", label: "Anteriores", items: [] }
  ];
  const map = Object.fromEntries(buckets.map((b) => [b.id, b]));
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  for (const n of rows) {
    const dayKey = __notificationDayKey(n?.createdAt);
    const createdMs = new Date(n?.createdAt ?? 0).getTime();
    if (dayKey === todayKey) map.today.items.push(n);
    else if (dayKey === yesterdayKey) map.yesterday.items.push(n);
    else if (Number.isFinite(createdMs) && createdMs >= weekStartMs) map.week.items.push(n);
    else map.older.items.push(n);
  }
  return buckets.filter((b) => b.items.length > 0);
}

/** Sidebar: campana única para activar o desactivar notificaciones. */
export function bindNotificationSidebarPrefs() {
  if (typeof document === "undefined") return;
  const group = document.querySelector(".sidebar-notif-group");
  if (!group || group.dataset.notifPrefsBound === "1") return;
  group.dataset.notifPrefsBound = "1";
  group.querySelectorAll("[data-notif-pref]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const which = btn.getAttribute("data-notif-pref") || "";
      if (which === "master") toggleNotificationsEnabled();
      syncNotificationPrefsSidebarUi();
      if (typeof window.updateNotificationBadge === "function") window.updateNotificationBadge();
    });
  });
}
