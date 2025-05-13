"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { mealPlanSchema } from "@repo/validators"
import { z } from 'zod'

// Define schema for the expected object structure
const saveMealPlanInputSchema = mealPlanSchema.extend({
  // We'll receive items directly in the expected structure now
  items: z.array(z.object({
    recipeId: z.string(),
    date: z.date(),
    mealTime: z.string(), // Consider refining with z.enum if possible
    servings: z.number().int().positive(),
  }))
});

export async function saveMealPlan(inputData: z.infer<typeof saveMealPlanInputSchema>) {
  const session = await auth()

  if (!session?.user) {
    return { error: "请先登录" }
  }

  // Validate the input object directly
  const validationResult = saveMealPlanInputSchema.safeParse(inputData)

  if (!validationResult.success) {
    console.error("Save Meal Plan Input Validation Error:", validationResult.error.flatten());
    return {
      error: "数据格式无效", // More specific error
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }

  const data = validationResult.data

  try {
    // Create meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isTemplate: data.isTemplate,
        user: {
          connect: { id: session.user.id },
        },
        items: {
          create: data.items.map((item) => ({
            date: item.date, // Use the date from the validated data
            mealTime: item.mealTime,
            servings: item.servings,
            recipe: {
              connect: { id: item.recipeId },
            },
          })),
        },
      },
    })

    revalidatePath("/meal-plans")
    // Revalidate templates path if saving a template
    if (data.isTemplate) {
        revalidatePath("/api/meal-plans/templates"); // Revalidate the template API route
    }
    return { success: true, mealPlanId: mealPlan.id }
  } catch (error) {
    console.error("Failed to save meal plan:", error)
    return { error: "保存餐计划失败，请稍后再试" }
  }
}

export async function generateShoppingList(mealPlanId: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "请先登录" }
  }

  try {
    // Get meal plan with items and recipes
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        items: {
          include: {
            recipe: true,
          },
        },
      },
    })

    if (!mealPlan) {
      return { error: "餐计划不存在" }
    }

    if (mealPlan.userId !== session.user.id) {
      return { error: "无权访问此餐计划" }
    }

    // Extract ingredients from all recipes
    const allIngredients: Record<string, { name: string; quantity: string; category: string }> = {}

    mealPlan.items.forEach((item) => {
      const recipe = item.recipe
      const ingredients = recipe.ingredients as any[]

      ingredients.forEach((ingredient) => {
        const key = `${ingredient.name}-${ingredient.category || "其他"}`

        if (allIngredients[key]) {
          // For simplicity, just note that there are multiple quantities
          allIngredients[key].quantity += `, ${ingredient.quantity}`
        } else {
          allIngredients[key] = {
            name: ingredient.name,
            quantity: ingredient.quantity,
            category: ingredient.category || "其他",
          }
        }
      })
    })

    // Create shopping list
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: `${mealPlan.startDate.toLocaleDateString()} - ${mealPlan.endDate.toLocaleDateString()} 购物清单`,
        user: {
          connect: { id: session.user.id },
        },
        items: {
          create: Object.values(allIngredients).map((ingredient) => ({
            name: ingredient.name,
            quantity: ingredient.quantity,
            category: ingredient.category,
            completed: false,
          })),
        },
      },
    })

    revalidatePath("/shopping-list")
    return { success: true, shoppingListId: shoppingList.id }
  } catch (error) {
    console.error("Failed to generate shopping list:", error)
    return { error: "生成购物清单失败，请稍后再试" }
  }
}
