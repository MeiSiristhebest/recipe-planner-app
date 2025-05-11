import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

interface PostParams {
  params: {
    recipeId: string;
  };
}

export async function POST(request: Request, { params }: PostParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { recipeId } = params;

  if (!recipeId) {
    return NextResponse.json({ message: 'Recipe ID is required' }, { status: 400 });
  }

  try {
    // Check if the recipe exists to avoid logging views for non-existent recipes
    const recipeExists = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true }, // Only select id, we just need to know if it exists
    });

    if (!recipeExists) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 });
    }

    // Upsert the recently viewed record.
    // If a record for this user and recipe already exists, update its viewedAt timestamp.
    // Otherwise, create a new record.
    await prisma.recentlyViewedRecipe.upsert({
      where: {
        userId_recipeId: {
          userId: userId,
          recipeId: recipeId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId: userId,
        recipeId: recipeId,
        viewedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Recipe view logged successfully' }, { status: 200 });
  } catch (error) {
    console.error(`[API RECIPE VIEW POST /api/recipes/${recipeId}/view] Failed to log recipe view:`, error);
    // Check for specific Prisma errors if needed, e.g., foreign key constraint
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 