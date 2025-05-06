import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  convertToGrams,
  calculateIngredientNutrition,
  sumNutritionValues,
  roundNutritionValues,
} from "@recipe-planner/utils/src/nutrition-utils"

interface Ingredient {
  name: string
  quantity: number
  unit: string
  category?: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ingredients, servings = 1 } = body

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "请提供有效的食材列表" }, { status: 400 })
    }

    // 提取食材名称列表
    const ingredientNames = ingredients.map((ingredient: Ingredient) => ingredient.name)

    // 从数据库获取食材的营养信息
    const nutritionData = await prisma.ingredient.findMany({
      where: {
        name: {
          in: ingredientNames,
        },
      },
    })

    // 创建食材名称到营养信息的映射
    const nutritionMap = new Map()
    nutritionData.forEach((item) => {
      nutritionMap.set(item.name, item)
    })

    // 计算每种食材的营养成分
    const ingredientNutritions = []
    const missingIngredients: string[] = []

    for (const ingredient of ingredients) {
      const { name, quantity, unit } = ingredient

      // 尝试模糊匹配食材名称
      let matchedIngredient = nutritionMap.get(name)

      if (!matchedIngredient) {
        // 如果没有精确匹配，尝试查找包含该名称的食材
        const fuzzyMatch = nutritionData.find((item) => item.name.includes(name) || name.includes(item.name))

        if (fuzzyMatch) {
          matchedIngredient = fuzzyMatch
        } else {
          missingIngredients.push(name)
          continue
        }
      }

      // 将数量转换为克
      const amountInGrams = convertToGrams(quantity, unit || "克", name)

      // 计算该食材的营养成分
      const nutrition = calculateIngredientNutrition(matchedIngredient, amountInGrams)
      ingredientNutritions.push(nutrition)
    }

    // 计算总营养成分
    const totalNutrition = sumNutritionValues(ingredientNutritions)

    // 计算每份的营养成分
    const perServingNutrition = { ...totalNutrition }
    if (servings > 1) {
      Object.keys(perServingNutrition).forEach((key) => {
        perServingNutrition[key as keyof typeof perServingNutrition] =
          perServingNutrition[key as keyof typeof perServingNutrition] / servings
      })
    }

    // 四舍五入结果
    const roundedTotalNutrition = roundNutritionValues(totalNutrition)
    const roundedPerServingNutrition = roundNutritionValues(perServingNutrition)

    return NextResponse.json({
      totalNutrition: roundedTotalNutrition,
      perServingNutrition: roundedPerServingNutrition,
      missingIngredients,
      servings,
    })
  } catch (error) {
    console.error("Error calculating nutrition:", error)
    return NextResponse.json({ error: "计算营养成分失败" }, { status: 500 })
  }
}
