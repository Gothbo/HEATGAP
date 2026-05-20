import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateExerciseCalories } from "@/lib/calorie-calc";

const USER_WEIGHT = 87;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";
    const dateStr = searchParams.get("date");

    const where: Record<string, unknown> = { userId };

    if (dateStr) {
      const start = new Date(dateStr + "T00:00:00.000Z");
      const end = new Date(dateStr + "T23:59:59.999Z");
      where.date = { gte: start, lte: end };
    }

    const sessions = await prisma.workoutSession.findMany({
      where,
      include: { day: true, exerciseLogs: { include: { exercise: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Workout sessions GET error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, dayId, weight } = body;
    const userWeight = weight || USER_WEIGHT;

    if (!dayId) {
      return NextResponse.json({ error: "请选择训练部位" }, { status: 400 });
    }

    const targetUser = userId || "default";
    const targetDate = body.date
      ? new Date(body.date + "T00:00:00.000Z")
      : new Date();

    const day = await prisma.workoutDay.findUnique({
      where: { id: dayId },
      include: { exercises: { orderBy: { sortOrder: "asc" } } },
    });

    if (!day) {
      return NextResponse.json({ error: "训练部位不存在" }, { status: 404 });
    }

    const exerciseLogs: {
      exerciseId: string;
      weight: number;
      sets: number;
      reps: string;
      calories: number;
    }[] = [];

    let totalCalories = 0;

    for (const exercise of day.exercises) {
      const actualWeight =
        body.exerciseWeights?.[exercise.id] ?? body.defaultWeight ?? 0;
      const sets = body.exerciseSets?.[exercise.id] ?? exercise.sets;
      const reps = body.exerciseReps?.[exercise.id] ?? exercise.reps;
      const calories = calculateExerciseCalories(exercise.met, userWeight, sets, 10);

      exerciseLogs.push({
        exerciseId: exercise.id,
        weight: actualWeight,
        sets,
        reps,
        calories,
      });

      totalCalories += calories;
    }

    totalCalories = Math.round(totalCalories);

    const session = await prisma.workoutSession.create({
      data: {
        userId: targetUser,
        date: targetDate,
        dayId,
        totalCalories,
        exerciseLogs: { create: exerciseLogs },
      },
      include: { day: true, exerciseLogs: { include: { exercise: true } } },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Workout session POST error:", error);
    return NextResponse.json({ error: "记录训练失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.workoutSession.delete({ where: { id } });
    } else {
      const userId = searchParams.get("userId") || "default";
      const dateStr = searchParams.get("date");
      if (dateStr) {
        const start = new Date(dateStr + "T00:00:00.000Z");
        const end = new Date(dateStr + "T23:59:59.999Z");
        await prisma.workoutSession.deleteMany({
          where: { userId, date: { gte: start, lte: end } },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Workout sessions DELETE error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
