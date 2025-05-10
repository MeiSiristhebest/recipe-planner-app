"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
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

  useEffect(() => {
    const from = searchParams.get("from")
    if (from === "middleware" && callbackUrl.includes("meal-plans")) {
      setInfoMessage("请登录以访问您的周计划和更多个性化功能。")
    } else if (from === "middleware") {
      setInfoMessage("请登录以继续访问受保护的内容。")
    }
  }, [searchParams, callbackUrl])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      })

      if (result?.error) {
        setError("登录失败: " + (result.error === "CredentialsSignin" ? "无效的邮箱或密码。" : result.error))
        setIsLoading(false)
      } else if (result?.ok) {
        router.push(callbackUrl)
      } else {
        setError("发生未知错误，请重试。")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Login submission error", err)
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
            <Button type="submit" className="w-full" disabled={isLoading}>
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
