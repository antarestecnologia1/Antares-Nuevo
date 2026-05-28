import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, Matches, MaxLength, MinLength } from "class-validator";
import { transformStripCatalog, transformStripEmail, transformStripUpper } from "../../common/normalize-db-text";
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
  @Transform(transformStripUpper)
  @IsNotEmpty()
  firstName!: string;

  @Transform(transformStripUpper)
  @IsNotEmpty()
  lastName!: string;

  @Transform(({ value }) => {
    const t = typeof value === "string" ? value.replace(/\u0000/g, "").trim() : value;
    if (t === "" || t == null) return undefined;
    return transformStripUpper({ value: t });
  })
  @IsOptional()
  secondLastName?: string;

  @Transform(({ value }) => {
    const t = typeof value === "string" ? value.replace(/\u0000/g, "").trim() : value;
    if (t === "" || t == null) return undefined;
    return transformStripUpper({ value: t });
  })
  @IsOptional()
  middleName?: string;

  @TransformStripNulTrim()
  @IsNotEmpty()
  personType!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\u0000/g, "").trim().toUpperCase() : value))
  @IsNotEmpty()
  documentType!: string;

  @Transform(transformStripUpper)
  @IsNotEmpty()
  taxId!: string;

  @Transform(({ value }) => {
    const t = typeof value === "string" ? value.replace(/\u0000/g, "").trim() : value;
    if (t === "" || t == null) return undefined;
    return transformStripUpper({ value: t });
  })
  @IsOptional()
  companyNit?: string;

  @Transform(({ value }) => {
    const t = typeof value === "string" ? value.replace(/\u0000/g, "").trim() : value;
    if (t === "" || t == null) return undefined;
    return transformStripUpper({ value: t });
  })
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

  @Transform(transformStripUpper)
  @IsNotEmpty()
  gender!: string;

  @Transform(transformStripUpper)
  @IsNotEmpty()
  position!: string;

  @Transform(transformStripUpper)
  @IsNotEmpty()
  workArea!: string;

  @Transform(transformStripUpper)
  @IsNotEmpty()
  phone!: string;

  @Transform(transformStripCatalog)
  @IsNotEmpty()
  department!: string;

  @Transform(transformStripCatalog)
  @IsNotEmpty()
  city!: string;

  @Transform(transformStripUpper)
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
