/**
 * 中国网络环境下的配置
 * 这个文件包含了针对中国网络环境的优化配置
 */

// 字体配置
export const fontConfig = {
  // 使用中国CDN加载字体
  fontCDN: 'https://fonts.font.im',
  // 备用字体
  fallbackFonts: '"PingFang SC", "Microsoft YaHei", "微软雅黑", Arial, sans-serif',
};

// 图片配置
export const imageConfig = {
  // 使用中国CDN加载图片
  imageCDN: 'https://cdn.yourdomain.com',
  // 本地图片路径
  localImagePath: '/local-storage/images',
  // 图片占位符
  placeholder: '/placeholder.svg',
};

// 网络配置
export const networkConfig = {
  // 请求超时时间（毫秒）
  timeout: 10000,
  // 重试次数
  retryCount: 3,
  // 重试延迟（毫秒）
  retryDelay: 1000,
};

// Supabase配置
export const supabaseConfig = {
  // 是否使用本地存储替代Supabase
  useLocalStorage: true,
  // Supabase URL
  url: 'https://desoaoudgnhrhdpsqcbu.supabase.co',
  // Supabase Key
  key: '1e543fe4e8ffdd81c53a42edca7a15cd048839b5a228c97a05b63ef0fe736ab2',
  // 备用服务器
  fallbackUrl: 'https://your-fallback-server.com',
};

// 创建一个带有重试功能的fetch函数
export const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = networkConfig.retryCount) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), networkConfig.timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    return response;
  } catch (error) {
    if (retries > 0) {
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, networkConfig.retryDelay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// 创建一个带有回退机制的Supabase客户端
export const createSupabaseClient = (createClient: Function) => {
  // 如果使用本地存储，则返回本地存储服务
  if (supabaseConfig.useLocalStorage) {
    return import('../lib/local-storage').then(module => module.localStorageService);
  }
  
  // 否则创建Supabase客户端
  return createClient(supabaseConfig.url, supabaseConfig.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: fetchWithRetry,
    },
  });
};
