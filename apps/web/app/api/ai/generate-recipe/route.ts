// apps/web/app/api/ai/generate-recipe/route.ts
import { NextResponse } from "next/server";

/**
 * 处理生成菜谱的POST请求
 * @param request - Next.js的请求对象，包含用户输入的菜谱生成提示
 * @returns - 返回生成的菜谱文本或错误信息
 */
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 获取API密钥
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      console.error("ARK_API_KEY is not set in environment variables");
      return NextResponse.json(
        {
          error: "API key is not configured. Please contact the administrator.",
        },
        { status: 500 }
      );
    }

    // 火山方舟API端点
    const arkApiUrl =
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

    // 构建请求体
    const requestBody = {
      messages: [
        {
          content:
            "你是一个专业的厨师，擅长创建美味的食谱。请根据用户的要求生成详细的食谱，包括材料清单和步骤说明。",
          role: "system",
        },
        {
          content: `请为我生成一道${prompt}的详细食谱，包括所需材料和详细步骤。`,
          role: "user",
        },
      ],
      // 使用火山方舟支持的模型
      model: "doubao-1-5-thinking-pro-250415",
      stream: false,
    };

    console.log(
      "Using API Key:",
      apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5)
    );
    console.log("Request Body:", JSON.stringify(requestBody));

    // 调用火山方舟API
    const response = await fetch(arkApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    // 处理API响应
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error from Ark API:", response.status, errorBody);
      return NextResponse.json(
        {
          error: `Failed to generate recipe. API Error: ${response.statusText}`,
          details: errorBody,
        },
        { status: response.status }
      );
    }

    // 解析API响应
    const data = await response.json();
    console.log(
      "API Response:",
      JSON.stringify(data).substring(0, 200) + "..."
    );

    // 从API响应中提取生成的食谱
    if (
      data.choices &&
      data.choices.length > 0 &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      // 获取原始内容
      const recipeContent = data.choices[0].message.content;

      // 确保正确处理中文字符
      return new NextResponse(JSON.stringify({ recipe: recipeContent }), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    } else {
      console.error("Unexpected response structure from Ark API:", data);
      return NextResponse.json(
        { error: "Failed to parse recipe from API response", details: data },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in generate-recipe API:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Internal Server Error", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
