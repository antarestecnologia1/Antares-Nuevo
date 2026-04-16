const IC = {
  eye: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  edit: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  check: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  plus: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  download: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  filter: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  send: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  truck: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  user: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  clock: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  shield: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  file: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  inbox: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  calendar: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  dollar: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  briefcase: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"/></svg>',
  bell: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  compass: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  toggle: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/></svg>',
  grid: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  activity: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  save: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  userPlus: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  printer: '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
};

function pcardWrap(iconKey, title, subtitle, bodyHtml, extraClass = "") {
  return `<div class="p-card ${extraClass}"><div class="p-card-header"><div class="p-card-header-left"><svg class="p-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[iconKey]?.replace(/<svg[^>]*>|<\/svg>/g, "") || ""}</svg><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div></div></div><div class="p-card-body">${bodyHtml}</div></div>`;
}

function emptyState(text) {
  return `<div class="empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><p>${text}</p></div>`;
}

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  counters: "antares_counters_v2",
  contacts: "antares_contacts_v2",
  requests: "antares_requests_v2",
  vehicles: "antares_vehicles_v2",
  drivers: "antares_drivers_v2",
  notifications: "antares_notifications_v2",
  emails: "antares_emails_v2",
  payrollEmployees: "antares_payroll_employees_v2",
  payrollRuns: "antares_payroll_runs_v2",
  vacancies: "antares_vacancies_v2",
  candidates: "antares_candidates_v2",
  interviews: "antares_interviews_v2",
  contracts: "antares_contracts_v2",
  session: "antares_session_v2"
};

const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
  RRHH: "rrhh"
};

const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard_view",
  CLIENT_REQUESTS: "client_requests",
  TRANSPORT_REQUESTS: "transport_requests",
  TRANSPORT_TRIPS: "transport_trips",
  TRANSPORT_VEHICLES: "transport_vehicles",
  TRANSPORT_DRIVERS: "transport_drivers",
  TRANSPORT_CALENDAR: "transport_calendar",
  TRANSPORT_HISTORY: "transport_history",
  PAYROLL_MANAGE: "payroll_manage",
  HIRING_MANAGE: "hiring_manage",
  USERS_MANAGE: "users_manage",
  NOTIFICATIONS_VIEW: "notifications_view"
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);
const PERMISSION_META = {
  [PERMISSIONS.DASHBOARD_VIEW]: { title: "Ver dashboard", desc: "Acceso a indicadores y resumen general." },
  [PERMISSIONS.CLIENT_REQUESTS]: { title: "Solicitudes de cliente", desc: "Crear y consultar solicitudes propias." },
  [PERMISSIONS.TRANSPORT_REQUESTS]: { title: "Bandeja de transporte", desc: "Aprobar, rechazar y editar solicitudes." },
  [PERMISSIONS.TRANSPORT_TRIPS]: { title: "Gestion de viajes", desc: "Asignar y actualizar estados de viaje." },
  [PERMISSIONS.TRANSPORT_VEHICLES]: { title: "Gestion de camiones", desc: "Registrar y modificar vehiculos." },
  [PERMISSIONS.TRANSPORT_DRIVERS]: { title: "Gestion de conductores", desc: "Registrar y administrar conductores." },
  [PERMISSIONS.TRANSPORT_CALENDAR]: { title: "Calendario operativo", desc: "Ver programacion de viajes." },
  [PERMISSIONS.TRANSPORT_HISTORY]: { title: "Historial y reportes", desc: "Consultar historicos y filtros." },
  [PERMISSIONS.PAYROLL_MANAGE]: { title: "Nomina", desc: "Gestionar empleados y liquidaciones." },
  [PERMISSIONS.HIRING_MANAGE]: { title: "Contratacion", desc: "Gestionar vacantes, candidatos y contratos." },
  [PERMISSIONS.USERS_MANAGE]: { title: "Usuarios y permisos", desc: "Crear usuarios y administrar accesos." },
  [PERMISSIONS.NOTIFICATIONS_VIEW]: { title: "Notificaciones", desc: "Ver novedades del sistema." }
};

const VIEW_PERMISSIONS = {
  dashboard: PERMISSIONS.DASHBOARD_VIEW,
  requests: PERMISSIONS.CLIENT_REQUESTS,
  "transport-requests": PERMISSIONS.TRANSPORT_REQUESTS,
  "transport-trips": PERMISSIONS.TRANSPORT_TRIPS,
  "transport-vehicles": PERMISSIONS.TRANSPORT_VEHICLES,
  "transport-drivers": PERMISSIONS.TRANSPORT_DRIVERS,
  "transport-calendar": PERMISSIONS.TRANSPORT_CALENDAR,
  history: PERMISSIONS.TRANSPORT_HISTORY,
  payroll: PERMISSIONS.PAYROLL_MANAGE,
  hiring: PERMISSIONS.HIRING_MANAGE,
  "admin-users": PERMISSIONS.USERS_MANAGE,
  notifications: PERMISSIONS.NOTIFICATIONS_VIEW
};

const STATUS = {
  PENDIENTE: "Pendiente",
  VIAJE_ASIGNADO: "Viaje asignado",
  EN_TRANSITO: "En transito",
  ESPERA_STANDBY: "Espera standby",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  RECHAZADA: "Rechazada"
};

const STATUS_TRANSITIONS = {
  [STATUS.PENDIENTE]: [STATUS.VIAJE_ASIGNADO, STATUS.CANCELADA, STATUS.RECHAZADA],
  [STATUS.VIAJE_ASIGNADO]: [STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY, STATUS.CANCELADA],
  [STATUS.EN_TRANSITO]: [STATUS.ESPERA_STANDBY, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.ESPERA_STANDBY]: [STATUS.EN_TRANSITO, STATUS.COMPLETADA, STATUS.CANCELADA],
  [STATUS.COMPLETADA]: [],
  [STATUS.CANCELADA]: [],
  [STATUS.RECHAZADA]: []
};

const ACCOUNT_STATUS = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  RECHAZADO: "rechazado"
};

const PIPELINE = ["Recibido", "Preseleccionado", "Entrevistado", "Oferta enviada", "Contratado", "Descartado"];
const AUTO_APPROVE_MINUTES = 10;

let state = {
  session: null,
  currentView: "dashboard",
  authTab: "login",
  authSecurity: {
    failedAttempts: 0,
    lockUntil: 0
  },
  adminUsersUi: {
    panel: "",
    editUserId: ""
  }
};

const nodes = {
  openAuth: document.getElementById("open-auth"),
  openAuthHero: document.getElementById("open-auth-hero"),
  closeAuth: document.getElementById("close-auth"),
  authModal: document.getElementById("auth-modal"),
  authContent: document.getElementById("auth-content"),
  b2bForm: document.getElementById("b2b-form"),
  publicApp: document.getElementById("public-app"),
  portalApp: document.getElementById("portal-app"),
  sideLinks: [...document.querySelectorAll(".side-link")],
  logout: document.getElementById("logout"),
  viewTitle: document.getElementById("view-title"),
  viewRoot: document.getElementById("view-root"),
  kpiCards: document.getElementById("kpi-cards"),
  sessionMeta: document.getElementById("session-meta"),
  authTabs: [...document.querySelectorAll(".tab")]
};

function read(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (_error) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function hashPassword(raw) {
  const input = String(raw || "");
  if (!input) return "";
  if (input.startsWith("sha256:")) return input;
  if (!window.crypto?.subtle) return `sha256:${btoa(input)}`;
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hex = [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256:${hex}`;
}

async function verifyPassword(raw, storedHash) {
  if (!String(storedHash || "").startsWith("sha256:")) {
    return String(raw || "") === String(storedHash || "");
  }
  const hashed = await hashPassword(raw);
  return hashed === storedHash;
}

function passwordStrengthLabel(password) {
  const value = String(password || "");
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score <= 1) return "Baja";
  if (score <= 3) return "Media";
  return "Alta";
}

function readCounters() {
  return read(KEYS.counters, {});
}

function nextCounter(prefix) {
  const counters = readCounters();
  const current = Number(counters[prefix] || 0) + 1;
  counters[prefix] = current;
  write(KEYS.counters, counters);
  return current;
}

function makeRequestNumber() {
  const value = String(nextCounter("request")).padStart(6, "0");
  return `SOL-${value}`;
}

function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CO");
}

function toInputDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function slugStatus(value) {
  return value.toLowerCase().replaceAll(" ", "_");
}

function saveNotification({ userId, title, body }) {
  const all = read(KEYS.notifications, []);
  all.unshift({ id: uid(), userId, title, body, createdAt: nowIso(), readAt: null });
  write(KEYS.notifications, all);
}

function sendEmail({ to, subject, body }) {
  const outbox = read(KEYS.emails, []);
  outbox.unshift({ id: uid(), to, subject, body, createdAt: nowIso() });
  write(KEYS.emails, outbox);
}

function findOrCreateCompanyIdByName(name) {
  const companyName = String(name || "").trim();
  if (!companyName) return null;
  const companies = read(KEYS.companies, []);
  const existing = companies.find(
    (item) => item.name.toLowerCase() === companyName.toLowerCase()
  );
  if (existing) return existing.id;
  const company = {
    id: uid(),
    name: companyName,
    taxId: "",
    phone: "",
    createdAt: nowIso()
  };
  companies.push(company);
  write(KEYS.companies, companies);
  return company.id;
}

function getCompanyById(companyId) {
  return read(KEYS.companies, []).find((item) => item.id === companyId) || null;
}

function ensureCompaniesAndUserMapping() {
  const companies = read(KEYS.companies, []);
  const users = read(KEYS.users, []);

  let nextCompanies = [...companies];
  if (!nextCompanies.length) {
    nextCompanies = [
      {
        id: uid(),
        name: "Antares",
        taxId: "900000001-0",
        phone: "3001111111",
        createdAt: nowIso()
      },
      {
        id: uid(),
        name: "Flora Export SAS",
        taxId: "901000222-1",
        phone: "3003333333",
        createdAt: nowIso()
      }
    ];
    write(KEYS.companies, nextCompanies);
  }

  const companyByName = (name) =>
    nextCompanies.find(
      (company) => company.name.toLowerCase() === String(name || "").toLowerCase()
    );

  const mappedUsers = users.map((user) => {
    if (user.companyId) return user;
    const existing = companyByName(user.company);
    if (existing) return { ...user, companyId: existing.id };
    const created = {
      id: uid(),
      name: user.company || "Empresa sin nombre",
      taxId: user.taxId || "",
      phone: user.phone || "",
      createdAt: nowIso()
    };
    nextCompanies.push(created);
    return { ...user, companyId: created.id };
  });

  write(KEYS.companies, nextCompanies);
  write(KEYS.users, mappedUsers);
}

function ensureRequestsCompanyMapping() {
  const users = read(KEYS.users, []);
  const requests = read(KEYS.requests, []);
  const mapped = requests.map((request) => {
    if (request.clientCompanyId) return request;
    const owner = users.find((user) => user.id === request.clientUserId);
    return {
      ...request,
      clientCompanyId: owner?.companyId || null,
      requestedByName: request.requestedByName || owner?.name || request.clientName
    };
  });
  write(KEYS.requests, mapped);
}

function ensureRequestAndTripIdentifiers() {
  const requests = read(KEYS.requests, []);
  let changed = false;
  const mapped = requests.map((request) => {
    const next = { ...request };
    if (!next.requestNumber) {
      next.requestNumber = makeRequestNumber();
      changed = true;
    }
    if (next.trip && !next.trip.tripNumber) {
      next.trip = { ...next.trip, tripNumber: makeTripNumber() };
      changed = true;
    }
    return next;
  });
  if (changed) write(KEYS.requests, mapped);
}

function defaultPermissionsForRole(role) {
  if (role === ROLES.ADMIN) return [...ALL_PERMISSIONS];
  if (role === ROLES.RRHH) {
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PAYROLL_MANAGE,
      PERMISSIONS.HIRING_MANAGE,
      PERMISSIONS.NOTIFICATIONS_VIEW
    ];
  }
  return [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CLIENT_REQUESTS,
    PERMISSIONS.NOTIFICATIONS_VIEW
  ];
}

function ensureUsersPermissions() {
  const users = read(KEYS.users, []);
  const updated = users.map((user) => {
    const current = Array.isArray(user.permissions) ? user.permissions : [];
    const base = defaultPermissionsForRole(user.role);
    const merged = [...new Set([...base, ...current])].filter((permission) =>
      ALL_PERMISSIONS.includes(permission)
    );
    return { ...user, permissions: merged };
  });
  write(KEYS.users, updated);
}

function ensureUsersAccountStatus() {
  const users = read(KEYS.users, []);
  let changed = false;
  const updated = users.map((user) => {
    if (user.accountStatus) return user;
    changed = true;
    return { ...user, accountStatus: ACCOUNT_STATUS.APROBADO };
  });
  if (changed) write(KEYS.users, updated);
}

function seed() {
  if (!localStorage.getItem(KEYS.companies)) {
    write(KEYS.companies, [
      {
        id: uid(),
        name: "Antares",
        taxId: "900000001-0",
        phone: "3001111111",
        createdAt: nowIso()
      },
      {
        id: uid(),
        name: "Flora Export SAS",
        taxId: "901000222-1",
        phone: "3003333333",
        createdAt: nowIso()
      }
    ]);
  }

  const seededCompanies = read(KEYS.companies, []);
  const antaresCompany = seededCompanies.find((c) => c.name === "Antares");
  const floraCompany = seededCompanies.find((c) => c.name === "Flora Export SAS");

  if (!localStorage.getItem(KEYS.users)) {
    write(KEYS.users, [
      {
        id: uid(),
        name: "Admin Antares",
        email: "admin@antares.com",
        password: "admin123",
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        permissions: defaultPermissionsForRole(ROLES.ADMIN),
        company: "Antares",
        companyId: antaresCompany?.id || null,
        taxId: "900000001-0",
        phone: "3001111111"
      },
      {
        id: uid(),
        name: "RRHH Antares",
        email: "rrhh@antares.com",
        password: "rrhh123",
        role: ROLES.RRHH,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        permissions: defaultPermissionsForRole(ROLES.RRHH),
        company: "Antares",
        companyId: antaresCompany?.id || null,
        taxId: "900000001-0",
        phone: "3002222222"
      },
      {
        id: uid(),
        name: "Cliente Demo",
        email: "cliente@antares.com",
        password: "cliente123",
        role: ROLES.CLIENT,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        permissions: defaultPermissionsForRole(ROLES.CLIENT),
        company: "Flora Export SAS",
        companyId: floraCompany?.id || null,
        taxId: "901000222-1",
        phone: "3003333333"
      }
    ]);
  }

  if (!localStorage.getItem(KEYS.vehicles)) {
    write(KEYS.vehicles, [
      { id: uid(), plate: "TRB123", type: "Turbo", capacityKg: 3500, refrigerated: true, available: true },
      { id: uid(), plate: "CMN456", type: "Camion", capacityKg: 8000, refrigerated: true, available: true },
      { id: uid(), plate: "TRC789", type: "Tractocamion", capacityKg: 30000, refrigerated: true, available: true }
    ]);
  }

  if (!localStorage.getItem(KEYS.drivers)) {
    write(KEYS.drivers, [
      { id: uid(), name: "Juan Perez", phone: "3010000001", license: "C3", available: true },
      { id: uid(), name: "Maria Gomez", phone: "3010000002", license: "C2", available: true },
      { id: uid(), name: "Carlos Ruiz", phone: "3010000003", license: "C3", available: true }
    ]);
  }

  [
    KEYS.companies,
    KEYS.counters,
    KEYS.contacts,
    KEYS.requests,
    KEYS.notifications,
    KEYS.emails,
    KEYS.payrollEmployees,
    KEYS.payrollRuns,
    KEYS.vacancies,
    KEYS.candidates,
    KEYS.interviews,
    KEYS.contracts
  ].forEach((key) => {
    if (!localStorage.getItem(key)) write(key, []);
  });

  ensureCompaniesAndUserMapping();
  ensureRequestsCompanyMapping();
  ensureRequestAndTripIdentifiers();
  ensureUsersPermissions();
  ensureUsersAccountStatus();
}

function getSession() {
  return read(KEYS.session, null);
}

function setSession(sessionData) {
  write(KEYS.session, sessionData);
  state.session = sessionData;
}

function clearSession() {
  localStorage.removeItem(KEYS.session);
  state.session = null;
}

function buildToken(user) {
  const nonce = crypto.getRandomValues(new Uint32Array(2)).join("");
  return btoa(`${user.id}.${user.role}.${Date.now()}.${nonce}`);
}

async function ensureUsersPasswordHashing() {
  const users = read(KEYS.users, []);
  let changed = false;
  const secured = [];
  for (const user of users) {
    if (String(user.password || "").startsWith("sha256:")) {
      secured.push(user);
      continue;
    }
    changed = true;
    secured.push({ ...user, password: await hashPassword(user.password) });
  }
  if (changed) write(KEYS.users, secured);
}

function authView() {
  const tab = state.authTab;
  if (tab === "login") {
    return `
      <form id="form-login" class="form-grid auth-form">
        <label class="full">Correo corporativo <input type="email" name="email" autocomplete="username" required /></label>
        <label class="full">Contrasena
          <div class="password-field">
            <input type="password" name="password" autocomplete="current-password" required />
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="login">Mostrar</button>
          </div>
        </label>
        <button class="btn btn-primary full" type="submit">Ingresar de forma segura</button>
      </form>
      <p class="muted auth-help">Usa tu correo y contrasena. Evita ingresar desde equipos compartidos.</p>
    `;
  }

  if (tab === "register") {
    return `
      <form id="form-register" class="form-grid auth-form">
        <label>Nombre <input name="name" required /></label>
        <label>Empresa <input name="company" required /></label>
        <label>NIT/RUT <input name="taxId" required /></label>
        <label>Cargo <input name="position" required /></label>
        <label>Telefono <input name="phone" required /></label>
        <label>Correo <input type="email" name="email" autocomplete="username" required /></label>
        <label class="full">Contrasena
          <div class="password-field">
            <input type="password" minlength="8" name="password" autocomplete="new-password" required />
            <button type="button" class="btn btn-action btn-sm" data-action="toggle-password" data-target="register">Mostrar</button>
          </div>
          <small id="password-strength" class="muted">Seguridad: Baja</small>
        </label>
        <button class="btn btn-primary full" type="submit">Crear cuenta cliente</button>
      </form>
    `;
  }

  return `
    <form id="form-recover" class="form-grid">
      <label class="full">Correo registrado <input type="email" name="email" required /></label>
      <button class="btn btn-primary full" type="submit">Enviar recuperacion</button>
    </form>
  `;
}

function showAuth() {
  nodes.authModal.classList.remove("hidden");
  renderAuthTab();
}

function hideAuth() {
  nodes.authModal.classList.add("hidden");
}

function renderAuthTab() {
  nodes.authTabs.forEach((tabBtn) => {
    tabBtn.classList.toggle("active", tabBtn.dataset.tab === state.authTab);
  });
  nodes.authContent.innerHTML = authView();
  bindAuthForms();
}

function bindAuthForms() {
  const login = document.getElementById("form-login");
  const register = document.getElementById("form-register");
  const recover = document.getElementById("form-recover");
  const togglePassword = document.querySelectorAll("[data-action='toggle-password']");
  togglePassword.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetForm = String(btn.dataset.target || "");
      const input = targetForm === "register"
        ? register?.querySelector("input[name='password']")
        : login?.querySelector("input[name='password']");
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      btn.textContent = visible ? "Mostrar" : "Ocultar";
    });
  });

  if (login) {
    login.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (Date.now() < state.authSecurity.lockUntil) {
        const secs = Math.ceil((state.authSecurity.lockUntil - Date.now()) / 1000);
        alert(`Demasiados intentos. Intenta nuevamente en ${secs} segundos.`);
        return;
      }
      const data = Object.fromEntries(new FormData(login).entries());
      const users = read(KEYS.users, []);
      const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(data.email));
      const valid = user ? await verifyPassword(String(data.password || ""), user.password) : false;
      if (!valid || !user) {
        state.authSecurity.failedAttempts += 1;
        if (state.authSecurity.failedAttempts >= 5) {
          state.authSecurity.lockUntil = Date.now() + 60_000;
          state.authSecurity.failedAttempts = 0;
        }
        alert("Credenciales invalidas.");
        return;
      }
      state.authSecurity.failedAttempts = 0;
      state.authSecurity.lockUntil = 0;
      if (user.accountStatus === ACCOUNT_STATUS.PENDIENTE) {
        alert("Tu cuenta aun esta pendiente de aprobacion por un administrador. Te notificaremos por correo cuando sea aprobada.");
        return;
      }
      if (user.accountStatus === ACCOUNT_STATUS.RECHAZADO) {
        alert("Tu solicitud de registro fue rechazada. Contacta a soporte para mas informacion.");
        return;
      }
      setSession({ userId: user.id, role: user.role, token: buildToken(user) });
      hideAuth();
      renderPortal();
    });
  }

  if (register) {
    const regPass = register.querySelector("input[name='password']");
    const strength = register.querySelector("#password-strength");
    if (regPass && strength) {
      regPass.addEventListener("input", () => {
        strength.textContent = `Seguridad: ${passwordStrengthLabel(regPass.value)}`;
      });
    }
    register.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(register).entries());
      if (!/^\d/.test(String(data.taxId)) && !String(data.taxId).includes("-")) {
        alert("NIT/RUT invalido.");
        return;
      }
      if (String(data.password || "").length < 8) {
        alert("La contrasena debe tener minimo 8 caracteres.");
        return;
      }
      const users = read(KEYS.users, []);
      if (users.some((u) => normalizeEmail(u.email) === normalizeEmail(data.email))) {
        alert("El correo ya existe.");
        return;
      }
      const companyId = findOrCreateCompanyIdByName(data.company);
      const newUser = {
        id: uid(),
        ...data,
        email: normalizeEmail(data.email),
        password: await hashPassword(data.password),
        role: ROLES.CLIENT,
        accountStatus: ACCOUNT_STATUS.PENDIENTE,
        companyId,
        permissions: defaultPermissionsForRole(ROLES.CLIENT),
        registeredAt: nowIso()
      };
      users.push(newUser);
      write(KEYS.users, users);
      sendEmail({
        to: data.email,
        subject: "Registro recibido - Antares Portal",
        body: "Tu solicitud de registro fue recibida. Un administrador revisara tu cuenta y te notificaremos cuando sea aprobada."
      });
      const adminUsers = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
      adminUsers.forEach((admin) => {
        saveNotification({
          userId: admin.id,
          title: "Nuevo registro de cliente pendiente",
          body: `${data.name} de ${data.company} solicita acceso al portal.`
        });
        sendEmail({
          to: admin.email,
          subject: "Nuevo registro de cliente pendiente de aprobacion",
          body: `Cliente: ${data.name} | Empresa: ${data.company} | Correo: ${data.email}`
        });
      });
      alert("Registro enviado. Tu cuenta sera revisada por un administrador antes de poder acceder. Te notificaremos por correo.");
      state.authTab = "login";
      renderAuthTab();
    });
  }

  if (recover) {
    recover.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(recover).entries());
      const users = read(KEYS.users, []);
      const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(data.email));
      if (!user) {
        alert("No existe usuario con ese correo.");
        return;
      }
      sendEmail({
        to: user.email,
        subject: "Recuperacion de contrasena",
        body: `Hola ${user.name}, se solicito recuperacion de acceso. Por seguridad, solicita a un administrador restablecer tu contrasena.`
      });
      alert("Solicitud enviada. Un administrador debe ayudarte a restablecer el acceso.");
    });
  }
}

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function diffMinutes(fromIso) {
  return (Date.now() - new Date(fromIso).getTime()) / 60000;
}

function isSameHourSlot(a, b) {
  const first = new Date(a);
  const second = new Date(b);
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate() &&
    first.getHours() === second.getHours()
  );
}

function activeTripStatuses() {
  return [STATUS.VIAJE_ASIGNADO, STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY];
}

function getActiveTrips() {
  const requests = read(KEYS.requests, []);
  return requests.filter((r) => r.trip && activeTripStatuses().includes(r.status));
}

function canTransitionStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

function applyStandbyCharge(request, actorName) {
  const hoursRaw = prompt("Horas en standby:", "1");
  if (!hoursRaw) return null;
  const rateRaw = prompt("Valor por hora standby:", "50000");
  if (!rateRaw) return null;
  const hours = Math.max(1, parseNum(hoursRaw));
  const rate = Math.max(0, parseNum(rateRaw));
  const value = hours * rate;
  const currentTotal = parseNum(request.standbyChargeTotal);
  const event = {
    id: uid(),
    hours,
    rate,
    value,
    createdAt: nowIso(),
    createdBy: actorName
  };
  return {
    standbyChargeTotal: currentTotal + value,
    standbyEvents: [...(request.standbyEvents || []), event]
  };
}

function transitionRequestStatus(requestId, nextStatus, actorName = "Sistema") {
  const requests = read(KEYS.requests, []);
  const target = requests.find((request) => request.id === requestId);
  if (!target) return false;

  if (!canTransitionStatus(target.status, nextStatus)) {
    alert(`Transición no permitida: ${target.status} -> ${nextStatus}`);
    return false;
  }

  let extra = {};
  if (nextStatus === STATUS.ESPERA_STANDBY) {
    const standbyData = applyStandbyCharge(target, actorName);
    if (!standbyData) return false;
    extra = standbyData;
  }

  const updated = requests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status: nextStatus,
          ...extra,
          deliveredAt: nextStatus === STATUS.COMPLETADA ? nowIso() : request.deliveredAt,
          trip: request.trip
            ? {
                ...request.trip,
                realtimeStatus: nextStatus
              }
            : request.trip
        }
      : request
  );
  write(KEYS.requests, updated);
  return true;
}

function isVehicleBusyAtHour(vehicle, pickupAt, currentRequestId = null) {
  return getActiveTrips().some((request) => {
    if (currentRequestId && request.id === currentRequestId) return false;
    const sameHour = isSameHourSlot(request.trip.etaPickup, pickupAt);
    if (!sameHour) return false;
    return request.trip.vehicleId
      ? request.trip.vehicleId === vehicle.id
      : request.trip.vehiclePlate === vehicle.plate;
  });
}

function isDriverBusyAtHour(driver, pickupAt, currentRequestId = null) {
  return getActiveTrips().some((request) => {
    if (currentRequestId && request.id === currentRequestId) return false;
    const sameHour = isSameHourSlot(request.trip.etaPickup, pickupAt);
    if (!sameHour) return false;
    return request.trip.driverId
      ? request.trip.driverId === driver.id
      : request.trip.driverName === driver.name;
  });
}

function selectBestVehicle(requiredType, weight, pickupAt, currentRequestId = null) {
  const vehicles = read(KEYS.vehicles, []);
  const filtered = vehicles.filter(
    (v) =>
      v.available &&
      (!requiredType || v.type === requiredType) &&
      !isVehicleBusyAtHour(v, pickupAt, currentRequestId)
  );
  const pick =
    filtered.find((v) => v.capacityKg >= weight) ||
    filtered[0] ||
    vehicles.find((v) => v.available && !isVehicleBusyAtHour(v, pickupAt, currentRequestId)) ||
    null;
  return pick || null;
}

function selectDriver(pickupAt, currentRequestId = null) {
  const drivers = read(KEYS.drivers, []);
  return (
    drivers.find((d) => d.available && !isDriverBusyAtHour(d, pickupAt, currentRequestId)) ||
    null
  );
}

function makeTripNumber() {
  const value = String(nextCounter("trip")).padStart(6, "0");
  return `VIA-${value}`;
}

function setVehicleAvailability(vehicleId, available) {
  const vehicles = read(KEYS.vehicles, []);
  const next = vehicles.map((v) => (v.id === vehicleId ? { ...v, available } : v));
  write(KEYS.vehicles, next);
}

function setDriverAvailability(driverId, available) {
  const drivers = read(KEYS.drivers, []);
  const next = drivers.map((d) => (d.id === driverId ? { ...d, available } : d));
  write(KEYS.drivers, next);
}

function approveRequest(requestId, actorName = "Sistema", auto = false) {
  const requests = read(KEYS.requests, []);
  const current = requests.find((r) => r.id === requestId);
  if (!current || current.status !== STATUS.PENDIENTE) return;

  const vehicle = selectBestVehicle(
    current.vehicleType,
    parseNum(current.weightKg),
    current.pickupAt,
    requestId
  );
  const driver = selectDriver(current.pickupAt, requestId);

  if (!vehicle || !driver) {
    alert("No hay conductor o camión disponible para esa misma hora.");
    return;
  }

  const trip = {
    id: uid(),
    tripNumber: makeTripNumber(),
    vehicleId: vehicle.id,
    vehiclePlate: vehicle ? vehicle.plate : "SIN-DISP",
    vehicleType: vehicle ? vehicle.type : current.vehicleType,
    driverId: driver.id,
    driverName: driver ? driver.name : "Por definir",
    driverPhone: driver ? driver.phone : "-",
    route: `${current.originCity} -> ${current.destinationCity}`,
    etaPickup: current.pickupAt,
    etaDelivery: current.etaDelivery || current.pickupAt,
    realtimeStatus: STATUS.VIAJE_ASIGNADO
  };

  const next = requests.map((r) =>
    r.id === requestId
      ? {
          ...r,
          status: STATUS.VIAJE_ASIGNADO,
          approvedAt: nowIso(),
          approvedBy: actorName,
          autoApproved: auto,
          rejectionReason: "",
          trip
        }
      : r
  );
  write(KEYS.requests, next);

  const users = read(KEYS.users, []);
  const target = users.find((u) => u.id === current.clientUserId);
  if (target) {
    saveNotification({
      userId: target.id,
      title: "Solicitud aprobada",
      body: `Tu solicitud ${current.id} fue aprobada${auto ? " automaticamente" : ""}. Viaje ${trip.tripNumber}.`
    });
    sendEmail({
      to: target.email,
      subject: "Solicitud aprobada",
      body: `Viaje ${trip.tripNumber} - Vehiculo ${trip.vehiclePlate} - Conductor ${trip.driverName}`
    });
  }
}

function rejectRequest(requestId, reason, actorName) {
  const requests = read(KEYS.requests, []);
  const current = requests.find((r) => r.id === requestId);
  if (!current) return;
  const next = requests.map((r) =>
    r.id === requestId
      ? { ...r, status: STATUS.RECHAZADA, approvedAt: nowIso(), approvedBy: actorName, rejectionReason: reason }
      : r
  );
  write(KEYS.requests, next);

  const user = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
  if (user) {
    saveNotification({ userId: user.id, title: "Solicitud rechazada", body: `Motivo: ${reason}` });
    sendEmail({ to: user.email, subject: "Solicitud rechazada", body: reason });
  }
}

function updateAutoApprove() {
  const requests = read(KEYS.requests, []);
  requests
    .filter((r) => r.status === STATUS.PENDIENTE)
    .forEach((r) => {
      if (diffMinutes(r.createdAt) >= AUTO_APPROVE_MINUTES) {
        approveRequest(r.id, "Sistema", true);
      }
    });
}

function minutesRemaining(createdAt) {
  const left = AUTO_APPROVE_MINUTES - diffMinutes(createdAt);
  return Math.max(0, Math.ceil(left));
}

function currentUser() {
  const users = read(KEYS.users, []);
  return users.find((u) => u.id === state.session?.userId) || null;
}

function getVisibleRequestsForUser(user) {
  const requests = read(KEYS.requests, []);
  if (!user) return [];
  if (user.role === ROLES.ADMIN) return requests;
  return requests.filter((request) => request.clientCompanyId === user.companyId);
}

function hasPermission(user, permission) {
  if (!permission) return true;
  if (user?.role === ROLES.ADMIN) return true;
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.includes(permission);
}

function canAccessView(user, view) {
  return hasPermission(user, VIEW_PERMISSIONS[view]);
}

function canAccessRRHH(role) {
  return role === ROLES.ADMIN || role === ROLES.RRHH;
}

function isViewAllowedForUser(user, view) {
  if (!user || !canAccessView(user, view)) return false;
  if (view === "requests") return user.role === ROLES.CLIENT;
  if (["transport-requests", "transport-trips", "transport-vehicles", "transport-drivers", "transport-calendar", "history", "admin-users"].includes(view)) {
    return user.role === ROLES.ADMIN;
  }
  if (["payroll", "hiring"].includes(view)) return canAccessRRHH(user.role);
  return true;
}

function viewFromPortalHash() {
  const hash = String(window.location.hash || "");
  if (!hash.startsWith("#portal/")) return "";
  const view = hash.slice("#portal/".length).trim();
  return VIEW_PERMISSIONS[view] ? view : "";
}

function syncPortalHash(view) {
  const safeView = VIEW_PERMISSIONS[view] ? view : "dashboard";
  const nextHash = `#portal/${safeView}`;
  if (window.location.hash !== nextHash) {
    history.replaceState(null, "", nextHash);
  }
}

function enforcePortalViewFromUrl(user) {
  if (!state.session || !user) return;
  const candidate = viewFromPortalHash();
  if (!candidate) {
    syncPortalHash(state.currentView || "dashboard");
    return;
  }
  if (!isViewAllowedForUser(user, candidate)) {
    state.currentView = "dashboard";
    syncPortalHash("dashboard");
    alert("Ruta no autorizada. Se redirigio al dashboard.");
    return;
  }
  state.currentView = candidate;
}

function setView(view) {
  const user = currentUser();
  if (!user) return;
  if (!isViewAllowedForUser(user, view)) {
    alert("No tienes permisos para acceder a este módulo.");
    return;
  }
  state.currentView = view;
  syncPortalHash(view);
  nodes.sideLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });
  renderPortalView();
}

function renderPortal() {
  const session = getSession();
  if (!session) {
    nodes.publicApp.classList.remove("hidden");
    nodes.portalApp.classList.add("hidden");
    return;
  }
  state.session = session;
  nodes.publicApp.classList.add("hidden");
  nodes.portalApp.classList.remove("hidden");
  const user = currentUser();
  if (!user) {
    clearSession();
    renderPortal();
    return;
  }

  nodes.sessionMeta.textContent = `${user.name} - ${user.role.toUpperCase()}`;
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
  renderKpis();
  enforcePortalViewFromUrl(user);
  if (!isViewAllowedForUser(user, state.currentView)) {
    state.currentView = "dashboard";
    syncPortalHash("dashboard");
  }
  renderPortalView();
}

function renderKpis() {
  const user = currentUser();
  const visible = getVisibleRequestsForUser(user);
  const cards = [
    { label: "Pendientes", value: visible.filter((r) => r.status === STATUS.PENDIENTE).length, icon: IC.clock, color: "kpi-icon-warning" },
    { label: "Viaje asignado", value: visible.filter((r) => r.status === STATUS.VIAJE_ASIGNADO).length, icon: IC.check, color: "kpi-icon-success" },
    { label: "En transito", value: visible.filter((r) => r.status === STATUS.EN_TRANSITO).length, icon: IC.truck, color: "kpi-icon-primary" },
    { label: "Completadas", value: visible.filter((r) => r.status === STATUS.COMPLETADA).length, icon: IC.shield, color: "kpi-icon-teal" }
  ];
  nodes.kpiCards.innerHTML = cards.map((c) => `
    <article class="kpi">
      <div class="kpi-icon ${c.color}">${c.icon}</div>
      <div class="kpi-data"><span>${c.label}</span><b>${c.value}</b></div>
    </article>
  `).join("");
}

function viewDashboard() {
  const user = currentUser();
  const list = getVisibleRequestsForUser(user);
  const byVehicle = {};
  list.forEach((r) => {
    const key = r.vehicleType || "Sin tipo";
    byVehicle[key] = (byVehicle[key] || 0) + 1;
  });
  const colors = { Turbo: "#F59F00", Camion: "#1565C0", Tractocamion: "#1B8E5F", "Sin tipo": "#94A3B8" };
  const vehicleStats = Object.entries(byVehicle)
    .map(([k, v]) => `<div class="dash-stat-row"><div class="dash-stat-label"><span class="dash-stat-dot" style="background:${colors[k] || '#94A3B8'}"></span>${k}</div><div class="dash-stat-value">${v}</div></div>`)
    .join("");

  const byStatus = {};
  list.forEach((r) => { byStatus[r.status] = (byStatus[r.status] || 0) + 1; });
  const statusStats = Object.entries(byStatus)
    .map(([k, v]) => `<div class="dash-stat-row"><div class="dash-stat-label"><span class="status status-${slugStatus(k)}">${k}</span></div><div class="dash-stat-value">${v}</div></div>`)
    .join("");

  return `<div class="dash-grid">
    ${pcardWrap("truck", "Por tipo de vehiculo", list.length + " solicitudes registradas", vehicleStats || emptyState("Sin datos de vehiculos aun"))}
    ${pcardWrap("activity", "Por estado", "Distribucion de solicitudes", statusStats || emptyState("Sin solicitudes aun"))}
  </div>`;
}

function requestFormHtml() {
  const body = `<form id="form-request" class="p-form">
    <label>Origen ciudad <input name="originCity" required /></label>
    <label>Origen direccion <input name="originAddress" required /></label>
    <label>Punto cargue <input name="originPoint" required /></label>
    <label>Destino ciudad <input name="destinationCity" required /></label>
    <label>Destino direccion <input name="destinationAddress" required /></label>
    <label>Punto descargue <input name="destinationPoint" required /></label>
    <label>Recogida estimada <input type="datetime-local" name="pickupAt" required /></label>
    <label>Tipo vehiculo <select name="vehicleType" required><option value="">Seleccione...</option><option>Turbo</option><option>Camion</option><option>Tractocamion</option></select></label>
    <label>Descripcion carga <input name="cargoDescription" required /></label>
    <label>Volumen cajas <input type="number" min="0" name="boxes" required /></label>
    <label>Peso kg <input type="number" min="0" name="weightKg" required /></label>
    <label>Temperatura requerida <input name="temperature" placeholder="Ej: 4C" /></label>
    <label class="full">Observaciones <textarea name="notes" rows="3"></textarea></label>
    <label class="full">Adjuntos opcionales <input type="file" name="attachments" multiple /></label>
    <button class="btn btn-primary full" type="submit">${IC.send} Crear solicitud</button>
  </form>`;
  return pcardWrap("plus", "Nueva solicitud de viaje", "Completa los datos para solicitar transporte", body);
}

function requestListClientHtml(user) {
  const requests = getVisibleRequestsForUser(user);
  const rows = requests
    .map((r) => {
      const allowEdit = r.status === STATUS.PENDIENTE;
      const trip = r.trip
        ? `<strong>${r.trip.tripNumber}</strong><br><span class="muted">${r.trip.vehiclePlate} · ${r.trip.driverName}</span>`
        : '<span class="muted">-</span>';
      return `<tr>
        <td><strong>${r.requestNumber || r.id}</strong></td>
        <td>${r.originCity} → ${r.destinationCity}<br><span class="muted">${r.requestedByName || r.clientName}</span></td>
        <td><span class="status status-${slugStatus(r.status)}">${r.status}</span></td>
        <td>${trip}</td>
        <td><div class="toolbar">
          <button class="btn btn-sm btn-action" data-action="detail" data-id="${r.id}">${IC.eye} Ver</button>
          ${allowEdit ? `<button class="btn btn-sm btn-action" data-action="edit" data-id="${r.id}">${IC.edit} Editar</button>` : ""}
          ${allowEdit ? `<button class="btn btn-sm btn-reject" data-action="cancel" data-id="${r.id}">${IC.x} Cancelar</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Viaje</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("Aun no hay solicitudes creadas.");
  return pcardWrap("file", "Mis solicitudes", requests.length + " registradas", body);
}

function adminQueueHtml() {
  const requests = read(KEYS.requests, []).filter((r) => r.status === STATUS.PENDIENTE);
  const rows = requests
    .map((r) => `<tr>
      <td><strong>${r.requestNumber || r.id}</strong></td>
      <td>${r.clientName}</td>
      <td>${r.originCity} → ${r.destinationCity}</td>
      <td>${r.vehicleType}</td>
      <td><span class="timer-badge">${IC.clock} ${minutesRemaining(r.createdAt)} min</span></td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-approve" data-action="approve" data-id="${r.id}">${IC.check} Aprobar</button>
        <button class="btn btn-sm btn-reject" data-action="reject" data-id="${r.id}">${IC.x} Rechazar</button>
        <button class="btn btn-sm btn-action" data-action="edit-admin" data-id="${r.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-action" data-action="delete-admin" data-id="${r.id}">${IC.trash} Eliminar</button>
      </div></td>
    </tr>`)
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Solicitud</th><th>Cliente</th><th>Ruta</th><th>Vehiculo</th><th>Timer</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay solicitudes pendientes.");
  return pcardWrap("inbox", "Bandeja de pendientes", requests.length + " solicitudes por revisar", body, requests.length > 0 ? "p-card-alert" : "");
}

function vehiclesHtml() {
  const vehicles = read(KEYS.vehicles, []);
  const rows = vehicles
    .map((v) => `<tr>
      <td><strong>${v.plate}</strong></td>
      <td>${v.type}</td>
      <td>${v.capacityKg.toLocaleString("es-CO")} kg</td>
      <td>${v.refrigerated ? '<span class="status status-viaje_asignado">Si</span>' : '<span class="status status-espera_standby">No</span>'}</td>
      <td>${v.available ? '<span class="status status-viaje_asignado">Disponible</span>' : '<span class="status status-rechazada">Ocupado</span>'}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-action" data-action="edit-vehicle" data-id="${v.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-action" data-action="toggle-vehicle" data-id="${v.id}">${IC.toggle} Estado</button>
      </div></td>
    </tr>`)
    .join("");
  const formBody = `<form id="form-vehicle" class="p-form">
    <label>Placa <input name="plate" required /></label>
    <label>Tipo <select name="type" required><option>Turbo</option><option>Camion</option><option>Tractocamion</option></select></label>
    <label>Capacidad kg <input type="number" min="1" name="capacityKg" required /></label>
    <label>Refrigerado <select name="refrigerated"><option value="true">Si</option><option value="false">No</option></select></label>
    <button class="btn btn-primary full" type="submit">${IC.plus} Agregar vehiculo</button>
  </form>`;
  const tableBody = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Placa</th><th>Tipo</th><th>Capacidad</th><th>Refrigerado</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay vehiculos registrados.");
  return pcardWrap("plus", "Registrar vehiculo", null, formBody) + pcardWrap("truck", "Flota de camiones", vehicles.length + " vehiculos", tableBody);
}

function driversHtml() {
  const drivers = read(KEYS.drivers, []);
  const rows = drivers
    .map((d) => `<tr>
      <td><strong>${d.name}</strong></td>
      <td>${d.phone}</td>
      <td>${d.license}</td>
      <td>${d.available ? '<span class="status status-viaje_asignado">Disponible</span>' : '<span class="status status-rechazada">Ocupado</span>'}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-action" data-action="edit-driver" data-id="${d.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-action" data-action="toggle-driver" data-id="${d.id}">${IC.toggle} Estado</button>
      </div></td>
    </tr>`)
    .join("");
  const formBody = `<form id="form-driver" class="p-form">
    <label>Nombre <input name="name" required /></label>
    <label>Telefono <input name="phone" required /></label>
    <label>Licencia <input name="license" required /></label>
    <button class="btn btn-primary full" type="submit">${IC.userPlus} Agregar conductor</button>
  </form>`;
  const tableBody = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Telefono</th><th>Licencia</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay conductores registrados.");
  return pcardWrap("userPlus", "Registrar conductor", null, formBody) + pcardWrap("user", "Conductores", drivers.length + " registrados", tableBody);
}

function transportTripsHtml() {
  const trips = read(KEYS.requests, []).filter((r) => r.trip);
  const rows = trips
    .map((r) => `<tr>
      <td><strong>${r.trip.tripNumber}</strong></td>
      <td>${r.requestNumber || r.id}</td>
      <td>${r.clientName}</td>
      <td>${r.originCity} → ${r.destinationCity}</td>
      <td>${r.trip.vehiclePlate}</td>
      <td>${r.trip.driverName}</td>
      <td>${fmtDate(r.trip.etaPickup)}</td>
      <td><span class="status status-${slugStatus(r.status)}">${r.status}</span>${parseNum(r.standbyChargeTotal) > 0 ? `<br><span class="muted" style="font-size:0.78rem">Standby: $${parseNum(r.standbyChargeTotal).toLocaleString("es-CO")}</span>` : ""}</td>
      <td><select data-action="trip-status" data-id="${r.id}" style="padding:0.4rem 0.6rem;border-radius:8px;border:1px solid var(--line);font-size:0.82rem">
        ${[STATUS.VIAJE_ASIGNADO,STATUS.EN_TRANSITO,STATUS.ESPERA_STANDBY,STATUS.COMPLETADA,STATUS.CANCELADA].map((s) => `<option ${r.status === s ? "selected" : ""}>${s}</option>`).join("")}
      </select></td>
    </tr>`)
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Viaje</th><th>Solicitud</th><th>Cliente</th><th>Ruta</th><th>Camion</th><th>Conductor</th><th>Hora</th><th>Estado</th><th>Actualizar</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay viajes asignados.");
  return pcardWrap("compass", "Viajes activos", trips.length + " viajes", body);
}

function transportCalendarHtml() {
  const requests = read(KEYS.requests, [])
    .filter((r) => r.trip)
    .sort((a, b) => new Date(a.trip.etaPickup).getTime() - new Date(b.trip.etaPickup).getTime());
  const rows = requests
    .map((r) => `<tr>
      <td><strong>${new Date(r.trip.etaPickup).toLocaleDateString("es-CO")}</strong></td>
      <td>${new Date(r.trip.etaPickup).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</td>
      <td>${r.trip.driverName}</td>
      <td>${r.trip.vehiclePlate}</td>
      <td>${r.trip.route}</td>
      <td><span class="status status-${slugStatus(r.status)}">${r.status}</span></td>
    </tr>`)
    .join("");
  const body = rows
    ? `<p class="muted" style="margin:0 0 0.8rem">Un conductor y un camion no se pueden asignar a dos viajes en la misma hora.</p><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Hora</th><th>Conductor</th><th>Camion</th><th>Ruta</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No hay programacion registrada.");
  return pcardWrap("calendar", "Calendario de programacion", requests.length + " viajes programados", body);
}

function adminUsersHtml(current) {
  const users = read(KEYS.users, []);
  const companies = read(KEYS.companies, []);
  const ui = state.adminUsersUi || { panel: "", editUserId: "" };
  const editingUser = ui.editUserId ? users.find((u) => u.id === ui.editUserId) : null;

  const companyOptions = companies
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");

  const userOptions = users
    .filter((u) => u.id !== current.id)
    .map((u) => `<option value="${u.id}">${u.name} (${u.role})</option>`)
    .join("");

  const permissionChecks = (selected = []) => ALL_PERMISSIONS.map((permission) => {
    const meta = PERMISSION_META[permission] || { title: permission, desc: "" };
    return `<label class="perm-check">
      <input type="checkbox" name="permissions" value="${permission}" ${selected.includes(permission) ? "checked" : ""} />
      <span><strong>${meta.title}</strong><small>${meta.desc}</small></span>
    </label>`;
  }).join("");

  const statusBadge = (s) => {
    if (s === ACCOUNT_STATUS.APROBADO) return `<span class="status status-viaje_asignado">Aprobado</span>`;
    if (s === ACCOUNT_STATUS.PENDIENTE) return `<span class="status status-pendiente">Pendiente</span>`;
    if (s === ACCOUNT_STATUS.RECHAZADO) return `<span class="status status-rechazada">Rechazado</span>`;
    return `<span class="status status-viaje_asignado">Aprobado</span>`;
  };

  const roleBadge = (r) => {
    const colors = { admin: "#1565C0", rrhh: "#7C3AED", client: "#0E7490" };
    return `<span class="role-chip" style="--role-color:${colors[r] || '#64748B'}">${r}</span>`;
  };

  // --- Usuarios ---
  const userCards = users.map((u) => {
    const permList = (u.permissions || [])
      .map((p) => `<span class="perm-tag">${PERMISSION_META[p]?.title || p}</span>`)
      .join("");
    const isMe = u.id === current.id;
    return `<div class="user-card">
      <div class="user-card-top">
        <div class="user-avatar">${u.name.charAt(0).toUpperCase()}</div>
        <div class="user-card-info">
          <h4>${u.name}${isMe ? ' <span class="muted" style="font-weight:400;font-size:0.78rem">(tu)</span>' : ""}</h4>
          <p>${u.email}</p>
        </div>
        <div class="user-card-badges">
          ${roleBadge(u.role)}
          ${statusBadge(u.accountStatus)}
        </div>
      </div>
      <div class="user-card-meta">
        <span>${IC.briefcase} ${getCompanyById(u.companyId)?.name || u.company || "Sin empresa"}</span>
        ${u.phone ? `<span>${IC.user} ${u.phone}</span>` : ""}
      </div>
      ${permList ? `<div class="user-card-perms">${permList}</div>` : ""}
      ${!isMe ? `<div class="user-card-actions">
        <button class="btn btn-sm btn-action" data-action="open-edit-user" data-id="${u.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-reject" data-action="delete-user" data-id="${u.id}">${IC.trash} Eliminar</button>
      </div>` : ""}
    </div>`;
  }).join("");

  // --- Pendientes ---
  const pendingUsers = users.filter((u) => u.accountStatus === ACCOUNT_STATUS.PENDIENTE);
  const pendingCards = pendingUsers.map((u) => `<div class="user-card pending-card">
    <div class="user-card-top">
      <div class="user-avatar pending-avatar">${u.name.charAt(0).toUpperCase()}</div>
      <div class="user-card-info">
        <h4>${u.name}</h4>
        <p>${u.email}</p>
      </div>
    </div>
    <div class="user-card-meta">
      <span>${IC.briefcase} ${getCompanyById(u.companyId)?.name || u.company || "-"}</span>
      <span>${IC.file} ${u.taxId || "-"}</span>
      ${u.phone ? `<span>${IC.user} ${u.phone}</span>` : ""}
      ${u.registeredAt ? `<span>${IC.clock} ${fmtDate(u.registeredAt)}</span>` : ""}
    </div>
    <div class="user-card-actions">
      <button class="btn btn-sm btn-approve" data-action="approve-registration" data-id="${u.id}">${IC.check} Aprobar</button>
      <button class="btn btn-sm btn-reject" data-action="reject-registration" data-id="${u.id}">${IC.x} Rechazar</button>
    </div>
  </div>`).join("");

  // --- Formularios ---
  const fUser = `<form id="form-admin-user-create" class="p-form">
    <label>Nombre <input name="name" required placeholder="Nombre completo" /></label>
    <label>Correo <input type="email" name="email" required placeholder="correo@empresa.com" /></label>
    <label>Contraseña <input type="password" name="password" minlength="6" required placeholder="Min. 6 caracteres" /></label>
    <label>Rol
      <select name="role" required>
        <option value="${ROLES.ADMIN}">Administrador</option>
        <option value="${ROLES.RRHH}">Recursos Humanos</option>
        <option value="${ROLES.CLIENT}">Cliente</option>
      </select>
    </label>
    <label>Empresa
      <select name="companyId" required>
        <option value="">Seleccione...</option>
        ${companyOptions}
      </select>
    </label>
    <label>Telefono <input name="phone" required placeholder="+57 300 000 0000" /></label>
    <label>Nombre comercial <input name="company" value="Antares" /></label>
    <label>NIT/RUT <input name="taxId" value="900000001-0" required /></label>
    <fieldset class="full perm-fieldset">
      <legend>Permisos del usuario</legend>
      <div class="perm-grid">${permissionChecks([...ALL_PERMISSIONS])}</div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.userPlus} Crear usuario</button>
  </form>`;

  const fComp = `<form id="form-admin-company-create" class="p-form">
    <label>Nombre empresa <input name="name" required placeholder="Nombre de la empresa" /></label>
    <label>NIT/RUT <input name="taxId" required placeholder="000.000.000-0" /></label>
    <label>Telefono <input name="phone" required placeholder="+57 300 000 0000" /></label>
    <button class="btn btn-primary full" type="submit">${IC.plus} Registrar empresa</button>
  </form>`;

  const fPerm = `<form id="form-admin-user-permissions" class="p-form">
    <label class="full">Seleccionar usuario
      <select name="userId" required>
        <option value="">Seleccione un usuario...</option>
        ${userOptions}
      </select>
    </label>
    <fieldset class="full perm-fieldset">
      <legend>Permisos a asignar</legend>
      <div class="perm-grid">${permissionChecks([])}</div>
    </fieldset>
    <button class="btn btn-primary full" type="submit">${IC.save} Guardar permisos</button>
  </form>`;

  const fEdit = editingUser ? `<form id="form-admin-user-edit" class="p-form">
    <input type="hidden" name="id" value="${editingUser.id}" />
    <label>Nombre <input name="name" value="${editingUser.name || ""}" required /></label>
    <label>Correo <input type="email" name="email" value="${editingUser.email || ""}" required /></label>
    <label>Contraseña <input type="password" name="password" placeholder="Dejar vacio para conservar" /></label>
    <label>Rol
      <select name="role" required>
        <option value="${ROLES.ADMIN}" ${editingUser.role === ROLES.ADMIN ? "selected" : ""}>Administrador</option>
        <option value="${ROLES.RRHH}" ${editingUser.role === ROLES.RRHH ? "selected" : ""}>Recursos Humanos</option>
        <option value="${ROLES.CLIENT}" ${editingUser.role === ROLES.CLIENT ? "selected" : ""}>Cliente</option>
      </select>
    </label>
    <label>Empresa
      <select name="companyId" required>
        <option value="">Seleccione...</option>
        ${companies.map((c) => `<option value="${c.id}" ${c.id === editingUser.companyId ? "selected" : ""}>${c.name}</option>`).join("")}
      </select>
    </label>
    <label>Telefono <input name="phone" value="${editingUser.phone || ""}" /></label>
    <label>Nombre comercial <input name="company" value="${editingUser.company || ""}" /></label>
    <label>NIT/RUT <input name="taxId" value="${editingUser.taxId || ""}" /></label>
    <fieldset class="full perm-fieldset">
      <legend>Permisos granulares</legend>
      <div class="perm-grid">${permissionChecks(editingUser.permissions || [])}</div>
    </fieldset>
    <div class="toolbar full">
      <button class="btn btn-primary" type="submit">${IC.save} Guardar cambios</button>
      <button class="btn btn-action" type="button" data-action="close-edit-user">${IC.x} Cancelar</button>
    </div>
  </form>` : "";

  // --- Empresas tabla ---
  const companyRows = companies.map((c) => `<div class="company-chip">
    <strong>${c.name}</strong>
    <span class="muted">${c.taxId || ""} · ${c.phone || ""}</span>
  </div>`).join("");

  // --- Render ---
  let html = "";

  if (pendingUsers.length > 0) {
    html += pcardWrap("bell", "Solicitudes pendientes (" + pendingUsers.length + ")", "Estos clientes necesitan aprobacion para acceder", `<div class="user-grid">${pendingCards}</div>`, "p-card-alert");
  }

  html += pcardWrap("shield", "Usuarios del sistema", users.length + " registrados", userCards ? `<div class="user-grid">${userCards}</div>` : emptyState("Sin usuarios registrados."));
  html += `<div class="toolbar" style="margin-bottom:0.8rem">
    <button class="btn btn-action" data-action="toggle-admin-panel" data-panel="create-user">${IC.userPlus} Nuevo usuario</button>
    <button class="btn btn-action" data-action="toggle-admin-panel" data-panel="create-company">${IC.plus} Nueva empresa</button>
    <button class="btn btn-action" data-action="toggle-admin-panel" data-panel="set-permissions">${IC.save} Asignar permisos</button>
  </div>`;

  if (ui.panel === "create-user") html += pcardWrap("userPlus", "Crear nuevo usuario", "Completa los datos y permisos", fUser);
  if (ui.panel === "create-company") html += pcardWrap("plus", "Registrar empresa", "Agregar nueva empresa al sistema", fComp);
  if (ui.panel === "set-permissions") html += pcardWrap("save", "Asignar permisos", "Selecciona usuario y permisos", fPerm);
  if (editingUser) html += pcardWrap("edit", "Editar usuario", `Actualiza los datos de ${editingUser.name}`, fEdit);

  if (companies.length > 0) {
    html += pcardWrap("briefcase", "Empresas registradas", companies.length + " empresas", `<div class="company-grid">${companyRows}</div>`);
  }

  return html;
}

function historyHtml() {
  const requests = read(KEYS.requests, []);
  const users = read(KEYS.users, []);
  const options = users
    .filter((u) => u.role === ROLES.CLIENT)
    .map((u) => `<option value="${u.id}">${u.company}</option>`)
    .join("");
  const rows = requests
    .map((r) => `<tr>
      <td>${fmtDate(r.createdAt)}</td>
      <td><strong>${r.requestNumber || r.id}</strong></td>
      <td>${r.clientName}</td>
      <td>${r.vehicleType}</td>
      <td><span class="status status-${slugStatus(r.status)}">${r.status}</span></td>
      <td>${r.trip?.tripNumber || '<span class="muted">-</span>'}</td>
    </tr>`)
    .join("");

  const filterBody = `<form id="history-filter" class="p-form">
    <label>Desde <input type="date" name="from" /></label>
    <label>Hasta <input type="date" name="to" /></label>
    <label>Cliente <select name="client"><option value="">Todos</option>${options}</select></label>
    <label>Estado <select name="status"><option value="">Todos</option>${Object.values(STATUS).map((s) => `<option>${s}</option>`).join("")}</select></label>
    <button class="btn btn-primary full" type="submit">${IC.filter} Aplicar filtro</button>
  </form>`;
  const tableBody = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Solicitud</th><th>Cliente</th><th>Vehiculo</th><th>Estado</th><th>Viaje</th></tr></thead><tbody id="history-body">${rows}</tbody></table></div>`
    : emptyState("Sin registros.");
  const reportBody = `<div class="dash-grid" style="margin-top:1rem">
    ${pcardWrap("user", "Clientes mas activos", null, `<p>${topClients(requests).join(", ") || "Sin datos"}</p>`)}
    ${pcardWrap("truck", "Vehiculos mas usados", null, `<p>${topVehicles(requests).join(", ") || "Sin datos"}</p>`)}
  </div>`;
  return pcardWrap("filter", "Filtros", null, filterBody) + pcardWrap("clock", "Historial de viajes", requests.length + " registros", tableBody) + reportBody;
}

function topClients(requests) {
  const acc = {};
  requests.forEach((r) => {
    acc[r.clientName] = (acc[r.clientName] || 0) + 1;
  });
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);
}

function topVehicles(requests) {
  const acc = {};
  requests.forEach((r) => {
    acc[r.vehicleType] = (acc[r.vehicleType] || 0) + 1;
  });
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);
}

function payrollHtml() {
  const employees = read(KEYS.payrollEmployees, []);
  const runs = read(KEYS.payrollRuns, []);
  const pending = runs.filter((r) => !r.paid).length;
  const employeeRows = employees
    .map((e) => `<tr>
      <td><strong>${e.name}</strong></td><td>${e.idDoc}</td><td>${e.position}</td><td>${e.contractType}</td><td>$${parseNum(e.baseSalary).toLocaleString("es-CO")}</td><td>${fmtDate(e.startDate)}</td>
      <td><div class="toolbar">
        <button class="btn btn-sm btn-action" data-action="edit-employee" data-id="${e.id}">${IC.edit} Editar</button>
        <button class="btn btn-sm btn-reject" data-action="delete-employee" data-id="${e.id}">${IC.trash} Eliminar</button>
      </div></td>
    </tr>`)
    .join("");
  const runRows = runs
    .map((r) => `<tr>
      <td>${r.month}</td><td>${r.employeeName}</td><td>$${parseNum(r.net).toLocaleString("es-CO")}</td>
      <td>${r.paid ? '<span class="status status-viaje_asignado">Pagado</span>' : '<span class="status status-pendiente">Pendiente</span>'}</td>
      <td><button class="btn btn-sm btn-action" data-action="payslip" data-id="${r.id}">${IC.printer} Desprendible</button></td>
    </tr>`)
    .join("");

  const formEmp = `<form id="form-employee" class="p-form">
    <label>Nombre <input name="name" required /></label>
    <label>Cedula <input name="idDoc" required /></label>
    <label>Cargo <input name="position" required /></label>
    <label>Tipo contrato <input name="contractType" required /></label>
    <label>Salario base <input type="number" name="baseSalary" required /></label>
    <label>Fecha ingreso <input type="date" name="startDate" required /></label>
    <button class="btn btn-primary full" type="submit">${IC.save} Guardar empleado</button>
  </form>`;
  const formPay = `<form id="form-payroll" class="p-form">
    <label>Empleado <select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name}</option>`).join("")}</select></label>
    <label>Mes <input type="month" name="month" required /></label>
    <label>Horas extras <input type="number" name="extras" value="0" /></label>
    <label>Aux transporte <input type="number" name="aux" value="0" /></label>
    <label>Deduccion salud <input type="number" name="health" value="0" /></label>
    <label>Deduccion pension <input type="number" name="pension" value="0" /></label>
    <label>Deduccion ARL <input type="number" name="arl" value="0" /></label>
    <label>Bonificaciones <input type="number" name="bonus" value="0" /></label>
    <button class="btn btn-primary full" type="submit">${IC.dollar} Generar liquidacion</button>
  </form>`;
  const empTable = employeeRows
    ? `<div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Cedula</th><th>Cargo</th><th>Contrato</th><th>Base</th><th>Ingreso</th><th>Acciones</th></tr></thead><tbody>${employeeRows}</tbody></table></div>`
    : emptyState("No hay empleados registrados.");
  const runTable = runRows
    ? `<div style="margin-bottom:0.8rem"><button id="export-payroll" class="btn btn-sm btn-action">${IC.download} Exportar CSV</button></div><div class="table-wrap"><table><thead><tr><th>Mes</th><th>Empleado</th><th>Neto</th><th>Estado</th><th></th></tr></thead><tbody>${runRows}</tbody></table></div>`
    : emptyState("Sin liquidaciones registradas.");
  return `<div class="dash-grid">${pcardWrap("userPlus", "Registro empleado", null, formEmp)}${pcardWrap("dollar", "Liquidacion mensual", null, formPay)}</div>`
    + pcardWrap("user", "Empleados", employees.length + " registrados" + (pending > 0 ? ` · ${pending} pagos pendientes` : ""), empTable)
    + pcardWrap("clock", "Historial de pagos", runs.length + " liquidaciones", runTable);
}

function hiringHtml() {
  const vacancies = read(KEYS.vacancies, []);
  const candidates = read(KEYS.candidates, []);
  const interviews = read(KEYS.interviews, []);
  const contracts = read(KEYS.contracts, []);
  const employees = read(KEYS.payrollEmployees, []);

  const vacRows = vacancies.map((v) => `<tr><td><strong>${v.title}</strong></td><td>$${parseNum(v.salaryOffer).toLocaleString("es-CO")}</td><td>${v.deadline}</td><td>${v.status === "Publicada" ? '<span class="status status-viaje_asignado">Publicada</span>' : '<span class="status status-rechazada">Cerrada</span>'}</td><td><button class="btn btn-sm btn-action" data-action="close-vacancy" data-id="${v.id}">${IC.x} Cerrar</button></td></tr>`).join("");
  const candRows = candidates.map((c) => `<tr><td><strong>${c.name}</strong></td><td>${c.email}</td><td>${c.vacancyTitle}</td><td><span class="status status-en_transito">${c.status}</span></td><td><select data-action="candidate-status" data-id="${c.id}" style="padding:0.4rem;border-radius:8px;border:1px solid var(--line);font-size:0.82rem">${PIPELINE.map((p) => `<option ${c.status === p ? "selected" : ""}>${p}</option>`).join("")}</select></td></tr>`).join("");
  const interviewRows = interviews.map((i) => `<tr><td><strong>${i.candidateName}</strong></td><td>${i.when}</td><td>${i.interviewer}</td></tr>`).join("");
  const contractRows = contracts.map((c) => `<tr><td><strong>${c.candidateName || c.employeeName || "-"}</strong></td><td>${c.position}</td><td>${c.source || "Candidato"}</td><td>${fmtDate(c.createdAt)}</td><td><button class="btn btn-sm btn-action" data-action="view-contract" data-id="${c.id}">${IC.eye} Ver</button></td></tr>`).join("");

  const fVac = `<form id="form-vacancy" class="p-form"><label>Cargo <input name="title" required /></label><label>Requisitos <input name="requirements" required /></label><label>Salario ofrecido <input type="number" name="salaryOffer" required /></label><label>Fecha limite <input type="date" name="deadline" required /></label><button class="btn btn-primary full" type="submit">${IC.plus} Publicar vacante</button></form>`;
  const fCand = `<form id="form-candidate" class="p-form"><label>Nombre <input name="name" required /></label><label>Correo <input type="email" name="email" required /></label><label>Vacante <select name="vacancyId" required><option value="">Seleccione</option>${vacancies.filter((v) => v.status === "Publicada").map((v) => `<option value="${v.id}">${v.title}</option>`).join("")}</select></label><label class="full">Adjunto hoja vida <input type="file" name="attachments" multiple /></label><button class="btn btn-primary full" type="submit">${IC.userPlus} Registrar candidato</button></form>`;
  const fInt = `<form id="form-interview" class="p-form"><label>Candidato <select name="candidateId" required><option value="">Seleccione</option>${candidates.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label><label>Fecha y hora <input type="datetime-local" name="when" required /></label><label>Entrevistador <input name="interviewer" required /></label><button class="btn btn-primary full" type="submit">${IC.calendar} Guardar entrevista</button></form>`;
  const fCon = `<form id="form-contract" class="p-form"><label>Candidato contratado <select name="candidateId" required><option value="">Seleccione</option>${candidates.filter((c) => c.status === "Contratado").map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></label><label>Cargo <input name="position" required /></label><label>Salario <input type="number" name="salary" required /></label><label>Inicio <input type="date" name="startDate" required /></label><button class="btn btn-primary full" type="submit">${IC.file} Generar contrato</button></form>`;
  const fEmpCon = `<form id="form-employee-contract" class="p-form"><label>Empleado <select name="employeeId" required><option value="">Seleccione</option>${employees.map((e) => `<option value="${e.id}">${e.name} - ${e.position}</option>`).join("")}</select></label><label>Salario acordado <input type="number" name="salary" required /></label><label>Fecha de inicio <input type="date" name="startDate" required /></label><label>Tipo de contrato <input name="contractType" required /></label><button class="btn btn-primary full" type="submit">${IC.printer} Crear contrato PDF</button></form>`;

  const tVac = vacRows ? `<div class="table-wrap"><table><thead><tr><th>Cargo</th><th>Salario</th><th>Limite</th><th>Estado</th><th></th></tr></thead><tbody>${vacRows}</tbody></table></div>` : emptyState("Sin vacantes");
  const tCand = candRows ? `<div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Correo</th><th>Vacante</th><th>Estado</th><th>Cambiar</th></tr></thead><tbody>${candRows}</tbody></table></div>` : emptyState("Sin candidatos");
  const tInt = interviewRows ? `<div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Fecha</th><th>Entrevistador</th></tr></thead><tbody>${interviewRows}</tbody></table></div>` : emptyState("Sin entrevistas");
  const tCon = contractRows ? `<div class="table-wrap"><table><thead><tr><th>Persona</th><th>Cargo</th><th>Origen</th><th>Fecha</th><th></th></tr></thead><tbody>${contractRows}</tbody></table></div>` : emptyState("Sin contratos");

  return `<div class="dash-grid">${pcardWrap("plus", "Nueva vacante", null, fVac)}${pcardWrap("userPlus", "Registrar candidato", null, fCand)}</div>`
    + pcardWrap("briefcase", "Vacantes", vacancies.length + " registradas", tVac)
    + pcardWrap("activity", "Pipeline de candidatos", candidates.length + " candidatos", tCand)
    + `<div class="dash-grid">${pcardWrap("calendar", "Programar entrevista", null, fInt)}${pcardWrap("file", "Generar contrato", null, fCon)}</div>`
    + pcardWrap("printer", "Contrato desde nomina", null, fEmpCon)
    + pcardWrap("calendar", "Entrevistas", interviews.length + " programadas", tInt)
    + pcardWrap("file", "Contratos generados", contracts.length + " contratos", tCon);
}

function notificationsHtml() {
  const user = currentUser();
  const list = read(KEYS.notifications, []).filter((n) => n.userId === user.id || user.role === ROLES.ADMIN);
  const rows = list
    .map((n) => `<tr>
      <td>${fmtDate(n.createdAt)}</td>
      <td><strong>${n.title}</strong></td>
      <td>${n.body}</td>
      <td>${n.readAt ? '<span class="status status-completada">Leida</span>' : '<span class="status status-pendiente">Nueva</span>'}</td>
    </tr>`)
    .join("");
  const body = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Titulo</th><th>Mensaje</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : emptyState("No tienes notificaciones.");
  return pcardWrap("bell", "Notificaciones", list.length + " notificaciones", body);
}

function renderPortalView() {
  updateAutoApprove();
  renderKpis();

  const user = currentUser();
  const view = state.currentView;
  const titles = {
    dashboard: "Dashboard",
    requests: "Solicitudes",
    "transport-requests": "Transporte · Solicitudes",
    "transport-trips": "Transporte · Viajes",
    "transport-vehicles": "Transporte · Camiones",
    "transport-drivers": "Transporte · Conductores",
    "transport-calendar": "Transporte · Calendario",
    history: "Transporte · Historial y reportes",
    payroll: "Nomina",
    hiring: "Contratacion",
    "admin-users": "Administración · Usuarios y permisos",
    notifications: "Notificaciones"
  };
  nodes.viewTitle.textContent = titles[view] || "Dashboard";

  if (!isViewAllowedForUser(user, view)) {
    nodes.viewRoot.innerHTML = pcardWrap("shield", "Acceso restringido", null, emptyState("No tienes autorizacion para este modulo."));
  } else if (view === "dashboard") {
    nodes.viewRoot.innerHTML = viewDashboard();
  } else if (view === "requests" && user.role === ROLES.CLIENT) {
    nodes.viewRoot.innerHTML = `${requestFormHtml()}${requestListClientHtml(user)}`;
  } else if (view === "transport-requests" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = adminQueueHtml();
  } else if (view === "transport-trips" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = transportTripsHtml();
  } else if (view === "transport-vehicles" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = vehiclesHtml();
  } else if (view === "transport-drivers" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = driversHtml();
  } else if (view === "transport-calendar" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = transportCalendarHtml();
  } else if (view === "history" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = historyHtml();
  } else if (view === "payroll" && canAccessRRHH(user.role)) {
    nodes.viewRoot.innerHTML = payrollHtml();
  } else if (view === "hiring" && canAccessRRHH(user.role)) {
    nodes.viewRoot.innerHTML = hiringHtml();
  } else if (view === "admin-users" && user.role === ROLES.ADMIN) {
    nodes.viewRoot.innerHTML = adminUsersHtml(user);
  } else if (view === "notifications") {
    nodes.viewRoot.innerHTML = notificationsHtml();
  } else {
    nodes.viewRoot.innerHTML = pcardWrap("shield", "Acceso restringido", null, emptyState("No tienes autorizacion para esta vista."));
  }

  bindDynamicEvents();
}

function bindDynamicEvents() {
  nodes.viewRoot.querySelectorAll("[data-action='toggle-admin-panel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = String(btn.dataset.panel || "");
      const currentPanel = state.adminUsersUi?.panel || "";
      state.adminUsersUi = {
        panel: currentPanel === panel ? "" : panel,
        editUserId: ""
      };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='open-edit-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.id || "");
      if (!id) return;
      state.adminUsersUi = { panel: "", editUserId: id };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-edit-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  });

  const adminUserCreate = document.getElementById("form-admin-user-create");
  if (adminUserCreate) {
    adminUserCreate.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adminUserCreate).entries());
      const permissions = [...adminUserCreate.querySelectorAll("input[name='permissions']:checked")].map(
        (input) => input.value
      );
      const users = read(KEYS.users, []);
      if (users.some((item) => normalizeEmail(item.email) === normalizeEmail(data.email))) {
        alert("Ya existe un usuario con ese correo.");
        return;
      }
      const company = getCompanyById(data.companyId);
      if (!company) {
        alert("Debes seleccionar una empresa válida.");
        return;
      }
      users.push({
        id: uid(),
        name: data.name,
        email: normalizeEmail(data.email),
        password: await hashPassword(data.password),
        role: data.role,
        accountStatus: ACCOUNT_STATUS.APROBADO,
        company: data.company || company.name,
        companyId: company.id,
        taxId: data.taxId,
        phone: data.phone,
        permissions:
          data.role === ROLES.ADMIN
            ? [...ALL_PERMISSIONS]
            : permissions.length
              ? permissions
              : defaultPermissionsForRole(data.role)
      });
      write(KEYS.users, users);
      alert("Usuario creado correctamente.");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  const adminCompanyCreate = document.getElementById("form-admin-company-create");
  if (adminCompanyCreate) {
    adminCompanyCreate.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adminCompanyCreate).entries());
      const companies = read(KEYS.companies, []);
      if (
        companies.some(
          (company) => company.name.toLowerCase() === String(data.name).toLowerCase()
        )
      ) {
        alert("La empresa ya existe.");
        return;
      }
      companies.push({
        id: uid(),
        name: data.name,
        taxId: data.taxId,
        phone: data.phone,
        createdAt: nowIso()
      });
      write(KEYS.companies, companies);
      alert("Empresa creada correctamente.");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  const adminUserPermissions = document.getElementById("form-admin-user-permissions");
  if (adminUserPermissions) {
    adminUserPermissions.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(adminUserPermissions);
      const userId = String(form.get("userId") || "");
      if (!userId) {
        alert("Selecciona un usuario.");
        return;
      }
      const permissions = [...adminUserPermissions.querySelectorAll("input[name='permissions']:checked")].map(
        (input) => input.value
      );
      const users = read(KEYS.users, []);
      write(
        KEYS.users,
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                permissions:
                  user.role === ROLES.ADMIN
                    ? [...ALL_PERMISSIONS]
                    : permissions.filter((permission) => ALL_PERMISSIONS.includes(permission))
              }
            : user
        )
      );
      if (state.session?.userId === userId) {
        const refreshed = read(KEYS.users, []).find((item) => item.id === userId);
        if (refreshed && !hasPermission(refreshed, PERMISSIONS.USERS_MANAGE)) {
          alert("Tus permisos cambiaron. Se cerrará la sesión por seguridad.");
          clearSession();
          renderPortal();
          return;
        }
      }
      alert("Permisos actualizados.");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  const adminUserEdit = document.getElementById("form-admin-user-edit");
  if (adminUserEdit) {
    adminUserEdit.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adminUserEdit).entries());
      const userId = String(data.id || "");
      if (!userId) return;
      const users = read(KEYS.users, []);
      const existing = users.find((u) => u.id === userId);
      if (!existing) {
        alert("Usuario no encontrado.");
        return;
      }
      const duplicated = users.some((u) => u.id !== userId && normalizeEmail(u.email) === normalizeEmail(data.email));
      if (duplicated) {
        alert("Ya existe otro usuario con ese correo.");
        return;
      }
      const company = getCompanyById(String(data.companyId || ""));
      if (!company) {
        alert("Debes seleccionar una empresa valida.");
        return;
      }
      const permissions = [...adminUserEdit.querySelectorAll("input[name='permissions']:checked")].map((input) => input.value);
      const nextPassword = String(data.password || "").trim()
        ? await hashPassword(String(data.password || "").trim())
        : existing.password;
      write(
        KEYS.users,
        users.map((u) =>
          u.id === userId
            ? {
                ...u,
                name: String(data.name || "").trim(),
                email: normalizeEmail(data.email),
                password: nextPassword,
                role: String(data.role || u.role),
                companyId: company.id,
                company: String(data.company || company.name).trim(),
                taxId: String(data.taxId || "").trim(),
                phone: String(data.phone || "").trim(),
                permissions:
                  String(data.role || u.role) === ROLES.ADMIN
                    ? [...ALL_PERMISSIONS]
                    : permissions.length
                      ? permissions.filter((p) => ALL_PERMISSIONS.includes(p))
                      : defaultPermissionsForRole(String(data.role || u.role))
              }
            : u
        )
      );
      alert("Usuario actualizado correctamente.");
      state.adminUsersUi = { panel: "", editUserId: "" };
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='approve-registration']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      if (!userId) return;
      const users = read(KEYS.users, []);
      const target = users.find((u) => u.id === userId);
      if (!target) return;
      write(
        KEYS.users,
        users.map((u) => u.id === userId ? { ...u, accountStatus: ACCOUNT_STATUS.APROBADO } : u)
      );
      saveNotification({
        userId: target.id,
        title: "Cuenta aprobada",
        body: "Tu cuenta ha sido aprobada. Ya puedes iniciar sesion en el portal."
      });
      sendEmail({
        to: target.email,
        subject: "Cuenta aprobada - Antares Portal",
        body: `Hola ${target.name}, tu cuenta ha sido aprobada. Ya puedes iniciar sesion en el portal con tu correo y contrasena.`
      });
      alert(`Cuenta de ${target.name} aprobada exitosamente.`);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='reject-registration']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      if (!userId) return;
      const reason = prompt("Motivo del rechazo:");
      if (!reason) return;
      const users = read(KEYS.users, []);
      const target = users.find((u) => u.id === userId);
      if (!target) return;
      write(
        KEYS.users,
        users.map((u) => u.id === userId ? { ...u, accountStatus: ACCOUNT_STATUS.RECHAZADO, rejectionReason: reason } : u)
      );
      saveNotification({
        userId: target.id,
        title: "Registro rechazado",
        body: `Tu solicitud de registro fue rechazada. Motivo: ${reason}`
      });
      sendEmail({
        to: target.email,
        subject: "Registro rechazado - Antares Portal",
        body: `Hola ${target.name}, tu solicitud de registro fue rechazada. Motivo: ${reason}. Contacta a soporte para mas informacion.`
      });
      alert(`Registro de ${target.name} rechazado.`);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-user']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userId = btn.dataset.id;
      if (!userId) return;
      if (state.session?.userId === userId) {
        alert("No puedes eliminar tu propio usuario.");
        return;
      }
      if (!confirm("¿Eliminar usuario?")) return;
      write(
        KEYS.users,
        read(KEYS.users, []).filter((user) => user.id !== userId)
      );
      alert("Usuario eliminado.");
      renderPortalView();
    });
  });

  const requestForm = document.getElementById("form-request");
  if (requestForm) {
    requestForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const user = currentUser();
      const data = Object.fromEntries(new FormData(requestForm).entries());
      const files = requestForm.querySelector("input[name='attachments']").files;
      const attachments = [...files].map((f) => f.name);
      const all = read(KEYS.requests, []);
      all.unshift({
        id: uid(),
        requestNumber: makeRequestNumber(),
        clientUserId: user.id,
        clientName: user.company,
        clientCompanyId: user.companyId,
        requestedByName: user.name,
        ...data,
        attachments,
        status: STATUS.PENDIENTE,
        createdAt: nowIso(),
        approvedAt: null,
        approvedBy: null,
        trip: null,
        standbyChargeTotal: 0,
        standbyEvents: [],
        rejectionReason: ""
      });
      write(KEYS.requests, all);

      const adminUsers = read(KEYS.users, []).filter((u) => u.role === ROLES.ADMIN);
      adminUsers.forEach((admin) => {
        saveNotification({
          userId: admin.id,
          title: "Nueva solicitud pendiente",
          body: `Solicitud ${all[0].id} de ${user.company}`
        });
        sendEmail({
          to: admin.email,
          subject: "Nueva solicitud de viaje",
          body: `Revisar solicitud ${all[0].id}`
        });
      });

      alert("Solicitud creada.");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='detail']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const req = read(KEYS.requests, []).find((r) => r.id === btn.dataset.id);
      if (!req) return;
      const msg =
        `Solicitud: ${req.requestNumber || req.id}\nRuta: ${req.originCity} -> ${req.destinationCity}\nEstado: ${req.status}\n` +
        `Carga: ${req.cargoDescription} / ${req.weightKg}kg / ${req.boxes} cajas\n` +
        `Temperatura: ${req.temperature || "N/A"}\nAdjuntos: ${(req.attachments || []).join(", ") || "Ninguno"}\n` +
        `${req.trip ? `Viaje ${req.trip.tripNumber}, Vehiculo ${req.trip.vehiclePlate}, Conductor ${req.trip.driverName}` : ""}\n` +
        `${parseNum(req.standbyChargeTotal) > 0 ? `Sobrecargo standby: $${parseNum(req.standbyChargeTotal).toLocaleString("es-CO")}\n` : ""}` +
        `${req.rejectionReason ? `Motivo rechazo: ${req.rejectionReason}` : ""}`;
      alert(msg);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requests = read(KEYS.requests, []);
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req || req.status !== STATUS.PENDIENTE) return;
      const newNotes = prompt("Observaciones", req.notes || "");
      if (newNotes === null) return;
      const updated = requests.map((r) => (r.id === req.id ? { ...r, notes: newNotes } : r));
      write(KEYS.requests, updated);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='cancel']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requests = read(KEYS.requests, []);
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req || req.status !== STATUS.PENDIENTE) return;
      const updated = requests.map((r) => (r.id === req.id ? { ...r, status: STATUS.CANCELADA } : r));
      write(KEYS.requests, updated);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='approve']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const actor = currentUser();
      approveRequest(btn.dataset.id, actor.name, false);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='trip-status']").forEach((select) => {
    select.addEventListener("change", () => {
      const actor = currentUser();
      transitionRequestStatus(select.dataset.id, select.value, actor?.name || "Operación");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='reject']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reason = prompt("Motivo de rechazo");
      if (!reason) return;
      rejectRequest(btn.dataset.id, reason, currentUser().name);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-admin']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const requests = read(KEYS.requests, []);
      const req = requests.find((r) => r.id === btn.dataset.id);
      if (!req) return;
      const newPickup = prompt("Nueva fecha de recogida (YYYY-MM-DDTHH:mm)", toInputDate(req.pickupAt));
      if (!newPickup) return;
      write(
        KEYS.requests,
        requests.map((r) => (r.id === req.id ? { ...r, pickupAt: newPickup } : r))
      );
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-admin']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm("Eliminar solicitud?")) return;
      write(
        KEYS.requests,
        read(KEYS.requests, []).filter((r) => r.id !== btn.dataset.id)
      );
      renderPortalView();
    });
  });

  const vehicleForm = document.getElementById("form-vehicle");
  if (vehicleForm) {
    vehicleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(vehicleForm).entries());
      const list = read(KEYS.vehicles, []);
      list.push({
        id: uid(),
        plate: String(data.plate).toUpperCase(),
        type: data.type,
        capacityKg: parseNum(data.capacityKg),
        refrigerated: data.refrigerated === "true",
        available: true
      });
      write(KEYS.vehicles, list);
      renderPortalView();
    });
  }

  const driverForm = document.getElementById("form-driver");
  if (driverForm) {
    driverForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(driverForm).entries());
      const list = read(KEYS.drivers, []);
      list.push({ id: uid(), ...data, available: true });
      write(KEYS.drivers, list);
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-vehicle']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.vehicles, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      setVehicleAvailability(target.id, !target.available);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-vehicle']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.vehicles, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      const newPlate = prompt("Placa", target.plate);
      if (!newPlate) return;
      const newCapacity = prompt("Capacidad kg", String(target.capacityKg));
      if (!newCapacity) return;
      write(
        KEYS.vehicles,
        all.map((v) =>
          v.id === target.id
            ? { ...v, plate: newPlate.toUpperCase(), capacityKg: parseNum(newCapacity) }
            : v
        )
      );
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='toggle-driver']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.drivers, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      setDriverAvailability(target.id, !target.available);
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-driver']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.drivers, []);
      const target = all.find((v) => v.id === btn.dataset.id);
      if (!target) return;
      const newName = prompt("Nombre", target.name);
      if (!newName) return;
      const newPhone = prompt("Teléfono", target.phone);
      if (!newPhone) return;
      write(
        KEYS.drivers,
        all.map((d) => (d.id === target.id ? { ...d, name: newName, phone: newPhone } : d))
      );
      renderPortalView();
    });
  });

  const historyFilter = document.getElementById("history-filter");
  if (historyFilter) {
    historyFilter.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(historyFilter).entries());
      let items = read(KEYS.requests, []);
      if (data.client) items = items.filter((i) => i.clientUserId === data.client);
      if (data.status) items = items.filter((i) => i.status === data.status);
      if (data.from) items = items.filter((i) => new Date(i.createdAt) >= new Date(`${data.from}T00:00`));
      if (data.to) items = items.filter((i) => new Date(i.createdAt) <= new Date(`${data.to}T23:59`));
      document.getElementById("history-body").innerHTML =
        items
          .map(
            (r) =>
              `<tr><td>${fmtDate(r.createdAt)}</td><td>${r.requestNumber || r.id}</td><td>${r.clientName}</td><td>${r.vehicleType}</td><td>${r.status}</td><td>${r.trip?.tripNumber || "-"}</td></tr>`
          )
          .join("") || "<tr><td colspan='6'>Sin registros</td></tr>";
    });
  }

  const employeeForm = document.getElementById("form-employee");
  if (employeeForm) {
    employeeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(employeeForm).entries());
      const all = read(KEYS.payrollEmployees, []);
      all.push({ id: uid(), ...data });
      write(KEYS.payrollEmployees, all);
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='edit-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.payrollEmployees, []);
      const target = all.find((e) => e.id === btn.dataset.id);
      if (!target) return;
      const newPosition = prompt("Cargo", target.position);
      if (!newPosition) return;
      const newSalary = prompt("Salario base", String(target.baseSalary));
      if (!newSalary) return;
      write(
        KEYS.payrollEmployees,
        all.map((e) =>
          e.id === target.id ? { ...e, position: newPosition, baseSalary: parseNum(newSalary) } : e
        )
      );
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-employee']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm("¿Eliminar empleado de nómina?")) return;
      write(
        KEYS.payrollEmployees,
        read(KEYS.payrollEmployees, []).filter((e) => e.id !== btn.dataset.id)
      );
      renderPortalView();
    });
  });

  const payrollForm = document.getElementById("form-payroll");
  if (payrollForm) {
    payrollForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(payrollForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((e) => e.id === data.employeeId);
      if (!employee) return;
      const gross = parseNum(employee.baseSalary) + parseNum(data.extras) + parseNum(data.aux) + parseNum(data.bonus);
      const deductions = parseNum(data.health) + parseNum(data.pension) + parseNum(data.arl);
      const net = gross - deductions;
      const run = {
        id: uid(),
        employeeId: employee.id,
        employeeName: employee.name,
        month: data.month,
        gross,
        deductions,
        net,
        paid: false,
        createdAt: nowIso()
      };
      const runs = read(KEYS.payrollRuns, []);
      runs.unshift(run);
      write(KEYS.payrollRuns, runs);
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='payslip']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const run = read(KEYS.payrollRuns, []).find((r) => r.id === btn.dataset.id);
      if (!run) return;
      const pop = window.open("", "_blank", "width=600,height=700");
      pop.document.write(`
        <html><head><title>Desprendible ${run.employeeName}</title></head>
        <body style="font-family:Arial;padding:20px">
          <h1>Desprendible de pago</h1>
          <p>Empleado: ${run.employeeName}</p>
          <p>Periodo: ${run.month}</p>
          <p>Devengado: ${run.gross}</p>
          <p>Deducciones: ${run.deductions}</p>
          <p>Neto: ${run.net}</p>
          <p>Generado: ${fmtDate(run.createdAt)}</p>
        </body></html>
      `);
      pop.document.close();
      const all = read(KEYS.payrollRuns, []);
      write(
        KEYS.payrollRuns,
        all.map((item) => (item.id === run.id ? { ...item, paid: true } : item))
      );
      renderPortalView();
    });
  });

  const exportPayroll = document.getElementById("export-payroll");
  if (exportPayroll) {
    exportPayroll.addEventListener("click", () => {
      const rows = read(KEYS.payrollRuns, []);
      const csv = ["Mes,Empleado,Devengado,Deducciones,Neto,Estado"]
        .concat(rows.map((r) => `${r.month},${r.employeeName},${r.gross},${r.deductions},${r.net},${r.paid ? "Pagado" : "Pendiente"}`))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nomina_resumen.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const vacancyForm = document.getElementById("form-vacancy");
  if (vacancyForm) {
    vacancyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(vacancyForm).entries());
      const all = read(KEYS.vacancies, []);
      all.unshift({ id: uid(), ...data, status: "Publicada", createdAt: nowIso() });
      write(KEYS.vacancies, all);
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='close-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const all = read(KEYS.vacancies, []);
      write(
        KEYS.vacancies,
        all.map((v) => (v.id === btn.dataset.id ? { ...v, status: "Cerrada" } : v))
      );
      renderPortalView();
    });
  });

  const candidateForm = document.getElementById("form-candidate");
  if (candidateForm) {
    candidateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(candidateForm).entries());
      const vac = read(KEYS.vacancies, []).find((v) => v.id === data.vacancyId);
      if (!vac) return;
      const files = [...candidateForm.querySelector("input[name='attachments']").files].map((f) => f.name);
      const all = read(KEYS.candidates, []);
      all.unshift({
        id: uid(),
        name: data.name,
        email: data.email,
        vacancyId: vac.id,
        vacancyTitle: vac.title,
        status: PIPELINE[0],
        attachments: files,
        createdAt: nowIso()
      });
      write(KEYS.candidates, all);
      sendEmail({ to: data.email, subject: "Registro recibido", body: "Gracias por aplicar." });
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='candidate-status']").forEach((select) => {
    select.addEventListener("change", () => {
      const all = read(KEYS.candidates, []);
      const updated = all.map((c) => (c.id === select.dataset.id ? { ...c, status: select.value } : c));
      write(KEYS.candidates, updated);
      const current = updated.find((c) => c.id === select.dataset.id);
      if (current) {
        sendEmail({
          to: current.email,
          subject: "Actualizacion de proceso",
          body: `Tu estado cambio a: ${current.status}`
        });
      }
      renderPortalView();
    });
  });

  const interviewForm = document.getElementById("form-interview");
  if (interviewForm) {
    interviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(interviewForm).entries());
      const candidate = read(KEYS.candidates, []).find((c) => c.id === data.candidateId);
      if (!candidate) return;
      const all = read(KEYS.interviews, []);
      all.unshift({
        id: uid(),
        candidateId: candidate.id,
        candidateName: candidate.name,
        when: data.when,
        interviewer: data.interviewer
      });
      write(KEYS.interviews, all);
      sendEmail({ to: candidate.email, subject: "Entrevista programada", body: `Fecha: ${data.when}` });
      renderPortalView();
    });
  }

  const contractForm = document.getElementById("form-contract");
  if (contractForm) {
    contractForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(contractForm).entries());
      const candidate = read(KEYS.candidates, []).find((c) => c.id === data.candidateId);
      if (!candidate) return;
      const text = `CONTRATO LABORAL\nEmpleado: ${candidate.name}\nCargo: ${data.position}\nSalario: ${data.salary}\nFecha inicio: ${data.startDate}\nEmpresa: Antares`;
      const all = read(KEYS.contracts, []);
      all.unshift({
        id: uid(),
        candidateId: candidate.id,
        candidateName: candidate.name,
        position: data.position,
        salary: data.salary,
        startDate: data.startDate,
        content: text,
        createdAt: nowIso()
      });
      sendEmail({ to: candidate.email, subject: "Oferta/Contrato generado", body: text });
      renderPortalView();
    });
  }

  const employeeContractForm = document.getElementById("form-employee-contract");
  if (employeeContractForm) {
    employeeContractForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(employeeContractForm).entries());
      const employee = read(KEYS.payrollEmployees, []).find((item) => item.id === data.employeeId);
      if (!employee) return;
      const contractText =
        `CONTRATO LABORAL\n` +
        `Empresa: Antares\n` +
        `Empleado: ${employee.name}\n` +
        `Cédula: ${employee.idDoc}\n` +
        `Cargo: ${employee.position}\n` +
        `Tipo de contrato: ${data.contractType}\n` +
        `Salario: ${data.salary}\n` +
        `Fecha de inicio: ${data.startDate}\n` +
        `Fecha de generación: ${new Date().toLocaleDateString("es-CO")}\n`;

      const all = read(KEYS.contracts, []);
      all.unshift({
        id: uid(),
        employeeId: employee.id,
        employeeName: employee.name,
        position: employee.position,
        salary: data.salary,
        startDate: data.startDate,
        source: "Empleado",
        content: contractText,
        createdAt: nowIso()
      });
      write(KEYS.contracts, all);

      const popup = window.open("", "_blank", "width=800,height=900");
      popup.document.write(`
        <html>
          <head><title>Contrato ${employee.name}</title></head>
          <body style="font-family:Arial;padding:28px">
            <h1>Contrato laboral</h1>
            <pre style="white-space:pre-wrap;font-size:15px;line-height:1.6">${contractText}</pre>
            <p>Firma empresa: ____________________</p>
            <p>Firma empleado: ___________________</p>
            <script>window.print();</script>
          </body>
        </html>
      `);
      popup.document.close();
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='view-contract']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = read(KEYS.contracts, []).find((x) => x.id === btn.dataset.id);
      if (!c) return;
      const popup = window.open("", "_blank", "width=800,height=900");
      popup.document.write(`
        <html>
          <head><title>Contrato</title></head>
          <body style="font-family:Arial;padding:28px">
            <h1>Contrato laboral</h1>
            <pre style="white-space:pre-wrap;font-size:15px;line-height:1.6">${c.content}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      popup.document.close();
    });
  });
}

function initGlobalEvents() {
  nodes.openAuth.addEventListener("click", showAuth);
  if (nodes.openAuthHero) {
    nodes.openAuthHero.addEventListener("click", showAuth);
  }
  nodes.closeAuth.addEventListener("click", hideAuth);

  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mainNav = document.getElementById("main-nav");
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener("click", () => {
      mainNav.classList.toggle("nav-open");
    });
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => mainNav.classList.remove("nav-open"));
    });
  }
  nodes.authTabs.forEach((tabBtn) =>
    tabBtn.addEventListener("click", () => {
      state.authTab = tabBtn.dataset.tab;
      renderAuthTab();
    })
  );
  nodes.authModal.addEventListener("click", (event) => {
    if (event.target === nodes.authModal) hideAuth();
  });

  nodes.b2bForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(nodes.b2bForm).entries());
    const all = read(KEYS.contacts, []);
    all.unshift({ id: uid(), ...data, createdAt: nowIso() });
    write(KEYS.contacts, all);
    sendEmail({ to: "comercial@antarescargo.com", subject: "Nuevo lead B2B", body: JSON.stringify(data) });
    nodes.b2bForm.reset();
    alert("Contacto enviado.");
  });

  nodes.sideLinks.forEach((link) => {
    link.addEventListener("click", () => setView(link.dataset.view));
  });

  window.addEventListener("hashchange", () => {
    const user = currentUser();
    if (!state.session || !user) return;
    const urlView = viewFromPortalHash();
    if (!urlView) return;
    if (!isViewAllowedForUser(user, urlView)) {
      state.currentView = "dashboard";
      syncPortalHash("dashboard");
      renderPortalView();
      return;
    }
    state.currentView = urlView;
    renderPortalView();
  });

  nodes.logout.addEventListener("click", () => {
    clearSession();
    state.currentView = "dashboard";
    history.replaceState(null, "", window.location.pathname + window.location.search);
    renderPortal();
  });
}

function initPublicEffects() {
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 40, 280)}ms`;
    observer.observe(item);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.getElementById("hero");
  if (!hero || prefersReducedMotion) return;

  window.addEventListener(
    "scroll",
    () => {
      const offset = window.scrollY * 0.15;
      hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
    },
    { passive: true }
  );

  const tiltCards = document.querySelectorAll("[data-tilt]");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateY = ((x / bounds.width) - 0.5) * 7;
      const rotateX = (0.5 - y / bounds.height) * 7;
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

seed();
ensureUsersPasswordHashing();
initGlobalEvents();
initPublicEffects();
renderPortal();
setInterval(() => {
  if (!state.session) return;
  updateAutoApprove();
  renderPortalView();
}, 30000);
