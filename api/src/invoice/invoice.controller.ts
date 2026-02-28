import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { DashboardQueryDto } from "./dto/dashboard-query.dto";

@Controller("invoice")
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  /**
   * GET /invoice/dashboard
   *
   * Retorna totais acumulados (cards) e série temporal por mês (gráficos).
   *
   * Query params opcionais:
   *   - client_number : filtra por número do cliente CEMIG
   *   - initial_date  : início do período (YYYY-MM-DD)
   *   - final_date    : fim do período    (YYYY-MM-DD)
   */
  @Get("dashboard")
  getDashboard(@Query() query: DashboardQueryDto) {
    return this.invoiceService.getDashboard(query);
  }

  @Get()
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.invoiceService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(+id, updateInvoiceDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.invoiceService.remove(+id);
  }
}
