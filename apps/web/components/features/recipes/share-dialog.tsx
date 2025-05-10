"use client"

import { useState, useEffect } from "react"
import { Button } from "@repo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"
import { Input } from "@repo/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Copy, Check, Mail, Share2, MessageSquare } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface ShareDialogProps {
  recipeId: string
  recipeTitle: string
  recipeCoverImage?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ 
  recipeId, 
  recipeTitle, 
  recipeCoverImage,
  open, 
  onOpenChange 
}: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleShare = async () => {
    setIsLoading(true)
    setError(null)
    setCopied(false)

    try {
      const response = await fetch(`/api/recipes/${recipeId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "分享失败")
      }

      const data = await response.json()
      setShareUrl(data.shareUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "分享失败，请稍后再试")
      console.error("Share error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && !shareUrl && !isLoading && !error) {
      handleShare();
    } else if (!open) {
      setShareUrl(null);
      setIsLoading(false);
      setCopied(false);
      setError(null);
    }
  }, [open, shareUrl, isLoading, error]);

  const copyToClipboard = () => {
    if (!shareUrl) return

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
        alert("复制失败，请检查浏览器权限或手动复制。")
      })
  }

  const shareToSocial = (platform: string) => {
    if (!shareUrl) return

    let shareLink = ""
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(`来看看这个美味食谱：「${recipeTitle}」`)
    const encodedSummary = encodeURIComponent(`我在食谱计划APP发现了一个超棒的食谱：${recipeTitle}，快来看看吧！${shareUrl}`)
    const encodedImageUrl = recipeCoverImage ? encodeURIComponent(recipeCoverImage) : "";

    switch (platform) {
      case "weibo":
        shareLink = `http://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}&pic=${encodedImageUrl}`
        break
      case "qq":
        shareLink = `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}&pics=${encodedImageUrl}`
        break
      case "email":
        shareLink = `mailto:?subject=${encodedTitle}&body=嘿，我发现了一个很棒的食谱，快来看看吧：%0D%0A${recipeTitle}%0D%0A链接：${encodedUrl}`
        break
      case "xiaohongshu":
      case "douyin":
        copyToClipboard();
        alert(platform === 'xiaohongshu' ? "链接已复制，请打开小红书App粘贴分享！" : "链接已复制，请打开抖音App粘贴分享！");
        return;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享食谱</DialogTitle>
          <DialogDescription>将这个美味的食谱分享给你的朋友和家人。</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {error ? (
            <div className="text-center text-destructive-foreground bg-destructive p-3 rounded-md mb-4">{error}</div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div role="status" className="inline-flex flex-col items-center">
                <svg aria-hidden="true" className="w-8 h-8 text-muted-foreground animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">加载中...</span>
              </div>
              <p className="mt-2 text-muted-foreground">生成分享链接中...</p>
            </div>
          ) : shareUrl ? (
            <Tabs defaultValue="link" className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="link">复制链接</TabsTrigger>
                <TabsTrigger value="qrcode">二维码</TabsTrigger>
                <TabsTrigger value="social">社交媒体</TabsTrigger>
              </TabsList>
              <TabsContent value="link" className="pt-4">
                <div className="flex items-center space-x-2">
                  <Input value={shareUrl} readOnly className="flex-1 bg-muted border-muted-foreground/30" />
                  <Button size="icon" onClick={copyToClipboard} aria-label="复制链接">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {copied && <p className="mt-2 text-sm text-green-600">链接已复制到剪贴板！</p>}
              </TabsContent>
              <TabsContent value="qrcode" className="pt-4">
                <div className="flex flex-col items-center py-4 bg-card p-4 rounded-md">
                  <QRCodeSVG value={shareUrl} size={180} includeMargin={true} />
                  <p className="mt-3 text-center text-sm text-muted-foreground">使用微信或其他应用扫描二维码分享</p>
                </div>
              </TabsContent>
              <TabsContent value="social" className="pt-4">
                <p className="text-sm text-muted-foreground mb-3">分享到：</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-3"
                    onClick={() => shareToSocial("weibo")}
                  >
                    <Share2 className="h-4 w-4" />
                    微博
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-3"
                    onClick={() => shareToSocial("qq")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    QQ
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 py-3" 
                    onClick={() => shareToSocial("email")}
                  >
                    <Mail className="h-4 w-4" />
                    电子邮件
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-3"
                    onClick={() => shareToSocial("xiaohongshu")}
                  >
                    <Share2 className="h-4 w-4" />
                    小红书
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-3"
                    onClick={() => shareToSocial("douyin")}
                  >
                    <Share2 className="h-4 w-4" />
                    抖音
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  提示：微信分享请使用上方的"二维码"功能。
                </p>
              </TabsContent>
            </Tabs>
          ) : (
             <div className="text-center text-muted-foreground py-8">无法加载分享内容，请稍后再试。</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
