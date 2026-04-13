import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateTaskSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  coins: z.number().int().min(0).max(9999).optional(),
  childId: z.string(),
  dueDate: z
    .string()
    .optional()
    .describe('ISO 8601 date or datetime (e.g. 2026-04-20 or 2026-04-20T00:00:00Z)')
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val.getTime()), { message: 'Invalid date' }),
})

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
