# Arquitectura

## Estructura de carpetas
```
src/
├── common/
│   ├── decorators/     ← @Public(), @CurrentUser()
│   ├── filters/        ← AllExceptionsFilter
│   └── guards/         ← AuthGuard (Better Auth)
├── config/             ← schema Zod de env vars
├── prisma/             ← PrismaModule + PrismaService (global)
├── auth/               ← rutas /api/auth/* manejadas por Better Auth
├── children/           ← gestión de perfiles de niños por el padre
├── tasks/              ← CRUD de tareas + workflow de estados
└── rewards/            ← premios, asignaciones y redenciones
```

## Módulos activos
| Módulo | Rutas base | Descripción |
|---|---|---|
| auth | `/api/auth/*` | Manejado por Better Auth |
| children | `/children` | CRUD de niños del padre |
| tasks | `/tasks` | Tareas y aprobaciones |
| rewards | `/rewards` | Premios, asignaciones, canjes |

## Entidades del schema
`User` · `ChildProfile` · `Task` · `Reward` · `RewardAssignment` · `RewardRedemption`
Ver `prisma/schema.prisma` para el detalle completo.
