import { Allow, IsIn, IsNotEmpty, IsString } from "class-validator";

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
}
