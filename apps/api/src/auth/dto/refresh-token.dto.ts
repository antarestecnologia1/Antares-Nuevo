import { IsString, IsUUID, MinLength } from "class-validator";

export class RefreshTokenDto {
  @IsUUID("4")
  userId!: string;

  @IsString()
  @MinLength(16)
  refreshToken!: string;
}
