import { IsIn, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from "class-validator";

export const ADMIN_USER_STATUS_VALUES = ["pendiente", "aprobado", "rechazado"] as const;

export class AdminUserStatusDto {
  @IsUUID()
  userId!: string;

  @IsIn(ADMIN_USER_STATUS_VALUES as unknown as string[])
  status!: string;

  /** Obligatorio al desactivar (`rechazado`). */
  @ValidateIf((o: AdminUserStatusDto) => o.status === "rechazado")
  @IsString()
  @MinLength(3, { message: "Indique el motivo (mínimo 3 caracteres)." })
  @MaxLength(4000)
  reason?: string;
}
