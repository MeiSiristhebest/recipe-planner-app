import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "认证 | 食谱规划助手",
  description: "登录或注册食谱规划助手",
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // If user is already logged in, redirect to home page
  if (session?.user) {
    redirect("/")
  }

  return <div className="min-h-screen">{children}</div>
}
