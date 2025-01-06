import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function SwaggerConfigInit(app: INestApplication): void {
  const document = new DocumentBuilder()
    .setTitle('virgooz')
    .setDescription('bakend for goz')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup('swagger', app, swaggerDocument);
}
