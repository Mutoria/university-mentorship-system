import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "MENTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openings = await prisma.opportunity.findMany({
    where: { posterId: session.user.id, type: "MENTORSHIP" },
    include: { applications: { select: { status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(openings);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "MENTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const deadline = new Date(`${String(body?.deadline ?? "")}T23:59:59`);
  const rawSkills: unknown[] = Array.isArray(body?.requiredSkills)
    ? body.requiredSkills
    : String(body?.requiredSkills ?? "").split(",");
  const requiredSkills = rawSkills
    .map((s) => String(s).trim().slice(0, 50))
    .filter(Boolean)
    .slice(0, 20);

  if (title.length < 3 || title.length > 120) {
    return NextResponse.json({ error: "Title must be 3 to 120 characters" }, { status: 400 });
  }
  if (description.length < 10 || description.length > 3000) {
    return NextResponse.json({ error: "Describe the opening in 10 to 3000 characters" }, { status: 400 });
  }
  if (requiredSkills.length === 0) {
    return NextResponse.json({ error: "Add at least one skill or interest" }, { status: 400 });
  }
  if (isNaN(deadline.getTime()) || deadline.getTime() < Date.now()) {
    return NextResponse.json({ error: "Choose a deadline in the future" }, { status: 400 });
  }

  const opening = await prisma.opportunity.create({
    data: {
      type: "MENTORSHIP",
      posterId: session.user.id,
      title,
      description,
      requiredSkills,
      deadline,
    },
  });

  return NextResponse.json(opening);
}
