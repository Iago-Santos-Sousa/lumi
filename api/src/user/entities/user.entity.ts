import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: "user_id" })
  user_id: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("varchar", { name: "email", length: 100, unique: true })
  email: string;

  @Column("varchar", { name: "password", length: 255 })
  password: string;

  @Column("varchar", { name: "role", length: 20 })
  role: string;

  @Column("varchar", { name: "refresh_token", nullable: true, default: "" })
  refresh_token?: string;

  @Column("varchar", {
    name: "reset_token",
    nullable: true,
    default: null,
    unique: true,
    length: 255,
  })
  reset_token?: string;

  @Column({
    name: "reset_token_expiry",
    nullable: true,
    default: null,
    type: "bigint",
    unsigned: true,
  })
  reset_token_expiry?: number;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  created_at: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at: Date;
}
