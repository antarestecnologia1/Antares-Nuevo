import { Body, Controller, Get, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { B2bProspectService } from "./b2b-prospect.service";
import { CreateB2bProspectDto } from "./dto/create-b2b-prospect.dto";
import { CreateJobApplicationDto } from "./dto/create-job-application.dto";

@Controller("public")
export class B2bProspectController {
  constructor(private readonly b2b: B2bProspectService) {}

  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Get("vacancies")
  listVacancies() {
    return this.b2b.listPublishedVacancies();
  }

  /** Sin JWT: formulario público del sitio. Protegido por Throttler global + límite más bajo aquí. */
  @Throttle({ default: { ttl: 60_000, limit: 6 } })
  @Post("b2b-prospect")
  create(@Body() dto: CreateB2bProspectDto) {
    return this.b2b.create(dto);
  }

  @Throttle({ default: { ttl: 60_000, limit: 8 } })
  @Post("job-application")
  apply(@Body() dto: CreateJobApplicationDto) {
    return this.b2b.createJobApplication(dto);
  }
}
