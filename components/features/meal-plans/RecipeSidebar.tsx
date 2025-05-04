"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, Clock, Plus } from "lucide-react"
import Image from "next/image"
import type { Recipe } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRecipes } from "@/lib/hooks/use-recipes"
import { useRecipeStore } from "@/lib/store/recipe-store"

interface RecipeSidebarProps {
  onClose: () => void
  onAddRecipe: (recipe: Recipe, date: string, mealType: string) => void
  weekDates: Date[]
}

// 餐食类型
const mealTypes = [
  { id: "breakfast", name: "早餐" },
  { id: "lunch", name: "午餐" },
  { id: "dinner", name: "晚餐" },
]

export default function RecipeSidebar({ onClose, onAddRecipe, weekDates }: RecipeSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(formatDate(weekDates[0]))
  const [selectedMealType, setSelectedMealType] = useState(mealTypes[0].id)

  const { recentlyViewed } = useRecipeStore()
  const { data: recipesData, isLoading } = useRecipes({ limit: 10, search: searchTerm })

  const favoriteRecipes = recipesData?.recipes || []

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0]
  }

  function formatDateDisplay(date: Date) {
    return date.toLocaleDateString("zh-CN", { weekday: "short", month: "numeric", day: "numeric" })
  }

  const handleAddRecipe = (recipe: Recipe) => {
    onAddRecipe(recipe, selectedDate, selectedMealType)
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">添加食谱</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">选择日期</label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="选择日期" />
              </SelectTrigger>
              <SelectContent>
                {weekDates.map((date) => (
                  <SelectItem key={formatDate(date)} value={formatDate(date)}>
                    {formatDateDisplay(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">选择餐食</label>
            <Select value={selectedMealType} onValueChange={setSelectedMealType}>
              <SelectTrigger>
                <SelectValue placeholder="选择餐食" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索食谱..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="recipes">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="recipes" className="flex-1">
              食谱
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              最近使用
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-2 mt-0">
            {isLoading ? (
              <div className="text-center py-4">加载中...</div>
            ) : favoriteRecipes.length > 0 ? (
              favoriteRecipes.map((recipe) => <RecipeItem key={recipe.id} recipe={recipe} onAdd={handleAddRecipe} />)
            ) : (
              <div className="text-center py-4 text-muted-foreground">未找到食谱</div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-2 mt-0">
            {recentlyViewed.length > 0 ? (
              recentlyViewed.map((recipe) => <RecipeItem key={recipe.id} recipe={recipe} onAdd={handleAddRecipe} />)
            ) : (
              <div className="text-center py-4 text-muted-foreground">最近没有浏览过食谱</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface RecipeItemProps {
  recipe: Recipe
  onAdd: (recipe: Recipe) => void
}

function RecipeItem({ recipe, onAdd }: RecipeItemProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md border hover:bg-muted/50 transition-colors">
      <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
        <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{recipe.title}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{recipe.cookingTime} 分钟</span>
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={() => onAdd(recipe)}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
