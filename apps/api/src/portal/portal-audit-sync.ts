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
  tripRouteRates: { table: "tarifas_trayecto", moduleId: "trips", moduleLabel: "Viajes" },
  approvals: { table: "solicitudes_autorizacion", moduleId: "authorizations", moduleLabel: "Autorizaciones" }
};

const LABEL_FIELDS = [
  "name",
  "fullName",
  "nombre_completo",
  "nombre",
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
  "subject",
  "asunto",
  "idDoc",
  "numero_documento"
];

export function portalRowEntityLabel(row: Record<string, unknown>): string {
  for (const key of LABEL_FIELDS) {
    const value = String(row[key] ?? "").trim();
    if (value) return value.slice(0, 500);
  }
  const id = String(row.id ?? "").trim();
  return id ? `Registro ${id.slice(0, 8)}` : "Registro";
}

export function portalRowEntitySummary(row: Record<string, unknown>, action: string): string {
  const parts: string[] = [];
  const status = String(row.status ?? row.estado ?? "").trim();
  if (status) parts.push(`Estado: ${status}`);
  const doc = String(row.idDoc ?? row.numero_documento ?? "").trim();
  if (doc) parts.push(`Doc. ${doc}`);
  const plate = String(row.plate ?? row.placa ?? "").trim();
  if (plate) parts.push(`Placa ${plate}`);
  const period = String(row.periodKey ?? row.periodo_mes ?? "").trim();
  if (period) parts.push(`Periodo ${period}`);
  const motivo = String(row.reason ?? row.motivo ?? "").trim();
  if (motivo && action === "delete") parts.push(`Motivo: ${motivo}`);
  if (!parts.length) {
    parts.push(
      action === "create" ? "Alta en servidor" : action === "delete" ? "Baja en servidor" : "Actualización en servidor"
    );
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
      entityLabel: entityLabel || `Tarifa ${entityId.slice(0, 8)}`,
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

/** Evita 500 por FK/UUID inválido: solo persiste id_usuario si existe en `usuarios`. */
async function resolvePortalAuditUserIdForInsert(
  c: PoolClient,
  userId: string | null | undefined
): Promise<string | null> {
  const raw = String(userId || "").trim();
  if (!raw || !PG_UUID_V4_RE.test(raw)) return null;
  const exists = await c.query(`SELECT 1 FROM usuarios WHERE id = $1::uuid LIMIT 1`, [raw]);
  return exists.rowCount ? raw : null;
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
  }
): Promise<void> {
  if (!(await auditTableReady(c))) return;
  const action = String(event.action || "update").toLowerCase();
  if (!["create", "update", "delete"].includes(action)) return;
  const moduleId = String(event.moduleId || "dashboard").trim().slice(0, 64);
  const moduleLabel = String(event.moduleLabel || moduleId).trim().slice(0, 120);
  let clientEventId: string | null = String(event.clientEventId || "").trim();
  if (clientEventId && !PG_UUID_V4_RE.test(clientEventId)) clientEventId = null;
  const actorUserId = await resolvePortalAuditUserIdForInsert(c, actor.userId);

  await c.query(
    `INSERT INTO auditoria_eventos_portal (
        id_evento_cliente, accion, modulo_id, modulo_etiqueta,
        entidad_id, entidad_etiqueta, resumen,
        id_usuario, usuario_email, usuario_etiqueta
      )
      VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8::uuid, $9, $10)
      ON CONFLICT (id_evento_cliente) DO NOTHING`,
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
      String(actor.label || "").trim().slice(0, 500) || null
    ]
  );
}

export async function preparePortalSyncUpsertAudits(
  c: PoolClient,
  key: PortalSyncKey,
  data: unknown
): Promise<PortalSyncUpsertAudit[]> {
  if (key === "tripRouteRates") {
    return preparePortalSyncTripRouteRatesAudits(c, data);
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
      summary: portalRowEntitySummary(row, action)
    });
  }
  return pending;
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

  const payloadById = new Map<string, string>();
  if (Array.isArray(data)) {
    for (const raw of data) {
      const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
      if (!row) continue;
      const id = String(row.id ?? "").trim();
      if (id) payloadById.set(id, portalRowEntityLabel(row));
    }
  }

  for (const entityId of ids) {
    await insertPortalAuditEventTx(c, actor, {
      action: "delete",
      moduleId: meta.moduleId,
      moduleLabel: meta.moduleLabel,
      entityId,
      entityLabel: payloadById.get(entityId) || `Registro ${entityId.slice(0, 8)}`,
      summary: "Eliminación confirmada en servidor"
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
      moduleId: meta.moduleId,
      moduleLabel: meta.moduleLabel,
      entityId: item.entityId,
      entityLabel: item.entityLabel,
      summary: item.summary
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
