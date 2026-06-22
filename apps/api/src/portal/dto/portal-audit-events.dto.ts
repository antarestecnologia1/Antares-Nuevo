import { Type } from "class-transformer";
import {
  Allow,
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested
} from "class-validator";

export class PortalAuditEventDto {
  @IsOptional()
  @IsUUID("4")
  id?: string;

  @IsIn(["create", "update", "delete"])
  action!: "create" | "update" | "delete";

  @IsString()
  @MaxLength(64)
  moduleId!: string;

  @IsString()
  @MaxLength(120)
  moduleLabel!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  entityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  entityLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsISO8601()
  at?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  detailAction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  detailId?: string;
}

export class AppendPortalAuditEventsDto {
  @IsArray()
  @ArrayMaxSize(80)
  @ValidateNested({ each: true })
  @Type(() => PortalAuditEventDto)
  events!: PortalAuditEventDto[];
}

export class QueryPortalAuditEventsDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @Allow()
  limit?: number;

  @IsOptional()
  @Allow()
  offset?: number;
}
