import { Type } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

/** Payload alineado con el formulario index.html (#b2b-form). */
export class CreateB2bProspectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  company!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  taxId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  position!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phone!: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  serviceType!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  operationType!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  operationFrequency!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  startWindow!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(999999999)
  monthlyVolumeKg!: number;

  @IsString()
  @MinLength(30)
  @MaxLength(8000)
  message!: string;
}
