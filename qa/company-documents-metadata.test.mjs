/**
 * Metadatos del DMS corporativo: vigencia, versiones, tipos, filtros y clasificación.
 * Ejecutar: node qa/company-documents-metadata.test.mjs
 */
import assert from "node:assert/strict";
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

console.log("company-documents-metadata: OK");
