import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId,
        },
      },
    })

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: {
          userId_recipeId: {
            userId: session.user.id,
            recipeId,
          },
        },
      })

      return NextResponse.json({ favorited: false })
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          user: {
            connect: { id: session.user.id },
          },
          recipe: {
            connect: { id: recipeId },
          },
        },
      })

      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json({ error: "操作收藏失败" }, { status: 500 })
  }
}
