import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
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
}
