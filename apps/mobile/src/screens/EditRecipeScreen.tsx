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
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as ImagePicker from "expo-image-picker"
import { colors } from "../theme/colors"
import { useAuth } from "../hooks/useAuth"
import { Recipe, Ingredient, Instruction } from "../types/recipe"
import { Button } from "../components/Button"
import { Divider } from "../components/Divider"
import { ErrorMessage } from "../components/ErrorMessage"
import { Picker } from "../components/Picker"
import { CheckboxGroup } from "../components/CheckboxGroup"

// API function to fetch recipe details
async function fetchRecipeDetail(recipeId: string): Promise<Recipe> {
  const response = await fetch(`${process.env.API_URL}/api/recipes/${recipeId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch recipe details")
  }
  return response.json()
}

// API function to fetch categories
async function fetchCategories(): Promise<{ id: string; name: string }[]> {
  const response = await fetch(`${process.env.API_URL}/api/categories`)
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  return response.json()
}

// API function to fetch tags
async function fetchTags(): Promise<{ id: string; name: string }[]> {
  const response = await fetch(`${process.env.API_URL}/api/tags`)
  if (!response.ok) {
    throw new Error("Failed to fetch tags")
  }
  return response.json()
}

// API function to update recipe
async function updateRecipe(recipeId: string, recipeData: any): Promise<Recipe> {
  const response = await fetch(`${process.env.API_URL}/api/recipes/${recipeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipeData),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to update recipe")
  }
  return response.json()
}

// API function to upload image
async function uploadImage(uri: string): Promise<{ url: string }> {
  const formData = new FormData()
  const filename = uri.split("/").pop() || "image.jpg"
  const match = /\.(\w+)$/.exec(filename)
  const type = match ? `image/${match[1]}` : "image/jpeg"

  formData.append("file", {
    uri,
    name: filename,
    type,
  } as any)

  const response = await fetch(`${process.env.API_URL}/api/upload`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to upload image")
  }

  return response.json()
}

export default function EditRecipeScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { recipeId } = route.params as { recipeId: string }
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cookingTime: "30",
    servings: "2",
    difficulty: "中等",
    ingredients: [] as Ingredient[],
    instructions: [] as Instruction[],
    categoryIds: [] as string[],
    tagIds: [] as string[],
  })

  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "" })
  const [newInstruction, setNewInstruction] = useState({ content: "", imageUrl: "" })
  const [activeTab, setActiveTab] = useState("basic")
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Fetch recipe details
  const {
    data: recipe,
    isLoading: isLoadingRecipe,
    isError: isErrorRecipe,
    error: recipeError,
  } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => fetchRecipeDetail(recipeId),
    onSuccess: (data) => {
      // Check if current user is the author
      if (user?.id !== data.author?.id) {
        setIsAuthorized(false)
        Alert.alert("无权限", "您无权编辑此食谱")
        navigation.goBack()
        return
      }

      setIsAuthorized(true)
      setFormData({
        title: data.title || "",
        description: data.description || "",
        cookingTime: data.cookingTime?.toString() || "30",
        servings: data.servings?.toString() || "2",
        difficulty: data.difficulty || "中等",
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        categoryIds: data.categories?.map((c) => c.id) || [],
        tagIds: data.tags?.map((t) => t.id) || [],
      })
      setCoverImage(data.coverImage || null)
    },
  })

  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  // Fetch tags
  const {
    data: tags = [],
    isLoading: isLoadingTags,
  } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  })

  // Update recipe mutation
  const updateRecipeMutation = useMutation({
    mutationFn: (data: any) => updateRecipe(recipeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] })
      Alert.alert("成功", "食谱更新成功")
      navigation.goBack()
    },
    onError: (error) => {
      Alert.alert("错误", error instanceof Error ? error.message : "更新食谱失败，请稍后再试")
    },
  })

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      setCoverImage(data.url)
    },
    onError: (error) => {
      Alert.alert("错误", "图片上传失败，请稍后再试")
    },
  })

  // Handle image picker
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      Alert.alert("权限错误", "需要访问相册权限")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadImageMutation.mutate(result.assets[0].uri)
    }
  }

  // Handle adding ingredient
  const handleAddIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.quantity.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, { ...newIngredient, category: "其他" }],
      })
      setNewIngredient({ name: "", quantity: "" })
    } else {
      Alert.alert("错误", "食材名称和数量不能为空")
    }
  }

  // Handle removing ingredient
  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    })
  }

  // Handle adding instruction
  const handleAddInstruction = () => {
    if (newInstruction.content.trim()) {
      setFormData({
        ...formData,
        instructions: [
          ...formData.instructions,
          {
            step: formData.instructions.length + 1,
            content: newInstruction.content,
            imageUrl: newInstruction.imageUrl || undefined,
          },
        ],
      })
      setNewInstruction({ content: "", imageUrl: "" })
    } else {
      Alert.alert("错误", "步骤内容不能为空")
    }
  }

  // Handle removing instruction
  const handleRemoveInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions
        .filter((_, i) => i !== index)
        .map((instruction, i) => ({
          ...instruction,
          step: i + 1,
        })),
    })
  }

  // Handle instruction image picker
  const handlePickInstructionImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      Alert.alert("权限错误", "需要访问相册权限")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const uploadResult = await uploadImage(result.assets[0].uri)
        setNewInstruction({ ...newInstruction, imageUrl: uploadResult.url })
      } catch (error) {
        Alert.alert("错误", "图片上传失败，请稍后再试")
      }
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert("错误", "请输入食谱标题")
      setActiveTab("basic")
      return
    }

    if (formData.ingredients.length === 0) {
      Alert.alert("错误", "请至少添加一种食材")
      setActiveTab("ingredients")
      return
    }

    if (formData.instructions.length === 0) {
      Alert.alert("错误", "请至少添加一个步骤")
      setActiveTab("instructions")
      return
    }

    if (formData.categoryIds.length === 0) {
      Alert.alert("错误", "请至少选择一个分类")
      setActiveTab("categories")
      return
    }

    const submitData = {
      ...formData,
      cookingTime: parseInt(formData.cookingTime),
      servings: parseInt(formData.servings),
      coverImage: coverImage || undefined,
    }

    updateRecipeMutation.mutate(submitData)
  }

  if (isLoadingRecipe || isLoadingCategories || isLoadingTags) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  if (isErrorRecipe) {
    return (
      <ErrorMessage
        message={recipeError instanceof Error ? recipeError.message : "加载食谱失败"}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] })}
      />
    )
  }

  if (!isAuthorized) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>您无权编辑此食谱</Text>
        <Button title="返回" onPress={() => navigation.goBack()} style={styles.backButton} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>编辑食谱</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSubmit}
            disabled={updateRecipeMutation.isPending}
          >
            {updateRecipeMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.saveButtonText}>保存</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === "basic" && styles.activeTabItem]}
              onPress={() => setActiveTab("basic")}
            >
              <Text
                style={[styles.tabText, activeTab === "basic" && styles.activeTabText]}
              >
                基本信息
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === "ingredients" && styles.activeTabItem]}
              onPress={() => setActiveTab("ingredients")}
            >
              <Text
                style={[styles.tabText, activeTab === "ingredients" && styles.activeTabText]}
              >
                食材
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === "instructions" && styles.activeTabItem]}
              onPress={() => setActiveTab("instructions")}
            >
              <Text
                style={[styles.tabText, activeTab === "instructions" && styles.activeTabText]}
              >
                步骤
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === "categories" && styles.activeTabItem]}
              onPress={() => setActiveTab("categories")}
            >
              <Text
                style={[styles.tabText, activeTab === "categories" && styles.activeTabText]}
              >
                分类和标签
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView style={styles.content}>
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <View style={styles.tabContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>标题</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="输入食谱标题"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>描述</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="简短描述这道食谱"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>封面图片</Text>
                <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage}>
                  {coverImage ? (
                    <Image source={{ uri: coverImage }} style={styles.coverImagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color={colors.muted} />
                      <Text style={styles.imagePlaceholderText}>点击选择图片</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {coverImage && (
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setCoverImage(null)}
                  >
                    <Text style={styles.removeImageText}>移除图片</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>烹饪时间（分钟）</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.cookingTime}
                    onChangeText={(text) => setFormData({ ...formData, cookingTime: text })}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>份量（人份）</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.servings}
                    onChangeText={(text) => setFormData({ ...formData, servings: text })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>难度</Text>
                <Picker
                  selectedValue={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  items={[
                    { label: "简单", value: "简单" },
                    { label: "中等", value: "中等" },
                    { label: "困难", value: "困难" },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Ingredients Tab */}
          {activeTab === "ingredients" && (
            <View style={styles.tabContent}>
              {formData.ingredients.length > 0 ? (
                <View style={styles.ingredientsList}>
                  {formData.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <View style={styles.ingredientInfo}>
                        <Text style={styles.ingredientName}>{ingredient.name}</Text>
                        <Text style={styles.ingredientQuantity}>{ingredient.quantity}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveIngredient(index)}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>暂无食材，请添加</Text>
                </View>
              )}

              <Divider />

              <View style={styles.formGroup}>
                <Text style={styles.label}>添加新食材</Text>
                <TextInput
                  style={styles.input}
                  value={newIngredient.name}
                  onChangeText={(text) => setNewIngredient({ ...newIngredient, name: text })}
                  placeholder="食材名称"
                />
              </View>

              <View style={styles.formGroup}>
                <TextInput
                  style={styles.input}
                  value={newIngredient.quantity}
                  onChangeText={(text) => setNewIngredient({ ...newIngredient, quantity: text })}
                  placeholder="数量（如：200克）"
                />
              </View>

              <Button
                title="添加食材"
                onPress={handleAddIngredient}
                disabled={!newIngredient.name || !newIngredient.quantity}
                icon="add-circle-outline"
              />
            </View>
          )}

          {/* Instructions Tab */}
          {activeTab === "instructions" && (
            <View style={styles.tabContent}>
              {formData.instructions.length > 0 ? (
                <View style={styles.instructionsList}>
                  {formData.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <View style={styles.instructionHeader}>
                        <View style={styles.stepCircle}>
                          <Text style={styles.stepNumber}>{instruction.step}</Text>
                        </View>
                        <Text style={styles.instructionContent}>{instruction.content}</Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveInstruction(index)}
                        >
                          <Ionicons name="trash-outline" size={20} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                      {instruction.imageUrl && (
                        <Image
                          source={{ uri: instruction.imageUrl }}
                          style={styles.instructionImage}
                        />
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>暂无步骤，请添加</Text>
                </View>
              )}

              <Divider />

              <View style={styles.formGroup}>
                <Text style={styles.label}>添加新步骤</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newInstruction.content}
                  onChangeText={(text) => setNewInstruction({ ...newInstruction, content: text })}
                  placeholder="描述这个步骤的具体操作"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>步骤图片（可选）</Text>
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handlePickInstructionImage}
                >
                  {newInstruction.imageUrl ? (
                    <Image
                      source={{ uri: newInstruction.imageUrl }}
                      style={styles.instructionImagePreview}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color={colors.muted} />
                      <Text style={styles.imagePlaceholderText}>点击选择图片</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {newInstruction.imageUrl && (
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setNewInstruction({ ...newInstruction, imageUrl: "" })}
                  >
                    <Text style={styles.removeImageText}>移除图片</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Button
                title="添加步骤"
                onPress={handleAddInstruction}
                disabled={!newInstruction.content}
                icon="add-circle-outline"
              />
            </View>
          )}

          {/* Categories and Tags Tab */}
          {activeTab === "categories" && (
            <View style={styles.tabContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>分类</Text>
                <Text style={styles.helperText}>请至少选择一个分类</Text>
                <CheckboxGroup
                  items={categories.map((category) => ({
                    id: category.id,
                    label: category.name,
                  }))}
                  selectedIds={formData.categoryIds}
                  onChange={(ids) => setFormData({ ...formData, categoryIds: ids })}
                />
              </View>

              <Divider />

              <View style={styles.formGroup}>
                <Text style={styles.label}>标签</Text>
                <Text style={styles.helperText}>可选择多个标签</Text>
                <CheckboxGroup
                  items={tags.map((tag) => ({
                    id: tag.id,
                    label: tag.name,
                  }))}
                  selectedIds={formData.tagIds}
                  onChange={(ids) => setFormData({ ...formData, tagIds: ids })}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
    marginTop: 20,
    alignSelf: "center",
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
  tabContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.muted,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  imagePickerButton: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.card,
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: colors.muted,
  },
  coverImagePreview: {
    width: "100%",
    height: "100%",
  },
  instructionImagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  removeImageText: {
    color: colors.danger,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyStateText: {
    color: colors.muted,
    fontSize: 16,
  },
  ingredientsList: {
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: colors.muted,
  },
  removeButton: {
    padding: 8,
  },
  instructionsList: {
    marginBottom: 16,
  },
  instructionItem: {
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  stepNumber: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  instructionContent: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  instructionImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
})
