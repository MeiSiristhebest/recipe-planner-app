"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, Mail } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface ShareDialogProps {
  recipeId: string
  recipeTitle: string
}

export function ShareDialog({ recipeId, recipeTitle }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleShare = async () => {
    if (shareUrl) return // 如果已经有分享链接，不需要再次请求

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/recipes/${recipeId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
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
      })
  }

  const shareToSocial = (platform: string) => {
    if (!shareUrl) return

    let shareLink = ""
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(`我分享了一个美味食谱：${recipeTitle}`)

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        break
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case "email":
        shareLink = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
        break
    }

    if (shareLink) {
      window.open(shareLink, "_blank")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          分享
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享食谱</DialogTitle>
          <DialogDescription>将这个美味的食谱分享给你的朋友和家人</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {error ? (
            <div className="text-center text-red-500 mb-4">{error}</div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">生成分享链接中...</p>
            </div>
          ) : shareUrl ? (
            <Tabs defaultValue="link">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="link">链接</TabsTrigger>
                <TabsTrigger value="qrcode">二维码</TabsTrigger>
                <TabsTrigger value="social">社交媒体</TabsTrigger>
              </TabsList>
              <TabsContent value="link" className="pt-4">
                <div className="flex items-center space-x-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button size="icon" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="qrcode" className="pt-4">
                <div className="flex justify-center py-4">
                  <QRCodeSVG value={shareUrl} size={200} />
                </div>
                <p className="text-center text-sm text-muted-foreground">扫描二维码查看食谱</p>
              </TabsContent>
              <TabsContent value="social" className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => shareToSocial("facebook")}
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => shareToSocial("twitter")}
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => shareToSocial("linkedin")}
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => shareToSocial("email")}>
                    <Mail className="h-4 w-4" />
                    电子邮件
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
