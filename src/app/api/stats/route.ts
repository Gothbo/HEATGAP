import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BMR = 1950;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "default";
  const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const start = new Date(dateStr + "T00:00:00.000Z");
  const end = new Date(dateStr + "T23:59:59.999Z");

  // Gracefully handle database errors — return empty data if DB is unavailable
  try {
    const meals = await prisma.mealEntry.findMany({
      where: { userId, date: { gte: start, lte: end } },
    });

    const intakeCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);

    const sessions = await prisma.workoutSession.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { day: true },
    });

    const workoutCalories = sessions.reduce((sum, s) => sum + s.totalCalories, 0);
    const tdee = BMR + workoutCalories;
    const deficit = Math.round((intakeCalories - tdee) * 10) / 10;

    return NextResponse.json({
      date: dateStr,
      intake: {
        calories: intakeCalories,
        protein: Math.round(totalProtein * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        meals: meals.length,
      },
      workout: {
        calories: workoutCalories,
        sessions: sessions.length,
        sessionNames: sessions.map((s) => s.day.name),
      },
      bmr: BMR,
      tdee,
      deficit,
      targetDeficit: -500,
      isOnTrack: deficit <= -300,
    });
  } catch (error) {
    console.error("Stats API error (returning empty data):", error);
    return NextResponse.json({
      date: dateStr,
      intake: { calories: 0, protein: 0, fat: 0, carbs: 0, meals: 0 },
      workout: { calories: 0, sessions: 0, sessionNames: [] },
      bmr: BMR,
      tdee: BMR,
      deficit: 0,
      targetDeficit: -500,
      isOnTrack: false,
    });
  }
}
