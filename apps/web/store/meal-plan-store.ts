import { create } from "zustand"
import { persist, type PersistStorage } from "zustand/middleware"
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
  setCurrentWeekStart: (date: Date | string | number) => void
  addItem: (item: Omit<MealPlanItem, "id">) => void
  updateItem: (id: string, updates: Partial<Omit<MealPlanItem, "id">>) => void
  removeItem: (id: string) => void
  moveItem: (id: string, day: DayOfWeek, mealTime: MealTime) => void
  setSidebarRecipes: (recipes: Recipe[]) => void
  clearItems: () => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

// Helper to ensure a Date object is always a Date object (e.g., after JSON stringify/parse)
const ensureDate = (date: string | Date | number): Date => {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set) => ({
      currentWeekStart: getStartOfWeek(new Date()),
      items: [],
      sidebarRecipes: [],
      isLoading: false,
      error: null,
      setCurrentWeekStart: (date) => {
        const newDate = ensureDate(date);
        set({ currentWeekStart: getStartOfWeek(newDate) });
      },
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
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const { state, version } = JSON.parse(str);
          
          // Manually revive dates
          if (state && typeof state.currentWeekStart === 'string') {
            state.currentWeekStart = new Date(state.currentWeekStart);
          }
          // Example for items if they also contain dates that need revival
          // if (state && state.items) {
          //   state.items = state.items.map((item: MealPlanItem) => ({
          //     ...item,
          //     // Assuming recipe.createdAt and recipe.updatedAt are stored as strings
          //     recipe: { 
          //       ...item.recipe,
          //       ...(item.recipe.createdAt && { createdAt: new Date(item.recipe.createdAt) }),
          //       ...(item.recipe.updatedAt && { updatedAt: new Date(item.recipe.updatedAt) }),
          //     }
          //   }));
          // }
          return { state, version };
        },
        setItem: (name: string, value: { state: MealPlanState, version?: number }) => {
          // Dates are automatically stringified to ISO format by JSON.stringify
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string) => localStorage.removeItem(name),
      } as PersistStorage<MealPlanState>, // Type assertion if needed
    },
  ),
)

// Helper functions
function getStartOfWeek(date: Date): Date {
  const d = new Date(date) // Clone date to avoid mutating original
  const day = d.getDay()
  // Adjust when day is Sunday (0) to be the start of the week (Monday)
  // or keep as is if week starts on Sunday based on locale.
  // This logic assumes week starts on Monday.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) 
  d.setDate(diff)
  d.setHours(0, 0, 0, 0) // Reset time to start of the day
  return d
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
