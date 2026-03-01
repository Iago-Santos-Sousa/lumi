import { ConflictException, Injectable } from "@nestjs/common";
import { Client } from "./entities/client.entity";
import { ClientRepository } from "./repositories/client.repository";
import { QueryRunner } from "typeorm/query-runner/QueryRunner";
import { ListClientsParamsDto } from "./dto/list-clients-params.dto";

@Injectable()
export class ClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async createClient(queryRunner: QueryRunner, client_number: number) {
    let client = await queryRunner.manager.findOne(Client, {
      where: { client_number },
    });

    if (!client) {
      const clientCreate = queryRunner.manager.create(Client, {
        client_number: client_number,
        name: null,
      });

      client = await queryRunner.manager.save(Client, clientCreate);
    }

    return client;
  }

  async findAllPaginated(params: ListClientsParamsDto) {
    const {
      clientName,
      final_date,
      initial_date,
      limit,
      page,
      pdf_filename,
      reference_date,
      reference_month,
      client_number,
    } = params;

    let limitNumber = limit;
    let pageNumber = page;

    if (!limitNumber || !pageNumber) {
      limitNumber = 5;
      pageNumber = 1;
    }

    const queryBuilder = this.clientRepository.createQueryBuilder("client");

    queryBuilder.leftJoinAndSelect("client.invoices", "invoice");

    queryBuilder.orderBy("client.created_at", "ASC");

    if (clientName) {
      queryBuilder.andWhere("unaccent(client.name) ILIKE unaccent(:name)", {
        name: `%${clientName}%`,
      });
    }

    if (pdf_filename) {
      queryBuilder.andWhere(
        "unaccent(invoice.pdf_filename) ILIKE unaccent(:pdf_filename)",
        {
          pdf_filename: `%${pdf_filename}%`,
        },
      );
    }

    if (reference_date) {
      queryBuilder.andWhere("invoice.reference_date = :reference_date", {
        reference_date,
      });
    }

    if (reference_month) {
      queryBuilder.andWhere("invoice.reference_month = :reference_month", {
        reference_month,
      });
    }

    if (client_number) {
      queryBuilder.andWhere("client.client_number = :client_number", {
        client_number,
      });
    }

    if (initial_date && final_date) {
      const initialDate = new Date(initial_date);
      initialDate.setUTCHours(0, 0, 0, 0);

      const finalDate = new Date(final_date);
      finalDate.setUTCHours(23, 59, 59, 999);

      queryBuilder.andWhere(
        "invoice.reference_date BETWEEN :initialDate AND :finalDate",
        {
          initialDate,
          finalDate,
        },
      );
    }

    queryBuilder.skip((pageNumber - 1) * limitNumber).take(limitNumber);

    const [results, total] = await queryBuilder.getManyAndCount();

    return {
      results,
      page: pageNumber,
      total,
      pageTotal: Math.ceil(total / limitNumber),
    };
  }

  async findByClientIdAndReferenceMonth(
    client_id: number,
    reference_month: string,
    invoice_id: number,
  ) {
    reference_month = reference_month.replace("-", "/");

    const client = await this.clientRepository.findOne({
      where: { id: client_id },
      relations: ["invoices"],
    });

    if (!client) {
      throw new ConflictException(
        `Cliente com ID ${client_id} não encontrado.`,
      );
    }

    const invoice = client.invoices.find(
      (inv) => inv.reference_month === reference_month && inv.id === invoice_id,
    );

    if (!invoice) {
      throw new ConflictException(
        `Fatura para o cliente ${client_id} referente a ${reference_month} não encontrada.`,
      );
    }

    client.invoices = [invoice];
    return client;
  }

  async findOne(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ["invoices"],
    });

    if (!client) {
      throw new ConflictException(`Cliente com ID ${id} não encontrado.`);
    }

    return client;
  }
}
