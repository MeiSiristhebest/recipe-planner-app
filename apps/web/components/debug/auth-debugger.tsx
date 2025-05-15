"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";

/**
 * 认证调试组件
 * 仅在开发环境中使用，用于调试认证状态
 */
export function AuthDebugger() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [cookies, setCookies] = useState<string>("");

  // 获取所有cookie
  useEffect(() => {
    setCookies(document.cookie);
  }, []);

  // 仅在开发环境中显示
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const refreshSession = async () => {
    await update();
    setCookies(document.cookie);
  };

  const clearSessionAndRedirect = () => {
    // 清除会话并重定向到首页
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleVisibility}
        className="mb-2"
      >
        {isVisible ? "隐藏认证调试" : "显示认证调试"}
      </Button>

      {isVisible && (
        <Card className="w-96 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              认证状态调试
              <Badge variant={status === "authenticated" ? "success" : status === "loading" ? "outline" : "destructive"}>
                {status === "authenticated" ? "已认证" : status === "loading" ? "加载中" : "未认证"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <p className="font-semibold mb-1">当前路径:</p>
              <p className="bg-muted p-1 rounded">{pathname}</p>
            </div>

            <div>
              <p className="font-semibold mb-1">查询参数:</p>
              <p className="bg-muted p-1 rounded">
                {Array.from(searchParams.entries()).map(([key, value]) => (
                  <span key={key}>
                    {key}: {value}
                    <br />
                  </span>
                ))}
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">会话状态:</p>
              <pre className="bg-muted p-1 rounded overflow-auto max-h-32">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>

            <div>
              <p className="font-semibold mb-1">Cookies:</p>
              <pre className="bg-muted p-1 rounded overflow-auto max-h-32">
                {cookies.split(";").map((cookie) => cookie.trim()).join("\n")}
              </pre>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" onClick={refreshSession}>
                刷新会话
              </Button>
              <Button size="sm" variant="destructive" onClick={clearSessionAndRedirect}>
                清除会话
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
