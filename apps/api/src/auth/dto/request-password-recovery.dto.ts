import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RequestPasswordRecoveryDto {
  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "").trim().toLowerCase() : value))
  @IsEmail({}, { message: "Indique un correo electrónico válido." })
  @MinLength(3)
  @MaxLength(320)
  email!: string;

  /** URL absoluta de retorno (HTTPS); debe estar permitida en el panel del proveedor de autenticación. */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  redirectTo?: string;

  /** Token Turnstile generado por el widget en el portal. Opcional: si CF_TURNSTILE_REQUIRED=false el backend lo ignora. */
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  turnstileToken?: string;
}
