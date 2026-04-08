# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**monedin-api** — Backend REST API para Monedín, plataforma de educación financiera para niños (6–11 años).
Roles: **PADRE** (gestiona familia, tareas, premios, retos) y **NINO** (completa tareas, canjea premios, estudia lecciones).

## Stack

- NestJS 11 + TypeScript
- Prisma 6 + Supabase PostgreSQL
- Better Auth (autenticación — emailAndPassword para padres, username plugin para niños)
- nestjs-zod v5 + Zod v4 (validación de DTOs)
- @nestjs/config (env vars tipadas con Zod)
- @nestjs/swagger (docs en `/docs`)

## Skills / Convenciones

- **`/nest-stack`** — para crear módulos, controladores, servicios, guards, DTOs, schemas
- **`/git-flow`** — para TODAS las operaciones git: ramas, commits, PRs, merges

## Comandos

```bash
pnpm run start:dev                           # servidor en watch mode
pnpm run build                               # compilar TypeScript
pnpm run lint                                # ESLint
pnpm run test                                # tests unitarios
pnpm run test:cov                            # cobertura
pnpm run test -- --testPathPattern=src/path/to/file.spec.ts  # un solo test
```

```bash
pnpm exec prisma generate                    # regenerar Prisma Client (tras cambiar schema)
pnpm exec prisma migrate dev --name <name>   # nueva migración (desarrollo)
pnpm exec prisma migrate deploy              # aplicar migraciones (producción)
pnpm exec prisma studio                      # GUI visual de la DB
```

## Arquitectura

```
Request → AuthGuard (Better Auth) → ZodValidationPipe → Controller → Service → PrismaService → DB
```

### Módulos registrados en app.module.ts
- `ConfigModule` — global, valida env vars al arrancar con Zod
- `PrismaModule` — global, inyectable en cualquier servicio
- `AuthModule` — maneja todas las rutas `/api/auth/*` via Better Auth

### Guards y decoradores globales
- `AuthGuard` — aplicado globalmente vía `APP_GUARD`; valida sesión Better Auth en cada request
- `@Public()` — exime una ruta del guard (usado en `AuthController`)
- `@CurrentUser()` — inyecta el usuario de la sesión en un parámetro del handler
- `AllExceptionsFilter` — aplicado globalmente vía `APP_FILTER`

### Auth — dos tipos de login
- **Padres**: email + password (`betterAuth.emailAndPassword`)
- **Niños**: username + password (`username()` plugin de Better Auth); creados por el padre vía `POST /children`, no se registran solos

### Modelo de datos clave
```
User {
  role: PADRE | NINO
  parentId: String?    // null para padres; apunta al padre para niños
  coins: Int           // saldo de monedas del niño
  username: String?    // solo niños
  email: String?       // solo padres
}
```

### Agregar un módulo nuevo
1. Crear carpeta `src/[feature]/` con `module`, `controller`, `service`, `dto/`
2. Registrar el módulo en `app.module.ts`
3. Usar `PrismaService` directamente — no reimportar `PrismaModule`

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

```bash
DATABASE_URL    # Supabase pooler (port 6543, pgbouncer=true)
DIRECT_URL      # Supabase direct (port 5432) — para migraciones
BETTER_AUTH_SECRET  # openssl rand -base64 32
BETTER_AUTH_URL     # URL del backend (http://localhost:3000)
FRONTEND_URL        # URL del SPA React (http://localhost:5173)
```

## Git Flow

- **`main`** — producción
- **`develop`** — integración; base para todas las feature branches
- Feature branches: `feature/<jira-ticket>-description`
- PRs siempre a `develop`, nunca directamente a `main`
