import { create } from "zustand"
import type { Recipe } from "@/types"

type RecipeState = {
  recentlyViewed: Recipe[]
  favorites: string[]
  addToRecentlyViewed: (recipe: Recipe) => void
  toggleFavorite: (recipeId: string) => void
  isFavorite: (recipeId: string) => boolean
}

export const useRecipeStore = create<RecipeState>()((set, get) => ({
  recentlyViewed: [],
  favorites: [],
  addToRecentlyViewed: (recipe) =>
    set((state) => {
      const filtered = state.recentlyViewed.filter((item) => item.id !== recipe.id)
      return {
        recentlyViewed: [recipe, ...filtered].slice(0, 10), // Keep only the 10 most recent
      }
    }),
  toggleFavorite: (recipeId) =>
    set((state) => {
      const isFavorited = state.favorites.includes(recipeId)
      return {
        favorites: isFavorited ? state.favorites.filter((id) => id !== recipeId) : [...state.favorites, recipeId],
      }
    }),
  isFavorite: (recipeId) => get().favorites.includes(recipeId),
}))
