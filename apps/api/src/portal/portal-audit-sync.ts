/**
 * Auditoría centralizada de mutaciones del portal (sync-key y borrados admin).
 * Inserta en `auditoria_eventos_portal` dentro de la misma transacción PostgreSQL.
 */
import type { PoolClient } from "pg";
import type { PortalSyncKey } from "./dto/sync-key.dto";

const PG_UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PortalAuditActor = {
  userId: string;
  email: string;
  label: string;
};

export type PortalSyncUpsertAudit = {
  action: "create" | "update";
  entityId: string;
  entityLabel: string;
  summary: string;
  moduleId?: string;
  moduleLabel?: string;
  actorUserIdCandidates?: string[];
};

type SyncAuditMeta = {
  table: string;
  moduleId: string;
  moduleLabel: string;
};

/** Claves sync-key → tabla física y módulo del Historial. */
export const PORTAL_SYNC_AUDIT_META: Partial<Record<PortalSyncKey, SyncAuditMeta>> = {
  users: { table: "usuarios", moduleId: "users", moduleLabel: "Usuarios y permisos" },
  companies: { table: "empresas", moduleId: "users", moduleLabel: "Usuarios y permisos" },
  contacts: { table: "prospectos_contacto_b2b", moduleId: "contact_b2b", moduleLabel: "Contacto web (B2B)" },
  requests: { table: "solicitudes_transporte", moduleId: "requests", moduleLabel: "Mis solicitudes" },
  vehicles: { table: "vehiculos", moduleId: "vehicles", moduleLabel: "Camiones" },
  drivers: { table: "conductores", moduleId: "drivers", moduleLabel: "Conductores" },
  notifications: { table: "notificaciones", moduleId: "notifications", moduleLabel: "Notificaciones" },
  emails: { table: "correos_salida", moduleId: "users", moduleLabel: "Usuarios y permisos" },
  payrollEmployees: { table: "empleados_nomina", moduleId: "payroll", moduleLabel: "Gestión humana" },
  payrollRuns: { table: "liquidaciones_nomina", moduleId: "payroll", moduleLabel: "Gestión humana" },
  fuelLogs: { table: "registros_combustible", moduleId: "vehicles", moduleLabel: "Camiones" },
  vehicleTechnicalLogs: {
    table: "registros_mantenimiento_vehiculo",
    moduleId: "vehicles",
    moduleLabel: "Camiones"
  },
  travelAllowanceRules: {
    table: "reglas_viatico_interdepartamental",
    moduleId: "payroll",
    moduleLabel: "Gestión humana"
  },
  vacancies: { table: "vacantes", moduleId: "hiring", moduleLabel: "Contratación" },
  candidates: { table: "candidatos", moduleId: "hiring", moduleLabel: "Contratación" },
  positions: { table: "cargos", moduleId: "hiring", moduleLabel: "Contratación" },
  interviews: { table: "entrevistas", moduleId: "hiring", moduleLabel: "Contratación" },
  contracts: { table: "contratos", moduleId: "hiring", moduleLabel: "Contratación" },
  hrAbsences: { table: "ausencias_laborales", moduleId: "payroll", moduleLabel: "Gestión humana" },
  sstCompliance: {
    table: "registros_cumplimiento_sst",
    moduleId: "sst",
    moduleLabel: "Cumplimiento laboral y SST"
  },
  employeeDocuments: {
    table: "documentos_empleado",
    moduleId: "documents",
    moduleLabel: "Gestión documental"
  },
  employeeDocumentFolders: {
    table: "carpetas_documento_empleado",
    moduleId: "documents",
    moduleLabel: "Gestión documental"
  },
  tripRouteRates: { table: "tarifas_trayecto", moduleId: "trips", moduleLabel: "Viajes" },
  approvals: { table: "solicitudes_autorizacion", moduleId: "authorizations", moduleLabel: "Autorizaciones" }
};

const LABEL_FIELDS = [
  "name",
  "fullName",
  "nombre_completo",
  "nombre",
  "employeeName",
  "nombre_empleado",
  "fileName",
  "nombre_archivo",
  "title",
  "plate",
  "placa",
  "requestNumber",
  "numero_solicitud",
  "tripNumber",
  "numero_viaje",
  "email",
  "correo_electronico",
  "correo",
  "position",
  "nombre_cargo_texto",
  "companyName",
  "nombre_empresa",
  "contactName",
  "nombre_contacto",
  "periodKey",
  "periodo_mes",
  "month",
  "subject",
  "asunto",
  "idDoc",
  "numero_documento",
  "folderName",
  "nombre_carpeta"
];

const HISTORY_AUDIT_ACTION_TITLES: Record<string, Record<string, string>> = {
  users: {
    create: "Alta de usuario",
    update: "Actualización de usuario",
    delete: "Eliminación de usuario"
  },
  companies: {
    create: "Alta de empresa",
    update: "Actualización de empresa",
    delete: "Eliminación de empresa"
  },
  documents: {
    create: "Alta de documento",
    update: "Actualización de documento",
    delete: "Eliminación de documento"
  },
  employeeDocuments: {
    create: "Alta de documento",
    update: "Actualización de documento",
    delete: "Eliminación de documento"
  },
  employeeDocumentFolders: {
    create: "Alta de carpeta documental",
    update: "Actualización de carpeta documental",
    delete: "Eliminación de carpeta documental"
  },
  payrollEmployees: {
    create: "Alta de colaborador",
    update: "Actualización de colaborador",
    delete: "Eliminación de colaborador"
  },
  drivers: {
    create: "Alta de conductor",
    update: "Actualización de conductor",
    delete: "Eliminación de conductor"
  },
  vehicles: {
    create: "Alta de camión",
    update: "Actualización de camión",
    delete: "Eliminación de camión"
  },
  requests: {
    create: "Alta de solicitud",
    update: "Actualización de solicitud",
    delete: "Eliminación de solicitud"
  },
  trips: {
    create: "Alta de viaje",
    update: "Actualización de viaje",
    delete: "Eliminación de viaje"
  },
  notifications: {
    create: "Alta de notificación",
    update: "Actualización de notificación",
    delete: "Eliminación de notificación"
  },
  approvals: {
    create: "Solicitud de autorización",
    update: "Autorización revisada",
    delete: "Autorización rechazada"
  }
};

function portalHistoryActionTitle(moduleOrKey: string, action: string): string {
  const key = String(moduleOrKey || "").trim();
  const actionKey = action === "create" || action === "delete" ? action : "update";
  const fromMap = HISTORY_AUDIT_ACTION_TITLES[key]?.[actionKey];
  if (fromMap) return fromMap;
  if (actionKey === "create") return "Alta en servidor";
  if (actionKey === "delete") return "Eliminación en servidor";
  return "Actualización en servidor";
}

function portalDocumentSummaryParts(row: Record<string, unknown>): string[] {
  const parts: string[] = [];
  const fileName = String(row.fileName ?? row.nombre_archivo ?? "").trim();
  const employee = String(row.employeeName ?? row.nombre_empleado ?? "").trim();
  const docType = String(row.documentType ?? row.tipo_documento ?? "").trim();
  const folder = String(row.folder ?? row.carpeta ?? row.folderName ?? row.nombre_carpeta ?? "").trim();
  if (fileName) parts.push(fileName);
  if (employee) parts.push(employee);
  if (docType) parts.push(`Tipo: ${docType}`);
  if (folder) parts.push(`Carpeta: ${folder}`);
  return parts;
}

function isPortalDocumentRow(row: Record<string, unknown>): boolean {
  return Boolean(
    String(row.fileName ?? row.nombre_archivo ?? "").trim() ||
      String(row.documentType ?? row.tipo_documento ?? "").trim() ||
      (String(row.folder ?? row.carpeta ?? "").trim() &&
        String(row.employeeName ?? row.nombre_empleado ?? "").trim())
  );
}

function isPortalDocumentFolderRow(row: Record<string, unknown>): boolean {
  return Boolean(
    String(row.folderName ?? row.nombre_carpeta ?? "").trim() &&
      !String(row.fileName ?? row.nombre_archivo ?? "").trim()
  );
}

function portalPayrollRunParts(row: Record<string, unknown>) {
  const emp = String(row.employeeName ?? row.nombre_empleado ?? "").trim();
  const period = String(row.month ?? row.periodo_mes ?? row.periodKey ?? "").trim();
  return { emp, period };
}

function portalPayrollRunEntityLabel(row: Record<string, unknown>): string | null {
  const { emp, period } = portalPayrollRunParts(row);
  if (emp && period) return `${emp} · ${period}`;
  if (emp) return emp;
  if (period) return `Periodo ${period}`;
  return null;
}

function portalPayrollRunSummaryParts(row: Record<string, unknown>): string[] {
  const parts: string[] = [];
  const { emp, period } = portalPayrollRunParts(row);
  if (period) parts.push(`Periodo ${period}`);
  const netRaw = row.net ?? row.neto_a_pagar;
  if (netRaw != null && netRaw !== "") {
    const net = Number(netRaw);
    if (Number.isFinite(net)) {
      parts.push(`Neto ${Math.round(net).toLocaleString("es-CO")} COP`);
    }
  }
  const payrollKind = String(row.payrollKind ?? row.tipo_registro ?? "").trim();
  if (payrollKind && payrollKind !== "mensual") parts.push(`Tipo ${payrollKind}`);
  if (emp && !portalPayrollRunEntityLabel(row)?.includes(emp)) parts.push(emp);
  return parts;
}

export function portalRowEntityLabel(row: Record<string, unknown>): string {
  const payrollLabel = portalPayrollRunEntityLabel(row);
  if (payrollLabel) return payrollLabel.slice(0, 500);
  if (isPortalDocumentFolderRow(row)) {
    const emp = String(row.employeeName ?? row.nombre_empleado ?? "").trim();
    const folder = String(row.folderName ?? row.nombre_carpeta ?? "").trim();
    if (emp && folder) return `${emp} · ${folder}`.slice(0, 500);
    if (folder) return `Carpeta · ${folder}`.slice(0, 500);
  }
  if (isPortalDocumentRow(row)) {
    const emp = String(row.employeeName ?? row.nombre_empleado ?? "").trim();
    const fileName = String(row.fileName ?? row.nombre_archivo ?? "").trim();
    const docType = String(row.documentType ?? row.tipo_documento ?? "").trim();
    if (emp && (fileName || docType)) return `${emp} · ${fileName || docType}`.slice(0, 500);
    if (fileName) return fileName.slice(0, 500);
  }
  for (const key of LABEL_FIELDS) {
    const value = String(row[key] ?? "").trim();
    if (value) return value.slice(0, 500);
  }
  const plate = String(row.plate ?? row.placa ?? row.vehiclePlate ?? row.placa_vehiculo ?? "").trim();
  if (plate) return plate.toUpperCase().slice(0, 500);
  const desc = String(row.description ?? row.descripcion ?? "").trim();
  if (desc) return desc.slice(0, 120);
  return "Registro";
}

function portalFuelLogSummaryParts(row: Record<string, unknown>): string[] {
  const parts: string[] = [];
  const plate = String(row.plate ?? row.vehiclePlate ?? row.placa_vehiculo ?? "").trim().toUpperCase();
  const date = String(row.date ?? row.fecha ?? "").trim().slice(0, 10);
  const liters = Number(row.liters ?? row.litros);
  const total = Number(row.totalCost ?? row.costo_total ?? row.total_cost);
  const driver = String(row.driverName ?? row.nombre_conductor ?? "").trim();
  const station = String(row.station ?? row.estacion ?? "").trim();
  if (plate) parts.push(`Placa ${plate}`);
  if (date) parts.push(date);
  if (Number.isFinite(liters) && liters > 0) parts.push(`${liters.toLocaleString("es-CO")} L`);
  if (Number.isFinite(total) && total > 0) parts.push(`$${Math.round(total).toLocaleString("es-CO")}`);
  if (driver) parts.push(driver);
  if (station) parts.push(station);
  return parts;
}

function portalTechnicalLogSummaryParts(row: Record<string, unknown>): string[] {
  const parts: string[] = [];
  const plate = String(row.plate ?? row.vehiclePlate ?? row.placa_vehiculo ?? "").trim().toUpperCase();
  const date = String(row.date ?? row.fecha ?? "").trim().slice(0, 10);
  const typeRaw = String(row.interventionType ?? row.type ?? row.tipo_intervencion ?? "").trim().toLowerCase();
  const typeLabel =
    typeRaw === "preventivo"
      ? "Preventivo"
      : typeRaw === "correctivo"
        ? "Correctivo"
        : typeRaw === "falla"
          ? "Falla técnica"
          : typeRaw;
  const desc = String(row.description ?? row.descripcion ?? "").trim();
  const cost = Number(row.cost ?? row.costo);
  if (plate) parts.push(`Placa ${plate}`);
  if (date) parts.push(date);
  if (typeLabel) parts.push(typeLabel);
  if (desc) parts.push(desc.length > 72 ? `${desc.slice(0, 72)}…` : desc);
  if (Number.isFinite(cost) && cost > 0) parts.push(`$${Math.round(cost).toLocaleString("es-CO")}`);
  return parts;
}

export function portalRowEntitySummary(
  row: Record<string, unknown>,
  action: string,
  moduleOrKey = ""
): string {
  const fuelParts = portalFuelLogSummaryParts(row);
  if (fuelParts.length >= 2) {
    return (
      action === "create"
        ? `Carga de combustible · ${fuelParts.join(" · ")}`
        : action === "delete"
          ? `Eliminación de combustible · ${fuelParts.join(" · ")}`
          : `Actualización de combustible · ${fuelParts.join(" · ")}`
    ).slice(0, 2000);
  }
  const techParts = portalTechnicalLogSummaryParts(row);
  if (techParts.length >= 2) {
    return (
      action === "create"
        ? `Registro de taller · ${techParts.join(" · ")}`
        : action === "delete"
          ? `Eliminación de taller · ${techParts.join(" · ")}`
          : `Actualización de taller · ${techParts.join(" · ")}`
    ).slice(0, 2000);
  }
  if (isPortalDocumentFolderRow(row) || moduleOrKey === "employeeDocumentFolders") {
    const title = portalHistoryActionTitle("employeeDocumentFolders", action);
    const folder = String(row.folderName ?? row.nombre_carpeta ?? "").trim();
    const emp = String(row.employeeName ?? row.nombre_empleado ?? "").trim();
    return [title, folder, emp].filter(Boolean).join(" · ").slice(0, 2000);
  }
  if (isPortalDocumentRow(row) || moduleOrKey === "employeeDocuments" || moduleOrKey === "documents") {
    const title = portalHistoryActionTitle("documents", action);
    const docParts = portalDocumentSummaryParts(row);
    const motivo = String(row.reason ?? row.motivo ?? "").trim();
    const bits = [title, ...docParts];
    if (motivo && action === "delete") bits.push(`Motivo: ${motivo}`);
    return bits.join(" · ").slice(0, 2000);
  }
  const parts: string[] = portalPayrollRunSummaryParts(row);
  const status = String(row.status ?? row.estado ?? "").trim();
  if (status) parts.push(`Estado: ${status}`);
  const doc = String(row.idDoc ?? row.numero_documento ?? "").trim();
  if (doc) parts.push(`Doc. ${doc}`);
  const plate = String(row.plate ?? row.placa ?? "").trim();
  if (plate) parts.push(`Placa ${plate}`);
  const period = String(row.periodKey ?? row.periodo_mes ?? row.month ?? "").trim();
  if (period && !parts.some((p) => p.includes(period))) parts.push(`Periodo ${period}`);
  const motivo = String(row.reason ?? row.motivo ?? "").trim();
  if (motivo && action === "delete") parts.push(`Motivo: ${motivo}`);
  const actionTitle = portalHistoryActionTitle(moduleOrKey || "dashboard", action);
  if (!parts.length) {
    parts.push(actionTitle);
  } else if (moduleOrKey && HISTORY_AUDIT_ACTION_TITLES[moduleOrKey]) {
    return `${actionTitle} · ${parts.join(" · ")}`.slice(0, 2000);
  }
  if (action === "delete" && portalPayrollRunParts(row).period) {
    return `Eliminación de liquidación · ${parts.join(" · ")}`.slice(0, 2000);
  }
  return parts.join(" · ").slice(0, 2000);
}

const TRIP_RATE_SEP = "@@";
const PG_UUID_V4_RE_LOCAL =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseTripRouteRateEntry(
  keyStr: string,
  valRaw: unknown
): { id: string | null; od: string; oc: string; dd: string; dc: string; cop: number } | null {
  let routePart = String(keyStr || "");
  const sepIdx = routePart.lastIndexOf(TRIP_RATE_SEP);
  if (sepIdx !== -1) routePart = routePart.slice(0, sepIdx);
  const parts = routePart.split("->");
  if (parts.length !== 2) return null;
  const [oa, da] = parts;
  const [od, oc] = String(oa).split("|");
  const [dd, dc] = String(da).split("|");
  let cop = 0;
  let incomingId: string | null = null;
  if (typeof valRaw === "number") cop = Number(valRaw);
  else if (valRaw && typeof valRaw === "object" && !Array.isArray(valRaw)) {
    const v = (valRaw as { value?: unknown; id?: unknown }).value;
    const rawId = String((valRaw as { id?: unknown }).id || "").trim();
    incomingId = PG_UUID_V4_RE_LOCAL.test(rawId) ? rawId : null;
    cop = Number(v) || 0;
  }
  if (!(cop > 0)) return null;
  return { id: incomingId, od: od || "", oc: oc || "", dd: dd || "", dc: dc || "", cop };
}

async function preparePortalSyncTripRouteRatesAudits(
  c: PoolClient,
  data: unknown
): Promise<PortalSyncUpsertAudit[]> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return [];
  const pending: PortalSyncUpsertAudit[] = [];
  for (const [keyStr, valRaw] of Object.entries(data as Record<string, unknown>)) {
    const row = parseTripRouteRateEntry(keyStr, valRaw);
    if (!row) continue;
    const entityLabel = `${row.od} ${row.oc} → ${row.dd} ${row.dc}`.trim().slice(0, 500);
    let entityId = row.id;
    if (!entityId) {
      const lookup = await c.query<{ id: string }>(
        `SELECT id::text AS id FROM tarifas_trayecto
         WHERE lower(trim(departamento_origen)) = lower(trim($1))
           AND lower(trim(ciudad_origen)) = lower(trim($2))
           AND lower(trim(departamento_destino)) = lower(trim($3))
           AND lower(trim(ciudad_destino)) = lower(trim($4))
         LIMIT 1`,
        [row.od, row.oc, row.dd, row.dc]
      );
      entityId = lookup.rows[0]?.id || null;
    }
    if (!entityId || !PG_UUID_V4_RE_LOCAL.test(entityId)) continue;
    const exists = await c.query(`SELECT 1 FROM tarifas_trayecto WHERE id = $1::uuid LIMIT 1`, [entityId]);
    const action: "create" | "update" = exists.rowCount ? "update" : "create";
    pending.push({
      action,
      entityId,
      entityLabel: entityLabel || "Tarifa por trayecto",
      summary: `Tarifa COP ${row.cop.toLocaleString("es-CO")}`
    });
  }
  return pending;
}

async function auditTableReady(c: PoolClient): Promise<boolean> {
  const r = await c.query<{ reg: string | null }>(
    `SELECT to_regclass('public.auditoria_eventos_portal')::text AS reg`
  );
  return Boolean(r.rows[0]?.reg);
}

function portalRowActorUserIdCandidates(row: Record<string, unknown>): string[] {
  const keys = ["updatedByUserId", "createdByUserId", "updated_by_user_id", "created_by_user_id", "actorUserId"];
  const out: string[] = [];
  for (const key of keys) {
    const raw = String(row[key] ?? "").trim();
    if (raw && PG_UUID_V4_RE.test(raw) && !out.includes(raw)) out.push(raw);
  }
  return out;
}

/** Evita 500 por FK/UUID inválido: solo persiste id_usuario si existe en `usuarios`. */
export async function resolvePortalAuditUserIdForInsert(
  c: PoolClient,
  ...candidates: Array<string | null | undefined>
): Promise<string | null> {
  for (const candidate of candidates) {
    const raw = String(candidate || "").trim();
    if (!raw || !PG_UUID_V4_RE.test(raw)) continue;
    const exists = await c.query(`SELECT 1 FROM usuarios WHERE id = $1::uuid LIMIT 1`, [raw]);
    if (exists.rowCount) return raw;
  }
  return null;
}

async function resolvePortalAuditUserIdWithEmailFallback(
  c: PoolClient,
  email: string | null | undefined,
  ...candidates: Array<string | null | undefined>
): Promise<string | null> {
  const fromIds = await resolvePortalAuditUserIdForInsert(c, ...candidates);
  if (fromIds) return fromIds;
  const em = String(email || "").trim().toLowerCase();
  if (!em) return null;
  const r = await c.query<{ id: string }>(
    `SELECT id::text AS id FROM usuarios WHERE lower(trim(correo_electronico)) = $1 LIMIT 1`,
    [em]
  );
  const id = String(r.rows[0]?.id || "").trim();
  return id && PG_UUID_V4_RE.test(id) ? id : null;
}

export async function insertPortalAuditEventTx(
  c: PoolClient,
  actor: PortalAuditActor,
  event: {
    action: "create" | "update" | "delete";
    moduleId: string;
    moduleLabel: string;
    entityId?: string;
    entityLabel?: string;
    summary?: string;
    clientEventId?: string;
    detailAction?: string;
    detailId?: string;
    registeredAt?: string | null;
    actorUserIdCandidates?: string[];
  }
): Promise<boolean> {
  if (!(await auditTableReady(c))) return false;
  const action = String(event.action || "update").toLowerCase();
  if (!["create", "update", "delete"].includes(action)) return false;
  const moduleId = String(event.moduleId || "dashboard").trim().slice(0, 64);
  const moduleLabel = String(event.moduleLabel || moduleId).trim().slice(0, 120);
  let clientEventId: string | null = String(event.clientEventId || "").trim();
  if (!clientEventId || !PG_UUID_V4_RE.test(clientEventId)) clientEventId = null;
  const actorUserId = await resolvePortalAuditUserIdWithEmailFallback(
    c,
    actor.email,
    actor.userId,
    ...(event.actorUserIdCandidates || [])
  );

  const atRaw = String(event.registeredAt || "").trim();
  const registeredAt =
    atRaw && !Number.isNaN(new Date(atRaw).getTime()) ? new Date(atRaw).toISOString() : null;

  const result = await c.query(
    `INSERT INTO auditoria_eventos_portal (
        id_evento_cliente, accion, modulo_id, modulo_etiqueta,
        entidad_id, entidad_etiqueta, resumen,
        id_usuario, usuario_email, usuario_etiqueta,
        detalle_accion, detalle_id, registrado_en
      )
      VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8::uuid, $9, $10, $11, $12, COALESCE($13::timestamptz, now()))
      ON CONFLICT (id_evento_cliente) DO NOTHING
      RETURNING id`,
    [
      clientEventId,
      action,
      moduleId,
      moduleLabel,
      String(event.entityId || "").trim().slice(0, 64) || null,
      String(event.entityLabel || "Registro").trim().slice(0, 500) || null,
      String(event.summary || "").trim().slice(0, 2000) || null,
      actorUserId,
      String(actor.email || "").trim().slice(0, 255) || null,
      String(actor.label || "").trim().slice(0, 500) || null,
      String(event.detailAction || "").trim().slice(0, 64) || null,
      String(event.detailId || "").trim().slice(0, 64) || null,
      registeredAt
    ]
  );
  return Boolean(result.rowCount);
}

async function preparePortalSyncRequestsAudits(c: PoolClient, data: unknown): Promise<PortalSyncUpsertAudit[]> {
  const meta = PORTAL_SYNC_AUDIT_META.requests;
  if (!meta || !Array.isArray(data)) return [];
  const pending: PortalSyncUpsertAudit[] = [];
  for (const raw of data) {
    const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
    if (!row) continue;
    const entityId = String(row.id ?? "").trim();
    if (!PG_UUID_V4_RE.test(entityId)) continue;
    const actorUserIdCandidates = portalRowActorUserIdCandidates(row);
    const exists = await c.query(`SELECT 1 FROM ${meta.table} WHERE id = $1::uuid LIMIT 1`, [entityId]);
    const action: "create" | "update" = exists.rowCount ? "update" : "create";
    pending.push({
      action,
      entityId,
      entityLabel: portalRowEntityLabel(row),
      summary: portalRowEntitySummary(row, action, "requests"),
      actorUserIdCandidates
    });

    const trip = row.trip;
    if (!trip || typeof trip !== "object" || Array.isArray(trip)) continue;
    const tripRow = trip as Record<string, unknown>;
    const tripNumber = String(tripRow.tripNumber ?? "").trim();
    if (!tripNumber) continue;
    let tripEntityId = String(tripRow.id ?? "").trim();
    if (!PG_UUID_V4_RE.test(tripEntityId)) {
      const lookup = await c.query<{ id: string }>(
        `SELECT id::text AS id FROM viajes_transporte WHERE id_solicitud = $1::uuid LIMIT 1`,
        [entityId]
      );
      tripEntityId = String(lookup.rows[0]?.id || "").trim();
    }
    if (!PG_UUID_V4_RE.test(tripEntityId)) continue;
    const tripExists = await c.query(`SELECT 1 FROM viajes_transporte WHERE id = $1::uuid LIMIT 1`, [tripEntityId]);
    const tripAction: "create" | "update" = tripExists.rowCount ? "update" : "create";
    const plate = String(tripRow.vehiclePlate ?? "").trim();
    const driver = String(tripRow.driverName ?? "").trim();
    const tripSummary = [plate ? `Placa ${plate}` : "", driver ? `Conductor ${driver}` : ""]
      .filter(Boolean)
      .join(" · ");
    pending.push({
      action: tripAction,
      entityId: tripEntityId,
      entityLabel: tripNumber.slice(0, 500),
      summary: tripSummary || `Viaje ${tripNumber}`,
      moduleId: "trips",
      moduleLabel: "Viajes",
      actorUserIdCandidates
    });
  }
  return pending;
}

export async function preparePortalSyncUpsertAudits(
  c: PoolClient,
  key: PortalSyncKey,
  data: unknown
): Promise<PortalSyncUpsertAudit[]> {
  if (key === "tripRouteRates") {
    return preparePortalSyncTripRouteRatesAudits(c, data);
  }
  if (key === "requests") {
    return preparePortalSyncRequestsAudits(c, data);
  }
  const meta = PORTAL_SYNC_AUDIT_META[key];
  if (!meta || !Array.isArray(data)) return [];
  const pending: PortalSyncUpsertAudit[] = [];
  for (const raw of data) {
    const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
    if (!row) continue;
    const entityId = String(row.id ?? "").trim();
    if (!PG_UUID_V4_RE.test(entityId)) continue;
    const exists = await c.query(`SELECT 1 FROM ${meta.table} WHERE id = $1::uuid LIMIT 1`, [entityId]);
    const action: "create" | "update" = exists.rowCount ? "update" : "create";
    pending.push({
      action,
      entityId,
      entityLabel: portalRowEntityLabel(row),
      summary: portalRowEntitySummary(row, action, key),
      actorUserIdCandidates: portalRowActorUserIdCandidates(row)
    });
  }
  return pending;
}

async function lookupPortalSyncDeleteRows(
  c: PoolClient,
  table: string,
  ids: string[]
): Promise<Map<string, Record<string, unknown>>> {
  const out = new Map<string, Record<string, unknown>>();
  if (!ids.length) return out;
  try {
    const r = await c.query(`SELECT * FROM ${table} WHERE id = ANY($1::uuid[])`, [ids]);
    for (const raw of r.rows) {
      const row = raw as Record<string, unknown>;
      const id = String(row.id ?? "").trim();
      if (id) out.set(id, row);
    }
  } catch {
    /* fila ya ausente o tabla no disponible */
  }
  return out;
}

export async function recordPortalSyncDeleteAudits(
  c: PoolClient,
  actor: PortalAuditActor,
  key: PortalSyncKey,
  deletedIds?: unknown[],
  data?: unknown
): Promise<void> {
  const meta = PORTAL_SYNC_AUDIT_META[key];
  if (!meta) return;
  const ids = (Array.isArray(deletedIds) ? deletedIds : [])
    .map((raw) => String(raw ?? "").trim())
    .filter((id) => PG_UUID_V4_RE.test(id));
  if (!ids.length) return;

  const payloadRowsById = new Map<string, Record<string, unknown>>();
  if (Array.isArray(data)) {
    for (const raw of data) {
      const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
      if (!row) continue;
      const id = String(row.id ?? "").trim();
      if (id) payloadRowsById.set(id, row);
    }
  }

  const dbRowsById = await lookupPortalSyncDeleteRows(c, meta.table, ids);

  for (const entityId of ids) {
    const row = payloadRowsById.get(entityId) || dbRowsById.get(entityId) || null;
    await insertPortalAuditEventTx(c, actor, {
      action: "delete",
      moduleId: meta.moduleId,
      moduleLabel: meta.moduleLabel,
      entityId,
      entityLabel: row ? portalRowEntityLabel(row) : "Registro",
      summary: row
        ? portalRowEntitySummary(row, "delete", key)
        : `${portalHistoryActionTitle(key, "delete")} · confirmada en servidor`
    });
  }
}

export async function flushPortalSyncUpsertAudits(
  c: PoolClient,
  actor: PortalAuditActor,
  key: PortalSyncKey,
  pending: PortalSyncUpsertAudit[]
): Promise<void> {
  const meta = PORTAL_SYNC_AUDIT_META[key];
  if (!meta || !pending.length) return;
  for (const item of pending) {
    await insertPortalAuditEventTx(c, actor, {
      action: item.action,
      moduleId: item.moduleId || meta.moduleId,
      moduleLabel: item.moduleLabel || meta.moduleLabel,
      entityId: item.entityId,
      entityLabel: item.entityLabel,
      summary: item.summary,
      actorUserIdCandidates: item.actorUserIdCandidates
    });
  }
}

export async function recordPortalAdminDeleteAudit(
  c: PoolClient,
  actor: PortalAuditActor,
  moduleId: string,
  moduleLabel: string,
  entityId: string,
  entityLabel: string,
  summary = ""
): Promise<void> {
  await insertPortalAuditEventTx(c, actor, {
    action: "delete",
    moduleId,
    moduleLabel,
    entityId,
    entityLabel,
    summary: summary || "Eliminación administrativa en servidor"
  });
}
