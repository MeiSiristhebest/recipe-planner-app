"use client";

import { SessionProvider } from "next-auth/react";
import type React from "react";

interface AuthProviderProps {
  children: React.ReactNode;
  session?: any; // 允许从服务端组件传递初始会话
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // 每5分钟刷新会话
      refetchOnWindowFocus={true} // 窗口获取焦点时刷新会话
    >
      {children}
    </SessionProvider>
  );
} 