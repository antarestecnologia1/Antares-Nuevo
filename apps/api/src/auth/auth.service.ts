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
import type { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
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
    const url = this.config.get<string>("SUPABASE_URL") ?? "";
    const key = this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    this.supabaseEnabled = Boolean(url && key);
    this.supabaseAdmin = this.supabaseEnabled ? createClient(url, key) : null;
  }

  async register(dto: RegisterDto) {
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
    try {
      if (!this.supabaseEnabled || !this.supabaseAdmin) {
        throw new BadRequestException(
          "Registro no disponible: falta configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en la API."
        );
      }
      if (!dto.acceptTerms) {
        throw new BadRequestException("Debes aceptar términos y tratamiento de datos");
      }
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

      const checklist = {
        idVerified: true,
        acceptedTermsAt: new Date().toISOString(),
        requiredFieldsCompleted: true
      };

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

      authUserId = await this.createSupabaseAuthUser(email, dto.password, fullName || dto.email);

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
      )`,
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
            )`,
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
            await this.deleteSupabaseAuthUser(authUserId);
            throw new BadRequestException(
              retryErr?.detail || retryErr?.message || "No fue posible completar el registro en base de datos."
            );
          }
        } else {
          await this.deleteSupabaseAuthUser(authUserId);
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
      if (authUserId) {
        await this.deleteSupabaseAuthUser(authUserId);
      }
      if (err instanceof HttpException) throw err;
      const code = String(err?.code || "");
      const detail = String(err?.detail || err?.message || "");
      this.logger.error(`registerPortal unexpected error code=${code} detail=${detail}`);
      if (code === "23505") {
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
      throw new ServiceUnavailableException("No fue posible procesar el registro en este momento.");
    }
  }

  async login(dto: LoginDto) {
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

  private async createSupabaseAuthUser(email: string, password: string, fullName: string): Promise<string> {
    if (!this.supabaseAdmin) {
      throw new BadRequestException("Servicio de autenticación no configurado.");
    }
    const requireEmailConfirmation = String(this.config.get<string>("SUPABASE_AUTH_REQUIRE_EMAIL_CONFIRMATION") || "")
      .trim()
      .toLowerCase();
    const emailConfirm = requireEmailConfirmation === "true" ? false : true;
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: emailConfirm,
      user_metadata: { full_name: fullName }
    });
    if (error || !data?.user?.id) {
      throw new BadRequestException(error?.message || "No fue posible crear el usuario en Supabase Auth.");
    }
    return data.user.id;
  }

  private async deleteSupabaseAuthUser(userId: string) {
    if (!this.supabaseAdmin || !userId) return;
    await this.supabaseAdmin.auth.admin.deleteUser(userId).catch(() => null);
  }
}
