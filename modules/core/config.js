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

/** Paneles de creación abiertos por defecto hasta que el usuario los minimice. */
export const DEFAULT_OPEN_CREATE_PANELS = new Set([
  "create-vehicle",
  "create-fuel-log",
  "create-technical-log",
  "create-route-rate",
  "create-employee",
  "create-payroll",
  "create-payroll-settlement",
  "create-hr-absence",
  "create-position",
  "create-vacancy",
  "create-candidate",
  "create-interview",
  "create-contract"
]);

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
  tripRouteRates: "antares_trip_route_rates_v2",
  approvals: "antares_approvals_v2",
  deletedTransportTripLogs: "antares_deleted_transport_trip_logs_v1",
  deletedTransportRequestLogs: "antares_deleted_transport_request_logs_v1",
  moduleAuditLogs: "antares_module_audit_logs_v1",
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
  HIRING_MANAGE: "hiring_manage",
  SST_COMPLIANCE: "sst_compliance",
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
  CONTACT_B2B_VIEW: "contact_b2b_view"
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const COLOMBIA_LOCATIONS = {
  Amazonas: ["Leticia", "Puerto Narino"],
  Antioquia: ["Medellin", "Bello", "Itagui", "Envigado", "Rionegro", "Apartado", "Turbo", "Caucasia", "La Ceja", "Sabaneta", "Copacabana", "Girardota", "Marinilla", "Yarumal", "Santa Fe de Antioquia"],
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
  [PERMISSIONS.CLIENT_REQUESTS]: { title: "Solicitudes de cliente", desc: "Crear y consultar solicitudes propias." },
  [PERMISSIONS.TRANSPORT_REQUESTS]: {
    title: "Operación de solicitudes",
    desc: "Crear solicitudes para cualquier empresa y ver el listado operativo completo (perfil logística)."
  },
  [PERMISSIONS.TRANSPORT_TRIPS]: {
    title: "Gestion de viajes",
    desc: "Asignar viajes, actualizar estados y modificar solicitudes que ya tienen viaje asignado (con justificación)."
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
  [PERMISSIONS.TRANSPORT_DRIVERS]: { title: "Gestion de conductores", desc: "Registrar y administrar conductores." },
  [PERMISSIONS.TRANSPORT_CALENDAR]: { title: "Calendario operativo", desc: "Ver programacion de viajes." },
  [PERMISSIONS.TRANSPORT_HISTORY]: { title: "Historial y reportes", desc: "Consultar historicos y filtros." },
  [PERMISSIONS.PAYROLL_MANAGE]: { title: "Gestión humana", desc: "Gestionar empleados y liquidaciones." },
  [PERMISSIONS.HIRING_MANAGE]: { title: "Contratacion", desc: "Gestionar vacantes, candidatos y contratos." },
  [PERMISSIONS.SST_COMPLIANCE]: { title: "Cumplimiento laboral y SST", desc: "Controlar seguridad social, vencimientos y auditoria documental." },
  [PERMISSIONS.USERS_MANAGE]: { title: "Usuarios y permisos", desc: "Crear usuarios y administrar accesos." },
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
    desc: "Cola interna de empleados en gestión humana."
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
  [PERMISSIONS.CONTACT_B2B_VIEW]: { title: "Solicitudes contacto web", desc: "Ver y gestionar prospectos del formulario de contacto B2B." }
};

export const UI_PREFS = {
  theme: "antares_theme_v1",
  publicLang: "antares_public_lang_v1"
};

export const HR_WORKSPACE_STORAGE = {
  payroll: "antares_hr_payroll_workspace_v1",
  hiring: "antares_hr_hiring_workspace_v1"
};

export const CLIENT_DATA_SCOPE_STORAGE = "antares_client_data_scope_v1";
export const CLIENT_DATA_SCOPE = {
  COMPANY: "company",
  INDIVIDUAL: "individual"
};
export const HR_VALID_PAYROLL_WS = new Set(["operate", "data"]);
export const HR_VALID_HIRING_WS = new Set(["operate", "data"]);
