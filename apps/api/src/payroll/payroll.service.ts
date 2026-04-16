import { Injectable } from "@nestjs/common";
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
      generatedAt: new Date().toISOString()
    };
  }
}
