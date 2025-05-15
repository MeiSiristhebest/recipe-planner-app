"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/shared/auth-guard"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Textarea } from "@repo/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Alert, AlertDescription } from "@repo/ui/alert"
import { AlertCircle, Plus, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/features/recipes/image-upload"
import Image from "next/image"
import { NutritionCalculator } from "@/components/features/nutrition/nutrition-calculator"
import type { NutritionInfo } from "@/components/features/nutrition/nutrition-display"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

// 扩展导入的NutritionInfo类型，添加索引签名
type ExtendedNutritionInfo = NutritionInfo & {
  [key: string]: number
}

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

export default function EditRecipePage() {
  return (
    <AuthGuard>
      <EditRecipeContent />
    </AuthGuard>
  )
}

function EditRecipeContent() {
  const router = useRouter()
  const params = useParams()
  const recipeId = params.recipeId as string
  const { data: session } = useSession()

  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cookingTime: 30,
    servings: 2,
    difficulty: "中等" as "简单" | "中等" | "困难",
    ingredients: [] as Ingredient[],
    instructions: [] as Instruction[],
    nutritionInfo: {} as ExtendedNutritionInfo,
    categoryIds: [] as string[],
    tagIds: [] as string[],
  })

  // 临时状态用于新的食材和步骤
  const [newIngredient, setNewIngredient] = useState<Ingredient>({ name: "", quantity: "" })
  const [newInstruction, setNewInstruction] = useState<{ content: string; imageUrl?: string }>({
    content: "",
  })

  // 示例分类和标签（实际应用中应从API获取）
  const [categories, setCategories] = useState([
    { id: "1", name: "快手菜" },
    { id: "2", name: "家常菜" },
    { id: "3", name: "烘焙" },
    { id: "4", name: "汤羹" },
    { id: "5", name: "早餐" },
  ])

  const [tags, setTags] = useState([
    { id: "1", name: "减脂" },
    { id: "2", name: "增肌" },
    { id: "3", name: "素食" },
    { id: "4", name: "无麸质" },
    { id: "5", name: "低碳水" },
  ])

  // 获取食谱数据
  useEffect(() => {
    async function fetchRecipe() {
      try {
        setIsFetching(true)
        const response = await fetch(`/api/recipes/${recipeId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("食谱不存在")
            return
          }
          if (response.status === 403) {
            setError("无权编辑此食谱")
            return
          }
          throw new Error("获取食谱失败")
        }

        const data = await response.json()

        // 检查当前用户是否是作者
        if (session?.user?.id !== data.author.id) {
          setError("无权编辑此食谱")
          setIsAuthorized(false)
          return
        }

        setIsAuthorized(true)

        // 填充表单数据
        setFormData({
          title: data.title || "",
          description: data.description || "",
          cookingTime: data.cookingTime || 30,
          servings: data.servings || 2,
          difficulty: data.difficulty || "中等",
          ingredients: data.ingredients || [],
          instructions: data.instructions || [],
          nutritionInfo: data.nutritionInfo || {},
          categoryIds: data.categories?.map((c: any) => c.category.id) || [],
          tagIds: data.tags?.map((t: any) => t.tag.id) || [],
        })

        // 设置封面图片
        if (data.coverImage) {
          setCoverImage(data.coverImage)
        }

        // 获取分类和标签
        fetchCategoriesAndTags()
      } catch (error) {
        console.error("Error fetching recipe:", error)
        setError("获取食谱失败，请稍后再试")
      } finally {
        setIsFetching(false)
      }
    }

    async function fetchCategoriesAndTags() {
      try {
        // 获取分类
        const categoriesResponse = await fetch("/api/categories")
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }

        // 获取标签
        const tagsResponse = await fetch("/api/tags")
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json()
          setTags(tagsData)
        }
      } catch (error) {
        console.error("Error fetching categories and tags:", error)
      }
    }

    if (recipeId && session?.user?.id) {
      fetchRecipe()
    }
  }, [recipeId, session?.user?.id])

  // 处理基本信息变更
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 处理数字输入变更
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({ ...prev, [name]: numValue }))
    }
  }

  // 处理图片上传
  const handleImageUpload = (url: string) => {
    setCoverImage(url)
  }

  // 处理图片移除
  const handleImageRemove = () => {
    setCoverImage(null)
  }

  // 处理步骤图片上传
  const handleInstructionImageUpload = (url: string) => {
    setNewInstruction((prev) => ({ ...prev, imageUrl: url }))
  }

  // 处理步骤图片移除
  const handleInstructionImageRemove = () => {
    setNewInstruction((prev) => ({ ...prev, imageUrl: undefined }))
  }

  // 添加食材
  const addIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.quantity.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, { ...newIngredient }],
      }))
      setNewIngredient({ name: "", quantity: "" })
    }
  }

  // 移除食材
  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  // 添加步骤
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

  // 移除步骤
  const removeInstruction = (index: number) => {
    setFormData((prev) => {
      const newInstructions = prev.instructions.filter((_, i) => i !== index)
      // 重新编号步骤
      return {
        ...prev,
        instructions: newInstructions.map((instruction, i) => ({
          ...instruction,
          step: i + 1,
        })),
      }
    })
  }

  // 移动步骤
  const moveInstruction = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.instructions.length - 1)
    ) {
      return
    }

    setFormData((prev) => {
      const newInstructions = [...prev.instructions]
      const newIndex = direction === "up" ? index - 1 : index + 1
      const temp = newInstructions[index]
      newInstructions[index] = newInstructions[newIndex]
      newInstructions[newIndex] = temp

      // 重新编号步骤
      return {
        ...prev,
        instructions: newInstructions.map((instruction, i) => ({
          ...instruction,
          step: i + 1,
        })),
      }
    })
  }

  // 处理分类切换
  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => {
      const categoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId]
      return { ...prev, categoryIds }
    })
  }

  // 处理标签切换
  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => {
      const tagIds = prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId]
      return { ...prev, tagIds }
    })
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthorized) {
      setError("无权编辑此食谱")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // 验证表单
      if (!formData.title.trim()) {
        setError("请输入食谱标题")
        setActiveTab("basic")
        setIsLoading(false)
        return
      }

      if (formData.ingredients.length === 0) {
        setError("请至少添加一种食材")
        setActiveTab("ingredients")
        setIsLoading(false)
        return
      }

      if (formData.instructions.length === 0) {
        setError("请至少添加一个步骤")
        setActiveTab("instructions")
        setIsLoading(false)
        return
      }

      if (formData.categoryIds.length === 0) {
        setError("请至少选择一个分类")
        setActiveTab("categories")
        setIsLoading(false)
        return
      }

      // 准备提交数据
      const submitData = {
        ...formData,
        coverImage: coverImage || undefined,
      }

      // 发送更新请求
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "更新食谱失败")
      }

      // 更新成功，跳转到食谱详情页
      toast.success("食谱更新成功")
      router.push(`/recipes/${recipeId}`)
    } catch (error) {
      console.error("Error updating recipe:", error)
      setError(error instanceof Error ? error.message : "更新食谱失败，请稍后再试")
      setIsLoading(false)
    }
  }

  // 导航到下一个标签页
  const nextTab = () => {
    if (activeTab === "basic") setActiveTab("ingredients")
    else if (activeTab === "ingredients") setActiveTab("instructions")
    else if (activeTab === "instructions") setActiveTab("nutrition")
    else if (activeTab === "nutrition") setActiveTab("categories")
  }

  // 导航到上一个标签页
  const prevTab = () => {
    if (activeTab === "categories") setActiveTab("nutrition")
    else if (activeTab === "nutrition") setActiveTab("instructions")
    else if (activeTab === "instructions") setActiveTab("ingredients")
    else if (activeTab === "ingredients") setActiveTab("basic")
  }

  if (isFetching) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">编辑食谱</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">加载中...</span>
        </div>
      </div>
    )
  }

  if (error && !isAuthorized) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">编辑食谱</h1>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/recipes")}>返回食谱库</Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">编辑食谱</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="ingredients">食材</TabsTrigger>
            <TabsTrigger value="instructions">步骤</TabsTrigger>
            <TabsTrigger value="nutrition">营养信息</TabsTrigger>
            <TabsTrigger value="categories">分类和标签</TabsTrigger>
          </TabsList>

          {/* 基本信息标签页 */}
          <TabsContent value="basic">
            {/* 基本信息表单内容 - 与创建页面类似 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>编辑食谱的基本信息</CardDescription>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cookingTime">烹饪时间（分钟）</Label>
                    <Input
                      id="cookingTime"
                      name="cookingTime"
                      type="number"
                      min="1"
                      value={formData.cookingTime}
                      onChange={handleNumberChange}
                      required
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
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 md:col-span-1">
                    <Label htmlFor="difficulty">难度</Label>
                    <Select
                      name="difficulty"
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, difficulty: value as "简单" | "中等" | "困难" }))
                      }
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

          {/* 其他标签页内容与创建页面类似 */}
          {/* 食材标签页 */}
          <TabsContent value="ingredients">
            <Card>
              <CardHeader>
                <CardTitle>食材</CardTitle>
                <CardDescription>添加食谱所需的食材</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 已添加的食材列表 */}
                {formData.ingredients.length > 0 ? (
                  <div className="space-y-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <span className="font-medium">{ingredient.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">{ingredient.quantity}</span>
                          {ingredient.category && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded ml-2">
                              {ingredient.category}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(index)}
                          aria-label="删除食材"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">暂无食材，请添加</div>
                )}

                {/* 添加新食材 */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="例如：200克"
                      />
                    </div>
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
                        <SelectItem value="谷物豆类">谷物豆类</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>
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

          {/* 步骤标签页 */}
          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>步骤</CardTitle>
                <CardDescription>添加食谱的烹饪步骤</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 已添加的步骤列表 */}
                {formData.instructions.length > 0 ? (
                  <div className="space-y-4">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">步骤 {instruction.step}</h3>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveInstruction(index, "up")}
                              disabled={index === 0}
                              aria-label="上移步骤"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveInstruction(index, "down")}
                              disabled={index === formData.instructions.length - 1}
                              aria-label="下移步骤"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInstruction(index)}
                              aria-label="删除步骤"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{instruction.content}</p>
                        {instruction.imageUrl && (
                          <div className="mt-2">
                            <Image
                              src={instruction.imageUrl}
                              alt={`步骤 ${instruction.step} 图片`}
                              width={200}
                              height={150}
                              className="rounded-md object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">暂无步骤，请添加</div>
                )}

                {/* 添加新步骤 */}
                <div className="space-y-4 pt-4 border-t">
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
                </div>
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

          {/* 营养信息标签页 */}
          <TabsContent value="nutrition">
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
                    setFormData((prev) => ({
                      ...prev,
                      nutritionInfo: { ...nutritionInfo } as ExtendedNutritionInfo
                    }))
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

          {/* 分类和标签标签页 */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>分类和标签</CardTitle>
                <CardDescription>为食谱选择分类和标签</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">分类</h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    "保存食谱"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
