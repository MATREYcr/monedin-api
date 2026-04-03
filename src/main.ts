import { NestFactory } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { env } from './config/configuration'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(new ZodValidationPipe())

  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Monedin API')
      .setDescription('Backend REST para la plataforma Monedin')
      .setVersion('1.0')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { withCredentials: true },
    })
  }

  const port = env.PORT
  await app.listen(port)
  console.log(`🚀 Monedin API corriendo en http://localhost:${port}`)
  console.log(`📚 Swagger disponible en http://localhost:${port}/docs`)
}
bootstrap()
