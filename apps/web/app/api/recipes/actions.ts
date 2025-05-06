"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { recipeSchema } from "@recipe-planner/validators"
import { redirect } from "next/navigation"

export async function createRecipe(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    return { error: "请先登录" }
  }

  // Parse form data
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    cookingTime: Number.parseInt(formData.get("cookingTime") as string),
    servings: Number.parseInt(formData.get("servings") as string),
    difficulty: formData.get("difficulty") as string,
    ingredients: JSON.parse(formData.get("ingredients") as string),
    instructions: JSON.parse(formData.get("instructions") as string),
    nutritionInfo: formData.get("nutritionInfo") ? JSON.parse(formData.get("nutritionInfo") as string) : undefined,
    categoryIds: formData.getAll("categoryIds").map((id) => id.toString()),
    tagIds: formData.getAll("tagIds").map((id) => id.toString()),
  }

  // Validate data
  const validationResult = recipeSchema.safeParse(rawData)

  if (!validationResult.success) {
    return {
      error: "表单验证失败",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    }
  }

  const data = validationResult.data

  try {
    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description,
        cookingTime: data.cookingTime,
        servings: data.servings,
        difficulty: data.difficulty,
        ingredients: data.ingredients,
        instructions: data.instructions,
        nutritionInfo: data.nutritionInfo,
        coverImage: (formData.get("coverImage") as string) || null,
        published: true,
        author: {
          connect: { id: session.user.id },
        },
        categories: {
          create: data.categoryIds.map((categoryId) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
        tags: {
          create: data.tagIds.map((tagId) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
    })

    revalidatePath("/recipes")
    redirect(`/recipes/${recipe.id}`)
  } catch (error) {
    console.error("Failed to create recipe:", error)
    return { error: "创建食谱失败，请稍后再试" }
  }
}
