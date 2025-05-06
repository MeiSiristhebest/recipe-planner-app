"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card"
import { NutritionCalculator } from "@/components/features/nutrition/nutrition-calculator"
import { useForm } from "react-hook-form"
import { Button } from "@repo/ui/button"

export default function NutritionDemoPage() {
  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">营养计算演示</CardTitle>
          <CardDescription>添加食材并计算食谱的营养成分。这个演示页面展示了如何使用营养计算功能。</CardDescription>
        </CardHeader>
        <CardContent>
          <NutritionCalculator />
        </CardContent>
      </Card>
    </div>
  )
}
