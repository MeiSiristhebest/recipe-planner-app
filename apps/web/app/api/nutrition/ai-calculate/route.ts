import { NextResponse } from "next/server";

interface Ingredient {
  name: string;
  quantity: string | number;
  unit?: string;
  category?: string;
}

interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

/**
 * 使用AI计算食材的营养成分
 * @param request 包含食材列表和份数的请求
 * @returns 营养成分信息
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ingredients, servings = 1 } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "请提供有效的食材列表" }, { status: 400 });
    }

    // 获取API密钥
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      console.error("ARK_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "AI服务未配置，请联系管理员。" },
        { status: 500 }
      );
    }

    // 火山方舟API端点
    const arkApiUrl = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

    // 构建提示词，要求AI分析食材营养成分
    const ingredientsText = ingredients
      .map((ing: Ingredient) => `${ing.name}: ${ing.quantity}${ing.unit || ""}`)
      .join("\n");

    const aiPrompt = `
你是一个专业的营养师，擅长分析食材的营养成分。请根据以下食材列表，计算出总的营养成分。

食材列表（总共${servings}份）:
${ingredientsText}

请分析这些食材的营养成分，并以JSON格式返回以下信息:
1. 总热量 (calories): 单位为千卡(kcal)
2. 蛋白质 (protein): 单位为克(g)
3. 脂肪 (fat): 单位为克(g)
4. 碳水化合物 (carbs): 单位为克(g)
5. 膳食纤维 (fiber): 单位为克(g)
6. 糖 (sugar): 单位为克(g)
7. 钠 (sodium): 单位为毫克(mg)

同时，请提供每份的营养成分（总量除以${servings}）。

请以JSON格式返回，确保格式正确可解析。不要包含任何额外的解释或文本，只返回JSON对象。
`;

    // 构建请求体
    const requestBody = {
      messages: [
        {
          content: "你是一个专业的营养师，擅长分析食材的营养成分并提供准确的营养数据。请严格按照要求的JSON格式返回结果。",
          role: "system",
        },
        {
          content: aiPrompt,
          role: "user",
        },
      ],
      model: "doubao-1-5-thinking-pro-250415",
      stream: false,
      temperature: 0.3, // 使用较低的温度以获得更确定性的结果
    };

    console.log("AI营养计算请求模型:", requestBody.model);

    // 调用火山方舟API
    const aiResponse = await fetch(arkApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("火山方舟AI API错误:", aiResponse.status, errorBody);
      return NextResponse.json(
        {
          error: `AI营养计算失败，API错误: ${aiResponse.statusText}`,
          details: errorBody,
        },
        { status: aiResponse.status }
      );
    }

    const aiData = await aiResponse.json();

    let nutritionContent = "";
    if (
      aiData.choices &&
      aiData.choices.length > 0 &&
      aiData.choices[0].message &&
      aiData.choices[0].message.content
    ) {
      nutritionContent = aiData.choices[0].message.content;
    } else {
      console.error("从火山方舟AI API获取的响应结构意外:", aiData);
      return NextResponse.json(
        { error: "AI未能生成有效的营养分析内容。", details: aiData },
        { status: 500 }
      );
    }

    // 尝试解析AI返回的JSON字符串
    try {
      // 有时AI返回的JSON可能被包裹在markdown代码块中，尝试提取
      const jsonMatch = nutritionContent.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        nutritionContent = jsonMatch[1];
      }

      // 尝试解析JSON
      const parsedNutrition = JSON.parse(nutritionContent);

      // 确保返回的数据包含必要的字段
      const totalNutrition: NutritionInfo = {
        calories: parsedNutrition.totalNutrition?.calories || parsedNutrition.calories || 0,
        protein: parsedNutrition.totalNutrition?.protein || parsedNutrition.protein || 0,
        fat: parsedNutrition.totalNutrition?.fat || parsedNutrition.fat || 0,
        carbs: parsedNutrition.totalNutrition?.carbs || parsedNutrition.carbs || 0,
        fiber: parsedNutrition.totalNutrition?.fiber || parsedNutrition.fiber || 0,
        sugar: parsedNutrition.totalNutrition?.sugar || parsedNutrition.sugar || 0,
        sodium: parsedNutrition.totalNutrition?.sodium || parsedNutrition.sodium || 0,
      };

      // 如果AI提供了每份营养成分，使用它；否则，计算每份营养成分
      let perServingNutrition: NutritionInfo;
      if (parsedNutrition.perServingNutrition) {
        perServingNutrition = parsedNutrition.perServingNutrition;
      } else {
        perServingNutrition = {
          calories: totalNutrition.calories / servings,
          protein: totalNutrition.protein / servings,
          fat: totalNutrition.fat / servings,
          carbs: totalNutrition.carbs / servings,
          fiber: (totalNutrition.fiber || 0) / servings,
          sugar: (totalNutrition.sugar || 0) / servings,
          sodium: (totalNutrition.sodium || 0) / servings,
        };
      }

      // 四舍五入结果
      const roundedTotalNutrition = roundNutritionValues(totalNutrition);
      const roundedPerServingNutrition = roundNutritionValues(perServingNutrition);

      return NextResponse.json({
        totalNutrition: roundedTotalNutrition,
        perServingNutrition: roundedPerServingNutrition,
        servings,
        aiGenerated: true,
      });
    } catch (parseError) {
      console.error(
        "解析AI返回的营养JSON失败:",
        parseError,
        "\n原始AI响应内容:",
        nutritionContent
      );

      // 创建一个基本的营养结构作为后备
      return NextResponse.json(
        { 
          error: "解析AI返回的营养数据失败", 
          details: parseError instanceof Error ? parseError.message : String(parseError),
          rawContent: nutritionContent
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("AI营养计算API出错:", error);
    let errorMessage = "AI营养计算失败，请稍后再试。";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * 四舍五入营养值
 */
function roundNutritionValues(nutrition: NutritionInfo): NutritionInfo {
  return {
    calories: Math.round(nutrition.calories * 10) / 10,
    protein: Math.round(nutrition.protein * 10) / 10,
    fat: Math.round(nutrition.fat * 10) / 10,
    carbs: Math.round(nutrition.carbs * 10) / 10,
    fiber: nutrition.fiber !== undefined ? Math.round(nutrition.fiber * 10) / 10 : undefined,
    sugar: nutrition.sugar !== undefined ? Math.round(nutrition.sugar * 10) / 10 : undefined,
    sodium: nutrition.sodium !== undefined ? Math.round(nutrition.sodium * 10) / 10 : undefined,
  };
}
