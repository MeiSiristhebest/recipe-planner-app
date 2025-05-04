"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"
import type { Recipe } from "@/types"

interface SortableMealItemProps {
  id: string
  recipe: Recipe
  onRemove: () => void
}

export default function SortableMealItem({ id, recipe, onRemove }: SortableMealItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative h-full">
      <div className="absolute top-0 right-0 z-10">
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="relative w-12 h-12 rounded-md overflow-hidden">
          <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
        </div>
        <div className="text-sm font-medium line-clamp-2">{recipe.title}</div>
      </div>
    </div>
  )
}
