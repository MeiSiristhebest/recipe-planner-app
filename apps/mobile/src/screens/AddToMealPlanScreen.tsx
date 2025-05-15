import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { format, addDays, startOfWeek } from "date-fns"
import { zhCN } from "date-fns/locale"
import { colors } from "../theme/colors"
import { Recipe } from "../types/recipe"
import { Button } from "../components/Button"
import { Picker } from "../components/Picker"

// API function to add recipe to meal plan
async function addRecipeToMealPlan(
  recipeId: string,
  date: string,
  mealTime: string,
  servings: number
): Promise<any> {
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

export default function AddToMealPlanScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { recipe } = route.params as { recipe: Recipe }

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedMealTime, setSelectedMealTime] = useState<string | null>(null)
  const [servings, setServings] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i)
    return {
      date,
      dayName: format(date, "EEE", { locale: zhCN }),
      dayNumber: format(date, "d"),
      fullDay: format(date, "yyyy-MM-dd"),
    }
  })

  // Handle day selection
  const handleDaySelection = (day: string, date: Date) => {
    setSelectedDay(day)
    setSelectedDate(date)
  }

  // Handle add to meal plan
  const handleAddToMealPlan = async () => {
    if (!selectedDate || !selectedMealTime) {
      Alert.alert("错误", "请选择日期和餐次")
      return
    }

    try {
      setIsLoading(true)
      await addRecipeToMealPlan(
        recipe.id,
        format(selectedDate, "yyyy-MM-dd"),
        selectedMealTime,
        servings
      )
      Alert.alert("成功", "已成功添加到周计划")
      navigation.goBack()
    } catch (error) {
      Alert.alert("错误", error instanceof Error ? error.message : "添加失败，请稍后再试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>添加到周计划</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Recipe Card */}
        <View style={styles.recipeCard}>
          {recipe.coverImage ? (
            <Image source={{ uri: recipe.coverImage }} style={styles.recipeImage} />
          ) : (
            <View style={styles.recipeImagePlaceholder}>
              <Ionicons name="restaurant" size={40} color={colors.muted} />
            </View>
          )}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeMeta}>
              {recipe.cookingTime}分钟 • {recipe.difficulty}
            </Text>
          </View>
        </View>

        {/* Day Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择日期</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
            {weekDays.map((day) => (
              <TouchableOpacity
                key={day.fullDay}
                style={[
                  styles.dayItem,
                  selectedDay === day.dayName && styles.selectedDayItem,
                ]}
                onPress={() => handleDaySelection(day.dayName, day.date)}
              >
                <Text
                  style={[
                    styles.dayName,
                    selectedDay === day.dayName && styles.selectedDayText,
                  ]}
                >
                  {day.dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    selectedDay === day.dayName && styles.selectedDayText,
                  ]}
                >
                  {day.dayNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Meal Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择餐次</Text>
          <View style={styles.mealTimeSelector}>
            {["早餐", "午餐", "晚餐"].map((mealTime) => (
              <TouchableOpacity
                key={mealTime}
                style={[
                  styles.mealTimeItem,
                  selectedMealTime === mealTime && styles.selectedMealTimeItem,
                ]}
                onPress={() => setSelectedMealTime(mealTime)}
              >
                <Text
                  style={[
                    styles.mealTimeText,
                    selectedMealTime === mealTime && styles.selectedMealTimeText,
                  ]}
                >
                  {mealTime}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Servings Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>份量</Text>
          <View style={styles.servingsSelector}>
            <TouchableOpacity
              style={styles.servingsButton}
              onPress={() => setServings(Math.max(1, servings - 1))}
            >
              <Ionicons name="remove" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.servingsText}>{servings}</Text>
            <TouchableOpacity
              style={styles.servingsButton}
              onPress={() => setServings(servings + 1)}
            >
              <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="添加到周计划"
          onPress={handleAddToMealPlan}
          disabled={!selectedDate || !selectedMealTime || isLoading}
          loading={isLoading}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 24,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  recipeImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 14,
    color: colors.muted,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  daySelector: {
    flexDirection: "row",
  },
  dayItem: {
    width: 60,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedDayItem: {
    backgroundColor: colors.primary,
  },
  dayName: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  selectedDayText: {
    color: "white",
  },
  mealTimeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealTimeItem: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedMealTimeItem: {
    backgroundColor: colors.primary,
  },
  mealTimeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  selectedMealTimeText: {
    color: "white",
  },
  servingsSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
  },
  servingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  servingsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginHorizontal: 24,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
