import { IsBoolean, IsOptional } from "class-validator";

/** Aceptaciones legales pendientes al ingresar (cada campo es independiente). */
export class AcceptDataPolicyDto {
  @IsOptional()
  @IsBoolean()
  acceptDataPolicy?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;
}
