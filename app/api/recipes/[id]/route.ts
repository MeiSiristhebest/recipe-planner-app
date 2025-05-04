import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// 获取单个食谱详情
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        tags: true,
        ratings: {
          select: {
            value: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            favorites: true,
            ratings: true,
          },
        },
      },
    })

    if (!recipe) {
      return NextResponse.json({ message: "食谱不存在" }, { status: 404 })
    }

    // 计算平均评分
    const ratings = recipe.ratings || []
    const ratingSum = ratings.reduce((sum, rating) => sum + rating.value, 0)
    const ratingAvg = ratings.length > 0 ? ratingSum / ratings.length : 0

    const recipeWithRating = {
      ...recipe,
      rating: Number.parseFloat(ratingAvg.toFixed(1)),
      ratingCount: recipe._count.ratings,
      favoriteCount: recipe._count.favorites,
      ratings: undefined,
      _count: undefined,
    }

    return NextResponse.json(recipeWithRating)
  } catch (error) {
    console.error("获取食谱详情错误:", error)
    return NextResponse.json({ message: "获取食谱详情失败" }, { status: 500 })
  }
}

// 更新食谱
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()

    // 验证输入数据
    const recipeSchema = z.object({
      title: z.string().min(3).optional(),
      description: z.string().optional(),
      ingredients: z
        .array(
          z.object({
            name: z.string(),
            quantity: z.string(),
            unit: z.string(),
            note: z.string().optional(),
          }),
        )
        .optional(),
      instructions: z
        .array(
          z.object({
            step: z.number(),
            description: z.string(),
            image: z.string().optional(),
          }),
        )
        .optional(),
      cookingTime: z.number().min(1).optional(),
      difficulty: z.string().optional(),
      servings: z.number().min(1).optional(),
      image: z.string().optional(),
      categoryId: z.string().optional(),
      tagIds: z.array(z.string()).optional(),
    })

    const result = recipeSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "输入数据无效", errors: result.error.format() }, { status: 400 })
    }

    // 检查食谱是否存在
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!existingRecipe) {
      return NextResponse.json({ message: "食谱不存在" }, { status: 404 })
    }

    // 检查是否是作者
    if (existingRecipe.authorId !== session.user.id) {
      return NextResponse.json({ message: "无权修改此食谱" }, { status: 403 })
    }

    const { tagIds, ...recipeData } = result.data

    // 更新食谱
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        tags: tagIds
          ? {
              set: [], // 先清空现有标签
              connect: tagIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        tags: true,
      },
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error("更新食谱错误:", error)
    return NextResponse.json({ message: "更新食谱失败" }, { status: 500 })
  }
}

// 删除食谱
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    const id = params.id

    // 检查食谱是否存在
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!existingRecipe) {
      return NextResponse.json({ message: "食谱不存在" }, { status: 404 })
    }

    // 检查是否是作者
    if (existingRecipe.authorId !== session.user.id) {
      return NextResponse.json({ message: "无权删除此食谱" }, { status: 403 })
    }

    // 删除食谱
    await prisma.recipe.delete({
      where: { id },
    })

    return NextResponse.json({ message: "食谱已删除" })
  } catch (error) {
    console.error("删除食谱错误:", error)
    return NextResponse.json({ message: "删除食谱失败" }, { status: 500 })
  }
}
