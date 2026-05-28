import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { transformStripEmail, transformStripNulTrim } from "../../common/normalize-db-text";

export class LoginDto {
  @Transform(transformStripEmail)
  @IsEmail()
  email!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "") : value))
  @IsString()
  @MinLength(8)
  password!: string;

  /** Token Turnstile generado por el widget en el portal. Opcional: si CF_TURNSTILE_REQUIRED=false el backend lo ignora. */
  @IsOptional()
  @Transform(transformStripNulTrim)
  @IsString()
  @MaxLength(4096)
  turnstileToken?: string;
}
