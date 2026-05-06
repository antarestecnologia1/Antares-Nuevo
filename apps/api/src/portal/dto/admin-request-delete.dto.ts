import { IsUUID } from "class-validator";

export class AdminRequestDeleteDto {
  @IsUUID()
  requestId!: string;
}
