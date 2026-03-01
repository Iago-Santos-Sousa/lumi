import { Controller, Get, Query } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { DashboardQueryDto } from "./dto/dashboard-query.dto";

@Controller("invoice")
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get("dashboard")
  getDashboard(@Query() query: DashboardQueryDto) {
    return this.invoiceService.getDashboard(query);
  }
}
