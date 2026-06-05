import { NestFactory } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { env } from './config/configuration'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'warn', 'error', 'debug'] })

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(new ZodValidationPipe())

  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Monedin API')
      .setDescription('REST backend for the Monedin platform')
      .setVersion('1.0')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { withCredentials: true },
    })
  }

  const port = env.PORT
  await app.listen(port)
  console.log(`🪙 Monedin API running on http://localhost:${port}`)
  console.log(`📚 Swagger available at http://localhost:${port}/docs`)
}
bootstrap()
