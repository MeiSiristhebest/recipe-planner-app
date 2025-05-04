"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import type { Instruction } from "@/types"

interface RecipeInstructionInputProps {
  instruction: Instruction
  onChange: (field: keyof Instruction, value: string) => void
  onRemove: () => void
  showRemoveButton: boolean
}

export default function RecipeInstructionInput({
  instruction,
  onChange,
  onRemove,
  showRemoveButton,
}: RecipeInstructionInputProps) {
  return (
    <div className="space-y-2 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
          {instruction.step}
        </div>
        <div className="font-medium">步骤 {instruction.step}</div>
        {showRemoveButton && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="ml-auto">
            <Trash2 className="h-4 w-4 mr-1" />
            删除
          </Button>
        )}
      </div>
      <Textarea
        placeholder="描述这个步骤的具体操作..."
        value={instruction.description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={3}
      />
      <Input
        placeholder="步骤图片链接 (可选)"
        value={instruction.image || ""}
        onChange={(e) => onChange("image", e.target.value)}
      />
    </div>
  )
}
