import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class DownloadCompanyDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  storageKey!: string;

  /** "inline" para vista previa embebida; "attachment" (por defecto) para descarga. */
  @IsOptional()
  @IsIn(["inline", "attachment"])
  disposition?: "inline" | "attachment";

  /** Nombre sugerido para el archivo descargado. */
  @IsOptional()
  @IsString()
  @MaxLength(512)
  fileName?: string;
}
