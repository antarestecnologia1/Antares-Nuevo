/**
 * Metadatos del DMS corporativo: vigencia, versiones, tipos, filtros y clasificación.
 * Ejecutar: node qa/company-documents-metadata.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  COMPANY_DOCUMENT_CATEGORIES,
  SUGGESTED_COMPANY_FOLDERS,
  DOCUMENT_TYPES_CATALOG_FOLDER,
  normalizeCompanyDocumentRow,
  serializeCompanyDocumentTags,
  parseDocumentMeta,
  parseDocumentCategory,
  computeDocumentValidityStatus,
  applyCompanyDocumentFilters,
  nextDocumentVersionState,
  listDocumentVersionChain,
  isHiddenCompanyFolder,
  listCompanyDocumentCategories,
  parseDocumentTypesCatalog,
  serializeDocumentTypesCatalog,
  collectAllFolderPaths
} from "../modules/domain/company-documents.domain.js";

function ok(cond, msg) {
  assert.ok(cond, msg);
}

ok(SUGGESTED_COMPANY_FOLDERS.includes("06. Terceros"), "carpeta evidencias de terceros");
ok(SUGGESTED_COMPANY_FOLDERS.includes("07. Operación"), "carpeta evidencias de operación");
ok(
  COMPANY_DOCUMENT_CATEGORIES.some((c) => c.value === "soat" && c.requiresExpiry && c.process === "operacion"),
  "SOAT exige vigencia y proceso operación"
);

ok(isHiddenCompanyFolder(DOCUMENT_TYPES_CATALOG_FOLDER), "catálogo de tipos está oculto");
ok(!isHiddenCompanyFolder("01. Empleados"), "expedientes no están ocultos");

const soat = normalizeCompanyDocumentRow({
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  fileName: "SOAT.pdf",
  folder: "07. Operación / Vehículos / ABC123",
  documentCategory: "soat",
  entityType: "vehiculo",
  entityId: "veh-1",
  entityLabel: "ABC123",
  process: "operacion",
  issuedAt: "2025-01-15",
  expiresAt: "2027-01-14",
  version: 1,
  mimeType: "application/pdf",
  sizeBytes: 1200,
  storageKey: "k1",
  uploadedBy: "QA"
});

ok(parseDocumentCategory(soat.tags) === "soat", "tags JSON conservan categoría");
ok(parseDocumentMeta(soat.tags).entityLabel === "ABC123", "tags JSON conservan entidad");
ok(soat.tags.startsWith("{"), "metadatos extra se serializan como JSON");

const vencido = computeDocumentValidityStatus({ expiresAt: "2020-01-01" }, { today: "2026-08-14" });
const pronto = computeDocumentValidityStatus({ expiresAt: "2026-08-20" }, { today: "2026-08-14", soonDays: 30 });
const vigente = computeDocumentValidityStatus({ expiresAt: "2027-01-01" }, { today: "2026-08-14" });
ok(vencido === "vencido", "vencido por fecha");
ok(pronto === "por_vencer", "alerta 30 días");
ok(vigente === "vigente", "vigente fuera de ventana");
ok(computeDocumentValidityStatus({}) === "sin_vigencia", "sin fecha = sin vigencia");

const v1 = normalizeCompanyDocumentRow({
  ...soat,
  id: "11111111-1111-4111-8111-111111111111",
  isCurrentVersion: true,
  versionGroup: "11111111-1111-4111-8111-111111111111"
});
const incoming = {
  folder: v1.folder,
  documentCategory: "soat",
  entityType: "vehiculo",
  entityId: "veh-1",
  entityLabel: "ABC123"
};
const next = nextDocumentVersionState([v1], incoming);
ok(next.version === 2, "segunda carga incrementa versión");
ok(next.previousIds.includes(v1.id), "marca versión anterior");
ok(listDocumentVersionChain([v1], incoming).length === 1, "cadena de versiones por entidad+tipo");

const filtered = applyCompanyDocumentFilters([soat, v1], {
  category: "soat",
  entityType: "vehiculo",
  process: "operacion",
  status: "vigente"
});
ok(filtered.length >= 1, "filtros por tipo, entidad, proceso y estado");

const searchHit = applyCompanyDocumentFilters([soat], { search: "ABC123" });
ok(searchHit.length === 1, "búsqueda incluye etiqueta de entidad");

const custom = parseDocumentTypesCatalog(
  serializeDocumentTypesCatalog([{ label: "Póliza de cumplimiento", process: "cumplimiento", requiresExpiry: true }])
);
ok(custom[0]?.value === "poliza_de_cumplimiento" || custom[0]?.value.includes("poliza"), "slug de tipo personalizado");
ok(
  listCompanyDocumentCategories(custom).some((c) => c.label.includes("cumplimiento") || c.value.includes("poliza")),
  "tipos personalizados se mezclan con el catálogo base"
);

const hiddenPaths = collectAllFolderPaths([], [{ folderName: DOCUMENT_TYPES_CATALOG_FOLDER, id: "x" }]);
ok(!hiddenPaths.some((p) => p.includes(".sistema")), "collectAllFolderPaths oculta el catálogo");

const legacy = serializeCompanyDocumentTags({ documentCategory: "contrato" });
ok(legacy === "contrato", "sin metadatos extra se conserva etiqueta plana");

const legacyRow = normalizeCompanyDocumentRow({
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  nombre_archivo: "contrato_fijo_ana.pdf",
  tipo: "PDF",
  carpeta: "01. Empleados / Ana",
  etiquetas: "contrato",
  mime_type: "application/pdf",
  tamano_bytes: 800,
  storage_key: "k2",
  subido_por: "Portal"
});
ok(legacyRow.documentCategory === "contrato", "fila bootstrap legacy conserva categoría");
ok(legacyRow.fileName.includes("contrato"), "fila bootstrap legacy conserva nombre");
ok(legacyRow.tags === "contrato" || parseDocumentCategory(legacyRow.tags) === "contrato", "legacy tags siguen siendo consultables");

const corruptOk = normalizeCompanyDocumentRow({
  id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  fileName: "roto.pdf",
  folder: "General",
  tags: "{no-json",
  storageKey: "k3"
});
ok(corruptOk?.id, "tags mal formados no tumban la normalización");

/* ------------------------------------------------------------------ */
/* Integridad estática del módulo UI                                   */
/* ------------------------------------------------------------------ */
const ROOT = process.cwd();
const gestionJs = readFileSync(path.join(ROOT, "modules/app/gestion-documental.js"), "utf8");
const indexHtml = readFileSync(path.join(ROOT, "index.html"), "utf8");
const domainJs = readFileSync(path.join(ROOT, "modules/domain/company-documents.domain.js"), "utf8");

ok(gestionJs.includes("function hasHireDocMarker(marker)"), "hasHireDocMarker existe");
ok(!/function employeeEntityMeta\([\s\S]*?\}\s+if \(!marker\)/.test(gestionJs), "no hay código huérfano tras employeeEntityMeta");
ok(gestionJs.includes("function documentManagementHtml()"), "renderer principal existe");
ok(gestionJs.includes("registerLegacyPortalViews({ documentManagementHtml })"), "registra la vista legacy");
ok(gestionJs.includes("window.AppLegacyViews"), "fallback de registro si el puente aún no está");
ok(gestionJs.includes('window.__portalModuleAfterRender["document-management"]'), "bind after-render registrado");

const windowExports = [
  "ensureCompanyEmployeeDocumentFolder",
  "archivePayrollRunToEmployeeFolder",
  "archiveEmployeeHirePackageToFolder",
  "archiveEmployeeContractToFolder",
  "archiveEmployeePhotoToFolder",
  "archiveEmployeeLaborLetterToFolder"
];
for (const name of windowExports) {
  ok(gestionJs.includes(`window.${name}`), `export global ${name}`);
}

const actions = [...gestionJs.matchAll(/data-action=['"](doc-[a-z0-9-]+)['"]/g)].map((m) => m[1]);
const uniqueActions = [...new Set(actions)];
const unbound = uniqueActions.filter(
  (action) =>
    !gestionJs.includes(`[data-action='${action}']`) &&
    !gestionJs.includes(`querySelector("[data-action='${action}']")`) &&
    !gestionJs.includes(`querySelectorAll("[data-action='${action}']")`)
);
ok(unbound.length === 0, `todas las acciones UI tienen bind: ${unbound.join(", ") || "ok"}`);

const importBlock = gestionJs.match(/} from "\.\.\/domain\/company-documents\.domain\.js";/)
  ? gestionJs.slice(0, gestionJs.indexOf('} from "../domain/company-documents.domain.js";'))
  : "";
ok(importBlock.includes("normalizeCompanyDocumentRow"), "importa normalizador");
ok(domainJs.includes("export function normalizeCompanyDocumentRow"), "dominio exporta normalizador");
ok(indexHtml.includes("gestion-documental.js?v=20260814-dms-integrity"), "cache-bust del JS actualizado");
ok(indexHtml.includes("gestion-documental.css?v=20260814-dms-integrity"), "cache-bust del CSS actualizado");

console.log("company-documents-metadata: OK");
