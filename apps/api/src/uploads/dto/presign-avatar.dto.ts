import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class PresignAvatarDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  fileName!: string;

  @IsString()
  @IsIn([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif"
  ])
  contentType!: string;
}
