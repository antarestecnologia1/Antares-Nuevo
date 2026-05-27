/**
 * Liquidación de prestación de servicios (conductores): pago por viajes, sin nómina laboral.
 */

export type DriverTripPaymentCompute = {
  periodYm: string;
  tripCount: number;
  interDepartmentTrips: number;
  viaticUnitCop: number;
  travelAllowanceAutoCop: number;
  fuelReimbursementAutoCop: number;
  grossCop: number;
  noveltiesDetail: Record<string, unknown>;
};

export function buildDriverTripPaymentNovelties(
  periodYm: string,
  stats: {
    tripCount: number;
    interDepartmentTrips: number;
    viaticUnitCop: number;
    travelAllowanceAutoCop: number;
    fuelReimbursementAutoCop: number;
    travelAllowanceManualCop?: number;
    fuelReimbursementManualCop?: number;
  }
): Record<string, unknown> {
  const travelManual = Math.max(0, stats.travelAllowanceManualCop ?? 0);
  const fuelManual = Math.max(0, stats.fuelReimbursementManualCop ?? 0);
  return {
    prestacionServicios: true,
    periodoCalendarioYm: periodYm,
    tripSummary: {
      tripCount: stats.tripCount,
      interDepartmentTrips: stats.interDepartmentTrips,
      viaticUnitCop: stats.viaticUnitCop,
      viaticTotalCop: stats.travelAllowanceAutoCop,
      fuelReimbursementCop: stats.fuelReimbursementAutoCop,
      travelAllowanceManualCop: travelManual,
      fuelReimbursementManualCop: fuelManual
    },
    disclaimers: [
      "Prestación de servicios (contrato conductores): pago por viajes realizados en el mes calendario.",
      "Viáticos interdepartamentales según regla vigente en reglas_viatico_interdepartamental.",
      "Reembolso combustible: cargas en registros_combustible con pagado_por = conductor.",
      "Sin aportes a salud, pensión ni FSP en este comprobante."
    ],
    absenceSlipDetail: { rows: [] }
  };
}

export function buildDriverTripPaymentCompute(
  periodYm: string,
  tripCount: number,
  interDepartmentTrips: number,
  viaticUnitCop: number,
  fuelReimbursementAutoCop: number,
  manual?: { travelAllowanceManualCop?: number; fuelReimbursementManualCop?: number }
): DriverTripPaymentCompute {
  const travelAllowanceAutoCop = Math.round(Math.max(0, interDepartmentTrips) * Math.max(0, viaticUnitCop));
  const fuelAuto = Math.round(Math.max(0, fuelReimbursementAutoCop));
  const travelManual = Math.round(Math.max(0, manual?.travelAllowanceManualCop ?? 0));
  const fuelManual = Math.round(Math.max(0, manual?.fuelReimbursementManualCop ?? 0));
  const grossCop = travelAllowanceAutoCop + fuelAuto + travelManual + fuelManual;
  const noveltiesDetail = buildDriverTripPaymentNovelties(periodYm, {
    tripCount,
    interDepartmentTrips,
    viaticUnitCop,
    travelAllowanceAutoCop,
    fuelReimbursementAutoCop: fuelAuto,
    travelAllowanceManualCop: travelManual,
    fuelReimbursementManualCop: fuelManual
  });
  return {
    periodYm,
    tripCount,
    interDepartmentTrips,
    viaticUnitCop,
    travelAllowanceAutoCop,
    fuelReimbursementAutoCop: fuelAuto,
    grossCop,
    noveltiesDetail
  };
}
