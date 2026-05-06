import { IsUUID } from "class-validator";

/** Quita la fila en viajes_transporte y deja la solicitud lista para nueva asignación */
export class AdminClearTripDto {
  @IsUUID()
  requestId!: string;
}
