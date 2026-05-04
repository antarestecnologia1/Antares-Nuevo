import { IsString, MinLength } from "class-validator";

export class CompletePasswordRecoveryDto {
  @IsString()
  @MinLength(10, { message: "La contraseña debe tener al menos 10 caracteres." })
  password!: string;
}
