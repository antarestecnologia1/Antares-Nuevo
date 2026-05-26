import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsNotEmpty, MinLength } from "class-validator";

export class RegisterDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  name!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsIn(["CLIENT"])
  role!: "CLIENT";
}
