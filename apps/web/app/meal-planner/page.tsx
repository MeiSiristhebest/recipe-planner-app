'use client';

import React, { useState, FormEvent } from 'react';

// 定义膳食计划中单日膳食的结构 (与后端一致)
interface DailyMeal {
  name: string;
  description?: string;
  calories?: number;
}

interface DailyMealPlan {
  day: number;
  meals: {
    breakfast: DailyMeal;
    lunch: DailyMeal;
    dinner: DailyMeal;
    snacks?: DailyMeal[];
  };
  dailyCalories?: number;
}

// 定义完整的膳食计划结构 (与后端一致)
interface AiMealPlan {
  title?: string;
  durationDays: number;
  targetAudience?: string;
  dailyPlans: DailyMealPlan[];
  totalCalories?: number;
  additionalTips?: string[];
}

// 定义表单数据结构
interface MealPlanFormState {
  dietaryRestrictions: string[];
  allergies: string[];
  dislikedIngredients: string[];
  healthGoal: string;
  planDurationDays: number;
  dailyCalorieTarget?: number;
  otherRequirements?: string;
}

/**
 * 膳食计划器页面组件。
 * 用户可以在此页面输入他们的饮食偏好、健康目标等信息，
 * 并获取AI生成的个性化膳食计划。
 */
export default function MealPlannerPage() {
  const [formData, setFormData] = useState<MealPlanFormState>({
    dietaryRestrictions: [],
    allergies: [],
    dislikedIngredients: [],
    healthGoal: '健康饮食',
    planDurationDays: 7,
    dailyCalorieTarget: undefined,
    otherRequirements: '',
  });
  const [mealPlan, setMealPlan] = useState<AiMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 处理表单输入变化。
   * @param e - React表单事件对象。
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      const arrayName = name.split('.')[0] as keyof Pick<MealPlanFormState, 'dietaryRestrictions' | 'allergies' | 'dislikedIngredients'>;
      const val = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        [arrayName]: checked 
          ? [...(prev[arrayName] || []), val] 
          : (prev[arrayName] || []).filter(item => item !== val),
      }));
    } else if (name === 'planDurationDays' || name === 'dailyCalorieTarget') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value, 10) : undefined,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * 处理表单提交，调用API生成膳食计划。
   * @param e - React表单提交事件对象。
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMealPlan(null);

    try {
      const response = await fetch('/api/ai/generate-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            dietaryRestrictions: formData.dietaryRestrictions,
            allergies: formData.allergies,
            dislikedIngredients: formData.dislikedIngredients,
          },
          healthGoal: formData.healthGoal,
          planDurationDays: formData.planDurationDays,
          dailyCalorieTarget: formData.dailyCalorieTarget,
          otherRequirements: formData.otherRequirements,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `请求失败，状态码：${response.status}`);
      }

      const data = await response.json();
      if (data.mealPlan) {
        setMealPlan(data.mealPlan);
      } else {
        throw new Error('未能从API获取膳食计划。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成膳食计划时发生未知错误。');
    } finally {
      setIsLoading(false);
    }
  };

  // 辅助函数，用于渲染膳食计划
  const renderMealPlan = (plan: AiMealPlan) => (
    <div className="mt-6 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{plan.title || '您的个性化膳食计划'}</h2>
      {plan.targetAudience && <p className="text-gray-600 mb-2">目标人群：{plan.targetAudience}</p>}
      <p className="text-gray-600 mb-4">计划时长：{plan.durationDays} 天</p>

      {plan.dailyPlans.map(dailyPlan => (
        <div key={dailyPlan.day} className="mb-6 p-4 border border-gray-200 rounded-md">
          <h3 className="text-xl font-semibold text-indigo-600 mb-3">第 {dailyPlan.day} 天</h3>
          {(['breakfast', 'lunch', 'dinner'] as const).map(mealType => {
            const meal = dailyPlan.meals[mealType];
            return (
              meal && (
                <div key={mealType} className="mb-3">
                  <h4 className="text-lg font-medium text-gray-700 capitalize">{mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : '晚餐'}: {meal.name}</h4>
                  {meal.description && <p className="text-sm text-gray-500">{meal.description}</p>}
                  {meal.calories && <p className="text-sm text-gray-500">约 {meal.calories} 卡路里</p>}
                </div>
              )
            );
          })}
          {dailyPlan.meals.snacks && dailyPlan.meals.snacks.length > 0 && (
            <div className="mb-3">
              <h4 className="text-lg font-medium text-gray-700">零食:</h4>
              <ul className="list-disc list-inside ml-4">
                {dailyPlan.meals.snacks.map((snack, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {snack.name}
                    {snack.description && ` (${snack.description})`}
                    {snack.calories && ` - 约 ${snack.calories} 卡路里`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dailyPlan.dailyCalories && <p className="font-medium text-gray-700 mt-2">本日总计：约 {dailyPlan.dailyCalories} 卡路里</p>}
        </div>
      ))}

      {plan.additionalTips && plan.additionalTips.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">额外提示:</h3>
          <ul className="list-disc list-inside ml-4 text-gray-600">
            {plan.additionalTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
      {plan.totalCalories && <p className="text-xl font-semibold text-gray-800 mt-4">计划总计：约 {plan.totalCalories} 卡路里</p>}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl bg-gray-50 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-600">智能膳食计划</h1>
        <p className="text-lg text-gray-600 mt-2">根据您的需求，量身定制健康美味的饮食方案。</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 md:p-8 space-y-6">
        <div>
          <label htmlFor="healthGoal" className="block text-sm font-medium text-gray-700 mb-1">健康目标</label>
          <select 
            id="healthGoal" 
            name="healthGoal" 
            value={formData.healthGoal} 
            onChange={handleInputChange} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="健康饮食">健康饮食</option>
            <option value="减脂">减脂</option>
            <option value="增肌">增肌</option>
            <option value="糖尿病友好">糖尿病友好</option>
            <option value="心脏健康">心脏健康</option>
          </select>
        </div>

        <div>
          <label htmlFor="planDurationDays" className="block text-sm font-medium text-gray-700 mb-1">计划时长 (天)</label>
          <input 
            type="number" 
            id="planDurationDays" 
            name="planDurationDays" 
            value={formData.planDurationDays} 
            onChange={handleInputChange} 
            min="1" 
            max="30" 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required 
          />
        </div>

        <div>
          <label htmlFor="dailyCalorieTarget" className="block text-sm font-medium text-gray-700 mb-1">每日目标卡路里 (可选)</label>
          <input 
            type="number" 
            id="dailyCalorieTarget" 
            name="dailyCalorieTarget" 
            value={formData.dailyCalorieTarget || ''} 
            onChange={handleInputChange} 
            min="500" 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">饮食限制 (可选)</legend>
          {['素食', '纯素', '无麸质', '低碳水', '生酮', '旧石器'].map(restriction => (
            <div key={restriction} className="flex items-center">
              <input 
                id={`restriction-${restriction}`} 
                name={`dietaryRestrictions.${restriction}`} 
                type="checkbox" 
                checked={formData.dietaryRestrictions.includes(restriction)} 
                onChange={handleInputChange} 
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor={`restriction-${restriction}`} className="ml-2 block text-sm text-gray-900">{restriction}</label>
            </div>
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">过敏原 (可选，请避开)</legend>
          {['花生', '坚果', '乳制品', '鸡蛋', '大豆', '小麦', '鱼类', '贝类', '芝麻'].map(allergy => (
            <div key={allergy} className="flex items-center">
              <input 
                id={`allergy-${allergy}`} 
                name={`allergies.${allergy}`} 
                type="checkbox" 
                checked={formData.allergies.includes(allergy)} 
                onChange={handleInputChange} 
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor={`allergy-${allergy}`} className="ml-2 block text-sm text-gray-900">{allergy}</label>
            </div>
          ))}
        </fieldset>

        <div>
          <label htmlFor="dislikedIngredientsInput" className="block text-sm font-medium text-gray-700 mb-1">不喜欢的食材 (可选，用逗号分隔)</label>
          <input 
            type="text" 
            id="dislikedIngredientsInput" 
            name="dislikedIngredientsInput" // Temporary name for direct input
            onChange={(e) => setFormData(prev => ({ ...prev, dislikedIngredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} 
            placeholder="例如：香菜, 洋葱, 苦瓜"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="otherRequirements" className="block text-sm font-medium text-gray-700 mb-1">其他特殊要求 (可选)</label>
          <textarea 
            id="otherRequirements" 
            name="otherRequirements" 
            value={formData.otherRequirements} 
            onChange={handleInputChange} 
            rows={3} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="例如：希望包含高蛋白食物，晚餐尽量简单快速等"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isLoading ? '正在生成膳食计划...' : '获取我的膳食计划'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-semibold">发生错误:</p>
          <p>{error}</p>
        </div>
      )}

      {mealPlan && renderMealPlan(mealPlan)}

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>膳食计划由AI生成，仅供参考。如有特殊健康状况，请咨询专业营养师或医生。</p>
      </footer>
    </div>
  );
}