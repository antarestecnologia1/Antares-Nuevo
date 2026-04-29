import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
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
}
