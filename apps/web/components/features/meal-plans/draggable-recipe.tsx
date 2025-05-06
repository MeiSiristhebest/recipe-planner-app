"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { Button } from "@repo/ui/button"
import { Trash2 } from "lucide-react"
import type { Recipe } from "@recipe-planner/types"

interface DraggableRecipeProps {
  id: string
  recipe: Recipe
  onRemove?: () => void
  showRemoveButton?: boolean
}

export function DraggableRecipe({ id, recipe, onRemove, showRemoveButton = true }: DraggableRecipeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center space-x-2">
        <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={recipe.coverImage || "/placeholder.svg"}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{recipe.title}</h4>
          <p className="text-xs text-muted-foreground">{recipe.cookingTime}分钟</p>
        </div>
        {showRemoveButton && onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove} className="flex-shrink-0">
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            <span className="sr-only">移除</span>
          </Button>
        )}
      </div>
    </div>
  )
}
