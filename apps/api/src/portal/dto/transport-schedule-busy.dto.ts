import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Matches, IsUUID } from "class-validator";
import { transformStripNulTrim } from "../../common/normalize-db-text";

const ISO_OR_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:?\d{2})?$/;

/** POST /portal/transport-schedule-busy — recursos ocupados por solape de horario (una query). */
export class TransportScheduleBusyDto {
  @Transform(transformStripNulTrim)
  @IsString()
  @IsNotEmpty()
  @Matches(ISO_OR_OFFSET, { message: "pickupAt debe ser ISO 8601" })
  pickupAt!: string;

  @Transform(transformStripNulTrim)
  @IsString()
  @IsNotEmpty()
  @Matches(ISO_OR_OFFSET, { message: "deliveryAt debe ser ISO 8601" })
  deliveryAt!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === "") return undefined;
    return transformStripNulTrim({ value });
  })
  @IsUUID("4")
  excludeRequestId?: string;
}
