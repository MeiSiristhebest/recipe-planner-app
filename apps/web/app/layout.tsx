// import "@/styles/globals.css"
import "./globals.css"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import { AuthProvider } from "@/components/providers/auth-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
// import { Toaster } from "@repo/ui/toaster"
import { NavigationEvents } from "@/components/shared/navigation-events"
import { auth } from "@/lib/auth"
import { Toaster } from "sonner"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import { AuthDebugger } from "@/components/debug/auth-debugger"

const fontInter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "觅食记",
  description: "觅食记 - 轻松管理您的食谱和周餐计划",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 获取服务端会话以传递给客户端 AuthProvider
  const session = await auth()

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={fontInter.className}>
        <AuthProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <Toaster richColors position="top-right" />
              <NavigationEvents />
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <AuthDebugger />
              </div>
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
