"use client"

import { useDroppable } from "@dnd-kit/core"
import type { ReactNode } from "react"

interface DroppableMealSlotProps {
  id: string
  children: ReactNode
}

export default function DroppableMealSlot({ id, children }: DroppableMealSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div ref={setNodeRef} className={`h-full w-full ${isOver ? "bg-primary/10 rounded-md" : ""}`}>
      {children}
    </div>
  )
}
