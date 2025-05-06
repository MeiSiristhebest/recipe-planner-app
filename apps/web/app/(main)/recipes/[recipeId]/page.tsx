import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, ChefHat, Users, Heart, Plus, Star } from "lucide-react"
import { ShareDialog } from "@/components/features/recipes/share-dialog"
import { NutritionDisplay } from "@/components/nutrition-display"

export default function RecipeDetailPage({ params }: { params: { recipeId: string } }) {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recipe Header */}
          <div>
            <h1 className="text-3xl font-bold mb-4">香煎三文鱼配芦笋</h1>
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
                  <AvatarImage src="/placeholder.svg" alt="@username" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <span>由 张厨师 发布</span>
              </div>
            </div>

            {/* Recipe Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image src="/placeholder.svg" alt="香煎三文鱼配芦笋" fill className="object-cover" />
            </div>
          </div>

          {/* Recipe Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
              <Clock className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">烹饪时间</span>
              <span className="text-lg font-bold">30分钟</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
              <ChefHat className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">难度</span>
              <span className="text-lg font-bold">中等</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">份量</span>
              <span className="text-lg font-bold">2人份</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              收藏
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              添加到周计划
            </Button>
            <ShareDialog recipeId={params.recipeId} recipeTitle="香煎三文鱼配芦笋" />
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
                <h3 className="text-lg font-medium">主要食材</h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between p-2 border-b">
                    <span>三文鱼排</span>
                    <span className="text-muted-foreground">2块 (约300克)</span>
                  </li>
                  <li className="flex items-center justify-between p-2 border-b">
                    <span>芦笋</span>
                    <span className="text-muted-foreground">1束 (约200克)</span>
                  </li>
                  <li className="flex items-center justify-between p-2 border-b">
                    <span>小土豆</span>
                    <span className="text-muted-foreground">6-8个 (约300克)</span>
                  </li>
                  <li className="flex items-center justify-between p-2 border-b">
                    <span>柠檬</span>
                    <span className="text-muted-foreground">1个</span>
                  </li>
                </ul>

                <h3 className="text-lg font-medium">调味料</h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between p-2 border-b">
                    <span>橄榄油</span>
                    <span className="text-muted-foreground">2汤匙</span>
                  </li>
                  <li className="flex items-center justify-between p-2 border-b">
                    <span>盐</span>
                    <span className="text-muted-foreground">适量</span>
                  </li>
                  <li className="flex items-center justify-between p-2 border-b">
                    <span>黑胡椒</span>
                    <span className="text-muted-foreground">适量</span>
                  </li>
                  <li className="flex items-center justify-between p-2 border-b">
                    <span>迷迭香</span>
                    <span className="text-muted-foreground">2-3枝</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="instructions" className="pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </div>
                    <h3 className="font-medium">准备食材</h3>
                  </div>
                  <p>将三文鱼排洗净，用厨房纸吸干水分。芦笋洗净，切去老根部分。小土豆洗净，对半切开。柠檬切片。</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      2
                    </div>
                    <h3 className="font-medium">烹饪土豆</h3>
                  </div>
                  <p>将小土豆放入沸水中煮约15分钟至变软。沥干水分，加入1汤匙橄榄油、盐和黑胡椒拌匀。</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      3
                    </div>
                    <h3 className="font-medium">烹饪三文鱼</h3>
                  </div>
                  <p>
                    平底锅中加入1汤匙橄榄油，中高火加热。将三文鱼皮朝下放入锅中，撒上盐和黑胡椒，煎约4分钟至皮酥脆。翻面再煎2-3分钟。
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      4
                    </div>
                    <h3 className="font-medium">烹饪芦笋</h3>
                  </div>
                  <p>另一个平底锅中加入少许橄榄油，中火加热。放入芦笋和迷迭香，翻炒2-3分钟至变软但仍有脆度。</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      5
                    </div>
                    <h3 className="font-medium">装盘上菜</h3>
                  </div>
                  <p>将三文鱼、芦笋和土豆摆盘，挤上柠檬汁，撒上黑胡椒。可以搭配柠檬片装饰。</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="nutrition" className="pt-4">
              <NutritionDisplay
                nutritionInfo={{
                  calories: 420,
                  protein: 32,
                  fat: 25,
                  carbs: 18,
                  fiber: 4,
                  sugar: 3,
                  sodium: 600,
                }}
                servings={2}
                showPerServing={true}
              />
            </TabsContent>
          </Tabs>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">评论 (5)</h3>

            <div className="space-y-4">
              {/* Comment Form */}
              <div className="space-y-2">
                <Textarea placeholder="分享你的烹饪体验..." />
                <div className="flex justify-end">
                  <Button>发表评论</Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" alt="@username" />
                        <AvatarFallback>UN</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">用户名</div>
                        <div className="text-xs text-muted-foreground">2023年12月15日</div>
                      </div>
                    </div>
                    <p className="text-sm">
                      这个食谱非常棒！我按照步骤做了，三文鱼煎得恰到好处，芦笋也很脆嫩。家人都很喜欢，会再次尝试！
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">相关食谱</h3>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image src="/placeholder.svg" alt="相关食谱" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">柠檬香草烤鱼</h4>
                    <p className="text-xs text-muted-foreground">烹饪时间: 25分钟</p>
                    <div className="flex mt-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-3 w-3 ${j < 4 ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">烹饪小贴士</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <ChefHat className="h-3 w-3 text-primary" />
                </div>
                <span>选择新鲜的三文鱼，肉质应该有弹性，颜色鲜亮。</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <ChefHat className="h-3 w-3 text-primary" />
                </div>
                <span>煎三文鱼时，先将鱼皮一面煎至酥脆，这样口感更佳。</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <ChefHat className="h-3 w-3 text-primary" />
                </div>
                <span>芦笋不要炒太久，保持一定的脆度更美味。</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <ChefHat className="h-3 w-3 text-primary" />
                </div>
                <span>上桌前挤上新鲜柠檬汁，能提升整体风味。</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
