"use client"

import { useDroppable } from "@dnd-kit/core"
import { Button } from "@repo/ui/button"
import { Plus } from "lucide-react"
import { DraggableRecipe } from "./draggable-recipe"
import type { MealPlanItem } from "@/store/meal-plan-store"

interface DroppableMealCellProps {
  id: string
  items: MealPlanItem[]
  onAddClick: () => void
  onRemoveItem: (id: string) => void
}

export function DroppableMealCell({ id, items, onAddClick, onRemoveItem }: DroppableMealCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-lg p-2 h-full min-h-[120px] flex flex-col gap-2 transition-colors ${
        isOver ? "bg-primary/10" : ""
      }`}
    >
      {items.length > 0 ? (
        items.map((item) => (
          <DraggableRecipe key={item.id} id={item.id} recipe={item.recipe} onRemove={() => onRemoveItem(item.id)} />
        ))
      ) : (
        <Button
          variant="ghost"
          className="h-full w-full border-dashed border-2 flex items-center justify-center"
          onClick={onAddClick}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
