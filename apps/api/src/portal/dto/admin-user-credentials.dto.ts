import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from "class-validator";
import { transformStripEmail } from "../../common/normalize-db-text";

export class AdminUserCredentialsDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @Transform(transformStripEmail)
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "") : value))
  @IsString()
  @MinLength(10)
  password?: string;
}
