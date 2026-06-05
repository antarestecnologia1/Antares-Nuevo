/**
 * Enrutamiento del portal (hash, vista actual) y orquestación del render central.
 * Los bindings DOM pesados viven en `modules/core/events.js` (registrado vía `registerBindEventsCallback`).
 */
import { PERMISSIONS, KEYS, ROLES } from "./config.js";
import { readArray } from "./data-io.js";
import {
  currentUser,
  hasPermission,
  isViewAllowedForUser,
  canApprovePortalRegistration,
  getSession,
  setSession,
  clearSession,
  getEffectiveLastActivityAt,
  SESSION_IDLE_MS,
  getPortalUserDisplayName,
  getCompanyById,
  canAccessRRHH,
  mountSessionIdlePublicNoticeIfNeeded,
  dismissSessionIdlePublicNotice,
  announceSessionClosedByIdle
} from "./auth.js";
import { state, nodes } from "./store.js";
import { devError, devWarn } from "./utils.js";
import { notify, userMessage } from "../ui/modals.js";

const W = /** @type {Record<string, unknown>} */ (typeof window !== "undefined" ? window : {});

/** Callbacks para el ciclo de vida del portal (evita acoplar `renderPortal` a decenas de módulos). */
const _portalEventHooks = /** @type {Record<string, (() => void) | undefined>} */ ({});

/**
 * Registra un manejador para eventos disparados desde `renderPortal` / post-render.
 * @param {string} event
 * @param {() => void} fn
 */
export function onPortalEvent(event, fn) {
  if (!event || typeof fn !== "function") return;
  _portalEventHooks[String(event)] = fn;
}

function invokePortalEvent(event) {
  try {
    _portalEventHooks[String(event)]?.();
  } catch (_e) {
    /* noop */
  }
}

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

function employeeAvatarCssUrlForSidebar(av) {
  const u = String(av || "").trim();
  if (/^https?:\/\//i.test(u) || /^data:image\//i.test(u)) return u.replace(/'/g, "\\'");
  return "";
}

function formatPortalRoleLabelForSidebar(role) {
  const r = String(role || "").toLowerCase();
  if (r === ROLES.ADMIN) return "Administrador";
  if (r === ROLES.CLIENT) return "Cliente";
  if (r === ROLES.RRHH) return "Recursos humanos";
  if (r === ROLES.ADMINISTRACION) return "Administración";
  if (r === ROLES.AUXILIAR_ADMINISTRATIVO) return "Auxiliar administrativo";
  if (r === ROLES.LIDER_ADMINISTRATIVO) return "Líder administrativo";
  if (r === ROLES.LOGISTICA) return "Logística";
  return String(role || "usuario").toUpperCase();
}

/** Segunda línea del bloque de sesión en el drawer: clientes ven el nombre de la empresa, no la etiqueta «Cliente». */
function getPortalSidebarSessionSubtitle(user) {
  if (!user) return "";
  if (user.role === ROLES.CLIENT) {
    const cid = String(user.companyId || "").trim();
    const fromCatalog = cid ? getCompanyById(cid)?.name : "";
    const fromUser = String(user.company || "").trim();
    const companyName = String(fromCatalog || fromUser).trim();
    return companyName || formatPortalRoleLabelForSidebar(user.role);
  }
  return formatPortalRoleLabelForSidebar(user.role);
}

export function updatePortalSidebarSessionMeta() {
  const user = currentUser();
  const meta = nodes.sessionMeta;
  const nameEl = document.getElementById("sidebar-session-display-name");
  const avatarWrap = document.getElementById("sidebar-session-avatar-wrap");
  const avatarImg = document.getElementById("sidebar-session-avatar-img");
  const avatarInitial = document.getElementById("sidebar-session-avatar-initial");
  if (!user) {
    if (meta) meta.textContent = "";
    if (nameEl) nameEl.textContent = "Transportes Antares";
    if (avatarWrap) avatarWrap.classList.remove("has-photo");
    if (avatarImg) {
      avatarImg.removeAttribute("src");
      avatarImg.setAttribute("hidden", "");
    }
    if (avatarInitial) {
      avatarInitial.textContent = "A";
      avatarInitial.removeAttribute("hidden");
    }
    return;
  }
  const displayName = getPortalUserDisplayName(user);
  const roleLabel = getPortalSidebarSessionSubtitle(user);
  if (nameEl) nameEl.textContent = displayName;
  if (meta) meta.textContent = roleLabel;
  const avatarUrlRaw = String(user.avatarUrl || "").trim();
  const avatarCss = employeeAvatarCssUrlForSidebar(user.avatarUrl);
  if (avatarWrap && avatarImg && avatarInitial) {
    if (avatarCss && avatarUrlRaw) {
      avatarImg.src = avatarUrlRaw;
      avatarImg.removeAttribute("hidden");
      avatarInitial.setAttribute("hidden", "");
      avatarWrap.classList.add("has-photo");
    } else {
      avatarImg.removeAttribute("src");
      avatarImg.setAttribute("hidden", "");
      avatarInitial.textContent = (displayName.charAt(0) || "U").toUpperCase();
      avatarInitial.removeAttribute("hidden");
      avatarWrap.classList.remove("has-photo");
    }
  }
}

export function enforcePortalViewFromUrl(user) {
  PortalRouterCore.enforceViewFromUrl({
    state,
    user,
    getViewFromHashFn: viewFromPortalHash,
    syncHashFn: syncPortalHash,
    isViewAllowed: isViewAllowedForUser,
    fallbackView: "dashboard",
    onUnauthorized: () => alert("Ruta no autorizada. Se redirigio al dashboard.")
  });
}

function isBrowserReloadNavigation() {
  if (typeof performance === "undefined") return false;
  try {
    const entry = performance.getEntriesByType("navigation")[0];
    if (entry && entry.type === "reload") return true;
  } catch (_e) {}
  try {
    if (performance.navigation && performance.navigation.type === 1) return true;
  } catch (_e2) {}
  return false;
}

function isAntaresProductionSiteHost(hostname) {
  const h = String(hostname || "").toLowerCase();
  return h === "www.transportesantares.co" || h === "transportesantares.co";
}

/**
 * Tras F5 en un módulo del portal (#portal/...), siempre abrimos el dashboard.
 * @returns {boolean} true si se disparó `location.replace` y debe cortarse `renderPortal`.
 */
function applyPortalDashboardOnFullReload() {
  if (!isBrowserReloadNavigation()) return false;
  const raw = String(window.location.hash || "").split("?")[0];
  if (!raw.startsWith("#portal")) return false;
  state.currentView = "dashboard";
  const canonicalOrigin = "https://www.transportesantares.co";
  try {
    const u = new URL(window.location.href);
    if (isAntaresProductionSiteHost(u.hostname)) {
      if (u.protocol === "https:" && u.hostname === "www.transportesantares.co") {
        history.replaceState(null, "", `${u.pathname}${u.search}#portal/dashboard`);
        return false;
      }
      window.location.replace(`${canonicalOrigin}/#portal/dashboard`);
      return true;
    }
  } catch (_e) {}
  history.replaceState(null, "", "#portal/dashboard");
  return false;
}

export function renderPortal() {
  let session = getSession();
  if (!session) {
    invokePortalEvent("stopSessionWatch");
    invokePortalEvent("stopNotifications");
    setPortalDrawerOpen(false);
    closePublicNavDrawer();
    document.body.classList.remove("portal-mode");
    document.documentElement.classList.remove("antares-booting-portal");
    nodes.publicApp.classList.remove("hidden");
    nodes.portalApp.classList.add("hidden");
    mountSessionIdlePublicNoticeIfNeeded();
    return;
  }
  const ts = Date.now();
  if (typeof session.lastActivityAt !== "number") {
    session = {
      ...session,
      lastActivityAt: ts,
      tokenIssuedAt: typeof session.tokenIssuedAt === "number" ? session.tokenIssuedAt : ts
    };
    setSession(session);
  } else if (ts - getEffectiveLastActivityAt() > SESSION_IDLE_MS) {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      /* En segundo plano no forzamos cierre */
    } else {
      clearSession();
      announceSessionClosedByIdle();
      renderPortal();
      return;
    }
  }
  dismissSessionIdlePublicNotice();
  state.session = session;
  closePublicNavDrawer();
  document.body.classList.add("portal-mode");
  setPortalDrawerOpen(false);
  nodes.publicApp.classList.add("hidden");
  nodes.portalApp.classList.remove("hidden");
  document.documentElement.classList.remove("antares-booting-portal");
  if (applyPortalDashboardOnFullReload()) return;

  const materialize =
    typeof W.materializePortalUserFromSession === "function" ? W.materializePortalUserFromSession : () => null;
  const user = materialize(session);
  if (!user) {
    devWarn("Portal: no se pudo materializar usuario tras F5; se mantiene la sesión.");
    notify(userMessage("authProfileLoadFailed") || "Cargando perfil…", "info");
    return;
  }

  updatePortalSidebarSessionMeta();
  document.querySelectorAll(".admin-only").forEach((n) => n.classList.toggle("hidden", user.role !== ROLES.ADMIN));
  document.querySelectorAll(".client-only").forEach((n) => n.classList.toggle("hidden", user.role !== ROLES.CLIENT));
  document.querySelectorAll(".rrhh-only").forEach((n) => n.classList.toggle("hidden", !canAccessRRHH(user.role)));
  nodes.sideLinks.forEach((link) => {
    const isRoleHidden =
      (link.classList.contains("admin-only") && user.role !== ROLES.ADMIN) ||
      (link.classList.contains("client-only") && user.role !== ROLES.CLIENT) ||
      (link.classList.contains("rrhh-only") && !canAccessRRHH(user.role));
    const view = link.dataset.view;
    const allowedByPermission = isViewAllowedForUser(user, view);
    link.classList.toggle("hidden", isRoleHidden || !allowedByPermission);
  });
  document.querySelectorAll(".sidebar-section-label").forEach((label) => {
    let sibling = label.nextElementSibling;
    let hasVisibleLinks = false;
    while (sibling && !sibling.classList.contains("sidebar-section-label")) {
      if (sibling.matches?.(".side-link[data-view]") && !sibling.classList.contains("hidden")) {
        hasVisibleLinks = true;
        break;
      }
      sibling = sibling.nextElementSibling;
    }
    label.classList.toggle("hidden", !hasVisibleLinks);
  });
  renderKpis();
  const userPermsArr = Array.isArray(user.permissions) ? user.permissions : [];
  const hydratingStub = userPermsArr.length === 0;
  if (hydratingStub) {
    const urlView = viewFromPortalHash();
    if (urlView && PortalArch.isKnownView(urlView)) {
      state.currentView = urlView;
    }
  } else {
    enforcePortalViewFromUrl(user);
    if (!isViewAllowedForUser(user, state.currentView)) {
      state.currentView = "dashboard";
      syncPortalHash("dashboard");
    }
  }
  renderPortalView();
  invokePortalEvent("updatePortalDataHydratingBanner");
  invokePortalEvent("updateNotificationBadge");
  invokePortalEvent("startNotifications");
  invokePortalEvent("startSessionWatch");
}

export function buildHeaderKpiCardsForView(view, user) {
  void view;
  void user;
  return [];
}

export function renderKpis() {
  if (!nodes.kpiCards) return;
  const user = currentUser();
  if (!user) {
    nodes.kpiCards.innerHTML = "";
    return;
  }
  const view = String(state.currentView || "dashboard");
  const cards = buildHeaderKpiCardsForView(view, user);
  nodes.kpiCards.innerHTML = cards
    .map(
      (c) => `
    <article class="kpi">
      <div class="kpi-icon ${c.color}">${c.icon}</div>
      <div class="kpi-data"><span>${c.label}</span><b class="kpi-value">${c.value}</b></div>
    </article>
  `
    )
    .join("");
}

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
  renderKpis();

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
  invokePortalEvent("updatePortalDataHydratingBanner");

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
