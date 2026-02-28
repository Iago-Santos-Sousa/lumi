import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Invoice } from "src/invoice/entities/invoice.entity";
import { Client } from "src/client/entities/client.entity";

export default registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    entities: [User, Client, Invoice],
    synchronize: Boolean(process.env.DB_SYNCHRONIZE),
    poolSize: 10,
    extra: { bigNumberStrings: false },
    // migrations: [`${__dirname}/migration/{.ts,*.js}`],
    // migrationsRun: true,
  }),
);
