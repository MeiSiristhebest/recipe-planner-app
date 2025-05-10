import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">食谱规划助手</h3>
            <p className="text-sm text-muted-foreground">探索美味食谱，规划健康生活，轻松查找、分享、计划你的每一餐</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="text-sm text-muted-foreground hover:text-primary">
                  食谱库
                </Link>
              </li>
              <li>
                <Link href="/meal-plans" className="text-sm text-muted-foreground hover:text-primary">
                  周计划
                </Link>
              </li>
              <li>
                <Link href="/shopping-list" className="text-sm text-muted-foreground hover:text-primary">
                  购物清单
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">关于我们</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
                  使用条款
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">联系我们</h3>
            <p className="text-sm text-muted-foreground">有任何问题或建议？请随时联系我们。</p>
            <Link href="/contact" className="text-sm text-primary hover:underline">
              发送消息
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 食谱规划助手. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  )
}
