"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Save, FileDown, Trash2 } from "lucide-react"
import { DroppableMealCell } from "@/components/features/meal-plans/droppable-meal-cell"
import { DraggableRecipe } from "@/components/features/meal-plans/draggable-recipe"
import { RecipeSidebar } from "@/components/features/meal-plans/recipe-sidebar"
import { RecipeSearchModal } from "@/components/features/meal-plans/recipe-search-modal"
import { TemplateModal } from "@/components/features/meal-plans/template-modal"
import { useMealPlanStore, type DayOfWeek, type MealTime } from "@/store/meal-plan-store"
import { addDays } from "date-fns"
import type { Recipe } from "@recipe-planner/types"

const DAYS: DayOfWeek[] = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
const MEAL_TIMES: MealTime[] = ["早餐", "午餐", "晚餐"]

export default function MealPlansPage() {
  const {
    currentWeekStart,
    items,
    sidebarRecipes,
    setCurrentWeekStart,
    addItem,
    removeItem,
    moveItem,
    setSidebarRecipes,
  } = useMealPlanStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ day: DayOfWeek; mealTime: MealTime } | null>(null)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [templateMode, setTemplateMode] = useState<"save" | "load">("save")

  // Sample data for demo purposes
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([])
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([])
  const [searchResults, setSearchResults] = useState<Recipe[]>([])
  const [templates, setTemplates] = useState<
    Array<{
      id: string
      name: string
      items: typeof items
    }>
  >([])

  // Fetch recipes
  const { data: recipesData, isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      // In a real app, this would be an API call
      return {
        recipes: [
          {
            id: "1",
            title: "香煎三文鱼配芦笋",
            description: "简单美味的香煎三文鱼，搭配新鲜芦笋，是一道健康又美味的主菜。",
            cookingTime: 30,
            servings: 2,
            difficulty: "中等",
            coverImage: "/placeholder.svg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
            author: {
              id: "1",
              name: "张厨师",
              image: "/placeholder.svg",
            },
            categories: [{ id: "1", name: "家常菜" }],
            tags: [{ id: "1", name: "高蛋白" }],
            averageRating: 4.5,
            _count: {
              favorites: 10,
              ratings: 5,
            },
          },
          {
            id: "2",
            title: "番茄鸡蛋面",
            description: "简单快手的家常面食，酸甜可口，营养丰富。",
            cookingTime: 15,
            servings: 1,
            difficulty: "简单",
            coverImage: "/placeholder.svg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
            author: {
              id: "1",
              name: "张厨师",
              image: "/placeholder.svg",
            },
            categories: [{ id: "2", name: "快手菜" }],
            tags: [],
            averageRating: 4.2,
            _count: {
              favorites: 8,
              ratings: 4,
            },
          },
        ],
      }
    },
  })

  useEffect(() => {
    if (recipesData) {
      setFavoriteRecipes(recipesData.recipes)
      setRecentRecipes(recipesData.recipes)
      setSidebarRecipes(recipesData.recipes)
    }
  }, [recipesData, setSidebarRecipes])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    // If dragging from sidebar
    if (typeof active.id === "string" && active.id.includes("-")) {
      const [source, recipeId] = active.id.split("-")
      const recipe =
        source === "favorite"
          ? favoriteRecipes.find((r) => r.id === recipeId)
          : recentRecipes.find((r) => r.id === recipeId)

      if (recipe) {
        setActiveRecipe(recipe)
      }
    } else {
      // If dragging from meal plan
      const item = items.find((item) => item.id === active.id)
      if (item) {
        setActiveRecipe(item.recipe)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveRecipe(null)

    if (!over) return

    // If dropping onto a cell
    if (typeof over.id === "string" && over.id.includes("-cell")) {
      const [day, mealTime] = over.id.split("-cell-") as [DayOfWeek, MealTime]

      // If dragging from sidebar
      if (typeof active.id === "string" && active.id.includes("-")) {
        const [source, recipeId] = active.id.split("-")
        const recipe =
          source === "favorite"
            ? favoriteRecipes.find((r) => r.id === recipeId)
            : recentRecipes.find((r) => r.id === recipeId)

        if (recipe) {
          addItem({
            recipeId: recipe.id,
            recipe,
            day,
            mealTime,
            servings: 1,
          })
        }
      } else {
        // If dragging from another cell
        moveItem(active.id as string, day, mealTime)
      }
    }
  }

  const handleSearchRecipes = (query: string) => {
    // In a real app, this would be an API call
    setSearchResults(
      recipesData?.recipes.filter((recipe) => recipe.title.toLowerCase().includes(query.toLowerCase())) || [],
    )
  }

  const handleAddRecipe = (recipe: Recipe, day: DayOfWeek, mealTime: MealTime) => {
    addItem({
      recipeId: recipe.id,
      recipe,
      day,
      mealTime,
      servings: 1,
    })
    setSearchModalOpen(false)
    setSelectedCell(null)
  }

  const handleOpenAddModal = (day: DayOfWeek, mealTime: MealTime) => {
    setSelectedCell({ day, mealTime })
    setSearchModalOpen(true)
  }

  const handleSaveTemplate = (name: string) => {
    // In a real app, this would be an API call
    const newTemplate = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      items,
    }
    setTemplates([...templates, newTemplate])
  }

  const handleLoadTemplate = (templateId: string) => {
    // In a real app, this would be an API call
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      // Clear current items and add template items
      useMealPlanStore.getState().clearItems()
      template.items.forEach((item) => {
        addItem(item)
      })
    }
    setTemplateModalOpen(false)
  }

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  // Format the week range (e.g., "2023年12月18日 - 12月24日")
  const formatWeekRange = () => {
    const startOfWeek = currentWeekStart
    const endOfWeek = addDays(startOfWeek, 6)

    const startMonth = startOfWeek.getMonth() + 1
    const startDay = startOfWeek.getDate()
    const endMonth = endOfWeek.getMonth() + 1
    const endDay = endOfWeek.getDate()
    const year = startOfWeek.getFullYear()

    return `${year}年${startMonth}月${startDay}日 - ${endMonth}月${endDay}日`
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">周计划</h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm md:text-base font-medium min-w-[200px] text-center">{formatWeekRange()}</span>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <RecipeSidebar
            favoriteRecipes={favoriteRecipes}
            recentRecipes={recentRecipes}
            onSearch={handleSearchRecipes}
            isLoading={isLoading}
          />
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 gap-2">
                  {/* Header Row */}
                  <div className="p-2"></div>
                  {DAYS.map((day) => (
                    <div key={day} className="p-2 font-medium text-center">
                      {day}
                    </div>
                  ))}

                  {/* Meal Time Rows */}
                  {MEAL_TIMES.map((mealTime) => (
                    <React.Fragment key={mealTime}>
                      <div className="p-2 font-medium flex items-center">{mealTime}</div>
                      {DAYS.map((day) => {
                        const cellId = `${day}-cell-${mealTime}`
                        const cellItems = items.filter((item) => item.day === day && item.mealTime === mealTime)

                        return (
                          <DroppableMealCell
                            key={cellId}
                            id={cellId}
                            items={cellItems}
                            onAddClick={() => handleOpenAddModal(day, mealTime)}
                            onRemoveItem={removeItem}
                          />
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeId && activeRecipe && (
                <DraggableRecipe id={activeId} recipe={activeRecipe} showRemoveButton={false} />
              )}
            </DragOverlay>
          </DndContext>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                setTemplateMode("save")
                setTemplateModalOpen(true)
              }}
            >
              <Save className="h-4 w-4" />
              保存为模板
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setTemplateMode("load")
                setTemplateModalOpen(true)
              }}
            >
              <FileDown className="h-4 w-4" />
              加载模板
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => useMealPlanStore.getState().clearItems()}
            >
              <Trash2 className="h-4 w-4" />
              清空本周计划
            </Button>
            <Button variant="secondary" className="ml-auto">
              生成购物清单
            </Button>
          </div>
        </div>
      </div>

      {/* Recipe Search Modal */}
      {selectedCell && (
        <RecipeSearchModal
          isOpen={searchModalOpen}
          onClose={() => {
            setSearchModalOpen(false)
            setSelectedCell(null)
          }}
          onSelectRecipe={handleAddRecipe}
          day={selectedCell.day}
          mealTime={selectedCell.mealTime}
          favoriteRecipes={favoriteRecipes}
          recentRecipes={recentRecipes}
          searchResults={searchResults}
          onSearch={handleSearchRecipes}
          isLoading={isLoading}
        />
      )}

      {/* Template Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        onLoad={handleLoadTemplate}
        templates={templates}
        mode={templateMode}
      />
    </div>
  )
}
