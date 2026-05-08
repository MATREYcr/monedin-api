# Database — Prisma + Supabase

## Conexión
- `DATABASE_URL` → pooler Supabase (port 6543, pgbouncer=true) — para queries
- `DIRECT_URL` → direct Supabase (port 5432) — solo para migraciones

## Modelos de negocio
- `User` — usuario base gestionado por Better Auth (PARENT y CHILD)
- `ChildProfile` — perfil extendido del niño: coins, edad, relaciones
- `Task` — tarea asignada por el padre con flujo de aprobación
- `Reward` — premio creado por el padre
- `RewardAssignment` — asignación de un premio a un niño con precio en coins
- `RewardRedemption` — solicitud de canje iniciada por el niño

## Convenciones
- IDs propios: `@id @default(cuid())`; IDs de Better Auth: `String @id` sin default
- Timestamps: `createdAt DateTime @default(now())` y `updatedAt DateTime @updatedAt`
- Enums en SCREAMING_SNAKE_CASE definidos en el schema
- Tras cualquier cambio en schema.prisma: correr `/gen`
