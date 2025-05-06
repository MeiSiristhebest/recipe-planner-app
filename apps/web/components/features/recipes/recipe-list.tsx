"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "react-intersection-observer"
import { Card, CardContent, CardFooter } from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import type { Recipe } from "@recipe-planner/types"

interface RecipeListProps {
  searchParams: {
    query?: string
    category?: string
    difficulty?: string
    cookingTimeMax?: string
    tag?: string
    sort?: string
    page?: string
  }
}

interface RecipesResponse {
  recipes: Recipe[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export function RecipeList({ searchParams }: RecipeListProps) {
  const { ref, inView } = useInView()

  // 构建查询参数
  const buildQueryString = (page: number) => {
    const params = new URLSearchParams()

    if (searchParams.query) params.set("query", searchParams.query)
    if (searchParams.category) params.set("category", searchParams.category)
    if (searchParams.difficulty) params.set("difficulty", searchParams.difficulty)
    if (searchParams.cookingTimeMax) params.set("cookingTimeMax", searchParams.cookingTimeMax)
    if (searchParams.tag) params.set("tag", searchParams.tag)
    if (searchParams.sort) params.set("sort", searchParams.sort)
    params.set("page", page.toString())
    params.set("limit", "12")

    return params.toString()
  }

  // 获取食谱数据
  const fetchRecipes = async ({ pageParam = 1 }): Promise<RecipesResponse> => {
    const queryString = buildQueryString(pageParam)
    const response = await fetch(`/api/recipes?${queryString}`)

    if (!response.ok) {
      throw new Error("获取食谱失败")
    }

    return response.json()
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["recipes", searchParams],
    queryFn: fetchRecipes,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.page < lastPage.pagination.pages ? lastPage.pagination.page + 1 : undefined
    },
  })

  // 当视图中的加载更多元素可见时，加载下一页
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage])

  // 扁平化所有页面的食谱
  const recipes = data?.pages.flatMap((page) => page.recipes) || []
  const totalRecipes = data?.pages[0]?.pagination.total || 0

  if (status === "pending") {
    return <div className="text-center py-12">加载中...</div>
  }

  if (status === "error") {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">加载失败，请稍后再试</p>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">没有找到符合条件的食谱</p>
        <Button asChild variant="outline">
          <Link href="/recipes">清除筛选条件</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">显示 {totalRecipes} 个结果</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className="flex justify-center mt-8">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "加载中..." : "加载更多"}
          </Button>
        </div>
      )}
    </div>
  )
}

interface RecipeCardProps {
  recipe: Recipe
}

function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <Image src={recipe.coverImage || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold">{recipe.title}</h3>
            <p className="text-sm text-muted-foreground">烹饪时间: {recipe.cookingTime}分钟</p>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium">{recipe.averageRating?.toFixed(1) || "0.0"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-yellow-500 ml-1"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {recipe.categories?.slice(0, 1).map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            >
              {category.name}
            </span>
          ))}
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            {recipe.difficulty}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="secondary" className="w-full" asChild>
          <Link href={`/recipes/${recipe.id}`}>查看详情</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
