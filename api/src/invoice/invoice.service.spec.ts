/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { InvoiceRepository } from "./repositories/invoice.repository";
import { Invoice } from "./entities/invoice.entity";
import { ExtractedInvoiceData } from "src/common/interfaces";
import { Client } from "src/client/entities/client.entity";
import { QueryRunner } from "typeorm";

// helpers
const makeInvoice = (overrides: Partial<Invoice> = {}): Invoice =>
  ({
    id: 1,
    client_id: 1,
    reference_month: "SET/2024",
    reference_date: new Date("2024-09-01"),
    client_name: "João Silva",
    installation_number: "3001422762",
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
    pdf_filename: "fatura.pdf",
    pdf_path: "/uploads/invoices/fatura.pdf",
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }) as Invoice;

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

const makeClient = (): Client => ({
  id: 1,
  client_number: 7202210726,
  name: "João Silva",
  created_at: new Date(),
  updated_at: new Date(),
  invoices: [],
});

// mocks de dependências
const mockQueryRunnerManager = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockQueryRunner = {
  manager: mockQueryRunnerManager,
} as unknown as QueryRunner;

const mockQueryBuilder = {
  leftJoin: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockInvoiceRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

// suite
describe("InvoiceService", () => {
  let service: InvoiceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockInvoiceRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: InvoiceRepository, useValue: mockInvoiceRepository },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it("deve ser definido", () => {
    expect(service).toBeDefined();
  });

  // createInvoice
  describe("createInvoice", () => {
    it("cria e salva a fatura quando não existe fatura duplicada", async () => {
      const data = makeExtractedData();
      const client = makeClient();
      const created = makeInvoice();

      mockQueryRunnerManager.findOne.mockResolvedValue(null);
      mockQueryRunnerManager.create.mockReturnValue(created);
      mockQueryRunnerManager.save.mockResolvedValue(created);

      const result = await service.createInvoice(
        mockQueryRunner,
        data,
        client,
        "fatura.pdf",
        "/uploads/fatura.pdf",
      );

      expect(mockQueryRunnerManager.findOne).toHaveBeenCalledWith(Invoice, {
        where: { client_id: client.id, reference_month: data.reference_month },
      });
      expect(mockQueryRunnerManager.create).toHaveBeenCalledTimes(1);
      expect(mockQueryRunnerManager.save).toHaveBeenCalledWith(
        Invoice,
        created,
      );
      expect(result).toEqual(created);
    });

    it("lança ConflictException quando já existe fatura para o mesmo cliente e mês", async () => {
      const data = makeExtractedData();
      const client = makeClient();

      mockQueryRunnerManager.findOne.mockResolvedValue(makeInvoice());

      await expect(
        service.createInvoice(
          mockQueryRunner,
          data,
          client,
          "fatura.pdf",
          "/path",
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockQueryRunnerManager.save).not.toHaveBeenCalled();
    });

    it("persiste todos os campos extraídos do PDF", async () => {
      const data = makeExtractedData();
      const client = makeClient();
      const created = makeInvoice();

      mockQueryRunnerManager.findOne.mockResolvedValue(null);
      mockQueryRunnerManager.create.mockReturnValue(created);
      mockQueryRunnerManager.save.mockResolvedValue(created);

      await service.createInvoice(
        mockQueryRunner,
        data,
        client,
        "fatura.pdf",
        "/path",
      );

      const createArg = mockQueryRunnerManager.create.mock.calls[0][1];
      expect(createArg.energia_eletrica_kwh).toBe(data.energia_eletrica_kwh);
      expect(createArg.energia_sceee_kwh).toBe(data.energia_sceee_kwh);
      expect(createArg.consumo_energia_eletrica_kwh).toBe(
        data.consumo_energia_eletrica_kwh,
      );
      expect(createArg.valor_total_sem_gd).toBe(data.valor_total_sem_gd);
      expect(createArg.economia_gd).toBe(data.economia_gd);
      expect(createArg.pdf_filename).toBe("fatura.pdf");
    });
  });

  // getDashboard — cálculo dos valores agregados
  describe("getDashboard", () => {
    it("retorna totais zerados quando não há faturas", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getDashboard({});

      expect(result.totals.consumo_energia_eletrica_kwh).toBe(0);
      expect(result.totals.energia_compensada_kwh).toBe(0);
      expect(result.totals.valor_total_sem_gd).toBe(0);
      expect(result.totals.economia_gd).toBe(0);
      expect(result.chart).toHaveLength(0);
    });

    it("soma corretamente os totais de múltiplas faturas", async () => {
      const inv1 = makeInvoice({
        reference_month: "JAN/2024",
        reference_date: new Date("2024-01-01"),
        consumo_energia_eletrica_kwh: 2000,
        energia_compensada_kwh: 1900,
        valor_total_sem_gd: 1100,
        economia_gd: 950,
      });
      const inv2 = makeInvoice({
        id: 2,
        reference_month: "FEV/2024",
        reference_date: new Date("2024-02-01"),
        consumo_energia_eletrica_kwh: 2100,
        energia_compensada_kwh: 2000,
        valor_total_sem_gd: 1200,
        economia_gd: 1050,
      });

      mockQueryBuilder.getMany.mockResolvedValue([inv1, inv2]);

      const result = await service.getDashboard({});

      expect(result.totals.consumo_energia_eletrica_kwh).toBeCloseTo(4100);
      expect(result.totals.energia_compensada_kwh).toBeCloseTo(3900);
      expect(result.totals.valor_total_sem_gd).toBeCloseTo(2300);
      expect(result.totals.economia_gd).toBeCloseTo(2000);
    });

    it("agrupa chart por mês de referência preservando ordem cronológica", async () => {
      const inv1 = makeInvoice({
        reference_month: "JAN/2024",
        reference_date: new Date("2024-01-01"),
      });
      const inv2 = makeInvoice({
        id: 2,
        reference_month: "FEV/2024",
        reference_date: new Date("2024-02-01"),
      });
      const inv3 = makeInvoice({
        id: 3,
        reference_month: "JAN/2024",
        reference_date: new Date("2024-01-01"),
      });

      mockQueryBuilder.getMany.mockResolvedValue([inv1, inv2, inv3]);

      const result = await service.getDashboard({});

      // JAN/2024 aparece uma única vez (dois registros mesclados)
      expect(result.chart).toHaveLength(2);
      expect(result.chart[0].reference_month).toBe("JAN/2024");
      expect(result.chart[1].reference_month).toBe("FEV/2024");
    });

    it("acumula valores de múltiplas faturas no mesmo mês dentro do chart", async () => {
      const inv1 = makeInvoice({
        reference_month: "JAN/2024",
        reference_date: new Date("2024-01-01"),
        consumo_energia_eletrica_kwh: 1000,
        energia_compensada_kwh: 900,
        valor_total_sem_gd: 600,
        economia_gd: 450,
      });
      const inv2 = makeInvoice({
        id: 2,
        reference_month: "JAN/2024",
        reference_date: new Date("2024-01-01"),
        consumo_energia_eletrica_kwh: 500,
        energia_compensada_kwh: 400,
        valor_total_sem_gd: 300,
        economia_gd: 200,
      });

      mockQueryBuilder.getMany.mockResolvedValue([inv1, inv2]);

      const result = await service.getDashboard({});

      expect(result.chart).toHaveLength(1);
      expect(result.chart[0].consumo_energia_eletrica_kwh).toBeCloseTo(1500);
      expect(result.chart[0].valor_total_sem_gd).toBeCloseTo(900);
    });

    it("aplica filtro de client_number na query", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getDashboard({ client_number: "7202210726" });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "client.client_number = :client_number",
        { client_number: 7202210726 },
      );
    });

    it("aplica filtros de initial_date e final_date na query", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getDashboard({
        initial_date: "2024-01-01",
        final_date: "2024-12-31",
      });

      const whereCalls = (
        mockQueryBuilder.andWhere.mock.calls as [string, ...unknown[]][]
      ).map(([condition]) => condition);
      expect(whereCalls).toContain("invoice.reference_date >= :start");
      expect(whereCalls).toContain("invoice.reference_date <= :end");
    });

    it("não aplica filtros quando query está vazia", async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getDashboard({});

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });
  });
});
