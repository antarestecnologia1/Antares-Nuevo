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
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseProjectUrl } from "../common/normalize-supabase-url";
import { normalizeDatabaseUrl } from "../database/normalize-database-url";
import { PG_POOL } from "../database/database.module";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RegisterPortalDto } from "./dto/register-portal.dto";

/** Valores del ENUM rol_usuario en BD/postgres/02_enums.sql */
const ROLE_REGISTER_TO_DB: Record<string, string> = {
  ADMIN: "admin",
  CLIENT: "client",
  RRHH: "rrhh"
};

type UsuarioRow = {
  id: string;
  correo_electronico: string;
  hash_contrasena: string;
  nombre_completo: string;
  rol: string;
  estado_cuenta: string;
  refresh_token_hash: string | null;
};

/** Errores de red/TLS/pooler que `pg` no codifica como ECONNREFUSED / 28P01. */
function mapSupabaseOrNetworkDbError(err: unknown): ServiceUnavailableException | null {
  const e = err as { code?: string; message?: string } | null | undefined;
  if (!e) return null;
  const code = String(e.code ?? "");
  const message = String(e.message ?? "");
  const lower = message.toLowerCase();

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
    return new ServiceUnavailableException(
      "Usuario incorrecto para el pooler de Supabase: copie la URI completa del panel (Transaction pooler usa usuario postgres.PROJECT_REF, no solo postgres). O use Session mode / Direct connection y pegue esa cadena en DATABASE_URL."
    );
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

  if (/econnrefused|etimedout|enotfound|eai_again|getaddrinfo|socket hang up|connect timed out|connection refused/i.test(lower)) {
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
  private readonly supabaseEnabled: boolean;

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {
    const url = normalizeSupabaseProjectUrl(this.config.get<string>("SUPABASE_URL"));
    const key = (this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();
    this.supabaseEnabled = Boolean(url && key);
    this.supabaseAdmin = this.supabaseEnabled ? createClient(url, key) : null;
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
    const email = dto.email.trim().toLowerCase();
    const exists = await this.pool.query(`SELECT 1 FROM usuarios WHERE lower(correo_electronico) = lower($1)`, [
      email
    ]);
    if (exists.rowCount && exists.rowCount > 0) {
      throw new BadRequestException("El correo ya está registrado");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const rolDb = ROLE_REGISTER_TO_DB[dto.role] ?? "client";

    await this.pool.query(
      `INSERT INTO usuarios (
        correo_electronico, hash_contrasena, nombre_completo, rol, estado_cuenta
      ) VALUES (
        $1, $2, $3, $4::rol_usuario, 'pendiente'::estado_cuenta_usuario
      )`,
      [email, passwordHash, dto.name.trim(), rolDb]
    );

    return {
      pendingApproval: true,
      message:
        "Registro recibido. Tu cuenta está pendiente de aprobación; no podrás iniciar sesión hasta que un administrador la active en la base de datos."
    };
  }

  async registerPortal(dto: RegisterPortalDto) {
    let authUserId: string | null = null;
    /** Solo limpiar Auth en Supabase si el usuario fue creado allí; con UUID local no hay nada que borrar. */
    let supabaseUserCreated = false;
    try {
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
      const firstName = this.normalizeDbTextUpper(dto.firstName) ?? "";
      const middleName = this.normalizeDbTextUpper(dto.middleName);
      const lastName = this.normalizeDbTextUpper(dto.lastName) ?? "";
      const secondLastName = this.normalizeDbTextUpper(dto.secondLastName);
      const fullName = [firstName, middleName, lastName, secondLastName]
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .join(" ");

      const docType = String(dto.documentType || "").trim().toUpperCase();
      let numeroPersonal: string | null = null;
      let nitEmpresa: string | null = null;
      if (docType === "NIT") {
        nitEmpresa = this.normalizeDbTextUpper(dto.companyNit) || this.normalizeDbTextUpper(dto.taxId);
        numeroPersonal = this.normalizeDbTextUpper(dto.personalTaxId);
        if (!nitEmpresa || !numeroPersonal) {
          throw new BadRequestException("Indique NIT de empresa y cédula del usuario.");
        }
      } else {
        numeroPersonal = this.normalizeDbTextUpper(dto.taxId);
        if (!numeroPersonal) {
          throw new BadRequestException("Indique el número de documento.");
        }
      }

      /** Auditoría alineada al copy legal del formulario (#form-register): términos, privacidad y Habeas en un solo checkbox. */
      const checklist: Record<string, unknown> = {
        idVerified: true,
        acceptedTermsAt: new Date().toISOString(),
        requiredFieldsCompleted: true,
        termsOfUseAccepted: true,
        privacyPolicyAccepted: true,
        habeasDataAcknowledged: true
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

      authUserId = randomUUID();

      if (this.supabaseEnabled && this.supabaseAdmin) {
        authUserId = await this.createSupabaseAuthUser(email, dto.password, fullName || dto.email, authUserId);
        supabaseUserCreated = true;
      }

      try {
        await this.pool.query(
          `INSERT INTO usuarios (
            id, correo_electronico, hash_contrasena, nombre_completo, rol, estado_cuenta,
            primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
            tipo_persona, tipo_documento, numero_identificacion, nit_empresa_registro, fecha_expedicion_documento,
            fecha_nacimiento, genero, cargo_registro, area_trabajo, telefono,
            departamento, ciudad, direccion,
            fecha_aceptacion_terminos,
            checklist_registro_json
          ) VALUES (
            $1::uuid, $2, $3, $4, 'client'::rol_usuario, 'pendiente'::estado_cuenta_usuario,
            $5, $6, $7, $8, $9, $10, $11, $12, NULL::date,
            $13::date, $14, $15, $16, $17, $18, $19, $20,
            now(),
            $21::jsonb
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
            fecha_aceptacion_terminos = EXCLUDED.fecha_aceptacion_terminos,
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
            this.normalizePersonTypeForDb(dto.personType),
            this.normalizeDbTextUpper(dto.documentType),
            numeroPersonal,
            nitEmpresa,
            dto.birthDate || null,
            this.normalizeDbTextUpper(dto.gender),
            this.normalizeDbTextUpper(dto.position),
            this.normalizeDbTextUpper(dto.workArea),
            this.normalizeDbTextUpper(dto.phone),
            this.normalizeDbText(dto.department),
            this.normalizeDbText(dto.city),
            this.normalizeDbTextUpper(dto.address),
            JSON.stringify(checklist)
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
                fecha_aceptacion_terminos
              ) VALUES (
                $1::uuid, $2, $3, $4, 'client'::rol_usuario, 'pendiente'::estado_cuenta_usuario,
                $5, $6, $7, $8, $9::date, $10, $11, $12, $13, $14, $15, now()
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
                fecha_aceptacion_terminos = EXCLUDED.fecha_aceptacion_terminos`,
              [
                authUserId,
                email,
                passwordHash,
                fullName || dto.email,
                this.normalizePersonTypeForDb(dto.personType),
                this.normalizeDbTextUpper(dto.documentType),
                numeroPersonal,
                this.normalizeDbTextUpper(dto.phone),
                dto.birthDate || null,
                this.normalizeDbTextUpper(dto.gender),
                this.normalizeDbTextUpper(dto.position),
                this.normalizeDbTextUpper(dto.workArea),
                this.normalizeDbText(dto.department),
                this.normalizeDbText(dto.city),
                this.normalizeDbTextUpper(dto.address)
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
                throw new BadRequestException(
                  minimalErr?.detail || minimalErr?.message || "No fue posible completar el registro en base de datos."
                );
              }
            } else {
              if (supabaseUserCreated) await this.deleteSupabaseAuthUser(authUserId);
              throw new BadRequestException(
                retryErr?.detail || retryErr?.message || "No fue posible completar el registro en base de datos."
              );
            }
          }
        } else {
          if (supabaseUserCreated) await this.deleteSupabaseAuthUser(authUserId);
          throw new BadRequestException(
            err?.detail || err?.message || "No fue posible completar el registro en base de datos."
          );
        }
      }

      return {
        pendingApproval: true,
        message:
          "Registro recibido. Tu cuenta está pendiente de aprobación; no podrás iniciar sesión hasta que un administrador la active."
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
        `registerPortal unexpected error code=${code} message=${pgMsg} detail=${detail} stack=${String(err?.stack ?? "").slice(0, 500)}`
      );

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
      if (["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN", "ECONNRESET"].includes(code)) {
        throw new ServiceUnavailableException(
          "No hay conexión a la base de datos. Verifique DATABASE_URL en Render (sin espacios), que la BD acepte conexiones externas y SSL; en Supabase use la cadena del panel (pool session/direct si el pool transaccional falla)."
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

      const mapped = mapSupabaseOrNetworkDbError(err);
      if (mapped) throw mapped;

      throw new ServiceUnavailableException(
        "No fue posible procesar el registro. Revise DATABASE_URL (misma URI que en Supabase → Database, sin comillas) y los logs de Render. Pooler 6543: usuario postgres.<ref_proyecto>; directo 5432: usuario postgres. Contraseña con @ u otros símbolos: codifíquela en la URL."
      );
    }
  }

  async login(dto: LoginDto) {
    this.assertDatabaseConfigured();
    const email = dto.email.trim().toLowerCase();
    const res = await this.pool.query<UsuarioRow>(
      `SELECT id::text, correo_electronico, hash_contrasena, nombre_completo,
              rol::text AS rol, estado_cuenta::text AS estado_cuenta, refresh_token_hash
       FROM usuarios WHERE lower(correo_electronico) = lower($1)`,
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
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(userId: string, refreshToken: string) {
    this.assertDatabaseConfigured();
    const res = await this.pool.query<UsuarioRow>(
      `SELECT id::text, correo_electronico, rol::text AS rol, refresh_token_hash
       FROM usuarios WHERE id = $1::uuid`,
      [userId]
    );
    const user = res.rows[0];
    if (!user?.refresh_token_hash) {
      throw new UnauthorizedException("Refresh token inválido");
    }

    const ok = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!ok) {
      throw new UnauthorizedException("Refresh token inválido");
    }

    const jwtRole = String(user.rol || "client").toLowerCase();
    const tokens = await this.generateTokens(user.id, user.correo_electronico, jwtRole);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
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
  }

  /** Texto libre (nombres, dirección, etc.): mayúsculas + sin tildes. No usar en departamento/ciudad (catálogo). */
  private normalizeDbTextUpper(value: string | undefined | null): string | null {
    const t = this.normalizeDbText(value);
    if (!t) return null;
    return t.toUpperCase();
  }

  /** tipo_persona solo "Natural" | "Juridica": igualdad en SQL sin LOWER() ni índices funcionales. */
  private normalizePersonTypeForDb(value: string | undefined | null): string {
    const t = this.normalizeDbText(value);
    if (!t) return "Natural";
    const k = t.toLowerCase();
    if (k === "juridica") return "Juridica";
    return "Natural";
  }

  /** Texto persistido en BD sin tildes; ñ → n (consistente con el portal). */
  private normalizeDbText(value: string | undefined | null): string | null {
    if (value == null) return null;
    const t = String(value).trim();
    if (!t) return null;
    return t
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N");
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
        this.logger.warn(`createSupabaseAuthUser con id fijo: ${error.message}. Reintentando sin id.`);
        ({ data, error } = await this.supabaseAdmin.auth.admin.createUser(base));
      }
    }

    if (error || !data?.user?.id) {
      const msg = error?.message || "No fue posible crear el usuario en Supabase Auth.";
      this.logger.error(`Supabase auth.admin.createUser: ${msg} ${JSON.stringify(error)}`);
      throw new BadRequestException(msg);
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
