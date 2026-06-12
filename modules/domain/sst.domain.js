/**
 * Dominio SST, cumplimiento laboral, normalizadores RRHH y sincronización admin / empleado–conductor.
 * La deduplicación de contratos en caché sigue en `contracts.domain.js` (`contractDedupKey`, `dedupContracts`, `purgeDuplicateContracts`).
 * Extraído desde `portal-runtime.js` (Fase 13).
 */
import {
  KEYS,
  ROLES,
  CO_CATALOGS,
  PERMISSIONS,
  SST_COMPLIANCE_RECORD_TYPES,
  SST_COMPLIANCE_STATUSES
} from "../core/config.js";
import { read, write, writeAwaitServer } from "../core/data-io.js";
import { state } from "../core/store.js";
import {
  escapeAttr,
  devWarn,
  normalizePortalDateYmd,
  formatPortalPhoneForDisplay,
  getColombiaDateParts,
  stampUpdatedRecord,
  normalizeAdminUsersSection
} from "../core/utils.js";
import {
  ACCOUNT_STATUS,
  canApprovePortalRegistration,
  currentUser,
  hasPermission,
  pendingUserOrigin,
  isPortalUserPendingApproval
} from "../core/auth.js";
import { portalCanRefreshFromApi, startPortalBootstrapForInteractiveSession } from "../core/bootstrap.js";
import { scheduleRenderPortalView } from "../core/router.js";
import { renderModuleWindowTabs } from "../ui/components.js";
import { matchCatalogOptionValue, normalizePortalPhoneForStorage } from "./payroll-catalog-sanitize.domain.js";
import { normalizeDocumentDigits } from "./payroll-identifiers.domain.js";
import { payrollNormalizeAbsenceTypeKey, payrollNormalizeAbsenceSubtype } from "./nomina.domain.js";
import { buildEmployeeBasicPatchFromDriver, syncDriverFromEmployee } from "./reporteria.domain.js";
import { reqRead, reqWriteAwait } from "./solicitudes.domain.js";
import { writeFuelLogsAwait } from "./historial.domain.js";
import { recalculateResourceAvailability } from "./viajes.domain.js";
import { userMessage } from "../ui/modals.js";

function ic() {
  return typeof globalThis !== "undefined" && globalThis.IC ? globalThis.IC : /** @type {Record<string, string>} */ ({});
}

function isCompanyRecordActive(c) {
  return Boolean(c && c.active !== false);
}

/** Misma semántica que `toInputDate` en portal-runtime (zona horaria Colombia). */
function toLocalInputDateFromIso(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const p = getColombiaDateParts(d);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function normalizeSstComplianceRow(row) {
  if (!row || typeof row !== "object") return row;
  const due = normalizePortalDateYmd(row.dueDate || row.expiryDate);
  const recordType = String(row.recordType || "").trim();
  const status = String(row.status || "Pendiente").trim();
  const rtMatch =
    SST_COMPLIANCE_RECORD_TYPES.find((t) => t.toLowerCase() === recordType.toLowerCase()) || recordType;
  const stMatch = SST_COMPLIANCE_STATUSES.find((t) => t.toLowerCase() === status.toLowerCase()) || status;
  return { ...row, dueDate: due, expiryDate: due, recordType: rtMatch, status: stMatch };
}

export function normalizeVacancyRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const v = { ...raw };
  v.deadline = normalizePortalDateYmd(v.deadline);
  v.publishedFrom = normalizePortalDateYmd(v.publishedFrom || v.visibleFrom);
  return v;
}

export function normalizePositionRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const p = { ...raw };
  p.contractTypeDefault = matchCatalogOptionValue(CO_CATALOGS.positionContractTypes, p.contractTypeDefault);
  p.workSchedule = matchCatalogOptionValue(CO_CATALOGS.workSchedule, p.workSchedule);
  p.arlRiskLevel = matchCatalogOptionValue(CO_CATALOGS.arlRiskLevels, p.arlRiskLevel);
  return p;
}

export function normalizeCandidateRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const c = { ...raw };
  c.documentType =
    matchCatalogOptionValue(CO_CATALOGS.documentTypes, c.documentType) || String(c.documentType || "CC").trim();
  c.educationLevel = matchCatalogOptionValue(CO_CATALOGS.educationLevel, c.educationLevel);
  c.birthDate = normalizePortalDateYmd(c.birthDate);
  c.availabilityDate = normalizePortalDateYmd(c.availabilityDate);
  const phoneDisp = formatPortalPhoneForDisplay(c.phone);
  if (phoneDisp) c.phone = phoneDisp;
  return c;
}

export function normalizeInterviewRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const i = { ...raw };
  const rawWhen = String(i.when || "").trim();
  const toInputDate =
    typeof globalThis.toInputDate === "function" ? globalThis.toInputDate : toLocalInputDateFromIso;
  i.whenLocal =
    rawWhen.length >= 16 && rawWhen.includes("T") && !rawWhen.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(rawWhen)
      ? rawWhen.slice(0, 16)
      : String(toInputDate(rawWhen) || "").slice(0, 16);
  return i;
}

export function normalizeHrAbsenceRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const a = { ...raw };
  a.startDate = normalizePortalDateYmd(a.startDate);
  a.endDate = normalizePortalDateYmd(a.endDate);
  a.absenceType = payrollNormalizeAbsenceTypeKey(a.absenceType || "incapacidad_eps");
  a.absenceSubtype = payrollNormalizeAbsenceSubtype(a.absenceType, a.absenceSubtype);
  return a;
}

export function patchApprovalRowForEmployee(approval, employee, empId, empName) {
  if (!approval || typeof approval !== "object") return approval;
  const payload = approval.payload && typeof approval.payload === "object" ? { ...approval.payload } : null;
  if (!payload) return approval;
  let changed = false;
  let next = approval;
  const docMatch =
    normalizeDocumentDigits(payload.idDoc) &&
    normalizeDocumentDigits(payload.idDoc) === normalizeDocumentDigits(employee?.idDoc);

  if (approval.type === "register_hr_absence" && String(payload.employeeId || "") === empId) {
    payload.employeeName = empName;
    changed = true;
    next = {
      ...next,
      title: `Registro de ausencia de ${empName}`,
      payload
    };
  } else if (approval.type === "mark_payroll_paid") {
    const run = read(KEYS.payrollRuns, []).find((row) => String(row.id) === String(payload.payrollRunId || ""));
    if (run && String(run.employeeId || "") === empId) {
      payload.employeeName = empName;
      changed = true;
      const month = String(payload.month || run.month || "").trim();
      next = {
        ...next,
        title: month ? `Aprobar pago de nomina ${empName} (${month})` : `Aprobar pago de nomina ${empName}`,
        payload
      };
    }
  } else if (
    (approval.type === "create_employee" || approval.type === "update_employee") &&
    (String(payload.employeeId || "") === empId || docMatch)
  ) {
    payload.name = empName;
    payload.phone = employee.phone;
    payload.position = employee.position;
    payload.idDoc = employee.idDoc;
    changed = true;
    next = {
      ...next,
      title:
        approval.type === "update_employee"
          ? `Modificacion de colaborador ${empName}`
          : `Creacion de empleado ${empName}`,
      payload
    };
  }

  return changed ? next : approval;
}

/**
 * Tras guardar en Gestión humana: actualiza conductor (si aplica) y copias desnormalizadas
 * (contratos, liquidaciones, ausencias, SST, autorizaciones, viajes, combustible).
 */
export async function propagateEmployeeChanges(employee, extraDriverData = {}) {
  if (!employee?.id) return { ok: true, skipped: true };
  const empId = String(employee.id);
  const empName = String(employee.name || "").trim();
  const empDoc = String(employee.idDoc || "").trim();
  const company = read(KEYS.companies, []).find((row) => String(row.id) === String(employee.companyId || ""));
  const companyName = String(company?.name || "").trim();

  let driverResult = { ok: true, skipped: true };
  if (String(employee.workerRole || "") === "conductor") {
    driverResult = await syncDriverFromEmployee(employee, extraDriverData);
    if (!driverResult.ok) return driverResult;
  }

  const readTransport =
    typeof globalThis.readEmployeeTransportAllowanceCop === "function"
      ? globalThis.readEmployeeTransportAllowanceCop
      : () => 0;

  const contractFields = {
    employeeName: empName,
    employeeIdDoc: empDoc,
    idDocSnapshot: empDoc,
    position: String(employee.position || "").trim(),
    positionName: String(employee.position || "").trim(),
    positionId: String(employee.positionId || "").trim(),
    companyId: String(employee.companyId || "").trim(),
    companyName,
    salary: employee.baseSalary,
    transportAllowance: readTransport(employee),
    contractType: employee.contractType,
    workerRole: employee.workerRole,
    eps: String(employee.eps || "").trim(),
    pensionFund: String(employee.pensionFund || "").trim(),
    arl: String(employee.arl || "").trim(),
    schedule: String(employee.workSchedule || "").trim()
  };

  const contracts = read(KEYS.contracts, []);
  const empDocDigits = normalizeDocumentDigits(empDoc);
  let contractsChanged = false;
  const nextContracts = contracts.map((row) => {
    const linkedById = String(row.employeeId || "") === empId;
    const linkedByDoc =
      !linkedById && empDocDigits && normalizeDocumentDigits(row.idDocSnapshot || row.employeeIdDoc) === empDocDigits;
    if (!linkedById && !linkedByDoc) return row;
    contractsChanged = true;
    return stampUpdatedRecord({
      ...row,
      ...contractFields,
      id: row.id,
      employeeId: row.employeeId || empId
    });
  });

  const payrollRuns = read(KEYS.payrollRuns, []);
  let runsChanged = false;
  const nextRuns = payrollRuns.map((row) => {
    if (String(row.employeeId || "") !== empId) return row;
    runsChanged = true;
    return stampUpdatedRecord({ ...row, employeeName: empName, id: row.id });
  });

  const absences = read(KEYS.hrAbsences, []);
  let absencesChanged = false;
  const nextAbsences = absences.map((row) => {
    if (String(row.employeeId || "") !== empId) return row;
    absencesChanged = true;
    return stampUpdatedRecord({ ...row, employeeName: empName, id: row.id });
  });

  const sstRecords = read(KEYS.sstCompliance, []);
  let sstChanged = false;
  const nextSst = sstRecords.map((row) => {
    if (String(row.employeeId || "") !== empId) return normalizeSstComplianceRow(row);
    sstChanged = true;
    return normalizeSstComplianceRow(stampUpdatedRecord({ ...row, employeeName: empName, id: row.id }));
  });

  const approvals = read(KEYS.approvals, []);
  let approvalsChanged = false;
  const nextApprovals = approvals.map((row) => {
    const patched = patchApprovalRowForEmployee(row, employee, empId, empName);
    if (patched !== row) approvalsChanged = true;
    return patched;
  });

  const drivers = read(KEYS.drivers, []);
  const driver =
    drivers.find((row) => String(row.id) === String(driverResult.driverId || "")) ||
    drivers.find((row) => normalizeDocumentDigits(row.idDoc) === normalizeDocumentDigits(empDoc));
  const driverId = driver ? String(driver.id) : "";
  const driverPhone = normalizePortalPhoneForStorage(String(driver?.phone || employee.phone || ""));

  let tripsChanged = false;
  let nextRequests = reqRead();
  if (driverId || empName) {
    const nameLower = empName.toLowerCase();
    nextRequests = nextRequests.map((req) => {
      if (!req.trip) return req;
      const tripDriverId = String(req.trip.driverId || "");
      const matchById = driverId && tripDriverId === driverId;
      const matchByName =
        !tripDriverId && empName && String(req.trip.driverName || "").trim().toLowerCase() === nameLower;
      if (!matchById && !matchByName) return req;
      tripsChanged = true;
      return {
        ...req,
        trip: stampUpdatedRecord({
          ...req.trip,
          driverName: empName || req.trip.driverName,
          driverPhone: driverPhone || req.trip.driverPhone
        })
      };
    });
  }

  const fuelLogs = read(KEYS.fuelLogs, []);
  let fuelChanged = false;
  const nextFuel = fuelLogs.map((row) => {
    if (!driverId || String(row.driverId || "") !== driverId) return row;
    fuelChanged = true;
    return stampUpdatedRecord({
      ...row,
      driverName: empName,
      driverPhone,
      id: row.id
    });
  });

  try {
    if (contractsChanged) await writeAwaitServer(KEYS.contracts, nextContracts, { notifyOnFailure: false });
    if (runsChanged) await writeAwaitServer(KEYS.payrollRuns, nextRuns, { notifyOnFailure: false });
    if (absencesChanged) await writeAwaitServer(KEYS.hrAbsences, nextAbsences, { notifyOnFailure: false });
    if (sstChanged) await writeAwaitServer(KEYS.sstCompliance, nextSst, { notifyOnFailure: false });
    if (approvalsChanged) await writeAwaitServer(KEYS.approvals, nextApprovals, { notifyOnFailure: false });
    if (tripsChanged) await reqWriteAwait(nextRequests);
    if (fuelChanged) await writeFuelLogsAwait(nextFuel);
    if (tripsChanged) recalculateResourceAvailability();
  } catch (err) {
    return {
      ok: false,
      message: String(err?.message || "Empleado guardado, pero falló la actualización en módulos vinculados.")
    };
  }
  return { ok: true, driver: driverResult };
}

/** Conductores → Gestión humana: solo datos básicos; no toca nómina ni contrato. */
export async function syncEmployeeFromDriver(employee, driverPatch) {
  if (!employee?.id || !driverPatch) return { ok: true, skipped: true };
  const basicPatch = buildEmployeeBasicPatchFromDriver(driverPatch);
  const merged = stampUpdatedRecord({
    ...employee,
    ...basicPatch,
    id: employee.id,
    workerRole: employee.workerRole,
    companyId: employee.companyId,
    idDoc: employee.idDoc,
    documentType: employee.documentType
  });
  try {
    const employees = read(KEYS.payrollEmployees, []);
    const next = employees.map((row) => (String(row.id) === String(employee.id) ? merged : row));
    await writeAwaitServer(KEYS.payrollEmployees, next, { notifyOnFailure: false });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: String(err?.message || userMessage("driverUpdatedHrSyncFailed"))
    };
  }
}

/** Fusiona filas de GET /portal/pending-user-registrations sin borrar el resto de usuarios en caché. */
export function mergePendingUserRegistrationsIntoCache(rows) {
  if (!Array.isArray(rows)) return;
  const normalized = rows.map((row) =>
    typeof window.normalizePortalBootstrapUserRow === "function" ? window.normalizePortalBootstrapUserRow(row) : row
  );
  const existing = read(KEYS.users, []);
  const byId = new Map(existing.map((u) => [String(u.id), { ...u }]));
  const orphansSeen = new Set();
  for (const row of normalized) {
    const id = String(row.id || "").trim();
    if (!id) continue;
    const prev = byId.get(id) || {};
    if (pendingUserOrigin(row) === "supabase_auth_only") {
      orphansSeen.add(id);
    }
    byId.set(id, {
      ...prev,
      ...row,
      accountStatus: row.accountStatus || prev.accountStatus || ACCOUNT_STATUS.PENDIENTE,
      source: row.source || prev.source || "portal_db"
    });
  }
  const out = [];
  for (const u of byId.values()) {
    if (pendingUserOrigin(u) === "supabase_auth_only" && !orphansSeen.has(String(u.id))) {
      continue;
    }
    out.push(u);
  }
  write(KEYS.users, out, { skipSyncSchedule: true });
}

/** Bandeja de altas pendientes (requiere permiso de autorización de registros web). */
export async function applyPendingUserRegistrationsFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  if (!canApprovePortalRegistration(currentUser())) return false;
  const api = window.AntaresApi;
  try {
    const rows = await api.getJson("/portal/pending-user-registrations");
    if (!Array.isArray(rows)) return false;
    mergePendingUserRegistrationsIntoCache(rows);
    return true;
  } catch (err) {
    devWarn("Portal: GET /portal/pending-user-registrations fallo.", err?.message || err);
    return false;
  }
}

/** Lista prospectos B2B sin depender del bootstrap pesado (mitiga fallos al abrir Solicitudes contacto web). */
export async function refreshContactB2bProspectsFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  const api = window.AntaresApi;
  try {
    const rows = await api.getJson("/portal/contact-b2b-prospects");
    if (!Array.isArray(rows)) return false;
    state.portalContacts = rows;
    return true;
  } catch (err) {
    devWarn("Portal: GET /portal/contact-b2b-prospects fallo.", err?.message || err);
    return false;
  }
}

/** Solo administración/usuarios: sesiones activas e históricas desde API (tabla sesiones_usuario). */
export async function refreshAdminUserSessionsFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  const user = currentUser();
  if (!user || !hasPermission(user, PERMISSIONS.USERS_MANAGE)) return false;
  const api = window.AntaresApi;
  try {
    const rows = await api.getJson("/portal/user-sessions");
    state.adminUserSessions = Array.isArray(rows) ? rows : [];
    state.adminUserSessionsError = null;
    return true;
  } catch (err) {
    state.adminUserSessionsError = String(
      err?.message || "No fue posible consultar sesiones de usuarios en el servidor."
    );
    return false;
  }
}

export function adminUsersHasPendingInCache() {
  return read(KEYS.users, []).some((u) => isPortalUserPendingApproval(u));
}

export function resolveAdminUsersSectionAfterEntrySync() {
  const getUi = globalThis.getAdminUsersUi;
  const setUi = globalThis.setAdminUsersUi;
  if (typeof getUi !== "function" || typeof setUi !== "function") return;
  const ui = getUi();
  const section = normalizeAdminUsersSection(ui.section, adminUsersHasPendingInCache());
  if (section !== ui.section) setUi({ section });
}

let __adminUserSessionsLoadGen = 0;

/**
 * Carga sesiones bajo demanda (pestaña Sesiones o botón Actualizar).
 * Evita un repintado completo del módulo al entrar en Usuarios.
 */
export async function ensureAdminUserSessionsLoaded(opts = {}) {
  const force = Boolean(opts && opts.force);
  if (!portalCanRefreshFromApi()) return false;
  if (!hasPermission(currentUser(), PERMISSIONS.USERS_MANAGE)) return false;
  if (state.adminUserSessionsHydrated && !force) return true;
  if (state.adminUserSessionsLoading) return false;
  state.adminUserSessionsLoading = true;
  state.adminUserSessionsError = null;
  const gen = ++__adminUserSessionsLoadGen;
  let ok = false;
  try {
    ok = await refreshAdminUserSessionsFromApi();
  } catch (_e) {
    ok = false;
  } finally {
    if (gen === __adminUserSessionsLoadGen) {
      state.adminUserSessionsLoading = false;
      if (ok) state.adminUserSessionsHydrated = true;
    }
  }
  return ok;
}

/** Pendientes en servidor + bootstrap en curso antes del primer pintado estable del módulo. */
export async function syncAdminUsersModuleOnEntry() {
  if (!portalCanRefreshFromApi()) return;
  const tasks = [];
  const boot = window.__portalBootstrapInFlight;
  if (boot && typeof boot.then === "function") tasks.push(boot.catch(() => false));
  if (currentUser()?.role === ROLES.ADMIN) {
    tasks.push(applyPendingUserRegistrationsFromApi().catch(() => false));
  }
  if (tasks.length) await Promise.all(tasks);
}

export function finalizeAdminUsersModuleEntry() {
  resolveAdminUsersSectionAfterEntrySync();
  state.adminUsersEntryHydrating = false;
  const getUi = globalThis.getAdminUsersUi;
  if (typeof getUi !== "function") return;
  const ui = getUi();
  if (
    ui.section === "sessions" &&
    portalCanRefreshFromApi() &&
    hasPermission(currentUser(), PERMISSIONS.USERS_MANAGE)
  ) {
    void ensureAdminUserSessionsLoaded().finally(() => {
      if (state.currentView === "admin-users") scheduleRenderPortalView();
    });
    return;
  }
  if (state.currentView === "admin-users") scheduleRenderPortalView();
}

export function adminUsersEntryHydratingBodyHtml(activeSection) {
  const active = String(activeSection || "users");
  const panelIds = ["actions", "pending", "users", "companies", "sessions"];
  const panels = panelIds
    .map((id) => {
      const hidden = id !== active ? " hidden" : "";
      const body =
        id === active
          ? `<p class="admin-users-inline-note muted">Actualizando directorio desde el servidor…</p>`
          : "";
      return `<div class="auth-tab-panel${hidden}" data-admin-users-panel="${escapeAttr(id)}"${hidden}>${body}</div>`;
    })
    .join("");
  return `<div class="auth-tab-panels">${panels}</div>`;
}

export function adminUsersHydratingShellHtml({ pendingUsers, activeUsers, companies, ui }) {
  const IC = ic();
  const approvedCount = activeUsers.filter((u) => u.accountStatus === ACCOUNT_STATUS.APROBADO).length;
  const activeCompaniesCount = companies.filter((c) => isCompanyRecordActive(c)).length;
  const inactiveCompaniesCount = Math.max(0, companies.length - activeCompaniesCount);
  const section = String(ui.section || "users");
  const sessions = Array.isArray(state.adminUserSessions) ? state.adminUserSessions : [];
  const hero = `<section class="users-hero-strip users-hero-strip--command">
    <div class="admin-users-hero-main">
      <p class="users-hero-kicker">Sistema de acceso y gobierno</p>
      <h2>Usuarios y permisos con una lectura mas clara</h2>
      <p>
        Centralice aprobaciones, altas y cambios de acceso en una vista mas limpia, con menos ruido visual y mejor jerarquia.
      </p>
      <div class="admin-users-hero-chips">
        <span class="status ${pendingUsers.length ? "status-pendiente" : "status-viaje_asignado"}">Pendientes ${pendingUsers.length}</span>
        <span class="status status-viaje_asignado">Aprobados ${approvedCount}</span>
        <span class="status ${inactiveCompaniesCount ? "status-pendiente" : "status-viaje_asignado"}">Empresas activas ${activeCompaniesCount}</span>
      </div>
    </div>
    <div class="admin-users-hero-panel admin-users-hero-panel--compact">
      <p class="admin-users-hero-panel__eyebrow">Acciones rapidas</p>
      <p class="admin-users-hero-panel__copy">
        Abra solo el flujo que necesita y mantenga el resto del modulo despejado.
      </p>
      <div class="users-hero-actions">
        <button class="btn btn-primary btn-sm" data-action="toggle-admin-panel" data-panel="create-user" disabled>${IC.userPlus} Nuevo usuario</button>
        <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="create-company" disabled>${IC.building || IC.briefcase} Nueva empresa</button>
        <button class="btn btn-action btn-sm" data-action="toggle-admin-panel" data-panel="set-permissions" disabled>${IC.shield} Asignar permisos</button>
        <button class="btn btn-outline btn-sm" data-action="refresh-user-sessions" disabled>${IC.activity} Actualizar sesiones</button>
      </div>
    </div>
  </section>`;
  const workspaceNav = renderModuleWindowTabs({
    ariaLabel: "Opciones del módulo Usuarios y permisos",
    activeId: section,
    action: "admin-users-section",
    valueAttr: "section",
    tabs: [
      { id: "actions", label: "Acciones" },
      { id: "pending", label: "Pendientes", count: pendingUsers.length },
      { id: "users", label: "Usuarios", count: activeUsers.length },
      { id: "companies", label: "Empresas", count: companies.length },
      { id: "sessions", label: "Sesiones", count: sessions.length }
    ]
  });
  return `${hero}${workspaceNav}${adminUsersEntryHydratingBodyHtml(section)}`;
}

/** Evita POST /portal/sync-key con el array completo de usuarios mientras se ajusta caché a mano. */
export function portalPatchUsersCacheWithoutSyncKey(mutator) {
  if (typeof mutator !== "function") return;
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    mutator();
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

/**
 * Tras POST que muta usuarios en PostgreSQL: volcado bootstrap y cola de pendientes (admin).
 * El merge de pendientes también va bajo begin/end para no disparar sync-key redundante.
 */
export async function portalRefreshBootstrapThenPendingRegistrations() {
  await startPortalBootstrapForInteractiveSession();
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    if (currentUser()?.role === ROLES.ADMIN) {
      await applyPendingUserRegistrationsFromApi();
    }
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}
