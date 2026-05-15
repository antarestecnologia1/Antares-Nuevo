import { IsArray, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class DispatchNotificationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  /** Destinatarios explícitos (UUID). No administradores: solo pueden notificarse a sí mismos. */
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  userIds?: string[];

  /** Audiencia predefinida en servidor (evita filtrar ids en el cliente). */
  @IsOptional()
  @IsIn(["admins", "hr"])
  audience?: "admins" | "hr";
}
