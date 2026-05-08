# Convenciones

## Nombrado
- Archivos: `kebab-case` — `create-task.dto.ts`, `tasks.service.ts`
- Clases: `PascalCase` — `TasksService`, `CreateTaskDto`
- Variables/funciones: `camelCase`
- Enums en schema: `SCREAMING_SNAKE_CASE`

## DTOs
Siempre con `createZodDto()` de nestjs-zod. No usar `class-validator`.

```typescript
const CreateTaskSchema = z.object({
  title: z.string().min(1),
  coins: z.number().int().min(0),
})
export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
```

## Commits
Formato: `type(scope): descripción`
Types: `feat` · `fix` · `refactor` · `docs` · `test` · `chore`
Ejemplo: `feat(tasks): add status workflow with parent approval`

## Git Flow
- `main` → producción
- `develop` → integración (base de todas las features)
- `feature/<ticket>-description` → una rama por feature
- PRs siempre a `develop`, nunca a `main`
- Usar `/git-flow` para toda operación git

## Módulo nuevo
1. Crear `src/[feature]/` con `module`, `controller`, `service`, `dto/`
2. Registrar en `app.module.ts`
3. Inyectar `PrismaService` directamente (`PrismaModule` es global)
