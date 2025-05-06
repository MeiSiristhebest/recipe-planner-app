import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  // Create categories
  const categories = [
    { name: "快手菜" },
    { name: "家常菜" },
    { name: "烘焙" },
    { name: "汤羹" },
    { name: "早餐" },
    { name: "午餐" },
    { name: "晚餐" },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    })
  }

  console.log("Categories created")

  // Create tags
  const tags = [{ name: "素食" }, { name: "低卡" }, { name: "无麸质" }, { name: "高蛋白" }, { name: "儿童友好" }]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: { name: tag.name },
    })
  }

  console.log("Tags created")

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 10)
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
    },
  })

  console.log("Demo user created")

  // Create sample recipes
  const sampleRecipes = [
    {
      title: "香煎三文鱼配芦笋",
      description: "简单美味的香煎三文鱼，搭配新鲜芦笋，是一道健康又美味的主菜。",
      cookingTime: 30,
      servings: 2,
      difficulty: "中等",
      ingredients: [
        { name: "三文鱼排", quantity: "2块 (约300克)", category: "肉类海鲜" },
        { name: "芦笋", quantity: "1束 (约200克)", category: "蔬菜水果" },
        { name: "小土豆", quantity: "6-8个 (约300克)", category: "蔬菜水果" },
        { name: "柠檬", quantity: "1个", category: "蔬菜水果" },
        { name: "橄榄油", quantity: "2汤匙", category: "调味品干货" },
        { name: "盐", quantity: "适量", category: "调味品干货" },
        { name: "黑胡椒", quantity: "适量", category: "调味品干货" },
        { name: "迷迭香", quantity: "2-3枝", category: "调味品干货" },
      ],
      instructions: [
        {
          step: 1,
          content: "将三文鱼排洗净，用厨房纸吸干水分。芦笋洗净，切去老根部分。小土豆洗净，对半切开。柠檬切片。",
        },
        {
          step: 2,
          content: "将小土豆放入沸水中煮约15分钟至变软。沥干水分，加入1汤匙橄榄油、盐和黑胡椒拌匀。",
        },
        {
          step: 3,
          content:
            "平底锅中加入1汤匙橄榄油，中高火加热。将三文鱼皮朝下放入锅中，撒上盐和黑胡椒，煎约4分钟至皮酥脆。翻面再煎2-3分钟。",
        },
        {
          step: 4,
          content: "另一个平底锅中加入少许橄榄油，中火加热。放入芦笋和迷迭香，翻炒2-3分钟至变软但仍有脆度。",
        },
        {
          step: 5,
          content: "将三文鱼、芦笋和土豆摆盘，挤上柠檬汁，撒上黑胡椒。可以搭配柠檬片装饰。",
        },
      ],
      nutritionInfo: {
        热量: 420,
        蛋白质: 32,
        脂肪: 25,
        碳水化合物: 18,
      },
      categoryIds: ["2", "6", "7"], // 家常菜, 午餐, 晚餐
      tagIds: ["4"], // 高蛋白
    },
    {
      title: "番茄鸡蛋面",
      description: "简单快手的家常面食，酸甜可口，营养丰富。",
      cookingTime: 15,
      servings: 1,
      difficulty: "简单",
      ingredients: [
        { name: "挂面", quantity: "100克", category: "调味品干货" },
        { name: "鸡蛋", quantity: "2个", category: "乳制品蛋类" },
        { name: "番茄", quantity: "2个", category: "蔬菜水果" },
        { name: "葱", quantity: "1根", category: "蔬菜水果" },
        { name: "盐", quantity: "适量", category: "调味品干货" },
        { name: "糖", quantity: "1/2茶匙", category: "调味品干货" },
        { name: "食用油", quantity: "2汤匙", category: "调味品干货" },
      ],
      instructions: [
        {
          step: 1,
          content: "番茄洗净，切成小块。葱洗净，切成葱花。",
        },
        {
          step: 2,
          content: "锅中加水煮沸，放入挂面煮至七分熟，捞出备用。",
        },
        {
          step: 3,
          content: "锅中加油，油热后打入鸡蛋，炒散后盛出备用。",
        },
        {
          step: 4,
          content: "同一锅中加油，放入番茄翻炒至出汁，加入适量盐和糖调味。",
        },
        {
          step: 5,
          content: "倒入炒好的鸡蛋，加入适量清水，煮沸后放入面条，煮至面条熟透。",
        },
        {
          step: 6,
          content: "撒上葱花，即可享用。",
        },
      ],
      nutritionInfo: {
        热量: 380,
        蛋白质: 15,
        脂肪: 12,
        碳水化合物: 55,
      },
      categoryIds: ["1", "2", "5"], // 快手菜, 家常菜, 早餐
      tagIds: [], // 无特殊标签
    },
  ]

  for (const recipe of sampleRecipes) {
    await prisma.recipe.create({
      data: {
        title: recipe.title,
        description: recipe.description,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutritionInfo: recipe.nutritionInfo,
        published: true,
        author: {
          connect: { id: demoUser.id },
        },
        categories: {
          create: recipe.categoryIds.map((categoryId) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
        tags: {
          create: recipe.tagIds.map((tagId) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
    })
  }

  console.log("Sample recipes created")
  console.log("Database seed completed")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
