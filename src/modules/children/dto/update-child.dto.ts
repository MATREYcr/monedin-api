import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const UpdateChildSchema = z.object({
  name: z.string().min(2).optional(),
  age: z.number().int().min(6).max(11).optional(),
  avatar: z.string().optional(),
})

export class UpdateChildDto extends createZodDto(UpdateChildSchema) {}
