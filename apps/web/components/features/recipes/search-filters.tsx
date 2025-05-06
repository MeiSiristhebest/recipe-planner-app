"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Clock, ChefHat, Tag } from "lucide-react"

interface SearchFiltersProps {
  onSearch?: (filters: SearchFilters) => void
  className?: string
}

export interface SearchFilters {
  query: string
  category?: string
  difficulty?: string
  cookingTimeMax?: number
  tag?: string
  sort?: "newest" | "popular" | "rating"
}

export function SearchFilters({ onSearch, className = "" }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("query") || "",
    category: searchParams.get("category") || undefined,
    difficulty: searchParams.get("difficulty") || undefined,
    cookingTimeMax: searchParams.get("cookingTimeMax") ? Number(searchParams.get("cookingTimeMax")) : undefined,
    tag: searchParams.get("tag") || undefined,
    sort: (searchParams.get("sort") as "newest" | "popular" | "rating") || "newest",
  })

  const [cookingTimeValue, setCookingTimeValue] = useState<number[]>([filters.cookingTimeMax || 60])

  // 当URL参数变化时更新本地状态
  useEffect(() => {
    setFilters({
      query: searchParams.get("query") || "",
      category: searchParams.get("category") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      cookingTimeMax: searchParams.get("cookingTimeMax") ? Number(searchParams.get("cookingTimeMax")) : undefined,
      tag: searchParams.get("tag") || undefined,
      sort: (searchParams.get("sort") as "newest" | "popular" | "rating") || "newest",
    })

    setCookingTimeValue([searchParams.get("cookingTimeMax") ? Number(searchParams.get("cookingTimeMax")) : 60])
  }, [searchParams])

  const handleSearch = () => {
    // 构建查询参数
    const params = new URLSearchParams()

    if (filters.query) params.set("query", filters.query)
    if (filters.category) params.set("category", filters.category)
    if (filters.difficulty) params.set("difficulty", filters.difficulty)
    if (filters.cookingTimeMax) params.set("cookingTimeMax", filters.cookingTimeMax.toString())
    if (filters.tag) params.set("tag", filters.tag)
    if (filters.sort) params.set("sort", filters.sort)

    // 更新URL
    router.push(`/recipes?${params.toString()}`)

    // 如果提供了回调函数，则调用
    if (onSearch) {
      onSearch(filters)
    }
  }

  const handleReset = () => {
    setFilters({
      query: "",
      category: undefined,
      difficulty: undefined,
      cookingTimeMax: undefined,
      tag: undefined,
      sort: "newest",
    })
    setCookingTimeValue([60])
    router.push("/recipes")
  }

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? undefined : category,
    }))
  }

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tag: prev.tag === tag ? undefined : tag,
    }))
  }

  const handleCookingTimeChange = (value: number[]) => {
    setCookingTimeValue(value)
    setFilters((prev) => ({
      ...prev,
      cookingTimeMax: value[0],
    }))
  }

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">筛选</h2>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          重置
        </Button>
      </div>

      {/* 搜索 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索食谱..."
            className="pl-8 w-full"
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
      </div>

      {/* 分类 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          分类
        </h3>
        <div className="space-y-2">
          {["快手菜", "家常菜", "烘焙", "汤羹", "早餐", "午餐", "晚餐"].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.category === category}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <Label htmlFor={`category-${category}`} className="text-sm font-normal">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* 烹饪时间 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          烹饪时间
        </h3>
        <div className="px-2">
          <Slider value={cookingTimeValue} max={120} step={15} onValueChange={handleCookingTimeChange} />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>15分钟</span>
            <span>{cookingTimeValue[0]}分钟</span>
            <span>120分钟+</span>
          </div>
        </div>
      </div>

      {/* 难度 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <ChefHat className="h-4 w-4 mr-2" />
          难度
        </h3>
        <Select
          value={filters.difficulty || ""}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, difficulty: value || undefined }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择难度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="简单">简单</SelectItem>
            <SelectItem value="中等">中等</SelectItem>
            <SelectItem value="困难">困难</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 特殊标签 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          特殊标签
        </h3>
        <div className="space-y-2">
          {["素食", "低卡", "无麸质", "高蛋白", "儿童友好"].map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox id={`tag-${tag}`} checked={filters.tag === tag} onCheckedChange={() => handleTagToggle(tag)} />
              <Label htmlFor={`tag-${tag}`} className="text-sm font-normal">
                {tag}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* 排序 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">排序方式</h3>
        <Select
          value={filters.sort || "newest"}
          onValueChange={(value: "newest" | "popular" | "rating") => setFilters((prev) => ({ ...prev, sort: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">最新发布</SelectItem>
            <SelectItem value="popular">最受欢迎</SelectItem>
            <SelectItem value="rating">评分最高</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full" onClick={handleSearch}>
        应用筛选
      </Button>
    </div>
  )
}
