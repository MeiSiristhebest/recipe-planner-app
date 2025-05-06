import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Search } from "lucide-react"

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
                  <Link href="/recipes">搜索</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/placeholder.svg"
                alt="美味食谱"
                width={500}
                height={500}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">本周热门推荐</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">发现最受欢迎的美味食谱，开启你的烹饪之旅</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <RecipeCard key={i} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/recipes">查看更多食谱</Link>
            </Button>
          </div>
        </div>
      </section>

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
                  <Link href="/meal-plans">查看计划</Link>
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
                  <Link href="/shopping-list">查看清单</Link>
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
                  <Link href="/recipes">查看食谱</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

function RecipeCard() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <Image src="/placeholder.svg" alt="食谱图片" fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold">美味食谱标题</h3>
            <p className="text-sm text-muted-foreground">烹饪时间: 30分钟</p>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium">4.5</span>
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
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            家常菜
          </span>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">简单</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="secondary" className="w-full" asChild>
          <Link href="/recipes/1">查看详情</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
