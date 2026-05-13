import { IsUUID } from "class-validator";

export class ClientRequestDeleteDto {
  @IsUUID()
  requestId!: string;
}
