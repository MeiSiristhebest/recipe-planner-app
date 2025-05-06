/**
 * 图片资源配置文件
 * 集中管理应用中使用的图片URL
 */

// 食谱图片
export const recipeImages: string[] = [
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=687&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&h=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1170&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1170&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1170&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1170&auto=format&fit=crop",
];

// 主食类食谱
export const mainDishImages: string[] = [
  "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1170&auto=format&fit=crop", // 三文鱼
  "https://images.unsplash.com/photo-1432139509613-5c4255815697?q=80&w=1172&auto=format&fit=crop", // 牛排
  "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1170&auto=format&fit=crop", // 意大利面
  "https://images.unsplash.com/photo-1596797038530-2c107aa4eca8?q=80&w=1170&auto=format&fit=crop", // 寿司
];

// 甜点类食谱
export const dessertImages: string[] = [
  "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1287&auto=format&fit=crop", // 草莓蛋糕
  "https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?q=80&w=1335&auto=format&fit=crop", // 马卡龙
  "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=327&auto=format&fit=crop", // 冰淇淋
];

// 饮品类食谱
export const drinkImages: string[] = [
  "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1374&auto=format&fit=crop", // 咖啡
  "https://images.unsplash.com/photo-1556679343-c1c1ed9f816b?q=80&w=1364&auto=format&fit=crop", // 果汁
  "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?q=80&w=1169&auto=format&fit=crop", // 茶饮
];

// 用户头像
export const userAvatars: string[] = [
  "https://randomuser.me/api/portraits/men/42.jpg",
  "https://randomuser.me/api/portraits/women/42.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/32.jpg",
  "https://randomuser.me/api/portraits/men/22.jpg",
  "https://randomuser.me/api/portraits/women/22.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
];

/**
 * 获取随机食谱图片
 */
export const getRandomRecipeImage = (): string => {
  const index = Math.floor(Math.random() * recipeImages.length);
  return recipeImages[index >= 0 && index < recipeImages.length ? index : 0];
};

/**
 * 获取随机用户头像
 */
export const getRandomUserAvatar = (): string => {
  const index = Math.floor(Math.random() * userAvatars.length);
  return userAvatars[index >= 0 && index < userAvatars.length ? index : 0];
};

/**
 * 根据类别获取食谱图片
 */
export const getRecipeImageByCategory = (category: 'main' | 'dessert' | 'drink' | 'all'): string => {
  let index = 0;
  let images: string[] = recipeImages;
  
  switch (category) {
    case 'main':
      images = mainDishImages;
      index = Math.floor(Math.random() * mainDishImages.length);
      break;
    case 'dessert':
      images = dessertImages;
      index = Math.floor(Math.random() * dessertImages.length);
      break;
    case 'drink':
      images = drinkImages;
      index = Math.floor(Math.random() * drinkImages.length);
      break;
    case 'all':
    default:
      return getRandomRecipeImage();
  }
  
  return images[index >= 0 && index < images.length ? index : 0];
}; 