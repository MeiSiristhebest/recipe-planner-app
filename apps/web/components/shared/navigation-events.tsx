'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('NProgress attempting to stop on path:', pathname);
    NProgress.done(); // 当路由加载完成时，结束进度条
    // useEffect 的 cleanup 函数会在下次 effect 执行前或组件卸载时执行
    // 我们希望在导航开始时启动进度条
    // 然而，这里的逻辑实际上是：导航完成后结束，下次导航开始前启动（但这个启动点有点晚）
    // 更常见的模式是：在某个全局的 Link 点击处理或路由事件开始时 NProgress.start()
    // 并在路由加载完成时 NProgress.done()

    // 对于App Router，一个更直接的方式是利用 Suspense 的 fallback
    // 或者，如果想严格基于 pathname/searchParams 变化，可以这样：
    // 当 effect 运行时，意味着新的 pathname/searchParams 已经加载完成
    return () => {
      console.log('NProgress attempting to start before path change from:', pathname);
      // 这个 cleanup 函数会在 pathname/searchParams 即将改变之前运行
      NProgress.start(); 
    };
  }, [pathname, searchParams]);

  // 为了确保首次加载时，如果NProgress因为某些原因（例如之前的操作中断）处于活动状态，则将其完成
  useEffect(() => {
    console.log('NProgress initial stop attempt.');
    NProgress.done();
  }, []);

  return null;
} 