import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ClientService } from "./client.service";
import { ClientController } from "./client.controller";
import { Client } from "./entities/client.entity";
import { ClientRepository } from "./repositories/client.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientController],
  providers: [ClientService, ClientRepository],
  exports: [ClientService],
})
export class ClientModule {}
