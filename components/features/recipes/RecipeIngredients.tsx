import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ShoppingCart } from "lucide-react"

interface Ingredient {
  name: string
  quantity: string
  unit: string
  note?: string
}

interface RecipeIngredientsProps {
  ingredients: Ingredient[]
}

export default function RecipeIngredients({ ingredients }: RecipeIngredientsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">食材</h2>
        <Button variant="outline" size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          添加到购物清单
        </Button>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <ul className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-start">
              <Checkbox id={`ingredient-${index}`} className="mt-1 mr-3" />
              <Label htmlFor={`ingredient-${index}`} className="cursor-pointer flex-1">
                <span className="font-medium">
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </span>
                {ingredient.note && <span className="text-sm text-muted-foreground ml-2">({ingredient.note})</span>}
              </Label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
