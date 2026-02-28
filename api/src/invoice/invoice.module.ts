import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InvoiceService } from "./invoice.service";
import { InvoiceController } from "./invoice.controller";
import { Invoice } from "./entities/invoice.entity";
import { InvoiceRepository } from "./repositories/invoice.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository],
  exports: [InvoiceService],
})
export class InvoiceModule {}
