import { IsIn, IsUUID } from "class-validator";

export const ADMIN_USER_STATUS_VALUES = ["pendiente", "aprobado", "rechazado"] as const;

export class AdminUserStatusDto {
  @IsUUID()
  userId!: string;

  @IsIn(ADMIN_USER_STATUS_VALUES as unknown as string[])
  status!: string;
}
