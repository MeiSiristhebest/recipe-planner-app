"use client"

import { HelpCircle, Search, ChefHat, Calendar, ShoppingCart, User, Lock, Smartphone, Settings, RefreshCw, MessageSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/accordion";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

// FAQ类别和问题数据
const faqCategories = [
  {
    id: "general",
    label: "一般问题",
    icon: HelpCircle,
    questions: [
      {
        id: "what-is",
        question: "食谱规划助手是什么？",
        answer: "食谱规划助手是一个帮助您发现、创建和管理食谱，规划每周膳食，并生成购物清单的应用。我们的目标是让健康饮食变得简单、有趣且可持续。"
      },
      {
        id: "cost",
        question: "使用食谱规划助手需要付费吗？",
        answer: "食谱规划助手提供免费和高级两种版本。基本功能如浏览食谱、创建简单的膳食计划等是免费的。高级功能如AI食谱生成、详细的营养分析等需要订阅我们的高级计划。您可以在个人中心查看详细的价格信息。"
      },
      {
        id: "devices",
        question: "食谱规划助手支持哪些设备？",
        answer: "我们的应用支持网页版、iOS和Android移动应用。您可以在任何设备上访问您的账户，所有数据都会自动同步。"
      },
      {
        id: "data-privacy",
        question: "我的个人数据如何被保护？",
        answer: "我们非常重视用户隐私。所有用户数据都经过加密存储，我们不会未经您的许可与第三方共享您的个人信息。您可以在我们的隐私政策中了解更多详情。"
      }
    ]
  },
  {
    id: "recipes",
    label: "食谱相关",
    icon: ChefHat,
    questions: [
      {
        id: "create-recipe",
        question: "如何创建我的第一个食谱？",
        answer: "创建食谱非常简单！登录后，点击"食谱库"页面上的"创建食谱"按钮。填写食谱标题、描述、食材清单和烹饪步骤，上传一张美味的照片，然后点击保存即可。您也可以设置烹饪时间、难度等级和标签，以便更好地组织您的食谱。"
      },
      {
        id: "edit-recipe",
        question: "如何编辑或删除我的食谱？",
        answer: "要编辑食谱，请导航到该食谱的详情页面，然后点击右上角的"编辑"按钮。要删除食谱，在编辑页面底部有一个"删除食谱"按钮。请注意，删除操作是不可逆的。"
      },
      {
        id: "import-recipe",
        question: "我可以从其他网站导入食谱吗？",
        answer: "目前，我们支持通过URL导入部分知名食谱网站的内容。在"创建食谱"页面，您会看到"从URL导入"选项。请注意，导入功能可能无法获取所有内容，您可能需要手动补充一些信息。"
      },
      {
        id: "share-recipe",
        question: "如何分享我的食谱？",
        answer: "在食谱详情页面，点击"分享"按钮，您可以通过社交媒体、电子邮件或生成一个分享链接来分享您的食谱。您也可以设置食谱为私密，这样只有您能看到它。"
      }
    ]
  },
  {
    id: "meal-planning",
    label: "膳食计划",
    icon: Calendar,
    questions: [
      {
        id: "create-plan",
        question: "如何创建一周的膳食计划？",
        answer: "在"周计划"页面，您可以通过拖放食谱到每天的早餐、午餐和晚餐时段来创建膳食计划。您也可以点击任何时段，然后从弹出的窗口中搜索并选择食谱。完成后，点击"保存计划"按钮即可。"
      },
      {
        id: "template",
        question: "什么是膳食计划模板？如何使用？",
        answer: "膳食计划模板是您可以重复使用的预设计划。创建好周计划后，点击"保存为模板"按钮，为模板命名并保存。下次创建新计划时，您可以从"加载模板"选项中选择一个模板作为起点，然后根据需要进行调整。"
      },
      {
        id: "ai-suggestion",
        question: "AI膳食建议是如何工作的？",
        answer: "我们的AI会根据您的饮食偏好、营养需求和以往的选择，为您推荐适合的食谱。在周计划页面，点击"AI建议"按钮，选择您的偏好（如素食、低碳水等），AI将为您生成个性化的建议。"
      }
    ]
  },
  {
    id: "shopping",
    label: "购物清单",
    icon: ShoppingCart,
    questions: [
      {
        id: "generate-list",
        question: "如何生成购物清单？",
        answer: "在周计划页面，点击"生成购物清单"按钮，系统会自动根据您的膳食计划中的所有食谱，汇总所需的食材并生成购物清单。您也可以直接在"购物清单"页面手动添加项目。"
      },
      {
        id: "edit-list",
        question: "如何编辑购物清单？",
        answer: "在购物清单页面，您可以勾选已购买的项目、调整数量、添加新项目或删除不需要的项目。系统会自动保存您的更改。"
      },
      {
        id: "share-list",
        question: "如何与家人分享购物清单？",
        answer: "在购物清单页面，点击"分享"按钮，您可以通过生成链接、发送电子邮件或直接分享到社交媒体来与他人分享您的购物清单。被分享者无需登录即可查看清单。"
      }
    ]
  },
  {
    id: "account",
    label: "账户设置",
    icon: User,
    questions: [
      {
        id: "reset-password",
        question: "忘记密码了怎么办？",
        answer: "在登录页面，点击"忘记密码"链接，输入您的注册邮箱，我们会向您发送一封包含重置密码链接的电子邮件。点击链接后，您可以设置新密码。"
      },
      {
        id: "change-email",
        question: "如何更改我的电子邮箱地址？",
        answer: "登录后，进入"个人中心"，点击"账户设置"，然后在"电子邮箱"部分点击"更改"。您需要验证新的电子邮箱地址才能完成更改。"
      },
      {
        id: "delete-account",
        question: "如何删除我的账户？",
        answer: "在"个人中心"的"账户设置"页面底部，有一个"删除账户"选项。请注意，账户删除是不可逆的，所有与您账户相关的数据（包括食谱、膳食计划等）都将被永久删除。"
      }
    ]
  },
  {
    id: "technical",
    label: "技术支持",
    icon: Settings,
    questions: [
      {
        id: "sync-issue",
        question: "如何同步我的数据到其他设备？",
        answer: "只要您在所有设备上使用相同的账户登录，您的数据会自动同步。如果您遇到同步问题，请尝试刷新页面或重启应用。如果问题持续存在，请联系我们的技术支持。"
      },
      {
        id: "offline",
        question: "应用可以离线使用吗？",
        answer: "我们的移动应用支持基本的离线功能。您可以查看已下载的食谱和计划，但无法创建新内容或同步数据。一旦恢复网络连接，应用将自动同步您的更改。"
      },
      {
        id: "browser",
        question: "推荐使用哪些浏览器？",
        answer: "我们的网页版应用支持所有现代浏览器，包括Chrome、Firefox、Safari和Edge的最新版本。为了获得最佳体验，我们建议使用Chrome或Firefox。"
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // 过滤问题的函数
  const filterQuestions = () => {
    const query = searchQuery.toLowerCase();
    
    // 如果没有搜索查询且选择了"全部"标签，返回所有类别
    if (!query && activeTab === "all") {
      return faqCategories;
    }
    
    // 过滤类别和问题
    return faqCategories
      .map(category => {
        // 如果选择了特定类别，只保留该类别
        if (activeTab !== "all" && activeTab !== category.id) {
          return null;
        }
        
        // 过滤符合搜索条件的问题
        const filteredQuestions = category.questions.filter(q => 
          !query || 
          q.question.toLowerCase().includes(query) || 
          q.answer.toLowerCase().includes(query)
        );
        
        // 如果该类别没有符合条件的问题，返回null
        if (filteredQuestions.length === 0) {
          return null;
        }
        
        // 返回包含过滤后问题的类别
        return {
          ...category,
          questions: filteredQuestions
        };
      })
      .filter(Boolean); // 移除null值
  };
  
  const filteredCategories = filterQuestions();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-12 md:mb-16 text-center">
        <HelpCircle className="w-16 h-16 sm:w-20 sm:h-20 text-primary mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 !mb-3">
          常见问题解答
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          找到您关心的问题答案，快速解决疑惑。如果您没有找到需要的信息，请随时联系我们。
        </p>
      </header>

      {/* 搜索栏 */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="搜索问题..."
            className="pl-10 py-6 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 类别标签 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto mb-10">
        <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-8">
          <TabsTrigger value="all">全部</TabsTrigger>
          {faqCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center">
              <category.icon className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* FAQ内容 */}
      <div className="max-w-4xl mx-auto">
        {filteredCategories.length > 0 ? (
          filteredCategories.map(category => (
            <div key={category.id} className="mb-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-100">
                <category.icon className="mr-2 h-6 w-6 text-primary" />
                {category.label}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map(faq => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg p-1">
                    <AccordionTrigger className="text-lg font-medium px-4 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">没有找到匹配的问题</p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              尝试使用不同的搜索词，或者直接联系我们获取帮助。
            </p>
            <Button asChild>
              <Link href="/contact">
                <MessageSquare className="mr-2 h-4 w-4" />
                联系客服
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* 联系我们 */}
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">还有其他问题？</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          如果您没有找到需要的答案，请随时联系我们的客服团队。我们会尽快回复您的问题。
        </p>
        <Button asChild size="lg">
          <Link href="/contact">
            <MessageSquare className="mr-2 h-5 w-5" />
            联系我们
          </Link>
        </Button>
      </div>
    </div>
  );
}
