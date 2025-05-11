import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'created'; // 默认获取用户创建的食谱
    
    if (type === 'favorites') {
      // 获取用户收藏的食谱
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: userId,
        },
        include: {
          recipe: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              categories: {
                include: {
                  category: true,
                },
              },
              tags: {
                include: {
                  tag: true,
                },
              },
              _count: {
                select: {
                  ratings: true,
                  favorites: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const favoriteRecipes = favorites.map(favorite => ({
        ...favorite.recipe,
        categories: favorite.recipe.categories.map(c => c.category),
        tags: favorite.recipe.tags.map(t => t.tag),
      }));

      return NextResponse.json(favoriteRecipes, { status: 200 });
    } else {
      // 获取用户创建的食谱
      const userRecipes = await prisma.recipe.findMany({
        where: {
          authorId: userId,
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              ratings: true,
              favorites: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      const formattedRecipes = userRecipes.map(recipe => ({
        ...recipe,
        categories: recipe.categories.map(c => c.category),
        tags: recipe.tags.map(t => t.tag),
      }));

      return NextResponse.json(formattedRecipes, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json({ message: '获取用户食谱失败' }, { status: 500 });
  }
} 