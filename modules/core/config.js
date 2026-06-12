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
  hiring: "antares_hr_hiring_workspace_v1",
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
export const HR_VALID_HIRING_WS = new Set(["operate", "data"]);
export const HR_VALID_REQUESTS_WS = new Set(["operate", "data"]);
export const HR_VALID_TRANSPORT_TRIPS_WS = new Set(["operate", "data"]);
export const HR_VALID_TRANSPORT_VEHICLES_WS = new Set(["operate", "data"]);

/** Zona horaria por defecto para fechas del portal (Colombia). */
export const CO_TIMEZONE = "America/Bogota";

export const REGISTER_TERMS_URL = "./terminos-condiciones.html";
export const REGISTER_PRIVACY_URL = "./politica-privacidad.html";

/** Orden en la grilla de permisos (Usuarios y permisos). */
export const PERMISSION_UI_GROUPS = [
  {
    title: "General",
    permissions: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.PROFILE_VIEW, PERMISSIONS.NOTIFICATIONS_VIEW]
  },
  {
    title: "Solicitudes y operación de transporte",
    permissions: [
      PERMISSIONS.CLIENT_REQUESTS,
      PERMISSIONS.TRANSPORT_REQUESTS,
      PERMISSIONS.TRANSPORT_TRIPS,
      PERMISSIONS.TRANSPORT_DRIVERS,
      PERMISSIONS.TRANSPORT_CALENDAR,
      PERMISSIONS.TRANSPORT_HISTORY
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
      PERMISSIONS.TRANSPORT_VEHICLES_DELETE
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
    title: "Recursos humanos y administración",
    permissions: [
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.HIRING_MANAGE,
      PERMISSIONS.SST_COMPLIANCE,
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.CONTACT_B2B_VIEW
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
  legalWeeklyHours: 46,
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
  eps: ["Sura", "Nueva EPS", "Sanitas", "Compensar", "Famisanar", "Salud Total", "Aliansalud", "Coosalud", "Mutual Ser", "S.O.S."],
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
  payFrequency: ["Mensual", "Quincenal", "Semanal", "Catorcenal"],
  contributorTypes: ["Dependiente", "Independiente", "Aprendiz SENA lectivo", "Aprendiz SENA productivo", "Pensionado activo"],
  banks: ["Bancolombia", "Davivienda", "BBVA", "Banco de Bogota", "Banco Popular", "Itau (Corpbanca)", "Banco Caja Social", "Banco AV Villas", "Banco Falabella", "Scotiabank Colpatria", "Banco Agrario", "Banco GNB Sudameris", "Nequi", "Daviplata"],
  accountTypes: ["Ahorros", "Corriente"],
  educationLevel: ["Primaria", "Bachiller", "Tecnico", "Tecnologo", "Profesional", "Posgrado"],
  maritalStatus: ["Soltero(a)", "Casado(a)", "Union libre", "Separado(a)", "Divorciado(a)", "Viudo(a)"],
  genders: ["Masculino", "Femenino", "Otro", "Prefiero no decirlo"],
  vehicleColors: ["Blanco", "Negro", "Gris", "Plata", "Azul", "Rojo", "Verde", "Amarillo", "Naranja"],
  contractTerminationCauses: ["Vencimiento de termino", "Mutuo acuerdo", "Justa causa", "Sin justa causa", "Renuncia voluntaria", "Termino de obra", "Pension"],
  uniformIssuance: ["Enero/Mayo/Septiembre", "Abril/Agosto/Diciembre", "No aplica"]
};

export const HIRING_RRHH_EDIT_ACTIONS = new Set([
  "edit-vacancy",
  "edit-position",
  "edit-candidate",
  "edit-interview",
  "candidate-status",
  "toggle-position"
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

export const SESSION_API_REFRESH_MS = 12 * 60 * 1000;
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
  "delete-vacancy",
  "toggle-position",
  "candidate-status",
  "open-edit-user",
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
  service_levels: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  fleet_summary: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  trips_operations: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  requests_lifecycle: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  drivers_performance: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  fuel_operations: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  maintenance_fleet: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  revenue_by_route: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  request_funnel: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  document_compliance: { permission: PERMISSIONS.TRANSPORT_HISTORY, adminOnly: true },
  payroll_summary: { permission: PERMISSIONS.PAYROLL_MANAGE, rrhhAllowed: true },
  hiring_pipeline: { permission: PERMISSIONS.HIRING_MANAGE, rrhhAllowed: true },
  labor_compliance: { permission: PERMISSIONS.SST_COMPLIANCE, rrhhAllowed: true },
  users_access: { permission: PERMISSIONS.USERS_MANAGE, adminOnly: true },
  authorizations_traceability: { permission: PERMISSIONS.AUTHORIZATIONS_MANAGE, adminOnly: true }
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

export const SST_COMPLIANCE_RECORD_TYPES = [
  "Afiliacion EPS",
  "Afiliacion pension",
  "Afiliacion ARL",
  "Examen medico ocupacional",
  "Capacitacion SST",
  "Inspeccion documental"
];

export const SST_COMPLIANCE_STATUSES = ["Pendiente", "En gestion", "Cumplido"];
