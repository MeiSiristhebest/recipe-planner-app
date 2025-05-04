import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import FeaturedRecipes from "@/components/features/home/FeaturedRecipes"
import QuickAccess from "@/components/features/home/QuickAccess"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">探索美味食谱，规划健康生活</h1>
        <p className="text-xl text-muted-foreground mb-8">轻松查找、分享、计划你的每一餐</p>

        <div className="max-w-md mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input type="text" placeholder="搜索食谱、食材或关键词..." className="pl-10 py-6 text-lg" />
          <Button className="absolute right-1 top-1 bottom-1" size="sm">
            搜索
          </Button>
        </div>
      </section>

      {/* Featured Recipes */}
      <FeaturedRecipes />

      {/* Quick Access */}
      <QuickAccess />
    </div>
  )
}
