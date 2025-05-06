/**
 * 本地存储服务，作为Supabase的备用方案
 * 在中国网络环境下，如果Supabase连接不稳定，可以使用这个服务
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 本地存储目录
const STORAGE_DIR = path.join(process.cwd(), 'local-storage');

// 确保存储目录存在
if (typeof window === 'undefined' && !fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// 分享数据存储
const SHARES_FILE = path.join(STORAGE_DIR, 'shares.json');

// 初始化分享数据文件
if (typeof window === 'undefined' && !fs.existsSync(SHARES_FILE)) {
  fs.writeFileSync(SHARES_FILE, JSON.stringify([]));
}

// 读取分享数据
function getShares() {
  if (typeof window !== 'undefined') {
    return [];
  }
  const data = fs.readFileSync(SHARES_FILE, 'utf-8');
  return JSON.parse(data);
}

// 保存分享数据
function saveShares(shares: any[]) {
  if (typeof window !== 'undefined') {
    return;
  }
  fs.writeFileSync(SHARES_FILE, JSON.stringify(shares, null, 2));
}

// 创建分享
export async function createShare(recipeData: any) {
  const shares = getShares();
  const shareId = uuidv4();
  
  shares.push({
    id: uuidv4(),
    share_id: shareId,
    recipe_data: recipeData,
    created_at: new Date().toISOString(),
  });
  
  saveShares(shares);
  
  return { shareId };
}

// 获取分享
export async function getShare(shareId: string) {
  const shares = getShares();
  const share = shares.find((s: any) => s.share_id === shareId);
  
  if (!share) {
    return { data: null, error: '分享不存在' };
  }
  
  return { data: share, error: null };
}

// 上传图片
export async function uploadImage(file: Buffer, fileName: string) {
  if (typeof window !== 'undefined') {
    return { error: '只能在服务器端上传图片' };
  }
  
  const imagesDir = path.join(STORAGE_DIR, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const fileExt = path.extname(fileName);
  const newFileName = `${uuidv4()}${fileExt}`;
  const filePath = path.join(imagesDir, newFileName);
  
  fs.writeFileSync(filePath, file);
  
  return {
    data: {
      path: `/local-storage/images/${newFileName}`,
    },
    error: null,
  };
}

// 导出一个兼容Supabase API的本地存储服务
export const localStorageService = {
  from: (table: string) => ({
    insert: async (data: any) => {
      if (table === 'recipe_shares') {
        const { shareId } = await createShare(data.recipe_data);
        return { data: { share_id: shareId }, error: null };
      }
      return { data: null, error: '不支持的表' };
    },
    select: (columns: string) => ({
      eq: (column: string, value: string) => ({
        single: async () => {
          if (table === 'recipe_shares' && column === 'share_id') {
            return getShare(value);
          }
          return { data: null, error: '不支持的查询' };
        },
      }),
    }),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: Buffer) => {
        return uploadImage(file, path);
      },
    }),
  },
};
