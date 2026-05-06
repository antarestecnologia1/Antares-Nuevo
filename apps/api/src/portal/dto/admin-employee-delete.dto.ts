import { IsUUID } from "class-validator";

export class AdminEmployeeDeleteDto {
  @IsUUID()
  employeeId!: string;
}
