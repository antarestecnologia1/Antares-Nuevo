import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { transformStripMultiline } from "../../common/normalize-db-text";

export class DeletePortalAuditEventsDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  from?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  moduleId?: string;

  @IsOptional()
  @IsIn(["create", "update", "delete"])
  action?: "create" | "update" | "delete";

  /** Si es "all", ignora from/to/moduleId y borra toda la bitácora. */
  @IsOptional()
  @IsIn(["all"])
  scope?: "all";

  @Transform(transformStripMultiline)
  @IsString()
  @MinLength(3, { message: "Indique el motivo (mínimo 3 caracteres)." })
  @MaxLength(500)
  motivo!: string;
}
