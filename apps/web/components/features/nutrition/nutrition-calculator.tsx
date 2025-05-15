"use client"

import { useState } from "react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@repo/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert"
import { Loader2, AlertCircle, Plus, Trash2 } from "lucide-react"
import { NutritionDisplay, type NutritionInfo } from "./nutrition-display"

interface Ingredient {
  name: string
  quantity: number
  unit: string
  category?: string
}

interface NutritionCalculatorProps {
  initialIngredients?: Ingredient[]
  initialServings?: number
  onCalculate?: (nutritionInfo: NutritionInfo) => void
  className?: string
}

export function NutritionCalculator({
  initialIngredients = [],
  initialServings = 2,
  onCalculate,
  className = "",
}: NutritionCalculatorProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients)
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: "",
    quantity: 100,
    unit: "克",
    category: "其他",
  })
  const [servings, setServings] = useState(initialServings)
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [missingIngredients, setMissingIngredients] = useState<string[]>([])
  const [useAI, setUseAI] = useState<boolean>(false)

  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) {
      setError("请输入食材名称")
      return
    }

    setIngredients([...ingredients, { ...newIngredient }])
    setNewIngredient({
      name: "",
      quantity: 100,
      unit: "克",
      category: "其他",
    })
    setError(null)
  }

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...ingredients]
    updatedIngredients.splice(index, 1)
    setIngredients(updatedIngredients)
  }

  // 使用数据库计算营养成分
  const handleCalculateWithDatabase = async () => {
    if (ingredients.length === 0) {
      setError("请至少添加一种食材")
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      const response = await fetch("/api/nutrition/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients,
          servings,
        }),
      })

      if (!response.ok) {
        throw new Error("计算营养成分失败")
      }

      const data = await response.json()
      setNutritionInfo(data.perServingNutrition)
      setMissingIngredients(data.missingIngredients || [])

      if (onCalculate) {
        onCalculate(data.perServingNutrition)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "计算营养成分失败")
      console.error("营养计算错误:", err)
    } finally {
      setIsCalculating(false)
    }
  }

  // 使用AI计算营养成分
  const handleCalculateWithAI = async () => {
    if (ingredients.length === 0) {
      setError("请至少添加一种食材")
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      const response = await fetch("/api/nutrition/ai-calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients,
          servings,
        }),
      })

      if (!response.ok) {
        throw new Error("AI计算营养成分失败")
      }

      const data = await response.json()
      setNutritionInfo(data.perServingNutrition)
      setMissingIngredients([]) // AI计算不需要显示缺失食材

      if (onCalculate) {
        onCalculate(data.perServingNutrition)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI计算营养成分失败")
      console.error("AI营养计算错误:", err)
    } finally {
      setIsCalculating(false)
    }
  }

  // 根据用户选择的方法计算
  const handleCalculate = useAI ? handleCalculateWithAI : handleCalculateWithDatabase

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {/* 左侧：食材输入 */}
      <Card>
        <CardHeader>
          <CardTitle>食材列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 食材列表 */}
          {ingredients.length > 0 ? (
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <span className="font-medium">{ingredient.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIngredient(index)}
                    aria-label="删除食材"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">请添加食材以计算营养成分</div>
          )}

          {/* 添加新食材 */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="ingredient-name">食材名称</Label>
              <Input
                id="ingredient-name"
                placeholder="例如：鸡胸肉、西兰花"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ingredient-quantity">数量</Label>
                <Input
                  id="ingredient-quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={newIngredient.quantity}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, quantity: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredient-unit">单位</Label>
                <Select
                  value={newIngredient.unit}
                  onValueChange={(value) => setNewIngredient({ ...newIngredient, unit: value })}
                >
                  <SelectTrigger id="ingredient-unit">
                    <SelectValue placeholder="选择单位" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="克">克 (g)</SelectItem>
                    <SelectItem value="千克">千克 (kg)</SelectItem>
                    <SelectItem value="毫升">毫升 (ml)</SelectItem>
                    <SelectItem value="升">升 (l)</SelectItem>
                    <SelectItem value="汤匙">汤匙 (tbsp)</SelectItem>
                    <SelectItem value="茶匙">茶匙 (tsp)</SelectItem>
                    <SelectItem value="杯">杯 (cup)</SelectItem>
                    <SelectItem value="个">个 (piece)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredient-category">分类（可选）</Label>
              <Select
                value={newIngredient.category}
                onValueChange={(value) => setNewIngredient({ ...newIngredient, category: value })}
              >
                <SelectTrigger id="ingredient-category">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="蔬菜水果">蔬菜水果</SelectItem>
                  <SelectItem value="肉类海鲜">肉类海鲜</SelectItem>
                  <SelectItem value="乳制品蛋类">乳制品蛋类</SelectItem>
                  <SelectItem value="谷物豆类">谷物豆类</SelectItem>
                  <SelectItem value="调味品干货">调味品干货</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={handleAddIngredient} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              添加食材
            </Button>
          </div>

          {/* 份量设置 */}
          <div className="pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="servings">份量（人份）</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Number.parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* 计算方式选择 */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="calculation-method">计算方式</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="ai-toggle" className={`text-sm ${useAI ? 'text-muted-foreground' : 'font-medium'}`}>数据库</Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={useAI}
                  id="ai-toggle"
                  onClick={() => setUseAI(!useAI)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                    useAI ? 'bg-primary' : 'bg-input'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                      useAI ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <Label htmlFor="ai-toggle" className={`text-sm ${useAI ? 'font-medium' : 'text-muted-foreground'}`}>AI</Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {useAI
                ? "使用AI计算可能更准确，但速度较慢"
                : "使用数据库计算速度快，但可能缺少某些食材数据"}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCalculate} disabled={ingredients.length === 0 || isCalculating}>
            {isCalculating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {useAI ? "AI计算中..." : "计算中..."}
              </>
            ) : (
              `${useAI ? "使用AI" : ""}计算营养成分`
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* 右侧：营养信息 */}
      <div>
        {nutritionInfo ? (
          <>
            <NutritionDisplay nutritionInfo={nutritionInfo} servings={servings} />

            {missingIngredients.length > 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>注意</AlertTitle>
                <AlertDescription>
                  以下食材在数据库中未找到，营养计算可能不准确：
                  <ul className="list-disc list-inside mt-2">
                    {missingIngredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {useAI && nutritionInfo && (
              <Alert className="mt-4" variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>AI计算</AlertTitle>
                <AlertDescription>
                  此营养数据由AI智能分析生成，可能与实际值有所差异。
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">添加食材并点击"计算营养成分"按钮查看结果</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
