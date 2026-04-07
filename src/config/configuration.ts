import { z } from 'zod'
import { config } from 'dotenv'

config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.url(),

  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),

  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validateConfig(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config)
  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    console.error(result.error.flatten().fieldErrors)
    process.exit(1)
  }
  return result.data
}

export const env = envSchema.parse(process.env)
