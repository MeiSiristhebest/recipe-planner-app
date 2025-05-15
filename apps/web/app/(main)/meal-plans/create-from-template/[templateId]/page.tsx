"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/shared/auth-guard"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card"
import { Alert, AlertDescription } from "@repo/ui/alert"
import { AlertCircle, Loader2, Save, ArrowLeft, Calendar } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { format, addDays, startOfWeek, endOfWeek } from "date-fns"
import { zhCN } from "date-fns/locale"
import { DatePicker } from "@/components/ui/date-picker"
import { useMealPlanStore } from "@/store/meal-plan-store"

// 定义膳食计划模板类型
type MealPlanTemplate = {
  id: string
  name: string
  items: Array<{
    id: string
    day: string
    mealTime: string
    recipeId: string
    servings: number
    recipe: {
      id: string
      title: string
      coverImage?: string
      cookingTime?: number
      difficulty?: string
    }
  }>
}

// 定义星期几
const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

// 定义餐次
const MEAL_TIMES = ["早餐", "午餐", "晚餐"]

export default function CreateFromTemplatePage() {
  return (
    <AuthGuard>
      <CreateFromTemplateContent />
    </AuthGuard>
  )
}

function CreateFromTemplateContent() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.templateId as string
  const { data: session } = useSession()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<MealPlanTemplate | null>(null)
  const [planName, setPlanName] = useState("")
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))

  // 获取模板数据
  useEffect(() => {
    async function fetchTemplate() {
      try {
        setIsFetching(true)
        const response = await fetch(`/api/meal-plans/templates/${templateId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("模板不存在")
            return
          }
          throw new Error("获取模板失败")
        }

        const data = await response.json()
        setTemplate(data)
        setPlanName(`${data.name} - ${format(new Date(), "yyyy-MM-dd", { locale: zhCN })}`)

        // 将模板数据加载到 store 中
        const storeItems = data.items.map((item: any) => ({
          id: item.id,
          day: item.day || getDayFromDate(new Date(item.date)),
          mealTime: item.mealTime,
          recipeId: item.recipeId,
          servings: item.servings,
          recipe: item.recipe,
        }))

        // 清空当前 store 并加载模板数据
        useMealPlanStore.getState().clearItems()
        storeItems.forEach((item: any) => {
          useMealPlanStore.getState().addItem(item.day, item.mealTime, item.recipe, item.servings)
        })
      } catch (error) {
        console.error("Error fetching template:", error)
        setError("获取模板失败，请稍后再试")
      } finally {
        setIsFetching(false)
      }
    }

    if (templateId) {
      fetchTemplate()
    }
  }, [templateId])

  // 从日期获取星期几
  function getDayFromDate(date: Date): string {
    const dayIndex = date.getDay()
    return DAYS[dayIndex === 0 ? 6 : dayIndex - 1] // 将星期日(0)转换为星期日(6)
  }

  // 将星期几转换为日期
  function getDateFromDay(day: string, startDate: Date): Date {
    const dayIndex = DAYS.indexOf(day)
    if (dayIndex === -1) return startDate
    return addDays(startDate, dayIndex)
  }

  // 处理创建膳食计划
  const handleCreateMealPlan = async () => {
    if (!planName.trim()) {
      toast.error("请输入膳食计划名称")
      return
    }

    try {
      setIsLoading(true)

      const currentItems = useMealPlanStore.getState().items

      if (currentItems.length === 0) {
        toast.error("膳食计划中至少需要一个食谱")
        setIsLoading(false)
        return
      }

      // 准备提交数据
      const mealPlanData = {
        name: planName,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endOfWeek(startDate, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        isTemplate: false,
        items: currentItems.map((item) => ({
          date: format(getDateFromDay(item.day, startDate), "yyyy-MM-dd"),
          mealTime: item.mealTime,
          recipeId: item.recipe.id,
          servings: item.servings,
        })),
      }

      // 发送创建请求
      const response = await fetch("/api/meal-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealPlanData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "创建膳食计划失败")
      }

      toast.success("膳食计划创建成功")
      router.push("/meal-plans")
    } catch (error) {
      console.error("Error creating meal plan:", error)
      setError(error instanceof Error ? error.message : "创建膳食计划失败，请稍后再试")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">从模板创建膳食计划</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">加载中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">从模板创建膳食计划</h1>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/meal-plans")}>返回膳食计划</Button>
      </div>
    )
  }

  // 从 store 获取当前的膳食计划项目
  const mealPlanItems = useMealPlanStore((state) => state.items)

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">从模板创建膳食计划</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push("/meal-plans")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <Button onClick={handleCreateMealPlan} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                创建中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                创建膳食计划
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>膳食计划信息</CardTitle>
          <CardDescription>设置膳食计划的基本信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planName">计划名称</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="例如：本周健康饮食计划"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">开始日期（周一）</Label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <DatePicker
                  date={startDate}
                  onSelect={setStartDate}
                  locale={zhCN}
                  weekStartsOn={1}
                />
                <div className="text-sm text-muted-foreground">
                  {startDate && `${format(startDate, "yyyy年MM月dd日", { locale: zhCN })} - ${format(endOfWeek(startDate, { weekStartsOn: 1 }), "yyyy年MM月dd日", { locale: zhCN })}`}
                </div>
              </div>
            </div>
            {template && (
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">使用模板：{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  此膳食计划将基于"{template.name}"模板创建，包含{template.items.length}个食谱项目。
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <div className="min-w-[600px] bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-muted">
            <h2 className="font-medium">膳食计划预览</h2>
          </div>

          {/* 表头 */}
          <div className="grid grid-cols-4 bg-muted/50">
            <div className="p-3 font-medium border-r"></div>
            {MEAL_TIMES.map((mealTime) => (
              <div key={mealTime} className="p-3 font-medium text-center border-r last:border-r-0">
                {mealTime}
              </div>
            ))}
          </div>

          {/* 表格内容 */}
          <div className="divide-y">
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-4">
                <div className="p-3 font-medium border-r flex items-center justify-between">
                  <span>{day}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(getDateFromDay(day, startDate), "MM/dd")}
                  </span>
                </div>
                {MEAL_TIMES.map((mealTime) => {
                  const recipes = mealPlanItems.filter(
                    (item) => item.day === day && item.mealTime === mealTime
                  )

                  return (
                    <div key={`${day}-${mealTime}`} className="p-3 border-r last:border-r-0">
                      {recipes.length > 0 ? (
                        <div className="space-y-2">
                          {recipes.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                {item.recipe.coverImage ? (
                                  <img
                                    src={item.recipe.coverImage}
                                    alt={item.recipe.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.recipe.title}</p>
                                <p className="text-xs text-muted-foreground">{item.servings}份</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-sm text-muted-foreground">无食谱</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 block sm:hidden">
          ← 左右滑动查看更多 →
        </p>
      </div>
    </div>
  )
}
