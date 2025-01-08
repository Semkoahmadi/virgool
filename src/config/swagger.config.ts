import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  SecurityRequirementObject,
  SecuritySchemeObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export function SwaggerConfigInit(app: INestApplication): void {
  const document = new DocumentBuilder()
    .setTitle('virgooz')
    .setDescription('bakend for goz')
    .setVersion('1.0')
    .addBearerAuth(SwaggerAuthConfig(),"Authorization")
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup('swagger', app, swaggerDocument);
}

function SwaggerAuthConfig(): SecuritySchemeObject {
  return {
    type: 'http',
    bearerFormat: 'JWT',
    in: 'header',
    scheme: 'bearer',
  }
}
