import { IsUUID } from "class-validator";

export class AdminUserDeleteDto {
  @IsUUID()
  userId!: string;
}
