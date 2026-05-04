import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RequestPasswordRecoveryDto {
  @IsEmail({}, { message: "Indique un correo electrónico válido." })
  @MinLength(3)
  @MaxLength(320)
  email!: string;

  /** URL absoluta permitida en Supabase → Authentication → Redirect URLs */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  redirectTo?: string;
}
