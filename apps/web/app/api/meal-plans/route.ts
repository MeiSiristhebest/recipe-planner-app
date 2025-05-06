import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { mealPlanSchema } from "@recipe-planner/validators"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get("weekStart")
    const isTemplate = searchParams.get("isTemplate") === "true"

    // Get meal plans for the user
    const query: any = {
      userId: session.user.id,
    }

    if (weekStart) {
      // If weekStart is provided, get the specific week's plan
      const startDate = new Date(weekStart)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)

      query.startDate = startDate
      query.endDate = endDate
    }

    if (isTemplate !== undefined) {
      query.isTemplate = isTemplate
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: query,
      include: {
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
      },
      orderBy: isTemplate ? { name: "asc" } : { startDate: "desc" },
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
