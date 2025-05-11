import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  const currentRecipeId = params.recipeId;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "3"); // Default to 3 related recipes

  try {
    // 1. Get the current recipe's categories and tags
    const currentRecipe = await prisma.recipe.findUnique({
      where: { id: currentRecipeId },
      include: {
        categories: { select: { category: { select: { id: true } } } },
        tags: { select: { tag: { select: { id: true } } } },
      },
    });

    if (!currentRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const categoryIds = currentRecipe.categories.map(
      (catOnRecipe) => catOnRecipe.category.id
    );
    const tagIds = currentRecipe.tags.map((tagOnRecipe) => tagOnRecipe.tag.id);

    // 2. Find related recipes based on shared categories or tags
    // We want recipes that have at least one common category OR one common tag.
    // We also want to exclude the current recipe itself.
    // We will order by the number of shared categories/tags (more shared = more relevant - advanced)
    // For simplicity now, just fetch some based on any match and limit.

    const relatedRecipes = await prisma.recipe.findMany({
      where: {
        AND: [
          { id: { not: currentRecipeId } }, // Exclude current recipe
          { published: true }, // Only show published recipes
          {
            OR: [
              {
                categories: {
                  some: {
                    categoryId: { in: categoryIds },
                  },
                },
              },
              {
                tags: {
                  some: {
                    tagId: { in: tagIds },
                  },
                },
              },
            ],
          },
        ],
      },
      take: limit,
      orderBy: { // Simple ordering for now, could be more sophisticated
        createdAt: 'desc', 
      },
      select: { // Select only necessary fields for a recipe card preview
        id: true,
        title: true,
        coverImage: true,
        cookingTime: true,
        difficulty: true,
        // Potentially averageRating or _count.ratings if you want to show stars
      }
    });

    return NextResponse.json(relatedRecipes);
  } catch (error) {
    console.error("Error fetching related recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch related recipes" },
      { status: 500 }
    );
  }
} 