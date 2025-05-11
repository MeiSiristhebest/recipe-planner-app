import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

const MAX_RECENTLY_VIEWED_COUNT = 5; // Define how many recently viewed recipes to fetch

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const recentlyViewed = await prisma.recentlyViewedRecipe.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        viewedAt: 'desc', // Order by most recently viewed
      },
      take: MAX_RECENTLY_VIEWED_COUNT, // Limit the number of results
      include: {
        recipe: { // Include details of the recipe
          select: {
            id: true,
            title: true,
            coverImage: true,
            cookingTime: true,
            difficulty: true,
            // Add other fields you might want to display in the summary card
            // For example, averageRating or _count for ratings, if you want to show stars
          },
        },
      },
    });

    // The result from Prisma will be an array of RecentlyViewedRecipe objects,
    // each containing a nested 'recipe' object.
    // We can map this to return just the recipe details if preferred, or return as is.
    const recipes = recentlyViewed.map(rv => rv.recipe);

    return NextResponse.json(recipes);

  } catch (error) {
    console.error('[API USERS ME RECENTLY_VIEWED GET] Failed to fetch recently viewed recipes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 