import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsNotEmpty, MinLength } from "class-validator";
import { transformStripEmail, transformStripUpper } from "../../common/normalize-db-text";

export class RegisterDto {
  @Transform(transformStripUpper)
  @IsNotEmpty()
  name!: string;

  @Transform(transformStripEmail)
  @IsEmail()
  email!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "") : value))
  @MinLength(8)
  password!: string;

  @IsIn(["CLIENT"])
  role!: "CLIENT";
}
