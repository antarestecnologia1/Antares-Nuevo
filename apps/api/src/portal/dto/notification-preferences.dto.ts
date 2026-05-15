import { IsBoolean, IsOptional } from "class-validator";

/** Actualización parcial: enviar al menos uno de los dos flags. */
export class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  notificacionesHabilitadas?: boolean;

  @IsOptional()
  @IsBoolean()
  sonidoNotificacionesHabilitadas?: boolean;
}
