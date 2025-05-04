import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, Star, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock data for featured recipes
const featuredRecipes = [
  {
    id: 1,
    title: "香煎三文鱼配蔬菜",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 30,
    difficulty: "中等",
    rating: 4.8,
    category: "海鲜",
  },
  {
    id: 2,
    title: "番茄意大利面",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 25,
    difficulty: "简单",
    rating: 4.5,
    category: "意大利菜",
  },
  {
    id: 3,
    title: "香辣麻婆豆腐",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 20,
    difficulty: "中等",
    rating: 4.7,
    category: "川菜",
  },
  {
    id: 4,
    title: "法式烤鸡",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 60,
    difficulty: "困难",
    rating: 4.9,
    category: "法国菜",
  },
  {
    id: 5,
    title: "蔬菜沙拉",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 15,
    difficulty: "简单",
    rating: 4.3,
    category: "沙拉",
  },
  {
    id: 6,
    title: "巧克力蛋糕",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 45,
    difficulty: "中等",
    rating: 4.6,
    category: "烘焙",
  },
]

export default function FeaturedRecipes() {
  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">本周热门推荐</h2>
        <Button variant="outline" asChild>
          <Link href="/recipes">查看更多</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredRecipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden group">
            <div className="relative h-48 overflow-hidden">
              <Image
                src={recipe.image || "/placeholder.svg"}
                alt={recipe.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-2 right-2">
                <Button size="icon" variant="ghost" className="rounded-full bg-background/80 hover:bg-background">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
              <Badge className="absolute top-2 left-2">{recipe.category}</Badge>
            </div>
            <CardContent className="pt-4">
              <Link href={`/recipes/${recipe.id}`}>
                <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors">{recipe.title}</h3>
              </Link>
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{recipe.cookingTime} 分钟</span>
                </div>
                <div className="flex items-center">
                  <ChefHat className="h-4 w-4 mr-1" />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                <span className="text-sm font-medium">{recipe.rating}</span>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/recipes/${recipe.id}`}>查看详情</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
