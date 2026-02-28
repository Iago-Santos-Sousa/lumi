import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): { message: string; status: string; timestamp: string } {
    return {
      message: "Hello World!",
      status: "OK",
      timestamp: new Date().toISOString(),
    };
  }
}
