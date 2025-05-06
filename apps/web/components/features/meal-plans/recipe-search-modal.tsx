"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@repo/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@repo/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Card, CardContent } from "@repo/ui/card"
import { Search } from "lucide-react"
import Image from "next/image"
import type { Recipe } from "@recipe-planner/types"
import type { DayOfWeek, MealTime } from "@/store/meal-plan-store"

interface RecipeSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectRecipe: (recipe: Recipe, day: DayOfWeek, mealTime: MealTime) => void
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
  onSelectRecipe,
  day,
  mealTime,
  favoriteRecipes,
  recentRecipes,
  searchResults,
  onSearch,
  isLoading = false,
}: RecipeSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            添加食谱到 {day} {mealTime}
          </DialogTitle>
          <DialogDescription>
            通过搜索、从收藏或最近浏览中选择食谱添加到您的餐饮计划中。
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
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">搜索中...</div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                  {searchResults.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onSelectRecipe(recipe, day, mealTime)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "没有找到匹配的食谱" : "请输入搜索关键词"}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4 pt-4">
              {favoriteRecipes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                  {favoriteRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onSelectRecipe(recipe, day, mealTime)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">暂无收藏食谱</div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4 pt-4">
              {recentRecipes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                  {recentRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onSelectRecipe(recipe, day, mealTime)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">暂无最近浏览食谱</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
}

function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-muted/50" onClick={onClick}>
      <CardContent className="p-3">
        <div className="relative h-24 w-full rounded-md overflow-hidden mb-2">
          <Image src={recipe.coverImage || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
        </div>
        <h4 className="font-medium text-sm">{recipe.title}</h4>
        <p className="text-xs text-muted-foreground">烹饪时间: {recipe.cookingTime}分钟</p>
      </CardContent>
    </Card>
  )
}
