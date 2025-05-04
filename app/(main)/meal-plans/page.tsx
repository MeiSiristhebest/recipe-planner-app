"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus, Save, Download, Trash2 } from "lucide-react"
import DraggableMealPlanGrid from "@/components/features/meal-plans/DraggableMealPlanGrid"
import RecipeSidebar from "@/components/features/meal-plans/RecipeSidebar"
import type { MealPlanItem, Recipe } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

export default function MealPlansPage() {
  const { toast } = useToast()
  const [showSidebar, setShowSidebar] = useState(false)
  const [mealItems, setMealItems] = useState<MealPlanItem[]>([])

  // 获取当前周的日期
  const today = new Date()
  const currentWeekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - today.getDay() + i)
    return date
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
  }

  const handleAddRecipe = (recipe: Recipe, date: string, mealType: string) => {
    const newItem: MealPlanItem = {
      id: uuidv4(),
      date,
      mealType,
      recipe,
      position: mealItems.length,
    }

    setMealItems([...mealItems, newItem])
    setShowSidebar(false)

    toast({
      title: "已添加到周计划",
      description: `${recipe.title} 已添加到 ${new Date(date).toLocaleDateString("zh-CN")} 的${
        mealType === "breakfast" ? "早餐" : mealType === "lunch" ? "午餐" : "晚餐"
      }`,
    })
  }

  const handleClearPlan = () => {
    setMealItems([])
    toast({
      title: "已清空周计划",
      description: "所有餐食项目已被移除",
    })
  }

  const handleSaveAsTemplate = () => {
    // 实际应用中，这里会调用API保存模板
    toast({
      title: "已保存为模板",
      description: "您的周计划已保存为模板",
    })
  }

  const handleGenerateShoppingList = () => {
    // 实际应用中，这里会调用API生成购物清单
    toast({
      title: "已生成购物清单",
      description: "根据您的周计划生成了购物清单",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">周计划</h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {formatDate(currentWeekDates[0])} - {formatDate(currentWeekDates[6])}
          </span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:flex-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加食谱
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveAsTemplate}>
                    <Save className="h-4 w-4 mr-1" />
                    保存为模板
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    加载模板
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearPlan}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    清空计划
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <DraggableMealPlanGrid
                  weekDates={currentWeekDates}
                  mealItems={mealItems}
                  onMealItemsChange={setMealItems}
                />
              </div>

              <div className="mt-6 flex justify-center">
                <Button onClick={handleGenerateShoppingList}>生成购物清单</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {showSidebar && (
          <div className="w-full lg:w-80">
            <RecipeSidebar
              onClose={() => setShowSidebar(false)}
              onAddRecipe={handleAddRecipe}
              weekDates={currentWeekDates}
            />
          </div>
        )}
      </div>
    </div>
  )
}
