import { Transform } from "class-transformer";
import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { transformStripMultiline } from "../../common/normalize-db-text";

export class AdminUserDeleteDto {
  @IsUUID()
  userId!: string;

  @Transform(transformStripMultiline)
  @IsString()
  @MinLength(3, { message: "Indique el motivo (mínimo 3 caracteres)." })
  @MaxLength(4000)
  motivo!: string;
}
