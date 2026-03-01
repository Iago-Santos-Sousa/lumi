// import { registerAs } from "@nestjs/config";
// import { TypeOrmModuleOptions } from "@nestjs/typeorm";
// import { dataSourceOptions } from "../../data-source";

// /**
//  * Configuração do banco de dados para o módulo TypeORM do NestJS.
//  * Estende as opções base de data-source.ts sobrescrevendo os valores
//  * específicos ao ambiente de runtime da aplicação.
//  */
// export default registerAs(
//   "database",
//   (): TypeOrmModuleOptions => ({
//     ...dataSourceOptions,
//     // Em desenvolvimento pode-se usar synchronize=true via .env;
//     // em produção deve ser false e as migrations tratam o schema.
//     synchronize: Boolean(process.env.DB_SYNCHRONIZE),
//     // Executa automaticamente as migrations pendentes ao subir a aplicação.
//     migrationsRun: true,
//     // Em runtime o app usa os arquivos JS compilados.
//     migrations: ["dist/**/migrations/*.js"],
//   }),
// );
