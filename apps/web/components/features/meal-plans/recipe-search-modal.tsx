"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Input } from "@repo/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog"
import { Button } from "@repo/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Card, CardContent } from "@repo/ui/card"
import { Search, CheckCircle } from "lucide-react"
import Image from "next/image"
import type { Recipe } from "@recipe-planner/types"
import type { DayOfWeek, MealTime } from "@/store/meal-plan-store"

interface RecipeSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmSelection: (recipes: Recipe[], day: DayOfWeek, mealTime: MealTime) => void
  day: DayOfWeek
  mealTime: MealTime
  favoriteRecipes: Recipe[]
  recentRecipes: Recipe[]
  searchResults: Recipe[]
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function RecipeSearchModal({
  isOpen,
  onClose,
  onConfirmSelection,
  day,
  mealTime,
  favoriteRecipes,
  recentRecipes,
  searchResults,
  onSearch,
  isLoading = false,
}: RecipeSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const toggleRecipeSelection = (recipeId: string) => {
    setSelectedRecipeIds((prevSelectedIds) =>
      prevSelectedIds.includes(recipeId)
        ? prevSelectedIds.filter((id) => id !== recipeId)
        : [...prevSelectedIds, recipeId]
    )
  }

  const allAvailableRecipes = useMemo(() => {
    const recipesMap = new Map<string, Recipe>();
    [...favoriteRecipes, ...recentRecipes, ...searchResults].forEach(recipe => {
      if (recipe && recipe.id && !recipesMap.has(recipe.id)) {
        recipesMap.set(recipe.id, recipe);
      }
    });
    return Array.from(recipesMap.values());
  }, [favoriteRecipes, recentRecipes, searchResults]);
  

  const handleConfirm = () => {
    const recipesToConfirm = allAvailableRecipes.filter(recipe => selectedRecipeIds.includes(recipe.id));
    onConfirmSelection(recipesToConfirm, day, mealTime)
    setSelectedRecipeIds([])
    onClose()
  }

  const renderRecipeList = (recipes: Recipe[], listName: string) => {
    if (isLoading && listName === "search") {
      return <div className="text-center py-8 text-muted-foreground">搜索中...</div>
    }
    if (!recipes || recipes.length === 0) {
      let message = "暂无食谱";
      if (listName === "search") {
        message = searchQuery ? "没有找到匹配的食谱" : "请输入搜索关键词";
      } else if (listName === "favorites") {
        message = "暂无收藏食谱";
      } else if (listName === "recent") {
        message = "暂无最近浏览食谱";
      }
      return <div className="text-center py-8 text-muted-foreground">{message}</div>
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSelected={selectedRecipeIds.includes(recipe.id)}
            onToggleSelect={() => toggleRecipeSelection(recipe.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setSelectedRecipeIds([]);
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            添加到 {day} {mealTime}
          </DialogTitle>
          <DialogDescription>
            勾选食谱，然后点击"确认添加"按钮。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索食谱..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <Tabs defaultValue="search">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">搜索结果</TabsTrigger>
              <TabsTrigger value="favorites">我的收藏</TabsTrigger>
              <TabsTrigger value="recent">最近浏览</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4 pt-4">
              {renderRecipeList(searchResults, "search")}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4 pt-4">
              {renderRecipeList(favoriteRecipes, "favorites")}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4 pt-4">
              {renderRecipeList(recentRecipes, "recent")}
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); setSelectedRecipeIds([]); }}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={selectedRecipeIds.length === 0}>
            确认添加 ({selectedRecipeIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface RecipeCardProps {
  recipe: Recipe
  isSelected: boolean
  onToggleSelect: () => void
}

function RecipeCard({ recipe, isSelected, onToggleSelect }: RecipeCardProps) {
  return (
    <Card 
      className={`cursor-pointer hover:bg-muted/50 relative ${isSelected ? 'border-primary ring-2 ring-primary' : ''}`}
      onClick={onToggleSelect}
    >
      {isSelected && (
        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
          <CheckCircle className="h-4 w-4" />
        </div>
      )}
      <CardContent className="p-3">
        <div className="relative h-24 w-full rounded-md overflow-hidden mb-2">
          <Image 
            src={recipe.coverImage || "/placeholder.svg"} 
            alt={recipe.title} 
            fill sizes="100vw"
            className="object-cover" />
        </div>
        <h4 className="font-medium text-sm truncate">{recipe.title}</h4>
        <p className="text-xs text-muted-foreground">烹饪时间: {recipe.cookingTime}分钟</p>
      </CardContent>
    </Card>
  )
}
