import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, IsUUID, MaxLength, Matches } from "class-validator";

const UNLINK_CATEGORIES = [
  "renuncia_voluntaria",
  "despido_sin_justa",
  "despido_justa",
  "mutuo_acuerdo",
  "vencimiento_contrato",
  "otro"
] as const;

export class AdminEmployeeDeleteDto {
  @IsUUID()
  employeeId!: string;

  /** YYYY-MM-DD. Si se omite, se usa la fecha de hoy (Colombia). */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "unlinkDate debe ser YYYY-MM-DD" })
  unlinkDate?: string;

  /** Se acepta en cualquier capitalización (el formulario antiguo enviaba RENUNCIA_VOLUNTARIA) y se normaliza a minúsculas. */
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsString()
  @IsIn([...UNLINK_CATEGORIES])
  unlinkCategory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  unlinkReason?: string;
}
