import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
// Potentially import the ARK API client or fetch logic if it's modularized
// For now, direct fetch like in generate-meal-plan is assumed

// --- Zod Schemas for suggest-meal API ---\n

const SuggestMealRequestBodySchema = z.object({
  mealTime: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  targetDate: z
    .string()
    .optional()
    .describe("ISO date string for context, e.g., 2025-12-31"),
  healthGoal: z
    .string()
    .optional()
    .describe("e.g., weightLoss, muscleGain, balancedDiet"),
  dietaryRestrictions: z
    .array(z.string())
    .optional()
    .describe("e.g., vegetarian, glutenFree"),
  allergies: z
    .array(z.string())
    .optional()
    .describe("e.g., peanuts, shellfish"),
  dislikedIngredients: z.array(z.string()).optional(),
  calorieTargetForMeal: z.number().int().positive().optional(),
  otherRequirements: z
    .string()
    .optional()
    .describe("Any other specific user requests"),
  preferExistingRecipes: z.boolean().default(true),
  // Future: Could add current ingredients on hand
});

const SuggestedMealSchema = z.object({
  suggestionType: z.enum(["existing_recipe", "new_idea"]),
  recipeId: z
    .string()
    .optional()
    .describe("ID of the recipe if suggestionType is existing_recipe"),
  name: z.string(),
  description: z.string(),
  reasoning: z.string().describe("Why AI recommends this meal"),
  estimatedNutrition: z
    .object({
      calories: z.number().int().positive().optional(),
      protein: z.number().positive().optional(),
      fat: z.number().positive().optional(),
      carbs: z.number().positive().optional(),
    })
    .optional(),
  suggestedIngredients: z
    .array(z.string())
    .optional()
    .describe("A short list of main suggested ingredients for a new idea"),
  cookingOverview: z
    .string()
    .optional()
    .describe("A brief cooking overview for a new idea"),
});

const SuggestMealResponseSchema = z.array(SuggestedMealSchema);

// --- Helper to fetch some existing recipes (simplified) ---\n
async function getRelevantExistingRecipes(params: {
  userId: string;
  healthGoal?: string;
  mealTime: "breakfast" | "lunch" | "dinner" | "snack";
  limit?: number;
}) {
  // This is a very simplified version. Real implementation would need more sophisticated filtering
  // based on tags, categories, nutrition info, and user preferences.
  // For now, let's just grab a few random recipes as placeholders.
  const recipes = await prisma.recipe.findMany({
    where: {
      // Add more sophisticated filtering here based on params
      // For example, filter by tags related to healthGoal or mealTime appropriate recipes
      published: true, // Only consider published recipes
    },
    take: params.limit || 5,
    select: {
      id: true,
      title: true,
      description: true,
      cookingTime: true,
      difficulty: true,
      nutritionInfo: true, // Assuming this is JSON and parsable
      // categories: { select: { category: { select: { name: true } } } },
      // tags: { select: { tag: { select: { name: true } } } },
    },
  });

  return recipes.map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description || "",
    // Basic parsing of nutritionInfo, assuming it contains calories at least
    calories:
      typeof r.nutritionInfo === "object" &&
      r.nutritionInfo &&
      "calories" in r.nutritionInfo
        ? (r.nutritionInfo as any).calories
        : undefined,
  }));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let requestData;
  try {
    const body = await request.json();
    requestData = SuggestMealRequestBodySchema.parse(body);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Invalid request body",
        details: (error as z.ZodError).flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const {
    mealTime,
    targetDate,
    healthGoal,
    dietaryRestrictions,
    allergies,
    dislikedIngredients,
    calorieTargetForMeal,
    otherRequirements,
    preferExistingRecipes,
  } = requestData;

  try {
    let existingRecipeContext = "";
    if (preferExistingRecipes) {
      const relevantRecipes = await getRelevantExistingRecipes({
        userId,
        healthGoal,
        mealTime,
      });
      if (relevantRecipes.length > 0) {
        existingRecipeContext =
          "Here are some existing recipes that might be suitable:\n";
        relevantRecipes.forEach((recipe: any) => {
          const descriptionSnippet =
            recipe.description && typeof recipe.description === "string"
              ? recipe.description.substring(0, 100) +
                (recipe.description.length > 100 ? "..." : "")
              : "N/A";
          existingRecipeContext += `- Name: ${recipe.title}, Description: ${descriptionSnippet} (Calories: ${recipe.calories || "N/A"}) ID: ${recipe.id}\n`;
        });
        existingRecipeContext +=
          "Please consider these first. If suitable, recommend one or more with their IDs. If not, suggest new ideas.";
      }
    }

    // --- Construct Prompt for AI ---

    let dateClause = "";
    if (targetDate) {
      dateClause = ` on ${targetDate}`;
    }

    let prompt = `You are an expert nutritionist and culinary assistant.\n    A user needs a suggestion for their ${mealTime}${dateClause}.\n    Their primary health goal is: ${healthGoal || "a balanced and healthy meal"}.`;

    if (dietaryRestrictions && dietaryRestrictions.length > 0)
      prompt += `\nDietary Restrictions: ${dietaryRestrictions.join(", ")}.`;
    if (allergies && allergies.length > 0)
      prompt += `\nAllergies: ${allergies.join(", ")}. Must avoid.`;
    if (dislikedIngredients && dislikedIngredients.length > 0)
      prompt += `\nDisliked Ingredients: ${dislikedIngredients.join(", ")}. Try to avoid.`;
    if (calorieTargetForMeal)
      prompt += `\nTarget calories for this meal: around ${calorieTargetForMeal} kcal.`;
    if (otherRequirements)
      prompt += `\nOther specific requests: ${otherRequirements}.`;

    if (existingRecipeContext) {
      prompt += `\n\n${existingRecipeContext}`;
    }

    prompt += `\n\nPlease provide 1 to 3 meal suggestions. For each suggestion, include:\n1. suggestionType: "existing_recipe" if you are recommending from the list above, or "new_idea" if it's a new concept.\n2. recipeId: The ID of the recipe if it's an "existing_recipe".\n3. name: The meal name.\n4. description: A brief description of the meal.\n5. reasoning: Why this meal is suitable for the user's needs.\n6. estimatedNutrition (optional): An object with estimated calories, protein, fat, and carbs, especially for new ideas.\n7. suggestedIngredients (optional, for "new_idea" type only): An array of 3-5 main ingredient names (e.g., ["chicken breast", "broccoli", "brown rice"]).\n8. cookingOverview (optional, for "new_idea" type only): A 1-3 sentence cooking overview (e.g., "Marinate chicken, stir-fry with broccoli, serve with steamed brown rice.").\n\nReturn your response as a VALID JSON array, adhering strictly to this structure. Example: \n[{\"suggestionType\": \"new_idea\", \"name\": \"Spicy Chicken Stir-fry\", \"description\": \"A quick and flavorful stir-fry.\", \"reasoning\": \"Fits the user criteria for a quick, spicy meal.\", \"estimatedNutrition\": {\"calories\": 500, \"protein\": 40}, \"suggestedIngredients\": [\"chicken breast\", \"bell peppers\", \"onion\", \"chili flakes\"], \"cookingOverview\": \"Slice chicken and vegetables. Stir-fry chicken until cooked, add vegetables and chili flakes. Season and serve hot.\"}, {\"suggestionType\": \"existing_recipe\", \"recipeId\": \"xyz\", \"name\": \"Grilled Chicken Salad\", \"description\": \"...\", \"reasoning\": \"...\"}]`;

    // --- Call AI Service (VolcEngine ARK) ---\n
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      console.error("ARK_API_KEY is not set");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }
    const arkApiUrl =
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
    const aiRequestBody = {
      model: "doubao-1-5-thinking-pro-250415", // 使用与generate-recipe相同的模型
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides meal suggestions in JSON format.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    };

    // 记录请求信息，便于调试
    console.log("AI Request URL:", arkApiUrl);
    console.log("AI Request Model:", aiRequestBody.model);
    console.log("AI Request Temperature:", aiRequestBody.temperature);

    const aiResponse = await fetch(arkApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(aiRequestBody),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("AI API Error:", aiResponse.status, errorBody);
      console.error("Request details:", {
        url: arkApiUrl,
        model: aiRequestBody.model,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 5) + "...",
        promptLength: prompt.length,
      });
      return NextResponse.json(
        {
          error: `AI suggestion failed: ${aiResponse.statusText}`,
          details: errorBody,
          requestInfo: {
            model: aiRequestBody.model,
            statusCode: aiResponse.status,
          },
        },
        { status: aiResponse.status }
      );
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Attempt to clean and parse JSON from AI response
    let suggestions;
    try {
      // Remove potential markdown ```json ... ```
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        content = jsonMatch[1];
      }
      const parsedContent = JSON.parse(content);
      suggestions = SuggestMealResponseSchema.parse(parsedContent);
    } catch (e) {
      console.error(
        "Failed to parse AI response as JSON or validate schema:",
        e,
        "Raw AI content:",
        content
      );
      return NextResponse.json(
        {
          error: "AI response format error",
          details: (e as Error).message,
          rawResponse: content,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("[API AI SUGGEST-MEAL POST] Error:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Error details:", error.stack);
    }
    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        path: "/api/ai/suggest-meal",
      },
      { status: 500 }
    );
  }
}
