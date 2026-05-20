import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const foods = await prisma.food.findMany({
    where: q
      ? { name: { contains: q } }
      : {},
    orderBy: { category: "asc" },
    take: 100,
  });

  return NextResponse.json(foods);
}
