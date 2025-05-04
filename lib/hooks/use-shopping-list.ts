"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ShoppingList, ShoppingListItem } from "@/types"

export function useShoppingList() {
  return useQuery<ShoppingList>({
    queryKey: ["shoppingList"],
    queryFn: async () => {
      const response = await fetch("/api/shopping-list")
      if (!response.ok) {
        throw new Error("获取购物清单失败")
      }
      return response.json()
    },
  })
}

export function useAddShoppingListItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: Omit<ShoppingListItem, "id" | "isChecked">) => {
      const response = await fetch("/api/shopping-list/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        throw new Error("添加购物清单项目失败")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingList"] })
    },
  })
}

export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ShoppingListItem> & { id: string }) => {
      const response = await fetch(`/api/shopping-list/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("更新购物清单项目失败")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingList"] })
    },
  })
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/shopping-list/items/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("删除购物清单项目失败")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingList"] })
    },
  })
}

export function useGenerateShoppingList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mealPlanId?: string) => {
      const response = await fetch("/api/shopping-list/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mealPlanId }),
      })

      if (!response.ok) {
        throw new Error("生成购物清单失败")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingList"] })
    },
  })
}
