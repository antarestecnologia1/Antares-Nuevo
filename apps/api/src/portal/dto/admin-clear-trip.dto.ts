import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

/** Quita la fila en viajes_transporte y deja la solicitud lista para nueva asignación */
export class AdminClearTripDto {
  @IsUUID()
  requestId!: string;

  @IsString()
  @MinLength(3, { message: "Indique el motivo (minimo 3 caracteres)." })
  @MaxLength(4000)
  motivo!: string;
}
