import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { InvoiceModule } from "src/invoice/invoice.module";
import { ClientModule } from "src/client/client.module";

@Module({
  imports: [InvoiceModule, ClientModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
