"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Progress } from "@repo/ui/progress"

export interface NutritionInfo {
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  sugar: number
  sodium: number
}

interface NutritionDisplayProps {
  nutritionInfo: Partial<NutritionInfo>
  servings?: number
  showPerServing?: boolean
  className?: string
}

export function NutritionDisplay({
  nutritionInfo: initialNutritionInfo,
  servings = 1,
  showPerServing = true,
  className = "",
}: NutritionDisplayProps) {
  const [view, setView] = useState<"per-serving" | "total">("per-serving")

  // Sanitize nutritionInfo to ensure all fields are numbers
  const sanitizeField = (value: any, fieldName: string): number => {
    const num = Number(value)
    if (isNaN(num)) {
      console.warn(
        `NutritionDisplay: Field '${fieldName}' received non-numeric value '${value}', defaulting to 0.`
      )
      return 0
    }
    return num
  }

  const nutritionInfo: NutritionInfo = {
    calories: sanitizeField(initialNutritionInfo.calories, "calories"),
    protein: sanitizeField(initialNutritionInfo.protein, "protein"),
    fat: sanitizeField(initialNutritionInfo.fat, "fat"),
    carbs: sanitizeField(initialNutritionInfo.carbs, "carbs"),
    fiber: sanitizeField(initialNutritionInfo.fiber, "fiber"),
    sugar: sanitizeField(initialNutritionInfo.sugar, "sugar"),
    sodium: sanitizeField(initialNutritionInfo.sodium, "sodium"),
  }

  // 使用每份数据进行宏量素供能比计算
  const baseNutritionForPercentage = nutritionInfo
  const proteinCalories = baseNutritionForPercentage.protein * 4
  const fatCalories = baseNutritionForPercentage.fat * 9
  const carbsCalories = baseNutritionForPercentage.carbs * 4
  const totalCalculatedCalories = proteinCalories + fatCalories + carbsCalories

  // 优先使用传入的 calories 字段作为总热量基准，如果calories为0或不合理，则百分比可能不准确或为0
  const denominatorCalories = baseNutritionForPercentage.calories > 0 ? baseNutritionForPercentage.calories : totalCalculatedCalories

  const proteinPercentage =
    denominatorCalories > 0
      ? (proteinCalories / denominatorCalories) * 100
      : 0
  const fatPercentage =
    denominatorCalories > 0 ? (fatCalories / denominatorCalories) * 100 : 0
  const carbsPercentage =
    denominatorCalories > 0
      ? (carbsCalories / denominatorCalories) * 100
      : 0

  // 始终基于传入的 nutritionInfo (每份) 和 servings 计算总营养成分
  const calculatedTotalNutrition = servings > 1 ? {
    calories: nutritionInfo.calories * servings,
    protein: nutritionInfo.protein * servings,
    fat: nutritionInfo.fat * servings,
    carbs: nutritionInfo.carbs * servings,
    fiber: nutritionInfo.fiber * servings,
    sugar: nutritionInfo.sugar * servings,
    sodium: nutritionInfo.sodium * servings,
  } : { ...nutritionInfo }

  // 当前显示的营养信息
  const displayedNutrition =
    view === "total" && servings > 1
      ? calculatedTotalNutrition
      : nutritionInfo

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">营养信息</CardTitle>
        {showPerServing && servings > 1 && (
          <Tabs value={view} onValueChange={(v) => setView(v as "per-serving" | "total")}>
            <TabsList>
              <TabsTrigger value="per-serving">每份</TabsTrigger>
              <TabsTrigger value="total">总计</TabsTrigger>
            </TabsList>
            <TabsContent value="per-serving">
              <div className="text-sm text-muted-foreground">每份营养成分（共{servings}份）</div>
            </TabsContent>
            <TabsContent value="total">
              <div className="text-sm text-muted-foreground">总营养成分（{servings}份）</div>
            </TabsContent>
          </Tabs>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 热量 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">热量</span>
              <span className="text-lg font-bold">{(displayedNutrition.calories ?? 0).toFixed(1)} kcal</span>
            </div>
          </div>

          {/* 宏量素分布 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">宏量素分布</span>
            </div>
            <div className="flex gap-1 h-2">
              <div
                className="bg-blue-500 rounded-l-full"
                style={{ width: `${proteinPercentage}%` }}
                title={`蛋白质: ${proteinPercentage.toFixed(1)}%`}
              ></div>
              <div
                className="bg-yellow-500"
                style={{ width: `${fatPercentage}%` }}
                title={`脂肪: ${fatPercentage.toFixed(1)}%`}
              ></div>
              <div
                className="bg-green-500 rounded-r-full"
                style={{ width: `${carbsPercentage}%` }}
                title={`碳水: ${carbsPercentage.toFixed(1)}%`}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>蛋白质 {proteinPercentage.toFixed(0)}%</span>
              <span>脂肪 {fatPercentage.toFixed(0)}%</span>
              <span>碳水 {carbsPercentage.toFixed(0)}%</span>
            </div>
          </div>

          {/* 详细营养素 */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>蛋白质</span>
                  <span className="font-medium">{(displayedNutrition.protein ?? 0).toFixed(1)}g</span>
                </div>
                <Progress value={Math.min(((displayedNutrition.protein ?? 0) / 50) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>脂肪</span>
                  <span className="font-medium">{(displayedNutrition.fat ?? 0).toFixed(1)}g</span>
                </div>
                <Progress value={Math.min(((displayedNutrition.fat ?? 0) / 65) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>碳水化合物</span>
                  <span className="font-medium">{(displayedNutrition.carbs ?? 0).toFixed(1)}g</span>
                </div>
                <Progress value={Math.min(((displayedNutrition.carbs ?? 0) / 300) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>膳食纤维</span>
                  <span className="font-medium">{(displayedNutrition.fiber ?? 0).toFixed(1)}g</span>
                </div>
                <Progress value={Math.min(((displayedNutrition.fiber ?? 0) / 25) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>糖</span>
                  <span className="font-medium">{(displayedNutrition.sugar ?? 0).toFixed(1)}g</span>
                </div>
                <Progress value={Math.min(((displayedNutrition.sugar ?? 0) / 50) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>钠</span>
                  <span className="font-medium">{(displayedNutrition.sodium ?? 0).toFixed(1)}mg</span>
                </div>
                <Progress value={Math.min(((displayedNutrition.sodium ?? 0) / 2300) * 100, 100)} className="h-1.5" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
