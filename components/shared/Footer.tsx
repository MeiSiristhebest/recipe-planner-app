import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Recipe Planner</h3>
            <p className="text-muted-foreground">探索美味食谱，规划健康生活</p>
          </div>

          <div>
            <h4 className="font-medium mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="text-muted-foreground hover:text-foreground">
                  食谱库
                </Link>
              </li>
              <li>
                <Link href="/meal-plans" className="text-muted-foreground hover:text-foreground">
                  周计划
                </Link>
              </li>
              <li>
                <Link href="/shopping-list" className="text-muted-foreground hover:text-foreground">
                  购物清单
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">关于我们</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  使用条款
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">联系我们</h4>
            <p className="text-muted-foreground">有任何问题或建议？请随时联系我们。</p>
            <Link href="/contact" className="text-primary hover:underline">
              发送消息
            </Link>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {currentYear} Recipe Planner. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  )
}
