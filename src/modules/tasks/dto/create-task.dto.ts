import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const assignmentSchema = z.object({
  childId: z.string(),
  coins: z.number().int().min(0).max(9999),
})

export const CreateTaskSchema = z
  .object({
    title: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    dueDate: z
      .string()
      .optional()
      .describe('ISO 8601 date or datetime (e.g. 2026-04-20 or 2026-04-20T00:00:00Z)')
      .transform((val) => (val ? new Date(val) : undefined))
      .refine((val) => val === undefined || !isNaN(val.getTime()), { message: 'Invalid date' }),
    // Opción A: mismo precio para todos
    childIds: z.array(z.string()).optional(),
    coins: z.number().int().min(0).max(9999).optional(),
    // Opción B: precio distinto por hijo
    assignments: z.array(assignmentSchema).optional(),
  })
  .refine(
    (d) =>
      (d.assignments && d.assignments.length > 0) ||
      (d.childIds && d.childIds.length > 0 && d.coins !== undefined),
    { message: 'Provide assignments[] or childIds[] + coins' },
  )

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
