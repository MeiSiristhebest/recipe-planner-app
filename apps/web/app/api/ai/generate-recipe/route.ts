// apps/web/app/api/ai/generate-recipe/route.ts
import { NextResponse } from 'next/server';

/**
 * 处理生成菜谱的POST请求
 * @param request - Next.js的请求对象，包含用户输入的菜谱生成提示
 * @returns - 返回生成的菜谱文本或错误信息
 */
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      console.error('ARK_API_KEY is not set in environment variables');
      return NextResponse.json({ error: 'API key is not configured. Please contact the administrator.' }, { status: 500 });
    }

    const arkApiUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    const requestBody = {
      messages: [
        {
          content: 'You are a helpful assistant that generates creative and delicious recipes based on user prompts.',
          role: 'system',
        },
        {
          content: `Generate a recipe based on the following: ${prompt}`,
          role: 'user',
        },
      ],
      model: 'doubao-pro-32k', // 使用文档中指定的模型，或者用户提供的 doubao-1-5-pro-32k-250115，这里暂时用一个通用模型名
      stream: false, // 根据用户需求，这里设置为false以获取完整响应，如果需要流式，则改为true并相应处理
    };

    const response = await fetch(arkApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error from Ark API:', response.status, errorBody);
      return NextResponse.json({ error: `Failed to generate recipe. API Error: ${response.statusText}`, details: errorBody }, { status: response.status });
    }

    const data = await response.json();

    // 假设API成功时，响应体中 choices[0].message.content 包含生成的文本
    // 请根据实际API响应结构调整
    if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      return NextResponse.json({ recipe: data.choices[0].message.content });
    } else {
      console.error('Unexpected response structure from Ark API:', data);
      return NextResponse.json({ error: 'Failed to parse recipe from API response', details: data }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in generate-recipe API:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: 'An unknown error occurred' }, { status: 500 });
  }
}