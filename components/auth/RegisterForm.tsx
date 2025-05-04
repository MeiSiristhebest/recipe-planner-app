"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "用户名至少需要2个字符" }),
    email: z.string().email({ message: "请输入有效的电子邮箱" }),
    password: z.string().min(6, { message: "密码至少需要6个字符" }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, { message: "您必须同意条款和条件" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "密码不匹配",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "注册失败")
      }

      toast({
        title: "注册成功",
        description: "您的账户已创建，正在登录...",
      })

      // 自动登录
      await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "注册失败",
        description: error instanceof Error ? error.message : "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">用户名</Label>
        <Input id="name" placeholder="您的用户名" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">电子邮箱</Label>
        <Input id="email" type="email" placeholder="your@email.com" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">确认密码</Label>
        <Input id="confirm-password" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" {...register("terms")} />
        <Label htmlFor="terms" className="text-sm">
          我同意{" "}
          <a href="/terms" className="text-primary hover:underline">
            使用条款
          </a>{" "}
          和{" "}
          <a href="/privacy" className="text-primary hover:underline">
            隐私政策
          </a>
        </Label>
      </div>
      {errors.terms && <p className="text-sm text-destructive">{errors.terms.message}</p>}

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        注册
      </Button>
    </form>
  )
}
