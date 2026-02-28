import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from "typeorm";

import { Invoice } from "../../invoice/entities/invoice.entity";

@Entity("client")
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "client_number", type: "bigint", unique: true })
  client_number: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  name: string | null;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.client)
  invoices: Invoice[];
}
