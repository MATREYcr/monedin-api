import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const UpdateTaskSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  coins: z.number().int().min(0).max(9999).optional(),
  dueDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val.getTime()), { message: 'Invalid date' }),
})

export class UpdateTaskDto extends createZodDto(UpdateTaskSchema) {}
