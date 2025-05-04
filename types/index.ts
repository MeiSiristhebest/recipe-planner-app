export interface Recipe {
  id: string
  title: string
  description?: string
  image?: string
  cookingTime: number
  difficulty: string
  servings: number
  rating?: number
  category: string
  tags?: string[]
  author?: {
    id: string
    name: string
    image?: string
  }
  ingredients?: Ingredient[]
  instructions?: Instruction[]
  nutrition?: Nutrition
  createdAt?: string
  updatedAt?: string
}

export interface Ingredient {
  name: string
  quantity: string
  unit: string
  note?: string
}

export interface Instruction {
  step: number
  description: string
  image?: string
}

export interface Nutrition {
  calories: number
  protein: number
  fat: number
  carbs: number
}

export interface MealPlan {
  id: string
  name?: string
  weekStartDate: string
  isTemplate: boolean
  items: MealPlanItem[]
  createdAt?: string
  updatedAt?: string
}

export interface MealPlanItem {
  id: string
  date: string
  mealType: string
  recipe: Recipe
  position: number
}

export interface ShoppingList {
  id: string
  items: ShoppingListItem[]
  createdAt?: string
  updatedAt?: string
}

export interface ShoppingListItem {
  id: string
  name: string
  quantity: string
  unit: string
  category: string
  isChecked: boolean
  notes?: string
  recipeId?: string
}

export interface Comment {
  id: string
  content: string
  user: {
    id: string
    name: string
    image?: string
  }
  rating?: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
}

export interface Tag {
  id: string
  name: string
}
