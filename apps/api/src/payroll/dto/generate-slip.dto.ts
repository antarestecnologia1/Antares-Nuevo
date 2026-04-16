import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class GenerateSlipDto {
  @IsNotEmpty()
  employeeName!: string;

  @IsNumber()
  @Min(0)
  gross!: number;

  @IsNumber()
  @Min(0)
  deductions!: number;
}
