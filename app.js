// ============================================================
//  Antares Portal — Punto de entrada
//  Todo el código vive en modules/; este archivo solo orquesta.
// ============================================================

import "./modules/core/config.js";
import { state } from "./modules/core/store.js";
import { getSession, setAuthSuccessCallback } from "./modules/core/auth.js";
import { scheduleRenderPortalView } from "./modules/core/router.js";
import { portalRefreshAfterBootstrap } from "./modules/core/bootstrap.js";
import "./modules/core/events.js";

const {
  initPortalClientStorage,
  restorePortalSnapshotIfAvailable,
  initGlobalEvents,
  initPublicEffects,
  renderPortal,
  devWarn,
  tryApiRefreshBridge,
  notify,
  portalSnapshotIsFresh,
  startPortalBootstrapForInteractiveSession,
  ensureUsersPasswordHashing,
  syncSessionProfileSnapshotFromCache,
  runAsSilentSystemNotifications,
  updateAutoApprove,
  hasUnsavedPortalFormData,
  clearSession
} = window;

setAuthSuccessCallback(() => {
  if (typeof window.renderPortal === "function") window.renderPortal();
});

/**
 * Pintamos el portal de forma SÍNCRONA usando la sesión persistida en `localStorage` y el
 * `profileSnapshot` capturado al login. Tras F5, el usuario ve su portal en milisegundos.
 * Luego refrescamos token y bootstrap en segundo plano (`portalRefreshAfterBootstrap` en `bootstrap.js`).
 */
initPortalClientStorage();
restorePortalSnapshotIfAvailable();
initGlobalEvents();
initPublicEffects();

renderPortal();

void (async function bootApplicationFromDatabaseThenUi() {
  const hadSessionAtBoot = Boolean(getSession());
  try {
    renderPortal();
  } catch (err) {
    devWarn("renderPortal síncrono falló al arrancar:", err);
  }

  let refreshOutcome = { status: "skipped" };
  try {
    const s0 = getSession();
    if (s0?.refreshToken && window.AntaresApi?.getBase?.()) {
      refreshOutcome = (await tryApiRefreshBridge()) || { status: "skipped" };
    }
  } catch (_e) {
    refreshOutcome = { status: "network" };
  }
  if (refreshOutcome.status === "invalid") {
    try {
      clearSession();
    } catch (_e) {
      /* noop */
    }
    state.currentView = "dashboard";
    history.replaceState(null, "", window.location.pathname + window.location.search);
    try {
      renderPortal();
    } catch (_e) {
      /* noop */
    }
    try {
      notify(
        "Tu sesion en el servidor expiro (otra pestana o dispositivo refresco el token). Vuelve a iniciar sesion.",
        "info"
      );
    } catch (_e) {
      /* noop */
    }
    return;
  }
  try {
    if (portalSnapshotIsFresh()) {
      const deferBootstrapMs = 12000;
      setTimeout(() => {
        void startPortalBootstrapForInteractiveSession();
      }, deferBootstrapMs);
    } else {
      await startPortalBootstrapForInteractiveSession();
    }
  } catch (_e) {
    /* startPortalBootstrapForInteractiveSession ya tolera fallos */
  }
  try {
    await ensureUsersPasswordHashing();
  } catch (_e) {
    /* no fatal: rehidratación no debe tirar la sesión */
  }
  if (window.DomainRegistry?.list) {
    const missingDomains = window.DomainRegistry.list().filter((name) => !window.DomainRegistry.get(name));
    if (missingDomains.length) {
      devWarn("Dominios sin inicializar:", missingDomains.join(", "));
    }
  }
  if (getSession()) {
    try {
      portalRefreshAfterBootstrap();
    } catch (_e) {
      /* noop */
    }
    if (!document.body.classList.contains("portal-mode")) {
      renderPortal();
    }
  } else if (hadSessionAtBoot) {
    renderPortal();
  }
  try {
    syncSessionProfileSnapshotFromCache();
  } catch (_e) {}
  window.PortalDataLayer?.enableVisibilityRefresh?.();
  setInterval(() => {
    if (!state.session) return;
    const changed = runAsSilentSystemNotifications(() => updateAutoApprove());
    if (changed && !hasUnsavedPortalFormData()) {
      scheduleRenderPortalView();
    }
  }, 30000);
})();
