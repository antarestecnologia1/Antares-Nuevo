import { IsBoolean } from "class-validator";

export class AcceptDataPolicyDto {
  @IsBoolean()
  acceptDataPolicy!: boolean;
}
