import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { recipeSchema } from "@repo/validators"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const cookingTimeMax = searchParams.get("cookingTimeMax")
      ? Number.parseInt(searchParams.get("cookingTimeMax") as string)
      : undefined
    const tag = searchParams.get("tag")
    const sort = searchParams.get("sort") || "newest"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {
      published: true,
      OR: query
        ? [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ]
        : undefined,
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            name: category,
          },
        },
      }
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (cookingTimeMax) {
      where.cookingTime = {
        lte: cookingTimeMax,
      }
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      }
    }

    // Build sort options
    let orderBy: any = {}
    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "popular":
        orderBy = { favorites: { _count: "desc" } }
        break
      default:
        orderBy = { createdAt: "desc" }
    }

    // Get recipes
    const recipesWithRawData = await prisma.recipe.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        ratings: {
          select: {
            value: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            comments: true,
          },
        },
      },
    })

    // Transform data for frontend and calculate averageRating
    let processedRecipes = recipesWithRawData.map(recipe => {
      const totalRatingValue = recipe.ratings.reduce((sum, r) => sum + r.value, 0)
      const averageRating = recipe.ratings.length > 0 ? totalRatingValue / recipe.ratings.length : null
      
      return {
          ...recipe,
        averageRating: averageRating,
      categories: recipe.categories.map(c => c.category),
      tags: recipe.tags.map(t => t.tag),
      }
    })

    // Handle sorting by rating at the application level for the current page
    if (sort === "rating") {
      processedRecipes.sort((a, b) => {
        const ratingA = a.averageRating === null ? -1 : a.averageRating
        const ratingB = b.averageRating === null ? -1 : b.averageRating
        return ratingB - ratingA
      })
    }

    // Get total count for pagination
    const totalRecipes = await prisma.recipe.count({ where })

    return NextResponse.json({
      recipes: processedRecipes,
      pagination: {
        total: totalRecipes,
        page,
        limit,
        pages: Math.ceil(totalRecipes / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching recipes:", error)
    return NextResponse.json({ error: "获取食谱失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = recipeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "验证失败", details: validationResult.error.flatten() }, { status: 400 })
    }

    const data = validationResult.data

    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description,
        cookingTime: data.cookingTime,
        servings: data.servings,
        difficulty: data.difficulty,
        ingredients: data.ingredients,
        instructions: data.instructions,
        nutritionInfo: data.nutritionInfo,
        published: true,
        author: {
          connect: { id: session.user.id },
        },
        categories: {
          create: data.categoryIds.map((categoryId) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
        tags: {
          create: data.tagIds.map((tagId) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
    })

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error("Error creating recipe:", error)
    return NextResponse.json({ error: "创建食谱失败" }, { status: 500 })
  }
}
