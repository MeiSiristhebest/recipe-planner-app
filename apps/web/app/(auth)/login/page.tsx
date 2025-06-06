"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/profile"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()

  // 检测登录成功后立即重定向到原始请求的URL
  useEffect(() => {
    if (status === "authenticated" && callbackUrl) {
      console.log("认证成功，重定向到:", callbackUrl)
      // 使用replace而不是push，确保不能通过浏览器返回按钮回到登录页
      router.replace(callbackUrl)
    }
  }, [status, router, callbackUrl])

  // 处理来自中间件的重定向并显示适当的消息
  useEffect(() => {
    if (callbackUrl && callbackUrl !== "/profile") {
      const path = callbackUrl.split("?")[0]
      if (path.includes("meal-plans")) {
      setInfoMessage("请登录以访问您的周计划和更多个性化功能。")
      } else if (path.includes("recipes/create")) {
        setInfoMessage("请登录以创建您自己的食谱。")
      } else if (path.includes("shopping-list")) {
        setInfoMessage("请登录以访问您的购物清单。")
      } else {
      setInfoMessage("请登录以继续访问受保护的内容。")
      }
    }
  }, [callbackUrl])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
        callbackUrl: callbackUrl, // 确保传递回调URL
      })

      if (result?.error) {
        setError("登录失败: " + (result.error === "CredentialsSignin" ? "无效的邮箱或密码。" : result.error))
        setIsLoading(false)
      } else if (!result?.ok) {
        setError("登录未能成功，请检查您的凭据或网络连接。")
        setIsLoading(false)
      } else {
        // 登录成功 - 不手动重定向，让 useEffect 监听状态变化处理重定向
        console.log("登录成功，等待会话更新自动重定向")

        // 添加一个短暂延迟，确保会话状态已更新
        setTimeout(() => {
          // 如果会话状态仍未更新，手动重定向
          if (status !== "authenticated") {
            console.log("会话状态未自动更新，手动重定向到:", callbackUrl)
            router.replace(callbackUrl)
          }
        }, 1000)
      }
    } catch (err) {
      console.error("登录提交错误", err)
      setError("登录过程中发生错误。")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">登录您的账户</CardTitle>
          <CardDescription>
            访问您的食谱、周计划和更多精彩内容。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {infoMessage && (
            <div className="mb-4 p-3 rounded-md flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 text-blue-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>{infoMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入您的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || status === "loading"}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <div>
            还没有账户？{" "}
            <Link href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="font-medium text-primary hover:underline">
              立即注册
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
