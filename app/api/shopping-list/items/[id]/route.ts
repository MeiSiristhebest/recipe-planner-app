import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// 更新购物清单项目
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()

    // 验证输入数据
    const itemSchema = z.object({
      name: z.string().min(1).optional(),
      quantity: z.string().optional(),
      unit: z.string().optional(),
      category: z.string().optional(),
      isChecked: z.boolean().optional(),
      notes: z.string().optional(),
    })

    const result = itemSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "输入数据无效", errors: result.error.format() }, { status: 400 })
    }

    // 查找项目并确保它属于用户的购物清单
    const item = await prisma.shoppingListItem.findUnique({
      where: { id },
      include: {
        shoppingList: true,
      },
    })

    if (!item) {
      return NextResponse.json({ message: "购物清单项目不存在" }, { status: 404 })
    }

    if (item.shoppingList.userId !== session.user.id) {
      return NextResponse.json({ message: "无权修改此购物清单项目" }, { status: 403 })
    }

    // 更新项目
    const updatedItem = await prisma.shoppingListItem.update({
      where: { id },
      data: result.data,
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("更新购物清单项目错误:", error)
    return NextResponse.json({ message: "更新购物清单项目失败" }, { status: 500 })
  }
}

// 删除购物清单项目
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    const id = params.id

    // 查找项目并确保它属于用户的购物清单
    const item = await prisma.shoppingListItem.findUnique({
      where: { id },
      include: {
        shoppingList: true,
      },
    })

    if (!item) {
      return NextResponse.json({ message: "购物清单项目不存在" }, { status: 404 })
    }

    if (item.shoppingList.userId !== session.user.id) {
      return NextResponse.json({ message: "无权删除此购物清单项目" }, { status: 403 })
    }

    // 删除项目
    await prisma.shoppingListItem.delete({
      where: { id },
    })

    return NextResponse.json({ message: "购物清单项目已删除" })
  } catch (error) {
    console.error("删除购物清单项目错误:", error)
    return NextResponse.json({ message: "删除购物清单项目失败" }, { status: 500 })
  }
}
