import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateChildSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).max(20),
  password: z.string().min(4),
  age: z.number().int().min(6).max(11).optional(),
  avatar: z.string().optional(),
})

export class CreateChildDto extends createZodDto(CreateChildSchema) {}
