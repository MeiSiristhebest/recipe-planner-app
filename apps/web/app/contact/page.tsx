import { Mail, Phone, MapPin, Send, MessageSquare, Users, Info, Clock, Building, CheckSquare, FileQuestion, Briefcase, UserCog, HelpCircle } from 'lucide-react';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { Checkbox } from "@repo/ui/checkbox";

export default function ContactUsPage() {
  const appName = <span className="font-semibold text-primary">食谱规划助手</span>;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-12 md:mb-16 text-center">
        <Mail className="w-16 h-16 sm:w-20 sm:h-20 text-primary mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 !mb-3">
          联系我们
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          我们非常乐意倾听您的声音！无论是问题咨询、功能建议还是合作洽谈，都欢迎您通过以下方式与我们取得联系。
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
        {/* Contact Form */}
        <Card className="bg-white dark:bg-gray-800/50 shadow-xl rounded-xl p-2 sm:p-4 md:p-6 ring-1 ring-gray-200 dark:ring-gray-700 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
              <Send className="w-7 h-7 text-primary mr-3" />
              发送在线消息
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              填写下面的表单，我们会尽快回复您。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="#" method="POST" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">姓名</Label>
                  <Input type="text" name="name" id="name" required className="mt-1" placeholder="请输入您的姓名或昵称" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">电子邮箱</Label>
                  <Input type="email" name="email" id="email" required className="mt-1" placeholder="请输入您的电子邮箱地址" />
                </div>
              </div>

              <div>
                <Label htmlFor="enquiryType" className="text-gray-700 dark:text-gray-300">咨询类型</Label>
                <Select name="enquiryType" defaultValue="general">
                  <SelectTrigger id="enquiryType" className="mt-1">
                    <SelectValue placeholder="请选择咨询类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug_report"><FileQuestion className="inline-block w-4 h-4 mr-2 text-muted-foreground" /> 问题反馈</SelectItem>
                    <SelectItem value="feature_request"><HelpCircle className="inline-block w-4 h-4 mr-2 text-muted-foreground" /> 功能建议</SelectItem>
                    <SelectItem value="business_cooperation"><Briefcase className="inline-block w-4 h-4 mr-2 text-muted-foreground" /> 商务合作</SelectItem>
                    <SelectItem value="account_issue"><UserCog className="inline-block w-4 h-4 mr-2 text-muted-foreground" /> 账户问题</SelectItem>
                    <SelectItem value="other"><Info className="inline-block w-4 h-4 mr-2 text-muted-foreground" /> 其他咨询</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300">主题</Label>
                <Input type="text" name="subject" id="subject" required className="mt-1" placeholder="请输入消息主题" />
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">内容</Label>
                <Textarea name="message" id="message" rows={10} required className="mt-1" placeholder="请在此详细描述您的问题或建议..." />
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox id="terms" required />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
                  >
                    我已阅读并同意 <Link href="/terms-of-service" className="text-primary hover:underline">服务条款</Link> 和 <Link href="/privacy-policy" className="text-primary hover:underline">隐私政策</Link>。
                  </label>
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full text-base">
                  <Send className="mr-2 h-4 w-4" /> 提交消息
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information & FAQ */}
        <div className="space-y-8 md:space-y-10 md:col-span-1">
          <Card className="bg-white dark:bg-gray-800/50 shadow-xl rounded-xl p-2 sm:p-4 md:p-6 ring-1 ring-gray-200 dark:ring-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                <Info className="w-7 h-7 text-primary mr-3" />
                联系详情与服务时间
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-secondary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">电子邮件</h4>
                  <p>对于一般咨询、媒体请求或合作机会，请发送邮件至：</p>
                  <a href="mailto:support@example.com" className="text-primary hover:underline">support@example.com</a> (技术支持) <br />
                  <a href="mailto:business@example.com" className="text-primary hover:underline">business@example.com</a> (商务合作)
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-secondary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">电话支持</h4>
                  <p>客服热线：+86 400-123-4567</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">（工作时间：周一至周五，上午9:00 - 下午6:00）</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-secondary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">办公地址</h4>
                  <p>食谱规划助手团队</p>
                  <p>中国北京市海淀区中关村软件园X号楼X层</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">（请注意：办公地址不设对外接待，如有需要请提前预约）</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">响应时间</h4>
                <p>我们致力于尽快回复所有咨询。通常情况下：</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>对于通过在线表单或电子邮件提交的咨询，我们力求在 <strong>1-2 个工作日</strong> 内回复。</li>
                  <li>电话支持服务时间为周一至周五，上午9:00至下午6:00（法定节假日除外）。</li>
                </ul>
                <p className="mt-2">感谢您的耐心等待！</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800/50 shadow-xl rounded-xl p-2 sm:p-4 md:p-6 ring-1 ring-gray-200 dark:ring-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                <MessageSquare className="w-7 h-7 text-primary mr-3" />
                常见问题 (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-600 dark:text-gray-300">
              <div>
                <p>在联系我们之前，您可能想先查看我们的 <Link href="/faq" className="text-primary hover:underline">常见问题页面</Link>，那里或许已经有了您想要的答案。</p>
                <h4 className="font-semibold pt-2">一些常见问题：</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>如何创建我的第一个食谱？</li>
                  <li>如何制定一周的膳食计划？</li>
                  <li>忘记密码了怎么办？</li>
                  <li>如何同步我的数据到其他设备？</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/faq">
                  查看所有常见问题
                  <Users className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 