import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Recipe } from "@recipe-planner/types"

export type MealTime = "早餐" | "午餐" | "晚餐"
export type DayOfWeek = "周一" | "周二" | "周三" | "周四" | "周五" | "周六" | "周日"

export interface MealPlanItem {
  id: string
  recipeId: string
  recipe: Recipe
  day: DayOfWeek
  mealTime: MealTime
  servings: number
}

interface MealPlanState {
  currentWeekStart: Date
  items: MealPlanItem[]
  sidebarRecipes: Recipe[]
  isLoading: boolean
  error: string | null
  setCurrentWeekStart: (date: Date) => void
  addItem: (item: Omit<MealPlanItem, "id">) => void
  updateItem: (id: string, updates: Partial<Omit<MealPlanItem, "id">>) => void
  removeItem: (id: string) => void
  moveItem: (id: string, day: DayOfWeek, mealTime: MealTime) => void
  setSidebarRecipes: (recipes: Recipe[]) => void
  clearItems: () => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set) => ({
      currentWeekStart: getStartOfWeek(new Date()),
      items: [],
      sidebarRecipes: [],
      isLoading: false,
      error: null,
      setCurrentWeekStart: (date) => set({ currentWeekStart: date }),
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, { ...item, id: generateId() }],
        })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      moveItem: (id, day, mealTime) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, day, mealTime } : item)),
        })),
      setSidebarRecipes: (recipes) => set({ sidebarRecipes: recipes }),
      clearItems: () => set({ items: [] }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "meal-plan-storage",
    },
  ),
)

// Helper functions
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
