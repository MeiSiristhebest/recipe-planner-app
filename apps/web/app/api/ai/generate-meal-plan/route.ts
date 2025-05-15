import { NextResponse } from "next/server";
import { z } from "zod";

// 定义AI膳食计划中单日膳食的结构
const DailyMealPlanSchema = z.object({
  day: z.number().int().positive(),
  meals: z.object({
    breakfast: z.object({
      name: z.string(),
      description: z.string().optional(),
      calories: z.number().int().positive().optional(),
    }),
    lunch: z.object({
      name: z.string(),
      description: z.string().optional(),
      calories: z.number().int().positive().optional(),
    }),
    dinner: z.object({
      name: z.string(),
      description: z.string().optional(),
      calories: z.number().int().positive().optional(),
    }),
    snacks: z
      .array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          calories: z.number().int().positive().optional(),
        })
      )
      .optional(),
  }),
  dailyCalories: z.number().int().positive().optional(),
});

// 定义AI生成的完整膳食计划的结构
const AiMealPlanSchema = z.object({
  title: z.string().optional(),
  durationDays: z.number().int().positive(),
  targetAudience: z.string().optional(), // 例如：减脂人群、增肌人群、素食者
  dailyPlans: z.array(DailyMealPlanSchema),
  totalCalories: z.number().int().positive().optional(),
  additionalTips: z.array(z.string()).optional(),
});

// 定义API请求体的结构
const RequestBodySchema = z.object({
  preferences: z.object({
    dietaryRestrictions: z.array(z.string()).optional(), // 如：素食, 无麸质, 低碳水
    allergies: z.array(z.string()).optional(), // 如：花生, 海鲜
    dislikedIngredients: z.array(z.string()).optional(),
  }),
  healthGoal: z.string().min(1, { message: "健康目标不能为空" }), // 如：减脂, 增肌, 健康饮食
  planDurationDays: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(30, { message: "计划时长必须在1到30天之间" }),
  dailyCalorieTarget: z.number().int().positive().optional(),
  otherRequirements: z.string().optional(), // 其他用户输入的具体要求
});

/**
 * 处理AI生成膳食计划的请求。
 * @param request - Next.js API请求对象，包含用户的饮食偏好、健康目标和计划时长等信息。
 * @returns Next.js API响应，包含生成的膳食计划数据或错误信息。
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = RequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "请求参数无效",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      preferences,
      healthGoal,
      planDurationDays,
      dailyCalorieTarget,
      otherRequirements,
    } = validationResult.data;

    // --- 构建调用AI模型的提示词 ---
    let prompt = `请为我制定一个为期 ${planDurationDays} 天的膳食计划。
我的健康目标是：${healthGoal}。`;

    if (
      preferences.dietaryRestrictions &&
      preferences.dietaryRestrictions.length > 0
    ) {
      prompt += `\n饮食偏好：${preferences.dietaryRestrictions.join(", ")}。`;
    }
    if (preferences.allergies && preferences.allergies.length > 0) {
      prompt += `\n我过敏的食物有：${preferences.allergies.join(", ")}，请务必避开。`;
    }
    if (
      preferences.dislikedIngredients &&
      preferences.dislikedIngredients.length > 0
    ) {
      prompt += `\n我不喜欢吃的食材有：${preferences.dislikedIngredients.join(", ")}，请尽量避免使用。`;
    }
    if (dailyCalorieTarget) {
      prompt += `\n我希望每日的卡路里摄入量在 ${dailyCalorieTarget} 卡左右。`;
    }
    if (otherRequirements) {
      prompt += `\n其他特殊要求：${otherRequirements}。`;
    }

    prompt +=
      "\n请确保计划包含每日的早餐、午餐、晚餐，并可以酌情添加一些健康的零食。";
    prompt += "\n请以JSON格式返回膳食计划，严格遵循以下TypeScript类型定义：";
    prompt +=
      "\n```typescript\n" +
      JSON.stringify(AiMealPlanSchema.shape, null, 2) +
      "\n```";
    prompt += "\n确保返回的JSON对象可以直接被解析为 AiMealPlan 类型。";

    console.log(`AI正在根据以下提示生成膳食计划:\n${prompt}`);

    // --- 模拟AI生成逻辑 (实际应用中替换为真实AI调用) ---
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      console.error("ARK_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "AI服务未配置，请联系管理员。" },
        { status: 500 }
      );
    }

    const arkApiUrl =
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

    const requestBodyForAI = {
      messages: [
        {
          content:
            "你是一个专业的营养师和厨师，擅长根据用户需求制定详细、健康且美味的膳食计划。请严格按照用户提供的格式要求返回结果。",
          role: "system",
        },
        {
          content: prompt,
          role: "user",
        },
      ],
      model: "doubao-1-5-thinking-pro-250415", // 使用与generate-recipe相同的模型
      stream: false,
      temperature: 0.7, // 可以调整以获得不同创意的结果
      // 火山方舟API可能不支持response_format参数，移除以避免请求错误
    };

    const aiResponse = await fetch(arkApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBodyForAI),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("火山方舟AI API错误:", aiResponse.status, errorBody);
      return NextResponse.json(
        {
          error: `AI膳食计划生成失败，API错误: ${aiResponse.statusText}`,
          details: errorBody,
        },
        { status: aiResponse.status }
      );
    }

    const aiData = await aiResponse.json();

    let mealPlanContent = "";
    if (
      aiData.choices &&
      aiData.choices.length > 0 &&
      aiData.choices[0].message &&
      aiData.choices[0].message.content
    ) {
      mealPlanContent = aiData.choices[0].message.content;
    } else {
      console.error("从火山方舟AI API获取的响应结构意外:", aiData);
      return NextResponse.json(
        { error: "AI未能生成有效的膳食计划内容。", details: aiData },
        { status: 500 }
      );
    }

    // 尝试解析AI返回的JSON字符串
    let generatedMealPlan: z.infer<typeof AiMealPlanSchema>;
    try {
      // 有时AI返回的JSON可能被包裹在markdown代码块中，尝试提取
      const jsonMatch = mealPlanContent.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        mealPlanContent = jsonMatch[1];
      }
      generatedMealPlan = JSON.parse(mealPlanContent);
      // 进一步使用Zod进行验证，确保结构符合预期
      const planValidationResult =
        AiMealPlanSchema.safeParse(generatedMealPlan);
      if (!planValidationResult.success) {
        console.error(
          "AI生成的膳食计划结构校验失败:",
          planValidationResult.error.flatten()
        );
        return NextResponse.json(
          {
            error: "AI生成的膳食计划格式不正确，无法解析。",
            details: planValidationResult.error.flatten().fieldErrors,
          },
          { status: 500 }
        );
      }
      generatedMealPlan = planValidationResult.data; // 使用经过验证和转换的数据
    } catch (parseError) {
      console.error(
        "解析AI返回的膳食计划JSON失败:",
        parseError,
        "\n原始AI响应内容:",
        mealPlanContent
      );
      return NextResponse.json(
        {
          error: "AI返回的膳食计划格式错误，无法解析。",
          details: (parseError as Error).message,
          rawResponse: mealPlanContent,
        },
        { status: 500 }
      );
    }
    // --- AI生成逻辑结束 ---

    return NextResponse.json({ mealPlan: generatedMealPlan });
  } catch (error) {
    console.error("AI膳食计划生成API出错:", error);
    let errorMessage = "AI膳食计划生成失败，请稍后再试。";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
