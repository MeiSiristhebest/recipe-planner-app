"use client"

import { Building2, Target, TrendingUp, Users, Lightbulb, Sparkles, Rocket, Users2, ShieldCheck, Code2, Palette, Apple } from 'lucide-react';
import { Section } from './Section';
import { FeatureCard } from './FeatureCard';

export default function AboutUsPage() {
  const appName = "食谱规划助手";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-12 md:mb-16 text-center">
        <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-primary mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 !mb-3">
          关于 {appName}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          我们致力于通过科技赋能，让每个人都能轻松享受健康、美味且充满创意的烹饪生活。
        </p>
      </header>

      <div className="space-y-12 md:space-y-16">
        <Section title="我们的使命：让健康饮食触手可及" icon={Target}>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            在快节奏的现代生活中，我们深知健康饮食的重要性以及坚持计划的挑战性。
            {appName} 致力于通过技术创新，为您提供一个智能、便捷、个性化的饮食管理伙伴。我们的目标是帮助每一位用户轻松发现和创建美味食谱，科学规划每周膳食，智能生成购物清单，从而告别"吃什么"的每日困扰，拥抱更健康、更有品质的生活方式。
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            我们相信，合理的饮食规划不仅关乎身体健康，更能提升生活幸福感。无论是为自己、为家人，还是为特殊场合准备餐点，我们都希望成为您最可靠的助手，让您在厨房中游刃有余，享受烹饪的乐趣。
          </p>
        </Section>

        <Section title="核心价值：驱动我们的力量" icon={Lightbulb}>
          <div className="grid md:grid-cols-3 gap-6 text-gray-600 dark:text-gray-300">
            <FeatureCard
              title="智能创新"
              icon={Sparkles}
              description="利用先进算法和机器学习，提供个性化食谱推荐、膳食营养分析和智能计划辅助，让您的饮食更科学、更懂你。"
            />
            <FeatureCard
              title="用户至上"
              icon={Users}
              description="始终以用户需求为核心，不断打磨产品细节，优化用户体验，确保每一位用户都能简单上手，乐在其中。"
            />
            <FeatureCard
              title="开放协作"
              icon={Users2}
              description="鼓励用户分享与交流，构建充满活力的美食社区。我们积极听取用户反馈，与用户共同成长，打造更完善的应用生态。"
            />
          </div>
        </Section>

        <Section title="我们的故事：从热爱到创造" icon={TrendingUp}>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {appName} 的诞生源于一群对美食充满热情、对健康生活不懈追求的伙伴。我们曾和您一样，在繁忙的工作之余，为每日三餐的选择和准备而烦恼。我们渴望一个能真正解决这些痛点的工具——它不仅能提供海量食谱，更能理解我们的口味，帮助我们规划，甚至让购物也变得简单。
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            怀揣着这个共同的愿景，我们走到了一起。凭借在软件开发、营养学、用户体验设计等领域的专业积累，我们从零开始，一步步将想法变为现实。经历了无数个日夜的讨论、编码与测试，{appName} 终于与大家见面。
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            这不仅仅是一款应用，更是我们对美好生活方式的向往与实践。我们希望它能像一位贴心的朋友，陪伴您的每一次烹饪探索。
          </p>
        </Section>

        <Section title="团队掠影：专业且富有激情的我们" icon={Users} className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 dark:from-primary/20 dark:via-gray-800/50 dark:to-secondary/20">
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            我们是一支多元化、充满活力和创造力的团队，成员们拥有丰富的行业经验和对产品极致追求的热情。从经验丰富的工程师、富有创意的设计师，到专业的营养顾问和活跃的社区运营，每一位成员都为 {appName} 的成长贡献着自己的力量。
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700/70 p-6 rounded-lg shadow-lg text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border-2 border-primary">
                <Code2 className="w-12 h-12 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200">张三</h4>
              <p className="text-primary dark:text-secondary text-sm">首席技术官</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">“用代码构建更便捷的健康生活。”</p>
            </div>
            <div className="bg-white dark:bg-gray-700/70 p-6 rounded-lg shadow-lg text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border-2 border-primary">
                <Palette className="w-12 h-12 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200">李四</h4>
              <p className="text-primary dark:text-secondary text-sm">产品设计师</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">“打造极致用户体验，让烹饪充满乐趣。”</p>
            </div>
            <div className="bg-white dark:bg-gray-700/70 p-6 rounded-lg shadow-lg text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 border-2 border-primary">
                <Apple className="w-12 h-12 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200">王五</h4>
              <p className="text-primary dark:text-secondary text-sm">营养顾问</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">“科学搭配，吃出健康好滋味。”</p>
            </div>
          </div>
          <p className="text-center mt-8 text-gray-600 dark:text-gray-300">
            我们因共同的目标而聚集，因用户的信任而努力。
          </p>
        </Section>

        <Section title="未来展望：与您共创精彩" icon={Rocket}>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {appName} 的旅程才刚刚开始。我们深知，一款优秀的产品需要不断进化与完善。未来，我们将持续投入研发，探索更多创新功能，例如：
          </p>
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <li>更精准的个性化营养分析与建议。</li>
            <li>更丰富的食材数据库与产地溯源信息。</li>
            <li>引入AI烹饪助手，提供实时步骤指导。</li>
            <li>拓展线下活动与课程，构建更紧密的美食社群。</li>
            <li>支持更多智能厨电设备联动，打造智能厨房生态。</li>
          </ul>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            我们坚信，通过不断的努力和创新，{appName} 将成为您厨房中最得力的助手，餐桌上最亮丽的风景。我们期待与您一同见证 {appName} 的成长，共同开启健康美味生活的新篇章！
          </p>
        </Section>

        <Section title="安全与信任" icon={ShieldCheck}>
           <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            您的数据安全和隐私对我们至关重要。我们采用行业领先的安全措施来保护您的个人信息，并严格遵守相关法律法规。您可以放心使用 {appName}，我们将竭尽所能确保您的数据安全。
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            有关我们如何处理您的数据的更多详细信息，请参阅我们的<a href="/privacy-policy" className="text-primary hover:underline">隐私政策</a>。
          </p>
        </Section>

      </div>
    </div>
  );
} 