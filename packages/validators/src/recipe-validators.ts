import { z } from "zod"

export const ingredientSchema = z.object({
  name: z.string().min(1, "食材名称不能为空"),
  quantity: z.string().min(1, "食材数量不能为空"),
  category: z.string().optional(),
})

export const instructionSchema = z.object({
  step: z.number(),
  content: z.string().min(1, "步骤内容不能为空"),
  imageUrl: z.string().optional(),
})

export const recipeSchema = z.object({
  title: z.string().min(3, "标题至少需要3个字符").max(100, "标题不能超过100个字符"),
  description: z.string().optional(),
  cookingTime: z.number().min(1, "烹饪时间必须大于0"),
  servings: z.number().min(1, "份量必须大于0"),
  difficulty: z.enum(["简单", "中等", "困难"]),
  ingredients: z.array(ingredientSchema).min(1, "至少需要一种食材"),
  instructions: z.array(instructionSchema).min(1, "至少需要一个步骤"),
  nutritionInfo: z.record(z.string(), z.number()).optional(),
  categoryIds: z.array(z.string()).min(1, "至少选择一个分类"),
  tagIds: z.array(z.string()).optional(),
})

export type Recipe = z.infer<typeof recipeSchema>
export type Ingredient = z.infer<typeof ingredientSchema>
export type Instruction = z.infer<typeof instructionSchema>
