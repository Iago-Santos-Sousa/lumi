import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { Client } from "../../client/entities/client.entity";

@Entity("invoice")
@Unique(["client_id", "reference_date"]) // Uma fatura por cliente por mês
@Index(["client_id"])
@Index(["reference_date"])
@Index(["client_id", "reference_date"])
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  // ─── Relacionamento ───────────────────────────────────────────────────────

  @Column({ name: "client_id", type: "int" })
  client_id: number;

  @ManyToOne(() => Client, (client) => client.invoices, {
    onDelete: "CASCADE",
    eager: false,
  })
  @JoinColumn({ name: "client_id" })
  client: Client;

  // ─── Identificação do período ─────────────────────────────────────────────

  @Column({ name: "reference_month", type: "varchar", length: 12 })
  reference_month: string; // "SET/2024" — para exibição

  @Column({ name: "reference_date", type: "date" })
  reference_date: Date; // 2024-09-01 — para queries/filtros

  // ─── Dados brutos extraídos do PDF ───────────────────────────────────────

  @Column({ name: "client_name", type: "varchar", length: 255, nullable: true })
  client_name: string | null;

  @Column({
    name: "installation_number",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  installation_number: string | null;

  @Column({
    name: "energia_eletrica_kwh",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  energia_eletrica_kwh: number;

  @Column({
    name: "energia_eletrica_valor",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  energia_eletrica_valor: number;

  @Column({
    name: "energia_sceee_kwh",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  energia_sceee_kwh: number;

  @Column({
    name: "energia_sceee_valor",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  energia_sceee_valor: number;

  @Column({
    name: "energia_compensada_kwh",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  energia_compensada_kwh: number;

  @Column({
    name: "energia_compensada_valor",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  energia_compensada_valor: number; // Geralmente negativo (crédito GD)

  @Column({
    name: "contrib_ilum_publica",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  contrib_ilum_publica: number;

  // ─── Variáveis calculadas ─────────────────────────────────────────────────

  @Column({
    name: "consumo_energia_eletrica_kwh",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  consumo_energia_eletrica_kwh: number; // energia_eletrica_kwh + energia_sceee_kwh

  @Column({
    name: "valor_total_sem_gd",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  valor_total_sem_gd: number; // energia_eletrica_valor + energia_sceee_valor + contrib_ilum_publica

  @Column({
    name: "economia_gd",
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  economia_gd: number; // energia_compensada_valor (valor absoluto)

  // ─── Arquivo original ─────────────────────────────────────────────────────

  @Column({
    name: "pdf_filename",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  pdf_filename: string | null;

  @Column({ name: "pdf_path", type: "text", nullable: true })
  pdf_path: string | null;

  // ─── Timestamps ───────────────────────────────────────────────────────────

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
