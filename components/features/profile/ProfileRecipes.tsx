import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import RecipeCard from "@/components/features/recipes/RecipeCard"
import Link from "next/link"

// Mock data for user's recipes
const userRecipes = [
  {
    id: 1,
    title: "香煎三文鱼配蔬菜",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 30,
    difficulty: "中等",
    rating: 4.8,
    category: "海鲜",
    tags: ["低碳水", "高蛋白"],
  },
  {
    id: 2,
    title: "番茄意大利面",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 25,
    difficulty: "简单",
    rating: 4.5,
    category: "意大利菜",
    tags: ["素食"],
  },
  {
    id: 3,
    title: "香辣麻婆豆腐",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 20,
    difficulty: "中等",
    rating: 4.7,
    category: "川菜",
    tags: ["辣"],
  },
]

export default function ProfileRecipes() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">我的食谱</h2>
        <Button asChild>
          <Link href="/recipes/create">
            <Plus className="h-4 w-4 mr-2" />
            创建新食谱
          </Link>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜索我的食谱..." className="pl-10" />
      </div>

      {userRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">您还没有创建任何食谱</p>
          <Button asChild>
            <Link href="/recipes/create">创建第一个食谱</Link>
          </Button>
        </Card>
      )}
    </div>
  )
}
