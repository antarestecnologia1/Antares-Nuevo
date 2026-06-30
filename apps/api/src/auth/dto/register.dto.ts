import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsNotEmpty, IsOptional, MaxLength, MinLength } from "class-validator";
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

  @Transform(({ value }) => {
    if (value === "" || value === null) return undefined;
    return typeof value === "string" ? value.replace(/\u0000/g, "").trim() : value;
  })
  @IsOptional()
  @MaxLength(4096)
  turnstileToken?: string;
}
