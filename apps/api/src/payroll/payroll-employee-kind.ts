/**
 * Conductores bajo prestación de servicios: pago por viaje, no nómina laboral ordinaria.
 */

export function employeeIsConductorServiceProvider(row: {
  rol_trabajador?: string | null;
  tipo_contrato?: string | null;
  rolTrabajador?: string | null;
  tipoContrato?: string | null;
  workerRole?: string | null;
  contractType?: string | null;
}): boolean {
  const role = String(
    row.rol_trabajador ?? row.rolTrabajador ?? row.workerRole ?? ""
  )
    .trim()
    .toLowerCase();
  if (role === "conductor") return true;
  const ct = String(row.tipo_contrato ?? row.tipoContrato ?? row.contractType ?? "")
    .trim()
    .toLowerCase();
  if (/prestaci[oó]n\s*de\s*servicios|prestacion.*servicio/i.test(ct)) return true;
  return false;
}

export function employeeReceivesPayrollNomina(row: Parameters<typeof employeeIsConductorServiceProvider>[0]): boolean {
  return !employeeIsConductorServiceProvider(row);
}
