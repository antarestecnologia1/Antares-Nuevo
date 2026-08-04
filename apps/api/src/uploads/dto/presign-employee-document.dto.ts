import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength
} from "class-validator";

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

  @IsOptional()
  @IsString()
  @MaxLength(128)
  folder?: string;
}

export class DownloadEmployeeDocumentDto {
  @IsUUID("4")
  employeeId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  storageKey!: string;
}

/** Exportación ZIP de una o varias carpetas del expediente de un colaborador. */
export class ExportEmployeeDocumentsDto {
  @IsUUID("4")
  employeeId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(128, { each: true })
  folders!: string[];
}
