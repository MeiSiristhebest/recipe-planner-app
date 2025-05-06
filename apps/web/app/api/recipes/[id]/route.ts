import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { recipeSchema } from "@recipe-planner/validators"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipeId = params.id
    const session = await auth()

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
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
      return NextResponse.json({ error: "食谱不存在" }, { status: 404 })
    }

    // Get average rating
    const ratings = await prisma.rating.aggregate({
      where: { recipeId },
      _avg: {
        value: true,
      },
    })

    // Check if user has favorited this recipe
    let isFavorited = false
    if (session?.user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_recipeId: {
            userId: session.user.id,
            recipeId,
          },
        },
      })
      isFavorited = !!favorite
    }

    // Get user's rating if logged in
    let userRating = null
    if (session?.user) {
      const rating = await prisma.rating.findUnique({
        where: {
          userId_recipeId: {
            userId: session.user.id,
            recipeId,
          },
        },
      })
      userRating = rating?.value || null
    }

    return NextResponse.json({
      ...recipe,
      categories: recipe.categories.map((c) => c.category),
      tags: recipe.tags.map((t) => t.tag),
      averageRating: ratings._avg.value || 0,
      isFavorited,
      userRating,
    })
  } catch (error) {
    console.error("Error fetching recipe:", error)
    return NextResponse.json({ error: "获取食谱详情失败" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipeId = params.id
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // Check if user is the author
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { authorId: true },
    })

    if (!recipe) {
      return NextResponse.json({ error: "食谱不存在" }, { status: 404 })
    }

    if (recipe.authorId !== session.user.id) {
      return NextResponse.json({ error: "无权修改此食谱" }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = recipeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "验证失败", details: validationResult.error.flatten() }, { status: 400 })
    }

    const data = validationResult.data

    // Update recipe
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        title: data.title,
        description: data.description,
        cookingTime: data.cookingTime,
        servings: data.servings,
        difficulty: data.difficulty,
        ingredients: data.ingredients,
        instructions: data.instructions,
        nutritionInfo: data.nutritionInfo,
        // Update categories (delete existing and create new)
        categories: {
          deleteMany: {},
          create: data.categoryIds.map((categoryId) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
        // Update tags (delete existing and create new)
        tags: {
          deleteMany: {},
          create: data.tagIds.map((tagId) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating recipe:", error)
    return NextResponse.json({ error: "更新食谱失败" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipeId = params.id
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // Check if user is the author
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { authorId: true },
    })

    if (!recipe) {
      return NextResponse.json({ error: "食谱不存在" }, { status: 404 })
    }

    if (recipe.authorId !== session.user.id) {
      return NextResponse.json({ error: "无权删除此食谱" }, { status: 403 })
    }

    // Delete recipe
    await prisma.recipe.delete({
      where: { id: recipeId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting recipe:", error)
    return NextResponse.json({ error: "删除食谱失败" }, { status: 500 })
  }
}
