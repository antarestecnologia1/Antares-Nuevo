import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";

/** Registro cliente (#form-register) → tabla usuarios. */
export class RegisterPortalDto {
  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  secondLastName?: string;

  @IsOptional()
  middleName?: string;

  @IsNotEmpty()
  personType!: string;

  @IsNotEmpty()
  documentType!: string;

  @IsNotEmpty()
  taxId!: string;

  @IsNotEmpty()
  documentIssuedAt!: string;

  @IsNotEmpty()
  birthDate!: string;

  @IsNotEmpty()
  gender!: string;

  @IsNotEmpty()
  position!: string;

  @IsNotEmpty()
  workArea!: string;

  @IsNotEmpty()
  phone!: string;

  @IsNotEmpty()
  department!: string;

  @IsNotEmpty()
  city!: string;

  @IsNotEmpty()
  address!: string;

  @IsEmail()
  email!: string;

  @MinLength(10)
  password!: string;

  @Transform(({ value }) => value === true || value === "on" || value === "true")
  @IsBoolean()
  acceptTerms!: boolean;
}
