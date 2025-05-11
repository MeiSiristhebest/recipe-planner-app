"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Checkbox } from "@repo/ui/checkbox"; // Assuming Checkbox exists or create a simple one
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select"; // Assuming Select exists
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner";
import { type Recipe } from '@recipe-planner/types'; // For suggested recipe structure
import { Loader2, ChefHat } from 'lucide-react';

// Schema for the form inside the modal
const AISuggestionFormSchema = z.object({
  healthGoal: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  dislikedIngredients: z.array(z.string()).optional(),
  calorieTargetForMeal: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined; // 空字符串或仅含空格的字符串视为空
      if (val === null || val === undefined) return undefined;
      // 对于非空字符串，尝试转换。如果转换结果是 NaN (例如 "abc"), 
      // Number(val) 会返回 NaN，后续 z.number() 会捕获并用 invalid_type_error。
      // 如果是有效的数字字符串 (例如 "123")，Number(val) 会返回数字。
      // 如果已经是数字，则直接返回。
      return Number(val); 
    },
    z.number({
      invalid_type_error: "请输入有效的数字",
    }).positive({ message: "热量必须是正数" }).optional()
  ),
  otherRequirements: z.string().optional(),
  preferExistingRecipes: z.boolean().default(true),
});

type AISuggestionFormData = z.infer<typeof AISuggestionFormSchema>;

export interface SuggestedMeal {
  suggestionType: "existing_recipe" | "new_idea";
  recipeId?: string;
  name: string;
  description: string;
  reasoning: string;
  estimatedNutrition?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
  suggestedIngredients?: string[];
  cookingOverview?: string;
}

interface AISuggestMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMealContext: {
    date: Date;
    mealTime: string;
  } | null;
  onMealSuggested: (meal: SuggestedMeal, context: { date: Date; mealTime: string }) => void;
  onNewIdeaSelected?: (idea: SuggestedMeal, context: { date: Date; mealTime: string }) => void;
}

// API function to fetch AI suggestions
async function fetchAISuggestionsAPI(payload: any): Promise<SuggestedMeal[]> {
  const response = await fetch('/api/ai/suggest-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '获取 AI 建议失败');
  }
  return response.json();
}

export function AISuggestMealModal({ 
  isOpen, 
  onClose, 
  currentMealContext,
  onMealSuggested,
  onNewIdeaSelected
}: AISuggestMealModalProps) {
  const [suggestions, setSuggestions] = useState<SuggestedMeal[]>([]);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<AISuggestionFormData>({
    resolver: zodResolver(AISuggestionFormSchema),
    defaultValues: {
      healthGoal: '',
      dietaryRestrictions: [],
      allergies: [],
      dislikedIngredients: [],
      calorieTargetForMeal: undefined, // Explicitly set to undefined
      preferExistingRecipes: true,
      otherRequirements: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ // Reset with explicit undefined for optional number field
        healthGoal: '',
        dietaryRestrictions: [],
        allergies: [],
        dislikedIngredients: [],
        calorieTargetForMeal: undefined,
        preferExistingRecipes: true,
        otherRequirements: '',
      }); 
      setSuggestions([]); // Clear previous suggestions
    }
    // Pre-fill form with user profile data if available and isOpen
    // if (isOpen && userProfile) {
    //   reset({
    //     healthGoal: userProfile.healthGoal || '',
    //     dietaryRestrictions: userProfile.dietaryRestrictions || [],
    //     allergies: userProfile.allergies || [],
    //     // ... other fields
    //   });
    // }
  }, [isOpen, reset]);

  const suggestMealMutation = useMutation<SuggestedMeal[], Error, AISuggestionFormData>({
    mutationFn: (data) => {
      if (!currentMealContext) throw new Error('缺少膳食上下文信息');
      const payload = {
        ...data,
        mealTime: currentMealContext.mealTime.toLowerCase(), // Ensure mealTime is lowercase enum
        targetDate: currentMealContext.date.toISOString().split('T')[0], // Format date to YYYY-MM-DD
        calorieTargetForMeal: data.calorieTargetForMeal ? Number(data.calorieTargetForMeal) : undefined,
      };
      return fetchAISuggestionsAPI(payload);
    },
    onSuccess: (data) => {
      setSuggestions(data);
      if (data.length === 0) {
        toast.info("根据您的标准，AI 未能找到任何具体的建议。");
      } else {
        toast.success('AI 建议已加载！');
      }
    },
    onError: (error) => {
      toast.error(`错误: ${error.message}`);
      setSuggestions([]);
    },
  });

  const onSubmit = (data: AISuggestionFormData) => {
    suggestMealMutation.mutate(data);
  };

  const handleSelectSuggestion = (suggestion: SuggestedMeal) => {
    if (currentMealContext) {
      if (suggestion.suggestionType === 'new_idea' && onNewIdeaSelected) {
        onNewIdeaSelected(suggestion, currentMealContext);
      } else {
        onMealSuggested(suggestion, currentMealContext);
      }
      onClose(); // Close modal after selection
    }
  };

  if (!isOpen || !currentMealContext) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>为 {currentMealContext.date.toLocaleDateString()} 的 {currentMealContext.mealTime} 提供的 AI 膳食建议</DialogTitle>
          <DialogDescription>
            告诉我们您的偏好，我们的 AI 将会推荐一些膳食想法。
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="healthGoal">健康目标 (例如：减重，增肌)</Label>
              <Input id="healthGoal" {...register("healthGoal")} />
            </div>

            <div>
              <Label htmlFor="calorieTargetForMeal">本餐目标热量 (可选)</Label>
              <Input id="calorieTargetForMeal" type="number" {...register("calorieTargetForMeal")} />
               {errors.calorieTargetForMeal && <p className="text-sm text-red-500">{errors.calorieTargetForMeal.message}</p>}
            </div>

            <div>
              <Label>饮食限制 (例如：素食，无麸质) - 逗号分隔</Label>
              <Controller
                name="dietaryRestrictions"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])} 
                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    placeholder="例如：素食，无麸质"
                  />
                )}
              />
            </div>
            
            <div>
              <Label>过敏原 (例如：花生，贝类) - 逗号分隔</Label>
              <Controller
                name="allergies"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])} 
                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    placeholder="例如：花生，贝类"
                  />
                )}
              />
            </div>

            <div>
              <Label>不喜欢的食材 - 逗号分隔</Label>
              <Controller
                name="dislikedIngredients"
                control={control}
                render={({ field }) => (
                  <Input 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])} 
                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    placeholder="例如：香菜，蘑菇"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="otherRequirements">其他特殊要求</Label>
              <Input id="otherRequirements" {...register("otherRequirements")} />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                  name="preferExistingRecipes"
                  control={control}
                  render={({ field }) => (
                      <Checkbox 
                          id="preferExistingRecipes" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                      />
                  )}
              />
              <Label htmlFor="preferExistingRecipes">优先推荐我的收藏中的食谱</Label>
            </div>

            <Button type="submit" disabled={suggestMealMutation.isPending} className="w-full">
              {suggestMealMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              获取 AI 建议
            </Button>
          </form>

          {suggestMealMutation.isSuccess && suggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">AI 建议：</h3>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-slate-50">
                    <h4 className="text-md font-semibold text-slate-800 mb-1 flex items-center">
                      <ChefHat className="mr-2 h-5 w-5 text-primary" />
                      {suggestion.name}
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">{suggestion.description}</p>
                    
                    {suggestion.reasoning && (
                        <p className="text-xs text-slate-500 mb-2">
                            <span className="font-semibold">推荐理由：</span> {suggestion.reasoning}
                        </p>
                    )}
                    
                    {suggestion.estimatedNutrition && (
                      <div className="text-xs text-slate-500 mb-2">
                        <p className="font-semibold">预估营养 (每份)：</p>
                        <ul className="list-disc list-inside pl-1">
                          {suggestion.estimatedNutrition.calories && <li>热量： {suggestion.estimatedNutrition.calories} kcal</li>}
                          {suggestion.estimatedNutrition.protein && <li>蛋白质： {suggestion.estimatedNutrition.protein} g</li>}
                          {suggestion.estimatedNutrition.fat && <li>脂肪： {suggestion.estimatedNutrition.fat} g</li>}
                          {suggestion.estimatedNutrition.carbs && <li>碳水： {suggestion.estimatedNutrition.carbs} g</li>}
                        </ul>
                      </div>
                    )}

                    {suggestion.suggestedIngredients && suggestion.suggestedIngredients.length > 0 && (
                        <div className="text-xs text-slate-500 mb-2">
                            <p className="font-semibold">核心食材：</p>
                            <p>{suggestion.suggestedIngredients.join(', ')}</p>
                        </div>
                    )}

                    {suggestion.cookingOverview && (
                        <div className="text-xs text-slate-500 mb-2">
                            <p className="font-semibold">烹饪概要：</p>
                            <p>{suggestion.cookingOverview}</p>
                        </div>
                    )}

                    <Button 
                      size="sm"
                      onClick={() => handleSelectSuggestion(suggestion)} 
                      className="w-full mt-2"
                    >
                      {suggestion.suggestionType === 'existing_recipe' ? '使用此食谱' : '基于此想法创建新食谱'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {suggestMealMutation.isPending && (
            <div className="flex justify-center items-center mt-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-slate-500">AI 正在努力思考中...</p>
            </div>
          )}
          {suggestMealMutation.isSuccess && suggestions.length === 0 && !suggestMealMutation.isPending && (
            <div className="text-center mt-6 text-slate-500">
              <ChefHat className="mx-auto h-12 w-12 text-slate-400 mb-2" />
              <p>AI 暂时没有找到合适的建议。</p>
              <p className="text-xs">请尝试调整您的偏好条件，或稍后再试。</p>
            </div>
          )}
        </div>
        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 