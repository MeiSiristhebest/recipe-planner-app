'use client'; // Mark as client component for data fetching hooks

import { useState, useEffect } from 'react'; // Re-added useEffect
import { useSession } from 'next-auth/react'; // Added useSession
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Added useMutation and useQueryClient
import { useParams } from 'next/navigation'; // Use if needed, but params are passed as props in App Router
import Image from "next/image"
import { Button } from "@repo/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Textarea } from "@repo/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Clock, ChefHat, Users, Heart, Plus, Star, Loader2, Send, LinkIcon } from "lucide-react"
import { ShareDialog } from "@/components/features/recipes/share-dialog"
import { NutritionDisplay } from "@/components/features/nutrition/nutrition-display"
import { type Recipe, type Comment, type User } from "@recipe-planner/types"; // Assuming Comment type is available
import { Skeleton } from "@repo/ui/skeleton"
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'; // Added Link for navigation
import { IngredientList, type Ingredient as IngredientUIData } from "@repo/ui/ingredient-list"; // Re-added IngredientList

// Type for combined recipe and comments data
interface RecipeDetailData extends Recipe {
  comments: (Comment & { user: User })[]; // Expect comments with user data
  isFavoritedByCurrentUser?: boolean; // Re-added
  favoritesCount?: number; // Re-added
  // Assuming nutrition data is nested under 'nutrition' object of NutritionInfo type
  nutrition?: { 
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    servingSize?: string;
  };
  // Add other expected relations like author, categories, tags if needed
}

// Type for related recipe preview
interface RelatedRecipePreview {
  id: string;
  title: string;
  coverImage: string | null;
  cookingTime: number;
  difficulty: string;
}

// API function to fetch recipe details
async function fetchRecipeDetails(recipeId: string): Promise<RecipeDetailData> {
  const response = await fetch(`/api/recipes/${recipeId}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('Recipe not found');
    throw new Error('Failed to fetch recipe details');
  }
  return response.json();
}

// API function to post a comment
async function postComment({ recipeId, content }: { recipeId: string; content: string }): Promise<Comment & { user: User }> {
  const response = await fetch(`/api/recipes/${recipeId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
    throw new Error(errorData.error || 'Failed to post comment');
  }
  return response.json();
}

// API function to fetch related recipes
async function fetchRelatedRecipes(recipeId: string, limit: number = 3): Promise<RelatedRecipePreview[]> {
  const response = await fetch(`/api/recipes/${recipeId}/related?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch related recipes');
  }
  return response.json();
}

// Re-added API function to toggle favorite status
async function toggleFavoriteRecipe({ recipeId, favorited }: { recipeId: string; favorited: boolean }): Promise<{ favorited: boolean; favoritesCount: number }> {
  const response = await fetch(`/api/recipes/${recipeId}/favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favorited }), 
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update favorite status');
  }
  return response.json(); 
}

export default function RecipeDetailPage({ params }: { params: { recipeId: string } }) {
  const { recipeId } = params;
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  // const [isAddToMealPlanDialogOpen, setIsAddToMealPlanDialogOpen] = useState(false); // For later use

  const { data: recipe, isLoading, error: queryError, isError } = useQuery<RecipeDetailData, Error>({
    queryKey: ['recipeDetails', recipeId],
    queryFn: () => fetchRecipeDetails(recipeId),
    enabled: !!recipeId,
  });

  // useEffect to update local state when recipe data is fetched or changed
  useEffect(() => {
    if (recipe) {
      setIsFavorited(!!recipe.isFavoritedByCurrentUser);
      setFavoriteCount(recipe.favoritesCount || 0);
    }
  }, [recipe]); // Dependency array includes recipe

  // Query for related recipes
  const { data: relatedRecipes, isLoading: isLoadingRelated } = useQuery<RelatedRecipePreview[], Error>({
    queryKey: ['relatedRecipes', recipeId],
    queryFn: () => fetchRelatedRecipes(recipeId, 3), // Fetch 3 related recipes
    enabled: !!recipeId && !!recipe, // Only run query if recipeId and main recipe data are available
  });

  const commentMutation = useMutation({
    mutationFn: postComment,
    onSuccess: (newComment) => {
      setCommentText('');
      setCommentError(null);
      // Invalidate and refetch recipe details to update comments list
      queryClient.invalidateQueries({ queryKey: ['recipeDetails', recipeId] });
      // Here we can trigger a "special effect" later
      console.log("Comment posted successfully!", newComment);
    },
    onError: (error: Error) => {
      setCommentError(error.message || "发表评论失败，请稍后再试。");
      console.error("Comment posting error:", error);
    },
  });

  // Re-added toggleFavoriteMutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: toggleFavoriteRecipe,
    onMutate: async ({ favorited }) => {
      const previousIsFavorited = isFavorited;
      const previousFavoriteCount = favoriteCount;
      setIsFavorited(favorited);
      setFavoriteCount(prev => favorited ? prev + 1 : Math.max(0, prev - 1));
      return { previousIsFavorited, previousFavoriteCount };
    },
    onError: (err, variables, context) => {
      if (context) {
        setIsFavorited(context.previousIsFavorited);
        setFavoriteCount(context.previousFavoriteCount);
      }
      console.error("Failed to toggle favorite:", err);
      alert("收藏操作失败，请稍后再试。"); // User-facing error
    },
    onSuccess: (data) => {
      setIsFavorited(data.favorited);
      setFavoriteCount(data.favoritesCount);
      // queryClient.invalidateQueries({ queryKey: ['recipeDetails', recipeId] }); // Could be redundant
      // queryClient.invalidateQueries({ queryKey: ['userFavorites'] }); // If a global list exists
    },
  });

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setCommentError("请先登录再发表评论。");
      return;
    }
    if (!commentText.trim()) {
      setCommentError("评论内容不能为空。");
      return;
    }
    setCommentError(null);
    commentMutation.mutate({ recipeId, content: commentText });
  };

  const handleToggleFavorite = () => {
    if (!session?.user) {
      alert("请先登录才能收藏食谱！");
      return;
    }
    toggleFavoriteMutation.mutate({ recipeId, favorited: !isFavorited });
  };

  const handleAddToMealPlan = () => {
    if (!session?.user) {
      alert("请先登录才能将食谱添加到周计划！");
      return;
    }
    // Placeholder logic
    // Later, this will open a dialog: setIsAddToMealPlanDialogOpen(true);
    alert(`食谱 "${recipe?.title}" (ID: ${recipeId}) 将被添加到周计划。此功能待实现。`);
    console.log("Add to Meal Plan clicked for recipe:", recipeId, recipe?.title);
  };

  // Re-added ingredientsForUI processing logic
  const ingredientsForUI: IngredientUIData[] = [];
  if (recipe && Array.isArray(recipe.ingredients)) {
    recipe.ingredients.forEach((item: any) => {
      // Ensure item is an object and has name and quantity
      if (item && typeof item === 'object' && item.name != null && item.quantity != null) {
        ingredientsForUI.push({
          name: String(item.name),
          quantity: String(item.quantity),
          unit: item.unit ? String(item.unit) : undefined,
          category: item.category ? String(item.category) : undefined,
        });
      } else {
        console.warn("Skipping malformed ingredient item:", item);
      }
    });
  } else if (recipe && !recipe.ingredients) {
    console.warn("Recipe data does not contain ingredients array:", recipe);
  }

  if (isLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (isError || !recipe) {
    return (
      <div className="container py-8 text-center text-destructive">
        <p>加载食谱失败: {queryError?.message || (!recipe ? '未找到食谱数据' : '未知错误')}</p>
      </div>
    );
  }

  const fallbackImage = "/placeholder.svg";
  const displayRating = recipe.averageRating && recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : "-";
  const ratingCount = recipe._count?.ratings ?? 0;

  const actionButtons = (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button variant="outline" size="sm" className="flex items-center" onClick={handleToggleFavorite} disabled={toggleFavoriteMutation.isPending}>
        {toggleFavoriteMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`mr-2 h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
        )}
        {isFavorited ? "已收藏" : "收藏"} ({favoriteCount})
      </Button>
      <Button variant="outline" size="sm" className="flex items-center" onClick={handleAddToMealPlan}>
        <Plus className="mr-2 h-4 w-4" />
        添加到周计划
      </Button>
      <Button variant="outline" size="sm" className="flex items-center" onClick={() => setIsShareDialogOpen(true)}>
        <LinkIcon className="mr-2 h-4 w-4" />
        分享
      </Button>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recipe Header */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${recipe.averageRating && star <= recipe.averageRating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">
                  {displayRating} ({ratingCount} 评价)
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={recipe.author?.image || fallbackImage} alt={recipe.author?.name || '作者'} />
                  <AvatarFallback>{recipe.author?.name?.slice(0, 2) || '作者'}</AvatarFallback>
                </Avatar>
                <span>由 {recipe.author?.name || '匿名作者'} 发布</span>
              </div>
            </div>

            {actionButtons}

            {/* Recipe Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={recipe.coverImage || fallbackImage}
                alt={recipe.title}
                fill
                className="object-cover"
                priority
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
              />
            </div>
          </div>

          {/* Recipe Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
              <Clock className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">烹饪时间</span>
              <span className="text-lg font-bold">{recipe.cookingTime}分钟</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
              <ChefHat className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">难度</span>
              <span className="text-lg font-bold">{recipe.difficulty}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">份量</span>
              <span className="text-lg font-bold">{recipe.servings}人份</span>
            </div>
          </div>

          {/* Recipe Content Tabs */}
          <Tabs defaultValue="ingredients">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ingredients">食材</TabsTrigger>
              <TabsTrigger value="instructions">步骤</TabsTrigger>
              <TabsTrigger value="nutrition">营养信息</TabsTrigger>
            </TabsList>

            {/* Ingredients Tab */}
            <TabsContent value="ingredients" className="pt-4">
              {ingredientsForUI.length > 0 ? (
                <IngredientList ingredients={ingredientsForUI} />
              ) : (
                <p className="text-muted-foreground text-center py-4">暂无食材信息</p>
              )}
            </TabsContent>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="pt-4">
              <div className="space-y-6">
                {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? recipe.instructions.map((instructionContent, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      {/* <h3 className="font-medium">步骤 {index + 1}</h3> // Optional step title */}
                    </div>
                    <p>{String(instructionContent)}</p>
                    {/* Add step image rendering if available */}
                  </div>
                )) : <p className="text-muted-foreground text-center py-4">暂无制作步骤</p>}
              </div>
            </TabsContent>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition" className="pt-4">
              {recipe.nutritionInfo ? (
                <NutritionDisplay
                  // @ts-ignore // TODO: Fix type incompatibility if nutritionInfo structure differs
                  nutritionInfo={recipe.nutritionInfo}
                  servings={recipe.servings}
                  showPerServing={true}
                />
              ) : (
                <p className="text-muted-foreground text-center py-4">暂无营养信息</p>
              )}
            </TabsContent>
          </Tabs>

          {/* Comments Section */}
          <div className="space-y-6 pt-8 mt-8 border-t">
            <h3 className="text-xl font-semibold">评论 ({recipe?.comments?.length ?? 0})</h3>
            <div className="space-y-4">
              {session?.user ? (
                <form onSubmit={handleCommentSubmit} className="space-y-2">
                  <Textarea
                    placeholder="分享你的烹饪体验..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={commentMutation.isPending}
                    rows={3}
                  />
                  {commentError && <p className="text-sm text-destructive">{commentError}</p>}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={commentMutation.isPending || !commentText.trim()}>
                      {commentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          发表中...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          发表评论
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/50">
                  <p className="text-muted-foreground">请 <a href="/login" className="text-primary hover:underline">登录</a> 后发表评论。</p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {recipe.comments && recipe.comments.length > 0 ? (
                  recipe.comments.map((comment) => (
                    <div key={comment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user?.image || fallbackImage} alt={comment.user?.name || '用户'} />
                          <AvatarFallback>{comment.user?.name?.slice(0, 2) || '用户'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{comment.user?.name || '匿名用户'}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">暂无评论</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-4 border rounded-lg bg-card shadow">
            <h3 className="text-lg font-semibold mb-4">相关食谱</h3>
            <div className="space-y-4">
              {isLoadingRelated ? (
                [1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-20 h-20 rounded-md flex-shrink-0 bg-muted" />
                    <div className="space-y-1 flex-grow py-1">
                      <Skeleton className="h-4 w-3/4 bg-muted" />
                      <Skeleton className="h-3 w-1/2 bg-muted mt-1" />
                      <Skeleton className="h-3 w-1/3 bg-muted mt-1" />
                    </div>
                  </div>
                ))
              ) : relatedRecipes && relatedRecipes.length > 0 ? (
                relatedRecipes.map((relatedRecipe) => (
                  <Link key={relatedRecipe.id} href={`/recipes/${relatedRecipe.id}`} className="block hover:bg-muted/50 p-2 rounded-md transition-colors -m-2">
                    <div className="flex gap-3 items-center">
                      <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={relatedRecipe.coverImage || fallbackImage}
                          alt={relatedRecipe.title}
                          fill
                          className="object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-tight line-clamp-2">{relatedRecipe.title}</h4>
                        <p className="text-xs text-muted-foreground">{relatedRecipe.cookingTime}分钟 · {relatedRecipe.difficulty}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">暂无相关食谱推荐</p>
              )}
            </div>
          </div>
          {/* You can add more sidebar content here if needed */}
        </div>
      </div>

      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        recipeId={recipe.id}
        recipeTitle={recipe.title}
      />
    </div>
  );
}

// Skeleton component for Recipe Detail Page
function RecipeDetailSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Header Skeleton */}
          <div>
            <Skeleton className="h-9 w-3/4 mb-4 bg-muted" />
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-5 w-28 bg-muted" />
              <Skeleton className="h-6 w-32 bg-muted" />
            </div>
            <Skeleton className="aspect-video w-full rounded-lg bg-muted" />
          </div>
          {/* Info Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-lg bg-muted" />
            <Skeleton className="h-24 rounded-lg bg-muted" />
            <Skeleton className="h-24 rounded-lg bg-muted" />
          </div>
          {/* Actions Skeleton */}
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-24 bg-muted" />
            <Skeleton className="h-10 w-32 bg-muted" />
            <Skeleton className="h-10 w-20 bg-muted" />
          </div>
          {/* Tabs Skeleton */}
          <Skeleton className="h-10 w-full bg-muted mb-4" />
          <Skeleton className="h-40 w-full bg-muted" />
        </div>
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1 space-y-8">
          <Skeleton className="h-60 w-full rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
