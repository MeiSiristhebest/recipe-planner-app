import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function ProfileSettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">账户设置</h2>

      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">账户信息</TabsTrigger>
          <TabsTrigger value="preferences">偏好设置</TabsTrigger>
          <TabsTrigger value="password">修改密码</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>账户信息</CardTitle>
              <CardDescription>更新您的个人信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">用户名</Label>
                  <Input id="name" defaultValue="美食爱好者" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">电子邮箱</Label>
                  <Input id="email" type="email" defaultValue="user@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Input id="bio" defaultValue="热爱美食，喜欢尝试各种新菜谱" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>保存更改</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>偏好设置</CardTitle>
              <CardDescription>自定义您的使用体验</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">饮食偏好</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pref-vegetarian" />
                    <Label htmlFor="pref-vegetarian">素食</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pref-vegan" />
                    <Label htmlFor="pref-vegan">纯素</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pref-gluten-free" />
                    <Label htmlFor="pref-gluten-free">无麸质</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pref-dairy-free" />
                    <Label htmlFor="pref-dairy-free">无乳制品</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pref-low-carb" />
                    <Label htmlFor="pref-low-carb">低碳水</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pref-high-protein" />
                    <Label htmlFor="pref-high-protein">高蛋白</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">通知设置</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-new-recipes">新食谱推荐</Label>
                    <Switch id="notify-new-recipes" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-meal-plan">周计划提醒</Label>
                    <Switch id="notify-meal-plan" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-shopping-list">购物清单提醒</Label>
                    <Switch id="notify-shopping-list" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">默认设置</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-servings">默认份量</Label>
                      <Select defaultValue="2">
                        <SelectTrigger id="default-servings">
                          <SelectValue placeholder="选择默认份量" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1人份</SelectItem>
                          <SelectItem value="2">2人份</SelectItem>
                          <SelectItem value="4">4人份</SelectItem>
                          <SelectItem value="6">6人份</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="measurement-system">计量单位</Label>
                      <Select defaultValue="metric">
                        <SelectTrigger id="measurement-system">
                          <SelectValue placeholder="选择计量单位" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">公制 (克, 毫升)</SelectItem>
                          <SelectItem value="imperial">英制 (盎司, 杯)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>保存偏好</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>更新您的账户密码</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>更新密码</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
