import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import type { Pool } from "pg";
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
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

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
    if (!dto.acceptTerms) {
      throw new BadRequestException("Debes aceptar términos y tratamiento de datos");
    }
    const email = dto.email.trim().toLowerCase();
    const exists = await this.pool.query(`SELECT 1 FROM usuarios WHERE lower(correo_electronico) = lower($1)`, [
      email
    ]);
    if (exists.rowCount && exists.rowCount > 0) {
      throw new BadRequestException("El correo ya está registrado");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const fullName = [dto.firstName, dto.middleName, dto.lastName, dto.secondLastName]
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .join(" ");

    const checklist = {
      idVerified: true,
      acceptedTermsAt: new Date().toISOString(),
      requiredFieldsCompleted: true
    };

    await this.pool.query(
      `INSERT INTO usuarios (
        correo_electronico, hash_contrasena, nombre_completo, rol, estado_cuenta,
        primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        tipo_persona, tipo_documento, numero_identificacion, fecha_expedicion_documento,
        fecha_nacimiento, genero, cargo_registro, area_trabajo, telefono,
        departamento, ciudad, direccion,
        fecha_aceptacion_terminos,
        checklist_registro_json
      ) VALUES (
        $1, $2, $3, 'client'::rol_usuario, 'pendiente'::estado_cuenta_usuario,
        $4, $5, $6, $7, $8, $9, $10, $11::date,
        $12::date, $13, $14, $15, $16, $17, $18, $19,
        now(),
        $20::jsonb
      )`,
      [
        email,
        passwordHash,
        fullName || dto.email,
        dto.firstName?.trim() || null,
        dto.middleName?.trim() || null,
        dto.lastName?.trim() || null,
        dto.secondLastName?.trim() || null,
        dto.personType || null,
        dto.documentType || null,
        dto.taxId?.trim() || null,
        dto.documentIssuedAt || null,
        dto.birthDate || null,
        dto.gender || null,
        dto.position?.trim() || null,
        dto.workArea?.trim() || null,
        dto.phone?.trim() || null,
        dto.department || null,
        dto.city || null,
        dto.address?.trim() || null,
        JSON.stringify(checklist)
      ]
    );

    return {
      pendingApproval: true,
      message:
        "Registro recibido. Tu cuenta está pendiente de aprobación; no podrás iniciar sesión hasta que un administrador la active."
    };
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
}
