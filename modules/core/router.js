/**
 * Enrutamiento del portal (hash, vista actual) y orquestación del render central.
 * Los bindings DOM pesados viven en `modules/core/events.js` (registrado vía `registerBindEventsCallback`).
 */
import { PERMISSIONS, KEYS } from "./config.js";
import { readArray } from "./data-io.js";
import { currentUser, hasPermission, isViewAllowedForUser, canApprovePortalRegistration } from "./auth.js";
import { state, nodes } from "./store.js";
import { devError } from "./utils.js";

const W = /** @type {Record<string, unknown>} */ (typeof window !== "undefined" ? window : {});

function callApp(name, ...args) {
  const fn = W[name];
  return typeof fn === "function" ? fn(...args) : undefined;
}

/** Fallbacks si aún no cargaron `modules/portal/core/*.js` */
const PortalArch =
  W.PortalArchitecture ||
  {
    isKnownView: (view) => Boolean(W.VIEW_PERMISSIONS && W.VIEW_PERMISSIONS[String(view || "")]),
    shouldUseShell: () => true,
    getTitle: (view) => String(view || "Dashboard"),
    getLayoutPlan: () => null,
    isAllowedByRole: () => true,
    resolveContent: ({ accessDeniedFactory }) => accessDeniedFactory()
  };

const PortalRouterCore =
  W.PortalCoreRouter || {
    getViewFromHash: ({ hash, isKnownView }) => {
      const raw = String(hash || "");
      if (!raw.startsWith("#portal/")) return "";
      const view = raw.slice("#portal/".length).trim();
      return isKnownView(view) ? view : "";
    },
    syncHash: ({ view, isKnownView, fallbackView = "dashboard" }) => {
      const safeView = isKnownView(view) ? view : fallbackView;
      const nextHash = `#portal/${safeView}`;
      if (typeof window !== "undefined" && window.location.hash !== nextHash) {
        history.replaceState(null, "", nextHash);
      }
    },
    enforceViewFromUrl: ({
      state: st,
      user,
      getViewFromHashFn,
      syncHashFn,
      isViewAllowed,
      fallbackView = "dashboard",
      onUnauthorized
    }) => {
      if (!st?.session || !user) return;
      const candidate = getViewFromHashFn();
      if (!candidate) {
        syncHashFn(st.currentView || fallbackView);
        return;
      }
      if (!isViewAllowed(user, candidate)) {
        st.currentView = fallbackView;
        syncHashFn(fallbackView);
        if (typeof onUnauthorized === "function") onUnauthorized(candidate);
        return;
      }
      st.currentView = candidate;
    },
    activateSideLinks: (sideLinks, view) =>
      (sideLinks || []).forEach((link) => link.classList.toggle("active", link.dataset.view === view))
  };

const PortalRendererCore =
  W.PortalCoreRenderer || {
    resolveViewContent: ({ user, view, isViewAllowed, resolveContent, accessDeniedFactory }) =>
      !isViewAllowed(user, view) ? accessDeniedFactory() : resolveContent(user, view),
    safeResolve: ({ view, resolver, onError, fallbackFactory }) => {
      try {
        return resolver();
      } catch (error) {
        if (typeof onError === "function") onError({ view, error });
        return fallbackFactory();
      }
    },
    applyManualLayout: ({ viewRoot, plan }) => {
      if (!viewRoot || !plan) return;
      plan.forEach(({ container, order }) => {
        const nodesToOrder = [...viewRoot.querySelectorAll(container)];
        nodesToOrder.forEach((containerNode) => {
          const children = [...containerNode.children];
          if (children.length < 2 || !Array.isArray(order) || !order.length) return;
          const ordered = [];
          const used = new Set();
          order.forEach((selector) => {
            children.forEach((child) => {
              if (used.has(child) || !child.matches(selector)) return;
              ordered.push(child);
              used.add(child);
            });
          });
          children.forEach((child) => {
            if (used.has(child)) return;
            ordered.push(child);
          });
          const changed = ordered.some((child, idx) => child !== children[idx]);
          if (changed) ordered.forEach((child) => containerNode.appendChild(child));
        });
      });
    }
  };

let _bindEventsCallback = () => {};

export function registerBindEventsCallback(fn) {
  _bindEventsCallback = typeof fn === "function" ? fn : () => {};
}

export function renderFromModule(moduleName, exportName, ...args) {
  const moduleFn = W.AppModules?.[moduleName]?.[exportName];
  if (typeof moduleFn === "function") return moduleFn(...args);
  const legacyFn = W.AppLegacyViews?.[exportName];
  if (typeof legacyFn === "function") return legacyFn(...args);
  return "";
}

export function accessDeniedModuleCard() {
  if (typeof W.pcardWrap === "function" && typeof W.emptyState === "function") {
    return W.pcardWrap("shield", "Acceso restringido", null, W.emptyState("No tienes autorizacion para esta vista."));
  }
  return '<p class="muted">Acceso restringido</p>';
}

export function renderModuleShell(view, _title, bodyHtml) {
  if (!PortalArch.shouldUseShell(view)) return bodyHtml;
  return `<section class="module-shell" data-module-view="${view}">
    <div class="module-shell-body">${bodyHtml}</div>
  </section>`;
}

export function getPortalViewContent(user, view) {
  return PortalArch.resolveContent({
    user,
    view,
    renderFromModule,
    accessDeniedFactory: accessDeniedModuleCard
  });
}

export function viewFromPortalHash() {
  const h = String(window.location.hash || "").split("?")[0].replace(/\/+$/, "");
  if (h === "#portal/transport-requests") {
    history.replaceState(null, "", "#portal/authorizations");
    return PortalArch.isKnownView("authorizations") ? "authorizations" : "";
  }
  return PortalRouterCore.getViewFromHash({
    hash: window.location.hash,
    isKnownView: PortalArch.isKnownView
  });
}

export function syncPortalHash(view) {
  PortalRouterCore.syncHash({
    view,
    isKnownView: PortalArch.isKnownView,
    fallbackView: "dashboard"
  });
}

export function setView(view) {
  const user = currentUser();
  if (!user) return;
  if (!isViewAllowedForUser(user, view)) {
    alert("No tienes permisos para acceder a este módulo.");
    return;
  }
  state.currentView = view;
  syncPortalHash(view);
  PortalRouterCore.activateSideLinks(nodes.sideLinks, view);
  renderPortalView();
}

export function syncPublicNavDrawer() {
  const mainNav = document.getElementById("main-nav");
  const hamburgerBtn = document.getElementById("hamburger-btn");
  if (!mainNav || !hamburgerBtn) return;
  const open = mainNav.classList.contains("nav-open");
  document.body.classList.toggle("public-nav-open", open);
  hamburgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
  const lang = state.publicLang === "en" ? "en" : "es";
  hamburgerBtn.setAttribute(
    "aria-label",
    open
      ? lang === "en"
        ? "Close navigation menu"
        : "Cerrar menu de navegacion"
      : lang === "en"
        ? "Open navigation menu"
        : "Abrir menu de navegacion"
  );
}

export function closePublicNavDrawer() {
  const mainNav = document.getElementById("main-nav");
  if (!mainNav?.classList.contains("nav-open")) return;
  mainNav.classList.remove("nav-open");
  syncPublicNavDrawer();
}

export function setPortalDrawerOpen(open) {
  if (typeof document === "undefined") return;
  const on = Boolean(open);
  document.body.classList.toggle("portal-drawer-open", on);
  const btn = document.getElementById("portal-menu-btn");
  const bd = document.getElementById("portal-nav-backdrop");
  if (btn) {
    btn.setAttribute("aria-expanded", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Cerrar menu de modulos" : "Abrir menu de modulos");
  }
  if (bd) bd.setAttribute("aria-hidden", on ? "false" : "true");
}

/** Los módulos del portal registran `window.__portalModuleAfterRender[viewId]`. */
export function invokePortalViewAfterRenderHook(view) {
  try {
    const fn = W.__portalModuleAfterRender?.[String(view || "")];
    if (typeof fn === "function") fn();
  } catch (_e) {
    /* noop */
  }
}

let __schedulePortalViewMicrotask = null;
let __schedulePortalViewWanted = false;

export function scheduleRenderPortalView() {
  __schedulePortalViewWanted = true;
  if (__schedulePortalViewMicrotask != null) return;
  __schedulePortalViewMicrotask = queueMicrotask(() => {
    __schedulePortalViewMicrotask = null;
    if (!__schedulePortalViewWanted) return;
    __schedulePortalViewWanted = false;
    renderPortalViewImpl();
  });
}

export function renderPortalViewImpl() {
  callApp("runAsSilentSystemNotifications", () => {
    callApp("updateAutoApprove");
    callApp("closeCompletedTripsAndGenerateInvoices");
    callApp("recalculateResourceAvailability");
  });
  callApp("renderKpis");

  const user = currentUser();
  const view = state.currentView;
  const prevPortalView = state.__portalPrevViewForSync;
  state.__notificationsViewStickyRender = view === "notifications" && prevPortalView === "notifications";
  state.__portalPrevViewForSync = view;

  if (view === "authorizations") {
    const canAuthSync = callApp("portalCanRefreshFromApi");
    if (prevPortalView !== "authorizations" && canAuthSync) {
      state.authorizationsSyncError = null;
      void (async () => {
        let bootstrapOk = false;
        try {
          bootstrapOk = await Promise.resolve(callApp("applyPortalBootstrapFromApi"));
        } catch (_e) {
          bootstrapOk = false;
        }
        let pendingOk = false;
        if (canApprovePortalRegistration(currentUser())) {
          try {
            pendingOk = await Promise.resolve(callApp("applyPendingUserRegistrationsFromApi"));
          } catch (_e2) {
            pendingOk = false;
          }
        }
        if (bootstrapOk) {
          state.authorizationsSyncError = null;
        } else if (canApprovePortalRegistration(currentUser()) && pendingOk) {
          state.authorizationsSyncError = {
            code: "PARCIAL",
            message:
              "El volcado general de datos no se completó; la lista de usuarios pendientes de alta sí se actualizó desde el servidor."
          };
        } else {
          state.authorizationsSyncError = {
            code: "SYNC-API",
            message:
              "No se pudo sincronizar con el servidor. Revise conexión, sesión JWT (cierre sesión y vuelva a entrar) o que su usuario sea administrador con acceso a la API."
          };
        }
        scheduleRenderPortalView();
      })();
    }
  }

  if (view === "contact-leads" && hasPermission(user, PERMISSIONS.CONTACT_B2B_VIEW)) {
    const canSync = callApp("portalCanRefreshFromApi");
    if (prevPortalView !== "contact-leads" && canSync) {
      state.contactLeadsLoading = true;
      void Promise.resolve(callApp("refreshContactB2bProspectsFromApi"))
        .catch(() => {})
        .finally(() => {
          state.contactLeadsLoading = false;
          scheduleRenderPortalView();
        });
    } else if (prevPortalView !== "contact-leads") {
      state.contactLeadsLoading = false;
    }
  }
  if (prevPortalView === "admin-users" && view !== "admin-users") {
    state.adminUsersEntryHydrating = false;
    state.adminUserSessionsHydrated = false;
  }
  if (view === "admin-users" && hasPermission(user, PERMISSIONS.USERS_MANAGE)) {
    const canSync = callApp("portalCanRefreshFromApi");
    if (prevPortalView !== "admin-users") {
      state.adminUserSessionsHydrated = false;
      if (canSync) {
        state.adminUsersEntryHydrating = true;
        void Promise.resolve(callApp("syncAdminUsersModuleOnEntry"))
          .catch(() => {})
          .finally(() => {
            callApp("finalizeAdminUsersModuleEntry");
          });
      } else {
        state.adminUsersEntryHydrating = false;
        callApp("resolveAdminUsersSectionAfterEntrySync");
      }
    }
  }
  if ((view === "hiring" || view === "payroll") && prevPortalView !== view && callApp("portalCanRefreshFromApi")) {
    void callApp("refreshPositionsCatalogFromApi");
  }
  if (view === "payroll" && hasPermission(user, PERMISSIONS.PAYROLL_MANAGE) && callApp("portalCanRefreshFromApi")) {
    const enteringPayroll = prevPortalView !== "payroll";
    const noEmployeesCached = readArray(KEYS.payrollEmployees).length === 0;
    if ((enteringPayroll || noEmployeesCached) && !state.__payrollEmployeesListHydrating) {
      state.__payrollEmployeesListHydrating = true;
      void (W.PayrollEmployeeListSync?.refreshFromApi?.() || Promise.resolve(false))
        .then((ok) => {
          if (ok) scheduleRenderPortalView();
        })
        .finally(() => {
          state.__payrollEmployeesListHydrating = false;
        });
    }
  }
  if (view === "profile") {
    const cur = currentUser();
    const fromPayroll = callApp("enrichPortalUserFromPayrollCache", cur);
    if (fromPayroll?.id && callApp("portalProfileEnrichmentChanged", cur, fromPayroll)) {
      callApp("upsertPortalUserRowIntoCache", fromPayroll);
      scheduleRenderPortalView();
    }
    const stillMissing = callApp("portalProfileEmergencyNeedsEnrichment", fromPayroll || cur);
    if (callApp("portalCanRefreshFromApi") && stillMissing && !state.__profileMeHydrating) {
      state.__profileMeHydrating = true;
      void Promise.resolve(callApp("hydrateOwnProfileFromApi"))
        .then((ok) => {
          if (ok) scheduleRenderPortalView();
        })
        .finally(() => {
          state.__profileMeHydrating = false;
        });
    }
  }
  if (view === "requests" && prevPortalView !== "requests") {
    state.deletedTransportRequestsLogMinimized = true;
  }
  if (view === "transport-trips" && prevPortalView !== "transport-trips") {
    state.deletedTransportTripsLogMinimized = true;
  }
  const viewTitle = PortalArch.getTitle(view);
  nodes.viewTitle.textContent = viewTitle;
  const content = PortalRendererCore.safeResolve({
    view,
    resolver: () =>
      PortalRendererCore.resolveViewContent({
        user,
        view,
        isViewAllowed: isViewAllowedForUser,
        resolveContent: getPortalViewContent,
        accessDeniedFactory: accessDeniedModuleCard
      }),
    onError: ({ view: failedView, error }) => {
      devError("portal-render-error", failedView, error && error.message ? String(error.message) : "");
    },
    fallbackFactory: () => {
      const wrap = W.pcardWrap;
      if (typeof wrap === "function") {
        return wrap(
          "activity",
          "Error de renderizado",
          "Se detectó un problema en el módulo",
          `<p class="muted">Recarga la vista o cambia de módulo para continuar. Si persiste, revisa consola y registra el incidente.</p>`
        );
      }
      return `<p class="muted">Error de renderizado</p>`;
    }
  });
  nodes.viewRoot.innerHTML = renderModuleShell(view, viewTitle, content);
  callApp("updatePortalDataHydratingBanner");

  callApp("applyManualModuleLayout");
  callApp("mountUniversalModuleFilters");
  _bindEventsCallback();
  invokePortalViewAfterRenderHook(view);
  if (String(view || "") !== "reports") callApp("destroyReportsCharts");
  callApp("bindExtendedViewEditHandlers");
  callApp("installVehicleCardActionsDelegation");
  callApp("installRequestDetailDelegation");
  callApp("installDriverCardActionsDelegation");
  callApp("enforceColombianFormStandards");
  callApp("wireAdminCompanyLocationSelects");
  callApp("wireAdminCompanyLogoOvals");
  callApp("applyModuleMicroAnimations");
  callApp("ensurePositionsCatalogLiveSelects");
}

export function renderPortalView() {
  renderPortalViewImpl();
}
