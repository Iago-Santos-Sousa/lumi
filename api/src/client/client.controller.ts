import { Controller, Get, Param, Query } from "@nestjs/common";
import { ClientService } from "./client.service";
import { ListClientsParamsDto } from "./dto/list-clients-params.dto";

@Controller("client")
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  findAllPaginated(@Query() params: ListClientsParamsDto) {
    return this.clientService.findAllPaginated(params);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.clientService.findOne(+id);
  }
}
