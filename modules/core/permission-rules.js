/**
 * Reglas de la compuerta de permisos: relacionan cada acción (`data-action`), botón (id) y formulario del portal con
 * el permiso por acción que exige (`PERMISSION_MODULES` en config.js). Solo datos: sin importaciones, para que lo
 * usen tanto `auth.js` (decisión) como `permission-gate.js` (ocultar y bloquear) sin dependencias circulares.
 */

/** Cada regla es una lista de alternativas [módulo, acción]: basta con cumplir una. */
export const PERMISSION_ACTION_RULES = Object.freeze({
  /* Conductores */
  "edit-driver": [["drivers", "edit"]],
  "toggle-driver": [["drivers", "status"]],

  /* Viajes */
  "trip-status": [["trips", "status"]],
  "edit-trip": [["trips", "edit"]],
  "reassign-trip": [["trips", "edit"]],
  "delete-trip": [["trips", "delete"]],
  "edit-route-rate": [["trips", "rates"]],
  "delete-route-rate": [["trips", "rates"]],
  "transport-focus-create-route": [["trips", "rates"]],
  "transport-focus-create-trip": [["trips", "assign"]],

  /* Solicitudes (la operación; el cliente conserva sus propias reglas) */
  "edit-request": [["requests", "edit"], ["trips", "edit"]],
  "cancel-request": [["requests", "cancel"]],
  "delete-admin": [["requests", "delete"]],

  /* Historial y reportería */
  "history-export-csv": [["history", "export"]],
  "reports-bi-export-excel": [["reports", "export"]],
  "report-preview-download-excel": [["reports", "export"]],
  "report-preview-download-pdf": [["reports", "export"]],
  "report-preview-print": [["reports", "export"]],

  /* Gestión humana */
  "edit-employee": [["payroll", "employees"]],
  "employee-form-save-draft": [["payroll", "employees"]],
  "reinstate-employee": [["payroll", "employees"]],
  "recategorize-unlinked-employee": [["payroll", "employees"]],
  "unlink-employee": [["payroll", "employees"]],
  "delete-employee": [["payroll", "employees"]],
  "delete-payroll-run": [["payroll", "delete"]],
  "delete-hr-absence": [["payroll", "delete"]],
  "mark-payroll-paid": [["payroll", "pay"]],
  "settlement-recalc": [["payroll", "runs"]],
  "recalc-driver-trip": [["payroll", "runs"]],
  "employee-generate-contract": [["payroll", "documents"]],
  "employee-generate-labor-letter": [["payroll", "documents"]],
  "employee-form-generate-contract-draft": [["payroll", "documents"]],
  "renew-employee-contract": [["payroll", "documents"]],
  "non-renew-employee-contract": [["payroll", "documents"]],

  /* Contratación */
  "edit-vacancy": [["hiring", "vacancies"]],
  "close-vacancy": [["hiring", "vacancies"]],
  "republish-vacancy": [["hiring", "vacancies"]],
  "edit-position": [["hiring", "vacancies"]],
  "toggle-position": [["hiring", "vacancies"]],
  "edit-candidate": [["hiring", "candidates"]],
  "candidate-status": [["hiring", "candidates"]],
  "candidate-status-apply": [["hiring", "candidates"]],
  "hiring-flow-advance": [["hiring", "candidates"]],
  "upload-candidate-attachment": [["hiring", "candidates"]],
  "schedule-interview-for-candidate": [["hiring", "candidates"]],
  "edit-interview": [["hiring", "candidates"]],
  "generate-contract-from-candidate": [["hiring", "contracts"]],
  "create-employee-from-candidate": [["hiring", "contracts"]],
  "open-offer-letter": [["hiring", "contracts"]],
  "delete-vacancy": [["hiring", "delete"]],
  "delete-position": [["hiring", "delete"]],
  "delete-candidate": [["hiring", "delete"]],
  "delete-interview": [["hiring", "delete"]],
  "delete-contract": [["hiring", "delete"]],

  /* Cumplimiento laboral y SST */
  "edit-sst-record": [["sst", "edit"]],
  "renew-sst-control": [["sst", "renew"]],
  "delete-sst-record": [["sst", "delete"]],
  "export-sst-due-csv": [["sst", "export"]]
});

/** Botones sin `data-action` que se identifican por su id. */
export const PERMISSION_ID_RULES = Object.freeze({
  "export-payroll": [["payroll", "export"]],
  "export-employees-contracts": [["payroll", "export"]]
});

/** Formularios por id. `clientBypass`: el cliente básico los usa con sus propias reglas. */
export const PERMISSION_FORM_RULES = Object.freeze({
  "form-create-trip": { rule: [["trips", "assign"]] },
  "form-route-rate": { rule: [["trips", "rates"]] },
  "form-request": { rule: [["requests", "create"]], clientBypass: true },
  "form-employee": { rule: [["payroll", "employees"]] },
  "form-payroll": { rule: [["payroll", "runs"]] },
  "form-payroll-bulk": { rule: [["payroll", "runs"]] },
  "form-payroll-settlement": { rule: [["payroll", "runs"]] },
  "form-driver-trip-payment": { rule: [["payroll", "runs"]] },
  "form-hr-absence": { rule: [["payroll", "absences"]] },
  "form-vacancy": { rule: [["hiring", "vacancies"]] },
  "form-position": { rule: [["hiring", "vacancies"]] },
  "form-candidate": { rule: [["hiring", "candidates"]] },
  "form-interview": { rule: [["hiring", "candidates"]] },
  "form-contract": { rule: [["hiring", "contracts"]] },
  "form-offer-letter": { rule: [["hiring", "contracts"]] },
  "form-sst-compliance": { rule: [["sst", "edit"]] }
});
