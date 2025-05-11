import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { mealPlanSchema } from "@repo/validators"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get("weekStart")
    const isTemplateQuery = searchParams.get("isTemplate")
    const view = searchParams.get("view")

    const query: any = {
      userId: session.user.id,
    }

    if (weekStart) {
      const startDate = new Date(weekStart)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      query.startDate = startDate
      query.endDate = endDate
    }

    if (isTemplateQuery !== null) {
      query.isTemplate = isTemplateQuery === "true"
    }

    let selectFields = undefined;
    let includeItems = true;

    if (view === "simple") {
      selectFields = {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isTemplate: true,
      };
      includeItems = false;
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: query,
      select: selectFields,
      include: includeItems ? {
        items: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                cookingTime: true,
                difficulty: true,
                coverImage: true,
              },
            },
          },
        },
      } : undefined,
      orderBy: query.isTemplate ? { name: "asc" } : { startDate: "desc" },
    })

    return NextResponse.json(mealPlans)
  } catch (error) {
    console.error("Error fetching meal plans:", error)
    return NextResponse.json({ error: "获取餐计划失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = mealPlanSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "验证失败", details: validationResult.error.flatten() }, { status: 400 })
    }

    const data = validationResult.data

    // Create meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isTemplate: data.isTemplate,
        user: {
          connect: { id: session.user.id },
        },
        items: {
          create: data.items.map((item) => ({
            date: item.date,
            mealTime: item.mealTime,
            servings: item.servings,
            recipe: {
              connect: { id: item.recipeId },
            },
          })),
        },
      },
    })

    return NextResponse.json(mealPlan)
  } catch (error) {
    console.error("Error creating meal plan:", error)
    return NextResponse.json({ error: "创建餐计划失败" }, { status: 500 })
  }
}
