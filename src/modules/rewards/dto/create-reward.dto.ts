import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateRewardSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  coins: z.number().int().min(1).max(9999),
  image: z.string().url().optional(),
})

export class CreateRewardDto extends createZodDto(CreateRewardSchema) {}
