import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path if needed
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;

    const userRecipes = await prisma.recipe.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Optionally, include other related data if needed for the recipe cards
      // include: {
      //   categories: { include: { category: true } },
      //   tags: { include: { tag: true } },
      // }
    });

    return NextResponse.json(userRecipes, { status: 200 });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json({ message: '获取用户食谱失败' }, { status: 500 });
  }
} 