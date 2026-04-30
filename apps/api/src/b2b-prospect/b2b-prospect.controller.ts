import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { B2bProspectService } from "./b2b-prospect.service";
import { CreateB2bProspectDto } from "./dto/create-b2b-prospect.dto";

@Controller("public")
export class B2bProspectController {
  constructor(private readonly b2b: B2bProspectService) {}

  /** Sin JWT: formulario público del sitio. Protegido por Throttler global + límite más bajo aquí. */
  @Throttle({ default: { ttl: 60_000, limit: 6 } })
  @Post("b2b-prospect")
  create(@Body() dto: CreateB2bProspectDto) {
    return this.b2b.create(dto);
  }
}
