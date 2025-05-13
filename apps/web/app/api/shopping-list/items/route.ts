import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { shoppingListItemSchema } from "@repo/validators";

// 添加购物清单项
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("解析请求JSON失败:", parseError);
      return NextResponse.json({ error: "无效的JSON数据" }, { status: 400 });
    }
    
    // 检查必要字段
    if (!body.shoppingListId) {
      return NextResponse.json({ error: "缺少购物清单ID" }, { status: 400 });
    }

    // 验证购物清单所有权
    try {
      const shoppingList = await prisma.shoppingList.findUnique({
        where: { id: body.shoppingListId },
      });

      if (!shoppingList) {
        return NextResponse.json({ error: "购物清单不存在" }, { status: 404 });
      }

      if (shoppingList.userId !== session.user.id) {
        return NextResponse.json({ error: "无权访问此购物清单" }, { status: 403 });
      }
    } catch (lookupError) {
      console.error("验证购物清单所有权失败:", lookupError);
      return NextResponse.json({ error: "验证购物清单所有权失败", details: lookupError.message }, { status: 500 });
    }

    // 验证购物清单项数据
    const validationResult = shoppingListItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "验证失败", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    try {
      // 创建购物清单项
      const item = await prisma.shoppingListItem.create({
        data: {
          name: data.name,
          quantity: data.quantity,
          category: data.category,
          completed: data.completed || false,
          notes: data.notes,
          shoppingList: {
            connect: { id: body.shoppingListId },
          },
        },
      });

      return NextResponse.json(item);
    } catch (dbError) {
      console.error("创建购物清单项数据库错误:", dbError);
      return NextResponse.json(
        { error: "数据库创建失败", details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("创建购物清单项请求处理错误:", error);
    return NextResponse.json(
      { error: "创建购物清单项失败", details: error.message },
      { status: 500 }
    );
  }
} 