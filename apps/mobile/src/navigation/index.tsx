"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

import { useAuth } from "../hooks/useAuth"
import { colors } from "../constants/colors"

// Auth Screens
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"

// Main Screens
import HomeScreen from "../screens/HomeScreen"
import RecipesScreen from "../screens/RecipesScreen"
import RecipeDetailScreen from "../screens/RecipeDetailScreen"
import EditRecipeScreen from "../screens/EditRecipeScreen"
import MealPlansScreen from "../screens/MealPlansScreen"
import EditTemplateScreen from "../screens/EditTemplateScreen"
import ShoppingListScreen from "../screens/ShoppingListScreen"
import ProfileScreen from "../screens/ProfileScreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}

function RecipesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RecipesList" component={RecipesScreen} options={{ title: "食谱库" }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: "食谱详情" }} />
      <Stack.Screen name="EditRecipe" component={EditRecipeScreen} options={{ title: "编辑食谱", headerShown: false }} />
      <Stack.Screen name="RecipeSearch" component={RecipeSearchScreen} options={{ title: "搜索食谱" }} />
      <Stack.Screen name="AddToMealPlan" component={AddToMealPlanScreen} options={{ title: "添加到周计划" }} />
    </Stack.Navigator>
  )
}

function MealPlansStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MealPlansList" component={MealPlansScreen} options={{ title: "周计划", headerShown: false }} />
      <Stack.Screen name="EditTemplate" component={EditTemplateScreen} options={{ title: "编辑模板", headerShown: false }} />
    </Stack.Navigator>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home"

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Recipes") {
            iconName = focused ? "book" : "book-outline"
          } else if (route.name === "MealPlans") {
            iconName = focused ? "calendar" : "calendar-outline"
          } else if (route.name === "ShoppingList") {
            iconName = focused ? "cart" : "cart-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "首页" }} />
      <Tab.Screen name="Recipes" component={RecipesStack} options={{ headerShown: false, title: "食谱库" }} />
      <Tab.Screen name="MealPlans" component={MealPlansStack} options={{ headerShown: false, title: "周计划" }} />
      <Tab.Screen name="ShoppingList" component={ShoppingListScreen} options={{ title: "购物清单" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "个人中心" }} />
    </Tab.Navigator>
  )
}

export default function Navigation() {
  const { isLoading, isSignedIn } = useAuth()

  if (isLoading) {
    return null // Or a loading screen
  }

  return <NavigationContainer>{isSignedIn ? <MainTabs /> : <AuthStack />}</NavigationContainer>
}
