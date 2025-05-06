/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'desoaoudgnhrhdpsqcbu.supabase.co',
      },
    ],
  },
  // 禁用严格模式，减少重复渲染
  reactStrictMode: false,
  // 禁用预取，减少网络请求
  onDemandEntries: {
    // 页面保持在内存中的时间（毫秒）
    maxInactiveAge: 60 * 60 * 1000,
    // 同时保持在内存中的页面数
    pagesBufferLength: 5,
  },
  // 配置中国CDN
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.yourdomain.com' : undefined,
}

export default nextConfig
