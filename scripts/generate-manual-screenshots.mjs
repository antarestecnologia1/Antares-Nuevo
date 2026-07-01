/**
 * Genera capturas de pantalla reales del portal (localStorage sembrado, sin backend)
 * para ilustrar los manuales de usuario en docs/manuales-usuario/assets/.
 *
 * Uso: node scripts/generate-manual-screenshots.mjs
 * Requiere: node scripts/portal-static-server.mjs corriendo en PORTAL_BASE_URL (por defecto http://127.0.0.1:4173/).
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs", "manuales-usuario", "assets");
const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  counters: "antares_counters_v2",
  requests: "antares_requests_v2",
  vehicles: "antares_vehicles_v2",
  drivers: "antares_drivers_v2",
  notifications: "antares_notifications_v2",
  emails: "antares_emails_v2",
  payrollEmployees: "antares_payroll_employees_v2",
  payrollRuns: "antares_payroll_runs_v2",
  fuelLogs: "antares_fuel_logs_v2",
  vehicleTechnicalLogs: "antares_vehicle_technical_logs_v2",
  vacancies: "antares_vacancies_v2",
  candidates: "antares_candidates_v2",
  positions: "antares_positions_v2",
  interviews: "antares_interviews_v2",
  contracts: "antares_contracts_v2",
  hrAbsences: "antares_hr_absences_v2",
  sstCompliance: "antares_sst_compliance_v2",
  tripRouteRates: "antares_trip_route_rates_v2",
  approvals: "antares_approvals_v2",
  session: "antares_session_v2",
  payrollWorkspace: "antares_hr_payroll_workspace_v1",
  hiringWorkspace: "antares_hr_hiring_workspace_v1"
};

function plusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
function ymd(date) {
  return date.toISOString().slice(0, 10);
}
function ymdhm(date) {
  return date.toISOString().slice(0, 16);
}

const now = new Date();
const logo = "./imagenes%20empresa/logo-recortado.png";

const adminUser = {
  id: "admin-1",
  name: "Camila Restrepo",
  firstName: "Camila",
  lastName: "Restrepo",
  email: "camila.restrepo@transportesantares.co",
  role: "admin",
  accountStatus: "aprobado",
  companyId: "co-antares",
  company: "Transportes Antares S.A.S",
  documentType: "CC",
  taxId: "1010101010",
  phone: "3001112233",
  department: "Bogota",
  city: "Bogota D.C.",
  address: "Cra 1 # 1-1",
  birthDate: "1990-01-01",
  permissions: []
};

const clientUser = {
  id: "client-1",
  name: "Laura Gómez",
  email: "laura.gomez@floresdelvalle.test",
  role: "client",
  accountStatus: "aprobado",
  companyId: "co-flores",
  company: "Flores del Valle S.A.S",
  documentType: "CC",
  taxId: "2020202020",
  phone: "3002223344",
  department: "Bogota",
  city: "Bogota D.C.",
  address: "Calle 2 # 2-2",
  permissions: []
};

const rrhhUser = {
  id: "rrhh-1",
  name: "Diego Salazar",
  email: "diego.salazar@transportesantares.co",
  role: "rrhh",
  accountStatus: "aprobado",
  companyId: "co-antares",
  company: "Transportes Antares S.A.S",
  documentType: "CC",
  taxId: "3030303030",
  phone: "3003334455",
  department: "Bogota",
  city: "Bogota D.C.",
  address: "Cra 5 # 6-7",
  permissions: []
};

const pendingUser = {
  id: "client-2",
  name: "Andrés Pardo",
  email: "andres.pardo@exportcolflor.test",
  role: "client",
  accountStatus: "pendiente",
  companyId: "co-exportcol",
  company: "Exportcol Flor S.A.S",
  documentType: "CC",
  taxId: "4040404040",
  phone: "3004445566",
  department: "Cundinamarca",
  city: "Madrid",
  address: "Km 3 vía Madrid",
  permissions: []
};

const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  [KEYS.users]: [adminUser, clientUser, rrhhUser, pendingUser],
  [KEYS.companies]: [
    {
      id: "co-antares",
      name: "Transportes Antares S.A.S",
      taxId: "900000001-0",
      companyKind: "propia",
      phone: "6011111111",
      email: "operaciones@transportesantares.co",
      contactName: "Operaciones Antares",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Sede principal, Zona Industrial",
      logoUrl: logo
    },
    {
      id: "co-flores",
      name: "Flores del Valle S.A.S",
      taxId: "900000002-0",
      companyKind: "cliente",
      phone: "6012222222",
      email: "logistica@floresdelvalle.test",
      contactName: "Laura Gómez",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Zona Franca, Bodega 12",
      logoUrl: logo
    },
    {
      id: "co-exportcol",
      name: "Exportcol Flor S.A.S",
      taxId: "900000003-0",
      companyKind: "cliente",
      phone: "6013333333",
      email: "contacto@exportcolflor.test",
      contactName: "Andrés Pardo",
      department: "Cundinamarca",
      city: "Madrid",
      address: "Km 3 vía Madrid",
      logoUrl: logo
    }
  ],
  [KEYS.counters]: {},
  [KEYS.positions]: [
    {
      id: "pos-analista",
      name: "Analista de operaciones",
      workerRole: "empleado",
      baseSalary: 2200000,
      contractTypeDefault: "Termino indefinido",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel I",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: now.toISOString()
    },
    {
      id: "pos-conductor",
      name: "Conductor C2",
      workerRole: "conductor",
      baseSalary: 2500000,
      contractTypeDefault: "Termino indefinido",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel III",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: now.toISOString()
    },
    {
      id: "pos-coordinador",
      name: "Coordinador de flota",
      workerRole: "empleado",
      baseSalary: 3200000,
      contractTypeDefault: "Termino fijo",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel II",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: now.toISOString()
    }
  ],
  [KEYS.payrollEmployees]: [
    {
      id: "emp-1",
      name: "Carlos Rodríguez",
      idDoc: "1234567890",
      documentType: "CC",
      companyId: "co-antares",
      city: "Bogota D.C.",
      department: "Bogota",
      address: "Cra 10 # 20-30",
      phone: "3005556677",
      emergencyContact: "Ana Rodríguez",
      emergencyPhone: "3005556678",
      emergencyRelation: "Hermana",
      positionId: "pos-analista",
      position: "Analista de operaciones",
      workerRole: "empleado",
      baseSalary: 2200000,
      contractType: "Termino indefinido",
      bankName: "Bancolombia",
      bankAccount: "123456789012",
      startDate: ymd(plusDays(-400)),
      workSchedule: "Diurna",
      eps: "Sura",
      pensionFund: "Porvenir",
      arl: "Sura",
      transportAllowance: 162000
    },
    {
      id: "emp-2",
      name: "Jairo Peña",
      idDoc: "555666777",
      documentType: "CC",
      companyId: "co-antares",
      city: "Bogota D.C.",
      department: "Bogota",
      address: "Av 3 # 4-5",
      phone: "3006667788",
      emergencyContact: "Rosa Peña",
      emergencyPhone: "3006667799",
      emergencyRelation: "Esposa",
      positionId: "pos-conductor",
      position: "Conductor C2",
      workerRole: "conductor",
      baseSalary: 2500000,
      contractType: "Termino indefinido",
      bankName: "Davivienda",
      bankAccount: "556677889900",
      startDate: ymd(plusDays(-200)),
      workSchedule: "Diurna",
      eps: "Sura",
      pensionFund: "Porvenir",
      arl: "Sura",
      transportAllowance: 162000
    },
    {
      id: "emp-3",
      name: "Mónica Silva",
      idDoc: "998877665",
      documentType: "CC",
      companyId: "co-antares",
      city: "Bogota D.C.",
      department: "Bogota",
      address: "Calle 80 # 15-40",
      phone: "3007778899",
      emergencyContact: "Pedro Silva",
      emergencyPhone: "3007778800",
      emergencyRelation: "Padre",
      positionId: "pos-coordinador",
      position: "Coordinador de flota",
      workerRole: "empleado",
      baseSalary: 3200000,
      contractType: "Termino fijo",
      contractDuration: "1 año",
      startDate: ymd(plusDays(-30)),
      contractVigenteStartDate: ymd(plusDays(-30)),
      contractEndDate: ymd(plusDays(335)),
      bankName: "Bancolombia",
      bankAccount: "112233445566",
      workSchedule: "Diurna",
      eps: "Nueva EPS",
      pensionFund: "Colpensiones",
      arl: "Sura",
      transportAllowance: 162000
    }
  ],
  [KEYS.vehicles]: [
    {
      id: "veh-1",
      plate: "ABC123",
      brand: "Chevrolet",
      model: "FTR",
      year: now.getFullYear(),
      type: "Camion",
      color: "Blanco",
      capacityKg: 8000,
      refrigerated: true,
      bodyType: "Furgon",
      fuelType: "Diesel",
      axleConfig: "4x2",
      engineNumber: "ENG001",
      vin: "VIN000000000001",
      ownershipCard: "TP001",
      soatExpeditionDate: ymd(plusDays(-20)),
      soatExpiryDate: ymd(plusDays(340)),
      techInspectionExpeditionDate: ymd(plusDays(-20)),
      techInspectionExpiryDate: ymd(plusDays(340)),
      rcPolicyContract: "RCC-1",
      rcPolicyExtra: "RCE-1",
      rcPolicyExpiry: ymd(plusDays(340)),
      hasGps: true,
      gpsProvider: "Satrack",
      available: true,
      createdAt: now.toISOString()
    },
    {
      id: "veh-2",
      plate: "TQM456",
      brand: "Kenworth",
      model: "T440",
      year: now.getFullYear() - 2,
      type: "Tractomula",
      color: "Rojo",
      capacityKg: 34000,
      refrigerated: true,
      bodyType: "Furgon termico",
      fuelType: "Diesel",
      axleConfig: "6x4",
      engineNumber: "ENG002",
      vin: "VIN000000000002",
      ownershipCard: "TP002",
      soatExpeditionDate: ymd(plusDays(-100)),
      soatExpiryDate: ymd(plusDays(20)),
      techInspectionExpeditionDate: ymd(plusDays(-100)),
      techInspectionExpiryDate: ymd(plusDays(20)),
      rcPolicyContract: "RCC-2",
      rcPolicyExtra: "RCE-2",
      rcPolicyExpiry: ymd(plusDays(20)),
      hasGps: true,
      gpsProvider: "Satrack",
      available: false,
      createdAt: now.toISOString()
    }
  ],
  [KEYS.drivers]: [
    {
      id: "drv-1",
      name: "Jairo Peña",
      fullName: "Jairo Peña",
      companyId: "co-antares",
      phone: "3006667788",
      documentType: "CC",
      idDoc: "555666777",
      license: "C2-8899",
      licenseCategory: "C2",
      licenseExpiry: ymd(plusDays(180)),
      bloodType: "O+",
      eps: "Sura",
      arl: "Sura",
      city: "Bogota D.C.",
      department: "Bogota",
      address: "Av 3 # 4-5",
      emergencyContact: "Rosa Peña",
      emergencyPhone: "3006667799",
      contractType: "Indefinido",
      baseSalary: 2500000,
      available: true,
      hiredAt: now.toISOString()
    },
    {
      id: "drv-2",
      name: "Fabio Torres",
      fullName: "Fabio Torres",
      companyId: "co-antares",
      phone: "3009991122",
      documentType: "CC",
      idDoc: "444333222",
      license: "C3-1122",
      licenseCategory: "C3",
      licenseExpiry: ymd(plusDays(10)),
      bloodType: "A+",
      eps: "Nueva EPS",
      arl: "Sura",
      city: "Medellin",
      department: "Antioquia",
      address: "Cra 45 # 10-12",
      emergencyContact: "Marta Torres",
      emergencyPhone: "3009991100",
      contractType: "Indefinido",
      baseSalary: 2700000,
      available: false,
      hiredAt: now.toISOString()
    }
  ],
  [KEYS.requests]: [
    {
      id: "req-edit",
      requestNumber: "SOL-1001",
      clientUserId: "client-1",
      clientName: "Flores del Valle S.A.S",
      clientCompanyId: "co-flores",
      clientCompanyLogoUrl: logo,
      requestedByName: "Laura Gómez",
      originDepartment: "Bogota",
      originCity: "Bogota D.C.",
      originAddress: "Bodega 1, Zona Franca",
      destinationDepartment: "Antioquia",
      destinationCity: "Medellin",
      destinationAddress: "Centro logístico Medellín",
      pickupAt: `${ymd(plusDays(7))}T09:00:00.000Z`,
      etaDelivery: `${ymd(plusDays(8))}T15:00:00.000Z`,
      serviceType: "Transporte nacional",
      cargoDescription: "Flores de exportación",
      requiresThermoking: true,
      refrigeracionTermoking: true,
      requiredTruckType: "Tractomula",
      tripValue: 0,
      siteContactName: "Patio Norte",
      siteContactPhone: "3001234567",
      notes: "Solicitud pendiente de asignación",
      status: "Pendiente",
      createdAt: now.toISOString()
    },
    {
      id: "req-trip-create",
      requestNumber: "SOL-1002",
      clientUserId: "client-1",
      clientName: "Flores del Valle S.A.S",
      clientCompanyId: "co-flores",
      clientCompanyLogoUrl: logo,
      requestedByName: "Laura Gómez",
      originDepartment: "Bogota",
      originCity: "Bogota D.C.",
      originAddress: "Bodega 2",
      destinationDepartment: "Antioquia",
      destinationCity: "Medellin",
      destinationAddress: "Patio Medellín",
      pickupAt: `${ymd(plusDays(10))}T11:00:00.000Z`,
      etaDelivery: `${ymd(plusDays(11))}T19:00:00.000Z`,
      serviceType: "Transporte nacional",
      cargoDescription: "Carga general",
      requiresThermoking: false,
      refrigeracionTermoking: false,
      requiredTruckType: "Camión",
      tripValue: 0,
      siteContactName: "Cliente 2",
      siteContactPhone: "3001234568",
      notes: "Pendiente para asignar",
      status: "Pendiente",
      createdAt: now.toISOString()
    },
    {
      id: "req-trip-edit",
      requestNumber: "SOL-1003",
      clientUserId: "client-1",
      clientName: "Flores del Valle S.A.S",
      clientCompanyId: "co-flores",
      clientCompanyLogoUrl: logo,
      requestedByName: "Laura Gómez",
      originDepartment: "Bogota",
      originCity: "Bogota D.C.",
      originAddress: "Bodega 3",
      destinationDepartment: "Antioquia",
      destinationCity: "Medellin",
      destinationAddress: "Patio 3",
      pickupAt: `${ymd(plusDays(7))}T13:00:00.000Z`,
      etaDelivery: `${ymd(plusDays(8))}T16:00:00.000Z`,
      serviceType: "Transporte nacional",
      cargoDescription: "Insumos agrícolas",
      requiresThermoking: false,
      refrigeracionTermoking: false,
      requiredTruckType: "Camión",
      tripValue: 1200000,
      siteContactName: "Cliente 3",
      siteContactPhone: "3001234569",
      notes: "Viaje ya asignado",
      status: "Viaje asignado",
      trip: {
        tripNumber: "VIA-2001",
        vehicleId: "veh-1",
        vehiclePlate: "ABC123",
        vehicleType: "Camion",
        driverId: "drv-1",
        driverName: "Jairo Peña",
        driverPhone: "3006667788",
        etaPickup: `${ymd(plusDays(7))}T13:00:00.000Z`,
        etaDelivery: `${ymd(plusDays(8))}T16:00:00.000Z`,
        route: "Bogota D.C. - Medellin"
      },
      createdAt: now.toISOString()
    },
    {
      id: "req-completed",
      requestNumber: "SOL-0998",
      clientUserId: "client-1",
      clientName: "Flores del Valle S.A.S",
      clientCompanyId: "co-flores",
      clientCompanyLogoUrl: logo,
      requestedByName: "Laura Gómez",
      originDepartment: "Bogota",
      originCity: "Bogota D.C.",
      originAddress: "Bodega 1",
      destinationDepartment: "Valle del Cauca",
      destinationCity: "Cali",
      destinationAddress: "CD Cali",
      pickupAt: `${ymd(plusDays(-6))}T08:00:00.000Z`,
      etaDelivery: `${ymd(plusDays(-5))}T18:00:00.000Z`,
      serviceType: "Transporte nacional",
      cargoDescription: "Flores de exportación",
      requiresThermoking: true,
      refrigeracionTermoking: true,
      requiredTruckType: "Tractomula",
      tripValue: 3200000,
      siteContactName: "CD Cali",
      siteContactPhone: "3001234570",
      notes: "Entregado a satisfacción",
      status: "Completado",
      trip: {
        tripNumber: "VIA-1998",
        vehicleId: "veh-2",
        vehiclePlate: "TQM456",
        vehicleType: "Tractomula",
        driverId: "drv-2",
        driverName: "Fabio Torres",
        driverPhone: "3009991122",
        etaPickup: `${ymd(plusDays(-6))}T08:00:00.000Z`,
        etaDelivery: `${ymd(plusDays(-5))}T18:00:00.000Z`,
        route: "Bogota D.C. - Cali"
      },
      createdAt: ymd(plusDays(-7))
    }
  ],
  [KEYS.notifications]: [
    { id: "not-1", userId: "admin-1", title: "Nueva solicitud de transporte", body: "Flores del Valle radicó la solicitud SOL-1002.", createdAt: now.toISOString(), readAt: null },
    { id: "not-2", userId: "admin-1", title: "SOAT próximo a vencer", body: "El vehículo TQM456 vence SOAT en 20 días.", createdAt: now.toISOString(), readAt: null },
    { id: "not-3", userId: "admin-1", title: "Aprobación pendiente", body: "Hay una solicitud de alta de conductor pendiente de revisión.", createdAt: now.toISOString(), readAt: null },
    { id: "not-4", userId: "admin-1", title: "Viaje completado", body: "El viaje VIA-1998 fue entregado a satisfacción.", createdAt: ymd(plusDays(-5)), readAt: now.toISOString() }
  ],
  [KEYS.emails]: [],
  [KEYS.payrollRuns]: [],
  [KEYS.fuelLogs]: [
    {
      id: "fuel-1",
      vehicleId: "veh-1",
      driverId: "drv-1",
      date: ymd(plusDays(-2)),
      tripNumber: "VIA-2001",
      liters: 45,
      totalCost: 540000,
      odometerKm: 120500,
      station: "EDS Terpel Autopista Norte",
      paidBy: "empresa"
    }
  ],
  [KEYS.vehicleTechnicalLogs]: [
    {
      id: "tech-1",
      vehicleId: "veh-1",
      date: ymd(plusDays(-15)),
      type: "preventivo",
      description: "Cambio de aceite y filtros",
      cost: 380000,
      downtimeHours: 3,
      status: "Completado"
    }
  ],
  [KEYS.vacancies]: [
    {
      id: "vac-1",
      title: "Analista de operaciones logísticas",
      positionId: "pos-analista",
      positionName: "Analista de operaciones",
      workerRole: "empleado",
      contractTypeDefault: "Termino indefinido",
      city: "Bogota D.C.",
      department: "Bogota",
      modality: "Presencial",
      openings: 1,
      salaryOffer: 2300000,
      deadline: ymd(plusDays(15)),
      requirements: "Experiencia en logística y transporte de carga",
      status: "Publicada",
      createdAt: now.toISOString()
    },
    {
      id: "vac-2",
      title: "Conductor categoría C2",
      positionId: "pos-conductor",
      positionName: "Conductor C2",
      workerRole: "conductor",
      contractTypeDefault: "Termino indefinido",
      city: "Bogota D.C.",
      department: "Bogota",
      modality: "Presencial",
      openings: 2,
      salaryOffer: 2500000,
      deadline: ymd(plusDays(20)),
      requirements: "Licencia C2 vigente, experiencia mínima 2 años",
      status: "Publicada",
      createdAt: now.toISOString()
    }
  ],
  [KEYS.candidates]: [
    {
      id: "cand-1",
      name: "Paula Jiménez",
      email: "paula.jimenez@correo.test",
      phone: "3007778899",
      documentType: "CC",
      idDoc: "987654321",
      birthDate: "1995-05-10",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Calle 10 # 10-10",
      educationLevel: "Profesional",
      experienceYears: 4,
      expectedSalary: 2400000,
      availabilityDate: ymd(plusDays(20)),
      vacancyId: "vac-1",
      vacancyTitle: "Analista de operaciones logísticas",
      status: "Preseleccionado",
      attachments: [],
      source: "Portal RRHH",
      createdAt: now.toISOString()
    },
    {
      id: "cand-2",
      name: "Wilson Bermúdez",
      email: "wilson.bermudez@correo.test",
      phone: "3007778800",
      documentType: "CC",
      idDoc: "654321987",
      birthDate: "1988-02-20",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Calle 45 # 20-15",
      educationLevel: "Bachiller",
      experienceYears: 6,
      expectedSalary: 2600000,
      availabilityDate: ymd(plusDays(5)),
      vacancyId: "vac-2",
      vacancyTitle: "Conductor categoría C2",
      status: "Entrevista",
      attachments: [],
      source: "Portal público",
      createdAt: now.toISOString()
    }
  ],
  [KEYS.interviews]: [
    {
      id: "int-1",
      candidateId: "cand-2",
      candidateName: "Wilson Bermúdez",
      when: ymdhm(plusDays(3)),
      interviewer: "Diego Salazar",
      modality: "Presencial",
      locationOrLink: "Sede principal, Bogotá",
      notes: "Entrevista técnica y prueba de manejo"
    }
  ],
  [KEYS.contracts]: [
    {
      id: "con-1",
      employeeId: "emp-1",
      employeeName: "Carlos Rodríguez",
      position: "Analista de operaciones",
      contractType: "Termino indefinido",
      startDate: ymd(plusDays(-400)),
      baseSalary: 2200000,
      status: "Vigente",
      createdAt: now.toISOString()
    }
  ],
  [KEYS.hrAbsences]: [
    {
      id: "abs-1",
      employeeId: "emp-1",
      employeeName: "Carlos Rodríguez",
      absenceType: "incapacidad",
      startDate: ymd(plusDays(-3)),
      endDate: ymd(plusDays(-1)),
      days: 3,
      supportNumber: "SUP-001",
      epsEntity: "Sura",
      notes: "Reposo médico",
      createdAt: now.toISOString()
    }
  ],
  [KEYS.sstCompliance]: [
    {
      id: "sst-1",
      employeeId: "emp-1",
      employeeName: "Carlos Rodríguez",
      recordType: "Capacitacion SST",
      provider: "ARL Sura",
      dueDate: ymd(plusDays(25)),
      status: "Pendiente",
      documentCode: "SST-001",
      notes: "Pendiente de cierre",
      createdAt: now.toISOString(),
      createdBy: "Camila Restrepo"
    },
    {
      id: "sst-2",
      employeeId: "emp-2",
      employeeName: "Jairo Peña",
      recordType: "Examen medico ocupacional",
      provider: "IPS Colmédica",
      dueDate: ymd(plusDays(-2)),
      status: "Vencido",
      documentCode: "SST-002",
      notes: "Reprogramar con urgencia",
      createdAt: now.toISOString(),
      createdBy: "Camila Restrepo"
    }
  ],
  [KEYS.tripRouteRates]: {},
  [KEYS.approvals]: [
    {
      id: "app-1",
      type: "create_driver",
      title: "Creación conductor pendiente",
      payload: {
        name: "Nelson Cárdenas",
        companyId: "co-antares",
        phone: "3008889900",
        documentType: "CC",
        idDoc: "1122334455",
        license: "C2-7777",
        licenseCategory: "C2",
        licenseExpiry: ymd(plusDays(120)),
        city: "Bogota D.C.",
        department: "Bogota",
        address: "Calle 8 # 8-8",
        emergencyContact: "Marta Cárdenas",
        emergencyPhone: "3008889911",
        contractType: "Indefinido",
        baseSalary: 2500000
      },
      status: "pendiente",
      requestedByUserId: "client-1",
      requestedByName: "Laura Gómez",
      requestedAt: now.toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: ""
    },
    {
      id: "app-2",
      type: "create_vehicle",
      title: "Alta de vehículo pendiente",
      payload: { plate: "XYZ999", brand: "Hino", model: "500" },
      status: "pendiente",
      requestedByUserId: "client-1",
      requestedByName: "Laura Gómez",
      requestedAt: now.toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: ""
    }
  ],
  [KEYS.session]: {
    userId: "admin-1",
    role: "admin",
    email: "camila.restrepo@transportesantares.co",
    lastActivityAt: Date.now(),
    profileSnapshot: {
      id: "admin-1",
      name: "Camila Restrepo",
      email: "camila.restrepo@transportesantares.co",
      role: "admin"
    }
  },
  [KEYS.payrollWorkspace]: "data",
  [KEYS.hiringWorkspace]: "data"
};

const RAW_KEYS = new Set([
  "antares_portal_data_ver",
  "antares_users_storage_ver",
  "antares_hr_payroll_workspace_v1",
  "antares_hr_hiring_workspace_v1"
]);

function outPath(...parts) {
  const p = path.join(OUT_DIR, ...parts);
  mkdirSync(path.dirname(p), { recursive: true });
  return p;
}

async function seed(context) {
  await context.addInitScript(
    ({ payload, rawKeys }) => {
      localStorage.clear();
      Object.entries(payload).forEach(([key, value]) => {
        localStorage.setItem(key, rawKeys.includes(key) ? String(value) : JSON.stringify(value));
      });
    },
    { payload: seedStore, rawKeys: [...RAW_KEYS] }
  );
}

async function gotoView(page, view) {
  await page.evaluate((v) => {
    window.location.hash = `#portal/${v}`;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, view);
  await page.waitForTimeout(500);
}

async function safeClick(page, selector, { timeout = 3000 } = {}) {
  try {
    await page.waitForSelector(selector, { state: "attached", timeout });
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ block: "center" });
    }, selector);
    await page.evaluate((sel) => document.querySelector(sel)?.click(), selector);
    await page.waitForTimeout(350);
    return true;
  } catch (_err) {
    return false;
  }
}

async function ensureWorkspaceTab(page, moduleId, tabId) {
  await safeClick(page, `[data-action='hr-workspace-tab'][data-module='${moduleId}'][data-tab='${tabId}']`);
}

async function ensureCreatePanel(page, panelId) {
  const isHidden = await page
    .evaluate((id) => {
      const panel = document.querySelector(`[data-create-panel="${id}"]`);
      return !panel || panel.classList.contains("hidden") || panel.hasAttribute("hidden");
    }, panelId)
    .catch(() => true);
  if (isHidden) {
    await safeClick(page, `[data-action='toggle-create-panel'][data-panel='${panelId}']`);
  }
}

async function shoot(page, file, { fullPage = true } = {}) {
  try {
    await page.screenshot({ path: outPath(file), fullPage });
    console.log(`  OK  ${file}`);
  } catch (err) {
    console.log(`  ERR ${file}: ${String(err?.message || err)}`);
  }
}

async function closeModals(page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page
    .evaluate(() => {
      document.getElementById("crud-modal")?.classList.add("hidden");
    })
    .catch(() => {});
  await page.waitForTimeout(150);
}

async function freshPage(context) {
  const page = await context.newPage();
  page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("#portal-app", { timeout: 15000 });
  await page.waitForTimeout(600);
  return page;
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await seed(context);

  // --- Introducción: sitio público + modal de acceso (sin sesión) ---
  {
    const publicContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await publicContext.newPage();
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await shoot(page, "introduccion/01-sitio-publico.png", { fullPage: false });
    await safeClick(page, "#open-auth");
    await page.waitForTimeout(400);
    await shoot(page, "introduccion/02-modal-acceso.png", { fullPage: false });
    await publicContext.close();
  }

  // --- Portal autenticado: shell general (sidebar + topbar) ---
  {
    const page = await freshPage(context);
    await gotoView(page, "dashboard");
    await shoot(page, "introduccion/03-shell-portal.png", { fullPage: false });
    await page.close();
  }

  const modules = [
    {
      slug: "dashboard",
      view: "dashboard",
      steps: [{ name: "01-vista-general" }]
    },
    {
      slug: "solicitudes",
      view: "requests",
      steps: [
        { name: "01-listado", tab: { module: "requests", id: "data" } },
        { name: "02-nueva-solicitud", tab: { module: "requests", id: "operate" } },
        {
          name: "03-editar-solicitud",
          tab: { module: "requests", id: "data" },
          click: "[data-action='edit-request'][data-id='req-edit']",
          waitSelector: "#crud-form",
          closeAfter: true
        }
      ]
    },
    {
      slug: "viajes",
      view: "transport-trips",
      steps: [
        { name: "01-listado", tab: { module: "transport-trips", id: "data" } },
        { name: "02-crear-viaje", tab: { module: "transport-trips", id: "operate" }, createPanel: "create-trip" },
        {
          name: "03-editar-viaje",
          tab: { module: "transport-trips", id: "data" },
          click: "[data-action='edit-trip'][data-id='req-trip-edit']",
          waitSelector: "#crud-form",
          closeAfter: true
        }
      ]
    },
    {
      slug: "camiones",
      view: "transport-vehicles",
      steps: [
        { name: "01-listado-flota", tab: { module: "transport-vehicles", id: "data" } },
        {
          name: "02-nuevo-vehiculo",
          tab: { module: "transport-vehicles", id: "operate" },
          click: "[data-action='vehicles-section'][data-section='create']",
          createPanel: "create-vehicle"
        },
        {
          name: "03-registro-combustible",
          tab: { module: "transport-vehicles", id: "operate" },
          click: "[data-action='vehicles-section'][data-section='fuel']",
          createPanel: "create-fuel-log"
        },
        {
          name: "04-mantenimiento-taller",
          tab: { module: "transport-vehicles", id: "operate" },
          click: "[data-action='vehicles-section'][data-section='technical']",
          createPanel: "create-technical-log"
        }
      ]
    },
    {
      slug: "conductores",
      view: "transport-drivers",
      steps: [
        { name: "01-listado" },
        {
          name: "02-editar-conductor",
          click: "[data-action='edit-driver'][data-id='drv-1']",
          waitSelector: "#crud-form",
          closeAfter: true
        }
      ]
    },
    {
      slug: "calendario",
      view: "transport-calendar",
      steps: [{ name: "01-vista-mes" }, { name: "02-vista-semana", click: "[data-action='cal-view'][data-view='week']" }]
    },
    {
      slug: "historial",
      view: "history",
      steps: [{ name: "01-trazabilidad" }]
    },
    {
      slug: "reporteria",
      view: "reports",
      steps: [{ name: "01-exportar-reportes" }, { name: "02-analitica-operativa", click: "[data-action='reports-set-tab'][data-tab='bi']" }]
    },
    {
      slug: "gestion-humana",
      view: "payroll",
      steps: [
        { name: "01-listado-empleados", tab: { module: "payroll", id: "data" } },
        { name: "02-nuevo-empleado", tab: { module: "payroll", id: "operate" }, createPanel: "create-employee" },
        {
          name: "03-registrar-ausencia",
          tab: { module: "payroll", id: "operate" },
          click: "[data-action='payroll-operate-section'][data-section='absence']",
          createPanel: "create-hr-absence"
        }
      ]
    },
    {
      slug: "contratacion",
      view: "hiring",
      steps: [
        { name: "01-cargos-y-vacantes", tab: { module: "hiring", id: "data" } },
        {
          name: "02-nueva-vacante",
          tab: { module: "hiring", id: "operate" },
          click: "[data-action='hiring-operate-section'][data-section='vacancy']",
          createPanel: "create-vacancy"
        },
        {
          name: "03-nuevo-candidato",
          tab: { module: "hiring", id: "operate" },
          click: "[data-action='hiring-operate-section'][data-section='candidate']",
          createPanel: "create-candidate"
        },
        {
          name: "04-agendar-entrevista",
          tab: { module: "hiring", id: "operate" },
          click: "[data-action='hiring-operate-section'][data-section='interview']",
          createPanel: "create-interview"
        }
      ]
    },
    {
      slug: "cumplimiento-laboral",
      view: "labor-compliance",
      steps: [{ name: "01-listado-sst" }, { name: "02-nuevo-registro", createPanel: "create-sst-control" }]
    },
    {
      slug: "contacto-b2b",
      view: "contact-leads",
      steps: [{ name: "01-bandeja-prospectos" }]
    },
    {
      slug: "usuarios-permisos",
      view: "admin-users",
      steps: [
        { name: "01-listado-usuarios" },
        { name: "02-crear-usuario", click: "[data-action='toggle-admin-panel'][data-panel='create-user']" },
        { name: "03-asignar-permisos", click: "[data-action='toggle-admin-panel'][data-panel='set-permissions']" }
      ]
    },
    {
      slug: "autorizaciones",
      view: "authorizations",
      steps: [{ name: "01-centro-aprobaciones" }]
    },
    {
      slug: "notificaciones",
      view: "notifications",
      steps: [{ name: "01-bandeja" }]
    },
    {
      slug: "mi-perfil",
      view: "profile",
      steps: [{ name: "01-formulario" }]
    }
  ];

  const only = (process.env.ONLY_SLUGS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const targetModules = only.length ? modules.filter((m) => only.includes(m.slug)) : modules;

  for (const mod of targetModules) {
    console.log(`Módulo: ${mod.slug}`);
    const page = await freshPage(context);
    await gotoView(page, mod.view);
    for (const step of mod.steps) {
      if (step.tab) await ensureWorkspaceTab(page, step.tab.module, step.tab.id);
      if (step.click) await safeClick(page, step.click);
      if (step.createPanel) await ensureCreatePanel(page, step.createPanel);
      if (step.waitSelector) {
        await page.waitForSelector(step.waitSelector, { state: "attached", timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(250);
      }
      await shoot(page, `${mod.slug}/${step.name}.png`, { fullPage: !step.waitSelector });
      if (step.closeAfter) await closeModals(page);
    }
    await page.close();
  }

  await context.close();
  await browser.close();
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
