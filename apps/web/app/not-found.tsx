'use client';

import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900 px-4 py-12">
      <div className="text-center p-8 md:p-12 bg-white dark:bg-gray-800/80 backdrop-blur-md shadow-2xl rounded-xl max-w-lg w-full ring-1 ring-gray-200 dark:ring-gray-700">
        <AlertTriangle className="w-24 h-24 text-amber-500 mx-auto mb-6" />
        <h1 className="text-8xl md:text-9xl font-bold text-primary dark:text-primary-light">
          404
        </h1>
        <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100">
          页面未找到
        </h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          抱歉，我们无法找到您要查找的页面。
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          它可能已被移动、删除，或者只是一个输入错误。请检查 URL 或返回首页。
        </p>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-gray-800 transition-all duration-150 ease-in-out hover:shadow-lg active:scale-95"
          >
            <Home className="w-5 h-5 mr-2 -ml-1" />
            返回首页
      </Link>
        </div>
        <div className="mt-12">
          <img 
            src="/images/illustrations/404-illustration.svg" // 建议使用更抽象或与品牌相关的插图
            alt="页面未找到插图" 
            className="max-w-xs mx-auto opacity-75 dark:opacity-60"
            onError={(e) => {
              // 尝试加载一个备用插图或隐藏图像
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null; // 防止无限循环
              target.src = '/images/illustrations/fallback-illustration.svg'; // 假设有一个备用SVG
              target.alt = '插图加载失败';
            }}
          />
           {/* 建议在 public/images/illustrations/ 目录下放置一张404相关的SVG插图，以及一张备用插图 fallback-illustration.svg */}
        </div>
      </div>
    </div>
  );
} 