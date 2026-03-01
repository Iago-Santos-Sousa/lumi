import { applyDecorators } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

export const GetDashboardDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary:
        "Obter dados do dashboard com totais de consumo e compensação de energia agrupados por mês",
      description:
        "Retorna os totais acumulados de todas as faturas filtradas e um array de série temporal agrupado por mês de referência. " +
        "É possível filtrar opcionalmente pelo número do cliente e/ou intervalo de datas.",
    }),
    ApiOkResponse({
      description: "Totais do dashboard e dados do gráfico mensal",
      schema: {
        type: "object",
        properties: {
          totals: {
            type: "object",
            description: "Totais acumulados de todas as faturas filtradas",
            properties: {
              consumo_energia_eletrica_kwh: {
                type: "number",
                description:
                  "Consumo total de energia elétrica (kWh) = energia_eletrica_kwh + energia_sceee_kwh",
                example: 27840,
              },
              energia_compensada_kwh: {
                type: "number",
                description: "Total de energia GD compensada (kWh)",
                example: 26640,
              },
              valor_total_sem_gd: {
                type: "number",
                description:
                  "Valor total das faturas sem desconto GD (R$) = energia_eletrica_valor + energia_sceee_valor + contrib_ilum_publica",
                example: 14624.28,
              },
              economia_gd: {
                type: "number",
                description:
                  "Total de economia GD (valor absoluto de energia_compensada_valor) (R$)",
                example: 12881.76,
              },
            },
          },
          chart: {
            type: "array",
            description:
              "Dados de série temporal agrupados por mês de referência, ordenados cronologicamente",
            items: {
              type: "object",
              properties: {
                reference_month: {
                  type: "string",
                  description: 'Rótulo do mês de referência (ex: "SET/2024")',
                  example: "SET/2024",
                },
                reference_date: {
                  type: "string",
                  format: "date",
                  description:
                    "Primeiro dia do mês de referência (data ISO 8601)",
                  example: "2024-09-01",
                },
                consumo_energia_eletrica_kwh: {
                  type: "number",
                  description: "Consumo de energia elétrica no mês (kWh)",
                  example: 2320,
                },
                energia_compensada_kwh: {
                  type: "number",
                  description: "Energia GD compensada no mês (kWh)",
                  example: 2220,
                },
                valor_total_sem_gd: {
                  type: "number",
                  description: "Valor da fatura sem desconto GD no mês (R$)",
                  example: 1218.69,
                },
                economia_gd: {
                  type: "number",
                  description: "Economia GD no mês (R$)",
                  example: 1073.48,
                },
              },
            },
            example: [
              {
                reference_month: "JAN/2024",
                reference_date: "2024-01-01",
                consumo_energia_eletrica_kwh: 2100,
                energia_compensada_kwh: 2000,
                valor_total_sem_gd: 1150.25,
                economia_gd: 967.43,
              },
              {
                reference_month: "FEV/2024",
                reference_date: "2024-02-01",
                consumo_energia_eletrica_kwh: 1980,
                energia_compensada_kwh: 1880,
                valor_total_sem_gd: 1085.12,
                economia_gd: 909.28,
              },
              {
                reference_month: "SET/2024",
                reference_date: "2024-09-01",
                consumo_energia_eletrica_kwh: 2320,
                energia_compensada_kwh: 2220,
                valor_total_sem_gd: 1218.69,
                economia_gd: 1073.48,
              },
            ],
          },
        },
      },
    }),
  );
};
