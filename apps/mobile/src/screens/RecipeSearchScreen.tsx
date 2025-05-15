import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../theme/colors"
import { Recipe } from "../types/recipe"

// API function to search recipes
async function searchRecipes(query: string): Promise<Recipe[]> {
  const response = await fetch(
    `${process.env.API_URL}/api/recipes?query=${encodeURIComponent(query)}&limit=20`
  )
  if (!response.ok) {
    throw new Error("搜索食谱失败")
  }
  return response.json().then((data) => data.recipes || [])
}

export default function RecipeSearchScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { onSelectRecipe } = route.params as { onSelectRecipe: (recipe: Recipe) => void }

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      const results = await searchRecipes(searchQuery)
      setSearchResults(results)
    } catch (error) {
      Alert.alert("错误", "搜索食谱失败，请稍后再试")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle recipe selection
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
  }

  // Handle confirm selection
  const handleConfirmSelection = () => {
    if (selectedRecipe) {
      onSelectRecipe(selectedRecipe)
      navigation.goBack()
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>搜索食谱</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="输入食谱名称、食材等关键词..."
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.recipeItem,
                selectedRecipe?.id === item.id && styles.selectedRecipeItem,
              ]}
              onPress={() => handleSelectRecipe(item)}
            >
              {item.coverImage ? (
                <Image source={{ uri: item.coverImage }} style={styles.recipeImage} />
              ) : (
                <View style={styles.recipeImagePlaceholder}>
                  <Ionicons name="restaurant" size={24} color={colors.muted} />
                </View>
              )}
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
                <Text style={styles.recipeMeta}>
                  {item.cookingTime}分钟 • {item.difficulty}
                </Text>
              </View>
              {selectedRecipe?.id === item.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.recipeList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {searchQuery.trim() ? (
            <Text style={styles.emptyText}>未找到匹配的食谱，请尝试其他关键词</Text>
          ) : (
            <Text style={styles.emptyText}>请输入关键词搜索食谱</Text>
          )}
        </View>
      )}

      {/* Bottom Button */}
      {selectedRecipe && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmSelection}
          >
            <Text style={styles.confirmButtonText}>确认选择</Text>
          </TouchableOpacity>
        </View>
      )}
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
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.background,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
    textAlign: "center",
  },
  recipeList: {
    padding: 16,
  },
  recipeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedRecipeItem: {
    backgroundColor: colors.primary + "20",
    borderColor: colors.primary,
    borderWidth: 1,
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  recipeImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 14,
    color: colors.muted,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
