import { prisma } from './db'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  try {
    // Create a default category
    const category = await prisma.category.upsert({
      where: { name: 'General' },
      update: {},
      create: {
        name: 'General'
      }
    })

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 12)
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword
      }
    })

    console.log('✅ Database seeded successfully')
    console.log('📁 Created category:', category.name)
    console.log('👤 Created user:', user.email)

    return { category, user }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}