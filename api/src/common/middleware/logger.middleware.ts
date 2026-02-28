import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start: number = Date.now();
    console.log(
      `Requisição feita no endpoint: ${req.url}, com o método: ${req.method}`,
    );

    // Intercepta o método original para obter o status
    const originalSend = res.send;
    res.send = function (body) {
      console.log(
        `Response do endpoint: ${req.baseUrl}\n status: ${res.statusCode} \n data: ${body}`,
      );
      console.log(`Tempo - ${Date.now() - start}ms`);
      return originalSend.call(this, body) as Response;
    };

    next();
  }
}
