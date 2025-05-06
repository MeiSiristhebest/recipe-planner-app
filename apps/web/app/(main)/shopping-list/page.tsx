"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Printer, Share2, Trash2, Check, X } from "lucide-react"

// Sample data structure
const INITIAL_SHOPPING_LIST = [
  {
    category: "蔬菜水果",
    items: [
      { id: 1, name: "芦笋", quantity: "1束", checked: false },
      { id: 2, name: "小土豆", quantity: "500克", checked: false },
      { id: 3, name: "柠檬", quantity: "2个", checked: true },
      { id: 4, name: "西红柿", quantity: "4个", checked: false },
    ],
  },
  {
    category: "肉类海鲜",
    items: [
      { id: 5, name: "三文鱼排", quantity: "2块", checked: false },
      { id: 6, name: "鸡胸肉", quantity: "500克", checked: false },
    ],
  },
  {
    category: "调味品干货",
    items: [
      { id: 7, name: "橄榄油", quantity: "适量", checked: true },
      { id: 8, name: "黑胡椒", quantity: "适量", checked: false },
      { id: 9, name: "迷迭香", quantity: "少许", checked: false },
    ],
  },
  {
    category: "乳制品蛋类",
    items: [
      { id: 10, name: "鸡蛋", quantity: "1打", checked: false },
      { id: 11, name: "黄油", quantity: "100克", checked: false },
    ],
  },
]

export default function ShoppingListPage() {
  const [shoppingList, setShoppingList] = useState(INITIAL_SHOPPING_LIST)
  const [newItem, setNewItem] = useState("")

  const toggleItemCheck = (itemId: number) => {
    setShoppingList(
      shoppingList.map((category) => ({
        ...category,
        items: category.items.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)),
      })),
    )
  }

  const addNewItem = () => {
    if (!newItem.trim()) return

    // For simplicity, add to the first category
    const updatedList = [...shoppingList]
    updatedList[0].items.push({
      id: Math.max(...shoppingList.flatMap((c) => c.items.map((i) => i.id))) + 1,
      name: newItem,
      quantity: "待定",
      checked: false,
    })

    setShoppingList(updatedList)
    setNewItem("")
  }

  const markAllComplete = () => {
    setShoppingList(
      shoppingList.map((category) => ({
        ...category,
        items: category.items.map((item) => ({ ...item, checked: true })),
      })),
    )
  }

  const markAllIncomplete = () => {
    setShoppingList(
      shoppingList.map((category) => ({
        ...category,
        items: category.items.map((item) => ({ ...item, checked: false })),
      })),
    )
  }

  const clearCompleted = () => {
    setShoppingList(
      shoppingList
        .map((category) => ({
          ...category,
          items: category.items.filter((item) => !item.checked),
        }))
        .filter((category) => category.items.length > 0),
    )
  }

  const clearAll = () => {
    setShoppingList([])
  }

  const totalItems = shoppingList.reduce((acc, category) => acc + category.items.length, 0)
  const completedItems = shoppingList.reduce(
    (acc, category) => acc + category.items.filter((item) => item.checked).length,
    0,
  )

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">购物清单</h1>

        <div className="flex items-center text-sm text-muted-foreground">
          已完成 {completedItems}/{totalItems} 项
        </div>
      </div>

      {/* Add Item Form */}
      <div className="flex gap-2 mb-8">
        <Input
          placeholder="添加新物品..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNewItem()}
        />
        <Button onClick={addNewItem}>
          <Plus className="h-4 w-4 mr-2" />
          添加
        </Button>
      </div>

      {/* Shopping List */}
      {shoppingList.length > 0 ? (
        <Accordion type="multiple" defaultValue={shoppingList.map((c) => c.category)} className="mb-8">
          {shoppingList.map((category) => (
            <AccordionItem key={category.category} value={category.category}>
              <AccordionTrigger className="text-lg font-medium">
                {category.category}
                <span className="ml-2 text-xs text-muted-foreground">({category.items.length} 项)</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={() => toggleItemCheck(item.id)}
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
          <p className="text-muted-foreground">购物清单为空</p>
          <Button variant="outline" className="mt-4">
            从周计划生成清单
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      {shoppingList.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={markAllComplete}>
            <Check className="h-4 w-4" />
            全部标记为完成
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={markAllIncomplete}>
            <X className="h-4 w-4" />
            全部取消标记
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={clearCompleted}>
            <Trash2 className="h-4 w-4" />
            清除已完成项
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={clearAll}>
            <Trash2 className="h-4 w-4" />
            清空整个清单
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            打印清单
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            分享清单
          </Button>
        </div>
      )}
    </div>
  )
}
