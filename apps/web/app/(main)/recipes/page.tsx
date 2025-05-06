import { Suspense } from "react"
import { RecipeList } from "@/components/features/recipes/recipe-list"
import { SearchFilters } from "@/components/features/recipes/search-filters"
import { Skeleton } from "@repo/ui/skeleton"

interface RecipesPageProps {
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

export default function RecipesPage({ searchParams }: RecipesPageProps) {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">食谱库</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 过滤器面板 */}
        <div className="lg:col-span-1">
          <SearchFilters />
        </div>

        {/* 食谱列表 */}
        <div className="lg:col-span-3">
          <Suspense fallback={<RecipeListSkeleton />}>
            <RecipeList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function RecipeListSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
