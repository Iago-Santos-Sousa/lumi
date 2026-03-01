import { Test, TestingModule } from "@nestjs/testing";
import { InvoiceController } from "./invoice.controller";
import { InvoiceService } from "./invoice.service";
import { InvoiceRepository } from "./repositories/invoice.repository";

// mocks de dependências
const makeDashboardResult = (overrides = {}) => ({
  totals: {
    consumo_energia_eletrica_kwh: 2320,
    energia_compensada_kwh: 2220,
    valor_total_sem_gd: 1218.43,
    economia_gd: 1073.48,
  },
  chart: [
    {
      reference_month: "SET/2024",
      reference_date: new Date("2024-09-01"),
      consumo_energia_eletrica_kwh: 2320,
      energia_compensada_kwh: 2220,
      valor_total_sem_gd: 1218.43,
      economia_gd: 1073.48,
    },
  ],
  ...overrides,
});

const mockInvoiceService = {
  getDashboard: jest.fn(),
};

// suite
describe("InvoiceController", () => {
  let controller: InvoiceController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: InvoiceRepository, useValue: {} },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
  });

  it("deve ser definido", () => {
    expect(controller).toBeDefined();
  });

  // getDashboard
  describe("getDashboard", () => {
    it("delega a chamada para InvoiceService.getDashboard", async () => {
      const expected = makeDashboardResult();
      mockInvoiceService.getDashboard.mockResolvedValue(expected);

      const result = await controller.getDashboard({});

      expect(mockInvoiceService.getDashboard).toHaveBeenCalledWith({});
      expect(result).toEqual(expected);
    });

    it("passa os parâmetros de filtro corretamente ao serviço", async () => {
      const query = {
        client_number: "7202210726",
        initial_date: "2024-01-01",
        final_date: "2024-12-31",
      };
      mockInvoiceService.getDashboard.mockResolvedValue(makeDashboardResult());

      await controller.getDashboard(query);

      expect(mockInvoiceService.getDashboard).toHaveBeenCalledWith(query);
    });

    it("retorna totals com os quatro campos esperados", async () => {
      const expected = makeDashboardResult();
      mockInvoiceService.getDashboard.mockResolvedValue(expected);

      const result = await controller.getDashboard({});

      expect(result.totals).toHaveProperty("consumo_energia_eletrica_kwh");
      expect(result.totals).toHaveProperty("energia_compensada_kwh");
      expect(result.totals).toHaveProperty("valor_total_sem_gd");
      expect(result.totals).toHaveProperty("economia_gd");
    });

    it("retorna chart como array com os campos mensais esperados", async () => {
      const expected = makeDashboardResult();
      mockInvoiceService.getDashboard.mockResolvedValue(expected);

      const result = await controller.getDashboard({});

      expect(Array.isArray(result.chart)).toBe(true);
      expect(result.chart[0]).toHaveProperty("reference_month");
      expect(result.chart[0]).toHaveProperty("reference_date");
      expect(result.chart[0]).toHaveProperty("consumo_energia_eletrica_kwh");
      expect(result.chart[0]).toHaveProperty("economia_gd");
    });

    it("retorna chart vazio quando não há faturas no período", async () => {
      mockInvoiceService.getDashboard.mockResolvedValue({
        totals: {
          consumo_energia_eletrica_kwh: 0,
          energia_compensada_kwh: 0,
          valor_total_sem_gd: 0,
          economia_gd: 0,
        },
        chart: [],
      });

      const result = await controller.getDashboard({
        initial_date: "2099-01-01",
        final_date: "2099-12-31",
      });

      expect(result.chart).toHaveLength(0);
      expect(result.totals.consumo_energia_eletrica_kwh).toBe(0);
    });
  });
});
