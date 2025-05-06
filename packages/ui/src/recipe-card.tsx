"use client"
import { Star } from "lucide-react"

export interface RecipeCardProps {
  id: string
  title: string
  coverImage: string
  cookingTime: number
  difficulty: string
  rating: number
  categories: string[]
  onClick?: () => void
  className?: string
}

export function RecipeCard({
  id,
  title,
  coverImage,
  cookingTime,
  difficulty,
  rating,
  categories,
  onClick,
  className = "",
}: RecipeCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      onClick={onClick}
    >
      <div className="aspect-video relative">
        {/* This would be an Image component in the consuming app */}
        <img src={coverImage || "/placeholder.svg"} alt={title} className="object-cover w-full h-full" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground">烹饪时间: {cookingTime}分钟</p>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <Star className="w-4 h-4 text-yellow-500 ml-1 fill-yellow-500" />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {categories.slice(0, 2).map((category) => (
            <span
              key={category}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            >
              {category}
            </span>
          ))}
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            {difficulty}
          </span>
        </div>
      </div>
    </div>
  )
}
