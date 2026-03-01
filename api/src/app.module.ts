import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { InvoiceModule } from "./invoice/invoice.module";
import { ClientModule } from "./client/client.module";
import { UploadModule } from "./upload/upload.module";
// import databaseConfig from "./config/database.config";
import AppDataSource from "data-source";

@Module({
  imports: [
    // Configuração do módulo de configuração global. Carrega as variáveis de ambiente do arquivo .env e as configurações do banco
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      // load: [databaseConfig],
    }),

    TypeOrmModule.forRoot(AppDataSource.options),

    AuthModule,
    UserModule,
    InvoiceModule,
    ClientModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // Injeta o DataSource para configurar o middleware. Isso é necessário para que o middleware tenha acesso ao banco de dados, se necessário
  constructor(private dataSource: DataSource) {}

  // Configura o middleware globalmente. O LoggerMiddleware será aplicado a todas as rotas do aplicativo
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("/");
  }
}
