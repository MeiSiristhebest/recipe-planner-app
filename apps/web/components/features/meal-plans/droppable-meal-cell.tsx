"use client"

import { useDroppable } from "@dnd-kit/core"
import { Button } from "@repo/ui/button"
import { Plus } from "lucide-react"
import { DraggableRecipe } from "./draggable-recipe"
import type { MealPlanItem } from "@/store/meal-plan-store"
import React from "react"

interface DroppableMealCellProps {
  id: string
  children: React.ReactNode
}

export function DroppableMealCell({ id, children }: DroppableMealCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-lg h-full min-h-[120px] flex flex-col transition-colors ${
        isOver ? "bg-primary/10" : ""
      }`}
    >
      {children}
    </div>
  )
}
