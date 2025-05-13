"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 客户端身份验证守卫组件
 * 用于确保只有已登录用户才能访问受保护的页面
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 如果会话状态已确定（不再是loading）
    if (status !== "loading") {
      // 如果未登录，重定向到登录页面
      if (status === "unauthenticated") {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      } else {
        // 已登录，显示内容
        setIsLoading(false);
      }
    }
  }, [status, router, pathname]);

  // 如果状态正在加载或需要重定向，显示加载状态
  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 已认证，渲染子组件
  return <>{children}</>;
} 