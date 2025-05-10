'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Page Error:", error.message, "Digest:", error.digest);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 px-4 py-12">
      <div className="text-center p-8 md:p-12 bg-white dark:bg-gray-800/80 backdrop-blur-md shadow-2xl rounded-xl max-w-lg w-full ring-1 ring-red-200 dark:ring-red-700/50">
        <AlertOctagon className="w-24 h-24 text-red-500 dark:text-red-400 mx-auto mb-6" />
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          噢不，发生了一些错误
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          我们对此感到非常抱歉。我们的团队已收到通知，您可以尝试刷新页面或稍后再试。
        </p>
        
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 p-4 mb-6 rounded-md text-left">
            <p className="font-semibold">错误详情 (开发模式)：</p>
            <pre className="text-xs whitespace-pre-wrap break-all mt-2 p-2 bg-red-100 dark:bg-red-800/40 rounded-sm font-mono">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
              {error.stack && `\n\nStack Trace:\n${error.stack}`}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <button
            onClick={() => reset()} // Attempt to recover by re-rendering the segment
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-all duration-150 ease-in-out hover:shadow-lg active:scale-95 w-full sm:w-auto"
          >
            <RefreshCw className="w-5 h-5 mr-2 -ml-1" />
            重试
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-700/30 hover:bg-red-200 dark:hover:bg-red-700/50 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-all duration-150 ease-in-out hover:shadow-lg active:scale-95 w-full sm:w-auto text-center"
          >
            <Home className="w-5 h-5 mr-2 -ml-1" />
            返回首页
          </Link>
        </div>

        <p className="mt-12 text-xs text-gray-500 dark:text-gray-400">
          如果问题持续存在，请考虑查看浏览器控制台或联系我们的支持团队。
        </p>
      </div>
    </div>
  );
} 