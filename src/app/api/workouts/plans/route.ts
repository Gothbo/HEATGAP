import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plan = await prisma.workoutPlan.findFirst({
      where: { isBuiltIn: true },
      include: {
        days: {
          orderBy: { sortOrder: "asc" },
          include: {
            exercises: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "No workout plan found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Workout plans API error:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
