# Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | NestJS 11 | Estructura modular, DI nativa, decoradores — escalable desde el inicio |
| ORM | Prisma 6 | Type-safe, migraciones declarativas, excelente DX con TypeScript |
| DB | Supabase PostgreSQL | Hosted, auth management, storage y realtime disponibles para futuras features |
| Auth | Better Auth | Soporta sesiones nativas + plugin `username` para niños sin email |
| Validación | Zod + nestjs-zod | Schema compartible con el frontend, integración nativa con Swagger |
| Config | @nestjs/config + Zod | Env vars validadas al arrancar, sin variables undefined en runtime |
| Docs | @nestjs/swagger | Auto-generado desde DTOs Zod, sin duplicar definiciones |
