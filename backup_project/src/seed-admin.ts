import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      id: 'admin-user-id',
      email: 'admin@crm.com',
      name: 'Hệ thống Admin',
      password: 'password123', // In real app, this should be hashed
      role: 'admin',
    },
  })
  console.log('Admin user created/updated:', admin.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
