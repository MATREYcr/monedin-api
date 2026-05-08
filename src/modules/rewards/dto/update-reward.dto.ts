import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const UpdateRewardSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().optional(),
  assignments: z
    .array(
      z.object({
        childId: z.string(),
        coins: z.number().int().min(1).max(9999),
      }),
    )
    .optional(),
})

export class UpdateRewardDto extends createZodDto(UpdateRewardSchema) {}
