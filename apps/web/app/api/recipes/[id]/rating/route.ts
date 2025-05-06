import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const ratingSchema = z.object({
  value: z.number().int().min(1).max(5),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipeId = params.id
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    })

    if (!recipe) {
      return NextResponse.json({ error: "食谱不存在" }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = ratingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "验证失败", details: validationResult.error.flatten() }, { status: 400 })
    }

    const { value } = validationResult.data

    // Upsert rating (create or update)
    const rating = await prisma.rating.upsert({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId,
        },
      },
      update: {
        value,
      },
      create: {
        value,
        user: {
          connect: { id: session.user.id },
        },
        recipe: {
          connect: { id: recipeId },
        },
      },
    })

    // Get new average rating
    const ratings = await prisma.rating.aggregate({
      where: { recipeId },
      _avg: {
        value: true,
      },
      _count: true,
    })

    return NextResponse.json({
      rating,
      averageRating: ratings._avg.value || 0,
      totalRatings: ratings._count,
    })
  } catch (error) {
    console.error("Error rating recipe:", error)
    return NextResponse.json({ error: "评分失败" }, { status: 500 })
  }
}
