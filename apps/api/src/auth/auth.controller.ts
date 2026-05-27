import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { CompletePasswordRecoveryDto } from "./dto/complete-password-recovery.dto";
import { RequestPasswordRecoveryDto } from "./dto/request-password-recovery.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RegisterPortalDto } from "./dto/register-portal.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

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
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @HttpCode(200)
  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.userId, dto.refreshToken);
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
