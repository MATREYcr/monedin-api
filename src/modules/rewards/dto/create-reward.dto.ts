import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateRewardSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  assignments: z
    .array(
      z.object({
        childId: z.string(),
        coins: z.number().int().min(1).max(9999),
      }),
    )
    .min(1, 'At least one child assignment is required'),
})

export class CreateRewardDto extends createZodDto(CreateRewardSchema) {}
