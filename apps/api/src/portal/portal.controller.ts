import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ApprovePendingUserDto } from "./dto/approve-pending-user.dto";
import { AdminUserDeleteDto } from "./dto/admin-user-delete.dto";
import { AdminCompanyDeleteDto } from "./dto/admin-company-delete.dto";
import { AdminRequestDeleteDto } from "./dto/admin-request-delete.dto";
import { ClientRequestDeleteDto } from "./dto/client-request-delete.dto";
import { AdminVehicleDeleteDto } from "./dto/admin-vehicle-delete.dto";
import { AdminDriverDeleteDto } from "./dto/admin-driver-delete.dto";
import { AdminClearTripDto } from "./dto/admin-clear-trip.dto";
import { AdminEmployeeDeleteDto } from "./dto/admin-employee-delete.dto";
import { AdminClearUserSessionsDto } from "./dto/admin-clear-user-sessions.dto";
import { AdminUserCredentialsDto } from "./dto/admin-user-credentials.dto";
import { AdminUserStatusDto } from "./dto/admin-user-status.dto";
import { SyncKeyDto } from "./dto/sync-key.dto";
import { DispatchNotificationDto } from "./dto/dispatch-notification.dto";
import { NotificationPreferencesDto } from "./dto/notification-preferences.dto";
import { TransportScheduleBusyDto } from "./dto/transport-schedule-busy.dto";
import { CreateFleetFuelLogDto } from "./dto/create-fleet-fuel-log.dto";
import { CreateFleetMaintenanceLogDto } from "./dto/create-fleet-maintenance-log.dto";
import { DeleteLaborSystemParametersDto } from "./dto/delete-labor-system-parameters.dto";
import { UpsertLaborSystemParametersDto } from "./dto/upsert-labor-system-parameters.dto";
import { PortalService } from "./portal.service";

type ReqUser = { userId: string; email: string; role: string };

@UseGuards(JwtAuthGuard)
@Controller("portal")
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  @Get("bootstrap")
  bootstrap(@Req() req: { user: ReqUser }) {
    return this.portal.bootstrap(req.user.userId, req.user.role);
  }

  /** Hoja de vida del candidato (R2 prefirmado / público o base64 inline). Rol RRHH. */
  @Get("candidates/:id/cv-download")
  candidateCvDownload(@Req() req: { user: ReqUser }, @Param("id") candidateId: string) {
    return this.portal.getCandidateCvDownload(req.user.userId, req.user.role, candidateId);
  }

  /** Descarga forzada del CV (binario con Content-Disposition: attachment). Rol RRHH. */
  @Get("candidates/:id/cv-file")
  async candidateCvFile(
    @Req() req: { user: ReqUser },
    @Param("id") candidateId: string,
    @Res() res: Response
  ) {
    const { buffer, mime, fileName } = await this.portal.getCandidateCvFile(
      req.user.userId,
      req.user.role,
      candidateId
    );
    const safeName = String(fileName || "hoja-de-vida").replace(/[\\/]/g, "_");
    res
      .setHeader("Content-Type", mime || "application/octet-stream")
      .setHeader("Content-Disposition", `attachment; filename="${safeName}"`)
      .setHeader("Cache-Control", "private, no-store")
      .send(buffer);
  }

  /**
   * Perfil propio del usuario autenticado: payload mínimo para que el portal pueda
   * pintar Mi perfil aunque /portal/bootstrap falle. Necesario porque el JWT solo
   * trae id+email+rol, sin nombre ni datos del registro.
   */
  @Get("me")
  me(@Req() req: { user: ReqUser }) {
    return this.portal.getOwnProfile(req.user.userId);
  }

  /** Solo admin JWT: usuarios con alta pendiente (bandeja Autorizaciones si bootstrap falla o va incompleto). */
  @Get("pending-user-registrations")
  pendingUserRegistrations(@Req() req: { user: ReqUser }) {
    return this.portal.getPendingUserRegistrations(req.user.userId, req.user.role);
  }

  /** Prospectos del formulario B2B público (tabla prospectos_contacto_b2b). Admin o permiso contact_b2b_view. */
  @Get("contact-b2b-prospects")
  contactB2bProspects(@Req() req: { user: ReqUser }) {
    return this.portal.getContactB2bProspects(req.user.userId, req.user.role);
  }

  /** Administración: sesiones registradas por usuario (tabla sesiones_usuario). */
  @Get("user-sessions")
  userSessions(@Req() req: { user: ReqUser }) {
    return this.portal.getUserSessions(req.user.userId, req.user.role);
  }

  @Post("notification-preferences")
  notificationPreferences(@Req() req: { user: ReqUser }, @Body() dto: NotificationPreferencesDto) {
    return this.portal.updateNotificationPreferences(req.user.userId, dto);
  }

  @Post("labor-system-parameters")
  laborSystemParameters(@Req() req: { user: ReqUser }, @Body() dto: UpsertLaborSystemParametersDto) {
    return this.portal.upsertLaborSystemParameters(req.user.userId, req.user.role, dto);
  }

  @Post("labor-system-parameters/delete")
  deleteLaborSystemParameters(@Req() req: { user: ReqUser }, @Body() dto: DeleteLaborSystemParametersDto) {
    return this.portal.deleteLaborSystemParameters(req.user.userId, req.user.role, dto.year);
  }

  @Post("sync-key")
  syncKey(@Req() req: { user: ReqUser }, @Body() dto: SyncKeyDto) {
    return this.portal.syncKey(dto.key, dto.data, req.user.userId, req.user.role, dto.deletedIds);
  }

  /** Historial flota: alta en registros_combustible (PostgreSQL). */
  @Post("fleet/fuel-logs")
  createFleetFuelLog(@Req() req: { user: ReqUser }, @Body() dto: CreateFleetFuelLogDto) {
    return this.portal.createFleetFuelLog(req.user.userId, req.user.role, dto);
  }

  /** Historial flota: alta en registros_mantenimiento_vehiculo (PostgreSQL). */
  @Post("fleet/maintenance-logs")
  createFleetMaintenanceLog(@Req() req: { user: ReqUser }, @Body() dto: CreateFleetMaintenanceLogDto) {
    return this.portal.createFleetMaintenanceLog(req.user.userId, req.user.role, dto);
  }

  /**
   * Una sola consulta: vehículos y conductores con viaje activo que se cruza con la franja indicada.
   * Para marcar «ocupado» en asignación sin recorrer toda la flota en el cliente.
   */
  @Post("transport-schedule-busy")
  transportScheduleBusy(@Req() req: { user: ReqUser }, @Body() dto: TransportScheduleBusyDto) {
    return this.portal.getTransportScheduleBusy(req.user.userId, req.user.role, dto);
  }

  /** Crear notificaciones in-app para otros usuarios (p. ej. avisar a admins). */
  @Post("notifications/dispatch")
  dispatchNotification(@Req() req: { user: ReqUser }, @Body() dto: DispatchNotificationDto) {
    return this.portal.dispatchNotification(req.user.userId, req.user.role, dto);
  }

  /** Genera notificaciones de aviso de no renovación / vencimiento (contratos a término fijo). */
  @Post("hr/contract-renewal-notices/run")
  runContractRenewalNotices(@Req() req: { user: ReqUser }) {
    return this.portal.runFixedTermContractRenewalNotificationsForActor(
      req.user.userId,
      req.user.role
    );
  }

  /** Solo admin: aprueba usuario pendiente y asigna id_empresa en PostgreSQL. */
  @Post("approve-pending-user")
  approvePendingUser(@Req() req: { user: ReqUser }, @Body() dto: ApprovePendingUserDto) {
    return this.portal.approvePendingUser(
      req.user.userId,
      req.user.role,
      dto.userId,
      dto.companyId,
      dto.role,
      dto.permissions
    );
  }

  /** Solo admin: cambia estado de cuenta (ej: desactivar => rechazado). */
  @Post("admin-user-status")
  adminUserStatus(@Req() req: { user: ReqUser }, @Body() dto: AdminUserStatusDto) {
    return this.portal.adminSetUserStatus(req.user.userId, req.user.role, dto.userId, dto.status, dto.reason);
  }

  /** Solo admin: actualiza correo y/o contraseña de usuario. */
  @Post("admin-user-credentials")
  adminUserCredentials(@Req() req: { user: ReqUser }, @Body() dto: AdminUserCredentialsDto) {
    return this.portal.adminUpdateUserCredentials(
      req.user.userId,
      req.user.role,
      dto.userId,
      dto.email,
      dto.password
    );
  }

  /** Solo admin: finaliza sesiones (global o por usuario). */
  @Post("admin-clear-user-sessions")
  adminClearUserSessions(@Req() req: { user: ReqUser }, @Body() dto: AdminClearUserSessionsDto) {
    return this.portal.adminClearUserSessions(req.user.userId, req.user.role, dto.userId);
  }

  /**
   * Cierra la sesión del usuario autenticado: invalida refresh_token_hash y
   * borra filas en sesiones_usuario para que el siguiente refresh devuelva 401
   * y la cuenta no quede "fantasma" activa en BD tras logout.
   */
  @Post("logout")
  logout(@Req() req: { user: ReqUser }) {
    return this.portal.logoutSelf(req.user.userId);
  }

  /** Solo admin: elimina usuario si no tiene referencias operativas críticas. */
  @Post("admin-user-delete")
  adminUserDelete(@Req() req: { user: ReqUser }, @Body() dto: AdminUserDeleteDto) {
    return this.portal.adminDeleteUser(req.user.userId, req.user.role, dto.userId, dto.motivo);
  }

  /** Solo admin: elimina empresa sin usuarios ni nómina vinculados. */
  @Post("admin-company-delete")
  adminCompanyDelete(@Req() req: { user: ReqUser }, @Body() dto: AdminCompanyDeleteDto) {
    return this.portal.adminDeleteCompany(req.user.userId, req.user.role, dto.companyId);
  }

  /** Solo admin: borra solicitud en BD tras registrar motivo y comprobar que no quede viaje asignado. */
  @Post("admin-request-delete")
  adminRequestDelete(@Req() req: { user: ReqUser }, @Body() dto: AdminRequestDeleteDto) {
    return this.portal.adminDeleteTransportRequest(req.user.userId, req.user.role, dto.requestId, dto.motivo);
  }

  /** Cliente: borra solicitud pendiente de su empresa (antes de aprobación). */
  @Post("client-request-delete")
  clientRequestDelete(@Req() req: { user: ReqUser }, @Body() dto: ClientRequestDeleteDto) {
    return this.portal.clientDeletePendingTransportRequest(req.user.userId, req.user.role, dto.requestId, dto.motivo);
  }

  @Post("admin-vehicle-delete")
  adminVehicleDelete(@Req() req: { user: ReqUser }, @Body() dto: AdminVehicleDeleteDto) {
    return this.portal.adminDeleteVehicle(req.user.userId, req.user.role, dto.vehicleId);
  }

  @Post("admin-driver-delete")
  adminDriverDelete(@Req() req: { user: ReqUser }, @Body() dto: AdminDriverDeleteDto) {
    return this.portal.adminDeleteDriver(req.user.userId, req.user.role, dto.driverId);
  }

  @Post("admin-clear-trip")
  adminClearTrip(@Req() req: { user: ReqUser }, @Body() dto: AdminClearTripDto) {
    return this.portal.adminClearTripForRequest(req.user.userId, req.user.role, dto.requestId, dto.motivo);
  }

  @Post("admin-employee-delete")
  adminEmployeeDelete(@Req() req: { user: ReqUser }, @Body() dto: AdminEmployeeDeleteDto) {
    return this.portal.adminDeletePayrollEmployee(req.user.userId, req.user.role, dto.employeeId);
  }
}
