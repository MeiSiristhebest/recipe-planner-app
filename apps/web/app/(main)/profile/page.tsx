"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@repo/ui/button"
import { Card, CardContent } from "@repo/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { User, Lock, Settings, Heart, Calendar, ChefHat } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "张厨师",
    email: "zhang@example.com",
    avatar: "/placeholder.svg",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">个人中心</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                <Button variant="outline" className="w-full">
                  编辑个人资料
                </Button>
              </div>

              <div className="mt-6 space-y-1">
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                  <User className="h-4 w-4" />
                  <span className="text-sm">个人信息</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">我的收藏</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                  <ChefHat className="h-4 w-4" />
                  <span className="text-sm">我的食谱</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">我的餐计划模板</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">账户设置</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="my-recipes">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="my-recipes">我的食谱</TabsTrigger>
              <TabsTrigger value="favorites">我的收藏</TabsTrigger>
              <TabsTrigger value="meal-templates">餐计划模板</TabsTrigger>
              <TabsTrigger value="settings">账户设置</TabsTrigger>
            </TabsList>

            <TabsContent value="my-recipes">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RecipeCard key={i} id={i + 1} />
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <Button variant="outline">创建新食谱</Button>
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <RecipeCard key={i} id={i + 1} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="meal-templates">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-2">
                        模板 {i + 1}: {i % 2 === 0 ? "健康减脂" : "增肌增重"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">创建于 2023年12月{10 + i}日</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">早餐</div>
                          <div className="text-sm font-medium">{i % 2 === 0 ? "7" : "5"} 个食谱</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">午餐</div>
                          <div className="text-sm font-medium">{i % 2 === 0 ? "6" : "7"} 个食谱</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">晚餐</div>
                          <div className="text-sm font-medium">{i % 2 === 0 ? "7" : "6"} 个食谱</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          应用
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          编辑
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <User className="h-5 w-5" />
                      个人信息
                    </h3>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          姓名
                        </Label>
                        <Input 
                          id="name" 
                          name="name"
                          value={user.name} 
                          onChange={handleInputChange}
                          className="col-span-3" 
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          邮箱
                        </Label>
                        <Input 
                          id="email" 
                          name="email"
                          value={user.email} 
                          onChange={handleInputChange}
                          className="col-span-3" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      密码
                    </h3>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="current-password" className="text-right">
                          当前密码
                        </Label>
                        <Input id="current-password" type="password" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-password" className="text-right">
                          新密码
                        </Label>
                        <Input id="new-password" type="password" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="confirm-password" className="text-right">
                          确认新密码
                        </Label>
                        <Input id="confirm-password" type="password" className="col-span-3" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>保存更改</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function RecipeCard({ id }: { id: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <Image src="/placeholder.svg" alt="食谱图片" fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold">美味食谱标题 {id}</h3>
            <p className="text-sm text-muted-foreground">烹饪时间: 30分钟</p>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium">4.5</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-yellow-500 ml-1"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            家常菜
          </span>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">简单</span>
        </div>
      </CardContent>
    </Card>
  )
}
