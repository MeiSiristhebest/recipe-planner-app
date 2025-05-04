"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Trash2, Printer, Share2, Check, X, Edit, Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  useShoppingList,
  useAddShoppingListItem,
  useUpdateShoppingListItem,
  useDeleteShoppingListItem,
} from "@/lib/hooks/use-shopping-list"
import type { ShoppingListItem } from "@/types"

// 分类
const categories = ["蔬菜水果", "肉类海鲜", "乳制品蛋类", "调味品干货", "其他"]

export default function ShoppingListPage() {
  const { toast } = useToast()
  const { data: shoppingList, isLoading, error } = useShoppingList()
  const addItem = useAddShoppingListItem()
  const updateItem = useUpdateShoppingListItem()
  const deleteItem = useDeleteShoppingListItem()

  const [newItem, setNewItem] = useState("")
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editValue, setEditValue] = useState({
    name: "",
    quantity: "",
    unit: "",
    notes: "",
  })

  // 按分类分组项目
  const itemsByCategory = categories
    .map((category) => ({
      category,
      items: shoppingList?.items.filter((item) => item.category === category) || [],
    }))
    .filter((group) => group.items.length > 0)

  // 添加新项目
  const handleAddItem = async () => {
    if (newItem.trim()) {
      try {
        await addItem.mutateAsync({
          name: newItem,
          quantity: "1",
          unit: "个",
          category: "其他",
          notes: "",
        })
        setNewItem("")
        toast({
          title: "已添加物品",
          description: `${newItem} 已添加到购物清单`,
        })
      } catch (error) {
        toast({
          title: "添加失败",
          description: "无法添加物品，请稍后再试",
          variant: "destructive",
        })
      }
    }
  }

  // 切换项目选中状态
  const toggleItemChecked = async (id: string, isChecked: boolean) => {
    try {
      await updateItem.mutateAsync({
        id,
        isChecked: !isChecked,
      })
    } catch (error) {
      toast({
        title: "更新失败",
        description: "无法更新物品状态，请稍后再试",
        variant: "destructive",
      })
    }
  }

  // 删除项目
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id)
      toast({
        title: "已删除物品",
        description: "物品已从购物清单中删除",
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除物品，请稍后再试",
        variant: "destructive",
      })
    }
  }

  // 开始编辑项目
  const startEditItem = (item: ShoppingListItem) => {
    setEditingItem(item.id)
    setEditValue({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || "",
    })
  }

  // 保存编辑项目
  const saveEditItem = async (id: string) => {
    try {
      await updateItem.mutateAsync({
        id,
        name: editValue.name,
        quantity: editValue.quantity,
        unit: editValue.unit,
        notes: editValue.notes,
      })
      setEditingItem(null)
      toast({
        title: "已更新物品",
        description: "物品信息已更新",
      })
    } catch (error) {
      toast({
        title: "更新失败",
        description: "无法更新物品信息，请稍后再试",
        variant: "destructive",
      })
    }
  }

  // 取消编辑
  const cancelEditItem = () => {
    setEditingItem(null)
  }

  // 标记所有项目为完成/未完成
  const markAllItems = async (checked: boolean) => {
    if (!shoppingList?.items.length) return

    try {
      // 在实际应用中，这里应该有一个批量更新的API
      // 这里我们简单地逐个更新
      for (const item of shoppingList.items) {
        if (item.isChecked !== checked) {
          await updateItem.mutateAsync({
            id: item.id,
            isChecked: checked,
          })
        }
      }

      toast({
        title: checked ? "已标记所有物品" : "已取消标记所有物品",
        description: checked ? "所有物品已标记为已购买" : "所有物品已标记为未购买",
      })
    } catch (error) {
      toast({
        title: "操作失败",
        description: "无法更新物品状态，请稍后再试",
        variant: "destructive",
      })
    }
  }

  // 清除已完成项目
  const clearCompletedItems = async () => {
    if (!shoppingList?.items.length) return

    try {
      const completedItems = shoppingList.items.filter((item) => item.isChecked)

      // 在实际应用中，这里应该有一个批量删除的API
      // 这里我们简单地逐个删除
      for (const item of completedItems) {
        await deleteItem.mutateAsync(item.id)
      }

      toast({
        title: "已清除已完成物品",
        description: "所有已标记的物品已从购物清单中删除",
      })
    } catch (error) {
      toast({
        title: "操作失败",
        description: "无法删除物品，请稍后再试",
        variant: "destructive",
      })
    }
  }

  // 清空所有项目
  const clearAllItems = async () => {
    if (!shoppingList?.items.length) return

    try {
      // 在实际应用中，这里应该有一个清空购物清单的API
      // 这里我们简单地逐个删除
      for (const item of shoppingList.items) {
        await deleteItem.mutateAsync(item.id)
      }

      toast({
        title: "已清空购物清单",
        description: "所有物品已从购物清单中删除",
      })
    } catch (error) {
      toast({
        title: "操作失败",
        description: "无法清空购物清单，请稍后再试",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">加载购物清单时出错</p>
            <Button onClick={() => window.location.reload()}>重试</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">购物清单</h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => markAllItems(true)}>
            <Check className="h-4 w-4 mr-1" />
            全部标记
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAllItems(false)}>
            <X className="h-4 w-4 mr-1" />
            全部取消标记
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-1" />
                更多操作
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={clearCompletedItems}>
                <Trash2 className="h-4 w-4 mr-2" />
                清除已完成项
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearAllItems}>
                <Trash2 className="h-4 w-4 mr-2" />
                清空整个清单
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                打印清单
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                分享清单
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>添加物品</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="输入物品名称..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
            <Button onClick={handleAddItem} disabled={addItem.isPending}>
              {addItem.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              添加
            </Button>
          </div>
        </CardContent>
      </Card>

      {!shoppingList?.items || shoppingList.items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">您的购物清单是空的</p>
            <Button>从周计划生成购物清单</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <Accordion type="multiple" defaultValue={itemsByCategory.map((group) => group.category)}>
              {itemsByCategory.map((group) => (
                <AccordionItem key={group.category} value={group.category}>
                  <AccordionTrigger className="py-2">
                    <div className="flex items-center">
                      <span>{group.category}</span>
                      <span className="ml-2 text-sm text-muted-foreground">({group.items.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {group.items.map((item) => (
                        <li key={item.id} className="flex items-start py-2 group">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={item.isChecked}
                            onCheckedChange={() => toggleItemChecked(item.id, item.isChecked)}
                            className="mt-1 mr-3"
                          />

                          {editingItem === item.id ? (
                            <div className="flex-1 flex flex-col sm:flex-row gap-2">
                              <Input
                                value={editValue.name}
                                onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                                className="flex-1"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={editValue.quantity}
                                  onChange={(e) => setEditValue({ ...editValue, quantity: e.target.value })}
                                  className="w-16"
                                />
                                <Input
                                  value={editValue.unit}
                                  onChange={(e) => setEditValue({ ...editValue, unit: e.target.value })}
                                  className="w-16"
                                />
                                <Input
                                  value={editValue.notes}
                                  onChange={(e) => setEditValue({ ...editValue, notes: e.target.value })}
                                  placeholder="备注"
                                  className="flex-1"
                                />
                                <Button size="icon" variant="ghost" onClick={() => saveEditItem(item.id)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={cancelEditItem}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Label
                                htmlFor={`item-${item.id}`}
                                className={`flex-1 cursor-pointer ${item.isChecked ? "line-through text-muted-foreground" : ""}`}
                              >
                                <div className="flex items-baseline justify-between">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-sm">
                                    {item.quantity} {item.unit}
                                    {item.notes && <span className="text-muted-foreground ml-1">({item.notes})</span>}
                                  </span>
                                </div>
                              </Label>

                              <div className="hidden group-hover:flex items-center gap-1">
                                <Button size="icon" variant="ghost" onClick={() => startEditItem(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
