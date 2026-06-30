import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  AUTH_COOKIE_CSRF,
  AUTH_COOKIE_REFRESH,
  clearAuthCookies,
  newCsrfToken,
  setAuthCookies
} from "./auth-cookies";
import { CompletePasswordRecoveryDto } from "./dto/complete-password-recovery.dto";
import { RequestPasswordRecoveryDto } from "./dto/request-password-recovery.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RegisterPortalDto } from "./dto/register-portal.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

type AuthUserPayload = { userId: string; email: string; role: string };

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService
  ) {}

  private buildAuthUserResponse(accessToken: string): AuthUserPayload {
    const decoded = this.auth.decodeTokenSubject(accessToken);
    const payload = this.auth.decodeAccessPayload(accessToken);
    const userId = decoded || String(payload?.sub || "").trim();
    if (!userId) {
      throw new UnauthorizedException("No fue posible establecer la sesión.");
    }
    return {
      userId,
      email: String(payload?.email || ""),
      role: String(payload?.role || "")
    };
  }

  private shouldReturnBearerTokens(headerValue: string | undefined): boolean {
    return /^(1|true|yes)$/i.test(String(headerValue || "").trim());
  }

  // Registro interno (admin): tope conservador por IP para frenar fuerza bruta.
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  // Registro del portal (público): pocas peticiones legítimas por minuto.
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post("register-portal")
  registerPortal(@Body() dto: RegisterPortalDto) {
    return this.auth.registerPortal(dto);
  }

  // Login: defensa en profundidad incluso si alguien rodea Cloudflare.
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(200)
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Headers("x-antares-bearer-fallback") bearerFallback: string | undefined,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.auth.login(dto);
    const csrfToken = newCsrfToken();
    setAuthCookies(res, this.config, tokens, csrfToken);
    const body: Record<string, unknown> = {
      user: this.buildAuthUserResponse(tokens.accessToken),
      csrfToken
    };
    if (this.shouldReturnBearerTokens(bearerFallback)) {
      body.accessToken = tokens.accessToken;
      body.refreshToken = tokens.refreshToken;
    }
    return body;
  }

  @HttpCode(200)
  @Post("refresh")
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Headers("x-antares-bearer-fallback") bearerFallback: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = String(req.cookies?.[AUTH_COOKIE_REFRESH] || dto.refreshToken || "").trim();
    if (!refreshToken) {
      throw new UnauthorizedException("Sesión no válida. Inicie sesión nuevamente.");
    }
    const userId =
      String(dto.userId || "").trim() || this.auth.decodeTokenSubject(refreshToken) || "";
    if (!userId) {
      throw new UnauthorizedException("Sesión no válida. Inicie sesión nuevamente.");
    }
    const tokens = await this.auth.refresh(userId, refreshToken);
    const csrfToken = String(req.cookies?.[AUTH_COOKIE_CSRF] || "").trim() || newCsrfToken();
    setAuthCookies(res, this.config, tokens, csrfToken);
    const body: Record<string, unknown> = {
      ok: true,
      user: this.buildAuthUserResponse(tokens.accessToken),
      csrfToken
    };
    if (this.shouldReturnBearerTokens(bearerFallback)) {
      body.accessToken = tokens.accessToken;
      body.refreshToken = tokens.refreshToken;
    }
    return body;
  }

  /** Cierra sesión: borra cookies HttpOnly e invalida refresh en servidor si es posible. */
  @HttpCode(200)
  @Post("logout")
  async logout(
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = String(
      req.cookies?.[AUTH_COOKIE_REFRESH] || body?.refreshToken || ""
    ).trim();
    if (refreshToken) {
      const uid = this.auth.decodeTokenSubject(refreshToken);
      if (uid) await this.auth.invalidateSession(uid);
    }
    clearAuthCookies(res, this.config);
    return { ok: true };
  }

  /**
   * Solicita el correo de recuperación por el servidor (no depende del flujo en el navegador).
   * Exige cuenta aprobada en `usuarios`.
   */
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @HttpCode(200)
  @Post("password-recovery/request")
  requestPasswordRecovery(@Body() dto: RequestPasswordRecoveryDto) {
    return this.auth.requestPasswordRecovery(dto);
  }

  /**
   * Tras abrir el enlace del correo de recuperación, el cliente envía el access_token de esa sesión
   * y la nueva contraseña para alinear el proveedor de autenticación y `hash_contrasena` en `usuarios`.
   */
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(200)
  @Post("password-recovery/complete")
  completePasswordRecovery(
    @Headers("authorization") authorization: string | undefined,
    @Body() dto: CompletePasswordRecoveryDto
  ) {
    const raw = String(authorization ?? "").trim();
    const m = /^Bearer\s+(\S+)/i.exec(raw);
    const token = m ? m[1].trim() : "";
    if (!token) {
      throw new UnauthorizedException("Sesión de recuperación no válida. Abra de nuevo el enlace del correo.");
    }
    return this.auth.completePasswordRecoveryFromSupabase(token, dto.password);
  }
}
