import { Transform } from "class-transformer";
import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";

/** Cuerpo opcional: la sesión puede renovarse solo con cookies HttpOnly. */
export class RefreshTokenDto {
  @IsOptional()
  @IsUUID("4")
  userId?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "").trim() : value))
  @IsString()
  @MinLength(16)
  refreshToken?: string;
}
