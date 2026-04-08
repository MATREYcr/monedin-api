import { config } from 'dotenv'
config()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { auth } from '../src/modules/auth/auth'

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🧹 Clearing database...')

  await prisma.childProfile.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verification.deleteMany()
  await prisma.user.deleteMany()

  console.log('🌱 Creating parents...')

  const { user: carlos } = await auth.api.createUser({
    body: {
      name: 'Carlos López',
      email: 'carlos@test.com',
      password: '12345678',
      role: 'user',
    },
  })

  const { user: ana } = await auth.api.createUser({
    body: {
      name: 'Ana García',
      email: 'ana@test.com',
      password: '12345678',
      role: 'user',
    },
  })

  console.log('🌱 Creating children...')

  const { user: juanitoUser } = await auth.api.createUser({
    body: {
      name: 'Juanito',
      email: 'juanito@child.monedin',
      password: '12345678',
      role: 'user',
      data: { username: 'juanito', familyRole: 'CHILD' },
    },
  })

  const { user: sofiaUser } = await auth.api.createUser({
    body: {
      name: 'Sofía',
      email: 'sofia@child.monedin',
      password: '12345678',
      role: 'user',
      data: { username: 'sofia', familyRole: 'CHILD' },
    },
  })

  await prisma.childProfile.create({
    data: {
      userId: juanitoUser.id,
      parentId: carlos.id,
      age: 8,
      coins: 50,
      avatar: 'lion',
    },
  })

  await prisma.childProfile.create({
    data: {
      userId: sofiaUser.id,
      parentId: ana.id,
      age: 10,
      coins: 30,
      avatar: 'butterfly',
    },
  })

  console.log('\n✅ Seed complete')
  console.log('   Parents:')
  console.log(`     carlos@test.com   → id: ${carlos.id}`)
  console.log(`     ana@test.com      → id: ${ana.id}`)
  console.log('   Children:')
  console.log(`     username: juanito → parentId: ${carlos.id}`)
  console.log(`     username: sofia   → parentId: ${ana.id}`)
  console.log('   Password for all: 12345678')
}

main().catch(console.error).finally(() => prisma.$disconnect())
