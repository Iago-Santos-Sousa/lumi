/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { InvoiceService } from "src/invoice/invoice.service";
import { ClientService } from "src/client/client.service";
import { getDataSourceToken } from "@nestjs/typeorm";
import { InvoiceDataDetailsMapper } from "./mappers/invoice-data-details.mapper";
import { parseNumber } from "src/utils";
import { ExtractedInvoiceData } from "src/common/interfaces";
import { Invoice } from "src/invoice/entities/invoice.entity";
import { Client } from "src/client/entities/client.entity";

// helpers
/** Texto mínimo válido extraído de uma fatura CEMIG. */
const buildValidPdfText = (
  overrides: Partial<{
    clientBlock: string;
    refMonth: string;
    billingBlock: string;
  }> = {},
) => {
  const clientBlock =
    overrides.clientBlock ??
    `Nº DO CLIENTE  Nº DA INSTALAÇÃO\n7202210726  3001422762`;

  const refMonth = overrides.refMonth ?? `SET/2024  01/09/2024  145,72`;

  const billingBlock =
    overrides.billingBlock ??
    [
      `Energia Elétrica  kWh  100  0,95543124  95,52  0,74906000`,
      `Energia SCEE s/ ICMS  kWh  2.220  0,50970610  1.073,48  0,48733000`,
      `Energia compensada GD I  kWh  2.220  0,48733000  -1.073,48  0,48733000`,
      `Contrib Ilum Publica Municipal  49,43`,
    ].join("\n");

  return [
    clientBlock,
    `Valor a pagar (R$)\nJoão Silva\nRua das Flores, 123\nBairro Centro\nSão Paulo - SP`,
    `NOTA FISCAL\nCPF  123.456.789-00`,
    refMonth,
    billingBlock,
  ].join("\n");
};

/** Cria um mock mínimo de Express.Multer.File. */
const makeFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    originalname: "fatura.pdf",
    mimetype: "application/pdf",
    size: 1024,
    buffer: Buffer.from("pdf"),
    fieldname: "files",
    encoding: "7bit",
    ...overrides,
  }) as Express.Multer.File;

/** Shape dos itens de upload bem-sucedido retornados por UploadService.uploadFiles. */
type SucceededUploadItem = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  invoice: Invoice;
};

/** Factory de ExtractedInvoiceData para uso nos testes de upload. */
const makeExtractedData = (
  overrides: Partial<ExtractedInvoiceData> = {},
): ExtractedInvoiceData => ({
  client_number: "7202210726",
  installation_number: "3001422762",
  reference_month: "SET/2024",
  reference_date: new Date("2024-09-01"),
  energia_eletrica_kwh: 100,
  energia_eletrica_valor: 95.52,
  energia_sceee_kwh: 2220,
  energia_sceee_valor: 1073.48,
  energia_compensada_kwh: 2220,
  energia_compensada_valor: -1073.48,
  contrib_ilum_publica: 49.43,
  consumo_energia_eletrica_kwh: 2320,
  valor_total_sem_gd: 1218.43,
  economia_gd: 1073.48,
  client_name: "João Silva",
  address: "Rua das Flores, 123",
  neighborhood: "Bairro Centro",
  city_state: "São Paulo - SP",
  document_type: "CPF",
  document_number: "123.456.789-00",
  ...overrides,
});

// mocks de dependências
const mockQueryRunner = {
  connect: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  manager: {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

const mockInvoiceService = {
  createInvoice: jest.fn(),
};

const mockClientService = {
  createClient: jest.fn(),
  findByClientIdAndReferenceMonth: jest.fn(),
};

// suite
describe("UploadService", () => {
  let service: UploadService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: ClientService, useValue: mockClientService },
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it("deve ser definido", () => {
    expect(service).toBeDefined();
  });

  // parseNumber
  describe("parseNumber (utilitário de parsing)", () => {
    it("converte número brasileiro inteiro", () => {
      expect(parseNumber("100")).toBe(100);
    });

    it("converte número com vírgula decimal", () => {
      expect(parseNumber("95,52")).toBeCloseTo(95.52);
    });

    it("converte número com ponto como separador de milhar e vírgula decimal", () => {
      expect(parseNumber("1.073,48")).toBeCloseTo(1073.48);
    });

    it("converte número negativo brasileiro", () => {
      expect(parseNumber("-1.073,48")).toBeCloseTo(-1073.48);
    });

    it("lança BadRequestException para valor não numérico", () => {
      expect(() => parseNumber("abc")).toThrow(BadRequestException);
    });
  });

  // InvoiceDataDetailsMapper
  describe("InvoiceDataDetailsMapper.toDto — cálculo dos valores agregados", () => {
    const referenceDate = new Date(2024, 8, 1); // SET/2024

    const details = {
      clientNumber: "7202210726",
      installationNumber: "3001422762",
      referenceMonth: "SET/2024",
      referenceDate,
      client_name: "João Silva",
      address: "Rua das Flores, 123",
      neighborhood: "Bairro Centro",
      city_state: "São Paulo - SP",
      document_type: "CPF",
      document_number: "123.456.789-00",
    };

    // billingMatch[1..7]: eeKwh, eeVal, sceeeKwh, sceeeVal, compKwh, compVal, contrib
    const buildMatch = (groups: string[]): RegExpMatchArray => {
      const arr = ["", ...groups] as unknown as RegExpMatchArray;
      arr.index = 0;
      arr.input = "";
      return arr;
    };

    it("calcula consumo_energia_eletrica_kwh = eletrica_kwh + sceee_kwh", () => {
      const match = buildMatch([
        "100",
        "95,52",
        "2.220",
        "1.073,48",
        "2.220",
        "-1.073,48",
        "49,43",
      ]);
      const dto = InvoiceDataDetailsMapper.toDto(match, details);
      expect(dto.consumo_energia_eletrica_kwh).toBeCloseTo(100 + 2220);
    });

    it("calcula valor_total_sem_gd = eletrica_valor + sceee_valor + contrib", () => {
      const match = buildMatch([
        "100",
        "95,52",
        "2.220",
        "1.073,48",
        "2.220",
        "-1.073,48",
        "49,43",
      ]);
      const dto = InvoiceDataDetailsMapper.toDto(match, details);
      expect(dto.valor_total_sem_gd).toBeCloseTo(95.52 + 1073.48 + 49.43);
    });

    it("calcula economia_gd = |energia_compensada_valor| (sempre positivo)", () => {
      const match = buildMatch([
        "100",
        "95,52",
        "2.220",
        "1.073,48",
        "2.220",
        "-1.073,48",
        "49,43",
      ]);
      const dto = InvoiceDataDetailsMapper.toDto(match, details);
      expect(dto.economia_gd).toBeCloseTo(1073.48);
      expect(dto.economia_gd).toBeGreaterThan(0);
    });

    it("energia_compensada_valor é negativo no DTO (crédito GD)", () => {
      const match = buildMatch([
        "100",
        "95,52",
        "2.220",
        "1.073,48",
        "2.220",
        "-1.073,48",
        "49,43",
      ]);
      const dto = InvoiceDataDetailsMapper.toDto(match, details);
      expect(dto.energia_compensada_valor).toBeLessThan(0);
    });

    it("mapeia dados de identificação corretamente", () => {
      const match = buildMatch([
        "100",
        "95,52",
        "2.220",
        "1.073,48",
        "2.220",
        "-1.073,48",
        "49,43",
      ]);
      const dto = InvoiceDataDetailsMapper.toDto(match, details);
      expect(dto.client_number).toBe("7202210726");
      expect(dto.installation_number).toBe("3001422762");
      expect(dto.reference_month).toBe("SET/2024");
      expect(dto.client_name).toBe("João Silva");
    });
  });

  // parseInvoiceData (método privado)
  describe("parseInvoiceData — parsing do texto do PDF", () => {
    const parse = (text: string): ExtractedInvoiceData =>
      (service as any).parseInvoiceData(text); // acesso a método privado

    it("extrai número do cliente e instalação corretamente", () => {
      const result = parse(buildValidPdfText());
      expect(result.client_number).toBe("7202210726");
      expect(result.installation_number).toBe("3001422762");
    });

    it("extrai mês de referência corretamente", () => {
      const result = parse(buildValidPdfText());
      expect(result.reference_month).toBe("SET/2024");
    });

    it("gera reference_date com o primeiro dia do mês correto", () => {
      const result = parse(buildValidPdfText());
      expect(result.reference_date.getMonth()).toBe(8); // SET = mês 9 → index 8
      expect(result.reference_date.getFullYear()).toBe(2024);
      expect(result.reference_date.getDate()).toBe(1);
    });

    it("calcula consumo_energia_eletrica_kwh corretamente (100 + 2220 = 2320)", () => {
      const result = parse(buildValidPdfText());
      expect(result.consumo_energia_eletrica_kwh).toBeCloseTo(2320);
    });

    it("calcula valor_total_sem_gd corretamente (95,52 + 1073,48 + 49,43)", () => {
      const result = parse(buildValidPdfText());
      expect(result.valor_total_sem_gd).toBeCloseTo(1218.43);
    });

    it("calcula economia_gd como valor absoluto de energia_compensada_valor", () => {
      const result = parse(buildValidPdfText());
      expect(result.economia_gd).toBeCloseTo(1073.48);
    });

    it("lança BadRequestException quando o Nº do cliente não é encontrado", () => {
      const textSemCliente = buildValidPdfText({
        clientBlock: "TEXTO SEM NÚMERO DE CLIENTE",
      });
      expect(() => parse(textSemCliente)).toThrow(BadRequestException);
    });

    it("lança BadRequestException quando o mês de referência não é encontrado", () => {
      const textSemRef = buildValidPdfText({
        refMonth: "DATA INVÁLIDA",
      });
      expect(() => parse(textSemRef)).toThrow(BadRequestException);
    });

    it("lança BadRequestException quando o bloco de itens de faturamento não é encontrado", () => {
      const textSemFatura = buildValidPdfText({
        billingBlock: "ITENS AUSENTES",
      });
      expect(() => parse(textSemFatura)).toThrow(BadRequestException);
    });
  });

  // uploadFiles — validações de entrada
  describe("uploadFiles — validação de arquivos", () => {
    it("lança BadRequestException quando nenhum arquivo é enviado", async () => {
      await expect(service.uploadFiles([])).rejects.toThrow(
        BadRequestException,
      );
    });

    it("lança BadRequestException quando excede o limite de arquivos", async () => {
      const files = Array.from({ length: 11 }, () => makeFile());
      await expect(service.uploadFiles(files)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("registra falha para arquivo com MIME type inválido", async () => {
      jest
        .spyOn(service as any, "extractAndParsePdf")
        .mockResolvedValue(makeExtractedData());
      jest.spyOn(service as any, "savePdfToDisk").mockReturnValue({
        savedFilename: "fatura.pdf",
        savedFilePath: "/tmp/fatura.pdf",
      });

      const file = makeFile({
        mimetype: "image/png",
        originalname: "imagem.png",
      });
      const result = await service.uploadFiles([file]);

      expect(result.succeeded).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toMatch(/Tipo de arquivo in/i);
    });

    it("registra falha para arquivo com extensão inválida", async () => {
      const file = makeFile({
        originalname: "doc.docx",
        mimetype: "application/pdf",
      });
      const result = await service.uploadFiles([file]);

      expect(result.failed[0].error).toMatch(/Extens/i);
    });

    it("registra falha para arquivo acima do tamanho permitido", async () => {
      const file = makeFile({ size: 99999, originalname: "grande.pdf" });
      const result = await service.uploadFiles([file]);

      expect(result.failed[0].error).toMatch(/Arquivo muito grande/i);
    });

    it("retorna succeeded vazio quando todos os arquivos falham na fase de parse", async () => {
      jest
        .spyOn(service as any, "extractAndParsePdf")
        .mockRejectedValue(new BadRequestException("parse error"));
      jest
        .spyOn(service as any, "savePdfToDisk")
        .mockReturnValue({ savedFilename: "f.pdf", savedFilePath: "/p" });

      const file = makeFile();
      const result = await service.uploadFiles([file]);

      expect(result.succeeded).toHaveLength(0);
      expect(result.failed[0].error).toContain("parse error");
    });

    it("processa arquivo válido e retorna succeeded com fatura", async () => {
      const fakeData = makeExtractedData();
      const fakeInvoice: Pick<Invoice, "id" | "client_id"> = {
        id: 1,
        client_id: 1,
      };

      jest
        .spyOn(service as any, "extractAndParsePdf")
        .mockResolvedValue(fakeData);
      jest.spyOn(service as any, "savePdfToDisk").mockReturnValue({
        savedFilename: "fatura.pdf",
        savedFilePath: "/uploads/invoices/fatura.pdf",
      });
      jest
        .spyOn(service as any, "persistWithQueryRunner")
        .mockResolvedValue(fakeInvoice);

      const file = makeFile();
      const result = await service.uploadFiles([file]);

      expect(result.succeeded).toHaveLength(1);
      expect((result.succeeded[0] as SucceededUploadItem).invoice).toEqual(
        fakeInvoice,
      );
      expect(result.failed).toHaveLength(0);
    });
  });

  // persistWithQueryRunner
  describe("persistWithQueryRunner — inserção no banco", () => {
    const persist = (data: ExtractedInvoiceData) =>
      (service as any).persistWithQueryRunner(
        // acesso a método privado
        mockQueryRunner,
        data,
        "fatura.pdf",
        "/path/fatura.pdf",
      );

    const fakeData = makeExtractedData();

    it("cria cliente e fatura e commita a transação", async () => {
      const fakeClient: Pick<Client, "id" | "client_number"> = {
        id: 1,
        client_number: 7202210726,
      };
      const fakeInvoice: Pick<Invoice, "id" | "client_id"> = {
        id: 42,
        client_id: 1,
      };

      mockClientService.createClient.mockResolvedValue(fakeClient);
      mockInvoiceService.createInvoice.mockResolvedValue(fakeInvoice);

      const result = await persist(fakeData);

      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockClientService.createClient).toHaveBeenCalledWith(
        mockQueryRunner,
        7202210726,
      );
      expect(mockInvoiceService.createInvoice).toHaveBeenCalledWith(
        mockQueryRunner,
        fakeData,
        fakeClient,
        "fatura.pdf",
        "/path/fatura.pdf",
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual(fakeInvoice);
    });

    it("executa rollback quando createInvoice lança erro", async () => {
      const fakeClient: Pick<Client, "id"> = { id: 1 };
      mockClientService.createClient.mockResolvedValue(fakeClient);
      mockInvoiceService.createInvoice.mockRejectedValue(new Error("DB error"));

      await expect(persist(fakeData)).rejects.toThrow("DB error");
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });
});
