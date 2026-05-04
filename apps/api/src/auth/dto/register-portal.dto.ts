import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from "class-validator";

/** Cadenas vacías del JSON → undefined (class-validator trata "" como valor presente). */
function emptyToUndefined({ value }: { value: unknown }) {
  if (value === "" || value === null) return undefined;
  return value;
}

/** Registro cliente (#form-register) → tabla usuarios. */
export class RegisterPortalDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  firstName!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  lastName!: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  secondLastName?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  middleName?: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  personType!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  documentType!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  taxId!: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  companyNit?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  personalTaxId?: string;

  /** CC | CE del representante cuando personType es jurídica (formulario `personalDocumentType`). */
  @Transform(emptyToUndefined)
  @IsOptional()
  @MaxLength(8)
  personalDocumentType?: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  birthDate!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  gender!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  position!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  workArea!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  phone!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  department!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  city!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty()
  address!: string;

  @Transform(({ value }) => (typeof value === "string" ? String(value).trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @MinLength(10)
  password!: string;

  @Transform(({ value }) => value === true || value === "on" || value === "true")
  @IsBoolean()
  acceptTerms!: boolean;
}
