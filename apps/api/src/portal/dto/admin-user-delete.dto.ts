import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class AdminUserDeleteDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(3, { message: "Indique el motivo (mínimo 3 caracteres)." })
  @MaxLength(4000)
  motivo!: string;
}
