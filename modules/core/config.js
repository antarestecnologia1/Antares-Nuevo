/**
 * Configuración y constantes globales del portal (sin efectos secundarios).
 * Carga: `index.html` importa este módulo y hace `Object.assign(window, …)` antes de `app.js`
 * para conservar compatibilidad con scripts clásicos que esperan identificadores globales.
 *
 * `escapeHtml` / `escapeAttr` están duplicados aquí de forma mínima (misma lógica que
 * `modules/app/portal-html-utils.js`) para que este archivo no importe otros módulos del proyecto.
 */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;");
}

/** Paneles de creación abiertos por defecto (ninguno: cada módulo controla su estado con `build*CreatePanelsState`). */
export const DEFAULT_OPEN_CREATE_PANELS = new Set([]);

/** Paneles de alta en Gestión humana — uno por trámite del rail Registrar. */
export const PAYROLL_OPERATE_CREATE_PANEL_IDS = [
  "create-employee",
  "create-payroll",
  "create-driver-trip-payment",
  "create-payroll-settlement",
  "create-hr-absence"
];

/** Sección activa del rail → panel de formulario. */
export const PAYROLL_OPERATE_SECTION_PANEL = {
  employee: "create-employee",
  payroll: "create-payroll",
  driverPay: "create-driver-trip-payment",
  settlement: "create-payroll-settlement",
  absence: "create-hr-absence"
};

/** Paneles de alta en Contratación. */
export const HIRING_OPERATE_CREATE_PANEL_IDS = [
  "create-position",
  "create-vacancy",
  "create-candidate",
  "create-interview",
  "create-contract"
];

export const HIRING_OPERATE_SECTION_PANEL = {
  position: "create-position",
  vacancy: "create-vacancy",
  candidate: "create-candidate",
  interview: "create-interview",
  contract: "create-contract"
};

/** Paneles de alta en Transporte · Camiones. */
export const VEHICLES_OPERATE_CREATE_PANEL_IDS = ["create-vehicle", "create-fuel-log", "create-technical-log"];

export const VEHICLES_OPERATE_SECTION_PANEL = {
  create: "create-vehicle",
  fuel: "create-fuel-log",
  technical: "create-technical-log"
};

/** Paneles de alta en Transporte · Viajes. */
export const TRANSPORT_TRIPS_OPERATE_CREATE_PANEL_IDS = ["create-trip", "create-route-rate"];

export const TRANSPORT_TRIPS_OPERATE_SECTION_PANEL = {
  trips: "create-trip",
  routes: "create-route-rate"
};

/** Grupos mutuamente excluyentes de paneles de creación (un módulo por grupo). */
export const MODULE_CREATE_PANEL_GROUPS = [
  PAYROLL_OPERATE_CREATE_PANEL_IDS,
  HIRING_OPERATE_CREATE_PANEL_IDS,
  TRANSPORT_TRIPS_OPERATE_CREATE_PANEL_IDS,
  VEHICLES_OPERATE_CREATE_PANEL_IDS
];

/** Devuelve el grupo de paneles al que pertenece `panelId`, o `null`. */
export function createPanelIdsForModule(panelId) {
  const id = String(panelId || "").trim();
  if (!id) return null;
  for (const group of MODULE_CREATE_PANEL_GROUPS) {
    if (group.includes(id)) return group;
  }
  return null;
}

export const MODULE_PANEL_LABELS = {
  minimize: "Minimizar",
  cancel: "Cancelar",
  expand: "Abrir formulario"
};

export const MODULE_PANEL_BTN_TITLES = {
  minimize: "Ocultar el formulario y conservar lo que escribió",
  expand: "Mostrar el formulario de nuevo",
  cancel: "Vaciar todos los campos y empezar de cero"
};

export const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  systemParameters: "antares_system_parameters_v1",
  counters: "antares_counters_v2",
  contacts: "antares_contacts_v2",
  requests: "antares_requests_v2",
  vehicles: "antares_vehicles_v2",
  drivers: "antares_drivers_v2",
  notifications: "antares_notifications_v2",
  emails: "antares_emails_v2",
  payrollEmployees: "antares_payroll_employees_v2",
  payrollRuns: "antares_payroll_runs_v2",
  fuelLogs: "antares_fuel_logs_v2",
  vehicleTechnicalLogs: "antares_vehicle_technical_logs_v2",
  travelAllowanceRules: "antares_travel_allowance_rules_v2",
  vacancies: "antares_vacancies_v2",
  candidates: "antares_candidates_v2",
  positions: "antares_positions_v2",
  interviews: "antares_interviews_v2",
  contracts: "antares_contracts_v2",
  hrAbsences: "antares_hr_absences_v2",
  sstCompliance: "antares_sst_compliance_v2",
  employeeDocuments: "antares_employee_documents_v1",
  employeeDocumentFolders: "antares_employee_document_folders_v1",
  companyDocuments: "antares_company_documents_v1",
  companyDocumentFolders: "antares_company_document_folders_v1",
  sarlaftThirdParties: "antares_sarlaft_third_parties_v1",
  sarlaftRiskProfiles: "antares_sarlaft_risk_profiles_v1",
  sarlaftAlerts: "antares_sarlaft_alerts_v1",
  sarlaftReviews: "antares_sarlaft_reviews_v1",
  tripRouteRates: "antares_trip_route_rates_v2",
  approvals: "antares_approvals_v2",
  deletedTransportTripLogs: "antares_deleted_transport_trip_logs_v1",
  deletedTransportRequestLogs: "antares_deleted_transport_request_logs_v1",
  moduleAuditLogs: "antares_module_audit_logs_v1",
  /** Mapa local entityId+timestamp → usuario que editó (sobrevive al bootstrap del servidor). */
  entityHistoryActors: "antares_entity_history_actors_v1",
  session: "antares_session_v2"
};

/** Opcional: usuario marca «recordar» en login; se guarda correo y contraseña en este navegador (texto plano). No usar en equipos compartidos. */
export const LOGIN_REMEMBER_STORAGE_KEY = "antares_portal_login_remember_v1";

export const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
  RRHH: "rrhh",
  ADMINISTRACION: "administracion",
  AUXILIAR_ADMINISTRATIVO: "auxiliar_administrativo",
  LIDER_ADMINISTRATIVO: "lider_administrativo",
  LOGISTICA: "logistica"
};

/** Roles asignables desde Usuarios y permisos / aprobación de altas (orden de la lista). */
export const PORTAL_ASSIGNABLE_ROLES = [
  { value: ROLES.ADMIN, label: "Administrador" },
  { value: ROLES.RRHH, label: "Recursos Humanos" },
  { value: ROLES.ADMINISTRACION, label: "Administración" },
  { value: ROLES.AUXILIAR_ADMINISTRATIVO, label: "Auxiliar administrativo" },
  { value: ROLES.LIDER_ADMINISTRATIVO, label: "Líder administrativo" },
  { value: ROLES.LOGISTICA, label: "Logística" },
  { value: ROLES.CLIENT, label: "Cliente" }
];

export function portalRoleSelectOptionsHtml(selectedRole = "") {
  const sel = String(selectedRole || "").toLowerCase();
  return PORTAL_ASSIGNABLE_ROLES.map(
    (r) =>
      `<option value="${escapeAttr(r.value)}"${sel === r.value ? " selected" : ""}>${escapeHtml(r.label)}</option>`
  ).join("");
}

export function portalRoleSelectOptionsForModal(selectedRole = "") {
  const sel = String(selectedRole || "").toLowerCase();
  return PORTAL_ASSIGNABLE_ROLES.map((r) => ({
    value: r.value,
    label: r.label,
    selected: sel === r.value
  }));
}

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard_view",
  CLIENT_REQUESTS: "client_requests",
  TRANSPORT_REQUESTS: "transport_requests",
  TRANSPORT_TRIPS: "transport_trips",
  TRANSPORT_VEHICLES: "transport_vehicles",
  TRANSPORT_VEHICLES_VIEW: "transport_vehicles_view",
  TRANSPORT_VEHICLES_CREATE: "transport_vehicles_create",
  TRANSPORT_VEHICLES_EDIT: "transport_vehicles_edit",
  TRANSPORT_VEHICLES_STATUS: "transport_vehicles_status",
  TRANSPORT_VEHICLES_DELETE: "transport_vehicles_delete",
  TRANSPORT_DRIVERS: "transport_drivers",
  TRANSPORT_CALENDAR: "transport_calendar",
  TRANSPORT_HISTORY: "transport_history",
  PAYROLL_MANAGE: "payroll_manage",
  PAYROLL_DELETE: "payroll_delete",
  HIRING_MANAGE: "hiring_manage",
  SST_COMPLIANCE: "sst_compliance",
  DOCUMENT_MANAGE: "document_manage",
  DOCUMENT_VIEW: "document_view",
  DOCUMENT_UPLOAD: "document_upload",
  DOCUMENT_EDIT: "document_edit",
  DOCUMENT_DELETE: "document_delete",
  SARLAFT_MANAGE: "sarlaft_manage",
  SARLAFT_VIEW: "sarlaft_view",
  SARLAFT_PARTIES: "sarlaft_parties",
  SARLAFT_ALERTS: "sarlaft_alerts",
  SARLAFT_REVIEWS: "sarlaft_reviews",
  SARLAFT_PROFILES: "sarlaft_profiles",
  SARLAFT_DELETE: "sarlaft_delete",
  USERS_MANAGE: "users_manage",
  AUTHORIZATIONS_MANAGE: "authorizations_manage",
  AUTHORIZATIONS_TRANSPORT: "authorizations_transport",
  AUTHORIZATIONS_PORTAL_REGISTRATIONS: "authorizations_portal_registrations",
  AUTHORIZATIONS_PORTAL_USERS: "authorizations_portal_users",
  AUTHORIZATIONS_FLEET: "authorizations_fleet",
  AUTHORIZATIONS_WORKFORCE: "authorizations_workforce",
  AUTHORIZATIONS_HR_ABSENCES: "authorizations_hr_absences",
  AUTHORIZATIONS_PAYROLL_PAY: "authorizations_payroll_pay",
  PROFILE_VIEW: "profile_view",
  NOTIFICATIONS_VIEW: "notifications_view",
  CONTACT_B2B_VIEW: "contact_b2b_view",
  CONTACT_B2B_EXPORT: "contact_b2b_export",
  /* ── Permisos por acción (el permiso «completo» de cada módulo sigue vigente y los incluye todos) ── */
  TRANSPORT_REQUESTS_VIEW: "transport_requests_view",
  TRANSPORT_REQUESTS_CREATE: "transport_requests_create",
  TRANSPORT_REQUESTS_EDIT: "transport_requests_edit",
  TRANSPORT_REQUESTS_CANCEL: "transport_requests_cancel",
  TRANSPORT_REQUESTS_DELETE: "transport_requests_delete",
  TRANSPORT_REQUESTS_EXPORT: "transport_requests_export",
  TRANSPORT_TRIPS_VIEW: "transport_trips_view",
  TRANSPORT_TRIPS_ASSIGN: "transport_trips_assign",
  TRANSPORT_TRIPS_STATUS: "transport_trips_status",
  TRANSPORT_TRIPS_EDIT: "transport_trips_edit",
  TRANSPORT_TRIPS_DELETE: "transport_trips_delete",
  TRANSPORT_TRIPS_RATES: "transport_trips_rates",
  TRANSPORT_TRIPS_EXPORT: "transport_trips_export",
  TRANSPORT_DRIVERS_VIEW: "transport_drivers_view",
  TRANSPORT_DRIVERS_EDIT: "transport_drivers_edit",
  TRANSPORT_DRIVERS_STATUS: "transport_drivers_status",
  TRANSPORT_DRIVERS_EXPORT: "transport_drivers_export",
  TRANSPORT_VEHICLES_EXPORT: "transport_vehicles_export",
  TRANSPORT_CALENDAR_EXPORT: "transport_calendar_export",
  TRANSPORT_HISTORY_VIEW: "transport_history_view",
  TRANSPORT_HISTORY_EXPORT: "transport_history_export",
  TRANSPORT_REPORTS_VIEW: "transport_reports_view",
  TRANSPORT_REPORTS_EXPORT: "transport_reports_export",
  PAYROLL_VIEW: "payroll_view",
  PAYROLL_EMPLOYEES: "payroll_employees",
  PAYROLL_RUNS: "payroll_runs",
  PAYROLL_PAY: "payroll_pay",
  PAYROLL_ABSENCES: "payroll_absences",
  PAYROLL_DOCUMENTS: "payroll_documents",
  PAYROLL_EXPORT: "payroll_export",
  HIRING_VIEW: "hiring_view",
  HIRING_VACANCIES: "hiring_vacancies",
  HIRING_CANDIDATES: "hiring_candidates",
  HIRING_CONTRACTS: "hiring_contracts",
  HIRING_DELETE: "hiring_delete",
  HIRING_EXPORT: "hiring_export",
  SST_VIEW: "sst_view",
  SST_EDIT: "sst_edit",
  SST_RENEW: "sst_renew",
  SST_DELETE: "sst_delete",
  SST_EXPORT: "sst_export"
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/** Permisos que puede tener un usuario con rol Cliente (segregación granular). */
export const CLIENT_ROLE_PERMISSIONS = Object.freeze([
  PERMISSIONS.PROFILE_VIEW,
  PERMISSIONS.CLIENT_REQUESTS
]);

/**
 * Módulos con permisos por acción.
 * - `full`: permiso que ya existía antes de la granularidad. Conserva EXACTAMENTE lo que ya permitía (nadie gana ni
 *   pierde acceso por este cambio).
 * - `view`: solo consultar. Abrir el módulo exige `full`, `view` o cualquier permiso de acción.
 * - `actions`: llave de cada acción. Las acciones «export» no cuentan como escritura.
 * - `fullExcludes`: acciones que el permiso `full` NO incluye (antes eran solo del administrador o de otro permiso)
 *   y ahora se pueden otorgar por separado.
 * - `alsoFrom`: permisos de OTROS módulos que ya permitían esa acción (compatibilidad).
 * Debe coincidir con `PORTAL_MODULE_PERMISSIONS` de `apps/api/src/portal/portal-permissions.ts`.
 */
export const PERMISSION_MODULES = Object.freeze({
  requests: {
    label: "Solicitudes",
    full: PERMISSIONS.TRANSPORT_REQUESTS,
    view: PERMISSIONS.TRANSPORT_REQUESTS_VIEW,
    fullExcludes: ["edit", "cancel", "delete"],
    alsoFrom: {
      create: [PERMISSIONS.CLIENT_REQUESTS],
      edit: [PERMISSIONS.AUTHORIZATIONS_TRANSPORT, PERMISSIONS.AUTHORIZATIONS_MANAGE, PERMISSIONS.TRANSPORT_TRIPS],
      cancel: [PERMISSIONS.AUTHORIZATIONS_TRANSPORT, PERMISSIONS.AUTHORIZATIONS_MANAGE, PERMISSIONS.TRANSPORT_TRIPS],
      export: [PERMISSIONS.CLIENT_REQUESTS, PERMISSIONS.AUTHORIZATIONS_TRANSPORT, PERMISSIONS.AUTHORIZATIONS_MANAGE, PERMISSIONS.TRANSPORT_TRIPS]
    },
    actions: {
      create: PERMISSIONS.TRANSPORT_REQUESTS_CREATE,
      edit: PERMISSIONS.TRANSPORT_REQUESTS_EDIT,
      cancel: PERMISSIONS.TRANSPORT_REQUESTS_CANCEL,
      delete: PERMISSIONS.TRANSPORT_REQUESTS_DELETE,
      export: PERMISSIONS.TRANSPORT_REQUESTS_EXPORT
    }
  },
  trips: {
    label: "Viajes",
    full: PERMISSIONS.TRANSPORT_TRIPS,
    view: PERMISSIONS.TRANSPORT_TRIPS_VIEW,
    fullExcludes: ["delete", "rates"],
    actions: {
      assign: PERMISSIONS.TRANSPORT_TRIPS_ASSIGN,
      status: PERMISSIONS.TRANSPORT_TRIPS_STATUS,
      edit: PERMISSIONS.TRANSPORT_TRIPS_EDIT,
      delete: PERMISSIONS.TRANSPORT_TRIPS_DELETE,
      rates: PERMISSIONS.TRANSPORT_TRIPS_RATES,
      export: PERMISSIONS.TRANSPORT_TRIPS_EXPORT
    }
  },
  drivers: {
    label: "Conductores",
    full: PERMISSIONS.TRANSPORT_DRIVERS,
    view: PERMISSIONS.TRANSPORT_DRIVERS_VIEW,
    fullExcludes: ["edit", "status", "export"],
    actions: {
      edit: PERMISSIONS.TRANSPORT_DRIVERS_EDIT,
      status: PERMISSIONS.TRANSPORT_DRIVERS_STATUS,
      export: PERMISSIONS.TRANSPORT_DRIVERS_EXPORT
    }
  },
  vehicles: {
    label: "Camiones",
    full: PERMISSIONS.TRANSPORT_VEHICLES,
    view: PERMISSIONS.TRANSPORT_VEHICLES_VIEW,
    actions: {
      create: PERMISSIONS.TRANSPORT_VEHICLES_CREATE,
      edit: PERMISSIONS.TRANSPORT_VEHICLES_EDIT,
      status: PERMISSIONS.TRANSPORT_VEHICLES_STATUS,
      delete: PERMISSIONS.TRANSPORT_VEHICLES_DELETE,
      export: PERMISSIONS.TRANSPORT_VEHICLES_EXPORT
    }
  },
  calendar: {
    label: "Calendario",
    full: null,
    view: PERMISSIONS.TRANSPORT_CALENDAR,
    actions: { export: PERMISSIONS.TRANSPORT_CALENDAR_EXPORT }
  },
  history: {
    label: "Historial",
    full: PERMISSIONS.TRANSPORT_HISTORY,
    view: PERMISSIONS.TRANSPORT_HISTORY_VIEW,
    actions: { export: PERMISSIONS.TRANSPORT_HISTORY_EXPORT }
  },
  reports: {
    label: "Reportería",
    full: PERMISSIONS.TRANSPORT_HISTORY,
    view: PERMISSIONS.TRANSPORT_REPORTS_VIEW,
    actions: { export: PERMISSIONS.TRANSPORT_REPORTS_EXPORT }
  },
  payroll: {
    label: "Gestión humana",
    full: PERMISSIONS.PAYROLL_MANAGE,
    view: PERMISSIONS.PAYROLL_VIEW,
    fullExcludes: ["delete"],
    actions: {
      employees: PERMISSIONS.PAYROLL_EMPLOYEES,
      runs: PERMISSIONS.PAYROLL_RUNS,
      pay: PERMISSIONS.PAYROLL_PAY,
      absences: PERMISSIONS.PAYROLL_ABSENCES,
      documents: PERMISSIONS.PAYROLL_DOCUMENTS,
      delete: PERMISSIONS.PAYROLL_DELETE,
      export: PERMISSIONS.PAYROLL_EXPORT
    }
  },
  hiring: {
    label: "Contratación",
    full: PERMISSIONS.HIRING_MANAGE,
    view: PERMISSIONS.HIRING_VIEW,
    fullExcludes: ["delete"],
    actions: {
      vacancies: PERMISSIONS.HIRING_VACANCIES,
      candidates: PERMISSIONS.HIRING_CANDIDATES,
      contracts: PERMISSIONS.HIRING_CONTRACTS,
      delete: PERMISSIONS.HIRING_DELETE,
      export: PERMISSIONS.HIRING_EXPORT
    }
  },
  sst: {
    label: "Cumplimiento laboral y SST",
    full: PERMISSIONS.SST_COMPLIANCE,
    view: PERMISSIONS.SST_VIEW,
    actions: {
      edit: PERMISSIONS.SST_EDIT,
      renew: PERMISSIONS.SST_RENEW,
      delete: PERMISSIONS.SST_DELETE,
      export: PERMISSIONS.SST_EXPORT
    }
  },
  contact: {
    label: "Contacto web",
    full: null,
    view: PERMISSIONS.CONTACT_B2B_VIEW,
    actions: { export: PERMISSIONS.CONTACT_B2B_EXPORT }
  }
});

/**
 * Permisos que NO sacan a un cliente de su alcance (solo datos de su empresa). El administrador puede asignar
 * cualquier permiso a cualquier usuario (interno o cliente); un cliente con algún permiso fuera de este conjunto
 * deja de ser «cliente básico» y se comporta según los permisos que tenga.
 */
export const CLIENT_SCOPE_PERMISSIONS = Object.freeze([
  PERMISSIONS.PROFILE_VIEW,
  PERMISSIONS.CLIENT_REQUESTS,
  PERMISSIONS.NOTIFICATIONS_VIEW,
  PERMISSIONS.DASHBOARD_VIEW
]);

/** Cliente con solo permisos básicos (alcance de empresa y vistas de cliente). */
export function userIsClientScoped(user) {
  if (user?.role !== ROLES.CLIENT) return false;
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  return perms.every((p) => CLIENT_SCOPE_PERMISSIONS.includes(p));
}

/** Permisos mostrables/asignables: el administrador puede asignar cualquiera a cualquier rol. */
export function assignablePermissionsForRole() {
  return [...ALL_PERMISSIONS];
}

/** 125 municipios del departamento de Antioquia (DANE), sin tildes para coincidencia en formularios. */
export const ANTIOQUIA_MUNICIPALITIES = [
  "Abejorral", "Abriaqui", "Alejandria", "Amaga", "Amalfi", "Andes", "Angelopolis", "Angostura", "Anori", "Anza",
  "Apartado", "Arboletes", "Argelia", "Armenia", "Barbosa", "Bello", "Belmira", "Betania", "Betulia", "Briceno",
  "Buritica", "Caceres", "Caicedo", "Caldas", "Campamento", "Canasgordas", "Caracoli", "Caramanta", "Carepa",
  "Carolina del Principe", "Caucasia", "Chigorodo", "Cisneros", "Ciudad Bolivar", "Cocorna", "Concepcion", "Concordia",
  "Copacabana", "Dabeiba", "Donmatias", "Ebejico", "El Bagre", "El Carmen de Viboral", "El Penol", "El Retiro",
  "El Santuario", "Entrerrios", "Envigado", "Fredonia", "Frontino", "Giraldo", "Girardota", "Gomez Plata", "Granada",
  "Guadalupe", "Guarne", "Guatape", "Heliconia", "Hispania", "Itagui", "Ituango", "Jardin", "Jerico", "La Ceja",
  "La Estrella", "La Pintada", "La Union", "Liborina", "Maceo", "Marinilla", "Medellin", "Montebello", "Murindo",
  "Mutata", "Narino", "Nechi", "Necocli", "Olaya", "Peque", "Pueblorrico", "Puerto Berrio", "Puerto Nare",
  "Puerto Triunfo", "Remedios", "Rionegro", "Sabanalarga", "Sabaneta", "Salgar", "San Andres de Cuerquia", "San Carlos",
  "San Francisco", "San Jeronimo", "San Jose de la Montana", "San Juan de Uraba", "San Luis", "San Pedro de los Milagros",
  "San Pedro de Uraba", "San Rafael", "San Roque", "San Vicente Ferrer", "Santa Barbara", "Santa Fe de Antioquia",
  "Santa Rosa de Osos", "Santo Domingo", "Segovia", "Sonson", "Sopetran", "Tamesis", "Taraza", "Tarso", "Titiribi",
  "Toledo", "Turbo", "Uramita", "Urrao", "Valdivia", "Valparaiso", "Vegachi", "Venecia", "Vigia del Fuerte", "Yali",
  "Yarumal", "Yolombo", "Yondo", "Zaragoza"
];

export const COLOMBIA_LOCATIONS = {
  Amazonas: ["Leticia", "Puerto Narino"],
  Antioquia: ANTIOQUIA_MUNICIPALITIES,
  Arauca: ["Arauca", "Arauquita", "Saravena", "Tame", "Fortul"],
  Atlantico: ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia", "Galapa", "Sabanagrande", "Santo Tomas", "Baranoa"],
  Bogota: ["Bogota D.C."],
  Bolivar: ["Cartagena", "Turbaco", "Magangue", "Arjona", "El Carmen de Bolivar", "Mompox", "San Juan Nepomuceno", "Turbana"],
  Boyaca: ["Tunja", "Duitama", "Sogamoso", "Chiquinquira", "Paipa", "Puerto Boyaca", "Samaca", "Villa de Leyva"],
  Caldas: ["Manizales", "Villamaria", "Chinchina", "La Dorada", "Riosucio", "Anserma", "Supia"],
  Caqueta: ["Florencia", "San Vicente del Caguan", "El Doncello", "Puerto Rico", "Belen de los Andaquies"],
  Casanare: ["Yopal", "Aguazul", "Villanueva", "Monterrey", "Tauramena", "Paz de Ariporo"],
  Cauca: ["Popayan", "Santander de Quilichao", "Puerto Tejada", "Patia", "Piendamo", "Corinto", "Guapi"],
  Cesar: ["Valledupar", "Aguachica", "Bosconia", "Codazzi", "La Jagua de Ibirico", "Curumani"],
  Choco: ["Quibdo", "Istmina", "Condoto", "Tado", "Bahia Solano"],
  Cordoba: ["Monteria", "Cerete", "Lorica", "Sahagun", "Planeta Rica", "Montelibano", "Tierralta", "Cienaga de Oro"],
  Cundinamarca: ["Soacha", "Chia", "Zipaquira", "Facatativa", "Girardot", "Mosquera", "Funza", "Madrid", "Fusagasuga", "Cajica", "La Calera", "Sopo", "Tabio", "Tocancipa", "Gachancipa"],
  Guainia: ["Inirida", "Barranco Minas", "Cacahual"],
  Guaviare: ["San Jose del Guaviare", "Calamar", "El Retorno", "Miraflores"],
  Huila: ["Neiva", "Pitalito", "Garzon", "La Plata", "Campoalegre", "Palermo"],
  LaGuajira: ["Riohacha", "Maicao", "Uribia", "Manaure", "Fonseca", "San Juan del Cesar", "Villanueva"],
  Magdalena: ["Santa Marta", "Cienaga", "Fundacion", "Aracataca", "El Banco", "Plato", "Pivijay"],
  Meta: ["Villavicencio", "Acacias", "Granada", "Puerto Lopez", "Puerto Gaitan", "Cumaral", "Restrepo"],
  Narino: ["Pasto", "Ipiales", "Tumaco", "Tuquerres", "Sandoná", "La Union", "Samaniego"],
  NorteDeSantander: ["Cucuta", "Ocana", "Villa del Rosario", "Los Patios", "Tibú", "Pamplona", "Chinacota"],
  Putumayo: ["Mocoa", "Puerto Asis", "Orito", "Villagarzon", "Sibundoy", "Valle del Guamuez"],
  Quindio: ["Armenia", "Calarca", "La Tebaida", "Montenegro", "Quimbaya", "Circasia"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Marsella", "Belen de Umbria"],
  SanAndresYProvidencia: ["San Andres", "Providencia"],
  Santander: ["Bucaramanga", "Floridablanca", "Giron", "Barrancabermeja", "Piedecuesta", "San Gil", "Socorro", "Malaga", "Cimitarra", "Puerto Wilches"],
  Sucre: ["Sincelejo", "Corozal", "Sampues", "San Marcos", "Toluviejo", "Coveñas", "Tolu"],
  Tolima: ["Ibague", "Espinal", "Melgar", "Honda", "Lerida", "Chaparral", "Libano", "Mariquita"],
  ValleDelCauca: ["Cali", "Palmira", "Buenaventura", "Tulua", "Yumbo", "Buga", "Cartago", "Jamundi", "Candelaria", "Florida", "Pradera", "Zarzal", "Roldanillo"],
  Vaupes: ["Mitu", "Caruru", "Taraira"],
  Vichada: ["Puerto Carreno", "La Primavera", "Santa Rosalia", "Cumaribo"]
};

export const PERMISSION_META = {
  [PERMISSIONS.DASHBOARD_VIEW]: { title: "Ver dashboard", desc: "Acceso a indicadores y resumen general." },
  [PERMISSIONS.CLIENT_REQUESTS]: {
    title: "Solicitudes de cliente",
    desc: "Crear solicitudes, consultar las propias y ver el viaje asignado."
  },
  [PERMISSIONS.TRANSPORT_REQUESTS]: {
    title: "Solicitudes de transporte (acceso completo)",
    desc: "Crear solicitudes para cualquier empresa y ver el listado operativo completo, y exportarlo (perfil logística). Editar, cancelar y eliminar se otorgan aparte."
  },
  [PERMISSIONS.TRANSPORT_TRIPS]: {
    title: "Viajes (acceso completo)",
    desc: "Asignar viajes, cambiar estados, editar y reasignar (con justificación) y exportar. Eliminar viajes y administrar tarifas se otorgan aparte."
  },
  [PERMISSIONS.TRANSPORT_VEHICLES]: {
    title: "Camiones (acceso completo)",
    desc: "Consultar, registrar, editar, cambiar disponibilidad y eliminar vehículos."
  },
  [PERMISSIONS.TRANSPORT_VEHICLES_VIEW]: {
    title: "Consultar camiones",
    desc: "Ver el módulo de flota y las fichas técnicas de los vehículos."
  },
  [PERMISSIONS.TRANSPORT_VEHICLES_CREATE]: {
    title: "Registrar camiones",
    desc: "Dar de alta vehículos en el catálogo de flota."
  },
  [PERMISSIONS.TRANSPORT_VEHICLES_EDIT]: {
    title: "Editar camiones",
    desc: "Modificar datos, documentación y equipos de vehículos existentes."
  },
  [PERMISSIONS.TRANSPORT_VEHICLES_STATUS]: {
    title: "Disponibilidad de camiones",
    desc: "Marcar vehículos como disponibles u offline manualmente."
  },
  [PERMISSIONS.TRANSPORT_VEHICLES_DELETE]: {
    title: "Eliminar camiones",
    desc: "Quitar vehículos del catálogo (si no tienen viajes vinculados en base de datos)."
  },
  [PERMISSIONS.TRANSPORT_DRIVERS]: {
    title: "Conductores (consulta)",
    desc: "Consultar fichas, documentos y vigencias de conductores. Editar, activar o desactivar y exportar se otorgan aparte (el alta se hace desde Gestión humana)."
  },
  [PERMISSIONS.TRANSPORT_CALENDAR]: { title: "Consultar calendario", desc: "Ver la programación de viajes y recursos." },
  [PERMISSIONS.TRANSPORT_HISTORY]: {
    title: "Historial y reportes (acceso completo)",
    desc: "Consultar el historial y la reportería, descargar reportes, y usar combustible y taller de la flota."
  },
  [PERMISSIONS.PAYROLL_MANAGE]: {
    title: "Gestión humana (acceso completo)",
    desc: "Empleados, liquidaciones, pagos, ausencias, cartas, contratos de personal y exportación. Eliminar se otorga aparte."
  },
  [PERMISSIONS.PAYROLL_DELETE]: {
    title: "Gestión humana · Eliminar",
    desc: "Eliminar liquidaciones, ausencias y novedades, y desvincular colaboradores en Gestión humana."
  },
  [PERMISSIONS.HIRING_MANAGE]: {
    title: "Contratación (acceso completo)",
    desc: "Vacantes, cargos, candidatos, entrevistas, contratos y exportación. Eliminar se otorga aparte."
  },
  [PERMISSIONS.SST_COMPLIANCE]: {
    title: "Cumplimiento laboral y SST (acceso completo)",
    desc: "Registrar, renovar, eliminar y exportar controles de seguridad social, vencimientos y auditoría documental."
  },
  [PERMISSIONS.DOCUMENT_MANAGE]: {
    title: "Gestión documental (acceso completo)",
    desc: "Consultar, subir, editar metadatos, eliminar registros y administrar carpetas sin restricción."
  },
  [PERMISSIONS.DOCUMENT_VIEW]: {
    title: "Consultar expediente documental",
    desc: "Ver archivos por colaborador y carpeta, descargar y exportar listados."
  },
  [PERMISSIONS.DOCUMENT_UPLOAD]: {
    title: "Subir documentos",
    desc: "Registrar archivos en el expediente y crear carpetas por colaborador."
  },
  [PERMISSIONS.DOCUMENT_EDIT]: {
    title: "Editar metadatos documentales",
    desc: "Modificar tipo, carpeta, vencimiento, código y observaciones de documentos existentes."
  },
  [PERMISSIONS.DOCUMENT_DELETE]: {
    title: "Eliminar documentos del expediente",
    desc: "Quitar registros documentales del portal (el archivo en almacenamiento puede conservarse)."
  },
  [PERMISSIONS.SARLAFT_MANAGE]: {
    title: "SARLAFT / PTE (acceso completo)",
    desc: "Consultar, registrar terceros, alertas, revisiones, parametrizar perfiles de riesgo y eliminar registros."
  },
  [PERMISSIONS.SARLAFT_VIEW]: {
    title: "Consultar SARLAFT / PTE",
    desc: "Ver terceros, alertas, vencimientos, revisiones, reportes y evidencias vinculadas."
  },
  [PERMISSIONS.SARLAFT_PARTIES]: {
    title: "Registrar y actualizar terceros",
    desc: "Conocimiento del tercero, debida diligencia, clasificación de riesgo y datos de verificación."
  },
  [PERMISSIONS.SARLAFT_ALERTS]: {
    title: "Gestionar alertas y hallazgos",
    desc: "Registrar y dar seguimiento a alertas, novedades, hallazgos o situaciones de revisión."
  },
  [PERMISSIONS.SARLAFT_REVIEWS]: {
    title: "Registrar revisiones y observaciones",
    desc: "Dejar constancia de revisiones, responsables, estados de gestión y observaciones."
  },
  [PERMISSIONS.SARLAFT_PROFILES]: {
    title: "Parametrizar perfiles de riesgo",
    desc: "Crear y ajustar la matriz, criterios, niveles y periodicidad de revisión SARLAFT/PTE."
  },
  [PERMISSIONS.SARLAFT_DELETE]: {
    title: "Eliminar registros SARLAFT / PTE",
    desc: "Quitar terceros, alertas o revisiones del módulo (queda trazabilidad en el historial)."
  },
  [PERMISSIONS.USERS_MANAGE]: {
    title: "Usuarios y permisos",
    desc: "Crear usuarios y administrar accesos. El módulo de administración sigue siendo exclusivo del administrador."
  },
  [PERMISSIONS.AUTHORIZATIONS_MANAGE]: {
    title: "Autorizaciones (todas las bandejas)",
    desc: "Acceso completo al centro de aprobaciones: transporte, cuentas, RRHH y colas internas."
  },
  [PERMISSIONS.AUTHORIZATIONS_TRANSPORT]: {
    title: "Autorizar solicitudes de transporte",
    desc: "Bandeja de solicitudes pendientes: aprobar, rechazar y editar antes de aprobar."
  },
  [PERMISSIONS.AUTHORIZATIONS_PORTAL_REGISTRATIONS]: {
    title: "Autorizar registros web",
    desc: "Nuevas cuentas del portal pendientes de aprobación."
  },
  [PERMISSIONS.AUTHORIZATIONS_PORTAL_USERS]: {
    title: "Autorizar altas de usuario",
    desc: "Cola interna cuando un operador crea usuarios sin ser administrador."
  },
  [PERMISSIONS.AUTHORIZATIONS_FLEET]: {
    title: "Autorizar altas de conductor",
    desc: "Cola interna de conductores registrados por perfiles no administradores."
  },
  [PERMISSIONS.AUTHORIZATIONS_WORKFORCE]: {
    title: "Autorizar altas de colaborador",
    desc: "Cola interna de empleados registrados por perfiles sin gestión humana. Quien ya tiene ese módulo no requiere este permiso."
  },
  [PERMISSIONS.AUTHORIZATIONS_HR_ABSENCES]: {
    title: "Autorizar ausencias e incapacidades",
    desc: "Cola de registros de ausencia cargados por RRHH o administrativos."
  },
  [PERMISSIONS.AUTHORIZATIONS_PAYROLL_PAY]: {
    title: "Autorizar marcas de pago de nómina",
    desc: "Cola de liquidaciones marcadas como pagadas por perfiles no administradores."
  },
  [PERMISSIONS.PROFILE_VIEW]: { title: "Mi perfil", desc: "Ver y editar informacion personal." },
  [PERMISSIONS.NOTIFICATIONS_VIEW]: { title: "Notificaciones", desc: "Ver novedades del sistema." },
  [PERMISSIONS.CONTACT_B2B_VIEW]: { title: "Consultar contacto web", desc: "Ver prospectos del formulario de contacto B2B." },
  [PERMISSIONS.CONTACT_B2B_EXPORT]: { title: "Exportar contacto web", desc: "Descargar el listado de prospectos en CSV." },

  [PERMISSIONS.TRANSPORT_REQUESTS_VIEW]: {
    title: "Consultar solicitudes",
    desc: "Ver el listado operativo de solicitudes de todas las empresas, solo lectura."
  },
  [PERMISSIONS.TRANSPORT_REQUESTS_CREATE]: {
    title: "Crear solicitudes",
    desc: "Registrar solicitudes de transporte para cualquier empresa."
  },
  [PERMISSIONS.TRANSPORT_REQUESTS_EDIT]: {
    title: "Editar solicitudes",
    desc: "Modificar solicitudes existentes (con justificación si ya tienen viaje asignado)."
  },
  [PERMISSIONS.TRANSPORT_REQUESTS_CANCEL]: {
    title: "Cancelar solicitudes",
    desc: "Cancelar solicitudes que aún no se han cumplido."
  },
  [PERMISSIONS.TRANSPORT_REQUESTS_DELETE]: {
    title: "Eliminar solicitudes",
    desc: "Quitar solicitudes del portal (queda registro en el historial)."
  },
  [PERMISSIONS.TRANSPORT_REQUESTS_EXPORT]: {
    title: "Exportar solicitudes",
    desc: "Descargar en CSV las solicitudes que se ven con los filtros."
  },

  [PERMISSIONS.TRANSPORT_TRIPS_VIEW]: {
    title: "Consultar viajes",
    desc: "Ver viajes, seguimiento, tarifas y detalle sin poder modificarlos."
  },
  [PERMISSIONS.TRANSPORT_TRIPS_ASSIGN]: {
    title: "Asignar viajes",
    desc: "Crear el viaje de una solicitud eligiendo camión y conductor."
  },
  [PERMISSIONS.TRANSPORT_TRIPS_STATUS]: {
    title: "Cambiar estado del viaje",
    desc: "Marcar en tránsito, en espera, completado, cerrado o cancelado."
  },
  [PERMISSIONS.TRANSPORT_TRIPS_EDIT]: {
    title: "Editar y reasignar viajes",
    desc: "Modificar un viaje asignado o cambiar camión y conductor, con justificación."
  },
  [PERMISSIONS.TRANSPORT_TRIPS_DELETE]: {
    title: "Eliminar viajes",
    desc: "Quitar viajes del portal (queda registro en el historial)."
  },
  [PERMISSIONS.TRANSPORT_TRIPS_RATES]: {
    title: "Trayectos y tarifas",
    desc: "Crear, editar y quitar trayectos y tarifas generales o por empresa."
  },
  [PERMISSIONS.TRANSPORT_TRIPS_EXPORT]: {
    title: "Exportar viajes",
    desc: "Descargar en CSV los viajes que se ven con los filtros."
  },

  [PERMISSIONS.TRANSPORT_DRIVERS_VIEW]: {
    title: "Consultar conductores",
    desc: "Ver fichas, documentos y vigencias de conductores sin poder modificarlas."
  },
  [PERMISSIONS.TRANSPORT_DRIVERS_EDIT]: {
    title: "Editar conductores",
    desc: "Modificar datos, documentos y vigencias de conductores existentes."
  },
  [PERMISSIONS.TRANSPORT_DRIVERS_STATUS]: {
    title: "Activar o desactivar conductores",
    desc: "Cambiar la disponibilidad de un conductor para asignarlo a viajes."
  },
  [PERMISSIONS.TRANSPORT_DRIVERS_EXPORT]: {
    title: "Exportar conductores",
    desc: "Descargar en CSV los conductores que se ven con los filtros (contiene datos personales)."
  },
  [PERMISSIONS.TRANSPORT_VEHICLES_EXPORT]: {
    title: "Exportar camiones",
    desc: "Descargar en CSV los camiones que se ven con los filtros."
  },
  [PERMISSIONS.TRANSPORT_CALENDAR_EXPORT]: {
    title: "Exportar calendario",
    desc: "Descargar en CSV los eventos del periodo visible."
  },

  [PERMISSIONS.TRANSPORT_HISTORY_VIEW]: {
    title: "Consultar historial",
    desc: "Ver la bitácora de actividad del portal con sus filtros."
  },
  [PERMISSIONS.TRANSPORT_HISTORY_EXPORT]: {
    title: "Exportar historial",
    desc: "Descargar la bitácora de actividad en CSV."
  },
  [PERMISSIONS.TRANSPORT_REPORTS_VIEW]: {
    title: "Consultar reportería",
    desc: "Ver el catálogo de reportes y sus vistas previas."
  },
  [PERMISSIONS.TRANSPORT_REPORTS_EXPORT]: {
    title: "Descargar reportes",
    desc: "Exportar reportes a Excel, PDF o impresión."
  },

  [PERMISSIONS.PAYROLL_VIEW]: {
    title: "Consultar gestión humana",
    desc: "Ver empleados, liquidaciones y ausencias en solo lectura."
  },
  [PERMISSIONS.PAYROLL_EMPLOYEES]: {
    title: "Registrar y editar empleados",
    desc: "Crear y modificar fichas de empleados, y desvincular o reintegrar colaboradores (si no es administrador, pasa por aprobación)."
  },
  [PERMISSIONS.PAYROLL_RUNS]: {
    title: "Liquidar nómina",
    desc: "Generar, recalcular y editar liquidaciones, parámetros legales y pagos variables."
  },
  [PERMISSIONS.PAYROLL_PAY]: {
    title: "Marcar liquidaciones como pagadas",
    desc: "Confirmar el pago de liquidaciones (si no es administrador, pasa por aprobación)."
  },
  [PERMISSIONS.PAYROLL_ABSENCES]: {
    title: "Ausencias e incapacidades",
    desc: "Registrar ausencias, vacaciones e incapacidades (si no es administrador, pasa por aprobación)."
  },
  [PERMISSIONS.PAYROLL_DOCUMENTS]: {
    title: "Cartas laborales y contratos de personal",
    desc: "Generar cartas laborales y contratos de personal, y registrar renovaciones o no renovaciones."
  },
  [PERMISSIONS.PAYROLL_EXPORT]: {
    title: "Exportar gestión humana",
    desc: "Descargar nóminas, empleados y novedades (contiene datos personales y salariales)."
  },

  [PERMISSIONS.HIRING_VIEW]: {
    title: "Consultar contratación",
    desc: "Ver vacantes, candidatos, entrevistas y contratos en solo lectura."
  },
  [PERMISSIONS.HIRING_VACANCIES]: {
    title: "Vacantes y cargos",
    desc: "Crear, editar, cerrar y republicar vacantes, y administrar el catálogo de cargos."
  },
  [PERMISSIONS.HIRING_CANDIDATES]: {
    title: "Candidatos y entrevistas",
    desc: "Registrar candidatos, moverlos en el proceso, programar entrevistas y adjuntar documentos."
  },
  [PERMISSIONS.HIRING_CONTRACTS]: {
    title: "Contratos y alta de empleados",
    desc: "Generar contratos, cartas de oferta y convertir candidatos en empleados."
  },
  [PERMISSIONS.HIRING_DELETE]: {
    title: "Eliminar en contratación",
    desc: "Quitar vacantes, cargos, candidatos, entrevistas y contratos."
  },
  [PERMISSIONS.HIRING_EXPORT]: {
    title: "Exportar contratación",
    desc: "Descargar en CSV vacantes, candidatos, entrevistas, contratos y cargos."
  },

  [PERMISSIONS.SST_VIEW]: {
    title: "Consultar cumplimiento SST",
    desc: "Ver exámenes, capacitaciones y vencimientos en solo lectura."
  },
  [PERMISSIONS.SST_EDIT]: {
    title: "Registrar y editar controles SST",
    desc: "Crear y modificar registros de cumplimiento laboral."
  },
  [PERMISSIONS.SST_RENEW]: {
    title: "Renovar controles SST",
    desc: "Registrar la renovación de exámenes, capacitaciones y documentos."
  },
  [PERMISSIONS.SST_DELETE]: {
    title: "Eliminar registros SST",
    desc: "Quitar registros de cumplimiento laboral."
  },
  [PERMISSIONS.SST_EXPORT]: {
    title: "Exportar cumplimiento SST",
    desc: "Descargar vencimientos y registros en CSV."
  }
};

export const UI_PREFS = {
  theme: "antares_theme_v1",
  publicLang: "antares_public_lang_v1"
};

export const HR_WORKSPACE_STORAGE = {
  payroll: "antares_hr_payroll_workspace_v1",
  hiring: "antares_hr_hiring_workspace_v1",
  sst: "antares_sst_workspace_v1",
  documents: "antares_documents_workspace_v1",
  sarlaft: "antares_sarlaft_workspace_v1",
  requests: "antares_requests_workspace_v1",
  transportTrips: "antares_transport_trips_workspace_v1",
  transportVehicles: "antares_transport_vehicles_workspace_v1"
};

export const CLIENT_DATA_SCOPE_STORAGE = "antares_client_data_scope_v1";
export const CLIENT_DATA_SCOPE = {
  COMPANY: "company",
  INDIVIDUAL: "individual"
};
export const HR_VALID_PAYROLL_WS = new Set(["operate", "data"]);
/** data = Selección (pipeline) · operate = Registrar · consult = Consultar listados */
export const HR_VALID_HIRING_WS = new Set(["operate", "data", "consult"]);
export const HR_VALID_SST_WS = new Set(["operate", "data"]);
export const HR_VALID_SARLAFT_WS = new Set(["operate", "data"]);
export const HR_VALID_REQUESTS_WS = new Set(["operate", "data"]);
export const HR_VALID_TRANSPORT_TRIPS_WS = new Set(["operate", "data"]);
export const HR_VALID_TRANSPORT_VEHICLES_WS = new Set(["operate", "data"]);

/** Zona horaria por defecto para fechas del portal (Colombia). */
export const CO_TIMEZONE = "America/Bogota";

export const REGISTER_TERMS_URL = "./terminos-condiciones.html";
export const REGISTER_PRIVACY_URL = "./politica-privacidad.html";
export const DATA_POLICY_VERSION = "2025-v1";
export const DATA_POLICY_URL = "./documentacion/politica-tratamiento-datos-personales.pdf";

function __checklistFlagTrue(checklist, key) {
  if (!checklist || typeof checklist !== "object") return false;
  const v = checklist[key];
  return v === true || v === 1 || v === "true" || v === "on" || v === "1";
}

function __legalChecklistFromUser(user) {
  const raw = user?.profileQualityChecklist ?? user?.checklistRegistroJson ?? null;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Perfil real de BD (no el stub del JWT). Sin esto un navegador nuevo pide documentos de más. */
export function userLegalProfileIsHydrated(user) {
  if (!user || typeof user !== "object") return false;
  if (user.source === "portal_db") return true;
  if (user.requiresDataPolicyAcceptance === true || user.requiresDataPolicyAcceptance === false) return true;
  if (user.requiresTermsAcceptance === true || user.requiresTermsAcceptance === false) return true;
  if (user.dataPolicyAcceptedAt || user.fechaAceptacionPoliticaDatos) return true;
  if (user.termsAcceptedAt || user.fechaAceptacionTerminos) return true;
  if (String(user.firstName || "").trim() || String(user.personalDoc || user.taxId || "").trim()) return true;
  return false;
}

/** Indica si el usuario debe aceptar la política de datos antes de usar el portal. */
export function userRequiresDataPolicyAcceptance(user) {
  if (!user || typeof user !== "object") return true;
  if (user.requiresDataPolicyAcceptance === false) return false;
  if (user.requiresDataPolicyAcceptance === true) {
    const acceptedAt = user.dataPolicyAcceptedAt ?? user.fechaAceptacionPoliticaDatos ?? null;
    const version = String(user.dataPolicyVersion ?? user.versionPoliticaDatos ?? "").trim();
    if (acceptedAt && version === DATA_POLICY_VERSION) return false;
  }
  const acceptedAt = user.dataPolicyAcceptedAt ?? user.fechaAceptacionPoliticaDatos ?? null;
  const version = String(user.dataPolicyVersion ?? user.versionPoliticaDatos ?? "").trim();
  if (acceptedAt && version === DATA_POLICY_VERSION) return false;
  if (acceptedAt && !version) return false;
  const checklist = __legalChecklistFromUser(user);
  if (
    checklist &&
    (__checklistFlagTrue(checklist, "dataPolicyAccepted") ||
      String(checklist.dataPolicyVersion || "").trim() === DATA_POLICY_VERSION)
  ) {
    return false;
  }
  if (!acceptedAt) return true;
  if (!version || version !== DATA_POLICY_VERSION) return true;
  return false;
}

/** Términos de uso, privacidad y Habeas Data (`usuarios.fecha_aceptacion_terminos`). */
export function userRequiresTermsAcceptance(user) {
  if (!user || typeof user !== "object") return true;
  if (user.requiresTermsAcceptance === false) return false;
  const acceptedAt = user.termsAcceptedAt ?? user.fechaAceptacionTerminos ?? null;
  if (acceptedAt) return false;
  const checklist = __legalChecklistFromUser(user);
  if (
    checklist &&
    (__checklistFlagTrue(checklist, "termsOfUseAccepted") ||
      __checklistFlagTrue(checklist, "privacyPolicyAccepted") ||
      __checklistFlagTrue(checklist, "habeasDataAcknowledged") ||
      checklist.acceptedTermsAt)
  ) {
    return false;
  }
  if (user.requiresTermsAcceptance === true) return true;
  return true;
}

/** Qué aceptaciones legales faltan según fila de usuario (desde BD /portal/me). */
export function userPendingLegalAcceptances(user) {
  return {
    dataPolicy: userRequiresDataPolicyAcceptance(user),
    terms: userRequiresTermsAcceptance(user)
  };
}

export function userRequiresLegalAcceptanceGate(user) {
  if (!userLegalProfileIsHydrated(user)) return false;
  const pending = userPendingLegalAcceptances(user);
  return pending.dataPolicy || pending.terms;
}

/** Conserva fechas ya aceptadas si el bootstrap llega sin ellas (p. ej. caché incompleta). */
export function mergeLegalAcceptanceFields(incoming, prev, snapshot) {
  if (!incoming || typeof incoming !== "object") return incoming;
  const snap = snapshot && String(snapshot.id) === String(incoming.id) ? snapshot : null;
  const pickDate = (...vals) => {
    for (const v of vals) {
      if (v) return v;
    }
    return null;
  };
  const dataPolicyAcceptedAt = pickDate(
    incoming.dataPolicyAcceptedAt,
    incoming.fechaAceptacionPoliticaDatos,
    prev?.dataPolicyAcceptedAt,
    snap?.dataPolicyAcceptedAt
  );
  const termsAcceptedAt = pickDate(
    incoming.termsAcceptedAt,
    incoming.fechaAceptacionTerminos,
    prev?.termsAcceptedAt,
    snap?.termsAcceptedAt
  );
  const dataPolicyVersion =
    String(incoming.dataPolicyVersion ?? incoming.versionPoliticaDatos ?? prev?.dataPolicyVersion ?? snap?.dataPolicyVersion ?? "").trim() ||
    null;
  const requiresDataPolicyAcceptance =
    incoming.requiresDataPolicyAcceptance === false
      ? false
      : incoming.requiresDataPolicyAcceptance === true
        ? true
        : prev?.requiresDataPolicyAcceptance === false || snap?.requiresDataPolicyAcceptance === false
          ? false
          : incoming.requiresDataPolicyAcceptance;
  const requiresTermsAcceptance =
    incoming.requiresTermsAcceptance === false
      ? false
      : incoming.requiresTermsAcceptance === true
        ? true
        : prev?.requiresTermsAcceptance === false || snap?.requiresTermsAcceptance === false
          ? false
          : incoming.requiresTermsAcceptance;
  return {
    ...incoming,
    dataPolicyAcceptedAt,
    dataPolicyVersion,
    termsAcceptedAt,
    requiresDataPolicyAcceptance,
    requiresTermsAcceptance
  };
}

/** Orden en la grilla de permisos (Usuarios y permisos): un bloque por módulo; el permiso completo va primero. */
export const PERMISSION_UI_GROUPS = [
  {
    title: "General",
    permissions: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.PROFILE_VIEW, PERMISSIONS.NOTIFICATIONS_VIEW]
  },
  {
    title: "Solicitudes de transporte",
    permissions: [
      PERMISSIONS.CLIENT_REQUESTS,
      PERMISSIONS.TRANSPORT_REQUESTS,
      PERMISSIONS.TRANSPORT_REQUESTS_VIEW,
      PERMISSIONS.TRANSPORT_REQUESTS_CREATE,
      PERMISSIONS.TRANSPORT_REQUESTS_EDIT,
      PERMISSIONS.TRANSPORT_REQUESTS_CANCEL,
      PERMISSIONS.TRANSPORT_REQUESTS_DELETE,
      PERMISSIONS.TRANSPORT_REQUESTS_EXPORT
    ]
  },
  {
    title: "Viajes (por acción)",
    permissions: [
      PERMISSIONS.TRANSPORT_TRIPS,
      PERMISSIONS.TRANSPORT_TRIPS_VIEW,
      PERMISSIONS.TRANSPORT_TRIPS_ASSIGN,
      PERMISSIONS.TRANSPORT_TRIPS_STATUS,
      PERMISSIONS.TRANSPORT_TRIPS_EDIT,
      PERMISSIONS.TRANSPORT_TRIPS_DELETE,
      PERMISSIONS.TRANSPORT_TRIPS_RATES,
      PERMISSIONS.TRANSPORT_TRIPS_EXPORT
    ]
  },
  {
    title: "Conductores (por acción)",
    permissions: [
      PERMISSIONS.TRANSPORT_DRIVERS,
      PERMISSIONS.TRANSPORT_DRIVERS_VIEW,
      PERMISSIONS.TRANSPORT_DRIVERS_EDIT,
      PERMISSIONS.TRANSPORT_DRIVERS_STATUS,
      PERMISSIONS.TRANSPORT_DRIVERS_EXPORT
    ]
  },
  {
    title: "Flota · camiones (por acción)",
    permissions: [
      PERMISSIONS.TRANSPORT_VEHICLES,
      PERMISSIONS.TRANSPORT_VEHICLES_VIEW,
      PERMISSIONS.TRANSPORT_VEHICLES_CREATE,
      PERMISSIONS.TRANSPORT_VEHICLES_EDIT,
      PERMISSIONS.TRANSPORT_VEHICLES_STATUS,
      PERMISSIONS.TRANSPORT_VEHICLES_DELETE,
      PERMISSIONS.TRANSPORT_VEHICLES_EXPORT
    ]
  },
  {
    title: "Calendario",
    permissions: [PERMISSIONS.TRANSPORT_CALENDAR, PERMISSIONS.TRANSPORT_CALENDAR_EXPORT]
  },
  {
    title: "Historial y reportería (por acción)",
    permissions: [
      PERMISSIONS.TRANSPORT_HISTORY,
      PERMISSIONS.TRANSPORT_HISTORY_VIEW,
      PERMISSIONS.TRANSPORT_HISTORY_EXPORT,
      PERMISSIONS.TRANSPORT_REPORTS_VIEW,
      PERMISSIONS.TRANSPORT_REPORTS_EXPORT
    ]
  },
  {
    title: "Centro de aprobaciones (por bandeja)",
    permissions: [
      PERMISSIONS.AUTHORIZATIONS_MANAGE,
      PERMISSIONS.AUTHORIZATIONS_TRANSPORT,
      PERMISSIONS.AUTHORIZATIONS_PORTAL_REGISTRATIONS,
      PERMISSIONS.AUTHORIZATIONS_PORTAL_USERS,
      PERMISSIONS.AUTHORIZATIONS_FLEET,
      PERMISSIONS.AUTHORIZATIONS_WORKFORCE,
      PERMISSIONS.AUTHORIZATIONS_HR_ABSENCES,
      PERMISSIONS.AUTHORIZATIONS_PAYROLL_PAY
    ]
  },
  {
    title: "Gestión humana (por acción)",
    permissions: [
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.PAYROLL_VIEW,
      PERMISSIONS.PAYROLL_EMPLOYEES,
      PERMISSIONS.PAYROLL_RUNS,
      PERMISSIONS.PAYROLL_PAY,
      PERMISSIONS.PAYROLL_ABSENCES,
      PERMISSIONS.PAYROLL_DOCUMENTS,
      PERMISSIONS.PAYROLL_DELETE,
      PERMISSIONS.PAYROLL_EXPORT
    ]
  },
  {
    title: "Contratación (por acción)",
    permissions: [
      PERMISSIONS.HIRING_MANAGE,
      PERMISSIONS.HIRING_VIEW,
      PERMISSIONS.HIRING_VACANCIES,
      PERMISSIONS.HIRING_CANDIDATES,
      PERMISSIONS.HIRING_CONTRACTS,
      PERMISSIONS.HIRING_DELETE,
      PERMISSIONS.HIRING_EXPORT
    ]
  },
  {
    title: "Cumplimiento laboral y SST (por acción)",
    permissions: [
      PERMISSIONS.SST_COMPLIANCE,
      PERMISSIONS.SST_VIEW,
      PERMISSIONS.SST_EDIT,
      PERMISSIONS.SST_RENEW,
      PERMISSIONS.SST_DELETE,
      PERMISSIONS.SST_EXPORT
    ]
  },
  {
    title: "Contacto web y administración",
    permissions: [PERMISSIONS.CONTACT_B2B_VIEW, PERMISSIONS.CONTACT_B2B_EXPORT, PERMISSIONS.USERS_MANAGE]
  },
  {
    title: "SARLAFT / PTE (por acción)",
    permissions: [
      PERMISSIONS.SARLAFT_MANAGE,
      PERMISSIONS.SARLAFT_VIEW,
      PERMISSIONS.SARLAFT_PARTIES,
      PERMISSIONS.SARLAFT_ALERTS,
      PERMISSIONS.SARLAFT_REVIEWS,
      PERMISSIONS.SARLAFT_PROFILES,
      PERMISSIONS.SARLAFT_DELETE
    ]
  },
  {
    title: "Gestión documental (por acción)",
    permissions: [
      PERMISSIONS.DOCUMENT_MANAGE,
      PERMISSIONS.DOCUMENT_VIEW,
      PERMISSIONS.DOCUMENT_UPLOAD,
      PERMISSIONS.DOCUMENT_EDIT,
      PERMISSIONS.DOCUMENT_DELETE
    ]
  }
];

export const STATUS = {
  PENDIENTE: "Pendiente",
  APROBADA_PENDIENTE_ASIGNACION: "Aprobada pendiente asignacion",
  VIAJE_ASIGNADO: "Viaje asignado",
  EN_TRANSITO: "En transito",
  ESPERA_STANDBY: "Espera standby",
  COMPLETADA: "Completada",
  CERRADA: "Cerrada",
  CANCELADA: "Cancelada",
  RECHAZADA: "Rechazada"
};

export const STATUS_TRANSITIONS = {
  [STATUS.PENDIENTE]: [STATUS.APROBADA_PENDIENTE_ASIGNACION, STATUS.VIAJE_ASIGNADO, STATUS.CANCELADA, STATUS.RECHAZADA],
  [STATUS.APROBADA_PENDIENTE_ASIGNACION]: [STATUS.VIAJE_ASIGNADO, STATUS.CANCELADA],
  [STATUS.VIAJE_ASIGNADO]: [STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY, STATUS.CANCELADA],
  [STATUS.EN_TRANSITO]: [STATUS.ESPERA_STANDBY, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.ESPERA_STANDBY]: [STATUS.EN_TRANSITO, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.COMPLETADA]: [STATUS.CERRADA],
  [STATUS.CERRADA]: [],
  [STATUS.CANCELADA]: [],
  [STATUS.RECHAZADA]: []
};

export const PIPELINE = ["Recibido", "Preseleccionado", "Entrevistado", "Oferta enviada", "Contratado", "Descartado"];

export const PIPELINE_TRANSITIONS = {
  Recibido: ["Preseleccionado", "Descartado"],
  Preseleccionado: ["Entrevistado", "Descartado"],
  Entrevistado: ["Oferta enviada", "Descartado"],
  "Oferta enviada": ["Contratado", "Descartado"],
  Contratado: [],
  Descartado: []
};

export const AUTO_APPROVE_MINUTES = 10;

/** Ley 52/1975: interés legal anual sobre cesantías (referencia normativa vigente). */
export const CO_CESANTIAS_INTERES_ANUAL_PCT = 12;

/**
 * Parámetros de nómina Colombia (tasas y SMMLV orientativo).
 * `applySystemParametersToClientRules` los sincroniza desde parámetros del sistema (API).
 */
export const CO_PAYROLL = {
  healthEmployeeRate: 0.04,
  pensionEmployeeRate: 0.04,
  solidarityRate: 0.01,
  solidarityThresholdSmmlv: 4,
  // SMMLV 2026 orientativo (~ $1.750.905 COP — verificar decreto del año fiscal).
  smmlv: 1750905
};

/** Referencias RRHH (jornada, salario mínimo, auxilio transporte) alineadas a práctica colombiana. */
export const CO_HR_RULES = {
  /** Ley 2101/2021: 42 h semanales desde el 15-jul-2026. */
  legalWeeklyHours: 42,
  minMonthlySalary: 1750905,
  transportAllowance: 249095
};

/** Tope salarial (en SMMLV) para auxilio de transporte legal (práctica habitual Colombia). */
export const CO_TRANSPORT_ALLOWANCE_MAX_SMMLV = 2;

/** Salario integral (CST / práctica): referencia mínima habitual 13 SMMLV. */
export const CO_INTEGRAL_SALARY_MIN_SMMLV = 13;

export const PAYROLL_ABSENCE_LEGAL_LIMITS = {
  maternidadOrdinariaDays: 126,
  maternidadMultipleDays: 140,
  maternidadPrematuroMaxDays: 140,
  maternidadExtensionMedicaMaxDays: 182,
  paternidadDays: 14,
  paternidadParentalCompartidaDays: 7,
  lutoMaxBusinessDays: 5
};

export const LABOR_SYSTEM_PARAMETERS_MIN_YEAR = 2020;
export const LABOR_SYSTEM_PARAMETERS_MAX_YEAR = 2035;

/** Catálogos CO para nómina/RRHH (coincidencia de valores guardados y formularios). */
export const CO_CATALOGS = {
  licenseCategories: ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"],
  eps: ["Sura", "Nueva EPS", "Sanitas", "Compensar", "Famisanar", "Salud Total", "Savia Salud", "Aliansalud", "Coosalud", "Mutual Ser", "S.O.S."],
  arl: ["Sura", "Positiva", "Colmena", "Bolivar", "Alfa", "Equidad", "Mapfre"],
  bloodTypes: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
  pensionFunds: ["Colpensiones", "Porvenir", "Proteccion", "Colfondos", "Skandia"],
  severanceFunds: ["Porvenir", "Proteccion", "Colfondos", "Skandia", "FNA"],
  compensationFunds: ["Colsubsidio", "Cafam", "Compensar", "Comfama", "Comfandi", "Cafaba", "Comfenalco Antioquia", "Comfenalco Valle", "Cajacopi"],
  arlRiskLevels: ["I", "II", "III", "IV", "V"],
  bodyTypes: ["Furgon seco", "Furgon refrigerado (Termoking)", "Estacas", "Plancha", "Cisterna", "Granelero", "Volqueta"],
  fuelTypes: ["Diesel ACPM", "Gas Natural Vehicular (GNV)", "Gasolina corriente", "Hibrido"],
  axleConfig: ["2 ejes (4 llantas)", "3 ejes (6 llantas)", "4 ejes (8 llantas)", "5 ejes (10 llantas)", "6 ejes (12 llantas)"],
  documentTypes: ["CC", "CE", "PAS", "PEP", "TI"],
  contractTypes: ["Termino indefinido", "Termino fijo", "Obra o labor", "Prestacion de servicios", "Aprendizaje SENA"],
  /** Tipos con plantilla Word en documentacion/ (solo formulario de cargo). */
  positionContractTypes: ["Termino indefinido", "Termino fijo", "Prestacion de servicios"],
  workSchedule: ["Diurna", "Nocturna", "Mixta"],
  /** Solo mensual y quincenal: liquidación automática (cron) y masiva. */
  payFrequency: ["Mensual", "Quincenal"],
  contributorTypes: ["Dependiente", "Independiente", "Aprendiz SENA lectivo", "Aprendiz SENA productivo", "Pensionado activo"],
  banks: ["Bancolombia", "Davivienda", "BBVA", "Banco de Bogota", "Banco Popular", "Itau (Corpbanca)", "Banco Caja Social", "Banco AV Villas", "Banco Falabella", "Scotiabank Colpatria", "Banco Agrario", "Banco GNB Sudameris", "Nequi", "Daviplata"],
  accountTypes: ["Ahorros", "Corriente"],
  educationLevel: ["Primaria", "Bachiller", "Tecnico", "Tecnologo", "Profesional", "Posgrado"],
  maritalStatus: ["Soltero(a)", "Casado(a)", "Union libre", "Separado(a)", "Divorciado(a)", "Viudo(a)"],
  genders: ["Masculino", "Femenino", "Otro", "Prefiero no decirlo"],
  vehicleColors: ["Blanco", "Negro", "Gris", "Plata", "Azul", "Rojo", "Verde", "Amarillo", "Naranja"],
  contractTerminationCauses: ["Vencimiento de termino", "Mutuo acuerdo", "Justa causa", "Sin justa causa", "Renuncia voluntaria", "Termino de obra", "Pension"],
  uniformIssuance: ["Enero/Mayo/Septiembre", "Abril/Agosto/Diciembre", "No aplica"],
  /** Subconjunto de tipos operativos de `vehiculos.tipo_vehiculo` (ver `camiones-html.js`) habilitado para conductores; un conductor puede estar habilitado para varios. */
  driverVehicleTypes: ["Camion", "Turbo", "Tractomula"]
};

export const HIRING_RRHH_EDIT_ACTIONS = new Set([
  "edit-vacancy",
  "close-vacancy",
  "edit-position",
  "edit-candidate",
  "edit-interview",
  "candidate-status",
  "candidate-status-apply",
  "hiring-flow-advance",
  "upload-candidate-attachment",
  "toggle-position"
]);

export const PAYROLL_RRHH_EDIT_ACTIONS = new Set([
  "delete-employee",
  "unlink-employee",
  "recategorize-unlinked-employee",
  "reinstate-employee",
  "delete-payroll-run",
  "edit-hr-absence",
  "delete-hr-absence"
]);

export const SST_RRHH_EDIT_ACTIONS = new Set([
  "edit-sst-record",
  "delete-sst-record",
  "renew-sst-control",
  "export-sst-due-csv"
]);

export const TRIP_RATE_SCOPE_SEP = "@@";

export const SEARCHABLE_SELECT_MIN_OPTIONS = 8;

/** Metadatos UI: cola de autorizaciones agrupada por ambito operativo (ver también queueApproval). */
export const APPROVAL_TYPE_META = {
  create_user: { sectionKey: "portal_access", label: "Alta de usuario del portal" },
  create_driver: { sectionKey: "transport_fleet", label: "Alta de conductor" },
  create_employee: { sectionKey: "workforce", label: "Alta de colaborador (gestión humana)" },
  update_employee: { sectionKey: "workforce", label: "Modificación de colaborador (gestión humana)" },
  register_hr_absence: { sectionKey: "hr_absences", label: "Registro de ausencia o incapacidad" },
  mark_payroll_paid: { sectionKey: "payroll_pay", label: "Confirmar pago de liquidación" },
  approve_trip_request: { sectionKey: "misc", label: "Solicitud de transporte pendiente (historico en cola)" }
};

export const APPROVAL_UI_BLOCKS = [
  {
    key: "portal_access",
    kind: "queue",
    title: "Acceso y usuarios del portal",
    description:
      "Creación de cuentas que un operador sin rol administrador registra en el módulo de usuarios. Al aprobar, el sistema materializa el usuario, permisos y empresa asociada.",
    origin: "Usuarios y permisos → nuevo usuario (no administrador)"
  },
  {
    key: "transport_fleet",
    kind: "queue",
    title: "Conductores y flota operativa",
    description:
      "Alta de conductor solicitada por un perfil que no es administrador. Al aprobar, se crea el conductor disponible para asignación y, si aplica, el registro vinculado en gestión humana.",
    origin: "Conductores → nuevo registro (no administrador)"
  },
  {
    key: "workforce",
    kind: "queue",
    title: "Talento, contratación y gestión humana",
    description:
      "Altas y cambios en el expediente de personal cuando quien registra o edita no es administrador. Incluye datos contractuales y de seguridad social; el administrador valida antes de aplicar la ficha activa.",
    origin: "Gestión humana → nuevo colaborador o edición de ficha (no administrador)"
  },
  {
    key: "hr_absences",
    kind: "queue",
    title: "Ausencias, incapacidades y SST",
    description:
      "Registro formal de ausencia cuando quien carga el dato tiene rol de Recursos Humanos, Administración, Auxiliar administrativo o Líder administrativo. El administrador valida antes de dejar constancia.",
    origin: "Cumplimiento laboral y SST → registro de ausencia (roles RRHH / administrativos)"
  },
  {
    key: "payroll_pay",
    kind: "queue",
    title: "Liquidación y marcas de pago",
    description:
      "Marcar liquidación de nómina como pagada cuando la acción la inicia un perfil RRHH o administrativo (no administrador de sistema). Evita cierres contables sin doble validación.",
    origin: "Gestión humana → marcar liquidación pagada (roles RRHH / administrativos)"
  }
];

export const AUTH_QUEUE_SHORT_TAB_LABELS = {
  portal_access: "Alta usuarios",
  transport_fleet: "Conductores",
  workforce: "Empleados",
  hr_absences: "Ausencias",
  payroll_pay: "Liquidaciones"
};

export const REQUEST_EDIT_JUSTIFICATION_MIN_LEN = 10;

export const SESSION_API_REFRESH_MS = 8 * 60 * 1000;
export const SESSION_CLIENT_TOKEN_ROTATE_MS = 15 * 60 * 1000;
export const SESSION_IDLE_PUBLIC_NOTICE_KEY = "antares_session_idle_notice_v1";

/** Mínimo entre refrescos LIGEROS de la campana (GET /portal/notifications, sin re-descargar todo el portal). */
export const NOTIF_LIGHT_REFRESH_MIN_MS = 7000;

/**
 * Mínimo entre bootstraps completos lanzados en segundo plano para refrescar datos operativos
 * (poll de notificaciones; evita re-descargar todo el dataset cada pocos segundos).
 */
export const NOTIF_SILENT_BOOTSTRAP_MIN_MS = 180000;

export const TRANSPORT_MODOS_SERVICIO = new Set(["Transporte nacional", "Transporte entre sedes del cliente"]);

export const TRIP_ASSIGNMENT_FLEET_TYPE_KEYS = new Set(["camion", "turbo", "tractomula"]);

export const FLEET_DRIVER_EDIT_ACTIONS = new Set(["edit-driver", "toggle-driver"]);

/**
 * Acciones que un usuario que no es administrador no puede ejecutar directamente
 * (listeners en fase capture sobre `#view-root`; ver `portalNonAdminRestrictedCaptureClick`).
 */
export const PORTAL_NON_ADMIN_BLOCKED_ACTIONS = new Set([
  "approve",
  "reject",
  "edit-admin",
  "delete-admin",
  "trip-status",
  "delete-trip",
  "edit-vehicle",
  "toggle-vehicle",
  "delete-vehicle",
  "edit-driver",
  "toggle-driver",
  "delete-driver",
  "delete-route-rate",
  "delete-employee",
  "unlink-employee",
  "recategorize-unlinked-employee",
  "reinstate-employee",
  "delete-vacancy",
  "close-vacancy",
  "toggle-position",
  "candidate-status",
  "open-edit-user",
  "open-user-permissions",
  "delete-user",
  "approve-registration",
  "reject-registration",
  "approval-approve",
  "approval-reject",
  "open-edit-company",
  "close-edit-company",
  "toggle-company-active",
  "delete-company",
  "delete-payroll-run",
  "delete-hr-absence",
  "edit-hr-absence",
  "edit-vacancy",
  "edit-position",
  "delete-position",
  "edit-candidate",
  "delete-candidate",
  "edit-interview",
  "delete-interview",
  "delete-contract",
  "edit-sst-record",
  "delete-sst-record",
  "toggle-deleted-requests-log",
  "deleted-request-snapshot-detail",
  "toggle-deleted-trips-log",
  "deleted-trip-snapshot-detail"
]);

export const HISTORY_FLEET_TECH_LABELS = {
  preventivo: "Preventivo",
  correctivo: "Correctivo",
  falla: "Falla técnica"
};

export const REPORT_RULES = {
  executive_control_tower: { permission: PERMISSIONS.DASHBOARD_VIEW, rrhhAllowed: true },
  service_levels: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  fleet_summary: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  trips_operations: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  requests_lifecycle: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  drivers_performance: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  fuel_operations: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  maintenance_fleet: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  revenue_by_route: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  request_funnel: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  document_compliance: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  clients_portfolio: { permission: PERMISSIONS.TRANSPORT_HISTORY },
  payroll_summary: { permission: PERMISSIONS.PAYROLL_MANAGE, rrhhAllowed: true },
  hiring_pipeline: { permission: PERMISSIONS.HIRING_MANAGE, rrhhAllowed: true },
  workforce_roster: { permission: PERMISSIONS.PAYROLL_MANAGE, rrhhAllowed: true },
  labor_compliance: { permission: PERMISSIONS.SST_COMPLIANCE, rrhhAllowed: true },
  sarlaft_pte: { permission: PERMISSIONS.SARLAFT_VIEW, rrhhAllowed: true },
  document_management: { permission: PERMISSIONS.DOCUMENT_VIEW, rrhhAllowed: true },
  employee_documents: { permission: PERMISSIONS.DOCUMENT_VIEW, rrhhAllowed: true },
  users_access: { permission: PERMISSIONS.USERS_MANAGE, adminOnly: true },
  authorizations_traceability: { permission: PERMISSIONS.AUTHORIZATIONS_MANAGE }
};

export const REPORT_EXPORT_BRAND = Object.freeze({
  primary: "#377cc0",
  primaryDeep: "#2a6399",
  primaryDeeper: "#1e4a73",
  soft: "#cce5f8",
  text: "#0b2138",
  muted: "#64748b",
  line: "#b8d4eb"
});

export const REPORT_BRAND_LOGO_PATH = "./imagenes%20empresa/Logo.png";

/** Firma del representante legal (misma imagen embebida en plantillas Word de contratos). */
export const CONTRACT_LEGAL_REP_SIGNATURE_PATH = "./imagenes%20empresa/firma-representante-legal.jpg";
export const CONTRACT_LEGAL_REP_NAME = "Alfredo de Jesús Botero Castañeda";
export const CONTRACT_LEGAL_REP_ID_DOC = "C.C. 15.383.391";

/** Empleador en plantillas Word de contrato (CONTRATO_*.docx) — misma identidad en carta laboral. */
export const CONTRACT_EMPLOYER_LEGAL = {
  name: "Transportes Antares S.A.S",
  nameUpper: "TRANSPORTES ANTARES S.A.S",
  nit: "900.830.324-7",
  address: "Carrera 20 #6-81 La Ceja, EDS Roscombustible 2do piso",
  city: "La Ceja",
  department: "Antioquia",
  cityLine: "La Ceja, Antioquia",
  legalRepName: "Alfredo de Jesús Botero Castañeda",
  legalRepNameUpper: "ALFREDO DE JESUS BOTERO CASTAÑEDA",
  legalRepIdDoc: "15.383.391",
  legalRepIdDocLabel: "cédula de ciudadanía número 15.383.391 de La Ceja, Antioquia"
};

export const SST_COMPLIANCE_RECORD_TYPES = [
  "Afiliacion EPS",
  "Afiliacion pension",
  "Afiliacion ARL",
  "Examen medico ocupacional",
  "Examen instruvial",
  "Licencia de conduccion",
  "Capacitacion SST",
  "Inspeccion documental"
];

export const SST_COMPLIANCE_STATUSES = ["Pendiente", "En gestion", "Cumplido"];
