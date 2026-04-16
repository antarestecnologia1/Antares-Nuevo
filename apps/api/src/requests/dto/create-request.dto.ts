import { IsDateString, IsIn, IsInt, IsNotEmpty, Min } from "class-validator";

export class CreateRequestDto {
  @IsNotEmpty()
  origin!: string;

  @IsNotEmpty()
  destination!: string;

  @IsIn(["Turbo", "Camion", "Tractocamion"])
  vehicleType!: "Turbo" | "Camion" | "Tractocamion";

  @IsInt()
  @Min(1)
  weightKg!: number;

  @IsDateString()
  pickupAt!: string;
}
