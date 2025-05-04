import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FilterPanel() {
  return (
    <div className="bg-card p-4 rounded-lg border sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">筛选条件</h2>
        <Button variant="ghost" size="sm">
          重置
        </Button>
      </div>

      <Separator className="my-4" />

      <Accordion type="multiple" defaultValue={["categories", "cookingTime", "difficulty", "tags"]}>
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger className="text-base font-medium">分类</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 mt-2">
              {["快手菜", "家常菜", "烘焙", "汤羹", "素食", "海鲜", "肉类", "甜点"].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox id={`category-${category}`} />
                  <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Cooking Time */}
        <AccordionItem value="cookingTime">
          <AccordionTrigger className="text-base font-medium">烹饪时间</AccordionTrigger>
          <AccordionContent>
            <RadioGroup defaultValue="any">
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="any" id="time-any" />
                <Label htmlFor="time-any" className="text-sm cursor-pointer">
                  不限
                </Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="under15" id="time-under15" />
                <Label htmlFor="time-under15" className="text-sm cursor-pointer">
                  15分钟以下
                </Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="15-30" id="time-15-30" />
                <Label htmlFor="time-15-30" className="text-sm cursor-pointer">
                  15-30分钟
                </Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="30-60" id="time-30-60" />
                <Label htmlFor="time-30-60" className="text-sm cursor-pointer">
                  30-60分钟
                </Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="over60" id="time-over60" />
                <Label htmlFor="time-over60" className="text-sm cursor-pointer">
                  60分钟以上
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Difficulty */}
        <AccordionItem value="difficulty">
          <AccordionTrigger className="text-base font-medium">难度</AccordionTrigger>
          <AccordionContent>
            <RadioGroup defaultValue="any">
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="any" id="diff-any" />
                <Label htmlFor="diff-any" className="text-sm cursor-pointer">
                  不限
                </Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="easy" id="diff-easy" />
                <Label htmlFor="diff-easy" className="text-sm cursor-pointer">
                  简单
                </Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="medium" id="diff-medium" />
                <Label htmlFor="diff-medium" className="text-sm cursor-pointer">
                  中等
                </Label>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="hard" id="diff-hard" />
                <Label htmlFor="diff-hard" className="text-sm cursor-pointer">
                  困难
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Special Tags */}
        <AccordionItem value="tags">
          <AccordionTrigger className="text-base font-medium">特殊标签</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 mt-2">
              {["素食", "低卡", "无麸质", "高蛋白", "低脂", "辣", "甜"].map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox id={`tag-${tag}`} />
                  <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator className="my-4" />

      <Button className="w-full">应用筛选</Button>
    </div>
  )
}
