import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { CreateRequestDto } from "./dto/create-request.dto";
import { RequestsService } from "./requests.service";

type UserRequest = Request & {
  user: {
    userId: string;
    role: string;
  };
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("requests")
export class RequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Roles("CLIENT")
  @Post()
  create(@Req() req: UserRequest, @Body() dto: CreateRequestDto) {
    return this.requests.create(req.user.userId, dto);
  }

  @Roles("ADMIN", "CLIENT")
  @Get()
  list(@Req() req: UserRequest) {
    return this.requests.listByUser(req.user.userId, req.user.role);
  }

  @Roles("ADMIN")
  @Post(":id/approve")
  approve(@Req() req: UserRequest, @Param("id") id: string) {
    return this.requests.approve(id, req.user.userId);
  }
}
