import { Type } from "class-transformer";
import {
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

/** Postulación pública (index.html sección Carreras). */
export class CreateJobApplicationDto {
  @IsUUID("4")
  vacancyId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  phone!: string;

  @IsString()
  @IsIn(["CC", "CE", "PAS"])
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(32)
  idDoc!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

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
  @IsString()
  @MaxLength(12000)
  experience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  attachmentFileName?: string;
}
