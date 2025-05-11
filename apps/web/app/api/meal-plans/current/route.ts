import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, parseISO } from 'date-fns';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 假设周一为一周的开始
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  try {
    const currentMealPlan = await prisma.mealPlan.findFirst({
      where: {
        userId: userId,
        // Check if the plan overlaps with the current week.
        // A plan is current if its start date is before or on the week's end,
        // AND its end date is after or on the week's start.
        // This also covers plans that span across the current week.
        startDate: {
          lte: weekEnd,
        },
        endDate: {
          gte: weekStart,
        },
        isTemplate: false, // We only want active plans, not templates
      },
      include: {
        items: { // Include the meal plan items
          orderBy: { 
            date: 'asc' // Order items by date
          },
          include: {
            recipe: { // Include minimal recipe details for each item
              select: {
                id: true,
                title: true,
                coverImage: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // If multiple plans match, take the most recently created one
      }
    });

    if (!currentMealPlan) {
      return NextResponse.json({ message: 'No current meal plan found for this week.' }, { status: 404 });
    }

    return NextResponse.json(currentMealPlan);
  } catch (error) {
    console.error('[API MEAL_PLANS CURRENT GET] Failed to fetch current meal plan:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 