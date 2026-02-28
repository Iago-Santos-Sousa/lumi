import { ConflictException, Injectable } from "@nestjs/common";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { QueryRunner } from "typeorm/query-runner/QueryRunner";
import { InvoiceRepository } from "./repositories/invoice.repository";
import { Invoice } from "./entities/invoice.entity";
import { ExtractedInvoiceData } from "src/common/interfaces";
import { Client } from "src/client/entities/client.entity";
import { DashboardQueryDto } from "./dto/dashboard-query.dto";

@Injectable()
export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  create(createInvoiceDto: CreateInvoiceDto) {
    return "This action adds a new invoice";
  }

  async createInvoice(
    queryRunner: QueryRunner,
    data: ExtractedInvoiceData,
    client: Client,
    filename: string,
    filePath: string,
  ) {
    const invoice = await this.invoiceRepository.findOne({
      where: { client_id: client.id, reference_month: data.reference_month },
    });

    if (invoice) {
      throw new ConflictException(
        `Já existe uma fatura cadastrada para o cliente ${data.client_number} ` +
          `referente a ${data.reference_month}.`,
      );
    }

    const invoiceCreate = queryRunner.manager.create(Invoice, {
      client_id: client.id,
      client,

      client_name: data.client_name,
      installation_number: data.installation_number,

      reference_month: data.reference_month,
      reference_date: data.reference_date,

      energia_eletrica_kwh: data.energia_eletrica_kwh,
      energia_eletrica_valor: data.energia_eletrica_valor,
      energia_sceee_kwh: data.energia_sceee_kwh,
      energia_sceee_valor: data.energia_sceee_valor,
      energia_compensada_kwh: data.energia_compensada_kwh,
      energia_compensada_valor: data.energia_compensada_valor,
      contrib_ilum_publica: data.contrib_ilum_publica,

      consumo_energia_eletrica_kwh: data.consumo_energia_eletrica_kwh,
      valor_total_sem_gd: data.valor_total_sem_gd,
      economia_gd: data.economia_gd,

      pdf_filename: filename,
      pdf_path: filePath,
    });

    return await queryRunner.manager.save(Invoice, invoiceCreate);
  }

  findAll() {
    return `This action returns all invoice`;
  }

  /**
   * Retorna os dados consolidados para o dashboard.
   *
   * Filtros opcionais:
   *   - client_number : exibe apenas faturas de um cliente
   *   - initial_date  : data inicial do período (reference_date >= initial_date)
   *   - final_date    : data final do período   (reference_date <= final_date)
   *
   * Retorna:
   *   - totals : somatórios acumulados de todas as variáveis de interesse
   *   - chart  : série temporal agrupada por mês (reference_month), ordenada
   *              cronologicamente — usada para plotar os dois gráficos do front
   */
  async getDashboard(query: DashboardQueryDto) {
    const { client_number, initial_date, final_date } = query;

    const qb = this.invoiceRepository
      .createQueryBuilder("invoice")
      .leftJoin("invoice.client", "client");

    if (client_number) {
      qb.andWhere("client.client_number = :client_number", {
        client_number: Number(client_number),
      });
    }

    if (initial_date) {
      const start = new Date(initial_date);
      start.setUTCHours(0, 0, 0, 0);
      qb.andWhere("invoice.reference_date >= :start", { start });
    }

    if (final_date) {
      const end = new Date(final_date);
      end.setUTCHours(23, 59, 59, 999);
      qb.andWhere("invoice.reference_date <= :end", { end });
    }

    const invoices: Invoice[] = await qb
      .orderBy("invoice.reference_date", "ASC")
      .getMany();

    // ── Totais acumulados (cards do dashboard) ──────────────────────────────
    const totals = invoices.reduce(
      (acc, inv) => ({
        consumo_energia_eletrica_kwh:
          acc.consumo_energia_eletrica_kwh +
          Number(inv.consumo_energia_eletrica_kwh),
        energia_compensada_kwh:
          acc.energia_compensada_kwh + Number(inv.energia_compensada_kwh),
        valor_total_sem_gd:
          acc.valor_total_sem_gd + Number(inv.valor_total_sem_gd),
        economia_gd: acc.economia_gd + Number(inv.economia_gd),
      }),
      {
        consumo_energia_eletrica_kwh: 0,
        energia_compensada_kwh: 0,
        valor_total_sem_gd: 0,
        economia_gd: 0,
      },
    );

    // ── Série temporal por mês (pontos dos gráficos) ────────────────────────
    // Agrupa por reference_month preservando a ordem cronológica (já ordenada
    // pela query). Cada entrada representa um ponto no eixo X dos gráficos.
    const monthMap = new Map<
      string,
      {
        reference_month: string;
        reference_date: Date;
        consumo_energia_eletrica_kwh: number;
        energia_compensada_kwh: number;
        valor_total_sem_gd: number;
        economia_gd: number;
      }
    >();

    for (const inv of invoices) {
      const key = inv.reference_month;

      if (!monthMap.has(key)) {
        monthMap.set(key, {
          reference_month: inv.reference_month,
          reference_date: inv.reference_date,
          consumo_energia_eletrica_kwh: 0,
          energia_compensada_kwh: 0,
          valor_total_sem_gd: 0,
          economia_gd: 0,
        });
      }

      const entry = monthMap.get(key)!;
      entry.consumo_energia_eletrica_kwh += Number(
        inv.consumo_energia_eletrica_kwh,
      );

      entry.energia_compensada_kwh += Number(inv.energia_compensada_kwh);
      entry.valor_total_sem_gd += Number(inv.valor_total_sem_gd);
      entry.economia_gd += Number(inv.economia_gd);
    }

    return {
      totals,
      chart: Array.from(monthMap.values()),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} invoice`;
  }

  update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return `This action updates a #${id} invoice`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoice`;
  }
}
