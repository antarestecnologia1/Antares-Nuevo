import { Injectable } from "@nestjs/common";
import { marcaTiempoColombiaIso } from "../common/colombia-time";
import { GenerateSlipDto } from "./dto/generate-slip.dto";

@Injectable()
export class PayrollService {
  generateSlipPayload(dto: GenerateSlipDto) {
    const net = dto.gross - dto.deductions;
    return {
      title: "Desprendible de pago",
      employeeName: dto.employeeName,
      gross: dto.gross,
      deductions: dto.deductions,
      net,
      generatedAt: marcaTiempoColombiaIso()
    };
  }
}
