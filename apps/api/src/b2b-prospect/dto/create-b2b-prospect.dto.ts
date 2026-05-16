import { Transform, Type } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import { TransformStripNulTrim } from "../../common/transformers/strip-nul-trim.transform";

function normalizeCoNit(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return value.replace(/\u0000/g, "").replace(/[\s.]/g, "").trim();
}

/** Payload alineado con el formulario index.html (#b2b-form). */
export class CreateB2bProspectDto {
  @TransformStripNulTrim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  @Matches(/^[\p{L}\p{M}\s'.-]{2,255}$/u, {
    message: "El nombre solo debe incluir letras y separadores habituales (sin números ni símbolos raros)."
  })
  name!: string;

  @TransformStripNulTrim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  company!: string;

  @Transform(({ value }) => normalizeCoNit(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^\d{8,10}(-\d)?$/, {
    message: "El NIT no tiene un formato colombiano válido (ej. 900123456 o 900123456-7)."
  })
  taxId!: string;

  @TransformStripNulTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  position!: string;

  @TransformStripNulTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phone!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "").trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @TransformStripNulTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  serviceType!: string;

  @TransformStripNulTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  operationType!: string;

  @TransformStripNulTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  operationFrequency!: string;

  @TransformStripNulTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  startWindow!: string;

  /** Opcional: el formulario público ya no lo solicita; se persiste 0 en base de datos. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(999999999)
  monthlyVolumeKg?: number;

  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "").trim() : value))
  @IsString()
  @MinLength(30)
  @MaxLength(8000)
  message!: string;
}
