"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "姓名至少需要2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少需要8个字符"),
})

export async function registerUser(userData: {
  name: string
  email: string
  password: string
  confirmPassword: string
}) {
  // Validate input
  const validationResult = registerSchema.safeParse({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  })

  if (!validationResult.success) {
    return {
      error: validationResult.error.errors[0].message,
    }
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      return { error: "该邮箱已被注册" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    })

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "注册失败，请稍后再试" }
  }
}
