import { IsOptional, IsUUID } from "class-validator";

export class AdminClearUserSessionsDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}
