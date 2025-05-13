import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * 扩展默认的会话类型，添加用户ID
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  /**
   * 扩展用户类型
   */
  interface User {
    id: string
    email: string
    name?: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * 扩展JWT令牌类型
   */
  interface JWT {
    id: string
    email?: string
    name?: string
    picture?: string
  }
} 