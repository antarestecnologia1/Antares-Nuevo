/**
 * Conductores bajo prestación de servicios: pago por viaje, no nómina laboral ordinaria.
 */

export function employeeIsConductorServiceProvider(row: {
  rol_trabajador?: string | null;
  tipo_contrato?: string | null;
  tipo_plantilla_contrato?: string | null;
  rolTrabajador?: string | null;
  tipoContrato?: string | null;
  contractTemplateKind?: string | null;
  contractTemplate?: string | null;
  workerRole?: string | null;
  contractType?: string | null;
}): boolean {
  const role = String(
    row.rol_trabajador ?? row.rolTrabajador ?? row.workerRole ?? ""
  )
    .trim()
    .toLowerCase();
  const ct = String(row.tipo_contrato ?? row.tipoContrato ?? row.contractType ?? "")
    .trim()
    .toLowerCase();
  const tpl = String(
    row.tipo_plantilla_contrato ?? row.contractTemplateKind ?? row.contractTemplate ?? ""
  )
    .trim()
    .toLowerCase();
  const isConductor = role === "conductor";
  const isServiceContract = /prestaci[oó]n\s*de\s*servicios|prestacion.*servicio/i.test(ct);
  if (isConductor && isServiceContract) return true;
  if (!isConductor && isServiceContract) return true;
  if (tpl === "prestacion" || tpl.includes("prestacion")) return true;
  return false;
}

export function employeeReceivesPayrollNomina(row: Parameters<typeof employeeIsConductorServiceProvider>[0]): boolean {
  return !employeeIsConductorServiceProvider(row);
}
