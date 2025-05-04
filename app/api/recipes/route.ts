import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// 获取食谱列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const cookingTime = searchParams.get("cookingTime")
    const tags = searchParams.get("tags")?.split(",")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "latest"

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}

    if (category) {
      where.category = {
        name: category,
      }
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (cookingTime) {
      const [min, max] = cookingTime.split("-").map(Number)
      where.cookingTime = {}
      if (min) where.cookingTime.gte = min
      if (max) where.cookingTime.lte = max
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          name: {
            in: tags,
          },
        },
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // 构建排序条件
    let orderBy: any = {}
    switch (sort) {
      case "latest":
        orderBy = { createdAt: "desc" }
        break
      case "popular":
        orderBy = { favorites: { _count: "desc" } }
        break
      case "rating":
        orderBy = { ratings: { _avg: { value: "desc" } } }
        break
      default:
        orderBy = { createdAt: "desc" }
    }

    // 查询食谱
    const recipes = await prisma.recipe.findMany({
      where,
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
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    })

    // 计算总数
    const total = await prisma.recipe.count({ where })

    // 计算平均评分
    const recipesWithRating = recipes.map((recipe) => {
      const ratings = recipe.ratings || []
      const ratingSum = ratings.reduce((sum, rating) => sum + rating.value, 0)
      const ratingAvg = ratings.length > 0 ? ratingSum / ratings.length : 0

      return {
        ...recipe,
        rating: Number.parseFloat(ratingAvg.toFixed(1)),
        favoriteCount: recipe._count.favorites,
        ratings: undefined,
        _count: undefined,
      }
    })

    return NextResponse.json({
      recipes: recipesWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("获取食谱错误:", error)
    return NextResponse.json({ message: "获取食谱失败" }, { status: 500 })
  }
}

// 创建新食谱
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    const body = await request.json()

    // 验证输入数据
    const recipeSchema = z.object({
      title: z.string().min(3),
      description: z.string().optional(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          quantity: z.string(),
          unit: z.string(),
          note: z.string().optional(),
        }),
      ),
      instructions: z.array(
        z.object({
          step: z.number(),
          description: z.string(),
          image: z.string().optional(),
        }),
      ),
      cookingTime: z.number().min(1),
      difficulty: z.string(),
      servings: z.number().min(1),
      image: z.string().optional(),
      categoryId: z.string(),
      tagIds: z.array(z.string()).optional(),
    })

    const result = recipeSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "输入数据无效", errors: result.error.format() }, { status: 400 })
    }

    const { tagIds, ...recipeData } = result.data

    // 创建食谱
    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        authorId: session.user.id,
        tags: tagIds
          ? {
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

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    console.error("创建食谱错误:", error)
    return NextResponse.json({ message: "创建食谱失败" }, { status: 500 })
  }
}
