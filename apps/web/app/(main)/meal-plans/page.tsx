"use client"

import React from "react"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/shared/auth-guard"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { Button } from "@repo/ui/button"
import { ChevronLeft, ChevronRight, Save, FileDown, Trash2, Wand2 } from "lucide-react"
import { DroppableMealCell } from "@/components/features/meal-plans/droppable-meal-cell"
import { DraggableRecipe } from "@/components/features/meal-plans/draggable-recipe"
import { RecipeSidebar } from "@/components/features/meal-plans/recipe-sidebar"
import { RecipeSearchModal } from "@/components/features/meal-plans/recipe-search-modal"
import { TemplateModal } from "@/components/features/meal-plans/template-modal"
import { AISuggestMealModal, type SuggestedMeal } from "@/components/features/meal-plans/ai-suggest-meal-modal"
import { useMealPlanStore, type DayOfWeek, type MealTime, type MealPlanItem as StoreMealPlanItem } from "@/store/meal-plan-store"
import { addDays, formatISO, parseISO, startOfDay, format, startOfWeek, endOfWeek } from "date-fns"
import type { Recipe, MealPlan, MealPlanItem as PrismaMealPlanItem } from "@recipe-planner/types"
import { toast } from "sonner"
import { RecipeApiOutputSchema, type ValidatedRecipeApiResponse } from "@/lib/validators"
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from "next-auth/react"
import { saveMealPlan } from "@/app/api/meal-plans/actions"

const DAYS: DayOfWeek[] = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
const MEAL_TIMES: MealTime[] = ["早餐", "午餐", "晚餐"]

// API function to fetch favorite recipes
async function fetchFavoriteRecipes(): Promise<Recipe[]> {
  const response = await fetch('/api/profile/my-recipes?type=favorites');
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch favorite recipes');
  }
  return response.json();
}

// API function to fetch recently viewed recipes
async function fetchRecentlyViewedRecipes(): Promise<Recipe[]> {
  const response = await fetch('/api/users/me/recently-viewed');
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch recently viewed recipes');
  }
  return response.json();
}

// Helper function to fetch a single recipe by ID (can be reused or adapted)
async function fetchRecipeById(recipeId: string): Promise<Recipe | null> {
  try {
    const response = await fetch(`/api/recipes/${recipeId}`);
    if (!response.ok) {
      // Consider specific error handling for 404 or other statuses
      console.error(`Recipe fetch failed for ID ${recipeId} with status: ${response.status}`);
      return null;
    }
    const rawRecipeData = await response.json();
    const validationResult = RecipeApiOutputSchema.safeParse(rawRecipeData);

    if (!validationResult.success) {
      console.error("Recipe API output validation failed for ID", recipeId, validationResult.error.flatten());
      return null;
    }
    return validationResult.data as Recipe; // Cast to Recipe after validation
  } catch (error) {
    console.error(`Failed to fetch or validate recipe with ID ${recipeId}:`, error);
    return null;
  }
}

// API function to fetch the current week's meal plan
async function fetchCurrentMealPlan(weekStart: Date): Promise<MealPlan | null> {
  // The API /api/meal-plans/current calculates the week based on 'today'
  // If we want to fetch for a specific week based on currentWeekStart,
  // the API would need to accept a date parameter.
  // For now, let's assume /api/meal-plans/current is what we need for the *actual* current week
  // and a different mechanism or API would be needed for browsing arbitrary weeks if different from store.
  // However, the console log showed /api/meal-plans/current, so we'll use that.
  // The API already handles 404 if no plan is found for the server's "current" week.
  const response = await fetch('/api/meal-plans/current'); 
  if (!response.ok) {
    if (response.status === 404) {
      return null; // No plan found for the current week, return null to indicate this
    }
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch current meal plan and could not parse error' }));
    throw new Error(errorData.message || `Failed to fetch current meal plan. Status: ${response.status}`);
  }
  return response.json();
}

// API function to fetch meal plan templates
async function fetchMealPlanTemplates(): Promise<MealPlan[]> {
  const response = await fetch('/api/meal-plans/templates');
  if (!response.ok) {
    if (response.status === 404) return []; 
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch templates and could not parse error' }));
    throw new Error(errorData.message || `Failed to fetch templates. Status: ${response.status}`);
  }
  return response.json();
}

export default function MealPlansPage() {
  return (
    <AuthGuard>
      <MealPlansContent />
    </AuthGuard>
  )
}

function MealPlansContent() {
  const {
    currentWeekStart,
    items,
    sidebarRecipes,
    setCurrentWeekStart,
    addItem,
    removeItem,
    moveItem,
    setSidebarRecipes,
    loadMealPlanItems,
  } = useMealPlanStore()

  const { data: session, status: sessionStatus } = useSession(); // get status too
  const isAuthenticated = sessionStatus === 'authenticated' && !!session;

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ day: DayOfWeek; mealTime: MealTime; date: Date } | null>(null)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [templateMode, setTemplateMode] = useState<"save" | "load">("save")
  const [isAISuggestModalOpen, setIsAISuggestModalOpen] = useState(false)
  const [currentMealContext, setCurrentMealContext] = useState<{ date: Date; mealTime: string } | null>(null)

  const [searchResults, setSearchResults] = useState<Recipe[]>([])
  const queryClient = useQueryClient(); // 获取 queryClient 实例

  const router = useRouter()
  const searchParams = useSearchParams() // Initialize useSearchParams

  // 初始化为当前日期周
  useEffect(() => {
    // 设置当前日期所在的周一
    const today = new Date();
    const currentMonday = startOfWeek(today, { weekStartsOn: 1 });
    setCurrentWeekStart(currentMonday);
  }, [setCurrentWeekStart]);

  // Fetch current meal plan
  const { 
    data: currentMealPlanData, 
    isLoading: isLoadingCurrentMealPlan, 
    isError: isErrorCurrentMealPlan,
    error: currentMealPlanError,
    refetch: refetchCurrentMealPlan, // To manually refetch if needed
  } = useQuery<MealPlan | null>({
    queryKey: ["currentMealPlan", format(currentWeekStart, 'yyyy-MM-dd')], // Include weekStart in key
    queryFn: () => fetchCurrentMealPlan(currentWeekStart),
    enabled: isAuthenticated,
  });

  // Fetch favorite recipes
  const { data: favoriteRecipesData, isLoading: isLoadingFavorites } = useQuery<Recipe[]>({ queryKey: ["favoriteRecipesMealPlan"], queryFn: fetchFavoriteRecipes, enabled: isAuthenticated });

  // Fetch recently viewed recipes
  const { data: recentRecipesData, isLoading: isLoadingRecent } = useQuery<Recipe[]>({ queryKey: ["recentRecipesMealPlan"], queryFn: fetchRecentlyViewedRecipes, enabled: isAuthenticated });

  // Fetch general recipes for search
  const { data: recipesData, isLoading: isLoadingGeneralRecipes } = useQuery<{ recipes: Recipe[] }>({
    queryKey: ["recipes"],
    queryFn: async () => {
      const response = await fetch('/api/recipes?limit=20');
      if (!response.ok) throw new Error('Failed to fetch general recipes');
      const data = await response.json();
      return { recipes: data.recipes || [] };
    },
  })

  useEffect(() => {
    if (!isLoadingFavorites && !isLoadingRecent) {
      const initialSidebarRecipes = recipesData?.recipes || [];
      setSidebarRecipes(initialSidebarRecipes);
    }
  }, [recipesData, favoriteRecipesData, recentRecipesData, isLoadingFavorites, isLoadingRecent, setSidebarRecipes])

  // Effect to load meal plan items into the store once fetched (for current plan)
  useEffect(() => {
    if (isAuthenticated && currentMealPlanData && currentMealPlanData.items) {
      // --- CONVERSION NEEDED --- 
      // API returns PrismaMealPlanItem[], store uses StoreMealPlanItem[]
      const itemsForStore = currentMealPlanData.items.map((item: PrismaMealPlanItem) => {
          // Calculate DayOfWeek from Date
          const date = new Date(item.date);
          const dayIndex = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
          const dayOfWeek = DAYS[dayIndex === 0 ? 6 : dayIndex - 1] as DayOfWeek;
          return {
              ...item,
              day: dayOfWeek,
              // Ensure recipe is included, even if partial from API
              recipe: item.recipe as Recipe // Cast needed, ensure fields align or fetch full recipe
          } as StoreMealPlanItem; // Cast to the store's type
      });
      loadMealPlanItems(itemsForStore || []);
    } else if (isAuthenticated && !isLoadingCurrentMealPlan && (isErrorCurrentMealPlan || !currentMealPlanData)) {
      loadMealPlanItems([]);
    }
  }, [currentMealPlanData, isLoadingCurrentMealPlan, isErrorCurrentMealPlan, isAuthenticated, loadMealPlanItems]);

  // Effect to handle new recipe added from create page
  useEffect(() => {
    const newRecipeId = searchParams.get('newRecipeId');
    const targetDateStr = searchParams.get('targetDate');
    const targetMealTime = searchParams.get('targetMealTime') as MealTime; // Cast to MealTime

    if (newRecipeId && targetDateStr && targetMealTime) {
      const processNewRecipe = async () => {
        const recipe = await fetchRecipeById(newRecipeId);
        if (recipe) {
          try {
            const targetDate = parseISO(targetDateStr); 
            // Ensure targetDate is valid before proceeding
            if (isNaN(targetDate.getTime())) {
              console.error("Invalid targetDate string from query params:", targetDateStr);
              toast.error("无法添加新食谱：无效的日期。");
              return;
            }
            // Determine DayOfWeek from targetDate
            // JavaScript's getDay(): Sunday is 0, Monday is 1, ..., Saturday is 6.
            // Our DAYS array: 周一 (index 0) to 周日 (index 6).
            const dayIndex = targetDate.getDay();
            const dayOfWeek = DAYS[dayIndex === 0 ? 6 : dayIndex - 1] as DayOfWeek;
            
            addItem({
              recipeId: recipe.id,
              recipe,
              day: dayOfWeek,
              mealTime: targetMealTime,
              servings: 1, // Default servings
            });
            toast.success(`食谱 "${recipe.title}" 已添加到 ${dayOfWeek} ${targetMealTime}。`);
          } catch (error) {
            console.error("Error processing new recipe from query params:", error);
            toast.error("添加新创建的食谱时出错。");
          }
        } else {
          toast.error(`未能找到新创建的食谱 (ID: ${newRecipeId})。`);
        }

        // Clean up query parameters by replacing the URL
        const currentPath = window.location.pathname;
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('newRecipeId');
        newSearchParams.delete('targetDate');
        newSearchParams.delete('targetMealTime');
        router.replace(`${currentPath}?${newSearchParams.toString()}`, { shallow: true });
      };

      processNewRecipe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Rerun when searchParams change

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    // If dragging from sidebar
    if (typeof active.id === "string" && active.id.includes("-")) {
      const [source, recipeId] = active.id.split("-")
      const recipeList = source === "favorite" ? favoriteRecipesData : (source === "recent" ? recentRecipesData : sidebarRecipes);
      const recipe = recipeList?.find((r) => r.id === recipeId)

      if (recipe) {
        setActiveRecipe(recipe)
      }
    } else {
      // If dragging from meal plan
      const item = items.find((item) => item.id === active.id)
      if (item) {
        setActiveRecipe(item.recipe)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveRecipe(null)

    if (!over) return

    // If dropping onto a cell
    if (typeof over.id === "string" && over.id.includes("-cell")) {
      const [day, mealTime] = over.id.split("-cell-") as [DayOfWeek, MealTime]

      // If dragging from sidebar
      if (typeof active.id === "string" && active.id.includes("-")) {
        const [source, recipeId] = active.id.split("-")
        const recipeList = source === "favorite" ? favoriteRecipesData : (source === "recent" ? recentRecipesData : sidebarRecipes);
        const recipe = recipeList?.find((r) => r.id === recipeId)

        if (recipe) {
          addItem({
            recipeId: recipe.id,
            recipe,
            day,
            mealTime,
            servings: 1,
          })
        }
      } else {
        // If dragging from another cell
        moveItem(active.id as string, day, mealTime)
      }
    }

    setSearchModalOpen(false)
    setSelectedCell(null)
  }

  const handleSearchRecipes = (query: string) => {
    // In a real app, this would be an API call
    setSearchResults(
      recipesData?.recipes.filter((recipe) => recipe.title.toLowerCase().includes(query.toLowerCase())) || [],
    )
    // setSearchModalOpen(false) // Don't close modal after search
    // setSelectedCell(null)
  }

  // Changed from handleAddRecipe to handleAddRecipes to accept multiple recipes
  const handleAddRecipes = (recipes: Recipe[], day: DayOfWeek, mealTime: MealTime) => {
    recipes.forEach(recipe => {
    addItem({
      recipeId: recipe.id,
      recipe,
      day,
      mealTime,
        servings: 1, // Default servings, can be adjusted later if needed
    })
    });
    setSearchModalOpen(false) // Close modal after adding recipes
    setSelectedCell(null)
  }

  const handleOpenAddModal = (day: DayOfWeek, mealTime: MealTime) => {
    const date = getDateForDay(day); // Calculate date
    setSelectedCell({ day, mealTime, date }); // Include date
    setSearchModalOpen(true)
  }

  const handleSaveTemplate = async (name: string) => {
    const currentItems = useMealPlanStore.getState().items;

    const itemsForApi = currentItems.map(item => {
        if (!item.recipe || !item.recipe.id) {
            console.error("Skipping item due to missing recipe data:", item);
            toast.error(`无法保存模板，项目 ${item.day} ${item.mealTime} 缺少食谱信息。`);
            return null;
        }
        // Calculate the date based on the currentWeekStart and the item's day
        const itemDate = getDateForDay(item.day); 
        return {
            recipeId: item.recipe.id,
            date: itemDate, // Use the calculated date
            mealTime: item.mealTime,
            servings: item.servings,
        };
    }).filter(item => item !== null) as { recipeId: string; date: Date; mealTime: string; servings: number; }[]; // Assert non-null type

    if (itemsForApi.length !== currentItems.length) {
      return; // Stop if any item had missing data
    }

    const templateData = {
        name: name,
        startDate: startOfWeek(currentWeekStart, { weekStartsOn: 1 }),
        endDate: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
        isTemplate: true,
        items: itemsForApi,
    };

    try {
        // Call the Server Action (which now accepts an object)
        const result = await saveMealPlan(templateData);

        if (result.error) {
            console.error("Failed to save template:", result.error, result.fieldErrors);
            toast.error(`保存模板失败: ${result.error}`);
        } else {
            toast.success(`模板 "${name}" 保存成功!`);
            await queryClient.invalidateQueries({ queryKey: ['mealPlanTemplates'] });
        }
    } catch (error) {
        console.error("Error calling saveMealPlan action:", error);
        toast.error("保存模板时发生意外错误。", { description: (error as Error)?.message });
    }
     setTemplateModalOpen(false);
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      if (template.items) {
          // --- CONVERSION NEEDED --- 
          // API returns PrismaMealPlanItem[], store uses StoreMealPlanItem[]
          const itemsForStore = template.items.map((item: PrismaMealPlanItem) => {
              const date = new Date(item.date);
              const dayIndex = date.getDay();
              const dayOfWeek = DAYS[dayIndex === 0 ? 6 : dayIndex - 1] as DayOfWeek;
              return {
                  ...item, // Spread properties from Prisma item
                  day: dayOfWeek,
                  // Ensure the recipe object (even partial) is passed
                  recipe: item.recipe as Recipe // Cast needed
              } as StoreMealPlanItem;
          });
          loadMealPlanItems(itemsForStore || []); 
          toast.success(`模板 "${template.name}" 已加载。`);
      } else {
          console.info("Selected template has no items:", template); // Use info
          toast.info("所选模板为空。") // Use info instead of warn
          loadMealPlanItems([]);
      }
    } else {
        toast.error("找不到所选模板。可能列表尚未更新。");
    }
    setTemplateModalOpen(false);
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  // Format the week range (e.g., "2023年12月18日 - 12月24日")
  const formatWeekRange = () => {
    const startOfWeek = currentWeekStart
    const endOfWeek = addDays(startOfWeek, 6)

    const startMonth = startOfWeek.getMonth() + 1
    const startDay = startOfWeek.getDate()
    const endMonth = endOfWeek.getMonth() + 1
    const endDay = endOfWeek.getDate()
    const year = startOfWeek.getFullYear()

    return `${year}年${startMonth}月${startDay}日 - ${endMonth}月${endDay}日`
  }

  // Helper function to get the date for a specific day in the current week
  const getDateForDay = (day: DayOfWeek): Date => {
    const dayIndex = DAYS.indexOf(day)
    return addDays(currentWeekStart, dayIndex)
  }

  const handleOpenAISuggestModal = (day: DayOfWeek, mealTime: MealTime) => {
    const date = getDateForDay(day)
    setCurrentMealContext({ date, mealTime })
    setIsAISuggestModalOpen(true)
  }

  const handleCloseAISuggestModal = () => {
    setIsAISuggestModalOpen(false)
    setCurrentMealContext(null)
  }

  const handleMealSuggestedFromAI = async (suggestion: SuggestedMeal, context: { date: Date; mealTime: string }) => {
    const { day: dayString, mealTime } = {
      day: DAYS[context.date.getDay() === 0 ? 6 : context.date.getDay() - 1] as DayOfWeek,
      mealTime: context.mealTime as MealTime
    }

    if (suggestion.suggestionType === "existing_recipe" && suggestion.recipeId) {
      // Attempt to find the recipe in existing client-side lists first
      let recipeToAdd = (sidebarRecipes || []).find(r => r.id === suggestion.recipeId) || 
                        (favoriteRecipesData || []).find(r => r.id === suggestion.recipeId) || 
                        (recentRecipesData || []).find(r => r.id === suggestion.recipeId);
      
      if (!recipeToAdd) {
        // If not found, ideally fetch from API. For now, log and show a message.
        // This would be a good place for a fetchRecipeById query
        try {
          const response = await fetch(`/api/recipes/${suggestion.recipeId}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
            throw new Error(errorData.error || `Recipe fetch failed with status: ${response.status}`);
          }
          const rawRecipeData = await response.json();
          const validationResult = RecipeApiOutputSchema.safeParse(rawRecipeData);

          if (!validationResult.success) {
            console.error("Recipe API output validation failed:", validationResult.error.flatten());
            toast.error("Fetched recipe data is not in the expected format.");
            return;
          }
          recipeToAdd = validationResult.data as Recipe; // Cast to Recipe after validation, ensure types align
        } catch (error) {
          console.error("Failed to fetch or validate suggested recipe:", error);
          toast.error((error as Error).message || "Could not fetch details for the suggested recipe.");
          return;
        }
      }

      if (recipeToAdd) {
        addItem({
          recipeId: recipeToAdd.id,
          recipe: recipeToAdd,
          day: dayString,
          mealTime,
          servings: 1,
        })
        toast.success(`Added "${recipeToAdd.title}" to ${dayString}, ${mealTime} from AI suggestion.`)
      } else {
        toast.error(`Recipe with ID ${suggestion.recipeId} not found.`)
      }
    } else if (suggestion.suggestionType === "new_idea") {
      // For new ideas, create a placeholder or prompt user to create a new recipe
      // For now, just showing a toast and logging.
      toast.info(`AI suggested a new idea: "${suggestion.name}". You might need to create this recipe manually.`)
      console.log("New meal idea from AI:", suggestion, "Context:", dayString, mealTime)
      // Potentially create a simplified placeholder item to add to the plan
      // Example: 
      // const placeholderRecipe: Partial<Recipe> & { name: string } = {
      //   id: `new-ai-${Date.now()}`,
      //   title: suggestion.name,
      //   description: suggestion.description,
      //   nutritionInfo: suggestion.estimatedNutrition as any, // Cast if necessary
      //   // Fill other required Recipe fields with defaults or leave as undefined if store handles it
      // };
      // addItem({
      //   recipeId: placeholderRecipe.id!,
      //   recipe: placeholderRecipe as Recipe, // This needs careful handling of types
      //   day: dayString,
      //   mealTime,
      //   servings: 1,
      // });
      // toast.success(`Added new AI idea "${placeholderRecipe.title}" as a placeholder.`)
    }
    handleCloseAISuggestModal()
  }

  const handleNewIdeaSelectedFromAI = (idea: SuggestedMeal, context: { date: Date; mealTime: string }) => {
    console.log("New AI Idea selected:", idea, "Context:", context);
    // Navigate to recipe creation page with AI idea data as query params
    const queryParams = new URLSearchParams();
    queryParams.append('aiSuggestionName', idea.name);
    if (idea.description) queryParams.append('aiSuggestionDescription', idea.description);
    if (idea.suggestedIngredients && idea.suggestedIngredients.length > 0) {
      queryParams.append('aiSuggestionIngredients', idea.suggestedIngredients.join(','));
    }
    if (idea.cookingOverview) queryParams.append('aiSuggestionOverview', idea.cookingOverview);
    if (idea.estimatedNutrition?.calories) queryParams.append('aiSuggestionCalories', String(idea.estimatedNutrition.calories));
    if (idea.estimatedNutrition?.protein) queryParams.append('aiSuggestionProtein', String(idea.estimatedNutrition.protein));
    if (idea.estimatedNutrition?.fat) queryParams.append('aiSuggestionFat', String(idea.estimatedNutrition.fat));
    if (idea.estimatedNutrition?.carbs) queryParams.append('aiSuggestionCarbs', String(idea.estimatedNutrition.carbs));
    // Potentially pass mealTime and date if the create page can use them to auto-add to plan after creation
    queryParams.append('aiSuggestionMealTime', context.mealTime); // Keep as string
    queryParams.append('aiSuggestionDate', formatISO(context.date, { representation: 'date' }));

    router.push(`/recipes/create?${queryParams.toString()}`);
    setIsAISuggestModalOpen(false); // Close the AI modal
  };

  // Fetch meal plan templates (defined earlier)
  const { 
    data: templatesData, 
    isLoading: isLoadingTemplates, 
    refetch: fetchAndSetTemplates 
  } = useQuery<MealPlan[]>({ 
      queryKey: ['mealPlanTemplates'],
      queryFn: fetchMealPlanTemplates,
      enabled: isAuthenticated,
      initialData: [], 
  });

  // Define templates *after* fetching data
  const templates = templatesData || [];

  // Ensure sidebar data are arrays
  const sidebarFavoriteRecipes: Recipe[] = favoriteRecipesData || []; // Explicitly type and ensure array
  const sidebarRecentRecipes: Recipe[] = recentRecipesData || []; // Explicitly type and ensure array

  // Prepare templates for the TemplateModal, ensuring name is a string and items are converted
  const templatesForModal = templates.map(t => {
      const itemsForStore = (t.items || []).map((item: PrismaMealPlanItem) => {
        const date = new Date(item.date);
        const dayIndex = date.getDay();
        const dayOfWeek = DAYS[dayIndex === 0 ? 6 : dayIndex - 1] as DayOfWeek;
        return {
            ...item,
            day: dayOfWeek,
            recipe: item.recipe as Recipe 
        } as StoreMealPlanItem;
      });
      return {
          id: t.id,
          name: t.name || `未命名模板 ${t.id.substring(0, 4)}`, 
          items: itemsForStore // Use the converted items
      };
  });

  // Dummy search handler for RecipeSidebar
  const handleSidebarSearch = (query: string) => {
    console.log("Sidebar search triggered with query:", query);
    // Implement actual search logic here if needed, 
    // e.g., filter sidebarRecipes or call an API
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">周计划</h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm md:text-base font-medium min-w-[200px] text-center">{formatWeekRange()}</span>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <RecipeSidebar
            favoriteRecipes={favoriteRecipesData || []} 
            recentRecipes={recentRecipesData || []}
            onSearch={handleSidebarSearch} 
          />
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {isLoadingCurrentMealPlan && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <p className="text-lg font-semibold text-primary">正在加载周计划...</p>
                  </div>
                )}
                {isErrorCurrentMealPlan && (!currentMealPlanData && currentMealPlanError) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 p-4">
                    <p className="text-lg font-semibold text-destructive mb-2">加载周计划失败</p>
                    <p className="text-sm text-muted-foreground text-center">{(currentMealPlanError as Error)?.message || "未知错误，请稍后再试或联系支持."}</p>
                    <Button onClick={() => refetchCurrentMealPlan()} className="mt-4">重试</Button>
                  </div>
                )}
                {/* Message for when no plan is found (404 from API, currentMealPlanData is null, no error object necessarily) */}
                {!isLoadingCurrentMealPlan && !isErrorCurrentMealPlan && !currentMealPlanData && isAuthenticated && (
                  <div className="text-center py-4 px-4 bg-slate-50 rounded-md shadow-sm my-2">
                    <p className="text-lg font-semibold text-primary mb-1">本周暂无餐厨计划</p>
                    <p className="text-sm text-muted-foreground">您可以手动添加食谱到下方的日历中，或从模板加载。</p>
                  </div>
                )}
                <div className="grid grid-cols-8 gap-2">
                  {/* Header Row */}
                  <div className="p-2"></div>
                  {DAYS.map((day) => (
                    <div key={day} className="p-2 font-medium text-center">
                      {day}
                    </div>
                  ))}

                  {/* Meal Time Rows */}
                  {MEAL_TIMES.map((mealTime) => (
                    <React.Fragment key={mealTime}>
                      <div className="p-2 font-medium flex items-center">{mealTime}</div>
                      {DAYS.map((day) => {
                        const cellId = `${day}-cell-${mealTime}`
                        // Items are now directly from the Zustand store, which is populated by useQuery
                        const cellItems = items.filter((item) => item.day === day && item.mealTime === mealTime)

                        return (
                          <DroppableMealCell
                            key={cellId}
                            id={cellId}
                          >
                            <div className="flex flex-col h-full p-2">
                              <div className="flex-grow space-y-1 overflow-y-auto">
                                {cellItems.length > 0 ? (
                                  cellItems.map((planItem: StoreMealPlanItem) => (
                                    <DraggableRecipe 
                                      key={planItem.id} 
                                      id={planItem.id!} 
                                      recipe={planItem.recipe}
                                      onRemove={() => removeItem(planItem.id!)}
                                    />
                                ))
                            ) : (
                                  <div className="flex-grow flex items-center justify-center text-xs text-muted-foreground">
                                    空
                                  </div>
                                )}
                              </div>
                              <div className="mt-auto pt-1 border-t border-dashed">
                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => handleOpenAddModal(day, mealTime)}>
                                  + 添加食谱
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => handleOpenAISuggestModal(day, mealTime)}>
                                  <Wand2 className="mr-1 h-3 w-3" /> AI 建议
                                </Button>
                              </div>
                            </div>
                          </DroppableMealCell>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeId && activeRecipe && (
                <DraggableRecipe id={activeId} recipe={activeRecipe} showRemoveButton={false} />
              )}
            </DragOverlay>
          </DndContext>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                setTemplateMode("save")
                setTemplateModalOpen(true)
              }}
            >
              <Save className="h-4 w-4" />
              保存为模板
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setTemplateMode("load")
                setTemplateModalOpen(true)
              }}
            >
              <FileDown className="h-4 w-4" />
              加载模板
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => useMealPlanStore.getState().clearItems()}
            >
              <Trash2 className="h-4 w-4" />
              清空本周计划
            </Button>
            <Button 
              variant="secondary" 
              className="ml-auto"
              onClick={() => {
                // Get all recipes from current meal plan
                const mealPlanItems = useMealPlanStore.getState().items;
                if (mealPlanItems.length === 0) {
                  toast.info("当前周计划中没有食谱，无法生成购物清单。");
                  return;
                }
                
                // Navigate to shopping list page 
                router.push('/shopping-list?source=mealplan');
                toast.success("已生成本周计划的购物清单。");
              }}
            >
              生成购物清单
            </Button>
          </div>
        </div>
      </div>

      {/* Recipe Search Modal */}
      {selectedCell && (
        <RecipeSearchModal
          isOpen={searchModalOpen}
          onClose={() => {
            setSearchModalOpen(false)
            setSelectedCell(null)
          }}
          onConfirmSelection={(recipes) => selectedCell && handleAddRecipes(recipes, selectedCell.day, selectedCell.mealTime)}
          day={selectedCell.day}
          mealTime={selectedCell.mealTime}
          favoriteRecipes={favoriteRecipesData || []}
          recentRecipes={recentRecipesData || []}
          searchResults={searchResults}
          onSearch={handleSearchRecipes}
          isLoading={isLoadingFavorites || isLoadingRecent || isLoadingGeneralRecipes}
        />
      )}

      {/* Template Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        mode={templateMode}
        templates={templatesForModal} 
        onSave={handleSaveTemplate}
        onLoad={handleLoadTemplate}
      />

      <AISuggestMealModal
        isOpen={isAISuggestModalOpen}
        onClose={handleCloseAISuggestModal}
        currentMealContext={currentMealContext} 
        onMealSuggested={handleMealSuggestedFromAI}
        onNewIdeaSelected={handleNewIdeaSelectedFromAI} 
      />
    </div>
  )
}
