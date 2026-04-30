import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ApprovePendingUserDto } from "./dto/approve-pending-user.dto";
import { SyncKeyDto } from "./dto/sync-key.dto";
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

  @Post("sync-key")
  syncKey(@Req() req: { user: ReqUser }, @Body() dto: SyncKeyDto) {
    return this.portal.syncKey(dto.key, dto.data, req.user.userId, req.user.role);
  }

  /** Solo admin: aprueba usuario pendiente y asigna id_empresa en PostgreSQL. */
  @Post("approve-pending-user")
  approvePendingUser(@Req() req: { user: ReqUser }, @Body() dto: ApprovePendingUserDto) {
    return this.portal.approvePendingUser(req.user.userId, req.user.role, dto.userId, dto.companyId, dto.role);
  }
}
