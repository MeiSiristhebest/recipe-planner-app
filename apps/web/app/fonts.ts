import localFont from 'next/font/local'

// 使用本地字体文件
export const notoSansSC = localFont({
  src: [
    {
      path: '../public/fonts/NotoSansSC-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/NotoSansSC-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/NotoSansSC-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-noto-sans-sc',
  display: 'swap',
})

// 系统默认字体回退
export const systemFont = {
  variable: '--font-system',
  style: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
}
