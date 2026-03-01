import "dotenv/config";
import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_SCHEMA ?? "lumis",
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/**/migrations/*.js"],
  synchronize: false,
  migrationsRun: true,
  extra: { bigNumberStrings: false },
  poolSize: 10,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
