import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  
  // 从Cookie或请求头中获取next-auth的token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 定义受保护的路径
  const protectedPaths = [
    "/profile",
    "/meal-plans",
    "/recipes/create",
    "/shopping-list",
    "/ai-recipe-generator",
  ];

  // 检查当前路径是否为受保护的路径（精确匹配或者是子路径）
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // 如果是登录页面且用户已登录，则重定向到首页或回调URL
  if (pathname === '/login' && token) {
    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
    if (callbackUrl && callbackUrl.startsWith('/')) {
      return NextResponse.redirect(new URL(callbackUrl, req.url));
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 如果是受保护的路径且用户未登录
  if (isProtectedPath && !token) {
    // 记录原始请求 URL，包括路径和查询参数
    const originalUrl = pathname + (search || '');
    
    // 用户未认证，重定向到登录页面
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", originalUrl);
    
    return NextResponse.redirect(loginUrl);
  }

  // 如果路径不受保护或用户已认证，继续
  return NextResponse.next();
}

export const config = {
  matcher: [
    // 应用中间件的路径
    "/login",
    "/profile/:path*",
    "/meal-plans/:path*",
    "/recipes/create/:path*",
    "/shopping-list/:path*",
    "/ai-recipe-generator/:path*",
  ],
};

// This is a more manual way if you need more control over the redirect URL
// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   const session = // logic to get session, e.g. from getToken({ req })

//   const protectedPaths = ["/profile", "/meal-plans", "/recipes/create"];

//   if (protectedPaths.some(path => pathname.startsWith(path))) {
//     if (!session) {
//       const url = new URL("/login", req.url);
//       url.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
//       url.searchParams.set("from", "middleware"); // Add the from parameter
//       return NextResponse.redirect(url);
//     }
//   }
//   return NextResponse.next();
// } 