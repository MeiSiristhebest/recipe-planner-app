import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting migration to add Ingredient table...")

  try {
    // 使用prisma.$executeRaw来执行原始SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Ingredient" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "category" TEXT,
        "calories" DOUBLE PRECISION NOT NULL,
        "protein" DOUBLE PRECISION NOT NULL,
        "fat" DOUBLE PRECISION NOT NULL,
        "carbs" DOUBLE PRECISION NOT NULL,
        "fiber" DOUBLE PRECISION,
        "sugar" DOUBLE PRECISION,
        "sodium" DOUBLE PRECISION,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS "Ingredient_name_key" ON "Ingredient"("name");
    `

    console.log("Ingredient table created successfully")
  } catch (error) {
    console.error("Error creating Ingredient table:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
