"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus } from "lucide-react"
import RecipeIngredientInput from "@/components/features/recipes/RecipeIngredientInput"
import RecipeInstructionInput from "@/components/features/recipes/RecipeInstructionInput"
import type { Ingredient, Instruction } from "@/types"

export default function CreateRecipePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 食谱基本信息
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [cookingTime, setCookingTime] = useState("30")
  const [difficulty, setDifficulty] = useState("中等")
  const [servings, setServings] = useState("2")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState("")

  // 食材和步骤
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", quantity: "", unit: "克" }])
  const [instructions, setInstructions] = useState<Instruction[]>([{ step: 1, description: "", image: "" }])

  // 添加食材
  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "克" }])
  }

  // 更新食材
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updatedIngredients = [...ingredients]
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value }
    setIngredients(updatedIngredients)
  }

  // 删除食材
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  // 添加步骤
  const addInstruction = () => {
    const nextStep = instructions.length + 1
    setInstructions([...instructions, { step: nextStep, description: "", image: "" }])
  }

  // 更新步骤
  const updateInstruction = (index: number, field: keyof Instruction, value: string) => {
    const updatedInstructions = [...instructions]
    updatedInstructions[index] = {
      ...updatedInstructions[index],
      [field]: field === "step" ? Number.parseInt(value) : value,
    }
    setInstructions(updatedInstructions)
  }

  // 删除步骤
  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updatedInstructions = instructions.filter((_, i) => i !== index)
      // 重新编号步骤
      updatedInstructions.forEach((instruction, i) => {
        instruction.step = i + 1
      })
      setInstructions(updatedInstructions)
    }
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!title) {
      toast({
        title: "请输入食谱标题",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "请选择食谱分类",
        variant: "destructive",
      })
      return
    }

    // 验证食材
    const isIngredientsValid = ingredients.every((ing) => ing.name && ing.quantity)
    if (!isIngredientsValid) {
      toast({
        title: "请完善所有食材信息",
        variant: "destructive",
      })
      return
    }

    // 验证步骤
    const isInstructionsValid = instructions.every((ins) => ins.description)
    if (!isInstructionsValid) {
      toast({
        title: "请完善所有步骤信息",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          cookingTime: Number.parseInt(cookingTime),
          difficulty,
          servings: Number.parseInt(servings),
          categoryId: category,
          image: image || "/placeholder.svg?height=300&width=400",
          ingredients,
          instructions,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "创建食谱失败")
      }

      const recipe = await response.json()

      toast({
        title: "食谱创建成功",
        description: "您的食谱已成功创建",
      })

      router.push(`/recipes/${recipe.id}`)
    } catch (error) {
      toast({
        title: "创建失败",
        description: error instanceof Error ? error.message : "创建食谱时发生错误",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">创建新食谱</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">食谱名称</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="输入食谱名称"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">食谱描述</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="简单描述这道菜的特点和口味"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cookingTime">烹饪时间 (分钟)</Label>
                    <Input
                      id="cookingTime"
                      type="number"
                      min="1"
                      value={cookingTime}
                      onChange={(e) => setCookingTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">难度</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="选择难度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="简单">简单</SelectItem>
                        <SelectItem value="中等">中等</SelectItem>
                        <SelectItem value="困难">困难</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servings">份量 (人份)</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category-1">家常菜</SelectItem>
                      <SelectItem value="category-2">快手菜</SelectItem>
                      <SelectItem value="category-3">烘焙</SelectItem>
                      <SelectItem value="category-4">汤羹</SelectItem>
                      <SelectItem value="category-5">素食</SelectItem>
                      <SelectItem value="category-6">海鲜</SelectItem>
                      <SelectItem value="category-7">肉类</SelectItem>
                      <SelectItem value="category-8">甜点</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">图片链接 (可选)</Label>
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="输入图片URL"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 食材 */}
            <Card>
              <CardHeader>
                <CardTitle>食材</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <RecipeIngredientInput
                    key={index}
                    ingredient={ingredient}
                    onChange={(field, value) => updateIngredient(index, field, value)}
                    onRemove={() => removeIngredient(index)}
                    showRemoveButton={ingredients.length > 1}
                  />
                ))}

                <Button type="button" variant="outline" onClick={addIngredient}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加食材
                </Button>
              </CardContent>
            </Card>

            {/* 步骤 */}
            <Card>
              <CardHeader>
                <CardTitle>步骤</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {instructions.map((instruction, index) => (
                  <RecipeInstructionInput
                    key={index}
                    instruction={instruction}
                    onChange={(field, value) => updateInstruction(index, field, value)}
                    onRemove={() => removeInstruction(index)}
                    showRemoveButton={instructions.length > 1}
                  />
                ))}

                <Button type="button" variant="outline" onClick={addInstruction}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加步骤
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>发布设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">标签 (可选)</Label>
                  <Input id="tags" placeholder="输入标签，用逗号分隔" />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="public" className="rounded border-gray-300" />
                  <Label htmlFor="public">公开发布</Label>
                </div>

                <div className="text-sm text-muted-foreground">
                  公开发布的食谱将显示在食谱库中，所有用户都可以查看。
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发布中...
                    </>
                  ) : (
                    "发布食谱"
                  )}
                </Button>

                <Button className="w-full mt-2" type="button" variant="outline" onClick={() => router.back()}>
                  取消
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
