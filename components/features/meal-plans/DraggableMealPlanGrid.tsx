"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core"
import { SortableContext } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { MealPlanItem } from "@/types"
import SortableMealItem from "./SortableMealItem"
import DroppableMealSlot from "./DroppableMealSlot"

interface DraggableMealPlanGridProps {
  weekDates: Date[]
  mealItems: MealPlanItem[]
  onMealItemsChange: (items: MealPlanItem[]) => void
}

// 餐食类型
const mealTypes = [
  { id: "breakfast", name: "早餐" },
  { id: "lunch", name: "午餐" },
  { id: "dinner", name: "晚餐" },
]

export default function DraggableMealPlanGrid({ weekDates, mealItems, onMealItemsChange }: DraggableMealPlanGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("zh-CN", { weekday: "short" })
  }

  const formatDayNumber = (date: Date) => {
    return date.getDate()
  }

  const getMealForDateAndType = (date: string, mealType: string) => {
    return mealItems.find((meal) => meal.date === date && meal.mealType === mealType)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // 可以在这里处理拖拽悬停逻辑
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    // 找到拖拽的项目
    const activeMealItem = mealItems.find((item) => item.id === activeId)
    if (!activeMealItem) return

    // 如果目标是一个空槽
    if (overId.startsWith("slot-")) {
      const [_, date, mealType] = overId.split("-")

      // 更新项目的日期和餐食类型
      const updatedItems = mealItems.map((item) => {
        if (item.id === activeId) {
          return {
            ...item,
            date,
            mealType,
          }
        }
        return item
      })

      onMealItemsChange(updatedItems)
      return
    }

    // 如果目标是另一个餐食项目，交换它们的位置
    const overMealItem = mealItems.find((item) => item.id === overId)
    if (!overMealItem) return

    const updatedItems = mealItems.map((item) => {
      if (item.id === activeId) {
        return {
          ...item,
          date: overMealItem.date,
          mealType: overMealItem.mealType,
        }
      }
      if (item.id === overId) {
        return {
          ...item,
          date: activeMealItem.date,
          mealType: activeMealItem.mealType,
        }
      }
      return item
    })

    onMealItemsChange(updatedItems)
  }

  const handleRemoveMealItem = (id: string) => {
    onMealItemsChange(mealItems.filter((item) => item.id !== id))
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <SortableContext items={mealItems.map((item) => item.id)}>
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2">
            {/* Header - Empty cell for meal types */}
            <div className="p-2"></div>

            {/* Header - Days of the week */}
            {weekDates.map((date, index) => (
              <div
                key={index}
                className={`p-2 text-center ${
                  date.toDateString() === new Date().toDateString() ? "bg-primary/10 rounded-md" : ""
                }`}
              >
                <div className="font-medium">{formatDayName(date)}</div>
                <div className="text-2xl">{formatDayNumber(date)}</div>
              </div>
            ))}

            {/* Meal types and cells */}
            {mealTypes.map((mealType) => (
              <>
                {/* Meal type label */}
                <div key={mealType.id} className="p-2 font-medium flex items-center">
                  {mealType.name}
                </div>

                {/* Meal cells for each day */}
                {weekDates.map((date, dateIndex) => {
                  const formattedDate = formatDate(date)
                  const meal = getMealForDateAndType(formattedDate, mealType.id)
                  const slotId = `slot-${formattedDate}-${mealType.id}`

                  return (
                    <div
                      key={`${mealType.id}-${dateIndex}`}
                      className={`border rounded-md p-2 min-h-[100px] ${
                        date.toDateString() === new Date().toDateString() ? "bg-primary/5" : ""
                      }`}
                    >
                      {meal ? (
                        <SortableMealItem
                          id={meal.id}
                          recipe={meal.recipe}
                          onRemove={() => handleRemoveMealItem(meal.id)}
                        />
                      ) : (
                        <DroppableMealSlot id={slotId}>
                          <div className="flex items-center justify-center h-full">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <Plus className="h-4 w-4 mr-1" />
                              添加
                            </Button>
                          </div>
                        </DroppableMealSlot>
                      )}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  )
}
