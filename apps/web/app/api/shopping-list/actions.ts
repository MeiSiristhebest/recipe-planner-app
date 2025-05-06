"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { shoppingListItemSchema } from "@recipe-planner/validators"

export async function addShoppingListItem(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    return { error: "请先登录" }
  }

  const shoppingListId = formData.get("shoppingListId") as string

  // Parse form data
  const rawData = {
    name: formData.get("name") as string,
    quantity: formData.get("quantity") as string,
    category: formData.get("category") as string,
    notes: formData.get("notes") as string,
  }

  // Validate data
  const validationResult = shoppingListItemSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      error: "表单验证失败",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }

  const data = validationResult.data

  try {
    // Verify shopping list belongs to user
    const shoppingList = await prisma.shoppingList.findUnique({
      where: { id: shoppingListId },
    })

    if (!shoppingList) {
      return { error: "购物清单不存在" }
    }

    if (shoppingList.userId !== session.user.id) {
      return { error: "无权访问此购物清单" }
    }

    // Add item to shopping list
    const item = await prisma.shoppingListItem.create({
      data: {
        name: data.name,
        quantity: data.quantity,
        category: data.category,
        notes: data.notes,
        completed: false,
        shoppingList: {
          connect: { id: shoppingListId },
        },
      },
    })

    revalidatePath("/shopping-list")
    return { success: true, itemId: item.id }
  } catch (error) {
    console.error("Failed to add shopping list item:", error)
    return { error: "添加物品失败，请稍后再试" }
  }
}

export async function toggleShoppingListItem(itemId: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "请先登录" }
  }

  try {
    // Get item with shopping list to verify ownership
    const item = await prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: { shoppingList: true },
    })

    if (!item) {
      return { error: "物品不存在" }
    }

    if (item.shoppingList.userId !== session.user.id) {
      return { error: "无权访问此物品" }
    }

    // Toggle completed status
    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { completed: !item.completed },
    })

    revalidatePath("/shopping-list")
    return { success: true, completed: updatedItem.completed }
  } catch (error) {
    console.error("Failed to toggle shopping list item:", error)
    return { error: "更新物品状态失败，请稍后再试" }
  }
}

export async function clearCompletedItems(shoppingListId: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "请先登录" }
  }

  try {
    // Verify shopping list belongs to user
    const shoppingList = await prisma.shoppingList.findUnique({
      where: { id: shoppingListId },
    })

    if (!shoppingList) {
      return { error: "购物清单不存在" }
    }

    if (shoppingList.userId !== session.user.id) {
      return { error: "无权访问此购物清单" }
    }

    // Delete completed items
    await prisma.shoppingListItem.deleteMany({
      where: {
        shoppingListId,
        completed: true,
      },
    })

    revalidatePath("/shopping-list")
    return { success: true }
  } catch (error) {
    console.error("Failed to clear completed items:", error)
    return { error: "清除已完成物品失败，请稍后再试" }
  }
}
