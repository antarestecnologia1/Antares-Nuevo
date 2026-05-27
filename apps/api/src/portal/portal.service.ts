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
  liquidationCutIfClosingToday
} from "../payroll/payroll-cut-bogota";
import { canonicalPayFrequencyLabel, normalizePayrollFrequency } from "../payroll/payroll-frequency";
import type { PortalSyncKey } from "./dto/sync-key.dto";
import type { TransportScheduleBusyDto } from "./dto/transport-schedule-busy.dto";
import { LIQUIDACION_UPSERT } from "./liquidacion-upsert";
import { randomUUID } from "node:crypto";

type JwtRole = string;

type PortalLaborSystemRules = {
  smmlvCop: number;
  minMonthlySalaryCop: number;
  transportAllowanceCop: number;
  legalWeeklyHours: number;
  uvtCop: number | null;
};

const DEFAULT_FRONTEND_MIN_MONTHLY_SALARY_COP = 1_750_905;
const DEFAULT_FRONTEND_TRANSPORT_ALLOWANCE_COP = 249_095;
const DEFAULT_COLOMBIA_LEGAL_WEEKLY_HOURS = 46;
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
  uvt: ["uvt", "uvt_cop", "unidad_valor_tributario"]
} as const;

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

/** Igual que `defaultPermissionsForRole` / ALL_PERMISSIONS en app.js */
const ALL_PORTAL_PERMISSIONS: string[] = [
  "dashboard_view",
  "client_requests",
  "transport_requests",
  "transport_trips",
  "transport_vehicles",
  "transport_drivers",
  "transport_calendar",
  "transport_history",
  "payroll_manage",
  "hiring_manage",
  "sst_compliance",
  "users_manage",
  "authorizations_manage",
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
  return ["dashboard_view", "client_requests", "profile_view", "notifications_view"];
}

const APPROVE_VALID_ROLES = new Set([
  "admin",
  "client",
  "rrhh",
  "administracion",
  "auxiliar_administrativo",
  "lider_administrativo"
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

function portalDateOrNull(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  return String(v);
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
  private payrollEmployeeSchemaTier: 0 | 1 | undefined;
  /** Columnas origen_liquidacion / novedades_liquidacion_json (migr. 22). */
  private payrollLiquNovedadesCols: boolean | undefined;

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
    await this.ensureProspectosContactoB2bSchema();
    await this.ensureSolicitudesTransporteSchema();
    await this.ensurePreferenciasNotificacionSchema();
    await this.ensureEmpleadosNominaSchema();
    await this.ensureLiquidacionesNominaSchema();
    await this.ensureAuditoriaTransporteSchema();
    await this.ensureRegistrosFlotaSchema();
    await this.pruneTransportDeletionAudits().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`pruneTransportDeletionAudits startup: ${sanitizeLogText(msg)}`);
    });
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
  private async ensureSolicitudesTransporteSchema() {
    if (!(await this.tableExists("solicitudes_transporte"))) return;
    try {
      await this.pool.query(
        `ALTER TABLE solicitudes_transporte
           ADD COLUMN IF NOT EXISTS refrigeracion_termoking BOOLEAN NOT NULL DEFAULT false`
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
      this.logger.log("solicitudes_transporte: columna refrigeracion_termoking verificada.");
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

  /** Condición médica empleados (19_empleados_condicion_medica.sql). */
  private async ensureEmpleadosNominaSchema() {
    if (!(await this.tableExists("empleados_nomina"))) return;
    const alters = [
      `ALTER TABLE public.empleados_nomina ADD COLUMN IF NOT EXISTS tiene_condicion_medica BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE public.empleados_nomina ADD COLUMN IF NOT EXISTS descripcion_condicion_medica TEXT`
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
      `ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS novedades_liquidacion_json JSONB`
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

  private async loadLaborSystemRules(
    referenceDate: Date = new Date(),
    client?: PoolClient
  ): Promise<PortalLaborSystemRules> {
    const active = await this.loadActiveSystemParameters(referenceDate, client);
    const smmlvDb = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.smmlv);
    const transportAllowanceDb = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.transportAllowance);
    const uvtDb = this.pickActiveSystemParameter(active, SYSTEM_PARAMETER_ALIASES.uvt);
    const smmlvFallback = Math.max(
      0,
      Number(this.config.get<string>("PAYROLL_SMMLV_COP")) || SMMLV_COP_REFERENCE_2026
    );

    return {
      smmlvCop: smmlvDb ?? smmlvFallback,
      // Cuando existe en BD, el piso salarial del portal se alinea al mismo SMMLV vigente.
      minMonthlySalaryCop: smmlvDb ?? DEFAULT_FRONTEND_MIN_MONTHLY_SALARY_COP,
      transportAllowanceCop: transportAllowanceDb ?? DEFAULT_FRONTEND_TRANSPORT_ALLOWANCE_COP,
      legalWeeklyHours: DEFAULT_COLOMBIA_LEGAL_WEEKLY_HOURS,
      uvtCop: uvtDb
    };
  }

  private isAdmin(role: JwtRole) {
    return String(role || "").toLowerCase() === "admin";
  }

  private isTransportOps(role: JwtRole) {
    const r = String(role || "").toLowerCase();
    return ["admin", "administracion", "auxiliar_administrativo", "lider_administrativo"].includes(r);
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

  async bootstrap(userId: string, role: JwtRole) {
    const admin = this.isAdmin(role);
    const [empresaId, permissionSet] = await Promise.all([
      this.getUserCompany(userId),
      admin ? Promise.resolve(new Set<string>(ALL_PORTAL_PERMISSIONS)) : this.loadPortalPermissionSet(userId)
    ]);
    const canUsersManage = admin || this.hasPortalPermission(permissionSet, "users_manage");
    const canViewContactB2b = admin || this.hasPortalPermission(permissionSet, "contact_b2b_view");
    const canTransportTrips = admin || this.hasPortalPermission(permissionSet, "transport_trips");
    const canTransportVehicles = admin || this.hasPortalPermission(permissionSet, "transport_vehicles");
    const canTransportDrivers = admin || this.hasPortalPermission(permissionSet, "transport_drivers");
    const canTransportCalendar = admin || this.hasPortalPermission(permissionSet, "transport_calendar");
    const canTransportHistory = admin || this.hasPortalPermission(permissionSet, "transport_history");
    const canTransportData =
      canTransportTrips || canTransportVehicles || canTransportDrivers || canTransportCalendar || canTransportHistory;
    const canPayroll = admin || this.hasPortalPermission(permissionSet, "payroll_manage");
    const canHiring = admin || this.hasPortalPermission(permissionSet, "hiring_manage");
    const canSst = admin || this.hasPortalPermission(permissionSet, "sst_compliance");
    const fullUserDirectoryAccess = admin || canUsersManage;
    const canSeeAllCompanies =
      admin || canUsersManage || canTransportData || canPayroll || canHiring || canSst || canViewContactB2b;
    const laborSystemRulesPromise = this.loadLaborSystemRules();

    const independentPromise = Promise.all([
      this.loadCompanies(canSeeAllCompanies ? null : empresaId),
      admin ? this.loadCounters() : Promise.resolve({}),
      canPayroll ? this.loadTravelAllowanceRules() : Promise.resolve({ interDepartmentTripAmount: 85000 }),
      laborSystemRulesPromise,
      canTransportTrips ? this.loadTripRouteRates() : Promise.resolve({}),
      canTransportData ? this.loadVehicles() : Promise.resolve([]),
      canTransportData ? this.loadDrivers() : Promise.resolve([]),
      this.loadNotifications(userId, admin),
      this.loadEmails(admin),
      this.loadContacts(canViewContactB2b),
      canPayroll || canHiring ? this.loadPositions() : Promise.resolve([]),
      canHiring ? this.loadVacancies() : Promise.resolve([]),
      canHiring ? this.loadCandidates() : Promise.resolve([]),
      canHiring ? this.loadInterviews() : Promise.resolve([]),
      canHiring ? this.loadContracts() : Promise.resolve([]),
      canPayroll ? this.loadPayrollRuns() : Promise.resolve([]),
      canTransportHistory ? this.loadFuelLogs() : Promise.resolve([]),
      canTransportHistory ? this.loadVehicleTechnicalLogs() : Promise.resolve([]),
      canPayroll ? this.loadHrAbsences() : Promise.resolve([]),
      canSst ? this.loadSstCompliance() : Promise.resolve([])
    ]);

    const dependentPromise = Promise.all([
      this.loadUsers(admin, userId, empresaId, role, fullUserDirectoryAccess),
      this.loadRequests(admin, userId, empresaId, canTransportData),
      canPayroll ? this.loadPayrollEmployees(empresaId, admin) : Promise.resolve([]),
      this.loadApprovals(admin, userId, empresaId),
      admin ? this.loadDeletedTransportTripLogs() : Promise.resolve([]),
      admin ? this.loadDeletedTransportRequestLogs() : Promise.resolve([])
    ]);

    const [independent, dependent] = await Promise.all([independentPromise, dependentPromise]);

    const [
      companies,
      counters,
      travelAllowanceRules,
      systemParameters,
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

    const [users, requests, payrollEmployees, approvals, deletedTransportTripLogs, deletedTransportRequestLogs] =
      dependent;

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
      notificationPreferences
    };
  }

  async syncKey(key: PortalSyncKey, data: unknown, userId: string, role: JwtRole) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await this.syncKeyTx(client, key, data, userId, role);
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
    if (!this.isAdmin(actorRole)) throw new ForbiddenException();

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

  async adminSetUserStatus(actorUserId: string, actorRole: JwtRole, targetUserId: string, status: string) {
    if (!this.isAdmin(actorRole)) throw new ForbiddenException();
    const tid = String(targetUserId || "").trim();
    const accountStatus = String(status || "").trim().toLowerCase();
    if (!tid) throw new BadRequestException("Usuario objetivo obligatorio");
    if (!["pendiente", "aprobado", "rechazado"].includes(accountStatus)) {
      throw new BadRequestException("Estado de cuenta no permitido");
    }
    if (tid === actorUserId) throw new BadRequestException("No puedes cambiar tu propio estado de cuenta");

    const targetRes = await this.pool.query<{ rol: string }>(
      `SELECT rol::text AS rol FROM usuarios WHERE id = $1::uuid`,
      [tid]
    );
    let target = targetRes.rows[0];
    if (!target) {
      // Huérfano de Supabase Auth: aprovisionamos antes de aplicar el cambio de estado.
      const provisioned = await this.provisionUsuariosFromAuthOrphan(tid).catch(() => null);
      if (!provisioned) throw new BadRequestException("Usuario no encontrado");
      target = { rol: "client" };
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
    return { ok: true, userId: tid, status: accountStatus };
  }

  async adminUpdateUserCredentials(
    actorUserId: string,
    actorRole: JwtRole,
    targetUserId: string,
    emailRaw?: string,
    passwordRaw?: string
  ) {
    void actorUserId;
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

    const targetRes = await this.pool.query<{ id: string }>(
      `SELECT id::text FROM usuarios WHERE id = $1::uuid`,
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

  async adminDeleteUser(actorUserId: string, actorRole: JwtRole, targetUserId: string) {
    if (!this.isAdmin(actorRole)) throw new ForbiddenException();
    const tid = String(targetUserId || "").trim();
    if (!tid) throw new BadRequestException("Usuario objetivo obligatorio");
    if (tid === actorUserId) throw new BadRequestException("No puedes eliminar tu propio usuario");

    const targetRes = await this.pool.query<{ rol: string }>(
      `SELECT rol::text AS rol FROM usuarios WHERE id = $1::uuid`,
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

    await this.pool.query(`DELETE FROM usuarios WHERE id = $1::uuid`, [tid]);
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
      const del = await this.pool.query(`DELETE FROM empresas WHERE id = $1::uuid`, [cid]);
      if (del.rowCount === 0) throw new BadRequestException("Empresa no encontrada");
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
    void actorUserId;
    if (!this.isTransportOps(actorRole)) throw new ForbiddenException();
    const vid = String(vehicleId || "").trim();
    if (!vid || !PG_UUID_V4_RE.test(vid)) throw new BadRequestException("ID de vehiculo invalido");
    try {
      const del = await this.pool.query(`DELETE FROM vehiculos WHERE id = $1::uuid`, [vid]);
      if ((del.rowCount ?? 0) === 0) throw new BadRequestException("Vehiculo no encontrado.");
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
    if (!this.isTransportOps(actorRole)) throw new ForbiddenException();
    const did = String(driverId || "").trim();
    if (!did || !PG_UUID_V4_RE.test(did)) throw new BadRequestException("ID de conductor invalido");
    try {
      const del = await this.pool.query(`DELETE FROM conductores WHERE id = $1::uuid`, [did]);
      if ((del.rowCount ?? 0) === 0) throw new BadRequestException("Conductor no encontrado.");
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof ForbiddenException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      if (/foreign key|violates foreign key/i.test(msg)) {
        throw new BadRequestException(
          "No se puede eliminar: el conductor tiene viajes u otros registros asociados."
        );
      }
      throw e;
    }
    return { ok: true, driverId: did };
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
      : await this.loadPortalPermissionSet(actorUserId);
    if (!this.isAdmin(actorRole) && !this.hasPortalPermission(permissionSet, "payroll_manage")) {
      throw new ForbiddenException();
    }
    const eid = String(employeeId || "").trim();
    if (!eid || !PG_UUID_V4_RE.test(eid)) throw new BadRequestException("ID de empleado invalido");
    if (!(await this.tableExists("empleados_nomina"))) {
      throw new BadRequestException("Tabla de nomina no disponible en esta base.");
    }
    const del = await this.pool.query(`DELETE FROM empleados_nomina WHERE id = $1::uuid`, [eid]);
    if ((del.rowCount ?? 0) === 0) throw new BadRequestException("Empleado no encontrado.");
    return { ok: true, employeeId: eid };
  }

  private async deleteSupabaseAuthUser(userId: string) {
    if (!this.supabaseAdmin || !userId) return;
    await this.supabaseAdmin.auth.admin.deleteUser(userId).catch(() => null);
  }

  private async syncKeyTx(c: PoolClient, key: PortalSyncKey, data: unknown, userId: string, role: JwtRole) {
    const admin = this.isAdmin(role);
    const permissionSet = admin ? new Set<string>(ALL_PORTAL_PERMISSIONS) : await this.loadPortalPermissionSet(userId);
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
        if (!can("transport_vehicles")) throw new ForbiddenException();
        await this.syncVehicles(c, data);
        return;
      case "drivers":
        if (!can("transport_drivers")) throw new ForbiddenException();
        await this.syncDrivers(c, data);
        return;
      case "notifications":
        await this.syncNotifications(c, data, userId, role);
        return;
      case "emails":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncEmails(c, data);
        return;
      case "payrollEmployees":
        if (!can("payroll_manage")) throw new ForbiddenException();
        await this.syncPayrollEmployees(c, data);
        return;
      case "payrollRuns":
        if (!can("payroll_manage")) throw new ForbiddenException();
        await this.syncPayrollRuns(c, data);
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
        await this.syncHrKeys(c, key, data);
        return;
      case "hrAbsences":
        if (!can("payroll_manage")) throw new ForbiddenException();
        await this.syncHrAbsences(c, data);
        return;
      case "sstCompliance":
        if (!can("sst_compliance")) throw new ForbiddenException();
        await this.syncSst(c, data);
        return;
      case "tripRouteRates":
        if (!can("transport_trips")) throw new ForbiddenException();
        await this.syncTripRouteRates(c, data);
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
                  fecha_actualizacion AS "updatedAt"
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
                  fecha_actualizacion AS "updatedAt"
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
    return row ?? null;
  }

  /**
   * Altas de portal con estado pendiente (solo JWT admin).
   * Permite hidratar la bandeja aunque falle o incompleto GET /portal/bootstrap.
   * Combina filas en `usuarios` con `estado_cuenta='pendiente'` y huérfanos de Supabase Auth.
   */
  async getPendingUserRegistrations(_actorUserId: string, role: JwtRole) {
    if (!this.isAdmin(role)) return [];
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
        emergencyRelation: String((row as { emergencyRelationship?: string }).emergencyRelationship ?? ""),
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

  private async loadRequests(admin: boolean, userId: string, empresaId: string | null, transport: boolean) {
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

    const r =
      admin || transport
        ? await this.pool.query(base + ` ORDER BY s.fecha_creacion DESC`)
        : await this.pool.query(
            base + ` WHERE s.id_usuario_solicitante = $1::uuid OR ($2::uuid IS NOT NULL AND s.id_empresa_cliente = $2::uuid) ORDER BY s.fecha_creacion DESC`,
            [userId, empresaId]
          );

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
              u.correo_electronico AS "deletedByEmail",
              l.datos_json AS "snapshot"
       FROM auditoria_viajes_eliminados l
       LEFT JOIN usuarios u ON u.id = l.eliminado_por
       ORDER BY l.eliminado_en DESC
       LIMIT $1`,
      [PORTAL_DELETION_AUDIT_BOOTSTRAP_LIMIT]
    );
    return r.rows.map((row) => ({
      id: row.id,
      requestId: row.requestId,
      requestNumber: row.requestNumber,
      tripNumber: row.tripNumber,
      reason: row.reason,
      deletedAt: row.deletedAt ? new Date(row.deletedAt as string).toISOString() : null,
      deletedByEmail: maskPortalEmail(row.deletedByEmail),
      snapshot: row.snapshot || null
    }));
  }

  private async loadDeletedTransportRequestLogs(): Promise<Record<string, unknown>[]> {
    if (!(await this.tableExists("auditoria_solicitudes_eliminadas"))) return [];
    const r = await this.pool.query(
      `SELECT l.id::text,
              l.id_solicitud::text AS "requestId",
              l.numero_solicitud AS "requestNumber",
              l.motivo AS "reason",
              l.eliminado_en AS "deletedAt",
              u.correo_electronico AS "deletedByEmail",
              l.datos_json AS "snapshot"
       FROM auditoria_solicitudes_eliminadas l
       LEFT JOIN usuarios u ON u.id = l.eliminado_por
       ORDER BY l.eliminado_en DESC
       LIMIT $1`,
      [PORTAL_DELETION_AUDIT_BOOTSTRAP_LIMIT]
    );
    return r.rows.map((row) => ({
      id: row.id,
      requestId: row.requestId,
      requestNumber: row.requestNumber,
      reason: row.reason,
      deletedAt: row.deletedAt ? new Date(row.deletedAt as string).toISOString() : null,
      deletedByEmail: maskPortalEmail(row.deletedByEmail),
      snapshot: row.snapshot || null
    }));
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
    dto: { title: string; body: string; userIds?: string[]; audience?: "admins" | "hr" }
  ) {
    const title = String(dto.title || "").trim();
    const body = String(dto.body || "").trim();
    if (!title || !body) throw new BadRequestException("title y body son obligatorios");

    let targetIds: string[] = [];
    if (dto.audience === "admins") {
      targetIds = await this.loadUserIdsByRoles(["admin"]);
    } else if (dto.audience === "hr") {
      targetIds = await this.loadUserIdsByRoles([
        "admin",
        "rrhh",
        "administracion",
        "auxiliar_administrativo",
        "lider_administrativo"
      ]);
    } else if (Array.isArray(dto.userIds) && dto.userIds.length) {
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

    for (const uid of recipients) {
      await this.pool.query(
        `INSERT INTO notificaciones (id_usuario, titulo, cuerpo) VALUES ($1::uuid, $2, $3)`,
        [uid, title, body]
      );
    }
    return { ok: true, count: recipients.length };
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

  private async loadNotifications(userId: string, admin: boolean) {
    const r = admin
      ? await this.pool.query(
          `SELECT id::text, id_usuario::text AS "userId", titulo AS title, cuerpo AS body,
                  fecha_lectura AS readAt, fecha_creacion AS "createdAt"
           FROM notificaciones ORDER BY fecha_creacion DESC LIMIT 500`
        )
      : await this.pool.query(
          `SELECT id::text, id_usuario::text AS "userId", titulo AS title, cuerpo AS body,
                  fecha_lectura AS readAt, fecha_creacion AS "createdAt"
           FROM notificaciones WHERE id_usuario = $1::uuid ORDER BY fecha_creacion DESC LIMIT 200`,
          [userId]
        );
    return r.rows.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      body: n.body,
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
    const r = await this.pool.query(`SELECT * FROM cargos ORDER BY nombre`);
    return r.rows.map((p) => ({
      id: p.id,
      name: p.nombre,
      workerRole: p.rol_trabajador,
      baseSalary: Number(p.salario_base_mensual),
      contractTypeDefault: p.tipo_contrato_sugerido,
      legalBasis: p.fundamento_legal,
      active: p.activo,
      createdAt: p.fecha_creacion ? new Date(p.fecha_creacion).toISOString() : new Date().toISOString(),
      updatedAt: p.fecha_actualizacion ? new Date(p.fecha_actualizacion).toISOString() : null,
      schedule: p.jornada_referencia,
      arlRiskLevel: p.nivel_riesgo_arl,
      integralSalary: p.salario_integral
    }));
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

  private async loadPayrollEmployees(empresaId: string | null, admin: boolean) {
    const q = admin
      ? `SELECT * FROM empleados_nomina ORDER BY nombre_completo`
      : `SELECT * FROM empleados_nomina WHERE id_empresa = $1::uuid ORDER BY nombre_completo`;
    const r = admin ? await this.pool.query(q) : await this.pool.query(q, [empresaId]);
    return r.rows.map((e) => this.mapEmployeeRow(e));
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
      baseSalary: Number(e.salario_base),
      transportAllowance: e.auxilio_transporte != null ? Number(e.auxilio_transporte) : null,
      payFrequency: e.periodicidad_pago,
      costCenter: e.centro_costos,
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
      createdAt: e.fecha_creacion ? new Date(e.fecha_creacion as string).toISOString() : new Date().toISOString(),
      updatedAt: e.fecha_actualizacion ? new Date(e.fecha_actualizacion as string).toISOString() : null
    };
  }

  private async loadPayrollRuns() {
    const r = await this.pool.query(`SELECT * FROM liquidaciones_nomina ORDER BY fecha_creacion DESC`);
    return r.rows.map((row) => ({
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
      paidAt: row.fecha_pago ? new Date(row.fecha_pago).toISOString() : null,
      approvedBy: row.pago_aprobado_por,
      createdAt: row.fecha_creacion ? new Date(row.fecha_creacion).toISOString() : new Date().toISOString(),
      payrollKind:
        typeof row.tipo_registro === "string" && String(row.tipo_registro).trim()
          ? String(row.tipo_registro).trim()
          : "mensual",
      payPrimaServicios: row.incluye_prima_servicios === true,
      primaServiciosCop: Number(row.prima_servicios_cop ?? 0),
      primaServiciosDays: row.prima_dias_semestre != null ? Number(row.prima_dias_semestre) : null,
      settlementDetail:
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
      noveltiesDetail:
        row.novedades_liquidacion_json &&
        typeof row.novedades_liquidacion_json === "object"
          ? row.novedades_liquidacion_json
          : null
    }));
  }

  private async loadFuelLogs() {
    const r = await this.pool.query(`SELECT * FROM registros_combustible ORDER BY fecha_registro DESC LIMIT 1000`);
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
        createdAt: row.fecha_registro ? new Date(row.fecha_registro).toISOString() : new Date().toISOString()
      };
    });
  }

  private async loadVehicleTechnicalLogs() {
    const r = await this.pool.query(
      `SELECT * FROM registros_mantenimiento_vehiculo ORDER BY fecha_registro DESC LIMIT 1000`
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
      startDate: row.fecha_inicio,
      endDate: row.fecha_fin,
      calendarDays: row.dias_calendario,
      days: row.dias_calendario,
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
    const base =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? { ...(payload as Record<string, unknown>) }
        : {};

    if (type === "create_user") {
      const next = { ...base };
      const legacyPassword = typeof next.password === "string" ? next.password : "";
      const passwordHash = typeof next.passwordHash === "string" ? next.passwordHash.trim() : "";
      delete next.password;
      if (!passwordHash && legacyPassword.trim()) {
        next.passwordHash = await bcrypt.hash(legacyPassword, 10);
      } else if (passwordHash) {
        next.passwordHash = passwordHash;
      }
      return next;
    }

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
        return {
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

  /**
   * Sincroniza eliminaciones para entidades cuyo contrato es "el cliente envía toda la lista
   * y el servidor refleja ese conjunto autoritativo". Borra del repositorio las filas cuyo
   * id ya no aparece en el arreglo entrante: cierra el flujo de "borré X en el portal y al
   * refrescar volvió a aparecer" porque el sync solo era UPSERT.
   *
   * Importante: solo se llama cuando `data` es un Array válido (los handlers ya validaron).
   * Si el cliente envía lista vacía, se interpreta como "vacíe la tabla" — coherente con
   * el contrato de full-replacement de la sync-key.
   *
   * Filtra ids inválidos antes de comparar para evitar que un id corrupto en el cliente
   * provoque un wipe accidental.
   */
  private async deleteRowsNotInIncomingList(
    c: PoolClient,
    table: string,
    incoming: unknown[],
    idAccessor: (row: unknown) => unknown = (row) =>
      row && typeof row === "object" ? (row as { id?: unknown }).id : null
  ): Promise<void> {
    const ids = incoming
      .map(idAccessor)
      .map((raw) => String(raw ?? "").trim())
      .filter((s) => PG_UUID_V4_RE.test(s));
    if (ids.length === 0) {
      await c.query(`DELETE FROM ${table}`);
      return;
    }
    await c.query(`DELETE FROM ${table} WHERE id::text <> ALL($1::text[])`, [ids]);
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
          u.name ?? null,
          u.firstName ?? null,
          u.middleName ?? null,
          u.lastName ?? null,
          u.secondLastName ?? null,
          u.phone ?? null,
          u.department ?? null,
          u.city ?? null,
          u.address ?? null,
          u.emergencyContact ?? null,
          u.emergencyPhone ?? null,
          parentesco,
          u.avatarUrl ?? null,
          u.position ?? null,
          u.workArea ?? null,
          u.profileQualityChecklist ? JSON.stringify(u.profileQualityChecklist) : null,
          fechaIngresoPortal,
          String(rec.personType ?? "").trim() || null,
          String(rec.gender ?? "").trim() || null,
          fechaNacimiento,
          String(rec.documentType ?? "").trim() || null,
          String(rec.taxId ?? rec.personalDoc ?? "").trim() || null,
          String(rec.company ?? "").trim() || null
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
      const correoEmp =
        emailPick === undefined || emailPick === null || String(emailPick).trim() === ""
          ? null
          : String(emailPick).trim().slice(0, 120);
      const contactPick = pickPortalField(rec, "contactName", "nombre_contacto");
      const nombreContacto =
        contactPick === undefined || contactPick === null || String(contactPick).trim() === ""
          ? null
          : String(contactPick).trim().slice(0, 255);
      const deptPick = pickPortalField(rec, "department", "departamento");
      const departamento =
        deptPick === undefined || deptPick === null || String(deptPick).trim() === ""
          ? null
          : String(deptPick).trim().slice(0, 120);
      const cityPick = pickPortalField(rec, "city", "ciudad");
      const ciudad =
        cityPick === undefined || cityPick === null || String(cityPick).trim() === ""
          ? null
          : String(cityPick).trim().slice(0, 120);
      const addrPick = pickPortalField(rec, "address", "direccion_operativa", "direccion");
      const direccionOp =
        addrPick === undefined || addrPick === null || String(addrPick).trim() === ""
          ? null
          : String(addrPick).trim();
      await c.query(
        `INSERT INTO empresas (id, nombre, nit, telefono, correo_empresarial, nombre_contacto, departamento, ciudad, direccion_operativa, tipo_relacion_empresa, activo, url_logo)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10::tipo_relacion_empresa, $11, $12)
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
           url_logo = EXCLUDED.url_logo`,
        [
          id,
          String(nombre).trim(),
          String(nit).trim(),
          telefono,
          correoEmp,
          nombreContacto,
          departamento,
          ciudad,
          direccionOp,
          tipoRelacion,
          activo,
          urlLogo
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
          row.contactName,
          row.companyName,
          row.nit,
          row.role,
          row.phone,
          row.email,
          row.serviceType,
          row.operationType,
          row.frequency,
          row.serviceWindow,
          row.message
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

  private async syncRequests(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const admin = this.isAdmin(role);
    const transport = this.isTransportOps(role) || admin;
    const empresaId = await this.getUserCompany(userId);
    for (const req of data) {
      if (!req?.id) continue;
      const idStr = String(req.id).trim();
      if (!PG_UUID_V4_RE.test(idStr)) {
        this.logger.warn(
          `syncRequests: omitiendo fila con id no UUID (requerido por PostgreSQL): ${idStr.slice(0, 36)}`
        );
        continue;
      }
      const ownerOk =
        admin ||
        transport ||
        String(req.clientUserId) === userId ||
        (empresaId && String(req.clientCompanyId || "") === String(empresaId));
      if (!ownerOk) throw new ForbiddenException();

      const contactName = String(req.contactName ?? req.siteContactName ?? "").trim();
      const contactPhone = String(req.contactPhone ?? req.siteContactPhone ?? "").trim();
      if (!contactName || !contactPhone) {
        throw new BadRequestException(
          "Faltan contacto en sitio y/o teléfono en una solicitud (nombre y teléfono son obligatorios en base de datos)."
        );
      }
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
      const observations =
        String(req.observations ?? req.notes ?? "").trim() || null;
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
          req.requestNumber,
          req.clientUserId,
          req.clientCompanyId || null,
          req.clientName,
          req.requestedByName,
          req.originDepartment,
          req.originCity,
          req.originAddress,
          req.destinationDepartment,
          req.destinationCity,
          req.destinationAddress,
          req.pickupAt,
          req.etaDelivery,
          vehicleType,
          req.cargoDescription,
          tipoServicio,
          refrigeracionTermoking,
          boxesNum,
          weightKg,
          numeroFuelles,
          contactName,
          contactPhone,
          observations,
          req.status,
          Number(req.tripValue) || 0,
          insuredValue,
          Number(req.standbyChargeTotal) || 0,
          JSON.stringify(Array.isArray(req.standbyEvents) ? req.standbyEvents : []),
          req.rejectionReason || null,
          req.approvedAt || null,
          req.approvedBy || null,
          autoApproved,
          req.deliveredAt || null,
          req.closedAt || null,
          distanceKm
        ]
      );

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
            t.route || null,
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
      await c.query(
        `INSERT INTO vehiculos (
          id, placa, marca, linea_modelo, anio_modelo, color, tipo_vehiculo, capacidad_kg, refrigerado_termoking,
          tipo_carroceria, tipo_combustible, configuracion_ejes, numero_motor, numero_chasis_vin, numero_tarjeta_propiedad,
          fecha_expedicion_soat, fecha_vencimiento_soat, fecha_expedicion_tecnomecanica, fecha_vencimiento_tecnomecanica,
          numero_poliza_rc_contractual, numero_poliza_rc_extracontractual, fecha_vencimiento_polizas_rc,
          tiene_gps, proveedor_gps, usuario_proveedor_satelite, password_proveedor_satelite, disponible, ocupado_por_sistema
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::date, $17::date, $18::date, $19::date,
          $20, $21, $22::date, $23, $24, $25, $26, $27, $28
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
          ocupado_por_sistema = EXCLUDED.ocupado_por_sistema`,
        [
          v.id,
          String(v.plate).toUpperCase(),
          v.brand || "N/D",
          v.model || "N/D",
          Number(v.year) || 2020,
          v.color || "N/D",
          v.type || "Camion",
          Number(v.capacityKg) || 1,
          Boolean(v.refrigerated),
          v.bodyType || "Furgon",
          v.fuelType || "Diesel",
          v.axleConfig || "4x2",
          v.engineNumber || "N/D",
          (v.vin || "XXXXXXXXXXX").slice(0, 17),
          v.ownershipCard || "N/D",
          v.soatExpeditionDate || new Date().toISOString().slice(0, 10),
          v.soatExpiryDate || new Date().toISOString().slice(0, 10),
          v.techInspectionExpeditionDate || new Date().toISOString().slice(0, 10),
          v.techInspectionExpiryDate || new Date().toISOString().slice(0, 10),
          v.rcPolicyContract || null,
          v.rcPolicyExtra || null,
          v.rcPolicyExpiry || null,
          Boolean(v.hasGps),
          v.gpsProvider || null,
          v.satelliteProviderUser || null,
          v.satelliteProviderPassword || null,
          v.available !== false,
          Boolean(v.autoBusy)
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

      const bloodRaw = p(d, "bloodType", "tipo_sangre");
      const bloodSql =
        bloodRaw != null && String(bloodRaw).trim() !== "" ? String(bloodRaw).trim().slice(0, 8) : null;
      const epsRaw = p(d, "eps");
      const epsSql = epsRaw != null && String(epsRaw).trim() !== "" ? String(epsRaw).trim().slice(0, 120) : null;
      const arlRaw = p(d, "arl");
      const arlSql = arlRaw != null && String(arlRaw).trim() !== "" ? String(arlRaw).trim().slice(0, 120) : null;
      const comparendosRaw = p(d, "comparendos", "comparendos_pendientes");
      const comparendosNum = Number(comparendosRaw);
      const comparendosSql = Number.isFinite(comparendosNum)
        ? Math.max(0, Math.min(9999, Math.floor(comparendosNum)))
        : 0;
      const expRaw = p(d, "experienceYears", "anos_experiencia_conduccion");
      const expNum = Number(expRaw);
      const anosSql = Number.isFinite(expNum) ? Math.max(0, Math.min(80, Math.floor(expNum))) : 0;

      const occExam = portalDateOrNull(
        p(d, "occupationalExamDate", "psychometricExamDate", "psychoTestDate", "fecha_examen_ocupacional")
      );
      const intraExam = portalDateOrNull(
        p(d, "instruvialExamDate", "intravehicularExamDate", "fecha_examen_instruvial")
      );
      const occExpiry = occExam ? portalYmdPlusYears(occExam, 1) : null;
      const intraExpiry = intraExam ? portalYmdPlusYears(intraExam, 1) : null;

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
          $18::date, $19, $20, $21, $22, $23,
          $24, $25,
          $26, $27, $28, $29, $30, $31::date, $32::timestamptz,
          $33
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
          url_foto = COALESCE(EXCLUDED.url_foto, conductores.url_foto)`,
        [
          d.id,
          d.companyId || null,
          d.name || "Conductor",
          d.documentType || "CC",
          d.idDoc || "0000000",
          d.phone || "3000000000",
          d.department || null,
          d.city || "Bogota",
          d.address || "N/D",
          d.license || "N",
          d.licenseCategory || "C2",
          d.licenseExpiry || new Date().toISOString().slice(0, 10),
          occExam,
          occExpiry,
          intraExam,
          intraExpiry,
          (p(d, "defensiveDrivingCourse", "defensiveCourse") as string) || null,
          portalDateOrNull(p(d, "defensiveCourseExpiry", "fecha_vencimiento_curso_defensivo")),
          bloodSql,
          epsSql,
          arlSql,
          comparendosSql,
          anosSql,
          (p(d, "emergencyContact") as string) || null,
          (p(d, "emergencyPhone") as string) || null,
          d.available !== false,
          Boolean(d.autoBusy),
          d.contractType || null,
          d.baseSalary != null ? Number(d.baseSalary) : null,
          portalDateOrNull(d.startDate),
          hiredOk,
          urlFotoSql
        ]
      );
    }
  }

  /**
   * Sincroniza notificaciones: UPSERT más **poda** — las filas que ya no llegan desde el navegador
   * para cada destinatario se eliminan, para que al recargar no reaparezcan.
   */
  private async syncNotifications(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const admin = this.isAdmin(role);
    type NotifRow = { id?: unknown; userId?: unknown; title?: unknown; body?: unknown; readAt?: unknown };
    const rows = data as NotifRow[];

    for (const n of rows) {
      if (!n?.id) continue;
      if (this.skipUnlessPersistUuid("syncNotifications", String(n.id))) continue;
      if (!admin && String(n.userId) !== userId) throw new ForbiddenException();
      if (this.skipUnlessPersistUuid("syncNotifications.targetUserId", String(n.userId))) continue;
      await c.query(
        `INSERT INTO notificaciones (id, id_usuario, titulo, cuerpo, fecha_lectura)
         VALUES ($1::uuid, $2::uuid, $3, $4, $5::timestamptz)
         ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, cuerpo = EXCLUDED.cuerpo, fecha_lectura = EXCLUDED.fecha_lectura`,
        [n.id, n.userId, n.title, n.body, (n.readAt ?? null) as string | Date | null]
      );
    }

    if (!admin) {
      const ids = rows
        .map((n) => String(n?.id ?? "").trim())
        .filter((id) => PG_UUID_V4_RE.test(id));
      if (!ids.length) {
        await c.query(`DELETE FROM notificaciones WHERE id_usuario = $1::uuid`, [userId]);
      } else {
        await c.query(
          `DELETE FROM notificaciones WHERE id_usuario = $1::uuid AND NOT (id::text = ANY($2::text[]))`,
          [userId, ids]
        );
      }
      return;
    }

    if (rows.length === 0) {
      /** Coherente con “vaciar bandeja” del admin cuando el navegador queda sin entradas. */
      await c.query(`DELETE FROM notificaciones`);
      return;
    }

    const byUid = new Map<string, string[]>();
    for (const n of rows) {
      const nid = String(n?.id ?? "").trim();
      const uid = String(n?.userId ?? "").trim();
      if (!PG_UUID_V4_RE.test(nid) || !PG_UUID_V4_RE.test(uid)) continue;
      let arr = byUid.get(uid);
      if (!arr) {
        arr = [];
        byUid.set(uid, arr);
      }
      if (!arr.includes(nid)) arr.push(nid);
    }

    for (const [targetUid, keepIds] of byUid.entries()) {
      if (!keepIds.length) {
        await c.query(`DELETE FROM notificaciones WHERE id_usuario = $1::uuid`, [targetUid]);
      } else {
        await c.query(
          `DELETE FROM notificaciones WHERE id_usuario = $1::uuid AND NOT (id::text = ANY($2::text[]))`,
          [targetUid, keepIds]
        );
      }
    }
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
        [e.id, e.to, e.subject, e.body, e.sentAt || null, e.error || null]
      );
    }
  }

  /** Detecta columnas `tiene_condicion_medica` / `descripcion_condicion_medica` (migración 19). */
  private async resolvePayrollEmployeeSchemaTier(c: PoolClient): Promise<0 | 1> {
    if (this.payrollEmployeeSchemaTier !== undefined) return this.payrollEmployeeSchemaTier;
    try {
      const { rows } = await c.query<{ n19: string }>(
        `SELECT COUNT(*) FILTER (WHERE column_name = 'tiene_condicion_medica')::text AS n19
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'empleados_nomina'`
      );
      const has19 = Number(rows[0]?.n19 ?? 0) > 0;
      const t: 0 | 1 = has19 ? 1 : 0;
      this.payrollEmployeeSchemaTier = t;
      if (t === 0) {
        this.logger.warn(
          "empleados_nomina: sin columnas de condición médica (migr. 19). " +
            "Ejecute npm run db:init o BD/postgres/migrations/19_empleados_condicion_medica.sql. " +
            "Hasta entonces ese dato solo quedará persistido en el navegador."
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

  private async syncPayrollEmployees(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const tier = await this.resolvePayrollEmployeeSchemaTier(c);
    await this.deleteRowsNotInIncomingList(c, "empleados_nomina", data);

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
          meses_prueba, fecha_fin_contrato, jornada_laboral, url_avatar, correo_corporativo
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
          $48, $49, $50, $51, $52
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
          url_avatar = EXCLUDED.url_avatar`;

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
          tiene_condicion_medica, descripcion_condicion_medica
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
          $53::boolean, $54
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
          url_avatar = EXCLUDED.url_avatar`;

    for (const raw of data) {
      const e = raw as Record<string, unknown>;
      if (!e?.id || !e.companyId) continue;
      if (this.skipUnlessPersistUuid("syncPayrollEmployees", e.id)) continue;
      if (this.skipUnlessPersistUuid("syncPayrollEmployees.companyId", e.companyId)) continue;
      const p = pickPortalField;
      const name = String(e.name ?? "").trim() || "Empleado";
      const docType = String(e.documentType || "CC");
      const idDoc = String(e.idDoc || "0");
      const city = String(p(e, "city") ?? "Bogota");
      const address = String(p(e, "address") ?? "N/D");
      const phone = String(p(e, "phone") ?? "3000000000");
      const emContact = String(p(e, "emergencyContact") ?? "N/D");
      const emPhone = String(p(e, "emergencyPhone") ?? "3000000000");
      const emRel = String(p(e, "emergencyRelation", "emergencyRelationship") ?? "familiar");
      const posText = String(p(e, "position") ?? "Empleado");
      const contract = String(p(e, "contractType") ?? "Indefinido");
      const start = String(p(e, "startDate") ?? new Date().toISOString().slice(0, 10));
      const base = Number(p(e, "baseSalary")) || 0;
      const bank = String(p(e, "bankName", "bank") ?? "Bancolombia");
      const acctNum = String(p(e, "bankAccount", "accountNumber") ?? "0");
      const acctType = String(p(e, "bankAccountType", "accountType") ?? "Ahorros");
      const eps = String(p(e, "eps") ?? "Sura");
      const pension = String(p(e, "pensionFund") ?? "Porvenir");
      const arl = String(p(e, "arl") ?? "Sura");
      const role = String(e.workerRole || "empleado").toLowerCase();

      const periodicidadRaw = p(
        e,
        "payFrequency",
        "periodicidadPago",
        "periodicidad_pago"
      );
      const periodicidadPago = canonicalPayFrequencyLabel(
        periodicidadRaw != null ? String(periodicidadRaw) : undefined
      );

      const occExam = portalDateOrNull(
        p(e, "occupationalExamDate", "psychoTestDate", "psychometricExamDate", "fecha_examen_ocupacional")
      );
      const intraExam = portalDateOrNull(
        p(e, "instruvialExamDate", "intravehicularExamDate", "fecha_examen_instruvial")
      );
      const occExpiry = occExam ? portalYmdPlusYears(occExam, 1) : null;
      const intraExpiry = intraExam ? portalYmdPlusYears(intraExam, 1) : null;

      const base52: unknown[] = [
        e.id,
        e.companyId,
        e.positionId || null,
        name,
        docType,
        idDoc,
        portalDateOrNull(p(e, "birthDate")),
        (p(e, "gender") as string) || null,
        (p(e, "maritalStatus") as string) || null,
        (p(e, "bloodType") as string) || null,
        (p(e, "educationLevel") as string) || null,
        (p(e, "department") as string) || null,
        city,
        address,
        phone,
        (p(e, "personalEmail") as string) || null,
        emContact,
        emPhone,
        emRel,
        posText,
        contract,
        ((p(e, "contractDuration", "contractDurationText") as string) || "").trim() || null,
        start,
        base,
        p(e, "transportAllowance") != null ? Number(p(e, "transportAllowance")) : null,
        periodicidadPago,
        (p(e, "costCenter") as string) || null,
        (p(e, "contributorType") as string) || null,
        (p(e, "arlRiskLevel") as string) || null,
        (p(e, "contractTemplateKind", "contractTemplate") as string) || null,
        eps,
        pension,
        arl,
        (p(e, "severanceFund") as string) || null,
        (p(e, "compensationFund") as string) || null,
        bank,
        acctType,
        acctNum,
        role,
        (p(e, "license", "licenseNumber") as string) || null,
        (p(e, "licenseCategory") as string) || null,
        portalDateOrNull(p(e, "licenseExpiry")),
        occExam,
        occExpiry,
        intraExam,
        intraExpiry,
        (p(e, "defensiveCourse", "defensiveDrivingCourse") as string) || null,
        p(e, "probationMonths") != null ? Math.floor(Number(p(e, "probationMonths"))) : null,
        portalDateOrNull(p(e, "contractEndDate")),
        (p(e, "workSchedule") as string) || null,
        (p(e, "avatarUrl") as string) || null,
        (p(e, "corporateEmail") as string) || null
      ];

      if (tier === 0) await c.query(UPSERT_LEGACY, base52);
      else
        await c.query(UPSERT_M19, [
          ...base52,
          String(p(e, "hasIllness") ?? "").toLowerCase() === "si",
          String(p(e, "hasIllness") ?? "").toLowerCase() === "si"
            ? ((p(e, "illnessDescription") as string) || "").trim() || null
            : null
        ]);
    }
  }

  private syncPayrollNumeric(v: unknown, fallback = 0): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  private payrollRunBaseParams(run: Record<string, unknown>): unknown[] {
    return [
      run.id,
      run.employeeId,
      run.employeeName,
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
              ? "Ejecute npm run db:init o migrations/20_liquidaciones_nomina_prima_terminacion.sql y 21_liquidaciones_intereses_cesantias.sql."
              : "Falta migrations/21_liquidaciones_intereses_cesantias.sql o npm run db:init.") +
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
          "liquidaciones_nomina: ejecute npm run db:init o migrations/22_liquidaciones_nomina_automatica.sql para origen y novedades JSON."
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
    run: Record<string, unknown>
  ) {
    const base25 = this.payrollRunBaseParams(run);
    const novExtra = hasNov ? this.payrollRunNovedadesParams(run) : [];
    if (tier === 0) {
      await c.query(hasNov ? LIQUIDACION_UPSERT.legacyNov : LIQUIDACION_UPSERT.legacy, [...base25, ...novExtra]);
      return;
    }
    if (tier === 1) {
      await c.query(hasNov ? LIQUIDACION_UPSERT.m20Nov : LIQUIDACION_UPSERT.m20, [
        ...base25,
        ...this.payrollRunExtM20(run),
        ...novExtra
      ]);
      return;
    }
    await c.query(hasNov ? LIQUIDACION_UPSERT.fullNov : LIQUIDACION_UPSERT.full, [
      ...base25,
      ...this.payrollRunExtM20(run),
      ...this.payrollRunExtIntereses(run),
      ...novExtra
    ]);
  }

  private async syncPayrollRuns(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const tier = await this.resolvePayrollLiquSchemaTier(c);
    const hasNov = await this.resolvePayrollLiquNovedadesCols(c);
    await this.deleteRowsNotInIncomingList(c, "liquidaciones_nomina", data);
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
   * Inserta borradores según periodicidad de pago y **fecha civil Colombia (Bogotá)**:
   * quincena 1–15 y 16–fin, catorcenal 1–14 y 15–fin, mensual fin de mes, semanal cortes de 7 días.
   * Solo genera cuando `referenceDate` coincide con día de **cierre** del corte (`payroll-cut-bogota`).
   */
  async generateAutomaticLiquidacionesForReferenceDate(
    reference: Date = new Date()
  ): Promise<{ created: number; skipped: number; messages: string[] }> {
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
               COALESCE(NULLIF(TRIM(periodicidad_pago), ''), 'Mensual') AS periodicidad_pago
        FROM empleados_nomina
        ORDER BY fecha_creacion ASC
      `);

      for (const row of empRes.rows) {
        const employeeId = String(row.id);
        const hireDate = parseSqlDate(row.fecha_ingreso);
        if (!hireDate) {
          skipped += 1;
          messages.push(`Empleado ${employeeId}: sin fecha ingreso válida`);
          continue;
        }

        const freq = normalizePayrollFrequency(String(row.periodicidad_pago));
        const cut = liquidationCutIfClosingToday(freq, by, bm0, bdom);
        if (!cut) {
          skipped += 1;
          continue;
        }

        const exists = await client.query(
          `SELECT 1 FROM liquidaciones_nomina WHERE id_empleado = $1::uuid AND periodo_mes = $2 LIMIT 1`,
          [employeeId, cut.periodKey]
        );
        if ((exists.rows?.length ?? 0) > 0) {
          skipped += 1;
          continue;
        }

        const abRes = await client.query(
          `
          SELECT id, id_empleado, tipo_ausencia, fecha_inicio::text AS fecha_inicio, fecha_fin::text AS fecha_fin, observaciones
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
            fechaInicio: fi,
            fechaFin: ff,
            observaciones: typeof a.observaciones === "string" ? a.observaciones : null
          });
        }

        let computed;
        try {
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
            cesantiasBaseInteresOpcional: cesBaseOpt
          });
        } catch (ex) {
          skipped += 1;
          const m = ex instanceof Error ? ex.message : String(ex);
          messages.push(`Empleado ${employeeId} (${row.nombre_completo}): ${m}`);
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
          solidarity: computed.solidarityDeduction,
          deductions: computed.totalDeducciones,
          net: gross - computed.totalDeducciones,
          paid: false,
          paidAt: null,
          approvedBy: null,
          payrollKind: "mensual",
          payPrimaServicios: payPrima,
          primaServiciosCop: payPrima ? primaCop : 0,
          primaServiciosDays: payPrima ? primaDays : null,
          settlementDetail: null,
          payInteresesCesantias: payInt,
          interesesCesantiasCop: payInt ? intCop : 0,
          cesantiasInterestBaseCop: payInt ? intBase : null,
          cesantiasInterestDays: payInt ? intDays : null,
          liquidacionOrigin: "automatica",
          noveltiesDetail: noveltyObj
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
        `Liquidaciones automáticas (ref. Bogotá ${by}-${String(bm0 + 1).padStart(2, "0")}-${String(bdom).padStart(2, "0")}): insertadas ${created}; omitidas ${skipped}.`
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
    return this.generateAutomaticLiquidacionesForReferenceDate(refDate);
  }

  /**
   * Alta directa en PostgreSQL (Historial → Combustible). No reemplaza toda la tabla.
   */
  async createFleetFuelLog(userId: string, role: JwtRole, body: Record<string, unknown>) {
    const permissionSet = this.isAdmin(role)
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.loadPortalPermissionSet(userId);
    if (!this.isAdmin(role) && !this.hasPortalPermission(permissionSet, "transport_history")) {
      throw new ForbiddenException();
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const saved = await this.upsertFleetFuelLogRow(client, body, userId);
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
  async createFleetMaintenanceLog(userId: string, role: JwtRole, body: Record<string, unknown>) {
    const permissionSet = this.isAdmin(role)
      ? new Set<string>(ALL_PORTAL_PERMISSIONS)
      : await this.loadPortalPermissionSet(userId);
    if (!this.isAdmin(role) && !this.hasPortalPermission(permissionSet, "transport_history")) {
      throw new ForbiddenException();
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const saved = await this.upsertFleetMaintenanceLogRow(client, body, userId);
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
        String(pickPortalField(raw, "driverName", "nombre_conductor") ?? "").trim() || "—",
        pickPortalField(raw, "tripNumber", "numero_viaje") || null,
        liters,
        totalCost,
        costPerLiter,
        raw.odometerKm != null || raw.kilometraje_odometro != null
          ? Number(raw.odometerKm ?? raw.kilometraje_odometro)
          : null,
        pickPortalField(raw, "station", "estacion") || null,
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
    const description = String(pickPortalField(raw, "description", "descripcion") ?? "").trim();
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

  private async syncHrKeys(c: PoolClient, key: PortalSyncKey, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    if (key === "positions") {
      await this.deleteRowsNotInIncomingList(c, "cargos", data);
      for (const raw of data) {
        const p = raw as Record<string, unknown>;
        if (!p?.id) continue;
        if (this.skipUnlessPersistUuid("syncHrKeys.positions", p.id)) continue;
        const integralRaw = pickPortalField(p, "integralSalary");
        const integral =
          integralRaw === true ||
          integralRaw === "true" ||
          (typeof integralRaw === "string" && integralRaw.toLowerCase() === "true");
        await c.query(
          `INSERT INTO cargos (id, nombre, rol_trabajador, salario_base_mensual, tipo_contrato_sugerido, fundamento_legal, activo, jornada_referencia, nivel_riesgo_arl, salario_integral)
           VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             nombre = EXCLUDED.nombre,
             rol_trabajador = EXCLUDED.rol_trabajador,
             salario_base_mensual = EXCLUDED.salario_base_mensual,
             tipo_contrato_sugerido = EXCLUDED.tipo_contrato_sugerido,
             fundamento_legal = EXCLUDED.fundamento_legal,
             activo = EXCLUDED.activo,
             jornada_referencia = EXCLUDED.jornada_referencia,
             nivel_riesgo_arl = EXCLUDED.nivel_riesgo_arl,
             salario_integral = EXCLUDED.salario_integral`,
          [
            p.id,
            p.name,
            p.workerRole || "empleado",
            Number(p.baseSalary) || 0,
            p.contractTypeDefault || "Indefinido",
            p.legalBasis || "",
            p.active !== false,
            (pickPortalField(p, "workSchedule") as string) || null,
            (pickPortalField(p, "arlRiskLevel") as string) || null,
            integral ? true : integralRaw === false || integralRaw === "false" ? false : null
          ]
        );
      }
      return;
    }
    if (key === "vacancies") {
      await this.deleteRowsNotInIncomingList(c, "vacantes", data);
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
            v.title,
            (pickPortalField(v, "department") as string) || null,
            v.city || "Bogota",
            (pickPortalField(v, "modality") as string) || null,
            (pickPortalField(v, "workday") as string) || null,
            v.deadline || new Date().toISOString().slice(0, 10),
            portalDateOrNull(pickPortalField(v, "publishedFrom", "visibleFrom")),
            cupos,
            Number(v.salaryOffer) || 0,
            (pickPortalField(v, "positionName") as string) || null,
            (pickPortalField(v, "workerRole") as string) || "empleado",
            (pickPortalField(v, "contractTypeDefault") as string) || null,
            (pickPortalField(v, "requirements") as string) || null,
            v.status || "Publicada"
          ]
        );
      }
      return;
    }
    if (key === "candidates") {
      await this.deleteRowsNotInIncomingList(c, "candidatos", data);
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
            x.name,
            x.email,
            x.phone,
            x.documentType,
            x.idDoc,
            portalDateOrNull(pickPortalField(x, "birthDate")),
            (pickPortalField(x, "educationLevel") as string) || null,
            (pickPortalField(x, "department") as string) || null,
            x.city || "Bogota",
            (pickPortalField(x, "address") as string) || null,
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
      await this.deleteRowsNotInIncomingList(c, "entrevistas", data);
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
            i.candidateName || "",
            i.when || new Date().toISOString(),
            i.interviewer || "RH",
            (pickPortalField(i, "modality", "mode") as string) || null,
            (pickPortalField(i, "locationOrLink", "place") as string) || null,
            (i.notes as string) || null
          ]
        );
      }
      return;
    }
    if (key === "contracts") {
      await this.deleteRowsNotInIncomingList(c, "contratos", data);
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
        await c.query(
          `INSERT INTO contratos (
            id, etiqueta_origen, tipo_persona_origen, id_candidato, nombre_candidato_denorm, id_empleado, nombre_empleado_denorm,
            rol_trabajador, id_cargo, nombre_cargo_denorm, salario_pactado, fecha_inicio, id_empresa, nombre_empresa_denorm,
            tipo_contrato, tipo_plantilla_word, documento_identidad_snapshot, eps, fondo_pension, arl, jornada_turno,
            texto_contenido_resumen
          ) VALUES (
            $1::uuid, $2, $3, $4::uuid, $5, $6::uuid, $7, $8, $9::uuid, $10, $11, $12::date, $13::uuid, $14,
            $15, $16, $17, $18, $19, $20, $21, $22
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
            id_empresa = EXCLUDED.id_empresa,
            nombre_empresa_denorm = EXCLUDED.nombre_empresa_denorm,
            tipo_contrato = EXCLUDED.tipo_contrato,
            tipo_plantilla_word = EXCLUDED.tipo_plantilla_word,
            documento_identidad_snapshot = EXCLUDED.documento_identidad_snapshot,
            eps = EXCLUDED.eps,
            fondo_pension = EXCLUDED.fondo_pension,
            arl = EXCLUDED.arl,
            jornada_turno = EXCLUDED.jornada_turno,
            texto_contenido_resumen = EXCLUDED.texto_contenido_resumen`,
          [
            row.id,
            (pickPortalField(row, "sourceTag", "source") as string) || null,
            (pickPortalField(row, "personType") as string) || (employeeId ? "Empleado" : "Candidato"),
            candRaw || null,
            (pickPortalField(row, "candidateName") as string) || "",
            employeeId || null,
            (pickPortalField(row, "employeeName") as string) || "",
            String(pickPortalField(row, "workerRole") || "empleado").toLowerCase(),
            positionId,
            (pickPortalField(row, "positionName", "position") as string) || "",
            Number(pickPortalField(row, "salary")) || 0,
            pickPortalField(row, "startDate") || new Date().toISOString().slice(0, 10),
            companyId,
            (pickPortalField(row, "companyName") as string) || "",
            (pickPortalField(row, "contractType") as string) || "Indefinido",
            (pickPortalField(row, "templateKind", "contractTemplateKind") as string) || "oficina",
            (pickPortalField(row, "idDocSnapshot") as string) || null,
            (pickPortalField(row, "eps") as string) || "Sura",
            (pickPortalField(row, "pensionFund") as string) || "Porvenir",
            (pickPortalField(row, "arl") as string) || "Sura",
            (pickPortalField(row, "schedule", "workSchedule") as string) || "Diurna",
            (pickPortalField(row, "content") as string) || null
          ]
        );
      }
    }
  }

  private async syncHrAbsences(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    await this.deleteRowsNotInIncomingList(c, "ausencias_laborales", data);
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
      await c.query(
        `INSERT INTO ausencias_laborales (
          id, id_empleado, nombre_empleado, tipo_ausencia, fecha_inicio, fecha_fin, dias_calendario,
          numero_soporte, entidad_eps, observaciones
        ) VALUES ($1::uuid, $2::uuid, $3, $4, $5::date, $6::date, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          id_empleado = EXCLUDED.id_empleado,
          nombre_empleado = EXCLUDED.nombre_empleado,
          tipo_ausencia = EXCLUDED.tipo_ausencia,
          fecha_inicio = EXCLUDED.fecha_inicio,
          fecha_fin = EXCLUDED.fecha_fin,
          dias_calendario = EXCLUDED.dias_calendario,
          numero_soporte = EXCLUDED.numero_soporte,
          entidad_eps = EXCLUDED.entidad_eps,
          observaciones = EXCLUDED.observaciones`,
        [
          row.id,
          row.employeeId,
          row.employeeName,
          tipo,
          row.startDate,
          row.endDate,
          dias,
          (pickPortalField(row, "supportNumber") as string) || null,
          (pickPortalField(row, "epsEntity") as string) || null,
          (row.notes as string) || null
        ]
      );
    }
  }

  private async syncSst(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    await this.deleteRowsNotInIncomingList(c, "registros_cumplimiento_sst", data);
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
          row.employeeName,
          row.recordType,
          row.provider,
          row.expiryDate,
          row.status || "Pendiente",
          row.documentCode || null,
          row.notes || null,
          row.createdBy || "Portal"
        ]
      );
    }
  }

  private async syncTripRouteRates(c: PoolClient, data: unknown) {
    if (!data || typeof data !== "object") throw new ForbiddenException();
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
        [resolvedId, row.od, row.oc, row.dd, row.dc, row.cop, idsPg]
      );
    }
    if (keepIds.size) {
      await c.query(`DELETE FROM tarifas_trayecto WHERE NOT (id = ANY($1::uuid[]))`, [[...keepIds]]);
    } else {
      await c.query(`DELETE FROM tarifas_trayecto`);
    }
  }

  private async syncApprovals(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const admin = this.isAdmin(role);
    for (const a of data) {
      if (!a?.id) continue;
      if (this.skipUnlessPersistUuid("syncApprovals", a.id)) continue;
      if (!admin && String(a.requestedByUserId) !== userId) throw new ForbiddenException();
      const reqBy = a.requestedByUserId || userId;
      if (this.skipUnlessPersistUuid("syncApprovals.requestedByUserId", reqBy)) continue;
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
          a.title,
          JSON.stringify(payload),
          a.status || "pendiente",
          reqBy,
          a.requestedByName || "",
          a.reviewedAt || null,
          a.reviewedBy || null,
          a.rejectionReason || null
        ]
      );
    }
  }
}
