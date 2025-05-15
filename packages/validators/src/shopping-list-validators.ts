import { z } from "zod";

export const shoppingListCategoryEnum = z.enum([
  // 主要分类
  "蔬菜水果",
  "肉类海鲜",
  "乳制品蛋类",
  "调味品干货",
  "谷物豆类",
  "坚果种子",
  "菌菇类",
  "药食同源",
  "饮品酒水",
  "加工食品",
  "其他",

  // 蔬菜水果细分
  "叶菜类",
  "根茎类",
  "瓜果类",
  "菌菇类",
  "水果类",
  "浆果类",

  // 肉类海鲜细分
  "猪肉类",
  "牛肉类",
  "羊肉类",
  "禽肉类",
  "鱼类",
  "贝壳类",
  "虾蟹类",
  "其他海鲜",

  // 乳制品蛋类细分
  "奶制品",
  "奶酪类",
  "蛋类",

  // 调味品干货细分
  "香辛料",
  "酱料",
  "油类",
  "醋类",
  "糖类",
  "盐类",

  // 谷物豆类细分
  "米类",
  "面粉类",
  "豆类",
  "杂粮类",
]);

export const shoppingListItemSchema = z.object({
  name: z.string().min(1, "物品名称不能为空"),
  quantity: z.string().min(1, "数量不能为空"),
  category: shoppingListCategoryEnum,
  completed: z.boolean().default(false),
  notes: z.string().optional(),
});

export const shoppingListSchema = z.object({
  name: z.string().optional(),
  items: z.array(shoppingListItemSchema),
});

export type ShoppingList = z.infer<typeof shoppingListSchema>;
export type ShoppingListItem = z.infer<typeof shoppingListItemSchema>;
export type ShoppingListCategory = z.infer<typeof shoppingListCategoryEnum>;
