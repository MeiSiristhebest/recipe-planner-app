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
    const templates = await prisma.mealPlan.findMany({
      where: {
        userId: userId,
        isTemplate: true, // 只获取模板
      },
      include: {
        items: { // 包含模板中的项目
          orderBy: { 
            date: 'asc', // 按日期排序（尽管模板中的日期可能意义不大）
          },
          include: {
            recipe: { // 包含项目关联的食谱信息（只需部分）
              select: {
                id: true,
                title: true,
                coverImage: true,
                // 可能还需要 difficulty, cookingTime 等，取决于加载模板时需要显示什么
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc', // 按模板名称排序
      },
    });

    // 注意：这里的 items 包含了 recipe 对象。
    // 前端加载模板时，需要确保 store 或组件能处理这种嵌套结构。
    return NextResponse.json(templates);

  } catch (error) {
    console.error('[API MEAL_PLANS TEMPLATES GET] Failed to fetch meal plan templates:', error);
    return NextResponse.json({ message: 'Internal Server Error fetching templates' }, { status: 500 });
  }
} 