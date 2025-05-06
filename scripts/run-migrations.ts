import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"

const execAsync = promisify(exec)

async function runMigrations() {
  console.log("Running migrations...")

  try {
    // 获取migrations目录下的所有迁移文件
    const migrationsDir = path.join(process.cwd(), "prisma/migrations")
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".ts") && !file.includes("migration_lock"))

    // 按顺序执行每个迁移文件
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`)
      const migrationPath = path.join(migrationsDir, file)

      // 使用ts-node执行迁移文件
      await execAsync(`npx ts-node ${migrationPath}`)
      console.log(`Migration ${file} completed successfully`)
    }

    console.log("All migrations completed successfully")
  } catch (error) {
    console.error("Error running migrations:", error)
    process.exit(1)
  }
}

runMigrations()
