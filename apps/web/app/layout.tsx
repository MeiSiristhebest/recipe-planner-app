import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import "./globals.css"
import "nprogress/nprogress.css";
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "sonner"
import { NavigationEvents } from "@/components/shared/navigation-events"

// 使用系统默认字体
const systemFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", "微软雅黑", Arial, sans-serif'

export const metadata = {
  title: "食谱规划助手 | Recipe Planner",
  description: "探索美味食谱，规划健康生活，轻松查找、分享、计划你的每一餐",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
          <QueryProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
            <NavigationEvents />
          </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
