import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class AdminUserCredentialsDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  password?: string;
}
