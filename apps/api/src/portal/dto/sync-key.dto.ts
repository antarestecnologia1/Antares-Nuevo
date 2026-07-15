import { Allow, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

/** Nombres lógicos alineados con el portal (app.js KEYS). */
export const PORTAL_SYNC_KEYS = [
  "users",
  "companies",
  "counters",
  "contacts",
  "requests",
  "vehicles",
  "drivers",
  "notifications",
  "emails",
  "payrollEmployees",
  "payrollRuns",
  "fuelLogs",
  "vehicleTechnicalLogs",
  "travelAllowanceRules",
  "vacancies",
  "candidates",
  "positions",
  "interviews",
  "contracts",
  "hrAbsences",
  "sstCompliance",
  "employeeDocuments",
  "tripRouteRates",
  "approvals"
] as const;

export type PortalSyncKey = (typeof PORTAL_SYNC_KEYS)[number];

export class SyncKeyDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([...PORTAL_SYNC_KEYS])
  key!: PortalSyncKey;

  @Allow()
  data!: unknown;

  /** UUIDs borrados explícitamente (p. ej. último ítem de un catálogo HR). */
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  deletedIds?: string[];
}
