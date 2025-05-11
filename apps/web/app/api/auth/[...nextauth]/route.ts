// @ts-nocheck
import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; // 确保这个路径是正确的
import bcrypt from "bcryptjs"; // Uncommented and ensured it's bcryptjs

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email", placeholder: "user@example.com" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credentials missing");
          return null;
        }
        try {
          console.log("Attempting to find user with email:", credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log("User found in DB:", user ? user.email : 'null');

          if (user) {
            // 必须验证密码！
            if (user.password) {
              const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
              if (isPasswordCorrect) {
                 console.log("User authorized:", user.email);
                return { id: user.id, name: user.name, email: user.email, image: user.image };
              }
              console.log("Password incorrect for user:", user.email);
              // 如果密码不正确，明确返回 null
              return null;
            } else {
                // 如果数据库中没有密码 (例如旧的种子用户)，则拒绝登录
                console.log("No password set for user in DB:", user.email);
                return null;
            }
          } else {
            console.log("No user found with email:", credentials.email);
            return null;
          }
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
    // 这里可以添加其他的 OAuth providers, 例如 GitHub, Google 等
    // import GitHubProvider from "next-auth/providers/github";
    // GitHubProvider({
    //   clientId: process.env.GITHUB_ID!,
    //   clientSecret: process.env.GITHUB_SECRET!,
    // }),
  ],
  session: {
    strategy: "jwt", // 使用 JWT 作为会话策略
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // console.log("JWT Callback triggered. Trigger:", trigger, "User:", user, "Token:", token, "Session for update:", session);
      if (trigger === "update" && session) { // 确保 session 存在
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image; // next-auth 倾向于用 picture
        // 注意： email 通常不应该在这里被用户直接更新，除非有特殊流程
      }
      if (user) { // 这个 user 对象来自 authorize 函数的返回或 OAuth provider
        token.id = user.id;
        token.name = user.name;
        token.email = user.email; // 将 email 也加入 token
        token.picture = user.image; // 将 image 加入 token (NextAuth 期望的是 picture 字段)
      }
      // console.log("JWT Callback returning token:", token);
      return token;
    },
    async session({ session, token }) {
      // console.log("Session Callback triggered. Token:", token, "Session:", session);
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null | undefined; // 确保类型匹配
        session.user.email = token.email as string | null | undefined; // 从 token 中获取 email
        session.user.image = token.picture as string | null | undefined; // 从 token 中获取 image (token 中是 picture)
      }
      // console.log("Session Callback returning session:", session);
      return session;
    },
  },
  pages: {
    signIn: '/login', // 自定义登录页面路径
    // error: '/auth/error', // 自定义错误页面 (例如凭证错误)
    // signOut: '/auth/signout',
    // verifyRequest: '/auth/verify-request', // (e.g. for email verification)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  },
  secret: process.env.NEXTAUTH_SECRET, // 必须设置密钥
  // debug: process.env.NODE_ENV === "development", // 开发模式下开启debug
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 