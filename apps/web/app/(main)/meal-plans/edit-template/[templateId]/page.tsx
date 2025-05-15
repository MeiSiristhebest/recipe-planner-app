"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/shared/auth-guard"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card"
import { Alert, AlertDescription } from "@repo/ui/alert"
import { AlertCircle, Loader2, Save, ArrowLeft } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core"
import { DroppableMealCell } from "@/components/features/meal-plans/droppable-meal-cell"
import { DraggableRecipe } from "@/components/features/meal-plans/draggable-recipe"
import { RecipeSidebar } from "@/components/features/meal-plans/recipe-sidebar"
import { RecipeSearchModal } from "@/components/features/meal-plans/recipe-search-modal"
import { useMealPlanStore } from "@/store/meal-plan-store"

// 定义膳食计划模板类型
type MealPlanTemplate = {
  id: string
  name: string
  items: Array<{
    id: string
    day: string
    mealTime: string
    recipeId: string
    servings: number
    recipe: {
      id: string
      title: string
      coverImage?: string
      cookingTime?: number
      difficulty?: string
    }
  }>
}

// 定义星期几
const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

// 定义餐次
const MEAL_TIMES = ["早餐", "午餐", "晚餐"]

export default function EditMealPlanTemplatePage() {
  return (
    <AuthGuard>
      <EditMealPlanTemplateContent />
    </AuthGuard>
  )
}

function EditMealPlanTemplateContent() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.templateId as string
  const { data: session } = useSession()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [template, setTemplate] = useState<MealPlanTemplate | null>(null)
  const [templateName, setTemplateName] = useState("")

  // 搜索和拖拽相关状态
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ day: string; mealTime: string } | null>(null)
  const [activeRecipe, setActiveRecipe] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [favoriteRecipesData, setFavoriteRecipesData] = useState<any[]>([])
  const [recentRecipesData, setRecentRecipesData] = useState<any[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)
  const [isLoadingGeneralRecipes, setIsLoadingGeneralRecipes] = useState(false)

  // 配置拖拽传感器
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
    })
  )

  // 获取模板数据
  useEffect(() => {
    async function fetchTemplate() {
      try {
        setIsFetching(true)
        const response = await fetch(`/api/meal-plans/templates/${templateId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("模板不存在")
            return
          }
          if (response.status === 403) {
            setError("无权编辑此模板")
            return
          }
          throw new Error("获取模板失败")
        }

        const data = await response.json()

        // 检查当前用户是否是作者
        if (session?.user?.id !== data.userId) {
          setError("无权编辑此模板")
          setIsAuthorized(false)
          return
        }

        setIsAuthorized(true)
        setTemplate(data)
        setTemplateName(data.name || "")

        // 将模板数据加载到 store 中
        const storeItems = data.items.map((item: any) => ({
          id: item.id,
          day: getDayFromDate(new Date(item.date)),
          mealTime: item.mealTime,
          recipeId: item.recipeId,
          servings: item.servings,
          recipe: item.recipe,
        }))

        // 清空当前 store 并加载模板数据
        useMealPlanStore.getState().clearItems()
        storeItems.forEach((item: any) => {
          useMealPlanStore.getState().addItem(item.day, item.mealTime, item.recipe, item.servings)
        })

        // 加载常用食谱数据
        fetchFavoriteRecipes()
        fetchRecentRecipes()
      } catch (error) {
        console.error("Error fetching template:", error)
        setError("获取模板失败，请稍后再试")
      } finally {
        setIsFetching(false)
      }
    }

    // 获取收藏的食谱
    async function fetchFavoriteRecipes() {
      try {
        setIsLoadingFavorites(true)
        const response = await fetch("/api/recipes/favorites")
        if (response.ok) {
          const data = await response.json()
          setFavoriteRecipesData(data)
        }
      } catch (error) {
        console.error("Error fetching favorite recipes:", error)
      } finally {
        setIsLoadingFavorites(false)
      }
    }

    // 获取最近浏览的食谱
    async function fetchRecentRecipes() {
      try {
        setIsLoadingRecent(true)
        const response = await fetch("/api/recipes/recent")
        if (response.ok) {
          const data = await response.json()
          setRecentRecipesData(data)
        }
      } catch (error) {
        console.error("Error fetching recent recipes:", error)
      } finally {
        setIsLoadingRecent(false)
      }
    }

    if (templateId && session?.user?.id) {
      fetchTemplate()
    }
  }, [templateId, session?.user?.id])

  // 从日期获取星期几
  function getDayFromDate(date: Date): string {
    const dayIndex = date.getDay()
    return DAYS[dayIndex === 0 ? 6 : dayIndex - 1] // 将星期日(0)转换为星期日(6)
  }

  // 处理单元格点击
  const handleCellClick = (day: string, mealTime: string) => {
    setSelectedCell({ day, mealTime })
    setSearchModalOpen(true)
  }

  // 处理拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedRecipe = useMealPlanStore.getState().items.find((item) => item.id === active.id)
    setActiveRecipe(draggedRecipe)
  }

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const draggedItem = useMealPlanStore.getState().items.find((item) => item.id === active.id)

      if (draggedItem && over.id) {
        const [day, mealTime] = (over.id as string).split("-")

        // 移除原位置的食谱
        useMealPlanStore.getState().removeItem(draggedItem.id)

        // 添加到新位置
        useMealPlanStore.getState().addItem(day, mealTime, draggedItem.recipe, draggedItem.servings)
      }
    }

    setActiveRecipe(null)
  }

  // 处理食谱搜索
  const handleSearchRecipes = async (query: string) => {
    try {
      setIsLoadingGeneralRecipes(true)
      const response = await fetch(`/api/recipes?query=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.recipes || [])
      }
    } catch (error) {
      console.error("Error searching recipes:", error)
    } finally {
      setIsLoadingGeneralRecipes(false)
    }
  }

  // 处理添加食谱
  const handleAddRecipes = (recipes: any[], day: string, mealTime: string) => {
    recipes.forEach((recipe) => {
      useMealPlanStore.getState().addItem(day, mealTime, recipe, 1)
    })
    setSearchModalOpen(false)
    setSelectedCell(null)
  }

  // 处理保存模板
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("请输入模板名称")
      return
    }

    try {
      setIsLoading(true)

      const currentItems = useMealPlanStore.getState().items

      if (currentItems.length === 0) {
        toast.error("模板中至少需要一个食谱")
        setIsLoading(false)
        return
      }

      // 准备提交数据
      const templateData = {
        id: templateId,
        name: templateName,
        isTemplate: true,
        items: currentItems.map((item) => ({
          day: item.day,
          mealTime: item.mealTime,
          recipeId: item.recipe.id,
          servings: item.servings,
        })),
      }

      // 发送更新请求
      const response = await fetch(`/api/meal-plans/templates/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "更新模板失败")
      }

      toast.success("模板更新成功")
      router.push("/meal-plans")
    } catch (error) {
      console.error("Error updating template:", error)
      setError(error instanceof Error ? error.message : "更新模板失败，请稍后再试")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">编辑膳食计划模板</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">加载中...</span>
        </div>
      </div>
    )
  }

  if (error && !isAuthorized) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">编辑膳食计划模板</h1>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/meal-plans")}>返回膳食计划</Button>
      </div>
    )
  }

  // 从 store 获取当前的膳食计划项目
  const mealPlanItems = useMealPlanStore((state) => state.items)

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">编辑膳食计划模板</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push("/meal-plans")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <Button onClick={handleSaveTemplate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                保存模板
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>模板信息</CardTitle>
          <CardDescription>编辑模板的基本信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">模板名称</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="例如：健康减脂周计划"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* 主要膳食计划表格 */}
          <div className="lg:col-span-6 overflow-x-auto">
            <div className="min-w-[600px] bg-white rounded-lg shadow overflow-hidden">
              {/* 表头 */}
              <div className="grid grid-cols-4 bg-muted">
                <div className="p-3 font-medium border-r"></div>
                {MEAL_TIMES.map((mealTime) => (
                  <div key={mealTime} className="p-3 font-medium text-center border-r last:border-r-0">
                    {mealTime}
                  </div>
                ))}
              </div>

              {/* 表格内容 */}
              <div className="divide-y">
                {DAYS.map((day) => (
                  <div key={day} className="grid grid-cols-4">
                    <div className="p-3 font-medium border-r flex items-center">{day}</div>
                    {MEAL_TIMES.map((mealTime) => {
                      const cellId = `${day}-${mealTime}`
                      const recipes = mealPlanItems.filter(
                        (item) => item.day === day && item.mealTime === mealTime
                      )

                      return (
                        <DroppableMealCell
                          key={cellId}
                          id={cellId}
                          recipes={recipes}
                          onAddClick={() => handleCellClick(day, mealTime)}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 block sm:hidden">
              ← 左右滑动查看更多 →
            </p>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-2">
            <RecipeSidebar />
          </div>
        </div>

        {/* 拖拽覆盖层 */}
        <DragOverlay>
          {activeRecipe && (
            <DraggableRecipe
              id={activeRecipe.id}
              recipe={activeRecipe.recipe}
              servings={activeRecipe.servings}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* 食谱搜索模态框 */}
      {selectedCell && (
        <RecipeSearchModal
          isOpen={searchModalOpen}
          onClose={() => {
            setSearchModalOpen(false)
            setSelectedCell(null)
          }}
          onConfirmSelection={(recipes) => selectedCell && handleAddRecipes(recipes, selectedCell.day, selectedCell.mealTime)}
          day={selectedCell.day}
          mealTime={selectedCell.mealTime}
          favoriteRecipes={favoriteRecipesData || []}
          recentRecipes={recentRecipesData || []}
          searchResults={searchResults}
          onSearch={handleSearchRecipes}
          isLoading={isLoadingFavorites || isLoadingRecent || isLoadingGeneralRecipes}
        />
      )}
    </div>
  )
}
