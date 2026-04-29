import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass()
      ]) ?? [];

    if (!requiredRoles.length) return true;

    const req = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    const role = req.user?.role;
    const normalizedRequired = requiredRoles.map((r) => String(r).toLowerCase());
    const normalizedRole = role ? String(role).toLowerCase() : "";
    if (!normalizedRole || !normalizedRequired.includes(normalizedRole)) {
      throw new ForbiddenException("No tienes permisos para esta acción");
    }
    return true;
  }
}
