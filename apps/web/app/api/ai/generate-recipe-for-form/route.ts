import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * 格式化食材数量，确保纯数字添加适当的单位
 * @param quantity 原始数量
 * @returns 格式化后的数量
 */
function formatQuantity(quantity: string | number): string {
  if (!quantity) return "适量";

  const quantityStr = quantity.toString().trim();

  // 如果数量只包含数字，添加默认单位 '克'
  if (/^\d+$/.test(quantityStr)) {
    return `${quantityStr}克`;
  }

  // 其他情况，返回原始数量
  return quantityStr;
}

/**
 * 根据食材名称自动分类
 * @param ingredientName 食材名称
 * @returns 食材分类
 */
function categorizeIngredient(ingredientName: string): string {
  const lowerName = ingredientName.toLowerCase();

  // 叶菜类
  if (
    /菠菜|生菜|白菜|卷心菜|包菜|芹菜|韭菜|空心菜|油菜|苋菜|茼蒿|菊花菜|芥菜|荠菜|香菜|香芹|芝麻菜|莴笋叶|萝卜缨|紫苏叶/.test(
      lowerName
    )
  ) {
    return "叶菜类";
  }

  // 根茎类
  if (
    /萝卜|胡萝卜|土豆|马铃薯|山药|芋头|莲藕|生姜|姜|洋葱|大葱|葱|蒜|大蒜|蒜头|芦笋|竹笋|笋|茭白|慈姑|菱角|莴笋/.test(
      lowerName
    )
  ) {
    return "根茎类";
  }

  // 瓜果类
  if (
    /黄瓜|丝瓜|冬瓜|南瓜|西葫芦|苦瓜|佛手瓜|番茄|西红柿|茄子|辣椒|青椒|甜椒|彩椒|尖椒/.test(
      lowerName
    )
  ) {
    return "瓜果类";
  }

  // 菌菇类
  if (
    /香菇|平菇|金针菇|杏鲍菇|蘑菇|茶树菇|草菇|猴头菇|木耳|银耳|黑木耳|白木耳|松茸|牛肝菌|鸡油菌|灵芝|猪苓|茯苓/.test(
      lowerName
    )
  ) {
    return "菌菇类";
  }

  // 水果类
  if (
    /苹果|梨|香蕉|橙子|橘子|柚子|柠檬|猕猴桃|奇异果|葡萄|草莓|蓝莓|桃子|李子|杏|樱桃|石榴|山楂|柿子|西瓜|哈密瓜|甜瓜|木瓜|榴莲|芒果|菠萝|凤梨|椰子|荔枝|龙眼|桂圆|杨梅|枇杷|莲雾|火龙果/.test(
      lowerName
    )
  ) {
    return "水果类";
  }

  // 浆果类
  if (
    /草莓|蓝莓|黑莓|覆盆子|树莓|蔓越莓|醋栗|黑加仑|红加仑|蓝靛果|桑葚|葡萄/.test(
      lowerName
    )
  ) {
    return "浆果类";
  }

  // 猪肉类
  if (
    /猪肉|五花肉|猪排|猪里脊|猪腿肉|猪蹄|猪肘|猪肚|猪肝|猪心|猪肺|猪肠|猪血|猪皮|猪油|培根|火腿|香肠|腊肉|熏肉|猪肉松/.test(
      lowerName
    )
  ) {
    return "猪肉类";
  }

  // 牛肉类
  if (
    /牛肉|牛排|牛里脊|牛腩|牛腱|牛尾|牛舌|牛百叶|牛肚|牛肝|牛心|牛肺|牛肠|牛血|牛骨|牛髓|牛油|牛肉干|牛肉松/.test(
      lowerName
    )
  ) {
    return "牛肉类";
  }

  // 羊肉类
  if (
    /羊肉|羊排|羊里脊|羊腿|羊蹄|羊肘|羊肚|羊肝|羊心|羊肺|羊肠|羊血|羊骨|羊油|羊肉干|羊肉松/.test(
      lowerName
    )
  ) {
    return "羊肉类";
  }

  // 禽肉类
  if (
    /鸡肉|鸡胸|鸡腿|鸡翅|鸡爪|鸡心|鸡肝|鸡肫|鸡骨|鸡皮|鸡油|鸭肉|鸭胸|鸭腿|鸭翅|鸭掌|鸭心|鸭肝|鸭肫|鸭骨|鸭皮|鸭油|鹅肉|鹅胸|鹅腿|鹅翅|鹅掌|鹅心|鹅肝|鹅肫|鹅骨|鹅皮|鹅油|鸽肉|鹌鹑|火鸡|乳鸽/.test(
      lowerName
    )
  ) {
    return "禽肉类";
  }

  // 鱼类
  if (
    /鱼|三文鱼|鲑鱼|金枪鱼|鳕鱼|带鱼|黄鱼|鲈鱼|鲫鱼|鲤鱼|草鱼|鲢鱼|鲳鱼|鲷鱼|鲅鱼|秋刀鱼|沙丁鱼|鳗鱼|黑鱼|鲨鱼|鱿鱼|墨鱼|章鱼/.test(
      lowerName
    )
  ) {
    return "鱼类";
  }

  // 贝壳类
  if (/贝|蛤|蚌|牡蛎|生蚝|扇贝|鲍鱼|螺|海螺|花螺|田螺|蜗牛/.test(lowerName)) {
    return "贝壳类";
  }

  // 虾蟹类
  if (
    /虾|龙虾|基围虾|明虾|北极虾|小龙虾|虾仁|虾米|虾皮|蟹|螃蟹|梭子蟹|大闸蟹|帝王蟹|蟹肉|蟹黄|蟹膏/.test(
      lowerName
    )
  ) {
    return "虾蟹类";
  }

  // 其他海鲜
  if (
    /海参|海胆|海蜇|海带|紫菜|海苔|海藻|海蛎|海鲜|鱼子酱|鱼籽|鱼肚|鱼翅|鱼唇|鱼鳔|鱼胶/.test(
      lowerName
    )
  ) {
    return "其他海鲜";
  }

  // 奶制品
  if (
    /牛奶|羊奶|酸奶|奶油|黄油|炼乳|奶粉|冰淇淋|酸乳|乳酪|乳制品/.test(lowerName)
  ) {
    return "奶制品";
  }

  // 奶酪类
  if (
    /奶酪|芝士|马苏里拉|切达|帕玛森|蓝纹奶酪|菲达奶酪|山羊奶酪|布里奶酪|卡门贝尔|瑞可达|莫扎里拉/.test(
      lowerName
    )
  ) {
    return "奶酪类";
  }

  // 蛋类
  if (
    /蛋|鸡蛋|鸭蛋|鹅蛋|鹌鹑蛋|皮蛋|松花蛋|咸蛋|茶叶蛋|卤蛋|蛋黄|蛋清|蛋白/.test(
      lowerName
    )
  ) {
    return "蛋类";
  }

  // 香辛料
  if (
    /盐|胡椒|花椒|八角|桂皮|香叶|月桂|丁香|肉桂|孜然|小茴香|大茴香|芥末|辣椒粉|五香粉|十三香|咖喱粉|姜黄|香草|迷迭香|百里香|薄荷|罗勒|香菜|芫荽|香芹|欧芹|茴香|芥菜|芥末|辣根|香茅|柠檬草|香叶|月桂叶|香料/.test(
      lowerName
    )
  ) {
    return "香辛料";
  }

  // 酱料
  if (
    /酱油|生抽|老抽|蚝油|豆瓣酱|甜面酱|黄豆酱|辣椒酱|沙茶酱|番茄酱|芝麻酱|花生酱|蒜蓉酱|XO酱|鱼露|虾酱|柱候酱|海鲜酱|豆腐乳|腐乳|辣酱|辣椒酱|辣豆瓣|郫县豆瓣|老干妈|豆豉|豆瓣/.test(
      lowerName
    )
  ) {
    return "酱料";
  }

  // 油类
  if (
    /油|食用油|植物油|橄榄油|葵花籽油|玉米油|花生油|菜籽油|菜油|芝麻油|香油|椰子油|棕榈油|葡萄籽油|亚麻籽油|核桃油|茶籽油|牛油|猪油|鸡油|鸭油|鹅油/.test(
      lowerName
    )
  ) {
    return "油类";
  }

  // 醋类
  if (
    /醋|米醋|白醋|陈醋|香醋|黑醋|苹果醋|葡萄醋|香醋|陈醋|镇江醋|山西老陈醋|香醋|宝鼎醋|白醋|米醋|糯米醋|红醋/.test(
      lowerName
    )
  ) {
    return "醋类";
  }

  // 糖类
  if (
    /糖|白砂糖|绵白糖|红糖|冰糖|黑糖|赤砂糖|黄糖|冰片糖|方糖|糖粉|糖浆|蜂蜜|枫糖浆|麦芽糖|果葡糖浆|葡萄糖|果糖/.test(
      lowerName
    )
  ) {
    return "糖类";
  }

  // 盐类
  if (
    /盐|食盐|海盐|岩盐|精盐|粗盐|低钠盐|加碘盐|味精|鸡精|鲜味精|谷氨酸钠|核苷酸/.test(
      lowerName
    )
  ) {
    return "盐类";
  }

  // 米类
  if (
    /米|大米|糯米|粳米|香米|泰国香米|东北大米|五常大米|黑米|紫米|红米|糙米|米饭|米粉|粉丝|粉条|河粉|米线|年糕|粽子/.test(
      lowerName
    )
  ) {
    return "米类";
  }

  // 面粉类
  if (
    /面粉|小麦粉|高筋面粉|中筋面粉|低筋面粉|全麦面粉|玉米面|燕麦粉|荞麦粉|大麦粉|薯类淀粉|土豆淀粉|红薯淀粉|木薯淀粉|马铃薯淀粉|淀粉|面条|挂面|通心粉|意面|方便面|拉面|刀削面|手擀面|乌冬面|荞麦面|冷面|热干面|刀削面|油面筋/.test(
      lowerName
    )
  ) {
    return "面粉类";
  }

  // 豆类
  if (
    /豆|黄豆|青豆|毛豆|黑豆|红豆|绿豆|豌豆|蚕豆|豇豆|四季豆|刀豆|扁豆|豆芽|黄豆芽|绿豆芽|豆腐|内酯豆腐|南豆腐|北豆腐|豆腐干|豆腐皮|豆腐丝|豆腐脑|豆浆|豆花|豆沙/.test(
      lowerName
    )
  ) {
    return "豆类";
  }

  // 杂粮类
  if (
    /小米|玉米|高粱|燕麦|荞麦|薏米|薏仁|芡实|莲子|百合|栗子|板栗|苡仁|大麦|黑麦|燕麦|荞麦|藜麦|苋菜籽|亚麻籽|奇亚籽|芝麻|葵花籽|南瓜籽|西瓜籽|松子|核桃|杏仁|花生|腰果|榛子|开心果|夏威夷果|碧根果|巴旦木|瓜子/.test(
      lowerName
    )
  ) {
    return "杂粮类";
  }

  // 坚果种子
  if (
    /坚果|核桃|花生|腰果|杏仁|榛子|松子|开心果|瓜子|葵花籽|南瓜籽|西瓜籽|芝麻|亚麻籽|奇亚籽|火麻仁|葵花籽|南瓜籽|西瓜籽|向日葵籽|芝麻|黑芝麻|白芝麻/.test(
      lowerName
    )
  ) {
    return "坚果种子";
  }

  // 药食同源
  if (
    /枸杞|红枣|黑枣|桂圆|龙眼|莲子|百合|山药|黄精|灵芝|冬虫夏草|人参|西洋参|党参|黄芪|当归|川芎|白芍|熟地黄|何首乌|阿胶|燕窝|雪蛤|鹿茸|鹿筋|鹿尾|鹿鞭|海马|羚羊角|龟板|鳖甲/.test(
      lowerName
    )
  ) {
    return "药食同源";
  }

  // 饮品酒水
  if (
    /茶|绿茶|红茶|乌龙茶|白茶|黄茶|黑茶|普洱茶|花茶|茉莉花茶|菊花茶|玫瑰花茶|薄荷茶|柠檬茶|姜茶|咖啡|可可|巧克力|奶茶|果汁|果茶|汽水|可乐|雪碧|芬达|苏打水|矿泉水|纯净水|啤酒|葡萄酒|红酒|白酒|威士忌|伏特加|朗姆酒|金酒|龙舌兰|白兰地|香槟|鸡尾酒|米酒|黄酒|料酒/.test(
      lowerName
    )
  ) {
    return "饮品酒水";
  }

  // 加工食品
  if (
    /火腿|香肠|腊肉|熏肉|培根|罐头|午餐肉|方便面|速冻食品|冷冻食品|速食|即食|方便食品|零食|饼干|蛋糕|面包|糕点|甜点|巧克力|糖果|薯片|薯条|爆米花|膨化食品|果脯|蜜饯|果干|肉干|肉松|鱼干|海苔|紫菜|海带丝/.test(
      lowerName
    )
  ) {
    return "加工食品";
  }

  // 如果没有匹配到细分类别，则使用主要分类

  // 蔬菜水果大类
  if (/菜|蔬菜|水果|果|蔬果/.test(lowerName)) {
    return "蔬菜水果";
  }

  // 肉类海鲜大类
  if (/肉|海鲜|水产/.test(lowerName)) {
    return "肉类海鲜";
  }

  // 乳制品蛋类大类
  if (/奶|乳|蛋|奶酪|芝士/.test(lowerName)) {
    return "乳制品蛋类";
  }

  // 调味品干货大类
  if (/调味|香料|酱|油|醋|糖|盐|料/.test(lowerName)) {
    return "调味品干货";
  }

  // 谷物豆类大类
  if (/谷物|豆|米|面|粮/.test(lowerName)) {
    return "谷物豆类";
  }

  // 默认分类
  return "其他";
}

// AI服务响应的菜谱数据结构
const AiRecipeSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  cookingTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  difficulty: z.enum(["简单", "中等", "困难"]).optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.string(),
        category: z.string().optional(),
      })
    )
    .optional(),
  instructions: z
    .array(
      z.object({
        step: z.number().int().positive(),
        content: z.string(),
        imageUrl: z.string().optional(),
      })
    )
    .optional(),
  // nutritionInfo: z.record(z.number()).optional(), // 示例，根据实际需要调整
  // categoryIds: z.array(z.string()).optional(), // 示例
  // tagIds: z.array(z.string()).optional(), // 示例
  coverImage: z.string().optional(),
});

const RequestBodySchema = z.object({
  prompt: z.string().min(1, { message: "提示词不能为空" }),
});

/**
 * 处理AI生成结构化菜谱数据的请求。
 * @param request - Next.js API请求对象。
 * @returns Next.js API响应，包含生成的菜谱数据或错误信息。
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = RequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "请求参数无效",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { prompt } = validationResult.data;

    // --- 调用火山方舟AI API生成菜谱 ---
    console.log(`AI正在根据提示生成菜谱: "${prompt}"`);

    // 获取API密钥
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      console.error("ARK_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "AI服务未配置，请联系管理员。" },
        { status: 500 }
      );
    }

    // 火山方舟API端点
    const arkApiUrl =
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

    // 构建提示词，要求AI返回结构化的JSON数据
    const aiPrompt = `
你是一个专业的厨师，擅长创建美味的食谱。请根据用户的要求生成详细的食谱。

用户请求: ${prompt}

请生成一个结构化的食谱，包含以下信息:
1. 标题 (title): 一个吸引人的菜谱名称
2. 描述 (description): 对这道菜的简短描述，包括其特点和口味
3. 烹饪时间 (cookingTime): 预计烹饪时间，单位为分钟
4. 份量 (servings): 这道菜可以供几人食用
5. 难度 (difficulty): 必须是以下三个值之一: "简单", "中等", "困难"
6. 食材 (ingredients): 一个数组，每个元素包含:
   - name: 食材名称（尽量使用标准、简洁的名称，如"鸡胸肉"而不是"去皮鸡胸肉"）
   - quantity: 食材数量，如"200克"、"2汤匙"等（请尽量使用标准计量单位）
   - category: 食材分类，可以使用以下值:
     * 主要分类: "蔬菜水果", "肉类海鲜", "乳制品蛋类", "调味品干货", "谷物豆类", "坚果种子", "菌菇类", "药食同源", "饮品酒水", "加工食品", "其他"
     * 蔬菜水果细分: "叶菜类", "根茎类", "瓜果类", "菌菇类", "水果类", "浆果类"
     * 肉类海鲜细分: "猪肉类", "牛肉类", "羊肉类", "禽肉类", "鱼类", "贝壳类", "虾蟹类", "其他海鲜"
     * 乳制品蛋类细分: "奶制品", "奶酪类", "蛋类"
     * 调味品干货细分: "香辛料", "酱料", "油类", "醋类", "糖类", "盐类"
     * 谷物豆类细分: "米类", "面粉类", "豆类", "杂粮类"
7. 烹饪步骤 (instructions): 一个数组，每个元素包含:
   - step: 步骤编号，从1开始
   - content: 详细的步骤说明

请以JSON格式返回，确保格式正确可解析。不要包含任何额外的解释或文本，只返回JSON对象。
`;

    // 构建请求体
    const requestBody = {
      messages: [
        {
          content:
            "你是一个专业的厨师，擅长创建结构化的食谱数据。请严格按照要求的JSON格式返回结果。",
          role: "system",
        },
        {
          content: aiPrompt,
          role: "user",
        },
      ],
      model: "doubao-1-5-thinking-pro-250415",
      stream: false,
      temperature: 0.7,
    };

    console.log("AI Request Model:", requestBody.model);

    // 调用火山方舟API
    const aiResponse = await fetch(arkApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("火山方舟AI API错误:", aiResponse.status, errorBody);
      return NextResponse.json(
        {
          error: `AI菜谱生成失败，API错误: ${aiResponse.statusText}`,
          details: errorBody,
        },
        { status: aiResponse.status }
      );
    }

    const aiData = await aiResponse.json();

    let recipeContent = "";
    if (
      aiData.choices &&
      aiData.choices.length > 0 &&
      aiData.choices[0].message &&
      aiData.choices[0].message.content
    ) {
      recipeContent = aiData.choices[0].message.content;
    } else {
      console.error("从火山方舟AI API获取的响应结构意外:", aiData);
      return NextResponse.json(
        { error: "AI未能生成有效的菜谱内容。", details: aiData },
        { status: 500 }
      );
    }

    // 尝试解析AI返回的JSON字符串
    let generatedRecipe: z.infer<typeof AiRecipeSchema>;
    try {
      // 有时AI返回的JSON可能被包裹在markdown代码块中，尝试提取
      const jsonMatch = recipeContent.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        recipeContent = jsonMatch[1];
      }

      // 尝试解析JSON
      const parsedRecipe = JSON.parse(recipeContent);

      // 使用Zod验证结构
      const recipeValidationResult = AiRecipeSchema.safeParse(parsedRecipe);
      if (!recipeValidationResult.success) {
        console.error(
          "AI生成的菜谱结构校验失败:",
          recipeValidationResult.error.flatten()
        );

        // 尝试修复常见问题
        const fixedRecipe = {
          title: parsedRecipe.title || `AI生成的：${prompt.substring(0, 20)}`,
          description:
            parsedRecipe.description ||
            `这是一份根据您的提示"${prompt}"由AI智能生成的美味菜谱。`,
          cookingTime: parsedRecipe.cookingTime || 30,
          servings: parsedRecipe.servings || 2,
          difficulty: ["简单", "中等", "困难"].includes(parsedRecipe.difficulty)
            ? parsedRecipe.difficulty
            : "中等",
          ingredients: Array.isArray(parsedRecipe.ingredients)
            ? parsedRecipe.ingredients.map((ing: any) => ({
                name: ing.name || "未知食材",
                quantity: ing.quantity || "适量",
                // 如果食材没有分类，使用自动分类函数
                category:
                  ing.category || categorizeIngredient(ing.name || "未知食材"),
              }))
            : [{ name: "主要食材", quantity: "适量", category: "其他" }],
          instructions: Array.isArray(parsedRecipe.instructions)
            ? parsedRecipe.instructions.map((inst: any, idx: number) => ({
                step: inst.step || idx + 1,
                content: inst.content || `步骤 ${idx + 1}`,
                imageUrl: inst.imageUrl,
              }))
            : [{ step: 1, content: "按照传统方法烹饪。" }],
        };

        // 再次验证修复后的结构
        const fixedValidation = AiRecipeSchema.safeParse(fixedRecipe);
        if (fixedValidation.success) {
          generatedRecipe = fixedValidation.data;
          console.log("成功修复AI生成的菜谱结构");
        } else {
          throw new Error("无法修复AI生成的菜谱结构");
        }
      } else {
        generatedRecipe = recipeValidationResult.data;
      }
    } catch (parseError) {
      console.error(
        "解析AI返回的菜谱JSON失败:",
        parseError,
        "\n原始AI响应内容:",
        recipeContent
      );

      // 创建一个基本的菜谱结构作为后备
      generatedRecipe = {
        title: `AI生成的：${prompt.substring(0, 20)}`,
        description: `这是一份根据您的提示"${prompt}"由AI智能生成的美味菜谱。由于AI返回格式问题，这是一个基本版本。`,
        cookingTime: 30,
        servings: 2,
        difficulty: "中等",
        ingredients: [
          { name: "主要食材 (根据提示)", quantity: "适量", category: "其他" },
          {
            name: "调味料 (根据提示)",
            quantity: "少许",
            category: "调味品干货",
          },
        ],
        instructions: [
          {
            step: 1,
            content: '准备好所有根据提示"' + prompt + '"所需的食材。',
          },
          { step: 2, content: "按照传统烹饪方法进行烹饪。" },
          { step: 3, content: "享用您的美食！" },
        ],
      };
    }

    // --- AI生成逻辑结束 ---

    // 后处理：确保所有食材都有分类和格式化的数量
    if (generatedRecipe.ingredients) {
      generatedRecipe.ingredients = generatedRecipe.ingredients.map(
        (ingredient) => ({
          ...ingredient,
          // 确保有分类
          category:
            ingredient.category || categorizeIngredient(ingredient.name),
          // 格式化数量
          quantity: formatQuantity(ingredient.quantity),
        })
      );
    }

    return NextResponse.json({ recipe: generatedRecipe });
  } catch (error) {
    console.error("AI菜谱生成API出错:", error);
    let errorMessage = "AI菜谱生成失败，请稍后再试。";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
