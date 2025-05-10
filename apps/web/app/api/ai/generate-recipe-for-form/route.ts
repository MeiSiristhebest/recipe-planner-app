import { NextResponse } from 'next/server';
import { z } from 'zod';

// 模拟AI服务响应的菜谱数据结构
const AiRecipeSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  cookingTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  difficulty: z.enum(['简单', '中等', '困难']).optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    category: z.string().optional(),
  })).optional(),
  instructions: z.array(z.object({
    step: z.number().int().positive(),
    content: z.string(),
    imageUrl: z.string().optional(),
  })).optional(),
  // nutritionInfo: z.record(z.number()).optional(), // 示例，根据实际需要调整
  // categoryIds: z.array(z.string()).optional(), // 示例
  // tagIds: z.array(z.string()).optional(), // 示例
  coverImage: z.string().optional(),
});

const RequestBodySchema = z.object({
  prompt: z.string().min(1, { message: '提示词不能为空' }),
});

/**
 * 处理AI生成结构化菜谱数据的请求。
 * @param request - Next.js API请求对象。
 * @returns Next.js API响应，包含生成的菜谱数据或错误信息。
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = RequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '请求参数无效', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { prompt } = validationResult.data;

    // --- 模拟AI生成逻辑 ---
    // 在实际应用中，这里会调用真正的AI模型服务 (例如 OpenAI, Google Gemini, etc.)
    // 并根据AI模型的输出，将其转换为 AiRecipeSchema 定义的结构
    console.log(`AI正在根据提示生成菜谱: "${prompt}"`);

    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模拟AI返回的结构化菜谱数据
    // 这个示例会根据提示词简单地填充一些内容
    let generatedRecipe: z.infer<typeof AiRecipeSchema> = {
      title: `AI生成的：${prompt.substring(0, 20)}`, 
      description: `这是一份根据您的提示“${prompt}”由AI智能生成的美味菜谱。它包含了精心挑选的食材和详细的步骤，希望能帮助您轻松制作出可口的佳肴。`,
      cookingTime: 30,
      servings: 2,
      difficulty: '中等',
      ingredients: [
        { name: '主要食材 (根据提示)', quantity: '适量' },
        { name: '调味料 (根据提示)', quantity: '少许' },
      ],
      instructions: [
        { step: 1, content: '准备好所有根据提示“' + prompt + '”所需的食材。' },
        { step: 2, content: '按照AI的神秘指示进行烹饪。' },
        { step: 3, content: '享受AI为您定制的美味！' },
      ],
    };

    // 尝试从提示中提取一些关键词来丰富菜谱内容 (非常基础的示例)
    if (prompt.toLowerCase().includes('鸡肉')) {
      generatedRecipe.title = `AI推荐：美味鸡肉料理 - ${prompt.substring(0,15)}`;
      generatedRecipe.ingredients?.unshift({ name: '鸡胸肉', quantity: '200克' });
    }
    if (prompt.toLowerCase().includes('沙拉')) {
      generatedRecipe.difficulty = '简单';
      generatedRecipe.ingredients?.push({ name: '新鲜生菜', quantity: '1把' });
      generatedRecipe.instructions?.splice(1,0, {step: 2, content: '将所有食材清洗干净，切好备用。'});
       // 重新编号步骤
      generatedRecipe.instructions = generatedRecipe.instructions?.map((inst, idx) => ({...inst, step: idx + 1}));
    }
     if (prompt.toLowerCase().includes('牛肉')) {
      generatedRecipe.title = `AI推荐：香煎牛肉 - ${prompt.substring(0,15)}`;
      generatedRecipe.ingredients?.unshift({ name: '牛肉', quantity: '300克' });
      generatedRecipe.cookingTime = 20;
    }

    // --- AI生成逻辑结束 ---

    return NextResponse.json({ recipe: generatedRecipe });

  } catch (error) {
    console.error('AI菜谱生成API出错:', error);
    let errorMessage = 'AI菜谱生成失败，请稍后再试。';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}