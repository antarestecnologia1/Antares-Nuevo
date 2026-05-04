import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(12000)
  experience!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  attachmentFileName?: string;
}
