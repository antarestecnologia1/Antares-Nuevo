/**
 * Reglas de flota del módulo Camiones (placa, VIN, Termoking, filtros).
 * Ejecutar: node qa/vehicles-module.test.mjs
 */
import assert from "node:assert/strict";
import {
  compareVehiclesByPlate,
  isValidColombianCargoPlate,
  normalizeVehiclePlate,
  validateVehicleFormPayload,
  vehicleComplianceState,
  vehicleDocumentRiskLevel,
  vehicleHasActiveGps,
  vehicleOperationalTone,
  vehiclePassesFleetFilters,
  vehicleTermokingBodyConflict,
  vehicleTypeKey
} from "../modules/domain/vehicles.logic.js";

const year = 2026;

function basePayload(overrides = {}) {
  return {
    plate: "ABC123",
    brand: "Kenworth",
    model: "T800",
    year,
    type: "Camion",
    color: "Blanco",
    capacityKg: 18000,
    refrigerated: "false",
    bodyType: "Furgon",
    fuelType: "Diesel",
    axleConfig: "4x2",
    engineNumber: "6BT59",
    vin: "1XKADB9X6CJ123456",
    ownershipCard: "12345678",
    soatExpeditionDate: "2026-01-10",
    soatExpiryDate: "2027-01-10",
    techInspectionExpeditionDate: "2026-02-01",
    techInspectionExpiryDate: "2027-02-01",
    hasGps: "false",
    ...overrides
  };
}

function ok(cond, msg) {
  assert.equal(Boolean(cond), true, msg);
}

const valid = validateVehicleFormPayload(basePayload(), [], { nowYear: year });
ok(valid.ok, "ficha válida");
ok(valid.value.refrigerated === false, "carga seca no se marca como Termoking");
ok(valid.value.type === "Camion", "tipo canónico");
ok(valid.value.hasGps === false, "sin GPS por defecto explícito");

const plate = validateVehicleFormPayload(basePayload({ plate: "abc-123" }), [], { nowYear: year });
ok(plate.ok && plate.value.plate === "ABC123", "normaliza placa");

const badPlate = validateVehicleFormPayload(basePayload({ plate: "AB12" }), [], { nowYear: year });
ok(!badPlate.ok && badPlate.field === "plate", "rechaza placa corta");

const dup = validateVehicleFormPayload(basePayload(), [{ id: "v1", plate: "abc123" }], { nowYear: year });
ok(!dup.ok && dup.field === "plate", "rechaza placa duplicada");

const same = validateVehicleFormPayload(basePayload(), [{ id: "v1", plate: "ABC123" }], {
  nowYear: year,
  ignoreId: "v1"
});
ok(same.ok, "permite la misma placa al editar ese vehículo");

const termoking = validateVehicleFormPayload(basePayload({ refrigerated: "" }), [], { nowYear: year });
ok(!termoking.ok && termoking.field === "refrigerated", "Termoking es una elección explícita");

const tkMismatch = validateVehicleFormPayload(
  basePayload({ bodyType: "Furgon refrigerado (Termoking)", refrigerated: "false" }),
  [],
  { nowYear: year }
);
ok(!tkMismatch.ok && tkMismatch.field === "refrigerated", "carrocería Termoking exige equipo");
ok(
  vehicleTermokingBodyConflict("Furgon seco", true)?.field === "refrigerated",
  "furgón seco no admite Termoking"
);
const tkAligned = validateVehicleFormPayload(
  basePayload({ bodyType: "Furgon refrigerado (Termoking)", refrigerated: "true" }),
  [],
  { nowYear: year }
);
ok(tkAligned.ok && tkAligned.value.refrigerated === true, "Termoking alineado con carrocería");

const yearBad = validateVehicleFormPayload(basePayload({ year: year + 2 }), [], { nowYear: year });
ok(!yearBad.ok && yearBad.field === "year", "rechaza año fuera de rango");

const vinDup = validateVehicleFormPayload(basePayload({ plate: "DEF456" }), [
  { id: "v9", plate: "ZZZ999", vin: "1XKADB9X6CJ123456" }
], { nowYear: year });
ok(!vinDup.ok && vinDup.field === "vin", "rechaza VIN duplicado");

const soat = validateVehicleFormPayload(
  basePayload({ soatExpiryDate: "2025-01-01" }),
  [],
  { nowYear: year }
);
ok(!soat.ok && soat.field === "soatExpiryDate", "SOAT no vence antes de expedirse");

const gps = validateVehicleFormPayload(basePayload({ hasGps: "true", gpsProvider: "" }), [], { nowYear: year });
ok(!gps.ok && gps.field === "gpsProvider", "GPS activo exige proveedor");

ok(vehicleHasActiveGps({}) === false, "GPS ausente no se muestra como activo");
ok(vehicleHasActiveGps({ hasGps: false }) === false, "GPS falso");
ok(vehicleHasActiveGps({ hasGps: "true" }) === true, "GPS verdadero en texto");

ok(isValidColombianCargoPlate(normalizeVehiclePlate("abc 123")), "placa con espacio");
ok(vehicleTypeKey("CAMIÓN") === "camion", "tipo con tilde");
ok(vehicleTypeKey("Tractocamión") === "tractomula", "tractocamión");

ok(vehicleOperationalTone({ available: false, autoBusy: false }, "scheduled") === "offline", "baja manual no cuenta como reservado");
ok(vehicleOperationalTone({ available: false, autoBusy: true }, "busy") === "busy", "ocupado por viaje");
ok(vehicleDocumentRiskLevel("status-rechazada", "status-viaje_asignado") === "expired", "documento vencido");
ok(vehicleDocumentRiskLevel("status-pendiente", "status-viaje_asignado") === "soon", "documento por vencer");
ok(vehicleComplianceState({ cls: "status-rechazada", days: -9999, label: "Sin fecha" }) === "missing", "sin fecha");
ok(vehicleComplianceState({ cls: "status-rechazada", days: -12, label: "Vencido hace 12 dias" }) === "expired", "vencido");
ok(vehicleComplianceState({ cls: "status-pendiente", days: 8, label: "Por vencer (8 dias)" }) === "soon", "por vencer");
ok(vehicleComplianceState({ cls: "status-viaje_asignado", days: 120, label: "Vigente (120 dias)" }) === "ok", "vigente");

const fleetItem = {
  searchBlob: "abc123 kenworth",
  tone: "offline",
  typeKey: "camion",
  soatState: "expired",
  techState: "ok",
  refrigerated: true,
  gps: false
};
ok(
  vehiclePassesFleetFilters(fleetItem, {
    status: "offline",
    type: "camion",
    soat: "expired",
    tech: "ok",
    equip: "termoking",
    gps: "off",
    search: "kenworth"
  }),
  "filtros de flota"
);
ok(!vehiclePassesFleetFilters(fleetItem, { soat: "missing" }), "SOAT vencido no es sin fecha");
ok(!vehiclePassesFleetFilters(fleetItem, { equip: "dry" }), "Termoking no pasa como carga seca");
ok(
  !vehiclePassesFleetFilters(
    { searchBlob: "abc123", tone: "available", typeKey: "turbo", soatState: "ok", techState: "ok", refrigerated: false, gps: true },
    { status: "busy" }
  ),
  "filtro de estado excluye"
);

const ordered = [{ plate: "BCA100" }, { plate: "ABC200" }].sort(compareVehiclesByPlate);
ok(ordered[0].plate === "ABC200", "orden por placa");

console.log("vehicles-module.test.mjs: ok");
