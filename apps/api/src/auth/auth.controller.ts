import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CompletePasswordRecoveryDto } from "./dto/complete-password-recovery.dto";
import { RequestPasswordRecoveryDto } from "./dto/request-password-recovery.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RegisterPortalDto } from "./dto/register-portal.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("register-portal")
  registerPortal(@Body() dto: RegisterPortalDto) {
    return this.auth.registerPortal(dto);
  }

  @HttpCode(200)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @HttpCode(200)
  @Post("refresh")
  refresh(@Body() payload: { userId: string; refreshToken: string }) {
    return this.auth.refresh(payload.userId, payload.refreshToken);
  }

  /**
   * Solicita el correo de recuperación vía Supabase Auth (evita depender del cliente JS/esm.sh en el navegador).
   * Comprueba que exista fila aprobada en `usuarios`.
   */
  @HttpCode(200)
  @Post("password-recovery/request")
  requestPasswordRecovery(@Body() dto: RequestPasswordRecoveryDto) {
    return this.auth.requestPasswordRecovery(dto);
  }

  /**
   * Tras abrir el enlace del correo de Supabase (recuperación), el cliente envía el access_token
   * de esa sesión y la nueva contraseña. Se alinea Supabase Auth y hash_contrasena en public.usuarios.
   */
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
