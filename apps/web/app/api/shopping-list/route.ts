import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { shoppingListSchema } from "@recipe-planner/validators"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // Get shopping lists for the user
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
  } catch (error) {
    console.error("Error fetching shopping lists:", error)
    return NextResponse.json({ error: "获取购物清单失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = shoppingListSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "验证失败", details: validationResult.error.flatten() }, { status: 400 })
    }

    const data = validationResult.data

    // Create shopping list
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: data.name,
        user: {
          connect: { id: session.user.id },
        },
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            completed: item.completed,
            notes: item.notes,
          })),
        },
      },
    })

    return NextResponse.json(shoppingList)
  } catch (error) {
    console.error("Error creating shopping list:", error)
    return NextResponse.json({ error: "创建购物清单失败" }, { status: 500 })
  }
}
