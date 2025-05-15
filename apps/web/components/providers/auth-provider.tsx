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
      refetchInterval={1 * 60} // 每1分钟刷新会话，增加刷新频率
      refetchOnWindowFocus={true} // 窗口获取焦点时刷新会话
      refetchWhenOffline={false} // 离线时不刷新
    >
      {children}
    </SessionProvider>
  );
}