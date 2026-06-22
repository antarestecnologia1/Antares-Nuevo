import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";

export class UpsertLaborSystemParametersDto {
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2035)
  year!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  smmlvCop!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  transportAllowanceCop!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  uvtCop?: number | null;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(168)
  legalWeeklyHours!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  healthEmployeeRate!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  pensionEmployeeRate!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2035)
  platformReferenceYear?: number | null;
}
