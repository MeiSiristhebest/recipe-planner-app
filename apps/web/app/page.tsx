"use client";

import Link from "next/link"
import Image from "next/image"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Card, CardContent, CardFooter } from "@repo/ui/card"
import { Search, Star } from "lucide-react"
import { toast } from "sonner"
import { useQuery } from '@tanstack/react-query'
import { type Recipe } from '@recipe-planner/types'
import { Skeleton } from "@repo/ui/skeleton"

// API function to fetch recipes (adjust URL and params as needed)
async function fetchFeaturedRecipes(): Promise<{ recipes: Recipe[], total: number }> {
  // Fetch, for example, 6 recipes sorted by rating or creation date
  const response = await fetch('/api/recipes?limit=6&sort=newest') // Or sort=rating_desc
  if (!response.ok) {
    throw new Error('Failed to fetch recipes')
  }
  return response.json()
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  探索美味食谱，规划健康生活
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">轻松查找、分享、计划你的每一餐</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="搜索食谱、食材或关键词..." className="pl-8 w-full" />
                </div>
                <Button asChild>
                  <Link href="/recipes" key="hero-search-link">搜索</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&h=500&auto=format&fit=crop" // Fixed Hero Image
                alt="美味食谱"
                width={500}
                height={500}
                className="rounded-lg object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <FeaturedRecipes />

      {/* Quick Access */}
      <section className="w-full py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">快速访问</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">管理你的餐饮计划和购物清单</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">我的本周计划</h3>
                <p className="text-sm text-muted-foreground mt-2">查看和管理你的每周餐饮计划</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/meal-plans" key="meal-plans-link">查看计划</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">购物清单概览</h3>
                <p className="text-sm text-muted-foreground mt-2">管理你的购物清单，确保不会遗漏任何食材</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/shopping-list" key="shopping-list-link">查看清单</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">最近浏览的食谱</h3>
                <p className="text-sm text-muted-foreground mt-2">快速访问你最近浏览过的食谱</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/recipes" key="quick-access-recipes-link">查看食谱</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

// New component for featured recipes section to handle data fetching
function FeaturedRecipes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['featuredRecipes'],
    queryFn: fetchFeaturedRecipes,
  })

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">本周热门推荐</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">发现最受欢迎的美味食谱，开启你的烹饪之旅</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)
          ) : error ? (
            <p className="col-span-full text-center text-destructive">加载食谱失败，请稍后再试。</p>
          ) : data?.recipes && data.recipes.length > 0 ? (
            data.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">暂无推荐食谱。</p>
          )}
        </div>
        <div className="flex justify-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/recipes" key="featured-more-recipes-link">查看更多食谱</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

interface RecipeCardProps {
  recipe: Recipe; // Now expects a full Recipe object
}

// Updated RecipeCard component
function RecipeCard({ recipe }: RecipeCardProps) {
  const fallbackImage = "/placeholder.svg" // Define a fallback image

  // --- Rating Display --- 
  // API now returns averageRating as null/0 and includes _count.ratings
  const ratingCount = recipe._count?.ratings ?? 0;
  const hasRatings = ratingCount > 0;
  // const displayRating = recipe.averageRating?.toFixed(1) ?? "-"; // Calculation removed/commented as API doesn't provide it reliably here

  return (
    <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary flex flex-col h-full">
      <div className="aspect-video relative bg-muted">
        <Image
          src={recipe.coverImage || fallbackImage}
          alt={recipe.title}
          fill
          className="object-cover"
          // Consider adding sizes for optimization if needed
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }} // Handle image loading errors
        />
      </div>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold leading-snug flex-1 mr-2">{recipe.title}</h3>
          <div className="flex items-center flex-shrink-0">
            {/* Display star based on whether ratings exist */}
            <Star className={`w-4 h-4 ${hasRatings ? "text-accent fill-accent" : "text-muted-foreground"}`} />
            {/* Optionally display the count */}
            <span className="text-xs text-muted-foreground ml-1">({ratingCount})</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">烹饪时间: {recipe.cookingTime}分钟</p>
        <div className="flex flex-wrap gap-1">
          {/* Assuming recipe.categories is Category[] based on updated type expectation */}
          {recipe.categories?.map((category) => (
            <span key={category.id} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold text-secondary-foreground bg-secondary/80 hover:bg-secondary">
              {category.name}
            </span>
          ))}
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {recipe.difficulty}
          </span>
          {/* Add tags if needed */}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button variant="secondary" className="w-full" asChild>
          <Link href={`/recipes/${recipe.id}`} key={`rc-detail-${recipe.id}`}>查看详情</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Skeleton component for RecipeCard
function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <Skeleton className="aspect-video w-full bg-muted" />
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
        <Skeleton className="h-4 w-1/2 mb-2 bg-muted" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full bg-muted" />
          <Skeleton className="h-5 w-12 rounded-full bg-muted" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Skeleton className="h-10 w-full bg-muted" />
      </CardFooter>
    </Card>
  )
}
