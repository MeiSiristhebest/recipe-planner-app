import { PrismaClient, Prisma } from "@prisma/client";
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
      image: "https://api.dicebear.com/8.x/adventurer/svg?seed=foodie_explorer",
    },
    {
      email: "midnight_chef_cat@example.com",
      name: "深夜食堂的猫",
      image:
        "https://api.dicebear.com/8.x/pixel-art/svg?seed=midnight_chef_cat",
    },
    {
      email: "baking_witch_lily@example.com",
      name: "烘焙小魔女莉莉",
      image: "https://api.dicebear.com/8.x/micah/svg?seed=baking_witch_lily",
    },
    {
      email: "fitness_food_max@example.com",
      name: "健身食谱达人Max",
      image: "https://api.dicebear.com/8.x/bottts/svg?seed=fitness_food_max",
    },
    {
      email: "homestyle_wang_ma@example.com",
      name: "家常菜爱好者王师傅",
      image: "https://api.dicebear.com/8.x/personas/svg?seed=homestyle_wang_ma",
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
    { name: "素食可选" },
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
      title: "香煎三文鱼配芦笋",
      description:
        "营养丰富的快手西餐，三文鱼外皮香脆，肉质鲜嫩，搭配清爽芦笋",
      cookingTime: 15,
      servings: 1,
      difficulty: "简单",
      ingredients: [
        { name: "三文鱼柳", quantity: "150-200", unit: "克" },
        { name: "芦笋", quantity: "100", unit: "克" },
        { name: "柠檬", quantity: "1/4", unit: "个" },
        { name: "橄榄油", quantity: "适量" },
        { name: "盐", quantity: "适量" },
        { name: "黑胡椒", quantity: "适量" },
        { name: "蒜末（可选）", quantity: "1", unit: "瓣量" },
      ] as Prisma.JsonArray,
      instructions: [
        "三文鱼柳用厨房纸吸干水分，两面撒上盐和黑胡椒。芦笋洗净，去除老根",
        "平底锅中火加热，倒入少量橄榄油。油热后，放入三文鱼柳，鱼皮朝下（如果带皮）",
        "煎约3-4分钟，待鱼皮金黄酥脆后翻面，再煎2-3分钟，或至鱼肉熟透但仍保持湿润。煎制时间取决于鱼柳厚度",
        "在煎三文鱼的同时或利用锅内余油，放入芦笋和蒜末（如果使用）一同煎1-3分钟，撒少许盐调味",
        "三文鱼和芦笋装盘，挤上柠檬汁即可享用",
      ] as Prisma.JsonArray,
      nutritionInfo: {
        calories: "约450 kcal",
        protein: "约35g",
        fat: "约30g",
      } as Prisma.JsonObject,
      coverImage:
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1170&auto=format&fit=crop",
      published: true,
      authorId: createdUsers[0]!.id,
      categories: {
        create: [
          { categoryId: categoryMap.get("创意西餐")! },
          { categoryId: categoryMap.get("快手菜")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("高蛋白")! },
          { tagId: tagMap.get("低卡轻脂")! },
          { tagId: tagMap.get("营养均衡")! },
        ],
      },
    },
    {
      title: "健康蔬菜藜麦沙拉",
      description: "营养均衡的藜麦蔬菜沙拉，富含蛋白质和膳食纤维，适合健身餐或轻食",
      cookingTime: 20,
      servings: 2,
      difficulty: "简单",
      ingredients: [
        { name: "藜麦", quantity: "100", unit: "克" },
        { name: "黄瓜", quantity: "1", unit: "根" },
        { name: "西红柿", quantity: "2", unit: "个" },
        { name: "鳄梨", quantity: "1", unit: "个" },
        { name: "红洋葱", quantity: "1/4", unit: "个" },
        { name: "柠檬汁", quantity: "2", unit: "汤匙" },
        { name: "橄榄油", quantity: "2", unit: "汤匙" },
        { name: "盐", quantity: "适量" },
        { name: "黑胡椒", quantity: "适量" },
        { name: "新鲜香草（如欧芹、薄荷）", quantity: "适量" },
      ] as Prisma.JsonArray,
      instructions: [
        "藜麦洗净，按照包装上的说明煮熟，沥干水分晾凉",
        "黄瓜、西红柿、鳄梨切小丁，红洋葱切碎",
        "在大碗中混合藜麦和所有切好的蔬菜",
        "加入橄榄油、柠檬汁、盐和黑胡椒调味，轻轻拌匀",
        "撒上新鲜香草即可食用",
      ] as Prisma.JsonArray,
      nutritionInfo: {
        calories: "约350 kcal/份",
        protein: "约12g",
        fiber: "约8g",
      } as Prisma.JsonObject,
      coverImage:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1170&auto=format&fit=crop",
      published: true,
      authorId: createdUsers[3]!.id,
      categories: {
        create: [
          { categoryId: categoryMap.get("健康素食")! },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap.get("低卡轻脂")! },
          { tagId: tagMap.get("营养均衡")! },
        ],
      },
    },
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
      content: "这道三文鱼做法简单，味道很高级！外脆里嫩，非常适合健身餐。",
      rating: 5,
      recipeId: createdRecipes[0]!.id,
      userId: createdUsers[1]!.id,
    },
    {
      content: "藜麦沙拉营养又健康，做法简单，很适合工作日的午餐！",
      rating: 5,
      recipeId: createdRecipes[1]!.id,
      userId: createdUsers[2]!.id,
    },
  ];
  await prisma.comment.createMany({ data: commentsData });
  console.log(`Created ${commentsData.length} comments.`);

  // --- Create Ratings ---
  console.log("Creating ratings...");
  const ratingsData = commentsData.map((comment) => ({
    value: comment.rating,
    recipeId: comment.recipeId,
    userId: comment.userId,
  }));
  await prisma.rating.createMany({ data: ratingsData });
  console.log(`Created ${ratingsData.length} ratings.`);

  // --- Create Favorites ---
  console.log("Creating favorites...");
  const favoritesData = [];
  for (const recipe of createdRecipes) {
    const favoritingUsers = getRandomSubset(createdUsers, 1, 3);
    for (const user of favoritingUsers) {
      favoritesData.push({
        recipeId: recipe.id,
        userId: user.id,
      });
    }
  }
  await prisma.favorite.createMany({ data: favoritesData });
  console.log(`Created ${favoritesData.length} favorites.`);

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