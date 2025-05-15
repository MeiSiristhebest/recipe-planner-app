import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { colors } from "../theme/colors"
import { useAuth } from "../hooks/useAuth"
import { Recipe, Ingredient, Instruction } from "../types/recipe"
import { NutritionInfo } from "../types/nutrition"
import { formatDate } from "../utils/date"
import { Rating } from "../components/Rating"
import { Button } from "../components/Button"
import { Chip } from "../components/Chip"
import { Divider } from "../components/Divider"
import { ErrorMessage } from "../components/ErrorMessage"

// API function to fetch recipe details
async function fetchRecipeDetail(recipeId: string): Promise<Recipe> {
  const response = await fetch(`${process.env.API_URL}/api/recipes/${recipeId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch recipe details")
  }
  return response.json()
}

// API function to toggle favorite
async function toggleFavorite(recipeId: string): Promise<{ isFavorited: boolean }> {
  const response = await fetch(`${process.env.API_URL}/api/recipes/${recipeId}/favorite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (!response.ok) {
    throw new Error("Failed to toggle favorite")
  }
  return response.json()
}

export default function RecipeDetailScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { recipeId } = route.params as { recipeId: string }
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [rating, setRating] = useState(0)

  // Fetch recipe details
  const {
    data: recipe,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => fetchRecipeDetail(recipeId),
  })

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(recipeId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] })
    },
    onError: (error) => {
      Alert.alert("错误", "收藏操作失败，请稍后再试")
    },
  })

  // Submit rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: async (rating: number) => {
      const response = await fetch(`${process.env.API_URL}/api/recipes/${recipeId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      })
      if (!response.ok) {
        throw new Error("Failed to submit rating")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] })
      Alert.alert("成功", "评分已提交")
    },
    onError: (error) => {
      Alert.alert("错误", "评分提交失败，请稍后再试")
    },
  })

  // Handle share
  const handleShare = async () => {
    if (!recipe) return

    try {
      await Share.share({
        message: `查看这道美味的食谱：${recipe.title}\n${process.env.APP_URL}/recipes/${recipeId}`,
        title: recipe.title,
      })
    } catch (error) {
      Alert.alert("分享失败", "无法分享此食谱")
    }
  }

  // Handle add to meal plan
  const handleAddToMealPlan = () => {
    if (!recipe) return
    navigation.navigate("AddToMealPlan", { recipe })
  }

  // Handle edit recipe
  const handleEditRecipe = () => {
    if (!recipe) return
    navigation.navigate("EditRecipe", { recipeId })
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  if (isError || !recipe) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : "加载食谱失败"}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] })}
      />
    )
  }

  const isAuthor = user?.id === recipe.author?.id

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: recipe.coverImage || "https://via.placeholder.com/400" }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Recipe Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.authorRow}>
          <Text style={styles.authorText}>
            by {recipe.author?.name || "未知作者"} • {formatDate(recipe.createdAt)}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          <Rating value={recipe.averageRating || 0} size={18} />
          <Text style={styles.ratingText}>
            {recipe.averageRating?.toFixed(1) || "-"} ({recipe._count?.ratings || 0}人评分)
          </Text>
        </View>

        {/* Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          {recipe.categories?.map((category) => (
            <Chip key={`category-${category.id}`} label={category.name} style={styles.tag} />
          ))}
          {recipe.tags?.map((tag) => (
            <Chip key={`tag-${tag.id}`} label={tag.name} style={styles.tag} variant="outlined" />
          ))}
        </ScrollView>
      </View>

      {/* Recipe Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={24} color={colors.primary} />
          <Text style={styles.infoValue}>{recipe.cookingTime}</Text>
          <Text style={styles.infoLabel}>分钟</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={24} color={colors.primary} />
          <Text style={styles.infoValue}>{recipe.servings}</Text>
          <Text style={styles.infoLabel}>人份</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="speedometer-outline" size={24} color={colors.primary} />
          <Text style={styles.infoValue}>{recipe.difficulty}</Text>
          <Text style={styles.infoLabel}>难度</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleFavoriteMutation.mutate()}
        >
          <Ionicons
            name={recipe.isFavoritedByCurrentUser ? "heart" : "heart-outline"}
            size={24}
            color={recipe.isFavoritedByCurrentUser ? colors.red : colors.text}
          />
          <Text style={styles.actionText}>
            {recipe.isFavoritedByCurrentUser ? "已收藏" : "收藏"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
          <Text style={styles.actionText}>分享</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleAddToMealPlan}>
          <Ionicons name="calendar-outline" size={24} color={colors.text} />
          <Text style={styles.actionText}>加入周计划</Text>
        </TouchableOpacity>

        {isAuthor && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEditRecipe}>
            <Ionicons name="create-outline" size={24} color={colors.text} />
            <Text style={styles.actionText}>编辑</Text>
          </TouchableOpacity>
        )}
      </View>

      <Divider />

      {/* Description */}
      {recipe.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>描述</Text>
          <Text style={styles.description}>{recipe.description}</Text>
        </View>
      )}

      <Divider />

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>食材</Text>
        {recipe.ingredients?.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <Text style={styles.ingredientQuantity}>{ingredient.quantity}</Text>
          </View>
        ))}
      </View>

      <Divider />

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>步骤</Text>
        {recipe.instructions?.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <View style={styles.instructionHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>{instruction.step}</Text>
              </View>
              <Text style={styles.instructionContent}>{instruction.content}</Text>
            </View>
            {instruction.imageUrl && (
              <Image
                source={{ uri: instruction.imageUrl }}
                style={styles.instructionImage}
                resizeMode="cover"
              />
            )}
          </View>
        ))}
      </View>

      <Divider />

      {/* Nutrition Info */}
      {recipe.nutritionInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>营养信息</Text>
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {recipe.nutritionInfo.calories?.toFixed(0) || "-"}
              </Text>
              <Text style={styles.nutritionLabel}>卡路里</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {recipe.nutritionInfo.protein?.toFixed(1) || "-"}g
              </Text>
              <Text style={styles.nutritionLabel}>蛋白质</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {recipe.nutritionInfo.fat?.toFixed(1) || "-"}g
              </Text>
              <Text style={styles.nutritionLabel}>脂肪</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {recipe.nutritionInfo.carbs?.toFixed(1) || "-"}g
              </Text>
              <Text style={styles.nutritionLabel}>碳水</Text>
            </View>
          </View>
        </View>
      )}

      <Divider />

      {/* Rating Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>评分</Text>
        <View style={styles.ratingContainer}>
          <Rating
            value={rating}
            size={32}
            onChange={setRating}
            editable
          />
          <Button
            title="提交评分"
            onPress={() => submitRatingMutation.mutate(rating)}
            disabled={rating === 0 || submitRatingMutation.isPending}
            style={styles.ratingButton}
          />
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
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
  coverContainer: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  authorText: {
    fontSize: 14,
    color: colors.muted,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  tagsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoItem: {
    alignItems: "center",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientName: {
    fontSize: 16,
    color: colors.text,
  },
  ingredientQuantity: {
    fontSize: 16,
    color: colors.muted,
  },
  instructionItem: {
    marginBottom: 20,
  },
  instructionHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumber: {
    color: "white",
    fontWeight: "bold",
  },
  instructionContent: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  instructionImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  nutritionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  nutritionItem: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  nutritionLabel: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  ratingContainer: {
    alignItems: "center",
  },
  ratingButton: {
    marginTop: 16,
    width: 200,
  },
  bottomSpacing: {
    height: 40,
  },
})
