import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, ChefHat, Users, Star } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// 初始化Supabase客户端
const supabaseUrl = process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

async function getSharedRecipe(shareId: string) {
  const { data, error } = await supabase.from("recipe_shares").select("*").eq("share_id", shareId).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function SharedRecipePage({ params }: { params: { shareId: string } }) {
  const sharedData = await getSharedRecipe(params.shareId)

  if (!sharedData) {
    notFound()
  }

  const recipe = sharedData.recipe_data

  return (
    <div className="container py-8">
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-center text-yellow-800">这是一个分享链接，您正在查看由 {recipe.author.name} 分享的食谱</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recipe Header */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">4.0 (120 评价)</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={recipe.author.image || "/placeholder.svg"} alt={recipe.author.name} />
                  <AvatarFallback>{recipe.author.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span>由 {recipe.author.name} 发布</span>
              </div>
            </div>

            {/* Recipe Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={recipe.coverImage || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
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

          {/* Recipe Content */}
          <Tabs defaultValue="ingredients">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ingredients">食材</TabsTrigger>
              <TabsTrigger value="instructions">步骤</TabsTrigger>
              <TabsTrigger value="nutrition">营养信息</TabsTrigger>
            </TabsList>
            <TabsContent value="ingredients" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">食材</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient: any, index: number) => (
                    <li key={index} className="flex items-center justify-between p-2 border-b">
                      <span>{ingredient.name}</span>
                      <span className="text-muted-foreground">{ingredient.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="instructions" className="pt-4">
              <div className="space-y-6">
                {recipe.instructions.map((instruction: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {instruction.step}
                      </div>
                      <h3 className="font-medium">步骤 {instruction.step}</h3>
                    </div>
                    <p>{instruction.content}</p>
                    {instruction.imageUrl && (
                      <div className="relative h-48 w-full rounded-md overflow-hidden">
                        <Image
                          src={instruction.imageUrl || "/placeholder.svg"}
                          alt={`步骤 ${instruction.step}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="nutrition" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">每份营养成分</h3>
                {recipe.nutritionInfo ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(recipe.nutritionInfo).map(([key, value]: [string, any]) => (
                      <div key={key} className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">{key}</div>
                        <div className="text-xl font-bold">
                          {value} {key === "热量" ? "kcal" : "g"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">暂无营养信息</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">分类与标签</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">分类</h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.categories.map((category: any) => (
                    <span key={category.id} className="px-3 py-1 bg-muted rounded-full text-sm">
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
              {recipe.tags && recipe.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag: any) => (
                      <span key={tag.id} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">想试试这个食谱？</h3>
            <div className="space-y-4">
              <Button className="w-full" asChild>
                <a href={`/recipes/${recipe.id}`}>在应用中查看</a>
              </Button>
              <p className="text-sm text-muted-foreground text-center">登录后可以收藏、评价或添加到您的周计划</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
