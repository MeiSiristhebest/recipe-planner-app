import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@supabase/supabase-js"

// 初始化Supabase客户端
const supabaseUrl = "https://desoaoudgnhrhdpsqcbu.supabase.co"
const supabaseKey = "1e543fe4e8ffdd81c53a42edca7a15cd048839b5a228c97a05b63ef0fe736ab2"
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 })
    }

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "只支持图片文件" }, { status: 400 })
    }

    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过5MB" }, { status: 400 })
    }

    // 生成唯一文件名
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `uploads/${session.user.id}/${fileName}`

    // 将文件转换为buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 上传到Supabase Storage
    const { data, error } = await supabase.storage.from("recipe-images").upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("Supabase Storage error:", error)
      return NextResponse.json({ error: "上传文件失败" }, { status: 500 })
    }

    // 获取公共URL
    const { data: publicUrlData } = supabase.storage.from("recipe-images").getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "上传文件失败" }, { status: 500 })
  }
}
