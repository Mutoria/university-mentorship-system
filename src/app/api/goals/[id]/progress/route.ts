import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const goal = await prisma.goal.findFirst({
    where: { id, student: { userId: session.user.id } },
  });
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const { note, percentage } = await request.json();
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));

  const progress = await prisma.goalProgress.create({
    data: { goalId: id, note: String(note ?? ""), percentage: pct },
  });

  if (pct >= 100) {
    await prisma.goal.update({ where: { id }, data: { completed: true } });
  }

  return NextResponse.json(progress);
}
