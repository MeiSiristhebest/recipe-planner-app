import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Define protected paths
  const protectedPaths = [
    "/profile",
    "/meal-plans",
    "/recipes/create",
    "/shopping-list",
    "/ai-recipe-generator",
    // Add other paths that require authentication, ensure they start with '/'
    // Example: "/settings"
  ];

  // Check if the current path is one of the protected paths
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // User is not authenticated, redirect to login page
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search); // Preserve original path and query params
      loginUrl.searchParams.set("from", "middleware"); // Add our custom 'from' parameter
      return NextResponse.redirect(loginUrl);
    }
  }

  // If path is not protected or user is authenticated, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to these paths
    "/profile/:path*",
    "/meal-plans/:path*",
    "/recipes/create/:path*",
    "/shopping-list/:path*",
    "/ai-recipe-generator/:path*",
    // Example: "/settings/:path*"
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