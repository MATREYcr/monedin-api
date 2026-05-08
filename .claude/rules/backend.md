# Backend — NestJS

## Flujo de request
```
Request → AuthGuard → ZodValidationPipe → Controller → Service → PrismaService → DB
```

## Estructura de un módulo
```
src/[feature]/
├── [feature].module.ts
├── [feature].controller.ts   ← recibe HTTP, llama al servicio
├── [feature].service.ts      ← lógica de negocio + acceso a DB
└── dto/
    ├── create-[feature].dto.ts
    └── update-[feature].dto.ts
```

## Reglas
- Controllers: solo recibir/responder HTTP, delegar lógica al servicio
- Services: toda la lógica de negocio y acceso a Prisma
- DTOs: siempre `createZodDto()` de nestjs-zod, nunca `class-validator`
- `PrismaModule` es global — inyectar `PrismaService` directamente, no importar el módulo
- Registrar cada módulo nuevo en `app.module.ts`

## Guards y decoradores globales
- `AuthGuard` — activo en todas las rutas por defecto
- `@Public()` — exime una ruta del guard
- `@CurrentUser()` — inyecta el usuario autenticado en el handler
- `AllExceptionsFilter` — captura y formatea todos los errores

## Módulos activos
`auth` · `children` · `tasks` · `rewards`
