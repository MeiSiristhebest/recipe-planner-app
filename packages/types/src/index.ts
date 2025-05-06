// 共享类型定义

// 用户类型
export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 食谱类型
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  cookingTime: number;
  servings: number;
  difficulty: "简单" | "中等" | "困难";
  ingredients: Ingredient[];
  instructions: Instruction[];
  nutritionInfo?: NutritionInfo;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  authorId: string;
  author?: User;
  categories?: Category[];
  tags?: Tag[];
}

// 食材类型
export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
}

// 步骤类型
export interface Instruction {
  step: number;
  content: string;
  image?: string;
}

// 营养信息类型
export interface NutritionInfo {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
}

// 标签类型
export interface Tag {
  id: string;
  name: string;
}

// 周计划类型
export interface MealPlan {
  id: string;
  name?: string;
  startDate: Date | string;
  endDate: Date | string;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  items?: MealPlanItem[];
}

// 周计划项目类型
export interface MealPlanItem {
  id: string;
  date: Date | string;
  mealTime: "早餐" | "午餐" | "晚餐";
  mealPlanId: string;
  recipeId: string;
  recipe?: Recipe;
  servings: number;
  createdAt: Date;
  updatedAt: Date;
}

// 购物清单类型
export interface ShoppingList {
  id: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  items?: ShoppingListItem[];
}

// 购物清单项目类型
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  category: "蔬菜水果" | "肉类海鲜" | "乳制品蛋类" | "调味品干货" | "其他";
  completed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  shoppingListId: string;
}

// 评论类型
export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
  recipeId: string;
  recipe?: Recipe;
}

// 评分类型
export interface Rating {
  id: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: User;
  recipeId: string;
  recipe?: Recipe;
}

// API响应类型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
