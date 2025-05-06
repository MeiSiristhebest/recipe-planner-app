"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DraggableRecipe } from "./draggable-recipe"
import { Search } from "lucide-react"
import type { Recipe } from "@recipe-planner/types"

interface RecipeSidebarProps {
  favoriteRecipes: Recipe[]
  recentRecipes: Recipe[]
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function RecipeSidebar({ favoriteRecipes, recentRecipes, onSearch, isLoading = false }: RecipeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="border rounded-lg p-4 h-full">
      <h3 className="text-lg font-medium mb-4">食谱库</h3>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索食谱..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <Tabs defaultValue="favorites">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites">我的收藏</TabsTrigger>
          <TabsTrigger value="recent">最近浏览</TabsTrigger>
        </TabsList>
        <TabsContent value="favorites" className="mt-2">
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : favoriteRecipes.length > 0 ? (
              favoriteRecipes.map((recipe) => (
                <DraggableRecipe
                  key={`favorite-${recipe.id}`}
                  id={`favorite-${recipe.id}`}
                  recipe={recipe}
                  showRemoveButton={false}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">暂无收藏食谱</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="recent" className="mt-2">
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : recentRecipes.length > 0 ? (
              recentRecipes.map((recipe) => (
                <DraggableRecipe
                  key={`recent-${recipe.id}`}
                  id={`recent-${recipe.id}`}
                  recipe={recipe}
                  showRemoveButton={false}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">暂无最近浏览食谱</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
