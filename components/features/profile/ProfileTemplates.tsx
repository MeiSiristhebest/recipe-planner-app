import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Copy, Trash2 } from "lucide-react"
import Link from "next/link"

// Mock data for user's meal plan templates
const mealPlanTemplates = [
  {
    id: 1,
    name: "健康减脂周计划",
    description: "低卡路里、高蛋白的一周餐单",
    createdAt: "2023-05-15",
    recipeCount: 12,
  },
  {
    id: 2,
    name: "家庭聚餐计划",
    description: "适合全家人的美味餐单",
    createdAt: "2023-06-20",
    recipeCount: 8,
  },
]

export default function ProfileTemplates() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">餐计划模板</h2>
        <Button asChild>
          <Link href="/meal-plans">创建新模板</Link>
        </Button>
      </div>

      {mealPlanTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealPlanTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{template.description}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>创建于 {template.createdAt}</span>
                </div>
                <div className="text-sm mt-1">包含 {template.recipeCount} 个食谱</div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  删除
                </Button>
                <Button size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  应用模板
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">您还没有保存任何餐计划模板</p>
          <Button asChild>
            <Link href="/meal-plans">创建第一个模板</Link>
          </Button>
        </Card>
      )}
    </div>
  )
}
