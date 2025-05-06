import { z } from "zod"

export const shoppingListCategoryEnum = z.enum(["蔬菜水果", "肉类海鲜", "乳制品蛋类", "调味品干货", "其他"])

export const shoppingListItemSchema = z.object({
  name: z.string().min(1, "物品名称不能为空"),
  quantity: z.string().min(1, "数量不能为空"),
  category: shoppingListCategoryEnum,
  completed: z.boolean().default(false),
  notes: z.string().optional(),
})

export const shoppingListSchema = z.object({
  name: z.string().optional(),
  items: z.array(shoppingListItemSchema),
})

export type ShoppingList = z.infer<typeof shoppingListSchema>
export type ShoppingListItem = z.infer<typeof shoppingListItemSchema>
export type ShoppingListCategory = z.infer<typeof shoppingListCategoryEnum>
