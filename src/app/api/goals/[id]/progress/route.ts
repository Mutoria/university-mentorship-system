import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { note, percentage } = await request.json();

  const progress = await prisma.goalProgress.create({
    data: {
      goalId: id,
      note: note ?? "",
      percentage: Math.min(100, Math.max(0, Number(percentage))),
    },
  });

  if (Number(percentage) >= 100) {
    await prisma.goal.update({ where: { id }, data: { completed: true } });
  }

  return NextResponse.json(progress);
}
