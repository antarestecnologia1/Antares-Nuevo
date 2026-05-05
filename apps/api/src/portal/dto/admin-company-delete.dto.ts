import { IsUUID } from "class-validator";

export class AdminCompanyDeleteDto {
  @IsUUID()
  companyId!: string;
}
