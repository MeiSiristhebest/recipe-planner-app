import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// 根据周计划生成购物清单
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const { mealPlanId } = body

    // 查找用户的购物清单，如果不存在则创建一个
    let shoppingList = await prisma.shoppingList.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    // 查找用户的周计划
    const mealPlan = mealPlanId
      ? await prisma.mealPlan.findUnique({
          where: {
            id: mealPlanId,
            userId: session.user.id,
          },
          include: {
            items: {
              include: {
                recipe: true,
              },
            },
          },
        })
      : await prisma.mealPlan.findFirst({
          where: {
            userId: session.user.id,
            isTemplate: false,
          },
          orderBy: {
            weekStartDate: "desc",
          },
          include: {
            items: {
              include: {
                recipe: true,
              },
            },
          },
        })

    if (!mealPlan || mealPlan.items.length === 0) {
      return NextResponse.json({ message: "没有找到周计划或周计划为空" }, { status: 400 })
    }

    // 收集所有食谱的食材
    const ingredientMap = new Map()

    for (const item of mealPlan.items) {
      const recipe = item.recipe
      const ingredients = recipe.ingredients as any[]

      for (const ingredient of ingredients) {
        const key = `${ingredient.name}-${ingredient.unit}`

        if (ingredientMap.has(key)) {
          // 如果已存在相同食材，合并数量
          const existingIngredient = ingredientMap.get(key)
          const quantity = Number.parseFloat(existingIngredient.quantity) + Number.parseFloat(ingredient.quantity)
          ingredientMap.set(key, {
            ...existingIngredient,
            quantity: quantity.toString(),
          })
        } else {
          // 否则添加新食材
          ingredientMap.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            category: getCategoryForIngredient(ingredient.name),
            notes: ingredient.note,
            recipeId: recipe.id,
          })
        }
      }
    }

    // 清空现有购物清单
    await prisma.shoppingListItem.deleteMany({
      where: {
        shoppingListId: shoppingList.id,
      },
    })

    // 添加新的购物清单项目
    const items = []
    for (const ingredient of ingredientMap.values()) {
      const item = await prisma.shoppingListItem.create({
        data: {
          ...ingredient,
          isChecked: false,
          shoppingListId: shoppingList.id,
        },
      })
      items.push(item)
    }

    return NextResponse.json({
      message: "购物清单已生成",
      shoppingList: {
        ...shoppingList,
        items,
      },
    })
  } catch (error) {
    console.error("生成购物清单错误:", error)
    return NextResponse.json({ message: "生成购物清单失败" }, { status: 500 })
  }
}

// 根据食材名称判断分类
function getCategoryForIngredient(name: string): string {
  const categories = {
    蔬菜水果: [
      "蔬菜",
      "水果",
      "菠菜",
      "西兰花",
      "胡萝卜",
      "土豆",
      "洋葱",
      "大蒜",
      "姜",
      "青椒",
      "红椒",
      "黄瓜",
      "西红柿",
      "茄子",
      "南瓜",
      "白菜",
      "生菜",
      "香菜",
      "葱",
      "苹果",
      "香蕉",
      "橙子",
      "柠檬",
      "草莓",
      "蓝莓",
      "葡萄",
    ],
    肉类海鲜: [
      "肉",
      "牛肉",
      "猪肉",
      "鸡肉",
      "羊肉",
      "火腿",
      "香肠",
      "培根",
      "鱼",
      "虾",
      "蟹",
      "贝",
      "三文鱼",
      "金枪鱼",
      "鳕鱼",
      "龙虾",
      "牡蛎",
      "扇贝",
    ],
    乳制品蛋类: ["奶", "牛奶", "酸奶", "奶酪", "黄油", "奶油", "蛋", "鸡蛋", "鸭蛋", "鹌鹑蛋"],
    调味品干货: [
      "盐",
      "糖",
      "胡椒",
      "酱油",
      "醋",
      "料酒",
      "香油",
      "橄榄油",
      "花生油",
      "芝麻油",
      "辣椒",
      "八角",
      "桂皮",
      "香叶",
      "花椒",
      "孜然",
      "咖喱",
      "番茄酱",
      "蚝油",
      "面粉",
      "大米",
      "小米",
      "燕麦",
      "面条",
      "意大利面",
      "通心粉",
      "米粉",
      "粉丝",
      "豆",
      "豆腐",
      "豆干",
      "豆皮",
      "豆芽",
      "红豆",
      "绿豆",
      "黑豆",
      "花生",
      "核桃",
      "杏仁",
      "腰果",
      "芝麻",
    ],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (name.includes(keyword)) {
        return category
      }
    }
  }

  return "其他"
}
