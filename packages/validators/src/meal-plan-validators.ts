import { z } from "zod"

export const mealTimeEnum = z.enum(["早餐", "午餐", "晚餐"])

export const mealPlanItemSchema = z.object({
  date: z.date(),
  mealTime: mealTimeEnum,
  recipeId: z.string().min(1, "请选择食谱"),
  servings: z.number().min(1, "份量必须大于0"),
})

export const mealPlanSchema = z.object({
  name: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  isTemplate: z.boolean().default(false),
  items: z.array(mealPlanItemSchema),
})

export type MealPlan = z.infer<typeof mealPlanSchema>
export type MealPlanItem = z.infer<typeof mealPlanItemSchema>
export type MealTime = z.infer<typeof mealTimeEnum>
