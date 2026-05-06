import { IsUUID } from "class-validator";

export class AdminVehicleDeleteDto {
  @IsUUID()
  vehicleId!: string;
}
