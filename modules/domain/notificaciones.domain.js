/**
 * Dominio de notificaciones del portal: preferencias y audio, bandeja / lectura, polling de campana.
 * Extraído desde modules/core/portal-runtime.js (FASE 7).
 *
 * Persistencia: `read` / `write` / `writeAwaitServer` desde `../core/data-io.js` (mismo contrato
 * que la capa `persistence.js` del navegador vía `window.AntaresPersistence`).
 */
import {
  KEYS,
  NOTIF_LIGHT_REFRESH_MIN_MS,
  NOTIF_SILENT_BOOTSTRAP_MIN_MS,
  PERMISSIONS
} from "../core/config.js";
import { read, write, writeAwaitServer } from "../core/data-io.js";
import { state } from "../core/store.js";
import { nowIso } from "../core/utils.js";
import { currentUser, getSession, isAdminActor, hasPermission } from "../core/auth.js";
import {
  applyPortalBootstrapFromApi,
  portalCanRefreshFromApi,
  portalSnapshotIsFresh,
  savePortalSnapshotAfterBootstrap,
  syncSessionProfileSnapshotFromCache
} from "../core/bootstrap.js";

/**
 * Preferencias de notificaciones: única persistencia en PostgreSQL (`preferencias_notificacion_usuario`),
 * vía GET /portal/bootstrap (`notificationPreferences`) y POST /portal/notification-preferences.
 * En memoria solo `state.notificationPreferences` (hasta que llegue el bootstrap).
 */
let __notifInboxAudioCtx = null;
let __notifInboxAudioUnlockInstalled = false;

/** Edad de una notificación respecto al reloj local; 0 si no hay fecha fiable (se trata como recién vista). */
function __notificationPollAgeMs(n, nowMs) {
  const raw = n?.createdAt;
  if (raw === undefined || raw === null || String(raw).trim() === "") return 0;
  const createdTs = new Date(raw).getTime();
  if (!Number.isFinite(createdTs)) return 0;
  return nowMs - createdTs;
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
  if (!String(api.getAccessToken?.() || "").trim()) return null;
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
  window.notify(
    next
      ? "Avisos emergentes activados. Verás mensajes al instante cuando lleguen avisos nuevos."
      : "Avisos emergentes desactivados: sin ventanas por avisos nuevos ni notificaciones nuevas del servidor. La bandeja conserva el historial ya recibido.",
    "info",
    3800
  );
}

export function syncNotificationPrefsSidebarUi() {
  const link = document.querySelector('.side-link[data-view="notifications"]');
  if (!link) return;
  const soundOff = !isSonidoNotificacionesHabilitado();
  const alertsOff = !isInAppNotificationAlertsEnabled();
  link.classList.toggle("side-link--notif-sound-muted", soundOff);
  link.classList.toggle("side-link--notif-alerts-off", alertsOff);
  const soundPill = link.querySelector(".side-link-notif-sound-pill");
  if (soundPill) {
    soundPill.textContent = soundOff ? "Sin timbre" : "Timbre";
    soundPill.title = soundOff
      ? "Clic para volver a reproducir el timbre al llegar avisos nuevos"
      : "Clic para silenciar solo el timbre (la bandeja y los avisos en pantalla siguen igual)";
  }
  const alertsPill = link.querySelector(".side-link-notif-alerts-pill");
  if (alertsPill) {
    alertsPill.textContent = alertsOff ? "Sin avisos" : "Avisos";
    alertsPill.title = alertsOff
      ? "Clic para volver a recibir avisos emergentes y notificaciones del servidor"
      : "Clic para pausar avisos emergentes y dejar de recibir notificaciones nuevas en el servidor";
  }
  const control = link.querySelector(".side-link-notif-control");
  if (control) {
    let aria = "";
    if (alertsOff && soundOff) {
      aria =
        "Preferencias: avisos emergentes desactivados y timbre silenciado. Use «Avisos» o «Timbre» para activar cada uno.";
    } else if (alertsOff) {
      aria = "Avisos emergentes desactivados (sin toasts ni notificaciones nuevas en servidor). «Timbre»: solo el audio.";
    } else if (soundOff) {
      aria = "Timbre silenciado; los avisos emergentes siguen activos si no los desactivó.";
    } else {
      aria = "«Timbre» controla el audio; «Avisos» controla ventanas emergentes y notificaciones nuevas del servidor.";
    }
    control.setAttribute("aria-label", aria);
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

/** Solo el rol administrador ve la bandeja global; el resto solo las propias. */
export function canViewAllNotifications(user) {
  return isAdminActor(user);
}

function notificationTargetsUser(n, user) {
  if (!user) return false;
  if (canViewAllNotifications(user)) return true;
  const uid = String(user.id ?? "").trim();
  if (!uid) return false;
  return getNotificationRecipientId(n) === uid;
}

export function filterNotificationsForUser(user, list) {
  const rows = Array.isArray(list) ? list : [];
  if (!user) return [];
  if (canViewAllNotifications(user)) return rows;
  return rows.filter((n) => notificationTargetsUser(n, user));
}

let __contractRenewalNoticeCheckWallMs = 0;

/** Refresco liviano de la bandeja (sin bootstrap completo). */
async function refreshNotificationsBellFromApi() {
  const api = window.AntaresApi;
  if (!api?.getJson || !portalCanRefreshFromApi()) return false;
  try {
    const res = await api.getJson("/portal/notifications");
    const raw = Array.isArray(res?.notifications) ? res.notifications : [];
    const actor = currentUser();
    const filtered =
      actor && !canViewAllNotifications(actor) ? filterNotificationsForUser(actor, raw) : raw;
    const prev = read(KEYS.notifications, []);
    const merged = mergeNotificationsListPreserveReadAt(prev, filtered);
    write(KEYS.notifications, merged, { skipSyncSchedule: true });
    reconcileNotificationsCacheForSession();
    updateNotificationBadge();
    return true;
  } catch (_e) {
    return false;
  }
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
    await api.postJson("/portal/hr/contract-renewal-notices/run", {});
    await refreshNotificationsBellFromApi();
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

export async function writeNotificationsAwaitServer(deletedIds) {
  const user = currentUser();
  const all = read(KEYS.notifications, []);
  const payload =
    user && !canViewAllNotifications(user) ? filterNotificationsForUser(user, all) : all;
  const normalizedDeleted = [
    ...new Set(
      (Array.isArray(deletedIds) ? deletedIds : [deletedIds])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  ];
  await writeAwaitServer(KEYS.notifications, payload, {
    deletedIds: normalizedDeleted.length ? normalizedDeleted : undefined
  });
  /** Parche solo notificaciones (idle): evita serializar todo el portal en cada lectura/borrado. */
  savePortalSnapshotAfterBootstrap({ dirtyKeys: [KEYS.notifications] });
}

/** Quita de la caché local notificaciones ajenas (p. ej. tras crear solicitud antes del filtro). */
export function reconcileNotificationsCacheForSession() {
  const user = currentUser();
  if (!user || canViewAllNotifications(user)) return;
  const filtered = filterNotificationsForUser(user, read(KEYS.notifications, []));
  write(KEYS.notifications, filtered);
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

/**
 * GET /portal/notifications y el bootstrap pueden llegar antes de que sync-key persista `readAt`.
 * Fusionar evita que la caché (y un flush posterior) reviertan «leída» en UI y en PostgreSQL.
 */
export function mergeNotificationsListPreserveReadAt(prevList, serverList) {
  const prev = Array.isArray(prevList) ? prevList : [];
  const server = Array.isArray(serverList) ? serverList : [];
  const prevById = new Map(
    prev.map((n) => [String(n?.id || "").trim(), n]).filter(([id]) => Boolean(id))
  );
  return server.map((n) => {
    const id = String(n?.id || "").trim();
    if (!id || !n || typeof n !== "object") return n;
    const p = prevById.get(id);
    if (!p) return n;
    const pr = p.readAt ?? p.read_at;
    const sr = n.readAt ?? n.read_at;
    const prMs = __notificationReadAtEpochMs(pr);
    const srMs = __notificationReadAtEpochMs(sr);
    if (prMs <= 0 && srMs <= 0) return n;
    if (prMs >= srMs && prMs > 0) return { ...n, readAt: pr || sr || null };
    if (srMs > 0) return n;
    return pr ? { ...n, readAt: pr } : n;
  });
}

/**
 * Persiste lecturas en PostgreSQL (endpoint dedicado) y alinea la caché local + snapshot de F5.
 * @returns {Promise<boolean>}
 */
export async function persistNotificationsReadState(ids) {
  const normalized = [
    ...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))
  ];
  if (!normalized.length) return true;
  const visibleIds = new Set(getCurrentNotifications().map((n) => n.id));
  const targetIds = normalized.filter((id) => visibleIds.has(id));
  if (!targetIds.length) return true;

  const ts = nowIso();
  const list = read(KEYS.notifications, []);
  write(
    KEYS.notifications,
    list.map((n) => (targetIds.includes(n.id) && !notificationIsRead(n) ? { ...n, readAt: ts } : n)),
    { skipSyncSchedule: true }
  );

  const api = window.AntaresApi;
  if (api?.postJson && portalCanRefreshFromApi()) {
    try {
      const res = await api.postJson("/portal/notifications/mark-read", { ids: targetIds });
      const readAt = String(res?.readAt || ts).trim() || ts;
      const merged = read(KEYS.notifications, []);
      write(
        KEYS.notifications,
        merged.map((n) => (targetIds.includes(n.id) ? { ...n, readAt: n.readAt || readAt } : n)),
        { skipSyncSchedule: true }
      );
      savePortalSnapshotAfterBootstrap({ dirtyKeys: [KEYS.notifications] });
      syncNotificationsInboxRenderSignature();
      return true;
    } catch (_apiErr) {
      try {
        await writeNotificationsAwaitServer();
        savePortalSnapshotAfterBootstrap({ dirtyKeys: [KEYS.notifications] });
        syncNotificationsInboxRenderSignature();
        return true;
      } catch (err) {
        if (typeof notify === "function") {
          window.notify(
            String(err?.message || "No fue posible guardar las notificaciones leídas en el servidor."),
            "error"
          );
        }
        return false;
      }
    }
  }

  try {
    await writeNotificationsAwaitServer();
    savePortalSnapshotAfterBootstrap({ dirtyKeys: [KEYS.notifications] });
    syncNotificationsInboxRenderSignature();
    return true;
  } catch (err) {
    if (typeof notify === "function") {
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
  window.scheduleRenderPortalView();
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
    let added = false;
    for (const n of after) {
      if (before.has(n.id)) continue;
      if (!__lastSeenNotificationIds) {
        __lastSeenNotificationIds = new Set(after.map((m) => m.id));
        added = true;
        break;
      }
      __lastSeenNotificationIds.add(n.id);
      added = true;
    }
    if (added) {
      try { updateNotificationBadge(); } catch (_e) {}
    }
  } catch (_err) {
    /** Si la captura de IDs falla, no bloqueamos la rutina del sistema. */
    if (typeof callback === "function" && result === undefined) {
      try { result = callback(); } catch (_e) {}
    }
  }
  return result;
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
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return;
  try {
    const res = await api.getJson("/portal/notifications");
    const raw = Array.isArray(res?.notifications) ? res.notifications : [];
    const actor = currentUser();
    const filtered =
      actor && !canViewAllNotifications(actor) ? filterNotificationsForUser(actor, raw) : raw;
    const prev = read(KEYS.notifications, []);
    const merged = mergeNotificationsListPreserveReadAt(prev, filtered);
    write(KEYS.notifications, merged, { skipSyncSchedule: true });
    if (!getSession()) return;
    reconcileNotificationsCacheForSession();
    updateNotificationBadge();
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
  /**
   * Solo avisar en toast las notificaciones dirigidas al usuario de la sesión. Los admins ven en
   * la bandeja las de otros (p. ej. "Cuenta aprobada" para un cliente), pero no deben duplicar el
   * mensaje explícito que ya muestra la acción (Aprobar usuario, etc.).
   */
  const suppressUntil = Number(state.portalSuppressSelfPollToastUntil || 0);
  const now = Date.now();
  const selfNew = current.filter(
    (n) => !seen.has(n.id) && getNotificationRecipientId(n) === String(user.id || "")
  );
  const toToast = [];
  /** Timbre ante cualquier fila nueva para el usuario en este tick (desacoplado de la ventana de toast). */
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
    toSound = true;
    if (__inboxNotificationIsFreshForPoll(n, now, FRESH_TOAST_WINDOW_MS)) {
      toToast.push(n);
    }
  }
  if (toSound) playInboxNotificationSound();
  if (toToast.length && isInAppNotificationAlertsEnabled()) {
    toToast.forEach((n) => {
      if (typeof notify === "function") {
        const message = `${n.title}${n.body ? " — " + n.body : ""}`;
        window.notify(message, "info");
      }
    });
  }
  if (selfNew.length) {
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
  if (unread > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "side-link-badge";
      link.appendChild(badge);
    }
    badge.textContent = unread > 99 ? "99+" : String(unread);
  } else if (badge) {
    badge.remove();
  }
  syncNotificationSoundMutedUi();
}

export function startNotificationsPolling() {
  if (__notificationsPollHandle != null) return;
  ensureInboxNotificationAudioUnlocked();
  __lastSeenNotificationIds = new Set(getCurrentNotifications().map((n) => n.id));
  __lastNotificationsSilentBootstrapWallMs = Date.now();
  __notificationsPollHandle = setInterval(__tickNotificationsPoll, __notificationsPollIntervalMs());
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", __onNotificationsVisibilityChange);
  }
}
