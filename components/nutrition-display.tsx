"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

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
  nutritionInfo: NutritionInfo
  servings?: number
  showPerServing?: boolean
  className?: string
}

export function NutritionDisplay({
  nutritionInfo,
  servings = 1,
  showPerServing = true,
  className = "",
}: NutritionDisplayProps) {
  const [view, setView] = useState<"per-serving" | "total">("per-serving")

  // 计算宏量素百分比
  const totalMacros = nutritionInfo.protein + nutritionInfo.fat + nutritionInfo.carbs
  const proteinPercentage = totalMacros > 0 ? (nutritionInfo.protein / totalMacros) * 100 : 0
  const fatPercentage = totalMacros > 0 ? (nutritionInfo.fat / totalMacros) * 100 : 0
  const carbsPercentage = totalMacros > 0 ? (nutritionInfo.carbs / totalMacros) * 100 : 0

  // 计算总营养成分（如果当前显示的是每份）
  const totalNutrition =
    view === "per-serving" && servings > 1
      ? {
          calories: nutritionInfo.calories * servings,
          protein: nutritionInfo.protein * servings,
          fat: nutritionInfo.fat * servings,
          carbs: nutritionInfo.carbs * servings,
          fiber: nutritionInfo.fiber * servings,
          sugar: nutritionInfo.sugar * servings,
          sodium: nutritionInfo.sodium * servings,
        }
      : nutritionInfo

  // 当前显示的营养信息
  const displayedNutrition = view === "total" && servings > 1 ? totalNutrition : nutritionInfo

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
              <span className="text-lg font-bold">{displayedNutrition.calories.toFixed(1)} kcal</span>
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
                  <span className="font-medium">{displayedNutrition.protein.toFixed(1)}g</span>
                </div>
                <Progress value={Math.min((displayedNutrition.protein / 50) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>脂肪</span>
                  <span className="font-medium">{displayedNutrition.fat.toFixed(1)}g</span>
                </div>
                <Progress value={Math.min((displayedNutrition.fat / 65) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>碳水化合物</span>
                  <span className="font-medium">{displayedNutrition.carbs.toFixed(1)}g</span>
                </div>
                <Progress value={Math.min((displayedNutrition.carbs / 300) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>膳食纤维</span>
                  <span className="font-medium">{displayedNutrition.fiber.toFixed(1)}g</span>
                </div>
                <Progress value={Math.min((displayedNutrition.fiber / 25) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>糖</span>
                  <span className="font-medium">{displayedNutrition.sugar.toFixed(1)}g</span>
                </div>
                <Progress value={Math.min((displayedNutrition.sugar / 50) * 100, 100)} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>钠</span>
                  <span className="font-medium">{displayedNutrition.sodium.toFixed(1)}mg</span>
                </div>
                <Progress value={Math.min((displayedNutrition.sodium / 2300) * 100, 100)} className="h-1.5" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
