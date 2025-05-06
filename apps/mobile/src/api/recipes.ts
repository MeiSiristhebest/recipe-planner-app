import type { Recipe } from "../types/recipe"
import { API_URL } from "../constants/config"

type FetchRecipesParams = {
  query?: string
  category?: string
  difficulty?: string
  cookingTimeMax?: number
  tag?: string
  sort?: "newest" | "popular" | "rating"
  page?: number
  limit?: number
}

type FetchRecipesResponse = {
  recipes: Recipe[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export async function fetchRecipes(params: FetchRecipesParams = {}): Promise<FetchRecipesResponse> {
  const queryParams = new URLSearchParams()

  if (params.query) queryParams.append("query", params.query)
  if (params.category) queryParams.append("category", params.category)
  if (params.difficulty) queryParams.append("difficulty", params.difficulty)
  if (params.cookingTimeMax) queryParams.append("cookingTimeMax", params.cookingTimeMax.toString())
  if (params.tag) queryParams.append("tag", params.tag)
  if (params.sort) queryParams.append("sort", params.sort)
  if (params.page) queryParams.append("page", params.page.toString())
  if (params.limit) queryParams.append("limit", params.limit.toString())

  const response = await fetch(`${API_URL}/api/recipes?${queryParams.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch recipes")
  }

  return response.json()
}

export async function fetchRecipeById(id: string): Promise<Recipe> {
  const response = await fetch(`${API_URL}/api/recipes/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch recipe")
  }

  return response.json()
}

export async function toggleFavorite(id: string, token: string): Promise<{ favorited: boolean }> {
  const response = await fetch(`${API_URL}/api/recipes/${id}/favorite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to toggle favorite")
  }

  return response.json()
}

export async function rateRecipe(
  id: string,
  value: number,
  token: string,
): Promise<{
  rating: any
  averageRating: number
  totalRatings: number
}> {
  const response = await fetch(`${API_URL}/api/recipes/${id}/rating`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ value }),
  })

  if (!response.ok) {
    throw new Error("Failed to rate recipe")
  }

  return response.json()
}
