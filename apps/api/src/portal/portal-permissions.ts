/**
 * Permisos por acción de los módulos del portal (espejo de `PERMISSION_MODULES` en modules/core/config.js).
 *
 * Reglas (iguales a `canDo` del portal):
 * - `full`: permiso completo histórico del módulo; conserva exactamente lo que ya permitía (salvo `fullExcludes`).
 * - `view`: solo consulta. Cualquier permiso por acción también abre el módulo.
 * - `alsoFrom`: permisos de OTROS módulos que ya permitían esa acción.
 *
 * En el servidor la escritura se decide por colección: ver `portalCanWrite`. Un permiso solo de consulta
 * (`*_view`) nunca habilita escribir; los permisos completos históricos siguen escribiendo como antes.
 * Si se agrega o cambia un permiso, actualice también config.js (la prueba qa/permission-granularity.test.mjs
 * compara ambos catálogos).
 */
export interface PortalPermissionModule {
  full?: string;
  view?: string;
  fullExcludes?: string[];
  alsoFrom?: Record<string, string[]>;
  actions: Record<string, string>;
}

export const PORTAL_PERMISSION_MODULES: Record<string, PortalPermissionModule> = {
  requests: { full: "transport_requests", view: "transport_requests_view", fullExcludes: ["edit", "cancel", "delete"], alsoFrom: { create: ["client_requests"], edit: ["authorizations_transport", "authorizations_manage", "transport_trips"], cancel: ["authorizations_transport", "authorizations_manage", "transport_trips"], export: ["client_requests", "authorizations_transport", "authorizations_manage", "transport_trips"] }, actions: { create: "transport_requests_create", edit: "transport_requests_edit", cancel: "transport_requests_cancel", delete: "transport_requests_delete", export: "transport_requests_export" } },
  trips: { full: "transport_trips", view: "transport_trips_view", fullExcludes: ["delete", "rates"], actions: { assign: "transport_trips_assign", status: "transport_trips_status", edit: "transport_trips_edit", delete: "transport_trips_delete", rates: "transport_trips_rates", export: "transport_trips_export" } },
  drivers: { full: "transport_drivers", view: "transport_drivers_view", fullExcludes: ["edit", "status", "export"], actions: { edit: "transport_drivers_edit", status: "transport_drivers_status", export: "transport_drivers_export" } },
  vehicles: { full: "transport_vehicles", view: "transport_vehicles_view", actions: { create: "transport_vehicles_create", edit: "transport_vehicles_edit", status: "transport_vehicles_status", delete: "transport_vehicles_delete", export: "transport_vehicles_export" } },
  calendar: { view: "transport_calendar", actions: { export: "transport_calendar_export" } },
  history: { full: "transport_history", view: "transport_history_view", actions: { export: "transport_history_export" } },
  reports: { full: "transport_history", view: "transport_reports_view", actions: { export: "transport_reports_export" } },
  payroll: { full: "payroll_manage", view: "payroll_view", fullExcludes: ["delete"], actions: { employees: "payroll_employees", runs: "payroll_runs", pay: "payroll_pay", absences: "payroll_absences", documents: "payroll_documents", delete: "payroll_delete", export: "payroll_export" } },
  hiring: { full: "hiring_manage", view: "hiring_view", fullExcludes: ["delete"], actions: { vacancies: "hiring_vacancies", candidates: "hiring_candidates", contracts: "hiring_contracts", delete: "hiring_delete", export: "hiring_export" } },
  sst: { full: "sst_compliance", view: "sst_view", actions: { edit: "sst_edit", renew: "sst_renew", delete: "sst_delete", export: "sst_export" } },
  contact: { view: "contact_b2b_view", actions: { export: "contact_b2b_export" } }
};

/** Todas las llaves de permiso que introducen estos módulos (consulta, completas y por acción). */
export const PORTAL_MODULE_PERMISSION_KEYS: string[] = Array.from(
  new Set(
    Object.values(PORTAL_PERMISSION_MODULES).flatMap((m) => [
      ...(m.full ? [m.full] : []),
      ...(m.view ? [m.view] : []),
      ...Object.values(m.actions)
    ])
  )
);

/** Llaves que abren/consultan un módulo (completa, consulta o cualquier acción). */
export function portalModuleKeys(moduleId: string): string[] {
  const m = PORTAL_PERMISSION_MODULES[moduleId];
  if (!m) return [];
  return [...(m.full ? [m.full] : []), ...(m.view ? [m.view] : []), ...Object.values(m.actions)];
}

/** ¿Puede abrir/consultar el módulo? (no incluye administrador: eso lo resuelve quien llama). */
export function portalCanView(permissionSet: ReadonlySet<string>, moduleId: string): boolean {
  return portalModuleKeys(moduleId).some((k) => permissionSet.has(k));
}

/**
 * ¿Puede ejecutar la acción? Igual que `canDo` del portal: llave propia, permiso completo (salvo exclusiones)
 * o permisos de otros módulos que ya la permitían. «view» equivale a `portalCanView`.
 */
export function portalCan(permissionSet: ReadonlySet<string>, moduleId: string, action = "view"): boolean {
  const m = PORTAL_PERMISSION_MODULES[moduleId];
  if (!m) return false;
  if (action === "view") return portalCanView(permissionSet, moduleId);
  const own = m.actions[action];
  if (own && permissionSet.has(own)) return true;
  if (m.full && permissionSet.has(m.full) && !(m.fullExcludes || []).includes(action)) return true;
  return (m.alsoFrom?.[action] || []).some((k) => permissionSet.has(k));
}

/**
 * ¿Puede escribir en la colección que sirve a estas acciones? El permiso completo histórico siempre escribe
 * (aunque la interfaz reserve algunas acciones al administrador) y cualquiera de las acciones indicadas también.
 * Un permiso solo de consulta o solo de exportación no escribe.
 */
export function portalCanWrite(permissionSet: ReadonlySet<string>, moduleId: string, actions: string[]): boolean {
  const m = PORTAL_PERMISSION_MODULES[moduleId];
  if (!m) return false;
  if (m.full && permissionSet.has(m.full)) return true;
  return actions.some((a) => {
    const own = m.actions[a];
    return Boolean(own && permissionSet.has(own));
  });
}
