import type { Prisma } from '@prisma/client';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Helper function to get a random element from an array
function getRandomElement<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error("Cannot get random element from an empty array.");
  }
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// Helper function to get a random subset of elements from an array
function getRandomSubset<T>(arr: T[], minCount: number, maxCount: number): T[] {
  const count =
    Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log(`Start seeding ...`);

  // --- Clean up existing data ---
  console.log("Cleaning up existing data...");
  await prisma.shoppingListItem.deleteMany({});
  await prisma.shoppingList.deleteMany({});
  await prisma.mealPlanItem.deleteMany({});
  await prisma.mealPlan.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.categoryOnRecipe.deleteMany({});
  await prisma.tagOnRecipe.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Existing data cleaned.");

  // --- Create Users ---
  console.log("Creating users...");
  const usersData = [
    {
      email: "foodie_explorer@example.com",
      name: "美食探险家阿明",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=foodie_explorer",
    },
    {
      email: "midnight_chef_cat@example.com",
      name: "深夜食堂的猫",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=midnight_chef_cat",
    },
    {
      email: "baking_witch_lily@example.com",
      name: "烘焙小魔女莉莉",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=baking_witch_lily",
    },
    {
      email: "fitness_food_max@example.com",
      name: "健身食谱达人Max",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=fitness_food_max",
    },
    {
      email: "homestyle_wang_ma@example.com",
      name: "家常菜爱好者王师傅",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=homestyle_wang_ma",
    },
    {
      email: "simple_cook_dave@example.com",
      name: "厨房新手小明",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=simple_cook_dave",
    },
    {
      email: "gourmet_sara@example.com",
      name: "环球美食家莎莎",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=gourmet_sara",
    },
    {
      email: "vegan_chef_leo@example.com",
      name: "素食主义者李大师",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=vegan_chef_leo",
    },
    {
      email: "dessert_queen_anna@example.com",
      name: "甜品女王安娜",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=dessert_queen_anna",
    },
    {
      email: "spicy_lover_chen@example.com",
      name: "无辣不欢陈师傅",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=spicy_lover_chen",
    },
    {
      email: "veggie_lover@example.com",
      name: "素食小清新",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=veggie_lover",
    },
    {
      email: "brunch_queen@example.com",
      name: "早午餐女王",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=brunch_queen",
    },
    {
      email: "dessert_fan@example.com",
      name: "甜品控小妹",
      image: "https://api.dicebear.com/8.x/rings/svg?seed=dessert_fan",
    },
  ];
  const createdUsers = [];
  for (const uData of usersData) {
    const user = await prisma.user.create({ data: uData });
    createdUsers.push(user);
  }
  console.log(`Created ${createdUsers.length} users.`);

  // --- Create Categories ---
  console.log("Creating categories...");
  const categoriesData = [
    { name: "家常菜" },
    { name: "快手菜" },
    { name: "烘焙甜点" },
    { name: "滋补靓汤" },
    { name: "健康素食" },
    { name: "创意西餐" },
    { name: "活力早餐" },
    { name: "花样主食" },
    { name: "清爽饮品" },
    { name: "轻食沙拉" },
    { name: "健身餐" },
    { name: "节日限定" },
    { name: "亚洲风味" },
    { name: "烧烤料理" },
    { name: "宝宝辅食" },
  ];
  await prisma.category.createMany({
    data: categoriesData,
    skipDuplicates: true,
  });
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));
  console.log(`Created/verified ${categories.length} categories.`);

  // --- Create Tags ---
  console.log("Creating tags...");
  const tagsData = [
    { name: "高蛋白" },
    { name: "低卡轻脂" },
    { name: "新手友好" },
    { name: "营养均衡" },
    { name: "儿童喜爱" },
    { name: "麻辣鲜香" },
    { name: "酸甜开胃" },
    { name: "空气炸锅" },
    { name: "brunch" },
    { name: "素食可选" },
    { name: "烤箱必备" },
    { name: "十分钟搞定" },
    { name: "宴客菜" },
    { name: "一人食" },
    { name: "生酮推荐" },
    { name: "无麸质" },
    { name: "夏季特饮" },
    { name: "冬季暖身" },
    { name: "亚洲风味" },
    { name: "快手菜" },
  ];
  await prisma.tag.createMany({ data: tagsData, skipDuplicates: true });
  const tags = await prisma.tag.findMany();
  const tagMap = new Map(tags.map((t) => [t.name, t.id]));
  console.log(`Created/verified ${tags.length} tags.`);

  // --- Create Recipes ---
  console.log("Creating recipes...");
  interface RecipeSeedData {
    title: string;
    description?: string | null;
    cookingTime: number;
    servings: number;
    difficulty: string;
    ingredients: Prisma.JsonArray;
    instructions: Prisma.JsonArray;
    nutritionInfo?: Prisma.InputJsonValue;
    coverImage?: string | null;
    published?: boolean;
    authorId: string;
    categories: {
      create: { categoryId: string }[];
    };
    tags: {
      create: { tagId: string }[];
    };
  }

  const recipesData: RecipeSeedData[] = [
    {
      title: '香浓番茄牛肉意面',
      description: '浓郁的番茄肉酱搭配Q弹意面，简单又美味的经典选择。全家都爱！',
      cookingTime: 45,
      servings: 2,
      difficulty: '中等',
      ingredients: [
        { name: '意大利面', quantity: '200', unit: '克' },
        { name: '牛肉末', quantity: '150', unit: '克' },
        { name: '番茄', quantity: '2', unit: '个 (中等大小)' },
        { name: '洋葱', quantity: '半个' },
        { name: '胡萝卜', quantity: '半根' },
        { name: '芹菜', quantity: '1根' },
        { name: '蒜', quantity: '2瓣' },
        { name: '番茄膏 (Tomato Paste)', quantity: '1', unit: '汤匙' },
        { name: '红酒 (可选)', quantity: '50', unit: '毫升' },
        { name: '橄榄油', quantity: '适量' },
        { name: '盐', quantity: '适量' },
        { name: '黑胡椒', quantity: '适量' },
        { name: '综合香草 (可选)', quantity: '少许' },
        { name: '帕玛森芝士碎 (可选)', quantity: '适量' },
      ] as Prisma.JsonArray,
      instructions: [
        '洋葱、胡萝卜、芹菜、蒜切末。番茄去皮切丁。',
        '锅中倒橄榄油，中火加热，放入洋葱末、胡萝卜末、芹菜末炒软，约5分钟。',
        '加入蒜末炒香，然后加入牛肉末，用铲子打散，炒至变色。',
        '加入番茄膏，翻炒1分钟。如果使用红酒，此时加入，煮至酒精挥发。',
        '加入番茄丁，翻炒均匀，煮至番茄出汁变软。',
        '加入适量水或高汤（刚没过食材即可），加入综合香草（如果使用），转小火慢炖20-30分钟，期间搅拌几次，直到酱汁浓稠。',
        '同时，另起一锅煮意面。水中加少许盐，水沸后放入意面，按照包装说明煮至al dente (有嚼劲)。',
        '意面煮好后捞出，沥干水分（可以保留少量煮面水）。',
        '将煮好的意面加入肉酱锅中，或将肉酱淋在面上。如果酱汁太干，可以加入少量煮面水。',
        '用盐和黑胡椒调味，翻拌均匀。出锅前可撒上帕玛森芝士碎。',
      ] as Prisma.JsonArray,
      nutritionInfo: {
        servingSize: '约 400克/份',
        calories: 580,
        protein: 28,
        fat: 22,
        carbohydrates: 65,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1588547282861-9093f4c99709?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: createdUsers[0]!.id,
      categories: {
        create: [
          { categoryId: categoryMap.get("创意西餐")! },
          { categoryId: categoryMap.get("花样主食")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('营养均衡')! },
          { tagId: tagMap.get('儿童喜爱')! },
          { tagId: tagMap.get('宴客菜')! },
        ],
      },
    },
    {
      title: '空气炸锅香辣鸡翅',
      description: '外皮酥脆，内里多汁的香辣鸡翅，用空气炸锅制作更健康！',
      cookingTime: 25,
      servings: 2,
      difficulty: '简单',
      ingredients: [
        { name: '鸡中翅', quantity: '10', unit: '只' },
        { name: '生抽', quantity: '2', unit: '汤匙' },
        { name: '料酒', quantity: '1', unit: '汤匙' },
        { name: '蚝油', quantity: '1', unit: '汤匙' },
        { name: '辣椒粉', quantity: '1', unit: '茶匙' },
        { name: '花椒粉', quantity: '半', unit: '茶匙' },
        { name: '蒜末', quantity: '3瓣量' },
        { name: '姜末', quantity: '少许' },
        { name: '蜂蜜或白糖', quantity: '1', unit: '茶匙' },
        { name: '白芝麻（可选）', quantity: '少许' },
      ] as Prisma.JsonArray,
      instructions: [
        '鸡中翅洗净，两面各划几刀方便入味。',
        '加入生抽、料酒、蚝油、辣椒粉、花椒粉、蒜末、姜末、蜂蜜（或白糖）抓匀，腌制至少30分钟（隔夜更佳）。',
        '空气炸锅预热180°C (350°F)。',
        '将腌好的鸡翅平铺在炸篮内，不要重叠。',
        '180°C烤15-20分钟，中途翻面一次，确保两面金黄酥脆。',
        '出锅前可撒上白芝麻点缀。',
      ] as Prisma.JsonArray,
      nutritionInfo: {
        calories: 350,
        protein: 30,
        fat: 20,
        carbohydrates: 30,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        servingSize: '约180克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1618313799581-363d714a4c63?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get('快手菜')! },
          { categoryId: categoryMap.get('家常菜')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('空气炸锅')! },
          { tagId: tagMap.get('麻辣鲜香')! },
          { tagId: tagMap.get('高蛋白')! },
        ],
      },
    },
    {
      title: '抹茶红豆麻薯软欧包',
      description: '清新抹茶与香甜红豆、软糯麻薯的完美结合，面包控的福音。',
      cookingTime: 180,
      servings: 4,
      difficulty: '困难',
      ingredients: [
        { name: '高筋面粉', quantity: '250', unit: '克' },
        { name: '抹茶粉', quantity: '10', unit: '克' },
        { name: '细砂糖', quantity: '30', unit: '克' },
        { name: '盐', quantity: '3', unit: '克' },
        { name: '酵母', quantity: '3', unit: '克' },
        { name: '牛奶', quantity: '170', unit: '毫升' },
        { name: '黄油（室温软化）', quantity: '20', unit: '克' },
        { name: '市售麻薯预拌粉或自制麻薯', quantity: '150', unit: '克' },
        { name: '蜜红豆', quantity: '100', unit: '克' },
      ] as Prisma.JsonArray,
      instructions: [
        '将高筋面粉、抹茶粉、糖、盐混合均匀，加入酵母和牛奶，揉成面团。',
        '面团揉至扩展阶段后，加入软化黄油，继续揉至完全阶段（能拉出薄膜）。',
        '面团进行第一次发酵至两倍大（约1小时）。',
        '制作或准备麻薯，分成小份。',
        '发酵好的面团排气，分割成等份，滚圆松弛15分钟。',
        '取一面团擀开，包入麻薯和红豆馅，收口捏紧。',
        '进行第二次发酵至1.5倍大（约40分钟）。',
        '烤箱预热180°C (350°F)。',
        '在面包表面筛少许高粉或抹茶粉（可选），割包（可选）。',
        '放入烤箱中层，烤18-20分钟至表面上色。',
      ] as Prisma.JsonArray,
      nutritionInfo: {
        calories: 280,
        protein: 6,
        fat: 8,
        carbohydrates: 45,
        fiber: 3,
        sugar: 12,
        sodium: 150,
        servingSize: '约100克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1610431575901-189891a13613?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: createdUsers[2]!.id,
      categories: {
        create: [
          { categoryId: categoryMap.get("烘焙甜点")! },
          { categoryId: categoryMap.get("花样主食")! },
          { categoryId: categoryMap.get("节日限定")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("烤箱必备")! },
          { tagId: tagMap.get("亚洲风味")! },
          { tagId: tagMap.get("儿童喜爱")! },
        ],
      },
    },
    {
      title: '经典凯撒沙拉',
      description: '爽脆生菜搭配特调凯撒酱、香脆面包丁和帕玛森芝士，一道经典的美味沙拉。',
      cookingTime: 20,
      servings: 2,
      difficulty: '简单',
      ingredients: [
        { name: '罗马生菜', quantity: '1', unit: '颗' },
        { name: '鸡胸肉（可选）', quantity: '100', unit: '克' },
        { name: '面包丁（Croutons）', quantity: '50', unit: '克' },
        { name: '帕玛森芝士碎', quantity: '30', unit: '克' },
        { name: '凯撒沙拉酱', quantity: '适量' },
        { name: '黑胡椒', quantity: '少许' },
      ] as Prisma.JsonArray,
      instructions: [
        '罗马生菜洗净沥干，撕成适口大小。',
        '如果使用鸡胸肉，提前煎熟或烤熟，切块。',
        '将生菜叶、鸡胸肉（如果使用）、面包丁放入大碗中。',
        '淋上凯撒沙拉酱，撒上帕玛森芝士碎和现磨黑胡椒。',
        '轻轻拌匀即可享用。',
      ] as Prisma.JsonArray,
      nutritionInfo: {
        calories: 400,
        protein: 10,
        fat: 30,
        carbohydrates: 20,
        fiber: 3,
        sugar: 2,
        sodium: 450,
        servingSize: '约220克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get("轻食沙拉")! },
          { categoryId: categoryMap.get("创意西餐")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('低卡轻脂')! },
          { tagId: tagMap.get('营养均衡')! },
          { tagId: tagMap.get('快手菜')! },
        ],
      },
    },
    {
      title: '活力芒果香蕉思慕雪',
      description: '充满热带风情的芒果香蕉思慕雪，营养丰富，是早餐或加餐的绝佳选择。',
      cookingTime: 5,
      servings: 1,
      difficulty: '简单',
      ingredients: [
        { name: '芒果（冷冻）', quantity: '1', unit: '杯切块' },
        { name: '香蕉（冷冻）', quantity: '1', unit: '根' },
        { name: '希腊酸奶或普通酸奶', quantity: '1/2', unit: '杯' },
        { name: '牛奶或杏仁奶', quantity: '1/4', unit: '杯 (按需调整)' },
        { name: '蜂蜜或枫糖浆（可选）', quantity: '1', unit: '茶匙' },
        { name: '奇亚籽（可选，点缀）', quantity: '少许' },
      ] as Prisma.JsonArray,
      instructions: [
        '将冷冻芒果块、冷冻香蕉段、酸奶和少量牛奶（或杏仁奶）放入搅拌机中。',
        '高速搅拌至顺滑浓稠。如果太稠，可以少量多次加入牛奶调整稠度。',
        '尝一下甜度，如果需要可以加入蜂蜜或枫糖浆再次搅打均匀。',
        '倒入杯中，可撒上奇亚籽或其他喜欢的坚果碎、水果丁点缀。',
      ] as Prisma.JsonArray,
      nutritionInfo: {
        calories: 300,
        protein: 15,
        fat: 5,
        carbohydrates: 52,
        fiber: 8,
        sugar: 35,
        sodium: 45,
        servingSize: '约350毫升/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1505252585461-1f513037cd3d?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get('清爽饮品')! },
          { categoryId: categoryMap.get('活力早餐')! },
          { categoryId: categoryMap.get('健身餐')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('营养均衡')! },
          { tagId: tagMap.get('十分钟搞定')! },
          { tagId: tagMap.get('夏季特饮')! },
        ],
      },
    },
    {
      title: '韩式泡菜炒饭',
      description: '经典韩式料理，酸辣开胃，简单快捷，剩饭也能变美味。',
      cookingTime: 15,
      servings: 1,
      difficulty: '简单',
      ingredients: [
        { name: '米饭（隔夜饭佳）', quantity: '1', unit: '碗' },
        { name: '韩式泡菜', quantity: '100', unit: '克' },
        { name: '五花肉或午餐肉（可选）', quantity: '50', unit: '克' },
        { name: '洋葱', quantity: '1/4', unit: '个' },
        { name: '鸡蛋', quantity: '1', unit: '个' },
        { name: '韩式辣酱（Gochujang）', quantity: '1', unit: '汤匙' },
        { name: '酱油', quantity: '1', unit: '茶匙' },
        { name: '香油', quantity: '少许' },
        { name: '海苔碎、白芝麻（可选）', quantity: '适量' },
      ] as Prisma.JsonArray,
      instructions: [
        '泡菜切碎，洋葱切丁，五花肉/午餐肉切小片。',
        '锅中放少许油，先炒香五花肉/午餐肉和洋葱丁。',
        '加入泡菜碎翻炒出香味，再加入韩式辣酱炒匀。',
        '倒入米饭，用铲子打散，与酱料充分混合。',
        '加入酱油调味，翻炒均匀。',
        '另起一锅煎一个溏心荷包蛋。',
        '炒饭盛出，盖上荷包蛋，淋少许香油，撒上海苔碎和白芝麻即可。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 420, 
        protein: 18, 
        fat: 15, 
        carbohydrates: 55,
        fiber: 3,
        sugar: 4,
        sodium: 580,
        servingSize: '约330克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1596043463012-fabf9d15f957?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get('亚洲风味')! },
          { categoryId: categoryMap.get('快手菜')! },
          { categoryId: categoryMap.get('花样主食')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('酸甜开胃')! },
          { tagId: tagMap.get('一人食')! },
        ],
      },
    },
    {
      title: '蒜蓉西兰花',
      description: '清淡爽口，营养丰富的快手家常菜，蒜香浓郁。',
      cookingTime: 10,
      servings: 2,
      difficulty: '简单',
      ingredients: [
        { name: '西兰花', quantity: '1', unit: '颗 (约300克)' },
        { name: '大蒜', quantity: '4-5', unit: '瓣' },
        { name: '盐', quantity: '适量' },
        { name: '食用油', quantity: '适量' },
        { name: '蚝油（可选）', quantity: '1', unit: '茶匙' },
      ] as Prisma.JsonArray,
      instructions: [
        '西兰花掰成小朵，用盐水浸泡10分钟后洗净沥干。大蒜切末。',
        '锅中烧开水，加入少许盐和几滴油，放入西兰花焯水1-2分钟至颜色变翠绿，捞出沥干。',
        '炒锅中倒油烧热，放入蒜末爆香。',
        '倒入焯好的西兰花，快速翻炒均匀。',
        '加入适量盐和蚝油（如果使用）调味，翻炒均匀即可出锅。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 80, 
        protein: 6,
        fat: 3, 
        carbohydrates: 7, 
        fiber: 5, 
        sugar: 2,
        sodium: 30,
        servingSize: '约150克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1580958163248-8c72d53307c7?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get('家常菜')! },
          { categoryId: categoryMap.get('健康素食')! },
          { categoryId: categoryMap.get('快手菜')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('低卡轻脂')! },
          { tagId: tagMap.get('营养均衡')! },
          { tagId: tagMap.get('十分钟搞定')! },
        ],
      },
    },
    {
      title: '烤箱版蜜汁叉烧',
      description: '在家轻松复刻茶餐厅经典美味，色泽红亮，甜咸适中，肉质软嫩。',
      cookingTime: 90,
      servings: 3,
      difficulty: '中等',
      ingredients: [
        { name: '猪梅花肉（Pork Shoulder Butt）', quantity: '500', unit: '克' },
        { name: '叉烧酱（市售）', quantity: '4', unit: '汤匙' },
        { name: '生抽', quantity: '1', unit: '汤匙' },
        { name: '老抽', quantity: '1/2', unit: '茶匙（上色）' },
        { name: '料酒', quantity: '1', unit: '汤匙' },
        { name: '蜂蜜', quantity: '2', unit: '汤匙（最后刷面用）' },
        { name: '蒜末', quantity: '2', unit: '瓣量' },
        { name: '姜片', quantity: '3', unit: '片' },
      ] as Prisma.JsonArray,
      instructions: [
        '猪梅花肉切成2-3cm厚的长条。',
        '将叉烧酱、生抽、老抽、料酒、蒜末、姜片混合均匀，作为腌料。',
        '将肉条放入腌料中，充分按摩，确保每面都裹上酱汁。密封后放入冰箱冷藏腌制至少4小时，隔夜更佳。',
        '烤箱预热200°C (400°F)。烤盘铺上锡纸（方便清洁）。',
        '将腌好的肉条放在烤架上，烤盘置于烤架下方接滴落的酱汁。',
        '放入烤箱中层，烤约20分钟。取出翻面，刷一层腌料汁，再烤20分钟。',
        '最后将蜂蜜均匀刷在叉烧表面，再烤5-10分钟，或烤至表面呈漂亮的焦糖色并略带焦香。',
        '取出后静置10分钟再切片享用。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 350, 
        protein: 28, 
        fat: 20, 
        carbohydrates: 15,
        fiber: 0,
        sugar: 12,
        sodium: 720,
        servingSize: '约170克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1600301461285-363d714a4c63?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get('家常菜')! },
          { categoryId: categoryMap.get('亚洲风味')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('烤箱必备')! },
          { tagId: tagMap.get('宴客菜')! },
        ],
      },
    },
    {
      title: '日式厚蛋烧 (玉子烧)',
      description: '层层叠加的嫩滑鸡蛋卷，是日式便当和早餐的常见美味。',
      cookingTime: 15,
      servings: 1,
      difficulty: '中等',
      ingredients: [
        { name: '鸡蛋', quantity: '3', unit: '个' },
        { name: '日式高汤（Dashi）或水', quantity: '2', unit: '汤匙' },
        { name: '味醂（Mirin）', quantity: '1', unit: '茶匙' },
        { name: '酱油', quantity: '1/2', unit: '茶匙' },
        { name: '糖（可选）', quantity: '1/2', unit: '茶匙' },
        { name: '盐', quantity: '一小撮' },
        { name: '食用油', quantity: '适量' },
      ] as Prisma.JsonArray,
      instructions: [
        '鸡蛋打散，加入日式高汤（或水）、味醂、酱油、糖（如果使用）和盐，轻轻搅拌均匀，不要打出过多气泡。可以过筛一遍使蛋液更细腻。',
        '玉子烧专用方形煎锅（或普通小号平底不粘锅）中火加热，刷薄薄一层油。',
        '倒入约1/3的蛋液，铺满锅底。待蛋液半凝固时，从一端轻轻卷起至另一端。',
        '将卷好的蛋卷推至锅的一边，在空出的地方再刷一层油，倒入剩下蛋液的1/2。',
        '提起已卷好的蛋卷，让新倒入的蛋液流到其下方。待新蛋液半凝固时，再次将蛋卷从已卷好的一端向另一端卷起。',
        '重复以上步骤，直到所有蛋液用完。',
        '煎好的厚蛋烧可以放在寿司竹帘上整形，使其更紧实。稍凉后切块即可。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 240, 
        protein: 15, 
        fat: 18, 
        carbohydrates: 4,
        fiber: 0,
        sugar: 2,
        sodium: 280,
        servingSize: '约120克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1582881902808-91b156668692?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get("活力早餐")! },
          { categoryId: categoryMap.get("亚洲风味")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("新手友好")! },
          { tagId: tagMap.get("儿童喜爱")! },
        ],
      },
    },
    {
      title: '经典蓝莓玛芬',
      description: '松软香甜的玛芬蛋糕，点缀着多汁的蓝莓，是下午茶或早餐的完美选择。',
      cookingTime: 30,
      servings: 12,
      difficulty: '简单',
      ingredients: [
        { name: '中筋面粉', quantity: '250', unit: '克 (2 杯)' },
        { name: '白砂糖', quantity: '150', unit: '克 (3/4 杯)' },
        { name: '泡打粉', quantity: '2', unit: '茶匙' },
        { name: '盐', quantity: '1/2', unit: '茶匙' },
        { name: '鸡蛋', quantity: '1', unit: '个 (大号)' },
        { name: '牛奶', quantity: '120', unit: '毫升 (1/2 杯)' },
        { name: '植物油或融化黄油', quantity: '80', unit: '毫升 (1/3 杯)' },
        { name: '香草精', quantity: '1', unit: '茶匙' },
        { name: '新鲜或冷冻蓝莓', quantity: '150', unit: '克 (1 杯)' },
      ] as Prisma.JsonArray,
      instructions: [
        '烤箱预热至200°C (400°F)。玛芬烤盘放入纸杯。',
        '在一个大碗中，混合面粉、糖、泡打粉和盐。',
        '在另一个碗中，打散鸡蛋，然后加入牛奶、油（或融化黄油）和香草精，搅拌均匀。',
        '将湿性材料倒入干性材料中，用刮刀轻轻搅拌至刚刚混合即可，不要过度搅拌（面糊有些许干粉是正常的）。',
        '轻轻拌入蓝莓（如果是冷冻蓝莓，无需解冻，可以裹少量面粉防止沉底）。',
        '将面糊均匀分配到玛芬杯中，约2/3满。',
        '放入预热好的烤箱中烘烤18-22分钟，或直到插入牙签取出后没有湿面糊带出。',
        '烤好后在烤盘中静置几分钟，然后移到晾网上完全冷却。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 200, 
        protein: 3, 
        fat: 8, 
        carbohydrates: 30,
        fiber: 1,
        sugar: 15,
        sodium: 150,
        servingSize: '约60克/份(1个)'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1506459693189-363d714a4c63?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get("烘焙甜点")! },
          { categoryId: categoryMap.get("活力早餐")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("烤箱必备")! },
          { tagId: tagMap.get("新手友好")! },
          { tagId: tagMap.get("儿童喜爱")! },
        ],
      },
    },
    {
      title: '泰式绿咖喱鸡',
      description: '浓郁辛香的泰式绿咖喱，搭配嫩滑鸡肉和各种蔬菜，非常下饭。',
      cookingTime: 30,
      servings: 3,
      difficulty: '中等',
      ingredients: [
        { name: '鸡胸肉或鸡腿肉', quantity: '300', unit: '克，切块' },
        { name: '泰式绿咖喱酱', quantity: '2-3', unit: '汤匙' },
        { name: '椰奶', quantity: '400', unit: '毫升 (1罐)' },
        { name: '青豆角', quantity: '100', unit: '克，切段' },
        { name: '彩椒（红、黄）', quantity: '1', unit: '个，切块' },
        { name: '竹笋片（罐装）', quantity: '100', unit: '克' },
        { name: '鱼露', quantity: '1-2', unit: '汤匙' },
        { name: '糖（棕榈糖佳）', quantity: '1', unit: '茶匙' },
        { name: '青柠叶（Kaffir Lime Leaves）', quantity: '3-4', unit: '片' },
        { name: '泰国罗勒叶（Thai Basil）', quantity: '一把' },
        { name: '食用油', quantity: '1', unit: '汤匙' },
      ] as Prisma.JsonArray,
      instructions: [
        '锅中倒油烧热，加入绿咖喱酱，小火炒出香味（约1-2分钟）。',
        '加入鸡肉块，翻炒至变色。',
        '倒入一半椰奶，煮沸后转中火煮5分钟，让鸡肉入味。',
        '加入剩余的椰奶、青豆角、彩椒、竹笋片和青柠叶。',
        '煮沸后转小火，煮至蔬菜变软但仍保持脆度（约5-8分钟）。',
        '加入鱼露和糖调味。尝一下味道，根据喜好调整。',
        '出锅前加入泰国罗勒叶，拌匀即可。搭配米饭食用。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 380, 
        protein: 22, 
        fat: 28, 
        carbohydrates: 14,
        fiber: 3,
        sugar: 5,
        sodium: 520,
        servingSize: '约300克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1560594097-cb38a5f809be?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get('亚洲风味')! },
          { categoryId: categoryMap.get('家常菜')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("麻辣鲜香")! },
          { tagId: tagMap.get("营养均衡")! },
        ],
      },
    },
    {
      title: '地中海鹰嘴豆沙拉',
      description: '清爽健康的地中海风味沙拉，富含蛋白质和纤维，适合轻食或作为配菜。',
      cookingTime: 15,
      servings: 2,
      difficulty: '简单',
      ingredients: [
        { name: '鹰嘴豆（罐装或煮熟）', quantity: '1', unit: '罐 (约400克)，沥干水分' },
        { name: '黄瓜', quantity: '1', unit: '根，切丁' },
        { name: '番茄', quantity: '2', unit: '个，切丁' },
        { name: '红洋葱', quantity: '1/4', unit: '个，切碎' },
        { name: '新鲜欧芹（Parsley）', quantity: '1/4', unit: '杯，切碎' },
        { name: '新鲜薄荷（可选）', quantity: '2', unit: '汤匙，切碎' },
        { name: '菲达奶酪（Feta Cheese，可选）', quantity: '50', unit: '克，捏碎' },
        { name: '橄榄油', quantity: '3', unit: '汤匙' },
        { name: '柠檬汁', quantity: '2', unit: '汤匙' },
        { name: '盐和黑胡椒', quantity: '适量' },
      ] as Prisma.JsonArray,
      instructions: [
        '在一个大碗中，混合鹰嘴豆、黄瓜丁、番茄丁、红洋葱碎、欧芹和薄荷（如果使用）。',
        '在另一个小碗中，将橄榄油和柠檬汁搅拌均匀，制成沙拉酱。',
        '将沙拉酱淋在蔬菜和鹰嘴豆上。',
        '用盐和黑胡椒调味，轻轻搅拌均匀。',
        '如果使用菲达奶酪，在食用前撒在沙拉表面。',
        '可以立即食用，或冷藏片刻风味更佳。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 350, 
        protein: 12, 
        fat: 15,
        carbohydrates: 40,
        fiber: 10,
        sugar: 6,
        sodium: 320,
        servingSize: '约250克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get('轻食沙拉')! },
          { categoryId: categoryMap.get('健康素食')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('低卡轻脂')! },
          { tagId: tagMap.get('营养均衡')! },
          { tagId: tagMap.get('素食可选')! },
        ],
      },
    },
    {
      title: '快速番茄鸡蛋面',
      description: '简单又美味的家常面条，番茄酸甜，鸡蛋滑嫩，十分钟就能搞定。',
      cookingTime: 10,
      servings: 1,
      difficulty: '简单',
      ingredients: [
        { name: '新鲜面条或挂面', quantity: '100', unit: '克' },
        { name: '番茄', quantity: '1', unit: '个 (大)' },
        { name: '鸡蛋', quantity: '1-2', unit: '个' },
        { name: '小葱', quantity: '1', unit: '根，切葱花' },
        { name: '蒜末', quantity: '1', unit: '瓣量' },
        { name: '生抽', quantity: '1', unit: '汤匙' },
        { name: '盐', quantity: '适量' },
        { name: '糖', quantity: '1/2', unit: '茶匙（中和酸味）' },
        { name: '香油', quantity: '少许' },
        { name: '食用油', quantity: '适量' },
      ] as Prisma.JsonArray,
      instructions: [
        '番茄去皮（顶部划十字开水烫一下即可轻松去皮），切小块。鸡蛋打散。',
        '煮锅烧水，水开后下面条煮熟，捞出过凉水沥干备用。',
        '炒锅倒油烧热，倒入蛋液炒熟划散，盛出备用。',
        '锅内留底油，爆香蒜末，加入番茄块翻炒出汁。',
        '加入生抽、盐、糖调味，倒入少量水或煮面汤，煮开。',
        '放入炒好的鸡蛋，翻炒均匀。',
        '将煮好的面条放入碗中，浇上番茄鸡蛋卤，撒上葱花，淋少许香油即可。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 380, 
        protein: 15, 
        fat: 8, 
        carbohydrates: 60,
        fiber: 3,
        sugar: 6,
        sodium: 350,
        servingSize: '约350克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://plus.unsplash.com/premium_photo-1664302824043-3889970958eb?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get('家常菜')! },
          { categoryId: categoryMap.get('快手菜')! },
          { categoryId: categoryMap.get('花样主食')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('十分钟搞定')! },
          { tagId: tagMap.get('一人食')! },
          { tagId: tagMap.get('酸甜开胃')! },
        ],
      },
    },
    {
      title: '香煎三文鱼配芦笋',
      description: '营养丰富的快手西餐，三文鱼外皮香脆，肉质鲜嫩，搭配清爽芦笋。',
      cookingTime: 15,
      servings: 1,
      difficulty: '简单',
      ingredients: [
        { name: '三文鱼柳', quantity: '150-200', unit: '克' },
        { name: '芦笋', quantity: '100', unit: '克' },
        { name: '柠檬', quantity: '1/4', unit: '个' },
        { name: '橄榄油', quantity: '适量' },
        { name: '盐', quantity: '适量' },
        { name: '黑胡椒', quantity: '适量' },
        { name: '蒜末（可选）', quantity: '1', unit: '瓣量' },
      ] as Prisma.JsonArray,
      instructions: [
        '三文鱼柳用厨房纸吸干水分，两面撒上盐和黑胡椒。芦笋洗净，去除老根。',
        '平底锅中火加热，倒入少量橄榄油。油热后，放入三文鱼柳，鱼皮朝下（如果带皮）。',
        '煎约3-4分钟，待鱼皮金黄酥脆后翻面，再煎2-3分钟，或至鱼肉熟透但仍保持湿润。煎制时间取决于鱼柳厚度。',
        '在煎三文鱼的同时或利用锅内余油，放入芦笋和蒜末（如果使用）一同煎炒2-3分钟，撒少许盐调味。',
        '三文鱼和芦笋装盘，挤上柠檬汁即可享用。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 450, 
        protein: 35, 
        fat: 30,
        carbohydrates: 8,
        fiber: 4,
        sugar: 2,
        sodium: 180,
        servingSize: '约230克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: createdUsers[9]!.id,
      categories: {
        create: [
          { categoryId: categoryMap.get('创意西餐')! },
          { categoryId: categoryMap.get('快手菜')! },
          { categoryId: categoryMap.get('健身餐')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('高蛋白')! },
          { tagId: tagMap.get('低卡轻脂')! },
          { tagId: tagMap.get('营养均衡')! },
        ],
      },
    },
    {
      title: '冬瓜丸子汤',
      description: '清淡鲜美的家常汤品，冬瓜软糯，丸子Q弹，适合夏季消暑。',
      cookingTime: 25,
      servings: 3,
      difficulty: '中等',
      ingredients: [
        { name: '冬瓜', quantity: '300', unit: '克' },
        { name: '猪肉末', quantity: '200', unit: '克' },
        { name: '鸡蛋清', quantity: '1', unit: '个' },
        { name: '淀粉', quantity: '1', unit: '汤匙' },
        { name: '姜末', quantity: '少许' },
        { name: '葱花', quantity: '适量' },
        { name: '盐', quantity: '适量' },
        { name: '白胡椒粉', quantity: '少许' },
        { name: '香油', quantity: '几滴' },
        { name: '枸杞（可选）', quantity: '少许' },
      ] as Prisma.JsonArray,
      instructions: [
        '冬瓜去皮去瓤，切成薄片。猪肉末中加入姜末、鸡蛋清、淀粉、少许盐和白胡椒粉，朝一个方向搅拌上劲。',
        '锅中加适量水烧开，转小火，用手或勺子将肉馅挤成丸子下入锅中。',
        '待丸子全部浮起后，撇去浮沫。',
        '加入冬瓜片和枸杞（如果使用），煮至冬瓜变透明软烂（约5-8分钟）。',
        '加入适量盐和少许白胡椒粉调味。',
        '出锅前撒上葱花，滴几滴香油即可。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 180, 
        protein: 12, 
        fat: 10, 
        carbohydrates: 8,
        fiber: 2,
        sugar: 3,
        sodium: 280,
        servingSize: '约300毫升/份'
      } as Prisma.JsonObject,
      coverImage: 'https://plus.unsplash.com/premium_photo-1695299549378-3fed5ba9045c?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: createdUsers[5]!.id,
      categories: {
        create: [
          { categoryId: categoryMap.get('健康素食')! },
          { categoryId: categoryMap.get('快手菜')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('低卡轻脂')! },
          { tagId: tagMap.get('新手友好')! },
          { tagId: tagMap.get('素食可选')! },
        ],
      },
    },
    {
      title: '麻婆豆腐',
      description: '麻辣鲜香的川菜经典，适合爱辣星人。',
      cookingTime: 25,
      servings: 3,
      difficulty: '中等',
      ingredients: [
        { name: '嫩豆腐', quantity: '400', unit: '克' },
        { name: '牛肉末', quantity: '100', unit: '克' },
        { name: '豆瓣酱', quantity: '2', unit: '汤匙' },
        { name: '花椒', quantity: '1', unit: '茶匙' },
        { name: '干辣椒', quantity: '5个' },
        { name: '姜末', quantity: '1', unit: '茶匙' },
        { name: '蒜末', quantity: '1', unit: '茶匙' },
        { name: '生抽', quantity: '1', unit: '汤匙' },
        { name: '水淀粉', quantity: '适量' },
        { name: '香葱', quantity: '适量' },
      ] as Prisma.JsonArray,
      instructions: [
        '豆腐切块，沸水焯1分钟，捞出备用。',
        '锅中热油，炒香花椒和干辣椒，捞出花椒。',
        '加入豆瓣酱、姜末、蒜末炒香，加入牛肉末炒散。',
        '倒入适量水，加入生抽，放入豆腐煮5分钟。',
        '用水淀粉勾芡，撒上花椒粉和香葱即可。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 320, 
        protein: 18, 
        fat: 20, 
        carbohydrates: 10,
        fiber: 2,
        sugar: 2,
        sodium: 650,
        servingSize: '约250克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1623408261328-4b7c108e6b5b?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: createdUsers[6]!.id,
      categories: {
        create: [
          { categoryId: categoryMap.get('家常菜')! },
          { categoryId: categoryMap.get('亚洲风味')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('麻辣鲜香')! },
          { tagId: tagMap.get('一人食')! },
        ],
      },
    },
    {
      title: '香草烤鸡腿配时蔬',
      description: '外焦里嫩的烤鸡腿，搭配健康时蔬，完美晚餐。',
      cookingTime: 60,
      servings: 4,
      difficulty: '中等',
      ingredients: [
        { name: '鸡腿', quantity: '4个' },
        { name: '迷迭香', quantity: '1', unit: '汤匙' },
        { name: '百里香', quantity: '1', unit: '汤匙' },
        { name: '橄榄油', quantity: '2', unit: '汤匙' },
        { name: '柠檬', quantity: '1个' },
        { name: '土豆', quantity: '2个' },
        { name: '胡萝卜', quantity: '2根' },
        { name: '西兰花', quantity: '200', unit: '克' },
        { name: '盐', quantity: '适量' },
        { name: '黑胡椒', quantity: '适量' },
      ] as Prisma.JsonArray,
      instructions: [
        '鸡腿用橄榄油、迷迭香、百里香、柠檬汁、盐、黑胡椒腌制30分钟。',
        '土豆、胡萝卜切块，西兰花掰小朵，调味后铺在烤盘上。',
        '腌好的鸡腿放在蔬菜上，烤箱预热200°C，烤40分钟。',
        '中途翻面一次，确保鸡腿熟透，表面金黄。',
        '取出后稍作冷却，挤少许柠檬汁即可食用。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 450, 
        protein: 35, 
        fat: 25, 
        carbohydrates: 20,
        fiber: 5,
        sugar: 4,
        sodium: 380,
        servingSize: '约280克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: createdUsers[3]!.id,
      categories: {
        create: [
          { categoryId: categoryMap.get('创意西餐')! },
          { categoryId: categoryMap.get('健身餐')! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get('高蛋白')! },
          { tagId: tagMap.get('营养均衡')! },
        ],
      },
    },
    {
      title: '南瓜浓汤',
      description: '秋冬暖胃的南瓜浓汤，香甜可口，营养丰富。',
      cookingTime: 40,
      servings: 4,
      difficulty: '简单',
      ingredients: [
        { name: '南瓜', quantity: '500', unit: '克，去皮去籽切块' },
        { name: '洋葱', quantity: '1', unit: '个，切碎' },
        { name: '胡萝卜', quantity: '1', unit: '根，切片' },
        { name: '大蒜', quantity: '2', unit: '瓣，切碎' },
        { name: '鸡高汤或蔬菜高汤', quantity: '500', unit: '毫升' },
        { name: '淡奶油或椰奶', quantity: '100', unit: '毫升' },
        { name: '橄榄油', quantity: '1', unit: '汤匙' },
        { name: '盐', quantity: '适量' },
        { name: '黑胡椒', quantity: '适量' },
        { name: '南瓜籽（可选，装饰）', quantity: '少许' },
      ] as Prisma.JsonArray,
      instructions: [
        '锅中倒入橄榄油，中火加热，加入洋葱和大蒜炒香至透明。',
        '加入南瓜块和胡萝卜片，翻炒2-3分钟。',
        '倒入高汤，煮沸后转小火，盖上锅盖煮15-20分钟，或直到南瓜和胡萝卜完全软烂。',
        '用手持搅拌器或料理机将汤打成细腻的浓汤。',
        '倒回锅中，加入淡奶油或椰奶，轻轻搅拌均匀，加热至温热但不要沸腾。',
        '用盐和黑胡椒调味。',
        '盛入碗中，可撒上南瓜籽或少许奶油装饰。',
      ] as Prisma.JsonArray,
      nutritionInfo: { 
        calories: 200, 
        protein: 5, 
        fat: 12, 
        carbohydrates: 20,
        fiber: 3,
        sugar: 8,
        sodium: 200,
        servingSize: '约250毫升/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get("滋补靓汤")! },
          { categoryId: categoryMap.get("健康素食")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("营养均衡")! },
          { tagId: tagMap.get("冬季暖身")! },
          { tagId: tagMap.get('素食可选')! },
        ],
      },
    },
    {
      title: '香蕉核桃面包',
      description: '湿润美味的香蕉面包，加入了香脆的核桃，早餐或下午茶的绝佳选择。',
      cookingTime: 70,
      servings: 8,
      difficulty: '简单',
      ingredients: [
        { name: '熟透的香蕉', quantity: '3', unit: '根 (约300克)' },
        { name: '中筋面粉', quantity: '200', unit: '克' },
        { name: '白砂糖', quantity: '100', unit: '克' },
        { name: '鸡蛋', quantity: '1', unit: '个' },
        { name: '植物油或融化黄油', quantity: '60', unit: '毫升' },
        { name: '牛奶', quantity: '60', unit: '毫升' },
        { name: '核桃碎', quantity: '80', unit: '克' },
        { name: '泡打粉', quantity: '1', unit: '茶匙' },
        { name: '小苏打', quantity: '1/2', unit: '茶匙' },
        { name: '盐', quantity: '1/4', unit: '茶匙' },
        { name: '香草精', quantity: '1', unit: '茶匙 (可选)' },
      ] as Prisma.JsonArray,
      instructions: [
        '烤箱预热至175°C (350°F)。准备一个约 20cm x 10cm 的磅蛋糕模具，抹油撒粉或铺烘焙纸。',
        '在一个大碗中，用叉子将香蕉捣成泥。',
        '加入打散的鸡蛋、植物油（或融化黄油）、牛奶和香草精（如果使用），搅拌均匀。',
        '在另一个碗中，混合面粉、糖、泡打粉、小苏打和盐。',
        '将干性材料分两次加入湿性材料中，用刮刀轻轻拌匀至无干粉即可，不要过度搅拌。',
        '拌入大部分核桃碎（留一小部分撒在表面）。',
        '将面糊倒入准备好的模具中，抹平表面，撒上剩余的核桃碎。',
        '放入预热好的烤箱中层，烘烤55-65分钟，或直到插入牙签取出后没有湿面糊带出。',
        '烤好后在模具中静置10分钟，然后移到晾网上完全冷却后再切片。',
      ] as Prisma.JsonArray,
      nutritionInfo: {
        calories: 280,
        protein: 5,
        fat: 14,
        carbohydrates: 35,
        servingSize: '约80克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1589927209779-a886c40a08a5?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get("烘焙甜点")! },
          { categoryId: categoryMap.get("活力早餐")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("烤箱必备")! },
          { tagId: tagMap.get("新手友好")! },
        ],
      },
    },
    {
      title: '西班牙海鲜饭',
      description: '经典的西班牙料理，汇集各种海鲜的鲜美与米饭的浓郁，色彩丰富，味道浓郁。',
      cookingTime: 60,
      servings: 4,
      difficulty: '中等',
      ingredients: [
        { name: '西班牙短粒米 (Bomba或Calasparra)', quantity: '300', unit: '克' },
        { name: '鸡腿肉', quantity: '200', unit: '克 (去骨切块)' },
        { name: '大虾', quantity: '8', unit: '只 (带壳)' },
        { name: '青口贝', quantity: '200', unit: '克 (洗净)' },
        { name: '鱿鱼圈', quantity: '100', unit: '克' },
        { name: '洋葱', quantity: '1', unit: '个 (切碎)' },
        { name: '蒜', quantity: '3', unit: '瓣 (切末)' },
        { name: '番茄', quantity: '2', unit: '个 (去皮切碎)' },
        { name: '红甜椒', quantity: '1', unit: '个 (切条)' },
        { name: '青豆', quantity: '100', unit: '克' },
        { name: '鸡高汤或海鲜高汤', quantity: '750', unit: '毫升' },
        { name: '藏红花丝', quantity: '一小撮' },
        { name: '烟熏红椒粉 (Pimentón dulce)', quantity: '1', unit: '茶匙' },
        { name: '橄榄油', quantity: '适量' },
        { name: '盐、黑胡椒', quantity: '适量' },
        { name: '柠檬角', quantity: '装饰用' },
        { name: '新鲜欧芹', quantity: '切碎，装饰用' },
      ] as Prisma.JsonArray,
      instructions: [
        '藏红花丝用少量温高汤浸泡。',
        '在大的平底海鲜饭锅（Paella Pan）中倒入橄榄油，中高火加热。加入鸡肉块，煎至金黄，取出备用。',
        '在同一个锅中，加入洋葱和大蒜炒香。加入红甜椒炒软。',
        '加入番茄碎和烟熏红椒粉，翻炒至酱汁浓稠。',
        '加入西班牙米，翻炒均匀，让米粒裹上油脂和酱汁（约1-2分钟）。',
        '倒入高汤和浸泡藏红花的水，用盐和黑胡椒调味。煮沸后转中小火，不要搅拌米饭。',
        '将煎好的鸡肉放回锅中，均匀分布。',
        '煮约10分钟后，将大虾、青口贝、鱿鱼圈和青豆均匀铺在米饭上。青口贝开口朝上。',
        '继续煮10-15分钟，或直到大部分汤汁被米吸收，米饭煮熟。底部应该形成一层薄薄的锅巴 (socarrat)。',
        '关火，用干净的布或铝箔盖住锅，静置5-10分钟。',
        '食用前撒上新鲜欧芹，搭配柠檬角。',
      ] as Prisma.JsonArray,
      nutritionInfo: {
        calories: 550,
        protein: 35,
        fat: 20,
        carbohydrates: 60,
        servingSize: '约450克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1598511803506-fd90727a062c?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get("创意西餐")! },
          { categoryId: categoryMap.get("花样主食")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("宴客菜")! },
          { tagId: tagMap.get("营养均衡")! },
        ],
      },
    },
    {
      title: '家常凉拌三丝',
      description: '清爽开胃的家常凉菜，多种蔬菜丝的组合，口感丰富，健康美味。',
      cookingTime: 15,
      servings: 2,
      difficulty: '简单',
      ingredients: [
        { name: '胡萝卜', quantity: '半根 (约80克)' },
        { name: '黄瓜', quantity: '半根 (约100克)' },
        { name: '海带丝 (泡发好)', quantity: '100', unit: '克' },
        { name: '蒜', quantity: '2', unit: '瓣 (切末)' },
        { name: '香菜', quantity: '1', unit: '棵 (切段，可选)' },
        { name: '生抽', quantity: '2', unit: '汤匙' },
        { name: '香醋', quantity: '1', unit: '汤匙' },
        { name: '白糖', quantity: '1', unit: '茶匙' },
        { name: '香油', quantity: '1', unit: '茶匙' },
        { name: '盐', quantity: '少许' },
        { name: '熟白芝麻', quantity: '少许 (可选)' },
        { name: '辣椒油', quantity: '少许 (可选)' },
      ] as Prisma.JsonArray,
      instructions: [
        '胡萝卜、黄瓜去皮（黄瓜可不去），分别切成细丝。',
        '海带丝如果是干的，提前泡发洗净，切成适当长度。如果是即食海带丝，直接使用。',
        '将胡萝卜丝在沸水中焯烫约30秒至1分钟，捞出过凉水沥干。（可选步骤，生吃也可）',
        '将胡萝卜丝、黄瓜丝、海带丝放入一个大碗中。',
        '加入蒜末和香菜段（如果使用）。',
        '在一个小碗中，混合生抽、香醋、白糖、香油和少许盐，搅拌均匀制成调味汁。',
        '将调味汁淋在三丝上，充分拌匀。',
        '如果喜欢辣味，可以加入少许辣椒油。',
        '装盘后可撒上熟白芝麻点缀。冷藏片刻风味更佳。',
      ] as Prisma.JsonArray,
      nutritionInfo: {
        calories: 120,
        protein: 3,
        fat: 6,
        carbohydrates: 15,
        servingSize: '约150克/份'
      } as Prisma.JsonObject,
      coverImage: 'https://images.unsplash.com/photo-1599793690163-700335800a13?q=80&w=1170&auto=format&fit=crop',
      published: true,
      authorId: getRandomElement(createdUsers).id,
      categories: {
        create: [
          { categoryId: categoryMap.get("健康素食")! },
          { categoryId: categoryMap.get("快手菜")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("低卡轻脂")! },
          { tagId: tagMap.get("酸甜开胃")! },
        ],
      },
    }
  ];

  // Create recipes and their associations
  const createdRecipes = [];
  for (const recipeSeed of recipesData) {
    const { authorId, categories, tags, ...restOfRecipeData } = recipeSeed;
    const recipe = await prisma.recipe.create({
      data: {
        ...restOfRecipeData,
        author: { connect: { id: authorId } },
        categories: categories,
        tags: tags,
      },
    });
    createdRecipes.push(recipe);
  }
  console.log(`Created ${createdRecipes.length} recipes.`);

  // --- Create Comments ---
  console.log("Creating comments...");
  const commentsData = [
    {
      content: '这个意面做法简单，味道超级棒！孩子特别爱吃！',
     rating: 5,
      recipeId: createdRecipes[0]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "鸡翅味道很好，就是我腌制时间不够，下次试试隔夜腌制！",
      rating: 4,
      recipeId: createdRecipes[1]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "抹茶和红豆的搭配绝了！不过麻薯有点难包，求技巧！",
      rating: 5,
      recipeId: createdRecipes[2]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "沙拉很清爽，适合夏天吃！",
      rating: 4,
      recipeId: createdRecipes[3]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "思慕雪口感很好，夏天喝太舒服了！",
      rating: 5,
      recipeId: createdRecipes[4]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: '泡菜炒饭味道很正宗，简单又好吃！',
      rating: 5,
      recipeId: createdRecipes[5]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "西兰花做法简单，味道很清淡，适合减脂期！",
      rating: 4,
      recipeId: createdRecipes[6]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: '叉烧味道很棒，烤箱版也很方便！',
      rating: 5,
      recipeId: createdRecipes[7]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: '厚蛋烧做法有点复杂，但成品很漂亮！',
      rating: 4,
      recipeId: createdRecipes[8]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "玛芬很好吃，蓝莓很新鲜！",
      rating: 5,
      recipeId: createdRecipes[9]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: '绿咖喱很香，辣度刚好！',
      rating: 5,
      recipeId: createdRecipes[10]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "鹰嘴豆沙拉很健康，适合健身餐！",
      rating: 4,
      recipeId: createdRecipes[11]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "番茄鸡蛋面太快手了，一个人吃刚好！",
      rating: 5,
      recipeId: createdRecipes[12]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "三文鱼做法简单，味道很高级！",
      rating: 5,
      recipeId: createdRecipes[13]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: '冬瓜汤很清爽，丸子也好吃！',
      rating: 4,
      recipeId: createdRecipes[14]!.id,
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: '熔岩蛋糕太好吃了，空气炸锅也能做！',
      rating: 5,
      recipeId: createdRecipes[1]!.id, // 指向"空气炸锅香辣鸡翅"，因为提到了空气炸锅
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "苏打水很解渴，夏天必备！",
      rating: 4,
      recipeId: createdRecipes[4]!.id, // 指向"活力芒果香蕉思慕雪"，因为都是夏季饮品
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "乌冬面很好吃，蔬菜多很健康！",
      rating: 5,
      recipeId: createdRecipes[12]!.id, // 指向"快速番茄鸡蛋面"，因为都是面食
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "香蕉面包很湿润，核桃增加了口感！",
      rating: 5,
      recipeId: createdRecipes[18]!.id, // 索引指向新添加的第19个食谱 (recipesData中的索引18)
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: '海鲜饭很正宗，味道太棒了！',
      rating: 5,
      recipeId: createdRecipes[19]!.id, // 索引指向新添加的第20个食谱 (recipesData中的索引19)
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: '凉拌三丝很清爽，夏天吃很舒服！',
      rating: 4,
      recipeId: createdRecipes[20]!.id, // 索引指向新添加的第21个食谱 (recipesData中的索引20)
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "麻婆豆腐辣得很过瘾！",
      rating: 5,
      recipeId: createdRecipes[15]!.id, // 正确匹配：麻婆豆腐
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "烤鸡腿外焦里嫩，蔬菜也好吃！",
      rating: 5,
      recipeId: createdRecipes[16]!.id, // 正确匹配：香草烤鸡腿配时蔬
      userId: getRandomElement(createdUsers)!.id,
    },
    {
      content: "南瓜汤很暖胃，秋天喝很舒服！",
      rating: 5,
      recipeId: createdRecipes[17]!.id, // 正确匹配：南瓜浓汤
      userId: getRandomElement(createdUsers)!.id,
    },
  ];

      // 1. 准备并存入 Comment 表的数据 (此步骤会移除 rating 字段)
      console.log("Creating comments for database (without rating field)...");
      const commentsForDb = commentsData.map(({ rating, ...commentData }) => commentData);
      await prisma.comment.createMany({ data: commentsForDb });
      console.log(`Created ${commentsForDb.length} comments.`);

      // 2. 准备并存入 Rating 表的数据
      console.log("Creating ratings for database...");
      const ratingsForDb = commentsData
        .filter(comment => typeof comment.rating === 'number') 
        .map(comment => ({
          value: comment.rating as number, 
          recipeId: comment.recipeId,
          userId: comment.userId,
        }));
      await prisma.rating.createMany({ data: ratingsForDb });
      console.log(`Created ${ratingsForDb.length} ratings.`);


  // --- Create Favorites ---
  console.log("Creating favorites...");
  const favoritesData = [];
  for (const recipe of createdRecipes) {
    const favoritingUsers = getRandomSubset(createdUsers, 1, 5);
    for (const user of favoritingUsers) {
      favoritesData.push({
        recipeId: recipe.id,
        userId: user.id,
      });
    }
  }
  await prisma.favorite.createMany({ data: favoritesData });
  console.log(`Created ${favoritesData.length} favorites.`);

  // --- Create Meal Plans ---
  console.log("Creating meal plans...");
  const mealPlansData = [
    {
      name: '一周健康减脂餐',
      userId: createdUsers[3]!.id,
      startDate: new Date("2025-05-10"),
      endDate: new Date("2025-05-16"),
    },
    {
      name: '周末家庭聚餐',
      userId: createdUsers[4]!.id,
      startDate: new Date("2025-05-17"),
      endDate: new Date("2025-05-18"),
    },
  ];
  const createdMealPlans = [];
  for (const mpData of mealPlansData) {
    const mealPlan = await prisma.mealPlan.create({ data: mpData });
    createdMealPlans.push(mealPlan);
  }
  console.log(`Created ${createdMealPlans.length} meal plans.`);

  // --- Create Meal Plan Items ---
  console.log("Creating meal plan items...");
  const mealPlanItemsData = [
    {
      mealPlanId: createdMealPlans[0]!.id,
      recipeId: createdRecipes[3]!.id,
      mealTime: "午餐",
      date: new Date("2025-05-10"),
    },
    {
      mealPlanId: createdMealPlans[0]!.id,
      recipeId: createdRecipes[13]!.id,
      mealTime: "晚餐",
      date: new Date("2025-05-10"),
    },
    {
      mealPlanId: createdMealPlans[0]!.id,
      recipeId: createdRecipes[4]!.id,
      mealTime: "早餐",
      date: new Date("2025-05-11"),
    },
    {
      mealPlanId: createdMealPlans[1]!.id,
      recipeId: createdRecipes[0]!.id,
      mealTime: "晚餐",
      date: new Date("2025-05-17"),
    },
    {
      mealPlanId: createdMealPlans[1]!.id,
      recipeId: createdRecipes[7]!.id,
      mealTime: "午餐",
      date: new Date("2025-05-17"),
    },
  ];
  await prisma.mealPlanItem.createMany({ data: mealPlanItemsData });
  console.log(`Created ${mealPlanItemsData.length} meal plan items.`);

  // --- Create Shopping Lists ---
  console.log("Creating shopping lists...");
  const shoppingListsData = [
    { name: '减脂餐食材清单', userId: createdUsers[3]!.id },
    { name: "周末聚会采购", userId: createdUsers[4]!.id },
  ];
  const createdShoppingLists = [];
  for (const slData of shoppingListsData) {
    const shoppingList = await prisma.shoppingList.create({ data: slData });
    createdShoppingLists.push(shoppingList);
  }
  console.log(`Created ${createdShoppingLists.length} shopping lists.`);

  // --- Create Shopping List Items ---
  console.log("Creating shopping list items...");
  const shoppingListItemsData = [
    {
      shoppingListId: createdShoppingLists[0]!.id,
      name: "鸡胸肉",
      quantity: "500克",
      category: "肉类海鲜",
      completed: false,
    },
    {
      shoppingListId: createdShoppingLists[0]!.id,
      name: "芦笋",
      quantity: "200克",
      category: "蔬菜水果",
      completed: false,
    },
    {
      shoppingListId: createdShoppingLists[1]!.id,
      name: "牛肉末",
      quantity: "300克",
      category: "肉类海鲜",
      completed: false,
    },
    {
      shoppingListId: createdShoppingLists[1]!.id,
      name: "意大利面",
      quantity: "400克",
      category: "调味品干货",
      completed: false,
    },
  ];
  await prisma.shoppingListItem.createMany({ data: shoppingListItemsData });
  console.log(`Created ${shoppingListItemsData.length} shopping list items.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
