import { IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class GenerateSlipDto {
  @IsNotEmpty()
  employeeName!: string;

  @IsNumber()
  @Min(0)
  gross!: number;

  @IsNumber()
  @Min(0)
  deductions!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workedDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  workedDaysPaymentCop?: number;
}
