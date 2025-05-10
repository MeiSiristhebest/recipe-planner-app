// 导入您提供的签名文件中的内容
import { createSignature } from "@/lib/signatures"

export interface SupabaseStorageOptions {
  bucket?: string
  expiresIn?: number
}

export async function createSupabaseStorageSignedUrl(
  path: string,
  options: SupabaseStorageOptions = {},
): Promise<string> {
  const { bucket = "recipe-images", expiresIn = 60 } = options

  // 使用您提供的签名文件中的函数创建签名
  const signature = await createSignature({
    path,
    expiresIn,
    bucket,
  })

  // 构建签名URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables.");
  }
  const endpoint = `${supabaseUrl}/storage/v1/s3`;
  const url = new URL(`${endpoint}/object/sign/${bucket}/${path}`);

  url.searchParams.append("token", signature);

  return url.toString()
}
