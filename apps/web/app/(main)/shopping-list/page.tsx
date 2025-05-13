"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/shared/auth-guard"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Checkbox } from "@repo/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/accordion"
import { Plus, Printer, Share2, Trash2, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMealPlanStore } from "@/store/meal-plan-store"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@repo/ui/select"

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
  return (
    <AuthGuard>
      <ShoppingListContent />
    </AuthGuard>
  )
}

function ShoppingListContent() {
  const [shoppingList, setShoppingList] = useState([])
  const [newItem, setNewItem] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("其他")
  const [newItemQuantity, setNewItemQuantity] = useState("适量")
  const [isLoading, setIsLoading] = useState(true)
  const [currentListId, setCurrentListId] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const mealPlanItems = useMealPlanStore((state) => state.items)
  const { data: session } = useSession()
  
  // 获取用户的购物清单
  useEffect(() => {
    async function fetchShoppingList() {
      try {
        setIsLoading(true)
        // 尝试获取购物清单
        try {
          const response = await fetch('/api/shopping-list')
          
          if (response.ok) {
            const data = await response.json()
            if (data.length > 0) {
              // 使用最新的购物清单
              const latestList = data[0]
              setCurrentListId(latestList.id)
              
              // 将数据转换为前端使用的结构
              const groupedItems = {}
              latestList.items.forEach(item => {
                if (!groupedItems[item.category]) {
                  groupedItems[item.category] = []
                }
                groupedItems[item.category].push({
                  id: item.id,
                  name: item.name,
                  quantity: item.quantity,
                  checked: item.completed
                })
              })
              
              // 转换为数组格式
              const formattedList = Object.entries(groupedItems).map(([category, items]) => ({
                category,
                items
              }))
              
              setShoppingList(formattedList)
            } else {
              // 如果没有购物清单，显示空列表
              setShoppingList([])
              console.log('没有找到购物清单，需要创建')
            }
          } else {
            // API返回错误，显示空列表
            console.error('获取购物清单API错误:', response.status)
            setShoppingList([])
          }
        } catch (apiError) {
          console.error('API请求失败:', apiError)
          // API请求失败，显示空列表
          setShoppingList([])
        }
      } catch (error) {
        console.error('获取购物清单过程中出现错误:', error)
        toast.error('获取购物清单失败，显示空清单')
        setShoppingList([])
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session?.user) {
      fetchShoppingList()
    } else {
      setIsLoading(false)
    }
  }, [session])
  
  // 创建新的购物清单
  async function createNewShoppingList(items = []) {
    try {
      // 尝试创建新的购物清单
      try {
        const response = await fetch('/api/shopping-list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `购物清单 ${new Date().toLocaleDateString()}`,
            items: items
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          setCurrentListId(data.id)
          return data.id
        } else {
          console.error('创建购物清单API错误:', response.status)
          // 如果有错误但没有抛出异常，返回一个临时ID用于本地使用
          const tempId = `temp_${Date.now()}`
          return tempId
        }
      } catch (apiError) {
        console.error('API请求失败:', apiError)
        // 返回一个临时ID用于本地使用
        const tempId = `temp_${Date.now()}`
        return tempId
      }
    } catch (error) {
      console.error('创建购物清单出现错误:', error)
      toast.error('创建购物清单失败，使用临时ID')
      // 返回一个临时ID用于本地使用
      return `error_temp_${Date.now()}`
    }
  }
  
  // 处理从周计划页面跳转过来的请求
  useEffect(() => {
    const source = searchParams.get('source')
    if (source === 'mealplan' && mealPlanItems.length > 0) {
      // 从周计划生成购物清单
      const generatedItems = generateShoppingListItemsFromMealPlan(mealPlanItems)
      
      // 创建新的购物清单
      createNewShoppingListFromItems(generatedItems)
    }
  }, [searchParams, mealPlanItems])
  
  // 根据周计划生成购物清单项的函数 (返回后端API格式)
  const generateShoppingListItemsFromMealPlan = (mealPlanItems) => {
    const result = []
    const uniqueIngredients = {}
    
    // 遍历所有食谱的食材并分类
    mealPlanItems.forEach(item => {
      if (item.recipe && item.recipe.ingredients) {
        item.recipe.ingredients.forEach(ingredient => {
          // 这里需要根据实际的食材数据结构进行调整
          const ingredientName = ingredient.name || ingredient.item || ''
          const quantity = ingredient.quantity || '适量'
          
          // 简化的食材分类逻辑 (实际项目中可能需要更复杂的逻辑或字典)
          let category = "其他"
          const lowerName = ingredientName.toLowerCase()
          
          // 简单的分类规则
          if (/菜|豆|瓜|果|柠檬|番茄|洋葱|蒜|姜|芹菜|土豆/.test(lowerName)) {
            category = "蔬菜水果"
          } else if (/肉|鱼|虾|蟹|牛|猪|鸡|羊|海鲜|三文鱼/.test(lowerName)) {
            category = "肉类海鲜"
          } else if (/盐|糖|酱|醋|油|料酒|香料|粉|面粉|米|面条|通心粉|意面/.test(lowerName)) {
            category = "调味品干货"
          } else if (/奶|蛋|芝士|奶酪|黄油|乳/.test(lowerName)) {
            category = "乳制品蛋类"
          }
          
          // 生成唯一键以检查重复
          const key = `${lowerName}_${category}`
          
          if (uniqueIngredients[key]) {
            // 已有食材，可以考虑合并数量（简化处理）
            uniqueIngredients[key].quantity = `${uniqueIngredients[key].quantity} + ${quantity}`
          } else {
            // 添加新食材
            uniqueIngredients[key] = {
              name: ingredientName,
              quantity: quantity,
              category: category,
              completed: false
            }
          }
        })
      }
    })
    
    // 转换为数组格式返回API需要的格式
    return Object.values(uniqueIngredients)
  }
  
  // 创建购物清单并保存食材项目到数据库
  const createNewShoppingListFromItems = async (items) => {
    try {
      setIsLoading(true)
      
      // 检查items数据是否有效
      if (!items || !Array.isArray(items) || items.length === 0) {
        toast.warning("无法创建购物清单：食材列表为空")
        setIsLoading(false)
        return
      }
      
      // 创建新的购物清单
      try {
        const response = await fetch('/api/shopping-list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `周计划购物清单 ${new Date().toLocaleDateString()}`,
            items: items
          })
        })
        
        if (!response.ok) {
          console.error('创建购物清单失败:', response.status)
          // 如果API失败，使用本地数据生成购物清单UI
          const groupedItems = {}
          
          items.forEach(item => {
            if (!groupedItems[item.category]) {
              groupedItems[item.category] = []
            }
            
            groupedItems[item.category].push({
              id: Date.now() + Math.floor(Math.random() * 10000) + groupedItems[item.category].length,
              name: item.name,
              quantity: item.quantity,
              checked: item.completed || false
            })
          })
          
          const formattedList = Object.entries(groupedItems).map(([category, items]) => ({
            category,
            items
          }))
          
          setShoppingList(formattedList)
          toast.warning("无法保存到服务器，但已创建本地购物清单")
          setIsLoading(false)
          return
        }
        
        const data = await response.json()
        setCurrentListId(data.id)
        
        // 重新获取购物清单
        try {
          const listResponse = await fetch('/api/shopping-list')
          if (listResponse.ok) {
            const listsData = await listResponse.json()
            if (listsData.length > 0) {
              const latestList = listsData[0]
              
              // 将数据转换为前端使用的结构
              const groupedItems = {}
              latestList.items.forEach(item => {
                if (!groupedItems[item.category]) {
                  groupedItems[item.category] = []
                }
                groupedItems[item.category].push({
                  id: item.id,
                  name: item.name,
                  quantity: item.quantity,
                  checked: item.completed
                })
              })
              
              // 转换为数组格式
              const formattedList = Object.entries(groupedItems).map(([category, items]) => ({
                category,
                items
              }))
              
              setShoppingList(formattedList)
              toast.success("已从周计划生成购物清单")
            } else {
              // 找不到清单，使用本地数据
              toast.warning("服务器上找不到购物清单，使用本地数据")
              // 使用本地数据生成购物清单UI
              generateLocalShoppingList(items)
            }
          } else {
            // 获取失败，使用本地数据
            toast.warning("获取购物清单失败，使用本地数据")
            generateLocalShoppingList(items)
          }
        } catch (fetchError) {
          console.error('获取购物清单失败:', fetchError)
          toast.warning("获取购物清单失败，使用本地数据")
          generateLocalShoppingList(items)
        }
      } catch (createError) {
        console.error('创建购物清单请求失败:', createError)
        toast.warning("创建购物清单失败，使用本地数据")
        generateLocalShoppingList(items)
      }
    } catch (error) {
      console.error('创建购物清单出现错误:', error)
      toast.error('创建购物清单失败')
      // 尝试使用本地数据创建购物清单
      try {
        generateLocalShoppingList(items)
      } catch (localError) {
        console.error('使用本地数据创建购物清单失败:', localError)
        setShoppingList([])
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // 使用本地数据生成购物清单UI
  const generateLocalShoppingList = (items) => {
    try {
      if (!items || !Array.isArray(items)) {
        setShoppingList([])
        return
      }
      
      const groupedItems = {}
      
      items.forEach(item => {
        if (!groupedItems[item.category]) {
          groupedItems[item.category] = []
        }
        
        groupedItems[item.category].push({
          id: Date.now() + Math.floor(Math.random() * 10000) + (groupedItems[item.category].length || 0),
          name: item.name,
          quantity: item.quantity,
          checked: item.completed || false
        })
      })
      
      const formattedList = Object.entries(groupedItems).map(([category, items]) => ({
        category,
        items
      }))
      
      setShoppingList(formattedList)
    } catch (error) {
      console.error('生成本地购物清单失败:', error)
      setShoppingList([])
    }
  }

  // 更新购物清单项状态（勾选/取消勾选）
  const toggleItemCheck = async (itemId) => {
    try {
      // 检查itemId是否有效
      if (!itemId) {
        console.error('无效的物品ID')
        return
      }
      
      // 检查当前物品状态
      const allItems = shoppingList.flatMap(c => c.items)
      const currentItem = allItems.find(item => item.id === itemId)
      
      if (!currentItem) {
        console.error('找不到指定ID的物品:', itemId)
        return
      }
      
      // 计算新状态
      const newCheckedState = !currentItem.checked
      
      // 先在本地UI更新
      setShoppingList(
        shoppingList.map((category) => ({
          ...category,
          items: category.items.map((item) => (item.id === itemId ? { ...item, checked: newCheckedState } : item)),
        })),
      )
      
      // 如果ID是临时ID(以temp_开头)，则跳过API调用
      if (String(itemId).startsWith('temp_') || String(itemId).startsWith('error_temp_')) {
        return
      }
      
      // 尝试调用API更新数据库
      try {
        const response = await fetch(`/api/shopping-list/items/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            completed: newCheckedState,
            // 保持其他字段不变
            name: currentItem.name,
            quantity: currentItem.quantity,
            category: shoppingList.find(c => c.items.some(item => item.id === itemId))?.category
          })
        })
        
        if (!response.ok) {
          // 如果API更新失败，记录错误但不恢复UI状态，保持本地状态
          console.error('更新购物清单项API错误:', response.status)
        }
      } catch (apiError) {
        console.error('API请求失败:', apiError)
        // 同样保持本地状态
      }
    } catch (error) {
      console.error('更新购物清单项错误:', error)
      // 不显示错误提示，保持良好的用户体验
    }
  }

  // 添加新的购物清单项
  const addNewItem = async () => {
    if (!newItem.trim()) return
    
    try {
      // 确保有购物清单ID
      let listId = currentListId
      if (!listId) {
        listId = await createNewShoppingList()
        if (!listId) return
      }
      
      // 调用API添加项目
      const response = await fetch('/api/shopping-list/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shoppingListId: listId,
          name: newItem,
          quantity: newItemQuantity,
          category: newItemCategory,
          completed: false
        })
      })
      
      if (!response.ok) {
        throw new Error('添加物品失败')
      }
      
      const newItemData = await response.json()
      
      // 更新本地状态
      const updatedList = [...shoppingList]
      const categoryIndex = updatedList.findIndex(c => c.category === newItemCategory)
      
      if (categoryIndex !== -1) {
        // 如果分类已存在，添加到该分类
        updatedList[categoryIndex].items.push({
          id: newItemData.id,
          name: newItem,
          quantity: newItemQuantity,
          checked: false
        })
      } else {
        // 如果分类不存在，创建新分类
        updatedList.push({
          category: newItemCategory,
          items: [{
            id: newItemData.id,
            name: newItem,
            quantity: newItemQuantity,
            checked: false
          }]
        })
      }
      
      setShoppingList(updatedList)
      setNewItem("")
      toast.success('物品已添加')
    } catch (error) {
      console.error('Error adding new item:', error)
      toast.error('添加物品失败')
    }
  }

  // 标记所有项目为已完成
  const markAllComplete = async () => {
    try {
      // 确保有购物清单ID
      if (!currentListId) return
      
      const promises = shoppingList.flatMap(category => 
        category.items
          .filter(item => !item.checked)
          .map(item => 
            fetch(`/api/shopping-list/items/${item.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: item.name,
                quantity: item.quantity,
                category: category.category,
                completed: true
              })
            })
          )
      )
      
      await Promise.all(promises)
      
      // 更新本地状态
      setShoppingList(
        shoppingList.map((category) => ({
          ...category,
          items: category.items.map((item) => ({ ...item, checked: true })),
        })),
      )
      
      toast.success('已全部标记为完成')
    } catch (error) {
      console.error('Error marking all complete:', error)
      toast.error('操作失败')
    }
  }

  // 标记所有项目为未完成
  const markAllIncomplete = async () => {
    try {
      // 确保有购物清单ID
      if (!currentListId) return
      
      const promises = shoppingList.flatMap(category => 
        category.items
          .filter(item => item.checked)
          .map(item => 
            fetch(`/api/shopping-list/items/${item.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: item.name,
                quantity: item.quantity,
                category: category.category,
                completed: false
              })
            })
          )
      )
      
      await Promise.all(promises)
      
      // 更新本地状态
      setShoppingList(
        shoppingList.map((category) => ({
          ...category,
          items: category.items.map((item) => ({ ...item, checked: false })),
        })),
      )
      
      toast.success('已全部标记为未完成')
    } catch (error) {
      console.error('Error marking all incomplete:', error)
      toast.error('操作失败')
    }
  }

  // 清除已完成的项目
  const clearCompleted = async () => {
    try {
      // 确保有购物清单ID
      if (!currentListId) return
      
      const itemsToDelete = shoppingList.flatMap(category => 
        category.items
          .filter(item => item.checked)
          .map(item => item.id)
      )
      
      const promises = itemsToDelete.map(itemId => 
        fetch(`/api/shopping-list/items/${itemId}`, {
          method: 'DELETE'
        })
      )
      
      await Promise.all(promises)
      
      // 更新本地状态
      setShoppingList(
        shoppingList
          .map((category) => ({
            ...category,
            items: category.items.filter((item) => !item.checked),
          }))
          .filter((category) => category.items.length > 0),
      )
      
      toast.success('已清除完成项')
    } catch (error) {
      console.error('Error clearing completed items:', error)
      toast.error('操作失败')
    }
  }

  // 清空整个清单
  const clearAll = async () => {
    try {
      // 确保有购物清单ID
      if (!currentListId) return
      
      // 获取所有项目ID
      const itemIds = shoppingList.flatMap(category => 
        category.items.map(item => item.id)
      )
      
      // 逐个删除所有项目
      const promises = itemIds.map(itemId => 
        fetch(`/api/shopping-list/items/${itemId}`, {
          method: 'DELETE'
        })
      )
      
      await Promise.all(promises)
      
      // 更新本地状态
      setShoppingList([])
      toast.success('已清空购物清单')
    } catch (error) {
      console.error('Error clearing all items:', error)
      toast.error('操作失败')
    }
  }

  // 根据周计划生成购物清单项的函数 (返回前端UI格式)
  const generateShoppingListFromMealPlan = (mealPlanItems) => {
    // 首先使用已有的函数生成API格式的数据
    const apiItems = generateShoppingListItemsFromMealPlan(mealPlanItems);
    
    // 将API格式转换为前端UI使用的格式
    const groupedItems = {};
    
    // 对食材按类别分组
    apiItems.forEach(item => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = [];
      }
      
      groupedItems[item.category].push({
        id: Date.now() + Math.floor(Math.random() * 1000), // 临时ID，真实情况会在保存到数据库后获取
        name: item.name,
        quantity: item.quantity,
        checked: false
      });
    });
    
    // 转换为数组格式
    return Object.entries(groupedItems).map(([category, items]) => ({
      category,
      items
    }));
  };

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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-8">
        <div className="md:col-span-3">
          <Input
            placeholder="添加新物品..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNewItem()}
          />
        </div>
        <div className="md:col-span-1">
          <Input
            placeholder="数量..."
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNewItem()}
          />
        </div>
        <div className="md:col-span-1">
          <Select
            value={newItemCategory}
            onValueChange={setNewItemCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="蔬菜水果">蔬菜水果</SelectItem>
              <SelectItem value="肉类海鲜">肉类海鲜</SelectItem>
              <SelectItem value="乳制品蛋类">乳制品蛋类</SelectItem>
              <SelectItem value="调味品干货">调味品干货</SelectItem>
              <SelectItem value="其他">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addNewItem} className="md:col-span-1">
          <Plus className="h-4 w-4 mr-2" />
          添加
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : shoppingList.length > 0 ? (
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
        <div className="text-center py-12 border border-dashed border-muted-foreground/20 rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-4">购物清单为空</p>
          <p className="text-sm text-muted-foreground/70 mb-6 max-w-md mx-auto">
            您可以手动添加物品，或者从您的周计划中生成购物清单。
            {mealPlanItems.length > 0 && " 检测到您的周计划中有食谱，可以直接生成购物清单。"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              className=""
              onClick={() => {
                if (mealPlanItems.length === 0) {
                  toast.info("当前周计划中没有食谱，无法生成购物清单");
                  return;
                }
                
                const generatedItems = generateShoppingListItemsFromMealPlan(mealPlanItems);
                // 重用已有逻辑：创建API格式的购物清单，持久化存储
                createNewShoppingListFromItems(generatedItems);
              }}
            >
              从周计划生成清单
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // 展示示例购物清单
                const sampleList = INITIAL_SHOPPING_LIST.map(category => ({
                  ...category,
                  items: category.items.map(item => ({
                    ...item,
                    id: Date.now() + Math.random() * 10000 + category.items.indexOf(item)
                  }))
                }));
                
                setShoppingList(sampleList);
                toast.info("已加载示例购物清单（仅供演示，未保存到服务器）");
              }}
            >
              查看示例清单
            </Button>
          </div>
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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              // 创建一个新窗口用于打印
              const printWindow = window.open('', '_blank');
              if (!printWindow) {
                toast.error("无法打开打印窗口，请检查您的浏览器设置");
                return;
              }
              
              // 生成打印友好的HTML内容
              let printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>购物清单</title>
                  <meta charset="utf-8" />
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; margin-bottom: 20px; }
                    .category { margin-top: 15px; }
                    .category-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    .item { padding: 5px 0; display: flex; align-items: center; }
                    .checkbox { width: 15px; height: 15px; margin-right: 10px; border: 1px solid #000; }
                    .checked { text-decoration: line-through; color: #777; }
                    .quantity { color: #555; font-size: 90%; margin-left: 10px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
                  </style>
                </head>
                <body>
                  <h1>购物清单</h1>
              `;
              
              // 添加购物清单内容
              shoppingList.forEach(category => {
                printContent += `
                  <div class="category">
                    <div class="category-title">${category.category} (${category.items.length}项)</div>
                `;
                
                category.items.forEach(item => {
                  printContent += `
                    <div class="item ${item.checked ? 'checked' : ''}">
                      <div class="checkbox">${item.checked ? '✓' : ''}</div>
                      ${item.name} <span class="quantity">${item.quantity}</span>
                    </div>
                  `;
                });
                
                printContent += `</div>`;
              });
              
              // 添加页脚
              printContent += `
                  <div class="footer">
                    打印日期: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
                  </div>
                </body>
                </html>
              `;
              
              // 写入内容并打印
              printWindow.document.write(printContent);
              printWindow.document.close();
              
              // 等待图片加载完成后打印
              printWindow.onload = function() {
                printWindow.print();
                printWindow.onafterprint = function() {
                  printWindow.close();
                };
              };
              
              toast.success("正在准备打印...");
            }}
          >
            <Printer className="h-4 w-4 mr-1" />
            打印清单
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              // 准备购物清单数据
              const shoppingListData = {
                list: shoppingList,
                timestamp: new Date().toISOString()
              };
              
              // 转换为字符串，然后Base64编码
              const encodedData = btoa(encodeURIComponent(JSON.stringify(shoppingListData)));
              
              // 创建可分享的URL（在实际应用中可能需要使用更简短的URL或后端支持）
              const shareableUrl = `${window.location.origin}/shopping-list/shared?data=${encodedData}`;
              
              // 检查是否支持Web Share API
              if (navigator.share) {
                navigator.share({
                  title: '购物清单',
                  text: `我的购物清单 (${totalItems}项)`,
                  url: shareableUrl
                })
                .then(() => toast.success("分享成功！"))
                .catch((error) => {
                  console.error('分享失败:', error);
                  fallbackShare();
                });
              } else {
                fallbackShare();
              }
              
              // 备用分享方法（复制到剪贴板）
              function fallbackShare() {
                try {
                  // 复制链接到剪贴板
                  navigator.clipboard.writeText(shareableUrl).then(
                    () => {
                      toast.success("已复制分享链接到剪贴板");
                    },
                    () => {
                      // 如果剪贴板API不可用，显示链接让用户手动复制
                      toast.info("请手动复制以下链接进行分享", {
                        description: shareableUrl,
                        duration: 5000
                      });
                    }
                  );
                } catch (err) {
                  toast.info("请手动复制以下链接进行分享", {
                    description: shareableUrl,
                    duration: 5000
                  });
                }
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-1" />
            分享清单
          </Button>
        </div>
      )}
    </div>
  )
}
