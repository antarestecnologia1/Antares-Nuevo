import { IsInt, Max, Min } from "class-validator";

export class DeleteLaborSystemParametersDto {
  @IsInt()
  @Min(2020)
  @Max(2100)
  year!: number;
}
