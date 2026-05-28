import { Transform, Type } from "class-transformer";
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
import { transformStripNulTrim, transformStripUpper } from "../../common/normalize-db-text";

const PORTAL_DATE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * POST /portal/fleet/fuel-logs — alta en registros_combustible.
 * Campos alineados con fuelLogRowForServer (app.js).
 */
export class CreateFleetFuelLogDto {
  @IsUUID("4")
  id!: string;

  @Transform(transformStripNulTrim)
  @IsString()
  @Matches(PORTAL_DATE, { message: "date debe ser YYYY-MM-DD o ISO 8601" })
  date!: string;

  @IsUUID("4")
  vehicleId!: string;

  @IsOptional()
  @Transform(transformStripNulTrim)
  @IsString()
  @MaxLength(8)
  plate?: string;

  @IsOptional()
  @Transform(transformStripNulTrim)
  @IsString()
  @MaxLength(8)
  vehiclePlate?: string;

  @IsUUID("4")
  driverId!: string;

  @Transform(transformStripUpper)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  driverName!: string;

  @IsOptional()
  @Transform(transformStripNulTrim)
  @IsString()
  @MaxLength(32)
  tripNumber?: string | null;

  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  liters!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCost!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPerLiter?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  odometerKm?: number | null;

  @IsOptional()
  @Transform(transformStripUpper)
  @IsString()
  @MaxLength(255)
  station?: string | null;

  @IsOptional()
  @IsIn(["empresa", "conductor"])
  paidBy?: "empresa" | "conductor";

  @IsOptional()
  @IsString()
  @MaxLength(64)
  createdAt?: string;
}
