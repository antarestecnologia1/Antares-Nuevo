/**
 * Extrae modales de transporte y RRHH desde portal-runtime.js hacia módulos app/.
 */
import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const runtimePath = path.join(root, "modules/core/portal-runtime.js");
const lines = fs.readFileSync(runtimePath, "utf8").split(/\r?\n/);

function extractFunctionBlock(startIdx) {
  let depth = 0;
  let started = false;
  const out = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    out.push(line);
    for (const ch of line) {
      if (ch === "{") {
        depth++;
        started = true;
      } else if (ch === "}") depth--;
    }
    if (started && depth === 0) return { block: out, endIdx: i };
  }
  throw new Error(`Unclosed block at ${startIdx + 1}`);
}

function findFunction(name) {
  const idx = lines.findIndex((l) => l.startsWith(`function ${name}(`));
  if (idx < 0) throw new Error(`Missing function ${name}`);
  return extractFunctionBlock(idx);
}

const transportNames = [
  "openAssignedTripInfoModal",
  "openRequestDetailModal",
  "deletedTripSnapshotForTableRow",
  "deletedRequestSnapshotForTableRow",
  "formatDeletedRequestSnapshotRouteLine",
  "formatDeletedRequestSnapshotTableSummary",
  "openDeletedTransportRequestAuditModal",
  "formatDeletedTripSnapshotTableSummary",
  "openDeletedTransportTripAuditModal",
  "openEditTripModal",
  "openEditRouteRateModal"
];

const rrhhNames = [
  "renderPayrollRunCard",
  "openPayrollBulkResultModal",
  "openPayrollEmployeeFromCandidate",
  "openHiringContractFromCandidate"
];

function buildModalsFile(title, names, exportKey) {
  const blocks = names.map((n) => findFunction(n).block.join("\n"));
  const globalsDestructure = `  const {
    read, write, writeAwaitServer, KEYS, IC, STATUS, ROLES,
    state, openInfoModal, openEditModal, escapeHtml, escapeAttr, fmtDate, fmtDateOr,
    parseNum, notify, renderPortalView, reqRead, reqWriteAwait, canAdminEditTrip,
    formatRoute, requestTruckRequirementSummaryHtml, prettyStatus, companyProfileLogoUrl,
    getCompanyById, requestRequiresTermoking, requestTransportModeFromRequest,
    renderRequestModificationLogSectionHtml, parsePortalJsonSnapshot, snapPick,
    toInputDate, currentUser, nowIso, recalculateResourceAvailability,
    getTripRouteRatesNormalized, parseTripRateStorageKeyToRouteParts,
    formatRouteRateAuditSummary, buildRouteRateScopeStepInnerHtml, COLOMBIA_LOCATIONS,
    setSelectValueInsensitive, attachDepartmentCitySelects, wireRouteRateScopeSection,
    failPortalField, userMessage, buildTripRouteRateKey, tripRateStorageKey,
    buildRouteRateEntry, humanTripRateRouteLabelFromStorageKey,
    formatPayrollPeriodLabel, payrollRunTypeLabel, payrollRunIsDriverTripPayment,
    payrollRunHasAbsenceDetail, ensureCrudModalElement, renderModalHead,
    renderModalFooterActions, wireModalDismiss, scrollOpenCrudModalIntoView,
    persistHrWorkspace, scrollToCreatePanelForm, colombiaTodayIsoDate
  } = globalThis;`;
  return `/**
 * ${title}
 * Carga con defer después de portal-runtime.js; registra en globalThis.${exportKey}
 */
(function registerPortalModals() {
  "use strict";
  const G = globalThis;
${globalsDestructure}

${blocks.join("\n\n")}

  G.${exportKey} = {
${names.map((n) => `    ${n}`).join(",\n")}
  };
  Object.assign(G, G.${exportKey});
})();
`;
}

const transportJs = buildModalsFile(
  "Modales de transporte (viajes, solicitudes, tarifas, auditoría).",
  transportNames,
  "__antaresPortalTransportModals"
);
const rrhhJs = buildModalsFile(
  "Modales y tarjetas RRHH (liquidaciones, contratación).",
  rrhhNames,
  "__antaresPortalRrhhModals"
);

fs.writeFileSync(path.join(root, "modules/app/portal-transport-modals.js"), transportJs, "utf8");
fs.writeFileSync(path.join(root, "modules/app/portal-rrhh-modals.js"), rrhhJs, "utf8");

function delegator(name) {
  return `function ${name}(...args) {
  const impl = globalThis.__antaresPortalTransportModals;
  if (impl && typeof impl.${name} === "function") return impl.${name}(...args);
}`;
}

function delegatorRrhh(name) {
  return `function ${name}(...args) {
  const impl = globalThis.__antaresPortalRrhhModals;
  if (impl && typeof impl.${name} === "function") return impl.${name}(...args);
}`;
}

const removeRanges = [];
for (const n of transportNames) {
  const idx = lines.findIndex((l) => l.startsWith(`function ${n}(`));
  const { endIdx } = extractFunctionBlock(idx);
  removeRanges.push([idx, endIdx]);
}
for (const n of rrhhNames) {
  const idx = lines.findIndex((l) => l.startsWith(`function ${n}(`));
  const { endIdx } = extractFunctionBlock(idx);
  removeRanges.push([idx, endIdx]);
}
removeRanges.sort((a, b) => b[0] - a[0]);

let newLines = [...lines];
for (const [start, end] of removeRanges) {
  const name = lines[start].match(/^function (\w+)/)?.[1];
  const isRrhh = rrhhNames.includes(name);
  const deleg = isRrhh ? delegatorRrhh(name) : delegator(name);
  newLines.splice(start, end - start + 1, deleg, "");
}

fs.writeFileSync(runtimePath, newLines.join("\n"), "utf8");
console.log("Extracted", transportNames.length, "transport +", rrhhNames.length, "rrhh modals");
