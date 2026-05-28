import { Transform, Type } from "class-transformer";
import {
  Allow,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import {
  transformStripCatalog,
  transformStripDoc,
  transformStripEmail,
  transformStripMultiline,
  transformStripNulTrim,
  transformStripPhoneDigits,
  transformStripUpper
} from "../../common/normalize-db-text";

/** Postulación pública (index.html sección Carreras). */
export class CreateJobApplicationDto {
  @IsUUID("4")
  vacancyId!: string;

  @Transform(transformStripUpper)
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @Transform(transformStripEmail)
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @Transform(transformStripPhoneDigits)
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(15)
  phone!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim().toUpperCase() : value))
  @IsString()
  @IsIn(["CC", "CE", "PAS"])
  documentType!: string;

  @Transform(transformStripDoc)
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(32)
  idDoc!: string;

  @Transform(transformStripCatalog)
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

  @Transform(transformStripUpper)
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(2000)
  address!: string;

  /** YYYY-MM-DD */
  @IsDateString()
  birthDate!: string;

  /** Años de experiencia laboral en cargos similares al de la vacante. */
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(65)
  experienceYears!: number;

  /** Resumen libre opcional (el formulario público puede omitirlo). */
  @IsOptional()
  @Transform(transformStripMultiline)
  @IsString()
  @MaxLength(12000)
  experience?: string;

  @IsOptional()
  @Transform(transformStripNulTrim)
  @IsString()
  @MaxLength(512)
  attachmentFileName?: string;

  /** Ignorado: el binario llega por multer (`FileInterceptor('attachment')`). Evita 400 del ValidationPipe global. */
  @Allow()
  @IsOptional()
  attachment?: unknown;
}
