import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit2 } from "lucide-react"
import Link from "next/link"
import ProfileRecipes from "@/components/features/profile/ProfileRecipes"
import ProfileFavorites from "@/components/features/profile/ProfileFavorites"
import ProfileTemplates from "@/components/features/profile/ProfileTemplates"
import ProfileSettings from "@/components/features/profile/ProfileSettings"

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">个人中心</h1>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {/* Profile Sidebar */}
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="/placeholder.svg?height=128&width=128" alt="User" />
                    <AvatarFallback>用户</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <h2 className="text-xl font-bold mb-1">美食爱好者</h2>
                <p className="text-muted-foreground mb-4">user@example.com</p>

                <div className="w-full">
                  <Button className="w-full" asChild>
                    <Link href="/profile/edit">编辑个人资料</Link>
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-1">
                <Link href="/recipes" className="block p-2 hover:bg-accent rounded-md">
                  我的食谱
                </Link>
                <Link href="/meal-plans" className="block p-2 hover:bg-accent rounded-md">
                  我的周计划
                </Link>
                <Link href="/shopping-list" className="block p-2 hover:bg-accent rounded-md">
                  购物清单
                </Link>
                <Link href="/settings" className="block p-2 hover:bg-accent rounded-md">
                  账户设置
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <div>
          <Tabs defaultValue="recipes">
            <TabsList className="mb-6">
              <TabsTrigger value="recipes">我的食谱</TabsTrigger>
              <TabsTrigger value="favorites">我的收藏</TabsTrigger>
              <TabsTrigger value="templates">餐计划模板</TabsTrigger>
              <TabsTrigger value="settings">账户设置</TabsTrigger>
            </TabsList>

            <TabsContent value="recipes">
              <ProfileRecipes />
            </TabsContent>

            <TabsContent value="favorites">
              <ProfileFavorites />
            </TabsContent>

            <TabsContent value="templates">
              <ProfileTemplates />
            </TabsContent>

            <TabsContent value="settings">
              <ProfileSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
