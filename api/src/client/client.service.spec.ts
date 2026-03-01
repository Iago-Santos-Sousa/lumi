import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { ClientService } from "./client.service";
import { ClientRepository } from "./repositories/client.repository";
import { Client } from "./entities/client.entity";
import { Invoice } from "src/invoice/entities/invoice.entity";
import { QueryRunner } from "typeorm";

// helpers
const makeClient = (overrides: Partial<Client> = {}): Client =>
  ({
    id: 1,
    client_number: 7202210726,
    name: "João Silva",
    created_at: new Date(),
    updated_at: new Date(),
    invoices: [],
    ...overrides,
  }) as Client;

// mocks de dependências
const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockClientRepository = {
  findOne: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockQueryRunnerManager = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockQueryRunner = {
  manager: mockQueryRunnerManager,
} as unknown as QueryRunner;

// suite
describe("ClientService", () => {
  let service: ClientService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockClientRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: ClientRepository, useValue: mockClientRepository },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  it("deve ser definido", () => {
    expect(service).toBeDefined();
  });

  // createClient
  describe("createClient", () => {
    it("retorna cliente existente sem criar um novo quando já está no banco", async () => {
      const existing = makeClient();
      mockQueryRunnerManager.findOne.mockResolvedValue(existing);

      const result = await service.createClient(mockQueryRunner, 7202210726);

      expect(mockQueryRunnerManager.findOne).toHaveBeenCalledWith(Client, {
        where: { client_number: 7202210726 },
      });
      expect(mockQueryRunnerManager.create).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });

    it("cria e persiste novo cliente quando não existe no banco", async () => {
      const newClient = makeClient();
      mockQueryRunnerManager.findOne.mockResolvedValue(null);
      mockQueryRunnerManager.create.mockReturnValue(newClient);
      mockQueryRunnerManager.save.mockResolvedValue(newClient);

      const result = await service.createClient(mockQueryRunner, 7202210726);

      expect(mockQueryRunnerManager.create).toHaveBeenCalledWith(Client, {
        client_number: 7202210726,
        name: null,
      });
      expect(mockQueryRunnerManager.save).toHaveBeenCalledWith(
        Client,
        newClient,
      );
      expect(result).toEqual(newClient);
    });
  });

  // findAllPaginated
  describe("findAllPaginated", () => {
    it("usa paginação padrão (page=1, limit=5) quando não informada", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAllPaginated({});

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.page).toBe(1);
      expect(result.pageTotal).toBe(0);
    });

    it("usa valores de page e limit quando informados", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllPaginated({ page: 3, limit: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20); // (3-1)*10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it("calcula pageTotal corretamente com total e limit informados", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 23]);

      const result = await service.findAllPaginated({ page: 1, limit: 5 });

      expect(result.total).toBe(23);
      expect(result.pageTotal).toBe(5); // ceil(23/5)
    });

    it("aplica filtro de clientName na query", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllPaginated({ clientName: "João" });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "unaccent(client.name) ILIKE unaccent(:name)",
        { name: "%João%" },
      );
    });

    it("aplica filtro de client_number na query", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllPaginated({ client_number: 7202210726 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "client.client_number = :client_number",
        { client_number: 7202210726 },
      );
    });

    it("aplica filtro de reference_month na query", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllPaginated({ reference_month: "SET/2024" });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "invoice.reference_month = :reference_month",
        { reference_month: "SET/2024" },
      );
    });

    it("aplica filtro de intervalo de datas quando initial_date e final_date são informados", async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllPaginated({
        initial_date: "2024-01-01",
        final_date: "2024-12-31",
      });

      const whereCalls = (
        mockQueryBuilder.andWhere.mock.calls as [string, ...unknown[]][]
      ).map(([condition]) => condition);
      expect(whereCalls).toContain(
        "invoice.reference_date BETWEEN :initialDate AND :finalDate",
      );
    });

    it("retorna a lista de resultados com total e paginação", async () => {
      const clients = [makeClient(), makeClient({ id: 2 })];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([clients, 2]);

      const result = await service.findAllPaginated({ page: 1, limit: 5 });

      expect(result.results).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  // findByClientIdAndReferenceMonth
  describe("findByClientIdAndReferenceMonth", () => {
    it("lança ConflictException quando o cliente não é encontrado", async () => {
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByClientIdAndReferenceMonth(99, "SET-2024", 1),
      ).rejects.toThrow(ConflictException);
    });

    it("lança ConflictException quando a fatura não é encontrada para o mês", async () => {
      const client = makeClient({
        invoices: [
          { id: 1, reference_month: "JAN/2024" } as unknown as Invoice,
        ],
      });
      mockClientRepository.findOne.mockResolvedValue(client);

      await expect(
        service.findByClientIdAndReferenceMonth(1, "SET-2024", 1),
      ).rejects.toThrow(ConflictException);
    });

    it("normaliza o separador de mês de hífen para barra (SET-2024 → SET/2024)", async () => {
      const client = makeClient({
        invoices: [
          { id: 42, reference_month: "SET/2024" } as unknown as Invoice,
        ],
      });
      mockClientRepository.findOne.mockResolvedValue(client);

      const result = await service.findByClientIdAndReferenceMonth(
        1,
        "SET-2024",
        42,
      );

      expect(result.invoices[0].reference_month).toBe("SET/2024");
    });

    it("retorna o cliente com apenas a fatura do mês solicitado", async () => {
      const targetInvoice = {
        id: 42,
        reference_month: "SET/2024",
      } as unknown as Invoice;
      const client = makeClient({
        invoices: [
          { id: 10, reference_month: "JAN/2024" } as unknown as Invoice,
          targetInvoice,
        ],
      });
      mockClientRepository.findOne.mockResolvedValue(client);

      const result = await service.findByClientIdAndReferenceMonth(
        1,
        "SET-2024",
        42,
      );

      expect(result.invoices).toHaveLength(1);
      expect(result.invoices[0]).toEqual(targetInvoice);
    });
  });

  // findOne
  describe("findOne", () => {
    it("lança ConflictException quando cliente com o ID não existe", async () => {
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(ConflictException);
    });

    it("retorna o cliente com suas faturas", async () => {
      const client = makeClient();
      mockClientRepository.findOne.mockResolvedValue(client);

      const result = await service.findOne(1);

      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["invoices"],
      });
      expect(result).toEqual(client);
    });
  });
});
