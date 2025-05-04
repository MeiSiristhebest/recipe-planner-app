import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // 定义需要认证的路径
  const authRoutes = ["/meal-plans", "/shopping-list", "/profile"]
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // 定义认证页面路径
  const authPages = ["/login", "/register"]
  const isAuthPage = authPages.some((page) => request.nextUrl.pathname.startsWith(page))

  // 如果是需要认证的路径但用户未登录，重定向到登录页面
  if (isAuthRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 如果是认证页面但用户已登录，重定向到首页
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// 配置匹配的路径
export const config = {
  matcher: ["/meal-plans/:path*", "/shopping-list/:path*", "/profile/:path*", "/login/:path*", "/register/:path*"],
}
