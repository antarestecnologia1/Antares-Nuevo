import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { randomBytes, randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import { timestamptzStringColombiaNow } from "../common/colombia-time";
import {
  normalizeDbText,
  normalizeDbTextUpper,
  normalizePersonTypeForDb
} from "../common/normalize-db-text";
import { normalizeSupabaseProjectUrl } from "../common/normalize-supabase-url";
import {
  normalizeDatabaseUrl,
  SUPABASE_POOLER_TENANT_ERROR_HELP
} from "../database/normalize-database-url";
import { PG_POOL } from "../database/database.module";
import { MailService } from "../mail/mail.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RegisterPortalDto } from "./dto/register-portal.dto";
import { RequestPasswordRecoveryDto } from "./dto/request-password-recovery.dto";
import { TurnstileService } from "./turnstile.service";

/** Valores del ENUM rol_usuario en BD/postgres/02_enums.sql */
const ROLE_REGISTER_TO_DB: Record<string, string> = {
  ADMIN: "admin",
  CLIENT: "client",
  RRHH: "rrhh"
};

/** Si `PORTAL_PUBLIC_URL` falta o apunta a localhost, los correos de Supabase usarán este origen. */
const DEFAULT_PORTAL_PUBLIC_ORIGIN = "https://www.transportesantares.co";

type UsuarioRow = {
  id: string;
  correo_electronico: string;
  hash_contrasena: string;
  nombre_completo: string;
  rol: string;
  estado_cuenta: string;
  refresh_token_hash: string | null;
};

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

/** Errores de red/TLS/pooler que `pg` no codifica como ECONNREFUSED / 28P01. */
function mapSupabaseOrNetworkDbError(err: unknown): ServiceUnavailableException | null {
  const e = err as { code?: string; message?: string; detail?: string } | null | undefined;
  if (!e) return null;
  const code = String(e.code ?? "");
  const message = String(e.message ?? "");
  const detail = String(e.detail ?? "");
  const lower = `${message} ${detail}`.toLowerCase();

  if (
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
    code === "CERT_HAS_EXPIRED" ||
    code === "ERR_SSL_SSLV3_ALERT_BAD_CERTIFICATE" ||
    /ssl|tls/i.test(code) ||
    (lower.includes("ssl") && (lower.includes("error") || lower.includes("routine"))) ||
    lower.includes("self signed certificate") ||
    lower.includes("certificate verify failed") ||
    lower.includes("wrong version number")
  ) {
    return new ServiceUnavailableException(
      "Error SSL/TLS al conectar con Postgres. Use la URI exacta del panel Supabase (Settings → Database → Connection string). Si la contraseña tiene @ # % &, codifíquela en la URL. Pruebe conexión directa (puerto 5432, host db.xxx.supabase.co) si el pooler (6543) falla."
    );
  }

  if (
    lower.includes("tenant or user not found") ||
    lower.includes("could not find tenant") ||
    (lower.includes("user") && lower.includes("not found") && lower.includes("pooler"))
  ) {
    return new ServiceUnavailableException(SUPABASE_POOLER_TENANT_ERROR_HELP);
  }

  if (lower.includes("max clients") || lower.includes("too many connections") || code === "53300") {
    return new ServiceUnavailableException(
      "Límite de conexiones en Postgres. Use Session pooler o conexión directa en Supabase, o reduzca el tamaño del pool en la API."
    );
  }

  if (
    code === "EPIPE" ||
    code === "ESOCKETTIMEDOUT" ||
    lower.includes("connection terminated unexpectedly") ||
    lower.includes("server closed the connection unexpectedly")
  ) {
    return new ServiceUnavailableException(
      "La conexión a Postgres se cerró antes de tiempo. Revise DATABASE_URL, que Supabase permita conexiones externas y pruebe Direct connection si el pooler da timeouts."
    );
  }

  if (/password authentication failed/i.test(lower) && code !== "28P01") {
    return new ServiceUnavailableException(
      "PostgreSQL rechazó la contraseña. Confirme la contraseña en Supabase (Database password). Si la URL está mal formada (p. ej. @ en la contraseña sin codificar), corrija o codifique la contraseña."
    );
  }

  if (
    /econnrefused|etimedout|enotfound|eai_again|enetunreach|ehostunreach|getaddrinfo|socket hang up|connect timed out|connection refused/i.test(
      lower
    )
  ) {
    return new ServiceUnavailableException(
      "No se pudo establecer conexión TCP con Postgres. Revise DATABASE_URL en Render (host/puerto), firewall de Supabase (Allow all), pruebe Direct connection (5432) o Session pooler en Supabase."
    );
  }

  return null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly supabaseAdmin;
  /** Cliente para `signInWithOtp` (correo enviado por GoTrue). Prefiere anon key si existe. */
  private readonly supabaseOtpMailer: ReturnType<typeof createClient> | null;
  private readonly supabaseEnabled: boolean;

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly turnstile: TurnstileService
  ) {
    const url = normalizeSupabaseProjectUrl(this.config.get<string>("SUPABASE_URL"));
    const key = (this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();
    this.supabaseEnabled = Boolean(url && key);
    this.supabaseAdmin = this.supabaseEnabled ? createClient(url, key) : null;
    const anonKey = (
      this.config.get<string>("SUPABASE_ANON_KEY") ??
      this.config.get<string>("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
      ""
    ).trim();
    this.supabaseOtpMailer =
      this.supabaseEnabled && url ? createClient(url, anonKey || key) : null;
  }

  /** Sin Postgres no hay registro ni sesión (solo JWT es insuficiente). */
  private assertDatabaseConfigured(): void {
    const dbUrl = normalizeDatabaseUrl(this.config.get<string>("DATABASE_URL") ?? "");
    if (!dbUrl) {
      throw new ServiceUnavailableException(
        "DATABASE_URL no configurada en el servidor (cadena Postgres desde Supabase → Database → URI, en Render o apps/api/.env)."
      );
    }
  }

  async register(dto: RegisterDto) {
    this.assertDatabaseConfigured();
    if (dto.role !== "CLIENT") {
      throw new BadRequestException("El registro público solo permite cuentas de cliente.");
    }
    const email = dto.email.trim().toLowerCase();
    const exists = await this.pool.query(`SELECT 1 FROM usuarios WHERE lower(correo_electronico) = lower($1)`, [
      email
    ]);
    if (exists.rowCount && exists.rowCount > 0) {
      throw new BadRequestException("El correo ya está registrado");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const rolDb = ROLE_REGISTER_TO_DB[dto.role] ?? "client";

    const inserted = await this.pool.query<{ id: string }>(
      `INSERT INTO usuarios (
        correo_electronico, hash_contrasena, nombre_completo, rol, estado_cuenta
      ) VALUES (
        $1, $2, $3, $4::rol_usuario, 'pendiente'::estado_cuenta_usuario
      ) RETURNING id::text AS id`,
      [email, passwordHash, normalizeDbTextUpper(dto.name) ?? email, rolDb]
    );
    const newId = inserted.rows[0]?.id;
    if (newId) {
      void this.sendRegistrationWelcomeEmail(email, dto.name.trim(), newId);
      void this.mail
        .sendAdminNewPendingRegistrationAlert({
          applicantEmail: email,
          applicantName: dto.name.trim() || email,
          registrationKind: "cliente",
          portalUrl: this.portalPublicBaseUrl()
        })
        .catch(() => null);
    }

    return {
      pendingApproval: true,
      message:
        "Su solicitud de registro fue recibida correctamente. Un administrador revisará y aprobará su cuenta antes de que pueda ingresar al portal. Hemos enviado un correo a la dirección indicada con la confirmación y el enlace al sitio; si no lo recibe en unos minutos, revise spam o filtros de su organización."
    };
  }

  async registerPortal(dto: RegisterPortalDto) {
    let authUserId: string | null = null;
    /** Solo limpiar Auth en Supabase si el usuario fue creado allí; con UUID local no hay nada que borrar. */
    let supabaseUserCreated = false;
    try {
      await this.turnstile.assertValid(dto.turnstileToken);
      if (!dto.acceptTerms) {
        throw new BadRequestException("Debes aceptar términos y tratamiento de datos");
      }
      this.assertDatabaseConfigured();
      this.assertStrongPassword(dto.password);
      const email = dto.email.trim().toLowerCase();
      const exists = await this.pool.query(`SELECT 1 FROM usuarios WHERE lower(correo_electronico) = lower($1)`, [
        email
      ]);
      if (exists.rowCount && exists.rowCount > 0) {
        throw new BadRequestException("El correo ya está registrado");
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const firstName = normalizeDbTextUpper(dto.firstName) ?? "";
      const middleName = normalizeDbTextUpper(dto.middleName);
      const lastName = normalizeDbTextUpper(dto.lastName) ?? "";
      const secondLastName = normalizeDbTextUpper(dto.secondLastName);
      const fullName = [firstName, middleName, lastName, secondLastName]
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .join(" ");

      const docType = String(dto.documentType || "").trim().toUpperCase();
      let numeroPersonal: string | null = null;
      let nitEmpresa: string | null = null;
      if (docType === "NIT") {
        nitEmpresa = normalizeDbTextUpper(dto.companyNit) || normalizeDbTextUpper(dto.taxId);
        numeroPersonal = normalizeDbTextUpper(dto.personalTaxId);
        if (!nitEmpresa || !numeroPersonal) {
          throw new BadRequestException("Indique NIT de empresa y cédula del usuario.");
        }
      } else {
        numeroPersonal = normalizeDbTextUpper(dto.taxId);
        if (!numeroPersonal) {
          throw new BadRequestException("Indique el número de documento.");
        }
      }

      const regAtColombia = timestamptzStringColombiaNow();
      const vinculoDb: "cliente" | "empleado_interno" =
        String(dto.registrationKind || "").trim().toLowerCase() === "empleado_interno"
          ? "empleado_interno"
          : "cliente";

      /** Auditoría alineada al copy legal del formulario (#form-register): términos, privacidad y Habeas en un solo checkbox. */
      const checklist: Record<string, unknown> = {
        idVerified: true,
        acceptedTermsAt: regAtColombia,
        requiredFieldsCompleted: true,
        termsOfUseAccepted: true,
        privacyPolicyAccepted: true,
        habeasDataAcknowledged: true,
        registrationKind: vinculoDb
      };
      if (docType === "NIT" && dto.personalDocumentType) {
        checklist.representativeDocumentType = String(dto.personalDocumentType).trim().toUpperCase();
      }

      try {
        const dupPersonal = await this.pool.query(
          `SELECT 1 FROM usuarios WHERE lower(trim(numero_identificacion)) = lower(trim($1))`,
          [numeroPersonal]
        );
        if (dupPersonal.rowCount && dupPersonal.rowCount > 0) {
          throw new BadRequestException(
            "Ya existe un usuario con ese documento personal (cédula o identificación)."
          );
        }
      } catch (err: any) {
        const msg = String(err?.message || "").toLowerCase();
        // Compatibilidad con esquemas antiguos que aún no tengan numero_identificacion.
        const legacyMissingColumn = String(err?.code || "") === "42703" && msg.includes("numero_identificacion");
        if (!legacyMissingColumn) throw err;
      }

      const localUserId = randomUUID();
      authUserId = localUserId;
      if (this.supabaseEnabled && this.supabaseAdmin) {
        try {
          authUserId = await this.createSupabaseAuthUser(email, dto.password, fullName || dto.email, localUserId);
          supabaseUserCreated = true;
        } catch (syncErr: unknown) {
          if (this.isSupabaseAuthEmailConflict(syncErr)) {
            throw syncErr instanceof HttpException
              ? syncErr
              : new BadRequestException(String((syncErr as Error)?.message || syncErr));
          }
          const msg = this.extractExceptionMessage(syncErr);
          this.logger.warn(
            `registerPortal: Supabase Auth no sincronizado (${sanitizeLogText(msg)}). Registro continúa en Postgres con id=${localUserId}.`
          );
          authUserId = localUserId;
          supabaseUserCreated = false;
        }
      }

      try {
        await this.pool.query(
          `INSERT INTO usuarios (
            id, correo_electronico, hash_contrasena, nombre_completo, rol, estado_cuenta,
            primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
            tipo_persona, tipo_documento, numero_identificacion, nit_empresa_registro, fecha_expedicion_documento,
            fecha_nacimiento, genero, cargo_registro, area_trabajo, telefono,
            departamento, ciudad, direccion,
            fecha_creacion, fecha_actualizacion, fecha_aceptacion_terminos,
            tipo_vinculo_registro,
            checklist_registro_json
          ) VALUES (
            $1::uuid, $2, $3, $4, 'client'::rol_usuario, 'pendiente'::estado_cuenta_usuario,
            $5, $6, $7, $8, $9, $10, $11, $12, NULL::date,
            $13::date, $14, $15, $16, $17, $18, $19, $20,
            $23::timestamptz, $23::timestamptz, $23::timestamptz,
            $21::tipo_vinculo_registro,
            $22::jsonb
          )
          ON CONFLICT (id) DO UPDATE SET
            correo_electronico = EXCLUDED.correo_electronico,
            hash_contrasena = EXCLUDED.hash_contrasena,
            nombre_completo = EXCLUDED.nombre_completo,
            primer_nombre = EXCLUDED.primer_nombre,
            segundo_nombre = EXCLUDED.segundo_nombre,
            primer_apellido = EXCLUDED.primer_apellido,
            segundo_apellido = EXCLUDED.segundo_apellido,
            tipo_persona = EXCLUDED.tipo_persona,
            tipo_documento = EXCLUDED.tipo_documento,
            numero_identificacion = EXCLUDED.numero_identificacion,
            nit_empresa_registro = EXCLUDED.nit_empresa_registro,
            fecha_nacimiento = EXCLUDED.fecha_nacimiento,
            genero = EXCLUDED.genero,
            cargo_registro = EXCLUDED.cargo_registro,
            area_trabajo = EXCLUDED.area_trabajo,
            telefono = EXCLUDED.telefono,
            departamento = EXCLUDED.departamento,
            ciudad = EXCLUDED.ciudad,
            direccion = EXCLUDED.direccion,
            fecha_creacion = EXCLUDED.fecha_creacion,
            fecha_actualizacion = EXCLUDED.fecha_actualizacion,
            fecha_aceptacion_terminos = EXCLUDED.fecha_aceptacion_terminos,
            tipo_vinculo_registro = EXCLUDED.tipo_vinculo_registro,
            checklist_registro_json = EXCLUDED.checklist_registro_json`,
          [
            authUserId,
            email,
            passwordHash,
            fullName || dto.email,
            firstName || null,
            middleName,
            lastName || null,
            secondLastName,
            normalizePersonTypeForDb(dto.personType),
            normalizeDbTextUpper(dto.documentType),
            numeroPersonal,
            nitEmpresa,
            dto.birthDate || null,
            normalizeDbTextUpper(dto.gender),
            normalizeDbTextUpper(dto.position),
            normalizeDbTextUpper(dto.workArea),
            normalizeDbTextUpper(dto.phone),
            normalizeDbText(dto.department),
            normalizeDbText(dto.city),
            normalizeDbTextUpper(dto.address),
            vinculoDb,
            JSON.stringify(checklist),
            regAtColombia
          ]
        );
      } catch (err: any) {
        const missingColumnError = String(err?.code || "") === "42703";
        // Compatibilidad con esquemas antiguos: si falta cualquier columna de registro extendido,
        // hacemos inserción mínima para no romper el flujo de alta.
        if (missingColumnError) {
          try {
            await this.pool.query(
              `INSERT INTO usuarios (
                id, correo_electronico, hash_contrasena, nombre_completo, rol, estado_cuenta,
                tipo_persona, tipo_documento, numero_identificacion, telefono,
                fecha_nacimiento, genero, cargo_registro, area_trabajo, departamento, ciudad, direccion,
                tipo_vinculo_registro,
                fecha_aceptacion_terminos
              ) VALUES (
                $1::uuid, $2, $3, $4, 'client'::rol_usuario, 'pendiente'::estado_cuenta_usuario,
                $5, $6, $7, $8, $9::date, $10, $11, $12, $13, $14, $15,
                $16::tipo_vinculo_registro,
                $17::timestamptz
              )
              ON CONFLICT (id) DO UPDATE SET
                correo_electronico = EXCLUDED.correo_electronico,
                hash_contrasena = EXCLUDED.hash_contrasena,
                nombre_completo = EXCLUDED.nombre_completo,
                tipo_persona = EXCLUDED.tipo_persona,
                tipo_documento = EXCLUDED.tipo_documento,
                numero_identificacion = EXCLUDED.numero_identificacion,
                telefono = EXCLUDED.telefono,
                fecha_nacimiento = EXCLUDED.fecha_nacimiento,
                genero = EXCLUDED.genero,
                cargo_registro = EXCLUDED.cargo_registro,
                area_trabajo = EXCLUDED.area_trabajo,
                departamento = EXCLUDED.departamento,
                ciudad = EXCLUDED.ciudad,
                direccion = EXCLUDED.direccion,
                tipo_vinculo_registro = EXCLUDED.tipo_vinculo_registro,
                fecha_aceptacion_terminos = EXCLUDED.fecha_aceptacion_terminos`,
              [
                authUserId,
                email,
                passwordHash,
                fullName || dto.email,
                normalizePersonTypeForDb(dto.personType),
                normalizeDbTextUpper(dto.documentType),
                numeroPersonal,
                normalizeDbTextUpper(dto.phone),
                dto.birthDate || null,
                normalizeDbTextUpper(dto.gender),
                normalizeDbTextUpper(dto.position),
                normalizeDbTextUpper(dto.workArea),
                normalizeDbText(dto.department),
                normalizeDbText(dto.city),
                normalizeDbTextUpper(dto.address),
                vinculoDb,
                regAtColombia
              ]
            );
            // Intentar persistir checklist si existe la columna.
            await this.pool
              .query(`UPDATE usuarios SET checklist_registro_json = $2::jsonb WHERE id = $1::uuid`, [
                authUserId,
                JSON.stringify(checklist)
              ])
              .catch(() => null);
          } catch (retryErr: any) {
            const retryMissingColumn = String(retryErr?.code || "") === "42703";
            if (retryMissingColumn) {
              try {
                // Último fallback: inserción mínima compatible con esquemas muy antiguos.
                await this.pool.query(
                  `INSERT INTO usuarios (
                    id, correo_electronico, hash_contrasena, nombre_completo, rol, estado_cuenta
                  ) VALUES (
                    $1::uuid, $2, $3, $4, 'client'::rol_usuario, 'pendiente'::estado_cuenta_usuario
                  )
                  ON CONFLICT (id) DO UPDATE SET
                    correo_electronico = EXCLUDED.correo_electronico,
                    hash_contrasena = EXCLUDED.hash_contrasena,
                    nombre_completo = EXCLUDED.nombre_completo`,
                  [authUserId, email, passwordHash, fullName || dto.email]
                );
              } catch (minimalErr: any) {
                if (supabaseUserCreated) await this.deleteSupabaseAuthUser(authUserId);
                throw new BadRequestException("No fue posible completar el registro en base de datos.");
              }
            } else {
              if (supabaseUserCreated) await this.deleteSupabaseAuthUser(authUserId);
              throw new BadRequestException("No fue posible completar el registro en base de datos.");
            }
          }
        } else {
          if (supabaseUserCreated) await this.deleteSupabaseAuthUser(authUserId);
          throw new BadRequestException("No fue posible completar el registro en base de datos.");
        }
      }

      if (authUserId) {
        void this.sendRegistrationWelcomeEmail(email, fullName || dto.email, authUserId);
        void this.mail
          .sendAdminNewPendingRegistrationAlert({
            applicantEmail: email,
            applicantName: fullName || dto.email,
            registrationKind: vinculoDb,
            portalUrl: this.portalPublicBaseUrl()
          })
          .catch(() => null);
      }

      return {
        pendingApproval: true,
        message:
          "Su solicitud de registro fue recibida correctamente. Un administrador revisará y aprobará su cuenta antes de que pueda ingresar al portal. Hemos enviado un correo a la dirección indicada con la confirmación y el enlace al sitio; si no lo recibe en unos minutos, revise spam o filtros de su organización."
      };
    } catch (err: any) {
      if (supabaseUserCreated && authUserId) {
        await this.deleteSupabaseAuthUser(authUserId);
      }
      if (err instanceof HttpException) throw err;

      const code = String(err?.code ?? "");
      const pgMsg = String(err?.message ?? "");
      const detail = String(err?.detail ?? "");
      this.logger.error(
        `registerPortal unexpected error code=${code || "n/a"} message=${sanitizeLogText(pgMsg)} detail=${sanitizeLogText(detail)}`
      );

      const poolerMapped = mapSupabaseOrNetworkDbError(err);
      if (poolerMapped) throw poolerMapped;

      if (code === "23505" || /duplicate key/i.test(pgMsg)) {
        throw new BadRequestException("El correo o documento ya está registrado.");
      }
      if (code === "42P01") {
        throw new ServiceUnavailableException("La base de datos no está inicializada para registro de usuarios.");
      }
      if (code === "42703") {
        throw new ServiceUnavailableException(
          "La base de datos está desactualizada. Ejecuta los scripts de BD pendientes y reintenta."
        );
      }

      /** Errores de red / Node al conectar a Postgres (Render ↔ Supabase/Postgres). */
      if (
        ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN", "ECONNRESET", "ENETUNREACH", "EHOSTUNREACH"].includes(code)
      ) {
        throw new ServiceUnavailableException(
          code === "ENETUNREACH" || code === "EHOSTUNREACH"
            ? "No se alcanza Postgres por red (IPv6/IPv4). La API ya fuerza IPv4 en el arranque; si persiste, en Render añada NODE_OPTIONS=--dns-result-order=ipv4first o use en Supabase la URI del Session pooler. Revise DATABASE_URL y firewall de Supabase."
            : "No hay conexión a la base de datos. Verifique DATABASE_URL en Render (sin espacios), que la BD acepte conexiones externas y SSL; en Supabase use la cadena del panel (pool session/direct si el pool transaccional falla)."
        );
      }

      if (code === "28P01") {
        throw new ServiceUnavailableException(
          "PostgreSQL rechazó usuario o contraseña (DATABASE_URL incorrecta o contraseña con caracteres que rompen la URL)."
        );
      }
      if (code === "3D000") {
        throw new ServiceUnavailableException("La base de datos indicada en DATABASE_URL no existe.");
      }
      if (code === "08006" || code === "08001" || code === "57P03") {
        throw new ServiceUnavailableException("PostgreSQL no aceptó la conexión (servicio caído, reinicio o límite de conexiones).");
      }
      if (code === "53300") {
        throw new ServiceUnavailableException("Demasiadas conexiones a PostgreSQL; reduzca el pool o actualice el plan.");
      }

      const sqlStateMatch = pgMsg.match(/\b([0-9A-Z]{5})\b/);
      const sqlState =
        code && /^[0-9A-Z]{5}$/.test(code) ? code : sqlStateMatch?.[1] && /^[0-9A-Z]{5}$/.test(sqlStateMatch[1]) ? sqlStateMatch[1] : "";
      const alreadyHandled = new Set([
        "23505",
        "28P01",
        "3D000",
        "42P01",
        "42703",
        "08006",
        "08001",
        "57P03",
        "53300"
      ]);
      if (sqlState && !alreadyHandled.has(sqlState)) {
        if (sqlState === "XX000") {
          const again = mapSupabaseOrNetworkDbError(err);
          if (again) throw again;
          throw new ServiceUnavailableException(
            `PostgreSQL XX000 (error interno). ${detail ? String(detail).slice(0, 280) : pgMsg.slice(0, 200)} Si usa el pooler de Supabase, confirme la URI del panel; si el texto habla de tenant o usuario, vea la variable DATABASE_URL (pooler: usuario postgres.PROJECT_REF; directo: db.xxx.supabase.co:5432, usuario postgres).`
          );
        }
        if (["23502", "23514", "23P01"].includes(sqlState)) {
          throw new ServiceUnavailableException(
            `Datos incumplen restricciones en la base (${sqlState}). Revise longitudes de campos y scripts BD/postgres. ${detail ? String(detail).slice(0, 220) : ""}`
          );
        }
        if (sqlState === "22P02" || sqlState === "22001") {
          throw new ServiceUnavailableException(
            `Formato inválido para PostgreSQL (${sqlState}). Revise fechas y textos. ${detail ? String(detail).slice(0, 180) : ""}`
          );
        }
        if (sqlState === "42501") {
          throw new ServiceUnavailableException(
            "Permiso denegado en PostgreSQL. Use la URI con usuario postgres y contraseña de Database en Supabase."
          );
        }
        throw new ServiceUnavailableException(
          `Error PostgreSQL ${sqlState}. Ejecute los scripts BD/postgres sobre la base y revise logs de Render. ${detail ? String(detail).slice(0, 140) : pgMsg.slice(0, 100)}`
        );
      }

      throw new ServiceUnavailableException(
        "No fue posible procesar el registro. Revise DATABASE_URL (misma URI que en Supabase → Database, sin comillas) y los logs de Render. Pooler 6543: usuario postgres.<ref_proyecto>; directo 5432: usuario postgres. Contraseña con @ u otros símbolos: codifíquela en la URL."
      );
    }
  }

  async login(dto: LoginDto) {
    await this.turnstile.assertValid(dto.turnstileToken);
    this.assertDatabaseConfigured();
    const email = dto.email.trim().toLowerCase();
    const res = await this.pool.query<UsuarioRow>(
      `SELECT id::text, correo_electronico, hash_contrasena, nombre_completo,
              rol::text AS rol, estado_cuenta::text AS estado_cuenta, refresh_token_hash
       FROM usuarios WHERE lower(btrim(correo_electronico::text)) = $1`,
      [email]
    );

    const user = res.rows[0];
    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const valid = await bcrypt.compare(dto.password, user.hash_contrasena);
    if (!valid) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    if (user.estado_cuenta !== "aprobado") {
      throw new UnauthorizedException(
        "Tu cuenta está pendiente de aprobación o inactiva. Contacta al administrador."
      );
    }

    const jwtRole = String(user.rol || "client").toLowerCase();
    const tokens = await this.generateTokens(user.id, user.correo_electronico, jwtRole);
    const refreshHash = await this.storeRefreshToken(user.id, tokens.refreshToken);
    await this.persistUserSession(user.id, refreshHash, tokens.refreshToken);
    return tokens;
  }

  async refresh(userId: string, refreshToken: string) {
    this.assertDatabaseConfigured();
    const res = await this.pool.query<UsuarioRow>(
      `SELECT id::text, correo_electronico, rol::text AS rol, estado_cuenta::text AS estado_cuenta,
              refresh_token_hash
       FROM usuarios WHERE id = $1::uuid`,
      [userId]
    );
    const user = res.rows[0];
    if (!user?.refresh_token_hash) {
      throw new UnauthorizedException("Refresh token inválido");
    }

    if (user.estado_cuenta !== "aprobado") {
      throw new UnauthorizedException(
        "Tu cuenta está pendiente de aprobación o inactiva. Contacta al administrador."
      );
    }

    const ok = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!ok) {
      throw new UnauthorizedException("Refresh token inválido");
    }

    const jwtRole = String(user.rol || "client").toLowerCase();
    const tokens = await this.generateTokens(user.id, user.correo_electronico, jwtRole);
    const refreshHash = await this.storeRefreshToken(user.id, tokens.refreshToken);
    await this.persistUserSession(user.id, refreshHash, tokens.refreshToken);
    return tokens;
  }

  /**
   * Confirma recuperación iniciada por correo de Supabase Auth: valida el JWT de recuperación,
   * actualiza la contraseña en Auth (service role) y el bcrypt en `usuarios` (por `id`, o por correo como respaldo).
   * Invalida `refresh_token_hash` para que el siguiente login exija credenciales nuevas;
   * antes de responder comprueba con `bcrypt.compare` el valor devuelto por el `UPDATE` (consistencia inmediata con `POST /auth/login`).
   */
  async completePasswordRecoveryFromSupabase(supabaseAccessToken: string, newPassword: string) {
    this.assertDatabaseConfigured();
    if (!this.supabaseAdmin) {
      throw new ServiceUnavailableException(
        "Recuperación por correo no está disponible: falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el servidor."
      );
    }
    this.assertStrongPassword(newPassword);

    const { data, error } = await this.supabaseAdmin.auth.getUser(supabaseAccessToken);
    const user = data?.user;
    if (error || !user?.id || !user.email) {
      this.logger.warn(
        `completePasswordRecoveryFromSupabase: getUser falló: ${sanitizeLogText(error?.message || "sin usuario")}`
      );
      throw new UnauthorizedException("Enlace de recuperación inválido o expirado. Solicite un correo nuevo.");
    }

    const email = user.email.trim().toLowerCase();
    const supabaseAuthId = String(user.id);

    const { error: updAuthErr } = await this.supabaseAdmin.auth.admin.updateUserById(supabaseAuthId, {
      password: newPassword
    });
    if (updAuthErr) {
      this.logger.error(`Supabase admin.updateUserById (recovery): ${sanitizeLogText(updAuthErr.message)}`);
      throw new BadRequestException("No fue posible actualizar la contraseña en el servicio de autenticación.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    /** Sesiones API previas invalidadas de inmediato; login usa sólo esta fila. */
    let persisted = await this.pool.query<{ hash_contrasena: string }>(
      `UPDATE usuarios
       SET hash_contrasena = $1, refresh_token_hash = NULL, fecha_actualizacion = now()
       WHERE id = $2::uuid
       RETURNING hash_contrasena`,
      [passwordHash, supabaseAuthId]
    );
    if (!persisted.rowCount) {
      persisted = await this.pool.query<{ hash_contrasena: string }>(
        `UPDATE usuarios
         SET hash_contrasena = $1, refresh_token_hash = NULL, fecha_actualizacion = now()
         WHERE lower(btrim(correo_electronico::text)) = $2
         RETURNING hash_contrasena`,
        [passwordHash, email]
      );
    }
    if (!persisted.rowCount || !persisted.rows[0]?.hash_contrasena) {
      throw new BadRequestException(
        "No hay una cuenta de portal asociada a este correo. Si su acceso es antiguo, contacte al administrador."
      );
    }

    const hashOk = await bcrypt.compare(newPassword, persisted.rows[0].hash_contrasena);
    if (!hashOk) {
      this.logger.error(
        `completePasswordRecoveryFromSupabase: verificación del hash tras UPDATE falló (correo=${redactEmailForLog(email)})`
      );
      throw new ServiceUnavailableException(
        "La contraseña no pudo validarse después de guardarla. Espere unos segundos e intente recuperarla de nuevo, o contacte a soporte."
      );
    }

    void this.mail
      .sendSecurityPasswordChangedAlert({
        to: email,
        recipientName: user.user_metadata?.full_name || email,
        changedByAdmin: false
      })
      .catch(() => null);

    return {
      message:
        "Contraseña actualizada correctamente. Cierre cualquier sesión anterior e inicie sesión con la nueva contraseña."
    };
  }

  /**
   * Dispara el correo de recuperación usando la API (misma instancia Supabase que el registro).
   * Evita fallar cuando el navegador no carga @supabase/supabase-js desde el CDN.
   */
  async requestPasswordRecovery(dto: RequestPasswordRecoveryDto) {
    await this.turnstile.assertValid(dto.turnstileToken);
    this.assertDatabaseConfigured();
    if (!this.supabaseAdmin) {
      throw new ServiceUnavailableException(
        "Recuperación por correo no está disponible: configure SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en la API."
      );
    }
    const email = dto.email.trim().toLowerCase();
    const st = await this.pool.query<{ s: string; id: string }>(
      `SELECT estado_cuenta::text AS s, id::text AS id FROM usuarios WHERE lower(btrim(correo_electronico::text)) = $1 LIMIT 1`,
      [email]
    );
    const row = st.rows[0];
    if (!row) {
      throw new BadRequestException(
        "No encontramos ese correo en el portal. Revise espacios al inicio o final y use exactamente el correo del registro."
      );
    }
    if (row.s !== "aprobado") {
      throw new BadRequestException(
        "Su cuenta aún no está aprobada. Cuando un administrador la active, podrá usar «recuperar contraseña»."
      );
    }

    const portalUserId = String(row.id || "");
    if (!portalUserId) {
      throw new BadRequestException("Cuenta de portal inconsistente. Contacte al administrador.");
    }
    const redirectTo = this.resolvePasswordRecoveryRedirect(dto.redirectTo);

    let { error } = await this.supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });
    if (error && this.shouldProvisionSupabaseUserForRecovery(String(error.message || ""))) {
      await this.provisionSupabaseAuthUserForApprovedPortal(email, portalUserId);
      ({ error } = await this.supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo }));
    }
    if (error) {
      const mapped = this.mapSupabaseRecoveryError(String(error.message || ""));
      this.logger.warn(`resetPasswordForEmail(${redactEmailForLog(email)}): ${sanitizeLogText(error.message)}`);
      throw new BadRequestException(
        mapped ||
          "No se pudo completar la solicitud de recuperación en este momento. Intente más tarde o contacte a soporte."
      );
    }
    return {
      message:
        "Le hemos enviado las instrucciones a su correo, siempre que la cuenta exista y esté autorizada. Revise la bandeja de entrada y la carpeta de spam; el enlace tiene vigencia limitada."
    };
  }

  /** Errores de Supabase que indican que el correo no tiene fila en Auth (p. ej. alta solo en Postgres). */
  private shouldProvisionSupabaseUserForRecovery(supabaseMessage: string): boolean {
    const m = String(supabaseMessage || "").toLowerCase();
    return (
      /user not found|user_not_found|email not found|no user|does not exist|not registered/i.test(m)
    );
  }

  /**
   * Crea el usuario en Supabase Auth alineado con `public.usuarios`, para poder enviar reset por correo.
   * Contraseña temporal aleatoria; el usuario la sustituye con el enlace del email.
   */
  private async provisionSupabaseAuthUserForApprovedPortal(email: string, portalUserId: string): Promise<void> {
    if (!this.supabaseAdmin) return;
    const tempPassword = `${randomBytes(28).toString("base64url")}Aa1!@#`;
    const existsMsg = (e: { message?: string } | null) => {
      const em = String(e?.message || "").toLowerCase();
      return /already|registered|exists|duplicate/i.test(em);
    };
    let { error } = await this.supabaseAdmin.auth.admin.createUser({
      id: portalUserId,
      email,
      password: tempPassword,
      email_confirm: true
    });
    if (error && existsMsg(error)) return;
    if (error) {
      ({ error } = await this.supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true
      }));
    }
    if (error && existsMsg(error)) return;
    if (error) {
      this.logger.warn(
        `provisionSupabaseAuthUserForApprovedPortal(${redactEmailForLog(email)}): ${sanitizeLogText(error.message)}`
      );
      throw new BadRequestException(
        `No se pudo sincronizar el acceso con Supabase Auth: ${error.message}. Revise en el panel Authentication si el correo ya existe con otro UUID.`
      );
    }
  }

  /** Base pública del portal (sin barra final); nunca devuelve un host local. */
  private portalPublicBaseUrl(): string {
    const raw = String(
      this.config.get<string>("PORTAL_PUBLIC_URL") ??
        this.config.get<string>("PUBLIC_PORTAL_URL") ??
        DEFAULT_PORTAL_PUBLIC_ORIGIN
    ).trim();
    if (!raw) return DEFAULT_PORTAL_PUBLIC_ORIGIN;
    try {
      const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const u = new URL(href);
      const host = u.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host.endsWith(".localhost") ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host === "[::1]" ||
        host === "::1"
      ) {
        return DEFAULT_PORTAL_PUBLIC_ORIGIN;
      }
      return `${u.protocol}//${u.host}`;
    } catch {
      return DEFAULT_PORTAL_PUBLIC_ORIGIN;
    }
  }

  private resolvePasswordRecoveryRedirect(requested: string | undefined): string {
    const fb = this.portalPublicBaseUrl().replace(/\/+$/, "");
    const fallback = `${fb}/`;
    const raw = String(requested ?? "").trim();
    if (!raw) return fallback;
    try {
      const u = new URL(raw);
      if (u.protocol !== "http:" && u.protocol !== "https:") return fallback;
      const host = u.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host.endsWith(".localhost") ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host === "[::1]" ||
        host === "::1"
      ) {
        return fallback;
      }
      return u.href;
    } catch {
      return fallback;
    }
  }

  private mapSupabaseRecoveryError(message: string): string | null {
    const m = String(message || "").toLowerCase();
    if (!m) return null;
    if (/user not found|email address not found|no user|user does not exist|invalid login credentials/i.test(m)) {
      return "No encontramos una cuenta autorizada para recuperación con ese correo. Verifique la dirección o contacte a soporte.";
    }
    return null;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = await this.jwt.signAsync({
      sub: userId,
      email,
      role
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d"
      }
    );

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.pool.query(`UPDATE usuarios SET refresh_token_hash = $1 WHERE id = $2::uuid`, [
      hash,
      userId
    ]);
    return hash;
  }

  private refreshTokenExpiryFromJwt(refreshToken: string): Date {
    const decoded = this.jwt.decode(refreshToken) as { exp?: number } | null;
    if (decoded?.exp && Number.isFinite(decoded.exp)) {
      return new Date(Number(decoded.exp) * 1000);
    }
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  private async ensureSessionsTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS sesiones_usuario (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_usuario UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
        hash_token TEXT NOT NULL,
        fecha_expiracion TIMESTAMPTZ NOT NULL,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT uq_sesiones_hash_token UNIQUE (hash_token)
      )
    `);
  }

  private async persistUserSession(userId: string, refreshHash: string, refreshToken: string): Promise<void> {
    const expiry = this.refreshTokenExpiryFromJwt(refreshToken);
    try {
      await this.pool.query(
        `INSERT INTO sesiones_usuario (id_usuario, hash_token, fecha_expiracion)
         VALUES ($1::uuid, $2, $3::timestamptz)`,
        [userId, refreshHash, expiry.toISOString()]
      );
      await this.pool.query(
        `DELETE FROM sesiones_usuario
         WHERE id_usuario = $1::uuid
           AND fecha_expiracion < now()`,
        [userId]
      );
    } catch (err: any) {
      if (String(err?.code || "") !== "42P01") throw err;
      await this.ensureSessionsTable();
      await this.pool.query(
        `INSERT INTO sesiones_usuario (id_usuario, hash_token, fecha_expiracion)
         VALUES ($1::uuid, $2, $3::timestamptz)`,
        [userId, refreshHash, expiry.toISOString()]
      );
    }
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

  /** Correo de bienvenida según `estado_cuenta` en BD (pendiente vs aprobado). No debe hacer fallar el registro. */
  private async sendRegistrationWelcomeEmail(email: string, displayName: string, userId: string): Promise<void> {
    try {
      const r = await this.pool.query<{ s: string }>(
        `SELECT estado_cuenta::text AS s FROM usuarios WHERE id = $1::uuid`,
        [userId]
      );
      const approved = r.rows[0]?.s === "aprobado";
      const portalUrl = this.portalPublicBaseUrl();
      const subject = approved ? "Cuenta aprobada - Antares Portal" : "Registro recibido - Antares Portal";
      const bodySummary = approved
        ? `Cuenta aprobada para ${displayName}. Se intento enviar acceso al portal.`
        : `Registro recibido para ${displayName}. Se intento enviar correo de bienvenida.`;

      let sent = false;
      let deliveryError: string | null = null;
      if (this.mail.hasResend()) {
        try {
          await this.mail.sendPortalRegistrationWelcome({
            to: email,
            recipientName: displayName,
            portalUrl,
            accountApproved: approved
          });
          sent = true;
        } catch (resendErr) {
          deliveryError = resendErr instanceof Error ? resendErr.message : String(resendErr);
          this.logger.warn(
            `Bienvenida Resend falló (${redactEmailForLog(email)}), probando Supabase: ${sanitizeLogText(deliveryError)}`
          );
        }
      }

      if (!sent) {
        deliveryError = await this.sendRegistrationWelcomeViaSupabaseMagicLink(email, portalUrl, userId);
        sent = deliveryError == null;
      }
      await this.recordOutgoingEmailLog({
        to: email,
        subject,
        body: bodySummary,
        sent,
        error: deliveryError
      });
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      this.logger.error(`Correo de bienvenida no enviado (${redactEmailForLog(email)}): ${sanitizeLogText(detail)}`);
      await this.recordOutgoingEmailLog({
        to: email,
        subject: "Registro recibido - Antares Portal",
        body: `No fue posible completar el correo de bienvenida para ${displayName}.`,
        sent: false,
        error: detail
      });
    }
  }

  /**
   * Misma tubería que recuperación: correo saliente de Supabase Auth (SMTP del proyecto).
   * Envía magic link al portal; plantilla «Magic Link» en Authentication → Email Templates.
   */
  private async sendRegistrationWelcomeViaSupabaseMagicLink(
    email: string,
    portalUrl: string,
    userId: string
  ): Promise<string | null> {
    if (!this.supabaseAdmin || !this.supabaseOtpMailer) {
      const msg =
        "Bienvenida sin Resend y sin Supabase completo: configure SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (+ opcional SUPABASE_ANON_KEY).";
      this.logger.warn(`${msg} Destino ${redactEmailForLog(email)}.`);
      return msg;
    }
    try {
      try {
        await this.provisionSupabaseAuthUserForApprovedPortal(email, userId);
      } catch (provErr) {
        const msg = provErr instanceof Error ? provErr.message : String(provErr);
        this.logger.warn(
          `Bienvenida Supabase: aprovisionamiento Auth omitido o fallido (${redactEmailForLog(email)}): ${sanitizeLogText(msg)}`
        );
      }

      const emailRedirectTo = this.resolvePasswordRecoveryRedirect(portalUrl);
      const { error } = await this.supabaseOtpMailer.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
          shouldCreateUser: false
        }
      });
      if (error) {
        const em = String(error.message || "").toLowerCase();
        if (/user not found|signups not allowed|not authorized|otp disabled/i.test(em)) {
          this.logger.warn(
            `signInWithOtp bienvenida (${redactEmailForLog(email)}): ${sanitizeLogText(error.message)}. Revise en Supabase «Enable email confirmations» / plantilla Magic Link y URL en redirect allow list.`
          );
        } else {
          this.logger.warn(`signInWithOtp bienvenida (${redactEmailForLog(email)}): ${sanitizeLogText(error.message)}`);
        }
        return error.message;
      }
      this.logger.log(`Correo de bienvenida (magic link Supabase) encolado/enviado a ${redactEmailForLog(email)}`);
      return null;
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Bienvenida vía Supabase falló (${redactEmailForLog(email)}): ${sanitizeLogText(detail)}`);
      return detail;
    }
  }

  private assertStrongPassword(password: string) {
    const p = String(password || "");
    if (p.length < 10) {
      throw new BadRequestException("La contraseña debe tener al menos 10 caracteres.");
    }
    if (!/[a-z]/.test(p)) {
      throw new BadRequestException("La contraseña debe incluir al menos una letra minúscula.");
    }
    if (!/[A-Z]/.test(p)) {
      throw new BadRequestException("La contraseña debe incluir al menos una letra mayúscula.");
    }
    if (!/[0-9]/.test(p)) {
      throw new BadRequestException("La contraseña debe incluir al menos un número.");
    }
    if (!/[^A-Za-z0-9]/.test(p)) {
      throw new BadRequestException("La contraseña debe incluir al menos un símbolo (carácter especial).");
    }
  }

  /**
   * Crea usuario en Supabase Auth. Intenta usar `preferredUserId` para alinear con `public.usuarios`.
   * Si la API rechaza el id fijo, reintenta sin él y devuelve el UUID asignado por Supabase.
   */
  /** Mensaje de error legible (Nest HttpException u Error genérico). */
  private extractExceptionMessage(err: unknown): string {
    if (err instanceof HttpException) {
      const r = err.getResponse();
      if (typeof r === "string") return r;
      if (r && typeof r === "object" && "message" in r) {
        const m = (r as { message?: unknown }).message;
        if (Array.isArray(m)) return m.join(", ");
        if (typeof m === "string") return m;
      }
    }
    if (err && typeof err === "object" && "message" in err && typeof (err as Error).message === "string") {
      return (err as Error).message;
    }
    return String(err);
  }

  private isSupabaseAuthEmailConflict(err: unknown): boolean {
    const msg = this.extractExceptionMessage(err).toLowerCase();
    return (
      /already been registered/i.test(msg) ||
      /user already registered/i.test(msg) ||
      /user already exists/i.test(msg) ||
      (msg.includes("email") && msg.includes("already")) ||
      (/duplicate/i.test(msg) && /(email|user)/i.test(msg))
    );
  }

  private async createSupabaseAuthUser(
    email: string,
    password: string,
    fullName: string,
    preferredUserId: string
  ): Promise<string> {
    if (!this.supabaseAdmin) {
      throw new BadRequestException("Servicio de autenticación no configurado.");
    }
    const requireEmailConfirmation = String(this.config.get<string>("SUPABASE_AUTH_REQUIRE_EMAIL_CONFIRMATION") || "")
      .trim()
      .toLowerCase();
    const emailConfirm = requireEmailConfirmation === "true" ? false : true;

    const base = {
      email,
      password,
      email_confirm: emailConfirm,
      user_metadata: { full_name: fullName }
    };

    let { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      ...base,
      id: preferredUserId
    });

    if (error) {
      const errMsg = String(error.message || "").toLowerCase();
      const emailConflict =
        errMsg.includes("already") || errMsg.includes("registered") || errMsg.includes("exists");
      if (!emailConflict) {
        this.logger.warn(`createSupabaseAuthUser con id fijo: ${sanitizeLogText(error.message)}. Reintentando sin id.`);
        ({ data, error } = await this.supabaseAdmin.auth.admin.createUser(base));
      }
    }

    if (error || !data?.user?.id) {
      const msg = error?.message || "No fue posible crear el usuario en Supabase Auth.";
      this.logger.error(`Supabase auth.admin.createUser: ${sanitizeLogText(msg)}`);
      throw new BadRequestException("No fue posible sincronizar el usuario con el servicio de autenticación.");
    }

    const uid = data.user.id;
    if (uid !== preferredUserId) {
      this.logger.warn(`Supabase asignó UUID distinto al generado localmente (${preferredUserId} -> ${uid}).`);
    }
    return uid;
  }

  private async deleteSupabaseAuthUser(userId: string) {
    if (!this.supabaseAdmin || !userId) return;
    await this.supabaseAdmin.auth.admin.deleteUser(userId).catch(() => null);
  }
}
