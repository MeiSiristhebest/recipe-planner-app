import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format, addDays, startOfWeek, endOfWeek } from "date-fns"
import { zhCN } from "date-fns/locale"
import { colors } from "../theme/colors"
import { useAuth } from "../hooks/useAuth"
import { Button } from "../components/Button"
import { Divider } from "../components/Divider"
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
  date: string
  mealTime: string
  recipeId: string
  servings: number
  recipe: Recipe
}

interface MealPlan {
  id: string
  name: string
  startDate: string
  endDate: string
  userId: string
  isTemplate: boolean
  items: MealPlanItem[]
}

// API function to fetch current meal plan
async function fetchCurrentMealPlan(): Promise<MealPlan | null> {
  try {
    const response = await fetch(`${process.env.API_URL}/api/meal-plans/current`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error("Failed to fetch current meal plan")
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching current meal plan:", error)
    return null
  }
}

// API function to fetch meal plan templates
async function fetchMealPlanTemplates(): Promise<MealPlan[]> {
  try {
    const response = await fetch(`${process.env.API_URL}/api/meal-plans/templates`)
    if (response.status === 404) {
      return []
    }
    if (!response.ok) {
      throw new Error("Failed to fetch meal plan templates")
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching meal plan templates:", error)
    return []
  }
}

// API function to create meal plan from template
async function createMealPlanFromTemplate(
  templateId: string,
  data: { name: string; startDate: string }
): Promise<MealPlan> {
  const response = await fetch(`${process.env.API_URL}/api/meal-plans/create-from-template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      templateId,
      name: data.name,
      startDate: data.startDate,
    }),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to create meal plan from template")
  }
  return response.json()
}

// API function to save meal plan as template
async function saveMealPlanAsTemplate(name: string): Promise<MealPlan> {
  const response = await fetch(`${process.env.API_URL}/api/meal-plans/save-as-template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to save meal plan as template")
  }
  return response.json()
}

// API function to add recipe to meal plan
async function addRecipeToMealPlan(
  recipeId: string,
  date: string,
  mealTime: string,
  servings: number
): Promise<MealPlanItem> {
  const response = await fetch(`${process.env.API_URL}/api/meal-plans/add-recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipeId,
      date,
      mealTime,
      servings,
    }),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to add recipe to meal plan")
  }
  return response.json()
}

// API function to remove recipe from meal plan
async function removeRecipeFromMealPlan(itemId: string): Promise<void> {
  const response = await fetch(`${process.env.API_URL}/api/meal-plans/remove-recipe/${itemId}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to remove recipe from meal plan")
  }
}

export default function MealPlansScreen() {
  const navigation = useNavigation()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedMealTime, setSelectedMealTime] = useState<string | null>(null)
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false)
  const [isCreateFromTemplateModalVisible, setIsCreateFromTemplateModalVisible] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState("")
  const [newPlanName, setNewPlanName] = useState("")

  // Fetch current meal plan
  const {
    data: currentMealPlan,
    isLoading: isLoadingMealPlan,
    isError: isErrorMealPlan,
    error: mealPlanError,
  } = useQuery({
    queryKey: ["currentMealPlan", format(currentWeekStart, "yyyy-MM-dd")],
    queryFn: fetchCurrentMealPlan,
  })

  // Fetch meal plan templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
  } = useQuery({
    queryKey: ["mealPlanTemplates"],
    queryFn: fetchMealPlanTemplates,
  })

  // Save as template mutation
  const saveAsTemplateMutation = useMutation({
    mutationFn: saveMealPlanAsTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlanTemplates"] })
      setIsTemplateModalVisible(false)
      setTemplateName("")
      Alert.alert("成功", "已成功保存为模板")
    },
    onError: (error) => {
      Alert.alert("错误", error instanceof Error ? error.message : "保存模板失败，请稍后再试")
    },
  })

  // Create from template mutation
  const createFromTemplateMutation = useMutation({
    mutationFn: (data: { templateId: string; name: string; startDate: string }) =>
      createMealPlanFromTemplate(data.templateId, {
        name: data.name,
        startDate: data.startDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentMealPlan"] })
      setIsCreateFromTemplateModalVisible(false)
      setSelectedTemplateId(null)
      setNewPlanName("")
      Alert.alert("成功", "已成功从模板创建膳食计划")
    },
    onError: (error) => {
      Alert.alert(
        "错误",
        error instanceof Error ? error.message : "从模板创建膳食计划失败，请稍后再试"
      )
    },
  })

  // Remove recipe mutation
  const removeRecipeMutation = useMutation({
    mutationFn: removeRecipeFromMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentMealPlan"] })
    },
    onError: (error) => {
      Alert.alert("错误", error instanceof Error ? error.message : "移除食谱失败，请稍后再试")
    },
  })

  // Handle previous week
  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7))
  }

  // Handle next week
  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7))
  }

  // Handle add recipe
  const handleAddRecipe = (date: Date, mealTime: string) => {
    setSelectedDate(date)
    setSelectedMealTime(mealTime)
    navigation.navigate("RecipeSearch", {
      onSelectRecipe: (recipe: Recipe) => {
        addRecipeToMealPlan(
          recipe.id,
          format(date, "yyyy-MM-dd"),
          mealTime,
          1
        ).then(() => {
          queryClient.invalidateQueries({ queryKey: ["currentMealPlan"] })
        }).catch((error) => {
          Alert.alert("错误", "添加食谱失败，请稍后再试")
        })
      },
    })
  }

  // Handle remove recipe
  const handleRemoveRecipe = (itemId: string) => {
    Alert.alert(
      "确认移除",
      "确定要从膳食计划中移除此食谱吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "确定",
          style: "destructive",
          onPress: () => removeRecipeMutation.mutate(itemId),
        },
      ]
    )
  }

  // Handle save as template
  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) {
      Alert.alert("错误", "请输入模板名称")
      return
    }
    saveAsTemplateMutation.mutate(templateName)
  }

  // Handle create from template
  const handleCreateFromTemplate = () => {
    if (!selectedTemplateId) {
      Alert.alert("错误", "请选择一个模板")
      return
    }
    if (!newPlanName.trim()) {
      Alert.alert("错误", "请输入膳食计划名称")
      return
    }
    createFromTemplateMutation.mutate({
      templateId: selectedTemplateId,
      name: newPlanName,
      startDate: format(currentWeekStart, "yyyy-MM-dd"),
    })
  }

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i)
    return {
      date,
      dayName: format(date, "EEE", { locale: zhCN }),
      dayNumber: format(date, "d"),
    }
  })

  // Group meal plan items by date and meal time
  const getMealsByDateAndTime = (date: Date, mealTime: string) => {
    if (!currentMealPlan || !currentMealPlan.items) return []
    
    const dateStr = format(date, "yyyy-MM-dd")
    return currentMealPlan.items.filter(
      (item) => item.date === dateStr && item.mealTime === mealTime
    )
  }

  if (isLoadingMealPlan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  if (isErrorMealPlan) {
    return (
      <ErrorMessage
        message={mealPlanError instanceof Error ? mealPlanError.message : "加载膳食计划失败"}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["currentMealPlan"] })}
      />
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>周计划</Text>
      </View>

      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={handlePreviousWeek}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.weekText}>
          {format(currentWeekStart, "yyyy年MM月dd日", { locale: zhCN })} -{" "}
          {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MM月dd日", { locale: zhCN })}
        </Text>
        <TouchableOpacity style={styles.navButton} onPress={handleNextWeek}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Template Actions */}
      <View style={styles.templateActions}>
        <Button
          title="保存为模板"
          onPress={() => setIsTemplateModalVisible(true)}
          variant="outline"
          icon="save-outline"
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="使用模板"
          onPress={() => setIsCreateFromTemplateModalVisible(true)}
          variant="outline"
          icon="copy-outline"
          style={{ flex: 1, marginLeft: 8 }}
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
          {weekDays.map((day) => (
            <View key={day.dayNumber} style={styles.gridRow}>
              {/* Day Cell */}
              <View style={[styles.gridCell, styles.dayCell, { width: 80 }]}>
                <Text style={styles.dayName}>{day.dayName}</Text>
                <Text style={styles.dayNumber}>{day.dayNumber}</Text>
              </View>

              {/* Meal Cells */}
              {["早餐", "午餐", "晚餐"].map((mealTime) => {
                const meals = getMealsByDateAndTime(day.date, mealTime)
                return (
                  <View key={mealTime} style={[styles.gridCell, styles.mealCell, { flex: 1 }]}>
                    {meals.length > 0 ? (
                      <FlatList
                        data={meals}
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
                        onPress={() => handleAddRecipe(day.date, mealTime)}
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

      {/* Save as Template Modal */}
      <Modal
        visible={isTemplateModalVisible}
        title="保存为模板"
        onClose={() => setIsTemplateModalVisible(false)}
      >
        <Text style={styles.modalLabel}>模板名称</Text>
        <TextInput
          style={styles.modalInput}
          value={templateName}
          onChangeText={setTemplateName}
          placeholder="输入模板名称"
        />
        <Button
          title="保存"
          onPress={handleSaveAsTemplate}
          disabled={saveAsTemplateMutation.isPending || !templateName.trim()}
          style={styles.modalButton}
        />
      </Modal>

      {/* Create from Template Modal */}
      <Modal
        visible={isCreateFromTemplateModalVisible}
        title="使用模板"
        onClose={() => setIsCreateFromTemplateModalVisible(false)}
      >
        <Text style={styles.modalLabel}>选择模板</Text>
        <ScrollView style={styles.templateList}>
          {isLoadingTemplates ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : templates.length > 0 ? (
            templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateItem,
                  selectedTemplateId === template.id && styles.selectedTemplateItem,
                ]}
                onPress={() => setSelectedTemplateId(template.id)}
              >
                <Text
                  style={[
                    styles.templateItemText,
                    selectedTemplateId === template.id && styles.selectedTemplateItemText,
                  ]}
                >
                  {template.name}
                </Text>
                <Text style={styles.templateItemCount}>
                  {template.items.length}个食谱
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>暂无模板</Text>
          )}
        </ScrollView>
        <Text style={styles.modalLabel}>计划名称</Text>
        <TextInput
          style={styles.modalInput}
          value={newPlanName}
          onChangeText={setNewPlanName}
          placeholder="输入计划名称"
        />
        <Button
          title="创建"
          onPress={handleCreateFromTemplate}
          disabled={
            createFromTemplateMutation.isPending ||
            !selectedTemplateId ||
            !newPlanName.trim()
          }
          style={styles.modalButton}
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
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  weekNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navButton: {
    padding: 8,
  },
  weekText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  templateActions: {
    flexDirection: "row",
    padding: 16,
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
    color: colors.text,
  },
  dayNumber: {
    fontSize: 16,
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
  modalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 8,
  },
  templateList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  templateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedTemplateItem: {
    backgroundColor: colors.primary,
  },
  templateItemText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedTemplateItemText: {
    color: "white",
  },
  templateItemCount: {
    fontSize: 14,
    color: colors.muted,
  },
  emptyText: {
    textAlign: "center",
    color: colors.muted,
    padding: 16,
  },
})
