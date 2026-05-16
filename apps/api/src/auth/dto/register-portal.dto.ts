import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, Matches, MaxLength, MinLength } from "class-validator";
import { TransformStripNulTrim } from "../../common/transformers/strip-nul-trim.transform";

/** Cadenas vacías del JSON → undefined (class-validator trata "" como valor presente). */
function emptyToUndefined({ value }: { value: unknown }) {
  if (value === "" || value === null) return undefined;
  if (typeof value === "string") {
    const t = value.replace(/\u0000/g, "").trim();
    return t === "" ? undefined : t;
  }
  return value;
}

/** Registro cliente (#form-register) → tabla usuarios. */
export class RegisterPortalDto {
  @TransformStripNulTrim()
  @IsNotEmpty()
  firstName!: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  lastName!: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  secondLastName?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  middleName?: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  personType!: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  documentType!: string;

  @TransformStripNulTrim()
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

  @TransformStripNulTrim()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha de nacimiento debe tener formato AAAA-MM-DD." })
  birthDate!: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  gender!: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  position!: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  workArea!: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  phone!: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  department!: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  city!: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  address!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "").trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @Transform(({ value }) => (typeof value === "string" ? String(value).trim().toLowerCase() : value))
  @IsIn(["cliente", "empleado_interno"])
  registrationKind!: "cliente" | "empleado_interno";

  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "") : value))
  @MinLength(10)
  password!: string;

  @Transform(({ value }) => value === true || value === "on" || value === "true")
  @IsBoolean()
  acceptTerms!: boolean;

  /** Token Turnstile generado por el widget en el portal. Opcional: si CF_TURNSTILE_REQUIRED=false el backend lo ignora. */
  @Transform(emptyToUndefined)
  @IsOptional()
  @MaxLength(4096)
  turnstileToken?: string;
}
