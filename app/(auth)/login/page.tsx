import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import LoginForm from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription>登录您的账户以访问所有功能</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            还没有账户?{" "}
            <Link href="/register" className="text-primary hover:underline">
              注册
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
