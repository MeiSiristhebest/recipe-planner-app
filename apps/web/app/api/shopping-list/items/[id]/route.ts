import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { shoppingListItemSchema } from "@recipe-planner/validators"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemId = params.id
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // Check if item exists and belongs to user
    const item = await prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: { shoppingList: true },
    })

    if (!item) {
      return NextResponse.json({ error: "物品不存在" }, { status: 404 })
    }

    if (item.shoppingList.userId !== session.user.id) {
      return NextResponse.json({ error: "无权修改此物品" }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = shoppingListItemSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "验证失败", details: validationResult.error.flatten() }, { status: 400 })
    }

    const data = validationResult.data

    // Update item
    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        name: data.name,
        quantity: data.quantity,
        category: data.category,
        completed: data.completed,
        notes: data.notes,
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Error updating shopping list item:", error)
    return NextResponse.json({ error: "更新物品失败" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemId = params.id
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // Check if item exists and belongs to user
    const item = await prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: { shoppingList: true },
    })

    if (!item) {
      return NextResponse.json({ error: "物品不存在" }, { status: 404 })
    }

    if (item.shoppingList.userId !== session.user.id) {
      return NextResponse.json({ error: "无权删除此物品" }, { status: 403 })
    }

    // Delete item
    await prisma.shoppingListItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting shopping list item:", error)
    return NextResponse.json({ error: "删除物品失败" }, { status: 500 })
  }
}
