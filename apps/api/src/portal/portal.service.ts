import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleInit
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Pool, PoolClient } from "pg";
import { createClient } from "@supabase/supabase-js";
import * as bcrypt from "bcrypt";
import { normalizeSupabaseProjectUrl } from "../common/normalize-supabase-url";
import { PG_POOL } from "../database/database.module";
import { MailService } from "../mail/mail.service";
import { R2Service } from "../uploads/r2.service";
import {
  computeColombiaPayrollForPeriodCut,
  monthUtcBounds,
  parseSqlDate,
  SMMLV_COP_REFERENCE_2026,
  type AbsenceInput
} from "../payroll/colombian-monthly-payroll";
import {
  bogotaCalendarPartsFromInstant,
  liquidationCutIfClosingToday,
  liquidationCutsOverlappingRange,
  liquidationLatestClosedCutAsOf,
  liquidationLatestPendingCutAsOf,
  resolveLiquidationCutFromPeriodKey,
  type LiquidationCut
} from "../payroll/payroll-cut-bogota";
import { buildDriverTripPaymentCompute } from "../payroll/driver-trip-payment";
import { employeeIsConductorServiceProvider, employeeReceivesPayrollNomina } from "../payroll/payroll-employee-kind";
import {
  canonicalPayFrequencyLabel,
  isPayrollAutogenFrequency,
  normalizePayrollFrequency
} from "../payroll/payroll-frequency";
import {
  formatColombiaDateTimeDisplay,
  timestamptzStringColombiaNow,
  timestamptzToColombiaIso
} from "../common/colombia-time";
import {
  normalizeCatalogTextFromUnknown,
  normalizeDbTextUpperFromUnknown,
  normalizeDbTextUpperOrNullFromUnknown,
  normalizeEmailFromUnknown,
  normalizeFreeTextPayloadRecord,
  normalizePortalPhoneForStorage,
  sanitizeSyncKeyPayload,
  normalizePersonTypeForDb
} from "../common/normalize-db-text";
import {
  matchPayrollCatalogOption,
  normalizeContractTemplateKindForDb,
  normalizeDefensiveCourseForDb,
  PAYROLL_EMPLOYEE_CATALOG
} from "../common/payroll-employee-catalogs";

const nu = normalizeDbTextUpperFromUnknown;
const nuN = normalizeDbTextUpperOrNullFromUnknown;
const cat = normalizeCatalogTextFromUnknown;
const em = normalizeEmailFromUnknown;
import {
  buildContractNoticeNotificationBody,
  computeEmployeeContractRenewalMeta,
  contractNoticeDedupeKey,
  contractNoticeRefToken
} from "./employee-contract-renewal";
import type { PortalSyncKey } from "./dto/sync-key.dto";
import {
  flushPortalSyncUpsertAudits,
  insertPortalAuditEventTx,
  preparePortalSyncUpsertAudits,
  recordPortalAdminDeleteAudit,
  recordPortalSyncDeleteAudits,
  type PortalAuditActor
} from "./portal-audit-sync";
import type { CreateFleetFuelLogDto } from "./dto/create-fleet-fuel-log.dto";
import type { CreateFleetMaintenanceLogDto } from "./dto/create-fleet-maintenance-log.dto";
import type { TransportScheduleBusyDto } from "./dto/transport-schedule-busy.dto";
import type { UpsertLaborSystemParametersDto } from "./dto/upsert-labor-system-parameters.dto";
import { LIQUIDACION_UPSERT } from "./liquidacion-upsert";
import { randomUUID } from "node:crypto";

type JwtRole = string;

type PortalLaborSystemRules = {
  smmlvCop: number;
  minMonthlySalaryCop: number;
  transportAllowanceCop: number;
  legalWeeklyHours: number;
  healthEmployeeRate: number;
  pensionEmployeeRate: number;
  uvtCop: number | null;
  activeYear: number;
  referenceMode: "automatic" | "manual";
};

type PortalLaborSystemParametersHistoryRow = {
  year: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  smmlvCop: number | null;
  minMonthlySalaryCop: number | null;
  transportAllowanceCop: number | null;
  legalWeeklyHours: number | null;
  healthEmployeeRate: number | null;
  pensionEmployeeRate: number | null;
  uvtCop: number | null;
  isCurrent: boolean;
};

const DEFAULT_FRONTEND_MIN_MONTHLY_SALARY_COP = 1_750_905;
const DEFAULT_FRONTEND_TRANSPORT_ALLOWANCE_COP = 249_095;
const DEFAULT_COLOMBIA_LEGAL_WEEKLY_HOURS = 46;
const DEFAULT_HEALTH_EMPLOYEE_RATE = 0.04;
const DEFAULT_PENSION_EMPLOYEE_RATE = 0.04;
const SYSTEM_PARAMETER_ALIASES = {
  smmlv: [
    "smmlv",
    "smmlv_cop",
    "salario_minimo",
    "salario_minimo_cop",
    "salario_minimo_mensual_legal_vigente"
  ],
  transportAllowance: [
    "auxilio_transporte",
    "auxilio_transporte_cop",
    "subsidio_transporte",
    "subsidio_transporte_cop"
  ],
  uvt: ["uvt", "uvt_cop", "unidad_valor_tributario"],
  legalWeeklyHours: [
    "horas_legales_semanales",
    "horas_legales",
    "legal_weekly_hours",
    "legal_weekly_hours_cop"
  ],
  healthEmployeeRate: ["porcentaje_salud_empleado", "salud_empleado", "health_employee_rate"],
  pensionEmployeeRate: ["porcentaje_pension_empleado", "pension_empleado", "pension_employee_rate"],
  platformReferenceYear: ["vigencia_laboral_activa", "anio_laboral_activo", "labor_active_year"]
} as const;

const LABOR_SYSTEM_PARAMETER_DEFS = {
  smmlvCop: {
    dbKey: "smmlv",
    aliases: SYSTEM_PARAMETER_ALIASES.smmlv,
    description: "Salario mínimo legal mensual vigente"
  },
  transportAllowanceCop: {
    dbKey: "auxilio_transporte",
    aliases: SYSTEM_PARAMETER_ALIASES.transportAllowance,
    description: "Auxilio legal de transporte / conectividad"
  },
  uvtCop: {
    dbKey: "uvt",
    aliases: SYSTEM_PARAMETER_ALIASES.uvt,
    description: "Unidad de valor tributario"
  },
  legalWeeklyHours: {
    dbKey: "horas_legales_semanales",
    aliases: SYSTEM_PARAMETER_ALIASES.legalWeeklyHours,
    description: "Horas legales semanales"
  },
  healthEmployeeRate: {
    dbKey: "porcentaje_salud_empleado",
    aliases: SYSTEM_PARAMETER_ALIASES.healthEmployeeRate,
    description: "Porcentaje aporte salud empleado"
  },
  pensionEmployeeRate: {
    dbKey: "porcentaje_pension_empleado",
    aliases: SYSTEM_PARAMETER_ALIASES.pensionEmployeeRate,
    description: "Porcentaje aporte pensión empleado"
  },
  platformReferenceYear: {
    dbKey: "vigencia_laboral_activa",
    aliases: SYSTEM_PARAMETER_ALIASES.platformReferenceYear,
    description: "Año de vigencia laboral aplicado en la plataforma"
  }
} as const;

const LABOR_SYSTEM_PARAMETERS_MIN_YEAR = 2020;
const LABOR_SYSTEM_PARAMETERS_MAX_YEAR = 2035;

function normalizeLaborSystemParameterYear(raw: unknown): number | null {
  const normalized = Math.trunc(Number(raw));
  if (!Number.isFinite(normalized)) return null;
  if (normalized < LABOR_SYSTEM_PARAMETERS_MIN_YEAR || normalized > LABOR_SYSTEM_PARAMETERS_MAX_YEAR) return null;
  return normalized;
}

/** UUID v4 — mismas entradas que acepta PostgreSQL al castear ::uuid */
const PG_UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Política de auditoría liviana:
 * - create/update se reconstruyen desde las tablas vivas (`createdAt` / `updatedAt`)
 * - delete conserva solo una instantánea compacta
 * - la tabla física rota para no crecer indefinidamente
 */
const PORTAL_DELETION_AUDIT_RETENTION_DAYS = 180;
const PORTAL_DELETION_AUDIT_BOOTSTRAP_LIMIT = 120;
const PORTAL_DELETION_AUDIT_MAX_ROWS = 2000;
/** Bitácora central del portal: sin poda automática (auditoría a largo plazo). */
const PORTAL_AUDIT_EVENTS_BOOTSTRAP_LIMIT = 800;
const PORTAL_AUDIT_EVENTS_QUERY_MAX = 10000;

/** Igual que `defaultPermissionsForRole` / ALL_PERMISSIONS en app.js */
const ALL_PORTAL_PERMISSIONS: string[] = [
  "dashboard_view",
  "client_requests",
  "transport_requests",
  "transport_trips",
  "transport_vehicles",
  "transport_vehicles_view",
  "transport_vehicles_create",
  "transport_vehicles_edit",
  "transport_vehicles_status",
  "transport_vehicles_delete",
  "transport_drivers",
  "transport_calendar",
  "transport_history",
  "payroll_manage",
  "hiring_manage",
  "sst_compliance",
  "users_manage",
  "authorizations_manage",
  "authorizations_transport",
  "authorizations_portal_registrations",
  "authorizations_portal_users",
  "authorizations_fleet",
  "authorizations_workforce",
  "authorizations_hr_absences",
  "authorizations_payroll_pay",
  "profile_view",
  "notifications_view",
  "contact_b2b_view"
];

function defaultPermissionsForApprovedRole(rol: string): string[] {
  const r = String(rol || "").toLowerCase();
  if (r === "admin") return [...ALL_PORTAL_PERMISSIONS];
  if (["rrhh", "administracion", "lider_administrativo"].includes(r)) {
    return [
      "dashboard_view",
      "payroll_manage",
      "hiring_manage",
      "sst_compliance",
      "profile_view",
      "notifications_view"
    ];
  }
  if (r === "auxiliar_administrativo") {
    return ["dashboard_view", "payroll_manage", "profile_view", "notifications_view"];
  }
  if (r === "logistica") {
    return [
      "dashboard_view",
      "transport_requests",
      "authorizations_transport",
      "transport_trips",
      "transport_calendar",
      "transport_vehicles",
      "transport_drivers",
      "profile_view",
      "notifications_view"
    ];
  }
  return ["dashboard_view", "client_requests", "profile_view", "notifications_view"];
}

const APPROVE_VALID_ROLES = new Set([
  "admin",
  "client",
  "rrhh",
  "administracion",
  "auxiliar_administrativo",
  "lider_administrativo",
  "logistica"
]);

function redactEmailForLog(raw: string | undefined | null): string {
  const email = String(raw || "").trim().toLowerCase();
  const at = email.indexOf("@");
  if (at <= 0) return email ? "[redacted]" : "";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const [host, ...rest] = domain.split(".");
  const safeLocal = local.length <= 2 ? `${local.charAt(0)}***` : `${local.slice(0, 2)}***`;
  const safeHost = host ? `${host.charAt(0)}***` : "***";
  return `${safeLocal}@${safeHost}${rest.length ? "." + rest.join(".") : ""}`;
}

function sanitizeLogText(raw: unknown, maxLength = 180): string {
  let text = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "sin detalle";
  text = text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, (match) => redactEmailForLog(match))
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[jwt]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[database-url]")
    .replace(/https?:\/\/\S+/gi, "[url]");
  if (text.length > maxLength) return `${text.slice(0, maxLength - 1)}…`;
  return text;
}

function maskPortalEmail(raw: unknown): string {
  return redactEmailForLog(raw == null ? "" : String(raw));
}

function normalizeSystemParameterKey(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

function coerceSystemParameterNumber(rawNumeric: unknown, rawText: unknown): number | null {
  const direct = Number(rawNumeric);
  if (Number.isFinite(direct)) return direct;
  const text = String(rawText ?? "").trim();
  if (!text) return null;
  const sanitized = text.replace(/\s+/g, "").replace(/[^0-9,.-]/g, "");
  if (!sanitized) return null;
  const normalized =
    sanitized.includes(",") && sanitized.includes(".")
      ? sanitized.replace(/\./g, "").replace(",", ".")
      : sanitized.includes(",") && !sanitized.includes(".")
        ? sanitized.replace(",", ".")
        : sanitized.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function laborSystemParameterFieldFromKey(raw: unknown): keyof typeof LABOR_SYSTEM_PARAMETER_DEFS | null {
  const key = normalizeSystemParameterKey(raw);
  if (!key) return null;
  for (const field of Object.keys(LABOR_SYSTEM_PARAMETER_DEFS) as Array<keyof typeof LABOR_SYSTEM_PARAMETER_DEFS>) {
    const aliases = LABOR_SYSTEM_PARAMETER_DEFS[field].aliases;
    if (aliases.some((alias) => normalizeSystemParameterKey(alias) === key)) return field;
  }
  return null;
}

function redactPortalUserDirectoryFields<T extends Record<string, unknown>>(row: T): T {
  return {
    ...row,
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    personType: "",
    documentType: "",
    personalDoc: "",
    companyNit: "",
    taxId: "",
    documentIssuedAt: "",
    birthDate: "",
    gender: "",
    position: "",
    workArea: "",
    phone: "",
    department: "",
    city: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    emergencyRelation: "",
    permissions: [],
    twoFactorEnabled: false
  };
}

/** Bootstrap no-admin: incluir filas `pendiente` aun sin `id_empresa` (altas web en cola). */
const BOOTSTRAP_PENDING_QUEUE_ROLES = new Set(["administracion", "lider_administrativo", "auxiliar_administrativo", "rrhh"]);

/** Formulario vs bootstrap pueden usar distinto nombre de propiedad para el mismo dato. */
function pickPortalField(obj: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (!(k in obj)) continue;
    const v = obj[k];
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    return v;
  }
  return undefined;
}

function pickPortalAuditActorLabel(rec: Record<string, unknown>, mode: "create" | "update" = "update"): string | null {
  const order =
    mode === "create"
      ? ["createdBy", "createdByEmail", "updatedBy", "updatedByEmail", "creadoPor", "creado_por"]
      : ["updatedBy", "updatedByEmail", "createdBy", "createdByEmail", "actualizadoPor", "actualizado_por"];
  for (const key of order) {
    const v = pickPortalField(rec, key);
    if (v != null && String(v).trim()) return String(v).trim().slice(0, 255);
  }
  return null;
}

function portalAuditActorPairFromRecord(
  rec: Record<string, unknown>
): { createdBy: string | null; updatedBy: string | null } {
  const createdBy = pickPortalAuditActorLabel(rec, "create");
  const updatedBy = pickPortalAuditActorLabel(rec, "update");
  return {
    createdBy,
    updatedBy: updatedBy || createdBy
  };
}

/** Solo devuelve `YYYY-MM-DD` válido o null (evita 500 en columnas DATE de PostgreSQL). */
function portalDateYmdOrNull(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  const s = String(v).trim();
  const head = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  const ymd = head ? head[1] : null;
  if (ymd) {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if (!parts) return null;
    const y = Number(parts[1]);
    const mo = Number(parts[2]);
    const day = Number(parts[3]);
    if (mo < 1 || mo > 12 || day < 1 || day > 31) return null;
    const d = new Date(y, mo - 1, day);
    if (d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== day) return null;
    return ymd;
  }
  const t = Date.parse(s);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function portalDateOrNull(v: unknown): string | null {
  return portalDateYmdOrNull(v);
}

function portalUuidOrNull(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return PG_UUID_V4_RE.test(s) ? s : null;
}

/** Suma años a `YYYY-MM-DD` en calendario local (evita corrimientos UTC de toISOString). */
function portalYmdPlusYears(ymd: unknown, years: number): string | null {
  const s = portalDateOrNull(ymd);
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (Number.isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + years);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

@Injectable()
export class PortalService implements OnModuleInit {
  private readonly logger = new Logger(PortalService.name);
  private readonly supabaseAdmin;
  private readonly supabaseEnabled: boolean;
  /** Escaneo una vez por proceso: columnas opcionales en liquidaciones_nomina (migr. 20/21). */
  private payrollLiquSchemaTier: 0 | 1 | 2 | undefined;
  /** Escaneo una vez: condición médica en empleados_nomina (migr. 19). */
  private payrollEmployeeSchemaTier: 0 | 1 | 2 | 3 | undefined;
  /** Columnas origen_liquidacion / novedades_liquidacion_json (migr. 22). */
  private payrollLiquNovedadesCols: boolean | undefined;
  /**
   * Throttle del job de avisos de contrato a término fijo: hace un escaneo completo de
   * empleados_nomina y NO debe correr en cada bootstrap (el bootstrap se llama muy seguido,
   * p. ej. por el polling de notificaciones). Marca de tiempo del último arranque por proceso.
   */
  private lastFixedTermRenewalRunMs = 0;
  /** Evita lanzar el job en paralelo si ya hay uno en vuelo. */
  private fixedTermRenewalInFlight = false;

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly r2: R2Service
  ) {
    const url = normalizeSupabaseProjectUrl(this.config.get<string>("SUPABASE_URL"));
    const key = (this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();
    this.supabaseEnabled = Boolean(url && key);
    this.supabaseAdmin = this.supabaseEnabled ? createClient(url, key) : null;
  }

  /** Resuelve la URL pública del portal con la misma lógica que `auth.service.ts`. */
  private resolvePortalPublicUrl(): string {
    const raw = String(
      this.config.get<string>("PORTAL_PUBLIC_URL") ??
        this.config.get<string>("PUBLIC_PORTAL_URL") ??
        "https://www.transportesantares.co"
    ).trim();
    if (!raw) return "https://www.transportesantares.co";
    return /^https?:\/\//i.test(raw) ? raw.replace(/\/+$/, "") : `https://${raw.replace(/\/+$/, "")}`;
  }

  private async resolvePortalActor(actorUserId: string): Promise<{ name: string; email: string }> {
    const r = await this.pool.query<{ nombre_completo: string | null; correo_electronico: string | null }>(
      `SELECT nombre_completo, correo_electronico FROM usuarios WHERE id = $1::uuid`,
      [actorUserId]
    );
    const row = r.rows[0];
    return {
      name: String(row?.nombre_completo || "").trim() || "Administrador",
      email: String(row?.correo_electronico || "").trim().toLowerCase()
    };
  }

  private async portalAuditActor(userId: string): Promise<PortalAuditActor> {
    const profile = await this.resolvePortalActor(userId);
    return {
      userId,
      email: profile.email,
      label: profile.name || profile.email || "Usuario"
    };
  }

  private async writeAdminDeleteAudit(
    actorUserId: string,
    moduleId: string,
    moduleLabel: string,
    entityId: string,
    entityLabel: string,
    summary?: string
  ): Promise<void> {
    const c = await this.pool.connect();
    try {
      await recordPortalAdminDeleteAudit(
        c,
        await this.portalAuditActor(actorUserId),
        moduleId,
        moduleLabel,
        entityId,
        entityLabel,
        summary
      );
    } finally {
      c.release();
    }
  }

  private async writePortalAuditEvent(
    actorUserId: string,
    event: {
      action: "create" | "update" | "delete";
      moduleId: string;
      moduleLabel: string;
      entityId?: string;
      entityLabel?: string;
      summary?: string;
    }
  ): Promise<void> {
    const c = await this.pool.connect();
    try {
      await insertPortalAuditEventTx(c, await this.portalAuditActor(actorUserId), event);
    } finally {
      c.release();
    }
  }

  private buildAccountActionAudit(actor: { name: string; email: string }, reason?: string) {
    const trimmedReason = String(reason || "").trim();
    return {
      actorName: actor.name,
      ...(actor.email ? { actorEmail: actor.email } : {}),
      actionAtColombia: formatColombiaDateTimeDisplay(new Date()),
      ...(trimmedReason ? { reason: trimmedReason } : {})
    };
  }

  private async recordOutgoingEmailLog(params: {
    to: string;
    subject: string;
    body: string;
    sent: boolean;
    error?: string | null;
  }): Promise<void> {
    const to = String(params.to || "").trim();
    const subject = String(params.subject || "").trim();
    const body = String(params.body || "").trim();
    if (!to || !subject || !body) return;
    try {
      await this.pool.query(
        `INSERT INTO correos_salida (direccion_destino, asunto, cuerpo, fecha_envio_real, error_envio)
         VALUES ($1, $2, $3, CASE WHEN $4::boolean THEN now() ELSE NULL END, $5)`,
        [to, subject, body, params.sent, params.sent ? null : sanitizeLogText(params.error)]
      );
    } catch (err: any) {
      if (String(err?.code || "") === "42P01") return;
      const detail = err instanceof Error ? err.message : String(err);
      this.logger.warn(`recordOutgoingEmailLog fallo no fatal: ${sanitizeLogText(detail)}`);
    }
  }

  /**
   * Notifica por correo al usuario que su cuenta fue aprobada. No debe romper la respuesta del endpoint
   * (admin ya recibió 200 antes), por eso se invoca con `void` y los errores quedan en logs.
   */
  private async sendAccountApprovedEmail(userId: string): Promise<void> {
    try {
      const r = await this.pool.query<{ correo_electronico: string; nombre_completo: string | null }>(
        `SELECT correo_electronico, nombre_completo FROM usuarios WHERE id = $1::uuid`,
        [userId]
      );
      const row = r.rows[0];
      if (!row?.correo_electronico) return;
      const email = String(row.correo_electronico).trim();
      const name = String(row.nombre_completo || "").trim() || "Usuario";
      const portalUrl = this.resolvePortalPublicUrl();
      const subject = "Cuenta aprobada - Antares Portal";
      const bodySummary = `Cuenta aprobada para ${name}. Se intento notificar el acceso al portal.`;
      let sent = false;
      let deliveryError: string | null = null;

      if (this.mail.hasResend()) {
        try {
          await this.mail.sendPortalRegistrationWelcome({
            to: email,
            recipientName: name,
            portalUrl,
            accountApproved: true
          });
          sent = true;
        } catch (err) {
          deliveryError = err instanceof Error ? err.message : String(err);
        }
      }

      // Sin Resend o si falló, aún podemos disparar un correo de Supabase que sirve como activación.
      if (!sent && this.supabaseAdmin) {
        const { error } = await this.supabaseAdmin.auth.resetPasswordForEmail(email, {
          redirectTo: portalUrl
        });
        if (error) {
          deliveryError = error.message;
          this.logger.warn(
            `approve-pending-user: resetPasswordForEmail (${redactEmailForLog(email)}): ${sanitizeLogText(error.message)}`
          );
        } else {
          sent = true;
        }
      } else if (!sent) {
        deliveryError = deliveryError || "Ni Resend ni Supabase configurados";
        this.logger.warn(
          `approve-pending-user: ni Resend ni Supabase configurados. No se notifica al usuario ${redactEmailForLog(email)}.`
        );
      }
      await this.recordOutgoingEmailLog({
        to: email,
        subject,
        body: bodySummary,
        sent,
        error: deliveryError
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      this.logger.warn(`sendAccountApprovedEmail (${userId}) fallo no fatal: ${sanitizeLogText(detail)}`);
    }
  }

  /**
   * Auto-migraciones idempotentes que se ejecutan al iniciar Nest. Permite que un deploy
   * sobre una BD con esquema viejo (Render/Supabase) se autocure sin acción manual. Cubre
   * todas las migraciones SQL del repo que solo agregan columnas/índices/tablas faltantes
   * (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, etc.). Si la tabla base ni
   * existe (BD totalmente nueva sin `03_*.sql`/`04_*.sql`), el bloque se salta limpiamente.
   *
   * Por qué importa para el perfil del usuario: si falta `usuarios.primer_nombre` u otras
   * columnas del registro, el INSERT cae al modo minimal y `nombre_completo`/firstName/etc.
   * quedan vacíos en BD; o si falla `tarifas_trayecto.ids_empresas`, el bootstrap entero
   * devuelve 500 y el frontend cae al stub JWT (solo email/rol). En ambos casos el perfil
   * aparece vacío. Aplicar estas migraciones aquí elimina ambas raíces a la vez.
   */
  async onModuleInit() {
    await this.ensureTarifasTrayectoSchema();
    await this.ensureUsuariosSchema();
    await this.ensureEmpresasSchema();
    await this.ensureSystemParametersSchema();
    await this.ensureProspectosContactoB2bSchema();
    await this.ensureSolicitudesTransporteSchema();
    await this.ensureViajesTransporteSchema();
    await this.ensurePreferenciasNotificacionSchema();
    await this.ensureNotificacionesSchema();
    await this.ensureEmpleadosNominaSchema();
    await this.ensureContratosSchema();
    await this.ensureLiquidacionesNominaSchema();
    await this.ensureAusenciasLaboralesSchema();
    await this.ensureAuditoriaTransporteSchema();
    await this.ensurePortalAuditEventsSchema();
    await this.ensurePortalEntityAuditSchema();
    await this.ensureRegistrosFlotaSchema();
    await this.pruneTransportDeletionAudits().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`pruneTransportDeletionAudits startup: ${sanitizeLogText(msg)}`);
    });
    await this.backfillConductoresFromPayrollEmployees().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`backfillConductoresFromPayrollEmployees: ${sanitizeLogText(msg)}`);
    });
  }

  private async ensureSystemParametersSchema() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS parametros_sistema (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clave VARCHAR(64) NOT NULL,
          valor_numerico NUMERIC(18,4),
          valor_texto TEXT,
          vigente_desde DATE NOT NULL DEFAULT CURRENT_DATE,
          vigente_hasta DATE,
          descripcion TEXT
        )
      `);
      await this.pool.query(`ALTER TABLE parametros_sistema ADD COLUMN IF NOT EXISTS id UUID`);
      await this.pool.query(`UPDATE parametros_sistema SET id = gen_random_uuid() WHERE id IS NULL`);
      await this.pool.query(`ALTER TABLE parametros_sistema ALTER COLUMN id SET DEFAULT gen_random_uuid()`);
      await this.pool.query(`ALTER TABLE parametros_sistema ALTER COLUMN id SET NOT NULL`);
      await this.pool.query(`
        DO $$
        DECLARE
          pk_name text;
          pk_cols text[];
        BEGIN
          SELECT c.conname, array_agg(a.attname ORDER BY u.ord)
            INTO pk_name, pk_cols
          FROM pg_constraint c
          JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS u(attnum, ord) ON true
          JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = u.attnum
          WHERE c.conrelid = 'parametros_sistema'::regclass
            AND c.contype = 'p'
          GROUP BY c.conname;
          IF pk_name IS NOT NULL AND (array_length(pk_cols, 1) <> 1 OR pk_cols[1] <> 'id') THEN
            EXECUTE format('ALTER TABLE parametros_sistema DROP CONSTRAINT %I', pk_name);
          END IF;
        END
        $$;
      `);
      await this.pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conrelid = 'parametros_sistema'::regclass
              AND contype = 'p'
          ) THEN
            ALTER TABLE parametros_sistema ADD CONSTRAINT parametros_sistema_pkey PRIMARY KEY (id);
          END IF;
        END
        $$;
      `);
      await this.pool.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS uq_parametros_sistema_clave_vigencia
           ON parametros_sistema ((lower(trim(clave))), vigente_desde)`
      );
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_parametros_sistema_lookup_vigencia
           ON parametros_sistema ((lower(trim(clave))), vigente_desde DESC, vigente_hasta DESC NULLS LAST)`
      );
      await this.pool.query(
        `ALTER TABLE parametros_sistema
           DROP CONSTRAINT IF EXISTS chk_parametros_sistema_vigencia`
      );
      await this.pool.query(
        `ALTER TABLE parametros_sistema
           ADD CONSTRAINT chk_parametros_sistema_vigencia
           CHECK (vigente_hasta IS NULL OR vigente_hasta >= vigente_desde)`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureSystemParametersSchema fallo no fatal: ${sanitizeLogText(msg)}`);
    }
  }

  /** Sincroniza `tarifas_trayecto` con migración `09_tarifas_trayecto_clientes.sql`. */
  private async ensureTarifasTrayectoSchema() {
    if (!(await this.tableExists("tarifas_trayecto"))) return;
    try {
      await this.pool.query(
        `ALTER TABLE tarifas_trayecto DROP CONSTRAINT IF EXISTS uq_tarifas_trayecto_ruta`
      );
      await this.pool.query(
        `ALTER TABLE tarifas_trayecto ADD COLUMN IF NOT EXISTS ids_empresas UUID[]`
      );
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_tarifas_trayecto_ruta
           ON tarifas_trayecto (departamento_origen, ciudad_origen, departamento_destino, ciudad_destino)`
      );
      this.logger.log("tarifas_trayecto: esquema verificado (ids_empresas presente).");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureTarifasTrayectoSchema fallo no fatal: ${sanitizeLogText(msg)}`);
    }
  }

  /** Sincroniza `usuarios` con migraciones `11_*`, `12_*`, `13_*`, `15_*`, `16_*`. */
  private async ensureUsuariosSchema() {
    if (!(await this.tableExists("usuarios"))) return;
    try {
      await this.pool.query(`
        DO $migrateTipo$
        BEGIN
          CREATE TYPE public.tipo_vinculo_registro AS ENUM ('cliente', 'empleado_interno');
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $migrateTipo$
      `);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureUsuariosSchema: crear tipo tipo_vinculo_registro fallo (no fatal): ${sanitizeLogText(msg)}`);
    }
    try {
      await this.pool.query(`
        DO $migrateRolLogistica$
        BEGIN
          ALTER TYPE public.rol_usuario ADD VALUE 'logistica';
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $migrateRolLogistica$
      `);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureUsuariosSchema: valor logistica en rol_usuario (no fatal): ${sanitizeLogText(msg)}`);
    }
    /**
     * Cada ALTER va en su propio query: si uno falla por permisos/constraint colateral,
     * los demás continúan (no encadenamos en una transacción para no bloquear todo).
     */
    const alters: string[] = [
      // 11_alter_usuarios_campos_registro.sql
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(120)`,
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(120)`,
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(120)`,
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(120)`,
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS genero VARCHAR(40)`,
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cargo_registro VARCHAR(255)`,
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS area_trabajo VARCHAR(120)`,
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS fecha_aceptacion_terminos TIMESTAMPTZ`,
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS checklist_registro_json JSONB NOT NULL DEFAULT '{}'`,
      // 12_usuarios_refresh_token_api.sql
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT`,
      // 13_usuarios_nit_empresa.sql
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS nit_empresa_registro VARCHAR(32)`,
      // 15_usuario_aprobacion_admin.sql
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS fecha_aprobacion_cuenta TIMESTAMPTZ`,
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cuenta_aprobada_por UUID REFERENCES public.usuarios (id) ON DELETE SET NULL`,
      // 16_usuarios_tipo_vinculo_registro.sql
      `ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS tipo_vinculo_registro public.tipo_vinculo_registro NOT NULL DEFAULT 'cliente'`
    ];
    let applied = 0;
    for (const q of alters) {
      try {
        await this.pool.query(q);
        applied += 1;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`ensureUsuariosSchema: fallo no fatal aplicando ajuste idempotente: ${sanitizeLogText(msg)}`);
      }
    }
    try {
      await this.pool.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_documento_personal
           ON public.usuarios (lower(trim(numero_identificacion)))
           WHERE numero_identificacion IS NOT NULL AND btrim(numero_identificacion) <> ''`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureUsuariosSchema: índice documento_personal no creado: ${sanitizeLogText(msg)}`);
    }
    this.logger.log(`usuarios: esquema verificado (${applied}/${alters.length} ALTERs idempotentes OK).`);
  }

  /** Enum + columna `tipo_relacion_empresa` en `empresas` (17_empresas_tipo_relacion.sql). */
  private async ensureEmpresasSchema() {
    if (!(await this.tableExists("empresas"))) return;
    try {
      await this.pool.query(`
        DO $mEmp$
        BEGIN
          CREATE TYPE public.tipo_relacion_empresa AS ENUM ('cliente', 'tercero', 'propia');
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $mEmp$
      `);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureEmpresasSchema: crear tipo tipo_relacion_empresa fallo (no fatal): ${sanitizeLogText(msg)}`);
    }
    try {
      await this.pool.query(
        `ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS tipo_relacion_empresa public.tipo_relacion_empresa NOT NULL DEFAULT 'cliente'`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureEmpresasSchema: ADD COLUMN tipo_relacion_empresa fallo (no fatal): ${sanitizeLogText(msg)}`);
    }
    try {
      await this.pool.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS uq_empresas_una_sola_propia ON public.empresas ((true)) WHERE tipo_relacion_empresa = 'propia'::public.tipo_relacion_empresa`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureEmpresasSchema: índice único empresa propia no creado: ${sanitizeLogText(msg)}`);
    }
    try {
      await this.pool.query(
        `ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureEmpresasSchema: ADD COLUMN activo fallo (no fatal): ${sanitizeLogText(msg)}`);
    }
    try {
      await this.pool.query(`ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS url_logo TEXT`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureEmpresasSchema: ADD COLUMN url_logo fallo (no fatal): ${sanitizeLogText(msg)}`);
    }
    const empresasContactAlters = [
      `ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS correo_empresarial VARCHAR(120)`,
      `ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS nombre_contacto VARCHAR(255)`,
      `ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS departamento VARCHAR(120)`,
      `ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ciudad VARCHAR(120)`,
      `ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS direccion_operativa TEXT`
    ];
    for (const sql of empresasContactAlters) {
      try {
        await this.pool.query(sql);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`ensureEmpresasSchema: ajuste idempotente fallo (no fatal): ${sanitizeLogText(msg)}`);
      }
    }
    this.logger.log("empresas: esquema tipo_relacion_empresa, activo, url_logo y contacto verificado.");
  }

  /** Columna `refrigeracion_termoking` en solicitudes (migr. `26_solicitudes_refrigeracion_termoking.sql`). */
  /**
   * `viajes_transporte.id_conductor`: el esquema original era NOT NULL + ON DELETE RESTRICT,
   * por lo que un viaje cancelado/cerrado bloqueaba para siempre la eliminación del conductor
   * (y del empleado vinculado). El historial conserva los datos snapshot del viaje
   * (nombre_conductor, telefono_conductor, placa_vehiculo), así que el vínculo puede soltarse:
   * columna nullable + FK ON DELETE SET NULL. Los viajes ACTIVOS se bloquean por código en
   * adminDeletePayrollEmployee, no por la FK.
   */
  private async ensureViajesTransporteSchema() {
    if (!(await this.tableExists("viajes_transporte"))) return;
    try {
      await this.pool.query(`ALTER TABLE viajes_transporte ALTER COLUMN id_conductor DROP NOT NULL`);
      await this.pool.query(`
        DO $$
        DECLARE
          fk_name text;
          fk_del char;
        BEGIN
          SELECT c.conname, c.confdeltype
            INTO fk_name, fk_del
          FROM pg_constraint c
          JOIN pg_attribute a
            ON a.attrelid = c.conrelid
           AND a.attnum = ANY (c.conkey)
          WHERE c.conrelid = 'viajes_transporte'::regclass
            AND c.contype = 'f'
            AND c.confrelid = 'conductores'::regclass
            AND a.attname = 'id_conductor'
          LIMIT 1;
          IF fk_name IS NOT NULL AND fk_del IS DISTINCT FROM 'n' THEN
            EXECUTE format('ALTER TABLE viajes_transporte DROP CONSTRAINT %I', fk_name);
            fk_name := NULL;
          END IF;
          IF fk_name IS NULL THEN
            ALTER TABLE viajes_transporte
              ADD CONSTRAINT viajes_transporte_id_conductor_fkey
              FOREIGN KEY (id_conductor) REFERENCES conductores (id) ON DELETE SET NULL;
          END IF;
        END
        $$;
      `);
      this.logger.log("viajes_transporte: id_conductor nullable + ON DELETE SET NULL verificado.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureViajesTransporteSchema fallo no fatal: ${sanitizeLogText(msg)}`);
    }
  }

  private async ensureSolicitudesTransporteSchema() {
    if (!(await this.tableExists("solicitudes_transporte"))) return;
    try {
      await this.pool.query(
        `ALTER TABLE solicitudes_transporte
           ADD COLUMN IF NOT EXISTS refrigeracion_termoking BOOLEAN NOT NULL DEFAULT false`
      );
      await this.pool.query(
        `ALTER TABLE solicitudes_transporte
           ADD COLUMN IF NOT EXISTS numero_fuelles INTEGER`
      );
      await this.pool.query(
        `ALTER TABLE solicitudes_transporte
           ADD COLUMN IF NOT EXISTS tipo_servicio VARCHAR(80) NOT NULL DEFAULT 'Transporte nacional'`
      );
      await this.pool.query(`
        UPDATE solicitudes_transporte
        SET refrigeracion_termoking = CASE
          WHEN lower(btrim(coalesce(tipo_servicio, ''))) = 'refrigerated' THEN true
          WHEN lower(btrim(coalesce(tipo_servicio, ''))) = 'dry' THEN false
          WHEN lower(tipo_servicio) LIKE '%sin termoking%' THEN false
          WHEN lower(tipo_servicio) LIKE '%con termoking%' THEN true
          WHEN lower(tipo_servicio) LIKE '%termoking%'
               AND lower(tipo_servicio) NOT LIKE '%sin termoking%' THEN true
          WHEN lower(tipo_servicio) LIKE '%thermo king%' THEN true
          WHEN lower(tipo_servicio) LIKE '%refrigerada%' OR lower(tipo_servicio) LIKE '%refrigerado%' THEN true
          ELSE refrigeracion_termoking
        END
      `);
      await this.pool.query(`
        UPDATE solicitudes_transporte
        SET tipo_servicio = 'Transporte nacional'
        WHERE tipo_servicio IN (
          'Transporte nacional con termoking',
          'Transporte nacional sin termoking',
          'refrigerated',
          'dry'
        )
      `);
      await this.pool.query(`
        UPDATE solicitudes_transporte
        SET tipo_servicio = 'Transporte entre sedes del cliente'
        WHERE lower(tipo_servicio) LIKE '%entre sedes%'
           OR lower(tipo_servicio) LIKE '%sedes del cliente%'
      `);
      this.logger.log(
        "solicitudes_transporte: columnas refrigeracion_termoking, numero_fuelles y tipo_servicio verificadas."
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureSolicitudesTransporteSchema fallo no fatal: ${sanitizeLogText(msg)}`);
    }
  }

  /** Sincroniza `prospectos_contacto_b2b` con migración `14_contacto_web_b2b.sql`. */
  private async ensureProspectosContactoB2bSchema() {
    try {
      await this.pool.query(
        `CREATE TABLE IF NOT EXISTS prospectos_contacto_b2b (
          id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre_contacto             VARCHAR(255) NOT NULL,
          nombre_empresa              VARCHAR(255) NOT NULL,
          nit                         VARCHAR(32) NOT NULL,
          cargo_contacto              VARCHAR(255) NOT NULL,
          telefono                    VARCHAR(32) NOT NULL,
          correo_electronico          VARCHAR(320) NOT NULL,
          tipo_servicio               VARCHAR(120) NOT NULL,
          tipo_operacion              VARCHAR(80) NOT NULL,
          frecuencia_operacion        VARCHAR(64) NOT NULL,
          ventana_inicio_servicio     VARCHAR(80) NOT NULL,
          mensaje                     TEXT NOT NULL,
          fecha_creacion              TIMESTAMPTZ NOT NULL DEFAULT now()
        )`
      );
      await this.pool.query(
        `ALTER TABLE prospectos_contacto_b2b DROP COLUMN IF EXISTS volumen_mensual_aprox_kg`
      );
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_prospectos_contacto_b2b_fecha_creacion_desc
           ON prospectos_contacto_b2b (fecha_creacion DESC)`
      );
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_prospectos_contacto_b2b_correo
           ON prospectos_contacto_b2b (correo_electronico)`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureProspectosContactoB2bSchema fallo no fatal: ${sanitizeLogText(msg)}`);
    }
  }

  /** Tabla preferencias (28/29) + columna sonido. */
  private async ensurePreferenciasNotificacionSchema() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS public.preferencias_notificacion_usuario (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          id_usuario UUID NOT NULL UNIQUE REFERENCES public.usuarios (id) ON DELETE CASCADE,
          notificaciones_habilitadas BOOLEAN NOT NULL DEFAULT true,
          sonido_notificaciones_habilitadas BOOLEAN NOT NULL DEFAULT true,
          fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
          fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await this.pool.query(
        `ALTER TABLE public.preferencias_notificacion_usuario
           ADD COLUMN IF NOT EXISTS sonido_notificaciones_habilitadas BOOLEAN NOT NULL DEFAULT true`
      );
      this.logger.log("preferencias_notificacion_usuario: esquema verificado.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensurePreferenciasNotificacionSchema fallo no fatal: ${sanitizeLogText(msg)}`);
    }
  }

  /** Columna `audiencia` en notificaciones (31_notificaciones_audiencia.sql). */
  private async ensureNotificacionesSchema() {
    if (!(await this.tableExists("notificaciones"))) return;
    try {
      await this.pool.query(`ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS audiencia VARCHAR(32)`);
      await this.pool.query(`ALTER TABLE notificaciones ALTER COLUMN id_usuario DROP NOT NULL`);
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_notificaciones_audiencia_fecha
           ON notificaciones (audiencia, fecha_creacion DESC)
           WHERE audiencia IS NOT NULL`
      );
      await this.pool.query(`ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS categoria VARCHAR(32)`);
      await this.pool.query(`ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS deep_link VARCHAR(255)`);
      await this.pool.query(`ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS tipo_entidad VARCHAR(32)`);
      await this.pool.query(`ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS id_entidad VARCHAR(64)`);
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_notificaciones_categoria_fecha
           ON notificaciones (categoria, fecha_creacion DESC)
           WHERE categoria IS NOT NULL`
      );
      await this.pruneDuplicateNotifications();
      this.logger.log("notificaciones: esquema (audiencia + metadatos) verificado.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureNotificacionesSchema fallo no fatal: ${sanitizeLogText(msg)}`);
    }
  }

  /** Elimina filas repetidas (mismo título/cuerpo/destino) y unifica avisos legacy «uno por admin». */
  private async pruneDuplicateNotifications(): Promise<void> {
    await this.pool.query(`
      DELETE FROM notificaciones
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
                 ROW_NUMBER() OVER (
                   PARTITION BY titulo, cuerpo,
                     COALESCE(audiencia, ''),
                     COALESCE(id_usuario::text, '')
                   ORDER BY fecha_creacion ASC, id ASC
                 ) AS rn
          FROM notificaciones
        ) ranked
        WHERE rn > 1
      )
    `);
    await this.pool.query(`
      WITH legacy_admin_blast AS (
        SELECT titulo, cuerpo,
               MIN(id) AS keep_id,
               COUNT(*) AS cnt
        FROM notificaciones
        WHERE audiencia IS NULL
          AND id_usuario IS NOT NULL
        GROUP BY titulo, cuerpo
        HAVING COUNT(*) > 1
           AND COUNT(DISTINCT id_usuario) > 1
           AND MAX(fecha_creacion) - MIN(fecha_creacion) < interval '5 minutes'
      )
      UPDATE notificaciones n
      SET audiencia = 'admins', id_usuario = NULL
      FROM legacy_admin_blast b
      WHERE n.id = b.keep_id
    `);
    await this.pool.query(`
      WITH legacy_admin_blast AS (
        SELECT titulo, cuerpo
        FROM notificaciones
        WHERE audiencia IS NULL
          AND id_usuario IS NOT NULL
        GROUP BY titulo, cuerpo
        HAVING COUNT(*) > 1
           AND COUNT(DISTINCT id_usuario) > 1
           AND MAX(fecha_creacion) - MIN(fecha_creacion) < interval '5 minutes'
      )
      DELETE FROM notificaciones n
      USING legacy_admin_blast b
      WHERE n.titulo = b.titulo
        AND n.cuerpo = b.cuerpo
        AND n.audiencia IS NULL
        AND n.id_usuario IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM notificaciones k
          WHERE k.id = n.id AND k.audiencia = 'admins' AND k.id_usuario IS NULL
        )
    `);
  }

  private async insertNotificationIfNotDuplicate(params: {
    userId: string | null;
    title: string;
    body: string;
    audience: string | null;
    windowSeconds?: number;
    category?: string | null;
    deepLink?: string | null;
    entityType?: string | null;
    entityId?: string | null;
  }): Promise<boolean> {
    const title = String(params.title || "").trim();
    const body = String(params.body || "").trim();
    if (!title || !body) return false;
    const audience = params.audience ? String(params.audience).trim() : null;
    const userId = params.userId ? String(params.userId).trim() : null;
    const windowSeconds = Math.max(30, Math.min(600, Math.floor(params.windowSeconds ?? 120)));
    const recent = await this.pool.query<{ ok: number }>(
      `SELECT 1 AS ok FROM notificaciones
       WHERE titulo = $1
         AND cuerpo = $2
         AND COALESCE(audiencia, '') = COALESCE($3::varchar, '')
         AND (
           ($4::uuid IS NULL AND id_usuario IS NULL)
           OR id_usuario = $4::uuid
         )
         AND fecha_creacion > now() - ($5::text || ' seconds')::interval
       LIMIT 1`,
      [title, body, audience, userId, String(windowSeconds)]
    );
    if ((recent.rowCount ?? 0) > 0) return false;
    await this.pool.query(
      `INSERT INTO notificaciones (id_usuario, titulo, cuerpo, audiencia, categoria, deep_link, tipo_entidad, id_entidad)
       VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        title,
        body,
        audience,
        params.category ? String(params.category).trim() : null,
        params.deepLink ? String(params.deepLink).trim() : null,
        params.entityType ? String(params.entityType).trim() : null,
        params.entityId ? String(params.entityId).trim() : null
      ]
    );
    return true;
  }

  /** Columnas de renovación en contratos (14_contratos.sql). */
  private async ensureContratosSchema() {
    if (!(await this.tableExists("contratos"))) return;
    const alters = [
      `ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS fecha_fin DATE`,
      `ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS fecha_renovacion DATE`
    ];
    for (const q of alters) {
      try {
        await this.pool.query(q);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`ensureContratosSchema: ${sanitizeLogText(msg)}`);
      }
    }
  }

  /** Condición médica empleados (19_empleados_condicion_medica.sql). */
  private async ensureEmpleadosNominaSchema() {
    if (!(await this.tableExists("empleados_nomina"))) return;
    const alters = [
      `ALTER TABLE public.empleados_nomina ADD COLUMN IF NOT EXISTS tiene_condicion_medica BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE public.empleados_nomina ADD COLUMN IF NOT EXISTS descripcion_condicion_medica TEXT`,
      `ALTER TABLE public.empleados_nomina ADD COLUMN IF NOT EXISTS fecha_renovacion DATE`,
      `ALTER TABLE public.empleados_nomina ADD COLUMN IF NOT EXISTS fecha_aviso_no_renovacion DATE`
    ];
    for (const q of alters) {
      try {
        await this.pool.query(q);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`ensureEmpleadosNominaSchema: ${sanitizeLogText(msg)}`);
      }
    }
    try {
      await this.pool.query(
        `ALTER TABLE public.empleados_nomina DROP CONSTRAINT IF EXISTS chk_empleados_condicion_medica`
      );
      await this.pool.query(`
        ALTER TABLE public.empleados_nomina
          ADD CONSTRAINT chk_empleados_condicion_medica CHECK (
            tiene_condicion_medica = true
            OR descripcion_condicion_medica IS NULL
            OR length(btrim(descripcion_condicion_medica)) = 0
          )
      `);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureEmpleadosNominaSchema constraint: ${sanitizeLogText(msg)}`);
    }
  }

  /** Liquidaciones: prima, cesantías, origen, período extendido (20–23). */
  private async ensureLiquidacionesNominaSchema() {
    if (!(await this.tableExists("liquidaciones_nomina"))) return;
    const alters = [
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS tipo_registro VARCHAR(24) NOT NULL DEFAULT 'mensual'`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS incluye_prima_servicios BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS prima_servicios_cop NUMERIC(18,2) NOT NULL DEFAULT 0`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS prima_dias_semestre INTEGER`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS liquidacion_terminacion_json JSONB`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS incluye_intereses_cesantias BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS intereses_cesantias_cop NUMERIC(18,2) NOT NULL DEFAULT 0`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS base_cesantias_interes_cop NUMERIC(18,2)`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS dias_interes_cesantias INTEGER`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS origen_liquidacion VARCHAR(32) NOT NULL DEFAULT 'manual'`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS novedades_liquidacion_json JSONB`,
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS creado_por VARCHAR(255)`
    ];
    let ok = 0;
    for (const q of alters) {
      try {
        await this.pool.query(q);
        ok += 1;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`ensureLiquidacionesNominaSchema: ${sanitizeLogText(msg)}`);
      }
    }
    try {
      await this.pool.query(
        `ALTER TABLE public.liquidaciones_nomina ALTER COLUMN periodo_mes TYPE VARCHAR(32)`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureLiquidacionesNominaSchema periodo_mes: ${sanitizeLogText(msg)}`);
    }
    this.logger.log(`liquidaciones_nomina: ${ok}/${alters.length} columnas verificadas.`);
  }

  /** Trazabilidad: quién creó/actualizó entidades de catálogo (vehículos, conductores, empresas). */
  private async ensurePortalEntityAuditSchema() {
    const tables = ["vehiculos", "conductores", "empresas"];
    let ok = 0;
    for (const table of tables) {
      if (!(await this.tableExists(table))) continue;
      for (const col of ["creado_por", "actualizado_por"]) {
        try {
          await this.pool.query(
            `ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS ${col} VARCHAR(255)`
          );
          ok += 1;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          this.logger.warn(`ensurePortalEntityAuditSchema ${table}.${col}: ${sanitizeLogText(msg)}`);
        }
      }
    }
    if (ok > 0) this.logger.log(`portal entity audit: ${ok} columnas verificadas.`);
  }

  /** Auditoría eliminaciones viajes/solicitudes (25). */
  private async ensureAuditoriaTransporteSchema() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS auditoria_viajes_eliminados (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          id_solicitud UUID NOT NULL,
          id_viaje UUID,
          numero_solicitud VARCHAR(32),
          numero_viaje VARCHAR(32),
          motivo TEXT NOT NULL,
          datos_json JSONB NOT NULL DEFAULT '{}'::jsonb,
          eliminado_por UUID REFERENCES usuarios (id) ON DELETE SET NULL,
          eliminado_en TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS auditoria_solicitudes_eliminadas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          id_solicitud UUID NOT NULL,
          numero_solicitud VARCHAR(32),
          motivo TEXT NOT NULL,
          datos_json JSONB NOT NULL DEFAULT '{}'::jsonb,
          eliminado_por UUID REFERENCES usuarios (id) ON DELETE SET NULL,
          eliminado_en TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_aud_viajes_elim_en ON auditoria_viajes_eliminados (eliminado_en DESC)`
      );
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_aud_sol_elim_en ON auditoria_solicitudes_eliminadas (eliminado_en DESC)`
      );
      this.logger.log("auditoria transporte: tablas verificadas.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureAuditoriaTransporteSchema fallo no fatal: ${sanitizeLogText(msg)}`);
    }
  }

  /** Bitácora append-only del portal (Historial · trazabilidad a largo plazo). */
  private async ensurePortalAuditEventsSchema() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS auditoria_eventos_portal (
          id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          id_evento_cliente   UUID,
          accion              VARCHAR(32) NOT NULL,
          modulo_id           VARCHAR(64) NOT NULL,
          modulo_etiqueta     VARCHAR(120) NOT NULL,
          entidad_id          VARCHAR(64),
          entidad_etiqueta    TEXT,
          resumen             TEXT,
          id_usuario          UUID REFERENCES usuarios (id) ON DELETE SET NULL,
          usuario_email       VARCHAR(255),
          usuario_etiqueta    TEXT,
          detalle_accion      VARCHAR(64),
          detalle_id          VARCHAR(64),
          metadata_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
          registrado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT uq_auditoria_evento_cliente UNIQUE (id_evento_cliente)
        )
      `);
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_aud_portal_registrado_en ON auditoria_eventos_portal (registrado_en DESC)`
      );
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_aud_portal_modulo_en ON auditoria_eventos_portal (modulo_id, registrado_en DESC)`
      );
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_aud_portal_usuario_en ON auditoria_eventos_portal (id_usuario, registrado_en DESC)`
      );
      this.logger.log("auditoria_eventos_portal: tabla verificada.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensurePortalAuditEventsSchema fallo no fatal: ${sanitizeLogText(msg)}`);
    }
  }

  private mapPortalAuditEventRowToClient(row: Record<string, unknown>) {
    const clientId = String(row.clientEventId || row.id || "").trim();
    const at = row.registeredAt ? new Date(row.registeredAt as string).toISOString() : null;
    const actorLabel = String(row.actorLabel || row.actorEmail || "").trim();
    const actorEmail = maskPortalEmail(row.actorEmail);
    const actorUserId = String(row.actorUserId ?? "").trim() || null;
    return {
      id: clientId,
      at,
      action: String(row.action || "update"),
      moduleId: String(row.moduleId || ""),
      moduleLabel: String(row.moduleLabel || ""),
      entityId: String(row.entityId || "").trim() || "",
      entityLabel: String(row.entityLabel || "Registro").trim(),
      summary: String(row.summary || "").trim(),
      actor: actorLabel,
      actorEmail,
      actorUserId,
      usuario: String(row.usuario || actorLabel || actorEmail || "").trim(),
      detailAction: String(row.detailAction || "").trim(),
      detailId: String(row.detailId || "").trim()
    };
  }

  private async loadPortalAuditEvents(limit = PORTAL_AUDIT_EVENTS_BOOTSTRAP_LIMIT) {
    if (!(await this.tableExists("auditoria_eventos_portal"))) return [];
    const cap = Math.min(Math.max(Number(limit) || PORTAL_AUDIT_EVENTS_BOOTSTRAP_LIMIT, 1), PORTAL_AUDIT_EVENTS_QUERY_MAX);
    const r = await this.pool.query(
      `SELECT COALESCE(a.id_evento_cliente, a.id)::text AS "clientEventId",
              a.id::text AS id,
              a.accion AS action,
              a.modulo_id AS "moduleId",
              a.modulo_etiqueta AS "moduleLabel",
              a.entidad_id AS "entityId",
              a.entidad_etiqueta AS "entityLabel",
              a.resumen AS summary,
              a.id_usuario::text AS "actorUserId",
              a.usuario_email AS "actorEmail",
              COALESCE(NULLIF(trim(a.usuario_etiqueta), ''), u.nombre_completo, a.usuario_email) AS "actorLabel",
              COALESCE(NULLIF(trim(a.usuario_etiqueta), ''), u.nombre_completo, a.usuario_email) AS usuario,
              a.detalle_accion AS "detailAction",
              a.detalle_id AS "detailId",
              a.registrado_en AS "registeredAt"
         FROM auditoria_eventos_portal a
         LEFT JOIN usuarios u ON u.id = a.id_usuario
        ORDER BY a.registrado_en DESC
        LIMIT $1`,
      [cap]
    );
    return r.rows.map((row) => this.mapPortalAuditEventRowToClient(row as Record<string, unknown>));
  }

  private canReadPortalAuditEvents(permissionSet: ReadonlySet<string>, admin: boolean) {
    return (
      admin ||
      this.hasPortalPermission(permissionSet, "transport_history") ||
      this.hasPortalPermission(permissionSet, "users_manage")
    );
  }

  async appendPortalAuditEvents(
    actorUserId: string,
    actorEmail: string,
    role: JwtRole,
    events: Array<Record<string, unknown>>
  ) {
    void role;
    if (!(await this.tableExists("auditoria_eventos_portal"))) {
      return { inserted: 0, skipped: Array.isArray(events) ? events.length : 0 };
    }
    const list = Array.isArray(events) ? events : [];
    if (!list.length) return { inserted: 0, skipped: 0 };

    const actorId = String(actorUserId || "").trim();
    if (!PG_UUID_V4_RE.test(actorId)) throw new BadRequestException("Sesión inválida.");

    const profile = await this.pool.query<{ nombre_completo: string | null }>(
      `SELECT nombre_completo FROM usuarios WHERE id = $1::uuid LIMIT 1`,
      [actorId]
    );
    const actorLabel = String(profile.rows[0]?.nombre_completo || actorEmail || "").trim();

    let inserted = 0;
    let skipped = 0;
    for (const raw of list.slice(0, 80)) {
      const row = raw && typeof raw === "object" ? raw : {};
      const action = String(row.action || "update").toLowerCase();
      if (!["create", "update", "delete"].includes(action)) {
        skipped += 1;
        continue;
      }
      const moduleId = String(row.moduleId || "").trim().slice(0, 64);
      const moduleLabel = String(row.moduleLabel || moduleId || "Módulo").trim().slice(0, 120);
      if (!moduleId) {
        skipped += 1;
        continue;
      }
      let clientEventId: string | null = String(row.id || "").trim();
      if (clientEventId && !PG_UUID_V4_RE.test(clientEventId)) clientEventId = null;

      const atRaw = String(row.at || "").trim();
      const registeredAt =
        atRaw && !Number.isNaN(new Date(atRaw).getTime()) ? new Date(atRaw).toISOString() : null;

      const result = await this.pool.query(
        `INSERT INTO auditoria_eventos_portal (
            id_evento_cliente, accion, modulo_id, modulo_etiqueta,
            entidad_id, entidad_etiqueta, resumen,
            id_usuario, usuario_email, usuario_etiqueta,
            detalle_accion, detalle_id, registrado_en
          )
          VALUES (
            $1::uuid, $2, $3, $4,
            $5, $6, $7,
            $8::uuid, $9, $10,
            $11, $12, COALESCE($13::timestamptz, now())
          )
          ON CONFLICT (id_evento_cliente) DO NOTHING
          RETURNING id`,
        [
          clientEventId,
          action,
          moduleId,
          moduleLabel,
          String(row.entityId || "").trim().slice(0, 64) || null,
          String(row.entityLabel || "").trim().slice(0, 500) || null,
          String(row.summary || "").trim().slice(0, 2000) || null,
          actorId,
          String(actorEmail || "").trim().slice(0, 255) || null,
          actorLabel || null,
          String(row.detailAction || "").trim().slice(0, 64) || null,
          String(row.detailId || "").trim().slice(0, 64) || null,
          registeredAt
        ]
      );
      if (result.rowCount) inserted += 1;
      else skipped += 1;
    }
    return { inserted, skipped };
  }

  async listPortalAuditEvents(
    userId: string,
    role: JwtRole,
    opts: { from?: string; to?: string; limit?: number; offset?: number } = {}
  ) {
    const permissionSet = await this.resolveEffectivePermissionSet(userId, role);
    const admin = this.isAdmin(role);
    if (!this.canReadPortalAuditEvents(permissionSet, admin)) throw new ForbiddenException();

    if (!(await this.tableExists("auditoria_eventos_portal"))) {
      return { total: 0, items: [] as Record<string, unknown>[] };
    }

    const limit = Math.min(Math.max(Number(opts.limit) || 2000, 1), PORTAL_AUDIT_EVENTS_QUERY_MAX);
    const offset = Math.max(Number(opts.offset) || 0, 0);
    const from = String(opts.from || "").trim();
    const to = String(opts.to || "").trim();
    const clauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (from) {
      clauses.push(`a.registrado_en >= $${idx++}::timestamptz`);
      params.push(new Date(from).toISOString());
    }
    if (to) {
      clauses.push(`a.registrado_en <= $${idx++}::timestamptz`);
      params.push(new Date(`${to}T23:59:59.999Z`).toISOString());
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const countR = await this.pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM auditoria_eventos_portal a ${where}`,
      params
    );
    const total = Number(countR.rows[0]?.c || 0);

    params.push(limit, offset);
    const r = await this.pool.query(
      `SELECT COALESCE(a.id_evento_cliente, a.id)::text AS "clientEventId",
              a.id::text AS id,
              a.accion AS action,
              a.modulo_id AS "moduleId",
              a.modulo_etiqueta AS "moduleLabel",
              a.entidad_id AS "entityId",
              a.entidad_etiqueta AS "entityLabel",
              a.resumen AS summary,
              a.id_usuario::text AS "actorUserId",
              a.usuario_email AS "actorEmail",
              COALESCE(NULLIF(trim(a.usuario_etiqueta), ''), u.nombre_completo, a.usuario_email) AS "actorLabel",
              COALESCE(NULLIF(trim(a.usuario_etiqueta), ''), u.nombre_completo, a.usuario_email) AS usuario,
              a.detalle_accion AS "detailAction",
              a.detalle_id AS "detailId",
              a.registrado_en AS "registeredAt"
         FROM auditoria_eventos_portal a
         LEFT JOIN usuarios u ON u.id = a.id_usuario
        ${where}
        ORDER BY a.registrado_en DESC
        LIMIT $${idx++} OFFSET $${idx}`,
      params
    );
    return {
      total,
      items: r.rows.map((row) => this.mapPortalAuditEventRowToClient(row as Record<string, unknown>))
    };
  }

  /** Ausencias laborales: subtipos y días reconocidos (40). */
  private async ensureAusenciasLaboralesSchema() {
    if (!(await this.tableExists("ausencias_laborales"))) return;
    const alters = [
      `ALTER TABLE public.ausencias_laborales ADD COLUMN IF NOT EXISTS subtipo_ausencia VARCHAR(64)`,
      `ALTER TABLE public.ausencias_laborales ADD COLUMN IF NOT EXISTS dias_reconocidos NUMERIC(6,2)`,
      `ALTER TABLE public.ausencias_laborales ADD COLUMN IF NOT EXISTS unidad_dias_reconocidos VARCHAR(16)`
    ];
    for (const q of alters) {
      try {
        await this.pool.query(q);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`ensureAusenciasLaboralesSchema: ${sanitizeLogText(msg)}`);
      }
    }
    try {
      await this.pool.query(`
        UPDATE public.ausencias_laborales
        SET subtipo_ausencia = 'votante'
        WHERE tipo_ausencia = 'permiso_sufragio'
          AND (subtipo_ausencia IS NULL OR btrim(subtipo_ausencia) = '')
      `);
      await this.pool.query(`
        UPDATE public.ausencias_laborales
        SET dias_reconocidos = CASE
          WHEN tipo_ausencia = 'permiso_sufragio' AND subtipo_ausencia = 'jurado' THEN 1.00
          WHEN tipo_ausencia = 'permiso_sufragio' THEN 0.50
          ELSE GREATEST(dias_calendario, 1)::numeric
        END
        WHERE dias_reconocidos IS NULL OR dias_reconocidos <= 0
      `);
      await this.pool.query(`
        UPDATE public.ausencias_laborales
        SET unidad_dias_reconocidos = CASE
          WHEN tipo_ausencia = 'permiso_sufragio' THEN 'jornada'
          WHEN tipo_ausencia IN ('vacaciones', 'licencia_luto', 'permiso_cita_medica', 'permiso_citacion_judicial') THEN 'habil'
          ELSE 'calendario'
        END
        WHERE unidad_dias_reconocidos IS NULL OR btrim(unidad_dias_reconocidos) = ''
      `);
      await this.pool.query(`
        UPDATE public.ausencias_laborales
        SET dias_reconocidos = LEAST(GREATEST(COALESCE(dias_reconocidos, dias_calendario)::numeric, 1.00), 5.00),
            unidad_dias_reconocidos = 'habil'
        WHERE tipo_ausencia = 'licencia_luto'
      `);
      await this.pool.query(`
        UPDATE public.ausencias_laborales
        SET dias_reconocidos = LEAST(GREATEST(COALESCE(dias_reconocidos, dias_calendario)::numeric, 1.00), 14.00),
            unidad_dias_reconocidos = 'calendario'
        WHERE tipo_ausencia = 'licencia_paternidad'
      `);
      await this.pool.query(`
        UPDATE public.ausencias_laborales
        SET subtipo_ausencia = 'ordinaria'
        WHERE tipo_ausencia = 'licencia_maternidad'
          AND (subtipo_ausencia IS NULL OR btrim(subtipo_ausencia) = '')
      `);
      await this.pool.query(`
        UPDATE public.ausencias_laborales
        SET subtipo_ausencia = 'continua'
        WHERE tipo_ausencia = 'licencia_paternidad'
          AND (subtipo_ausencia IS NULL OR btrim(subtipo_ausencia) = '')
      `);
      await this.pool.query(`
        UPDATE public.ausencias_laborales
        SET dias_reconocidos = LEAST(GREATEST(COALESCE(dias_reconocidos, dias_calendario)::numeric, 1.00), 182.00),
            unidad_dias_reconocidos = 'calendario'
        WHERE tipo_ausencia = 'licencia_maternidad'
      `);
      await this.pool.query(`
        UPDATE public.ausencias_laborales
        SET dias_reconocidos = CASE
          WHEN subtipo_ausencia = 'parental_compartida' THEN LEAST(GREATEST(COALESCE(dias_reconocidos, dias_calendario)::numeric, 1.00), 7.00)
          ELSE LEAST(GREATEST(COALESCE(dias_reconocidos, dias_calendario)::numeric, 1.00), 14.00)
        END,
            unidad_dias_reconocidos = 'calendario'
        WHERE tipo_ausencia = 'licencia_paternidad'
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ALTER COLUMN dias_reconocidos SET DEFAULT 1.00
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ALTER COLUMN unidad_dias_reconocidos SET DEFAULT 'calendario'
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ALTER COLUMN dias_reconocidos SET NOT NULL
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ALTER COLUMN unidad_dias_reconocidos SET NOT NULL
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        DROP CONSTRAINT IF EXISTS chk_ausencias_dias_reconocidos
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ADD CONSTRAINT chk_ausencias_dias_reconocidos
        CHECK (dias_reconocidos > 0)
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        DROP CONSTRAINT IF EXISTS chk_ausencias_unidad_dias_reconocidos
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ADD CONSTRAINT chk_ausencias_unidad_dias_reconocidos
        CHECK (unidad_dias_reconocidos IN ('calendario', 'habil', 'jornada'))
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        DROP CONSTRAINT IF EXISTS chk_ausencias_sufragio_subtipo
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ADD CONSTRAINT chk_ausencias_sufragio_subtipo
        CHECK (
          tipo_ausencia <> 'permiso_sufragio'
          OR subtipo_ausencia IN ('jurado', 'votante')
        )
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        DROP CONSTRAINT IF EXISTS chk_ausencias_sufragio_reconocimiento
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ADD CONSTRAINT chk_ausencias_sufragio_reconocimiento
        CHECK (
          tipo_ausencia <> 'permiso_sufragio'
          OR (
            unidad_dias_reconocidos = 'jornada'
            AND (
              (subtipo_ausencia = 'jurado' AND dias_reconocidos = 1.00)
              OR (subtipo_ausencia = 'votante' AND dias_reconocidos = 0.50)
            )
          )
        )
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        DROP CONSTRAINT IF EXISTS chk_ausencias_luto_max_5
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ADD CONSTRAINT chk_ausencias_luto_max_5
        CHECK (
          tipo_ausencia <> 'licencia_luto'
          OR (unidad_dias_reconocidos = 'habil' AND dias_reconocidos <= 5.00)
        )
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        DROP CONSTRAINT IF EXISTS chk_ausencias_paternidad_max_14
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ADD CONSTRAINT chk_ausencias_paternidad_max_14
        CHECK (
          tipo_ausencia <> 'licencia_paternidad'
          OR (
            unidad_dias_reconocidos = 'calendario'
            AND dias_reconocidos <= 14.00
            AND (
              subtipo_ausencia IS DISTINCT FROM 'parental_compartida'
              OR dias_reconocidos <= 7.00
            )
          )
        )
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        DROP CONSTRAINT IF EXISTS chk_ausencias_maternidad_subtipo
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ADD CONSTRAINT chk_ausencias_maternidad_subtipo
        CHECK (
          tipo_ausencia <> 'licencia_maternidad'
          OR subtipo_ausencia IN ('ordinaria', 'parto_multiple', 'parto_prematuro', 'adopcion', 'extension_medica')
        )
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        DROP CONSTRAINT IF EXISTS chk_ausencias_paternidad_subtipo
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ADD CONSTRAINT chk_ausencias_paternidad_subtipo
        CHECK (
          tipo_ausencia <> 'licencia_paternidad'
          OR subtipo_ausencia IN ('continua', 'flexible', 'parental_compartida')
        )
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        DROP CONSTRAINT IF EXISTS chk_ausencias_maternidad_max_182
      `);
      await this.pool.query(`
        ALTER TABLE public.ausencias_laborales
        ADD CONSTRAINT chk_ausencias_maternidad_max_182
        CHECK (
          tipo_ausencia <> 'licencia_maternidad'
          OR (unidad_dias_reconocidos = 'calendario' AND dias_reconocidos <= 182.00)
        )
      `);
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_ausencias_tipo_periodo
          ON public.ausencias_laborales (tipo_ausencia, fecha_inicio, fecha_fin)
      `);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureAusenciasLaboralesSchema: ajuste final no fatal ${sanitizeLogText(msg)}`);
    }
  }

  /** Historial flota: CHECK pagado_por / tipo_intervencion, id_usuario_registro (38). */
  private async ensureRegistrosFlotaSchema() {
    if (!(await this.tableExists("registros_combustible"))) return;
    const alters = [
      `ALTER TABLE public.registros_combustible ADD COLUMN IF NOT EXISTS id_usuario_registro UUID REFERENCES usuarios (id) ON DELETE SET NULL`,
      `ALTER TABLE public.registros_mantenimiento_vehiculo ADD COLUMN IF NOT EXISTS id_usuario_registro UUID REFERENCES usuarios (id) ON DELETE SET NULL`
    ];
    for (const q of alters) {
      try {
        await this.pool.query(q);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`ensureRegistrosFlotaSchema: ${sanitizeLogText(msg)}`);
      }
    }
    try {
      await this.pool.query(
        `ALTER TABLE public.registros_combustible DROP CONSTRAINT IF EXISTS chk_registros_combustible_pagado_por`
      );
      await this.pool.query(`
        ALTER TABLE public.registros_combustible
          ADD CONSTRAINT chk_registros_combustible_pagado_por
          CHECK (pagado_por IN ('empresa', 'conductor'))
      `);
      await this.pool.query(
        `ALTER TABLE public.registros_mantenimiento_vehiculo DROP CONSTRAINT IF EXISTS chk_registros_mantenimiento_tipo`
      );
      await this.pool.query(`
        ALTER TABLE public.registros_mantenimiento_vehiculo
          ADD CONSTRAINT chk_registros_mantenimiento_tipo
          CHECK (tipo_intervencion IN ('preventivo', 'correctivo', 'falla'))
      `);
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_combustible_usuario_registro ON registros_combustible (id_usuario_registro)`
      );
      await this.pool.query(
        `CREATE INDEX IF NOT EXISTS idx_mantenimiento_usuario_registro ON registros_mantenimiento_vehiculo (id_usuario_registro)`
      );
      this.logger.log("registros flota: esquema verificado.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureRegistrosFlotaSchema constraints: ${sanitizeLogText(msg)}`);
    }
  }

  /** Helper: ¿existe la tabla en el schema actual (público por defecto)? */
  private async tableExists(tableName: string): Promise<boolean> {
    try {
      const r = await this.pool.query<{ ok: boolean }>(
        `SELECT to_regclass($1) IS NOT NULL AS ok`,
        [tableName]
      );
      return Boolean(r.rows[0]?.ok);
    } catch {
      return false;
    }
  }

  private portalAuditIso(raw: unknown): string | null {
    if (raw == null || raw === "") return null;
    if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw.toISOString();
    const txt = String(raw).trim();
    if (!txt) return null;
    const parsed = new Date(txt);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    return txt;
  }

  private buildDeletedRequestAuditSnapshot(row: Record<string, unknown>): Record<string, unknown> {
    return {
      requestId: row.id ?? null,
      requestNumber: row.numero_solicitud ?? null,
      clientName: row.nombre_cliente ?? null,
      serviceType: row.tipo_servicio ?? null,
      requiresThermoking: row.refrigeracion_termoking ?? null,
      requestedVehicleType: row.tipo_vehiculo ?? null,
      originDepartment: row.departamento_origen ?? null,
      originCity: row.ciudad_origen ?? null,
      originAddress: row.direccion_origen ?? null,
      destinationDepartment: row.departamento_destino ?? null,
      destinationCity: row.ciudad_destino ?? null,
      destinationAddress: row.direccion_destino ?? null,
      pickupAt: this.portalAuditIso(row.fecha_hora_recogida),
      etaDelivery: this.portalAuditIso(row.fecha_hora_entrega_estimada),
      requestedByName: row.nombre_quien_solicita ?? null,
      contactName: row.nombre_contacto_en_sitio ?? null,
      contactPhone: row.telefono_contacto_en_sitio ?? null,
      cargoDescription: row.descripcion_carga ?? null,
      weightKg: row.peso_kg ?? null,
      boxesCount: row.numero_cajas ?? null,
      status: row.estado ?? null,
      notes: row.observaciones ?? null
    };
  }

  private buildDeletedTripAuditSnapshot(
    row: Record<string, unknown> & { sol_numero_solicitud?: string }
  ): Record<string, unknown> {
    return {
      requestId: row.id_solicitud ?? null,
      requestNumber: row.sol_numero_solicitud ?? null,
      tripId: row.id ?? null,
      tripNumber: row.numero_viaje ?? null,
      liveOperationalStatus: row.estado_operativo_en_vivo ?? null,
      etaPickup: this.portalAuditIso(row.fecha_hora_recogida_programada),
      etaDelivery: this.portalAuditIso(row.fecha_hora_entrega_programada),
      assignedBy: row.asignado_por ?? null,
      assignedAt: this.portalAuditIso(row.fecha_hora_asignacion),
      vehicleType: row.tipo_vehiculo_asignado ?? null,
      vehiclePlate: row.placa_vehiculo ?? null,
      driverName: row.nombre_conductor ?? null,
      driverPhone: row.telefono_conductor ?? null,
      routeDescription: row.descripcion_ruta ?? row.observaciones ?? null,
      invoiceData: row.datos_factura_json ?? null
    };
  }

  private async pruneDeletionAuditTableTx(client: PoolClient, tableName: string): Promise<void> {
    await client.query(
      `DELETE FROM ${tableName}
       WHERE eliminado_en < now() - ($1::int * interval '1 day')`,
      [PORTAL_DELETION_AUDIT_RETENTION_DAYS]
    );
    await client.query(
      `DELETE FROM ${tableName}
       WHERE id IN (
         SELECT id
         FROM ${tableName}
         ORDER BY eliminado_en DESC
         OFFSET $1
       )`,
      [PORTAL_DELETION_AUDIT_MAX_ROWS]
    );
  }

  private async pruneTransportDeletionAudits(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      if (await this.tableExists("auditoria_solicitudes_eliminadas")) {
        await this.pruneDeletionAuditTableTx(client, "auditoria_solicitudes_eliminadas");
      }
      if (await this.tableExists("auditoria_viajes_eliminados")) {
        await this.pruneDeletionAuditTableTx(client, "auditoria_viajes_eliminados");
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK").catch(() => null);
      throw err;
    } finally {
      client.release();
    }
  }

  private async loadActiveSystemParameters(
    referenceDate: Date = new Date(),
    client?: PoolClient
  ): Promise<Map<string, number>> {
    if (!(await this.tableExists("parametros_sistema"))) return new Map();
    const db = client ?? this.pool;
    const refDateSql = this.pgDateUtc(referenceDate);
    const r = await db.query<{
      clave_norm: string;
      valor_numerico: string | null;
      valor_texto: string | null;
    }>(
      `SELECT DISTINCT ON (lower(trim(clave)))
         lower(trim(clave)) AS clave_norm,
         valor_numerico::text AS valor_numerico,
         valor_texto
       FROM parametros_sistema
       WHERE vigente_desde <= $1::date
         AND (vigente_hasta IS NULL OR vigente_hasta >= $1::date)
       ORDER BY lower(trim(clave)), vigente_desde DESC, vigente_hasta DESC NULLS LAST`,
      [refDateSql]
    );
    const out = new Map<string, number>();
    for (const row of r.rows) {
      const key = normalizeSystemParameterKey(row.clave_norm);
      const value = coerceSystemParameterNumber(row.valor_numerico, row.valor_texto);
      if (key && value != null) out.set(key, value);
    }
    return out;
  }

  private pickActiveSystemParameter(
    active: ReadonlyMap<string, number>,
    aliases: readonly string[]
  ): number | null {
    for (const rawAlias of aliases) {
      const key = normalizeSystemParameterKey(rawAlias);
      const value = active.get(key);
      if (value != null && Number.isFinite(value)) return value;
    }
    return null;
  }

  private async loadPlatformLaborReferenceYear(client?: PoolClient): Promise<number | null> {
    const active = await this.loadActiveSystemParameters(new Date(), client);
    const year = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.platformReferenceYear);
    if (year == null) return null;
    return normalizeLaborSystemParameterYear(year);
  }

  private async loadLaborSystemRules(
    referenceDate: Date = new Date(),
    client?: PoolClient
  ): Promise<PortalLaborSystemRules> {
    const forcedYear = await this.loadPlatformLaborReferenceYear(client);
    const effectiveReferenceDate =
      forcedYear != null ? new Date(Date.UTC(forcedYear, 0, 1, 12, 0, 0, 0)) : referenceDate;
    const active = await this.loadActiveSystemParameters(effectiveReferenceDate, client);
    const smmlvDb = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.smmlv);
    const transportAllowanceDb = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.transportAllowance);
    const uvtDb = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.uvt);
    const legalWeeklyHoursDb = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.legalWeeklyHours);
    const healthEmployeeRateDb = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.healthEmployeeRate);
    const pensionEmployeeRateDb = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.pensionEmployeeRate);
    const smmlvFallback = Math.max(
      0,
      Number(this.config.get<string>("PAYROLL_SMMLV_COP")) || SMMLV_COP_REFERENCE_2026
    );
    const activeYear =
      forcedYear != null ? forcedYear : Number(this.pgDateUtc(effectiveReferenceDate).slice(0, 4)) || new Date().getUTCFullYear();

    return {
      smmlvCop: smmlvDb ?? smmlvFallback,
      // Cuando existe en BD, el piso salarial del portal se alinea al mismo SMMLV vigente.
      minMonthlySalaryCop: smmlvDb ?? DEFAULT_FRONTEND_MIN_MONTHLY_SALARY_COP,
      transportAllowanceCop: transportAllowanceDb ?? DEFAULT_FRONTEND_TRANSPORT_ALLOWANCE_COP,
      legalWeeklyHours: legalWeeklyHoursDb ?? DEFAULT_COLOMBIA_LEGAL_WEEKLY_HOURS,
      healthEmployeeRate: healthEmployeeRateDb ?? DEFAULT_HEALTH_EMPLOYEE_RATE,
      pensionEmployeeRate: pensionEmployeeRateDb ?? DEFAULT_PENSION_EMPLOYEE_RATE,
      uvtCop: uvtDb,
      activeYear,
      referenceMode: forcedYear != null ? "manual" : "automatic"
    };
  }

  private async loadLaborSystemParametersHistory(
    referenceDate: Date = new Date(),
    client?: PoolClient
  ): Promise<PortalLaborSystemParametersHistoryRow[]> {
    if (!(await this.tableExists("parametros_sistema"))) return [];
    const db = client ?? this.pool;
    const allAliases = [
      ...SYSTEM_PARAMETER_ALIASES.smmlv,
      ...SYSTEM_PARAMETER_ALIASES.transportAllowance,
      ...SYSTEM_PARAMETER_ALIASES.uvt,
      ...SYSTEM_PARAMETER_ALIASES.legalWeeklyHours,
      ...SYSTEM_PARAMETER_ALIASES.healthEmployeeRate,
      ...SYSTEM_PARAMETER_ALIASES.pensionEmployeeRate
    ].map((item) => normalizeSystemParameterKey(item));
    const rows = await db.query<{
      clave_norm: string;
      valor_numerico: string | null;
      valor_texto: string | null;
      vigente_desde: string;
      vigente_hasta: string | null;
    }>(
      `SELECT lower(trim(clave)) AS clave_norm,
              valor_numerico::text AS valor_numerico,
              valor_texto,
              vigente_desde::text AS vigente_desde,
              vigente_hasta::text AS vigente_hasta
         FROM parametros_sistema
        WHERE lower(trim(clave)) = ANY($1::text[])
        ORDER BY vigente_desde DESC, vigente_hasta DESC NULLS LAST, lower(trim(clave)) ASC`,
      [allAliases]
    );
    const refDateSql = this.pgDateUtc(referenceDate);
    const history = new Map<string, PortalLaborSystemParametersHistoryRow>();
    for (const row of rows.rows) {
      const field = laborSystemParameterFieldFromKey(row.clave_norm);
      if (!field || field === "platformReferenceYear") continue;
      const groupKey = `${row.vigente_desde}|${row.vigente_hasta || ""}`;
      const year = Number(String(row.vigente_desde || "").slice(0, 4)) || 0;
      const isCurrent =
        String(row.vigente_desde || "") <= refDateSql &&
        (!row.vigente_hasta || String(row.vigente_hasta) >= refDateSql);
      const base =
        history.get(groupKey) ||
        {
          year,
          effectiveFrom: row.vigente_desde,
          effectiveTo: row.vigente_hasta,
          smmlvCop: null,
          minMonthlySalaryCop: null,
          transportAllowanceCop: null,
          legalWeeklyHours: null,
          healthEmployeeRate: null,
          pensionEmployeeRate: null,
          uvtCop: null,
          isCurrent
        };
      const value = coerceSystemParameterNumber(row.valor_numerico, row.valor_texto);
      if (field === "smmlvCop") {
        base.smmlvCop = value;
        base.minMonthlySalaryCop = value;
      } else {
        base[field] = value;
      }
      base.isCurrent = base.isCurrent || isCurrent;
      history.set(groupKey, base);
    }
    return [...history.values()].sort((a, b) => String(b.effectiveFrom).localeCompare(String(a.effectiveFrom)));
  }

  private isAdmin(role: JwtRole) {
    return String(role || "").toLowerCase() === "admin";
  }

  private isTransportOps(role: JwtRole) {
    const r = String(role || "").toLowerCase();
    return ["admin", "administracion", "auxiliar_administrativo", "lider_administrativo"].includes(r);
  }

  private isPortalClientRole(role: JwtRole) {
    return String(role || "").toLowerCase() === "client";
  }

  private readonly authorizationTypePermissions: Record<string, string> = {
    create_user: "authorizations_portal_users",
    create_driver: "authorizations_fleet",
    create_employee: "authorizations_workforce",
    update_employee: "authorizations_workforce",
    register_hr_absence: "authorizations_hr_absences",
    mark_payroll_paid: "authorizations_payroll_pay",
    approve_trip_request: "authorizations_transport"
  };

  private canReviewApprovalType(permissionSet: Set<string>, approvalType: string): boolean {
    if (permissionSet.has("authorizations_manage")) return true;
    const type = String(approvalType || "").trim();
    if (
      (type === "create_employee" || type === "update_employee") &&
      permissionSet.has("payroll_manage")
    ) {
      return true;
    }
    const perm = this.authorizationTypePermissions[type];
    return Boolean(perm && permissionSet.has(perm));
  }

  private canApprovePortalRegistration(permissionSet: Set<string>): boolean {
    return (
      permissionSet.has("authorizations_manage") ||
      permissionSet.has("authorizations_portal_registrations")
    );
  }

  private async assertCanApprovePortalRegistration(actorUserId: string, actorRole: JwtRole): Promise<void> {
    if (this.isAdmin(actorRole)) return;
    const perms = await this.loadPortalPermissionSet(actorUserId);
    if (!this.canApprovePortalRegistration(perms)) throw new ForbiddenException();
  }

  private readonly vehicleGranularPermissions = [
    "transport_vehicles_view",
    "transport_vehicles_create",
    "transport_vehicles_edit",
    "transport_vehicles_status",
    "transport_vehicles_delete"
  ] as const;

  private hasVehicleManageAll(permissionSet: ReadonlySet<string>): boolean {
    return permissionSet.has("transport_vehicles");
  }

  private canAccessVehiclesModule(permissionSet: ReadonlySet<string>): boolean {
    if (this.hasVehicleManageAll(permissionSet)) return true;
    return this.vehicleGranularPermissions.some((p) => permissionSet.has(p));
  }

  private canSyncVehicles(permissionSet: ReadonlySet<string>): boolean {
    if (this.hasVehicleManageAll(permissionSet)) return true;
    return (
      permissionSet.has("transport_vehicles_create") ||
      permissionSet.has("transport_vehicles_edit") ||
      permissionSet.has("transport_vehicles_status")
    );
  }

  private canDeleteVehicleByPermission(permissionSet: ReadonlySet<string>): boolean {
    return this.hasVehicleManageAll(permissionSet) || permissionSet.has("transport_vehicles_delete");
  }

  private hasTransportOpsPermission(permissionSet: Set<string>): boolean {
    if (permissionSet.has("authorizations_manage")) return true;
    const keys = [
      "transport_trips",
      "transport_requests",
      "authorizations_transport",
      "transport_vehicles",
      ...this.vehicleGranularPermissions,
      "transport_drivers",
      "transport_calendar",
      "transport_history"
    ];
    return keys.some((k) => permissionSet.has(k));
  }

  /**
   * Completa Mi perfil con datos de `empleados_nomina` cuando en `usuarios` vienen vacíos
   * (común en RRHH: ficha de nómina completa, cuenta portal sin contacto de emergencia).
   */
  private async enrichPortalUserProfileFromPayrollEmployee<T extends Record<string, unknown>>(
    user: T
  ): Promise<T> {
    const emergencyRel = String(
      (user as { emergencyRelationship?: string }).emergencyRelationship ??
        (user as { emergencyRelation?: string }).emergencyRelation ??
        ""
    ).trim();
    const needEmergency =
      !String(user.emergencyContact ?? "").trim() ||
      !String(user.emergencyPhone ?? "").trim() ||
      !emergencyRel;
    const needPhone = !String(user.phone ?? "").trim();
    const needBirth = !String(user.birthDate ?? "").trim();
    const needLocation = !String(user.city ?? "").trim() && !String(user.department ?? "").trim();
    if (!needEmergency && !needPhone && !needBirth && !needLocation) {
      return user;
    }
    if (!(await this.tableExists("empleados_nomina"))) return user;

    const email = String(user.email ?? "").trim();
    const docDigits = String(user.personalDoc ?? user.taxId ?? "").replace(/\D/g, "");
    const fullName = [
      user.firstName,
      user.middleName,
      user.lastName,
      user.secondLastName,
      user.name
    ]
      .map((s) => String(s ?? "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    if (!email && docDigits.length < 5 && fullName.length < 6) return user;

    const r = await this.pool.query<{
      contacto_emergencia: string | null;
      telefono_emergencia: string | null;
      parentesco_emergencia: string | null;
      telefono: string | null;
      departamento: string | null;
      ciudad: string | null;
      direccion: string | null;
      fecha_nacimiento: string | Date | null;
      genero: string | null;
    }>(
      `SELECT en.contacto_emergencia, en.telefono_emergencia, en.parentesco_emergencia,
              en.telefono, en.departamento, en.ciudad, en.direccion, en.fecha_nacimiento, en.genero
         FROM empleados_nomina en
        WHERE ($1::text <> '' AND lower(trim(coalesce(en.correo_personal, ''))) = lower(trim($1::text)))
           OR ($2::text <> '' AND length($2::text) >= 5
               AND regexp_replace(trim(coalesce(en.numero_documento, '')), '[^0-9]', '', 'g') = $2::text)
           OR ($3::text <> '' AND length($3::text) >= 6
               AND upper(regexp_replace(trim(coalesce(en.nombre_completo, '')), '\\s+', ' ', 'g'))
                 = upper(regexp_replace(trim($3::text), '\\s+', ' ', 'g')))
        ORDER BY en.fecha_creacion DESC NULLS LAST
        LIMIT 1`,
      [email, docDigits, fullName]
    );
    if (!r.rows.length) return user;

    return this.applyPayrollEmployeeProfileEnrichment(user, r.rows[0]);
  }

  private applyPayrollEmployeeProfileEnrichment<T extends Record<string, unknown>>(
    user: T,
    emp: {
      contacto_emergencia: string | null;
      telefono_emergencia: string | null;
      parentesco_emergencia: string | null;
      telefono: string | null;
      departamento: string | null;
      ciudad: string | null;
      direccion: string | null;
      fecha_nacimiento: string | Date | null;
      genero: string | null;
    }
  ): T {
    const out: Record<string, unknown> = { ...user };
    const fill = (key: string, val: unknown) => {
      if (val == null || String(val).trim() === "") return;
      if (!String(out[key] ?? "").trim()) out[key] = String(val).trim();
    };
    fill("emergencyContact", emp.contacto_emergencia);
    fill("emergencyPhone", emp.telefono_emergencia);
    const rel = emp.parentesco_emergencia;
    fill("emergencyRelationship", rel);
    fill("emergencyRelation", rel);
    fill("phone", emp.telefono);
    fill("department", emp.departamento);
    fill("city", emp.ciudad);
    fill("address", emp.direccion);
    if (!String(out.birthDate ?? "").trim() && emp.fecha_nacimiento) {
      out.birthDate = this.sqlEmployeeDateToPortalYmd(emp.fecha_nacimiento);
    }
    fill("gender", emp.genero);
    return out as T;
  }

  private async findPayrollEmployeeIdByDocument(
    c: PoolClient | null,
    document: string
  ): Promise<string | null> {
    const doc = String(document || "").trim();
    if (!doc || !(await this.tableExists("empleados_nomina"))) return null;
    const q = `SELECT id::text AS id FROM empleados_nomina
      WHERE regexp_replace(trim(coalesce(numero_documento, '')), '[^0-9]', '', 'g')
        = regexp_replace(trim($1), '[^0-9]', '', 'g')
      LIMIT 1`;
    const r = c
      ? await c.query<{ id: string }>(q, [doc])
      : await this.pool.query<{ id: string }>(q, [doc]);
    return r.rows[0]?.id ? String(r.rows[0].id) : null;
  }

  private isRrhh(role: JwtRole) {
    const r = String(role || "").toLowerCase();
    return ["admin", "rrhh", "administracion", "auxiliar_administrativo", "lider_administrativo"].includes(r);
  }

  private async loadPortalPermissionSet(userId: string): Promise<Set<string>> {
    const uid = String(userId || "").trim();
    if (!PG_UUID_V4_RE.test(uid)) return new Set();
    const r = await this.pool.query<{ permiso: string }>(
      `SELECT permiso FROM permisos_usuario WHERE id_usuario = $1::uuid`,
      [uid]
    );
    return new Set(r.rows.map((row) => String(row.permiso || "").trim()).filter(Boolean));
  }

  /** Misma política que permisos por defecto del rol en app.js cuando `permisos_usuario` está vacío. */
  private async resolveEffectivePermissionSet(userId: string, role: JwtRole): Promise<Set<string>> {
    if (this.isAdmin(role)) return new Set(ALL_PORTAL_PERMISSIONS);
    const fromDb = await this.loadPortalPermissionSet(userId);
    if (fromDb.size > 0) return fromDb;
    return new Set(defaultPermissionsForApprovedRole(String(role || "").toLowerCase()));
  }

  private canViewPositionsCatalog(role: JwtRole, permissionSet: ReadonlySet<string>): boolean {
    return (
      this.isAdmin(role) ||
      this.isRrhh(role) ||
      this.hasPortalPermission(permissionSet, "payroll_manage") ||
      this.hasPortalPermission(permissionSet, "hiring_manage")
    );
  }

  private async assertCanViewPositionsCatalog(userId: string, role: JwtRole): Promise<void> {
    const permissionSet = await this.resolveEffectivePermissionSet(userId, role);
    if (!this.canViewPositionsCatalog(role, permissionSet)) {
      throw new ForbiddenException();
    }
  }

  /** Catálogo de cargos (lectura directa en PostgreSQL; no depende del volcado completo de bootstrap). */
  async getPositionsCatalog(userId: string, role: JwtRole) {
    await this.assertCanViewPositionsCatalog(userId, role);
    const rows = await this.loadPositions();
    this.logger.log(`getPositionsCatalog: ${rows.length} fila(s) para usuario ${userId}`);
    return rows;
  }

  private hasPortalPermission(permissionSet: ReadonlySet<string>, permission: string): boolean {
    return permissionSet.has(String(permission || "").trim());
  }

  private async getUserCompany(userId: string): Promise<string | null> {
    const r = await this.pool.query<{ id_empresa: string | null }>(
      `SELECT id_empresa::text AS id_empresa FROM usuarios WHERE id = $1::uuid`,
      [userId]
    );
    return r.rows[0]?.id_empresa ?? null;
  }

  /**
   * Lista usuarios de Supabase Auth (admin API). Iteración paginada con cota dura.
   * Devuelve [] si Supabase no está habilitado o falla la lectura (no debe romper bootstrap).
   */
  private async listSupabaseAuthUsers(): Promise<
    Array<{
      id: string;
      email: string | null;
      createdAt: string | null;
      emailConfirmedAt: string | null;
      lastSignInAt: string | null;
      fullName: string | null;
      phone: string | null;
    }>
  > {
    if (!this.supabaseAdmin) return [];
    const out: Array<{
      id: string;
      email: string | null;
      createdAt: string | null;
      emailConfirmedAt: string | null;
      lastSignInAt: string | null;
      fullName: string | null;
      phone: string | null;
    }> = [];
    const perPage = 200;
    const maxPages = 25; // 5.000 usuarios cota; impide bucles infinitos si la API no respeta paginación
    for (let page = 1; page <= maxPages; page += 1) {
      // eslint-disable-next-line no-await-in-loop
      const { data, error } = await this.supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) {
        this.logger.warn(`listSupabaseAuthUsers page=${page}: ${error.message}`);
        break;
      }
      const users = data?.users ?? [];
      if (!users.length) break;
      for (const u of users) {
        const meta = (u.user_metadata as Record<string, unknown> | null | undefined) ?? {};
        const fullName =
          (typeof meta.full_name === "string" && meta.full_name) ||
          (typeof meta.name === "string" && (meta.name as string)) ||
          null;
        out.push({
          id: String(u.id || "").trim(),
          email: u.email ? String(u.email).trim().toLowerCase() : null,
          createdAt: u.created_at ?? null,
          emailConfirmedAt: u.email_confirmed_at ?? null,
          lastSignInAt: u.last_sign_in_at ?? null,
          fullName,
          phone: u.phone ? String(u.phone).trim() : null
        });
      }
      if (users.length < perPage) break;
    }
    return out;
  }

  /**
   * Usuarios en Supabase Auth que NO existen en `public.usuarios` (huérfanos).
   * Se incluyen en la bandeja de Autorizaciones para que el admin pueda revisarlos.
   * Coincide por UUID o por email (normalizado en minúsculas).
   */
  private async loadSupabaseAuthOrphans(
    knownDbUsers: ReadonlyArray<Record<string, unknown>>
  ): Promise<Array<Record<string, unknown>>> {
    if (!this.supabaseAdmin) return [];
    let authUsers: Awaited<ReturnType<typeof this.listSupabaseAuthUsers>> = [];
    try {
      authUsers = await this.listSupabaseAuthUsers();
    } catch (err) {
      this.logger.warn(
        `loadSupabaseAuthOrphans: listUsers falló: ${err instanceof Error ? err.message : String(err)}`
      );
      return [];
    }
    if (!authUsers.length) return [];

    const knownIds = new Set<string>();
    const knownEmails = new Set<string>();
    for (const r of knownDbUsers) {
      const id = String(r?.id || "").trim().toLowerCase();
      if (id) knownIds.add(id);
      const em = String(r?.email || "").trim().toLowerCase();
      if (em) knownEmails.add(em);
    }

    const orphans: Array<Record<string, unknown>> = [];
    for (const au of authUsers) {
      const idLc = au.id.toLowerCase();
      const emailLc = (au.email || "").toLowerCase();
      if (!idLc) continue;
      if (knownIds.has(idLc)) continue;
      if (emailLc && knownEmails.has(emailLc)) continue;
      const createdIso = au.createdAt ? new Date(au.createdAt).toISOString() : new Date().toISOString();
      orphans.push({
        id: au.id,
        email: au.email || "",
        name: au.fullName || au.email || "Sin nombre",
        role: "client",
        accountStatus: "pendiente",
        companyId: null,
        company: "",
        firstName: null,
        middleName: null,
        lastName: null,
        secondLastName: null,
        personType: null,
        documentType: null,
        personalDoc: null,
        companyNit: null,
        taxId: null,
        documentIssuedAt: "",
        birthDate: "",
        gender: null,
        position: null,
        workArea: null,
        phone: au.phone || null,
        department: null,
        city: null,
        address: null,
        emergencyContact: null,
        emergencyPhone: null,
        emergencyRelationship: null,
        emergencyRelation: "",
        avatarUrl: null,
        portalSince: "",
        systemJoinDate: "",
        createdAt: createdIso,
        registeredAt: createdIso,
        password: "",
        permissions: [],
        source: "supabase_auth_only",
        emailConfirmedAt: au.emailConfirmedAt,
        lastSignInAt: au.lastSignInAt
      });
    }
    return orphans;
  }

  /** Asegura que un id de Supabase Auth tenga fila en `public.usuarios` (estado pendiente) antes de aprobar. */
  private async provisionUsuariosFromAuthOrphan(authUserId: string): Promise<{ id: string; email: string; name: string } | null> {
    if (!this.supabaseAdmin) return null;
    if (!PG_UUID_V4_RE.test(authUserId)) return null;
    const { data, error } = await this.supabaseAdmin.auth.admin.getUserById(authUserId);
    if (error || !data?.user) return null;
    const u = data.user;
    const email = (u.email || "").trim().toLowerCase();
    if (!email) return null;
    const meta = (u.user_metadata as Record<string, unknown> | null | undefined) ?? {};
    const fullName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && (meta.name as string)) ||
      email;
    await this.pool.query(
      `INSERT INTO usuarios (
         id, correo_electronico, hash_contrasena, nombre_completo, rol, estado_cuenta, tipo_vinculo_registro
       ) VALUES (
         $1::uuid, $2, '', $3, 'client'::rol_usuario, 'pendiente'::estado_cuenta_usuario, 'cliente'::tipo_vinculo_registro
       )
       ON CONFLICT (id) DO NOTHING`,
      [authUserId, email, fullName]
    );
    return { id: authUserId, email, name: fullName };
  }

  /**
   * Preferencias de bandeja: `notificaciones_habilitadas` (toasts + inserción server-side) vs
   * `sonido_notificaciones_habilitadas` (solo timbre; irrelevante si las notificaciones están off).
   */
  private async loadNotificationPreferencesForPortal(userId: string): Promise<{
    id: string | null;
    notificacionesHabilitadas: boolean;
    sonidoNotificacionesHabilitadas: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  }> {
    try {
      const r = await this.pool.query<{
        id: string;
        notificaciones_habilitadas: boolean;
        sonido_notificaciones_habilitadas: boolean;
        fecha_creacion: string | Date | null;
        fecha_actualizacion: string | Date | null;
      }>(
        `SELECT id::text, notificaciones_habilitadas, sonido_notificaciones_habilitadas,
                fecha_creacion, fecha_actualizacion
         FROM preferencias_notificacion_usuario WHERE id_usuario = $1::uuid LIMIT 1`,
        [userId]
      );
      if (!r.rows.length) {
        return {
          id: null,
          notificacionesHabilitadas: true,
          sonidoNotificacionesHabilitadas: true,
          createdAt: null,
          updatedAt: null
        };
      }
      const row = r.rows[0];
      return {
        id: row.id || null,
        notificacionesHabilitadas: row.notificaciones_habilitadas !== false,
        sonidoNotificacionesHabilitadas: row.sonido_notificaciones_habilitadas !== false,
        createdAt: row.fecha_creacion ? new Date(row.fecha_creacion).toISOString() : null,
        updatedAt: row.fecha_actualizacion ? new Date(row.fecha_actualizacion).toISOString() : null
      };
    } catch {
      return {
        id: null,
        notificacionesHabilitadas: true,
        sonidoNotificacionesHabilitadas: true,
        createdAt: null,
        updatedAt: null
      };
    }
  }

  async updateNotificationPreferences(
    userId: string,
    dto: { notificacionesHabilitadas?: boolean; sonidoNotificacionesHabilitadas?: boolean }
  ) {
    if (dto.notificacionesHabilitadas === undefined && dto.sonidoNotificacionesHabilitadas === undefined) {
      throw new BadRequestException("Indique al menos una preferencia");
    }
    const cur = await this.loadNotificationPreferencesForPortal(userId);
    const next = {
      notificacionesHabilitadas:
        dto.notificacionesHabilitadas !== undefined ? Boolean(dto.notificacionesHabilitadas) : cur.notificacionesHabilitadas,
      sonidoNotificacionesHabilitadas:
        dto.sonidoNotificacionesHabilitadas !== undefined
          ? Boolean(dto.sonidoNotificacionesHabilitadas)
          : cur.sonidoNotificacionesHabilitadas
    };
    try {
      const saved = await this.pool.query<{
        id: string;
        notificaciones_habilitadas: boolean;
        sonido_notificaciones_habilitadas: boolean;
        fecha_creacion: string | Date | null;
        fecha_actualizacion: string | Date | null;
      }>(
        `INSERT INTO preferencias_notificacion_usuario (
           id_usuario, notificaciones_habilitadas, sonido_notificaciones_habilitadas, fecha_creacion, fecha_actualizacion
         ) VALUES ($1::uuid, $2, $3, now(), now())
         ON CONFLICT (id_usuario) DO UPDATE SET
           notificaciones_habilitadas = EXCLUDED.notificaciones_habilitadas,
           sonido_notificaciones_habilitadas = EXCLUDED.sonido_notificaciones_habilitadas,
           fecha_actualizacion = now()
         RETURNING id::text, notificaciones_habilitadas, sonido_notificaciones_habilitadas, fecha_creacion, fecha_actualizacion`,
        [userId, next.notificacionesHabilitadas, next.sonidoNotificacionesHabilitadas]
      );
      const row = saved.rows[0];
      return {
        id: row?.id || null,
        notificacionesHabilitadas: row?.notificaciones_habilitadas !== false,
        sonidoNotificacionesHabilitadas: row?.sonido_notificaciones_habilitadas !== false,
        createdAt: row?.fecha_creacion ? new Date(row.fecha_creacion).toISOString() : null,
        updatedAt: row?.fecha_actualizacion ? new Date(row.fecha_actualizacion).toISOString() : null
      };
    } catch (e) {
      this.logger.warn(
        `updateNotificationPreferences falló para ${userId}: ${e instanceof Error ? e.message : String(e)}`
      );
      throw new BadRequestException(
        "No se pudieron guardar las preferencias. Revise la tabla preferencias_notificacion_usuario (columna sonido_notificaciones_habilitadas)."
      );
    }
  }

  async upsertLaborSystemParameters(userId: string, role: JwtRole, dto: UpsertLaborSystemParametersDto) {
    if (!this.isAdmin(role)) throw new ForbiddenException();
    await this.ensureSystemParametersSchema();
    if (!(await this.tableExists("parametros_sistema"))) {
      throw new BadRequestException(
        "La tabla parametros_sistema no está disponible. Ejecute las migraciones BD/postgres (02_parametros_sistema.sql y 35_alter_parametros_sistema_vigencia.sql)."
      );
    }
    const year = normalizeLaborSystemParameterYear(dto.year);
    if (year == null) {
      throw new BadRequestException(`Indique un año válido para la vigencia (${LABOR_SYSTEM_PARAMETERS_MIN_YEAR}–${LABOR_SYSTEM_PARAMETERS_MAX_YEAR}).`);
    }
    const smmlvCop = Math.max(1, Number(dto.smmlvCop) || 0);
    const transportAllowanceCop = Math.max(0, Number(dto.transportAllowanceCop) || 0);
    const uvtCop =
      dto.uvtCop === undefined || dto.uvtCop === null || Number(dto.uvtCop) <= 0 ? null : Number(dto.uvtCop);
    const legalWeeklyHours = Math.max(1, Number(dto.legalWeeklyHours) || DEFAULT_COLOMBIA_LEGAL_WEEKLY_HOURS);
    const healthEmployeeRate = Math.max(0, Number(dto.healthEmployeeRate) || 0);
    const pensionEmployeeRate = Math.max(0, Number(dto.pensionEmployeeRate) || 0);
    const platformReferenceYear =
      dto.platformReferenceYear === undefined || dto.platformReferenceYear === null
        ? null
        : normalizeLaborSystemParameterYear(dto.platformReferenceYear);
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const hadPrior = await client.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
           FROM parametros_sistema
          WHERE vigente_desde = $1::date
            AND lower(trim(clave)) = lower(trim($2))`,
        [startDate, LABOR_SYSTEM_PARAMETER_DEFS.smmlvCop.dbKey]
      );
      const laborAction: "create" | "update" = Number(hadPrior.rows[0]?.total || 0) > 0 ? "update" : "create";
      await this.upsertLaborSystemParameterValueTx(
        client,
        LABOR_SYSTEM_PARAMETER_DEFS.smmlvCop.dbKey,
        smmlvCop,
        startDate,
        endDate,
        `${LABOR_SYSTEM_PARAMETER_DEFS.smmlvCop.description} ${year}`
      );
      await this.upsertLaborSystemParameterValueTx(
        client,
        LABOR_SYSTEM_PARAMETER_DEFS.transportAllowanceCop.dbKey,
        transportAllowanceCop,
        startDate,
        endDate,
        `${LABOR_SYSTEM_PARAMETER_DEFS.transportAllowanceCop.description} ${year}`
      );
      await this.upsertLaborSystemParameterValueTx(
        client,
        LABOR_SYSTEM_PARAMETER_DEFS.legalWeeklyHours.dbKey,
        legalWeeklyHours,
        startDate,
        endDate,
        `${LABOR_SYSTEM_PARAMETER_DEFS.legalWeeklyHours.description} ${year}`
      );
      await this.upsertLaborSystemParameterValueTx(
        client,
        LABOR_SYSTEM_PARAMETER_DEFS.healthEmployeeRate.dbKey,
        healthEmployeeRate,
        startDate,
        endDate,
        `${LABOR_SYSTEM_PARAMETER_DEFS.healthEmployeeRate.description} ${year}`
      );
      await this.upsertLaborSystemParameterValueTx(
        client,
        LABOR_SYSTEM_PARAMETER_DEFS.pensionEmployeeRate.dbKey,
        pensionEmployeeRate,
        startDate,
        endDate,
        `${LABOR_SYSTEM_PARAMETER_DEFS.pensionEmployeeRate.description} ${year}`
      );
      if (uvtCop != null) {
        await this.upsertLaborSystemParameterValueTx(
          client,
          LABOR_SYSTEM_PARAMETER_DEFS.uvtCop.dbKey,
          uvtCop,
          startDate,
          endDate,
          `${LABOR_SYSTEM_PARAMETER_DEFS.uvtCop.description} ${year}`
        );
      } else {
        await client.query(
          `DELETE FROM parametros_sistema
            WHERE lower(trim(clave)) = lower(trim($1))
              AND vigente_desde = $2::date`,
          [LABOR_SYSTEM_PARAMETER_DEFS.uvtCop.dbKey, startDate]
        );
      }
      await this.upsertPlatformLaborReferenceYearTx(client, platformReferenceYear);
      let affectedPayrollRuns = 0;
      if (await this.tableExists("liquidaciones_nomina")) {
        const payrollCount = await client.query<{ total: string }>(
          `SELECT COUNT(*)::text AS total
             FROM liquidaciones_nomina
            WHERE left(COALESCE(periodo_mes, ''), 4) = $1`,
          [String(year)]
        );
        affectedPayrollRuns = Number(payrollCount.rows[0]?.total || 0);
      }
      const activeRules = await this.loadLaborSystemRules(new Date(), client);
      const history = await this.loadLaborSystemParametersHistory(new Date(), client);
      await insertPortalAuditEventTx(client, await this.portalAuditActor(userId), {
        action: laborAction,
        moduleId: "payroll",
        moduleLabel: "Gestión humana",
        entityId: `labor-${year}`,
        entityLabel: `Parámetros laborales ${year}`,
        summary: `SMMLV ${smmlvCop.toLocaleString("es-CO")} · Aux. transporte ${transportAllowanceCop.toLocaleString("es-CO")}`
      });
      await client.query("COMMIT");
      return {
        ok: true,
        year,
        affectedPayrollRuns,
        platformReferenceYear,
        systemParameters: activeRules,
        systemParametersHistory: history
      };
    } catch (e) {
      await client.query("ROLLBACK");
      throw this.mapLaborSystemParametersPersistenceError(e, "guardar");
    } finally {
      client.release();
    }
  }

  private laborSystemParameterKeyNormsExcludingPlatformRef(): string[] {
    return (
      Object.keys(LABOR_SYSTEM_PARAMETER_DEFS) as Array<keyof typeof LABOR_SYSTEM_PARAMETER_DEFS>
    )
      .filter((field) => field !== "platformReferenceYear")
      .flatMap((field) => {
        const def = LABOR_SYSTEM_PARAMETER_DEFS[field];
        return [def.dbKey, ...def.aliases];
      })
      .map((key) => normalizeSystemParameterKey(key))
      .filter(Boolean);
  }

  async deleteLaborSystemParameters(userId: string, role: JwtRole, yearLike: number) {
    if (!this.isAdmin(role)) throw new ForbiddenException();
    await this.ensureSystemParametersSchema();
    const year = normalizeLaborSystemParameterYear(yearLike);
    if (year == null) {
      throw new BadRequestException(`Indique un año válido para eliminar la vigencia (${LABOR_SYSTEM_PARAMETERS_MIN_YEAR}–${LABOR_SYSTEM_PARAMETERS_MAX_YEAR}).`);
    }
    if (!(await this.tableExists("parametros_sistema"))) {
      throw new BadRequestException("La tabla parametros_sistema no está disponible.");
    }
    const startDate = `${year}-01-01`;
    const laborKeys = this.laborSystemParameterKeyNormsExcludingPlatformRef();
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const existing = await client.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
           FROM parametros_sistema
          WHERE vigente_desde = $1::date
            AND lower(trim(clave)) = ANY($2::text[])`,
        [startDate, laborKeys]
      );
      if (Number(existing.rows[0]?.total || 0) <= 0) {
        throw new NotFoundException(`No hay vigencia registrada para el año ${year}.`);
      }
      let affectedPayrollRuns = 0;
      if (await this.tableExists("liquidaciones_nomina")) {
        const payrollCount = await client.query<{ total: string }>(
          `SELECT COUNT(*)::text AS total
             FROM liquidaciones_nomina
            WHERE left(COALESCE(periodo_mes, ''), 4) = $1`,
          [String(year)]
        );
        affectedPayrollRuns = Number(payrollCount.rows[0]?.total || 0);
      }
      await client.query(
        `DELETE FROM parametros_sistema
          WHERE vigente_desde = $1::date
            AND lower(trim(clave)) = ANY($2::text[])`,
        [startDate, laborKeys]
      );
      const manualRefYear = await this.loadPlatformLaborReferenceYear(client);
      if (manualRefYear === year) {
        await this.upsertPlatformLaborReferenceYearTx(client, null);
      }
      const activeRules = await this.loadLaborSystemRules(new Date(), client);
      const history = await this.loadLaborSystemParametersHistory(new Date(), client);
      await insertPortalAuditEventTx(client, await this.portalAuditActor(userId), {
        action: "delete",
        moduleId: "payroll",
        moduleLabel: "Gestión humana",
        entityId: `labor-${year}`,
        entityLabel: `Parámetros laborales ${year}`,
        summary: `Vigencia ${year} eliminada`
      });
      await client.query("COMMIT");
      return {
        ok: true,
        year,
        affectedPayrollRuns,
        systemParameters: activeRules,
        systemParametersHistory: history
      };
    } catch (e) {
      await client.query("ROLLBACK");
      throw this.mapLaborSystemParametersPersistenceError(e, "eliminar");
    } finally {
      client.release();
    }
  }

  private mapLaborSystemParametersPersistenceError(err: unknown, action: "guardar" | "eliminar"): BadRequestException {
    const pg = err as { code?: string; message?: string; detail?: string; constraint?: string };
    const code = String(pg?.code || "");
    const detail = String(pg?.detail || pg?.message || err || "").trim();
    this.logger.error(
      `labor-system-parameters ${action} falló (${code || "sin-código"}): ${sanitizeLogText(detail.slice(0, 240))}`
    );
    if (code === "23503") {
      return new BadRequestException(
        "No se pudo completar la operación por una referencia inválida en base de datos. Verifique su sesión e intente de nuevo."
      );
    }
    if (code === "23505") {
      return new BadRequestException(
        "Ya existe una vigencia registrada para ese año y parámetro. Recargue la página y edite la vigencia existente."
      );
    }
    if (code === "22P02") {
      return new BadRequestException("Formato de datos inválido al procesar parámetros legales.");
    }
    if (code === "42P01") {
      return new BadRequestException(
        "Falta la tabla parametros_sistema. Ejecute las migraciones de BD/postgres en el servidor PostgreSQL."
      );
    }
    if (code === "42703") {
      return new BadRequestException(
        "El esquema de parametros_sistema está desactualizado. Ejecute 35_alter_parametros_sistema_vigencia.sql y reinicie la API."
      );
    }
    if (detail) {
      return new BadRequestException(
        `No se pudieron ${action === "guardar" ? "guardar" : "eliminar"} los parámetros legales: ${detail.slice(0, 180)}`
      );
    }
    return new BadRequestException(
      `No se pudieron ${action === "guardar" ? "guardar" : "eliminar"} los parámetros legales. Revise la base de datos e intente nuevamente.`
    );
  }

  /**
   * Permisos y alcance de empresa del actor (una sola fuente para bootstrap y endpoints livianos).
   */
  private async resolveBootstrapActorContext(userId: string, role: JwtRole) {
    const admin = this.isAdmin(role);
    const [empresaId, permissionSet] = await Promise.all([
      this.getUserCompany(userId),
      this.resolveEffectivePermissionSet(userId, role)
    ]);
    const canUsersManage = admin || this.hasPortalPermission(permissionSet, "users_manage");
    const canViewContactB2b = admin || this.hasPortalPermission(permissionSet, "contact_b2b_view");
    const canTransportTrips = admin || this.hasPortalPermission(permissionSet, "transport_trips");
    const canTransportVehicles = admin || this.canAccessVehiclesModule(permissionSet);
    const canTransportDrivers = admin || this.hasPortalPermission(permissionSet, "transport_drivers");
    const canTransportCalendar = admin || this.hasPortalPermission(permissionSet, "transport_calendar");
    const canTransportHistory = admin || this.hasPortalPermission(permissionSet, "transport_history");
    const canTransportData =
      canTransportTrips ||
      canTransportVehicles ||
      canTransportDrivers ||
      canTransportCalendar ||
      canTransportHistory ||
      this.hasPortalPermission(permissionSet, "transport_requests") ||
      this.hasPortalPermission(permissionSet, "authorizations_transport") ||
      this.hasPortalPermission(permissionSet, "authorizations_manage");
    const canPayroll = admin || this.hasPortalPermission(permissionSet, "payroll_manage");
    const canHiring = admin || this.hasPortalPermission(permissionSet, "hiring_manage");
    const canLoadPositionsCatalog = this.canViewPositionsCatalog(role, permissionSet);
    const canSst = admin || this.hasPortalPermission(permissionSet, "sst_compliance");
    const fullUserDirectoryAccess = admin || canUsersManage;
    const canSeeAllCompanies =
      admin || canUsersManage || canTransportData || canPayroll || canHiring || canSst || canViewContactB2b;
    return {
      admin,
      empresaId,
      permissionSet,
      canUsersManage,
      canViewContactB2b,
      canTransportTrips,
      canTransportVehicles,
      canTransportDrivers,
      canTransportCalendar,
      canTransportHistory,
      canTransportData,
      canPayroll,
      canHiring,
      canLoadPositionsCatalog,
      canSst,
      fullUserDirectoryAccess,
      canSeeAllCompanies
    };
  }

  /**
   * Lista de colaboradores para Gestión humana (misma lógica SQL que el bootstrap).
   * El cliente puede llamarlo al entrar al módulo para corregir caché vacía o desalineada.
   */
  async listPayrollEmployeesForPortal(userId: string, role: JwtRole) {
    const ctx = await this.resolveBootstrapActorContext(userId, role);
    if (!ctx.canPayroll) throw new ForbiddenException();
    return this.loadPayrollEmployees(
      ctx.empresaId,
      ctx.admin,
      ctx.canSeeAllCompanies,
      this.hasPortalPermission(ctx.permissionSet, "payroll_manage")
    );
  }

  async bootstrap(userId: string, role: JwtRole) {
    const {
      admin,
      empresaId,
      permissionSet,
      canUsersManage,
      canViewContactB2b,
      canTransportTrips,
      canTransportVehicles,
      canTransportDrivers,
      canTransportCalendar,
      canTransportHistory,
      canTransportData,
      canPayroll,
      canHiring,
      canLoadPositionsCatalog,
      canSst,
      fullUserDirectoryAccess,
      canSeeAllCompanies
    } = await this.resolveBootstrapActorContext(userId, role);
    const laborSystemRulesPromise = this.loadLaborSystemRules();
    const laborSystemHistoryPromise =
      canPayroll || canHiring ? this.loadLaborSystemParametersHistory() : Promise.resolve([]);

    const independentPromise = Promise.all([
      this.loadCompanies(canSeeAllCompanies ? null : empresaId),
      admin ? this.loadCounters() : Promise.resolve({}),
      canPayroll ? this.loadTravelAllowanceRules() : Promise.resolve({ interDepartmentTripAmount: 85000 }),
      laborSystemRulesPromise,
      laborSystemHistoryPromise,
      canTransportTrips ? this.loadTripRouteRates() : Promise.resolve({}),
      canTransportData ? this.loadVehicles() : Promise.resolve([]),
      canTransportData ? this.loadDrivers() : Promise.resolve([]),
      this.loadNotifications(userId, role),
      this.loadEmails(admin),
      this.loadContacts(canViewContactB2b),
      canLoadPositionsCatalog ? this.loadPositions() : Promise.resolve([]),
      canHiring ? this.loadVacancies() : Promise.resolve([]),
      canHiring ? this.loadCandidates() : Promise.resolve([]),
      canHiring ? this.loadInterviews() : Promise.resolve([]),
      canHiring ? this.loadContracts() : Promise.resolve([]),
      canPayroll ? this.loadPayrollRunsForBootstrap() : Promise.resolve([]),
      canTransportHistory ? this.loadFuelLogs() : Promise.resolve([]),
      canTransportHistory ? this.loadVehicleTechnicalLogs() : Promise.resolve([]),
      canPayroll ? this.loadHrAbsences() : Promise.resolve([]),
      canSst ? this.loadSstCompliance() : Promise.resolve([])
    ]);

    const dependentPromise = Promise.all([
      this.loadUsers(admin, userId, empresaId, role, fullUserDirectoryAccess),
      this.loadRequests(admin, userId, empresaId, canTransportData, role),
      canPayroll
        ? this.loadPayrollEmployees(
            empresaId,
            admin,
            canSeeAllCompanies,
            this.hasPortalPermission(permissionSet, "payroll_manage")
          )
        : Promise.resolve([]),
      this.loadApprovals(admin, userId, empresaId),
      admin ? this.loadDeletedTransportTripLogs() : Promise.resolve([]),
      admin ? this.loadDeletedTransportRequestLogs() : Promise.resolve([]),
      this.canReadPortalAuditEvents(permissionSet, admin)
        ? this.loadPortalAuditEvents()
        : Promise.resolve([])
    ]);

    const [independent, dependent] = await Promise.all([independentPromise, dependentPromise]);

    const [
      companies,
      counters,
      travelAllowanceRules,
      systemParameters,
      systemParametersHistory,
      tripRouteRates,
      vehicles,
      drivers,
      notifications,
      emails,
      contacts,
      positions,
      vacancies,
      candidates,
      interviews,
      contracts,
      payrollRuns,
      fuelLogs,
      vehicleTechnicalLogs,
      hrAbsences,
      sstCompliance
    ] = independent;

    const [usersRaw, requests, payrollEmployees, approvals, deletedTransportTripLogs, deletedTransportRequestLogs, portalAuditEvents] =
      dependent;

    const users = await Promise.all(
      (usersRaw as Array<Record<string, unknown>>).map(async (u) =>
        String(u.id) === String(userId) ? this.enrichPortalUserProfileFromPayrollEmployee(u) : u
      )
    );

    const notificationPreferences = await this.loadNotificationPreferencesForPortal(userId);

    return {
      users,
      companies,
      counters,
      contacts,
      requests,
      vehicles,
      drivers,
      notifications,
      emails,
      payrollEmployees,
      payrollRuns,
      fuelLogs,
      vehicleTechnicalLogs,
      travelAllowanceRules,
      systemParameters,
      systemParametersHistory,
      vacancies,
      candidates,
      positions,
      interviews,
      contracts,
      hrAbsences,
      sstCompliance,
      tripRouteRates,
      approvals,
      deletedTransportTripLogs,
      deletedTransportRequestLogs,
      portalAuditEvents,
      notificationPreferences
    };
  }

  private async upsertLaborSystemParameterValueTx(
    client: PoolClient,
    dbKey: string,
    value: number,
    effectiveFrom: string,
    effectiveTo: string,
    description: string
  ) {
    await client.query(
      `UPDATE parametros_sistema
          SET vigente_hasta = LEAST(COALESCE(vigente_hasta, $2::date), ($1::date - INTERVAL '1 day')::date)
        WHERE lower(trim(clave)) = lower(trim($3))
          AND vigente_desde < $1::date
          AND (vigente_hasta IS NULL OR vigente_hasta >= $1::date)
          AND vigente_desde <> $1::date`,
      [effectiveFrom, effectiveTo, dbKey]
    );
    const existing = await client.query<{ id: string }>(
      `SELECT id::text
         FROM parametros_sistema
        WHERE lower(trim(clave)) = lower(trim($1))
          AND vigente_desde = $2::date
        LIMIT 1`,
      [dbKey, effectiveFrom]
    );
    if (existing.rows[0]?.id) {
      await client.query(
        `UPDATE parametros_sistema
            SET clave = $2,
                valor_numerico = $3,
                valor_texto = NULL,
                vigente_hasta = $4::date,
                descripcion = $5
          WHERE id = $1::uuid`,
        [existing.rows[0].id, dbKey, value, effectiveTo, description]
      );
      return;
    }
    await client.query(
      `INSERT INTO parametros_sistema (
         id, clave, valor_numerico, valor_texto, vigente_desde, vigente_hasta, descripcion
       ) VALUES (
         gen_random_uuid(), $1, $2, NULL, $3::date, $4::date, $5
       )
       ON CONFLICT ((lower(trim(clave))), vigente_desde)
       DO UPDATE SET
         clave = EXCLUDED.clave,
         valor_numerico = EXCLUDED.valor_numerico,
         valor_texto = NULL,
         vigente_hasta = EXCLUDED.vigente_hasta,
         descripcion = EXCLUDED.descripcion`,
      [dbKey, value, effectiveFrom, effectiveTo, description]
    );
  }

  private async upsertPlatformLaborReferenceYearTx(client: PoolClient, year: number | null) {
    await client.query(
      `DELETE FROM parametros_sistema
        WHERE lower(trim(clave)) = lower(trim($1))`,
      [LABOR_SYSTEM_PARAMETER_DEFS.platformReferenceYear.dbKey]
    );
    const validYear = year == null ? null : normalizeLaborSystemParameterYear(year);
    if (validYear == null) return;
    const effectiveFrom = this.pgDateUtc(new Date());
    await client.query(
      `INSERT INTO parametros_sistema (
         id, clave, valor_numerico, valor_texto, vigente_desde, vigente_hasta, descripcion
       ) VALUES (
         gen_random_uuid(), $1, $2, NULL, $3::date, NULL, $4
       )`,
      [
        LABOR_SYSTEM_PARAMETER_DEFS.platformReferenceYear.dbKey,
        validYear,
        effectiveFrom,
        `${LABOR_SYSTEM_PARAMETER_DEFS.platformReferenceYear.description}: ${validYear}`
      ]
    );
  }

  async syncKey(
    key: PortalSyncKey,
    data: unknown,
    userId: string,
    role: JwtRole,
    deletedIds?: string[]
  ) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const actorProfile = await this.resolvePortalActor(userId);
      const actor: PortalAuditActor = {
        userId,
        email: actorProfile.email,
        label: actorProfile.name || actorProfile.email || "Usuario"
      };
      const pendingUpserts = await preparePortalSyncUpsertAudits(client, key, data);
      await recordPortalSyncDeleteAudits(client, actor, key, deletedIds, data);
      await this.syncKeyTx(client, key, data, userId, role, deletedIds);
      await flushPortalSyncUpsertAudits(client, actor, key, pendingUpserts);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Aprueba un usuario en estado pendiente: empresa, rol (`rol_usuario`) y permisos alineados a app.js.
   * Auditoría: fecha_aprobacion_cuenta / cuenta_aprobada_por (script 15_usuario_aprobacion_admin.sql).
   */
  async approvePendingUser(
    actorUserId: string,
    actorRole: JwtRole,
    targetUserId: string,
    companyId: string,
    role: string,
    permissionsRequested?: string[]
  ) {
    await this.assertCanApprovePortalRegistration(actorUserId, actorRole);

    const cid = String(companyId || "").trim();
    const tid = String(targetUserId || "").trim();
    const rolDb = String(role || "client").trim().toLowerCase();
    if (!cid || !tid) throw new BadRequestException("Usuario y empresa son obligatorios");
    if (!APPROVE_VALID_ROLES.has(rolDb)) throw new BadRequestException("Rol no permitido para esta operación");

    if (!PG_UUID_V4_RE.test(cid)) {
      throw new BadRequestException(
        "El id de empresa no es un UUID válido. Cree la empresa de nuevo desde el panel con la sesión iniciada en el servidor, para que se guarde en la tabla empresas."
      );
    }
    if (!PG_UUID_V4_RE.test(tid)) {
      throw new BadRequestException("El id de usuario no es un UUID válido.");
    }

    const empRes = await this.pool.query<{ nombre: string }>(`SELECT nombre FROM empresas WHERE id = $1::uuid`, [cid]);
    if (!empRes.rowCount) throw new BadRequestException("Empresa no encontrada");

    const userRes = await this.pool.query<{ estado_cuenta: string }>(
      `SELECT estado_cuenta::text AS estado_cuenta FROM usuarios WHERE id = $1::uuid`,
      [tid]
    );
    let target = userRes.rows[0];
    if (!target) {
      // Auto-aprovisionar si el id existe en Supabase Auth pero falta la fila en `usuarios`.
      const provisioned = await this.provisionUsuariosFromAuthOrphan(tid).catch((err) => {
        this.logger.warn(
          `approvePendingUser: aprovisionamiento desde Supabase Auth falló: ${err instanceof Error ? err.message : String(err)}`
        );
        return null;
      });
      if (!provisioned) {
        throw new BadRequestException(
          "Usuario no encontrado en `usuarios` ni en Supabase Auth. Refresque la bandeja de Autorizaciones e intente de nuevo."
        );
      }
      target = { estado_cuenta: "pendiente" };
    }
    if (target.estado_cuenta !== "pendiente") {
      throw new BadRequestException("El usuario no está pendiente de aprobación");
    }

    const empresaNombre = empRes.rows[0].nombre;
    /**
     * Si el admin envió un set explícito de permisos desde el modal de aprobación, lo usamos
     * (filtrado contra el catálogo conocido, sin duplicados). Si no envía nada, caemos a los
     * permisos por defecto del rol.
     */
    const requestedSet = Array.isArray(permissionsRequested)
      ? [...new Set(
          permissionsRequested
            .map((p) => String(p || "").trim())
            .filter((p) => ALL_PORTAL_PERMISSIONS.includes(p))
        )]
      : [];
    const perms = requestedSet.length ? requestedSet : defaultPermissionsForApprovedRole(rolDb);

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE usuarios SET
          estado_cuenta = 'aprobado'::estado_cuenta_usuario,
          id_empresa = $2::uuid,
          nombre_empresa_texto_legacy = $3,
          rol = $5::rol_usuario,
          fecha_aprobacion_cuenta = now(),
          cuenta_aprobada_por = $4::uuid,
          fecha_ingreso_portal = COALESCE(fecha_ingreso_portal, CURRENT_DATE)
        WHERE id = $1::uuid`,
        [tid, cid, empresaNombre, actorUserId, rolDb]
      );

      await client.query(`DELETE FROM permisos_usuario WHERE id_usuario = $1::uuid`, [tid]);
      for (const perm of perms) {
        await client.query(
          `INSERT INTO permisos_usuario (id_usuario, permiso) VALUES ($1::uuid, $2)
           ON CONFLICT (id_usuario, permiso) DO NOTHING`,
          [tid, perm]
        );
      }

      const nameRes = await client.query<{ nombre_completo: string | null; correo_electronico: string | null }>(
        `SELECT nombre_completo, correo_electronico FROM usuarios WHERE id = $1::uuid`,
        [tid]
      );
      const approvedLabel =
        String(nameRes.rows[0]?.nombre_completo || nameRes.rows[0]?.correo_electronico || tid).trim();
      await insertPortalAuditEventTx(client, await this.portalAuditActor(actorUserId), {
        action: "update",
        moduleId: "authorizations",
        moduleLabel: "Autorizaciones",
        entityId: tid,
        entityLabel: approvedLabel,
        summary: `Cuenta aprobada · Rol ${rolDb} · ${empresaNombre}`
      });

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    /**
     * Correo de activación tras aprobación. Se ejecuta fuera de la transacción y de forma
     * fire-and-forget para no bloquear la respuesta al admin si Resend/Supabase tarda.
     */
    void this.sendAccountApprovedEmail(tid);

    return {
      ok: true,
      userId: tid,
      companyId: cid,
      companyName: empresaNombre,
      role: rolDb
    };
  }

  async adminSetUserStatus(
    actorUserId: string,
    actorRole: JwtRole,
    targetUserId: string,
    status: string,
    reasonRaw?: string
  ) {
    if (!this.isAdmin(actorRole)) throw new ForbiddenException();
    const tid = String(targetUserId || "").trim();
    const accountStatus = String(status || "").trim().toLowerCase();
    const reason = String(reasonRaw || "").trim();
    if (!tid) throw new BadRequestException("Usuario objetivo obligatorio");
    if (!["pendiente", "aprobado", "rechazado"].includes(accountStatus)) {
      throw new BadRequestException("Estado de cuenta no permitido");
    }
    if (accountStatus === "rechazado" && reason.length < 3) {
      throw new BadRequestException("Indique el motivo de desactivación (mínimo 3 caracteres).");
    }
    if (tid === actorUserId) throw new BadRequestException("No puedes cambiar tu propio estado de cuenta");

    const targetRes = await this.pool.query<{
      rol: string;
      correo_electronico: string | null;
      nombre_completo: string | null;
      estado_cuenta: string;
    }>(
      `SELECT rol::text AS rol,
              correo_electronico,
              nombre_completo,
              estado_cuenta::text AS estado_cuenta
         FROM usuarios
        WHERE id = $1::uuid`,
      [tid]
    );
    let target = targetRes.rows[0];
    if (!target) {
      // Huérfano de Supabase Auth: aprovisionamos antes de aplicar el cambio de estado.
      const provisioned = await this.provisionUsuariosFromAuthOrphan(tid).catch(() => null);
      if (!provisioned) throw new BadRequestException("Usuario no encontrado");
      target = { rol: "client", correo_electronico: null, nombre_completo: null, estado_cuenta: "pendiente" };
    }
    if (target.rol === "admin" && accountStatus !== "aprobado") {
      const adminsActive = await this.pool.query<{ total: string }>(
        `SELECT count(*)::text AS total
         FROM usuarios
         WHERE rol = 'admin'::rol_usuario
           AND estado_cuenta = 'aprobado'::estado_cuenta_usuario`
      );
      const total = Number(adminsActive.rows[0]?.total || 0);
      if (total <= 1) {
        throw new BadRequestException("No puedes desactivar al último administrador activo.");
      }
    }

    await this.pool.query(
      `UPDATE usuarios
       SET estado_cuenta = $2::estado_cuenta_usuario
       WHERE id = $1::uuid`,
      [tid, accountStatus]
    );
    const userLabel = String(target.nombre_completo || target.correo_electronico || tid).trim();
    await this.writePortalAuditEvent(actorUserId, {
      action: "update",
      moduleId: "users",
      moduleLabel: "Usuarios y permisos",
      entityId: tid,
      entityLabel: userLabel,
      summary:
        accountStatus === "rechazado" || accountStatus === "pendiente"
          ? `Estado de cuenta: ${accountStatus}${reason ? ` · Motivo: ${reason}` : ""}`
          : `Estado de cuenta: ${accountStatus}`
    });
    if (target.correo_electronico && target.estado_cuenta !== accountStatus) {
      const portalUrl = this.resolvePortalPublicUrl();
      const actor = await this.resolvePortalActor(actorUserId);
      const audit =
        accountStatus === "rechazado" || accountStatus === "pendiente"
          ? this.buildAccountActionAudit(actor, reason)
          : undefined;
      void this.mail
        .sendSecurityAccountStatusChangedAlert({
          to: target.correo_electronico,
          recipientName: String(target.nombre_completo || "").trim() || "Usuario",
          status: accountStatus as "pendiente" | "aprobado" | "rechazado",
          portalUrl,
          audit
        })
        .catch(() => null);
      if (accountStatus === "rechazado" || accountStatus === "pendiente") {
        void this.mail
          .sendAdminUserStatusChangedAlert({
            userEmail: target.correo_electronico,
            userName: String(target.nombre_completo || "").trim() || "Usuario",
            status: accountStatus as "pendiente" | "aprobado" | "rechazado",
            portalUrl,
            audit: audit ?? this.buildAccountActionAudit(actor, reason)
          })
          .catch(() => null);
      }
    }
    return { ok: true, userId: tid, status: accountStatus };
  }

  async adminUpdateUserCredentials(
    actorUserId: string,
    actorRole: JwtRole,
    targetUserId: string,
    emailRaw?: string,
    passwordRaw?: string
  ) {
    if (!this.isAdmin(actorRole)) throw new ForbiddenException();
    const tid = String(targetUserId || "").trim();
    if (!tid) throw new BadRequestException("Usuario objetivo obligatorio");

    const email = String(emailRaw || "").trim().toLowerCase();
    const password = String(passwordRaw || "").trim();
    if (!email && !password) {
      throw new BadRequestException("Debe indicar correo y/o contraseña.");
    }

    if (password) {
      if (password.length < 10) throw new BadRequestException("La contraseña debe tener al menos 10 caracteres.");
      if (!/[a-z]/.test(password)) throw new BadRequestException("La contraseña debe incluir una letra minúscula.");
      if (!/[A-Z]/.test(password)) throw new BadRequestException("La contraseña debe incluir una letra mayúscula.");
      if (!/[0-9]/.test(password)) throw new BadRequestException("La contraseña debe incluir un número.");
      if (!/[^A-Za-z0-9]/.test(password)) throw new BadRequestException("La contraseña debe incluir un símbolo.");
    }

    const targetRes = await this.pool.query<{ id: string; correo_electronico: string | null; nombre_completo: string | null }>(
      `SELECT id::text, correo_electronico, nombre_completo FROM usuarios WHERE id = $1::uuid`,
      [tid]
    );
    if (!targetRes.rows[0]) throw new BadRequestException("Usuario no encontrado.");

    try {
      if (email) {
        await this.pool.query(
          `UPDATE usuarios
           SET correo_electronico = $2,
               refresh_token_hash = NULL
           WHERE id = $1::uuid`,
          [tid, email]
        );
      }

      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await this.pool.query(
          `UPDATE usuarios
           SET hash_contrasena = $2,
               refresh_token_hash = NULL
           WHERE id = $1::uuid`,
          [tid, passwordHash]
        );
      }
    } catch (err) {
      const code = (err as { code?: string } | null)?.code || "";
      if (code === "23505") {
        throw new BadRequestException("El correo ya está en uso por otro usuario.");
      }
      throw err;
    }

    if (this.supabaseAdmin && (email || password)) {
      const authPatch: { email?: string; password?: string } = {};
      if (email) authPatch.email = email;
      if (password) authPatch.password = password;
      const { error: authErr } = await this.supabaseAdmin.auth.admin.updateUserById(tid, authPatch);
      if (authErr) {
        this.logger.warn(
          `adminUpdateUserCredentials: Supabase Auth no actualizado para ${tid}: ${sanitizeLogText(authErr.message)}`
        );
      }
    }

    if (password) {
      const notifyEmail = email || String(targetRes.rows[0].correo_electronico || "").trim().toLowerCase();
      if (notifyEmail) {
        void this.mail
          .sendSecurityPasswordChangedAlert({
            to: notifyEmail,
            recipientName: String(targetRes.rows[0].nombre_completo || "").trim() || notifyEmail,
            changedByAdmin: true
          })
          .catch(() => null);
      }
    }

    const userLabel = String(targetRes.rows[0].nombre_completo || targetRes.rows[0].correo_electronico || tid).trim();
    const changeParts: string[] = [];
    if (email) changeParts.push("correo actualizado");
    if (password) changeParts.push("contraseña actualizada");
    await this.writePortalAuditEvent(actorUserId, {
      action: "update",
      moduleId: "users",
      moduleLabel: "Usuarios y permisos",
      entityId: tid,
      entityLabel: userLabel,
      summary: changeParts.join(" · ") || "Credenciales actualizadas"
    });

    return { ok: true, userId: tid, emailUpdated: Boolean(email), passwordUpdated: Boolean(password) };
  }

  async adminClearUserSessions(actorUserId: string, actorRole: JwtRole, targetUserId?: string) {
    void actorUserId;
    if (!this.isAdmin(actorRole)) throw new ForbiddenException();
    const tid = String(targetUserId || "").trim();
    if (tid && !PG_UUID_V4_RE.test(tid)) throw new BadRequestException("Usuario objetivo inválido.");

    if (tid) {
      await this.pool.query(`DELETE FROM sesiones_usuario WHERE id_usuario = $1::uuid`, [tid]);
      await this.pool.query(`UPDATE usuarios SET refresh_token_hash = NULL WHERE id = $1::uuid`, [tid]);
      return { ok: true, scope: "user", userId: tid };
    }

    await this.pool.query(`DELETE FROM sesiones_usuario`);
    await this.pool.query(`UPDATE usuarios SET refresh_token_hash = NULL WHERE refresh_token_hash IS NOT NULL`);
    return { ok: true, scope: "all" };
  }

  /**
   * Cierre de sesión del propio usuario: invalida `refresh_token_hash` y borra
   * filas en `sesiones_usuario`. Tolera ausencia de la tabla (entornos nuevos)
   * y SIEMPRE limpia el hash en `usuarios`, para que el próximo `/api/auth/refresh`
   * con el token desechado devuelva 401 en lugar de aceptar reintentos.
   */
  async logoutSelf(userId: string) {
    const uid = String(userId || "").trim();
    if (!uid || !PG_UUID_V4_RE.test(uid)) {
      throw new BadRequestException("Usuario inválido para cierre de sesión.");
    }
    try {
      await this.pool.query(`DELETE FROM sesiones_usuario WHERE id_usuario = $1::uuid`, [uid]);
    } catch (err: any) {
      if (String(err?.code || "") !== "42P01") throw err;
    }
    await this.pool.query(`UPDATE usuarios SET refresh_token_hash = NULL WHERE id = $1::uuid`, [uid]);
    return { ok: true, userId: uid };
  }

  async adminDeleteUser(actorUserId: string, actorRole: JwtRole, targetUserId: string, motivoRaw: string) {
    if (!this.isAdmin(actorRole)) throw new ForbiddenException();
    const tid = String(targetUserId || "").trim();
    const motivo = String(motivoRaw || "").trim();
    if (!tid) throw new BadRequestException("Usuario objetivo obligatorio");
    if (motivo.length < 3) {
      throw new BadRequestException("Indique el motivo de eliminación (mínimo 3 caracteres).");
    }
    if (tid === actorUserId) throw new BadRequestException("No puedes eliminar tu propio usuario");

    const targetRes = await this.pool.query<{
      rol: string;
      correo_electronico: string | null;
      nombre_completo: string | null;
    }>(
      `SELECT rol::text AS rol, correo_electronico, nombre_completo FROM usuarios WHERE id = $1::uuid`,
      [tid]
    );
    const target = targetRes.rows[0];
    if (!target) {
      // Huérfano de Supabase Auth (sin fila en `usuarios`): basta con eliminarlo del proveedor de Auth.
      await this.deleteSupabaseAuthUser(tid);
      return { ok: true, userId: tid, deletedFromAuthOnly: true };
    }
    if (target.rol === "admin") {
      const adminsTotal = await this.pool.query<{ total: string }>(
        `SELECT count(*)::text AS total FROM usuarios WHERE rol = 'admin'::rol_usuario`
      );
      const total = Number(adminsTotal.rows[0]?.total || 0);
      if (total <= 1) {
        throw new BadRequestException("No puedes eliminar al último administrador.");
      }
    }

    const refReq = await this.pool.query<{ total: string }>(
      `SELECT count(*)::text AS total
       FROM solicitudes_transporte
       WHERE id_usuario_solicitante = $1::uuid`,
      [tid]
    );
    const requestsCount = Number(refReq.rows[0]?.total || 0);
    if (requestsCount > 0) {
      throw new BadRequestException(
        "No se puede eliminar este usuario porque tiene solicitudes asociadas. Desactivalo en su lugar."
      );
    }

    const portalUrl = this.resolvePortalPublicUrl();
    const actor = await this.resolvePortalActor(actorUserId);
    const audit = this.buildAccountActionAudit(actor, motivo);
    const userEmail = String(target.correo_electronico || "").trim().toLowerCase();
    const userName = String(target.nombre_completo || "").trim() || "Usuario";
    if (userEmail) {
      void this.mail
        .sendSecurityUserDeletedAlert({
          to: userEmail,
          recipientName: userName,
          portalUrl,
          audit
        })
        .catch(() => null);
      void this.mail
        .sendAdminUserDeletedAlert({
          userEmail,
          userName,
          portalUrl,
          audit
        })
        .catch(() => null);
    }

    await this.pool.query(`DELETE FROM usuarios WHERE id = $1::uuid`, [tid]);
    await this.writeAdminDeleteAudit(
      actorUserId,
      "users",
      "Usuarios y permisos",
      tid,
      userName,
      `Motivo: ${motivo}`
    );
    await this.deleteSupabaseAuthUser(tid);
    return { ok: true, userId: tid };
  }

  async adminDeleteCompany(actorUserId: string, actorRole: JwtRole, targetCompanyId: string) {
    if (!this.isAdmin(actorRole)) throw new ForbiddenException();
    const cid = String(targetCompanyId || "").trim();
    if (!cid || !PG_UUID_V4_RE.test(cid)) throw new BadRequestException("Empresa objetivo invalida");

    const uc = await this.pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM usuarios WHERE id_empresa = $1::uuid`,
      [cid]
    );
    if (Number(uc.rows[0]?.n || 0) > 0) {
      throw new BadRequestException(
        "Hay usuarios vinculados a esta empresa. Reasigne esas cuentas antes de eliminar."
      );
    }

    if (await this.tableExists("empleados_nomina")) {
      const ec = await this.pool.query<{ n: string }>(
        `SELECT count(*)::text AS n FROM empleados_nomina WHERE id_empresa = $1::uuid`,
        [cid]
      );
      if (Number(ec.rows[0]?.n || 0) > 0) {
        throw new BadRequestException(
          "Hay empleados en nomina con esta empresa. No se puede eliminar desde el portal."
        );
      }
    }

    try {
      const nameRes = await this.pool.query<{ nombre: string | null }>(
        `SELECT nombre FROM empresas WHERE id = $1::uuid`,
        [cid]
      );
      const companyName = String(nameRes.rows[0]?.nombre || "Empresa").trim();
      const del = await this.pool.query(`DELETE FROM empresas WHERE id = $1::uuid`, [cid]);
      if (del.rowCount === 0) throw new BadRequestException("Empresa no encontrada");
      await this.writeAdminDeleteAudit(
        actorUserId,
        "users",
        "Usuarios y permisos",
        cid,
        companyName,
        "Eliminación de empresa"
      );
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      if (/violates foreign key|foreign key constraint/i.test(msg)) {
        throw new BadRequestException(
          "No se puede eliminar: hay datos operativos que referencian esta empresa."
        );
      }
      throw e;
    }
    return { ok: true, companyId: cid };
  }

  async adminDeleteTransportRequest(
    actorUserId: string,
    actorRole: JwtRole,
    requestId: string,
    motivo: string
  ) {
    void actorUserId;
    if (!this.isAdmin(actorRole)) throw new ForbiddenException();
    const rid = String(requestId || "").trim();
    if (!rid || !PG_UUID_V4_RE.test(rid)) {
      throw new BadRequestException("ID de solicitud invalido");
    }
    const motivoTrim = String(motivo || "").trim();
    if (motivoTrim.length < 3) {
      throw new BadRequestException("Indique el motivo de eliminacion (minimo 3 caracteres).");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const tripCheck = await client.query(
        `SELECT 1 FROM viajes_transporte WHERE id_solicitud = $1::uuid LIMIT 1`,
        [rid]
      );
      if ((tripCheck.rowCount ?? 0) > 0) {
        await client.query("ROLLBACK");
        throw new BadRequestException(
          "Esta solicitud tiene un viaje asignado. Elimine primero el viaje en Transporte · Viajes (con motivo registrado) y luego podra eliminar la solicitud."
        );
      }
      const reqRes = await client.query(`SELECT * FROM solicitudes_transporte WHERE id = $1::uuid`, [rid]);
      if ((reqRes.rowCount ?? 0) === 0) {
        await client.query("ROLLBACK");
        throw new BadRequestException("Solicitud no encontrada.");
      }
      const srow = reqRes.rows[0];
      if (await this.tableExists("auditoria_solicitudes_eliminadas")) {
        await client.query(
          `INSERT INTO auditoria_solicitudes_eliminadas (id_solicitud, numero_solicitud, motivo, datos_json, eliminado_por)
           VALUES ($1::uuid, $2, $3, $4::jsonb, $5::uuid)`,
          [rid, srow.numero_solicitud, motivoTrim, JSON.stringify(this.buildDeletedRequestAuditSnapshot(srow)), actorUserId]
        );
        await this.pruneDeletionAuditTableTx(client, "auditoria_solicitudes_eliminadas");
      }
      await client.query(`DELETE FROM solicitudes_transporte WHERE id = $1::uuid`, [rid]);
      await recordPortalAdminDeleteAudit(
        client,
        await this.portalAuditActor(actorUserId),
        "requests",
        "Mis solicitudes",
        rid,
        String(srow.numero_solicitud || rid),
        `Motivo: ${motivoTrim}`
      );
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK").catch(() => null);
      if (e instanceof BadRequestException || e instanceof ForbiddenException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      if (/violates foreign key|foreign key constraint/i.test(msg)) {
        throw new BadRequestException("No se puede eliminar esta solicitud por datos vinculados.");
      }
      throw e;
    } finally {
      client.release();
    }
    return { ok: true, requestId: rid };
  }

  /**
   * Cliente: elimina físicamente una solicitud solo en estado **Pendiente** de su empresa
   * (o creada por el mismo usuario) y sin que haya sido aprobada.
   */
  async clientDeletePendingTransportRequest(
    actorUserId: string,
    actorRole: JwtRole,
    requestId: string,
    motivo: string
  ): Promise<{ ok: true; requestId: string }> {
    if (String(actorRole || "").toLowerCase() !== "client") throw new ForbiddenException();
    const rid = String(requestId || "").trim();
    if (!rid || !PG_UUID_V4_RE.test(rid)) {
      throw new BadRequestException("ID de solicitud invalido");
    }
    const motivoTrim = String(motivo || "").trim();
    if (motivoTrim.length < 3) {
      throw new BadRequestException("Indique el motivo de eliminacion (minimo 3 caracteres).");
    }
    const companyRaw = String((await this.getUserCompany(actorUserId)) ?? "").trim();
    const companyId = PG_UUID_V4_RE.test(companyRaw) ? companyRaw : null;

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const tripCheck = await client.query(
        `SELECT 1 FROM viajes_transporte WHERE id_solicitud = $1::uuid LIMIT 1`,
        [rid]
      );
      if ((tripCheck.rowCount ?? 0) > 0) {
        await client.query("ROLLBACK");
        throw new BadRequestException(
          "No se puede eliminar: la solicitud tiene un viaje asignado. Solicite a operaciones que quite el viaje primero."
        );
      }
      const reqRes = await client.query(
        `SELECT * FROM solicitudes_transporte s
         WHERE s.id = $1::uuid
           AND s.estado = 'Pendiente'::estado_solicitud_transporte
           AND (
             s.id_usuario_solicitante = $3::uuid
             OR ($2::uuid IS NOT NULL AND s.id_empresa_cliente = $2::uuid)
           )`,
        [rid, companyId, actorUserId]
      );
      if ((reqRes.rowCount ?? 0) === 0) {
        await client.query("ROLLBACK");
        throw new BadRequestException(
          "No se pudo eliminar: debe estar pendiente de aprobación y estar asociada a su empresa."
        );
      }
      const srow = reqRes.rows[0];
      if (await this.tableExists("auditoria_solicitudes_eliminadas")) {
        await client.query(
          `INSERT INTO auditoria_solicitudes_eliminadas (id_solicitud, numero_solicitud, motivo, datos_json, eliminado_por)
           VALUES ($1::uuid, $2, $3, $4::jsonb, $5::uuid)`,
          [rid, srow.numero_solicitud, motivoTrim, JSON.stringify(this.buildDeletedRequestAuditSnapshot(srow)), actorUserId]
        );
        await this.pruneDeletionAuditTableTx(client, "auditoria_solicitudes_eliminadas");
      }
      await client.query(`DELETE FROM solicitudes_transporte WHERE id = $1::uuid`, [rid]);
      await recordPortalAdminDeleteAudit(
        client,
        await this.portalAuditActor(actorUserId),
        "requests",
        "Mis solicitudes",
        rid,
        String(srow.numero_solicitud || rid),
        `Eliminación por cliente · Motivo: ${motivoTrim}`
      );
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK").catch(() => null);
      if (e instanceof BadRequestException || e instanceof ForbiddenException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      if (/violates foreign key|foreign key constraint/i.test(msg)) {
        throw new BadRequestException("No se puede eliminar esta solicitud por datos vinculados.");
      }
      throw e;
    } finally {
      client.release();
    }
    return { ok: true, requestId: rid };
  }

  async adminDeleteVehicle(actorUserId: string, actorRole: JwtRole, vehicleId: string) {
    if (!this.isAdmin(actorRole)) {
      const perms = await this.loadPortalPermissionSet(actorUserId);
      if (!this.canDeleteVehicleByPermission(perms)) throw new ForbiddenException();
    }
    const vid = String(vehicleId || "").trim();
    if (!vid || !PG_UUID_V4_RE.test(vid)) throw new BadRequestException("ID de vehiculo invalido");
    try {
      const plateRes = await this.pool.query<{ placa: string | null }>(
        `SELECT placa FROM vehiculos WHERE id = $1::uuid`,
        [vid]
      );
      const plate = String(plateRes.rows[0]?.placa || vid).trim();
      const del = await this.pool.query(`DELETE FROM vehiculos WHERE id = $1::uuid`, [vid]);
      if ((del.rowCount ?? 0) === 0) throw new BadRequestException("Vehiculo no encontrado.");
      await this.writeAdminDeleteAudit(
        actorUserId,
        "vehicles",
        "Camiones",
        vid,
        plate,
        "Eliminación de vehículo"
      );
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof ForbiddenException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      if (/foreign key|violates foreign key/i.test(msg)) {
        throw new BadRequestException(
          "No se puede eliminar: el vehiculo tiene viajes u otros registros asociados en base de datos."
        );
      }
      throw e;
    }
    return { ok: true, vehicleId: vid };
  }

  async adminDeleteDriver(actorUserId: string, actorRole: JwtRole, driverId: string) {
    void actorUserId;
    void actorRole;
    void driverId;
    throw new BadRequestException(
      "La baja del conductor se realiza en Gestión humana (empleados con rol conductor). El módulo Conductores no permite eliminar."
    );
  }

  async adminClearTripForRequest(
    actorUserId: string,
    actorRole: JwtRole,
    requestId: string,
    motivo: string
  ) {
    void actorUserId;
    if (!this.isTransportOps(actorRole)) throw new ForbiddenException();
    const rid = String(requestId || "").trim();
    if (!rid || !PG_UUID_V4_RE.test(rid)) throw new BadRequestException("Solicitud invalida");
    const motivoTrim = String(motivo || "").trim();
    if (motivoTrim.length < 3) {
      throw new BadRequestException("Indique el motivo de eliminacion (minimo 3 caracteres).");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const tripRes = await client.query(
        `SELECT v.*, s.numero_solicitud AS sol_numero_solicitud
         FROM viajes_transporte v
         JOIN solicitudes_transporte s ON s.id = v.id_solicitud
         WHERE v.id_solicitud = $1::uuid`,
        [rid]
      );
      if ((tripRes.rowCount ?? 0) === 0) {
        await client.query("ROLLBACK");
        throw new BadRequestException("Esta solicitud no tiene viaje asignado.");
      }
      const row = tripRes.rows[0] as Record<string, unknown> & { sol_numero_solicitud?: string };
      if (await this.tableExists("auditoria_viajes_eliminados")) {
        await client.query(
          `INSERT INTO auditoria_viajes_eliminados (
            id_solicitud, id_viaje, numero_solicitud, numero_viaje, motivo, datos_json, eliminado_por
          ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::jsonb, $7::uuid)`,
          [
            rid,
            row.id,
            row.sol_numero_solicitud || null,
            row.numero_viaje,
            motivoTrim,
            JSON.stringify(this.buildDeletedTripAuditSnapshot(row)),
            actorUserId
          ]
        );
        await this.pruneDeletionAuditTableTx(client, "auditoria_viajes_eliminados");
      }
      await client.query(`DELETE FROM viajes_transporte WHERE id_solicitud = $1::uuid`, [rid]);
      const up = await client.query(
        `UPDATE solicitudes_transporte
         SET estado = 'Aprobada pendiente asignacion'::estado_solicitud_transporte,
             fecha_entrega_efectiva = NULL,
             fecha_cierre = NULL,
             fecha_actualizacion = now()
         WHERE id = $1::uuid`,
        [rid]
      );
      if ((up.rowCount ?? 0) === 0) {
        await client.query("ROLLBACK");
        throw new BadRequestException("Solicitud no encontrada.");
      }
      await recordPortalAdminDeleteAudit(
        client,
        await this.portalAuditActor(actorUserId),
        "trips",
        "Viajes",
        String(row.id || rid),
        String(row.numero_viaje || row.sol_numero_solicitud || rid),
        `Desasignación de viaje · Motivo: ${motivoTrim}`
      );
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK").catch(() => null);
      if (e instanceof BadRequestException || e instanceof ForbiddenException) throw e;
      throw e;
    } finally {
      client.release();
    }
    return { ok: true, requestId: rid };
  }

  async adminDeletePayrollEmployee(actorUserId: string, actorRole: JwtRole, employeeId: string) {
    const permissionSet = this.isAdmin(actorRole)
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.resolveEffectivePermissionSet(actorUserId, actorRole);
    if (!this.isAdmin(actorRole) && !this.hasPortalPermission(permissionSet, "payroll_manage")) {
      throw new ForbiddenException();
    }
    const eid = String(employeeId || "").trim();
    if (!eid || !PG_UUID_V4_RE.test(eid)) throw new BadRequestException("ID de empleado invalido");
    if (!(await this.tableExists("empleados_nomina"))) {
      throw new BadRequestException("Tabla de nomina no disponible en esta base.");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const empRes = await client.query<{ numero_documento: string | null; rol_trabajador: string | null; nombre_completo: string | null }>(
        `SELECT numero_documento, rol_trabajador, nombre_completo FROM empleados_nomina WHERE id = $1::uuid`,
        [eid]
      );
      if (!empRes.rows.length) {
        await client.query("ROLLBACK");
        throw new BadRequestException("Empleado no encontrado.");
      }
      const doc = String(empRes.rows[0]?.numero_documento ?? "").trim();
      const empName = String(empRes.rows[0]?.nombre_completo ?? "").trim();
      const workerRole = String(empRes.rows[0]?.rol_trabajador ?? "")
        .trim()
        .toLowerCase();

      /* Conductores vinculados por documento. Solo bloquea la eliminación un viaje en estado
         ACTIVO o en progreso; los viajes cancelados, completados, cerrados o rechazados son
         historial y no impiden la baja (quedan con id_conductor en NULL y sus datos snapshot). */
      let linkedDriverIds: string[] = [];
      if (doc && (await this.tableExists("conductores"))) {
        const driverRows = await client.query<{ id: string }>(
          `SELECT id::text AS id FROM conductores
           WHERE regexp_replace(trim(coalesce(numero_documento, '')), '[^0-9]', '', 'g')
             = regexp_replace(trim($1), '[^0-9]', '', 'g')`,
          [doc]
        );
        linkedDriverIds = driverRows.rows.map((r) => String(r.id));
      }
      if (
        linkedDriverIds.length &&
        (await this.tableExists("viajes_transporte")) &&
        (await this.tableExists("solicitudes_transporte"))
      ) {
        const active = await client.query<{ total: number; numeros: string[] | null }>(
          `SELECT count(*)::int AS total,
                  (array_agg(v.numero_viaje ORDER BY v.fecha_hora_recogida_programada))[1:5] AS numeros
           FROM viajes_transporte v
           JOIN solicitudes_transporte s ON s.id = v.id_solicitud
           WHERE v.id_conductor = ANY($1::uuid[])
             AND s.estado IN (
               'Viaje asignado'::estado_solicitud_transporte,
               'En transito'::estado_solicitud_transporte,
               'Espera standby'::estado_solicitud_transporte
             )`,
          [linkedDriverIds]
        );
        const activeTrips = Number(active.rows[0]?.total ?? 0);
        if (activeTrips > 0) {
          await client.query("ROLLBACK");
          const nums = (active.rows[0]?.numeros || []).filter(Boolean).join(", ");
          throw new BadRequestException(
            `No se puede eliminar: el conductor vinculado tiene ${activeTrips} viaje(s) activo(s) o en progreso${nums ? ` (${nums})` : ""}. ` +
              "Complete, cancele o reasigne esos viajes primero. Los viajes cancelados o finalizados no bloquean la eliminación."
          );
        }
      }

      if (await this.tableExists("liquidaciones_nomina")) {
        await client.query(`DELETE FROM liquidaciones_nomina WHERE id_empleado = $1::uuid`, [eid]);
      }
      if (await this.tableExists("ausencias_laborales")) {
        await client.query(`DELETE FROM ausencias_laborales WHERE id_empleado = $1::uuid`, [eid]);
      }
      if (await this.tableExists("registros_cumplimiento_sst")) {
        await client.query(`DELETE FROM registros_cumplimiento_sst WHERE id_empleado = $1::uuid`, [eid]);
      }

      let driversRemoved = 0;
      if (linkedDriverIds.length) {
        if (await this.tableExists("viajes_transporte")) {
          /* Historial (cancelados/cerrados/completados): conservar el viaje, soltar el vínculo. */
          await client.query(
            `UPDATE viajes_transporte SET id_conductor = NULL WHERE id_conductor = ANY($1::uuid[])`,
            [linkedDriverIds]
          );
        }
        const delDrivers = await client.query(`DELETE FROM conductores WHERE id = ANY($1::uuid[])`, [
          linkedDriverIds
        ]);
        driversRemoved = delDrivers.rowCount ?? 0;
      }

      const del = await client.query(`DELETE FROM empleados_nomina WHERE id = $1::uuid`, [eid]);
      if ((del.rowCount ?? 0) === 0) {
        await client.query("ROLLBACK");
        throw new BadRequestException("Empleado no encontrado.");
      }

      await recordPortalAdminDeleteAudit(
        client,
        await this.portalAuditActor(actorUserId),
        "payroll",
        "Gestión humana",
        eid,
        empName || (doc ? `Doc. ${doc}` : "Colaborador"),
        "Eliminación de colaborador en nómina"
      );

      await client.query("COMMIT");
      const actor = await this.resolvePortalActor(actorUserId);
      this.logger.log(
        `Empleado nómina eliminado (${eid}) por ${actor.name || actor.email || actorUserId}` +
          (driversRemoved ? `; conductores vinculados removidos: ${driversRemoved}` : "")
      );
      return {
        ok: true,
        employeeId: eid,
        driversRemoved,
        wasDriver: workerRole === "conductor"
      };
    } catch (e) {
      await client.query("ROLLBACK").catch(() => null);
      if (e instanceof BadRequestException || e instanceof ForbiddenException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      if (/not-null constraint|violates not-null/i.test(msg)) {
        /* Esquema sin actualizar (id_conductor aún NOT NULL): la autocura corre al arrancar la API. */
        throw new BadRequestException(
          "No se pudo desvincular el historial de viajes del conductor. Reinicie la API para aplicar la actualización de esquema e intente de nuevo."
        );
      }
      if (/foreign key|violates foreign key/i.test(msg)) {
        throw new BadRequestException(
          "No se pudo eliminar el conductor vinculado: tiene viajes u otros registros asociados. Retire o reasigne esos datos primero."
        );
      }
      throw e;
    } finally {
      client.release();
    }
  }

  private async deleteSupabaseAuthUser(userId: string) {
    if (!this.supabaseAdmin || !userId) return;
    await this.supabaseAdmin.auth.admin.deleteUser(userId).catch(() => null);
  }

  private async syncKeyTx(
    c: PoolClient,
    key: PortalSyncKey,
    data: unknown,
    userId: string,
    role: JwtRole,
    deletedIds?: string[]
  ) {
    data = sanitizeSyncKeyPayload(data);
    const admin = this.isAdmin(role);
    const permissionSet = admin
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.resolveEffectivePermissionSet(userId, role);
    const can = (permission: string) => admin || this.hasPortalPermission(permissionSet, permission);
    switch (key) {
      case "users":
        await this.syncUsers(c, data, userId, role);
        return;
      case "companies":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncCompanies(c, data);
        return;
      case "counters":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncCounters(c, data);
        return;
      case "contacts":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncContacts(c, data);
        return;
      case "requests":
        await this.syncRequests(c, data, userId, role);
        return;
      case "vehicles":
        if (!admin && !this.canSyncVehicles(permissionSet)) throw new ForbiddenException();
        await this.syncVehicles(c, data);
        return;
      case "drivers":
        if (!can("transport_drivers")) throw new ForbiddenException();
        await this.syncDrivers(c, data);
        return;
      case "notifications":
        await this.syncNotifications(c, data, userId, role, deletedIds);
        return;
      case "emails":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncEmails(c, data);
        return;
      case "payrollEmployees":
        if (!can("payroll_manage")) throw new ForbiddenException();
        await this.syncPayrollEmployees(c, data, deletedIds);
        try {
          await this.refreshPayrollDraftsAfterEmployeesSync(c, data);
        } catch (e) {
          this.logger.warn(
            `Borradores de nómina tras sync empleados: ${e instanceof Error ? e.message : String(e)}`
          );
        }
        return;
      case "payrollRuns":
        if (!can("payroll_manage")) throw new ForbiddenException();
        await this.syncPayrollRuns(c, data, deletedIds);
        return;
      case "fuelLogs":
        if (!can("transport_history")) throw new ForbiddenException();
        await this.syncFuelLogs(c, data);
        return;
      case "vehicleTechnicalLogs":
        if (!can("transport_history")) throw new ForbiddenException();
        await this.syncVehicleTechnicalLogs(c, data);
        return;
      case "travelAllowanceRules":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncTravelAllowanceRules(c, data);
        return;
      case "vacancies":
      case "candidates":
      case "interviews":
      case "contracts":
      case "positions":
        if (!can("hiring_manage")) throw new ForbiddenException();
        await this.syncHrKeys(c, key, data, deletedIds);
        return;
      case "hrAbsences":
        if (!can("payroll_manage")) throw new ForbiddenException();
        await this.syncHrAbsences(c, data, deletedIds);
        await this.refreshPayrollDraftsAfterHrAbsencesSync(c, data);
        return;
      case "sstCompliance":
        if (!can("sst_compliance")) throw new ForbiddenException();
        await this.syncSst(c, data, deletedIds);
        return;
      case "tripRouteRates":
        if (!can("transport_trips")) throw new ForbiddenException();
        await this.syncTripRouteRates(c, data, deletedIds);
        return;
      case "approvals":
        await this.syncApprovals(c, data, userId, role);
        return;
      default:
        throw new ForbiddenException("Clave no soportada");
    }
  }

  /* ─── Loaders ─── */

  private async loadCompanies(onlyCompanyId: string | null = null) {
    const hasScopedCompany = Boolean(onlyCompanyId && PG_UUID_V4_RE.test(String(onlyCompanyId).trim()));
    const r = hasScopedCompany
      ? await this.pool.query(
          `SELECT id::text, nombre AS name, nit, telefono AS phone,
                  correo_empresarial AS email,
                  nombre_contacto AS "contactName",
                  departamento AS department,
                  ciudad AS city,
                  direccion_operativa AS address,
                  url_logo AS "logoUrl",
                  tipo_relacion_empresa::text AS "companyKind",
                  COALESCE(activo, true) AS activo,
                  fecha_creacion AS "createdAt",
                  fecha_actualizacion AS "updatedAt",
                  creado_por AS "createdBy",
                  actualizado_por AS "updatedBy"
           FROM empresas
           WHERE id = $1::uuid
           ORDER BY nombre`,
          [String(onlyCompanyId).trim()]
        )
      : await this.pool.query(
          `SELECT id::text, nombre AS name, nit, telefono AS phone,
                  correo_empresarial AS email,
                  nombre_contacto AS "contactName",
                  departamento AS department,
                  ciudad AS city,
                  direccion_operativa AS address,
                  url_logo AS "logoUrl",
                  tipo_relacion_empresa::text AS "companyKind",
                  COALESCE(activo, true) AS activo,
                  fecha_creacion AS "createdAt",
                  fecha_actualizacion AS "updatedAt",
                  creado_por AS "createdBy",
                  actualizado_por AS "updatedBy"
           FROM empresas ORDER BY nombre`
        );
    return r.rows.map((row) => {
      const rec = row as Record<string, unknown>;
      const id = String(rec.id ?? "").trim();
      const name = String(pickPortalField(rec, "name", "nombre") ?? rec.name ?? rec.nombre ?? "").trim();
      const nit = String(pickPortalField(rec, "nit", "taxId") ?? rec.nit ?? "").trim();
      const phoneVal = pickPortalField(rec, "phone", "telefono");
      const phone = phoneVal == null ? "" : String(phoneVal).trim();
      const emailVal = pickPortalField(rec, "email", "correo_empresarial", "correo");
      const email = emailVal == null ? "" : String(emailVal).trim();
      const contactVal = pickPortalField(rec, "contactName", "nombre_contacto");
      const contactName = contactVal == null ? "" : String(contactVal).trim();
      const deptVal = pickPortalField(rec, "department", "departamento");
      const department = deptVal == null ? "" : String(deptVal).trim();
      const cityVal = pickPortalField(rec, "city", "ciudad");
      const city = cityVal == null ? "" : String(cityVal).trim();
      const addrVal = pickPortalField(rec, "address", "direccion_operativa", "direccion");
      const address = addrVal == null ? "" : String(addrVal).trim();
      const logoVal = pickPortalField(rec, "logoUrl", "url_logo", "urlLogo");
      const logoUrl = logoVal == null ? "" : String(logoVal).trim();
      const kindVal = pickPortalField(rec, "companyKind", "company_kind", "tipo_relacion_empresa");
      const companyKindRaw = kindVal == null ? "" : String(kindVal).trim().toLowerCase();
      const companyKind =
        companyKindRaw === "tercero" ? "tercero" : companyKindRaw === "propia" ? "propia" : "cliente";
      const createdAt = rec.createdAt;
      const updatedAt = rec.updatedAt;
      return {
        id,
        name,
        nit,
        taxId: nit,
        phone,
        email,
        contactName,
        department,
        city,
        address,
        logoUrl,
        companyKind,
        active: rec.activo !== false,
        createdBy: String(pickPortalField(rec, "createdBy", "creado_por") ?? "").trim() || null,
        updatedBy: String(pickPortalField(rec, "updatedBy", "actualizado_por") ?? "").trim() || null,
        createdAt: createdAt ? new Date(createdAt as string | number | Date).toISOString() : new Date().toISOString(),
        updatedAt: updatedAt ? new Date(updatedAt as string | number | Date).toISOString() : null
      };
    });
  }

  private async loadUsers(
    admin: boolean,
    userId: string,
    empresaId: string | null,
    viewerRole: JwtRole,
    exposeSensitiveAcrossDirectory: boolean
  ) {
    const includePendingWithoutCompany = false;

    const sql = admin
      ? `SELECT u.id::text, u.correo_electronico AS email, u.nombre_completo AS name, u.rol::text AS role,
              u.estado_cuenta::text AS "accountStatus", u.id_empresa::text AS "companyId",
              COALESCE(NULLIF(trim(u.nombre_empresa_texto_legacy), ''), NULLIF(trim(e.nombre), ''), '') AS company,
              u.primer_nombre AS "firstName", u.segundo_nombre AS "middleName", u.primer_apellido AS "lastName",
              u.segundo_apellido AS "secondLastName", u.tipo_persona AS "personType", u.tipo_documento AS "documentType",
              u.numero_identificacion AS "personalDoc",
              u.nit_empresa_registro AS "companyNit",
              COALESCE(u.nit_empresa_registro, u.numero_identificacion) AS "taxId",
              u.fecha_expedicion_documento AS "documentIssuedAt",
              u.fecha_nacimiento AS "birthDate", u.genero AS gender, u.cargo_registro AS position, u.area_trabajo AS "workArea",
              u.telefono AS phone, u.departamento AS department, u.ciudad AS city, u.direccion AS address,
              u.contacto_emergencia AS "emergencyContact", u.telefono_emergencia AS "emergencyPhone",
              u.parentesco_emergencia AS "emergencyRelationship", u.url_avatar AS "avatarUrl",
              u.autenticacion_dos_factores AS "twoFactorEnabled",
              u.tipo_vinculo_registro::text AS "registrationKind",
              u.fecha_ingreso_portal AS "portalSince", u.fecha_creacion AS "createdAt"
         FROM usuarios u
         LEFT JOIN empresas e ON e.id = u.id_empresa
         ORDER BY u.correo_electronico`
      : `SELECT u.id::text, u.correo_electronico AS email, u.nombre_completo AS name, u.rol::text AS role,
              u.estado_cuenta::text AS "accountStatus", u.id_empresa::text AS "companyId",
              COALESCE(NULLIF(trim(u.nombre_empresa_texto_legacy), ''), NULLIF(trim(e.nombre), ''), '') AS company,
              u.primer_nombre AS "firstName", u.segundo_nombre AS "middleName", u.primer_apellido AS "lastName",
              u.segundo_apellido AS "secondLastName", u.tipo_persona AS "personType", u.tipo_documento AS "documentType",
              u.numero_identificacion AS "personalDoc",
              u.nit_empresa_registro AS "companyNit",
              COALESCE(u.nit_empresa_registro, u.numero_identificacion) AS "taxId",
              u.fecha_expedicion_documento AS "documentIssuedAt",
              u.fecha_nacimiento AS "birthDate", u.genero AS gender, u.cargo_registro AS position, u.area_trabajo AS "workArea",
              u.telefono AS phone, u.departamento AS department, u.ciudad AS city, u.direccion AS address,
              u.contacto_emergencia AS "emergencyContact", u.telefono_emergencia AS "emergencyPhone",
              u.parentesco_emergencia AS "emergencyRelationship", u.url_avatar AS "avatarUrl",
              u.autenticacion_dos_factores AS "twoFactorEnabled",
              u.tipo_vinculo_registro::text AS "registrationKind",
              u.fecha_ingreso_portal AS "portalSince", u.fecha_creacion AS "createdAt"
         FROM usuarios u
         LEFT JOIN empresas e ON e.id = u.id_empresa
         WHERE u.id = $1::uuid OR ($2::uuid IS NOT NULL AND u.id_empresa = $2::uuid)
            OR ($3::boolean = true AND u.estado_cuenta = 'pendiente'::estado_cuenta_usuario)`;

    const r = admin
      ? await this.pool.query(sql)
      : await this.pool.query(sql, [userId, empresaId, includePendingWithoutCompany]);

    const dbUsers = await this.finalizePortalUserRowsFromJoin(r.rows, userId, exposeSensitiveAcrossDirectory);
    if (!admin) return dbUsers;
    // Solo admin: surface Supabase Auth orphans para que aparezcan en Autorizaciones.
    const orphans = await this.loadSupabaseAuthOrphans(dbUsers);
    return [...dbUsers, ...orphans];
  }

  /**
   * Perfil propio del usuario autenticado: payload mínimo para que Mi perfil funcione
   * aunque /portal/bootstrap falle (p. ej. esquema con columnas faltantes en otra tabla).
   * Usa el mismo finalize que loadUsers para que los campos coincidan 1:1 con el bootstrap.
   */
  async getOwnProfile(userId: string) {
    const r = await this.pool.query(
      `SELECT u.id::text, u.correo_electronico AS email, u.nombre_completo AS name, u.rol::text AS role,
              u.estado_cuenta::text AS "accountStatus", u.id_empresa::text AS "companyId",
              COALESCE(NULLIF(trim(u.nombre_empresa_texto_legacy), ''), NULLIF(trim(e.nombre), ''), '') AS company,
              u.primer_nombre AS "firstName", u.segundo_nombre AS "middleName", u.primer_apellido AS "lastName",
              u.segundo_apellido AS "secondLastName", u.tipo_persona AS "personType", u.tipo_documento AS "documentType",
              u.numero_identificacion AS "personalDoc",
              u.nit_empresa_registro AS "companyNit",
              COALESCE(u.nit_empresa_registro, u.numero_identificacion) AS "taxId",
              u.fecha_expedicion_documento AS "documentIssuedAt",
              u.fecha_nacimiento AS "birthDate", u.genero AS gender, u.cargo_registro AS position, u.area_trabajo AS "workArea",
              u.telefono AS phone, u.departamento AS department, u.ciudad AS city, u.direccion AS address,
              u.contacto_emergencia AS "emergencyContact", u.telefono_emergencia AS "emergencyPhone",
              u.parentesco_emergencia AS "emergencyRelationship", u.url_avatar AS "avatarUrl",
              u.autenticacion_dos_factores AS "twoFactorEnabled",
              u.tipo_vinculo_registro::text AS "registrationKind",
              u.fecha_ingreso_portal AS "portalSince", u.fecha_creacion AS "createdAt"
         FROM usuarios u
         LEFT JOIN empresas e ON e.id = u.id_empresa
         WHERE u.id = $1::uuid
         LIMIT 1`,
      [userId]
    );
    if (!r.rows.length) {
      throw new BadRequestException("Usuario no encontrado");
    }
    const [row] = await this.finalizePortalUserRowsFromJoin(r.rows, userId, true);
    if (!row) return null;
    return this.enrichPortalUserProfileFromPayrollEmployee(row);
  }

  /**
   * Altas de portal con estado pendiente (solo JWT admin).
   * Permite hidratar la bandeja aunque falle o incompleto GET /portal/bootstrap.
   * Combina filas en `usuarios` con `estado_cuenta='pendiente'` y huérfanos de Supabase Auth.
   */
  async getPendingUserRegistrations(actorUserId: string, role: JwtRole) {
    if (!this.isAdmin(role)) {
      const perms = await this.loadPortalPermissionSet(actorUserId);
      if (!this.canApprovePortalRegistration(perms)) return [];
    }
    const sql = `SELECT u.id::text, u.correo_electronico AS email, u.nombre_completo AS name, u.rol::text AS role,
              u.estado_cuenta::text AS "accountStatus", u.id_empresa::text AS "companyId",
              COALESCE(NULLIF(trim(u.nombre_empresa_texto_legacy), ''), NULLIF(trim(e.nombre), ''), '') AS company,
              u.primer_nombre AS "firstName", u.segundo_nombre AS "middleName", u.primer_apellido AS "lastName",
              u.segundo_apellido AS "secondLastName", u.tipo_persona AS "personType", u.tipo_documento AS "documentType",
              u.numero_identificacion AS "personalDoc",
              u.nit_empresa_registro AS "companyNit",
              COALESCE(u.nit_empresa_registro, u.numero_identificacion) AS "taxId",
              u.fecha_expedicion_documento AS "documentIssuedAt",
              u.fecha_nacimiento AS "birthDate", u.genero AS gender, u.cargo_registro AS position, u.area_trabajo AS "workArea",
              u.telefono AS phone, u.departamento AS department, u.ciudad AS city, u.direccion AS address,
              u.contacto_emergencia AS "emergencyContact", u.telefono_emergencia AS "emergencyPhone",
              u.parentesco_emergencia AS "emergencyRelationship", u.url_avatar AS "avatarUrl",
              u.autenticacion_dos_factores AS "twoFactorEnabled",
              u.tipo_vinculo_registro::text AS "registrationKind",
              u.fecha_ingreso_portal AS "portalSince", u.fecha_creacion AS "createdAt"
         FROM usuarios u
         LEFT JOIN empresas e ON e.id = u.id_empresa
         WHERE u.estado_cuenta = 'pendiente'::estado_cuenta_usuario
         ORDER BY u.fecha_creacion DESC NULLS LAST`;
    const r = await this.pool.query(sql);
    const dbPending = await this.finalizePortalUserRowsFromJoin(r.rows, "", true);
    // También leemos *todos* los usuarios para no marcar como huérfano a uno ya aprobado en BD.
    const allRes = await this.pool.query<{ id: string; email: string }>(
      `SELECT id::text, lower(correo_electronico) AS email FROM usuarios`
    );
    const orphans = await this.loadSupabaseAuthOrphans(allRes.rows);
    return [...dbPending, ...orphans];
  }

  private async finalizePortalUserRowsFromJoin(
    rawRows: Array<Record<string, unknown>>,
    viewerUserId = "",
    exposeSensitiveAcrossDirectory = false
  ) {
    const ids = rawRows.map((x) => x.id as string);
    const permMap = new Map<string, string[]>();
    if (ids.length) {
      const p = await this.pool.query(`SELECT id_usuario::text AS uid, permiso FROM permisos_usuario WHERE id_usuario = ANY($1::uuid[])`, [
        ids
      ]);
      for (const row of p.rows) {
        const arr = permMap.get(row.uid) || [];
        arr.push(row.permiso);
        permMap.set(row.uid, arr);
      }
    }

    return rawRows.map((row) => {
      const createdIso = row.createdAt ? new Date(row.createdAt as string).toISOString() : "";
      const portalSinceStr = row.portalSince
        ? new Date(row.portalSince as string).toISOString().slice(0, 10)
        : "";
      const rid = row.id as string;
      const baseRow = {
        ...row,
        password: "",
        permissions: permMap.get(rid) || [],
        source: "portal_db",
        documentIssuedAt: row.documentIssuedAt
          ? new Date(row.documentIssuedAt as string).toISOString().slice(0, 10)
          : "",
        birthDate: row.birthDate ? new Date(row.birthDate as string).toISOString().slice(0, 10) : "",
        company: row.company || "",
        createdAt: createdIso,
        registeredAt: createdIso,
        emergencyRelation: String(
          (row as { emergencyRelationship?: string }).emergencyRelationship ??
            (row as { emergencyRelation?: string }).emergencyRelation ??
            ""
        ),
        emergencyRelationship: String(
          (row as { emergencyRelationship?: string }).emergencyRelationship ??
            (row as { emergencyRelation?: string }).emergencyRelation ??
            ""
        ),
        systemJoinDate: portalSinceStr,
        portalSince: portalSinceStr
      };
      const isSelf = Boolean(viewerUserId) && String(rid) === String(viewerUserId);
      if (exposeSensitiveAcrossDirectory || isSelf) return baseRow;
      return redactPortalUserDirectoryFields(baseRow);
    });
  }

  private async loadCounters() {
    const r = await this.pool.query(`SELECT prefijo, ultimo_valor FROM contadores_secuencia`);
    const out: Record<string, number> = {};
    for (const row of r.rows) {
      const k = String(row.prefijo);
      out[k] = Number(row.ultimo_valor);
    }
    return out;
  }

  private async loadTravelAllowanceRules() {
    const r = await this.pool.query(
      `SELECT valor_viaje_interdepartamental_cop, fecha_actualizacion
       FROM reglas_viatico_interdepartamental WHERE id = 1`
    );
    const v = r.rows[0] ? Number(r.rows[0].valor_viaje_interdepartamental_cop) : 85000;
    return {
      interDepartmentTripAmount: v,
      updatedAt: r.rows[0]?.fecha_actualizacion ? new Date(r.rows[0].fecha_actualizacion).toISOString() : null
    };
  }

  private async loadTripRouteRates() {
    /**
     * Si la BD no tiene corrida la migración `09_tarifas_trayecto_clientes.sql`
     * (la columna `ids_empresas` aún no existe), caemos a SELECT sin esa columna
     * para no tumbar todo el bootstrap. La autocura se hace en onModuleInit.
     */
    const out: Record<
      string,
      { value: number; companyIds: string[]; id?: string; createdAt?: string | null; updatedAt?: string | null }
    > = {};
    const SEP = "@@";
    let rows: Array<Record<string, unknown>>;
    try {
      const r = await this.pool.query(
        `SELECT id::text, departamento_origen, ciudad_origen, departamento_destino, ciudad_destino,
                valor_tarifa_cop, ids_empresas, fecha_creacion, fecha_actualizacion
         FROM tarifas_trayecto WHERE activo = true`
      );
      rows = r.rows as Array<Record<string, unknown>>;
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      const msg = err instanceof Error ? err.message : String(err);
      const isMissingColumn = code === "42703" && /ids_empresas/i.test(msg);
      if (!isMissingColumn) throw err;
      this.logger.warn(
        "loadTripRouteRates: columna ids_empresas no existe; usando fallback sin segmentación por cliente. " +
          "Reinicie la API (auto-cura ids_empresas) o ejecute npm run db:migrate / esquema 04+07 unificado."
      );
      const r2 = await this.pool.query(
        `SELECT id::text, departamento_origen, ciudad_origen, departamento_destino, ciudad_destino,
                valor_tarifa_cop, fecha_creacion, fecha_actualizacion
         FROM tarifas_trayecto WHERE activo = true`
      );
      rows = r2.rows as Array<Record<string, unknown>>;
    }
    for (const row of rows) {
      const o = `${String(row.departamento_origen || "").trim()}|${String(row.ciudad_origen || "").trim()}`.toLowerCase();
      const d = `${String(row.departamento_destino || "").trim()}|${String(row.ciudad_destino || "").trim()}`.toLowerCase();
      const routeKey = `${o}->${d}`;
      const rawIds = (row as { ids_empresas?: unknown }).ids_empresas;
      const companyIds = Array.isArray(rawIds) ? rawIds.map((id) => String(id)) : [];
      const suffix = companyIds.length ? companyIds.slice().sort().join(",") : "*";
      const storageKey = `${routeKey}${SEP}${suffix}`;
      out[storageKey] = {
        value: Number(row.valor_tarifa_cop),
        companyIds,
        id: row.id != null ? String(row.id) : undefined,
        createdAt: row.fecha_creacion ? new Date(String(row.fecha_creacion)).toISOString() : null,
        updatedAt: row.fecha_actualizacion ? new Date(String(row.fecha_actualizacion)).toISOString() : null
      };
    }
    return out;
  }

  private async loadRequests(
    admin: boolean,
    userId: string,
    empresaId: string | null,
    transport: boolean,
    role: JwtRole
  ) {
    const base = `
      SELECT s.id::text,
             s.numero_solicitud AS "requestNumber",
             s.id_usuario_solicitante::text AS "clientUserId",
             s.id_empresa_cliente::text AS "clientCompanyId",
             NULLIF(trim(COALESCE(ec.url_logo, '')), '') AS "clientCompanyLogoUrl",
             s.nombre_cliente AS "clientName",
             s.nombre_quien_solicita AS "requestedByName",
             s.departamento_origen AS "originDepartment",
             s.ciudad_origen AS "originCity",
             s.direccion_origen AS "originAddress",
             s.departamento_destino AS "destinationDepartment",
             s.ciudad_destino AS "destinationCity",
             s.direccion_destino AS "destinationAddress",
             s.fecha_hora_recogida AS "pickupAt",
             s.fecha_hora_entrega_estimada AS "etaDelivery",
             s.tipo_vehiculo_solicitado AS "vehicleType",
             s.descripcion_carga AS "cargoDescription",
             s.tipo_servicio AS "serviceType",
             s.refrigeracion_termoking AS "refrigeracionTermoking",
             s.numero_cajas AS "boxesCount",
             s.peso_kg AS "weightKg",
             s.numero_fuelles AS "fuelles",
             s.nombre_contacto_en_sitio AS "contactName",
             s.telefono_contacto_en_sitio AS "contactPhone",
             s.observaciones AS observations,
             s.estado::text AS status,
             s.valor_tarifa_viaje AS "tripValue",
             s.valor_asegurado AS "insuredValue",
             s.total_cargos_standby AS "standbyChargeTotal",
             s.eventos_standby_json AS "standbyEvents",
             s.motivo_rechazo AS "rejectionReason",
             s.fecha_aprobacion AS "approvedAt",
             s.aprobado_por AS "approvedBy",
             s.aprobacion_automatica AS "autoApproved",
             s.fecha_entrega_efectiva AS "deliveredAt",
             s.fecha_cierre AS "closedAt",
             s.fecha_creacion AS "createdAt",
             s.fecha_actualizacion AS "updatedAt",
             s.distancia_km AS "distanceKm",
             v.id::text AS "trip_id",
             v.numero_viaje AS "trip_tripNumber",
             v.id_vehiculo::text AS "trip_vehicleId",
             v.placa_vehiculo AS "trip_vehiclePlate",
             v.tipo_vehiculo_asignado AS "trip_vehicleType",
             v.id_conductor::text AS "trip_driverId",
             v.nombre_conductor AS "trip_driverName",
             v.telefono_conductor AS "trip_driverPhone",
             v.descripcion_ruta AS "trip_route",
             v.fecha_hora_recogida_programada AS "trip_etaPickup",
             v.fecha_hora_entrega_programada AS "trip_etaDelivery",
             v.asignado_por AS "trip_assignedBy",
             v.fecha_hora_asignacion AS "trip_assignedAt",
             v.estado_operativo_en_vivo AS "trip_realtimeStatus",
             v.datos_factura_json AS "trip_invoice",
             v.fecha_creacion AS "trip_createdAt",
             v.fecha_actualizacion AS "trip_updatedAt"
      FROM solicitudes_transporte s
      LEFT JOIN viajes_transporte v ON v.id_solicitud = s.id
      LEFT JOIN empresas ec ON ec.id = s.id_empresa_cliente`;

    let r;
    if (admin || transport) {
      r = await this.pool.query(base + ` ORDER BY s.fecha_creacion DESC`);
    } else if (this.isPortalClientRole(role)) {
      if (empresaId) {
        r = await this.pool.query(
          base + ` WHERE s.id_empresa_cliente = $1::uuid ORDER BY s.fecha_creacion DESC`,
          [empresaId]
        );
      } else {
        r = await this.pool.query(
          base + ` WHERE s.id_usuario_solicitante = $1::uuid ORDER BY s.fecha_creacion DESC`,
          [userId]
        );
      }
    } else {
      r = await this.pool.query(
        base +
          ` WHERE s.id_usuario_solicitante = $1::uuid OR ($2::uuid IS NOT NULL AND s.id_empresa_cliente = $2::uuid) ORDER BY s.fecha_creacion DESC`,
        [userId, empresaId]
      );
    }

    return r.rows.map((row) => this.mapRequestRow(row));
  }

  private mapRequestRow(row: Record<string, unknown>) {
    const trip =
      row.trip_id &&
      String(row.trip_id).length > 0 &&
      row.trip_tripNumber &&
      String(row.trip_tripNumber).length > 0
        ? {
            id: row.trip_id,
            tripNumber: row.trip_tripNumber,
            vehicleId: row.trip_vehicleId,
            vehiclePlate: row.trip_vehiclePlate,
            vehicleType: row.trip_vehicleType,
            driverId: row.trip_driverId,
            driverName: row.trip_driverName,
            driverPhone: row.trip_driverPhone,
            route: row.trip_route,
            etaPickup: row.trip_etaPickup
              ? new Date(row.trip_etaPickup as string).toISOString()
              : row.pickupAt
                ? new Date(row.pickupAt as string).toISOString()
                : null,
            etaDelivery: row.trip_etaDelivery
              ? new Date(row.trip_etaDelivery as string).toISOString()
              : row.etaDelivery
                ? new Date(row.etaDelivery as string).toISOString()
                : null,
            assignedBy: row.trip_assignedBy,
            assignedAt: row.trip_assignedAt ? new Date(row.trip_assignedAt as string).toISOString() : null,
            realtimeStatus: row.trip_realtimeStatus,
            invoice: row.trip_invoice || null,
            createdAt: row.trip_createdAt ? new Date(row.trip_createdAt as string).toISOString() : null,
            updatedAt: row.trip_updatedAt ? new Date(row.trip_updatedAt as string).toISOString() : null
          }
        : null;

    return {
      id: row.id,
      requestNumber: row.requestNumber,
      clientUserId: row.clientUserId,
      clientCompanyId: row.clientCompanyId,
      clientCompanyLogoUrl: (() => {
        const rec = row as Record<string, unknown>;
        const v = pickPortalField(rec, "clientCompanyLogoUrl", "client_company_logo_url");
        if (v == null || v === "") return "";
        return String(v).trim();
      })(),
      clientName: row.clientName,
      requestedByName: row.requestedByName,
      originDepartment: row.originDepartment,
      originCity: row.originCity,
      originAddress: row.originAddress,
      destinationDepartment: row.destinationDepartment,
      destinationCity: row.destinationCity,
      destinationAddress: row.destinationAddress,
      pickupAt: row.pickupAt ? new Date(row.pickupAt as string).toISOString() : null,
      etaDelivery: row.etaDelivery ? new Date(row.etaDelivery as string).toISOString() : null,
      vehicleType: row.vehicleType,
      cargoDescription: row.cargoDescription,
      serviceType: row.serviceType,
      refrigeracionTermoking:
        typeof (row as { refrigeracionTermoking?: unknown }).refrigeracionTermoking === "boolean"
          ? Boolean((row as { refrigeracionTermoking?: boolean }).refrigeracionTermoking)
          : this.solicitudRefrigeracionFromPayload({ serviceType: row.serviceType }),
      boxesCount: row.boxesCount,
      weightKg: row.weightKg,
      fuelles:
        row.fuelles != null && row.fuelles !== "" && Number.isFinite(Number(row.fuelles))
          ? Number(row.fuelles)
          : null,
      contactName: row.contactName,
      contactPhone: row.contactPhone,
      observations: row.observations,
      status: row.status,
      tripValue: row.tripValue,
      insuredValue:
        row.insuredValue != null && row.insuredValue !== "" && Number.isFinite(Number(row.insuredValue))
          ? Number(row.insuredValue)
          : null,
      standbyChargeTotal: row.standbyChargeTotal,
      standbyEvents: Array.isArray(row.standbyEvents) ? row.standbyEvents : JSON.parse(String(row.standbyEvents || "[]")),
      rejectionReason: row.rejectionReason || "",
      approvedAt: row.approvedAt ? new Date(row.approvedAt as string).toISOString() : null,
      approvedBy: row.approvedBy || null,
      autoApproved:
        typeof row.autoApproved === "boolean"
          ? row.autoApproved
          : String(row.autoApproved || "").toLowerCase() === "true",
      deliveredAt: row.deliveredAt ? new Date(row.deliveredAt as string).toISOString() : null,
      closedAt: row.closedAt ? new Date(row.closedAt as string).toISOString() : null,
      createdAt: row.createdAt ? new Date(row.createdAt as string).toISOString() : new Date().toISOString(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt as string).toISOString() : null,
      distanceKm:
        row.distanceKm != null && row.distanceKm !== "" && Number.isFinite(Number(row.distanceKm))
          ? Number(row.distanceKm)
          : null,
      trip,
      apiSynced: true
    };
  }

  private async loadDeletedTransportTripLogs(): Promise<Record<string, unknown>[]> {
    if (!(await this.tableExists("auditoria_viajes_eliminados"))) return [];
    const r = await this.pool.query(
      `SELECT l.id::text,
              l.id_solicitud::text AS "requestId",
              l.numero_solicitud AS "requestNumber",
              l.numero_viaje AS "tripNumber",
              l.motivo AS "reason",
              l.eliminado_en AS "deletedAt",
              l.eliminado_por::text AS "deletedByUserId",
              u.correo_electronico AS "deletedByEmail",
              u.nombre_completo AS "deletedByName",
              COALESCE(l.datos_json->>'numero_viaje', l.datos_json->>'tripNumber', '') AS "_sum_trip",
              COALESCE(l.datos_json->>'placa_vehiculo', l.datos_json->>'vehiclePlate', '') AS "_sum_plate",
              COALESCE(l.datos_json->>'nombre_conductor', l.datos_json->>'driverName', '') AS "_sum_driver",
              COALESCE(l.datos_json->>'descripcion_ruta', l.datos_json->>'routeDescription', '') AS "_sum_route"
       FROM auditoria_viajes_eliminados l
       LEFT JOIN usuarios u ON u.id = l.eliminado_por
       ORDER BY l.eliminado_en DESC
       LIMIT $1`,
      [PORTAL_DELETION_AUDIT_BOOTSTRAP_LIMIT]
    );
    return r.rows.map((row) => {
      const trip = String(row._sum_trip || "").trim();
      const plate = String(row._sum_plate || "").trim();
      const driver = String(row._sum_driver || "").trim();
      const route = String(row._sum_route || "").trim();
      return {
        id: row.id,
        requestId: row.requestId,
        requestNumber: row.requestNumber,
        tripNumber: row.tripNumber,
        reason: row.reason,
        deletedAt: row.deletedAt ? new Date(row.deletedAt as string).toISOString() : null,
        deletedByUserId: String(row.deletedByUserId ?? "").trim() || null,
        deletedByEmail: maskPortalEmail(row.deletedByEmail),
        deletedByName: String(row.deletedByName ?? "").trim() || null,
        snapshot: null,
        snapshotSummary: {
          tripNumber: trip || null,
          vehiclePlate: plate || null,
          driverName: driver || null,
          routeDescription: route || null,
          numero_viaje: trip || null,
          placa_vehiculo: plate || null,
          nombre_conductor: driver || null,
          descripcion_ruta: route || null
        }
      };
    });
  }

  private async loadDeletedTransportRequestLogs(): Promise<Record<string, unknown>[]> {
    if (!(await this.tableExists("auditoria_solicitudes_eliminadas"))) return [];
    const r = await this.pool.query(
      `SELECT l.id::text,
              l.id_solicitud::text AS "requestId",
              l.numero_solicitud AS "requestNumber",
              l.motivo AS "reason",
              l.eliminado_en AS "deletedAt",
              l.eliminado_por::text AS "deletedByUserId",
              u.correo_electronico AS "deletedByEmail",
              u.nombre_completo AS "deletedByName",
              COALESCE(l.datos_json->>'departamento_origen', l.datos_json->>'originDepartment', '') AS "_sum_od",
              COALESCE(l.datos_json->>'ciudad_origen', l.datos_json->>'originCity', '') AS "_sum_oc",
              COALESCE(l.datos_json->>'departamento_destino', l.datos_json->>'destinationDepartment', '') AS "_sum_dd",
              COALESCE(l.datos_json->>'ciudad_destino', l.datos_json->>'destinationCity', '') AS "_sum_dc",
              COALESCE(l.datos_json->>'descripcion_carga', l.datos_json->>'cargoDescription', '') AS "_sum_cargo"
       FROM auditoria_solicitudes_eliminadas l
       LEFT JOIN usuarios u ON u.id = l.eliminado_por
       ORDER BY l.eliminado_en DESC
       LIMIT $1`,
      [PORTAL_DELETION_AUDIT_BOOTSTRAP_LIMIT]
    );
    return r.rows.map((row) => {
      const od = String(row._sum_od || "").trim();
      const oc = String(row._sum_oc || "").trim();
      const dd = String(row._sum_dd || "").trim();
      const dc = String(row._sum_dc || "").trim();
      const cargo = String(row._sum_cargo || "").trim();
      return {
        id: row.id,
        requestId: row.requestId,
        requestNumber: row.requestNumber,
        reason: row.reason,
        deletedAt: row.deletedAt ? new Date(row.deletedAt as string).toISOString() : null,
        deletedByUserId: String(row.deletedByUserId ?? "").trim() || null,
        deletedByEmail: maskPortalEmail(row.deletedByEmail),
        deletedByName: String(row.deletedByName ?? "").trim() || null,
        snapshot: null,
        snapshotSummary: {
          departamento_origen: od || null,
          originDepartment: od || null,
          ciudad_origen: oc || null,
          originCity: oc || null,
          departamento_destino: dd || null,
          destinationDepartment: dd || null,
          ciudad_destino: dc || null,
          destinationCity: dc || null,
          descripcion_carga: cargo || null,
          cargoDescription: cargo || null
        }
      };
    });
  }

  /** Fecha columna PostgreSQL DATE/TIMESTAMP → `YYYY-MM-DD` para inputs del portal. */
  private sqlVehicleDateColumnToString(raw: unknown): string | null {
    if (raw == null || raw === "") return null;
    if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw.toISOString().slice(0, 10);
    const s = String(raw).trim();
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }

  /** Igual que {@link sqlVehicleDateColumnToString} pero cadena vacía si no hay fecha (empleados nómina). */
  private sqlEmployeeDateToPortalYmd(raw: unknown): string {
    return this.sqlVehicleDateColumnToString(raw) ?? "";
  }

  private async loadLiveTransportOccupancySets(now = new Date()) {
    const busyVehicleIds = new Set<string>();
    const busyDriverIds = new Set<string>();
    const activeStatuses = ["Viaje asignado", "En transito", "Espera standby"];
    let r;
    try {
      r = await this.pool.query(
        `SELECT v.id_vehiculo::text AS vehicle_id, v.id_conductor::text AS driver_id
         FROM viajes_transporte v
         JOIN solicitudes_transporte s ON s.id = v.id_solicitud
         WHERE s.estado::text = ANY($1::text[])
           AND v.fecha_hora_recogida_programada <= $2::timestamptz
           AND ${PortalService.VIAJE_FIN_PROGRAMADO_SQL} > $2::timestamptz`,
        [activeStatuses, now.toISOString()]
      );
    } catch (err: any) {
      if (String(err?.code || "") === "42P01") {
        return { busyVehicleIds, busyDriverIds };
      }
      throw err;
    }
    for (const row of r.rows) {
      const vid = String((row as { vehicle_id?: unknown }).vehicle_id || "").trim();
      const did = String((row as { driver_id?: unknown }).driver_id || "").trim();
      if (vid) busyVehicleIds.add(vid);
      if (did) busyDriverIds.add(did);
    }
    return { busyVehicleIds, busyDriverIds };
  }

  private async loadVehicles() {
    const { busyVehicleIds } = await this.loadLiveTransportOccupancySets();
    const r = await this.pool.query(`SELECT * FROM vehiculos ORDER BY placa`);
    return r.rows.map((v) => ({
      // "ocupado" en portal debe depender del cruce vivo con viajes vigentes, no de flags estancados.
      ...(() => {
        const id = String(v.id || "").trim();
        const busyNow = id ? busyVehicleIds.has(id) : false;
        const manualUnavailable = v.disponible === false && v.ocupado_por_sistema !== true;
        return {
          available: manualUnavailable ? false : !busyNow,
          autoBusy: busyNow
        };
      })(),
      id: v.id,
      plate: v.placa,
      brand: v.marca,
      model: v.linea_modelo,
      year: v.anio_modelo,
      color: v.color,
      type: v.tipo_vehiculo,
      capacityKg: Number(v.capacidad_kg),
      refrigerated: v.refrigerado_termoking,
      bodyType: v.tipo_carroceria,
      fuelType: v.tipo_combustible,
      axleConfig: v.configuracion_ejes,
      engineNumber: v.numero_motor,
      vin: v.numero_chasis_vin,
      ownershipCard: v.numero_tarjeta_propiedad,
      soatExpeditionDate: this.sqlVehicleDateColumnToString(v.fecha_expedicion_soat),
      soatExpiryDate: this.sqlVehicleDateColumnToString(v.fecha_vencimiento_soat),
      techInspectionExpeditionDate: this.sqlVehicleDateColumnToString(v.fecha_expedicion_tecnomecanica),
      techInspectionExpiryDate: this.sqlVehicleDateColumnToString(v.fecha_vencimiento_tecnomecanica),
      rcPolicyContract: v.numero_poliza_rc_contractual || "",
      rcPolicyExtra: v.numero_poliza_rc_extracontractual || "",
      rcPolicyExpiry: this.sqlVehicleDateColumnToString(v.fecha_vencimiento_polizas_rc) || "",
      hasGps: v.tiene_gps,
      gpsProvider: v.proveedor_gps || "",
      satelliteProviderUser: v.usuario_proveedor_satelite || "",
      satelliteProviderPassword: v.password_proveedor_satelite || "",
      createdBy: String((v as { creado_por?: unknown }).creado_por ?? "").trim() || null,
      updatedBy: String((v as { actualizado_por?: unknown }).actualizado_por ?? "").trim() || null,
      createdAt: v.fecha_creacion ? new Date(v.fecha_creacion).toISOString() : new Date().toISOString(),
      updatedAt: v.fecha_actualizacion ? new Date(v.fecha_actualizacion).toISOString() : null
    }));
  }

  private async loadDrivers() {
    const { busyDriverIds } = await this.loadLiveTransportOccupancySets();
    const r = await this.pool.query(`SELECT * FROM conductores ORDER BY nombre_completo`);
    return r.rows.map((d) => {
      const licEx = this.sqlVehicleDateColumnToString(d.fecha_vencimiento_licencia) || "";
      const occD = this.sqlVehicleDateColumnToString(d.fecha_examen_ocupacional) || "";
      const occE = this.sqlVehicleDateColumnToString(d.fecha_vencimiento_examen_ocupacional) || "";
      const intraD = this.sqlVehicleDateColumnToString(d.fecha_examen_instruvial) || "";
      const intraE = this.sqlVehicleDateColumnToString(d.fecha_vencimiento_examen_instruvial) || "";
      const defCourse =
        d.curso_conduccion_defensiva != null && String(d.curso_conduccion_defensiva).trim() !== ""
          ? String(d.curso_conduccion_defensiva).trim()
          : "";
      const row = d as Record<string, unknown>;
      const defCourseExpiry = this.sqlVehicleDateColumnToString(row.fecha_vencimiento_curso_defensivo) || "";
      const comparendosNum =
        row.comparendos_pendientes != null && String(row.comparendos_pendientes).trim() !== ""
          ? Math.max(0, Math.min(9999, Math.floor(Number(row.comparendos_pendientes))))
          : 0;
      const expYears =
        row.anos_experiencia_conduccion != null && String(row.anos_experiencia_conduccion).trim() !== ""
          ? Math.max(0, Math.min(80, Math.floor(Number(row.anos_experiencia_conduccion))))
          : 0;
      return {
        ...(() => {
          const id = String(d.id || "").trim();
          const busyNow = id ? busyDriverIds.has(id) : false;
          const manualUnavailable = d.disponible === false && d.ocupado_por_sistema !== true;
          return {
            available: manualUnavailable ? false : !busyNow,
            autoBusy: busyNow
          };
        })(),
        id: d.id != null ? String(d.id).trim() : "",
        companyId: d.id_empresa != null ? String(d.id_empresa).trim() : "",
        name: d.nombre_completo != null ? String(d.nombre_completo).trim() : "",
        documentType: d.tipo_documento,
        idDoc: d.numero_documento != null ? String(d.numero_documento).trim() : "",
        phone: d.telefono != null ? String(d.telefono).trim() : "",
        department: d.departamento,
        city: d.ciudad,
        address: d.direccion,
        license: d.numero_licencia != null ? String(d.numero_licencia).trim() : "",
        licenseCategory: d.categoria_licencia != null ? String(d.categoria_licencia).trim() : "",
        licenseExpiry: licEx,
        occupationalExamDate: occD,
        occupationalExamExpiry: occE,
        instruvialExamDate: intraD,
        instruvialExamExpiry: intraE,
        psychometricExamDate: occD,
        psychometricExpiry: occE,
        psychoTestDate: occD,
        psychoTestExpiry: occE,
        defensiveDrivingCourse: defCourse,
        defensiveCourse: defCourse,
        defensiveCourseExpiry: defCourseExpiry,
        bloodType: row.tipo_sangre != null ? String(row.tipo_sangre).trim() : "",
        eps: row.eps != null ? String(row.eps).trim() : "",
        arl: row.arl != null ? String(row.arl).trim() : "",
        comparendos: comparendosNum,
        experienceYears: expYears,
        emergencyContact: d.contacto_emergencia,
        emergencyPhone: d.telefono_emergencia,
        contractType: d.tipo_contrato,
        baseSalary: d.salario_base != null ? Number(d.salario_base) : 0,
        startDate: d.fecha_inicio,
        hiredAt: d.fecha_contratacion ? new Date(d.fecha_contratacion).toISOString() : null,
        photoUrl: String((d as { url_foto?: unknown }).url_foto ?? "").trim(),
        createdBy: String(row.creado_por ?? "").trim() || null,
        updatedBy: String(row.actualizado_por ?? "").trim() || null,
        createdAt: d.fecha_creacion ? new Date(d.fecha_creacion).toISOString() : new Date().toISOString(),
        updatedAt: d.fecha_actualizacion ? new Date(d.fecha_actualizacion).toISOString() : null
      };
    });
  }

  /**
   * Inserta notificaciones in-app para uno o varios usuarios (servidor).
   * Usado cuando un cliente u operador debe avisar a admins/RRHH sin ver su bandeja.
   */
  async dispatchNotification(
    actorUserId: string,
    actorRole: JwtRole,
    dto: {
      title: string;
      body: string;
      userIds?: string[];
      audience?: "admins" | "hr";
      category?: string;
      deepLink?: string;
      entityType?: string;
      entityId?: string;
    }
  ) {
    const title = String(dto.title || "").trim();
    const body = String(dto.body || "").trim();
    if (!title || !body) throw new BadRequestException("title y body son obligatorios");
    const meta = {
      category: dto.category ? String(dto.category).trim() : null,
      deepLink: dto.deepLink ? String(dto.deepLink).trim() : null,
      entityType: dto.entityType ? String(dto.entityType).trim() : null,
      entityId: dto.entityId ? String(dto.entityId).trim() : null
    };

    if (dto.audience === "admins" || dto.audience === "hr") {
      if (dto.audience === "hr" && !this.isAdmin(actorRole)) {
        throw new ForbiddenException("Solo administradores pueden notificar a RRHH.");
      }
      const inserted = await this.insertNotificationIfNotDuplicate({
        userId: null,
        title,
        body,
        audience: dto.audience,
        ...meta
      });
      return { ok: true, count: inserted ? 1 : 0 };
    }

    let targetIds: string[] = [];
    if (Array.isArray(dto.userIds) && dto.userIds.length) {
      targetIds = dto.userIds.map((id) => String(id).trim()).filter((id) => PG_UUID_V4_RE.test(id));
      if (!this.isAdmin(actorRole)) {
        const actor = String(actorUserId || "").trim();
        const onlySelf = targetIds.length === 1 && targetIds[0] === actor;
        if (!onlySelf) throw new ForbiddenException();
      }
    } else {
      throw new BadRequestException("Indique userIds o audience");
    }

    const unique = [...new Set(targetIds)];
    if (!unique.length) return { ok: true, count: 0 };

    let recipients = unique;
    try {
      const blocked = await this.pool.query<{ id: string }>(
        `SELECT id_usuario::text AS id FROM preferencias_notificacion_usuario
         WHERE id_usuario = ANY($1::uuid[]) AND notificaciones_habilitadas = false`,
        [unique]
      );
      const skip = new Set(blocked.rows.map((x) => x.id));
      recipients = unique.filter((id) => !skip.has(id));
    } catch {
      recipients = unique;
    }
    if (!recipients.length) return { ok: true, count: 0 };

    let inserted = 0;
    for (const uid of recipients) {
      const ok = await this.insertNotificationIfNotDuplicate({
        userId: uid,
        title,
        body,
        audience: null,
        ...meta
      });
      if (ok) inserted += 1;
    }
    return { ok: true, count: inserted };
  }

  /**
   * Inserta notificaciones in-app para RRHH/administración (sin actor JWT).
   * Usado por avisos automáticos de contratos a término fijo.
   */
  private async dispatchHrNotificationFromSystem(
    title: string,
    body: string,
    meta?: {
      category?: string | null;
      deepLink?: string | null;
      entityType?: string | null;
      entityId?: string | null;
    }
  ): Promise<number> {
    const ok = await this.insertNotificationIfNotDuplicate({
      userId: null,
      title,
      body,
      audience: "hr",
      category: meta?.category ?? "hr",
      deepLink: meta?.deepLink ?? "#portal/payroll",
      entityType: meta?.entityType ?? null,
      entityId: meta?.entityId ?? null
    });
    return ok ? 1 : 0;
  }

  private async contractRenewalNoticeRecentlySent(
    dedupeKey: string,
    legacyRefToken: string,
    withinDays = 7
  ): Promise<boolean> {
    const key = String(dedupeKey || "").trim();
    const legacyRef = String(legacyRefToken || "").trim();
    if (!key && !legacyRef) return false;
    const days = Math.max(1, Math.min(30, Math.floor(withinDays)));
    const r = await this.pool.query<{ ok: number }>(
      `SELECT 1 AS ok FROM notificaciones
       WHERE fecha_creacion > now() - ($3::text || ' days')::interval
         AND (
           ($1::text <> '' AND tipo_entidad = 'contract_notice' AND id_entidad = $1)
           OR ($2::text <> '' AND cuerpo LIKE $2)
         )
       LIMIT 1`,
      [key, legacyRef ? `%${legacyRef}%` : "", String(days)]
    );
    return (r.rowCount ?? 0) > 0;
  }

  /** Avisos de no renovación / vencimiento para contratos a término fijo. */
  async runFixedTermContractRenewalNotifications(): Promise<{ ok: true; notices: number }> {
    const r = await this.pool.query(`SELECT * FROM empleados_nomina`);
    let notices = 0;
    for (const row of r.rows) {
      const emp = this.mapEmployeeRow(row);
      const meta = computeEmployeeContractRenewalMeta({
        contractType: emp.contractType,
        startDate: emp.startDate,
        contractVigenteStartDate: emp.contractVigenteStartDate,
        contractEndDate: emp.contractEndDate,
        contractDuration: emp.contractDuration,
        contractDurationText: emp.contractDurationText
      });
      if (!meta.applies) continue;
      if (meta.statusSlug !== "notice_window" && meta.statusSlug !== "expired") continue;

      const employeeId = String(emp.id ?? "").trim();
      const dedupeKey = contractNoticeDedupeKey(employeeId, meta.endYmd, meta.statusSlug);
      const legacyRef = contractNoticeRefToken(employeeId, meta.endYmd, meta.statusSlug);
      const dedupeDays = meta.statusSlug === "expired" ? 14 : 7;
      if (await this.contractRenewalNoticeRecentlySent(dedupeKey, legacyRef, dedupeDays)) continue;

      const name = String(emp.name || "Colaborador").trim();
      const doc = String(emp.idDoc || "").trim();
      const title =
        meta.statusSlug === "expired"
          ? `Contrato vencido · ${name}`
          : `Aviso no renovación · ${name}`;
      const body = buildContractNoticeNotificationBody({
        name,
        idDoc: doc,
        meta,
        statusSlug: meta.statusSlug
      });

      const count = await this.dispatchHrNotificationFromSystem(title, body.slice(0, 4000), {
        category: "hr",
        deepLink: "#portal/payroll",
        entityType: "contract_notice",
        entityId: dedupeKey
      });
      if (count > 0) notices += 1;
    }
    return { ok: true, notices };
  }

  /**
   * Lanza el job de avisos de contrato en segundo plano (sin bloquear el bootstrap) y solo
   * si no corrió hace poco. Antes se hacía `await` dentro de `bootstrap()`, lo que sumaba un
   * escaneo completo de empleados_nomina + lecturas N+1 al tiempo de "mostrar los datos" en
   * cada carga con rol de nómina. Ahora el bootstrap responde de inmediato.
   */
  private maybeRunFixedTermContractRenewalNotifications(): void {
    const THROTTLE_MS = 30 * 60 * 1000;
    const now = Date.now();
    if (this.fixedTermRenewalInFlight) return;
    if (now - this.lastFixedTermRenewalRunMs < THROTTLE_MS) return;
    this.lastFixedTermRenewalRunMs = now;
    this.fixedTermRenewalInFlight = true;
    void this.runFixedTermContractRenewalNotifications()
      .catch((e) => {
        this.logger.warn(
          `Avisos contrato término fijo: ${e instanceof Error ? e.message : String(e)}`
        );
      })
      .finally(() => {
        this.fixedTermRenewalInFlight = false;
      });
  }

  private roleMayRunContractRenewalNotices(role: JwtRole): boolean {
    const r = String(role || "").toLowerCase();
    return (
      this.isAdmin(role) ||
      r === "rrhh" ||
      r === "administracion" ||
      r === "auxiliar_administrativo" ||
      r === "lider_administrativo"
    );
  }

  private notificationAudienceVisibleToRole(audience: string, role: JwtRole): boolean {
    const a = String(audience || "").trim().toLowerCase();
    if (a === "admins") return this.isAdmin(role);
    if (a === "hr") return this.roleMayRunContractRenewalNotices(role);
    return false;
  }

  async runFixedTermContractRenewalNotificationsForActor(
    _actorUserId: string,
    role: JwtRole
  ): Promise<{ ok: true; notices: number }> {
    if (!this.roleMayRunContractRenewalNotices(role)) {
      throw new ForbiddenException();
    }
    return this.runFixedTermContractRenewalNotifications();
  }

  private async loadUserIdsByRoles(roles: string[]): Promise<string[]> {
    const normalized = roles.map((r) => String(r || "").toLowerCase()).filter(Boolean);
    if (!normalized.length) return [];
    const r = await this.pool.query<{ id: string }>(
      `SELECT id::text AS id FROM usuarios
       WHERE lower(rol::text) = ANY($1::text[])
         AND estado_cuenta = 'aprobado'::estado_cuenta_usuario`,
      [normalized]
    );
    return r.rows.map((row) => String(row.id)).filter((id) => PG_UUID_V4_RE.test(id));
  }

  /**
   * Endpoint liviano para el polling de la campana: solo notificaciones, sin el resto del
   * bootstrap. Reduce el tráfico/carga de "mostrar datos" al evitar re-descargar todo el
   * dataset cada pocos segundos.
   */
  async getNotificationsForUser(userId: string, role: JwtRole) {
    const notifications = await this.loadNotifications(userId, role);
    return { notifications };
  }

  /**
   * Persiste `fecha_lectura` sin depender de sync-key con cientos de filas (más fiable tras F5).
   */
  async markNotificationsRead(userId: string, role: JwtRole, ids: string[]) {
    const validIds = (Array.isArray(ids) ? ids : [])
      .map((raw) => String(raw ?? "").trim())
      .filter((id) => PG_UUID_V4_RE.test(id));
    if (!validIds.length) {
      return { ok: true, updated: 0, readAt: null as string | null };
    }
    const adminAudience = this.isAdmin(role);
    const hrAudience = this.roleMayRunContractRenewalNotices(role);
    const now = new Date();
    const r = await this.pool.query(
      `WITH requested AS (
         SELECT id, titulo, cuerpo, audiencia, id_usuario
         FROM notificaciones
         WHERE id = ANY($1::uuid[])
       )
       UPDATE notificaciones n
       SET fecha_lectura = COALESCE(n.fecha_lectura, $2::timestamptz)
       FROM requested src
       WHERE n.fecha_lectura IS NULL
         AND (
           n.id = src.id
           OR (
             n.titulo = src.titulo
             AND n.cuerpo = src.cuerpo
             AND COALESCE(n.audiencia, '') = COALESCE(src.audiencia, '')
             AND COALESCE(n.id_usuario::text, '') = COALESCE(src.id_usuario::text, '')
           )
         )
         AND (
           n.id_usuario = $3::uuid
           OR (n.audiencia = 'admins' AND $4::boolean)
           OR (n.audiencia = 'hr' AND $5::boolean)
         )`,
      [validIds, now, userId, adminAudience, hrAudience]
    );
    const updated = Number(r.rowCount) || 0;
    return { ok: true, updated, readAt: now.toISOString() };
  }

  /**
   * Borra notificaciones visibles para el actor sin depender de sync-key (evita 500 al
   * re-procesar lecturas o filas ajenas en el payload).
   */
  async deleteNotifications(userId: string, role: JwtRole, ids: string[]) {
    const validIds = (Array.isArray(ids) ? ids : [])
      .map((raw) => String(raw ?? "").trim())
      .filter((id) => PG_UUID_V4_RE.test(id));
    if (!validIds.length) {
      return { ok: true, deleted: 0 };
    }
    const adminAudience = this.isAdmin(role);
    const hrAudience = this.roleMayRunContractRenewalNotices(role);
    const r = await this.pool.query(
      `WITH requested AS (
         SELECT id, titulo, cuerpo, audiencia, id_usuario
         FROM notificaciones
         WHERE id = ANY($1::uuid[])
       )
       DELETE FROM notificaciones n
       USING requested src
       WHERE (
         n.id = src.id
         OR (
           n.titulo = src.titulo
           AND n.cuerpo = src.cuerpo
           AND COALESCE(n.audiencia, '') = COALESCE(src.audiencia, '')
           AND COALESCE(n.id_usuario::text, '') = COALESCE(src.id_usuario::text, '')
         )
       )
       AND (
         n.id_usuario = $2::uuid
         OR (n.audiencia = 'admins' AND $3::boolean)
         OR (n.audiencia = 'hr' AND $4::boolean)
       )`,
      [validIds, userId, adminAudience, hrAudience]
    );
    const deleted = Number(r.rowCount) || 0;
    return { ok: true, deleted };
  }

  private async loadNotifications(userId: string, role: JwtRole) {
    const adminAudience = this.isAdmin(role);
    const hrAudience = this.roleMayRunContractRenewalNotices(role);
    const limit = adminAudience ? 500 : 200;
    const r = await this.pool.query(
      `SELECT id::text, id_usuario::text AS "userId", audiencia AS audience,
              titulo AS title, cuerpo AS body,
              categoria AS category, deep_link AS "deepLink",
              tipo_entidad AS "entityType", id_entidad AS "entityId",
              fecha_lectura AS readAt, fecha_creacion AS "createdAt"
       FROM notificaciones
       WHERE id_usuario = $1::uuid
          OR (audiencia = 'admins' AND $2::boolean)
          OR (audiencia = 'hr' AND $3::boolean)
       ORDER BY fecha_creacion DESC
       LIMIT ${limit}`,
      [userId, adminAudience, hrAudience]
    );
    return r.rows.map((n) => ({
      id: n.id,
      userId: n.userId,
      audience: n.audience ?? null,
      title: n.title,
      body: n.body,
      category: n.category ?? null,
      deepLink: n.deepLink ?? null,
      entityType: n.entityType ?? null,
      entityId: n.entityId ?? null,
      readAt: n.readAt ? new Date(n.readAt).toISOString() : null,
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString()
    }));
  }

  private async loadEmails(admin: boolean) {
    if (!admin) return [];
    const r = await this.pool.query(
      `SELECT id::text, direccion_destino AS to, asunto AS subject,
              cuerpo AS body, fecha_envio_real AS sentAt, fecha_creacion AS "createdAt",
              error_envio AS error,
              CASE
                WHEN error_envio IS NOT NULL AND btrim(error_envio) <> '' THEN 'error'
                WHEN fecha_envio_real IS NOT NULL THEN 'sent'
                ELSE 'queued'
              END AS status
       FROM correos_salida ORDER BY fecha_creacion DESC LIMIT 500`
    );
    return r.rows.map((e) => ({
      id: e.id,
      to: maskPortalEmail(e.to),
      subject: e.subject,
      body: e.body,
      sentAt: e.sentAt ? new Date(e.sentAt).toISOString() : null,
      createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
      error: e.error || null,
      status: e.status
    }));
  }

  private async hasContactB2bViewPermission(userId: string): Promise<boolean> {
    const uid = String(userId || "").trim();
    if (!PG_UUID_V4_RE.test(uid)) return false;
    const r = await this.pool.query(
      `SELECT 1 AS ok FROM permisos_usuario WHERE id_usuario = $1::uuid AND permiso = $2 LIMIT 1`,
      [uid, "contact_b2b_view"]
    );
    return (r.rowCount ?? 0) > 0;
  }

  private async hasUsersManagePermission(userId: string): Promise<boolean> {
    const uid = String(userId || "").trim();
    if (!PG_UUID_V4_RE.test(uid)) return false;
    const r = await this.pool.query(
      `SELECT 1 AS ok FROM permisos_usuario WHERE id_usuario = $1::uuid AND permiso = $2 LIMIT 1`,
      [uid, "users_manage"]
    );
    return (r.rowCount ?? 0) > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapProspectLeadRows(rows: any[]): Array<Record<string, unknown>> {
    return rows.map((c) => ({
      id: c.id,
      contactName: c.nombre_contacto,
      companyName: c.nombre_empresa,
      nit: c.nit,
      role: c.cargo_contacto,
      phone: c.telefono,
      email: c.correo_electronico,
      serviceType: c.tipo_servicio,
      operationType: c.tipo_operacion,
      frequency: c.frecuencia_operacion,
      serviceWindow: c.ventana_inicio_servicio,
      message: c.mensaje,
      createdAt: c.fecha_creacion ? new Date(c.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  private async fetchProspectLeadsLimited() {
    const r = await this.pool.query(`SELECT * FROM prospectos_contacto_b2b ORDER BY fecha_creacion DESC LIMIT 500`);
    return this.mapProspectLeadRows(r.rows);
  }

  private async loadContacts(canView: boolean) {
    if (!canView) return [];
    return this.fetchProspectLeadsLimited();
  }

  /** Endpoint dedicado: una sola consulta; mismo permiso que en bootstrap (admin o permiso granular). */
  async getContactB2bProspects(userId: string, role: JwtRole) {
    const admin = this.isAdmin(role);
    const ok = admin || (await this.hasContactB2bViewPermission(userId));
    if (!ok) throw new ForbiddenException("Sin permiso para ver prospectos de contacto web");
    return this.fetchProspectLeadsLimited();
  }

  async getUserSessions(userId: string, role: JwtRole) {
    const admin = this.isAdmin(role);
    const ok = admin || (await this.hasUsersManagePermission(userId));
    if (!ok) throw new ForbiddenException("Sin permiso para consultar sesiones de usuarios");
    try {
      const sessionsTable = (await this.tableExists("sesiones_usuario"))
        ? "sesiones_usuario"
        : (await this.tableExists("sesiones_usuarios"))
          ? "sesiones_usuarios"
          : null;
      if (!sessionsTable) return [];
      const r = await this.pool.query(
        `SELECT
            s.id::text AS id,
            s.id_usuario::text AS user_id,
            u.nombre_completo AS user_name,
            u.correo_electronico AS user_email,
            u.rol::text AS user_role,
            s.fecha_creacion AS created_at,
            s.fecha_expiracion AS expires_at,
            CASE WHEN s.fecha_expiracion > now() THEN 'activa' ELSE 'expirada' END AS status
         FROM ${sessionsTable} s
         LEFT JOIN usuarios u ON u.id = s.id_usuario
         ORDER BY s.fecha_creacion DESC
         LIMIT 1000`
      );
      const fromSessions = r.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name || "Usuario",
        userEmail: maskPortalEmail(row.user_email || ""),
        userRole: row.user_role || "",
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
        status: String(row.status || "").toLowerCase() === "activa" ? "activa" : "expirada"
      }));
      if (fromSessions.length > 0) return fromSessions;
      const fallback = await this.pool.query(
        `SELECT
            u.id::text AS user_id,
            u.nombre_completo AS user_name,
            u.correo_electronico AS user_email,
            u.rol::text AS user_role,
            u.fecha_actualizacion AS updated_at
         FROM usuarios u
         WHERE u.refresh_token_hash IS NOT NULL
         ORDER BY u.fecha_actualizacion DESC
         LIMIT 1000`
      );
      return fallback.rows.map((row) => ({
        id: `legacy-refresh-${String((row as { user_id?: unknown }).user_id || "")}`,
        userId: (row as { user_id?: unknown }).user_id || "",
        userName: (row as { user_name?: unknown }).user_name || "Usuario",
        userEmail: maskPortalEmail((row as { user_email?: unknown }).user_email || ""),
        userRole: (row as { user_role?: unknown }).user_role || "",
        createdAt: (row as { updated_at?: unknown }).updated_at
          ? new Date(String((row as { updated_at?: unknown }).updated_at)).toISOString()
          : null,
        expiresAt: null,
        status: "activa"
      }));
    } catch (err: any) {
      if (String(err?.code || "") === "42P01") return [];
      throw err;
    }
  }

  private async loadPositions() {
    try {
      if (!(await this.tableExists("public.cargos"))) {
        this.logger.warn("loadPositions: tabla public.cargos no existe en esta base");
        return [];
      }
      const r = await this.pool.query(
        `SELECT id, nombre, rol_trabajador, salario_base_mensual, tipo_contrato_sugerido,
                fundamento_legal, activo, jornada_referencia, nivel_riesgo_arl, salario_integral,
                auxilio_transporte, fecha_creacion, fecha_actualizacion
           FROM public.cargos
          ORDER BY nombre`
      );
      const rows = r.rows.map((p) => ({
        id: String(p.id ?? "").trim(),
        name: String(p.nombre ?? "").trim(),
        workerRole: String(p.rol_trabajador || "empleado").toLowerCase(),
        baseSalary: Number(p.salario_base_mensual) || 0,
        transportAllowance: p.auxilio_transporte != null ? Number(p.auxilio_transporte) : null,
        contractTypeDefault: String(p.tipo_contrato_sugerido ?? "").trim() || "Termino indefinido",
        legalBasis: String(p.fundamento_legal ?? "").trim(),
        active: p.activo !== false,
        createdAt: p.fecha_creacion ? new Date(p.fecha_creacion).toISOString() : new Date().toISOString(),
        updatedAt: p.fecha_actualizacion ? new Date(p.fecha_actualizacion).toISOString() : null,
        schedule: p.jornada_referencia,
        workSchedule: p.jornada_referencia,
        arlRiskLevel: p.nivel_riesgo_arl,
        integralSalary: p.salario_integral
      }));
      this.logger.log(`loadPositions: ${rows.length} cargo(s) desde public.cargos`);
      return rows;
    } catch (e) {
      this.logger.error(
        `loadPositions (cargos): ${e instanceof Error ? e.message : String(e)}`
      );
      return [];
    }
  }

  /** Normaliza adjuntos_json (JSONB) a array para el portal. */
  private parseCandidateAdjuntosJsonArray(raw: unknown): unknown[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
      try {
        const p = JSON.parse(raw) as unknown;
        if (Array.isArray(p)) return p;
        if (p != null && typeof p === "object" && !Array.isArray(p)) return [p];
      } catch {
        return [];
      }
      return [];
    }
    if (typeof raw === "object" && !Array.isArray(raw)) {
      return [raw];
    }
    return [];
  }

  private candidateAttachmentsHasStoredCv(arr: unknown[]): boolean {
    for (const item of arr) {
      if (item == null || typeof item !== "object" || Array.isArray(item)) continue;
      const rec = item as Record<string, unknown>;
      const kind = String(rec.kind || "");
      if (kind === "cv_blob" && rec.data) return true;
      if (kind === "cv_file" && (String(rec.storageKey || "").trim() || String(rec.url || "").trim())) {
        return true;
      }
    }
    return false;
  }

  /** Evita que sync-key del portal pise un CV en BD (R2 o inline) con solo nombres de archivo. */
  private shouldPreserveExistingCandidateAttachments(existing: unknown[], incoming: unknown[]): boolean {
    return this.candidateAttachmentsHasStoredCv(existing) && !this.candidateAttachmentsHasStoredCv(incoming);
  }

  /** CV en R2: URL pública estable o GET prefirmado (renueva enlaces expirados en caché del navegador). */
  private async enrichCandidateAttachmentsForPortal(raw: unknown): Promise<unknown> {
    const arr = this.parseCandidateAdjuntosJsonArray(raw);
    const out: unknown[] = [];
    for (const item of arr) {
      if (item == null || typeof item !== "object" || Array.isArray(item)) {
        out.push(item);
        continue;
      }
      const rec = item as Record<string, unknown>;
      const kind = String(rec.kind || "");
      const storageKey = String(rec.storageKey || "").trim();
      if (kind === "cv_file" && storageKey) {
        const existingUrl = String(rec.url || "").trim();
        const publicUrl = this.r2.publicUrl(storageKey);
        if (publicUrl) {
          out.push({ ...rec, url: publicUrl });
          continue;
        }
        if (
          this.r2.hasUploadsClient() &&
          (!existingUrl || !this.r2.isStablePublicObjectUrl(existingUrl, storageKey))
        ) {
          try {
            const signed = await this.r2.presignGetUploadsObject(storageKey, 7200);
            out.push({ ...rec, url: signed });
            continue;
          } catch (e) {
            this.logger.warn(`presign CV falló (${storageKey}): ${String((e as Error)?.message || e)}`);
          }
        }
      }
      out.push(rec);
    }
    return out;
  }

  /**
   * Descarga de hoja de vida para Contratación (JWT + rol RRHH).
   * Con R2: URL pública o prefirmada; sin R2: devuelve cv_blob inline del JSON.
   */
  async getCandidateCvDownload(userId: string, role: JwtRole, candidateId: string) {
    const permissionSet = this.isAdmin(role)
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.loadPortalPermissionSet(userId);
    if (!this.isAdmin(role) && !this.hasPortalPermission(permissionSet, "hiring_manage")) {
      throw new ForbiddenException();
    }
    const id = String(candidateId || "").trim();
    if (!PG_UUID_V4_RE.test(id)) {
      throw new BadRequestException("Identificador de candidato invalido.");
    }
    const r = await this.pool.query<{ adjuntos_json: unknown }>(
      `SELECT adjuntos_json FROM candidatos WHERE id = $1::uuid`,
      [id]
    );
    if (!r.rows[0]) {
      throw new NotFoundException("Candidato no encontrado.");
    }
    const arr = this.parseCandidateAdjuntosJsonArray(r.rows[0].adjuntos_json);
    for (const item of arr) {
      if (item == null || typeof item !== "object" || Array.isArray(item)) continue;
      const rec = item as Record<string, unknown>;
      const kind = String(rec.kind || "");
      const fileName = String(rec.name || "hoja-de-vida").trim() || "hoja-de-vida";
      if (kind === "cv_blob" && rec.data && rec.mime) {
        return {
          fileName,
          mime: String(rec.mime || "application/octet-stream"),
          data: String(rec.data)
        };
      }
      if (kind === "cv_file") {
        const storageKey = String(rec.storageKey || "").trim();
        const existingUrl = String(rec.url || "").trim();
        if (storageKey) {
          const publicUrl = this.r2.publicUrl(storageKey);
          if (publicUrl) {
            return { url: publicUrl, fileName };
          }
          if (this.r2.hasUploadsClient()) {
            const signed = await this.r2.presignGetUploadsObject(storageKey, 3600);
            return { url: signed, fileName };
          }
        }
        if (existingUrl && /^https?:\/\//i.test(existingUrl)) {
          return { url: existingUrl, fileName };
        }
      }
    }
    throw new NotFoundException("No hay hoja de vida adjunta para este candidato.");
  }

  /**
   * Binario de hoja de vida para descarga directa (Content-Disposition: attachment).
   * Evita que el navegador abra URLs R2 en la misma pestaña del portal.
   */
  async getCandidateCvFile(
    userId: string,
    role: JwtRole,
    candidateId: string
  ): Promise<{ buffer: Buffer; mime: string; fileName: string }> {
    const permissionSet = this.isAdmin(role)
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.loadPortalPermissionSet(userId);
    if (!this.isAdmin(role) && !this.hasPortalPermission(permissionSet, "hiring_manage")) {
      throw new ForbiddenException();
    }
    const id = String(candidateId || "").trim();
    if (!PG_UUID_V4_RE.test(id)) {
      throw new BadRequestException("Identificador de candidato invalido.");
    }
    const r = await this.pool.query<{ adjuntos_json: unknown }>(
      `SELECT adjuntos_json FROM candidatos WHERE id = $1::uuid`,
      [id]
    );
    if (!r.rows[0]) {
      throw new NotFoundException("Candidato no encontrado.");
    }
    const arr = this.parseCandidateAdjuntosJsonArray(r.rows[0].adjuntos_json);
    for (const item of arr) {
      if (item == null || typeof item !== "object" || Array.isArray(item)) continue;
      const rec = item as Record<string, unknown>;
      const kind = String(rec.kind || "");
      const fileName = String(rec.name || "hoja-de-vida").trim() || "hoja-de-vida";
      if (kind === "cv_blob" && rec.data && rec.mime) {
        return {
          buffer: Buffer.from(String(rec.data), "base64"),
          mime: String(rec.mime || "application/octet-stream"),
          fileName
        };
      }
      if (kind === "cv_file") {
        const storageKey = String(rec.storageKey || "").trim();
        if (storageKey && this.r2.hasUploadsClient()) {
          const obj = await this.r2.getUploadsObject(storageKey);
          return {
            buffer: obj.buffer,
            mime: obj.contentType || "application/octet-stream",
            fileName
          };
        }
        const existingUrl = String(rec.url || "").trim();
        if (existingUrl && /^https?:\/\//i.test(existingUrl)) {
          const res = await fetch(existingUrl);
          if (!res.ok) {
            throw new NotFoundException("No se pudo obtener la hoja de vida.");
          }
          const ab = await res.arrayBuffer();
          const mime =
            String(res.headers.get("content-type") || "application/octet-stream")
              .split(";")[0]
              ?.trim() || "application/octet-stream";
          return { buffer: Buffer.from(ab), mime, fileName };
        }
      }
    }
    throw new NotFoundException("No hay hoja de vida adjunta para este candidato.");
  }

  private async loadVacancies() {
    const r = await this.pool.query(`SELECT * FROM vacantes ORDER BY fecha_creacion DESC`);
    return r.rows.map((v) => ({
      id: v.id,
      positionId: v.id_cargo,
      title: v.titulo,
      department: v.departamento,
      city: v.ciudad,
      modality: v.modalidad,
      schedule: v.jornada_vacante,
      deadline: v.fecha_limite_postulacion,
      publishedFrom: (() => {
        const d = v.fecha_publicacion_desde;
        if (d == null || d === "") return null;
        if (d instanceof Date) return d.toISOString().slice(0, 10);
        return String(d).slice(0, 10);
      })(),
      slots: v.cupos,
      salaryOffer: Number(v.salario_oferta),
      positionTitle: v.nombre_cargo_denorm,
      positionName: v.nombre_cargo_denorm,
      workerRole: v.rol_trabajador,
      contractType: v.tipo_contrato_predeterminado,
      requirements: v.requisitos,
      status: v.estado,
      createdAt: v.fecha_creacion ? new Date(v.fecha_creacion).toISOString() : new Date().toISOString(),
      updatedAt: v.fecha_actualizacion ? new Date(v.fecha_actualizacion).toISOString() : null
    }));
  }

  private async loadCandidates() {
    const r = await this.pool.query(`SELECT * FROM candidatos ORDER BY fecha_creacion DESC`);
    return Promise.all(
      r.rows.map(async (c) => ({
        id: c.id,
        vacancyId: c.id_vacante,
        name: c.nombre_completo,
        email: c.correo_electronico,
        phone: c.telefono,
        documentType: c.tipo_documento,
        idDoc: c.numero_documento,
        birthDate: (() => {
          const f = c.fecha_nacimiento;
          if (f == null || f === "") return null;
          if (f instanceof Date) return f.toISOString().slice(0, 10);
          const s = String(f);
          return s.length >= 10 ? s.slice(0, 10) : s || null;
        })(),
        educationLevel: c.nivel_educativo,
        department: c.departamento,
        city: c.ciudad,
        address: c.direccion,
        experienceYears: Number(c.anios_experiencia),
        salaryExpectation: Number(c.aspiracion_salarial),
        availableFrom: c.fecha_disponible_ingreso,
        vacancyTitle: c.titulo_vacante_denorm,
        pipelineStage: c.etapa_proceso,
        attachments: await this.enrichCandidateAttachmentsForPortal(c.adjuntos_json),
        source: c.origen,
        hiredAt: c.fecha_contratacion,
        contractRegisteredAt: c.fecha_registro_contrato,
        createdAt: c.fecha_creacion ? new Date(c.fecha_creacion).toISOString() : new Date().toISOString(),
        updatedAt: c.fecha_actualizacion ? new Date(c.fecha_actualizacion).toISOString() : null
      }))
    );
  }

  private async loadInterviews() {
    const r = await this.pool.query(`SELECT * FROM entrevistas ORDER BY fecha_hora DESC`);
    return r.rows.map((i) => ({
      id: i.id,
      candidateId: i.id_candidato,
      candidateName: i.nombre_candidato_denorm,
      when: i.fecha_hora ? new Date(i.fecha_hora).toISOString() : null,
      interviewer: i.entrevistador,
      modality: i.modalidad,
      locationOrLink: i.lugar_o_enlace,
      notes: i.notas,
      createdAt: i.fecha_creacion ? new Date(i.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  private async loadContracts() {
    const r = await this.pool.query(`SELECT * FROM contratos ORDER BY fecha_creacion DESC`);
    return r.rows.map((c) => ({
      id: c.id,
      sourceTag: c.etiqueta_origen,
      personType: c.tipo_persona_origen,
      candidateId: c.id_candidato,
      candidateName: c.nombre_candidato_denorm,
      employeeId: c.id_empleado,
      employeeName: c.nombre_empleado_denorm,
      workerRole: c.rol_trabajador,
      positionId: c.id_cargo,
      positionName: c.nombre_cargo_denorm,
      salary: Number(c.salario_pactado),
      startDate: c.fecha_inicio,
      endDate: c.fecha_fin,
      renewalDate: c.fecha_renovacion,
      companyId: c.id_empresa,
      companyName: c.nombre_empresa_denorm,
      contractType: c.tipo_contrato,
      templateKind: c.tipo_plantilla_word,
      idDocSnapshot: c.documento_identidad_snapshot,
      probationMonths: c.meses_periodo_prueba,
      schedule: c.jornada_turno,
      workplace: c.lugar_trabajo,
      terminationCause: c.causal_terminacion_prevista,
      integralSalary: c.salario_integral,
      payFrequency: c.periodicidad_pago,
      transportAllowance: c.auxilio_transporte,
      uniform: c.dotacion_uniforme,
      withholding: c.retencion_fuente,
      eps: c.eps,
      pensionFund: c.fondo_pension,
      arl: c.arl,
      licenseNumber: c.numero_licencia,
      licenseCategory: c.categoria_licencia,
      licenseExpiry: c.fecha_vencimiento_licencia,
      summaryText: c.texto_contenido_resumen,
      createdAt: c.fecha_creacion ? new Date(c.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  /**
   * Colaboradores `empleados_nomina` para el portal.
   * - Admin: todos.
   * - Usuario con permiso `payroll_manage` (RRHH, administración, etc.): todos — Gestión humana
   *   opera sobre el directorio global; filtrar solo por `usuarios.id_empresa` dejaba lista vacía
   *   cuando los colaboradores estaban en otra empresa o `id_empresa` del usuario no coincidía.
   * - Sin permiso de nómina: con `id_empresa` válido en el usuario, solo esa empresa.
   * - Sin empresa en la fila de usuario pero con alcance de directorio amplio (mismo criterio que
   *   `loadCompanies(null)` vía `canSeeAllCompanies` en bootstrap): todos — evita lista vacía en
   *   Gestión humana cuando el usuario ve varias empresas pero `usuarios.id_empresa` es NULL.
   */
  private async loadPayrollEmployees(
    empresaId: string | null,
    admin: boolean,
    broadCompanyDirectory = false,
    payrollManage = false
  ) {
    if (!(await this.tableExists("empleados_nomina"))) {
      return [];
    }
    const companyScope =
      empresaId && PG_UUID_V4_RE.test(String(empresaId).trim()) ? String(empresaId).trim() : null;
    if (admin || payrollManage || (broadCompanyDirectory && !companyScope)) {
      const r = await this.pool.query(`SELECT * FROM empleados_nomina ORDER BY nombre_completo`);
      return r.rows.map((e) => this.mapEmployeeRow(e));
    }
    if (!companyScope) {
      return [];
    }
    const r = await this.pool.query(
      `SELECT * FROM empleados_nomina WHERE id_empresa = $1::uuid ORDER BY nombre_completo`,
      [companyScope]
    );
    return r.rows.map((e) => this.mapEmployeeRow(e));
  }

  /** Normaliza documento para comparar con `payrollEmployeeDocumentDedupKey` del portal. */
  private normalizePayrollEmployeeDocumentForLookup(documentType: string, rawValue: string): string {
    const dt = String(documentType || "CC").trim().toUpperCase();
    const raw = String(rawValue || "").trim();
    if (!raw) return "";
    if (dt === "PAS" || dt === "PEP") return raw.replace(/[.\s]/g, "").toUpperCase();
    return raw.replace(/\D/g, "");
  }

  /**
   * Comprueba en PostgreSQL si el documento ya pertenece a un colaborador.
   * `blocking` = true cuando la duplicidad aplica a la empresa seleccionada (unicidad por empresa).
   */
  async checkPayrollEmployeeDocumentDuplicate(
    userId: string,
    role: JwtRole,
    params: {
      documentType?: string;
      idDoc?: string;
      companyId?: string;
      excludeId?: string;
    }
  ): Promise<{
    found: boolean;
    blocking: boolean;
    name?: string;
    employeeId?: string;
    companyId?: string;
  }> {
    const permissionSet = await this.resolveEffectivePermissionSet(userId, role);
    if (!this.isAdmin(role) && !this.hasPortalPermission(permissionSet, "payroll_manage")) {
      throw new ForbiddenException();
    }
    if (!(await this.tableExists("empleados_nomina"))) {
      return { found: false, blocking: false };
    }

    const docType = String(params.documentType || "CC").trim().toUpperCase();
    const needle = this.normalizePayrollEmployeeDocumentForLookup(docType, String(params.idDoc || ""));
    if (!needle) return { found: false, blocking: false };

    const excludeId = String(params.excludeId || "").trim();
    const requestedCompanyId = String(params.companyId || "").trim();
    const companyFilter =
      requestedCompanyId && PG_UUID_V4_RE.test(requestedCompanyId) ? requestedCompanyId : null;

    const admin = this.isAdmin(role);
    const actorCompanyId = await this.getUserCompany(userId);
    const actorCompanyScope =
      actorCompanyId && PG_UUID_V4_RE.test(String(actorCompanyId).trim())
        ? String(actorCompanyId).trim()
        : null;
    const broadCompanyDirectory =
      admin ||
      this.hasPortalPermission(permissionSet, "payroll_manage") ||
      this.hasPortalPermission(permissionSet, "users_manage") ||
      this.hasPortalPermission(permissionSet, "hiring_manage");

    const docMatchSql =
      docType === "PAS" || docType === "PEP"
        ? `upper(regexp_replace(trim(coalesce(e.numero_documento, '')), '[.\\s]', '', 'g')) = $2`
        : `regexp_replace(trim(coalesce(e.numero_documento, '')), '[^0-9]', '', 'g') = $2`;

    const queryParams: unknown[] = [docType, needle];
    let sql = `SELECT e.id::text AS id, e.nombre_completo, e.id_empresa::text AS company_id
      FROM empleados_nomina e
      WHERE upper(trim(coalesce(e.tipo_documento, 'CC'))) = $1
        AND ${docMatchSql}`;

    if (excludeId && PG_UUID_V4_RE.test(excludeId)) {
      queryParams.push(excludeId);
      sql += ` AND e.id <> $${queryParams.length}::uuid`;
    }

    if (companyFilter) {
      queryParams.push(companyFilter);
      sql += ` AND e.id_empresa = $${queryParams.length}::uuid`;
    } else if (!admin && actorCompanyScope && !broadCompanyDirectory) {
      queryParams.push(actorCompanyScope);
      sql += ` AND e.id_empresa = $${queryParams.length}::uuid`;
    }

    sql += ` ORDER BY e.nombre_completo LIMIT 1`;

    const r = await this.pool.query<{
      id: string;
      nombre_completo: string | null;
      company_id: string | null;
    }>(sql, queryParams);
    const row = r.rows[0];
    if (!row) return { found: false, blocking: false };

    const matchCompanyId = String(row.company_id || "").trim();
    const blocking = companyFilter ? matchCompanyId === companyFilter : false;

    return {
      found: true,
      blocking,
      name: String(row.nombre_completo || "").trim() || undefined,
      employeeId: String(row.id || "").trim() || undefined,
      companyId: matchCompanyId || undefined
    };
  }

  private mapEmployeeRow(e: Record<string, unknown>) {
    /** Alineado con `app.js` (formulario y perfil de nómina): mismas claves que `buildPayrollEmployeePayloadFromWizard`. */
    return {
      id: e.id,
      companyId: e.id_empresa,
      positionId: e.id_cargo,
      name: e.nombre_completo,
      documentType: e.tipo_documento,
      idDoc: e.numero_documento,
      birthDate: this.sqlEmployeeDateToPortalYmd(e.fecha_nacimiento),
      gender: e.genero,
      maritalStatus: e.estado_civil,
      bloodType: e.tipo_sangre,
      educationLevel: e.nivel_educativo,
      department: e.departamento,
      city: e.ciudad,
      address: e.direccion,
      phone: e.telefono,
      personalEmail: e.correo_personal,
      emergencyContact: e.contacto_emergencia,
      emergencyPhone: e.telefono_emergencia,
      emergencyRelation: e.parentesco_emergencia,
      position: e.nombre_cargo_texto,
      contractType: e.tipo_contrato,
      /** Alias del formulario portal; misma columna BD `duracion_contrato_texto`. */
      contractDuration:
        e.duracion_contrato_texto != null && String(e.duracion_contrato_texto).trim() !== ""
          ? String(e.duracion_contrato_texto).trim()
          : "",
      contractDurationText: e.duracion_contrato_texto,
      startDate: this.sqlEmployeeDateToPortalYmd(e.fecha_ingreso),
      contractVigenteStartDate: this.sqlEmployeeDateToPortalYmd(e.fecha_inicio_contrato_vigente),
      renewalDate: this.sqlEmployeeDateToPortalYmd(e.fecha_renovacion),
      nonRenewalNoticeDate: this.sqlEmployeeDateToPortalYmd(e.fecha_aviso_no_renovacion),
      baseSalary: Number(e.salario_base),
      transportAllowance: e.auxilio_transporte != null ? Number(e.auxilio_transporte) : null,
      payFrequency: e.periodicidad_pago,
      costCenter:
        e.centro_costos != null && String(e.centro_costos).trim() !== ""
          ? String(e.centro_costos).trim()
          : "",
      contributorType: e.tipo_cotizante,
      arlRiskLevel: e.nivel_riesgo_arl,
      contractTemplateKind: e.tipo_plantilla_contrato,
      eps: e.eps,
      pensionFund: e.fondo_pension,
      arl: e.arl,
      severanceFund: e.fondo_cesantias,
      compensationFund: e.caja_compensacion,
      bankName: e.banco,
      bankAccountType: e.tipo_cuenta_bancaria,
      bankAccount: e.numero_cuenta_bancaria,
      workerRole: e.rol_trabajador,
      license: e.numero_licencia,
      licenseCategory: e.categoria_licencia,
      licenseExpiry: this.sqlEmployeeDateToPortalYmd(e.fecha_vencimiento_licencia),
      occupationalExamDate: this.sqlEmployeeDateToPortalYmd(e.fecha_examen_ocupacional),
      occupationalExamExpiry: this.sqlEmployeeDateToPortalYmd(e.fecha_vencimiento_examen_ocupacional),
      instruvialExamDate: this.sqlEmployeeDateToPortalYmd(e.fecha_examen_instruvial),
      instruvialExamExpiry: this.sqlEmployeeDateToPortalYmd(e.fecha_vencimiento_examen_instruvial),
      psychoTestDate: this.sqlEmployeeDateToPortalYmd(e.fecha_examen_ocupacional),
      psychoTestExpiry: this.sqlEmployeeDateToPortalYmd(e.fecha_vencimiento_examen_ocupacional),
      defensiveCourse: e.curso_conduccion_defensiva,
      probationMonths: e.meses_prueba,
      contractEndDate: this.sqlEmployeeDateToPortalYmd(e.fecha_fin_contrato),
      workSchedule: e.jornada_laboral,
      avatarUrl: e.url_avatar,
      corporateEmail: e.correo_corporativo,
      hasIllness: e.tiene_condicion_medica === true ? "si" : "no",
      illnessDescription:
        typeof e.descripcion_condicion_medica === "string" ? e.descripcion_condicion_medica : "",
      createdAt: e.fecha_creacion
        ? timestamptzToColombiaIso(e.fecha_creacion as string | Date)
        : timestamptzStringColombiaNow(),
      updatedAt: e.fecha_actualizacion
        ? timestamptzToColombiaIso(e.fecha_actualizacion as string | Date)
        : null
    };
  }

  /**
   * Mapea fila `liquidaciones_nomina` al objeto `payrollRuns` del portal.
   * @param includeHeavyJson Si false (bootstrap), no serializa JSONB grandes; extrae solo
   *  escalares mínimos para listados (días laborados / pago días) vía rutas JSONB en SQL.
   */
  private mapLiquidacionNominaRowToPortalPayrollRun(row: Record<string, unknown>, includeHeavyJson: boolean) {
    const novelties =
      includeHeavyJson &&
      row.novedades_liquidacion_json &&
      typeof row.novedades_liquidacion_json === "object"
        ? (row.novedades_liquidacion_json as Record<string, unknown>)
        : null;
    const workedDaysBlock =
      novelties && typeof novelties.colillaPagoDiasLaborados === "object"
        ? (novelties.colillaPagoDiasLaborados as Record<string, unknown>)
        : null;
    const slimWdLab = row.__bootstrap_nv_wd_lab;
    const slimWdPay = row.__bootstrap_nv_wd_pay;
    const slimSvcCal = row.__bootstrap_nv_svc_cal;
    const parseSlimNum = (raw: unknown): number | null => {
      if (raw == null) return null;
      const s = String(raw).trim();
      if (!s) return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };
    const wdFromNovelties = Number(workedDaysBlock?.diasLaborados ?? novelties?.diasServicioEnCorteCalendario ?? 0);
    const wdPayFromNovelties = Number(workedDaysBlock?.pagoDiasLaboradosCop ?? 0);
    const wdLabSlim = parseSlimNum(slimWdLab);
    const wdCalSlim = parseSlimNum(slimSvcCal);
    const wdPaySlim = parseSlimNum(slimWdPay) ?? 0;
    const workedDays = includeHeavyJson
      ? wdFromNovelties
      : wdLabSlim != null
        ? wdLabSlim
        : wdCalSlim != null
          ? wdCalSlim
          : 0;
    const workedDaysPaymentCop = includeHeavyJson ? wdPayFromNovelties : wdPaySlim;

    return {
      id: row.id,
      employeeId: row.id_empleado,
      employeeName: row.nombre_empleado,
      month: row.periodo_mes,
      gross: Number(row.devengado_total),
      ibc: Number(row.base_cotizacion_ibc),
      travelAllowance: Number(row.viaticos_periodo),
      fuelReimbursement: Number(row.reembolso_combustible),
      travelAllowanceAuto: Number(row.viaticos_automaticos),
      fuelReimbursementAuto: Number(row.reembolso_combustible_automatico),
      travelAllowanceManual: Number(row.viaticos_manuales),
      fuelReimbursementManual: Number(row.reembolso_combustible_manual),
      extras: Number(row.horas_extras_cop),
      aux: Number(row.auxilios_nomina_formulario),
      bonus: Number(row.bonificaciones_cop),
      tripCount: row.cantidad_viajes_conductor,
      interDepartmentTrips: row.viajes_interdepartamentales,
      health: Number(row.deduccion_salud),
      pension: Number(row.deduccion_pension),
      solidarity: Number(row.fondo_solidaridad_pensional),
      deductions: Number(row.total_deducciones),
      net: Number(row.neto_a_pagar),
      paid: row.liquidacion_pagada,
      paidAt: row.fecha_pago ? new Date(row.fecha_pago as string | number | Date).toISOString() : null,
      approvedBy: row.pago_aprobado_por,
      createdBy:
        typeof row.creado_por === "string" && row.creado_por.trim()
          ? String(row.creado_por).trim()
          : null,
      createdAt: row.fecha_creacion
        ? new Date(row.fecha_creacion as string | number | Date).toISOString()
        : new Date().toISOString(),
      payrollKind:
        typeof row.tipo_registro === "string" && String(row.tipo_registro).trim()
          ? String(row.tipo_registro).trim()
          : "mensual",
      payPrimaServicios: row.incluye_prima_servicios === true,
      primaServiciosCop: Number(row.prima_servicios_cop ?? 0),
      primaServiciosDays: row.prima_dias_semestre != null ? Number(row.prima_dias_semestre) : null,
      settlementDetail:
        includeHeavyJson &&
        row.liquidacion_terminacion_json &&
        typeof row.liquidacion_terminacion_json === "object"
          ? row.liquidacion_terminacion_json
          : null,
      payInteresesCesantias: row.incluye_intereses_cesantias === true,
      interesesCesantiasCop: Number(row.intereses_cesantias_cop ?? 0),
      cesantiasInterestBaseCop:
        row.base_cesantias_interes_cop != null ? Number(row.base_cesantias_interes_cop) : null,
      cesantiasInterestDays: row.dias_interes_cesantias != null ? Number(row.dias_interes_cesantias) : null,
      liquidacionOrigin:
        typeof row.origen_liquidacion === "string" && row.origen_liquidacion.trim()
          ? String(row.origen_liquidacion).trim()
          : "manual",
      workedDays,
      workedDaysPaymentCop,
      noveltiesDetail:
        includeHeavyJson &&
        row.novedades_liquidacion_json &&
        typeof row.novedades_liquidacion_json === "object"
          ? row.novedades_liquidacion_json
          : null,
      ...(includeHeavyJson ? {} : { payrollRunHeavyOmitted: true as const })
    };
  }

  /** Bootstrap: todas las liquidaciones sin volcar JSONB pesados al cliente. */
  private async loadPayrollRunsForBootstrap() {
    const r = await this.pool.query(`
      SELECT ln.id,
             ln.id_empleado,
             ln.nombre_empleado,
             ln.periodo_mes,
             ln.devengado_total,
             ln.base_cotizacion_ibc,
             ln.viaticos_periodo,
             ln.reembolso_combustible,
             ln.viaticos_automaticos,
             ln.reembolso_combustible_automatico,
             ln.viaticos_manuales,
             ln.reembolso_combustible_manual,
             ln.horas_extras_cop,
             ln.auxilios_nomina_formulario,
             ln.bonificaciones_cop,
             ln.cantidad_viajes_conductor,
             ln.viajes_interdepartamentales,
             ln.deduccion_salud,
             ln.deduccion_pension,
             ln.fondo_solidaridad_pensional,
             ln.total_deducciones,
             ln.neto_a_pagar,
             ln.liquidacion_pagada,
             ln.fecha_pago,
             ln.pago_aprobado_por,
             ln.creado_por,
             ln.fecha_creacion,
             ln.tipo_registro,
             ln.incluye_prima_servicios,
             ln.prima_servicios_cop,
             ln.prima_dias_semestre,
             ln.incluye_intereses_cesantias,
             ln.intereses_cesantias_cop,
             ln.base_cesantias_interes_cop,
             ln.dias_interes_cesantias,
             ln.origen_liquidacion,
             (ln.novedades_liquidacion_json #>> '{colillaPagoDiasLaborados,diasLaborados}') AS "__bootstrap_nv_wd_lab",
             (ln.novedades_liquidacion_json #>> '{colillaPagoDiasLaborados,pagoDiasLaboradosCop}') AS "__bootstrap_nv_wd_pay",
             (ln.novedades_liquidacion_json ->> 'diasServicioEnCorteCalendario') AS "__bootstrap_nv_svc_cal"
        FROM liquidaciones_nomina ln
       ORDER BY ln.fecha_creacion DESC`);
    return r.rows.map((row) => this.mapLiquidacionNominaRowToPortalPayrollRun(row as Record<string, unknown>, false));
  }

  async getPayrollRunHeavyPayload(actorUserId: string, role: JwtRole, runId: string) {
    const admin = this.isAdmin(role);
    const [empresaId, permissionSet] = await Promise.all([
      this.getUserCompany(actorUserId),
      this.resolveEffectivePermissionSet(actorUserId, role)
    ]);
    const canPayroll = admin || this.hasPortalPermission(permissionSet, "payroll_manage");
    if (!canPayroll) throw new ForbiddenException("Sin permiso para consultar liquidaciones.");
    const id = String(runId || "").trim();
    if (!PG_UUID_V4_RE.test(id)) throw new BadRequestException("Identificador de liquidación inválido.");
    const r = admin
      ? await this.pool.query(`SELECT * FROM liquidaciones_nomina WHERE id = $1::uuid LIMIT 1`, [id])
      : await this.pool.query(
          `SELECT ln.*
             FROM liquidaciones_nomina ln
             INNER JOIN empleados_nomina e ON e.id = ln.id_empleado
            WHERE ln.id = $1::uuid
              AND ($2::uuid IS NULL OR e.id_empresa = $2::uuid)
            LIMIT 1`,
          [id, empresaId]
        );
    const row = r.rows[0] as Record<string, unknown> | undefined;
    if (!row) throw new NotFoundException("Liquidación no encontrada.");
    return this.mapLiquidacionNominaRowToPortalPayrollRun(row, true);
  }

  async getDeletedTransportTripAuditSnapshot(actorUserId: string, role: JwtRole, logId: string) {
    if (!this.isAdmin(role)) throw new ForbiddenException();
    const id = String(logId || "").trim();
    if (!PG_UUID_V4_RE.test(id)) throw new BadRequestException("Identificador inválido.");
    if (!(await this.tableExists("auditoria_viajes_eliminados"))) {
      throw new NotFoundException("Auditoría no disponible.");
    }
    const r = await this.pool.query(`SELECT datos_json AS snapshot FROM auditoria_viajes_eliminados WHERE id = $1::uuid LIMIT 1`, [id]);
    if (!r.rows.length) throw new NotFoundException("Registro no encontrado.");
    const snap = r.rows[0]?.snapshot ?? null;
    return { snapshot: snap || null };
  }

  async getDeletedTransportRequestAuditSnapshot(actorUserId: string, role: JwtRole, logId: string) {
    if (!this.isAdmin(role)) throw new ForbiddenException();
    const id = String(logId || "").trim();
    if (!PG_UUID_V4_RE.test(id)) throw new BadRequestException("Identificador inválido.");
    if (!(await this.tableExists("auditoria_solicitudes_eliminadas"))) {
      throw new NotFoundException("Auditoría no disponible.");
    }
    const r = await this.pool.query(
      `SELECT datos_json AS snapshot FROM auditoria_solicitudes_eliminadas WHERE id = $1::uuid LIMIT 1`,
      [id]
    );
    if (r.rows.length === 0) throw new NotFoundException("Registro no encontrado.");
    const snap = r.rows[0]?.snapshot ?? null;
    return { snapshot: snap || null };
  }

  private async loadFuelLogs() {
    const r = await this.pool.query(
      `SELECT rc.*,
              u.correo_electronico AS registered_by_email,
              u.nombre_completo AS registered_by_name
       FROM registros_combustible rc
       LEFT JOIN usuarios u ON u.id = rc.id_usuario_registro
       ORDER BY rc.fecha_registro DESC
       LIMIT 1000`
    );
    return r.rows.map((row) => {
      const plate = String(row.placa_vehiculo ?? "").trim().toUpperCase();
      return {
        id: row.id,
        date: row.fecha,
        vehicleId: row.id_vehiculo,
        plate,
        vehiclePlate: plate,
        driverId: row.id_conductor,
        driverName: row.nombre_conductor,
        tripNumber: row.numero_viaje,
        liters: Number(row.litros),
        totalCost: Number(row.costo_total),
        costPerLiter: row.costo_por_litro != null ? Number(row.costo_por_litro) : null,
        odometerKm: row.kilometraje_odometro != null ? Number(row.kilometraje_odometro) : null,
        station: row.estacion,
        paidBy: row.pagado_por,
        registeredByUserId: row.id_usuario_registro != null ? String(row.id_usuario_registro) : null,
        registeredByEmail: maskPortalEmail(row.registered_by_email),
        registeredByName: String(row.registered_by_name ?? "").trim() || null,
        createdAt: row.fecha_registro ? new Date(row.fecha_registro).toISOString() : new Date().toISOString()
      };
    });
  }

  private async loadVehicleTechnicalLogs() {
    const r = await this.pool.query(
      `SELECT rm.*,
              u.correo_electronico AS registered_by_email,
              u.nombre_completo AS registered_by_name
       FROM registros_mantenimiento_vehiculo rm
       LEFT JOIN usuarios u ON u.id = rm.id_usuario_registro
       ORDER BY rm.fecha_registro DESC
       LIMIT 1000`
    );
    return r.rows.map((row) => {
      const plate = String(row.placa_vehiculo ?? "").trim().toUpperCase();
      const interventionType = String(row.tipo_intervencion ?? "preventivo");
      const followUpStatus = String(row.estado_seguimiento ?? "Pendiente");
      return {
        id: row.id,
        date: row.fecha,
        vehicleId: row.id_vehiculo,
        plate,
        vehiclePlate: plate,
        interventionType,
        type: interventionType,
        description: row.descripcion,
        cost: Number(row.costo),
        downtimeHours: Number(row.horas_inactividad),
        followUpStatus,
        status: followUpStatus,
        registeredByUserId: row.id_usuario_registro != null ? String(row.id_usuario_registro) : null,
        registeredByEmail: maskPortalEmail(row.registered_by_email),
        registeredByName: String(row.registered_by_name ?? "").trim() || null,
        createdAt: row.fecha_registro ? new Date(row.fecha_registro).toISOString() : new Date().toISOString()
      };
    });
  }

  private async resolveVehiclePlateForSync(
    c: PoolClient,
    vehicleId: unknown,
    incomingPlate: unknown
  ): Promise<string> {
    const fromRow = String(incomingPlate ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    if (fromRow) return fromRow;
    const vid = String(vehicleId ?? "").trim();
    if (!PG_UUID_V4_RE.test(vid)) return "SINPLACA";
    const r = await c.query<{ placa: string }>(`SELECT placa FROM vehiculos WHERE id = $1::uuid LIMIT 1`, [vid]);
    const p = String(r.rows[0]?.placa ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    return p || "SINPLACA";
  }

  private async loadHrAbsences() {
    const r = await this.pool.query(`SELECT * FROM ausencias_laborales ORDER BY fecha_registro DESC`);
    return r.rows.map((row) => ({
      id: row.id,
      employeeId: row.id_empleado,
      employeeName: row.nombre_empleado,
      type: row.tipo_ausencia,
      absenceType: row.tipo_ausencia,
      subtype: row.subtipo_ausencia,
      absenceSubtype: row.subtipo_ausencia,
      startDate: row.fecha_inicio,
      endDate: row.fecha_fin,
      calendarDays: row.dias_calendario,
      days: row.dias_calendario,
      recognizedDays: row.dias_reconocidos != null ? Number(row.dias_reconocidos) : Number(row.dias_calendario),
      recognizedUnit: row.unidad_dias_reconocidos ?? "calendario",
      supportNumber: row.numero_soporte,
      epsEntity: row.entidad_eps,
      notes: row.observaciones,
      approvedBy: row.aprobado_por,
      approvedAt: row.fecha_aprobacion ? new Date(row.fecha_aprobacion).toISOString() : null,
      createdAt: row.fecha_registro ? new Date(row.fecha_registro).toISOString() : new Date().toISOString()
    }));
  }

  private async loadSstCompliance() {
    const r = await this.pool.query(`SELECT * FROM registros_cumplimiento_sst ORDER BY fecha_creacion DESC`);
    return r.rows.map((row) => ({
      id: row.id,
      employeeId: row.id_empleado,
      employeeName: row.nombre_empleado,
      recordType: row.tipo_registro,
      provider: row.proveedor_entidad,
      dueDate: row.fecha_vencimiento_control,
      expiryDate: row.fecha_vencimiento_control,
      status: row.estado,
      documentCode: row.codigo_documento,
      notes: row.observaciones,
      createdAt: row.fecha_creacion ? new Date(row.fecha_creacion).toISOString() : new Date().toISOString(),
      createdBy: row.creado_por
    }));
  }

  private async normalizeApprovalPayloadForStorage(
    typeRaw: unknown,
    payload: unknown
  ): Promise<Record<string, unknown>> {
    const type = String(typeRaw || "").trim().toLowerCase();
    const rawObj =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? ({ ...(payload as Record<string, unknown>) } as Record<string, unknown>)
        : {};

    if (type === "create_user") {
      const legacyPassword = typeof rawObj.password === "string" ? rawObj.password : "";
      const passwordHash = typeof rawObj.passwordHash === "string" ? rawObj.passwordHash.trim() : "";
      delete rawObj.password;
      const next = normalizeFreeTextPayloadRecord(rawObj);
      if (!passwordHash && legacyPassword) {
        next.passwordHash = await bcrypt.hash(legacyPassword, 10);
      } else if (passwordHash) {
        next.passwordHash = passwordHash;
      }
      return next;
    }

    const base = normalizeFreeTextPayloadRecord(rawObj);

    if (type === "mark_payroll_paid") {
      return {
        payrollRunId: base.payrollRunId ?? "",
        employeeName: base.employeeName ?? "",
        month: base.month ?? ""
      };
    }

    if (type === "approve_trip_request") {
      return {
        requestId: base.requestId ?? ""
      };
    }

    return base;
  }

  private summarizeApprovalPayloadForPortal(
    typeRaw: unknown,
    payload: Record<string, unknown>
  ): Record<string, unknown> {
    const type = String(typeRaw || "").trim().toLowerCase();
    switch (type) {
      case "create_user":
        return {
          email: payload.email ?? "",
          role: payload.role ?? ""
        };
      case "create_driver":
        return {
          name: payload.name ?? "",
          idDoc: payload.idDoc ?? ""
        };
      case "create_employee":
      case "update_employee":
        return {
          employeeId: payload.employeeId ?? "",
          name: payload.name ?? "",
          idDoc: payload.idDoc ?? "",
          position: payload.position ?? ""
        };
      case "register_hr_absence":
        return {
          absenceType: payload.absenceType ?? payload.type ?? "",
          startDate: payload.startDate ?? "",
          endDate: payload.endDate ?? ""
        };
      case "mark_payroll_paid":
        return {
          employeeName: payload.employeeName ?? "",
          month: payload.month ?? "",
          payrollRunId: payload.payrollRunId ?? ""
        };
      case "approve_trip_request":
        return {
          requestId: payload.requestId ?? ""
        };
      default:
        return {};
    }
  }

  private async approvalPayloadForPortal(
    typeRaw: unknown,
    payload: unknown,
    fullAccess: boolean
  ): Promise<Record<string, unknown>> {
    const normalized = await this.normalizeApprovalPayloadForStorage(typeRaw, payload);
    return fullAccess ? normalized : this.summarizeApprovalPayloadForPortal(typeRaw, normalized);
  }

  private async loadApprovals(admin: boolean, userId: string, empresaId: string | null) {
    const base = `SELECT id::text, tipo_solicitud AS type, titulo AS title, datos_json AS payload,
       estado::text AS status, id_usuario_solicitante::text AS "requestedByUserId",
       nombre_solicitante AS "requestedByName", fecha_solicitud AS "requestedAt",
       fecha_revision AS "reviewedAt", revisado_por AS "reviewedBy", motivo_rechazo AS "rejectionReason"
       FROM solicitudes_autorizacion`;
    const r = admin
      ? await this.pool.query(base + ` ORDER BY fecha_solicitud DESC LIMIT 500`)
      : await this.pool.query(
          base +
            ` WHERE id_usuario_solicitante = $1::uuid OR ($2::uuid IS NOT NULL AND datos_json->>'companyId' = $2::text)
              ORDER BY fecha_solicitud DESC LIMIT 200`,
          [userId, empresaId]
        );
    return Promise.all(
      r.rows.map(async (a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        status: a.status,
        requestedByUserId: a.requestedByUserId,
        requestedByName: a.requestedByName,
        requestedAt: a.requestedAt ? new Date(a.requestedAt).toISOString() : null,
        reviewedAt: a.reviewedAt ? new Date(a.reviewedAt).toISOString() : null,
        reviewedBy: a.reviewedBy,
        rejectionReason: a.rejectionReason,
        payload: await this.approvalPayloadForPortal(a.type, a.payload, admin)
      }))
    );
  }

  /* ─── Sync (upsert por id) ─── */

  /** Evita 500 por cast inválido a UUID en PostgreSQL (datos legacy o cliente desfasado). */
  private skipUnlessPersistUuid(scope: string, rawId: unknown): boolean {
    const s = String(rawId ?? "").trim();
    if (PG_UUID_V4_RE.test(s)) return false;
    this.logger.warn(`${scope}: omitiendo fila (id no UUID): ${s.slice(0, 36)}`);
    return true;
  }

  /** Borrado explícito por UUID (p. ej. último ítem cuando el payload llega vacío). */
  private async deleteRowsByExplicitIds(
    c: PoolClient,
    table: string,
    deletedIds: unknown[] | undefined
  ): Promise<void> {
    const ids = (Array.isArray(deletedIds) ? deletedIds : [])
      .map((raw) => String(raw ?? "").trim())
      .filter((s) => PG_UUID_V4_RE.test(s));
    if (ids.length === 0) {
      return;
    }
    await c.query(`DELETE FROM ${table} WHERE id = ANY($1::uuid[])`, [ids]);
  }

  private syncPruneTableForKey(key: PortalSyncKey): string | null {
    const map: Partial<Record<PortalSyncKey, string>> = {
      positions: "cargos",
      vacancies: "vacantes",
      candidates: "candidatos",
      interviews: "entrevistas",
      contracts: "contratos",
      payrollEmployees: "empleados_nomina",
      payrollRuns: "liquidaciones_nomina",
      hrAbsences: "ausencias_laborales",
      sstCompliance: "registros_cumplimiento_sst"
    };
    return map[key] ?? null;
  }

  /**
   * Política de borrado vía sync: el sync NO debe borrar la BD por "poda de lista".
   * Solo se permite el borrado EXPLÍCITO por `deletedIds` (equivalente a un delete del
   * usuario). La eliminación masiva de registros debe hacerse exclusivamente por los
   * endpoints/funciones de borrado (admin-*-delete), nunca por reflejar una lista parcial
   * del navegador, para evitar wipes accidentales de la base de datos.
   */
  private async syncListWithPruning(
    c: PoolClient,
    table: string,
    data: unknown[],
    deletedIds?: string[]
  ): Promise<void> {
    void data;
    await this.deleteRowsByExplicitIds(c, table, deletedIds);
  }

  private async syncUsers(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException("Formato invalido");
    const admin = this.isAdmin(role);
    for (const u of data) {
      if (!u?.id) continue;
      if (this.skipUnlessPersistUuid("syncUsers", u.id)) continue;
      if (!admin && String(u.id) !== userId) throw new ForbiddenException();
      const parentesco =
        (u as { emergencyRelationship?: string; emergencyRelation?: string }).emergencyRelationship ??
        (u as { emergencyRelation?: string }).emergencyRelation ??
        null;
      const rawPortal =
        (u as { portalSince?: string; systemJoinDate?: string }).portalSince ??
        (u as { systemJoinDate?: string }).systemJoinDate ??
        null;
      const fechaIngresoPortal =
        rawPortal != null && String(rawPortal).trim() !== "" ? String(rawPortal).trim().slice(0, 10) : null;

      const rec = u as Record<string, unknown>;
      const birthRaw = rec.birthDate;
      const birthDateSql =
        birthRaw != null && String(birthRaw).trim() !== ""
          ? String(birthRaw).trim().slice(0, 10)
          : null;
      const fechaNacimiento =
        birthDateSql && /^\d{4}-\d{2}-\d{2}$/.test(birthDateSql) ? birthDateSql : null;

      await c.query(
        `UPDATE usuarios SET
          nombre_completo = COALESCE(NULLIF(trim(COALESCE($2::text, '')), ''), nombre_completo),
          primer_nombre = COALESCE(NULLIF(trim(COALESCE($3::text, '')), ''), primer_nombre),
          segundo_nombre = COALESCE(NULLIF(trim(COALESCE($4::text, '')), ''), segundo_nombre),
          primer_apellido = COALESCE(NULLIF(trim(COALESCE($5::text, '')), ''), primer_apellido),
          segundo_apellido = COALESCE(NULLIF(trim(COALESCE($6::text, '')), ''), segundo_apellido),
          telefono = COALESCE(NULLIF(trim(COALESCE($7::text, '')), ''), telefono),
          departamento = COALESCE(NULLIF(trim(COALESCE($8::text, '')), ''), departamento),
          ciudad = COALESCE(NULLIF(trim(COALESCE($9::text, '')), ''), ciudad),
          direccion = COALESCE(NULLIF(trim(COALESCE($10::text, '')), ''), direccion),
          contacto_emergencia = COALESCE(NULLIF(trim(COALESCE($11::text, '')), ''), contacto_emergencia),
          telefono_emergencia = COALESCE(NULLIF(trim(COALESCE($12::text, '')), ''), telefono_emergencia),
          parentesco_emergencia = COALESCE(NULLIF(trim(COALESCE($13::text, '')), ''), parentesco_emergencia),
          url_avatar = COALESCE(NULLIF(trim(COALESCE($14::text, '')), ''), url_avatar),
          cargo_registro = COALESCE(NULLIF(trim(COALESCE($15::text, '')), ''), cargo_registro),
          area_trabajo = COALESCE(NULLIF(trim(COALESCE($16::text, '')), ''), area_trabajo),
          checklist_registro_json = COALESCE($17::jsonb, checklist_registro_json),
          fecha_ingreso_portal = COALESCE($18::date, fecha_ingreso_portal),
          tipo_persona = COALESCE(NULLIF(trim(COALESCE($19::text, '')), ''), tipo_persona),
          genero = COALESCE(NULLIF(trim(COALESCE($20::text, '')), ''), genero),
          fecha_nacimiento = COALESCE($21::date, fecha_nacimiento),
          tipo_documento = COALESCE(NULLIF(trim(COALESCE($22::text, '')), ''), tipo_documento),
          numero_identificacion = COALESCE(NULLIF(trim(COALESCE($23::text, '')), ''), numero_identificacion),
          nombre_empresa_texto_legacy = COALESCE(NULLIF(trim(COALESCE($24::text, '')), ''), nombre_empresa_texto_legacy)
        WHERE id = $1::uuid`,
        [
          u.id,
          nuN(u.name),
          nuN(u.firstName),
          nuN(u.middleName),
          nuN(u.lastName),
          nuN(u.secondLastName),
          nuN(u.phone),
          cat(u.department),
          cat(u.city),
          nuN(u.address),
          nuN(u.emergencyContact),
          nuN(u.emergencyPhone),
          nuN(parentesco),
          u.avatarUrl != null && String(u.avatarUrl).trim() !== "" ? String(u.avatarUrl).trim() : null,
          nuN(u.position),
          nuN(u.workArea),
          u.profileQualityChecklist ? JSON.stringify(u.profileQualityChecklist) : null,
          fechaIngresoPortal,
          rec.personType != null && String(rec.personType).trim() !== ""
            ? normalizePersonTypeForDb(String(rec.personType))
            : null,
          nuN(rec.gender),
          fechaNacimiento,
          nuN(rec.documentType),
          rec.taxId != null || rec.personalDoc != null
            ? nuN(String(rec.taxId ?? rec.personalDoc ?? "")) || null
            : null,
          nuN(rec.company)
        ]
      );
      if (admin && rec.twoFactorEnabled !== undefined && rec.twoFactorEnabled !== null) {
        const on =
          rec.twoFactorEnabled === true ||
          rec.twoFactorEnabled === 1 ||
          String(rec.twoFactorEnabled).trim().toLowerCase() === "true";
        await c.query(`UPDATE usuarios SET autenticacion_dos_factores = $2::boolean WHERE id = $1::uuid`, [
          u.id,
          on
        ]);
      }
      if (admin && Array.isArray(u.permissions)) {
        await c.query(`DELETE FROM permisos_usuario WHERE id_usuario = $1::uuid`, [u.id]);
        for (const perm of u.permissions) {
          await c.query(
            `INSERT INTO permisos_usuario (id_usuario, permiso) VALUES ($1::uuid, $2)
             ON CONFLICT (id_usuario, permiso) DO NOTHING`,
            [u.id, String(perm)]
          );
        }
      }
      if (admin && u.accountStatus) {
        await c.query(`UPDATE usuarios SET estado_cuenta = $2::estado_cuenta_usuario WHERE id = $1::uuid`, [
          u.id,
          u.accountStatus
        ]);
      }
      if (admin && u.companyId !== undefined) {
        await c.query(`UPDATE usuarios SET id_empresa = $2::uuid WHERE id = $1::uuid`, [u.id, u.companyId || null]);
      }
      if (admin && u.role) {
        await c.query(`UPDATE usuarios SET rol = $2::rol_usuario WHERE id = $1::uuid`, [u.id, String(u.role).toLowerCase()]);
      }
      if (admin && rec.registrationKind !== undefined && rec.registrationKind !== null) {
        const rk = String(rec.registrationKind).trim().toLowerCase();
        const tipo = rk === "empleado_interno" ? "empleado_interno" : rk === "cliente" ? "cliente" : null;
        if (tipo) {
          await c.query(
            `UPDATE usuarios SET tipo_vinculo_registro = $2::tipo_vinculo_registro WHERE id = $1::uuid`,
            [u.id, tipo]
          );
        }
      }
    }
  }

  private async syncCompanies(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const row of data) {
      if (!row?.id) continue;
      const id = String(row.id).trim();
      if (this.skipUnlessPersistUuid("syncCompanies", id)) continue;
      const rec = row as Record<string, unknown>;
      const nombre = pickPortalField(rec, "name", "nombre");
      const nit = pickPortalField(rec, "nit", "taxId");
      if (nombre === undefined || nit === undefined) continue;
      const phoneVal = pickPortalField(rec, "phone", "telefono");
      const telefono =
        phoneVal === undefined || phoneVal === null || String(phoneVal).trim() === ""
          ? null
          : String(phoneVal).trim();
      const kindPick =
        pickPortalField(rec, "companyKind", "company_kind") ??
        pickPortalField(rec, "tipoRelacionEmpresa", "tipo_relacion_empresa");
      const ks = kindPick != null ? String(kindPick).trim().toLowerCase() : "";
      const tipoRelacion =
        ks === "tercero" ? "tercero" : ks === "propia" ? "propia" : "cliente";
      const rawActive = pickPortalField(rec, "active", "activo");
      const activo =
        rawActive === undefined || rawActive === null
          ? true
          : Boolean(
              rawActive === true ||
                rawActive === 1 ||
                String(rawActive).trim().toLowerCase() === "true"
            );
      const logoPick = pickPortalField(rec, "logoUrl", "logo_url", "urlLogo", "url_logo");
      const urlLogo =
        logoPick === undefined || logoPick === null || String(logoPick).trim() === ""
          ? null
          : String(logoPick).trim();
      const emailPick = pickPortalField(rec, "email", "correo_empresarial", "correo");
      const correoEmpRaw = em(emailPick);
      const correoEmp = correoEmpRaw ? correoEmpRaw.slice(0, 120) : null;
      const contactPick = pickPortalField(rec, "contactName", "nombre_contacto");
      const nombreContactoRaw = nuN(contactPick);
      const nombreContacto = nombreContactoRaw ? nombreContactoRaw.slice(0, 255) : null;
      const deptPick = pickPortalField(rec, "department", "departamento");
      const departamentoRaw = cat(deptPick);
      const departamento = departamentoRaw ? departamentoRaw.slice(0, 120) : null;
      const cityPick = pickPortalField(rec, "city", "ciudad");
      const ciudadRaw = cat(cityPick);
      const ciudad = ciudadRaw ? ciudadRaw.slice(0, 120) : null;
      const addrPick = pickPortalField(rec, "address", "direccion_operativa", "direccion");
      const direccionOp = nuN(addrPick);
      const audit = portalAuditActorPairFromRecord(rec);
      await c.query(
        `INSERT INTO empresas (id, nombre, nit, telefono, correo_empresarial, nombre_contacto, departamento, ciudad, direccion_operativa, tipo_relacion_empresa, activo, url_logo, creado_por, actualizado_por)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10::tipo_relacion_empresa, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           nit = EXCLUDED.nit,
           telefono = EXCLUDED.telefono,
           correo_empresarial = EXCLUDED.correo_empresarial,
           nombre_contacto = EXCLUDED.nombre_contacto,
           departamento = EXCLUDED.departamento,
           ciudad = EXCLUDED.ciudad,
           direccion_operativa = EXCLUDED.direccion_operativa,
           tipo_relacion_empresa = EXCLUDED.tipo_relacion_empresa,
           activo = EXCLUDED.activo,
           url_logo = EXCLUDED.url_logo,
           creado_por = COALESCE(empresas.creado_por, EXCLUDED.creado_por),
           actualizado_por = COALESCE(EXCLUDED.actualizado_por, empresas.actualizado_por),
           fecha_actualizacion = now()`,
        [
          id,
          nu(nombre),
          String(nit).trim(),
          telefono != null ? nu(String(telefono)) : null,
          correoEmp,
          nombreContacto,
          departamento,
          ciudad,
          direccionOp,
          tipoRelacion,
          activo,
          urlLogo,
          audit.createdBy,
          audit.updatedBy
        ]
      );
    }
  }

  private async syncCounters(c: PoolClient, data: unknown) {
    if (!data || typeof data !== "object") throw new ForbiddenException();
    for (const [prefijo, val] of Object.entries(data as Record<string, number>)) {
      await c.query(
        `INSERT INTO contadores_secuencia (prefijo, ultimo_valor) VALUES ($1, $2)
         ON CONFLICT (prefijo) DO UPDATE SET ultimo_valor = EXCLUDED.ultimo_valor`,
        [prefijo, Math.max(0, Math.floor(Number(val) || 0))]
      );
    }
  }

  private async syncContacts(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const row of data) {
      if (!row?.id) continue;
      if (this.skipUnlessPersistUuid("syncContacts", row.id)) continue;
      await c.query(
        `INSERT INTO prospectos_contacto_b2b (
          id, nombre_contacto, nombre_empresa, nit, cargo_contacto, telefono, correo_electronico,
          tipo_servicio, tipo_operacion, frecuencia_operacion, ventana_inicio_servicio, mensaje
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        ON CONFLICT (id) DO UPDATE SET
          nombre_contacto = EXCLUDED.nombre_contacto,
          nombre_empresa = EXCLUDED.nombre_empresa,
          nit = EXCLUDED.nit,
          cargo_contacto = EXCLUDED.cargo_contacto,
          telefono = EXCLUDED.telefono,
          correo_electronico = EXCLUDED.correo_electronico,
          tipo_servicio = EXCLUDED.tipo_servicio,
          tipo_operacion = EXCLUDED.tipo_operacion,
          frecuencia_operacion = EXCLUDED.frecuencia_operacion,
          ventana_inicio_servicio = EXCLUDED.ventana_inicio_servicio,
          mensaje = EXCLUDED.mensaje`,
        [
          row.id,
          nu(row.contactName),
          nu(row.companyName),
          String(row.nit ?? "").trim(),
          nu(row.role),
          String(row.phone ?? "").trim(),
          em(row.email),
          nu(row.serviceType),
          nu(row.operationType),
          nu(row.frequency),
          nu(row.serviceWindow),
          nu(row.message)
        ]
      );
    }
  }

  /** Campos mínimos para derivar `tipo_servicio` y `refrigeracion_termoking` (lectura segura con índice). */
  private solicitudThermoPayloadSlice(req: unknown): {
    serviceType?: unknown;
    refrigeracionTermoking?: unknown;
    requiresThermoking?: unknown;
  } {
    if (!req || typeof req !== "object") return {};
    const o = req as Record<string, unknown>;
    return {
      serviceType: o["serviceType"],
      refrigeracionTermoking: o["refrigeracionTermoking"],
      requiresThermoking: o["requiresThermoking"]
    };
  }

  /**
   * `tipo_servicio` en BD = solo modo: nacional o entre sedes (sin mezclar Termoking).
   */
  private solicitudModoTransporteFromPayload(req: unknown): string {
    const { serviceType } = this.solicitudThermoPayloadSlice(req);
    const raw = String(serviceType ?? "").trim();
    const allowed = new Set(["Transporte nacional", "Transporte entre sedes del cliente"]);
    if (allowed.has(raw)) return raw;
    const lower = raw.toLowerCase();
    if (lower.includes("entre sedes") || lower.includes("sedes del cliente")) {
      return "Transporte entre sedes del cliente";
    }
    return "Transporte nacional";
  }

  private static readonly SOLICITUD_TIPOS_CAMION_CLIENTE = new Set(["Turbo", "Camión", "Tractomula"]);

  private static readonly SOLICITUD_ESTADOS_VALIDOS = new Set([
    "Pendiente",
    "Aprobada pendiente asignacion",
    "Viaje asignado",
    "En transito",
    "Espera standby",
    "Completada",
    "Cerrada",
    "Cancelada",
    "Rechazada"
  ]);

  private solicitudEstadoFromPayload(req: unknown): string {
    const raw = String((req as { status?: unknown })?.status ?? "Pendiente").trim();
    if (PortalService.SOLICITUD_ESTADOS_VALIDOS.has(raw)) return raw;
    return "Pendiente";
  }

  /** `tipo_vehiculo_solicitado`: tipo de camión pedido por el cliente (o "Por definir" si legacy). */
  private solicitudTipoCamionFromPayload(req: Record<string, unknown>): string {
    const raw = String(req["vehicleType"] ?? req["requiredTruckType"] ?? "").trim();
    if (PortalService.SOLICITUD_TIPOS_CAMION_CLIENTE.has(raw)) return raw;
    return "Por definir";
  }

  /** `numero_fuelles`: solo Turbo / Camión. */
  private solicitudNumeroFuellesFromPayload(req: Record<string, unknown>, tipoCamion: string): number | null {
    if (tipoCamion !== "Turbo" && tipoCamion !== "Camión") return null;
    const raw = req["fuelles"];
    const n = typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.floor(n);
  }

  /**
   * Bandera Termoking en `refrigeracion_termoking`. Prioriza boolean explícito del portal;
   * si no, `requiresThermoking` (yes/no) o texto legacy en `serviceType`.
   */
  private solicitudRefrigeracionFromPayload(req: unknown): boolean {
    const { serviceType, refrigeracionTermoking, requiresThermoking } = this.solicitudThermoPayloadSlice(req);
    if (typeof refrigeracionTermoking === "boolean") return refrigeracionTermoking;
    const rt = refrigeracionTermoking;
    if (rt === true || rt === 1 || rt === "1") return true;
    if (rt === false || rt === 0 || rt === "0") return false;
    const formTk = String(requiresThermoking ?? "").toLowerCase();
    if (formTk === "yes" || formTk === "si" || formTk === "true" || formTk === "1") return true;
    if (formTk === "no" || formTk === "false" || formTk === "0") return false;
    const s = String(serviceType ?? "").toLowerCase();
    if (!s) return false;
    if (s === "dry" || s.includes("sin termoking") || s.includes("without thermo")) return false;
    if (s === "refrigerated") return true;
    if (s.includes("termoking") && !s.includes("sin termoking")) return true;
    if (s.includes("thermo king")) return true;
    if (s.includes("refrigerada") || s.includes("refrigerado")) return true;
    return false;
  }

  private static readonly FLEET_OP_TYPE_KEYS = new Set(["camion", "turbo", "tractomula"]);
  /** Estados operativos donde el viaje sigue reservando vehículo/conductor (texto = enum en BD). */
  private static readonly SOLICITUD_ACTIVE_OVERLAP_STATUSES = ["Viaje asignado", "En transito", "Espera standby"];

  /** Fin de franja programada (equivalente a tstzrange '[)' sin usar GiST en índices). */
  private static readonly VIAJE_FIN_PROGRAMADO_SQL = `COALESCE(v.fecha_hora_entrega_programada, v.fecha_hora_recogida_programada + interval '1 minute')`;

  private stripDiacritics(input: string): string {
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  private fleetTypeKey(raw: unknown): string {
    return this.stripDiacritics(String(raw ?? "").trim()).toLowerCase();
  }

  /** Ventana programada recogida→entrega (misma regla que `app.js`). */
  private parseTripScheduleRangeMs(startMs: number, endMs: number): { start: number; end: number } | null {
    if (!Number.isFinite(startMs)) return null;
    const endRaw = Number.isFinite(endMs) ? endMs : startMs;
    const end = endRaw > startMs ? endRaw : startMs + 60 * 1000;
    return { start: startMs, end };
  }

  /** Sin cruce: inicio nuevo ≥ fin existente, o fin nuevo ≤ inicio existente. */
  private tripScheduleRangesConflictMs(
    newStart: number,
    newEnd: number,
    existStart: number,
    existEnd: number
  ): boolean {
    if (newStart >= existEnd) return false;
    if (newEnd <= existStart) return false;
    return true;
  }

  private formatTripScheduleConflictMessage(
    resourceLabel: string,
    tripNumber: string,
    pickup: Date,
    delivery: Date
  ): string {
    const fmt = (d: Date) =>
      d.toLocaleString("es-CO", {
        timeZone: "America/Bogota",
        dateStyle: "short",
        timeStyle: "short"
      });
    return `Conflicto de horario: el ${resourceLabel} ya tiene programado el viaje ${tripNumber || "-"} (${fmt(pickup)} – ${fmt(delivery)}).`;
  }

  /**
   * POST /portal/transport-schedule-busy — una query (solape por comparación; índices btree en 35_*).
   */
  async getTransportScheduleBusy(userId: string, role: JwtRole, dto: TransportScheduleBusyDto) {
    const permissionSet = this.isAdmin(role)
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.loadPortalPermissionSet(userId);
    if (
      !this.isAdmin(role) &&
      !this.hasPortalPermission(permissionSet, "transport_trips") &&
      !this.hasPortalPermission(permissionSet, "transport_calendar")
    ) {
      throw new ForbiddenException();
    }
    const pickup = new Date(dto.pickupAt);
    const delivery = new Date(dto.deliveryAt);
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(delivery.getTime())) {
      throw new BadRequestException("Recogida o entrega no son fechas válidas.");
    }
    if (delivery.getTime() <= pickup.getTime()) {
      throw new BadRequestException("La entrega debe ser posterior a la recogida.");
    }
    const excludeRaw = String(dto.excludeRequestId ?? "").trim();
    const excludeId = excludeRaw && PG_UUID_V4_RE.test(excludeRaw) ? excludeRaw : null;
    const statuses = PortalService.SOLICITUD_ACTIVE_OVERLAP_STATUSES;
    try {
      const r = await this.pool.query<{ vehicle_id: string | null; driver_id: string | null }>(
        `SELECT DISTINCT v.id_vehiculo::text AS vehicle_id, v.id_conductor::text AS driver_id
         FROM viajes_transporte v
         INNER JOIN solicitudes_transporte s ON s.id = v.id_solicitud
         WHERE s.estado::text = ANY($1::text[])
           AND ($2::uuid IS NULL OR v.id_solicitud <> $2::uuid)
           AND v.fecha_hora_recogida_programada < $4::timestamptz
           AND ${PortalService.VIAJE_FIN_PROGRAMADO_SQL} > $3::timestamptz`,
        [statuses, excludeId, pickup.toISOString(), delivery.toISOString()]
      );
      const busyVehicleIds = new Set<string>();
      const busyDriverIds = new Set<string>();
      for (const row of r.rows) {
        const vid = String(row.vehicle_id || "").trim();
        const did = String(row.driver_id || "").trim();
        if (vid) busyVehicleIds.add(vid);
        if (did) busyDriverIds.add(did);
      }
      return {
        busyVehicleIds: [...busyVehicleIds],
        busyDriverIds: [...busyDriverIds]
      };
    } catch (err: unknown) {
      if (String((err as { code?: string })?.code || "") === "42P01") {
        return { busyVehicleIds: [], busyDriverIds: [] };
      }
      throw err;
    }
  }

  private dateFromDbCell(v: unknown, label: string): Date {
    const d = v instanceof Date ? v : new Date(String(v ?? ""));
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException(`${label} no es una fecha válida en base de datos.`);
    }
    return d;
  }

  /** Evita 500 en PostgreSQL cuando el portal envía timestamp vacío o inválido. */
  private portalTimestamptzOrThrow(v: unknown, label: string): string {
    const raw = String(v ?? "").trim();
    if (!raw) {
      throw new BadRequestException(`Falta ${label} en la solicitud.`);
    }
    const d = v instanceof Date ? v : new Date(raw);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException(`${label} no es una fecha y hora válida.`);
    }
    return d.toISOString();
  }

  /**
   * Viaje: valida contra `solicitudes_transporte`, `vehiculos` y `conductores` ya persistidos.
   * Devuelve placa, tipo asignado, nombre/tel conductor y ventana programada leídos de tablas (no del payload).
   */
  private async resolveTripRowFromDatabase(
    c: PoolClient,
    solicitudId: string,
    tripPayload: Record<string, unknown>
  ): Promise<{
    vehicleId: string;
    driverId: string;
    vehiclePlate: string;
    vehicleTipoAsignado: string;
    driverName: string;
    driverPhone: string | null;
    pickupProg: Date;
    deliveryProg: Date;
  }> {
    const vehicleIdRaw = String(tripPayload.vehicleId ?? "").trim();
    const driverIdRaw = String(tripPayload.driverId ?? "").trim();
    if (!PG_UUID_V4_RE.test(vehicleIdRaw)) {
      throw new BadRequestException("Identificador de vehículo inválido para registrar el viaje.");
    }
    if (!PG_UUID_V4_RE.test(driverIdRaw)) {
      throw new BadRequestException("Identificador de conductor inválido para registrar el viaje.");
    }

    const sRes = await c.query(
      `SELECT tipo_vehiculo_solicitado, refrigeracion_termoking, peso_kg,
              fecha_hora_recogida, fecha_hora_entrega_estimada
       FROM solicitudes_transporte WHERE id = $1::uuid`,
      [solicitudId]
    );
    if (!sRes.rows.length) {
      throw new BadRequestException("La solicitud no está en base de datos; no se puede registrar el viaje.");
    }
    const s = sRes.rows[0] as Record<string, unknown>;
    const tipoSolicitado = String(s.tipo_vehiculo_solicitado ?? "").trim();
    const reqTk = Boolean(s.refrigeracion_termoking);
    const pesoKg = Math.max(0, Number(s.peso_kg) || 0);
    const pickupProg = this.dateFromDbCell(s.fecha_hora_recogida, "fecha_hora_recogida");
    const deliveryProg = this.dateFromDbCell(s.fecha_hora_entrega_estimada, "fecha_hora_entrega_estimada");

    const vRes = await c.query(
      `SELECT tipo_vehiculo, capacidad_kg, refrigerado_termoking, placa, disponible, ocupado_por_sistema
       FROM vehiculos WHERE id = $1::uuid`,
      [vehicleIdRaw]
    );
    if (!vRes.rows.length) {
      throw new BadRequestException("El vehículo no existe en la tabla vehiculos.");
    }
    const v = vRes.rows[0] as Record<string, unknown>;
    const vehManualOff = v.disponible === false && v.ocupado_por_sistema !== true;
    if (vehManualOff) {
      throw new BadRequestException("El vehículo está marcado como no disponible en base de datos.");
    }

    const dRes = await c.query(
      `SELECT nombre_completo, telefono, disponible, ocupado_por_sistema
       FROM conductores WHERE id = $1::uuid`,
      [driverIdRaw]
    );
    if (!dRes.rows.length) {
      throw new BadRequestException("El conductor no existe en la tabla conductores.");
    }
    const d = dRes.rows[0] as Record<string, unknown>;
    const drvManualOff = d.disponible === false && d.ocupado_por_sistema !== true;
    if (drvManualOff) {
      throw new BadRequestException("El conductor está marcado como no disponible en base de datos.");
    }

    const vehTipoKey = this.fleetTypeKey(v.tipo_vehiculo);
    if (!PortalService.FLEET_OP_TYPE_KEYS.has(vehTipoKey)) {
      throw new BadRequestException(
        "El tipo de vehículo en base de datos no es operativo (se espera Camión, Turbo o Tractomula)."
      );
    }
    const solKey = this.fleetTypeKey(tipoSolicitado);
    if (solKey && solKey !== "por definir" && solKey !== vehTipoKey) {
      throw new BadRequestException(
        `El vehículo en flota (${String(v.tipo_vehiculo)}) no coincide con el tipo solicitado registrado en la solicitud (${tipoSolicitado}).`
      );
    }

    const vehTk =
      v.refrigerado_termoking === true ||
      v.refrigerado_termoking === 1 ||
      String(v.refrigerado_termoking ?? "")
        .toLowerCase()
        .trim() === "true";
    if (reqTk && !vehTk) {
      throw new BadRequestException(
        "La solicitud en base exige refrigeración (Termoking) y el vehículo no está habilitado como refrigerado."
      );
    }
    if (!reqTk && vehTk) {
      throw new BadRequestException(
        "La solicitud en base es seca (sin Termoking) y el vehículo está marcado como refrigerado."
      );
    }

    const capKg = Math.max(0, Number(v.capacidad_kg) || 0);
    if (capKg < pesoKg) {
      throw new BadRequestException(
        `La capacidad del vehículo en base (${capKg} kg) es inferior al peso de la solicitud (${pesoKg} kg).`
      );
    }

    const candStart = pickupProg.getTime();
    const candEnd = deliveryProg.getTime();
    const cand = this.parseTripScheduleRangeMs(candStart, candEnd);
    if (!cand) {
      throw new BadRequestException("No fue posible calcular la ventana horaria de la solicitud para validar solapes.");
    }

    const statusArr = PortalService.SOLICITUD_ACTIVE_OVERLAP_STATUSES;

    const vOverlap = await c.query(
      `SELECT v.fecha_hora_recogida_programada, v.fecha_hora_entrega_programada, v.numero_viaje
       FROM viajes_transporte v
       INNER JOIN solicitudes_transporte s ON s.id = v.id_solicitud
       WHERE v.id_vehiculo = $1::uuid
         AND v.id_solicitud <> $2::uuid
         AND s.estado::text = ANY($3::text[])`,
      [vehicleIdRaw, solicitudId, statusArr]
    );
    for (const row of vOverlap.rows) {
      const r = row as Record<string, unknown>;
      const pu = this.dateFromDbCell(r.fecha_hora_recogida_programada, "recogida (viaje existente)");
      const delRaw = r.fecha_hora_entrega_programada ?? r.fecha_hora_recogida_programada;
      const del = this.dateFromDbCell(delRaw, "entrega (viaje existente)");
      if (
        this.tripScheduleRangesConflictMs(candStart, candEnd, pu.getTime(), del.getTime())
      ) {
        throw new BadRequestException(
          this.formatTripScheduleConflictMessage(
            "vehículo",
            String(r.numero_viaje ?? "").trim(),
            pu,
            del
          )
        );
      }
    }

    const dOverlap = await c.query(
      `SELECT v.fecha_hora_recogida_programada, v.fecha_hora_entrega_programada, v.numero_viaje
       FROM viajes_transporte v
       INNER JOIN solicitudes_transporte s ON s.id = v.id_solicitud
       WHERE v.id_conductor = $1::uuid
         AND v.id_solicitud <> $2::uuid
         AND s.estado::text = ANY($3::text[])`,
      [driverIdRaw, solicitudId, statusArr]
    );
    for (const row of dOverlap.rows) {
      const r = row as Record<string, unknown>;
      const pu = this.dateFromDbCell(r.fecha_hora_recogida_programada, "recogida (viaje existente)");
      const delRaw = r.fecha_hora_entrega_programada ?? r.fecha_hora_recogida_programada;
      const del = this.dateFromDbCell(delRaw, "entrega (viaje existente)");
      if (
        this.tripScheduleRangesConflictMs(candStart, candEnd, pu.getTime(), del.getTime())
      ) {
        throw new BadRequestException(
          this.formatTripScheduleConflictMessage(
            "conductor",
            String(r.numero_viaje ?? "").trim(),
            pu,
            del
          )
        );
      }
    }

    const plateSql = String(v.placa ?? "")
      .trim()
      .toUpperCase();
    if (!plateSql) {
      throw new BadRequestException("El vehículo en base no tiene placa registrada.");
    }

    return {
      vehicleId: vehicleIdRaw,
      driverId: driverIdRaw,
      vehiclePlate: plateSql,
      vehicleTipoAsignado: String(v.tipo_vehiculo ?? "").trim(),
      driverName: String(d.nombre_completo ?? "").trim() || "Por definir",
      driverPhone:
        d.telefono != null && String(d.telefono).trim() !== "" ? String(d.telefono).trim() : null,
      pickupProg,
      deliveryProg
    };
  }

  private static readonly SOLICITUD_NUMERO_RE = /^SOL-(\d{1,6})$/i;

  /** Alinea contador `request` con el mayor SOL-###### ya persistido (clientes sin sync de counters). */
  private async syncRequestCounterFromExistingTx(c: PoolClient): Promise<void> {
    if (!(await this.tableExists("contadores_secuencia"))) return;
    const r = await c.query<{ max_n: string | null }>(
      `SELECT MAX(
         CAST(NULLIF(regexp_replace(upper(numero_solicitud), '^SOL-', ''), '') AS INTEGER)
       )::text AS max_n
       FROM solicitudes_transporte
       WHERE upper(numero_solicitud) LIKE 'SOL-%'`
    );
    const maxN = Math.max(0, Math.floor(Number(r.rows[0]?.max_n) || 0));
    if (maxN > 0) {
      await this.bumpCounterAtLeastTx(c, "request", maxN);
    }
  }

  private async bumpCounterTx(c: PoolClient, prefijo: string): Promise<number> {
    const r = await c.query<{ ultimo_valor: string | number }>(
      `INSERT INTO contadores_secuencia (prefijo, ultimo_valor) VALUES ($1, 1)
       ON CONFLICT (prefijo) DO UPDATE SET ultimo_valor = contadores_secuencia.ultimo_valor + 1
       RETURNING ultimo_valor`,
      [prefijo]
    );
    return Math.max(1, Math.floor(Number(r.rows[0]?.ultimo_valor) || 1));
  }

  private async bumpCounterAtLeastTx(c: PoolClient, prefijo: string, minValue: number): Promise<void> {
    const min = Math.max(0, Math.floor(Number(minValue) || 0));
    await c.query(
      `INSERT INTO contadores_secuencia (prefijo, ultimo_valor) VALUES ($1, $2)
       ON CONFLICT (prefijo) DO UPDATE SET ultimo_valor = GREATEST(contadores_secuencia.ultimo_valor, EXCLUDED.ultimo_valor)`,
      [prefijo, min]
    );
  }

  /** Evita 500 por `uq_solicitudes_transporte_numero` cuando el portal no tiene contadores sincronizados. */
  private async ensureUniqueRequestNumberTx(c: PoolClient, proposed: unknown): Promise<string> {
    await this.syncRequestCounterFromExistingTx(c);
    const raw = String(proposed ?? "").trim().toUpperCase();
    if (PortalService.SOLICITUD_NUMERO_RE.test(raw)) {
      const taken = await c.query(
        `SELECT 1 FROM solicitudes_transporte WHERE upper(numero_solicitud) = $1 LIMIT 1`,
        [raw]
      );
      if (!taken.rowCount) {
        const m = PortalService.SOLICITUD_NUMERO_RE.exec(raw);
        const n = m ? Number(m[1]) : 0;
        if (Number.isFinite(n) && n > 0) {
          await this.bumpCounterAtLeastTx(c, "request", n);
        }
        return `SOL-${String(m ? m[1] : raw.replace(/^SOL-/, "")).padStart(6, "0")}`;
      }
    }
    const next = await this.bumpCounterTx(c, "request");
    return `SOL-${String(next).padStart(6, "0")}`;
  }

  private describeRequestSyncDbError(err: unknown, requestNumber = ""): string {
    const code = (err as { code?: string } | null)?.code || "";
    const msg = err instanceof Error ? err.message : String(err);
    if (code === "23505" && /numero_solicitud|uq_solicitudes/i.test(msg)) {
      return `Ya existe una solicitud con el número ${requestNumber || "indicado"}. Recargue el portal e intente de nuevo.`;
    }
    if (code === "23503" || /violates foreign key|foreign key constraint/i.test(msg)) {
      if (/id_usuario_solicitante|usuarios/i.test(msg)) {
        return "Su usuario no está registrado en el servidor. Cierre sesión, vuelva a entrar o pida al administrador que sincronice su cuenta.";
      }
      if (/id_empresa_cliente|empresas/i.test(msg)) {
        return "La empresa seleccionada no existe en el servidor. Recargue el portal o regístrela de nuevo en Administración · Usuarios.";
      }
      return "No se pudo guardar la solicitud: hay una referencia inválida en el servidor.";
    }
    if (code === "23514" || /check constraint|chk_solicitudes_entrega/i.test(msg)) {
      return "La fecha de entrega debe ser posterior a la de recogida.";
    }
    if (code === "23502" || /not-null constraint|violates not-null/i.test(msg)) {
      return "Faltan datos obligatorios en la solicitud (ruta, carga, contacto o fechas). Revise el formulario.";
    }
    if (code === "22P02" || /invalid input syntax for type uuid/i.test(msg)) {
      return "Algún identificador de la solicitud no es válido para el servidor (UUID). Recargue el portal e intente de nuevo.";
    }
    if (code === "22P02" && /estado_solicitud_transporte/i.test(msg)) {
      return "El estado de la solicitud no es válido para el servidor.";
    }
    if (
      code === "42703" ||
      code === "08P01" ||
      /column .* does not exist|bind message supplies|does not match/i.test(msg)
    ) {
      return "El servidor no tiene el esquema de solicitudes actualizado. Reinicie la API o ejecute npm run db:init e intente de nuevo.";
    }
    if (code === "22007" || /invalid input syntax for type/i.test(msg)) {
      return "Alguna fecha u hora de la solicitud no es válida. Revise recogida y entrega.";
    }
    this.logger.error(`syncRequests ${requestNumber || "?"}: ${sanitizeLogText(msg)}`);
    return "No se pudo guardar la solicitud en el servidor. Revise fechas, empresa, contacto y datos obligatorios e intente de nuevo.";
  }

  private mapRequestSyncDbError(err: unknown, requestNumber = ""): never {
    if (err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
    throw new BadRequestException(this.describeRequestSyncDbError(err, requestNumber));
  }

  private async syncRequests(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const admin = this.isAdmin(role);
    const permissionSet = admin ? new Set<string>(ALL_PORTAL_PERMISSIONS) : await this.loadPortalPermissionSet(userId);
    const transport = admin || this.isTransportOps(role) || this.hasTransportOpsPermission(permissionSet);
    const empresaId = await this.getUserCompany(userId);
    const isClient = this.isPortalClientRole(role);
    for (const req of data) {
      if (!req?.id) continue;
      const idStr = String(req.id).trim();
      if (!PG_UUID_V4_RE.test(idStr)) {
        this.logger.warn(
          `syncRequests: omitiendo fila con id no UUID (requerido por PostgreSQL): ${idStr.slice(0, 36)}`
        );
        continue;
      }
      let ownerOk =
        admin ||
        transport ||
        String(req.clientUserId) === userId ||
        (empresaId && String(req.clientCompanyId || "") === String(empresaId));
      if (isClient) {
        ownerOk =
          String(req.clientUserId) === userId &&
          (!empresaId || String(req.clientCompanyId || "") === String(empresaId));
      }
      if (!ownerOk) throw new ForbiddenException();

      const clientUserIdSql = portalUuidOrNull(req.clientUserId);
      if (!clientUserIdSql) {
        throw new BadRequestException(
          "La solicitud no tiene un identificador válido de usuario solicitante (UUID requerido por el servidor)."
        );
      }
      const clientCompanyIdSql = portalUuidOrNull(req.clientCompanyId);

      const userExists = await c.query(`SELECT 1 FROM usuarios WHERE id = $1::uuid LIMIT 1`, [clientUserIdSql]);
      if (!userExists.rowCount) {
        throw new BadRequestException(
          "Su usuario no está registrado en el servidor. Cierre sesión, vuelva a entrar o pida al administrador que sincronice su cuenta."
        );
      }
      if (clientCompanyIdSql) {
        const companyExists = await c.query(`SELECT 1 FROM empresas WHERE id = $1::uuid LIMIT 1`, [
          clientCompanyIdSql
        ]);
        if (!companyExists.rowCount) {
          throw new BadRequestException(
            "La empresa seleccionada no existe en el servidor. Recargue el portal o regístrela de nuevo en Administración · Usuarios."
          );
        }
      }

      const contactName = nu(req.contactName ?? req.siteContactName);
      const contactPhoneRaw = String(req.contactPhone ?? req.siteContactPhone ?? "").trim();
      if (!contactName || !contactPhoneRaw) {
        throw new BadRequestException(
          "Faltan contacto en sitio y/o teléfono en una solicitud (nombre y teléfono son obligatorios en base de datos)."
        );
      }
      const contactPhone = normalizePortalPhoneForStorage(contactPhoneRaw);
      const boxesNum = Math.max(0, Number(req.boxesCount ?? req.boxes ?? 0) || 0);
      const reqRec = req as Record<string, unknown>;
      const vehicleType = this.solicitudTipoCamionFromPayload(reqRec);
      const numeroFuelles = this.solicitudNumeroFuellesFromPayload(reqRec, vehicleType);
      let weightKg = 0;
      if (vehicleType === "Tractomula") {
        weightKg = Math.max(0, Number(req.weightKg) || 0);
      } else if (vehicleType === "Turbo" || vehicleType === "Camión") {
        weightKg = 0;
      } else {
        weightKg = Math.max(0, Number(req.weightKg) || 0);
      }
      const observationsRaw = nuN(req.observations ?? req.notes);
      const observations = observationsRaw || null;
      const tipoServicio = this.solicitudModoTransporteFromPayload(req);
      const refrigeracionTermoking = this.solicitudRefrigeracionFromPayload(req);
      const insuredValue =
        req.insuredValue != null && String(req.insuredValue).trim() !== ""
          ? Math.max(0, Number(req.insuredValue) || 0)
          : null;
      const distanceKm =
        req.distanceKm != null && String(req.distanceKm).trim() !== ""
          ? Math.max(0, Number(req.distanceKm) || 0)
          : null;
      const autoApproved =
        typeof req.autoApproved === "boolean"
          ? req.autoApproved
          : String(req.autoApproved || "").trim().toLowerCase() === "true";

      const pickupAtSql = this.portalTimestamptzOrThrow(req.pickupAt, "fecha de recogida");
      const etaDeliverySql = this.portalTimestamptzOrThrow(req.etaDelivery, "fecha de entrega estimada");

      const originCitySql = cat(req.originCity);
      const destinationCitySql = cat(req.destinationCity);
      const originAddressSql = nu(req.originAddress);
      const destinationAddressSql = nu(req.destinationAddress);
      const cargoDescriptionSql = nu(req.cargoDescription);
      if (!originCitySql) {
        throw new BadRequestException("Falta la ciudad de origen en la solicitud.");
      }
      if (!destinationCitySql) {
        throw new BadRequestException("Falta la ciudad de destino en la solicitud.");
      }
      if (!originAddressSql) {
        throw new BadRequestException("Falta la dirección de origen en la solicitud.");
      }
      if (!destinationAddressSql) {
        throw new BadRequestException("Falta la dirección de destino en la solicitud.");
      }
      if (!cargoDescriptionSql) {
        throw new BadRequestException("Falta la descripción de la carga en la solicitud.");
      }
      if ((vehicleType === "Turbo" || vehicleType === "Camión") && numeroFuelles == null) {
        throw new BadRequestException("Indique la cantidad de fuelles para Turbo o Camión.");
      }
      if (vehicleType === "Tractomula" && weightKg <= 0) {
        throw new BadRequestException("Indique el peso en kg para tractomula.");
      }
      const pickupMs = new Date(pickupAtSql).getTime();
      const deliveryMs = new Date(etaDeliverySql).getTime();
      if (!Number.isFinite(pickupMs) || !Number.isFinite(deliveryMs) || deliveryMs <= pickupMs) {
        throw new BadRequestException("La fecha de entrega debe ser posterior a la de recogida.");
      }

      const estadoSql = this.solicitudEstadoFromPayload(req);

      const existingReq = await c.query(`SELECT numero_solicitud FROM solicitudes_transporte WHERE id = $1::uuid LIMIT 1`, [
        idStr
      ]);
      const requestNumber =
        existingReq.rowCount && existingReq.rows[0]?.numero_solicitud
          ? String(existingReq.rows[0].numero_solicitud)
          : await this.ensureUniqueRequestNumberTx(c, req.requestNumber);

      try {
      await c.query(
        `INSERT INTO solicitudes_transporte (
          id, numero_solicitud, id_usuario_solicitante, id_empresa_cliente, nombre_cliente, nombre_quien_solicita,
          departamento_origen, ciudad_origen, direccion_origen, departamento_destino, ciudad_destino, direccion_destino,
          fecha_hora_recogida, fecha_hora_entrega_estimada, tipo_vehiculo_solicitado, descripcion_carga, tipo_servicio,
          refrigeracion_termoking,
          numero_cajas, peso_kg, numero_fuelles, nombre_contacto_en_sitio, telefono_contacto_en_sitio, observaciones,
          estado, valor_tarifa_viaje, valor_asegurado, total_cargos_standby, eventos_standby_json,
          motivo_rechazo, fecha_aprobacion, aprobado_por, aprobacion_automatica, fecha_entrega_efectiva, fecha_cierre, distancia_km
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, $10, $11, $12, $13::timestamptz, $14::timestamptz,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25::estado_solicitud_transporte, $26, $27, $28, $29::jsonb,
          $30, $31::timestamptz, $32, $33::boolean, $34::timestamptz, $35::timestamptz, $36
        )
        ON CONFLICT (id) DO UPDATE SET
          numero_solicitud = EXCLUDED.numero_solicitud,
          id_usuario_solicitante = EXCLUDED.id_usuario_solicitante,
          id_empresa_cliente = EXCLUDED.id_empresa_cliente,
          nombre_cliente = EXCLUDED.nombre_cliente,
          nombre_quien_solicita = EXCLUDED.nombre_quien_solicita,
          departamento_origen = EXCLUDED.departamento_origen,
          ciudad_origen = EXCLUDED.ciudad_origen,
          direccion_origen = EXCLUDED.direccion_origen,
          departamento_destino = EXCLUDED.departamento_destino,
          ciudad_destino = EXCLUDED.ciudad_destino,
          direccion_destino = EXCLUDED.direccion_destino,
          fecha_hora_recogida = EXCLUDED.fecha_hora_recogida,
          fecha_hora_entrega_estimada = EXCLUDED.fecha_hora_entrega_estimada,
          tipo_vehiculo_solicitado = EXCLUDED.tipo_vehiculo_solicitado,
          descripcion_carga = EXCLUDED.descripcion_carga,
          tipo_servicio = EXCLUDED.tipo_servicio,
          refrigeracion_termoking = EXCLUDED.refrigeracion_termoking,
          numero_cajas = EXCLUDED.numero_cajas,
          peso_kg = EXCLUDED.peso_kg,
          numero_fuelles = EXCLUDED.numero_fuelles,
          nombre_contacto_en_sitio = EXCLUDED.nombre_contacto_en_sitio,
          telefono_contacto_en_sitio = EXCLUDED.telefono_contacto_en_sitio,
          observaciones = EXCLUDED.observaciones,
          estado = EXCLUDED.estado,
          valor_tarifa_viaje = EXCLUDED.valor_tarifa_viaje,
          valor_asegurado = EXCLUDED.valor_asegurado,
          total_cargos_standby = EXCLUDED.total_cargos_standby,
          eventos_standby_json = EXCLUDED.eventos_standby_json,
          motivo_rechazo = EXCLUDED.motivo_rechazo,
          fecha_aprobacion = EXCLUDED.fecha_aprobacion,
          aprobado_por = EXCLUDED.aprobado_por,
          aprobacion_automatica = EXCLUDED.aprobacion_automatica,
          fecha_entrega_efectiva = EXCLUDED.fecha_entrega_efectiva,
          fecha_cierre = EXCLUDED.fecha_cierre,
          distancia_km = EXCLUDED.distancia_km`,
        [
          req.id,
          requestNumber,
          clientUserIdSql,
          clientCompanyIdSql,
          nu(req.clientName),
          nu(req.requestedByName),
          cat(req.originDepartment),
          originCitySql,
          originAddressSql,
          cat(req.destinationDepartment),
          destinationCitySql,
          destinationAddressSql,
          pickupAtSql,
          etaDeliverySql,
          vehicleType,
          cargoDescriptionSql,
          tipoServicio,
          refrigeracionTermoking,
          boxesNum,
          weightKg,
          numeroFuelles,
          contactName,
          contactPhone,
          observations,
          estadoSql,
          Number(req.tripValue) || 0,
          insuredValue,
          Number(req.standbyChargeTotal) || 0,
          JSON.stringify(Array.isArray(req.standbyEvents) ? req.standbyEvents : []),
          nuN(req.rejectionReason),
          req.approvedAt || null,
          req.approvedBy || null,
          autoApproved,
          req.deliveredAt || null,
          req.closedAt || null,
          distanceKm
        ]
      );
      } catch (insertErr) {
        this.mapRequestSyncDbError(insertErr, requestNumber);
      }

      if (req.trip && req.trip.tripNumber) {
        const t = req.trip as Record<string, unknown>;
        const tripIdRaw = t.id != null ? String(t.id).trim() : "";
        const tripId = PG_UUID_V4_RE.test(tripIdRaw) ? tripIdRaw : null;
        const tripDb = await this.resolveTripRowFromDatabase(c, idStr, t);
        await c.query(
          `INSERT INTO viajes_transporte (
            id, id_solicitud, numero_viaje, id_vehiculo, id_conductor, placa_vehiculo, tipo_vehiculo_asignado,
            nombre_conductor, telefono_conductor, descripcion_ruta, fecha_hora_recogida_programada, fecha_hora_entrega_programada,
            asignado_por, fecha_hora_asignacion, estado_operativo_en_vivo, datos_factura_json
          ) VALUES (
            COALESCE($1::uuid, gen_random_uuid()), $2::uuid, $3, $4::uuid, $5::uuid, $6, $7, $8, $9, $10,
            $11::timestamptz, $12::timestamptz, $13, $14::timestamptz, $15, $16::jsonb
          )
          ON CONFLICT (id_solicitud) DO UPDATE SET
            numero_viaje = EXCLUDED.numero_viaje,
            id_vehiculo = EXCLUDED.id_vehiculo,
            id_conductor = EXCLUDED.id_conductor,
            placa_vehiculo = EXCLUDED.placa_vehiculo,
            tipo_vehiculo_asignado = EXCLUDED.tipo_vehiculo_asignado,
            nombre_conductor = EXCLUDED.nombre_conductor,
            telefono_conductor = EXCLUDED.telefono_conductor,
            descripcion_ruta = EXCLUDED.descripcion_ruta,
            fecha_hora_recogida_programada = EXCLUDED.fecha_hora_recogida_programada,
            fecha_hora_entrega_programada = EXCLUDED.fecha_hora_entrega_programada,
            asignado_por = EXCLUDED.asignado_por,
            fecha_hora_asignacion = EXCLUDED.fecha_hora_asignacion,
            estado_operativo_en_vivo = EXCLUDED.estado_operativo_en_vivo,
            datos_factura_json = EXCLUDED.datos_factura_json,
            fecha_actualizacion = now()`,
          [
            tripId,
            req.id,
            t.tripNumber,
            tripDb.vehicleId,
            tripDb.driverId,
            tripDb.vehiclePlate,
            tripDb.vehicleTipoAsignado || null,
            tripDb.driverName,
            tripDb.driverPhone,
            t.route != null && String(t.route).trim() !== "" ? nu(t.route) : null,
            tripDb.pickupProg,
            tripDb.deliveryProg,
            t.assignedBy || null,
            t.assignedAt || null,
            t.realtimeStatus || null,
            t.invoice ? JSON.stringify(t.invoice) : null
          ]
        );
      }
    }
  }

  private async syncVehicles(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const v of data) {
      if (!v?.id || !v.plate) continue;
      if (this.skipUnlessPersistUuid("syncVehicles", v.id)) continue;
      const rec = v as Record<string, unknown>;
      const audit = portalAuditActorPairFromRecord(rec);
      await c.query(
        `INSERT INTO vehiculos (
          id, placa, marca, linea_modelo, anio_modelo, color, tipo_vehiculo, capacidad_kg, refrigerado_termoking,
          tipo_carroceria, tipo_combustible, configuracion_ejes, numero_motor, numero_chasis_vin, numero_tarjeta_propiedad,
          fecha_expedicion_soat, fecha_vencimiento_soat, fecha_expedicion_tecnomecanica, fecha_vencimiento_tecnomecanica,
          numero_poliza_rc_contractual, numero_poliza_rc_extracontractual, fecha_vencimiento_polizas_rc,
          tiene_gps, proveedor_gps, usuario_proveedor_satelite, password_proveedor_satelite, disponible, ocupado_por_sistema,
          creado_por, actualizado_por
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::date, $17::date, $18::date, $19::date,
          $20, $21, $22::date, $23, $24, $25, $26, $27, $28, $29, $30
        )
        ON CONFLICT (id) DO UPDATE SET
          placa = EXCLUDED.placa,
          marca = EXCLUDED.marca,
          linea_modelo = EXCLUDED.linea_modelo,
          anio_modelo = EXCLUDED.anio_modelo,
          color = EXCLUDED.color,
          tipo_vehiculo = EXCLUDED.tipo_vehiculo,
          capacidad_kg = EXCLUDED.capacidad_kg,
          refrigerado_termoking = EXCLUDED.refrigerado_termoking,
          tipo_carroceria = EXCLUDED.tipo_carroceria,
          tipo_combustible = EXCLUDED.tipo_combustible,
          configuracion_ejes = EXCLUDED.configuracion_ejes,
          numero_motor = EXCLUDED.numero_motor,
          numero_chasis_vin = EXCLUDED.numero_chasis_vin,
          numero_tarjeta_propiedad = EXCLUDED.numero_tarjeta_propiedad,
          fecha_expedicion_soat = EXCLUDED.fecha_expedicion_soat,
          fecha_vencimiento_soat = EXCLUDED.fecha_vencimiento_soat,
          fecha_expedicion_tecnomecanica = EXCLUDED.fecha_expedicion_tecnomecanica,
          fecha_vencimiento_tecnomecanica = EXCLUDED.fecha_vencimiento_tecnomecanica,
          numero_poliza_rc_contractual = EXCLUDED.numero_poliza_rc_contractual,
          numero_poliza_rc_extracontractual = EXCLUDED.numero_poliza_rc_extracontractual,
          fecha_vencimiento_polizas_rc = EXCLUDED.fecha_vencimiento_polizas_rc,
          tiene_gps = EXCLUDED.tiene_gps,
          proveedor_gps = EXCLUDED.proveedor_gps,
          usuario_proveedor_satelite = EXCLUDED.usuario_proveedor_satelite,
          password_proveedor_satelite = EXCLUDED.password_proveedor_satelite,
          disponible = EXCLUDED.disponible,
          ocupado_por_sistema = EXCLUDED.ocupado_por_sistema,
          creado_por = COALESCE(vehiculos.creado_por, EXCLUDED.creado_por),
          actualizado_por = COALESCE(EXCLUDED.actualizado_por, vehiculos.actualizado_por),
          fecha_actualizacion = now()`,
        [
          v.id,
          String(v.plate).toUpperCase(),
          nu(v.brand) || "N/D",
          nu(v.model) || "N/D",
          Number(v.year) || 2020,
          nu(v.color) || "N/D",
          nu(v.type) || "CAMION",
          Number(v.capacityKg) || 1,
          Boolean(v.refrigerated),
          nu(v.bodyType) || "FURGON",
          nu(v.fuelType) || "DIESEL",
          nu(v.axleConfig) || "4X2",
          nu(v.engineNumber) || "N/D",
          String(v.vin || "XXXXXXXXXXX")
            .trim()
            .toUpperCase()
            .slice(0, 17),
          nu(v.ownershipCard) || "N/D",
          v.soatExpeditionDate || new Date().toISOString().slice(0, 10),
          v.soatExpiryDate || new Date().toISOString().slice(0, 10),
          v.techInspectionExpeditionDate || new Date().toISOString().slice(0, 10),
          v.techInspectionExpiryDate || new Date().toISOString().slice(0, 10),
          nuN(v.rcPolicyContract),
          nuN(v.rcPolicyExtra),
          v.rcPolicyExpiry || null,
          Boolean(v.hasGps),
          nuN(v.gpsProvider),
          v.satelliteProviderUser != null && String(v.satelliteProviderUser).trim() !== ""
            ? String(v.satelliteProviderUser).trim()
            : null,
          v.satelliteProviderPassword != null && String(v.satelliteProviderPassword).trim() !== ""
            ? String(v.satelliteProviderPassword)
            : null,
          v.available !== false,
          Boolean(v.autoBusy),
          audit.createdBy,
          audit.updatedBy
        ]
      );
    }
  }

  private async syncDrivers(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const raw of data) {
      const d = raw as Record<string, unknown>;
      if (!d?.id) continue;
      if (this.skipUnlessPersistUuid("syncDrivers", d.id)) continue;
      const p = pickPortalField;
      const hiredRaw = p(d, "hiredAt");
      const hiredTs =
        hiredRaw != null && String(hiredRaw).trim() !== ""
          ? new Date(String(hiredRaw))
          : null;
      const hiredOk = hiredTs && !Number.isNaN(hiredTs.getTime()) ? hiredTs : null;
      const rawPhotoUrl = pickPortalField(d, "photoUrl", "avatarUrl", "foto", "photo");
      let urlFotoSql: string | null = rawPhotoUrl != null ? String(rawPhotoUrl).trim() : "";
      if (!urlFotoSql || urlFotoSql.startsWith("data:") || urlFotoSql.length > 2048) {
        urlFotoSql = null;
      }

      const companyIdSql = portalUuidOrNull(d.companyId);

      const bloodRaw = p(d, "bloodType", "tipo_sangre");
      const bloodSql =
        bloodRaw != null && String(bloodRaw).trim() !== ""
          ? (nuN(bloodRaw)?.slice(0, 8) ?? null)
          : null;
      const epsRaw = p(d, "eps");
      const epsSql =
        epsRaw != null && String(epsRaw).trim() !== "" ? (nuN(epsRaw)?.slice(0, 120) ?? null) : null;
      const arlRaw = p(d, "arl");
      const arlSql =
        arlRaw != null && String(arlRaw).trim() !== "" ? (nuN(arlRaw)?.slice(0, 120) ?? null) : null;
      const comparendosRaw = p(d, "comparendos", "comparendos_pendientes");
      const comparendosNum = Number(comparendosRaw);
      const comparendosSql = Number.isFinite(comparendosNum)
        ? Math.max(0, Math.min(9999, Math.floor(comparendosNum)))
        : 0;
      const expRaw = p(d, "experienceYears", "anos_experiencia_conduccion");
      const expNum = Number(expRaw);
      const anosSql = Number.isFinite(expNum) ? Math.max(0, Math.min(80, Math.floor(expNum))) : 0;

      const occExam = portalDateYmdOrNull(
        p(d, "occupationalExamDate", "psychometricExamDate", "psychoTestDate", "fecha_examen_ocupacional")
      );
      const intraExam = portalDateYmdOrNull(
        p(d, "instruvialExamDate", "intravehicularExamDate", "fecha_examen_instruvial")
      );
      const occExpiry = occExam ? portalYmdPlusYears(occExam, 1) : null;
      const intraExpiry = intraExam ? portalYmdPlusYears(intraExam, 1) : null;

      const licenseExpirySql =
        portalDateYmdOrNull(d.licenseExpiry) ??
        portalDateYmdOrNull(p(d, "licenseExpiry", "fecha_vencimiento_licencia")) ??
        new Date().toISOString().slice(0, 10);

      const idDoc = String(d.idDoc ?? "0000000").trim().slice(0, 32) || "0000000";
      const docType =
        String(d.documentType || "CC")
          .trim()
          .toUpperCase()
          .slice(0, 8) || "CC";
      const licenseCategory =
        String(d.licenseCategory || "C2")
          .trim()
          .toUpperCase()
          .slice(0, 8) || "C2";
      const phone = normalizePortalPhoneForStorage(d.phone || "3000000000");
      const defCourseRaw = p(d, "defensiveDrivingCourse", "defensiveCourse", "curso_conduccion_defensiva");
      const defCourseSql =
        defCourseRaw != null && String(defCourseRaw).trim() !== ""
          ? (nuN(defCourseRaw)?.slice(0, 32) ?? null)
          : null;
      const audit = portalAuditActorPairFromRecord(d);

      try {
        await c.query(
        `INSERT INTO conductores (
          id, id_empresa, nombre_completo, tipo_documento, numero_documento, telefono, departamento, ciudad, direccion,
          numero_licencia, categoria_licencia, fecha_vencimiento_licencia,
          fecha_examen_ocupacional, fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial, fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva,
          fecha_vencimiento_curso_defensivo, tipo_sangre, eps, arl, comparendos_pendientes, anos_experiencia_conduccion,
          contacto_emergencia, telefono_emergencia,
          disponible, ocupado_por_sistema, tipo_contrato, salario_base, fecha_inicio, fecha_contratacion, url_foto,
          creado_por, actualizado_por
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::date,
          $13::date, $14::date, $15::date, $16::date, $17,
          $18::date, $19, $20, $21, $22, $23,
          $24, $25,
          $26, $27, $28, $29, $30, $31::date, $32::timestamptz,
          $33, $34, $35
        )
        ON CONFLICT (id) DO UPDATE SET
          id_empresa = EXCLUDED.id_empresa,
          nombre_completo = EXCLUDED.nombre_completo,
          tipo_documento = EXCLUDED.tipo_documento,
          numero_documento = EXCLUDED.numero_documento,
          telefono = EXCLUDED.telefono,
          departamento = EXCLUDED.departamento,
          ciudad = EXCLUDED.ciudad,
          direccion = EXCLUDED.direccion,
          numero_licencia = EXCLUDED.numero_licencia,
          categoria_licencia = EXCLUDED.categoria_licencia,
          fecha_vencimiento_licencia = EXCLUDED.fecha_vencimiento_licencia,
          fecha_examen_ocupacional = EXCLUDED.fecha_examen_ocupacional,
          fecha_vencimiento_examen_ocupacional = EXCLUDED.fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial = EXCLUDED.fecha_examen_instruvial,
          fecha_vencimiento_examen_instruvial = EXCLUDED.fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva = EXCLUDED.curso_conduccion_defensiva,
          fecha_vencimiento_curso_defensivo = EXCLUDED.fecha_vencimiento_curso_defensivo,
          tipo_sangre = EXCLUDED.tipo_sangre,
          eps = EXCLUDED.eps,
          arl = EXCLUDED.arl,
          comparendos_pendientes = EXCLUDED.comparendos_pendientes,
          anos_experiencia_conduccion = EXCLUDED.anos_experiencia_conduccion,
          contacto_emergencia = EXCLUDED.contacto_emergencia,
          telefono_emergencia = EXCLUDED.telefono_emergencia,
          disponible = EXCLUDED.disponible,
          ocupado_por_sistema = EXCLUDED.ocupado_por_sistema,
          tipo_contrato = EXCLUDED.tipo_contrato,
          salario_base = EXCLUDED.salario_base,
          fecha_inicio = EXCLUDED.fecha_inicio,
          fecha_contratacion = EXCLUDED.fecha_contratacion,
          url_foto = COALESCE(EXCLUDED.url_foto, conductores.url_foto),
          creado_por = COALESCE(conductores.creado_por, EXCLUDED.creado_por),
          actualizado_por = COALESCE(EXCLUDED.actualizado_por, conductores.actualizado_por),
          fecha_actualizacion = now()`,
        [
          d.id,
          companyIdSql,
          (nu(d.name || "Conductor").slice(0, 255) || "CONDUCTOR"),
          docType,
          idDoc,
          phone,
          d.department != null ? (cat(d.department)?.slice(0, 120) ?? null) : null,
          d.city != null ? (cat(d.city)?.slice(0, 120) || "Bogota") : "Bogota",
          d.address != null ? (nu(d.address).slice(0, 2000) || "N/D") : "N/D",
          nu(d.license || "N").slice(0, 64) || "N",
          licenseCategory,
          licenseExpirySql,
          occExam,
          occExpiry,
          intraExam,
          intraExpiry,
          defCourseSql,
          portalDateYmdOrNull(p(d, "defensiveCourseExpiry", "fecha_vencimiento_curso_defensivo")),
          bloodSql,
          epsSql,
          arlSql,
          comparendosSql,
          anosSql,
          p(d, "emergencyContact") != null ? (nuN(p(d, "emergencyContact"))?.slice(0, 255) ?? null) : null,
          p(d, "emergencyPhone") != null
            ? normalizePortalPhoneForStorage(p(d, "emergencyPhone"), "") || null
            : null,
          d.available !== false,
          Boolean(d.autoBusy),
          d.contractType != null ? (nuN(d.contractType)?.slice(0, 80) ?? null) : null,
          d.baseSalary != null && Number.isFinite(Number(d.baseSalary)) ? Number(d.baseSalary) : null,
          portalDateYmdOrNull(d.startDate),
          hiredOk,
          urlFotoSql,
          audit.createdBy,
          audit.updatedBy
        ]
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/unique|duplicate|23505/i.test(msg) && /numero_documento|documento/i.test(msg)) {
          throw new BadRequestException(
            `El documento ${idDoc} ya está asignado a otro conductor. Revise el NIT/cédula en la ficha.`
          );
        }
        this.logger.warn(`syncDrivers id=${String(d.id)}: ${msg}`);
        throw e;
      }
    }
  }

  /**
   * Empleados con rol conductor en RRHH deben existir en `conductores` para asignar viajes.
   * Si solo se sincronizó `empleados_nomina`, la flota queda vacía en asignación.
   */
  private async backfillConductoresFromPayrollEmployees(): Promise<void> {
    if (!(await this.tableExists("empleados_nomina")) || !(await this.tableExists("conductores"))) {
      return;
    }
    const r = await this.pool.query(
      `SELECT e.*
       FROM empleados_nomina e
       WHERE lower(trim(coalesce(e.rol_trabajador, ''))) = 'conductor'
         AND e.numero_licencia IS NOT NULL
         AND trim(e.numero_licencia) <> ''
         AND e.fecha_vencimiento_licencia IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM conductores c
           WHERE trim(c.numero_documento) = trim(e.numero_documento)
         )`
    );
    if (!r.rows.length) return;
    const client = await this.pool.connect();
    try {
      for (const row of r.rows) {
        await this.upsertConductorFromPayrollDbRow(client, row as Record<string, unknown>);
      }
      this.logger.log(
        `backfillConductoresFromPayrollEmployees: ${r.rows.length} conductor(es) creados desde RRHH`
      );
    } finally {
      client.release();
    }
  }

  private async upsertConductorFromPayrollEmployeePayload(
    c: PoolClient,
    e: Record<string, unknown>
  ): Promise<void> {
    const role = String(e.workerRole || "empleado").toLowerCase();
    if (role !== "conductor") return;
    const p = pickPortalField;
    const license = String(p(e, "license", "licenseNumber") ?? "").trim();
    const licenseExpiry = portalDateYmdOrNull(p(e, "licenseExpiry"));
    if (!license || !licenseExpiry) return;
    const empId = String(e.id ?? "").trim();
    if (!PG_UUID_V4_RE.test(empId)) return;
    const idDoc = String(e.idDoc || "").trim();
    if (!idDoc) return;

    const existing = await c.query<{ id: string }>(
      `SELECT id::text AS id FROM conductores WHERE trim(numero_documento) = trim($1) LIMIT 1`,
      [idDoc]
    );
    const conductorId = existing.rows[0]?.id?.trim() || empId;

    const occExam = portalDateOrNull(
      p(e, "occupationalExamDate", "psychoTestDate", "psychometricExamDate")
    );
    const intraExam = portalDateOrNull(p(e, "instruvialExamDate", "intravehicularExamDate"));
    const occExpiry =
      portalDateOrNull(p(e, "occupationalExamExpiry")) ?? (occExam ? portalYmdPlusYears(occExam, 1) : null);
    const intraExpiry =
      portalDateOrNull(p(e, "instruvialExamExpiry")) ?? (intraExam ? portalYmdPlusYears(intraExam, 1) : null);

    await this.upsertConductorRow(c, {
      id: conductorId,
      companyId: portalUuidOrNull(e.companyId),
      name: nu(e.name ?? "Conductor").slice(0, 255) || "CONDUCTOR",
      documentType: String(e.documentType || "CC").trim().toUpperCase().slice(0, 8) || "CC",
      idDoc,
      phone: normalizePortalPhoneForStorage(p(e, "phone") ?? "3000000000"),
      department: e.department != null ? (cat(p(e, "department"))?.slice(0, 120) ?? null) : null,
      city: cat(p(e, "city") ?? "Bogota") ?? "Bogota",
      address: nu(p(e, "address") ?? "N/D").slice(0, 2000) || "N/D",
      license: license.slice(0, 64),
      licenseCategory:
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.licenseCategories, p(e, "licenseCategory")) ||
        "C2",
      licenseExpiry,
      occExam,
      occExpiry,
      intraExam,
      intraExpiry,
      defensiveCourse: normalizeDefensiveCourseForDb(p(e, "defensiveCourse", "defensiveDrivingCourse")),
      bloodType: matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.bloodTypes, p(e, "bloodType")),
      eps: matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.eps, p(e, "eps")),
      arl: matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.arl, p(e, "arl")),
      emergencyContact: nuN(p(e, "emergencyContact")),
      emergencyPhone: p(e, "emergencyPhone") != null
        ? normalizePortalPhoneForStorage(p(e, "emergencyPhone"), "") || null
        : null,
      contractType: nuN(p(e, "contractType")),
      baseSalary: Number.isFinite(Number(p(e, "baseSalary"))) ? Number(p(e, "baseSalary")) : null,
      startDate: portalDateOrNull(p(e, "startDate")),
      avatarUrl: (p(e, "avatarUrl") as string) || null,
      hiredAt: p(e, "hiredAt", "startDate") as string | null
    });
  }

  private async upsertConductorFromPayrollDbRow(
    c: PoolClient,
    row: Record<string, unknown>
  ): Promise<void> {
    const empId = String(row.id ?? "").trim();
    if (!PG_UUID_V4_RE.test(empId)) return;
    const idDoc = String(row.numero_documento ?? "").trim();
    const license = String(row.numero_licencia ?? "").trim();
    const licenseExpiry = portalDateYmdOrNull(row.fecha_vencimiento_licencia);
    if (!idDoc || !license || !licenseExpiry) return;

    const existing = await c.query<{ id: string }>(
      `SELECT id::text AS id FROM conductores WHERE trim(numero_documento) = trim($1) LIMIT 1`,
      [idDoc]
    );
    const conductorId = existing.rows[0]?.id?.trim() || empId;

    const occExam = portalDateYmdOrNull(row.fecha_examen_ocupacional);
    const intraExam = portalDateYmdOrNull(row.fecha_examen_instruvial);
    const occExpiry =
      portalDateYmdOrNull(row.fecha_vencimiento_examen_ocupacional) ??
      (occExam ? portalYmdPlusYears(occExam, 1) : null);
    const intraExpiry =
      portalDateYmdOrNull(row.fecha_vencimiento_examen_instruvial) ??
      (intraExam ? portalYmdPlusYears(intraExam, 1) : null);

    await this.upsertConductorRow(c, {
      id: conductorId,
      companyId: portalUuidOrNull(row.id_empresa),
      name: nu(row.nombre_completo ?? "Conductor").slice(0, 255) || "CONDUCTOR",
      documentType: String(row.tipo_documento || "CC").trim().toUpperCase().slice(0, 8) || "CC",
      idDoc,
      phone: normalizePortalPhoneForStorage(row.telefono ?? "3000000000"),
      department: row.departamento != null ? (cat(row.departamento)?.slice(0, 120) ?? null) : null,
      city: cat(row.ciudad ?? "Bogota") ?? "Bogota",
      address: nu(row.direccion ?? "N/D").slice(0, 2000) || "N/D",
      license: license.slice(0, 64),
      licenseCategory: String(row.categoria_licencia || "C2").trim().toUpperCase().slice(0, 8) || "C2",
      licenseExpiry,
      occExam,
      occExpiry,
      intraExam,
      intraExpiry,
      defensiveCourse:
        row.curso_conduccion_defensiva != null
          ? normalizeDefensiveCourseForDb(String(row.curso_conduccion_defensiva))
          : null,
      bloodType: row.tipo_sangre != null ? String(row.tipo_sangre).trim() : null,
      eps: row.eps != null ? String(row.eps).trim() : null,
      arl: row.arl != null ? String(row.arl).trim() : null,
      emergencyContact: row.contacto_emergencia != null ? String(row.contacto_emergencia).trim() : null,
      emergencyPhone: row.telefono_emergencia != null ? String(row.telefono_emergencia).trim() : null,
      contractType: row.tipo_contrato != null ? String(row.tipo_contrato).trim() : null,
      baseSalary: row.salario_base != null ? Number(row.salario_base) : null,
      startDate: portalDateYmdOrNull(row.fecha_ingreso),
      avatarUrl: row.url_avatar != null ? String(row.url_avatar).trim() : null,
      hiredAt: row.fecha_ingreso != null ? String(row.fecha_ingreso) : null
    });
  }

  private async upsertConductorRow(
    c: PoolClient,
    d: {
      id: string;
      companyId: string | null;
      name: string;
      documentType: string;
      idDoc: string;
      phone: string;
      department: string | null;
      city: string;
      address: string;
      license: string;
      licenseCategory: string;
      licenseExpiry: string;
      occExam: string | null;
      occExpiry: string | null;
      intraExam: string | null;
      intraExpiry: string | null;
      defensiveCourse: string | null;
      bloodType: string | null;
      eps: string | null;
      arl: string | null;
      emergencyContact: string | null;
      emergencyPhone: string | null;
      contractType: string | null;
      baseSalary: number | null;
      startDate: string | null;
      avatarUrl: string | null;
      hiredAt: string | null;
    }
  ): Promise<void> {
    let urlFotoSql: string | null = d.avatarUrl != null ? String(d.avatarUrl).trim() : "";
    if (!urlFotoSql || urlFotoSql.startsWith("data:") || urlFotoSql.length > 2048) {
      urlFotoSql = null;
    }
    const hiredRaw = d.hiredAt;
    const hiredTs =
      hiredRaw != null && String(hiredRaw).trim() !== "" ? new Date(String(hiredRaw)) : null;
    const hiredOk = hiredTs && !Number.isNaN(hiredTs.getTime()) ? hiredTs : null;
    const bloodSql =
      d.bloodType != null && String(d.bloodType).trim() !== ""
        ? (nuN(d.bloodType)?.slice(0, 8) ?? null)
        : null;
    const epsSql =
      d.eps != null && String(d.eps).trim() !== "" ? (nuN(d.eps)?.slice(0, 120) ?? null) : null;
    const arlSql =
      d.arl != null && String(d.arl).trim() !== "" ? (nuN(d.arl)?.slice(0, 120) ?? null) : null;

    await c.query(
      `INSERT INTO conductores (
          id, id_empresa, nombre_completo, tipo_documento, numero_documento, telefono, departamento, ciudad, direccion,
          numero_licencia, categoria_licencia, fecha_vencimiento_licencia,
          fecha_examen_ocupacional, fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial, fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva,
          fecha_vencimiento_curso_defensivo, tipo_sangre, eps, arl, comparendos_pendientes, anos_experiencia_conduccion,
          contacto_emergencia, telefono_emergencia,
          disponible, ocupado_por_sistema, tipo_contrato, salario_base, fecha_inicio, fecha_contratacion, url_foto
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::date,
          $13::date, $14::date, $15::date, $16::date, $17,
          $18::date, $19, $20, $21, 0, 0,
          $22, $23,
          true, false, $24, $25, $26::date, $27::timestamptz,
          $28
        )
        ON CONFLICT (numero_documento) DO UPDATE SET
          id_empresa = COALESCE(EXCLUDED.id_empresa, conductores.id_empresa),
          nombre_completo = EXCLUDED.nombre_completo,
          tipo_documento = EXCLUDED.tipo_documento,
          telefono = EXCLUDED.telefono,
          departamento = EXCLUDED.departamento,
          ciudad = EXCLUDED.ciudad,
          direccion = EXCLUDED.direccion,
          numero_licencia = EXCLUDED.numero_licencia,
          categoria_licencia = EXCLUDED.categoria_licencia,
          fecha_vencimiento_licencia = EXCLUDED.fecha_vencimiento_licencia,
          fecha_examen_ocupacional = EXCLUDED.fecha_examen_ocupacional,
          fecha_vencimiento_examen_ocupacional = EXCLUDED.fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial = EXCLUDED.fecha_examen_instruvial,
          fecha_vencimiento_examen_instruvial = EXCLUDED.fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva = EXCLUDED.curso_conduccion_defensiva,
          tipo_sangre = EXCLUDED.tipo_sangre,
          eps = EXCLUDED.eps,
          arl = EXCLUDED.arl,
          contacto_emergencia = EXCLUDED.contacto_emergencia,
          telefono_emergencia = EXCLUDED.telefono_emergencia,
          tipo_contrato = EXCLUDED.tipo_contrato,
          salario_base = EXCLUDED.salario_base,
          fecha_inicio = EXCLUDED.fecha_inicio,
          url_foto = COALESCE(EXCLUDED.url_foto, conductores.url_foto),
          fecha_actualizacion = now()`,
      [
        d.id,
        d.companyId,
        d.name,
        d.documentType,
        d.idDoc,
        d.phone,
        d.department,
        d.city,
        d.address,
        d.license,
        d.licenseCategory,
        d.licenseExpiry,
        d.occExam,
        d.occExpiry,
        d.intraExam,
        d.intraExpiry,
        d.defensiveCourse,
        null,
        bloodSql,
        epsSql,
        arlSql,
        d.emergencyContact,
        d.emergencyPhone,
        d.contractType,
        d.baseSalary,
        d.startDate,
        hiredOk,
        urlFotoSql
      ]
    );
  }

  /**
   * Sincroniza notificaciones: UPSERT más **poda** — las filas que ya no llegan desde el navegador
   * para cada destinatario se eliminan, para que al recargar no reaparezcan.
   * `deletedIds` cubre bandeja vacía o último ítem (payload sin filas que podar).
   */
  private async syncNotifications(
    c: PoolClient,
    data: unknown,
    userId: string,
    role: JwtRole,
    deletedIds?: string[]
  ) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    type NotifRow = {
      id?: unknown;
      userId?: unknown;
      audience?: unknown;
      audiencia?: unknown;
      title?: unknown;
      body?: unknown;
      readAt?: unknown;
      read_at?: unknown;
    };
    const rows = data as NotifRow[];
    const admin = this.isAdmin(role);
    const hrAudience = this.roleMayRunContractRenewalNotices(role);

    const explicitDeleteIds = (Array.isArray(deletedIds) ? deletedIds : [])
      .map((raw) => String(raw ?? "").trim())
      .filter((id) => PG_UUID_V4_RE.test(id));
    if (explicitDeleteIds.length > 0) {
      await c.query(
        `DELETE FROM notificaciones
         WHERE id = ANY($1::uuid[])
           AND (
             id_usuario = $2::uuid
             OR (audiencia = 'admins' AND $3::boolean)
             OR (audiencia = 'hr' AND $4::boolean)
           )`,
        [explicitDeleteIds, userId, admin, hrAudience]
      );
    }

    for (const n of rows) {
      if (!n?.id) continue;
      if (this.skipUnlessPersistUuid("syncNotifications", String(n.id))) continue;
      const audience = String(n.audience ?? n.audiencia ?? "").trim().toLowerCase();
      const isBroadcast = audience === "admins" || audience === "hr";
      const targetUserId = String(n.userId ?? "").trim();
      if (isBroadcast) {
        if (!this.notificationAudienceVisibleToRole(audience, role)) throw new ForbiddenException();
      } else if (targetUserId !== userId) {
        throw new ForbiddenException();
      }
      const readAtRaw = n.readAt ?? n.read_at;
      if (readAtRaw == null || readAtRaw === "") continue;
      const readAtParam = String(readAtRaw).trim() ? (readAtRaw as string | Date) : null;
      if (!readAtParam) continue;
      const readAtMs =
        readAtParam instanceof Date
          ? readAtParam.getTime()
          : new Date(String(readAtParam)).getTime();
      if (!Number.isFinite(readAtMs)) continue;
      const exists = await c.query(`SELECT 1 AS ok FROM notificaciones WHERE id = $1::uuid LIMIT 1`, [n.id]);
      if (!(exists.rowCount ?? 0)) continue;
      await c.query(
        `UPDATE notificaciones
         SET fecha_lectura = CASE
           WHEN fecha_lectura IS NULL THEN $2::timestamptz
           ELSE GREATEST(fecha_lectura, $2::timestamptz)
         END
         WHERE id = $1::uuid`,
        [n.id, readAtParam]
      );
    }

    /**
     * El sync NO poda notificaciones por "lista que no llegó en el payload" para evitar
     * borrar de la BD de forma accidental. El borrado de notificaciones solo ocurre por
     * `deletedIds` (acción explícita del usuario), manejado arriba.
     */
  }

  private async syncEmails(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const e of data) {
      if (!e?.id) continue;
      if (this.skipUnlessPersistUuid("syncEmails", e.id)) continue;
      await c.query(
        `INSERT INTO correos_salida (id, direccion_destino, asunto, cuerpo, fecha_envio_real, error_envio)
         VALUES ($1::uuid, $2, $3, $4, $5::timestamptz, $6)
         ON CONFLICT (id) DO UPDATE SET
           asunto = EXCLUDED.asunto,
           cuerpo = EXCLUDED.cuerpo,
           fecha_envio_real = COALESCE(EXCLUDED.fecha_envio_real, correos_salida.fecha_envio_real),
           error_envio = EXCLUDED.error_envio`,
        [e.id, em(e.to), nuN(e.subject), nuN(e.body), e.sentAt || null, e.error != null ? String(e.error).trim() : null]
      );
    }
  }

  /** Detecta columnas migr. 19 (condición médica), 45 (inicio contrato vigente) y 46 (fecha renovación). */
  private async resolvePayrollEmployeeSchemaTier(c: PoolClient): Promise<0 | 1 | 2 | 3> {
    if (this.payrollEmployeeSchemaTier !== undefined) return this.payrollEmployeeSchemaTier;
    try {
      const { rows } = await c.query<{ n19: string; n45: string; n46: string; n47: string }>(
        `SELECT COUNT(*) FILTER (WHERE column_name = 'tiene_condicion_medica')::text AS n19,
                COUNT(*) FILTER (WHERE column_name = 'fecha_inicio_contrato_vigente')::text AS n45,
                COUNT(*) FILTER (WHERE column_name = 'fecha_renovacion')::text AS n46,
                COUNT(*) FILTER (WHERE column_name = 'fecha_aviso_no_renovacion')::text AS n47
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empleados_nomina'`
      );
      const has19 = Number(rows[0]?.n19 ?? 0) > 0;
      const has45 = Number(rows[0]?.n45 ?? 0) > 0;
      const has46 = Number(rows[0]?.n46 ?? 0) > 0;
      const has47 = Number(rows[0]?.n47 ?? 0) > 0;
      const t: 0 | 1 | 2 | 3 = has46 && has47 ? 3 : has45 ? 2 : has19 ? 1 : 0;
      this.payrollEmployeeSchemaTier = t;
      if (!has19) {
        this.logger.warn(
          "empleados_nomina: sin columnas de condición médica (migr. 19). " +
            "Ejecute npm run db:init o alinee con BD/postgres/tablas/13_empleados_nomina.sql. " +
            "Hasta entonces ese dato solo quedará persistido en el navegador."
        );
      }
      if (!has45) {
        this.logger.warn(
          "empleados_nomina: sin fecha_inicio_contrato_vigente (migr. 45). " +
            "Ejecute npm run db:init o BD/postgres/tablas/13_empleados_nomina.sql (columna fecha_inicio_contrato_vigente). " +
            "El inicio del contrato vigente no se persistirá en servidor hasta aplicar la migración."
        );
      }
      if (!has46) {
        this.logger.warn(
          "empleados_nomina: sin fecha_renovacion (migr. 46). " +
            "Ejecute npm run db:init o BD/postgres/tablas/13_empleados_nomina.sql (columna fecha_renovacion). " +
            "La fecha de renovación no se persistirá en servidor hasta aplicar la migración."
        );
      }
      if (!has47) {
        this.logger.warn(
          "empleados_nomina: sin fecha_aviso_no_renovacion (migr. 47). " +
            "Ejecute npm run db:init o BD/postgres/tablas/34_alter_renovacion_contrato.sql. " +
            "El aviso de no renovación no se persistirá en servidor hasta aplicar la migración."
        );
      }
      return t;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(
        `empleados_nomina: no se pudo detectar columnas (${msg}); usando esquema sin migr. 19.`
      );
      this.payrollEmployeeSchemaTier = 0;
      return 0;
    }
  }

  private describePayrollEmployeeSyncDbError(err: unknown, idDoc: string): string {
    const code = (err as { code?: string } | null)?.code || "";
    const msg = err instanceof Error ? err.message : String(err);
    if (code === "23505" && /numero_documento|documento|uq_empleado/i.test(msg)) {
      return `Ya existe un colaborador con el documento ${idDoc} en esta empresa. Revise la ficha o use otro número.`;
    }
    if (code === "22007" || /invalid input syntax for type date/i.test(msg)) {
      return "Alguna fecha del colaborador no es válida (ingreso, inicio contrato vigente, nacimiento o fin de contrato). Revise el formulario.";
    }
    if (code === "23503" || /violates foreign key|foreign key constraint/i.test(msg)) {
      if (/id_empresa|empresas/i.test(msg)) {
        return "La empresa seleccionada no existe en el servidor.";
      }
      if (/id_cargo|cargos/i.test(msg)) {
        return "El cargo del formulario no coincide con un registro en la tabla de cargos. Recargue el portal e intente de nuevo.";
      }
      return "No se pudo guardar el colaborador: hay una referencia inválida en el servidor.";
    }
    if (code === "23514" || /check constraint|chk_empleados/i.test(msg)) {
      return "Datos médicos o de contrato no cumplen las reglas de la base de datos. Revise enfermedad/condición y fechas.";
    }
    if (code === "22001" || /value too long|too long for type/i.test(msg)) {
      return "Algún texto del colaborador supera el tamaño permitido (nombre, dirección, cuenta bancaria, etc.).";
    }
    if (
      code === "42703" ||
      code === "08P01" ||
      /column .* does not exist|bind message supplies|does not match/i.test(msg)
    ) {
      return "El servidor no tiene el esquema de empleados actualizado o hubo un desajuste interno. Ejecute npm run db:init, reinicie la API y vuelva a intentar.";
    }
    if (code === "22P02" || /invalid input syntax for type/i.test(msg)) {
      return "Algún valor numérico o de fecha del colaborador no es válido. Revise salario, plazos y fechas.";
    }
    this.logger.error(`syncPayrollEmployees documento ${idDoc}: ${sanitizeLogText(msg)}`);
    return `No se pudo guardar el colaborador (documento ${idDoc}). Revise fechas, empresa y datos obligatorios.`;
  }

  private mapPayrollEmployeeSyncDbError(err: unknown, idDoc: string): never {
    throw new BadRequestException(this.describePayrollEmployeeSyncDbError(err, idDoc));
  }

  private payrollEmployeeOptionalInt(raw: unknown): number | null {
    if (raw == null || raw === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.floor(n);
  }

  private payrollEmployeeOptionalAmount(raw: unknown): number | null {
    if (raw == null || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  private async queryPayrollEmployeeUpsert(
    c: PoolClient,
    tier: 0 | 1 | 2 | 3,
    UPSERT_LEGACY: string,
    UPSERT_M19: string,
    UPSERT_M45: string,
    UPSERT_M46: string,
    base52: unknown[],
    baseWithVigente: unknown[],
    baseWithVigenteRenewal: unknown[],
    illnessFlag: boolean,
    illnessDesc: string | null,
    createdAtTs: string,
    updatedAtTs: string
  ): Promise<void> {
    if (tier === 0) {
      await c.query(UPSERT_LEGACY, [...base52, createdAtTs, updatedAtTs]);
      return;
    }
    if (tier === 1) {
      await c.query(UPSERT_M19, [...base52, illnessFlag, illnessDesc, createdAtTs, updatedAtTs]);
      return;
    }
    if (tier === 2) {
      await c.query(UPSERT_M45, [
        ...baseWithVigente,
        illnessFlag,
        illnessDesc,
        createdAtTs,
        updatedAtTs
      ]);
      return;
    }
    await c.query(UPSERT_M46, [
      ...baseWithVigenteRenewal,
      illnessFlag,
      illnessDesc,
      createdAtTs,
      updatedAtTs
    ]);
  }

  private async syncPayrollEmployees(
    c: PoolClient,
    data: unknown,
    deletedIds?: string[]
  ) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    this.payrollEmployeeSchemaTier = undefined;
    let tier = await this.resolvePayrollEmployeeSchemaTier(c);
    await this.syncListWithPruning(c, "empleados_nomina", data, deletedIds);

    /**
     * id_cargo es FK a cargos (nullable, ON DELETE SET NULL). Si el cargo aún no
     * llegó a la BD (sync de cargos en segundo plano, otra sesión/dispositivo o dato
     * legado), un id_cargo inexistente lanzaba 23503 y abortaba TODO el lote: el
     * empleado nuevo no quedaba guardado. Resolvemos contra los cargos existentes y
     * caemos a NULL si no está, conservando nombre_cargo_texto, para que el alta del
     * colaborador nunca se pierda por desincronía del catálogo.
     */
    const existingCargoIds = new Set<string>();
    try {
      const { rows: cargoRows } = await c.query<{ id: string }>(
        `SELECT id::text AS id FROM cargos`
      );
      for (const row of cargoRows) {
        const id = String(row.id || "").trim();
        if (id) existingCargoIds.add(id);
      }
    } catch (e) {
      this.logger.warn(
        `syncPayrollEmployees: no se pudo leer catálogo de cargos para validar id_cargo (${
          e instanceof Error ? e.message : String(e)
        }); se omitirá el vínculo de cargo en este lote.`
      );
    }

    const UPSERT_LEGACY = `INSERT INTO empleados_nomina (
          id, id_empresa, id_cargo, nombre_completo, tipo_documento, numero_documento,
          fecha_nacimiento, genero, estado_civil, tipo_sangre, nivel_educativo,
          departamento, ciudad, direccion, telefono, correo_personal,
          contacto_emergencia, telefono_emergencia, parentesco_emergencia,
          nombre_cargo_texto, tipo_contrato, duracion_contrato_texto,
          fecha_ingreso, salario_base, auxilio_transporte,
          periodicidad_pago, centro_costos, tipo_cotizante, nivel_riesgo_arl, tipo_plantilla_contrato,
          eps, fondo_pension, arl, fondo_cesantias, caja_compensacion,
          banco, tipo_cuenta_bancaria, numero_cuenta_bancaria, rol_trabajador,
          numero_licencia, categoria_licencia, fecha_vencimiento_licencia,
          fecha_examen_ocupacional, fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial, fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva,
          meses_prueba, fecha_fin_contrato, jornada_laboral, url_avatar, correo_corporativo,
          fecha_creacion, fecha_actualizacion
        ) VALUES (
          $1::uuid, $2::uuid, $3::uuid, $4, $5, $6,
          $7::date, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19,
          $20, $21, $22,
          $23::date, $24, $25,
          $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35,
          $36, $37, $38, $39,
          $40, $41, $42,
          $43::date, $44::date, $45::date, $46::date, $47,
          $48, $49, $50, $51, $52,
          COALESCE($53::timestamptz, now()), COALESCE($54::timestamptz, now())
        )
        ON CONFLICT (id) DO UPDATE SET
          nombre_completo = EXCLUDED.nombre_completo,
          tipo_documento = EXCLUDED.tipo_documento,
          numero_documento = EXCLUDED.numero_documento,
          fecha_nacimiento = EXCLUDED.fecha_nacimiento,
          genero = EXCLUDED.genero,
          estado_civil = EXCLUDED.estado_civil,
          tipo_sangre = EXCLUDED.tipo_sangre,
          nivel_educativo = EXCLUDED.nivel_educativo,
          departamento = EXCLUDED.departamento,
          ciudad = EXCLUDED.ciudad,
          direccion = EXCLUDED.direccion,
          telefono = EXCLUDED.telefono,
          correo_personal = EXCLUDED.correo_personal,
          contacto_emergencia = EXCLUDED.contacto_emergencia,
          telefono_emergencia = EXCLUDED.telefono_emergencia,
          parentesco_emergencia = EXCLUDED.parentesco_emergencia,
          nombre_cargo_texto = EXCLUDED.nombre_cargo_texto,
          tipo_contrato = EXCLUDED.tipo_contrato,
          duracion_contrato_texto = EXCLUDED.duracion_contrato_texto,
          fecha_ingreso = EXCLUDED.fecha_ingreso,
          salario_base = EXCLUDED.salario_base,
          auxilio_transporte = EXCLUDED.auxilio_transporte,
          periodicidad_pago = EXCLUDED.periodicidad_pago,
          centro_costos = EXCLUDED.centro_costos,
          tipo_cotizante = EXCLUDED.tipo_cotizante,
          nivel_riesgo_arl = EXCLUDED.nivel_riesgo_arl,
          tipo_plantilla_contrato = EXCLUDED.tipo_plantilla_contrato,
          eps = EXCLUDED.eps,
          fondo_pension = EXCLUDED.fondo_pension,
          arl = EXCLUDED.arl,
          fondo_cesantias = EXCLUDED.fondo_cesantias,
          caja_compensacion = EXCLUDED.caja_compensacion,
          banco = EXCLUDED.banco,
          tipo_cuenta_bancaria = EXCLUDED.tipo_cuenta_bancaria,
          numero_cuenta_bancaria = EXCLUDED.numero_cuenta_bancaria,
          rol_trabajador = EXCLUDED.rol_trabajador,
          numero_licencia = EXCLUDED.numero_licencia,
          categoria_licencia = EXCLUDED.categoria_licencia,
          fecha_vencimiento_licencia = EXCLUDED.fecha_vencimiento_licencia,
          fecha_examen_ocupacional = EXCLUDED.fecha_examen_ocupacional,
          fecha_vencimiento_examen_ocupacional = EXCLUDED.fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial = EXCLUDED.fecha_examen_instruvial,
          fecha_vencimiento_examen_instruvial = EXCLUDED.fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva = EXCLUDED.curso_conduccion_defensiva,
          id_empresa = EXCLUDED.id_empresa,
          id_cargo = EXCLUDED.id_cargo,
          meses_prueba = EXCLUDED.meses_prueba,
          fecha_fin_contrato = EXCLUDED.fecha_fin_contrato,
          jornada_laboral = EXCLUDED.jornada_laboral,
          correo_corporativo = EXCLUDED.correo_corporativo,
          url_avatar = EXCLUDED.url_avatar,
          fecha_actualizacion = COALESCE(EXCLUDED.fecha_actualizacion, empleados_nomina.fecha_actualizacion, now())`;

    const UPSERT_M19 = `INSERT INTO empleados_nomina (
          id, id_empresa, id_cargo, nombre_completo, tipo_documento, numero_documento,
          fecha_nacimiento, genero, estado_civil, tipo_sangre, nivel_educativo,
          departamento, ciudad, direccion, telefono, correo_personal,
          contacto_emergencia, telefono_emergencia, parentesco_emergencia,
          nombre_cargo_texto, tipo_contrato, duracion_contrato_texto,
          fecha_ingreso, salario_base, auxilio_transporte,
          periodicidad_pago, centro_costos, tipo_cotizante, nivel_riesgo_arl, tipo_plantilla_contrato,
          eps, fondo_pension, arl, fondo_cesantias, caja_compensacion,
          banco, tipo_cuenta_bancaria, numero_cuenta_bancaria, rol_trabajador,
          numero_licencia, categoria_licencia, fecha_vencimiento_licencia,
          fecha_examen_ocupacional, fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial, fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva,
          meses_prueba, fecha_fin_contrato, jornada_laboral, url_avatar, correo_corporativo,
          tiene_condicion_medica, descripcion_condicion_medica,
          fecha_creacion, fecha_actualizacion
        ) VALUES (
          $1::uuid, $2::uuid, $3::uuid, $4, $5, $6,
          $7::date, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19,
          $20, $21, $22,
          $23::date, $24, $25,
          $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35,
          $36, $37, $38, $39,
          $40, $41, $42,
          $43::date, $44::date, $45::date, $46::date, $47,
          $48, $49, $50, $51, $52,
          $53::boolean, $54,
          COALESCE($55::timestamptz, now()), COALESCE($56::timestamptz, now())
        )
        ON CONFLICT (id) DO UPDATE SET
          nombre_completo = EXCLUDED.nombre_completo,
          tipo_documento = EXCLUDED.tipo_documento,
          numero_documento = EXCLUDED.numero_documento,
          fecha_nacimiento = EXCLUDED.fecha_nacimiento,
          genero = EXCLUDED.genero,
          estado_civil = EXCLUDED.estado_civil,
          tipo_sangre = EXCLUDED.tipo_sangre,
          nivel_educativo = EXCLUDED.nivel_educativo,
          departamento = EXCLUDED.departamento,
          ciudad = EXCLUDED.ciudad,
          direccion = EXCLUDED.direccion,
          telefono = EXCLUDED.telefono,
          correo_personal = EXCLUDED.correo_personal,
          contacto_emergencia = EXCLUDED.contacto_emergencia,
          telefono_emergencia = EXCLUDED.telefono_emergencia,
          parentesco_emergencia = EXCLUDED.parentesco_emergencia,
          nombre_cargo_texto = EXCLUDED.nombre_cargo_texto,
          tipo_contrato = EXCLUDED.tipo_contrato,
          duracion_contrato_texto = EXCLUDED.duracion_contrato_texto,
          fecha_ingreso = EXCLUDED.fecha_ingreso,
          salario_base = EXCLUDED.salario_base,
          auxilio_transporte = EXCLUDED.auxilio_transporte,
          periodicidad_pago = EXCLUDED.periodicidad_pago,
          centro_costos = EXCLUDED.centro_costos,
          tipo_cotizante = EXCLUDED.tipo_cotizante,
          nivel_riesgo_arl = EXCLUDED.nivel_riesgo_arl,
          tipo_plantilla_contrato = EXCLUDED.tipo_plantilla_contrato,
          eps = EXCLUDED.eps,
          fondo_pension = EXCLUDED.fondo_pension,
          arl = EXCLUDED.arl,
          fondo_cesantias = EXCLUDED.fondo_cesantias,
          caja_compensacion = EXCLUDED.caja_compensacion,
          banco = EXCLUDED.banco,
          tipo_cuenta_bancaria = EXCLUDED.tipo_cuenta_bancaria,
          numero_cuenta_bancaria = EXCLUDED.numero_cuenta_bancaria,
          rol_trabajador = EXCLUDED.rol_trabajador,
          numero_licencia = EXCLUDED.numero_licencia,
          categoria_licencia = EXCLUDED.categoria_licencia,
          fecha_vencimiento_licencia = EXCLUDED.fecha_vencimiento_licencia,
          fecha_examen_ocupacional = EXCLUDED.fecha_examen_ocupacional,
          fecha_vencimiento_examen_ocupacional = EXCLUDED.fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial = EXCLUDED.fecha_examen_instruvial,
          fecha_vencimiento_examen_instruvial = EXCLUDED.fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva = EXCLUDED.curso_conduccion_defensiva,
          id_empresa = EXCLUDED.id_empresa,
          id_cargo = EXCLUDED.id_cargo,
          meses_prueba = EXCLUDED.meses_prueba,
          fecha_fin_contrato = EXCLUDED.fecha_fin_contrato,
          jornada_laboral = EXCLUDED.jornada_laboral,
          correo_corporativo = EXCLUDED.correo_corporativo,
          tiene_condicion_medica = EXCLUDED.tiene_condicion_medica,
          descripcion_condicion_medica = EXCLUDED.descripcion_condicion_medica,
          url_avatar = EXCLUDED.url_avatar,
          fecha_actualizacion = COALESCE(EXCLUDED.fecha_actualizacion, empleados_nomina.fecha_actualizacion, now())`;

    const UPSERT_M45 = `INSERT INTO empleados_nomina (
          id, id_empresa, id_cargo, nombre_completo, tipo_documento, numero_documento,
          fecha_nacimiento, genero, estado_civil, tipo_sangre, nivel_educativo,
          departamento, ciudad, direccion, telefono, correo_personal,
          contacto_emergencia, telefono_emergencia, parentesco_emergencia,
          nombre_cargo_texto, tipo_contrato, duracion_contrato_texto,
          fecha_ingreso, fecha_inicio_contrato_vigente, salario_base, auxilio_transporte,
          periodicidad_pago, centro_costos, tipo_cotizante, nivel_riesgo_arl, tipo_plantilla_contrato,
          eps, fondo_pension, arl, fondo_cesantias, caja_compensacion,
          banco, tipo_cuenta_bancaria, numero_cuenta_bancaria, rol_trabajador,
          numero_licencia, categoria_licencia, fecha_vencimiento_licencia,
          fecha_examen_ocupacional, fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial, fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva,
          meses_prueba, fecha_fin_contrato, jornada_laboral, url_avatar, correo_corporativo,
          tiene_condicion_medica, descripcion_condicion_medica,
          fecha_creacion, fecha_actualizacion
        ) VALUES (
          $1::uuid, $2::uuid, $3::uuid, $4, $5, $6,
          $7::date, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19,
          $20, $21, $22,
          $23::date, $24::date, $25, $26,
          $27, $28, $29, $30, $31,
          $32, $33, $34, $35, $36,
          $37, $38, $39, $40,
          $41, $42, $43,
          $44::date, $45::date, $46::date, $47::date, $48,
          $49, $50, $51, $52, $53,
          $54::boolean, $55,
          COALESCE($56::timestamptz, now()), COALESCE($57::timestamptz, now())
        )
        ON CONFLICT (id) DO UPDATE SET
          nombre_completo = EXCLUDED.nombre_completo,
          tipo_documento = EXCLUDED.tipo_documento,
          numero_documento = EXCLUDED.numero_documento,
          fecha_nacimiento = EXCLUDED.fecha_nacimiento,
          genero = EXCLUDED.genero,
          estado_civil = EXCLUDED.estado_civil,
          tipo_sangre = EXCLUDED.tipo_sangre,
          nivel_educativo = EXCLUDED.nivel_educativo,
          departamento = EXCLUDED.departamento,
          ciudad = EXCLUDED.ciudad,
          direccion = EXCLUDED.direccion,
          telefono = EXCLUDED.telefono,
          correo_personal = EXCLUDED.correo_personal,
          contacto_emergencia = EXCLUDED.contacto_emergencia,
          telefono_emergencia = EXCLUDED.telefono_emergencia,
          parentesco_emergencia = EXCLUDED.parentesco_emergencia,
          nombre_cargo_texto = EXCLUDED.nombre_cargo_texto,
          tipo_contrato = EXCLUDED.tipo_contrato,
          duracion_contrato_texto = EXCLUDED.duracion_contrato_texto,
          fecha_ingreso = EXCLUDED.fecha_ingreso,
          fecha_inicio_contrato_vigente = EXCLUDED.fecha_inicio_contrato_vigente,
          salario_base = EXCLUDED.salario_base,
          auxilio_transporte = EXCLUDED.auxilio_transporte,
          periodicidad_pago = EXCLUDED.periodicidad_pago,
          centro_costos = EXCLUDED.centro_costos,
          tipo_cotizante = EXCLUDED.tipo_cotizante,
          nivel_riesgo_arl = EXCLUDED.nivel_riesgo_arl,
          tipo_plantilla_contrato = EXCLUDED.tipo_plantilla_contrato,
          eps = EXCLUDED.eps,
          fondo_pension = EXCLUDED.fondo_pension,
          arl = EXCLUDED.arl,
          fondo_cesantias = EXCLUDED.fondo_cesantias,
          caja_compensacion = EXCLUDED.caja_compensacion,
          banco = EXCLUDED.banco,
          tipo_cuenta_bancaria = EXCLUDED.tipo_cuenta_bancaria,
          numero_cuenta_bancaria = EXCLUDED.numero_cuenta_bancaria,
          rol_trabajador = EXCLUDED.rol_trabajador,
          numero_licencia = EXCLUDED.numero_licencia,
          categoria_licencia = EXCLUDED.categoria_licencia,
          fecha_vencimiento_licencia = EXCLUDED.fecha_vencimiento_licencia,
          fecha_examen_ocupacional = EXCLUDED.fecha_examen_ocupacional,
          fecha_vencimiento_examen_ocupacional = EXCLUDED.fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial = EXCLUDED.fecha_examen_instruvial,
          fecha_vencimiento_examen_instruvial = EXCLUDED.fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva = EXCLUDED.curso_conduccion_defensiva,
          id_empresa = EXCLUDED.id_empresa,
          id_cargo = EXCLUDED.id_cargo,
          meses_prueba = EXCLUDED.meses_prueba,
          fecha_fin_contrato = EXCLUDED.fecha_fin_contrato,
          jornada_laboral = EXCLUDED.jornada_laboral,
          correo_corporativo = EXCLUDED.correo_corporativo,
          tiene_condicion_medica = EXCLUDED.tiene_condicion_medica,
          descripcion_condicion_medica = EXCLUDED.descripcion_condicion_medica,
          url_avatar = EXCLUDED.url_avatar,
          fecha_actualizacion = COALESCE(EXCLUDED.fecha_actualizacion, empleados_nomina.fecha_actualizacion, now())`;

    const UPSERT_M46 = `INSERT INTO empleados_nomina (
          id, id_empresa, id_cargo, nombre_completo, tipo_documento, numero_documento,
          fecha_nacimiento, genero, estado_civil, tipo_sangre, nivel_educativo,
          departamento, ciudad, direccion, telefono, correo_personal,
          contacto_emergencia, telefono_emergencia, parentesco_emergencia,
          nombre_cargo_texto, tipo_contrato, duracion_contrato_texto,
          fecha_ingreso, fecha_inicio_contrato_vigente, fecha_renovacion, fecha_aviso_no_renovacion, salario_base, auxilio_transporte,
          periodicidad_pago, centro_costos, tipo_cotizante, nivel_riesgo_arl, tipo_plantilla_contrato,
          eps, fondo_pension, arl, fondo_cesantias, caja_compensacion,
          banco, tipo_cuenta_bancaria, numero_cuenta_bancaria, rol_trabajador,
          numero_licencia, categoria_licencia, fecha_vencimiento_licencia,
          fecha_examen_ocupacional, fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial, fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva,
          meses_prueba, fecha_fin_contrato, jornada_laboral, url_avatar, correo_corporativo,
          tiene_condicion_medica, descripcion_condicion_medica,
          fecha_creacion, fecha_actualizacion
        ) VALUES (
          $1::uuid, $2::uuid, $3::uuid, $4, $5, $6,
          $7::date, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19,
          $20, $21, $22,
          $23::date, $24::date, $25::date, $26::date, $27, $28,
          $29, $30, $31, $32, $33,
          $34, $35, $36, $37, $38,
          $39, $40, $41, $42,
          $43, $44, $45,
          $46::date, $47::date, $48::date, $49::date, $50,
          $51, $52, $53, $54, $55,
          $56::boolean, $57,
          COALESCE($58::timestamptz, now()), COALESCE($59::timestamptz, now())
        )
        ON CONFLICT (id) DO UPDATE SET
          nombre_completo = EXCLUDED.nombre_completo,
          tipo_documento = EXCLUDED.tipo_documento,
          numero_documento = EXCLUDED.numero_documento,
          fecha_nacimiento = EXCLUDED.fecha_nacimiento,
          genero = EXCLUDED.genero,
          estado_civil = EXCLUDED.estado_civil,
          tipo_sangre = EXCLUDED.tipo_sangre,
          nivel_educativo = EXCLUDED.nivel_educativo,
          departamento = EXCLUDED.departamento,
          ciudad = EXCLUDED.ciudad,
          direccion = EXCLUDED.direccion,
          telefono = EXCLUDED.telefono,
          correo_personal = EXCLUDED.correo_personal,
          contacto_emergencia = EXCLUDED.contacto_emergencia,
          telefono_emergencia = EXCLUDED.telefono_emergencia,
          parentesco_emergencia = EXCLUDED.parentesco_emergencia,
          nombre_cargo_texto = EXCLUDED.nombre_cargo_texto,
          tipo_contrato = EXCLUDED.tipo_contrato,
          duracion_contrato_texto = EXCLUDED.duracion_contrato_texto,
          fecha_ingreso = EXCLUDED.fecha_ingreso,
          fecha_inicio_contrato_vigente = EXCLUDED.fecha_inicio_contrato_vigente,
          fecha_renovacion = EXCLUDED.fecha_renovacion,
          fecha_aviso_no_renovacion = EXCLUDED.fecha_aviso_no_renovacion,
          salario_base = EXCLUDED.salario_base,
          auxilio_transporte = EXCLUDED.auxilio_transporte,
          periodicidad_pago = EXCLUDED.periodicidad_pago,
          centro_costos = EXCLUDED.centro_costos,
          tipo_cotizante = EXCLUDED.tipo_cotizante,
          nivel_riesgo_arl = EXCLUDED.nivel_riesgo_arl,
          tipo_plantilla_contrato = EXCLUDED.tipo_plantilla_contrato,
          eps = EXCLUDED.eps,
          fondo_pension = EXCLUDED.fondo_pension,
          arl = EXCLUDED.arl,
          fondo_cesantias = EXCLUDED.fondo_cesantias,
          caja_compensacion = EXCLUDED.caja_compensacion,
          banco = EXCLUDED.banco,
          tipo_cuenta_bancaria = EXCLUDED.tipo_cuenta_bancaria,
          numero_cuenta_bancaria = EXCLUDED.numero_cuenta_bancaria,
          rol_trabajador = EXCLUDED.rol_trabajador,
          numero_licencia = EXCLUDED.numero_licencia,
          categoria_licencia = EXCLUDED.categoria_licencia,
          fecha_vencimiento_licencia = EXCLUDED.fecha_vencimiento_licencia,
          fecha_examen_ocupacional = EXCLUDED.fecha_examen_ocupacional,
          fecha_vencimiento_examen_ocupacional = EXCLUDED.fecha_vencimiento_examen_ocupacional,
          fecha_examen_instruvial = EXCLUDED.fecha_examen_instruvial,
          fecha_vencimiento_examen_instruvial = EXCLUDED.fecha_vencimiento_examen_instruvial,
          curso_conduccion_defensiva = EXCLUDED.curso_conduccion_defensiva,
          id_empresa = EXCLUDED.id_empresa,
          id_cargo = EXCLUDED.id_cargo,
          meses_prueba = EXCLUDED.meses_prueba,
          fecha_fin_contrato = EXCLUDED.fecha_fin_contrato,
          jornada_laboral = EXCLUDED.jornada_laboral,
          correo_corporativo = EXCLUDED.correo_corporativo,
          tiene_condicion_medica = EXCLUDED.tiene_condicion_medica,
          descripcion_condicion_medica = EXCLUDED.descripcion_condicion_medica,
          url_avatar = EXCLUDED.url_avatar,
          fecha_actualizacion = COALESCE(EXCLUDED.fecha_actualizacion, empleados_nomina.fecha_actualizacion, now())`;

    const syncErrors: string[] = [];
    let rowIndex = 0;
    let incomingWithIds = 0;
    let persistedCount = 0;
    for (const raw of data) {
      rowIndex += 1;
      const e = raw as Record<string, unknown>;
      if (!e?.id || !e.companyId) continue;
      incomingWithIds += 1;
      if (this.skipUnlessPersistUuid("syncPayrollEmployees", e.id)) continue;
      if (this.skipUnlessPersistUuid("syncPayrollEmployees.companyId", e.companyId)) continue;
      const p = pickPortalField;
      const name = nu(e.name ?? "Empleado") || "EMPLEADO";
      const docType = String(e.documentType || "CC")
        .trim()
        .toUpperCase();
      const idDoc = String(e.idDoc || "0").trim();
      const city = cat(p(e, "city") ?? "Bogota") ?? "Bogota";
      const address = nu(p(e, "address") ?? "N/D") || "N/D";
      const phone = normalizePortalPhoneForStorage(p(e, "phone") ?? "3000000000");
      const emContact = nu(p(e, "emergencyContact") ?? "N/D") || "N/D";
      const emPhone = normalizePortalPhoneForStorage(p(e, "emergencyPhone") ?? "3000000000");
      const emRel = nu(p(e, "emergencyRelation", "emergencyRelationship") ?? "familiar") || "FAMILIAR";
      const posText = nu(p(e, "position") ?? "Empleado") || "EMPLEADO";
      const role = String(e.workerRole || "empleado").toLowerCase();
      const contract =
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.contractTypes, p(e, "contractType")) ||
        "Termino indefinido";
      const start = portalDateOrNull(p(e, "startDate"));
      if (!start) {
        syncErrors.push(
          `Fecha de ingreso inválida o vacía para ${name} (documento ${idDoc}).`
        );
        continue;
      }
      const isFixedTerm = String(contract || "").trim() === "Termino fijo";
      const vigenteRaw = portalDateOrNull(
        p(e, "contractVigenteStartDate", "fecha_inicio_contrato_vigente")
      );
      const vigenteStart = isFixedTerm ? vigenteRaw ?? start : null;
      const renewalDate = isFixedTerm
        ? portalDateOrNull(p(e, "renewalDate", "fecha_renovacion"))
        : null;
      const nonRenewalNoticeDate = isFixedTerm
        ? portalDateOrNull(p(e, "nonRenewalNoticeDate", "fecha_aviso_no_renovacion"))
        : null;
      const base = Number(p(e, "baseSalary")) || 0;
      const bank =
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.banks, p(e, "bankName", "bank")) ||
        "Bancolombia";
      const acctNum = String(p(e, "bankAccount", "accountNumber") ?? "0").trim();
      const acctType =
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.accountTypes, p(e, "bankAccountType", "accountType")) ||
        "Ahorros";
      const eps =
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.eps, p(e, "eps")) || "Sura";
      const pension =
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.pensionFunds, p(e, "pensionFund")) ||
        "Porvenir";
      const arl = matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.arl, p(e, "arl")) || "Sura";

      const periodicidadRaw = p(
        e,
        "payFrequency",
        "periodicidadPago",
        "periodicidad_pago"
      );
      const periodicidadPago = isPayrollAutogenFrequency(
        periodicidadRaw != null ? String(periodicidadRaw) : undefined
      )
        ? canonicalPayFrequencyLabel(periodicidadRaw != null ? String(periodicidadRaw) : undefined)
        : "Mensual";

      const occExam = portalDateOrNull(
        p(e, "occupationalExamDate", "psychoTestDate", "psychometricExamDate", "fecha_examen_ocupacional")
      );
      const intraExam = portalDateOrNull(
        p(e, "instruvialExamDate", "intravehicularExamDate", "fecha_examen_instruvial")
      );
      const occExpiry = occExam ? portalYmdPlusYears(occExam, 1) : null;
      const intraExpiry = intraExam ? portalYmdPlusYears(intraExam, 1) : null;

      const rawPositionId = portalUuidOrNull(e.positionId);
      const positionIdSql =
        rawPositionId && existingCargoIds.has(rawPositionId) ? rawPositionId : null;
      if (rawPositionId && !positionIdSql) {
        this.logger.warn(
          `syncPayrollEmployees: cargo ${rawPositionId} no existe en la BD; se guarda el colaborador ${idDoc} con id_cargo NULL (texto de cargo preservado).`
        );
      }

      const base52: unknown[] = [
        e.id,
        e.companyId,
        positionIdSql,
        name,
        docType,
        idDoc,
        portalDateOrNull(p(e, "birthDate")),
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.genders, p(e, "gender")),
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.maritalStatus, p(e, "maritalStatus")),
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.bloodTypes, p(e, "bloodType")),
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.educationLevel, p(e, "educationLevel")),
        cat(p(e, "department")),
        city,
        address,
        phone,
        em(p(e, "personalEmail")),
        emContact,
        emPhone,
        emRel,
        posText,
        contract,
        nuN(p(e, "contractDuration", "contractDurationText")),
        start,
        base,
        this.payrollEmployeeOptionalAmount(p(e, "transportAllowance")),
        periodicidadPago,
        nuN(p(e, "costCenter", "centro_costos", "centroCostos")),
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.contributorTypes, p(e, "contributorType")),
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.arlRiskLevels, p(e, "arlRiskLevel")),
        normalizeContractTemplateKindForDb(
          p(e, "contractTemplateKind", "contractTemplate"),
          contract,
          role
        ),
        eps,
        pension,
        arl,
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.severanceFunds, p(e, "severanceFund")),
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.compensationFunds, p(e, "compensationFund")),
        bank,
        acctType,
        acctNum,
        role,
        nuN(p(e, "license", "licenseNumber")),
        matchPayrollCatalogOption(
          PAYROLL_EMPLOYEE_CATALOG.licenseCategories,
          p(e, "licenseCategory")
        ),
        portalDateOrNull(p(e, "licenseExpiry")),
        occExam,
        occExpiry,
        intraExam,
        intraExpiry,
        normalizeDefensiveCourseForDb(p(e, "defensiveCourse", "defensiveDrivingCourse")),
        this.payrollEmployeeOptionalInt(p(e, "probationMonths")),
        portalDateOrNull(p(e, "contractEndDate")),
        matchPayrollCatalogOption(PAYROLL_EMPLOYEE_CATALOG.workSchedule, p(e, "workSchedule")),
        (() => {
          const rawAvatar = String((p(e, "avatarUrl") as string) || "").trim();
          return rawAvatar && !rawAvatar.startsWith("data:") ? rawAvatar : null;
        })(),
        em(p(e, "corporateEmail"))
      ];

      const portalEmpAuditTs = (v: unknown): string | null => {
        if (v == null || v === "") return null;
        const d = new Date(String(v).trim());
        if (Number.isNaN(d.getTime())) return null;
        return timestamptzToColombiaIso(d);
      };
      const createdAtTs =
        portalEmpAuditTs(pickPortalField(e, "createdAt", "fecha_creacion")) ??
        timestamptzStringColombiaNow();
      const updatedAtTs =
        portalEmpAuditTs(pickPortalField(e, "updatedAt", "fecha_actualizacion")) ?? createdAtTs;

      const illnessFlag = String(p(e, "hasIllness") ?? "").toLowerCase() === "si";
      const illnessDesc = illnessFlag ? nuN(p(e, "illnessDescription")) : null;
      const baseWithVigente = [...base52.slice(0, 23), vigenteStart, ...base52.slice(23)];
      const baseWithVigenteRenewal = [
        ...base52.slice(0, 23),
        vigenteStart,
        renewalDate,
        nonRenewalNoticeDate,
        ...base52.slice(23)
      ];

      const sp = `emp_sp_${rowIndex}`;
      try {
        await c.query(`SAVEPOINT ${sp}`);
        try {
          await this.queryPayrollEmployeeUpsert(
            c,
            tier,
            UPSERT_LEGACY,
            UPSERT_M19,
            UPSERT_M45,
            UPSERT_M46,
            base52,
            baseWithVigente,
            baseWithVigenteRenewal,
            illnessFlag,
            illnessDesc,
            createdAtTs,
            updatedAtTs
          );
        } catch (err) {
          const code = (err as { code?: string } | null)?.code || "";
          if (code === "42703" || code === "08P01") {
            this.payrollEmployeeSchemaTier = undefined;
            tier = await this.resolvePayrollEmployeeSchemaTier(c);
            await this.queryPayrollEmployeeUpsert(
              c,
              tier,
              UPSERT_LEGACY,
              UPSERT_M19,
              UPSERT_M45,
              UPSERT_M46,
              base52,
              baseWithVigente,
              baseWithVigenteRenewal,
              illnessFlag,
              illnessDesc,
              createdAtTs,
              updatedAtTs
            );
          } else {
            throw err;
          }
        }

        if (role === "conductor") {
          try {
            await this.upsertConductorFromPayrollEmployeePayload(c, e);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.warn(
              `upsertConductorFromPayrollEmployeePayload id=${String(e.id)}: ${sanitizeLogText(msg)}`
            );
          }
        }
        await c.query(`RELEASE SAVEPOINT ${sp}`);
        persistedCount += 1;
      } catch (err) {
        await c.query(`ROLLBACK TO SAVEPOINT ${sp}`).catch(() => undefined);
        await c.query(`RELEASE SAVEPOINT ${sp}`).catch(() => undefined);
        syncErrors.push(this.describePayrollEmployeeSyncDbError(err, idDoc));
      }
    }
    if (syncErrors.length > 0) {
      throw new BadRequestException(
        syncErrors.length === 1 ? syncErrors[0] : syncErrors.join(" ")
      );
    }
    if (incomingWithIds > 0 && persistedCount === 0) {
      throw new BadRequestException(
        "Ningún colaborador del lote pudo guardarse en el servidor. Verifique que el empleado y la empresa tengan identificador UUID válido (registros de solo navegador o semillas QA como emp-1 no se sincronizan con PostgreSQL)."
      );
    }
    try {
      await this.runFixedTermContractRenewalNotifications();
    } catch (e) {
      this.logger.warn(
        `Avisos contrato tras sync empleados: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  private syncPayrollNumeric(v: unknown, fallback = 0): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  /** Otra liquidación del mismo mes calendario (jun/dic) ya incluyó prima. */
  private async payrollPrimaAlreadyPaidInMonth(
    c: PoolClient,
    employeeId: string,
    calendarMonthYm: string,
    excludePeriodKey: string
  ): Promise<boolean> {
    const ym = String(calendarMonthYm || "").trim().slice(0, 7);
    const res = await c.query(
      `SELECT 1 FROM liquidaciones_nomina
       WHERE id_empleado = $1::uuid
         AND periodo_mes <> $2
         AND (periodo_mes = $3 OR periodo_mes LIKE $3 || '-%')
         AND (incluye_prima_servicios = true OR COALESCE(prima_servicios_cop, 0) > 0)
       LIMIT 1`,
      [employeeId, excludePeriodKey, ym]
    );
    return (res.rowCount ?? 0) > 0;
  }

  /** Otra liquidación de ene/feb del mismo año ya incluyó intereses de cesantías. */
  private async payrollCesantiasInterestAlreadyPaidInYear(
    c: PoolClient,
    employeeId: string,
    calendarMonthYm: string,
    excludePeriodKey: string
  ): Promise<boolean> {
    const ym = String(calendarMonthYm || "").trim().slice(0, 7);
    const year = ym.slice(0, 4);
    const res = await c.query(
      `SELECT 1 FROM liquidaciones_nomina
       WHERE id_empleado = $1::uuid
         AND periodo_mes <> $2
         AND (periodo_mes LIKE $3 || '-01%' OR periodo_mes LIKE $3 || '-02%')
         AND (incluye_intereses_cesantias = true OR COALESCE(intereses_cesantias_cop, 0) > 0)
       LIMIT 1`,
      [employeeId, excludePeriodKey, year]
    );
    return (res.rowCount ?? 0) > 0;
  }

  private payrollRunCreatedByParam(run: Record<string, unknown>): unknown[] {
    const raw = pickPortalField(run, "createdBy", "createdByEmail", "creadoPor", "creado_por");
    const label = raw != null ? String(raw).trim() : "";
    return [label || null];
  }

  private payrollRunBaseParams(run: Record<string, unknown>): unknown[] {
    return [
      run.id,
      run.employeeId,
      nu(run.employeeName),
      run.month,
      this.syncPayrollNumeric(run.gross),
      this.syncPayrollNumeric(run.ibc),
      this.syncPayrollNumeric(run.travelAllowance),
      this.syncPayrollNumeric(run.fuelReimbursement),
      this.syncPayrollNumeric(run.travelAllowanceAuto ?? 0),
      this.syncPayrollNumeric(run.fuelReimbursementAuto ?? 0),
      this.syncPayrollNumeric(run.travelAllowanceManual ?? 0),
      this.syncPayrollNumeric(run.fuelReimbursementManual ?? 0),
      this.syncPayrollNumeric(run.extras ?? 0),
      this.syncPayrollNumeric(run.aux ?? 0),
      this.syncPayrollNumeric(run.bonus ?? 0),
      this.syncPayrollNumeric(run.tripCount ?? 0),
      this.syncPayrollNumeric(run.interDepartmentTrips ?? 0),
      this.syncPayrollNumeric(run.health),
      this.syncPayrollNumeric(run.pension),
      this.syncPayrollNumeric(run.solidarity ?? 0),
      this.syncPayrollNumeric(run.deductions),
      this.syncPayrollNumeric(run.net),
      Boolean(run.paid),
      run.paidAt || null,
      run.approvedBy || null
    ];
  }

  private payrollRunExtM20(run: Record<string, unknown>): unknown[] {
    const d = run.primaServiciosDays;
    const primaDays =
      d === null || d === undefined
        ? null
        : (() => {
            const n = Math.floor(Number(d));
            return Number.isFinite(n) ? n : null;
          })();
    const sd = run.settlementDetail;
    const settlement = sd !== undefined && sd !== null && typeof sd === "object" ? sd : null;
    return [
      String((run.payrollKind as string) || "mensual").trim().slice(0, 24) || "mensual",
      Boolean(run.payPrimaServicios),
      this.syncPayrollNumeric(run.primaServiciosCop ?? 0),
      primaDays,
      settlement
    ];
  }

  private payrollRunExtIntereses(run: Record<string, unknown>): unknown[] {
    const b = run.cesantiasInterestBaseCop;
    const base =
      b === null || b === undefined
        ? null
        : (() => {
            const n = Number(b);
            return Number.isFinite(n) ? n : null;
          })();
    const d = run.cesantiasInterestDays;
    const days =
      d === null || d === undefined
        ? null
        : (() => {
            const n = Math.floor(Number(d));
            return Number.isFinite(n) ? n : null;
          })();
    return [
      Boolean(run.payInteresesCesantias),
      this.syncPayrollNumeric(run.interesesCesantiasCop ?? 0),
      base,
      days
    ];
  }

  private async resolvePayrollLiquSchemaTier(c: PoolClient): Promise<0 | 1 | 2> {
    if (this.payrollLiquSchemaTier !== undefined) return this.payrollLiquSchemaTier;
    try {
      const { rows } = await c.query<{ n20: string; n21: string }>(
        `SELECT
          COUNT(*) FILTER (WHERE column_name = 'tipo_registro')::text AS n20,
          COUNT(*) FILTER (WHERE column_name = 'incluye_intereses_cesantias')::text AS n21
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'liquidaciones_nomina'`
      );
      const n20 = Number(rows[0]?.n20 ?? 0);
      const n21 = Number(rows[0]?.n21 ?? 0);
      const t: 0 | 1 | 2 = n20 > 0 && n21 > 0 ? 2 : n20 > 0 ? 1 : 0;
      this.payrollLiquSchemaTier = t;
      if (t < 2) {
        this.logger.warn(
          `liquidaciones_nomina: esquema nivel ${t}. ` +
            (t === 0
              ? "Ejecute npm run db:init o alinee liquidaciones_nomina con BD/postgres/tablas/19_liquidaciones_nomina.sql (prima terminación e intereses/cesantías)."
              : "Falta columna en liquidaciones_nomina (ver tablas/19) o ejecute npm run db:init.") +
            " Hasta entonces algunos rubros solo quedarán persistidos en el navegador."
        );
      }
      return t;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`liquidaciones_nomina: no se pudo detectar columnas (${sanitizeLogText(msg)}); usando esquema base.`);
      this.payrollLiquSchemaTier = 0;
      return 0;
    }
  }

  private payrollRunNovedadesParams(run: Record<string, unknown>): unknown[] {
    const o =
      pickPortalField(run, "liquidacionOrigin", "origenLiquidacion", "origen_liquidacion") ??
      "manual";
    const origin = String(o).trim().slice(0, 32) || "manual";
    const raw = pickPortalField(run, "noveltiesDetail", "novedadesLiquidacion", "novedades_liquidacion_json");
    const json =
      raw !== undefined && raw !== null && typeof raw === "object" ? (raw as object) : null;
    return [origin, json];
  }

  private async resolvePayrollLiquNovedadesCols(c: PoolClient): Promise<boolean> {
    if (this.payrollLiquNovedadesCols !== undefined) return this.payrollLiquNovedadesCols;
    try {
      const { rows } = await c.query<{ n: string }>(
        `SELECT COUNT(*) FILTER (WHERE column_name = 'origen_liquidacion')::text AS n
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'liquidaciones_nomina'`
      );
      const ok = Number(rows[0]?.n ?? 0) > 0;
      this.payrollLiquNovedadesCols = ok;
      if (!ok) {
        this.logger.warn(
          "liquidaciones_nomina: ejecute npm run db:init o alinee con BD/postgres/tablas/19_liquidaciones_nomina.sql (origen_liquidacion y novedades JSON)."
        );
      }
      return ok;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`liquidaciones_nomina: no se pudieron detectar columnas de novedades (${sanitizeLogText(msg)}).`);
      this.payrollLiquNovedadesCols = false;
      return false;
    }
  }

  private async payrollUpsertLiquidacionNomina(
    c: PoolClient,
    tier: 0 | 1 | 2,
    hasNov: boolean,
    run: Record<string, unknown>,
    options?: { force?: boolean }
  ) {
    const runId = String(run.id ?? "").trim();
    if (!options?.force && hasNov && PG_UUID_V4_RE.test(runId)) {
      const incomingOrigin = String(
        pickPortalField(run, "liquidacionOrigin", "origenLiquidacion", "origen_liquidacion") ?? "manual"
      )
        .trim()
        .toLowerCase();
      if (incomingOrigin !== "automatica" && incomingOrigin !== "automatico") {
        const existing = await c.query<{ origen_liquidacion: string }>(
          `SELECT origen_liquidacion::text FROM liquidaciones_nomina WHERE id = $1::uuid`,
          [runId]
        );
        const existingOrigin = String(existing.rows[0]?.origen_liquidacion || "")
          .trim()
          .toLowerCase();
        if (existingOrigin === "automatica" || existingOrigin === "automatico") {
          return;
        }
      }
    }
    const base25 = this.payrollRunBaseParams(run);
    const createdByExtra = this.payrollRunCreatedByParam(run);
    const novExtra = hasNov ? this.payrollRunNovedadesParams(run) : [];
    if (tier === 0) {
      await c.query(hasNov ? LIQUIDACION_UPSERT.legacyNov : LIQUIDACION_UPSERT.legacy, [
        ...base25,
        ...novExtra,
        ...createdByExtra
      ]);
      return;
    }
    if (tier === 1) {
      await c.query(hasNov ? LIQUIDACION_UPSERT.m20Nov : LIQUIDACION_UPSERT.m20, [
        ...base25,
        ...this.payrollRunExtM20(run),
        ...novExtra,
        ...createdByExtra
      ]);
      return;
    }
    await c.query(hasNov ? LIQUIDACION_UPSERT.fullNov : LIQUIDACION_UPSERT.full, [
      ...base25,
      ...this.payrollRunExtM20(run),
      ...this.payrollRunExtIntereses(run),
      ...novExtra,
      ...createdByExtra
    ]);
  }

  private async syncPayrollRuns(c: PoolClient, data: unknown, deletedIds?: string[]) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const tier = await this.resolvePayrollLiquSchemaTier(c);
    const hasNov = await this.resolvePayrollLiquNovedadesCols(c);
    await this.syncListWithPruning(c, "liquidaciones_nomina", data, deletedIds);
    for (const raw of data) {
      const hit = raw as { id?: unknown; employeeId?: unknown };
      if (!hit?.id || !hit.employeeId) continue;
      if (this.skipUnlessPersistUuid("syncPayrollRuns", hit.id)) continue;
      if (this.skipUnlessPersistUuid("syncPayrollRuns.employeeId", hit.employeeId)) continue;
      const run = raw as Record<string, unknown>;
      await this.payrollUpsertLiquidacionNomina(c, tier, hasNov, run);
    }
  }

  private pgDateUtc(d: Date): string {
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const dom = d.getUTCDate();
    return `${y}-${String(m).padStart(2, "0")}-${String(dom).padStart(2, "0")}`;
  }

  /**
   * Inserta liquidaciones según periodicidad de pago y **fecha civil Colombia (Bogotá)**:
   * quincena 1–15 y 16–fin, mensual fin de mes (solo periodicidades mensual y quincenal).
   * Solo genera cuando `referenceDate` coincide con día de **cierre** del corte (`payroll-cut-bogota`),
   * salvo `force` (último corte cerrado en esa fecha).
   */
  async generateAutomaticLiquidacionesForReferenceDate(
    reference: Date = new Date(),
    options?: { force?: boolean; liquidacionOrigin?: "automatica" | "masiva"; actorUserId?: string }
  ): Promise<{ created: number; skipped: number; messages: string[] }> {
    const force = options?.force === true;
    const liquidacionOrigin =
      options?.liquidacionOrigin === "masiva" ? "masiva" : "automatica";
    let createdByLabel = "Sistema";
    if (liquidacionOrigin === "masiva" && options?.actorUserId) {
      const actor = await this.resolvePortalActor(options.actorUserId);
      createdByLabel = actor.name || actor.email || "Sistema";
    }
    const { y: by, m0: bm0, dom: bdom } = bogotaCalendarPartsFromInstant(reference);
    const cesBaseOptRaw = this.config.get<string>("PAYROLL_AUTOGEN_CESANTIAS_INTERES_BASE_COP");
    const cesBaseOpt =
      cesBaseOptRaw !== undefined &&
      cesBaseOptRaw !== null &&
      String(cesBaseOptRaw).trim() !== ""
        ? Math.max(0, Number(cesBaseOptRaw))
        : undefined;

    const messages: string[] = [];

    const client = await this.pool.connect();
    let created = 0;
    let skipped = 0;
    try {
      await client.query("BEGIN");
      const laborRules = await this.loadLaborSystemRules(reference, client);
      const smmlv = laborRules.smmlvCop;

      const tier = await this.resolvePayrollLiquSchemaTier(client);
      const hasNov = await this.resolvePayrollLiquNovedadesCols(client);

      const empRes = await client.query(`
        SELECT id, nombre_completo, salario_base, fecha_ingreso::text AS fecha_ingreso, COALESCE(auxilio_transporte, 0) AS auxilio_transporte,
               COALESCE(NULLIF(TRIM(periodicidad_pago), ''), 'Mensual') AS periodicidad_pago,
               rol_trabajador, tipo_contrato, nivel_riesgo_arl, tipo_cotizante
        FROM empleados_nomina
        ORDER BY fecha_creacion ASC
      `);

      for (const row of empRes.rows) {
        if (
          !employeeReceivesPayrollNomina({
            rol_trabajador: row.rol_trabajador,
            tipo_contrato: row.tipo_contrato
          })
        ) {
          skipped += 1;
          continue;
        }
        const employeeId = String(row.id);
        const hireDate = parseSqlDate(row.fecha_ingreso);
        if (!hireDate) {
          skipped += 1;
          messages.push(
            `${String(row.nombre_completo || "Colaborador").trim()}: sin fecha de ingreso válida en la ficha`
          );
          continue;
        }

        const freq = normalizePayrollFrequency(String(row.periodicidad_pago));
        if (!isPayrollAutogenFrequency(freq)) {
          skipped += 1;
          continue;
        }
        const existingRes = await client.query<{ periodo_mes: string }>(
          `SELECT periodo_mes FROM liquidaciones_nomina WHERE id_empleado = $1::uuid AND periodo_mes LIKE $2`,
          [employeeId, `${by}-${String(bm0 + 1).padStart(2, "0")}%`]
        );
        const existingPeriodKeys = (existingRes.rows ?? []).map((r) => String(r.periodo_mes || ""));
        const cut = force
          ? liquidationLatestPendingCutAsOf(freq, by, bm0, bdom, existingPeriodKeys)
          : liquidationCutIfClosingToday(freq, by, bm0, bdom);
        if (!cut) {
          skipped += 1;
          const freqLabel = canonicalPayFrequencyLabel(freq);
          const refLabel = `${by}-${String(bm0 + 1).padStart(2, "0")}-${String(bdom).padStart(2, "0")}`;
          if (force) {
            const pendingClosed = liquidationLatestPendingCutAsOf(freq, by, bm0, bdom, []);
            if (!pendingClosed) {
              messages.push(
                `${String(row.nombre_completo || "Colaborador").trim()}: en ${refLabel} no hay corte cerrado para nómina ${freqLabel}`
              );
            } else if (existingPeriodKeys.includes(pendingClosed.periodKey)) {
              messages.push(
                `${String(row.nombre_completo || "Colaborador").trim()}: ya tiene liquidación para ${pendingClosed.periodKey}`
              );
            } else {
              messages.push(
                `${String(row.nombre_completo || "Colaborador").trim()}: sin corte pendiente en ${refLabel} (${freqLabel})`
              );
            }
          } else {
            messages.push(
              `${String(row.nombre_completo || "Colaborador").trim()}: ${refLabel} no es día de cierre para nómina ${freqLabel}`
            );
          }
          continue;
        }

        const exists = existingPeriodKeys.includes(cut.periodKey);
        if (exists) {
          skipped += 1;
          messages.push(
            `${String(row.nombre_completo || "Colaborador").trim()}: ya tiene liquidación para ${cut.periodKey}`
          );
          continue;
        }

        const abRes = await client.query(
          `
          SELECT id, id_empleado, tipo_ausencia, subtipo_ausencia, fecha_inicio::text AS fecha_inicio, fecha_fin::text AS fecha_fin,
                 observaciones, dias_reconocidos, unidad_dias_reconocidos
          FROM ausencias_laborales
          WHERE id_empleado = $1::uuid AND fecha_fin >= $2::date AND fecha_inicio <= $3::date
        `,
          [employeeId, this.pgDateUtc(cut.periodStart), this.pgDateUtc(cut.periodEnd)]
        );

        const absList: AbsenceInput[] = [];
        for (const a of abRes.rows) {
          const fi = parseSqlDate(a.fecha_inicio);
          const ff = parseSqlDate(a.fecha_fin);
          if (!fi || !ff) continue;
          absList.push({
            id: String(a.id),
            tipoAusencia: String(a.tipo_ausencia || ""),
            subtipoAusencia: a.subtipo_ausencia != null ? String(a.subtipo_ausencia) : null,
            fechaInicio: fi,
            fechaFin: ff,
            observaciones: typeof a.observaciones === "string" ? a.observaciones : null,
            diasReconocidos: a.dias_reconocidos != null ? Number(a.dias_reconocidos) : null,
            unidadDiasReconocidos:
              a.unidad_dias_reconocidos != null ? String(a.unidad_dias_reconocidos) : null
          });
        }

        let computed;
        try {
          const primaAlreadyPaid = await this.payrollPrimaAlreadyPaidInMonth(
            client,
            employeeId,
            cut.calendarMonthYm,
            cut.periodKey
          );
          const cesantiasIntAlreadyPaid = await this.payrollCesantiasInterestAlreadyPaidInYear(
            client,
            employeeId,
            cut.calendarMonthYm,
            cut.periodKey
          );
          computed = computeColombiaPayrollForPeriodCut({
            periodStorageKey: cut.periodKey,
            calendarMonthYm: cut.calendarMonthYm,
            periodStart: cut.periodStart,
            periodEnd: cut.periodEnd,
            salarioMensual: Number(row.salario_base) || 0,
            auxilioTransporteMes: Number(row.auxilio_transporte) || 0,
            fechaIngresoEmpresa: hireDate,
            ausenciasEnPeriodo: absList,
            smmlv,
            healthEmployeeRate: laborRules.healthEmployeeRate,
            pensionEmployeeRate: laborRules.pensionEmployeeRate,
            cesantiasBaseInteresOpcional: cesBaseOpt,
            payFrequencyNorm: freq,
            primaAlreadyPaidInSemesterMonth: primaAlreadyPaid,
            cesantiasInterestAlreadyPaidInYear: cesantiasIntAlreadyPaid,
            arlRiskLevel: row.nivel_riesgo_arl != null ? String(row.nivel_riesgo_arl) : null,
            contributorType: row.tipo_cotizante != null ? String(row.tipo_cotizante) : null,
            uvtCop: laborRules.uvtCop ?? undefined
          });
        } catch (ex) {
          skipped += 1;
          const m = ex instanceof Error ? ex.message : String(ex);
          messages.push(`${String(row.nombre_completo || "Colaborador").trim()}: ${m}`);
          continue;
        }

        let payPrima = computed.payPrimaServicios;
        let primaCop = computed.primaServiciosCop;
        let primaDays = computed.primaDiasSemestre;
        let payInt = computed.payInteresesCesantias;
        let intCop = computed.interesesCesantiasCop;
        let intBase = cesBaseOpt ?? null;
        let intDays = computed.cesantiasInterestDays;

        if (tier < 1 && payPrima) {
          payPrima = false;
          primaCop = 0;
          primaDays = null;
          messages.push(
            `Empleado ${row.nombre_completo}: prima omitida (falta migración 20 — columnas tipo_registro / prima).`
          );
        }
        if (tier < 2 && payInt) {
          payInt = false;
          intCop = 0;
          intBase = null;
          intDays = null;
        }

        const gross =
          computed.salarioProporcionalCop +
          computed.auxilioProporcionalCop +
          (payPrima ? primaCop : 0) +
          (payInt ? intCop : 0);

        const noveltyObj = computed.novedadesJson as Record<string, unknown>;

        const run: Record<string, unknown> = {
          id: randomUUID(),
          employeeId,
          employeeName: String(row.nombre_completo || ""),
          month: cut.periodKey,
          gross,
          ibc: computed.ibcOrientativo,
          travelAllowance: 0,
          fuelReimbursement: 0,
          travelAllowanceAuto: 0,
          fuelReimbursementAuto: 0,
          travelAllowanceManual: 0,
          fuelReimbursementManual: 0,
          extras: 0,
          aux: computed.auxilioProporcionalCop,
          bonus: 0,
          tripCount: 0,
          interDepartmentTrips: 0,
          health: computed.healthDeduction,
          pension: computed.pensionDeduction,
          solidarity: computed.solidarityDeduction + computed.subsistenceDeduction,
          subsistence: computed.subsistenceDeduction,
          withholding: computed.withholdingDeduction,
          deductions: computed.totalDeducciones,
          net: gross - computed.totalDeducciones,
          paid: false,
          paidAt: null,
          approvedBy: null,
          payrollKind: freq,
          payPrimaServicios: payPrima,
          primaServiciosCop: payPrima ? primaCop : 0,
          primaServiciosDays: payPrima ? primaDays : null,
          settlementDetail: null,
          payInteresesCesantias: payInt,
          interesesCesantiasCop: payInt ? intCop : 0,
          cesantiasInterestBaseCop: payInt ? intBase : null,
          cesantiasInterestDays: payInt ? intDays : null,
          liquidacionOrigin,
          noveltiesDetail: noveltyObj,
          createdBy: createdByLabel
        };

        await this.payrollUpsertLiquidacionNomina(client, tier, hasNov, run);
        created += 1;
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    if (created > 0) {
      this.logger.log(
        `Liquidaciones ${liquidacionOrigin} (ref. Bogotá ${by}-${String(bm0 + 1).padStart(2, "0")}-${String(bdom).padStart(2, "0")}): insertadas ${created}; omitidas ${skipped}.`
      );
    }
    return { created, skipped, messages };
  }

  /**
   * Compatibilidad: simula cierre en el **último día calendario** del `YYYY-MM` (mensual útil sobre todo).
   */
  async generateAutomaticLiquidacionesForPeriod(
    periodoYm: string
  ): Promise<{ created: number; skipped: number; messages: string[] }> {
    const ymRe = /^(\d{4})-(0[1-9]|1[0-2])$/;
    const p = String(periodoYm || "").trim();
    if (!ymRe.test(p)) {
      throw new BadRequestException("periodoYm debe ser YYYY-MM");
    }
    const mb = monthUtcBounds(p);
    if (!mb) throw new BadRequestException("periodoYm inválido");
    const refDate = mb.monthEnd;
    return this.generateAutomaticLiquidacionesForReferenceDate(refDate, { force: true });
  }

  /**
   * Crea o actualiza liquidación de prestación de servicios (viajes) en `liquidaciones_nomina`.
   * Persiste tipo_registro = prestacion_viajes, origen_liquidacion = prestacion_viajes.
   */
  async upsertDriverTripPaymentDraft(
    employeeId: string,
    periodYm: string,
    options?: { travelAllowanceManualCop?: number; fuelReimbursementManualCop?: number },
    actorUserId?: string
  ) {
    const eid = String(employeeId || "").trim();
    const ym = String(periodYm || "").trim();
    if (!PG_UUID_V4_RE.test(eid)) throw new BadRequestException("employeeId debe ser UUID válido");
    if (!/^(\d{4})-(0[1-9]|1[0-2])$/.test(ym)) {
      throw new BadRequestException("periodYm debe ser YYYY-MM");
    }
    const mb = monthUtcBounds(ym);
    if (!mb) throw new BadRequestException("periodYm inválido");

    const client = await this.pool.connect();
    let createdByLabel: string | null = null;
    if (actorUserId) {
      const actor = await this.resolvePortalActor(actorUserId);
      createdByLabel = actor.name || actor.email || null;
    }
    const txOptions = {
      ...(options || {}),
      ...(createdByLabel ? { createdBy: createdByLabel } : {})
    };
    try {
      await client.query("BEGIN");
      const result = await this.upsertDriverTripPaymentDraftTx(client, eid, ym, mb, txOptions);
      await client.query("COMMIT");
      const payrollRuns = await this.loadPayrollRunsForEmployee(eid);
      return { ...result, payrollRuns };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  private async upsertDriverTripPaymentDraftTx(
    c: PoolClient,
    employeeId: string,
    periodYm: string,
    monthBounds: { monthStart: Date; monthEnd: Date },
    options?: { travelAllowanceManualCop?: number; fuelReimbursementManualCop?: number; createdBy?: string }
  ) {
    const empRes = await c.query<{
      id: string;
      nombre_completo: string;
      numero_documento: string;
      rol_trabajador: string;
      tipo_contrato: string;
      fecha_ingreso: string;
    }>(
      `SELECT id::text, nombre_completo, numero_documento, rol_trabajador, tipo_contrato,
              fecha_ingreso::text AS fecha_ingreso
       FROM empleados_nomina WHERE id = $1::uuid LIMIT 1`,
      [employeeId]
    );
    const emp = empRes.rows[0];
    if (!emp) throw new NotFoundException("Empleado no encontrado");
    const hireDate = parseSqlDate(emp.fecha_ingreso);
    if (!hireDate) {
      throw new BadRequestException(
        `${String(emp.nombre_completo || "Empleado").trim()}: sin fecha de ingreso válida`
      );
    }
    if (monthBounds.monthEnd < hireDate) {
      throw new BadRequestException(
        `${String(emp.nombre_completo || "Empleado").trim()}: no se puede liquidar ${periodYm} porque es anterior a la fecha de ingreso (${hireDate.toISOString().slice(0, 10)})`
      );
    }
    if (
      !employeeIsConductorServiceProvider({
        rol_trabajador: emp.rol_trabajador,
        tipo_contrato: emp.tipo_contrato
      })
    ) {
      throw new BadRequestException(
        "Este colaborador no está configurado como conductor en prestación de servicios."
      );
    }

    const drv = await c.query<{ id: string }>(
      `SELECT c.id::text AS id FROM conductores c
       WHERE trim(c.numero_documento) = trim($1) LIMIT 1`,
      [emp.numero_documento]
    );
    const driverId = drv.rows[0]?.id;
    if (!driverId) {
      throw new BadRequestException(
        "No hay conductor en flota con el mismo documento que el empleado. Sincronice la ficha desde RRHH."
      );
    }

    const periodStart = this.pgDateUtc(monthBounds.monthStart);
    const periodEnd = this.pgDateUtc(monthBounds.monthEnd);

    const tripRes = await c.query<{ trip_count: string; inter_dep: string }>(
      `WITH refs AS (
         SELECT
           COALESCE(s.fecha_cierre, s.fecha_entrega_efectiva, v.fecha_hora_entrega_programada) AS ref_ts,
           trim(COALESCE(s.departamento_origen, '')) AS dep_o,
           trim(COALESCE(s.departamento_destino, '')) AS dep_d
         FROM viajes_transporte v
         INNER JOIN solicitudes_transporte s ON s.id = v.id_solicitud
         WHERE v.id_conductor = $1::uuid
           AND s.estado IN ('Completada'::estado_solicitud_transporte, 'Cerrada'::estado_solicitud_transporte)
       )
       SELECT
         COUNT(*)::text AS trip_count,
         COUNT(*) FILTER (
           WHERE dep_o <> '' AND dep_d <> '' AND lower(dep_o) IS DISTINCT FROM lower(dep_d)
         )::text AS inter_dep
       FROM refs
       WHERE (ref_ts AT TIME ZONE 'America/Bogota')::date >= $2::date
         AND (ref_ts AT TIME ZONE 'America/Bogota')::date <= $3::date`,
      [driverId, periodStart, periodEnd]
    );

    const fuelRes = await c.query<{ total: string }>(
      `SELECT COALESCE(SUM(costo_total), 0)::text AS total
       FROM registros_combustible
       WHERE id_conductor = $1::uuid
         AND pagado_por = 'conductor'
         AND fecha >= $2::date AND fecha <= $3::date`,
      [driverId, periodStart, periodEnd]
    );

    const rules = await this.loadTravelAllowanceRules();
    const tripCount = Math.max(0, Math.floor(Number(tripRes.rows[0]?.trip_count ?? 0)));
    const interDepartmentTrips = Math.max(0, Math.floor(Number(tripRes.rows[0]?.inter_dep ?? 0)));
    const viaticUnitCop = Math.max(0, Number(rules.interDepartmentTripAmount) || 0);
    const fuelAuto = Math.max(0, Number(fuelRes.rows[0]?.total ?? 0));

    const existing = await c.query<{
      id: string;
      liquidacion_pagada: boolean;
      viaticos_manuales: string;
      reembolso_combustible_manual: string;
    }>(
      `SELECT id::text, liquidacion_pagada, viaticos_manuales, reembolso_combustible_manual
       FROM liquidaciones_nomina
       WHERE id_empleado = $1::uuid AND periodo_mes = $2 AND tipo_registro = 'prestacion_viajes'
       LIMIT 1`,
      [employeeId, periodYm]
    );
    const ex = existing.rows[0];
    if (ex?.liquidacion_pagada) {
      throw new BadRequestException(`El pago por viajes de ${periodYm} ya está marcado como pagado.`);
    }

    const travelManual =
      options?.travelAllowanceManualCop != null
        ? Math.max(0, Number(options.travelAllowanceManualCop))
        : Math.max(0, Number(ex?.viaticos_manuales ?? 0));
    const fuelManual =
      options?.fuelReimbursementManualCop != null
        ? Math.max(0, Number(options.fuelReimbursementManualCop))
        : Math.max(0, Number(ex?.reembolso_combustible_manual ?? 0));

    const computed = buildDriverTripPaymentCompute(
      periodYm,
      tripCount,
      interDepartmentTrips,
      viaticUnitCop,
      fuelAuto,
      { travelAllowanceManualCop: travelManual, fuelReimbursementManualCop: fuelManual }
    );

    if (computed.grossCop <= 0) {
      throw new BadRequestException(
        "No hay viajes liquidables ni reembolsos de combustible en el mes seleccionado."
      );
    }

    const tier = await this.resolvePayrollLiquSchemaTier(c);
    const hasNov = await this.resolvePayrollLiquNovedadesCols(c);
    const travelAllowance = computed.travelAllowanceAutoCop + travelManual;
    const fuelReimbursement = computed.fuelReimbursementAutoCop + fuelManual;

    const run: Record<string, unknown> = {
      id: ex?.id && PG_UUID_V4_RE.test(ex.id) ? ex.id : randomUUID(),
      employeeId,
      employeeName: String(emp.nombre_completo || ""),
      month: periodYm,
      gross: computed.grossCop,
      ibc: 0,
      travelAllowance,
      fuelReimbursement,
      travelAllowanceAuto: computed.travelAllowanceAutoCop,
      fuelReimbursementAuto: computed.fuelReimbursementAutoCop,
      travelAllowanceManual: travelManual,
      fuelReimbursementManual: fuelManual,
      extras: 0,
      aux: 0,
      bonus: 0,
      tripCount: computed.tripCount,
      interDepartmentTrips: computed.interDepartmentTrips,
      health: 0,
      pension: 0,
      solidarity: 0,
      deductions: 0,
      net: computed.grossCop,
      paid: false,
      paidAt: null,
      approvedBy: null,
      payrollKind: "prestacion_viajes",
      payPrimaServicios: false,
      primaServiciosCop: 0,
      primaServiciosDays: null,
      payInteresesCesantias: false,
      interesesCesantiasCop: 0,
      cesantiasInterestBaseCop: null,
      cesantiasInterestDays: null,
      settlementDetail: null,
      liquidacionOrigin: "prestacion_viajes",
      noveltiesDetail: computed.noveltiesDetail,
      ...(options?.createdBy ? { createdBy: options.createdBy } : {})
    };

    const isUpdate = Boolean(ex?.id);
    await this.payrollUpsertLiquidacionNomina(c, tier, hasNov, run, { force: true });

    return {
      created: isUpdate ? 0 : 1,
      updated: isUpdate ? 1 : 0,
      periodYm,
      grossCop: computed.grossCop,
      tripCount: computed.tripCount,
      interDepartmentTrips: computed.interDepartmentTrips,
      runId: String(run.id)
    };
  }

  /**
   * Vincula novedades de RRHH (ausencias, cambios de salario) con borradores de nómina laboral.
   */
  async refreshPayrollDraftsForEmployee(
    employeeId: string,
    options?: { startDate?: string; endDate?: string }
  ): Promise<{
    created: number;
    updated: number;
    skipped: number;
    messages: string[];
    payrollRuns: Awaited<ReturnType<PortalService["loadPayrollRunsForEmployee"]>>;
  }> {
    const eid = String(employeeId || "").trim();
    if (!PG_UUID_V4_RE.test(eid)) {
      throw new BadRequestException("employeeId debe ser UUID válido");
    }
    const startYmd = options?.startDate?.trim().slice(0, 10) ?? "";
    const endYmd = options?.endDate?.trim().slice(0, 10) ?? "";
    if (startYmd && !/^\d{4}-\d{2}-\d{2}$/.test(startYmd)) {
      throw new BadRequestException("startDate debe ser YYYY-MM-DD");
    }
    if (endYmd && !/^\d{4}-\d{2}-\d{2}$/.test(endYmd)) {
      throw new BadRequestException("endDate debe ser YYYY-MM-DD");
    }
    if (startYmd && endYmd && startYmd > endYmd) {
      throw new BadRequestException("startDate no puede ser mayor a endDate");
    }
    if (startYmd || endYmd) {
      const empRangeRes = await this.pool.query<{
        nombre_completo: string;
        fecha_ingreso: string;
      }>(
        `SELECT nombre_completo, fecha_ingreso::text AS fecha_ingreso
         FROM empleados_nomina WHERE id = $1::uuid LIMIT 1`,
        [eid]
      );
      const emp = empRangeRes.rows[0];
      if (!emp) throw new NotFoundException("Empleado no encontrado");
      const hireDate = parseSqlDate(emp.fecha_ingreso);
      if (!hireDate) {
        throw new BadRequestException(
          `${String(emp.nombre_completo || "Empleado").trim()}: sin fecha de ingreso válida`
        );
      }
      const hireYmd = hireDate.toISOString().slice(0, 10);
      const rangeStart = startYmd || endYmd;
      if (rangeStart && rangeStart < hireYmd) {
        throw new BadRequestException(
          `${String(emp.nombre_completo || "Empleado").trim()}: no se puede liquidar antes de la fecha de ingreso (${hireYmd})`
        );
      }
    }

    const client = await this.pool.connect();
    const stats = { created: 0, updated: 0, skipped: 0, messages: [] as string[] };
    try {
      await client.query("BEGIN");
      await this.refreshPayrollDraftsForEmployeeTx(client, eid, stats, {
        startDate: startYmd || undefined,
        endDate: endYmd || undefined
      });
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    const payrollRuns = await this.loadPayrollRunsForEmployee(eid);
    return { ...stats, payrollRuns };
  }

  private async loadPayrollRunsForEmployee(employeeId: string) {
    const r = await this.pool.query(
      `SELECT * FROM liquidaciones_nomina WHERE id_empleado = $1::uuid ORDER BY fecha_creacion DESC`,
      [employeeId]
    );
    return r.rows.map((row) => this.mapLiquidacionNominaRowToPortalPayrollRun(row as Record<string, unknown>, true));
  }

  private mergeAbsenceRefreshTargets(
    acc: Map<string, { startDate: string; endDate: string }>,
    employeeId: string,
    startDate: string,
    endDate: string
  ) {
    const eid = String(employeeId || "").trim();
    const s = String(startDate || "").slice(0, 10);
    const e = String(endDate || "").slice(0, 10);
    if (!PG_UUID_V4_RE.test(eid) || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return;
    const end = /^\d{4}-\d{2}-\d{2}$/.test(e) ? e : s;
    const prev = acc.get(eid);
    if (!prev) {
      acc.set(eid, { startDate: s, endDate: end });
      return;
    }
    if (s < prev.startDate) prev.startDate = s;
    if (end > prev.endDate) prev.endDate = end;
  }

  private collectAbsenceRefreshTargets(data: unknown): Map<string, { startDate: string; endDate: string }> {
    const map = new Map<string, { startDate: string; endDate: string }>();
    if (!Array.isArray(data)) return map;
    for (const raw of data) {
      const row = raw as Record<string, unknown>;
      const eid = String(pickPortalField(row, "employeeId") ?? row.employeeId ?? "").trim();
      const s = String(pickPortalField(row, "startDate") ?? row.startDate ?? "").slice(0, 10);
      const e = String(pickPortalField(row, "endDate") ?? row.endDate ?? "").slice(0, 10);
      this.mergeAbsenceRefreshTargets(map, eid, s, e);
    }
    return map;
  }

  private async refreshPayrollDraftsAfterHrAbsencesSync(c: PoolClient, data: unknown) {
    const targets = this.collectAbsenceRefreshTargets(data);
    const stats = { created: 0, updated: 0, skipped: 0, messages: [] as string[] };
    for (const [employeeId, range] of targets) {
      await this.refreshPayrollDraftsForEmployeeTx(c, employeeId, stats, range);
    }
    if (stats.created + stats.updated > 0) {
      this.logger.log(
        `Nómina vinculada tras ausencias: +${stats.created} borradores, ${stats.updated} actualizados.`
      );
    }
  }

  private async refreshPayrollDraftsAfterEmployeesSync(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) return;
    const stats = { created: 0, updated: 0, skipped: 0, messages: [] as string[] };
    for (const raw of data) {
      const row = raw as Record<string, unknown>;
      const eid = String(row?.id ?? "").trim();
      if (!PG_UUID_V4_RE.test(eid)) continue;
      await this.refreshPayrollDraftsForEmployeeTx(c, eid, stats);
    }
    if (stats.created + stats.updated > 0) {
      this.logger.log(
        `Nómina vinculada tras empleados: +${stats.created} borradores, ${stats.updated} actualizados.`
      );
    }
  }

  private async refreshPayrollDraftsForEmployeeTx(
    c: PoolClient,
    employeeId: string,
    stats: { created: number; updated: number; skipped: number; messages: string[] },
    range?: { startDate?: string; endDate?: string }
  ) {
    const empRes = await c.query<{
      id: string;
      nombre_completo: string;
      salario_base: string;
      fecha_ingreso: string;
      auxilio_transporte: string;
      periodicidad_pago: string;
      rol_trabajador: string;
      tipo_contrato: string;
      nivel_riesgo_arl: string | null;
      tipo_cotizante: string | null;
    }>(
      `SELECT id::text, nombre_completo, salario_base, fecha_ingreso::text AS fecha_ingreso,
              COALESCE(auxilio_transporte, 0) AS auxilio_transporte,
              COALESCE(NULLIF(TRIM(periodicidad_pago), ''), 'Mensual') AS periodicidad_pago,
              rol_trabajador, tipo_contrato, nivel_riesgo_arl, tipo_cotizante
       FROM empleados_nomina WHERE id = $1::uuid LIMIT 1`,
      [employeeId]
    );
    const row = empRes.rows[0];
    if (!row) {
      stats.skipped += 1;
      stats.messages.push(`Empleado ${employeeId}: no encontrado`);
      return;
    }

    if (
      !employeeReceivesPayrollNomina({
        rol_trabajador: row.rol_trabajador,
        tipo_contrato: row.tipo_contrato
      })
    ) {
      stats.skipped += 1;
      stats.messages.push(
        `${String(row.nombre_completo || "Conductor").trim()}: prestación de servicios — pago por viajes, sin nómina laboral automática`
      );
      return;
    }

    const hireDate = parseSqlDate(row.fecha_ingreso);
    if (!hireDate) {
      stats.skipped += 1;
      stats.messages.push(`${row.nombre_completo}: sin fecha de ingreso válida`);
      return;
    }

    const freq = normalizePayrollFrequency(String(row.periodicidad_pago));
    if (!isPayrollAutogenFrequency(freq)) {
      stats.skipped += 1;
      stats.messages.push(
        `${String(row.nombre_completo || "Colaborador").trim()}: periodicidad ${canonicalPayFrequencyLabel(freq)} sin liquidación automática (solo Mensual o Quincenal)`
      );
      return;
    }
    const name = String(row.nombre_completo || "Colaborador").trim();

    let cuts: LiquidationCut[] = [];
    if (range?.startDate) {
      const rs = parseSqlDate(range.startDate);
      const re = parseSqlDate(range.endDate || range.startDate);
      if (!rs || !re) {
        stats.skipped += 1;
        stats.messages.push(`${name}: rango de fechas inválido`);
        return;
      }
      cuts = liquidationCutsOverlappingRange(freq, rs, re);
    } else {
      const unpaid = await c.query<{ periodo_mes: string }>(
        `SELECT periodo_mes FROM liquidaciones_nomina
         WHERE id_empleado = $1::uuid AND liquidacion_pagada = false
           AND COALESCE(tipo_registro, 'mensual') <> 'terminacion'
           AND liquidacion_terminacion_json IS NULL`,
        [employeeId]
      );
      const seen = new Set<string>();
      for (const u of unpaid.rows) {
        const cut = resolveLiquidationCutFromPeriodKey(freq, String(u.periodo_mes || ""));
        if (cut && !seen.has(cut.periodKey)) {
          seen.add(cut.periodKey);
          cuts.push(cut);
        }
      }
      if (cuts.length === 0) {
        const { y, m0, dom } = bogotaCalendarPartsFromInstant(new Date());
        const latest = liquidationLatestClosedCutAsOf(freq, y, m0, dom);
        if (latest) cuts = [latest];
      }
    }

    if (cuts.length === 0) {
      stats.skipped += 1;
      stats.messages.push(`${name}: sin corte de nómina aplicable en el rango`);
      return;
    }

    const tier = await this.resolvePayrollLiquSchemaTier(c);
    const hasNov = await this.resolvePayrollLiquNovedadesCols(c);
    const laborRules = await this.loadLaborSystemRules(new Date(), c);
    const smmlv = laborRules.smmlvCop;
    const cesBaseOptRaw = this.config.get<string>("PAYROLL_AUTOGEN_CESANTIAS_INTERES_BASE_COP");
    const cesBaseOpt =
      cesBaseOptRaw !== undefined &&
      cesBaseOptRaw !== null &&
      String(cesBaseOptRaw).trim() !== ""
        ? Math.max(0, Number(cesBaseOptRaw))
        : undefined;

    for (const cut of cuts) {
      const existing = await c.query<{
        id: string;
        liquidacion_pagada: boolean;
        tipo_registro: string | null;
        viaticos_periodo: string;
        reembolso_combustible: string;
        viaticos_automaticos: string;
        reembolso_combustible_automatico: string;
        viaticos_manuales: string;
        reembolso_combustible_manual: string;
        horas_extras_cop: string;
        bonificaciones_cop: string;
        origen_liquidacion: string | null;
      }>(
        `SELECT id::text, liquidacion_pagada,
                COALESCE(tipo_registro, 'mensual') AS tipo_registro,
                viaticos_periodo, reembolso_combustible,
                viaticos_automaticos, reembolso_combustible_automatico,
                viaticos_manuales, reembolso_combustible_manual,
                horas_extras_cop, bonificaciones_cop, origen_liquidacion
         FROM liquidaciones_nomina
         WHERE id_empleado = $1::uuid AND periodo_mes = $2
         LIMIT 1`,
        [employeeId, cut.periodKey]
      );
      const ex = existing.rows[0];
      if (ex?.liquidacion_pagada) {
        stats.skipped += 1;
        stats.messages.push(`${name}: ${cut.periodKey} ya está pagado`);
        continue;
      }
      if (String(ex?.tipo_registro || "").toLowerCase() === "terminacion") {
        stats.skipped += 1;
        stats.messages.push(`${name}: ${cut.periodKey} es liquidación de terminación`);
        continue;
      }

      const abRes = await c.query(
        `SELECT id, id_empleado, tipo_ausencia, subtipo_ausencia, fecha_inicio::text AS fecha_inicio,
                fecha_fin::text AS fecha_fin, observaciones, dias_reconocidos, unidad_dias_reconocidos
         FROM ausencias_laborales
         WHERE id_empleado = $1::uuid AND fecha_fin >= $2::date AND fecha_inicio <= $3::date`,
        [employeeId, this.pgDateUtc(cut.periodStart), this.pgDateUtc(cut.periodEnd)]
      );
      const absList: AbsenceInput[] = [];
      for (const a of abRes.rows) {
        const fi = parseSqlDate(a.fecha_inicio);
        const ff = parseSqlDate(a.fecha_fin);
        if (!fi || !ff) continue;
        absList.push({
          id: String(a.id),
          tipoAusencia: String(a.tipo_ausencia || ""),
          subtipoAusencia: a.subtipo_ausencia != null ? String(a.subtipo_ausencia) : null,
          fechaInicio: fi,
          fechaFin: ff,
          observaciones: typeof a.observaciones === "string" ? a.observaciones : null,
          diasReconocidos: a.dias_reconocidos != null ? Number(a.dias_reconocidos) : null,
          unidadDiasReconocidos:
            a.unidad_dias_reconocidos != null ? String(a.unidad_dias_reconocidos) : null
        });
      }

      let computed;
      try {
        const primaAlreadyPaid = await this.payrollPrimaAlreadyPaidInMonth(
          c,
          employeeId,
          cut.calendarMonthYm,
          cut.periodKey
        );
        const cesantiasIntAlreadyPaid = await this.payrollCesantiasInterestAlreadyPaidInYear(
          c,
          employeeId,
          cut.calendarMonthYm,
          cut.periodKey
        );
        computed = computeColombiaPayrollForPeriodCut({
          periodStorageKey: cut.periodKey,
          calendarMonthYm: cut.calendarMonthYm,
          periodStart: cut.periodStart,
          periodEnd: cut.periodEnd,
          salarioMensual: Number(row.salario_base) || 0,
          auxilioTransporteMes: Number(row.auxilio_transporte) || 0,
          fechaIngresoEmpresa: hireDate,
          ausenciasEnPeriodo: absList,
          smmlv,
          healthEmployeeRate: laborRules.healthEmployeeRate,
          pensionEmployeeRate: laborRules.pensionEmployeeRate,
          cesantiasBaseInteresOpcional: cesBaseOpt,
          payFrequencyNorm: freq,
          primaAlreadyPaidInSemesterMonth: primaAlreadyPaid,
          cesantiasInterestAlreadyPaidInYear: cesantiasIntAlreadyPaid,
          arlRiskLevel: row.nivel_riesgo_arl != null ? String(row.nivel_riesgo_arl) : null,
          contributorType: row.tipo_cotizante != null ? String(row.tipo_cotizante) : null,
          uvtCop: laborRules.uvtCop ?? undefined
        });
      } catch (err) {
        stats.skipped += 1;
        const m = err instanceof Error ? err.message : String(err);
        stats.messages.push(`${name} (${cut.periodKey}): ${m}`);
        continue;
      }

      let payPrima = computed.payPrimaServicios;
      let primaCop = computed.primaServiciosCop;
      let primaDays = computed.primaDiasSemestre;
      let payInt = computed.payInteresesCesantias;
      let intCop = computed.interesesCesantiasCop;
      let intBase = cesBaseOpt ?? null;
      let intDays = computed.cesantiasInterestDays;

      if (tier < 1 && payPrima) {
        payPrima = false;
        primaCop = 0;
        primaDays = null;
      }
      if (tier < 2 && payInt) {
        payInt = false;
        intCop = 0;
        intBase = null;
        intDays = null;
      }

      const preservedExtras = ex ? Number(ex.horas_extras_cop) || 0 : 0;
      const preservedBonus = ex ? Number(ex.bonificaciones_cop) || 0 : 0;
      const preservedTravelManual = ex ? Number(ex.viaticos_manuales) || 0 : 0;
      const preservedFuelManual = ex ? Number(ex.reembolso_combustible_manual) || 0 : 0;
      const preservedTravelAuto = ex ? Number(ex.viaticos_automaticos) || 0 : 0;
      const preservedFuelAuto = ex ? Number(ex.reembolso_combustible_automatico) || 0 : 0;
      const travelAllowance = preservedTravelAuto + preservedTravelManual;
      const fuelReimbursement = preservedFuelAuto + preservedFuelManual;

      const gross =
        computed.salarioProporcionalCop +
        computed.auxilioProporcionalCop +
        preservedExtras +
        preservedBonus +
        travelAllowance +
        fuelReimbursement +
        (payPrima ? primaCop : 0) +
        (payInt ? intCop : 0);

      const net = gross - computed.totalDeducciones;
      const noveltyObj = {
        ...(computed.novedadesJson as Record<string, unknown>),
        vinculacionNovedades: {
          origen: "refresh_drafts",
          actualizadoEn: new Date().toISOString(),
          ausenciasEnPeriodo: absList.length
        }
      };

      const priorOrigin = String(ex?.origen_liquidacion || "").trim().toLowerCase();
      const liquidacionOrigin =
        priorOrigin && priorOrigin !== "manual" ? priorOrigin : ex ? "manual" : "vinculada";

      const run: Record<string, unknown> = {
        id: ex?.id && PG_UUID_V4_RE.test(ex.id) ? ex.id : randomUUID(),
        employeeId,
        employeeName: name,
        month: cut.periodKey,
        gross,
        ibc: computed.ibcOrientativo,
        travelAllowance,
        fuelReimbursement,
        travelAllowanceAuto: preservedTravelAuto,
        fuelReimbursementAuto: preservedFuelAuto,
        travelAllowanceManual: preservedTravelManual,
        fuelReimbursementManual: preservedFuelManual,
        extras: preservedExtras,
        aux: computed.auxilioProporcionalCop,
        bonus: preservedBonus,
        tripCount: 0,
        interDepartmentTrips: 0,
        health: computed.healthDeduction,
        pension: computed.pensionDeduction,
        solidarity: computed.solidarityDeduction + computed.subsistenceDeduction,
        subsistence: computed.subsistenceDeduction,
        withholding: computed.withholdingDeduction,
        deductions: computed.totalDeducciones,
        net,
        paid: false,
        paidAt: null,
        approvedBy: null,
        payrollKind: freq,
        payPrimaServicios: payPrima,
        primaServiciosCop: payPrima ? primaCop : 0,
        primaServiciosDays: payPrima ? primaDays : null,
        settlementDetail: null,
        payInteresesCesantias: payInt,
        interesesCesantiasCop: payInt ? intCop : 0,
        cesantiasInterestBaseCop: payInt ? intBase : null,
        cesantiasInterestDays: payInt ? intDays : null,
        liquidacionOrigin,
        noveltiesDetail: noveltyObj
      };

      const isUpdate = Boolean(ex?.id);
      await this.payrollUpsertLiquidacionNomina(c, tier, hasNov, run, { force: true });
      if (isUpdate) stats.updated += 1;
      else stats.created += 1;
    }
  }

  /**
   * Alta directa en PostgreSQL (Historial → Combustible). No reemplaza toda la tabla.
   */
  async createFleetFuelLog(userId: string, role: JwtRole, body: CreateFleetFuelLogDto) {
    const permissionSet = this.isAdmin(role)
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.loadPortalPermissionSet(userId);
    if (!this.isAdmin(role) && !this.hasPortalPermission(permissionSet, "transport_history")) {
      throw new ForbiddenException();
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const saved = await this.upsertFleetFuelLogRow(
        client,
        body as unknown as Record<string, unknown>,
        userId
      );
      await insertPortalAuditEventTx(client, await this.portalAuditActor(userId), {
        action: "create",
        moduleId: "vehicles",
        moduleLabel: "Camiones",
        entityId: String((saved as { id?: string })?.id || ""),
        entityLabel: String((saved as { vehiclePlate?: string })?.vehiclePlate || "Registro combustible"),
        summary: "Alta de registro de combustible"
      });
      await client.query("COMMIT");
      return saved;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Alta directa en PostgreSQL (Historial → Taller). No reemplaza toda la tabla.
   */
  async createFleetMaintenanceLog(userId: string, role: JwtRole, body: CreateFleetMaintenanceLogDto) {
    const permissionSet = this.isAdmin(role)
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.loadPortalPermissionSet(userId);
    if (!this.isAdmin(role) && !this.hasPortalPermission(permissionSet, "transport_history")) {
      throw new ForbiddenException();
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const saved = await this.upsertFleetMaintenanceLogRow(
        client,
        body as unknown as Record<string, unknown>,
        userId
      );
      await insertPortalAuditEventTx(client, await this.portalAuditActor(userId), {
        action: "create",
        moduleId: "vehicles",
        moduleLabel: "Camiones",
        entityId: String((saved as { id?: string })?.id || ""),
        entityLabel: String((saved as { vehiclePlate?: string })?.vehiclePlate || "Registro mantenimiento"),
        summary: "Alta de registro de mantenimiento"
      });
      await client.query("COMMIT");
      return saved;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  private mapFuelLogDbRow(row: Record<string, unknown>) {
    const plate = String(row.placa_vehiculo ?? "").trim().toUpperCase();
    return {
      id: row.id,
      date: row.fecha,
      vehicleId: row.id_vehiculo,
      plate,
      vehiclePlate: plate,
      driverId: row.id_conductor,
      driverName: row.nombre_conductor,
      tripNumber: row.numero_viaje,
      liters: Number(row.litros),
      totalCost: Number(row.costo_total),
      costPerLiter: row.costo_por_litro != null ? Number(row.costo_por_litro) : null,
      odometerKm: row.kilometraje_odometro != null ? Number(row.kilometraje_odometro) : null,
      station: row.estacion,
      paidBy: row.pagado_por,
      createdAt: row.fecha_registro ? new Date(String(row.fecha_registro)).toISOString() : new Date().toISOString()
    };
  }

  private mapMaintenanceLogDbRow(row: Record<string, unknown>) {
    const plate = String(row.placa_vehiculo ?? "").trim().toUpperCase();
    const interventionType = String(row.tipo_intervencion ?? "preventivo");
    const followUpStatus = String(row.estado_seguimiento ?? "Pendiente");
    return {
      id: row.id,
      date: row.fecha,
      vehicleId: row.id_vehiculo,
      plate,
      vehiclePlate: plate,
      interventionType,
      type: interventionType,
      description: row.descripcion,
      cost: Number(row.costo),
      downtimeHours: Number(row.horas_inactividad),
      followUpStatus,
      status: followUpStatus,
      createdAt: row.fecha_registro ? new Date(String(row.fecha_registro)).toISOString() : new Date().toISOString()
    };
  }

  private async upsertFleetFuelLogRow(
    c: PoolClient,
    raw: Record<string, unknown>,
    registeredByUserId?: string
  ) {
    if (!raw?.id) throw new BadRequestException("id requerido");
    if (this.skipUnlessPersistUuid("upsertFleetFuelLogRow", raw.id)) {
      throw new BadRequestException("id UUID inválido");
    }
    if (this.skipUnlessPersistUuid("upsertFleetFuelLogRow.vehicleId", raw.vehicleId)) {
      throw new BadRequestException("vehicleId UUID inválido");
    }
    if (this.skipUnlessPersistUuid("upsertFleetFuelLogRow.driverId", raw.driverId)) {
      throw new BadRequestException("driverId UUID inválido");
    }
    const plate = await this.resolveVehiclePlateForSync(
      c,
      raw.vehicleId,
      pickPortalField(raw, "plate", "vehiclePlate", "placa_vehiculo")
    );
    const liters = Number(raw.liters ?? raw.litros ?? 0);
    const totalCost = Number(raw.totalCost ?? raw.costo_total ?? 0);
    if (!(liters > 0)) throw new BadRequestException("litros debe ser mayor que 0");
    if (totalCost < 0) throw new BadRequestException("costo_total inválido");
    const costPerLiterRaw = raw.costPerLiter ?? raw.costo_por_litro;
    const costPerLiter =
      costPerLiterRaw != null
        ? Number(costPerLiterRaw)
        : liters > 0
          ? Math.round(totalCost / liters)
          : null;
    const paidRaw = String(pickPortalField(raw, "paidBy", "pagado_por") ?? "empresa").toLowerCase();
    const paidBy = paidRaw === "conductor" ? "conductor" : "empresa";
    const regUser =
      registeredByUserId && PG_UUID_V4_RE.test(String(registeredByUserId).trim())
        ? String(registeredByUserId).trim()
        : null;
    await c.query(
      `INSERT INTO registros_combustible (
          id, fecha, id_vehiculo, placa_vehiculo, id_conductor, nombre_conductor, numero_viaje, litros, costo_total,
          costo_por_litro, kilometraje_odometro, estacion, pagado_por, id_usuario_registro
        ) VALUES ($1::uuid, $2::date, $3::uuid, $4, $5::uuid, $6, $7, $8, $9, $10, $11, $12, $13, $14::uuid)
        ON CONFLICT (id) DO UPDATE SET
          fecha = EXCLUDED.fecha,
          id_vehiculo = EXCLUDED.id_vehiculo,
          placa_vehiculo = EXCLUDED.placa_vehiculo,
          id_conductor = EXCLUDED.id_conductor,
          nombre_conductor = EXCLUDED.nombre_conductor,
          numero_viaje = EXCLUDED.numero_viaje,
          litros = EXCLUDED.litros,
          costo_total = EXCLUDED.costo_total,
          costo_por_litro = EXCLUDED.costo_por_litro,
          kilometraje_odometro = EXCLUDED.kilometraje_odometro,
          estacion = EXCLUDED.estacion,
          pagado_por = EXCLUDED.pagado_por,
          id_usuario_registro = COALESCE(EXCLUDED.id_usuario_registro, registros_combustible.id_usuario_registro)`,
      [
        raw.id,
        raw.date ?? raw.fecha,
        raw.vehicleId,
        plate,
        raw.driverId,
        nu(pickPortalField(raw, "driverName", "nombre_conductor") || "—") || "—",
        pickPortalField(raw, "tripNumber", "numero_viaje") || null,
        liters,
        totalCost,
        costPerLiter,
        raw.odometerKm != null || raw.kilometraje_odometro != null
          ? Number(raw.odometerKm ?? raw.kilometraje_odometro)
          : null,
        nuN(pickPortalField(raw, "station", "estacion")),
        paidBy,
        regUser
      ]
    );
    const r = await c.query(`SELECT * FROM registros_combustible WHERE id = $1::uuid LIMIT 1`, [raw.id]);
    if (!r.rows[0]) throw new BadRequestException("No se pudo leer el registro de combustible");
    return this.mapFuelLogDbRow(r.rows[0] as Record<string, unknown>);
  }

  private async upsertFleetMaintenanceLogRow(
    c: PoolClient,
    raw: Record<string, unknown>,
    registeredByUserId?: string
  ) {
    if (!raw?.id) throw new BadRequestException("id requerido");
    if (this.skipUnlessPersistUuid("upsertFleetMaintenanceLogRow", raw.id)) {
      throw new BadRequestException("id UUID inválido");
    }
    if (this.skipUnlessPersistUuid("upsertFleetMaintenanceLogRow.vehicleId", raw.vehicleId)) {
      throw new BadRequestException("vehicleId UUID inválido");
    }
    const plate = await this.resolveVehiclePlateForSync(
      c,
      raw.vehicleId,
      pickPortalField(raw, "plate", "vehiclePlate", "placa_vehiculo")
    );
    const interventionType = String(
      pickPortalField(raw, "interventionType", "type", "tipo_intervencion") ?? "preventivo"
    )
      .trim()
      .toLowerCase();
    const followUpStatus = String(
      pickPortalField(raw, "followUpStatus", "status", "estado_seguimiento") ?? "Pendiente"
    ).trim();
    const description = nu(pickPortalField(raw, "description", "descripcion") ?? "");
    if (!description) throw new BadRequestException("descripcion requerida");
    const regUser =
      registeredByUserId && PG_UUID_V4_RE.test(String(registeredByUserId).trim())
        ? String(registeredByUserId).trim()
        : null;
    await c.query(
      `INSERT INTO registros_mantenimiento_vehiculo (
          id, fecha, id_vehiculo, placa_vehiculo, tipo_intervencion, descripcion, costo, horas_inactividad, estado_seguimiento, id_usuario_registro
        ) VALUES ($1::uuid, $2::date, $3::uuid, $4, $5, $6, $7, $8, $9, $10::uuid)
        ON CONFLICT (id) DO UPDATE SET
          fecha = EXCLUDED.fecha,
          id_vehiculo = EXCLUDED.id_vehiculo,
          placa_vehiculo = EXCLUDED.placa_vehiculo,
          tipo_intervencion = EXCLUDED.tipo_intervencion,
          descripcion = EXCLUDED.descripcion,
          costo = EXCLUDED.costo,
          horas_inactividad = EXCLUDED.horas_inactividad,
          estado_seguimiento = EXCLUDED.estado_seguimiento,
          id_usuario_registro = COALESCE(EXCLUDED.id_usuario_registro, registros_mantenimiento_vehiculo.id_usuario_registro)`,
      [
        raw.id,
        raw.date ?? raw.fecha,
        raw.vehicleId,
        plate,
        interventionType || "preventivo",
        description,
        Number(raw.cost ?? raw.costo ?? 0),
        Number(raw.downtimeHours ?? raw.horas_inactividad ?? 0),
        followUpStatus || "Pendiente",
        regUser
      ]
    );
    const r = await c.query(`SELECT * FROM registros_mantenimiento_vehiculo WHERE id = $1::uuid LIMIT 1`, [raw.id]);
    if (!r.rows[0]) throw new BadRequestException("No se pudo leer el registro de mantenimiento");
    return this.mapMaintenanceLogDbRow(r.rows[0] as Record<string, unknown>);
  }

  private async syncFuelLogs(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const raw of data) {
      const row = raw as Record<string, unknown>;
      if (!row?.id) continue;
      if (this.skipUnlessPersistUuid("syncFuelLogs", row.id)) continue;
      if (this.skipUnlessPersistUuid("syncFuelLogs.vehicleId", row.vehicleId)) continue;
      if (this.skipUnlessPersistUuid("syncFuelLogs.driverId", row.driverId)) continue;
      try {
        await this.upsertFleetFuelLogRow(c, row);
      } catch (e) {
        if (e instanceof BadRequestException) continue;
        throw e;
      }
    }
  }

  private async syncVehicleTechnicalLogs(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const raw of data) {
      const row = raw as Record<string, unknown>;
      if (!row?.id) continue;
      if (this.skipUnlessPersistUuid("syncVehicleTechnicalLogs", row.id)) continue;
      if (this.skipUnlessPersistUuid("syncVehicleTechnicalLogs.vehicleId", row.vehicleId)) continue;
      try {
        await this.upsertFleetMaintenanceLogRow(c, row);
      } catch (e) {
        if (e instanceof BadRequestException) continue;
        throw e;
      }
    }
  }

  private async syncTravelAllowanceRules(c: PoolClient, data: unknown) {
    const obj = data as { interDepartmentTripAmount?: number };
    const v = Number(obj?.interDepartmentTripAmount ?? 85000);
    await c.query(
      `UPDATE reglas_viatico_interdepartamental
       SET valor_viaje_interdepartamental_cop = $1,
           fecha_actualizacion = now()
       WHERE id = 1`,
      [v]
    );
  }

  /** Un solo INSERT…UNNEST en lugar de N round-trips (catálogo de cargos suele ser pequeño pero el sync es frecuente). */
  private async upsertPositionsBatch(c: PoolClient, data: unknown): Promise<void> {
    if (!Array.isArray(data)) return;
    const ids: string[] = [];
    const names: string[] = [];
    const roles: string[] = [];
    const salaries: number[] = [];
    const contracts: string[] = [];
    const legal: string[] = [];
    const active: boolean[] = [];
    const schedules: (string | null)[] = [];
    const arlLevels: (string | null)[] = [];
    const integral: (boolean | null)[] = [];
    const transport: (number | null)[] = [];

    for (const raw of data) {
      const p = raw as Record<string, unknown>;
      if (!p?.id) continue;
      if (this.skipUnlessPersistUuid("syncHrKeys.positions", p.id)) continue;
      const id = String(p.id).trim();
      const integralRaw = pickPortalField(p, "integralSalary");
      const integralVal =
        integralRaw === true ||
        integralRaw === "true" ||
        (typeof integralRaw === "string" && integralRaw.toLowerCase() === "true")
          ? true
          : integralRaw === false || integralRaw === "false"
            ? false
            : null;
      const transportRaw = pickPortalField(p, "transportAllowance");
      const transportAllowance =
        transportRaw != null && String(transportRaw).trim() !== ""
          ? Math.max(0, Number(transportRaw) || 0)
          : null;

      ids.push(id);
      names.push(nu(p.name));
      roles.push(String(p.workerRole || "empleado").toLowerCase());
      salaries.push(Number(p.baseSalary) || 0);
      contracts.push(nu(p.contractTypeDefault || "Indefinido"));
      legal.push(nu(p.legalBasis || ""));
      active.push(p.active !== false);
      schedules.push(nuN(pickPortalField(p, "workSchedule", "schedule")));
      arlLevels.push(nuN(pickPortalField(p, "arlRiskLevel")));
      integral.push(integralVal);
      transport.push(transportAllowance);
    }

    if (!ids.length) return;

    await c.query(
      `INSERT INTO cargos (
          id, nombre, rol_trabajador, salario_base_mensual, tipo_contrato_sugerido, fundamento_legal,
          activo, jornada_referencia, nivel_riesgo_arl, salario_integral, auxilio_transporte
        )
        SELECT
          u.id, u.nombre, u.rol_trabajador, u.salario_base_mensual, u.tipo_contrato_sugerido, u.fundamento_legal,
          u.activo, u.jornada_referencia, u.nivel_riesgo_arl, u.salario_integral, u.auxilio_transporte
        FROM UNNEST(
          $1::uuid[], $2::text[], $3::text[], $4::numeric[], $5::text[], $6::text[],
          $7::boolean[], $8::text[], $9::text[], $10::boolean[], $11::numeric[]
        ) AS u(
          id, nombre, rol_trabajador, salario_base_mensual, tipo_contrato_sugerido, fundamento_legal,
          activo, jornada_referencia, nivel_riesgo_arl, salario_integral, auxilio_transporte
        )
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          rol_trabajador = EXCLUDED.rol_trabajador,
          salario_base_mensual = EXCLUDED.salario_base_mensual,
          tipo_contrato_sugerido = EXCLUDED.tipo_contrato_sugerido,
          fundamento_legal = EXCLUDED.fundamento_legal,
          activo = EXCLUDED.activo,
          jornada_referencia = EXCLUDED.jornada_referencia,
          nivel_riesgo_arl = EXCLUDED.nivel_riesgo_arl,
          salario_integral = EXCLUDED.salario_integral,
          auxilio_transporte = EXCLUDED.auxilio_transporte`,
      [ids, names, roles, salaries, contracts, legal, active, schedules, arlLevels, integral, transport]
    );
  }

  private async syncHrKeys(
    c: PoolClient,
    key: PortalSyncKey,
    data: unknown,
    deletedIds?: string[]
  ) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    if (key === "positions") {
      /** No podar cargos por lista parcial del navegador: solo borrado explícito + upsert. */
      await this.deleteRowsByExplicitIds(c, "cargos", deletedIds);
      await this.upsertPositionsBatch(c, data);
      return;
    }
    const hrTable = this.syncPruneTableForKey(key);
    if (hrTable) {
      await this.syncListWithPruning(c, hrTable, data, deletedIds);
    }
    if (key === "vacancies") {
      for (const raw of data) {
        const v = raw as Record<string, unknown>;
        if (!v?.id || !v.positionId) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.vacancies", v.id)) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.vacancies.positionId", v.positionId)) continue;
        const cupos = Math.max(
          1,
          Math.floor(Number(pickPortalField(v, "slots", "openings") ?? v.slots ?? v.openings) || 1)
        );
        await c.query(
          `INSERT INTO vacantes (
            id, id_cargo, titulo, departamento, ciudad, modalidad, jornada_vacante,
            fecha_limite_postulacion, fecha_publicacion_desde, cupos, salario_oferta,
            nombre_cargo_denorm, rol_trabajador, tipo_contrato_predeterminado, requisitos, estado
          ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8::date, $9::date, $10, $11, $12, $13, $14, $15, $16::estado_vacante)
          ON CONFLICT (id) DO UPDATE SET
            id_cargo = EXCLUDED.id_cargo,
            titulo = EXCLUDED.titulo,
            departamento = EXCLUDED.departamento,
            ciudad = EXCLUDED.ciudad,
            modalidad = EXCLUDED.modalidad,
            jornada_vacante = EXCLUDED.jornada_vacante,
            fecha_limite_postulacion = EXCLUDED.fecha_limite_postulacion,
            fecha_publicacion_desde = EXCLUDED.fecha_publicacion_desde,
            cupos = EXCLUDED.cupos,
            salario_oferta = EXCLUDED.salario_oferta,
            nombre_cargo_denorm = EXCLUDED.nombre_cargo_denorm,
            rol_trabajador = EXCLUDED.rol_trabajador,
            tipo_contrato_predeterminado = EXCLUDED.tipo_contrato_predeterminado,
            requisitos = EXCLUDED.requisitos,
            estado = EXCLUDED.estado`,
          [
            v.id,
            v.positionId,
            nu(v.title),
            cat(pickPortalField(v, "department")),
            cat(v.city) ?? "Bogota",
            nuN(pickPortalField(v, "modality")),
            nuN(pickPortalField(v, "workday")),
            v.deadline || new Date().toISOString().slice(0, 10),
            portalDateOrNull(pickPortalField(v, "publishedFrom", "visibleFrom")),
            cupos,
            Number(v.salaryOffer) || 0,
            nuN(pickPortalField(v, "positionName")),
            String(pickPortalField(v, "workerRole") || "empleado").toLowerCase(),
            nuN(pickPortalField(v, "contractTypeDefault")),
            nuN(pickPortalField(v, "requirements")),
            v.status || "Publicada"
          ]
        );
      }
      return;
    }
    if (key === "candidates") {
      for (const raw of data) {
        const x = raw as Record<string, unknown>;
        if (!x?.id || !x.vacancyId) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.candidates", x.id)) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.candidates.vacancyId", x.vacancyId)) continue;
        const salaryAsp = Number(
          pickPortalField(x, "salaryExpectation", "expectedSalary") ?? x.salaryExpectation
        );
        const avail = portalDateOrNull(
          pickPortalField(x, "availableFrom", "availabilityDate") ?? x.availableFrom
        );
        const stage = String(pickPortalField(x, "pipelineStage", "status") ?? "Recibido");
        let attachmentsPayload: unknown = x.attachments || [];
        const existingAdj = await c.query<{ adjuntos_json: unknown }>(
          `SELECT adjuntos_json FROM candidatos WHERE id = $1::uuid`,
          [x.id]
        );
        const existingArr = this.parseCandidateAdjuntosJsonArray(existingAdj.rows[0]?.adjuntos_json);
        const incomingArr = this.parseCandidateAdjuntosJsonArray(attachmentsPayload);
        if (this.shouldPreserveExistingCandidateAttachments(existingArr, incomingArr)) {
          attachmentsPayload = existingArr;
        }
        await c.query(
          `INSERT INTO candidatos (
            id, id_vacante, nombre_completo, correo_electronico, telefono, tipo_documento, numero_documento,
            fecha_nacimiento, nivel_educativo, departamento, ciudad, direccion,
            anios_experiencia, aspiracion_salarial, fecha_disponible_ingreso, etapa_proceso, adjuntos_json
          ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8::date, $9, $10, $11, $12, $13, $14, $15::date, $16, $17::jsonb)
          ON CONFLICT (id) DO UPDATE SET
            id_vacante = EXCLUDED.id_vacante,
            nombre_completo = EXCLUDED.nombre_completo,
            correo_electronico = EXCLUDED.correo_electronico,
            telefono = EXCLUDED.telefono,
            tipo_documento = EXCLUDED.tipo_documento,
            numero_documento = EXCLUDED.numero_documento,
            fecha_nacimiento = EXCLUDED.fecha_nacimiento,
            nivel_educativo = EXCLUDED.nivel_educativo,
            departamento = EXCLUDED.departamento,
            ciudad = EXCLUDED.ciudad,
            direccion = EXCLUDED.direccion,
            anios_experiencia = EXCLUDED.anios_experiencia,
            aspiracion_salarial = EXCLUDED.aspiracion_salarial,
            fecha_disponible_ingreso = EXCLUDED.fecha_disponible_ingreso,
            etapa_proceso = EXCLUDED.etapa_proceso,
            adjuntos_json = EXCLUDED.adjuntos_json`,
          [
            x.id,
            x.vacancyId,
            nu(x.name),
            em(x.email),
            nu(x.phone),
            String(x.documentType || "CC")
              .trim()
              .toUpperCase(),
            String(x.idDoc || "").trim(),
            portalDateOrNull(pickPortalField(x, "birthDate")),
            nuN(pickPortalField(x, "educationLevel")),
            cat(pickPortalField(x, "department")),
            cat(x.city) ?? "Bogota",
            nuN(pickPortalField(x, "address")),
            Number(x.experienceYears) || 0,
            Number.isFinite(salaryAsp) ? salaryAsp : 0,
            avail || new Date().toISOString().slice(0, 10),
            stage,
            JSON.stringify(attachmentsPayload)
          ]
        );
      }
      return;
    }
    if (key === "interviews") {
      for (const raw of data) {
        const i = raw as Record<string, unknown>;
        if (!i?.id || !i.candidateId) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.interviews", i.id)) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.interviews.candidateId", i.candidateId)) continue;
        await c.query(
          `INSERT INTO entrevistas (id, id_candidato, nombre_candidato_denorm, fecha_hora, entrevistador, modalidad, lugar_o_enlace, notas)
           VALUES ($1::uuid, $2::uuid, $3, $4::timestamptz, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             id_candidato = EXCLUDED.id_candidato,
             nombre_candidato_denorm = EXCLUDED.nombre_candidato_denorm,
             fecha_hora = EXCLUDED.fecha_hora,
             entrevistador = EXCLUDED.entrevistador,
             modalidad = EXCLUDED.modalidad,
             lugar_o_enlace = EXCLUDED.lugar_o_enlace,
             notas = EXCLUDED.notas`,
          [
            i.id,
            i.candidateId,
            nu(i.candidateName || ""),
            i.when || new Date().toISOString(),
            nu(i.interviewer || "RH"),
            nuN(pickPortalField(i, "modality", "mode")),
            nuN(pickPortalField(i, "locationOrLink", "place")),
            nuN(i.notes)
          ]
        );
      }
      return;
    }
    if (key === "contracts") {
      for (const x of data) {
        const row = x as Record<string, unknown>;
        const positionId = pickPortalField(row, "positionId", "id_cargo");
        const companyId = pickPortalField(row, "companyId", "id_empresa");
        const employeeId = pickPortalField(row, "employeeId", "id_empleado");
        if (!row?.id || !positionId || !companyId) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.contracts", row.id)) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.contracts.positionId", positionId)) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.contracts.companyId", companyId)) continue;
        if (
          employeeId != null &&
          String(employeeId).trim() !== "" &&
          this.skipUnlessPersistUuid("syncHrKeys.contracts.employeeId", employeeId)
        ) {
          continue;
        }
        const candRaw = pickPortalField(row, "candidateId", "id_candidato");
        if (
          candRaw != null &&
          String(candRaw).trim() !== "" &&
          this.skipUnlessPersistUuid("syncHrKeys.contracts.candidateId", candRaw)
        ) {
          continue;
        }
        const salaryRaw = pickPortalField(row, "salaryPactado", "baseSalary", "salario_pactado");
        const salaryPactado = Math.max(0, Number(salaryRaw) || 0);
        const transportRaw = pickPortalField(row, "transportAllowance");
        const auxilioTransporte =
          transportRaw != null && String(transportRaw).trim() !== ""
            ? Math.max(0, Number(transportRaw) || 0)
            : null;
        await c.query(
          `INSERT INTO contratos (
            id, etiqueta_origen, tipo_persona_origen, id_candidato, nombre_candidato_denorm, id_empleado, nombre_empleado_denorm,
            rol_trabajador, id_cargo, nombre_cargo_denorm, salario_pactado, fecha_inicio, fecha_fin, fecha_renovacion, id_empresa, nombre_empresa_denorm,
            tipo_contrato, tipo_plantilla_word, documento_identidad_snapshot, eps, fondo_pension, arl, jornada_turno,
            auxilio_transporte, texto_contenido_resumen
          ) VALUES (
            $1::uuid, $2, $3, $4::uuid, $5, $6::uuid, $7, $8, $9::uuid, $10, $11, $12::date, $13::date, $14::date, $15::uuid, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25
          )
          ON CONFLICT (id) DO UPDATE SET
            etiqueta_origen = EXCLUDED.etiqueta_origen,
            tipo_persona_origen = EXCLUDED.tipo_persona_origen,
            id_candidato = EXCLUDED.id_candidato,
            nombre_candidato_denorm = EXCLUDED.nombre_candidato_denorm,
            id_empleado = EXCLUDED.id_empleado,
            nombre_empleado_denorm = EXCLUDED.nombre_empleado_denorm,
            rol_trabajador = EXCLUDED.rol_trabajador,
            id_cargo = EXCLUDED.id_cargo,
            nombre_cargo_denorm = EXCLUDED.nombre_cargo_denorm,
            salario_pactado = EXCLUDED.salario_pactado,
            fecha_inicio = EXCLUDED.fecha_inicio,
            fecha_fin = EXCLUDED.fecha_fin,
            fecha_renovacion = EXCLUDED.fecha_renovacion,
            id_empresa = EXCLUDED.id_empresa,
            nombre_empresa_denorm = EXCLUDED.nombre_empresa_denorm,
            tipo_contrato = EXCLUDED.tipo_contrato,
            tipo_plantilla_word = EXCLUDED.tipo_plantilla_word,
            documento_identidad_snapshot = EXCLUDED.documento_identidad_snapshot,
            eps = EXCLUDED.eps,
            fondo_pension = EXCLUDED.fondo_pension,
            arl = EXCLUDED.arl,
            jornada_turno = EXCLUDED.jornada_turno,
            auxilio_transporte = EXCLUDED.auxilio_transporte,
            texto_contenido_resumen = EXCLUDED.texto_contenido_resumen`,
          [
            row.id,
            nuN(pickPortalField(row, "sourceTag", "source")),
            nu(pickPortalField(row, "personType") || (employeeId ? "Empleado" : "Candidato")),
            candRaw || null,
            nu(pickPortalField(row, "candidateName") || ""),
            employeeId || null,
            nu(pickPortalField(row, "employeeName") || ""),
            String(pickPortalField(row, "workerRole") || "empleado").toLowerCase(),
            positionId,
            nu(pickPortalField(row, "positionName", "position") || ""),
            salaryPactado,
            pickPortalField(row, "startDate") || new Date().toISOString().slice(0, 10),
            portalDateOrNull(pickPortalField(row, "endDate", "contractEndDate")),
            portalDateOrNull(pickPortalField(row, "renewalDate", "fecha_renovacion")),
            companyId,
            nu(pickPortalField(row, "companyName") || ""),
            nu(pickPortalField(row, "contractType") || "Indefinido"),
            nu(pickPortalField(row, "templateKind", "contractTemplateKind") || "oficina"),
            String(pickPortalField(row, "idDocSnapshot") || "").trim() || null,
            nu(pickPortalField(row, "eps") || "Sura"),
            nu(pickPortalField(row, "pensionFund") || "Porvenir"),
            nu(pickPortalField(row, "arl") || "Sura"),
            nu(pickPortalField(row, "schedule", "workSchedule") || "Diurna"),
            auxilioTransporte,
            nuN(pickPortalField(row, "content"))
          ]
        );
      }
    }
  }

  private async syncHrAbsences(c: PoolClient, data: unknown, deletedIds?: string[]) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    await this.syncListWithPruning(c, "ausencias_laborales", data, deletedIds);
    for (const raw of data) {
      const row = raw as Record<string, unknown>;
      if (!row?.id || !row.employeeId) continue;
      if (this.skipUnlessPersistUuid("syncHrAbsences", row.id)) continue;
      if (this.skipUnlessPersistUuid("syncHrAbsences.employeeId", row.employeeId)) continue;
      const tipo = String(
        pickPortalField(row, "type", "absenceType") ?? "incapacidad"
      );
      const dias = Math.max(
        1,
        Math.floor(
          Number(pickPortalField(row, "calendarDays", "days") ?? row.calendarDays ?? row.days) || 1
        )
      );
      const subtipoRaw = pickPortalField(row, "subtype", "absenceSubtype");
      let subtipo = subtipoRaw != null ? String(subtipoRaw).trim() || null : null;
      if (!subtipo) {
        if (tipo === "permiso_sufragio") subtipo = "votante";
        else if (tipo === "licencia_maternidad") subtipo = "ordinaria";
        else if (tipo === "licencia_paternidad") subtipo = "continua";
      }
      const diasReconocidos = Math.max(
        0.5,
        Number(
          pickPortalField(row, "recognizedDays", "diasReconocidos") ?? row.recognizedDays ?? 1
        ) || 0.5
      );
      const unidadRaw = pickPortalField(row, "recognizedUnit", "unidadDiasReconocidos");
      const unidad =
        unidadRaw != null && String(unidadRaw).trim()
          ? String(unidadRaw).trim()
          : tipo === "permiso_sufragio"
            ? "jornada"
            : ["vacaciones", "licencia_luto", "permiso_cita_medica", "permiso_citacion_judicial"].includes(tipo)
              ? "habil"
              : "calendario";
      await c.query(
        `INSERT INTO ausencias_laborales (
          id, id_empleado, nombre_empleado, tipo_ausencia, fecha_inicio, fecha_fin, dias_calendario,
          subtipo_ausencia, dias_reconocidos, unidad_dias_reconocidos,
          numero_soporte, entidad_eps, observaciones
        ) VALUES ($1::uuid, $2::uuid, $3, $4, $5::date, $6::date, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          id_empleado = EXCLUDED.id_empleado,
          nombre_empleado = EXCLUDED.nombre_empleado,
          tipo_ausencia = EXCLUDED.tipo_ausencia,
          fecha_inicio = EXCLUDED.fecha_inicio,
          fecha_fin = EXCLUDED.fecha_fin,
          dias_calendario = EXCLUDED.dias_calendario,
          subtipo_ausencia = EXCLUDED.subtipo_ausencia,
          dias_reconocidos = EXCLUDED.dias_reconocidos,
          unidad_dias_reconocidos = EXCLUDED.unidad_dias_reconocidos,
          numero_soporte = EXCLUDED.numero_soporte,
          entidad_eps = EXCLUDED.entidad_eps,
          observaciones = EXCLUDED.observaciones`,
        [
          row.id,
          row.employeeId,
          nu(row.employeeName),
          tipo,
          row.startDate,
          row.endDate,
          dias,
          subtipo != null ? nu(subtipo) : null,
          diasReconocidos,
          unidad != null ? nu(unidad) : null,
          nuN(pickPortalField(row, "supportNumber")),
          nuN(pickPortalField(row, "epsEntity")),
          nuN(row.notes)
        ]
      );
    }
  }

  private async syncSst(c: PoolClient, data: unknown, deletedIds?: string[]) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    await this.syncListWithPruning(c, "registros_cumplimiento_sst", data, deletedIds);
    for (const row of data) {
      if (!row?.id || !row.employeeId) continue;
      if (this.skipUnlessPersistUuid("syncSst", row.id)) continue;
      if (this.skipUnlessPersistUuid("syncSst.employeeId", row.employeeId)) continue;
      await c.query(
        `INSERT INTO registros_cumplimiento_sst (
          id, id_empleado, nombre_empleado, tipo_registro, proveedor_entidad, fecha_vencimiento_control, estado, codigo_documento, observaciones, creado_por
        ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::date, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          id_empleado = EXCLUDED.id_empleado,
          nombre_empleado = EXCLUDED.nombre_empleado,
          tipo_registro = EXCLUDED.tipo_registro,
          proveedor_entidad = EXCLUDED.proveedor_entidad,
          fecha_vencimiento_control = EXCLUDED.fecha_vencimiento_control,
          estado = EXCLUDED.estado,
          codigo_documento = EXCLUDED.codigo_documento,
          observaciones = EXCLUDED.observaciones,
          creado_por = EXCLUDED.creado_por`,
        [
          row.id,
          row.employeeId,
          nu(row.employeeName),
          nu(row.recordType),
          nu(row.provider),
          (row as { dueDate?: unknown; expiryDate?: unknown }).dueDate ??
            (row as { expiryDate?: unknown }).expiryDate,
          nu(row.status || "Pendiente"),
          nuN(row.documentCode),
          nuN(row.notes),
          nu(row.createdBy || "Portal")
        ]
      );
    }
  }

  private async syncTripRouteRates(c: PoolClient, data: unknown, deletedIds?: string[]) {
    if (!data || typeof data !== "object") throw new ForbiddenException();
    await this.deleteRowsByExplicitIds(c, "tarifas_trayecto", deletedIds);
    const SEP = "@@";
    const existingRows = await c.query<{
      id: string;
      departamento_origen: string;
      ciudad_origen: string;
      departamento_destino: string;
      ciudad_destino: string;
      ids_empresas: string[] | null;
    }>(
      `SELECT id::text, departamento_origen, ciudad_origen, departamento_destino, ciudad_destino, ids_empresas
       FROM tarifas_trayecto`
    );
    const normalizeRateScopeIds = (ids: string[] | null | undefined): string[] =>
      Array.isArray(ids)
        ? ids
            .map((s) => String(s || "").trim())
            .filter(Boolean)
            .sort()
        : [];
    const buildLogicalKey = (od: string, oc: string, dd: string, dc: string, companyIds: string[]): string =>
      `${String(od || "").trim().toLowerCase()}|${String(oc || "").trim().toLowerCase()}->${String(dd || "")
        .trim()
        .toLowerCase()}|${String(dc || "").trim().toLowerCase()}${SEP}${normalizeRateScopeIds(companyIds).join(",") || "*"}`;
    const existingByLogicalKey = new Map(
      existingRows.rows.map((row) => [
        buildLogicalKey(
          row.departamento_origen,
          row.ciudad_origen,
          row.departamento_destino,
          row.ciudad_destino,
          row.ids_empresas || []
        ),
        row.id
      ])
    );

    const parseEntry = (
      keyStr: string,
      valRaw: unknown
    ): { id: string | null; od: string; oc: string; dd: string; dc: string; cop: number; companyIds: string[] } | null => {
      let routePart = String(keyStr || "");
      let companyIds: string[] = [];
      let incomingId: string | null = null;
      const sepIdx = routePart.lastIndexOf(SEP);
      if (sepIdx !== -1) {
        const scope = routePart.slice(sepIdx + SEP.length);
        routePart = routePart.slice(0, sepIdx);
        if (scope && scope !== "*") {
          companyIds = scope
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      const parts = routePart.split("->");
      if (parts.length !== 2) return null;
      const [oa, da] = parts;
      const [od, oc] = String(oa).split("|");
      const [dd, dc] = String(da).split("|");

      let cop = 0;
      if (typeof valRaw === "number") cop = Number(valRaw);
      else if (valRaw && typeof valRaw === "object" && !Array.isArray(valRaw)) {
        const v = (valRaw as { value?: unknown; companyIds?: unknown; id?: unknown }).value;
        const ids = (valRaw as { companyIds?: unknown }).companyIds;
        const rawId = String((valRaw as { id?: unknown }).id || "").trim();
        incomingId = PG_UUID_V4_RE.test(rawId) ? rawId : null;
        cop = Number(v) || 0;
        if (Array.isArray(ids) && ids.length) {
          companyIds = ids.map((x) => String(x)).filter(Boolean);
        }
      }
      if (!(cop > 0)) return null;
      return {
        id: incomingId,
        od: od || "",
        oc: oc || "",
        dd: dd || "",
        dc: dc || "",
        cop,
        companyIds: normalizeRateScopeIds(companyIds)
      };
    };

    const keepIds = new Set<string>();
    for (const [keyStr, valRaw] of Object.entries(data as Record<string, unknown>)) {
      const row = parseEntry(keyStr, valRaw);
      if (!row) continue;
      const logicalKey = buildLogicalKey(row.od, row.oc, row.dd, row.dc, row.companyIds);
      const resolvedId = row.id || existingByLogicalKey.get(logicalKey) || randomUUID();
      const idsPg = row.companyIds.length ? row.companyIds : null;
      keepIds.add(resolvedId);
      await c.query(
        `INSERT INTO tarifas_trayecto (
          id, departamento_origen, ciudad_origen, departamento_destino, ciudad_destino,
          valor_tarifa_cop, ids_empresas, activo
        ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7::uuid[], true)
        ON CONFLICT (id) DO UPDATE SET
          departamento_origen = EXCLUDED.departamento_origen,
          ciudad_origen = EXCLUDED.ciudad_origen,
          departamento_destino = EXCLUDED.departamento_destino,
          ciudad_destino = EXCLUDED.ciudad_destino,
          valor_tarifa_cop = EXCLUDED.valor_tarifa_cop,
          ids_empresas = EXCLUDED.ids_empresas,
          activo = EXCLUDED.activo,
          fecha_actualizacion = now()`,
        [
          resolvedId,
          cat(row.od) ?? row.od,
          cat(row.oc) ?? row.oc,
          cat(row.dd) ?? row.dd,
          cat(row.dc) ?? row.dc,
          row.cop,
          idsPg
        ]
      );
    }
    /**
     * El sync de tarifas NO poda por lista (antes reconciliaba contra `keepIds` y hasta hacía
     * `DELETE FROM tarifas_trayecto` cuando el payload llegaba sin ids, lo que podía vaciar la
     * tabla). El borrado de tarifas solo ocurre por `deletedIds` (acción explícita "Quitar
     * tarifa"), aplicado al inicio de este método. El resto es UPSERT.
     */
    void keepIds;
  }

  private async syncApprovals(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const admin = this.isAdmin(role);
    const permissionSet = admin
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.resolveEffectivePermissionSet(userId, role);
    for (const a of data) {
      if (!a?.id) continue;
      if (this.skipUnlessPersistUuid("syncApprovals", a.id)) continue;
      const reqBy = a.requestedByUserId || userId;
      if (this.skipUnlessPersistUuid("syncApprovals.requestedByUserId", reqBy)) continue;
      if (!admin && String(reqBy) !== userId) {
        const existingRes = await c.query<{
          estado: string;
          revisado_por: string | null;
          motivo_rechazo: string | null;
        }>(
          `SELECT estado::text AS estado, revisado_por, motivo_rechazo
           FROM solicitudes_autorizacion WHERE id = $1::uuid`,
          [a.id]
        );
        const existing = existingRes.rows[0];
        if (!existing) {
          throw new ForbiddenException();
        }
        const nextStatus = String(a.status || "pendiente").trim();
        const prevStatus = String(existing.estado || "").trim();
        const reviewedChanged =
          String(a.reviewedBy || "").trim() !== String(existing.revisado_por || "").trim() ||
          String(a.rejectionReason || "").trim() !== String(existing.motivo_rechazo || "").trim();
        if ((nextStatus !== prevStatus || reviewedChanged) &&
          !this.canReviewApprovalType(permissionSet, String(a.type || ""))) {
          throw new ForbiddenException();
        }
      }
      const payload = await this.normalizeApprovalPayloadForStorage(a.type, a.payload);
      await c.query(
        `INSERT INTO solicitudes_autorizacion (
          id, tipo_solicitud, titulo, datos_json, estado, id_usuario_solicitante, nombre_solicitante,
          fecha_revision, revisado_por, motivo_rechazo
        ) VALUES ($1::uuid, $2, $3, $4::jsonb, $5::estado_aprobacion, $6::uuid, $7, $8::timestamptz, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          estado = EXCLUDED.estado,
          fecha_revision = EXCLUDED.fecha_revision,
          revisado_por = EXCLUDED.revisado_por,
          motivo_rechazo = EXCLUDED.motivo_rechazo`,
        [
          a.id,
          a.type,
          nu(a.title),
          JSON.stringify(payload),
          a.status || "pendiente",
          reqBy,
          nu(a.requestedByName || ""),
          a.reviewedAt || null,
          a.reviewedBy || null,
          a.rejectionReason || null
        ]
      );
    }
  }
}
