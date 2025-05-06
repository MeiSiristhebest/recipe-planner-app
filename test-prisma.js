const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Prisma client initialized successfully!')
  // 尝试一个简单的查询
  try {
    const users = await prisma.user.findMany({ take: 1 })
    console.log('查询成功:', users)
  } catch (error) {
    console.error('查询失败:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
