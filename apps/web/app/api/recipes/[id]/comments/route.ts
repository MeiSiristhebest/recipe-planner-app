import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1, "评论内容不能为空").max(500, "评论内容不能超过500个字符"),
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
    const validationResult = commentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "验证失败", details: validationResult.error.flatten() }, { status: 400 })
    }

    const { content } = validationResult.data

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        user: {
          connect: { id: session.user.id },
        },
        recipe: {
          connect: { id: recipeId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "发表评论失败" }, { status: 500 })
  }
}
