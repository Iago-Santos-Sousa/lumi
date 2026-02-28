import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from "@nestjs/swagger";

async function bootstrap() {
  // Create the HTTP app for Swagger and REST endpoints
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: ["Content-Disposition"],
  });

  app.setGlobalPrefix("/api");

  const config = new DocumentBuilder()
    .setTitle("Users example")
    .setDescription("The users API description")
    .setVersion("1.0")
    .addTag("Users")
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      in: "header",
      name: "Authorization",
    })
    .addSecurityRequirements("bearer")
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup("api", app, document);

  // Start the HTTP server
  await app.listen(process.env.APP_PORT ?? 3001);
}

bootstrap()
  .then(() =>
    console.log(`Server running on port: ${process.env.APP_PORT ?? 3001}`),
  )
  .catch((err) => console.error(err));
