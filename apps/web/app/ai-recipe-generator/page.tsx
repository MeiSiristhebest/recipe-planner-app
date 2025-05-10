// apps/web/app/ai-recipe-generator/page.tsx
'use client';

import { useState, FormEvent } from 'react';

/**
 * AI菜谱生成器页面组件
 * @returns JSX.Element
 */
export default function AiRecipeGeneratorPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [recipe, setRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 处理表单提交事件，调用AI菜谱生成API
   * @param event - 表单提交事件对象
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setRecipe(null);

    if (!prompt.trim()) {
      setError('请输入有效的菜谱描述或关键词。');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API请求失败，状态码: ${response.status}`);
      }

      const data = await response.json();
      if (data.recipe) {
        setRecipe(data.recipe);
      } else {
        throw new Error('从API响应中未能解析菜谱。');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('生成菜谱时发生未知错误。');
      }
      console.error('生成菜谱失败:', err);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8">AI 智能菜谱生成器</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            告诉我您想做什么菜？(例如：一份简单的鸡肉晚餐，适合工作日)
          </label>
          <textarea
            id="prompt"
            name="prompt"
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：一份包含西兰花和胡萝卜的健康素食炒饭..."
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? '正在生成中...' : '生成菜谱'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-bold">发生错误:</p>
          <p>{error}</p>
        </div>
      )}

      {recipe && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">生成的菜谱:</h2>
          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none whitespace-pre-wrap">
            {recipe}
          </div>
        </div>
      )}
    </div>
  );
}