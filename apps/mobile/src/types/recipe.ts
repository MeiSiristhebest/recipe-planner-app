export type Recipe = {
  id: string
  title: string
  description?: string
  cookingTime: number
  servings: number
  difficulty: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  nutritionInfo?: Record<string, number>
  coverImage?: string
  createdAt: string
  updatedAt: string
  published: boolean
  author: {
    id: string
    name: string
    image?: string
  }
  categories: Category[]
  tags: Tag[]
  averageRating: number
  _count: {
    favorites: number
    ratings: number
  }
  isFavorited?: boolean
  userRating?: number | null
}

export type Ingredient = {
  name: string
  quantity: string
  category?: string
}

export type Instruction = {
  step: number
  content: string
  imageUrl?: string
}

export type Category = {
  id: string
  name: string
}

export type Tag = {
  id: string
  name: string
}
