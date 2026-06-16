/**
 * Extrae modales de transporte/RRHH/flota desde portal-runtime.js.
 */
import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const runtimePath = path.join(root, "modules/core/portal-runtime.js");
const lines = fs.readFileSync(runtimePath, "utf8").split(/\r?\n/);

const GLOBAL_REFS = [
  "openInfoModal",
  "openEditModal",
  "openPortalDetailSheet",
  "canAdminEditTrip",
  "notify",
  "IC",
  "escapeHtml",
  "escapeAttr",
  "parseNum",
  "formatRoute",
  "requestTruckRequirementSummaryHtml",
  "fmtDate",
  "fmtDateOr",
  "prettyStatus",
  "getCompanyById",
  "companyProfileLogoUrl",
  "requestRequiresTermoking",
  "requestTransportModeFromRequest",
  "renderRequestModificationLogSectionHtml",
  "parsePortalJsonSnapshot",
  "snapPick",
  "read",
  "readArray",
  "write",
  "KEYS",
  "toInputDate",
  "reqRead",
  "reqWriteAwait",
  "recalculateResourceAvailability",
  "renderPortalView",
  "currentUser",
  "nowIso",
  "getTripRouteRatesNormalized",
  "parseTripRateStorageKeyToRouteParts",
  "formatRouteRateAuditSummary",
  "buildRouteRateScopeStepInnerHtml",
  "COLOMBIA_LOCATIONS",
  "humanTripRateRouteLabelFromStorageKey",
  "setSelectValueInsensitive",
  "attachDepartmentCitySelects",
  "wireRouteRateScopeSection",
  "failPortalField",
  "userMessage",
  "buildTripRouteRateKey",
  "tripRateStorageKey",
  "buildRouteRateEntry",
  "writeAwaitServer",
  "ensureCrudModalElement",
  "renderModalHead",
  "renderModalFooterActions",
  "wireModalDismiss",
  "scrollOpenCrudModalIntoView",
  "state",
  "persistHrWorkspace",
  "scrollToCreatePanelForm",
  "portalCanRefreshFromApi",
  "devWarn",
  "normalizeVehicleRowForEditor",
  "docExpiryStatus",
  "describePortalVehicleOccupancy",
  "vehicleHasTermokingEquipment",
  "renderColombianPlateBadgeHtml",
  "portalDetailHighlightHtml",
  "portalDetailBuildGrid",
  "portalDetailTileMarkup",
  "portalDetailRenderRows",
  "isAdminActor",
  "nodes",
  "normalizeDriverRowForEditor",
  "getActiveTrips",
  "isManuallyUnavailable",
  "describeTripTimingVsNow",
  "renderDriverAvatarHeroHtml",
  "driverLicenseMetaHtml",
  "fmtMoney",
  "maskSensitivePhone",
  "maskSensitiveTail"
];

function toGlobalRefs(code) {
  let out = code;
  for (const name of GLOBAL_REFS) {
    const re = new RegExp(`(?<!function\\s)(?<!\\.)\\b${name}\\b`, "g");
    out = out.replace(re, `G.${name}`);
  }
  out = out.replace(/\bG\.G\./g, "G.");
  return out;
}

function extractRanges(ranges) {
  return ranges.map(([a, b]) => lines.slice(a - 1, b).join("\n")).join("\n\n");
}

const transportBody = extractRanges([
  [376, 509],
  [512, 525],
  [614, 1008]
]);

const rrhhBody = extractRanges([
  [2172, 2202],
  [5005, 5116]
]);

const fleetBody = extractRanges([
  [5767, 5902],
  [6051, 6268]
]);

const wrap = (title, body, exports) => `/**
 * ${title}
 * Extraído desde modules/core/portal-runtime.js.
 */
const G = globalThis;

${toGlobalRefs(body)}

export {
  ${exports.join(",\n  ")}
};
`;

fs.writeFileSync(
  path.join(root, "modules/app/portal-transport-modals.js"),
  wrap("Modales de transporte", transportBody, [
    "deletedTripSnapshotForTableRow",
    "deletedRequestSnapshotForTableRow",
    "formatDeletedRequestSnapshotRouteLine",
    "formatDeletedRequestSnapshotTableSummary",
    "formatDeletedTripSnapshotTableSummary",
    "openAssignedTripInfoModal",
    "openRequestDetailModal",
    "openDeletedTransportRequestAuditModal",
    "openDeletedTransportTripAuditModal",
    "openEditTripModal",
    "openEditRouteRateModal"
  ])
);

fs.writeFileSync(
  path.join(root, "modules/app/portal-rrhh-modals.js"),
  wrap("Modales y navegación RRHH", rrhhBody, [
    "openPayrollEmployeeFromCandidate",
    "openHiringContractFromCandidate",
    "payrollBulkEmployeeNameMap",
    "humanizePayrollBulkSkipReason",
    "parsePayrollBulkAutogenMessage",
    "openPayrollBulkResultModal",
    "presentPayrollBulkAutogenResult"
  ])
);

fs.writeFileSync(
  path.join(root, "modules/app/portal-fleet-modals.js"),
  wrap("Fichas modales de flota", fleetBody, [
    "openVehicleTechnicalSheetModal",
    "openDriverDetailSheetModal"
  ])
);

/** Remove extracted line ranges from portal-runtime (1-based inclusive), descending. */
const removeRanges = [
  [6051, 6268],
  [5767, 5902],
  [5005, 5116],
  [2172, 2202],
  [614, 1008],
  [512, 525],
  [376, 509]
];

let outLines = [...lines];
for (const [start, end] of removeRanges) {
  outLines.splice(start - 1, end - start + 1);
}

const importBlock = `import * as __portalTransportModals from "../app/portal-transport-modals.js";
import * as __portalRrhhModals from "../app/portal-rrhh-modals.js";
import * as __portalFleetModals from "../app/portal-fleet-modals.js";
`;

const insertAt = outLines.findIndex((l) => l.startsWith("import * as __pr"));
if (insertAt >= 0) {
  outLines.splice(insertAt, 0, ...importBlock.trimEnd().split("\n"), "");
}

const assignBlock = `
const {
  deletedTripSnapshotForTableRow,
  deletedRequestSnapshotForTableRow,
  formatDeletedRequestSnapshotRouteLine,
  formatDeletedRequestSnapshotTableSummary,
  formatDeletedTripSnapshotTableSummary,
  openAssignedTripInfoModal,
  openRequestDetailModal,
  openDeletedTransportRequestAuditModal,
  openDeletedTransportTripAuditModal,
  openEditTripModal,
  openEditRouteRateModal
} = __portalTransportModals;

const {
  openPayrollEmployeeFromCandidate,
  openHiringContractFromCandidate,
  payrollBulkEmployeeNameMap,
  humanizePayrollBulkSkipReason,
  parsePayrollBulkAutogenMessage,
  openPayrollBulkResultModal,
  presentPayrollBulkAutogenResult
} = __portalRrhhModals;

const { openVehicleTechnicalSheetModal, openDriverDetailSheetModal } = __portalFleetModals;
`;

const anchor = outLines.findIndex((l) => l === 'const ALL_PERMISSIONS = __pr.ALL_PERMISSIONS;');
if (anchor >= 0) {
  outLines.splice(anchor, 0, ...assignBlock.trim().split("\n"), "");
}

fs.writeFileSync(runtimePath, outLines.join("\n"));
console.log("Patched portal-runtime.js and rewrote modal modules.");
