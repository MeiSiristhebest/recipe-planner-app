"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { useQuery } from "@tanstack/react-query"
import { Ionicons } from "@expo/vector-icons"
import { fetchRecipes } from "../api/recipes"
import type { Recipe } from "../types/recipe"
import { useNavigation } from "@react-navigation/native"
import { colors } from "../constants/colors"

const CATEGORIES = ["全部", "快手菜", "家常菜", "烘焙", "汤羹", "早餐"]
const DIFFICULTIES = ["全部", "简单", "中等", "困难"]

export default function RecipesScreen() {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [selectedDifficulty, setSelectedDifficulty] = useState("全部")
  const [isFilterVisible, setIsFilterVisible] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ["recipes", searchQuery, selectedCategory, selectedDifficulty],
    queryFn: () =>
      fetchRecipes({
        query: searchQuery,
        category: selectedCategory !== "全部" ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== "全部" ? selectedDifficulty : undefined,
      }),
  })

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })}
    >
      <Image source={{ uri: item.coverImage || "https://via.placeholder.com/150" }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.recipeMetaRow}>
          <Text style={styles.recipeMeta}>
            <Ionicons name="time-outline" size={14} color={colors.muted} /> {item.cookingTime}分钟
          </Text>
          <Text style={styles.recipeMeta}>
            <Ionicons name="star" size={14} color={colors.yellow} /> {item.averageRating.toFixed(1)}
          </Text>
        </View>
        <View style={styles.tagsContainer}>
          {item.categories.slice(0, 1).map((category) => (
            <View key={category.id} style={styles.tag}>
              <Text style={styles.tagText}>{category.name}</Text>
            </View>
          ))}
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索食谱..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterVisible(!isFilterVisible)}>
          <Ionicons name="filter" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isFilterVisible && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>分类</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, selectedCategory === category && { backgroundColor: colors.primaryLight }]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.filterChipText, selectedCategory === category && { color: colors.primary }]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterTitle}>难度</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {DIFFICULTIES.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterChip,
                  selectedDifficulty === difficulty && { backgroundColor: colors.primaryLight },
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text style={[styles.filterChipText, selectedDifficulty === difficulty && { color: colors.primary }]}>
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>加载失败，请稍后再试</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      ) : data?.recipes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>没有找到符合条件的食谱</Text>
        </View>
      ) : (
        <FlatList
          data={data?.recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recipeList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 4,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: "#333",
  },
  recipeList: {
    padding: 16,
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  recipeImage: {
    width: 120,
    height: 120,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  recipeMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  recipeMeta: {
    fontSize: 14,
    color: colors.muted,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
})
