// 单位转换工具

// 重量单位转换为克
export function convertToGrams(quantity: number, unit: string, ingredientName = ""): number {
  const unit_lower = unit.toLowerCase()

  // 重量单位
  if (unit_lower === "g" || unit_lower === "克" || unit_lower === "gram" || unit_lower === "grams") {
    return quantity
  }
  if (unit_lower === "kg" || unit_lower === "千克" || unit_lower === "kilogram" || unit_lower === "kilograms") {
    return quantity * 1000
  }
  if (unit_lower === "mg" || unit_lower === "毫克" || unit_lower === "milligram" || unit_lower === "milligrams") {
    return quantity / 1000
  }

  // 体积单位 (近似转换)
  if (unit_lower === "ml" || unit_lower === "毫升" || unit_lower === "milliliter" || unit_lower === "milliliters") {
    return quantity // 假设密度为1g/ml
  }
  if (unit_lower === "l" || unit_lower === "升" || unit_lower === "liter" || unit_lower === "liters") {
    return quantity * 1000 // 假设密度为1g/ml
  }

  // 常用烹饪单位 (近似转换)
  if (unit_lower === "tbsp" || unit_lower === "汤匙" || unit_lower === "tablespoon" || unit_lower === "tablespoons") {
    return quantity * 15 // 约15克
  }
  if (unit_lower === "tsp" || unit_lower === "茶匙" || unit_lower === "teaspoon" || unit_lower === "teaspoons") {
    return quantity * 5 // 约5克
  }
  if (unit_lower === "cup" || unit_lower === "杯" || unit_lower === "cups") {
    return quantity * 240 // 约240克
  }

  // 个数单位 (需要根据具体食材调整)
  if (unit_lower === "个" || unit_lower === "piece" || unit_lower === "pieces") {
    // 根据食材名称估算重量
    if (ingredientName.includes("鸡蛋")) {
      return quantity * 50 // 约50克
    } else if (ingredientName.includes("苹果") || ingredientName.includes("橙子")) {
      return quantity * 150 // 约150克
    } else if (ingredientName.includes("香蕉")) {
      return quantity * 100 // 约100克
    } else if (ingredientName.includes("面包")) {
      return quantity * 30 // 约30克
    } else {
      return quantity * 100 // 默认一个为100克
    }
  }

  // 默认返回原始数量
  return quantity
}

// 计算食材的营养成分
export function calculateIngredientNutrition(
  ingredientData: {
    calories: number
    protein: number
    fat: number
    carbs: number
    fiber?: number | null
    sugar?: number | null
    sodium?: number | null
  },
  grams: number,
) {
  // 营养数据是每100克的值，需要按比例计算
  const ratio = grams / 100

  return {
    calories: ingredientData.calories * ratio,
    protein: ingredientData.protein * ratio,
    fat: ingredientData.fat * ratio,
    carbs: ingredientData.carbs * ratio,
    fiber: (ingredientData.fiber || 0) * ratio,
    sugar: (ingredientData.sugar || 0) * ratio,
    sodium: (ingredientData.sodium || 0) * ratio,
  }
}

// 合并多个食材的营养成分
export function sumNutritionValues(
  nutritionArray: Array<{
    calories: number
    protein: number
    fat: number
    carbs: number
    fiber: number
    sugar: number
    sodium: number
  }>,
) {
  return nutritionArray.reduce(
    (sum, item) => ({
      calories: sum.calories + item.calories,
      protein: sum.protein + item.protein,
      fat: sum.fat + item.fat,
      carbs: sum.carbs + item.carbs,
      fiber: sum.fiber + item.fiber,
      sugar: sum.sugar + item.sugar,
      sodium: sum.sodium + item.sodium,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 0 },
  )
}

// 计算每份的营养成分
export function calculatePerServing(
  totalNutrition: {
    calories: number
    protein: number
    fat: number
    carbs: number
    fiber: number
    sugar: number
    sodium: number
  },
  servings: number,
) {
  if (servings <= 0) return totalNutrition

  return {
    calories: totalNutrition.calories / servings,
    protein: totalNutrition.protein / servings,
    fat: totalNutrition.fat / servings,
    carbs: totalNutrition.carbs / servings,
    fiber: totalNutrition.fiber / servings,
    sugar: totalNutrition.sugar / servings,
    sodium: totalNutrition.sodium / servings,
  }
}

// 四舍五入到指定小数位
export function roundNutritionValues(
  nutrition: {
    calories: number
    protein: number
    fat: number
    carbs: number
    fiber: number
    sugar: number
    sodium: number
  },
  decimals = 1,
) {
  const factor = Math.pow(10, decimals)

  return {
    calories: Math.round(nutrition.calories * factor) / factor,
    protein: Math.round(nutrition.protein * factor) / factor,
    fat: Math.round(nutrition.fat * factor) / factor,
    carbs: Math.round(nutrition.carbs * factor) / factor,
    fiber: Math.round(nutrition.fiber * factor) / factor,
    sugar: Math.round(nutrition.sugar * factor) / factor,
    sodium: Math.round(nutrition.sodium * factor) / factor,
  }
}
