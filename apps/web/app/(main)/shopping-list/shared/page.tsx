"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@repo/ui/button"
import { ArrowLeft, Printer, ShoppingCart } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/accordion"
import { Checkbox } from "@repo/ui/checkbox"
import Link from "next/link"

interface ShoppingItem {
  id: number
  name: string
  quantity: string
  checked: boolean
}

interface ShoppingCategory {
  category: string
  items: ShoppingItem[]
}

export default function SharedShoppingListPage() {
  const searchParams = useSearchParams()
  const [shoppingList, setShoppingList] = useState<ShoppingCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareDate, setShareDate] = useState<Date | null>(null)
  
  useEffect(() => {
    try {
      // 从URL查询参数中获取数据
      const encodedData = searchParams.get('data')
      
      if (!encodedData) {
        setError("未找到购物清单数据")
        setIsLoading(false)
        return
      }
      
      // 解码数据
      const jsonString = decodeURIComponent(atob(encodedData))
      const data = JSON.parse(jsonString)
      
      if (!data || !data.list || !Array.isArray(data.list)) {
        setError("购物清单数据格式无效")
        setIsLoading(false)
        return
      }
      
      // 设置购物清单和分享日期
      setShoppingList(data.list)
      setShareDate(data.timestamp ? new Date(data.timestamp) : null)
      setIsLoading(false)
    } catch (err) {
      console.error("解析分享数据失败:", err)
      setError("无法解析购物清单数据")
      setIsLoading(false)
    }
  }, [searchParams])
  
  // 打印功能
  const handlePrint = () => {
    window.print()
  }
  
  // 计算总项目数和已完成项目数
  const totalItems = shoppingList.reduce((acc, category) => acc + category.items.length, 0)
  const completedItems = shoppingList.reduce(
    (acc, category) => acc + category.items.filter(item => item.checked).length,
    0
  )
  
  if (isLoading) {
    return (
      <div className="container py-16 text-center">
        <div className="animate-pulse text-muted-foreground">加载购物清单中...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-16">
        <div className="rounded-lg border border-destructive/50 p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-destructive">错误</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild variant="outline">
            <Link href="/shopping-list">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回购物清单
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center">
          <ShoppingCart className="mr-2 h-6 w-6" />
          分享的购物清单
        </h1>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            已完成 {completedItems}/{totalItems} 项
          </div>
          {shareDate && (
            <div className="text-xs text-muted-foreground">
              分享于: {shareDate.toLocaleDateString()} {shareDate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-4 mb-8">
        <Button asChild variant="outline">
          <Link href="/shopping-list">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回我的清单
          </Link>
        </Button>
        
        <Button variant="outline" className="print:hidden" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          打印此清单
        </Button>
      </div>
      
      {/* 购物清单内容 */}
      {shoppingList.length > 0 ? (
        <Accordion type="multiple" defaultValue={shoppingList.map(c => c.category)} className="mb-8">
          {shoppingList.map(category => (
            <AccordionItem key={category.category} value={category.category}>
              <AccordionTrigger className="text-lg font-medium">
                {category.category}
                <span className="ml-2 text-xs text-muted-foreground">({category.items.length} 项)</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {category.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.checked}
                          disabled
                        />
                        <label
                          htmlFor={`item-${item.id}`}
                          className={`text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}
                        >
                          {item.name}
                        </label>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">此购物清单为空</p>
        </div>
      )}
      
      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          nav, header, footer, .print\\:hidden {
            display: none !important;
          }
          body {
            padding: 20px;
            font-family: system-ui, sans-serif;
          }
          .container {
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          h1 {
            font-size: 24px;
            text-align: center;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  )
} 