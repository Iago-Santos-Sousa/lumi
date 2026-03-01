import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ClientService } from "./client.service";
import { ListClientsParamsDto } from "./dto/list-clients-params.dto";
import { FindAllClientsPaginatedDocs, FindOneClientDocs } from "./client.docs";

@ApiTags("Client")
@ApiBearerAuth()
@Controller("client")
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  @FindAllClientsPaginatedDocs()
  findAllPaginated(@Query() params: ListClientsParamsDto) {
    return this.clientService.findAllPaginated(params);
  }

  @Get(":id")
  @FindOneClientDocs()
  findOne(@Param("id") id: string) {
    return this.clientService.findOne(+id);
  }
}
