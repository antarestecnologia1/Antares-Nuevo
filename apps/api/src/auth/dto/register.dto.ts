import { IsEmail, IsIn, IsNotEmpty, MinLength } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsIn(["CLIENT", "RRHH", "ADMIN"])
  role!: "CLIENT" | "RRHH" | "ADMIN";
}
