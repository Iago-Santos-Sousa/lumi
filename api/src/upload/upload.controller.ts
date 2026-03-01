import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFiles,
  Res,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import { UploadService } from "./upload.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { MAX_FILES_PER_UPLOAD } from "src/common/constants/pdf.constant";
import { UploadFilesDocs, DownloadFileDocs } from "./upload.docs";

@ApiTags("Upload")
@ApiBearerAuth()
@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("upload-file")
  @UseInterceptors(FilesInterceptor("files", MAX_FILES_PER_UPLOAD))
  @UploadFilesDocs()
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadFiles(files);
  }

  @Get("/download/:client_id/:reference_month/:invoice_id")
  @DownloadFileDocs()
  async downloadFile(
    @Param("client_id") clientId: string,
    @Param("reference_month") referenceMonth: string,
    @Param("invoice_id") invoiceId: string,
    @Res() res: Response,
  ) {
    const filePath = await this.uploadService.downloadFile(
      Number(clientId),
      referenceMonth,
      Number(invoiceId),
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filePath.filename}"`,
    );

    return res.status(200).sendFile(filePath.filePath);
  }
}
