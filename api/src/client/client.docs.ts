import { applyDecorators } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

const invoiceProperties = {
  id: { type: "number", example: 42 },
  client_id: { type: "number", example: 1 },
  reference_month: { type: "string", example: "SET/2024" },
  reference_date: { type: "string", format: "date", example: "2024-09-01" },
  client_name: { type: "string", example: "João Silva" },
  installation_number: { type: "string", example: "3001422762" },
  energia_eletrica_kwh: { type: "number", example: 100 },
  energia_eletrica_valor: { type: "number", example: 95.78 },
  energia_sceee_kwh: { type: "number", example: 2220 },
  energia_sceee_valor: { type: "number", example: 1073.48 },
  energia_compensada_kwh: { type: "number", example: 2220 },
  energia_compensada_valor: { type: "number", example: -1073.48 },
  contrib_ilum_publica: { type: "number", example: 49.43 },
  consumo_energia_eletrica_kwh: { type: "number", example: 2320 },
  valor_total_sem_gd: { type: "number", example: 1218.69 },
  economia_gd: { type: "number", example: 1073.48 },
  pdf_filename: { type: "string", example: "7202210726-SET-2024.pdf" },
  pdf_path: {
    type: "string",
    example: "uploads/invoices/7202210726-SET-2024.pdf",
  },
  created_at: {
    type: "string",
    format: "date-time",
    example: "2024-09-15T12:00:00.000Z",
  },
  updated_at: {
    type: "string",
    format: "date-time",
    example: "2024-09-15T12:00:00.000Z",
  },
};

const clientProperties = {
  id: { type: "number", example: 1 },
  client_number: { type: "number", example: 7202210726 },
  name: { type: "string", example: "João Silva" },
  created_at: {
    type: "string",
    format: "date-time",
    example: "2024-01-15T10:30:00.000Z",
  },
  updated_at: {
    type: "string",
    format: "date-time",
    example: "2024-09-01T08:00:00.000Z",
  },
  invoices: {
    type: "array",
    items: {
      type: "object",
      properties: invoiceProperties,
    },
  },
};

export const FindAllClientsPaginatedDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: "Listar clientes com paginação e filtros opcionais",
    }),
    ApiQuery({
      name: "clientName",
      required: false,
      type: String,
      description: "Filtrar pelo nome do cliente (correspondência parcial)",
      example: "João Silva",
    }),
    ApiQuery({
      name: "client_number",
      required: false,
      type: Number,
      description: "Filtrar pelo número do cliente CEMIG",
      example: 7202210726,
    }),
    ApiQuery({
      name: "reference_month",
      required: false,
      type: String,
      description: 'Filtrar pelo mês de referência (ex: "SET/2024")',
      example: "SET/2024",
    }),
    ApiQuery({
      name: "reference_date",
      required: false,
      type: String,
      description: "Filtrar faturas pela data de referência exata (AAAA-MM-DD)",
      example: "2024-09-01",
    }),
    ApiQuery({
      name: "pdf_filename",
      required: false,
      type: String,
      description: "Filtrar pelo nome do arquivo PDF (correspondência parcial)",
      example: "7202210726-SET-2024.pdf",
    }),
    ApiQuery({
      name: "initial_date",
      required: false,
      type: String,
      description: "Data inicial do intervalo de filtro (AAAA-MM-DD)",
      example: "2024-01-01",
    }),
    ApiQuery({
      name: "final_date",
      required: false,
      type: String,
      description: "Data final do intervalo de filtro (AAAA-MM-DD)",
      example: "2024-12-31",
    }),
    ApiQuery({
      name: "page",
      required: false,
      type: Number,
      description: "Número da página (padrão: 1)",
      example: 1,
    }),
    ApiQuery({
      name: "limit",
      required: false,
      type: Number,
      description: "Quantidade de resultados por página (padrão: 5)",
      example: 5,
    }),
    ApiOkResponse({
      description: "Lista paginada de clientes com suas faturas",
      schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: clientProperties,
            },
          },
          page: { type: "number", example: 1 },
          total: { type: "number", example: 25 },
          pageTotal: { type: "number", example: 5 },
        },
      },
    }),
  );
};

export const FindOneClientDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: "Buscar um cliente pelo ID com todas as suas faturas",
    }),
    ApiParam({
      name: "id",
      type: Number,
      description: "ID do cliente",
      example: 1,
    }),
    ApiOkResponse({
      description: "Dados do cliente com as faturas associadas",
      schema: {
        type: "object",
        properties: clientProperties,
      },
    }),
  );
};
