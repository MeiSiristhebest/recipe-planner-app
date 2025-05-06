"use client"

import { useState } from "react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@repo/ui/dialog"
import { Card, CardContent } from "@repo/ui/card"
import { Label } from "@repo/ui/label"
import type { MealPlanItem } from "@/store/meal-plan-store"

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
  onLoad: (templateId: string) => void
  templates: Array<{
    id: string
    name: string
    items: MealPlanItem[]
  }>
  mode: "save" | "load"
}

export function TemplateModal({ isOpen, onClose, onSave, onLoad, templates, mode }: TemplateModalProps) {
  const [templateName, setTemplateName] = useState("")

  const handleSave = () => {
    if (templateName.trim()) {
      onSave(templateName)
      setTemplateName("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "save" ? "保存为模板" : "加载模板"}</DialogTitle>
          <DialogDescription>
            {mode === "save" ? "为当前的餐饮计划创建一个可复用的模板。" : "从已保存的模板中加载一个餐饮计划。"}
          </DialogDescription>
        </DialogHeader>

        {mode === "save" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">模板名称</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="例如：健康减脂周计划"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="button" onClick={handleSave} disabled={!templateName.trim()}>
                保存
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4 max-h-[500px] overflow-y-auto">
            {templates.length > 0 ? (
              templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.items.length} 个食谱 · 创建于{" "}
                          {new Date(template.items[0]?.recipe.createdAt || Date.now()).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                      <Button onClick={() => onLoad(template.id)}>加载</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">暂无保存的模板</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
