import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Find the user's shopping list (assuming a user has one primary shopping list for now)
    // If a user can have multiple, this logic would need to be adjusted (e.g., take the latest one or a specific one)
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        userId: userId,
      },
      include: {
        items: {
          where: {
            completed: false, // Only include uncompleted items in the summary
          },
          orderBy: {
            createdAt: 'asc', // Show oldest uncompleted items first
          },
        },
      },
      orderBy: {
        updatedAt: 'desc', // If multiple lists, take the most recently updated one
      },
    });

    if (!shoppingList) {
      // No shopping list found for the user, return empty summary
      return NextResponse.json({ items: [], count: 0 });
    }

    const summaryItems = shoppingList.items.slice(0, 3); // Take first 3 uncompleted items for summary
    const totalUncompletedCount = shoppingList.items.length; // Total count of uncompleted items

    return NextResponse.json({
      items: summaryItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, category: item.category })),
      count: totalUncompletedCount,
      listId: shoppingList.id, // Optionally return listId if useful for navigation
      listName: shoppingList.name
    });

  } catch (error) {
    console.error('[API SHOPPING_LIST SUMMARY GET] Failed to fetch shopping list summary:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 