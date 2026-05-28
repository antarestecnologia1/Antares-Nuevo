import { Transform } from "class-transformer";
import { IsString, IsUUID, MinLength } from "class-validator";

export class RefreshTokenDto {
  @IsUUID("4")
  userId!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "").trim() : value))
  @IsString()
  @MinLength(16)
  refreshToken!: string;
}
