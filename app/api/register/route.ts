import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证输入数据
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "输入数据无效" }, { status: 400 })
    }

    const { name, email, password } = result.data

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "该邮箱已被注册" }, { status: 400 })
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("注册错误:", error)
    return NextResponse.json({ message: "注册失败" }, { status: 500 })
  }
}
