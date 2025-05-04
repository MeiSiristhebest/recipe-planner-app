"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import type { Ingredient } from "@/types"

interface RecipeIngredientInputProps {
  ingredient: Ingredient
  onChange: (field: keyof Ingredient, value: string) => void
  onRemove: () => void
  showRemoveButton: boolean
}

export default function RecipeIngredientInput({
  ingredient,
  onChange,
  onRemove,
  showRemoveButton,
}: RecipeIngredientInputProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Input
        placeholder="食材名称"
        value={ingredient.name}
        onChange={(e) => onChange("name", e.target.value)}
        className="flex-1"
      />
      <Input
        placeholder="数量"
        value={ingredient.quantity}
        onChange={(e) => onChange("quantity", e.target.value)}
        className="w-full sm:w-20"
      />
      <Select value={ingredient.unit} onValueChange={(value) => onChange("unit", value)}>
        <SelectTrigger className="w-full sm:w-24">
          <SelectValue placeholder="单位" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="克">克</SelectItem>
          <SelectItem value="千克">千克</SelectItem>
          <SelectItem value="毫升">毫升</SelectItem>
          <SelectItem value="升">升</SelectItem>
          <SelectItem value="个">个</SelectItem>
          <SelectItem value="只">只</SelectItem>
          <SelectItem value="根">根</SelectItem>
          <SelectItem value="片">片</SelectItem>
          <SelectItem value="块">块</SelectItem>
          <SelectItem value="勺">勺</SelectItem>
          <SelectItem value="杯">杯</SelectItem>
          <SelectItem value="瓶">瓶</SelectItem>
          <SelectItem value="包">包</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="备注 (可选)"
        value={ingredient.note || ""}
        onChange={(e) => onChange("note", e.target.value)}
        className="flex-1"
      />
      {showRemoveButton && (
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
