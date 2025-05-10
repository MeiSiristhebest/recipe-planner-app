// "use client" // Removed to make it a Server Component

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Import prisma directly
import type { Recipe, Favorite, MealPlan } from "@prisma/client"; // Import Recipe, Favorite, and MealPlan types

// Client-side wrapper for interactive parts
import ProfileClientContent from "./ProfileClientContent"; 

// The RecipeCard and PaginateButtons definitions can be removed from here 
// as they are now or will be fully part of ProfileClientContent.tsx

export default async function ProfilePage() { 
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/profile"); 
  }

  const userId = session.user.id;

  const user = {
    name: session.user.name || "用户",
    email: session.user.email || "无邮箱",
    avatar: session.user.image || "/placeholder.svg",
  };

  // Fetch user's own recipes directly using Prisma
  let myRecipes: Recipe[] = [];
  try {
    myRecipes = await prisma.recipe.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      // You can include categories and tags if RecipeCard needs them directly
      // include: {
      //   categories: { select: { category: { select: { name: true } } } },
      //   tags: { select: { tag: { select: { name: true } } } },
      // },
    });
  } catch (error) {
    console.error("Failed to fetch user recipes:", error);
    // Handle error appropriately, maybe pass an empty array or an error flag
  }

  let favoriteRecipes: Recipe[] = [];
  try {
    const userFavorites = await prisma.favorite.findMany({
      where: { userId: userId },
      include: {
        recipe: true, // Include the full recipe details for each favorite
                     // If you need categories/tags/ratings for favorited recipes, include them here too:
                     // recipe: {
                     //   include: {
                     //     categories: { select: { category: { select: { name: true } } } },
                     //     tags: { select: { tag: { select: { name: true } } } },
                     //     ratings: true,
                     //   }
                     // }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    favoriteRecipes = userFavorites.map(fav => fav.recipe);
  } catch (error) {
    console.error("Failed to fetch favorite recipes:", error);
  }

  // Fetch user's meal plan templates
  let mealPlanTemplates: MealPlan[] = [];
  try {
    mealPlanTemplates = await prisma.mealPlan.findMany({
      where: {
        userId: userId,
        isTemplate: true,
      },
      orderBy: {
        updatedAt: 'desc', // Show recently updated templates first
      },
      // include: { // Optional: if you need to show number of items in template preview
      //   _count: {
      //     select: { items: true },
      //   },
      // },
    });
  } catch (error) {
    console.error("Failed to fetch meal plan templates:", error);
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">个人中心</h1>

      <ProfileClientContent 
        user={user} 
        myRecipesData={myRecipes} 
        favoriteRecipesData={favoriteRecipes} 
        mealPlanTemplatesData={mealPlanTemplates} // Pass templates data
      />
    </div>
  );
}
