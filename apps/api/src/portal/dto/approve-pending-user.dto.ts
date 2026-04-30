import { IsIn, IsUUID } from "class-validator";

/** Valores de `rol_usuario` (BD/postgres/02_enums.sql), alineados con ROLES en app.js */
export const APPROVE_PENDING_ROLE_VALUES = [
  "admin",
  "client",
  "rrhh",
  "administracion",
  "auxiliar_administrativo",
  "lider_administrativo"
] as const;

/** Admin aprueba cliente pendiente: empresa + rol operativo en tabla usuarios y permisos por defecto. */
export class ApprovePendingUserDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  companyId!: string;

  @IsIn(APPROVE_PENDING_ROLE_VALUES as unknown as string[])
  role!: string;
}
