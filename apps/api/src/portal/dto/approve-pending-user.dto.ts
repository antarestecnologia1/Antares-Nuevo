import { ArrayUnique, IsArray, IsIn, IsOptional, IsString, IsUUID } from "class-validator";

/** Valores de `rol_usuario` (BD/postgres/02_enums.sql), alineados con ROLES en app.js */
export const APPROVE_PENDING_ROLE_VALUES = [
  "admin",
  "client",
  "rrhh",
  "administracion",
  "auxiliar_administrativo",
  "lider_administrativo",
  "logistica"
] as const;

/** Admin aprueba cliente pendiente: empresa + rol operativo en tabla usuarios y permisos por defecto. */
export class ApprovePendingUserDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  companyId!: string;

  @IsIn(APPROVE_PENDING_ROLE_VALUES as unknown as string[])
  role!: string;

  /**
   * Permisos seleccionados explícitamente por el admin desde el modal de aprobación.
   * Si se omite (o queda vacío), el servicio usa los permisos por defecto del rol.
   */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions?: string[];
}
