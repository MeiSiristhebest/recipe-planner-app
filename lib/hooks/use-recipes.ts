"use client"

import { useQuery } from "@tanstack/react-query"
import type { Recipe } from "@/types"

interface RecipesResponse {
  recipes: Recipe[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface RecipesQueryParams {
  page?: number
  limit?: number
  category?: string
  difficulty?: string
  cookingTime?: string
  tags?: string[]
  search?: string
  sort?: "latest" | "popular" | "rating"
}

export function useRecipes(params: RecipesQueryParams = {}) {
  const { page = 1, limit = 10, category, difficulty, cookingTime, tags, search, sort = "latest" } = params

  return useQuery<RecipesResponse>({
    queryKey: ["recipes", { page, limit, category, difficulty, cookingTime, tags, search, sort }],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.append("page", page.toString())
      searchParams.append("limit", limit.toString())
      if (category) searchParams.append("category", category)
      if (difficulty) searchParams.append("difficulty", difficulty)
      if (cookingTime) searchParams.append("cookingTime", cookingTime)
      if (tags && tags.length > 0) searchParams.append("tags", tags.join(","))
      if (search) searchParams.append("search", search)
      if (sort) searchParams.append("sort", sort)

      const response = await fetch(`/api/recipes?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error("获取食谱失败")
      }
      return response.json()
    },
  })
}

export function useRecipe(id: string) {
  return useQuery<Recipe>({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const response = await fetch(`/api/recipes/${id}`)
      if (!response.ok) {
        throw new Error("获取食谱详情失败")
      }
      return response.json()
    },
    enabled: !!id,
  })
}
