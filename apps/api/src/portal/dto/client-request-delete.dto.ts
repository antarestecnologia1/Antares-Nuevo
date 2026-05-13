import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class ClientRequestDeleteDto {
  @IsUUID()
  requestId!: string;

  @IsString()
  @MinLength(3, { message: "Indique el motivo (minimo 3 caracteres)." })
  @MaxLength(4000)
  motivo!: string;
}
