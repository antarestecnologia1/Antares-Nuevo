import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

const ISO_OR_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:?\d{2})?$/;

/** POST /portal/transport-schedule-busy — recursos ocupados por solape de horario (una query). */
export class TransportScheduleBusyDto {
  @IsString()
  @IsNotEmpty()
  @Matches(ISO_OR_OFFSET, { message: "pickupAt debe ser ISO 8601" })
  pickupAt!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(ISO_OR_OFFSET, { message: "deliveryAt debe ser ISO 8601" })
  deliveryAt!: string;

  @IsOptional()
  @IsString()
  excludeRequestId?: string;
}
