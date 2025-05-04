import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// 获取购物清单
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    // 查找用户的购物清单，如果不存在则创建一个
    let shoppingList = await prisma.shoppingList.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: {
            category: "asc",
          },
        },
      },
    })

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({
        data: {
          userId: session.user.id,
        },
        include: {
          items: true,
        },
      })
    }

    return NextResponse.json(shoppingList)
  } catch (error) {
    console.error("获取购物清单错误:", error)
    return NextResponse.json({ message: "获取购物清单失败" }, { status: 500 })
  }
}

// 清空购物清单
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    // 查找用户的购物清单
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!shoppingList) {
      return NextResponse.json({ message: "购物清单不存在" }, { status: 404 })
    }

    // 删除所有购物清单项目
    await prisma.shoppingListItem.deleteMany({
      where: {
        shoppingListId: shoppingList.id,
      },
    })

    return NextResponse.json({ message: "购物清单已清空" })
  } catch (error) {
    console.error("清空购物清单错误:", error)
    return NextResponse.json({ message: "清空购物清单失败" }, { status: 500 })
  }
}
