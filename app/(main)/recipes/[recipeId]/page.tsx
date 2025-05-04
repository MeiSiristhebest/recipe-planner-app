import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, ChefHat, Users, Heart, Calendar, Share2, Star } from "lucide-react"
import Image from "next/image"
import RecipeIngredients from "@/components/features/recipes/RecipeIngredients"
import RecipeInstructions from "@/components/features/recipes/RecipeInstructions"
import RecipeComments from "@/components/features/recipes/RecipeComments"

// Mock recipe data
const recipe = {
  id: 1,
  title: "香煎三文鱼配蔬菜",
  image: "/placeholder.svg?height=600&width=1200",
  description:
    "这道香煎三文鱼配蔬菜是一道健康美味的料理，三文鱼富含欧米伽-3脂肪酸，搭配新鲜蔬菜，营养均衡，适合任何场合。",
  cookingTime: 30,
  difficulty: "中等",
  servings: 2,
  rating: 4.8,
  ratingCount: 156,
  category: "海鲜",
  tags: ["低碳水", "高蛋白", "健康"],
  author: {
    id: 1,
    name: "美食达人",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  publishDate: "2023-05-15",
  ingredients: [
    { name: "三文鱼", quantity: "2", unit: "块", note: "约200克/块" },
    { name: "橄榄油", quantity: "2", unit: "汤匙" },
    { name: "盐", quantity: "1/2", unit: "茶匙" },
    { name: "黑胡椒", quantity: "1/4", unit: "茶匙" },
    { name: "大蒜", quantity: "2", unit: "瓣", note: "切碎" },
    { name: "柠檬", quantity: "1", unit: "个", note: "切片" },
    { name: "西兰花", quantity: "1", unit: "小朵", note: "切小朵" },
    { name: "胡萝卜", quantity: "1", unit: "根", note: "切条" },
    { name: "红椒", quantity: "1/2", unit: "个", note: "切条" },
  ],
  instructions: [
    {
      step: 1,
      description: "将三文鱼洗净，用厨房纸巾擦干水分。撒上盐和黑胡椒调味。",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      step: 2,
      description: "热锅，倒入橄榄油，中火加热。",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      step: 3,
      description: "放入三文鱼，皮朝下，煎至金黄色，约3-4分钟。",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      step: 4,
      description: "翻面继续煎2-3分钟，直至两面金黄，鱼肉熟透但不过火。",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      step: 5,
      description: "取出三文鱼，在同一锅中加入蒜末炒香，然后加入所有蔬菜翻炒3-4分钟至蔬菜变软但保持脆度。",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      step: 6,
      description: "将蔬菜盛盘，放上煎好的三文鱼，挤上柠檬汁，即可享用。",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],
  nutrition: {
    calories: 420,
    protein: 35,
    fat: 28,
    carbs: 12,
  },
  comments: [
    {
      id: 1,
      user: {
        id: 2,
        name: "美食爱好者",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      content: "非常美味的一道菜，我按照食谱做了，全家都很喜欢！",
      rating: 5,
      date: "2023-06-10",
    },
    {
      id: 2,
      user: {
        id: 3,
        name: "健身达人",
        avatar: "/placeholder.svg?height=50&width=50",
      },
      content: "作为健身餐非常棒，高蛋白低碳水，而且味道不错。",
      rating: 4,
      date: "2023-06-15",
    },
  ],
}

export default function RecipeDetailPage({ params }: { params: { recipeId: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Recipe Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{recipe.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="ml-1 font-medium">{recipe.rating}</span>
              </div>
              <span className="text-muted-foreground">({recipe.ratingCount} 评价)</span>
            </div>

            <Badge>{recipe.category}</Badge>

            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{recipe.cookingTime} 分钟</span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <ChefHat className="h-4 w-4 mr-1" />
              <span>{recipe.difficulty}</span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{recipe.servings} 人份</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              收藏
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              添加到周计划
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
          </div>
        </div>

        {/* Recipe Image */}
        <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
        </div>

        {/* Author and Date */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
              <Image
                src={recipe.author.avatar || "/placeholder.svg"}
                alt={recipe.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-medium">{recipe.author.name}</div>
              <div className="text-sm text-muted-foreground">发布于 {recipe.publishDate}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-lg">{recipe.description}</p>
        </div>

        <Separator className="my-8" />

        {/* Ingredients */}
        <RecipeIngredients ingredients={recipe.ingredients} />

        <Separator className="my-8" />

        {/* Instructions */}
        <RecipeInstructions instructions={recipe.instructions} />

        <Separator className="my-8" />

        {/* Nutrition Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">营养信息</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-lg font-medium">{recipe.nutrition.calories}</div>
              <div className="text-sm text-muted-foreground">卡路里</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-lg font-medium">{recipe.nutrition.protein}g</div>
              <div className="text-sm text-muted-foreground">蛋白质</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-lg font-medium">{recipe.nutrition.fat}g</div>
              <div className="text-sm text-muted-foreground">脂肪</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-lg font-medium">{recipe.nutrition.carbs}g</div>
              <div className="text-sm text-muted-foreground">碳水</div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Comments */}
        <RecipeComments comments={recipe.comments} />
      </div>
    </div>
  )
}
