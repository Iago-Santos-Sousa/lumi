"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
require("dotenv/config");
const typeorm_1 = require("typeorm");
exports.dataSourceOptions = {
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
const AppDataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map