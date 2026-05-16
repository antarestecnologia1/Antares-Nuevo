import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

/** Query opcional para GET /public/transport-request-coverage-stats */
export class CoverageStatsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(36)
  months?: number;
}
