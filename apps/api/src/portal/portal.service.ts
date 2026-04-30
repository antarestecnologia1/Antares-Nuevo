import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { Pool, PoolClient } from "pg";
import { PG_POOL } from "../database/database.module";
import type { PortalSyncKey } from "./dto/sync-key.dto";

type JwtRole = string;

@Injectable()
export class PortalService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  private isAdmin(role: JwtRole) {
    return String(role || "").toLowerCase() === "admin";
  }

  private isTransportOps(role: JwtRole) {
    const r = String(role || "").toLowerCase();
    return ["admin", "administracion", "auxiliar_administrativo", "lider_administrativo"].includes(r);
  }

  private isRrhh(role: JwtRole) {
    const r = String(role || "").toLowerCase();
    return ["admin", "rrhh", "administracion", "auxiliar_administrativo", "lider_administrativo"].includes(r);
  }

  private async getUserCompany(userId: string): Promise<string | null> {
    const r = await this.pool.query<{ id_empresa: string | null }>(
      `SELECT id_empresa::text AS id_empresa FROM usuarios WHERE id = $1::uuid`,
      [userId]
    );
    return r.rows[0]?.id_empresa ?? null;
  }

  async bootstrap(userId: string, role: JwtRole) {
    const empresaId = await this.getUserCompany(userId);
    const admin = this.isAdmin(role);
    const transport = this.isTransportOps(role) || admin;
    const rrhh = this.isRrhh(role);

    const [
      companies,
      users,
      counters,
      travelAllowanceRules,
      tripRouteRates,
      requests,
      vehicles,
      drivers,
      notifications,
      emails,
      contacts,
      positions,
      vacancies,
      candidates,
      interviews,
      contracts,
      payrollEmployees,
      payrollRuns,
      fuelLogs,
      vehicleTechnicalLogs,
      hrAbsences,
      sstCompliance,
      approvals
    ] = await Promise.all([
      this.loadCompanies(),
      this.loadUsers(admin, userId, empresaId),
      this.loadCounters(),
      this.loadTravelAllowanceRules(),
      this.loadTripRouteRates(),
      this.loadRequests(admin, userId, empresaId, transport),
      transport ? this.loadVehicles() : Promise.resolve([]),
      transport ? this.loadDrivers() : Promise.resolve([]),
      this.loadNotifications(userId, admin),
      this.loadEmails(admin),
      this.loadContacts(admin),
      rrhh || admin ? this.loadPositions() : Promise.resolve([]),
      rrhh || admin ? this.loadVacancies() : Promise.resolve([]),
      rrhh || admin ? this.loadCandidates() : Promise.resolve([]),
      rrhh || admin ? this.loadInterviews() : Promise.resolve([]),
      rrhh || admin ? this.loadContracts() : Promise.resolve([]),
      rrhh || admin ? this.loadPayrollEmployees(empresaId, admin) : Promise.resolve([]),
      rrhh || admin ? this.loadPayrollRuns() : Promise.resolve([]),
      transport || admin ? this.loadFuelLogs() : Promise.resolve([]),
      transport || admin ? this.loadVehicleTechnicalLogs() : Promise.resolve([]),
      rrhh || admin ? this.loadHrAbsences() : Promise.resolve([]),
      rrhh || admin ? this.loadSstCompliance() : Promise.resolve([]),
      this.loadApprovals(admin, userId, empresaId)
    ]);

    return {
      users,
      companies,
      counters,
      contacts,
      requests,
      vehicles,
      drivers,
      notifications,
      emails,
      payrollEmployees,
      payrollRuns,
      fuelLogs,
      vehicleTechnicalLogs,
      travelAllowanceRules,
      vacancies,
      candidates,
      positions,
      interviews,
      contracts,
      hrAbsences,
      sstCompliance,
      tripRouteRates,
      approvals
    };
  }

  async syncKey(key: PortalSyncKey, data: unknown, userId: string, role: JwtRole) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await this.syncKeyTx(client, key, data, userId, role);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  private async syncKeyTx(c: PoolClient, key: PortalSyncKey, data: unknown, userId: string, role: JwtRole) {
    switch (key) {
      case "users":
        await this.syncUsers(c, data, userId, role);
        return;
      case "companies":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncCompanies(c, data);
        return;
      case "counters":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncCounters(c, data);
        return;
      case "contacts":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncContacts(c, data);
        return;
      case "requests":
        await this.syncRequests(c, data, userId, role);
        return;
      case "vehicles":
        if (!this.isTransportOps(role) && !this.isAdmin(role)) throw new ForbiddenException();
        await this.syncVehicles(c, data);
        return;
      case "drivers":
        if (!this.isTransportOps(role) && !this.isAdmin(role)) throw new ForbiddenException();
        await this.syncDrivers(c, data);
        return;
      case "notifications":
        await this.syncNotifications(c, data, userId, role);
        return;
      case "emails":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncEmails(c, data);
        return;
      case "payrollEmployees":
        if (!this.isRrhh(role)) throw new ForbiddenException();
        await this.syncPayrollEmployees(c, data);
        return;
      case "payrollRuns":
        if (!this.isRrhh(role)) throw new ForbiddenException();
        await this.syncPayrollRuns(c, data);
        return;
      case "fuelLogs":
        if (!this.isTransportOps(role) && !this.isAdmin(role)) throw new ForbiddenException();
        await this.syncFuelLogs(c, data);
        return;
      case "vehicleTechnicalLogs":
        if (!this.isTransportOps(role) && !this.isAdmin(role)) throw new ForbiddenException();
        await this.syncVehicleTechnicalLogs(c, data);
        return;
      case "travelAllowanceRules":
        if (!this.isAdmin(role)) throw new ForbiddenException();
        await this.syncTravelAllowanceRules(c, data);
        return;
      case "vacancies":
      case "candidates":
      case "interviews":
      case "contracts":
      case "positions":
        if (!this.isRrhh(role)) throw new ForbiddenException();
        await this.syncHrKeys(c, key, data);
        return;
      case "hrAbsences":
        if (!this.isRrhh(role)) throw new ForbiddenException();
        await this.syncHrAbsences(c, data);
        return;
      case "sstCompliance":
        if (!this.isRrhh(role)) throw new ForbiddenException();
        await this.syncSst(c, data);
        return;
      case "tripRouteRates":
        if (!this.isTransportOps(role) && !this.isAdmin(role)) throw new ForbiddenException();
        await this.syncTripRouteRates(c, data);
        return;
      case "approvals":
        await this.syncApprovals(c, data, userId, role);
        return;
      default:
        throw new ForbiddenException("Clave no soportada");
    }
  }

  /* ─── Loaders ─── */

  private async loadCompanies() {
    const r = await this.pool.query(
      `SELECT id::text, nombre AS name, nit, telefono AS phone, fecha_creacion AS "createdAt"
       FROM empresas ORDER BY nombre`
    );
    return r.rows.map((row) => ({
      id: row.id,
      name: row.name,
      nit: row.nit,
      phone: row.phone || "",
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString()
    }));
  }

  private async loadUsers(admin: boolean, userId: string, empresaId: string | null) {
    const sql = admin
      ? `SELECT u.id::text, u.correo_electronico AS email, u.nombre_completo AS name, u.rol::text AS role,
              u.estado_cuenta::text AS "accountStatus", u.id_empresa::text AS "companyId",
              e.nombre AS company,
              u.primer_nombre AS "firstName", u.segundo_nombre AS "middleName", u.primer_apellido AS "lastName",
              u.segundo_apellido AS "secondLastName", u.tipo_persona AS "personType", u.tipo_documento AS "documentType",
              u.numero_identificacion AS "personalDoc",
              u.nit_empresa_registro AS "companyNit",
              COALESCE(u.nit_empresa_registro, u.numero_identificacion) AS "taxId",
              u.fecha_expedicion_documento AS "documentIssuedAt",
              u.fecha_nacimiento AS "birthDate", u.genero AS gender, u.cargo_registro AS position, u.area_trabajo AS "workArea",
              u.telefono AS phone, u.departamento AS department, u.ciudad AS city, u.direccion AS address,
              u.contacto_emergencia AS "emergencyContact", u.telefono_emergencia AS "emergencyPhone",
              u.parentesco_emergencia AS "emergencyRelationship", u.url_avatar AS "avatarUrl",
              u.fecha_ingreso_portal AS "portalSince"
         FROM usuarios u
         LEFT JOIN empresas e ON e.id = u.id_empresa
         ORDER BY u.correo_electronico`
      : `SELECT u.id::text, u.correo_electronico AS email, u.nombre_completo AS name, u.rol::text AS role,
              u.estado_cuenta::text AS "accountStatus", u.id_empresa::text AS "companyId",
              e.nombre AS company,
              u.primer_nombre AS "firstName", u.segundo_nombre AS "middleName", u.primer_apellido AS "lastName",
              u.segundo_apellido AS "secondLastName", u.tipo_persona AS "personType", u.tipo_documento AS "documentType",
              u.numero_identificacion AS "personalDoc",
              u.nit_empresa_registro AS "companyNit",
              COALESCE(u.nit_empresa_registro, u.numero_identificacion) AS "taxId",
              u.fecha_expedicion_documento AS "documentIssuedAt",
              u.fecha_nacimiento AS "birthDate", u.genero AS gender, u.cargo_registro AS position, u.area_trabajo AS "workArea",
              u.telefono AS phone, u.departamento AS department, u.ciudad AS city, u.direccion AS address,
              u.contacto_emergencia AS "emergencyContact", u.telefono_emergencia AS "emergencyPhone",
              u.parentesco_emergencia AS "emergencyRelationship", u.url_avatar AS "avatarUrl",
              u.fecha_ingreso_portal AS "portalSince"
         FROM usuarios u
         LEFT JOIN empresas e ON e.id = u.id_empresa
         WHERE u.id = $1::uuid OR ($2::uuid IS NOT NULL AND u.id_empresa = $2::uuid)`;

    const r = admin
      ? await this.pool.query(sql)
      : await this.pool.query(sql, [userId, empresaId]);

    const ids = r.rows.map((x) => x.id);
    const permMap = new Map<string, string[]>();
    if (ids.length) {
      const p = await this.pool.query(`SELECT id_usuario::text AS uid, permiso FROM permisos_usuario WHERE id_usuario = ANY($1::uuid[])`, [
        ids
      ]);
      for (const row of p.rows) {
        const arr = permMap.get(row.uid) || [];
        arr.push(row.permiso);
        permMap.set(row.uid, arr);
      }
    }

    return r.rows.map((row) => ({
      ...row,
      password: "",
      permissions: permMap.get(row.id) || [],
      documentIssuedAt: row.documentIssuedAt
        ? new Date(row.documentIssuedAt).toISOString().slice(0, 10)
        : "",
      birthDate: row.birthDate ? new Date(row.birthDate).toISOString().slice(0, 10) : "",
      company: row.company || ""
    }));
  }

  private async loadCounters() {
    const r = await this.pool.query(`SELECT prefijo, ultimo_valor FROM contadores_secuencia`);
    const out: Record<string, number> = {};
    for (const row of r.rows) {
      const k = String(row.prefijo);
      out[k] = Number(row.ultimo_valor);
    }
    return out;
  }

  private async loadTravelAllowanceRules() {
    const r = await this.pool.query(
      `SELECT valor_viaje_interdepartamental_cop FROM reglas_viatico_interdepartamental WHERE id = 1`
    );
    const v = r.rows[0] ? Number(r.rows[0].valor_viaje_interdepartamental_cop) : 85000;
    return { interDepartmentTripAmount: v };
  }

  private async loadTripRouteRates() {
    const r = await this.pool.query(
      `SELECT departamento_origen, ciudad_origen, departamento_destino, ciudad_destino, valor_tarifa_cop
       FROM tarifas_trayecto WHERE activo = true`
    );
    const out: Record<string, number> = {};
    for (const row of r.rows) {
      const o = `${String(row.departamento_origen || "").trim()}|${String(row.ciudad_origen || "").trim()}`.toLowerCase();
      const d = `${String(row.departamento_destino || "").trim()}|${String(row.ciudad_destino || "").trim()}`.toLowerCase();
      out[`${o}->${d}`] = Number(row.valor_tarifa_cop);
    }
    return out;
  }

  private async loadRequests(admin: boolean, userId: string, empresaId: string | null, transport: boolean) {
    const base = `
      SELECT s.id::text,
             s.numero_solicitud AS "requestNumber",
             s.id_usuario_solicitante::text AS "clientUserId",
             s.id_empresa_cliente::text AS "clientCompanyId",
             s.nombre_cliente AS "clientName",
             s.nombre_quien_solicita AS "requestedByName",
             s.departamento_origen AS "originDepartment",
             s.ciudad_origen AS "originCity",
             s.direccion_origen AS "originAddress",
             s.departamento_destino AS "destinationDepartment",
             s.ciudad_destino AS "destinationCity",
             s.direccion_destino AS "destinationAddress",
             s.fecha_hora_recogida AS "pickupAt",
             s.fecha_hora_entrega_estimada AS "etaDelivery",
             s.tipo_vehiculo_solicitado AS "vehicleType",
             s.descripcion_carga AS "cargoDescription",
             s.tipo_servicio AS "serviceType",
             s.numero_cajas AS "boxesCount",
             s.peso_kg AS "weightKg",
             s.nombre_contacto_en_sitio AS "contactName",
             s.telefono_contacto_en_sitio AS "contactPhone",
             s.observaciones AS observations,
             s.adjuntos_nombres_json AS attachments,
             s.estado::text AS status,
             s.valor_tarifa_viaje AS "tripValue",
             s.total_cargos_standby AS "standbyChargeTotal",
             s.eventos_standby_json AS "standbyEvents",
             s.motivo_rechazo AS "rejectionReason",
             s.fecha_aprobacion AS "approvedAt",
             s.aprobado_por AS "approvedBy",
             s.fecha_entrega_efectiva AS "deliveredAt",
             s.fecha_cierre AS "closedAt",
             s.fecha_creacion AS "createdAt",
             v.id::text AS "trip_id",
             v.numero_viaje AS "trip_tripNumber",
             v.id_vehiculo::text AS "trip_vehicleId",
             v.placa_vehiculo AS "trip_vehiclePlate",
             v.tipo_vehiculo_asignado AS "trip_vehicleType",
             v.id_conductor::text AS "trip_driverId",
             v.nombre_conductor AS "trip_driverName",
             v.telefono_conductor AS "trip_driverPhone",
             v.descripcion_ruta AS "trip_route",
             v.fecha_hora_recogida_programada AS "trip_etaPickup",
             v.fecha_hora_entrega_programada AS "trip_etaDelivery",
             v.asignado_por AS "trip_assignedBy",
             v.fecha_hora_asignacion AS "trip_assignedAt",
             v.estado_operativo_en_vivo AS "trip_realtimeStatus",
             v.datos_factura_json AS "trip_invoice"
      FROM solicitudes_transporte s
      LEFT JOIN viajes_transporte v ON v.id_solicitud = s.id`;

    const r =
      admin || transport
        ? await this.pool.query(base + ` ORDER BY s.fecha_creacion DESC`)
        : await this.pool.query(
            base + ` WHERE s.id_usuario_solicitante = $1::uuid OR ($2::uuid IS NOT NULL AND s.id_empresa_cliente = $2::uuid) ORDER BY s.fecha_creacion DESC`,
            [userId, empresaId]
          );

    return r.rows.map((row) => this.mapRequestRow(row));
  }

  private mapRequestRow(row: Record<string, unknown>) {
    const trip =
      row.trip_id &&
      String(row.trip_id).length > 0 &&
      row.trip_tripNumber &&
      String(row.trip_tripNumber).length > 0
        ? {
            id: row.trip_id,
            tripNumber: row.trip_tripNumber,
            vehicleId: row.trip_vehicleId,
            vehiclePlate: row.trip_vehiclePlate,
            vehicleType: row.trip_vehicleType,
            driverId: row.trip_driverId,
            driverName: row.trip_driverName,
            driverPhone: row.trip_driverPhone,
            route: row.trip_route,
            etaPickup: row.trip_etaPickup ? new Date(row.trip_etaPickup as string).toISOString() : null,
            etaDelivery: row.trip_etaDelivery ? new Date(row.trip_etaDelivery as string).toISOString() : null,
            assignedBy: row.trip_assignedBy,
            assignedAt: row.trip_assignedAt ? new Date(row.trip_assignedAt as string).toISOString() : null,
            realtimeStatus: row.trip_realtimeStatus,
            invoice: row.trip_invoice || null
          }
        : null;

    return {
      id: row.id,
      requestNumber: row.requestNumber,
      clientUserId: row.clientUserId,
      clientCompanyId: row.clientCompanyId,
      clientName: row.clientName,
      requestedByName: row.requestedByName,
      originDepartment: row.originDepartment,
      originCity: row.originCity,
      originAddress: row.originAddress,
      destinationDepartment: row.destinationDepartment,
      destinationCity: row.destinationCity,
      destinationAddress: row.destinationAddress,
      pickupAt: row.pickupAt ? new Date(row.pickupAt as string).toISOString() : null,
      etaDelivery: row.etaDelivery ? new Date(row.etaDelivery as string).toISOString() : null,
      vehicleType: row.vehicleType,
      cargoDescription: row.cargoDescription,
      serviceType: row.serviceType,
      boxesCount: row.boxesCount,
      weightKg: row.weightKg,
      contactName: row.contactName,
      contactPhone: row.contactPhone,
      observations: row.observations,
      attachments: Array.isArray(row.attachments) ? row.attachments : JSON.parse(String(row.attachments || "[]")),
      status: row.status,
      tripValue: row.tripValue,
      standbyChargeTotal: row.standbyChargeTotal,
      standbyEvents: Array.isArray(row.standbyEvents) ? row.standbyEvents : JSON.parse(String(row.standbyEvents || "[]")),
      rejectionReason: row.rejectionReason || "",
      approvedAt: row.approvedAt ? new Date(row.approvedAt as string).toISOString() : null,
      approvedBy: row.approvedBy || null,
      deliveredAt: row.deliveredAt ? new Date(row.deliveredAt as string).toISOString() : null,
      closedAt: row.closedAt ? new Date(row.closedAt as string).toISOString() : null,
      createdAt: row.createdAt ? new Date(row.createdAt as string).toISOString() : new Date().toISOString(),
      trip,
      apiSynced: true
    };
  }

  private async loadVehicles() {
    const r = await this.pool.query(`SELECT * FROM vehiculos ORDER BY placa`);
    return r.rows.map((v) => ({
      id: v.id,
      plate: v.placa,
      brand: v.marca,
      model: v.linea_modelo,
      year: v.anio_modelo,
      color: v.color,
      type: v.tipo_vehiculo,
      capacityKg: Number(v.capacidad_kg),
      refrigerated: v.refrigerado_termoking,
      bodyType: v.tipo_carroceria,
      fuelType: v.tipo_combustible,
      axleConfig: v.configuracion_ejes,
      engineNumber: v.numero_motor,
      vin: v.numero_chasis_vin,
      ownershipCard: v.numero_tarjeta_propiedad,
      soatExpeditionDate: v.fecha_expedicion_soat,
      soatExpiryDate: v.fecha_vencimiento_soat,
      techInspectionExpeditionDate: v.fecha_expedicion_tecnomecanica,
      techInspectionExpiryDate: v.fecha_vencimiento_tecnomecanica,
      rcPolicyContract: v.numero_poliza_rc_contractual || "",
      rcPolicyExtra: v.numero_poliza_rc_extracontractual || "",
      rcPolicyExpiry: v.fecha_vencimiento_polizas_rc || "",
      hasGps: v.tiene_gps,
      gpsProvider: v.proveedor_gps || "",
      ownerName: v.nombre_propietario || "",
      ownerTaxId: v.nit_cedula_propietario || "",
      available: v.disponible,
      autoBusy: v.ocupado_por_sistema,
      createdAt: v.fecha_creacion ? new Date(v.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  private async loadDrivers() {
    const r = await this.pool.query(`SELECT * FROM conductores ORDER BY nombre_completo`);
    return r.rows.map((d) => ({
      id: d.id,
      companyId: d.id_empresa,
      name: d.nombre_completo,
      documentType: d.tipo_documento,
      idDoc: d.numero_documento,
      phone: d.telefono,
      department: d.departamento,
      city: d.ciudad,
      address: d.direccion,
      license: d.numero_licencia,
      licenseCategory: d.categoria_licencia,
      licenseExpiry: d.fecha_vencimiento_licencia,
      psychometricExamDate: d.fecha_examen_psicosensometrico,
      psychometricExpiry: d.fecha_vencimiento_psicosensometrico,
      defensiveDrivingCourse: d.curso_conduccion_defensiva,
      emergencyContact: d.contacto_emergencia,
      emergencyPhone: d.telefono_emergencia,
      contractType: d.tipo_contrato,
      baseSalary: d.salario_base != null ? Number(d.salario_base) : 0,
      startDate: d.fecha_inicio,
      available: d.disponible,
      autoBusy: d.ocupado_por_sistema,
      hiredAt: d.fecha_contratacion ? new Date(d.fecha_contratacion).toISOString() : null
    }));
  }

  private async loadNotifications(userId: string, admin: boolean) {
    const r = admin
      ? await this.pool.query(
          `SELECT id::text, id_usuario::text AS "userId", titulo AS title, cuerpo AS body,
                  fecha_lectura AS readAt, fecha_creacion AS "createdAt"
           FROM notificaciones ORDER BY fecha_creacion DESC LIMIT 500`
        )
      : await this.pool.query(
          `SELECT id::text, id_usuario::text AS "userId", titulo AS title, cuerpo AS body,
                  fecha_lectura AS readAt, fecha_creacion AS "createdAt"
           FROM notificaciones WHERE id_usuario = $1::uuid ORDER BY fecha_creacion DESC LIMIT 200`,
          [userId]
        );
    return r.rows.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      body: n.body,
      readAt: n.readAt ? new Date(n.readAt).toISOString() : null,
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString()
    }));
  }

  private async loadEmails(admin: boolean) {
    if (!admin) return [];
    const r = await this.pool.query(
      `SELECT id::text, direccion_destino AS to, asunto AS subject, cuerpo AS body,
              fecha_envio_real AS sentAt, fecha_creacion AS "createdAt"
       FROM correos_salida ORDER BY fecha_creacion DESC LIMIT 500`
    );
    return r.rows.map((e) => ({
      id: e.id,
      to: e.to,
      subject: e.subject,
      body: e.body,
      sentAt: e.sentAt ? new Date(e.sentAt).toISOString() : null,
      createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString()
    }));
  }

  private async loadContacts(admin: boolean) {
    if (!admin) return [];
    const r = await this.pool.query(`SELECT * FROM prospectos_contacto_b2b ORDER BY fecha_creacion DESC LIMIT 500`);
    return r.rows.map((c) => ({
      id: c.id,
      contactName: c.nombre_contacto,
      companyName: c.nombre_empresa,
      nit: c.nit,
      role: c.cargo_contacto,
      phone: c.telefono,
      email: c.correo_electronico,
      serviceType: c.tipo_servicio,
      operationType: c.tipo_operacion,
      frequency: c.frecuencia_operacion,
      serviceWindow: c.ventana_inicio_servicio,
      monthlyVolumeKg: c.volumen_mensual_aprox_kg,
      message: c.mensaje,
      createdAt: c.fecha_creacion ? new Date(c.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  private async loadPositions() {
    const r = await this.pool.query(`SELECT * FROM cargos ORDER BY nombre`);
    return r.rows.map((p) => ({
      id: p.id,
      name: p.nombre,
      workerRole: p.rol_trabajador,
      baseSalary: Number(p.salario_base_mensual),
      contractTypeDefault: p.tipo_contrato_sugerido,
      legalBasis: p.fundamento_legal,
      active: p.activo,
      createdAt: p.fecha_creacion ? new Date(p.fecha_creacion).toISOString() : new Date().toISOString(),
      schedule: p.jornada_referencia,
      arlRiskLevel: p.nivel_riesgo_arl,
      integralSalary: p.salario_integral
    }));
  }

  private async loadVacancies() {
    const r = await this.pool.query(`SELECT * FROM vacantes ORDER BY fecha_creacion DESC`);
    return r.rows.map((v) => ({
      id: v.id,
      positionId: v.id_cargo,
      title: v.titulo,
      department: v.departamento,
      city: v.ciudad,
      modality: v.modalidad,
      schedule: v.jornada_vacante,
      deadline: v.fecha_limite_postulacion,
      slots: v.cupos,
      salaryOffer: Number(v.salario_oferta),
      positionTitle: v.nombre_cargo_denorm,
      workerRole: v.rol_trabajador,
      contractType: v.tipo_contrato_predeterminado,
      requirements: v.requisitos,
      status: v.estado,
      createdAt: v.fecha_creacion ? new Date(v.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  private async loadCandidates() {
    const r = await this.pool.query(`SELECT * FROM candidatos ORDER BY fecha_creacion DESC`);
    return r.rows.map((c) => ({
      id: c.id,
      vacancyId: c.id_vacante,
      name: c.nombre_completo,
      email: c.correo_electronico,
      phone: c.telefono,
      documentType: c.tipo_documento,
      idDoc: c.numero_documento,
      birthDate: c.fecha_nacimiento,
      educationLevel: c.nivel_educativo,
      department: c.departamento,
      city: c.ciudad,
      address: c.direccion,
      experienceYears: Number(c.anios_experiencia),
      salaryExpectation: Number(c.aspiracion_salarial),
      availableFrom: c.fecha_disponible_ingreso,
      vacancyTitle: c.titulo_vacante_denorm,
      pipelineStage: c.etapa_proceso,
      attachments: c.adjuntos_json,
      source: c.origen,
      hiredAt: c.fecha_contratacion,
      contractRegisteredAt: c.fecha_registro_contrato,
      createdAt: c.fecha_creacion ? new Date(c.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  private async loadInterviews() {
    const r = await this.pool.query(`SELECT * FROM entrevistas ORDER BY fecha_hora DESC`);
    return r.rows.map((i) => ({
      id: i.id,
      candidateId: i.id_candidato,
      candidateName: i.nombre_candidato_denorm,
      when: i.fecha_hora ? new Date(i.fecha_hora).toISOString() : null,
      interviewer: i.entrevistador,
      modality: i.modalidad,
      locationOrLink: i.lugar_o_enlace,
      notes: i.notas,
      createdAt: i.fecha_creacion ? new Date(i.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  private async loadContracts() {
    const r = await this.pool.query(`SELECT * FROM contratos ORDER BY fecha_creacion DESC`);
    return r.rows.map((c) => ({
      id: c.id,
      sourceTag: c.etiqueta_origen,
      personType: c.tipo_persona_origen,
      candidateId: c.id_candidato,
      candidateName: c.nombre_candidato_denorm,
      employeeId: c.id_empleado,
      employeeName: c.nombre_empleado_denorm,
      workerRole: c.rol_trabajador,
      positionId: c.id_cargo,
      positionName: c.nombre_cargo_denorm,
      salary: Number(c.salario_pactado),
      startDate: c.fecha_inicio,
      endDate: c.fecha_fin,
      companyId: c.id_empresa,
      companyName: c.nombre_empresa_denorm,
      contractType: c.tipo_contrato,
      templateKind: c.tipo_plantilla_word,
      idDocSnapshot: c.documento_identidad_snapshot,
      probationMonths: c.meses_periodo_prueba,
      schedule: c.jornada_turno,
      workplace: c.lugar_trabajo,
      terminationCause: c.causal_terminacion_prevista,
      integralSalary: c.salario_integral,
      payFrequency: c.periodicidad_pago,
      transportAllowance: c.auxilio_transporte,
      uniform: c.dotacion_uniforme,
      withholding: c.retencion_fuente,
      eps: c.eps,
      pensionFund: c.fondo_pension,
      arl: c.arl,
      licenseNumber: c.numero_licencia,
      licenseCategory: c.categoria_licencia,
      licenseExpiry: c.fecha_vencimiento_licencia,
      summaryText: c.texto_contenido_resumen,
      createdAt: c.fecha_creacion ? new Date(c.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  private async loadPayrollEmployees(empresaId: string | null, admin: boolean) {
    const q = admin
      ? `SELECT * FROM empleados_nomina ORDER BY nombre_completo`
      : `SELECT * FROM empleados_nomina WHERE id_empresa = $1::uuid ORDER BY nombre_completo`;
    const r = admin ? await this.pool.query(q) : await this.pool.query(q, [empresaId]);
    return r.rows.map((e) => this.mapEmployeeRow(e));
  }

  private mapEmployeeRow(e: Record<string, unknown>) {
    return {
      id: e.id,
      companyId: e.id_empresa,
      positionId: e.id_cargo,
      name: e.nombre_completo,
      documentType: e.tipo_documento,
      idDoc: e.numero_documento,
      birthDate: e.fecha_nacimiento,
      gender: e.genero,
      maritalStatus: e.estado_civil,
      bloodType: e.tipo_sangre,
      educationLevel: e.nivel_educativo,
      department: e.departamento,
      city: e.ciudad,
      address: e.direccion,
      phone: e.telefono,
      personalEmail: e.correo_personal,
      emergencyContact: e.contacto_emergencia,
      emergencyPhone: e.telefono_emergencia,
      emergencyRelationship: e.parentesco_emergencia,
      position: e.nombre_cargo_texto,
      contractType: e.tipo_contrato,
      contractDurationText: e.duracion_contrato_texto,
      startDate: e.fecha_ingreso,
      baseSalary: Number(e.salario_base),
      transportAllowance: e.auxilio_transporte != null ? Number(e.auxilio_transporte) : null,
      payFrequency: e.periodicidad_pago,
      costCenter: e.centro_costos,
      contributorType: e.tipo_cotizante,
      arlRiskLevel: e.nivel_riesgo_arl,
      contractTemplate: e.tipo_plantilla_contrato,
      eps: e.eps,
      pensionFund: e.fondo_pension,
      arl: e.arl,
      severanceFund: e.fondo_cesantias,
      compensationFund: e.caja_compensacion,
      bank: e.banco,
      accountType: e.tipo_cuenta_bancaria,
      accountNumber: e.numero_cuenta_bancaria,
      workerRole: e.rol_trabajador,
      licenseNumber: e.numero_licencia,
      licenseCategory: e.categoria_licencia,
      licenseExpiry: e.fecha_vencimiento_licencia,
      psychometricExamDate: e.fecha_examen_psicosensometrico,
      psychometricExpiry: e.fecha_vencimiento_psicosensometrico,
      defensiveDrivingCourse: e.curso_conduccion_defensiva,
      probationMonths: e.meses_prueba,
      contractEndDate: e.fecha_fin_contrato,
      workSchedule: e.jornada_laboral,
      avatarUrl: e.url_avatar,
      corporateEmail: e.correo_corporativo,
      createdAt: e.fecha_creacion ? new Date(e.fecha_creacion as string).toISOString() : new Date().toISOString()
    };
  }

  private async loadPayrollRuns() {
    const r = await this.pool.query(`SELECT * FROM liquidaciones_nomina ORDER BY fecha_creacion DESC`);
    return r.rows.map((row) => ({
      id: row.id,
      employeeId: row.id_empleado,
      employeeName: row.nombre_empleado,
      month: row.periodo_mes,
      gross: Number(row.devengado_total),
      ibc: Number(row.base_cotizacion_ibc),
      travelAllowance: Number(row.viaticos_periodo),
      fuelReimbursement: Number(row.reembolso_combustible),
      travelAllowanceAuto: Number(row.viaticos_automaticos),
      fuelReimbursementAuto: Number(row.reembolso_combustible_automatico),
      travelAllowanceManual: Number(row.viaticos_manuales),
      fuelReimbursementManual: Number(row.reembolso_combustible_manual),
      extras: Number(row.horas_extras_cop),
      aux: Number(row.auxilios_nomina_formulario),
      bonus: Number(row.bonificaciones_cop),
      tripCount: row.cantidad_viajes_conductor,
      interDepartmentTrips: row.viajes_interdepartamentales,
      health: Number(row.deduccion_salud),
      pension: Number(row.deduccion_pension),
      solidarity: Number(row.fondo_solidaridad_pensional),
      deductions: Number(row.total_deducciones),
      net: Number(row.neto_a_pagar),
      paid: row.liquidacion_pagada,
      paidAt: row.fecha_pago ? new Date(row.fecha_pago).toISOString() : null,
      approvedBy: row.pago_aprobado_por,
      createdAt: row.fecha_creacion ? new Date(row.fecha_creacion).toISOString() : new Date().toISOString()
    }));
  }

  private async loadFuelLogs() {
    const r = await this.pool.query(`SELECT * FROM registros_combustible ORDER BY fecha_registro DESC LIMIT 1000`);
    return r.rows.map((row) => ({
      id: row.id,
      date: row.fecha,
      vehicleId: row.id_vehiculo,
      plate: row.placa_vehiculo,
      driverId: row.id_conductor,
      driverName: row.nombre_conductor,
      tripNumber: row.numero_viaje,
      liters: Number(row.litros),
      totalCost: Number(row.costo_total),
      costPerLiter: row.costo_por_litro != null ? Number(row.costo_por_litro) : null,
      odometerKm: row.kilometraje_odometro != null ? Number(row.kilometraje_odometro) : null,
      station: row.estacion,
      paidBy: row.pagado_por,
      createdAt: row.fecha_registro ? new Date(row.fecha_registro).toISOString() : new Date().toISOString()
    }));
  }

  private async loadVehicleTechnicalLogs() {
    const r = await this.pool.query(
      `SELECT * FROM registros_mantenimiento_vehiculo ORDER BY fecha_registro DESC LIMIT 1000`
    );
    return r.rows.map((row) => ({
      id: row.id,
      date: row.fecha,
      vehicleId: row.id_vehiculo,
      plate: row.placa_vehiculo,
      interventionType: row.tipo_intervencion,
      description: row.descripcion,
      cost: Number(row.costo),
      downtimeHours: Number(row.horas_inactividad),
      followUpStatus: row.estado_seguimiento,
      createdAt: row.fecha_registro ? new Date(row.fecha_registro).toISOString() : new Date().toISOString()
    }));
  }

  private async loadHrAbsences() {
    const r = await this.pool.query(`SELECT * FROM ausencias_laborales ORDER BY fecha_registro DESC`);
    return r.rows.map((row) => ({
      id: row.id,
      employeeId: row.id_empleado,
      employeeName: row.nombre_empleado,
      type: row.tipo_ausencia,
      startDate: row.fecha_inicio,
      endDate: row.fecha_fin,
      calendarDays: row.dias_calendario,
      supportNumber: row.numero_soporte,
      epsEntity: row.entidad_eps,
      notes: row.observaciones,
      approvedBy: row.aprobado_por,
      approvedAt: row.fecha_aprobacion ? new Date(row.fecha_aprobacion).toISOString() : null,
      createdAt: row.fecha_registro ? new Date(row.fecha_registro).toISOString() : new Date().toISOString()
    }));
  }

  private async loadSstCompliance() {
    const r = await this.pool.query(`SELECT * FROM registros_cumplimiento_sst ORDER BY fecha_creacion DESC`);
    return r.rows.map((row) => ({
      id: row.id,
      employeeId: row.id_empleado,
      employeeName: row.nombre_empleado,
      recordType: row.tipo_registro,
      provider: row.proveedor_entidad,
      expiryDate: row.fecha_vencimiento_control,
      status: row.estado,
      documentCode: row.codigo_documento,
      notes: row.observaciones,
      createdAt: row.fecha_creacion ? new Date(row.fecha_creacion).toISOString() : new Date().toISOString(),
      createdBy: row.creado_por
    }));
  }

  private async loadApprovals(admin: boolean, userId: string, empresaId: string | null) {
    const base = `SELECT id::text, tipo_solicitud AS type, titulo AS title, datos_json AS payload,
       estado::text AS status, id_usuario_solicitante::text AS "requestedByUserId",
       nombre_solicitante AS "requestedByName", fecha_solicitud AS "requestedAt",
       fecha_revision AS "reviewedAt", revisado_por AS "reviewedBy", motivo_rechazo AS "rejectionReason"
       FROM solicitudes_autorizacion`;
    const r = admin
      ? await this.pool.query(base + ` ORDER BY fecha_solicitud DESC LIMIT 500`)
      : await this.pool.query(
          base +
            ` WHERE id_usuario_solicitante = $1::uuid OR ($2::uuid IS NOT NULL AND datos_json->>'companyId' = $2::text)
              ORDER BY fecha_solicitud DESC LIMIT 200`,
          [userId, empresaId]
        );
    return r.rows.map((a) => ({
      ...a,
      requestedAt: a.requestedAt ? new Date(a.requestedAt).toISOString() : null,
      reviewedAt: a.reviewedAt ? new Date(a.reviewedAt).toISOString() : null,
      payload: a.payload || {}
    }));
  }

  /* ─── Sync (upsert por id) ─── */

  private async syncUsers(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException("Formato invalido");
    const admin = this.isAdmin(role);
    for (const u of data) {
      if (!u?.id) continue;
      if (!admin && String(u.id) !== userId) throw new ForbiddenException();
      await c.query(
        `UPDATE usuarios SET
          nombre_completo = COALESCE($2, nombre_completo),
          primer_nombre = COALESCE($3, primer_nombre),
          segundo_nombre = COALESCE($4, segundo_nombre),
          primer_apellido = COALESCE($5, primer_apellido),
          segundo_apellido = COALESCE($6, segundo_apellido),
          telefono = COALESCE($7, telefono),
          departamento = COALESCE($8, departamento),
          ciudad = COALESCE($9, ciudad),
          direccion = COALESCE($10, direccion),
          contacto_emergencia = COALESCE($11, contacto_emergencia),
          telefono_emergencia = COALESCE($12, telefono_emergencia),
          parentesco_emergencia = COALESCE($13, parentesco_emergencia),
          url_avatar = COALESCE($14, url_avatar),
          cargo_registro = COALESCE($15, cargo_registro),
          area_trabajo = COALESCE($16, area_trabajo),
          checklist_registro_json = COALESCE($17::jsonb, checklist_registro_json)
        WHERE id = $1::uuid`,
        [
          u.id,
          u.name ?? null,
          u.firstName ?? null,
          u.middleName ?? null,
          u.lastName ?? null,
          u.secondLastName ?? null,
          u.phone ?? null,
          u.department ?? null,
          u.city ?? null,
          u.address ?? null,
          u.emergencyContact ?? null,
          u.emergencyPhone ?? null,
          u.emergencyRelationship ?? null,
          u.avatarUrl ?? null,
          u.position ?? null,
          u.workArea ?? null,
          u.profileQualityChecklist ? JSON.stringify(u.profileQualityChecklist) : null
        ]
      );
      if (admin && Array.isArray(u.permissions)) {
        await c.query(`DELETE FROM permisos_usuario WHERE id_usuario = $1::uuid`, [u.id]);
        for (const perm of u.permissions) {
          await c.query(
            `INSERT INTO permisos_usuario (id_usuario, permiso) VALUES ($1::uuid, $2)
             ON CONFLICT (id_usuario, permiso) DO NOTHING`,
            [u.id, String(perm)]
          );
        }
      }
      if (admin && u.accountStatus) {
        await c.query(`UPDATE usuarios SET estado_cuenta = $2::estado_cuenta_usuario WHERE id = $1::uuid`, [
          u.id,
          u.accountStatus
        ]);
      }
      if (admin && u.companyId !== undefined) {
        await c.query(`UPDATE usuarios SET id_empresa = $2::uuid WHERE id = $1::uuid`, [u.id, u.companyId || null]);
      }
      if (admin && u.role) {
        await c.query(`UPDATE usuarios SET rol = $2::rol_usuario WHERE id = $1::uuid`, [u.id, String(u.role).toLowerCase()]);
      }
    }
  }

  private async syncCompanies(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const row of data) {
      if (!row?.id) continue;
      await c.query(
        `INSERT INTO empresas (id, nombre, nit, telefono)
         VALUES ($1::uuid, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, nit = EXCLUDED.nit, telefono = EXCLUDED.telefono`,
        [row.id, row.name, row.nit, row.phone || null]
      );
    }
  }

  private async syncCounters(c: PoolClient, data: unknown) {
    if (!data || typeof data !== "object") throw new ForbiddenException();
    for (const [prefijo, val] of Object.entries(data as Record<string, number>)) {
      await c.query(
        `INSERT INTO contadores_secuencia (prefijo, ultimo_valor) VALUES ($1, $2)
         ON CONFLICT (prefijo) DO UPDATE SET ultimo_valor = EXCLUDED.ultimo_valor`,
        [prefijo, Math.max(0, Math.floor(Number(val) || 0))]
      );
    }
  }

  private async syncContacts(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const row of data) {
      if (!row?.id) continue;
      await c.query(
        `INSERT INTO prospectos_contacto_b2b (
          id, nombre_contacto, nombre_empresa, nit, cargo_contacto, telefono, correo_electronico,
          tipo_servicio, tipo_operacion, frecuencia_operacion, ventana_inicio_servicio, volumen_mensual_aprox_kg, mensaje
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
        ON CONFLICT (id) DO UPDATE SET
          nombre_contacto = EXCLUDED.nombre_contacto,
          nombre_empresa = EXCLUDED.nombre_empresa,
          nit = EXCLUDED.nit,
          mensaje = EXCLUDED.mensaje`,
        [
          row.id,
          row.contactName,
          row.companyName,
          row.nit,
          row.role,
          row.phone,
          row.email,
          row.serviceType,
          row.operationType,
          row.frequency,
          row.serviceWindow,
          row.monthlyVolumeKg ?? 0,
          row.message
        ]
      );
    }
  }

  private async syncRequests(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const admin = this.isAdmin(role);
    const transport = this.isTransportOps(role) || admin;
    const empresaId = await this.getUserCompany(userId);
    for (const req of data) {
      if (!req?.id) continue;
      const ownerOk =
        admin ||
        transport ||
        String(req.clientUserId) === userId ||
        (empresaId && String(req.clientCompanyId || "") === String(empresaId));
      if (!ownerOk) throw new ForbiddenException();

      await c.query(
        `INSERT INTO solicitudes_transporte (
          id, numero_solicitud, id_usuario_solicitante, id_empresa_cliente, nombre_cliente, nombre_quien_solicita,
          departamento_origen, ciudad_origen, direccion_origen, departamento_destino, ciudad_destino, direccion_destino,
          fecha_hora_recogida, fecha_hora_entrega_estimada, tipo_vehiculo_solicitado, descripcion_carga, tipo_servicio,
          numero_cajas, peso_kg, nombre_contacto_en_sitio, telefono_contacto_en_sitio, observaciones,
          adjuntos_nombres_json, estado, valor_tarifa_viaje, total_cargos_standby, eventos_standby_json,
          motivo_rechazo, fecha_aprobacion, aprobado_por, fecha_entrega_efectiva, fecha_cierre
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, $10, $11, $12, $13::timestamptz, $14::timestamptz,
          $15, $16, $17, $18, $19, $20, $21, $22, $23::jsonb, $24::estado_solicitud_transporte, $25, $26, $27::jsonb,
          $28, $29::timestamptz, $30, $31::timestamptz, $32::timestamptz
        )
        ON CONFLICT (id) DO UPDATE SET
          departamento_origen = EXCLUDED.departamento_origen,
          ciudad_origen = EXCLUDED.ciudad_origen,
          direccion_origen = EXCLUDED.direccion_origen,
          departamento_destino = EXCLUDED.departamento_destino,
          ciudad_destino = EXCLUDED.ciudad_destino,
          direccion_destino = EXCLUDED.direccion_destino,
          fecha_hora_recogida = EXCLUDED.fecha_hora_recogida,
          fecha_hora_entrega_estimada = EXCLUDED.fecha_hora_entrega_estimada,
          estado = EXCLUDED.estado,
          valor_tarifa_viaje = EXCLUDED.valor_tarifa_viaje,
          total_cargos_standby = EXCLUDED.total_cargos_standby,
          eventos_standby_json = EXCLUDED.eventos_standby_json,
          motivo_rechazo = EXCLUDED.motivo_rechazo,
          fecha_aprobacion = EXCLUDED.fecha_aprobacion,
          aprobado_por = EXCLUDED.aprobado_por,
          fecha_entrega_efectiva = EXCLUDED.fecha_entrega_efectiva,
          fecha_cierre = EXCLUDED.fecha_cierre`,
        [
          req.id,
          req.requestNumber,
          req.clientUserId,
          req.clientCompanyId || null,
          req.clientName,
          req.requestedByName,
          req.originDepartment,
          req.originCity,
          req.originAddress,
          req.destinationDepartment,
          req.destinationCity,
          req.destinationAddress,
          req.pickupAt,
          req.etaDelivery,
          req.vehicleType,
          req.cargoDescription,
          req.serviceType,
          Number(req.boxesCount) || 0,
          Number(req.weightKg) || 0,
          req.contactName,
          req.contactPhone,
          req.observations || null,
          JSON.stringify(Array.isArray(req.attachments) ? req.attachments : []),
          req.status,
          Number(req.tripValue) || 0,
          Number(req.standbyChargeTotal) || 0,
          JSON.stringify(Array.isArray(req.standbyEvents) ? req.standbyEvents : []),
          req.rejectionReason || null,
          req.approvedAt || null,
          req.approvedBy || null,
          req.deliveredAt || null,
          req.closedAt || null
        ]
      );

      if (req.trip && req.trip.tripNumber) {
        const t = req.trip;
        await c.query(
          `INSERT INTO viajes_transporte (
            id, id_solicitud, numero_viaje, id_vehiculo, id_conductor, placa_vehiculo, tipo_vehiculo_asignado,
            nombre_conductor, telefono_conductor, descripcion_ruta, fecha_hora_recogida_programada, fecha_hora_entrega_programada,
            asignado_por, fecha_hora_asignacion, estado_operativo_en_vivo, datos_factura_json
          ) VALUES (
            COALESCE($1::uuid, gen_random_uuid()), $2::uuid, $3, $4::uuid, $5::uuid, $6, $7, $8, $9, $10,
            $11::timestamptz, $12::timestamptz, $13, $14::timestamptz, $15, $16::jsonb
          )
          ON CONFLICT (id_solicitud) DO UPDATE SET
            numero_viaje = EXCLUDED.numero_viaje,
            id_vehiculo = EXCLUDED.id_vehiculo,
            id_conductor = EXCLUDED.id_conductor,
            placa_vehiculo = EXCLUDED.placa_vehiculo,
            estado_operativo_en_vivo = EXCLUDED.estado_operativo_en_vivo,
            datos_factura_json = EXCLUDED.datos_factura_json`,
          [
            t.id || null,
            req.id,
            t.tripNumber,
            t.vehicleId,
            t.driverId,
            t.vehiclePlate,
            t.vehicleType || null,
            t.driverName,
            t.driverPhone || null,
            t.route || null,
            t.etaPickup || req.pickupAt,
            t.etaDelivery || req.etaDelivery,
            t.assignedBy || null,
            t.assignedAt || null,
            t.realtimeStatus || null,
            t.invoice ? JSON.stringify(t.invoice) : null
          ]
        );
      }
    }
  }

  private async syncVehicles(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const v of data) {
      if (!v?.id || !v.plate) continue;
      await c.query(
        `INSERT INTO vehiculos (
          id, placa, marca, linea_modelo, anio_modelo, color, tipo_vehiculo, capacidad_kg, refrigerado_termoking,
          tipo_carroceria, tipo_combustible, configuracion_ejes, numero_motor, numero_chasis_vin, numero_tarjeta_propiedad,
          fecha_expedicion_soat, fecha_vencimiento_soat, fecha_expedicion_tecnomecanica, fecha_vencimiento_tecnomecanica,
          numero_poliza_rc_contractual, numero_poliza_rc_extracontractual, fecha_vencimiento_polizas_rc,
          tiene_gps, proveedor_gps, nombre_propietario, nit_cedula_propietario, disponible, ocupado_por_sistema
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::date, $17::date, $18::date, $19::date,
          $20, $21, $22::date, $23, $24, $25, $26, $27, $28
        )
        ON CONFLICT (id) DO UPDATE SET
          placa = EXCLUDED.placa,
          marca = EXCLUDED.marca,
          disponible = EXCLUDED.disponible`,
        [
          v.id,
          String(v.plate).toUpperCase(),
          v.brand || "N/D",
          v.model || "N/D",
          Number(v.year) || 2020,
          v.color || "N/D",
          v.type || "Camion",
          Number(v.capacityKg) || 1,
          Boolean(v.refrigerated),
          v.bodyType || "Furgon",
          v.fuelType || "Diesel",
          v.axleConfig || "4x2",
          v.engineNumber || "N/D",
          (v.vin || "XXXXXXXXXXX").slice(0, 17),
          v.ownershipCard || "N/D",
          v.soatExpeditionDate || new Date().toISOString().slice(0, 10),
          v.soatExpiryDate || new Date().toISOString().slice(0, 10),
          v.techInspectionExpeditionDate || new Date().toISOString().slice(0, 10),
          v.techInspectionExpiryDate || new Date().toISOString().slice(0, 10),
          v.rcPolicyContract || null,
          v.rcPolicyExtra || null,
          v.rcPolicyExpiry || null,
          Boolean(v.hasGps),
          v.gpsProvider || null,
          v.ownerName || null,
          v.ownerTaxId || null,
          v.available !== false,
          Boolean(v.autoBusy)
        ]
      );
    }
  }

  private async syncDrivers(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const d of data) {
      if (!d?.id) continue;
      await c.query(
        `INSERT INTO conductores (
          id, id_empresa, nombre_completo, tipo_documento, numero_documento, telefono, departamento, ciudad, direccion,
          numero_licencia, categoria_licencia, fecha_vencimiento_licencia, disponible, ocupado_por_sistema,
          tipo_contrato, salario_base, fecha_inicio
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::date, $13, $14, $15, $16, $17::date
        )
        ON CONFLICT (id) DO UPDATE SET
          nombre_completo = EXCLUDED.nombre_completo,
          telefono = EXCLUDED.telefono,
          disponible = EXCLUDED.disponible`,
        [
          d.id,
          d.companyId || null,
          d.name || "Conductor",
          d.documentType || "CC",
          d.idDoc || "0000000",
          d.phone || "3000000000",
          d.department || null,
          d.city || "Bogota",
          d.address || "N/D",
          d.license || "N",
          d.licenseCategory || "C2",
          d.licenseExpiry || new Date().toISOString().slice(0, 10),
          d.available !== false,
          Boolean(d.autoBusy),
          d.contractType || null,
          d.baseSalary != null ? Number(d.baseSalary) : null,
          d.startDate || null
        ]
      );
    }
  }

  private async syncNotifications(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const admin = this.isAdmin(role);
    for (const n of data) {
      if (!n?.id) continue;
      if (!admin && String(n.userId) !== userId) throw new ForbiddenException();
      await c.query(
        `INSERT INTO notificaciones (id, id_usuario, titulo, cuerpo, fecha_lectura)
         VALUES ($1::uuid, $2::uuid, $3, $4, $5::timestamptz)
         ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, cuerpo = EXCLUDED.cuerpo, fecha_lectura = EXCLUDED.fecha_lectura`,
        [n.id, n.userId, n.title, n.body, n.readAt || null]
      );
    }
  }

  private async syncEmails(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const e of data) {
      if (!e?.id) continue;
      await c.query(
        `INSERT INTO correos_salida (id, direccion_destino, asunto, cuerpo, fecha_envio_real)
         VALUES ($1::uuid, $2, $3, $4, $5::timestamptz)
         ON CONFLICT (id) DO UPDATE SET asunto = EXCLUDED.asunto, cuerpo = EXCLUDED.cuerpo`,
        [e.id, e.to, e.subject, e.body, e.sentAt || null]
      );
    }
  }

  private async syncPayrollEmployees(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const e of data) {
      if (!e?.id || !e.companyId) continue;
      await c.query(
        `INSERT INTO empleados_nomina (
          id, id_empresa, id_cargo, nombre_completo, tipo_documento, numero_documento, ciudad, direccion, telefono,
          contacto_emergencia, telefono_emergencia, parentesco_emergencia, nombre_cargo_texto, tipo_contrato,
          fecha_ingreso, salario_base, banco, numero_cuenta_bancaria, eps, fondo_pension, arl, rol_trabajador
        ) VALUES (
          $1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::date, $16, $17, $18, $19, $20, $21, $22
        )
        ON CONFLICT (id) DO UPDATE SET nombre_completo = EXCLUDED.nombre_completo, salario_base = EXCLUDED.salario_base`,
        [
          e.id,
          e.companyId,
          e.positionId || null,
          e.name,
          e.documentType || "CC",
          e.idDoc || "0",
          e.city || "Bogota",
          e.address || "N/D",
          e.phone || "3000000000",
          e.emergencyContact || "N/D",
          e.emergencyPhone || "3000000000",
          e.emergencyRelationship || "familiar",
          e.position || "Empleado",
          e.contractType || "Indefinido",
          e.startDate || new Date().toISOString().slice(0, 10),
          Number(e.baseSalary) || 0,
          e.bank || "Bancolombia",
          e.accountNumber || "0",
          e.eps || "Sura",
          e.pensionFund || "Porvenir",
          e.arl || "Sura",
          String(e.workerRole || "empleado").toLowerCase()
        ]
      );
    }
  }

  private async syncPayrollRuns(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const run of data) {
      if (!run?.id || !run.employeeId) continue;
      await c.query(
        `INSERT INTO liquidaciones_nomina (
          id, id_empleado, nombre_empleado, periodo_mes, devengado_total, base_cotizacion_ibc,
          viaticos_periodo, reembolso_combustible, viaticos_automaticos, reembolso_combustible_automatico,
          viaticos_manuales, reembolso_combustible_manual, horas_extras_cop, auxilios_nomina_formulario, bonificaciones_cop,
          cantidad_viajes_conductor, viajes_interdepartamentales, deduccion_salud, deduccion_pension, fondo_solidaridad_pensional,
          total_deducciones, neto_a_pagar, liquidacion_pagada, fecha_pago, pago_aprobado_por
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24::timestamptz, $25
        )
        ON CONFLICT (id) DO UPDATE SET
          liquidacion_pagada = EXCLUDED.liquidacion_pagada,
          neto_a_pagar = EXCLUDED.neto_a_pagar`,
        [
          run.id,
          run.employeeId,
          run.employeeName,
          run.month,
          Number(run.gross),
          Number(run.ibc),
          Number(run.travelAllowance),
          Number(run.fuelReimbursement),
          Number(run.travelAllowanceAuto ?? 0),
          Number(run.fuelReimbursementAuto ?? 0),
          Number(run.travelAllowanceManual ?? 0),
          Number(run.fuelReimbursementManual ?? 0),
          Number(run.extras ?? 0),
          Number(run.aux ?? 0),
          Number(run.bonus ?? 0),
          Number(run.tripCount ?? 0),
          Number(run.interDepartmentTrips ?? 0),
          Number(run.health),
          Number(run.pension),
          Number(run.solidarity ?? 0),
          Number(run.deductions),
          Number(run.net),
          Boolean(run.paid),
          run.paidAt || null,
          run.approvedBy || null
        ]
      );
    }
  }

  private async syncFuelLogs(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const row of data) {
      if (!row?.id) continue;
      await c.query(
        `INSERT INTO registros_combustible (
          id, fecha, id_vehiculo, placa_vehiculo, id_conductor, nombre_conductor, numero_viaje, litros, costo_total,
          costo_por_litro, kilometraje_odometro, estacion, pagado_por
        ) VALUES ($1::uuid, $2::date, $3::uuid, $4, $5::uuid, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING`,
        [
          row.id,
          row.date,
          row.vehicleId,
          row.plate,
          row.driverId,
          row.driverName,
          row.tripNumber || null,
          Number(row.liters),
          Number(row.totalCost),
          row.costPerLiter != null ? Number(row.costPerLiter) : null,
          row.odometerKm != null ? Number(row.odometerKm) : null,
          row.station || null,
          row.paidBy || "empresa"
        ]
      );
    }
  }

  private async syncVehicleTechnicalLogs(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const row of data) {
      if (!row?.id) continue;
      await c.query(
        `INSERT INTO registros_mantenimiento_vehiculo (
          id, fecha, id_vehiculo, placa_vehiculo, tipo_intervencion, descripcion, costo, horas_inactividad, estado_seguimiento
        ) VALUES ($1::uuid, $2::date, $3::uuid, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING`,
        [
          row.id,
          row.date,
          row.vehicleId,
          row.plate,
          row.interventionType || "preventivo",
          row.description || "",
          Number(row.cost ?? 0),
          Number(row.downtimeHours ?? 0),
          row.followUpStatus || "Pendiente"
        ]
      );
    }
  }

  private async syncTravelAllowanceRules(c: PoolClient, data: unknown) {
    const obj = data as { interDepartmentTripAmount?: number };
    const v = Number(obj?.interDepartmentTripAmount ?? 85000);
    await c.query(`UPDATE reglas_viatico_interdepartamental SET valor_viaje_interdepartamental_cop = $1 WHERE id = 1`, [v]);
  }

  private async syncHrKeys(c: PoolClient, key: PortalSyncKey, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    if (key === "positions") {
      for (const p of data) {
        if (!p?.id) continue;
        await c.query(
          `INSERT INTO cargos (id, nombre, rol_trabajador, salario_base_mensual, tipo_contrato_sugerido, fundamento_legal, activo)
           VALUES ($1::uuid, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, salario_base_mensual = EXCLUDED.salario_base_mensual`,
          [
            p.id,
            p.name,
            p.workerRole || "empleado",
            Number(p.baseSalary) || 0,
            p.contractTypeDefault || "Indefinido",
            p.legalBasis || "",
            p.active !== false
          ]
        );
      }
      return;
    }
    if (key === "vacancies") {
      for (const v of data) {
        if (!v?.id || !v.positionId) continue;
        await c.query(
          `INSERT INTO vacantes (
            id, id_cargo, titulo, ciudad, fecha_limite_postulacion, cupos, salario_oferta, estado
          ) VALUES ($1::uuid, $2::uuid, $3, $4, $5::date, $6, $7, $8::estado_vacante)
          ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, estado = EXCLUDED.estado`,
          [
            v.id,
            v.positionId,
            v.title,
            v.city || "Bogota",
            v.deadline || new Date().toISOString().slice(0, 10),
            Number(v.slots) || 1,
            Number(v.salaryOffer) || 0,
            v.status || "Publicada"
          ]
        );
      }
      return;
    }
    if (key === "candidates") {
      for (const x of data) {
        if (!x?.id || !x.vacancyId) continue;
        await c.query(
          `INSERT INTO candidatos (
            id, id_vacante, nombre_completo, correo_electronico, telefono, tipo_documento, numero_documento,
            ciudad, anios_experiencia, aspiracion_salarial, fecha_disponible_ingreso, etapa_proceso, adjuntos_json
          ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11::date, $12, $13::jsonb)
          ON CONFLICT (id) DO UPDATE SET etapa_proceso = EXCLUDED.etapa_proceso`,
          [
            x.id,
            x.vacancyId,
            x.name,
            x.email,
            x.phone,
            x.documentType,
            x.idDoc,
            x.city || "Bogota",
            Number(x.experienceYears) || 0,
            Number(x.salaryExpectation) || 0,
            x.availableFrom || new Date().toISOString().slice(0, 10),
            x.pipelineStage || "Recibido",
            JSON.stringify(x.attachments || [])
          ]
        );
      }
      return;
    }
    if (key === "interviews") {
      for (const i of data) {
        if (!i?.id || !i.candidateId) continue;
        await c.query(
          `INSERT INTO entrevistas (id, id_candidato, nombre_candidato_denorm, fecha_hora, entrevistador, modalidad, lugar_o_enlace, notas)
           VALUES ($1::uuid, $2::uuid, $3, $4::timestamptz, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            i.id,
            i.candidateId,
            i.candidateName || "",
            i.when || new Date().toISOString(),
            i.interviewer || "RH",
            i.modality || null,
            i.locationOrLink || null,
            i.notes || null
          ]
        );
      }
      return;
    }
    if (key === "contracts") {
      for (const x of data) {
        if (!x?.id || !x.positionId || !x.companyId) continue;
        await c.query(
          `INSERT INTO contratos (
            id, tipo_persona_origen, id_candidato, nombre_candidato_denorm, rol_trabajador, id_cargo, nombre_cargo_denorm,
            salario_pactado, fecha_inicio, id_empresa, nombre_empresa_denorm, tipo_contrato, tipo_plantilla_word,
            eps, fondo_pension, arl, jornada_turno
          ) VALUES (
            $1::uuid, $2, $3::uuid, $4, $5, $6::uuid, $7, $8, $9::date, $10::uuid, $11, $12, $13, $14, $15, $16, $17
          )
          ON CONFLICT (id) DO NOTHING`,
          [
            x.id,
            x.personType || "Natural",
            x.candidateId || null,
            x.candidateName || "",
            String(x.workerRole || "empleado").toLowerCase(),
            x.positionId,
            x.positionName || "",
            Number(x.salary) || 0,
            x.startDate || new Date().toISOString().slice(0, 10),
            x.companyId,
            x.companyName || "",
            x.contractType || "Indefinido",
            x.templateKind || "basico",
            x.eps || "Sura",
            x.pensionFund || "Porvenir",
            x.arl || "Sura",
            x.schedule || "Diurna"
          ]
        );
      }
    }
  }

  private async syncHrAbsences(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const row of data) {
      if (!row?.id || !row.employeeId) continue;
      await c.query(
        `INSERT INTO ausencias_laborales (
          id, id_empleado, nombre_empleado, tipo_ausencia, fecha_inicio, fecha_fin, dias_calendario, observaciones
        ) VALUES ($1::uuid, $2::uuid, $3, $4, $5::date, $6::date, $7, $8)
        ON CONFLICT (id) DO NOTHING`,
        [
          row.id,
          row.employeeId,
          row.employeeName,
          row.type,
          row.startDate,
          row.endDate,
          Number(row.calendarDays) || 1,
          row.notes || null
        ]
      );
    }
  }

  private async syncSst(c: PoolClient, data: unknown) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    for (const row of data) {
      if (!row?.id || !row.employeeId) continue;
      await c.query(
        `INSERT INTO registros_cumplimiento_sst (
          id, id_empleado, nombre_empleado, tipo_registro, proveedor_entidad, fecha_vencimiento_control, estado, codigo_documento, observaciones, creado_por
        ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::date, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING`,
        [
          row.id,
          row.employeeId,
          row.employeeName,
          row.recordType,
          row.provider,
          row.expiryDate,
          row.status || "Pendiente",
          row.documentCode || null,
          row.notes || null,
          row.createdBy || "Portal"
        ]
      );
    }
  }

  private async syncTripRouteRates(c: PoolClient, data: unknown) {
    if (!data || typeof data !== "object") throw new ForbiddenException();
    for (const [keyStr, val] of Object.entries(data as Record<string, number>)) {
      const parts = String(keyStr).split("->");
      if (parts.length !== 2) continue;
      const [oa, da] = parts;
      const [od, oc] = String(oa).split("|");
      const [dd, dc] = String(da).split("|");
      await c.query(
        `INSERT INTO tarifas_trayecto (
          departamento_origen, ciudad_origen, departamento_destino, ciudad_destino, valor_tarifa_cop, activo
        ) VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (departamento_origen, ciudad_origen, departamento_destino, ciudad_destino)
        DO UPDATE SET valor_tarifa_cop = EXCLUDED.valor_tarifa_cop`,
        [od || "", oc || "", dd || "", dc || "", Number(val) || 0]
      );
    }
  }

  private async syncApprovals(c: PoolClient, data: unknown, userId: string, role: JwtRole) {
    if (!Array.isArray(data)) throw new ForbiddenException();
    const admin = this.isAdmin(role);
    for (const a of data) {
      if (!a?.id) continue;
      if (!admin && String(a.requestedByUserId) !== userId) throw new ForbiddenException();
      await c.query(
        `INSERT INTO solicitudes_autorizacion (
          id, tipo_solicitud, titulo, datos_json, estado, id_usuario_solicitante, nombre_solicitante,
          fecha_revision, revisado_por, motivo_rechazo
        ) VALUES ($1::uuid, $2, $3, $4::jsonb, $5::estado_aprobacion, $6::uuid, $7, $8::timestamptz, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          estado = EXCLUDED.estado,
          fecha_revision = EXCLUDED.fecha_revision,
          revisado_por = EXCLUDED.revisado_por,
          motivo_rechazo = EXCLUDED.motivo_rechazo`,
        [
          a.id,
          a.type,
          a.title,
          JSON.stringify(a.payload || {}),
          a.status || "pendiente",
          a.requestedByUserId || userId,
          a.requestedByName || "",
          a.reviewedAt || null,
          a.reviewedBy || null,
          a.rejectionReason || null
        ]
      );
    }
  }
}
