import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (value === true || value === 1 || value === "true" || value === "on" || value === "1") return true;
  if (value === false || value === 0 || value === "false" || value === "0") return false;
  return undefined;
}

/** Aceptaciones legales pendientes al ingresar (cada campo es independiente). */
export class AcceptDataPolicyDto {
  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  acceptDataPolicy?: boolean;

  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  acceptTerms?: boolean;
}
