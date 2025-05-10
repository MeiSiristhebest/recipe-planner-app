"use client";

import { SessionProvider } from "next-auth/react";
import type React from "react";

interface AuthProviderProps {
  children: React.ReactNode;
  // session: any; // Optional: if you need to pass initial session from server component
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
} 