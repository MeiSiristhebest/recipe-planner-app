"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@repo/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui/sheet"
import { Menu, LogOut, UserCircle, Settings, LogIn } from "lucide-react"
import { cn } from "@repo/utils"

const navItems = [
  { name: "首页", href: "/" },
  { name: "食谱库", href: "/recipes" },
  { name: "周计划", href: "/meal-plans" },
  { name: "购物清单", href: "/shopping-list" },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0]?.[0] ?? ''}${nameParts[1]?.[0] ?? ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const mainNavItems = status === 'authenticated'
    ? [...navItems, { name: "个人中心", href: "/profile" }]
    : navItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl md:text-2xl text-primary">觅食记</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle />

          {status === "loading" && (
            <div className="h-8 w-20 animate-pulse bg-muted rounded-md"></div>
          )}

          {status === "authenticated" && session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
                    <AvatarFallback>{getUserInitials(session.user.name)}</AvatarFallback>
            </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name ?? "用户"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email ?? ""}
                    </p>
            </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>个人中心</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile?tab=settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>账户设置</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {status === "unauthenticated" && (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login" className="flex items-center">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register" className="flex items-center">注册</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <Link href="/" className="flex items-center space-x-2 mb-8">
                <span className="font-bold text-xl text-primary">觅食记</span>
              </Link>
              <nav className="flex flex-col gap-3">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-primary py-2 px-3 rounded-md",
                      pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}

                {status === "unauthenticated" && (
                  <>
                    <hr className="my-3"/>
                    <Button variant="outline" asChild>
                      <Link href="/login" className="w-full justify-start text-base py-2 px-3"><LogIn className="mr-2 h-4 w-4" />登录</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register" className="w-full justify-start text-base py-2 px-3">注册</Link>
                    </Button>
                  </>
                )}
                 {status === "authenticated" && (
                  <>
                    <hr className="my-3"/>
                    <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/' })} className="w-full justify-start text-base text-muted-foreground hover:text-destructive py-2 px-3">
                       <LogOut className="mr-2 h-4 w-4" />
                       <span>退出登录</span>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
