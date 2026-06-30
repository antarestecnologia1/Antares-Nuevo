// ============================================================
//  Antares Portal — Punto de entrada
//  Todo el código vive en modules/; este archivo solo orquesta.
// ============================================================

import { KEYS } from "./modules/core/config.js";
import { state } from "./modules/core/store.js";
import {
  getSession,
  setAuthSuccessCallback,
  tryApiRefreshBridge,
  clearSession,
  startSessionSecurityWatch,
  isSessionWithinIdleWindow
} from "./modules/core/auth.js";
import { renderPortal, scheduleRenderPortalView } from "./modules/core/router.js";
import {
  portalRefreshAfterBootstrap,
  portalSnapshotIsFresh,
  startPortalBootstrapForInteractiveSession,
  syncSessionProfileSnapshotFromCache
} from "./modules/core/bootstrap.js";
import { devWarn } from "./modules/core/utils.js";
import { notify } from "./modules/ui/modals.js";
import { runAsSilentSystemNotifications } from "./modules/domain/notificaciones.domain.js";
import { hasUnsavedPortalFormData } from "./modules/domain/viajes.domain.js";
import { initGlobalEvents } from "./modules/core/events.js?v=20260630-b2b-step-jump";

/**
 * Definidas en `portal-runtime.js` (módulo ES); se exponen en `window` al final de ese archivo.
 * Deben cargarse antes que este módulo en `index.html`: `portal-runtime.js` y todos los scripts
 * que registran `AppLegacyViews` / `registerLegacyPortalViews` (bloque `modules/app/*.js`).
 */
const {
  initPortalClientStorage,
  restorePortalSnapshotIfAvailable,
  initPublicEffects,
  ensureUsersPasswordHashing,
  updateAutoApprove
} = window;

function assertPortalRuntime(fnName, fn) {
  if (typeof fn === "function") return;
  const err = new Error(
    `[Antares] Falta ${fnName} en window: asegure que modules/core/portal-runtime.js se cargue antes que app.js.`
  );
  console.error(err);
  throw err;
}

assertPortalRuntime("initPortalClientStorage", initPortalClientStorage);
assertPortalRuntime("restorePortalSnapshotIfAvailable", restorePortalSnapshotIfAvailable);
assertPortalRuntime("initPublicEffects", initPublicEffects);
assertPortalRuntime("ensureUsersPasswordHashing", ensureUsersPasswordHashing);
assertPortalRuntime("updateAutoApprove", updateAutoApprove);

setAuthSuccessCallback(() => {
  renderPortal();
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
if (getSession()) {
  startSessionSecurityWatch();
}

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
    if (s0?.userId && window.AntaresApi?.getBase?.()) {
      refreshOutcome = (await tryApiRefreshBridge()) || { status: "skipped" };
    }
  } catch (_e) {
    refreshOutcome = { status: "network" };
  }
  if (refreshOutcome.status === "invalid" && !isSessionWithinIdleWindow()) {
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
  let bootstrapOk = false;
  try {
    if (portalSnapshotIsFresh()) {
      const deferBootstrapMs = 12000;
      setTimeout(() => {
        void startPortalBootstrapForInteractiveSession();
      }, deferBootstrapMs);
      bootstrapOk = Boolean(state.portalSnapshotRestored);
    } else {
      bootstrapOk = Boolean(await startPortalBootstrapForInteractiveSession());
    }
  } catch (_e) {
    /* startPortalBootstrapForInteractiveSession ya tolera fallos */
  }
  if (getSession() && window.AntaresApi?.isConfigured?.() && !bootstrapOk && !state.portalSnapshotRestored) {
    const P = window.AntaresPersistence;
    const companies = P?.read ? P.read(KEYS.companies, []) : [];
    if (!Array.isArray(companies) || companies.length === 0) {
      try {
        notify(
          "No se pudieron cargar los datos del servidor. Cierre sesión, vuelva a iniciar sesión y espere unos segundos.",
          "warning"
        );
      } catch (_notify) {
        /* noop */
      }
    }
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
    void (async () => {
      const changed = await runAsSilentSystemNotifications(() => updateAutoApprove());
      if (changed && !hasUnsavedPortalFormData()) {
        scheduleRenderPortalView();
      }
    })();
  }, 30000);
})();
