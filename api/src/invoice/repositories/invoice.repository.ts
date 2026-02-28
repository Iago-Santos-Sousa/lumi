import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Invoice } from "../entities/invoice.entity";

@Injectable()
export class InvoiceRepository extends Repository<Invoice> {
  constructor(private dataSource: DataSource) {
    super(Invoice, dataSource.createEntityManager());
  }
}
