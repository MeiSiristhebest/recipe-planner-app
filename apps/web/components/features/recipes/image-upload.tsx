"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageUpload: (file: File) => void
  onImageRemove: () => void
  previewUrl?: string
  label?: string
  className?: string
}

export function ImageUpload({
  onImageUpload,
  onImageRemove,
  previewUrl,
  label = "上传图片",
  className = "",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(previewUrl)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过5MB")
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreview(url)

    // Call parent handler
    onImageUpload(file)
  }

  const handleRemove = () => {
    setPreview(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageRemove()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div className={className}>
      <Label htmlFor="image-upload">{label}</Label>
      {preview ? (
        <div className="mt-2 relative rounded-md overflow-hidden">
          <div className="aspect-video relative">
            <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`mt-2 border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-full bg-primary/10 mb-4">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium mb-1">点击或拖拽上传图片</p>
            <p className="text-xs text-muted-foreground">支持 JPG, PNG, GIF 格式，最大 5MB</p>
          </div>
          <Input
            id="image-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
