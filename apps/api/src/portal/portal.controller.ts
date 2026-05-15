import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
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

  @Post("sync-key")
  syncKey(@Req() req: { user: ReqUser }, @Body() dto: SyncKeyDto) {
    return this.portal.syncKey(dto.key, dto.data, req.user.userId, req.user.role);
  }

  /** Crear notificaciones in-app para otros usuarios (p. ej. avisar a admins). */
  @Post("notifications/dispatch")
  dispatchNotification(@Req() req: { user: ReqUser }, @Body() dto: DispatchNotificationDto) {
    return this.portal.dispatchNotification(req.user.userId, req.user.role, dto);
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
    return this.portal.adminSetUserStatus(req.user.userId, req.user.role, dto.userId, dto.status);
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
    return this.portal.adminDeleteUser(req.user.userId, req.user.role, dto.userId);
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
