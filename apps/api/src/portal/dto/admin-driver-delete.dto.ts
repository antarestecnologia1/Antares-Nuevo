import { IsUUID } from "class-validator";

export class AdminDriverDeleteDto {
  @IsUUID()
  driverId!: string;
}
