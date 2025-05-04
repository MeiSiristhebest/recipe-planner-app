import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import RecipeCard from "@/components/features/recipes/RecipeCard"
import FilterPanel from "@/components/features/recipes/FilterPanel"

// Mock data for recipes
const recipes = [
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
  {
    id: 7,
    title: "泰式青咖喱",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 35,
    difficulty: "中等",
    rating: 4.7,
    category: "泰国菜",
    tags: ["辣", "椰奶"],
  },
  {
    id: 8,
    title: "日式拉面",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 40,
    difficulty: "中等",
    rating: 4.8,
    category: "日本菜",
    tags: ["汤面"],
  },
  {
    id: 9,
    title: "韩式烤肉",
    image: "/placeholder.svg?height=300&width=400",
    cookingTime: 25,
    difficulty: "简单",
    rating: 4.9,
    category: "韩国菜",
    tags: ["高蛋白", "烧烤"],
  },
]

export default function RecipesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">食谱库</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Panel - Left Side */}
        <div className="w-full lg:w-1/4">
          <FilterPanel />
        </div>

        {/* Recipe List - Right Side */}
        <div className="w-full lg:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="relative w-full sm:w-64">
              <Input type="text" placeholder="搜索食谱..." className="w-full" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm whitespace-nowrap">排序方式:</span>
              <Select defaultValue="latest">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">最新发布</SelectItem>
                  <SelectItem value="popular">最受欢迎</SelectItem>
                  <SelectItem value="rating">评分最高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="outline">加载更多</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
