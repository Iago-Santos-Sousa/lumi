import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { InvoiceService } from "./invoice.service";
import { DashboardQueryDto } from "./dto/dashboard-query.dto";
import { GetDashboardDocs } from "./invoice.docs";

@ApiTags("Invoice")
@ApiBearerAuth()
@Controller("invoice")
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get("dashboard")
  @GetDashboardDocs()
  getDashboard(@Query() query: DashboardQueryDto) {
    return this.invoiceService.getDashboard(query);
  }
}
