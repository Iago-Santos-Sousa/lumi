import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiExcludeController, ApiOperation } from "@nestjs/swagger";
import { Public } from "./common/decorators/skipAuth.decorator";

@Controller("status")
// @ApiExcludeController()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "API Status", security: [] })
  getHello() {
    return this.appService.getHello();
  }
}
