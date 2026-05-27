import { Type } from "class-transformer";
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

const PORTAL_DATE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const INTERVENTION_TYPES = ["preventivo", "correctivo", "falla"] as const;

/**
 * POST /portal/fleet/maintenance-logs — alta en registros_mantenimiento_vehiculo.
 * Campos alineados con vehicleTechnicalLogRowForServer (app.js).
 */
export class CreateFleetMaintenanceLogDto {
  @IsUUID("4")
  id!: string;

  @IsString()
  @Matches(PORTAL_DATE, { message: "date debe ser YYYY-MM-DD o ISO 8601" })
  date!: string;

  @IsUUID("4")
  vehicleId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  plate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  vehiclePlate?: string;

  @IsOptional()
  @IsIn(INTERVENTION_TYPES)
  interventionType?: (typeof INTERVENTION_TYPES)[number];

  /** Alias de interventionType usado en el portal. */
  @IsOptional()
  @IsIn(INTERVENTION_TYPES)
  type?: (typeof INTERVENTION_TYPES)[number];

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  downtimeHours!: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  followUpStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  createdAt?: string;
}
