/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { DataSource } from "typeorm/data-source/DataSource";
import { InjectDataSource } from "@nestjs/typeorm";
import { CreateUploadDto } from "./dto/create-upload.dto";
import { UpdateUploadDto } from "./dto/update-upload.dto";
import { BadRequestException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjs =
  require("pdfjs-dist/legacy/build/pdf.mjs") as typeof import("pdfjs-dist");
import { MONTH_MAP } from "src/utils/enums";
import { ExtractedInvoiceData } from "src/common/interfaces";
import { parseNumber } from "src/utils";
import { InvoiceService } from "src/invoice/invoice.service";
import { ClientService } from "src/client/client.service";
import { Invoice } from "src/invoice/entities/invoice.entity";

@Injectable()
export class UploadService {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly clientService: ClientService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  create(createUploadDto: CreateUploadDto) {
    return "This action adds a new upload";
  }

  findAll() {
    return `This action returns all upload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }

  async downloadFile(clientNumber: number, referenceMonth: string) {
    const invoice =
      await this.clientService.findByClientNumberAndReferenceMonth(
        clientNumber,
        referenceMonth,
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

  /**
   * Recebe o buffer do PDF enviado via upload (Multer),
   * extrai os dados, calcula os campos derivados e
   * persiste tudo no banco usando uma transação.
   *
   * @param buffer   - Buffer do arquivo PDF (file.buffer do Multer)
   * @param filename - Nome original do arquivo (file.originalname do Multer)
   * @param filePath - Caminho/URL onde o PDF foi salvo no storage
   */
  async processInvoicePdf(
    buffer: Buffer,
    filename?: string,
    filePath?: string,
  ): Promise<Invoice> {
    if (!filename || !filePath) {
      filename = "unknown.pdf";
      filePath = "unknown_path/unknown.pdf";
    }

    // 1. Extração do texto bruto via pdfjs-dist
    const rawText = await this.extractTextFromPdf(buffer);

    // 2. Parsing e cálculo dos campos a partir do texto
    const data = this.parseInvoiceData(rawText);

    // 3. Persistência dentro de uma transação
    return this.persistWithTransaction(data, filename, filePath);
  }

  /**
   * 1. Extração do texto bruto via pdfjs-dist
   */
  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
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

        for (const item of content.items as any[]) {
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
      throw new InternalServerErrorException("Failed to extract text from PDF");
    }
  }

  /**
   * 2. Parsing e cálculo dos campos a partir do texto
   */

  private parseInvoiceData(text: string): ExtractedInvoiceData {
    // ── Nº do Cliente e Nº da Instalação ──
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

    // ── Mês de referência ──
    // Formato no texto: "JAN/2024    09/02/2024    66,62"
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

    // ── Bloco de itens da fatura ──
    // Formato real (uma linha por item):
    // Energia Elétrica kWh 100 0,95543124 95,52 0,74906000
    // Energia SCEE s/ ICMS kWh 2.300 0,50970610 1.172,31 0,48733000
    // Energia compensada GD I kWh 2.300 0,48733000 -1.120,85 0,48733000
    // Contrib Ilum Publica Municipal 40,45
    const billingMatch = text.match(
      /Energia El[eé]trica\s+kWh\s+([\d.]+)\s+[\d,]+\s+([\d.,]+)\s+[\d,]+\s*\nEnergia SCEE s\/ ICMS\s+kWh\s+([\d.]+)\s+[\d,]+\s+([\d.,]+)\s+[\d,]+\s*\nEnergia compensada GD I\s+kWh\s+([\d.]+)\s+[\d,]+\s+(-?[\d.,]+)\s+[\d,]+\s*\nContrib Ilum Publica Municipal\s+([\d.,]+)/,
    );

    if (!billingMatch) {
      throw new BadRequestException(
        "Não foi possível extrair os itens da fatura do PDF enviado. " +
          "Verifique se o arquivo é uma fatura CEMIG válida.",
      );
    }

    // Grupos: [1]=eeKwh [2]=eeValor [3]=sceeeKwh [4]=sceeeValor
    //         [5]=compKwh [6]=compValor [7]=contrib
    const energiaEletricaKwh = parseNumber(billingMatch[1]);
    const energiaEletricaValor = parseNumber(billingMatch[2]);
    const energiaSceeeKwh = parseNumber(billingMatch[3]);
    const energiaSceeeValor = parseNumber(billingMatch[4]);
    const energiaCompensadaKwh = parseNumber(billingMatch[5]);
    const energiaCompensadaValor = parseNumber(billingMatch[6]);
    const contribIlumPublica = parseNumber(billingMatch[7]);

    // ── Variáveis calculadas ──
    const consumoEnergiaEletricaKwh = energiaEletricaKwh + energiaSceeeKwh;

    const valorTotalSemGd =
      energiaEletricaValor + energiaSceeeValor + contribIlumPublica;

    const economiaGd = Math.abs(energiaCompensadaValor); // sempre positivo

    return {
      client_number: clientNumber,
      installation_number: installationNumber,
      reference_month: referenceMonth,
      reference_date: referenceDate,
      energia_eletrica_kwh: energiaEletricaKwh,
      energia_eletrica_valor: energiaEletricaValor,
      energia_sceee_kwh: energiaSceeeKwh,
      energia_sceee_valor: energiaSceeeValor,
      energia_compensada_kwh: energiaCompensadaKwh,
      energia_compensada_valor: energiaCompensadaValor,
      contrib_ilum_publica: contribIlumPublica,
      consumo_energia_eletrica_kwh: consumoEnergiaEletricaKwh,
      valor_total_sem_gd: valorTotalSemGd,
      economia_gd: economiaGd,
      client_name: client_name,
      address: address,
      neighborhood: neighborhood,
      city_state: city_state,
      document_type: document_type,
      document_number: document_number,
    };
  }

  /**
   * Usa QueryRunner para garantir atomicidade:
   * se qualquer operação falhar, toda a transação é revertida (ROLLBACK).
   *
   * Fluxo:
   *   1. Upsert do cliente (cria se não existir, retorna se já existir)
   *   2. Verifica duplicidade de fatura (mesmo cliente + mesmo mês)
   *   3. Cria e salva a fatura
   *   4. COMMIT
   */
  private async persistWithTransaction(
    data: ExtractedInvoiceData,
    filename: string,
    filePath: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const clientNumber = Number(data.client_number);
      // 1. Upsert do cliente
      const client = await this.clientService.createClient(
        queryRunner,
        clientNumber,
      );

      // 2. Upsert de invoice
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
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erro ao salvar fatura no banco de dados: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const allowedMimeTypes = ["application/pdf"];
    const allowedExtensions = ["pdf"];

    if (!file || !file.mimetype || !allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only PDF files are allowed.",
      );
    }

    const maxSizeInBytes = 40 * 1024; // 40kb

    const extension = file.originalname.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        `Extensão inválida (.${extension}). Permitidas: ${allowedExtensions.join(", ")}`,
      );
    }

    if (file.size > maxSizeInBytes) {
      throw new BadRequestException(
        `Arquivo muito grande. Máximo permitido: ${(maxSizeInBytes / 1024).toFixed(2)} KB`,
      );
    }

    if (!file.originalname) {
      file.originalname = "unknown.pdf";
    }

    const { savedFilename, savedFilePath } = this.savePdfToDisk(
      file.buffer,
      file.originalname,
    );

    const invoice = await this.processInvoicePdf(
      file.buffer,
      savedFilename,
      savedFilePath,
    );

    return {
      message: "File uploaded successfully",
      filename: savedFilename,
      filePath: savedFilePath,
      mimetype: file.mimetype,
      size: file.size,
      invoice,
    };
  }

  /**
   * Salva o buffer do PDF em disco e retorna o nome e caminho do arquivo.
   * Os arquivos são armazenados em <project_root>/uploads/invoices/.
   * O nome inclui um timestamp para evitar colisões.
   */
  private savePdfToDisk(
    buffer: Buffer,
    originalname: string,
  ): { savedFilename: string; savedFilePath: string } {
    const uploadsDir = path.join(process.cwd(), "uploads", "invoices");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const savedFilename = `${timestamp}-${originalname}`;
    const savedFilePath = path.join(uploadsDir, savedFilename);

    fs.writeFileSync(savedFilePath, buffer);

    return { savedFilename, savedFilePath };
  }
}
