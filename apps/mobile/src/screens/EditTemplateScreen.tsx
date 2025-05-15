import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { colors } from "../theme/colors"
import { useAuth } from "../hooks/useAuth"
import { Button } from "../components/Button"
import { ErrorMessage } from "../components/ErrorMessage"
import { Modal } from "../components/Modal"

// Types
interface Recipe {
  id: string
  title: string
  coverImage?: string
  cookingTime?: number
  difficulty?: string
}

interface MealPlanItem {
  id: string
  day: string
  mealTime: string
  recipeId: string
  servings: number
  recipe: Recipe
}

interface MealPlanTemplate {
  id: string
  name: string
  userId: string
  items: MealPlanItem[]
}

// API function to fetch template
async function fetchTemplate(templateId: string): Promise<MealPlanTemplate> {
  const response = await fetch(`${process.env.API_URL}/api/meal-plans/templates/${templateId}`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("模板不存在")
    }
    if (response.status === 403) {
      throw new Error("无权编辑此模板")
    }
    throw new Error("获取模板失败")
  }
  return response.json()
}

// API function to update template
async function updateTemplate(
  templateId: string,
  data: { name: string; items: any[] }
): Promise<MealPlanTemplate> {
  const response = await fetch(`${process.env.API_URL}/api/meal-plans/templates/${templateId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: templateId,
      name: data.name,
      isTemplate: true,
      items: data.items,
    }),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "更新模板失败")
  }
  return response.json()
}

// API function to search recipes
async function searchRecipes(query: string): Promise<Recipe[]> {
  const response = await fetch(
    `${process.env.API_URL}/api/recipes?query=${encodeURIComponent(query)}&limit=10`
  )
  if (!response.ok) {
    throw new Error("搜索食谱失败")
  }
  return response.json().then((data) => data.recipes || [])
}

// API function to fetch favorite recipes
async function fetchFavoriteRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${process.env.API_URL}/api/recipes/favorites`)
  if (!response.ok) {
    throw new Error("获取收藏食谱失败")
  }
  return response.json()
}

// API function to fetch recent recipes
async function fetchRecentRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${process.env.API_URL}/api/recipes/recent`)
  if (!response.ok) {
    throw new Error("获取最近浏览食谱失败")
  }
  return response.json()
}

// Days and meal times
const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
const MEAL_TIMES = ["早餐", "午餐", "晚餐"]

export default function EditTemplateScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { templateId } = route.params as { templateId: string }
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [templateName, setTemplateName] = useState("")
  const [templateItems, setTemplateItems] = useState<MealPlanItem[]>([])
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedMealTime, setSelectedMealTime] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Recipe[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([])

  // Fetch template
  const {
    data: template,
    isLoading: isLoadingTemplate,
    isError: isErrorTemplate,
    error: templateError,
  } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId),
    onSuccess: (data) => {
      // Check if current user is the author
      if (user?.id !== data.userId) {
        setIsAuthorized(false)
        Alert.alert("无权限", "您无权编辑此模板")
        navigation.goBack()
        return
      }

      setIsAuthorized(true)
      setTemplateName(data.name || "")
      setTemplateItems(data.items || [])
    },
  })

  // Fetch favorite recipes
  const {
    data: favoriteRecipes = [],
    isLoading: isLoadingFavorites,
  } = useQuery({
    queryKey: ["favoriteRecipes"],
    queryFn: fetchFavoriteRecipes,
  })

  // Fetch recent recipes
  const {
    data: recentRecipes = [],
    isLoading: isLoadingRecent,
  } = useQuery({
    queryKey: ["recentRecipes"],
    queryFn: fetchRecentRecipes,
  })

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: (data: { name: string; items: any[] }) => updateTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template", templateId] })
      queryClient.invalidateQueries({ queryKey: ["mealPlanTemplates"] })
      Alert.alert("成功", "模板更新成功")
      navigation.goBack()
    },
    onError: (error) => {
      Alert.alert("错误", error instanceof Error ? error.message : "更新模板失败，请稍后再试")
    },
  })

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      const results = await searchRecipes(searchQuery)
      setSearchResults(results)
    } catch (error) {
      Alert.alert("错误", "搜索食谱失败，请稍后再试")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle recipe selection
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipes((prev) => {
      // Check if recipe is already selected
      const isSelected = prev.some((r) => r.id === recipe.id)
      if (isSelected) {
        return prev.filter((r) => r.id !== recipe.id)
      } else {
        return [...prev, recipe]
      }
    })
  }

  // Handle add recipes
  const handleAddRecipes = () => {
    if (!selectedDay || !selectedMealTime || selectedRecipes.length === 0) return

    const newItems = [...templateItems]

    selectedRecipes.forEach((recipe) => {
      const newItem: MealPlanItem = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        day: selectedDay,
        mealTime: selectedMealTime,
        recipeId: recipe.id,
        servings: 1,
        recipe,
      }
      newItems.push(newItem)
    })

    setTemplateItems(newItems)
    setIsSearchModalVisible(false)
    setSelectedDay(null)
    setSelectedMealTime(null)
    setSelectedRecipes([])
    setSearchQuery("")
    setSearchResults([])
  }

  // Handle remove recipe
  const handleRemoveRecipe = (itemId: string) => {
    setTemplateItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  // Handle save template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      Alert.alert("错误", "请输入模板名称")
      return
    }

    const submitData = {
      name: templateName,
      items: templateItems.map((item) => ({
        day: item.day,
        mealTime: item.mealTime,
        recipeId: item.recipe.id,
        servings: item.servings,
      })),
    }

    updateTemplateMutation.mutate(submitData)
  }

  // Get recipes for a specific day and meal time
  const getRecipesByDayAndMealTime = (day: string, mealTime: string) => {
    return templateItems.filter((item) => item.day === day && item.mealTime === mealTime)
  }

  if (isLoadingTemplate) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  if (isErrorTemplate) {
    return (
      <ErrorMessage
        message={templateError instanceof Error ? templateError.message : "加载模板失败"}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["template", templateId] })}
      />
    )
  }

  if (!isAuthorized) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>您无权编辑此模板</Text>
        <Button title="返回" onPress={() => navigation.goBack()} style={styles.backButton} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>编辑模板</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveTemplate}
          disabled={updateTemplateMutation.isPending}
        >
          {updateTemplateMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveButtonText}>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Template Name */}
      <View style={styles.nameContainer}>
        <Text style={styles.label}>模板名称</Text>
        <TextInput
          style={styles.input}
          value={templateName}
          onChangeText={setTemplateName}
          placeholder="输入模板名称"
        />
      </View>

      {/* Meal Plan Grid */}
      <ScrollView style={styles.content}>
        <View style={styles.mealPlanGrid}>
          {/* Header Row */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.headerCell, { width: 80 }]}>
              <Text style={styles.headerCellText}></Text>
            </View>
            <View style={[styles.gridCell, styles.headerCell, { flex: 1 }]}>
              <Text style={styles.headerCellText}>早餐</Text>
            </View>
            <View style={[styles.gridCell, styles.headerCell, { flex: 1 }]}>
              <Text style={styles.headerCellText}>午餐</Text>
            </View>
            <View style={[styles.gridCell, styles.headerCell, { flex: 1 }]}>
              <Text style={styles.headerCellText}>晚餐</Text>
            </View>
          </View>

          {/* Day Rows */}
          {DAYS.map((day) => (
            <View key={day} style={styles.gridRow}>
              {/* Day Cell */}
              <View style={[styles.gridCell, styles.dayCell, { width: 80 }]}>
                <Text style={styles.dayName}>{day}</Text>
              </View>

              {/* Meal Cells */}
              {MEAL_TIMES.map((mealTime) => {
                const recipes = getRecipesByDayAndMealTime(day, mealTime)
                return (
                  <View key={mealTime} style={[styles.gridCell, styles.mealCell, { flex: 1 }]}>
                    {recipes.length > 0 ? (
                      <FlatList
                        data={recipes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <View style={styles.mealItem}>
                            <View style={styles.mealItemContent}>
                              {item.recipe.coverImage ? (
                                <Image
                                  source={{ uri: item.recipe.coverImage }}
                                  style={styles.mealItemImage}
                                />
                              ) : (
                                <View style={styles.mealItemImagePlaceholder}>
                                  <Ionicons name="restaurant" size={16} color={colors.muted} />
                                </View>
                              )}
                              <View style={styles.mealItemInfo}>
                                <Text style={styles.mealItemTitle} numberOfLines={2}>
                                  {item.recipe.title}
                                </Text>
                                <Text style={styles.mealItemServings}>{item.servings}份</Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              style={styles.mealItemRemoveButton}
                              onPress={() => handleRemoveRecipe(item.id)}
                            >
                              <Ionicons name="close" size={16} color={colors.danger} />
                            </TouchableOpacity>
                          </View>
                        )}
                        scrollEnabled={false}
                      />
                    ) : (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                          setSelectedDay(day)
                          setSelectedMealTime(mealTime)
                          setIsSearchModalVisible(true)
                        }}
                      >
                        <Ionicons name="add" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Recipe Search Modal */}
      <Modal
        visible={isSearchModalVisible}
        title={`添加食谱 - ${selectedDay || ""} ${selectedMealTime || ""}`}
        onClose={() => {
          setIsSearchModalVisible(false)
          setSelectedDay(null)
          setSelectedMealTime(null)
          setSelectedRecipes([])
          setSearchQuery("")
          setSearchResults([])
        }}
      >
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="搜索食谱..."
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.recipeList}>
          {isSearching ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoading} />
          ) : searchResults.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>搜索结果</Text>
              {searchResults.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={[
                    styles.recipeItem,
                    selectedRecipes.some((r) => r.id === recipe.id) && styles.selectedRecipeItem,
                  ]}
                  onPress={() => handleSelectRecipe(recipe)}
                >
                  {recipe.coverImage ? (
                    <Image source={{ uri: recipe.coverImage }} style={styles.recipeItemImage} />
                  ) : (
                    <View style={styles.recipeItemImagePlaceholder}>
                      <Ionicons name="restaurant" size={20} color={colors.muted} />
                    </View>
                  )}
                  <View style={styles.recipeItemInfo}>
                    <Text style={styles.recipeItemTitle}>{recipe.title}</Text>
                    <Text style={styles.recipeItemMeta}>
                      {recipe.cookingTime}分钟 • {recipe.difficulty}
                    </Text>
                  </View>
                  {selectedRecipes.some((r) => r.id === recipe.id) && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              {searchQuery.trim() && (
                <Text style={styles.emptyText}>未找到匹配的食谱，请尝试其他关键词</Text>
              )}
            </>
          )}

          {!isSearching && (
            <>
              <Text style={styles.sectionTitle}>收藏的食谱</Text>
              {isLoadingFavorites ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.searchLoading}
                />
              ) : favoriteRecipes.length > 0 ? (
                favoriteRecipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={[
                      styles.recipeItem,
                      selectedRecipes.some((r) => r.id === recipe.id) && styles.selectedRecipeItem,
                    ]}
                    onPress={() => handleSelectRecipe(recipe)}
                  >
                    {recipe.coverImage ? (
                      <Image source={{ uri: recipe.coverImage }} style={styles.recipeItemImage} />
                    ) : (
                      <View style={styles.recipeItemImagePlaceholder}>
                        <Ionicons name="restaurant" size={20} color={colors.muted} />
                      </View>
                    )}
                    <View style={styles.recipeItemInfo}>
                      <Text style={styles.recipeItemTitle}>{recipe.title}</Text>
                      <Text style={styles.recipeItemMeta}>
                        {recipe.cookingTime}分钟 • {recipe.difficulty}
                      </Text>
                    </View>
                    {selectedRecipes.some((r) => r.id === recipe.id) && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>暂无收藏的食谱</Text>
              )}

              <Text style={styles.sectionTitle}>最近浏览</Text>
              {isLoadingRecent ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.searchLoading}
                />
              ) : recentRecipes.length > 0 ? (
                recentRecipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={[
                      styles.recipeItem,
                      selectedRecipes.some((r) => r.id === recipe.id) && styles.selectedRecipeItem,
                    ]}
                    onPress={() => handleSelectRecipe(recipe)}
                  >
                    {recipe.coverImage ? (
                      <Image source={{ uri: recipe.coverImage }} style={styles.recipeItemImage} />
                    ) : (
                      <View style={styles.recipeItemImagePlaceholder}>
                        <Ionicons name="restaurant" size={20} color={colors.muted} />
                      </View>
                    )}
                    <View style={styles.recipeItemInfo}>
                      <Text style={styles.recipeItemTitle}>{recipe.title}</Text>
                      <Text style={styles.recipeItemMeta}>
                        {recipe.cookingTime}分钟 • {recipe.difficulty}
                      </Text>
                    </View>
                    {selectedRecipes.some((r) => r.id === recipe.id) && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>暂无最近浏览的食谱</Text>
              )}
            </>
          )}
        </ScrollView>

        <Button
          title={`添加选中的食谱 (${selectedRecipes.length})`}
          onPress={handleAddRecipes}
          disabled={selectedRecipes.length === 0}
          style={styles.addRecipesButton}
        />
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.text,
  },
  errorText: {
    textAlign: "center",
    color: colors.danger,
    fontSize: 16,
    marginTop: 20,
  },
  backButton: {
    padding: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  nameContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  mealPlanGrid: {
    padding: 16,
  },
  gridRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  gridCell: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    backgroundColor: colors.card,
  },
  headerCell: {
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  headerCellText: {
    fontWeight: "bold",
    color: colors.text,
  },
  dayCell: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  dayName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  mealCell: {
    minHeight: 80,
    padding: 8,
  },
  addButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: 8,
  },
  mealItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mealItemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
  mealItemImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  mealItemInfo: {
    flex: 1,
  },
  mealItemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  mealItemServings: {
    fontSize: 12,
    color: colors.muted,
  },
  mealItemRemoveButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchLoading: {
    marginVertical: 16,
  },
  recipeList: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedRecipeItem: {
    backgroundColor: colors.primary + "20",
    borderColor: colors.primary,
    borderWidth: 1,
  },
  recipeItemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  recipeItemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recipeItemInfo: {
    flex: 1,
  },
  recipeItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  recipeItemMeta: {
    fontSize: 14,
    color: colors.muted,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    color: colors.muted,
    padding: 16,
  },
  addRecipesButton: {
    marginTop: 16,
  },
})
