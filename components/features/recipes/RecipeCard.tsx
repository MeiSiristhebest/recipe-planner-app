import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, Star, Heart, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Recipe {
  id: number
  title: string
  image: string
  cookingTime: number
  difficulty: string
  rating: number
  category: string
  tags?: string[]
}

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={recipe.image || "/placeholder.svg"}
          alt={recipe.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Button size="icon" variant="ghost" className="rounded-full bg-background/80 hover:bg-background">
            <Heart className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full bg-background/80 hover:bg-background">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <Badge className="absolute top-2 left-2">{recipe.category}</Badge>
      </div>
      <CardContent className="pt-4 flex-grow">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">{recipe.title}</h3>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-2">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{recipe.cookingTime} 分钟</span>
          </div>
          <div className="flex items-center">
            <ChefHat className="h-4 w-4 mr-1" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
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
  )
}
