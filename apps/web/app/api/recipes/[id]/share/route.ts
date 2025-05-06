import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

// 初始化Supabase客户端
const supabaseUrl = process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    const recipeId = params.id

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 获取食谱详情
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
      },
    })

    if (!recipe) {
      return NextResponse.json({ error: "食谱不存在" }, { status: 404 })
    }

    // 生成唯一的分享链接
    const shareId = Math.random().toString(36).substring(2, 15)

    // 将分享信息存储到Supabase
    const { data, error } = await supabase.from("recipe_shares").insert([
      {
        share_id: shareId,
        recipe_id: recipeId,
        user_id: session.user.id,
        recipe_data: {
          ...recipe,
          categories: recipe.categories.map((c) => c.category),
          tags: recipe.tags.map((t) => t.tag),
        },
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "创建分享链接失败" }, { status: 500 })
    }

    // 生成分享链接
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://recipe-planner-app.vercel.app"}/shared/${shareId}`

    return NextResponse.json({
      shareId,
      shareUrl,
      success: true,
    })
  } catch (error) {
    console.error("Error sharing recipe:", error)
    return NextResponse.json({ error: "分享食谱失败" }, { status: 500 })
  }
}
