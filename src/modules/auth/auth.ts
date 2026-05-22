import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { username, admin } from 'better-auth/plugins'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '../../config/configuration'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export const auth = betterAuth({
  basePath: '/auth',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [env.FRONTEND_URL, env.BETTER_AUTH_URL],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    admin(),
  ],
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
      },
    }),
  },
  user: {
    additionalFields: {
      familyRole: {
        type: 'string',
        required: false,
        defaultValue: 'PARENT',
        input: false,
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
