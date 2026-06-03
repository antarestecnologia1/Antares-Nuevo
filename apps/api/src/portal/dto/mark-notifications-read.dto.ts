import { IsArray, IsUUID } from "class-validator";

export class MarkNotificationsReadDto {
  @IsArray()
  @IsUUID("4", { each: true })
  ids!: string[];
}
