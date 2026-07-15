import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class PresignEmployeeDocumentDto {
  @IsUUID("4")
  employeeId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  contentType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  documentType?: string;
}

export class DownloadEmployeeDocumentDto {
  @IsUUID("4")
  employeeId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  storageKey!: string;
}
