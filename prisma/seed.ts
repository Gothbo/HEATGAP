import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 中国常见食物营养成分表 (每100g)
const foods = [
  // 主食
  { name: "熟米饭", category: "主食", calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9 },
  { name: "生大米", category: "主食", calories: 346, protein: 7.4, fat: 0.8, carbs: 77.2 },
  { name: "馒头", category: "主食", calories: 221, protein: 7.0, fat: 1.1, carbs: 44.2 },
  { name: "面条(熟)", category: "主食", calories: 110, protein: 3.4, fat: 0.3, carbs: 23.6 },
  { name: "挂面(干)", category: "主食", calories: 346, protein: 10.3, fat: 0.6, carbs: 74.1 },
  { name: "全麦面包", category: "主食", calories: 246, protein: 8.5, fat: 3.4, carbs: 44.0 },
  { name: "白面包", category: "主食", calories: 265, protein: 8.0, fat: 3.2, carbs: 49.0 },
  { name: "燕麦片", category: "主食", calories: 367, protein: 13.5, fat: 6.7, carbs: 66.3 },
  { name: "小米粥", category: "主食", calories: 46, protein: 1.4, fat: 0.7, carbs: 8.4 },
  { name: "玉米(鲜)", category: "主食", calories: 112, protein: 4.0, fat: 1.2, carbs: 22.8 },
  { name: "红薯", category: "主食", calories: 86, protein: 1.6, fat: 0.1, carbs: 20.1 },
  { name: "土豆", category: "主食", calories: 81, protein: 2.0, fat: 0.2, carbs: 17.5 },
  { name: "山药", category: "主食", calories: 57, protein: 1.9, fat: 0.2, carbs: 12.4 },
  { name: "糙米饭", category: "主食", calories: 111, protein: 2.5, fat: 0.9, carbs: 23.0 },
  { name: "荞麦面(熟)", category: "主食", calories: 110, protein: 4.4, fat: 0.5, carbs: 21.7 },
  { name: "紫薯", category: "主食", calories: 82, protein: 1.8, fat: 0.2, carbs: 19.0 },
  { name: "粽子", category: "主食", calories: 195, protein: 4.5, fat: 3.0, carbs: 37.0 },

  // 肉类
  { name: "猪肉(瘦)", category: "肉类", calories: 143, protein: 20.3, fat: 6.2, carbs: 1.5 },
  { name: "猪肉(肥瘦)", category: "肉类", calories: 395, protein: 13.2, fat: 37.0, carbs: 2.4 },
  { name: "猪排骨", category: "肉类", calories: 264, protein: 18.3, fat: 20.4, carbs: 1.7 },
  { name: "猪肝", category: "肉类", calories: 129, protein: 19.3, fat: 3.5, carbs: 5.0 },
  { name: "鸡胸肉", category: "肉类", calories: 133, protein: 31.0, fat: 1.2, carbs: 0.1 },
  { name: "鸡腿肉", category: "肉类", calories: 181, protein: 20.0, fat: 11.0, carbs: 0 },
  { name: "鸡翅", category: "肉类", calories: 202, protein: 17.4, fat: 14.0, carbs: 0 },
  { name: "鸡蛋白(煮)", category: "肉类", calories: 60, protein: 12.0, fat: 0.1, carbs: 1.2 },
  { name: "鸡蛋(全)", category: "肉类", calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8 },
  { name: "牛肉(瘦)", category: "肉类", calories: 106, protein: 20.2, fat: 2.3, carbs: 1.2 },
  { name: "牛腩", category: "肉类", calories: 189, protein: 17.1, fat: 13.0, carbs: 0.5 },
  { name: "羊肉(瘦)", category: "肉类", calories: 118, protein: 20.5, fat: 3.9, carbs: 0.2 },
  { name: "鸭肉", category: "肉类", calories: 240, protein: 15.5, fat: 19.7, carbs: 0.2 },
  { name: "腊肉", category: "肉类", calories: 498, protein: 11.8, fat: 48.8, carbs: 5.5 },
  { name: "火腿", category: "肉类", calories: 330, protein: 16.0, fat: 27.4, carbs: 4.9 },
  { name: "培根", category: "肉类", calories: 541, protein: 12.0, fat: 55.0, carbs: 1.5 },
  { name: "肉松", category: "肉类", calories: 396, protein: 32.5, fat: 18.3, carbs: 26.8 },
  { name: "猪蹄", category: "肉类", calories: 260, protein: 22.6, fat: 18.8, carbs: 0 },

  // 海鲜
  { name: "虾仁", category: "海鲜", calories: 48, protein: 10.4, fat: 0.2, carbs: 0.7 },
  { name: "基围虾", category: "海鲜", calories: 101, protein: 18.7, fat: 1.7, carbs: 2.8 },
  { name: "三文鱼", category: "海鲜", calories: 139, protein: 21.3, fat: 6.3, carbs: 0 },
  { name: "鲈鱼", category: "海鲜", calories: 105, protein: 18.6, fat: 3.4, carbs: 0 },
  { name: "带鱼", category: "海鲜", calories: 127, protein: 17.7, fat: 4.9, carbs: 3.1 },
  { name: "金枪鱼(罐头)", category: "海鲜", calories: 116, protein: 26.0, fat: 0.8, carbs: 0 },
  { name: "鳕鱼", category: "海鲜", calories: 82, protein: 17.8, fat: 0.7, carbs: 0 },
  { name: "鱿鱼", category: "海鲜", calories: 75, protein: 17.4, fat: 0.8, carbs: 0 },
  { name: "蛤蜊", category: "海鲜", calories: 62, protein: 10.0, fat: 0.8, carbs: 2.8 },
  { name: "螃蟹", category: "海鲜", calories: 95, protein: 13.8, fat: 3.6, carbs: 2.3 },
  { name: "海参", category: "海鲜", calories: 25, protein: 6.0, fat: 0.1, carbs: 0.3 },

  // 蔬菜
  { name: "番茄", category: "蔬菜", calories: 19, protein: 0.9, fat: 0.2, carbs: 4.0 },
  { name: "黄瓜", category: "蔬菜", calories: 15, protein: 0.8, fat: 0.1, carbs: 2.9 },
  { name: "生菜", category: "蔬菜", calories: 13, protein: 1.3, fat: 0.2, carbs: 1.6 },
  { name: "白菜", category: "蔬菜", calories: 13, protein: 1.5, fat: 0.1, carbs: 2.2 },
  { name: "菠菜", category: "蔬菜", calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6 },
  { name: "西兰花", category: "蔬菜", calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6 },
  { name: "胡萝卜", category: "蔬菜", calories: 37, protein: 1.0, fat: 0.2, carbs: 8.8 },
  { name: "洋葱", category: "蔬菜", calories: 39, protein: 1.1, fat: 0.1, carbs: 9.0 },
  { name: "青椒", category: "蔬菜", calories: 22, protein: 1.0, fat: 0.2, carbs: 4.6 },
  { name: "茄子", category: "蔬菜", calories: 21, protein: 1.0, fat: 0.2, carbs: 4.3 },
  { name: "芹菜", category: "蔬菜", calories: 14, protein: 0.8, fat: 0.1, carbs: 2.6 },
  { name: "豆芽", category: "蔬菜", calories: 18, protein: 2.1, fat: 0.5, carbs: 1.8 },
  { name: "冬瓜", category: "蔬菜", calories: 11, protein: 0.4, fat: 0.2, carbs: 2.6 },
  { name: "南瓜", category: "蔬菜", calories: 22, protein: 0.7, fat: 0.1, carbs: 5.2 },
  { name: "木耳", category: "蔬菜", calories: 21, protein: 1.5, fat: 0.2, carbs: 3.9 },
  { name: "香菇", category: "蔬菜", calories: 19, protein: 2.2, fat: 0.3, carbs: 1.9 },
  { name: "豆腐", category: "蔬菜", calories: 81, protein: 8.1, fat: 3.7, carbs: 4.2 },
  { name: "豆干", category: "蔬菜", calories: 140, protein: 16.2, fat: 7.0, carbs: 4.6 },
  { name: "海带", category: "蔬菜", calories: 13, protein: 1.2, fat: 0.1, carbs: 2.0 },
  { name: "秋葵", category: "蔬菜", calories: 31, protein: 2.0, fat: 0.1, carbs: 6.1 },
  { name: "芦笋", category: "蔬菜", calories: 19, protein: 2.2, fat: 0.1, carbs: 3.4 },
  { name: "空心菜", category: "蔬菜", calories: 20, protein: 2.2, fat: 0.3, carbs: 3.1 },
  { name: "油菜", category: "蔬菜", calories: 13, protein: 1.3, fat: 0.3, carbs: 1.9 },

  // 水果
  { name: "苹果", category: "水果", calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8 },
  { name: "香蕉", category: "水果", calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8 },
  { name: "橙子", category: "水果", calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8 },
  { name: "葡萄", category: "水果", calories: 69, protein: 0.7, fat: 0.2, carbs: 18.1 },
  { name: "蓝莓", category: "水果", calories: 57, protein: 0.7, fat: 0.3, carbs: 14.5 },
  { name: "草莓", category: "水果", calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7 },
  { name: "西瓜", category: "水果", calories: 30, protein: 0.6, fat: 0.2, carbs: 7.6 },
  { name: "猕猴桃", category: "水果", calories: 61, protein: 1.1, fat: 0.5, carbs: 14.7 },
  { name: "芒果", category: "水果", calories: 60, protein: 0.8, fat: 0.4, carbs: 15.0 },
  { name: "梨", category: "水果", calories: 51, protein: 0.4, fat: 0.1, carbs: 13.1 },
  { name: "桃子", category: "水果", calories: 39, protein: 0.9, fat: 0.3, carbs: 9.5 },
  { name: "柚子", category: "水果", calories: 38, protein: 0.8, fat: 0.1, carbs: 9.6 },
  { name: "菠萝", category: "水果", calories: 41, protein: 0.5, fat: 0.1, carbs: 10.8 },
  { name: "火龙果", category: "水果", calories: 55, protein: 1.1, fat: 0.4, carbs: 12.7 },
  { name: "车厘子", category: "水果", calories: 63, protein: 1.1, fat: 0.2, carbs: 16.0 },

  // 蛋奶
  { name: "全蛋", category: "蛋奶", calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8 },
  { name: "蛋白", category: "蛋奶", calories: 60, protein: 12.0, fat: 0.1, carbs: 1.2 },
  { name: "蛋黄", category: "蛋奶", calories: 322, protein: 15.2, fat: 26.5, carbs: 3.6 },
  { name: "全脂牛奶", category: "蛋奶", calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8 },
  { name: "脱脂牛奶", category: "蛋奶", calories: 34, protein: 3.4, fat: 0.1, carbs: 5.0 },
  { name: "酸奶(原味)", category: "蛋奶", calories: 63, protein: 3.5, fat: 1.5, carbs: 9.5 },
  { name: "希腊酸奶", category: "蛋奶", calories: 97, protein: 9.0, fat: 5.0, carbs: 3.6 },
  { name: "芝士", category: "蛋奶", calories: 350, protein: 25.0, fat: 27.0, carbs: 1.3 },
  { name: "奶酪", category: "蛋奶", calories: 328, protein: 25.7, fat: 23.5, carbs: 3.5 },

  // 豆类
  { name: "黄豆", category: "豆类", calories: 359, protein: 35.0, fat: 16.0, carbs: 34.2 },
  { name: "绿豆", category: "豆类", calories: 316, protein: 21.6, fat: 0.8, carbs: 62.0 },
  { name: "红豆", category: "豆类", calories: 309, protein: 20.2, fat: 0.6, carbs: 60.7 },
  { name: "豆腐(嫩)", category: "豆类", calories: 62, protein: 6.2, fat: 2.5, carbs: 2.8 },
  { name: "豆腐(老)", category: "豆类", calories: 81, protein: 8.1, fat: 3.7, carbs: 4.2 },
  { name: "豆浆", category: "豆类", calories: 31, protein: 2.9, fat: 1.4, carbs: 1.4 },
  { name: "毛豆", category: "豆类", calories: 131, protein: 11.9, fat: 5.0, carbs: 10.5 },
  { name: "腐竹", category: "豆类", calories: 459, protein: 44.6, fat: 21.7, carbs: 22.8 },

  // 坚果
  { name: "花生", category: "坚果", calories: 563, protein: 24.8, fat: 44.3, carbs: 21.7 },
  { name: "核桃", category: "坚果", calories: 654, protein: 15.2, fat: 65.2, carbs: 13.7 },
  { name: "杏仁", category: "坚果", calories: 578, protein: 21.2, fat: 49.9, carbs: 19.7 },
  { name: "腰果", category: "坚果", calories: 553, protein: 18.2, fat: 43.8, carbs: 30.2 },
  { name: "开心果", category: "坚果", calories: 562, protein: 20.2, fat: 45.4, carbs: 27.5 },
  { name: "松子", category: "坚果", calories: 673, protein: 13.7, fat: 68.4, carbs: 13.1 },

  // 调味/油
  { name: "橄榄油", category: "调味", calories: 884, protein: 0, fat: 100, carbs: 0 },
  { name: "花生油", category: "调味", calories: 884, protein: 0, fat: 100, carbs: 0 },
  { name: "芝麻油", category: "调味", calories: 884, protein: 0, fat: 100, carbs: 0 },
  { name: "黄油", category: "调味", calories: 717, protein: 0.9, fat: 81.1, carbs: 0.1 },
  { name: "白砂糖", category: "调味", calories: 387, protein: 0, fat: 0, carbs: 100 },
  { name: "蜂蜜", category: "调味", calories: 304, protein: 0.3, fat: 0, carbs: 82.1 },
  { name: "生抽", category: "调味", calories: 52, protein: 8.1, fat: 0, carbs: 4.8 },
  { name: "老抽", category: "调味", calories: 73, protein: 7.6, fat: 0, carbs: 11.3 },
  { name: "醋", category: "调味", calories: 30, protein: 0.4, fat: 0, carbs: 4.7 },
  { name: "食用盐", category: "调味", calories: 0, protein: 0, fat: 0, carbs: 0 },

  // 零食/饮料
  { name: "牛奶巧克力", category: "零食", calories: 535, protein: 7.6, fat: 31.3, carbs: 58.2 },
  { name: "黑巧克力", category: "零食", calories: 546, protein: 4.9, fat: 31.3, carbs: 61.2 },
  { name: "冰淇淋", category: "零食", calories: 207, protein: 3.5, fat: 11.0, carbs: 24.0 },
  { name: "薯片", category: "零食", calories: 536, protein: 7.0, fat: 34.6, carbs: 49.7 },
  { name: "饼干", category: "零食", calories: 433, protein: 8.0, fat: 16.0, carbs: 67.0 },
  { name: "蛋糕", category: "零食", calories: 347, protein: 5.3, fat: 14.4, carbs: 50.9 },
  { name: "可乐", category: "零食", calories: 42, protein: 0, fat: 0, carbs: 10.6 },
  { name: "啤酒", category: "零食", calories: 43, protein: 0.5, fat: 0, carbs: 3.6 },
  { name: "蛋白粉(乳清)", category: "零食", calories: 400, protein: 80.0, fat: 6.0, carbs: 10.0 },
];

async function main() {
  console.log("🌱 Seeding food database...");

  // Clean existing data
  await prisma.mealEntry.deleteMany();
  await prisma.exerciseLog.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.workoutDay.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.food.deleteMany();
  await prisma.weightRecord.deleteMany();

  // Seed foods
  for (const food of foods) {
    await prisma.food.create({
      data: {
        name: food.name,
        category: food.category,
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        isBuiltIn: true,
      },
    });
  }
  console.log(`✅ Seeded ${foods.length} foods`);

  // Seed workout plan - 三分化推拉腿
  const plan = await prisma.workoutPlan.create({
    data: {
      name: "三分化推拉腿",
      isBuiltIn: true,
    },
  });

  // 推日
  const pushDay = await prisma.workoutDay.create({
    data: {
      planId: plan.id,
      name: "推日",
      sortOrder: 1,
    },
  });

  const pushExercises = [
    { name: "杠铃平板卧推", sets: 3, reps: "12/10/8", met: 5.0, rpe: "8" },
    { name: "哑铃上斜卧推", sets: 4, reps: "12", met: 5.5, rpe: "8" },
    { name: "双杠臂屈伸", sets: 4, reps: "12", met: 5.0, rpe: "力竭" },
    { name: "仰卧弯屈伸", sets: 4, reps: "15", met: 3.5, rpe: "8" },
    { name: "Y字侧平举", sets: 3, reps: "10+5休+10", met: 3.0, rpe: "" },
  ];

  for (let i = 0; i < pushExercises.length; i++) {
    await prisma.exercise.create({
      data: {
        dayId: pushDay.id,
        ...pushExercises[i],
        sortOrder: i + 1,
      },
    });
  }

  // 拉日 (含热身)
  const pullDay = await prisma.workoutDay.create({
    data: {
      planId: plan.id,
      name: "拉日",
      sortOrder: 2,
    },
  });

  const pullExercises = [
    { name: "直臂下压(热身)", sets: 2, reps: "15", met: 3.5, rpe: "" },
    { name: "引体向上(热身)", sets: 2, reps: "12", met: 5.0, rpe: "" },
    { name: "单手钢线下拉", sets: 4, reps: "12/12/10+5休+5", met: 5.0, rpe: "8" },
    { name: "对握下拉", sets: 4, reps: "8-12", met: 5.0, rpe: "8" },
    { name: "单手器械划船", sets: 4, reps: "12/12/10+5休+5", met: 5.5, rpe: "力竭" },
    { name: "坐姿划船/海豹划船", sets: 4, reps: "12-15", met: 5.0, rpe: "8" },
    { name: "钢线弯举", sets: 3, reps: "12", met: 3.0, rpe: "8" },
  ];

  for (let i = 0; i < pullExercises.length; i++) {
    await prisma.exercise.create({
      data: {
        dayId: pullDay.id,
        ...pullExercises[i],
        sortOrder: i + 1,
      },
    });
  }

  // 腿日
  const legDay = await prisma.workoutDay.create({
    data: {
      planId: plan.id,
      name: "腿日",
      sortOrder: 3,
    },
  });

  const legExercises = [
    { name: "单腿硬拉", sets: 4, reps: "12", met: 5.0, rpe: "8" },
    { name: "保加利亚深蹲", sets: 4, reps: "10", met: 6.0, rpe: "8" },
    { name: "颈前深蹲", sets: 3, reps: "15", met: 6.0, rpe: "8" },
    { name: "罗马尼亚硬拉", sets: 3, reps: "12", met: 5.0, rpe: "8" },
    { name: "山羊挺身", sets: 3, reps: "8", met: 3.5, rpe: "8" },
  ];

  for (let i = 0; i < legExercises.length; i++) {
    await prisma.exercise.create({
      data: {
        dayId: legDay.id,
        ...legExercises[i],
        sortOrder: i + 1,
      },
    });
  }

  console.log("✅ Seeded workout plan (三分化推拉腿)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
