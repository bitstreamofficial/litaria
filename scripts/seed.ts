import { seedDatabase } from '../lib/seed'
import { prisma } from '../lib/db'

async function main() {
  try {
    await seedDatabase()
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()