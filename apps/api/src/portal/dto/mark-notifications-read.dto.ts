import { IsArray, IsUUID } from "class-validator";

export class MarkNotificationsReadDto {
  @IsArray()
  @IsUUID("all", { each: true })
  ids!: string[];
}
