import { IsOptional, IsString, IsUUID, MaxLength, Matches } from "class-validator";

export class AdminEmployeeReinstateDto {
  @IsUUID()
  employeeId!: string;

  /** YYYY-MM-DD. Si se omite, se usa la fecha de hoy. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "reinstateDate debe ser YYYY-MM-DD" })
  reinstateDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
