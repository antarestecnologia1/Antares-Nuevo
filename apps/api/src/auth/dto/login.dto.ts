import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  /** Token Turnstile generado por el widget en el portal. Opcional: si CF_TURNSTILE_REQUIRED=false el backend lo ignora. */
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  turnstileToken?: string;
}
