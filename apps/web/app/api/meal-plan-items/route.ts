import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Zod schema for validating the request body
const addMealPlanItemSchema = z.object({
  mealPlanId: z.string().cuid(),
  recipeId: z.string().cuid(),
  date: z.string().datetime(), // Expect ISO string
  mealTime: z.enum(["Breakfast", "Lunch", "Dinner"]), // Matches MealTime enum in Prisma (adjust if different)
  servings: z.number().int().min(1).optional().default(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = addMealPlanItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "请求数据验证失败", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { mealPlanId, recipeId, date, mealTime, servings } = validationResult.data;

    // Check if the meal plan exists and belongs to the current user
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
    });

    if (!mealPlan) {
      return NextResponse.json({ error: "指定的周计划不存在" }, { status: 404 });
    }

    if (mealPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "无权操作此周计划" }, { status: 403 });
    }
    
    // Check if the recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json({ error: "指定的食谱不存在" }, { status: 404 });
    }

    // Check for existing item at the same date and mealTime for this meal plan
    const existingItem = await prisma.mealPlanItem.findFirst({
      where: {
        mealPlanId: mealPlanId,
        date: new Date(date),
        mealTime: mealTime,
      }
    });

    if (existingItem) {
      // Option 1: Error out
      // return NextResponse.json({ error: "该日期和餐次已存在食谱，请先移除或修改" }, { status: 409 });
      // Option 2: Update existing item (more complex, decide based on product needs)
      // For now, let's assume we don't allow overwriting and error out.
      // If you want to update, you would use prisma.mealPlanItem.update here.
      return NextResponse.json({ error: `该日期和餐次的 "${existingItem.mealTime}" 已被食谱占用。请选择其他时间或先移除现有食谱。` }, { status: 409 });
    }


    // Create the new meal plan item
    const newMealPlanItem = await prisma.mealPlanItem.create({
      data: {
        mealPlanId,
        recipeId,
        date: new Date(date), // Ensure date is stored as DateTime
        mealTime,
        servings,
      },
      include: { // Optionally include related data in the response
        recipe: {
          select: { id: true, title: true, coverImage: true }
        }
      }
    });

    return NextResponse.json(newMealPlanItem, { status: 201 });

  } catch (error) {
    console.error("Error adding meal plan item:", error);
    if (error instanceof z.ZodError) { // Should be caught by safeParse, but as a fallback
      return NextResponse.json({ error: "请求数据格式错误", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "添加食谱到周计划失败，请稍后再试" }, { status: 500 });
  }
} 