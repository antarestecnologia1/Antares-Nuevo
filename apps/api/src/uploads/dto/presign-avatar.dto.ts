import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { transformStripNulTrim } from "../../common/normalize-db-text";

export class PresignAvatarDto {
  @Transform(transformStripNulTrim)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  fileName!: string;

  /** Opcional: el controlador normaliza (p. ej. vacío → image/jpeg). */
  @IsOptional()
  @Transform(transformStripNulTrim)
  @IsString()
  @MaxLength(120)
  contentType?: string;
}
