import { z } from "zod";

// Recipe验证器
export const recipeSchema = z.object({
  title: z.string().min(3, "标题至少需要3个字符"),
  description: z.string().optional(),
  cookingTime: z.number().min(1, "烹饪时间必须大于0"),
  servings: z.number().min(1, "份量必须大于0"),
  difficulty: z.enum(["简单", "中等", "困难"]),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      unit: z.string().optional(),
    })
  ),
  instructions: z.array(
    z.object({
      step: z.number(),
      content: z.string(),
      image: z.string().optional(),
    })
  ),
  nutritionInfo: z
    .object({
      calories: z.number().optional(),
      protein: z.number().optional(),
      fat: z.number().optional(),
      carbs: z.number().optional(),
    })
    .optional(),
  coverImage: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().default(false),
});

// MealPlan验证器
export const mealPlanSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isTemplate: z.boolean().default(false),
  items: z
    .array(
      z.object({
        date: z.string().or(z.date()),
        mealTime: z.enum(["早餐", "午餐", "晚餐"]),
        recipeId: z.string(),
        servings: z.number().default(1),
      })
    )
    .optional(),
});

// ShoppingList验证器
export const shoppingListSchema = z.object({
  name: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.string(),
        category: z.enum([
          "蔬菜水果",
          "肉类海鲜",
          "乳制品蛋类",
          "调味品干货",
          "其他",
        ]),
        completed: z.boolean().default(false),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

// ShoppingListItem验证器
export const shoppingListItemSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  category: z.enum([
    "蔬菜水果",
    "肉类海鲜",
    "乳制品蛋类",
    "调味品干货",
    "其他",
  ]),
  completed: z.boolean().default(false),
  notes: z.string().optional(),
});
