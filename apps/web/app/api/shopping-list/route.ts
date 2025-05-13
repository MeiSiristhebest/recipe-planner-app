import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { shoppingListSchema } from "@repo/validators"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // Get shopping lists for the user
    try {
      const shoppingLists = await prisma.shoppingList.findMany({
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
        orderBy: {
          updatedAt: "desc",
        },
      })

      return NextResponse.json(shoppingLists)
    } catch (dbError) {
      console.error("数据库查询购物清单失败:", dbError)
      return NextResponse.json({ error: "数据库查询失败", details: dbError.message }, { status: 500 })
    }
  } catch (error) {
    console.error("获取购物清单请求处理错误:", error)
    return NextResponse.json({ error: "获取购物清单失败", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("解析请求JSON失败:", parseError)
      return NextResponse.json({ error: "无效的JSON数据" }, { status: 400 })
    }

    const validationResult = shoppingListSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "验证失败", details: validationResult.error.flatten() }, { status: 400 })
    }

    const data = validationResult.data

    try {
      // Create shopping list
      const shoppingList = await prisma.shoppingList.create({
        data: {
          name: data.name,
          user: {
            connect: { id: session.user.id },
          },
          items: {
            create: data.items?.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              category: item.category,
              completed: item.completed || false,
              notes: item.notes,
            })) || [],
          },
        },
      })

      return NextResponse.json(shoppingList)
    } catch (dbError) {
      console.error("创建购物清单数据库错误:", dbError)
      return NextResponse.json({ error: "数据库创建失败", details: dbError.message }, { status: 500 })
    }
  } catch (error) {
    console.error("创建购物清单请求处理错误:", error)
    return NextResponse.json({ error: "创建购物清单失败", details: error.message }, { status: 500 })
  }
}
