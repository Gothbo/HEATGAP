import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFoodInput, matchFoodName } from "@/lib/food-parser";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    const where: any = { userId };

    if (dateStr) {
      const start = new Date(dateStr + "T00:00:00.000Z");
      const end = new Date(dateStr + "T23:59:59.999Z");
      where.date = { gte: start, lte: end };
    }

    const meals = await prisma.mealEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error("Meals API error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, input, date } = body;

    if (!input && !body.foodName) {
      return NextResponse.json(
        { error: "请输入食物信息" },
        { status: 400 }
      );
    }

    const targetUser = userId || "default";
    const targetDate = date ? new Date(date + "T00:00:00.000Z") : new Date();

    // If direct food entry (no parsing needed)
    if (body.foodName) {
      const meal = await prisma.mealEntry.create({
        data: {
          userId: targetUser,
          date: targetDate,
          foodName: body.foodName,
          weight: body.weight || 100,
          calories: body.calories || 0,
          protein: body.protein || 0,
          fat: body.fat || 0,
          carbs: body.carbs || 0,
          isCustom: body.isCustom || false,
        },
      });
      return NextResponse.json(meal);
    }

    // Parse natural language input
    const parsedItems = parseFoodInput(input);
    if (parsedItems.length === 0) {
      return NextResponse.json(
        { error: "无法识别食物信息，请尝试格式如：250g熟米饭 100g猪肉" },
        { status: 400 }
      );
    }

    // Get all food names from DB for matching
    const allFoods = await prisma.food.findMany();
    const foodMap = new Map(allFoods.map((f) => [f.name, f]));

    const results = [];
    const unmatched: string[] = [];

    for (const item of parsedItems) {
      const match = matchFoodName(item.name, Array.from(foodMap.keys()));

      if (match) {
        const foodData = foodMap.get(match.matched)!;

        // Calculate nutrition for the given weight
        const factor = item.weight / 100;

        const meal = await prisma.mealEntry.create({
          data: {
            userId: targetUser,
            date: targetDate,
            foodName: foodData.name,
            weight: item.weight,
            calories: Math.round(foodData.calories * factor),
            protein: Math.round(foodData.protein * factor * 10) / 10,
            fat: Math.round(foodData.fat * factor * 10) / 10,
            carbs: Math.round(foodData.carbs * factor * 10) / 10,
            isCustom: false,
          },
        });
        results.push(meal);
      } else {
        unmatched.push(item.raw);
      }
    }

    return NextResponse.json({
      meals: results,
      unmatched,
      totalCalories: results.reduce((sum, m) => sum + m.calories, 0),
    });
  } catch (error) {
    console.error("Meal entry error:", error);
    return NextResponse.json(
      { error: "记录失败，请重试" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const userId = searchParams.get("userId") || "default";

  if (id) {
    await prisma.mealEntry.delete({ where: { id } });
  } else {
    // Clear all meals for user on a date
    const dateStr = searchParams.get("date");
    if (dateStr) {
      const start = new Date(dateStr + "T00:00:00.000Z");
      const end = new Date(dateStr + "T23:59:59.999Z");
      await prisma.mealEntry.deleteMany({
        where: { userId, date: { gte: start, lte: end } },
      });
    }
  }

  return NextResponse.json({ success: true });
}
