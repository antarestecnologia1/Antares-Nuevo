/**
 * Estado central del portal y referencias DOM (`nodes`).
 *
 * Preferencias de workspace HR y alcance de datos cliente se guardan como cadenas
 * simples en `localStorage`. Los datos server-backed siguen en `window.AntaresPersistence`
 * (`persistence.js`).
 */
import {
  CLIENT_DATA_SCOPE,
  CLIENT_DATA_SCOPE_STORAGE,
  HR_VALID_DOCUMENTS_WS,
  HR_VALID_HIRING_WS,
  HR_VALID_PAYROLL_WS,
  HR_VALID_REQUESTS_WS,
  HR_VALID_SST_WS,
  HR_VALID_TRANSPORT_TRIPS_WS,
  HR_VALID_TRANSPORT_VEHICLES_WS,
  HR_WORKSPACE_STORAGE
} from "./config.js";
import {
  resolveDocumentsWorkspace,
  normalizeHiringDataSection,
  normalizeHiringOperateSection,
  normalizeHrWorkspace,
  normalizeSstDataSection,
  normalizeSstOperateSection,
  normalizeTransportTripsSection,
  normalizeTransportTripsWorkspace,
  normalizeVehicleSection,
  normalizeVehicleWorkspace,
  resolveTransportTripsSection,
  resolveVehicleSection
} from "./utils.js";

export let state = {
  session: null,
  currentView: "dashboard",
  portalContacts: [],
  systemParametersHistory: [],
  adminUserSessions: [],
  adminUserSessionsLoading: false,
  adminUserSessionsError: null,
  /** True tras la primera carga de GET /portal/user-sessions en esta visita al módulo. */
  adminUserSessionsHydrated: false,
  /** Sincronización única al entrar en Usuarios (pendientes + bootstrap en curso). */
  adminUsersEntryHydrating: false,
  /** True mientras GET /portal/bootstrap está en curso (primera carga o reintento). */
  portalDataHydrating: false,
  /** True tras al menos un bootstrap exitoso en esta visita al portal. */
  portalDataHydrated: false,
  /** True si la RAM se repuso desde sessionStorage antes del bootstrap en red. */
  portalSnapshotRestored: false,
  /** Administración · Usuarios: tarjeta «Sesiones» colapsada para ganar espacio vertical. */
  adminSessionsLogMinimized: true,
  /** Solicitudes · Admin: historial de solicitudes eliminadas (inicia colapsado). */
  deletedTransportRequestsLogMinimized: true,
  /** Transporte · Admin: historial de viajes desasignados/eliminados (inicia colapsado). */
  deletedTransportTripsLogMinimized: true,
  /** Historial: pestaña activa (explore | fleet | audit), subpestaña flota (fuel | technical) y filtro rápido. */
  historyUi: { layout: "list", actionFilter: "all", moduleFilter: "" },
  /** Reportería: exportar (PDF/CSV) o panel BI con gráficas. */
  reportsUi: { tab: "export", period: "90d", layout: null },
  reportsChartInstances: [],
  reportPreviewPayload: null,
  /** PostgreSQL preferencias_notificacion_usuario (bootstrap + POST /portal/notification-preferences). */
  notificationPreferences: {
    id: null,
    notificacionesHabilitadas: true,
    sonidoNotificacionesHabilitadas: true,
    createdAt: null,
    updatedAt: null
  },
  /** Bandeja de notificaciones: filtro activo (`all` | `unread` | categoría). */
  notificationsUi: { filter: "all" },
  theme: "light",
  publicLang: "es",
  authTab: "login",
  authSupabaseRecovery: false,
  /** Bloqueo de portal hasta aceptar Política de Tratamiento de Datos Personales. */
  dataPolicyGateVisible: false,
  authSecurity: {
    failedAttempts: 0,
    lockUntil: 0
  },
  adminUsersUi: {
    panel: "",
    editUserId: "",
    editCompanyId: "",
    section: "pending",
    createUserMinimized: false,
    createCompanyMinimized: false,
    /** Tarjeta «Editar usuario» colapsada (solo cabecera). */
    editMinimized: false,
    /** Tarjeta «Asignar permisos» colapsada tras guardar. */
    permissionsMinimized: false,
    /** Texto de búsqueda en directorios (pendientes / usuarios / empresas). */
    directorySearch: ""
  },
  adminUsersDrafts: {
    createUser: {},
    createCompany: {}
  },
  vehiclesUi: {
    workspace: "data",
    section: "fleet",
    /** Búsqueda en la pestaña Flota (placa, marca, VIN, etc.). */
    fleetSearch: "",
    /** `cards` | `list` — vista de la flota en Camiones. */
    fleetLayout: "cards"
  },
  /** Transporte · Conductores: búsqueda, vista y filtros del listado. */
  driversUi: {
    fleetSearch: "",
    fleetLayout: "cards",
    statusFilter: "all",
    docFilter: "all",
    companyId: ""
  },
  transportTripsUi: {
    workspace: "operate",
    section: "trips",
    search: "",
    sort: "pickup_asc",
    layout: "cards"
  },
  requestsUi: {
    companyId: "",
    workspace: "operate",
    /** Búsqueda en el listado de solicitudes (re-render + restauración de foco). */
    listSearch: "",
    /** `cards` | `list` — mismo patrón que Camiones / Viajes. */
    listLayout: "cards",
    /** Admin: filtro del directorio de empresas en Consultar. */
    companySearch: "",
    /** Admin: `pending` | `name` | `volume`. */
    companySort: "pending",
    companyPendingOnly: false
  },
  /** Admin · directorio de empresas: ventana de render (escala a cientos de clientes). */
  requestsCompanyRenderLimit: 25,
  /**
   * Filtros rápidos persistentes para los paneles operativos. Permiten
   * mantener la selección del usuario al re-render (cambio de estado,
   * edición, eliminación, etc.).
   */
  tripsFilter: "active",
  requestsFilter: "all",
  /** Cliente: `company` = toda la empresa; `individual` = solo solicitudes propias. */
  clientDataScope: "company",
  createPanels: {},
  /** Tras render, rellena el formulario colapsable de tarifa por trayecto (edición desde tabla). */
  pendingRouteRateEditKey: null,
  calendarFocus: null,
  /** Vista del calendario de transporte: `month` | `week` | `day` | `resources`. */
  calendarViewMode: "month",
  /** Agrupación en vista recursos: `auto` | `driver` | `vehicle`. */
  calendarResourceGroup: "auto",
  calendarFilters: { driver: "", vehicle: "", status: "", kind: "" },
  payrollFilters: {
    period: "all",
    employee: "",
    status: "all",
    frequency: "all"
  },
  payrollUi: {
    runSort: "recent",
    workspace: "operate",
    dataSection: "employees",
    operateSection: "employee"
  },
  payrollLegalUi: {
    year: String(new Date().getFullYear())
  },
  hiringUi: {
    candidateFilter: "active",
    vacancyFilter: "open",
    candidateSort: "recent",
    workspace: "operate",
    operateSection: "position",
    dataSection: "candidates",
    /** Filtro de texto en la pestaña Consultar (listados). */
    dataListSearch: ""
  },
  sstUi: {
    workspace: "operate",
    operateSection: "create",
    dataSection: "due",
    listSearch: ""
  },
  /** Gestión documental: pestaña + filtros en memoria (filtros no persisten al recargar). */
  documentsUi: {
    workspace: "upload",
    operateSection: "upload",
    dataSection: "all",
    listSearch: "",
    selectedEmployeeId: "",
    typeFilter: "",
    filterEmployeeId: "",
    filterStatus: "",
    folderFilter: "",
    folderBrowseEmployeeId: "",
    folderBrowseName: "",
    selectedDocumentType: "",
    highlightDocumentType: "",
    listViewMode: "list"
  },
  /** Centro de aprobaciones: filtro de texto en bandejas. */
  authorizationsUi: {
    listSearch: ""
  },
  registrationSuccessBanner: null,
  contactLeadsLoading: false,
  authorizationsSyncError: null,
  portalSuppressSelfPollToastUntil: 0,
  portalNonAdminCaptureBound: false
};

export function getState() {
  return state;
}

export function patchState(partial) {
  if (partial && typeof partial === "object") Object.assign(state, partial);
}

export function hydrateHrWorkspaceFromStorage() {
  try {
    const p = localStorage.getItem(HR_WORKSPACE_STORAGE.payroll);
    const h = localStorage.getItem(HR_WORKSPACE_STORAGE.hiring);
    const s = localStorage.getItem(HR_WORKSPACE_STORAGE.sst);
    const d = localStorage.getItem(HR_WORKSPACE_STORAGE.documents);
    const r = localStorage.getItem(HR_WORKSPACE_STORAGE.requests);
    const tt = localStorage.getItem(HR_WORKSPACE_STORAGE.transportTrips);
    const tv = localStorage.getItem(HR_WORKSPACE_STORAGE.transportVehicles);
    if (p) {
      const ws = normalizeHrWorkspace("payroll", p);
      state.payrollUi = { ...(state.payrollUi || {}), workspace: ws };
      if (p !== ws) persistHrWorkspace("payroll", ws);
    }
    if (r) {
      const ws = normalizeHrWorkspace("requests", r);
      state.requestsUi = { ...(state.requestsUi || {}), workspace: ws };
      if (r !== ws) persistHrWorkspace("requests", ws);
    }
    if (tt) {
      let parsed = null;
      try {
        parsed = JSON.parse(tt);
      } catch (_jsonErr) {
        parsed = null;
      }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        state.transportTripsUi = {
          ...(state.transportTripsUi || {}),
          workspace: normalizeTransportTripsWorkspace(parsed.workspace),
          section: resolveTransportTripsSection({ workspace: parsed.workspace, section: parsed.section })
        };
      } else {
        const legacySection = tt === "routes" ? "routes" : tt === "trips" ? "trips" : "";
        state.transportTripsUi = {
          ...(state.transportTripsUi || {}),
          workspace: normalizeTransportTripsWorkspace(legacySection || tt),
          section: legacySection ? legacySection : resolveTransportTripsSection(state.transportTripsUi)
        };
      }
    }
    if (tv) {
      let parsed = null;
      try {
        parsed = JSON.parse(tv);
      } catch (_jsonErr) {
        parsed = null;
      }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        state.vehiclesUi = {
          ...(state.vehiclesUi || {}),
          workspace: normalizeVehicleWorkspace(parsed.workspace),
          section: resolveVehicleSection({ workspace: parsed.workspace, section: parsed.section })
        };
      } else {
        const legacySection =
          tv === "fleet" ? "fleet" : tv === "create" ? "create" : tv === "fuel" ? "fuel" : tv === "technical" ? "technical" : "";
        state.vehiclesUi = {
          ...(state.vehiclesUi || {}),
          workspace: normalizeVehicleWorkspace(legacySection || tv),
          section: legacySection ? legacySection : resolveVehicleSection(state.vehiclesUi)
        };
      }
    }
    if (h) {
      let parsed = null;
      try {
        parsed = JSON.parse(h);
      } catch (_jsonErr) {
        parsed = null;
      }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        state.hiringUi = {
          ...(state.hiringUi || {}),
          workspace: normalizeHrWorkspace("hiring", parsed.workspace),
          operateSection: normalizeHiringOperateSection(parsed.operateSection),
          dataSection: normalizeHiringDataSection(parsed.dataSection),
          candidateFilter: String(parsed.candidateFilter || "active"),
          vacancyFilter: String(parsed.vacancyFilter || "open"),
          candidateSort: String(parsed.candidateSort || "recent")
        };
      } else {
        const ws = normalizeHrWorkspace("hiring", h);
        state.hiringUi = { ...(state.hiringUi || {}), workspace: ws };
      }
    }
    if (s) {
      let parsed = null;
      try {
        parsed = JSON.parse(s);
      } catch (_jsonErr) {
        parsed = null;
      }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        state.sstUi = {
          ...(state.sstUi || {}),
          workspace: normalizeHrWorkspace("sst", parsed.workspace),
          operateSection: normalizeSstOperateSection(parsed.operateSection),
          dataSection: normalizeSstDataSection(parsed.dataSection),
          listSearch: String(parsed.listSearch || "")
        };
      } else {
        const ws = normalizeHrWorkspace("sst", s);
        state.sstUi = { ...(state.sstUi || {}), workspace: ws };
      }
    }
    if (d) {
      let parsed = null;
      try {
        parsed = JSON.parse(d);
      } catch (_jsonErr) {
        parsed = null;
      }
      /* Solo restaurar la pestaña. Los filtros se reinician en cada carga. */
      const ws =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? resolveDocumentsWorkspace(parsed)
          : resolveDocumentsWorkspace({ workspace: d });
      state.documentsUi = {
        ...(state.documentsUi || {}),
        workspace: ws,
        operateSection: "upload",
        dataSection: "all",
        listSearch: "",
        selectedEmployeeId: "",
        typeFilter: "",
        folderBrowseEmployeeId: "",
        folderBrowseName: "",
        selectedDocumentType: "",
        highlightDocumentType: "",
        filterEmployeeId: "",
        filterStatus: "",
        folderFilter: ""
      };
      try {
        localStorage.setItem(HR_WORKSPACE_STORAGE.documents, JSON.stringify({ workspace: ws }));
      } catch (_cleanErr) {}
    }
  } catch (_e) {}
}

export function hydrateClientDataScopeFromStorage() {
  try {
    const raw = localStorage.getItem(CLIENT_DATA_SCOPE_STORAGE);
    if (raw === CLIENT_DATA_SCOPE.INDIVIDUAL || raw === CLIENT_DATA_SCOPE.COMPANY) {
      state.clientDataScope = raw;
    }
  } catch (_e) {}
}

export function persistClientDataScope(scope) {
  const next =
    String(scope || "") === CLIENT_DATA_SCOPE.INDIVIDUAL
      ? CLIENT_DATA_SCOPE.INDIVIDUAL
      : CLIENT_DATA_SCOPE.COMPANY;
  state.clientDataScope = next;
  try {
    localStorage.setItem(CLIENT_DATA_SCOPE_STORAGE, next);
  } catch (_e) {}
}

export function persistHrWorkspace(moduleId, workspace) {
  const ws = String(workspace || "");
  try {
    if (moduleId === "payroll" && HR_VALID_PAYROLL_WS.has(ws)) {
      localStorage.setItem(HR_WORKSPACE_STORAGE.payroll, ws);
    } else if (moduleId === "requests" && HR_VALID_REQUESTS_WS.has(ws)) {
      state.requestsUi = { ...(state.requestsUi || {}), workspace: ws };
      localStorage.setItem(HR_WORKSPACE_STORAGE.requests, ws);
    } else if (moduleId === "transport-trips") {
      const ui = { ...(state.transportTripsUi || {}) };
      if (HR_VALID_TRANSPORT_TRIPS_WS.has(ws)) ui.workspace = ws;
      state.transportTripsUi = ui;
      localStorage.setItem(
        HR_WORKSPACE_STORAGE.transportTrips,
        JSON.stringify({
          workspace: normalizeTransportTripsWorkspace(ui.workspace),
          section: normalizeTransportTripsSection(ui.section)
        })
      );
    } else if (moduleId === "transport-vehicles") {
      const ui = { ...(state.vehiclesUi || {}) };
      if (HR_VALID_TRANSPORT_VEHICLES_WS.has(ws)) ui.workspace = ws;
      const workspace = normalizeVehicleWorkspace(ui.workspace);
      let section = resolveVehicleSection(ui);
      if (workspace === "data") section = "fleet";
      else if (section === "fleet") section = "create";
      ui.workspace = workspace;
      ui.section = section;
      state.vehiclesUi = ui;
      localStorage.setItem(
        HR_WORKSPACE_STORAGE.transportVehicles,
        JSON.stringify({
          workspace,
          section: normalizeVehicleSection(section)
        })
      );
    } else if (moduleId === "hiring") {
      const ui = { ...(state.hiringUi || {}) };
      if (HR_VALID_HIRING_WS.has(ws)) ui.workspace = ws;
      state.hiringUi = ui;
      localStorage.setItem(
        HR_WORKSPACE_STORAGE.hiring,
        JSON.stringify({
          workspace: normalizeHrWorkspace("hiring", ui.workspace),
          operateSection: normalizeHiringOperateSection(ui.operateSection),
          dataSection: normalizeHiringDataSection(ui.dataSection),
          candidateFilter: String(ui.candidateFilter || "active"),
          vacancyFilter: String(ui.vacancyFilter || "open"),
          candidateSort: String(ui.candidateSort || "recent")
        })
      );
    } else if (moduleId === "sst") {
      const ui = { ...(state.sstUi || {}) };
      if (HR_VALID_SST_WS.has(ws)) ui.workspace = ws;
      state.sstUi = ui;
      localStorage.setItem(
        HR_WORKSPACE_STORAGE.sst,
        JSON.stringify({
          workspace: normalizeHrWorkspace("sst", ui.workspace),
          operateSection: normalizeSstOperateSection(ui.operateSection),
          dataSection: normalizeSstDataSection(ui.dataSection),
          listSearch: String(ui.listSearch || "")
        })
      );
    } else if (moduleId === "documents") {
      const ui = { ...(state.documentsUi || {}) };
      if (HR_VALID_DOCUMENTS_WS.has(ws)) ui.workspace = ws;
      state.documentsUi = ui;
      /* Persistir solo la pestaña; filtros viven solo en memoria de sesión. */
      localStorage.setItem(
        HR_WORKSPACE_STORAGE.documents,
        JSON.stringify({ workspace: resolveDocumentsWorkspace(ui) })
      );
    }
  } catch (_e) {}
}

export const nodes = {
  openAuth: document.getElementById("open-auth"),
  openAuthHero: document.getElementById("open-auth-hero"),
  closeAuth: document.getElementById("close-auth"),
  authModal: document.getElementById("auth-modal"),
  authContent: document.getElementById("auth-content"),
  b2bForm: document.getElementById("b2b-form"),
  publicApp: document.getElementById("public-app"),
  portalApp: document.getElementById("portal-app"),
  sideLinks: [...document.querySelectorAll(".side-link[data-view], .sidebar-user-panel[data-view]")],
  logout: document.getElementById("logout"),
  viewTitle: document.getElementById("view-title"),
  viewRoot: document.getElementById("view-root"),
  kpiCards: document.getElementById("kpi-cards"),
  sessionMeta: document.getElementById("session-meta"),
  authTabs: [...document.querySelectorAll(".tab")],
  themeTogglePublic: document.getElementById("theme-toggle-public"),
  themeTogglePortal: document.getElementById("theme-toggle-portal"),
  langTogglePublic: document.getElementById("lang-toggle-public"),
  themeButtonsPublic: [...document.querySelectorAll("#theme-toggle-public [data-theme-option]")],
  themeButtonsPortal: [...document.querySelectorAll("#theme-toggle-portal [data-theme-option]")],
  langButtonsPublic: [...document.querySelectorAll("#lang-toggle-public [data-lang-option]")]
};

hydrateHrWorkspaceFromStorage();
hydrateClientDataScopeFromStorage();
