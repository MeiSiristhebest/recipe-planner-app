import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import RecipeCard from "@/components/features/recipes/RecipeCard"
import Link from "next/link"

// Mock data for user's favorite recipes
const favoriteRecipes = [
  {
    id: 4,
    title: "法式烤鸡",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 60,
    difficulty: "困难",
    rating: 4.9,
    category: "法国菜",
    tags: ["高蛋白"],
  },
  {
    id: 5,
    title: "蔬菜沙拉",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 15,
    difficulty: "简单",
    rating: 4.3,
    category: "沙拉",
    tags: ["素食", "低卡"],
  },
  {
    id: 6,
    title: "巧克力蛋糕",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 45,
    difficulty: "中等",
    rating: 4.6,
    category: "烘焙",
    tags: ["甜点"],
  },
]

export default function ProfileFavorites() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">我的收藏</h2>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜索我的收藏..." className="pl-10" />
      </div>

      {favoriteRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">您还没有收藏任何食谱</p>
          <Button asChild>
            <Link href="/recipes">浏览食谱</Link>
          </Button>
        </Card>
      )}
    </div>
  )
}
