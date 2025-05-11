"use client"

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
// import { Calendar } from "@repo/ui/calendar"; // For later use with react-day-picker
// import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover"; // For Calendar
import { Loader2, CalendarIcon } from "lucide-react";
import { type Recipe } from "@recipe-planner/types"; // Assuming base Recipe type is sufficient
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Uncommented useQueryClient

interface AddToMealPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Pick<Recipe, "id" | "title" | "servings"> | null; // Essential recipe info
  onSuccess?: () => void;
}

// Placeholder for API response types
interface MealPlanBasicInfo {
  id: string;
  name: string | null;
  // Optionally include startDate and endDate if useful for display
  startDate?: string | null; 
  endDate?: string | null;
}

async function fetchUserMealPlans(): Promise<MealPlanBasicInfo[]> {
  // Fetch non-template meal plans, with a simple view
  const response = await fetch("/api/meal-plans?view=simple&isTemplate=false"); 
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "获取用户的周计划列表失败");
  }
  return response.json();
}

async function addItemToMealPlan(payload: {
  mealPlanId: string;
  recipeId: string;
  date: string; // ISO string
  mealTime: string;
  servings: number;
}): Promise<any> {
  const response = await fetch("/api/meal-plan-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "添加到周计划失败");
  }
  return response.json();
}

export function AddToMealPlanDialog({
  open,
  onOpenChange,
  recipe,
  onSuccess,
}: AddToMealPlanDialogProps) {
  const queryClient = useQueryClient(); // Added queryClient
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMealTime, setSelectedMealTime] = useState<string>("Lunch");
  const [servings, setServings] = useState<number>(recipe?.servings || 1);
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | null>(null); // For displaying API errors
  
  // const [isCalendarOpen, setIsCalendarOpen] = useState(false); // For Popover Calendar

  const { data: mealPlans, isLoading: isLoadingPlans, error: plansError } = useQuery<MealPlanBasicInfo[], Error>({
    queryKey: ['userMealPlansBasic'],
    queryFn: fetchUserMealPlans,
    enabled: open, // Fetch when dialog opens
  });

  const addItemMutation = useMutation({
    mutationFn: addItemToMealPlan,
    onSuccess: (data) => {
      onOpenChange(false);
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] }); // Invalidate all meal plans
      queryClient.invalidateQueries({ queryKey: ['mealPlanDetails', selectedMealPlanId] }); // Invalidate specific meal plan if detailed view exists
      // Potentially show a success toast here
      console.log("Successfully added to meal plan", data);
      setApiError(null);
    },
    onError: (error) => {
      setApiError((error as Error).message || "添加到周计划失败，请检查后重试。");
      console.error("Error adding to meal plan:", error);
    }
  });

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings || 1);
    }
    if (!open) {
      // Reset state when dialog closes
      setSelectedDate(new Date());
      setSelectedMealTime("Lunch");
      setSelectedMealPlanId(undefined);
      setApiError(null); // Clear API error
      addItemMutation.reset();
    }
  }, [recipe, open]); // Removed addItemMutation from dependency array

  const handleSubmit = async () => {
    setApiError(null); // Clear previous errors
    if (!recipe || !selectedDate || !selectedMealTime || !selectedMealPlanId) {
      setApiError("请选择周计划、日期和餐次。");
      return;
    }
    addItemMutation.mutate({
      mealPlanId: selectedMealPlanId,
      recipeId: recipe.id,
      date: selectedDate.toISOString(), // Ensure date is in ISO format
      mealTime: selectedMealTime,
      servings: servings,
    });
    // console.log("Submitting to meal plan:", {
    //   mealPlanId: selectedMealPlanId,
    //   recipeId: recipe.id,
    //   date: selectedDate.toISOString(),
    //   mealTime: selectedMealTime,
    //   servings: servings,
    // });
    // // Simulating success for now
    // onOpenChange(false);
    // onSuccess?.();
    // alert("食谱已添加到周计划（模拟）");
  };

  if (!recipe) return null; // Don't render if no recipe

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>添加到周计划</DialogTitle>
          <DialogDescription>
            将食谱 "<strong>{recipe.title}</strong>" 添加到你的周计划中。
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meal-plan-select" className="text-right">
              周计划 <span className="text-destructive">*</span>
            </Label>
            {isLoadingPlans && <p className="col-span-3 text-sm text-muted-foreground">加载周计划中...</p>}
            {plansError && <p className="col-span-3 text-sm text-destructive">{plansError.message || "加载周计划失败。"}</p>}
            {!isLoadingPlans && !plansError && mealPlans && (
              <Select 
                value={selectedMealPlanId}
                onValueChange={setSelectedMealPlanId}
                disabled={mealPlans.length === 0}
              >
                <SelectTrigger id="meal-plan-select" className="col-span-3">
                  <SelectValue placeholder={mealPlans.length === 0 ? "没有可用的周计划" : "选择一个周计划"} />
                </SelectTrigger>
                <SelectContent>
                  {mealPlans.length === 0 && <p className="p-2 text-sm text-muted-foreground">你还没有创建周计划。</p>}
                  {mealPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name || `周计划 (${plan.startDate ? new Date(plan.startDate).toLocaleDateString() : plan.id.substring(0,6)})`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!isLoadingPlans && !plansError && (!mealPlans || mealPlans.length === 0) && (
                 <p className="col-span-3 text-sm text-muted-foreground">你还没有创建周计划。请先到"周计划"页面创建一个。</p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              日期 <span className="text-destructive">*</span>
            </Label>
            {/* Using simple input type date for now. Can be replaced with Shadcn Calendar later. */}
            <Input 
              id="date"
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
              className="col-span-3"
            />
            {/* <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`col-span-3 justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: zhCN }) : <span>选择日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                     setSelectedDate(date);
                     setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover> */}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mealTime" className="text-right">
              餐次
            </Label>
            <Select value={selectedMealTime} onValueChange={setSelectedMealTime}>
              <SelectTrigger id="mealTime" className="col-span-3">
                <SelectValue placeholder="选择餐次" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Breakfast">早餐</SelectItem>
                <SelectItem value="Lunch">午餐</SelectItem>
                <SelectItem value="Dinner">晚餐</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="servings" className="text-right">
              份量
            </Label>
            <Input
              id="servings"
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="col-span-3"
            />
          </div>

          {apiError && (
            <div className="col-span-4 my-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive text-center">
              {apiError}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={addItemMutation.isPending}>取消</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={addItemMutation.isPending || isLoadingPlans || !selectedMealPlanId}>
            {addItemMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            添加到计划
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 