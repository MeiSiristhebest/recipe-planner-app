"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { User, Lock, Settings, Heart, Calendar, ChefHat, Edit3, Trash2, CheckCircle, AlertCircle } from "lucide-react"; // Added CheckCircle, AlertCircle
import type { Recipe, MealPlan } from "@prisma/client"; // Import Recipe and MealPlan types

interface UserData {
  name: string;
  email: string;
  avatar: string;
}

// Update RecipeData to match Prisma Recipe model more closely
// We might not need a separate RecipeData interface if Recipe from @prisma/client is sufficient
// For now, let's use the actual Recipe type and add any client-specific transformations if needed

interface ProfileClientContentProps {
  user: UserData;
  myRecipesData: Recipe[]; // Use Prisma Recipe type
  favoriteRecipesData: Recipe[]; // Assuming favorites will also be of Recipe[] type eventually
  mealPlanTemplatesData?: MealPlan[]; // Added mealPlanTemplatesData, make it optional for now
}

interface RecipeCardProps extends Omit<Recipe, 'ingredients' | 'instructions' | 'nutritionInfo' | 'authorId' | 'updatedAt' | 'createdAt'> {
  // We can extend or pick from Prisma's Recipe type
  // For simplicity, RecipeCard will receive a Recipe object
  // And extract what it needs. Or we can define specific props.
  // Let's assume RecipeCard takes the whole recipe object for now for simplicity in this step,
  // but in a real app, you'd pass only necessary fields.
  recipe: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();
  const handleCardClick = () => {
    router.push(`/recipes/${recipe.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    router.push(`/recipes/edit/${recipe.id}`); // Assuming an edit page route
    console.log("Edit recipe:", recipe.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (confirm(`确定要删除食谱 "${recipe.title}" 吗？`)) {
      try {
        // Placeholder for delete API call
        console.log("Deleting recipe:", recipe.id);
        // const response = await fetch(`/api/recipes/${recipe.id}`, { method: 'DELETE' });
        // if (response.ok) {
        //   // Refresh list or remove item from state
        // } else {
        //   // Handle error
        // }
      } catch (error) {
        console.error("Failed to delete recipe:", error);
      }
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full flex flex-col group"
      onClick={handleCardClick}
    >
      <div className="relative w-full h-40">
        <Image 
          src={recipe.coverImage || `/placeholder-recipe.jpg`} 
          alt={recipe.title || "食谱图片"} 
          fill // Changed from layout="fill"
          style={{objectFit:"cover"}} // ensure style is applied for fill
        />
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="outline" size="icon" onClick={handleEdit} className="bg-white hover:bg-gray-100">
                <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-2 truncate">{recipe.title || "无标题食谱"}</h3>
        <p className="text-xs text-muted-foreground mb-1">烹饪时间: {recipe.cookingTime} 分钟</p>
        {/* Assuming rating and tags will be handled later or are part of the extended Recipe type */}
        {/* For now, let's remove direct rating and tags display from here as they are not directly on Recipe model like this */}
        {/* <p className="text-xs text-muted-foreground mb-2">评分: {recipe.rating} ★</p> */}
        {/* {recipe.tags && recipe.tags.length > 0 && ( ... )} */}
        <p className="text-sm text-muted-foreground mt-auto pt-2 line-clamp-2">{recipe.description || "暂无描述"}</p>
      </CardContent>
    </Card>
  );
}


export default function ProfileClientContent({
  user: initialUser,
  myRecipesData = [],      // Default to empty array
  favoriteRecipesData = [], // Default to empty array
  mealPlanTemplatesData = [], // Destructure with default value
}: ProfileClientContentProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState("my-recipes");

  // Use a state for recipes that can be updated (e.g., after delete)
  const [myRecipes, setMyRecipes] = useState<Recipe[]>(myRecipesData);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>(favoriteRecipesData);

  // State for profile form
  const [profileName, setProfileName] = useState(initialUser.name || "");
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // State for password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const passwordFormRef = useRef<HTMLFormElement>(null); // For resetting the form

  useEffect(() => {
    setMyRecipes(myRecipesData);
  }, [myRecipesData]);

  useEffect(() => {
    setFavoriteRecipes(favoriteRecipesData);
  }, [favoriteRecipesData]);

  // Update profileName when initialUser.name changes (e.g. after successful save and re-fetch)
  useEffect(() => {
    setProfileName(initialUser.name || "");
  }, [initialUser.name]);

  const [myRecipesCurrentPage, setMyRecipesCurrentPage] = useState(1);
  const [favoritesCurrentPage, setFavoritesCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const indexOfLastMyRecipe = myRecipesCurrentPage * itemsPerPage;
  const indexOfFirstMyRecipe = indexOfLastMyRecipe - itemsPerPage;
  const currentMyRecipes = myRecipes.slice(indexOfFirstMyRecipe, indexOfLastMyRecipe);
  const totalMyRecipesPages = Math.ceil(myRecipes.length / itemsPerPage);

  const indexOfLastFavorite = favoritesCurrentPage * itemsPerPage;
  const indexOfFirstFavorite = indexOfLastFavorite - itemsPerPage;
  const currentFavoriteRecipes = favoriteRecipes.slice(indexOfFirstFavorite, indexOfLastFavorite);
  const totalFavoritePages = Math.ceil(favoriteRecipes.length / itemsPerPage);

  const handleProfileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileName(e.target.value);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setProfileMessage(null);
    try {
      const response = await fetch('/api/profile/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '更新失败');
      }
      setUser(prev => ({...prev, name: data.user.name })); // Update local user state
      setProfileMessage({ type: 'success', text: data.message });
      // Optionally, force a session update or page refresh if needed to reflect changes globally
      // router.refresh(); // This would re-run the server component part of the page
    } catch (error: any) {
      setProfileMessage({ type: 'error', text: error.message || '发生错误，请稍后再试' });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: '新密码与确认密码不匹配' });
      return;
    }
    setIsPasswordSaving(true);
    setPasswordMessage(null);
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '密码更新失败');
      setPasswordMessage({ type: 'success', text: data.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      passwordFormRef.current?.reset(); // Reset form fields
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || '发生错误' });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const sidebarNavItems = [
    // { value: "settings", label: "个人信息", icon: User }, // This is part of the settings tab content
    { value: "my-recipes", label: "我的食谱", icon: ChefHat },
    { value: "favorites", label: "我的收藏", icon: Heart },
    { value: "meal-plan-templates", label: "餐计划模板", icon: Calendar }, // Corrected value and label
    { value: "settings", label: "账户设置", icon: Settings }, 
  ];

  const handleCreateNewRecipe = () => {
    router.push('/recipes/create');
  };

  const PaginateButtons = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => (
    <div className="flex justify-center items-center gap-4 mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || totalPages === 0}
      >
        上一页
      </Button>
      <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        下一页
      </Button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "User Avatar"} />
                <AvatarFallback>{user.name ? user.name.slice(0, 2) : "用户"}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user.name || "用户名"}</h2>
              <p className="text-sm text-muted-foreground mb-4">{user.email || "用户邮箱"}</p>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("settings")}>
                编辑个人资料
              </Button>
            </div>
            <div className="mt-6 space-y-1">
              {sidebarNavItems.map((item) => (
                <div
                  key={item.value + item.label + Math.random()} 
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer ${
                    activeTab === item.value ? "bg-muted font-semibold" : ""
                  }`}
                  onClick={() => setActiveTab(item.value)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="my-recipes">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="my-recipes">我的食谱</TabsTrigger>
            <TabsTrigger value="favorites">我的收藏</TabsTrigger>
            <TabsTrigger value="meal-plan-templates">餐计划模板</TabsTrigger>
            <TabsTrigger value="settings">账户设置</TabsTrigger>
          </TabsList>

          <TabsContent value="my-recipes" className="mt-6">
            {currentMyRecipes.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">您还没有创建任何食谱。</p>
                    <Button onClick={handleCreateNewRecipe}>创建我的第一个食谱</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentMyRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
                </div>
            )}
            {totalMyRecipesPages > 0 && (
               <PaginateButtons
                  currentPage={myRecipesCurrentPage}
                  totalPages={totalMyRecipesPages}
                  onPageChange={setMyRecipesCurrentPage}
                />
            )}
            {currentMyRecipes.length > 0 && (
                 <div className="flex justify-center mt-8">
                    <Button variant="outline" onClick={handleCreateNewRecipe}>创建新食谱</Button>
                </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            {currentFavoriteRecipes.length === 0 ? (
                 <div className="text-center py-10">
                    <p className="text-muted-foreground">您还没有收藏任何食谱。</p>
                    {/* Optional: Link to recipes page */}
                    {/* <Button variant="link" onClick={() => router.push('/recipes')}>去食谱库看看</Button> */}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentFavoriteRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
                </div>
            )}
            {totalFavoritePages > 0 && (
              <PaginateButtons
                currentPage={favoritesCurrentPage}
                totalPages={totalFavoritePages}
                onPageChange={setFavoritesCurrentPage}
              />
            )}
          </TabsContent>

          {/* Meal Plan Templates Tab Content */}
          <TabsContent value="meal-plan-templates" className="mt-6">
            <h2 className="text-2xl font-semibold mb-6">我的餐计划模板</h2>
            {mealPlanTemplatesData && mealPlanTemplatesData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mealPlanTemplatesData.map((template) => (
                  <Card key={template.id} className="flex flex-col">
                    <CardContent className="p-4 flex-grow">
                      <h3 className="font-semibold text-lg mb-2 truncate">{template.name || "未命名模板"}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        创建于: {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        更新于: {new Date(template.updatedAt).toLocaleDateString()}
                      </p>
                      {/* Placeholder for item count if needed later */}
                      {/* {template._count?.items && <p className="text-sm text-muted-foreground">包含 {template._count.items} 项</p>} */}
                    </CardContent>
                    <div className="p-4 border-t flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/meal-plans/edit-template/${template.id}`)}>
                        <Edit3 className="mr-2 h-4 w-4" /> 查看/编辑
                      </Button>
                      <Button variant="default" size="sm" onClick={() => router.push(`/meal-plans/create-from-template/${template.id}`)}>
                        <Calendar className="mr-2 h-4 w-4" /> 使用模板
                      </Button>
                      {/* <Button variant="destructive" size="sm" onClick={() => console.log("Delete template", template.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> 删除
                      </Button> */}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">您还没有保存任何餐计划模板。</p>
                <Button className="mt-4" onClick={() => router.push("/meal-plans")}>
                  去创建我的第一个周计划
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleProfileSubmit}>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2"><User className="h-5 w-5" />个人信息</h3>
                    {profileMessage && (
                        <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${
                            profileMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {profileMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {profileMessage.text}
                        </div>
                    )}
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="profile-name" className="text-right">姓名</Label>
                        <Input id="profile-name" name="name" value={profileName} onChange={handleProfileNameChange} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="profile-email" className="text-right">邮箱</Label>
                        <Input id="profile-email" name="email" type="email" value={user.email || ""} className="col-span-3" readOnly />
                      </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isProfileSaving || profileName === initialUser.name}>
                        {isProfileSaving ? "保存中..." : "保存更改"}
                        </Button>
                    </div>
                  </div>
                </form>
                
                <form ref={passwordFormRef} onSubmit={handlePasswordChangeSubmit} className="border-t pt-6 space-y-2">
                  <h3 className="text-lg font-medium flex items-center gap-2"><Lock className="h-5 w-5" />密码</h3>
                  {passwordMessage && (
                        <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${
                            passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {passwordMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {passwordMessage.text}
                        </div>
                    )}
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="current-password" className="text-right">当前密码</Label>
                      <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-password" className="text-right">新密码</Label>
                      <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="confirm-password" className="text-right">确认新密码</Label>
                      <Input id="confirm-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="col-span-3" required />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isPasswordSaving || !currentPassword || !newPassword || newPassword !== confirmNewPassword }>
                        {isPasswordSaving ? "更改中..." : "更改密码"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 