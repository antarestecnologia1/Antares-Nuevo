import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class PresignAvatarDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  fileName!: string;

  /** Opcional: el controlador normaliza (p. ej. vacío → image/jpeg). */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contentType?: string;
}
