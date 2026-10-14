/**
 * Consulta SIMIT-FCM por placa (dataset 72nf-y4v3).
 * Ejecutar: node qa/simit-fines.test.mjs
 */
import assert from "node:assert/strict";
import {
  buildSimitProxyPath,
  buildSimitQueryUrl,
  formatSimitMoney,
  isSimitPending,
  normalizeSimitPlate,
  parseSimitFineRow,
  simitPlatesCacheKey,
  simitItemPassesFilters,
  summarizeSimitByPlate,
  uniqueSimitPlates
} from "../modules/domain/simit-fines.domain.js";

assert.equal(normalizeSimitPlate("abc-123"), "ABC123", "normaliza placa");
assert.deepEqual(uniqueSimitPlates(["abc123", "ABC123", " def456 "]), ["ABC123", "DEF456"], "únicas");
assert.equal(isSimitPending("NO"), true, "pendiente");
assert.equal(isSimitPending("si"), false, "pagado");
assert.match(String(formatSimitMoney(877800)).replace(/\s/g, ""), /\$877[.,]?800/, "formato COP");

const parsed = parseSimitFineRow({
  placa: "cws30b",
  fecha_multa: "08/02/2020",
  valor_multa: "877800",
  departamento: "Santander",
  ciudad: "Bucaramanga",
  pagado_si_no: "NO",
  vigencia: "2020"
});
assert.equal(parsed.plate, "CWS30B");
assert.equal(parsed.pending, true);
assert.ok(parsed.dateMs > 0, "fecha parseada");

const summary = summarizeSimitByPlate(
  [{ id: "1", plate: "CWS30B", brand: "Kenworth" }, { id: "2", plate: "ZZZ999", brand: "Hino" }],
  [parsed, { ...parsed, pending: false, paidLabel: "Pagado", value: 100 }]
);
assert.equal(summary.pendingVehicleCount, 1);
assert.equal(summary.cleanCount, 1);
assert.equal(summary.pendingCount, 1);
assert.equal(summary.pendingValue, 877800);
assert.equal(simitItemPassesFilters(summary.list[0], { result: "pending", search: "bucaramanga" }), true);
assert.equal(simitItemPassesFilters(summary.list[1], { result: "pending" }), false);
assert.equal(simitItemPassesFilters(summary.list[1], { result: "clean", search: "hino" }), true);

const url = buildSimitQueryUrl({ plates: ["ABC123", "DEF456"], pendingOnly: true, limit: 100, offset: 0 });
const decoded = decodeURIComponent(url).replace(/\+/g, " ");
assert.match(url, /72nf-y4v3\.json/);
assert.match(decoded, /placa in\(/);
assert.match(decoded, /pagado_si_no/);
assert.equal(simitPlatesCacheKey(["def456", "abc123"], true), "pending:ABC123|DEF456");
assert.match(buildSimitProxyPath({ plates: ["abc123"], pendingOnly: true }), /\/proxy\/simit-fines\?/);

console.log("simit-fines.test.mjs: ok");
