/**
 * Reglas puras de flota (placa, VIN, vigencia y filtros).
 * Sin DOM ni almacenamiento: lo consumen el módulo Camiones y las pruebas.
 */

const VEHICLE_TYPE_CANONICAL = {
  camion: "Camion",
  turbo: "Turbo",
  tractomula: "Tractomula",
  bus: "Bus"
};

const FLEET_STATUS_FILTERS = new Set(["all", "available", "busy", "scheduled", "offline"]);
const FLEET_TYPE_FILTERS = new Set(["all", "camion", "turbo", "tractomula", "bus", "other"]);
const FLEET_DOC_FILTERS = new Set(["all", "ok", "soon", "expired", "risk"]);
const FLEET_COMPLIANCE_FILTERS = new Set(["all", "ok", "soon", "expired", "missing"]);
const FLEET_EQUIP_FILTERS = new Set(["all", "termoking", "dry"]);
const FLEET_GPS_FILTERS = new Set(["all", "on", "off"]);

function stripMarks(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function normalizeVehiclePlate(raw) {
  return stripMarks(raw).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidColombianCargoPlate(raw) {
  return /^[A-Z]{3}[0-9]{3}$/.test(normalizeVehiclePlate(raw));
}

export function normalizeVehicleVin(raw) {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function isValidVehicleVin(raw) {
  return /^[A-Z0-9]{11,17}$/.test(normalizeVehicleVin(raw));
}

export function vehicleTypeKey(raw) {
  const key = stripMarks(raw).toLowerCase();
  if (key === "camion" || key === "truck") return "camion";
  if (key === "turbo") return "turbo";
  if (key === "tractomula" || key === "tractocamion" || key === "mula") return "tractomula";
  if (key === "bus") return "bus";
  return "other";
}

export function canonicalVehicleType(raw) {
  return VEHICLE_TYPE_CANONICAL[vehicleTypeKey(raw)] || "";
}

/** Tipo canónico de flota, o el texto legado si no está en el catálogo (máx. 40). */
export function resolveVehicleTypeForStorage(raw) {
  const canon = canonicalVehicleType(raw);
  if (canon) return canon;
  const trimmed = String(raw || "").trim();
  if (!trimmed || trimmed.length > 40) return "";
  return trimmed;
}

export function vehicleHasActiveGps(vehicle) {
  const raw = vehicle?.hasGps;
  if (raw === true || raw === 1) return true;
  if (typeof raw === "string") {
    const token = stripMarks(raw).toLowerCase();
    return token === "true" || token === "t" || token === "1" || token === "si" || token === "yes";
  }
  return false;
}

export function vehicleHasRefrigeration(vehicle) {
  const raw = vehicle?.refrigerated ?? vehicle?.refrigerado_termoking;
  if (raw === true || raw === 1) return true;
  if (typeof raw === "string") {
    const token = stripMarks(raw).toLowerCase();
    return token === "true" || token === "t" || token === "1" || token === "si" || token === "yes";
  }
  return false;
}

/** Carrocería del catálogo que implica equipo Termoking. */
export function bodyTypeImpliesTermoking(raw) {
  const token = stripMarks(raw).toLowerCase();
  return token.includes("termoking") || /\brefrigerad/.test(token);
}

/** Carrocería explícitamente de carga seca. */
export function bodyTypeImpliesDryCargo(raw) {
  const token = stripMarks(raw).toLowerCase();
  return token.includes("furgon seco") || token.includes("carga seca");
}

/**
 * Detecta choque entre carrocería y el select Termoking.
 * @returns {{ field: string, message: string } | null}
 */
export function vehicleTermokingBodyConflict(bodyType, refrigerated) {
  if (bodyTypeImpliesTermoking(bodyType) && refrigerated === false) {
    return {
      field: "refrigerated",
      message: "La carrocería indica equipo Termoking. Seleccione «Sí, equipo Termoking»."
    };
  }
  if (bodyTypeImpliesDryCargo(bodyType) && refrigerated === true) {
    return {
      field: "refrigerated",
      message: "La carrocería es de carga seca. Seleccione «No, carga seca» o cambie el tipo de carrocería."
    };
  }
  return null;
}

export function vehicleSearchBlob(vehicle) {
  const row = vehicle && typeof vehicle === "object" ? vehicle : {};
  const parts = [
    row.plate,
    row.brand,
    row.model,
    row.type,
    row.year,
    row.color,
    row.vin,
    row.engineNumber,
    row.ownershipCard,
    row.gpsProvider,
    row.bodyType,
    row.fuelType,
    row.axleConfig,
    row.capacityKg,
    row.rcPolicyContract,
    row.rcPolicyExtra,
    row.status,
    row.companyName,
    vehicleHasActiveGps(row) ? "gps activo" : "sin gps",
    vehicleHasRefrigeration(row) ? "termoking refrigerado" : "seco carga seca"
  ];
  return parts.map((item) => String(item ?? "").toLowerCase()).join(" ");
}

/** Un camión cuenta en un solo estado: la baja manual prima sobre el viaje. */
export function vehicleOperationalTone(vehicle, occupancyTone) {
  if (vehicle && vehicle.available === false && vehicle.autoBusy !== true) return "offline";
  if (occupancyTone === "busy") return "busy";
  if (occupancyTone === "scheduled") return "scheduled";
  return "available";
}

/** `expired` = vencido o sin fecha; `soon` = por vencer; `ok` = vigente. */
export function vehicleDocumentRiskLevel(soatClass, techClass) {
  const classes = [soatClass, techClass].map((item) => String(item || ""));
  if (classes.some((item) => item === "status-rechazada" || item === "status-vencida")) return "expired";
  if (classes.some((item) => item === "status-pendiente")) return "soon";
  return "ok";
}

/** Estado de un documento tal como lo muestra la ficha: vigente, por vencer, vencido o sin fecha. */
export function vehicleComplianceState(status) {
  const cls = String(status?.cls || "");
  const days = Number(status?.days);
  const label = stripMarks(status?.label).toLowerCase();
  if (label.startsWith("sin fecha") || days === -9999) return "missing";
  if (cls === "status-rechazada" || cls === "status-vencida") return "expired";
  if (cls === "status-pendiente") return "soon";
  return "ok";
}

export function normalizeVehicleFleetStatusFilter(raw) {
  const value = String(raw || "all").trim().toLowerCase();
  return FLEET_STATUS_FILTERS.has(value) ? value : "all";
}

export function normalizeVehicleFleetTypeFilter(raw) {
  const value = String(raw || "all").trim().toLowerCase();
  return FLEET_TYPE_FILTERS.has(value) ? value : "all";
}

export function normalizeVehicleFleetDocFilter(raw) {
  const value = String(raw || "all").trim().toLowerCase();
  return FLEET_DOC_FILTERS.has(value) ? value : "all";
}

export function normalizeVehicleFleetComplianceFilter(raw) {
  const value = String(raw || "all").trim().toLowerCase();
  return FLEET_COMPLIANCE_FILTERS.has(value) ? value : "all";
}

export function normalizeVehicleFleetEquipFilter(raw) {
  const value = String(raw || "all").trim().toLowerCase();
  return FLEET_EQUIP_FILTERS.has(value) ? value : "all";
}

export function normalizeVehicleFleetGpsFilter(raw) {
  const value = String(raw || "all").trim().toLowerCase();
  return FLEET_GPS_FILTERS.has(value) ? value : "all";
}

export function vehiclePassesFleetFilters(item, filters = {}) {
  const status = normalizeVehicleFleetStatusFilter(filters.status);
  const type = normalizeVehicleFleetTypeFilter(filters.type);
  const soat = normalizeVehicleFleetComplianceFilter(filters.soat);
  const tech = normalizeVehicleFleetComplianceFilter(filters.tech);
  const equip = normalizeVehicleFleetEquipFilter(filters.equip);
  const gps = normalizeVehicleFleetGpsFilter(filters.gps);
  const query = String(filters.search || "").trim().toLowerCase();
  if (query && !String(item?.searchBlob || "").toLowerCase().includes(query)) return false;
  if (status !== "all" && String(item?.tone || "") !== status) return false;
  if (type !== "all" && String(item?.typeKey || "") !== type) return false;
  if (soat !== "all" && String(item?.soatState || "") !== soat) return false;
  if (tech !== "all" && String(item?.techState || "") !== tech) return false;
  if (equip === "termoking" && item?.refrigerated !== true) return false;
  if (equip === "dry" && item?.refrigerated === true) return false;
  if (gps === "on" && item?.gps !== true) return false;
  if (gps === "off" && item?.gps === true) return false;
  return true;
}

export function compareVehiclesByPlate(a, b) {
  return String(a?.plate || "").localeCompare(String(b?.plate || ""), "es", {
    numeric: true,
    sensitivity: "base"
  });
}

function fail(field, message) {
  return { ok: false, field, message };
}

function requiredText(data, field, label, max) {
  const value = String(data?.[field] ?? "").trim();
  if (!value) return fail(field, `Indique ${label}.`);
  if (max && value.length > max) return fail(field, `${label} no puede superar ${max} caracteres.`);
  return { ok: true, value };
}

function requiredYmd(data, field, label) {
  const value = String(data?.[field] ?? "").trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return fail(field, `Indique una fecha válida de ${label}.`);
  return { ok: true, value };
}

function parseBoolSelect(raw) {
  if (raw === true) return true;
  if (raw === false) return false;
  const token = stripMarks(raw).toLowerCase();
  if (token === "true" || token === "1" || token === "si" || token === "yes") return true;
  if (token === "false" || token === "0" || token === "no") return false;
  return null;
}

function sameVehicleId(row, ignoreId) {
  return String(row?.id || "").trim() === String(ignoreId || "").trim();
}

/**
 * Valida alta o edición de un vehículo de flota.
 * @returns {{ ok: true, value: object } | { ok: false, field: string, message: string }}
 */
export function validateVehicleFormPayload(data, vehicles, options = {}) {
  const source = data && typeof data === "object" ? data : {};
  const list = Array.isArray(vehicles) ? vehicles : [];
  const ignoreId = String(options.ignoreId || "").trim();
  const nowYear = Number(options.nowYear) || new Date().getFullYear();

  const plate = normalizeVehiclePlate(source.plate);
  if (!isValidColombianCargoPlate(plate)) {
    return fail("plate", "Placa no válida. Use el formato colombiano de tres letras y tres números (ej. ABC123).");
  }
  const plateOwner = list.find((row) => !sameVehicleId(row, ignoreId) && normalizeVehiclePlate(row?.plate) === plate);
  if (plateOwner) {
    return fail("plate", `La placa ${plate} ya está registrada en la flota.`);
  }

  const brand = requiredText(source, "brand", "la marca", 120);
  if (!brand.ok) return brand;
  const model = requiredText(source, "model", "la línea o modelo", 120);
  if (!model.ok) return model;

  const year = Number(source.year);
  if (!Number.isInteger(year) || year < 1990 || year > nowYear + 1) {
    return fail("year", `El año de modelo debe estar entre 1990 y ${nowYear + 1}.`);
  }

  const type = resolveVehicleTypeForStorage(source.type);
  if (!type) return fail("type", "Seleccione un tipo de vehículo válido.");
  const color = requiredText(source, "color", "el color", 64);
  if (!color.ok) return color;

  const capacityKg = Number(String(source.capacityKg ?? "").replace(",", "."));
  if (!Number.isFinite(capacityKg) || capacityKg <= 0 || capacityKg > 200000) {
    return fail("capacityKg", "Indique una capacidad mayor que cero, en kilogramos.");
  }

  const refrigerated = parseBoolSelect(source.refrigerated);
  if (refrigerated === null) {
    return fail("refrigerated", "Indique si el vehículo tiene equipo Termoking.");
  }

  const bodyType = requiredText(source, "bodyType", "el tipo de carrocería", 120);
  if (!bodyType.ok) return bodyType;
  const termokingConflict = vehicleTermokingBodyConflict(bodyType.value, refrigerated);
  if (termokingConflict) return fail(termokingConflict.field, termokingConflict.message);
  const fuelType = requiredText(source, "fuelType", "el tipo de combustible", 80);
  if (!fuelType.ok) return fuelType;
  const axleConfig = requiredText(source, "axleConfig", "la configuración de ejes", 80);
  if (!axleConfig.ok) return axleConfig;
  const engineNumber = requiredText(source, "engineNumber", "el número de motor", 80);
  if (!engineNumber.ok) return engineNumber;

  const vin = normalizeVehicleVin(source.vin);
  if (!isValidVehicleVin(vin)) {
    return fail("vin", "El chasis (VIN) debe tener entre 11 y 17 caracteres alfanuméricos.");
  }
  const vinOwner = list.find((row) => !sameVehicleId(row, ignoreId) && normalizeVehicleVin(row?.vin) === vin);
  if (vinOwner) {
    return fail("vin", `El chasis ${vin} ya está registrado en el vehículo ${normalizeVehiclePlate(vinOwner.plate) || "de la flota"}.`);
  }

  const ownershipCard = requiredText(source, "ownershipCard", "el número de tarjeta de propiedad", 64);
  if (!ownershipCard.ok) return ownershipCard;

  const soatExpeditionDate = requiredYmd(source, "soatExpeditionDate", "expedición del SOAT");
  if (!soatExpeditionDate.ok) return soatExpeditionDate;
  const soatExpiryDate = requiredYmd(source, "soatExpiryDate", "vencimiento del SOAT");
  if (!soatExpiryDate.ok) return soatExpiryDate;
  if (soatExpiryDate.value < soatExpeditionDate.value) {
    return fail("soatExpiryDate", "El vencimiento del SOAT no puede ser anterior a la fecha de expedición.");
  }

  const techInspectionExpeditionDate = requiredYmd(source, "techInspectionExpeditionDate", "expedición de la tecnomecánica");
  if (!techInspectionExpeditionDate.ok) return techInspectionExpeditionDate;
  const techInspectionExpiryDate = requiredYmd(source, "techInspectionExpiryDate", "vencimiento de la tecnomecánica");
  if (!techInspectionExpiryDate.ok) return techInspectionExpiryDate;
  if (techInspectionExpiryDate.value < techInspectionExpeditionDate.value) {
    return fail(
      "techInspectionExpiryDate",
      "El vencimiento de la tecnomecánica no puede ser anterior a la fecha de expedición."
    );
  }

  const rcPolicyContract = String(source.rcPolicyContract || "").trim();
  const rcPolicyExtra = String(source.rcPolicyExtra || "").trim();
  if (rcPolicyContract.length > 64) return fail("rcPolicyContract", "La póliza RC contractual no puede superar 64 caracteres.");
  if (rcPolicyExtra.length > 64) return fail("rcPolicyExtra", "La póliza RC extracontractual no puede superar 64 caracteres.");
  const rcPolicyExpiry = String(source.rcPolicyExpiry || "").trim().slice(0, 10);
  if (rcPolicyExpiry && !/^\d{4}-\d{2}-\d{2}$/.test(rcPolicyExpiry)) {
    return fail("rcPolicyExpiry", "Indique una fecha válida de vencimiento de las pólizas RCP.");
  }

  const hasGps = parseBoolSelect(source.hasGps);
  const gpsOn = hasGps === true;
  const gpsProvider = String(source.gpsProvider || "").trim();
  if (gpsOn && !gpsProvider) {
    return fail("gpsProvider", "Indique el proveedor GPS si el vehículo tiene rastreo satelital.");
  }
  if (gpsProvider.length > 120) return fail("gpsProvider", "El proveedor GPS no puede superar 120 caracteres.");

  return {
    ok: true,
    value: {
      plate,
      brand: brand.value,
      model: model.value,
      year,
      type,
      color: color.value,
      capacityKg,
      refrigerated,
      bodyType: bodyType.value,
      fuelType: fuelType.value,
      axleConfig: axleConfig.value,
      engineNumber: engineNumber.value,
      vin,
      ownershipCard: ownershipCard.value,
      soatExpeditionDate: soatExpeditionDate.value,
      soatExpiryDate: soatExpiryDate.value,
      techInspectionExpeditionDate: techInspectionExpeditionDate.value,
      techInspectionExpiryDate: techInspectionExpiryDate.value,
      rcPolicyContract,
      rcPolicyExtra,
      rcPolicyExpiry,
      hasGps: gpsOn,
      gpsProvider,
      satelliteProviderUser: String(source.satelliteProviderUser || "").trim(),
      satelliteProviderPassword: String(source.satelliteProviderPassword || "").trim()
    }
  };
}
