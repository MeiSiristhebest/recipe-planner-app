'use client';

import { useState } from 'react';

export default function TestAIPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateRecipe = async () => {
    if (!prompt) {
      alert('请输入提示词');
      return;
    }

    setIsLoading(true);
    setResult('正在生成中...');
    setStatus('');

    try {
      const startTime = Date.now();
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ prompt }),
      });

      // 确保使用UTF-8编码解析响应
      const text = await response.text();
      const data = JSON.parse(text);
      const endTime = Date.now();

      if (response.ok) {
        setResult(data.recipe);
        setStatus(`生成完成，耗时 ${(endTime - startTime) / 1000} 秒`);
      } else {
        setResult(`错误: ${data.error}\n\n详情: ${JSON.stringify(data.details, null, 2)}`);
        setStatus('生成失败');
      }
    } catch (error) {
      setResult(`请求失败: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('请求错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">测试AI食谱生成API</h1>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">输入提示词：</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md h-32"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：请推荐一道简单的鸡肉食谱"
          />
        </div>
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          onClick={generateRecipe}
          disabled={isLoading}
        >
          {isLoading ? '生成中...' : '生成食谱'}
        </button>
        <div>
          <h3 className="text-xl font-semibold mb-2">生成结果：</h3>
          <div className="p-4 border border-gray-300 rounded-md min-h-52 whitespace-pre-wrap">
            {result}
          </div>
          <div className="mt-2 text-sm italic text-gray-600">{status}</div>
        </div>
      </div>
    </div>
  );
}
