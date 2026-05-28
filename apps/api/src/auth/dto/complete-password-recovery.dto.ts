import { Transform } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class CompletePasswordRecoveryDto {
  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "") : value))
  @IsString()
  @MinLength(10, { message: "La contraseña debe tener al menos 10 caracteres." })
  password!: string;
}
