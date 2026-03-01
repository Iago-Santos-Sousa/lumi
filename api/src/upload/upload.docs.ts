import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from "@nestjs/swagger";

const invoiceResponseProperties = {
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

export const UploadFilesDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: "Enviar um ou mais arquivos PDF de fatura",
      description:
        "Aceita até 10 arquivos PDF (máximo 500 KB cada). " +
        "Extrai os dados da fatura de cada PDF, persiste clientes e faturas no banco de dados " +
        "e salva os arquivos em disco. Retorna uma lista de envios bem-sucedidos e com falha.",
    }),
    ApiConsumes("multipart/form-data"),
    ApiBody({
      description:
        "Um ou mais arquivos PDF de fatura CEMIG (máximo 10 arquivos, 500 KB cada)",
      schema: {
        type: "object",
        required: ["files"],
        properties: {
          files: {
            type: "array",
            items: {
              type: "string",
              format: "binary",
            },
            description: "Arquivos PDF das faturas",
          },
        },
      },
    }),
    ApiOkResponse({
      description: "Resultado do envio com entradas bem-sucedidas e com falha",
      schema: {
        type: "object",
        properties: {
          succeeded: {
            type: "array",
            description: "Arquivos processados e persistidos com sucesso",
            items: {
              type: "object",
              properties: {
                filename: {
                  type: "string",
                  description: "Nome com o qual o arquivo foi salvo em disco",
                  example: "7202210726-SET-2024.pdf",
                },
                originalname: {
                  type: "string",
                  description: "Nome original do arquivo enviado pelo cliente",
                  example: "7202210726-SET-2024.pdf",
                },
                mimetype: {
                  type: "string",
                  description: "Tipo MIME do arquivo enviado",
                  example: "application/pdf",
                },
                size: {
                  type: "number",
                  description: "Tamanho do arquivo em bytes",
                  example: 204800,
                },
                invoice: {
                  type: "object",
                  description:
                    "Registro da fatura extraída do PDF e persistida no banco",
                  properties: invoiceResponseProperties,
                },
              },
            },
            example: [
              {
                filename: "7202210726-SET-2024.pdf",
                originalname: "7202210726-SET-2024.pdf",
                mimetype: "application/pdf",
                size: 204800,
                invoice: {
                  id: 42,
                  client_id: 1,
                  reference_month: "SET/2024",
                  reference_date: "2024-09-01",
                  client_name: "João Silva",
                  installation_number: "3001422762",
                  energia_eletrica_kwh: 100,
                  energia_eletrica_valor: 95.78,
                  energia_sceee_kwh: 2220,
                  energia_sceee_valor: 1073.48,
                  energia_compensada_kwh: 2220,
                  energia_compensada_valor: -1073.48,
                  contrib_ilum_publica: 49.43,
                  consumo_energia_eletrica_kwh: 2320,
                  valor_total_sem_gd: 1218.69,
                  economia_gd: 1073.48,
                  pdf_filename: "7202210726-SET-2024.pdf",
                  pdf_path: "uploads/invoices/7202210726-SET-2024.pdf",
                  created_at: "2024-09-15T12:00:00.000Z",
                  updated_at: "2024-09-15T12:00:00.000Z",
                },
              },
            ],
          },
          failed: {
            type: "array",
            description: "Arquivos que não puderam ser processados",
            items: {
              type: "object",
              properties: {
                filename: {
                  type: "string",
                  description: "Nome original do arquivo com falha",
                  example: "documento.docx",
                },
                error: {
                  type: "string",
                  description:
                    "Mensagem de erro descrevendo o motivo da falha no envio",
                  example: "Tipo de arquivo inválido. Apenas PDF é permitido.",
                },
              },
            },
            example: [
              {
                filename: "documento.docx",
                error: "Tipo de arquivo inválido. Apenas PDF é permitido.",
              },
              {
                filename: "fatura-gigante.pdf",
                error: "Arquivo muito grande. Máximo permitido: 500.00 KB",
              },
            ],
          },
        },
      },
    }),
  );
};

export const DownloadFileDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary:
        "Baixar PDF da fatura pelo ID do cliente, mês de referência e ID da fatura",
      description:
        "Retorna o arquivo PDF como um anexo binário. " +
        "O mês de referência deve usar hífen como separador (ex: SET-2024).",
    }),
    ApiParam({
      name: "client_id",
      type: Number,
      description: "ID interno do cliente",
      example: 1,
    }),
    ApiParam({
      name: "reference_month",
      type: String,
      description:
        'Mês de referência no formato MES-AAAA (separado por hífen, ex: "SET-2024")',
      example: "SET-2024",
    }),
    ApiParam({
      name: "invoice_id",
      type: Number,
      description: "ID da fatura",
      example: 42,
    }),
    ApiOkResponse({
      description:
        "Arquivo PDF retornado como anexo binário (Content-Disposition: attachment)",
      content: {
        "application/pdf": {
          schema: {
            type: "string",
            format: "binary",
          },
        },
      },
    }),
  );
};
