import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// 添加购物清单项目
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    const body = await request.json()

    // 验证输入数据
    const itemSchema = z.object({
      name: z.string().min(1),
      quantity: z.string(),
      unit: z.string(),
      category: z.string(),
      notes: z.string().optional(),
      recipeId: z.string().optional(),
    })

    const result = itemSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "输入数据无效", errors: result.error.format() }, { status: 400 })
    }

    // 查找用户的购物清单，如果不存在则创建一个
    let shoppingList = await prisma.shoppingList.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    // 创建购物清单项目
    const item = await prisma.shoppingListItem.create({
      data: {
        ...result.data,
        isChecked: false,
        shoppingListId: shoppingList.id,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("添加购物清单项目错误:", error)
    return NextResponse.json({ message: "添加购物清单项目失败" }, { status: 500 })
  }
}
