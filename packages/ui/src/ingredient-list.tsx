"use client"

export interface Ingredient {
  name: string
  quantity: string
  unit?: string
  category?: string
}

export interface IngredientListProps {
  ingredients: Ingredient[]
  onToggle?: (index: number) => void
  showCheckboxes?: boolean
  checkedItems?: boolean[]
  className?: string
}

export function IngredientList({
  ingredients,
  onToggle,
  showCheckboxes = false,
  checkedItems = [],
  className = "",
}: IngredientListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {ingredients.map((ingredient, index) => (
        <div key={index} className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            {showCheckboxes && (
              <input
                type="checkbox"
                checked={checkedItems[index] || false}
                onChange={() => onToggle && onToggle(index)}
                className="h-4 w-4 rounded border-gray-300"
              />
            )}
            <span>{ingredient.name}</span>
          </div>
          <span className="text-muted-foreground">
            {ingredient.quantity}{ingredient.unit ? ` ${ingredient.unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
