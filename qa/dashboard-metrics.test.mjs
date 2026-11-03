/**
 * Pruebas de las métricas del dashboard (Torre de control).
 * Uso: node qa/dashboard-metrics.test.mjs
 */
import assert from "node:assert/strict";
import {
  addDaysYmd,
  computeContractsEnding,
  computeExpirations,
  computeFleetState,
  computeHiringSnapshot,
  computePeriodPerformance,
  computeTodayBoard,
  countRecentLeads,
  diffDaysYmd,
  documentDays,
  evaluateDelivery,
  formatTsLabel,
  pctChange,
  requestRevenue,
  resolveDashboardPeriod,
  ymdFromTs
} from "../modules/domain/dashboard-metrics.domain.js";

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (err) {
    console.error(`FALLA · ${name}\n  ${err.message}`);
    process.exitCode = 1;
  }
}

const TODAY = "2026-11-03";
/** Hora Colombia → timestamp (UTC-5). */
const at = (ymd, hh, mm = 0) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d, hh + 5, mm);
};
const iso = (ymd, hh, mm = 0) => new Date(at(ymd, hh, mm)).toISOString();
const NOW = at(TODAY, 10, 0);

check("fechas en hora Colombia", () => {
  assert.equal(ymdFromTs(Date.UTC(2026, 10, 3, 3, 0)), "2026-11-02"); // 22:00 del día anterior en Colombia
  assert.equal(ymdFromTs(Date.UTC(2026, 10, 3, 5, 0)), "2026-11-03");
  assert.equal(addDaysYmd("2026-10-31", 1), "2026-11-01");
  assert.equal(diffDaysYmd("2026-11-03", "2026-11-10"), 7);
});

check("periodos y periodo anterior de igual duración", () => {
  const p7 = resolveDashboardPeriod("7d", TODAY);
  assert.deepEqual([p7.from, p7.to, p7.days, p7.prevFrom, p7.prevTo], ["2026-10-28", TODAY, 7, "2026-10-21", "2026-10-27"]);
  const month = resolveDashboardPeriod("month", TODAY);
  assert.deepEqual([month.from, month.days, month.prevFrom, month.prevTo], ["2026-11-01", 3, "2026-10-29", "2026-10-31"]);
  const today = resolveDashboardPeriod("today", TODAY);
  assert.deepEqual([today.from, today.days, today.prevFrom], [TODAY, 1, "2026-11-02"]);
  assert.equal(resolveDashboardPeriod("nada", TODAY).id, "7d");
});

check("el ingreso no usa el valor asegurado", () => {
  assert.equal(requestRevenue({ tripValue: 1_000_000, insuredValue: 50_000_000 }), 1_000_000);
  assert.equal(requestRevenue({ tripValue: 1_000_000, standbyChargeTotal: 200_000 }), 1_200_000);
  assert.equal(requestRevenue({ tripValue: 1_000_000, trip: { invoice: { total: 1_500_000 } } }), 1_500_000);
  assert.equal(requestRevenue({ insuredValue: 9_000_000 }), 0);
});

check("entrega a tiempo, tarde y sin datos", () => {
  const trip = (etaDelivery) => ({ etaDelivery });
  const eta = iso("2026-11-02", 15);
  assert.equal(evaluateDelivery({ status: "Cerrada", trip: trip(eta), deliveredAt: iso("2026-11-02", 15, 10) }, NOW).result, "ontime");
  const late = evaluateDelivery({ status: "Completada", trip: trip(eta), deliveredAt: iso("2026-11-02", 15, 40) }, NOW);
  assert.equal(late.result, "late");
  assert.equal(late.lateMin, 40);
  assert.equal(evaluateDelivery({ status: "En transito", trip: trip(iso(TODAY, 8)) }, NOW).result, "late");
  assert.equal(evaluateDelivery({ status: "En transito", trip: trip(iso(TODAY, 18)) }, NOW).result, null);
  assert.equal(evaluateDelivery({ status: "Cerrada", trip: trip(eta) }, NOW).result, null, "completado sin fecha real: no se evalúa");
  assert.equal(evaluateDelivery({ status: "Cerrada", deliveredAt: eta }, NOW).result, null, "sin hora estimada: no se evalúa");
});

check("desempeño del periodo, comparación y clientes", () => {
  const mk = (id, client, value, day, deliveredMin) => ({
    id,
    clientName: client,
    status: "Cerrada",
    tripValue: value,
    insuredValue: value * 10,
    trip: { etaDelivery: iso(day, 12) },
    deliveredAt: new Date(at(day, 12) + deliveredMin * 60000).toISOString()
  });
  const requests = [
    mk("a", "Cliente A", 1_000_000, "2026-11-02", 0),
    mk("b", "Cliente A", 500_000, "2026-11-01", 5),
    mk("c", "Cliente B", 300_000, "2026-10-30", 90),
    mk("d", "Cliente C", 200_000, "2026-10-29", -30),
    mk("prev", "Cliente A", 800_000, "2026-10-25", 0),
    { id: "x", clientName: "Cliente B", status: "Cancelada", tripValue: 9_000_000, trip: { etaDelivery: iso("2026-11-01", 12) } },
    { id: "act", clientName: "Cliente B", status: "En transito", tripValue: 400_000, trip: { etaDelivery: iso(TODAY, 8) } }
  ];
  const fuelLogs = [{ date: "2026-11-01", totalCost: 100_000 }, { date: "2026-10-20", totalCost: 999_999 }];
  const techLogs = [{ date: "2026-10-31", cost: 50_000 }];
  const r = computePeriodPerformance({ requests, fuelLogs, techLogs, period: resolveDashboardPeriod("7d", TODAY), nowTs: NOW, topClients: 2 });
  assert.equal(r.current.revenue, 2_000_000);
  assert.equal(r.current.completed, 4);
  assert.equal(r.current.cost, 150_000);
  assert.equal(r.current.result, 1_850_000);
  assert.equal(r.current.marginPct, 93);
  // 4 entregas completadas (3 a tiempo, 1 tarde) + 1 activa ya retrasada = 5 evaluadas, 3 a tiempo
  assert.equal(r.current.evaluated, 5);
  assert.equal(r.current.onTimePct, 60);
  assert.equal(r.previous.revenue, 800_000);
  assert.equal(r.deltas.revenue, 150);
  assert.equal(r.series.days.length, 7);
  assert.equal(r.series.revenue.reduce((a, b) => a + b, 0), 2_000_000);
  assert.equal(r.clients.rows[0].label, "Cliente A");
  assert.equal(r.clients.rows[0].value, 1_500_000);
  assert.ok(r.clients.rows.at(-1).other, "el resto se agrupa en «Otros»");
  assert.equal(r.clients.top1Pct, 75);
});

check("etiqueta de hora en 12 h y hora Colombia", () => {
  assert.equal(formatTsLabel(at(TODAY, 18), TODAY), "Hoy 6:00 p. m.");
  assert.equal(formatTsLabel(at("2026-11-04", 7, 30), TODAY), "Mañana 7:30 a. m.");
  assert.equal(formatTsLabel(at("2026-11-02", 0, 5), TODAY), "Ayer 12:05 a. m.");
  assert.equal(formatTsLabel(at("2026-11-20", 14), TODAY), "20 nov 2:00 p. m.");
  assert.equal(formatTsLabel(NaN, TODAY), "Sin hora");
});

check("«Hoy» muestra al menos 7 días de tendencia", () => {
  const r = computePeriodPerformance({ requests: [], period: resolveDashboardPeriod("today", TODAY), nowTs: NOW });
  assert.equal(r.series.days.length, 7);
  assert.equal(r.current.onTimePct, null);
  assert.equal(pctChange(10, 0), null);
});

check("tablero de hoy: urgencia y conteos", () => {
  const requests = [
    { id: "1", requestNumber: "S1", status: "En transito", clientName: "A", trip: { vehiclePlate: "AAA111", etaDelivery: iso(TODAY, 9) } },
    { id: "2", requestNumber: "S2", status: "En transito", clientName: "B", trip: { vehiclePlate: "BBB222", etaDelivery: iso(TODAY, 18) } },
    { id: "3", requestNumber: "S3", status: "Viaje asignado", clientName: "C", trip: { vehiclePlate: "CCC333", etaDelivery: iso(TODAY, 20) } },
    { id: "4", requestNumber: "S4", status: "Aprobada pendiente asignacion", clientName: "D" },
    { id: "5", requestNumber: "S5", status: "Pendiente", clientName: "E" },
    { id: "6", requestNumber: "S6", status: "Cerrada", clientName: "F", trip: { etaDelivery: iso(TODAY, 7) }, deliveredAt: iso(TODAY, 6, 30) },
    { id: "7", requestNumber: "S7", status: "Cerrada", clientName: "G", trip: { etaDelivery: iso("2026-11-01", 7) }, deliveredAt: iso("2026-11-01", 6, 30) }
  ];
  const { rows, counts } = computeTodayBoard({ requests, todayYmd: TODAY, nowTs: NOW });
  assert.deepEqual(counts, { all: 5, late: 1, route: 2, standby: 0, assigned: 1, assign: 1, review: 1, done: 1 });
  assert.equal(rows[0].number, "S1", "el retrasado va primero");
  assert.equal(rows[0].lateMin, 60);
  assert.ok(!rows.some((r) => r.number === "S7"), "un cierre de días anteriores no aparece");
});

check("estado de la flota: cada camión cuenta una vez", () => {
  const okDocs = { soatExpiryDate: "2027-05-01", techInspectionExpiryDate: "2027-05-01" };
  const vehicles = [
    { id: "v1", plate: "A", ...okDocs },
    { id: "v2", plate: "B", ...okDocs },
    { id: "v3", plate: "C", ...okDocs },
    { id: "v4", plate: "D", soatExpiryDate: "2026-10-01", techInspectionExpiryDate: "2027-05-01" },
    { id: "v5", plate: "E", status: "maintenance", ...okDocs },
    { id: "v6", plate: "F", status: "active", available: false, ...okDocs },
    { id: "v7", plate: "G", status: "inactive", ...okDocs },
    { id: "v8", plate: "H", ...okDocs }
  ];
  const requests = [
    { status: "En transito", trip: { vehicleId: "v1" } },
    { status: "Espera standby", trip: { vehicleId: "v5" } }, // en taller prima sobre el viaje
    { status: "Viaje asignado", trip: { vehicleId: "v2" } }
  ];
  const f = computeFleetState({ vehicles, requests, todayYmd: TODAY });
  const by = Object.fromEntries(f.states.map((s) => [s.id, s.count]));
  assert.deepEqual(by, { route: 1, assigned: 1, free: 2, blocked: 1, shop: 1, off: 2 });
  assert.equal(f.total, 8);
  assert.equal(f.operable, 5);
  assert.equal(f.utilizationPct, 40);
  assert.equal(by.route + by.assigned + by.free + by.blocked + by.shop + by.off, f.total);
});

check("vencimientos: ordenados, sin duplicar personas y sin fecha aparte", () => {
  assert.equal(documentDays({ expiry: "2026-11-13" }, TODAY), 10);
  assert.equal(documentDays({ expedition: "2025-11-01" }, TODAY), -2, "sin vencimiento: expedición + 1 año");
  assert.equal(documentDays({}, TODAY), null);
  const vehicles = [
    { id: "v1", plate: "AAA111", soatExpiryDate: "2026-10-20", techInspectionExpiryDate: "2027-06-01" },
    { id: "v2", plate: "BBB222", soatExpiryDate: "2026-11-10", techInspectionExpiryDate: "" },
    { id: "v3", plate: "CCC333", status: "inactive", soatExpiryDate: "2020-01-01" }
  ];
  const drivers = [{ id: "d1", name: "Édgar Londoño", licenseExpiry: "2026-11-20", occupationalExamExpiry: "2026-12-30", instruvialExamExpiry: "2027-12-30" }];
  const employees = [
    { id: "e1", name: "Edgar Londoño", workerRole: "conductor", status: "activo", licenseExpiry: "2026-11-20", occupationalExamExpiry: "2026-12-30" },
    { id: "e2", name: "Laura Gómez", workerRole: "administrativo", status: "activo", occupationalExamExpiry: "2026-11-01" },
    { id: "e3", name: "Ex Empleado", status: "desvinculado", occupationalExamExpiry: "2020-01-01" }
  ];
  const out = computeExpirations({ vehicles, drivers, employees, todayYmd: TODAY });
  assert.deepEqual(out.items.map((i) => `${i.subject}|${i.what}`), ["AAA111|SOAT", "Laura Gómez|Examen ocupacional", "BBB222|SOAT", "Édgar Londoño|Licencia"]);
  assert.equal(out.items[0].tone, "alert");
  assert.equal(out.items[0].days, -14);
  assert.equal(out.totals.expired, 2);
  assert.equal(out.totals.unknown, 1, "tecnomecánica sin fecha de BBB222");
  assert.ok(out.totals.okPct > 0 && out.totals.okPct < 100);
});

check("contratos por vencer, selección y prospectos", () => {
  const rows = computeContractsEnding({
    employees: [
      { name: "Ana Pérez", status: "activo", contractEndDate: "2026-11-15" },
      { name: "Luis Soto", status: "activo", contractEndDate: "2027-03-01" },
      { name: "Retirado", status: "desvinculado", contractEndDate: "2026-11-10" }
    ],
    todayYmd: TODAY
  });
  assert.deepEqual(rows.map((r) => [r.subject, r.days]), [["Ana Pérez", 12]]);
  const hiring = computeHiringSnapshot({
    vacancies: [{ status: "Publicada", deadline: "2026-11-20" }, { status: "Publicada", deadline: "2026-10-01" }, { status: "Cerrada" }],
    candidates: [{ status: "Recibido" }, { status: "Entrevistado" }, { status: "Contratado" }, { status: "Descartado" }],
    todayYmd: TODAY
  });
  assert.deepEqual(hiring, { openVacancies: 1, candidatesInProcess: 2, candidatesToReview: 1 });
  assert.equal(countRecentLeads([{ createdAt: iso("2026-11-01", 9) }, { createdAt: iso("2026-10-01", 9) }, {}], NOW, 7), 1);
});

console.log(process.exitCode ? "dashboard-metrics: hay fallas" : `dashboard-metrics: ${passed} comprobaciones OK`);
