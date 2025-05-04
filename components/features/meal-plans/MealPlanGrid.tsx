import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import Image from "next/image"

interface MealPlanGridProps {
  weekDates: Date[]
}

// Mock data for meal types
const mealTypes = [
  { id: "breakfast", name: "早餐" },
  { id: "lunch", name: "午餐" },
  { id: "dinner", name: "晚餐" },
]

// Mock data for planned meals
const plannedMeals = [
  {
    date: new Date().toISOString().split("T")[0],
    mealType: "breakfast",
    recipe: {
      id: 1,
      title: "燕麦粥配水果",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    date: new Date().toISOString().split("T")[0],
    mealType: "lunch",
    recipe: {
      id: 2,
      title: "鸡肉沙拉",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0],
    mealType: "dinner",
    recipe: {
      id: 3,
      title: "意大利面",
      image: "/placeholder.svg?height=100&width=100",
    },
  },
]

export default function MealPlanGrid({ weekDates }: MealPlanGridProps) {
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
    return plannedMeals.find((meal) => meal.date === date && meal.mealType === mealType)
  }

  return (
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

              return (
                <div
                  key={`${mealType.id}-${dateIndex}`}
                  className={`border rounded-md p-2 min-h-[100px] ${
                    date.toDateString() === new Date().toDateString() ? "bg-primary/5" : ""
                  }`}
                >
                  {meal ? (
                    <div className="relative h-full">
                      <div className="absolute top-0 right-0">
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden">
                          <Image
                            src={meal.recipe.image || "/placeholder.svg"}
                            alt={meal.recipe.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-sm font-medium line-clamp-2">{meal.recipe.title}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Plus className="h-4 w-4 mr-1" />
                        添加
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
