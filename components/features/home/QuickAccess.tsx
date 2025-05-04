import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, ShoppingCart, Clock } from "lucide-react"
import Link from "next/link"

export default function QuickAccess() {
  // Mock data - in a real app, this would come from the user's data
  const isLoggedIn = false
  const hasMealPlan = false
  const shoppingListCount = 0
  const recentlyViewedRecipes = []

  if (!isLoggedIn) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8">快速访问</h2>
        <Card>
          <CardHeader>
            <CardTitle>登录以使用更多功能</CardTitle>
            <CardDescription>登录后可以保存周计划、创建购物清单、收藏喜欢的食谱等</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/login">登录</Link>
            </Button>
            <Button variant="outline" className="ml-2" asChild>
              <Link href="/register">注册</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    )
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8">快速访问</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Plan Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">我的本周计划</CardTitle>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {hasMealPlan ? (
              <p>您有计划好的本周餐单</p>
            ) : (
              <p className="text-muted-foreground">您还没有创建本周的餐单计划</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/meal-plans">{hasMealPlan ? "查看计划" : "创建计划"}</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Shopping List Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">购物清单概览</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {shoppingListCount > 0 ? (
              <p>您的购物清单中有 {shoppingListCount} 个待购买的物品</p>
            ) : (
              <p className="text-muted-foreground">您的购物清单是空的</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/shopping-list">{shoppingListCount > 0 ? "查看清单" : "创建清单"}</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recently Viewed Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">最近浏览的食谱</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {recentlyViewedRecipes.length > 0 ? (
              <ul>
                {recentlyViewedRecipes.map((recipe) => (
                  <li key={recipe.id}>{recipe.title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">您最近没有浏览过食谱</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/recipes">浏览食谱</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
