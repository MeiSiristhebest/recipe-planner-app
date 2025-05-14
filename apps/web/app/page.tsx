"use client";

import Link from "next/link"
import Image from "next/image"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@repo/ui/card"
import { Search, Star, BookOpen, ListChecks, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { useQuery } from '@tanstack/react-query'
import { type Recipe, type MealPlan, type ShoppingListItem } from '@recipe-planner/types'
import { Skeleton } from "@repo/ui/skeleton"
import { useSession } from "next-auth/react"

// API function to fetch recipes
async function fetchFeaturedRecipes(): Promise<{ recipes: Recipe[], total: number }> {
  // Fetch 6 recipes sorted by rating
  const response = await fetch('/api/recipes?limit=6&sort=rating') // Changed sort to 'rating'
  if (!response.ok) {
    throw new Error('Failed to fetch recipes')
  }
  return response.json()
}

// API function to fetch current week's meal plan
async function fetchCurrentMealPlan(): Promise<MealPlan | null> {
  try {
    const response = await fetch('/api/meal-plans/current');
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No plan found for the current week
      }
      const errorText = await response.text();
      console.error("Error fetching meal plan:", response.status, errorText);
      throw new Error(`Failed to fetch meal plan: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error in fetchCurrentMealPlan:", error);
    return null;
  }
}

// API function to fetch shopping list summary
async function fetchShoppingListSummary(): Promise<{ items: ShoppingListItem[], count: number }> {
  try {
    const response = await fetch('/api/shopping-list/summary'); 
    if (!response.ok) {
      if (response.status === 404) {
        return { items: [], count: 0 };
      }
      const errorText = await response.text();
      console.error("Error fetching shopping list:", response.status, errorText);
      throw new Error(`Failed to fetch shopping list: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error in fetchShoppingListSummary:", error);
    return { items: [], count: 0 };
  }
}

// API function to fetch recently viewed recipes
async function fetchRecentlyViewedRecipes(): Promise<Recipe[]> { 
  const response = await fetch('/api/users/me/recently-viewed');
  if (!response.ok) {
    if (response.status === 404) { 
      return []; 
    }
    throw new Error('Failed to fetch recently viewed recipes');
  }
  return response.json();
}

// API function to fetch favorite recipes
async function fetchFavoriteRecipes(): Promise<Recipe[]> {
  const response = await fetch('/api/profile/my-recipes?type=favorites');
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch favorite recipes');
  }
  return response.json();
}

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { 
    data: mealPlanData, 
    isLoading: isLoadingMealPlan, 
    error: errorMealPlan 
  } = useQuery({
    queryKey: ['currentMealPlan'],
    queryFn: fetchCurrentMealPlan,
    enabled: isAuthenticated, // 仅当用户完全认证后才启用
    retry: false, // 不要自动重试失败的请求
  });

  const { 
    data: shoppingListData, 
    isLoading: isLoadingShoppingList, 
    error: errorShoppingList 
  } = useQuery({
    queryKey: ['shoppingListSummary'],
    queryFn: fetchShoppingListSummary,
    enabled: isAuthenticated, // 仅当用户完全认证后才启用
    retry: false, // 不要自动重试失败的请求
  });

  const { 
    data: recentlyViewedRecipes, 
    isLoading: isLoadingRecentlyViewed, 
    error: errorRecentlyViewed 
  } = useQuery({
    queryKey: ['recentlyViewedRecipes'],
    queryFn: fetchRecentlyViewedRecipes,
    enabled: isAuthenticated, // 仅当用户完全认证后才启用
    retry: false, // 不要自动重试失败的请求
  });

  const { 
    data: favoriteRecipes, 
    isLoading: isLoadingFavorites, 
    error: errorFavorites 
  } = useQuery({
    queryKey: ['favoriteRecipes'],
    queryFn: fetchFavoriteRecipes,
    enabled: isAuthenticated, // 仅当用户完全认证后才启用
    retry: false, // 不要自动重试失败的请求
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
                  探索美味食谱，规划健康生活
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">轻松查找、分享、计划你的每一餐</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    id="search-input"
                    placeholder="搜索食谱、食材或关键词..." 
                    className="pl-8 w-full" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        if (value.trim()) {
                          window.location.href = `/recipes?q=${encodeURIComponent(value.trim())}`;
                        }
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={() => {
                    const searchInput = document.getElementById('search-input') as HTMLInputElement;
                    if (searchInput && searchInput.value.trim()) {
                      window.location.href = `/recipes?q=${encodeURIComponent(searchInput.value.trim())}`;
                    }
                  }}
                >
                  搜索
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&h=500&auto=format&fit=crop" // Fixed Hero Image
                alt="美味食谱"
                width={500}
                height={500}
                className="rounded-lg object-cover dark:opacity-80 dark:brightness-90"
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
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                {isAuthenticated ? "管理您的餐饮计划和购物清单" : "登录后可快速管理您的计划"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* 我的本周计划 Card */}
            <Card className="flex flex-col">
              <CardHeader className="flex-row items-center space-x-4 pb-2">
                <CalendarDays className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg">我的本周计划</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {isLoadingMealPlan && isAuthenticated && (
                  <>
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </>
                )}
                {!isLoadingMealPlan && isAuthenticated && mealPlanData && (
                  <p className="text-sm text-muted-foreground">
                    {mealPlanData.name || `本周计划 (${new Date(mealPlanData.startDate).toLocaleDateString()} - ${new Date(mealPlanData.endDate).toLocaleDateString()})`}
                    {/* Display some items or summary if available */}
                    {mealPlanData.items && mealPlanData.items.length > 0 && (
                       <span className="block mt-1">包含 {mealPlanData.items.length} 个食谱</span>
                    )}
                  </p>
                )}
                {!isLoadingMealPlan && isAuthenticated && !mealPlanData && !errorMealPlan && (
                  <p className="text-sm text-muted-foreground">您本周还没有创建计划。</p>
                )}
                {errorMealPlan && isAuthenticated && (
                  <p className="text-sm text-destructive">加载计划失败。</p>
                )}
                {!isAuthenticated && (
                   <p className="text-sm text-muted-foreground">登录后查看您的每周餐饮计划。</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/meal-plans" key="meal-plans-link">
                    {isAuthenticated && mealPlanData ? "查看详情" : isAuthenticated ? "创建计划" : "查看计划"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* 购物清单概览 Card */}
            <Card className="flex flex-col">
              <CardHeader className="flex-row items-center space-x-4 pb-2">
                <ListChecks className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg">购物清单概览</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {isLoadingShoppingList && isAuthenticated && (
                  <>
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </>
                )}
                {!isLoadingShoppingList && isAuthenticated && shoppingListData && shoppingListData.count > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      共有 {shoppingListData.count} 项物品需要购买。
                    </p>
                    {shoppingListData.items && shoppingListData.items.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                        {shoppingListData.items.slice(0, 2).map(item => (
                          <li key={item.id || item.name}>{item.name}</li>
                        ))}
                        {shoppingListData.count > 2 && <li>...等</li>}
                      </ul>
                    )}
                  </>
                )}
                {!isLoadingShoppingList && isAuthenticated && shoppingListData && shoppingListData.count === 0 && !errorShoppingList && (
                   <p className="text-sm text-muted-foreground">您的购物清单是空的！</p>
                )}
                 {errorShoppingList && isAuthenticated && (
                   <p className="text-sm text-destructive">加载购物清单失败。</p>
                )}
                {!isAuthenticated && (
                   <p className="text-sm text-muted-foreground">登录后管理您的购物清单。</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/shopping-list" key="shopping-list-link">查看清单</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* 最近浏览的食谱 Card - Conditional Rendering */}
            {isAuthenticated && (
              <Card className="flex flex-col">
                <CardHeader className="flex-row items-center space-x-4 pb-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <CardTitle className="text-lg">最近浏览的食谱</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  {isLoadingRecentlyViewed && (
                    <>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </>
                  )}
                  {!isLoadingRecentlyViewed && errorRecentlyViewed && (
                    <p className="text-sm text-destructive">加载最近浏览记录失败。</p>
                  )}
                  {!isLoadingRecentlyViewed && !errorRecentlyViewed && recentlyViewedRecipes && recentlyViewedRecipes.length > 0 && (
                    <ul className="space-y-2">
                      {recentlyViewedRecipes.slice(0, 3).map(recipe => ( // Show up to 3
                        <li key={recipe.id} className="text-sm text-muted-foreground hover:text-primary">
                          <Link href={`/recipes/${recipe.id}`} className="flex items-center space-x-2">
                            {recipe.coverImage ? (
                              <Image src={recipe.coverImage} alt={recipe.title} width={40} height={40} className="rounded object-cover h-10 w-10" />
                            ) : (
                              <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <span>{recipe.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!isLoadingRecentlyViewed && !errorRecentlyViewed && (!recentlyViewedRecipes || recentlyViewedRecipes.length === 0) && (
                    <p className="text-sm text-muted-foreground">您还没有浏览过任何食谱。</p>
                  )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/recipes" key="quick-access-recipes-link">浏览更多食谱</Link>
                </Button>
              </CardFooter>
            </Card>
            )}

            {/* 我的收藏食谱 Card */}
            <Card className="flex flex-col">
              <CardHeader className="flex-row items-center space-x-4 pb-2">
                <Star className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg">我的收藏食谱</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {!isAuthenticated && (
                  <p className="text-sm text-muted-foreground">登录后查看您收藏的食谱。</p>
                )}
                {isLoadingFavorites && isAuthenticated && (
                  <>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </>
                )}
                {!isLoadingFavorites && errorFavorites && isAuthenticated && (
                  <p className="text-sm text-destructive">加载收藏食谱失败。</p>
                )}
                {!isLoadingFavorites && !errorFavorites && isAuthenticated && favoriteRecipes && favoriteRecipes.length > 0 && (
                  <ul className="space-y-2">
                    {favoriteRecipes.slice(0, 3).map(recipe => ( // Show up to 3
                      <li key={recipe.id} className="text-sm text-muted-foreground hover:text-primary">
                        <Link href={`/recipes/${recipe.id}`} className="flex items-center space-x-2">
                          {recipe.coverImage ? (
                            <Image src={recipe.coverImage} alt={recipe.title} width={40} height={40} className="rounded object-cover h-10 w-10" />
                          ) : (
                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                              <Star className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <span>{recipe.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {!isLoadingFavorites && !errorFavorites && isAuthenticated && (!favoriteRecipes || favoriteRecipes.length === 0) && (
                  <p className="text-sm text-muted-foreground">您还没有收藏任何食谱。</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={isAuthenticated ? "/profile/my-recipes" : "/login"} key="favorite-recipes-link">
                    {isAuthenticated ? "查看收藏" : "去登录"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* 创建新食谱 Card */}
            <Card className="flex flex-col">
              <CardHeader className="flex-row items-center space-x-4 pb-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-6 h-6 text-primary" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <CardTitle className="text-lg">创建新食谱</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {!isAuthenticated && (
                  <p className="text-sm text-muted-foreground">登录后开始创建您自己的食谱。</p>
                )}
                {isAuthenticated && (
                  <p className="text-sm text-muted-foreground">
                    记录并分享您的独家美味配方，展示您的烹饪创意。
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={isAuthenticated ? "/recipes/create" : "/login"} key="create-recipe-link">
                    {isAuthenticated ? "开始创建" : "去登录"}
                  </Link>
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

  const ratingCount = recipe._count?.ratings ?? 0;
  const averageRating = recipe.averageRating ?? 0; // Get averageRating
  const displayRatingText = averageRating > 0 ? averageRating.toFixed(1) : "-";

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
            <Star className={`w-4 h-4 ${averageRating > 0 ? "text-accent fill-accent" : "text-muted-foreground"}`} />
            <span className="text-xs text-muted-foreground ml-1">
              {displayRatingText}
            </span>
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
