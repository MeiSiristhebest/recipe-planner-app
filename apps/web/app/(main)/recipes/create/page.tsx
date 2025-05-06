"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { createRecipe } from "@/app/api/recipes/actions"
import { ImageUpload } from "@/components/features/recipes/image-upload"
import Image from "next/image"
import { NutritionCalculator } from "@/components/nutrition-calculator"
import type { NutritionInfo } from "@/components/nutrition-display"

type Ingredient = {
  name: string
  quantity: string
  category?: string
}

type Instruction = {
  step: number
  content: string
  imageUrl?: string
}

export default function CreateRecipePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cookingTime: 30,
    servings: 2,
    difficulty: "中等",
    ingredients: [] as Ingredient[],
    instructions: [] as Instruction[],
    nutritionInfo: {} as NutritionInfo,
    categoryIds: [] as string[],
    tagIds: [] as string[],
  })

  const [coverImage, setCoverImage] = useState<string | null>(null)

  // Temporary state for new ingredients and instructions
  const [newIngredient, setNewIngredient] = useState<Ingredient>({ name: "", quantity: "" })
  const [newInstruction, setNewInstruction] = useState<{ content: string; imageUrl?: string }>({
    content: "",
  })
  const [newNutrition, setNewNutrition] = useState({ name: "", value: 0 })

  // Sample categories and tags (in a real app, these would be fetched from the API)
  const categories = [
    { id: "1", name: "快手菜" },
    { id: "2", name: "家常菜" },
    { id: "3", name: "烘焙" },
    { id: "4", name: "汤羹" },
    { id: "5", name: "早餐" },
  ]

  const tags = [
    { id: "1", name: "素食" },
    { id: "2", name: "低卡" },
    { id: "3", name: "无麸质" },
    { id: "4", name: "高蛋白" },
    { id: "5", name: "儿童友好" },
  ]

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => {
      if (prev.categoryIds.includes(categoryId)) {
        return { ...prev, categoryIds: prev.categoryIds.filter((id) => id !== categoryId) }
      } else {
        return { ...prev, categoryIds: [...prev.categoryIds, categoryId] }
      }
    })
  }

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => {
      if (prev.tagIds.includes(tagId)) {
        return { ...prev, tagIds: prev.tagIds.filter((id) => id !== tagId) }
      } else {
        return { ...prev, tagIds: [...prev.tagIds, tagId] }
      }
    })
  }

  const addIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.quantity.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, { ...newIngredient }],
      }))
      setNewIngredient({ name: "", quantity: "" })
    }
  }

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const addInstruction = () => {
    if (newInstruction.content.trim()) {
      setFormData((prev) => ({
        ...prev,
        instructions: [
          ...prev.instructions,
          {
            step: prev.instructions.length + 1,
            content: newInstruction.content,
            imageUrl: newInstruction.imageUrl,
          },
        ],
      }))
      setNewInstruction({ content: "" })
    }
  }

  const removeInstruction = (index: number) => {
    setFormData((prev) => {
      const newInstructions = prev.instructions.filter((_, i) => i !== index)
      // Renumber steps
      return {
        ...prev,
        instructions: newInstructions.map((instruction, i) => ({
          ...instruction,
          step: i + 1,
        })),
      }
    })
  }

  const moveInstruction = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === formData.instructions.length - 1)) {
      return
    }

    setFormData((prev) => {
      const newInstructions = [...prev.instructions]
      const newIndex = direction === "up" ? index - 1 : index + 1
      const temp = newInstructions[index]
      newInstructions[index] = newInstructions[newIndex]
      newInstructions[newIndex] = temp

      // Renumber steps
      return {
        ...prev,
        instructions: newInstructions.map((instruction, i) => ({
          ...instruction,
          step: i + 1,
        })),
      }
    })
  }

  const addNutrition = () => {
    if (newNutrition.name.trim() && newNutrition.value > 0) {
      setFormData((prev) => ({
        ...prev,
        nutritionInfo: {
          ...prev.nutritionInfo,
          [newNutrition.name]: newNutrition.value,
        },
      }))
      setNewNutrition({ name: "", value: 0 })
    }
  }

  const removeNutrition = (name: string) => {
    setFormData((prev) => {
      const newNutritionInfo = { ...prev.nutritionInfo }
      delete newNutritionInfo[name]
      return { ...prev, nutritionInfo: newNutritionInfo }
    })
  }

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "上传图片失败")
      }

      const data = await response.json()
      setCoverImage(data.url)
    } catch (error) {
      console.error("Error uploading image:", error)
      setError("上传图片失败，请稍后再试")
    }
  }

  const handleImageRemove = () => {
    setCoverImage(null)
  }

  const handleInstructionImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "上传图片失败")
      }

      const data = await response.json()
      setNewInstruction((prev) => ({ ...prev, imageUrl: data.url }))
    } catch (error) {
      console.error("Error uploading instruction image:", error)
      setError("上传图片失败，请稍后再试")
    }
  }

  const handleInstructionImageRemove = () => {
    setNewInstruction((prev) => ({ ...prev, imageUrl: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate form data
    if (!formData.title.trim()) {
      setError("请输入食谱标题")
      setIsLoading(false)
      return
    }

    if (formData.ingredients.length === 0) {
      setError("请至少添加一种食材")
      setIsLoading(false)
      return
    }

    if (formData.instructions.length === 0) {
      setError("请至少添加一个步骤")
      setIsLoading(false)
      return
    }

    if (formData.categoryIds.length === 0) {
      setError("请至少选择一个分类")
      setIsLoading(false)
      return
    }

    try {
      // Create FormData object
      const formDataObj = new FormData()
      formDataObj.append("title", formData.title)
      formDataObj.append("description", formData.description)
      formDataObj.append("cookingTime", formData.cookingTime.toString())
      formDataObj.append("servings", formData.servings.toString())
      formDataObj.append("difficulty", formData.difficulty)
      formDataObj.append("ingredients", JSON.stringify(formData.ingredients))
      formDataObj.append("instructions", JSON.stringify(formData.instructions))
      formDataObj.append("nutritionInfo", JSON.stringify(formData.nutritionInfo))
      formData.categoryIds.forEach((id) => formDataObj.append("categoryIds", id))
      formData.tagIds.forEach((id) => formDataObj.append("tagIds", id))

      if (coverImage) {
        formDataObj.append("coverImage", coverImage)
      }

      const result = await createRecipe(formDataObj)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Redirect to recipe page
      router.push(`/recipes/${result.recipe.id}`)
    } catch (error) {
      console.error("Error creating recipe:", error)
      setError("创建食谱失败，请稍后再试")
      setIsLoading(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "basic") setActiveTab("ingredients")
    else if (activeTab === "ingredients") setActiveTab("instructions")
    else if (activeTab === "instructions") setActiveTab("nutrition")
    else if (activeTab === "nutrition") setActiveTab("categories")
  }

  const prevTab = () => {
    if (activeTab === "categories") setActiveTab("nutrition")
    else if (activeTab === "nutrition") setActiveTab("instructions")
    else if (activeTab === "instructions") setActiveTab("ingredients")
    else if (activeTab === "ingredients") setActiveTab("basic")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">创建新食谱</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="ingredients">食材</TabsTrigger>
            <TabsTrigger value="instructions">步骤</TabsTrigger>
            <TabsTrigger value="nutrition">营养信息</TabsTrigger>
            <TabsTrigger value="categories">分类和标签</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>填写食谱的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleBasicInfoChange}
                    placeholder="输入食谱标题"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleBasicInfoChange}
                    placeholder="简短描述这道食谱"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    previewUrl={coverImage || undefined}
                    label="封面图片"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cookingTime">烹饪时间（分钟）</Label>
                    <Input
                      id="cookingTime"
                      name="cookingTime"
                      type="number"
                      min="1"
                      value={formData.cookingTime}
                      onChange={handleNumberChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servings">份量（人份）</Label>
                    <Input
                      id="servings"
                      name="servings"
                      type="number"
                      min="1"
                      value={formData.servings}
                      onChange={handleNumberChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">难度</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => handleSelectChange("difficulty", value)}
                    >
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="button" onClick={nextTab}>
                  下一步
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Ingredients */}
          <TabsContent value="ingredients">
            <Card>
              <CardHeader>
                <CardTitle>食材</CardTitle>
                <CardDescription>添加食谱所需的食材和数量</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredientName">食材名称</Label>
                    <Input
                      id="ingredientName"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      placeholder="例如：鸡胸肉"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ingredientQuantity">数量</Label>
                    <Input
                      id="ingredientQuantity"
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                      placeholder="例如：300克"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ingredientCategory">分类（可选）</Label>
                    <Select
                      value={newIngredient.category}
                      onValueChange={(value) => setNewIngredient({ ...newIngredient, category: value })}
                    >
                      <SelectTrigger id="ingredientCategory">
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="蔬菜水果">蔬菜水果</SelectItem>
                        <SelectItem value="肉类海鲜">肉类海鲜</SelectItem>
                        <SelectItem value="乳制品蛋类">乳制品蛋类</SelectItem>
                        <SelectItem value="调味品干货">调味品干货</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addIngredient}
                  disabled={!newIngredient.name || !newIngredient.quantity}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  添加食材
                </Button>

                {formData.ingredients.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">食材</th>
                          <th className="px-4 py-2 text-left">数量</th>
                          <th className="px-4 py-2 text-left">分类</th>
                          <th className="px-4 py-2 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.ingredients.map((ingredient, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{ingredient.name}</td>
                            <td className="px-4 py-2">{ingredient.quantity}</td>
                            <td className="px-4 py-2">{ingredient.category || "-"}</td>
                            <td className="px-4 py-2 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIngredient(index)}
                                className="text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">尚未添加食材</div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevTab}>
                  上一步
                </Button>
                <Button type="button" onClick={nextTab}>
                  下一步
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Instructions */}
          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>步骤</CardTitle>
                <CardDescription>添加食谱的烹饪步骤</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instruction">步骤描述</Label>
                  <Textarea
                    id="instruction"
                    value={newInstruction.content}
                    onChange={(e) => setNewInstruction({ ...newInstruction, content: e.target.value })}
                    placeholder="描述这个步骤的具体操作"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <ImageUpload
                    onImageUpload={handleInstructionImageUpload}
                    onImageRemove={handleInstructionImageRemove}
                    previewUrl={newInstruction.imageUrl}
                    label="步骤图片（可选）"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addInstruction}
                  disabled={!newInstruction.content}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  添加步骤
                </Button>

                {formData.instructions.length > 0 ? (
                  <div className="space-y-4">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                              {instruction.step}
                            </div>
                            <div className="font-medium">步骤 {instruction.step}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveInstruction(index, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveInstruction(index, "down")}
                              disabled={index === formData.instructions.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeInstruction(index)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2">{instruction.content}</p>
                        {instruction.imageUrl && (
                          <div className="mt-2 relative rounded-md overflow-hidden">
                            <div className="h-40 relative">
                              <Image
                                src={instruction.imageUrl || "/placeholder.svg"}
                                alt={`步骤 ${instruction.step}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">尚未添加步骤</div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevTab}>
                  上一步
                </Button>
                <Button type="button" onClick={nextTab}>
                  下一步
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Nutrition */}
          <TabsContent value="nutrition" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>营养信息</CardTitle>
                <CardDescription>计算食谱的营养成分信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NutritionCalculator
                  initialIngredients={formData.ingredients.map((ing) => ({
                    name: ing.name,
                    quantity: Number.parseFloat(ing.quantity) || 0,
                    unit: ing.quantity.replace(/[0-9.]/g, "").trim() || "克",
                    category: ing.category,
                  }))}
                  initialServings={formData.servings}
                  onCalculate={(nutritionInfo) => {
                    setFormData((prev) => ({ ...prev, nutritionInfo }))
                  }}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevTab}>
                  上一步
                </Button>
                <Button type="button" onClick={nextTab}>
                  下一步
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Categories and Tags */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>分类和标签</CardTitle>
                <CardDescription>为食谱选择分类和标签</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">分类</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={formData.categoryIds.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`category-${category.id}`} className="text-sm font-medium">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">标签</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`tag-${tag.id}`}
                          checked={formData.tagIds.includes(tag.id)}
                          onChange={() => handleTagToggle(tag.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`tag-${tag.id}`} className="text-sm font-medium">
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevTab}>
                  上一步
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "创建中..." : "创建食谱"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
