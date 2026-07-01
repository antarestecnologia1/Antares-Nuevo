/** Imports ES: el runtime ya no depende del orden defer vs módulos en index.html. */
import * as __pr from "./portal-runtime-env.mjs";
import {
  findPendingCreateEmployeeApproval,
  listPendingCreateEmployeeApprovalsByDocument
} from "../domain/pending-employee-approval.domain.js";
import { detailViewCardMarkup } from "../ui/components.js";

// Enlaces léxicos (módulo estricto; `IC` sigue viniendo del script `portal-icons.js`).
const ALL_PERMISSIONS = __pr.ALL_PERMISSIONS;
const APPROVAL_TYPE_META = __pr.APPROVAL_TYPE_META;
const APPROVAL_UI_BLOCKS = __pr.APPROVAL_UI_BLOCKS;
const AUTH_QUEUE_SHORT_TAB_LABELS = __pr.AUTH_QUEUE_SHORT_TAB_LABELS;
const AUTO_APPROVE_MINUTES = __pr.AUTO_APPROVE_MINUTES;
const CLIENT_DATA_SCOPE = __pr.CLIENT_DATA_SCOPE;
const CLIENT_DATA_SCOPE_STORAGE = __pr.CLIENT_DATA_SCOPE_STORAGE;
const COLOMBIA_LOCATIONS = __pr.COLOMBIA_LOCATIONS;
const CO_CATALOGS = __pr.CO_CATALOGS;
const CO_CESANTIAS_INTERES_ANUAL_PCT = __pr.CO_CESANTIAS_INTERES_ANUAL_PCT;
const CO_HR_RULES = __pr.CO_HR_RULES;
const CO_INTEGRAL_SALARY_MIN_SMMLV = __pr.CO_INTEGRAL_SALARY_MIN_SMMLV;
const CO_PAYROLL = __pr.CO_PAYROLL;
const CO_TIMEZONE = __pr.CO_TIMEZONE;
const CO_TRANSPORT_ALLOWANCE_MAX_SMMLV = __pr.CO_TRANSPORT_ALLOWANCE_MAX_SMMLV;
const DEFAULT_OPEN_CREATE_PANELS = __pr.DEFAULT_OPEN_CREATE_PANELS;
const FLEET_DRIVER_EDIT_ACTIONS = __pr.FLEET_DRIVER_EDIT_ACTIONS;
const HIRING_RRHH_EDIT_ACTIONS = __pr.HIRING_RRHH_EDIT_ACTIONS;
const SST_RRHH_EDIT_ACTIONS = __pr.SST_RRHH_EDIT_ACTIONS;
const PORTAL_NON_ADMIN_BLOCKED_ACTIONS = __pr.PORTAL_NON_ADMIN_BLOCKED_ACTIONS;
const HISTORY_FLEET_TECH_LABELS = __pr.HISTORY_FLEET_TECH_LABELS;
const HR_VALID_HIRING_WS = __pr.HR_VALID_HIRING_WS;
const HR_VALID_PAYROLL_WS = __pr.HR_VALID_PAYROLL_WS;
const HR_WORKSPACE_STORAGE = __pr.HR_WORKSPACE_STORAGE;
const KEYS = __pr.KEYS;
const LABOR_SYSTEM_PARAMETERS_MAX_YEAR = __pr.LABOR_SYSTEM_PARAMETERS_MAX_YEAR;
const LABOR_SYSTEM_PARAMETERS_MIN_YEAR = __pr.LABOR_SYSTEM_PARAMETERS_MIN_YEAR;
const LOGIN_REMEMBER_STORAGE_KEY = __pr.LOGIN_REMEMBER_STORAGE_KEY;
const MODULE_PANEL_BTN_TITLES = __pr.MODULE_PANEL_BTN_TITLES;
const MODULE_PANEL_LABELS = __pr.MODULE_PANEL_LABELS;
const NOTIF_LIGHT_REFRESH_MIN_MS = __pr.NOTIF_LIGHT_REFRESH_MIN_MS;
const NOTIF_SILENT_BOOTSTRAP_MIN_MS = __pr.NOTIF_SILENT_BOOTSTRAP_MIN_MS;
const PAYROLL_ABSENCE_LEGAL_LIMITS = __pr.PAYROLL_ABSENCE_LEGAL_LIMITS;
const PERMISSIONS = __pr.PERMISSIONS;
const PERMISSION_META = __pr.PERMISSION_META;
const PERMISSION_UI_GROUPS = __pr.PERMISSION_UI_GROUPS;
const PIPELINE = __pr.PIPELINE;
const PIPELINE_TRANSITIONS = __pr.PIPELINE_TRANSITIONS;
const PORTAL_ASSIGNABLE_ROLES = __pr.PORTAL_ASSIGNABLE_ROLES;
const REGISTER_PRIVACY_URL = __pr.REGISTER_PRIVACY_URL;
const REGISTER_TERMS_URL = __pr.REGISTER_TERMS_URL;
const REPORT_BRAND_LOGO_PATH = __pr.REPORT_BRAND_LOGO_PATH;
const REPORT_EXPORT_BRAND = __pr.REPORT_EXPORT_BRAND;
const REPORT_RULES = __pr.REPORT_RULES;
const REQUEST_EDIT_JUSTIFICATION_MIN_LEN = __pr.REQUEST_EDIT_JUSTIFICATION_MIN_LEN;
const ROLES = __pr.ROLES;
const SEARCHABLE_SELECT_MIN_OPTIONS = __pr.SEARCHABLE_SELECT_MIN_OPTIONS;
const SESSION_API_REFRESH_MS = __pr.SESSION_API_REFRESH_MS;
const SESSION_CLIENT_TOKEN_ROTATE_MS = __pr.SESSION_CLIENT_TOKEN_ROTATE_MS;
const SESSION_IDLE_PUBLIC_NOTICE_KEY = __pr.SESSION_IDLE_PUBLIC_NOTICE_KEY;
const SST_COMPLIANCE_RECORD_TYPES = __pr.SST_COMPLIANCE_RECORD_TYPES;
const SST_COMPLIANCE_STATUSES = __pr.SST_COMPLIANCE_STATUSES;
const STATUS = __pr.STATUS;
const STATUS_TRANSITIONS = __pr.STATUS_TRANSITIONS;
const TRANSPORT_MODOS_SERVICIO = __pr.TRANSPORT_MODOS_SERVICIO;
const TRIP_ASSIGNMENT_FLEET_TYPE_KEYS = __pr.TRIP_ASSIGNMENT_FLEET_TYPE_KEYS;
const TRIP_RATE_SCOPE_SEP = __pr.TRIP_RATE_SCOPE_SEP;
const UI_PREFS = __pr.UI_PREFS;
const portalRoleSelectOptionsForModal = __pr.portalRoleSelectOptionsForModal;
const portalRoleSelectOptionsHtml = __pr.portalRoleSelectOptionsHtml;
const ACCOUNT_STATUS = __pr.ACCOUNT_STATUS;
const SESSION_IDLE_MS = __pr.SESSION_IDLE_MS;
const VEHICLE_GRANULAR_PERMISSIONS = __pr.VEHICLE_GRANULAR_PERMISSIONS;
const VIEW_PERMISSIONS = __pr.VIEW_PERMISSIONS;
const announceSessionClosedByIdle = __pr.announceSessionClosedByIdle;
const approvalDetailLine = __pr.approvalDetailLine;
const approvalTypeLabel = __pr.approvalTypeLabel;
const authRefAltaUsuario = __pr.authRefAltaUsuario;
const authRefColaInterna = __pr.authRefColaInterna;
const authRefSolicitudViaje = __pr.authRefSolicitudViaje;
const bindAuthForms = __pr.bindAuthForms;
const buildAuthStandardActionsHtml = __pr.buildAuthStandardActionsHtml;
const buildAuthorizationsTransportRequestsSection = __pr.buildAuthorizationsTransportRequestsSection;
const buildPendingApprovalsTableHtml = __pr.buildPendingApprovalsTableHtml;
const buildPortalRegistrationInboxCardsHtml = __pr.buildPortalRegistrationInboxCardsHtml;
const buildPortalRegistrationPendingTableHtml = __pr.buildPortalRegistrationPendingTableHtml;
const buildSupabasePasswordRecoveryRedirectUrl = __pr.buildSupabasePasswordRecoveryRedirectUrl;
const buildToken = __pr.buildToken;
const canAccessAuthorizationSection = __pr.canAccessAuthorizationSection;
const canAccessAuthorizationsView = __pr.canAccessAuthorizationsView;
const canAccessRRHH = __pr.canAccessRRHH;
const canAccessVehiclesView = __pr.canAccessVehiclesView;
const canAccessView = __pr.canAccessView;
const canApproveInternalAuthorization = __pr.canApproveInternalAuthorization;
const canApprovePortalRegistration = __pr.canApprovePortalRegistration;
const canApproveTransportRequests = __pr.canApproveTransportRequests;
const canCreateVehicle = __pr.canCreateVehicle;
const canDeleteVehicle = __pr.canDeleteVehicle;
const canEditFleetDriverAsAdmin = __pr.canEditFleetDriverAsAdmin;
const canEditVehicle = __pr.canEditVehicle;
const canManageHiringModule = __pr.canManageHiringModule;
const canManagePayrollModule = __pr.canManagePayrollModule;
const canManageSstModule = __pr.canManageSstModule;
const canManageTransportTrips = __pr.canManageTransportTrips;
const canPerformPermissionGatedAction = __pr.canPerformPermissionGatedAction;
const canToggleVehicleStatus = __pr.canToggleVehicleStatus;
const checkSessionIdleAndLogout = __pr.checkSessionIdleAndLogout;
const clearRememberedLoginCredentials = __pr.clearRememberedLoginCredentials;
const clearSession = __pr.clearSession;
const companySelectOptions = __pr.companySelectOptions;
const currentUser = __pr.currentUser;
const defaultPermissionsForRole = __pr.defaultPermissionsForRole;
const dismissSessionIdlePublicNotice = __pr.dismissSessionIdlePublicNotice;
const dispatchPositionsCatalogUpdated = __pr.dispatchPositionsCatalogUpdated;
const effectiveUserPermissions = __pr.effectiveUserPermissions;
const ensureCompaniesAndUserMapping = __pr.ensureCompaniesAndUserMapping;
const ensureRequestAndTripIdentifiers = __pr.ensureRequestAndTripIdentifiers;
const ensureRequestsCompanyMapping = __pr.ensureRequestsCompanyMapping;
const ensureSessionLifecycleHooks = __pr.ensureSessionLifecycleHooks;
const ensureUsersAccountStatus = __pr.ensureUsersAccountStatus;
const ensureUsersPermissions = __pr.ensureUsersPermissions;
const findOrCreateCompanyIdByName = __pr.findOrCreateCompanyIdByName;
const flushSessionActivityToStorage = __pr.flushSessionActivityToStorage;
const getActivePositions = __pr.getActivePositions;
const getCompanyById = __pr.getCompanyById;
const getEffectiveLastActivityAt = __pr.getEffectiveLastActivityAt;
const getPortalUserDisplayName = __pr.getPortalUserDisplayName;
const getPositionById = __pr.getPositionById;
const getSession = __pr.getSession;
const hasAuthorizationManageAll = __pr.hasAuthorizationManageAll;
const hasPermission = __pr.hasPermission;
const invokeAuthSuccessCallback = __pr.invokeAuthSuccessCallback;
const isAdminActor = __pr.isAdminActor;
const isViewAllowedForUser = __pr.isViewAllowedForUser;
const maskSensitivePhone = __pr.maskSensitivePhone;
const maskSensitiveTail = __pr.maskSensitiveTail;
const maybeHandleSupabaseAuthUrlErrorFromHash = __pr.maybeHandleSupabaseAuthUrlErrorFromHash;
const mountSessionIdlePublicNoticeIfNeeded = __pr.mountSessionIdlePublicNoticeIfNeeded;
const normalizeSavedUserPermissions = __pr.normalizeSavedUserPermissions;
const normalizeUserAccountStatus = __pr.normalizeUserAccountStatus;
const parseSupabaseAuthErrorHashParams = __pr.parseSupabaseAuthErrorHashParams;
const pendingUserOrigin = __pr.pendingUserOrigin;
const persistPositionsCatalog = __pr.persistPositionsCatalog;
const portalRegistrationDetailLine = __pr.portalRegistrationDetailLine;
const portalRegistrationInboxInitials = __pr.portalRegistrationInboxInitials;
const portalUserNameLooksLikeEmailPlaceholder = __pr.portalUserNameLooksLikeEmailPlaceholder;
const positionSelectOptions = __pr.positionSelectOptions;
const queueApproval = __pr.queueApproval;
const queueSessionIdlePublicNotice = __pr.queueSessionIdlePublicNotice;
const readRememberedLoginCredentials = __pr.readRememberedLoginCredentials;
const refreshClientSessionTokenIfDue = __pr.refreshClientSessionTokenIfDue;
const refreshPositionSelectsInDocument = __pr.refreshPositionSelectsInDocument;
const refreshPositionsCatalogFromApi = __pr.refreshPositionsCatalogFromApi;
const registrationKindChipLabel = __pr.registrationKindChipLabel;
const registrationKindLabel = __pr.registrationKindLabel;
const renderAuthTab = __pr.renderAuthTab;
const repaintPermGridInForm = __pr.repaintPermGridInForm;
const resetSessionActivityMemory = __pr.resetSessionActivityMemory;
const sanitizeApprovalPayloadForQueue = __pr.sanitizeApprovalPayloadForQueue;
const sanitizeLegacyApprovalPayloads = __pr.sanitizeLegacyApprovalPayloads;
const scheduleStripSupabaseRecoveryHash = __pr.scheduleStripSupabaseRecoveryHash;
const scheduledSessionTokenMaintenance = __pr.scheduledSessionTokenMaintenance;
const sendEmail = __pr.sendEmail;
const setAuthSuccessCallback = __pr.setAuthSuccessCallback;
const setSession = __pr.setSession;
const shortAuthRefSegment = __pr.shortAuthRefSegment;
const sortAuthQueueByDateDesc = __pr.sortAuthQueueByDateDesc;
const startSessionSecurityWatch = __pr.startSessionSecurityWatch;
const stopSessionSecurityWatch = __pr.stopSessionSecurityWatch;
const stripSupabaseAuthHashFromUrl = __pr.stripSupabaseAuthHashFromUrl;
const throttledBumpSessionActivity = __pr.throttledBumpSessionActivity;
const tryApiRefreshBridge = __pr.tryApiRefreshBridge;
const waitForAntaresSupabaseClient = __pr.waitForAntaresSupabaseClient;
const wireAdminUserFormPermGridOnRoleChange = __pr.wireAdminUserFormPermGridOnRoleChange;
const wireSupabasePasswordRecoveryUi = __pr.wireSupabasePasswordRecoveryUi;
const writeRememberedLoginCredentials = __pr.writeRememberedLoginCredentials;
const getState = __pr.getState;
const hydrateClientDataScopeFromStorage = __pr.hydrateClientDataScopeFromStorage;
const hydrateHrWorkspaceFromStorage = __pr.hydrateHrWorkspaceFromStorage;
const nodes = __pr.nodes;
const patchState = __pr.patchState;
const persistClientDataScope = __pr.persistClientDataScope;
const persistHrWorkspace = __pr.persistHrWorkspace;
const state = __pr.state;
const addCalendarYearsIsoDate = __pr.addCalendarYearsIsoDate;
const colombiaDatetimeLocalString = __pr.colombiaDatetimeLocalString;
const colombiaNowIso = __pr.colombiaNowIso;
const colombiaTodayIsoDate = __pr.colombiaTodayIsoDate;
const companyKindLabel = __pr.companyKindLabel;
const devError = __pr.devError;
const devWarn = __pr.devWarn;
const emptyState = __pr.emptyState;
const escapeAttr = __pr.escapeAttr;
const escapeHtml = __pr.escapeHtml;
const fieldLabel = __pr.fieldLabel;
const fmtDate = __pr.fmtDate;
const fmtDateOr = __pr.fmtDateOr;
const fmtFleetLogDate = __pr.fmtFleetLogDate;
const fmtTimeOnly = __pr.fmtTimeOnly;
const formatColombiaLongDate = __pr.formatColombiaLongDate;
const formatColombianNationalDisplay = __pr.formatColombianNationalDisplay;
const formatColombianPhone = __pr.formatColombianPhone;
const formatGenericNationalDisplay = __pr.formatGenericNationalDisplay;
const formatPayrollPeriodLabel = __pr.formatPayrollPeriodLabel;
const formatPortalPhoneForDisplay = __pr.formatPortalPhoneForDisplay;
const portalPhoneNationalDigitsForForm = __pr.portalPhoneNationalDigitsForForm;
const getColombiaDateParts = __pr.getColombiaDateParts;
const isAntaresDebugEnabled = __pr.isAntaresDebugEnabled;
const isUuidString = __pr.isUuidString;
const monthRange = __pr.monthRange;
const newUuidV4 = __pr.newUuidV4;
const normalizeAdminUsersSection = __pr.normalizeAdminUsersSection;
const normalizeCompanyKindForDb = __pr.normalizeCompanyKindForDb;
const normalizeEmail = __pr.normalizeEmail;
const normalizeHiringDataSection = __pr.normalizeHiringDataSection;
const normalizeHiringOperateSection = __pr.normalizeHiringOperateSection;
const normalizeHistoryWorkspace = __pr.normalizeHistoryWorkspace;
const normalizeHrWorkspace = __pr.normalizeHrWorkspace;
const normalizeLatinUpperForDb = __pr.normalizeLatinUpperForDb;
const normalizePayloadTextFields = __pr.normalizePayloadTextFields;
const normalizePayrollDataSection = __pr.normalizePayrollDataSection;
const normalizePayrollFrequencyJs = __pr.normalizePayrollFrequencyJs;
const normalizePayrollOperateSection = __pr.normalizePayrollOperateSection;
const normalizePersonTypeForDb = __pr.normalizePersonTypeForDb;
const normalizePortalDateYmd = __pr.normalizePortalDateYmd;
const listPortalAuditModuleLabels = __pr.listPortalAuditModuleLabels;
const logPortalAuditEvent = __pr.logPortalAuditEvent;
const stripHistoryAuditOpaqueTokens = __pr.stripHistoryAuditOpaqueTokens;
const isHistoryAuditOpaqueLabel = __pr.isHistoryAuditOpaqueLabel;
const defaultHistoryAuditSummaryText = __pr.defaultHistoryAuditSummaryText;
const normalizePortalAuditModuleLabel = __pr.normalizePortalAuditModuleLabel;
const portalAuditModuleIconKey = __pr.portalAuditModuleIconKey;
const resolvePortalAuditModuleId = __pr.resolvePortalAuditModuleId;
const PORTAL_AUDIT_MODULE_REGISTRY = __pr.PORTAL_AUDIT_MODULE_REGISTRY;
const normalizeRegistrationKindForDb = __pr.normalizeRegistrationKindForDb;
const normalizeTransportTripsLayout = __pr.normalizeTransportTripsLayout;
const normalizeTransportTripsSort = __pr.normalizeTransportTripsSort;
const normalizeTransportTripsWorkspace = __pr.normalizeTransportTripsWorkspace;
const normalizeVehicleSection = __pr.normalizeVehicleSection;
const normalizeVehicleWorkspace = __pr.normalizeVehicleWorkspace;
const normalizeVehicleWorkspaceSection = __pr.normalizeVehicleWorkspaceSection;
const resolveVehicleSection = __pr.resolveVehicleSection;
const nowIso = __pr.nowIso;
const nowLocalIso = __pr.nowLocalIso;
const payrollPeriodCalendarYm = __pr.payrollPeriodCalendarYm;
const pickFirstNonEmpty = __pr.pickFirstNonEmpty;
const snapPick = __pr.snapPick;
const stampCreatedRecord = __pr.stampCreatedRecord;
const stampUpdatedRecord = __pr.stampUpdatedRecord;
const uid = __pr.uid;
const addDaysToYmd = __pr.addDaysToYmd;
const addMonthsToYmd = __pr.addMonthsToYmd;
const bindFixedTermContractEndPreview = __pr.bindFixedTermContractEndPreview;
const bindHrFormWizard = __pr.bindHrFormWizard;
const buildOpenEditModalFieldsHtml = __pr.buildOpenEditModalFieldsHtml;
const computeEmployeeContractRenewalMeta = __pr.computeEmployeeContractRenewalMeta;
const contractTypeRequiresDurationPlazo = __pr.contractTypeRequiresDurationPlazo;
const createCollapsibleCard = __pr.createCollapsibleCard;
const createCollapsibleProCard = __pr.createCollapsibleProCard;
const editModalAntaresAttrString = __pr.editModalAntaresAttrString;
const editModalLabelClassAttr = __pr.editModalLabelClassAttr;
const ensureCrudModalElement = __pr.ensureCrudModalElement;
const ensureEmployeeContractFields = __pr.ensureEmployeeContractFields;
const flashHrWizardDotError = __pr.flashHrWizardDotError;
const hrWizardStepLabel = __pr.hrWizardStepLabel;
const hrWizardStepValid = __pr.hrWizardStepValid;
const hrWizardValidityTargets = __pr.hrWizardValidityTargets;
const isFixedTermContractType = __pr.isFixedTermContractType;
const lockFormSubmitUi = __pr.lockFormSubmitUi;
const notify = __pr.notify;
const openConfirmModal = __pr.openConfirmModal;
const openConfirmModalAsync = __pr.openConfirmModalAsync;
const openConfirmReasonModal = __pr.openConfirmReasonModal;
const openEditModal = __pr.openEditModal;
const openInfoModal = __pr.openInfoModal;
const openDetailViewSheet = __pr.openDetailViewSheet;
const parseContractDurationText = __pr.parseContractDurationText;
const readInlineOrNativeFieldError = __pr.readInlineOrNativeFieldError;
const failPortalField = __pr.failPortalField;
const releaseFormSubmitUi = __pr.releaseFormSubmitUi;
const renderEditModalFieldRow = __pr.renderEditModalFieldRow;
const resolveEmployeeContractEndDateYmd = __pr.resolveEmployeeContractEndDateYmd;
const resolveEmployeeContractPlazoStartYmd = __pr.resolveEmployeeContractPlazoStartYmd;
const runWithBusyButton = __pr.runWithBusyButton;
const setContractDurationBranchVisible = __pr.setContractDurationBranchVisible;
const setupContractDurationPlazoVisibility = __pr.setupContractDurationPlazoVisibility;
const suppressSelfInboxPollToastIfRecipientIsCurrentUser = __pr.suppressSelfInboxPollToastIfRecipientIsCurrentUser;
const userMessage = __pr.userMessage;
const wireContractDurationBranch = __pr.wireContractDurationBranch;
const wireFormSubmitGuard = __pr.wireFormSubmitGuard;
const wireModalDismiss = __pr.wireModalDismiss;
const IC = globalThis.IC;
/** Asignado en index.html (data-io); no forma parte del bundle `portal-runtime-env`. */
const writeAwaitServer = globalThis.writeAwaitServer;
const writeAwaitServerEdit = globalThis.writeAwaitServerEdit;
const writeAwaitServerDelete = globalThis.writeAwaitServerDelete;
const writeAwaitServerLatestQueuedEmail = globalThis.writeAwaitServerLatestQueuedEmail;
/** Expuesto desde `payroll-catalog-sanitize.domain` vía `Object.assign(window, …)` en index. */
const normalizeLatinForDb = globalThis.normalizeLatinForDb;
/** Expuesto desde `reporteria.domain` vía `Object.assign(window, …)` en index. */
const reportsExportPeriodLabel = globalThis.reportsExportPeriodLabel;
const normalizeReportsExportFilters = globalThis.normalizeReportsExportFilters;
const reportPreviewColumnMeta = globalThis.reportPreviewColumnMeta;
const reportPreviewResolveCellType = globalThis.reportPreviewResolveCellType;
const reportPreviewFormatValue = globalThis.reportPreviewFormatValue;
const reportPreviewTone = globalThis.reportPreviewTone;
const reportPreviewCellInnerHtml = globalThis.reportPreviewCellInnerHtml;
const reportBrandLogoSrc = globalThis.reportBrandLogoSrc;
const reportBrandCopyrightText = globalThis.reportBrandCopyrightText;
const canAccessReport = globalThis.canAccessReport;
const exportCatalogReportPdf = globalThis.exportCatalogReportPdf;
const downloadBlobFile = globalThis.downloadBlobFile;
const reportExportFilename = globalThis.reportExportFilename;

/**
 * Estado central (`state`), referencias DOM (`nodes`) y helpers asociados se definen en
 * `modules/core/store.js`; este archivo es módulo ES y enlaza símbolos vía `portal-runtime-env.mjs`.
 */
try {
  if (typeof window.purgeDuplicateContracts === "function") window.purgeDuplicateContracts();
} catch (_) {
  /* no-op: purge is best-effort */
}

window.AntaresDataAccess = Object.freeze({
  getPortalContacts() {
    return Array.isArray(state.portalContacts) ? state.portalContacts : [];
  },
  setPortalContacts(rows) {
    state.portalContacts = Array.isArray(rows) ? rows : [];
  }
});

function renderPayrollRunCard(...args) {
  const impl = globalThis.__antaresPortalRrhhModals;
  if (impl && typeof impl.renderPayrollRunCard === "function") return impl.renderPayrollRunCard(...args);
}


/**
 * Modal de ficha de viaje. Muestra detalles operativos del viaje y, según
 * permisos, expone:
 *   - "Ver solicitud" → abre el detalle de la solicitud asociada.
 *   - "Editar viaje"  → abre el formulario de edición (solo admin).
 */
function openAssignedTripInfoModal(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.openAssignedTripInfoModal === "function") return impl.openAssignedTripInfoModal(...args);
}


/**
 * Modal de detalle de solicitud (read-only) reutilizable desde la ficha
 * de viaje y desde otros lugares. Mantiene la misma estructura visual
 * que la del listado de solicitudes pero sin acciones de edición.
 */
function openRequestDetailModal(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.openRequestDetailModal === "function") return impl.openRequestDetailModal(...args);
}


/** Copia JSON de auditoría de viaje: bootstrap puede traer solo `snapshotSummary`. */
function deletedTripSnapshotForTableRow(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.deletedTripSnapshotForTableRow === "function") return impl.deletedTripSnapshotForTableRow(...args);
}


/** Copia JSON de auditoría de solicitud: bootstrap puede traer solo `snapshotSummary`. */
function deletedRequestSnapshotForTableRow(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.deletedRequestSnapshotForTableRow === "function") return impl.deletedRequestSnapshotForTableRow(...args);
}


/**
 * Hidrata `noveltiesDetail` / `settlementDetail` desde el API si el bootstrap solo trajo la fila resumida.
 * @returns {object|null} fila fusionada o null si no hay sesión API
 */
async function ensurePayrollRunHeavyJsonLoaded(runId) {
  const id = String(runId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return null;
  const runs = read(KEYS.payrollRuns, []);
  const idx = runs.findIndex((r) => String(r.id) === id);
  if (idx < 0) return null;
  const cur = runs[idx];
  if (cur.payrollRunHeavyOmitted !== true) return cur;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return cur;
  try {
    const detail = await api.getJson(`/portal/payroll-runs/${encodeURIComponent(id)}`);
    if (!detail || typeof detail !== "object") return cur;
    const merged = {
      ...cur,
      settlementDetail: detail.settlementDetail ?? cur.settlementDetail ?? null,
      noveltiesDetail: detail.noveltiesDetail ?? cur.noveltiesDetail ?? null,
      workedDays: detail.workedDays != null ? detail.workedDays : cur.workedDays,
      workedDaysPaymentCop:
        detail.workedDaysPaymentCop != null ? detail.workedDaysPaymentCop : cur.workedDaysPaymentCop,
      payrollRunHeavyOmitted: false
    };
    const next = [...runs];
    next[idx] = merged;
    write(KEYS.payrollRuns, next);
    return merged;
  } catch (err) {
    devWarn("Portal: detalle de liquidación no disponible.", err?.message || err);
    notify(String(err?.message || "No fue posible cargar el detalle de la liquidación."), "warn");
    return cur;
  }
}

async function ensureDeletedTransportTripAuditSnapshotLoaded(logId) {
  const id = String(logId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return false;
  const rows = read(KEYS.deletedTransportTripLogs, []);
  const row = rows.find((r) => String(r.id) === id);
  if (!row) return false;
  if (parsePortalJsonSnapshot(row.snapshot)) return true;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return false;
  try {
    const res = await api.getJson(`/portal/deleted-transport-trip-audit/${encodeURIComponent(id)}`);
    const snap = res && typeof res === "object" ? res.snapshot : null;
    const idx = rows.findIndex((r) => String(r.id) === id);
    if (idx < 0) return false;
    const next = [...rows];
    next[idx] = { ...next[idx], snapshot: snap };
    write(KEYS.deletedTransportTripLogs, next);
    return true;
  } catch (err) {
    devWarn("Portal: snapshot de auditoría (viaje) no disponible.", err?.message || err);
    notify(String(err?.message || "No fue posible cargar la copia del viaje."), "warn");
    return false;
  }
}

async function ensureDeletedTransportRequestAuditSnapshotLoaded(logId) {
  const id = String(logId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return false;
  const rows = read(KEYS.deletedTransportRequestLogs, []);
  const row = rows.find((r) => String(r.id) === id);
  if (!row) return false;
  if (parsePortalJsonSnapshot(row.snapshot)) return true;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return false;
  try {
    const res = await api.getJson(`/portal/deleted-transport-request-audit/${encodeURIComponent(id)}`);
    const snap = res && typeof res === "object" ? res.snapshot : null;
    const idx = rows.findIndex((r) => String(r.id) === id);
    if (idx < 0) return false;
    const next = [...rows];
    next[idx] = { ...next[idx], snapshot: snap };
    write(KEYS.deletedTransportRequestLogs, next);
    return true;
  } catch (err) {
    devWarn("Portal: snapshot de auditoría (solicitud) no disponible.", err?.message || err);
    notify(String(err?.message || "No fue posible cargar la copia de la solicitud."), "warn");
    return false;
  }
}

function formatDeletedRequestSnapshotRouteLine(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.formatDeletedRequestSnapshotRouteLine === "function") return impl.formatDeletedRequestSnapshotRouteLine(...args);
}


function formatDeletedRequestSnapshotTableSummary(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.formatDeletedRequestSnapshotTableSummary === "function") return impl.formatDeletedRequestSnapshotTableSummary(...args);
}


/**
 * Ficha de solo lectura desde la fila de `auditoria_solicitudes_eliminadas`
 * (copia JSON al momento de borrar).
 */
function openDeletedTransportRequestAuditModal(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.openDeletedTransportRequestAuditModal === "function") return impl.openDeletedTransportRequestAuditModal(...args);
}


function formatDeletedTripSnapshotTableSummary(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.formatDeletedTripSnapshotTableSummary === "function") return impl.formatDeletedTripSnapshotTableSummary(...args);
}


/**
 * Ficha de solo lectura desde `auditoria_viajes_eliminados.datos_json`
 * (fila de viajes_transporte al momento de desasignar).
 */
function openDeletedTransportTripAuditModal(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.openDeletedTransportTripAuditModal === "function") return impl.openDeletedTransportTripAuditModal(...args);
}


/**
 * Editor del viaje (admin). Permite actualizar fechas estimadas, vehículo,
 * conductor y observaciones operativas. Las acciones destructivas como
 * cambiar el estado del viaje siguen ocurriendo a través del select de
 * estado en el card (transitionRequestStatus).
 */
function openEditTripModal(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.openEditTripModal === "function") return impl.openEditTripModal(...args);
}


/**
 * Edición de tarifa por trayecto (admin): mismo patrón visual que {@link openEditTripModal}
 * (secciones, `modal-card-edit--trip`), sin depender del formulario colapsable.
 */
function openEditRouteRateModal(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.openEditRouteRateModal === "function") return impl.openEditRouteRateModal(...args);
}


function validateColombianDocument(docType, rawValue) {
  const type = String(docType || "").toUpperCase();
  const base = String(rawValue || "").trim();
  const compact = base.replace(/[.\s]/g, "");
  if (!compact) return { ok: false, message: "El documento es obligatorio.", normalized: "" };
  if (type === "CC") {
    const ok = /^\d{6,10}$/.test(compact);
    return { ok, message: ok ? "" : "La cedula CC debe tener entre 6 y 10 digitos.", normalized: compact };
  }
  if (type === "CE") {
    const ok = /^\d{6,12}$/.test(compact);
    return { ok, message: ok ? "" : "La cedula CE debe tener entre 6 y 12 digitos.", normalized: compact };
  }
  if (type === "NIT") {
    const ok = /^\d{8,10}(-\d)?$/.test(compact);
    return { ok, message: ok ? "" : "El NIT debe tener formato 900123456 o 900123456-7.", normalized: compact };
  }
  if (type === "PAS") {
    const ok = /^[A-Za-z0-9]{5,20}$/.test(compact);
    return { ok, message: ok ? "" : "El pasaporte debe ser alfanumerico (5-20 caracteres).", normalized: compact.toUpperCase() };
  }
  if (type === "PEP") {
    const ok = /^[A-Za-z0-9-]{5,20}$/.test(compact);
    return {
      ok,
      message: ok ? "" : "El PEP/PPT debe ser alfanumerico (5-20 caracteres).",
      normalized: compact.toUpperCase()
    };
  }
  if (type === "TI") {
    const ok = /^\d{8,11}$/.test(compact);
    return { ok, message: ok ? "" : "La tarjeta de identidad debe tener entre 8 y 11 digitos.", normalized: compact };
  }
  return { ok: compact.length >= 5, message: "Tipo de documento no valido.", normalized: compact };
}

function documentFieldRule(docType) {
  const type = String(docType || "").toUpperCase();
  if (type === "CC") return { pattern: "[0-9]{6,10}", minlength: "6", maxlength: "10", inputmode: "numeric", placeholder: "Cédula sin puntos" };
  if (type === "CE") return { pattern: "[0-9]{6,12}", minlength: "6", maxlength: "12", inputmode: "numeric", placeholder: "Cédula de extranjería" };
  if (type === "TI") return { pattern: "[0-9]{8,11}", minlength: "8", maxlength: "11", inputmode: "numeric", placeholder: "Tarjeta de identidad" };
  if (type === "PAS") return { pattern: "[A-Za-z0-9]{5,20}", minlength: "5", maxlength: "20", inputmode: "text", placeholder: "Pasaporte alfanumérico" };
  if (type === "PEP") return { pattern: "[A-Za-z0-9-]{5,20}", minlength: "5", maxlength: "20", inputmode: "text", placeholder: "PEP/PPT alfanumérico" };
  return { pattern: "", minlength: "5", maxlength: "20", inputmode: "text", placeholder: "Documento" };
}

function applyDocumentFieldConstraints(root, config = {}) {
  const scope = root && typeof root.querySelector === "function" ? root : document;
  const typeField = scope.querySelector(config.typeSelector || "select[name='documentType']");
  const docField = scope.querySelector(config.docSelector || "input[name='idDoc']");
  if (!typeField || !docField) return;
  const sync = () => {
    const rule = documentFieldRule(typeField.value);
    if (rule.pattern) docField.setAttribute("pattern", rule.pattern);
    else docField.removeAttribute("pattern");
    if (rule.minlength) docField.setAttribute("minlength", rule.minlength);
    else docField.removeAttribute("minlength");
    if (rule.maxlength) docField.setAttribute("maxlength", rule.maxlength);
    else docField.removeAttribute("maxlength");
    if (rule.inputmode) docField.setAttribute("inputmode", rule.inputmode);
    else docField.removeAttribute("inputmode");
    if (rule.placeholder) docField.setAttribute("placeholder", rule.placeholder);
  };
  typeField.addEventListener("change", sync);
  sync();
}

/** Clave estable para validar que la cédula/documento personal no se repita (incluye registros previos). */
function getPersonalRegistrationKey(user) {
  if (!user) return "";
  const raw =
    (user.personalDoc != null && String(user.personalDoc).trim() !== "" && String(user.personalDoc)) ||
    (user.personalTaxId != null && String(user.personalTaxId).trim() !== "" && String(user.personalTaxId)) ||
    "";
  if (raw) {
    const onlyDig = raw.replace(/\D/g, "");
    if (onlyDig.length >= 5) return onlyDig;
    return String(raw).trim().toUpperCase();
  }
  const dt = String(user.documentType || "").toUpperCase();
  if (dt === "PAS") return String(user.taxId || "").replace(/\s/g, "").toUpperCase();
  if (dt === "NIT") return "";
  return String(user.taxId || "").replace(/\D/g, "");
}



function statusIconEmoji(status) {
  switch (String(status || "").trim()) {
    case STATUS.PENDIENTE:
      return "🕒";
    case STATUS.APROBADA_PENDIENTE_ASIGNACION:
      return "📥";
    case STATUS.VIAJE_ASIGNADO:
      return "🟢";
    case STATUS.EN_TRANSITO:
      return "🚚";
    case STATUS.ESPERA_STANDBY:
      return "⏸️";
    case STATUS.COMPLETADA:
      return "✅";
    case STATUS.CERRADA:
      return "📦";
    case STATUS.CANCELADA:
      return "⛔";
    case STATUS.RECHAZADA:
      return "❌";
    default:
      return "•";
  }
}

function tripStatusOptionLabel(status) {
  return `${statusIconEmoji(status)} ${String(status || "").trim()}`;
}

/** URL del logo corporativo para UI (solicitudes, detalle, selector). */
function companyProfileLogoUrl(company) {
  if (!company || typeof company !== "object") return "";
  const norm =
    typeof window.normalizePortalBootstrapCompanyRow === "function"
      ? window.normalizePortalBootstrapCompanyRow(company)
      : company;
  const raw = String(norm.logoUrl || "").trim();
  if (!raw) return "";
  if (/^https:\/\//i.test(raw)) return raw;
  if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(raw)) return raw;
  return "";
}

function payrollDocumentLogoUrl(company) {
  return companyProfileLogoUrl(company) || reportBrandLogoSrc();
}

/** Alinea texto guardado con la clave exacta del catálogo COLOMBIA_LOCATIONS (tildes, espacios, mayúsculas). */
function matchColombiaDepartmentToCatalogKey(departmentRaw) {
  const raw = String(departmentRaw || "").trim();
  if (!raw) return "";
  if (Object.prototype.hasOwnProperty.call(COLOMBIA_LOCATIONS, raw)) return raw;
  const norm = (s) =>
    normalizeLatinForDb(String(s || ""))
      .replace(/[_\s]+/g, "")
      .toLowerCase();
  const target = norm(raw);
  for (const key of Object.keys(COLOMBIA_LOCATIONS)) {
    if (norm(key) === target) return key;
  }
  return "";
}

function matchColombiaCityInDepartment(deptKey, cityRaw) {
  const d = String(deptKey || "").trim();
  const raw = String(cityRaw || "").trim();
  if (!d || !raw) return raw;
  const cities = COLOMBIA_LOCATIONS[d] || [];
  if (cities.includes(raw)) return raw;
  const norm = (s) =>
    normalizeLatinForDb(String(s || ""))
      .replace(/[_\s]+/g, "")
      .toLowerCase();
  const t = norm(raw);
  for (const city of cities) {
    if (norm(city) === t) return city;
  }
  return raw;
}

/** Cuentas creadas en el sitio / API con estado pendiente en PostgreSQL o solo en Supabase Auth. */

function wireMonthlyPayrollConcepts(form) {
  if (!form || form.dataset.monthlyPayrollConceptsBound === "1") return;
  form.dataset.monthlyPayrollConceptsBound = "1";
  const monthEl = form.querySelector('[name="month"]');
  const fechaEl =
    (typeof queryPortalDateField === "function"
      ? queryPortalDateField(form, "payroll-fecha-cierre")
      : null) ||
    form.querySelector("#payroll-fecha-cierre") ||
    form.querySelector('[name="fechaCierre"]');
  const quincenaHidden = form.querySelector('[name="payrollQuincena"]');
  const periodPreview = form.querySelector("#payroll-period-preview");
  const empEl = form.querySelector('[name="employeeId"]');
  const auxInput = form.querySelector('[name="aux"]');
  const hasFechaField = Boolean(
    fechaEl || form.querySelector('input[type="hidden"][name="fechaCierre"]')
  );
  if ((!monthEl && !hasFechaField) || !empEl) return;

  const getCalendarYm = () => String(monthEl?.value || "").trim().slice(0, 7);

  const getQuincenaHalf = () => String(quincenaHidden?.value || "Q1").trim().toUpperCase();

  const readFechaCierreIso = () => {
    if (typeof readFormDateIso === "function") {
      const byId = readFormDateIso(form, "payroll-fecha-cierre");
      if (byId) return byId;
      const byName = readFormDateIso(form, "fechaCierre");
      if (byName) return byName;
    }
    const hidden = form.querySelector('input[type="hidden"][name="fechaCierre"]');
    const hiddenIso = String(hidden?.value || "").trim();
    if (hiddenIso) return hiddenIso;
    const raw = String(fechaEl?.value || "").trim();
    if (!raw) return "";
    return typeof normalizePortalDateYmd === "function" ? normalizePortalDateYmd(raw) || raw : raw;
  };

  const syncFromFechaCierre = () => {
    if (!monthEl) return;
    const fecha = readFechaCierreIso();
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || "").trim());
    if (!fecha) {
      monthEl.value = "";
      if (periodPreview) periodPreview.innerHTML = "";
      return;
    }
    if (!emp || employeeIsConductorServiceProvider(emp)) {
      const ym = fecha.slice(0, 7);
      monthEl.value = ym;
      if (periodPreview) {
        periodPreview.innerHTML = `<p class="muted" style="margin:0;font-size:0.82rem">Mes de servicio: <strong>${escapeHtml(ym)}</strong></p>`;
      }
      return;
    }
    const freq = normalizePayrollFrequencyJs(emp.payFrequency);
    const existing = read(KEYS.payrollRuns, [])
      .filter((r) => String(r.employeeId || "") === String(emp.id || ""))
      .map((r) => String(r.month || ""));
    const cut =
      typeof resolvePayrollCutForClosingDate === "function"
        ? resolvePayrollCutForClosingDate(fecha, freq, { existingPeriodKeys: existing })
        : null;
    if (cut) {
      monthEl.value = cut.calendarMonthYm;
      if (quincenaHidden) {
        quincenaHidden.value = /-Q2$/i.test(cut.periodKey) ? "Q2" : /-Q1$/i.test(cut.periodKey) ? "Q1" : quincenaHidden.value;
      }
      const rangeLabel =
        typeof formatPayrollCutRangeLabel === "function" ? formatPayrollCutRangeLabel(cut) : cut.periodKey;
      const periodLabel =
        typeof formatPayrollPeriodLabel === "function" ? formatPayrollPeriodLabel(cut.periodKey) : cut.periodKey;
      if (periodPreview) {
        periodPreview.innerHTML = `<div class="payroll-period-preview__card"><strong>${escapeHtml(periodLabel)}</strong><span class="muted">${escapeHtml(rangeLabel)}</span></div>`;
        periodPreview.classList.remove("payroll-period-preview--warn");
      }
    } else {
      monthEl.value = fecha.slice(0, 7);
      const hint =
        typeof payrollClosingDatesHint === "function" ? payrollClosingDatesHint(freq) : "día de cierre válido";
      if (periodPreview) {
        periodPreview.innerHTML = `<p class="payroll-period-preview__warn">La fecha no es un día de cierre para nómina ${escapeHtml(String(emp.payFrequency || "Mensual"))}. Use ${escapeHtml(hint)}.</p>`;
        periodPreview.classList.add("payroll-period-preview--warn");
      }
    }
  };

  const syncAuxTransportFromEmployee = () => {
    if (!auxInput || !empEl) return;
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || "").trim());
    if (!emp) {
      auxInput.value = String(CO_HR_RULES.transportAllowance);
      return;
    }
    auxInput.value = String(readEmployeeTransportAllowanceCop(emp));
  };

  const fsP = form.querySelector("#payroll-prima-fieldset");
  const cbP = form.querySelector("#payroll-pay-prima");
  const daysP = form.querySelector('[name="primaServiciosDays"]');
  const copP = form.querySelector('[name="primaServiciosCop"]');
  const primaDupHint = form.querySelector("#payroll-prima-dup-hint");

  const fsC = form.querySelector("#payroll-cesantias-int-fieldset");
  const cbC = form.querySelector("#payroll-pay-int-cesantias");
  const baseC = form.querySelector('[name="cesantiasInterestBaseCop"]');
  const daysC = form.querySelector('[name="cesantiasInterestDays"]');
  const copC = form.querySelector('[name="interesesCesantiasCopMonthly"]');
  const intDupHint = form.querySelector("#payroll-int-ces-dup-hint");

  const syncSemestralConceptEligibility = () => {
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || "").trim());
    if (!emp || employeeIsConductorServiceProvider(emp)) return;
    const monthYm = getCalendarYm();
    const quincenaHalf = getQuincenaHalf();
    const periodKey = buildPayrollPeriodKeyFromForm(monthYm, emp.payFrequency, quincenaHalf);
    const runs = read(KEYS.payrollRuns, []);
    const primaPaidFn = typeof payrollSemesterPrimaAlreadyPaidInMonth === "function"
      ? payrollSemesterPrimaAlreadyPaidInMonth
      : window.payrollSemesterPrimaAlreadyPaidInMonth;
    const intPaidFn = typeof payrollCesantiasInterestAlreadyPaidInYear === "function"
      ? payrollCesantiasInterestAlreadyPaidInYear
      : window.payrollCesantiasInterestAlreadyPaidInYear;

    if (cbP && payrollMonthIsPrimaSemester(monthYm)) {
      const primaPaid = primaPaidFn?.(runs, emp.id, monthYm, periodKey);
      if (primaPaid) {
        cbP.checked = false;
        cbP.disabled = true;
        if (daysP) {
          daysP.value = "";
          daysP.disabled = true;
        }
        if (copP) {
          copP.value = "";
          copP.disabled = true;
        }
        if (primaDupHint) {
          primaDupHint.textContent =
            "La prima ya fue liquidada en otra quincena de este mes del semestre. Este corte solo incluye salario y demás rubros.";
          primaDupHint.classList.remove("hidden");
        }
      } else {
        cbP.disabled = false;
        if (primaDupHint) {
          primaDupHint.textContent = "";
          primaDupHint.classList.add("hidden");
        }
        applyPrima();
      }
    } else if (primaDupHint) {
      primaDupHint.textContent = "";
      primaDupHint.classList.add("hidden");
    }

    if (cbC && payrollMonthIsCesantiasInterestMonth(monthYm)) {
      const intPaid = intPaidFn?.(runs, emp.id, monthYm, periodKey);
      if (intPaid) {
        cbC.checked = false;
        cbC.disabled = true;
        if (baseC) {
          baseC.value = "";
          baseC.disabled = true;
        }
        if (daysC) {
          daysC.value = "360";
          daysC.disabled = true;
        }
        if (copC) {
          copC.value = "";
          copC.disabled = true;
        }
        if (intDupHint) {
          intDupHint.textContent =
            "Los intereses sobre cesantías ya fueron liquidados en otra nómina de enero o febrero de este año.";
          intDupHint.classList.remove("hidden");
        }
      } else {
        cbC.disabled = false;
        if (intDupHint) {
          intDupHint.textContent = "";
          intDupHint.classList.add("hidden");
        }
        applyCesantias();
      }
    } else if (intDupHint) {
      intDupHint.textContent = "";
      intDupHint.classList.add("hidden");
    }
  };

  const applyPrima = () => {
    if (!fsP || !cbP || !daysP || !copP) return;
    const show = payrollMonthIsPrimaSemester(monthEl.value);
    fsP.classList.toggle("hidden", !show);
    fsP.setAttribute("aria-hidden", show ? "false" : "true");
    if (!show) {
      cbP.checked = false;
      daysP.value = "";
      copP.value = "";
      delete copP.dataset.userEdited;
    }
    daysP.disabled = !(show && cbP.checked);
    copP.disabled = !(show && cbP.checked);
  };

  const suggestPrimaDaysFromEmployee = () => {
    if (!daysP || !cbP?.checked || !payrollMonthIsPrimaSemester(monthEl.value)) return;
    if (String(daysP.value || "").trim() !== "") return;
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || "").trim());
    if (!emp) return;
    const d = calcColombiaPrimaSemesterEmployedDays(emp.startDate, monthEl.value);
    if (d > 0) daysP.value = String(d);
  };

  const recalcPrimaCop = () => {
    if (!cbP || !daysP || !copP) return;
    if (!payrollMonthIsPrimaSemester(monthEl.value) || !cbP.checked) return;
    suggestPrimaDaysFromEmployee();
    if (copP.dataset.userEdited === "1") return;
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || ""));
    const bs = emp ? parseNum(emp.baseSalary) : 0;
    const d = parseNum(daysP.value);
    if (d > 0) copP.value = String(calcColombiaPrimaServiciosCop(bs, d));
    else copP.value = "";
  };

  const applyCesantias = () => {
    if (!fsC || !cbC || !baseC || !daysC || !copC) return;
    const show = payrollMonthIsCesantiasInterestMonth(monthEl.value);
    fsC.classList.toggle("hidden", !show);
    fsC.setAttribute("aria-hidden", show ? "false" : "true");
    if (!show) {
      cbC.checked = false;
      baseC.value = "";
      daysC.value = "360";
      copC.value = "";
      delete copC.dataset.userEdited;
    }
    baseC.disabled = !(show && cbC.checked);
    daysC.disabled = !(show && cbC.checked);
    copC.disabled = !(show && cbC.checked);
  };

  const recalcInteresesCop = () => {
    if (!cbC || !baseC || !daysC || !copC) return;
    if (!payrollMonthIsCesantiasInterestMonth(monthEl.value) || !cbC.checked) return;
    if (copC.dataset.userEdited === "1") return;
    const base = parseNum(baseC.value);
    const d = parseNum(daysC.value) || 360;
    if (base > 0) copC.value = String(calcColombiaInteresesCesantiasCop(base, d));
    else copC.value = "";
  };

  const onMonthChange = () => {
    applyPrima();
    applyCesantias();
    recalcPrimaCop();
    recalcInteresesCop();
    syncSemestralConceptEligibility();
  };

  const quincenaWrap = form.querySelector("#payroll-quincena-wrap");
  const freqHint = form.querySelector("#payroll-freq-hint");
  const conductorHint = form.querySelector("#payroll-conductor-trip-hint");
  const salaryLabel = form.querySelector("#payroll-monthly-base-salary")?.closest("label");
  const submitBtn = form.querySelector("#payroll-submit-btn");
  const syncPayFrequencyUi = () => {
    const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(empEl.value || "").trim());
    const isDriver = Boolean(emp && employeeIsConductorServiceProvider(emp));
    const freq = normalizePayrollFrequencyJs(emp?.payFrequency);
    if (quincenaWrap) {
      quincenaWrap.classList.add("hidden");
      quincenaWrap.toggleAttribute("hidden", true);
      quincenaWrap.setAttribute("aria-hidden", "true");
    }
    syncFromFechaCierre();
    if (!emp || isDriver) {
      if (fsP) {
        fsP.classList.add("hidden");
        fsP.setAttribute("aria-hidden", "true");
      }
      if (fsC) {
        fsC.classList.add("hidden");
        fsC.setAttribute("aria-hidden", "true");
      }
    } else {
      applyPrima();
      applyCesantias();
    }
    if (salaryLabel) {
      salaryLabel.classList.toggle("hidden", isDriver);
      salaryLabel.toggleAttribute("hidden", isDriver);
    }
    form.querySelectorAll("[data-payroll-nomina-only]").forEach((el) => {
      el.classList.toggle("hidden", isDriver);
      el.toggleAttribute("hidden", isDriver);
    });
    if (conductorHint) {
      if (isDriver) {
        conductorHint.classList.remove("hidden");
        conductorHint.textContent = userMessage("payrollConductorTripOnly");
      } else {
        conductorHint.classList.add("hidden");
        conductorHint.textContent = "";
      }
    }
    if (freqHint) {
      if (!emp) {
        freqHint.classList.add("hidden");
        freqHint.textContent = "";
      } else if (isDriver) {
        freqHint.classList.remove("hidden");
        freqHint.textContent =
          "Mes calendario del servicio. Viáticos interdepartamentales y combustible pagado por el conductor se calculan desde viajes y flota.";
      } else {
        freqHint.classList.remove("hidden");
        const closeHint =
          typeof payrollClosingDatesHint === "function" ? payrollClosingDatesHint(freq) : "día de cierre del período";
        freqHint.textContent = `Periodicidad ${String(emp.payFrequency || "Mensual")}: indique la fecha de cierre (${closeHint}). Salario y auxilio se prorratean según los días del corte.`;
      }
    }
    if (submitBtn) {
      const span = submitBtn.querySelector("span");
      const label = isDriver ? "Liquidar viajes del mes" : "Generar liquidación";
      if (span) span.textContent = label;
      else submitBtn.textContent = label;
    }
  };

  const onPeriodChange = () => {
    syncFromFechaCierre();
    onMonthChange();
  };

  const bindFechaFieldListeners = (el) => {
    if (!el) return;
    el.addEventListener("change", onPeriodChange);
    el.addEventListener("input", onPeriodChange);
  };
  bindFechaFieldListeners(fechaEl);
  const hiddenFechaEl = form.querySelector('input[type="hidden"][name="fechaCierre"]');
  if (hiddenFechaEl && hiddenFechaEl !== fechaEl) {
    hiddenFechaEl.addEventListener("change", onPeriodChange);
  }
  if (!fechaEl && !hiddenFechaEl && monthEl) monthEl.addEventListener("change", onMonthChange);
  empEl.addEventListener("change", () => {
    syncPayrollEmployeeSalaryReadonly(form, "payroll-monthly-base-salary");
    syncAuxTransportFromEmployee();
    syncPayFrequencyUi();
    suggestPrimaDaysFromEmployee();
    recalcPrimaCop();
    recalcInteresesCop();
    syncSemestralConceptEligibility();
  });
  syncPayrollEmployeeSalaryReadonly(form, "payroll-monthly-base-salary");
  syncAuxTransportFromEmployee();
  syncPayFrequencyUi();

  onPeriodChange();

  if (cbP && daysP && copP) {
    cbP.addEventListener("change", () => {
      applyPrima();
      suggestPrimaDaysFromEmployee();
      recalcPrimaCop();
    });
    daysP.addEventListener("input", recalcPrimaCop);
    copP.addEventListener("input", () => {
      copP.dataset.userEdited = parseNum(copP.value) > 0 ? "1" : "";
    });
  }
  if (cbC && baseC && daysC && copC) {
    cbC.addEventListener("change", applyCesantias);
    baseC.addEventListener("input", recalcInteresesCop);
    daysC.addEventListener("input", recalcInteresesCop);
    copC.addEventListener("input", () => {
      copC.dataset.userEdited = parseNum(copC.value) > 0 ? "1" : "";
    });
  }

  onMonthChange();
}

/** Muestra el salario base del empleado en un input de solo lectura (sin `name`, no va en el envío). */
function syncPayrollEmployeeSalaryReadonly(form, inputId) {
  const empSel = form?.querySelector?.('[name="employeeId"]');
  const salEl = form?.querySelector?.(`#${inputId}`);
  if (!salEl) return;
  const id = String(empSel?.value || "").trim();
  const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === id);
  if (!id || !emp) {
    salEl.value = "";
    salEl.placeholder = "Seleccione empleado";
    return;
  }
  const n = parseNum(emp.baseSalary);
  salEl.placeholder = "";
  salEl.value = n > 0 ? `$${n.toLocaleString("es-CO")}` : "Sin salario base registrado";
}

function wireTerminationSettlementForm(form) {
  if (!form || form.dataset.settlementWire === "1") return;
  form.dataset.settlementWire = "1";
  const recalc = () => {
    const empId = String(form.querySelector("[name='employeeId']")?.value || "");
    const term = String(form.querySelector("[name='terminationDate']")?.value || "").trim();
    if (!empId || !term) return;
    fillSettlementSuggestedAmounts(form);
  };
  const btn = form.querySelector('[data-action="settlement-recalc"]');
  if (btn && btn.dataset.settlementRecalcBound !== "1") {
    btn.dataset.settlementRecalcBound = "1";
    btn.addEventListener("click", () => {
      void runWithBusyButton(
        btn,
        async () => {
          fillSettlementSuggestedAmounts(form);
        },
        {
          busyText: "Calculando…",
          lockExtraButtons:
            typeof collectManagedCreateFormLockButtons === "function"
              ? collectManagedCreateFormLockButtons(form)
              : [
                  form.querySelector("[data-action='cancel-create-panel']"),
                  form.querySelector("[data-action='toggle-create-panel']"),
                  form.querySelector("button[type='submit']")
                ].filter(Boolean)
        }
      );
    });
  }
  const empSel = form.querySelector('[name="employeeId"]');
  if (empSel) {
    empSel.addEventListener("change", () => {
      syncPayrollEmployeeSalaryReadonly(form, "payroll-settlement-base-salary");
      recalc();
    });
    syncPayrollEmployeeSalaryReadonly(form, "payroll-settlement-base-salary");
  }
  const termEl = form.querySelector('[name="terminationDate"]');
  if (termEl) termEl.addEventListener("change", recalc);
  const causeEl = form.querySelector('[name="terminationCause"]');
  if (causeEl) causeEl.addEventListener("change", recalc);
  const monthEl = form.querySelector('[name="month"]');
  if (monthEl && termEl) {
    monthEl.addEventListener("change", () => {
      const m = String(monthEl.value || "").trim();
      if (m && /^\d{4}-\d{2}$/.test(m) && !termEl.value) {
        const last = new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0);
        termEl.value = `${m}-${String(last.getDate()).padStart(2, "0")}`;
        recalc();
      }
    });
  }
}
const CO_SYSTEM_PARAMS_DEFAULTS = {
  smmlvCop: CO_PAYROLL.smmlv,
  minMonthlySalaryCop: CO_HR_RULES.minMonthlySalary,
  transportAllowanceCop: CO_HR_RULES.transportAllowance,
  legalWeeklyHours: CO_HR_RULES.legalWeeklyHours,
  healthEmployeeRate: CO_PAYROLL.healthEmployeeRate,
  pensionEmployeeRate: CO_PAYROLL.pensionEmployeeRate,
  uvtCop: null,
  activeYear: new Date().getFullYear(),
  referenceMode: "automatic"
};

function colombiaTransportAllowanceSalaryCapCop() {
  return Math.max(0, parseNum(CO_HR_RULES.minMonthlySalary)) * CO_TRANSPORT_ALLOWANCE_MAX_SMMLV;
}

function colombiaTransportAllowanceEligible(baseSalary) {
  const salary = Math.max(0, parseNum(baseSalary));
  const cap = colombiaTransportAllowanceSalaryCapCop();
  return salary > 0 && cap > 0 && salary <= cap;
}

function suggestedEmployeeTransportAllowanceCop(baseSalary) {
  return colombiaTransportAllowanceEligible(baseSalary) ? CO_HR_RULES.transportAllowance : 0;
}

function resolveEmployeeTransportAllowanceCop(rawTransportAllowance, baseSalary) {
  if (!colombiaTransportAllowanceEligible(baseSalary)) return 0;
  const rawValue = String(rawTransportAllowance ?? "").trim();
  if (!rawValue) return CO_HR_RULES.transportAllowance;
  return Math.max(0, parseNum(rawTransportAllowance));
}

function readEmployeeTransportAllowanceCop(employee) {
  if (!employee) return 0;
  const rawValue = employee.transportAllowance;
  if (rawValue != null && String(rawValue).trim() !== "") {
    return Math.max(0, parseNum(rawValue));
  }
  return suggestedEmployeeTransportAllowanceCop(employee.baseSalary);
}

function readPositionTransportAllowanceCop(position) {
  if (!position) return 0;
  const rawValue = position.transportAllowance;
  if (rawValue != null && String(rawValue).trim() !== "") {
    return Math.max(0, parseNum(rawValue));
  }
  return suggestedEmployeeTransportAllowanceCop(position.baseSalary);
}

function positionSalaryUsesSmmlv(baseSalary) {
  return parseNum(baseSalary) === parseNum(CO_HR_RULES.minMonthlySalary);
}

function colombiaIntegralSalaryFloorCop() {
  return Math.max(0, parseNum(CO_HR_RULES.minMonthlySalary)) * CO_INTEGRAL_SALARY_MIN_SMMLV;
}

function validateColombiaMonthlySalaryCop(salary, label = "Salario") {
  const amount = parseNum(salary);
  const minSalary = CO_HR_RULES.minMonthlySalary;
  if (amount < minSalary) {
    return {
      ok: false,
      message: `${label}: debe ser al menos el SMMLV vigente ($${minSalary.toLocaleString("es-CO")}).`
    };
  }
  return { ok: true, amount };
}

function validateColombiaIntegralSalary(baseSalary, integralSalary) {
  const isIntegral = integralSalary === true || String(integralSalary || "").toLowerCase() === "true";
  if (!isIntegral) return { ok: true };
  const base = parseNum(baseSalary);
  const floor = colombiaIntegralSalaryFloorCop();
  if (base < floor) {
    return {
      ok: false,
      message: `Salario integral: el monto debe ser al menos 13 SMMLV ($${floor.toLocaleString("es-CO")}) según la norma laboral colombiana.`
    };
  }
  return { ok: true };
}

function validateColombiaPositionCompensation(raw = {}) {
  const minCheck = validateColombiaMonthlySalaryCop(raw.baseSalary, "Salario base del cargo");
  if (!minCheck.ok) return minCheck;
  const integralCheck = validateColombiaIntegralSalary(minCheck.amount, raw.integralSalary);
  if (!integralCheck.ok) return integralCheck;
  return {
    ok: true,
    baseSalary: minCheck.amount,
    transportAllowance: resolveEmployeeTransportAllowanceCop(raw.transportAllowance, minCheck.amount)
  };
}

function isVacancyAcceptingApplications(vacancy) {
  if (!vacancy) return false;
  if (String(vacancy.status || "").trim() !== "Publicada") return false;
  const deadline = String(vacancy.deadline || "").trim();
  if (!deadline) return true;
  const parts = deadline.split("-");
  if (parts.length !== 3) return true;
  const endTs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  if (!Number.isFinite(endTs)) return true;
  const today = new Date();
  const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return endTs >= today0;
}

function validateVacancySalaryOffer(salaryOffer, position) {
  const offerCheck = validateColombiaMonthlySalaryCop(salaryOffer, "Salario ofrecido");
  if (!offerCheck.ok) return offerCheck;
  if (position) {
    const catalogSalary = parseNum(position.baseSalary);
    if (catalogSalary > 0 && offerCheck.amount < catalogSalary) {
      return {
        ok: false,
        message: `El salario ofrecido no puede ser inferior al del cargo en catálogo ($${catalogSalary.toLocaleString("es-CO")}).`
      };
    }
  }
  return { ok: true, salaryOffer: offerCheck.amount };
}

function validateWorkerMinimumAge(birthIso, label = "trabajador") {
  const birth = String(birthIso || "").trim().slice(0, 10);
  if (!birth) return { ok: true };
  const ageInfo = portalCandidateAgeFromBirthIso(birth);
  if (ageInfo.age === null) {
    return { ok: false, message: "Indique una fecha de nacimiento válida." };
  }
  if (ageInfo.age < 18) {
    return { ok: false, message: `El ${label} debe ser mayor de 18 años (Código Sustantivo del Trabajo).` };
  }
  return { ok: true };
}

function setFormSelectValue(selectEl, value) {
  if (!selectEl || value == null) return;
  const v = String(value).trim();
  if (!v) return;
  const vLower = v.toLowerCase();
  const match = [...selectEl.options].find((o) => {
    const ov = String(o.value).trim();
    const ot = String(o.textContent || "").trim();
    return (
      ov === v ||
      ot === v ||
      (ov && ov.toLowerCase() === vLower) ||
      (ot && ot.toLowerCase() === vLower)
    );
  });
  if (match) selectEl.value = match.value;
}

/** ¿La opción del `<select>` corresponde al valor guardado? (exacto, etiqueta o sin distinguir mayúsculas). */
function editModalSelectOptionSelected(opt, fieldValue) {
  const fv = String(fieldValue ?? "").trim();
  if (!fv) return false;
  const ov = String(opt.value ?? "").trim();
  const ol = String(opt.label ?? "").trim();
  const fvLower = fv.toLowerCase();
  return (
    ov === fv ||
    ol === fv ||
    (ov && ov.toLowerCase() === fvLower) ||
    (ol && ol.toLowerCase() === fvLower)
  );
}

/**
 * Tras montar un modal CRUD: reaplica valores en selects, fechas y horas
 * (catálogos, BD en mayúsculas, ISO con hora, etc.).
 */
function wireEditModalFieldValues(formEl, fields) {
  if (!formEl || !Array.isArray(fields)) return;
  fields.forEach((f) => {
    if (!f?.name) return;
    if (f.type === "select") {
      const sel = formEl.querySelector(`select[name="${f.name}"]`);
      if (sel && f.value != null && String(f.value).trim() !== "") {
        setFormSelectValue(sel, f.value);
      }
      return;
    }
    if (f.type === "date") {
      const norm = normalizePortalDateYmd(f.value);
      if (norm) setFormDateByName(formEl, f.name, norm);
      return;
    }
    if (f.type === "datetime-local") {
      if (f.value == null || String(f.value).trim() === "") return;
      const raw = String(f.value).trim();
      const local =
        raw.length >= 16 && raw.includes("T") ? raw.slice(0, 16) : String(toInputDate(raw) || "").slice(0, 16);
      if (!local) return;
      const V = window.AntaresValidation;
      const hidden = formEl.querySelector(
        `input[type="hidden"][name="${f.name}"][data-portal-datetime-iso="1"]`
      );
      const wrap = hidden?.closest?.(".portal-datetime-dmy-row");
      if (wrap && V?.portalDatetimeInputSetIso) {
        V.portalDatetimeInputSetIso(wrap, local);
        return;
      }
      const inp = formEl.querySelector(`input[type="datetime-local"][name="${f.name}"]`);
      if (!inp) return;
      inp.value = local;
      V?.mountPortalDatetimeDmyInput?.(inp);
      const mountedWrap = inp.closest?.(".portal-datetime-dmy-row") || inp;
      V?.portalDatetimeInputSetIso?.(mountedWrap, local);
      return;
    }
    if (f.type === "time") {
      const inp = formEl.querySelector(`input[type="time"][name="${f.name}"]`);
      const raw = String(f.value ?? "").trim();
      if (inp && raw) inp.value = raw.length >= 5 ? raw.slice(0, 5) : raw;
    }
  });
}

/**
 * Cargo de conductor: por rol del catálogo o, como red de seguridad, por el nombre del cargo
 * (cargos creados como «CONDUCTOR» pero con rol «Empleado» por descuido habilitan igual la
 * sección de licencia/exámenes y la sincronización con el módulo Conductores).
 */
function positionLooksLikeConductor(position) {
  if (!position) return false;
  if (String(position.workerRole || "").trim().toLowerCase() === "conductor") return true;
  return /conductor/i.test(String(position.name || ""));
}

/** Etiquetas visibles para `CO_CATALOGS.driverVehicleTypes` (mismos valores de `vehiculos.tipo_vehiculo`). */
const DRIVER_VEHICLE_TYPE_LABELS = { Camion: "Camión", Turbo: "Turbo", Tractomula: "Tractomula", Bus: "Bus" };

/** Nombre de campo del checkbox por tipo de vehículo (único por tipo, evita el límite de `FormData` con nombres repetidos). */
function driverVehicleTypeFieldName(type) {
  return `vehicleType${String(type || "").trim()}`;
}

/**
 * Casillas «¿De cuáles vehículos de la flota es conductor?» (camión, turbo, tractomula, bus).
 * Se guardan como texto separado por comas en `conductores.tipos_vehiculo` (portal: `vehicleTypes`).
 */
function driverVehicleTypesCheckboxesHtml(selectedCsv) {
  const selected = new Set(
    String(selectedCsv || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
  );
  return CO_CATALOGS.driverVehicleTypes
    .map((type) => {
      const checked = selected.has(type) ? "checked" : "";
      return `<label class="hr-conductor-vehicle-type-option"><input type="checkbox" name="${escapeAttr(driverVehicleTypeFieldName(type))}" value="1" ${checked} /> ${escapeHtml(DRIVER_VEHICLE_TYPE_LABELS[type] || type)}</label>`;
    })
    .join("");
}

/** Lee las casillas de tipo de vehículo desde un objeto de formulario (`FormData` ya normalizado) y arma el CSV a persistir. */
function collectDriverVehicleTypesCsv(source) {
  if (!source || typeof source !== "object") return "";
  return CO_CATALOGS.driverVehicleTypes
    .filter((type) => {
      const v = source[driverVehicleTypeFieldName(type)];
      return v === "1" || v === "on" || v === true || v === "true";
    })
    .join(",");
}

/** Texto legible para tarjetas/fichas ("Camión, Tractomula") a partir del CSV guardado en BD. */
function driverVehicleTypesCsvToLabel(csv, fallback = "Sin dato") {
  const list = String(csv || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => DRIVER_VEHICLE_TYPE_LABELS[v] || v);
  return list.length ? list.join(", ") : fallback;
}

/**
 * Precarga en el formulario de empleado los datos definidos en el catálogo de cargos (Contratación).
 */
function applyPositionCatalogToEmployeeForm(form, position, options = {}) {
  const hintEl = form?.querySelector?.(options.hintSelector || "#emp-position-catalog-hint");
  if (!form) return false;
  if (!position) {
    if (hintEl) {
      hintEl.textContent =
        "Seleccione un cargo del catálogo para cargar salario, tipo de contrato, jornada, riesgo ARL y auxilio de transporte.";
    }
    const conductorBlock = form.querySelector("#hr-conductor-fields");
    if (conductorBlock) {
      conductorBlock.classList.remove("hidden");
      conductorBlock.removeAttribute("hidden");
    }
    return false;
  }

  const salaryEl = form.querySelector(options.salarySelector || "#emp-base-salary, input[name='baseSalary']");
  const contractEl = form.querySelector(options.contractSelector || "#emp-contract-type, select[name='contractType']");
  const transportEl = form.querySelector(options.auxSelector || "#emp-transport-allowance, input[name='transportAllowance']");
  const arlEl = form.querySelector(options.arlRiskSelector || "select[name='arlRiskLevel']");
  const templateEl = form.querySelector(options.templateSelector || "select[name='contractTemplateKind']");
  const scheduleEl = form.querySelector(options.scheduleSelector || "#emp-work-schedule, input[name='workSchedule']");

  const contractType = String(position.contractTypeDefault || "Termino indefinido").trim();
  const wr = positionLooksLikeConductor(position)
    ? "conductor"
    : String(position.workerRole || "empleado").toLowerCase();
  const schedule = String(position.workSchedule || position.schedule || "").trim();

  if (salaryEl) salaryEl.value = String(parseNum(position.baseSalary));
  if (contractEl) setFormSelectValue(contractEl, contractType);
  if (transportEl) {
    transportEl.value = String(readPositionTransportAllowanceCop(position));
    delete transportEl.dataset.userEdited;
  }
  if (arlEl && position.arlRiskLevel) setFormSelectValue(arlEl, position.arlRiskLevel);
  if (scheduleEl) scheduleEl.value = schedule;
  if (templateEl && window.RecruitmentDomain?.inferTemplateKind) {
    templateEl.value = window.RecruitmentDomain.inferTemplateKind(contractType, wr);
  }

  const conductorBlock = form.querySelector("#hr-conductor-fields");
  if (conductorBlock) {
    const isDriver = wr === "conductor";
    conductorBlock.classList.toggle("hidden", !isDriver);
    if (isDriver) conductorBlock.removeAttribute("hidden");
    else conductorBlock.setAttribute("hidden", "hidden");
    conductorBlock.querySelectorAll("input, select").forEach((inp) => {
      const name = String(inp.getAttribute("name") || "");
      if (!name) return;
      if (isDriver && ["license", "licenseCategory", "licenseExpiry"].includes(name)) {
        inp.setAttribute("required", "required");
      } else if (["license", "licenseCategory", "licenseExpiry"].includes(name)) {
        inp.removeAttribute("required");
      }
    });
  }

  if (hintEl) {
    const integral =
      position.integralSalary === true || String(position.integralSalary).toLowerCase() === "true";
    const bits = [
      `Cargo: ${String(position.name || "").trim()}`,
      wr === "conductor" ? "Conductor" : "Empleado",
      contractType ? `Contrato: ${contractType}` : "",
      schedule ? `Jornada: ${schedule}` : "",
      integral ? "Salario integral (catálogo)" : "",
      `Salario $${parseNum(position.baseSalary).toLocaleString("es-CO")}`,
      `Auxilio $${readPositionTransportAllowanceCop(position).toLocaleString("es-CO")}`
    ].filter(Boolean);
    hintEl.textContent = `${bits.join(" · ")}. Puede ajustar salario o auxilio si el pacto lo exige.`;
  }

  if (typeof options.onAfterApply === "function") options.onAfterApply(position);
  return true;
}

function bindPositionCompensationFields(form, config = {}) {
  const basisSelect = form?.querySelector?.(config.basisSelector || 'select[name="salaryBasis"]');
  const salaryInput = form?.querySelector?.(config.salarySelector || 'input[name="baseSalary"]');
  const minSalary = CO_HR_RULES.minMonthlySalary;
  const transportRule = bindEmployeeTransportAllowanceRule(form, {
    salarySelector: config.salarySelector || 'input[name="baseSalary"]',
    auxSelector: config.auxSelector || 'input[name="transportAllowance"]',
    hintSelector: config.hintSelector || "#position-legal-comp-hint",
    preserveExistingValue: Boolean(config.preserveExistingValue)
  });
  if (!basisSelect || !salaryInput) return { sync: transportRule.sync };
  const syncBasis = () => {
    const isSmmlv = String(basisSelect.value || "smmlv") === "smmlv";
    if (isSmmlv) {
      salaryInput.value = String(minSalary);
      salaryInput.readOnly = true;
      salaryInput.setAttribute("readonly", "readonly");
    } else {
      salaryInput.readOnly = false;
      salaryInput.removeAttribute("readonly");
      if (parseNum(salaryInput.value) < minSalary) salaryInput.value = String(minSalary);
    }
    transportRule.sync({ force: isSmmlv });
  };
  basisSelect.addEventListener("change", syncBasis);
  salaryInput.addEventListener("input", () => {
    if (String(basisSelect.value || "") === "custom") transportRule.sync();
  });
  syncBasis();
  return {
    sync: ({ force = false } = {}) => {
      syncBasis();
      transportRule.sync({ force });
    }
  };
}

function clampLaborSystemParameterYear(yearLike) {
  const y = Math.trunc(Number(yearLike) || new Date().getFullYear());
  return Math.min(LABOR_SYSTEM_PARAMETERS_MAX_YEAR, Math.max(LABOR_SYSTEM_PARAMETERS_MIN_YEAR, y));
}

function employeeTransportAllowanceGuidance(baseSalary) {
  const legalAux = parseNum(CO_HR_RULES.transportAllowance).toLocaleString("es-CO");
  const cap = colombiaTransportAllowanceSalaryCapCop().toLocaleString("es-CO");
  const activeParams =
    (typeof window.normalizeSystemParametersPayload === "function"
      ? window.normalizeSystemParametersPayload(read(KEYS.systemParameters, null))
      : null) || CO_SYSTEM_PARAMS_DEFAULTS;
  const activeYear = clampLaborSystemParameterYear(activeParams.activeYear);
  if (colombiaTransportAllowanceEligible(baseSalary)) {
    return `${activeYear}: se sugiere auxilio legal de transporte/conectividad por $${legalAux}. Aplica hasta 2 SMMLV ($${cap}).`;
  }
  const salary = Math.max(0, parseNum(baseSalary));
  if (salary > 0) {
    return `${activeYear}: si el salario supera 2 SMMLV ($${cap}), el auxilio legal se registra en $0. Si la empresa reconoce un valor adicional, debe tratarse como beneficio extralegal.`;
  }
  return `${activeYear}: el SMMLV es $${parseNum(CO_HR_RULES.minMonthlySalary).toLocaleString("es-CO")} y el auxilio legal de transporte/conectividad es $${legalAux}.`;
}

function bindEmployeeTransportAllowanceRule(form, config = {}) {
  const salaryInput = form?.querySelector?.(config.salarySelector || 'input[name="baseSalary"]');
  const auxInput = form?.querySelector?.(config.auxSelector || 'input[name="transportAllowance"]');
  const hintEl = form?.querySelector?.(config.hintSelector || "");
  const preserveExistingValue = Boolean(config.preserveExistingValue);
  if (!salaryInput || !auxInput) return { sync: () => {} };
  let initialized = false;
  const sync = ({ force = false } = {}) => {
    const baseSalary = parseNum(salaryInput.value);
    const eligible = colombiaTransportAllowanceEligible(baseSalary);
    const preserveOnInit = preserveExistingValue && !initialized;
    if (!preserveOnInit) {
      if (force || auxInput.dataset.userEdited !== "1" || !eligible) {
        auxInput.value = String(suggestedEmployeeTransportAllowanceCop(baseSalary));
      }
    } else if (!eligible) {
      auxInput.value = "0";
    }
    if (!eligible) delete auxInput.dataset.userEdited;
    if (hintEl) hintEl.textContent = employeeTransportAllowanceGuidance(baseSalary);
    initialized = true;
  };
  salaryInput.addEventListener("input", () => sync());
  auxInput.addEventListener("input", () => {
    auxInput.dataset.userEdited = "1";
    if (hintEl) hintEl.textContent = employeeTransportAllowanceGuidance(salaryInput.value);
  });
  sync({ force: !preserveExistingValue });
  return { sync };
}

function applyLaborSystemParametersApiResponse(saved) {
  if (saved?.systemParameters && typeof window.applySystemParametersFromBootstrapPayload === "function") {
    window.applySystemParametersFromBootstrapPayload(saved.systemParameters);
  }
  if (saved?.systemParametersHistory !== undefined) {
    state.systemParametersHistory = Array.isArray(saved.systemParametersHistory) ? saved.systemParametersHistory : [];
  }
}

function laborSystemParametersHistoryRows() {
  return Array.isArray(state.systemParametersHistory) ? state.systemParametersHistory.filter(Boolean) : [];
}

function laborSystemParametersDraftForYear(yearLike, historyRows = laborSystemParametersHistoryRows()) {
  const active =
    (typeof window.normalizeSystemParametersPayload === "function"
      ? window.normalizeSystemParametersPayload(read(KEYS.systemParameters, null))
      : null) || CO_SYSTEM_PARAMS_DEFAULTS;
  const numericYear = clampLaborSystemParameterYear(yearLike);
  const exact = historyRows.find((row) => Number(row?.year) === numericYear) || null;
  const fallback = exact || historyRows[0] || {};
  return {
    year: numericYear,
    effectiveFrom: String(fallback.effectiveFrom || `${numericYear}-01-01`),
    effectiveTo: String(fallback.effectiveTo || `${numericYear}-12-31`),
    smmlvCop: Math.max(0, parseNum(fallback.smmlvCop ?? fallback.minMonthlySalaryCop ?? active.smmlvCop)),
    minMonthlySalaryCop: Math.max(
      0,
      parseNum(fallback.minMonthlySalaryCop ?? fallback.smmlvCop ?? active.minMonthlySalaryCop)
    ),
    transportAllowanceCop: Math.max(0, parseNum(fallback.transportAllowanceCop ?? active.transportAllowanceCop)),
    legalWeeklyHours: Math.max(0, parseNum(fallback.legalWeeklyHours ?? active.legalWeeklyHours)),
    healthEmployeeRate: Math.max(0, parseNum(fallback.healthEmployeeRate ?? active.healthEmployeeRate)),
    pensionEmployeeRate: Math.max(0, parseNum(fallback.pensionEmployeeRate ?? active.pensionEmployeeRate)),
    uvtCop: Math.max(0, parseNum(fallback.uvtCop ?? active.uvtCop ?? 0)),
    activeYear: clampLaborSystemParameterYear(active.activeYear || numericYear),
    referenceMode: active.referenceMode === "manual" ? "manual" : "automatic",
    isCurrent: Boolean(fallback.isCurrent)
  };
}

function laborSystemParametersSelectableYears(historyRows = laborSystemParametersHistoryRows()) {
  const years = new Set(
    (Array.isArray(historyRows) ? historyRows : [])
      .map((row) => Number(row?.year) || 0)
      .filter((y) => y >= LABOR_SYSTEM_PARAMETERS_MIN_YEAR && y <= LABOR_SYSTEM_PARAMETERS_MAX_YEAR)
  );
  for (let y = LABOR_SYSTEM_PARAMETERS_MIN_YEAR; y <= LABOR_SYSTEM_PARAMETERS_MAX_YEAR; y += 1) {
    years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

function renderPayrollLegalHistoryCard(row, allRuns = [], { canDelete = false } = {}) {
  const rowYear = Number(row?.year) || 0;
  const rowRuns = (Array.isArray(allRuns) ? allRuns : []).filter((run) =>
    String(run.month || "").startsWith(`${rowYear}`)
  ).length;
  const healthPct = ((parseNum(row.healthEmployeeRate) || 0) * 100).toFixed(2).replace(/\.00$/, "");
  const pensionPct = ((parseNum(row.pensionEmployeeRate) || 0) * 100).toFixed(2).replace(/\.00$/, "");
  const statusHtml = row.isCurrent
    ? '<span class="status status-completada">Vigente hoy</span>'
    : '<span class="status">Histórica</span>';
  return `<article class="payroll-legal-vigencia-card${row.isCurrent ? " is-current" : ""}" data-legal-year="${escapeAttr(String(rowYear))}">
    <header class="payroll-legal-vigencia-card__head">
      <div>
        <p class="payroll-legal-vigencia-card__year">${escapeHtml(String(rowYear || "—"))}</p>
        <p class="muted payroll-legal-vigencia-card__range">${escapeHtml(String(row.effectiveFrom || "—"))} → ${escapeHtml(String(row.effectiveTo || "—"))}</p>
      </div>
      ${statusHtml}
    </header>
    <dl class="payroll-legal-vigencia-card__metrics">
      <div><dt>SMMLV</dt><dd>$${parseNum(row.smmlvCop).toLocaleString("es-CO")}</dd></div>
      <div><dt>Auxilio</dt><dd>$${parseNum(row.transportAllowanceCop).toLocaleString("es-CO")}</dd></div>
      <div><dt>Salud / pensión</dt><dd>${healthPct}% / ${pensionPct}%</dd></div>
      <div><dt>UVT</dt><dd>${row.uvtCop != null ? `$${parseNum(row.uvtCop).toLocaleString("es-CO")}` : "—"}</dd></div>
      <div><dt>Horas / liq.</dt><dd>${escapeHtml(String(parseNum(row.legalWeeklyHours || 0) || "—"))} · <strong>${rowRuns}</strong></dd></div>
    </dl>
    <footer class="payroll-legal-vigencia-card__actions toolbar">
      <button type="button" class="btn btn-sm btn-outline" data-action="payroll-legal-set-year" data-year="${escapeAttr(String(rowYear))}">${IC.edit} Editar</button>
      ${
        canDelete
          ? `<button type="button" class="btn btn-sm btn-reject" data-action="payroll-legal-delete" data-year="${escapeAttr(String(rowYear))}" title="Eliminar vigencia del año (solo administradores)">${IC.trash} Eliminar</button>`
          : ""
      }
    </footer>
  </article>`;
}


function selectOptionsFromCatalog(values = [], selected = "", placeholder = "Seleccione...") {
  const matched = matchCatalogOptionValue(values, selected);
  const normalizedSelected = String(matched || selected || "").trim();
  const list = Array.isArray(values) ? [...values] : [];
  if (
    normalizedSelected &&
    !list.some((v) => String(v).trim().toLowerCase() === normalizedSelected.toLowerCase())
  ) {
    list.push(normalizedSelected);
  }
  const options = list.map((value) => {
    const safeValue = String(value || "").trim();
    const sel =
      safeValue === normalizedSelected ||
      safeValue.toLowerCase() === normalizedSelected.toLowerCase()
        ? "selected"
        : "";
    return `<option value="${safeValue}" ${sel}>${safeValue}</option>`;
  });
  return [`<option value="">${placeholder}</option>`, ...options].join("");
}

/** Opciones `{ value, label }` para `openEditModal`: incluye valor guardado aunque no esté en el catálogo. */
function editModalCatalogSelectOptions(catalog, selected, placeholder = "Seleccione...") {
  const matched = matchCatalogOptionValue(catalog, selected);
  const values = Array.isArray(catalog) ? [...catalog] : [];
  if (matched && !values.some((v) => String(v).trim() === String(matched).trim())) {
    values.push(matched);
  }
  return [{ value: "", label: placeholder }, ...values.map((item) => ({ value: item, label: item }))];
}

function validateCandidatePipelineTransition(candidate, nextStatus) {
  const currentStatus = String(candidate?.status || PIPELINE[0]);
  const targetStatus = String(nextStatus || currentStatus);
  if (currentStatus === targetStatus) return { ok: true };
  const allowed = PIPELINE_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return { ok: false, message: `Flujo invalido: ${currentStatus} -> ${targetStatus}. Debes respetar el orden del pipeline.` };
  }
  if (targetStatus === "Oferta enviada") {
    const hasInterview = read(KEYS.interviews, []).some((item) => String(item.candidateId || "") === String(candidate.id || ""));
    if (!hasInterview) {
      return { ok: false, message: "Para enviar oferta primero debes registrar entrevista del candidato." };
    }
  }
  if (targetStatus === "Contratado") {
    const byCandidate = read(KEYS.contracts, []).some((item) => String(item.candidateId || "") === String(candidate.id || ""));
    const candDoc = String(candidate.idDoc || "").trim();
    const byEmployeeDoc =
      Boolean(candDoc) &&
      read(KEYS.contracts, []).some((item) => {
        if (!item.employeeId) return false;
        const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(item.employeeId));
        return emp && String(emp.idDoc || "").trim() === candDoc;
      });
    if (!byCandidate && !byEmployeeDoc) {
      return {
        ok: false,
        message:
          "Para marcar como contratado debe existir un contrato generado (desde Gestión humana o Contratación, misma cédula) o el registro histórico por candidato."
      };
    }
  }
  return { ok: true };
}

function canPerformHiringEditAction(action) {
  return HIRING_RRHH_EDIT_ACTIONS.has(String(action || "")) && canManageHiringModule();
}

const PAYROLL_RRHH_EDIT_ACTIONS = new Set(["delete-employee"]);

function canPerformPayrollEditAction(action) {
  return PAYROLL_RRHH_EDIT_ACTIONS.has(String(action || "")) && canManagePayrollModule();
}

function canPerformSstEditAction(action) {
  return SST_RRHH_EDIT_ACTIONS.has(String(action || "")) && canManageSstModule();
}

function hiringPipelineStatusClass(status) {
  const s = String(status || "");
  if (s === "Contratado") return "status-viaje_asignado";
  if (s === "Descartado") return "status-rechazada";
  if (s === "Oferta enviada") return "status-viaje_completado";
  if (s === "Entrevistado") return "status-en_transito";
  if (s === "Preseleccionado") return "status-pendiente";
  return "status-pendiente";
}

function hiringPipelineSelectOptions(currentStatus) {
  const current = String(currentStatus || PIPELINE[0]);
  const allowed = PIPELINE_TRANSITIONS[current] || [];
  const options = new Set([current, ...allowed]);
  return [...options]
    .map((p) => `<option value="${escapeAttr(p)}"${p === current ? " selected" : ""}>${escapeHtml(p)}</option>`)
    .join("");
}

function computeHiringConversionPct(candidates) {
  const rows = Array.isArray(candidates) ? candidates : [];
  if (!rows.length) return 0;
  const hired = rows.filter((c) => String(c.status || "") === "Contratado").length;
  return Math.round((hired / rows.length) * 100);
}

function formatInterviewModeLabel(mode) {
  const m = String(mode || "").trim().toLowerCase();
  if (m === "virtual") return "Virtual";
  if (m === "telefonica" || m === "telefónica") return "Telefónica";
  if (m === "presencial") return "Presencial";
  return mode ? String(mode) : "—";
}

function getCandidateVacancyAndPosition(candidate) {
  const vacancy =
    read(KEYS.vacancies, []).find((v) => String(v.id) === String(candidate?.vacancyId || "")) || null;
  const position = vacancy ? getPositionById(String(vacancy.positionId || "")) : null;
  return { vacancy, position };
}

function hiringEmptyState(text, cta = null) {
  const ctaHtml =
    cta && cta.action
      ? `<div class="hiring-empty-actions"><button type="button" class="btn btn-primary btn-sm" data-action="${escapeAttr(
          cta.action
        )}"${cta.section ? ` data-section="${escapeAttr(cta.section)}"` : ""}>${IC.plus} ${escapeHtml(
          cta.label || "Registrar"
        )}</button></div>`
      : "";
  return `<div class="empty-state hiring-empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><p>${escapeHtml(
    text
  )}</p>${ctaHtml}</div>`;
}

function applyCandidateToEmployeeForm(form, candidate) {
  if (!form || !candidate) return false;
  const { position } = getCandidateVacancyAndPosition(candidate);
  const setVal = (selector, value) => {
    const el = form.querySelector(selector);
    if (el && value != null && String(value).trim() !== "") el.value = String(value);
  };
  setVal("input[name='name']", candidate.name);
  setVal("select[name='documentType']", candidate.documentType || "CC");
  setVal("input[name='idDoc']", candidate.idDoc);
  const setDate = (name, iso) => {
    const ymd = normalizePortalDateYmd(iso);
    if (!ymd) return;
    window.AntaresValidation?.setPortalFormDateByName?.(form, name, ymd);
  };
  setDate("birthDate", String(candidate.birthDate || "").slice(0, 10));
  setVal("select[name='educationLevel']", candidate.educationLevel);
  setVal("input[name='phone']", candidate.phone);
  setVal("input[name='personalEmail']", candidate.email);
  setVal("input[name='address']", candidate.address);
  setDate("startDate", colombiaTodayIsoDate());
  const deptSel = form.querySelector("select[name='department']");
  if (deptSel && candidate.department) {
    setFormSelectValue(deptSel, candidate.department);
    deptSel.dispatchEvent(new Event("change", { bubbles: true }));
    requestAnimationFrame(() => setVal("select[name='city']", candidate.city));
  } else {
    setVal("select[name='city']", candidate.city);
  }
  const posSel = form.querySelector("#emp-position-select, select[name='positionId']");
  if (posSel && position) {
    setFormSelectValue(posSel, position.id);
    posSel.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const hintEl = form.querySelector("#emp-position-catalog-hint");
  if (hintEl) {
    hintEl.textContent = `Datos precargados desde candidato «${String(candidate.name || "").trim()}». Complete seguridad social, banco y demás campos obligatorios antes de guardar.`;
  }
  form.dataset.prefillCandidateId = String(candidate.id || "");
  return true;
}

function openPayrollEmployeeFromCandidate(...args) {
  const impl = globalThis.__antaresPortalRrhhModals;
  if (impl && typeof impl.openPayrollEmployeeFromCandidate === "function") return impl.openPayrollEmployeeFromCandidate(...args);
}


function openHiringContractFromCandidate(...args) {
  const impl = globalThis.__antaresPortalRrhhModals;
  if (impl && typeof impl.openHiringContractFromCandidate === "function") return impl.openHiringContractFromCandidate(...args);
}


/** Misma política que modules/core/persistence.js cuando no hay AntaresPersistence. */
function capStoredArrayRows(key, value) {
  const caps = { [KEYS.notifications]: 500, [KEYS.emails]: 400 };
  const max = caps[key];
  if (!max || !Array.isArray(value) || value.length <= max) return value;
  return value.slice(0, max);
}

function read(key, fallback = []) {
  const P = window.AntaresPersistence;
  const normalizeShape = (value) => {
    if (Array.isArray(fallback)) return Array.isArray(value) ? value : fallback;
    if (fallback && typeof fallback === "object") {
      return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
    }
    return value ?? fallback;
  };
  if (P && typeof P.read === "function") return normalizeShape(P.read(key, fallback));
  try {
    return normalizeShape(JSON.parse(localStorage.getItem(key)));
  } catch (_error) {
    return fallback;
  }
}

function readArray(key) {
  const value = read(key, []);
  return Array.isArray(value) ? value : [];
}

function write(key, value, opts = {}) {
  const skipSyncSchedule = opts?.skipSyncSchedule === true;
  const P = window.AntaresPersistence;
  if (P && typeof P.write === "function") {
    P.write(key, value, opts);
  } else {
    const stored = capStoredArrayRows(key, value);
    localStorage.setItem(key, JSON.stringify(stored));
    if (!skipSyncSchedule && window.AntaresPortalSync && typeof window.AntaresPortalSync.schedule === "function") {
      window.AntaresPortalSync.schedule(key, stored);
    }
  }
  /** Contador de campana lateral: mismo valor que tras F5 ante cualquier mutación local o bootstrap. */
  if (key === KEYS.notifications && getSession()) {
    try {
      updateNotificationBadge();
    } catch (_e) {
      /* DOM aún sin portal o función no inicializada */
    }
  }
}

/**
 * Persiste una lista podada en PostgreSQL; admite lista vacía vía deletedIds.
 * @returns {Promise<boolean>}
 */
async function writePortalListPrunedAwaitServer(storageKey, nextList, deletedIds = [], opts = {}) {
  const prev = read(storageKey, []);
  const normalizedDeleted = [
    ...new Set(
      (Array.isArray(deletedIds) ? deletedIds : [deletedIds])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  ];
  try {
    await writeAwaitServerDelete(storageKey, nextList, normalizedDeleted, {
      notifyOnFailure: opts.notifyOnFailure
    });
    return true;
  } catch (err) {
    write(storageKey, prev, { skipSyncSchedule: true });
    if (opts.notifyOnFailure !== false) {
      notify(String(err?.message || "No se pudo guardar el cambio en el servidor."), "error");
    }
    return false;
  }
}

/**
 * Quita una fila del catálogo en memoria y confirma en PostgreSQL (incluye lista vacía).
 * @returns {Promise<boolean>} true si el servidor confirmó (o no hay API).
 */
async function removeFromPortalListAwaitServer(storageKey, rowId, opts = {}) {
  const id = String(rowId || "").trim();
  if (!id) return false;
  const prev = read(storageKey, []);
  if (!Array.isArray(prev)) return false;
  const next = prev.filter((row) => String(row?.id || "") !== id);
  if (next.length === prev.length) return false;
  return writePortalListPrunedAwaitServer(storageKey, next, [id], opts);
}

/**
 * Inserta o reemplaza una fila de usuario (formato `loadUsers`) en `KEYS.users`.
 * Usado como fallback ligero si /portal/bootstrap falla pero /portal/me responde:
 * así Mi perfil renderiza con datos reales en vez de stub vacío del JWT.
 */
function upsertPortalUserRowIntoCache(row) {
  if (!row || typeof row !== "object") return null;
  const uid = String(row.id || "").trim();
  if (!uid) return null;
  const normalized =
    typeof window.normalizePortalBootstrapUserRow === "function"
      ? window.normalizePortalBootstrapUserRow(row)
      : row;
  const users = read(KEYS.users, []);
  const prev = users.find((u) => String(u.id) === uid);
  const others = users.filter((u) => String(u.id) !== uid);
  const merged = { ...prev, ...normalized };
  write(KEYS.users, [merged, ...others], { skipSyncSchedule: true });
  return merged;
}

function defaultAdminUsersUi() {
  return {
    panel: "",
    editUserId: "",
    editCompanyId: "",
    section: "pending",
    createUserMinimized: false,
    createCompanyMinimized: false,
    editMinimized: false,
    permissionsMinimized: false
  };
}

function getAdminUsersUi() {
  return { ...defaultAdminUsersUi(), ...(state.adminUsersUi || {}) };
}

function setAdminUsersUi(patch) {
  state.adminUsersUi = { ...getAdminUsersUi(), ...(patch && typeof patch === "object" ? patch : {}) };
}

function getAdminUsersDraft(slot) {
  const key = String(slot || "").trim();
  if (!key) return {};
  const drafts = state.adminUsersDrafts && typeof state.adminUsersDrafts === "object" ? state.adminUsersDrafts : {};
  const raw = drafts[key];
  return raw && typeof raw === "object" ? { ...raw } : {};
}

function setAdminUsersDraft(slot, draft) {
  const key = String(slot || "").trim();
  if (!key) return;
  const next = draft && typeof draft === "object" ? { ...draft } : {};
  state.adminUsersDrafts = {
    ...(state.adminUsersDrafts && typeof state.adminUsersDrafts === "object" ? state.adminUsersDrafts : {}),
    [key]: next
  };
}

function clearAdminUsersDraft(slot) {
  setAdminUsersDraft(slot, {});
}

/** Cuerpo de p-card colapsable (mismo patrón que registro de sesiones en admin). */
function adminUsersCollapsibleCardBody(expanded, toggleAction, panelHtml) {
  return `${renderModulePanelToolbar({ expanded, toggleAction, showWhen: "collapsed" })}
  <div class="${expanded ? "" : "hidden"}" data-admin-collapsible-panel>
    ${panelHtml}
  </div>`;
}

/**
 * POST autenticado al API: usa la misma alineacion JWT↔sesion que bootstrap.
 * Sin URL de backend: no llama al servidor (retorna undefined).
 * Con backend pero sin token/sesión valida: lanza Error (evita borrados solo en caché en produccion).
 */
async function postPortalAuthorized(path, body) {
  const api = window.AntaresApi;
  if (!api?.getBase?.()) return undefined;
  if (!portalCanRefreshFromApi()) {
    throw new Error(
      "No hay sesion valida con el servidor. Revise antares_api_base y vuelva a iniciar sesion."
    );
  }
  return api.postJson(path, body);
}

/**
 * Tras novedades que afectan nómina laboral (ausencias, cambios de salario): crea/actualiza
 * borradores en servidor. Conductores (prestación de servicios) se excluyen — pago por viajes.
 */
async function refreshDriverTripPaymentLinked(employeeId, periodYm, opts = {}) {
  const eid = String(employeeId || "").trim();
  const ym = String(periodYm || "").trim().slice(0, 7);
  if (!eid || !/^\d{4}-\d{2}$/.test(ym) || !portalCanRefreshFromApi()) return null;
  const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === eid);
  if (!emp || !employeeIsConductorServiceProvider(emp)) {
    return { skipped: true, message: "No es conductor en prestación de servicios" };
  }
  try {
    const result = await postPortalAuthorized("/payroll/driver-trip-payment", {
      employeeId: eid,
      periodYm: ym,
      travelAllowanceManualCop: opts.travelAllowanceManualCop,
      fuelReimbursementManualCop: opts.fuelReimbursementManualCop
    });
    if (opts.bootstrap !== false) {
      try {
        await applyPortalBootstrapFromApi();
      } catch (_e) {}
    }
    return result;
  } catch (err) {
    if (opts.notifyOnError !== false) {
      notify(String(err?.message || "No fue posible liquidar los viajes en el servidor."), "warn");
    }
    return null;
  }
}

async function refreshPayrollDraftsLinked(employeeId, startDate, endDate, opts = {}) {
  const eid = String(employeeId || "").trim();
  if (!eid || !portalCanRefreshFromApi()) return null;
  const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === eid);
  if (emp && !employeeReceivesPayrollNomina(emp)) {
    return { created: 0, updated: 0, skipped: 0, conductorTripPay: true };
  }
  try {
    const result = await postPortalAuthorized("/payroll/refresh-drafts", {
      employeeId: eid,
      startDate: startDate ? String(startDate).slice(0, 10) : undefined,
      endDate: endDate ? String(endDate).slice(0, 10) : undefined
    });
    if (opts.bootstrap !== false) {
      try {
        await applyPortalBootstrapFromApi();
      } catch (_e) {}
    }
    return result;
  } catch (err) {
    if (opts.notifyOnError !== false) {
      notify(
        String(err?.message || "La novedad se guardó, pero no se pudo actualizar el borrador de nómina."),
        "warn"
      );
    }
    return null;
  }
}

function payrollDraftLinkSuccessMessage(result, fallback = userMessage("absenceRecorded")) {
  if (result?.conductorTripPay) return userMessage("absenceRecordedConductorTripPay");
  if (!result || typeof result !== "object") return fallback;
  const created = Number(result.created) || 0;
  const updated = Number(result.updated) || 0;
  if (created + updated > 0) {
    const parts = [];
    if (created > 0) parts.push(`${created} borrador${created === 1 ? "" : "es"} creado${created === 1 ? "" : "s"}`);
    if (updated > 0) parts.push(`${updated} liquidación${updated === 1 ? "" : "es"} actualizada${updated === 1 ? "" : "s"}`);
    return `Novedad registrada. Nómina vinculada: ${parts.join(" y ")}.`;
  }
  return fallback;
}

/** Repone datos de la última sesión en RAM (instantáneo tras F5). */
function restorePortalSnapshotIfAvailable() {
  const session = getSession();
  const uid = session?.userId;
  const cache = window.PortalBootstrapCache;
  if (!uid || !cache?.tryRestore) return false;
  if (!cache.tryRestore(String(uid), { deferNonEssential: true })) return false;
  if (typeof window.applyPortalSnapshotExtras === "function") {
    window.applyPortalSnapshotExtras(cache.consumeRestoredExtras?.());
  }
  state.portalSnapshotRestored = true;
  state.portalDataHydrated = true;
  try {
    ensureUsersPermissions();
    syncSessionProfileSnapshotFromCache();
  } catch (_e) {
    /* noop */
  }
  return true;
}

/** Indica / oculta el aviso global de carga de datos del servidor. */
function setPortalDataHydrating(on) {
  const next = Boolean(on);
  if (state.portalDataHydrating === next) {
    updatePortalDataHydratingBanner();
    return;
  }
  state.portalDataHydrating = next;
  updatePortalDataHydratingBanner();
}

function updatePortalDataHydratingBanner() {
  const root = document.getElementById("view-root");
  if (!root) return;
  const id = "portal-data-hydrating-banner";
  let el = document.getElementById(id);
  const show = Boolean(state.portalDataHydrating && getSession());
  if (!show) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.className = "portal-data-hydrating-banner";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    root.prepend(el);
  }
  el.textContent =
    state.portalDataHydrated || state.portalSnapshotRestored
      ? "Actualizando datos del servidor…"
      : "Cargando datos del servidor…";
}

window.setPortalDataHydrating = setPortalDataHydrating;
window.isPortalDataHydrating = function isPortalDataHydrating() {
  return Boolean(state.portalDataHydrating);
};

try {
  if (typeof window.onPortalEvent === "function") {
    window.onPortalEvent("updatePortalDataHydratingBanner", updatePortalDataHydratingBanner);
  }
} catch (_e) {
  /* noop */
}

window.refreshPositionsCatalogFromApi = refreshPositionsCatalogFromApi;

/** Fusiona filas de GET /portal/pending-user-registrations sin borrar el resto de usuarios en caché. */

if (typeof window.DomainModules?.requests?.attachStorage === "function") {
  window.DomainModules.requests.attachStorage({ KEYS, read, write });
}
if (typeof window.DomainRegistry?.wireFromAntares === "function") {
  window.DomainRegistry.wireFromAntares({ KEYS, read, write });
}

/**
 * Registro teléfono: países principales (Colombia siempre primero = opción por defecto).
 * `flag`: sufijo CSS `.register-lang-flag--*` (gradientes locales, sin red).
 */
const REGISTER_PHONE_COUNTRIES = [
  { id: "CO", label: "Colombia", dial: "57", minNat: 10, maxNat: 10, style: "co", flag: "co" },
  { id: "MX", label: "México", dial: "52", minNat: 10, maxNat: 10, style: "generic", flag: "mx" },
  { id: "US", label: "Estados Unidos", dial: "1", minNat: 10, maxNat: 10, style: "generic", flag: "us" },
  { id: "EC", label: "Ecuador", dial: "593", minNat: 9, maxNat: 9, style: "generic", flag: "ec" },
  { id: "PE", label: "Perú", dial: "51", minNat: 9, maxNat: 9, style: "generic", flag: "pe" },
  { id: "CL", label: "Chile", dial: "56", minNat: 9, maxNat: 9, style: "generic", flag: "cl" },
  { id: "AR", label: "Argentina", dial: "54", minNat: 10, maxNat: 10, style: "generic", flag: "ar" },
  { id: "BR", label: "Brasil", dial: "55", minNat: 10, maxNat: 11, style: "generic", flag: "br" },
  { id: "PA", label: "Panamá", dial: "507", minNat: 8, maxNat: 8, style: "generic", flag: "pa" },
  { id: "CR", label: "Costa Rica", dial: "506", minNat: 8, maxNat: 8, style: "generic", flag: "cr" },
  { id: "ES", label: "España", dial: "34", minNat: 9, maxNat: 9, style: "generic", flag: "es" },
  { id: "VE", label: "Venezuela", dial: "58", minNat: 10, maxNat: 10, style: "generic", flag: "ve" },
  { id: "GT", label: "Guatemala", dial: "502", minNat: 8, maxNat: 8, style: "generic", flag: "gt" },
  { id: "HN", label: "Honduras", dial: "504", minNat: 8, maxNat: 8, style: "generic", flag: "hn" }
];

const PHONE_UI_PRESETS = {
  register: {
    cc: ".js-register-phone-cc",
    nat: ".js-register-phone-national",
    flag: ".js-register-lang-flag",
    hintId: "register-phone-hint",
    full: ".js-register-phone-full"
  },
  b2b: {
    cc: ".js-b2b-phone-cc",
    nat: ".js-b2b-phone-national",
    flag: ".js-b2b-lang-flag",
    hintId: "b2b-phone-hint",
    full: ".js-b2b-phone-full"
  }
};

function registerPhoneCountryOptionsHtml() {
  return REGISTER_PHONE_COUNTRIES.map((c, index) => {
    const escLabel = String(c.label || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;");
    const selected = index === 0 ? " selected" : "";
    return `<option value="${c.id}" title="${escLabel}"${selected}>+${c.dial}</option>`;
  }).join("");
}

function getSelectedPhoneCountry(form, presetKey) {
  const p = PHONE_UI_PRESETS[presetKey];
  if (!form || !p) return REGISTER_PHONE_COUNTRIES[0];
  const sel = form.querySelector(p.cc);
  const id = sel?.value || "CO";
  return REGISTER_PHONE_COUNTRIES.find((c) => c.id === id) || REGISTER_PHONE_COUNTRIES[0];
}

function stripDigitsForRegisterNational(raw, meta) {
  let d = String(raw || "").replace(/\D/g, "");
  const dial = meta.dial;
  if (d.startsWith(dial)) d = d.slice(dial.length);
  if (meta.style === "co") {
    if (d.startsWith("57")) d = d.slice(2);
    return d.slice(0, 10);
  }
  while (d.length > meta.maxNat && d.startsWith("0")) {
    d = d.slice(1);
  }
  return d.slice(0, meta.maxNat);
}

function updatePhoneFieldForCountry(form, presetKey) {
  const p = PHONE_UI_PRESETS[presetKey];
  if (!form || !p) return;
  const meta = getSelectedPhoneCountry(form, presetKey);
  const nat = form.querySelector(p.nat);
  const wrap = nat?.closest(".phone-input-professional") || form.querySelector(".phone-input-professional");
  const ccSel = form.querySelector(p.cc);
  const langFlag = form.querySelector(p.flag);
  const hint = document.getElementById(p.hintId);
  if (langFlag) {
    const sfx = meta.flag || "co";
    const flagBase = presetKey === "b2b" ? "js-b2b-lang-flag" : "js-register-lang-flag";
    langFlag.className = `${flagBase} register-lang-flag register-lang-flag--${sfx}`;
    langFlag.setAttribute("title", meta.label);
  }
  if (ccSel) {
    ccSel.setAttribute("aria-label", `Indicativo +${meta.dial} (${meta.label})`);
  }
  if (wrap) {
    wrap.setAttribute(
      "aria-label",
      meta.id === "CO" ? "Teléfono celular Colombia" : `Teléfono ${meta.label}`
    );
  }
  if (hint) {
    hint.textContent =
      meta.style === "co"
        ? "Celular Colombia: 10 dígitos (empieza por 3)."
        : meta.minNat === meta.maxNat
          ? `Indicativo +${meta.dial}: ingrese ${meta.maxNat} dígitos del número local.`
          : `Indicativo +${meta.dial}: entre ${meta.minNat} y ${meta.maxNat} dígitos del número local.`;
  }
  if (nat) {
    nat.placeholder = meta.style === "co" ? "300 123 4567" : "Número local";
    const maxFormatted =
      meta.style === "co"
        ? 14
        : meta.maxNat + (Math.ceil(meta.maxNat / 3) - 1);
    nat.setAttribute("maxlength", String(maxFormatted));
  }
}

function syncPhoneHiddenFull(form, presetKey) {
  const p = PHONE_UI_PRESETS[presetKey];
  if (!form || !p) return;
  const nat = form.querySelector(p.nat);
  const hid = form.querySelector(p.full);
  if (!nat || !hid) return;
  const meta = getSelectedPhoneCountry(form, presetKey);
  let digits = stripDigitsForRegisterNational(nat.value, meta);
  if (meta.style === "co") {
    nat.value = digits ? formatColombianNationalDisplay(digits) : "";
    hid.value = digits ? formatColombianPhone("57" + digits) : "";
    return;
  }
  nat.value = digits ? formatGenericNationalDisplay(digits, meta.maxNat) : "";
  hid.value = digits ? `+${meta.dial} ${formatGenericNationalDisplay(digits, meta.maxNat)}` : "";
}

function clearFieldError(field) {
  const V = window.AntaresValidation;
  if (V && typeof V.clearFieldError === "function") {
    V.clearFieldError(field);
    return;
  }
  if (!field) return;
  field.classList.remove("field-invalid");
  const label = field.closest("label");
  const error = label?.querySelector(".field-error");
  if (error) error.remove();
}

function setFieldError(field, message) {
  const V = window.AntaresValidation;
  if (V && typeof V.setFieldError === "function") {
    V.setFieldError(field, message);
    return;
  }
  if (!field) return;
  const label = field.closest("label");
  if (!label) return;
  clearFieldError(field);
  field.classList.add("field-invalid");
  const hint = document.createElement("small");
  hint.className = "field-error";
  hint.textContent = message;
  label.appendChild(hint);
}

let b2bFormFeedbackHideTimer = null;

/** Aviso visible en el formulario B2B (complementa el toast). */
function setB2bFormFeedback(kind, message) {
  const el = document.getElementById("b2b-form-feedback");
  if (!el) return;
  if (b2bFormFeedbackHideTimer) {
    clearTimeout(b2bFormFeedbackHideTimer);
    b2bFormFeedbackHideTimer = null;
  }
  el.textContent = message || "";
  el.classList.remove("b2b-form-feedback--hidden", "b2b-form-feedback--success", "b2b-form-feedback--error");
  if (!kind || !String(message || "").trim()) {
    el.classList.add("b2b-form-feedback--hidden");
    return;
  }
  el.classList.add(kind === "success" ? "b2b-form-feedback--success" : "b2b-form-feedback--error");
  try {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (_) {
    /* noop */
  }
  if (kind === "success") {
    b2bFormFeedbackHideTimer = setTimeout(() => {
      el.classList.add("b2b-form-feedback--hidden");
      el.textContent = "";
      b2bFormFeedbackHideTimer = null;
    }, 12000);
  }
}

function initB2BFormExperience() {
  const form = nodes.b2bForm;
  if (!form) return;
  const panes = [...form.querySelectorAll("[data-step-pane]")];
  const chips = [...form.querySelectorAll("[data-step-chip]")];
  const actions = form.querySelector(".contact-step-actions");
  const prevBtn = form.querySelector("[data-step-prev]");
  const nextBtn = form.querySelector("[data-step-next]");
  const submitBtn = form.querySelector("[data-step-submit]");
  let currentStep = 0;

  const requiredMessage = () => window.AntaresValidation?.MSG?.required || "Este campo es obligatorio.";
  const minLengthMessage = (n) => window.AntaresValidation?.MSG?.minLen?.(n) || `Escriba al menos ${n} caracteres.`;

  const setStep = (index) => {
    currentStep = Math.max(0, Math.min(index, panes.length - 1));
    panes.forEach((pane, idx) => pane.classList.toggle("active", idx === currentStep));
    chips.forEach((chip, idx) => chip.classList.toggle("active", idx === currentStep));
    if (actions) {
      actions.classList.toggle("is-first", currentStep === 0);
      actions.classList.toggle("is-last", currentStep === panes.length - 1);
    }
    form.setAttribute("data-step-current", String(currentStep));
  };
  form.__setB2BStep = setStep;

  const validateB2BField = (field, opts = {}) => {
    if (!field || field.type === "hidden" || field.disabled) return true;
    const showRequired =
      opts.showRequired || field.dataset.b2bTouched === "1" || field.classList.contains("field-invalid");
    const value = String(field.value || "").trim();
    const name = String(field.name || "").trim();

    if (field.classList.contains("js-b2b-phone-national")) {
      syncPhoneHiddenFull(form, "b2b");
    }

    if (field.required && !value) {
      if (showRequired) setFieldError(field, requiredMessage());
      else clearFieldError(field);
      return false;
    }

    if (!value) {
      clearFieldError(field);
      return true;
    }

    if (name === "name" || name === "company" || name === "position") {
      if (value.length < 2) {
        setFieldError(field, minLengthMessage(2));
        return false;
      }
    }

    if (name === "email" && !window.AntaresValidation?.isValidEmail?.(normalizeEmail(value))) {
      setFieldError(field, window.AntaresValidation?.MSG?.email || "Ingrese un correo electrónico válido.");
      return false;
    }

    if (name === "taxId") {
      const nitVal = validateColombianDocument("NIT", value);
      if (!nitVal.ok) {
        setFieldError(field, nitVal.message || window.AntaresValidation?.MSG?.nit || "El NIT no es válido.");
        return false;
      }
    }

    if (field.classList.contains("js-b2b-phone-national")) {
      const meta = getSelectedPhoneCountry(form, "b2b");
      const phoneDigitsAll = String(form.querySelector(".js-b2b-phone-full")?.value || "").replace(/\D/g, "");
      let phoneErrMsg = "";
      if (!phoneDigitsAll.startsWith(String(meta.dial || ""))) {
        phoneErrMsg = "El teléfono no coincide con el país seleccionado en el indicativo.";
      } else {
        const nationalLen = phoneDigitsAll.length - String(meta.dial || "").length;
        if (nationalLen < meta.minNat || nationalLen > meta.maxNat) {
          phoneErrMsg =
            meta.style === "co"
              ? "Ingrese un celular colombiano válido (10 dígitos nacionales; empieza por 3)."
              : `Ingrese entre ${meta.minNat} y ${meta.maxNat} dígitos del número local para ${meta.label}.`;
        } else if (meta.style === "co") {
          const nat = phoneDigitsAll.slice(String(meta.dial || "").length);
          if (!nat.startsWith("3")) {
            phoneErrMsg = window.AntaresValidation?.MSG?.coMobile || "El celular en Colombia debe empezar por 3.";
          }
        }
      }
      if (phoneErrMsg) {
        setFieldError(field, phoneErrMsg);
        return false;
      }
    }

    if (name === "message" && value.length < 30) {
      setFieldError(field, "Cuéntenos un poco más del requerimiento (mínimo 30 caracteres).");
      return false;
    }

    clearFieldError(field);
    return true;
  };

  const validateStep = (index) => {
    const pane = panes[index];
    if (!pane) return true;
    const V = window.AntaresValidation;
    const requiredFields = [...pane.querySelectorAll("input:not([type=hidden]), select, textarea")];
    let firstInvalid = null;
    requiredFields.forEach((field) => {
      field.dataset.b2bTouched = "1";
      if (!validateB2BField(field, { showRequired: true })) {
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (firstInvalid) {
      V.focusInvalidField?.(firstInvalid, { pulse: true });
      return false;
    }
    return true;
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => setStep(currentStep - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      syncPhoneHiddenFull(form, "b2b");
      if (!validateStep(currentStep)) return;
      setStep(currentStep + 1);
    });
  }
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      syncPhoneHiddenFull(form, "b2b");
      if (!validateStep(currentStep)) return;
    });
  }

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLTextAreaElement) return;
    if (currentStep >= panes.length - 1) return;
    event.preventDefault();
    syncPhoneHiddenFull(form, "b2b");
    if (!validateStep(currentStep)) return;
    setStep(currentStep + 1);
  });

  setStep(0);

  const ccB2b = form.querySelector(".js-b2b-phone-cc");
  if (ccB2b && ccB2b.options.length === 0) {
    ccB2b.innerHTML = registerPhoneCountryOptionsHtml();
  }
  const b2bPhoneNat = form.querySelector(".js-b2b-phone-national");
  const b2bPhoneCc = form.querySelector(".js-b2b-phone-cc");
  if (b2bPhoneNat) {
    b2bPhoneNat.addEventListener("input", () => {
      syncPhoneHiddenFull(form, "b2b");
      validateB2BField(b2bPhoneNat);
    });
  }
  if (b2bPhoneCc) {
    b2bPhoneCc.addEventListener("change", () => {
      clearFieldError(b2bPhoneNat);
      updatePhoneFieldForCountry(form, "b2b");
      syncPhoneHiddenFull(form, "b2b");
      validateB2BField(b2bPhoneNat, {
        showRequired: Boolean(b2bPhoneNat?.dataset.b2bTouched === "1" || b2bPhoneNat?.value)
      });
    });
  }
  updatePhoneFieldForCountry(form, "b2b");
  syncPhoneHiddenFull(form, "b2b");

  form.querySelectorAll("input,select,textarea").forEach((field) => {
    if (field.type === "hidden") return;
    if (!field.classList.contains("js-b2b-phone-national")) {
      field.addEventListener("input", () => validateB2BField(field));
    }
    field.addEventListener("blur", () => {
      field.dataset.b2bTouched = "1";
      validateB2BField(field, { showRequired: true });
    });
    field.addEventListener("change", () => {
      field.dataset.b2bTouched = "1";
      validateB2BField(field, { showRequired: true });
    });
  });
}

function readModuleAuditLogs() {
  const rows = read(KEYS.moduleAuditLogs, []);
  return Array.isArray(rows) ? rows : [];
}

function resolveHistoryAuditEntityLabelFromCatalog(moduleId, entityId) {
  const id = String(entityId || "").trim();
  if (!id) return "";
  const mod = resolvePortalAuditModuleId(moduleId);
  if (mod === "vehicles") {
    if (!isUuidString(id) && /^[A-Z0-9-]{4,10}$/i.test(id)) return id.toUpperCase();
    const fuel = readFuelLogs().find((l) => String(l.id) === id);
    if (fuel?.vehiclePlate) return String(fuel.vehiclePlate).toUpperCase();
    const tech = readVehicleTechnicalLogs().find((l) => String(l.id) === id);
    if (tech?.vehiclePlate) return String(tech.vehiclePlate).toUpperCase();
  }
  if (!isUuidString(id)) {
    if (mod === "payroll" && /^\d{4}/.test(id)) return `Periodo ${id}`;
    if (id === "bulk") return "Bandeja";
    if (id === "prefs") return "Preferencias";
    return "";
  }
  const findIn = (key, pick) => {
    const row = readArray(key).find((r) => String(r.id) === id);
    return row ? String(pick(row) || "").trim() : "";
  };
  switch (mod) {
    case "requests":
      return findIn(KEYS.requests, (r) => r.requestNumber);
    case "trips": {
      const req = reqRead().find((r) => String(r.id) === id || String(r.trip?.id) === id);
      return req ? String(req.trip?.tripNumber || req.requestNumber || "").trim() : "";
    }
    case "vehicles":
      return findIn(KEYS.vehicles, (v) => String(v.plate || "").toUpperCase());
    case "drivers":
      return findIn(KEYS.drivers, (d) => d.name);
    case "users":
      return findIn(KEYS.users, (u) => getPortalUserDisplayName(u) || u.email);
    case "payroll":
      return (
        findIn(KEYS.payrollEmployees, (e) => e.name) ||
        findIn(KEYS.payrollRuns, (r) => `${r.employeeName || ""} · ${r.month || ""}`) ||
        findIn(KEYS.hrAbsences, (a) => `${a.employeeName || ""} · ${a.startDate || ""}`)
      );
    case "hiring":
      return (
        findIn(KEYS.vacancies, (v) => v.title || v.positionName) ||
        findIn(KEYS.candidates, (c) => c.name) ||
        findIn(KEYS.positions, (p) => p.name) ||
        findIn(KEYS.interviews, (i) => i.candidateName) ||
        findIn(KEYS.contracts, (c) => c.candidateName || c.employeeName)
      );
    case "sst":
      return findIn(KEYS.sstCompliance, (r) => `${r.employeeName || ""} · ${r.recordType || ""}`);
    case "contact_b2b":
      return findIn(KEYS.contacts, (c) => c.contactName || c.companyName);
    case "authorizations":
      return findIn(KEYS.approvals, (a) => a.title || a.type);
    case "notifications":
      return findIn(KEYS.notifications, (n) => n.title);
    case "reports":
      return "";
    default:
      return "";
  }
}

function formatFuelLogAuditSummary(log) {
  const row = log && typeof log === "object" ? log : {};
  const parts = [];
  const plate = String(row.vehiclePlate || row.plate || "").trim().toUpperCase();
  const date = String(row.date || "").slice(0, 10);
  const liters = parseNum(row.liters);
  const total = parseNum(row.totalCost);
  const driver = String(row.driverName || "").trim();
  if (plate) parts.push(`Placa ${plate}`);
  if (date) parts.push(date);
  if (liters > 0) parts.push(`${liters.toLocaleString("es-CO")} L`);
  if (total > 0) parts.push(`$${total.toLocaleString("es-CO")}`);
  if (driver) parts.push(driver);
  const station = String(row.station || "").trim();
  if (station) parts.push(station);
  return parts.join(" · ") || "Registro de combustible";
}

function formatTechnicalLogAuditSummary(log) {
  const row = log && typeof log === "object" ? log : {};
  const parts = [];
  const plate = String(row.vehiclePlate || row.plate || "").trim().toUpperCase();
  const date = String(row.date || "").slice(0, 10);
  const typeKey = String(row.interventionType || row.type || "").toLowerCase();
  const typeLabel = HISTORY_FLEET_TECH_LABELS[typeKey] || typeKey;
  const desc = String(row.description || "").trim();
  if (plate) parts.push(`Placa ${plate}`);
  if (date) parts.push(date);
  if (typeLabel) parts.push(typeLabel);
  if (desc) parts.push(desc.length > 72 ? `${desc.slice(0, 72)}…` : desc);
  const cost = parseNum(row.cost);
  if (cost > 0) parts.push(`$${cost.toLocaleString("es-CO")}`);
  return parts.join(" · ") || "Registro de taller";
}

function formatHistoryAuditPresentation(entry) {
  const row = entry && typeof entry === "object" ? entry : {};
  const action = String(row.action || "update");
  const moduleId = String(row.moduleId || "").trim();
  const moduleLabel = normalizePortalAuditModuleLabel(row.moduleLabel || moduleId);
  const entityId = String(row.entityId || "").trim();

  let entityLabel = stripHistoryAuditOpaqueTokens(row.entityLabel);
  if (!entityLabel || isHistoryAuditOpaqueLabel(entityLabel)) {
    const fromCatalog = resolveHistoryAuditEntityLabelFromCatalog(moduleId, entityId);
    entityLabel = stripHistoryAuditOpaqueTokens(fromCatalog) || "Registro";
  }

  let summary = stripHistoryAuditOpaqueTokens(row.summary);
  if (!summary || isHistoryAuditOpaqueLabel(summary)) {
    summary = defaultHistoryAuditSummaryText(action, moduleLabel, entityLabel);
  }

  return {
    ...row,
    moduleId: resolvePortalAuditModuleId(moduleId) || moduleId || "dashboard",
    moduleLabel,
    entityLabel,
    summary
  };
}

function appendModuleAuditLog(entry) {
  const row = entry && typeof entry === "object" ? entry : {};
  const at = String(row.at || nowIso()).trim();
  if (!at) return;
  const rawModule = String(row.moduleId || row.moduleLabel || "").trim();
  const moduleId = resolvePortalAuditModuleId(rawModule) || rawModule || "dashboard";
  const moduleLabel = normalizePortalAuditModuleLabel(row.moduleLabel || moduleId);
  const snapshot = buildPortalAuditActorSnapshot();
  const actorEmail = String(row.actorEmail || snapshot.email || "").trim();
  const actorUserId = String(row.actorUserId || snapshot.userId || "").trim();
  const actor =
    historyAuditActorFromLogRow(
      {
        actor: row.actor,
        actorEmail: row.actorEmail,
        actorUserId: row.actorUserId
      },
      { fallbackToSession: true, sessionSnapshot: snapshot }
    ) ||
    snapshot.label ||
    actorEmail;
  const usuario =
    String(row.usuario || "").trim() ||
    historyAuditFormatStoredUsuario(actor, actorEmail, actorUserId);
  const list = readModuleAuditLogs();
  const stored = formatHistoryAuditPresentation({
    id: String(row.id || newUuidV4()),
    at,
    action: String(row.action || "update"),
    moduleId,
    moduleLabel,
    entityId: String(row.entityId || "").trim(),
    entityLabel: String(row.entityLabel || "Registro").trim(),
    summary: String(row.summary || "").trim(),
    actor,
    actorEmail,
    actorUserId,
    usuario,
    detailAction: String(row.detailAction || "").trim(),
    detailId: String(row.detailId || "").trim()
  });
  list.unshift(stored);
  write(KEYS.moduleAuditLogs, list.slice(0, 600));
  try {
    const apiConfigured =
      typeof globalThis.AntaresApi?.isConfigured === "function" && globalThis.AntaresApi.isConfigured();
    if (apiConfigured) {
      globalThis.AntaresPortalAuditSync?.enqueue?.(stored);
    }
  } catch (_auditSync) {
    /* noop */
  }
}

function payrollEmployeeAuditSummary(employee) {
  const position = String(employee?.position || "Sin cargo").trim();
  const doc = String(employee?.idDoc || "").trim();
  return doc ? `${position} · Doc. ${doc}` : position;
}

function appendPayrollEmployeeAuditLog(action, employee, extra = {}) {
  const emp = employee && typeof employee === "object" ? employee : {};
  const entityId = String(extra.entityId || emp.id || "").trim();
  const snapshot = buildPortalAuditActorSnapshot();
  const at = String(extra.at || emp.updatedAt || emp.createdAt || nowIso()).trim();
  const actor = historyAuditActorLabel(extra.actor, snapshot.label, snapshot.email, snapshot.name);
  appendModuleAuditLog({
    at,
    action: String(action || "update"),
    moduleId: "payroll",
    moduleLabel: "Gestión humana",
    entityId,
    entityLabel: String(extra.entityLabel || emp.name || "Colaborador").trim(),
    summary: String(extra.summary || payrollEmployeeAuditSummary(emp)).trim(),
    actor,
    actorEmail: String(extra.actorEmail || snapshot.email || "").trim(),
    actorUserId: String(extra.actorUserId || snapshot.userId || "").trim(),
    detailAction: String(extra.detailAction || ""),
    detailId: String(extra.detailId || entityId)
  });
  if (actor) recordEntityHistoryActor("Gestión humana", entityId, at, actor);
}

function appendPortalEntityAuditLog(action, moduleId, moduleLabel, entity, summary = "", extra = {}) {
  const row = entity && typeof entity === "object" ? entity : {};
  const entityId = String(extra.entityId || row.id || "").trim();
  const rawModule = String(moduleId || moduleLabel || "").trim();
  const canonModuleId = resolvePortalAuditModuleId(rawModule) || rawModule || "dashboard";
  const canonModuleLabel = normalizePortalAuditModuleLabel(moduleLabel || canonModuleId);
  const snapshot = buildPortalAuditActorSnapshot();
  const actor = historyAuditActorFromLogRow(
    {
      actor: historyAuditActorLabel(
        extra.actor,
        row.updatedByEmail,
        row.updatedBy,
        row.createdByEmail,
        row.createdBy
      ),
      actorEmail: extra.actorEmail || row.updatedByEmail || row.createdByEmail,
      actorUserId: extra.actorUserId
    },
    { fallbackToSession: true, sessionSnapshot: snapshot }
  );
  const at = String(extra.at || row.updatedAt || row.createdAt || nowIso()).trim();
  appendModuleAuditLog({
    at,
    action: String(action || "update"),
    moduleId: canonModuleId,
    moduleLabel: canonModuleLabel,
    entityId,
    entityLabel: String(extra.entityLabel || row.name || row.plate || row.title || "Registro").trim(),
    summary: String(summary || extra.summary || defaultHistoryAuditSummaryText(action, canonModuleLabel, extra.entityLabel || row.name || row.plate || row.title || "Registro")).trim(),
    actor,
    actorEmail: String(extra.actorEmail || row.updatedByEmail || row.createdByEmail || snapshot.email || "").trim(),
    actorUserId: String(extra.actorUserId || snapshot.userId || "").trim(),
    detailAction: String(extra.detailAction || ""),
    detailId: String(extra.detailId || entityId)
  });
  recordEntityHistoryActor(canonModuleLabel, entityId, at, actor);
}

function buildRouteRateEntry(value, companyIds, previousEntry = null, ts = nowIso()) {
  const prev = previousEntry && typeof previousEntry === "object" ? previousEntry : {};
  const ids = Array.isArray(companyIds) ? companyIds.map(String).filter(Boolean) : [];
  const existingId = String(prev.id || "").trim();
  return {
    value: parseNum(value),
    companyIds: ids,
    id: existingId || newUuidV4(),
    createdAt: prev.createdAt || ts,
    updatedAt: ts
  };
}

/** SOAT y tecnomecánica: al cambiar fecha de expedición, sugerir vencimiento un año después. */
function bindVehicleDocExpiryAutoFill(formEl) {
  if (!formEl || typeof formEl.querySelector !== "function") return;
  const soatExpEl = queryPortalDateField(formEl, "soatExpeditionDate");
  const soatVenEl = queryPortalDateField(formEl, "soatExpiryDate");
  if (soatExpEl && soatVenEl) {
    const syncSoat = () => {
      const iso = readFormDateIso(formEl, "soatExpeditionDate");
      const next = addCalendarYearsIsoDate(iso, 1);
      if (next) window.AntaresValidation?.portalDateInputSetIso?.(soatVenEl, next);
    };
    soatExpEl.addEventListener("change", syncSoat);
    soatExpEl.addEventListener("blur", syncSoat);
  }
  const techExpEl = queryPortalDateField(formEl, "techInspectionExpeditionDate");
  const techVenEl = queryPortalDateField(formEl, "techInspectionExpiryDate");
  if (techExpEl && techVenEl) {
    const syncTech = () => {
      const iso = readFormDateIso(formEl, "techInspectionExpeditionDate");
      const next = addCalendarYearsIsoDate(iso, 1);
      if (next) window.AntaresValidation?.portalDateInputSetIso?.(techVenEl, next);
    };
    techExpEl.addEventListener("change", syncTech);
    techExpEl.addEventListener("blur", syncTech);
  }
}

/** Texto legible para valores guardados desde `datetime-local` (YYYY-MM-DDTHH:mm). */
function formatInterviewWhenDisplay(whenRaw) {
  const s = String(whenRaw || "").trim();
  if (!s) return "—";
  let d;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) {
    d = new Date(`${s}:00`);
  } else {
    d = new Date(s);
  }
  if (!Number.isFinite(d.getTime())) return s;
  try {
    return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  } catch (_e) {
    return s;
  }
}


function isDataUrl(value) {
  return /^data:/i.test(String(value || "").trim());
}

function normalizeCompaniesForSync(companies) {
  const list = Array.isArray(companies) ? companies : [];
  if (!window.AntaresApi?.isConfigured?.()) return list;
  return list.map((company) => {
    const logoUrl = String(company?.logoUrl || "").trim();
    if (!isDataUrl(logoUrl)) return company;
    return { ...company, logoUrl: "" };
  });
}

/** Claves de payload que no deben normalizarse (contraseñas, hashes, credenciales satelital). */
function isPasswordPayloadKey(key) {
  const k = String(key || "").trim();
  if (!k) return false;
  if (
    k === "password" ||
    k === "passwordHash" ||
    k === "passwordConfirm" ||
    k === "confirmPassword" ||
    k === "newPassword" ||
    k === "oldPassword" ||
    k === "currentPassword" ||
    k === "satelliteProviderPassword" ||
    k === "hash_contrasena" ||
    k === "hashContrasena" ||
    k === "password_proveedor_satelite"
  ) {
    return true;
  }
  const lower = k.toLowerCase();
  return lower.includes("password") || lower.includes("contrasena");
}

/** Valida, aplica mayúsculas en campos de texto y devuelve false si el formulario no es válido. */
function prepareCreationFormForSubmit(formEl) {
  const V = window.AntaresValidation;
  if (!V || !formEl) return true;
  commitSearchableSelectInputsInForm(formEl);
  V.resyncPortalDateValuesInRoot?.(formEl);
  V.decorateFormFields?.(formEl);
  const domVal = V.validateDomForm(formEl);
  if (!domVal.ok) {
    V.showFormValidationAlert?.(formEl);
    const banner = formEl.querySelector("[data-antares-form-validation-alert]");
    if (banner && !banner.classList.contains("hidden")) {
      try {
        banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (_e) {
        /* noop */
      }
    }
    V.focusInvalidField?.(domVal.firstInvalid, { pulse: true });
    return false;
  }
  V.clearFormValidationAlert?.(formEl);
  V.applyDomFormPatch?.(formEl, domVal.patch);
  return true;
}

/** Lee FormData tras validación previa y normaliza texto para BD (todos los módulos). */
function readFormEntriesNormalized(formEl) {
  const fn = window.AntaresValidation?.readFormEntriesNormalized;
  if (typeof fn === "function") return fn(formEl);
  if (!formEl) return {};
  return normalizePayloadTextFields(Object.fromEntries(new FormData(formEl).entries()));
}

/** Chip en tarjetas (`.role-chip` fuerza mayúsculas); texto corto para no desalinear la cabecera. */
function companyKindChipShortLabel(kind) {
  const k = normalizeCompanyKindForDb(kind);
  if (k === "propia") return "Propia";
  if (k === "tercero") return "Tercero";
  return "Cliente";
}

function isCompanyRecordActive(c) {
  return c && c.active !== false;
}

function companyKindChipHtml(kind) {
  const k = normalizeCompanyKindForDb(kind);
  const colors = { cliente: "#0E7490", tercero: "#7C3AED", propia: "#377cc0" };
  return `<span class="role-chip company-kind-chip" style="--role-color:${colors[k] || "#64748B"}">${escapeHtml(companyKindChipShortLabel(k))}</span>`;
}

/**
 * Una sola fila con nombre canónico "antares" como cliente y sin otra empresa "propia":
 * se interpreta como operador (misma semántica que tipo_relacion propia en BD).
 */
function patchOperatorCompanyKindIfNeeded(companies) {
  if (!Array.isArray(companies) || companies.length === 0) return companies;
  const normName = (n) =>
    normalizeLatinForDb(String(n || ""))
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  const antaresRows = companies.filter((c) => normName(c.name) === "antares");
  if (antaresRows.length !== 1) return companies;
  const hasPropia = companies.some((c) => normalizeCompanyKindForDb(c.companyKind) === "propia");
  if (hasPropia) return companies;
  const targetId = String(antaresRows[0].id ?? "");
  return companies.map((c) => {
    if (String(c.id ?? "") !== targetId) return c;
    if (normalizeCompanyKindForDb(c.companyKind) !== "cliente") return c;
    return { ...c, companyKind: "propia" };
  });
}

function isPersonTypeJuridica(value) {
  return normalizePersonTypeForDb(value) === "Juridica";
}

function validatePasswordPolicy(password) {
  const p = String(password || "");
  if (p.length < 10) return { ok: false, key: "passwordPolicyLength" };
  if (!/[a-z]/.test(p)) return { ok: false, key: "passwordPolicyLower" };
  if (!/[A-Z]/.test(p)) return { ok: false, key: "passwordPolicyUpper" };
  if (!/[0-9]/.test(p)) return { ok: false, key: "passwordPolicyDigit" };
  if (!/[^A-Za-z0-9]/.test(p)) return { ok: false, key: "passwordPolicySpecial" };
  return { ok: true };
}

function getPasswordStrengthReport(password) {
  const p = String(password || "");
  const checks = [
    { rule: "len", ok: p.length >= 10 },
    { rule: "lower", ok: /[a-z]/.test(p) },
    { rule: "upper", ok: /[A-Z]/.test(p) },
    { rule: "digit", ok: /[0-9]/.test(p) },
    { rule: "special", ok: /[^A-Za-z0-9]/.test(p) }
  ];
  const met = checks.filter((c) => c.ok).length;
  const pct = Math.round((met / 5) * 100);
  let tier = "weak";
  if (pct >= 80) tier = "strong";
  else if (pct >= 60) tier = "good";
  else if (pct >= 40) tier = "fair";
  let headline = "Indique una contraseña segura";
  if (p.length > 0) {
    if (met === 5) headline = "Excelente: cumple todos los requisitos";
    else if (met === 4) headline = "Muy buena: falta un detalle";
    else if (met === 3) headline = "Media: refuerce los puntos pendientes";
    else if (met >= 1) headline = "Débil: complete más requisitos";
    else headline = "Muy débil: siga las indicaciones";
  }
  return { pct, tier, met, checks, headline };
}

/** Panel de fortaleza (barra, píldora %, checklist). El contenedor incluye .password-strength-bar-fill, .password-strength-pill, .password-strength-headline, .password-rule-grid li[data-rule]. */
function bindPasswordStrengthSuite(passInput, container) {
  if (!passInput || !container) return;
  const fill = container.querySelector(".password-strength-bar-fill");
  const pill = container.querySelector(".password-strength-pill");
  const headline = container.querySelector(".password-strength-headline");
  const bar = container.querySelector(".password-strength-bar");
  const rules = [...container.querySelectorAll(".password-rule-grid li[data-rule]")];
  const sync = () => {
    const r = getPasswordStrengthReport(passInput.value);
    const active = passInput.value.length > 0;
    const complete = r.met === 5;
    if (fill) {
      fill.style.width = `${r.pct}%`;
      fill.className = `password-strength-bar-fill password-strength-bar-fill--${r.tier}`;
    }
    if (bar) {
      bar.setAttribute("aria-valuenow", String(r.pct));
      bar.classList.toggle("password-strength-bar--active", active);
      bar.classList.toggle("password-strength-bar--complete", complete);
    }
    if (pill) {
      pill.textContent = `${r.pct}%`;
      pill.className = `password-strength-pill password-strength-pill--${r.tier}`;
    }
    if (headline) headline.textContent = r.headline;
    for (const li of rules) {
      const key = li.getAttribute("data-rule");
      const ok = r.checks.find((c) => c.rule === key)?.ok;
      li.classList.toggle("password-rule-met", Boolean(ok));
    }
  };
  passInput.addEventListener("input", sync);
  sync();
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


function addYears(dateValue, years) {
  const d = new Date(dateValue);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function daysUntil(dateValue) {
  const target = new Date(dateValue).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((target - now) / 86400000);
}

/** Monta DD/MM/AAAA y sincroniza valores ISO en un contenedor (vista, modal, filtros). */
function portalUpgradeDates(root) {
  const V = window.AntaresValidation;
  const scope = root || nodes.viewRoot || document;
  if (!V || !scope?.querySelectorAll) return;
  V.prepareFormsInRoot?.(scope);
}

/** Campo de fecha visible (DMY) o nativo dentro de un formulario o panel. */
function queryPortalDateField(root, fieldNameOrId) {
  return window.AntaresValidation?.findPortalDateVisibleInForm?.(root, fieldNameOrId) || null;
}

/** Lee fecha ISO desde un campo del formulario (DMY, hidden o nativo). */
function readFormDateIso(root, fieldNameOrId) {
  const el = queryPortalDateField(root, fieldNameOrId);
  if (!el) return "";
  const iso = window.AntaresValidation?.portalDateInputValueIso?.(el);
  return iso || normalizePortalDateYmd(el.value) || "";
}

/** Asigna fecha ISO a un campo por `name` o `id` (visible DMY + hidden). */
function setFormDateByName(form, fieldName, isoYmd) {
  const ymd = normalizePortalDateYmd(isoYmd);
  if (!form || !fieldName || !ymd) return;
  window.AntaresValidation?.setPortalFormDateByName?.(form, fieldName, ymd);
}

function setFormDateById(root, elementId, isoYmd) {
  const ymd = normalizePortalDateYmd(isoYmd);
  if (!root || !elementId || !ymd) return;
  window.AntaresValidation?.setPortalFormDateById?.(root, elementId, ymd);
}

function clearFormDateInput(el) {
  window.AntaresValidation?.clearPortalDateInput?.(el);
}

/** Suma un año calendario a `YYYY-MM-DD` (local), para vigencias de examen. */
function addOneYearToYmd(ymd) {
  const n = normalizePortalDateYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const y = Number(p[1]);
  const mo = Number(p[2]) - 1;
  const day = Number(p[3]);
  const d = new Date(y, mo, day);
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Centro de costos: clave portal `costCenter` ↔ columna BD `centro_costos`. */
function resolvePayrollEmployeeCostCenter(emp) {
  if (!emp || typeof emp !== "object") return "";
  const direct = String(emp.costCenter ?? "").trim();
  if (direct) return direct;
  return String(emp.centro_costos ?? emp.centroCostos ?? "").trim();
}

/**
 * Fechas de ficha de nómina en formato `YYYY-MM-DD` para formularios y caché local.
 * Acepta alias snake_case por si algún flujo devuelve columnas crudas de BD.
 */
function normalizePayrollEmployeeRowDates(emp) {
  if (!emp || typeof emp !== "object") return emp;
  const e = { ...emp };
  const first = (...vals) => {
    for (const v of vals) {
      if (v != null && String(v).trim() !== "") return v;
    }
    return "";
  };
  e.birthDate = normalizePortalDateYmd(first(e.birthDate, e.fecha_nacimiento));
  e.licenseExpiry = normalizePortalDateYmd(first(e.licenseExpiry, e.fecha_vencimiento_licencia));
  e.startDate = normalizePortalDateYmd(first(e.startDate, e.fecha_ingreso));
  e.contractVigenteStartDate = normalizePortalDateYmd(
    first(e.contractVigenteStartDate, e.fecha_inicio_contrato_vigente)
  );
  e.renewalDate = normalizePortalDateYmd(first(e.renewalDate, e.fecha_renovacion));
  e.nonRenewalNoticeDate = normalizePortalDateYmd(
    first(e.nonRenewalNoticeDate, e.fecha_aviso_no_renovacion)
  );
  e.occupationalExamDate = normalizePortalDateYmd(
    first(
      e.occupationalExamDate,
      e.psychoTestDate,
      e.fecha_examen_ocupacional,
      e.fecha_examen_psicosensometrico
    )
  );
  e.occupationalExamExpiry = normalizePortalDateYmd(
    first(
      e.occupationalExamExpiry,
      e.psychoTestExpiry,
      e.fecha_vencimiento_examen_ocupacional,
      e.fecha_vencimiento_psicosensometrico
    )
  );
  e.instruvialExamDate = normalizePortalDateYmd(
    first(
      e.instruvialExamDate,
      e.intravehicularExamDate,
      e.fecha_examen_instruvial,
      e.fecha_examen_intravehicular
    )
  );
  e.instruvialExamExpiry = normalizePortalDateYmd(
    first(
      e.instruvialExamExpiry,
      e.intravehicularExamExpiry,
      e.fecha_vencimiento_examen_instruvial,
      e.fecha_vencimiento_examen_intravehicular
    )
  );
  if (e.occupationalExamDate && !e.occupationalExamExpiry) {
    e.occupationalExamExpiry = addOneYearToYmd(e.occupationalExamDate);
  }
  if (e.instruvialExamDate && !e.instruvialExamExpiry) {
    e.instruvialExamExpiry = addOneYearToYmd(e.instruvialExamDate);
  }
  e.psychoTestDate = e.occupationalExamDate;
  e.psychoTestExpiry = e.occupationalExamExpiry;
  e.contractEndDate = normalizePortalDateYmd(first(e.contractEndDate, e.fecha_fin_contrato));
  Object.assign(e, ensureEmployeeContractFields(e));
  e.costCenter = resolvePayrollEmployeeCostCenter(e) || String(first(e.costCenter, e.centro_costos, e.centroCostos) || "").trim();
  if (!String(e.contractDuration || "").trim()) {
    e.contractDuration = String(
      first(e.contractDuration, e.contractDurationText, e.duracion_contrato_texto) || ""
    ).trim();
  }
  e.documentType =
    matchCatalogOptionValue(CO_CATALOGS.documentTypes, e.documentType) || String(e.documentType || "CC").trim();
  e.gender = matchCatalogOptionValue(CO_CATALOGS.genders, e.gender);
  e.maritalStatus = matchCatalogOptionValue(CO_CATALOGS.maritalStatus, e.maritalStatus);
  e.educationLevel = matchCatalogOptionValue(CO_CATALOGS.educationLevel, e.educationLevel);
  e.bloodType = matchCatalogOptionValue(CO_CATALOGS.bloodTypes, e.bloodType);
  e.contractType = matchCatalogOptionValue(CO_CATALOGS.contractTypes, e.contractType) || String(e.contractType || "").trim();
  e.payFrequency =
    matchCatalogOptionValue(CO_CATALOGS.payFrequency, e.payFrequency) || "Mensual";
  e.arlRiskLevel = matchCatalogOptionValue(CO_CATALOGS.arlRiskLevels, e.arlRiskLevel);
  e.workSchedule = matchCatalogOptionValue(CO_CATALOGS.workSchedule, e.workSchedule);
  e.contributorType = matchCatalogOptionValue(CO_CATALOGS.contributorTypes, e.contributorType);
  e.eps = matchCatalogOptionValue(CO_CATALOGS.eps, e.eps);
  e.pensionFund = matchCatalogOptionValue(CO_CATALOGS.pensionFunds, e.pensionFund);
  e.arl = matchCatalogOptionValue(CO_CATALOGS.arl, e.arl);
  e.severanceFund = matchCatalogOptionValue(CO_CATALOGS.severanceFunds, e.severanceFund);
  e.compensationFund = matchCatalogOptionValue(CO_CATALOGS.compensationFunds, e.compensationFund);
  e.bankName = matchCatalogOptionValue(CO_CATALOGS.banks, e.bankName);
  e.bankAccountType = matchCatalogOptionValue(CO_CATALOGS.accountTypes, e.bankAccountType || "Ahorros");
  e.licenseCategory = matchCatalogOptionValue(CO_CATALOGS.licenseCategories, e.licenseCategory);
  e.defensiveCourse = normalizeDefensiveCourseForPortal(e.defensiveCourse);
  return e;
}

/**
 * Estado de vigencia usando fecha de **vencimiento** si existe (`soatExpiryDate`),
 * si no extrapola desde expedición + 1 año (compatibilidad registros antiguos).
 */
function docExpiryStatus(expeditionDate, expiryDate) {
  const expYmd = expiryDate !== undefined ? normalizePortalDateYmd(expiryDate) : "";
  const exdYmd = normalizePortalDateYmd(expeditionDate);
  let expiresAt;
  if (expYmd) {
    expiresAt = new Date(`${expYmd}T12:00:00`);
  } else if (exdYmd) {
    expiresAt = addYears(new Date(`${exdYmd}T12:00:00`), 1);
  } else {
    return { label: "Sin fecha", cls: "status-rechazada", days: -9999, expiresAt: null };
  }
  if (Number.isNaN(expiresAt.getTime())) {
    return { label: "Sin fecha", cls: "status-rechazada", days: -9999, expiresAt: null };
  }
  const days = daysUntil(expiresAt);
  if (days < 0) return { label: `Vencido hace ${Math.abs(days)} dias`, cls: "status-rechazada", days, expiresAt };
  if (days <= 30) return { label: `Por vencer (${days} dias)`, cls: "status-pendiente", days, expiresAt };
  return { label: `Vigente (${days} dias)`, cls: "status-viaje_asignado", days, expiresAt };
}

function formatRoute(request) {
  const origin = `${request.originDepartment ? `${request.originDepartment}, ` : ""}${request.originCity || "-"}`;
  const destination = `${request.destinationDepartment ? `${request.destinationDepartment}, ` : ""}${request.destinationCity || "-"}`;
  return `${origin} → ${destination}`;
}

/** Hero del modal al aprobar desde tabla de solicitudes o desde Autorizaciones. */
function buildTripApprovalHeroHtml(request, needsTermoking, variant = "table") {
  const route = escapeHtml(formatRoute(request));
  const client = escapeHtml(String(request.clientName || "-"));
  const ref = escapeHtml(String(request.requestNumber || request.id || ""));
  const kgLine = requestTruckRequirementSummaryHtml(request);
  const pickup = fmtDate(request.pickupAt);
  const cargo = escapeHtml(String(request.cargoDescription || "—").trim().slice(0, 120));
  const srcBadge =
    variant === "auth"
      ? `<span class="approve-trip-source-badge">${IC.inbox}<span>Bandeja de autorizaciones</span></span>`
      : `<span class="approve-trip-source-badge approve-trip-source-badge--portal">${IC.compass}<span>Módulo solicitudes</span></span>`;
  const tkPill = needsTermoking
    ? `<span class="approve-trip-pill approve-trip-pill--tk">Termoking</span>`
    : `<span class="approve-trip-pill approve-trip-pill--dry">Sin Termoking</span>`;
  return `
    <div class="approve-trip-hero assign-revamp-hero" role="region" aria-label="Resumen de la solicitud">
      <div class="approve-trip-hero-top">
        ${srcBadge}
        ${tkPill}
      </div>
      <p class="approve-trip-hero-kicker">Confirmación rápida</p>
      <p class="approve-trip-hero-ref"><span class="approve-trip-ref-pill">${ref}</span></p>
      <div class="approve-trip-hero-route">${IC.mapPin}<span>${route}</span></div>
      <div class="approve-trip-hero-grid">
        <div class="approve-trip-hero-cell"><span class="approve-trip-meta-k">Cliente</span><span class="approve-trip-meta-v">${client}</span></div>
        <div class="approve-trip-hero-cell"><span class="approve-trip-meta-k">Camión / carga</span><span class="approve-trip-meta-v">${kgLine}</span></div>
        <div class="approve-trip-hero-cell"><span class="approve-trip-meta-k">Recogida</span><span class="approve-trip-meta-v">${pickup}</span></div>
      </div>
      <p class="approve-trip-hero-cargo"><strong>Carga:</strong> ${cargo}${String(request.cargoDescription || "").trim().length > 120 ? "…" : ""}</p>
    </div>`;
}

function toInputDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const p = getColombiaDateParts(d);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

function routeRateKeyFromRequest(request) {
  const origin = `${String(request?.originDepartment || "").trim()}|${String(request?.originCity || "").trim()}`.toLowerCase();
  const destination = `${String(request?.destinationDepartment || "").trim()}|${String(request?.destinationCity || "").trim()}`.toLowerCase();
  return `${origin}->${destination}`;
}

function buildTripRouteRateKey(originDepartment, originCity, destinationDepartment, destinationCity) {
  const origin = `${String(originDepartment || "").trim()}|${String(originCity || "").trim()}`.toLowerCase();
  const destination = `${String(destinationDepartment || "").trim()}|${String(destinationCity || "").trim()}`.toLowerCase();
  return `${origin}->${destination}`;
}

function tripRateStorageKey(routeKey, companyIds) {
  const ids = Array.isArray(companyIds) ? companyIds.map(String).filter(Boolean).sort() : [];
  const suffix = ids.length ? ids.join(",") : "*";
  return `${routeKey}${TRIP_RATE_SCOPE_SEP}${suffix}`;
}

/** Partes de ruta (depto/ciudad) a partir de la clave de almacenamiento del catálogo de tarifas. */
function parseTripRateStorageKeyToRouteParts(storageKey) {
  const raw = String(storageKey || "");
  const sepIdx = raw.lastIndexOf(TRIP_RATE_SCOPE_SEP);
  const routeOnly = sepIdx === -1 ? raw : raw.slice(0, sepIdx);
  const [orig, dest] = String(routeOnly).split("->");
  const [od, oc] = String(orig || "").split("|");
  const [dd, dc] = String(dest || "").split("|");
  return {
    originDepartment: od || "",
    originCity: oc || "",
    destinationDepartment: dd || "",
    destinationCity: dc || ""
  };
}

function buildRouteRateCompanyCheckboxesHtml(companies, selectedIds = []) {
  const selected = new Set((selectedIds || []).map((id) => String(id).trim()).filter(Boolean));
  const list = Array.isArray(companies) ? companies : [];
  if (!list.length) {
    return `<p class="muted route-rate-clients-empty">No hay empresas registradas. Cree clientes en administración para usar tarifas por empresa.</p>`;
  }
  return list
    .map((c) => {
      const id = String(c.id || "").trim();
      const name = String(c.name || "").trim() || "Sin nombre";
      const labelKey = `${name} ${String(c.taxId || "")}`.trim().toLowerCase();
      const checked = selected.has(id) ? " checked" : "";
      const tax = c.taxId ? `<span class="route-rate-company-tax muted">${escapeHtml(String(c.taxId))}</span>` : "";
      return `<div class="route-rate-company-item" data-company-label="${escapeAttr(labelKey)}" role="listitem">
        <input type="checkbox" name="rateClientCompanies" value="${escapeAttr(id)}" id="${escapeAttr(`route-rate-co-${id}`)}"${checked} />
        <label class="route-rate-company-item-text" for="${escapeAttr(`route-rate-co-${id}`)}"><span class="route-rate-company-name">${escapeHtml(name)}</span>${tax}</label>
      </div>`;
    })
    .join("");
}

/** Resumen de auditoría de tarifa por trayecto (solo fechas; sin IDs internos). */
function formatRouteRateAuditSummary(entry) {
  const createdLbl = fmtDateOr(entry?.createdAt, "—");
  const updatedLbl = fmtDateOr(entry?.updatedAt || entry?.createdAt, "—");
  return `Creada ${createdLbl} · actualizada ${updatedLbl}`;
}

function formatRouteRateAuditCellHtml(entry) {
  const createdLbl = fmtDateOr(entry?.createdAt, "—");
  const updatedLbl = fmtDateOr(entry?.updatedAt || entry?.createdAt, "—");
  if (createdLbl === "—" && updatedLbl === "—") {
    return '<span class="muted">Sin registro de fechas</span>';
  }
  return `<div class="route-rate-audit-cell">
    <span class="muted">Creada ${escapeHtml(createdLbl)}</span><br />
    <span class="muted">Actualizada ${escapeHtml(updatedLbl)}</span>
  </div>`;
}

/** Paso 4 del formulario de tarifa: alcance general vs empresas (checkboxes + búsqueda). */
function buildRouteRateScopeStepInnerHtml(companies, opts = {}) {
  const o = opts && typeof opts === "object" ? opts : {};
  const selectedIds = (Array.isArray(o.selectedCompanyIds) ? o.selectedCompanyIds : [])
    .map((id) => String(id).trim())
    .filter(Boolean);
  const scope = o.scopeValue === "specific" || selectedIds.length ? "specific" : "all";
  const companyList = Array.isArray(companies) ? companies : [];
  const checkboxes = buildRouteRateCompanyCheckboxesHtml(companyList, selectedIds);
  const totalCompanies = companyList.length;
  return `
    <input type="hidden" name="rateScope" value="${escapeAttr(scope)}" data-route-rate-scope-field />
    <div class="route-rate-scope-cards" role="radiogroup" aria-label="Alcance de la tarifa">
      <button type="button" class="route-rate-scope-card${scope === "all" ? " is-selected" : ""}" data-route-rate-scope-pick="all" aria-pressed="${scope === "all" ? "true" : "false"}">
        <span class="route-rate-scope-card-icon route-rate-scope-card-icon--all" aria-hidden="true">${IC.grid}</span>
        <span class="route-rate-scope-card-body">
          <strong class="route-rate-scope-card-title">General</strong>
          <span class="route-rate-scope-card-desc">La misma tarifa para todos los clientes en esta ruta</span>
        </span>
      </button>
      <button type="button" class="route-rate-scope-card${scope === "specific" ? " is-selected" : ""}" data-route-rate-scope-pick="specific" aria-pressed="${scope === "specific" ? "true" : "false"}">
        <span class="route-rate-scope-card-icon route-rate-scope-card-icon--specific" aria-hidden="true">${IC.briefcase}</span>
        <span class="route-rate-scope-card-body">
          <strong class="route-rate-scope-card-title">Por empresa</strong>
          <span class="route-rate-scope-card-desc">Solo para clientes con precio negociado</span>
        </span>
      </button>
    </div>
    <div class="route-rate-clients-block${scope === "specific" ? " is-active" : " is-disabled"}" data-route-rate-clients-panel>
      <div class="route-rate-clients-block-head">
        <div class="route-rate-company-count-wrap">
          <span class="route-rate-company-count-label">Empresas seleccionadas</span>
          <strong class="route-rate-company-count-value" data-route-rate-company-count>${scope === "specific" ? String(selectedIds.length) : "Todas"}</strong>
        </div>
        <div class="toolbar route-rate-clients-toolbar">
          <button type="button" class="btn btn-sm btn-outline" data-route-rate-select-visible>${IC.check} Visibles</button>
          <button type="button" class="btn btn-sm btn-outline" data-route-rate-select-all>${IC.check} Todas (${totalCompanies})</button>
          <button type="button" class="btn btn-sm btn-outline" data-route-rate-clear-all>${IC.x} Ninguna</button>
        </div>
      </div>
      <div class="route-rate-clients-search-row">
        <input type="search" data-route-rate-clients-search placeholder="Buscar por nombre o NIT…" autocomplete="off" ${scope === "specific" ? "" : "disabled"} />
        <span class="route-rate-clients-filter-meta muted" data-route-rate-clients-filter-meta>${totalCompanies} empresa${totalCompanies === 1 ? "" : "s"}</span>
      </div>
      <div class="route-rate-clients-list" data-route-rate-clients-list role="list" aria-label="Empresas cliente">
        ${checkboxes}
      </div>
    </div>
    <p class="muted route-rate-scope-help" data-route-rate-scope-help></p>`;
}

function wireRouteRateScopeSection(formEl) {
  if (!formEl) return;
  const scopeMount = formEl.querySelector("[data-route-rate-scope-mount]") || formEl;
  const scopeField = scopeMount.querySelector("[data-route-rate-scope-field]");
  const scopePickBtns = scopeMount.querySelectorAll("[data-route-rate-scope-pick]");
  if (!scopeField || !scopePickBtns.length) return;

  const clientsPanel = scopeMount.querySelector("[data-route-rate-clients-panel]");
  const clientsList = scopeMount.querySelector("[data-route-rate-clients-list]");
  const searchInput = scopeMount.querySelector("[data-route-rate-clients-search]");
  const countEl = scopeMount.querySelector("[data-route-rate-company-count]");
  const filterMeta = scopeMount.querySelector("[data-route-rate-clients-filter-meta]");
  const scopeHelp = scopeMount.querySelector("[data-route-rate-scope-help]");
  const selectAllBtn = scopeMount.querySelector("[data-route-rate-select-all]");
  const selectVisibleBtn = scopeMount.querySelector("[data-route-rate-select-visible]");
  const clearAllBtn = scopeMount.querySelector("[data-route-rate-clear-all]");
  const scopeCards = scopeMount.querySelectorAll(".route-rate-scope-card");
  const totalCompanies = clientsList
    ? clientsList.querySelectorAll('input[name="rateClientCompanies"]').length
    : 0;

  const getScope = () => {
    const v = String(scopeField?.value || "all").trim();
    return v === "specific" ? "specific" : "all";
  };

  const setScope = (value) => {
    const v = value === "specific" ? "specific" : "all";
    scopeField.value = v;
    scopePickBtns.forEach((btn) => {
      const on = String(btn.getAttribute("data-route-rate-scope-pick") || "") === v;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };

  const countSelected = () => {
    if (!clientsList) return 0;
    return clientsList.querySelectorAll('input[name="rateClientCompanies"]:checked').length;
  };

  const visibleCompanyItems = () => {
    if (!clientsList) return [];
    return [...clientsList.querySelectorAll(".route-rate-company-item")].filter((item) => !item.hidden);
  };

  const clearCompanySelection = () => {
    if (!clientsList) return;
    clientsList.querySelectorAll('input[name="rateClientCompanies"]').forEach((cb) => {
      cb.checked = false;
    });
  };

  const syncUi = () => {
    const specific = getScope() === "specific";
    if (clientsPanel) {
      clientsPanel.classList.toggle("is-disabled", !specific);
      clientsPanel.classList.toggle("is-active", specific);
    }
    if (selectAllBtn) selectAllBtn.disabled = !specific;
    if (selectVisibleBtn) selectVisibleBtn.disabled = !specific;
    if (clearAllBtn) clearAllBtn.disabled = !specific;
    if (searchInput) searchInput.disabled = !specific;
    if (clientsList) {
      clientsList.querySelectorAll('input[name="rateClientCompanies"]').forEach((cb) => {
        cb.disabled = !specific;
      });
    }
    if (scopeHelp) {
      scopeHelp.textContent = specific
        ? totalCompanies > 80
          ? `Marque las empresas aplicables (hay ${totalCompanies} registradas). Use la búsqueda para filtrar por nombre o NIT.`
          : "Marque una o más empresas. Esta tarifa solo se sugerirá cuando la solicitud sea de esos clientes."
        : "Modo general: la tarifa aplica a todos los clientes en esta ruta.";
    }
    if (countEl) countEl.textContent = specific ? String(countSelected()) : "Todas";
    scopeCards.forEach((card) => {
      const pick = String(card.getAttribute("data-route-rate-scope-pick") || "");
      card.classList.toggle("is-selected", pick === getScope());
    });
  };

  const filterCompanies = () => {
    const needle = String(searchInput?.value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (!clientsList) return;
    let visible = 0;
    clientsList.querySelectorAll(".route-rate-company-item").forEach((item) => {
      const label = String(item.getAttribute("data-company-label") || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const show = !needle || label.includes(needle);
      item.hidden = !show;
      if (show) visible += 1;
    });
    if (filterMeta) {
      filterMeta.textContent = needle
        ? `${visible} de ${totalCompanies} coinciden con la búsqueda`
        : `${totalCompanies} empresa${totalCompanies === 1 ? "" : "s"}`;
    }
    if (selectVisibleBtn) {
      selectVisibleBtn.innerHTML = `${IC.check} Visibles (${visible})`;
    }
  };

  if (scopeMount.dataset.routeRateScopeWired === "1") {
    syncUi();
    filterCompanies();
    return;
  }
  scopeMount.dataset.routeRateScopeWired = "1";

  scopePickBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = String(btn.getAttribute("data-route-rate-scope-pick") || "all");
      setScope(next);
      if (next !== "specific") clearCompanySelection();
      syncUi();
      if (next === "specific") searchInput?.focus();
    });
  });
  if (clientsList) {
    clientsList.addEventListener("change", syncUi);
    clientsList.addEventListener("click", (ev) => {
      if (getScope() !== "specific") return;
      const row = ev.target.closest(".route-rate-company-item");
      if (!row || ev.target.matches('input[type="checkbox"]') || ev.target.closest("label")) return;
      const cb = row.querySelector('input[name="rateClientCompanies"]');
      if (cb && !cb.disabled) {
        cb.checked = !cb.checked;
        syncUi();
      }
    });
  }
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      if (getScope() !== "specific" || !clientsList) return;
      clientsList.querySelectorAll('input[name="rateClientCompanies"]').forEach((cb) => {
        cb.checked = true;
      });
      syncUi();
    });
  }
  if (selectVisibleBtn) {
    selectVisibleBtn.addEventListener("click", () => {
      if (getScope() !== "specific" || !clientsList) return;
      visibleCompanyItems().forEach((item) => {
        const cb = item.querySelector('input[name="rateClientCompanies"]');
        if (cb) cb.checked = true;
      });
      syncUi();
    });
  }
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      clearCompanySelection();
      syncUi();
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterCompanies();
      syncUi();
    });
  }
  syncUi();
  filterCompanies();
}

function openRouteRateInlineEdit(storageKey) {
  const key = String(storageKey || "").trim();
  if (!key) return;
  state.transportTripsUi = {
    ...(state.transportTripsUi || {}),
    workspace: "operate",
    section: "routes"
  };
  persistHrWorkspace("transport-trips", "operate");
  state.createPanels = __pr.buildTransportTripsCreatePanelsState("routes", state.createPanels || {}, { expandActive: true });
  state.pendingRouteRateEditKey = key;
  renderPortalView();
  requestAnimationFrame(() => scrollToCreatePanelForm("create-route-rate"));
}

function populateRouteRateInlineForm(storageKey) {
  const form = document.getElementById("form-route-rate");
  if (!form) return false;
  const key = String(storageKey || "").trim();
  const entry = getTripRouteRatesNormalized()[key];
  if (!entry) return false;
  const parts = parseTripRateStorageKeyToRouteParts(key);
  const companyIds = (Array.isArray(entry.companyIds) ? entry.companyIds : [])
    .map((id) => String(id).trim())
    .filter(Boolean);
  const scope = companyIds.length ? "specific" : "all";
  const companies = read(KEYS.companies, []);

  const editingKeyInput = form.querySelector("#route-rate-editing-key");
  const submitBtn = form.querySelector("#route-rate-submit-btn");
  const editingHint = form.querySelector("#route-rate-editing-hint");
  const tripRateInput = form.querySelector("input[name='tripRateCop']");
  const scopeMount = form.querySelector("[data-route-rate-scope-mount]");

  if (editingKeyInput) editingKeyInput.value = key;
  if (submitBtn) submitBtn.textContent = `${IC.save} Guardar cambios de tarifa`;
  if (editingHint) {
    editingHint.hidden = false;
    editingHint.textContent = `${formatRouteRateAuditSummary(entry)}. Al guardar se sobrescribirá el valor anterior.`;
  }
  if (tripRateInput) {
    const val = parseNum(entry.value);
    tripRateInput.value =
      tripRateInput.dataset.moneyInput === "1" || tripRateInput.getAttribute("data-money-input") === "1"
        ? formatMoneyFieldValue(val)
        : String(val);
  }

  if (scopeMount) {
    scopeMount.innerHTML = buildRouteRateScopeStepInnerHtml(companies, {
      scopeValue: scope,
      selectedCompanyIds: companyIds
    });
    delete form.dataset.routeRateScopeWired;
    const scopeMountNode = form.querySelector("[data-route-rate-scope-mount]");
    if (scopeMountNode) delete scopeMountNode.dataset.routeRateScopeWired;
    wireRouteRateScopeSection(form);
  }

  const originDept = form.querySelector("#route-rate-origin-dept");
  const originCity = form.querySelector("#route-rate-origin-city");
  const destDept = form.querySelector("#route-rate-dest-dept");
  const destCity = form.querySelector("#route-rate-dest-city");
  if (originDept && originCity) {
    setSelectValueInsensitive(originDept, parts.originDepartment);
    originDept.dispatchEvent(new Event("change"));
    setSelectValueInsensitive(originCity, parts.originCity);
  }
  if (destDept && destCity) {
    setSelectValueInsensitive(destDept, parts.destinationDepartment);
    destDept.dispatchEvent(new Event("change"));
    setSelectValueInsensitive(destCity, parts.destinationCity);
  }
  return true;
}

/** Alinea el valor de un `<select>` con opciones aunque difiera mayúsculas/espacios. */
function setSelectValueInsensitive(selectEl, rawValue) {
  if (!selectEl) return;
  const target = String(rawValue || "").trim().toLowerCase();
  if (!target) {
    selectEl.value = "";
    return;
  }
  const options = [...selectEl.options];
  const hit = options.find((opt) => String(opt.value || "").trim().toLowerCase() === target);
  selectEl.value = hit ? hit.value : "";
}

function getTripRouteRatesNormalized() {
  const raw = read(KEYS.tripRouteRates, {});
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  let needWrite = false;
  for (const [k, val] of Object.entries(raw)) {
    if (typeof val === "number" && Number.isFinite(val)) {
      if (!k.includes(TRIP_RATE_SCOPE_SEP)) {
        out[`${k}${TRIP_RATE_SCOPE_SEP}*`] = { value: val, companyIds: [] };
        needWrite = true;
      } else {
        out[k] = { value: val, companyIds: [] };
      }
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      const v = parseNum(val.value ?? 0);
      if (v <= 0) continue;
      const ids = Array.isArray(val.companyIds) ? val.companyIds.map(String).filter(Boolean) : [];
      const meta = {
        id: String(val.id || "").trim() || undefined,
        createdAt: val.createdAt ? String(val.createdAt) : null,
        updatedAt: val.updatedAt ? String(val.updatedAt) : null
      };
      if (!k.includes(TRIP_RATE_SCOPE_SEP)) {
        const suffix = ids.length ? ids.slice().sort().join(",") : "*";
        out[`${k}${TRIP_RATE_SCOPE_SEP}${suffix}`] = { value: v, companyIds: ids, ...meta };
        needWrite = true;
      } else {
        out[k] = { value: v, companyIds: ids, ...meta };
      }
    }
  }
  if (needWrite) write(KEYS.tripRouteRates, out);
  return out;
}

function getConfiguredTripValue(request) {
  const rates = getTripRouteRatesNormalized();
  const rk = routeRateKeyFromRequest(request);
  const cid = String(request?.clientCompanyId || "").trim();
  let bestSpecific = 0;
  let bestGlobal = 0;
  for (const [fullKey, entry] of Object.entries(rates)) {
    const sepIdx = fullKey.lastIndexOf(TRIP_RATE_SCOPE_SEP);
    const routePart = sepIdx === -1 ? fullKey : fullKey.slice(0, sepIdx);
    if (routePart !== rk) continue;
    const v = parseNum(entry.value);
    if (v <= 0) continue;
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    if (!ids.length) {
      if (v > bestGlobal) bestGlobal = v;
    } else if (cid && ids.includes(cid)) {
      if (v > bestSpecific) bestSpecific = v;
    }
  }
  return bestSpecific > 0 ? bestSpecific : bestGlobal;
}

/** Opciones de tarifa guardadas que coinciden con la ruta de la solicitud (misma clave origen→destino). */
function listTripRateOptionsForRequest(request) {
  const rates = getTripRouteRatesNormalized();
  const rk = routeRateKeyFromRequest(request);
  const cid = String(request?.clientCompanyId || "").trim();
  const items = [];
  for (const [storageKey, entry] of Object.entries(rates)) {
    const sepIdx = storageKey.lastIndexOf(TRIP_RATE_SCOPE_SEP);
    const routePart = sepIdx === -1 ? storageKey : storageKey.slice(0, sepIdx);
    if (routePart !== rk) continue;
    const v = parseNum(entry.value);
    if (v <= 0) continue;
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    const scopeLabel = ids.length
      ? ids.map((id) => getCompanyById(id)?.name || id).join(", ")
      : "Todos los clientes";
    const appliesToRequest = !ids.length || (cid && ids.includes(cid));
    items.push({ storageKey, value: v, scopeLabel, appliesToRequest });
  }
  items.sort((a, b) => {
    if (a.appliesToRequest !== b.appliesToRequest) return a.appliesToRequest ? -1 : 1;
    if (b.value !== a.value) return b.value - a.value;
    return String(a.storageKey).localeCompare(String(b.storageKey));
  });
  return items;
}

function humanTripRateRouteLabelFromStorageKey(storageKey) {
  const toSmartTitle = (value) => {
    const raw = String(value || "").trim().replace(/\s+/g, " ");
    if (!raw) return "";
    return raw
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };
  const sepIdx = String(storageKey).lastIndexOf(TRIP_RATE_SCOPE_SEP);
  const routeOnly = sepIdx === -1 ? String(storageKey) : String(storageKey).slice(0, sepIdx);
  const parts = String(routeOnly).split("->");
  if (parts.length < 2) return routeOnly || String(storageKey);
  const fmt = (chunk) => {
    const [dep, city] = String(chunk || "").split("|");
    const d = toSmartTitle(dep);
    const c = toSmartTitle(city);
    if (!d && !c) return "—";
    return c ? `${d}, ${c}` : d || "—";
  };
  return `${fmt(parts[0])} → ${fmt(parts[1])}`;
}

/** Opciones por ruta; si no hay coincidencia, lista todo el catálogo para poder elegir tarifa manualmente. */
function listTripRateOptionsWithFallback(request) {
  const direct = listTripRateOptionsForRequest(request);
  if (direct.length) return direct;
  const rates = getTripRouteRatesNormalized();
  const cid = String(request?.clientCompanyId || "").trim();
  const items = [];
  for (const [storageKey, entry] of Object.entries(rates)) {
    const v = parseNum(entry.value);
    if (v <= 0) continue;
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    const scopeLabel = ids.length
      ? ids.map((id) => getCompanyById(id)?.name || id).join(", ")
      : "Todos los clientes";
    const appliesToRequest = !ids.length || (cid && ids.includes(cid));
    const routeHuman = humanTripRateRouteLabelFromStorageKey(storageKey);
    items.push({
      storageKey,
      value: v,
      scopeLabel: `${routeHuman} · ${scopeLabel}`,
      appliesToRequest
    });
  }
  items.sort((a, b) => {
    if (a.appliesToRequest !== b.appliesToRequest) return a.appliesToRequest ? -1 : 1;
    if (b.value !== a.value) return b.value - a.value;
    return String(a.storageKey).localeCompare(String(b.storageKey));
  });
  return items;
}

function defaultTripRateStorageKeyForRequest(request) {
  const items = listTripRateOptionsWithFallback(request);
  const pref = items.find((i) => i.appliesToRequest);
  return pref ? pref.storageKey : items.length ? items[0].storageKey : "";
}

function initialTripValueForAssignment(request, preferredStorageKey) {
  const rates = getTripRouteRatesNormalized();
  if (preferredStorageKey && rates[preferredStorageKey]) {
    const v = parseNum(rates[preferredStorageKey].value);
    if (v > 0) return v;
  }
  const cfg = getConfiguredTripValue(request);
  if (cfg > 0) return cfg;
  return parseNum(request.tripValue || 0);
}

function wireTripValueMoneyInput(formEl) {
  const num = formEl?.querySelector?.("input[name='tripValue'][data-trip-money-input]");
  if (!num || num.dataset.tripMoneyWired === "1") return;
  num.dataset.tripMoneyWired = "1";
  const formatLive = () => {
    const n = parseMoneyFieldValue(num.value);
    const end = num.selectionEnd;
    num.value = formatMoneyFieldValue(n);
    if (typeof end === "number") {
      const len = num.value.length;
      num.setSelectionRange(len, len);
    }
  };
  num.addEventListener("input", () => {
    formatLive();
    updateCreateTripStepper(formEl);
  });
  num.addEventListener("blur", () => {
    num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
    updateCreateTripStepper(formEl);
  });
  if (num.value) num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
}

/** Campos COP con prefijo $ (formularios de historial flota, etc.). */
function wireMoneyInputs(formEl) {
  if (!formEl) return;
  formEl.querySelectorAll("input[data-money-input='1']").forEach((num) => {
    if (num.dataset.moneyWired === "1") return;
    num.dataset.moneyWired = "1";
    const formatLive = () => {
      num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
      const end = num.selectionEnd;
      if (typeof end === "number") {
        const len = num.value.length;
        num.setSelectionRange(len, len);
      }
    };
    num.addEventListener("input", formatLive);
    num.addEventListener("blur", () => {
      num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
    });
    if (num.value) num.value = formatMoneyFieldValue(parseMoneyFieldValue(num.value));
  });
}

/** Enlaza el selector de tarifa con el campo numérico de precio en el modal de asignación. */
function wireTripRateChoiceSelect(formEl) {
  const sel = formEl.querySelector("select[name='tripRateChoice']");
  const num = formEl.querySelector("input[name='tripValue']");
  const meta = formEl.querySelector("[data-trip-rate-meta]");
  wireTripValueMoneyInput(formEl);
  if (!num) return;
  const setTripValueAmount = (amount) => {
    const n = Math.max(0, parseNum(amount));
    if (num.dataset.tripMoneyInput === "1") num.value = formatMoneyFieldValue(n);
    else num.value = String(n);
    updateCreateTripStepper(formEl);
  };
  if (!sel) return;
  const renderMeta = (storageKey = "") => {
    if (!meta) return;
    if (!storageKey) {
      meta.innerHTML = `<span class="trip-rate-meta-chip trip-rate-meta-chip--muted">Manual</span>`;
      return;
    }
    const rates = getTripRouteRatesNormalized();
    const entry = rates[storageKey];
    if (!entry) {
      meta.innerHTML = `<span class="muted">Tarifa no disponible en catálogo.</span>`;
      return;
    }
    const ids = Array.isArray(entry.companyIds) ? entry.companyIds.map(String).filter(Boolean) : [];
    const clientsLabel = ids.length
      ? ids.map((id) => getCompanyById(id)?.name || id).join(", ")
      : "Todos los clientes";
    meta.innerHTML = `<span class="trip-rate-meta-chip">${escapeHtml(humanTripRateRouteLabelFromStorageKey(storageKey))}</span>
      <span class="trip-rate-meta-chip">${escapeHtml(clientsLabel)}</span>
      <span class="trip-rate-meta-chip trip-rate-meta-chip--value">$${parseNum(entry.value).toLocaleString("es-CO")}</span>`;
  };
  const onRateChange = () => {
    const key = String(sel.value || "").trim();
    if (!key) {
      renderMeta("");
      setTripValueAmount(0);
      return;
    }
    const rates = getTripRouteRatesNormalized();
    const entry = rates[key];
    if (entry && parseNum(entry.value) > 0) setTripValueAmount(entry.value);
    renderMeta(key);
  };
  sel.addEventListener("change", onRateChange);
  if (num.dataset.tripMoneyInput !== "1") {
    num.addEventListener("input", () => updateCreateTripStepper(formEl));
  }
  onRateChange();
}

function createTripSummaryTile(iconKey, label, valueHtml) {
  const inner = IC[String(iconKey || "file")]?.replace(/<svg[^>]*>|<\/svg>/g, "") || "";
  return `<div class="create-trip-summary-tile">
    <span class="create-trip-summary-tile-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></span>
    <div class="create-trip-summary-tile-body">
      <span class="create-trip-sk">${escapeHtml(label)}</span>
      <span class="create-trip-sv">${valueHtml}</span>
    </div>
  </div>`;
}

function createTripEmptyHint(iconKey, title, detail = "") {
  const inner = IC[String(iconKey || "inbox")]?.replace(/<svg[^>]*>|<\/svg>/g, "") || "";
  const detailHtml = detail ? `<p class="create-trip-empty-detail">${escapeHtml(detail)}</p>` : "";
  return `<div class="create-trip-empty-hint assign-trip-empty" role="status">
    <span class="create-trip-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></span>
    <div class="create-trip-empty-copy"><p class="create-trip-empty-title">${escapeHtml(title)}</p>${detailHtml}</div>
  </div>`;
}

/** Tarjeta visual para elegir solicitud al asignar viaje. */
function buildTripRequestPickerCardHtml(request, opts = {}) {
  if (!request) return "";
  const selected = !!opts.selected;
  const pending = request.status === STATUS.PENDIENTE;
  const statusLabel = pending ? "Pendiente" : "Aprobada";
  const statusClass = pending ? "trip-request-card__status--pending" : "trip-request-card__status--approved";
  const route = formatRoute(request);
  const pickup = fmtDate(request.pickupAt) || "Sin fecha";
  const truck = String(request.vehicleType || request.requiredTruckType || "—").trim() || "—";
  const searchHay = [
    request.requestNumber,
    request.id,
    request.clientName,
    request.originCity,
    request.originDepartment,
    request.destinationCity,
    request.destinationDepartment,
    route,
    statusLabel,
    truck
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return `<button type="button" class="trip-request-card${selected ? " is-selected" : ""}" data-trip-request-pick="${escapeAttr(String(request.id || ""))}" data-trip-request-search="${escapeAttr(searchHay)}" role="option"${selected ? ' aria-selected="true"' : ""}>
    <span class="trip-request-card__head">
      <strong class="trip-request-card__ref">${escapeHtml(String(request.requestNumber || request.id || "—"))}</strong>
      <span class="trip-request-card__status ${statusClass}">${escapeHtml(statusLabel)}</span>
    </span>
    <span class="trip-request-card__client">${escapeHtml(String(request.clientName || "Cliente"))}</span>
    <span class="trip-request-card__route">${escapeHtml(route)}</span>
    <span class="trip-request-card__meta">${escapeHtml(pickup)} · ${escapeHtml(truck)}</span>
  </button>`;
}

/** Sincroniza buscador y tarjetas del selector visual de solicitudes. */
function wireCreateTripRequestPicker(formEl) {
  const picker = formEl?.querySelector("[data-trip-request-picker]");
  const select = formEl?.querySelector("select[name='requestId']");
  if (!picker || !select) return;

  const search = picker.querySelector("[data-trip-request-search]");
  const list = picker.querySelector("[data-trip-request-list]");
  const emptyEl = picker.querySelector("[data-trip-request-empty]");

  const syncSelection = () => {
    const current = String(select.value || "").trim();
    list?.querySelectorAll("[data-trip-request-pick]").forEach((btn) => {
      const on = String(btn.getAttribute("data-trip-request-pick") || "") === current;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
  };

  const syncFilter = () => {
    const needle = String(search?.value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    let visible = 0;
    list?.querySelectorAll("[data-trip-request-pick]").forEach((btn) => {
      const hay = String(btn.getAttribute("data-trip-request-search") || "");
      const show = !needle || hay.includes(needle);
      btn.classList.toggle("hidden", !show);
      if (show) visible += 1;
    });
    if (emptyEl) {
      const noHits = needle && visible === 0;
      emptyEl.classList.toggle("hidden", !noHits);
      if (noHits) emptyEl.textContent = "Ninguna solicitud coincide con la búsqueda.";
    }
  };

  const wireCards = () => {
    list?.querySelectorAll("[data-trip-request-pick]").forEach((btn) => {
      if (btn.dataset.tripRequestPickWired === "1") return;
      btn.dataset.tripRequestPickWired = "1";
      btn.addEventListener("click", () => {
        const id = String(btn.getAttribute("data-trip-request-pick") || "").trim();
        if (!id) return;
        select.value = id;
        syncSelection();
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  };

  if (picker.dataset.tripRequestPickerWired !== "1") {
    picker.dataset.tripRequestPickerWired = "1";
    search?.addEventListener("input", syncFilter);
    select.addEventListener("change", syncSelection);
    wireCards();
  } else {
    wireCards();
  }
  syncSelection();
  syncFilter();
}

/** Avanza el wizard de transporte cuando el paso actual ya está completo. */
function tryAutoAdvanceTransportWizard(formEl, wizardKind) {
  const wizard = formEl?.querySelector(`[data-hr-wizard="${wizardKind}"]`);
  if (!wizard) return;
  const activeStep = wizard.querySelector(".hr-form-step.is-active");
  const nextBtn = wizard.querySelector("[data-hr-wizard-next]");
  if (!activeStep || !nextBtn || nextBtn.disabled || nextBtn.classList.contains("hidden")) return;
  const stepRes = hrWizardStepValid(activeStep);
  if (stepRes?.ok) nextBtn.click();
}

/** Resumen compacto de la solicitud (formulario asignar viaje). */
function renderAssignTripRequestPreview(request) {
  const needsTermoking = requestRequiresTermoking(request);
  const assignableByDate = isRequestPickupSameDayOrFuture(request);
  const tkBadge = needsTermoking
    ? `<span class="create-trip-status-pill create-trip-status-pill--info" title="Refrigeración Termoking">TK</span>`
    : `<span class="create-trip-status-pill create-trip-status-pill--neutral" title="Carga seca">Seco</span>`;
  const dateBadge = assignableByDate
    ? `<span class="create-trip-status-pill create-trip-status-pill--ok" title="Fecha de recogida asignable">OK</span>`
    : `<span class="create-trip-status-pill create-trip-status-pill--bad" title="Fecha de recogida vencida">Vencida</span>`;
  const cargo = String(request.cargoDescription || "—").trim();
  const cargoShort = cargo.length > 88 ? `${escapeHtml(cargo.slice(0, 88))}…` : escapeHtml(cargo);
  return `<div class="assign-trip-preview-active create-trip-summary-panel--active">
      <div class="assign-trip-preview-head">
        <p class="assign-trip-preview-route">${IC.mapPin}<span>${escapeHtml(formatRoute(request))}</span></p>
        <div class="assign-trip-preview-badges">${tkBadge}${dateBadge}</div>
      </div>
      <dl class="assign-trip-preview-facts">
        <div><dt>Cliente</dt><dd>${escapeHtml(String(request.clientName || "—"))}</dd></div>
        <div><dt>Solicita</dt><dd>${escapeHtml(String(request.requestedByName || "—"))}</dd></div>
        <div><dt>Camión</dt><dd>${requestTruckRequirementSummaryHtml(request)}</dd></div>
        <div><dt>Recogida</dt><dd>${escapeHtml(fmtDate(request.pickupAt))}</dd></div>
        <div class="assign-trip-preview-facts--wide"><dt>Carga</dt><dd>${cargoShort}</dd></div>
      </dl>
    </div>`;
}

/** Actualiza checklist y botón guardar del formulario asignar viaje. */
function updateCreateTripStepper(formEl) {
  if (!formEl) return;
  const requestId = String(formEl.querySelector("select[name='requestId']")?.value || "").trim();
  const request = requestId ? reqRead().find((r) => r.id === requestId) : null;
  const assignable = !!(request && isRequestPickupSameDayOrFuture(request));
  const vehicleId = String(formEl.querySelector("select[name='vehicleId']")?.value || "").trim();
  const driverId = String(formEl.querySelector("select[name='driverId']")?.value || "").trim();
  const tripValue = parseMoneyFieldValue(formEl.querySelector("input[name='tripValue']")?.value || 0);
  const ready = !!requestId && assignable && !!vehicleId && !!driverId && tripValue > 0;

  const checklist = formEl.querySelector("[data-create-trip-readiness]");
  if (checklist) {
    const items = [
      { done: !!requestId, label: "Solicitud", short: "Solicitud" },
      { done: assignable, label: "Fecha válida", short: "Fecha" },
      { done: !!vehicleId, label: "Vehículo", short: "Vehículo" },
      { done: !!driverId, label: "Conductor", short: "Conductor" },
      { done: tripValue > 0, label: "Precio", short: "Precio" }
    ];
    checklist.innerHTML = items
      .map(
        (it) =>
          `<li class="create-trip-readiness-item assign-trip-check${it.done ? " is-done" : ""}" title="${escapeAttr(it.label)}"><span class="create-trip-readiness-mark" aria-hidden="true">${it.done ? IC.check : ""}</span><span class="assign-trip-check-label">${escapeHtml(it.short)}</span></li>`
      )
      .join("");
  }

  const submitBtn = formEl.querySelector(".create-trip-submit-btn");
  if (submitBtn) {
    submitBtn.classList.toggle("create-trip-submit-btn--ready", ready);
    submitBtn.disabled = !ready;
    submitBtn.setAttribute("aria-disabled", ready ? "false" : "true");
  }

  const stepRequestDone = !!requestId && assignable;
  const stepFleetDone = !!vehicleId && !!driverId;
  const stepRateDone = tripValue > 0;
  const milestones = [
    { key: "request", done: stepRequestDone },
    { key: "fleet", done: stepFleetDone },
    { key: "rate", done: stepRateDone }
  ];
  const doneSteps = milestones.filter((m) => m.done).length;
  const progressFill = formEl.querySelector("[data-create-trip-progress]");
  if (progressFill) {
    progressFill.style.width = `${Math.round((doneSteps / milestones.length) * 100)}%`;
  }
  milestones.forEach(({ key, done }, idx) => {
    const el = formEl.querySelector(`[data-create-trip-milestone="${key}"]`);
    if (!el) return;
    el.classList.toggle("is-done", done);
    const prevDone = idx === 0 || milestones[idx - 1].done;
    el.classList.toggle("is-active", !done && prevDone);
    if (done) el.classList.remove("is-active");
  });
}

/** Select con búsqueda por texto (listas largas de flota / conductores). */
function getSearchableSelectParts(selectEl) {
  const wrap = selectEl?.closest?.(".searchable-select");
  if (!wrap) return null;
  return {
    wrap,
    input: wrap.querySelector(".searchable-select-input"),
    list: wrap.querySelector(".searchable-select-dropdown"),
    select: selectEl
  };
}

function syncSearchableSelectInputFromValue(selectEl) {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.input) return;
  const opt = selectEl.options[selectEl.selectedIndex];
  parts.input.value = opt && String(opt.value || "").trim() ? String(opt.textContent || "").trim() : "";
}

/** Antes de validar/enviar: si el usuario escribió en el buscador pero no eligió opción, intenta emparejar. */
function commitSearchableSelectInputsInForm(rootEl) {
  const root = rootEl && rootEl.querySelectorAll ? rootEl : document;
  const norm = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  root.querySelectorAll("select.searchable-select-native[data-searchable-mounted='1']").forEach((sel) => {
    if (String(sel.value || "").trim()) return;
    const parts = getSearchableSelectParts(sel);
    const typed = String(parts?.input?.value || "").trim();
    if (!typed) return;
    const needle = norm(typed);
    const opts = [...sel.options].filter((o) => String(o.value || "").trim() && !o.disabled);
    const exact = opts.find((o) => norm(o.textContent) === needle);
    const partial = exact || opts.find((o) => norm(o.textContent).includes(needle));
    if (!partial) return;
    sel.value = String(partial.value);
    syncSearchableSelectInputFromValue(sel);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function renderSearchableSelectDropdown(selectEl, filterText = "") {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.list) return [];
  const needle = String(filterText || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const rows = [...selectEl.options]
    .map((opt) => {
      const text = String(opt.textContent || "").trim();
      const value = String(opt.value || "");
      if (!text && !value) return null;
      const hay = `${text} ${value}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (needle && !hay.includes(needle)) return null;
      return { text, value, disabled: opt.disabled };
    })
    .filter(Boolean);
  if (!rows.length) {
    parts.list.innerHTML = `<li class="searchable-select-empty" role="presentation">Sin coincidencias</li>`;
    parts.list.classList.remove("hidden");
    return rows;
  }
  parts.list.innerHTML = rows
    .map(
      (row) =>
        `<li role="option" data-value="${escapeAttr(row.value)}" class="searchable-select-option${row.disabled ? " is-disabled" : ""}"${row.disabled ? ' aria-disabled="true"' : ""} tabindex="-1">${escapeHtml(row.text)}</li>`
    )
    .join("");
  parts.list.classList.remove("hidden");
  return rows;
}

function positionSearchableSelectDropdown(selectEl) {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.list || !parts.input) return;
  parts.list.classList.remove("searchable-select-dropdown--fixed");
  parts.list.style.left = "";
  parts.list.style.top = "";
  parts.list.style.width = "";
  parts.list.style.maxHeight = "";
}

function openSearchableSelectDropdown(selectEl, filterText = "") {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.input || parts.input.disabled) return;
  renderSearchableSelectDropdown(selectEl, filterText ?? parts.input.value);
  parts.wrap.classList.add("searchable-select--open");
  parts.input.setAttribute("aria-expanded", "true");
  positionSearchableSelectDropdown(selectEl);
}

function closeSearchableSelectDropdown(selectEl) {
  const parts = getSearchableSelectParts(selectEl);
  if (!parts?.list) return;
  parts.list.classList.add("hidden");
  parts.list.classList.remove("searchable-select-dropdown--fixed");
  parts.list.style.left = "";
  parts.list.style.top = "";
  parts.list.style.width = "";
  parts.wrap?.classList.remove("searchable-select--open");
  parts.input?.setAttribute("aria-expanded", "false");
}

function refreshSearchableSelect(selectEl) {
  if (!selectEl || selectEl.dataset.searchableMounted !== "1") return;
  syncSearchableSelectInputFromValue(selectEl);
  const parts = getSearchableSelectParts(selectEl);
  if (parts?.list) parts.list.classList.add("hidden");
}

function mountSearchableSelect(selectEl, opts = {}) {
  if (!selectEl || selectEl.tagName !== "SELECT") return;
  const force = !!(opts && opts.force);
  if (selectEl.dataset.searchableMounted === "1") {
    refreshSearchableSelect(selectEl);
    return;
  }
  if (!force && selectEl.options.length < SEARCHABLE_SELECT_MIN_OPTIONS) return;

  const placeholder =
    String(selectEl.getAttribute("data-searchable-placeholder") || "").trim() || "Escriba para buscar…";
  const wrap = document.createElement("div");
  wrap.className = "searchable-select";
  selectEl.parentNode.insertBefore(wrap, selectEl);
  wrap.appendChild(selectEl);

  const input = document.createElement("input");
  input.type = "search";
  input.className = "searchable-select-input";
  input.setAttribute("autocomplete", "off");
  input.setAttribute("spellcheck", "false");
  input.setAttribute("aria-autocomplete", "list");
  input.placeholder = placeholder;
  wrap.insertBefore(input, selectEl);

  const list = document.createElement("ul");
  list.className = "searchable-select-dropdown hidden";
  list.setAttribute("role", "listbox");
  wrap.appendChild(list);

  selectEl.classList.add("searchable-select-native");
  selectEl.dataset.searchableMounted = "1";

  const pickValue = (value) => {
    const v = String(value ?? "");
    const match = [...selectEl.options].find((o) => String(o.value) === v && !o.disabled);
    if (!match) return;
    selectEl.value = v;
    syncSearchableSelectInputFromValue(selectEl);
    list.classList.add("hidden");
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
  };
  input.addEventListener("focus", () => {
    openSearchableSelectDropdown(selectEl, input.value);
  });
  input.addEventListener("input", () => {
    openSearchableSelectDropdown(selectEl, input.value);
  });
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      list.classList.add("hidden");
      syncSearchableSelectInputFromValue(selectEl);
      return;
    }
    if (ev.key === "Enter") {
      ev.preventDefault();
      const first = list.querySelector(".searchable-select-option:not(.is-disabled)");
      if (first) pickValue(first.getAttribute("data-value"));
    }
  });
  list.addEventListener("mousedown", (ev) => {
    const li = ev.target.closest(".searchable-select-option:not(.is-disabled)");
    if (!li) return;
    ev.preventDefault();
    pickValue(li.getAttribute("data-value"));
  });
  input.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (!wrap.contains(document.activeElement)) {
        list.classList.add("hidden");
        syncSearchableSelectInputFromValue(selectEl);
      }
    }, 120);
  });
  selectEl.addEventListener("change", () => syncSearchableSelectInputFromValue(selectEl));

  refreshSearchableSelect(selectEl);
}

/** Lista compacta visible cuando hay pocas opciones (crear viaje). */
function syncCreateTripCompactPickList(selectEl) {
  const parts = getSearchableSelectParts(selectEl);
  const mount = parts?.wrap?.querySelector(".create-trip-pick-list-mount");
  if (!mount || !selectEl.closest("#form-create-trip")) return;
  const rows = [...selectEl.options]
    .map((opt) => ({
      text: String(opt.textContent || "").trim(),
      value: String(opt.value || ""),
      disabled: opt.disabled
    }))
    .filter((row) => row.text || row.value);
  const selectable = rows.filter((row) => row.value && !row.disabled);
  if (selectable.length < 1 || selectable.length > 6) {
    mount.classList.add("hidden");
    mount.setAttribute("aria-hidden", "true");
    mount.innerHTML = "";
    return;
  }
  mount.classList.remove("hidden");
  mount.setAttribute("aria-hidden", "false");
  const current = String(selectEl.value || "");
  mount.innerHTML = `<div class="create-trip-pick-list" role="listbox">${selectable
    .map((row) => {
      const selected = row.value === current ? " is-selected" : "";
      return `<button type="button" class="create-trip-pick-option${selected}" data-value="${escapeAttr(row.value)}" role="option"${selected ? ' aria-selected="true"' : ""}>${escapeHtml(row.text)}</button>`;
    })
    .join("")}</div>`;
  mount.querySelectorAll(".create-trip-pick-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.getAttribute("data-value");
      const match = [...selectEl.options].find((o) => String(o.value) === String(v) && !o.disabled);
      if (!match) return;
      selectEl.value = String(v);
      syncSearchableSelectInputFromValue(selectEl);
      closeSearchableSelectDropdown(selectEl);
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      syncCreateTripCompactPickList(selectEl);
    });
  });
}

function updateCreateTripResourceFieldHints(formEl, request, vehicleCandidates, driverCandidates, vehicles, drivers) {
  if (!formEl) return;
  const needsTermoking = requestRequiresTermoking(request);
  const setHint = (name, html) => {
    const sel = formEl.querySelector(`select[name='${name}']`);
    const field = sel?.closest(".assign-trip-fleet-field, .create-trip-fleet-field");
    if (!field) return;
    let box = field.querySelector(".create-trip-resource-empty");
    if (!html) {
      box?.remove();
      const parts = getSearchableSelectParts(sel);
      const hint = parts?.wrap?.querySelector(".searchable-select-hint");
      if (hint) {
        hint.classList.remove("searchable-select-hint--warn");
        if (!formEl.closest("#form-create-trip")) {
          hint.textContent = "Clic en ▼ o escriba para ver y filtrar opciones.";
        }
      }
      return;
    }
    if (!box) {
      box = document.createElement("p");
      box.className = "create-trip-resource-empty";
      field.appendChild(box);
    }
    box.innerHTML = html;
    const parts = getSearchableSelectParts(sel);
    const hint = parts?.wrap?.querySelector(".searchable-select-hint");
    if (hint) {
      hint.classList.add("searchable-select-hint--warn");
      hint.textContent = "Revise el mensaje debajo.";
    }
  };
  if (!vehicles.length) {
    const blocked = vehicleCandidates.filter((v) => v.wrongTruckType).length;
    const termokingBlock = vehicleCandidates.filter(
      (v) =>
        !v.wrongTruckType &&
        ((needsTermoking && !vehicleHasTermokingEquipment(v)) ||
          (!needsTermoking && vehicleHasTermokingEquipment(v)))
    ).length;
    let msg = needsTermoking ? "Sin vehículos Termoking disponibles." : "Sin vehículos secos disponibles.";
    if (blocked) msg += ` ${blocked} no coinciden con el tipo pedido.`;
    if (termokingBlock) msg += ` ${termokingBlock} no cumplen Termoking.`;
    if (!vehicleCandidates.length) msg = "Sin vehículos en flota.";
    setHint("vehicleId", escapeHtml(msg));
  } else {
    setHint("vehicleId", "");
  }
  if (!drivers.length) {
    let msg = driverCandidates.length
      ? "Ningún conductor disponible (ocupado, no disponible o doc. vencida)."
      : "Sin conductores en flota.";
    setHint("driverId", escapeHtml(msg));
  } else {
    setHint("driverId", "");
  }
}

/** Vehículo y conductor en crear viaje, aprobar solicitud y autorizaciones. */
function enhanceTripAssignmentSelects(rootEl) {
  const root = rootEl && rootEl.querySelector ? rootEl : document;
  root.querySelectorAll("select[name='vehicleId'], select[name='driverId']").forEach((sel) => {
    mountSearchableSelect(sel, { force: true });
  });
}

/** Selector buscable de colaborador en liquidación individual y terminación contractual. */
function enhancePayrollLiquidationSelects(rootEl) {
  const root = rootEl && rootEl.querySelector ? rootEl : document;
  root.querySelectorAll("select[name='employeeId']").forEach((sel) => {
    if (!sel.closest("#form-payroll, #form-payroll-settlement")) return;
    mountSearchableSelect(sel, { force: true });
  });
}

function setTripAssignmentFieldsDisabled(formEl, disabled) {
  if (!formEl) return;
  [
    "select[name='vehicleId']",
    "select[name='driverId']",
    "select[name='tripRateChoice']",
    "input[name='tripValue']"
  ].forEach((selector) => {
    const el = formEl.querySelector(selector);
    if (!el) return;
    const searchable = getSearchableSelectParts(el);
    if (searchable?.input) {
      if (disabled) {
        searchable.input.setAttribute("disabled", "disabled");
        searchable.input.setAttribute("aria-disabled", "true");
      } else {
        searchable.input.removeAttribute("disabled");
        searchable.input.removeAttribute("aria-disabled");
      }
    }
    if (disabled) {
      el.setAttribute("disabled", "disabled");
    } else {
      el.removeAttribute("disabled");
    }
  });
}

function wireTripApprovalModeFields(formEl) {
  if (!formEl) return;
  const modeSel = formEl.querySelector("select[name='mode']");
  if (!modeSel) return;
  const apply = () => {
    const assignNow = String(modeSel.value || "") === "assign_now";
    setTripAssignmentFieldsDisabled(formEl, !assignNow);
  };
  modeSel.addEventListener("change", apply);
  apply();
}

function slugStatus(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(" ", "_");
}

/** Campos de precio con selector de tarifa por trayecto (si hay) + valor editable. */
function buildTripRateModalFields(request, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const required = !!o.required;
  const items = listTripRateOptionsWithFallback(request);
  const defaultKey = defaultTripRateStorageKeyForRequest(request);
  const initial = initialTripValueForAssignment(request, defaultKey);
  const fallbackVal = initial > 0 ? initial : parseNum(request?.tripValue || 0);

  const selectOptions = items.length
    ? [
        { value: "", label: "Manual / sin aplicar tarifa del catalogo" },
        ...items.map((i) => ({
          value: i.storageKey,
          label: `Trayecto: ${humanTripRateRouteLabelFromStorageKey(i.storageKey)} · $${parseNum(i.value).toLocaleString("es-CO")} · ${i.scopeLabel}${i.appliesToRequest ? "" : " (otra ruta o alcance)"}`
        }))
      ]
    : [
        {
          value: "",
          label: "Sin tarifas guardadas — definalas en Viajes · Tarifas o indique solo el precio manual"
        }
      ];

  return {
    fields: [
      {
        name: "tripRateChoice",
        label: items.length ? "Tarifa por trayecto (catálogo)" : "Tarifa por trayecto",
        type: "select",
        required: false,
        value: defaultKey || "",
        options: selectOptions,
        antares: { skipValidate: true }
      },
      {
        type: "custom",
        full: true,
        html: `<div class="trip-rate-meta" data-trip-rate-meta><span class="muted">Seleccione una tarifa para ver trayecto, alcance y valor sugerido.</span></div>`
      },
      {
        name: "tripValue",
        label: "Precio del viaje (COP) · editable",
        type: "number",
        required,
        value: fallbackVal
      }
    ],
    afterMount: (formEl) => wireTripRateChoiceSelect(formEl)
  };
}

/** Mismos campos de tarifa que el modal, para formulario inline (crear viaje desde módulo). */
function buildTripRateInlineFieldsHtml(request, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const required = !!o.required;
  const items = listTripRateOptionsForRequest(request);
  let defaultKey = "";
  let fallbackVal = 0;
  if (items.length) {
    const pref = items.find((i) => i.appliesToRequest) || items[0];
    defaultKey = pref.storageKey;
    fallbackVal = parseNum(pref.value);
  }

  const optRows = [
    { value: "", label: "Manual (sin catálogo)" },
    ...items.map((i) => ({
      value: i.storageKey,
      label: `${humanTripRateRouteLabelFromStorageKey(i.storageKey)} · $${parseNum(i.value).toLocaleString("es-CO")}`
    }))
  ];

  const optionsHtml = optRows
    .map((row) => {
      const v = escapeAttr(String(row.value ?? ""));
      const sel = String(row.value) === String(defaultKey || "") ? " selected" : "";
      return `<option value="${v}"${sel}>${escapeHtml(row.label)}</option>`;
    })
    .join("");

  return `<div class="create-trip-rate-inner assign-trip-rate-inner assign-trip-rate-card">
    <label class="full create-trip-rate-catalog assign-trip-field">${fieldLabel(IC.layers, "Tarifa catálogo")}
      <select name="tripRateChoice" id="create-trip-rate-choice" class="trip-rate-choice-select" data-antares-skip-validate="1">${optionsHtml}</select>
    </label>
    <div class="trip-rate-meta assign-trip-rate-meta" data-trip-rate-meta aria-live="polite"></div>
    <label class="full create-trip-price-field create-trip-price-field--hero assign-trip-field">${fieldLabel(IC.dollar, "Precio (COP)", { required: true })}
      <div class="create-trip-price-wrap">
        <span class="create-trip-price-prefix" aria-hidden="true">$</span>
        <input type="text" name="tripValue" id="create-trip-trip-value" inputmode="numeric" autocomplete="off" data-trip-money-input="1" placeholder="Ej. 4.200.000" ${required ? "required" : ""} value="${escapeAttr(formatMoneyFieldValue(fallbackVal))}" />
      </div>
    </label>
  </div>`;
}

/** Sincroniza resumen, listas de flota y tarifas al elegir solicitud (formulario crear viaje). */
function refreshCreateTripModuleForm(formEl) {
  if (!formEl) return;
  const selReq = formEl.querySelector("select[name='requestId']");
  const requestId = String(selReq?.value || "").trim();
  const preview = formEl.querySelector("#trip-request-preview");
  const vehSel = formEl.querySelector("select[name='vehicleId']");
  const drvSel = formEl.querySelector("select[name='driverId']");
  const rateMount = formEl.querySelector("#create-trip-rate-fields");
  const prevVehicleId = String(vehSel?.value || "").trim();
  const prevDriverId = String(drvSel?.value || "").trim();
  const prevRateChoice = String(formEl.querySelector("select[name='tripRateChoice']")?.value || "").trim();
  const prevTripValue = String(formEl.querySelector("input[name='tripValue']")?.value || "").trim();
  const restoreSelectValue = (selectEl, value) => {
    if (!selectEl || !value) return;
    const hasOption = [...selectEl.options].some((opt) => String(opt.value) === value && !opt.disabled);
    if (hasOption) selectEl.value = value;
  };
  const request = requestId ? reqRead().find((r) => r.id === requestId) : null;

  const fleetStats = formEl.querySelector("#create-trip-fleet-stats");
  const requestGrid = formEl.querySelector(".create-trip-form-v2__request-grid");
  const previewWrap = formEl.querySelector(".create-trip-form-v2__preview-wrap");
  const assignRow = formEl.querySelector(".create-trip-form-v2__assign-row");
  if (requestGrid) {
    requestGrid.classList.toggle("has-request-selected", Boolean(request));
  }
  if (previewWrap) {
    previewWrap.setAttribute("aria-hidden", request ? "false" : "true");
  }
  if (assignRow) {
    assignRow.classList.toggle("is-locked", !request);
  }

  const tripFormUser = currentUser();
  if (request && !canAssignTripFromViajesModule(request, tripFormUser)) {
    if (preview) {
      preview.innerHTML = createTripEmptyHint(
        "lock",
        "Solicitud no disponible para asignar",
        request.status === STATUS.PENDIENTE
          ? "Apruebe la solicitud en Centro de autorizaciones; luego podrá asignar el viaje aquí."
          : "Esta solicitud no está en un estado válido para asignación de viaje."
      );
      preview.classList.add("create-trip-summary-panel--active", "assign-trip-preview--filled");
    }
    if (fleetStats) fleetStats.innerHTML = "";
    if (vehSel) {
      vehSel.innerHTML = `<option value="">No asignable en este módulo</option>`;
      vehSel.disabled = true;
    }
    if (drvSel) {
      drvSel.innerHTML = `<option value="">No asignable en este módulo</option>`;
      drvSel.disabled = true;
    }
    if (rateMount) {
      rateMount.innerHTML = createTripEmptyHint("lock", "Apruebe la solicitud primero");
    }
    updateCreateTripStepper(formEl);
    return;
  }

  if (!request) {
    if (preview) {
      preview.innerHTML = createTripEmptyHint(
        "inbox",
        "Seleccione una solicitud",
        "Al elegir una tarjeta verá el resumen de ruta, cliente y recogida."
      );
      preview.classList.remove("create-trip-summary-panel--active", "assign-trip-preview--filled");
    }
    if (fleetStats) fleetStats.innerHTML = "";
    if (vehSel) {
      vehSel.innerHTML = `<option value="">— Elija solicitud primero —</option>`;
      vehSel.disabled = true;
    }
    if (drvSel) {
      drvSel.innerHTML = `<option value="">— Elija solicitud primero —</option>`;
      drvSel.disabled = true;
    }
    if (rateMount) {
      rateMount.innerHTML = createTripEmptyHint("dollar", "Tarifa pendiente");
    }
    updateCreateTripStepper(formEl);
    return;
  }

  const needsTermoking = requestRequiresTermoking(request);
  const assignableByDate = isRequestPickupSameDayOrFuture(request);
  void refreshTransportScheduleBusyFromApi(request, requestId);
  const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
  const driverCandidates = getDriverCandidatesForRequest(request, requestId);
  const vehicles = vehicleCandidates.filter(
    (v) => !v.isBusy && !v.isUnavailable && !v.hasExpiredDocs && !v.wrongTruckType
  );
  const drivers = driverCandidates.filter((d) => !d.isBusy && !d.isUnavailable && !d.hasExpiredDocs);

  if (preview) {
    preview.classList.add("create-trip-summary-panel--active", "assign-trip-preview--filled");
    preview.innerHTML = renderAssignTripRequestPreview(request);
  }

  if (fleetStats && assignableByDate) {
    fleetStats.innerHTML = `
      <span class="create-trip-fleet-stat create-trip-fleet-stat--ok" title="Vehículos listos para asignar"><strong>${vehicles.length}</strong> veh.</span>
      <span class="create-trip-fleet-stat create-trip-fleet-stat--ok" title="Conductores listos para asignar"><strong>${drivers.length}</strong> cond.</span>
      <span class="create-trip-fleet-stat create-trip-fleet-stat--muted" title="Total en lista con banderas">${vehicleCandidates.length} / ${driverCandidates.length} en lista</span>`;
  } else if (fleetStats) {
    fleetStats.innerHTML = "";
  }

  if (!assignableByDate) {
    if (vehSel) {
      vehSel.innerHTML = `<option value="">Solicitud vencida: no se puede asignar viaje en fecha anterior</option>`;
      vehSel.disabled = true;
    }
    if (drvSel) {
      drvSel.innerHTML = `<option value="">Solicitud vencida: no se puede asignar viaje en fecha anterior</option>`;
      drvSel.disabled = true;
    }
    if (rateMount) {
      rateMount.innerHTML = `<div class="create-trip-rate-guard assign-trip-rate-guard" role="alert"><span class="create-trip-rate-guard-pill">${IC.lock} Fecha vencida</span><p class="assign-trip-rate-guard-note">Solo se asignan viajes con recogida hoy o en fechas futuras.</p></div>`;
    }
    updateCreateTripStepper(formEl);
    return;
  }

  if (vehSel) {
    vehSel.disabled = false;
    if (!vehicleCandidates.length) {
      vehSel.innerHTML = `<option value="">${
        needsTermoking
          ? "No hay vehículos con Termoking para esta solicitud"
          : "No hay vehículos secos (sin Termoking) para esta capacidad y ruta"
      }</option>`;
    } else {
      vehSel.innerHTML =
        `<option value="">${vehicles.length ? "Seleccione vehículo…" : "Sin vehículo asignable ahora (revise banderas)"}</option>` +
        vehicleCandidates
          .map((v) => {
            const lab = tripAssignmentVehicleOptionLabel(v, {
              needsTermoking,
              isBusy: v.isBusy,
              isUnavailable: v.isUnavailable,
              hasExpiredDocs: v.hasExpiredDocs,
              wrongTruckType: v.wrongTruckType,
              requestTruckType: normalizeRequestRequiredTruckType(request?.vehicleType)
            });
            const disabled = v.isBusy || v.isUnavailable || v.hasExpiredDocs || v.wrongTruckType ? " disabled" : "";
            return `<option value="${escapeAttr(v.id)}"${disabled}>${escapeHtml(lab)}</option>`;
          })
          .join("");
    }
    restoreSelectValue(vehSel, prevVehicleId);
  }

  if (drvSel) {
    drvSel.disabled = false;
    if (!driverCandidates.length) {
      drvSel.innerHTML = `<option value="">No hay conductores registrados</option>`;
    } else {
      drvSel.innerHTML =
        `<option value="">${drivers.length ? "Seleccione conductor…" : "Sin conductor asignable ahora (revise banderas)"}</option>` +
        driverCandidates
          .map((d) => {
            const lab = tripAssignmentDriverOptionLabel(d, {
              isBusy: d.isBusy,
              isUnavailable: d.isUnavailable,
              hasExpiredDocs: d.hasExpiredDocs
            });
            const disabled = d.isBusy || d.isUnavailable || d.hasExpiredDocs ? " disabled" : "";
            return `<option value="${escapeAttr(d.id)}"${disabled}>${escapeHtml(lab)}</option>`;
          })
          .join("");
    }
    restoreSelectValue(drvSel, prevDriverId);
  }

  if (rateMount) {
    rateMount.innerHTML = `<div class="create-trip-rate-mount">${buildTripRateInlineFieldsHtml(request, { required: true })}</div>`;
    wireTripRateChoiceSelect(formEl);
    const rateChoiceSel = formEl.querySelector("select[name='tripRateChoice']");
    const tripValueInput = formEl.querySelector("input[name='tripValue']");
    restoreSelectValue(rateChoiceSel, prevRateChoice);
    const rateKey = String(rateChoiceSel?.value || "").trim();
    if (rateKey) {
      rateChoiceSel.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      const prevTripValueNum = parseMoneyFieldValue(prevTripValue);
      if (tripValueInput && prevTripValueNum > 0) {
        tripValueInput.value = formatMoneyFieldValue(prevTripValueNum);
      }
    }
  }
  enhanceTripAssignmentSelects(formEl);
  updateCreateTripResourceFieldHints(formEl, request, vehicleCandidates, driverCandidates, vehicles, drivers);
  updateCreateTripStepper(formEl);
}

function prettyStatus(status, scope = "general") {
  const key = slugStatus(status);
  const iconMap = {
    pendiente: IC.clock,
    aprobada_pendiente_asignacion: IC.inbox,
    viaje_asignado: IC.truck,
    en_transito: IC.truck,
    espera_standby: IC.clock,
    completada: IC.check,
    cerrada: IC.briefcase,
    cancelada: IC.x,
    rechazada: IC.x
  };
  const icon = iconMap[key] || IC.activity;
  /**
   * Animación de "ruta" debajo del badge: aplica tanto al ver una solicitud con
   * viaje en curso como cuando se gestiona directamente el viaje. Mejora la
   * legibilidad rápida en módulos de operación (un viaje vivo se distingue
   * visualmente de uno cerrado/pendiente).
   */
  const movingScopes = scope === "request" || scope === "trip";
  const road = movingScopes && (key === "viaje_asignado" || key === "en_transito");
  return `<span class="status-pretty status-${key} ${road ? "status-road" : ""}">${icon}<span>${escapeHtml(status)}</span></span>`;
}

function departmentOptions(selected = "") {
  return Object.keys(COLOMBIA_LOCATIONS)
    .map((dept) => `<option value="${dept}" ${dept === selected ? "selected" : ""}>${dept}</option>`)
    .join("");
}

function cityOptionsFromDepartment(department = "", selectedCity = "") {
  const cities = COLOMBIA_LOCATIONS[String(department || "")] || [];
  const sel = String(selectedCity || "").trim();
  const list = sel && !cities.includes(sel) ? [...cities, sel] : cities;
  return list
    .map(
      (city) =>
        `<option value="${escapeAttr(city)}" ${city === sel ? "selected" : ""}>${escapeHtml(city)}</option>`
    )
    .join("");
}

function attachDepartmentCitySelects(form, {
  departmentSelector = "select[name='department']",
  citySelector = "select[name='city']",
  initialDepartment = "",
  initialCity = ""
} = {}) {
  if (!form) return;
  const deptSelect = form.querySelector(departmentSelector);
  const citySelect = form.querySelector(citySelector);
  if (!deptSelect || !citySelect) return;

  const fill = (dept, preferredCity = "") => {
    const cities = COLOMBIA_LOCATIONS[String(dept || "")] || [];
    const pref = String(preferredCity || "").trim();
    const list = pref && !cities.includes(pref) ? [...cities, pref] : cities;
    citySelect.innerHTML = `<option value="">Seleccione...</option>${list
      .map((c) => `<option value="${escapeAttr(c)}" ${c === pref ? "selected" : ""}>${escapeHtml(c)}</option>`)
      .join("")}`;
  };

  const startDept = String(deptSelect.value || initialDepartment || "");
  if (startDept) {
    deptSelect.value = startDept;
    fill(startDept, String(citySelect.value || initialCity || ""));
  } else {
    citySelect.innerHTML = `<option value="">Seleccione un departamento...</option>`;
  }
  deptSelect.addEventListener("change", () => fill(deptSelect.value, ""));
}

/** `requestAnimationFrame` + `scrollIntoView` suave; útil tras `renderPortalView()` o al abrir modales con formulario largo. */
function scrollIntoViewSmoothBlockStart(target) {
  if (!target) return;
  requestAnimationFrame(() => {
    try {
      target.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    } catch (_e) {
      try {
        target.scrollIntoView(true);
      } catch (__e) {}
    }
  });
}

/** `#crud-modal` (ediciones, fichas, confirmaciones): acerca la tarjeta al viewport. */
function scrollOpenCrudModalIntoView() {
  const modal = document.getElementById("crud-modal");
  if (!modal || modal.classList.contains("hidden")) return;
  const card = modal.querySelector(".modal-card");
  scrollIntoViewSmoothBlockStart(card || modal);
}

/**
 * Paneles colapsables (`createCollapsibleCard` / `data-create-panel`): al abrir,
 * acerca el formulario para no quedar abajo del listado u otras tarjetas.
 */
function scrollToCreatePanelForm(panelId) {
  const id = String(panelId || "").trim();
  if (!id) return;
  const esc = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const wrap = document.querySelector(`[data-create-panel="${esc}"]`);
      if (!wrap) return;
      const formEl = wrap.querySelector("form");
      scrollIntoViewSmoothBlockStart(formEl || wrap);
    });
  });
}

/** Cierra un panel de alta (`createCollapsibleCard`, `data-create-panel`) tras guardado exitoso. */
function collapseCreatePanel(panelId) {
  const id = String(panelId || "").trim();
  if (!id) return;
  state.createPanels = { ...(state.createPanels || {}), [id]: false };
}

/** Limpia estado transitorio antes de reiniciar un panel de alta al cancelar. */
function prepareCancelCreatePanel(panelId) {
  const id = String(panelId || "").trim();
  if (!id) return;
  if (id === "create-route-rate") {
    state.pendingRouteRateEditKey = null;
  }
}

/**
 * Cancelar en paneles de alta: descarta cambios, reinicia el formulario (re-render)
 * y mantiene el panel abierto. «Minimizar» sigue siendo solo `toggle-create-panel`.
 */
async function resetCreatePanelForm(panelId, formEl) {
  const id = String(panelId || "").trim();
  if (!id || !formEl) return false;
  if (!(await confirmDiscardCreateFormAsync(formEl))) return false;
  prepareCancelCreatePanel(id);
  const panelGroup = __pr.createPanelIdsForModule(id);
  if (panelGroup) {
    state.createPanels = __pr.buildModuleCreatePanelsState(panelGroup, id, state.createPanels || {}, { expandActive: true });
  } else {
    state.createPanels = { ...(state.createPanels || {}), [id]: true };
  }
  renderPortalView();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToCreatePanelForm(id));
  });
  return true;
}

function formHasDirtyValues(formEl) {
  if (!formEl) return false;
  const fields = [...formEl.querySelectorAll("input, select, textarea")];
  return fields.some((field) => {
    if (field.disabled) return false;
    const tag = String(field.tagName || "").toLowerCase();
    const type = String(field.type || "").toLowerCase();
    if (type === "hidden") return false;
    if (type === "file") return Boolean(field.files?.length);
    if (type === "checkbox" || type === "radio") return field.checked !== field.defaultChecked;
    if (tag === "select") return field.value !== (field.defaultValue || "");
    return String(field.value || "") !== String(field.defaultValue || "");
  });
}

function payrollBulkEmployeeNameMap() {
  const map = new Map();
  readArray(KEYS.payrollEmployees).forEach((e) => {
    const id = String(e?.id || "").trim();
    if (id) map.set(id, String(e.name || "Colaborador").trim() || "Colaborador");
  });
  return map;
}

function humanizePayrollBulkSkipReason(raw) {
  let text = String(raw || "").trim();
  const hireMatch = text.match(/fecha de ingreso\s*\(?(\d{4}-\d{2}-\d{2})\)?/i);
  if (/sin días (efectivos en el corte|laborables en el período)/i.test(text)) {
    const hireLabel = hireMatch ? fmtDateOr(hireMatch[1], hireMatch[1]) : "";
    return hireLabel
      ? `Sin días laborables en el período (ingresó el ${hireLabel}, después del corte seleccionado).`
      : "Sin días laborables en el período seleccionado.";
  }
  if (/sin fecha de ingreso/i.test(text)) return "Falta fecha de ingreso válida en la ficha del colaborador.";
  if (/prima omitida/i.test(text)) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function parsePayrollBulkAutogenMessage(msg, nameById = new Map()) {
  const s = String(msg || "").trim();
  let m = s.match(/^Empleado\s+([0-9a-f-]{36})\s+\(([^)]+)\):\s*(.+)$/i);
  if (m) {
    return { name: m[2].trim(), reason: humanizePayrollBulkSkipReason(m[3]) };
  }
  m = s.match(/^Empleado\s+([0-9a-f-]{36}):\s*(.+)$/i);
  if (m) {
    return {
      name: nameById.get(m[1]) || "Colaborador",
      reason: humanizePayrollBulkSkipReason(m[2])
    };
  }
  m = s.match(/^([^:]+):\s*(.+)$/);
  if (m) {
    return { name: m[1].trim(), reason: humanizePayrollBulkSkipReason(m[2]) };
  }
  return { name: "", reason: humanizePayrollBulkSkipReason(s) };
}

function openPayrollBulkResultModal(...args) {
  const impl = globalThis.__antaresPortalRrhhModals;
  if (impl && typeof impl.openPayrollBulkResultModal === "function") return impl.openPayrollBulkResultModal(...args);
}


function presentPayrollBulkAutogenResult(result) {
  const created = Number(result?.created || 0);
  const skipped = Number(result?.skipped || 0);
  const rawMsgs = Array.isArray(result?.messages) ? result.messages.filter(Boolean) : [];
  const nameById = payrollBulkEmployeeNameMap();
  const items = rawMsgs.map((msg) => parsePayrollBulkAutogenMessage(msg, nameById));

  const summaryBits = [];
  if (created > 0) {
    summaryBits.push(
      `<span class="payroll-bulk-result-stat payroll-bulk-result-stat--ok"><strong>${created}</strong> creada${created === 1 ? "" : "s"}</span>`
    );
  }
  if (skipped > 0) {
    summaryBits.push(
      `<span class="payroll-bulk-result-stat payroll-bulk-result-stat--skip"><strong>${skipped}</strong> omitida${skipped === 1 ? "" : "s"}</span>`
    );
  }

  const title =
    created > 0 ? "Liquidación masiva completada" : skipped > 0 ? "Sin nuevas liquidaciones" : "Liquidación masiva";

  let bodyHtml = `<div class="payroll-bulk-result-summary">${summaryBits.join("") || '<span class="muted">No hubo cambios.</span>'}</div>`;

  if (items.length) {
    bodyHtml += `<ul class="payroll-bulk-result-list" aria-label="Detalle por colaborador">${items
      .map(
        (it) =>
          `<li><span class="payroll-bulk-result-name">${escapeHtml(it.name || "Colaborador")}</span><span class="payroll-bulk-result-reason">${escapeHtml(it.reason)}</span></li>`
      )
      .join("")}</ul>`;
  } else if (skipped > 0 && created === 0) {
    bodyHtml += `<p class="muted payroll-bulk-result-hint">Ningún colaborador tenía un corte pendiente en esa fecha, o ya existía su liquidación para el mismo período.</p>`;
  }

  if (items.length || (skipped > 0 && created === 0)) {
    openPayrollBulkResultModal({ title, bodyHtml });
    return;
  }

  if (created > 0) {
    notify(
      created === 1 ? "Se generó 1 liquidación." : `Se generaron ${created} liquidaciones.`,
      "success"
    );
    return;
  }

  notify("No se generaron liquidaciones para la fecha indicada.", "info");
}

function confirmDiscardCreateFormAsync(formEl, opts = {}) {
  if (!formHasDirtyValues(formEl)) return Promise.resolve(true);
  return openConfirmModalAsync({
    title: opts.title || "¿Descartar cambios?",
    message:
      opts.message ||
      "Se perderán los cambios no guardados de este formulario. Los datos que escribió no se guardarán.",
    confirmText: opts.confirmText || "Sí, descartar",
    cancelText: opts.cancelText || "Seguir editando",
    confirmIcon: opts.confirmIcon || "x",
    cardClass: "modal-card-edit modal-card--discard"
  });
}

function readAdminUsersFormDraft(formEl, opts = {}) {
  if (!formEl) return {};
  const excludeNames = new Set(Array.isArray(opts.excludeNames) ? opts.excludeNames.map((x) => String(x || "")) : []);
  const excludeTypes = new Set(Array.isArray(opts.excludeTypes) ? opts.excludeTypes.map((x) => String(x || "").toLowerCase()) : ["file"]);
  const out = {};
  const byName = new Map();
  [...formEl.querySelectorAll("input[name], select[name], textarea[name]")].forEach((field) => {
    const name = String(field.name || "").trim();
    if (!name || excludeNames.has(name)) return;
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(field);
  });
  byName.forEach((fields, name) => {
    const first = fields[0];
    const type = String(first.type || "").toLowerCase();
    if (excludeTypes.has(type)) return;
    if (type === "checkbox") {
      out[name] = fields.filter((field) => field.checked).map((field) => String(field.value || ""));
      return;
    }
    if (type === "radio") {
      const checked = fields.find((field) => field.checked);
      out[name] = checked ? String(checked.value || "") : "";
      return;
    }
    out[name] = String(first.value || "");
  });
  return out;
}

function applyAdminUsersFormDraft(formEl, draft = {}) {
  if (!formEl || !draft || typeof draft !== "object") return;
  Object.entries(draft).forEach(([name, rawValue]) => {
    const safeName =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(name)
        : String(name).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const fields = [...formEl.querySelectorAll(`[name="${safeName}"]`)];
    if (!fields.length) return;
    const first = fields[0];
    const type = String(first.type || "").toLowerCase();
    if (type === "checkbox") {
      const selected = new Set(Array.isArray(rawValue) ? rawValue.map((x) => String(x || "")) : []);
      fields.forEach((field) => {
        field.checked = selected.has(String(field.value || ""));
      });
      return;
    }
    if (type === "radio") {
      fields.forEach((field) => {
        field.checked = String(field.value || "") === String(rawValue || "");
      });
      return;
    }
    first.value = rawValue == null ? "" : String(rawValue);
  });
}

/**
 * Administración · Usuarios: acerca el scroll al formulario visible (edición,
 * creación de usuario/empresa o permisos) para no quedar abajo del listado.
 */
function scrollToAdminUsersFocusedForm() {
  const target =
    document.getElementById("form-admin-user-edit") ||
    document.getElementById("form-admin-company-edit") ||
    document.getElementById("form-admin-user-create") ||
    document.getElementById("form-admin-company-create") ||
    document.getElementById("form-admin-user-permissions");
  scrollIntoViewSmoothBlockStart(target);
}

/** Alta/edición empresa (admin): cascada departamento→ciudad y valores iniciales coherentes con el catálogo. */

/** Vista previa del logo en el óvalo (formularios alta/edición empresa en admin). */


async function dispatchPortalNotification(payload) {
  const api = window.AntaresApi;
  if (!api?.getBase?.() || typeof api.postJson !== "function") return false;
  if (!portalCanRefreshFromApi()) return false;
  const prevIds = new Set(
    (typeof window.getCurrentNotifications === "function" ? window.getCurrentNotifications() : [])
      .map((n) => String(n?.id || "")).filter(Boolean)
  );
  try {
    await api.postJson("/portal/notifications/dispatch", payload);
    try {
      const list = typeof window.refreshNotificationsFromServer === "function"
        ? await window.refreshNotificationsFromServer()
        : null;
      if (Array.isArray(list) && typeof window.markInboxNotificationsAsToastSeen === "function") {
        const newIds = list
          .filter((n) => n?.id && !prevIds.has(String(n.id)))
          .map((n) => String(n.id));
        if (newIds.length) window.markInboxNotificationsAsToastSeen(newIds);
      }
    } catch (_e) {
      /* noop */
    }
    return true;
  } catch (_e) {
    return false;
  }
}

async function saveNotification({ userId, title, body, category, deepLink, entityType, entityId }) {
  const targetId = String(userId ?? "").trim();
  if (!targetId) return;
  const payload = {
    userIds: [targetId],
    title: String(title ?? ""),
    body: String(body ?? ""),
    ...(category ? { category: String(category) } : {}),
    ...(deepLink ? { deepLink: String(deepLink) } : {}),
    ...(entityType ? { entityType: String(entityType) } : {}),
    ...(entityId ? { entityId: String(entityId) } : {})
  };
  await dispatchPortalNotification(payload);
}

function notifyAdminUsers(title, body) {
  void dispatchPortalNotification({ audience: "admins", title, body });
}

function notifyHrUsers(title, body) {
  void dispatchPortalNotification({ audience: "hr", title, body });
}



function ensureVehicleDocs() {
  const vehicles = read(KEYS.vehicles, []);
  let changed = false;
  const nowDate = colombiaTodayIsoDate();
  const updated = vehicles.map((v) => {
    if (v.soatExpeditionDate && v.techInspectionExpeditionDate) return v;
    changed = true;
    return {
      ...v,
      soatExpeditionDate: v.soatExpeditionDate || nowDate,
      techInspectionExpeditionDate: v.techInspectionExpeditionDate || nowDate
    };
  });
  if (changed) write(KEYS.vehicles, updated);
}

/** Migraciones de esquema. Datos de negocio: memoria de sesión + PostgreSQL (no localStorage). */
function initPortalClientStorage() {
  const PS = window.AntaresPortalSync;
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    const PORTAL_DATA_VERSION = "v8-server-backed-memory-only";
    if (typeof window.AntaresPersistence?.purgeAllSessionMemoryKeysFromDisk === "function") {
      window.AntaresPersistence.purgeAllSessionMemoryKeysFromDisk();
    }
    if (localStorage.getItem("antares_portal_data_ver") !== PORTAL_DATA_VERSION) {
      if (typeof window.AntaresPersistence?.purgeServerBackedFromDisk === "function") {
        window.AntaresPersistence.purgeServerBackedFromDisk();
      }
      localStorage.removeItem("antares_enterprise_seed_v1");
      localStorage.removeItem("antares_purge_demo_v1");
      localStorage.setItem("antares_portal_data_ver", PORTAL_DATA_VERSION);
    }

    if (localStorage.getItem("antares_users_storage_ver") !== "v5-memory") {
      localStorage.setItem("antares_users_storage_ver", "v5-memory");
    }

    if (localStorage.getItem("antares_module_audit_logs_ver") !== "v2-api-table-only") {
      localStorage.removeItem(KEYS.moduleAuditLogs);
      localStorage.removeItem(KEYS.deletedTransportTripLogs);
      localStorage.removeItem(KEYS.deletedTransportRequestLogs);
      localStorage.removeItem(KEYS.entityHistoryActors);
      localStorage.setItem("antares_module_audit_logs_ver", "v2-api-table-only");
      if (typeof window.AntaresPersistence?.purgeAllSessionMemoryKeysFromDisk === "function") {
        window.AntaresPersistence.purgeAllSessionMemoryKeysFromDisk();
      }
      if (typeof window.AntaresPersistence?.clearSessionMemoryOnly === "function") {
        window.AntaresPersistence.clearSessionMemoryOnly();
      }
      if (typeof window.AntaresPersistence?.remove === "function") {
        window.AntaresPersistence.remove(KEYS.moduleAuditLogs);
        window.AntaresPersistence.remove(KEYS.deletedTransportTripLogs);
        window.AntaresPersistence.remove(KEYS.deletedTransportRequestLogs);
        window.AntaresPersistence.remove(KEYS.entityHistoryActors);
      }
    }

    ensureCompaniesAndUserMapping();
    ensureRequestsCompanyMapping();
    ensureRequestAndTripIdentifiers();
    ensureUsersPermissions();
    ensureUsersAccountStatus();
    ensureVehicleDocs();
    if (window.AntaresApi?.purgeLegacyAuthTokens) {
      window.AntaresApi.purgeLegacyAuthTokens();
    }
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }
}

async function tryApiLoginBridge(user, password) {
  const api = window.AntaresApi;
  if (!api?.getBase?.() || !user?.email) return;
  try {
    const url = `${api.getBase()}/api/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: user.email, password })
    });
    const body = res.ok ? await res.json() : null;
    if (!body?.user?.userId) return;
    if (typeof api.applyAuthTokensFromResponse === "function") {
      api.applyAuthTokensFromResponse(body);
    } else if (body?.csrfToken && api.setCsrfToken) {
      api.setCsrfToken(body.csrfToken);
    }
    const session = getSession();
    if (session) {
      setSession({
        ...session,
        lastActivityAt: Date.now()
      });
    }
    await startPortalBootstrapForInteractiveSession();
    syncSessionProfileSnapshotFromCache();
    if (state.session && currentUser()) {
      scheduleRenderPortalView();
      updateNotificationBadge();
    }
  } catch (_e) {
    /* API opcional: sesion local sigue valida */
  }
}


async function ensureUsersPasswordHashing() {
  const users = read(KEYS.users, []);
  if (window.AntaresApi?.getBase?.()) {
    let anyPlain = false;
    for (const user of users) {
      const p = String(user.password || "");
      if (p && !p.startsWith("sha256:")) {
        anyPlain = true;
        break;
      }
    }
    if (!anyPlain) return;
  }
  let changed = false;
  const secured = [];
  for (const user of users) {
    const p = String(user.password || "");
    if (p.startsWith("sha256:")) {
      secured.push(user);
      continue;
    }
    if (!p) {
      secured.push(user);
      continue;
    }
    changed = true;
    secured.push({ ...user, password: await hashPassword(p) });
  }
  if (changed) write(KEYS.users, secured);
}
let authModalLastFocus = null;

function showAuth() {
  const modal = nodes.authModal || document.getElementById("auth-modal");
  if (!modal) return;
  authModalLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modal.classList.remove("hidden");
  if (typeof window.renderAuthTab === "function") window.renderAuthTab();
  const firstFocus = modal.querySelector(
    "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])"
  );
  try {
    firstFocus?.focus?.({ preventScroll: true });
  } catch (_e) {
    firstFocus?.focus?.();
  }
}

function hideAuth() {
  const modal = nodes.authModal || document.getElementById("auth-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  try {
    authModalLastFocus?.focus?.({ preventScroll: true });
  } catch (_e) {
    authModalLastFocus?.focus?.();
  }
  authModalLastFocus = null;
}

window.showAuth = showAuth;
window.hideAuth = hideAuth;
/** Expuestas para `app.js` (módulo ES); el runtime clásico no re-exporta por defecto. */
window.initPortalClientStorage = initPortalClientStorage;
window.restorePortalSnapshotIfAvailable = restorePortalSnapshotIfAvailable;
window.initPublicEffects = initPublicEffects;
window.initCoverageCorridors = initCoverageCorridors;
window.renderPublicCoverageFromView = renderPublicCoverageFromView;
window.ensureUsersPasswordHashing = ensureUsersPasswordHashing;
window.updateAutoApprove = updateAutoApprove;

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Valor monetario desde input con formato es-CO ($ y separadores de miles). */
function parseMoneyFieldValue(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return 0;
  const digits = s.replace(/[^\d]/g, "");
  if (digits) return parseInt(digits, 10) || 0;
  return parseNum(s);
}

function formatMoneyFieldValue(amount) {
  const n = Math.max(0, Math.floor(parseNum(amount)));
  if (n <= 0) return "0";
  return n.toLocaleString("es-CO");
}

/** Normaliza fila de combustible (bootstrap API ↔ portal). */
function normalizeFuelLogPortalRow(log) {
  if (!log || typeof log !== "object") return log;
  const plate = String(log.vehiclePlate || log.plate || log.placa_vehiculo || "").trim().toUpperCase();
  const dateRaw = log.date || log.fecha;
  const date =
    typeof dateRaw === "string" && dateRaw.length >= 10
      ? dateRaw.slice(0, 10)
      : dateRaw
        ? String(new Date(dateRaw).toISOString()).slice(0, 10)
        : "";
  const liters = parseNum(log.liters ?? log.litros);
  const totalCost = parseNum(log.totalCost ?? log.costo_total ?? log.total_cost);
  return {
    ...log,
    id: log.id,
    date,
    vehicleId: log.vehicleId || log.id_vehiculo || log.vehicle_id,
    plate,
    vehiclePlate: plate,
    driverId: log.driverId || log.id_conductor,
    driverName: normalizeLatinUpperForDb(log.driverName || log.nombre_conductor || ""),
    tripNumber: String(log.tripNumber || log.numero_viaje || "").trim(),
    liters,
    totalCost,
    costPerLiter:
      log.costPerLiter != null
        ? parseNum(log.costPerLiter)
        : log.costo_por_litro != null
          ? parseNum(log.costo_por_litro)
          : liters > 0
            ? Math.round(totalCost / liters)
            : 0,
    odometerKm:
      log.odometerKm != null
        ? parseNum(log.odometerKm)
        : log.kilometraje_odometro != null
          ? parseNum(log.kilometraje_odometro)
          : null,
    station: normalizeLatinUpperForDb(log.station || log.estacion || ""),
    paidBy: String(log.paidBy || log.pagado_por || "empresa").toLowerCase() === "conductor" ? "conductor" : "empresa",
    createdAt: log.createdAt || log.fecha_registro || nowIso()
  };
}

/** Payload alineado con registros_combustible (sync-key / PostgreSQL). */
function fuelLogRowForServer(log) {
  const n = normalizeFuelLogPortalRow(log);
  const liters = parseNum(n.liters);
  const totalCost = parseNum(n.totalCost);
  return {
    id: n.id,
    date: n.date || nowIso().slice(0, 10),
    vehicleId: n.vehicleId,
    plate: n.plate || n.vehiclePlate,
    driverId: n.driverId,
    driverName: n.driverName,
    tripNumber: n.tripNumber || null,
    liters,
    totalCost,
    costPerLiter: liters > 0 ? Math.round(totalCost / liters) : parseNum(n.costPerLiter) || null,
    odometerKm: parseNum(n.odometerKm) > 0 ? parseNum(n.odometerKm) : null,
    station: n.station || null,
    paidBy: n.paidBy || "empresa",
    createdAt: n.createdAt
  };
}

function normalizeFuelLogsList(list) {
  return (Array.isArray(list) ? list : []).map(normalizeFuelLogPortalRow);
}

/** Normaliza fila de taller (bootstrap API ↔ portal). */
function normalizeVehicleTechnicalLogPortalRow(log) {
  if (!log || typeof log !== "object") return log;
  const plate = String(log.vehiclePlate || log.plate || log.placa_vehiculo || "").trim().toUpperCase();
  const typeKey = String(log.interventionType || log.type || log.tipo_intervencion || "preventivo").toLowerCase();
  const status = String(log.followUpStatus || log.status || log.estado_seguimiento || "Pendiente").trim();
  const dateRaw = log.date || log.fecha;
  const date =
    typeof dateRaw === "string" && dateRaw.length >= 10
      ? dateRaw.slice(0, 10)
      : dateRaw
        ? String(new Date(dateRaw).toISOString()).slice(0, 10)
        : "";
  return {
    ...log,
    id: log.id,
    date,
    vehicleId: log.vehicleId || log.id_vehiculo,
    plate,
    vehiclePlate: plate,
    interventionType: typeKey,
    type: typeKey,
    description: normalizeLatinUpperForDb(log.description || log.descripcion || ""),
    cost: parseNum(log.cost ?? log.costo),
    downtimeHours: parseNum(log.downtimeHours ?? log.horas_inactividad ?? log.hoursOut),
    followUpStatus: status,
    status,
    createdAt: log.createdAt || log.fecha_registro || nowIso()
  };
}

function vehicleTechnicalLogRowForServer(log) {
  const n = normalizeVehicleTechnicalLogPortalRow(log);
  return {
    id: n.id,
    date: n.date || nowIso().slice(0, 10),
    vehicleId: n.vehicleId,
    plate: n.plate || n.vehiclePlate,
    interventionType: n.interventionType || n.type || "preventivo",
    description: n.description || "",
    cost: parseNum(n.cost),
    downtimeHours: parseNum(n.downtimeHours),
    followUpStatus: n.followUpStatus || n.status || "Pendiente",
    createdAt: n.createdAt
  };
}

function normalizeVehicleTechnicalLogsList(list) {
  return (Array.isArray(list) ? list : []).map(normalizeVehicleTechnicalLogPortalRow);
}

function readFuelLogs() {
  return normalizeFuelLogsList(read(KEYS.fuelLogs, []));
}

function readVehicleTechnicalLogs() {
  return normalizeVehicleTechnicalLogsList(read(KEYS.vehicleTechnicalLogs, []));
}

async function writeFuelLogsAwait(list, syncRow = null) {
  const normalized = normalizeFuelLogsList(list);
  write(KEYS.fuelLogs, normalized);
  const syncData =
    syncRow != null
      ? (Array.isArray(syncRow) ? syncRow : [syncRow]).map(fuelLogRowForServer)
      : normalized.map(fuelLogRowForServer);
  const sync = window.AntaresPortalSync;
  const api = window.AntaresApi;
  if (sync?.flushEntityNow && api?.isConfigured?.()) {
    await sync.flushEntityNow("fuelLogs", syncData);
    return;
  }
  await writeAwaitServer(KEYS.fuelLogs, normalized, { syncData });
}

async function writeVehicleTechnicalLogsAwait(list, syncRow = null) {
  const normalized = normalizeVehicleTechnicalLogsList(list);
  write(KEYS.vehicleTechnicalLogs, normalized);
  const syncData =
    syncRow != null
      ? (Array.isArray(syncRow) ? syncRow : [syncRow]).map(vehicleTechnicalLogRowForServer)
      : normalized.map(vehicleTechnicalLogRowForServer);
  const sync = window.AntaresPortalSync;
  const api = window.AntaresApi;
  if (sync?.flushEntityNow && api?.isConfigured?.()) {
    await sync.flushEntityNow("vehicleTechnicalLogs", syncData);
    return;
  }
  await writeAwaitServer(KEYS.vehicleTechnicalLogs, normalized, { syncData });
}

/** Alta de combustible: INSERT en registros_combustible y actualiza caché del portal. */
async function appendFuelLogAwait(row) {
  const draft = normalizeFuelLogPortalRow(row);
  const api = window.AntaresApi;
  if (api?.isConfigured?.() && typeof api.postJson === "function") {
    const saved = await api.postJson("/portal/fleet/fuel-logs", fuelLogRowForServer(draft));
    const merged = normalizeFuelLogPortalRow(saved);
    const actor = currentUser();
    if (actor && !historyAuditFleetLogActor(merged)) {
      merged.registeredByUserId = String(actor.id || "").trim() || merged.registeredByUserId;
      merged.registeredByName = getPortalUserDisplayName(actor) || merged.registeredByName;
      merged.registeredByEmail = String(actor.email || "").trim() || merged.registeredByEmail;
    }
    const list = readFuelLogs().filter((l) => String(l.id) !== String(merged.id));
    list.unshift(merged);
    write(KEYS.fuelLogs, list);
    return merged;
  }
  const list = readFuelLogs();
  list.unshift(draft);
  await writeFuelLogsAwait(list, draft);
  return draft;
}

/** Alta de taller: INSERT en registros_mantenimiento_vehiculo y actualiza caché del portal. */
async function appendVehicleTechnicalLogAwait(row) {
  const draft = normalizeVehicleTechnicalLogPortalRow(row);
  const api = window.AntaresApi;
  if (api?.isConfigured?.() && typeof api.postJson === "function") {
    const saved = await api.postJson("/portal/fleet/maintenance-logs", vehicleTechnicalLogRowForServer(draft));
    const merged = normalizeVehicleTechnicalLogPortalRow(saved);
    const actor = currentUser();
    if (actor && !historyAuditFleetLogActor(merged)) {
      merged.registeredByUserId = String(actor.id || "").trim() || merged.registeredByUserId;
      merged.registeredByName = getPortalUserDisplayName(actor) || merged.registeredByName;
      merged.registeredByEmail = String(actor.email || "").trim() || merged.registeredByEmail;
    }
    const list = readVehicleTechnicalLogs().filter((l) => String(l.id) !== String(merged.id));
    list.unshift(merged);
    write(KEYS.vehicleTechnicalLogs, list);
    return merged;
  }
  const list = readVehicleTechnicalLogs();
  list.unshift(draft);
  await writeVehicleTechnicalLogsAwait(list, draft);
  return draft;
}

function diffMinutes(fromIso) {
  return (Date.now() - new Date(fromIso).getTime()) / 60000;
}

function isManuallyUnavailable(resource) {
  return Boolean(resource && resource.available === false && resource.autoBusy !== true);
}

function openTripInvoicePdf(requestId) {
  const request = reqRead().find((r) => r.id === requestId);
  if (!request?.trip) {
    notify(userMessage("invoiceNoTrip"), "error");
    return;
  }
  const invoice = request.trip.invoice || buildTripInvoice(request);
  const requests = reqRead();
  const nextRequests = requests.map((r) =>
    r.id === requestId ? { ...r, trip: { ...r.trip, invoice, updatedAt: nowIso() }, updatedAt: nowIso() } : r
  );
  const updatedRow = nextRequests.find((r) => r.id === requestId);
  void (async () => {
    try {
      await reqWriteAwait(nextRequests, updatedRow);
    } catch (_e) {}
  })();

  const html = `<!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Factura ${escapeHtml(invoice.number)}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#0f172a;margin:0;padding:24px;background:#f8fafc}
      .sheet{max-width:900px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:26px}
      .head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:18px}
      h1{font-size:24px;margin:0;color:#0b3f8a}
      .muted{color:#64748b;font-size:12px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}
      .box{border:1px solid #e2e8f0;border-radius:10px;padding:12px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:13px}
      th{background:#eff6ff;color:#1e3a8a}
      .totals{margin-top:16px;max-width:320px;margin-left:auto}
      .totals div{display:flex;justify-content:space-between;padding:6px 0}
      .grand{font-size:18px;font-weight:700;color:#0b3f8a;border-top:1px solid #cbd5e1;margin-top:6px;padding-top:10px}
      @media print{body{background:#fff;padding:0}.sheet{border:none;border-radius:0;max-width:none;padding:0}}
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="head">
        <div>
          <h1>Factura de viaje ${escapeHtml(invoice.number)}</h1>
          <div class="muted">Generada: ${escapeHtml(fmtDate(invoice.generatedAt))}</div>
        </div>
        <div>
          <strong>${escapeHtml(invoice.issuer)}</strong><br />
          <span class="muted">NIT 900.000.000-0</span>
        </div>
      </div>
      <div class="grid">
        <div class="box">
          <strong>Cliente</strong><br />
          ${escapeHtml(request.clientName || "-")}<br />
          <span class="muted">Solicitud: ${escapeHtml(request.requestNumber || request.id)}</span>
        </div>
        <div class="box">
          <strong>Viaje</strong><br />
          ${escapeHtml(request.trip.tripNumber || "-")}<br />
          <span class="muted">${escapeHtml(request.trip.vehiclePlate || "-")} · ${escapeHtml(request.trip.driverName || "-")}</span>
        </div>
      </div>
      <table>
        <thead><tr><th>Concepto</th><th>Detalle</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Servicio de transporte</td><td>${escapeHtml(formatRoute(request))}</td><td>$${invoice.baseValue.toLocaleString("es-CO")}</td></tr>
          <tr><td>Standby</td><td>Cargos por espera</td><td>$${invoice.standbyValue.toLocaleString("es-CO")}</td></tr>
        </tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><strong>$${invoice.subtotal.toLocaleString("es-CO")}</strong></div>
        <div><span>IVA (${Math.round(invoice.ivaRate * 100)}%)</span><strong>$${invoice.ivaValue.toLocaleString("es-CO")}</strong></div>
        <div class="grand"><span>Total</span><span>$${invoice.total.toLocaleString("es-CO")}</span></div>
      </div>
      <p class="muted" style="margin-top:18px">Documento generado automaticamente por Antares. Esta factura refleja el cierre operacional del viaje.</p>
    </div>
    <script>window.print()</script>
  </body>
  </html>`;
  const win = window.open("", "_blank");
  if (!win) {
    notify(userMessage("invoicePopupBlocked"), "error");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

async function setVehicleAvailability(vehicleId, available) {
  const id = String(vehicleId || "").trim();
  const vehicles = read(KEYS.vehicles, []);
  const updatedTs = nowIso();
  const next = vehicles.map((v) =>
    String(v.id || "").trim() === id ? { ...v, available: Boolean(available), updatedAt: updatedTs } : v
  );
  await writeAwaitServerEdit(KEYS.vehicles, next, id);
}

function findPortalVehicleById(vehicleId) {
  const id = String(vehicleId || "").trim();
  if (!id) return null;
  return read(KEYS.vehicles, []).find((v) => String(v.id || "").trim() === id) || null;
}

function describePortalVehicleOccupancy(vehicle) {
  const vehicleId = String(vehicle?.id || "").trim();
  if (!vehicleId) return { tone: "available", trip: null, detail: "Sin datos" };
  if (isManuallyUnavailable(vehicle)) {
    return { tone: "offline", trip: null, detail: "Marcado manualmente como no disponible" };
  }
  const activeTrips = getActiveTrips().filter((r) => String(r.trip?.vehicleId || "").trim() === vehicleId);
  if (!activeTrips.length) return { tone: "available", trip: null, detail: "Sin viaje activo" };
  const nowTs = Date.now();
  const ongoing =
    activeTrips.find((r) => describeTripTimingVsNow(r, nowTs).timing === "ongoing") || null;
  if (ongoing) {
    const left = describeTripTimingVsNow(ongoing, nowTs).minutes;
    return {
      tone: "busy",
      trip: ongoing,
      detail: `En curso · ${left != null ? `${left} min restantes` : "Horario en curso"}`
    };
  }
  const upcoming = activeTrips
    .map((r) => ({ r, info: describeTripTimingVsNow(r, nowTs) }))
    .filter((x) => x.info.timing === "upcoming")
    .sort((a, b) => parseNum(a.info.minutes) - parseNum(b.info.minutes))[0];
  if (upcoming) {
    return {
      tone: "scheduled",
      trip: upcoming.r,
      detail: `Reservado · inicia en ${upcoming.info.minutes} min`
    };
  }
  return { tone: "available", trip: null, detail: "Sin viaje activo en este momento" };
}

function portalVehicleAvailabilityStatusHtml(vehicle) {
  const occupancy = describePortalVehicleOccupancy(vehicle);
  if (isManuallyUnavailable(vehicle)) {
    return '<span class="status status-fleet-offline">No disponible (manual)</span>';
  }
  if (vehicle?.autoBusy) {
    return '<span class="status status-fleet-ocupado">Ocupado por viaje</span>';
  }
  if (occupancy.tone === "busy") {
    return '<span class="status status-fleet-ocupado">En viaje</span>';
  }
  if (occupancy.tone === "scheduled") {
    return '<span class="status status-fleet-programado">Reservado</span>';
  }
  return '<span class="status status-fleet-disponible">Disponible</span>';
}

function openVehicleTechnicalSheetModal(vehicle) {
  if (!vehicle) return;
  const v = normalizeVehicleRowForEditor(vehicle) || vehicle;
  const plate = String(v.plate || "").trim().toUpperCase() || "—";
  const soat = docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
  const tec = docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
  const rcExpiry = docExpiryStatus(null, v.rcPolicyExpiry);
  const occupancy = describePortalVehicleOccupancy(v);
  const isRefrigerated = vehicleHasTermokingEquipment(v);
  const trip = occupancy.trip;
  const vehicleTitle = `${String(v.brand || "").trim()} ${String(v.model || "").trim()}`.trim() || plate;
  const capacityLbl =
    parseNum(v.capacityKg) > 0 ? `${parseNum(v.capacityKg).toLocaleString("es-CO")} kg` : "Sin dato";
  const mileageLbl =
    parseNum(v.mileageKm) > 0 ? `${parseNum(v.mileageKm).toLocaleString("es-CO")} km` : "Sin dato";
  const hasGps = !(v.hasGps === false || String(v.hasGps).toLowerCase() === "false");
  const termoChip = isRefrigerated
    ? '<span class="status status-viaje_asignado">Termoking</span>'
    : '<span class="status status-pendiente">Carga seca</span>';
  const heroHtml = `<div class="portal-detail-hero portal-detail-hero--vehicle">
    <div class="portal-detail-hero-plate" aria-hidden="true">${renderColombianPlateBadgeHtml(plate)}</div>
    <div class="portal-detail-hero-main">
      <p class="portal-detail-eyebrow">${IC.truck} Ficha técnica</p>
      <div class="portal-detail-badges">${portalVehicleAvailabilityStatusHtml(v)} ${termoChip}</div>
      <p class="portal-detail-meta"><strong>${escapeHtml(vehicleTitle)}</strong> · ${escapeHtml(String(v.type || "Vehículo"))} · ${escapeHtml(String(v.year || "—"))}</p>
      <ul class="portal-detail-stats" aria-label="Resumen">
        <li><strong>${escapeHtml(capacityLbl)}</strong><span>Capacidad</span></li>
        <li><strong>${escapeHtml(mileageLbl)}</strong><span>Kilometraje</span></li>
        <li><strong>${escapeHtml(fmtDateOr(v.createdAt))}</strong><span>Alta en sistema</span></li>
      </ul>
    </div>
  </div>`;
  const tilesHtml = [
    portalDetailTileMarkup(IC.layers, "Carrocería", escapeHtml(String(v.bodyType || "Sin dato")), {
      muted: !String(v.bodyType || "").trim()
    }),
    portalDetailTileMarkup(IC.activity, "Combustible", escapeHtml(String(v.fuelType || "Sin dato")), {
      muted: !String(v.fuelType || "").trim()
    }),
    portalDetailTileMarkup(
      IC.satellite,
      "GPS",
      hasGps ? escapeHtml(String(v.gpsProvider || "Instalado")) : `<span class="muted">Sin GPS</span>`,
      { muted: !hasGps }
    )
  ].join("");
  const tripHighlightBody = trip
    ? `<p class="portal-detail-loc-line"><strong>Viaje ${escapeHtml(String(trip.trip?.tripNumber || "—"))}</strong> · ${escapeHtml(String(trip.clientName || trip.companyName || ""))}</p><p class="portal-detail-loc-sub muted">${IC.clock} ${escapeHtml(occupancy.detail)}</p>`
    : `<p class="portal-detail-loc-line">${escapeHtml(occupancy.detail)}</p>`;
  const highlightHtml = portalDetailHighlightHtml("Operación actual", tripHighlightBody, "truck");
  const row = (pairs) => portalDetailRenderRows(pairs, { skipEmpty: false });
  const sections = [
    {
      icon: "activity",
      title: "Estado operativo",
      rows: row([
        ["Disponibilidad", portalVehicleAvailabilityStatusHtml(v)],
        ["Detalle", escapeHtml(occupancy.detail)],
        ["Termoking", isRefrigerated ? "Sí, equipo Termoking" : "No, carga seca"],
        ["Registrado", fmtDateOr(v.createdAt)],
        ["Última actualización", fmtDateOr(v.updatedAt)]
      ])
    },
    {
      icon: "truck",
      title: "Identificación",
      rows: row([
        ["Placa", `<strong>${escapeHtml(plate)}</strong>`],
        ["Marca", escapeHtml(String(v.brand || "—"))],
        ["Línea / modelo", escapeHtml(String(v.model || "—"))],
        ["Año modelo", escapeHtml(String(v.year || "—"))],
        ["Color", escapeHtml(String(v.color || "—"))],
        ["Tipo de vehículo", escapeHtml(String(v.type || "—"))]
      ])
    },
    {
      icon: "layers",
      title: "Características técnicas",
      rows: row([
        ["Carrocería", escapeHtml(String(v.bodyType || "—"))],
        ["Capacidad", capacityLbl],
        ["Combustible", escapeHtml(String(v.fuelType || "—"))],
        ["Configuración de ejes", escapeHtml(String(v.axleConfig || "—"))],
        ["N° motor", escapeHtml(String(v.engineNumber || "—"))],
        ["Chasis (VIN)", escapeHtml(String(v.vin || "—"))],
        ["Kilometraje", mileageLbl]
      ])
    },
    {
      icon: "shield",
      title: "Documentación legal",
      rows: row([
        ["Tarjeta de propiedad", escapeHtml(String(v.ownershipCard || "—"))],
        ["SOAT expedido", fmtDateOr(v.soatExpeditionDate)],
        ["SOAT vence", `${fmtDateOr(v.soatExpiryDate)} <span class="status ${soat.cls}">${escapeHtml(soat.label)}</span>`],
        ["Tecnomecánica expedida", fmtDateOr(v.techInspectionExpeditionDate)],
        ["Tecnomecánica vence", `${fmtDateOr(v.techInspectionExpiryDate)} <span class="status ${tec.cls}">${escapeHtml(tec.label)}</span>`],
        ["Póliza RC contractual", escapeHtml(String(v.rcPolicyContract || "—"))],
        ["Póliza RC extracontractual", escapeHtml(String(v.rcPolicyExtra || "—"))],
        [
          "Vence pólizas RCP",
          v.rcPolicyExpiry
            ? `${fmtDateOr(v.rcPolicyExpiry)} <span class="status ${rcExpiry.cls}">${escapeHtml(rcExpiry.label)}</span>`
            : "—"
        ]
      ])
    },
    {
      icon: "satellite",
      title: "GPS y trazabilidad",
      rows: row([
        ["GPS satelital", hasGps ? "Sí" : "No"],
        ["Proveedor GPS", escapeHtml(String(v.gpsProvider || "—"))],
        ["Usuario proveedor satélite", escapeHtml(String(v.satelliteProviderUser || "—"))],
        ["Contraseña proveedor satélite", v.satelliteProviderPassword ? "••••••••" : "—"]
      ])
    }
  ];
  openPortalDetailSheet({
    title: `Ficha técnica · ${plate}`,
    sheetTitle: plate,
    subtitleHtml: `${IC.truck} ${escapeHtml(vehicleTitle)}`,
    statusHtml: `${portalVehicleAvailabilityStatusHtml(v)} ${termoChip}`,
    moduleIcon: "truck",
    moduleTone: "blue",
    sections: [
      {
        icon: "activity",
        pairs: [
          ["Disponibilidad", portalVehicleAvailabilityStatusHtml(v)],
          ["Detalle operativo", escapeHtml(occupancy.detail)],
          ["Termoking", isRefrigerated ? "Sí, equipo Termoking" : "No, carga seca"],
          ["Registrado", fmtDateOr(v.createdAt)],
          ["Última actualización", fmtDateOr(v.updatedAt)]
        ]
      },
      {
        icon: "truck",
        pairs: [
          ["Placa", `<strong>${escapeHtml(plate)}</strong>`],
          ["Marca", escapeHtml(String(v.brand || "—"))],
          ["Línea / modelo", escapeHtml(String(v.model || "—"))],
          ["Año modelo", escapeHtml(String(v.year || "—"))],
          ["Color", escapeHtml(String(v.color || "—"))],
          ["Tipo de vehículo", escapeHtml(String(v.type || "—"))]
        ]
      },
      {
        icon: "layers",
        pairs: [
          ["Carrocería", escapeHtml(String(v.bodyType || "—"))],
          ["Capacidad", capacityLbl],
          ["Combustible", escapeHtml(String(v.fuelType || "—"))],
          ["Configuración de ejes", escapeHtml(String(v.axleConfig || "—"))],
          ["N° motor", escapeHtml(String(v.engineNumber || "—"))],
          ["Chasis (VIN)", escapeHtml(String(v.vin || "—"))],
          ["Kilometraje", mileageLbl]
        ]
      },
      {
        icon: "shield",
        pairs: [
          ["Tarjeta de propiedad", escapeHtml(String(v.ownershipCard || "—"))],
          ["SOAT expedido", fmtDateOr(v.soatExpeditionDate)],
          ["SOAT vence", `${fmtDateOr(v.soatExpiryDate)} <span class="status ${soat.cls}">${escapeHtml(soat.label)}</span>`],
          ["Tecnomecánica expedida", fmtDateOr(v.techInspectionExpeditionDate)],
          ["Tecnomecánica vence", `${fmtDateOr(v.techInspectionExpiryDate)} <span class="status ${tec.cls}">${escapeHtml(tec.label)}</span>`],
          ["Póliza RC contractual", escapeHtml(String(v.rcPolicyContract || "—"))],
          ["Póliza RC extracontractual", escapeHtml(String(v.rcPolicyExtra || "—"))],
          [
            "Vence pólizas RCP",
            v.rcPolicyExpiry
              ? `${fmtDateOr(v.rcPolicyExpiry)} <span class="status ${rcExpiry.cls}">${escapeHtml(rcExpiry.label)}</span>`
              : "—"
          ]
        ]
      },
      {
        icon: "satellite",
        pairs: [
          ["GPS satelital", hasGps ? "Sí" : "No"],
          ["Proveedor GPS", escapeHtml(String(v.gpsProvider || "—"))],
          ["Usuario proveedor satélite", escapeHtml(String(v.satelliteProviderUser || "—"))],
          ["Contraseña proveedor satélite", v.satelliteProviderPassword ? "••••••••" : "—"]
        ]
      }
    ],
    secondaryActionsHtml: isAdminActor()
      ? `<button type="button" class="btn btn-action" data-vehicle-sheet-action="edit">${IC.edit} Editar vehículo</button>`
      : "",
    afterMount: (contentEl) => {
      contentEl.querySelector("[data-vehicle-sheet-action='edit']")?.addEventListener("click", () => {
        document.getElementById("crud-modal")?.classList.add("hidden");
        nodes.viewRoot?.querySelector(`[data-action='edit-vehicle'][data-id="${escapeAttr(String(v.id || ""))}"]`)?.click();
      });
    }
  });
}

function togglePortalVehicleManualAvailability(vehicleId) {
  const target = findPortalVehicleById(vehicleId);
  if (!target) {
    notify("No se encontró el vehículo. Actualice la página.", "error");
    return;
  }
  if (target.autoBusy) {
    notify(
      "Este vehículo está ocupado por un viaje activo. La disponibilidad se ajustará automáticamente al finalizar el viaje.",
      "info"
    );
    return;
  }
  const plate = String(target.plate || "").trim().toUpperCase();
  const markingUnavailable = !isManuallyUnavailable(target);
  openConfirmModal({
    title: "Cambiar disponibilidad",
    message: markingUnavailable
      ? `¿Marcar el vehículo ${plate} como no disponible manualmente? No se ofrecerá en asignaciones hasta que lo reactive.`
      : `¿Marcar el vehículo ${plate} como disponible nuevamente?`,
    confirmText: markingUnavailable ? "Marcar no disponible" : "Marcar disponible",
    onConfirm: async () => {
      try {
        await setVehicleAvailability(target.id, !markingUnavailable);
        recalculateResourceAvailability();
        notify(
          markingUnavailable ? `Vehículo ${plate} marcado como no disponible.` : `Vehículo ${plate} disponible.`,
          "success"
        );
        renderPortalView();
      } catch (err) {
        notify(String(err?.message || "No fue posible actualizar la disponibilidad."), "error");
      }
    }
  });
}


/** Detalle de solicitud: delegación en viewRoot (tarjetas del módulo Solicitudes y tablas legacy). */

async function setDriverAvailability(driverId, available) {
  const key = String(driverId ?? "").trim();
  if (!key) return false;
  const drivers = read(KEYS.drivers, []);
  let updatedDriver = null;
  const next = drivers.map((d) => {
    if (String(d.id ?? "").trim() !== key) return d;
    updatedDriver = stampUpdatedRecord({
      ...d,
      available: Boolean(available)
    });
    return updatedDriver;
  });
  if (!updatedDriver) return false;
  try {
    await writeAwaitServerEdit(KEYS.drivers, next, key);
    appendPortalEntityAuditLog(
      "update",
      "drivers",
      "Conductores",
      updatedDriver,
      `${updatedDriver.available ? "Disponible" : "No disponible"} · estado operativo`,
      { entityLabel: String(updatedDriver.name || "Conductor").trim() }
    );
    if (portalCanRefreshFromApi()) {
      try {
        await applyPortalBootstrapFromApi();
      } catch (_e) {}
      const refreshed = read(KEYS.drivers, []).find((d) => String(d.id ?? "").trim() === key);
      if (refreshed?.updatedAt) {
        recordEntityHistoryActor(
          "Conductores",
          refreshed.id,
          refreshed.updatedAt,
          getPortalAuditActorLabel()
        );
      }
    }
    recalculateResourceAvailability();
    return true;
  } catch (_e) {
    return false;
  }
}

function findPortalDriverById(driverId) {
  const id = String(driverId ?? "").trim();
  if (!id) return null;
  return read(KEYS.drivers, []).find((d) => String(d.id ?? "").trim() === id) || null;
}

function portalDetailTileMarkup(iconSvg, label, valueHtml, opts = {}) {
  const { href = "", muted = false } = opts;
  const inner = `<span class="portal-detail-tile-icon" aria-hidden="true">${iconSvg}</span><span class="portal-detail-tile-text"><span class="portal-detail-tile-label">${escapeHtml(label)}</span><span class="portal-detail-tile-value">${valueHtml}</span></span>`;
  if (href) {
    return `<a class="portal-detail-tile" href="${escapeAttr(href)}">${inner}</a>`;
  }
  return `<div class="portal-detail-tile${muted ? " portal-detail-tile--muted" : ""}" role="group">${inner}</div>`;
}

function portalDetailRenderRows(pairs, opts = {}) {
  const skipEmpty = opts.skipEmpty !== false;
  const emptyHtml = opts.emptyHtml ?? '<span class="muted">—</span>';
  return (pairs || [])
    .filter((p) => {
      if (!p) return false;
      if (!skipEmpty) return true;
      const val = p[1];
      return val !== null && val !== undefined && String(val).trim() !== "";
    })
    .map(([label, value]) => {
      const display =
        value === null || value === undefined || String(value).trim() === ""
          ? skipEmpty
            ? null
            : emptyHtml
          : value;
      if (display === null) return "";
      return `<div class="detail-row"><span class="detail-row-label">${escapeHtml(String(label))}</span><span class="detail-row-value">${display}</span></div>`;
    })
    .filter(Boolean)
    .join("");
}

function portalDetailBuildGrid(sections) {
  const blocks = (sections || [])
    .filter((sec) => sec && String(sec.rows || "").trim())
    .map((sec, idx) => {
      const toneClass = sec.tone ? ` detail-section--${escapeAttr(String(sec.tone))}` : "";
      return `<section class="detail-section detail-section--card${toneClass}" style="--detail-section-i:${idx % 6}">
        <h4 class="detail-section-title">${IC[sec.icon] || ""}<span>${escapeHtml(sec.title)}</span></h4>
        <div class="detail-section-grid">${sec.rows}</div>
      </section>`;
    })
    .join("");
  return blocks ? `<div class="detail-grid detail-grid--sections">${blocks}</div>` : "";
}

function portalDetailHighlightHtml(title, bodyHtml, iconKey = "activity") {
  const safeTitle = String(title || "").trim() || "Detalle";
  return `<section class="portal-detail-highlight" aria-label="${escapeAttr(safeTitle)}">
    <h4 class="portal-detail-highlight__title">${IC[iconKey] || ""}<span>${escapeHtml(safeTitle)}</span></h4>
    <div class="portal-detail-highlight__body">${bodyHtml}</div>
  </section>`;
}

function portalDetailComposeModal(parts = {}) {
  const hero = String(parts.heroHtml || "").trim();
  const tiles = String(parts.tilesHtml || "").trim();
  const highlight = String(parts.highlightHtml || "").trim();
  const sections = String(parts.sectionsHtml || "").trim();
  const extra = String(parts.extraHtml || "").trim();
  return `<div class="portal-detail-modal">
    ${hero}
    ${tiles ? `<div class="portal-detail-tiles">${tiles}</div>` : ""}
    ${highlight}
    ${sections}
    ${extra}
  </div>`;
}

function openPortalDetailSheet(opts = {}) {
  openDetailViewSheet({
    title: opts.title || "Detalle",
    sheetTitle: opts.sheetTitle || opts.title || "Detalle",
    subtitle: opts.subtitle || "",
    subtitleHtml: opts.subtitleHtml || "",
    statusHtml: opts.statusHtml || "",
    moduleIcon: opts.moduleIcon || "activity",
    moduleTone: opts.moduleTone || "blue",
    cardsHtml: opts.cardsHtml || "",
    cards: opts.cards,
    pairs: opts.pairs,
    sections: opts.sections,
    notesHtml: opts.notesHtml || "",
    extraHtml: opts.extraHtml || opts.highlightHtml || "",
    wide: opts.wide,
    secondaryActionsHtml: opts.secondaryActionsHtml || "",
    afterMount: opts.afterMount,
    extraModalCardClass: opts.extraModalCardClass || ""
  });
}

function openDriverDetailSheetModal(driver) {
  if (!driver) return;
  const d = normalizeDriverRowForEditor(driver) || driver;
  const company = getCompanyById(d.companyId);
  const companyName = String(company?.name || "").trim();
  const avatarCss = employeeAvatarCssUrl(d.photoUrl);
  const avatarUrlRaw = String(d.photoUrl || "").trim();
  const avatarHero = avatarCss
    ? `<div class="portal-detail-logo portal-detail-logo--avatar"><img src="${escapeAttr(avatarUrlRaw)}" alt="" loading="lazy" decoding="async" /></div>`
    : `<div class="portal-detail-logo portal-detail-logo--avatar portal-detail-logo--fallback" aria-hidden="true"><span>${escapeHtml(
        (String(d.name || "C").charAt(0) || "C").toUpperCase()
      )}</span></div>`;
  const buildDateChip = (rawValue, missingLabel = "Sin fecha", warnDays = 60) => {
    const ymd = normalizePortalDateYmd(rawValue);
    if (!ymd) {
      return {
        bucket: "missing",
        label: missingLabel,
        chipHtml: `<span class="status status-pendiente">${escapeHtml(missingLabel)}</span>`
      };
    }
    const days = daysUntil(ymd);
    if (days < 0) {
      return {
        bucket: "expired",
        label: `Vencida hace ${Math.abs(days)}d`,
        chipHtml: '<span class="status status-rechazada">Vencida</span>'
      };
    }
    if (days <= warnDays) {
      const label = days === 0 ? "Vence hoy" : `Vence en ${days}d`;
      return {
        bucket: "warning",
        label,
        chipHtml: `<span class="status status-pendiente">${escapeHtml(label)}</span>`
      };
    }
    return {
      bucket: "ok",
      label: `Vigente · ${days}d`,
      chipHtml: '<span class="status status-viaje_asignado">Vigente</span>'
    };
  };
  const licenseMeta = buildDateChip(d.licenseExpiry, "Sin fecha");
  const courseMeta = (() => {
    const raw = String(d.defensiveCourse || "").trim().toLowerCase();
    if (raw === "no_aplica") {
      return {
        bucket: "ok",
        label: "No aplica",
        chipHtml: '<span class="status status-viaje_asignado">No aplica</span>'
      };
    }
    if (raw === "vencido") {
      return {
        bucket: "expired",
        label: "Curso vencido",
        chipHtml: '<span class="status status-rechazada">Vencido</span>'
      };
    }
    if (raw === "vigente") return buildDateChip(d.defensiveCourseExpiry, "Sin fecha");
    if (!raw && !d.defensiveCourseExpiry) {
      return {
        bucket: "missing",
        label: "Sin registro",
        chipHtml: '<span class="status status-pendiente">Sin registro</span>'
      };
    }
    return buildDateChip(d.defensiveCourseExpiry, "Sin registro");
  })();
  const driverTrips = getActiveTrips().filter((trip) => String(trip.trip?.driverId || "") === String(d.id || ""));
  const nowTs = Date.now();
  const occupancy = (() => {
    if (isManuallyUnavailable(d)) return { tone: "offline", detail: "Marcado manualmente como no disponible", trip: null };
    if (!driverTrips.length) return { tone: "available", detail: "Sin viaje activo", trip: null };
    const ongoing = driverTrips.find((trip) => describeTripTimingVsNow(trip, nowTs).timing === "ongoing") || null;
    if (ongoing) {
      const left = describeTripTimingVsNow(ongoing, nowTs).minutes;
      return {
        tone: "busy",
        trip: ongoing,
        detail: `En curso · ${left != null ? `${left} min restantes` : "Horario en curso"}`
      };
    }
    const upcoming = driverTrips
      .map((trip) => ({ trip, info: describeTripTimingVsNow(trip, nowTs) }))
      .filter((item) => item.info.timing === "upcoming")
      .sort((a, b) => parseNum(a.info.minutes) - parseNum(b.info.minutes))[0];
    if (upcoming) {
      return {
        tone: "scheduled",
        trip: upcoming.trip,
        detail: `Reservado · inicia en ${upcoming.info.minutes} min`
      };
    }
    return { tone: "available", detail: "Sin cruce horario activo", trip: driverTrips[0] || null };
  })();
  const availabilityTag =
    occupancy.tone === "offline"
      ? '<span class="status status-fleet-offline">No disponible</span>'
      : occupancy.tone === "busy"
        ? '<span class="status status-fleet-ocupado">Ocupado</span>'
        : occupancy.tone === "scheduled"
          ? '<span class="status status-fleet-programado">Reservado</span>'
          : '<span class="status status-fleet-disponible">Disponible</span>';
  const comparendos = Math.max(0, parseNum(d.comparendos || 0));
  const comparendosTag =
    comparendos > 0
      ? `<span class="driver-doc-pill driver-doc-pill--warning">${comparendos} comparendo${comparendos === 1 ? "" : "s"}</span>`
      : "";
  const phoneDisp = d.phone ? formatPortalPhoneForDisplay(String(d.phone)) : "";
  const rawPhone = String(d.phone || "").trim();
  const telDigits = rawPhone.replace(/\D/g, "");
  const telHref = telDigits.length >= 6 ? `tel:${telDigits}` : "";
  const phoneValue = phoneDisp ? escapeHtml(phoneDisp) : `<span class="muted">Sin teléfono</span>`;
  const phoneBlock = telHref
    ? portalDetailTileMarkup(IC.phone, "Teléfono", phoneValue, { href: telHref })
    : portalDetailTileMarkup(IC.phone, "Teléfono", phoneValue, { muted: !phoneDisp });
  const companyValue = companyName ? escapeHtml(companyName) : `<span class="muted">Sin empresa</span>`;
  const companyBlock = portalDetailTileMarkup(IC.briefcase, "Empresa", companyValue, { muted: !companyName });
  const licenseBlock = portalDetailTileMarkup(
    IC.file,
    "Licencia",
    escapeHtml(`${String(d.license || "Sin licencia")} · ${String(d.licenseCategory || "Sin categoría")}`),
    { muted: !d.license }
  );
  const emergencyValue = String(d.emergencyPhone || "").trim()
    ? escapeHtml(String(d.emergencyPhone || "").trim())
    : `<span class="muted">Sin teléfono</span>`;
  const emergencyBlock = portalDetailTileMarkup(IC.heart, "Emergencia", emergencyValue, {
    muted: !String(d.emergencyPhone || "").trim()
  });
  const tripTitle = occupancy.trip
    ? `Viaje ${escapeHtml(String(occupancy.trip.trip?.tripNumber || "-"))}`
    : occupancy.tone === "offline"
      ? "Fuera de operación"
      : "Disponible para asignación";
  const tripSub = occupancy.trip
    ? `${escapeHtml(String(occupancy.trip.clientName || occupancy.trip.companyName || "-"))} · ${escapeHtml(String(occupancy.detail || ""))}`
    : escapeHtml(String(occupancy.detail || "Sin viaje activo"));
  const sections = [
    {
      icon: "user",
      title: "Datos personales",
      rows: portalDetailRenderRows([
        ["Nombre", `<strong>${escapeHtml(String(d.name || "-"))}</strong>`],
        ["Documento", escapeHtml(String(d.idDoc || "-"))],
        ["Teléfono", escapeHtml(String(d.phone || "-"))],
        ["Tipo de sangre", escapeHtml(String(d.bloodType || "-"))],
        ["Contacto emergencia", escapeHtml(String(d.emergencyContact || "-"))],
        ["Tel. emergencia", escapeHtml(String(d.emergencyPhone || "-"))],
        ["Empresa", escapeHtml(String(companyName || "-"))]
      ])
    },
    {
      icon: "file",
      title: "Licencia y formación",
      rows: portalDetailRenderRows([
        ["N° licencia", escapeHtml(String(d.license || "-"))],
        ["Categoría", escapeHtml(String(d.licenseCategory || "-"))],
        ["Vence licencia", `${fmtDateOr(d.licenseExpiry)} ${licenseMeta.chipHtml}`],
        ["Examen ocupacional", fmtDateOr(d.occupationalExamDate)],
        ["Vence examen ocupacional", fmtDateOr(d.occupationalExamExpiry)],
        ["Examen instruvial", fmtDateOr(d.instruvialExamDate)],
        ["Vence examen instruvial", fmtDateOr(d.instruvialExamExpiry)],
        ["Curso defensivo", `${escapeHtml(String(d.defensiveCourse || "-"))} ${courseMeta.chipHtml}`],
        ["Vence curso defensivo", fmtDateOr(d.defensiveCourseExpiry)],
        ["Años experiencia", String(parseNum(d.experienceYears || 0))]
      ])
    },
    {
      icon: "shield",
      title: "Seguridad social y disciplina",
      rows: portalDetailRenderRows([
        ["EPS", escapeHtml(String(d.eps || "-"))],
        ["ARL", escapeHtml(String(d.arl || "-"))],
        ["Comparendos pendientes", String(parseNum(d.comparendos || 0))],
        ["Estado operativo", availabilityTag],
        ["Última actualización", fmtDateOr(d.updatedAt || d.createdAt)]
      ])
    }
  ];
  const heroHtml = `<div class="portal-detail-hero">
    ${avatarHero}
    <div class="portal-detail-hero-main">
      <p class="portal-detail-eyebrow">${IC.user} Conductor operativo</p>
      <div class="portal-detail-badges">${availabilityTag} ${licenseMeta.chipHtml} ${comparendosTag}</div>
      <p class="portal-detail-meta"><span class="muted">Documento</span> <strong>${escapeHtml(String(d.idDoc || "Sin documento"))}</strong></p>
      <ul class="portal-detail-stats" aria-label="Resumen">
        <li><strong>${companyName ? escapeHtml(companyName) : "—"}</strong><span>Empresa</span></li>
        <li><strong>${escapeHtml(String(d.licenseCategory || "—"))}</strong><span>Categoría</span></li>
        <li><strong>${escapeHtml(`${parseNum(d.experienceYears || 0)} año${parseNum(d.experienceYears || 0) === 1 ? "" : "s"}`)}</strong><span>Experiencia</span></li>
      </ul>
    </div>
  </div>`;
  const highlightHtml = portalDetailHighlightHtml(
    "Operación actual",
    `<p class="portal-detail-loc-line"><strong>${tripTitle}</strong></p><p class="portal-detail-loc-sub muted">${IC.clock} ${tripSub}</p>`,
    "truck"
  );
  openPortalDetailSheet({
    title: `Conductor ${String(d.name || "")}`,
    sheetTitle: String(d.name || "Conductor"),
    subtitleHtml: `${IC.briefcase} ${escapeHtml(companyName || "Sin empresa")}`,
    statusHtml: `${availabilityTag} ${licenseMeta.chipHtml}`,
    moduleIcon: "user",
    moduleTone: "purple",
    extraHtml: detailViewCardMarkup({
      iconKey: "truck",
      label: "Operación actual",
      valueHtml: `<strong>${tripTitle}</strong>`,
      tone: "blue",
      full: true,
      subHtml: tripSub
    }),
    sections: [
      {
        icon: "phone",
        pairs: [
          ["Teléfono", phoneDisp ? escapeHtml(phoneDisp) : '<span class="muted">Sin teléfono</span>'],
          ["Empresa", companyName ? escapeHtml(companyName) : '<span class="muted">Sin empresa</span>'],
          ["Licencia", `${escapeHtml(String(d.licenseCategory || "—"))} · ${licenseMeta.chipHtml}`],
          ["Emergencia", emergencyValue]
        ]
      },
      {
        icon: "user",
        pairs: [
          ["Documento", `<strong>${escapeHtml(String(d.idDoc || "Sin documento"))}</strong>`],
          ["Categoría licencia", escapeHtml(String(d.licenseCategory || "—"))],
          ["Vence licencia", `${fmtDateOr(d.licenseExpiry)} ${licenseMeta.chipHtml}`],
          ["Curso defensivo", `${escapeHtml(String(d.defensiveCourse || "—"))} ${courseMeta.chipHtml}`],
          ["Experiencia", `${parseNum(d.experienceYears || 0)} año(s)`],
          ["Vehículos que conduce", escapeHtml(driverVehicleTypesCsvToLabel(d.vehicleTypes, "Sin definir"))]
        ]
      },
      {
        icon: "shield",
        pairs: [
          ["EPS", escapeHtml(String(d.eps || "-"))],
          ["ARL", escapeHtml(String(d.arl || "-"))],
          ["Comparendos pendientes", String(parseNum(d.comparendos || 0))],
          ["Estado operativo", availabilityTag],
          ["Última actualización", fmtDateOr(d.updatedAt || d.createdAt)]
        ]
      }
    ],
    secondaryActionsHtml: isAdminActor()
      ? `<button type="button" class="btn btn-action" data-driver-sheet-action="edit">${IC.edit} Editar conductor</button>`
      : "",
    afterMount: (contentEl) => {
      contentEl.querySelector("[data-driver-sheet-action='edit']")?.addEventListener("click", () => {
        document.getElementById("crud-modal")?.classList.add("hidden");
        nodes.viewRoot?.querySelector(`[data-action='edit-driver'][data-id="${escapeAttr(String(d.id || ""))}"]`)?.click();
      });
    }
  });
}

function togglePortalDriverManualAvailability(driverId) {
  const target = findPortalDriverById(driverId);
  if (!target) {
    notify("No se encontró el conductor. Actualice la página.", "error");
    return;
  }
  if (target.autoBusy) {
    notify(
      "Este conductor está en un viaje activo. La disponibilidad se ajustará al finalizar el viaje.",
      "info"
    );
    return;
  }
  const name = String(target.name || "Conductor").trim();
  const markingUnavailable = !isManuallyUnavailable(target);
  openConfirmModal({
    title: "Cambiar disponibilidad",
    message: markingUnavailable
      ? `¿Marcar a ${name} como no disponible manualmente? No se ofrecerá en asignaciones hasta reactivarlo.`
      : `¿Marcar a ${name} como disponible nuevamente?`,
    confirmText: markingUnavailable ? "Marcar no disponible" : "Marcar disponible",
    onConfirm: async () => {
      try {
        const ok = await setDriverAvailability(target.id, !markingUnavailable);
        if (!ok) {
          notify("No fue posible actualizar la disponibilidad.", "error");
          return;
        }
        notify(
          markingUnavailable ? `${name} marcado como no disponible.` : `${name} marcado como disponible.`,
          "success"
        );
        renderPortalView();
      } catch (err) {
        notify(String(err?.message || "No fue posible actualizar la disponibilidad."), "error");
      }
    }
  });
}


async function approveRequest(
  requestId,
  actorName = "Sistema",
  auto = false,
  selectedVehicleId = "",
  selectedDriverId = "",
  selectedTripValue = null,
  options = {}
) {
  const requests = reqRead();
  const current = requests.find((r) => r.id === requestId);
  const canAssignTrip = current && [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(current.status);
  if (!current || !canAssignTrip) return false;
  if (!auto && !isRequestPickupSameDayOrFuture(current)) {
    notify(userMessage("assignPastRequestDate"), "error");
    return false;
  }

  if (auto) {
    if (
      current.status === STATUS.APROBADA_PENDIENTE_ASIGNACION ||
      String(current.approvedAt || "").trim()
    ) {
      return true;
    }
    const systemTimerApprove = String(actorName || "").trim() === "Sistema";
    const mapped = requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: STATUS.APROBADA_PENDIENTE_ASIGNACION,
            approvedAt: nowIso(),
            approvedBy: actorName,
            autoApproved: systemTimerApprove,
            rejectionReason: ""
          }
        : r
    );
    try {
      const updatedRow = mapped.find((r) => r.id === requestId);
      await reqWriteAwait(mapped, updatedRow);
    } catch (err) {
      if (typeof notify === "function") {
        notify(String(err?.message || "No fue posible guardar la aprobación en el servidor."), "error");
      }
      return false;
    }
    const targetUser = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
    if (targetUser) {
      saveNotification({
        userId: targetUser.id,
        title: systemTimerApprove ? "Solicitud aprobada automáticamente" : "Solicitud aprobada",
        body: systemTimerApprove
          ? `Su solicitud ${current.requestNumber || current.id} fue aprobada por el tiempo de respuesta configurado y queda pendiente de asignación de viaje.`
          : `Su solicitud ${current.requestNumber || current.id} fue aprobada y queda pendiente de asignación de viaje.`,
        category: "authorization",
        deepLink: "#portal/requests",
        entityType: "transport_request",
        entityId: String(current.id || requestId)
      });
      try {
        if (typeof globalThis.refreshNotificationsFromServer === "function") {
          await globalThis.refreshNotificationsFromServer();
        }
      } catch (_e) {}
    }
    return true;
  }

  const allowApproveAndAssign = Boolean(options.allowApproveAndAssign);
  if (current.status === STATUS.PENDIENTE && !allowApproveAndAssign) {
    notify(userMessage("requestMustBeApprovedBeforeAssign"), "error");
    return false;
  }
  const actor = currentUser();
  if (
    actor &&
    !allowApproveAndAssign &&
    !canViewAllTransportRequests(actor) &&
    !transportRequestBelongsToUserScope(current, actor)
  ) {
    notify(userMessage("requestAssignOutOfScope"), "error");
    return false;
  }

  const compatibleVehicles = getCompatibleVehiclesForRequest(current, requestId);
  const compatibleDrivers = getCompatibleDriversForRequest(current, requestId);

  const schedPickup = requestSchedulingPickupIso(current);
  const schedDelivery = requestSchedulingDeliveryIso(current);
  const vehicle = selectedVehicleId
    ? compatibleVehicles.find((item) => item.id === selectedVehicleId) || null
    : selectBestVehicle(
      parseNum(current.weightKg),
      schedPickup,
      schedDelivery,
      requestId,
      { requiresRefrigeration: requestRequiresTermoking(current), request: current }
    );
  const driver = selectedDriverId
    ? compatibleDrivers.find((item) => item.id === selectedDriverId) || null
    : selectDriver(schedPickup, schedDelivery, requestId);

  if (!vehicle || !driver) {
    const vid = String(selectedVehicleId || "").trim();
    const did = String(selectedDriverId || "").trim();
    const vplate = vid
      ? String(read(KEYS.vehicles, []).find((v) => v.id === vid)?.plate || "").trim().toUpperCase()
      : "";
    const dname = did
      ? String(read(KEYS.drivers, []).find((d) => d.id === did)?.name || "")
          .trim()
          .toLowerCase()
      : "";
    if (
      notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "vehículo", (t) => {
        if (vid && t.vehicleId) return String(t.vehicleId).trim() === vid;
        if (vplate) return String(t.vehiclePlate || "").trim().toUpperCase() === vplate;
        return false;
      })
    ) {
      return false;
    }
    if (
      notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "conductor", (t) => {
        if (did && t.driverId) return String(t.driverId).trim() === did;
        if (dname) return String(t.driverName || "").trim().toLowerCase() === dname;
        return false;
      })
    ) {
      return false;
    }
    notify(userMessage("noCompatibleResources"), "error");
    return false;
  }

  const usedTripNumbers = new Set(
    requests.map((request) => String(request.trip?.tripNumber || "").trim()).filter(Boolean)
  );
  invalidateTransportScheduleBusyCache();
  const trip = {
    id: newUuidV4(),
    tripNumber: makeTripNumber(usedTripNumbers),
    vehicleId: vehicle.id,
    vehiclePlate: vehicle ? vehicle.plate : "SIN-DISP",
    vehicleType: vehicle ? vehicle.type : "Por definir",
    driverId: driver.id,
    driverName: driver ? driver.name : "Por definir",
    driverPhone: driver ? driver.phone : "-",
    route: formatRoute(current),
    etaPickup: schedPickup || current.pickupAt || "",
    etaDelivery: schedDelivery || current.etaDelivery || current.pickupAt || "",
    assignedBy: actorName,
    assignedAt: nowIso(),
    realtimeStatus: STATUS.VIAJE_ASIGNADO,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  const next = requests.map((r) =>
    r.id === requestId
      ? {
          ...r,
          tripValue: parseNum(selectedTripValue ?? r.tripValue),
          status: STATUS.VIAJE_ASIGNADO,
          approvedAt: nowIso(),
          approvedBy: actorName,
          autoApproved: auto,
          rejectionReason: "",
          trip
        }
      : r
  );
  const updatedRow = next.find((r) => r.id === requestId);
  try {
    await reqWriteAwait(next, updatedRow);
  } catch (_e) {
    globalThis.reqWrite?.(requests);
    if (typeof notify === "function") {
      notify(
        String(_e?.message || "No fue posible guardar el viaje en el servidor. Recargue y verifique."),
        "error"
      );
    }
    return false;
  }

  try {
    const tripFields = historyAuditTripAssignFields(current, actorName);
    logPortalAuditEvent("trips", "create", {
      entityId: String(requestId),
      entityLabel: String(trip.tripNumber || "Viaje"),
      summary: `${String(trip.vehiclePlate || "Sin camión")} · ${String(trip.driverName || "Sin conductor")}`,
      actor: tripFields.actor,
      actorEmail: tripFields.actorEmail,
      actorUserId: tripFields.actorUserId,
      usuario: tripFields.usuario
    });
    logPortalAuditEvent("requests", "update", {
      entityId: String(requestId),
      entityLabel: String(current.requestNumber || "Solicitud"),
      summary: `Viaje asignado · ${String(trip.tripNumber || "")}`,
      actor: tripFields.actor,
      actorEmail: tripFields.actorEmail,
      actorUserId: tripFields.actorUserId,
      usuario: tripFields.usuario
    });
  } catch (_audit) {
    /* noop */
  }

  const users = read(KEYS.users, []);
  const target = users.find((u) => u.id === current.clientUserId);
  if (target) {
    saveNotification({
      userId: target.id,
      title: "Viaje asignado",
      body: `Se asignó el viaje ${trip.tripNumber} a su solicitud ${current.requestNumber || current.id}. Vehículo ${trip.vehiclePlate} · Conductor ${trip.driverName}.`
    });
    sendEmail({
      to: target.email,
      subject: "Viaje asignado - Antares",
      body: `Viaje ${trip.tripNumber} · Vehículo ${trip.vehiclePlate} · Conductor ${trip.driverName}`
    });
    try {
      if (typeof globalThis.refreshNotificationsFromServer === "function") {
        await globalThis.refreshNotificationsFromServer();
      }
      await writeAwaitServerLatestQueuedEmail();
    } catch (_e) {}
  }
  return true;
}

async function rejectRequest(requestId, reason, actorName) {
  const requests = reqRead();
  const current = requests.find((r) => r.id === requestId);
  if (!current) return;
  const snapshot = buildPortalAuditActorSnapshot();
  const next = requests.map((r) =>
    r.id === requestId
      ? { ...r, status: STATUS.RECHAZADA, approvedAt: nowIso(), approvedBy: actorName, rejectionReason: reason }
      : r
  );
  const updatedRow = next.find((r) => r.id === requestId);
  await reqWriteAwait(next, updatedRow);
  const actor = historyAuditActorLabel(snapshot.label, actorName, snapshot.email);
  const usuario = historyAuditFormatStoredUsuario(actor, snapshot.email, snapshot.userId);
  logPortalAuditEvent("requests", "update", {
    entityId: String(requestId),
    entityLabel: String(current.requestNumber || "Solicitud"),
    summary: `Solicitud rechazada · ${String(reason || "Sin motivo")}`,
    actor,
    actorEmail: snapshot.email,
    actorUserId: snapshot.userId,
    usuario
  });

  const user = read(KEYS.users, []).find((u) => u.id === current.clientUserId);
  if (user) {
    saveNotification({ userId: user.id, title: "Solicitud rechazada", body: `Su solicitud fue rechazada. Motivo: ${reason}` });
    sendEmail({ to: user.email, subject: "Solicitud rechazada", body: reason });
    try {
      if (typeof globalThis.refreshNotificationsFromServer === "function") {
        await globalThis.refreshNotificationsFromServer();
      }
      await writeAwaitServerLatestQueuedEmail();
    } catch (_e) {}
  }
}

async function updateAutoApprove() {
  return window.AntaresViajesDomain.runPendingTransportAutoApprove(approveRequest, { PENDIENTE: STATUS.PENDIENTE });
}

function minutesRemaining(createdAt) {
  const left = AUTO_APPROVE_MINUTES - diffMinutes(createdAt);
  return Math.max(0, Math.ceil(left));
}

function formatPortalRoleLabel(role) {
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

/** Documento/NIT mostrado en UI (bootstrap expone `taxId`, `personalDoc` o legado `idDoc`). */
function portalUserDocumentValue(user) {
  if (!user) return "";
  return String(user.taxId || user.personalDoc || user.personalTaxId || user.idDoc || "").trim();
}

/** Nombre de empresa para tarjetas y Mi perfil. */
function portalUserCompanyDisplay(user) {
  if (!user) return "-";
  const cid = String(user.companyId || "").trim();
  if (cid) {
    const fromCatalog = String(getCompanyById(cid)?.name || "").trim();
    if (fromCatalog) return fromCatalog;
  }
  const fromUser = String(user.company || "").trim();
  return fromUser || "-";
}

function portalProfileEmergencyFilled(user) {
  return Boolean(
    String(user?.emergencyContact || "").trim() && String(user?.emergencyPhone || "").trim()
  );
}

/** Falta algún dato de emergencia (nombre, teléfono o parentesco). */
function portalProfileEmergencyNeedsEnrichment(user) {
  if (!user) return true;
  return (
    !String(user.emergencyContact || "").trim() ||
    !String(user.emergencyPhone || "").trim() ||
    !String(user.emergencyRelationship || user.emergencyRelation || "").trim()
  );
}

function portalProfileEnrichmentChanged(before, after) {
  if (!after?.id) return false;
  const keys = [
    "emergencyContact",
    "emergencyPhone",
    "emergencyRelation",
    "emergencyRelationship",
    "phone",
    "birthDate",
    "city",
    "department"
  ];
  return keys.some(
    (k) => !String(before?.[k] ?? "").trim() && String(after?.[k] ?? "").trim()
  );
}

function portalUserPayrollMatchKey(user, employee) {
  const doc = portalUserDocumentValue(user).replace(/\D/g, "");
  const eDoc = String(employee?.idDoc || "").replace(/\D/g, "");
  const email = String(user?.email || "").trim().toLowerCase();
  const eMail = String(employee?.personalEmail || "").trim().toLowerCase();
  const foldName = (s) => String(s || "").trim().toUpperCase().replace(/\s+/g, " ");
  const uName = foldName(getPortalUserDisplayName(user));
  const eName = foldName(employee?.name);
  return (
    (doc.length >= 5 && eDoc === doc) ||
    (email && eMail && eMail === email) ||
    (uName.length >= 6 && eName === uName)
  );
}

/**
 * Si el usuario portal no tiene contacto de emergencia, toma los datos de su ficha en nómina
 * (documento, correo personal o nombre completo) ya cargada en caché por bootstrap.
 */
function enrichPortalUserFromPayrollCache(user) {
  if (!user || typeof user !== "object") return user;
  if (!portalProfileEmergencyNeedsEnrichment(user)) return user;

  const employees = read(KEYS.payrollEmployees, []);
  const match = employees.find((e) => portalUserPayrollMatchKey(user, e));
  if (!match) return user;

  const emergencyRelation = String(
    user.emergencyRelation || user.emergencyRelationship || match.emergencyRelation || ""
  ).trim();

  return {
    ...user,
    emergencyContact: String(user.emergencyContact || match.emergencyContact || "").trim(),
    emergencyPhone: String(user.emergencyPhone || match.emergencyPhone || "").trim(),
    emergencyRelation,
    emergencyRelationship: emergencyRelation,
    phone: String(user.phone || match.phone || "").trim(),
    birthDate: String(user.birthDate || match.birthDate || "").trim(),
    city: String(user.city || match.city || "").trim(),
    department: String(user.department || match.department || "").trim(),
    address: String(user.address || match.address || "").trim()
  };
}

/** Usuario listo para pintar Mi perfil (portal + respaldo nómina en caché). */
function resolvePortalProfileUser(user) {
  return enrichPortalUserFromPayrollCache(user);
}

/**
 * Hidrata la fila del usuario autenticado desde GET /portal/me (datos completos de BD).
 * Necesario porque el JWT y el profileSnapshot no incluyen teléfono, documento ni fechas.
 */
async function hydrateOwnProfileFromApi() {
  if (!portalCanRefreshFromApi()) return false;
  const api = window.AntaresApi;
  if (!api?.getJson) return false;
  try {
    const me = await api.getJson("/portal/me");
    if (me && me.id) {
      upsertPortalUserRowIntoCache(enrichPortalUserFromPayrollCache(me));
      syncSessionProfileSnapshotFromCache();
      return true;
    }
  } catch (err) {
    devWarn("Portal: GET /portal/me fallo.", err?.message || err);
  }
  const cur = currentUser();
  const local = enrichPortalUserFromPayrollCache(cur);
  if (local?.id && portalProfileEnrichmentChanged(cur, local)) {
    upsertPortalUserRowIntoCache(local);
    return true;
  }
  return false;
}

/** Etiqueta breve para chips en tarjetas (cabecera estrecha); el nombre completo va en `title`. */
function formatPortalRoleChipLabel(role) {
  const r = String(role || "").toLowerCase();
  if (r === ROLES.ADMIN) return "Admin";
  if (r === ROLES.CLIENT) return "Cliente";
  if (r === ROLES.RRHH) return "RRHH";
  if (r === ROLES.ADMINISTRACION) return "Administración";
  if (r === ROLES.AUXILIAR_ADMINISTRATIVO) return "Aux. adm.";
  if (r === ROLES.LIDER_ADMINISTRATIVO) return "Líder adm.";
  if (r === ROLES.LOGISTICA) return "Logística";
  return formatPortalRoleLabel(role);
}


/**
 * Alcance de solicitudes de transporte.
 * - Cliente: solo su empresa asignada (nunca otras); en vista individual solo sus propias solicitudes.
 * - Interno sin permiso global: solicitante o misma empresa.
 * @see `AntaresSolicitudesDomain.transportRequestBelongsToUserScope`
 */
function transportRequestBelongsToUserScope(request, user) {
  const SD = window.AntaresSolicitudesDomain;
  if (!SD || typeof SD.transportRequestBelongsToUserScope !== "function") return false;
  return SD.transportRequestBelongsToUserScope(request, user, getClientDataScope);
}

function getVisibleRequestsForUser(user) {
  const SD = window.AntaresSolicitudesDomain;
  if (!SD || typeof SD.filterVisibleTransportRequests !== "function") return [];
  const requests = reqRead();
  return SD.filterVisibleTransportRequests(requests, user, {
    getClientDataScope,
    canViewAllTransportRequests
  });
}

/**
 * Solicitudes visibles en Transporte · Viajes para asignar.
 * - Con permiso de aprobación: Pendiente o Aprobada pendiente asignación (flujo en un paso).
 * - Solo transport_trips: únicamente ya aprobadas.
 */
function pendingRequestsForTripAssignment(user) {
  const SD = window.AntaresSolicitudesDomain;
  if (!SD || typeof SD.filterPendingRequestsForTripAssignment !== "function") return [];
  const u = user || currentUser();
  const visible = getVisibleRequestsForUser(u);
  return SD.filterPendingRequestsForTripAssignment(visible, u, canApproveTransportRequests);
}

function canAssignTripFromViajesModule(request, user) {
  const SD = window.AntaresSolicitudesDomain;
  if (!SD || typeof SD.transportRequestEligibleForViajesAssignment !== "function") return false;
  return SD.transportRequestEligibleForViajesAssignment(request, user, canApproveTransportRequests);
}

function canViewAllTransportRequests(user) {
  if (!user) return false;
  if (isPortalClientUser(user)) return false;
  if (isAdminActor(user)) return true;
  const ops = [
    PERMISSIONS.TRANSPORT_TRIPS,
    PERMISSIONS.TRANSPORT_REQUESTS,
    PERMISSIONS.AUTHORIZATIONS_TRANSPORT,
    PERMISSIONS.AUTHORIZATIONS_MANAGE,
    PERMISSIONS.TRANSPORT_HISTORY,
    PERMISSIONS.TRANSPORT_CALENDAR,
    PERMISSIONS.TRANSPORT_DRIVERS,
    ...VEHICLE_GRANULAR_PERMISSIONS
  ];
  return ops.some((p) => hasPermission(user, p)) || canAccessVehiclesView(user);
}

function findPayrollEmployeeByIdDoc(idDoc) {
  const digits = normalizeDocumentDigits(idDoc);
  if (!digits) return null;
  return (
    read(KEYS.payrollEmployees, []).find(
      (employee) => normalizeDocumentDigits(employee?.idDoc) === digits
    ) || null
  );
}

/** Empleado GH → conductor de flota vinculado por número de documento (misma regla que API y syncDriverFromEmployee). */
function resolveDriverForEmployee(employee) {
  if (!employee) return null;
  const docDigits = normalizeDocumentDigits(employee.idDoc);
  if (!docDigits) return null;
  return (
    read(KEYS.drivers, []).find(
      (driver) => normalizeDocumentDigits(driver?.idDoc) === docDigits
    ) || null
  );
}

function abortUnlessAdminForFleetDriverEdit(reason = "driversManageForbidden") {
  if (canEditFleetDriverAsAdmin()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanCreateVehicle(reason = "vehiclesManageForbidden") {
  if (canCreateVehicle()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanEditVehicle(reason = "vehiclesManageForbidden") {
  if (canEditVehicle()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanToggleVehicleStatus(reason = "vehiclesManageForbidden") {
  if (canToggleVehicleStatus()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanDeleteVehicle(reason = "vehiclesManageForbidden") {
  if (canDeleteVehicle()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function requiresAdminHrApproval(role) {
  return [
    ROLES.RRHH,
    ROLES.ADMINISTRACION,
    ROLES.AUXILIAR_ADMINISTRATIVO,
    ROLES.LIDER_ADMINISTRATIVO
  ].includes(role);
}




/** Selector de empresa en nueva solicitud: obligatorio; cliente solo su empresa; admin elige de la lista. */

function directoryOpsToneFromSlug(slug) {
  const key = String(slug || "").trim().toLowerCase();
  if (["busy", "ocupado", "scheduled", "reservado", "pending", "warn", "warning"].includes(key)) return "warn";
  if (["offline", "no-disponible", "inactive", "expired", "alert", "fail"].includes(key)) return "alert";
  if (["available", "disponible", "ok", "active"].includes(key)) return "ok";
  return "neutral";
}

function summarizePayrollEmployeeForDirectory(emp) {
  const raw = normalizePayrollEmployeeRowDates(emp || {});
  const contract = computeEmployeeContractRenewalMeta(raw);
  const companyName = getCompanyById(raw.companyId)?.name || "Sin empresa";
  const isDriverSvc = employeeIsConductorServiceProvider(raw);
  const roleLabel = isDriverSvc
    ? "Conductor · prestación servicios"
    : String(raw.workerRole || "").toLowerCase() === "conductor"
      ? "Conductor"
      : "Empleado";
  const searchBlob = [
    raw.name,
    raw.idDoc,
    raw.position,
    raw.contractType,
    raw.costCenter,
    companyName,
    roleLabel
  ]
    .map((v) => String(v || "").toLowerCase())
    .join(" ");
  return {
    raw,
    contract,
    companyName,
    roleLabel,
    isDriverSvc,
    searchBlob,
    transportCop: readEmployeeTransportAllowanceCop(raw),
    salaryCop: parseNum(raw.baseSalary)
  };
}

function payrollEmployeeContractTypeKey(employee) {
  const e = employee || {};
  if (isFixedTermContractType(e.contractType)) return "fixed";
  if (employeeIsConductorServiceProvider?.(e)) return "services";
  if (/indefinid/i.test(String(e.contractType || ""))) return "indefinite";
  return "other";
}

function payrollEmployeeContractStatusDisplay(contract) {
  if (!contract?.applies) {
    return { label: "Indefinido", tone: "neutral", slug: "indefinite" };
  }
  const slug = String(contract.statusSlug || "");
  if (slug === "expired") return { label: "Vencido", tone: "alert", slug };
  if (slug === "notice_window") return { label: "Por vencer", tone: "warn", slug };
  if (slug === "active") return { label: "Vigente", tone: "ok", slug };
  if (slug === "unknown") return { label: "Sin fecha", tone: "warn", slug };
  return { label: String(contract.pillLabel || "—"), tone: "neutral", slug: slug || "all" };
}

function renderPayrollEmployeeTableIdentity(item) {
  const e = item.raw;
  const avCss = employeeAvatarCssUrl(e.avatarUrl);
  const initials = String(e.name || "E")
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
  const docLine = `${String(e.documentType || "").trim()} ${String(e.idDoc || "").trim()}`.trim() || "—";
  const avatarStyle = avCss ? ` style="background-image:url('${avCss}')"` : "";
  return `<div class="payroll-contracts-person">
    <div class="payroll-contracts-person__avatar${avCss ? " payroll-contracts-person__avatar--photo" : ""}"${avatarStyle} aria-hidden="true">${avCss ? "" : escapeHtml(initials)}</div>
    <div class="payroll-contracts-person__copy">
      <strong>${escapeHtml(String(e.name || "Colaborador"))}</strong>
      <span class="muted">${escapeHtml(docLine)}</span>
    </div>
  </div>`;
}

function renderPayrollEmployeeContractIconActions(e, contract, hrAdminDeletes) {
  const id = escapeAttr(String(e.id || ""));
  const canAct =
    contract?.applies &&
    isFixedTermContractType(e.contractType) &&
    (contract.statusSlug === "notice_window" ||
      contract.statusSlug === "expired" ||
      contract.statusSlug === "active");
  return `<div class="payroll-contracts-icon-actions">
    <button type="button" class="payroll-contracts-icon-btn payroll-contracts-icon-btn--view" data-action="view-employee" data-id="${id}" title="Ver perfil">${IC.eye}</button>
    <button type="button" class="payroll-contracts-icon-btn payroll-contracts-icon-btn--edit" data-action="edit-employee" data-id="${id}" title="Editar">${IC.edit}</button>
    ${
      canAct
        ? `<button type="button" class="payroll-contracts-icon-btn payroll-contracts-icon-btn--renew" data-action="renew-employee-contract" data-id="${id}" title="Renovar contrato">${IC.rotateCcw}</button>
    <button type="button" class="payroll-contracts-icon-btn payroll-contracts-icon-btn--notify" data-action="non-renew-employee-contract" data-id="${id}" title="Aviso de no renovación">${IC.mail}</button>`
        : ""
    }
    ${hrAdminDeletes ? `<button type="button" class="payroll-contracts-icon-btn payroll-contracts-icon-btn--delete" data-action="delete-employee" data-id="${id}" title="Eliminar">${IC.trash}</button>` : ""}
  </div>`;
}

function renderPayrollContractActionButtons(e, contract, { compact = false } = {}) {
  if (!contract?.applies || !isFixedTermContractType(e.contractType)) return "";
  const canAct =
    contract.statusSlug === "notice_window" ||
    contract.statusSlug === "expired" ||
    contract.statusSlug === "active";
  if (!canAct) return "";
  const id = escapeAttr(String(e.id || ""));
  const renewLabel = compact ? "" : " Renovar";
  const nonRenewLabel = compact ? "" : " No renovar";
  return `<div class="payroll-contract-actions" role="group" aria-label="Acciones de contrato">
    <button type="button" class="btn btn-sm payroll-contract-btn payroll-contract-btn--renew" data-action="renew-employee-contract" data-id="${id}" title="Renovar contrato">${IC.rotateCcw}${renewLabel}</button>
    <button type="button" class="btn btn-sm payroll-contract-btn payroll-contract-btn--non-renew" data-action="non-renew-employee-contract" data-id="${id}" title="Carta de no renovación (CST art. 47)">${IC.mail}${nonRenewLabel}</button>
  </div>`;
}

function renderPayrollEmployeeDirectoryCard(item, hrAdminDeletes, { compact = false } = {}) {
  const e = item.raw;
  const contract = item.contract;
  const avCss = employeeAvatarCssUrl(e.avatarUrl);
  const initials = String(e.name || "E")
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
  const avatarInner = avCss ? `<img src="${escapeAttr(e.avatarUrl)}" alt="" loading="lazy" />` : initials;
  const avatarClass = avCss
    ? "directory-card__avatar directory-card__avatar--photo"
    : "directory-card__avatar";
  const statusSlug = contract.applies ? contract.statusSlug : "indefinite";
  const opsTone = directoryOpsToneFromSlug(
    contract.statusSlug === "notice_window" || contract.statusSlug === "expired"
      ? "alert"
      : contract.statusSlug === "unknown"
        ? "warn"
        : "ok"
  );
  const contractPillTone =
    contract.pillTone === "alert" ? "alert" : contract.pillTone === "warn" ? "warn" : "ok";
  const contractOps =
    contract.applies && contract.headline
      ? directoryOpsHtml(contract.headline, contract.detail, opsTone)
      : directoryOpsHtml(
          String(e.contractType || "Contrato"),
          e.contractDuration ? `Plazo: ${e.contractDuration}` : "Sin plazo definido",
          "neutral"
        );
  const selectHtml = hrAdminDeletes
    ? `<label class="directory-card__select" title="Seleccionar para eliminación masiva"><input type="checkbox" data-employee-select value="${escapeAttr(String(e.id))}" /><span class="muted">Sel.</span></label>`
    : "";
  const docLine = `${String(e.documentType || "").trim()} ${String(e.idDoc || "").trim()}`.trim() || "—";
  const showContractAlert =
    compact &&
    contract.applies &&
    (contract.statusSlug === "notice_window" || contract.statusSlug === "expired");
  const compactClass = compact ? " directory-card--compact" : "";
  if (compact) {
    // Índice de color de avatar (0-3) basado en hash del nombre — consistente entre renders
    let avColorIdx = 0;
    if (e.name) {
      let h = 0;
      for (let ci = 0; ci < e.name.length; ci++) h = ((h << 5) - h + e.name.charCodeAt(ci)) | 0;
      avColorIdx = Math.abs(h) % 4;
    }
    const smmlvRef =
      typeof CO_PAYROLL !== "undefined" && CO_PAYROLL?.smmlv ? CO_PAYROLL.smmlv : 1300000;
    const isSmmlv = item.salaryCop > 0 && item.salaryCop <= smmlvRef;
    const contractAlertBar = showContractAlert
      ? `<div class="payroll-emp-contract-alert${contract.statusSlug === "expired" ? " payroll-emp-contract-alert--expired" : ""}">${escapeHtml(contract.headline || contract.pillLabel || "Contrato requiere atención")}</div>`
      : "";
    return `<article class="directory-card portal-ops-card trip-ops-card directory-card--employee directory-card--compact directory-card--contract-${escapeAttr(statusSlug)}" data-employee-id="${escapeAttr(String(e.id || ""))}" data-employee-search="${escapeAttr(item.searchBlob)}" data-employee-contract-filter="${escapeAttr(contract.applies ? contract.statusSlug : "all")}">
    <div class="directory-card__compact-row">
      <div class="payroll-emp-avatar payroll-emp-avatar--${avColorIdx}" aria-hidden="true">${escapeHtml(initials)}</div>
      <div class="directory-card__compact-main">
        <h4 class="directory-card__title">${escapeHtml(String(e.name || "Colaborador"))}</h4>
        <p class="directory-card__subline">
          <span class="payroll-emp-role-chip">${escapeHtml(item.roleLabel)}</span>
          <span class="muted">${escapeHtml(docLine)}</span>
        </p>
      </div>
      <div class="directory-card__compact-meta">
        ${isSmmlv ? '<span class="payroll-emp-badge payroll-emp-badge--smmlv" title="Salario en el rango del SMMLV">SMMLV</span>' : ""}
        ${item.isDriverSvc ? '<span class="payroll-emp-badge payroll-emp-badge--driver">Prestación</span>' : ""}
        ${contract.applies ? directoryPillHtml(contract.pillLabel, contractPillTone) : ""}
        <span class="directory-card__salary payroll-emp-salary">$${item.salaryCop.toLocaleString("es-CO")}</span>
      </div>
      <div class="directory-card__compact-actions toolbar">
        <button type="button" class="btn btn-sm btn-action" data-action="payroll-employee-liquidations" data-id="${escapeAttr(String(e.id || ""))}" title="Historial de liquidaciones">${IC.dollar}${compact ? "" : " Nóminas"}</button>
        <button type="button" class="btn btn-sm btn-outline" data-action="view-employee" data-id="${escapeAttr(String(e.id))}" title="Perfil">${IC.eye}</button>
        <button type="button" class="btn btn-sm btn-action" data-action="edit-employee" data-id="${escapeAttr(String(e.id))}" title="Editar">${IC.edit}</button>
        ${renderPayrollContractActionButtons(e, contract, { compact })}
        <button type="button" class="btn btn-sm btn-outline" data-action="employee-generate-contract" data-id="${escapeAttr(String(e.id))}" title="Generar o descargar contrato Word">${IC.download}</button>
        ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-employee" data-id="${escapeAttr(String(e.id))}" title="Eliminar">${IC.trash}</button>` : ""}
        ${selectHtml}
      </div>
    </div>
    ${contractAlertBar}
  </article>`;
  }
  return `<article class="directory-card portal-ops-card trip-ops-card directory-card--employee directory-card--contract-${escapeAttr(statusSlug)}" data-employee-id="${escapeAttr(String(e.id || ""))}" data-employee-search="${escapeAttr(item.searchBlob)}" data-employee-contract-filter="${escapeAttr(contract.applies ? contract.statusSlug : "all")}">
    <header class="directory-card__head">
      <div class="directory-card__identity">
        <div class="${avatarClass}">${avatarInner}</div>
        <div class="directory-card__heading">
          <p class="directory-card__kicker">${escapeHtml(item.companyName)} · ${escapeHtml(item.roleLabel)}</p>
          <h4 class="directory-card__title">${escapeHtml(String(e.name || "Colaborador"))}</h4>
        </div>
      </div>
      <div class="directory-card__status-stack">
        ${item.isDriverSvc ? directoryPillHtml("Prestación servicios", "warn") : ""}
        ${contract.applies ? directoryPillHtml(contract.pillLabel, contractPillTone) : directoryPillHtml(String(e.contractType || "Contrato").slice(0, 24), "neutral")}
        ${selectHtml}
      </div>
    </header>
    ${contractOps}
    <div class="directory-card__metrics">
      ${directoryChipHtml("Salario", `$${item.salaryCop.toLocaleString("es-CO")}`)}
      ${directoryChipHtml("Aux. legal", `$${item.transportCop.toLocaleString("es-CO")}`)}
      ${directoryChipHtml("Ingreso", fmtDateOr(e.startDate, "—"))}
      ${isFixedTermContractType(e.contractType) ? directoryChipHtml("Renovación", fmtDateOr(e.renewalDate, "—")) : ""}
      ${directoryChipHtml("Fin contrato", contract.applies ? fmtDateOr(contract.endYmd, "—") : "N/A", contract.statusSlug === "notice_window" ? "warn" : "neutral")}
    </div>
    <dl class="directory-card__facts">
      ${directoryFactHtml("Documento", docLine)}
      ${directoryFactHtml("Cargo", String(e.position || "—"))}
      ${directoryFactHtml("Centro costos", String(resolvePayrollEmployeeCostCenter(e) || "—"))}
      ${directoryFactHtml("Tipo contrato", String(e.contractType || "—"))}
      ${contract.applies && contract.noticeDeadlineYmd ? directoryFactHtml("Aviso no renovación", fmtDateOr(contract.noticeDeadlineYmd), { tone: contract.statusSlug === "notice_window" ? "warn" : "neutral" }) : ""}
    </dl>
    <footer class="directory-card__actions">
      <button type="button" class="btn btn-sm btn-action" data-action="payroll-employee-liquidations" data-id="${escapeAttr(String(e.id || ""))}" title="Historial de liquidaciones">${IC.dollar} Nóminas</button>
      <button type="button" class="btn btn-sm btn-outline" data-action="view-employee" data-id="${escapeAttr(String(e.id))}">${IC.eye} Perfil</button>
      <button type="button" class="btn btn-sm btn-action" data-action="edit-employee" data-id="${escapeAttr(String(e.id))}">${IC.edit} Editar</button>
      ${renderPayrollContractActionButtons(e, contract)}
      <button type="button" class="btn btn-sm btn-outline" data-action="employee-generate-contract" data-id="${escapeAttr(String(e.id))}">${IC.file} Contrato</button>
      ${hrAdminDeletes ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-employee" data-id="${escapeAttr(String(e.id))}" title="Eliminar colaborador">${IC.trash}</button>` : ""}
    </footer>
  </article>`;
}

function renderPayrollEmployeeDirectoryTableRow(item, hrAdminDeletes) {
  const e = item.raw;
  const contract = item.contract;
  const status = payrollEmployeeContractStatusDisplay(contract);
  const statusSlug = contract.applies ? contract.statusSlug : "indefinite";
  const contractTypeKey = payrollEmployeeContractTypeKey(e);
  const endYmd = normalizePortalDateYmd(contract.endYmd || e.contractEndDate || "");
  const selectCell = hrAdminDeletes
    ? `<td class="payroll-contracts-table__check"><input type="checkbox" data-employee-select value="${escapeAttr(String(e.id || ""))}" aria-label="Seleccionar ${escapeAttr(String(e.name || "colaborador"))}" /></td>`
    : "";
  return `<tr class="payroll-employee-table-row payroll-employee-table-row--${escapeAttr(statusSlug)}" data-employee-id="${escapeAttr(String(e.id || ""))}" data-employee-search="${escapeAttr(item.searchBlob)}" data-employee-contract-filter="${escapeAttr(contract.applies ? contract.statusSlug : "all")}" data-employee-contract-type="${escapeAttr(contractTypeKey)}" data-employee-contract-end="${escapeAttr(endYmd)}">
    ${selectCell}
    <td class="payroll-employee-table-cell-main">${renderPayrollEmployeeTableIdentity(item)}</td>
    <td>${escapeHtml(String(e.position || "—"))}</td>
    <td>${fmtDateOr(e.startDate, "—")}</td>
    <td>${isFixedTermContractType(e.contractType) ? fmtDateOr(e.contractVigenteStartDate || e.startDate, "—") : "—"}</td>
    <td>${isFixedTermContractType(e.contractType) ? fmtDateOr(e.renewalDate, "—") : "—"}</td>
    <td>${isFixedTermContractType(e.contractType) ? fmtDateOr(e.nonRenewalNoticeDate, "—") : "—"}</td>
    <td>${contract.applies ? fmtDateOr(contract.endYmd || e.contractEndDate, "—") : "—"}</td>
    <td><span class="payroll-emp-contract-status payroll-emp-contract-status--${escapeAttr(status.tone)}">${escapeHtml(status.label)}</span></td>
    <td class="payroll-employee-table-cell-actions">${renderPayrollEmployeeContractIconActions(e, contract, hrAdminDeletes)}</td>
  </tr>`;
}

function wirePayrollEmployeeDirectoryFilters() {
  const searchEl = document.getElementById("payroll-employee-search");
  const filterEl = document.getElementById("payroll-employee-contract-filter");
  const typeEl = document.getElementById("payroll-employee-contract-type-filter");
  const dateEl = document.getElementById("payroll-employee-contract-date-filter");
  const rows = [
    ...document.querySelectorAll(".directory-card--employee"),
    ...document.querySelectorAll(".payroll-employee-table-row")
  ];
  if (!rows.length) return;
  const today = colombiaTodayIsoDate();
  const monthPrefix = today.slice(0, 7);
  const apply = () => {
    const q = String(searchEl?.value || "")
      .trim()
      .toLowerCase();
    const cf = String(filterEl?.value || "all");
    const tf = String(typeEl?.value || "all");
    const df = String(dateEl?.value || "all");
    rows.forEach((row) => {
      const blob = String(row.getAttribute("data-employee-search") || "");
      const slug = String(row.getAttribute("data-employee-contract-filter") || "all");
      const typeKey = String(row.getAttribute("data-employee-contract-type") || "all");
      const endYmd = normalizePortalDateYmd(row.getAttribute("data-employee-contract-end") || "");
      const matchQ = !q || blob.includes(q);
      const matchC = cf === "all" || slug === cf;
      const matchT = tf === "all" || typeKey === tf;
      let matchD = true;
      if (df !== "all" && endYmd) {
        if (df === "ends_month") matchD = endYmd.slice(0, 7) === monthPrefix;
        else if (df === "ends_30") {
          const a = new Date(`${today}T12:00:00`);
          const b = new Date(`${endYmd}T12:00:00`);
          const days =
            Number.isFinite(a.getTime()) && Number.isFinite(b.getTime())
              ? Math.round((b.getTime() - a.getTime()) / 86400000)
              : null;
          matchD = days != null && days >= 0 && days <= 30;
        } else matchD = false;
      } else if (df !== "all" && !endYmd) {
        matchD = false;
      }
      row.classList.toggle("is-filtered-out", !(matchQ && matchC && matchT && matchD));
    });
    window.syncPayrollEmployeeSelectionBadge?.();
  };
  searchEl?.addEventListener("input", apply);
  filterEl?.addEventListener("change", apply);
  typeEl?.addEventListener("change", apply);
  dateEl?.addEventListener("change", apply);
  apply();
}


function historyHaystack(request) {
  return `${request.requestNumber || request.id || ""} ${request.clientName || ""} ${formatRoute(request)} ${historyVehicleColumn(request)} ${historyDriverLabel(request)} ${historyPlateLabel(request)} ${request.trip?.tripNumber || ""} ${request.serviceType || ""}`
    .toLowerCase();
}

function historyDriverLabel(request) {
  const direct = String(request?.trip?.driverName || "").trim();
  if (direct) return direct;
  const id = String(request?.trip?.driverId || "").trim();
  if (!id) return "";
  const driver = read(KEYS.drivers, []).find((d) => String(d.id) === id);
  return String(driver?.name || "").trim();
}

function historyPlateLabel(request) {
  return String(request?.trip?.vehiclePlate || "").trim();
}

function historyTripValueCell(request) {
  const value = parseNum(request?.trip?.tripValue ?? request?.tripValue ?? 0);
  if (value <= 0) return '<span class="muted">—</span>';
  return `<span class="history-money">$${value.toLocaleString("es-CO")}</span>`;
}

function historyRouteCell(request) {
  const origin = String(request?.originCity || "").trim() || "—";
  const dest = String(request?.destinationCity || "").trim() || "—";
  const full = formatRoute(request);
  return `<span class="history-route" title="${escapeAttr(full)}"><span class="history-route-cities">${escapeHtml(origin)}</span><span class="history-route-arrow" aria-hidden="true">→</span><span class="history-route-cities">${escapeHtml(dest)}</span></span>`;
}

function historyStatusFilterOptions() {
  const groups = [
    { label: "En gestión", values: [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION] },
    { label: "En operación", values: [STATUS.VIAJE_ASIGNADO, STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY] },
    { label: "Cerradas", values: [STATUS.COMPLETADA, STATUS.CERRADA] },
    { label: "Anuladas", values: [STATUS.CANCELADA, STATUS.RECHAZADA] }
  ];
  let html = '<option value="">Todos los estados</option>';
  groups.forEach((group) => {
    html += `<optgroup label="${escapeAttr(group.label)}">`;
    group.values.forEach((status) => {
      html += `<option value="${escapeAttr(status)}">${escapeHtml(status)}</option>`;
    });
    html += "</optgroup>";
  });
  return html;
}

function sortHistoryRequests(items) {
  return [...items].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

function historyMatchesQuickFilter(request, filterKey) {
  const key = String(filterKey || "all");
  if (key === "closed") return [STATUS.COMPLETADA, STATUS.CERRADA].includes(request.status);
  if (key === "active") return Boolean(request.trip) && tripRequestStatusIsOperational(request.status);
  if (key === "pending") {
    return !request.trip && [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(request.status);
  }
  if (key === "cancelled") return [STATUS.CANCELADA, STATUS.RECHAZADA].includes(request.status);
  return true;
}

function applyHistoryFilters(items, opts = {}) {
  let out = [...items];
  const quickFilter = String(opts.quickFilter || "all");
  if (quickFilter !== "all") out = out.filter((r) => historyMatchesQuickFilter(r, quickFilter));
  const data = opts.formData || {};
  if (data.client) out = out.filter((i) => i.clientUserId === data.client);
  if (data.status) out = out.filter((i) => i.status === data.status);
  if (data.from) out = out.filter((i) => new Date(i.createdAt) >= new Date(`${data.from}T00:00`));
  if (data.to) out = out.filter((i) => new Date(i.createdAt) <= new Date(`${data.to}T23:59`));
  const q = String(data.q || "").trim().toLowerCase();
  if (q) out = out.filter((i) => historyHaystack(i).includes(q));
  return sortHistoryRequests(out);
}

function historyQuickFilterCounts(all) {
  return {
    all: all.length,
    closed: all.filter((r) => historyMatchesQuickFilter(r, "closed")).length,
    active: all.filter((r) => historyMatchesQuickFilter(r, "active")).length,
    pending: all.filter((r) => historyMatchesQuickFilter(r, "pending")).length,
    cancelled: all.filter((r) => historyMatchesQuickFilter(r, "cancelled")).length
  };
}

function renderHistoryCard(request) {
  const statusSlug = slugStatus(request.status);
  const number = String(request.requestNumber || request.id || "").trim();
  const client = String(request.clientName || "").trim() || "—";
  const origin = String(request.originCity || "").trim() || "—";
  const dest = String(request.destinationCity || "").trim() || "—";
  const driver = historyDriverLabel(request);
  const plate = historyPlateLabel(request);
  const fleet = historyVehicleColumn(request);
  const trip = String(request.trip?.tripNumber || "").trim();
  const tripValue = parseNum(request.trip?.tripValue ?? request.tripValue ?? 0);
  const valueLabel = tripValue > 0 ? `$${tripValue.toLocaleString("es-CO")}` : "—";
  const created = fmtDate(request.createdAt);
  const pickup = fmtDate(request.pickupAt);
  return `<article class="hist-card hist-card--${escapeAttr(statusSlug)}" data-history-row data-id="${escapeAttr(String(request.id || ""))}" data-haystack="${escapeAttr(historyHaystack(request))}">
    <div class="hist-card__accent" aria-hidden="true"></div>
    <header class="hist-card__head">
      <div class="hist-card__identity">
        <span class="hist-card__number">${escapeHtml(number)}</span>
        <span class="hist-card__client">${escapeHtml(client)}</span>
      </div>
      <div class="hist-card__status">${prettyStatus(request.status)}</div>
    </header>
    <div class="hist-card__route" title="${escapeAttr(formatRoute(request))}">
      <div class="hist-card__city"><span class="hist-card__city-label">Origen</span><strong>${escapeHtml(origin)}</strong></div>
      <span class="hist-card__route-line" aria-hidden="true"></span>
      <div class="hist-card__city"><span class="hist-card__city-label">Destino</span><strong>${escapeHtml(dest)}</strong></div>
    </div>
    <dl class="hist-card__facts">
      <div><dt>${IC.user} Conductor</dt><dd>${driver ? escapeHtml(driver) : '<span class="muted">Sin asignar</span>'}</dd></div>
      <div><dt>${IC.truck} Placa</dt><dd>${plate ? `<span class="hist-plate">${escapeHtml(plate)}</span>` : '<span class="muted">—</span>'}</dd></div>
      <div><dt>${IC.compass} Viaje</dt><dd>${trip ? escapeHtml(trip) : '<span class="muted">—</span>'}</dd></div>
      <div class="hist-card__fact--money"><dt>${IC.dollar} Tarifa</dt><dd>${escapeHtml(valueLabel)}</dd></div>
      <div class="hist-card__fact--wide"><dt>${IC.truck} Flota</dt><dd>${escapeHtml(fleet)}</dd></div>
    </dl>
    <footer class="hist-card__foot">
      <p class="hist-card__dates muted"><time datetime="${escapeAttr(String(request.createdAt || ""))}">${escapeHtml(created)}</time> · Recogida ${escapeHtml(pickup)}</p>
      <div class="toolbar hist-card__actions">
        <button type="button" class="btn btn-sm btn-action" data-action="detail" data-id="${escapeAttr(String(request.id || ""))}">${IC.eye} Ver</button>
        ${request.trip ? `<button type="button" class="btn btn-sm btn-outline" data-action="trip-detail" data-id="${escapeAttr(String(request.id || ""))}">${IC.truck} Viaje</button>` : ""}
      </div>
    </footer>
  </article>`;
}

function renderHistoryRequestRow(request) {
  const statusSlug = slugStatus(request.status);
  const number = String(request.requestNumber || request.id || "").trim();
  const client = String(request.clientName || "").trim() || "—";
  const origin = String(request.originCity || "").trim() || "—";
  const dest = String(request.destinationCity || "").trim() || "—";
  const driver = historyDriverLabel(request);
  const plate = historyPlateLabel(request);
  const trip = String(request.trip?.tripNumber || "").trim();
  const tripValue = parseNum(request.trip?.tripValue ?? request.tripValue ?? 0);
  const valueLabel = tripValue > 0 ? `$${tripValue.toLocaleString("es-CO")}` : "—";
  const created = fmtDate(request.createdAt);
  const pickup = fmtDate(request.pickupAt);
  const actions = `<div class="toolbar history-list-actions">
      <button type="button" class="btn btn-sm btn-action" data-action="detail" data-id="${escapeAttr(String(request.id || ""))}">${IC.eye} Ver</button>
      ${request.trip ? `<button type="button" class="btn btn-sm btn-outline" data-action="trip-detail" data-id="${escapeAttr(String(request.id || ""))}">${IC.truck} Viaje</button>` : ""}
    </div>`;
  return `<tr class="hist-table-row hist-table-row--${escapeAttr(statusSlug)}" data-history-row data-id="${escapeAttr(String(request.id || ""))}" data-haystack="${escapeAttr(historyHaystack(request))}">
    <td data-label="Solicitud"><strong>${escapeHtml(number)}</strong><div class="muted hist-table-sub"><time datetime="${escapeAttr(String(request.createdAt || ""))}">${escapeHtml(created)}</time> · Recogida ${escapeHtml(pickup)}</div></td>
    <td data-label="Cliente">${escapeHtml(client)}</td>
    <td data-label="Ruta" title="${escapeAttr(formatRoute(request))}"><span class="hist-table-route">${escapeHtml(origin)}</span><span class="hist-table-route-arrow" aria-hidden="true">→</span><span class="hist-table-route">${escapeHtml(dest)}</span></td>
    <td data-label="Estado">${prettyStatus(request.status)}</td>
    <td data-label="Conductor">${driver ? escapeHtml(driver) : '<span class="muted">Sin asignar</span>'}</td>
    <td data-label="Placa">${plate ? `<span class="hist-plate">${escapeHtml(plate)}</span>` : '<span class="muted">—</span>'}</td>
    <td data-label="Viaje">${trip ? escapeHtml(trip) : '<span class="muted">—</span>'}</td>
    <td data-label="Tarifa">${escapeHtml(valueLabel)}</td>
    <td data-label="Acciones" class="hist-table-actions">${actions}</td>
  </tr>`;
}

function renderHistoryResultsList(items, layout = "cards") {
  const viewLayout =
    typeof globalThis.normalizeHistoryLayout === "function"
      ? globalThis.normalizeHistoryLayout(layout)
      : String(layout || "").trim().toLowerCase() === "list"
        ? "list"
        : "cards";
  if (!items.length) {
    return `<div class="hist-empty"><span class="hist-empty__icon" aria-hidden="true">${IC.search || IC.clock}</span><p>No hay registros con los filtros actuales.</p><p class="muted">Prueba otro periodo, cliente o quita el filtro rápido.</p></div>`;
  }
  if (viewLayout === "list") {
    return `<div class="table-wrap hist-table-wrap"><table class="vehicle-fleet-table hist-table" id="history-results-grid">
    <thead><tr>
      <th>Solicitud</th><th>Cliente</th><th>Ruta</th><th>Estado</th><th>Conductor</th><th>Placa</th><th>Viaje</th><th>Tarifa</th><th>Acciones</th>
    </tr></thead>
    <tbody>${items.map(renderHistoryRequestRow).join("")}</tbody>
  </table></div>`;
  }
  return `<div class="hist-cards-grid" id="history-results-grid">${items.map(renderHistoryCard).join("")}</div>`;
}

function sortFleetLogsByDate(logs) {
  return [...logs].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
}

function historyFleetFuelHaystack(log) {
  return `${log.vehiclePlate || ""} ${log.driverName || ""} ${log.tripNumber || ""} ${log.station || ""} ${log.paidBy || ""} ${log.date || ""}`
    .toLowerCase();
}

function historyFleetTechnicalHaystack(log) {
  return `${log.vehiclePlate || ""} ${log.description || ""} ${log.type || ""} ${log.status || ""} ${log.date || ""}`
    .toLowerCase();
}

function applyHistoryFleetFuelFilters(logs, formData = {}) {
  let out = sortFleetLogsByDate(logs);
  if (formData.vehicleId) out = out.filter((l) => String(l.vehicleId) === String(formData.vehicleId));
  if (formData.driverId) out = out.filter((l) => String(l.driverId) === String(formData.driverId));
  if (formData.paidBy) out = out.filter((l) => String(l.paidBy) === String(formData.paidBy));
  if (formData.from) out = out.filter((l) => String(l.date || "") >= String(formData.from));
  if (formData.to) out = out.filter((l) => String(l.date || "") <= String(formData.to));
  const q = String(formData.q || "").trim().toLowerCase();
  if (q) out = out.filter((l) => historyFleetFuelHaystack(l).includes(q));
  return out;
}

function applyHistoryFleetTechnicalFilters(logs, formData = {}) {
  let out = sortFleetLogsByDate(logs);
  if (formData.vehicleId) out = out.filter((l) => String(l.vehicleId) === String(formData.vehicleId));
  if (formData.type) out = out.filter((l) => String(l.type) === String(formData.type));
  if (formData.status) out = out.filter((l) => String(l.status) === String(formData.status));
  if (formData.from) out = out.filter((l) => String(l.date || "") >= String(formData.from));
  if (formData.to) out = out.filter((l) => String(l.date || "") <= String(formData.to));
  const q = String(formData.q || "").trim().toLowerCase();
  if (q) out = out.filter((l) => historyFleetTechnicalHaystack(l).includes(q));
  return out;
}

function historyFleetFuelKpis(logs) {
  const liters = logs.reduce((acc, log) => acc + parseNum(log.liters), 0);
  const cost = logs.reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  const reimburse = logs
    .filter((l) => String(l.paidBy) === "conductor")
    .reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  return {
    count: logs.length,
    liters,
    cost,
    avgPerLiter: liters > 0 ? Math.round(cost / liters) : 0,
    reimburse
  };
}

function historyFleetTechnicalKpis(logs) {
  const cost = logs.reduce((acc, log) => acc + parseNum(log.cost), 0);
  const downtime = logs.reduce((acc, log) => acc + parseNum(log.downtimeHours), 0);
  const open = logs.filter((l) => !["Resuelto"].includes(String(l.status || ""))).length;
  return { count: logs.length, cost, downtime, open };
}

function historyFleetMoneyField(name, label, opts = {}) {
  const req = opts.required ? { required: true } : {};
  return `<label class="history-fleet-money-field">${fieldLabel(IC.dollar, label, req)}
    <span class="history-fleet-money-wrap">
      <span class="history-fleet-money-prefix" aria-hidden="true">$</span>
      <input type="text" name="${escapeAttr(name)}" inputmode="numeric" autocomplete="off" data-money-input="1" placeholder="0" ${opts.required ? "required" : ""} />
    </span>
  </label>`;
}

function renderHistoryFuelLogCard(log) {
  const liters = parseNum(log.liters);
  const total = parseNum(log.totalCost);
  const perLiter = parseNum(log.costPerLiter) || (liters > 0 ? Math.round(total / liters) : 0);
  const paid = String(log.paidBy || "empresa") === "conductor" ? "conductor" : "empresa";
  const paidLabel = paid === "conductor" ? "Reembolso nómina" : "Empresa";
  const trip = String(log.tripNumber || "").trim();
  return `<article class="hist-fleet-card hist-fleet-card--fuel" data-fleet-fuel-row data-haystack="${escapeAttr(historyFleetFuelHaystack(log))}">
    <header class="hist-fleet-card__head">
      <div>
        <time class="hist-fleet-card__date" datetime="${escapeAttr(String(log.date || ""))}">${escapeHtml(fmtFleetLogDate(log.date))}</time>
        <h3 class="hist-fleet-card__plate">${escapeHtml(String(log.vehiclePlate || "—"))}</h3>
        <p class="hist-fleet-card__sub">${escapeHtml(String(log.driverName || "—"))}${trip ? ` · ${escapeHtml(trip)}` : ""}</p>
      </div>
      <span class="hist-badge hist-badge--${paid === "conductor" ? "warn" : "ok"}">${escapeHtml(paidLabel)}</span>
    </header>
    <dl class="hist-fleet-card__meta">
      <div><dt>${IC.activity} Litros</dt><dd>${liters.toLocaleString("es-CO", { maximumFractionDigits: 2 })} L</dd></div>
      <div><dt>${IC.dollar} Total</dt><dd class="hist-money">$${total.toLocaleString("es-CO")}</dd></div>
      <div><dt>${IC.dollar} $/L</dt><dd>$${perLiter.toLocaleString("es-CO")}</dd></div>
      <div><dt>${IC.mapPin} Estación</dt><dd>${log.station ? escapeHtml(log.station) : '<span class="muted">—</span>'}</dd></div>
      ${parseNum(log.odometerKm) > 0 ? `<div><dt>${IC.clock} Odómetro</dt><dd>${parseNum(log.odometerKm).toLocaleString("es-CO")} km</dd></div>` : ""}
    </dl>
  </article>`;
}

function renderHistoryTechnicalLogCard(log) {
  const typeKey = String(log.type || "preventivo");
  const typeLabel = HISTORY_FLEET_TECH_LABELS[typeKey] || typeKey;
  const status = String(log.status || "Pendiente");
  const statusSlug = slugStatus(status);
  const cost = parseNum(log.cost);
  const hours = parseNum(log.downtimeHours);
  return `<article class="hist-fleet-card hist-fleet-card--technical hist-fleet-card--${escapeAttr(statusSlug)}" data-fleet-technical-row data-haystack="${escapeAttr(historyFleetTechnicalHaystack(log))}">
    <header class="hist-fleet-card__head">
      <div>
        <time class="hist-fleet-card__date" datetime="${escapeAttr(String(log.date || ""))}">${escapeHtml(fmtFleetLogDate(log.date))}</time>
        <h3 class="hist-fleet-card__plate">${escapeHtml(String(log.vehiclePlate || "—"))}</h3>
        <p class="hist-fleet-card__desc">${escapeHtml(String(log.description || "—"))}</p>
      </div>
      <div class="hist-fleet-card__badges">
        <span class="hist-badge hist-badge--type">${escapeHtml(typeLabel)}</span>
        <span class="hist-badge hist-badge--status">${escapeHtml(status)}</span>
      </div>
    </header>
    <dl class="hist-fleet-card__meta">
      <div><dt>${IC.dollar} Costo</dt><dd class="hist-money">$${cost.toLocaleString("es-CO")}</dd></div>
      <div><dt>${IC.clock} Fuera de servicio</dt><dd>${hours > 0 ? `${hours.toLocaleString("es-CO")} h` : '<span class="muted">0 h</span>'}</dd></div>
    </dl>
  </article>`;
}

function renderHistoryFuelLogRow(log) {
  const liters = parseNum(log.liters);
  const total = parseNum(log.totalCost);
  const perLiter = parseNum(log.costPerLiter) || (liters > 0 ? Math.round(total / liters) : 0);
  const paid = String(log.paidBy || "empresa") === "conductor" ? "conductor" : "empresa";
  const paidLabel = paid === "conductor" ? "Reembolso nómina" : "Empresa";
  const trip = String(log.tripNumber || "").trim();
  return `<tr class="hist-table-row hist-table-row--fuel" data-fleet-fuel-row data-haystack="${escapeAttr(historyFleetFuelHaystack(log))}">
    <td data-label="Fecha"><time datetime="${escapeAttr(String(log.date || ""))}">${escapeHtml(fmtFleetLogDate(log.date))}</time></td>
    <td data-label="Placa"><strong>${escapeHtml(String(log.vehiclePlate || "—"))}</strong></td>
    <td data-label="Conductor">${escapeHtml(String(log.driverName || "—"))}${trip ? `<div class="muted hist-table-sub">${escapeHtml(trip)}</div>` : ""}</td>
    <td data-label="Litros">${liters.toLocaleString("es-CO", { maximumFractionDigits: 2 })} L</td>
    <td data-label="Total" class="hist-money">$${total.toLocaleString("es-CO")}</td>
    <td data-label="$/L">$${perLiter.toLocaleString("es-CO")}</td>
    <td data-label="Estación">${log.station ? escapeHtml(log.station) : '<span class="muted">—</span>'}</td>
    <td data-label="Pagado"><span class="hist-badge hist-badge--${paid === "conductor" ? "warn" : "ok"}">${escapeHtml(paidLabel)}</span></td>
  </tr>`;
}

function renderHistoryTechnicalLogRow(log) {
  const typeKey = String(log.type || "preventivo");
  const typeLabel = HISTORY_FLEET_TECH_LABELS[typeKey] || typeKey;
  const status = String(log.status || "Pendiente");
  const statusSlug = slugStatus(status);
  const cost = parseNum(log.cost);
  const hours = parseNum(log.downtimeHours);
  return `<tr class="hist-table-row hist-table-row--technical hist-table-row--${escapeAttr(statusSlug)}" data-fleet-technical-row data-haystack="${escapeAttr(historyFleetTechnicalHaystack(log))}">
    <td data-label="Fecha"><time datetime="${escapeAttr(String(log.date || ""))}">${escapeHtml(fmtFleetLogDate(log.date))}</time></td>
    <td data-label="Placa"><strong>${escapeHtml(String(log.vehiclePlate || "—"))}</strong></td>
    <td data-label="Descripción">${escapeHtml(String(log.description || "—"))}</td>
    <td data-label="Tipo"><span class="hist-badge hist-badge--type">${escapeHtml(typeLabel)}</span></td>
    <td data-label="Estado"><span class="hist-badge hist-badge--status">${escapeHtml(status)}</span></td>
    <td data-label="Costo" class="hist-money">$${cost.toLocaleString("es-CO")}</td>
    <td data-label="Fuera de servicio">${hours > 0 ? `${hours.toLocaleString("es-CO")} h` : '<span class="muted">0 h</span>'}</td>
  </tr>`;
}

function renderHistoryFuelLogsList(logs, layout = "cards") {
  const viewLayout =
    typeof globalThis.normalizeHistoryLayout === "function"
      ? globalThis.normalizeHistoryLayout(layout)
      : String(layout || "").trim().toLowerCase() === "list"
        ? "list"
        : "cards";
  if (!logs.length) {
    return `<div class="hist-empty"><span class="hist-empty__icon" aria-hidden="true">${IC.fuel || IC.activity}</span><p>Sin cargas de combustible.</p><p class="muted">Registre la primera desde el módulo <strong>Camiones</strong>.</p></div>`;
  }
  if (viewLayout === "list") {
    return `<div class="table-wrap hist-table-wrap"><table class="vehicle-fleet-table hist-table" id="history-fuel-results-grid">
    <thead><tr>
      <th>Fecha</th><th>Placa</th><th>Conductor</th><th>Litros</th><th>Total</th><th>$/L</th><th>Estación</th><th>Pagado</th>
    </tr></thead>
    <tbody>${logs.map(renderHistoryFuelLogRow).join("")}</tbody>
  </table></div>`;
  }
  return `<div class="hist-fleet-grid" id="history-fuel-results-grid">${logs.map(renderHistoryFuelLogCard).join("")}</div>`;
}

function renderHistoryTechnicalLogsList(logs, layout = "cards") {
  const viewLayout =
    typeof globalThis.normalizeHistoryLayout === "function"
      ? globalThis.normalizeHistoryLayout(layout)
      : String(layout || "").trim().toLowerCase() === "list"
        ? "list"
        : "cards";
  if (!logs.length) {
    return `<div class="hist-empty"><span class="hist-empty__icon" aria-hidden="true">${IC.activity || IC.truck}</span><p>Sin novedades de taller.</p><p class="muted">Registre preventivos, correctivos o fallas desde <strong>Camiones</strong>.</p></div>`;
  }
  if (viewLayout === "list") {
    return `<div class="table-wrap hist-table-wrap"><table class="vehicle-fleet-table hist-table" id="history-technical-results-grid">
    <thead><tr>
      <th>Fecha</th><th>Placa</th><th>Descripción</th><th>Tipo</th><th>Estado</th><th>Costo</th><th>Fuera de servicio</th>
    </tr></thead>
    <tbody>${logs.map(renderHistoryTechnicalLogRow).join("")}</tbody>
  </table></div>`;
  }
  return `<div class="hist-fleet-grid" id="history-technical-results-grid">${logs.map(renderHistoryTechnicalLogCard).join("")}</div>`;
}

function historyFleetKpiStrip(metrics) {
  return `<div class="hist-kpi-strip" role="group" aria-label="Resumen del periodo">${metrics
    .map(
      ({ label, value, tone }) =>
        `<div class="hist-kpi${tone ? ` hist-kpi--${tone}` : ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`
    )
    .join("")}</div>`;
}

function refreshHistoryFleetKpiStrip(selector, metrics) {
  const root = document.querySelector(selector);
  if (root) root.outerHTML = historyFleetKpiStrip(metrics);
}

function historyFleetFilterToolbar(formId, fieldsHtml, layout = "cards") {
  const viewToggle =
    typeof globalThis.historyViewToggleHtml === "function" ? globalThis.historyViewToggleHtml(layout) : "";
  return `<form id="${escapeAttr(formId)}" class="hist-filter-form" novalidate>
    <div class="transport-ops-toolbar hist-toolbar">
      <label class="transport-ops-search hist-search">
        <span class="muted">${IC.search || IC.filter} Buscar</span>
        <input type="search" name="q" placeholder="Placa, conductor, estación, viaje…" autocomplete="off" />
      </label>
      ${viewToggle}
      <details class="hist-advanced-filters">
        <summary class="btn btn-sm btn-action">${IC.filter} Filtros</summary>
        <div class="hist-advanced-filters-body">${fieldsHtml}
          <button class="btn btn-sm btn-action" type="reset">${IC.x} Limpiar</button>
        </div>
      </details>
    </div>
  </form>`;
}

function historyFleetFuelFormHtml(todayIsoDate, vehicleOptions, driverOptions) {
  return `<form id="form-fuel-log" class="p-form p-form-colored history-fleet-create-form">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.calendar} Carga de combustible</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.calendar, "Fecha", { required: true })}<input type="date" name="date" value="${escapeAttr(todayIsoDate)}" required /></label>
        <label>${fieldLabel(IC.truck, "Camión", { required: true })}<select name="vehicleId" required><option value="">Seleccione…</option>${vehicleOptions}</select></label>
        <label>${fieldLabel(IC.user, "Conductor", { required: true })}<select name="driverId" required><option value="">Seleccione…</option>${driverOptions}</select></label>
        <label>${fieldLabel(IC.file, "Viaje (opcional)")}<input name="tripNumber" placeholder="VIA-000123" autocomplete="off" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.dollar} Montos y trazabilidad</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.activity, "Litros", { required: true })}<input type="number" step="0.01" min="0.01" name="liters" required data-fuel-liters-input="1" /></label>
        ${historyFleetMoneyField("totalCost", "Valor total (COP)", { required: true })}
        <label>${fieldLabel(IC.clock, "Odómetro (km)")}<input type="number" min="0" name="odometerKm" inputmode="numeric" /></label>
        <label>${fieldLabel(IC.mapPin, "Estación / EDS")}<input name="station" placeholder="EDS Roscombustible…" autocomplete="off" /></label>
        <label>${fieldLabel(IC.briefcase, "Pagado por")}
          <select name="paidBy">
            <option value="empresa">Empresa</option>
            <option value="conductor">Conductor (reembolso nómina)</option>
          </select>
        </label>
      </div>
      <p class="history-fleet-live-hint muted" id="fuel-price-per-liter-hint" hidden aria-live="polite"></p>
      <p class="history-fleet-sync-hint muted">Se guarda en <strong>registros_combustible</strong> (PostgreSQL) al enviar.</p>
    </fieldset>
    ${renderManagedCreateFormActions("create-fuel-log", `<button class="btn btn-primary" type="submit">${IC.plus} Registrar combustible</button>`)}
  </form>`;
}

function historyFleetTechnicalFormHtml(todayIsoDate, vehicleOptions) {
  return `<form id="form-technical-log" class="p-form p-form-colored history-fleet-create-form">
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.truck} Novedad de taller</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.calendar, "Fecha", { required: true })}<input type="date" name="date" value="${escapeAttr(todayIsoDate)}" required /></label>
        <label>${fieldLabel(IC.truck, "Camión", { required: true })}<select name="vehicleId" required><option value="">Seleccione…</option>${vehicleOptions}</select></label>
        <label>${fieldLabel(IC.activity, "Tipo")}
          <select name="type">
            <option value="preventivo">Mantenimiento preventivo</option>
            <option value="correctivo">Mantenimiento correctivo</option>
            <option value="falla">Falla técnica</option>
          </select>
        </label>
        <label class="full">${fieldLabel(IC.file, "Descripción", { required: true })}<input name="description" required placeholder="Ej. cambio de aceite, frenos, refrigeración…" /></label>
        ${historyFleetMoneyField("cost", "Costo (COP)", { required: true })}
        <label>${fieldLabel(IC.clock, "Horas fuera de servicio")}<input type="number" min="0" step="0.5" name="downtimeHours" value="0" /></label>
        <label>${fieldLabel(IC.check, "Estado")}
          <select name="status">
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Resuelto</option>
          </select>
        </label>
      </div>
      <p class="history-fleet-sync-hint muted">Se guarda en <strong>registros_mantenimiento_vehiculo</strong> (PostgreSQL) al enviar.</p>
    </fieldset>
    ${renderManagedCreateFormActions("create-technical-log", `<button class="btn btn-primary" type="submit">${IC.plus} Registrar novedad de taller</button>`)}
  </form>`;
}

function readPortalB2bContactLeads() {
  const fromStore = readArray(KEYS.contacts);
  if (fromStore.length) return fromStore;
  return Array.isArray(state.portalContacts) ? state.portalContacts : [];
}

function historyAuditActionLabel(action) {
  if (action === "create") return "Creación";
  if (action === "delete") return "Eliminación";
  return "Actualización";
}

function historyAuditActionStatus(action) {
  if (action === "create") return "status-viaje_asignado";
  if (action === "delete") return "status-rechazada";
  return "status-pendiente";
}

const HISTORY_AUDIT_ACTOR_MATCH_MS = 24 * 60 * 60 * 1000;

function historyAuditActorLabel(...candidates) {
  for (const raw of candidates) {
    const label = String(raw ?? "").trim();
    if (!label || label === "—" || label === "-" || label.toLowerCase() === "usuario") continue;
    return label;
  }
  return "";
}

function buildPortalAuditActorSnapshot() {
  const session = getSession();
  const sessionUserId = String(session?.userId || state.session?.userId || "").trim();
  let user = currentUser();
  if (!user && sessionUserId) {
    const snap = session?.profileSnapshot;
    if (snap && String(snap.id || "") === sessionUserId) {
      user = {
        id: snap.id,
        email: snap.email,
        name: snap.name
      };
    } else {
      user = { id: sessionUserId, email: "", name: "" };
    }
  }
  if (!user && !sessionUserId) return { label: "", userId: "", email: "", name: "" };
  const email = String(user?.email || session?.profileSnapshot?.email || "").trim();
  const displayName = user ? getPortalUserDisplayName(user) : "";
  const name =
    displayName && displayName !== "Usuario"
      ? displayName
      : String(user?.name || session?.profileSnapshot?.name || "").trim() &&
          !String(user?.name || session?.profileSnapshot?.name || "").includes("@")
        ? String(user?.name || session?.profileSnapshot?.name || "").trim()
        : "";
  const label = historyAuditActorLabel(email, name, displayName, user?.name);
  return {
    label,
    userId: String(user?.id || sessionUserId || "").trim(),
    email,
    name
  };
}

function getPortalAuditActorLabel() {
  return buildPortalAuditActorSnapshot().label;
}

function historyAuditActorFromLogRow(row = {}, options = {}) {
  const opts = options && typeof options === "object" ? options : {};
  const fromRow = historyAuditActorLabel(
    row?.usuario,
    row?.actor,
    row?.actorEmail,
    historyAuditUserLabelById(row?.actorUserId)
  );
  if (fromRow) return fromRow;
  if (!opts.fallbackToSession) return "";
  const snapshot =
    opts.sessionSnapshot && typeof opts.sessionSnapshot === "object"
      ? opts.sessionSnapshot
      : buildPortalAuditActorSnapshot();
  return historyAuditActorLabel(snapshot.label, snapshot.email, snapshot.name);
}

/** Usuario desde `auditoria_eventos_portal` (fila en memoria); sin entityHistoryActors ni localStorage. */
function historyAuditUsuarioFromLogRow(row = {}, options = {}) {
  const opts = options && typeof options === "object" ? options : {};
  const fromTable = String(row.usuario || "").trim();
  if (fromTable) return fromTable;
  const actorEmail = String(row.actorEmail || "").trim();
  const actorUserId = String(row.actorUserId || "").trim();
  const actor = historyAuditActorFromLogRow(row, { fallbackToSession: false });
  if (actor) {
    const name = historyAuditUserLabelById(actorUserId);
    const enriched = formatHistoryAuditActorDisplay(actor, {
      actorEmail,
      actorName: name || actor
    });
    if (enriched) return enriched;
    return actor;
  }
  if (actorUserId) {
    const label = historyAuditUserLabelById(actorUserId);
    if (label) {
      return formatHistoryAuditActorDisplay(label, { actorEmail, actorName: label }) || label;
    }
  }
  if (actorEmail) return actorEmail;
  if (opts.fallbackToSession) {
    const snapshot = buildPortalAuditActorSnapshot();
    if (snapshot.label) {
      return historyAuditFormatStoredUsuario(snapshot.label, snapshot.email, snapshot.userId);
    }
  }
  return "";
}

function historyAuditEnrichActorDisplay(label, meta = {}) {
  const direct = formatHistoryAuditActorDisplay(label, meta);
  if (direct) return direct;
  const userId = String(meta.actorUserId || "").trim();
  if (userId) {
    const user = readArray(KEYS.users).find((u) => String(u.id) === userId);
    if (user) {
      return formatHistoryAuditActorDisplay(getPortalUserDisplayName(user) || user.email, {
        actorEmail: user.email,
        actorName: getPortalUserDisplayName(user)
      });
    }
  }
  const email = String(meta.actorEmail || label || "").trim();
  if (email.includes("@")) {
    const user = readArray(KEYS.users).find(
      (u) => normalizeEmail(u.email) === normalizeEmail(email)
    );
    if (user) {
      return formatHistoryAuditActorDisplay(getPortalUserDisplayName(user) || email, {
        actorEmail: user.email,
        actorName: getPortalUserDisplayName(user)
      });
    }
  }
  return historyAuditActorLabel(label);
}

function formatHistoryAuditActorDisplay(actor, meta = {}) {
  const label = historyAuditActorLabel(actor);
  if (!label) return "";
  const email = String(meta.actorEmail || "").trim();
  const name = String(meta.actorName || "").trim();
  if (name && email && label.toUpperCase() !== email.toUpperCase() && label.toUpperCase() !== name.toUpperCase()) {
    return `${name} · ${email}`;
  }
  if (email && label.toUpperCase() === email.toUpperCase() && name && name !== "Usuario") {
    return `${name} · ${email}`;
  }
  return label;
}

/** Texto listo para columna Usuario en tabla/CSV (persistido en `moduleAuditLogs.usuario`). */
function historyAuditFormatStoredUsuario(actor, actorEmail = "", actorUserId = "") {
  const direct = historyAuditEnrichActorDisplay(actor, { actorEmail, actorUserId });
  if (direct) return direct;
  return historyAuditActorLabel(actor, actorEmail);
}

function historyAuditEntityActorFields(entity, action = "update") {
  const row = entity && typeof entity === "object" ? entity : {};
  const isCreate = action === "create";
  const actorEmail = String(
    isCreate
      ? row.createdByEmail || row.updatedByEmail || ""
      : row.updatedByEmail || row.createdByEmail || ""
  ).trim();
  const actorUserId = String(
    isCreate
      ? row.createdByUserId || row.updatedByUserId || ""
      : row.updatedByUserId || row.createdByUserId || ""
  ).trim();
  const actor = historyAuditEntityActor(entity, action);
  const usuario = historyAuditFormatStoredUsuario(actor, actorEmail, actorUserId);
  return { actor, actorEmail, actorUserId, usuario };
}

function historyAuditEntityLabelsMatch(a, b) {
  const left = String(a || "").trim().toUpperCase();
  const right = String(b || "").trim().toUpperCase();
  return Boolean(left && right && left === right);
}

function historyAuditEntriesCorrelate(syn, ex) {
  if (String(syn.moduleLabel || "") !== String(ex.moduleLabel || "")) return false;
  if (String(syn.action || "") !== String(ex.action || "")) return false;
  const synId = String(syn.entityId || "").trim();
  const exId = String(ex.entityId || "").trim();
  if (synId && exId && synId === exId) return true;
  return historyAuditEntityLabelsMatch(syn.entityLabel, ex.entityLabel);
}

function readEntityHistoryActors() {
  const raw = read(KEYS.entityHistoryActors, {});
  return raw && typeof raw === "object" ? raw : {};
}

function recordEntityHistoryActor(moduleLabel, entityId, ts, actor) {
  const mod = String(moduleLabel || "").trim();
  const id = String(entityId || "").trim();
  const at = String(ts || "").trim();
  const who = String(actor || "").trim();
  if (!mod || !id || !at || !who) return;
  const store = { ...readEntityHistoryActors() };
  store[`${mod}|${id}|${at}`] = who;
  const keys = Object.keys(store);
  if (keys.length > 800) {
    for (const key of keys.slice(0, keys.length - 700)) delete store[key];
  }
  write(KEYS.entityHistoryActors, store);
}

function historyAuditTimestampMs(value) {
  const ms = new Date(String(value || "").trim()).getTime();
  return Number.isNaN(ms) ? NaN : ms;
}

function historyAuditEntityTimestampCandidates(entity) {
  const stamps = new Set();
  for (const key of ["updatedAt", "createdAt", "registeredAt", "hiredAt", "approvedAt"]) {
    const raw = String(entity?.[key] || "").trim();
    if (raw) stamps.add(raw);
  }
  return [...stamps];
}

function reindexEntityHistoryActorsFromCatalogs() {
  const store = { ...readEntityHistoryActors() };
  let changed = false;
  const catalog = [];

  const pushEntity = (moduleLabel, entity, entityLabel = "") => {
    if (!entity || typeof entity !== "object") return;
    const id = String(entity.id || "").trim();
    if (!id) return;
    for (const ts of historyAuditEntityTimestampCandidates(entity)) {
      catalog.push({ moduleLabel, id, ts, entity, entityLabel });
    }
    const entityActor = historyAuditEntityActor(entity, "update") || historyAuditEntityActor(entity, "create");
    if (entityActor) {
      for (const ts of historyAuditEntityTimestampCandidates(entity)) {
        const key = `${moduleLabel}|${id}|${ts}`;
        if (!store[key]) {
          store[key] = entityActor;
          changed = true;
        }
      }
    }
  };

  readArray(KEYS.users).forEach((user) =>
    pushEntity("Usuarios y permisos", user, getPortalUserDisplayName(user) || String(user.email || "Usuario"))
  );
  readArray(KEYS.companies).forEach((company) =>
    pushEntity("Usuarios y permisos", company, String(company.name || "Empresa"))
  );
  readArray(KEYS.vehicles).forEach((vehicle) =>
    pushEntity("Camiones", vehicle, String(vehicle.plate || vehicle.id || "Camión").toUpperCase())
  );
  readArray(KEYS.drivers).forEach((driver) =>
    pushEntity("Conductores", driver, String(driver.name || "Conductor"))
  );
  readArray(KEYS.positions).forEach((position) =>
    pushEntity("Contratación", position, String(position.name || "Cargo"))
  );
  readArray(KEYS.vacancies).forEach((vacancy) =>
    pushEntity("Contratación", vacancy, String(vacancy.title || vacancy.positionName || "Vacante"))
  );
  readArray(KEYS.candidates).forEach((candidate) =>
    pushEntity("Contratación", candidate, String(candidate.name || "Candidato"))
  );
  readArray(KEYS.interviews).forEach((interview) =>
    pushEntity("Contratación", interview, String(interview.candidateName || "Entrevista"))
  );
  readArray(KEYS.contracts).forEach((contract) =>
    pushEntity(
      "Contratación",
      contract,
      String(contract.candidateName || contract.employeeName || "Contrato")
    )
  );
  readArray(KEYS.payrollEmployees).forEach((employee) =>
    pushEntity("Gestión humana", employee, String(employee.name || "Colaborador"))
  );
  readArray(KEYS.payrollRuns).forEach((run) =>
    pushEntity(
      "Gestión humana",
      run,
      `${String(run.employeeName || "Colaborador").trim()} · ${String(run.month || "-").trim()}`
    )
  );
  readArray(KEYS.hrAbsences).forEach((absence) =>
    pushEntity(
      "Gestión humana",
      absence,
      `${String(absence.employeeName || "Colaborador").trim()} · ${String(absence.startDate || "-")}`
    )
  );
  readArray(KEYS.sstCompliance).forEach((record) =>
    pushEntity(
      "Cumplimiento laboral y SST",
      record,
      `${String(record.employeeName || "Colaborador").trim()} · ${String(record.recordType || "Control")}`
    )
  );
  readPortalB2bContactLeads().forEach((contact) =>
    pushEntity(
      "Contacto web (B2B)",
      contact,
      String(contact.contactName || contact.companyName || "Prospecto B2B").trim()
    )
  );
  readArray(KEYS.approvals).forEach((approval) =>
    pushEntity("Autorizaciones", approval, String(approval.title || approval.type || "Autorización").trim())
  );

  const bindLogToCatalog = (row) => {
    const actor = historyAuditActorFromLogRow(row);
    if (!actor) return;
    const moduleLabel = String(row.moduleLabel || "").trim();
    const entityId = String(row.entityId || "").trim();
    const entityLabel = String(row.entityLabel || "").trim();
    const logAt = String(row.at || "").trim();
    const logMs = historyAuditTimestampMs(logAt);
    if (!moduleLabel) return;

    if (entityId && logAt) {
      const logKey = `${moduleLabel}|${entityId}|${logAt}`;
      if (!store[logKey]) {
        store[logKey] = actor;
        changed = true;
      }
    }

    if (!entityId || Number.isNaN(logMs)) return;

    let bestTs = "";
    let bestDelta = Infinity;
    for (const item of catalog) {
      if (item.moduleLabel !== moduleLabel) continue;
      if (entityId && String(item.id) !== entityId) continue;
      if (!entityId && entityLabel && item.entityLabel.toUpperCase() !== entityLabel.toUpperCase()) continue;
      const tsMs = historyAuditTimestampMs(item.ts);
      if (Number.isNaN(tsMs)) continue;
      const delta = Math.abs(tsMs - logMs);
      if (delta < bestDelta) {
        bestDelta = delta;
        bestTs = item.ts;
      }
    }
    if (!bestTs || bestDelta > HISTORY_AUDIT_ACTOR_MATCH_MS) return;
    if (!entityId) return;
    const properKey = `${moduleLabel}|${entityId}|${bestTs}`;
    if (!store[properKey]) {
      store[properKey] = actor;
      changed = true;
    }
  };

  for (const row of readModuleAuditLogs()) bindLogToCatalog(row);
  if (changed) write(KEYS.entityHistoryActors, store);
}

function historyAuditActorFromHistoryStore(moduleLabel, entityId, ts) {
  const mod = String(moduleLabel || "").trim();
  const id = String(entityId || "").trim();
  const at = String(ts || "").trim();
  if (!mod || !id || !at) return "";
  const store = readEntityHistoryActors();
  const exact = String(store[`${mod}|${id}|${at}`] || "").trim();
  if (exact) return exact;
  const targetMs = historyAuditTimestampMs(at);
  if (Number.isNaN(targetMs)) return "";
  let best = "";
  let bestDelta = Infinity;
  const prefix = `${mod}|${id}|`;
  for (const [key, value] of Object.entries(store)) {
    if (!key.startsWith(prefix)) continue;
    const keyTs = key.slice(prefix.length);
    const keyMs = historyAuditTimestampMs(keyTs);
    if (Number.isNaN(keyMs)) continue;
    const delta = Math.abs(keyMs - targetMs);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = String(value || "").trim();
    }
  }
  if (best && bestDelta <= HISTORY_AUDIT_ACTOR_MATCH_MS) return best;
  const onlyKey = Object.keys(store).find((key) => key.startsWith(prefix));
  if (onlyKey) {
    const onlyActor = String(store[onlyKey] || "").trim();
    if (onlyActor) return onlyActor;
  }
  return "";
}

function historyAuditUserLabelById(userId) {
  const id = String(userId || "").trim();
  if (!id) return "";
  const user = readArray(KEYS.users).find((u) => String(u.id) === id);
  if (!user) return "";
  return getPortalUserDisplayName(user) || String(user.email || "").trim();
}

function historyAuditFleetLogActor(log) {
  return historyAuditActorLabel(
    log?.registeredByName,
    log?.registeredByEmail,
    historyAuditUserLabelById(log?.registeredByUserId)
  );
}

function historyAuditRequestCreateActor(request) {
  return historyAuditActorLabel(request?.requestedByName, historyAuditUserLabelById(request?.clientUserId));
}

function historyAuditRequestUpdateActor(request) {
  const updatedAt = String(request?.updatedAt || "").trim();
  const approvedBy = String(request?.approvedBy || "").trim();
  const approvedAt = String(request?.approvedAt || "").trim();
  if (approvedBy && approvedAt && approvedAt === updatedAt) return approvedBy;
  const logs = Array.isArray(request?.modificationLog) ? request.modificationLog : [];
  for (let i = logs.length - 1; i >= 0; i -= 1) {
    const row = logs[i];
    const who = historyAuditActorLabel(row?.actorEmail, row?.actorName);
    if (!who) continue;
    const at = String(row?.at || "").trim();
    if (!updatedAt || at === updatedAt) return who;
  }
  return historyAuditActorLabel(request?.updatedBy, approvedBy);
}

function historyAuditTripActor(request) {
  return historyAuditActorLabel(request?.trip?.assignedBy, request?.approvedBy);
}

function historyAuditDeletedByActor(row) {
  return historyAuditDeletedTransportFields(row).actor;
}

function historyAuditDeletedTransportFields(row = {}) {
  const actorEmail = String(row.deletedByEmail || "").trim();
  const actorUserId = String(row.deletedByUserId || "").trim();
  const actor = historyAuditActorLabel(
    actorEmail,
    row.deletedByName,
    historyAuditUserLabelById(actorUserId)
  );
  const usuario = historyAuditFormatStoredUsuario(actor, actorEmail, actorUserId);
  return { actor, actorEmail, actorUserId, usuario };
}

function historyAuditTransportModificationFields(logRow = {}) {
  const actorEmail = String(logRow.actorEmail || "").trim();
  const actorUserId = String(logRow.actorUserId || "").trim();
  const actor = historyAuditActorLabel(
    actorEmail,
    logRow.actorName,
    historyAuditUserLabelById(actorUserId)
  );
  const usuario =
    String(logRow.usuario || "").trim() || historyAuditFormatStoredUsuario(actor, actorEmail, actorUserId);
  return { actor, actorEmail, actorUserId, usuario };
}

function historyAuditUserFieldsFromId(userId) {
  const id = String(userId || "").trim();
  if (!id) return { actor: "", actorEmail: "", actorUserId: "", usuario: "" };
  const user = readArray(KEYS.users).find((u) => String(u.id) === id);
  if (!user) return { actor: "", actorEmail: "", actorUserId: id, usuario: "" };
  const actorEmail = String(user.email || "").trim();
  const actorUserId = String(user.id || "").trim();
  const actor = historyAuditActorLabel(actorEmail, getPortalUserDisplayName(user), user.name);
  const usuario = historyAuditFormatStoredUsuario(actor, actorEmail, actorUserId);
  return { actor, actorEmail, actorUserId, usuario };
}

function historyAuditRequestCreateFields(request) {
  const fromClient = historyAuditUserFieldsFromId(request?.clientUserId);
  if (fromClient.usuario) return fromClient;
  const actor = historyAuditActorLabel(request?.requestedByName, request?.clientName);
  const usuario = historyAuditFormatStoredUsuario(actor, "", "");
  return { actor, actorEmail: "", actorUserId: String(request?.clientUserId || "").trim(), usuario };
}

function historyAuditTripAssignFields(request, actorName = "") {
  const session = buildPortalAuditActorSnapshot();
  const actorEmail = session.email;
  const actorUserId = session.userId;
  const actor = historyAuditActorLabel(
    actorName,
    request?.trip?.assignedBy,
    request?.approvedBy,
    session.label,
    actorEmail
  );
  const usuario = historyAuditFormatStoredUsuario(actor, actorEmail, actorUserId);
  return { actor, actorEmail, actorUserId, usuario };
}

function moduleAuditLogRowFromTransportDeletion(row, kind) {
  const fields = historyAuditDeletedTransportFields(row);
  const isTrip = kind === "trip";
  const snap = isTrip ? parsePortalJsonSnapshot(row.snapshot) : deletedRequestSnapshotForTableRow(row);
  const summaryPart = isTrip
    ? formatDeletedTripSnapshotTableSummary(snap)
    : formatDeletedRequestSnapshotTableSummary(snap);
  return {
    id: `transport-deleted-${kind}-${String(row.id || "")}`,
    at: String(row.deletedAt || ""),
    action: "delete",
    moduleId: isTrip ? "trips" : "requests",
    moduleLabel: isTrip ? "Viajes" : "Mis solicitudes",
    entityId: String(isTrip ? row.requestId || row.id || "" : row.requestId || ""),
    entityLabel: String(
      isTrip ? row.tripNumber || row.requestNumber || "Viaje" : row.requestNumber || row.requestId || "Solicitud"
    ),
    summary: `${summaryPart} · Motivo: ${String(row.reason || "—")}`,
    actor: fields.actor,
    actorEmail: fields.actorEmail,
    actorUserId: fields.actorUserId,
    usuario: fields.usuario,
    detailAction: isTrip ? "deleted-trip-snapshot-detail" : "deleted-request-snapshot-detail",
    detailId: String(row.id || "")
  };
}

function moduleAuditLogRowFromRequestModification(request, logRow) {
  const fields = historyAuditTransportModificationFields(logRow);
  const requestLabel = String(request.requestNumber || "Solicitud");
  const just = String(logRow?.justification || "").trim();
  const tripN = String(logRow?.tripNumber || request.trip?.tripNumber || "").trim();
  const changes = String(logRow?.changesSummary || "").trim();
  return {
    id: `transport-request-mod-${String(request.id || "")}-${String(logRow?.id || "")}`,
    at: String(logRow?.at || ""),
    action: "update",
    moduleId: "requests",
    moduleLabel: "Mis solicitudes",
    entityId: String(request.id || ""),
    entityLabel: requestLabel,
    summary: tripN
      ? `Modificación con viaje ${tripN}${changes ? ` (${changes})` : ""}: ${just}`
      : `Modificación${changes ? ` (${changes})` : ""}: ${just}`,
    actor: fields.actor,
    actorEmail: fields.actorEmail,
    actorUserId: fields.actorUserId,
    usuario: fields.usuario,
    detailAction: "detail",
    detailId: String(request.id || "")
  };
}

function upsertModuleAuditLogById(entry) {
  const row = entry && typeof entry === "object" ? entry : {};
  const stableId = String(row.id || "").trim();
  if (!stableId) {
    appendModuleAuditLog(row);
    return;
  }
  const list = readModuleAuditLogs();
  const idx = list.findIndex((r) => String(r.id) === stableId);
  if (idx < 0) {
    appendModuleAuditLog({ ...row, id: stableId });
    return;
  }
  const cur = list[idx];
  const actor = historyAuditActorLabel(row.actor, cur.actor);
  const actorEmail = String(row.actorEmail || cur.actorEmail || "").trim();
  const actorUserId = String(row.actorUserId || cur.actorUserId || "").trim();
  const usuario =
    String(row.usuario || cur.usuario || "").trim() ||
    historyAuditFormatStoredUsuario(actor, actorEmail, actorUserId);
  const next = { ...cur, actor: actor || cur.actor, actorEmail, actorUserId, usuario };
  if (
    next.usuario !== String(cur.usuario || "").trim() ||
    next.actor !== String(cur.actor || "").trim() ||
    next.actorEmail !== String(cur.actorEmail || "").trim() ||
    next.actorUserId !== String(cur.actorUserId || "").trim()
  ) {
    const updated = [...list];
    updated[idx] = next;
    write(KEYS.moduleAuditLogs, updated);
  }
}

function syncTransportAuditsToModuleLogs() {
  read(KEYS.deletedTransportRequestLogs, []).forEach((row) => {
    if (!row?.id) return;
    upsertModuleAuditLogById(moduleAuditLogRowFromTransportDeletion(row, "request"));
  });
  read(KEYS.deletedTransportTripLogs, []).forEach((row) => {
    if (!row?.id) return;
    upsertModuleAuditLogById(moduleAuditLogRowFromTransportDeletion(row, "trip"));
  });
  reqRead().forEach((request) => {
    const logs = Array.isArray(request?.modificationLog) ? request.modificationLog : [];
    logs.forEach((logRow) => {
      if (!logRow?.id || !String(logRow.justification || "").trim()) return;
      upsertModuleAuditLogById(moduleAuditLogRowFromRequestModification(request, logRow));
    });
  });
}

function formatTransportDeletionAuditUsuario(row) {
  const usuario = historyAuditDeletedTransportFields(row).usuario;
  return usuario || "Sin registrar";
}

function historyAuditEntityActor(entity, action = "update") {
  const row = entity && typeof entity === "object" ? entity : {};
  if (action === "create") {
    return historyAuditActorLabel(
      row.createdByEmail,
      historyAuditUserLabelById(row.createdByUserId),
      row.createdBy,
      row.creadoPor,
      row.creado_por,
      row.updatedByEmail,
      row.updatedBy,
      historyAuditUserLabelById(row.updatedByUserId)
    );
  }
  return historyAuditActorLabel(
    row.updatedByEmail,
    historyAuditUserLabelById(row.updatedByUserId),
    row.updatedBy,
    row.actualizadoPor,
    row.actualizado_por,
    row.createdByEmail,
    historyAuditUserLabelById(row.createdByUserId),
    row.createdBy
  );
}

function historyAuditLatestActorFromModuleLogs(moduleLabel, entityId, entityLabel = "", action = "") {
  const mod = String(moduleLabel || "").trim();
  const id = String(entityId || "").trim();
  const label = String(entityLabel || "").trim();
  if (!mod || (!id && !label)) return "";
  let best = "";
  let bestMs = -Infinity;
  for (const row of readModuleAuditLogs()) {
    if (String(row.moduleLabel || "") !== mod) continue;
    const rowAction = String(row.action || "");
    if (action && rowAction && rowAction !== action) continue;
    const rowEntityId = String(row.entityId || "").trim();
    const rowEntityLabel = String(row.entityLabel || "").trim();
    if (id && rowEntityId) {
      if (rowEntityId !== id) continue;
    } else if (label && rowEntityLabel) {
      if (!historyAuditEntityLabelsMatch(label, rowEntityLabel)) continue;
    } else {
      continue;
    }
    const actor = historyAuditActorFromLogRow(row);
    if (!actor) continue;
    const rowMs = historyAuditTimestampMs(row.at);
    if (Number.isNaN(rowMs)) {
      if (!best) best = actor;
      continue;
    }
    if (rowMs >= bestMs) {
      bestMs = rowMs;
      best = actor;
    }
  }
  return best;
}

function historyAuditActorFromModuleLogs(moduleLabel, entityId, entityLabel, action, ts, { strictAction = true } = {}) {
  const targetMs = historyAuditTimestampMs(ts);
  const id = String(entityId || "").trim();
  const label = String(entityLabel || "").trim();
  let best = "";
  let bestDelta = Infinity;
  let onlyMatch = "";
  let matchCount = 0;
  for (const row of readModuleAuditLogs()) {
    if (String(row.moduleLabel || "") !== moduleLabel) continue;
    if (strictAction && String(row.action || "") !== action) continue;
    const rowEntityId = String(row.entityId || "").trim();
    const rowEntityLabel = String(row.entityLabel || "").trim();
    if (id && rowEntityId) {
      if (rowEntityId !== id) continue;
    } else if (label && rowEntityLabel) {
      if (rowEntityLabel.toUpperCase() !== label.toUpperCase()) continue;
    } else {
      continue;
    }
    const actor = historyAuditActorFromLogRow(row);
    if (!actor) continue;
    matchCount += 1;
    onlyMatch = actor;
    if (Number.isNaN(targetMs)) {
      best = actor;
      break;
    }
    const rowMs = historyAuditTimestampMs(row.at);
    if (Number.isNaN(rowMs)) continue;
    const delta = Math.abs(rowMs - targetMs);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = actor;
    }
  }
  if (best && (Number.isNaN(targetMs) || bestDelta <= HISTORY_AUDIT_ACTOR_MATCH_MS)) return best;
  if (matchCount === 1 && onlyMatch) return onlyMatch;
  return "";
}

function resolveHistoryAuditActorForEntity({ moduleLabel, entityId, entityLabel, action, entity, ts }) {
  const fromEntity = historyAuditEntityActor(entity, action);
  if (fromEntity) return fromEntity;
  const fromStore = historyAuditActorFromHistoryStore(moduleLabel, entityId, ts);
  if (fromStore) return fromStore;
  const fromLogs = historyAuditActorFromModuleLogs(moduleLabel, entityId, entityLabel, action, ts);
  if (fromLogs) return fromLogs;
  const relaxedLogs = historyAuditActorFromModuleLogs(moduleLabel, entityId, entityLabel, action, ts, {
    strictAction: false
  });
  if (relaxedLogs) return relaxedLogs;
  return historyAuditLatestActorFromModuleLogs(moduleLabel, entityId, entityLabel, action);
}

function enrichHistoryAuditEntriesWithExplicitActors(entries) {
  const explicit = entries.filter((e) => String(e.id || "").startsWith("audit-explicit-"));
  if (!explicit.length) return entries;
  for (const syn of entries) {
    if (String(syn.id || "").startsWith("audit-explicit-") || syn.actor) continue;
    const synMs = new Date(syn.ts).getTime();
    if (Number.isNaN(synMs)) continue;
    let bestActor = "";
    let bestEx = null;
    let bestDelta = Infinity;
    for (const ex of explicit) {
      if (!historyAuditEntriesCorrelate(syn, ex)) continue;
      const exMs = historyAuditTimestampMs(ex.at || ex.ts);
      if (Number.isNaN(exMs)) continue;
      const delta = Math.abs(exMs - synMs);
      if (delta <= HISTORY_AUDIT_ACTOR_MATCH_MS && delta < bestDelta) {
        bestDelta = delta;
        bestEx = ex;
        bestActor =
          String(ex.usuario || "").trim() ||
          historyAuditUsuarioFromLogRow(ex, { fallbackToSession: false }) ||
          historyAuditActorFromLogRow(ex, { fallbackToSession: false });
      }
    }
    if (bestActor && bestEx) {
      syn.actor = bestActor;
      if (!syn.usuario) syn.usuario = String(bestEx.usuario || bestActor).trim();
      if (!syn.actorUserId && bestEx.actorUserId) syn.actorUserId = String(bestEx.actorUserId).trim();
      if (!syn.actorEmail && bestEx.actorEmail) syn.actorEmail = String(bestEx.actorEmail).trim();
    }
  }
  return entries;
}

function dedupeHistoryAuditEntries(entries) {
  const hasExplicit = entries.some((e) => String(e.id || "").startsWith("audit-explicit-"));
  const hasSynthetic = entries.some((e) => !String(e.id || "").startsWith("audit-explicit-"));
  if (!hasExplicit || !hasSynthetic) return entries;
  const dropExplicitIds = new Set();
  for (const explicit of entries) {
    if (!String(explicit.id || "").startsWith("audit-explicit-")) continue;
    const explicitMs = new Date(explicit.ts).getTime();
    if (Number.isNaN(explicitMs)) continue;
    const sibling = entries.find((other) => {
      if (String(other.id || "").startsWith("audit-explicit-")) return false;
      if (!historyAuditEntriesCorrelate(other, explicit)) return false;
      const otherMs = new Date(other.ts).getTime();
      return !Number.isNaN(otherMs) && Math.abs(otherMs - explicitMs) <= HISTORY_AUDIT_ACTOR_MATCH_MS;
    });
    if (!sibling) continue;
    const explicitActor = historyAuditActorFromLogRow(explicit, { fallbackToSession: false });
    const explicitUsuario =
      historyAuditUsuarioFromLogRow(explicit, { fallbackToSession: false }) ||
      explicitActor ||
      "";
    if (explicitUsuario && !sibling.actor) {
      sibling.actor = explicitActor || explicitUsuario;
      sibling.usuario = explicitUsuario;
      if (!sibling.actorUserId && explicit.actorUserId) {
        sibling.actorUserId = String(explicit.actorUserId).trim();
      }
      if (!sibling.actorEmail && explicit.actorEmail) {
        sibling.actorEmail = String(explicit.actorEmail).trim();
      }
    }
    if (sibling.actor || sibling.usuario || explicitUsuario) dropExplicitIds.add(explicit.id);
  }
  return dropExplicitIds.size ? entries.filter((e) => !dropExplicitIds.has(e.id)) : entries;
}

function historyAuditEntriesCacheKey(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const first = list[0] || {};
  const last = list[list.length - 1] || {};
  return [
    list.length,
    first.id || "",
    first.at || "",
    first.fecha_actualizacion || "",
    last.id || "",
    last.at || "",
    last.fecha_actualizacion || "",
    state.__historyAuditPresentationBackfilled ? "1" : "0"
  ].join("|");
}

function backfillModuleAuditLogActors() {
  const list = readModuleAuditLogs();
  if (!list.length) return;
  let changed = false;
  const next = list.map((row) => {
    const formatted = formatHistoryAuditPresentation(row);
    let actorUserId = String(formatted.actorUserId || "").trim();
    let actorEmail = String(formatted.actorEmail || "").trim();
    let actor = historyAuditActorFromLogRow(formatted);
    if (!actorUserId && (actorEmail || actor)) {
      const user = readArray(KEYS.users).find(
        (u) => normalizeEmail(u.email) === normalizeEmail(actorEmail || actor)
      );
      if (user) actorUserId = String(user.id || "").trim();
    }
    if (!actorEmail && actorUserId) {
      const user = readArray(KEYS.users).find((u) => String(u.id) === actorUserId);
      if (user?.email) actorEmail = String(user.email).trim();
    }
    if (!actor && actorUserId) actor = historyAuditUserLabelById(actorUserId);
    if (!actor && actorEmail) actor = actorEmail;
    const usuario =
      String(formatted.usuario || "").trim() || historyAuditFormatStoredUsuario(actor, actorEmail, actorUserId);
    const merged = {
      ...formatted,
      actor: actor || formatted.actor,
      actorUserId,
      actorEmail,
      usuario
    };
    if (
      merged.actor !== String(row.actor || "").trim() ||
      merged.actorUserId !== String(row.actorUserId || "").trim() ||
      merged.actorEmail !== String(row.actorEmail || "").trim() ||
      merged.usuario !== String(row.usuario || "").trim() ||
      merged.entityLabel !== String(row.entityLabel || "").trim() ||
      merged.summary !== String(row.summary || "").trim() ||
      merged.moduleLabel !== String(row.moduleLabel || "").trim()
    ) {
      changed = true;
      return merged;
    }
    return row;
  });
  if (changed) write(KEYS.moduleAuditLogs, next);
}

function buildHistoryAuditEntries() {
  if (!state.__historyAuditPresentationBackfilled) {
    state.__historyAuditPresentationBackfilled = true;
    syncTransportAuditsToModuleLogs();
    backfillModuleAuditLogActors();
  }
  /** Fuente: auditoria_eventos_portal (GET bootstrap / audit-events). Sin entityHistoryActors ni localStorage. */
  const auditRows = readModuleAuditLogs();
  const cacheKey = historyAuditEntriesCacheKey(auditRows);
  if (state.__historyAuditEntriesCache?.key === cacheKey && Array.isArray(state.__historyAuditEntriesCache.entries)) {
    return state.__historyAuditEntriesCache.entries;
  }
  const entries = [];
  auditRows.forEach((row) => {
    const ts = String(row.at || "").trim();
    if (!ts || Number.isNaN(new Date(ts).getTime())) return;
    const actorEmail = String(row.actorEmail || "").trim();
    const actorUserId = String(row.actorUserId || "").trim();
    const actor = historyAuditActorFromLogRow(row, { fallbackToSession: false });
    const usuario = historyAuditUsuarioFromLogRow(row, { fallbackToSession: false });
    entries.push(
      formatHistoryAuditPresentation({
        id: `audit-explicit-${String(row.id || newUuidV4())}`,
        ts,
        action: String(row.action || "update"),
        moduleLabel: normalizePortalAuditModuleLabel(row.moduleLabel || row.moduleId || "Módulo"),
        entityId: String(row.entityId || ""),
        entityLabel: String(row.entityLabel || "Registro"),
        summary: String(row.summary || ""),
        actor,
        actorEmail,
        actorUserId,
        usuario,
        detailAction: String(row.detailAction || ""),
        detailId: String(row.detailId || "")
      })
    );
  });

  const built = dedupeHistoryAuditEntries(enrichHistoryAuditEntriesWithExplicitActors(entries))
    .map((entry) => ({
      ...entry,
      moduleLabel: normalizePortalAuditModuleLabel(entry.moduleLabel),
      usuario: historyAuditUsuarioFromLogRow(entry, { fallbackToSession: false })
    }))
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  state.__historyAuditEntriesCache = { key: cacheKey, entries: built };
  return built;
}

function historyTraceHaystack(entry) {
  return `${entry.moduleLabel || ""} ${entry.entityLabel || ""} ${entry.summary || ""} ${entry.usuario || entry.actor || ""} ${entry.action || ""}`
    .toLowerCase();
}

function renderHistoryAuditCard(entry) {
  const actionLabel = historyAuditActionLabel(entry.action);
  const actionTone = historyAuditActionStatus(entry.action);
  const actionSlug = String(entry.action || "update");
  const actorLabel =
    historyAuditUsuarioFromLogRow(entry, { fallbackToSession: false }) || "Sin registrar";
  const detailButton =
    entry.detailAction && entry.detailId
      ? `<button type="button" class="btn btn-sm btn-outline hist-trace-detail-btn" data-action="${escapeAttr(entry.detailAction)}" data-id="${escapeAttr(entry.detailId)}">${IC.eye}<span>Ver detalle</span></button>`
      : "";
  const haystack = historyTraceHaystack(entry);
  const moduleIconFn = globalThis.historyTraceModuleIconHtml;
  const moduleIcon =
    typeof moduleIconFn === "function" ? moduleIconFn(entry.moduleLabel, "hist-trace-card__module-ico") : "";
  const actionIconFn = globalThis.historyTraceActionIcon;
  const actionIcon = typeof actionIconFn === "function" ? actionIconFn(entry.action) : "";
  const relativeFn = globalThis.historyTraceRelativeTime;
  const relative = typeof relativeFn === "function" ? relativeFn(entry.ts) : "";
  const initialsFn = globalThis.historyTraceActorInitials;
  const initials = typeof initialsFn === "function" ? initialsFn(actorLabel) : "?";
  const relativeHtml = relative
    ? `<span class="hist-trace-card__relative" title="${escapeAttr(fmtDate(entry.ts))}">${escapeHtml(relative)}</span>`
    : "";
  return `<article class="hist-trace-card hist-trace-card--${escapeAttr(actionSlug)}" data-audit-row data-trace-haystack="${escapeAttr(haystack)}">
    <div class="hist-trace-card__rail" aria-hidden="true">
      <span class="hist-trace-card__dot"></span>
      <span class="hist-trace-card__action-ico">${actionIcon}</span>
    </div>
    <div class="hist-trace-card__body">
      <header class="hist-trace-card__head">
        <span class="hist-trace-card__module">${moduleIcon}<span>${escapeHtml(entry.moduleLabel)}</span></span>
        <span class="status ${escapeAttr(actionTone)} hist-trace-card__action">${escapeHtml(actionLabel)}</span>
      </header>
      <h3 class="hist-trace-card__title">${escapeHtml(entry.entityLabel)}</h3>
      <p class="hist-trace-card__summary">${escapeHtml(entry.summary || "Sin resumen")}</p>
      <footer class="hist-trace-card__foot">
        <div class="hist-trace-card__meta">
          <time class="hist-trace-card__time" datetime="${escapeAttr(String(entry.ts || ""))}">${escapeHtml(fmtDate(entry.ts))}</time>
          ${relativeHtml}
        </div>
        <span class="hist-trace-card__actor${actorLabel ? "" : " hist-trace-card__actor--empty"}" title="${actorLabel ? "" : "No se registró el usuario responsable de este cambio"}">
          <span class="hist-trace-card__avatar" aria-hidden="true">${escapeHtml(initials)}</span>
          <span class="hist-trace-card__actor-name">${actorLabel ? escapeHtml(actorLabel) : "Sin registrar"}</span>
        </span>
        ${detailButton ? `<span class="hist-trace-card__detail">${detailButton}</span>` : ""}
      </footer>
    </div>
  </article>`;
}

function renderHistoryAuditRow(entry) {
  const actionLabel = historyAuditActionLabel(entry.action);
  const actionTone = historyAuditActionStatus(entry.action);
  const actionSlug = String(entry.action || "update");
  const actorLabel =
    historyAuditUsuarioFromLogRow(entry, { fallbackToSession: false }) || "Sin registrar";
  const moduleIconFn = globalThis.historyTraceModuleIconHtml;
  const moduleIcon =
    typeof moduleIconFn === "function" ? moduleIconFn(entry.moduleLabel, "hist-trace-table-module-ico") : "";
  const detailButton =
    entry.detailAction && entry.detailId
      ? `<button type="button" class="btn btn-sm btn-outline hist-trace-detail-btn" data-action="${escapeAttr(entry.detailAction)}" data-id="${escapeAttr(entry.detailId)}">${IC.eye}<span>Detalle</span></button>`
      : "";
  const actions = detailButton
    ? `<div class="toolbar history-list-actions">${detailButton}</div>`
    : '<span class="muted">—</span>';
  const relativeFn = globalThis.historyTraceRelativeTime;
  const relative = typeof relativeFn === "function" ? relativeFn(entry.ts) : "";
  const initialsFn = globalThis.historyTraceActorInitials;
  const initials = typeof initialsFn === "function" ? initialsFn(actorLabel) : "?";
  const relativeHtml = relative ? `<span class="hist-trace-table-relative">${escapeHtml(relative)}</span>` : "";
  const actorCell = actorLabel
    ? `<span class="hist-trace-table-actor"><span class="hist-trace-table-avatar" aria-hidden="true">${escapeHtml(initials)}</span><span>${escapeHtml(actorLabel)}</span></span>`
    : '<span class="muted" title="No se registró el usuario responsable">Sin registrar</span>';
  return `<tr class="hist-table-row hist-table-row--audit hist-table-row--${escapeAttr(actionSlug)}" data-audit-row>
    <td data-label="Fecha" class="hist-trace-table-date">
      <time datetime="${escapeAttr(String(entry.ts || ""))}">${escapeHtml(fmtDate(entry.ts))}</time>
      ${relativeHtml}
    </td>
    <td data-label="Módulo"><span class="hist-trace-table-module">${moduleIcon}<span>${escapeHtml(entry.moduleLabel)}</span></span></td>
    <td data-label="Entidad"><strong class="hist-trace-table-entity">${escapeHtml(entry.entityLabel)}</strong></td>
    <td data-label="Acción"><span class="status ${escapeAttr(actionTone)} hist-trace-table-action">${escapeHtml(actionLabel)}</span></td>
    <td data-label="Resumen"><span class="hist-trace-table-summary">${escapeHtml(entry.summary || "Sin resumen")}</span></td>
    <td data-label="Usuario">${actorCell}</td>
    <td data-label="Acciones" class="hist-table-actions">${actions}</td>
  </tr>`;
}

function renderHistoryAuditList(entries, layout = "list") {
  const viewLayout =
    typeof globalThis.normalizeHistoryLayout === "function"
      ? globalThis.normalizeHistoryLayout(layout)
      : String(layout || "").trim().toLowerCase() === "list"
        ? "list"
        : "cards";
  if (!entries.length) {
    return `<div class="hist-empty"><span class="hist-empty__icon" aria-hidden="true">${IC.activity || IC.layers}</span><p>Sin movimientos auditables.</p><p class="muted">Los cambios del sistema aparecerán aquí conforme se registren.</p></div>`;
  }
  if (viewLayout === "list") {
    return `<div class="table-wrap hist-table-wrap hist-trace-table-wrap"><table class="vehicle-fleet-table hist-table hist-trace-table" id="history-audit-results-grid">
    <thead><tr>
      <th scope="col">Fecha</th><th scope="col">Módulo</th><th scope="col">Entidad</th><th scope="col">Acción</th><th scope="col">Resumen</th><th scope="col">Usuario</th><th scope="col">Acciones</th>
    </tr></thead>
    <tbody>${entries.map(renderHistoryAuditRow).join("")}</tbody>
  </table></div>`;
  }
  return `<div class="hist-trace-stream">${entries.map(renderHistoryAuditCard).join("")}</div>`;
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
    const key = r.trip?.vehicleType?.trim() || "Sin viaje asignado";
    acc[key] = (acc[key] || 0) + 1;
  });
  return Object.entries(acc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);
}


function buildReportExportHtml(title, columns = [], rows = [], meta = {}) {
  const b = REPORT_EXPORT_BRAND;
  const logoSrc = reportsBiExcelEsc(meta.logoSrc || reportBrandLogoSrc());
  const copyrightText = reportsBiExcelEsc(meta.copyrightText || reportBrandCopyrightText());
  const safeTitle = reportsBiExcelEsc(title || "Reporte");
  const cols = Array.isArray(columns) ? columns : [];
  const dataRows = Array.isArray(rows) ? rows : [];
  const colMeta = reportPreviewColumnMeta(cols, dataRows);
  const thead = colMeta
    .map((col) => {
      const classes = ["th", `th-${col.type}`];
      if (["currency", "number", "percent"].includes(col.type)) classes.push("is-numeric");
      if (col.pinned) classes.push("is-primary");
      return `<th class="${classes.join(" ")}">${reportsBiExcelEsc(col.label)}</th>`;
    })
    .join("");
  const tbody = dataRows.length
    ? dataRows
        .map(
          (row) =>
            `<tr>${colMeta
              .map((col) => {
                const cellType = reportPreviewResolveCellType(col, row, row[col.key]);
                const classes = ["td", `td-${cellType}`];
                if (["currency", "number", "percent"].includes(cellType)) classes.push("is-numeric");
                if (col.pinned) classes.push("is-primary");
                const display = reportsBiExcelEsc(reportPreviewFormatValue(row[col.key], cellType));
                if (display === "—") return `<td class="${classes.join(" ")}"><span class="empty-value">—</span></td>`;
                if (["status", "risk", "boolean", "tag"].includes(cellType)) {
                  return `<td class="${classes.join(" ")}"><span class="pill pill-${reportPreviewTone(cellType, row[col.key])}">${display}</span></td>`;
                }
                if (cellType === "id") return `<td class="${classes.join(" ")}"><span class="code">${display}</span></td>`;
                if (cellType === "longtext") return `<td class="${classes.join(" ")}"><span class="note">${display}</span></td>`;
                return `<td class="${classes.join(" ")}">${display}</td>`;
              })
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${Math.max(1, cols.length)}" class="empty">Sin datos para el periodo o filtros seleccionados.</td></tr>`;
  const generatedAt = reportsBiExcelEsc(meta.generatedAt || fmtDate(nowIso()));
  const generatedBy = meta.generatedBy ? reportsBiExcelEsc(meta.generatedBy) : "";
  const rowCount = dataRows.length;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${safeTitle} — Transportes Antares</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Montserrat, Arial, sans-serif; color: ${b.text}; background: #f5fbff; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 24px 20px 32px; }
  .banner { background: linear-gradient(135deg, ${b.primaryDeeper}, ${b.primary}); color: #fff; padding: 18px 20px; border-radius: 12px 12px 0 0; }
  .banner-brand { display: flex; align-items: center; gap: 16px; }
  .banner-logo-wrap { width: 86px; min-width: 86px; height: 86px; border-radius: 18px; background: rgba(255,255,255,0.98); padding: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 24px rgba(11, 33, 56, 0.18); }
  .banner-logo { width: 100%; height: 100%; object-fit: contain; display: block; }
  .banner-copy { min-width: 0; flex: 1 1 auto; }
  .banner h1 { margin: 0 0 6px; font-size: 1.35rem; font-weight: 700; }
  .banner p { margin: 0; font-size: 0.82rem; opacity: 0.92; }
  .meta { display: flex; flex-wrap: wrap; gap: 12px 20px; padding: 12px 20px; background: ${b.soft}; border: 1px solid ${b.line}; border-top: none; font-size: 0.78rem; color: ${b.muted}; }
  .meta strong { color: ${b.primaryDeep}; }
  .table-shell { background: #fff; border: 1px solid ${b.line}; border-top: none; border-radius: 0 0 12px 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(55, 124, 192, 0.1); }
  table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.8rem; }
  th { background: ${b.primary}; color: #fff; text-align: left; padding: 11px 12px; font-weight: 700; border: 1px solid ${b.primaryDeep}; vertical-align: bottom; }
  td { padding: 9px 12px; border: 1px solid ${b.line}; vertical-align: top; background: #ffffff; }
  tbody tr:nth-child(even) td { background: rgba(204, 229, 248, 0.22); }
  .is-numeric { text-align: right; font-variant-numeric: tabular-nums; }
  .code { display: inline-block; padding: 2px 7px; border-radius: 999px; background: rgba(55, 124, 192, 0.12); color: ${b.primaryDeeper}; font-weight: 700; }
  .note { display: inline-block; line-height: 1.45; color: ${b.text}; }
  .empty-value { color: ${b.muted}; }
  .pill { display: inline-flex; align-items: center; justify-content: center; min-height: 26px; padding: 2px 10px; border-radius: 999px; font-size: 0.73rem; font-weight: 800; border: 1px solid transparent; white-space: nowrap; }
  .pill-success { background: rgba(27, 142, 95, 0.12); color: #156f4b; border-color: rgba(27, 142, 95, 0.22); }
  .pill-warning { background: rgba(217, 119, 6, 0.12); color: #9a5a04; border-color: rgba(217, 119, 6, 0.22); }
  .pill-danger { background: rgba(214, 40, 40, 0.1); color: #a11d1d; border-color: rgba(214, 40, 40, 0.2); }
  .pill-info { background: rgba(55, 124, 192, 0.12); color: ${b.primaryDeeper}; border-color: rgba(55, 124, 192, 0.2); }
  .pill-neutral { background: rgba(100, 116, 139, 0.12); color: ${b.muted}; border-color: rgba(100, 116, 139, 0.18); }
  td.empty { text-align: center; color: ${b.muted}; font-style: italic; }
  .foot { margin-top: 14px; font-size: 0.72rem; color: ${b.muted}; text-align: center; }
  .print-hint { margin-top: 16px; padding: 10px 14px; background: #fff; border: 1px dashed ${b.line}; border-radius: 8px; font-size: 0.78rem; color: ${b.muted}; }
  @media print {
    body { background: #fff; }
    .wrap { padding: 0; max-width: none; }
    .print-hint { display: none; }
    .table-shell { box-shadow: none; border-radius: 0; }
  }
  @media (max-width: 720px) {
    .banner-brand { align-items: flex-start; }
    .banner-logo-wrap { width: 68px; min-width: 68px; height: 68px; border-radius: 14px; padding: 8px; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <header class="banner">
      <div class="banner-brand">
        <div class="banner-logo-wrap"><img class="banner-logo" src="${logoSrc}" alt="Logo de Transportes Antares" /></div>
        <div class="banner-copy">
          <h1>${safeTitle}</h1>
          <p>Transportes Antares · Centro de reportería</p>
        </div>
      </div>
    </header>
    <div class="meta">
      <span><strong>Generado:</strong> ${generatedAt}</span>
      ${generatedBy ? `<span><strong>Usuario:</strong> ${generatedBy}</span>` : ""}
      <span><strong>Registros:</strong> ${rowCount}</span>
    </div>
    <div class="table-shell">
      <table>
        <thead><tr>${thead}</tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
    <p class="print-hint">Para guardar como PDF: abra este archivo en el navegador y use <strong>Imprimir → Guardar como PDF</strong> (Ctrl+P).</p>
    <p class="foot">${copyrightText}<br/>Documento generado por Antares. Uso interno y operativo.</p>
  </div>
</body>
</html>`;
}

function buildCatalogReportExcelHtml(title, columns = [], rows = [], meta = {}) {
  const safeTitle = reportsBiExcelEsc(title || "Reporte");
  const tableHtml = reportsBiExcelTable(
    (columns || []).map((c) => c.label),
    (rows || []).map((row) => (columns || []).map((col) => row[col.key] ?? "-"))
  );
  const b = REPORT_EXPORT_BRAND;
  const logoSrc = reportsBiExcelEsc(meta.logoSrc || reportBrandLogoSrc());
  const generatedAt = reportsBiExcelEsc(meta.generatedAt || fmtDate(nowIso()));
  const generatedBy = meta.generatedBy ? reportsBiExcelEsc(meta.generatedBy) : "";
  const copyrightText = reportsBiExcelEsc(meta.copyrightText || reportBrandCopyrightText());
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" lang="es">
<head><meta charset="utf-8"/>
<style>
body{font-family:Montserrat,Arial,sans-serif;color:${b.text}}
.xls-logo-cell{background:#ffffff;padding:12px 14px 6px;border-bottom:0}
.xls-logo{width:150px;max-width:150px;height:auto;display:block}
.xls-banner{background:${b.primaryDeeper};color:#fff;font-size:16pt;font-weight:700;padding:12px 14px}
.xls-meta{color:${b.muted};font-size:9pt;padding:8px 14px}
.xls-foot{color:${b.muted};font-size:9pt;padding:10px 14px}
</style>
</head>
<body>
<table width="100%" cellspacing="0" cellpadding="0">
<tr><td class="xls-logo-cell" colspan="${Math.max(4, (columns || []).length)}"><img class="xls-logo" src="${logoSrc}" alt="Logo de Transportes Antares" /></td></tr>
<tr><td class="xls-banner" colspan="${Math.max(4, (columns || []).length)}">${safeTitle}</td></tr>
<tr><td class="xls-meta" colspan="${Math.max(4, (columns || []).length)}">Transportes Antares · ${generatedAt}${generatedBy ? ` · ${generatedBy}` : ""}</td></tr>
<tr><td colspan="${Math.max(4, (columns || []).length)}">${tableHtml}</td></tr>
<tr><td class="xls-foot" colspan="${Math.max(4, (columns || []).length)}">${copyrightText}</td></tr>
</table>
</body></html>`;
}

async function exportCatalogReport(report, format = "pdf") {
  const title = report?.title || "Reporte";
  const columns = report?.columns || [];
  const rows = report?.rows || [];
  const actor = currentUser();
  const meta = {
    generatedAt: fmtDate(nowIso()),
    generatedBy: actor?.name || actor?.email || "",
    logoSrc: reportBrandLogoSrc(),
    copyrightText: reportBrandCopyrightText()
  };
  if (format === "excel") {
    const html = buildCatalogReportExcelHtml(title, columns, rows, meta);
    downloadBlobFile(reportExportFilename(report, "xls"), "\ufeff" + html, "application/vnd.ms-excel;charset=utf-8;");
    return;
  }
  if (format === "html") {
    const html = buildReportExportHtml(title, columns, rows, meta);
    downloadBlobFile(reportExportFilename(report, "html"), html, "text/html;charset=utf-8;");
    return;
  }
  await exportCatalogReportPdf(report, meta);
}

function renderReportPreviewTableHtml(columns = [], rows = []) {
  const cols = Array.isArray(columns) ? columns : [];
  const dataRows = Array.isArray(rows) ? rows : [];
  const colMeta = reportPreviewColumnMeta(cols, dataRows);
  const thead = colMeta
    .map((col) => {
      const classes = ["report-preview-header", `report-preview-header--${col.type}`];
      if (["currency", "number", "percent"].includes(col.type)) classes.push("is-numeric");
      if (col.pinned) classes.push("is-primary");
      return `<th class="${classes.join(" ")}">${escapeHtml(col.label)}</th>`;
    })
    .join("");
  const tbody = dataRows.length
    ? dataRows
        .map(
          (row, rowIndex) =>
            `<tr>${colMeta
              .map((col) => {
                const cellType = reportPreviewResolveCellType(col, row, row[col.key]);
                const classes = ["report-preview-cell", `report-preview-cell--${cellType}`];
                if (["currency", "number", "percent"].includes(cellType)) classes.push("is-numeric");
                if (col.pinned) classes.push("is-primary");
                if (col.key) classes.push(`report-preview-cell--${String(col.key).toLowerCase()}`);
                return `<td class="${classes.join(" ")}">${reportPreviewCellInnerHtml(row[col.key], cellType, { columnKey: col.key, rowIndex, row, column: col })}</td>`;
              })
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td colspan="${Math.max(1, cols.length)}" class="report-preview-empty-row">Sin datos para el periodo o filtros seleccionados.</td></tr>`;
  return `<div class="report-preview-table-wrap"><table class="table report-preview-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
}

function ensureReportPreviewModal() {
  let modal = document.getElementById("report-preview-modal");
  if (modal && (!modal.querySelector(".report-preview-footer-icon") || modal.querySelector(".report-preview-close-primary__icon"))) {
    modal.remove();
    modal = null;
  }
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "report-preview-modal";
  modal.className = "modal hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "report-preview-title");
  modal.innerHTML = `<div class="modal-card modal-card-report-preview">
    <div class="modal-head report-preview-head">
      <div class="report-preview-brand">
        <div class="report-preview-logo-wrap">
          <img id="report-preview-logo" class="report-preview-logo" src="${escapeAttr(reportBrandLogoSrc())}" alt="Logo de Transportes Antares" />
        </div>
        <div>
          <p class="report-preview-kicker">Centro de reportería</p>
          <h2 id="report-preview-title">Reporte</h2>
          <div id="report-preview-stats" class="report-preview-stats"></div>
        </div>
      </div>
      <div class="report-preview-head-actions">
        <button type="button" class="report-preview-close-btn" data-action="report-preview-close" aria-label="Cerrar vista previa">${IC.x}</button>
      </div>
    </div>
    <div id="report-preview-body" class="report-preview-body"></div>
    <div id="report-preview-copy" class="report-preview-footer-bar">
      <span class="report-preview-footer-icon" aria-hidden="true">${IC.info}</span>
      <div class="report-preview-footer-copy">
        <span class="report-preview-footer-brand"></span>
        <span class="report-preview-footer-note">Estados, riesgos y valores destacados para facilitar la lectura del reporte.</span>
      </div>
    </div>
    ${renderModalFooterActions({
      showCancel: false,
      className: "report-preview-actions",
      secondaryHtml: `<button type="button" class="btn btn-sm report-preview-export-btn report-preview-export-btn--pdf module-panel-btn" data-action="report-preview-download-pdf"><span class="report-preview-export-btn__icon">${IC.file}</span> PDF</button>
        <button type="button" class="btn btn-sm report-preview-export-btn report-preview-export-btn--excel module-panel-btn" data-action="report-preview-download-excel"><span class="report-preview-export-btn__icon">${IC.file}</span> Excel</button>
        <button type="button" class="btn btn-sm report-preview-export-btn report-preview-export-btn--print module-panel-btn" data-action="report-preview-print"><span class="report-preview-export-btn__icon">${IC.printer}</span> Imprimir</button>`,
      primaryHtml: `<button type="button" class="btn btn-primary btn-sm report-preview-close-primary module-panel-btn" data-action="report-preview-close">${IC.x} Cerrar</button>`
    })}
  </div>`;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-action='report-preview-close']").forEach((btn) => {
    btn.addEventListener("click", closeReportPreviewModal);
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeReportPreviewModal();
  });
  modal.querySelector("[data-action='report-preview-download-pdf']")?.addEventListener("click", async () => {
    const payload = state.reportPreviewPayload;
    if (!payload) return;
    try {
      await exportCatalogReport(payload, "pdf");
      notify(userMessage("reportPdfOk"), "success");
    } catch (_e) {
      notify(userMessage("reportExportError"), "error");
    }
  });
  modal.querySelector("[data-action='report-preview-download-excel']")?.addEventListener("click", async () => {
    const payload = state.reportPreviewPayload;
    if (!payload) return;
    try {
      await exportCatalogReport(payload, "excel");
      notify(userMessage("reportExcelExported"), "success");
    } catch (_e) {
      notify(userMessage("reportExportError"), "error");
    }
  });
  modal.querySelector("[data-action='report-preview-print']")?.addEventListener("click", () => {
    printReportPreviewDocument();
  });
  return modal;
}

function printReportPreviewDocument() {
  const report = state.reportPreviewPayload;
  if (!report) return;
  const actor = currentUser();
  const html = buildReportExportHtml(report.title, report.columns, report.rows, {
    generatedAt: fmtDate(nowIso()),
    generatedBy: actor?.name || actor?.email || ""
  });
  let frame = document.getElementById("report-print-frame");
  if (!frame) {
    frame = document.createElement("iframe");
    frame.id = "report-print-frame";
    frame.setAttribute("title", "Impresión de reporte");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none";
    document.body.appendChild(frame);
  }
  const doc = frame.contentWindow?.document;
  if (!doc) {
    notify(userMessage("reportExportError"), "error");
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  frame.contentWindow.focus();
  setTimeout(() => {
    try {
      frame.contentWindow.print();
    } catch (_e) {
      notify(userMessage("reportExportError"), "error");
    }
  }, 320);
}

function closeReportPreviewModal() {
  const modal = document.getElementById("report-preview-modal");
  if (modal) modal.classList.add("hidden");
  document.removeEventListener("keydown", reportPreviewEscHandler);
}

function reportPreviewEscHandler(event) {
  if (event.key === "Escape") closeReportPreviewModal();
}

function openReportPreviewModal(report) {
  const exportFilters = normalizeReportsExportFilters(state.reportsUi?.exportFilters || { period: state.reportsUi?.period || "90d" });
  const payload = {
    title: report?.title || "Reporte",
    columns: report?.columns || [],
    rows: report?.rows || [],
    fileName: report?.fileName || "reporte.pdf",
    reportId: String(report?.reportId || "").trim(),
    period: exportFilters.period || "90d"
  };
  state.reportPreviewPayload = payload;
  const modal = ensureReportPreviewModal();
  const actor = currentUser();
  const titleEl = modal.querySelector("#report-preview-title");
  const statsEl = modal.querySelector("#report-preview-stats");
  const bodyEl = modal.querySelector("#report-preview-body");
  const logoEl = modal.querySelector("#report-preview-logo");
  const copyEl = modal.querySelector("#report-preview-copy");
  if (titleEl) titleEl.textContent = payload.title;
  if (statsEl) {
    const rowCount = payload.rows.length;
    const colCount = payload.columns.length;
    const dateStr = fmtDate(nowIso());
    const periodLabel = reportsExportPeriodLabel(payload.period);
    const userChip = actor?.name
      ? `<span class="report-preview-stat">${IC.user}<span>${escapeHtml(actor.name)}</span></span>`
      : "";
    statsEl.innerHTML = `<span class="report-preview-stat">${IC.calendar}<span>Generado ${escapeHtml(dateStr)}</span></span><span class="report-preview-stat">${IC.clock}<span>${escapeHtml(periodLabel)}</span></span>${userChip}<span class="report-preview-stat">${IC.file}<span>${rowCount} registro${rowCount === 1 ? "" : "s"}</span></span><span class="report-preview-stat">${IC.columns}<span>${colCount} columna${colCount === 1 ? "" : "s"}</span></span>`;
  }
  if (logoEl) logoEl.src = reportBrandLogoSrc();
  if (bodyEl) bodyEl.innerHTML = renderReportPreviewTableHtml(payload.columns, payload.rows);
  if (copyEl) {
    const brandEl = copyEl.querySelector(".report-preview-footer-brand");
    if (brandEl) brandEl.textContent = reportBrandCopyrightText();
  }
  modal.classList.remove("hidden");
  document.addEventListener("keydown", reportPreviewEscHandler);
}

/** @deprecated Usar openReportPreviewModal o exportCatalogReport */
function openReportPdf(title, columns = [], rows = []) {
  openReportPreviewModal({ title, columns, rows, fileName: "reporte.pdf" });
}

function deriveRequestOperationalValue(request) {
  const invoiceTotal = parseNum(request?.trip?.invoice?.total || 0);
  if (invoiceTotal > 0) return invoiceTotal;
  const base = parseNum(request?.insuredValue || request?.tripValue || 0);
  const standby = parseNum(request?.standbyChargeTotal || 0);
  return base + standby;
}

function minutesBetween(startDate, endDate) {
  const startTs = new Date(startDate || "").getTime();
  const endTs = new Date(endDate || "").getTime();
  if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || endTs < startTs) return 0;
  return Math.round((endTs - startTs) / 60000);
}

function hoursBetween(startDate, endDate) {
  const mins = minutesBetween(startDate, endDate);
  return Number((mins / 60).toFixed(2));
}

function requestExpectedDeliveryDate(request) {
  return request?.trip?.etaDelivery || request?.etaDelivery || "";
}

function requestActualDeliveryDate(request) {
  return request?.deliveredAt || request?.closedAt || "";
}

function requestIsOperationallyClosed(request) {
  return Boolean(requestActualDeliveryDate(request)) || [STATUS.COMPLETADA, STATUS.CERRADA].includes(request?.status);
}

function reportPercent(value, total, digits = 1) {
  const denom = parseNum(total);
  if (denom <= 0) return 0;
  return Number(((parseNum(value) / denom) * 100).toFixed(digits));
}

function slaDelayMinutesForRequest(request) {
  if (!request?.trip || !requestIsOperationallyClosed(request)) return null;
  const etaTs = new Date(requestExpectedDeliveryDate(request)).getTime();
  const deliveredTs = new Date(requestActualDeliveryDate(request)).getTime();
  if (!Number.isFinite(etaTs) || !Number.isFinite(deliveredTs)) return null;
  return Math.max(0, Math.round((deliveredTs - etaTs) / 60000));
}

function slaStatusForRequest(request) {
  if (!request?.trip) return "Sin viaje";
  const etaTs = new Date(requestExpectedDeliveryDate(request)).getTime();
  if (!Number.isFinite(etaTs)) return "Sin ETA";
  if (!requestIsOperationallyClosed(request)) return "En curso";
  const deliveredTs = new Date(requestActualDeliveryDate(request)).getTime();
  if (!Number.isFinite(deliveredTs)) return "Sin dato";
  return deliveredTs <= etaTs ? "Cumple SLA" : "Incumple SLA";
}

function requestLifecycleSummary(request) {
  const notes = [];
  const rejection = String(request?.rejectionReason || "").trim();
  const cancellation = String(request?.cancellationReason || "").trim();
  const standby = parseNum(request?.standbyChargeTotal || 0);
  const insuredValue = parseNum(request?.insuredValue || 0);
  const distanceKm = parseNum(request?.distanceKm || 0);
  const invoiceNumber = String(request?.trip?.invoice?.number || "").trim();
  if (cancellation) notes.push(`Cancelación: ${cancellation}`);
  if (rejection) notes.push(`Rechazo: ${rejection}`);
  if (request?.autoApproved) notes.push("Aprobación automática");
  if (insuredValue > 0) notes.push(`Asegurado $${insuredValue.toLocaleString("es-CO")}`);
  if (distanceKm > 0) notes.push(`${distanceKm.toLocaleString("es-CO")} km`);
  if (standby > 0) notes.push(`Standby $${standby.toLocaleString("es-CO")}`);
  if (invoiceNumber) notes.push(`Factura ${invoiceNumber}`);
  return notes.join(" · ") || "-";
}

function requestFunnelStageDescription(status) {
  const descriptions = {
    [STATUS.PENDIENTE]: "Solicitud radicada y pendiente de revisión.",
    [STATUS.APROBADA_PENDIENTE_ASIGNACION]: "Solicitud aprobada, pendiente de asignación de recursos.",
    [STATUS.VIAJE_ASIGNADO]: "Viaje creado y listo para iniciar operación.",
    [STATUS.EN_TRANSITO]: "Servicio en ejecución con recursos asignados.",
    [STATUS.ESPERA_STANDBY]: "Operación en espera con cargos de standby activos.",
    [STATUS.COMPLETADA]: "Servicio entregado y pendiente de cierre administrativo final.",
    [STATUS.CERRADA]: "Proceso operativo y administrativo cerrado.",
    [STATUS.CANCELADA]: "Solicitud cancelada antes del cierre.",
    [STATUS.RECHAZADA]: "Solicitud rechazada en validación."
  };
  return descriptions[status] || "Estado operativo registrado en el portal.";
}

function buildReportDataset(reportId, actor = currentUser(), filters = null) {
  const exportFilters = normalizeReportsExportFilters(filters || state.reportsUi?.exportFilters);
  if (!canAccessReport(actor, reportId)) {
    return {
      title: "Reporte restringido",
      columns: [{ key: "message", label: "Detalle" }],
      rows: [{ message: "No tienes permisos para generar este reporte." }],
      fileName: "reporte_restringido.csv"
    };
  }
  const requests = reportsFilterByPeriod(reqRead(), exportFilters.period);
  if (reportId === "executive_control_tower") {
    const trips = requests.filter((request) => request.trip);
    const closedTrips = requests.filter((request) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(request.status));
    const pendingApprovals = requests.filter((request) => request.status === STATUS.PENDIENTE).length;
    const sstControls = reportsFilterItemsByPeriod(read(KEYS.sstCompliance, []), exportFilters.period, (item) => item.dueDate || item.createdAt);
    const payrollRuns = reportsFilterItemsByPeriod(read(KEYS.payrollRuns, []), exportFilters.period, (run) => run.paidAt || run.createdAt || `${run.month || ""}-01`);
    const contracts = reportsFilterItemsByPeriod(read(KEYS.contracts, []), exportFilters.period, (item) => item.createdAt || item.generatedAt || item.signedAt);
    const totalRevenue = requests.reduce((acc, request) => acc + deriveRequestOperationalValue(request), 0);
    const paidPayroll = payrollRuns.filter((run) => run.paid).reduce((acc, run) => acc + parseNum(run.net), 0);
    const openApprovals = reportsFilterItemsByPeriod(read(KEYS.approvals, []), exportFilters.period, (approval) => approval.requestedAt || approval.reviewedAt || approval.createdAt)
      .filter((approval) => approval.status === "pendiente").length;
    const rows = [
      { metric: "Solicitudes totales", value: requests.length, detail: "Acumulado histórico", category: "Operación" },
      { metric: "Solicitudes pendientes", value: pendingApprovals, detail: "Esperando gestión operativa", category: "Operación" },
      { metric: "Viajes cerrados", value: closedTrips.length, detail: `${trips.length} viajes creados`, category: "Operación" },
      { metric: "Ingresos operativos estimados", value: totalRevenue, detail: "Incluye standby e invoice", category: "Finanzas" },
      { metric: "Nómina neta pagada", value: paidPayroll, detail: `${payrollRuns.length} liquidaciones`, category: "Finanzas" },
      { metric: "Contratos emitidos", value: contracts.length, detail: "Formalización laboral", category: "RRHH" },
      { metric: "Controles SST activos", value: sstControls.length, detail: "Seguridad social y documental", category: "Cumplimiento" },
      { metric: "Aprobaciones abiertas", value: openApprovals, detail: "Solicitudes por decidir", category: "Gobierno" }
    ];
    return {
      title: "Resumen ejecutivo de gestión",
      columns: [
        { key: "category", label: "Categoría" },
        { key: "metric", label: "Métrica" },
        { key: "value", label: "Valor" },
        { key: "detail", label: "Detalle" }
      ],
      rows,
      fileName: "reporte_resumen_ejecutivo.csv"
    };
  }
  if (reportId === "service_levels") {
    const rows = requests
      .filter((request) => request.trip)
      .map((request) => {
        const expectedDelivery = requestExpectedDeliveryDate(request);
        const actualDelivery = requestActualDeliveryDate(request);
        const cycleHours = actualDelivery ? hoursBetween(request.createdAt, actualDelivery) : "-";
        const approvalMinutes = request.approvedAt ? minutesBetween(request.createdAt, request.approvedAt) : "-";
        const delayMinutes = slaDelayMinutesForRequest(request);
        return {
          requestNumber: request.requestNumber || request.id,
          tripNumber: request.trip?.tripNumber || "-",
          client: request.clientName || "-",
          route: formatRoute(request),
          assignedAt: fmtDate(request.trip?.assignedAt || request.approvedAt || request.createdAt),
          etaDelivery: expectedDelivery ? fmtDate(expectedDelivery) : "-",
          deliveredAt: actualDelivery ? fmtDate(actualDelivery) : "-",
          status: prettyStatus(request.status, "request").replace(/<[^>]+>/g, ""),
          cycleHours,
          approvalMinutes,
          delayMinutes: delayMinutes == null ? "-" : delayMinutes,
          slaStatus: slaStatusForRequest(request)
        };
      });
    return {
      title: "Cumplimiento de nivel de servicio",
      columns: [
        { key: "requestNumber", label: "Solicitud" },
        { key: "tripNumber", label: "Viaje" },
        { key: "slaStatus", label: "SLA" },
        { key: "status", label: "Estado actual" },
        { key: "client", label: "Cliente" },
        { key: "route", label: "Ruta" },
        { key: "assignedAt", label: "Asignación" },
        { key: "etaDelivery", label: "ETA entrega" },
        { key: "deliveredAt", label: "Entrega real" },
        { key: "approvalMinutes", label: "Aprobación (min)" },
        { key: "delayMinutes", label: "Desviación (min)" },
        { key: "cycleHours", label: "Ciclo (h)" }
      ],
      rows,
      fileName: "reporte_cumplimiento_nivel_servicio.csv"
    };
  }
  if (reportId === "fleet_summary") {
    const activeTrips = getActiveTrips();
    const busyVehicleIds = new Set(activeTrips.map((r) => String(r.trip?.vehicleId || "")).filter(Boolean));
    const rows = read(KEYS.vehicles, []).map((vehicle) => {
      const trips = requests.filter((r) => r.trip?.vehicleId === vehicle.id);
      const activeTripsForVehicle = trips.filter((r) => tripRequestStatusIsOperational(r.status)).length;
      const completed = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
      const closurePct = reportPercent(completed, trips.length, 1);
      const soatRisk = docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate);
      const techRisk = docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate);
      const occupancy =
        busyVehicleIds.has(String(vehicle.id))
          ? "Ocupado (viaje activo)"
          : vehicle.available
            ? "Disponible"
            : "No disponible";
      return {
        plate: vehicle.plate,
        type: vehicle.type,
        capacityKg: parseNum(vehicle.capacityKg),
        operationalState: occupancy,
        activeTrips: activeTripsForVehicle,
        historicalTrips: trips.length,
        completedTrips: completed,
        closurePct: `${closurePct}%`,
        documentRisk: soatRisk.days < 0 || techRisk.days < 0 ? "Crítico" : (soatRisk.days <= 30 || techRisk.days <= 30 ? "Atención" : "Controlado"),
        soatExpiry: vehicle.soatExpiryDate || "-",
        techExpiry: vehicle.techInspectionExpiryDate || "-"
      };
    });
    return {
      title: "Disponibilidad y productividad de flota",
      columns: [
        { key: "plate", label: "Placa" },
        { key: "type", label: "Tipo" },
        { key: "capacityKg", label: "Capacidad kg" },
        { key: "operationalState", label: "Estado operativo" },
        { key: "activeTrips", label: "Viajes activos" },
        { key: "historicalTrips", label: "Viajes históricos" },
        { key: "completedTrips", label: "Viajes finalizados" },
        { key: "closurePct", label: "Cierre histórico" },
        { key: "documentRisk", label: "Riesgo documental" },
        { key: "soatExpiry", label: "Vence SOAT" },
        { key: "techExpiry", label: "Vence tecnomecánica" }
      ],
      rows,
      fileName: "reporte_disponibilidad_flota.csv"
    };
  }
  if (reportId === "trips_operations") {
    const rows = requests.filter((r) => r.trip).map((request) => {
      const actualDelivery = requestActualDeliveryDate(request);
      return {
        tripNumber: request.trip.tripNumber,
        requestNumber: request.requestNumber || request.id,
        client: request.clientName,
        driver: request.trip.driverName,
        vehicle: request.trip.vehiclePlate,
        route: formatRoute(request),
        serviceMode: normalizeRequestTransportMode(request.serviceType),
        thermoking: requestRequiresTermoking(request) ? "Sí" : "No",
        status: prettyStatus(request.status, "request").replace(/<[^>]+>/g, ""),
        slaStatus: slaStatusForRequest(request),
        cycleHours: actualDelivery ? hoursBetween(request.createdAt, actualDelivery) : "-",
        operationalValue: parseNum(deriveRequestOperationalValue(request)),
        standbyValue: parseNum(request.standbyChargeTotal || 0),
        invoiceNumber: request.trip?.invoice?.number || "-",
        assignedAt: fmtDate(request.trip.assignedAt || request.approvedAt || request.createdAt),
        deliveredAt: actualDelivery ? fmtDate(actualDelivery) : "-"
      };
    });
    return {
      title: "Seguimiento operativo de viajes",
      columns: [
        { key: "tripNumber", label: "Viaje" },
        { key: "status", label: "Estado" },
        { key: "slaStatus", label: "SLA" },
        { key: "client", label: "Cliente" },
        { key: "route", label: "Ruta" },
        { key: "driver", label: "Conductor" },
        { key: "vehicle", label: "Camion" },
        { key: "serviceMode", label: "Modalidad" },
        { key: "thermoking", label: "Termoking" },
        { key: "assignedAt", label: "Asignado" },
        { key: "deliveredAt", label: "Entrega/Cierre" },
        { key: "cycleHours", label: "Ciclo (h)" },
        { key: "operationalValue", label: "Valor operativo" },
        { key: "standbyValue", label: "Standby" },
        { key: "invoiceNumber", label: "Factura" },
        { key: "requestNumber", label: "Solicitud" }
      ],
      rows,
      fileName: "reporte_seguimiento_viajes.csv"
    };
  }
  if (reportId === "requests_lifecycle") {
    const rows = requests.map((request) => ({
      requestNumber: request.requestNumber || request.id,
      requestedBy: request.requestedByName || request.clientName || "-",
      company: getCompanyById(request.clientCompanyId)?.name || "-",
      route: formatRoute(request),
      serviceMode: normalizeRequestTransportMode(request.serviceType),
      value: parseNum(deriveRequestOperationalValue(request)),
      status: prettyStatus(request.status, "request").replace(/<[^>]+>/g, ""),
      approvedBy: request.approvedBy || "-",
      approvalMinutes: request.approvedAt ? minutesBetween(request.createdAt, request.approvedAt) : "-",
      hasTrip: request.trip ? "Sí" : "No",
      createdAt: fmtDate(request.createdAt),
      approvedAt: request.approvedAt ? fmtDate(request.approvedAt) : "-",
      lifecycleNote: requestLifecycleSummary(request)
    }));
    return {
      title: "Trazabilidad de solicitudes",
      columns: [
        { key: "requestNumber", label: "Solicitud" },
        { key: "status", label: "Estado" },
        { key: "requestedBy", label: "Solicitante" },
        { key: "company", label: "Empresa" },
        { key: "route", label: "Ruta" },
        { key: "serviceMode", label: "Modalidad" },
        { key: "value", label: "Valor viaje" },
        { key: "hasTrip", label: "Tiene viaje" },
        { key: "approvedBy", label: "Responsable decisión" },
        { key: "approvalMinutes", label: "Aprobación (min)" },
        { key: "createdAt", label: "Creada" },
        { key: "approvedAt", label: "Aprobada" },
        { key: "lifecycleNote", label: "Novedad relevante" }
      ],
      rows,
      fileName: "reporte_trazabilidad_solicitudes.csv"
    };
  }
  if (reportId === "drivers_performance") {
    const rows = read(KEYS.drivers, []).map((driver) => {
      const trips = requests.filter((r) => r.trip?.driverId === driver.id);
      const licenseDays = daysUntil(driver.licenseExpiry);
      const activeTrips = trips.filter((r) => tripRequestStatusIsOperational(r.status)).length;
      const completedTrips = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
      return {
        name: driver.name,
        doc: driver.idDoc || "-",
        phone: driver.phone || "-",
        company: getCompanyById(driver.companyId)?.name || "-",
        license: `${driver.license || "-"} (${driver.licenseCategory || "-"})`,
        licenseRisk:
          !Number.isFinite(licenseDays)
            ? "Sin fecha"
            : licenseDays < 0
              ? `Vencida (${Math.abs(licenseDays)} días)`
              : licenseDays <= 30
                ? `Por vencer (${licenseDays} días)`
                : `Vigente (${licenseDays} días)`,
        activeTrips,
        trips: trips.length,
        completedTrips,
        completionRate: `${reportPercent(completedTrips, trips.length, 1)}%`
      };
    });
    return {
      title: "Desempeño y habilitación de conductores",
      columns: [
        { key: "name", label: "Conductor" },
        { key: "doc", label: "Documento" },
        { key: "phone", label: "Telefono" },
        { key: "company", label: "Empresa" },
        { key: "license", label: "Licencia" },
        { key: "licenseRisk", label: "Vigencia licencia" },
        { key: "activeTrips", label: "Viajes activos" },
        { key: "trips", label: "Viajes totales" },
        { key: "completedTrips", label: "Viajes finalizados" },
        { key: "completionRate", label: "Tasa de cierre" }
      ],
      rows,
      fileName: "reporte_desempeno_conductores.csv"
    };
  }
  if (reportId === "payroll_summary") {
    const payrollRuns = reportsFilterItemsByPeriod(read(KEYS.payrollRuns, []), exportFilters.period, (run) => run.paidAt || run.createdAt || `${run.month || ""}-01`);
    const hrAbsences = read(KEYS.hrAbsences, []);
    const rows = payrollRuns.map((run) => {
      const inc = run.noveltiesDetail?.incapacity;
      const incapacityAdjust = inc ? parseNum(inc.totalAdjustCop) : 0;
      const incapacitySummary =
        inc && Array.isArray(inc.episodes) && inc.episodes.length
          ? inc.episodes
              .map((e) => `${e.days ?? "?"}d·${parseNum(e.adjustCop).toLocaleString("es-CO")}`)
              .join("; ")
          : "";
      const absenceSummary = buildPayrollAbsenceSummaryText(run, hrAbsences);
      return {
        month: run.month,
        employee: run.employeeName,
        gross: parseNum(run.gross),
        incapacityAdjust,
        incapacitySummary,
        absenceSummary,
        travelAllowance: parseNum(run.travelAllowance || 0),
        fuelReimbursement: parseNum(run.fuelReimbursement || 0),
        deductions: parseNum(run.deductions),
        net: parseNum(run.net),
        paidAt: run.paidAt ? fmtDate(run.paidAt) : "-",
        paidApprovedBy: run.paidApprovedBy || "-",
        status: run.paid ? "Pagado" : "Pendiente"
      };
    });
    return {
      title: "Consolidado de nómina",
      columns: [
        { key: "month", label: "Mes" },
        { key: "employee", label: "Empleado" },
        { key: "gross", label: "Devengado" },
        { key: "incapacityAdjust", label: "Ajuste ausentismos (COP)" },
        { key: "incapacitySummary", label: "Incapacidad (resumen)" },
        { key: "absenceSummary", label: "Ausentismos (resumen)" },
        { key: "travelAllowance", label: "Viaticos" },
        { key: "fuelReimbursement", label: "Reembolso combustible" },
        { key: "deductions", label: "Deducciones" },
        { key: "net", label: "Neto" },
        { key: "paidAt", label: "Fecha pago" },
        { key: "paidApprovedBy", label: "Aprobado por" },
        { key: "status", label: "Estado" }
      ],
      rows,
      fileName: "reporte_consolidado_nomina.csv"
    };
  }
  if (reportId === "hiring_pipeline") {
    const interviews = read(KEYS.interviews, []);
    const contracts = reportsFilterItemsByPeriod(read(KEYS.contracts, []), exportFilters.period, (item) => item.createdAt || item.generatedAt || item.signedAt);
    const candidates = reportsFilterItemsByPeriod(read(KEYS.candidates, []), exportFilters.period, (candidate) => candidate.createdAt);
    const rows = candidates.map((candidate) => {
      const ai = portalCandidateAgeFromBirthIso(candidate.birthDate);
      const interviewCount = interviews.filter((item) => String(item.candidateId || "") === String(candidate.id)).length;
      const contract = contracts.find((item) => String(item.candidateId || "") === String(candidate.id));
      return {
        name: candidate.name,
        vacancy: candidate.vacancyTitle,
        source: candidate.source || "-",
        status: candidate.status,
        birthDate: ai.birthLabel === "—" ? "-" : ai.birthLabel,
        ageYears: ai.age != null ? String(ai.age) : "-",
        expCargoYears: parseNum(candidate.experienceYears || 0),
        expectedSalary: parseNum(candidate.expectedSalary || 0),
        interviewCount,
        hasInterview: interviewCount > 0 ? "Sí" : "No",
        hasContract: contract ? "Sí" : "No",
        contractDate: contract?.createdAt ? fmtDate(contract.createdAt) : "-",
        stageAgeDays: Math.max(0, Math.floor((Date.now() - new Date(candidate.createdAt || nowIso()).getTime()) / 86400000)),
        createdAt: fmtDate(candidate.createdAt)
      };
    });
    return {
      title: "Gestión de selección y contratación",
      columns: [
        { key: "name", label: "Candidato" },
        { key: "vacancy", label: "Vacante" },
        { key: "source", label: "Fuente" },
        { key: "status", label: "Estado proceso" },
        { key: "birthDate", label: "Fecha nacimiento" },
        { key: "ageYears", label: "Edad" },
        { key: "expCargoYears", label: "Años exp. cargo" },
        { key: "expectedSalary", label: "Aspiracion" },
        { key: "interviewCount", label: "Entrevistas" },
        { key: "hasInterview", label: "Entrevista" },
        { key: "hasContract", label: "Contrato" },
        { key: "contractDate", label: "Fecha contrato" },
        { key: "stageAgeDays", label: "Edad etapa (días)" },
        { key: "createdAt", label: "Fecha" }
      ],
      rows,
      fileName: "reporte_seleccion_contratacion.csv"
    };
  }
  if (reportId === "labor_compliance") {
    const employees = read(KEYS.payrollEmployees, []);
    const records = reportsFilterItemsByPeriod(read(KEYS.sstCompliance, []), exportFilters.period, (item) => item.dueDate || item.createdAt);
    const rows = records.map((item) => {
      const employee = employees.find((row) => String(row.id || "") === String(item.employeeId || ""));
      const dueDays = Number.isFinite(daysUntil(item.dueDate)) ? daysUntil(item.dueDate) : null;
      return {
        employee: item.employeeName || employee?.name || "-",
        employeeDoc: employee?.idDoc || "-",
        control: item.recordType || "-",
        provider: item.provider || "-",
        dueDate: item.dueDate || "-",
        daysToDue: dueDays == null ? "-" : dueDays,
        riskLevel: dueDays == null ? "Sin fecha" : dueDays < 0 ? "Vencido" : dueDays <= 30 ? "Próximo a vencer" : "Controlado",
        status: item.status || "-",
        documentCode: item.documentCode || "-",
        createdAt: fmtDate(item.createdAt)
      };
    });
    return {
      title: "Cumplimiento laboral y SST",
      columns: [
        { key: "employee", label: "Empleado" },
        { key: "employeeDoc", label: "Documento" },
        { key: "control", label: "Control" },
        { key: "provider", label: "Entidad" },
        { key: "dueDate", label: "Vencimiento" },
        { key: "daysToDue", label: "Días al vencimiento" },
        { key: "riskLevel", label: "Riesgo" },
        { key: "status", label: "Estado" },
        { key: "documentCode", label: "Codigo" },
        { key: "createdAt", label: "Registro" }
      ],
      rows,
      fileName: "reporte_cumplimiento_laboral_sst.csv"
    };
  }
  if (reportId === "users_access") {
    const users = reportsFilterItemsByPeriod(read(KEYS.users, []), exportFilters.period, (user) => user.systemJoinDate || user.registeredAt || user.createdAt);
    const rows = users.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      company: getCompanyById(user.companyId)?.name || user.company || "-",
      status: user.accountStatus || "aprobado",
      permissions: (user.permissions || []).length,
      source: user.source || "portal_db",
      joinDate: fmtDate(user.systemJoinDate || user.registeredAt || user.createdAt)
    }));
    return {
      title: "Gobierno de usuarios y accesos",
      columns: [
        { key: "name", label: "Nombre" },
        { key: "email", label: "Correo" },
        { key: "role", label: "Rol" },
        { key: "company", label: "Empresa" },
        { key: "status", label: "Estado cuenta" },
        { key: "permissions", label: "Permisos" },
        { key: "source", label: "Origen" },
        { key: "joinDate", label: "Ingreso sistema" }
      ],
      rows,
      fileName: "reporte_gobierno_accesos.csv"
    };
  }
  if (reportId === "authorizations_traceability") {
    const approvals = reportsFilterItemsByPeriod(read(KEYS.approvals, []), exportFilters.period, (approval) => approval.requestedAt || approval.reviewedAt || approval.createdAt);
    const rows = approvals.map((approval) => ({
      title: approval.title,
      type: approval.type,
      status: approval.status,
      requestedBy: approval.requestedByName,
      requestedAt: fmtDate(approval.requestedAt),
      reviewedBy: approval.reviewedBy || "-",
      reviewedAt: fmtDate(approval.reviewedAt),
      resolutionHours: approval.reviewedAt ? hoursBetween(approval.requestedAt, approval.reviewedAt) : "-",
      rejectionReason: approval.rejectionReason || "-"
    }));
    return {
      title: "Trazabilidad de autorizaciones",
      columns: [
        { key: "title", label: "Titulo" },
        { key: "type", label: "Tipo" },
        { key: "status", label: "Estado" },
        { key: "requestedBy", label: "Solicitante" },
        { key: "requestedAt", label: "Fecha solicitud" },
        { key: "reviewedBy", label: "Aprobador" },
        { key: "reviewedAt", label: "Fecha revision" },
        { key: "resolutionHours", label: "Resolución (h)" },
        { key: "rejectionReason", label: "Observación / rechazo" }
      ],
      rows,
      fileName: "reporte_trazabilidad_autorizaciones.csv"
    };
  }
  if (reportId === "fuel_operations") {
    const rows = reportsFilterItemsByPeriod(readFuelLogs(), exportFilters.period, (log) => log.date || log.createdAt).map((log) => ({
      date: log.date || "-",
      driver: log.driverName || "-",
      vehicle: log.vehiclePlate || "-",
      station: log.station || "-",
      liters: parseNum(log.liters),
      totalCost: parseNum(log.totalCost),
      costPerLiter: parseNum(log.costPerLiter),
      paidBy: String(log.paidBy || "empresa").toLowerCase() === "conductor" ? "Conductor (reembolso)" : "Empresa",
      odometerKm: parseNum(log.odometerKm) > 0 ? parseNum(log.odometerKm) : "-",
      tripRef: log.tripNumber || log.requestNumber || "-"
    }));
    return {
      title: "Consumo y costos de combustible",
      columns: [
        { key: "date", label: "Fecha" },
        { key: "driver", label: "Conductor" },
        { key: "vehicle", label: "Vehículo" },
        { key: "station", label: "Estación" },
        { key: "liters", label: "Litros" },
        { key: "totalCost", label: "Costo COP" },
        { key: "costPerLiter", label: "Costo por litro" },
        { key: "paidBy", label: "Pagado por" },
        { key: "odometerKm", label: "Odómetro km" },
        { key: "tripRef", label: "Viaje / solicitud" }
      ],
      rows,
      fileName: "reporte_consumo_combustible.csv"
    };
  }
  if (reportId === "maintenance_fleet") {
    const rows = reportsFilterItemsByPeriod(readVehicleTechnicalLogs(), exportFilters.period, (log) => log.date || log.createdAt).map((log) => ({
      date: log.date || "-",
      vehicle: log.vehiclePlate || "-",
      kind: log.kind || log.type || "-",
      description: String(log.description || "-").slice(0, 120),
      cost: parseNum(log.cost),
      downtimeHours: parseNum(log.downtimeHours || log.hoursOut || 0),
      costPerDowntimeHour:
        parseNum(log.downtimeHours || log.hoursOut || 0) > 0
          ? Math.round(parseNum(log.cost) / parseNum(log.downtimeHours || log.hoursOut || 0))
          : "-",
      status: log.status || "-"
    }));
    return {
      title: "Gestión de mantenimiento de flota",
      columns: [
        { key: "date", label: "Fecha" },
        { key: "vehicle", label: "Vehículo" },
        { key: "kind", label: "Tipo" },
        { key: "description", label: "Descripción" },
        { key: "cost", label: "Costo COP" },
        { key: "downtimeHours", label: "Horas fuera" },
        { key: "costPerDowntimeHour", label: "Costo / hora fuera" },
        { key: "status", label: "Estado" }
      ],
      rows,
      fileName: "reporte_mantenimiento_flota.csv"
    };
  }
  if (reportId === "revenue_by_route") {
    const byRoute = {};
    const totalRevenue = requests.reduce((acc, request) => acc + deriveRequestOperationalValue(request), 0);
    requests
      .filter((r) => r.trip)
      .forEach((r) => {
        const route = formatRoute(r);
        if (!byRoute[route]) byRoute[route] = { trips: 0, revenue: 0, clients: new Set() };
        byRoute[route].trips += 1;
        byRoute[route].revenue += deriveRequestOperationalValue(r);
        byRoute[route].clients.add(String(r.clientName || "Sin cliente").trim() || "Sin cliente");
      });
    const rows = Object.entries(byRoute)
      .map(([route, data]) => ({
        route,
        clients: data.clients.size,
        trips: data.trips,
        revenue: parseNum(data.revenue),
        avgTicket: data.trips ? Math.round(data.revenue / data.trips) : 0,
        sharePct: `${reportPercent(data.revenue, totalRevenue, 1)}%`
      }))
      .sort((a, b) => b.revenue - a.revenue);
    return {
      title: "Ingresos y ticket promedio por ruta",
      columns: [
        { key: "route", label: "Ruta" },
        { key: "clients", label: "Clientes" },
        { key: "trips", label: "Viajes" },
        { key: "revenue", label: "Recaudo COP" },
        { key: "avgTicket", label: "Ticket promedio" },
        { key: "sharePct", label: "% participación" }
      ],
      rows,
      fileName: "reporte_ingresos_por_ruta.csv"
    };
  }
  if (reportId === "request_funnel") {
    const counts = {
      [STATUS.PENDIENTE]: 0,
      [STATUS.APROBADA_PENDIENTE_ASIGNACION]: 0,
      [STATUS.VIAJE_ASIGNADO]: 0,
      [STATUS.EN_TRANSITO]: 0,
      [STATUS.ESPERA_STANDBY]: 0,
      [STATUS.COMPLETADA]: 0,
      [STATUS.CERRADA]: 0,
      [STATUS.CANCELADA]: 0,
      [STATUS.RECHAZADA]: 0
    };
    requests.forEach((r) => {
      if (counts[r.status] != null) counts[r.status] += 1;
      else counts[r.status] = 1;
    });
    const rows = Object.entries(counts)
      .filter(([, n]) => n > 0)
      .map(([status, count]) => ({
        stage: prettyStatus(status, "request").replace(/<[^>]+>/g, ""),
        description: requestFunnelStageDescription(status),
        count,
        pct: requests.length ? `${Number(((count / requests.length) * 100).toFixed(1))}%` : "0%"
      }))
      .sort((a, b) => b.count - a.count);
    return {
      title: "Conversión operativa de solicitudes",
      columns: [
        { key: "stage", label: "Etapa" },
        { key: "description", label: "Lectura de negocio" },
        { key: "count", label: "Cantidad" },
        { key: "pct", label: "% del total" }
      ],
      rows,
      fileName: "reporte_conversion_solicitudes.csv"
    };
  }
  if (reportId === "document_compliance") {
    const rows = read(KEYS.vehicles, []).map((vehicle) => {
      const soat = docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate);
      const tech = docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate);
      const worst = Math.min(soat.days, tech.days);
      return {
        plate: vehicle.plate,
        type: vehicle.type,
        soatStatus: soat.label,
        soatDays: soat.days,
        techStatus: tech.label,
        techDays: tech.days,
        risk:
          worst < 0 ? "Vencido" : worst <= 15 ? "Crítico (15d)" : worst <= 30 ? "Atención (30d)" : "Al día",
        soatExpiry: vehicle.soatExpiryDate || "-",
        techExpiry: vehicle.techInspectionExpiryDate || "-"
      };
    });
    return {
      title: "Cumplimiento documental de flota",
      columns: [
        { key: "plate", label: "Placa" },
        { key: "type", label: "Tipo" },
        { key: "soatStatus", label: "Estado SOAT" },
        { key: "soatDays", label: "Días SOAT" },
        { key: "techStatus", label: "Estado tecnomecánica" },
        { key: "techDays", label: "Días tecnomecánica" },
        { key: "risk", label: "Riesgo" },
        { key: "soatExpiry", label: "Vence SOAT" },
        { key: "techExpiry", label: "Vence técnico" }
      ],
      rows,
      fileName: "reporte_cumplimiento_documental_flota.csv"
    };
  }
  return {
    title: "Reporte",
    columns: [{ key: "message", label: "Detalle" }],
    rows: [{ message: "Reporte no definido." }],
    fileName: "reporte.csv"
  };
}

function reportsPeriodStart(period) {
  const key = String(period || "all").trim();
  const now = new Date();
  if (key === "30d") return new Date(now.getTime() - 30 * 86400000);
  if (key === "90d") return new Date(now.getTime() - 90 * 86400000);
  if (key === "ytd") return new Date(now.getFullYear(), 0, 1);
  if (key === "month") {
    const p = getColombiaDateParts(now);
    return new Date(Number(p.year), Number(p.month) - 1, 1);
  }
  return null;
}

function reportsPeriodLabel(period) {
  const labels = {
    "30d": "Últimos 30 días",
    "90d": "Últimos 90 días",
    month: "Mes actual",
    ytd: "Año en curso",
    all: "Histórico completo"
  };
  return labels[String(period || "90d").trim()] || labels["90d"];
}


function reportsFilterByPeriod(requests, period) {
  const start = reportsPeriodStart(period);
  if (!start) return requests;
  const t0 = start.getTime();
  return requests.filter((r) => {
    const ts = new Date(r.createdAt || r.pickupAt || 0).getTime();
    return Number.isFinite(ts) && ts >= t0;
  });
}

function reportsFilterItemsByPeriod(items, period, pickDateValue) {
  const start = reportsPeriodStart(period);
  const list = Array.isArray(items) ? items : [];
  if (!start) return list;
  const t0 = start.getTime();
  return list.filter((item) => {
    const raw = typeof pickDateValue === "function" ? pickDateValue(item) : item?.createdAt;
    const ts = new Date(raw || "").getTime();
    return Number.isFinite(ts) && ts >= t0;
  });
}

function reportsMonthKey(isoValue) {
  const ts = new Date(isoValue || "").getTime();
  if (!Number.isFinite(ts)) return "";
  const p = getColombiaDateParts(new Date(ts));
  return `${p.year}-${p.month}`;
}


function reportsHumanMonth(key) {
  const k = String(key || "");
  if (!/^\d{4}-\d{2}$/.test(k)) return k || "—";
  const [y, m] = k.split("-");
  const names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const mi = Number(m);
  return `${names[mi - 1] || m} ${y}`;
}

function reportsPctDelta(current, previous) {
  const c = parseNum(current);
  const p = parseNum(previous);
  if (p <= 0) return c > 0 ? 100 : 0;
  return Math.round(((c - p) / p) * 100);
}

function reportsFilterPreviousPeriod(all, period) {
  const start = reportsPeriodStart(period);
  if (!start) return [];
  const t0 = start.getTime();
  const duration = Date.now() - t0;
  const prevStart = t0 - duration;
  return all.filter((r) => {
    const ts = new Date(r.createdAt || r.pickupAt || 0).getTime();
    return Number.isFinite(ts) && ts >= prevStart && ts < t0;
  });
}

function reportsWeekKey(isoValue) {
  const ts = new Date(isoValue || "").getTime();
  if (!Number.isFinite(ts)) return "";
  const d = new Date(ts);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const p = getColombiaDateParts(monday);
  return `${p.year}-W${p.month}-${p.day}`;
}

function reportsBuildInsights(snapshot) {
  const insights = [];
  const k = snapshot.kpis;
  if (k.slaPct >= 90) insights.push({ tone: "ok", title: "SLA sólido", text: `El ${k.slaPct}% de viajes cumple entrega a tiempo en el periodo.` });
  else if (k.slaPct > 0) insights.push({ tone: "warn", title: "SLA mejorable", text: `Solo ${k.slaPct}% cumple SLA. Revise rutas con retraso en el tablero operativo.` });
  if (k.trends.revenue > 15) insights.push({ tone: "ok", title: "Recaudo al alza", text: `Ingresos +${k.trends.revenue}% vs periodo anterior.` });
  else if (k.trends.revenue < -10) insights.push({ tone: "warn", title: "Recaudo a la baja", text: `Ingresos ${k.trends.revenue}% vs periodo anterior.` });
  if (k.docRisk > 0) insights.push({ tone: "alert", title: "Flota en riesgo", text: `${k.docRisk} vehículo(s) con SOAT o tecnomecánica vencida o por vencer.` });
  if (k.assignRate < 70 && k.requests > 5) insights.push({ tone: "warn", title: "Cola de asignación", text: `Solo ${k.assignRate}% de solicitudes tiene viaje. Priorice pendientes de asignar.` });
  if (k.avgTicket > 0) insights.push({ tone: "neutral", title: "Ticket promedio", text: `${snapshot.fmtCop(k.avgTicket)} por operación en el periodo.` });
  return insights.slice(0, 4);
}

function buildReportsAnalyticsSnapshot(user, period = "90d") {
  const all = getVisibleRequestsForUser(user);
  const requests = reportsFilterByPeriod(all, period);
  const prevRequests = reportsFilterPreviousPeriod(all, period);
  const trips = requests.filter((r) => r.trip);
  const prevTrips = prevRequests.filter((r) => r.trip);
  const closed = requests.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status));
  const revenue = requests.reduce((acc, r) => acc + deriveRequestOperationalValue(r), 0);
  const prevRevenue = prevRequests.reduce((acc, r) => acc + deriveRequestOperationalValue(r), 0);
  const slaOk = trips.filter((r) => slaStatusForRequest(r) === "Cumple SLA").length;
  const slaPct = trips.length ? Math.round((slaOk / trips.length) * 100) : 0;
  const standbyTotal = requests.reduce((acc, r) => acc + parseNum(r.standbyChargeTotal || 0), 0);

  const approvalSamples = requests.filter((r) => r.approvedAt).length;
  const approvalMinSum = requests.reduce((acc, r) => acc + minutesBetween(r.createdAt, r.approvedAt), 0);
  const avgApprovalMin = approvalSamples ? Math.round(approvalMinSum / approvalSamples) : 0;

  const cycleSamples = closed.filter((r) => r.deliveredAt || r.closedAt).length;
  const cycleSum = closed.reduce(
    (acc, r) => acc + hoursBetween(r.createdAt, r.deliveredAt || r.closedAt || r.trip?.etaDelivery),
    0
  );
  const avgCycleHours = cycleSamples ? Number((cycleSum / cycleSamples).toFixed(1)) : 0;
  const avgTicket = trips.length ? Math.round(revenue / trips.length) : 0;
  const assignRate = requests.length ? Math.round((trips.length / requests.length) * 100) : 0;
  const closeRate = requests.length ? Math.round((closed.length / requests.length) * 100) : 0;

  const statusCounts = {};
  requests.forEach((r) => {
    const label = String(r.status || "sin_estado");
    statusCounts[label] = (statusCounts[label] || 0) + 1;
  });
  const statusChart = Object.entries(statusCounts)
    .map(([label, value]) => ({ label: prettyStatus(label, "request").replace(/<[^>]+>/g, ""), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const monthRevenue = {};
  const monthTrips = {};
  trips.forEach((r) => {
    const mk = reportsMonthKey(r.trip?.assignedAt || r.approvedAt || r.createdAt);
    if (!mk) return;
    monthRevenue[mk] = (monthRevenue[mk] || 0) + deriveRequestOperationalValue(r);
    monthTrips[mk] = (monthTrips[mk] || 0) + 1;
  });
  const revenueMonths = Object.keys(monthRevenue).sort().slice(-8);
  const revenueSeries = revenueMonths.map((m) => monthRevenue[m] || 0);
  const tripsSeries = revenueMonths.map((m) => monthTrips[m] || 0);
  const revenueLabels = revenueMonths.map(reportsHumanMonth);

  const weekTrips = {};
  trips.forEach((r) => {
    const wk = reportsWeekKey(r.trip?.assignedAt || r.createdAt);
    if (!wk) return;
    weekTrips[wk] = (weekTrips[wk] || 0) + 1;
  });
  const weekKeys = Object.keys(weekTrips).sort().slice(-10);
  const weekSeries = weekKeys.map((k) => weekTrips[k] || 0);

  const clientRevenue = {};
  requests.forEach((r) => {
    const c = String(r.clientName || "Sin cliente").trim();
    clientRevenue[c] = (clientRevenue[c] || 0) + deriveRequestOperationalValue(r);
  });
  const topClients = Object.entries(clientRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const routeTrips = {};
  trips.forEach((r) => {
    const route = formatRoute(r);
    routeTrips[route] = (routeTrips[route] || 0) + 1;
  });
  const topRoutes = Object.entries(routeTrips)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const driverTrips = {};
  trips.forEach((r) => {
    const d = String(r.trip?.driverName || "Sin conductor").trim();
    driverTrips[d] = (driverTrips[d] || 0) + 1;
  });
  const topDrivers = Object.entries(driverTrips)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const tkYes = requests.filter((r) => requestRequiresTermoking(r)).length;
  const tkNo = Math.max(0, requests.length - tkYes);

  const funnel = [
    { label: "Solicitudes", value: requests.length },
    { label: "Aprobadas", value: requests.filter((r) => r.approvedAt).length },
    { label: "Con viaje", value: trips.length },
    { label: "En operación", value: requests.filter((r) => [STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY, STATUS.VIAJE_ASIGNADO].includes(r.status)).length },
    { label: "Cerradas", value: closed.length }
  ];

  const fuelLogs = reportsFilterByPeriod(
    readFuelLogs().map((log) => ({ ...log, createdAt: log.date })),
    period
  );
  const fuelCost = fuelLogs.reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  const fuelLiters = fuelLogs.reduce((acc, log) => acc + parseNum(log.liters), 0);
  const maintCost = reportsFilterByPeriod(
    readVehicleTechnicalLogs().map((log) => ({ ...log, createdAt: log.date })),
    period
  ).reduce((acc, log) => acc + parseNum(log.cost), 0);

  const vehicles = read(KEYS.vehicles, []);
  const activeTrips = getActiveTrips();
  const busyIds = new Set(activeTrips.map((r) => String(r.trip?.vehicleId || "")).filter(Boolean));
  const fleetBusy = busyIds.size;
  const fleetAvailable = vehicles.filter((v) => v.available !== false && !busyIds.has(String(v.id))).length;
  const docRisk = vehicles.filter((v) => {
    const soat = docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
    const tech = docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
    return soat.days < 0 || tech.days < 0 || soat.days <= 30 || tech.days <= 30;
  }).length;
  const fleetUtilPct = vehicles.length ? Math.round((fleetBusy / vehicles.length) * 100) : 0;

  const periodLabels = { "30d": "Últimos 30 días", "90d": "Últimos 90 días", month: "Mes actual", ytd: "Año en curso", all: "Histórico completo" };
  const fmtCop = (n) => `$${parseNum(n).toLocaleString("es-CO")}`;

  const snapshot = {
    period,
    periodLabel: periodLabels[period] || periodLabels["90d"],
    generatedAt: fmtDate(nowIso()),
    fmtCop,
    kpis: {
      requests: requests.length,
      trips: trips.length,
      revenue,
      slaPct,
      fuelCost,
      maintCost,
      standbyTotal,
      fleetAvailable,
      fleetTotal: vehicles.length,
      fleetBusy,
      fleetUtilPct,
      docRisk,
      avgTicket,
      avgApprovalMin,
      avgCycleHours,
      assignRate,
      closeRate,
      slaOk,
      slaTotal: trips.length,
      activeOps: requests.filter((r) => tripRequestStatusIsOperational(r.status)).length,
      trends: {
        revenue: reportsPctDelta(revenue, prevRevenue),
        trips: reportsPctDelta(trips.length, prevTrips.length),
        requests: reportsPctDelta(requests.length, prevRequests.length)
      }
    },
    statusChart,
    revenueMonths,
    revenueLabels,
    revenueSeries,
    tripsSeries,
    weekKeys,
    weekSeries,
    topClients,
    topRoutes,
    topDrivers,
    funnel,
    fuelLiters,
    thermoking: { yes: tkYes, no: tkNo },
    slaOk,
    slaTotal: trips.length
  };
  snapshot.insights = reportsBuildInsights(snapshot);
  return snapshot;
}

function reportsBiTrendHtml(delta) {
  const d = parseNum(delta);
  const cls = d > 0 ? "up" : d < 0 ? "down" : "flat";
  const sign = d > 0 ? "+" : "";
  return `<span class="reports-bi-trend reports-bi-trend--${cls}" title="Vs periodo anterior">${sign}${d}%</span>`;
}

function reportsBiKpiCard(opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const mod = o.mod ? ` reports-bi-kpi--${o.mod}` : "";
  const trend = o.trend != null && o.trend !== "" ? reportsBiTrendHtml(o.trend) : "";
  const meta = o.meta ? `<span class="reports-bi-kpi-meta">${escapeHtml(o.meta)}</span>` : "";
  const icon = o.icon ? `<span class="reports-bi-kpi-ico" aria-hidden="true">${o.icon}</span>` : "";
  return `<article class="reports-bi-kpi${mod}">
    ${icon}
    <div class="reports-bi-kpi-body">
      <span class="reports-bi-kpi-val">${reportsBiDisplayVal(o.value)}</span>
      <span class="reports-bi-kpi-lbl">${escapeHtml(o.label || "")}</span>
      ${meta}
    </div>
    ${trend}
  </article>`;
}

function reportsBiLeaderboardHtml(title, rows, valueKey, format = "num") {
  if (!rows.length) return `<p class="reports-bi-empty">Sin datos en el periodo.</p>`;
  const max = Math.max(...rows.map((r) => parseNum(r[1])), 1);
  const items = rows
    .map((row, i) => {
      const pct = Math.round((parseNum(row[1]) / max) * 100);
      const val =
        format === "cop" ? `$${parseNum(row[1]).toLocaleString("es-CO")}` : String(parseNum(row[1]));
      return `<li class="reports-bi-lb-item">
        <span class="reports-bi-lb-rank">${i + 1}</span>
        <div class="reports-bi-lb-main">
          <span class="reports-bi-lb-name" title="${escapeAttr(row[0])}">${escapeHtml(row[0].length > 32 ? `${row[0].slice(0, 30)}…` : row[0])}</span>
          <span class="reports-bi-lb-bar"><i style="width:${pct}%"></i></span>
        </div>
        <span class="reports-bi-lb-val">${val}</span>
      </li>`;
    })
    .join("");
  return `<div class="reports-bi-lb"><h4>${escapeHtml(title)}</h4><ol>${items}</ol></div>`;
}

function reportsBiPeriodChip(value, label, current) {
  const active = current === value ? " is-active" : "";
  return `<button type="button" class="reports-bi-chip${active}" data-action="reports-bi-period-chip" data-period="${escapeAttr(value)}" aria-pressed="${current === value ? "true" : "false"}">${escapeHtml(label)}</button>`;
}



function persistReportsBiLayout(layout) {
  const normalized = normalizeReportsBiLayout(layout);
  state.reportsUi = { ...(state.reportsUi || {}), layout: normalized };
  try {
    localStorage.setItem(reportsBiLayoutStorageKey(), JSON.stringify(normalized));
  } catch (_e) {
    /* noop */
  }
  return normalized;
}

function reportsBiLayoutFromPanel(root) {
  const panel = root?.querySelector(".reports-bi-customizer");
  if (!panel) return loadReportsBiLayout();
  const readChecked = (sel) => panel.querySelector(sel)?.checked === true;
  const layout = reportsBiDefaultLayout();
  layout.insights = readChecked('[data-bi-scope="insights"]');
  Object.keys(layout.kpis).forEach((key) => {
    layout.kpis[key] = readChecked(`[data-bi-scope="kpis"][data-bi-key="${key}"]`);
  });
  Object.keys(layout.scores).forEach((key) => {
    layout.scores[key] = readChecked(`[data-bi-scope="scores"][data-bi-key="${key}"]`);
  });
  Object.keys(layout.charts).forEach((key) => {
    layout.charts[key] = readChecked(`[data-bi-scope="charts"][data-bi-key="${key}"]`);
  });
  return normalizeReportsBiLayout(layout);
}

function reportsBiLayoutPreset(preset) {
  const all = reportsBiDefaultLayout();
  if (preset === "all") return all;
  if (preset === "min") {
    return normalizeReportsBiLayout({
      insights: false,
      kpis: { revenue: true, trips: true, requests: true, sla: true, cycle: false, fuel: false, maint: false, fleet: false, docs: false },
      scores: { sla: true, assign: true, thermoking: false },
      charts: { revenue: true, weekly: false, funnel: true, status: true, clients: false, routes: false, drivers: false, rankings: false }
    });
  }
  if (preset === "finance") {
    return normalizeReportsBiLayout({
      insights: true,
      kpis: { revenue: true, trips: true, requests: false, sla: false, cycle: false, fuel: true, maint: true, fleet: false, docs: false },
      scores: { sla: false, assign: false, thermoking: false },
      charts: { revenue: true, weekly: false, funnel: false, status: false, clients: true, routes: false, drivers: false, rankings: true }
    });
  }
  if (preset === "ops") {
    return normalizeReportsBiLayout({
      insights: true,
      kpis: { revenue: false, trips: true, requests: true, sla: true, cycle: true, fuel: false, maint: false, fleet: true, docs: true },
      scores: { sla: true, assign: true, thermoking: true },
      charts: { revenue: false, weekly: true, funnel: true, status: true, clients: false, routes: true, drivers: true, rankings: false }
    });
  }
  return all;
}

function reportsBiDisplayVal(value, fallback = "—") {
  if (value === undefined || value === null) return fallback;
  const s = String(value);
  if (s === "undefined" || s === "NaN" || s === "[object Object]") return fallback;
  return s;
}

function reportsBiCustomizerHtml(layout) {
  const L = normalizeReportsBiLayout(layout);
  const chk = (scope, key, label, checked) =>
    `<label class="reports-bi-customizer-item"><input type="checkbox" data-bi-scope="${escapeAttr(scope)}" data-bi-key="${escapeAttr(key)}"${checked ? " checked" : ""}/><span class="reports-bi-customizer-item-label">${escapeHtml(label)}</span></label>`;
  const kpiChecks = [
    chk("kpis", "revenue", "Recaudo", L.kpis.revenue),
    chk("kpis", "trips", "Viajes", L.kpis.trips),
    chk("kpis", "requests", "Solicitudes", L.kpis.requests),
    chk("kpis", "sla", "SLA", L.kpis.sla),
    chk("kpis", "cycle", "Ciclo / aprobación", L.kpis.cycle),
    chk("kpis", "fuel", "Combustible", L.kpis.fuel),
    chk("kpis", "maint", "Taller", L.kpis.maint),
    chk("kpis", "fleet", "Flota", L.kpis.fleet),
    chk("kpis", "docs", "Documentos", L.kpis.docs)
  ].join("");
  const scoreChecks = [
    chk("scores", "sla", "Anillo SLA", L.scores.sla),
    chk("scores", "assign", "Conversión a viaje", L.scores.assign),
    chk("scores", "thermoking", "Termoking vs seco", L.scores.thermoking)
  ].join("");
  const chartChecks = [
    chk("charts", "revenue", "Recaudo mensual", L.charts.revenue),
    chk("charts", "weekly", "Actividad semanal", L.charts.weekly),
    chk("charts", "funnel", "Conversión operativa", L.charts.funnel),
    chk("charts", "status", "Estados", L.charts.status),
    chk("charts", "clients", "Top clientes", L.charts.clients),
    chk("charts", "routes", "Rutas", L.charts.routes),
    chk("charts", "drivers", "Conductores", L.charts.drivers),
    chk("charts", "rankings", "Rankings", L.charts.rankings)
  ].join("");
  return `<div class="reports-bi-customizer" aria-label="Personalizar analítica">
    <div class="reports-bi-customizer-head">
      <div class="reports-bi-customizer-copy">
        <h3 class="reports-bi-customizer-title">${IC.grid} Arme su vista</h3>
        <p class="reports-bi-customizer-hint">Elija indicadores y gráficas. La selección se guarda en este equipo y aplica al Excel.</p>
      </div>
      <div class="reports-bi-customizer-presets">
        <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-layout-preset" data-preset="all">Todo</button>
        <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-layout-preset" data-preset="min">Mínimo</button>
        <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-layout-preset" data-preset="finance">Finanzas</button>
        <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-layout-preset" data-preset="ops">Operación</button>
        <button type="button" class="btn btn-sm btn-approve" data-action="reports-bi-layout-apply">${IC.check} Aplicar vista</button>
      </div>
    </div>
    <div class="reports-bi-customizer-grid">
      <fieldset class="reports-bi-customizer-group">
        <legend>General</legend>
        <div class="reports-bi-customizer-checks">
          ${chk("insights", "insights", "Hallazgos automáticos", L.insights)}
        </div>
      </fieldset>
      <fieldset class="reports-bi-customizer-group">
        <legend>Indicadores</legend>
        <div class="reports-bi-customizer-checks">
          ${kpiChecks}
        </div>
      </fieldset>
      <fieldset class="reports-bi-customizer-group">
        <legend>Cumplimiento</legend>
        <div class="reports-bi-customizer-checks">
          ${scoreChecks}
        </div>
      </fieldset>
      <fieldset class="reports-bi-customizer-group">
        <legend>Gráficas y rankings</legend>
        <div class="reports-bi-customizer-checks reports-bi-customizer-checks--dual">
          ${chartChecks}
        </div>
      </fieldset>
    </div>
  </div>`;
}

function reportsAnalyticsPanelHtml(snapshot, layout) {
  const L = normalizeReportsBiLayout(layout);
  const k = snapshot.kpis;
  const fmtCop = snapshot.fmtCop;
  const slaOk = k.slaOk ?? snapshot.slaOk ?? 0;
  const slaTotal = k.slaTotal ?? snapshot.slaTotal ?? 0;
  const activeOps = k.activeOps ?? snapshot.activeOps ?? 0;
  const period = snapshot.period || "90d";
  const insightsHtml = (snapshot.insights || [])
    .map(
      (ins) =>
        `<article class="reports-bi-insight reports-bi-insight--${escapeAttr(ins.tone || "neutral")}">
          <strong>${escapeHtml(ins.title)}</strong>
          <p>${escapeHtml(ins.text)}</p>
        </article>`
    )
    .join("");
  return `<section class="reports-bi" aria-label="Analítica operativa">
    <header class="reports-bi-toolbar">
      <div class="reports-bi-toolbar-intro">
        <p class="reports-bi-kicker">Reportería · BI</p>
        <h2 class="reports-bi-title">Analítica operativa</h2>
        <p class="reports-bi-sub">${escapeHtml(snapshot.periodLabel)} · comparativa vs periodo anterior</p>
        <span class="reports-bi-updated">Corte ${escapeHtml(snapshot.generatedAt)}</span>
      </div>
      <div class="reports-bi-toolbar-controls">
        <div class="reports-bi-period-chips" role="group" aria-label="Periodo rápido">
          ${reportsBiPeriodChip("30d", "30 d", period)}
          ${reportsBiPeriodChip("90d", "90 d", period)}
          ${reportsBiPeriodChip("month", "Mes", period)}
          ${reportsBiPeriodChip("ytd", "Año", period)}
          ${reportsBiPeriodChip("all", "Todo", period)}
        </div>
        <div class="reports-bi-period-summary" aria-label="Periodo analizado">
          <span class="reports-bi-period-badge">${IC.calendar} ${escapeHtml(snapshot.periodLabel)}</span>
          <span class="reports-bi-period-note">Corte activo del tablero</span>
        </div>
        <div class="reports-bi-toolbar-btns">
          <button type="button" class="btn btn-sm btn-action" data-action="reports-bi-refresh" title="Recalcular indicadores">${IC.clock} Actualizar</button>
          <button type="button" class="btn btn-sm btn-approve" data-action="reports-bi-export-excel" title="Excel con gráficas y datos del periodo">${IC.download} Excel</button>
          <button type="button" class="btn btn-sm btn-action" data-action="generate-report" data-report="executive_control_tower" data-format="preview" title="Vista previa sin ventana emergente">${IC.eye} Resumen ejecutivo</button>
        </div>
      </div>
      <div class="reports-bi-toolbar-stats" aria-label="Resumen del periodo">
        <span class="reports-bi-stat"><strong>${activeOps}</strong><span>En operación</span></span>
        <span class="reports-bi-stat"><strong>${k.assignRate}%</strong><span>Asignadas</span></span>
        <span class="reports-bi-stat"><strong>${k.closeRate}%</strong><span>Cerradas</span></span>
        <span class="reports-bi-stat"><strong>${k.slaPct}%</strong><span>SLA</span></span>
      </div>
    </header>
    ${reportsBiCustomizerHtml(L)}
    ${L.insights && insightsHtml ? `<div class="reports-bi-insights" role="region" aria-label="Hallazgos">${insightsHtml}</div>` : ""}
    ${
      Object.values(L.kpis).some(Boolean)
        ? `<div class="reports-bi-section">
      <h3 class="reports-bi-section-title">Indicadores clave</h3>
      <div class="reports-bi-kpis">
      ${L.kpis.revenue ? reportsBiKpiCard({ mod: "primary", icon: IC.dollar, value: fmtCop(k.revenue), label: "Recaudo operativo", trend: k.trends?.revenue }) : ""}
      ${L.kpis.trips ? reportsBiKpiCard({ icon: IC.truck, value: k.trips, label: "Viajes", trend: k.trends?.trips, meta: `Ticket ${fmtCop(k.avgTicket)}` }) : ""}
      ${L.kpis.requests ? reportsBiKpiCard({ icon: IC.file, value: k.requests, label: "Solicitudes", trend: k.trends?.requests }) : ""}
      ${L.kpis.sla ? reportsBiKpiCard({ mod: "sla", icon: IC.check, value: `${k.slaPct}%`, label: "SLA cumplido", meta: `${slaOk}/${slaTotal} viajes` }) : ""}
      ${L.kpis.cycle ? reportsBiKpiCard({ icon: IC.clock, value: `${k.avgCycleHours}h`, label: "Ciclo promedio", meta: `Aprob. ${k.avgApprovalMin} min` }) : ""}
      ${L.kpis.fuel ? reportsBiKpiCard({ icon: IC.fuel, value: fmtCop(k.fuelCost), label: "Combustible", meta: `${parseNum(snapshot.fuelLiters).toLocaleString("es-CO")} L` }) : ""}
      ${L.kpis.maint ? reportsBiKpiCard({ icon: IC.activity, value: fmtCop(k.maintCost), label: "Taller", meta: k.standbyTotal > 0 ? `Standby ${fmtCop(k.standbyTotal)}` : "Sin standby" }) : ""}
      ${L.kpis.fleet ? reportsBiKpiCard({ icon: IC.truck, value: `${k.fleetAvailable}/${k.fleetTotal}`, label: "Flota libre", meta: `${k.fleetUtilPct}% ocupación` }) : ""}
      ${L.kpis.docs ? reportsBiKpiCard({ mod: k.docRisk ? "warn" : "", icon: IC.shield, value: k.docRisk, label: "Alertas documentales" }) : ""}
    </div>
    </div>`
        : ""
    }
    ${
      Object.values(L.scores).some(Boolean)
        ? `<div class="reports-bi-section reports-bi-section--compact">
      <h3 class="reports-bi-section-title">Cumplimiento y conversión</h3>
    <div class="reports-bi-score-row">
      ${
        L.scores.sla
          ? `<article class="reports-bi-score-card">
        <div class="reports-bi-ring" style="--pct:${k.slaPct}">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <path class="reports-bi-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="reports-bi-ring-fg" stroke-dasharray="${k.slaPct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <strong>${k.slaPct}%</strong>
        </div>
        <div>
          <h3>${IC.check} Cumplimiento SLA</h3>
          <p>${slaOk} de ${slaTotal} viajes entregan a tiempo</p>
        </div>
      </article>`
          : ""
      }
      ${
        L.scores.assign
          ? `<article class="reports-bi-score-card">
        <div class="reports-bi-ring reports-bi-ring--assign" style="--pct:${k.assignRate}">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <path class="reports-bi-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="reports-bi-ring-fg" stroke-dasharray="${k.assignRate}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <strong>${k.assignRate}%</strong>
        </div>
        <div>
          <h3>${IC.compass} Conversión a viaje</h3>
          <p>${k.trips} viajes sobre ${k.requests} solicitudes</p>
        </div>
      </article>`
          : ""
      }
      ${
        L.scores.thermoking
          ? `<article class="reports-bi-score-card reports-bi-score-card--chart">
        <h3>${IC.truck} Termoking vs seco</h3>
        <div class="reports-bi-chart-wrap reports-bi-chart-wrap--mini"><canvas id="reports-chart-thermoking" aria-label="Termoking"></canvas></div>
      </article>`
          : ""
      }
    </div>
    </div>`
        : ""
    }
    ${
      Object.values(L.charts).some(Boolean)
        ? `<div class="reports-bi-section">
      <h3 class="reports-bi-section-title">Visualizaciones</h3>
    <div class="reports-bi-grid">
      ${
        L.charts.revenue
          ? `<article class="reports-bi-card reports-bi-card--xl">
        <header class="reports-bi-card-head">
          <div><h3>${IC.dollar} Recaudo y volumen mensual</h3><p class="reports-bi-card-sub">Ingresos (barras) y viajes (línea)</p></div>
          <span class="reports-bi-card-stat">${fmtCop(k.revenue)}</span>
        </header>
        <div class="reports-bi-chart-wrap reports-bi-chart-wrap--tall"><canvas id="reports-chart-revenue" aria-label="Recaudo mensual"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.weekly
          ? `<article class="reports-bi-card reports-bi-card--wide">
        <header class="reports-bi-card-head">
          <div><h3>${IC.activity} Actividad semanal</h3><p class="reports-bi-card-sub">Viajes por semana</p></div>
        </header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-weekly" aria-label="Tendencia semanal"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.funnel
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.layers} Conversión operativa de solicitudes</h3><p class="reports-bi-card-sub">Desde la radicación hasta el cierre</p></div></header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-funnel" aria-label="Conversión operativa"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.status
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.activity} Estados</h3><p class="reports-bi-card-sub">Distribución actual</p></div></header>
        <div class="reports-bi-chart-wrap reports-bi-chart-wrap--donut"><canvas id="reports-chart-status" aria-label="Estados"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.clients
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.briefcase} Top clientes</h3><p class="reports-bi-card-sub">Por recaudo</p></div></header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-clients" aria-label="Clientes"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.routes
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.mapPin} Rutas activas</h3><p class="reports-bi-card-sub">Por viajes</p></div></header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-routes" aria-label="Rutas"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.drivers
          ? `<article class="reports-bi-card">
        <header class="reports-bi-card-head"><div><h3>${IC.user} Top conductores</h3><p class="reports-bi-card-sub">Viajes asignados</p></div></header>
        <div class="reports-bi-chart-wrap"><canvas id="reports-chart-drivers" aria-label="Conductores"></canvas></div>
      </article>`
          : ""
      }
      ${
        L.charts.rankings
          ? `<article class="reports-bi-card reports-bi-card--wide reports-bi-card--rankings">
        <header class="reports-bi-card-head"><div><h3>${IC.star} Rankings del periodo</h3><p class="reports-bi-card-sub">Mayor impacto comercial y operativo</p></div></header>
        <div class="reports-bi-rankings">
          ${reportsBiLeaderboardHtml("Clientes por recaudo", snapshot.topClients, 1, "cop")}
          ${reportsBiLeaderboardHtml("Conductores por viajes", snapshot.topDrivers, 1, "num")}
        </div>
      </article>`
          : ""
      }
    </div>
    </div>`
        : `<p class="reports-bi-empty reports-bi-section">Seleccione al menos una gráfica en «Arme su vista» y pulse Aplicar.</p>`
    }
    <p class="reports-bi-foot muted">Mismos criterios que exportación PDF/CSV · Tendencias vs periodo anterior equivalente · ${escapeHtml(snapshot.periodLabel)}</p>
  </section>`;
}



/** Consulta PostgreSQL para duplicidad de documento de colaborador (validación inmediata en formularios). */
async function queryPayrollEmployeeDocumentDuplicateFromApi({
  documentType,
  idDoc,
  companyId,
  excludeId
} = {}) {
  if (!portalCanRefreshFromApi()) return null;
  const api = window.AntaresApi;
  if (!api?.getJson) return null;
  const params = new URLSearchParams({
    documentType: String(documentType || "CC"),
    idDoc: String(idDoc || "").trim()
  });
  const cid = String(companyId || "").trim();
  const xid = String(excludeId || "").trim();
  if (cid) params.set("companyId", cid);
  if (xid) params.set("excludeId", xid);
  try {
    return await api.getJson(`/portal/payroll-employees/check-document?${params.toString()}`);
  } catch (_e) {
    return null;
  }
}


if (typeof window.setBootstrapCallbacks === "function") {
  window.setBootstrapCallbacks({
    applySystemParametersToClientRules: window.applySystemParametersToClientRules,
    onNotificationPreferencesApplied: () => {
      try {
        window.bindNotificationSidebarPrefs?.();
        window.syncNotificationPrefsSidebarUi?.();
      } catch (_e) {
        /* noop */
      }
    },
    setPortalDataHydrating,
    onPostInteractiveBootstrap: () => {
      if (typeof window.portalRefreshAfterBootstrap === "function") {
        try {
          window.portalRefreshAfterBootstrap();
        } catch (_e) {}
      }
    },
    orchestration: {
      tryApiRefreshBridge,
      refreshPositionsCatalogFromApi,
      hydrateOwnProfileFromApi,
      devWarn
    },
    applyPayloadHooks: {
      ensureUsersPermissions,
      normalizeFuelLogsList,
      normalizeVehicleTechnicalLogsList,
      patchOperatorCompanyKindIfNeeded,
      canViewAllNotifications: window.canViewAllNotifications,
      filterNotificationsForUser: window.filterNotificationsForUser,
      mergeNotificationsListPreserveReadAt: window.mergeNotificationsListPreserveReadAt,
      markInboxNotificationsAsToastSeen: window.markInboxNotificationsAsToastSeen,
      sanitizePayrollEmployeeFieldsForPersist,
      normalizePayrollEmployeeRowDates,
      normalizeSstComplianceRow: window.normalizeSstComplianceRow,
      dispatchPositionsCatalogUpdated
    }
  });
}
if (typeof window.hydrateSystemParametersFromCache === "function") {
  window.hydrateSystemParametersFromCache();
}

/** Aplica validación en vivo (mayúsculas / catálogo / teléfono) a campos del formulario de empleado. */
function wirePayrollEmployeeFormFieldSanitization(formEl) {
  if (!formEl) return;
  const upperBlur = [
    "input[name='address']",
    "input[name='costCenter']",
    "textarea[name='illnessDescription']",
    "textarea[name='contractDurationOther']"
  ];
  upperBlur.forEach((sel) => {
    const el = formEl.querySelector(sel);
    if (!el || el.dataset.payrollSanitizeWired === "1") return;
    el.dataset.payrollSanitizeWired = "1";
    const mode =
      String(el.tagName || "").toUpperCase() === "TEXTAREA" && sel.includes("contractDurationOther")
        ? "preserve-text"
        : "db-upper";
    el.setAttribute("data-antares-validate-blur", mode);
    if (mode === "db-upper") el.setAttribute("data-antares-field", "db-upper");
  });
  ["input[name='phone']", "input[name='emergencyPhone']"].forEach((sel) => {
    const el = formEl.querySelector(sel);
    if (!el || el.dataset.payrollPhoneWired === "1") return;
    el.dataset.payrollPhoneWired = "1";
    const national = portalPhoneNationalDigitsForForm(el.value);
    if (national) el.value = national;
    el.setAttribute("data-antares-restrict", "digits");
    el.setAttribute("data-antares-validate-blur", "phone-loose");
    el.setAttribute("inputmode", "tel");
    el.setAttribute("placeholder", "3001234567");
    el.setAttribute("maxlength", "10");
    el.setAttribute("pattern", "[0-9]{10}");
    el.removeAttribute("minlength");
  });
  window.AntaresValidation?.decorateFormFields?.(formEl);
}

/**
 * Verificación inmediata de documento duplicado en formularios de personas: en cuanto el
 * usuario sale del campo «N° documento» (o cambia tipo de documento/empresa) se avisa si ya
 * existe un registro con ese documento, sin esperar a diligenciar todo el formulario ni a que
 * el servidor rechace el guardado.
 *
 * @param {HTMLFormElement} formEl
 * @param {{ storageKey?: string, useCompanyScope?: boolean, excludeId?: string, entityLabel?: string, serverCheck?: boolean, pendingCreateApprovalCheck?: boolean }} [opts]
 * @returns {(opts?: { silent?: boolean }) => Promise<boolean>} `check`: true si NO hay duplicado bloqueante.
 */
function wireFormDocDuplicateCheck(formEl, opts = {}) {
  const V = window.AntaresValidation;
  const docInput = formEl?.querySelector("input[name='idDoc']");
  if (!docInput) return async () => true;
  const storageKey = opts.storageKey || KEYS.payrollEmployees;
  const useCompanyScope = opts.useCompanyScope !== false;
  const entityLabel = opts.entityLabel || "colaborador";
  const serverCheck = opts.serverCheck === true;
  const docTypeSel = formEl.querySelector("select[name='documentType']");
  const companySel = useCompanyScope ? formEl.querySelector("select[name='companyId']") : null;
  const excludeId = String(opts.excludeId || "").trim();
  let dupNotifyTimer = null;
  let lastDupToastSig = "";
  let serverCheckTimer = null;
  let serverCheckSeq = 0;

  const clearBlock = () => {
    if (dupNotifyTimer) {
      clearTimeout(dupNotifyTimer);
      dupNotifyTimer = null;
    }
    lastDupToastSig = "";
    docInput.dataset.dupLastToastMsg = "";
    docInput.dataset.dupToastTs = "";
    docInput.dataset.dupError = "";
    docInput.dataset.serverDupError = "";
    V?.clearFieldError?.(docInput);
    docInput.setCustomValidity?.("");
  };

  const applyDuplicateMessage = (dupMsg, { silent, toastKey, blocking, fromSubmit = false, suppressToast = false }) => {
    if (blocking) {
      docInput.dataset.dupError = "1";
      docInput.dataset.serverDupError = "1";
      V?.setFieldError?.(docInput, dupMsg);
      docInput.setCustomValidity?.(dupMsg);
    } else {
      docInput.dataset.dupError = "";
      docInput.dataset.serverDupError = "";
      docInput.setCustomValidity?.("");
      V?.setFieldError?.(docInput, dupMsg);
    }
    /* Avisos no bloqueantes (p. ej. documento en otra empresa): solo error bajo el campo, sin toast. */
    if (blocking && !suppressToast) {
      const fireDupToast = () => {
        try {
          docInput.dataset.dupToastTs = String(Date.now());
          if (typeof notify === "function") notify(dupMsg, "error", 4200);
        } catch (_e) {
          /* noop */
        }
      };
      if (!silent) {
        /* En submit se re-notifica siempre, salvo que el mismo mensaje acabe de mostrarse
           (p. ej. el blur del campo al hacer clic en «Guardar» disparó el toast hace un instante). */
        const lastToastTs = Number(docInput.dataset.dupToastTs || 0);
        const sameRecentToast =
          docInput.dataset.dupLastToastMsg === dupMsg && Date.now() - lastToastTs < 1200;
        const shouldFire = fromSubmit ? !sameRecentToast : docInput.dataset.dupLastToastMsg !== dupMsg;
        if (shouldFire) {
          docInput.dataset.dupLastToastMsg = dupMsg;
          fireDupToast();
        }
      } else if (lastDupToastSig !== toastKey) {
        lastDupToastSig = toastKey;
        if (dupNotifyTimer) clearTimeout(dupNotifyTimer);
        dupNotifyTimer = setTimeout(() => {
          dupNotifyTimer = null;
          const stillBlocked =
            String(docInput.dataset.dupError || "") === "1" ||
            String(docInput.dataset.serverDupError || "") === "1";
          if (stillBlocked && docInput.value.trim()) {
            docInput.dataset.dupLastToastMsg = dupMsg;
            fireDupToast();
          }
        }, 380);
      }
    }
    if (!silent && blocking) {
      try {
        docInput.scrollIntoView?.({ behavior: "smooth", block: "center" });
      } catch (_e) {
        /* noop */
      }
    }
  };

  const runServerDuplicateCheck = async ({ silent, docType, docVal, companyId, force = false, fromSubmit = false }) => {
    if (!serverCheck || !portalCanRefreshFromApi()) return null;
    const seq = ++serverCheckSeq;
    if (!force) {
      await new Promise((resolve) => {
        clearTimeout(serverCheckTimer);
        serverCheckTimer = setTimeout(resolve, force ? 0 : 320);
      });
      if (seq !== serverCheckSeq) return null;
    }
    const remote = await queryPayrollEmployeeDocumentDuplicateFromApi({
      documentType: docType,
      idDoc: docVal.normalized,
      companyId,
      excludeId
    });
    if (seq !== serverCheckSeq || !remote) return remote;
    if (remote.found) {
      const who = String(remote.name || "").trim() ? ` (${String(remote.name).trim()})` : "";
      const scopeTail = useCompanyScope && companyId ? " en esta empresa" : "";
      const toastKey = `srv:${docVal.normalized}:${companyId || "none"}:${excludeId || "new"}`;
      if (remote.blocking) {
        const localAlreadyBlocking = String(docInput.dataset.dupError || "") === "1";
        const dupMsg = `Ya existe un ${entityLabel} con el documento ${docVal.normalized}${who}${scopeTail}. No puede repetirse.`;
        applyDuplicateMessage(dupMsg, {
          silent,
          toastKey,
          blocking: true,
          fromSubmit,
          /* Si el chequeo local de este mismo ciclo ya notificó el duplicado, no duplicar el toast. */
          suppressToast: localAlreadyBlocking
        });
      } else if (useCompanyScope && !companyId) {
        const dupMsg = `Este documento ya existe${who}. Si es para otra empresa puede continuar; al elegir la empresa se verificará.`;
        applyDuplicateMessage(dupMsg, { silent, toastKey, blocking: false, fromSubmit });
      } else {
        clearBlock();
      }
    } else if (String(docInput.dataset.dupError || "") !== "1") {
      clearBlock();
    }
    return remote;
  };

  const check = async ({ silent = false, forceServer = false, fromSubmit = false } = {}) => {
    const rawDoc = String(docInput.value || "").trim();
    if (!rawDoc) {
      clearBlock();
      serverCheckSeq += 1;
      return true;
    }
    const docType = String(docTypeSel?.value || "CC").toUpperCase();
    const docVal = validateColombianDocument(docType, rawDoc);
    if (!docVal.ok) {
      serverCheckSeq += 1;
      if (String(docInput.dataset.dupError || "") !== "1" && String(docInput.dataset.serverDupError || "") !== "1") {
        clearBlock();
      }
      return true;
    }
    const needle = payrollEmployeeDocumentDedupKey(docType, docVal.normalized);
    const companyId = String(companySel?.value || "").trim();
    const records = read(storageKey, []);
    const matches = records.filter((r) => {
      if (String(r.id || "") === excludeId) return false;
      const rdt = String(r.documentType || "CC").toUpperCase();
      if (rdt !== docType) return false;
      return payrollEmployeeDocumentDedupKey(rdt, r.idDoc) === needle;
    });
    if (!matches.length) {
      /* Sin coincidencia local: quitar aviso visual; el servidor puede volver a marcar duplicado. */
      if (String(docInput.dataset.serverDupError || "") !== "1") {
        clearBlock();
      } else {
        docInput.dataset.dupError = "";
        V?.clearFieldError?.(docInput);
        docInput.setCustomValidity?.("");
      }
    } else {
      const blocking = useCompanyScope
        ? companyId
          ? matches.find((r) => String(r.companyId || "") === companyId)
          : null
        : matches[0];
      if (blocking) {
        const who = String(blocking.name || "").trim() ? ` (${String(blocking.name).trim()})` : "";
        const scopeTail = useCompanyScope ? " en esta empresa" : "";
        const dupMsg = `Ya existe un ${entityLabel} con el documento ${needle}${who}${scopeTail}. No puede repetirse.`;
        const toastKey = `dup:${needle}:${companyId || "none"}:${excludeId || "new"}`;
        applyDuplicateMessage(dupMsg, { silent, toastKey, blocking: true, fromSubmit });
      } else if (useCompanyScope && !companyId) {
        const ref = String(matches[0]?.name || "").trim();
        const who = ref ? ` (${ref})` : "";
        const dupMsg = `Este documento ya existe${who}. Si es para otra empresa puede continuar; al elegir la empresa se verificará.`;
        const toastKey = `warn:${needle}:${excludeId || "new"}`;
        applyDuplicateMessage(dupMsg, { silent, toastKey, blocking: false, fromSubmit });
      } else {
        clearBlock();
      }
    }
    if (
      opts.pendingCreateApprovalCheck &&
      !excludeId &&
      String(docInput.dataset.dupError || "") !== "1"
    ) {
      const pendingRows = listPendingCreateEmployeeApprovalsByDocument(
        read(KEYS.approvals, []),
        docType,
        docVal.normalized
      );
      if (pendingRows.length) {
        const blockingPending = useCompanyScope
          ? companyId
            ? pendingRows.find((row) => String(row?.payload?.companyId || "").trim() === companyId)
            : null
          : pendingRows[0];
        if (blockingPending) {
          const who = String(blockingPending.payload?.name || "").trim()
            ? ` (${String(blockingPending.payload.name).trim()})`
            : "";
          const dupMsg = `${userMessage("employeePendingApprovalExists", needle)}${who}`;
          applyDuplicateMessage(dupMsg, {
            silent,
            toastKey: `pending:${needle}:${companyId || "none"}`,
            blocking: true,
            fromSubmit
          });
        } else if (useCompanyScope && !companyId) {
          const dupMsg = userMessage("employeePendingApprovalExistsSoft");
          applyDuplicateMessage(dupMsg, {
            silent,
            toastKey: `pending-warn:${needle}`,
            blocking: false,
            fromSubmit
          });
        }
      }
    }
    if (serverCheck) {
      await runServerDuplicateCheck({ silent, docType, docVal, companyId, force: forceServer, fromSubmit });
    }
    const blocked =
      String(docInput.dataset.dupError || "") === "1" ||
      String(docInput.dataset.serverDupError || "") === "1";
    return !blocked;
  };

  if (docInput.dataset.dupCheckWired !== "1") {
    docInput.dataset.dupCheckWired = "1";
    docInput.addEventListener("input", () => {
      void check({ silent: true });
    });
    docInput.addEventListener("blur", () => {
      void check({ silent: false, forceServer: true });
    });
    docInput.addEventListener("change", () => {
      void check({ silent: false, forceServer: true });
    });
    docTypeSel?.addEventListener("change", () => {
      void check({ silent: false, forceServer: true });
    });
    companySel?.addEventListener("change", () => {
      void check({ silent: false, forceServer: true });
    });
  }
  return check;
}

/** Alta de empleado (unicidad por empresa, documento + verificación en servidor). */
function wireEmployeePayrollDuplicateDocCheck(formEl, opts = {}) {
  return wireFormDocDuplicateCheck(formEl, {
    storageKey: KEYS.payrollEmployees,
    useCompanyScope: true,
    entityLabel: "colaborador",
    excludeId: opts.excludeId,
    serverCheck: true,
    pendingCreateApprovalCheck: !String(opts.excludeId || "").trim()
  });
}

/** Coincide valor guardado (p. ej. mayúsculas en BD) con opción del catálogo del formulario. */

function prepareEmployeeForContractDocx(employee) {
  const e = ensureEmployeeContractFields(normalizePayrollEmployeeRowDates({ ...(employee || {}) }));
  const positionName = getPositionById(String(e.positionId || ""))?.name || String(e.position || "").trim();
  const wr = String(
    e.workerRole || (positionName.toLowerCase().includes("conductor") ? "conductor" : "empleado")
  );
  const contractType = String(e.contractType || "Termino indefinido").trim();
  let contractDuration = String(e.contractDuration || e.contractDurationText || "").trim();
  if (!contractDuration && isFixedTermContractType(contractType)) {
    contractDuration = "1 año";
  }
  return {
    ...e,
    position: positionName || e.position,
    workerRole: wr,
    city: String(e.city || "").trim(),
    bankName: matchCatalogOptionValue(CO_CATALOGS.banks, e.bankName),
    bankAccountType: matchCatalogOptionValue(CO_CATALOGS.accountTypes, e.bankAccountType || "Ahorros"),
    eps: matchCatalogOptionValue(CO_CATALOGS.eps, e.eps),
    pensionFund: matchCatalogOptionValue(CO_CATALOGS.pensionFunds, e.pensionFund),
    arl: matchCatalogOptionValue(CO_CATALOGS.arl, e.arl),
    contractTemplateKind: normalizeContractTemplateKind(e.contractTemplateKind, contractType, wr),
    contractDuration
  };
}

async function runEmployeeContractGeneration(employeeId) {
  const id = String(employeeId || "").trim();
  const empRaw = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === id);
  if (!empRaw) {
    notify(userMessage("genericError"), "error");
    return;
  }
  const emp = prepareEmployeeForContractDocx(empRaw);
  const miss = validateEmployeeContractDocFields(emp);
  if (miss.length) {
    notify(userMessage("contractEmployeeMissingFields", miss.join(", ")), "error");
    return;
  }
  try {
    await generateOfficialWordContract(
      buildEmployeeContractDocxPayload(emp, { contractTemplateKind: emp.contractTemplateKind })
    );
    notify(userMessage("employeeContractWordOk"), "success");
  } catch (err) {
    notify(String(err?.message || userMessage("genericError")), "error");
  }
}

function syncEmployeeEditCatalogSelects(formEl, employee) {
  if (!formEl || !employee) return;
  const pairs = [
    ["eps", CO_CATALOGS.eps],
    ["pensionFund", CO_CATALOGS.pensionFunds],
    ["arl", CO_CATALOGS.arl],
    ["severanceFund", CO_CATALOGS.severanceFunds],
    ["compensationFund", CO_CATALOGS.compensationFunds],
    ["bankName", CO_CATALOGS.banks],
    ["bankAccountType", CO_CATALOGS.accountTypes],
    ["contributorType", CO_CATALOGS.contributorTypes],
    ["licenseCategory", CO_CATALOGS.licenseCategories],
    ["bloodType", CO_CATALOGS.bloodTypes]
  ];
  for (const [name, catalog] of pairs) {
    const sel = formEl.querySelector(`select[name='${name}']`);
    if (!sel) continue;
    setFormSelectValue(sel, matchCatalogOptionValue(catalog, employee[name]));
  }
  const tplSel = formEl.querySelector("select[name='contractTemplateKind']");
  if (tplSel) {
    setFormSelectValue(
      tplSel,
      normalizeContractTemplateKind(employee.contractTemplateKind, employee.contractType, employee.workerRole)
    );
  }
}

function installEmployeeContractDelegation() {
  if (typeof document === "undefined" || !document.body) return;
  if (document.body.dataset.antaresEmpContractBound === "1") return;
  document.body.dataset.antaresEmpContractBound = "1";
  document.body.addEventListener("click", async (event) => {
    const btn =
      event.target instanceof Element
        ? event.target.closest("[data-action='employee-generate-contract']")
        : null;
    if (!btn) return;
    event.preventDefault();
    const id = String(btn.dataset.id || "").trim();
    if (!id || btn.disabled || btn.dataset.busy === "1") return;
    await runWithBusyButton(btn, () => runEmployeeContractGeneration(id), { busyText: "Generando…" });
  });
}

async function deleteEmployeesCascade(employeeIds = []) {
  const ids = [...new Set(employeeIds.map((id) => String(id || "").trim()).filter(Boolean))];
  if (!ids.length) return 0;
  const employees = read(KEYS.payrollEmployees, []);
  const targets = employees.filter((employee) => ids.includes(String(employee.id)));
  const targetDocDigitsSet = new Set(
    targets.map((employee) => normalizeDocumentDigits(employee.idDoc)).filter(Boolean)
  );

  const payrollRuns = read(KEYS.payrollRuns, []);
  const removedRunIds = payrollRuns
    .filter((run) => ids.includes(String(run.employeeId || "")))
    .map((run) => String(run.id || ""))
    .filter(Boolean);
  const nextPayrollRuns = payrollRuns.filter((run) => !ids.includes(String(run.employeeId || "")));

  const hrAbsences = read(KEYS.hrAbsences, []);
  const removedAbsenceIds = hrAbsences
    .filter((absence) => ids.includes(String(absence.employeeId || "")))
    .map((absence) => String(absence.id || ""))
    .filter(Boolean);
  const nextHrAbsences = hrAbsences.filter((absence) => !ids.includes(String(absence.employeeId || "")));

  const contracts = read(KEYS.contracts, []);
  const removedContractIds = contracts
    .filter((contract) => {
      const employeeId = String(contract.employeeId || "");
      const docDigits = normalizeDocumentDigits(contract.employeeIdDoc);
      return ids.includes(employeeId) || (docDigits && targetDocDigitsSet.has(docDigits));
    })
    .map((contract) => String(contract.id || ""))
    .filter(Boolean);
  const nextContracts = contracts.filter((contract) => {
    const employeeId = String(contract.employeeId || "");
    const docDigits = normalizeDocumentDigits(contract.employeeIdDoc);
    if (ids.includes(employeeId)) return false;
    if (docDigits && targetDocDigitsSet.has(docDigits)) return false;
    return true;
  });

  const nextEmployees = employees.filter((employee) => !ids.includes(String(employee.id)));
  const nextDrivers = read(KEYS.drivers, []).filter((driver) => {
    const docDigits = normalizeDocumentDigits(driver.idDoc);
    return !docDigits || !targetDocDigitsSet.has(docDigits);
  });

  const steps = [
    [KEYS.payrollEmployees, nextEmployees, ids],
    [KEYS.payrollRuns, nextPayrollRuns, removedRunIds],
    [KEYS.hrAbsences, nextHrAbsences, removedAbsenceIds],
    [KEYS.contracts, nextContracts, removedContractIds],
    [KEYS.drivers, nextDrivers, []]
  ];

  for (const [storageKey, nextList, deletedIds] of steps) {
    const ok = await writePortalListPrunedAwaitServer(storageKey, nextList, deletedIds, {
      notifyOnFailure: false
    });
    if (!ok) {
      const err = new Error("No se pudo sincronizar la eliminacion en cascada.");
      devWarn("deleteEmployeesCascade local sync", err);
      throw err;
    }
  }
  return targets.length;
}


function tripsForDriverMonth(driver, month) {
  const range = monthRange(month);
  if (!range || !driver) return [];
  return reqRead().filter((request) => {
    if (!request?.trip || ![STATUS.COMPLETADA, STATUS.CERRADA].includes(request.status)) return false;
    if (String(request.trip.driverId || "") !== String(driver.id || "")) return false;
    const refDate = request.closedAt || request.deliveredAt || request.trip.etaDelivery || request.trip.etaPickup || request.createdAt;
    return dateInRange(refDate, range);
  });
}

function calculateDriverTripReport(driverId, month) {
  const range = monthRange(month);
  if (!range || !driverId) {
    return { trips: [], tripCount: 0, interDepartmentTrips: 0, viaticTotal: 0, fuelTotal: 0, technicalTotal: 0, kmEstimated: 0 };
  }
  const driver = read(KEYS.drivers, []).find((d) => String(d.id) === String(driverId));
  if (!driver) {
    return { trips: [], tripCount: 0, interDepartmentTrips: 0, viaticTotal: 0, fuelTotal: 0, technicalTotal: 0, kmEstimated: 0 };
  }
  const trips = tripsForDriverMonth(driver, month);
  const rules = read(KEYS.travelAllowanceRules, { interDepartmentTripAmount: 85000 });
  const interDepartmentTrips = trips.filter((trip) => String(trip.originDepartment || "") !== String(trip.destinationDepartment || "")).length;
  const viaticTotal = interDepartmentTrips * parseNum(rules.interDepartmentTripAmount);
  const fuelLogs = readFuelLogs().filter((log) => String(log.driverId || "") === String(driver.id) && dateInRange(log.date, range));
  const fuelTotal = fuelLogs.reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  const technicalTotal = readVehicleTechnicalLogs()
    .filter((log) => dateInRange(log.date, range) && trips.some((t) => String(t.trip?.vehicleId || "") === String(log.vehicleId || "")))
    .reduce((acc, log) => acc + parseNum(log.cost), 0);
  const kmEstimated = trips.reduce((acc, trip) => acc + Math.max(0, parseNum(trip.distanceKm || 0)), 0);
  return { trips, tripCount: trips.length, interDepartmentTrips, viaticTotal, fuelTotal, technicalTotal, kmEstimated };
}

function portalCandidateAgeFromBirthIso(birthIso) {
  const s = String(birthIso ?? "")
    .trim()
    .slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { age: null, birthLabel: "—" };
  const [y, mo, d] = s.split("-").map((x) => Number(x));
  const birth = new Date(y, mo - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== mo - 1 || birth.getDate() !== d) {
    return { age: null, birthLabel: s };
  }
  const today = new Date();
  let age = today.getFullYear() - y;
  const md = today.getMonth() - (mo - 1);
  if (md < 0 || (md === 0 && today.getDate() < d)) age -= 1;
  return { age, birthLabel: s };
}

function safeHttpsUrlForCandidateCv(u) {
  const s = String(u || "").trim();
  return /^https?:\/\/.+/i.test(s) ? s : "";
}

function safeMimeForCvBlobStored(m) {
  const base = String(m || "application/octet-stream")
    .split(";")[0]
    ?.trim()
    .toLowerCase();
  if (/^[\w/+.-]+$/.test(base) && base.length < 96) return base;
  return "application/octet-stream";
}

function flattenCandidateAttachmentsForCv(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw != null && typeof raw === "object" && typeof raw !== "bigint") return [raw];
  if (typeof raw === "string" && raw.trim()) {
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p;
      if (p != null && typeof p === "object" && typeof p !== "bigint") return [p];
    } catch (_e) {}
  }
  return [];
}

/** Hay CV persistido (inline, R2 con key o URL) aunque el enlace no este aun en caché local. */
function candidateMayHaveCvInStorage(candidateLike) {
  const attachments = flattenCandidateAttachmentsForCv(candidateLike?.attachments);
  for (const item of attachments) {
    if (item == null || typeof item !== "object") continue;
    const k = String(item.kind || "");
    if (k === "cv_blob" && item.data && item.mime) return true;
    if (k === "cv_file" && (String(item.storageKey || "").trim() || safeHttpsUrlForCandidateCv(item.url))) {
      return true;
    }
  }
  return false;
}

/** Primera fuente descargable: cv_blob inline, si no cv_file con URL http(s) incl. prefirmadas. */
function extractCandidateCvDownload(candidateLike) {
  const attachments = flattenCandidateAttachmentsForCv(candidateLike?.attachments);
  for (const item of attachments) {
    if (item == null || typeof item !== "object") continue;
    const k = String(item.kind || "");
    if (k === "cv_blob" && item.data && item.mime) {
      const mime = safeMimeForCvBlobStored(item.mime);
      const href = `data:${mime};base64,${String(item.data)}`;
      const fileName = String(item.name || "hoja-de-vida").trim() || "hoja-de-vida";
      return { href, fileName };
    }
    if (k === "cv_file") {
      const url = safeHttpsUrlForCandidateCv(item.url);
      if (url) {
        const fileName = String(item.name || "Hoja-de-vida").trim() || "Hoja-de-vida";
        return { href: url, fileName };
      }
    }
  }
  return null;
}

/** GET /portal/candidates/:id/cv-download — URL R2 prefirmada/pública o base64 inline. */
async function fetchCandidateCvDownloadFromApi(candidateId) {
  const id = String(candidateId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return null;
  const api = window.AntaresApi;
  if (!api?.getJson) return null;
  try {
    const data = await api.getJson(`/portal/candidates/${encodeURIComponent(id)}/cv-download`);
    if (!data || typeof data !== "object") return null;
    if (data.url && /^https?:\/\//i.test(String(data.url))) {
      return {
        href: String(data.url),
        fileName: String(data.fileName || "hoja-de-vida").trim() || "hoja-de-vida"
      };
    }
    if (data.data && data.mime) {
      const mime = safeMimeForCvBlobStored(data.mime);
      return {
        href: `data:${mime};base64,${String(data.data)}`,
        fileName: String(data.fileName || "hoja-de-vida").trim() || "hoja-de-vida"
      };
    }
    return null;
  } catch (_e) {
    return null;
  }
}

async function resolveCandidateCvDownload(candidateLike) {
  const local = extractCandidateCvDownload(candidateLike);
  if (local?.href) return local;
  const id = String(candidateLike?.id || "").trim();
  if (!id || !candidateMayHaveCvInStorage(candidateLike)) return null;
  return fetchCandidateCvDownloadFromApi(id);
}

function candidateCvDataUrlToBlob(href) {
  const m = /^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,(.*)$/i.exec(String(href || ""));
  if (!m) return null;
  const mime = (m[1] || "application/octet-stream").trim();
  const payload = m[3] || "";
  if (m[2]) {
    const bin = atob(payload);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  return new Blob([decodeURIComponent(payload)], { type: mime });
}

function triggerBlobDownload(blob, fileNameFallback) {
  const name = String(fileNameFallback || "cv").replace(/[\\/]/g, "_");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** GET /portal/candidates/:id/cv-file — binario con Content-Disposition: attachment. */
async function fetchCandidateCvBlobFromApi(candidateId) {
  const id = String(candidateId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return null;
  const api = window.AntaresApi;
  if (!api?.getBase || !api?.isConfigured?.()) return null;
  const base = api.getBase();
  if (!base) return null;
  const url = `${base}/api/portal/candidates/${encodeURIComponent(id)}/cv-file`;
  const headers = { Accept: "application/octet-stream" };
  const csrf = typeof api.getCsrfToken === "function" ? String(api.getCsrfToken() || "").trim() : "";
  if (csrf) headers["X-CSRF-Token"] = csrf;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include"
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob || !blob.size) return null;
    const cd = res.headers.get("Content-Disposition") || "";
    const fnMatch = /filename\*?=(?:UTF-8''|utf-8'')?["']?([^"';]+)["']?/i.exec(cd);
    const fileName = fnMatch
      ? decodeURIComponent(fnMatch[1].trim())
      : String("hoja-de-vida").trim();
    return { blob, fileName };
  } catch (_e) {
    return null;
  }
}

async function triggerCandidateCvDownload(href, fileNameFallback, candidateId) {
  const name = String(fileNameFallback || "cv").replace(/[\\/]/g, "_");
  const id = String(candidateId || "").trim();
  if (id) {
    const fromApi = await fetchCandidateCvBlobFromApi(id);
    if (fromApi?.blob) {
      triggerBlobDownload(fromApi.blob, fromApi.fileName || name);
      return;
    }
  }
  try {
    let blob = null;
    if (String(href || "").startsWith("data:")) {
      blob = candidateCvDataUrlToBlob(href);
    } else if (/^https?:\/\//i.test(String(href || ""))) {
      const res = await fetch(href, { mode: "cors", credentials: "omit" });
      if (!res.ok) throw new Error("fetch failed");
      blob = await res.blob();
    }
    if (blob && blob.size) {
      triggerBlobDownload(blob, name);
      return;
    }
  } catch (_e) {
    /* continuar al respaldo */
  }
  if (href) {
    window.open(href, "_blank", "noopener,noreferrer");
  }
}

function installCandidateCvDownloadDelegation() {
  if (typeof document === "undefined" || !document.body) return;
  if (document.body.dataset.antaresCvDlBound === "1") return;
  document.body.dataset.antaresCvDlBound = "1";
  document.body.addEventListener("click", async (event) => {
    const btn = event.target instanceof Element ? event.target.closest("[data-action='download-candidate-cv']") : null;
    if (!btn) return;
    if (
      btn.hasAttribute("disabled") ||
      btn.getAttribute("aria-disabled") === "true" ||
      btn.getAttribute("aria-busy") === "true"
    )
      return;
    const id = String(btn.dataset.id || "").trim();
    if (!id) return;
    event.preventDefault();
    const cand = read(KEYS.candidates, []).find((x) => String(x.id) === id);
    if (!cand) {
      notify(userMessage("genericError"), "error");
      return;
    }
    btn.setAttribute("aria-busy", "true");
    btn.disabled = true;
    try {
      const dl = await resolveCandidateCvDownload(cand);
      if (!dl?.href) {
        notify("No hay CV descargable para este candidato.", "info");
        return;
      }
      await triggerCandidateCvDownload(dl.href, dl.fileName, id);
    } finally {
      btn.removeAttribute("aria-busy");
      btn.disabled = false;
    }
  });
}

function renderHiringCandidateCard(c, ctx) {
  const ageInfo = portalCandidateAgeFromBirthIso(c.birthDate);
  const expCargo = parseNum(c.experienceYears || 0);
  const canDlCv = Boolean(ctx.canDlCv);
  const statusClass = hiringPipelineStatusClass(c.status);
  const employeeMatch = findPayrollEmployeeByIdDoc(c.idDoc);
  return `<article class="hiring-candidate-card portal-ops-card trip-ops-card">
    <header class="hiring-candidate-card__head">
      <div>
        <h4>${escapeHtml(String(c.name || ""))}</h4>
        <p class="muted">${escapeHtml(String(c.vacancyTitle || "-"))}</p>
      </div>
      <span class="status ${statusClass}">${escapeHtml(String(c.status || ""))}</span>
    </header>
    <dl class="hiring-candidate-card__meta">
      <div><dt>Contacto</dt><dd>${escapeHtml(String(c.email || "-"))}<br><span class="muted">${escapeHtml(String(c.phone || "-"))}</span></dd></div>
      <div><dt>Experiencia</dt><dd>${expCargo} años · Edad ${ageInfo.age != null ? `${ageInfo.age} años` : "—"}</dd></div>
      <div><dt>Etapa</dt><dd><select class="hiring-status-select" data-action="candidate-status" data-id="${escapeAttr(String(c.id))}">${hiringPipelineSelectOptions(c.status)}</select></dd></div>
    </dl>
    <div class="toolbar hiring-candidate-card__actions">
      <button class="btn btn-sm btn-outline" data-action="view-candidate" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
      ${
        ctx.canScheduleInterview
          ? `<button type="button" class="btn btn-sm btn-action" data-action="schedule-interview-for-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.calendar} Entrevista</button>`
          : ""
      }
      <button type="button" class="btn btn-sm btn-action"${canDlCv ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}">${IC.download} CV</button>
      ${
        ctx.canEdit
          ? `<button class="btn btn-sm btn-action" data-action="create-employee-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}" title="Abrir alta de empleado con datos precargados">${IC.userPlus} Empleado</button>`
          : ""
      }
      ${
        ctx.canEdit && employeeMatch
          ? `<button class="btn btn-sm btn-action" data-action="generate-contract-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}" title="Generar contrato Word">${IC.file} Contrato</button>`
          : ""
      }
      ${ctx.canEdit ? `<button class="btn btn-sm btn-action" data-action="edit-candidate" data-id="${escapeAttr(String(c.id))}">${IC.edit} Editar</button>` : ""}
      ${ctx.canDelete ? `<button class="btn btn-sm btn-reject" data-action="delete-candidate" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash}</button>` : ""}
    </div>
  </article>`;
}



const PortalArch = window.PortalArchitecture || {
  isKnownView: (view) => Boolean(window.VIEW_PERMISSIONS?.[String(view || "")]),
  shouldUseShell: () => true,
  getTitle: (view) => String(view || "Dashboard"),
  getLayoutPlan: () => null,
  isAllowedByRole: () => true,
  resolveContent: ({ accessDeniedFactory }) => accessDeniedFactory()
};

const PortalAccessCore = window.PortalCoreAccess || {
  isViewAllowed: ({ user, view, canAccessView, portalArch, ROLES, canAccessRRHH }) =>
    Boolean(user) && canAccessView(user, view) && portalArch.isAllowedByRole(user, view, { ROLES, canAccessRRHH })
};

const PortalRouterCore = window.PortalCoreRouter || {
  getViewFromHash: ({ hash, isKnownView }) => {
    const raw = String(hash || "");
    if (!raw.startsWith("#portal/")) return "";
    const view = raw.slice("#portal/".length).trim();
    return isKnownView(view) ? view : "";
  },
  syncHash: ({ view, isKnownView, fallbackView = "dashboard" }) => {
    const safeView = isKnownView(view) ? view : fallbackView;
    const nextHash = `#portal/${safeView}`;
    if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
  },
  enforceViewFromUrl: ({ state, user, getViewFromHashFn, syncHashFn, isViewAllowed, fallbackView = "dashboard", onUnauthorized }) => {
    if (!state?.session || !user) return;
    const candidate = getViewFromHashFn();
    if (!candidate) {
      syncHashFn(state.currentView || fallbackView);
      return;
    }
    if (!isViewAllowed(user, candidate)) {
      state.currentView = fallbackView;
      syncHashFn(fallbackView);
      if (typeof onUnauthorized === "function") onUnauthorized(candidate);
      return;
    }
    state.currentView = candidate;
  },
  activateSideLinks: (sideLinks, view) =>
    (sideLinks || []).forEach((link) => link.classList.toggle("active", link.dataset.view === view))
};

const PortalRendererCore = window.PortalCoreRenderer || {
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

function applyManualModuleLayout() {
  if (!nodes.viewRoot || state.currentView === "profile") return;
  const view = String(state.currentView || "");
  const plan = PortalArch.getLayoutPlan(view);
  if (!plan) return;
  PortalRendererCore.applyManualLayout({ viewRoot: nodes.viewRoot, plan });
}


function describeContractDurationForDocx(data) {
  const ct = String(data.contractType || "");
  const start = String(data.startDate || "").trim();
  const end = String(data.endDate || data.contractEndDate || "").trim();
  if (ct === "Termino fijo" && start && end) return `Término fijo: ${start} a ${end}`;
  if (ct === "Termino fijo") return "Término fijo (plazo contractual en cláusulas)";
  if (ct === "Prestacion de servicios") return "Prestación de servicios";
  return start ? `Vigencia desde ${start} · ${ct || "según anexo"}` : String(ct || "Según cláusulas y normativa aplicable");
}

/** Descompone texto guardado (p. ej. "12 meses", "1 año") para el formulario de edición. */
function parseContractDurationFields(text) {
  const t = String(text || "").trim();
  if (!t) return { unit: "", amount: "", other: "" };
  const lower = t.toLowerCase();
  if (/^ind/i.test(lower) || /indefinid/i.test(lower)) return { unit: "otro", amount: "", other: t };
  const mMes = t.match(/^(\d+)\s*mes(es)?\s*$/i);
  if (mMes) {
    const n = parseInt(mMes[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "meses", amount: String(n), other: "" };
  }
  const mAn = t.match(/^(\d+)\s*(años|anos|año|ano)\s*$/i);
  if (mAn) {
    const n = parseInt(mAn[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "anios", amount: String(n), other: "" };
  }
  return { unit: "otro", amount: "", other: t };
}

/** Arma el texto único `contractDuration` a partir de unidad + cantidad u “otro” (texto libre). */
function composeContractDurationText(raw) {
  const unit = String(raw.contractDurationUnit || "").trim().toLowerCase();
  const parsedAmt = parseInt(String(raw.contractDurationAmount ?? "").trim(), 10);
  const amount = Number.isFinite(parsedAmt) ? Math.floor(parsedAmt) : NaN;
  const other = String(raw.contractDurationOther || "").trim();
  const legacy = String(raw.contractDuration || "").trim();
  if (unit === "otro") return other;
  if (unit === "meses" && Number.isFinite(amount) && amount >= 1) {
    return `${amount} ${amount === 1 ? "mes" : "meses"}`;
  }
  if (unit === "anios" && Number.isFinite(amount) && amount >= 1) {
    return `${amount} ${amount === 1 ? "año" : "años"}`;
  }
  return legacy;
}

/**
 * Resuelve URL de imagen (avatar, logo, etc.): intenta presign + PUT directo a R2;
 * si no hay URL pública HTTPS, reintenta con `POST /uploads/image` (subida vía API,
 * evita CORS del bucket). Si no hay API o todo falla, usa `data:` URL (FileReader).
 *
 * Devuelve la URL final (`https://...` o `data:image/...`) o cadena vacía si
 * no hay archivo.
 */
async function resolveEmployeeAvatarUrl(file, fallbackDataUrl = "") {
  if (!file) return String(fallbackDataUrl || "").trim();
  const api = window.AntaresApi;
  const rawMime = String(file.type || "image/jpeg").split(";")[0].trim().toLowerCase();
  const contentType =
    !rawMime || rawMime === "image/jpg" || rawMime === "image/pjpeg" ? "image/jpeg" : rawMime;
  const canUseBackend =
    api &&
    typeof api.postJson === "function" &&
    typeof api.getBase === "function" &&
    api.getBase() &&
    typeof api.isConfigured === "function" &&
    api.isConfigured();

  if (canUseBackend) {
    let publicFromPresign = "";
    try {
      const presign = await api.postJson("/uploads/avatar/presign", {
        fileName: String(file.name || "avatar.jpg"),
        contentType
      });
      const uploadUrl = String(presign?.uploadUrl || "").trim();
      publicFromPresign = String(presign?.publicUrl || "").trim();
      if (uploadUrl) {
        const resp = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file
        });
        if (!resp.ok) throw new Error(`R2 PUT respondió ${resp.status}`);
      }
    } catch (err) {
      devWarn?.("avatar-upload-r2-presign-failed", err);
      publicFromPresign = "";
    }
    if (/^https?:\/\//i.test(publicFromPresign)) return publicFromPresign;

    try {
      if (typeof api.postFormData === "function") {
        const fd = new FormData();
        fd.append("file", file, file.name || "upload.jpg");
        const viaServer = await api.postFormData("/uploads/image", fd);
        const u = String(viaServer?.publicUrl || "").trim();
        if (/^https?:\/\//i.test(u)) return u;
      }
    } catch (err) {
      devWarn?.("avatar-upload-api-failed", err);
    }
  }

  return new Promise((resolve) => {
    const r = new FileReader();
    r.onerror = () => resolve(String(fallbackDataUrl || "").trim());
    r.onload = () => resolve(String(r.result || "").trim());
    r.readAsDataURL(file);
  });
}

/** Vista previa local en el óvalo (misma lógica que perfil de usuario). */
function bindEmployeeAvatarFilePreview(fileInput, labelEl) {
  if (!fileInput || !labelEl) return;
  let previewBlobUrl = "";
  fileInput.addEventListener("change", () => {
    const f = fileInput.files?.[0];
    if (!f || !String(f.type || "").startsWith("image/")) return;
    if (previewBlobUrl && previewBlobUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(previewBlobUrl);
      } catch (_e) {}
      previewBlobUrl = "";
    }
    try {
      previewBlobUrl = URL.createObjectURL(f);
    } catch (_e) {
      previewBlobUrl = "";
    }
    const cssSafe = previewBlobUrl ? previewBlobUrl.replace(/'/g, "\\'") : "";
    labelEl.style.backgroundImage = cssSafe ? `url('${cssSafe}')` : "";
    labelEl.classList.toggle("has-image", Boolean(cssSafe));
    const initial = labelEl.querySelector(".profile-avatar-initial");
    if (initial) initial.textContent = "";
  });
}

/** Alta empleado (wizard): objeto listo para guardar Word o persistir (sin id). */
function buildPayrollEmployeePayloadFromWizard(raw, docNormalized, avatarOpts = {}) {
  const stripLargeAvatar = Boolean(avatarOpts.stripLargeAvatar);
  const preserve = avatarOpts.preserveEmployee && typeof avatarOpts.preserveEmployee === "object"
    ? avatarOpts.preserveEmployee
    : null;
  let merged = String(avatarOpts.avatarUrl ?? raw.avatarUrl ?? "").trim();
  if (merged.startsWith("data:")) merged = "";
  const avatarUrl = merged;
  const position = getPositionById(String(raw.positionId || ""));
  if (!position || position.active === false) {
    return { ok: false, msg: userMessage("recruitSelectActivePosition"), field: "positionId" };
  }
  const salaryCheck = validateColombiaMonthlySalaryCop(raw.baseSalary, "Salario base");
  if (!salaryCheck.ok) {
    return { ok: false, msg: salaryCheck.message, field: "baseSalary" };
  }
  const baseSalary = salaryCheck.amount;
  const ageCheck = validateWorkerMinimumAge(raw.birthDate, "trabajador");
  if (!ageCheck.ok) {
    return { ok: false, msg: ageCheck.message, field: "birthDate" };
  }
  const posIntegral = position.integralSalary === true || String(position.integralSalary) === "true";
  const integralCheck = validateColombiaIntegralSalary(baseSalary, posIntegral);
  if (!integralCheck.ok) {
    return { ok: false, msg: integralCheck.message, field: "baseSalary" };
  }
  const effectiveContractType = String(
    raw.contractType || position.contractTypeDefault || "Termino indefinido"
  ).trim();
  const needsDurationPlazo = contractTypeRequiresDurationPlazo(effectiveContractType);
  let composedDur = needsDurationPlazo ? composeContractDurationText(raw) : "";
  if (isFixedTermContractType(effectiveContractType) && !String(composedDur || "").trim()) {
    composedDur = "1 año";
  }
  const startDateYmd = normalizePortalDateYmd(raw.startDate);
  const contractVigenteStartDateYmd = normalizePortalDateYmd(raw.contractVigenteStartDate);
  const plazoStartYmd = isFixedTermContractType(effectiveContractType)
    ? contractVigenteStartDateYmd || startDateYmd
    : "";
  const contractEndDate = resolveEmployeeContractEndDateYmd(
    effectiveContractType,
    plazoStartYmd,
    raw
  );
  if (needsDurationPlazo && !String(composedDur || "").trim()) {
    const unitDur = String(raw.contractDurationUnit || "").trim().toLowerCase();
    const msg =
      unitDur === "otro"
        ? "Describa la duración en el campo de texto libre o elija meses/años."
        : unitDur === "meses" || unitDur === "anios"
          ? "Indique la cantidad (número) de meses o de años."
          : "Complete la duración del contrato: unidad (meses o años) o texto en “Otro”.";
    const durationField =
      unitDur === "otro"
        ? "contractDurationOther"
        : unitDur === "meses" || unitDur === "anios"
          ? "contractDurationAmount"
          : "contractDurationUnit";
    return { ok: false, msg, field: durationField };
  }
  const resolvedWorkerRole = positionLooksLikeConductor(position)
    ? "conductor"
    : String(position.workerRole || "empleado").toLowerCase();
  const sanitized = sanitizePayrollEmployeeFieldsForPersist({
    ...raw,
    position: position.name,
    workerRole: resolvedWorkerRole,
    contractType: effectiveContractType,
    arlRiskLevel: raw.arlRiskLevel || position.arlRiskLevel || "",
    workSchedule: raw.workSchedule || position.workSchedule || position.schedule || "",
    contractTemplateKind:
      raw.contractTemplateKind ||
      (window.RecruitmentDomain?.inferTemplateKind
        ? window.RecruitmentDomain.inferTemplateKind(effectiveContractType, resolvedWorkerRole)
        : "oficina")
  });
  const phoneNat = portalPhoneNationalDigitsForForm(sanitized.phone);
  if (!/^\d{10}$/.test(phoneNat)) {
    return {
      ok: false,
      msg: "Ingrese el celular de 10 dígitos sin el +57 (ej.: 3001234567).",
      field: "phone"
    };
  }
  const emergencyNat = portalPhoneNationalDigitsForForm(sanitized.emergencyPhone);
  if (!/^\d{10}$/.test(emergencyNat)) {
    return {
      ok: false,
      msg: "Ingrese el teléfono de emergencia de 10 dígitos sin el +57.",
      field: "emergencyPhone"
    };
  }
  return {
    ok: true,
    payload: {
      ...sanitized,
      idDoc: docNormalized,
      birthDate: normalizePortalDateYmd(raw.birthDate),
      hasIllness: String(raw.hasIllness || "no").toLowerCase() === "si" ? "si" : "no",
      positionId: position.id,
      companyId: raw.companyId,
      baseSalary,
      transportAllowance: resolveEmployeeTransportAllowanceCop(
        raw.transportAllowance != null && String(raw.transportAllowance).trim() !== ""
          ? raw.transportAllowance
          : position.transportAllowance,
        baseSalary
      ),
      contractDuration: composedDur,
      contractEndDate,
      startDate: startDateYmd,
      contractVigenteStartDate: isFixedTermContractType(effectiveContractType)
        ? contractVigenteStartDateYmd || startDateYmd
        : "",
      renewalDate: normalizePortalDateYmd(
        raw.renewalDate != null && String(raw.renewalDate).trim() !== ""
          ? raw.renewalDate
          : preserve?.renewalDate
      ),
      nonRenewalNoticeDate: normalizePortalDateYmd(
        raw.nonRenewalNoticeDate != null && String(raw.nonRenewalNoticeDate).trim() !== ""
          ? raw.nonRenewalNoticeDate
          : preserve?.nonRenewalNoticeDate
      ),
      license: String(raw.license || "").trim(),
      licenseExpiry: normalizePortalDateYmd(raw.licenseExpiry),
      occupationalExamDate: normalizePortalDateYmd(raw.occupationalExamDate),
      occupationalExamExpiry: addOneYearToYmd(raw.occupationalExamDate),
      instruvialExamDate: normalizePortalDateYmd(raw.instruvialExamDate),
      instruvialExamExpiry: addOneYearToYmd(raw.instruvialExamDate),
      defensiveCourse: String(raw.defensiveCourse || "").trim().toLowerCase(),
      defensiveCourseExpiry: normalizePortalDateYmd(raw.defensiveCourseExpiry),
      comparendos: Math.max(0, Math.min(9999, parseNum(raw.comparendos ?? 0))),
      experienceYears: Math.max(0, Math.min(80, parseNum(raw.experienceYears ?? 0))),
      vehicleTypes: collectDriverVehicleTypesCsv(raw),
      avatarUrl
    }
  };
}

function validateEmployeeContractDocFields(emp) {
  const miss = [];
  if (!String(emp.name || "").trim()) miss.push("nombre completo");
  if (!String(emp.idDoc || "").trim()) miss.push("numero de documento");
  if (!String(emp.city || "").trim()) miss.push("ciudad de residencia");
  if (!String(emp.bankName || "").trim()) miss.push("banco");
  if (!String(emp.bankAccount || "").trim()) miss.push("numero de cuenta");
  if (!validateColombiaMonthlySalaryCop(emp.baseSalary).ok) miss.push("salario base (minimo legal)");
  const pos = getPositionById(String(emp.positionId || ""));
  const integralFlag = pos?.integralSalary === true || String(pos?.integralSalary) === "true";
  if (integralFlag && !validateColombiaIntegralSalary(emp.baseSalary, true).ok) {
    miss.push("salario integral (minimo 13 SMMLV)");
  }
  if (contractTypeRequiresDurationPlazo(emp.contractType) && !String(emp.contractDuration || "").trim()) {
    miss.push("duracion del contrato");
  }
  if (!String(emp.contractType || "").trim()) miss.push("tipo de contrato");
  if (!String(emp.startDate || "").trim()) miss.push("fecha de ingreso");
  if (isFixedTermContractType(emp.contractType) && !resolveEmployeeContractPlazoStartYmd(emp)) {
    miss.push("fecha inicio contrato vigente");
  }
  if (!String(emp.eps || "").trim()) miss.push("EPS");
  if (!String(emp.pensionFund || "").trim()) miss.push("fondo de pension");
  if (!String(emp.arl || "").trim()) miss.push("ARL");
  if (!String(emp.position || "").trim() && !pos?.name) miss.push("cargo");
  if (!String(emp.companyId || "").trim()) miss.push("empresa");
  return miss;
}

/** Primer campo del wizard empleado asociado a una etiqueta de {@link validateEmployeeContractDocFields}. */
function firstEmployeeContractDocFieldFromMissing(miss) {
  const map = {
    "nombre completo": "name",
    "numero de documento": "idDoc",
    "ciudad de residencia": "city",
    banco: "bankName",
    "numero de cuenta": "bankAccount",
    "salario base (minimo legal)": "baseSalary",
    "salario integral (minimo 13 smmlv)": "baseSalary",
    "duracion del contrato": "contractDurationUnit",
    "tipo de contrato": "contractType",
    "fecha de ingreso": "startDate",
    "fecha inicio contrato vigente": "contractVigenteStartDate",
    eps: "eps",
    "fondo de pension": "pensionFund",
    arl: "arl",
    cargo: "positionId",
    empresa: "companyId"
  };
  for (const label of miss || []) {
    const key = String(label || "").trim().toLowerCase();
    if (map[key]) return map[key];
  }
  return "name";
}

function employeeAvatarCssUrl(av) {
  const u = String(av || "").trim();
  if (/^https?:\/\//i.test(u) || /^data:image\//i.test(u)) return u.replace(/'/g, "\\'");
  return "";
}

function fmtProfileCell(value) {
  const s = value == null || String(value).trim() === "" ? "—" : String(value);
  return escapeHtml(s);
}

/** Creado / actualizado: ISO con hora en zona Colombia, no UTC crudo del servidor. */
function fmtProfileAuditTimestamp(value) {
  if (value == null || String(value).trim() === "") return "—";
  const raw = String(value).trim();
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime()) && /T|\d{2}:\d{2}/.test(raw)) {
    return fmtDate(d);
  }
  return raw;
}

function employeeProfileKvRow(label, value) {
  return `<div class="employee-profile-kv"><span>${escapeHtml(label)}</span><strong>${fmtProfileCell(value)}</strong></div>`;
}

function buildEmployeePayrollProfileBodyHtml(emp) {
  if (!emp) return `<p class="muted">Sin datos.</p>`;
  const e = normalizePayrollEmployeeRowDates(emp);
  const contractRenewal = computeEmployeeContractRenewalMeta(e);
  const css = employeeAvatarCssUrl(e.avatarUrl);
  const initial = escapeHtml(String(e.name || "E").charAt(0).toUpperCase());
  const heroBanner = css
    ? `<div class="employee-profile-hero-photo" style="background-image:url('${css}')" role="img" aria-label="Foto del colaborador"></div>`
    : `<div class="employee-profile-hero-photo employee-profile-hero-photo--letter" aria-hidden="true"><span>${initial}</span></div>`;
  const heroAvatar = css
    ? `<div class="employee-profile-hero-avatar" role="img" aria-label="Foto del colaborador"><img src="${escapeAttr(e.avatarUrl)}" alt="Foto de ${escapeAttr(String(e.name || "Empleado"))}" loading="lazy" /></div>`
    : `<div class="employee-profile-hero-avatar employee-profile-hero-avatar--letter" aria-hidden="true"><span>${initial}</span></div>`;
  const hero = `${heroBanner}<div class="employee-profile-hero-photo-wrap">${heroAvatar}<p class="employee-profile-hero-photo-caption muted">${css ? "Foto del colaborador" : "Sin foto cargada — recomendamos subirla al editar el empleado."}</p></div>`;
  const docs = `${String(e.documentType || "").trim()} ${String(e.idDoc || "").trim()}`.trim();
  const companyName = getCompanyById(e.companyId)?.name || "—";
  const isDriver = String(e.workerRole || "").toLowerCase() === "conductor";
  const driverBlock = isDriver
    ? `
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Conductor</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("N° licencia", e.license)}
      ${employeeProfileKvRow("Categoría licencia", e.licenseCategory)}
      ${employeeProfileKvRow("Vence licencia", e.licenseExpiry)}
      ${employeeProfileKvRow("Examen ocupacional", e.occupationalExamDate)}
      ${employeeProfileKvRow("Vence examen ocupacional", e.occupationalExamExpiry)}
      ${employeeProfileKvRow("Examen instruvial", e.instruvialExamDate)}
      ${employeeProfileKvRow("Vence examen instruvial", e.instruvialExamExpiry)}
      ${employeeProfileKvRow("Curso conducción defensiva", e.defensiveCourse)}
      ${employeeProfileKvRow("Vehículos que conduce", driverVehicleTypesCsvToLabel(e.vehicleTypes, "Sin definir"))}
    </div></section>`
    : "";
  return `
  <article class="employee-profile-card">${hero}<div class="employee-profile-intro">
      <h3 class="employee-profile-name">${escapeHtml(String(e.name || "").trim())}</h3>
      <p class="employee-profile-intro-meta muted">${escapeHtml(String(e.position || "").trim())} · ${escapeHtml(String(e.contractType || "").trim())}${isDriver ? ` · ${escapeHtml("Conductor")}` : ""}</p>
      <span class="employee-profile-chip">${fmtProfileCell(`${parseNum(e.baseSalary).toLocaleString("es-CO")} COP · salario base`)}</span>
    </div>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Identidad</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Documento", docs)}
      ${employeeProfileKvRow("Fecha de nacimiento", e.birthDate)}
      ${employeeProfileKvRow("Género", e.gender)}
      ${employeeProfileKvRow("Estado civil", e.maritalStatus)}
      ${employeeProfileKvRow("Nivel educativo", e.educationLevel)}
      ${employeeProfileKvRow("Tipo sangre RH", e.bloodType)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Contacto</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Departamento", e.department)}
      ${employeeProfileKvRow("Ciudad", e.city)}
      ${employeeProfileKvRow("Dirección", e.address)}
      ${employeeProfileKvRow("Teléfono celular", e.phone)}
      ${employeeProfileKvRow("Correo personal", e.personalEmail)}
      ${employeeProfileKvRow("Contacto emergencia", e.emergencyContact)}
      ${employeeProfileKvRow("Tel. emergencia", e.emergencyPhone)}
      ${employeeProfileKvRow("Parentesco emergencia", e.emergencyRelation)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Salud</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow(
        "¿Condición médica?",
        String(e.hasIllness || "").toLowerCase() === "si" ? "Sí" : "No"
      )}
      ${
        String(e.hasIllness || "").toLowerCase() === "si"
          ? employeeProfileKvRow("Detalle médico", e.illnessDescription || "Sin detalle")
          : ""
      }
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Laboral</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Empresa", companyName)}
      ${employeeProfileKvRow("Centro costos", resolvePayrollEmployeeCostCenter(e))}
      ${employeeProfileKvRow("Fecha ingreso", e.startDate)}
      ${
        isFixedTermContractType(e.contractType)
          ? employeeProfileKvRow(
              "Inicio contrato vigente",
              e.contractVigenteStartDate || e.startDate || "—"
            )
          : ""
      }
      ${
        isFixedTermContractType(e.contractType)
          ? employeeProfileKvRow("Fecha renovación", e.renewalDate || "—")
          : ""
      }
      ${
        isFixedTermContractType(e.contractType)
          ? employeeProfileKvRow("Aviso no renovación enviado", e.nonRenewalNoticeDate || "—")
          : ""
      }
      ${employeeProfileKvRow("Fecha fin contrato", e.contractEndDate)}
      ${
        contractRenewal.applies
          ? employeeProfileKvRow("Aviso no renovación (máx.)", fmtDateOr(contractRenewal.noticeDeadlineYmd, "—"))
          : ""
      }
      ${employeeProfileKvRow("Duración contrato", e.contractDuration || e.contractDurationText)}
      ${employeeProfileKvRow("Periodicidad", e.payFrequency)}
      ${employeeProfileKvRow("Creado", fmtProfileAuditTimestamp(e.createdAt))}
      ${employeeProfileKvRow("Última actualización", fmtProfileAuditTimestamp(e.updatedAt))}
      ${employeeProfileKvRow("Aux. transporte (COP)", readEmployeeTransportAllowanceCop(e).toLocaleString("es-CO"))}
      ${employeeProfileKvRow("Tipo cotizante", e.contributorType)}
      ${employeeProfileKvRow("ARL nivel riesgo", e.arlRiskLevel)}
      ${employeeProfileKvRow("Plantilla contrato Word", e.contractTemplateKind)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Seguridad social</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("EPS", e.eps)}
      ${employeeProfileKvRow("Fondo pensión", e.pensionFund)}
      ${employeeProfileKvRow("ARL", e.arl)}
      ${employeeProfileKvRow("Cesantías", e.severanceFund)}
      ${employeeProfileKvRow("Caja compensación", e.compensationFund)}
    </div></section>
    <section class="employee-profile-section"><h4 class="employee-profile-section-title">Datos bancarios</h4><div class="employee-profile-grid">
      ${employeeProfileKvRow("Banco", e.bankName)}
      ${employeeProfileKvRow("Tipo cuenta", e.bankAccountType)}
      ${employeeProfileKvRow("N° cuenta", e.bankAccount)}
    </div></section>
    ${driverBlock}</article>`;
}

function employeeNationalPhoneFieldHtml(name, label, rawValue) {
  const national = portalPhoneNationalDigitsForForm(rawValue || "");
  return `<label><span>${escapeHtml(label)}</span>
<div class="phone-input-professional" role="group" aria-label="${escapeAttr(label)}">
<span class="phone-cc-badge" aria-hidden="true"><span class="phone-dial-code">+57</span></span>
<input class="phone-national-input" name="${escapeAttr(name)}" required value="${escapeAttr(national)}" placeholder="3001234567" data-antares-restrict="digits" data-antares-validate-blur="phone-loose" maxlength="10" inputmode="tel" />
</div></label>`;
}

function buildPayrollEmployeeEditModalFields(emp) {
  const e = normalizePayrollEmployeeRowDates(emp || {});
  const empId = escapeAttr(String(e.id || ""));
  const deps = `<option value="">${escapeHtml("Seleccione...")}</option>${departmentOptions(e.department || "")}`;
  const docSel = CO_CATALOGS.documentTypes.map((d) => {
    const lab =
      d === "CC"
        ? "Cédula de ciudadanía"
        : d === "CE"
          ? "Cédula de extranjería"
          : d === "PAS"
            ? "Pasaporte"
            : d === "PEP"
              ? "Permiso especial (PEP)"
              : "Tarjeta de identidad";
    return `<option value="${escapeAttr(d)}" ${String(e.documentType || "") === d ? "selected" : ""}>${escapeHtml(lab)}</option>`;
  }).join("");
  const genderSel = CO_CATALOGS.genders.map(
    (g) => `<option value="${escapeAttr(g)}" ${String(e.gender || "") === g ? "selected" : ""}>${escapeHtml(g)}</option>`
  ).join("");
  const maritalSel = CO_CATALOGS.maritalStatus.map(
    (g) =>
      `<option value="${escapeAttr(g)}" ${String(e.maritalStatus || "").trim() === g ? "selected" : ""}>${escapeHtml(g)}</option>`
  ).join("");
  const eduSel = CO_CATALOGS.educationLevel.map(
    (g) =>
      `<option value="${escapeAttr(g)}" ${String(e.educationLevel || "").trim() === g ? "selected" : ""}>${escapeHtml(g)}</option>`
  ).join("");
  const contractSel = CO_CATALOGS.contractTypes.map(
    (c) =>
      `<option value="${escapeAttr(c)}" ${String(e.contractType || "").trim() === c ? "selected" : ""}>${escapeHtml(c)}</option>`
  ).join("");
  const tmplSel = renderContractTemplateSelectOptions(String(e.contractTemplateKind || "").trim().toLowerCase(), false);
  const payFreqSel = payrollPayFrequencySelectOptions(e.payFrequency || "Mensual", "Seleccione...");
  const companyOptsInner = [`<option value="">${escapeHtml("Seleccione")}</option>`]
    .concat(
      read(KEYS.companies, [])
        .filter((c) => isCompanyRecordActive(c))
        .map(
          (c) =>
            `<option value="${escapeAttr(c.id)}" ${String(e.companyId || "") === String(c.id || "") ? "selected" : ""}>${escapeHtml(String(c.name || ""))}</option>`
        )
    )
    .join("");
  const posOptsInner = [`<option value="">${escapeHtml("Seleccione")}</option>`]
    .concat(
      getActivePositions().map(
        (p) =>
          `<option value="${escapeAttr(p.id)}" ${String(e.positionId || "") === String(p.id || "") ? "selected" : ""}>${escapeHtml(`${p.name} · $${parseNum(p.baseSalary).toLocaleString("es-CO")}`)}</option>`
      )
    )
    .join("");
  const tplKind = escapeAttr(String(e.contractTemplateKind || "oficina").toLowerCase());
  const defCourse = escapeAttr(String(e.defensiveCourse || ""));
  const existingAvatar = escapeAttr(String(e.avatarUrl || ""));
  const editPhotoCss = employeeAvatarCssUrl(e.avatarUrl);
  const editPhotoHasImage = Boolean(editPhotoCss);
  const editPhotoInitial = escapeHtml(String(e.name || "E").charAt(0).toUpperCase());
  const dur = parseContractDurationFields(
    String(e.contractDuration || e.contractDurationText || "").trim()
  );
  const showPlazoBlockInit = contractTypeRequiresDurationPlazo(String(e.contractType || "").trim());
  const showFixedEndInit = isFixedTermContractType(String(e.contractType || "").trim());
  return [
    {
      type: "hidden",
      name: "__employee_edit_id",
      value: empId
    },
    {
      type: "custom",
      label: "Identidad",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Nombre completo")}</span><input name="name" required value="${escapeAttr(e.name || "")}" /></label>
<label><span>${escapeHtml("Tipo documento")}</span><select name="documentType" required>${docSel}</select></label>
<label><span>${escapeHtml("N° documento")}</span><input name="idDoc" required value="${escapeAttr(e.idDoc || "")}" /></label>
<label><span>${escapeHtml("Fecha nacimiento")}</span><input type="date" name="birthDate" value="${escapeAttr(normalizePortalDateYmd(e.birthDate))}" /></label>
<label><span>${escapeHtml("Género")}</span><select name="gender">${genderSel}</select></label>
<label><span>${escapeHtml("Estado civil")}</span><select name="maritalStatus">${maritalSel}</select></label>
<label><span>${escapeHtml("Nivel educativo")}</span><select name="educationLevel">${eduSel}</select></label>
<label><span>${escapeHtml("Tipo de sangre RH")}</span><select name="bloodType">${selectOptionsFromCatalog(CO_CATALOGS.bloodTypes, e.bloodType || "", "Seleccione tipo de sangre...")}</select></label>
<label><span>${escapeHtml("¿Sufre alguna enfermedad o condición médica?")}</span><select name="hasIllness" data-emp-edit-illness required>
<option value="no" ${String(e.hasIllness || "").toLowerCase() !== "si" ? "selected" : ""}>${escapeHtml("No")}</option>
<option value="si" ${String(e.hasIllness || "").toLowerCase() === "si" ? "selected" : ""}>${escapeHtml("Sí")}</option>
</select></label>
<label class="full" data-emp-edit-illness-detail ${String(e.hasIllness || "").toLowerCase() === "si" ? "" : "hidden"}><span>${escapeHtml("¿Cuál? (descripción libre)")}</span><textarea name="illnessDescription" rows="2" placeholder="Detalle breve para uso médico/HR">${escapeHtml(e.illnessDescription || "")}</textarea></label>
</div>`
    },
    {
      type: "custom",
      label: "Contacto y ubicación",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Departamento")}</span><select name="department" id="employee-modal-department" required>${deps}</select></label>
<label><span>${escapeHtml("Ciudad")}</span><select name="city" id="employee-modal-city" required><option value="">${escapeHtml("Seleccione un departamento...")}</option></select></label>
<label class="full"><span>${escapeHtml("Dirección")}</span><input name="address" required value="${escapeAttr(e.address || "")}" /></label>
${employeeNationalPhoneFieldHtml("phone", "Teléfono celular", e.phone)}
<label><span>${escapeHtml("Correo personal")}</span><input type="email" name="personalEmail" value="${escapeAttr(e.personalEmail || "")}" /></label>
<label><span>${escapeHtml("Contacto emergencia")}</span><input name="emergencyContact" required value="${escapeAttr(e.emergencyContact || "")}" /></label>
${employeeNationalPhoneFieldHtml("emergencyPhone", "Tel. emergencia", e.emergencyPhone)}
<label class="full"><span>${escapeHtml("Parentesco emergencia")}</span><input name="emergencyRelation" value="${escapeAttr(e.emergencyRelation || "")}" /></label>
</div>`
    },
    {
      type: "custom",
      label: "Laboral",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Empresa")}</span><select name="companyId" required>${companyOptsInner}</select></label>
<label><span>${escapeHtml("Cargo")}</span><select name="positionId" id="employee-modal-position" required>${posOptsInner}</select></label>
<input type="hidden" name="workSchedule" id="employee-modal-work-schedule" value="${escapeAttr(String(e.workSchedule || ""))}" />
<label><span>${escapeHtml("Tipo contrato")}</span><select name="contractType" id="employee-modal-contract-type" required>${contractSel}</select></label>
<div id="emp-edit-contract-duration-block" class="emp-contract-duration-panel full${showPlazoBlockInit ? "" : " hidden"}" style="grid-column:1/-1"${showPlazoBlockInit ? "" : " hidden"}${showPlazoBlockInit ? "" : ' aria-hidden="true"'}>
<p class="emp-contract-duration-title"><span>${escapeHtml("Plazo o duración del contrato")}</span></p>
<p class="full muted modal-field-hint emp-contract-duration-hint" style="margin:0">Obligatorio para <strong>término fijo</strong> o <strong>prestación de servicios</strong>. En contrato indefinido u otros tipos no aplica.</p>
<div class="form-section-grid employee-edit-grid emp-contract-duration-fields" style="grid-column:1/-1">
<label><span>${escapeHtml("Unidad de tiempo")}</span><select name="contractDurationUnit" id="emp-edit-contract-duration-unit">
<option value="">${escapeHtml("Seleccione...")}</option>
<option value="meses" ${dur.unit === "meses" ? "selected" : ""}>${escapeHtml("Meses")}</option>
<option value="anios" ${dur.unit === "anios" ? "selected" : ""}>${escapeHtml("Años")}</option>
<option value="otro" ${dur.unit === "otro" ? "selected" : ""}>${escapeHtml("Otro (texto libre)")}</option>
</select></label>
<div id="emp-edit-contract-duration-qty-wrap" class="emp-contract-duration-branch${dur.unit === "meses" || dur.unit === "anios" ? "" : " hidden"}"${dur.unit === "meses" || dur.unit === "anios" ? "" : " hidden"}>
<label><span>${escapeHtml("Cantidad")}</span><input type="number" name="contractDurationAmount" id="emp-edit-contract-duration-amount" min="1" max="600" placeholder="Ej.: 12" value="${escapeAttr(dur.amount)}" /></label>
</div>
<div id="emp-edit-contract-duration-other-wrap" class="emp-contract-duration-branch full${dur.unit === "otro" ? "" : " hidden"}"${dur.unit === "otro" ? "" : " hidden"}>
<label class="full"><span>${escapeHtml("Describa la duración")}</span><textarea name="contractDurationOther" id="emp-edit-contract-duration-other" rows="2" placeholder="Ej.: hasta finalización del proyecto">${escapeHtml(dur.other)}</textarea></label>
</div>
</div>
</div>
<label><span>${escapeHtml("Fecha ingreso a la empresa")}</span><input type="date" name="startDate" id="employee-modal-start-date" required value="${escapeAttr(normalizePortalDateYmd(e.startDate))}" /></label>
<div id="emp-edit-contract-vigente-start-wrap" class="emp-contract-vigente-start full${showFixedEndInit ? "" : " hidden"}" style="grid-column:1/-1"${showFixedEndInit ? "" : " hidden"}>
<label><span>${escapeHtml("Fecha inicio contrato vigente")}</span><input type="date" name="contractVigenteStartDate" id="employee-modal-contract-vigente-start-date" value="${escapeAttr(normalizePortalDateYmd(e.contractVigenteStartDate))}" /></label>
<p class="muted modal-field-hint" style="margin:0.35rem 0 0;font-size:0.82rem;line-height:1.45">Plazo del contrato fijo o renovación vigente. Si queda vacío al guardar, se usará la fecha de ingreso.</p>
</div>
<div id="emp-edit-contract-end-wrap" class="emp-contract-end-preview full${showFixedEndInit ? "" : " hidden"}" style="grid-column:1/-1"${showFixedEndInit ? "" : " hidden"}>
<label><span>${escapeHtml("Fecha fin del contrato")}</span><input type="date" name="contractEndDate" id="emp-edit-contract-end-date" readonly tabindex="-1" value="${escapeAttr(normalizePortalDateYmd(e.contractEndDate))}" /></label>
<p class="muted emp-contract-renewal-hint" id="emp-edit-contract-renewal-hint" style="margin:0.35rem 0 0;font-size:0.82rem;line-height:1.45"></p>
</div>
<label><span>${escapeHtml("Salario base (COP)")}</span><input type="number" name="baseSalary" id="employee-modal-salary" min="${CO_HR_RULES.minMonthlySalary}" required value="${escapeAttr(parseNum(e.baseSalary))}" /></label>
<label><span>${escapeHtml("Auxilio legal transporte / conectividad")}</span><input type="number" name="transportAllowance" id="employee-modal-transport-allowance" min="0" value="${escapeAttr(readEmployeeTransportAllowanceCop(e))}" /></label>
<p class="full muted modal-field-hint" id="employee-modal-legal-comp-hint" style="grid-column:1/-1;font-size:0.82rem;line-height:1.45;margin:0">${escapeHtml(employeeTransportAllowanceGuidance(e.baseSalary))}</p>
<label><span>${escapeHtml("Periodicidad pago")}</span><select name="payFrequency">${payFreqSel}</select></label>
<label><span>${escapeHtml("Centro de costos")}</span><input name="costCenter" value="${escapeAttr(resolvePayrollEmployeeCostCenter(e))}" data-antares-field="db-upper" data-antares-validate-blur="db-upper" /></label>
<label><span>${escapeHtml("Tipo cotizante")}</span><select name="contributorType">${selectOptionsFromCatalog(CO_CATALOGS.contributorTypes, e.contributorType || "")}</select></label>
<label><span>${escapeHtml("Nivel riesgo ARL")}</span><select name="arlRiskLevel" id="employee-modal-arl-risk">${selectOptionsFromCatalog(CO_CATALOGS.arlRiskLevels, e.arlRiskLevel || "")}</select></label>
<label><span>${escapeHtml("Examen médico ocupacional de ingreso")}</span><input type="date" name="occupationalExamDate" value="${escapeAttr(normalizePortalDateYmd(e.occupationalExamDate))}" /></label>
<p class="full muted modal-field-hint" style="grid-column:1/-1;font-size:0.78rem">Obligatorio para todo trabajador (Resolución 2346 de 2007). Vigencia automática +1 año desde la fecha del examen.</p>
<label><span>${escapeHtml("Plantilla contrato Word")}</span><select name="contractTemplateKind" id="employee-modal-contract-template" required>${tmplSel}</select></label>
</div>`
    },
    {
      type: "custom",
      label: "Seguridad social",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("EPS")}</span><select name="eps" required>${selectOptionsFromCatalog(CO_CATALOGS.eps, e.eps || "", "Seleccione EPS...")}</select></label>
<label><span>${escapeHtml("Pensión")}</span><select name="pensionFund" required>${selectOptionsFromCatalog(CO_CATALOGS.pensionFunds, e.pensionFund || "", "Seleccione fondo...")}</select></label>
<label><span>${escapeHtml("ARL")}</span><select name="arl" required>${selectOptionsFromCatalog(CO_CATALOGS.arl, e.arl || "", "Seleccione ARL...")}</select></label>
<label><span>${escapeHtml("Fondo cesantías")}</span><select name="severanceFund">${selectOptionsFromCatalog(CO_CATALOGS.severanceFunds, e.severanceFund || "")}</select></label>
<label><span>${escapeHtml("Caja compensación")}</span><select name="compensationFund">${selectOptionsFromCatalog(CO_CATALOGS.compensationFunds, e.compensationFund || "")}</select></label>
</div>`
    },
    {
      type: "custom",
      label: "Datos bancarios",
      html: `<div class="form-section-grid employee-edit-grid">
<label><span>${escapeHtml("Banco")}</span><select name="bankName" required>${selectOptionsFromCatalog(CO_CATALOGS.banks, e.bankName || "", "Seleccione...")}</select></label>
<label><span>${escapeHtml("Tipo cuenta")}</span><select name="bankAccountType">${selectOptionsFromCatalog(CO_CATALOGS.accountTypes, e.bankAccountType || "Ahorros")}</select></label>
<label class="full"><span>${escapeHtml("Número cuenta")}</span><input name="bankAccount" required value="${escapeAttr(e.bankAccount || "")}" /></label>
</div>`
    },
    {
      type: "custom",
      label: "Conductor",
      html: `<div class="form-section-grid employee-edit-grid hr-modal-conductor-block">
<label><span>${escapeHtml("N° licencia")}</span><input name="license" value="${escapeAttr(e.license || "")}" /></label>
<label><span>${escapeHtml("Categoría licencia")}</span><select name="licenseCategory">${selectOptionsFromCatalog(CO_CATALOGS.licenseCategories, e.licenseCategory || "", "Seleccione categoría...")}</select></label>
<label><span>${escapeHtml("Vence licencia")}</span><input type="date" name="licenseExpiry" value="${escapeAttr(normalizePortalDateYmd(e.licenseExpiry))}" /></label>
<label><span>${escapeHtml("Examen instruvial")}</span><input type="date" name="instruvialExamDate" value="${escapeAttr(normalizePortalDateYmd(e.instruvialExamDate))}" /></label>
<p class="full muted modal-field-hint" style="grid-column:1/-1;font-size:0.78rem">La vigencia del examen instruvial se calcula automáticamente (+1 año). El examen ocupacional está en la sección «Laboral» porque aplica a todos los cargos.</p>
<label><span>${escapeHtml("Conducción defensiva")}</span><select name="defensiveCourse">
<option value="">${escapeHtml("Seleccione...")}</option>
<option value="vigente" ${defCourse === "vigente" ? "selected" : ""}>${escapeHtml("Vigente")}</option>
<option value="vencido" ${defCourse === "vencido" ? "selected" : ""}>${escapeHtml("Vencido")}</option>
<option value="no_aplica" ${defCourse === "no_aplica" ? "selected" : ""}>${escapeHtml("No aplica")}</option>
</select></label>
<label><span>${escapeHtml("Vence curso defensivo")}</span><input type="date" name="defensiveCourseExpiry" value="${escapeAttr(normalizePortalDateYmd(e.defensiveCourseExpiry))}" /></label>
<label><span>${escapeHtml("Comparendos pendientes (SIMIT)")}</span><input type="number" name="comparendos" min="0" max="9999" value="${escapeAttr(parseNum(e.comparendos ?? 0))}" /></label>
<label><span>${escapeHtml("Años de experiencia conduciendo")}</span><input type="number" name="experienceYears" min="0" max="80" value="${escapeAttr(parseNum(e.experienceYears ?? 0))}" /></label>
<label class="full"><span>${escapeHtml("¿De cuáles vehículos de la flota es conductor?")}</span>
<div class="hr-conductor-vehicle-types">${driverVehicleTypesCheckboxesHtml(e.vehicleTypes || "")}</div>
</label>
<p class="full muted modal-field-hint" style="grid-column:1/-1;font-size:0.82rem">Si el cargo no es conductor, puede dejar esta sección en blanco.</p>
</div>`
    },
    {
      type: "custom",
      label: "Foto",
      html: `<div class="form-section-grid employee-edit-grid">
<div class="full hr-employee-avatar-row" style="grid-column:1/-1">
<div class="hr-employee-avatar-inner">
<label for="emp-edit-modal-avatar-input" class="profile-avatar profile-avatar-lg profile-avatar-upload${editPhotoHasImage ? " has-image" : ""}" data-emp-edit-avatar-label style="${editPhotoHasImage ? `background-image:url('${editPhotoCss}');` : ""}" title="Foto del empleado">
<span class="profile-avatar-initial">${editPhotoHasImage ? "" : editPhotoInitial}</span>
<span class="profile-avatar-overlay"><span class="profile-avatar-overlay-inner">${IC.upload}<span>${editPhotoHasImage ? escapeHtml("Cambiar") : escapeHtml("Subir foto")}</span></span></span>
<input type="file" id="emp-edit-modal-avatar-input" name="avatarFile" accept="image/*" class="profile-avatar-file-input" aria-label="Foto del empleado" />
</label>
<input type="hidden" name="avatarUrlExisting" value="${existingAvatar}" />
<p class="muted hr-employee-avatar-caption">${escapeHtml("Pulse el círculo. Si no elige archivo, se conserva la foto actual.")}</p>
</div>
</div>
</div>`
    }
  ];
}

function contractTemplateFileName(kind) {
  const k = String(kind || "").trim().toLowerCase();
  return window.RecruitmentDomain?.TEMPLATE_FILE_BY_KIND?.[k] || "";
}

function renderContractTemplateSelectOptions(selectedKind = "", includeAuto = false) {
  const kinds = ["oficina", "fijo", "prestacion"];
  const cur = String(selectedKind || "").trim().toLowerCase();
  let html = includeAuto
    ? `<option value="">${escapeHtml("Automatica segun tipo de contrato y rol")}</option>`
    : "";
  for (const k of kinds) {
    const label = contractTemplateFileName(k) || k;
    html += `<option value="${escapeAttr(k)}"${cur === k ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }
  return html;
}

function renderContractMergePreviewHtml(employee, opts = {}) {
  if (!employee) {
    return `<p class="muted" style="margin:0">${escapeHtml("Seleccione un empleado para ver los datos que se insertaran en el Word (solo marcadores de la plataforma).")}</p>`;
  }
  const missing = validateEmployeeContractDocFields(employee);
  const payload = buildEmployeeContractDocxPayload(employee, opts);
  const file = contractTemplateFileName(payload.contractTemplateKind) || payload.contractTemplateKind;
  const rows = [
    ["Archivo", file],
    ["Nombre", payload.nombre_empleado],
    ["Documento", payload.cedula_empleado],
    ["Ciudad / municipio", payload.ciudad_empleado],
    ["Cargo", payload.cargo_empleado],
    ["Salario", payload.salario ? `$${Math.round(Number(payload.salario)).toLocaleString("es-CO")}` : ""],
    ["Salario en letras", payload.salario_letras],
    ["Duracion", payload.duracion_contrato],
    ["Banco", payload.banco_cuenta_bancaria],
    ["Cuenta", payload.cuenta_bancaria],
    ["Fecha firma (constancia)", opts.signDate || ""]
  ];
  const missHtml = missing.length
    ? `<p class="muted" style="margin:0 0 0.5rem;color:var(--danger,#c0392b)">${escapeHtml(`Faltan en la ficha: ${missing.join(", ")}`)}</p>`
    : "";
  const body = rows
    .filter(([, v]) => String(v || "").trim())
    .map(
      ([k, v]) =>
        `<tr><th scope="row" style="text-align:left;padding:0.2rem 0.75rem 0.2rem 0;white-space:nowrap">${escapeHtml(k)}</th><td style="padding:0.2rem 0">${escapeHtml(String(v))}</td></tr>`
    )
    .join("");
  return `${missHtml}<table class="contract-merge-preview-table" style="width:100%;font-size:0.88rem;border-collapse:collapse"><tbody>${body}</tbody></table>`;
}

function syncContractFormFromSelection(form) {
  if (!form) return;
  const employeeSelect = form.querySelector("select[name='employeeId']");
  const candidateSelect = form.querySelector("select[name='candidateId']");
  const personMode = String(form.querySelector("#contract-person-mode")?.value || "employee");
  const templateSelect = form.querySelector("select[name='contractTemplateKind']");
  const signDateEl = form.querySelector("input[name='signDate']");
  const previewEl = form.querySelector("[data-contract-merge-preview]");
  let employee = read(KEYS.payrollEmployees, []).find(
    (item) => String(item.id) === String(employeeSelect?.value || "")
  );
  if (personMode === "candidate") {
    const candidate = read(KEYS.candidates, []).find(
      (item) => String(item.id) === String(candidateSelect?.value || "")
    );
    employee = candidate ? findPayrollEmployeeByIdDoc(candidate.idDoc) : null;
  }
  if (!employee) {
    if (previewEl) previewEl.innerHTML = renderContractMergePreviewHtml(null);
    return;
  }
  const empTpl = String(employee.contractTemplateKind || "").trim().toLowerCase();
  if (templateSelect) {
    if (empTpl && [...templateSelect.options].some((o) => String(o.value) === empTpl)) {
      templateSelect.value = empTpl;
    } else if (!String(templateSelect.value || "").trim() && window.RecruitmentDomain?.inferTemplateKind) {
      const wr =
        employee.workerRole ||
        (String(employee.position || "").toLowerCase().includes("conductor") ? "conductor" : "empleado");
      templateSelect.value = window.RecruitmentDomain.inferTemplateKind(
        employee.contractType || "Termino indefinido",
        wr
      );
    }
  }
  const signDate = String(signDateEl?.value || colombiaTodayIsoDate()).trim();
  const kind = String(templateSelect?.value || "").trim();
  if (previewEl) {
    previewEl.innerHTML = renderContractMergePreviewHtml(employee, {
      contractTemplateKind: kind,
      signDate
    });
  }
}

function buildEmployeeContractDocxPayload(employee, opts = {}) {
  const emp = prepareEmployeeForContractDocx(employee);
  let kind = normalizeContractTemplateKind(
    opts.contractTemplateKind || emp.contractTemplateKind,
    emp.contractType,
    emp.workerRole
  );
  const signDate = String(opts.signDate || emp.startDate || colombiaTodayIsoDate()).trim();
  const positionName = String(emp.position || "").trim();
  const wr = String(emp.workerRole || "empleado");
  const ct = String(emp.contractType || "Termino indefinido");
  const templates = window.RecruitmentDomain?.TEMPLATE_BY_KIND || {};
  if (!kind || !templates[kind]) {
    kind = window.RecruitmentDomain?.inferTemplateKind ? window.RecruitmentDomain.inferTemplateKind(ct, wr) : "oficina";
  }
  const base = parseNum(emp.baseSalary);
  const wordsSalary =
    window.RecruitmentDomain?.formatSalarioLetrasPesos
      ? window.RecruitmentDomain.formatSalarioLetrasPesos(base)
      : "";
  return {
    contractTemplateKind: kind,
    contractType: ct,
    workerRole: wr,
    nombre_empleado: String(emp.name || "").trim(),
    cedula_empleado: String(emp.idDoc || "").trim(),
    ciudad_empleado: String(emp.city || "").trim(),
    municipio_empleado: String(emp.city || "").trim(),
    departamento_empleado: String(emp.department || "").trim(),
    banco_cuenta_bancaria: String(emp.bankName || "").trim(),
    cuenta_bancaria: String(emp.bankAccount || "").trim(),
    salario: base,
    salario_letras: wordsSalary,
    duracion_contrato:
      String(emp.contractDuration || emp.contractDurationText || "").trim() ||
      describeContractDurationForDocx({
        contractType: ct,
        startDate: resolveEmployeeContractPlazoStartYmd(emp) || signDate,
        endDate: emp.contractEndDate || emp.endDate || ""
      }),
    cargo_empleado: positionName,
    signDate
  };
}

async function generateOfficialWordContract(payload) {
  if (!window.RecruitmentDomain?.generateEmployeeContractDocx) {
    throw new Error("Módulo de contratos Word no disponible (recarga la página).");
  }
  return window.RecruitmentDomain.generateEmployeeContractDocx(payload);
}

/** Valores de ejemplo para generar un Word de prueba sin persistir contrato. */
function buildContractDocxTestPayload(templateKind) {
  const kind = String(templateKind || "oficina").toLowerCase();
  const contractType =
    kind === "prestacion" ? "Prestacion de servicios" : kind === "fijo" ? "Termino fijo" : "Termino indefinido";
  const workerRole = kind === "prestacion" ? "conductor" : "empleado";
  const today = colombiaTodayIsoDate();
  const endDate = kind === "fijo" ? "2027-12-31" : "";
  return {
    contractTemplateKind: kind,
    contractType,
    workerRole,
    nombre_empleado: "Nombre Apellido Ejemplo",
    cedula_empleado: "1000000000",
    ciudad_empleado: "Bogota D.C.",
    departamento_empleado: "Cundinamarca",
    banco_cuenta_bancaria: "Bancolombia",
    cuenta_bancaria: "000000000000",
    salario: CO_HR_RULES.minMonthlySalary,
    salario_letras: "",
    duracion_contrato: describeContractDurationForDocx({ contractType, startDate: today, endDate }),
    cargo_empleado: kind === "prestacion" ? "Conductor nacional (ejemplo C2)" : "Auxiliar administrativo (ejemplo)",
    signDate: today
  };
}


function portalNonAdminRestrictedCaptureClick(event) {
  const trigger = event.target.closest("[data-action]");
  const action = String(trigger?.dataset?.action || "");
  if (FLEET_DRIVER_EDIT_ACTIONS.has(action)) {
    if (canEditFleetDriverAsAdmin()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    notify(userMessage("driversManageForbidden"), "error");
    return;
  }
  if (action === "delete-driver") {
    event.preventDefault();
    event.stopImmediatePropagation();
    notify(userMessage("driverDeleteUseHr"), "error");
    return;
  }
  if (isAdminActor()) return;
  if (canPerformHiringEditAction(action)) return;
  if (canPerformPayrollEditAction(action)) return;
  if (canPerformSstEditAction(action)) return;
  if (canPerformPermissionGatedAction(currentUser(), action, trigger)) return;
  if (!PORTAL_NON_ADMIN_BLOCKED_ACTIONS.has(action)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notify(userMessage("adminOnlyModule"), "error");
}

function portalNonAdminRestrictedCaptureChange(event) {
  const trigger = event.target.closest("[data-action]");
  const action = String(trigger?.dataset?.action || "");
  if (FLEET_DRIVER_EDIT_ACTIONS.has(action)) {
    if (canEditFleetDriverAsAdmin()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    notify(userMessage("driversManageForbidden"), "error");
    return;
  }
  if (isAdminActor()) return;
  if (canPerformHiringEditAction(action)) return;
  if (canPerformPayrollEditAction(action)) return;
  if (canPerformSstEditAction(action)) return;
  if (canPerformPermissionGatedAction(currentUser(), action, trigger)) return;
  if (!PORTAL_NON_ADMIN_BLOCKED_ACTIONS.has(action)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notify(userMessage("adminOnlyModule"), "error");
}

/**
 * Guarda dura para handlers destructivos. Aunque la barrera de captura cubre el camino feliz,
 * si alguien manipula el DOM (devtools, extensión) o re-renderea sin pasar por viewRoot, este
 * check rechaza la acción antes de tocar localStorage o la API.
 * @returns {boolean} true si se debe abortar la acción.
 */
function abortIfNotAdmin(reason = "adminOnlyModule") {
  if (isAdminActor()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanApproveTransport(reason = "adminOnlyModule") {
  if (canApproveTransportRequests()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanApprovePortalRegistration(reason = "adminOnlyApprove") {
  if (canApprovePortalRegistration()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanManageTransportTrips(reason = "adminOnlyModule") {
  if (canManageTransportTrips()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanManageHiring(reason = "adminOnlyModule") {
  if (canManageHiringModule()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanManagePayroll(reason = "adminOnlyModule") {
  if (canManagePayrollModule()) return false;
  notify(userMessage(reason), "error");
  return true;
}

function abortUnlessCanManageSst(reason = "adminOnlyModule") {
  if (canManageSstModule()) return false;
  notify(userMessage(reason), "error");
  return true;
}



/** Cobertura pública: GET /api/public/transport-request-coverage-stats (sin JWT). */
let publicCoverageStatsView = null;
let publicCoverageStatsFetchInFlight = false;
const COVERAGE_STATS_FETCH_TIMEOUT_MS = 15000;

/** Rutas principales del index: lista fija (no se sustituye por topHubs de la API). */
const COVERAGE_MAIN_ROUTES_ES = [
  "Santa Marta",
  "Barranquilla",
  "Cartagena",
  "Buenaventura",
  "Puerto Antioquia",
  "Medellín",
  "Oriente Antioqueño",
  "Bogotá"
];

function coverageMainRouteHubRows() {
  return COVERAGE_MAIN_ROUTES_ES.map((city) => ({
    city,
    department: null,
    requestCount: null
  }));
}

/** Corredores de referencia (misma forma que topCorridors de la API) para fallback o sin datos. */
const COVERAGE_FALLBACK_CORRIDORS = [
  { cityA: "Santa Marta", cityB: "Barranquilla" },
  { cityA: "Barranquilla", cityB: "Cartagena" },
  { cityA: "Cartagena", cityB: "Buenaventura" },
  { cityA: "Buenaventura", cityB: "Medellín" },
  { cityA: "Medellín", cityB: "Bogotá" },
  { cityA: "Oriente Antioqueño", cityB: "Medellín" },
  { cityA: "Medellín", cityB: "Puerto Antioquia" }
];

/** Ventana de meses para GET /public/transport-request-coverage-stats (API acota entre 3 y 36). */
const COVERAGE_STATS_API_MONTHS = 12;

function renderPublicCoverageHubGrid(hubs, showCounts) {
  return hubs
    .map((row) => {
      const city = String(row.city || "").trim();
      if (!city) return "";
      const dept = String(row.department || "").trim();
      const labelHtml = dept
        ? `${escapeHtml(tPublic(city))} (${escapeHtml(dept)})`
        : escapeHtml(tPublic(city));
      const cnt = row.requestCount != null ? Number(row.requestCount) : NaN;
      const badge =
        showCounts && Number.isFinite(cnt)
          ? `<span class="coverage-count" aria-label="${escapeHtml(String(cnt))} solicitudes">${escapeHtml(
              String(cnt)
            )}</span>`
          : "";
      return `<div class="coverage-item"><span class="coverage-dot"></span><span class="coverage-item-label">${labelHtml}</span>${badge}</div>`;
    })
    .filter(Boolean)
    .join("");
}

function renderPublicCoverageCorridorGrid(rows, showCounts) {
  return rows
    .map((row) => {
      const a = String(row.cityA ?? row.originCity ?? "").trim();
      const b = String(row.cityB ?? row.destinationCity ?? "").trim();
      if (!a || !b) return "";
      const deptA = String(row.departmentA ?? row.originDepartment ?? "").trim();
      const deptB = String(row.departmentB ?? row.destinationDepartment ?? "").trim();
      const ta = tPublic(a);
      const tb = tPublic(b);
      const linePlain = `${ta} \u2194 ${tb}`;
      const left = deptA ? `${ta} (${tPublic(deptA)})` : ta;
      const right = deptB ? `${tb} (${tPublic(deptB)})` : tb;
      const title = `${left} \u2194 ${right}`;
      const cnt = row.requestCount != null ? Number(row.requestCount) : NaN;
      const badge =
        showCounts && Number.isFinite(cnt)
          ? `<span class="coverage-count" aria-label="${escapeHtml(String(cnt))} solicitudes">${escapeHtml(
              String(cnt)
            )}</span>`
          : "";
      return `<div class="coverage-item"><span class="coverage-dot"></span><span class="coverage-item-label coverage-corridor-line" title="${escapeHtml(
        title
      )}">${escapeHtml(linePlain)}</span>${badge}</div>`;
    })
    .filter(Boolean)
    .join("");
}

function renderPublicCoverageFromView() {
  const hubGrid = document.getElementById("coverage-hub-grid");
  const corridorGrid = document.getElementById("coverage-corridor-grid");
  const captHub = document.getElementById("coverage-hubs-caption");
  const captCor = document.getElementById("coverage-corridors-caption");
  const foot = document.getElementById("coverage-stats-footnote");
  if (!hubGrid || !corridorGrid) return;

  if (captHub) {
    captHub.textContent = tPublic("Principales puntos de recogida y entrega donde hoy concentramos mas operacion.");
  }
  if (captCor) {
    captCor.textContent = tPublic(
      "Trayectos entre ciudades que mas se repiten; ida y vuelta del mismo corredor se muestran como un solo movimiento."
    );
  }

  const view = publicCoverageStatsView;
  hubGrid.innerHTML = renderPublicCoverageHubGrid(coverageMainRouteHubRows(), false);

  if (!view || view.kind === "fallback") {
    corridorGrid.innerHTML = renderPublicCoverageCorridorGrid(COVERAGE_FALLBACK_CORRIDORS, false);
    if (foot) {
      if (view?.reason === "preview") {
        foot.hidden = true;
        foot.textContent = "";
      } else {
        foot.hidden = false;
        foot.textContent =
          view?.reason === "nobase"
            ? tPublic("Configure la URL del servidor para ver la demanda real en esta seccion.")
            : view?.reason === "empty"
              ? tPublic("No hay solicitudes suficientes en la ventana analizada; se muestra referencia geografica.")
              : view?.reason === "error"
                ? tPublic(
                    "No fue posible cargar las estadisticas de cobertura. Se muestra referencia geografica."
                  )
                : tPublic("Configure la URL del servidor para ver la demanda real en esta seccion.");
      }
    }
    return;
  }

  const data = view.data;
  const total = Number(data?.totalRequestsAnalyzed) || 0;
  const topCorridors = Array.isArray(data?.topCorridors) ? data.topCorridors : [];

  const corOk = topCorridors.length > 0;

  corridorGrid.innerHTML = corOk
    ? renderPublicCoverageCorridorGrid(topCorridors, true)
    : renderPublicCoverageCorridorGrid(COVERAGE_FALLBACK_CORRIDORS, false);

  if (foot) {
    if (total > 0 && corOk) {
      foot.hidden = true;
      foot.textContent = "";
    } else {
      foot.hidden = false;
      foot.textContent = tPublic(
        "No hay solicitudes suficientes en la ventana analizada; se muestra referencia geografica."
      );
    }
  }
}

function initCoverageCorridors() {
  const hubGrid = document.getElementById("coverage-hub-grid");
  if (!hubGrid) return;

  if (publicCoverageStatsView && publicCoverageStatsView.kind !== "fallback") {
    renderPublicCoverageFromView();
    return;
  }
  if (publicCoverageStatsView?.reason === "preview" && publicCoverageStatsFetchInFlight) {
    renderPublicCoverageFromView();
    return;
  }

  const api = window.AntaresApi;
  if (!api?.hasBase?.() || typeof api.getJsonPublic !== "function") {
    publicCoverageStatsView = { kind: "fallback", reason: "nobase" };
    renderPublicCoverageFromView();
    return;
  }

  if (!publicCoverageStatsView || publicCoverageStatsView.reason !== "preview") {
    publicCoverageStatsView = { kind: "fallback", reason: "preview" };
    renderPublicCoverageFromView();
  }

  if (publicCoverageStatsFetchInFlight) return;
  publicCoverageStatsFetchInFlight = true;

  const coverageStatsRequest = Promise.race([
    api.getJsonPublic(`/public/transport-request-coverage-stats?months=${COVERAGE_STATS_API_MONTHS}`),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("coverage-stats-timeout")), COVERAGE_STATS_FETCH_TIMEOUT_MS);
    })
  ]);

  void coverageStatsRequest
    .then((data) => {
      const total = Number(data?.totalRequestsAnalyzed) || 0;
      const topHubs = Array.isArray(data?.topHubs) ? data.topHubs : [];
      const topCorridors = Array.isArray(data?.topCorridors) ? data.topCorridors : [];
      if (total === 0 && !topHubs.length && !topCorridors.length) {
        publicCoverageStatsView = { kind: "fallback", reason: "empty" };
      } else {
        publicCoverageStatsView = { kind: "api", data };
      }
    })
    .catch((err) => {
      devWarn("Cobertura: error al cargar estadisticas desde la API.", err?.message || err);
      publicCoverageStatsView = { kind: "fallback", reason: "error" };
    })
    .finally(() => {
      publicCoverageStatsFetchInFlight = false;
      renderPublicCoverageFromView();
    });
}

function initPublicCareers() {
  const grid = document.getElementById("careers-vacancies-grid");
  if (!grid) return;
  const render = () => {
    const list = getPublicPublishedVacancies();
    if (!list.length) {
      grid.innerHTML =
        `<div class="careers-card"><p class="muted" style="margin:0">${tPublic("No hay vacantes publicadas en este momento. Vuelve pronto o escribenos en Contacto.")}</p></div>`;
      return;
    }
    grid.innerHTML = list
      .map((v) => {
        const salary = parseNum(v.salaryOffer);
        const salaryStr = `$${salary.toLocaleString("es-CO")}`;
        const deadline = v.deadline
          ? `${tPublic("Cierre")}: ${escapeHtml(v.deadline)}`
          : tPublic("Sin fecha limite");
        const req = escapeHtml(String(v.requirements || "").slice(0, 180));
        const more = String(v.requirements || "").length > 180 ? "…" : "";
        return `<article class="careers-card lift-card">
          <h3>${escapeHtml(v.title)}</h3>
          <div class="careers-meta">${escapeHtml(v.positionName || tPublic("Cargo"))} · ${salaryStr} · ${deadline}</div>
          <p class="careers-req muted">${req}${more}</p>
          <button type="button" class="btn btn-primary full" data-careers-apply data-id="${escapeHtml(String(v.id ?? ""))}">${tPublic("Aplicar")}</button>
        </article>`;
      })
      .join("");
    grid.querySelectorAll("[data-careers-apply]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const vac = getPublicPublishedVacancies().find((x) => x.id === btn.dataset.id);
        if (vac) openPublicVacancyApplyModal(vac);
      });
    });
  };

  const api = window.AntaresApi;
  if (api?.hasBase?.()) {
    window.publicCareersVacanciesSource = "api";
    window.publicCareersVacanciesFromApi = null;
    grid.innerHTML =
      `<div class="careers-card"><p class="muted" style="margin:0">${state.publicLang === "en" ? "Loading openings…" : "Cargando vacantes…"}</p></div>`;
    void api
      .getJsonPublic("/public/vacancies")
      .then((rows) => {
        const mapped = Array.isArray(rows)
          ? rows.map((row) => ({
              id: row.id,
              title: row.title,
              department: row.department,
              city: row.city,
              deadline: row.deadline,
              publishedFrom: row.publishedFrom || row.visibleFrom || "",
              salaryOffer: row.salaryOffer,
              requirements: row.requirements,
              status: row.status || "Publicada",
              positionName: row.positionName,
              modality: row.modality,
              openings: row.openings,
              workerRole: row.workerRole
            }))
          : [];
        window.publicCareersVacanciesFromApi = mergeApiVacanciesWithLocalPublished(mapped, read(KEYS.vacancies, []));
      })
      .catch((err) => {
        devWarn("Carreras: error al cargar vacantes desde la API.", err?.message || err);
        window.publicCareersVacanciesSource = "local";
        window.publicCareersVacanciesFromApi = null;
      })
      .finally(() => {
        render();
      });
    return;
  }

  window.publicCareersVacanciesSource = "local";
  window.publicCareersVacanciesFromApi = null;
  render();
}

function initPublicScrollSpy() {
  const mainNav = document.getElementById("main-nav");
  if (!mainNav) return;
  const links = [...mainNav.querySelectorAll("a[href^='#']")];
  if (!links.length) return;

  const sectionIds = links
    .map((link) => String(link.getAttribute("href") || "").replace("#", "").trim())
    .filter(Boolean);
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const targetId = String(link.getAttribute("href") || "").replace("#", "").trim();
      link.classList.toggle("active", targetId === id);
    });
  };

  const visibleRatioById = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        visibleRatioById.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      const best = [...visibleRatioById.entries()].sort((a, b) => b[1] - a[1])[0];
      if (best && best[1] > 0) setActive(best[0]);
    },
    { threshold: [0.2, 0.35, 0.5, 0.7], rootMargin: "-18% 0px -55% 0px" }
  );

  sections.forEach((section) => {
    visibleRatioById.set(section.id, 0);
    observer.observe(section);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = String(link.getAttribute("href") || "").replace("#", "").trim();
      if (targetId) setActive(targetId);
    });
  });

  setActive(sectionIds[0]);
}

function initPublicEffects() {
  if (window.AntaresValidation?.installLiveValidation) {
    window.AntaresValidation.installLiveValidation(document);
  }
  initCoverageCorridors();
  initPublicCareers();
  initPublicScrollSpy();

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


/** Expone API del runtime a scripts defer (antes: script clásico enlazaba `function` al `window`). */
Object.assign(window, {
  abortIfNotAdmin,
  abortUnlessAdminForFleetDriverEdit,
  abortUnlessCanApprovePortalRegistration,
  abortUnlessCanApproveTransport,
  abortUnlessCanCreateVehicle,
  abortUnlessCanDeleteVehicle,
  abortUnlessCanEditVehicle,
  abortUnlessCanManageHiring,
  abortUnlessCanManagePayroll,
  abortUnlessCanManageSst,
  abortUnlessCanManageTransportTrips,
  abortUnlessCanToggleVehicleStatus,
  addOneYearToYmd,
  addYears,
  adminUsersCollapsibleCardBody,
  appendFuelLogAwait,
  appendModuleAuditLog,
  appendPayrollEmployeeAuditLog,
  appendPortalEntityAuditLog,
  buildPortalAuditActorSnapshot,
  formatFuelLogAuditSummary,
  formatHistoryAuditPresentation,
  formatTechnicalLogAuditSummary,
  formatHistoryAuditActorDisplay,
  historyAuditEnrichActorDisplay,
  historyAuditUsuarioFromLogRow,
  historyAuditFormatStoredUsuario,
  formatTransportDeletionAuditUsuario,
  getPortalAuditActorLabel,
  historyAuditActorFromLogRow,
  logPortalAuditEvent,
  listPortalAuditModuleLabels,
  normalizePortalAuditModuleLabel,
  portalAuditModuleIconKey,
  resolvePortalAuditModuleId,
  PORTAL_AUDIT_MODULE_REGISTRY,
  recordEntityHistoryActor,
  appendVehicleTechnicalLogAwait,
  applyAdminUsersFormDraft,
  applyCandidateToEmployeeForm,
  applyDocumentFieldConstraints,
  applyHistoryFilters,
  applyHistoryFleetFuelFilters,
  applyHistoryFleetTechnicalFilters,
  applyLaborSystemParametersApiResponse,
  applyManualModuleLayout,
  applyPositionCatalogToEmployeeForm,
  approveRequest,
  attachDepartmentCitySelects,
  bindEmployeeAvatarFilePreview,
  bindEmployeeTransportAllowanceRule,
  bindPasswordStrengthSuite,
  bindPositionCompensationFields,
  bindVehicleDocExpiryAutoFill,
  buildCatalogReportExcelHtml,
  buildContractDocxTestPayload,
  buildEmployeeContractDocxPayload,
  buildEmployeePayrollProfileBodyHtml,
  buildHistoryAuditEntries,
  buildPayrollEmployeeEditModalFields,
  buildPayrollEmployeePayloadFromWizard,
  buildReportDataset,
  buildReportExportHtml,
  buildReportsAnalyticsSnapshot,
  buildRouteRateCompanyCheckboxesHtml,
  buildRouteRateEntry,
  buildRouteRateScopeStepInnerHtml,
  formatRouteRateAuditCellHtml,
  formatRouteRateAuditSummary,
  buildTripApprovalHeroHtml,
  buildTripRateInlineFieldsHtml,
  buildTripRateModalFields,
  buildTripRouteRateKey,
  calculateDriverTripReport,
  canAssignTripFromViajesModule,
  canPerformHiringEditAction,
  canPerformPayrollEditAction,
  canPerformSstEditAction,
  canViewAllTransportRequests,
  candidateCvDataUrlToBlob,
  candidateMayHaveCvInStorage,
  capStoredArrayRows,
  cityOptionsFromDepartment,
  clampLaborSystemParameterYear,
  clearAdminUsersDraft,
  clearFieldError,
  clearFormDateInput,
  commitSearchableSelectInputsInForm,
  closeReportPreviewModal,
  closeSearchableSelectDropdown,
  collapseCreatePanel,
  colombiaIntegralSalaryFloorCop,
  colombiaTransportAllowanceEligible,
  colombiaTransportAllowanceSalaryCapCop,
  companyKindChipHtml,
  companyKindChipShortLabel,
  companyProfileLogoUrl,
  composeContractDurationText,
  computeHiringConversionPct,
  confirmDiscardCreateFormAsync,
  contractTemplateFileName,
  coverageMainRouteHubRows,
  buildTripRequestPickerCardHtml,
  createTripEmptyHint,
  createTripSummaryTile,
  daysUntil,
  defaultAdminUsersUi,
  defaultTripRateStorageKeyForRequest,
  deleteEmployeesCascade,
  deletedRequestSnapshotForTableRow,
  deletedTripSnapshotForTableRow,
  departmentOptions,
  driverVehicleTypeFieldName,
  driverVehicleTypesCheckboxesHtml,
  collectDriverVehicleTypesCsv,
  driverVehicleTypesCsvToLabel,
  deriveRequestOperationalValue,
  describeContractDurationForDocx,
  describePortalVehicleOccupancy,
  diffMinutes,
  directoryOpsToneFromSlug,
  dispatchPortalNotification,
  docExpiryStatus,
  documentFieldRule,
  editModalCatalogSelectOptions,
  editModalSelectOptionSelected,
  employeeAvatarCssUrl,
  employeeProfileKvRow,
  employeeTransportAllowanceGuidance,
  enhanceTripAssignmentSelects,
  enhancePayrollLiquidationSelects,
  enrichPortalUserFromPayrollCache,
  ensureDeletedTransportRequestAuditSnapshotLoaded,
  ensureDeletedTransportTripAuditSnapshotLoaded,
  ensurePayrollRunHeavyJsonLoaded,
  ensureReportPreviewModal,
  ensureUsersPasswordHashing,
  ensureVehicleDocs,
  exportCatalogReport,
  extractCandidateCvDownload,
  fetchCandidateCvBlobFromApi,
  fetchCandidateCvDownloadFromApi,
  findPayrollEmployeeByIdDoc,
  resolveDriverForEmployee,
  findPortalDriverById,
  findPortalVehicleById,
  flattenCandidateAttachmentsForCv,
  fmtProfileAuditTimestamp,
  fmtProfileCell,
  formHasDirtyValues,
  formatDeletedRequestSnapshotRouteLine,
  formatDeletedRequestSnapshotTableSummary,
  formatDeletedTripSnapshotTableSummary,
  formatInterviewModeLabel,
  formatInterviewWhenDisplay,
  formatMoneyFieldValue,
  formatPortalRoleChipLabel,
  formatPortalRoleLabel,
  formatRoute,
  fuelLogRowForServer,
  generateOfficialWordContract,
  getAdminUsersDraft,
  getAdminUsersUi,
  getCandidateVacancyAndPosition,
  getConfiguredTripValue,
  getPasswordStrengthReport,
  getPersonalRegistrationKey,
  getSearchableSelectParts,
  getSelectedPhoneCountry,
  getTripRouteRatesNormalized,
  getVisibleRequestsForUser,
  hashPassword,
  hideAuth,
  hiringEmptyState,
  hiringPipelineSelectOptions,
  hiringPipelineStatusClass,
  historyAuditActionLabel,
  historyAuditActionStatus,
  historyDriverLabel,
  historyFleetFilterToolbar,
  historyFleetFuelFormHtml,
  historyFleetFuelHaystack,
  historyFleetFuelKpis,
  historyFleetKpiStrip,
  historyFleetMoneyField,
  historyFleetTechnicalFormHtml,
  historyFleetTechnicalHaystack,
  historyFleetTechnicalKpis,
  historyHaystack,
  historyMatchesQuickFilter,
  historyPlateLabel,
  historyQuickFilterCounts,
  historyRouteCell,
  historyStatusFilterOptions,
  historyTripValueCell,
  hoursBetween,
  humanTripRateRouteLabelFromStorageKey,
  humanizePayrollBulkSkipReason,
  hydrateOwnProfileFromApi,
  initB2BFormExperience,
  initCoverageCorridors,
  initPortalClientStorage,
  initPublicCareers,
  initPublicEffects,
  initPublicScrollSpy,
  initialTripValueForAssignment,
  installCandidateCvDownloadDelegation,
  installEmployeeContractDelegation,
  isCompanyRecordActive,
  isFixedTermContractType,
  isDataUrl,
  isManuallyUnavailable,
  isPasswordPayloadKey,
  isPersonTypeJuridica,
  isVacancyAcceptingApplications,
  laborSystemParametersDraftForYear,
  laborSystemParametersHistoryRows,
  laborSystemParametersSelectableYears,
  listTripRateOptionsForRequest,
  listTripRateOptionsWithFallback,
  matchColombiaCityInDepartment,
  matchColombiaDepartmentToCatalogKey,
  minutesBetween,
  minutesRemaining,
  mountSearchableSelect,
  normalizeCompaniesForSync,
  normalizeFuelLogPortalRow,
  normalizeFuelLogsList,
  normalizePayrollEmployeeRowDates,
  normalizeVehicleTechnicalLogPortalRow,
  normalizeVehicleTechnicalLogsList,
  notifyAdminUsers,
  notifyHrUsers,
  openAssignedTripInfoModal,
  openDeletedTransportRequestAuditModal,
  openDeletedTransportTripAuditModal,
  openDriverDetailSheetModal,
  openEditRouteRateModal,
  openEditTripModal,
  openHiringContractFromCandidate,
  openPayrollBulkResultModal,
  openPayrollEmployeeFromCandidate,
  openPortalDetailSheet,
  openDetailViewSheet,
  detailViewCardMarkup,
  detailViewCardsFromPairs,
  detailViewCardsFromSections,
  composeDetailViewSheet,
  openReportPdf,
  openReportPreviewModal,
  openRequestDetailModal,
  openRouteRateInlineEdit,
  openSearchableSelectDropdown,
  openTripInvoicePdf,
  openVehicleTechnicalSheetModal,
  parseContractDurationFields,
  parseMoneyFieldValue,
  parseNum,
  parsePayrollBulkAutogenMessage,
  parseTripRateStorageKeyToRouteParts,
  patchOperatorCompanyKindIfNeeded,
  payrollBulkEmployeeNameMap,
  payrollDocumentLogoUrl,
  payrollDraftLinkSuccessMessage,
  pendingRequestsForTripAssignment,
  persistReportsBiLayout,
  populateRouteRateInlineForm,
  portalCandidateAgeFromBirthIso,
  portalDetailBuildGrid,
  portalDetailComposeModal,
  portalDetailHighlightHtml,
  portalDetailRenderRows,
  portalDetailTileMarkup,
  portalNonAdminRestrictedCaptureChange,
  portalNonAdminRestrictedCaptureClick,
  portalProfileEmergencyFilled,
  portalProfileEmergencyNeedsEnrichment,
  portalProfileEnrichmentChanged,
  portalUpgradeDates,
  portalUserCompanyDisplay,
  portalUserDocumentValue,
  portalUserPayrollMatchKey,
  portalVehicleAvailabilityStatusHtml,
  positionSalaryUsesSmmlv,
  positionSearchableSelectDropdown,
  postPortalAuthorized,
  prepareCancelCreatePanel,
  prepareCreationFormForSubmit,
  prepareEmployeeForContractDocx,
  presentPayrollBulkAutogenResult,
  prettyStatus,
  printReportPreviewDocument,
  queryPayrollEmployeeDocumentDuplicateFromApi,
  queryPortalDateField,
  read,
  readAdminUsersFormDraft,
  readArray,
  readEmployeeTransportAllowanceCop,
  readFormDateIso,
  readFormEntriesNormalized,
  readFuelLogs,
  readModuleAuditLogs,
  readPositionTransportAllowanceCop,
  readVehicleTechnicalLogs,
  refreshCreateTripModuleForm,
  refreshDriverTripPaymentLinked,
  refreshHistoryFleetKpiStrip,
  refreshPayrollDraftsLinked,
  refreshSearchableSelect,
  registerPhoneCountryOptionsHtml,
  rejectRequest,
  removeFromPortalListAwaitServer,
  renderAssignTripRequestPreview,
  renderContractMergePreviewHtml,
  renderContractTemplateSelectOptions,
  renderHiringCandidateCard,
  renderHistoryAuditCard,
  renderHistoryAuditList,
  renderHistoryCard,
  renderHistoryFuelLogCard,
  renderHistoryFuelLogsList,
  renderHistoryResultsList,
  renderHistoryTechnicalLogCard,
  renderHistoryTechnicalLogsList,
  renderPayrollEmployeeDirectoryCard,
  renderPayrollEmployeeDirectoryTableRow,
  renderPayrollLegalHistoryCard,
  renderPayrollRunCard,
  renderPublicCoverageCorridorGrid,
  renderPublicCoverageFromView,
  renderPublicCoverageHubGrid,
  renderReportPreviewTableHtml,
  renderSearchableSelectDropdown,
  reportPercent,
  reportPreviewEscHandler,
  reportsAnalyticsPanelHtml,
  reportsBiCustomizerHtml,
  reportsBiDisplayVal,
  reportsBiKpiCard,
  reportsBiLayoutFromPanel,
  reportsBiLayoutPreset,
  reportsBiLeaderboardHtml,
  reportsBiPeriodChip,
  reportsBiTrendHtml,
  reportsBuildInsights,
  reportsFilterByPeriod,
  reportsFilterItemsByPeriod,
  reportsFilterPreviousPeriod,
  reportsHumanMonth,
  reportsMonthKey,
  reportsPctDelta,
  reportsPeriodLabel,
  reportsPeriodStart,
  reportsWeekKey,
  requestActualDeliveryDate,
  requestExpectedDeliveryDate,
  requestFunnelStageDescription,
  requestIsOperationallyClosed,
  requestLifecycleSummary,
  requiresAdminHrApproval,
  resetCreatePanelForm,
  resolveCandidateCvDownload,
  resolveEmployeeAvatarUrl,
  resolveEmployeeTransportAllowanceCop,
  resolvePayrollEmployeeCostCenter,
  resolvePortalProfileUser,
  restorePortalSnapshotIfAvailable,
  routeRateKeyFromRequest,
  runEmployeeContractGeneration,
  safeHttpsUrlForCandidateCv,
  safeMimeForCvBlobStored,
  saveNotification,
  scrollIntoViewSmoothBlockStart,
  scrollOpenCrudModalIntoView,
  scrollToAdminUsersFocusedForm,
  scrollToCreatePanelForm,
  selectOptionsFromCatalog,
  setAdminUsersDraft,
  setAdminUsersUi,
  setB2bFormFeedback,
  setDriverAvailability,
  setFieldError,
  setFormDateById,
  setFormDateByName,
  setFormSelectValue,
  setPortalDataHydrating,
  setSelectValueInsensitive,
  setTripAssignmentFieldsDisabled,
  setVehicleAvailability,
  showAuth,
  slaDelayMinutesForRequest,
  slaStatusForRequest,
  slugStatus,
  sortFleetLogsByDate,
  sortHistoryRequests,
  statusIconEmoji,
  stripDigitsForRegisterNational,
  suggestedEmployeeTransportAllowanceCop,
  summarizePayrollEmployeeForDirectory,
  syncContractFormFromSelection,
  syncCreateTripCompactPickList,
  syncEmployeeEditCatalogSelects,
  syncPayrollEmployeeSalaryReadonly,
  syncPhoneHiddenFull,
  syncSearchableSelectInputFromValue,
  toInputDate,
  togglePortalDriverManualAvailability,
  togglePortalVehicleManualAvailability,
  topClients,
  topVehicles,
  transportRequestBelongsToUserScope,
  triggerBlobDownload,
  triggerCandidateCvDownload,
  tripRateStorageKey,
  tripStatusOptionLabel,
  tripsForDriverMonth,
  tryApiLoginBridge,
  updateAutoApprove,
  updateCreateTripResourceFieldHints,
  tryAutoAdvanceTransportWizard,
  updateCreateTripStepper,
  wireCreateTripRequestPicker,
  updatePhoneFieldForCountry,
  updatePortalDataHydratingBanner,
  upsertPortalUserRowIntoCache,
  validateCandidatePipelineTransition,
  validateColombiaIntegralSalary,
  validateColombiaMonthlySalaryCop,
  validateColombiaPositionCompensation,
  validateColombianDocument,
  validateEmployeeContractDocFields,
  firstEmployeeContractDocFieldFromMissing,
  validatePasswordPolicy,
  validateVacancySalaryOffer,
  validateWorkerMinimumAge,
  vehicleTechnicalLogRowForServer,
  verifyPassword,
  wireEditModalFieldValues,
  wireEmployeePayrollDuplicateDocCheck,
  wireFormDocDuplicateCheck,
  wireMoneyInputs,
  wireMonthlyPayrollConcepts,
  wirePayrollEmployeeDirectoryFilters,
  wirePayrollEmployeeFormFieldSanitization,
  wireRouteRateScopeSection,
  wireTerminationSettlementForm,
  wireTripApprovalModeFields,
  wireTripRateChoiceSelect,
  wireTripValueMoneyInput,
  write,
  writeFuelLogsAwait,
  writePortalListPrunedAwaitServer,
  writeVehicleTechnicalLogsAwait,
});
