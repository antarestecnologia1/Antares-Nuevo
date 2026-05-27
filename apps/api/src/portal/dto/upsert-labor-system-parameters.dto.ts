import { IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";

export class UpsertLaborSystemParametersDto {
  @IsInt()
  @Min(2020)
  @Max(2035)
  year!: number;

  @IsNumber()
  @Min(1)
  smmlvCop!: number;

  @IsNumber()
  @Min(0)
  transportAllowanceCop!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  uvtCop?: number | null;

  @IsNumber()
  @Min(1)
  @Max(168)
  legalWeeklyHours!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  healthEmployeeRate!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  pensionEmployeeRate!: number;

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2035)
  platformReferenceYear?: number | null;
}
