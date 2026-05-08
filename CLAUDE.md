# monedin-api

Backend REST API para **Monedín** — plataforma de educación financiera gamificada para niños (6–11 años).
Roles: **PARENT** (gestiona familia, tareas, premios) · **CHILD** (completa tareas, canjea premios).

## Skills obligatorios
- `/nest-stack` — para crear módulos, controllers, services, guards, DTOs
- `/git-flow` — para TODAS las operaciones git: ramas, commits, PRs, merges

## Comandos
```bash
pnpm run start:dev                              # servidor en watch mode
pnpm run build && pnpm run lint                 # compilar y lintear
pnpm run test                                   # tests unitarios
```
```bash
pnpm exec prisma generate                       # regenerar Prisma Client (o /gen)
pnpm exec prisma migrate dev --name <name>      # nueva migración (o /migrate)
pnpm exec prisma studio                         # GUI visual de la DB
```

## Variables de entorno
```
DATABASE_URL       # Supabase pooler (port 6543, pgbouncer=true)
DIRECT_URL         # Supabase direct (port 5432) — solo para migraciones
BETTER_AUTH_SECRET # openssl rand -base64 32
BETTER_AUTH_URL    # URL del backend  (http://localhost:3000)
FRONTEND_URL       # URL del SPA React (http://localhost:5173)
```

@.claude/rules/backend.md
@.claude/rules/auth.md
@docs/convenciones.md
