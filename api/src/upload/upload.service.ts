import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { DataSource } from "typeorm/data-source/DataSource";
import { InjectDataSource } from "@nestjs/typeorm";
import { BadRequestException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import type * as PdfJs from "pdfjs-dist";

/** Subconjunto de TextItem usado na extração de texto do PDF. */
type PdfTextItem = { str: string; transform: number[] };
import { MONTH_MAP } from "src/utils/enums";
import { ExtractedInvoiceData } from "src/common/interfaces";
import { InvoiceService } from "src/invoice/invoice.service";
import { ClientService } from "src/client/client.service";
import { Invoice } from "src/invoice/entities/invoice.entity";
import { MAX_FILES_PER_UPLOAD } from "src/common/constants/pdf.constant";
import { InvoiceDataDetailsMapper } from "./mappers/invoice-data-details.mapper";

type ParsedFile = {
  file: Express.Multer.File;
  data: ExtractedInvoiceData;
  savedFilename: string;
  savedFilePath: string;
};

@Injectable()
export class UploadService {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly clientService: ClientService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async downloadFile(
    clientId: number,
    referenceMonth: string,
    invoiceId: number,
  ) {
    const invoice = await this.clientService.findByClientIdAndReferenceMonth(
      clientId,
      referenceMonth,
      invoiceId,
    );

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "invoices",
      invoice.invoices[0].pdf_filename ?? "",
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        `Arquivo "${invoice.invoices[0].pdf_filename}" não encontrado.`,
      );
    }

    return {
      filePath,
      filename: invoice.invoices[0].pdf_filename,
    };
  }

  async extractAndParsePdf(buffer: Buffer): Promise<ExtractedInvoiceData> {
    const rawText = await this.extractTextFromPdf(buffer);
    return this.parseInvoiceData(rawText);
  }

  async processInvoicePdf(
    buffer: Buffer,
    filename?: string,
    filePath?: string,
  ): Promise<Invoice> {
    if (!filename || !filePath) {
      filename = "unknown.pdf";
      filePath = "unknown_path/unknown.pdf";
    }

    const data = await this.extractAndParsePdf(buffer);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      return await this.persistWithQueryRunner(
        queryRunner,
        data,
        filename,
        filePath,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 1. Extração do texto bruto via pdfjs-dist
   */
  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      // pdfjs-dist ≥ v4 é ESM puro — dynamic import() é a única forma de
      // consumi-lo a partir de um módulo CommonJS (saída padrão do NestJS).
      const pdfjs = (await import(
        "pdfjs-dist/legacy/build/pdf.mjs"
      )) as typeof PdfJs;

      const uint8Array = new Uint8Array(buffer);

      const loadingTask = pdfjs.getDocument({
        data: uint8Array,
        // Desabilita workers no ambiente Node.js
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const textPages: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        // Reconstrói o texto preservando quebras de linha
        // baseando-se na posição Y de cada item
        let lastY: number | null = null;
        const lines: string[] = [];

        for (const item of content.items as PdfTextItem[]) {
          if (!item.str) continue;

          const y = item.transform[5]; // posição Y do item

          if (lastY !== null && Math.abs(lastY - y) > 2) {
            lines.push("\n");
          }

          lines.push(item.str);
          lastY = y;
        }

        textPages.push(lines.join(""));
      }

      return textPages.join("\n");
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to extract text from PDF: ",
        error,
      );
    }
  }

  /**
   * 2. Parsing e cálculo dos campos a partir do texto
   */
  private parseInvoiceData(text: string): ExtractedInvoiceData {
    // Nº do Cliente e Nº da Instalação
    const clientMatch = text.match(
      /Nº DO CLIENTE\s+Nº DA INSTALAÇÃO\s+(\d+)\s+(\d+)/,
    );

    if (!clientMatch) {
      throw new BadRequestException(
        "Não foi possível identificar o Nº do Cliente no PDF enviado.",
      );
    }

    const clientNumber = clientMatch[1].trim();
    const installationNumber = clientMatch[2].trim();
    const clientBlockMatch = text.match(
      /Valor a pagar \(R\$\)\n(.+)\n.+\n(.+)\n(.+)\n(.+)/,
    );

    let client_name: string | null = null;
    let address: string | null = null;
    let neighborhood: string | null = null;
    let city_state: string | null = null;
    let document_type: string | null = null;
    let document_number: string | null = null;

    if (clientBlockMatch) {
      client_name = clientBlockMatch[1].trim();
      address = clientBlockMatch[2].trim();
      neighborhood = clientBlockMatch[3].trim();
      city_state = clientBlockMatch[4].trim();
    }

    const docMatch = text.match(/NOTA FISCAL.+\n(CNPJ|CPF)\s+([\d.\-/*]+)/);

    if (docMatch) {
      document_type = docMatch[1].trim();
      document_number = docMatch[2].trim();
    }

    // Mês de referência
    // Formato no texto: "JAN/2024  09/02/2024  66,62"
    const refMatch = text.match(
      /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{4})\s+\d{2}\/\d{2}\/\d{4}/,
    );

    if (!refMatch) {
      throw new BadRequestException(
        "Não foi possível identificar o mês de referência no PDF enviado.",
      );
    }

    const referenceMonth = `${refMatch[1]}/${refMatch[2]}`; // "JAN/2024"

    const referenceDate = new Date(
      Number(refMatch[2]),
      MONTH_MAP[refMatch[1]] - 1, // mês 0-indexado
      1,
    );

    // Bloco de itens da fatura
    // Formato real (uma linha por item):
    // Energia Elétrica kWh 100 0,95543124 95,52 0,74906000
    // Energia SCEE s/ ICMS kWh 2.300 0,50970610 1.172,31 0,48733000
    // Energia compensada GD I kWh 2.300 0,48733000 -1.120,85 0,48733000
    // Contrib Ilum Publica Municipal 40,45
    // [^\n]* ao final de cada linha consome qualquer número de colunas extras
    // (PIS/COFINS, Base Calc., Aliq. ICMS, Tarifa Unit., etc.) que variam
    // conforme o layout da fatura, sem que isso impeça o match.
    const billingMatch = text.match(
      /Energia El[eé]trica\s+kWh\s+([\d.]+)\s+[\d,]+\s+([\d.,]+)[^\n]*\nEnergia SCEE s\/ ICMS\s+kWh\s+([\d.]+)\s+[\d,]+\s+([\d.,]+)[^\n]*\nEnergia compensada GD I\s+kWh\s+([\d.]+)\s+[\d,]+\s+(-?[\d.,]+)[^\n]*\nContrib Ilum Publica Municipal\s+([\d.,]+)/,
    );

    if (!billingMatch) {
      throw new BadRequestException(
        "Não foi possível extrair os itens da fatura do PDF enviado. " +
          "Verifique se o arquivo é uma fatura CEMIG válida.",
      );
    }

    return InvoiceDataDetailsMapper.toDto(billingMatch, {
      clientNumber,
      installationNumber,
      referenceMonth,
      referenceDate,
      client_name,
      address,
      neighborhood,
      city_state,
      document_type,
      document_number,
    });
  }

  private async persistWithQueryRunner(
    queryRunner: import("typeorm").QueryRunner,
    data: ExtractedInvoiceData,
    filename: string,
    filePath: string,
  ): Promise<Invoice> {
    await queryRunner.startTransaction();
    try {
      const clientNumber = Number(data.client_number);

      const client = await this.clientService.createClient(
        queryRunner,
        clientNumber,
      );

      const invoice = await this.invoiceService.createInvoice(
        queryRunner,
        data,
        client,
        filename,
        filePath,
      );

      await queryRunner.commitTransaction();
      return invoice;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  async uploadFiles(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException("Nenhum arquivo foi enviado.");
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      throw new BadRequestException(
        `Máximo de ${MAX_FILES_PER_UPLOAD} arquivos por requisição.`,
      );
    }

    const allowedMimeTypes = ["application/pdf"];
    const allowedExtensions = ["pdf"];
    const maxSizeInBytes = 40 * 1024; // 40 KB

    const parsed: ParsedFile[] = [];
    const failed: { filename: string; error: string }[] = [];

    for (const file of files) {
      const filename = file.originalname || "unknown.pdf";

      if (!file.mimetype || !allowedMimeTypes.includes(file.mimetype)) {
        failed.push({
          filename,
          error: "Tipo de arquivo inválido. Apenas PDF é permitido.",
        });
        continue;
      }

      const extension = filename.split(".").pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        failed.push({
          filename,
          error: `Extensão inválida (.${extension}). Permitidas: ${allowedExtensions.join(", ")}`,
        });
        continue;
      }

      if (file.size > maxSizeInBytes) {
        failed.push({
          filename,
          error: `Arquivo muito grande. Máximo permitido: ${(maxSizeInBytes / 1024).toFixed(2)} KB`,
        });
        continue;
      }

      // Extração e parse do PDF (CPU, sem banco)
      try {
        const data = await this.extractAndParsePdf(file.buffer);
        const { savedFilename, savedFilePath } = this.savePdfToDisk(
          file.buffer,
          filename,
        );
        parsed.push({ file, data, savedFilename, savedFilePath });
      } catch (err) {
        failed.push({
          filename,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (parsed.length === 0) {
      return { succeeded: [], failed };
    }

    // Fase 2: persistência — UMA única conexão para todo o lote
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const succeeded: object[] = [];

    try {
      for (const { file, data, savedFilename, savedFilePath } of parsed) {
        try {
          const invoice = await this.persistWithQueryRunner(
            queryRunner,
            data,
            savedFilename,
            savedFilePath,
          );

          succeeded.push({
            filename: savedFilename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            invoice,
          });
        } catch (err) {
          // Remove o arquivo salvo em disco se a persistência falhou
          // if (fs.existsSync(savedFilePath)) {
          //   fs.unlinkSync(savedFilePath);
          // }

          failed.push({
            filename: file.originalname,
            error:
              err instanceof ConflictException ||
              err instanceof BadRequestException
                ? err.message
                : `Erro ao salvar fatura: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      }
    } finally {
      await queryRunner.release();
    }

    return { succeeded, failed };
  }

  private savePdfToDisk(
    buffer: Buffer,
    originalname: string,
  ): { savedFilename: string; savedFilePath: string } {
    const response = {
      savedFilename: "",
      savedFilePath: "",
    };

    const uploadsDir = path.join(process.cwd(), "uploads", "invoices");
    const targetPath = path.join(uploadsDir, originalname);

    if (fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, buffer);
      response.savedFilename = originalname;
      response.savedFilePath = targetPath;
      return response;
    }

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const savedFilename = `${originalname}`;
    const savedFilePath = path.join(uploadsDir, savedFilename);

    fs.writeFileSync(savedFilePath, buffer);

    response.savedFilename = savedFilename;
    response.savedFilePath = savedFilePath;

    return response;
  }
}
