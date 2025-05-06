import type React from "react"
import { Inter, Noto_Sans_SC } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import "./globals.css"
import { QueryProvider } from "@/components/providers/query-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "700"],
  display: "swap",
})

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
      <body className={`${inter.variable} ${notoSansSC.variable} font-sans min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
